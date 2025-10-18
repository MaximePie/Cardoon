import Delete from "@mui/icons-material/Delete";
import { IconButton, Modal } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { SnackbarContext } from "../../../context/SnackbarContext";
import {
  ACTIONS,
  RESOURCES,
  useDelete,
  usePost,
  usePut,
} from "../../../hooks/server";
import { PopulatedUserCard } from "../../../types/common";
import Button from "../../atoms/Button/Button";
import CategoryInput from "../../atoms/Input/CategoryInput/CategoryInput";
import Input from "../../atoms/Input/Input";
import SubmitButton from "../../atoms/SubmitButton/SubmitButton";
import { FetchedCategory } from "../../pages/CardFormPage/CardFormPage";
import SubQuestionsTab from "./SubQuestionsTab/SubQuestionsTab";

interface EditCardFormProps {
  isOpen: boolean;
  close: () => void;
  editedCard: PopulatedUserCard;
  categories: FetchedCategory[];
  afterDelete: () => void;
}

export default function EditCardForm({
  isOpen,
  close,
  editedCard,
  categories,
  afterDelete,
}: EditCardFormProps) {
  const {
    card: { question, answer, imageLink, category, expectedAnswers },
  } = editedCard;

  const { openSnackbarWithMessage } = useContext(SnackbarContext);

  const { put } = usePut(RESOURCES.CARDS);
  const { post: invertCardPost, data: invertedCardData } = usePost<{
    invertedCard: PopulatedUserCard | null;
    originalCard: PopulatedUserCard | null;
  }>(ACTIONS.INVERT_CARD);
  const { deleteResource } = useDelete(RESOURCES.CARDS);
  const [invertedCard, setInvertedCard] = useState<null | PopulatedUserCard>(
    null
  );

  useEffect(() => {
    if (invertedCardData) {
      setInvertedCard(invertedCardData.invertedCard);
      openSnackbarWithMessage("La carte inverse a bien été créée");
    }
  }, [invertedCardData, setInvertedCard, openSnackbarWithMessage]);

  const [newCard, setNewCard] = useState({
    question,
    answer,
    imageLink,
    category,
    expectedAnswers: (expectedAnswers ?? []).concat(["", "", ""]).slice(0, 3),
  });

  const [activeTab, setActiveTab] = useState<"question" | "subquestions">(
    "question"
  );

  const handleClose = () => {
    setActiveTab("question");
    close();
  };

  useEffect(() => {
    setNewCard({
      question,
      answer,
      imageLink,
      category,
      expectedAnswers: (expectedAnswers ?? []).concat(["", "", ""]).slice(0, 3),
    });
  }, [
    isOpen,
    editedCard,
    question,
    answer,
    imageLink,
    category,
    expectedAnswers,
  ]);

  const categoriesWithCount = categories.map(
    (category) => `${category.category} (${category.count})`
  );

  const onCategoryChange = (updatedCard: Partial<typeof newCard>) => {
    setNewCard({ ...newCard, ...updatedCard });
  };

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const confirm = window.confirm(
      "Êtes-vous sûr de vouloir supprimer cette carte ?" +
        "\nCette action est irréversible."
    );
    if (!confirm) return;
    await deleteResource(editedCard.card._id);
    close();
    afterDelete();
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
      expectedAnswers: ["", "", ""],
    });
    close();
    openSnackbarWithMessage("La carte a été mise à jour");
  };

  // Send to the server a request to create an inverted card
  const invertCard = async () => {
    await invertCardPost({
      cardId: editedCard.card._id,
    });
  };

  return (
    <Modal open={isOpen} onClose={handleClose}>
      <div className="EditCardForm">
        {activeTab === "subquestions" && (
          <SubQuestionsTab
            editedCard={editedCard}
            newCard={newCard}
            goBack={() => setActiveTab("question")}
          />
        )}
        {activeTab === "question" && (
          <>
            <h1>
              Modifier la carte{" "}
              <Button
                variant="secondary"
                onClick={() => setActiveTab("subquestions")}
              >
                Sous-questions
              </Button>
              <Button
                variant="secondary"
                disabled={
                  editedCard.card.isInverted ||
                  editedCard.card.hasInvertedChild ||
                  invertedCard !== null
                }
                onClick={invertCard}
              >
                Créer une question inverse
              </Button>
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
              {newCard.expectedAnswers?.map((expectedAnswer, index) => (
                <Input
                  key={index}
                  label={`Réponse attendue ${index + 1}`}
                  type="text"
                  value={expectedAnswer}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const updatedAnswers = [...(newCard.expectedAnswers ?? [])];
                    updatedAnswers[index] = e.target.value;
                    setNewCard({ ...newCard, expectedAnswers: updatedAnswers });
                  }}
                />
              ))}
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
              <div className="EditCardForm__buttons">
                <SubmitButton disabled={false}>Enregistrer</SubmitButton>
                <Button
                  variant="danger"
                  onClick={handleDeleteClick}
                  customClassName="EditCardForm__delete"
                >
                  <Delete /> Supprimer la carte
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </Modal>
  );
}
