/**
 * @jest-environment node
 *
 * Rejections, degradations and issue reports for the section parsers. Every bad value is a realistic good one with
 * exactly ONE thing changed, and each rejection has a CONTROL (the unchanged value is accepted, and so is the same
 * field with another valid value, 0 included), so a rejection can only be the parser's. Non-finite numbers come from
 * JSON TEXT (`1e999`): `JSON.stringify(Infinity)` is `null` and would test a different case. Results use
 * `toStrictEqual`, so a stray `undefined`-valued key fails. Round trips: profileSectionsParser.test.ts.
 */
import {
  EMPTY_SOCIAL, parseBalances, parseDietaryPreferences, parseNatalPositions, parseProfileLayout, parseRecentActivity, parseSocial, parseTasteGraph,
} from "../profileSectionsParser";

const INF: unknown = JSON.parse("1e999");
const NOT_OBJECT = "social: not an object, zero counts used";
const MALFORMED = "social: malformed, zero counts used";
const NOT_NUMBERS: Array<[string, unknown]> = [["a numeric string", "7"], ["Infinity from 1e999", INF]];
const BAD_NUMBERS: Array<[string, unknown]> = [...NOT_NUMBERS, ["null", null]];
const NON_OBJECTS: Array<[string, unknown]> = [["an array", []], ["a string", "value"], ["a number", 7], ["a boolean", true]];
const NOTHING: Array<[string, unknown]> = [["undefined", undefined], ["null", null]];

function run<T>(parse: (value: unknown, issues: string[]) => T, value: unknown): { out: T; issues: string[] } {
  const issues: string[] = [];
  return { out: parse(value, issues), issues };
}

function withKey(base: Record<string, unknown>, key: string, value: unknown): Record<string, unknown> {
  return { ...base, [key]: value };
}

function without(base: Record<string, unknown>, key: string): Record<string, unknown> {
  const copy = { ...base };
  delete copy[key];
  return copy;
}

const BALANCES = { spirit: 5000, essence: 4200.5, matter: 3800, substance: 3500.25 };

describe("parseBalances", (): void => {
  it("CONTROL: the unchanged balances parse, and unknown keys are not copied", (): void => {
    expect(parseBalances(BALANCES)).toStrictEqual(BALANCES);
    expect(parseBalances({ ...BALANCES, total: 15000 })).toStrictEqual(BALANCES);
  });
  describe.each(Object.keys(BALANCES))("%s", (key): void => {
    it("CONTROL: 0 (the `|| 0` fallback) is accepted", (): void => { expect(parseBalances(withKey(BALANCES, key, 0))).toStrictEqual({ ...BALANCES, [key]: 0 }); });
    it.each(BAD_NUMBERS)("rejects %s", (_name, bad): void => { expect(parseBalances(withKey(BALANCES, key, bad))).toBeNull(); });
    it("rejects when missing", (): void => { expect(parseBalances(without(BALANCES, key))).toBeNull(); });
  });
  it.each([...NOTHING, ...NON_OBJECTS])("a non-object (%s) is null", (_name, value): void => { expect(parseBalances(value)).toBeNull(); });
});

const SOCIAL = { followers: 128, following: 64, commensals: 12, tablesHosted: 3, tablesJoined: 7, viewer: { follows: true, followedBy: false, isCommensal: true } };
const ZERO = { out: EMPTY_SOCIAL, issues: [MALFORMED] };
const ZEROED: Array<[string, unknown, string[]]> = [
  ["undefined", undefined, []], ["null", null, []], ["a string", "social", [NOT_OBJECT]], ["an array", [], [NOT_OBJECT]],
  ["a number", 7, [NOT_OBJECT]], ["a malformed count", withKey(SOCIAL, "followers", "128"), [MALFORMED]],
];
const COUNT_KEYS: Array<[string, boolean]> = [["followers", false], ["following", false], ["commensals", false], ["tablesHosted", true], ["tablesJoined", true]];

