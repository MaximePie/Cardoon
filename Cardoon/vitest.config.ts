import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    env: {
      NODE_ENV: "test",
      VITE_API_URL: "http://localhost:3000",
    },
    // Handle static assets in tests
    deps: {
      inline: ["@testing-library/jest-dom"],
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      reportsDirectory: "coverage",
      exclude: [
        "node_modules/",
        "src/test/",
        "**/*.test.{ts,tsx}",
        "**/*.spec.{ts,tsx}",
        "src/main.tsx",
        "src/vite-env.d.ts",
        "**/*.d.ts",
        "eslint.config.js",
        "vite.config.ts",
        "vitest.config.ts",
        "scripts/**",
        "dist/**",
        "coverage/**",
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": "./src",
    },
  },
});
