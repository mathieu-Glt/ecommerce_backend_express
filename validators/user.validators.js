/**
 * @file user.validators.js
 * @description
 * This module defines validation middleware for user-related routes using `express-validator`.
 *
 * It provides reusable validators for:
 *  - Creating or updating a user
 *  - Updating a user's profile
 *  - Fetching a user's profile
 *  - Deleting a user
 *
 * Each validator is an array of validation rules applied to request parameters or body,
 * followed by the `handleValidationErrors` middleware which checks for validation errors
 * and returns a structured JSON response if any errors are found.
 *
 * Error response format:
 * {
 *   success: false,
 *   errors: [
 *     { field: "fieldName", message: "Validation error message" },
 *     ...
 *   ]
 * }
 *
 * Validators:
 * 1. createOrUpdateUserValidation
 *    - Validates body fields for creating/updating a user:
 *      - `name` (optional): 2-50 characters, trimmed
 *      - `lastname` (optional): 2-50 characters, trimmed
 *      - `email` (required): valid email, normalized
 *
 * 2. updateUserProfileValidation
 *    - Validates URL param and body fields when updating a user's profile:
 *      - `email` (param, required): valid email in URL
 *      - `name` (optional body field): 2-50 characters, trimmed
 *      - `role` (optional body field): must be either "user" or "admin"
 *
 * 3. getUserProfileValidation
 *    - Validates URL param when fetching a user's profile:
 *      - `email` (param, required): valid email in URL
 *
 * 4. deleteUserValidation
 *    - Validates URL param when deleting a user:
 *      - `email` (param, required): valid email in URL
 *
 * Middleware:
 * - handleValidationErrors
 *    - Checks if validation errors exist
 *    - Returns 400 response with formatted error messages if validation fails
 *    - Calls `next()` if no errors
 */

const { body, param, validationResult } = require("express-validator");

/**
 * Middleware to handle validation errors
 * Checks if there are validation errors.
 * If errors exist, sends a 400 response with a list of error messages.
 * Otherwise, calls next() to execute process.
 */
const    handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
      })),
    });
  }
  next();
};

/**
 * Validation rules for creating or updating a user
 *
 * - `name`: optional, trimmed, must be 2-50 characters
 * - `lastname`: optional, trimmed, must be 2-50 characters
 * - `email`: required, must be a valid email, normalized
 * - Handles errors using `handleValidationErrors` middleware
 */
const createOrUpdateUserValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Firstname must be between 2 and 50 characters"),
  body("lastname")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Lastname must be between 2 and 50 characters"),
  body("email").isEmail().withMessage("Email invalid").normalizeEmail(),
  // body("role")
  //   .optional()
  //   .isIn(["user", "admin"])
  //   .withMessage('Role must be "user" or "admin"'),
  handleValidationErrors,
];

/**
 * Validation rules for updating a user's profile
 *
 * - `email` (URL param): must be a valid email
 * - `name`: optional, trimmed, must be 2-50 characters
 * - `role`: optional, must be either "user" or "admin"
 * - Handles errors using `handleValidationErrors` middleware
 */
const updateUserProfileValidation = [
  param("email").isEmail().withMessage("Email invalid in URL"),
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Firstname must be between 2 and 50 characters"),
  body("role")
    .optional()
    .isIn(["user", "admin"])
    .withMessage('Role must be "user" or "admin"'),
  handleValidationErrors,
];

/**
 * Validation rules for fetching a user's profile
 *
 * - `email` (URL param): must be a valid email
 * - Handles errors using `handleValidationErrors` middleware
 */
const getUserProfileValidation = [
  param("email").isEmail().withMessage("Email invalid in URL"),
  handleValidationErrors,
];

/**
 * Validation rules for deleting a user
 *
 * - `email` (URL param): must be a valid email
 * - Handles errors using `handleValidationErrors` middleware
 */
const deleteUserValidation = [
  param("email").isEmail().withMessage("Email invalid in URL"),
  handleValidationErrors,
];

module.exports = {
  createOrUpdateUserValidation,
  updateUserProfileValidation,
  getUserProfileValidation,
  deleteUserValidation,
  handleValidationErrors,
};
