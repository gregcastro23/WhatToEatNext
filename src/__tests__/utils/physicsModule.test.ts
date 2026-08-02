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
      // What this asserts is the LOOKUP — that an absent metric resolves through
      // FALLBACK_METRICS[key] — so the expectation is computed FROM that table
      // rather than transcribed from it. The hard-coded form pinned the priors a
      // second time in a file that does not own them, and duly broke when they
      // were re-derived over a regenerated corpus (2026-08-02). Same fix the
      // sigmoid case below already carries for the same reason.
      const project = (v: number, key: string) => {
        const m = FALLBACK_METRICS[key];
        return Math.max(0.1, Math.min(0.9, 0.5 + ((v - m.mean) / m.stdDev) * 0.15));
      };

      expect(projectZScoreTarget(12, undefined, "reactivity")).toBeCloseTo(
        project(12, "reactivity"), 12,
      );
      expect(projectZScoreTarget(0.11, undefined, "heat")).toBeCloseTo(
        project(0.11, "heat"), 12,
      );

      // POSITIVE CONTROL: the fallback path actually ran. Without a key the
      // function clamps instead of z-scoring, so an identical result would mean
      // the lookup never happened and the assertions above proved nothing.
      expect(projectZScoreTarget(12, undefined, "reactivity")).not.toBeCloseTo(
        projectZScoreTarget(12, undefined), 6,
      );
      // ...and an explicit metric must override the fallback.
      expect(projectZScoreTarget(12, { mean: 10, stdDev: 2 }, "reactivity")).toBeCloseTo(0.65, 12);
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
