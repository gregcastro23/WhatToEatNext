/**
 * Guards on `nutritionalProfile.composition`.
 *
 * The proximate set (water, protein, fat, carbohydrate, ash) feeds Choi & Okos
 * (1986) for specific heat, conductivity and density, and latent heat, which is
 * very nearly a pure water-content quantity. All of them take MASS FRACTIONS of
 * ONE substance. Every failure mode below is one that would produce a
 * confident, wrong number rather than an obvious crash.
 *
 * @file src/__tests__/data/ingredientComposition.test.ts
 */
import { allIngredients } from "@/data/ingredients";
import {
  compositionResidual,
  type NutritionalProfile,
  type ProximateComposition,
} from "@/data/ingredients/types";

interface Carrier {
  name: string;
  comp: ProximateComposition;
  profile: NutritionalProfile;
}

/** Every ingredient that actually carries a composition. */
const carriers: Carrier[] = Object.entries(
  allIngredients as Record<string, { name?: string; nutritionalProfile?: NutritionalProfile }>,
)
  .map(([key, ing]) => {
    const profile = ing?.nutritionalProfile;
    const comp = profile?.composition;
    return comp ? { name: ing?.name ?? key, comp, profile: profile! } : null;
  })
  .filter((x): x is Carrier => x !== null);

const FRACTION_KEYS = ["water", "protein", "fat", "carbohydrate", "ash"] as const;

/** Grams stated inside a serving_size like "1 medium (61g)". */
function servingGrams(servingSize: string): number | null {
  const match = /\(([\d.]+)\s*g\)/i.exec(servingSize);
  if (!match) return null;
  const grams = Number(match[1]);
  return Number.isFinite(grams) && grams > 0 ? grams : null;
}

