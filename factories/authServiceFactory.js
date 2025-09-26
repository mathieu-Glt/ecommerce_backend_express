const AuthService = require("../services/authService");
const MongooseUserRepository = require("../repositories/MongooseUserRepository");
const MySQLUserRepository = require("../repositories/MySQLUserRepository");

/**
 * Factory pour créer le service utilisateur avec la bonne implémentation
 * selon la configuration
 */
class AuthServiceFactory {
  static createMongooseAuthService() {
    try {
      const User = require("../models/User");
      const userRepository = new MongooseUserRepository(User);
      // const userRepository = new MySQLUserRepository(connection);
      // Créer le service avec l'implémentation appropriée c'est à dire MongooseUserRepository qu'on ajoute à AuthService pour MongoDB
      // ou si on souhaite utiliser MySQL, on utilisera MySQLUserRepository et on ajoutera cette clase à AuthService pour MySQL
      return new AuthService(userRepository);
    } catch (error) {
      console.error("Error creating Mongoose user service:", error);
      throw new Error("Failed to create Mongoose user service");
    }
  }

  static createMySQLAuthService() {
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

  static createAuthService(databaseType = "mongoose") {
    console.log(`Creating auth service with database type: ${databaseType}`);

    switch (databaseType.toLowerCase()) {
      case "mongoose":
        return this.createMongooseAuthService();
      case "mysql":
        return this.createMySQLAuthService();
      default:
        console.warn(
          `Unsupported database type: ${databaseType}, falling back to mongoose`
        );
        return this.createMongooseAuthService();
    }
  }
}

module.exports = AuthServiceFactory;
