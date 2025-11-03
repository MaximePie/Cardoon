"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validation = void 0;
exports.validateRequest = validateRequest;
exports.asyncValidation = asyncValidation;
exports.customValidation = customValidation;
exports.sanitizeInput = sanitizeInput;
exports.logValidation = logValidation;
exports.createValidationError = createValidationError;
exports.createSuccessResponse = createSuccessResponse;
const zod_1 = require("zod");
/**
 * Create validation middleware for request validation
 * @param schema - Zod schema to validate against
 * @param target - Which part of the request to validate (body, query, params)
 * @param options - Additional validation options
 */
function validateRequest(schema, target = "body", options = {}) {
    const { stripUnknown = true, allowUnknown = false, transform = true, } = options;
    return (req, res, next) => {
        try {
            // Get the data to validate based on target
            let dataToValidate;
            switch (target) {
                case "body":
                    dataToValidate = req.body;
                    break;
                case "query":
                    dataToValidate = req.query;
                    break;
                case "params":
                    dataToValidate = req.params;
                    break;
                default:
                    dataToValidate = req.body;
            }
            // Perform validation (removed strict/passthrough for compatibility)
            const result = schema.parse(dataToValidate);
            // Store validated data in request object
            switch (target) {
                case "body":
                    req.validatedBody = result;
                    break;
                case "query":
                    req.validatedQuery = result;
                    break;
                case "params":
                    req.validatedParams = result;
                    break;
            }
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const validationErrors = error.issues.map((err) => ({
                    field: err.path.join("."),
                    message: err.message,
                    code: err.code,
                    value: err.path.length > 0
                        ? getNestedValue(req[target], err.path)
                        : req[target],
                }));
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: validationErrors,
                    target,
                });
            }
            // Handle unexpected errors
            console.error("Validation middleware error:", error);
            return res.status(500).json({
                success: false,
                message: "Internal validation error",
            });
        }
    };
}
/**
 * Middleware factory for common validation patterns
 */
exports.validation = {
    /**
     * Validate request body
     */
    body: (schema, options) => validateRequest(schema, "body", options),
    /**
     * Validate query parameters
     */
    query: (schema, options) => validateRequest(schema, "query", options),
    /**
     * Validate URL parameters
     */
    params: (schema, options) => validateRequest(schema, "params", options),
    /**
     * Validate multiple targets at once
     */
    multi: (schemas) => {
        return (req, res, next) => {
            const errors = [];
            // Validate each target if schema is provided
            Object.entries(schemas).forEach(([target, schema]) => {
                if (!schema)
                    return;
                try {
                    let dataToValidate;
                    switch (target) {
                        case "body":
                            dataToValidate = req.body;
                            break;
                        case "query":
                            dataToValidate = req.query;
                            break;
                        case "params":
                            dataToValidate = req.params;
                            break;
                    }
                    const result = schema.parse(dataToValidate);
                    // Store validated data
                    switch (target) {
                        case "body":
                            req.validatedBody = result;
                            break;
                        case "query":
                            req.validatedQuery = result;
                            break;
                        case "params":
                            req.validatedParams = result;
                            break;
                    }
                }
                catch (error) {
                    if (error instanceof zod_1.ZodError) {
                        const getCurrentData = () => {
                            switch (target) {
                                case "body":
                                    return req.body;
                                case "query":
                                    return req.query;
                                case "params":
                                    return req.params;
                                default:
                                    return req.body;
                            }
                        };
                        const currentData = getCurrentData();
                        const targetErrors = error.issues.map((err) => ({
                            field: `${target}.${err.path.join(".")}`,
                            message: err.message,
                            code: err.code,
                            value: err.path.length > 0
                                ? getNestedValue(currentData, err.path)
                                : currentData,
                        }));
                        errors.push(...targetErrors);
                    }
                }
            });
            if (errors.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors,
                });
            }
            next();
        };
    },
};
/**
 * Async validation wrapper for complex validations
 */
function asyncValidation(asyncValidator) {
    return async (req, res, next) => {
        try {
            const result = await asyncValidator(req.body);
            req.validatedBody = result;
            next();
        }
        catch (error) {
            if (error instanceof Error) {
                return res.status(400).json({
                    success: false,
                    message: error.message,
                });
            }
            return res.status(500).json({
                success: false,
                message: "Validation error",
            });
        }
    };
}
/**
 * Custom validation middleware for specific business rules
 */
function customValidation(validator, errorMessage = "Custom validation failed") {
    return async (req, res, next) => {
        try {
            const isValid = await validator(req);
            if (!isValid) {
                return res.status(400).json({
                    success: false,
                    message: errorMessage,
                });
            }
            next();
        }
        catch (error) {
            console.error("Custom validation error:", error);
            return res.status(500).json({
                success: false,
                message: "Validation error",
            });
        }
    };
}
/**
 * Sanitization middleware
 */
function sanitizeInput(options = {}) {
    const { trim = true, lowercase = [], uppercase = [], removeHtml = false, } = options;
    return (req, res, next) => {
        // Helper function to sanitize a value
        const sanitize = (value, key) => {
            if (typeof value === "string") {
                let sanitized = value;
                if (trim) {
                    sanitized = sanitized.trim();
                }
                if (key && lowercase.includes(key)) {
                    sanitized = sanitized.toLowerCase();
                }
                if (key && uppercase.includes(key)) {
                    sanitized = sanitized.toUpperCase();
                }
                if (removeHtml) {
                    sanitized = sanitized.replace(/<[^>]*>/g, "");
                }
                return sanitized;
            }
            if (typeof value === "object" && value !== null) {
                if (Array.isArray(value)) {
                    return value.map((item, index) => sanitize(item));
                }
                else {
                    const sanitized = {};
                    for (const [k, v] of Object.entries(value)) {
                        sanitized[k] = sanitize(v, k);
                    }
                    return sanitized;
                }
            }
            return value;
        };
        // Sanitize body, query, and params
        if (req.body) {
            req.body = sanitize(req.body);
        }
        if (req.query) {
            req.query = sanitize(req.query);
        }
        if (req.params) {
            req.params = sanitize(req.params);
        }
        next();
    };
}
/**
 * Validation logging middleware
 */
function logValidation(options = {}) {
    const { logSuccess = false, logErrors = true, includeData = false } = options;
    return (req, res, next) => {
        const originalSend = res.json;
        res.json = function (data) {
            if (data.success === false && logErrors) {
                console.warn(`Validation failed for ${req.method} ${req.path}:`, {
                    errors: data.errors,
                    ...(includeData && {
                        requestData: {
                            body: req.body,
                            query: req.query,
                            params: req.params,
                        },
                    }),
                });
            }
            else if (data.success !== false && logSuccess) {
                console.log(`Validation successful for ${req.method} ${req.path}`);
            }
            return originalSend.call(this, data);
        };
        next();
    };
}
/**
 * Helper function to get nested value from object
 */
function getNestedValue(obj, path) {
    return path.reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
}
/**
 * Utility function to create standardized error responses
 */
function createValidationError(message, errors) {
    return {
        success: false,
        message,
        errors: errors || [],
    };
}
/**
 * Utility function to create standardized success responses
 */
function createSuccessResponse(data, message) {
    return {
        success: true,
        ...(message && { message }),
        ...(data !== undefined && { data }),
    };
}
