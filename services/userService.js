/**
 * User service that depends on the abstraction (IUserRepository).
 * Does not know the implementation details (Mongoose, MySQL, etc.).
 * @class UserService
 */
class UserService {
  /**
   * Initialize the service with a user repository.
   * @param {Object} userRepository - The repository abstraction for user operations.
   */
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Retrieve all users from the repository.
   * @returns {Promise<Array>} List of users.
   */
  async getUsers() {
    return await this.userRepository.getUsers();
  }

  /**
   * Find a user by their email address.
   * @param {string} email - The user's email.
   * @returns {Promise<Object>} User object or error.
   */
  async getUserByEmail(email) {
    return await this.userRepository.getUserByEmail(email);
  }

  /**
   * Find a user by email or create a new one if not found.
   * @param {Object} userData - Data to create the user if not found.
   * @returns {Promise<Object>} User object (new or existing).
   */
  async findOrCreateUser(userData) {
    return await this.userRepository.findOrCreateUser(userData);
  }

  /**
   * Update a user by their email.
   * @param {string} email - The user's email.
   * @param {Object} updateData - Data to update.
   * @returns {Promise<Object>} Update result.
   */
  async updateUser(email, updateData) {
    return await this.userRepository.updateUser(email, updateData);
  }

  /**
   * Update a user by their unique ID.
   * @param {string} userId - The user's ID.
   * @param {Object} updateData - Data to update.
   * @returns {Promise<Object>} Update result.
   */
  async updateUserById(userId, updateData) {
    console.log("🔍 Service: Updating user with ID:", userId);
    console.log("📝 Service: Data to update:", updateData);

    const result = await this.userRepository.updateUserById(userId, updateData);

    if (result.success) {
      console.log(`User updated successfully for ID: ${userId}`);
    }
    return result;
  }

  /**
   * Retrieve a user by email (duplicate of getUserByEmail).
   * @param {string} email - The user's email.
   * @returns {Promise<Object>} User object or error.
   */
  async getUserByEmail(email) {
    return await this.userRepository.getUserByEmail(email);
  }

  /**
   * Find a user by their unique ID.
   * @param {string} id - The user's ID.
   * @returns {Promise<Object>} User object or error.
   */
  async findUserById(id) {
    return await this.userRepository.findUserById(id);
  }

  /**
   * Delete a user by their email.
   * @param {string} email - The user's email.
   * @returns {Promise<Object>} Deletion result.
   */
  async deleteUser(email) {
    return await this.userRepository.deleteUser(email);
  }

  /**
   * Update a user's profile data by email.
   * @param {string} email - The user's email.
   * @param {Object} profileData - Profile fields to update.
   * @returns {Promise<Object>} Update result.
   */
  async updateUserProfile(email, profileData) {
    const result = await this.userRepository.updateUser(email, profileData);
    if (result.success) {
      console.log(`Profile updated for user: ${email}`);
    }
    return result;
  }

  /**
   * Retrieve a user's profile (excluding sensitive fields such as password).
   * @param {string} email - The user's email.
   * @returns {Promise<Object>} Profile object or error.
   */
  async getUserProfile(email) {
    const result = await this.userRepository.getUserByEmail(email);
    if (result.success && result.user) {
      return { success: true, profile: result.user };
    }
    return result;
  }

  /**
   * Retrieve a user by ID (excluding sensitive fields such as password).
   * @param {string} userId - The user's ID.
   * @returns {Promise<Object>} Profile object or error.
   */
  async getUserById(userId) {
    const result = await this.userRepository.findUserById(userId);
    if (result.success && result.user) {
      return { success: true, profile: result.user };
    }
    return result;
  }

  /**
   * Update a user's password securely by hashing before saving.
   * @param {string} userId - The user's ID.
   * @param {string} newPassword - The new password in plain text.
   * @returns {Promise<Object>} Result of the password update.
   */
  async updateUserPassword(userId, newPassword) {
    try {
      const bcrypt = require("bcrypt");
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      const result = await this.userRepository.updateUserPassword(
        userId,
        hashedPassword
      );

      if (result.success) {
        console.log(`Password updated for user ID: ${userId}`);
        return {
          success: true,
          message: "Password updated successfully",
        };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Error updating password:", error);
      return {
        success: false,
        error: "Error while updating password",
      };
    }
  }
}

module.exports = UserService;
