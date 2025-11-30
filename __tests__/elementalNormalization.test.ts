/**
 * Elemental Normalization Tests
 *
 * Comprehensive tests for the elemental normalization utilities
 * including normalizeForDisplay, isNormalized, convertNormalizedToRaw, etc.
 */

import { describe, expect, test } from "@jest/globals";
import {
  normalizeForDisplay,
  getTotalIntensity,
  getDominantElementByIntensity,
  isNormalized,
  convertNormalizedToRaw,
  getRelativeStrengths,
  formatAsPercentages,
  compareIntensities,
} from "@/utils/elemental/normalization";
import type {
  RawElementalProperties,
  NormalizedElementalProperties,
} from "@/types/alchemy";

// Sample test data
const rawProperties: RawElementalProperties = {
  Fire: 5.2,
  Water: 3.1,
  Earth: 1.8,
  Air: 1.2,
};

const normalizedProperties: NormalizedElementalProperties = {
  Fire: 0.25,
  Water: 0.25,
  Earth: 0.25,
  Air: 0.25,
};

const highFireRaw: RawElementalProperties = {
  Fire: 8.0,
  Water: 2.0,
  Earth: 2.0,
  Air: 2.0,
};

const zeroProperties: RawElementalProperties = {
  Fire: 0,
  Water: 0,
  Earth: 0,
  Air: 0,
};

