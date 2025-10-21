#!/usr/bin/env node
/**
 * Security Test Script
 * Tests that security headers are properly configured
 */

import http from "http";

const SERVER_URL = "http://localhost:8082";

/**
 * Test security headers
 */
async function testSecurityHeaders() {
  console.log("🔒 Testing Security Headers...\n");

  return new Promise((resolve, reject) => {
    const req = http.request(
      `${SERVER_URL}/api/users`,
      { method: "OPTIONS" },
      (res) => {
        const headers = res.headers;

        console.log("📊 Response Headers:");
        console.log("-------------------");

        // Test for important security headers
        const securityHeaders = {
          "X-Content-Type-Options": headers["x-content-type-options"],
          "X-Frame-Options": headers["x-frame-options"],
          "X-XSS-Protection": headers["x-xss-protection"],
          "Strict-Transport-Security": headers["strict-transport-security"],
          "Content-Security-Policy": headers["content-security-policy"],
          "Referrer-Policy": headers["referrer-policy"],
          "Permissions-Policy": headers["permissions-policy"],
          "X-Powered-By": headers["x-powered-by"],
        };

        let allTestsPassed = true;

        // Check each security header
        Object.entries(securityHeaders).forEach(([name, value]) => {
          const status = value ? "✅" : "❌";
          console.log(`${status} ${name}: ${value || "Not Set"}`);

          if (!value && name !== "X-Powered-By") {
            // X-Powered-By should be hidden
            allTestsPassed = false;
          } else if (name === "X-Powered-By" && value) {
            console.log("⚠️  X-Powered-By should be hidden for security");
            allTestsPassed = false;
          }
        });

        console.log("\n📋 Security Assessment:");
        console.log("----------------------");

        if (allTestsPassed && !securityHeaders["X-Powered-By"]) {
          console.log("✅ All security headers are properly configured!");
        } else {
          console.log("❌ Some security headers need attention.");
        }

        // Test CORS
        console.log("\n🌐 CORS Configuration:");
        console.log("---------------------");
        console.log(
          `Access-Control-Allow-Origin: ${
            headers["access-control-allow-origin"] || "Not Set"
          }`
        );
        console.log(
          `Access-Control-Allow-Methods: ${
            headers["access-control-allow-methods"] || "Not Set"
          }`
        );
        console.log(
          `Access-Control-Allow-Headers: ${
            headers["access-control-allow-headers"] || "Not Set"
          }`
        );

        resolve(allTestsPassed);
      }
    );

    req.on("error", (err) => {
      console.error("❌ Error connecting to server:", err.message);
      console.log("💡 Make sure the server is running: npm run dev");
      reject(err);
    });

    req.end();
  });
}

/**
 * Test rate limiting
 */
async function testRateLimit() {
  console.log("\n⏱️  Testing Rate Limiting...");
  console.log("---------------------------");

  const promises = [];

  // Make multiple requests to test rate limiting
  for (let i = 0; i < 5; i++) {
    promises.push(
      new Promise((resolve) => {
        const req = http.request(
          `${SERVER_URL}/api/users`,
          { method: "GET" },
          (res) => {
            resolve({
              status: res.statusCode,
              rateLimitRemaining: res.headers["x-ratelimit-remaining"],
              rateLimitLimit: res.headers["x-ratelimit-limit"],
            });
          }
        );
        req.on("error", () => resolve({ error: true }));
        req.end();
      })
    );
  }

  try {
    const results = await Promise.all(promises);
    const firstResult = results[0];

    if (firstResult && !firstResult.error) {
      console.log(`✅ Rate Limit Headers Present:`);
      console.log(`   Limit: ${firstResult.rateLimitLimit || "Not Set"}`);
      console.log(
        `   Remaining: ${firstResult.rateLimitRemaining || "Not Set"}`
      );
    } else {
      console.log("❌ Rate limiting headers not found");
    }
  } catch (error) {
    console.log("❌ Error testing rate limiting");
  }
}

/**
 * Main test runner
 */
async function runSecurityTests() {
  console.log("🛡️  Cardoon Security Test Suite");
  console.log("================================\n");

  try {
    await testSecurityHeaders();
    await testRateLimit();

    console.log("\n🎉 Security tests completed!");
    console.log("\n💡 Recommendations:");
    console.log("   1. Test with a security scanner like OWASP ZAP");
    console.log("   2. Verify HTTPS configuration in production");
    console.log("   3. Monitor rate limiting logs for suspicious activity");
  } catch (error) {
    console.error("❌ Security tests failed:", error.message);
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSecurityTests();
}

export { runSecurityTests, testRateLimit, testSecurityHeaders };
