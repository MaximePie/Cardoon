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
import { makeQuestionsPrompt } from "../../molecules/EditCardForm/llmprompt";
import Loader from "../../atoms/Loader/Loader";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

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

export type MistralResponse = {
  content: string;
};

/**
 * question: String
 * answer: String
 * @returns
 */
export default () => {
  const { post, error, loading } = usePost(RESOURCES.CARDS);
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
    let response = await postMistral({
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
                isRequired={true}
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
            <Button
              onClick={generateQuestions}
              disabled={!newCard.category || isGenerationLoading}
            >
              Générer
            </Button>
          </form>
          <div className="CardFormPage__modal-questions">
            {isGenerationLoading && <Loader />}
            {subQuestions?.map(({ question, answer }, index) => (
              <QuestionLine
                key={index + question + answer}
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
            isRequired={true}
          />
          <Input
            label="Réponse"
            type="text"
            name="answer"
            value={newCard.answer || ""} // Prevents 'controlled to uncontrolled' warning
            onChange={onChange}
            className="CardFormPage__form-group"
            isRequired={true}
          />
          <CategoryInput
            categoriesWithCount={categoriesWithCount}
            newCard={newCard}
            setNewCard={setNewCard}
            isRequired={true}
          />

          <Button
            onClick={openModal}
            customClassName="CardFormPage__modal-button"
            variant="secondary"
            icon={<AutoAwesomeIcon />}
          >
            Générer des questions
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
          {!newCard.imageLink && (
            <ImagePaster
              onUpload={(file) => setImage(file)}
              shouldReset={shouldResetPaster}
            />
          )}
          {!newCard.imageLink && (
            <label className="CardFormPage__form-group">
              Ajouter une image
              <input type="file" onChange={onFileChange} />
            </label>
          )}
        </div>
        <div className="CardFormPage__footer">
          <SubmitButton
            disabled={!newCard.question || !newCard.answer || !newCard.category}
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
