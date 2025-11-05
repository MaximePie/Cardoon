import React, { useContext, useState } from "react";
import { useCategoriesContext } from "../../../../context/CategoriesContext";
import { SnackbarContext } from "../../../../context/SnackbarContext";
import { RESOURCES, usePost } from "../../../../hooks/server";
import { MistralResponse } from "../CardFormPage";

interface HookReturnType {
  isGenerationLoading: boolean;
  newCard: Partial<{ category: string }>;
  subQuestions: { question: string; answer: string }[];
  subcategory: string;
  setSubcategory: React.Dispatch<React.SetStateAction<string>>;
  generateQuestions: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
  categoriesWithCount: string[];
  updateCategory: (category: string) => void;
  isCategoriesLoading: boolean;
}
export default function useMultiCardFormModal(): HookReturnType {
  const [newCard, setNewCard] = React.useState<Partial<{ category: string }>>(
    {}
  );
  const [subcategory, setSubcategory] = React.useState<string>("");
  const [isGenerationLoading, setIsLoading] = useState(false);
  const [subQuestions, setSubQuestions] = React.useState<
    { question: string; answer: string }[]
  >([]);
  const { asyncPost: postMistral } = usePost<MistralResponse>(
    RESOURCES.MISTRAL
  );
  const { categoriesWithCount, isLoading: isCategoriesLoading } =
    useCategoriesContext();
  const { openSnackbarWithMessage } = useContext(SnackbarContext);

  const generateQuestions = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const response = await postMistral({
      category: newCard.category,
      subcategory,
      promptType: "generatedQuestions",
    });

    if (!response) {
      openSnackbarWithMessage(
        "Erreur lors de la génération des questions",
        "error"
      );
      setIsLoading(false);
      return;
    }

    /**
     * Response looks like this :
     * "```json\n[\n  { \"question\": \"Quel est le nom italien pour 'cochon'?\", \"answer\": \"Maiale\" },\n  { \"question\": \"Quel est le nom italien pour 'vache'?\", \"answer\": \"Mucca\" },\n  { \"question\": \"Quel est le nom italien pour 'cheval'?\", \"answer\": \"Cavallo\" },\n  { \"question\": \"Quel est le nom italien pour 'poule'?\", \"answer\": \"Gallina\" },\n  { \"question\": \"Quel est le nom italien pour 'mouton'?\", \"answer\": \"Pecora\" },\n  { \"question\": \"Quel est le nom italien pour 'canard'?\", \"answer\": \"Anatra\" },\n  { \"question\": \"Quel est le nom italien pour 'chèvre'?\", \"answer\": \"Capra\" },\n  { \"question\": \"Quel est le nom italien pour 'oie'?\", \"answer\": \"Oca\" },\n  { \"question\": \"Quel est le nom italien pour 'âne'?\", \"answer\": \"Asino\" },\n  { \"question\": \"Quel est le nom italien pour 'lapin'?\", \"answer\": \"Coniglio\" },\n  { \"question\": \"Quel est le nom italien pour 'coq'?\", \"answer\": \"Gallo\" },\n  { \"question\": \"Quel est le nom italien pour 'taureau'?\", \"answer\": \"Toro\" },\n  { \"question\": \"Quel est le nom italien pour 'poulet'?\", \"answer\": \"Pollo\" },\n  { \"question\": \"Quel est le nom italien pour 'agneau'?\", \"answer\": \"Agnello\" },\n  { \"question\": \"Quel est le nom italien pour 'poussin'?\", \"answer\": \"Pulcino\" },\n  { \"question\": \"Quel est le nom italien pour 'veau'?\", \"answer\": \"Vitello\" },\n  { \"question\": \"Quel est le nom italien pour 'chevreau'?\", \"answer\": \"Capretto\" },\n  { \"question\": \"Quel est le nom italien pour 'jument'?\", \"answer\": \"Giumenta\" },\n  { \"question\": \"Quel est le nom italien pour 'poulain'?\", \"answer\": \"Puledro\" },\n  { \"question\": \"Quel est le nom italien pour 'brebis'?\", \"answer\": \"Pecora\" }\n]\n```"
     */
    try {
      let jsonResponse = response.content
        .replace(/```json/, "")
        .replace(/```/, "")
        .trim();

      // Tentative de correction des erreurs JSON communes
      // Corriger les clés manquantes (ex: {question" => {"question")
      jsonResponse = jsonResponse.replace(
        /{\s*([a-zA-Z_][a-zA-Z0-9_]*)":/g,
        '{"$1":'
      );

      const parsedResponse = JSON.parse(jsonResponse);

      // Vérifier que c'est bien un tableau d'objets avec question/answer
      if (Array.isArray(parsedResponse)) {
        const validQuestions = parsedResponse.filter(
          (item) =>
            typeof item === "object" &&
            item !== null &&
            typeof item.question === "string" &&
            typeof item.answer === "string"
        );

        if (validQuestions.length > 0) {
          setSubQuestions(validQuestions);
          setSubcategory("");
        } else {
          throw new Error("Aucune question valide trouvée dans la réponse");
        }
      } else {
        throw new Error("La réponse n'est pas un tableau");
      }
    } catch (parseError) {
      console.error("Erreur lors du parsing JSON:", parseError);
      console.error("Contenu reçu:", response.content);

      openSnackbarWithMessage(
        "Erreur lors de l'analyse de la réponse de l'IA. Veuillez réessayer.",
        "error"
      );
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
  };

  const updateCategory = (category: string) => {
    setNewCard((prev) => ({ ...prev, category }));
  };

  return {
    isGenerationLoading,
    subQuestions,
    subcategory,
    setSubcategory,
    generateQuestions,
    categoriesWithCount,
    isCategoriesLoading,
    updateCategory,
    newCard,
  };
}
