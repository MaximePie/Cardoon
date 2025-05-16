import { IconButton, Modal } from "@mui/material";
import { PopulatedUserCard } from "../../../types/common";
import { useContext, useEffect, useState } from "react";
import CategoryInput from "../../atoms/Input/CategoryInput/CategoryInput";
import { FetchedCategory } from "../../pages/CardFormPage/CardFormPage";
import { RESOURCES, useDelete, usePut } from "../../../hooks/server";
import Delete from "@mui/icons-material/Delete";
import { SnackbarContext } from "../../../context/SnackbarContext";
import Input from "../../atoms/Input/Input";
import SubmitButton from "../../atoms/SubmitButton/SubmitButton";
import Button from "../../atoms/Button/Button";
import SubQuestionsTab from "./SubQuestionsTab";

interface EditCardFormProps {
  isOpen: boolean;
  close: () => void;
  editedCard: PopulatedUserCard;
  categories: FetchedCategory[];
  afterDelete: () => void;
}

export default ({
  isOpen,
  close,
  editedCard,
  categories,
  afterDelete,
}: EditCardFormProps) => {
  const {
    card: { question, answer, imageLink, category },
  } = editedCard;

  const { openSnackbarWithMessage } = useContext(SnackbarContext);

  const { put } = usePut(RESOURCES.CARDS);
  const { deleteResource } = useDelete(RESOURCES.CARDS);

  const [newCard, setNewCard] = useState({
    question,
    answer,
    imageLink,
    category,
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
      "Êtes-vous sûr de vouloir supprimer cette carte ?" +
        "\nCette action est irréversible."
    );
    if (!confirm) return;
    await deleteResource(editedCard._id);
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
    });
    close();
    openSnackbarWithMessage("La carte a été mise à jour");
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
};
