import { describe, expect, it } from "vitest";
import { shuffleArray } from "./utils";

describe("utils", () => {
  describe("shuffleArray", () => {
    it("should return an array of the same length", () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray([...original]);

      expect(shuffled).toHaveLength(original.length);
    });

    it("should contain all original elements", () => {
      const original = ["a", "b", "c", "d", "e"];
      const shuffled = shuffleArray([...original]);

      original.forEach((item) => {
        expect(shuffled).toContain(item);
      });
    });

    it("should handle empty arrays", () => {
      const empty: unknown[] = [];
      const result = shuffleArray([...empty]);

      expect(result).toEqual([]);
    });

    it("should handle single element arrays", () => {
      const single = [42];
      const result = shuffleArray([...single]);

      expect(result).toEqual([42]);
    });

    it("should handle arrays with duplicate elements", () => {
      const duplicates = [1, 1, 2, 2, 3];
      const shuffled = shuffleArray([...duplicates]);

      expect(shuffled).toHaveLength(5);
      expect(shuffled.filter((x: unknown) => x === 1)).toHaveLength(2);
      expect(shuffled.filter((x: unknown) => x === 2)).toHaveLength(2);
      expect(shuffled.filter((x: unknown) => x === 3)).toHaveLength(1);
    });

    it("should modify the original array", () => {
      const original = [1, 2, 3, 4, 5];
      const result = shuffleArray(original);

      // Should return the same reference (mutates in place)
      expect(result).toBe(original);

      // Verify it's actually shuffling by running multiple times
      // With a large enough array, at least one shuffle should differ
      const testArray = Array.from({ length: 20 }, (_, i) => i);
      const copy = [...testArray];
      let foundDifference = false;

      for (let i = 0; i < 10; i++) {
        const shuffled = shuffleArray([...copy]);
        if (JSON.stringify(shuffled) !== JSON.stringify(copy)) {
          foundDifference = true;
          break;
        }
      }

      expect(foundDifference).toBe(true);
    });

    it("should handle different data types", () => {
      const mixed = [1, "string", { key: "value" }, null, undefined];
      const shuffled = shuffleArray([...mixed]);

      expect(shuffled).toHaveLength(5);
      expect(shuffled).toContain(1);
      expect(shuffled).toContain("string");
      expect(shuffled).toContain(null);
      expect(shuffled).toContain(undefined);
    });
  });
});
