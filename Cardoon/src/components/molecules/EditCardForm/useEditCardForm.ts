import { useContext, useEffect, useState } from "react";
import { useCategoriesContext } from "../../../context/CategoriesContext";
import { SnackbarContext } from "../../../context/SnackbarContext";
import {
  ACTIONS,
  RESOURCES,
  useDelete,
  usePost,
  usePut,
} from "../../../hooks/server";
import { PopulatedUserCard } from "../../../types/common";

interface UseEditCardFormProps {
  isOpen: boolean;
  close: () => void;
  editedCard: PopulatedUserCard;
  afterDelete: () => void;
}
export default function useEditCardForm({
  isOpen,
  close,
  editedCard,
  afterDelete,
}: UseEditCardFormProps) {
  const {
    card: { question, answer, imageLink, category, expectedAnswers },
  } = editedCard;

  const { openSnackbarWithMessage } = useContext(SnackbarContext);
  const { categoriesWithCount } = useCategoriesContext();
  const { put } = usePut(RESOURCES.CARDS);
  const {
    post: invertCardPost,
    data: invertedCardData,
    loading: invertLoading,
  } = usePost<{
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
  }, [isOpen, question, answer, imageLink, category, expectedAnswers]);

  const onCategoryChange = (newCategory: string) => {
    setNewCard({ ...newCard, category: newCategory });
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
      openSnackbarWithMessage(
        "Veuillez remplir les champs question et réponse",
        "error"
      );
      return;
    }

    if (!newCard.category) {
      openSnackbarWithMessage("Veuillez sélectionner une catégorie", "error");
      return;
    }

    formData.append("question", newCard.question);
    formData.append("answer", newCard.answer);
    formData.append("category", newCard.category);
    if (newCard.imageLink) {
      formData.append("imageLink", newCard.imageLink);
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
    if (
      invertLoading ||
      editedCard.card.isInverted ||
      editedCard.card.hasInvertedChild ||
      invertedCard
    ) {
      return;
    }
    await invertCardPost({ cardId: editedCard.card._id });
  };

  return {
    newCard,
    setNewCard,
    activeTab,
    setActiveTab,
    handleClose,
    onCategoryChange,
    handleDeleteClick,
    submit,
    invertCard,
    categoriesWithCount,
    invertedCard,
    invertLoading,
  };
}
