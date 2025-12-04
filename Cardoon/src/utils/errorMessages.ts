/**
 * Maps backend error messages to user-friendly French messages
 */
export const ERROR_MESSAGES: Record<string, string> = {
  // Authentication errors
  "Invalid credentials":
    "La connexion a échoué car l'email ou le mot de passe sont invalides.",
  "Email/Username and password are required":
    "Veuillez renseigner votre email et votre mot de passe.",
  "Invalid token": "Votre session a expiré. Veuillez vous reconnecter.",
  "Token expired": "Votre session a expiré. Veuillez vous reconnecter.",
  "No authentication token found":
    "Vous devez être connecté pour accéder à cette ressource.",

  // User errors
  "User not found": "Utilisateur introuvable.",
  "User already exists with this email":
    "Un compte existe déjà avec cette adresse email.",
  "Username is already taken": "Ce nom d'utilisateur est déjà pris.",

  // Validation errors
  "Validation failed": "Les données fournies sont invalides.",
  "Please fill in all fields": "Veuillez remplir tous les champs.",

  // Network errors
  "Network error":
    "Erreur de connexion. Veuillez vérifier votre connexion internet.",
  "Request failed": "La requête a échoué. Veuillez réessayer.",

  // Generic errors
  "An unexpected error occurred":
    "Une erreur inattendue s'est produite. Veuillez réessayer.",
  "Internal server error":
    "Erreur du serveur. Veuillez réessayer ultérieurement.",
};

/**
 * Gets a user-friendly error message from a backend error
 * @param error - The error object or message from the backend
 * @returns A user-friendly error message in French
 */
export const getErrorMessage = (error: unknown): string => {
  // If error is a string
  if (typeof error === "string") {
    return ERROR_MESSAGES[error] || error;
  }

  // If error has a response object (axios error)
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "data" in error.response &&
    error.response.data &&
    typeof error.response.data === "object" &&
    "message" in error.response.data
  ) {
    const backendMessage = (error.response.data as { message: string }).message;
    return ERROR_MESSAGES[backendMessage] || backendMessage;
  }

  // If error has a message property
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return ERROR_MESSAGES[error.message] || error.message;
  }

  // Default error message
  return ERROR_MESSAGES["An unexpected error occurred"];
};
