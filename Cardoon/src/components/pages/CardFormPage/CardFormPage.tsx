import { useState } from "react";
import { RESOURCES, useFetch, usePost } from "../../../hooks/server";
import { Card } from "../../../types/common";
import {
  Autocomplete,
  createFilterOptions,
  Modal,
  TextField,
} from "@mui/material";
import { TokenErrorPage } from "../TokenErrorPage/TokenErrorPage";
import Input from "../../atoms/Input/Input";
import { ImagePaster } from "../../atoms/ImagePaster/ImagePaster";
import SubmitButton from "../../atoms/SubmitButton/SubmitButton";
import Button from "../../atoms/Button/Button";

const filter = createFilterOptions<String>();

interface CardFormModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const CardFormModal = ({ open, onClose, children }: CardFormModalProps) => {
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

/**
 * question: String
 * answer: String
 * @returns
 */
export default () => {
  const { post, error } = usePost(RESOURCES.CARDS);
  const { data: categoriesData } = useFetch<String[]>(RESOURCES.CATEGORIES);
  const formatedCategories = categoriesData?.filter(
    (category) => category !== null
  );

  const [newCard, setNewCard] = useState<Partial<Card>>({
    question: "",
    answer: "",
    imageLink: "",
    category: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [image, setImage] = useState<File | null>(null);
  const [shouldResetPaster, setShouldResetPaster] = useState(false);
  const [jsonFileData, setJsonFileData] = useState<string>("");

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

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
  };

  if (error === "Invalid token") {
    return <TokenErrorPage />;
  }

  console.log(jsonFileData);
  return (
    <div className="CardFormPage">
      <CardFormModal
        open={isModalOpen}
        onClose={closeModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <div className="CardFormPage__modal">
          <form>
            <input
              type="file"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    setJsonFileData(e.target?.result as string);
                  };
                  reader.readAsText(e.target.files[0]);
                }
              }}
            />
            <Autocomplete
              id="card-category"
              options={formatedCategories || []}
              sx={{ width: 300 }}
              renderInput={(params) => (
                <TextField {...params} label="Catégorie" />
              )}
              value={newCard.category}
              onChange={(_, newValue) => {
                if (typeof newValue === "string") {
                  if (newValue.includes("Créer: ")) {
                    const newCategory = newValue.replace("Créer: ", "");
                    setNewCard({ ...newCard, category: newCategory });
                  } else {
                    setNewCard({ ...newCard, category: newValue });
                  }
                }
              }}
              filterOptions={(options, params) => {
                const filtered = filter(options, params);

                const { inputValue } = params;
                // Suggest the creation of a new value
                const isExisting = options.some(
                  (option) => inputValue === option
                );
                if (inputValue !== "" && !isExisting) {
                  filtered.push(`Créer: ${inputValue}`);
                }
                return filtered;
              }}
            />
            <div className="CardFormPage__modal-questions">
              {jsonFileData &&
                JSON.parse(jsonFileData).map((card: Card) => (
                  <QuestionLine
                    key={card.question}
                    question={card.question}
                    answer={card.answer}
                    category={newCard.category}
                  />
                ))}
            </div>
          </form>
        </div>
      </CardFormModal>
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
          <Autocomplete
            id="card-category"
            options={formatedCategories || []}
            sx={{ width: 300 }}
            renderInput={(params) => (
              <TextField {...params} label="Catégorie" />
            )}
            value={newCard.category}
            onChange={(_, newValue) => {
              if (typeof newValue === "string") {
                if (newValue.includes("Créer: ")) {
                  const newCategory = newValue.replace("Créer: ", "");
                  setNewCard({ ...newCard, category: newCategory });
                } else {
                  setNewCard({ ...newCard, category: newValue });
                }
              }
            }}
            filterOptions={(options, params) => {
              const filtered = filter(options, params);

              const { inputValue } = params;
              // Suggest the creation of a new value
              const isExisting = options.some(
                (option) => inputValue === option
              );
              if (inputValue !== "" && !isExisting) {
                filtered.push(`Créer: ${inputValue}`);
              }
              return filtered;
            }}
          />

          <Button onClick={openModal} className="CardFormPage__modal-button">
            Import multiple
          </Button>
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
