/**
 * @jest-environment node
 *
 * Round trips for the public-profile section parsers, from realistic wire values. `balances`, `social`,
 * `recentActivity` and `profile_layout` repeat what `users/[userId]/route.ts` sends (default layout :394, the feed
 * event types :315); each body goes through JSON so it is wire-shaped, and results use `toStrictEqual` (key order is
 * free, but a stray `undefined`-valued key fails).
 *
 * The taste graph is NOT hand-built: it is the REAL `computeTasteGraph` (userInteractionsService.ts:231) over a faked
 * `executeQuery` that returns `user_interactions` rows in the table's shape (`weight` arrives as text, newest first),
 * then JSON'd and parsed. Only the database is faked; the scoring, normalisation, taste corrections and serialisation
 * are the product's. Rejections and degradations: profileSectionsParser.guards.test.ts.
 */
type Rows = Array<Record<string, unknown>>;
type History = Array<[string, Record<string, unknown>, string]>;
type Graph = Awaited<ReturnType<typeof computeTasteGraph>>;

const mockDb: { interactions: Rows; profiles: Rows } = { interactions: [], profiles: [] };

jest.mock("@/lib/database", (): { executeQuery: (sql: string) => Promise<{ rows: Rows }> } => ({
  executeQuery: (sql: string): Promise<{ rows: Rows }> =>
    Promise.resolve({ rows: sql.includes("FROM user_interactions") ? mockDb.interactions : mockDb.profiles }),
}));

import { computeTasteGraph } from "@/services/userInteractionsService";
import {
  EMPTY_SOCIAL, parseBalances, parseDietaryPreferences, parseNatalPositions, parseProfileLayout, parseRecentActivity, parseSocial, parseTasteGraph,
} from "../profileSectionsParser";

const BALANCES = { spirit: 5000, essence: 4200.5, matter: 0, substance: 3500.25 };
const SOCIAL = { followers: 128, following: 64, commensals: 12, tablesHosted: 3, tablesJoined: 7, viewer: { follows: true, followedBy: false, isCommensal: true } };
const SOCIAL_CASES: Array<[string, unknown]> = [
  ["a signed-in viewer", SOCIAL],
  ["no viewer (anonymous, or the owner)", { ...SOCIAL, viewer: null }],
  ["tables not counted (null)", { ...SOCIAL, tablesHosted: null, tablesJoined: null }],
  ["the opposite relationship", { ...SOCIAL, viewer: { follows: false, followedBy: true, isCommensal: false } }],
  ["a brand-new account: every count 0 is a real answer", { ...SOCIAL, followers: 0, following: 0, commensals: 0, tablesHosted: 0, tablesJoined: 0, viewer: null }],
];
const NATAL = [
  { planet: "Sun", sign: "scorpio", degree: 21, minutes: 14 },
  { planet: "Moon", sign: "pisces", degree: 4, minutes: 52 },
  { planet: "Mercury", sign: "libra", degree: 29, minutes: 3 },
  { planet: "Venus", sign: "sagittarius", degree: 8, minutes: 40 },
  { planet: "Mars", sign: "leo", degree: 0, minutes: 0 },
  { planet: "Jupiter", sign: "cancer", degree: 15, minutes: 27 },
  { planet: "Saturn", sign: "capricorn", degree: 2, minutes: 9 },
  { planet: "Uranus", sign: "aquarius", degree: 17, minutes: 59 },
  { planet: "Neptune", sign: "capricorn", degree: 26, minutes: 18 },
  { planet: "Pluto", sign: "scorpio", degree: 5, minutes: 33 },
];
const ACTIVITY = [
  { id: "3f6c1d52-0a4e-4b7e-9a21-5c8d7e1f0a01", eventType: "made_it", createdAt: "2026-11-12T09:30:00.000Z",
    metadataPayload: { recipeId: "r_428", rating: 5, servings: 4, photos: ["a.jpg", "b.jpg"] } },
  { id: "3f6c1d52-0a4e-4b7e-9a21-5c8d7e1f0a02", eventType: "recipe_review", createdAt: "2026-11-11T19:02:41.512Z",
    metadataPayload: { recipeId: "r_17", stars: 3, comment: "Needs more salt" } },
  { id: "3f6c1d52-0a4e-4b7e-9a21-5c8d7e1f0a03", eventType: "lab_entry", createdAt: "2026-11-09T07:15:00.000Z", metadataPayload: null },
  { id: "3f6c1d52-0a4e-4b7e-9a21-5c8d7e1f0a04", eventType: "weekly_menu", createdAt: "2026-11-02T16:45:10.003Z", metadataPayload: {} },
];
const DIETARY = { restrictions: ["vegetarian", "gluten-free", "tree-nut-allergy"] };
const LAYOUT = ["natalChart", "alchemicalConstitution", "tasteGraph", "dietaryPrefs", "insightsTicker", "tokenEconomy", "recentActivity"];

