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
 * This predicate flags those non-real entries so the browse surfaces (and the
 * dashboard ingredient-recommendations route) can hide them while the catalog
 * keeps them for mapping. Coverage entries that were given a real description
 * via `coverageCurationOverrides.ts` are NOT flagged.
 *
 * Two markers are recognised:
 *  - the boilerplate copy emitted by `generatedDescription()` in the generator
 *    script (keep the two in sync if that copy ever changes); and
 *  - explicit "schema stand-in" placeholders (e.g. "alchemical binding agent"),
 *    which name no real food and exist only as recipe-schema slots.
 */
const BOILERPLATE_DESCRIPTION_MARKER =
  "recipe-linked ingredient captured from live cuisine data";
const SCHEMA_STANDIN_MARKER = "Schema stand-in";

/**
 * True when `ingredient` is an auto-generated coverage entry that is not a real
 * food — either it still carries the boilerplate description or it is an
 * explicit schema stand-in. Works on both the full `Ingredient` shape and the
 * `UnifiedIngredient` shape (both surface `description` at the top level).
 */
export function isBoilerplateCoverageIngredient(
  ingredient: { description?: unknown } | null | undefined,
): boolean {
  const description = ingredient?.description;
  return (
    typeof description === "string" &&
    (description.includes(BOILERPLATE_DESCRIPTION_MARKER) ||
      description.includes(SCHEMA_STANDIN_MARKER))
  );
}
