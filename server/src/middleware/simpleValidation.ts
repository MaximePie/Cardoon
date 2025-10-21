import { NextFunction, Request, Response } from "express";
import { ZodError, ZodSchema } from "zod";

/**
 * Simple validation middleware without complex types
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.body);
      (req as any).validatedBody = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
            code: err.code,
          })),
        });
        return;
      }
      res.status(500).json({
        success: false,
        message: "Validation error",
      });
    }
  };
}

export function validateParams<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.params);
      (req as any).validatedParams = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: "Invalid parameters",
          errors: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
            code: err.code,
          })),
        });
        return;
      }
      res.status(500).json({
        success: false,
        message: "Validation error",
      });
    }
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.query);
      (req as any).validatedQuery = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: "Invalid query parameters",
          errors: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
            code: err.code,
          })),
        });
        return;
      }
      res.status(500).json({
        success: false,
        message: "Validation error",
      });
    }
  };
}

// Helper functions for responses
export function createSuccessResponse<T>(data?: T, message?: string) {
  return {
    success: true,
    ...(message && { message }),
    ...(data !== undefined && { data }),
  };
}

export function createErrorResponse(message: string, errors?: any[]) {
  return {
    success: false,
    message,
    ...(errors && { errors }),
  };
}
