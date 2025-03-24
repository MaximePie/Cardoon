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

interface EditCardFormProps {
  isOpen: boolean;
  close: () => void;
  editedCard: PopulatedUserCard;
  categories: FetchedCategory[];
}

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
  const { deleteResource } = useDelete(RESOURCES.CARDS);

  const [newCard, setNewCard] = useState({
    question,
    answer,
    imageLink,
    category,
  });

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

  return (
    <Modal open={isOpen} onClose={close}>
      <div className="EditCardForm">
        <h1>Edit card</h1>
        <IconButton color="primary" onClick={handleDeleteClick} size="small">
          <Delete />
        </IconButton>
        <form onSubmit={submit}>
          <Input
            label="Question"
            type="text"
            value={question}
            onChange={function (e: React.ChangeEvent<HTMLInputElement>): void {
              setNewCard({ ...newCard, question: e.target.value });
            }}
          />
          <Input
            label="Answer"
            type="text"
            value={answer}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewCard({ ...newCard, answer: e.target.value })
            }
          />
          <Input
            label="Image link"
            type="text"
            value={imageLink}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewCard({ ...newCard, imageLink: e.target.value })
            }
          />
          <CategoryInput
            categoriesWithCount={categoriesWithCount}
            newCard={newCard}
            setNewCard={onCategoryChange}
          />
          <SubmitButton disabled={false}>Ajouter la carte</SubmitButton>
        </form>
      </div>
    </Modal>
  );
};
