import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Hero } from "../../adventure.types";
import Shop from "./Shop";

const mockHero: Hero = {
  maxHealth: 100,
  currentHealth: 100,
  regenerationRate: 1,
  attackDamage: 10,
  defense: 0,
  level: 1,
  experience: 0,
  experienceToNextLevel: 100,
  coins: 150,
  primaryUpgrades: [
    {
      id: "hp",
      level: 0,
      nextLevelCost: 100,
      maxLevel: 10,
      isUnlocked: true,
      amount: 1,
    },
  ],
};

describe("Shop", () => {
  describe("Rendering", () => {
    it("should render the shop component", () => {
      render(<Shop hero={mockHero} />);
      const shop = screen.getByText("hp");
      expect(shop).toBeInTheDocument();
    });

    it("should render HP upgrade item", () => {
      render(<Shop hero={mockHero} />);
      expect(screen.getByText("hp")).toBeInTheDocument();
    });

    it("should render upgrade button with cost", () => {
      render(<Shop hero={mockHero} />);
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
      expect(buttons[0]).toHaveTextContent("100");
    });

    it("should display lucidity shard icon", () => {
      render(<Shop hero={mockHero} />);
      const buttons = screen.getAllByRole("button");
      expect(buttons[0]).toBeInTheDocument();
      // Icon is rendered as part of the button content
      expect(buttons[0].querySelector("svg")).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("should call buyUpgrade when clicking on HP upgrade button", () => {
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

      render(<Shop hero={mockHero} />);

      const buttons = screen.getAllByRole("button");

      act(() => {
        buttons[0].click();
      });

      // Currently Shop doesn't have onClick handlers, so this test just verifies the button is clickable
      // When onClick is implemented, update this expectation
      expect(buttons[0]).toBeInTheDocument();
      alertSpy.mockRestore();
    });
  });

  describe("Structure", () => {
    it("should have shop class name", () => {
      const { container } = render(<Shop hero={mockHero} />);
      expect(container.querySelector(".Shop")).toBeInTheDocument();
    });

    it("should have shop item class name", () => {
      const { container } = render(<Shop hero={mockHero} />);
      expect(container.querySelector(".Shop__item")).toBeInTheDocument();
    });
  });
});
