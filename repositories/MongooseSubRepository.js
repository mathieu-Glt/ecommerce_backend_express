const ISubRepository = require("./ISubRepository");

/**
 * Implémentation Mongoose du repository sous-catégorie
 */
class MongooseSubRepository extends ISubRepository {
  constructor(SubModel) {
    super();
    this.Sub = SubModel;
  }

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

  async getSubBySlug(slug) {
    return await this.Sub.findOne({ slug }).populate("parent", "name slug");
  }

  async createSub(subData) {
    try {
      return await this.Sub.create(subData);
    } catch (error) {
      // Gérer les erreurs de doublon
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

  async findOrCreateSub(subData) {
    const { name, slug } = subData;
    const sub = await this.Sub.findOne({ name });
    if (!sub) {
      return await this.Sub.create(subData);
    }
    return sub;
  }

  async updateSub(subId, updateData) {
    try {
      return await this.Sub.findByIdAndUpdate(subId, updateData, {
        new: true,
        runValidators: true,
      });
    } catch (error) {
      // Gérer les erreurs de doublon
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

  async getSubById(subId) {
    return await this.Sub.findById(subId).populate("parent", "name slug");
  }

  async deleteSub(subId) {
    return await this.Sub.findByIdAndDelete(subId);
  }
}

module.exports = MongooseSubRepository;
