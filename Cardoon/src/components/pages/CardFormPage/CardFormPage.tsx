import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import Button from "../../atoms/Button/Button";
import { ImagePaster } from "../../atoms/ImagePaster/ImagePaster";
import CategoryInput from "../../atoms/Input/CategoryInput/CategoryInput";
import Input from "../../atoms/Input/Input";
import SubmitButton from "../../atoms/SubmitButton/SubmitButton";
import MultiCardFormModal from "./MultiCardFormModal/MultiCardFormModal";
import useCardFormPage from "./useCardFormPage";

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
export default function CardFormPage() {
  const {
    isCreating,
    createError,
    setImage,
    shouldResetPaster,
    categoriesWithCount,
    newCard,
    setNewCard,
    isModalOpen,
    openModal,
    closeModal,
    onFileChange,
    onSubmit,
    onChange,
  } = useCardFormPage();

  return (
    <div className="CardFormPage">
      <MultiCardFormModal open={isModalOpen} onClose={closeModal} />
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
          {newCard.expectedAnswers?.map((value, index) => (
            <Input
              key={"subanswer-" + index}
              label={`Sous-réponse ${index + 1} (optionnelle)`}
              type="text"
              value={value}
              onChange={(e) => {
                const expectedAnswersArray = [...newCard.expectedAnswers!];
                expectedAnswersArray[index] = e.target.value;
                setNewCard({
                  ...newCard,
                  expectedAnswers: expectedAnswersArray,
                });
              }}
              className="CardFormPage__form-group"
            />
          ))}
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
            <>
              <label
                className="CardFormPage__form-group"
                htmlFor="image-upload"
              >
                <input
                  type="file"
                  onChange={onFileChange}
                  id="image-upload"
                  accept="image/*"
                  aria-describedby="aria-upload-help"
                />
              </label>
              <div id="aria-upload-help" className="visually-hidden">
                Ajoutez une image en cliquant sur le bouton ci-dessus.
              </div>
            </>
          )}
        </div>
        <div className="CardFormPage__footer">
          <SubmitButton
            disabled={!newCard.question || !newCard.answer || !newCard.category}
            className="CardFormPage__submit"
            isLoading={isCreating}
          >
            Enregistrer
          </SubmitButton>
        </div>
      </form>
      <div>{createError}</div>
    </div>
  );
}
