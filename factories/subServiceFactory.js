const SubService = require("../services/subService");
const MongooseSubRepository = require("../repositories/MongooseSubRepository");
const MySQLSubRepository = require("../repositories/MySQLSubRepository");

/**
 * Factory pour créer le service sub avec la bonne implémentation
 * selon la configuration
 */
class SubServiceFactory {
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
