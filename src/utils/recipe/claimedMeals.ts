/**
 * The meals a cuisine dish claims (owner ruling 2026-09-25).
 *
 * A dish is filed under a meal bucket (`dishes.<meal>.<season>`), which places
 * it in the cuisine and names its static id. Most dishes also classify
 * themselves in `classifications.mealType`, meals mixed with tags such as
 * "stew" or "street food". The classification is the dish's own claim, so it
 * wins over the bucket.
 *
 * [MEASURED 2026-09-25, 582 hand-authored recipes] The classification names a
 * meal the bucket does not for 78: 26 desserts filed under dinner (Tiramisù,
 * Baklava, Key Lime Pie) and 8 breakfasts (Shakshuka, Blini). It adds meals to
 * the bucket's for 169, mostly lunch + dinner on savory dishes. It names no
 * meal for 37 (["soup"], ["appetizer"]), and those keep their bucket.
 *
 * The bucket's meal leads when the dish still claims it, so a page's single
 * recipeCategory changes only where the dish no longer claims its bucket.
 */
const MEALS: readonly string[] = ["breakfast", "lunch", "dinner", "dessert"];

function classificationOf(dish: Record<string, unknown>): unknown {
  const { classifications } = dish;
  return typeof classifications === "object" && classifications !== null && "mealType" in classifications
    ? classifications.mealType
    : undefined;
}

/** The four meals the classification names, in its order, without repeats. */
function namedMeals(classification: unknown): string[] {
  if (!Array.isArray(classification)) return [];
  const named = classification
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim().toLowerCase())
    .filter((value) => MEALS.includes(value));
  return [...new Set(named)];
}

export function claimedMeals(dish: Record<string, unknown>, bucket: string): string[] {
  const meals = namedMeals(classificationOf(dish));
  if (meals.length === 0) return [bucket];
  return meals.includes(bucket) ? [bucket, ...meals.filter((meal) => meal !== bucket)] : meals;
}
