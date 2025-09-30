/**
 * @file ResetPasswordService.js
 * @description
 * Password Reset Service
 *
 * Handles password reset token generation, verification, deletion,
 * and sending password reset emails via Brevo.
 * Uses an abstracted repository for database operations (passwordResetRepository),
 * allowing implementation-agnostic storage (e.g., Mongoose, MySQL).
 *
 * Dependencies:
 *  - crypto
 *  - bcrypt
 *  - Brevo transactional email service (sendResetEmail)
 *
 * Environment Variables:
 *  - FRONTEND_URL: URL of the frontend application to generate reset links
 */

const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { sendResetEmail } = require("../config/brevo");

/**
 * Password Reset Service
 * @class ResetPasswordService
 */
class ResetPasswordService {
  /**
   * Initializes ResetPasswordService with a password reset repository.
   * @param {Object} passwordResetRepository - Repository abstraction for password reset token operations.
   */
  constructor(passwordResetRepository) {
    this.passwordResetRepository = passwordResetRepository;
  }

  /**
   * Generate a new password reset token, store it, and send the reset email.
   * @param {string} userId - User ID.
   * @param {string} userEmail - User email.
   * @param {string} userName - User full name.
   * @returns {Promise<Object>} Result object containing:
   *  - success {boolean} Whether the token was successfully created and email sent
   *  - token {string} Plain token (if success)
   *  - error {string} Error message (if failure)
   */
  async createPasswordResetToken(userId, userEmail, userName) {
    // Generates a cryptographically secure random token
    const token = crypto.randomBytes(32).toString("hex");

    // Hash the token with bcrypt for secure storage
    const saltRounds = 10;
    const hashedToken = await bcrypt.hash(token, saltRounds);

    // Store both the plain token (for lookup) and hashed token (for security)
    const result = await this.passwordResetRepository.createPasswordResetToken(
      userId,
      token,
      hashedToken
    );

    if (result.success) {
      // Generate the password reset link
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      const resetLink = `${frontendUrl}/reset-password/${token}`;

      console.log("Reset link generated:", resetLink);

      // Send the reset email
      try {
        await sendResetEmail(userEmail, userName, resetLink);
        console.log(`Reset email sent to: ${userEmail}`);
      } catch (error) {
        console.error("Error sending reset email:", error);
        // Continue even if email fails
      }

      return { success: true, token: token };
    } else {
      return { success: false, error: result.error };
    }
  }

  /**
   * Retrieve and validate a password reset token.
   * @param {string} token - Plain reset token.
   * @returns {Promise<Object>} Result object containing:
   *  - success {boolean} Whether the token is valid
   *  - token {Object} Token object from repository (if valid)
   *  - error {string} Error message (if invalid or not found)
   */
  async getPasswordResetToken(token) {
    const result = await this.passwordResetRepository.getPasswordResetToken(
      token
    );

    if (result.success && result.token) {
      // Verify that the hashed token matches the provided token
      const isValid = await bcrypt.compare(token, result.token.hashedToken);
      if (isValid) {
        return { success: true, token: result.token };
      } else {
        return { success: false, error: "Invalid token" };
      }
    } else {
      return { success: false, error: "Token not found" };
    }
  }

  /**
   * Delete a specific password reset token.
   * @param {string} token - Plain reset token.
   * @returns {Promise<Object>} Result of deletion operation or error if token not found.
   */
  async deletePasswordResetToken(token) {
    const result = await this.getPasswordResetToken(token);

    if (result.success && result.token) {
      return await this.passwordResetRepository.deletePasswordResetTokenById(
        result.token._id
      );
    } else {
      return { success: false, error: "Token not found" };
    }
  }

  /**
   * Delete all password reset tokens associated with a user.
   * @param {string} userId - User ID.
   * @returns {Promise<Object>} Result of deletion operation.
   */
  async deletePasswordResetTokensByUserId(userId) {
    return await this.passwordResetRepository.deletePasswordResetTokensByUserId(
      userId
    );
  }
}

module.exports = ResetPasswordService;
