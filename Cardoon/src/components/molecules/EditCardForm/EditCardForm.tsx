import Delete from "@mui/icons-material/Delete";
import { IconButton, Modal } from "@mui/material";
import { PopulatedUserCard } from "../../../types/common";
import Button from "../../atoms/Button/Button";
import CategoryInput from "../../atoms/Input/CategoryInput/CategoryInput";
import Input from "../../atoms/Input/Input";
import SubmitButton from "../../atoms/SubmitButton/SubmitButton";
import SubQuestionsTab from "./SubQuestionsTab/SubQuestionsTab";
import useEditCardForm from "./useEditCardForm";

interface EditCardFormProps {
  isOpen: boolean;
  close: () => void;
  editedCard: PopulatedUserCard;
  afterDelete: () => void;
}

export default function EditCardForm({
  isOpen,
  close,
  editedCard,
  afterDelete,
}: EditCardFormProps) {
  const {
    updateField,
    errors,
    formValues,
    activeTab,
    setActiveTab,
    handleClose,
    onCategoryChange,
    handleDeleteClick,
    submit,
    invertCard,
    categoriesWithCount,
    invertedCard,
  } = useEditCardForm({
    isOpen,
    close,
    editedCard,
    afterDelete,
  });

  return (
    <Modal open={isOpen} onClose={handleClose}>
      <div className="EditCardForm">
        {activeTab === "subquestions" && (
          <SubQuestionsTab
            editedCard={editedCard}
            newCard={formValues}
            goBack={() => setActiveTab("question")}
          />
        )}
        {activeTab === "question" && (
          <>
            <h1>
              Modifier la carte{" "}
              <Button
                variant="secondary"
                onClick={() => setActiveTab("subquestions")}
              >
                Sous-questions
              </Button>
              <Button
                variant="secondary"
                disabled={
                  editedCard.card.isInverted ||
                  editedCard.card.hasInvertedChild ||
                  invertedCard !== null
                }
                onClick={invertCard}
              >
                Créer une question inverse
              </Button>
            </h1>
            <IconButton className="EditCardForm__close" onClick={close}>
              X
            </IconButton>
            <form onSubmit={submit}>
              <Input
                label="Question"
                type="text"
                value={formValues.question || ""}
                name="question"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  updateField("question", e.target.value);
                }}
                isRequired={true}
              />
              {errors.question && (
                <span style={{ color: "red" }}>{errors.question.message}</span>
              )}

              <Input
                label="Réponse"
                type="text"
                value={formValues.answer || ""}
                name="answer"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  updateField("answer", e.target.value);
                }}
                isRequired={true}
              />
              {errors.answer && (
                <span style={{ color: "red" }}>{errors.answer.message}</span>
              )}

              {formValues.expectedAnswers?.map(
                (expectedAnswer: string, index: number) => (
                  <Input
                    key={index}
                    label={`Réponse attendue ${index + 1}`}
                    type="text"
                    value={expectedAnswer || ""}
                    name={`expectedAnswers.${index}`}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const updatedAnswers = [
                        ...(formValues.expectedAnswers ?? []),
                      ];
                      updatedAnswers[index] = e.target.value;
                      updateField("expectedAnswers", updatedAnswers);
                    }}
                  />
                )
              )}

              <Input
                label="URL d'image"
                type="text"
                value={formValues.imageLink || ""}
                name="imageLink"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  updateField("imageLink", e.target.value);
                }}
              />

              <CategoryInput
                categoriesWithCount={categoriesWithCount}
                value={formValues.category || ""}
                onChange={onCategoryChange}
                label="Catégorie"
                isRequired={true}
              />
              {errors.category && (
                <span style={{ color: "red" }}>{errors.category.message}</span>
              )}
              <div className="EditCardForm__buttons">
                <SubmitButton disabled={false}>Enregistrer</SubmitButton>
                <Button
                  variant="danger"
                  onClick={handleDeleteClick}
                  customClassName="EditCardForm__delete"
                >
                  <Delete /> Supprimer la carte
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </Modal>
  );
}
