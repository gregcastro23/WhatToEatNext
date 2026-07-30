/**
 * The mint cost basis IS the ingredient mass — so anything that zeroes or
 * overflows the mass zeroes or corrupts the price.
 *
 * Every case below was MEASURED reachable through a schema-valid payload on
 * `origin/master` @ cfed12a8 before this fix: `cosmicRecipeSchema` puts no
 * `.min(1)` on `ingredients` and no format on `quantity`, and
 * `computeRecipeFingerprint` turned a zero/overflowed mass into all-zero or
 * NaN coins instead of failing. `baseMintCost` passes those coins straight to
 * `purchaseShopItem({ overrideCosts })`, i.e. a free (or NaN) mint.
 *
 * Two layers are pinned here, deliberately:
 *   1. the VALIDATOR (`parseRecipeForMint`) rejects the payload, and
 *   2. the ENGINE (`computeRecipeFingerprint`) throws even if the validator is
 *      bypassed — so the two drifting apart is loud, not free.
 *
 * ⚠️ If a test here fails, do not relax the bound to match. The bound is the
 * price floor.
 */

import { featuredRecipe, type CosmicRecipe } from "@/data/featuredRecipe";
import { computeRecipeFingerprint, TARGET_ESMS } from "@/lib/recipe-nft/fingerprint";
import { parseRecipeForMint } from "@/lib/recipe-nft/mintableRecipe";
import { QUANTITY_MAX, QUANTITY_MIN, parseAmount, rejectMintQuantity } from "@/lib/recipe-nft/quantity";

/** The shipped fixture with its ingredient list swapped. */
function withIngredients(ingredients: CosmicRecipe["ingredients"]): CosmicRecipe {
  return { ...featuredRecipe, ingredients };
}

/** One well-formed ingredient, quantity overridden. */
function oneIngredient(quantity: string, unit = "g"): CosmicRecipe["ingredients"] {
  return [
    {
      name: "whole milk",
      quantity,
      unit,
      optional: false,
      substitutions: [],
    },
  ];
}

describe("the shipped fixture is healthy (control)", () => {
  it("validates and prices at TARGET_ESMS — proving these probes can pass", () => {
    const parsed = parseRecipeForMint(featuredRecipe);
    expect(parsed.ok).toBe(true);
    expect(parsed.complete).toBe(true);

    const fp = computeRecipeFingerprint(featuredRecipe);
    // aSharp is the four-coin sum, normalized to the economy target.
    expect(fp.aSharp).toBeCloseTo(TARGET_ESMS, 1);
    for (const coin of [fp.totals.spirit, fp.totals.essence, fp.totals.matter, fp.totals.substance]) {
      expect(Number.isFinite(coin)).toBe(true);
      expect(coin).toBeGreaterThan(0);
    }
  });
});

describe("parseAmount — the behaviour the bounds exist for", () => {
  it('parses "" to a legitimate-looking finite 0, NOT NaN', () => {
    // This is the whole reason `QUANTITY_MIN` cannot be expressed as an
    // isFinite check. If this ever becomes NaN, the empty-string case is
    // handled upstream and this suite's `""` test is testing nothing.
    expect(parseAmount("")).toBe(0);
    expect(Number.isFinite(parseAmount(""))).toBe(true);
  });

  it("returns NaN for genuinely non-numeric amounts", () => {
    expect(Number.isNaN(parseAmount("to taste"))).toBe(true);
    expect(Number.isNaN(parseAmount("a splash"))).toBe(true);
  });

  it("still handles mixed numbers and fractions", () => {
    expect(parseAmount("1 1/2")).toBe(1.5);
    expect(parseAmount("3/4")).toBe(0.75);
    expect(parseAmount("250")).toBe(250);
  });
});

describe("rejectMintQuantity", () => {
  it.each([
    ["", "not_positive"],
    ["0", "not_positive"],
    ["0.0", "not_positive"],
    ["-100", "not_positive"],
    ["1e-320", "too_small"],
    ["1e308", "too_large"],
  ])("rejects %p as %s", (quantity, reason) => {
    expect(rejectMintQuantity(quantity as string)).toBe(reason);
  });

  it.each(["250", "1 1/2", "3/4", "0.5", "to taste", "a pinch"])(
    "accepts %p",
    (quantity) => {
      expect(rejectMintQuantity(quantity)).toBeNull();
    },
  );

  it("accepts values exactly at both bounds", () => {
    expect(rejectMintQuantity(String(QUANTITY_MIN))).toBeNull();
    expect(rejectMintQuantity(String(QUANTITY_MAX))).toBeNull();
  });
});

