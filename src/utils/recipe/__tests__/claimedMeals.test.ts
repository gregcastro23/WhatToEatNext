/**
 * A cuisine dish claims the meals its own classification names, not the
 * bucket it is filed under (owner ruling 2026-09-25); the bucket still places
 * it and names its static id.
 */
import { getServerRecipes } from "@/actions/recipes";
import { getCuisineData, PRIMARY_CUISINE_KEYS } from "@/data/cuisines/index";
import { claimedMeals } from "../claimedMeals";

describe("claimedMeals", () => {
  it("the classification's meals win over the bucket, tags dropped", () => {
    expect(claimedMeals({ classifications: { mealType: ["dinner", "stew", "celebration"] } }, "lunch")).toEqual(["dinner"]);
  });

  it("the bucket's meal leads when the dish still claims it", () => {
    expect(claimedMeals({ classifications: { mealType: ["lunch", "dinner"] } }, "dinner")).toEqual(["dinner", "lunch"]);
  });

  it("a classification of tags alone, or none, leaves the bucket", () => {
    expect(claimedMeals({ classifications: { mealType: ["soup"] } }, "lunch")).toEqual(["lunch"]);
    expect(claimedMeals({}, "dessert")).toEqual(["dessert"]);
    expect(claimedMeals({ classifications: { mealType: "dinner" } }, "lunch")).toEqual(["lunch"]);
  });

  it("folds case and repeats", () => {
    expect(claimedMeals({ classifications: { mealType: ["Dessert", "dessert", "Snack"] } }, "dinner")).toEqual(["dessert"]);
  });
});

describe("in the static catalog", () => {
  it.each([
    ["italian-dinner-all-authentic-tiramis", ["dessert"], "a dessert filed under dinner is a dessert"],
    ["greek-dinner-all-authentic-greek-baklava", ["dessert"], "so is Baklava"],
    ["african-lunch-all-authentic-ethiopian-doro-wat", ["dinner"], "classified dinner, filed under lunch"],
    ["african-lunch-all-authentic-nigerian-jollof-rice", ["lunch", "dinner"], "the bucket leads when claimed"],
    ["american-dinner-all-classic-new-england-clam-chowder", ["dinner", "lunch"], "so dinner stays first here"],
    ["american-lunch-all-authentic-new-england-clam-chowder", ["lunch"], "classified only as a soup: the bucket"],
    ["thai-dessert-all-tub-tim-grob", ["dessert"], "a template entry keeps its bucket"],
  ])("%s claims %j: %s", async (id, meals) => {
    const recipe = (await getServerRecipes()).find((r) => r.id === id);
    expect(recipe?.mealType).toEqual(meals);
  });
});

describe("the cuisine data", () => {
  it("no template entry carries the template's stamped lunch + dinner", async () => {
    const stamped: string[] = [];
    for (const key of PRIMARY_CUISINE_KEYS) {
      const cuisine = await getCuisineData(key);
      for (const [bucket, seasons] of Object.entries(cuisine?.dishes ?? {})) {
        for (const dish of Object.values(seasons ?? {}).flat()) {
          const template = /^An alchemically/.test(String(dish.description ?? ""));
          if (template && JSON.stringify(dish.mealType) !== JSON.stringify([bucket])) stamped.push(`${key} ${bucket}: ${dish.name} ${JSON.stringify(dish.mealType)}`);
        }
      }
    }
    expect(stamped).toEqual([]);
  });
});