describe("parseSocial", (): void => {
  it("CONTROL: the unchanged block parses, unknown keys are not copied", (): void => {
    expect(run(parseSocial, withKey(SOCIAL, "role", "chef"))).toStrictEqual({ out: SOCIAL, issues: [] });
  });
  it.each(ZEROED)("%s -> zero counts as a fresh copy, with the right report", (_name, value, expected): void => {
    const { out, issues } = run(parseSocial, value);
    expect(out).toStrictEqual(EMPTY_SOCIAL);
    expect(out).not.toBe(EMPTY_SOCIAL);
    out.followers = 99;
    expect(EMPTY_SOCIAL.followers).toBe(0);
    expect(issues).toEqual(expected);
  });
  describe.each(COUNT_KEYS)("%s", (key, nullOk): void => {
    it("CONTROL: 0 is accepted", (): void => { expect(run(parseSocial, withKey(SOCIAL, key, 0))).toStrictEqual({ out: { ...SOCIAL, [key]: 0 }, issues: [] }); });
    it(`null is ${nullOk ? "accepted (not counted)" : "rejected"}`, (): void => {
      expect(run(parseSocial, withKey(SOCIAL, key, null))).toStrictEqual(nullOk ? { out: { ...SOCIAL, [key]: null }, issues: [] } : ZERO);
    });
    it.each(NOT_NUMBERS)("rejects %s", (_name, bad): void => { expect(run(parseSocial, withKey(SOCIAL, key, bad))).toStrictEqual(ZERO); });
    it("rejects when absent (the producer always sends the key)", (): void => { expect(run(parseSocial, without(SOCIAL, key))).toStrictEqual(ZERO); });
  });
  describe("viewer", (): void => {
    it("CONTROL: null is accepted (no authenticated viewer, or the owner)", (): void => {
      expect(run(parseSocial, withKey(SOCIAL, "viewer", null))).toStrictEqual({ out: { ...SOCIAL, viewer: null }, issues: [] });
    });
    it.each([["a string", "viewer"], ["an array", []], ["a number", 1]])("rejects %s", (_name, bad): void => {
      expect(run(parseSocial, withKey(SOCIAL, "viewer", bad))).toStrictEqual(ZERO);
    });
    it("rejects when absent (the producer always sends the key)", (): void => { expect(run(parseSocial, without(SOCIAL, "viewer"))).toStrictEqual(ZERO); });
    describe.each(Object.keys(SOCIAL.viewer))("viewer.%s", (key): void => {
      const inViewer = (viewer: Record<string, unknown>): Record<string, unknown> => withKey(SOCIAL, "viewer", viewer);
      it.each([[true], [false]])("CONTROL: %s is accepted and kept", (flag): void => {
        const viewer = withKey(SOCIAL.viewer, key, flag);
        expect(run(parseSocial, inViewer(viewer))).toStrictEqual({ out: { ...SOCIAL, viewer }, issues: [] });
      });
      it.each([["a string", "true"], ["null", null], ["a number", 1]])("rejects %s", (_name, bad): void => {
        expect(run(parseSocial, inViewer(withKey(SOCIAL.viewer, key, bad)))).toStrictEqual(ZERO);
      });
      it("rejects when missing", (): void => { expect(run(parseSocial, inViewer(without(SOCIAL.viewer, key)))).toStrictEqual(ZERO); });
    });
  });
});

const SUN = { planet: "Sun", sign: "scorpio", degree: 21, minutes: 14 };
const MOON = { planet: "Moon", sign: "pisces", degree: 4, minutes: 52 };
const MERCURY = { planet: "Mercury", sign: "libra", degree: 0, minutes: 0 };
const WRONG_FIELDS: Array<[string, unknown[]]> = [["planet", [5, true, {}]], ["sign", [5, false, ["leo"]]], ["degree", ["21", INF, true]], ["minutes", ["14", INF, {}]]];
const NOT_ARRAYS: Array<[string, unknown]> = [["a keyed map (hypothetical drift)", { Sun: { sign: "scorpio", degree: 21 }, Moon: { sign: "pisces" } }], ["a string", "Sun"], ["a number", 7], ["a boolean", true]];

