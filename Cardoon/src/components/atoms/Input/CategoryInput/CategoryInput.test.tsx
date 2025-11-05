import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CategoryInput from "./CategoryInput";

// Mock MUI components
vi.mock("@mui/material", () => ({
  Autocomplete: ({
    value,
    onChange,
    loading,
  }: {
    value: string;
    onChange: (event: unknown, newValue: string | null) => void;
    loading?: boolean;
  }) => (
    <div data-testid="autocomplete">
      <input
        data-testid="category-input"
        value={value || ""}
        onChange={(e) => {
          // Simulate MUI Autocomplete onChange behavior - always call with string value
          const inputValue = e.target.value;
          onChange(null, inputValue);
        }}
        disabled={loading}
      />
    </div>
  ),
  TextField: ({ label }: { label: string }) => (
    <input data-testid="textfield" placeholder={label} />
  ),
  createFilterOptions: () => () => [],
}));

// Mock Hint component
vi.mock("../../Hint/Hint", () => ({
  Hint: ({ text }: { text: string }) => (
    <span data-testid="hint" title={text}>
      ?
    </span>
  ),
}));

describe("CategoryInput", () => {
  const mockOnChange = vi.fn();
  const defaultProps = {
    categoriesWithCount: ["Histoire (5)", "Science (3)", "Sport (2)"],
    value: "",
    onChange: mockOnChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render with default label", () => {
    render(<CategoryInput {...defaultProps} />);
    expect(screen.getByText("Catégorie")).toBeInTheDocument();
    expect(screen.getByTestId("autocomplete")).toBeInTheDocument();
  });

  it("should call onChange with clean category name", () => {
    render(<CategoryInput {...defaultProps} />);
    const input = screen.getByTestId("category-input");
    fireEvent.change(input, { target: { value: "Histoire (5)" } });
    expect(mockOnChange).toHaveBeenCalledWith("Histoire");
  });

  it("should handle new category creation", () => {
    render(<CategoryInput {...defaultProps} />);
    const input = screen.getByTestId("category-input");
    fireEvent.change(input, { target: { value: "Créer: Nouvelle Catégorie" } });
    expect(mockOnChange).toHaveBeenCalledWith("Nouvelle Catégorie");
  });

  it("should handle loading state", () => {
    render(<CategoryInput {...defaultProps} isLoading={true} />);
    const input = screen.getByTestId("category-input");
    expect(input).toBeDisabled();
  });

  it("should render with custom label", () => {
    const customLabel = "Type de question";
    render(<CategoryInput {...defaultProps} label={customLabel} />);
    expect(screen.getByText(customLabel)).toBeInTheDocument();
  });

  it("should show required asterisk when isRequired is true", () => {
    render(<CategoryInput {...defaultProps} isRequired={true} />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("should not show required asterisk when isRequired is false", () => {
    render(<CategoryInput {...defaultProps} isRequired={false} />);
    expect(screen.queryByText("*")).not.toBeInTheDocument();
  });

  it("should display current category value", () => {
    render(<CategoryInput {...defaultProps} value="Histoire" />);
    const input = screen.getByTestId("category-input");
    expect(input).toHaveValue("Histoire");
  });

  it("should display empty value when no category selected", () => {
    render(<CategoryInput {...defaultProps} value="" />);
    const input = screen.getByTestId("category-input");
    expect(input).toHaveValue("");
  });

  it("should handle categories with multiple parentheses", () => {
    render(<CategoryInput {...defaultProps} />);
    const input = screen.getByTestId("category-input");
    fireEvent.change(input, { target: { value: "Math (Algebra) (5)" } });
    expect(mockOnChange).toHaveBeenCalledWith("Math (Algebra)");
  });

  it("should render hint component", () => {
    render(<CategoryInput {...defaultProps} />);
    const hint = screen.getByTestId("hint");
    expect(hint).toHaveAttribute(
      "title",
      "Cherchez une catégorie dans la liste, ou créez-en une nouvelle"
    );
  });

  it("should handle empty string input without errors", () => {
    render(<CategoryInput {...defaultProps} />);
    const input = screen.getByTestId("category-input");
    // Test that the component doesn't crash when empty string is provided
    expect(() => {
      fireEvent.change(input, { target: { value: "" } });
    }).not.toThrow();
    // Note: The component might not call onChange for empty strings depending on MUI Autocomplete behavior
  });
});
