import { useContext, useState } from "react";
import { SnackbarContext } from "../../../context/SnackbarContext";
import { usePost, RESOURCES } from "../../../hooks/server";
import { PopulatedUserCard } from "../../../types/common";
import { Mistral } from "@mistralai/mistralai";
import Input from "../../atoms/Input/Input";
import Button from "../../atoms/Button/Button";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import Loader from "../../atoms/Loader/Loader";
const apiKey = import.meta.env.VITE_MISTRAL_API_KEY;

const client = new Mistral({ apiKey: apiKey });

interface GeneratedSubquestionsProps {
  subquestions: { question: string; answer: string }[] | null;
  addQuestion: (question: string, answer: string) => void;
  isLoading: boolean;
}

interface SubQuestionProps {
  question: string;
  answer: string;
  addQuestion: (question: string, answer: string) => void;
}

const SubQuestion = ({ question, answer, addQuestion }: SubQuestionProps) => {
  const [isAdded, setIsAdded] = useState(false);

  const handleAddQuestion = () => {
    addQuestion(question, answer);
    setIsAdded(true);
  };

  return (
    <p className="GeneratedSubquestions__subquestion">
      <span className="GeneratedSubquestions__subquestion__text">
        <span className="GeneratedSubquestions__subquestion__text__question">
          {question}
        </span>
        <span className="GeneratedSubquestions__subquestion__text__answer">
          {answer}
        </span>
      </span>
      <Button
        variant="secondary"
        onClick={handleAddQuestion}
        disabled={isAdded}
      >
        {isAdded ? "✅ Ajouté" : "Ajouter"}
      </Button>
    </p>
  );
};

const GeneratedSubquestions = ({
  subquestions,
  addQuestion,
  isLoading,
}: GeneratedSubquestionsProps) => {
  return (
    <div className="GeneratedSubquestions">
      <h2>Questions générées</h2>
      {isLoading && (
        <div className="GeneratedSubquestions__loader">
          <Loader />
        </div>
      )}
      {!isLoading && !subquestions?.length && <p>Aucune question générée.</p>}
      {subquestions?.map((subquestion, index) => (
        <SubQuestion
          key={index}
          question={subquestion.question}
          answer={subquestion.answer}
          addQuestion={addQuestion}
        />
      ))}
    </div>
  );
};

interface SubQuestionsTabProps {
  editedCard: PopulatedUserCard;
  newCard: {
    question: string;
    answer: string;
    imageLink: string;
    category: string | undefined;
  };
}
export default ({ editedCard, newCard }: SubQuestionsTabProps) => {
  const { post } = usePost(RESOURCES.CARDS);
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
    const prompt = `J'ai la question suivante : "${newCard.question} (réponse : ${newCard.answer})". Peux-tu me donner 10 sous-questions qui pourraient être posées à partir de cette question ? Inclus d'autres connaissances en rapport avec ${newCard.category} liées à cette question
      Je veux des questions courtes. Je veux les questions au format JSON, avec le nom de la question et la réponse. Par exemple : { "question": "Quel est le nom de l'auteur ?", "answer": "Victor Hugo" }`;
    const chatResponse = await client.chat.complete({
      model: "mistral-large-latest",
      messages: [{ role: "user", content: prompt }],
    });

    let response =
      chatResponse.choices?.[0]?.message?.content ?? "No content available";
    if (typeof response === "string") {
      const jsonStartIndex = response.indexOf("[");
      const jsonEndIndex = response.lastIndexOf("]");
      if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
        response = response.substring(jsonStartIndex, jsonEndIndex + 1);
      }
      setGeneratedSubquestions(
        JSON.parse(response) as { question: string; answer: string }[]
      );
    } else {
      console.error("Unexpected response format:", response);
    }
    setIsLoading(false);
  };

  return (
    <div className="SubQuestionsTab">
      <>
        <h2>Ajouter une sous-question</h2>

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
            variant="danger"
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
};
