/**
 * Vitamins and minerals publish as fractions of a Daily Value, named as such,
 * never in fields named as mg or µg. Potassium and cholesterol publish in mg,
 * and only when every ingredient in the total carries them (owner rulings
 * 2026-09-27).
 *
 * Real catalog rows: ingredient profiles that state their serving in grams
 * (chicken egg 50 g, butter 14 g, spinach 30 g, all-purpose flour 30 g), and
 * the 1,084 static recipes.
 *
 * Imports only modules that exist on master, so the red proof is behavioural.
 */
import { getServerRecipes } from "@/actions/recipes";
import type { Recipe, RecipeIngredient } from "@/types/recipe";
import { computeRecipeNutritionFromIngredients } from "@/utils/ingredientNutritionAggregation";

/** Fields named as amounts. The ingredient data holds DV fractions for all of them. */
const AMOUNT_NAMED = [
  "vitaminA", "vitaminC", "vitaminD", "vitaminE", "vitaminK", "thiamin",
  "riboflavin", "niacin", "vitaminB6", "folate", "vitaminB12", "calcium",
  "iron", "magnesium", "phosphorus", "zinc", "copper", "manganese", "selenium",
];

interface Dv {
  fractions: Record<string, number>;
  listedBy: Record<string, number>;
  ingredients: number;
}

function numbers(value: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  if (typeof value !== "object" || value === null) return out;
  for (const [k, v] of Object.entries(value)) if (typeof v === "number") out[k] = v;
  return out;
}

/** The `dailyValue` block a nutrition payload carries, if any. */
function dailyValueOf(nutrition: unknown): Dv | undefined {
  if (typeof nutrition !== "object" || nutrition === null) return undefined;
  const dv: unknown = Reflect.get(nutrition, "dailyValue");
  if (typeof dv !== "object" || dv === null) return undefined;
  const ingredients: unknown = Reflect.get(dv, "ingredients");
  if (typeof ingredients !== "number") return undefined;
  return {
    fractions: numbers(Reflect.get(dv, "fractions")),
    listedBy: numbers(Reflect.get(dv, "listedBy")),
    ingredients,
  };
}

function grams(name: string, g: number): RecipeIngredient {
  return { name, amount: g, unit: "g" };
}

/** One serving of real catalog ingredients, weighed in grams. */
function total(...ingredients: RecipeIngredient[]) {
  const n = computeRecipeNutritionFromIngredients({ ingredients, numberOfServings: 1 });
  if (!n) throw new Error("the aggregator produced no total");
  return n;
}

let catalog: Recipe[] = [];
beforeAll(async () => {
  catalog = await getServerRecipes();
});

describe("vitamins and minerals are Daily Value fractions, and say so", () => {
  it("no catalog recipe publishes one in a field named as mg or µg", () => {
    const named = catalog.filter((r) => AMOUNT_NAMED.some((k) => typeof Reflect.get(r.nutrition ?? {}, k) === "number"));
    expect({ count: named.length, sample: named.slice(0, 3).map((r) => r.id) }).toEqual({ count: 0, sample: [] });
  });

  it("a total carries them as `dailyValue`, with how many of its ingredients list each", () => {
    // Egg per 50 g: D 0.87, iron 0.05. Butter per 14 g: D 0.07, no iron.
    const n = total(grams("chicken egg", 100), grams("butter", 14));
    const dv = dailyValueOf(n);
    expect(dv?.ingredients).toBe(2);
    expect(dv?.fractions.vitaminD).toBeCloseTo(0.87 * 2 + 0.07, 10);
    expect(dv?.listedBy.vitaminD).toBe(2);
    expect(dv?.fractions.iron).toBeCloseTo(0.05 * 2, 10);
    expect(dv?.listedBy.iron).toBe(1); // butter lists none: a lower bound
  });

  it("every computed catalog recipe carries one, and no count exceeds its ingredients", () => {
    const blocks = catalog.map((r) => dailyValueOf(r.nutrition)).filter((dv) => dv !== undefined);
    expect(blocks.length).toBeGreaterThan(800);
    const over = blocks.filter((dv) => Object.values(dv.listedBy).some((k) => k > dv.ingredients));
    expect(over).toEqual([]);
  });
});

describe("potassium and cholesterol are mg, published only when every ingredient carries them", () => {
  it("sums the mg values the profiles keep in `macros`", () => {
    // Egg per 50 g: potassium 69 mg, cholesterol 186 mg. Butter per 14 g: 3 mg, 31 mg.
    const n = total(grams("chicken egg", 100), grams("butter", 14));
    expect(n.potassium).toBeCloseTo(69 * 2 + 3, 10);
    expect(Reflect.get(n, "cholesterol")).toBeCloseTo(186 * 2 + 31, 10);
  });

  it("an ingredient without a value leaves the total absent, not smaller; `minerals.potassium` is never read", () => {
    // Spinach per 30 g: potassium 170 mg (its `minerals.potassium` is 0.05, a DV
    // fraction), and no cholesterol at all.
    const withSpinach = total(grams("chicken egg", 100), grams("spinach", 30));
    expect(withSpinach.potassium).toBeCloseTo(69 * 2 + 170, 10);
    expect(Reflect.get(withSpinach, "cholesterol")).toBeUndefined();
    // Control: flour lists no potassium, so neither does the total.
    expect(total(grams("all-purpose flour", 30), grams("butter", 14)).potassium).toBeUndefined();
  });
});
