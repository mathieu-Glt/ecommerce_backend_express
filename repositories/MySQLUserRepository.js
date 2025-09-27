const IUserRepository = require("./IUserRepository");

/**
 * MySQL-based implementation of the User Repository.
 *
 * This class handles all user-related database operations using
 * a MySQL database connection. It extends the IUserRepository
 * abstraction to decouple service layer logic from database type.
 */
class MySQLUserRepository extends IUserRepository {
  /**
   * @param {Object} database - A MySQL2/promise database connection instance
   */
  constructor(database) {
    super();
    this.db = database;
  }

  /**
   * Find a user by email or create a new one if not found.
   * Updates existing user if they already exist.
   * @param {Object} userData - User data (firstname, lastname, email, picture)
   * @returns {Promise<Object>} Success status and user record or error
   */
  async findOrCreateUser(userData) {
    try {
      const { firstname, lastname, email, picture } = userData;

      // Check if the user already exists
      const [existingUser] = await this.db.execute(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );

      if (existingUser.length > 0) {
        // Update the existing user
        await this.db.execute(
          "UPDATE users SET firstname = ?, lastname = ?, picture = ? WHERE email = ?",
          [firstname, lastname, picture, email]
        );

        const [updatedUser] = await this.db.execute(
          "SELECT * FROM users WHERE email = ?",
          [email]
        );

        return { success: true, user: updatedUser[0] };
      } else {
        // Create a new user
        const [result] = await this.db.execute(
          "INSERT INTO users (firstname, lastname, email, picture) VALUES (?, ?, ?, ?)",
          [firstname, lastname, email, picture]
        );

        const [newUser] = await this.db.execute(
          "SELECT * FROM users WHERE id = ?",
          [result.insertId]
        );

        return { success: true, user: newUser[0] };
      }
    } catch (error) {
      console.error("MySQLUserRepository.findOrCreateUser error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update a user by email.
   * @param {string} email - User email
   * @param {Object} updateData - Fields to update (e.g., firstname, lastname, picture)
   * @returns {Promise<Object>} Updated user record or error
   */
  async updateUser(email, updateData) {
    try {
      const fields = Object.keys(updateData)
        .map((key) => `${key} = ?`)
        .join(", ");
      const values = Object.values(updateData);
      values.push(email);

      await this.db.execute(
        `UPDATE users SET ${fields} WHERE email = ?`,
        values
      );

      const [user] = await this.db.execute(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );

      return { success: true, user: user[0] };
    } catch (error) {
      console.error("MySQLUserRepository.updateUser error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Retrieve a user by their email address.
   * @param {string} email - User email
   * @returns {Promise<Object>} User record or null if not found
   */
  async getUserByEmail(email) {
    try {
      const [users] = await this.db.execute(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );

      return { success: true, user: users[0] || null };
    } catch (error) {
      console.error("MySQLUserRepository.getUserByEmail error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Find a user by their unique ID.
   * @param {string|number} id - User ID
   * @returns {Promise<Object>} User record or null if not found
   */
  async findUserById(id) {
    try {
      const [users] = await this.db.execute(
        "SELECT * FROM users WHERE id = ?",
        [id]
      );

      return { success: true, user: users[0] || null };
    } catch (error) {
      console.error("MySQLUserRepository.findUserById error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a user by their email address.
   * @param {string} email - User email
   * @returns {Promise<Object>} Success status or error
   */
  async deleteUser(email) {
    try {
      const [result] = await this.db.execute(
        "DELETE FROM users WHERE email = ?",
        [email]
      );

      return { success: true, deleted: result.affectedRows > 0 };
    } catch (error) {
      console.error("MySQLUserRepository.deleteUser error:", error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = MySQLUserRepository;
