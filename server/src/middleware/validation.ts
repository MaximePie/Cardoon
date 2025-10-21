import { NextFunction, Request, Response } from "express";
import { ZodError, ZodSchema } from "zod";

/**
 * Types for validation targets
 */
export type ValidationTarget = "body" | "query" | "params";

/**
 * Enhanced request interface with validated data
 */
export interface ValidatedRequest<TBody = any, TQuery = any, TParams = any>
  extends Request {
  validatedBody?: TBody;
  validatedQuery?: TQuery;
  validatedParams?: TParams;
}

/**
 * Validation error details
 */
interface ValidationErrorDetail {
  field: string;
  message: string;
  code: string;
  value?: any;
}

/**
 * Create validation middleware for request validation
 * @param schema - Zod schema to validate against
 * @param target - Which part of the request to validate (body, query, params)
 * @param options - Additional validation options
 */
export function validateRequest<T>(
  schema: ZodSchema<T>,
  target: ValidationTarget = "body",
  options: {
    stripUnknown?: boolean;
    allowUnknown?: boolean;
    transform?: boolean;
  } = {}
) {
  const {
    stripUnknown = true,
    allowUnknown = false,
    transform = true,
  } = options;

  return (req: ValidatedRequest, res: Response, next: NextFunction) => {
    try {
      // Get the data to validate based on target
      let dataToValidate: any;
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
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors: ValidationErrorDetail[] = error.errors.map(
          (err) => ({
            field: err.path.join("."),
            message: err.message,
            code: err.code,
            value:
              err.path.length > 0
                ? getNestedValue(req[target as keyof Request], err.path)
                : req[target as keyof Request],
          })
        );

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
export const validation = {
  /**
   * Validate request body
   */
  body: <T>(schema: ZodSchema<T>, options?: any) =>
    validateRequest(schema, "body", options),

  /**
   * Validate query parameters
   */
  query: <T>(schema: ZodSchema<T>, options?: any) =>
    validateRequest(schema, "query", options),

  /**
   * Validate URL parameters
   */
  params: <T>(schema: ZodSchema<T>, options?: any) =>
    validateRequest(schema, "params", options),

  /**
   * Validate multiple targets at once
   */
  multi: (schemas: {
    body?: ZodSchema<any>;
    query?: ZodSchema<any>;
    params?: ZodSchema<any>;
  }) => {
    return (req: ValidatedRequest, res: Response, next: NextFunction) => {
      const errors: ValidationErrorDetail[] = [];

      // Validate each target if schema is provided
      Object.entries(schemas).forEach(([target, schema]) => {
        if (!schema) return;

        try {
          let dataToValidate: any;
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
        } catch (error) {
          if (error instanceof ZodError) {
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

            const targetErrors = error.errors.map((err) => ({
              field: `${target}.${err.path.join(".")}`,
              message: err.message,
              code: err.code,
              value:
                err.path.length > 0
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
export function asyncValidation<T>(asyncValidator: (data: any) => Promise<T>) {
  return async (req: ValidatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await asyncValidator(req.body);
      req.validatedBody = result;
      next();
    } catch (error) {
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
export function customValidation(
  validator: (req: ValidatedRequest) => Promise<boolean> | boolean,
  errorMessage: string = "Custom validation failed"
) {
  return async (req: ValidatedRequest, res: Response, next: NextFunction) => {
    try {
      const isValid = await validator(req);
      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: errorMessage,
        });
      }
      next();
    } catch (error) {
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
export function sanitizeInput(
  options: {
    trim?: boolean;
    lowercase?: string[];
    uppercase?: string[];
    removeHtml?: boolean;
  } = {}
) {
  const {
    trim = true,
    lowercase = [],
    uppercase = [],
    removeHtml = false,
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // Helper function to sanitize a value
    const sanitize = (value: any, key?: string): any => {
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
        } else {
          const sanitized: any = {};
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
export function logValidation(
  options: {
    logSuccess?: boolean;
    logErrors?: boolean;
    includeData?: boolean;
  } = {}
) {
  const { logSuccess = false, logErrors = true, includeData = false } = options;

  return (req: ValidatedRequest, res: Response, next: NextFunction) => {
    const originalSend = res.json;

    res.json = function (data: any) {
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
      } else if (data.success !== false && logSuccess) {
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
function getNestedValue(obj: any, path: (string | number)[]): any {
  return path.reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

/**
 * Utility function to create standardized error responses
 */
export function createValidationError(
  message: string,
  errors?: ValidationErrorDetail[]
) {
  return {
    success: false,
    message,
    errors: errors || [],
  };
}

/**
 * Utility function to create standardized success responses
 */
export function createSuccessResponse<T>(data?: T, message?: string) {
  return {
    success: true,
    ...(message && { message }),
    ...(data !== undefined && { data }),
  };
}
