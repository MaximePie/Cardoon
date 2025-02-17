import { useState } from "react";
import { RESOURCES, useFetch, usePost } from "../../../hooks/server";
import { Card } from "../../../types/common";
import { Autocomplete, createFilterOptions, TextField } from "@mui/material";

const filter = createFilterOptions<String>();

/**
 * question: String
 * answer: String
 * @returns
 */
export default () => {
  const { post, error } = usePost(RESOURCES.CARDS);
  const { data: categories } = useFetch<String[]>(RESOURCES.CATEGORIES);

  const [newCard, setNewCard] = useState<Partial<Card>>({
    question: "",
    answer: "",
    imageLink: "",
    category: "",
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
      question: "",
      answer: "",
      imageLink: "",
      category: "",
    });

    setImage(null);
  };

  return (
    <div className="CardForm">
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
        <Autocomplete
          id="card-category"
          options={categories || []}
          sx={{ width: 300 }}
          renderInput={(params) => <TextField {...params} label="Catégorie" />}
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
            const isExisting = options.some((option) => inputValue === option);
            if (inputValue !== "" && !isExisting) {
              filtered.push(`Créer: ${inputValue}`);
            }
            return filtered;
          }}
        />
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
    </div>
  );
};
