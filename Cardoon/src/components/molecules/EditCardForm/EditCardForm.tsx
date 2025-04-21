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

  const saveSubquestion = async (event: React.MouseEvent) => {
    event.preventDefault();
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

  return (
    <Modal open={isOpen} onClose={close}>
      <div className="EditCardForm">
        <h1>Modifier la carte</h1>
        <IconButton className="EditCardForm__close" onClick={close}>
          X
        </IconButton>
        <form onSubmit={submit}>
          <Input
            label="Question"
            type="text"
            value={newCard.question}
            onChange={function (e: React.ChangeEvent<HTMLInputElement>): void {
              setNewCard({ ...newCard, question: e.target.value });
            }}
          />
          <Input
            label="Answer"
            type="text"
            value={newCard.answer}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewCard({ ...newCard, answer: e.target.value })
            }
          />
          <Input
            label="Image link"
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

          <Button onClick={(e) => saveSubquestion(e)}>
            Enregistrer la question alternative
          </Button>
        </form>
      </div>
    </Modal>
  );
};
