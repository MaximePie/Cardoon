import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    // S'assure de rediriger les routes React vers index.html
    watch: {
      usePolling: true, // Option utile en cas de problèmes de fichiers avec Docker
    },
    proxy: {
      "/api": {
        target: "http://localhost:8082",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: "dist", // Définissez le dossier de production si ce n'est pas déjà le cas
    sourcemap: true, // Génère des fichiers source map pour le débogage
  },
  resolve: {
    alias: [{ find: "@", replacement: "/src" }],
  },
});
