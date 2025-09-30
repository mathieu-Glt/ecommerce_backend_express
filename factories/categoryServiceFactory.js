const CategoryService = require("../services/categoryService");
const MongooseCategoryRepository = require("../repositories/MongooseCategoryRepository");
const MySQLCategoryRepository = require("../repositories/MySQLCategoryRepository");

/**
 * Factory responsible for creating the appropriate CategoryService
 * depending on the configured database type (Mongoose or MySQL).
 *
 * This class ensures that the service is always instantiated
 * with the correct repository implementation, while hiding
 * the underlying database details from the rest of the application.
 *
 * @class CategoryServiceFactory
 */
class CategoryServiceFactory {
  /**
   * Create a CategoryService instance backed by Mongoose.
   *
   * @returns {CategoryService} An instance of CategoryService using MongooseCategoryRepository
   * @throws {Error} If the Mongoose service creation fails
   */
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

  /**
   * Create a CategoryService instance backed by MySQL.
   *
   * Uses a MySQL connection and initializes the repository
   * before injecting it into the service.
   *
   * @returns {CategoryService} An instance of CategoryService using MySQLCategoryRepository
   * @throws {Error} If the MySQL service creation fails
   */
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

  /**
   * Create a CategoryService instance based on the configured database type.
   *
   * Defaults to Mongoose if no valid type is provided.
   *
   * @param {"mongoose"|"mysql"} [databaseType="mongoose"] - The database type to use
   * @returns {CategoryService} An instance of CategoryService with the appropriate repository
   */
  static createCategoryService(databaseType = "mongoose") {
    console.log(
      `Creating category service with database type: ${databaseType}`
    );

    switch (databaseType.toLowerCase()) {
      case "mongoose":
        return this.createMongooseCategoryService();
      case "mysql":
        return this.createMySQLCategoryService();
      default:
        console.warn(
          `Unsupported database type: ${databaseType}, falling back to mongoose`
        );
        return this.createMongooseCategoryService();
    }
  }
}

module.exports = CategoryServiceFactory;
