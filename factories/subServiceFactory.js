const SubService = require("../services/subService");
const MongooseSubRepository = require("../repositories/MongooseSubRepository");
const MySQLSubRepository = require("../repositories/MySQLSubRepository");

/**
 * Factory responsible for creating the appropriate SubService
 * depending on the configured database type (Mongoose or MySQL).
 *
 * This class ensures that the service is always instantiated
 * with the correct repository implementation, while hiding
 * the underlying database details from the rest of the application.
 *
 * @class SubServiceFactory
 */
class SubServiceFactory {
  /**
   * Create a SubService instance backed by Mongoose.
   *
   * @returns {SubService} An instance of SubService using MongooseSubRepository
   * @throws {Error} If the Mongoose service creation fails
   */
  static createMongooseSubService() {
    try {
      const Sub = require("../models/Sub");
      const subRepository = new MongooseSubRepository(Sub);
      return new SubService(subRepository);
    } catch (error) {
      console.error("Error creating Mongoose sub service:", error);
      throw new Error("Failed to create Mongoose sub service");
    }
  }

  /**
   * Create a SubService instance backed by MySQL.
   *
   * Uses a MySQL connection and initializes the repository
   * before injecting it into the service.
   *
   * @returns {SubService} An instance of SubService using MySQLSubRepository
   * @throws {Error} If the MySQL service creation fails
   */
  static createMySQLSubService() {
    try {
      const mysql = require("mysql2/promise");
      const connection = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      });
      const subRepository = new MySQLSubRepository(connection);
      return new SubService(subRepository);
    } catch (error) {
      console.error("Error creating MySQL sub service:", error);
      throw new Error("Failed to create MySQL sub service");
    }
  }

  /**
   * Create a SubService instance based on the configured database type.
   *
   * Defaults to Mongoose if no valid type is provided.
   *
   * @param {"mongoose"|"mysql"} [databaseType="mongoose"] - The database type to use
   * @returns {SubService} An instance of SubService with the appropriate repository
   */
  static createSubService(databaseType = "mongoose") {
    switch (databaseType.toLowerCase()) {
      case "mongoose":
        return this.createMongooseSubService();
      case "mysql":
        return this.createMySQLSubService();
      default:
        throw new Error("Invalid database type");
    }
  }
}

module.exports = SubServiceFactory;