describe("parseRecipeForMint rejects every measured zero-cost payload", () => {
  it("rejects a recipe with no ingredients", () => {
    const parsed = parseRecipeForMint(withIngredients([]));
    expect(parsed.ok).toBe(false);
    expect(parsed.error).toMatch(/at least one ingredient/);
  });

  it.each([
    ["empty quantity string", ""],
    ["explicit zero", "0"],
    ["negative quantity", "-100"],
    ["denormal quantity", "1e-320"],
    ["overflowing quantity", "1e308"],
  ])("rejects %s", (_label, quantity) => {
    const parsed = parseRecipeForMint(withIngredients(oneIngredient(quantity)));
    expect(parsed.ok).toBe(false);
    expect(parsed.recipe).toBeUndefined();
    expect(parsed.error).toMatch(/ingredients\.0\.quantity/);
  });

  it("rejects a bad quantity anywhere in the list, not just the first", () => {
    const parsed = parseRecipeForMint(
      withIngredients([...oneIngredient("250"), ...oneIngredient("0")]),
    );
    expect(parsed.ok).toBe(false);
    expect(parsed.error).toMatch(/ingredients\.1\.quantity/);
  });

  it("STILL ACCEPTS a non-numeric quantity — that is a supported input", () => {
    // "to taste" resolves to a nominal mass by design. Rejecting it would be a
    // regression, not extra safety.
    const parsed = parseRecipeForMint(withIngredients(oneIngredient("to taste", "")));
    expect(parsed.ok).toBe(true);
  });

  it("applies to the RELAXED schema too, not just the strict one", () => {
    // Drop a cosmology field so the strict parse fails and the relaxed one runs.
    const relaxed = { ...withIngredients(oneIngredient("0")) } as Record<string, unknown>;
    delete relaxed.astro_explanation;
    delete relaxed.alignment_score;

    const parsed = parseRecipeForMint(relaxed);
    expect(parsed.ok).toBe(false);
    expect(parsed.error).toMatch(/ingredients\.0\.quantity/);

    // Control: the same relaxed shape with a good quantity DOES validate,
    // proving the rejection above came from the quantity and not the deletions.
    const control = { ...relaxed, ingredients: oneIngredient("250") };
    const ok = parseRecipeForMint(control);
    expect(ok.ok).toBe(true);
    expect(ok.complete).toBe(false);
  });
});

describe("computeRecipeFingerprint fails loudly when the validator is bypassed", () => {
  // These call the engine DIRECTLY with payloads `parseRecipeForMint` would
  // reject, which is what a future caller that forgets to validate looks like.
  it("throws rather than emitting an all-zero cost basis", () => {
    expect(() => computeRecipeFingerprint(withIngredients([]))).toThrow(
      /no usable ingredient mass/,
    );
    expect(() => computeRecipeFingerprint(withIngredients(oneIngredient("0")))).toThrow(
      /no usable ingredient mass/,
    );
    expect(() => computeRecipeFingerprint(withIngredients(oneIngredient("-100")))).toThrow(
      /no usable ingredient mass/,
    );
  });

  it("throws rather than emitting a non-finite cost basis", () => {
    // 1e308 kg overflows on the unit multiply; 1e-320 g makes normScale overflow.
    expect(() =>
      computeRecipeFingerprint(withIngredients(oneIngredient("1e308", "kg"))),
    ).toThrow(/no usable ingredient mass|non-finite/);
    expect(() =>
      computeRecipeFingerprint(withIngredients(oneIngredient("1e-320", "g"))),
    ).toThrow(/no usable ingredient mass|non-finite/);
  });

  it("never returns a zero or NaN coin for any input it does accept", () => {
    // Sweep the accepted quantity range; every survivor must be priceable.
    for (const q of ["1e-6", "0.5", "1", "250", "1000", "1e6"]) {
      const fp = computeRecipeFingerprint(withIngredients(oneIngredient(q)));
      const coins = [fp.totals.spirit, fp.totals.essence, fp.totals.matter, fp.totals.substance];
      for (const c of coins) expect(Number.isFinite(c)).toBe(true);
      expect(fp.aSharp).toBeCloseTo(TARGET_ESMS, 1);
    }
  });
});
