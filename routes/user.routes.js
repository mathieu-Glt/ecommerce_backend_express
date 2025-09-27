const express = require("express");
// Create a new router instance
const router = express.Router();

// Controller's methods for user management
const {
  getUsers,
  getUserByEmail,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/user.controllers");

const { requireRole } = require("../middleware/auth");

const {
  updateUserProfileValidation,
} = require("../validators/user.validators");
/**
 * User Management Routes
 *
 * All routes in this file are protected and restricted to users
 * with the `admin` role only. Each endpoint interacts with the
 * UserController to perform CRUD operations on users.
 *
 * @module routes/userRoutes
 */

/**
 * GET /api/users
 * Retrieve a list of all users.
 *
 * @access Admin only
 * @middleware requireRole(["admin"])
 * @returns {Array<Object>} 200 - List of user objects
 * @returns {Error} 403 - Forbidden (if not admin)
 */
router.get("/users", requireRole(["admin"]), getUsers);

/**
 * GET /api/user/:email
 * Retrieve a single user by their email address.
 *
 * @access Admin only
 * @middleware requireRole(["admin"])
 * @param {string} email - The email of the user to fetch
 * @returns {Object} 200 - User object
 * @returns {Error} 404 - User not found
 * @returns {Error} 403 - Forbidden (if not admin)
 */
router.get("/user/:email", requireRole(["admin"]), getUserByEmail);

/**
 * GET /api/users/:id
 * Retrieve a single user by their unique ID.
 *
 * @access Admin only
 * @middleware requireRole(["admin"])
 * @param {string} id - The ID of the user to fetch
 * @returns {Object} 200 - User object
 * @returns {Error} 404 - User not found
 * @returns {Error} 403 - Forbidden (if not admin)
 */
router.get("/users/:id", requireRole(["admin"]), getUserById);

/**
 * PUT /api/user/:id
 * Update a user by their unique ID.
 *
 * @access Admin only
 * @middleware requireRole(["admin"])
 * @param {string} id - The ID of the user to update
 * @body {Object} updateData - Fields to update (e.g., name, role, etc.)
 * @returns {Object} 200 - Updated user object
 * @returns {Error} 400 - Invalid input
 * @returns {Error} 404 - User not found
 * @returns {Error} 403 - Forbidden (if not admin)
 */
router.put(
  "/user/:id",
  requireRole(["admin"]),
  updateUserProfileValidation,
  updateUser
);

/**
 * DELETE /api/user/:id
 * Delete a user by their unique ID.
 *
 * @access Admin only
 * @middleware requireRole(["admin"])
 * @param {string} id - The ID of the user to delete
 * @returns {Object} 200 - Success message
 * @returns {Error} 404 - User not found
 * @returns {Error} 403 - Forbidden (if not admin)
 */
router.delete("/user/:id", requireRole(["admin"]), deleteUser);

module.exports = router;
