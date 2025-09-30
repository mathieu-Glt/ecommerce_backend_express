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

/**
 * Category Routes
 *
 * Handles CRUD operations for categories.
 * Includes both public endpoints (view categories)
 * and protected endpoints restricted to admin users
 * (create, update, delete).
 *
 * @module routes/categoryRoutes
 */

/**
 * @route GET /categories
 * @desc Get a list of all categories
 * @access Public
 */
router.get("/categories", getCategories);

/**
 * @route GET /category/slug/:slug
 * @desc Get category details by slug
 * @access Public
 */
router.get("/category/slug/:slug", getCategoryBySlug);

/**
 * @route GET /category/id/:id
 * @desc Get category details by ID
 * @access Public
 */
router.get("/category/id/:id", getCategoryById);

/**
 * @route POST /category
 * @desc Create a new category
 * @access Protected (Admin only)
 * @middleware requireRole(["admin"])
 */
router.post("/category", requireRole(["admin"]), createCategory);

/**
 * @route PUT /category/:id
 * @desc Update an existing category by ID
 * @access Protected (Admin only)
 * @middleware requireRole(["admin"])
 */
router.put("/category/:id", requireRole(["admin"]), updateCategory);

/**
 * @route DELETE /category/:id
 * @desc Delete a category by ID
 * @access Protected (Admin only)
 * @middleware requireRole(["admin"])
 */
router.delete("/category/:id", requireRole(["admin"]), deleteCategory);

module.exports = router;
