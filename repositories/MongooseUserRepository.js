const IUserRepository = require("./IUserRepository");

/**
 * Implémentation Mongoose du repository utilisateur
 */
class MongooseUserRepository extends IUserRepository {
  constructor(UserModel) {
    super();
    this.User = UserModel;
  }

  async getUsers() {
    return await this.User.find();
  }

  async getUserById(id) {
    return await this.User.findById(id);
  }

  async findOrCreateUser(userData) {
    try {
      const { firstname, lastname, email, picture, password, role, address } =
        userData;

      console.log("🏠 Repository - Données utilisateur reçues:", {
        email,
        firstname,
        lastname,
        hasPassword: !!password,
        hasPicture: !!picture,
        address: address || "Non fournie",
        role,
      });

      // Vérifier si l'utilisateur existe déjà
      let user = await this.User.findOne({ email });

      if (user) {
        // Mettre à jour l'utilisateur existant
        user.firstname = firstname;
        user.lastname = lastname;
        user.picture = picture;
        user.password = password; // Sera hashé par le middleware pre("save")
        user.role = role || "user";
        user.address = address || "";

        await user.save(); // Déclenche le middleware pre("save")
      } else {
        // Créer un nouvel utilisateur
        user = new this.User({
          firstname,
          lastname,
          email,
          picture,
          password, // Sera hashé par le middleware pre("save")
          role: role || "user",
          address: address || "",
        });

        await user.save(); // Déclenche le middleware pre("save")
      }

      console.log("✅ Repository - Utilisateur sauvegardé avec succès:", {
        _id: user._id,
        email: user.email,
        address: user.address || "Non définie",
      });

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

  async updateUserById(userId, updateData) {
    try {
      console.log("🔍 Repository: Mise à jour utilisateur avec ID:", userId);
      console.log("📝 Repository: Données à mettre à jour:", updateData);

      const user = await this.User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
      });

      if (!user) {
        return { success: false, error: "Utilisateur non trouvé" };
      }

      console.log("✅ Repository: Utilisateur mis à jour avec succès:", user);
      return { success: true, user };
    } catch (error) {
      console.error("MongooseUserRepository.updateUserById error:", error);
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

  async updateUserPassword(userId, hashedPassword) {
    try {
      const user = await this.User.findByIdAndUpdate(
        userId,
        { password: hashedPassword },
        { new: true }
      );

      if (!user) {
        return { success: false, error: "Utilisateur non trouvé" };
      }

      return { success: true, user };
    } catch (error) {
      console.error("MongooseUserRepository.updateUserPassword error:", error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = MongooseUserRepository;
