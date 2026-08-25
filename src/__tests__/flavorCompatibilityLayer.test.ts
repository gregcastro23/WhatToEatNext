/**
 * Regression tests for the legacy flavor compatibility layer.
 *
 * Three defects, all of which made `calculateFlavorCompatibility` return a
 * result that looked plausible but meant nothing:
 *
 *  1. `calculatePreparationCompatibility` computed
 *     `intersection.size / Math.max(union.size)` - a single-argument
 *     `Math.max`. With no preparation methods on either profile the union is
 *     empty, so this was 0/0 = NaN, which flowed into the weighted `overall`
 *     score. Every caller got NaN (rendered as `null` by JSON.stringify).
 *  2. The engine caches on `${profile1.id}-${profile2.id}`, but every legacy
 *     call site passed a constant id ("legacy-1"/"legacy-2"). The first result
 *     computed in a process was returned for every later pair, so unrelated
 *     inputs produced byte-identical scores.
 *  3. The parameters were typed `{}`, which accepts strings, so passing
 *     ingredient names type-checked and silently produced an all-zero profile.
 */

import {
  calculateFlavorCompatibility,
  calculateFlavorMatch,
} from "@/data/unified/flavorCompatibilityLayer";

const SAVORY = { sweet: 0.1, sour: 0.2, salty: 0.1, bitter: 0.3, umami: 0.6, spicy: 0.4 };
const BALANCED = { sweet: 0.5, sour: 0.1, salty: 0.2, bitter: 0.1, umami: 0.3, spicy: 0.1 };
const SWEET = { sweet: 0.9, sour: 0.0, salty: 0.0, bitter: 0.0, umami: 0.0, spicy: 0.0 };

describe("calculateFlavorCompatibility returns real numbers", () => {
  it("produces a finite compatibility score, not NaN", () => {
    const result = calculateFlavorCompatibility(SAVORY, BALANCED);
    // The reported symptom was `compatibility: null` - NaN through JSON.
    expect(Number.isNaN(result.compatibility)).toBe(false);
    expect(Number.isFinite(result.compatibility)).toBe(true);
    expect(result.compatibility).toBeGreaterThanOrEqual(0);
    expect(result.compatibility).toBeLessThanOrEqual(1);
  });

  it("produces finite sub-scores", () => {
    const result = calculateFlavorCompatibility(SAVORY, BALANCED);
    for (const value of [
      result.elementalHarmony,
      result.kalchmResonance,
      result.monicaOptimization,
      result.seasonalAlignment,
    ]) {
      expect(Number.isFinite(value)).toBe(true);
    }
  });

  it("stays finite when neither profile declares preparation methods", () => {
    // The empty-union case that produced 0/0.
    const result = calculateFlavorCompatibility(
      { ...SAVORY, preparationMethods: [] },
      { ...BALANCED, preparationMethods: [] },
    );
    expect(Number.isFinite(result.compatibility)).toBe(true);
  });

  it("returns a finite number through calculateFlavorMatch", () => {
    expect(Number.isFinite(calculateFlavorMatch(SAVORY, BALANCED))).toBe(true);
  });
});

describe("distinct inputs produce distinct results", () => {
  it("does not return one cached result for unrelated pairs", () => {
    const first = calculateFlavorCompatibility(SAVORY, BALANCED);
    const second = calculateFlavorCompatibility(SWEET, BALANCED);
    // Previously byte-identical because both cached under "legacy-1-legacy-2".
    expect(JSON.stringify(first)).not.toEqual(JSON.stringify(second));
    expect(first.elementalHarmony).not.toBeCloseTo(second.elementalHarmony, 6);
  });

  it("is order-independent: a pair scores the same whenever it is evaluated", () => {
    // The cache bug made a pair's score depend on what was computed before it.
    const sweetFirst = calculateFlavorCompatibility(SWEET, BALANCED);
    calculateFlavorCompatibility(SAVORY, BALANCED);
    const sweetAgain = calculateFlavorCompatibility(SWEET, BALANCED);
    expect(sweetAgain.compatibility).toBeCloseTo(sweetFirst.compatibility, 10);
    expect(sweetAgain.elementalHarmony).toBeCloseTo(
      sweetFirst.elementalHarmony,
      10,
    );
  });

  it("remains deterministic for a repeated pair", () => {
    const a = calculateFlavorCompatibility(SAVORY, BALANCED);
    const b = calculateFlavorCompatibility(SAVORY, BALANCED);
    expect(JSON.stringify(a)).toEqual(JSON.stringify(b));
  });
});

describe("non-profile input is rejected rather than silently scored", () => {
  it("flags ingredient names instead of returning a plausible score", () => {
    // These are names, not profiles. Reading `.sweet` off a string yields
    // undefined for every note, collapsing both arguments to the same
    // all-zero profile.
    const result = calculateFlavorCompatibility(
      "garlic" as never,
      "ginger" as never,
    );
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings.join(" ")).toMatch(/not a flavor profile/i);
  });

  it("does not give two different name pairs a confident identical score", () => {
    const a = calculateFlavorCompatibility("garlic" as never, "ginger" as never);
    const b = calculateFlavorCompatibility("tomato" as never, "basil" as never);
    // They may share the rejection result, but it must be marked as such
    // rather than presented as a computed compatibility.
    expect(a.warnings.length).toBeGreaterThan(0);
    expect(b.warnings.length).toBeGreaterThan(0);
    expect(a.recommendations).toHaveLength(0);
  });

  it("rejects empty objects, arrays and null", () => {
    for (const bad of [{}, [], null]) {
      const result = calculateFlavorCompatibility(bad as never, SAVORY);
      expect(result.warnings.length).toBeGreaterThan(0);
    }
  });

  it("still accepts a nested legacy cuisine profile shape", () => {
    const result = calculateFlavorCompatibility(
      { flavorProfiles: { sweet: 0.4, umami: 0.5 } },
      BALANCED,
    );
    expect(result.warnings).toHaveLength(0);
    expect(Number.isFinite(result.compatibility)).toBe(true);
  });
});
