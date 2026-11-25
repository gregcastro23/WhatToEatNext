/**
 * The method search: reading the query, choosing a guide and a method, and
 * answering honestly when nothing tested covers the request.
 *
 * @jest-environment node
 */
import { getServerRecipes } from "@/actions/recipes";
import { answerMethodQuery } from "@/lib/cooking/methodSearch/answer";
import { matchGuides } from "@/lib/cooking/methodSearch/matchGuides";
import { parseMethodQuery } from "@/lib/cooking/methodSearch/parseMethodQuery";
import { pickMethod } from "@/lib/cooking/methodSearch/pickMethod";
import { buildIndexForRecipes } from "@/lib/search/loader";
import { MethodAnswerSchema } from "@/lib/validation/methodSearchSchemas";
import { fixtureGuide } from "./helpers/foodGuide";
import type { SearchIndex } from "@/lib/search/searchIndex";

const GUIDES = [
  fixtureGuide("bacon", "Bacon", ["bacon strips"], ["oven_bake", "pan_fry"], ["bacon"]),
  fixtureGuide("chicken-breast", "Chicken breast", ["chicken breasts"], ["roast", "grill"], ["chicken"]),
  fixtureGuide("chicken-thighs", "Chicken thighs", [], ["roast", "braise"], ["chicken"]),
];

let index: SearchIndex;

beforeAll(async () => {
  index = buildIndexForRecipes(await getServerRecipes());
}, 120_000);

const answer = (query: string): ReturnType<typeof answerMethodQuery> => {
  const result = answerMethodQuery({ guides: GUIDES, index }, query);
  expect(MethodAnswerSchema.safeParse(result).success).toBe(true);
  return result;
};

describe("parseMethodQuery", () => {
  it.each([
    ["baking bacon", "oven_bake", "bacon"],
    ["how to cook salmon", null, "salmon"],
    ["air fry chicken thighs", "air_fry", "chicken thighs"],
    ["deep fried shrimp", "deep_fry", "shrimp"],
    ["best way to make brown rice", null, "brown rice"],
    ["bacon in the oven", "oven_bake", "bacon"],
    ["grilled strawberries", "grill", "strawberries"],
    ["pan seared salmon", "pan_fry", "salmon"],
  ])("%s", (query, method, food) => {
    expect(parseMethodQuery(query)).toMatchObject({ method, food });
  });
});

describe("matchGuides and pickMethod", () => {
  it("prefers an exact name or alias", () => {
    expect(matchGuides("bacon", GUIDES).map((guide) => guide.id)).toEqual(["bacon"]);
    expect(matchGuides("chicken breasts", GUIDES).map((guide) => guide.id)).toEqual(["chicken-breast"]);
  });

  it("offers every guide a broad word fits", () => {
    expect(matchGuides("chicken", GUIDES)).toHaveLength(2);
    expect(matchGuides("tofu", GUIDES)).toHaveLength(0);
  });

  it("says when it shows a near or recommended method instead", () => {
    const [bacon] = GUIDES;
    if (!bacon) throw new Error("fixture missing");
    expect(pickMethod(bacon, "oven_bake")).toMatchObject({ method: { id: "oven_bake" }, note: null });
    expect(pickMethod(bacon, "roast")?.note).toMatch(/closest tested method/);
    expect(pickMethod(bacon, "grill")?.note).toMatch(/no tested instructions for grilling bacon/);
  });
});

describe("answerMethodQuery", () => {
  it("answers baking bacon with the bacon guide at the oven method", () => {
    expect(answer("baking bacon")).toMatchObject({ kind: "guide", selected: "oven_bake", note: null, guide: { id: "bacon" } });
  });

  it("asks which cut for a broad food, keeping the method", () => {
    const result = answer("roast chicken");
    expect(result).toMatchObject({ kind: "choose" });
    if (result.kind === "choose") expect(result.choices[0]?.query).toBe("roast chicken breast");
  });

  it("links an unguided ingredient and gives general method information", () => {
    const result = answer("steaming broccoli");
    expect(result).toMatchObject({ kind: "general", method: { id: "steaming" } });
    if (result.kind === "general") {
      expect(result.note).toBe("There is no tested guide for steaming broccoli yet.");
      expect(result.links[0]?.href).toBe("/ingredients/broccoli");
    }
  });

  it("recognises a recipe by name", () => {
    const result = answer("pad thai");
    expect(result.kind).toBe("general");
    if (result.kind === "general") expect(result.links[0]?.href).toMatch(/^\/recipes\//);
  });

  it("treats fried rice as a dish, not a request to fry rice", () => {
    const result = answer("fried rice");
    expect(result.kind).toBe("general");
    if (result.kind === "general") expect(result.links[0]?.href).toMatch(/^\/recipes\//);
  });

  it("answers a method alone with the guides that use it", () => {
    const result = answer("roasting");
    expect(result).toMatchObject({ kind: "general", method: { id: "roasting" } });
    if (result.kind === "general") expect(result.suggestions.map((item) => item.query)).toContain("roasting chicken thighs");
  });
});
