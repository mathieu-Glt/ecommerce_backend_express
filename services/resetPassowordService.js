const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { sendResetEmail } = require("../config/brevo");

/**
 * Service utilisateur qui dépend de l'abstraction (IUserRepository)
 * Ne connaît pas les détails d'implémentation (Mongoose, MySQL, etc.)
 */
class ResetPasswordService {
  constructor(passwordResetRepository) {
    // ✅ Dépend de l'abstraction, pas de l'implémentation
    this.passwordResetRepository = passwordResetRepository;
  }

  async createPasswordResetToken(userId, userEmail, userName) {
    // ✅ Générer un token aléatoire
    const token = crypto.randomBytes(32).toString("hex");

    // ✅ Hasher le token avec bcrypt
    const saltRounds = 10;
    const hashedToken = await bcrypt.hash(token, saltRounds);

    // ✅ Enregistrer le token non hashé (pour la recherche) et hashé (pour la sécurité)
    const result = await this.passwordResetRepository.createPasswordResetToken(
      userId,
      token, // Token non hashé pour la recherche
      hashedToken // Token hashé pour la sécurité
    );

    if (result.success) {
      // ✅ Créer le lien de réinitialisation
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      const resetLink = `${frontendUrl}/reset-password/${token}`;

      console.log("Reset link generated:", resetLink);

      // ✅ Envoyer l'email
      try {
        await sendResetEmail(userEmail, userName, resetLink);
        console.log(`Reset email sent to: ${userEmail}`);
      } catch (error) {
        console.error("Error sending reset email:", error);
        // On continue même si l'email échoue
      }

      // ✅ Retourner le token non hashé pour l'utilisateur
      return { success: true, token: token };
    } else {
      return { success: false, error: result.error };
    }
  }

  async getPasswordResetToken(token) {
    // ✅ Récupérer le token par sa valeur non hashée
    const result = await this.passwordResetRepository.getPasswordResetToken(
      token
    );

    if (result.success && result.token) {
      // ✅ Vérifier que le token hashé correspond
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

  async deletePasswordResetToken(token) {
    // ✅ Récupérer le token pour obtenir l'ID
    const result = await this.getPasswordResetToken(token);

    if (result.success && result.token) {
      // ✅ Supprimer par ID du token
      return await this.passwordResetRepository.deletePasswordResetTokenById(
        result.token._id
      );
    } else {
      return { success: false, error: "Token not found" };
    }
  }

  async deletePasswordResetTokensByUserId(userId) {
    return await this.passwordResetRepository.deletePasswordResetTokensByUserId(
      userId
    );
  }
}

module.exports = ResetPasswordService;
