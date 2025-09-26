/**
 * Interface/Abstraction pour le repository utilisateur
 * Définit les méthodes que toutes les implémentations doivent avoir
 */
class IUserRepository {
  async getUsers() {
    throw new Error("Method getUsers must be implemented");
  }

  async getUserById(id) {
    throw new Error("Method getUserById must be implemented");
  }

  async findOrCreateUser(userData) {
    throw new Error("Method findOrCreateUser must be implemented");
  }

  async updateUser(email, updateData) {
    throw new Error("Method updateUser must be implemented");
  }

  async updateUserById(userId, updateData) {
    throw new Error("Method updateUserById must be implemented");
  }

  async getUserByEmail(email) {
    throw new Error("Method getUserByEmail must be implemented");
  }

  async findUserById(id) {
    throw new Error("Method findUserById must be implemented");
  }

  async deleteUser(email) {
    throw new Error("Method deleteUser must be implemented");
  }

  async updateUserPassword(userId, hashedPassword) {
    throw new Error("Method updateUserPassword must be implemented");
  }
}

module.exports = IUserRepository;
