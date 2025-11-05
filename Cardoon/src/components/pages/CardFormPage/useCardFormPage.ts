import { useContext, useState } from "react";
import { useCategoriesContext } from "../../../context/CategoriesContext";
import { SnackbarContext } from "../../../context/SnackbarContext";
import { RESOURCES, usePost } from "../../../hooks/server";
import { Card } from "../../../types/common";

interface hookReturnType {
  isModalOpen: boolean;
  categoriesWithCount: string[];
  newCard: Partial<Card>;
  isCreating: boolean;
  createError: string | undefined;
  setNewCard: React.Dispatch<React.SetStateAction<Partial<Card>>>;
  openModal: () => void;
  closeModal: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setImage: React.Dispatch<React.SetStateAction<File | null>>;
  shouldResetPaster: boolean;
}

// Functional hook with logic for CardFormPage component
export default function useCardFormPage(): hookReturnType {
  const {
    post,
    error: createError,
    loading: isCreating,
  } = usePost(RESOURCES.CARDS);

  const { categoriesWithCount } = useCategoriesContext();

  const { openSnackbarWithMessage } = useContext(SnackbarContext);

  const [newCard, setNewCard] = useState<Partial<Card>>({
    question: "",
    answer: "",
    imageLink: "",
    category: "",
    expectedAnswers: ["", "", ""],
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [image, setImage] = useState<File | null>(null);
  const [shouldResetPaster, setShouldResetPaster] = useState(false);
  const closeModal = () => setIsModalOpen(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCard({
      ...newCard,
      [e.target.name]: e.target.value,
    });
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();

    if (!newCard.question || !newCard.answer) {
      return;
    }

    formData.append("question", newCard.question);
    formData.append("answer", newCard.answer);
    if (newCard.imageLink) {
      formData.append("imageLink", newCard.imageLink);
    }
    if (image) {
      formData.append("image", image);
    }

    if (newCard.category) {
      formData.append("category", newCard.category);
    }
    if (newCard.expectedAnswers) {
      const cleaned = newCard.expectedAnswers
        .map((s) => s.trim())
        .filter(Boolean);
      if (cleaned.length) {
        cleaned.forEach((expectedAnswer) => {
          formData.append("expectedAnswers", expectedAnswer);
        });
      }
    }
    await post(formData, "multipart/form-data");
    setNewCard({
      ...newCard,
      question: "",
      answer: "",
      imageLink: "",
      expectedAnswers: ["", "", ""],
    });

    setImage(null);
    setShouldResetPaster(!shouldResetPaster);

    openSnackbarWithMessage("La carte a été ajoutée");
  };

  return {
    isModalOpen,
    categoriesWithCount,
    newCard,
    setNewCard,
    openModal,
    closeModal,
    onFileChange,
    onSubmit,
    onChange,
    isCreating,
    createError,
    setImage,
    shouldResetPaster,
  };
}
