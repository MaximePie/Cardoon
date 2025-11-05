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
            newCard={newCard}
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
                value={newCard.question}
                onChange={function (
                  e: React.ChangeEvent<HTMLInputElement>
                ): void {
                  setNewCard({ ...newCard, question: e.target.value });
                }}
              />
              <Input
                label="Réponse"
                type="text"
                value={newCard.answer}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewCard({ ...newCard, answer: e.target.value })
                }
              />
              {newCard.expectedAnswers?.map((expectedAnswer, index) => (
                <Input
                  key={index}
                  label={`Réponse attendue ${index + 1}`}
                  type="text"
                  value={expectedAnswer}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const updatedAnswers = [...(newCard.expectedAnswers ?? [])];
                    updatedAnswers[index] = e.target.value;
                    setNewCard({ ...newCard, expectedAnswers: updatedAnswers });
                  }}
                />
              ))}
              <Input
                label="URL d'image"
                type="text"
                value={newCard.imageLink}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewCard({ ...newCard, imageLink: e.target.value })
                }
              />
              <CategoryInput
                categoriesWithCount={categoriesWithCount}
                value={newCard.category || ""}
                onChange={onCategoryChange}
                label="Catégorie"
                isRequired={true}
              />
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
