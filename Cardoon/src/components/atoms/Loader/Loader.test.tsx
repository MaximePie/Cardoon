import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import Loader from "./Loader";

describe("Loader", () => {
  const getLoaderElement = (container: HTMLElement) => {
    return container.querySelector(".Loader") as HTMLElement;
  };

  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("Basic Rendering", () => {
    it("should render as a span with Loader class", () => {
      const { container } = render(<Loader />);
      const loader = getLoaderElement(container);

      expect(loader.tagName).toBe("SPAN");
      expect(loader).toHaveClass("Loader");
      expect(loader).toBeInTheDocument();
      expect(loader).toBeEmptyDOMElement();
    });

    it("should work without any props", () => {
      expect(() => render(<Loader />)).not.toThrow();
    });
  });

  describe("Custom className", () => {
    it("should apply and combine custom className with default", () => {
      const { container } = render(<Loader className="custom-class" />);
      const loader = getLoaderElement(container);

      expect(loader).toHaveClass("Loader", "custom-class", "Loader--medium");
      expect(loader.className).toBe("Loader custom-class Loader--medium");
    });

    it("should handle multiple classes", () => {
      const { container } = render(<Loader className="class1 class2 class3" />);
      const loader = getLoaderElement(container);

      expect(loader).toHaveClass("Loader", "class1", "class2", "class3");
    });

    it("should handle edge cases gracefully", () => {
      // Empty string - normalize spaces
      const { container: container1 } = render(<Loader className="" />);
      const className1 = getLoaderElement(container1)
        .className.replace(/\s+/g, " ")
        .trim();
      expect(className1).toBe("Loader Loader--medium");

      // Undefined
      const { container: container2 } = render(
        <Loader className={undefined} />
      );
      const className2 = getLoaderElement(container2)
        .className.replace(/\s+/g, " ")
        .trim();
      expect(className2).toBe("Loader Loader--medium");

      // Special characters and spaces
      const { container: container3 } = render(
        <Loader className="  special-chars_with.dots  " />
      );
      const loader3 = getLoaderElement(container3);
      expect(loader3).toHaveClass("Loader");
      expect(loader3.className).toContain("special-chars_with.dots");
    });
  });

  describe("Multiple Instances", () => {
    it("should render independently", () => {
      const { container } = render(
        <div>
          <Loader className="loader1" />
          <Loader className="loader2" />
          <Loader />
        </div>
      );

      const loaders = container.querySelectorAll(".Loader");
      expect(loaders).toHaveLength(3);
      expect(loaders[0]).toHaveClass("loader1");
      expect(loaders[1]).toHaveClass("loader2");
      expect(loaders[2]).not.toHaveClass("loader1", "loader2");
    });
  });

  describe("Component Updates", () => {
    it("should update className when prop changes", () => {
      const { rerender, container } = render(<Loader className="initial" />);
      expect(getLoaderElement(container)).toHaveClass("initial");

      rerender(<Loader className="updated" />);
      const loader = getLoaderElement(container);
      expect(loader).not.toHaveClass("initial");
      expect(loader).toHaveClass("Loader", "updated");
    });
  });

  describe("Accessibility", () => {
    it("should have minimal structure suitable for CSS animations", () => {
      const { container } = render(<Loader />);
      const loader = getLoaderElement(container);

      expect(loader).toHaveTextContent("");
      expect(loader.children.length).toBe(0);
      expect(loader.attributes.length).toBe(1); // Only class attribute
    });
  });
});
