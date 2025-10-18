import Loader from "../../../atoms/Loader/Loader";
import SubQuestion from "./SubQuestion";

interface GeneratedSubquestionsProps {
  subquestions: { question: string; answer: string }[] | null;
  addQuestion: (question: string, answer: string) => void;
  isLoading: boolean;
}

const GeneratedSubquestions = ({
  subquestions,
  addQuestion,
  isLoading,
}: GeneratedSubquestionsProps) => {
  return (
    <div className="GeneratedSubquestions">
      <h2>Questions générées</h2>
      {isLoading && (
        <div className="GeneratedSubquestions__loader">
          <Loader />
        </div>
      )}
      {!isLoading && !subquestions?.length && <p>Aucune question générée.</p>}
      {subquestions?.map((subquestion, index) => (
        <SubQuestion
          key={index}
          question={subquestion.question}
          answer={subquestion.answer}
          addQuestion={addQuestion}
        />
      ))}
    </div>
  );
};

export default GeneratedSubquestions;
