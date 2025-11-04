import { Autocomplete, createFilterOptions, TextField } from "@mui/material";
import { Card } from "../../../../types/common";
import { Hint } from "../../Hint/Hint";
const filter = createFilterOptions<string>();

interface CategoryInputProps {
  categoriesWithCount: string[];
  newCard: Partial<Card>;
  setNewCard: (newCard: Partial<Card>) => void;
  label?: string;
  isRequired?: boolean;
  isLoading?: boolean;
}
export default function CategoryInput({
  categoriesWithCount,
  newCard,
  setNewCard,
  label = "Catégorie",
  isRequired = false,
  isLoading = false,
}: CategoryInputProps) {
  return (
    <>
      <div className="CategoryInput__label">
        {label}
        {isRequired && <span className="CategoryInput__required">*</span>}
        <Hint text="Cherchez une catégorie dans la liste, ou créez-en une nouvelle" />
      </div>
      <Autocomplete
        id={`card-category-${Math.random().toString(36).slice(2)}`}
        options={categoriesWithCount || []}
        sx={{ width: 300 }}
        renderInput={(params) => <TextField {...params} label={label} />}
        value={newCard.category}
        loading={isLoading}
        onChange={(_, newValue) => {
          if (typeof newValue === "string") {
            let newCategory = newValue.replace("Créer: ", "");
            newCategory = newCategory.replace(/\s*\(\d+\)$/, "");
            setNewCard({ ...newCard, category: newCategory });
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
          return filtered as string[];
        }}
      />
    </>
  );
}
