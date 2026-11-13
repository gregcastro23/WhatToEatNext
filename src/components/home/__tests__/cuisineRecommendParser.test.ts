/**
 * @jest-environment node
 *
 * Fixtures mirror what `src/app/api/cuisines/recommend/route.ts` really builds.
 * The backend branch is the route's own `parseCuisinesResponse` run over the
 * measured Railway capture (`railwayCuisinesFixture`), then the body the route
 * assembles at route.ts:236-251. The local branch is built the way
 * `computeLocalRecommendations` does (route.ts:185-201, :254-262) with the real
 * `elementalSignature`. Every rejection is paired with a control: the same body
 * with that one field valid must pass, so the rejection is the parser's doing.
 */
import { isJsonRecord, readJson } from "@/lib/api/json";
import { parseCuisinesResponse } from "@/lib/validation/railway";
import { elementalSignature } from "@/utils/elemental/signature";
import { RAILWAY_CUISINES_RECOMMEND, withoutSky } from "../../../__tests__/helpers/railwayCuisinesFixture";
import { parseCuisineRecommendResponse, type CuisineRecommendResponse } from "../cuisineRecommendParser";

const NOT_OBJECT = "Cuisine recommend response was not a JSON object";
const NO_SUCCESS = "Cuisine recommend response had no boolean success";
const NO_MATCH = "No cuisine in the recommend response matched the expected shape";
const BAD_COUNTS = "Cuisine recommend response had a mistyped recipeCounts";
const BAD_PERSONALIZED = "Cuisine recommend response had a non-boolean personalized";
const RECIPE_COUNTS = { italian: 120, thai: 41, vietnamese: 41 };
const SKY = { Fire: 5, Water: 3, Earth: 1, Air: 1 };
// route.ts:48-53, the `cuisines` of each element
const CUISINES_BY_ELEMENT: Record<string, string[]> = {
  Fire: ["Mexican", "Indian", "African", "Thai", "Korean"],
  Water: ["Japanese", "Vietnamese", "Greek", "Korean", "French"],
};
const ITALIAN = {
  name: "Italian",
  cuisine_id: "italian",
  compatibility_reason: "Elemental match with today's sky: 85%",
  nested_recipes: [{ recipe_id: "r-1", name: "Cacio e Pepe" }],
};
const THAI = { name: "Thai", cuisine_id: "thai" };

/** `NextResponse.json` serialises with JSON.stringify, so `undefined` keys vanish. */
function overTheWire(body: Record<string, unknown>): Record<string, unknown> {
  const wire: unknown = JSON.parse(JSON.stringify(body));
  if (!isJsonRecord(wire)) throw new Error("the route's body is not a JSON object");
  return wire;
}

/** The body at route.ts:236-251 for a Railway answer that passes the route's schema. */
function backendBranchBody(raw: unknown): Record<string, unknown> {
  const backendData = parseCuisinesResponse(raw);
  if (!backendData) throw new Error("fixture fails the route's own schema");
  return overTheWire({
    success: true,
    source: "backend",
    personalized: false,
    dominantElement: backendData.dominantElement,
    secondaryElement: backendData.secondaryElement,
    recommendations: backendData.recommendations,
    elementDistribution: backendData.elementDistribution,
    cuisines: backendData.cuisines,
    topCuisines: backendData.topCuisines,
    cuisineRecommendations: backendData.cuisine_recommendations,
    recipeCounts: RECIPE_COUNTS,
    calculatedAt: "2026-11-12T10:00:00.000Z",
  });
}

/** The body at route.ts:254-262: `computeLocalRecommendations` (:185-201) plus the counts. */
function localBranchBody(personalized = false): Record<string, unknown> {
  const sig = elementalSignature(SKY);
  const secondary = sig.ranked[1]?.element ?? sig.dominant;
  const pick = (element: string, n: number): string[] => (CUISINES_BY_ELEMENT[element] ?? []).slice(0, n);
  return overTheWire({
    success: true,
    source: "local",
    dominantElement: sig.dominant,
    secondaryElement: secondary,
    signature: { tier: sig.tier, coDominant: sig.coDominant, label: sig.label, shortLabel: sig.shortLabel },
    recommendations: {
      cuisines: [...pick(sig.dominant, 3), ...pick(secondary, 2)],
      cookingMethods: ["Grilling", "Roasting", "Steaming", "Poaching"],
      flavors: ["Spicy", "Smoky", "Bold", "Umami", "Briny", "Delicate"],
    },
    elementDistribution: SKY,
    personalized,
    recipeCounts: RECIPE_COUNTS,
    calculatedAt: "2026-11-12T10:00:00.000Z",
  });
}

