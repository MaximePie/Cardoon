export const formattedNumber = (number: number) => {
  // Vérification de sécurité pour éviter l'erreur undefined
  const goldAmount = number ?? 0;

  if (goldAmount >= 1000000) {
    return (goldAmount / 1000000).toFixed(1) + "M";
  } else if (goldAmount >= 1000) {
    return (goldAmount / 1000).toFixed(1) + "K";
  } else {
    return goldAmount.toString();
  }
};
