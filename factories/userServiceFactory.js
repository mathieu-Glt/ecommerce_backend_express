const UserService = require("../services/userService");
const MongooseUserRepository = require("../repositories/MongooseUserRepository");
const MySQLUserRepository = require("../repositories/MySQLUserRepository");

/**
 * Factory responsible for creating the appropriate UserService
 * depending on the configured database type (Mongoose or MySQL).
 *
 * This class ensures that the service is always instantiated
 * with the correct repository implementation, while hiding
 * the underlying database details from the rest of the application.
 *
 * @class UserServiceFactory
 */
class UserServiceFactory {
  /**
   * Create a UserService instance backed by Mongoose.
   *
   * @returns {UserService} An instance of UserService using MongooseUserRepository
   * @throws {Error} If the Mongoose service creation fails
   */
  static createMongooseUserService() {
    try {
      const User = require("../models/User");
      const userRepository = new MongooseUserRepository(User);
      return new UserService(userRepository);
    } catch (error) {
      console.error("Error creating Mongoose user service:", error);
      throw new Error("Failed to create Mongoose user service");
    }
  }

  /**
   * Create a UserService instance backed by MySQL.
   *
   * Uses a MySQL connection pool and initializes the repository
   * before injecting it into the service.
   *
   * @returns {UserService} An instance of UserService using MySQLUserRepository
   * @throws {Error} If the MySQL service creation fails
   */
  static createMySQLUserService() {
    try {
      const mysql = require("mysql2/promise");
      const connection = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      });

      const userRepository = new MySQLUserRepository(connection);
      return new UserService(userRepository);
    } catch (error) {
      console.error("Error creating MySQL user service:", error);
      throw new Error("Failed to create MySQL user service");
    }
  }

  /**
   * Create a UserService instance based on the configured database type.
   *
   * Defaults to Mongoose if no valid type is provided.
   *
   * @param {"mongoose"|"mysql"} [databaseType="mongoose"] - The database type to use
   * @returns {UserService} An instance of UserService with the appropriate repository
   */
  static createUserService(databaseType = "mongoose") {
    console.log(`Creating user service with database type: ${databaseType}`);

    switch (databaseType.toLowerCase()) {
      case "mongoose":
        return this.createMongooseUserService();
      case "mysql":
        return this.createMySQLUserService();
      default:
        console.warn(
          `Unsupported database type: ${databaseType}, falling back to mongoose`
        );
        return this.createMongooseUserService();
    }
  }
}

module.exports = UserServiceFactory;
