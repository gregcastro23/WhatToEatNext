/**
 * Quality gate for auto-generated "recipe coverage" ingredients.
 *
 * `scripts/generateRecipeCoverageIngredients.ts` emits ~427 entries (all flagged
 * `provenance: "generated"`) so that every ingredient name referenced by a recipe
 * resolves to a catalog entry for mapping/search. Most of those entries carry
 * identical boilerplate copy and placeholder nutrition (100 cal / 1g / 10g / 1g) —
 * fine for recipe-to-ingredient mapping, but they pollute user-facing *browse*
 * surfaces (the home Ingredient Recommender and `/ingredients`) where they appear
 * indistinguishable from curated entries.
 *
 * This predicate flags those boilerplate entries so the browse surfaces can hide
 * them while the catalog keeps them for mapping. Coverage entries that were given
 * a real description via `coverageCurationOverrides.ts` are NOT flagged.
 *
 * The marker phrase is the exact copy emitted by `generatedDescription()` in the
 * generator script; keep the two in sync if that copy ever changes.
 */
const BOILERPLATE_DESCRIPTION_MARKER =
  "recipe-linked ingredient captured from live cuisine data";

/**
 * True when `ingredient` is an auto-generated coverage entry that still carries
 * the boilerplate description. Works on both the full `Ingredient` shape and the
 * `UnifiedIngredient` shape (both surface `description` at the top level).
 */
export function isBoilerplateCoverageIngredient(
  ingredient: { description?: unknown } | null | undefined,
): boolean {
  const description = ingredient?.description;
  return (
    typeof description === "string" &&
    description.includes(BOILERPLATE_DESCRIPTION_MARKER)
  );
}
