/**
 * Sugar, sodium and saturated fat publish only when every ingredient in the
 * total states them, like potassium and cholesterol (owner ruling 2026-09-29,
 * option a). A missing value was a 0: `readNum(undefined)`.
 *
 * Real catalog rows, per serving as their profiles state it:
 *   chicken egg (50 g)   sugar 0.2, sodium 71, sat fat 1.6
 *   butter (14 g)        sugar 0,   sodium 91, sat fat 7.3
 *   all-purpose flour    no sugar, sodium or sat fat at all
 *   salt (1.5 g)         sodium 581.4 (FDC 173468, Salt, table: 38758 mg/100 g)
 *   black salt (1.5 g)   sodium 0.2: not mg, and no USDA record to correct it from
 *   gochujang (18 g)     sodium 0.15: not mg, and no USDA record to correct it from
 *   kosher salt (3 g)    sodium 1120
 *   baking soda (4.6 g)  sodium 1259, no calories
 * and the 200 recipes `getServerRecipes` computes from their ingredients.
 *
 * Imports only modules that exist on master, so the red proof is behavioural.
 */
import { getServerRecipes } from "@/actions/recipes";
import type { Recipe, RecipeIngredient } from "@/types/recipe";
import {
  computeRecipeNutritionFromIngredients,
  resolveIngredientByName,
} from "@/utils/ingredientNutritionAggregation";
import { isPlausibleNutrition, normalizeRecipeNutrition } from "@/utils/recipeNutrition";

function line(name: string, amount: number, unit = "g"): RecipeIngredient {
  return { name, amount, unit };
}

function total(...ingredients: RecipeIngredient[]) {
  const n = computeRecipeNutritionFromIngredients({ ingredients, numberOfServings: 1 });
  if (!n) throw new Error("the aggregator produced no total");
  return n;
}

type Field = "sugar" | "sodium" | "saturatedFat";
const FIELDS: readonly Field[] = ["sugar", "sodium", "saturatedFat"];

const EGG = line("chicken egg", 100); // two servings
const BUTTER = line("butter", 14);

describe("a total sums what its ingredients state", () => {
  it("adds sugar, sodium and saturated fat over egg and butter", () => {
    const n = total(EGG, BUTTER);
    expect(n.sugar).toBeCloseTo(0.2 * 2 + 0, 10);
    expect(n.sodium).toBeCloseTo(71 * 2 + 91, 10);
    expect(n.saturatedFat).toBeCloseTo(1.6 * 2 + 7.3, 10);
  });
});

describe("an ingredient that states none leaves the figure absent, not smaller", () => {
  it("flour lists no sugar, sodium or saturated fat, so none is published; the macros still are", () => {
    const n = total(EGG, line("all-purpose flour", 30));
    expect(n.sugar).toBeUndefined();
    expect(n.sodium).toBeUndefined();
    expect(n.saturatedFat).toBeUndefined();
    expect(n.carbs).toBeGreaterThan(20);
  });

  it("a gap in one field leaves the others published", () => {
    // Neutral oil states no sodium or saturated fat; carbs 0 gives it sugar 0.
    const n = total(EGG, line("neutral oil", 14));
    expect(n.sugar).toBeCloseTo(0.4, 10);
    expect(n.sodium).toBeUndefined();
    expect(n.saturatedFat).toBeUndefined();
  });
});

describe("derived zeros: sugars are part of carbohydrate, saturated fat part of fat", () => {
  it("carbs 0 gives sugar 0, and fat 0 gives saturated fat 0", () => {
    // Champagne vinegar states carbs 0 and fat 0, and neither sugar nor saturated fat.
    const n = total(EGG, line("champagne vinegar", 15));
    expect(n.sugar).toBeCloseTo(0.4, 10);
    expect(n.saturatedFat).toBeCloseTo(3.2, 10);
    expect(n.sodium).toBeUndefined(); // sodium has no such whole
  });

  it("a missing carbs or fat derives nothing", () => {
    // Flour states carbs 23.2 and fat 0.3: neither is 0.
    expect(total(line("all-purpose flour", 30)).sugar).toBeUndefined();
  });
});

describe("a sodium between 0 and 1 is not a value in mg", () => {
  it("black salt (0.2 for 1.5 g) and gochujang (0.15 for a tablespoon) leave sodium absent", () => {
    expect(total(EGG, line("black salt", 1.5)).sodium).toBeUndefined();
    expect(total(EGG, line("gochujang", 18)).sodium).toBeUndefined();
  });

  it("an exact 0 is still a value, and a real salt adds its mg", () => {
    expect(total(EGG, line("olive oil", 14)).sodium).toBeCloseTo(142, 10);
    expect(total(EGG, line("kosher salt", 3)).sodium).toBeCloseTo(142 + 1120, 10);
  });

  it("salt, once corrected from FDC 173468, is 581.4 mg in 1.5 g, not 0.25", () => {
    expect(total(EGG, line("salt", 1.5)).sodium).toBeCloseTo(142 + 581.4, 10);
  });
});

describe("a line with no calories still adds its sodium", () => {
  it("baking soda (1259 mg, 0 kcal) was dropped from the total", () => {
    expect(total(EGG, line("baking soda", 4.6)).sodium).toBeCloseTo(142 + 1259, 10);
  });

  it("at unknown mass a nonzero value is a gap and a 0 is not", () => {
    // 'pinch' has no gram weight. Baking soda's sugar is 0 at any mass; its sodium is not.
    const n = total(EGG, line("baking soda", 1, "whole"));
    expect(n.sugar).toBeCloseTo(0.4, 10);
    expect(n.sodium).toBeUndefined();
  });
});

