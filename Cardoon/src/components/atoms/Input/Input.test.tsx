import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Input from "./Input";

// Mock the Hint component
vi.mock("../Hint/Hint", () => ({
  Hint: ({
    text,
    customClassName,
  }: {
    text: string;
    customClassName: string;
  }) => (
    <span data-testid="hint" className={customClassName}>
      {text}
    </span>
  ),
}));

describe("Input", () => {
  const defaultProps = {
    label: "Test Label",
    type: "text",
    value: "",
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render with basic props", () => {
      render(<Input {...defaultProps} />);

      expect(screen.getByLabelText("Test Label")).toBeInTheDocument();
      expect(screen.getByDisplayValue("")).toBeInTheDocument();
    });

    it("should render with custom className", () => {
      render(<Input {...defaultProps} className="custom-input" />);

      const inputContainer = screen
        .getByLabelText("Test Label")
        .closest(".Input");
      expect(inputContainer).toHaveClass("custom-input");
      expect(inputContainer).toHaveClass("Input");
    });

    it("should render with default className when none provided", () => {
      render(<Input {...defaultProps} />);

      const inputContainer = screen
        .getByLabelText("Test Label")
        .closest(".Input");
      expect(inputContainer).toHaveClass("Input");
    });

    it("should render label correctly", () => {
      render(<Input {...defaultProps} label="Email Address" />);

      expect(screen.getByText("Email Address")).toBeInTheDocument();
    });

    it("should render required indicator when isRequired is true", () => {
      render(<Input {...defaultProps} isRequired={true} />);

      const requiredSpan = document.querySelector(".Input__required");
      expect(requiredSpan).toBeInTheDocument();
      expect(requiredSpan).toHaveTextContent("*");
    });

    it("should not render required indicator when isRequired is false", () => {
      render(<Input {...defaultProps} isRequired={false} />);

      const requiredSpan = document.querySelector(".Input__required");
      expect(requiredSpan).not.toBeInTheDocument();
    });

    it("should render hint when provided", () => {
      render(<Input {...defaultProps} hint="This is a helpful hint" />);

      const hint = screen.getByTestId("hint");
      expect(hint).toBeInTheDocument();
      expect(hint).toHaveTextContent("This is a helpful hint");
      expect(hint).toHaveClass("Input__hint");
    });

    it("should not render hint when not provided", () => {
      render(<Input {...defaultProps} />);

      expect(screen.queryByTestId("hint")).not.toBeInTheDocument();
    });
  });

  describe("Input Attributes", () => {
    it("should set correct input type", () => {
      render(<Input {...defaultProps} type="password" />);

      const input = screen.getByLabelText("Test Label");
      expect(input).toHaveAttribute("type", "password");
    });

    it("should set correct input value", () => {
      render(<Input {...defaultProps} value="test value" />);

      const input = screen.getByDisplayValue("test value");
      expect(input).toBeInTheDocument();
    });

    it("should set custom placeholder", () => {
      render(<Input {...defaultProps} placeholder="Enter your text here" />);

      const input = screen.getByPlaceholderText("Enter your text here");
      expect(input).toBeInTheDocument();
    });

    it("should use label as placeholder when no placeholder provided", () => {
      render(<Input {...defaultProps} label="Username" />);

      const input = screen.getByPlaceholderText("Username");
      expect(input).toBeInTheDocument();
    });

    it("should set custom name attribute", () => {
      render(<Input {...defaultProps} name="custom-name" />);

      const input = screen.getByLabelText("Test Label");
      expect(input).toHaveAttribute("name", "custom-name");
    });

    it("should not have name attribute when not provided", () => {
      render(<Input {...defaultProps} />);

      const input = screen.getByLabelText("Test Label");
      expect(input).not.toHaveAttribute("name");
    });
  });

  describe("Event Handling", () => {
    it("should call onChange when input value changes", () => {
      const handleChange = vi.fn();
      render(<Input {...defaultProps} onChange={handleChange} />);

      const input = screen.getByLabelText("Test Label");
      fireEvent.change(input, { target: { value: "new value" } });

      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalled();
    });

    it("should handle multiple change events", () => {
      const handleChange = vi.fn();
      render(<Input {...defaultProps} onChange={handleChange} />);

      const input = screen.getByLabelText("Test Label");
      fireEvent.change(input, { target: { value: "first" } });
      fireEvent.change(input, { target: { value: "second" } });
      fireEvent.change(input, { target: { value: "third" } });

      expect(handleChange).toHaveBeenCalledTimes(3);
    });

    it("should handle focus and blur events", () => {
      render(<Input {...defaultProps} />);

      const input = screen.getByLabelText("Test Label");

      fireEvent.focus(input);
      // Just check that events can be fired without errors
      fireEvent.blur(input);

      // Input should still be in the document after events
      expect(input).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should associate label with input", () => {
      render(<Input {...defaultProps} label="Email" />);

      const input = screen.getByLabelText("Email");
      const label = screen.getByText("Email");

      expect(input).toBeInTheDocument();
      expect(label).toBeInTheDocument();
    });

    it("should handle complex labels with required indicator", () => {
      render(<Input {...defaultProps} label="Password" isRequired={true} />);

      // The input should still be accessible by the main label text
      const input = screen.getByLabelText(/Password/);
      expect(input).toBeInTheDocument();
    });

    it("should support keyboard navigation", () => {
      render(<Input {...defaultProps} />);

      const input = screen.getByLabelText("Test Label");

      fireEvent.keyDown(input, { key: "Tab" });
      fireEvent.keyDown(input, { key: "Enter" });
      fireEvent.keyDown(input, { key: "Escape" });

      // Input should remain functional after keyboard events
      expect(input).toBeInTheDocument();
    });
  });

  describe("Different Input Types", () => {
    it("should handle email input type", () => {
      render(<Input {...defaultProps} type="email" label="Email" />);

      const input = screen.getByLabelText("Email");
      expect(input).toHaveAttribute("type", "email");
    });

    it("should handle password input type", () => {
      render(<Input {...defaultProps} type="password" label="Password" />);

      const input = screen.getByLabelText("Password");
      expect(input).toHaveAttribute("type", "password");
    });

    it("should handle number input type", () => {
      render(<Input {...defaultProps} type="number" label="Age" />);

      const input = screen.getByLabelText("Age");
      expect(input).toHaveAttribute("type", "number");
    });
  });

  describe("Complex Scenarios", () => {
    it("should handle all props together", () => {
      const handleChange = vi.fn();

      render(
        <Input
          label="Complete Input"
          type="email"
          value="test@example.com"
          onChange={handleChange}
          className="custom-input"
          name="email-field"
          placeholder="Enter your email"
          isRequired={true}
          hint="We'll never share your email"
        />
      );

      const input = screen.getByLabelText(/Complete Input/);
      const container = input.closest(".Input");
      const hint = screen.getByTestId("hint");
      const required = document.querySelector(".Input__required");

      expect(input).toHaveAttribute("type", "email");
      expect(input).toHaveAttribute("name", "email-field");
      expect(input).toHaveAttribute("placeholder", "Enter your email");
      expect(input).toHaveDisplayValue("test@example.com");
      expect(container).toHaveClass("custom-input");
      expect(container).toHaveClass("Input");
      expect(hint).toHaveTextContent("We'll never share your email");
      expect(required).toHaveTextContent("*");

      fireEvent.change(input, { target: { value: "new@example.com" } });
      expect(handleChange).toHaveBeenCalled();
    });

    it("should handle empty values gracefully", () => {
      render(<Input {...defaultProps} value="" label="" placeholder="" />);

      const input = screen.getByDisplayValue("");
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("placeholder", "");
    });

    it("should preserve input focus after value changes", () => {
      const { rerender } = render(<Input {...defaultProps} value="initial" />);

      const input = screen.getByLabelText("Test Label");
      input.focus();

      expect(document.activeElement).toBe(input);

      rerender(<Input {...defaultProps} value="updated" />);

      // Focus should be maintained after props update
      expect(document.activeElement).toBe(input);
    });
  });
});
