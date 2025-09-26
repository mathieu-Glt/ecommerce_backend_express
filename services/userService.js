/**
 * Service utilisateur qui dépend de l'abstraction (IUserRepository)
 * Ne connaît pas les détails d'implémentation (Mongoose, MySQL, etc.)
 */
class UserService {
  constructor(userRepository) {
    // ✅ Dépend de l'abstraction, pas de l'implémentation
    this.userRepository = userRepository;
  }

  async getUsers() {
    return await this.userRepository.getUsers();
  }

  async getUserByEmail(email) {
    return await this.userRepository.getUserByEmail(email);
  }

  async findOrCreateUser(userData) {
    // ✅ Le service ne sait pas s'il utilise Mongoose ou MySQL
    return await this.userRepository.findOrCreateUser(userData);
  }

  async updateUser(email, updateData) {
    return await this.userRepository.updateUser(email, updateData);
  }

  async updateUserById(userId, updateData) {
    console.log("🔍 Service: Mise à jour utilisateur avec ID:", userId);
    console.log("📝 Service: Données à mettre à jour:", updateData);

    const result = await this.userRepository.updateUserById(userId, updateData);

    if (result.success) {
      console.log(`User updated successfully for ID: ${userId}`);
    }
    return result;
  }

  async getUserByEmail(email) {
    return await this.userRepository.getUserByEmail(email);
  }

  async findUserById(id) {
    return await this.userRepository.findUserById(id);
  }

  async deleteUser(email) {
    return await this.userRepository.deleteUser(email);
  }

  // Méthodes métier qui utilisent le repository
  async updateUserProfile(email, profileData) {
    const result = await this.userRepository.updateUser(email, profileData);
    if (result.success) {
      console.log(`Profile updated for user: ${email}`);
    }
    return result;
  }

  async getUserProfile(email) {
    const result = await this.userRepository.getUserByEmail(email);
    if (result.success && result.user) {
      // Retourner l'objet utilisateur complet (Mongoose gère l'exclusion du mot de passe)
      return { success: true, profile: result.user };
    }
    return result;
  }

  async getUserById(userId) {
    const result = await this.userRepository.findUserById(userId);
    if (result.success && result.user) {
      // Retourner l'objet utilisateur complet (Mongoose gère l'exclusion du mot de passe)
      return { success: true, profile: result.user };
    }
    return result;
  }

  async updateUserPassword(userId, newPassword) {
    try {
      // ✅ Hasher le nouveau mot de passe
      const bcrypt = require("bcrypt");
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // ✅ Mettre à jour le mot de passe dans la base de données
      const result = await this.userRepository.updateUserPassword(
        userId,
        hashedPassword
      );

      if (result.success) {
        console.log(`Password updated for user ID: ${userId}`);
        return {
          success: true,
          message: "Mot de passe mis à jour avec succès",
        };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Error updating password:", error);
      return {
        success: false,
        error: "Erreur lors de la mise à jour du mot de passe",
      };
    }
  }
}

module.exports = UserService;
