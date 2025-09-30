/**
 * Sub Controller
 *
 * Handles all sub-category (sub) related operations:
 * - Retrieve all subs
 * - Retrieve a sub by slug
 * - Create new subs
 * - Update existing subs
 * - Delete subs
 *
 * @module controllers/sub.controller
 */

const { asyncHandler } = require("../utils/errorHandler");
const SubServiceFactory = require("../factories/subServiceFactory");

// Create sub service based on database type (mongoose or mysql)
const subService = SubServiceFactory.createSubService(
  process.env.DATABASE_TYPE || "mongoose"
);

/**
 * Get all sub-categories
 *
 * @route GET /subs
 * @access Public
 * @returns {Array} 200 - List of all subs
 * @returns {Object} 404 - No subs found
 */
exports.getSubs = asyncHandler(async (req, res) => {
  try {
    const subs = await subService.getSubs();
    if (!subs) {
      return res.status(404).json({ message: "No sub-categories found" });
    }
    res.status(200).json(subs);
  } catch (error) {
    console.error("Error in getSubs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Get a sub by slug
 *
 * @route GET /sub/:slug
 * @access Public
 * @param {string} slug - Sub slug
 * @returns {Object} 200 - Sub details
 * @returns {Object} 404 - Sub not found
 */
exports.getSubBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const sub = await subService.getSubBySlug(slug);
  if (!sub) {
    return res.status(404).json({ message: "Sub not found" });
  }
  res.status(200).json(sub);
});

/**
 * Create a new sub-category
 *
 * @route POST /sub
 * @access Admin
 * @param {Object} body - Sub data
 * @returns {Object} 201 - Created sub
 * @returns {Object} 400 - Failed to create sub
 */
exports.createSub = asyncHandler(async (req, res) => {
  try {
    const sub = await subService.createSub(req.body);
    if (!sub) {
      return res.status(400).json({ message: "Failed to create sub" });
    }
    res.status(201).json(sub);
  } catch (error) {
    console.error("Error creating sub:", error.message);
    res.status(400).json({ 
      status: "error", 
      message: error.message || "Failed to create sub-category" 
    });
  }
});

/**
 * Update an existing sub-category
 *
 * @route PUT /sub/:slug
 * @access Admin
 * @param {string} slug - Sub slug
 * @param {Object} body - Updated sub data
 * @returns {Object} 200 - Updated sub
 * @returns {Object} 400 - Failed to update sub
 */
exports.updateSub = asyncHandler(async (req, res) => {
  try {
    const { slug } = req.params;
    const sub = await subService.updateSub(slug, req.body);
    if (!sub) {
      return res.status(400).json({ message: "Failed to update sub" });
    }
    res.status(200).json(sub);
  } catch (error) {
    console.error("Error updating sub:", error.message);
    res.status(400).json({ 
      status: "error", 
      message: error.message || "Failed to update sub-category" 
    });
  }
});

/**
 * Delete a sub-category
 *
 * @route DELETE /sub/:slug
 * @access Admin
 * @param {string} slug - Sub slug
 * @returns {Object} 204 - Sub deleted successfully
 * @returns {Object} 400 - Failed to delete sub
 */
exports.deleteSub = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const sub = await subService.deleteSub(slug);
  if (!sub) {
    return res.status(400).json({ message: "Failed to delete sub" });
  }
  res.status(204).send();
});
