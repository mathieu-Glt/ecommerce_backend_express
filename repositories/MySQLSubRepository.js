const ISubRepository = require("./ISubRepository");

/**
 * Implémentation MySQL du repository sous-catégorie
 */
class MySQLSubRepository extends ISubRepository {
  constructor(connection) {
    super();
    this.connection = connection;
  }

  async getSubs() {
    const [rows] = await this.connection.execute("SELECT * FROM subs");
    return rows;
  }

  async getSubBySlug(slug) {
    const [rows] = await this.connection.execute(
      "SELECT * FROM subs WHERE slug = ?",
      [slug]
    );
    return rows[0];
  }

  async createSub(subData) {
    const [result] = await this.connection.execute(
      "INSERT INTO subs (name, slug) VALUES (?, ?)",
      [subData.name, subData.slug]
    );
    return { id: result.insertId, ...subData };
  }

  async findOrCreateSub(subData) {
    const [rows] = await this.connection.execute(
      "SELECT * FROM subs WHERE name = ?",
      [subData.name]
    );
    if (rows.length === 0) {
      return this.createSub(subData);
    }
    return rows[0];
  }

  async updateSub(subId, updateData) {
    const [result] = await this.connection.execute(
      "UPDATE subs SET name = ?, slug = ? WHERE id = ?",
      [updateData.name, updateData.slug, subId]
    );
    return { id: subId, ...updateData };
  }

  async getSubById(subId) {
    const [rows] = await this.connection.execute(
      "SELECT * FROM subs WHERE id = ?",
      [subId]
    );
    return rows[0];
  }

  async deleteSub(subId) {
    const [result] = await this.connection.execute(
      "DELETE FROM subs WHERE id = ?",
      [subId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = MySQLSubRepository;
