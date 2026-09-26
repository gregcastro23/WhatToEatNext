/**
 * Owner ruling 2026-09-26: no template stub is published as a recipe. Fourteen
 * cuisine-file dishes were stubs ("An alchemically precise execution of X",
 * ingredients "Foundation of X" + "Alchemical binding agent"); twelve had
 * their own indexable page in the sitemap. The eight with no real counterpart
 * are authored from a named published recipe; the six that duplicate a real
 * recipe are removed (0 saved references in production, measured 2026-09-26).
 */
import { getServerRecipes } from "@/actions/recipes";
import { african } from "@/data/cuisines/african";
import { american } from "@/data/cuisines/american";
import { chinese } from "@/data/cuisines/chinese";
import { french } from "@/data/cuisines/french";
import { fusion } from "@/data/cuisines/fusion";
import { greek } from "@/data/cuisines/greek";
import { cuisine as hsca } from "@/data/cuisines/hsca";
import { indian } from "@/data/cuisines/indian";
import { italian } from "@/data/cuisines/italian";
import { japanese } from "@/data/cuisines/japanese";
import { korean } from "@/data/cuisines/korean";
import { mexican } from "@/data/cuisines/mexican";
import { middleEastern } from "@/data/cuisines/middle-eastern";
import { russian } from "@/data/cuisines/russian";
import { thai } from "@/data/cuisines/thai";
import { vietnamese } from "@/data/cuisines/vietnamese";
import rawIndex from "@/data/generated/ingredientRecipeIndex.json";
import { authoredFactsOf } from "@/lib/search/authoredFacts";
import type { Cuisine } from "@/types/cuisine";
import type { Recipe } from "@/types/recipe";

const CUISINES: readonly Cuisine[] = [
  african, american, chinese, french, fusion, greek, hsca, indian,
  italian, japanese, korean, mexican, middleEastern, russian, thai, vietnamese,
];

const TEMPLATE_DESCRIPTION = /^An alchemically/;
const TEMPLATE_INGREDIENT = /^(Foundation of |Primary ingredient for )|^(Alchemical binding agent|Aromatic catalyst)$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Every dish in a cuisine file, in every bucket, including ones the loader skips. */
function rawDishes(cuisine: Cuisine): Record<string, unknown>[] {
  return Object.values(cuisine.dishes).flatMap((seasons) =>
    Object.values(seasons ?? {}).flatMap((list: unknown) => (Array.isArray(list) ? list.filter(isRecord) : [])),
  );
}

function templateMarks(dish: Record<string, unknown>): string[] {
  const names = (Array.isArray(dish.ingredients) ? dish.ingredients : []).flatMap((ing: unknown) =>
    isRecord(ing) && typeof ing.name === "string" ? [ing.name] : [],
  );
  return [
    ...(TEMPLATE_DESCRIPTION.test(String(dish.description ?? "")) ? ["description"] : []),
    ...names.filter((name) => TEMPLATE_INGREDIENT.test(name)),
  ];
}

// Each value is the source's own: its recipe card's times and yield, or none.
const AUTHORED = [
  { id: "korean-dessert-all-songpyeon", author: "Hyosun Ro", url: "https://www.koreanbapsang.com/songpyeon-half-moon-shaped-rice-cake/", minutes: 60, servings: 4 },
  { id: "thai-dessert-all-tub-tim-grob", author: "Pailin Chongchitnant", url: "https://hot-thai-kitchen.com/tub-tim-grob/", minutes: null, servings: 4 },
  { id: "thai-dessert-all-bua-loi", author: "Pailin Chongchitnant", url: "https://hot-thai-kitchen.com/rice-balls-bua-loy/", minutes: null, servings: 4 },
  { id: "thai-dessert-all-sangkaya-fak-thong", author: "Pailin Chongchitnant", url: "https://hot-thai-kitchen.com/custard-in-a-pumpkin/", minutes: 90, servings: 10 },
  { id: "thai-dessert-all-kluay-tod", author: "Pailin Chongchitnant", url: "https://hot-thai-kitchen.com/fried-bananas-new/", minutes: 40, servings: undefined },
  { id: "vietnamese-breakfast-all-bnh-m-p-la", author: "Becca Du", url: "https://www.cooking-therapy.com/banh-mi-op-la/", minutes: 10, servings: 4 },
  { id: "vietnamese-dinner-all-tht-kho-tu", author: "Vicky Pham", url: "https://vickypham.com/blog/braised-pork-and-boiled-eggs-in-coconut-juice-thit-kho-tau/", minutes: 110, servings: 6 },
  { id: "vietnamese-dinner-all-lu-thi", author: "Sophie Pham", url: "https://delightfulplate.com/thai-hotpot-lau-thai/", minutes: 105, servings: 4 },
] as const;

