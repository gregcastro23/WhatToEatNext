/**
 * CHARACTERIZATION test for the two live ESMS engines.
 *
 * This does NOT assert either engine is correct. It pins their CURRENT outputs
 * on a fixed chart so that when they are reconciled (SYNTHESIS_MODEL.md §14d
 * step 2 — making `alchemize` delegate to the canonical `planetaryAlchemyMapping`
 * path), the exact delta becomes visible instead of drifting silently.
 *
 * The two engines are:
 *   - `alchemize` (RealAlchemizeService) — the production path, 22 importers. It
 *     carries its OWN local dignity table (RealAlchemizeService.ts:185) on a
 *     ±0.15/level scale: `1 + dignity*0.15`, so Mercury-in-Virgo (its `virgo: 3`)
 *     multiplies by 1.45.
 *   - `calculateEnhancedAlchemicalFromPlanets` (planetaryAlchemyMapping) — the
 *     canonical path. Same `alchmWeight`, but the +10/+7 dignity scale as
 *     `1 + esmsScale/100`, so Mercury-in-Virgo (Domicile, +10) multiplies by 1.10.
 *
 * Same chart, two answers. When this test's GOLDEN values change, read the diff
 * as the reconciliation's blast radius — do not "fix" the numbers back.
 *
 * See SYNTHESIS_MODEL.md §14a.
 */
import {
  alchemize,
  type StandardizedAlchemicalResult,
} from "@/services/RealAlchemizeService";
import { calculateEnhancedAlchemicalFromPlanets } from "@/utils/planetaryAlchemyMapping";
import type { PlanetaryPosition } from "@/types/celestial";

// A fixed, arbitrary natal chart. Values chosen to exercise several dignities:
// Sun in Leo (domicile), Mercury in Virgo (domicile+exaltation), Mars in Cancer
// (fall), Saturn in Aries (fall), Jupiter in Cancer (exaltation).
const SIGNS: Record<string, string> = {
  Sun: "leo",
  Moon: "taurus",
  Mercury: "virgo",
  Venus: "libra",
  Mars: "cancer",
  Jupiter: "cancer",
  Saturn: "aries",
  Uranus: "aquarius",
  Neptune: "pisces",
  Pluto: "scorpio",
};

const POSITIONS: Record<string, PlanetaryPosition> = Object.fromEntries(
  Object.entries(SIGNS).map(([planet, sign]) => [
    planet,
    { sign, degree: 15, minute: 0 } as unknown as PlanetaryPosition,
  ]),
);

// A FIXED date is required: alchemize's ESMS is sect-dependent (bodies swap axes
// diurnal↔nocturnal, §1a), and sect is derived from the date, so `new Date()`
// makes this test drift by season. This timestamp is diurnal, matching the
// `diurnal: true` passed to the canonical engine below.
const FIXED_DATE = new Date("2026-07-20T12:00:00Z");

/** Normalize an ESMS quadruple to proportions so the two engines are comparable. */
function proportions(e: {
  Spirit: number;
  Essence: number;
  Matter: number;
  Substance: number;
}): Record<string, number> {
  const sum = e.Spirit + e.Essence + e.Matter + e.Substance || 1;
  return {
    Spirit: +(e.Spirit / sum).toFixed(4),
    Essence: +(e.Essence / sum).toFixed(4),
    Matter: +(e.Matter / sum).toFixed(4),
    Substance: +(e.Substance / sum).toFixed(4),
  };
}

describe("ESMS engine characterization (pre-reconciliation golden master)", () => {
  it("both engines produce a four-axis ESMS result for the same chart", () => {
    const real: StandardizedAlchemicalResult = alchemize(POSITIONS, null, FIXED_DATE);
    const canonical = calculateEnhancedAlchemicalFromPlanets(SIGNS, true);

    for (const axis of ["Spirit", "Essence", "Matter", "Substance"] as const) {
      expect(typeof real.esms[axis]).toBe("number");
      expect(typeof canonical[axis]).toBe("number");
      expect(Number.isFinite(real.esms[axis])).toBe(true);
      expect(Number.isFinite(canonical[axis])).toBe(true);
    }
  });

  /**
   * THE DEFECT, pinned: the two engines disagree on the same chart. This test
   * asserts they DIVERGE today — it is the thing §14d step 2 will resolve. When
   * reconciliation lands, the two proportion sets converge and THIS assertion
   * flips; change `.not.toEqual` to `.toEqual` in the same commit and delete the
   * word "pre-reconciliation" from the golden below.
   */
  it("the two engines currently DISAGREE on ESMS proportions", () => {
    const real = proportions(alchemize(POSITIONS, null, FIXED_DATE).esms);
    const canonical = proportions(
      calculateEnhancedAlchemicalFromPlanets(SIGNS, true),
    );
    expect(real).not.toEqual(canonical);
  });

  it("pins the production (alchemize) ESMS proportions [GOLDEN]", () => {
    const real = proportions(alchemize(POSITIONS, null, FIXED_DATE).esms);
    // eslint-disable-next-line no-console
    console.log("alchemize proportions:", JSON.stringify(real));
    expect(real).toEqual(GOLDEN_REAL);
  });

  it("pins the canonical (planetaryAlchemyMapping) ESMS proportions [GOLDEN]", () => {
    const canonical = proportions(
      calculateEnhancedAlchemicalFromPlanets(SIGNS, true),
    );
    // eslint-disable-next-line no-console
    console.log("canonical proportions:", JSON.stringify(canonical));
    expect(canonical).toEqual(GOLDEN_CANONICAL);
  });
});

// GOLDEN — captured 2026-07-21 at FIXED_DATE, PRE-reconciliation. A snapshot of
// current behaviour, not a claim of correctness. Both engines are sect-dependent
// (the earlier note that alchemize used a "sect-invariant" table was wrong —
// verified: its ESMS shifts diurnal↔nocturnal, so a fixed date is required for
// determinism). The engines still DIVERGE because they apply different dignity
// scales (alchemize's local ±0.15 vs the canonical +10/+7). When alchemize
// delegates to the canonical path these two sets converge; update both golden
// values in that same commit.
const GOLDEN_REAL: Record<string, number> = {
  Spirit: 0.3055,
  Essence: 0.3892,
  Matter: 0.1899,
  Substance: 0.1153,
};
const GOLDEN_CANONICAL: Record<string, number> = {
  Spirit: 0.3188,
  Essence: 0.4993,
  Matter: 0.091,
  Substance: 0.091,
};
