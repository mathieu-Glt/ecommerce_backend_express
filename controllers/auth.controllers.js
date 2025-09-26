const { asyncHandler } = require("../utils/errorHandler");
const AuthServiceFactory = require("../factories/authServiceFactory");
const { saveBase64Image, validateBase64Image } = require("../utils/imageUtils");
const jwt = require("jsonwebtoken");
const { getIO } = require("../config/socket");
// Créer le service avec l'implémentation appropriée
const authService = AuthServiceFactory.createAuthService(
  process.env.DATABASE_TYPE || "mongoose" // "mongoose" ou "mysql"
);

// controllers/user.controllers.js
exports.getCurrentUser = (req, res) => {
  try {
    // Récupérer l'utilisateur depuis Passport ou la session
    const user = req.user || req.session?.user;

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Utilisateur non trouvé",
      });
    }

    // Ne renvoyer que les champs nécessaires côté frontend
    const safeUser = {
      _id: user._id,
      googleId: user.googleId,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      picture: user.picture,
      role: user.role,
      cart: user.cart,
      address: user.address,
      isActive: user.isActive,
    };

    // Injecte dans la session pour Socket.IO
    req.session.user = user;
    req.session.token = req.token;
    req.session.refreshToken = req.refreshToken;
    req.session.save();

    return res.status(200).json({
      status: "success",
      user: safeUser,
    });
  } catch (err) {
    console.error("Erreur getCurrentUser :", err);
    return res.status(500).json({
      status: "error",
      message: "Une erreur est survenue",
    });
  }
};

// Générer un token JWT
exports.generateToken = (user) => {
  return jwt.sign({ id: user._id, ...user }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
};
// Générer un refresh token
exports.generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id, ...user }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
};

exports.getUserProfile = asyncHandler(async (req, res) => {
  if (req.user) {
    return res.json({
      success: true,
      user: req.user,
    });
  }
  res.json({
    success: false,
    error: "User not found",
  });
});
/**
 * Connexion utilisateur
 */
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validation des données
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: "Email and password required",
    });
  }

  // Authentifier l'utilisateur
  const result = await authService.authenticateUser(email, password);
  console.log("result", result.user);

  if (!result.success) {
    return res.status(401).json({
      success: false,
      error: result.error,
    });
  }

  // Émettre l'événement Socket.IO après la sauvegarde
  const io = getIO();
  io.to(req.session.id).emit("user:connected", {
    user: req.user,
    token: token,
    refreshToken: refreshToken,
  });

  // Retourner les données utilisateur et le token
  res.json({
    success: true,
    message: "Connection successful",
    user: result.user,
    token: result.token,
  });
});

/**
 * Inscription utilisateur
 */
exports.register = asyncHandler(async (req, res) => {
  const { email, password, firstname, lastname, picture, address } = req.body;

  console.log("📝 Données reçues pour l'inscription:", {
    email,
    firstname,
    lastname,
    hasPassword: !!password,
    hasPicture: !!picture,
    address: address || "Non fournie",
  });

  // Validation des données
  if (!email || !password || !firstname || !lastname || !picture) {
    return res.status(400).json({
      success: false,
      error: "Email, password, firstname, lastname and picture required",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      error: "Password must be at least 8 characters long",
    });
  }

  // Valider l'image
  const imageValidation = await validateBase64Image(picture, 5); // 5MB max
  if (!imageValidation.success) {
    return res.status(400).json({
      success: false,
      error: imageValidation.error,
    });
  }

  // Sauvegarder l'image
  const imageResult = await saveBase64Image(
    picture,
    "avatars",
    `${firstname}-${lastname}`
  );
  if (!imageResult.success) {
    return res.status(400).json({
      success: false,
      error: imageResult.error,
    });
  }

  // Créer l'utilisateur avec le chemin de l'image
  const result = await authService.createUser({
    email,
    password,
    firstname,
    lastname,
    address: address || "", // Ajouter l'adresse
    role: "user", // Rôle par défaut
    picture: imageResult.path, // Utiliser le chemin sauvegardé au lieu du Base64
  });

  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: result.error,
    });
  }

  // Retourner les données utilisateur et le token
  res.status(201).json({
    success: true,
    message: "User created successfully",
    user: result.user,
    token: result.token,
  });
});

/**
 * Vérifier le token (pour vérifier si l'utilisateur est connecté)
 */
exports.verifyToken = asyncHandler(async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Token required",
    });
  }

  const result = authService.verifyToken(token);

  if (!result.success) {
    return res.status(401).json({
      success: false,
      error: result.error,
    });
  }

  // Récupérer les données complètes de l'utilisateur
  const userResult = await authService.getUserById(result.user.userId);

  if (!userResult.success) {
    return res.status(404).json({
      success: false,
      error: "User not found",
    });
  }

  res.json({
    success: true,
    message: "Token valid",
    user: userResult.user,
  });
});

/**
 * Déconnexion (côté client, mais on peut ajouter une blacklist de tokens ici)
 */
exports.logout = asyncHandler(async (req, res) => {
  const sessionId = req.session?.id;

  req.session.destroy((err) => {
    if (err) {
      console.error("Erreur lors de la destruction de session :", err);
      return res
        .status(500)
        .json({ success: false, message: "Erreur de logout" });
    }

    res.clearCookie("connect.sid");

    // 🔔 Émet l'événement Socket.IO
    const io = getIO();
    io.to(sessionId).emit("user:logout");

    res.json({ success: true, message: "Logout successful" });
  });
});
