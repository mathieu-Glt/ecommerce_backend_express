const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

/**
 * SubCategory Schema
 *
 * Represents a sub-category in the system. Each sub-category belongs to a parent category
 * and maintains a reference to it. The schema automatically updates the parent category
 * to include or remove this sub-category when created, updated, or deleted.
 *
 * @typedef {Object} Sub
 * @property {string} name - Name of the sub-category (required, unique, 3-32 characters)
 * @property {string} slug - Unique slug for the sub-category (lowercase, indexed)
 * @property {ObjectId} parent - Reference to the parent Category (required)
 * @property {Category} category - Virtual field populated with the parent category
 * @property {Date} createdAt - Auto-generated timestamp
 * @property {Date} updatedAt - Auto-generated timestamp
 */
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

/**
 * Virtual field: category
 * - Populates the parent category
 */
subSchema.virtual("category", {
  ref: "Category",
  localField: "parent",
  foreignField: "_id",
  justOne: true,
});

// Enable virtuals when serializing
subSchema.set("toJSON", { virtuals: true });
subSchema.set("toObject", { virtuals: true });

/**
 * Pre-save hook
 * - Updates the parent category's `subs` array when a sub-category is created
 *   or its parent changes.
 */
subSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("parent")) {
    const Category = mongoose.model("Category");

    if (this.isNew) {
      await Category.findByIdAndUpdate(this.parent, {
        $addToSet: { subs: this._id },
      });
    } else {
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

/**
 * Pre-remove hook
 * - Removes this sub-category from the parent category's `subs` array when deleted
 */
subSchema.pre("remove", async function (next) {
  const Category = mongoose.model("Category");
  await Category.findByIdAndUpdate(this.parent, { $pull: { subs: this._id } });
  next();
});

module.exports = mongoose.model("Sub", subSchema);
