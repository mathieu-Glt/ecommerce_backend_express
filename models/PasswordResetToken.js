const mongoose = require("mongoose");

/**
 * PasswordResetToken Schema
 *
 * Represents a token used to reset a user's password.
 * Tokens are associated with a user and automatically expire
 * after a short duration (15 minutes by default).
 *
 * @typedef {Object} PasswordResetToken
 * @property {ObjectId} userId - Reference to the User who requested the reset (required)
 * @property {string} token - Unique token string (required)
 * @property {string} hashedToken - Hashed version of the token for security (required)
 * @property {Date} createdAt - Timestamp when the token was created (auto-generated)
 * @property {Date} expiresAt - Token expiration handled by MongoDB TTL index (15 minutes)
 */
const passwordResetTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  hashedToken: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 900, // 900 seconds = 15 minutes (MongoDB automatically deletes expired documents)
  },
});

module.exports = mongoose.model("PasswordResetToken", passwordResetTokenSchema);
