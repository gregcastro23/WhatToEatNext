/**
 * `IngredientDrawer` reads `GET /api/ingredients/[name]`. Fixtures mirror what
 * `src/app/api/ingredients/[name]/route.ts` builds (route.ts:119-134), and the catalog
 * tests round-trip the REAL `catalogRecord` of every ingredient the site serves.
 */
import { isJsonRecord } from "@/lib/api/json";
import { getRecipesForIngredient, groupMatchesByCuisine } from "@/data/ingredientRecipeIndex";
import { catalogRecord, getIngredientCatalog } from "@/lib/ingredients/ingredientCatalog";
import { buildRelatedIngredientRecipe } from "@/lib/ingredients/relatedRecipe";
import { parseIngredientDrawerResponse } from "../ingredientDrawerParser";

const jsonOf = (value: unknown): unknown => JSON.parse(JSON.stringify(value));

/** Every field the drawer reads off the ingredient, in its parsed shape. */
const INGREDIENT = {
  name: "Garlic",
  category: "vegetables",
  subCategory: "alliums",
  subcategory: "allium",
  qualities: ["pungent", "warming"],
  origin: ["Central Asia"],
  elementalProperties: { Fire: 0.4, Water: 0.1, Earth: 0.3, Air: 0.2 },
  alchemicalProperties: { Spirit: 0.5, Essence: 0.2, Matter: 0.2, Substance: 0.1 },
  kalchm: 1.25,
  monica: 0.8,
  flavorProfile: { pungent: 0.9 },
  sensoryProfile: { taste: { pungent: 0.9 } },
  nutritionalProfile: {
    serving_size: "1 clove",
    calories: 4,
    macros: { protein: 0.2, carbs: 1, fat: 0, fiber: 0.1 },
    vitamins: { vitamin_c: 0.02 },
    minerals: { manganese: 0.03 },
    source: "USDA",
  },
  storage: { container: "mesh bag", duration: "3 months", temperature: { fahrenheit: 60, celsius: 15 }, notes: "dry" },
  seasonality: ["fall"],
  season: ["fall", "winter"],
  pairingRecommendations: { complementary: ["thyme"], contrasting: ["honey"], toAvoid: ["milk"] },
  astrologicalProfile: { rulingPlanets: ["Mars"], zodiacAffinity: ["Aries"] },
  recommendedCookingMethods: ["roast"],
};
const SUBSTITUTION = { name: "shallot", rationale: "Shares flavor affinity with Garlic.", type: "complementary" };
const MATCH = { recipeId: "r1", recipeName: "Aioli", amount: 2, unit: "clove" };

/** The 200 body of route.ts:125-134; `extra` overrides keys (`undefined` removes one). */
function producerBody(extra: Record<string, unknown> = {}): unknown {
  return jsonOf({
    success: true,
    ingredient: { ...INGREDIENT, description: "unread", imageUrl: "/garlic.png" },
    slug: "garlic",
    relatedRecipes: [
      { id: "r1", name: "Aioli", cuisine: "french", description: "d", prepTime: 5, cookTime: 0, servings: 4, amount: 2, unit: "clove" },
      { id: "r2", name: "Toum", cuisine: "lebanese" },
    ],
    recipesByCuisine: {
      french: [{ ...MATCH, cuisine: "french", rawIngredientName: "garlic" }],
      lebanese: [{ recipeId: "r2", recipeName: "Toum", cuisine: "lebanese", rawIngredientName: "garlic cloves", amount: "1 head" }],
    },
    substitutions: [SUBSTITUTION],
    totalRecipeMatches: 2,
    ...extra,
  });
}
const parseWith = (extra: Record<string, unknown>): ReturnType<typeof parseIngredientDrawerResponse> =>
  parseIngredientDrawerResponse(producerBody(extra));
const ingredientWith = (fields: Record<string, unknown>): ReturnType<typeof parseIngredientDrawerResponse> =>
  parseWith({ ingredient: { name: "Garlic", ...fields } });

