/**
 * Service utilisateur qui dépend de l'abstraction (IUserRepository)
 * Ne connaît pas les détails d'implémentation (Mongoose, MySQL, etc.)
 */
class UserService {
  constructor(userRepository) {
    // ✅ Dépend de l'abstraction, pas de l'implémentation
    this.userRepository = userRepository;
  }

  async findOrCreateUser(userData) {
    // ✅ Le service ne sait pas s'il utilise Mongoose ou MySQL
    return await this.userRepository.findOrCreateUser(userData);
  }

  async updateUser(email, updateData) {
    return await this.userRepository.updateUser(email, updateData);
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
      // Retourner seulement les données du profil (sans mot de passe)
      const { password, ...profile } = result.user;
      return { success: true, profile };
    }
    return result;
  }
}

module.exports = UserService;
