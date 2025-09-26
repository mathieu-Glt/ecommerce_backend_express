const ICategoryRepository = require("./ICategoryRepository");

/**
 * Implémentation Mongoose du repository catégorie
 */
class MongooseCategoryRepository extends ICategoryRepository {
  constructor(CategoryModel) {
    super();
    this.Category = CategoryModel;
  }

  async getCategories() {
    return await this.Category.find();
  }

  async getCategoryBySlug(slug) {
    return await this.Category.findOne({ slug });
  }

  async createCategory(categoryData) {
    return await this.Category.create(categoryData);
  }

  async findOrCreateCategory(categoryData) {
    const { name, slug } = categoryData;
    const category = await this.Category.findOne({ name });
    if (!category) {
      return await this.Category.create(categoryData);
    }
    return category;
  }

  async updateCategory(categoryId, updateData) {
    return await this.Category.findByIdAndUpdate(categoryId, updateData, {
      new: true,
      upsert: true,
    });
  }

  async getCategoryById(categoryId) {
    return await this.Category.findById(categoryId);
  }

  async deleteCategory(categoryId) {
    return await this.Category.findByIdAndDelete(categoryId);
  }
}

module.exports = MongooseCategoryRepository;
