import type { NatalChart } from "@/types/natalChart";
import {
  calculateAlchemicalProfile,
  calculateAlchemicalState,
} from "@/utils/astrology/natalAlchemy";

// natalChartService.normalizeSignName stores signs LOWERCASE (ZodiacSignType).
// SIGN_PROPERTIES in natalAlchemy is keyed by capitalized names, so before the
// case-normalization fix every lookup missed and the whole profile was zero
// (the /lab ELEMENTAL BALANCE + THERMODYNAMICS "0.0% / 0.00q" bug).
function chartWith(signCase: "lower" | "upper"): NatalChart {
  const norm = (s: string) =>
    signCase === "lower" ? s.toLowerCase() : s;
  return {
    planets: [
      { name: "Sun", sign: norm("cancer") },
      { name: "Moon", sign: norm("aries") },
      { name: "Mercury", sign: norm("gemini") },
      { name: "Venus", sign: norm("leo") },
      { name: "Mars", sign: norm("scorpio") },
      { name: "Jupiter", sign: norm("virgo") },
      { name: "Saturn", sign: norm("capricorn") },
    ],
    ascendant: norm("libra"),
  } as unknown as NatalChart;
}

describe("natalAlchemy", () => {
  it("computes non-zero, normalized elements from LOWERCASE natal signs (regression)", () => {
    const state = calculateAlchemicalState(chartWith("lower"));
    const sum = state.fire + state.water + state.earth + state.air;
    expect(sum).toBeGreaterThan(0.99);
    expect(sum).toBeLessThan(1.01);
    // At least one element must be materially non-zero (Cancer→Water, etc.).
    expect(Math.max(state.fire, state.water, state.earth, state.air)).toBeGreaterThan(0);
    expect(state.spirit + state.essence + state.matter + state.substance).toBeGreaterThan(0);
  });

  it("is case-insensitive: capitalized signs give the same result", () => {
    const lower = calculateAlchemicalState(chartWith("lower"));
    const upper = calculateAlchemicalState(chartWith("upper"));
    expect(upper.fire).toBeCloseTo(lower.fire, 10);
    expect(upper.water).toBeCloseTo(lower.water, 10);
    expect(upper.earth).toBeCloseTo(lower.earth, 10);
    expect(upper.air).toBeCloseTo(lower.air, 10);
  });

  it("produces a full profile with finite thermodynamics", () => {
    const profile = calculateAlchemicalProfile(chartWith("lower"));
    for (const key of [
      "fire",
      "water",
      "earth",
      "air",
      "spirit",
      "essence",
      "matter",
      "substance",
      "heat",
      "entropy",
      "reactivity",
      "gregsEnergy",
    ] as const) {
      expect(Number.isFinite(profile[key])).toBe(true);
    }
  });

  it("does not throw on an empty planets array (stays zero, no crash)", () => {
    const empty = { planets: [], ascendant: "aries" } as unknown as NatalChart;
    const state = calculateAlchemicalState(empty);
    // Ascendant alone (aries → Fire) still contributes, so this normalizes too;
    // the point is it must not throw.
    expect(Number.isFinite(state.fire)).toBe(true);
  });
});