describe("Elemental Normalization Utilities", () => {
  describe("normalizeForDisplay", () => {
    test("normalizes raw values to percentages summing to 1.0", () => {
      const result = normalizeForDisplay(rawProperties);

      const total = result.Fire + result.Water + result.Earth + result.Air;
      expect(total).toBeCloseTo(1.0, 6);
    });

    test("preserves relative proportions", () => {
      const result = normalizeForDisplay(rawProperties);

      // Fire should be largest (5.2 / 11.3 = 0.46)
      expect(result.Fire).toBeCloseTo(5.2 / 11.3, 2);
      expect(result.Water).toBeCloseTo(3.1 / 11.3, 2);
      expect(result.Earth).toBeCloseTo(1.8 / 11.3, 2);
      expect(result.Air).toBeCloseTo(1.2 / 11.3, 2);
    });

    test("returns default values for zero input", () => {
      const result = normalizeForDisplay(zeroProperties);

      expect(result.Fire).toBe(0.25);
      expect(result.Water).toBe(0.25);
      expect(result.Earth).toBe(0.25);
      expect(result.Air).toBe(0.25);
    });

    test("works with already normalized values", () => {
      const result = normalizeForDisplay(normalizedProperties);

      const total = result.Fire + result.Water + result.Earth + result.Air;
      expect(total).toBeCloseTo(1.0, 6);
    });

    test("handles high-intensity raw values", () => {
      const highIntensity = { Fire: 100, Water: 50, Earth: 30, Air: 20 };
      const result = normalizeForDisplay(highIntensity);

      const total = result.Fire + result.Water + result.Earth + result.Air;
      expect(total).toBeCloseTo(1.0, 6);
      expect(result.Fire).toBeCloseTo(0.5, 2); // 100/200
    });
  });

  describe("getTotalIntensity", () => {
    test("sums all element values", () => {
      const result = getTotalIntensity(rawProperties);

      expect(result).toBeCloseTo(5.2 + 3.1 + 1.8 + 1.2, 6);
      expect(result).toBeCloseTo(11.3, 6);
    });

    test("returns 1.0 for normalized properties", () => {
      const result = getTotalIntensity(normalizedProperties);

      expect(result).toBeCloseTo(1.0, 6);
    });

    test("returns 0 for zero properties", () => {
      const result = getTotalIntensity(zeroProperties);

      expect(result).toBe(0);
    });
  });

  describe("getDominantElementByIntensity", () => {
    test("returns element with highest value", () => {
      const result = getDominantElementByIntensity(rawProperties);

      expect(result).toBe("Fire");
    });

    test("works with high-intensity values", () => {
      const result = getDominantElementByIntensity(highFireRaw);

      expect(result).toBe("Fire");
    });

    test("returns first element for equal values", () => {
      const equalProperties = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
      const result = getDominantElementByIntensity(equalProperties);

      // Should return first element (order depends on Object.entries)
      expect(["Fire", "Water", "Earth", "Air"]).toContain(result);
    });
  });

  describe("isNormalized", () => {
    test("returns true for normalized properties (sum = 1.0)", () => {
      const result = isNormalized(normalizedProperties);

      expect(result).toBe(true);
    });

    test("returns false for raw properties (sum > 1.0)", () => {
      const result = isNormalized(rawProperties);

      expect(result).toBe(false);
    });

    test("handles edge cases near 1.0", () => {
      const nearNormalized = { Fire: 0.24, Water: 0.26, Earth: 0.25, Air: 0.25 };
      const result = isNormalized(nearNormalized);

      expect(result).toBe(true);
    });

    test("returns true for sum of 1.05 (within tolerance)", () => {
      const nearNormalized = { Fire: 0.26, Water: 0.26, Earth: 0.26, Air: 0.27 };
      const result = isNormalized(nearNormalized);

      // Should still be considered normalized (within tolerance)
      expect(result).toBe(true);
    });
  });

  describe("convertNormalizedToRaw", () => {
    test("scales normalized values to reference intensity", () => {
      const result = convertNormalizedToRaw(normalizedProperties, 10);

      expect(result.Fire).toBe(2.5);
      expect(result.Water).toBe(2.5);
      expect(result.Earth).toBe(2.5);
      expect(result.Air).toBe(2.5);

      const total = result.Fire + result.Water + result.Earth + result.Air;
      expect(total).toBe(10);
    });

    test("uses default reference intensity of 4.0", () => {
      const result = convertNormalizedToRaw(normalizedProperties);

      const total = result.Fire + result.Water + result.Earth + result.Air;
      expect(total).toBe(4.0);
    });

    test("returns raw values unchanged when already raw", () => {
      const result = convertNormalizedToRaw(rawProperties, 10);

      // Should detect that rawProperties is not normalized (sum != 1.0)
      // and return values as-is
      expect(result.Fire).toBe(5.2);
      expect(result.Water).toBe(3.1);
      expect(result.Earth).toBe(1.8);
      expect(result.Air).toBe(1.2);
    });
  });

  describe("getRelativeStrengths", () => {
    test("calculates element strength relative to average", () => {
      const result = getRelativeStrengths(highFireRaw);

      // Total = 14, average = 3.5
      // Fire = 8 / 3.5 = 2.29
      expect(result.Fire).toBeCloseTo(8 / 3.5, 2);
      expect(result.Water).toBeCloseTo(2 / 3.5, 2);
    });

    test("returns all 1.0 for zero properties", () => {
      const result = getRelativeStrengths(zeroProperties);

      expect(result.Fire).toBe(1);
      expect(result.Water).toBe(1);
      expect(result.Earth).toBe(1);
      expect(result.Air).toBe(1);
    });

    test("balanced properties have strength of 1.0", () => {
      const balanced = { Fire: 5, Water: 5, Earth: 5, Air: 5 };
      const result = getRelativeStrengths(balanced);

      expect(result.Fire).toBe(1);
      expect(result.Water).toBe(1);
      expect(result.Earth).toBe(1);
      expect(result.Air).toBe(1);
    });
  });

  describe("formatAsPercentages", () => {
    test("formats raw values as percentage strings", () => {
      const result = formatAsPercentages(rawProperties);

      expect(result.Fire).toBe("46.0%");
      expect(result.Water).toBe("27.4%");
      expect(result.Earth).toBe("15.9%");
      expect(result.Air).toBe("10.6%");
    });

    test("respects decimal places parameter", () => {
      const result = formatAsPercentages(rawProperties, 2);

      expect(result.Fire).toContain("46.");
      expect(result.Fire.split(".")[1]).toBe("02%");
    });

    test("works with already normalized values", () => {
      const result = formatAsPercentages(normalizedProperties);

      expect(result.Fire).toBe("25.0%");
      expect(result.Water).toBe("25.0%");
      expect(result.Earth).toBe("25.0%");
      expect(result.Air).toBe("25.0%");
    });
  });

  describe("compareIntensities", () => {
    test("calculates differences between two property sets", () => {
      const props1 = { Fire: 5.2, Water: 3.1, Earth: 1.8, Air: 1.2 };
      const props2 = { Fire: 3.0, Water: 4.0, Earth: 2.0, Air: 1.0 };

      const result = compareIntensities(props1, props2);

      expect(result.Fire).toBeCloseTo(2.2, 6);
      expect(result.Water).toBeCloseTo(-0.9, 6);
      expect(result.Earth).toBeCloseTo(-0.2, 6);
      expect(result.Air).toBeCloseTo(0.2, 6);
    });

    test("returns zeros for identical properties", () => {
      const result = compareIntensities(rawProperties, rawProperties);

      expect(result.Fire).toBe(0);
      expect(result.Water).toBe(0);
      expect(result.Earth).toBe(0);
      expect(result.Air).toBe(0);
    });
  });

  describe("Integration Tests", () => {
    test("round-trip: normalize -> convert back preserves proportions", () => {
      const original = { Fire: 4, Water: 3, Earth: 2, Air: 1 };
      const originalTotal = getTotalIntensity(original);

      const normalized = normalizeForDisplay(original);
      const restored = convertNormalizedToRaw(normalized, originalTotal);

      expect(restored.Fire).toBeCloseTo(original.Fire, 5);
      expect(restored.Water).toBeCloseTo(original.Water, 5);
      expect(restored.Earth).toBeCloseTo(original.Earth, 5);
      expect(restored.Air).toBeCloseTo(original.Air, 5);
    });

    test("dominant element is consistent across normalization", () => {
      const raw = { Fire: 8, Water: 2, Earth: 3, Air: 1 };
      const normalized = normalizeForDisplay(raw);

      const rawDominant = getDominantElementByIntensity(raw);
      const normalizedDominant = getDominantElementByIntensity(normalized);

      expect(rawDominant).toBe(normalizedDominant);
      expect(rawDominant).toBe("Fire");
    });

    test("relative strengths remain consistent after normalization", () => {
      const raw = { Fire: 10, Water: 5, Earth: 3, Air: 2 };
      const normalized = normalizeForDisplay(raw);

      const rawStrengths = getRelativeStrengths(raw);
      const normalizedStrengths = getRelativeStrengths(normalized);

      // Relative strengths should be the same
      expect(rawStrengths.Fire).toBeCloseTo(normalizedStrengths.Fire, 5);
      expect(rawStrengths.Water).toBeCloseTo(normalizedStrengths.Water, 5);
      expect(rawStrengths.Earth).toBeCloseTo(normalizedStrengths.Earth, 5);
      expect(rawStrengths.Air).toBeCloseTo(normalizedStrengths.Air, 5);
    });
  });
});
