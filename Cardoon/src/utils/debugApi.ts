/**
 * @fileoverview Debug script to test API endpoints
 *
 * This script helps diagnose production vs local API differences
 */

// Debug function to test API endpoints
export const debugApiEndpoints = async () => {
  const backUrl = import.meta.env.VITE_API_URL || process.env.VITE_API_URL;

  console.log("🔍 Debug Info:");
  console.log("- API Base URL:", backUrl);
  console.log("- Full URL:", `${backUrl}/api/userCards/all`);
  console.log("- Environment:", import.meta.env.MODE);

  // Test base API health
  try {
    const healthResponse = await fetch(`${backUrl}/api/health`);
    console.log("✅ Health check:", healthResponse.status);
  } catch (error) {
    console.log("❌ Health check failed:", error);
  }

  // Test API root
  try {
    const rootResponse = await fetch(`${backUrl}/api/`);
    console.log("📋 API Root:", rootResponse.status);
  } catch (error) {
    console.log("❌ API Root failed:", error);
  }

  // Test different endpoints to isolate the problem
  const endpoints = [
    { name: "Health", url: `${backUrl}/api/health` },
    { name: "API Root", url: `${backUrl}/api/` },
    { name: "Users", url: `${backUrl}/api/users` },
    { name: "UserCards Root", url: `${backUrl}/api/userCards/` },
    { name: "UserCards All", url: `${backUrl}/api/userCards/all` },
  ];

  const token = document.cookie.match(/token=([^;]*)/)?.[1] || "no-token";

  for (const endpoint of endpoints) {
    try {
      console.log(`\n🧪 Testing ${endpoint.name}:`);

      const response = await fetch(endpoint.url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log(`   Status: ${response.status} ${response.statusText}`);

      if (response.status === 404) {
        console.log("   ❌ 404: Endpoint not found - Backend route missing!");
      } else if (response.status === 401) {
        console.log("   � 401: Authentication required - Token invalid?");
      } else if (response.status === 403) {
        console.log("   🚫 403: Forbidden - User not authorized");
      } else if (response.status >= 200 && response.status < 300) {
        console.log("   ✅ Success");

        if (endpoint.name === "UserCards All") {
          try {
            const data = await response.json();
            console.log("   📊 Response data:", data);
          } catch {
            console.log("   📊 Response not JSON");
          }
        }
      } else {
        console.log(`   ⚠️ Unexpected status: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ Network Error:`, (error as Error).message);
    }
  }

  // Token diagnostics
  console.log("\n🔑 Token Info:");
  console.log("- Token present:", token !== "no-token");
  console.log("- Token length:", token.length);
  console.log("- Token preview:", token.substring(0, 20) + "...");

  // Environment diagnostics
  console.log("\n🌍 Environment:");
  console.log("- Mode:", import.meta.env.MODE);
  console.log("- Production:", import.meta.env.PROD);
  console.log("- Development:", import.meta.env.DEV);
};

// Add to window for browser console usage
if (typeof window !== "undefined") {
  (window as typeof window & { debugApi: typeof debugApiEndpoints }).debugApi =
    debugApiEndpoints;
}
