const express = require("express");
const router = express.Router();

// Controllers
const {
  createCategory,
  getCategories,
  getCategoryBySlug,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/category.controllers");

// Middlewares

// Routes publiques
router.get("/categories", getCategories);
router.get("/category/slug/:slug", getCategoryBySlug);
router.get("/category/id/:id", getCategoryById);
router.post("/category", createCategory);
router.put("/category/:id", updateCategory);
router.delete("/category/:id", deleteCategory);

module.exports = router;
