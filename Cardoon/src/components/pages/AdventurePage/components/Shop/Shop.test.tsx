import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Shop from "./Shop";

describe("Shop", () => {
  describe("Rendering", () => {
    it("should render the shop title", () => {
      render(<Shop />);
      expect(screen.getByText("Shop Page")).toBeInTheDocument();
    });

    it("should render HP upgrade item", () => {
      render(<Shop />);
      expect(screen.getByText("PV +1%")).toBeInTheDocument();
    });

    it("should render upgrade button with cost", () => {
      render(<Shop />);
      expect(screen.getByRole("button", { name: /100/i })).toBeInTheDocument();
    });

    it("should display lucidity shard icon", () => {
      render(<Shop />);
      const button = screen.getByRole("button", { name: /100/i });
      expect(button).toBeInTheDocument();
      // Icon is rendered as part of the button content
      expect(button.querySelector("svg")).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("should call buyUpgrade when clicking on HP upgrade button", () => {
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

      render(<Shop />);

      const button = screen.getByRole("button", { name: /100/i });

      act(() => {
        button.click();
      });

      expect(alertSpy).toHaveBeenCalledWith("Bought upgrade: hp +1");
      alertSpy.mockRestore();
    });
  });

  describe("Structure", () => {
    it("should have shop class name", () => {
      const { container } = render(<Shop />);
      expect(container.querySelector(".Shop")).toBeInTheDocument();
    });

    it("should have shop item class name", () => {
      const { container } = render(<Shop />);
      expect(container.querySelector(".Shop__item")).toBeInTheDocument();
    });
  });
});
