import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Button from "./Button";

describe("Button", () => {
  const defaultProps = {
    onClick: vi.fn(),
    children: "Test Button",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render with children text", () => {
      render(<Button {...defaultProps}>Click me</Button>);

      expect(screen.getByRole("button")).toHaveTextContent("Click me");
    });

    it("should render with custom className", () => {
      render(
        <Button {...defaultProps} customClassName="custom-class">
          Test
        </Button>
      );

      const button = screen.getByRole("button");
      expect(button).toHaveClass("custom-class");
    });

    it("should apply default button class", () => {
      render(<Button {...defaultProps}>Test</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("Button");
    });

    it("should combine custom className with default class", () => {
      render(
        <Button {...defaultProps} customClassName="extra-class">
          Test
        </Button>
      );

      const button = screen.getByRole("button");
      expect(button).toHaveClass("Button");
      expect(button).toHaveClass("extra-class");
    });

    it("should render with icon", () => {
      const icon = <span data-testid="test-icon">🔥</span>;
      render(
        <Button {...defaultProps} icon={icon}>
          Test
        </Button>
      );

      expect(screen.getByTestId("test-icon")).toBeInTheDocument();
    });

    it("should render loading state", () => {
      render(
        <Button {...defaultProps} isLoading={true}>
          Test
        </Button>
      );

      const button = screen.getByRole("button");
      expect(button.querySelector(".Button__loader")).toBeInTheDocument();
    });
  });

  describe("Variants", () => {
    it("should apply primary variant by default", () => {
      render(<Button {...defaultProps}>Primary</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("Button");
      expect(button).not.toHaveClass("Button--danger");
      expect(button).not.toHaveClass("Button--secondary");
    });

    it("should apply danger variant", () => {
      render(
        <Button {...defaultProps} variant="danger">
          Danger
        </Button>
      );

      const button = screen.getByRole("button");
      expect(button).toHaveClass("Button--danger");
    });

    it("should apply secondary variant", () => {
      render(
        <Button {...defaultProps} variant="secondary">
          Secondary
        </Button>
      );

      const button = screen.getByRole("button");
      expect(button).toHaveClass("Button--secondary");
    });
  });

  describe("Behavior", () => {
    it("should call onClick handler when clicked", () => {
      const handleClick = vi.fn();
      render(
        <Button {...defaultProps} onClick={handleClick}>
          Click me
        </Button>
      );

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should not call onClick when disabled", () => {
      const handleClick = vi.fn();
      render(
        <Button {...defaultProps} onClick={handleClick} disabled>
          Click me
        </Button>
      );

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });

    it("should be disabled when disabled prop is true", () => {
      render(
        <Button {...defaultProps} disabled>
          Disabled button
        </Button>
      );

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
      expect(button).toHaveClass("Button--disabled");
    });

    it("should be enabled by default", () => {
      render(<Button {...defaultProps}>Enabled button</Button>);

      const button = screen.getByRole("button");
      expect(button).toBeEnabled();
      expect(button).not.toHaveClass("Button--disabled");
    });
  });

  describe("Accessibility", () => {
    it("should have correct role", () => {
      render(<Button {...defaultProps}>Test</Button>);

      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should have submit type by default", () => {
      render(<Button {...defaultProps}>Default</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("type", "submit");
    });

    it("should support tooltip", () => {
      render(
        <Button {...defaultProps} tooltip="This is a tooltip">
          Test
        </Button>
      );

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute(
        "data-tooltip-content",
        "This is a tooltip"
      );
    });

    it("should generate tooltip ID from content", () => {
      const tooltipText = "Test tooltip";
      render(
        <Button {...defaultProps} tooltip={tooltipText}>
          Test
        </Button>
      );

      const button = screen.getByRole("button");
      const expectedId = tooltipText
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0)
        .toString();

      expect(button).toHaveAttribute("data-tooltip-id", expectedId);
    });
  });

  describe("Loading State", () => {
    it("should show loader when isLoading is true", () => {
      render(
        <Button {...defaultProps} isLoading={true}>
          Loading
        </Button>
      );

      const button = screen.getByRole("button");
      const loader = button.querySelector(".Button__loader");
      expect(loader).toBeInTheDocument();
    });

    it("should not show loader when isLoading is false", () => {
      render(
        <Button {...defaultProps} isLoading={false}>
          Not Loading
        </Button>
      );

      const button = screen.getByRole("button");
      const loader = button.querySelector(".Button__loader");
      expect(loader).not.toBeInTheDocument();
    });

    it("should still render children when loading", () => {
      render(
        <Button {...defaultProps} isLoading={true}>
          Loading Text
        </Button>
      );

      expect(screen.getByRole("button")).toHaveTextContent("Loading Text");
    });
  });

  describe("Icon Rendering", () => {
    it("should render icon in correct wrapper", () => {
      const icon = <span data-testid="icon">⭐</span>;
      render(
        <Button {...defaultProps} icon={icon}>
          With Icon
        </Button>
      );

      const iconWrapper = screen
        .getByRole("button")
        .querySelector(".Button__icon");
      expect(iconWrapper).toBeInTheDocument();
      expect(iconWrapper).toContainElement(screen.getByTestId("icon"));
    });

    it("should render both icon and text", () => {
      const icon = <span>🔥</span>;
      render(
        <Button {...defaultProps} icon={icon}>
          Button Text
        </Button>
      );

      const button = screen.getByRole("button");
      expect(button).toHaveTextContent("Button Text");
      expect(button.querySelector(".Button__icon")).toBeInTheDocument();
    });
  });

  describe("Complex Scenarios", () => {
    it("should handle all props together", () => {
      const handleClick = vi.fn();
      const icon = <span data-testid="complex-icon">🚀</span>;

      render(
        <Button
          onClick={handleClick}
          customClassName="complex-button"
          variant="danger"
          icon={icon}
          tooltip="Complex button tooltip"
          isLoading={true}
          disabled={false}
        >
          Complex Button
        </Button>
      );

      const button = screen.getByRole("button");

      // Check classes
      expect(button).toHaveClass("Button");
      expect(button).toHaveClass("complex-button");
      expect(button).toHaveClass("Button--danger");

      // Check content
      expect(button).toHaveTextContent("Complex Button");
      expect(screen.getByTestId("complex-icon")).toBeInTheDocument();
      expect(button.querySelector(".Button__loader")).toBeInTheDocument();

      // Check tooltip
      expect(button).toHaveAttribute(
        "data-tooltip-content",
        "Complex button tooltip"
      );

      // Check functionality
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should handle disabled loading button", () => {
      const handleClick = vi.fn();

      render(
        <Button
          {...defaultProps}
          onClick={handleClick}
          disabled={true}
          isLoading={true}
        >
          Disabled Loading
        </Button>
      );

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
      expect(button).toHaveClass("Button--disabled");
      expect(button.querySelector(".Button__loader")).toBeInTheDocument();

      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });
});
