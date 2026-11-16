/**
 * The gas-holding network, in grams of gluten-equivalent.
 *
 * Gluten holds gas because it forms a continuous viscoelastic film; egg
 * protein holds it once it sets; xanthan and psyllium are what gluten-free
 * baking uses instead. To compare them on one axis the lab expresses each as
 * the gluten it replaces — DECLARED equivalences, DERIVED from formulation
 * practice rather than measured rheology:
 *
 *   bread flour carries 12.0 × 0.8 = 9.6 g gluten-forming protein per 100 g;
 *   gluten-free practice replaces it with ~1.5 % xanthan (0.5–2 %) or ~6 %
 *   psyllium (4–8 %) of the flour weight, so
 *   1 g xanthan ≈ 9.6 / 1.5 = 6.4 g and 1 g psyllium ≈ 9.6 / 6 = 1.6 g.
 *
 * @file src/lib/baking/network.ts
 */
import type { ResolvedLine } from "./telemetryParts";
import type { BakingIngredient } from "./types";

const BREAD_FLOUR_GLUTEN_PER_100G = 12.0 * 0.8;

/** Gluten-equivalent per gram of hydrocolloid, with the practice dose it was derived from. */
export const HYDROCOLLOID_EQUIVALENCE: Readonly<Record<string, { practicePctOfFlour: number; gramsPerGram: number }>> = {
  "xanthan-gum": { practicePctOfFlour: 1.5, gramsPerGram: BREAD_FLOUR_GLUTEN_PER_100G / 1.5 },
  "psyllium-husk": { practicePctOfFlour: 6, gramsPerGram: BREAD_FLOUR_GLUTEN_PER_100G / 6 },
};

/** Gluten-equivalent network per gram of an ingredient. */
export function networkPerGram(i: BakingIngredient): number {
  const protein = i.proteinPct / 100;
  const gluten = protein * i.glutenPotency;
  const setting = i.glutenPotency === 0 && i.coagulationTempC !== null ? protein : 0;
  const colloid = HYDROCOLLOID_EQUIVALENCE[i.id]?.gramsPerGram ?? 0;
  return gluten + setting + colloid;
}

export function networkGrams(lines: readonly ResolvedLine[]): number {
  return lines.reduce((sum, { ingredient, grams }) => sum + grams * networkPerGram(ingredient), 0);
}
