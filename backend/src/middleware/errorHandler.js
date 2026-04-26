// Maps known runtime errors into consistent API error responses.
const { ZodError } = require("zod");
const jwt = require("jsonwebtoken");
const multer = require("multer");

function errorHandler(err, _req, res, _next) {
  if (err?.code === "P2002") {
    return res.status(409).json({
      success: false,
      message: "Already exists"
    });
  }

  if (err?.code === "P2025") {
    return res.status(404).json({
      success: false,
      message: "Not found"
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: err.errors.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message
      }))
    });
  }

  if (err instanceof jwt.JsonWebTokenError || err instanceof jwt.TokenExpiredError) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }

  if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      success: false,
      message: "File too large (max 5MB)"
    });
  }

  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error"
  });
}

module.exports = errorHandler;
