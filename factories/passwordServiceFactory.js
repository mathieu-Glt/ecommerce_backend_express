const ResetPasswordService = require("../services/resetPassowordService");
const MongooseResetPasswordRepository = require("../repositories/MongooseResetPasswordRepository");
const MySQLResetPasswordRepository = require("../repositories/MySQLResetPasswordRepository");

/**
 * Factory responsible for creating the appropriate ResetPasswordService
 * depending on the configured database type (Mongoose or MySQL).
 *
 * This class ensures that the service is always instantiated
 * with the correct repository implementation, while hiding
 * the underlying database details from the rest of the application.
 *
 * @class ResetPasswordServiceFactory
 */
class ResetPasswordServiceFactory {
  /**
   * Create a ResetPasswordService instance backed by Mongoose.
   *
   * @returns {ResetPasswordService} An instance of ResetPasswordService using MongooseResetPasswordRepository
   * @throws {Error} If the Mongoose service creation fails
   */
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

  /**
   * Create a ResetPasswordService instance backed by MySQL.
   *
   * Uses a MySQL connection and initializes the repository
   * before injecting it into the service.
   *
   * @returns {ResetPasswordService} An instance of ResetPasswordService using MySQLResetPasswordRepository
   * @throws {Error} If the MySQL service creation fails
   */
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

  /**
   * Create a ResetPasswordService instance based on the configured database type.
   *
   * Defaults to Mongoose if no valid type is provided.
   *
   * @param {"mongoose"|"mysql"} [databaseType="mongoose"] - The database type to use
   * @returns {ResetPasswordService} An instance of ResetPasswordService with the appropriate repository
   */
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
