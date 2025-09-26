const AuthService = require("../services/authService");
const UserServiceFactory = require("../factories/userServiceFactory");
const admin = require("firebase-admin");

// Créer une instance du service d'authentification
const userService = UserServiceFactory.createUserService(
  process.env.DATABASE_TYPE || "mongoose"
);
const authService = new AuthService(userService.userRepository);

/**
 * Récupère le token depuis le header Authorization
 */
const extractToken = (req) => {
  const authHeader = req.headers["authorization"];
  return authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
};

/**
 * Middleware pour vérifier l'authentification via JWT
 */
const authenticateToken = async (req, res, next) => {
  console.log("authenticateToken", req.headers);
  console.log("Session data:", req.session);
  try {
    const token = extractToken(req);

    if (!token && !req.session?.user) {
      return res.status(401).json({ success: false, error: "Token requis" });
    }

    // Priorité au JWT si présent
    let user;
    if (token) {
      const tokenResult = authService.verifyToken(token);
      if (!tokenResult.success) {
        return res
          .status(403)
          .json({ success: false, error: tokenResult.error });
      }
      user = tokenResult.user;
    } else if (req.session.user) {
      user = req.session.user;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Erreur authenticateToken:", error);
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
};

/**
 * Middleware optionnel : ne bloque pas si pas authentifié
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (token) {
      const tokenResult = authService.verifyToken(token);
      if (tokenResult.success) req.user = tokenResult.user;
    } else if (req.session?.user) {
      req.user = req.session.user;
    }
    next();
  } catch (error) {
    console.error("Erreur optionalAuth:", error);
    next();
  }
};

/**
 * Middleware pour vérifier les rôles
 * @param {Array<string>} roles - ex : ["admin", "moderator"]
 */
const requireRole = (roles) => (req, res, next) => {
  if (!req.user) {
    return res
      .status(401)
      .json({ success: false, error: "Authentification requise" });
  }
  const userRole = req.user.role || "user";
  if (!roles.includes(userRole)) {
    return res
      .status(403)
      .json({ success: false, error: "Permissions insuffisantes" });
  }
  next();
};

/**
 * Vérifie un token Firebase si besoin
 */
const checkAuthFirebase = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token)
      return res.status(401).json({ status: "error", message: "Unauthorized" });

    const firebaseUser = await admin.auth().verifyIdToken(token);
    const userDoc = await admin
      .firestore()
      .collection("users")
      .doc(firebaseUser.uid)
      .get();

    req.user = userDoc.data();
    next();
  } catch (error) {
    console.error("Erreur checkAuthFirebase:", error);
    res
      .status(401)
      .json({ status: "error", message: "Invalid or Expired Token" });
  }
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireRole,
  checkAuthFirebase,
};
