/**
 * Companion to ingredientDrawerParser.test.ts (kept apart because that file sits at
 * the line ceiling). It pins guards the main suite leaves open, each paired with a
 * control (the identical body with that one value valid must pass):
 *   - substitutions: a wrong-typed `name`, `rationale` or `type` drops the row;
 *   - storage.temperature: a record missing either scale is dropped, never half-kept;
 *   - finite-number policy: a hand-crafted `1e999` (Infinity) is dropped like any other
 *     mistyped optional field, drops a cuisine-match row whose `amount` it is, and makes
 *     `totalRecipeMatches` throw. JSON.stringify turns Infinity into null, so those
 *     bodies are built as JSON TEXT (a token swapped for `1e999`) and then parsed.
 */
import { parseIngredientDrawerResponse } from "../ingredientDrawerParser";

type Parsed = ReturnType<typeof parseIngredientDrawerResponse>;

const jsonOf = (value: unknown): unknown => JSON.parse(JSON.stringify(value));

const INGREDIENT = {
  name: "Garlic",
  category: "vegetables",
  kalchm: 1.25,
  elementalProperties: { Fire: 0.4, Water: 0.1, Earth: 0.3, Air: 0.2 },
  storage: { container: "mesh bag", temperature: { fahrenheit: 60, celsius: 15 } },
};
const SUBSTITUTION = { name: "shallot", rationale: "Shares flavor affinity with Garlic.", type: "complementary" };
const MATCH = { recipeId: "r1", recipeName: "Aioli", amount: 2, unit: "clove" };
const SIBLING = { recipeId: "r2", recipeName: "Toum", amount: "1 head" };

/** The 200 body of route.ts:125-134; `extra` overrides keys (`undefined` removes one). */
function producerBody(extra: Record<string, unknown> = {}): unknown {
  return jsonOf({
    success: true,
    ingredient: { ...INGREDIENT, description: "unread" },
    slug: "garlic",
    relatedRecipes: [{ id: "r1", name: "Aioli" }],
    recipesByCuisine: { french: [{ ...MATCH, cuisine: "french" }] },
    substitutions: [SUBSTITUTION],
    totalRecipeMatches: 2,
    ...extra,
  });
}
const parseWith = (extra: Record<string, unknown>): Parsed => parseIngredientDrawerResponse(producerBody(extra));
const ingredientWith = (fields: Record<string, unknown>): Parsed["ingredient"] =>
  parseWith({ ingredient: { name: "Garlic", ...fields } }).ingredient;

/** Stands in for Infinity in a body: swapped for the JSON text `1e999` before parsing. */
const INF = "__INF__";

/** `JSON.parse` of text holding `1e999`, which yields a real Infinity (stringify would give null). */
function infinityWire(extra: Record<string, unknown>): unknown {
  const text = JSON.stringify(producerBody(extra)).split(`"${INF}"`).join("1e999");
  if (!text.includes("1e999") || text.includes(INF)) throw new Error("the fixture holds no Infinity token");
  return JSON.parse(text);
}
const parseInfinite = (extra: Record<string, unknown>): Parsed => parseIngredientDrawerResponse(infinityWire(extra));

describe("parseIngredientDrawerResponse: the Infinity fixture is real", (): void => {
  it("parses 1e999 JSON text to Infinity, which JSON.stringify would have turned into null", (): void => {
    const wire = infinityWire({ totalRecipeMatches: INF });
    expect(JSON.stringify(wire)).toContain('"totalRecipeMatches":null');
    expect(() => parseIngredientDrawerResponse(wire)).toThrow(/totalRecipeMatches was not a number/);
  });
});

describe("parseIngredientDrawerResponse: a substitution with one wrong-typed string", (): void => {
  const MESSAGE = /No ingredient response substitutions row matched/;

  it.each([["name"], ["rationale"], ["type"]])("drops the row whose `%s` is a number, and throws when it was the only row", (field): void => {
    const bad = { ...SUBSTITUTION, [field]: 5 };
    expect(() => parseWith({ substitutions: [bad] })).toThrow(MESSAGE);
    expect(parseWith({ substitutions: [SUBSTITUTION] }).substitutions).toEqual([SUBSTITUTION]);
    expect(parseWith({ substitutions: [bad, SUBSTITUTION] }).substitutions).toEqual([SUBSTITUTION]);
  });

  it.each([["name"], ["rationale"], ["type"]])("treats a null `%s` the same way as a mistyped one", (field): void => {
    expect(() => parseWith({ substitutions: [{ ...SUBSTITUTION, [field]: null }] })).toThrow(MESSAGE);
  });
});

