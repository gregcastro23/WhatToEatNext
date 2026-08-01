/**
 * Strategy A pins: cuisine ESMS is a mass-weighted multi-ruler sum.
 *
 * The old derivation was a one-hot unit vector from a single planetary ruler,
 * which pinned every cuisine to the {0,1}⁴ binary lattice where kalchm ≡ 1 —
 * monica was the same constant for all 30 cuisine×sect states, and three
 * Mars-ruled cuisines (Indian, Korean, Mexican) shared one identical ESMS.
 * These pins keep the replacement honest:
 *
 * 1. Coverage — every scoring key resolves to rulers (the derivation throws
 *    loudly instead of fabricating; this suite green-gates that throw).
 * 2. Round-trip — the sum re-derives from its named inputs.
 * 3. Lattice escape — kalchm ≠ 1 for every real cuisine, both sects.
 * 4. Discriminant — pairwise-distinct ESMS across all real cuisines.
 */
import {
  CUISINE_ELEMENTAL_MAP,
  deriveCuisineAlchemical,
} from "@/services/restaurantScoring";
import { culinaryTraditions } from "@/data/cuisines/culinaryTraditions";
import {
  PLANETARY_SECTARIAN_ALCHEMICAL,
  inertialMassWeight,
} from "@/utils/planetaryAlchemyMapping";
import { calculateKalchm } from "@/data/unified/alchemicalCalculations";

const REAL_CUISINES = Object.keys(CUISINE_ELEMENTAL_MAP).filter(
  (k) => k !== "Default",
);
const COINS = ["Spirit", "Essence", "Matter", "Substance"] as const;

describe("cuisine ESMS Strategy A", () => {
  it("every scoring key resolves to rulers and derives finite ESMS, both sects", () => {
    for (const key of Object.keys(CUISINE_ELEMENTAL_MAP)) {
      for (const diurnal of [true, false]) {
        const esms = deriveCuisineAlchemical(key, diurnal);
        for (const coin of COINS) {
          expect(Number.isFinite(esms[coin])).toBe(true);
          expect(esms[coin]).toBeGreaterThanOrEqual(0);
        }
        // A ruler set that contributed nothing would be a silent absence.
        expect(COINS.reduce((s, c) => s + esms[c], 0)).toBeGreaterThan(0);
      }
    }
  });

  it("round-trips from culinaryTraditions × inertialMassWeight × sect table", () => {
    for (const key of ["Indian", "Japanese", "Spanish"]) {
      const rulers = culinaryTraditions[
        key.toLowerCase()
      ].astrologicalProfile.rulingPlanets.map(
        (p) => p.charAt(0).toUpperCase() + p.slice(1),
      );
      for (const diurnal of [true, false]) {
        const expected = { Spirit: 0, Essence: 0, Matter: 0, Substance: 0 };
        for (const ruler of rulers) {
          const sectRow =
            PLANETARY_SECTARIAN_ALCHEMICAL[
              ruler as keyof typeof PLANETARY_SECTARIAN_ALCHEMICAL
            ][diurnal ? "diurnal" : "nocturnal"];
          const w = inertialMassWeight(ruler);
          for (const coin of COINS) expected[coin] += sectRow[coin] * w;
        }
        expect(deriveCuisineAlchemical(key, diurnal)).toEqual(expected);
      }
    }
  });

  it("escapes the binary lattice: kalchm ≠ 1 for every real cuisine, both sects", () => {
    // THE point of Strategy A. On the old one-hot vectors kalchm was
    // identically 1 (x·ln x is zero at both 0 and 1), so monica collapsed to
    // one constant across all cuisines.
    for (const key of REAL_CUISINES) {
      for (const diurnal of [true, false]) {
        const k = calculateKalchm(deriveCuisineAlchemical(key, diurnal));
        expect(Number.isFinite(k)).toBe(true);
        expect(Math.abs(Math.log(k))).toBeGreaterThan(1e-6);
      }
    }
    // POSITIVE CONTROL — the detector still sees the lattice: a one-hot
    // integer vector really does give kalchm exactly 1.
    expect(
      calculateKalchm({ Spirit: 1, Essence: 0, Matter: 0, Substance: 0 }),
    ).toBe(1);
  });

  it("Default alone stays the neutral Sun anchor (documented ABSENT sentinel)", () => {
    // Sun's inertial weight is exactly 1.0 (the scale's anchor), so Default
    // is a one-hot {Spirit: 1} in both sects — deliberately: it is the
    // honest-absence row for unknown cuisines, not a cuisine.
    for (const diurnal of [true, false]) {
      expect(deriveCuisineAlchemical("Default", diurnal)).toEqual({
        Spirit: 1,
        Essence: 0,
        Matter: 0,
        Substance: 0,
      });
    }
  });

  it("is a discriminant: pairwise-distinct ESMS across real cuisines at fixed sect", () => {
    // Old behavior: Indian, Korean and Mexican (all Mars one-hots) were
    // byte-identical. Distinct ruler SETS now guarantee distinct sums.
    for (const diurnal of [true, false]) {
      const seen = new Map<string, string>();
      for (const key of REAL_CUISINES) {
        const esms = deriveCuisineAlchemical(key, diurnal);
        const sig = COINS.map((c) => esms[c].toFixed(15)).join("|");
        expect(seen.has(sig)).toBe(false);
        seen.set(sig, key);
      }
    }
  });

  it("sect matters for cuisines with sect-flipping rulers", () => {
    // Moon contributes Essence by day, Matter by night — Japanese
    // [moon, mercury] must therefore differ across sects.
    const day = deriveCuisineAlchemical("Japanese", true);
    const night = deriveCuisineAlchemical("Japanese", false);
    expect(day).not.toEqual(night);
  });

  it("the four RULED tradition entries hold the file's own invariants", () => {
    for (const key of ["american", "greek", "spanish", "ethiopian"]) {
      const entry = culinaryTraditions[key];
      expect(entry).toBeDefined();
      const sum = Object.values(entry.elementalAlignment).reduce(
        (a, b) => a + b,
        0,
      );
      expect(Math.abs(sum - 1.0)).toBeLessThan(0.001);
      expect(entry.astrologicalProfile.favorableZodiac).toHaveLength(3);
      for (const p of entry.astrologicalProfile.rulingPlanets) {
        const cap = p.charAt(0).toUpperCase() + p.slice(1);
        expect(PLANETARY_SECTARIAN_ALCHEMICAL).toHaveProperty(cap);
      }
    }
    // No two entries in the WHOLE file may share a ruler list — a shared set
    // is a shared ESMS profile, the Indian≡Korean conflation reborn.
    const sets = Object.entries(culinaryTraditions).map(([k, v]) => [
      k,
      [...v.astrologicalProfile.rulingPlanets].sort().join(","),
    ]);
    const bySet = new Map<string, string>();
    for (const [k, set] of sets) {
      expect(bySet.has(set)).toBe(false);
      bySet.set(set, k);
    }
  });
});
