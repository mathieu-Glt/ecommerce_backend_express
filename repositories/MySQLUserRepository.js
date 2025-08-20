const IUserRepository = require("./IUserRepository");

/**
 * Implémentation MySQL du repository utilisateur
 */
class MySQLUserRepository extends IUserRepository {
  constructor(database) {
    super();
    this.db = database;
  }

  async findOrCreateUser(userData) {
    try {
      const { firstname, lastname, email, picture } = userData;

      // Vérifier si l'utilisateur existe
      const [existingUser] = await this.db.execute(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );

      if (existingUser.length > 0) {
        // Mettre à jour l'utilisateur existant
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
        // Créer un nouvel utilisateur
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
