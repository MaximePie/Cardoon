import { useContext, useState } from "react";
import { SnackbarContext } from "../../../context/SnackbarContext";
import { RESOURCES, useFetch, usePost } from "../../../hooks/server";
import { Card } from "../../../types/common";
import { FetchedCategory, MistralResponse } from "./CardFormPage";

interface hookReturnType {
  isGenerationLoading: boolean;
  isModalOpen: boolean;
  categoriesWithCount: string[];
  newCard: Partial<Card>;
  isCreating: boolean;
  createError: string | undefined;
  setNewCard: React.Dispatch<React.SetStateAction<Partial<Card>>>;
  subQuestions: { question: string; answer: string }[] | null;
  subcategory: string;
  setSubcategory: React.Dispatch<React.SetStateAction<string>>;
  openModal: () => void;
  closeModal: () => void;
  generateQuestions: (e: React.MouseEvent<HTMLButtonElement>) => void;
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
  const { asyncPost: postMistral } = usePost<MistralResponse>(
    RESOURCES.MISTRAL
  );

  const { data: categoriesData } = useFetch<FetchedCategory[]>(
    RESOURCES.CATEGORIES
  );
  const categoriesWithCount =
    categoriesData?.map(
      ({ category: category, count }) => `${category} (${count})`
    ) || [];

  const { openSnackbarWithMessage } = useContext(SnackbarContext);

  const [newCard, setNewCard] = useState<Partial<Card>>({
    question: "",
    answer: "",
    imageLink: "",
    category: "",
    expectedAnswers: ["", "", ""],
  });

  // Only used for generated questions, it's not supposed to become a category
  const [subcategory, setSubcategory] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [image, setImage] = useState<File | null>(null);
  const [shouldResetPaster, setShouldResetPaster] = useState(false);
  const [subQuestions, setSubQuestions] = useState<
    { question: string; answer: string }[] | null
  >(null);
  const [isGenerationLoading, setIsLoading] = useState(false);

  const closeModal = () => setIsModalOpen(false);

  const openModal = () => {
    setSubQuestions(null);
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

  const generateQuestions = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const response = await postMistral({
      category: newCard.category,
      subcategory,
      promptType: "generatedQuestions",
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
    const parsedResponse = JSON.parse(jsonResponse);
    setSubQuestions(parsedResponse);
    setSubcategory("");

    setIsLoading(false);
  };
  return {
    isGenerationLoading,
    isModalOpen,
    categoriesWithCount,
    newCard,
    setNewCard,
    subQuestions,
    subcategory,
    setSubcategory,
    openModal,
    closeModal,
    generateQuestions,
    onFileChange,
    onSubmit,
    onChange,
    isCreating,
    createError,
    setImage,
    shouldResetPaster,
  };
}
