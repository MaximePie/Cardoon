import { useState } from "react";
import Button from "../../../atoms/Button/Button";

interface SubQuestionProps {
  question: string;
  answer: string;
  addQuestion: (question: string, answer: string) => void;
}

const SubQuestion = ({ question, answer, addQuestion }: SubQuestionProps) => {
  const [isAdded, setIsAdded] = useState(false);

  const handleAddQuestion = () => {
    addQuestion(question, answer);
    setIsAdded(true);
  };

  return (
    <p className="GeneratedSubquestions__subquestion">
      <span className="GeneratedSubquestions__subquestion__text">
        <span className="GeneratedSubquestions__subquestion__text__question">
          {question}
        </span>
        <span className="GeneratedSubquestions__subquestion__text__answer">
          {answer}
        </span>
      </span>
      <Button
        variant="secondary"
        onClick={handleAddQuestion}
        disabled={isAdded}
      >
        {isAdded ? "✅ Ajouté" : "Ajouter"}
      </Button>
    </p>
  );
};

export default SubQuestion;
