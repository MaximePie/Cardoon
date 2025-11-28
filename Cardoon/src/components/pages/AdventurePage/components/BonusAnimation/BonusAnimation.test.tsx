import FavoriteIcon from "@mui/icons-material/Favorite";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BonusAnimation } from "./BonusAnimation";

describe("BonusAnimation", () => {
  describe("Rendering", () => {
    it("should render bonus amount for attack type", () => {
      render(<BonusAnimation type="attack" amount={5} />);
      expect(screen.getByText("+5")).toBeInTheDocument();
    });

    it("should render bonus amount for hp type", () => {
      render(<BonusAnimation type="hp" amount={10} />);
      expect(screen.getByText("+10")).toBeInTheDocument();
    });

    it("should render bonus amount for regeneration type", () => {
      render(<BonusAnimation type="regeneration" amount={2} />);
      expect(screen.getByText("+2")).toBeInTheDocument();
    });

    it("should render with icon when provided", () => {
      render(<BonusAnimation type="attack" amount={3} Icon={WhatshotIcon} />);

      expect(screen.getByText("+3")).toBeInTheDocument();
      expect(screen.getByTestId("WhatshotIcon")).toBeInTheDocument();
    });

    it("should render without icon when not provided", () => {
      render(<BonusAnimation type="attack" amount={3} />);

      expect(screen.getByText("+3")).toBeInTheDocument();
      expect(screen.queryByTestId("WhatshotIcon")).not.toBeInTheDocument();
    });

    it("should format amount with + prefix", () => {
      render(<BonusAnimation type="hp" amount={1} />);

      // Should show +1, not just 1
      expect(screen.getByText(/^\+1/)).toBeInTheDocument();
    });
  });

  describe("Icon Rendering", () => {
    it("should render WhatshotIcon when provided", () => {
      render(<BonusAnimation type="attack" amount={1} Icon={WhatshotIcon} />);
      expect(screen.getByTestId("WhatshotIcon")).toBeInTheDocument();
    });

    it("should render FavoriteIcon when provided", () => {
      render(<BonusAnimation type="hp" amount={1} Icon={FavoriteIcon} />);
      expect(screen.getByTestId("FavoriteIcon")).toBeInTheDocument();
    });

    it("should render HealthAndSafetyIcon when provided", () => {
      render(
        <BonusAnimation
          type="regeneration"
          amount={1}
          Icon={HealthAndSafetyIcon}
        />
      );
      expect(screen.getByTestId("HealthAndSafetyIcon")).toBeInTheDocument();
    });

    it("should render icon with small size", () => {
      render(<BonusAnimation type="attack" amount={1} Icon={WhatshotIcon} />);

      const icon = screen.getByTestId("WhatshotIcon");
      expect(icon).toHaveClass("MuiSvgIcon-fontSizeSmall");
    });
  });

  describe("Styling", () => {
    it("should apply attack color for attack type", () => {
      const { container } = render(<BonusAnimation type="attack" amount={1} />);

      const span = container.querySelector("span");
      expect(span).toHaveStyle({ color: "#f44336" });
    });

    it("should apply hp color for hp type", () => {
      const { container } = render(<BonusAnimation type="hp" amount={1} />);

      const span = container.querySelector("span");
      expect(span).toHaveStyle({ color: "#4caf50" });
    });

    it("should apply regeneration color for regeneration type", () => {
      const { container } = render(
        <BonusAnimation type="regeneration" amount={1} />
      );

      const span = container.querySelector("span");
      expect(span).toHaveStyle({ color: "#ff9800" });
    });

    it("should have absolute positioning", () => {
      const { container } = render(<BonusAnimation type="attack" amount={1} />);

      const span = container.querySelector("span");
      expect(span).toHaveStyle({ position: "absolute" });
    });

    it("should have pointer-events none", () => {
      const { container } = render(<BonusAnimation type="attack" amount={1} />);

      const span = container.querySelector("span");
      expect(span).toHaveStyle({ pointerEvents: "none" });
    });

    it("should have bold font weight", () => {
      const { container } = render(<BonusAnimation type="attack" amount={1} />);

      const span = container.querySelector("span");
      expect(span).toHaveStyle({ fontWeight: "bold" });
    });

    it("should have flex display for icon alignment", () => {
      const { container } = render(
        <BonusAnimation type="attack" amount={1} Icon={WhatshotIcon} />
      );

      const span = container.querySelector("span");
      expect(span).toHaveStyle({ display: "flex" });
    });

    it("should center horizontally with left 50%", () => {
      const { container } = render(<BonusAnimation type="attack" amount={1} />);

      const span = container.querySelector("span");
      expect(span).toHaveStyle({
        left: "50%",
      });
      // Transform contains translateX(-50%) but also animation transforms, so we just check left
    });
  });

  describe("Amount Display", () => {
    it("should display single digit amounts", () => {
      render(<BonusAnimation type="attack" amount={1} />);
      expect(screen.getByText("+1")).toBeInTheDocument();
    });

    it("should display double digit amounts", () => {
      render(<BonusAnimation type="hp" amount={25} />);
      expect(screen.getByText("+25")).toBeInTheDocument();
    });

    it("should display triple digit amounts", () => {
      render(<BonusAnimation type="attack" amount={100} />);
      expect(screen.getByText("+100")).toBeInTheDocument();
    });

    it("should display zero amount", () => {
      render(<BonusAnimation type="hp" amount={0} />);
      expect(screen.getByText("+0")).toBeInTheDocument();
    });
  });

  describe("Type-specific behavior", () => {
    it("should render attack animation with correct color and optional icon", () => {
      const { container } = render(
        <BonusAnimation type="attack" amount={5} Icon={WhatshotIcon} />
      );

      expect(screen.getByText("+5")).toBeInTheDocument();
      expect(screen.getByTestId("WhatshotIcon")).toBeInTheDocument();

      const span = container.querySelector("span");
      expect(span).toHaveStyle({ color: "#f44336" });
    });

    it("should render hp animation with correct color and optional icon", () => {
      const { container } = render(
        <BonusAnimation type="hp" amount={10} Icon={FavoriteIcon} />
      );

      expect(screen.getByText("+10")).toBeInTheDocument();
      expect(screen.getByTestId("FavoriteIcon")).toBeInTheDocument();

      const span = container.querySelector("span");
      expect(span).toHaveStyle({ color: "#4caf50" });
    });

    it("should render regeneration animation with correct color and optional icon", () => {
      const { container } = render(
        <BonusAnimation
          type="regeneration"
          amount={2}
          Icon={HealthAndSafetyIcon}
        />
      );

      expect(screen.getByText("+2")).toBeInTheDocument();
      expect(screen.getByTestId("HealthAndSafetyIcon")).toBeInTheDocument();

      const span = container.querySelector("span");
      expect(span).toHaveStyle({ color: "#ff9800" });
    });
  });

  describe("Content Layout", () => {
    it("should display amount and icon on same line with gap", () => {
      const { container } = render(
        <BonusAnimation type="attack" amount={3} Icon={WhatshotIcon} />
      );

      const span = container.querySelector("span");
      expect(span).toHaveStyle({
        display: "flex",
        alignItems: "center",
        gap: "0.2rem",
      });
    });

    it("should have max-content width", () => {
      const { container } = render(<BonusAnimation type="attack" amount={1} />);

      const span = container.querySelector("span");
      expect(span).toHaveStyle({ width: "max-content" });
    });
  });

  describe("Animation Props", () => {
    it("should render as motion.span for animation capability", () => {
      const { container } = render(<BonusAnimation type="attack" amount={1} />);

      // The component should be a span element
      const span = container.querySelector("span");
      expect(span).toBeInTheDocument();
    });
  });
});
