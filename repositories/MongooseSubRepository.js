const ISubRepository = require("./ISubRepository");

/**
 * Mongoose-based implementation of the Subcategory Repository.
 *
 * This class handles all subcategory-related database operations using
 * a Mongoose model. It extends the ISubRepository abstraction
 * to ensure the service layer does not depend on the database implementation.
 */
class MongooseSubRepository extends ISubRepository {
  /**
   * @param {mongoose.Model} SubModel - Mongoose Subcategory model
   */
  constructor(SubModel) {
    super();
    this.Sub = SubModel;
  }

  /**
   * Retrieve all subcategories, populated with their parent category.
   * @returns {Promise<Array>} Array of subcategory documents
   */
  async getSubs() {
    try {
      console.log("🔍 MongooseSubRepository.getSubs() appelé");
      const subs = await this.Sub.find().populate("parent", "name slug");
      console.log("📊 Sous-catégories trouvées dans la DB:", subs?.length || 0);
      return subs;
    } catch (error) {
      console.error("❌ Erreur dans MongooseSubRepository.getSubs():", error);
      throw error;
    }
  }

  /**
   * Retrieve a subcategory by its slug.
   * @param {string} slug - Subcategory slug
   * @returns {Promise<Object|null>} Subcategory document or null if not found
   */
  async getSubBySlug(slug) {
    return await this.Sub.findOne({ slug }).populate("parent", "name slug");
  }

  /**
   * Create a new subcategory.
   * Handles duplicate errors for name or slug.
   * @param {Object} subData - Subcategory data
   * @returns {Promise<Object>} Created subcategory document
   * @throws {Error} Duplicate name or slug
   */
  async createSub(subData) {
    try {
      return await this.Sub.create(subData);
    } catch (error) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        const value = error.keyValue[field];
        throw new Error(
          `Une sous-catégorie avec ce ${
            field === "name" ? "nom" : "slug"
          } "${value}" existe déjà`
        );
      }
      throw error;
    }
  }

  /**
   * Find a subcategory by name or create a new one if it doesn't exist.
   * @param {Object} subData - Subcategory data
   * @returns {Promise<Object>} Found or created subcategory document
   */
  async findOrCreateSub(subData) {
    const { name } = subData;
    const sub = await this.Sub.findOne({ name });
    if (!sub) {
      return await this.Sub.create(subData);
    }
    return sub;
  }

  /**
   * Update a subcategory by its ID.
   * Handles duplicate errors for name or slug.
   * @param {string} subId - Subcategory ID
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object>} Updated subcategory document
   * @throws {Error} Duplicate name or slug
   */
  async updateSub(subId, updateData) {
    try {
      return await this.Sub.findByIdAndUpdate(subId, updateData, {
        new: true,
        runValidators: true,
      });
    } catch (error) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        const value = error.keyValue[field];
        throw new Error(
          `Une sous-catégorie avec ce ${
            field === "name" ? "nom" : "slug"
          } "${value}" existe déjà`
        );
      }
      throw error;
    }
  }

  /**
   * Retrieve a subcategory by its unique ID.
   * Populates its parent category.
   * @param {string} subId - Subcategory ID
   * @returns {Promise<Object|null>} Subcategory document or null if not found
   */
  async getSubById(subId) {
    return await this.Sub.findById(subId).populate("parent", "name slug");
  }

  /**
   * Delete a subcategory by its unique ID.
   * @param {string} subId - Subcategory ID
   * @returns {Promise<Object|null>} Deleted subcategory document or null if not found
   */
  async deleteSub(subId) {
    return await this.Sub.findByIdAndDelete(subId);
  }
}

module.exports = MongooseSubRepository;
