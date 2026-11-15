/**
 * Rejections, acceptances and pass-through for `parseCustomRecipeResponse`.
 * Every body is ONE realistic stored recipe with exactly one thing changed, and
 * the unchanged body is asserted to parse first, so a rejection can only be the
 * parser's. Non-finite numbers come from JSON TEXT (`1e999`), because
 * `JSON.stringify(Infinity)` is `null` and would test a different case.
 */
import { isJsonRecord } from "@/lib/api/json";
import { parseCustomRecipeResponse } from "../generatedRecipeParser";

type Patch = (recipe: Record<string, unknown>) => void;

const INF: unknown = JSON.parse("1e999");

const BASE_JSON = JSON.stringify({
  success: true,
  recipe: {
    id: "cosmic-1",
    name: "Moonlit Saffron Risotto",
    cuisine: "Italian",
    description: "A risotto.",
    prepTime: "45 min",
    cookTime: "20 min",
    numberOfServings: 4,
    mealType: ["dinner"],
    ingredients: [
      { id: "i-1", name: "rice", amount: 300, unit: "g", elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.6, Air: 0.1 }, surprise: "ingredient" },
    ],
    instructions: ["Toast.", "Stir."],
    elementalProperties: { Fire: 0.4, Water: 0.2, Earth: 0.3, Air: 0.1 },
    nutrition: { calories: 520, protein: 14, carbs: 88, fat: 11, fibre: 3 },
    alchemicalProperties: { totalKalchm: 1.2, monicaConstant: 7.25 },
    monicaOptimization: { optimizedMonica: 7.25, planetaryTimingRecommendations: ["Venus."], intensityModifications: ["lower-heat"], surprise: "monica" },
    seasonalAdaptation: { seasonalCookingMethodAdjustments: [{ method: "roast", adjustment: "longer", reason: "autumn", surprise: "adjustment" }], surprise: "season" },
    cuisineIntegration: { culturalNotes: ["Northern Italy."], surprise: "cuisine" },
    surprise: "top",
  },
});

function envelope(patch?: (envelope: Record<string, unknown>) => void): unknown {
  const parsed: unknown = JSON.parse(BASE_JSON);
  if (!isJsonRecord(parsed)) throw new Error("base is not a record");
  patch?.(parsed);
  return parsed;
}

function recipeWith(patch: Patch): unknown {
  return envelope((e) => patch(child(e, "recipe")));
}

function child(parent: Record<string, unknown>, key: string): Record<string, unknown> {
  const value = parent[key];
  if (!isJsonRecord(value)) throw new Error(`${key} is not a record in the base`);
  return value;
}

function firstRow(parent: Record<string, unknown>, key: string): Record<string, unknown> {
  const list = parent[key];
  const row: unknown = Array.isArray(list) ? list[0] : undefined;
  if (!isJsonRecord(row)) throw new Error(`${key}[0] is not a record in the base`);
  return row;
}

