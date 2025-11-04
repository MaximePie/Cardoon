import { ReactNode } from "react";
import { useCategories } from "../../hooks/queries/useCategories";
import { CategoriesContext } from "./CategoriesContext";

export const CategoriesContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { data, error, isLoading } = useCategories();
  const categoriesWithCount =
    data?.map(({ category: category, count }) => `${category} (${count})`) ||
    [];

  console.log("CategoriesContextProvider rendered, data:", data);

  return (
    <CategoriesContext.Provider
      value={{ categories: data, categoriesWithCount, error, isLoading }}
    >
      {children}
    </CategoriesContext.Provider>
  );
};
