"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errors_1 = require("../errors");
const errorHandler = (err, req, res, next) => {
  console.error("Error caught by errorHandler:", {
    name: err.name,
    message: err.message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
  // Handle ValidationError (from Zod or custom)
  if (
    err instanceof errors_1.ValidationError ||
    err.name === "ValidationError"
  ) {
    return res.status(400).json({
      success: false,
      message: err.message,
      error: "Validation failed",
    });
  }
  // Handle NotFoundError
  if (err instanceof errors_1.NotFoundError) {
    return res.status(404).json({
      success: false,
      message: err.message,
      error: "Resource not found",
    });
  }
  // Handle AppError
  if (err instanceof errors_1.AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: err.name,
    });
  }
  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
      error: "Authentication failed",
    });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
      error: "Authentication failed",
    });
  }
  // Handle MongoDB errors
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format",
      error: "Bad request",
    });
  }
  // Default error (500)
  return res.status(500).json({
    success: false,
    message: "An unexpected error occurred",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
exports.errorHandler = errorHandler;
