/**
 * Mintable recipe validation — SERVER ONLY (used by the mint + quote routes).
 *
 * Any recipe a user generates can be minted, so the mint pipeline accepts an
 * arbitrary recipe payload and re-validates it server-side — the cost basis is
 * computed from the validated content, never trusted from the client.
 *
 * `mintableRecipeSchema` is the authoring `cosmicRecipeSchema` with the
 * AI-enriched cosmology fields relaxed to optional, so lab-book-INGESTED (scan)
 * recipes — which lack alignment/astro/finishing until a second enrichment pass —
 * validate through the same path as fully-generated ones.
 */

import { cosmicRecipeSchema } from "@/types/cosmicRecipeSchema";
import { QUANTITY_MAX, QUANTITY_MIN, rejectMintQuantity } from "./quantity";
import type { z } from "zod";

export type RecipeSource = "generated" | "scan" | "seeded" | "curated";

/** Cosmology/enrichment fields that ingested recipes may not have yet. */
export const mintableRecipeSchema = cosmicRecipeSchema.extend({
  alignment_score: cosmicRecipeSchema.shape.alignment_score.optional(),
  alignment_notes: cosmicRecipeSchema.shape.alignment_notes.optional(),
  astro_explanation: cosmicRecipeSchema.shape.astro_explanation.optional(),
  finishing_and_serving: cosmicRecipeSchema.shape.finishing_and_serving.optional(),
  leftovers_and_storage: cosmicRecipeSchema.shape.leftovers_and_storage.optional(),
  vitamins: cosmicRecipeSchema.shape.vitamins.optional(),
  minerals: cosmicRecipeSchema.shape.minerals.optional(),
});

export type MintableRecipe = z.infer<typeof mintableRecipeSchema>;

export interface RecipeProvenance {
  /** alchmKitchenUserId of the minter — also the on-chain creator/recipient. */
  creator: string;
  source: RecipeSource;
  /** For remix lineage (on-chain parentTokenId); null for an Original mint. */
  parentRecipeId: string | null;
  createdAt: string;
}

export interface ParseResult {
  ok: boolean;
  recipe?: MintableRecipe;
  /** True when the strict (fully-enriched) schema validated — i.e. cosmology present. */
  complete: boolean;
  error?: string;
}

/**
 * Mint-only structural checks that the AUTHORING schema deliberately does not make.
 *
 * `cosmicRecipeSchema` is the LLM structured-output contract; constraining it
 * would change what the generator is asked to produce. These rules therefore
 * live on the mint path only, and apply to BOTH the strict and relaxed parses.
 *
 * Each rule exists because it is a measured route to a degenerate mint cost —
 * the cost basis IS the ingredient mass, so anything that zeroes or overflows
 * the mass zeroes or corrupts the price:
 *
 *   • no ingredients      -> the fingerprint's reduce seed {0,0,0,0} is the
 *                            answer, so all four coins are 0. A free mint.
 *   • quantity ""         -> `Number("") === 0`, finite, so mass is 0. Same.
 *   • quantity "0" / "-5" -> mass <= 0, so the normalisation scale is 0. Same.
 *   • quantity 1e308      -> overflows to Infinity on the unit multiply, so
 *                            every coin becomes NaN and the debit is NaN.
 *   • quantity 1e-320     -> denormal; positive and finite, but the scale
 *                            `TARGET_ESMS / rawTotal` overflows to Infinity.
 *
 * A NON-NUMERIC quantity ("to taste") is intentionally still accepted — the
 * engine assigns it a nominal mass by design.
 */
function mintStructureError(recipe: MintableRecipe): string | null {
  if (recipe.ingredients.length === 0) {
    return "ingredients: a mintable recipe must list at least one ingredient";
  }

  for (const [i, ing] of recipe.ingredients.entries()) {
    const rejection = rejectMintQuantity(ing.quantity);
    if (!rejection) continue;

    const where = `ingredients.${i}.quantity`;
    const got = JSON.stringify(ing.quantity);
    switch (rejection) {
      case "not_positive":
        return `${where}: must be a positive amount (got ${got})`;
      case "too_small":
        return `${where}: is below the minimum mintable amount ${QUANTITY_MIN} (got ${got})`;
      case "too_large":
        return `${where}: exceeds the maximum mintable amount ${QUANTITY_MAX} (got ${got})`;
      default:
        return `${where}: is not a usable amount (got ${got})`;
    }
  }

  return null;
}

/**
 * Validate a posted recipe for minting. Prefers the strict schema (fully
 * cosmology-enriched, as generated recipes are); falls back to the relaxed
 * mintable schema so ingested recipes still validate. Returns a structured
 * result rather than throwing.
 *
 * Both parses are additionally subjected to `mintStructureError`, so a payload
 * cannot slip a degenerate cost basis through by satisfying the strict schema.
 */
export function parseRecipeForMint(input: unknown): ParseResult {
  const strict = cosmicRecipeSchema.safeParse(input);
  if (strict.success) {
    const structural = mintStructureError(strict.data);
    return structural
      ? { ok: false, complete: false, error: structural }
      : { ok: true, recipe: strict.data, complete: true };
  }

  const relaxed = mintableRecipeSchema.safeParse(input);
  if (relaxed.success) {
    const structural = mintStructureError(relaxed.data);
    return structural
      ? { ok: false, complete: false, error: structural }
      : { ok: true, recipe: relaxed.data, complete: false };
  }

  return {
    ok: false,
    complete: false,
    error: relaxed.error.issues
      .slice(0, 5)
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; "),
  };
}
