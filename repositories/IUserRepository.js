/**
 * Interface/Abstraction for User Repository
 *
 * Defines the methods that all user repository implementations
 * (e.g., Mongoose, MySQL) must implement. Each method is expected
 * to perform a specific CRUD operation on user data.
 *
 * @interface IUserRepository
 */
class IUserRepository {
  /**
   * Retrieve all users.
   * @throws {Error} Must be implemented in subclass
   */
  async getUsers() {
    throw new Error("Method getUsers must be implemented");
  }

  /**
   * Retrieve a user by their unique ID.
   * @param {string|number} id - The ID of the user to retrieve
   * @throws {Error} Must be implemented in subclass
   */
  async getUserById(id) {
    throw new Error("Method getUserById must be implemented");
  }

  /**
   * Find a user by email (or other unique field) or create a new one if not found.
   * @param {Object} userData - Data to find or create the user
   * @throws {Error} Must be implemented in subclass
   */
  async findOrCreateUser(userData) {
    throw new Error("Method findOrCreateUser must be implemented");
  }

  /**
   * Update a user by their email address.
   * @param {string} email - Email of the user to update
   * @param {Object} updateData - Data fields to update
   * @throws {Error} Must be implemented in subclass
   */
  async updateUser(email, updateData) {
    throw new Error("Method updateUser must be implemented");
  }

  /**
   * Update a user by their unique ID.
   * @param {string|number} userId - ID of the user to update
   * @param {Object} updateData - Data fields to update
   * @throws {Error} Must be implemented in subclass
   */
  async updateUserById(userId, updateData) {
    throw new Error("Method updateUserById must be implemented");
  }

  /**
   * Retrieve a user by their email address.
   * @param {string} email - Email of the user to retrieve
   * @throws {Error} Must be implemented in subclass
   */
  async getUserByEmail(email) {
    throw new Error("Method getUserByEmail must be implemented");
  }

  /**
   * Find a user by their unique ID.
   * @param {string|number} id - ID of the user to find
   * @throws {Error} Must be implemented in subclass
   */
  async findUserById(id) {
    throw new Error("Method findUserById must be implemented");
  }

  /**
   * Delete a user by their email address.
   * @param {string} email - Email of the user to delete
   * @throws {Error} Must be implemented in subclass
   */
  async deleteUser(email) {
    throw new Error("Method deleteUser must be implemented");
  }

  /**
   * Update a user's password.
   * @param {string|number} userId - ID of the user
   * @param {string} hashedPassword - The new hashed password
   * @throws {Error} Must be implemented in subclass
   */
  async updateUserPassword(userId, hashedPassword) {
    throw new Error("Method updateUserPassword must be implemented");
  }
}

module.exports = IUserRepository;
