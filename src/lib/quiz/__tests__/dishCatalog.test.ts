import { getServerRecipes } from "@/actions/recipes";
import { decodeDish, encodeDish, quizCatalogSchema } from "../catalogContract";
import { adventureScores, buildQuizCatalog, displayName, isMealWorthy } from "../dishCatalog";
import { computeFeatures, readDishText, type RecipeSource } from "../dishFeatures";
import { groupsNamedBy } from "../dishLexicon";
import { allergensNamedBy, dietsOf } from "../dishSafety";

function recipe(name: string, ingredients: string[], instructions: string[], extra: Partial<RecipeSource> = {}): RecipeSource {
  return { id: name.toLowerCase().replace(/\W+/g, "-"), name, ingredients: ingredients.map((item) => ({ name: item })), instructions, ...extra };
}

function features(source: RecipeSource): ReturnType<typeof computeFeatures> {
  return computeFeatures(source, readDishText(source));
}

describe("computed dish features", () => {
  it("reads soups as hot and spoonable, salads as cold and bright", () => {
    const soup = features(recipe("Chicken Noodle Soup", ["chicken", "egg noodles", "carrots", "chicken broth"], ["Simmer the broth.", "Ladle into bowls."]));
    const salad = features(recipe("Herb Salad", ["lettuce", "lemon juice", "parsley", "cucumber"], ["Toss everything together and serve cold."]));
    expect(soup.warmth).toBe(1);
    expect(soup.brothy).toBeGreaterThan(0.7);
    expect(salad.warmth).toBe(0);
    expect(salad.fresh).toBeGreaterThan(0.6);
  });

  it("reads frying as crunch and richness, and chilies or an authored level as heat", () => {
    const fried = features(recipe("Crispy Chicken", ["chicken thighs", "panko", "oil"], ["Deep-fry until golden."]));
    expect(fried.crunch).toBeGreaterThan(0.8);
    expect(fried.richness).toBeGreaterThan(0.5);
    expect(features(recipe("Stew", ["beef", "jalapeno", "cayenne"], ["Simmer."])).spice).toBeCloseTo(0.7, 5);
    expect(features(recipe("Curry", ["chickpeas"], ["Simmer."], { spiceLevel: "Fiery" })).spice).toBe(1);
  });

  it("treats desserts as sweet and ignores placeholder HSCA method lists", () => {
    expect(features(recipe("Lemon Tart", ["flour", "butter", "sugar", "lemons"], ["Bake."], { mealType: ["dessert"] })).sweet).toBeGreaterThanOrEqual(0.8);
    const hsca = recipe("Green Salad", ["lettuce", "radishes", "vinegar"], ["Toss."], { cuisine: "hsca", cookingMethod: ["steaming", "simmering", "raw"] });
    expect(readDishText(hsca).methods.has("steam")).toBe(false);
  });
});

describe("meal-worthiness", () => {
  const steps = ["Cook."];
  it("keeps dishes and drops drinks and components", () => {
    const keep = recipe("Chicken in Garlic Sauce", ["chicken", "garlic", "soy sauce"], steps);
    expect(isMealWorthy(keep, groupsNamedBy(keep.ingredients.map((item) => item.name)))).toBe(true);
    for (const drop of [
      recipe("Watermelon Juice", ["watermelon", "lime", "mint"], steps),
      recipe("Sherry Vinaigrette", ["sherry vinegar", "olive oil", "shallot"], steps),
      recipe("Spelt Bread (for Tempeh Reuben Sandwich)", ["spelt flour", "water", "yeast"], steps),
      recipe("Croutons for Vegan Caesar Salad", ["bread", "olive oil", "garlic"], steps),
      recipe("Stub", ["salt"], steps),
    ]) {
      expect(isMealWorthy(drop, groupsNamedBy(drop.ingredients.map((item) => item.name)))).toBe(false);
    }
  });
});

describe("diets and allergens", () => {
  it("classifies diets from every ingredient", () => {
    expect(dietsOf(["chickpeas", "olive oil", "lemon"])).toEqual(["vegan", "vegetarian", "pescatarian"]);
    expect(dietsOf(["paneer", "spinach"])).toEqual(["vegetarian", "pescatarian"]);
    expect(dietsOf(["rice noodles", "shrimp", "fish sauce"])).toEqual(["pescatarian"]);
    expect(dietsOf(["chicken", "rice"])).toEqual([]);
  });

  it("flags named allergens and exempts their plant or free-from forms", () => {
    expect(allergensNamedBy(["soy sauce"])).toEqual(["gluten", "soy"]);
    expect(allergensNamedBy(["corn tortillas", "coconut milk", "eggplant", "nutmeg", "rice flour"])).toEqual([]);
    expect(allergensNamedBy(["almond butter"])).toEqual(["tree-nuts"]);
    expect(allergensNamedBy(["worcestershire sauce"])).toEqual(["fish"]);
  });
});

describe("catalog assembly", () => {
  it("title-cases all-caps titles for display and leaves others alone", () => {
    expect(displayName("CRUCIFEROUS SALAD WITH SHERRY VINAIGRETTE")).toBe("Cruciferous Salad with Sherry Vinaigrette");
    expect(displayName("\"CHEESE\" MEDALLIONS")).toBe("\"Cheese\" Medallions");
    expect(displayName("Authentic Phở Bò")).toBe("Authentic Phở Bò");
    expect(displayName("BLT")).toBe("BLT");
    expect(displayName("GREAT NORTHERN BEAN AND ROASTED GARLIC PURÉE")).toBe("Great Northern Bean and Roasted Garlic Purée");
  });

  it("ranks adventure as a within-catalog percentile", () => {
    const scores = adventureScores([new Set(["rice", "salt"]), new Set(["rice", "salt"]), new Set(["rice", "teff", "berbere"])]);
    expect(scores[2]).toBe(1);
    expect(scores[0]).toBe(0);
  });

  it("builds the real static catalog, and every dish survives the wire format", async () => {
    const dishes = buildQuizCatalog(await getServerRecipes());
    expect(dishes.length).toBeGreaterThan(850);
    const wire = { success: true, version: 1, generatedFrom: "test", dishes: dishes.map(encodeDish) };
    const parsed = quizCatalogSchema.parse(JSON.parse(JSON.stringify(wire)));
    expect(parsed.dishes.map(decodeDish)[0]?.id).toBe(dishes[0]?.id);
    const named = (fragment: string): (typeof dishes)[number] | undefined => dishes.find((dish) => dish.name.includes(fragment));
    expect(named("Tom Yum")?.features.brothy).toBeGreaterThan(0.7);
    expect(named("Tom Yum")?.features.spice).toBeGreaterThan(0.6);
    expect(named("Tonkatsu")?.features.crunch).toBeGreaterThan(0.8);
    expect(named("Tiramisu")?.features.sweet).toBeGreaterThanOrEqual(0.8);
    expect(dishes.some((dish) => / juice$/i.test(dish.name))).toBe(false);
  });
});
