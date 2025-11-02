import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ExpBar from "./ExpBar";

describe("ExpBar Component", () => {
  describe("Basic Rendering", () => {
    it("should render the ExpBar component", () => {
      render(<ExpBar currentExp={100} />);
      const container = screen.getByText(/100 \/ 5000 XP/).closest(".ExpBar");
      expect(container).toBeInTheDocument();
    });

    it("should render the ExpBar container with correct class", () => {
      render(<ExpBar currentExp={1500} maxExp={3000} />);
      const container = screen.getByText(/1500 \/ 3000 XP/).closest(".ExpBar");
      expect(container).toHaveClass("ExpBar");
    });

    it("should display the experience text correctly", () => {
      render(<ExpBar currentExp={750} maxExp={1000} />);
      expect(screen.getByText("750 / 1000 XP")).toBeInTheDocument();
    });
  });

  describe("Props Handling", () => {
    it("should use default maxExp of 5000 when not provided", () => {
      render(<ExpBar currentExp={2500} />);
      expect(screen.getByText("2500 / 5000 XP")).toBeInTheDocument();
    });

    it("should use provided maxExp value", () => {
      render(<ExpBar currentExp={300} maxExp={800} />);
      expect(screen.getByText("300 / 800 XP")).toBeInTheDocument();
    });

    it("should handle zero currentExp", () => {
      render(<ExpBar currentExp={0} maxExp={1000} />);
      expect(screen.getByText("0 / 1000 XP")).toBeInTheDocument();
    });

    it("should handle zero maxExp", () => {
      render(<ExpBar currentExp={100} maxExp={0} />);
      expect(screen.getByText("100 / 0 XP")).toBeInTheDocument();
    });
  });

  describe("Progress Calculation", () => {
    it("should calculate 0% progress correctly", () => {
      render(<ExpBar currentExp={0} maxExp={1000} />);
      const progressFill = screen.getByText("0 / 1000 XP")
        .nextElementSibling as HTMLElement;
      expect(progressFill).toHaveStyle({ width: "0%" });
    });

    it("should calculate 25% progress correctly", () => {
      render(<ExpBar currentExp={250} maxExp={1000} />);
      const progressFill = screen.getByText("250 / 1000 XP")
        .nextElementSibling as HTMLElement;
      expect(progressFill).toHaveStyle({ width: "25%" });
    });

    it("should calculate 50% progress correctly", () => {
      render(<ExpBar currentExp={500} maxExp={1000} />);
      const progressFill = screen.getByText("500 / 1000 XP")
        .nextElementSibling as HTMLElement;
      expect(progressFill).toHaveStyle({ width: "50%" });
    });

    it("should calculate 75% progress correctly", () => {
      render(<ExpBar currentExp={750} maxExp={1000} />);
      const progressFill = screen.getByText("750 / 1000 XP")
        .nextElementSibling as HTMLElement;
      expect(progressFill).toHaveStyle({ width: "75%" });
    });

    it("should calculate 100% progress correctly", () => {
      render(<ExpBar currentExp={1000} maxExp={1000} />);
      const progressFill = screen.getByText("1000 / 1000 XP")
        .nextElementSibling as HTMLElement;
      expect(progressFill).toHaveStyle({ width: "100%" });
    });

    it("should handle decimal progress percentages", () => {
      render(<ExpBar currentExp={333} maxExp={1000} />);
      const progressFill = screen.getByText("333 / 1000 XP")
        .nextElementSibling as HTMLElement;
      // Use regex to check for approximately correct percentage (allows for floating point precision)
      expect(progressFill.style.width).toMatch(/^33\.3\d*%$/);
    });

    it("should handle very small progress percentages", () => {
      render(<ExpBar currentExp={1} maxExp={10000} />);
      const progressFill = screen.getByText("1 / 10000 XP")
        .nextElementSibling as HTMLElement;
      expect(progressFill).toHaveStyle({ width: "0.01%" });
    });
  });

  describe("Edge Cases", () => {
    it("should cap progress at 100% when currentExp exceeds maxExp", () => {
      render(<ExpBar currentExp={1500} maxExp={1000} />);
      const progressFill = screen.getByText("1500 / 1000 XP")
        .nextElementSibling as HTMLElement;
      expect(progressFill).toHaveStyle({ width: "100%" });
    });

    it("should display correct text even when currentExp exceeds maxExp", () => {
      render(<ExpBar currentExp={1200} maxExp={1000} />);
      expect(screen.getByText("1200 / 1000 XP")).toBeInTheDocument();
    });

    it("should handle very large numbers", () => {
      render(<ExpBar currentExp={999999} maxExp={1000000} />);
      expect(screen.getByText("999999 / 1000000 XP")).toBeInTheDocument();
      const progressFill = screen.getByText("999999 / 1000000 XP")
        .nextElementSibling as HTMLElement;
      expect(progressFill).toHaveStyle({ width: "99.9999%" });
    });

    it("should handle floating point numbers", () => {
      render(<ExpBar currentExp={33.33} maxExp={100} />);
      expect(screen.getByText("33.33 / 100 XP")).toBeInTheDocument();
      const progressFill = screen.getByText("33.33 / 100 XP")
        .nextElementSibling as HTMLElement;
      expect(progressFill).toHaveStyle({ width: "33.33%" });
    });
  });

  describe("CSS Classes and Styling", () => {
    it("should apply correct CSS classes to the container", () => {
      render(<ExpBar currentExp={500} maxExp={1000} />);
      const container = screen.getByText("500 / 1000 XP").closest(".ExpBar");
      expect(container).toHaveClass("ExpBar");
    });

    it("should apply correct CSS class to the text element", () => {
      render(<ExpBar currentExp={500} maxExp={1000} />);
      const textElement = screen.getByText("500 / 1000 XP");
      expect(textElement).toHaveClass("ExpBar__text");
    });

    it("should apply correct CSS class to the progress fill", () => {
      render(<ExpBar currentExp={500} maxExp={1000} />);
      const progressFill = screen.getByText("500 / 1000 XP")
        .nextElementSibling as HTMLElement;
      expect(progressFill).toHaveClass("ExpBar__fill");
    });

    it("should apply correct width style to progress fill", () => {
      render(<ExpBar currentExp={250} maxExp={1000} />);
      const progressFill = screen.getByText("250 / 1000 XP")
        .nextElementSibling as HTMLElement;
      expect(progressFill).toHaveStyle({ width: "25%" });
    });

    it("should apply 100% width when progress is capped", () => {
      render(<ExpBar currentExp={1500} maxExp={1000} />);
      const progressFill = screen.getByText("1500 / 1000 XP")
        .nextElementSibling as HTMLElement;
      expect(progressFill).toHaveStyle({ width: "100%" });
    });
  });

  describe("Default Values Integration", () => {
    it("should work with default EXP_FOR_NEXT_LEVEL constant", () => {
      render(<ExpBar currentExp={2500} />);
      const progressFill = screen.getByText("2500 / 5000 XP")
        .nextElementSibling as HTMLElement;
      expect(progressFill).toHaveStyle({ width: "50%" });
      expect(screen.getByText("2500 / 5000 XP")).toBeInTheDocument();
    });

    it("should calculate correct percentage with default maxExp", () => {
      render(<ExpBar currentExp={1000} />);
      const progressFill = screen.getByText("1000 / 5000 XP")
        .nextElementSibling as HTMLElement;
      expect(progressFill).toHaveStyle({ width: "20%" });
    });

    it("should handle full progress with default maxExp", () => {
      render(<ExpBar currentExp={5000} />);
      const progressFill = screen.getByText("5000 / 5000 XP")
        .nextElementSibling as HTMLElement;
      expect(progressFill).toHaveStyle({ width: "100%" });
    });
  });

  describe("Visual Structure", () => {
    it("should have proper DOM structure", () => {
      render(<ExpBar currentExp={500} maxExp={1000} />);
      const container = screen.getByText("500 / 1000 XP").closest(".ExpBar");
      const textElement = container?.querySelector(".ExpBar__text");
      const fillElement = container?.querySelector(".ExpBar__fill");

      expect(container).toBeInTheDocument();
      expect(textElement).toBeInTheDocument();
      expect(fillElement).toBeInTheDocument();
    });

    it("should have text element as first child", () => {
      render(<ExpBar currentExp={750} maxExp={1500} />);
      const container = screen.getByText("750 / 1500 XP").closest(".ExpBar");
      const firstChild = container?.firstElementChild;

      expect(firstChild).toHaveClass("ExpBar__text");
      expect(firstChild).toHaveTextContent("750 / 1500 XP");
    });

    it("should have fill element as second child", () => {
      render(<ExpBar currentExp={200} maxExp={400} />);
      const container = screen.getByText("200 / 400 XP").closest(".ExpBar");
      const secondChild = container?.children[1];

      expect(secondChild).toHaveClass("ExpBar__fill");
    });

    it("should maintain visual consistency across different values", () => {
      render(<ExpBar currentExp={1000} />);
      const container = screen.getByText("1000 / 5000 XP").closest(".ExpBar");
      const textElement = container?.querySelector(".ExpBar__text");
      const fillElement = container?.querySelector(".ExpBar__fill");

      expect(textElement).toHaveTextContent("1000 / 5000 XP");
      expect(fillElement).toHaveStyle({ width: "20%" });
    });
  });

  describe("Component Stability", () => {
    it("should maintain consistent rendering with same props", () => {
      const { rerender } = render(<ExpBar currentExp={500} maxExp={1000} />);
      expect(screen.getByText("500 / 1000 XP")).toBeInTheDocument();
      let progressFill = screen.getByText("500 / 1000 XP")
        .nextElementSibling as HTMLElement;
      expect(progressFill).toHaveStyle({ width: "50%" });

      rerender(<ExpBar currentExp={500} maxExp={1000} />);
      expect(screen.getByText("500 / 1000 XP")).toBeInTheDocument();
      progressFill = screen.getByText("500 / 1000 XP")
        .nextElementSibling as HTMLElement;
      expect(progressFill).toHaveStyle({ width: "50%" });
    });

    it("should update correctly when props change", () => {
      const { rerender } = render(<ExpBar currentExp={250} maxExp={1000} />);
      expect(screen.getByText("250 / 1000 XP")).toBeInTheDocument();
      let progressFill = screen.getByText("250 / 1000 XP")
        .nextElementSibling as HTMLElement;
      expect(progressFill).toHaveStyle({ width: "25%" });

      rerender(<ExpBar currentExp={750} maxExp={1000} />);
      expect(screen.getByText("750 / 1000 XP")).toBeInTheDocument();
      progressFill = screen.getByText("750 / 1000 XP")
        .nextElementSibling as HTMLElement;
      expect(progressFill).toHaveStyle({ width: "75%" });
    });

    it("should handle rapid prop changes", () => {
      const { rerender } = render(<ExpBar currentExp={0} maxExp={100} />);

      // Test multiple quick updates
      for (let i = 0; i <= 100; i += 25) {
        rerender(<ExpBar currentExp={i} maxExp={100} />);
        expect(screen.getByText(`${i} / 100 XP`)).toBeInTheDocument();
        const progressFill = screen.getByText(`${i} / 100 XP`)
          .nextElementSibling as HTMLElement;
        expect(progressFill).toHaveStyle({ width: `${i}%` });
      }
    });
  });
});
