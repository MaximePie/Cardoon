import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useContext, useState } from "react";
import { SnackbarContext } from "../../../../context/SnackbarContext";
import { RESOURCES, usePost } from "../../../../hooks/server";
import { PopulatedUserCard } from "../../../../types/common";
import Button from "../../../atoms/Button/Button";
import Input from "../../../atoms/Input/Input";
import { MistralResponse } from "../../../pages/CardFormPage/CardFormPage";
import GeneratedSubquestions from "./GeneratedSubquestions";

interface SubQuestionsTabProps {
  editedCard: PopulatedUserCard;
  goBack: () => void;
  newCard: {
    question: string;
    answer: string;
    imageLink: string;
    category: string | undefined;
  };
}
export default function SubQuestionsTabComponent({
  editedCard,
  goBack,
  newCard,
}: SubQuestionsTabProps) {
  const { post } = usePost(RESOURCES.CARDS);
  const { asyncPost: postMistral } = usePost<MistralResponse>(
    RESOURCES.MISTRAL
  );
  const { openSnackbarWithMessage } = useContext(SnackbarContext);

  const [subquestion, setNewSubquestion] = useState<string | undefined>();
  const [subanswer, setNewSubanswer] = useState<string | undefined>();
  const [generatedSubquestions, setGeneratedSubquestions] = useState<
    { question: string; answer: string }[] | null
  >(null);

  const [isLoading, setIsLoading] = useState(false);
  const saveSubquestion = async () => {
    const formData = new FormData();

    if (!subquestion || !subanswer) {
      return;
    }

    formData.append("question", subquestion);
    formData.append("answer", subanswer);
    formData.append("parentId", editedCard.card._id);
    formData.append("category", newCard.category || "");

    await post(formData);
    setNewSubquestion("");
    setNewSubanswer("");
    openSnackbarWithMessage("La carte a été mise à jour");
  };

  const createGeneratedSubquestion = async (
    question: string,
    answer: string
  ) => {
    setNewSubquestion(question);
    setNewSubanswer(answer);
  };
  const handleSaveSubquestionClick = (event: React.MouseEvent) => {
    event.preventDefault();
    saveSubquestion();
  };
  const generateSubQuestions = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    setIsLoading(true);
    const response = await postMistral({
      question: newCard.question,
      answer: newCard.answer,
      category: newCard.category || "",
      promptType: "Subquestions",
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
    try {
      const parsedResponse = JSON.parse(jsonResponse);
      if (!Array.isArray(parsedResponse)) {
        throw new Error("Invalid response format");
      }
      const subquestions = parsedResponse.map(
        (subquestion: { question: string; answer: string }) => {
          return {
            question: subquestion.question,
            answer: subquestion.answer,
          };
        }
      );

      setGeneratedSubquestions(subquestions);
      setIsLoading(false);
    } catch (error) {
      console.error("Error parsing response:", error);
      openSnackbarWithMessage(
        "Erreur lors de la génération des questions",
        "error"
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="SubQuestionsTab">
      <>
        <h2>
          <ArrowBackIcon
            className="SubQuestionsTab__back-button"
            onClick={goBack}
          />{" "}
          Ajouter une sous-question
        </h2>

        <Input
          label="Question alternative"
          type="text"
          value={subquestion || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setNewSubquestion(e.target.value)
          }
        />
        <Input
          label="Réponse alternative"
          type="text"
          value={subanswer || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setNewSubanswer(e.target.value)
          }
        />
        <div className="SubQuestionsTab__buttons">
          <Button onClick={handleSaveSubquestionClick}>Enregistrer</Button>
          <Button
            tooltip="Si la question est trop difficile, créer d'autres questions alternatives
                    peut ajouter du contexte et aider à la compréhension."
            onClick={generateSubQuestions}
            variant="secondary"
            icon={<AutoAwesomeIcon />}
          >
            Générer avec IA
          </Button>
        </div>
        <GeneratedSubquestions
          subquestions={generatedSubquestions}
          addQuestion={createGeneratedSubquestion}
          isLoading={isLoading}
        />
      </>
    </div>
  );
}
