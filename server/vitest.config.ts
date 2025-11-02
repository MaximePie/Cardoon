import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Environnement Node.js pour les tests backend
    environment: "node",

    // Configuration de la couverture
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./coverage",
      exclude: [
        "coverage/**",
        "dist/**",
        "node_modules/**",
        "**/*.d.ts",
        "**/*.config.*",
        "**/test-setup.ts",
      ],
    },

    // Patterns des fichiers de test
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: ["src/**/*.node.test.ts"],

    // Configuration globale
    globals: true,

    // Timeout pour les tests
    testTimeout: 10000,

    // Configuration pour TypeScript
    typecheck: {
      enabled: false, // On utilise tsc séparément
    },
  },

  // Configuration pour résoudre les modules
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
