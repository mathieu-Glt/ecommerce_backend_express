/**
 * Service categorie qui dépend de l'abstraction (ICategoryRepository)
 * Ne connaît pas les détails d'implémentation (Mongoose, MySQL, etc.)
 */

class CategoryService {
  constructor(categoryRepository) {
    this.categoryRepository = categoryRepository;
  }

  async getCategories() {
    return await this.categoryRepository.getCategories();
  }

  async getCategoryBySlug(slug) {
    return await this.categoryRepository.getCategoryBySlug(slug);
  }

  async createCategory(categoryData) {
    return await this.categoryRepository.createCategory(categoryData);
  }

  async findOrCreateCategory(categoryData) {
    return await this.categoryRepository.findOrCreateCategory(categoryData);
  }

  async updateCategory(categoryId, updateData) {
    return await this.categoryRepository.updateCategory(categoryId, updateData);
  }

  async getCategoryById(categoryId) {
    return await this.categoryRepository.getCategoryById(categoryId);
  }

  async deleteCategory(categoryId) {
    return await this.categoryRepository.deleteCategory(categoryId);
  }
}

module.exports = CategoryService;
