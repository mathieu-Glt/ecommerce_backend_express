const UserServiceFactory = require("../factories/userServiceFactory");
const ResetPasswordServiceFactory = require("../factories/passwordServiceFactory");
const { asyncHandler } = require("../utils/errorHandler");

// ✅ Créer le service avec l'implémentation appropriée
const userService = UserServiceFactory.createUserService(
  process.env.DATABASE_TYPE || "mongoose"
);

const passwordResetService =
  ResetPasswordServiceFactory.createResetPasswordService(
    process.env.DATABASE_TYPE || "mongoose"
  );

// Contrôleur pour récupérer les informations utilisateur
exports.userController = asyncHandler(async (req, res) => {
  const { name, email, picture } = req.user;
  const result = await userService.updateUser(email, { name, picture });

  if (result.success) {
    res.json({ status: "success", message: "Hello Dear Users" });
  } else {
    res.status(400).json({ status: "error", message: result.error });
  }
});

// Contrôleur pour créer ou mettre à jour un utilisateur (avec auth)
exports.createOrUpdateUser = asyncHandler(async (req, res) => {
  console.log("req.user in createOrUpdateUser :: ", req.user);

  const result = await userService.findOrCreateUser(req.user);

  if (result.success) {
    console.log("User in createOrUpdateUser :: ", result.user);
    res.json({ status: "success", message: "User Registered Successfully" });
  } else {
    res.status(400).json({ status: "error", message: result.error });
  }
});

exports.currentUser = asyncHandler(async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Utilisateur non authentifié" });
    }

    // Ici tu peux aller chercher l'utilisateur complet depuis la DB si besoin
    const user = await userService.getUserById(req.user._id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Utilisateur introuvable" });
    }

    res.json({
      success: true,
      user,
    });
  } catch (err) {
    console.error("Erreur currentUser:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Contrôleur pour enregistrer ou mettre à jour un utilisateur (sans auth)
exports.registerOrUpdateUser = asyncHandler(async (req, res) => {
  const result = await userService.findOrCreateUser(req.body);

  if (result.success) {
    console.log("User in registerOrUpdateUser :: ", result.user);
    res.json({ status: "success", message: "User Registered Successfully" });
  } else {
    res.status(400).json({ status: "error", message: result.error });
  }
});

// ✅ Nouveaux contrôleurs utilisant les nouvelles méthodes du service
exports.getUserProfile = asyncHandler(async (req, res) => {
  const { email } = req.params;
  const result = await userService.getUserProfile(email);

  if (result.success) {
    res.json({ status: "success", profile: result.profile });
  } else {
    res.status(404).json({ status: "error", message: "User not found" });
  }
});

exports.updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  console.log("🔍 Mise à jour utilisateur avec ID:", id);
  console.log("📝 Données à mettre à jour:", updateData);

  // Utiliser la méthode updateUser du service avec l'ID
  const result = await userService.updateUserById(id, updateData);

  if (result.success) {
    res.json({
      status: "success",
      message: "User updated successfully",
      user: result.user,
    });
  } else {
    res.status(400).json({ status: "error", message: result.error });
  }
});

exports.updateUserProfile = asyncHandler(async (req, res) => {
  const { email } = req.params;
  const profileData = req.body;

  const result = await userService.updateUserProfile(email, profileData);

  if (result.success) {
    res.json({ status: "success", message: "Profile updated successfully" });
  } else {
    res.status(400).json({ status: "error", message: result.error });
  }
});

