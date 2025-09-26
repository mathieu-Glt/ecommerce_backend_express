const ISubRepository = require("./ISubRepository");

/**
 * Implémentation MySQL du repository catégorie
 */

class MySQLCategoryRepository extends ISubRepository {
  constructor(connection) {
    super();
    this.connection = connection;
  }

  async getCategories() {
    const [rows] = await this.connection.execute("SELECT * FROM categories");
    return rows;
  }

  async getCategoryBySlug(slug) {
    const [rows] = await this.connection.execute(
      "SELECT * FROM categories WHERE slug = ?",
      [slug]
    );
    return rows[0];
  }

  async createCategory(categoryData) {
    const [result] = await this.connection.execute(
      "INSERT INTO categories (name, slug) VALUES (?, ?)",
      [categoryData.name, categoryData.slug]
    );
    return { id: result.insertId, ...categoryData };
  }

  async findOrCreateCategory(categoryData) {
    const [rows] = await this.connection.execute(
      "SELECT * FROM categories WHERE name = ?",
      [categoryData.name]
    );
    if (rows.length === 0) {
      return await this.createCategory(categoryData);
    }
    return rows[0];
  }

  async updateCategory(categoryId, updateData) {
    const [result] = await this.connection.execute(
      "UPDATE categories SET name = ?, slug = ? WHERE id = ?",
      [updateData.name, updateData.slug, categoryId]
    );
    return result.affectedRows > 0;
  }

  async getCategoryById(categoryId) {
    const [rows] = await this.connection.execute(
      "SELECT * FROM categories WHERE id = ?",
      [categoryId]
    );
    return rows[0];
  }

  async deleteCategory(categoryId) {
    const [result] = await this.connection.execute(
      "DELETE FROM categories WHERE id = ?",
      [categoryId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = MySQLCategoryRepository;
