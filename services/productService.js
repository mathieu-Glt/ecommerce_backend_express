/**
 * @file ProductService.js
 * @description
 * Product Service
 *
 * Provides an abstraction layer for product-related operations.
 * Delegates data access to an injected repository implementation
 * (e.g., MongoDB, MySQL, or any other storage system).
 *
 * Responsibilities:
 *  - Fetching products (all, by slug, by ID)
 *  - Creating new products
 *  - Updating existing products
 *  - Deleting products
 *  - Supporting "find or create" logic
 *
 * Dependencies:
 *  - IProductRepository (interface/abstraction)
 *
 * This service follows the Dependency Inversion Principle (SOLID),
 * ensuring it does not depend on low-level implementation details.
 */

/**
 * Product Service
 * @class ProductService
 */
class ProductService {
  /**
   * Initializes ProductService with a repository abstraction.
   * @param {Object} productRepository - Repository abstraction for product operations.
   */
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  /**
   * Retrieve all products.
   * @returns {Promise<Array>} List of products.
   */
  async getProducts() {
    return await this.productRepository.getProducts();
  }

  /**
   * Retrieve a product by its slug.
   * @param {string} slug - Unique slug identifier for the product.
   * @returns {Promise<Object|null>} Product object or null if not found.
   */
  async getProductBySlug(slug) {
    return await this.productRepository.getProductBySlug(slug);
  }

  /**
   * Create a new product.
   * @param {Object} productData - Product details (name, slug, price, description, etc.).
   * @returns {Promise<Object>} Created product object.
   */
  async createProduct(productData) {
    return await this.productRepository.createProduct(productData);
  }

  /**
   * Find a product by unique data or create it if it does not exist.
   * @param {Object} productData - Product details to match or create.
   * @returns {Promise<Object>} Found or newly created product.
   */
  async findOrCreateProduct(productData) {
    return await this.productRepository.findOrCreateProduct(productData);
  }

  /**
   * Update a product by ID.
   * @param {string} productId - Product ID.
   * @param {Object} updateData - Fields to update (e.g., price, stock, description).
   * @returns {Promise<Object|null>} Updated product object or null if not found.
   */
  async updateProduct(productId, updateData) {
    return await this.productRepository.updateProduct(productId, updateData);
  }

  /**
   * Retrieve a product by its ID.
   * @param {string} productId - Product ID.
   * @returns {Promise<Object|null>} Product object or null if not found.
   */
  async getProductById(productId) {
    return await this.productRepository.getProductById(productId);
  }

  /**
   * Delete a product by its ID.
   * @param {string} productId - Product ID.
   * @returns {Promise<Object>} Deletion result (may vary depending on repository implementation).
   */
  async deleteProduct(productId) {
    return await this.productRepository.deleteProduct(productId);
  }
}

module.exports = ProductService;
