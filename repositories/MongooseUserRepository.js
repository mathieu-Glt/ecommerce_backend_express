const IUserRepository = require("./IUserRepository");

/**
 * Implémentation Mongoose du repository utilisateur
 */
class MongooseUserRepository extends IUserRepository {
  constructor(UserModel) {
    super();
    this.User = UserModel;
  }

  async findOrCreateUser(userData) {
    try {
      const { firstname, lastname, email, picture } = userData;
      const user = await this.User.findOneAndUpdate(
        { email },
        { firstname, lastname, email, picture },
        { new: true, upsert: true }
      );
      return { success: true, user };
    } catch (error) {
      console.error("MongooseUserRepository.findOrCreateUser error:", error);
      return { success: false, error: error.message };
    }
  }

  async updateUser(email, updateData) {
    try {
      const user = await this.User.findOneAndUpdate({ email }, updateData, {
        new: true,
      });
      return { success: true, user };
    } catch (error) {
      console.error("MongooseUserRepository.updateUser error:", error);
      return { success: false, error: error.message };
    }
  }

  async getUserByEmail(email) {
    try {
      const user = await this.User.findOne({ email });
      return { success: true, user };
    } catch (error) {
      console.error("MongooseUserRepository.getUserByEmail error:", error);
      return { success: false, error: error.message };
    }
  }

  async findUserById(id) {
    try {
      const user = await this.User.findById(id);
      return { success: true, user };
    } catch (error) {
      console.error("MongooseUserRepository.findUserById error:", error);
      return { success: false, error: error.message };
    }
  }

  async deleteUser(email) {
    try {
      const result = await this.User.findOneAndDelete({ email });
      return { success: true, deleted: !!result };
    } catch (error) {
      console.error("MongooseUserRepository.deleteUser error:", error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = MongooseUserRepository;
