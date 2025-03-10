import { useState } from "react";
import { RESOURCES, useFetch, usePost } from "../../../hooks/server";
import { Card } from "../../../types/common";
import { Autocomplete, createFilterOptions, TextField } from "@mui/material";
import { TokenErrorPage } from "../TokenErrorPage/TokenErrorPage";
import Input from "../../atoms/Input/Input";
import { SubmitButton } from "../LoginPage/LoginPage";
import { ImagePaster } from "../../atoms/ImagePaster/ImagePaster";

// TODO - Fix submit button at bottom of form
// TODO - Add a max height to form and a scrollbar

const filter = createFilterOptions<String>();

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

  const [image, setImage] = useState<File | null>(null);
  const [shouldResetPaster, setShouldResetPaster] = useState(false);

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

  return (
    <div className="CardFormPage">
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
