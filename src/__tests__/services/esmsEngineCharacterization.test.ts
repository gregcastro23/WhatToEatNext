/**
 * CHARACTERIZATION test for the unified live ESMS engine.
 *
 * `alchemize` must delegate its final ESMS vector to the same aspect-bearing,
 * dignity-sensitive, inertial-mass core as direct callers.
 */
import {
  alchemize,
  type StandardizedAlchemicalResult,
} from "@/services/RealAlchemizeService";
import { calculateAlchemicalFromPlanets } from "@/utils/planetaryAlchemyMapping";
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

describe("unified ESMS engine characterization", () => {
  it("both engines produce a four-axis ESMS result for the same chart", () => {
    const real: StandardizedAlchemicalResult = alchemize(
      POSITIONS,
      null,
      FIXED_DATE,
    );
    const canonical = calculateAlchemicalFromPlanets(POSITIONS, true);

    for (const axis of ["Spirit", "Essence", "Matter", "Substance"] as const) {
      expect(typeof real.esms[axis]).toBe("number");
      expect(typeof canonical[axis]).toBe("number");
      expect(Number.isFinite(real.esms[axis])).toBe(true);
      expect(Number.isFinite(canonical[axis])).toBe(true);
    }
  });

  it("the production adapter and direct engine agree on ESMS proportions", () => {
    const real = proportions(alchemize(POSITIONS, null, FIXED_DATE).esms);
    const canonical = proportions(
      calculateAlchemicalFromPlanets(POSITIONS, true),
    );
    expect(real).toEqual(canonical);
  });

  it("pins the production (alchemize) ESMS proportions [GOLDEN]", () => {
    const real = proportions(alchemize(POSITIONS, null, FIXED_DATE).esms);
    expect(real).toEqual(GOLDEN_UNIFIED);
  });

  it("pins the canonical (planetaryAlchemyMapping) ESMS proportions [GOLDEN]", () => {
    const canonical = proportions(
      calculateAlchemicalFromPlanets(POSITIONS, true),
    );
    expect(canonical).toEqual(GOLDEN_UNIFIED);
  });
});

// GOLDEN — one result from the canonical aspect-bearing engine at FIXED_DATE.
const GOLDEN_UNIFIED: Record<string, number> = {
  Spirit: 0.426,
  Essence: 0.2828,
  Matter: 0.2096,
  Substance: 0.0815,
};