exports.deleteUser = asyncHandler(async (req, res) => {
  const { email } = req.params;
  const result = await userService.deleteUser(email);

  if (result.success) {
    res.json({ status: "success", message: "User deleted successfully" });
  } else {
    res.status(400).json({ status: "error", message: result.error });
  }
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { email, phone } = req.body;
  console.log("email in resetPassword :: ", email);
  console.log("phone in resetPassword :: ", phone);

  // ✅ Vérifier si l'email existe
  const user = await userService.getUserProfile(email);
  console.log("user result in resetPassword :: ", user);

  if (!user.success) {
    console.error("User not found for email:", email);
    return res.status(404).json({ status: "error", message: "User not found" });
  }

  // ✅ Vérifier que l'ID de l'utilisateur existe
  let userId;
  if (user.profile && user.profile._doc && user.profile._doc._id) {
    // Si c'est un objet Mongoose avec _doc
    userId = user.profile._doc._id;
  } else if (user.profile && user.profile._id) {
    // Si c'est un objet simple
    userId = user.profile._id;
  } else {
    console.error("User ID not found in profile:", user.profile);
    return res.status(400).json({
      status: "error",
      message: "User ID not found",
    });
  }

  const userEmail = user.profile._doc
    ? user.profile._doc.email
    : user.profile.email;
  const userName =
    (user.profile._doc ? user.profile._doc.firstname : user.profile.firstname) +
    " " +
    (user.profile._doc ? user.profile._doc.lastname : user.profile.lastname);

  console.log("User found:", {
    id: userId,
    email: userEmail,
    name: userName,
  });

  console.log("User ID for token creation:", userId);

  // Supprimer anciens tokens
  await passwordResetService.deletePasswordResetTokensByUserId(userId);

  // ✅ Générer un token de réinitialisation via le service
  const result = await passwordResetService.createPasswordResetToken(
    userId,
    userEmail,
    userName
  );

  if (result.success) {
    // ✅ Temporairement, afficher le lien dans la réponse pour test
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetLink = `${frontendUrl}/reset-password/${result.token}`;

    res.json({
      status: "success",
      message: "Password reset successfully",
      resetLink: resetLink, // Temporaire pour test
      note: "Vérifiez votre email ou utilisez ce lien directement",
    });
  } else {
    res.status(400).json({ status: "error", message: result.error });
  }
});

exports.resetPasswordToken = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  console.log("token in resetPasswordToken :: ", token);
  console.log("password in resetPasswordToken :: ", password);

  // ✅ Validation du mot de passe
  if (!password || password.length < 6) {
    return res.status(400).json({
      status: "error",
      message: "Le mot de passe doit contenir au moins 6 caractères",
    });
  }

  // ✅ Vérifier si le token existe et est valide
  const tokenResult = await passwordResetService.getPasswordResetToken(token);

  if (!tokenResult.success) {
    return res.status(400).json({
      status: "error",
      message: "Token invalide ou expiré",
    });
  }

  // ✅ Récupérer l'utilisateur associé au token
  const userId = tokenResult.token.userId;
  const userResult = await userService.getUserById(userId);

  if (!userResult.success) {
    return res.status(404).json({
      status: "error",
      message: "Utilisateur non trouvé",
    });
  }

  // ✅ Mettre à jour le mot de passe de l'utilisateur
  const updateResult = await userService.updateUserPassword(userId, password);

  if (!updateResult.success) {
    return res.status(400).json({
      status: "error",
      message: updateResult.error,
    });
  }

  // ✅ Supprimer le token utilisé
  await passwordResetService.deletePasswordResetToken(token);

  // ✅ Supprimer tous les autres tokens de cet utilisateur
  await passwordResetService.deletePasswordResetTokensByUserId(userId);

  res.json({
    status: "success",
    message: "Mot de passe mis à jour avec succès",
  });
});

exports.getUsers = asyncHandler(async (req, res) => {
  const users = await userService.getUsers();
  console.log("users in getUsers :: ", users);
  if (!users) {
    return res.status(404).json({ message: "No users found" });
  }
  res.status(200).json(users);
});

exports.getUserByEmail = asyncHandler(async (req, res) => {
  const { email } = req.params;
  const user = await userService.getUserByEmail(email);
  console.log("user in getUserByEmail :: ", user);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.status(200).json(user);
});

exports.getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await userService.getUserById(id);
  console.log("user in getUserById :: ", user);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.status(200).json(user);
});
