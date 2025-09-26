const { body, validationResult } = require("express-validator");

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
