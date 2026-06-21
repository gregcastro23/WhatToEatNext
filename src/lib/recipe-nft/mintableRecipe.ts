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
 * Validate a posted recipe for minting. Prefers the strict schema (fully
 * cosmology-enriched, as generated recipes are); falls back to the relaxed
 * mintable schema so ingested recipes still validate. Returns a structured
 * result rather than throwing.
 */
export function parseRecipeForMint(input: unknown): ParseResult {
  const strict = cosmicRecipeSchema.safeParse(input);
  if (strict.success) return { ok: true, recipe: strict.data, complete: true };

  const relaxed = mintableRecipeSchema.safeParse(input);
  if (relaxed.success) return { ok: true, recipe: relaxed.data, complete: false };

  return {
    ok: false,
    complete: false,
    error: relaxed.error.issues
      .slice(0, 5)
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; "),
  };
}
