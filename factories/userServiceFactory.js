const UserService = require("../services/userService");
const MongooseUserRepository = require("../repositories/MongooseUserRepository");
const MySQLUserRepository = require("../repositories/MySQLUserRepository");

/**
 * Factory pour créer le service utilisateur avec la bonne implémentation
 * selon la configuration
 */
class UserServiceFactory {
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
