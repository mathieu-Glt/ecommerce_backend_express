/**
 * @file SubService.js
 * @description
 * Sub-Category Service
 *
 * Provides an abstraction layer for sub-category (sub) related operations.
 * Delegates data access to an injected repository implementation
 * (e.g., MongoDB, MySQL, or any other storage system).
 *
 * Responsibilities:
 *  - Fetching subs (all, by slug, by ID)
 *  - Creating new subs
 *  - Updating existing subs
 *  - Deleting subs
 *  - Supporting "find or create" logic
 *
 * Dependencies:
 *  - ISubRepository (interface/abstraction)
 *
 * This service follows the Dependency Inversion Principle (SOLID),
 * ensuring it does not depend on low-level implementation details.
 */

/**
 * Sub-Category Service
 * @class SubService
 */
class SubService {
  /**
   * Initializes SubService with a repository abstraction.
   * @param {Object} subRepository - Repository abstraction for sub operations.
   */
  constructor(subRepository) {
    this.subRepository = subRepository;
  }

  /**
   * Retrieve all sub-categories.
   * @returns {Promise<Array>} List of subs.
   */
  async getSubs() {
    return await this.subRepository.getSubs();
  }

  /**
   * Retrieve a sub-category by its slug.
   * @param {string} slug - Unique slug identifier for the sub.
   * @returns {Promise<Object|null>} Sub object or null if not found.
   */
  async getSubBySlug(slug) {
    return await this.subRepository.getSubBySlug(slug);
  }

  /**
   * Create a new sub-category.
   * @param {Object} subData - Sub details (name, slug, description, etc.).
   * @returns {Promise<Object>} Created sub object.
   */
  async createSub(subData) {
    return await this.subRepository.createSub(subData);
  }

  /**
   * Find a sub by unique data or create it if it does not exist.
   * @param {Object} subData - Sub details to match or create.
   * @returns {Promise<Object>} Found or newly created sub.
   */
  async findOrCreateSub(subData) {
    return await this.subRepository.findOrCreateSub(subData);
  }

  /**
   * Update a sub-category by ID.
   * @param {string} subId - Sub ID.
   * @param {Object} updateData - Fields to update (e.g., name, slug, description).
   * @returns {Promise<Object|null>} Updated sub object or null if not found.
   */
  async updateSub(subId, updateData) {
    return await this.subRepository.updateSub(subId, updateData);
  }

  /**
   * Retrieve a sub-category by its ID.
   * @param {string} subId - Sub ID.
   * @returns {Promise<Object|null>} Sub object or null if not found.
   */
  async getSubById(subId) {
    return await this.subRepository.getSubById(subId);
  }

  /**
   * Delete a sub-category by its ID.
   * @param {string} subId - Sub ID.
   * @returns {Promise<Object>} Deletion result (may vary depending on repository implementation).
   */
  async deleteSub(subId) {
    return await this.subRepository.deleteSub(subId);
  }
}

module.exports = SubService;
