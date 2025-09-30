const IPasswordResetRepository = require("./IPasswordResetRepository");

/**
 * Mongoose-based implementation of the Password Reset Repository.
 *
 * This class handles all password reset token operations using
 * a Mongoose model. It extends the IPasswordResetRepository abstraction
 * to ensure the service layer does not depend on the database implementation.
 */
class MongooseResetPasswordRepository extends IPasswordResetRepository {
  /**
   * @param {mongoose.Model} PasswordResetTokenModel - Mongoose Password Reset Token model
   */
  constructor(PasswordResetTokenModel) {
    super();
    this.PasswordResetToken = PasswordResetTokenModel;
  }

  /**
   * Create a new password reset token for a user.
   * @param {string} userId - ID of the user requesting password reset
   * @param {string} token - Plain token string
   * @param {string} hashedToken - Hashed version of the token
   * @returns {Promise<Object>} Success status and created token document
   */
  async createPasswordResetToken(userId, token, hashedToken) {
    const passwordResetToken = new this.PasswordResetToken({
      userId,
      token,
      hashedToken,
    });
    await passwordResetToken.save();
    return { success: true, token: passwordResetToken };
  }

  /**
   * Retrieve a password reset token document by the plain token string.
   * @param {string} token - Token string to search for
   * @returns {Promise<Object>} Success status and token document
   */
  async getPasswordResetToken(token) {
    const passwordResetToken = await this.PasswordResetToken.findOne({ token });
    return { success: true, token: passwordResetToken };
  }

  /**
   * Delete a password reset token by its plain token string.
   * @param {string} token - Token string to delete
   * @returns {Promise<Object>} Success status
   */
  async deletePasswordResetToken(token) {
    await this.PasswordResetToken.deleteOne({ token });
    return { success: true };
  }

  /**
   * Delete a password reset token by its unique ID.
   * @param {string} tokenId - ID of the token document
   * @returns {Promise<Object>} Success status
   */
  async deletePasswordResetTokenById(tokenId) {
    await this.PasswordResetToken.findByIdAndDelete(tokenId);
    return { success: true };
  }

  /**
   * Delete all password reset tokens associated with a specific user.
   * @param {string} userId - ID of the user
   * @returns {Promise<Object>} Success status
   */
  async deletePasswordResetTokensByUserId(userId) {
    await this.PasswordResetToken.deleteMany({ userId });
    return { success: true };
  }
}

module.exports = MongooseResetPasswordRepository;
