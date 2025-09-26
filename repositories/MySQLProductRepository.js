const IProductRepository = require("./IProductRepository");

/**
 * Implémentation MySQL du repository produit
 */
class MySQLProductRepository extends IProductRepository {
  constructor(connection) {
    super();
    this.connection = connection;
  }

  async getProducts() {
    const [rows] = await this.connection.execute("SELECT * FROM products");
    return rows;
  }

  async getProductBySlug(slug) {
    const [rows] = await this.connection.execute(
      "SELECT * FROM products WHERE slug = ?",
      [slug]
    );
    return rows[0];
  }

  async createProduct(productData) {
    const { title, slug } = productData;
    const [result] = await this.connection.execute(
      "INSERT INTO products (title, slug) VALUES (?, ?)",
      [title, slug]
    );
    return result.insertId;
  }

  async findOrCreateProduct(productData) {
    const { title, slug } = productData;
    const [result] = await this.connection.execute(
      "INSERT INTO products (title, slug) VALUES (?, ?)",
      [title, slug]
    );
    return result.insertId;
  }

  async updateProduct(productId, updateData) {
    const { title, slug } = updateData;
    const [result] = await this.connection.execute(
      "UPDATE products SET title = ?, slug = ? WHERE id = ?",
      [title, slug, productId]
    );
    return result.affectedRows;
  }

  async getProductById(productId) {
    const [rows] = await this.connection.execute(
      "SELECT * FROM products WHERE id = ?",
      [productId]
    );
    return rows[0];
  }

  async deleteProduct(productId) {
    const [result] = await this.connection.execute(
      "DELETE FROM products WHERE id = ?",
      [productId]
    );
    return result.affectedRows;
  }
}

module.exports = MySQLProductRepository;
