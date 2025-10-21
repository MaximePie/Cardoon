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