// Removed stub id → the real recipe it duplicated, which stays.
const REMOVED = [
  ["korean-dessert-winter-hotteok", "korean-dinner-all-authentic-hotteok"],
  ["korean-dessert-all-japchae", "korean-dinner-all-authentic-japchae"],
  ["thai-dinner-winter-gaeng-panang-neua", "thai-dinner-all-authentic-gaeng-panang-panang-curry"],
  ["thai-dinner-winter-khao-soi-gai", "thai-lunch-all-khao-soi"],
  ["vietnamese-breakfast-winter-cho", "vietnamese-breakfast-all-cho-g"],
  ["vietnamese-dessert-all-ch-ba-mu", "vietnamese-dinner-all-che-ba-mau"],
] as const;

async function catalog(): Promise<Map<string, Recipe>> {
  return new Map((await getServerRecipes()).map((r) => [String(r.id), r]));
}

describe("the cuisine data", () => {
  it("carries no template stub in any bucket", () => {
    const stubs = CUISINES.flatMap((cuisine) =>
      rawDishes(cuisine).flatMap((dish) => {
        const marks = templateMarks(dish);
        return marks.length > 0 ? [`${cuisine.name}: ${String(dish.name)} (${marks.join(", ")})`] : [];
      }),
    );
    expect(stubs).toEqual([]);
  });
});

describe.each(AUTHORED)("$id", ({ id, author, url, minutes, servings }) => {
  it("is published with real ingredients and method", async () => {
    const recipe = (await catalog()).get(id);
    expect(recipe).toBeDefined();
    expect(recipe?.ingredients.length).toBeGreaterThanOrEqual(7);
    for (const ing of recipe?.ingredients ?? []) {
      expect(ing.amount).toBeGreaterThan(0);
      expect(ing.unit).not.toBe("piece");
    }
    expect(recipe?.instructions.length).toBeGreaterThanOrEqual(4);
  });

  it("names the recipe it was adapted from", async () => {
    const source = (await catalog()).get(id)?.adaptedFrom;
    expect(source).toEqual(expect.objectContaining({ author, url, accessed: "2026-09-26" }));
  });

  it("states only the times and servings its source states", async () => {
    const recipe = (await catalog()).get(id);
    if (recipe === undefined) throw new Error(`${id} is not in the catalog`);
    expect(authoredFactsOf(recipe).minutes).toBe(minutes);
    expect(recipe.numberOfServings).toBe(servings);
  });
});

describe("the six duplicates", () => {
  it.each(REMOVED)("%s is gone; %s stays", async (removed, real) => {
    const recipes = await catalog();
    expect(recipes.has(removed)).toBe(false);
    expect(recipes.get(real)?.description).not.toMatch(TEMPLATE_DESCRIPTION);
  });
});

describe("the ingredient → recipe index", () => {
  it("references no template ingredient line", () => {
    const lines = Object.values(rawIndex).flatMap((matches) =>
      matches.filter((m) => TEMPLATE_INGREDIENT.test(m.rawIngredientName)).map((m) => `${m.recipeId}: ${m.rawIngredientName}`),
    );
    expect(lines).toEqual([]);
  });
});
