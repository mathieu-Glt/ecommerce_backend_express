const IPasswordResetRepository = require("./IPasswordResetRepository");

class MySQLResetPasswordRepository extends IPasswordResetRepository {
  constructor(connection) {
    super();
    this.connection = connection;
  }

  async createPasswordResetToken(userId, token, hashedToken) {
    try {
      const [result] = await this.connection.execute(
        "INSERT INTO password_reset_tokens (user_id, token, hashed_token, created_at) VALUES (?, ?, ?, NOW())",
        [userId, token, hashedToken]
      );
      return {
        success: true,
        token: {
          id: result.insertId,
          userId,
          token,
          hashedToken,
          createdAt: new Date(),
        },
      };
    } catch (error) {
      console.error("Error creating password reset token:", error);
      return { success: false, error: error.message };
    }
  }

  async getPasswordResetToken(token) {
    try {
      const [rows] = await this.connection.execute(
        "SELECT * FROM password_reset_tokens WHERE token = ? AND created_at > DATE_SUB(NOW(), INTERVAL 15 MINUTE)",
        [token]
      );
      return { success: true, token: rows[0] || null };
    } catch (error) {
      console.error("Error getting password reset token:", error);
      return { success: false, error: error.message };
    }
  }

  async deletePasswordResetToken(token) {
    try {
      await this.connection.execute(
        "DELETE FROM password_reset_tokens WHERE token = ?",
        [token]
      );
      return { success: true };
    } catch (error) {
      console.error("Error deleting password reset token:", error);
      return { success: false, error: error.message };
    }
  }

  async deletePasswordResetTokensByUserId(userId) {
    try {
      await this.connection.execute(
        "DELETE FROM password_reset_tokens WHERE user_id = ?",
        [userId]
      );
      return { success: true };
    } catch (error) {
      console.error("Error deleting password reset tokens by user ID:", error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = MySQLResetPasswordRepository;
