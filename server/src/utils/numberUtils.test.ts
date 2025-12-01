import { add, calculatePercentage, clamp, multiply } from "./numberUtils";

describe("numberUtils", () => {
  describe("add", () => {
    it("should add two positive numbers", () => {
      expect(add(2, 3)).toBe(5);
    });

    it("should add negative numbers", () => {
      expect(add(-2, -3)).toBe(-5);
    });

    it("should add positive and negative numbers", () => {
      expect(add(5, -3)).toBe(2);
    });
  });

  describe("multiply", () => {
    it("should multiply two positive numbers", () => {
      expect(multiply(2, 3)).toBe(6);
    });

    it("should multiply by zero", () => {
      expect(multiply(5, 0)).toBe(0);
    });

    it("should multiply negative numbers", () => {
      expect(multiply(-2, -3)).toBe(6);
    });
  });

  describe("calculatePercentage", () => {
    it("should calculate 50% of 100", () => {
      expect(calculatePercentage(100, 50)).toBe(50);
    });

    it("should calculate 25% of 200", () => {
      expect(calculatePercentage(200, 25)).toBe(50);
    });

    it("should return 0 for 0%", () => {
      expect(calculatePercentage(100, 0)).toBe(0);
    });
  });

  describe("clamp", () => {
    it("should return value when within range", () => {
      expect(clamp(5, 0, 10)).toBe(5);
    });

    it("should return min when value is below range", () => {
      expect(clamp(-5, 0, 10)).toBe(0);
    });

    it("should return max when value is above range", () => {
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it("should handle negative ranges", () => {
      expect(clamp(-5, -10, -1)).toBe(-5);
    });
  });
});
