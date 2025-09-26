const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
      maxlength: 32,
      text: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    price: {
      type: Number,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
      text: true,
    },
    category: {
      type: ObjectId,
      ref: "Category",
      required: true,
    },
    sub: {
      type: ObjectId,
      ref: "Sub",
      required: true,
    },
    quantity: Number,
    sold: {
      type: Number,
      default: 0,
    },
    images: {
      type: Array,
    },
    shipping: {
      type: String,
      enum: ["Yes", "No"],
    },
    color: {
      type: String,
      enum: ["Black", "Brown", "Silver", "Blue", "White", "Green"],
    },
    brand: {
      type: String,
      enum: [
        "Apple",
        "Samsung",
        "Microsoft",
        "Lenovo",
        "Asus",
        "Dell",
        "HP",
        "Acer",
      ],
    },
    // ratings: [
    //   {
    //     star: Number,
    //     postedBy: {
    //       type: ObjectId,
    //       ref: "User",
    //     },
    //   },
    // ],
  },
  { timestamps: true }
);

// Méthodes virtuelles pour faciliter l'accès aux relations
productSchema.virtual("categoryInfo", {
  ref: "Category",
  localField: "category",
  foreignField: "_id",
  justOne: true,
});

productSchema.virtual("subInfo", {
  ref: "Sub",
  localField: "sub",
  foreignField: "_id",
  justOne: true,
});

// Activer les virtuals lors de la sérialisation
productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

// Hook pre-save pour valider la cohérence des relations
productSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("category") || this.isModified("sub")) {
    const Category = mongoose.model("Category");
    const Sub = mongoose.model("Sub");

    try {
      // Vérifier que la catégorie existe
      const category = await Category.findById(this.category);
      if (!category) {
        throw new Error(`Catégorie avec l'ID ${this.category} n'existe pas`);
      }

      // Vérifier que la sous-catégorie existe
      const sub = await Sub.findById(this.sub);
      if (!sub) {
        throw new Error(`Sous-catégorie avec l'ID ${this.sub} n'existe pas`);
      }

      // Vérifier que la sous-catégorie appartient bien à la catégorie
      if (sub.parent.toString() !== this.category.toString()) {
        throw new Error(
          `La sous-catégorie "${sub.name}" n'appartient pas à la catégorie "${category.name}"`
        );
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Hook pre-remove pour nettoyer les références si nécessaire
productSchema.pre("remove", async function (next) {
  // Ici vous pourriez ajouter du code pour nettoyer d'autres références
  // Par exemple, supprimer les avis, les commandes, etc.
  next();
});

module.exports = mongoose.model("Product", productSchema);
