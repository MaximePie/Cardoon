import { useEffect, useState } from "react";
import { RESOURCES, useFetch, usePost } from "../../../hooks/server";
import { Card } from "../../../types/common";
import { Autocomplete, createFilterOptions, TextField } from "@mui/material";

const filter = createFilterOptions<String>();

interface ImagePasterProp {
  onUpload: (file: File) => void;
  shouldReset?: boolean; // Used to reset the preview in a useEffect
}
export const ImagePaster = ({ onUpload, shouldReset }: ImagePasterProp) => {
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (shouldReset) {
      setPreview("");
    }
  }, [shouldReset]);

  const handlePaste = async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imageTypes = item.types.filter((type) =>
          type.startsWith("image/")
        );
        if (imageTypes.length > 0) {
          const blob = await item.getType(imageTypes[0]);
          const extension = blob.type.split("/")[1]; // 'png', 'jpeg'...
          const filename = `pasted-image-${Date.now()}.${extension}`;
          const file = new File([blob], filename, { type: blob.type });

          // Générer l'aperçu
          setPreview(URL.createObjectURL(blob));

          // Envoyer le fichier au parent
          onUpload(file);
        }
      }
    } catch (err) {
      console.error("Erreur de collage:", err);
    }
  };

  return (
    <div onPaste={handlePaste}>
      {preview ? (
        <img src={preview} alt="Aperçu collé" className="max-h-48 mx-auto" />
      ) : (
        <p>Cliquez ici puis appuyez sur Ctrl+V pour coller une image</p>
      )}
    </div>
  );
};

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
      question: "",
      answer: "",
      imageLink: "",
      category: "",
    });

    setImage(null);
    setShouldResetPaster(!shouldResetPaster);
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
          options={formatedCategories || []}
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
        <ImagePaster
          onUpload={(file) => setImage(file)}
          shouldReset={shouldResetPaster}
        />
        <button type="submit">Ajouter</button>
      </form>
      <div>{error}</div>
    </div>
  );
};
