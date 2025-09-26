const IProductRepository = require("./IProductRepository");

/**
 * Implémentation Mongoose du repository produit
 */
class MongooseProductRepository extends IProductRepository {
  constructor(ProductModel) {
    super();
    this.Product = ProductModel;
  }

  async getProducts() {
    const products = await this.Product.find()
      .populate("category", "name slug")
      .populate("sub", "name slug")
      .sort({ createdAt: -1 });

    // Transformer les chemins d'images en URLs complètes
    return products.map((product) => {
      if (product.images && product.images.length > 0) {
        product.images = product.images.map((image) => {
          // Si l'image n'a pas déjà le préfixe /uploads, l'ajouter
          if (!image.startsWith("/uploads/") && !image.startsWith("http")) {
            return `/uploads/${image}`;
          }
          return image;
        });
      }
      return product;
    });
  }

  async getProductBySlug(slug) {
    const product = await this.Product.findOne({ slug })
      .populate("category", "name slug")
      .populate("sub", "name slug");

    // Transformer les chemins d'images en URLs complètes
    if (product && product.images && product.images.length > 0) {
      product.images = product.images.map((image) => {
        // Si l'image n'a pas déjà le préfixe /uploads, l'ajouter
        if (!image.startsWith("/uploads/") && !image.startsWith("http")) {
          return `/uploads/${image}`;
        }
        return image;
      });
    }

    return product;
  }

  async createProduct(productData) {
    return await this.Product.create(productData);
  }

  async findOrCreateProduct(productData) {
    const { title, slug } = productData;
    const product = await this.Product.findOne({ title });
    if (!product) {
      return await this.Product.create(productData);
    }
    return product;
  }

  async updateProduct(productId, updateData) {
    return await this.Product.findByIdAndUpdate(productId, updateData, {
      new: true,
    });
  }

  async getProductById(productId) {
    return await this.Product.findById(productId);
  }

  async deleteProduct(productId) {
    return await this.Product.findByIdAndDelete(productId);
  }
}

module.exports = MongooseProductRepository;
