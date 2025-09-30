/**
 * @file auth.validators.js
 * @description
 * This module defines validation middleware for authentication-related routes
 * using the `express-validator` library.
 *
 * It includes reusable validators for:
 *  - User login
 *  - User registration
 *  - Password reset (requesting reset by email)
 *  - Password reset with token (setting a new password)
 *
 * Each validator is an array of validation rules applied to incoming requests,
 * followed by a middleware (`handleValidationErrors`) that returns a structured
 * JSON response if validation fails.
 *
 * The response format for failed validation is:
 * {
 *   success: false,
 *   errors: [
 *     { field: "fieldName", message: "Validation error message" },
 *     ...
 *   ]
 * }
 *
 * Exports:
 *  - loginValidation: Validates email and password for login.
 *  - registerValidation: Validates firstname, lastname, email, and password for registration.
 *  - resetPasswordValidation: Validates email for requesting a password reset.
 *  - resetPasswordTokenValidation: Validates the new password format when resetting with a token.
 *  - handleValidationErrors: Middleware to handle and format validation errors.
 */

const { body, validationResult } = require("express-validator");

// Middleware to handle validation errors from express-validator.
// It checks if the request has any validation errors and, if so,
// returns a 400 Bad Request response with a structured JSON containing
// the field names and corresponding error messages.
// If no validation errors are found, it calls `next()` to proceed to the next middleware.

const handleValidationErrors = (req, res, next) => {
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

// Validateurs pour l'authentification
const loginValidation = [
  body("email").isEmail().withMessage("Email invalid").normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  handleValidationErrors,
];

const registerValidation = [
  body("firstname")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Firstname must be between 2 and 50 characters"),
  body("lastname")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Lastname must be between 2 and 50 characters"),
  body("email").isEmail().withMessage("Email invalid").normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one lowercase letter, one uppercase letter and one number"
    ),
  handleValidationErrors,
];

const resetPasswordValidation = [
  body("email").isEmail().withMessage("Email invalid").normalizeEmail(),
  handleValidationErrors,
];

const resetPasswordTokenValidation = [
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one lowercase letter, one uppercase letter and one number"
    ),
  handleValidationErrors,
];

module.exports = {
  loginValidation,
  registerValidation,
  resetPasswordValidation,
  resetPasswordTokenValidation,
  handleValidationErrors,
};