describe("parseIngredientDrawerResponse: a storage temperature record needs both scales", (): void => {
  const container = { container: "mesh bag" };
  const storageWith = (temperature: unknown): Parsed["ingredient"] =>
    ingredientWith({ storage: { ...container, temperature } });

  it.each([
    ["celsius without fahrenheit", { celsius: 4 }],
    ["fahrenheit without celsius", { fahrenheit: 40 }],
  ])("drops the temperature (and only it) for %s", (_label, temperature): void => {
    const storage = storageWith(temperature)?.storage;
    expect(storage).toEqual(container);
    expect(Object.keys(storage ?? {})).not.toContain("temperature");
  });

  it("keeps a temperature carrying both scales: the control for the two drops above", (): void => {
    const pair = { fahrenheit: 40, celsius: 4 };
    expect(storageWith(pair)?.storage).toEqual({ ...container, temperature: pair });
  });

  it("keeps a free-text temperature, and keeps both scales when they are zero", (): void => {
    expect(storageWith("cool")?.storage).toEqual({ ...container, temperature: "cool" });
    const zero = { fahrenheit: 0, celsius: 0 };
    expect(storageWith(zero)?.storage).toEqual({ ...container, temperature: zero });
  });
});

/** [label, field, wire value holding an Infinity token, finite control, what the parser keeps instead]. */
const FINITE_CASES: Array<[string, string, unknown, unknown, unknown]> = [
  ["kalchm", "kalchm", INF, 1.5, undefined],
  ["monica", "monica", INF, 0.5, undefined],
  ["calories", "nutritionalProfile", { calories: INF, source: "USDA" }, { calories: 4, source: "USDA" }, { source: "USDA" }],
  ["a macro", "nutritionalProfile", { macros: { protein: INF, carbs: 1 } }, { macros: { protein: 0.2, carbs: 1 } }, { macros: { carbs: 1 } }],
  ["an elemental leaf", "elementalProperties", { Fire: INF, Water: 0.1 }, { Fire: 0.4, Water: 0.1 }, { Water: 0.1 }],
  ["an alchemical leaf", "alchemicalProperties", { Spirit: INF, Matter: 0.2 }, { Spirit: 0.5, Matter: 0.2 }, { Matter: 0.2 }],
  ["a flavor entry", "flavorProfile", { sweet: INF, bitter: 0.2 }, { sweet: 0.5, bitter: 0.2 }, { bitter: 0.2 }],
  ["a taste entry", "sensoryProfile", { taste: { sweet: INF, bitter: 0.2 } }, { taste: { sweet: 0.5, bitter: 0.2 } }, { taste: { bitter: 0.2 } }],
  [
    "a fahrenheit temperature",
    "storage",
    { container: "bag", temperature: { fahrenheit: INF, celsius: 4 } },
    { container: "bag", temperature: { fahrenheit: 40, celsius: 4 } },
    { container: "bag" },
  ],
  [
    "a celsius temperature",
    "storage",
    { container: "bag", temperature: { fahrenheit: 40, celsius: INF } },
    { container: "bag", temperature: { fahrenheit: 40, celsius: 4 } },
    { container: "bag" },
  ],
];

describe("parseIngredientDrawerResponse: finite-number policy", (): void => {
  it.each(FINITE_CASES)("drops %s given as 1e999, and keeps the finite control", (_label, field, infinite, control, kept): void => {
    const dropped = parseInfinite({ ingredient: { name: "Garlic", [field]: infinite } }).ingredient;
    expect(dropped).toEqual({ name: "Garlic", [field]: kept });
    expect(ingredientWith({ [field]: control })).toEqual({ name: "Garlic", [field]: control });
  });

  it("drops a cuisine-match row whose amount is 1e999, and throws when it was the only row", (): void => {
    const infinite = { ...MATCH, amount: INF };
    expect(() => parseInfinite({ recipesByCuisine: { french: [infinite] } })).toThrow(/row matched/);
    expect(parseWith({ recipesByCuisine: { french: [MATCH] } }).recipesByCuisine).toEqual({ french: [MATCH] });
    const mixed = parseInfinite({ recipesByCuisine: { french: [infinite, SIBLING] } }).recipesByCuisine;
    expect(mixed).toEqual({ french: [SIBLING] });
  });

  it("throws on a totalRecipeMatches of 1e999, and keeps a finite one", (): void => {
    expect(() => parseInfinite({ totalRecipeMatches: INF })).toThrow(/totalRecipeMatches was not a number/);
    expect(parseWith({ totalRecipeMatches: 24 }).totalRecipeMatches).toBe(24);
  });

  it("keeps a zero and a negative finite number, which the policy must not mistake for non-finite", (): void => {
    expect(ingredientWith({ kalchm: 0, monica: -2 })).toEqual({ name: "Garlic", kalchm: 0, monica: -2 });
    expect(parseWith({ totalRecipeMatches: 0 }).totalRecipeMatches).toBe(0);
  });
});
