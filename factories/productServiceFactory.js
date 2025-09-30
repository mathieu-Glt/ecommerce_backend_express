const ProductService = require("../services/productService");
const MongooseProductRepository = require("../repositories/MongooseProductRepository");
const MySQLProductRepository = require("../repositories/MySQLProductRepository");

/**
 * Factory responsible for creating the appropriate ProductService
 * depending on the configured database type (Mongoose or MySQL).
 *
 * This class ensures that the service is always instantiated
 * with the correct repository implementation, while hiding
 * the underlying database details from the rest of the application.
 *
 * @class ProductServiceFactory
 */
class ProductServiceFactory {
  /**
   * Create a ProductService instance backed by Mongoose.
   *
   * @returns {ProductService} An instance of ProductService using MongooseProductRepository
   * @throws {Error} If the Mongoose service creation fails
   */
  static createMongooseProductService() {
    try {
      const Product = require("../models/Product");
      const productRepository = new MongooseProductRepository(Product);
      return new ProductService(productRepository);
    } catch (error) {
      console.error("Error creating Mongoose product service:", error);
      throw new Error("Failed to create Mongoose product service");
    }
  }

  /**
   * Create a ProductService instance backed by MySQL.
   *
   * Uses a MySQL connection and initializes the repository
   * before injecting it into the service.
   *
   * @returns {ProductService} An instance of ProductService using MySQLProductRepository
   * @throws {Error} If the MySQL service creation fails
   */
  static createMySQLProductService() {
    try {
      const mysql = require("mysql2/promise");
      const connection = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      });
      const productRepository = new MySQLProductRepository(connection);
      return new ProductService(productRepository);
    } catch (error) {
      console.error("Error creating MySQL product service:", error);
      throw new Error("Failed to create MySQL product service");
    }
  }

  /**
   * Create a ProductService instance based on the configured database type.
   *
   * Defaults to Mongoose if no valid type is provided.
   *
   * @param {"mongoose"|"mysql"} [databaseType="mongoose"] - The database type to use
   * @returns {ProductService} An instance of ProductService with the appropriate repository
   */
  static createProductService(databaseType = "mongoose") {
    switch (databaseType.toLowerCase()) {
      case "mongoose":
        return this.createMongooseProductService();
      case "mysql":
        return this.createMySQLProductService();
      default:
        throw new Error("Invalid database type");
    }
  }
}

module.exports = ProductServiceFactory;
