import { useContext, useState } from "react";
import { RESOURCES, useFetch, usePost } from "../../../hooks/server";
import { Card } from "../../../types/common";
import { Modal } from "@mui/material";
import Input from "../../atoms/Input/Input";
import { ImagePaster } from "../../atoms/ImagePaster/ImagePaster";
import SubmitButton from "../../atoms/SubmitButton/SubmitButton";
import Button from "../../atoms/Button/Button";
import CategoryInput from "../../atoms/Input/CategoryInput/CategoryInput";
import { SnackbarContext } from "../../../context/SnackbarContext";
import { Hint } from "../../atoms/Hint/Hint";
import { makeQuestionsPrompt } from "../../molecules/EditCardForm/llmprompt";
import { Mistral } from "@mistralai/mistralai";
import Loader from "../../atoms/Loader/Loader";
const apiKey = import.meta.env.VITE_MISTRAL_API_KEY;

const client = new Mistral({ apiKey: apiKey });

interface CardFormModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const MultiCardFormModal = ({
  open,
  onClose,
  children,
}: CardFormModalProps) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <div className="CardFormPage__modal">{children}</div>
    </Modal>
  );
};

interface QuestionLineProps {
  question: string;
  answer: string;
  category?: string;
}
/**
 * Appears on the multiple questions modal
 */
export const QuestionLine = ({
  question,
  answer,
  category,
}: QuestionLineProps) => {
  const { post, loading } = usePost(RESOURCES.CARDS);
  const [isCreated, setIsCreated] = useState(false);
  const createCard = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!category) {
      const confirm = window.confirm("Y a pas de catégorie, êtes-vous sûr.e ?");
      if (!confirm) return;
    }
    const formData = new FormData();
    formData.append("question", question);
    formData.append("answer", answer);
    if (category) {
      formData.append("category", category);
    }
    await post(formData, "multipart/form-data");
    setIsCreated(true);
  };

  return (
    <div className="CardFormPage__modal-question">
      <div>
        <p>{question}</p>
        <p>{answer}</p>
      </div>
      <Button onClick={createCard} disabled={isCreated} isLoading={loading}>
        Créer
      </Button>
    </div>
  );
};

export interface FetchedCategory {
  category: string;
  count: number;
}

/**
 * question: String
 * answer: String
 * @returns
 */
export default () => {
  const { post, error, loading } = usePost(RESOURCES.CARDS);
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

    await post(formData, "multipart/form-data");
    setNewCard({
      ...newCard,
      question: "",
      answer: "",
      imageLink: "",
    });

    setImage(null);
    setShouldResetPaster(!shouldResetPaster);

    openSnackbarWithMessage("La carte a été ajoutée");
  };

  const generateQuestions = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const prompt = makeQuestionsPrompt({
      category: newCard?.category || "",
      subcategory: subcategory,
    });
    if (prompt !== "") {
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
        setSubQuestions(
          JSON.parse(response) as { question: string; answer: string }[]
        );
      } else {
        console.error("Unexpected response format:", response);
      }
      setIsLoading(false);
    }
  };
  return (
    <div className="CardFormPage">
      <MultiCardFormModal
        open={isModalOpen}
        onClose={closeModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <div className="CardFormPage__modal">
          <h2>Création de questions par IA</h2>
          <form>
            <div>
              <CategoryInput
                label="Je veux apprendre ..."
                categoriesWithCount={categoriesWithCount}
                newCard={newCard}
                setNewCard={setNewCard}
              />
            </div>
            <div>
              <Input
                label="Plus particulièrement"
                type="text"
                onChange={(e) => setSubcategory(e.target.value)}
                placeholder="Sous-catégorie"
                value={subcategory}
              />
            </div>
            <Button onClick={generateQuestions} disabled={!newCard.category}>
              Générer
            </Button>
          </form>
          <div className="CardFormPage__modal-questions">
            {isGenerationLoading && <Loader />}
            {subQuestions &&
              subQuestions.map(({ question, answer }, index) => (
                <QuestionLine
                  key={index}
                  question={question}
                  answer={answer}
                  category={newCard.category}
                />
              ))}
          </div>
        </div>
      </MultiCardFormModal>
      <form onSubmit={onSubmit} className="CardFormPage__form">
        <h1 className="CardFormPage__header">Ajouter une carte</h1>
        <div className="CardFormPage__body">
          <Input
            label="Question"
            type="text"
            value={newCard.question || ""} // Prevents 'controlled to uncontrolled' warning
            onChange={(e) =>
              setNewCard({ ...newCard, question: e.target.value })
            }
            className="CardFormPage__form-group"
          />
          <Input
            label="Réponse"
            type="text"
            name="answer"
            value={newCard.answer || ""} // Prevents 'controlled to uncontrolled' warning
            onChange={onChange}
            className="CardFormPage__form-group"
          />
          <Hint text="Cherchez une catégorie dans la liste, ou créez-en une nouvelle" />
          <CategoryInput
            categoriesWithCount={categoriesWithCount}
            newCard={newCard}
            setNewCard={setNewCard}
          />

          <Button
            onClick={openModal}
            customClassName="CardFormPage__modal-button"
          >
            Import multiple
          </Button>

          <Input
            label="Lien d'une image"
            type="text"
            name="imageLink"
            value={newCard.imageLink || ""}
            onChange={onChange}
            className="CardFormPage__form-group"
            placeholder="Collez le lien d'une image"
          />
          <ImagePaster
            onUpload={(file) => setImage(file)}
            shouldReset={shouldResetPaster}
          />
          <label className="CardFormPage__form-group">
            Ajouter une image
            <input type="file" onChange={onFileChange} />
          </label>
        </div>
        <div className="CardFormPage__footer">
          <SubmitButton
            disabled={false}
            className="CardFormPage__submit"
            isLoading={loading}
          >
            Enregistrer
          </SubmitButton>
        </div>
      </form>
      <div>{error}</div>
    </div>
  );
};