function names(response: CuisineRecommendResponse): string[] {
  return response.cuisines.map((entry) => (typeof entry === "string" ? entry : (entry.name ?? entry.cuisine_id ?? "")));
}

/** The real backend key (route.ts:247), with the other lists left out. */
function backendList(list: unknown): Record<string, unknown> {
  return { success: true, source: "backend", cuisineRecommendations: list };
}

describe("parseCuisineRecommendResponse: the producer's real bodies", (): void => {
  it("parses the local branch's strings, counts and flags", (): void => {
    const parsed = parseCuisineRecommendResponse(localBranchBody());
    expect(parsed).toStrictEqual({
      success: true,
      source: "local",
      personalized: false,
      recipeCounts: RECIPE_COUNTS,
      cuisines: ["Mexican", "Indian", "African", "Japanese", "Vietnamese"],
    });
    // control: a biased request answers personalized: true
    expect(parseCuisineRecommendResponse(localBranchBody(true)).personalized).toBe(true);
  });

  it("parses the measured Railway capture through the route's backend branch", (): void => {
    const wire = backendBranchBody(RAILWAY_CUISINES_RECOMMEND);
    // witness precondition: the real backend sends ONLY cuisineRecommendations
    expect(Object.keys(wire).sort()).toStrictEqual([
      "calculatedAt", "cuisineRecommendations", "personalized", "recipeCounts", "source", "success",
    ]);
    const parsed = parseCuisineRecommendResponse(wire);
    expect(names(parsed)).toStrictEqual(["Vietnamese", "Chinese", "Thai"]);
    expect(parsed.source).toBe("backend");
    expect(parsed.personalized).toBe(false);
    expect(parsed.recipeCounts).toStrictEqual(RECIPE_COUNTS);
    expect(parsed.cuisines[0]).toStrictEqual({
      name: "Vietnamese",
      cuisine_id: "vietnamese",
      compatibility_reason: "Elemental match with today's sky: 85%",
      nested_recipes: [
        { recipe_id: "b7ab2a5d-00e2-4229-8618-769061886cd7", name: "Authentic Bánh Mì" },
        { recipe_id: "2119126c-894b-4365-a664-04953abbb31c", name: "Authentic Bánh Canh Cua (Vietnamese Crab Tapioca Noodles)" },
        { recipe_id: "20ced87b-55c6-486f-a594-21354af2dd0d", name: "Authentic Gỏi Gà Bắp Cải (Vietnamese Chicken and Cabbage Salad)" },
      ],
    });
  });

  it("reads the no-sky capture's null compatibility_reason as absent", (): void => {
    const parsed = parseCuisineRecommendResponse(backendBranchBody(withoutSky(RAILWAY_CUISINES_RECOMMEND)));
    expect(names(parsed)).toStrictEqual(["Chinese", "Thai", "Vietnamese"]);
    expect(parsed.cuisines[0]).not.toHaveProperty("compatibility_reason");
    // control: a non-null, non-string reason is not tolerated
    const bad = backendList([{ ...THAI, compatibility_reason: 7 }]);
    expect(() => parseCuisineRecommendResponse(bad)).toThrow(NO_MATCH);
  });

  it("parses real Response bodies through readJson, and a real JSON null body throws", async (): Promise<void> => {
    const local = await readJson(new Response(JSON.stringify(localBranchBody())), parseCuisineRecommendResponse);
    expect(names(local)).toHaveLength(5);
    await expect(readJson(new Response("null"), parseCuisineRecommendResponse)).rejects.toThrow(NOT_OBJECT);
  });

  it("reads the route's 500 refusal as success: false without validating anything else", (): void => {
    const refusal = { success: false, error: "Failed to compute recommendations" };
    const empty = { success: false, personalized: false, recipeCounts: {}, cuisines: [] };
    expect(parseCuisineRecommendResponse(refusal)).toStrictEqual(empty);
    // lists the host never reads on that path are not validated
    expect(parseCuisineRecommendResponse({ ...refusal, cuisines: [7], recipeCounts: "x" })).toStrictEqual(empty);
    // control: the same lists under success: true are rejected
    expect(() => parseCuisineRecommendResponse({ success: true, cuisines: [7] })).toThrow(NO_MATCH);
  });
});

