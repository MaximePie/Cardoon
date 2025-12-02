import { render, screen } from "@testing-library/react";
import { createRef, forwardRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { PopulatedUserCard } from "../../../types/common";
import Card from "./Card";

// Mock motion to avoid animation issues in tests
vi.mock("motion/react", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const MotionDiv = forwardRef(({ children, ...props }: any, ref) => (
    <div ref={ref} {...props}>
      {children}
    </div>
  ));
  MotionDiv.displayName = "MotionDiv";

  return {
    motion: {
      div: MotionDiv,
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

const mockCard: PopulatedUserCard = {
  _id: "card123",
  card: {
    _id: "cardId123",
    question: "What is the capital of France?",
    answer: "Paris",
    interval: 1,
    imageLink: "",
    category: "Geography",
    createdAt: "2023-01-01",
    ownedBy: "user123",
    isInverted: false,
    hasInvertedChild: false,
  },
  interval: 1,
  lastReviewed: "2023-10-20",
  nextReview: "2023-10-21",
};

describe("Card Component", () => {
  const mockOnUpdate = vi.fn();
  const mockOnEditClick = vi.fn();

  it("should render the question", () => {
    render(
      <Card
        card={mockCard}
        onUpdate={mockOnUpdate}
        onEditClick={mockOnEditClick}
        isFlashModeOn={false}
      />
    );

    expect(
      screen.getByText("What is the capital of France?")
    ).toBeInTheDocument();
  });

  it("should render the category chip", () => {
    render(
      <Card
        card={mockCard}
        onUpdate={mockOnUpdate}
        onEditClick={mockOnEditClick}
        isFlashModeOn={false}
      />
    );

    expect(screen.getByText("Geography")).toBeInTheDocument();
  });

  it("should accept and forward ref", () => {
    const ref = createRef<HTMLDivElement>();

    render(
      <Card
        ref={ref}
        card={mockCard}
        onUpdate={mockOnUpdate}
        onEditClick={mockOnEditClick}
        isFlashModeOn={false}
      />
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toBeTruthy();
  });

  it("should have correct displayName", () => {
    expect(Card.displayName).toBe("Card");
  });

  it("should render image when imageLink is provided", () => {
    const cardWithImage = {
      ...mockCard,
      card: {
        ...mockCard.card,
        imageLink: "https://example.com/image.jpg",
      },
    };

    render(
      <Card
        card={cardWithImage}
        onUpdate={mockOnUpdate}
        onEditClick={mockOnEditClick}
        isFlashModeOn={false}
      />
    );

    const image = screen.getByAltText("Card image");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "https://example.com/image.jpg");
  });

  it("should show expected answers count when provided", () => {
    const cardWithExpectedAnswers = {
      ...mockCard,
      card: {
        ...mockCard.card,
        expectedAnswers: ["Paris", "paris", "PARIS"],
      },
    };

    render(
      <Card
        card={cardWithExpectedAnswers}
        onUpdate={mockOnUpdate}
        onEditClick={mockOnEditClick}
        isFlashModeOn={false}
      />
    );

    expect(screen.getByText(/\(3\)/)).toBeInTheDocument();
  });

  it("should render with multiple cards using refs in AnimatePresence context", () => {
    const ref1 = createRef<HTMLDivElement>();
    const ref2 = createRef<HTMLDivElement>();

    const card1 = { ...mockCard, _id: "card1" };
    const card2 = { ...mockCard, _id: "card2" };

    const { rerender } = render(
      <div>
        <Card
          ref={ref1}
          card={card1}
          onUpdate={mockOnUpdate}
          onEditClick={mockOnEditClick}
          isFlashModeOn={false}
        />
        <Card
          ref={ref2}
          card={card2}
          onUpdate={mockOnUpdate}
          onEditClick={mockOnEditClick}
          isFlashModeOn={false}
        />
      </div>
    );

    expect(ref1.current).toBeTruthy();
    expect(ref2.current).toBeTruthy();
    expect(ref1.current).not.toBe(ref2.current);

    // Verify refs remain stable after rerender
    rerender(
      <div>
        <Card
          ref={ref1}
          card={card1}
          onUpdate={mockOnUpdate}
          onEditClick={mockOnEditClick}
          isFlashModeOn={false}
        />
        <Card
          ref={ref2}
          card={card2}
          onUpdate={mockOnUpdate}
          onEditClick={mockOnEditClick}
          isFlashModeOn={false}
        />
      </div>
    );

    expect(ref1.current).toBeTruthy();
    expect(ref2.current).toBeTruthy();
  });
});
