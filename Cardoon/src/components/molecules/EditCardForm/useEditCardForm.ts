import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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

interface EditCardFormData {
  question: string;
  answer: string;
  imageLink: string;
  category: string;
  expectedAnswers: string[];
}

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
  const { put, error: putError } = usePut(RESOURCES.CARDS);
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

  // Configuration React Hook Form
  const {
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<EditCardFormData>({
    mode: "onChange", // Validation en temps réel
    defaultValues: {
      question: question || "",
      answer: answer || "",
      imageLink: imageLink || "",
      category: category || "",
      expectedAnswers: (expectedAnswers ?? []).concat(["", "", ""]).slice(0, 3),
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    if (invertedCardData) {
      setInvertedCard(invertedCardData.invertedCard);
      openSnackbarWithMessage("La carte inverse a bien été créée");
    }
  }, [invertedCardData, setInvertedCard, openSnackbarWithMessage]);

  const [activeTab, setActiveTab] = useState<"question" | "subquestions">(
    "question"
  );

  const handleClose = () => {
    setActiveTab("question");
    close();
  };

  // Réinitialiser le formulaire quand la modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      reset({
        question: question || "",
        answer: answer || "",
        imageLink: imageLink || "",
        category: category || "",
        expectedAnswers: (expectedAnswers ?? [])
          .concat(["", "", ""])
          .slice(0, 3),
      });
    }
  }, [isOpen, question, answer, imageLink, category, expectedAnswers, reset]);

  const onCategoryChange = (newCategory: string) => {
    setValue("category", newCategory);
    if (newCategory) {
      clearErrors("category");
    }
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

  const onSubmit = async (formData: EditCardFormData) => {
    const data = new FormData();

    // Validation supplémentaire pour la catégorie
    if (!formData.category) {
      setError("category", {
        type: "required",
        message: "Veuillez sélectionner une catégorie",
      });
      return;
    }

    data.append("question", formData.question);
    data.append("answer", formData.answer);
    data.append("category", formData.category);
    if (formData.imageLink) {
      data.append("imageLink", formData.imageLink);
    }

    // Append expectedAnswers - clean empty strings and append each answer separately
    if (formData.expectedAnswers) {
      const cleanedExpectedAnswers = formData.expectedAnswers
        .map((answer) => answer.trim())
        .filter(Boolean);
      cleanedExpectedAnswers.forEach((expectedAnswer) => {
        data.append("expectedAnswers", expectedAnswer);
      });
    }

    await put(editedCard.card._id, data);

    // Check if the PUT request failed
    if (putError) {
      openSnackbarWithMessage(
        `Erreur lors de la mise à jour de la carte: ${putError}`,
        "error"
      );
      return;
    }

    // Only proceed with UI changes if the PUT succeeded
    reset({
      question: "",
      answer: "",
      imageLink: "",
      category: "",
      expectedAnswers: ["", "", ""],
    });
    close();
    openSnackbarWithMessage("La carte a été mise à jour");
  };

  // Wrapper pour handleSubmit de react-hook-form
  const submit = handleSubmit(onSubmit);

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

  // Fonction helper pour mettre à jour les champs avec validation
  const updateField = (
    fieldName: keyof EditCardFormData,
    value: string | string[]
  ) => {
    if (fieldName === "expectedAnswers") {
      setValue(fieldName, value as string[]);
    } else {
      setValue(
        fieldName as "question" | "answer" | "imageLink" | "category",
        value as string
      );
    }
  };

  return {
    // React Hook Form
    updateField,
    errors,
    formValues: watchedValues,
    // Actions
    activeTab,
    setActiveTab,
    handleClose,
    onCategoryChange,
    handleDeleteClick,
    submit,
    invertCard,
    // Data
    categoriesWithCount,
    invertedCard,
    invertLoading,
  };
}