describe("parseIngredientDrawerResponse: whole body", (): void => {
  it("keeps the producer's success body and ignores what the drawer never reads", (): void => {
    expect(parseIngredientDrawerResponse(producerBody())).toEqual({
      ingredient: INGREDIENT,
      relatedRecipes: [{ id: "r1" }, { id: "r2" }],
      recipesByCuisine: {
        french: [MATCH],
        lebanese: [{ recipeId: "r2", recipeName: "Toum", amount: "1 head" }],
      },
      substitutions: [SUBSTITUTION],
      totalRecipeMatches: 2,
    });
  });

  it("reads `ingredient: null` (no card) as a valid body; that is the control for the refusals below", (): void => {
    const out = parseWith({ ingredient: null });
    expect(out.ingredient).toBeNull();
    expect(out.totalRecipeMatches).toBe(2);
  });

  it("throws on a JSON null body and on any other non-object body", (): void => {
    const parsed: unknown = JSON.parse("null");
    expect(() => parseIngredientDrawerResponse(parsed)).toThrow(/not a JSON object/);
    for (const body of [[], "text", 7, true]) expect(() => parseIngredientDrawerResponse(body)).toThrow(/not a JSON object/);
    expect(() => parseIngredientDrawerResponse(JSON.parse("{}"))).toThrow(/had no ingredient/);
  });

  it("throws on the route's refusal bodies, which carry no `ingredient` key", (): void => {
    for (const body of [
      { success: false, error: "Ingredient name is required" },
      { success: false, error: "Failed to fetch ingredient details" },
    ]) {
      expect(() => parseIngredientDrawerResponse(jsonOf(body))).toThrow(/had no ingredient/);
      expect(parseIngredientDrawerResponse(jsonOf({ ...body, ingredient: null })).ingredient).toBeNull();
    }
  });

  it.each([["a string", "garlic"], ["an array", []], ["a number", 7], ["absent", undefined]])(
    "throws when `ingredient` is %s",
    (_label, ingredient): void => {
      expect(() => parseWith({ ingredient })).toThrow(/had no ingredient/);
      expect(parseWith({ ingredient: { name: "Garlic" } }).ingredient).toEqual({ name: "Garlic" });
    },
  );

  it.each([["missing", undefined], ["a number", 7], ["null", null]])("throws when the ingredient name is %s", (_l, name): void => {
    expect(() => parseWith({ ingredient: { name, category: "spice" } })).toThrow(/no string name/);
    expect(ingredientWith({ category: "spice" }).ingredient).toEqual({ name: "Garlic", category: "spice" });
  });

  it("never reads success, slug or error, so they cannot reject a body", (): void => {
    expect(parseWith({ success: "yes", slug: 5, error: { code: 1 } }).ingredient).toEqual(INGREDIENT);
  });

  it("reads totalRecipeMatches as a number, defaults an absent one to 0, and throws on a wrong type", (): void => {
    expect(parseWith({ totalRecipeMatches: 24 }).totalRecipeMatches).toBe(24);
    expect(parseWith({ totalRecipeMatches: undefined }).totalRecipeMatches).toBe(0);
    for (const bad of ["2", null, {}]) expect(() => parseWith({ totalRecipeMatches: bad })).toThrow(/totalRecipeMatches was not a number/);
  });
});

/** [field, a mistyped value, a valid value]: the mistyped one is dropped, the valid one kept. */
const FIELD_CASES: Array<[string, unknown, unknown]> = [
  ["category", 7, "spice"],
  ["subCategory", [], "herb"],
  ["subcategory", null, "herb"],
  ["qualities", ["a", 1], ["a", "b"]],
  ["origin", 7, "Asia"],
  ["elementalProperties", "x", { Fire: 0.5 }],
  ["alchemicalProperties", [], { Spirit: 1 }],
  ["kalchm", "1", 1.5],
  ["monica", null, 0.5],
  ["flavorProfile", 7, { sweet: 0.5 }],
  ["sensoryProfile", { taste: ["sweet"] }, { taste: { sweet: 0.5 } }],
  ["nutritionalProfile", "x", { calories: 4 }],
  ["storage", 7, "cool"],
  ["seasonality", { peak: ["fall"] }, ["fall"]],
  ["season", 7, "fall"],
  ["pairingRecommendations", "x", { complementary: ["a"] }],
  ["astrologicalProfile", null, { rulingPlanets: ["Mars"] }],
  ["recommendedCookingMethods", [1], ["roast"]],
];

