const express = require("express");
const router = express.Router();
// Middlewares
const { requireRole } = require("../middleware/auth");

// Controllers
const {
  createCategory,
  getCategories,
  getCategoryBySlug,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/category.controllers");

// Endpoints public
router.get("/categories", getCategories);
router.get("/category/slug/:slug", getCategoryBySlug);
router.get("/category/id/:id", getCategoryById);

// Endpoints protected - Admin only
router.post("/category", requireRole(["admin"]), createCategory);
router.put("/category/:id", requireRole(["admin"]), updateCategory);
router.delete("/category/:id", requireRole(["admin"]), deleteCategory);

module.exports = router;
