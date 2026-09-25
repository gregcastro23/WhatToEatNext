/**
 * Authored meal and minutes by static twin (Phase 5): the live catalog stores
 * placeholders (prep 30 + cook 30, category "main" on all 1,063 recipes).
 */
import type { Recipe } from "@/types/recipe";
import { authoredFactsOf, buildAuthoredLookup, NOT_AUTHORED, withAuthoredFacts } from "../authoredFacts";

function recipe(fields: Partial<Recipe> & Pick<Recipe, "id" | "name">): Recipe {
  return { ingredients: [], instructions: [], ...fields };
}

const LIVE_PLACEHOLDER = { prepTime: "30", cookTime: "30", totalTime: "60", mealType: ["main"] };

describe("authoredFactsOf", () => {
  it("prep plus cook, and the meal the catalog files it under", () => {
    const baba = recipe({ id: "s1", name: "Baba Ganoush", cuisine: "Middle Eastern", prepTime: "15", cookTime: "15", mealType: ["lunch"] });
    expect(authoredFactsOf(baba)).toEqual({ minutes: 30, prepMinutes: 15, cookMinutes: 15, meals: ["lunch"] });
  });

  it("a no-cook dish keeps its prep; a dish with no stated time has none", () => {
    expect(authoredFactsOf(recipe({ id: "a", name: "A", prepTime: "10", cookTime: "0" }))).toMatchObject({ minutes: 10, prepMinutes: 10, cookMinutes: 0 });
    expect(authoredFactsOf(recipe({ id: "b", name: "B", prepTime: "0", cookTime: "0" })).minutes).toBeNull();
    expect(authoredFactsOf(recipe({ id: "c", name: "C" })).minutes).toBeNull();
  });

  it("an HSCA time with the generator's fill-in 15 is not stated; its own numbers are", () => {
    const filled = recipe({ id: "h1", name: "Cucumber Agua Fresca", cuisine: "hsca", prepTime: "10", cookTime: "15" });
    expect(authoredFactsOf(filled)).toMatchObject({ minutes: null, prepMinutes: null, cookMinutes: null });
    const parsed = recipe({ id: "h2", name: "Slow Beans", cuisine: "HSCA", prepTime: "20", cookTime: "90" });
    expect(authoredFactsOf(parsed).minutes).toBe(110);
    // The control: 15 elsewhere is a real time.
    expect(authoredFactsOf(recipe({ id: "t", name: "T", cuisine: "Thai", prepTime: "15", cookTime: "15" })).minutes).toBe(30);
  });

  it("keeps only the four catalog meals", () => {
    expect(authoredFactsOf(recipe({ id: "m", name: "M", mealType: ["Dinner", "main", "snack"] })).meals).toEqual(["dinner"]);
    expect(authoredFactsOf(recipe({ id: "n", name: "N", mealType: "dessert" })).meals).toEqual(["dessert"]);
  });
});

describe("buildAuthoredLookup", () => {
  const staticBaba = recipe({ id: "middleeastern-lunch-all-baba", name: "Authentic Baba Ganoush", cuisine: "Middle Eastern", prepTime: "15", cookTime: "15", mealType: ["lunch"] });
  const liveBaba = recipe({ id: "0f0e-live", name: "Authentic Baba Ganoush", cuisine: "Middle Eastern", ...LIVE_PLACEHOLDER });
  const liveNew = recipe({ id: "9a9a-live", name: "A Recipe Only The Database Has", ...LIVE_PLACEHOLDER });
  const lookup = buildAuthoredLookup([staticBaba], [liveBaba, liveNew]);

  it("a live recipe reads its static twin, never its own placeholders", () => {
    expect(lookup(liveBaba)).toEqual({ minutes: 30, prepMinutes: 15, cookMinutes: 15, meals: ["lunch"] });
  });

  it("a live recipe with no twin has no authored facts", () => {
    expect(lookup(liveNew)).toEqual(NOT_AUTHORED);
  });

  it("a static recipe (the degraded fallback) is its own source", () => {
    expect(lookup(staticBaba)).toEqual({ minutes: 30, prepMinutes: 15, cookMinutes: 15, meals: ["lunch"] });
  });
});

describe("withAuthoredFacts", () => {
  const live = recipe({ id: "0f0e-live", name: "Authentic Baba Ganoush", ...LIVE_PLACEHOLDER, timeToMake: "60 minutes" });

  it("replaces the placeholders with the authored times and meal", () => {
    const shown = withAuthoredFacts(live, { minutes: 22, prepMinutes: 10, cookMinutes: 12, meals: ["dinner"] });
    expect(shown).toMatchObject({ prepTime: "10", cookTime: "12", totalTime: "22", timeToMake: "22 minutes", mealType: ["dinner"] });
    expect(shown.name).toBe("Authentic Baba Ganoush");
  });

  it("with nothing authored, the times and meal are absent, not the placeholders", () => {
    const shown = withAuthoredFacts(live, NOT_AUTHORED);
    for (const key of ["prepTime", "cookTime", "totalTime", "timeToMake", "mealType"]) expect(shown).not.toHaveProperty(key);
    expect(shown.id).toBe("0f0e-live");
  });
});
