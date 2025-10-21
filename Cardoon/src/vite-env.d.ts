/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // Ajoutez d'autres variables d'environnement ici
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Déclaration des modules pour les images
declare module "*.png" {
  const content: string;
  export default content;
}

declare module "*.jpg" {
  const content: string;
  export default content;
}

declare module "*.jpeg" {
  const content: string;
  export default content;
}

declare module "*.gif" {
  const content: string;
  export default content;
}

declare module "*.svg" {
  const content: string;
  export default content;
}
