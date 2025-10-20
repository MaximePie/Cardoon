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
      const copy = [...original];
      const result = shuffleArray(original);

      expect(result).toBe(original); // Same reference
      expect(original).not.toEqual(copy); // Content might be different
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