/** Newest first, as `fetchInteractions` orders them (ORDER BY created_at DESC). */
const HISTORY: History = [
  ["recipe_cook", { cuisine: "Italian", cookingMethod: "braise", ingredients: ["tomato", "basil", "garlic"], complexity: "moderate",
    elementalBalance: { Fire: 0.4, Water: 0.2, Earth: 0.3, Air: 0.1 } }, "3.00"],
  ["recipe_save", { cuisine: "Thai", cookingMethod: "stir-fry", ingredients: ["lemongrass", "basil"], complexity: "complex",
    elementalBalance: { Fire: 0.5, Water: 0.1, Earth: 0.1, Air: 0.3 } }, "2.00"],
  ["recipe_view", { cuisine: "Italian", weight: 0.5 }, "1.00"],
  ["food_rating", { foodName: "cilantro", rating: 1 }, "1.00"],
  ["food_rating", { foodName: "basil", rating: 5 }, "1.00"],
  ["planetary_query", { planet: "Venus", engagement: 0.8 }, "1.00"],
  ["food_diary_entry", { foodName: "risotto", mealType: "dinner" }, "1.00"],
  ["cooking_method", { method: "braise" }, "1.00"],
];

function onTheWire(value: unknown): unknown {
  return JSON.parse(JSON.stringify(value));
}

function run<T>(parse: (value: unknown, issues: string[]) => T, value: unknown): { out: T; issues: string[] } {
  const issues: string[] = [];
  return { out: parse(onTheWire(value), issues), issues };
}

function interactionRows(history: History): Rows {
  return history.map(([type, payload, weight], index): Record<string, unknown> => ({
    id: `7c0f2a10-5d3e-4b1a-9c11-${String(index).padStart(12, "0")}`,
    user_id: "u-1",
    interaction_type: type,
    payload,
    context: {},
    weight,
    created_at: new Date(Date.UTC(2026, 10, 12 - index, 18, 0, 0)).toISOString(),
  }));
}

async function realTasteGraph(history: History, profiles: Rows): Promise<{ graph: Graph; wire: unknown }> {
  mockDb.interactions = interactionRows(history);
  mockDb.profiles = profiles;
  const graph = await computeTasteGraph("u-1");
  return { graph, wire: onTheWire(graph) };
}

describe("parseBalances", (): void => {
  it("reproduces the route's four numbers exactly (0 is the `|| 0` fallback, a real value)", (): void => {
    expect(parseBalances(onTheWire(BALANCES))).toStrictEqual(BALANCES);
  });
});

describe("parseSocial", (): void => {
  it.each(SOCIAL_CASES)("%s", (_name, wire): void => {
    const { out, issues } = run(parseSocial, wire);
    expect(out).toStrictEqual(wire);
    expect(issues).toEqual([]);
  });
});

describe("parseNatalPositions, parseRecentActivity, parseDietaryPreferences, parseProfileLayout", (): void => {
  it("ten placements in order, keeping the falsy-but-valid degree 0 and minutes 0", (): void => {
    expect(run(parseNatalPositions, NATAL)).toStrictEqual({ out: NATAL, issues: [] });
  });
  it("feed rows in order: an object payload, a null payload and an empty one", (): void => {
    expect(run(parseRecentActivity, ACTIVITY)).toStrictEqual({ out: ACTIVITY, issues: [] });
  });
  it("the restrictions", (): void => {
    expect(run(parseDietaryPreferences, DIETARY)).toStrictEqual({ out: DIETARY, issues: [] });
  });
  it("the route's default layout, in order", (): void => {
    expect(run(parseProfileLayout, LAYOUT)).toStrictEqual({ out: LAYOUT, issues: [] });
  });
});

