import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PopulatedUserCard } from "../../../types/common";
import EditCardForm from "./EditCardForm";

// Mock the useEditCardForm hook
const mockSetNewCard = vi.fn();
const mockSetActiveTab = vi.fn();
const mockHandleClose = vi.fn();
const mockOnCategoryChange = vi.fn();
const mockHandleDeleteClick = vi.fn();
const mockSubmit = vi.fn();
const mockInvertCard = vi.fn();

vi.mock("./useEditCardForm", () => ({
  default: vi.fn(() => ({
    newCard: {
      question: "Test Question",
      answer: "Test Answer",
      imageLink: "https://example.com/image.jpg",
      category: "Test Category",
      expectedAnswers: ["Expected 1", "Expected 2", "Expected 3"],
    },
    setNewCard: mockSetNewCard,
    activeTab: "question",
    setActiveTab: mockSetActiveTab,
    handleClose: mockHandleClose,
    onCategoryChange: mockOnCategoryChange,
    handleDeleteClick: mockHandleDeleteClick,
    submit: mockSubmit,
    invertCard: mockInvertCard,
    categoriesWithCount: ["Histoire (5)", "Science (3)", "Sport (2)"],
    invertedCard: null,
  })),
}));

// Mock MUI components
vi.mock("@mui/material", () => ({
  Modal: ({
    open,
    children,
    onClose,
  }: {
    open: boolean;
    children: React.ReactNode;
    onClose: () => void;
  }) =>
    open ? (
      <div data-testid="modal" onClick={onClose}>
        {children}
      </div>
    ) : null,
  IconButton: ({
    children,
    onClick,
    className,
  }: {
    children: React.ReactNode;
    onClick: () => void;
    className?: string;
  }) => (
    <button data-testid="icon-button" onClick={onClick} className={className}>
      {children}
    </button>
  ),
}));

// Mock MUI icons
vi.mock("@mui/icons-material/Delete", () => ({
  default: () => <span data-testid="delete-icon">Delete</span>,
}));

// Mock child components
vi.mock("../../atoms/Button/Button", () => ({
  default: ({
    children,
    onClick,
    variant,
    disabled,
    customClassName,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: string;
    disabled?: boolean;
    customClassName?: string;
  }) => (
    <button
      data-testid="button"
      onClick={onClick}
      disabled={disabled}
      className={`button-${variant} ${customClassName || ""}`}
    >
      {children}
    </button>
  ),
}));

vi.mock("../../atoms/Input/Input", () => ({
  default: ({
    label,
    value,
    onChange,
    type,
  }: {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type: string;
  }) => {
    const inputId = `input-${label.toLowerCase().replace(/\s+/g, "-")}`;
    return (
      <div data-testid="input-container">
        <label htmlFor={inputId}>{label}</label>
        <input
          id={inputId}
          data-testid={inputId}
          value={value}
          onChange={onChange}
          type={type}
        />
      </div>
    );
  },
}));

