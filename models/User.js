const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { ObjectId } = mongoose.Schema.Types;

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      trim: true,
    },
    // Champs pour Azure AD
    azureId: {
      type: String,
      sparse: true, // Index sparse pour permettre les valeurs null
      unique: true,
    },
    accessToken: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      trim: true,
    },
    refreshToken: {
      type: String,
      trim: true,
    },
    firstname: {
      type: String,
      trim: true,
    },
    lastname: {
      type: String,
      trim: true,
    },
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
    cart: {
      type: Array,
      default: [],
    },
    address: {
      type: String,
      default: "",
    },
    // wishlist: {
    //   type: Array,
    //   default: [{ type: ObjectId, ref: "Product" }],
    // },
    password: {
      type: String,
      trim: true,
      required: function () {
        return !this.googleId;
      },
      required: function () {
        // Le password n'est requis que si l'utilisateur n'a pas de azureId (authentification locale)
        return !this.azureId && !this.googleId;
      },
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Middleware pré-save pour hasher le password
// Transformation avant validation
userSchema.pre("validate", function (next) {
  if (this.lastname) {
    this.lastname = this.lastname.trim().toUpperCase();
  }
  next();
});

// Hash password avant sauvegarde
userSchema.pre("save", async function (next) {
  // Ne hasher que si le mot de passe a été modifié et n'est pas déjà hashé
  if (!this.isModified("password")) return next();

  // Vérifier si le mot de passe n'est pas déjà hashé (commence par $2a$ ou $2b$)
  if (
    this.password &&
    (this.password.startsWith("$2a$") || this.password.startsWith("$2b$"))
  ) {
    return next();
  }

  try {
    const saltRounds = 10;
    const hashed = await bcrypt.hash(this.password, saltRounds);
    this.password = hashed;
    console.log("🔐 Mot de passe hashé avec succès");
    next();
  } catch (err) {
    console.error("❌ Erreur lors du hashage du mot de passe:", err);
    next(err);
  }
});

// Méthode pour obtenir l'URL de la photo de profil
userSchema.methods.getProfilePicture = function () {
  if (this.picture) {
    return this.picture;
  }

  // Générer une photo de profil par défaut basée sur les initiales
  const initials = `${this.firstname?.charAt(0) || ""}${
    this.lastname?.charAt(0) || ""
  }`.toUpperCase();
  return `https://ui-avatars.com/api/?name=${initials}&background=random&color=fff&size=200`;
};

// Méthode pour transformer l'objet lors de la sérialisation JSON
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password; // Ne jamais retourner le password
  return user;
};

// Méthode statique pour trouver un utilisateur par email ou azureId
userSchema.statics.findByEmailOrAzure = function (email, azureId) {
  const query = {};
  if (azureId) query.azureId = azureId;
  if (email) query.email = email;

  return this.findOne({ $or: [query] });
};

const User = mongoose.model("User", userSchema);

module.exports = User;
