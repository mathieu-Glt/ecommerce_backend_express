const IPasswordResetRepository = require("./IPasswordResetRepository");

class MongooseResetPasswordRepository extends IPasswordResetRepository {
  constructor(PasswordResetTokenModel) {
    super();
    this.PasswordResetToken = PasswordResetTokenModel;
  }

  async createPasswordResetToken(userId, token, hashedToken) {
    const passwordResetToken = new this.PasswordResetToken({
      userId,
      token,
      hashedToken,
    });
    await passwordResetToken.save();
    return { success: true, token: passwordResetToken };
  }

  async getPasswordResetToken(token) {
    const passwordResetToken = await this.PasswordResetToken.findOne({ token });
    return { success: true, token: passwordResetToken };
  }

  async deletePasswordResetToken(token) {
    await this.PasswordResetToken.deleteOne({ token });
    return { success: true };
  }

  async deletePasswordResetTokenById(tokenId) {
    await this.PasswordResetToken.findByIdAndDelete(tokenId);
    return { success: true };
  }

  async deletePasswordResetTokensByUserId(userId) {
    await this.PasswordResetToken.deleteMany({ userId });
    return { success: true };
  }
}

module.exports = MongooseResetPasswordRepository;
