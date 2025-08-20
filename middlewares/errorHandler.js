// Middleware pour gérer les erreurs de manière centralisée
const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Erreurs de validation Mongoose
  if (err.name === "ValidationError") {
    return res.status(400).json({
      status: "error",
      message: "Validation Error",
      errors: Object.values(err.errors).map((e) => e.message),
    });
  }

  // Erreurs de duplication (unique constraint)
  if (err.code === 11000) {
    return res.status(400).json({
      status: "error",
      message: "Duplicate field value entered",
    });
  }

  // Erreurs de cast (ObjectId invalide)
  if (err.name === "CastError") {
    return res.status(400).json({
      status: "error",
      message: "Invalid ID format",
    });
  }

  // Erreur par défaut
  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
};

// Wrapper pour les contrôleurs async
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { errorHandler, asyncHandler };
