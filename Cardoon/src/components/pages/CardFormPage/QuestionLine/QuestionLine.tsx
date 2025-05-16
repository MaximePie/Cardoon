import Button from "../../../../components/atoms/Button/Button";
import { useState } from "react";
import { RESOURCES, usePost } from "../../../../hooks/server";

interface QuestionLineProps {
  question: string;
  answer: string;
  category?: string;
}
/**
 * Appears on the multiple questions modal
 */
const QuestionLine = ({ question, answer, category }: QuestionLineProps) => {
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

export default QuestionLine;
