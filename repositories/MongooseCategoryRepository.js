const ICategoryRepository = require("./ICategoryRepository");

/**
 * Mongoose-based implementation of the Category Repository.
 *
 * This class handles all category-related database operations using
 * a Mongoose model. It extends the ICategoryRepository abstraction
 * to ensure the service layer does not depend on the database implementation.
 */
class MongooseCategoryRepository extends ICategoryRepository {
  /**
   * @param {mongoose.Model} CategoryModel - Mongoose Category model
   */
  constructor(CategoryModel) {
    super();
    this.Category = CategoryModel;
  }

  /**
   * Retrieve all categories from the database.
   * @returns {Promise<Array>} Array of category documents
   */
  async getCategories() {
    return await this.Category.find();
  }

  /**
   * Retrieve a category by its slug.
   * @param {string} slug - Category slug
   * @returns {Promise<Object|null>} Category document or null if not found
   */
  async getCategoryBySlug(slug) {
    return await this.Category.findOne({ slug });
  }

  /**
   * Create a new category in the database.
   * @param {Object} categoryData - Category data
   * @returns {Promise<Object>} Created category document
   */
  async createCategory(categoryData) {
    return await this.Category.create(categoryData);
  }

  /**
   * Find a category by name or create a new one if it doesn't exist.
   * @param {Object} categoryData - Category data
   * @returns {Promise<Object>} Found or created category document
   */
  async findOrCreateCategory(categoryData) {
    const { name } = categoryData;
    const category = await this.Category.findOne({ name });
    if (!category) {
      return await this.Category.create(categoryData);
    }
    return category;
  }

  /**
   * Update a category by its ID.
   * If the category does not exist, it will be created (upsert: true).
   * @param {string} categoryId - Category ID
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object>} Updated or created category document
   */
  async updateCategory(categoryId, updateData) {
    return await this.Category.findByIdAndUpdate(categoryId, updateData, {
      new: true, // Return the updated document '(after update)'
      upsert: false, // Do not create if it doesn't exist
    });
  }

  /**
   * Retrieve a category by its unique ID.
   * @param {string} categoryId - Category ID
   * @returns {Promise<Object|null>} Category document or null if not found
   */
  async getCategoryById(categoryId) {
    return await this.Category.findById(categoryId);
  }

  /**
   * Delete a category by its unique ID.
   * @param {string} categoryId - Category ID
   * @returns {Promise<Object|null>} Deleted category document or null if not found
   */
  async deleteCategory(categoryId) {
    return await this.Category.findByIdAndDelete(categoryId);
  }
}

module.exports = MongooseCategoryRepository;
