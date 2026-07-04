import {
  projectZScoreTarget,
  calculateThermodynamicCompatibility,
  calculateKineticCompatibility,
  FALLBACK_METRICS,
} from "../../utils/enhancedCompatibilityScoring";

describe("Physics Module Calculations", () => {
  describe("projectZScoreTarget", () => {
    it("should compute z-score correctly when metric is provided", () => {
      const metric = { mean: 10, stdDev: 2 };
      // z-score = (12 - 10) / 2 = 1.0
      // projected = 0.5 + 1.0 * 0.15 = 0.65
      expect(projectZScoreTarget(12, metric)).toBeCloseTo(0.65, 4);

      // z-score = (6 - 10) / 2 = -2.0
      // projected = 0.5 - 2.0 * 0.15 = 0.20
      expect(projectZScoreTarget(6, metric)).toBeCloseTo(0.20, 4);
    });

    it("should use fallback metrics when metric is undefined and fallbackKey is provided", () => {
      // For reactivity: mean = 10, stdDev = 4
      // value = 12 -> z-score = (12 - 10) / 4 = 0.5
      // projected = 0.5 + 0.5 * 0.15 = 0.575
      expect(projectZScoreTarget(12, undefined, "reactivity")).toBeCloseTo(0.575, 4);

      // For heat: mean = 0.08, stdDev = 0.03
      // value = 0.11 -> z-score = (0.11 - 0.08) / 0.03 = 1.0
      // projected = 0.5 + 1.0 * 0.15 = 0.65
      expect(projectZScoreTarget(0.11, undefined, "heat")).toBeCloseTo(0.65, 4);
    });

    it("should clamp values to [0.1, 0.9] when no metric or fallback key is available", () => {
      expect(projectZScoreTarget(5.0, undefined)).toBe(0.9);
      expect(projectZScoreTarget(0.01, undefined)).toBe(0.1);
      expect(projectZScoreTarget(0.5, undefined)).toBe(0.5);
    });
  });

  describe("sigmoidCompatibility", () => {
    it("should return 1.0 for a perfect match (diff = 0)", () => {
      // userState.entropy = 0.5 -> projected = 0.875
      // itemState.entropy = 0.875 -> diff = 0
      const thermoResult = calculateThermodynamicCompatibility(
        { heat: 0.08, entropy: 0.5, reactivity: 10.0, gregsEnergy: 0 },
        { heat: 0.5, entropy: 0.875, reactivity: 0.5, gregsEnergy: 0 }
      );
      expect(thermoResult.entropyCompatibility).toBeCloseTo(1.0, 4);
    });
  });

  describe("calculateThermodynamicCompatibility & calculateKineticCompatibility", () => {
    it("should calculate reasonable compatibility scores without historical metrics", () => {
      const userThermo = { heat: 0.08, entropy: 0.30, reactivity: 10.0, gregsEnergy: 0 };
      const itemThermo = { heat: 0.5, entropy: 0.5, reactivity: 0.5, gregsEnergy: 0 };

      const thermoResult = calculateThermodynamicCompatibility(userThermo, itemThermo);
      expect(thermoResult.overall).toBeGreaterThan(0);
      expect(thermoResult.overall).toBeLessThanOrEqual(1.0);

      const userKinetics = { power: 0.08, currentFlow: 0.4, potentialDifference: 0.5, charge: 8.0 };
      const itemKinetics = { power: 0.5, currentFlow: 0.5, potentialDifference: 0.5, charge: 0.5 };

      const kineticResult = calculateKineticCompatibility(userKinetics, itemKinetics);
      expect(kineticResult.overall).toBeGreaterThan(0);
      expect(kineticResult.overall).toBeLessThanOrEqual(1.0);
    });
  });
});
