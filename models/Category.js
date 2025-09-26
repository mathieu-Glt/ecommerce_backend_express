const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

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
