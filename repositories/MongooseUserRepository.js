const IUserRepository = require("./IUserRepository");

/**
 * Mongoose-based implementation of the User Repository.
 *
 * This class handles all user-related database operations using
 * a Mongoose model. It extends the IUserRepository abstraction
 * to ensure the service layer does not depend on the database implementation.
 */
class MongooseUserRepository extends IUserRepository {
  /**
   * @param {mongoose.Model} UserModel - Mongoose User model
   */
  constructor(UserModel) {
    super();
    this.User = UserModel;
  }

  /**
   * Retrieve all users from the database.
   * @returns {Promise<Array>} Array of user documents
   */
  async getUsers() {
    return await this.User.find();
  }

  /**
   * Find a user by their unique ID.
   * @param {string} id - Mongoose ObjectId of the user
   * @returns {Promise<Object>} User document
   */
  async getUserById(id) {
    return await this.User.findById(id);
  }

  /**
   * Find a user by email or create a new one if not found.
   * Updates existing user if they already exist.
   * @param {Object} userData - User data (firstname, lastname, email, picture, password, role, address)
   * @returns {Promise<Object>} Success status and user document or error
   */
  async findOrCreateUser(userData) {
    try {
      const { firstname, lastname, email, picture, password, role, address } =
        userData;

      console.log("Repository - Received user data:", {
        email,
        firstname,
        lastname,
        hasPassword: !!password,
        hasPicture: !!picture,
        address: address || "Not provided",
        role,
      });

      // Check if user exists
      let user = await this.User.findOne({ email });

      if (user) {
        // Update existing user
        user.firstname = firstname;
        user.lastname = lastname;
        user.picture = picture;
        user.password = password; // will be hashed by pre("save") middleware
        user.role = role || "user";
        user.address = address || "";

        await user.save(); // triggers pre("save") middleware
      } else {
        // Create new user
        user = new this.User({
          firstname,
          lastname,
          email,
          picture,
          password,
          role: role || "user",
          address: address || "",
        });

        await user.save(); // triggers pre("save") middleware
      }

      console.log(" Repository - User saved successfully:", {
        _id: user._id,
        email: user.email,
        address: user.address || "Undefined",
      });

      return { success: true, user };
    } catch (error) {
      console.error("MongooseUserRepository.findOrCreateUser error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update a user by email.
   * @param {string} email - User email
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object>} Updated user or error
   */
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

  /**
   * Update a user by their unique ID.
   * @param {string} userId - User ID
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object>} Updated user or error
   */
  async updateUserById(userId, updateData) {
    try {
      console.log(" Repository: Updating user with ID:", userId);
      console.log(" Repository: Update data:", updateData);

      const user = await this.User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
      });

      if (!user) {
        return { success: false, error: "User not found" };
      }

      console.log(" Repository: User updated successfully:", user);
      return { success: true, user };
    } catch (error) {
      console.error("MongooseUserRepository.updateUserById error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Find a user by their email address.
   * @param {string} email - User email
   * @returns {Promise<Object>} User document or error
   */
  async getUserByEmail(email) {
    try {
      const user = await this.User.findOne({ email });
      return { success: true, user };
    } catch (error) {
      console.error("MongooseUserRepository.getUserByEmail error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Find a user by their ID (alternative method).
   * @param {string} id - User ID
   * @returns {Promise<Object>} User document or error
   */
  async findUserById(id) {
    try {
      const user = await this.User.findById(id);
      return { success: true, user };
    } catch (error) {
      console.error("MongooseUserRepository.findUserById error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a user by their email address.
   * @param {string} email - User email
   * @returns {Promise<Object>} Success status or error
   */
  async deleteUser(email) {
    try {
      const result = await this.User.findOneAndDelete({ email });
      return { success: true, deleted: !!result };
    } catch (error) {
      console.error("MongooseUserRepository.deleteUser error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update a user's password.
   * @param {string} userId - User ID
   * @param {string} hashedPassword - Already hashed password
   * @returns {Promise<Object>} Updated user or error
   */
  async updateUserPassword(userId, hashedPassword) {
    try {
      const user = await this.User.findByIdAndUpdate(
        userId,
        { password: hashedPassword },
        { new: true }
      );

      if (!user) {
        return { success: false, error: "User not found" };
      }

      return { success: true, user };
    } catch (error) {
      console.error("MongooseUserRepository.updateUserPassword error:", error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = MongooseUserRepository;
