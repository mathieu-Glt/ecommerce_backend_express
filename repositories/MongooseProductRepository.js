const IProductRepository = require("./IProductRepository");

/**
 * Mongoose-based implementation of the Product Repository.
 *
 * This class handles all product-related database operations using
 * a Mongoose model. It extends the IProductRepository abstraction
 * to ensure the service layer does not depend on the database implementation.
 */
class MongooseProductRepository extends IProductRepository {
  /**
   * @param {mongoose.Model} ProductModel - Mongoose Product model
   */
  constructor(ProductModel) {
    super();
    this.Product = ProductModel;
  }

  /**
   * Retrieve all products from the database, populated with category and subcategory.
   * Also transforms image paths into complete URLs.
   * @returns {Promise<Array>} Array of product documents
   */
  async getProducts() {
    const products = await this.Product.find()
      .populate("category", "name slug") // Replace the category ID with an object containing only `name` and `slug` of Entity Category in related collection
      .populate("sub", "name slug") // Same for the field `sub`
      .sort({ createdAt: -1 });

    return products.map((product) => {
      if (product.images && product.images.length > 0) {
        product.images = product.images.map((image) => {
          if (!image.startsWith("/uploads/") && !image.startsWith("http")) {
            return `/uploads/${image}`;
          }
          return image;
        });
      }
      return product;
    });
  }

  /**
   * Retrieve a product by its slug.
   * Populates category and subcategory and formats image paths.
   * @param {string} slug - Product slug
   * @returns {Promise<Object|null>} Product document or null if not found
   */
  async getProductBySlug(slug) {
    const product = await this.Product.findOne({ slug })
      .populate("category", "name slug")
      .populate("sub", "name slug");

    if (product?.images?.length > 0) {
      product.images = product.images.map((image) => {
        if (!image.startsWith("/uploads/") && !image.startsWith("http")) {
          return `/uploads/${image}`;
        }
        return image;
      });
    }

    return product;
  }

  /**
   * Create a new product in the database.
   * @param {Object} productData - Product data
   * @returns {Promise<Object>} Created product document
   */
  async createProduct(productData) {
    return await this.Product.create(productData);
  }

  /**
   * Find a product by title or create a new one if it doesn't exist.
   * @param {Object} productData - Product data
   * @returns {Promise<Object>} Found or created product document
   */
  async findOrCreateProduct(productData) {
    const { title } = productData;
    const product = await this.Product.findOne({ title });
    if (!product) {
      return await this.Product.create(productData);
    }
    return product;
  }

  /**
   * Update a product by its ID.
   * @param {string} productId - Product ID
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object|null>} Updated product document or null if not found
   */
  async updateProduct(productId, updateData) {
    return await this.Product.findByIdAndUpdate(productId, updateData, {
      new: true, // Return the updated document
    });
  }

  /**
   * Retrieve a product by its unique ID.
   * @param {string} productId - Product ID
   * @returns {Promise<Object|null>} Product document or null if not found
   */
  async getProductById(productId) {
    return await this.Product.findById(productId);
  }

  /**
   * Delete a product by its unique ID.
   * @param {string} productId - Product ID
   * @returns {Promise<Object|null>} Deleted product document or null if not found
   */
  async deleteProduct(productId) {
    return await this.Product.findByIdAndDelete(productId);
  }
}

module.exports = MongooseProductRepository;
