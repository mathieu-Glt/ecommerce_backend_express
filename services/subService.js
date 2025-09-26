/**
 * Service sous-catégorie qui dépend de l'abstraction (ISubRepository)
 * Ne connaît pas les détails d'implémentation (Mongoose, MySQL, etc.)
 */

class SubService {
  constructor(subRepository) {
    this.subRepository = subRepository;
  }

  async getSubs() {
    return await this.subRepository.getSubs();
  }

  async getSubBySlug(slug) {
    return await this.subRepository.getSubBySlug(slug);
  }

  async createSub(subData) {
    return await this.subRepository.createSub(subData);
  }

  async findOrCreateSub(subData) {
    return await this.subRepository.findOrCreateSub(subData);
  }

  async updateSub(subId, updateData) {
    return await this.subRepository.updateSub(subId, updateData);
  }

  async getSubById(subId) {
    return await this.subRepository.getSubById(subId);
  }

  async deleteSub(subId) {
    return await this.subRepository.deleteSub(subId);
  }
}

module.exports = SubService;
