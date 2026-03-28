/**
 * Tests for ElementalCalculator.ts — match score calculation between
 * elemental properties and current elemental state.
 */
import { calculateMatchScore } from "@/utils/ElementalCalculator";

describe("calculateMatchScore", () => {
  const balanced = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };

  it("returns a number between 0 and 1 for valid inputs", () => {
    const score = calculateMatchScore(balanced, balanced);
    expect(typeof score).toBe("number");
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  it("returns a high score for identical elemental profiles", () => {
    const props = { Fire: 0.5, Water: 0.2, Earth: 0.2, Air: 0.1 };
    const score = calculateMatchScore(props, props);
    expect(score).toBeGreaterThan(0.8);
  });

  it("returns a lower score for opposing profiles", () => {
    const fireHeavy = { Fire: 0.8, Water: 0.1, Earth: 0.05, Air: 0.05 };
    const waterHeavy = { Fire: 0.05, Water: 0.8, Earth: 0.1, Air: 0.05 };
    const score = calculateMatchScore(fireHeavy, waterHeavy);
    // Not identical, so lower
    expect(score).toBeLessThan(0.9);
  });

  it("handles null/undefined elementalProperties by defaulting to balanced", () => {
    const score = calculateMatchScore(null as any, balanced);
    expect(typeof score).toBe("number");
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  it("handles undefined elementalState by defaulting to balanced", () => {
    const score = calculateMatchScore(balanced, undefined);
    expect(typeof score).toBe("number");
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  it("handles NaN values in properties by replacing with 0.25", () => {
    const withNaN = { Fire: NaN, Water: 0.3, Earth: 0.3, Air: 0.1 };
    const score = calculateMatchScore(withNaN, balanced);
    expect(typeof score).toBe("number");
    expect(isNaN(score)).toBe(false);
  });

  it("handles empty elementalState object by defaulting", () => {
    const score = calculateMatchScore(balanced, {});
    expect(typeof score).toBe("number");
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  describe("with options", () => {
    it("applies seasonal weight adjustments", () => {
      const fireHeavy = { Fire: 0.6, Water: 0.1, Earth: 0.2, Air: 0.1 };
      const winterScore = calculateMatchScore(fireHeavy, balanced, { season: "winter" });
      const baseScore = calculateMatchScore(fireHeavy, balanced);
      // Winter boosts Fire weight, so the score should differ
      expect(winterScore).not.toBe(baseScore);
    });

    it("applies meal type adjustments", () => {
      const earthHeavy = { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 };
      const dinnerScore = calculateMatchScore(earthHeavy, balanced, { mealType: "dinner" });
      const breakfastScore = calculateMatchScore(earthHeavy, balanced, { mealType: "breakfast" });
      // Dinner boosts Earth/Water, breakfast boosts Fire/Air — scores should differ
      expect(dinnerScore).not.toBe(breakfastScore);
    });

    it("contrast mode inverts scoring for differing profiles", () => {
      const fireHeavy = { Fire: 0.7, Water: 0.1, Earth: 0.1, Air: 0.1 };
      const waterHeavy = { Fire: 0.1, Water: 0.7, Earth: 0.1, Air: 0.1 };
      const normalScore = calculateMatchScore(fireHeavy, waterHeavy);
      const contrastScore = calculateMatchScore(fireHeavy, waterHeavy, { preferHigherContrast: true });
      // With differing profiles, contrast mode should produce a different score
      expect(contrastScore).not.toBe(normalScore);
    });
  });
});
