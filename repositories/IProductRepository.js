/**
 * Interface/Abstraction pour le repository produit
 * Définit les méthodes que toutes les implémentations doivent avoir
 */
class IProductRepository {
  async findOrCreateProduct(productData) {
    throw new Error("Method findOrCreateProduct must be implemented");
  }

  async updateProduct(productId, updateData) {
    throw new Error("Method updateProduct must be implemented");
  }

  async getProducts() {
    throw new Error("Method getProducts must be implemented");
  }

  async createProduct(productData) {
    throw new Error("Method createProduct must be implemented");
  }

  async getProductBySlug(slug) {
    throw new Error("Method getProductBySlug must be implemented");
  }

  async getProductById(productId) {
    throw new Error("Method getProductById must be implemented");
  }

  async deleteProduct(productId) {
    throw new Error("Method deleteProduct must be implemented");
  }
}

module.exports = IProductRepository;