const REJECT: Array<[string, Patch, string]> = [
  ["id missing", (r) => { delete r.id; }, "id must be a string or a number"],
  ["id null", (r) => { r.id = null; }, "id must be a string or a number"],
  ["id an object", (r) => { r.id = {}; }, "id must be a string or a number"],
  ["id Infinity", (r) => { r.id = INF; }, "id must be a string or a number"],
  ["name missing", (r) => { delete r.name; }, "name must be a string"],
  ["name a number", (r) => { r.name = 5; }, "name must be a string"],
  ["ingredients missing", (r) => { delete r.ingredients; }, "ingredients must be an array"],
  ["ingredients a string", (r) => { r.ingredients = "rice"; }, "ingredients must be an array"],
  ["ingredient row null", (r) => { r.ingredients = [null]; }, "ingredients[0] must be an object"],
  ["ingredient name missing", (r) => { delete firstRow(r, "ingredients").name; }, "ingredients[0].name must be a string"],
  ["ingredient name a number", (r) => { firstRow(r, "ingredients").name = 5; }, "ingredients[0].name must be a string"],
  ["ingredient id a boolean", (r) => { firstRow(r, "ingredients").id = true; }, "ingredients[0].id must be a string or a number"],
  ["ingredient amount a boolean", (r) => { firstRow(r, "ingredients").amount = true; }, "ingredients[0].amount must be a number or a string"],
  ["ingredient amount Infinity", (r) => { firstRow(r, "ingredients").amount = INF; }, "ingredients[0].amount must be a number or a string"],
  ["ingredient unit a number", (r) => { firstRow(r, "ingredients").unit = 5; }, "ingredients[0].unit must be a string"],
  ["ingredient elementalProperties a string", (r) => { firstRow(r, "ingredients").elementalProperties = "hot"; }, "ingredients[0].elementalProperties must be an object"],
  ["ingredient element entry a string", (r) => { child(firstRow(r, "ingredients"), "elementalProperties").Fire = "x"; }, "ingredients[0].elementalProperties.Fire must be a finite number or null"],
  ["instructions missing", (r) => { delete r.instructions; }, "instructions must be an array"],
  ["instructions an object", (r) => { r.instructions = {}; }, "instructions must be an array"],
  ["instruction entry an object", (r) => { r.instructions = [{ step: "x" }]; }, "instructions must hold only strings"],
  ["elementalProperties missing", (r) => { delete r.elementalProperties; }, "elementalProperties must be an object"],
  ["elementalProperties an array", (r) => { r.elementalProperties = []; }, "elementalProperties must be an object"],
  ["element entry a string", (r) => { child(r, "elementalProperties").Water = "x"; }, "elementalProperties.Water must be a finite number or null"],
  ["element entry Infinity", (r) => { child(r, "elementalProperties").Air = INF; }, "elementalProperties.Air must be a finite number or null"],
  ["monicaOptimization missing", (r) => { delete r.monicaOptimization; }, "monicaOptimization must be an object"],
  ["monicaOptimization an array", (r) => { r.monicaOptimization = []; }, "monicaOptimization must be an object"],
  ["optimizedMonica missing", (r) => { delete child(r, "monicaOptimization").optimizedMonica; }, "optimizedMonica must be a finite number"],
  ["optimizedMonica a string", (r) => { child(r, "monicaOptimization").optimizedMonica = "7"; }, "optimizedMonica must be a finite number"],
  ["optimizedMonica null", (r) => { child(r, "monicaOptimization").optimizedMonica = null; }, "optimizedMonica must be a finite number"],
  ["optimizedMonica Infinity", (r) => { child(r, "monicaOptimization").optimizedMonica = INF; }, "optimizedMonica must be a finite number"],
  ["planetaryTimingRecommendations missing", (r) => { delete child(r, "monicaOptimization").planetaryTimingRecommendations; }, "planetaryTimingRecommendations must be an array"],
  ["planetaryTimingRecommendations a string", (r) => { child(r, "monicaOptimization").planetaryTimingRecommendations = "Venus"; }, "planetaryTimingRecommendations must be an array"],
  ["planetaryTimingRecommendations holds a number", (r) => { child(r, "monicaOptimization").planetaryTimingRecommendations = [1]; }, "planetaryTimingRecommendations must hold only strings"],
  ["intensityModifications missing", (r) => { delete child(r, "monicaOptimization").intensityModifications; }, "intensityModifications must be an array"],
  ["intensityModifications holds null", (r) => { child(r, "monicaOptimization").intensityModifications = [null]; }, "intensityModifications must hold only strings"],
  ["seasonalAdaptation missing", (r) => { delete r.seasonalAdaptation; }, "seasonalAdaptation must be an object"],
  ["adjustments missing", (r) => { delete child(r, "seasonalAdaptation").seasonalCookingMethodAdjustments; }, "seasonalCookingMethodAdjustments must be an array"],
  ["adjustments a string", (r) => { child(r, "seasonalAdaptation").seasonalCookingMethodAdjustments = "roast"; }, "seasonalCookingMethodAdjustments must be an array"],
  ["adjustment row null", (r) => { child(r, "seasonalAdaptation").seasonalCookingMethodAdjustments = [null]; }, "seasonalCookingMethodAdjustments[0] must be an object"],
  ["adjustment method a number", (r) => { firstRow(child(r, "seasonalAdaptation"), "seasonalCookingMethodAdjustments").method = 5; }, "[0].method must be a string"],
  ["adjustment adjustment missing", (r) => { delete firstRow(child(r, "seasonalAdaptation"), "seasonalCookingMethodAdjustments").adjustment; }, "[0].adjustment must be a string"],
  ["adjustment reason null", (r) => { firstRow(child(r, "seasonalAdaptation"), "seasonalCookingMethodAdjustments").reason = null; }, "[0].reason must be a string"],
  ["cuisineIntegration missing", (r) => { delete r.cuisineIntegration; }, "cuisineIntegration must be an object"],
  ["culturalNotes missing", (r) => { delete child(r, "cuisineIntegration").culturalNotes; }, "culturalNotes must be an array"],
  ["culturalNotes a string", (r) => { child(r, "cuisineIntegration").culturalNotes = "Italy"; }, "culturalNotes must be an array"],
  ["culturalNotes holds a number", (r) => { child(r, "cuisineIntegration").culturalNotes = [5]; }, "culturalNotes must hold only strings"],
];

