const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

/**
 * Category Schema
 *
 * Represents a product category in the system. Supports unique naming,
 * slug generation, and relationships to sub-categories.
 *
 * @typedef {Object} Category
 * @property {string} name - Name of the category (required, 3-32 characters, unique)
 * @property {string} slug - URL-friendly identifier for the category (unique, lowercased, indexed)
 * @property {Array<ObjectId>} subs - References to Sub-category documents
 * @property {Date} createdAt - Auto-generated creation timestamp
 * @property {Date} updatedAt - Auto-generated update timestamp
 */
const categorySchema = new mongoose.Schema(
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
    subs: [{ type: ObjectId, ref: "Sub" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
