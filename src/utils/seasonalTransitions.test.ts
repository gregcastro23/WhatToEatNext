import { VALID_SEASONS } from "@/constants/seasons";
import type { Season } from "@/types/alchemy";
import type { ElementalState } from "@/types/elemental";
import {
  applySeasonalTransition,
  getSeasonalInfluence,
} from "@/utils/seasonalTransitions";

// getSeasonalInfluence returns baseElements (0.25) scaled by (1 + modifier).
// Every one of these products is exactly representable as a double — 0.25 is a
// power of two, so the scaling is exact — which is why these assert with toBe
// rather than toBeCloseTo. A wrong key set cannot coincidentally produce them.
const EXPECTED: Record<Season, ElementalState> = {
  spring: { Fire: 0.3, Water: 0.275, Air: 0.325, Earth: 0.25 },
  summer: { Fire: 0.325, Water: 0.25, Air: 0.3, Earth: 0.275 },
  autumn: { Fire: 0.275, Water: 0.3, Air: 0.25, Earth: 0.325 },
  fall: { Fire: 0.275, Water: 0.3, Air: 0.25, Earth: 0.325 },
  winter: { Fire: 0.25, Water: 0.325, Air: 0.275, Earth: 0.3 },
  all: { Fire: 0.25, Water: 0.25, Air: 0.25, Earth: 0.25 },
};

describe("seasonalTransitions", () => {
  describe("getSeasonalInfluence", () => {
    // The four real seasons. Before the key set was corrected, the table was
    // keyed "_Spring"/"_Summer"/"_Autumn"/"_Winter" and every one of these
    // missed, so the function threw instead of returning a balance.
    it.each(["spring", "summer", "fall", "winter"] as const)(
      "returns real elemental values for %s",
      (season) => {
        expect(() => getSeasonalInfluence(season)).not.toThrow();

        const influence = getSeasonalInfluence(season);
        const expected = EXPECTED[season];

        expect(influence.Fire).toBe(expected.Fire);
        expect(influence.Water).toBe(expected.Water);
        expect(influence.Air).toBe(expected.Air);
        expect(influence.Earth).toBe(expected.Earth);
      },
    );

    it("covers every member of VALID_SEASONS with finite, positive values", () => {
      // Guards the table against a season being added to VALID_SEASONS at
      // runtime without a row here.
      for (const season of VALID_SEASONS) {
        const influence = getSeasonalInfluence(season);

        for (const element of ["Fire", "Water", "Air", "Earth"] as const) {
          expect(Number.isFinite(influence[element])).toBe(true);
          expect(influence[element]).toBeGreaterThan(0);
        }
      }
    });

    it("treats fall and autumn as the same season", () => {
      expect(getSeasonalInfluence("fall")).toEqual(
        getSeasonalInfluence("autumn"),
      );
    });

    it("applies no seasonal bias for 'all'", () => {
      expect(getSeasonalInfluence("all")).toEqual({
        Fire: 0.25,
        Water: 0.25,
        Air: 0.25,
        Earth: 0.25,
      });
    });

    it("distinguishes the four seasons from one another", () => {
      // A table that collapsed to one row would still satisfy the assertions
      // above if they were weakened to "not zero", so pin that the seasons are
      // actually distinct.
      const signatures = (["spring", "summer", "fall", "winter"] as const).map(
        (season) => JSON.stringify(getSeasonalInfluence(season)),
      );

      expect(new Set(signatures).size).toBe(4);
    });

    it("rejects the underscore-prefixed key the table used to carry", () => {
      // Routed through applySeasonalTransition because it is the entry point
      // that accepts a plain string, so this needs no cast to Season. Both
      // functions share resolveSeason, so this covers the same rejection path.
      expect(() =>
        applySeasonalTransition(new Date("2026-05-01T12:00:00Z"), {
          name: "_Spring",
        }),
      ).toThrow(/does not name a season/);
    });
  });

  describe("applySeasonalTransition", () => {
    const date = new Date("2026-05-01T12:00:00Z");

    it("returns the neutral balance when there is no phase", () => {
      expect(applySeasonalTransition(date, null)).toEqual({
        Fire: 0.25,
        Water: 0.25,
        Air: 0.25,
        Earth: 0.25,
      });
    });

    it("scales the base balance by the phase's season", () => {
      // Midpoint progress gives strength exactly 0.8, so the expected value is
      // 0.25 * (1 + 0.8 * modifier). These carry float residue, hence
      // toBeCloseTo.
      const balance = applySeasonalTransition(date, { name: "spring" });

      expect(balance.Fire).toBeCloseTo(0.29, 10);
      expect(balance.Water).toBeCloseTo(0.27, 10);
      expect(balance.Air).toBeCloseTo(0.31, 10);
      expect(balance.Earth).toBeCloseTo(0.25, 10);
    });

    it("accepts the capitalised phase names the original table was keyed for", () => {
      expect(applySeasonalTransition(date, { name: "Spring" })).toEqual(
        applySeasonalTransition(date, { name: "spring" }),
      );
    });

    it("throws a named error when the phase does not name a season", () => {
      expect(() =>
        applySeasonalTransition(date, { name: "_Spring" }),
      ).toThrow(/does not name a season/);
    });
  });
});