describe("parseNatalPositions", (): void => {
  it("CONTROL: valid rows parse in order (degree 0 kept), keys it does not model ride along", (): void => {
    const sun = withKey(SUN, "house", 8);
    expect(run(parseNatalPositions, [MOON, sun, MERCURY])).toStrictEqual({ out: [MOON, sun, MERCURY], issues: [] });
  });
  it.each([...NOTHING, ["an empty array", []]])("%s is [] with no issue", (_name, value): void => {
    expect(run(parseNatalPositions, value)).toStrictEqual({ out: [], issues: [] });
  });
  it.each(NOT_ARRAYS)("%s is [] + one issue", (_name, value): void => {
    expect(run(parseNatalPositions, value)).toStrictEqual({ out: [], issues: ["natalPositions: not an array, ignored"] });
  });
  it("a non-object entry is dropped and named by its index; the rows around it survive", (): void => {
    const { out, issues } = run(parseNatalPositions, [SUN, "Mars", MOON, null, [1, 2], 7, MERCURY]);
    expect(out).toStrictEqual([SUN, MOON, MERCURY]);
    expect(issues).toEqual([1, 3, 4, 5].map((i): string => `natalPositions[${i}]: not an object, dropped`));
  });
  describe.each(WRONG_FIELDS)("%s", (field, wrongs): void => {
    it.each(wrongs)("mistyped %j: the field is dropped, the row kept, one issue", (bad): void => {
      const { out, issues } = run(parseNatalPositions, [SUN, withKey(MOON, field, bad), MERCURY]);
      expect(out).toStrictEqual([SUN, without(MOON, field), MERCURY]);
      expect(issues).toEqual(["natalPositions[1]: 1 mistyped field(s) dropped"]);
    });
  });
  it("null and absent fields are silent: the row keeps what it has", (): void => {
    const rows = [{ planet: "Sun", sign: null, degree: 21 }, { planet: "Moon" }, {}];
    expect(run(parseNatalPositions, rows)).toStrictEqual({ out: [{ planet: "Sun", degree: 21 }, { planet: "Moon" }, {}], issues: [] });
  });
  it("the issue counts the mistyped fields: two of four, then all four (the row survives as {})", (): void => {
    const two = run(parseNatalPositions, [{ ...SUN, planet: 1, minutes: "14" }]);
    expect(two).toStrictEqual({ out: [{ sign: "scorpio", degree: 21 }], issues: ["natalPositions[0]: 2 mistyped field(s) dropped"] });
    const all = run(parseNatalPositions, [{ planet: 1, sign: 2, degree: "3", minutes: "4" }]);
    expect(all).toStrictEqual({ out: [{}], issues: ["natalPositions[0]: 4 mistyped field(s) dropped"] });
  });
});

const ROW = { id: "3f6c1d52-0a4e-4b7e-9a21-5c8d7e1f0a01", eventType: "made_it", createdAt: "2026-11-12T09:30:00.000Z", metadataPayload: { recipeId: "r_428", rating: 5, tags: ["weeknight"] } };
const QUIET = { id: "3f6c1d52-0a4e-4b7e-9a21-5c8d7e1f0a02", eventType: "lab_entry", createdAt: "2026-11-09T07:15:00.000Z", metadataPayload: null };
const DROPPED = "recentActivity[1]: not a valid row, dropped";

describe("parseRecentActivity", (): void => {
  it("CONTROL: valid rows parse in order (a null payload is silent), extra keys are not copied", (): void => {
    expect(run(parseRecentActivity, [QUIET, withKey(ROW, "actorId", "u-9")])).toStrictEqual({ out: [QUIET, ROW], issues: [] });
    expect(run(parseRecentActivity, [])).toStrictEqual({ out: [], issues: [] });
  });
  it.each([...NOTHING, ["a keyed map", { rows: [] }], ["a string", "rows"], ["a number", 7]])("a non-array (%s) is [] + one issue", (_name, value): void => {
    expect(run(parseRecentActivity, value)).toStrictEqual({ out: [], issues: ["recentActivity: not an array, treated as empty"] });
  });
  it.each([["a string", "row"], ["null", null], ["an array", [ROW]], ["a number", 7]])("a non-object row (%s) is dropped by index", (_name, bad): void => {
    expect(run(parseRecentActivity, [ROW, bad, QUIET])).toStrictEqual({ out: [ROW, QUIET], issues: [DROPPED] });
  });
  describe.each(["id", "eventType", "createdAt"])("%s", (key): void => {
    it.each([["a number", 5], ["null", null], ["an object", {}]])("mistyped (%s) drops the row", (_name, bad): void => {
      expect(run(parseRecentActivity, [ROW, withKey(QUIET, key, bad), ROW])).toStrictEqual({ out: [ROW, ROW], issues: [DROPPED] });
    });
    it("missing drops the row", (): void => { expect(run(parseRecentActivity, [ROW, without(QUIET, key), ROW])).toStrictEqual({ out: [ROW, ROW], issues: [DROPPED] }); });
  });
  describe("metadataPayload", (): void => {
    it("an object is kept (empty or nested); null and absent are null, silently", (): void => {
      const empty = withKey(QUIET, "metadataPayload", {});
      expect(run(parseRecentActivity, [ROW, empty])).toStrictEqual({ out: [ROW, empty], issues: [] });
      expect(run(parseRecentActivity, [ROW, without(QUIET, "metadataPayload")])).toStrictEqual({ out: [ROW, QUIET], issues: [] });
    });
    it.each([["an array", [1]], ["a string", "made it"], ["a number", 5], ["a boolean", true]])("%s -> null + an issue naming the index (the row is kept)", (_name, bad): void => {
      const expected = { out: [ROW, QUIET], issues: ["recentActivity[1].metadataPayload: not an object, set to null"] };
      expect(run(parseRecentActivity, [ROW, withKey(QUIET, "metadataPayload", bad)])).toStrictEqual(expected);
    });
  });
});

