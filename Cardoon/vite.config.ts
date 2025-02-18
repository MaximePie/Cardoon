import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // S'assure de rediriger les routes React vers index.html
    watch: {
      usePolling: true, // Option utile en cas de problèmes de fichiers avec Docker
    },
  },
  build: {
    outDir: "dist", // Définissez le dossier de production si ce n'est pas déjà le cas
  },
  resolve: {
    alias: [{ find: "@", replacement: "/src" }],
  },
});