describe("parseCuisineRecommendResponse: the body envelope", (): void => {
  it("rejects a real JSON null body", (): void => {
    const parsed: unknown = JSON.parse("null");
    expect(() => parseCuisineRecommendResponse(parsed)).toThrow(NOT_OBJECT);
    // control: an object body parses
    expect(parseCuisineRecommendResponse({ success: true }).cuisines).toStrictEqual([]);
  });

  it.each([[[]], ["text"], [7], [true]])("rejects a non-object body (%j)", (value): void => {
    expect(() => parseCuisineRecommendResponse(value)).toThrow(NOT_OBJECT);
  });

  it.each([["true"], [1], [null], [undefined]])("rejects a success of %j", (success): void => {
    expect(() => parseCuisineRecommendResponse({ success })).toThrow(NO_SUCCESS);
    // control: a boolean success passes
    expect(parseCuisineRecommendResponse({ success: true }).success).toBe(true);
  });

  it("omits a source that is not a string (the host only logs it)", (): void => {
    expect(parseCuisineRecommendResponse({ success: true, source: 7 })).not.toHaveProperty("source");
    expect(parseCuisineRecommendResponse({ success: true, source: "local" }).source).toBe("local");
  });

  it.each([["yes"], [null], [1]])("rejects a personalized of %j", (personalized): void => {
    expect(() => parseCuisineRecommendResponse({ success: true, personalized })).toThrow(BAD_PERSONALIZED);
    // control: a boolean passes, and absence is the host's false
    expect(parseCuisineRecommendResponse({ success: true, personalized: true }).personalized).toBe(true);
    expect(parseCuisineRecommendResponse({ success: true }).personalized).toBe(false);
  });
});

describe("parseCuisineRecommendResponse: recipeCounts", (): void => {
  it("keeps only finite numbers (1e999 is a real JSON Infinity)", (): void => {
    const counts: unknown = JSON.parse('{"italian": 1e999, "thai": 4, "greek": "7", "korean": null}');
    expect(isJsonRecord(counts) && counts.italian === Infinity).toBe(true);
    expect(parseCuisineRecommendResponse({ success: true, recipeCounts: counts }).recipeCounts).toStrictEqual({ thai: 4 });
  });

  it.each([[undefined], [null]])("reads %j as no counts", (recipeCounts): void => {
    expect(parseCuisineRecommendResponse({ success: true, recipeCounts }).recipeCounts).toStrictEqual({});
  });

  it.each([["12"], [[1, 2]], [7], [true]])("rejects a recipeCounts of %j", (recipeCounts): void => {
    expect(() => parseCuisineRecommendResponse({ success: true, recipeCounts })).toThrow(BAD_COUNTS);
    // control: an object of counts passes
    expect(parseCuisineRecommendResponse({ success: true, recipeCounts: { thai: 2 } }).recipeCounts).toStrictEqual({ thai: 2 });
  });
});

