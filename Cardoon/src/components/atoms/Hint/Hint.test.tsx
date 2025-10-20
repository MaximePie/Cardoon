import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Hint } from "./Hint";

// Mock Material-UI icon
vi.mock("@mui/icons-material/HelpOutline", () => ({
  default: (props: {
    className?: string;
    "data-tooltip-id"?: string;
    "data-tooltip-content"?: string;
    [key: string]: unknown;
  }) => (
    <div
      className={props.className}
      data-tooltip-id={props["data-tooltip-id"]}
      data-tooltip-content={props["data-tooltip-content"]}
      data-testid="help-icon"
    />
  ),
}));

// Mock react-tooltip
vi.mock("react-tooltip", () => ({
  Tooltip: ({
    id,
    content,
    className,
  }: {
    id: string;
    content: string;
    className: string;
  }) => (
    <div
      data-testid="tooltip"
      data-id={id}
      data-content={content}
      className={className}
    />
  ),
}));

// Mock useId hook
vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  return {
    ...actual,
    useId: vi.fn(() => "test-id-123"),
  };
});

describe("Hint", () => {
  const defaultProps = {
    text: "This is a helpful hint",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render with basic props", () => {
      render(<Hint {...defaultProps} />);

      expect(screen.getByTestId("help-icon")).toBeInTheDocument();
      expect(screen.getByTestId("tooltip")).toBeInTheDocument();
    });

    it("should render with default className", () => {
      const { container } = render(<Hint {...defaultProps} />);

      const hintElement = container.querySelector(".Hint");
      expect(hintElement).toBeInTheDocument();
      expect(hintElement).toHaveClass("Hint");
    });

    it("should render with custom className", () => {
      const { container } = render(
        <Hint {...defaultProps} customClassName="custom-hint" />
      );

      const hintElement = container.querySelector(".Hint");
      expect(hintElement).toHaveClass("Hint");
      expect(hintElement).toHaveClass("custom-hint");
    });

    it("should combine default and custom className correctly", () => {
      const { container } = render(
        <Hint {...defaultProps} customClassName="extra-class another-class" />
      );

      const hintElement = container.querySelector(".Hint");
      expect(hintElement).toHaveClass("Hint");
      expect(hintElement).toHaveClass("extra-class");
      expect(hintElement).toHaveClass("another-class");
    });
  });

  describe("Tooltip Integration", () => {
    it("should render tooltip with correct content", () => {
      render(<Hint text="Custom hint message" />);

      const tooltip = screen.getByTestId("tooltip");
      expect(tooltip).toHaveAttribute("data-content", "Custom hint message");
    });

    it("should render tooltip with correct ID", () => {
      render(<Hint {...defaultProps} />);

      const tooltip = screen.getByTestId("tooltip");
      expect(tooltip).toHaveAttribute("data-id", "test-id-123");
    });

    it("should render tooltip with correct className", () => {
      render(<Hint {...defaultProps} />);

      const tooltip = screen.getByTestId("tooltip");
      expect(tooltip).toHaveClass("Hint__tooltip");
    });
  });

  describe("Icon Integration", () => {
    it("should render help icon with correct className", () => {
      render(<Hint {...defaultProps} />);

      const icon = screen.getByTestId("help-icon");
      expect(icon).toHaveClass("Hint__icon");
    });

    it("should render help icon with correct tooltip attributes", () => {
      render(<Hint text="Test tooltip text" />);

      const icon = screen.getByTestId("help-icon");
      expect(icon).toHaveAttribute("data-tooltip-id", "test-id-123");
      expect(icon).toHaveAttribute("data-tooltip-content", "Test tooltip text");
    });

    it("should use consistent ID between tooltip and icon", () => {
      render(<Hint {...defaultProps} />);

      const tooltip = screen.getByTestId("tooltip");
      const icon = screen.getByTestId("help-icon");

      const tooltipId = tooltip.getAttribute("data-id");
      const iconTooltipId = icon.getAttribute("data-tooltip-id");

      expect(tooltipId).toBe(iconTooltipId);
      expect(tooltipId).toBe("test-id-123");
    });
  });

  describe("Text Content", () => {
    it("should handle different text lengths", () => {
      const shortText = "Short";
      const longText =
        "This is a very long hint text that provides detailed information about the form field and its requirements and expectations for the user";

      const { rerender } = render(<Hint text={shortText} />);
      expect(screen.getByTestId("tooltip")).toHaveAttribute(
        "data-content",
        shortText
      );

      rerender(<Hint text={longText} />);
      expect(screen.getByTestId("tooltip")).toHaveAttribute(
        "data-content",
        longText
      );
    });

    it("should handle special characters in text", () => {
      const specialText = 'Hint with "quotes" & <html> tags and émojis 🚀';
      render(<Hint text={specialText} />);

      const tooltip = screen.getByTestId("tooltip");
      const icon = screen.getByTestId("help-icon");

      expect(tooltip).toHaveAttribute("data-content", specialText);
      expect(icon).toHaveAttribute("data-tooltip-content", specialText);
    });

    it("should handle empty text gracefully", () => {
      render(<Hint text="" />);

      const tooltip = screen.getByTestId("tooltip");
      const icon = screen.getByTestId("help-icon");

      expect(tooltip).toHaveAttribute("data-content", "");
      expect(icon).toHaveAttribute("data-tooltip-content", "");
    });
  });

  describe("Component Structure", () => {
    it("should wrap icon and tooltip in span element", () => {
      const { container } = render(<Hint {...defaultProps} />);

      const span = container.querySelector("span.Hint");
      const tooltip = screen.getByTestId("tooltip");
      const icon = screen.getByTestId("help-icon");

      expect(span).toContainElement(tooltip);
      expect(span).toContainElement(icon);
    });

    it("should maintain correct DOM structure", () => {
      const { container } = render(
        <Hint text="Structure test" customClassName="test-class" />
      );

      const expectedStructure = container.querySelector("span.Hint.test-class");
      expect(expectedStructure).toBeInTheDocument();

      const tooltip = expectedStructure?.querySelector(
        '[data-testid="tooltip"]'
      );
      const icon = expectedStructure?.querySelector(
        '[data-testid="help-icon"]'
      );

      expect(tooltip).toBeInTheDocument();
      expect(icon).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should provide proper tooltip association", () => {
      render(<Hint text="Accessibility test" />);

      const icon = screen.getByTestId("help-icon");
      const tooltipId = icon.getAttribute("data-tooltip-id");

      expect(tooltipId).toBeTruthy();
      expect(tooltipId).toBe("test-id-123");
    });

    it("should include descriptive content in tooltip attributes", () => {
      const descriptiveText =
        "Password must be at least 8 characters long and contain one uppercase letter";
      render(<Hint text={descriptiveText} />);

      const icon = screen.getByTestId("help-icon");
      expect(icon).toHaveAttribute("data-tooltip-content", descriptiveText);
    });
  });

  describe("Edge Cases", () => {
    it("should handle undefined customClassName", () => {
      const { container } = render(<Hint text="Test" />);

      const hintElement = container.querySelector(".Hint");
      expect(hintElement).toHaveClass("Hint");
      expect(hintElement?.className).toBe("Hint ");
    });

    it("should handle multiple re-renders with different props", () => {
      const { rerender } = render(
        <Hint text="First text" customClassName="first-class" />
      );

      expect(screen.getByTestId("tooltip")).toHaveAttribute(
        "data-content",
        "First text"
      );

      rerender(<Hint text="Second text" customClassName="second-class" />);

      expect(screen.getByTestId("tooltip")).toHaveAttribute(
        "data-content",
        "Second text"
      );

      const hintElement = screen.getByTestId("tooltip").closest(".Hint");
      expect(hintElement).toHaveClass("second-class");
      expect(hintElement).not.toHaveClass("first-class");
    });

    it("should use consistent ID between components", () => {
      render(<Hint text="ID consistency test" />);

      const tooltip = screen.getByTestId("tooltip");
      const icon = screen.getByTestId("help-icon");

      const tooltipId = tooltip.getAttribute("data-id");
      const iconTooltipId = icon.getAttribute("data-tooltip-id");

      expect(tooltipId).toBe(iconTooltipId);
      expect(tooltipId).toBe("test-id-123");
    });
  });
});
