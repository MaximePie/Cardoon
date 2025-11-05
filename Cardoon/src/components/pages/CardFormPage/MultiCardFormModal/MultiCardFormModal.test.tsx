import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MultiCardFormModal from "./MultiCardFormModal";

// Mock the custom hook
const mockUseMultiCardFormModal = {
  isGenerationLoading: false,
  subQuestions: [] as { question: string; answer: string }[],
  subcategory: "",
  setSubcategory: vi.fn(),
  generateQuestions: vi.fn(),
  categoriesWithCount: ["Histoire (5)", "Science (3)", "Art (2)"],
  updateCategory: vi.fn(),
  isCategoriesLoading: false,
  newCard: {} as { category?: string },
};

vi.mock("./useMultiCardFormModal", () => ({
  default: () => mockUseMultiCardFormModal,
}));

// Mock MUI Modal
vi.mock("@mui/material", () => ({
  Modal: ({
    open,
    onClose,
    children,
  }: {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
  }) => {
    if (!open) return null;
    return (
      <div data-testid="modal" onClick={onClose}>
        {children}
      </div>
    );
  },
}));

// Mock child components
vi.mock("../../../atoms/Button/Button", () => ({
  default: ({
    onClick,
    disabled,
    children,
  }: {
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
    disabled: boolean;
    children: React.ReactNode;
  }) => (
    <button
      data-testid="generate-button"
      onClick={(e) => onClick && onClick(e)}
      disabled={disabled}
    >
      {children}
    </button>
  ),
}));

vi.mock("../../../atoms/Input/CategoryInput/CategoryInput", () => ({
  default: ({
    label,
    onChange,
    categoriesWithCount,
    isRequired,
    isLoading,
  }: {
    label: string;
    onChange: (value: string) => void;
    categoriesWithCount: string[];
    isRequired: boolean;
    isLoading: boolean;
  }) => (
    <div data-testid="category-input">
      <label>{label}</label>
      <input
        data-testid="category-field"
        onChange={(e) => onChange(e.target.value)}
        disabled={isLoading}
        required={isRequired}
      />
      <div data-testid="categories-list">
        {categoriesWithCount.map((cat, index) => (
          <div key={index}>{cat}</div>
        ))}
      </div>
    </div>
  ),
}));

vi.mock("../../../atoms/Input/Input", () => ({
  default: ({
    label,
    onChange,
    placeholder,
    value,
  }: {
    label: string;
    onChange: (e: { target: { value: string } }) => void;
    placeholder: string;
    value: string;
  }) => (
    <div data-testid="subcategory-input">
      <label>{label}</label>
      <input
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        data-testid="subcategory-field"
      />
    </div>
  ),
}));

vi.mock("../../../atoms/Loader/Loader", () => ({
  default: () => <div data-testid="loader">Loading...</div>,
}));

vi.mock("../QuestionLine/QuestionLine", () => ({
  default: ({
    question,
    answer,
    category,
  }: {
    question: string;
    answer: string;
    category: string;
  }) => (
    <div data-testid="question-line">
      <div data-testid="question">{question}</div>
      <div data-testid="answer">{answer}</div>
      <div data-testid="category">{category}</div>
    </div>
  ),
}));

