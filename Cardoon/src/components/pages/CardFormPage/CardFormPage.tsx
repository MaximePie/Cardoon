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
      <button onClick={createCard} disabled={isCreated}>
        {loading ? "..." : "Créer"}
      </button>
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
  const { post, error } = usePost(RESOURCES.CARDS);
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
  // const [jsonFileData, setJsonFileData] = useState<string>("");

  const closeModal = () => setIsModalOpen(false);

  // const openModal = () => {
  //   setJsonFileData("");
  //   setIsModalOpen(true);
  // };

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
    // if (!newCard.category || !subcategory) return;
    // const prompt = `Je veux apprendre ${newCard.category}, plus particulièrement sur ${subcategory}, de difficulté ${difficulty}
    // Génère 10 flashcard. Forme JSON Q/R.
    // { "question": "...", "answer": "..."} \n\n`;

    // const testPrompt =
    //   "Je veux apprendre la biologie, plus particulièrement la géologie, et j’aimerais 10 flashcards sous forme JSON (Q/R).";
    // const testPrompt = `Tu es un assistant qui génère 10 flashcards sur la géologie, uniquement au format JSON. Chaque flashcard doit prendre la forme d’un objet avec 'question' et 'answer'. Ne fournis aucune explication, aucun texte supplémentaire, ni aucune introduction. Seul du JSON, comme ceci :
    // [{ "question": "...", "answer": "..." }, ... ]`;
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
          <h2>Création par IA</h2>
          <p>
            Demander à l'IA de générer des questions pour vous. Entrez une
            catégorie, et une sous catégorie
          </p>
          <form>
            <CategoryInput
              categoriesWithCount={categoriesWithCount}
              newCard={newCard}
              setNewCard={setNewCard}
            />
            <input
              type="text"
              onChange={(e) => setSubcategory(e.target.value)}
              placeholder="Sous-catégorie"
              value={subcategory}
            />
            <Button onClick={generateQuestions}>Générer</Button>
            {/* <div className="CardFormPage__modal-questions">
              {jsonFileData &&
                JSON.parse(jsonFileData).map((card: Card) => (
                  <QuestionLine
                    key={card.question}
                    question={card.question}
                    answer={card.answer}
                    category={newCard.category}
                  />
                ))}
            </div> */}
          </form>
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
          <CategoryInput
            categoriesWithCount={categoriesWithCount}
            newCard={newCard}
            setNewCard={setNewCard}
          />

          {/* <Button
            onClick={openModal}
            customClassName="CardFormPage__modal-button"
          >
            Import multiple
          </Button> */}
          <label className="CardFormPage__form-group">
            Uploader une image:
            <input type="file" onChange={onFileChange} />
          </label>
          <Input
            label="Lien d'une image"
            type="text"
            name="imageLink"
            value={newCard.imageLink || ""}
            onChange={onChange}
            className="CardFormPage__form-group"
          />
          <ImagePaster
            onUpload={(file) => setImage(file)}
            shouldReset={shouldResetPaster}
          />
        </div>
        <div className="CardFormPage__footer">
          <SubmitButton disabled={false} className="CardFormPage__submit">
            Ajouter la carte
          </SubmitButton>
        </div>
      </form>
      <div>{error}</div>
    </div>
  );
};
