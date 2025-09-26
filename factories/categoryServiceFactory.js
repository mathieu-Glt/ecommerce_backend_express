const CategoryService = require("../services/categoryService");
const MongooseCategoryRepository = require("../repositories/MongooseCategoryRepository");
const MySQLCategoryRepository = require("../repositories/MySQLCategoryRepository");

/**
 * Factory pour créer le service catégorie avec la bonne implémentation
 * selon la configuration
 */
class CategoryServiceFactory {
  static createMongooseCategoryService() {
    try {
      const Category = require("../models/Category");
      const categoryRepository = new MongooseCategoryRepository(Category);
      return new CategoryService(categoryRepository);
    } catch (error) {
      console.error("Error creating Mongoose category service:", error);
      throw new Error("Failed to create Mongoose category service");
    }
  }

  static createMySQLCategoryService() {
    try {
      const mysql = require("mysql2/promise");
      const connection = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      });
      const categoryRepository = new MySQLCategoryRepository(connection);
      return new CategoryService(categoryRepository);
    } catch (error) {
      console.error("Error creating MySQL category service:", error);
      throw new Error("Failed to create MySQL category service");
    }
  }

  static createCategoryService(databaseType = "mongoose") {
    switch (databaseType.toLowerCase()) {
      case "mongoose":
        return this.createMongooseCategoryService();
      case "mysql":
        return this.createMySQLCategoryService();
      default:
        throw new Error("Invalid database type");
    }
  }
}

module.exports = CategoryServiceFactory;
