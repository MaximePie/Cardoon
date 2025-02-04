import { useState } from "react";
import { RESOURCES, usePost } from "../../../hooks/server";

interface CardFormProps {
  onAdd: () => void;
}

/**
 * question: String
 * answer: String
 * @returns
 */
export default ({ onAdd }: CardFormProps) => {
  const { post, error } = usePost(RESOURCES.CARDS);

  const [newCard, setNewCard] = useState({
    question: "",
    answer: "",
    imageLink: "",
  });

  const [image, setImage] = useState<File | null>(null);

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
    formData.append("question", newCard.question);
    formData.append("answer", newCard.answer);
    formData.append("imageLink", newCard.imageLink);
    if (image) {
      formData.append("image", image);
    }

    await post(formData, "multipart/form-data");
    setNewCard({
      question: "",
      answer: "",
      imageLink: "",
    });

    setImage(null);

    onAdd();
  };

  return (
    <>
      <form onSubmit={onSubmit}>
        <label>
          Question:
          <input
            type="text"
            name="question"
            value={newCard.question}
            onChange={onChange}
          />
        </label>
        <label>
          Réponse:
          <input
            type="text"
            name="answer"
            value={newCard.answer}
            onChange={onChange}
          />
        </label>
        <label>
          Image:
          <input type="file" onChange={onFileChange} />
        </label>
        <label>
          Image link:
          <input
            type="text"
            name="imageLink"
            value={newCard.imageLink}
            onChange={onChange}
          />
        </label>
        <button type="submit">Ajouter</button>
      </form>
      <div>{error}</div>
    </>
  );
};
