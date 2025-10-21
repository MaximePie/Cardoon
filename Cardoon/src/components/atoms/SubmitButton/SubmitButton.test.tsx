import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import SubmitButton from "./SubmitButton";

describe("SubmitButton", () => {
  const getSubmitButton = (container: HTMLElement) => {
    return container.querySelector(
      "button[type='submit']"
    ) as HTMLButtonElement;
  };

  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("Basic Rendering", () => {
    it("should render as a submit button with correct type", () => {
      const { container } = render(<SubmitButton>Submit</SubmitButton>);
      const button = getSubmitButton(container);

      expect(button.tagName).toBe("BUTTON");
      expect(button).toHaveAttribute("type", "submit");
      expect(button).toHaveClass("Button");
      expect(button).toHaveTextContent("Submit");
    });

    it("should render children correctly", () => {
      const { container } = render(
        <SubmitButton>
          <span>Custom Content</span>
        </SubmitButton>
      );
      const button = getSubmitButton(container);

      expect(button).toHaveTextContent("Custom Content");
      expect(button.querySelector("span")).toBeInTheDocument();
    });
  });

  describe("Styling and Classes", () => {
    it("should apply custom className alongside default Button class", () => {
      const { container } = render(
        <SubmitButton className="custom-submit">Submit</SubmitButton>
      );
      const button = getSubmitButton(container);

      expect(button).toHaveClass("Button", "custom-submit");
    });

    it("should handle undefined className gracefully", () => {
      const { container } = render(
        <SubmitButton className={undefined}>Submit</SubmitButton>
      );
      const button = getSubmitButton(container);

      expect(button).toHaveClass("Button");
      expect(button.className.trim()).toBe("Button");
    });
  });

  describe("Disabled State", () => {
    it("should be disabled when disabled prop is true", () => {
      const { container } = render(
        <SubmitButton disabled={true}>Submit</SubmitButton>
      );
      const button = getSubmitButton(container);

      expect(button).toBeDisabled();
    });

    it("should be enabled when disabled prop is false", () => {
      const { container } = render(
        <SubmitButton disabled={false}>Submit</SubmitButton>
      );
      const button = getSubmitButton(container);

      expect(button).toBeEnabled();
    });

    it("should be enabled by default", () => {
      const { container } = render(<SubmitButton>Submit</SubmitButton>);
      const button = getSubmitButton(container);

      expect(button).toBeEnabled();
    });
  });

  describe("Loading State", () => {
    it("should show loader when isLoading is true", () => {
      const { container } = render(
        <SubmitButton isLoading={true}>Submit</SubmitButton>
      );
      const button = getSubmitButton(container);
      const loader = button.querySelector(".Button__loader");

      expect(loader).toBeInTheDocument();
      expect(loader).toHaveClass("Loader", "Button__loader");
    });

    it("should not show loader when isLoading is false", () => {
      const { container } = render(
        <SubmitButton isLoading={false}>Submit</SubmitButton>
      );
      const button = getSubmitButton(container);
      const loader = button.querySelector(".Button__loader");

      expect(loader).not.toBeInTheDocument();
    });

    it("should be disabled when loading", () => {
      const { container } = render(
        <SubmitButton isLoading={true}>Submit</SubmitButton>
      );
      const button = getSubmitButton(container);

      expect(button).toBeDisabled();
    });

    it("should show both children and loader when loading", () => {
      const { container } = render(
        <SubmitButton isLoading={true}>Submitting...</SubmitButton>
      );
      const button = getSubmitButton(container);

      expect(button).toHaveTextContent("Submitting...");
      expect(button.querySelector(".Button__loader")).toBeInTheDocument();
    });
  });

  describe("Combined States", () => {
    it("should be disabled when both disabled and isLoading are true", () => {
      const { container } = render(
        <SubmitButton disabled={true} isLoading={true}>
          Submit
        </SubmitButton>
      );
      const button = getSubmitButton(container);

      expect(button).toBeDisabled();
      expect(button.querySelector(".Button__loader")).toBeInTheDocument();
    });

    it("should prioritize loading state over enabled state", () => {
      const { container } = render(
        <SubmitButton disabled={false} isLoading={true}>
          Submit
        </SubmitButton>
      );
      const button = getSubmitButton(container);

      expect(button).toBeDisabled(); // Should be disabled due to loading
    });

    it("should handle all props together", () => {
      const { container } = render(
        <SubmitButton
          className="complex-submit"
          disabled={false}
          isLoading={true}
        >
          Complex Button
        </SubmitButton>
      );
      const button = getSubmitButton(container);

      expect(button).toHaveClass("Button", "complex-submit");
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent("Complex Button");
      expect(button.querySelector(".Button__loader")).toBeInTheDocument();
    });
  });

  describe("Component Updates", () => {
    it("should update loading state dynamically", () => {
      const { rerender, container } = render(
        <SubmitButton isLoading={false}>Submit</SubmitButton>
      );

      let button = getSubmitButton(container);
      expect(button).toBeEnabled();
      expect(button.querySelector(".Button__loader")).not.toBeInTheDocument();

      rerender(<SubmitButton isLoading={true}>Submit</SubmitButton>);

      button = getSubmitButton(container);
      expect(button).toBeDisabled();
      expect(button.querySelector(".Button__loader")).toBeInTheDocument();
    });

    it("should update disabled state dynamically", () => {
      const { rerender, container } = render(
        <SubmitButton disabled={false}>Submit</SubmitButton>
      );

      let button = getSubmitButton(container);
      expect(button).toBeEnabled();

      rerender(<SubmitButton disabled={true}>Submit</SubmitButton>);

      button = getSubmitButton(container);
      expect(button).toBeDisabled();
    });
  });

  describe("Accessibility", () => {
    it("should have correct submit type for forms", () => {
      const { container } = render(<SubmitButton>Submit Form</SubmitButton>);
      const button = getSubmitButton(container);

      expect(button).toHaveAttribute("type", "submit");
    });

    it("should be focusable when enabled", () => {
      const { container } = render(<SubmitButton>Submit</SubmitButton>);
      const button = getSubmitButton(container);

      button.focus();
      expect(document.activeElement).toBe(button);
    });

    it("should not be focusable when disabled", () => {
      const { container } = render(
        <SubmitButton disabled={true}>Submit</SubmitButton>
      );
      const button = getSubmitButton(container);

      button.focus();
      expect(document.activeElement).not.toBe(button);
    });
  });

  describe("Edge Cases", () => {
    it("should handle complex children elements", () => {
      const { container } = render(
        <SubmitButton>
          <span>Submit</span>
          <strong>Now</strong>
        </SubmitButton>
      );
      const button = getSubmitButton(container);

      expect(button.querySelector("span")).toHaveTextContent("Submit");
      expect(button.querySelector("strong")).toHaveTextContent("Now");
    });

    it("should handle empty children gracefully", () => {
      const { container } = render(<SubmitButton>{""}</SubmitButton>);
      const button = getSubmitButton(container);

      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("");
    });

    it("should handle null children gracefully", () => {
      const { container } = render(<SubmitButton>{null}</SubmitButton>);
      const button = getSubmitButton(container);

      expect(button).toBeInTheDocument();
    });
  });
});