const OPTIONAL: Array<[string, string, unknown[], unknown[]]> = [
  ["cuisine", "cuisine", ["Fusion", null], [5, {}, []]],
  ["description", "description", ["Soup.", null], [5, {}]],
  ["prepTime", "prepTime", ["10 min", null], [10, {}]],
  ["cookTime", "cookTime", ["10 min", null], [10, {}]],
  ["numberOfServings", "numberOfServings", [4, "4 bowls", null], [{}, true, INF]],
  ["mealType", "mealType", ["lunch", ["a", "b"], [], null], [5, [5], {}]],
  ["nutrition", "nutrition", [null, {}, { calories: 1 }], ["x", [], { protein: "9" }, { carbs: "9" }, { fat: INF }, { calories: "9" }]],
  ["alchemicalProperties", "alchemicalProperties", [null, {}, { monicaConstant: null }, { monicaConstant: 7 }], ["x", { monicaConstant: "7" }, { monicaConstant: INF }]],
];

describe("parseCustomRecipeResponse guards", () => {
  it("CONTROL: the unchanged stored recipe parses and serialises to the same bytes", () => {
    const body = envelope();
    const parsed = parseCustomRecipeResponse(body);
    expect(parsed).not.toBeNull();
    expect(JSON.stringify(parsed)).toBe(JSON.stringify(isJsonRecord(body) ? body.recipe : undefined));
  });

  it.each(REJECT)("rejects: %s", (_name, patch, fragment) => {
    expect(() => parseCustomRecipeResponse(recipeWith(patch))).toThrow(fragment);
  });

  describe.each(OPTIONAL)("optional %s", (_label, key, accepted, rejected) => {
    it.each(accepted.map((value) => [value]))("accepts %j and keeps it as sent", (value) => {
      const parsed = parseCustomRecipeResponse(recipeWith((r) => { r[key] = value; }));
      expect(JSON.stringify(parsed)).toBe(JSON.stringify(parseSent(recipeWith((r) => { r[key] = value; }))));
    });
    it.each(rejected.map((value) => [value]))("rejects %j", (value) => {
      expect(() => parseCustomRecipeResponse(recipeWith((r) => { r[key] = value; }))).toThrow(`${key}`);
    });
  });

  describe("pass-through", () => {
    it("keys the page never reads survive at every level, in place", () => {
      const parsed = parseCustomRecipeResponse(envelope());
      expect(parsed).toHaveProperty("surprise", "top");
      expect(parsed).toHaveProperty("ingredients.0.surprise", "ingredient");
      expect(parsed).toHaveProperty("monicaOptimization.surprise", "monica");
      expect(parsed).toHaveProperty("seasonalAdaptation.surprise", "season");
      expect(parsed).toHaveProperty("seasonalAdaptation.seasonalCookingMethodAdjustments.0.surprise", "adjustment");
      expect(parsed).toHaveProperty("cuisineIntegration.surprise", "cuisine");
      expect(parsed).toHaveProperty("nutrition.fibre", 3);
      expect(parsed).toHaveProperty("alchemicalProperties.totalKalchm", 1.2);
    });

    it("an absent optional field stays ABSENT: no undefined-valued keys appear on the recipe or its rows", () => {
      const absent: Patch = (r) => {
        for (const key of ["cuisine", "description", "prepTime", "cookTime", "numberOfServings", "mealType", "nutrition", "alchemicalProperties"]) delete r[key];
        const row = firstRow(r, "ingredients");
        for (const key of ["id", "amount", "unit", "elementalProperties"]) delete row[key];
      };
      const body = recipeWith(absent);
      expect(parseCustomRecipeResponse(body)).toStrictEqual(isJsonRecord(body) ? body.recipe : undefined);
    });

    it("an ingredient with elementalProperties: null is accepted and kept as null (the page's row accepts null)", () => {
      const body = recipeWith((r) => { firstRow(r, "ingredients").elementalProperties = null; });
      expect(parseCustomRecipeResponse(body)).toHaveProperty("ingredients.0.elementalProperties", null);
    });

    it("an ingredient with id: null is accepted and kept as null (the page keys its rows by id ?? index)", () => {
      const body = recipeWith((r) => { firstRow(r, "ingredients").id = null; });
      expect(parseCustomRecipeResponse(body)).toHaveProperty("ingredients.0.id", null);
    });

    it("a literal __proto__ key inside an element map survives (assignment would have lost it)", () => {
      const hostile: unknown = JSON.parse('{"__proto__":0.5,"Fire":1}');
      const body = recipeWith((r) => { r.elementalProperties = hostile; firstRow(r, "ingredients").elementalProperties = hostile; });
      const parsed = parseCustomRecipeResponse(body);
      expect(Object.keys(parsed?.elementalProperties ?? {})).toContain("__proto__");
      expect(Object.keys(parsed?.ingredients[0]?.elementalProperties ?? {})).toContain("__proto__");
      expect(JSON.stringify(parsed)).toBe(JSON.stringify(isJsonRecord(body) ? body.recipe : undefined));
    });

    it("an explicit null is kept as null, not dropped", () => {
      const parsed = parseCustomRecipeResponse(recipeWith((r) => { r.cuisine = null; r.nutrition = null; }));
      expect(parsed).toHaveProperty("cuisine", null);
      expect(parsed).toHaveProperty("nutrition", null);
    });

    it("the input is not mutated", () => {
      const body = envelope();
      const before = JSON.stringify(body);
      parseCustomRecipeResponse(body);
      expect(JSON.stringify(body)).toBe(before);
    });
  });

  describe("the envelope", () => {
    it.each([["null", JSON.parse("null")], ["an array", []], ["a string", "x"], ["a number", 7], ["a boolean", true]])(
      "throws for a body that is %s",
      (_name, value) => {
        expect(() => parseCustomRecipeResponse(value)).toThrow("expected a JSON object");
      },
    );
    it.each([
      ["success false", (e: Record<string, unknown>) => { e.success = false; }],
      ["success missing", (e: Record<string, unknown>) => { delete e.success; }],
      ["success 1", (e: Record<string, unknown>) => { e.success = 1; }],
      ["recipe missing", (e: Record<string, unknown>) => { delete e.recipe; }],
      ["recipe null", (e: Record<string, unknown>) => { e.recipe = null; }],
    ])("answers null (no recipe) for %s", (_name, patch) => {
      expect(parseCustomRecipeResponse(envelope(patch))).toBeNull();
    });
    it.each([[[]], ["recipe"], [7]])("throws for a recipe that is %j", (value) => {
      expect(() => parseCustomRecipeResponse(envelope((e) => { e.recipe = value; }))).toThrow("recipe must be an object");
    });
  });
});

function parseSent(body: unknown): unknown {
  return isJsonRecord(body) ? body.recipe : undefined;
}