describe("parseTasteGraph", (): void => {
  it.each(NOTHING)("%s -> null, no issue (no taste graph)", (_name, value): void => { expect(run(parseTasteGraph, value)).toStrictEqual({ out: null, issues: [] }); });
  it.each(NON_OBJECTS)("a non-object (%s) -> null + issue", (_name, value): void => {
    expect(run(parseTasteGraph, value)).toStrictEqual({ out: null, issues: ["tasteGraph: not an object, dropped"] });
  });
  it("CONTROL: both parts absent -> {} with no issue; keys it does not model ride along", (): void => {
    const extras = { cookingMethods: [{ name: "braise", score: 4 }], confidence: 0.08 };
    expect(run(parseTasteGraph, {})).toStrictEqual({ out: {}, issues: [] });
    expect(run(parseTasteGraph, extras)).toStrictEqual({ out: extras, issues: [] });
  });
  describe("elementalAffinities", (): void => {
    it("finite entries are kept: arbitrary keys, 0 included", (): void => {
      const elementalAffinities = { Fire: 0.3, Water: 0, Earth: 0.1, Air: 0.4, Aether: 0.2 };
      expect(run(parseTasteGraph, { elementalAffinities })).toStrictEqual({ out: { elementalAffinities }, issues: [] });
    });
    it("non-finite entries are dropped, one issue each, the rest kept", (): void => {
      const wire = { elementalAffinities: { Fire: INF, Water: null, Earth: "0.2", Air: 0.4 } };
      const issues = ["Fire", "Water", "Earth"].map((k): string => `tasteGraph.elementalAffinities.${k}: not a finite number, dropped`);
      expect(run(parseTasteGraph, wire)).toStrictEqual({ out: { elementalAffinities: { Air: 0.4 } }, issues });
    });
    it.each([["null", null], ["a string", "fire"], ["a number", 7], ["an array", [0.5]]])("%s is dropped + an issue, the key omitted, the cuisines unaffected", (_name, bad): void => {
      const expected = { out: { cuisines: [{ name: "Thai" }] }, issues: ["tasteGraph.elementalAffinities: not an object, dropped"] };
      expect(run(parseTasteGraph, { elementalAffinities: bad, cuisines: [{ name: "Thai" }] })).toStrictEqual(expected);
    });
  });
  describe("cuisines", (): void => {
    it("rows with a string name are kept WHOLE, score and extras included ('' is a name)", (): void => {
      const cuisines = [{ name: "Thai", score: 3.5 }, { name: "" }, { name: "Korean", extra: [1] }];
      expect(run(parseTasteGraph, { cuisines })).toStrictEqual({ out: { cuisines }, issues: [] });
    });
    it("rows without a string name are dropped, each named by its index", (): void => {
      const wire = { cuisines: [{ name: 5 }, { score: 1 }, "Thai", null, ["Thai"], { name: "Indian", score: 2 }] };
      const issues = [0, 1, 2, 3, 4].map((i): string => `tasteGraph.cuisines[${i}]: no string name, dropped`);
      expect(run(parseTasteGraph, wire)).toStrictEqual({ out: { cuisines: [{ name: "Indian", score: 2 }] }, issues });
    });
    it.each([["null", null], ["an object", { name: "Thai" }], ["a string", "Thai"], ["a number", 7]])("a non-array (%s) is dropped + an issue, the key omitted", (_name, bad): void => {
      expect(run(parseTasteGraph, { cuisines: bad })).toStrictEqual({ out: {}, issues: ["tasteGraph.cuisines: not an array, dropped"] });
    });
    it("an empty array is kept as [] (present, not absent)", (): void => { expect(run(parseTasteGraph, { cuisines: [] })).toStrictEqual({ out: { cuisines: [] }, issues: [] }); });
  });
  it("both parts bad: each is reported on its own and the result is {}", (): void => {
    const issues = ["tasteGraph.elementalAffinities: not an object, dropped", "tasteGraph.cuisines: not an array, dropped"];
    expect(run(parseTasteGraph, { elementalAffinities: "x", cuisines: "y" })).toStrictEqual({ out: {}, issues });
  });
});

