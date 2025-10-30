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

/**
 * Middleware for validating file uploads from FormData
 */
export function validateFile<T>(
  schema: ZodSchema<T>,
  fileFieldName: string = "image"
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // This middleware should be used after formidable has parsed the form
    // The parsed files will be available in req.files
    const files = (req as any).files;

    if (!files || !files[fileFieldName]) {
      res
        .status(400)
        .json(createErrorResponse(`No ${fileFieldName} file provided`));
      return;
    }

    try {
      const file = Array.isArray(files[fileFieldName])
        ? files[fileFieldName][0]
        : files[fileFieldName];

      const validatedData = schema.parse({
        mimetype: file.mimetype,
        size: file.size,
        originalFilename: file.originalFilename,
      });

      (req as any).validatedFile = validatedData;
      (req as any).uploadedFile = file;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: "File validation failed",
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
        message: "File validation error",
      });
    }
  };
}
