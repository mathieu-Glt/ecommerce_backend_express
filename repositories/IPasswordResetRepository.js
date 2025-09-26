/**
 * Interface/Abstraction pour le repository utilisateur
 * Définit les méthodes que toutes les implémentations doivent avoir
 */
class IPasswordResetRepository {
  async createPasswordResetToken(userId, token, hashedToken) {
    throw new Error("Method createPasswordResetToken must be implemented");
  }

  async getPasswordResetToken(token) {
    throw new Error("Method getPasswordResetToken must be implemented");
  }

  async deletePasswordResetToken(token) {
    throw new Error("Method deletePasswordResetToken must be implemented");
  }

  async deletePasswordResetTokenById(tokenId) {
    throw new Error("Method deletePasswordResetTokenById must be implemented");
  }

  async deletePasswordResetTokensByUserId(userId) {
    throw new Error(
      "Method deletePasswordResetTokensByUserId must be implemented"
    );
  }
}

module.exports = IPasswordResetRepository;
