"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = void 0;
const AppError_js_1 = require("./AppError.js");
class ValidationError extends AppError_js_1.AppError {
    constructor(message) {
        super(message, 400);
    }
}
exports.ValidationError = ValidationError;