describe("parseCuisineRecommendResponse: which list is read", (): void => {
  const ALL = {
    recommendations: { cuisines: ["A"] },
    cuisines: ["B"],
    topCuisines: ["C"],
    cuisineRecommendations: ["D"],
  };

  it.each<[string, Record<string, unknown>, string]>([
    ["recommendations.cuisines", ALL, "A"],
    ["cuisines", { ...ALL, recommendations: undefined }, "B"],
    ["topCuisines", { ...ALL, recommendations: undefined, cuisines: undefined }, "C"],
    ["cuisineRecommendations", { cuisineRecommendations: ["D"] }, "D"],
    ["recommendations itself as an array", { recommendations: ["E"] }, "E"],
  ])("takes %s in the host's old order", (_label, body, expected): void => {
    expect(parseCuisineRecommendResponse({ success: true, ...body }).cuisines).toStrictEqual([expected]);
  });

  it("lets the first array win even when it is empty, as the host did", (): void => {
    expect(parseCuisineRecommendResponse({ success: true, recommendations: { cuisines: [] }, cuisines: ["Thai"] }).cuisines).toStrictEqual([]);
    // control: skipping a non-array falls through to the next list
    expect(parseCuisineRecommendResponse({ success: true, recommendations: { cuisines: "Italian" }, cuisines: ["Thai"] }).cuisines).toStrictEqual(["Thai"]);
  });

  it("does not validate a list the host would never read", (): void => {
    const shadowed = { success: true, recommendations: { cuisines: ["Italian"] }, cuisines: [7, null] };
    expect(parseCuisineRecommendResponse(shadowed).cuisines).toStrictEqual(["Italian"]);
    // control: the same garbage list, once it is the one selected, is rejected
    expect(() => parseCuisineRecommendResponse({ success: true, cuisines: [7, null] })).toThrow(NO_MATCH);
  });
});

describe("parseCuisineRecommendResponse: entries", (): void => {
  it("keeps strings and objects together, and treats an empty list as valid", (): void => {
    expect(names(parseCuisineRecommendResponse(backendList(["Korean", ITALIAN, THAI])))).toStrictEqual(["Korean", "Italian", "Thai"]);
    expect(parseCuisineRecommendResponse(backendList([])).cuisines).toStrictEqual([]);
  });

  it("reads null optional fields as absent, like the host's ??", (): void => {
    const entry = { name: "Italian", cuisine_id: null, compatibility_reason: null, nested_recipes: null };
    expect(parseCuisineRecommendResponse(backendList([entry])).cuisines).toStrictEqual([{ name: "Italian" }]);
  });

  it("keeps an entry named only by cuisine_id, and an empty nested list", (): void => {
    const entry = { cuisine_id: "thai", nested_recipes: [] };
    expect(parseCuisineRecommendResponse(backendList([entry])).cuisines).toStrictEqual([entry]);
  });

  it("drops only the unusable nested recipes of an entry", (): void => {
    const nested = [null, { recipe_id: "r-2", id: "x-2", name: "Pad Thai" }];
    const parsed = parseCuisineRecommendResponse(backendList([{ ...THAI, nested_recipes: nested }]));
    expect(parsed.cuisines).toStrictEqual([{ ...THAI, nested_recipes: [{ recipe_id: "r-2", id: "x-2", name: "Pad Thai" }] }]);
  });

  it.each<[string, Record<string, unknown>]>([
    ["name of the wrong type", { name: 5 }],
    ["cuisine_id of the wrong type", { cuisine_id: ["italian"] }],
    ["compatibility_reason of the wrong type", { compatibility_reason: 7 }],
    ["nested_recipes that is not a list", { nested_recipes: { recipe_id: "r-1" } }],
    ["nested_recipes with no usable row", { nested_recipes: [null, 4] }],
    ["a nested recipe_id of the wrong type", { nested_recipes: [{ recipe_id: 9 }] }],
    ["a nested name of the wrong type", { nested_recipes: [{ recipe_id: "r-1", name: 4 }] }],
    ["neither name nor cuisine_id", { name: undefined, cuisine_id: undefined }],
  ])("drops an entry with %s", (_label, patch): void => {
    const bad = { ...ITALIAN, ...patch };
    // control: the unpatched entry is kept whole
    expect(parseCuisineRecommendResponse(backendList([ITALIAN])).cuisines).toStrictEqual([ITALIAN]);
    expect(names(parseCuisineRecommendResponse(backendList([bad, THAI])))).toStrictEqual(["Thai"]);
    expect(() => parseCuisineRecommendResponse(backendList([bad]))).toThrow(NO_MATCH);
  });

  it.each([[null], [7], [true], [[]], [["Italian"]]])("drops an entry that is %j", (item): void => {
    expect(names(parseCuisineRecommendResponse(backendList([item, THAI])))).toStrictEqual(["Thai"]);
    expect(() => parseCuisineRecommendResponse(backendList([item]))).toThrow(NO_MATCH);
  });
});
