// Middleware for centralized error handling
const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Mongoose validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      status: "error",
      message: "Validation Error",
      errors: Object.values(err.errors).map((e) => e.message),
    });
  }

  // Duplication errors (unique constraint)
  if (err.code === 11000) {
    return res.status(400).json({
      status: "error",
      message: "Duplicate field value entered",
    });
  }

  // Cast errors (Invalid ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({
      status: "error",
      message: "Invalid ID format",
    });
  }

  // Error by default
  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
};

// Wrapper for asynchronous controllers
// A wrapper for asynchronous controllers eliminates the need for repeated try-catch statements in all controller functions.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { errorHandler, asyncHandler };
