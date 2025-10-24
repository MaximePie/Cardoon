// Barrel export for UserContext module
// Re-export everything from the core context file
export { emptyUser, UserContext } from "./UserContext";
export type { UserContextType } from "./UserContext";

// Re-export the provider component (from the .tsx file)
export { UserContextProvider } from "./UserContext.tsx";

// Re-export the custom hook for convenience
export { useUser } from "../../hooks/contexts/useUser.ts";
