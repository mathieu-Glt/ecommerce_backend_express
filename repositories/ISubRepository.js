/**
 * Interface/Abstraction pour le repository sous-catégorie
 * Définit les méthodes que toutes les implémentations doivent avoir
 */
class ISubRepository {
  async findOrCreateSub(subData) {
    throw new Error("Method findOrCreateSub must be implemented");
  }

  async updateSub(subId, updateData) {
    throw new Error("Method updateSub must be implemented");
  }

  async getSubs() {
    throw new Error("Method getSubs must be implemented");
  }

  async createSub(subData) {
    throw new Error("Method createSub must be implemented");
  }

  async getSubBySlug(slug) {
    throw new Error("Method getSubBySlug must be implemented");
  }
  async getSubById(subId) {
    throw new Error("Method getSubById must be implemented");
  }

  async deleteSub(subId) {
    throw new Error("Method deleteSub must be implemented");
  }
}

module.exports = ISubRepository;
