/**
 * Security configuration for Helmet middleware
 * This configuration provides comprehensive security headers for the Express app
 */
export const helmetConfig = {
    // Content Security Policy
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            scriptSrc: ["'self'"],
            connectSrc: [
                "'self'",
                "https://api.mistral.ai",
                "https://huggingface.co",
            ],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            upgradeInsecureRequests: [],
        },
    },
    // Cross-Origin Policies
    crossOriginEmbedderPolicy: false, // Disabled for better compatibility
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    // HTTP Strict Transport Security
    hsts: {
        maxAge: 31536000, // 1 year in seconds
        includeSubDomains: true,
        preload: true,
    },
    // Security Headers
    noSniff: true, // X-Content-Type-Options: nosniff
    frameguard: { action: "deny" }, // X-Frame-Options: DENY
    xssFilter: true, // X-XSS-Protection: 1; mode=block
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    // Hide X-Powered-By header
    hidePoweredBy: true,
    // DNS Prefetch Control
    dnsPrefetchControl: { allow: false },
    // IE No Open
    ieNoOpen: true,
    // Note: Permissions Policy can be added manually as middleware if needed
    // It's not yet fully supported in Helmet's TypeScript definitions
};
/**
 * Additional security middleware configuration
 */
export const securityConfig = {
    // Rate limiting settings (to be used with express-rate-limit)
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
        message: "Too many requests from this IP, please try again later.",
        standardHeaders: true,
        legacyHeaders: false,
    },
    // CORS settings
    cors: {
        origin: [
            "http://localhost:5173",
            "http://192.168.1.137:5173",
            "https://cardoon-front.onrender.com",
        ],
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    },
    // Body parser limits
    bodyParser: {
        json: { limit: "10mb" },
        urlencoded: { limit: "10mb", extended: true },
    },
};
