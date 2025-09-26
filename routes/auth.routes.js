const express = require("express");
const router = express.Router();
const passport = require("../config/passport");
const {
  userController,
  createOrUpdateUser,
  registerOrUpdateUser,
  getUserProfile,
  updateUserProfile,
  deleteUser,
  currentUser,
  resetPassword,
  resetPasswordToken,
} = require("../controllers/user.controllers");
const {
  login,
  register,
  verifyToken,
  logout,
  generateToken,
  generateRefreshToken,
} = require("../controllers/auth.controllers");

// Middlewares
const { authenticateToken } = require("../middleware/auth");

// Validateurs
const {
  loginValidation,
  registerValidation,
  resetPasswordValidation,
  resetPasswordTokenValidation,
  createOrUpdateUserValidation,
  updateUserProfileValidation,
  getUserProfileValidation,
  deleteUserValidation,
} = require("../validators");
const { emitToSession } = require("../config/socket");
const myMiddleware = (req, res, next) => {
  console.log("My Middleware is running");
  next();
};

// Routes Google authentication
router.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:3000/login",
  }),
  (req, res) => {
    console.log("google/callback req.user :", req.user);
    const token = generateToken(req.user);
    console.log("Token généré :", token);
    const refreshToken = generateRefreshToken(req.user);
    console.log("Refresh Token généré :", refreshToken);

    // Stocker les tokens dans la session
    req.session.refreshToken = refreshToken;
    req.session.token = token;
    req.session.user = req.user;

    req.session.save((err) => {
      if (err) {
        console.error("Erreur session.save:", err);
      } else {
        console.log("Session sauvegardée:", req.session);

        // Émettre l'événement Socket.IO après la sauvegarde
        try {
          emitToSession(req.session.id, "user:connected", {
            user: req.user,
            token: token,
            refreshToken: refreshToken,
          });
          console.log("✅ Événement Socket.IO émis avec succès");
        } catch (error) {
          console.error("❌ Erreur lors de l'émission Socket.IO:", error);
        }
      }

      // Redirection
      res.redirect(
        `http://localhost:3000/?token=${token}&refreshToken=${refreshToken}`
      );
    });
  }
);
router.get("/user", authenticateToken, getUserProfile);

// Routes d'authentification MongoDB
router.post("/login", loginValidation, login);
router.post("/register", registerValidation, register);
router.get("/verify", authenticateToken, verifyToken);
router.post("/logout", logout);

// ----------------------
// Azure AD routes
// ----------------------
router.get(
  "/azure",
  passport.authenticate("azure_ad_oauth2", {
    failureRedirect: "http://localhost:3000/login",
    scope: [
      "openid",
      "profile",
      "email",
      "https://graph.microsoft.com/User.Read",
    ],
    prompt: "consent",
  }),
  function (req, res) {
    console.log("Azure login initiated");
  }
);

router.get(
  "/azure/callback",
  passport.authenticate("azure_ad_oauth2", {
    failureRedirect: "http://localhost:3000/login?error=auth_failed",
    session: true,
  }),
  async (req, res) => {
    try {
      console.log("🔐 azure/callback - Début du traitement");
      console.log("👤 req.user:", req.user);

      if (!req.user) {
        console.error("❌ Aucun utilisateur après auth Azure");
        return res.redirect("http://localhost:3000/login?error=auth_failed");
      }

      // Génération tokens
      console.log("🔑 Génération tokens...");
      const token = generateToken(req.user);
      const refreshToken = generateRefreshToken(req.user);

      // Sauvegarde en session
      console.log("💾 Sauvegarde session...");
      req.session.refreshToken = refreshToken;
      req.session.token = token;
      req.session.user = req.user;

      console.log("🔍 Session avant save:", {
        id: req.session.id,
        hasUser: !!req.session.user,
        hasToken: !!req.session.token,
      });

      // Attendre la sauvegarde
      await new Promise((resolve, reject) => {
        req.session.save((err) => {
          if (err) {
            console.error("❌ Erreur session.save:", err);
            reject(err);
          } else {
            console.log("✅ Session sauvegardée ID:", req.session.id);
            resolve();
          }
        });
      });

      req.session.pendingSocketNotification = {
        type: "auth:success",
        data: {
          user: req.user,
          token: token,
          refreshToken: refreshToken,
          timestamp: Date.now(),
        },
      };

      console.log("📋 Notification socket stockée");

      // Redirection
      const redirectUrl = new URL("http://localhost:3000/");
      redirectUrl.searchParams.set("token", token);
      redirectUrl.searchParams.set("refreshToken", refreshToken);
      redirectUrl.searchParams.set("auth", "success");

      console.log("🔄 Redirection vers:", redirectUrl.toString());
      res.redirect(redirectUrl.toString());
    } catch (err) {
      console.error("❌ Erreur auth callback:", err);
      res.redirect("http://localhost:3000/login?error=callback_error");
    }
  }
);
router.get("/", userController);
router.post(
  "/create-or-update-user",
  authenticateToken,
  //createOrUpdateUserValidation,
  createOrUpdateUser
);
router.post("/register-user", registerValidation, registerOrUpdateUser);
router.get("/current-user", authenticateToken, currentUser);
router.post("/reset-password", resetPasswordValidation, resetPassword);
router.post(
  "/reset-password/:token",
  resetPasswordTokenValidation,
  resetPasswordToken
);

// ✅ Nouvelles routes utilisant les nouvelles méthodes
router.get("/profile/:email", getUserProfileValidation, getUserProfile);
router.put(
  "/profile/:email",
  authenticateToken,
  updateUserProfileValidation,
  updateUserProfile
);
router.delete("/:email", authenticateToken, deleteUserValidation, deleteUser);

router.get("/testing", myMiddleware, (req, res) => {
  res.json({ status: "success", message: "Testing Route" });
});

router.get("/me", authenticateToken, (req, res) => {
  if (!req.user) {
    return res
      .status(401)
      .json({ success: false, message: "Utilisateur non trouvé" });
  }

  res.json({
    success: true,
    user: req.user,
    token: req.session?.token || null, // si session
    refreshToken: req.session?.refreshToken || null, // si session
  });
});

module.exports = router;
