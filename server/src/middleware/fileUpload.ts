import { NextFunction, Request, Response } from "express";
import { IncomingForm } from "formidable";
import { ZodError, ZodSchema } from "zod";
import { createErrorResponse } from "./simpleValidation.js";

/**
 * Middleware for handling file uploads with validation
 */
export function validateImageUpload<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const form = new IncomingForm({
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
      allowEmptyFiles: false,
    });

    form.parse(req, async (err: any, fields: any, files: any) => {
      if (err) {
        console.error("Error parsing form:", err);
        res.status(400).json(createErrorResponse("Error parsing form data"));
        return;
      }

      try {
        // Extract the image file
        const image = Array.isArray(files.image) ? files.image[0] : files.image;

        if (!image) {
          res.status(400).json(createErrorResponse("No image file provided"));
          return;
        }

        // Validate the file using the provided Zod schema
        const validatedFile = schema.parse({
          mimetype: image.mimetype,
          size: image.size,
          originalFilename: image.originalFilename,
        });

        // Attach validated data and file to request
        (req as any).validatedFile = validatedFile;
        (req as any).uploadedFile = image;
        (req as any).formFields = fields;

        next();
      } catch (validationError) {
        if (validationError instanceof ZodError) {
          res.status(400).json({
            success: false,
            message: "File validation failed",
            errors: validationError.errors.map((err) => ({
              field: err.path.join("."),
              message: err.message,
              code: err.code,
            })),
          });
          return;
        }

        console.error("Unexpected validation error:", validationError);
        res.status(500).json(createErrorResponse("File validation error"));
      }
    });
  };
}
