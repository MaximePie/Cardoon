import { ZodError } from "zod";
/**
 * Simple validation middleware without complex types
 */
export function validateBody(schema) {
    return (req, res, next) => {
        try {
            const validatedData = schema.parse(req.body);
            req.validatedBody = validatedData;
            next();
        }
        catch (error) {
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
export function validateParams(schema) {
    return (req, res, next) => {
        try {
            const validatedData = schema.parse(req.params);
            req.validatedParams = validatedData;
            next();
        }
        catch (error) {
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
export function validateQuery(schema) {
    return (req, res, next) => {
        try {
            const validatedData = schema.parse(req.query);
            req.validatedQuery = validatedData;
            next();
        }
        catch (error) {
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
export function createSuccessResponse(data, message) {
    return {
        success: true,
        ...(message && { message }),
        ...(data !== undefined && { data }),
    };
}
export function createErrorResponse(message, errors) {
    return {
        success: false,
        message,
        ...(errors && { errors }),
    };
}
/**
 * Middleware for validating file uploads from FormData
 */
export function validateFile(schema, fileFieldName = "image") {
    return (req, res, next) => {
        // This middleware should be used after formidable has parsed the form
        // The parsed files will be available in req.files
        const files = req.files;
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
            req.validatedFile = validatedData;
            req.uploadedFile = file;
            next();
        }
        catch (error) {
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