describe("a count is not a mass", () => {
  it("'1 piece' of salt leaves sodium absent; it is not 50 g of salt", () => {
    const n = total(EGG, line("salt", 1, "piece"));
    expect(n.sodium).toBeUndefined();
    expect(n.sugar).toBeCloseTo(0.4, 10); // salt's sugar is 0 at any mass
  });

  it("a teaspoon of salt is a mass: 6 g, measured", () => {
    expect(total(EGG, line("salt", 1, "tsp")).sodium).toBeCloseTo(142 + 581.4 * 4, 6); // 6 g is four 1.5 g servings
  });
});

describe("the catalog's computed recipes", () => {
  let catalog: Recipe[] = [];
  beforeAll(async () => {
    catalog = await getServerRecipes();
  });

  it("Authentic Kofta Kebab (10 ingredients) publishes none of the three", () => {
    const kofta = catalog.find((r) => r.id === "middleeastern-lunch-all-authentic-kofta-kebab");
    expect(kofta?.nutrition?.calories).toBeGreaterThan(0);
    expect(kofta?.nutrition?.sugar).toBeUndefined();
    expect(kofta?.nutrition?.sodium).toBeUndefined();
    expect(kofta?.nutrition?.saturatedFat).toBeUndefined();
  });

  it("Scrambled Eggs, whose salt is '1 piece', publishes no sodium (it read 4,949 mg)", () => {
    const eggs = catalog.find((r) => r.id === "hsca-breakfast-all-scrambled-eggs");
    expect(eggs?.ingredients.find((i) => i.name === "salt")?.unit).toBe("piece");
    expect(eggs?.nutrition?.calories).toBeGreaterThan(0);
    expect(eggs?.nutrition?.sodium).toBeUndefined();
  });

  it("Chicken Under a Brick (0.5 teaspoon sea salt) publishes the salt's sodium", () => {
    const chicken = catalog.find((r) => r.id === "hsca-dinner-all-chicken-under-a-brick");
    // 0.5 tsp = 3 g of salt = 1,163 mg, shared by the recipe's servings. [MEASURED 2026-10-05] its yield
    // says 2 servings (the importer once read the "1" of "1/2 chicken" as 1), so a serving carries 833 mg.
    expect(chicken?.numberOfServings).toBe(2);
    expect((chicken?.nutrition?.sodium ?? 0) * (chicken?.numberOfServings ?? 1)).toBeGreaterThan(1000);
  });

  it("Butter Poppyseed Sauce (butter, poppy seeds) publishes sugar and sodium", () => {
    const sauce = catalog.find((r) => r.id === "hsca-lunch-all-butter-poppyseed-sauce");
    expect(sauce?.nutrition?.sodium).toBeGreaterThan(100);
    expect(typeof sauce?.nutrition?.sugar).toBe("number");
  });

  it("no computed recipe publishes a value an ingredient's own profile does not state", () => {
    const stated = (name: string, key: Field): boolean => {
      const p = resolveIngredientByName(name)?.nutritionalProfile;
      if (typeof p !== "object" || p === null) return true; // unresolved: not in the total
      const m: unknown = Reflect.get(p, "macros") ?? p;
      const v: unknown = Reflect.get(m ?? {}, key);
      const whole: unknown = Reflect.get(m ?? {}, key === "sugar" ? "carbs" : "fat");
      if (typeof v === "number") return key !== "sodium" || v === 0 || v >= 1;
      return key !== "sodium" && whole === 0;
    };
    const computed = catalog.filter((r) => {
      const n = computeRecipeNutritionFromIngredients(r);
      return n && isPlausibleNutrition(n);
    });
    expect(computed.length).toBeGreaterThan(150);
    const partial = computed.filter((r) =>
      FIELDS.some(
        (k) => typeof r.nutrition?.[k] === "number" && r.ingredients.some((i) => !stated(i.name, k)),
      ),
    );
    expect(partial.map((r) => r.id)).toEqual([]);
  });
});

describe("an authored recipe states what it states", () => {
  /** East African Mandazi's authored block, as `nutritionPerServing` carries it. */
  let block: Record<string, number> = {};
  beforeAll(async () => {
    const mandazi = (await getServerRecipes()).find((r) => r.id === "african-breakfast-all-authentic-east-african-mandazi");
    const n = mandazi?.nutrition;
    if (!n || typeof n.sugar !== "number") throw new Error("Mandazi states no sugar in the catalog");
    block = { calories: n.calories, proteinG: n.protein, carbsG: n.carbs, fatG: n.fat, sugarG: n.sugar };
  });

  it("does not turn an unstated sodium or saturated fat into 0", () => {
    const n = normalizeRecipeNutrition({ nutritionPerServing: block });
    expect(n?.sugar).toBe(block.sugarG);
    expect(n?.sodium).toBeUndefined();
    expect(n?.saturatedFat).toBeUndefined();
  });

  it("keeps a stated 0, and drops a value that is not a number", () => {
    expect(normalizeRecipeNutrition({ nutritionPerServing: { ...block, sodiumMg: 0 } })?.sodium).toBe(0);
    expect(normalizeRecipeNutrition({ nutritionPerServing: { ...block, sodiumMg: "n/a" } })?.sodium).toBeUndefined();
  });
});
