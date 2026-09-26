/**
 * Whether a recipe's computed nutrition accounts for the recipe (owner ruling
 * 2026-09-26). A total is published only when:
 *
 * - every resolved ingredient can be weighed. A unit with no gram weight
 *   ("large", "whole", "stalks") is unknown mass, not a 50 g guess;
 * - no unresolved ingredient is of unknown mass; and
 * - unresolved ingredients are at most 10% of the recipe's known mass.
 *
 * Otherwise the recipe publishes no computed value; the loader then uses the
 * dish's authored nutritionPerServing if it is plausible.
 *
 * [MEASURED 2026-09-26, 1,084 static recipes] The old rule published a total
 * once half the ingredient LINES resolved. 823 recipes published computed
 * nutrition; 193 of them were missing at least half of their known mass
 * (Pot-au-feu: 59 kcal a serving, its 1.5 kg of brisket unresolved). 405 used
 * the 50 g-per-piece guess, which over-counts as readily as it under-counts
 * (10 dried chilies scored 1,400 kcal).
 */

/** At most this share of a recipe's known mass may be unresolved. */
export const MAX_UNRESOLVED_MASS_SHARE = 0.1;

/** How one ingredient line entered the total. `grams: null` = unknown mass. */
export type WeighedLine =
  /** Resolved, weighed, and contributing to the total. */
  | { kind: "counted"; grams: number }
  /** Resolved to a 0 kcal profile (water, salt): its mass never matters. */
  | { kind: "zero"; grams: number | null }
  /** No catalog ingredient, or one without a nutritional profile. */
  | { kind: "unresolved"; grams: number | null }
  /** Resolved, but its unit has no gram weight. */
  | { kind: "unweighable" };

export function accountsForRecipe(lines: readonly WeighedLine[]): boolean {
  let knownGrams = 0;
  let unresolvedGrams = 0;
  for (const line of lines) {
    if (line.kind === "unweighable") return false;
    if (line.grams === null) {
      if (line.kind === "unresolved") return false;
      continue;
    }
    knownGrams += line.grams;
    if (line.kind === "unresolved") unresolvedGrams += line.grams;
  }
  return knownGrams > 0 && unresolvedGrams <= MAX_UNRESOLVED_MASS_SHARE * knownGrams;
}
