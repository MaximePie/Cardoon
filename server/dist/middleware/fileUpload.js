"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateImageUpload = validateImageUpload;
const formidable_1 = require("formidable");
const zod_1 = require("zod");
const simpleValidation_js_1 = require("./simpleValidation.js");
/**
 * Middleware for handling file uploads with validation
 */
function validateImageUpload(schema) {
    return (req, res, next) => {
        const form = new formidable_1.IncomingForm({
            maxFileSize: 10 * 1024 * 1024, // 10MB limit
            allowEmptyFiles: false,
        });
        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error("Error parsing form:", err);
                res.status(400).json((0, simpleValidation_js_1.createErrorResponse)("Error parsing form data"));
                return;
            }
            try {
                // Extract the image file
                const image = Array.isArray(files.image) ? files.image[0] : files.image;
                if (!image) {
                    res.status(400).json((0, simpleValidation_js_1.createErrorResponse)("No image file provided"));
                    return;
                }
                // Validate the file using the provided Zod schema
                const validatedFile = schema.parse({
                    mimetype: image.mimetype,
                    size: image.size,
                    originalFilename: image.originalFilename,
                });
                // Attach validated data and file to request
                req.validatedFile = validatedFile;
                req.uploadedFile = image;
                req.formFields = fields;
                next();
            }
            catch (validationError) {
                if (validationError instanceof zod_1.ZodError) {
                    res.status(400).json({
                        success: false,
                        message: "File validation failed",
                        errors: validationError.issues.map((err) => ({
                            field: err.path.join("."),
                            message: err.message,
                            code: err.code,
                        })),
                    });
                    return;
                }
                console.error("Unexpected validation error:", validationError);
                res.status(500).json((0, simpleValidation_js_1.createErrorResponse)("File validation error"));
            }
        });
    };
}
