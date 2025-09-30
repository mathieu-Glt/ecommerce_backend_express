const express = require("express");
const router = express.Router();

// Controllers
const {
  createSub,
  getSubs,
  getSubBySlug,
  updateSub,
  deleteSub,
} = require("../controllers/sub.controllers");

// Middlewares
const { requireRole } = require("../middleware/auth");

/**
 * Sub Routes
 *
 * Handles CRUD operations for subcategories (subs).
 * Includes public endpoints for viewing subs and
 * protected endpoints restricted to admin users
 * for creating, updating, and deleting subs.
 *
 * @module routes/subRoutes
 */

/**
 * @route GET /subs
 * @desc Get a list of all subs
 * @access Public
 */
router.get("/subs", getSubs);

/**
 * @route GET /sub/:slug
 * @desc Get sub details by slug
 * @access Public
 */
router.get("/sub/:slug", getSubBySlug);

/**
 * @route POST /sub
 * @desc Create a new sub
 * @access Protected (Admin only)
 * @middleware requireRole(["admin"])
 */
router.post("/sub", requireRole(["admin"]), createSub);

/**
 * @route PUT /sub/:slug
 * @desc Update an existing sub by slug
 * @access Protected (Admin only)
 * @middleware requireRole(["admin"])
 */
router.put("/sub/:slug", requireRole(["admin"]), updateSub);

/**
 * @route DELETE /sub/:slug
 * @desc Delete a sub by slug
 * @access Protected (Admin only)
 * @middleware requireRole(["admin"])
 */
router.delete("/sub/:slug", requireRole(["admin"]), deleteSub);

module.exports = router;
