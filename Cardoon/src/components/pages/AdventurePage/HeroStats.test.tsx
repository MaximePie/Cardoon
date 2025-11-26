import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HeroStats } from "./HeroStats";

describe("HeroStats", () => {
  const defaultProps = {
    attackDamage: 25,
    regenerationRate: 1,
    maxHealth: 120,
    level: 1,
    experience: 0,
    experienceToNextLevel: 100,
    bonusAnimation: null,
  };

  describe("Rendering", () => {
    it("should render all hero stats correctly", () => {
      render(<HeroStats {...defaultProps} />);

      // Check all stats are displayed
      expect(screen.getByText("25")).toBeInTheDocument();
      expect(screen.getByText("1")).toBeInTheDocument(); // regeneration
      expect(screen.getByText("120")).toBeInTheDocument();

      // Check icons are present
      expect(screen.getByTestId("WhatshotIcon")).toBeInTheDocument();
      expect(screen.getByTestId("HealthAndSafetyIcon")).toBeInTheDocument();
      expect(screen.getByTestId("FavoriteIcon")).toBeInTheDocument();
    });

    it("should display the area name", () => {
      render(<HeroStats {...defaultProps} />);
      expect(screen.getByText("Forêt toxique")).toBeInTheDocument();
    });

    it("should render stats with higher values correctly", () => {
      render(
        <HeroStats
          {...defaultProps}
          attackDamage={50}
          regenerationRate={3}
          maxHealth={200}
          level={5}
          experience={75}
          experienceToNextLevel={150}
        />
      );

      expect(screen.getByText("50")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getByText("200")).toBeInTheDocument();
    });
  });

  describe("Bonus Animations", () => {
    it("should display attack bonus animation when active", () => {
      render(
        <HeroStats
          {...defaultProps}
          bonusAnimation={{ type: "attack", amount: 2 }}
        />
      );

      // BonusAnimation should be rendered
      expect(screen.getByText("+2")).toBeInTheDocument();
    });

    it("should display hp bonus animation when active", () => {
      render(
        <HeroStats
          {...defaultProps}
          bonusAnimation={{ type: "hp", amount: 5 }}
        />
      );

      expect(screen.getByText("+5")).toBeInTheDocument();
    });

    it("should display regeneration bonus animation when active", () => {
      render(
        <HeroStats
          {...defaultProps}
          bonusAnimation={{ type: "regeneration", amount: 1 }}
        />
      );

      expect(screen.getByText("+1")).toBeInTheDocument();
    });

    it("should not display bonus animation when null", () => {
      render(<HeroStats {...defaultProps} bonusAnimation={null} />);

      // Should not have any +X text
      expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
    });

    it("should display attack bonus animation only on attack stat", () => {
      render(
        <HeroStats
          {...defaultProps}
          bonusAnimation={{ type: "attack", amount: 3 }}
        />
      );

      // BonusAnimation should be visible
      expect(screen.getByText("+3")).toBeInTheDocument();

      // Should display with WhatshotIcon
      const icons = screen.getAllByTestId("WhatshotIcon");
      expect(icons.length).toBeGreaterThan(1); // One for stat, one for animation
    });
    it("should display hp bonus animation only on health stat", () => {
      render(
        <HeroStats
          {...defaultProps}
          bonusAnimation={{ type: "hp", amount: 10 }}
        />
      );

      // BonusAnimation should be visible
      expect(screen.getByText("+10")).toBeInTheDocument();

      // Should display with FavoriteIcon
      const icons = screen.getAllByTestId("FavoriteIcon");
      expect(icons.length).toBeGreaterThan(1); // One for stat, one for animation
    });
    it("should display regeneration bonus animation only on regeneration stat", () => {
      render(
        <HeroStats
          {...defaultProps}
          bonusAnimation={{ type: "regeneration", amount: 2 }}
        />
      );

      // BonusAnimation should be visible
      expect(screen.getByText("+2")).toBeInTheDocument();

      // Should display with HealthAndSafetyIcon
      const icons = screen.getAllByTestId("HealthAndSafetyIcon");
      expect(icons.length).toBeGreaterThan(1); // One for stat, one for animation
    });
  });

  describe("Structure", () => {
    it("should have correct CSS class structure", () => {
      const { container } = render(<HeroStats {...defaultProps} />);

      expect(
        container.querySelector(".AdventurePage__profile")
      ).toBeInTheDocument();
      expect(
        container.querySelector(".AdventurePage__stats")
      ).toBeInTheDocument();
      expect(
        container.querySelector(".AdventurePage__stats-resources")
      ).toBeInTheDocument();
      expect(
        container.querySelector(".AdventurePage__stats-level")
      ).toBeInTheDocument();
    });

    it("should have relative positioning on stat spans for animations", () => {
      const { container } = render(<HeroStats {...defaultProps} />);

      const statsContainer = container.querySelector(
        ".AdventurePage__stats-resources"
      );
      const spans = statsContainer?.querySelectorAll("span[style]");

      // Check first three spans have relative positioning
      expect(spans?.[0]).toHaveStyle({ position: "relative" });
      expect(spans?.[1]).toHaveStyle({ position: "relative" });
      expect(spans?.[2]).toHaveStyle({ position: "relative" });
    });
  });

  describe("Icons Display", () => {
    it("should display attack icon with correct color", () => {
      render(<HeroStats {...defaultProps} />);

      const whatshotIcon = screen.getByTestId("WhatshotIcon");
      expect(whatshotIcon).toHaveClass("MuiSvgIcon-colorError");
    });

    it("should display regeneration icon with correct color", () => {
      render(<HeroStats {...defaultProps} />);

      const healthIcon = screen.getByTestId("HealthAndSafetyIcon");
      expect(healthIcon).toHaveClass("MuiSvgIcon-colorWarning");
    });

    it("should display health icon with correct color", () => {
      render(<HeroStats {...defaultProps} />);

      const favoriteIcon = screen.getByTestId("FavoriteIcon");
      expect(favoriteIcon).toHaveClass("MuiSvgIcon-colorSuccess");
    });

    it("should display all icons with small size", () => {
      render(<HeroStats {...defaultProps} />);

      expect(screen.getByTestId("WhatshotIcon")).toHaveClass(
        "MuiSvgIcon-fontSizeSmall"
      );
      expect(screen.getByTestId("HealthAndSafetyIcon")).toHaveClass(
        "MuiSvgIcon-fontSizeSmall"
      );
      expect(screen.getByTestId("FavoriteIcon")).toHaveClass(
        "MuiSvgIcon-fontSizeSmall"
      );
    });
  });
});
