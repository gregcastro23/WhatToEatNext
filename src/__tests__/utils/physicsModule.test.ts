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
      // §17c-recalibrated priors (canonical engine distribution).
      // reactivity: mean = 6.54, stdDev = 6.91
      // value = 12 -> z = (12 - 6.54) / 6.91 = 0.7902 -> 0.5 + 0.7902*0.15 = 0.6185
      expect(projectZScoreTarget(12, undefined, "reactivity")).toBeCloseTo(0.6185, 4);

      // heat: mean = 0.067, stdDev = 0.037
      // value = 0.11 -> z = (0.11 - 0.067) / 0.037 = 1.1622 -> 0.5 + 1.1622*0.15 = 0.6743
      expect(projectZScoreTarget(0.11, undefined, "heat")).toBeCloseTo(0.6743, 4);
    });

    it("should clamp values to [0.1, 0.9] when no metric or fallback key is available", () => {
      expect(projectZScoreTarget(5.0, undefined)).toBe(0.9);
      expect(projectZScoreTarget(0.01, undefined)).toBe(0.1);
      expect(projectZScoreTarget(0.5, undefined)).toBe(0.5);
    });
  });

  describe("sigmoidCompatibility", () => {
    it("should return 1.0 for a perfect match (diff = 0)", () => {
      // entropyCompatibility = sigmoid(projected(user.entropy), item.entropy). A
      // perfect match is item.entropy === projected(user.entropy). Compute the
      // projection dynamically so this survives the §17c prior recalibration
      // (the old form hard-coded 0.875, which only held under the pre-recon prior).
      const userEntropy = 0.30;
      const itemEntropy = projectZScoreTarget(userEntropy, undefined, "entropy");
      const thermoResult = calculateThermodynamicCompatibility(
        { heat: 0.08, entropy: userEntropy, reactivity: 6.54, gregsEnergy: 0 },
        { heat: 0.5, entropy: itemEntropy, reactivity: 0.5, gregsEnergy: 0 }
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
