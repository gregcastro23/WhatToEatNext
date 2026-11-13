/**
 * @jest-environment node
 *
 * Companion to cuisineRecommendParser.test.ts (kept apart because that file sits at
 * the line ceiling). It pins two guards the main suite leaves open:
 *   - the host's fallback order between the 4th candidate (`cuisineRecommendations`)
 *     and the 5th (`recommendations` as an array): when both are arrays, the 4th wins;
 *   - each of the three nested-recipe string guards (`recipe_id`, `id`, `name`) in
 *     isolation: one wrong-typed field drops the whole cuisine entry, and JSON null
 *     reads as absent.
 * Every rejection is paired with a control: the same body with that one value valid
 * must pass, so the rejection is the parser's doing and not the fixture's.
 */
import { parseCuisineRecommendResponse, type CuisineRecommendResponse } from "../cuisineRecommendParser";

const NO_MATCH = "No cuisine in the recommend response matched the expected shape";

/** The parser reads `response.json()`, so every body goes through a JSON round trip. */
function parse(body: Record<string, unknown>): CuisineRecommendResponse {
  const wire: unknown = JSON.parse(JSON.stringify(body));
  return parseCuisineRecommendResponse(wire);
}

/** A success body whose only list is one cuisine carrying the given nested recipes. */
function withNested(nested: unknown[]): Record<string, unknown> {
  return { success: true, cuisines: [{ name: "Italian", nested_recipes: nested }] };
}

describe("parseCuisineRecommendResponse: candidate order between the 4th and 5th list", (): void => {
  it("selects `cuisineRecommendations` over a `recommendations` array when both are present", (): void => {
    const out = parse({ success: true, cuisineRecommendations: ["D"], recommendations: ["E"] });
    expect(out.cuisines).toEqual(["D"]);
  });

  it("selects `recommendations` (an array) when it is the only candidate: the control for the order", (): void => {
    const out = parse({ success: true, recommendations: ["E"] });
    expect(out.cuisines).toEqual(["E"]);
  });

  it("lets an empty 4th candidate shadow a non-empty 5th, because the first array wins even when empty", (): void => {
    const out = parse({ success: true, cuisineRecommendations: [], recommendations: ["E"] });
    expect(out.cuisines).toEqual([]);
  });
});

describe("parseCuisineRecommendResponse: each nested-recipe string guard drops the cuisine entry", (): void => {
  const VALID_ROW = { recipe_id: "r", id: "9", name: "Cacio e Pepe" };

  it.each([
    ["recipe_id", 9],
    ["id", 9],
    ["name", 9],
  ])("throws when the sole entry's nested `%s` is a number", (field, bad): void => {
    expect(() => parse(withNested([{ ...VALID_ROW, [field]: bad }]))).toThrow(NO_MATCH);
    // control: the identical body with that one field a string keeps the nested row
    const control = parse(withNested([{ ...VALID_ROW, [field]: "ok" }]));
    expect(control.cuisines).toHaveLength(1);
    expect(control.cuisines[0]).toMatchObject({ name: "Italian", nested_recipes: [{ [field]: "ok" }] });
  });

  it("throws on the minimal shape of the finding: `{recipe_id: \"r\", id: 9}` as the only nested row", (): void => {
    expect(() => parse(withNested([{ recipe_id: "r", id: 9 }]))).toThrow(NO_MATCH);
    expect(parse(withNested([{ recipe_id: "r", id: "9" }])).cuisines).toEqual([
      { name: "Italian", nested_recipes: [{ recipe_id: "r", id: "9" }] },
    ]);
  });

  it("drops only the mistyped entry when a valid sibling entry is present", (): void => {
    const out = parse({
      success: true,
      cuisines: [
        { name: "Italian", nested_recipes: [{ recipe_id: "r", id: 9 }] },
        { name: "Thai", cuisine_id: "thai" },
      ],
    });
    expect(out.cuisines).toEqual([{ name: "Thai", cuisine_id: "thai" }]);
  });

  it("keeps a good nested row beside a bad one in the same entry (the entry survives on its good row)", (): void => {
    const out = parse(withNested([{ recipe_id: "r", id: 9 }, { recipe_id: "s", id: "10" }]));
    expect(out.cuisines).toEqual([{ name: "Italian", nested_recipes: [{ recipe_id: "s", id: "10" }] }]);
  });
});

describe("parseCuisineRecommendResponse: JSON null in a nested recipe reads as absent", (): void => {
  it.each([["recipe_id"], ["id"], ["name"]])("keeps the entry and omits `%s` when it is null", (field): void => {
    const row = { recipe_id: "r", id: "9", name: "n", [field]: null };
    const out = parse(withNested([row]));
    const kept = { recipe_id: "r", id: "9", name: "n" };
    const expected = Object.fromEntries(Object.entries(kept).filter(([key]) => key !== field));
    expect(out.cuisines).toStrictEqual([{ name: "Italian", nested_recipes: [expected] }]);
  });

  it("omits a null nested `id` while keeping the rest of the row (control: a string `id` is kept)", (): void => {
    const nulled = parse(withNested([{ recipe_id: "r", id: null }]));
    expect(nulled.cuisines).toStrictEqual([{ name: "Italian", nested_recipes: [{ recipe_id: "r" }] }]);
    const present = parse(withNested([{ recipe_id: "r", id: "9" }]));
    expect(present.cuisines).toStrictEqual([{ name: "Italian", nested_recipes: [{ recipe_id: "r", id: "9" }] }]);
  });
});