describe("parseIngredientDrawerResponse: ingredient display fields", (): void => {
  it.each(FIELD_CASES)("drops a mistyped %s without rejecting the ingredient, and keeps a valid one", (field, bad, good): void => {
    expect(ingredientWith({ [field]: bad }).ingredient).toEqual({ name: "Garlic" });
    expect(ingredientWith({ [field]: good }).ingredient).toEqual({ name: "Garlic", [field]: good });
  });

  it("keeps the valid keys of a partly valid weights object, with a fully valid control", (): void => {
    const partial = ingredientWith({
      elementalProperties: { Fire: "1", Water: 0.5, Earth: null, Air: 0.2 },
      alchemicalProperties: { Spirit: 1, Essence: "x", Matter: [], Substance: 0.3 },
      flavorProfile: { sweet: 0.5, bitter: "high" },
      nutritionalProfile: { macros: { protein: "1", carbs: 2, fat: 0, fiber: {} } },
    }).ingredient;
    expect(partial).toEqual({
      name: "Garlic",
      elementalProperties: { Water: 0.5, Air: 0.2 },
      alchemicalProperties: { Spirit: 1, Substance: 0.3 },
      flavorProfile: { sweet: 0.5 },
      nutritionalProfile: { macros: { carbs: 2, fat: 0 } },
    });
    expect(ingredientWith({ elementalProperties: INGREDIENT.elementalProperties }).ingredient?.elementalProperties).toEqual(
      INGREDIENT.elementalProperties,
    );
  });

  it("keeps nutrition fields of the right type only, and treats a vitamin list as mistyped", (): void => {
    const bad = { serving_size: 3, calories: "9", vitamins: ["C"], minerals: ["Fe"], source: 5 };
    expect(ingredientWith({ nutritionalProfile: bad }).ingredient?.nutritionalProfile).toEqual({});
    const good = { serving_size: "1 cup", calories: 9, vitamins: { C: 1 }, minerals: { Fe: 2 }, source: "USDA" };
    expect(ingredientWith({ nutritionalProfile: good }).ingredient?.nutritionalProfile).toEqual(good);
  });

  it("keeps storage fields of the right type, and a temperature only if it is a string or a full pair", (): void => {
    const bad = { container: 5, duration: [], temperature: { fahrenheit: 40 }, notes: null };
    expect(ingredientWith({ storage: bad }).ingredient?.storage).toEqual({});
    expect(ingredientWith({ storage: { temperature: "cool" } }).ingredient?.storage).toEqual({ temperature: "cool" });
    const pair = { temperature: { fahrenheit: 40, celsius: 4 } };
    expect(ingredientWith({ storage: pair }).ingredient?.storage).toEqual(pair);
  });
});

describe("parseIngredientDrawerResponse: rows", (): void => {
  function rowCases(key: "relatedRecipes" | "substitutions", good: unknown, kept: unknown, bad: readonly unknown[]): void {
    it(`${key}: drops bad rows, throws when none match, and accepts empty or absent`, (): void => {
      expect(parseWith({ [key]: [good] })[key]).toEqual([kept]);
      expect(parseWith({ [key]: [...bad, good] })[key]).toEqual([kept]);
      expect(() => parseWith({ [key]: bad })).toThrow(/row matched/);
      expect(parseWith({ [key]: [] })[key]).toEqual([]);
      expect(parseWith({ [key]: undefined })[key]).toEqual([]);
      for (const wrong of [null, {}, "x", 7]) expect(() => parseWith({ [key]: wrong })).toThrow(/was not an array/);
    });
  }
  rowCases("relatedRecipes", { id: "r1", name: "Aioli" }, { id: "r1" }, [{ id: 7 }, { name: "x" }, null, "r1"]);
  rowCases("substitutions", SUBSTITUTION, SUBSTITUTION, [{ ...SUBSTITUTION, type: 1 }, { name: "x" }, [], null]);

  it("recipesByCuisine: keeps good rows, drops bad ones, and treats null amount/unit as absent", (): void => {
    const rows = [{ recipeId: 5, recipeName: "x" }, { recipeId: "a" }, { ...MATCH, amount: {} }, { ...MATCH, unit: 5 }, MATCH];
    expect(parseWith({ recipesByCuisine: { french: rows } }).recipesByCuisine).toEqual({ french: [MATCH] });
    expect(parseWith({ recipesByCuisine: { french: [{ ...MATCH, amount: null, unit: null }] } }).recipesByCuisine).toEqual({
      french: [{ recipeId: "r1", recipeName: "Aioli" }],
    });
    expect(parseWith({ recipesByCuisine: undefined }).recipesByCuisine).toBeUndefined();
    expect(parseWith({ recipesByCuisine: {} }).recipesByCuisine).toEqual({});
    expect(parseWith({ recipesByCuisine: { french: [] } }).recipesByCuisine).toEqual({ french: [] });
  });

  it("recipesByCuisine: throws on a non-object, a non-array group, or a group where no row matches", (): void => {
    for (const bad of [[], null, "x", 7]) expect(() => parseWith({ recipesByCuisine: bad })).toThrow(/was not an object/);
    for (const group of [null, {}, "x"]) expect(() => parseWith({ recipesByCuisine: { french: group } })).toThrow(/was not an array/);
    expect(() => parseWith({ recipesByCuisine: { french: [{ recipeId: 5 }] } })).toThrow(/row matched/);
    expect(parseWith({ recipesByCuisine: { french: [MATCH] } }).recipesByCuisine).toEqual({ french: [MATCH] });
  });

  it("recipesByCuisine: a cuisine named __proto__ stays an own key and never reaches the prototype", (): void => {
    const body: unknown = JSON.parse('{"ingredient":null,"recipesByCuisine":{"__proto__":[{"recipeId":"a","recipeName":"A"}]}}');
    const groups = parseIngredientDrawerResponse(body).recipesByCuisine;
    expect(Object.keys(groups ?? {})).toEqual(["__proto__"]);
    expect(Object.getPrototypeOf(groups)).toBe(Object.prototype);
  });
});

