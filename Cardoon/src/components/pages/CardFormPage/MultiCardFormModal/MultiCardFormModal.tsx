import { Modal } from "@mui/material";
import Button from "../../../atoms/Button/Button";
import CategoryInput from "../../../atoms/Input/CategoryInput/CategoryInput";
import Input from "../../../atoms/Input/Input";
import Loader from "../../../atoms/Loader/Loader";
import QuestionLine from "../QuestionLine/QuestionLine";
import useMultiCardFormModal from "./useMultiCardFormModal";

interface CardFormModalProps {
  open: boolean;
  onClose: () => void;
}

export default function MultiCardFormModal({
  open,
  onClose,
}: CardFormModalProps) {
  const {
    isGenerationLoading,
    subQuestions,
    subcategory,
    setSubcategory,
    generateQuestions,
    categoriesWithCount,
    updateCategory,
    isCategoriesLoading,
    newCard,
  } = useMultiCardFormModal();
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <div className="CardFormPage__modal">
        <div className="CardFormPage__modal">
          <h2>Création de questions par IA</h2>
          <form>
            <div>
              <CategoryInput
                label="Je veux apprendre ..."
                categoriesWithCount={categoriesWithCount}
                newCard={newCard}
                onChange={updateCategory}
                isRequired={true}
                isLoading={isCategoriesLoading}
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
                key={`${index}-${question}`}
                question={question}
                answer={answer}
                category={newCard.category}
                aria-label={`Question générée ${index + 1} sur ${subQuestions.length}`}
              />
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