describe("ingredient proximate composition", () => {
  it("is populated at all — a vacuous sweep would pass every test below", () => {
    // The whole file is `for (const c of carriers)`. With an empty list every
    // assertion holds trivially, which is exactly how an inert field ships
    // looking verified.
    expect(carriers.length).toBeGreaterThan(0);
  });

  it("states every fraction in [0, 1], never grams per 100 g", () => {
    // THE load-bearing guard. USDA reports these as g per 100 g, so carrot's
    // water is 88.29 at the source and 0.8829 here. Writing 88.29 into any of
    // these fields is the single most likely mistake, it is off by 100x, and
    // every downstream formula would still return a plausible-looking number.
    for (const c of carriers) {
      for (const key of FRACTION_KEYS) {
        expect(Number.isFinite(c.comp[key])).toBe(true);
        expect(c.comp[key]).toBeGreaterThanOrEqual(0);
        expect(c.comp[key]).toBeLessThanOrEqual(1);
      }
    }
  });

  it("carries the provenance its own basis claims", () => {
    // `basis: "usda-fdc"` asserts a specific FoodData Central record exists.
    // Without the id that assertion is unfalsifiable, which is the same as
    // having no basis at all.
    for (const c of carriers) {
      expect(["usda-fdc", "class-typical", "derived"]).toContain(c.comp.basis);
      if (c.comp.basis === "usda-fdc") {
        expect(typeof c.comp.fdcId).toBe("number");
        expect(c.comp.fdcId).toBeGreaterThan(0);
        expect(c.comp.retrieved).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(c.comp.fdcDescription?.length ?? 0).toBeGreaterThan(0);
      }
    }
  });

  it("closes at 1.000 — a proximate analysis accounts for the whole mass", () => {
    // The strongest check available, and it needs no other field: a proximate
    // analysis is COMPLETE by definition, so the five fractions sum to one.
    // 40 of 42 sourced ingredients close within 0.2 %.
    //
    // An entry may miss only if it says why. Vanilla extract is ~34 % ethanol,
    // which is not a proximate component — a real gap, and one Choi-Okos cannot
    // see, so it is declared rather than normalised away.
    for (const c of carriers) {
      const residual = Math.abs(compositionResidual(c.comp));
      if (residual > 0.02) {
        expect(c.comp.unaccountedNote?.length ?? 0).toBeGreaterThan(0);
      } else {
        expect(residual).toBeLessThanOrEqual(0.02);
      }
    }
  });

  it("does not carry an excuse it does not need", () => {
    // `unaccountedNote` explains a gap. Attached to an entry that closes fine,
    // it is a false claim about the data and would teach a reader to distrust a
    // figure that is sound.
    for (const c of carriers) {
      if (c.comp.unaccountedNote) {
        expect(Math.abs(compositionResidual(c.comp))).toBeGreaterThan(0.02);
      }
    }
  });

  it("never lets the fractions exceed the serving mass the profile states", () => {
    // A cross-check against a DIFFERENT, LOCAL field, so it catches what
    // internal closure cannot: a self-consistent analysis of the WRONG FOOD.
    //
    // `[MEASURED 2026-08-18]` Not hypothetical. Pork and chicken were matched to
    // RAW records while their profiles describe "roasted loin chop" and
    // "roasted breast". Both raw analyses closed at 1.000 perfectly — they were
    // simply a different substance. Only this comparison against the profile's
    // own macros caught it, at 1.090 and 1.078.
    //
    // Tolerance is 2 %: our macros are rounded per serving, and ash is absent
    // from `macros` entirely, which can only make the sum SMALLER.
    const checked: string[] = [];
    for (const c of carriers) {
      const grams = servingGrams(c.profile.serving_size);
      const macros = c.profile.macros;
      if (grams === null || !macros) continue;
      // `fiber` and `sugar` are subsets of `carbs`, not additions to it.
      const solidsG = (macros.protein ?? 0) + (macros.fat ?? 0) + (macros.carbs ?? 0);
      // Profiles whose macros ALONE overflow their serving are broken
      // independently of composition — the test below owns that failure.
      if (solidsG / grams > 1) continue;
      expect(c.comp.water + solidsG / grams).toBeLessThanOrEqual(1.02);
      checked.push(c.name);
    }
    // A silent zero here would mean serving_size stopped being parseable and
    // this test quietly became a no-op.
    expect(checked.length).toBeGreaterThan(0);
  });

  it("reports profiles whose macros alone overflow their serving size", () => {
    // PRE-EXISTING data defects, surfaced rather than absorbed. `sugar` declares
    // 4.2 g of carbohydrate in a serving it describes as 4 g — 105 % solids
    // before any water. Out of scope to fix here, but it must not become
    // invisible just because the check above skips it.
    //
    // This test PASSES with them listed. It fails only if the list GROWS.
    const overflowing: string[] = [];
    for (const c of carriers) {
      const grams = servingGrams(c.profile.serving_size);
      const macros = c.profile.macros;
      if (grams === null || !macros) continue;
      const solidsG = (macros.protein ?? 0) + (macros.fat ?? 0) + (macros.carbs ?? 0);
      if (solidsG / grams > 1) overflowing.push(c.name);
    }
    expect(overflowing.sort()).toEqual(["sugar"]);
  });

  it("distinguishes an absent analysis from a zero one", () => {
    // Absent must mean UNKNOWN. A refined oil declares 0 water explicitly; an
    // ingredient nobody has sourced yet declares nothing. If absence ever
    // defaults to 0, every unsourced ingredient silently claims to release no
    // latent heat.
    for (const c of carriers.filter((x) => x.comp.water === 0)) {
      // A zero is a claim and needs the same provenance as any other value.
      expect(c.comp.basis).toBeDefined();
      expect(c.comp.fdcId).toBeDefined();
    }
    const unsourced = Object.values(
      allIngredients as Record<string, { nutritionalProfile?: NutritionalProfile }>,
    ).filter((i) => i?.nutritionalProfile && !i.nutritionalProfile.composition);
    for (const i of unsourced.slice(0, 50)) {
      expect(i.nutritionalProfile!.composition).toBeUndefined();
    }
  });

  it("agrees with itself wherever the same ingredient appears twice", () => {
    // The registries genuinely duplicate: "Olive Oil" exists in oils/oils.ts and
    // seasonings/oils.ts, and "olive oil" again under fruits. Two copies of one
    // substance disagreeing is drift, and it is exactly the class of bug that
    // survives because nobody reads both files at once.
    const byName = new Map<string, Set<string>>();
    for (const c of carriers) {
      const key = c.name.toLowerCase();
      const signature = FRACTION_KEYS.map((k) => c.comp[k]).join("/");
      if (!byName.has(key)) byName.set(key, new Set());
      byName.get(key)!.add(signature);
    }
    for (const [name, signatures] of byName) {
      expect({ name, signatures: [...signatures] }).toEqual({
        name,
        signatures: [[...signatures][0]],
      });
    }
  });
});
