const ResetPasswordService = require("../services/resetPassowordService");
const MongooseResetPasswordRepository = require("../repositories/MongooseResetPasswordRepository");
const MySQLResetPasswordRepository = require("../repositories/MySQLResetPasswordRepository");

/**
 * Factory pour créer le service utilisateur avec la bonne implémentation
 * selon la configuration
 */
class ResetPasswordServiceFactory {
  static createMongooseResetPasswordService() {
    try {
      const PasswordResetToken = require("../models/PasswordResetToken");
      const passwordResetRepository = new MongooseResetPasswordRepository(
        PasswordResetToken
      );
      return new ResetPasswordService(passwordResetRepository);
    } catch (error) {
      console.error("Error creating Mongoose reset password service:", error);
      throw new Error("Failed to create Mongoose reset password service");
    }
  }

  static createMySQLResetPasswordService() {
    try {
      const mysql = require("mysql2/promise");
      const connection = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      });

      const passwordResetRepository = new MySQLResetPasswordRepository(
        connection
      );
      return new ResetPasswordService(passwordResetRepository);
    } catch (error) {
      console.error("Error creating MySQL reset password service:", error);
      throw new Error("Failed to create MySQL reset password service");
    }
  }

  static createResetPasswordService(databaseType = "mongoose") {
    console.log(
      `Creating reset password service with database type: ${databaseType}`
    );

    switch (databaseType.toLowerCase()) {
      case "mongoose":
        return this.createMongooseResetPasswordService();
      case "mysql":
        return this.createMySQLResetPasswordService();
      default:
        console.warn(
          `Unsupported database type: ${databaseType}, falling back to mongoose`
        );
        return this.createMongooseResetPasswordService();
    }
  }
}

module.exports = ResetPasswordServiceFactory;