describe("parseTasteGraph over the REAL computeTasteGraph", (): void => {
  it("a user with no interactions: the uniform 0.25 affinities, no cuisines, the rest of the graph carried through", async (): Promise<void> => {
    const { graph, wire } = await realTasteGraph([], []);
    expect(graph.totalInteractions).toBe(0);
    const { out, issues } = run(parseTasteGraph, wire);
    expect(out).toStrictEqual(wire);
    expect(out).toMatchObject({ elementalAffinities: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }, cuisines: [] });
    expect(issues).toEqual([]);
  });

  it("eight interactions: the WHOLE graph survives (the owner's JSON export serialises it), nothing is reported", async (): Promise<void> => {
    const { graph, wire } = await realTasteGraph(HISTORY, []);
    // the real function ran over the rows (so the parse below is not over an empty shell)
    expect(graph.totalInteractions).toBe(8);
    expect(graph.lastActivity).toBe("2026-11-12T18:00:00.000Z");
    expect(graph.cuisines.map((c): string => c.name)).toEqual(["Italian", "Thai"]);
    expect(graph.favoriteIngredients).toEqual(["basil"]);
    expect(graph.dislikedIngredients).toEqual(["cilantro"]);
    const { out, issues } = run(parseTasteGraph, wire);
    expect(out).toStrictEqual(wire);
    expect(out?.cuisines).toStrictEqual(graph.cuisines);
    expect(out).toMatchObject({ totalInteractions: 8, favoriteIngredients: ["basil"], dislikedIngredients: ["cilantro"] });
    expect(out?.elementalAffinities?.Fire).toBeCloseTo(0.44, 10);
    expect(out?.elementalAffinities?.Water).toBeCloseTo(0.16, 10);
    expect(issues).toEqual([]);
  });

  it("taste corrections reorder the cuisines the page receives (loved first, blocked removed)", async (): Promise<void> => {
    const corrections = { cuisines: { Korean: "love", Thai: "block" } };
    const { graph, wire } = await realTasteGraph(HISTORY, [{ taste_corrections: corrections }]);
    expect(graph.corrections).toEqual(corrections);
    expect(graph.cuisines.map((c): string => c.name)).toEqual(["Korean", "Italian"]);
    const { out, issues } = run(parseTasteGraph, wire);
    expect(out?.cuisines?.map((c): string => c.name)).toEqual(["Korean", "Italian"]);
    expect(out).toStrictEqual(wire);
    expect(out).toMatchObject({ corrections });
    expect(issues).toEqual([]);
  });

  it("a stored payload with a non-finite number reaches the wire as null: that one affinity is dropped and reported", async (): Promise<void> => {
    // Only reachable by an out-of-band write: recordInteraction's JSON.stringify turns Infinity into null.
    const hostile: unknown = JSON.parse('{"Fire":1e999,"Water":0.2,"Earth":0.3,"Air":0.5}');
    const { graph, wire } = await realTasteGraph([["recipe_view", { cuisine: "Peruvian", elementalBalance: hostile }, "1.00"]], []);
    expect(graph.elementalAffinities.Fire).toBe(Infinity);
    const { out, issues } = run(parseTasteGraph, wire);
    expect(out?.elementalAffinities).toStrictEqual({ Water: 0.2, Earth: 0.3, Air: 0.5 });
    expect(out?.cuisines?.map((c): string => c.name)).toEqual(["Peruvian"]);
    expect(out).toMatchObject({ totalInteractions: 1 });
    expect(issues).toEqual(["tasteGraph.elementalAffinities.Fire: not a finite number, dropped"]);
  });
});

describe("outputs are plain mutable state (DietaryPrefsBlock assigns into them)", (): void => {
  it("nothing parsed is frozen, at any depth", (): void => {
    const issues: string[] = [];
    const social = parseSocial(SOCIAL, issues);
    const natal = parseNatalPositions(NATAL, issues);
    const activity = parseRecentActivity(ACTIVITY, issues);
    const taste = parseTasteGraph({ elementalAffinities: { Fire: 0.5 }, cuisines: [{ name: "Thai" }] }, issues);
    const diet = parseDietaryPreferences(DIETARY, issues);
    const outputs: unknown[] = [
      parseBalances(BALANCES), social, social.viewer, natal, natal[0], activity, activity[0],
      taste, taste?.elementalAffinities, taste?.cuisines, diet, diet?.restrictions, parseProfileLayout(LAYOUT, issues),
    ];
    // Object.isFrozen(undefined) is true, so a missing output would be listed here too
    expect(outputs.filter((output): boolean => Object.isFrozen(output))).toEqual([]);
    expect(issues).toEqual([]);
  });

  it("a parsed dietary block takes assignment, and the wire input is untouched", (): void => {
    const diet = parseDietaryPreferences(DIETARY, []);
    if (diet === null) throw new Error("dietary preferences did not parse");
    diet.restrictions = ["vegan"];
    diet.restrictions.push("kosher");
    expect(diet).toStrictEqual({ restrictions: ["vegan", "kosher"] });
    expect(DIETARY.restrictions).toEqual(["vegetarian", "gluten-free", "tree-nut-allergy"]);
  });

  it("parseSocial(undefined) is a COPY of EMPTY_SOCIAL: mutating it leaves the constant alone", (): void => {
    const issues: string[] = [];
    const empty = parseSocial(undefined, issues);
    expect(empty).toStrictEqual(EMPTY_SOCIAL);
    expect(empty).not.toBe(EMPTY_SOCIAL);
    empty.followers = 99;
    empty.viewer = { follows: true, followedBy: true, isCommensal: true };
    expect(EMPTY_SOCIAL).toStrictEqual({ followers: 0, following: 0, commensals: 0, tablesHosted: null, tablesJoined: null, viewer: null });
    expect(parseSocial(undefined, issues)).toStrictEqual(EMPTY_SOCIAL);
    expect(issues).toEqual([]);
  });
});
