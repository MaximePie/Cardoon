# Security Implementation - Cardoon Server

## Overview

This document outlines the security measures implemented in the Cardoon server to protect against common web vulnerabilities and attacks.

## Security Measures Implemented

### 1. Helmet.js Security Headers

#### Content Security Policy (CSP)

- **Purpose**: Prevents XSS attacks by controlling which resources can be loaded
- **Configuration**:
  - `default-src 'self'`: Only allow resources from same origin by default
  - `style-src`: Allow inline styles and Google Fonts
  - `font-src`: Allow fonts from Google Fonts
  - `img-src`: Allow images from same origin, data URLs, HTTPS, and blob URLs
  - `script-src 'self'`: Only allow scripts from same origin
  - `connect-src`: Allow connections to same origin and Mistral AI API
  - `object-src 'none'`: Block all plugins
  - `frame-src 'none'`: Prevent framing (clickjacking protection)

#### HTTP Strict Transport Security (HSTS)

- **Purpose**: Enforces HTTPS connections
- **Configuration**:
  - `maxAge: 31536000` (1 year)
  - `includeSubDomains: true`
  - `preload: true`

#### Other Security Headers

- **X-Content-Type-Options**: `nosniff` - Prevents MIME type sniffing
- **X-Frame-Options**: `DENY` - Prevents clickjacking attacks
- **X-XSS-Protection**: Enables XSS filtering in browsers
- **Referrer-Policy**: `strict-origin-when-cross-origin` - Controls referrer information
- **X-Powered-By**: Hidden - Removes server information disclosure

### 2. Cross-Origin Resource Sharing (CORS)

- **Purpose**: Controls which domains can access the API
- **Allowed Origins**:
  - `http://localhost:5173` (development)
  - `http://192.168.1.137:5173` (local network)
  - `https://cardoon-front.onrender.com` (production)
- **Credentials**: Enabled for authenticated requests
- **Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Headers**: Content-Type, Authorization, X-Requested-With

### 3. Rate Limiting

- **Purpose**: Prevents brute force attacks and API abuse
- **Configuration**:
  - **Window**: 15 minutes
  - **Max Requests**: 100 per IP per window
  - **Scope**: All `/api/*` endpoints
  - **Headers**: Modern standard headers enabled

### 4. Permissions Policy

- **Purpose**: Restricts access to browser features
- **Disabled Features**:
  - Camera access
  - Microphone access
  - Geolocation
  - Payment API
  - USB devices
  - Bluetooth
  - Device sensors (accelerometer, gyroscope, magnetometer)

### 5. Body Parser Security

- **Purpose**: Prevents DoS attacks through large payloads
- **Limits**:
  - JSON payload: 10MB maximum
  - URL-encoded payload: 10MB maximum

## Security Best Practices Applied

### 1. Defense in Depth

Multiple layers of security are implemented to ensure that if one measure fails, others provide protection.

### 2. Principle of Least Privilege

- Only necessary permissions and access are granted
- Restrictive CSP policies block unnecessary resources
- CORS limits API access to specific domains

### 3. Input Validation

- Body size limits prevent DoS attacks
- Rate limiting prevents abuse
- Content type validation through headers

### 4. Information Disclosure Prevention

- X-Powered-By header is hidden
- Error handling doesn't expose sensitive information
- Server version information is obscured

## Monitoring and Alerts

### Rate Limiting Logs

Rate limiting violations are automatically logged and can be monitored for suspicious activity.

### Security Headers Validation

Use tools like:

- [SecurityHeaders.com](https://securityheaders.com/)
- [Mozilla Observatory](https://observatory.mozilla.org/)
- Browser developer tools to verify header implementation

## Future Security Enhancements

### Recommended Additions

1. **Input Sanitization**: Implement input validation and sanitization middleware
2. **Authentication Security**:
   - JWT token rotation
   - Secure password policies
   - Account lockout mechanisms
3. **Logging and Monitoring**:
   - Security event logging
   - Intrusion detection
   - Automated alerting
4. **HTTPS Enforcement**: Redirect HTTP to HTTPS in production
5. **API Versioning**: Implement API versioning for security updates

### Security Testing

- Regular security audits
- Penetration testing
- Dependency vulnerability scanning with `npm audit`
- OWASP ZAP scanning

## Configuration Files

### Main Security Configuration

- Location: `src/config/security.ts`
- Contains all security-related configurations
- Centralized management of security policies

### Application Integration

- Location: `src/app.ts`
- Implements security middleware in correct order
- Applies configurations from security.ts

## Emergency Response

### Security Incident Response

1. Identify and contain the threat
2. Update security configurations if needed
3. Deploy security patches immediately
4. Monitor for continued threats
5. Document incident for future prevention

### Quick Security Updates

Security configurations are centralized in `security.ts` for rapid updates during security incidents.

---

_Last Updated: October 21, 2025_
_Security Review: Recommended every 3 months_
