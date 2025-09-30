/**
 * @file CategoryService.js
 * @description
 * Category Service
 *
 * Provides an abstraction layer for category-related operations.
 * Delegates data access to an injected repository implementation
 * (e.g., MongoDB, MySQL, or any other storage system).
 *
 * Responsibilities:
 *  - Fetching categories (all, by slug, by ID)
 *  - Creating new categories
 *  - Updating existing categories
 *  - Deleting categories
 *  - Supporting "find or create" logic
 *
 * Dependencies:
 *  - ICategoryRepository (interface/abstraction)
 *
 * This service follows the Dependency Inversion Principle (SOLID),
 * ensuring it does not depend on low-level implementation details.
 */

/**
 * Category Service
 * @class CategoryService
 */
class CategoryService {
  /**
   * Initializes CategoryService with a repository abstraction.
   * @param {Object} categoryRepository - Repository abstraction for category operations.
   */
  constructor(categoryRepository) {
    this.categoryRepository = categoryRepository;
  }

  /**
   * Retrieve all categories.
   * @returns {Promise<Array>} List of categories.
   */
  async getCategories() {
    return await this.categoryRepository.getCategories();
  }

  /**
   * Retrieve a category by its slug.
   * @param {string} slug - Unique slug identifier for the category.
   * @returns {Promise<Object|null>} Category object or null if not found.
   */
  async getCategoryBySlug(slug) {
    return await this.categoryRepository.getCategoryBySlug(slug);
  }

  /**
   * Create a new category.
   * @param {Object} categoryData - Category details (name, slug, description, etc.).
   * @returns {Promise<Object>} Created category object.
   */
  async createCategory(categoryData) {
    return await this.categoryRepository.createCategory(categoryData);
  }

  /**
   * Find a category by unique data or create it if it does not exist.
   * @param {Object} categoryData - Category details to match or create.
   * @returns {Promise<Object>} Found or newly created category.
   */
  async findOrCreateCategory(categoryData) {
    return await this.categoryRepository.findOrCreateCategory(categoryData);
  }

  /**
   * Update a category by ID.
   * @param {string} categoryId - Category ID.
   * @param {Object} updateData - Fields to update (e.g., name, description, slug).
   * @returns {Promise<Object|null>} Updated category object or null if not found.
   */
  async updateCategory(categoryId, updateData) {
    return await this.categoryRepository.updateCategory(categoryId, updateData);
  }

  /**
   * Retrieve a category by its ID.
   * @param {string} categoryId - Category ID.
   * @returns {Promise<Object|null>} Category object or null if not found.
   */
  async getCategoryById(categoryId) {
    return await this.categoryRepository.getCategoryById(categoryId);
  }

  /**
   * Delete a category by its ID.
   * @param {string} categoryId - Category ID.
   * @returns {Promise<Object>} Deletion result (may vary depending on repository implementation).
   */
  async deleteCategory(categoryId) {
    return await this.categoryRepository.deleteCategory(categoryId);
  }
}

module.exports = CategoryService;
