import { Autocomplete, createFilterOptions, TextField } from "@mui/material";
import { Card } from "../../../../types/common";
const filter = createFilterOptions<string>();

interface CategoryInputProps {
  categoriesWithCount: string[];
  newCard: Partial<Card>;
  setNewCard: (newCard: Partial<Card>) => void;
}
export default ({
  categoriesWithCount,
  newCard,
  setNewCard,
}: CategoryInputProps) => {
  return (
    <Autocomplete
      id="card-category"
      options={categoriesWithCount || []}
      sx={{ width: 300 }}
      renderInput={(params) => <TextField {...params} label="Catégorie" />}
      value={newCard.category}
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
  );
};
