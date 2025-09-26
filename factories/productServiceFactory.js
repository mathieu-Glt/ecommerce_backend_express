const ProductService = require("../services/productService");
const MongooseProductRepository = require("../repositories/MongooseProductRepository");
const MySQLProductRepository = require("../repositories/MySQLProductRepository");

/**
 * Factory pour créer le service produit avec la bonne implémentation
 * selon la configuration
 */
class ProductServiceFactory {
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
