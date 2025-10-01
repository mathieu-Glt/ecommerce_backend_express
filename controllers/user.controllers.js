/**
 * User Controller
 *
 * Handles all user-related logic:
 * - User create and update
 * - User retrieval (by ID, email, profile)
 * - User deletion
 * - User listing
 *
 * @module controllers/user.controllers
 */

const UserServiceFactory = require("../factories/userServiceFactory");
const ResetPasswordServiceFactory = require("../factories/passwordServiceFactory");
const { asyncHandler } = require("../utils/errorHandler");

// Create the appropriate Service instance based on the received key.
const userService = UserServiceFactory.createUserService(
  process.env.DATABASE_TYPE || "mongoose"
);
// Create the appropriate Password Reset Service instance based on the received key
const passwordResetService =
  ResetPasswordServiceFactory.createResetPasswordService(
    process.env.DATABASE_TYPE || "mongoose"
  );

/**
 * Retrieve authenticated user's information and update their data.
 *
 * @route GET /user
 * @param {Object} req - Express request object (contains user from middleware).
 * @param {Object} res - Express response object.
 * @returns {JSON} 200 - Success message or error.
 * @returns {JSON} 400 - Error message if update fails.
 */
exports.userController = asyncHandler(async (req, res) => {
  const { name, email, picture } = req.user;
  const result = await userService.updateUser(email, { name, picture });

  if (result.success) {
    res.status(200).json({ status: "success", message: "Hello Dear Users" });
  } else {
    res.status(400).json({ status: "error", message: result.error });
  }
});

/**
 * Create or update a user (requires authentication).
 *
 * @route POST /user
 * @param {Object} req - Express request object (contains authenticated user).
 * @param {Object} res - Express response object.
 * @returns {JSON} 200 - Success or error message.
 * @returns {JSON} 400 - Error message if creation/update fails.
 */
exports.createOrUpdateUser = asyncHandler(async (req, res) => {
  const result = await userService.findOrCreateUser(req.user);

  if (result.success) {
    res
      .status(200)
      .json({ status: "success", message: "User Registered Successfully" });
  } else {
    res.status(400).json({ status: "error", message: result.error });
  }
});

/**
 * Retrieve the currently authenticated user.
 *
 * @route GET /user/current
 * @param {Object} req - Express request object (contains user).
 * @param {Object} res - Express response object.
 * @returns {JSON} 200 - User data or error message.
 * @returns {JSON} 401 - Unauthenticated user error.
 * @returns {JSON} 404 - User not found error.
 */
exports.currentUser = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthenticated user" });
  }

  const user = await userService.getUserById(req.user._id);

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  res.status(200).json({ success: true, user });
});

/**
 * Register or update a user (without authentication).
 *
 * @route POST /user/register
 * @param {Object} req - Express request object (contains user data in body).
 * @param {Object} res - Express response object.
 * @returns {JSON} 200 - Success or error message.
 * @returns {JSON} 400 - Error message if registration/update fails.
 */
exports.registerOrUpdateUser = asyncHandler(async (req, res) => {
  const result = await userService.findOrCreateUser(req.body);

  if (result.success) {
    res
      .status(200)
      .json({ status: "success", message: "User Registered Successfully" });
  } else {
    res.status(400).json({ status: "error", message: result.error });
  }
});

/**
 * Retrieve a user's profile by email.
 *
 * @route GET /user/profile/:email
 * @param {Object} req - Express request object (contains email param).
 * @param {Object} res - Express response object.
 * @returns {JSON} 200 - Profile data or error message.
 * @returns {JSON} 404 - User not found error.
 */
exports.getUserProfile = asyncHandler(async (req, res) => {
  const { email } = req.params;
  const result = await userService.getUserProfile(email);

  if (result.success) {
    res.json({ status: "success", profile: result.profile });
  } else {
    res.status(404).json({ status: "error", message: "User not found" });
  }
});

/**
 * Update a user by their ID.
 *
 * @route PUT /user/:id
 * @param {Object} req - Express request object (contains id param and update data in body).
 * @param {Object} res - Express response object.
 * @returns {JSON} 200 - Updated user or error message.
 * @returns {JSON} 400 - Error message if update fails.
 */
exports.updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const result = await userService.updateUserById(id, updateData);

  if (result.success) {
    res.status(200).json({
      status: "success",
      message: "User updated successfully",
      user: result.user,
    });
  } else {
    res.status(400).json({ status: "error", message: result.error });
  }
});

/**
 * Update a user's profile by email.
 *
 * @route PUT /user/profile/:email
 * @param {Object} req - Express request object (contains email param and profile data in body).
 * @param {Object} res - Express response object.
 * @returns {JSON} 200 - Success or error message.
 * @returns {JSON} 400 - Error message if update fails.
 */
exports.updateUserProfile = asyncHandler(async (req, res) => {
  const { email } = req.params;
  const profileData = req.body;
  const result = await userService.updateUserProfile(email, profileData);

  if (result.success) {
    res
      .status(200)
      .json({ status: "success", message: "Profile updated successfully" });
  } else {
    res.status(400).json({ status: "error", message: result.error });
  }
});

