import { Modal } from "@mui/material";
import React, { useContext, useState } from "react";
import { useCategoriesContext } from "../../../../context/CategoriesContext";
import { SnackbarContext } from "../../../../context/SnackbarContext";
import { RESOURCES, usePost } from "../../../../hooks/server";
import Button from "../../../atoms/Button/Button";
import CategoryInput from "../../../atoms/Input/CategoryInput/CategoryInput";
import Input from "../../../atoms/Input/Input";
import Loader from "../../../atoms/Loader/Loader";
import { MistralResponse } from "../CardFormPage";
import QuestionLine from "../QuestionLine/QuestionLine";

interface CardFormModalProps {
  open: boolean;
  onClose: () => void;
}

export default function MultiCardFormModal({
  open,
  onClose,
}: CardFormModalProps) {
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
    const jsonResponse = response.content
      .replace(/```json/, "")
      .replace(/```/, "")
      .trim();
    const parsedResponse = JSON.parse(jsonResponse);
    setSubQuestions(parsedResponse);
    setSubcategory("");

    setIsLoading(false);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <div className="CardFormPage__modal">
        <div className="CardFormPage__modal">
          <h2>Création de questions par IA</h2>
          <form>
            <div>
              <CategoryInput
                label="Je veux apprendre ..."
                categoriesWithCount={categoriesWithCount}
                newCard={newCard}
                setNewCard={setNewCard}
                isRequired={true}
                isLoading={isCategoriesLoading}
              />
            </div>
            <div>
              <Input
                label="Plus particulièrement"
                type="text"
                onChange={(e) => setSubcategory(e.target.value)}
                placeholder="Sous-catégorie"
                value={subcategory}
              />
            </div>
            <Button
              onClick={generateQuestions}
              disabled={!newCard.category || isGenerationLoading}
            >
              Générer
            </Button>
          </form>
          <div className="CardFormPage__modal-questions">
            {isGenerationLoading && <Loader />}
            {subQuestions?.map(({ question, answer }, index) => (
              <QuestionLine
                key={`${index}-${question}`}
                question={question}
                answer={answer}
                category={newCard.category}
                aria-label={`Question générée ${index + 1} sur ${subQuestions.length}`}
              />
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
