/**
 * Where an HSCA archive recipe is filed, and which meals it can claim.
 *
 * The archive's source (recipes_database.json) gives each recipe categories,
 * not meals, so scripts/generateHscaCuisine.ts derives the meal from them.
 * The `bucket` places the recipe in the cuisine's meal × season tree, and its
 * static id carries it (hsca-lunch-all-tomato-sauce), so it never changes.
 * `meals` is what the recipe claims: its page, its JSON-LD recipeCategory,
 * and search's meal filter read it. It holds only meals the source supports.
 *
 * [MEASURED 2026-09-25, 533 source recipes] Buckets: breakfast 58, dessert
 * 134, lunch 188, dinner 77, and 76 with no signal at all, which the
 * generator split between lunch and dinner by a hash of the name. Claimed:
 *   - none for the 76 (a name hash says nothing about a meal);
 *   - none for the 20 whose only breakfast signal is "beverage";
 *   - none for the 87 whose only lunch signals are sauce-like (a pesto or a
 *     dressing is not a lunch);
 *   - breakfast and dessert for the breakfast recipes the source also
 *     categorises as dessert (owner ruling 2026-09-25).
 */
export type HscaMeal = "breakfast" | "lunch" | "dinner" | "dessert";

export interface HscaSourceRecipe {
  name: string;
  title?: string;
  categories: readonly string[];
}

export interface HscaMealFiling {
  bucket: HscaMeal;
  meals: HscaMeal[];
}

interface Signals {
  categories: readonly string[];
  titleWords: readonly string[];
}

/** The generator's signals, in its order: the first meal that fires is the bucket. */
const SIGNALS: ReadonlyArray<[HscaMeal, Signals]> = [
  ["breakfast", { categories: ["breakfast", "brunch", "waffles", "pancakes", "muffins", "porridge", "crepes", "beverage"], titleWords: ["breakfast", "pancake", "waffle", "porridge"] }],
  ["dessert", { categories: ["dessert", "cookies", "cake", "tart", "pastry", "chocolate", "brownies", "ice cream", "truffles", "pie", "sweets"], titleWords: ["cookie", "cake", "truffle", "chocolate"] }],
  ["lunch", { categories: ["salad", "sandwich", "soup", "dressing", "appetizer", "snack", "dip", "spread", "pate", "sauce", "marinade", "condiment"], titleWords: ["soup", "salad", "sandwich", "dip"] }],
  ["dinner", { categories: ["main course", "pasta", "stew", "casserole", "poultry", "seafood", "fish", "chicken", "burger", "pizza", "curry", "entree"], titleWords: [] }],
];

/** Signals that file a recipe under a meal without making it one. */
const NOT_BREAKFAST = new Set(["beverage"]);
const NOT_LUNCH = new Set(["dressing", "dip", "spread", "pate", "sauce", "marinade", "condiment", "title:dip"]);
const DESSERT_CATEGORIES = new Set(SIGNALS.find(([meal]) => meal === "dessert")?.[1].categories ?? []);

function signalsFor(signals: Signals, categories: readonly string[], title: string): string[] {
  const byCategory = categories.filter((category) => signals.categories.includes(category));
  const byTitle = signals.titleWords.filter((word) => title.includes(word)).map((word) => `title:${word}`);
  return [...byCategory, ...byTitle];
}

/** The generator's fallback bucket: a deterministic hash of the name (not a meal). */
function hashBucket(name: string): HscaMeal {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % 2 === 0 ? "lunch" : "dinner";
}

/** A signal from outside the set supports the meal; one only from inside it does not. */
function supports(fired: readonly string[], notTheMeal: ReadonlySet<string>): boolean {
  return fired.some((signal) => !notTheMeal.has(signal));
}

function claimed(bucket: HscaMeal, fired: readonly string[], categories: readonly string[]): HscaMeal[] {
  const meals: HscaMeal[] = [];
  if (bucket === "breakfast") {
    if (supports(fired, NOT_BREAKFAST)) meals.push("breakfast");
    if (categories.some((category) => DESSERT_CATEGORIES.has(category))) meals.push("dessert");
  } else if (bucket !== "lunch" || supports(fired, NOT_LUNCH)) {
    meals.push(bucket);
  }
  return meals;
}

export function fileHscaRecipe(recipe: HscaSourceRecipe): HscaMealFiling {
  const categories = recipe.categories.map((category) => category.toLowerCase());
  const title = recipe.title?.toLowerCase() ?? "";
  for (const [meal, signals] of SIGNALS) {
    const fired = signalsFor(signals, categories, title);
    if (fired.length > 0) return { bucket: meal, meals: claimed(meal, fired, categories) };
  }
  return { bucket: hashBucket(recipe.name), meals: [] };
}