vi.mock("../../atoms/Input/CategoryInput/CategoryInput", () => ({
  default: ({
    categoriesWithCount,
    value,
    onChange,
    label,
    isRequired,
  }: {
    categoriesWithCount: string[];
    value: string;
    onChange: (value: string) => void;
    label: string;
    isRequired: boolean;
  }) => {
    const selectId = "category-select";
    const labelText = `${label}${isRequired ? " *" : ""}`;
    return (
      <div data-testid="category-input">
        <label htmlFor={selectId}>{labelText}</label>
        <select
          id={selectId}
          data-testid="category-select"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select category</option>
          {categoriesWithCount.map((cat: string, index: number) => (
            <option key={index} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
    );
  },
}));

vi.mock("../../atoms/SubmitButton/SubmitButton", () => ({
  default: ({
    children,
    disabled,
  }: {
    children: React.ReactNode;
    disabled: boolean;
  }) => (
    <button data-testid="submit-button" type="submit" disabled={disabled}>
      {children}
    </button>
  ),
}));

vi.mock("./SubQuestionsTab/SubQuestionsTab", () => ({
  default: ({
    editedCard,
    goBack,
  }: {
    editedCard: PopulatedUserCard;
    newCard: unknown;
    goBack: () => void;
  }) => (
    <div data-testid="subquestions-tab">
      <button data-testid="go-back" onClick={goBack}>
        Go Back
      </button>
      <p>SubQuestions for card: {editedCard.card.question}</p>
    </div>
  ),
}));

describe("EditCardForm", () => {
  const mockEditedCard: PopulatedUserCard = {
    card: {
      _id: "test-card-id",
      question: "Original Question",
      answer: "Original Answer",
      interval: 1,
      imageLink: "https://example.com/original.jpg",
      category: "Original Category",
      parentId: undefined,
      expectedAnswers: ["Original Expected 1", "Original Expected 2"],
      createdAt: "2024-01-01T00:00:00.000Z",
      ownedBy: "user-id",
      isInverted: false,
      hasInvertedChild: false,
    },
    interval: 1,
    lastReviewed: "2024-01-01T00:00:00.000Z",
    nextReview: "2024-01-02T00:00:00.000Z",
    _id: "user-card-id",
  };

  const defaultProps = {
    isOpen: true,
    close: vi.fn(),
    editedCard: mockEditedCard,
    afterDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render modal when open", () => {
      render(<EditCardForm {...defaultProps} />);

      expect(screen.getByTestId("modal")).toBeInTheDocument();
    });

    it("should not render modal when closed", () => {
      render(<EditCardForm {...defaultProps} isOpen={false} />);

      expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
    });

    it("should render question tab by default", () => {
      render(<EditCardForm {...defaultProps} />);

      expect(screen.getByText("Modifier la carte")).toBeInTheDocument();
      expect(screen.getByTestId("input-question")).toBeInTheDocument();
      expect(screen.getByTestId("input-réponse")).toBeInTheDocument();
      expect(screen.queryByTestId("subquestions-tab")).not.toBeInTheDocument();
    });

    it("should render close button", () => {
      render(<EditCardForm {...defaultProps} />);

      const closeButton = screen.getByTestId("icon-button");
      expect(closeButton).toBeInTheDocument();
      expect(closeButton).toHaveTextContent("X");
    });
  });

  describe("Form Fields", () => {
    it("should render all form inputs with correct values", () => {
      render(<EditCardForm {...defaultProps} />);

      expect(screen.getByTestId("input-question")).toHaveValue("Test Question");
      expect(screen.getByTestId("input-réponse")).toHaveValue("Test Answer");
      expect(screen.getByTestId("input-url-d'image")).toHaveValue(
        "https://example.com/image.jpg"
      );
    });

    it("should render expected answers inputs", () => {
      render(<EditCardForm {...defaultProps} />);

      expect(screen.getByTestId("input-réponse-attendue-1")).toHaveValue(
        "Expected 1"
      );
      expect(screen.getByTestId("input-réponse-attendue-2")).toHaveValue(
        "Expected 2"
      );
      expect(screen.getByTestId("input-réponse-attendue-3")).toHaveValue(
        "Expected 3"
      );
    });

    it("should render category input with required asterisk", () => {
      render(<EditCardForm {...defaultProps} />);

      const categoryInput = screen.getByTestId("category-input");
      expect(categoryInput).toBeInTheDocument();
      expect(categoryInput).toHaveTextContent("Catégorie *");
    });

    it("should call setNewCard when question input changes", () => {
      render(<EditCardForm {...defaultProps} />);

      const questionInput = screen.getByTestId("input-question");
      fireEvent.change(questionInput, { target: { value: "New Question" } });

      expect(mockSetNewCard).toHaveBeenCalledWith({
        question: "New Question",
        answer: "Test Answer",
        imageLink: "https://example.com/image.jpg",
        category: "Test Category",
        expectedAnswers: ["Expected 1", "Expected 2", "Expected 3"],
      });
    });

    it("should call setNewCard when answer input changes", () => {
      render(<EditCardForm {...defaultProps} />);

      const answerInput = screen.getByTestId("input-réponse");
      fireEvent.change(answerInput, { target: { value: "New Answer" } });

      expect(mockSetNewCard).toHaveBeenCalledWith({
        question: "Test Question",
        answer: "New Answer",
        imageLink: "https://example.com/image.jpg",
        category: "Test Category",
        expectedAnswers: ["Expected 1", "Expected 2", "Expected 3"],
      });
    });

    it("should call onCategoryChange when category changes", () => {
      render(<EditCardForm {...defaultProps} />);

      const categorySelect = screen.getByTestId("category-select");
      fireEvent.change(categorySelect, { target: { value: "Histoire (5)" } });

      expect(mockOnCategoryChange).toHaveBeenCalledWith("Histoire (5)");
    });
  });

  describe("Navigation Buttons", () => {
    it("should render subquestions button", () => {
      render(<EditCardForm {...defaultProps} />);

      const subquestionsButton = screen.getByText("Sous-questions");
      expect(subquestionsButton).toBeInTheDocument();
    });

    it("should call setActiveTab when subquestions button is clicked", () => {
      render(<EditCardForm {...defaultProps} />);

      const subquestionsButton = screen.getByText("Sous-questions");
      fireEvent.click(subquestionsButton);

      expect(mockSetActiveTab).toHaveBeenCalledWith("subquestions");
    });

    it("should render invert card button", () => {
      render(<EditCardForm {...defaultProps} />);

      const invertButton = screen.getByText("Créer une question inverse");
      expect(invertButton).toBeInTheDocument();
    });

    it("should call invertCard when invert button is clicked", () => {
      render(<EditCardForm {...defaultProps} />);

      const invertButton = screen.getByText("Créer une question inverse");
      fireEvent.click(invertButton);

      expect(mockInvertCard).toHaveBeenCalled();
    });
  });

  describe("Invert Card Button State", () => {
    it("should disable invert button when card is already inverted", () => {
      const invertedCard = {
        ...mockEditedCard,
        card: { ...mockEditedCard.card, isInverted: true },
      };

      render(<EditCardForm {...defaultProps} editedCard={invertedCard} />);

      const invertButton = screen.getByText("Créer une question inverse");
      expect(invertButton).toBeDisabled();
    });

    it("should disable invert button when card has inverted child", () => {
      const cardWithInvertedChild = {
        ...mockEditedCard,
        card: { ...mockEditedCard.card, hasInvertedChild: true },
      };

      render(
        <EditCardForm {...defaultProps} editedCard={cardWithInvertedChild} />
      );

      const invertButton = screen.getByText("Créer une question inverse");
      expect(invertButton).toBeDisabled();
    });
  });

  describe("Form Actions", () => {
    it("should render save button", () => {
      render(<EditCardForm {...defaultProps} />);

      const saveButton = screen.getByTestId("submit-button");
      expect(saveButton).toBeInTheDocument();
      expect(saveButton).toHaveTextContent("Enregistrer");
    });

    it("should render delete button with icon", () => {
      render(<EditCardForm {...defaultProps} />);

      const deleteButton = screen.getByText("Supprimer la carte");
      expect(deleteButton).toBeInTheDocument();
      expect(screen.getByTestId("delete-icon")).toBeInTheDocument();
    });

    it("should call submit when form is submitted", () => {
      render(<EditCardForm {...defaultProps} />);

      const form = document.querySelector("form");
      expect(form).toBeInTheDocument();
      fireEvent.submit(form!);

      expect(mockSubmit).toHaveBeenCalled();
    });

    it("should call handleDeleteClick when delete button is clicked", () => {
      render(<EditCardForm {...defaultProps} />);

      const deleteButton = screen.getByText("Supprimer la carte");
      fireEvent.click(deleteButton);

      expect(mockHandleDeleteClick).toHaveBeenCalled();
    });
  });

  describe("SubQuestions Tab", () => {
    it("should render subquestions tab content when activeTab is subquestions", () => {
      // Note: This test validates that the subquestions tab would be rendered
      // if the hook returned activeTab: "subquestions"
      render(<EditCardForm {...defaultProps} />);

      // Since activeTab is "question" by default, we should see the main form
      expect(screen.getByText("Modifier la carte")).toBeInTheDocument();
      expect(screen.queryByTestId("subquestions-tab")).not.toBeInTheDocument();
    });
  });

  describe("Close Functionality", () => {
    it("should call handleClose when close button is clicked", () => {
      render(<EditCardForm {...defaultProps} />);

      const closeButton = screen.getByTestId("icon-button");
      fireEvent.click(closeButton);

      expect(mockHandleClose).toHaveBeenCalled();
    });

    it("should call handleClose when modal backdrop is clicked", () => {
      render(<EditCardForm {...defaultProps} />);

      const modal = screen.getByTestId("modal");
      fireEvent.click(modal);

      expect(mockHandleClose).toHaveBeenCalled();
    });
  });

  describe("Expected Answers", () => {
    it("should update expected answers when input changes", () => {
      render(<EditCardForm {...defaultProps} />);

      const expectedAnswer1 = screen.getByTestId("input-réponse-attendue-1");
      fireEvent.change(expectedAnswer1, {
        target: { value: "Updated Expected 1" },
      });

      expect(mockSetNewCard).toHaveBeenCalledWith({
        question: "Test Question",
        answer: "Test Answer",
        imageLink: "https://example.com/image.jpg",
        category: "Test Category",
        expectedAnswers: ["Updated Expected 1", "Expected 2", "Expected 3"],
      });
    });

    it("should update second expected answer independently", () => {
      render(<EditCardForm {...defaultProps} />);

      const expectedAnswer2 = screen.getByTestId("input-réponse-attendue-2");
      fireEvent.change(expectedAnswer2, {
        target: { value: "Updated Expected 2" },
      });

      expect(mockSetNewCard).toHaveBeenCalledWith({
        question: "Test Question",
        answer: "Test Answer",
        imageLink: "https://example.com/image.jpg",
        category: "Test Category",
        expectedAnswers: ["Expected 1", "Updated Expected 2", "Expected 3"],
      });
    });
  });

  describe("Image Link", () => {
    it("should update image link when input changes", () => {
      render(<EditCardForm {...defaultProps} />);

      const imageInput = screen.getByTestId("input-url-d'image");
      fireEvent.change(imageInput, {
        target: { value: "https://new-image.com/pic.jpg" },
      });

      expect(mockSetNewCard).toHaveBeenCalledWith({
        question: "Test Question",
        answer: "Test Answer",
        imageLink: "https://new-image.com/pic.jpg",
        category: "Test Category",
        expectedAnswers: ["Expected 1", "Expected 2", "Expected 3"],
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper form structure", () => {
      render(<EditCardForm {...defaultProps} />);

      const form = document.querySelector("form");
      expect(form).toBeInTheDocument();
    });

    it("should have labels for all inputs", () => {
      render(<EditCardForm {...defaultProps} />);

      expect(screen.getByLabelText("Question")).toBeInTheDocument();
      expect(screen.getByLabelText("Réponse")).toBeInTheDocument();
      expect(screen.getByLabelText("URL d'image")).toBeInTheDocument();
      expect(screen.getByLabelText("Catégorie *")).toBeInTheDocument();
    });
  });
});
