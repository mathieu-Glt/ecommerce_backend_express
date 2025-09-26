/**
 * Service produit qui dépend de l'abstraction (IProductRepository)
 * Ne connaît pas les détails d'implémentation (Mongoose, MySQL, etc.)
 */

class ProductService {
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  async getProducts() {
    return await this.productRepository.getProducts();
  }

  async getProductBySlug(slug) {
    return await this.productRepository.getProductBySlug(slug);
  }

  async createProduct(productData) {
    return await this.productRepository.createProduct(productData);
  }

  async findOrCreateProduct(productData) {
    return await this.productRepository.findOrCreateProduct(productData);
  }

  async updateProduct(productId, updateData) {
    return await this.productRepository.updateProduct(productId, updateData);
  }

  async getProductById(productId) {
    return await this.productRepository.getProductById(productId);
  }

  async deleteProduct(productId) {
    return await this.productRepository.deleteProduct(productId);
  }
}

module.exports = ProductService;
