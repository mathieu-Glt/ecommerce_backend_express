const { body, param, validationResult } = require("express-validator");

// Middleware pour gérer les erreurs de validation
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

// Validateurs pour les opérations utilisateur
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

const getUserProfileValidation = [
  param("email").isEmail().withMessage("Email invalid in URL"),
  handleValidationErrors,
];

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
