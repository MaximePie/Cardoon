import { describe, expect, it } from "vitest";
import { formattedNumber } from "./numbers";

describe("formattedNumber", () => {
  describe("Basic Number Formatting", () => {
    it("should return the number as string for values under 1000", () => {
      expect(formattedNumber(0)).toBe("0");
      expect(formattedNumber(1)).toBe("1");
      expect(formattedNumber(99)).toBe("99");
      expect(formattedNumber(999)).toBe("999");
    });

    it("should format thousands with K suffix", () => {
      expect(formattedNumber(1000)).toBe("1.0K");
      expect(formattedNumber(1500)).toBe("1.5K");
      expect(formattedNumber(2750)).toBe("2.8K");
      expect(formattedNumber(10000)).toBe("10.0K");
      expect(formattedNumber(99999)).toBe("100.0K");
    });

    it("should format millions with M suffix", () => {
      expect(formattedNumber(1000000)).toBe("1.0M");
      expect(formattedNumber(1500000)).toBe("1.5M");
      expect(formattedNumber(2750000)).toBe("2.8M");
      expect(formattedNumber(10000000)).toBe("10.0M");
      expect(formattedNumber(999999999)).toBe("1000.0M");
    });
  });

  describe("Edge Cases", () => {
    it("should handle exactly 1000", () => {
      expect(formattedNumber(1000)).toBe("1.0K");
    });

    it("should handle exactly 1000000", () => {
      expect(formattedNumber(1000000)).toBe("1.0M");
    });

    it("should handle 999999 (just under million)", () => {
      expect(formattedNumber(999999)).toBe("1000.0K");
    });

    it("should handle very large numbers", () => {
      expect(formattedNumber(1234567890)).toBe("1234.6M");
      expect(formattedNumber(9999999999)).toBe("10000.0M");
    });
  });

  describe("Decimal Precision", () => {
    it("should round to 1 decimal place for thousands", () => {
      expect(formattedNumber(1234)).toBe("1.2K");
      expect(formattedNumber(1250)).toBe("1.3K");
      expect(formattedNumber(1249)).toBe("1.2K");
    });

    it("should round to 1 decimal place for millions", () => {
      expect(formattedNumber(1234567)).toBe("1.2M");
      expect(formattedNumber(1250000)).toBe("1.3M");
      expect(formattedNumber(1249999)).toBe("1.2M");
    });

    it("should handle exact decimal values", () => {
      expect(formattedNumber(1100)).toBe("1.1K");
      expect(formattedNumber(1200000)).toBe("1.2M");
      expect(formattedNumber(5500)).toBe("5.5K");
    });
  });

  describe("Negative Numbers", () => {
    it("should handle negative numbers under 1000", () => {
      expect(formattedNumber(-1)).toBe("-1");
      expect(formattedNumber(-99)).toBe("-99");
      expect(formattedNumber(-999)).toBe("-999");
    });

    it("should handle negative thousands (current behavior - numbers stay as-is)", () => {
      // Note: Current implementation doesn't format negative numbers with K/M suffixes
      // because -1000 >= 1000 is false, so they fall through to toString()
      expect(formattedNumber(-1000)).toBe("-1000");
      expect(formattedNumber(-1500)).toBe("-1500");
      expect(formattedNumber(-10000)).toBe("-10000");
    });

    it("should handle negative millions (current behavior - numbers stay as-is)", () => {
      // Note: Current implementation doesn't format negative numbers with K/M suffixes
      expect(formattedNumber(-1000000)).toBe("-1000000");
      expect(formattedNumber(-2500000)).toBe("-2500000");
      expect(formattedNumber(-10000000)).toBe("-10000000");
    });
  });

  describe("Special Values", () => {
    it("should handle zero", () => {
      expect(formattedNumber(0)).toBe("0");
    });

    it("should handle undefined/null values using nullish coalescing", () => {
      expect(formattedNumber(undefined as unknown as number)).toBe("0");
      expect(formattedNumber(null as unknown as number)).toBe("0");
    });

    it("should handle NaN", () => {
      expect(formattedNumber(NaN)).toBe("NaN");
    });

    it("should handle Infinity", () => {
      // Infinity >= 1000000 is true, so it gets formatted as "InfinityM"
      expect(formattedNumber(Infinity)).toBe("InfinityM");
      expect(formattedNumber(-Infinity)).toBe("-Infinity");
    });
  });

  describe("Floating Point Numbers", () => {
    it("should handle decimal input values under 1000", () => {
      expect(formattedNumber(123.45)).toBe("123.45");
      expect(formattedNumber(0.99)).toBe("0.99");
      expect(formattedNumber(999.9)).toBe("999.9");
    });

    it("should handle decimal input values in thousands", () => {
      expect(formattedNumber(1234.56)).toBe("1.2K");
      expect(formattedNumber(9999.99)).toBe("10.0K");
    });

    it("should handle decimal input values in millions", () => {
      expect(formattedNumber(1234567.89)).toBe("1.2M");
      expect(formattedNumber(9999999.99)).toBe("10.0M");
    });
  });

  describe("Game-specific Use Cases", () => {
    it("should format typical gold amounts", () => {
      expect(formattedNumber(50)).toBe("50"); // Starting gold
      expect(formattedNumber(250)).toBe("250"); // Small purchase
      expect(formattedNumber(1250)).toBe("1.3K"); // Medium gold
      expect(formattedNumber(15000)).toBe("15.0K"); // High gold
      expect(formattedNumber(1500000)).toBe("1.5M"); // Very high gold
    });

    it("should format score values", () => {
      expect(formattedNumber(1337)).toBe("1.3K"); // Typical score
      expect(formattedNumber(42000)).toBe("42.0K"); // High score
      expect(formattedNumber(1000000)).toBe("1.0M"); // Million point score
    });

    it("should format experience points", () => {
      expect(formattedNumber(150)).toBe("150"); // Starting XP
      expect(formattedNumber(2500)).toBe("2.5K"); // Medium XP
      expect(formattedNumber(50000)).toBe("50.0K"); // High XP
    });
  });

  describe("Boundary Testing", () => {
    it("should test numbers just below thresholds", () => {
      expect(formattedNumber(999)).toBe("999");
      expect(formattedNumber(999999)).toBe("1000.0K");
    });

    it("should test numbers just above thresholds", () => {
      expect(formattedNumber(1001)).toBe("1.0K");
      expect(formattedNumber(1000001)).toBe("1.0M");
    });

    it("should handle very small positive numbers", () => {
      expect(formattedNumber(0.1)).toBe("0.1");
      expect(formattedNumber(0.01)).toBe("0.01");
      expect(formattedNumber(0.001)).toBe("0.001");
    });
  });

  // Note: Current implementation has a limitation with negative numbers
  // They don't get formatted with K/M suffixes because the comparisons
  // (-1000 >= 1000) evaluate to false. To fix this, the function could
  // use Math.abs() for comparisons while preserving the original sign.
});