/** Dotted paths of every field the drawer reads off the ingredient. */
const READ_PATHS = [
  "name", "category", "subCategory", "subcategory", "qualities", "origin", "seasonality", "season",
  "kalchm", "monica", "flavorProfile", "sensoryProfile.taste", "recommendedCookingMethods",
  ...["Fire", "Water", "Earth", "Air"].map((k) => `elementalProperties.${k}`),
  ...["Spirit", "Essence", "Matter", "Substance"].map((k) => `alchemicalProperties.${k}`),
  ...["serving_size", "calories", "vitamins", "minerals", "source"].map((k) => `nutritionalProfile.${k}`),
  ...["protein", "carbs", "fat", "fiber"].map((k) => `nutritionalProfile.macros.${k}`),
  ...["container", "duration", "temperature", "notes"].map((k) => `storage.${k}`),
  ...["complementary", "contrasting", "toAvoid"].map((k) => `pairingRecommendations.${k}`),
  ...["rulingPlanets", "zodiacAffinity"].map((k) => `astrologicalProfile.${k}`),
];

function at(value: unknown, path: string): unknown {
  let current = value;
  for (const key of path.split(".")) current = isJsonRecord(current) ? current[key] : undefined;
  return current;
}

describe("parseIngredientDrawerResponse: the real catalog", (): void => {
  const entries = getIngredientCatalog().entries;

  it("accepts every catalog ingredient and keeps each read field except the documented deviations", (): void => {
    const classes: Record<string, number> = {};
    for (const entry of entries) {
      const raw = jsonOf(catalogRecord(entry));
      const { ingredient } = parseIngredientDrawerResponse(jsonOf({ ingredient: catalogRecord(entry) }));
      for (const path of READ_PATHS) {
        const before = at(raw, path);
        if (JSON.stringify(before) === JSON.stringify(at(ingredient, path))) continue;
        const shape = Array.isArray(before) ? "array" : typeof before;
        classes[`${path}:${shape}`] = (classes[`${path}:${shape}`] ?? 0) + 1;
      }
    }
    expect(entries.length).toBeGreaterThanOrEqual(1000);
    // [MEASURED 2026-11-12, 1,002 cards] These are the only real-data fields the parser drops, because
    // the producer sends a shape the drawer's own type never declared: seasonality as an object (12;
    // the drawer would have thrown rendering it), sensoryProfile.taste as a tag list (3), and
    // vitamins / minerals as name lists (85 / 73 incl. empty ones; the drawer would show their indices).
    const documented = ["nutritionalProfile.minerals:array", "nutritionalProfile.vitamins:array", "seasonality:object", "sensoryProfile.taste:array"];
    expect(Object.keys(classes).filter((key) => !documented.includes(key))).toEqual([]);
  });

  it("keeps every row of the real recipe index for every catalog slug", (): void => {
    let rows = 0;
    for (const { slug } of entries) {
      const matches = getRecipesForIngredient(slug);
      const related = matches.slice(0, 24).map((match) => buildRelatedIngredientRecipe(match, undefined));
      const body = jsonOf({ ingredient: null, relatedRecipes: related, recipesByCuisine: groupMatchesByCuisine(matches), totalRecipeMatches: matches.length });
      const out = parseIngredientDrawerResponse(body);
      const kept = Object.values(out.recipesByCuisine ?? {}).reduce((sum, group) => sum + group.length, 0);
      expect([slug, kept, out.relatedRecipes.length]).toEqual([slug, matches.length, related.length]);
      rows += kept;
    }
    expect(rows).toBeGreaterThan(0);
  });
});
