/**
 * An "X or Y noun" ingredient line is weighed as the food it names. The
 * resolver used to drop the shared head noun and resolve the first option
 * alone, so a static recipe's broth was weighed as meat. Real recipe, real
 * catalog rows.
 */
import { getServerRecipes } from "@/actions/recipes";
import {
  computeIngredientNutrition,
  resolveIngredientByName,
} from "@/utils/ingredientNutritionAggregation";

const RISOTTO = "italian-dinner-all-authentic-risotto-alla-milanese";

describe("risotto alla Milanese: 1.5 liters of beef or chicken broth", () => {
  it("weighs as beef broth, not 1.5 kg of ground beef (3,759 kcal)", async () => {
    const risotto = (await getServerRecipes()).find((r) => r.id === RISOTTO);
    const line = risotto?.ingredients.find((i) => i.name === "beef or chicken broth");
    expect(line).toMatchObject({ amount: 1.5, unit: "liters" });

    const food = resolveIngredientByName(line?.name);
    expect(food?.name).toBe("beef broth");
    expect(food?.nutritionalProfile).toMatchObject({ serving_size: "1 cup (240ml)", calories: 17 });

    // 1,500 g at 17 kcal per 240 g. As Beef it was 1,500 / 85 × 213 = 3,759.
    const kcal = computeIngredientNutrition(food, 1500, "g")?.calories;
    expect(kcal).toBeCloseTo((1500 / 240) * 17, 6);
  });
});
