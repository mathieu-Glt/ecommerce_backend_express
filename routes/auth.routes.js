const express = require("express");
const router = express.Router();
const passport = require("../config/passport");
const {
  createOrUpdateUser,
  registerOrUpdateUser,
  updateUserProfile,
  deleteUser,
  currentUser,
  resetPassword,
  resetPasswordToken,
} = require("../controllers/user.controllers");
const {
  login,
  register,
  getUserProfile,
  verifyToken,
  logout,
  handleOAuthCallback,
} = require("../controllers/auth.controllers");

// Middlewares
const { authenticateToken } = require("../middleware/auth");

// Validators
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

/**
 * Auth Routes
 *
 * Handles authentication and user session management.
 * Includes Google OAuth, Azure AD OAuth, local login/register,
 * password reset, and user profile routes.
 *
 * @module routes/authRoutes
 */

/**
 * @route GET /auth/google
 * @desc Initiate Google OAuth login
 * @access Public
 */
router.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] }),
  (req, res) => {
    console.log("Google login initiated");
  }
);

/**
 * @route GET /auth/google/callback
 * @desc Google OAuth callback to handle authentication result
 * @access Public
 * @returns Redirects to frontend with token and refreshToken
 */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:3000/login",
  }),
  handleOAuthCallback
);

/**
 * @route GET /auth/user
 * @desc Retrieve authenticated user's profile
 * @access Protected (JWT required)
 */
router.get("/user", authenticateToken, getUserProfile);

/**
 * @route POST /auth/login
 * @desc Local login with email and password
 * @access Public
 * @returns 200 - Token and user info on success
 * @returns 400 - Validation error or invalid credentials
 */
router.post("/login", loginValidation, login);

/**
 * @route POST /auth/register
 * @desc Local registration with email and password
 * @access Public
 * @returns 200 - User created successfully
 * @returns 400 - Validation error
 */
router.post("/register", registerValidation, register);

/**
 * @route GET /auth/verify
 * @desc Verify JWT token
 * @access Protected
 */
router.get("/verify", authenticateToken, verifyToken);

/**
 * @route POST /auth/logout
 * @desc Logout the user and clear session
 * @access Protected
 */
router.post("/logout", logout);

// ----------------------
// Azure AD OAuth Routes
// ----------------------

/**
 * @route GET /auth/azure
 * @desc Initiate Azure AD OAuth login
 * @access Public
 */
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
  (req, res) => {
    console.log("Azure login initiated");
  }
);

/**
 * @route GET /auth/azure/callback
 * @desc Azure AD OAuth callback to handle authentication result
 * @access Public
 * @returns Redirects to frontend with token and refreshToken
 */
router.get(
  "/azure/callback",
  passport.authenticate("azure_ad_oauth2", {
    failureRedirect: "http://localhost:3000/login?error=auth_failed",
    session: true,
  }),
  handleOAuthCallback
);

/**
 * @route POST /auth/create-or-update-user
 * @desc Create or update a user profile
 * @access Protected (JWT required)
 * @returns 200 - User created or updated successfully
 */
// router.post(
//   "/create-or-update-user",
//   authenticateToken,
//   createOrUpdateUserValidation,
//   createOrUpdateUser
// );

/**
 * @route POST /auth/register-user
 * @desc Register a new user (public route)
 * @access Public
 */
// router.post("/register-user", registerValidation, registerOrUpdateUser);

/**
 * @route GET /auth/current-user
 * @desc Get currently authenticated user info
 * @access Protected
 */
router.get("/current-user", authenticateToken, currentUser);

/**
 * @route POST /auth/reset-password
 * @desc Request password reset
 * @access Public
 */
router.post("/reset-password", resetPasswordValidation, resetPassword);

/**
 * @route POST /auth/reset-password/:token
 * @desc Reset password using token
 * @access Public
 */
router.post(
  "/reset-password/:token",
  resetPasswordTokenValidation,
  resetPasswordToken
);

/**
 * @route GET /auth/profile/:email
 * @desc Get user profile by email
 * @access Protected
 */
router.get("/profile/:email", getUserProfileValidation, getUserProfile);

/**
 * @route PUT /auth/profile/:email
 * @desc Update user profile by email
 * @access Protected
 */
router.put(
  "/profile/:email",
  authenticateToken,
  updateUserProfileValidation,
  updateUserProfile
);

/**
 * @route DELETE /auth/:email
 * @desc Delete user by email
 * @access Protected
 */
router.delete("/:email", authenticateToken, deleteUserValidation, deleteUser);

/**
 * @route GET /auth/me
 * @desc Get authenticated user info and session tokens
 * @access Protected
 */
router.get("/me", authenticateToken, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "User not found" });
  }

  res.json({
    success: true,
    user: req.user,
    token: req.session?.token || null,
    refreshToken: req.session?.refreshToken || null,
  });
});

module.exports = router;
