const UserServiceFactory = require("../factories/userServiceFactory");
const { asyncHandler } = require("../middlewares/errorHandler");

// ✅ Créer le service avec l'implémentation appropriée
const userService = UserServiceFactory.createUserService(
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
  const { email } = req.user;
  const result = await userService.getUserProfile(email);
  console.log("result in currentUser :: ", result);

  // ✅ Corriger l'accès au rôle depuis l'objet Mongoose
  let role;
  if (result.profile && result.profile._doc) {
    // Si c'est un objet Mongoose avec _doc
    role = result.profile._doc.role;
  } else if (result.profile && result.profile.role) {
    // Si c'est un objet simple
    role = result.profile.role;
  } else {
    // Fallback
    role = "user";
  }

  console.log("role in currentUser :: ", role);

  // Récupérer le token de l'utilisateur
  const token = req.headers.authorization;
  console.log("token in currentUser :: ", token);

  // ✅ Retourner les données avec le rôle correct
  res.json({
    status: "success",
    profile: result.profile,
    role: role,
    token: token,
  });
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