describe("parseDietaryPreferences", (): void => {
  it.each(NOTHING)("%s -> null, no issue", (_name, value): void => { expect(run(parseDietaryPreferences, value)).toStrictEqual({ out: null, issues: [] }); });
  it.each(NON_OBJECTS)("a non-object (%s) -> null + issue", (_name, value): void => {
    expect(run(parseDietaryPreferences, value)).toStrictEqual({ out: null, issues: ["dietary_preferences: not an object, dropped"] });
  });
  it("CONTROL: {} -> {}; a HistoricalDiet-shaped object without restrictions is kept whole; both silent", (): void => {
    const historical = { culturalCuisine: "Mediterranean", staples: ["olive oil", "legumes"], era: "classical" };
    expect(run(parseDietaryPreferences, {})).toStrictEqual({ out: {}, issues: [] });
    expect(run(parseDietaryPreferences, historical)).toStrictEqual({ out: historical, issues: [] });
  });
  it("restrictions strings are kept in order, other keys ride along, [] stays []", (): void => {
    const wire = { restrictions: ["vegan", "nut-free"], culturalCuisine: "Mediterranean" };
    expect(run(parseDietaryPreferences, wire)).toStrictEqual({ out: wire, issues: [] });
    expect(run(parseDietaryPreferences, { restrictions: [] })).toStrictEqual({ out: { restrictions: [] }, issues: [] });
  });
  it("a mixed array keeps its strings and reports ONE issue with the count", (): void => {
    const wire = { restrictions: ["vegan", 7, null, "nut-free", { a: 1 }, true] };
    const issues = ["dietary_preferences.restrictions: 4 non-string entries dropped"];
    expect(run(parseDietaryPreferences, wire)).toStrictEqual({ out: { restrictions: ["vegan", "nut-free"] }, issues });
  });
  it.each([["null", null], ["a string", "vegan"], ["a number", 7], ["an object", { 0: "vegan" }], ["a boolean", false]])("non-array restrictions (%s) -> {} + one issue", (_name, bad): void => {
    expect(run(parseDietaryPreferences, { restrictions: bad })).toStrictEqual({ out: {}, issues: ["dietary_preferences.restrictions: not an array, dropped"] });
  });
});

describe("parseProfileLayout", (): void => {
  it.each(NOTHING)("%s -> null, no issue", (_name, value): void => { expect(run(parseProfileLayout, value)).toStrictEqual({ out: null, issues: [] }); });
  it.each([["a string", "natalChart"], ["an object", { 0: "natalChart" }], ["a number", 7], ["a boolean", true]])("non-array %s -> null + issue (the page uses its default layout)", (_name, value): void => {
    expect(run(parseProfileLayout, value)).toStrictEqual({ out: null, issues: ["profile_layout: not an array, default layout used"] });
  });
  it("strings are kept in order, and an empty array stays []", (): void => {
    expect(run(parseProfileLayout, ["tasteGraph", "natalChart"])).toStrictEqual({ out: ["tasteGraph", "natalChart"], issues: [] });
    expect(run(parseProfileLayout, [])).toStrictEqual({ out: [], issues: [] });
  });
  it("non-strings are dropped with ONE issue giving the count", (): void => {
    const issues = ["profile_layout: 3 non-string entries dropped"];
    expect(run(parseProfileLayout, ["natalChart", 7, null, "tasteGraph", {}])).toStrictEqual({ out: ["natalChart", "tasteGraph"], issues });
  });
});

const CORPUS: unknown[] = [
  "null", "true", "0", '"text"', "[]", "{}", "[null]", '{"a":null}', "[[]]", "1e999", '[{"name":null}]',
  '{"cuisines":[null],"elementalAffinities":[1e999]}', '[{"id":null,"eventType":1,"createdAt":[]}]',
].map((text): unknown => JSON.parse(text));
const PARSERS: Array<[string, (value: unknown, issues: string[]) => unknown]> = [
  ["parseSocial", parseSocial], ["parseNatalPositions", parseNatalPositions], ["parseRecentActivity", parseRecentActivity],
  ["parseTasteGraph", parseTasteGraph], ["parseDietaryPreferences", parseDietaryPreferences], ["parseProfileLayout", parseProfileLayout],
];

describe("no parser throws on any JSON value (or undefined)", (): void => {
  it.each(PARSERS)("%s", (_name, parse): void => { for (const value of [...CORPUS, undefined]) expect(() => parse(value, [])).not.toThrow(); });
  it("parseBalances", (): void => { for (const value of [...CORPUS, undefined]) expect(() => parseBalances(value)).not.toThrow(); });
});