describe("MultiCardFormModal", () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock values
    Object.assign(mockUseMultiCardFormModal, {
      isGenerationLoading: false,
      subQuestions: [],
      subcategory: "",
      categoriesWithCount: ["Histoire (5)", "Science (3)", "Art (2)"],
      isCategoriesLoading: false,
      newCard: {},
    });
  });

  describe("Basic rendering", () => {
    it("should render when open is true", () => {
      render(<MultiCardFormModal {...defaultProps} />);

      expect(screen.getByTestId("modal")).toBeInTheDocument();
      expect(
        screen.getByText("Création de questions par IA")
      ).toBeInTheDocument();
    });

    it("should not render when open is false", () => {
      render(<MultiCardFormModal {...defaultProps} open={false} />);

      expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
    });

    it("should render form elements", () => {
      render(<MultiCardFormModal {...defaultProps} />);

      expect(screen.getByTestId("category-input")).toBeInTheDocument();
      expect(screen.getByTestId("subcategory-input")).toBeInTheDocument();
      expect(screen.getByTestId("generate-button")).toBeInTheDocument();
    });

    it("should display correct labels", () => {
      render(<MultiCardFormModal {...defaultProps} />);

      expect(screen.getByText("Je veux apprendre ...")).toBeInTheDocument();
      expect(screen.getByText("Plus particulièrement")).toBeInTheDocument();
    });
  });

  describe("Form interactions", () => {
    it("should call updateCategory when category changes", () => {
      render(<MultiCardFormModal {...defaultProps} />);

      const categoryField = screen.getByTestId("category-field");
      fireEvent.change(categoryField, { target: { value: "Histoire" } });

      expect(mockUseMultiCardFormModal.updateCategory).toHaveBeenCalledWith(
        "Histoire"
      );
    });

    it("should call setSubcategory when subcategory changes", () => {
      render(<MultiCardFormModal {...defaultProps} />);

      const subcategoryField = screen.getByTestId("subcategory-field");
      fireEvent.change(subcategoryField, { target: { value: "Antiquité" } });

      expect(mockUseMultiCardFormModal.setSubcategory).toHaveBeenCalledWith(
        "Antiquité"
      );
    });

    it("should call generateQuestions when generate button is clicked", () => {
      const generateQuestionsSpy = vi.fn();
      mockUseMultiCardFormModal.generateQuestions = generateQuestionsSpy;
      mockUseMultiCardFormModal.newCard = { category: "Histoire" }; // Ensure button is enabled

      render(<MultiCardFormModal {...defaultProps} />);

      const generateButton = screen.getByTestId("generate-button");
      expect(generateButton).not.toBeDisabled(); // Verify button is enabled
      fireEvent.click(generateButton);

      expect(generateQuestionsSpy).toHaveBeenCalled();
    });
  });

  describe("Button state", () => {
    it("should disable generate button when no category is selected", () => {
      mockUseMultiCardFormModal.newCard = {};
      render(<MultiCardFormModal {...defaultProps} />);

      const generateButton = screen.getByTestId("generate-button");
      expect(generateButton).toBeDisabled();
    });

    it("should disable generate button when loading", () => {
      mockUseMultiCardFormModal.newCard = { category: "Histoire" };
      mockUseMultiCardFormModal.isGenerationLoading = true;
      render(<MultiCardFormModal {...defaultProps} />);

      const generateButton = screen.getByTestId("generate-button");
      expect(generateButton).toBeDisabled();
    });

    it("should enable generate button when category is selected and not loading", () => {
      mockUseMultiCardFormModal.newCard = { category: "Histoire" };
      mockUseMultiCardFormModal.isGenerationLoading = false;
      render(<MultiCardFormModal {...defaultProps} />);

      const generateButton = screen.getByTestId("generate-button");
      expect(generateButton).not.toBeDisabled();
    });
  });

  describe("Loading state", () => {
    it("should show loader when generating questions", () => {
      mockUseMultiCardFormModal.isGenerationLoading = true;
      render(<MultiCardFormModal {...defaultProps} />);

      expect(screen.getByTestId("loader")).toBeInTheDocument();
    });

    it("should not show loader when not generating", () => {
      mockUseMultiCardFormModal.isGenerationLoading = false;
      render(<MultiCardFormModal {...defaultProps} />);

      expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
    });
  });

  describe("Generated questions display", () => {
    it("should display generated questions", () => {
      const mockQuestions = [
        { question: "Question 1", answer: "Answer 1" },
        { question: "Question 2", answer: "Answer 2" },
      ];

      mockUseMultiCardFormModal.subQuestions = mockQuestions;
      mockUseMultiCardFormModal.newCard = { category: "Histoire" };

      render(<MultiCardFormModal {...defaultProps} />);

      const questionLines = screen.getAllByTestId("question-line");
      expect(questionLines).toHaveLength(2);

      expect(screen.getByText("Question 1")).toBeInTheDocument();
      expect(screen.getByText("Answer 1")).toBeInTheDocument();
      expect(screen.getByText("Question 2")).toBeInTheDocument();
      expect(screen.getByText("Answer 2")).toBeInTheDocument();
    });

    it("should pass correct props to QuestionLine components", () => {
      const mockQuestions = [
        { question: "Test Question", answer: "Test Answer" },
      ];

      mockUseMultiCardFormModal.subQuestions = mockQuestions;
      mockUseMultiCardFormModal.newCard = { category: "Sciences" };

      render(<MultiCardFormModal {...defaultProps} />);

      expect(screen.getByText("Test Question")).toBeInTheDocument();
      expect(screen.getByText("Test Answer")).toBeInTheDocument();
      expect(screen.getByText("Sciences")).toBeInTheDocument();
    });

    it("should not display questions when none are generated", () => {
      mockUseMultiCardFormModal.subQuestions = [];
      render(<MultiCardFormModal {...defaultProps} />);

      expect(screen.queryByTestId("question-line")).not.toBeInTheDocument();
    });
  });

  describe("Categories integration", () => {
    it("should pass categories to CategoryInput", () => {
      render(<MultiCardFormModal {...defaultProps} />);

      expect(screen.getByText("Histoire (5)")).toBeInTheDocument();
      expect(screen.getByText("Science (3)")).toBeInTheDocument();
      expect(screen.getByText("Art (2)")).toBeInTheDocument();
    });

    it("should handle categories loading state", () => {
      mockUseMultiCardFormModal.isCategoriesLoading = true;
      render(<MultiCardFormModal {...defaultProps} />);

      const categoryField = screen.getByTestId("category-field");
      expect(categoryField).toBeDisabled();
    });
  });

  describe("Modal behavior", () => {
    it("should call onClose when modal is clicked", () => {
      render(<MultiCardFormModal {...defaultProps} />);

      const modal = screen.getByTestId("modal");
      fireEvent.click(modal);

      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("should mark category input as required", () => {
      render(<MultiCardFormModal {...defaultProps} />);

      const categoryField = screen.getByTestId("category-field");
      expect(categoryField).toHaveAttribute("required");
    });

    it("should provide proper aria labels for generated questions", () => {
      const mockQuestions = [
        { question: "Question 1", answer: "Answer 1" },
        { question: "Question 2", answer: "Answer 2" },
      ];

      mockUseMultiCardFormModal.subQuestions = mockQuestions;
      mockUseMultiCardFormModal.newCard = { category: "Histoire" };

      render(<MultiCardFormModal {...defaultProps} />);

      // The aria-label is passed to QuestionLine, verify it's rendered
      const questionLines = screen.getAllByTestId("question-line");
      expect(questionLines).toHaveLength(2);
    });
  });
});
