const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { ObjectId } = mongoose.Schema.Types;

/**
 * User Schema
 *
 * Represents a user in the system. Supports local authentication,
 * Google OAuth, and Azure AD authentication. Handles password hashing,
 * profile picture generation, and data serialization.
 *
 * @typedef {Object} User
 * @property {string} googleId - Google OAuth ID (optional).
 * @property {string} azureId - Azure AD ID (optional, unique, sparse).
 * @property {string} accessToken - OAuth access token (optional).
 * @property {string} avatar - User avatar URL (optional).
 * @property {string} refreshToken - OAuth refresh token (optional).
 * @property {string} firstname - First name of the user.
 * @property {string} lastname - Last name of the user (automatically uppercased before validation).
 * @property {string} picture - Profile picture URL (required if googleId exists).
 * @property {string} email - Unique email address (required).
 * @property {Array} cart - User's shopping cart items.
 * @property {string} address - User's address.
 * @property {string} password - Hashed password (required for local authentication).
 * @property {string} role - User role, either 'admin' or 'user'. Default is 'user'.
 * @property {boolean} isActive - Indicates if the user is active. Default is false.
 * @property {Date} createdAt - Auto-generated timestamp.
 * @property {Date} updatedAt - Auto-generated timestamp.
 */
const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, trim: true },
    azureId: { type: String, sparse: true, unique: true },
    accessToken: { type: String, trim: true },
    avatar: { type: String, trim: true },
    refreshToken: { type: String, trim: true },
    firstname: { type: String, trim: true },
    lastname: { type: String, trim: true },
    picture: {
      type: String,
      required: function () {
        return !!this.googleId;
      },
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    cart: { type: Array, default: [] },
    address: { type: String, default: "" },
    password: {
      type: String,
      trim: true,
      required: function () {
        return !this.azureId && !this.googleId;
      },
    },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

/**
 * Middleware: Pre-validate
 * - Uppercases the lastname before validation
 */
userSchema.pre("validate", function (next) {
  if (this.lastname) this.lastname = this.lastname.trim().toUpperCase();
  next();
});

/**
 * Middleware: Pre-save
 * - Hashes the password if modified and not already hashed
 */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  if (
    this.password &&
    (this.password.startsWith("$2a$") || this.password.startsWith("$2b$"))
  )
    return next();

  try {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
    console.log("🔐 Mot de passe hashé avec succès");
    next();
  } catch (err) {
    console.error("❌ Erreur lors du hashage du mot de passe:", err);
    next(err);
  }
});

/**
 * Instance method: getProfilePicture
 * - Returns the profile picture URL
 * - Generates a default avatar with initials if picture is not set
 * @returns {string} URL of the profile picture
 */
userSchema.methods.getProfilePicture = function () {
  if (this.picture) return this.picture;
  const initials = `${this.firstname?.charAt(0) || ""}${
    this.lastname?.charAt(0) || ""
  }`.toUpperCase();
  return `https://ui-avatars.com/api/?name=${initials}&background=random&color=fff&size=200`;
};

/**
 * Instance method: toJSON
 * - Transforms the object for JSON serialization
 * - Removes sensitive fields such as password
 * @returns {Object} Serialized user object
 */
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

/**
 * Static method: findByEmailOrAzure
 * - Find a user by email or Azure ID
 * @param {string} email - Email of the user
 * @param {string} azureId - Azure AD ID of the user
 * @returns {Promise<User|null>} User document or null if not found
 */
userSchema.statics.findByEmailOrAzure = function (email, azureId) {
  const query = {};
  if (azureId) query.azureId = azureId;
  if (email) query.email = email;
  return this.findOne({ $or: [query] });
};

const User = mongoose.model("User", userSchema);

module.exports = User;