/**
 * Delete a user by email.
 *
 * @route DELETE /user/:email
 * @param {Object} req - Express request object (contains email param).
 * @param {Object} res - Express response object.
 * @returns {JSON} 200 - Success or error message.
 * @returns {JSON} 400 - Error message if deletion fails.
 */
exports.deleteUser = asyncHandler(async (req, res) => {
  const { email } = req.params;
  const result = await userService.deleteUser(email);

  if (result.success) {
    res
      .status(200)
      .json({ status: "success", message: "User deleted successfully" });
  } else {
    res.status(400).json({ status: "error", message: result.error });
  }
});

/**
 * Generate a password reset token and send it to the user.
 *
 * @route POST /user/reset-password
 * @param {Object} req - Express request object (contains email and phone in body).
 * @param {Object} res - Express response object.
 * @returns {JSON} 200 - Reset link or error message.
 * @returns {JSON} 404 - User not found error.
 * @returns {JSON} 400 - Error message if token creation fails.
 */
exports.resetPassword = asyncHandler(async (req, res) => {
  const { email } = req.body; // Expecting email in the request body destructuring object from req.body
  const user = await userService.getUserProfile(email);

  if (!user.success) {
    return res.status(404).json({ status: "error", message: "User not found" });
  }
  // A plain Mongoose document → in this case user.profile._id exists directly.
  // A raw Mongoose document with _doc → then we need to access user.profile._doc._id.
  let userId = user.profile._id || (user.profile._doc && user.profile._doc._id);
  const userEmail =
    user.profile.email || (user.profile._doc && user.profile._doc.email);
  const userName =
    (user.profile.firstname ||
      (user.profile._doc && user.profile._doc.firstname)) +
    " " +
    (user.profile.lastname ||
      (user.profile._doc && user.profile._doc.lastname));

  await passwordResetService.deletePasswordResetTokensByUserId(userId);

  const result = await passwordResetService.createPasswordResetToken(
    userId,
    userEmail,
    userName
  );

  if (result.success) {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetLink = `${frontendUrl}/reset-password/${result.token}`;

    res.status(200).json({
      status: "success",
      message: "Password reset successfully",
      resetLink,
    });
  } else {
    res.status(400).json({ status: "error", message: result.error });
  }
});

/**
 * Reset a password using a token.
 *
 * @route POST /user/reset-password/:token
 * @param {Object} req - Express request object (contains token param and new password in body).
 * @param {Object} res - Express response object.
 * @returns {JSON} 200 - Success or error message.
 * @returns {JSON} 400 - Error message if token is invalid or update fails.
 * @returns {JSON} 404 - User not found error.
 */
exports.resetPasswordToken = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 6) {
    return res.status(400).json({
      status: "error",
      message: "The password must contain at least 6 characters.",
    });
  }

  const tokenResult = await passwordResetService.getPasswordResetToken(token);
  if (!tokenResult.success) {
    return res.status(400).json({
      status: "error",
      message: "Invalid or expired token",
    });
  }

  const userId = tokenResult.token.userId;
  const userResult = await userService.getUserById(userId);

  if (!userResult.success) {
    return res.status(404).json({ status: "error", message: "User not found" });
  }

  const updateResult = await userService.updateUserPassword(userId, password);
  if (!updateResult.success) {
    return res
      .status(400)
      .json({ status: "error", message: updateResult.error });
  }

  await passwordResetService.deletePasswordResetToken(token);
  await passwordResetService.deletePasswordResetTokensByUserId(userId);

  res.status(200).json({
    status: "success",
    message: "Password has been reset successfully",
  });
});

/**
 * Retrieve all users.
 *
 * @route GET /users
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {JSON} 200 - List of users or error message.
 * @returns {JSON} 404 - No users found error.
 */
exports.getUsers = asyncHandler(async (req, res) => {
  const users = await userService.getUsers();
  if (!users) {
    return res.status(404).json({ message: "No users found" });
  }
  res.status(200).json(users);
});

/**
 * Retrieve a user by email.
 *
 * @route GET /user/email/:email
 * @param {Object} req - Express request object (contains email param).
 * @param {Object} res - Express response object.
 * @returns {JSON} 200 - User object or error message.
 * @returns {JSON} 404 - User not found error.
 */
exports.getUserByEmail = asyncHandler(async (req, res) => {
  const { email } = req.params;
  const user = await userService.getUserByEmail(email);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.status(200).json(user);
});

/**
 * Retrieve a user by ID.
 *
 * @route GET /user/:id
 * @param {Object} req - Express request object (contains id param).
 * @param {Object} res - Express response object.
 * @returns {JSON} 200 - User object or error message.
 * @returns {JSON} 404 - User not found error.
 */
exports.getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await userService.getUserById(id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.status(200).json(user);
});
