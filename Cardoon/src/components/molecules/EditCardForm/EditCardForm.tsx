import { IconButton, Modal } from "@mui/material";
import { PopulatedUserCard } from "../../../types/common";
import { useContext, useEffect, useState } from "react";
import CategoryInput from "../../atoms/Input/CategoryInput/CategoryInput";
import { FetchedCategory } from "../../pages/CardFormPage/CardFormPage";
import { RESOURCES, useDelete, usePost, usePut } from "../../../hooks/server";
import Delete from "@mui/icons-material/Delete";
import { SnackbarContext } from "../../../context/SnackbarContext";
import Input from "../../atoms/Input/Input";
import SubmitButton from "../../atoms/SubmitButton/SubmitButton";
import Button from "../../atoms/Button/Button";
import { Mistral } from "@mistralai/mistralai";

const apiKey = import.meta.env.VITE_MISTRAL_API_KEY;

const client = new Mistral({ apiKey: apiKey });
interface EditCardFormProps {
  isOpen: boolean;
  close: () => void;
  editedCard: PopulatedUserCard;
  categories: FetchedCategory[];
}

interface GeneratedSubquestionsProps {
  subquestions: { question: string; answer: string }[] | null;
  addQuestion: (question: string, answer: string) => void;
}
const GeneratedSubquestions = ({
  subquestions,
  addQuestion,
}: GeneratedSubquestionsProps) => {
  return (
    <div className="GeneratedSubquestions">
      <h2>Questions générées</h2>
      <ul>
        {subquestions?.map((subquestion, index) => (
          <li key={index}>
            <strong>{subquestion.question}</strong>: {subquestion.answer}
            <button
              onClick={() =>
                addQuestion(subquestion.question, subquestion.answer)
              }
            >
              Ajouter
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ({
  isOpen,
  close,
  editedCard,
  categories,
}: EditCardFormProps) => {
  const {
    card: { question, answer, imageLink, category },
  } = editedCard;

  const { openSnackbarWithMessage } = useContext(SnackbarContext);

  const { put } = usePut(RESOURCES.CARDS);
  const { post } = usePost(RESOURCES.CARDS);
  const { deleteResource } = useDelete(RESOURCES.CARDS);

  const [newCard, setNewCard] = useState({
    question,
    answer,
    imageLink,
    category,
  });

  const [subquestion, setNewSubquestion] = useState<string | undefined>();
  const [subanswer, setNewSubanswer] = useState<string | undefined>();
  const [generatedSubquestions, setGeneratedSubquestions] = useState<
    { question: string; answer: string }[] | null
  >(null);
  const [activeTab, setActiveTab] = useState<"question" | "subquestions">(
    "question"
  );

  useEffect(() => {
    setNewCard({
      question,
      answer,
      imageLink,
      category,
    });
  }, [isOpen, editedCard]);

  const categoriesWithCount = categories.map(
    (category) => `${category.category} (${category.count})`
  );

  const onCategoryChange = (updatedCard: Partial<typeof newCard>) => {
    setNewCard({ ...newCard, ...updatedCard });
  };

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const confirm = window.confirm(
      "Are you sure you want to delete this card?"
    );
    if (!confirm) return;
    await deleteResource(editedCard._id);
    close();
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData();

    if (!newCard.question || !newCard.answer) {
      return;
    }

    formData.append("question", newCard.question);
    formData.append("answer", newCard.answer);
    if (newCard.imageLink) {
      formData.append("imageLink", newCard.imageLink);
    }

    if (newCard.category) {
      formData.append("category", newCard.category);
    }
    await put(editedCard.card._id, formData);
    setNewCard({
      ...newCard,
      question: "",
      answer: "",
      imageLink: "",
    });
    close();
    openSnackbarWithMessage("La carte a été mise à jour");
  };

  const handleSaveSubquestionClick = (event: React.MouseEvent) => {
    event.preventDefault();
    saveSubquestion();
  };

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
  const generateSubQuestions = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    const prompt = `J'ai la question suivante : "${newCard.question} (réponse : ${newCard.answer})". Peux-tu me donner 5 sous-questions qui pourraient être posées à partir de cette question ? Inclus d'autres connaissances liées à cette question
    Je veux des questions courtes. Je veux les questions au format JSON, avec le nom de la question et la réponse. Par exemple : { "question": "Quel est le nom de l'auteur ?", "answer": "Victor Hugo" }`;
    const chatResponse = await client.chat.complete({
      model: "mistral-large-latest",
      messages: [{ role: "user", content: prompt }],
    });

    let response =
      chatResponse.choices?.[0]?.message?.content ?? "No content available";
    console.log("Response:", response);
    if (typeof response === "string") {
      response = response.replace(/(\r\n|\n|\r)/gm, "");
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
  };

  const createGeneratedSubquestion = async (
    question: string,
    answer: string
  ) => {
    setNewSubquestion(question);
    setNewSubanswer(answer);
    await saveSubquestion();
  };

  return (
    <Modal open={isOpen} onClose={close}>
      <div className="EditCardForm">
        {activeTab === "subquestions" && (
          <>
            <button onClick={generateSubQuestions}>
              Générer les sous-questions
            </button>
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
            <div>
              <Button onClick={handleSaveSubquestionClick}>
                Enregistrer la question alternative
              </Button>
            </div>
            <GeneratedSubquestions
              subquestions={generatedSubquestions}
              addQuestion={createGeneratedSubquestion}
            />
          </>
        )}
        {activeTab === "question" && (
          <>
            <h1>
              Modifier la carte{" "}
              <button onClick={() => setActiveTab("subquestions")}>
                Sous-questions
              </button>
            </h1>
            <IconButton className="EditCardForm__close" onClick={close}>
              X
            </IconButton>
            <form onSubmit={submit}>
              <Input
                label="Question"
                type="text"
                value={newCard.question}
                onChange={function (
                  e: React.ChangeEvent<HTMLInputElement>
                ): void {
                  setNewCard({ ...newCard, question: e.target.value });
                }}
              />
              <Input
                label="Réponse"
                type="text"
                value={newCard.answer}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewCard({ ...newCard, answer: e.target.value })
                }
              />
              <Input
                label="URL d'image"
                type="text"
                value={newCard.imageLink}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewCard({ ...newCard, imageLink: e.target.value })
                }
              />
              <CategoryInput
                categoriesWithCount={categoriesWithCount}
                newCard={newCard}
                setNewCard={onCategoryChange}
              />
              <SubmitButton disabled={false}>Enregistrer</SubmitButton>
              <Button
                variant="danger"
                onClick={handleDeleteClick}
                customClassName="EditCardForm__delete"
              >
                <Delete /> Supprimer la carte
              </Button>
            </form>
          </>
        )}
      </div>
    </Modal>
  );
};
