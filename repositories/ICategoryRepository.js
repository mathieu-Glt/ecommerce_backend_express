/**
 * Interface/Abstraction pour le repository catégorie
 * Définit les méthodes que toutes les implémentations doivent avoir
 */
class ICategoryRepository {
  async findOrCreateCategory(categoryData) {
    throw new Error("Method findOrCreateCategory must be implemented");
  }

  async updateCategory(categoryId, updateData) {
    throw new Error("Method updateCategory must be implemented");
  }

  async getCategories() {
    throw new Error("Method getCategories must be implemented");
  }

  async createCategory(categoryData) {
    throw new Error("Method createCategory must be implemented");
  }

  async getCategoryBySlug(slug) {
    throw new Error("Method getCategoryBySlug must be implemented");
  }
  async getCategoryById(categoryId) {
    throw new Error("Method getCategoryById must be implemented");
  }

  async deleteCategory(categoryId) {
    throw new Error("Method deleteCategory must be implemented");
  }
}

module.exports = ICategoryRepository;
