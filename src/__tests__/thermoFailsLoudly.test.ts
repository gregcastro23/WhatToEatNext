/**
 * The canonical engine refuses to invent physics — §18k k7.
 *
 * `src/utils/monicaKalchmCalculations.ts` used to export a second six-field
 * composite that fabricated twice over: a hardcoded
 * `{heat: 0.08, entropy: 0.15, reactivity: 0.45, gregsEnergy: -0.02,
 * kalchm: 2.5, monica: 1.0}` for a null argument, and per-field substitution
 * (`Spirit/Essence/Matter -> 4`, `Substance -> 2`, every element -> `0.25`) for
 * a missing or NaN value. A caller could not tell invented physics from
 * measured physics.
 *
 * It is deleted; every consumer now calls `performAlchemicalAnalysis`, which
 * throws. These tests pin BOTH halves of that contract — that it rejects
 * garbage, AND that it still accepts every legitimate value, because a
 * validator that rejects a real `0` would be a worse bug than the one it
 * replaced.
 */

import {
  calculateThermodynamics,
  performAlchemicalAnalysis,
  THERMO_DEN_FLOOR,
  thermoQuotient,
} from "@/data/unified/alchemicalCalculations";
import type { AlchemicalProperties } from "@/types/celestial";
import type { ElementalProperties } from "@/types/alchemy";

const ESMS = { Spirit: 4, Essence: 3, Matter: 2, Substance: 1 } as AlchemicalProperties;
const EL = { Fire: 0.3, Water: 0.25, Earth: 0.25, Air: 0.2 } as ElementalProperties;

/** The exact object the deleted engine invented for a null argument. */
const FABRICATED = {
  heat: 0.08,
  entropy: 0.15,
  reactivity: 0.45,
  gregsEnergy: -0.02,
  kalchm: 2.5,
  monica: 1.0,
};

describe("performAlchemicalAnalysis — the happy path still works (control)", () => {
  it("returns six finite fields for well-formed input", () => {
    const r = performAlchemicalAnalysis(ESMS, EL);
    for (const k of ["heat", "entropy", "reactivity", "gregsEnergy", "kalchm", "monica"] as const) {
      expect(typeof r[k]).toBe("number");
      expect(Number.isFinite(r[k])).toBe(true);
    }
  });

  it("never returns the fabricated object for real input", () => {
    // If this ever matches, the fabrication came back.
    expect(performAlchemicalAnalysis(ESMS, EL)).not.toEqual(FABRICATED);
  });
});

describe("it THROWS instead of fabricating", () => {
  it.each([
    ["null alchemical", null, EL],
    ["undefined alchemical", undefined, EL],
    ["null elemental", ESMS, null],
    ["undefined elemental", ESMS, undefined],
  ])("%s", (_label, a, e) => {
    expect(() =>
      performAlchemicalAnalysis(a as never, e as never),
    ).toThrow(TypeError);
  });

  it.each(["Spirit", "Essence", "Matter", "Substance"])(
    "rejects a missing %s axis (used to become 4 or 2)",
    (axis) => {
      const broken = { ...ESMS } as Record<string, unknown>;
      delete broken[axis];
      expect(() => performAlchemicalAnalysis(broken as never, EL)).toThrow(
        new RegExp(`alchemicalProps\\.${axis}`),
      );
    },
  );

  it.each(["Fire", "Water", "Earth", "Air"])(
    "rejects a missing %s element (used to become 0.25)",
    (element) => {
      const broken = { ...EL } as Record<string, unknown>;
      delete broken[element];
      expect(() => performAlchemicalAnalysis(ESMS, broken as never)).toThrow(
        new RegExp(`elementalProps\\.${element}`),
      );
    },
  );

  it("rejects NaN and Infinity, which the old typeof/isNaN guard let through", () => {
    // The old guard was `typeof x === "number" && !isNaN(x)` — that caught NaN
    // but ADMITTED Infinity, which then produced Infinity/Infinity = NaN
    // downstream and surfaced as a silent 0.
    expect(() => performAlchemicalAnalysis({ ...ESMS, Spirit: NaN } as never, EL)).toThrow();
    expect(() => performAlchemicalAnalysis({ ...ESMS, Spirit: Infinity } as never, EL)).toThrow();
    expect(() => performAlchemicalAnalysis(ESMS, { ...EL, Fire: -Infinity } as never)).toThrow();
  });

  it("names the caller and the offending field, not just 'invalid input'", () => {
    expect(() => performAlchemicalAnalysis({ ...ESMS, Matter: undefined } as never, EL)).toThrow(
      /performAlchemicalAnalysis: alchemicalProps\.Matter is undefined/,
    );
  });

  it("applies to calculateThermodynamics too, so /api/alchemize inherits it", () => {
    // The route wraps its body in try/catch and returns 500, which is the
    // intended failure mode: a loud error rather than invented physics.
    expect(() => calculateThermodynamics(null as never, EL)).toThrow(
      /calculateThermodynamics: alchemicalProps is null/,
    );
  });
});

describe("⚠️ it does NOT reject legitimate values", () => {
  it("accepts ZERO on every axis and every element", () => {
    // 0 is a real, meaningful value for all eight fields. A validator that
    // rejected it would be a worse regression than the fabrication it replaced
    // — e.g. restaurantScoring legitimately passes Matter:0, Substance:0.
    const zeroEsms = { Spirit: 0, Essence: 0, Matter: 0, Substance: 0 } as AlchemicalProperties;
    const zeroEl = { Fire: 0, Water: 0, Earth: 0, Air: 0 } as ElementalProperties;
    expect(() => performAlchemicalAnalysis(zeroEsms, zeroEl)).not.toThrow();
    expect(() => performAlchemicalAnalysis({ ...ESMS, Matter: 0, Substance: 0 } as never, EL)).not.toThrow();

    const r = performAlchemicalAnalysis(zeroEsms, zeroEl);
    expect(Number.isFinite(r.kalchm)).toBe(true);
    expect(Number.isFinite(r.monica)).toBe(true);
  });

  it("accepts negatives and raw (unnormalized, >1) elementals", () => {
    // Dignity scores can be negative; aggregated recipe elementals exceed 1.
    expect(() => performAlchemicalAnalysis({ ...ESMS, Spirit: -0.5 } as never, EL)).not.toThrow();
    expect(() =>
      performAlchemicalAnalysis(ESMS, { Fire: 1.4, Water: 0.6, Earth: 0.9, Air: 1.1 } as never),
    ).not.toThrow();
  });

  it("ignores extra keys", () => {
    expect(() =>
      performAlchemicalAnalysis({ ...ESMS, Aether: 9 } as never, { ...EL, Void: 3 } as never),
    ).not.toThrow();
  });
});

describe("the second engine's `den > 0 ? n/d : 0` pole is gone", () => {
  it("shares canonical's quotient, so a zero denominator is capped not zeroed", () => {
    // The old form returned 0 where the true limit is +Infinity — the opposite
    // direction from canonical, which caps at numerator / THERMO_DEN_FLOOR.
    expect(thermoQuotient(25, 0)).toBe(25 / THERMO_DEN_FLOOR);
    expect(thermoQuotient(25, 0)).not.toBe(0);
  });

  it("is exact for a positive denominator", () => {
    expect(thermoQuotient(25, 1e-6)).toBe(25000000);
    expect(thermoQuotient(25, 4)).toBe(6.25);
  });
});
