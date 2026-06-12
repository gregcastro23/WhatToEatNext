/**
 * Alchemical method profiles — the Molecular Alchemy content layer.
 *
 * Curated editorial/scientific content per cooking method (epithets,
 * governing equations, molecular interactions, planetary rulership notes)
 * rendered by the /cooking-methods surfaces. Keys match the snake_case
 * method ids of `allCookingMethods` (src/data/cooking/methods).
 *
 * Live numbers (ESMS, Monica, P=IV kinetics, elemental percentages) are
 * NOT stored here — they come from the method data files and the runtime
 * engine (src/utils/methodAlchemicalSnapshot.ts).
 */
import type { AlchemicalMethodProfile } from "@/types/cookingMethod";
import { dryMethodProfiles } from "./dry";
import { molecularMethodProfiles } from "./molecular";
import { rawMethodProfiles } from "./raw";
import { traditionalMethodProfiles } from "./traditional";
import { transformationMethodProfiles } from "./transformation";
import { wetMethodProfiles } from "./wet";

export const ALCHEMICAL_METHOD_PROFILES: Record<string, AlchemicalMethodProfile> = {
  ...dryMethodProfiles,
  ...wetMethodProfiles,
  ...molecularMethodProfiles,
  ...traditionalMethodProfiles,
  ...transformationMethodProfiles,
  ...rawMethodProfiles,
};

/** Canonical method key from a URL slug ("stir-frying" → "stir_frying"). */
export function normalizeMethodKey(slug: string): string {
  return slug.toLowerCase().replace(/[\s-]+/g, "_");
}

export function getAlchemicalProfile(
  methodKey: string,
): AlchemicalMethodProfile | undefined {
  return ALCHEMICAL_METHOD_PROFILES[normalizeMethodKey(methodKey)];
}
