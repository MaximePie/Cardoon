"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
// app.js
const express_1 = __importDefault(require("express"));
const cards_js_1 = __importDefault(require("./api/cards.js"));
const db_js_1 = __importDefault(require("./config/db.js"));
const security_js_1 = require("./config/security.js");
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
const adventure_js_1 = __importDefault(require("./api/adventure.js"));
const items_js_1 = __importDefault(require("./api/items.js"));
const mistral_js_1 = __importDefault(require("./api/mistral.js"));
const userCards_js_1 = __importDefault(require("./api/userCards.js"));
const users_js_1 = __importDefault(require("./api/users.js"));
// import usersRoutes from "./api/users"; // Temporarily disabled due to validation errors
dotenv_1.default.config();
const app = (0, express_1.default)();
// CORS configuration - MUST be before other middlewares
// The cors middleware automatically handles OPTIONS preflight requests
app.use((0, cors_1.default)({
    ...security_js_1.securityConfig.cors,
    preflightContinue: false,
    optionsSuccessStatus: 200,
}));
// Security middleware with Helmet
app.use((0, helmet_1.default)(security_js_1.helmetConfig));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: security_js_1.securityConfig.rateLimit.windowMs,
    max: security_js_1.securityConfig.rateLimit.max,
    message: security_js_1.securityConfig.rateLimit.message,
    standardHeaders: security_js_1.securityConfig.rateLimit.standardHeaders,
    legacyHeaders: security_js_1.securityConfig.rateLimit.legacyHeaders,
    skip: security_js_1.securityConfig.rateLimit.skip, // Ajouter la fonction skip pour bypasser en dev
});
console.log("Rate limiter config:", {
    max: security_js_1.securityConfig.rateLimit.max,
    skip: !!security_js_1.securityConfig.rateLimit.skip,
    isDev: process.env.NODE_ENV === "development",
});
// Only apply rate limiting in production
if (process.env.NODE_ENV === "production") {
    app.use("/api/", limiter);
    console.log("Rate limiting ENABLED");
}
else {
    console.log("Rate limiting DISABLED (development mode)");
}
// Additional security headers for Permissions Policy
app.use((req, res, next) => {
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), accelerometer=(), gyroscope=(), magnetometer=()");
    next();
});
// Body parser with size limits
app.use(body_parser_1.default.json(security_js_1.securityConfig.bodyParser.json));
app.use(body_parser_1.default.urlencoded(security_js_1.securityConfig.bodyParser.urlencoded));
app.use((req, res, next) => {
    next();
});
app.use("/api/cards", cards_js_1.default);
app.use("/api/userCards", userCards_js_1.default);
app.use("/api/users", users_js_1.default);
app.use("/api/mistral", mistral_js_1.default);
app.use("/api/items", items_js_1.default);
app.use("/api/adventure", adventure_js_1.default);
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res
        .status(err.name === "ValidationError" ? 400 : 500)
        .json({ message: "An error occurred", error: err.message });
    return;
};
exports.errorHandler = errorHandler;
app.use(exports.errorHandler);
(0, db_js_1.default)();
const port = parseInt(process.env.PORT || "8082");
const server = app.listen(port, "0.0.0.0", () => console.log(`Server running on port ${port}`));
server.on("error", (err) => {
    console.error("Server error:", err);
});
