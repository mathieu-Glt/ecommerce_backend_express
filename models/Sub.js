const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const subSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: "Name is required",
      maxlength: [32, "Name must be less than 32 characters long"],
      minlength: [3, "Name must be at least 3 characters long"],
      unique: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    parent: { type: ObjectId, ref: "Category", required: true },
  },
  { timestamps: true }
);

// Méthode virtuelle pour obtenir la catégorie parente
subSchema.virtual("category", {
  ref: "Category",
  localField: "parent",
  foreignField: "_id",
  justOne: true,
});

// Activer les virtuals lors de la sérialisation
subSchema.set("toJSON", { virtuals: true });
subSchema.set("toObject", { virtuals: true });

// Hook pre-save pour mettre à jour la relation inverse
subSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("parent")) {
    const Category = mongoose.model("Category");

    // Si c'est une nouvelle sous-catégorie ou si le parent a changé
    if (this.isNew) {
      // Ajouter cette sous-catégorie à la liste des subs de la catégorie parente
      await Category.findByIdAndUpdate(this.parent, {
        $addToSet: { subs: this._id },
      });
    } else {
      // Si le parent a changé, retirer de l'ancien parent et ajouter au nouveau
      const oldDoc = await this.constructor.findById(this._id);
      if (oldDoc && oldDoc.parent.toString() !== this.parent.toString()) {
        await Category.findByIdAndUpdate(oldDoc.parent, {
          $pull: { subs: this._id },
        });
        await Category.findByIdAndUpdate(this.parent, {
          $addToSet: { subs: this._id },
        });
      }
    }
  }
  next();
});

// Hook pre-remove pour nettoyer la relation inverse
subSchema.pre("remove", async function (next) {
  const Category = mongoose.model("Category");
  await Category.findByIdAndUpdate(this.parent, { $pull: { subs: this._id } });
  next();
});

module.exports = mongoose.model("Sub", subSchema);
