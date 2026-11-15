/**
 * @jest-environment node
 *
 * The pass-through contract of the profile parsers. The owner's "Export JSON" serialises the page's profile state, so
 * every key a parser does not model must survive untouched (unmodeledKeys.ts), while a MODELED key with a malformed
 * value must never come back raw through the same spread. Only the five keys the profile parser spreads conditionally
 * (tasteGraph, dietary_preferences, profile_layout, vessel, shareIdentity) can leak; the other rows of the table are
 * overwritten by an explicit field and re-test their own parsers. The CONTROLS (the same keys, valid, are kept) are in
 * publicProfileParser.test.ts and profileSectionsParser*.test.ts. Keys come from JSON text, so "__proto__" is possible.
 */
import { isJsonRecord } from "@/lib/api/json";
import { parseDietaryPreferences, parseNatalPositions, parseTasteGraph } from "../profileSectionsParser";
import { parsePublicProfileResponse, type PublicProfile } from "../publicProfileParser";
import { unmodeledEntries } from "../unmodeledKeys";

function run<T>(parse: (value: unknown, issues: string[]) => T, value: unknown): { out: T; issues: string[] } {
  const issues: string[] = [];
  return { out: parse(value, issues), issues };
}

function record(text: string): Record<string, unknown> {
  const value: unknown = JSON.parse(text);
  if (!isJsonRecord(value)) throw new Error("not a record");
  return value;
}

const MINIMAL = { userId: "u-1", name: "Ada", isAgent: false, balances: { spirit: 1, essence: 2, matter: 3, substance: 4 } };

function profileOf(extra: Record<string, unknown>): { profile: PublicProfile; issues: string[] } {
  const parsed = parsePublicProfileResponse({ success: true, profile: { ...MINIMAL, ...extra } });
  if (parsed.kind !== "profile") throw new Error("expected a profile");
  return parsed;
}

describe("unmodeledEntries", () => {
  it("drops exactly the modeled keys and keeps every other entry, values untouched", () => {
    const nested = { deep: [1, { x: null }] };
    expect(unmodeledEntries({ a: 1, b: nested, c: "kept" }, ["a", "missing"])).toStrictEqual({ b: nested, c: "kept" });
    expect(unmodeledEntries({ a: 1 }, [])).toStrictEqual({ a: 1 });
    expect(unmodeledEntries({}, ["a"])).toStrictEqual({});
  });

  it("keeps falsy-but-real extras (0, false, '', null, [], {}) and keys that merely START with a modeled name", () => {
    const extras = { nameDay: "May 3", confidence: 0, flagged: false, blank: "", nothing: null, list: [], bag: {} };
    expect(unmodeledEntries({ name: "Ada", ...extras }, ["name"])).toStrictEqual(extras);
  });

  it("a literal __proto__ key from JSON text survives as an OWN property and sets no prototype", () => {
    const out = unmodeledEntries(record('{"__proto__":{"polluted":true},"keep":1}'), []);
    expect(Object.keys(out)).toEqual(["__proto__", "keep"]);
    expect(Object.getPrototypeOf(out)).toBe(Object.prototype);
    expect("polluted" in out).toBe(false);
  });
});

describe("natal placements", () => {
  it("keep the keys they do not model (house, retrograde, ...)", () => {
    const rows = [{ planet: "Sun", sign: "scorpio", degree: 21.4, minutes: 24, house: 8, retrograde: false }, { exactLongitude: 231.4 }];
    expect(run(parseNatalPositions, rows)).toStrictEqual({ out: rows, issues: [] });
  });

  it("a mistyped MODELED field is dropped and reported, extras or not (the report counts modeled fields only)", () => {
    const { out, issues } = run(parseNatalPositions, [{ planet: 5, sign: "leo", house: 8 }]);
    expect(out).toStrictEqual([{ sign: "leo", house: 8 }]);
    expect(out[0]).not.toHaveProperty("planet");
    expect(issues).toEqual(["natalPositions[0]: 1 mistyped field(s) dropped"]);
  });
});

describe("taste graph", () => {
  it("malformed modeled parts are omitted (never copied raw) while the other keys survive", () => {
    const { out, issues } = run(parseTasteGraph, { elementalAffinities: "LEAK", cuisines: "LEAK", confidence: 0.4 });
    expect(out).toStrictEqual({ confidence: 0.4 });
    expect(issues).toEqual(["tasteGraph.elementalAffinities: not an object, dropped", "tasteGraph.cuisines: not an array, dropped"]);
  });

  it("a brand-new user's graph (confidence 0, no interactions, null lastActivity) arrives whole", () => {
    const graph = { cuisines: [], elementalAffinities: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }, confidence: 0, totalInteractions: 0, lastActivity: null, corrections: {} };
    expect(run(parseTasteGraph, graph)).toStrictEqual({ out: graph, issues: [] });
  });

  it("a literal __proto__ key among the affinities survives as an own entry (assignment would have lost it)", () => {
    const { out, issues } = run(parseTasteGraph, record('{"elementalAffinities":{"__proto__":0.5,"Fire":0.3}}'));
    expect(Object.keys(out?.elementalAffinities ?? {})).toEqual(["__proto__", "Fire"]);
    expect(Object.getPrototypeOf(out?.elementalAffinities)).toBe(Object.prototype);
    expect(issues).toEqual([]);
  });

  it("a cuisine row without a string name is dropped even when it carries extras; a valid row keeps its score", () => {
    const { out, issues } = run(parseTasteGraph, { cuisines: [{ name: 5, score: 1 }, { name: "Thai", score: 2 }] });
    expect(out).toStrictEqual({ cuisines: [{ name: "Thai", score: 2 }] });
    expect(issues).toEqual(["tasteGraph.cuisines[0]: no string name, dropped"]);
  });
});

describe("dietary preferences", () => {
  it("malformed restrictions are omitted (never copied raw) while the other keys survive", () => {
    const { out, issues } = run(parseDietaryPreferences, { restrictions: "LEAK", allergies: ["peanut"] });
    expect(out).toStrictEqual({ allergies: ["peanut"] });
    expect(issues).toEqual(["dietary_preferences.restrictions: not an array, dropped"]);
  });

  it("without restrictions the object is kept whole and silent", () => {
    expect(run(parseDietaryPreferences, { allergies: ["peanut"] })).toStrictEqual({ out: { allergies: ["peanut"] }, issues: [] });
  });
});

describe("the profile", () => {
  it("CONTROL: keys it does not model ride along, nested values included", () => {
    const extras = {
      natalChart: { ascendant: "leo" }, birthData: { date: "1990-11-14" }, futureKey: [1, { nested: true }],
      // falsy-but-real values, and keys that merely start with a modeled name ("name", "social", "balances")
      nameDay: null, socialLinks: [], balancesHistory: 0, flagged: false,
    };
    expect(profileOf(extras).profile).toMatchObject(extras);
  });

  it("a literal __proto__ key on the wire becomes an own property of the profile, not its prototype", () => {
    const text = JSON.stringify({ success: true, profile: MINIMAL }).replace('"profile":{', '"profile":{"__proto__":{"polluted":true},');
    const parsed = parsePublicProfileResponse(record(text));
    if (parsed.kind !== "profile") throw new Error("expected a profile");
    expect(Object.keys(parsed.profile)).toContain("__proto__");
    expect(Object.getPrototypeOf(parsed.profile)).toBe(Object.prototype);
    expect("polluted" in parsed.profile).toBe(false);
  });

  it.each([
    ["tasteGraph", "LEAK"],
    ["dietary_preferences", 7],
    ["profile_layout", "LEAK"],
    ["vessel", "LEAK"],
    ["shareIdentity", "LEAK"],
    ["natalPositions", "LEAK"],
    ["social", "LEAK"],
    ["agentProfile", "LEAK"],
    ["agentInteractions", "LEAK"],
    ["recentActivity", "LEAK"],
    ["bio", 5],
    ["handle", 5],
    ["createdAt", 5],
  ])("a malformed modeled key (%s) is dropped or defaulted, never copied raw", (key, bad) => {
    const { profile } = profileOf({ [key]: bad });
    expect(JSON.stringify(profile)).not.toContain("LEAK");
    expect(Object.entries(profile).find(([name, value]) => name === key && value === bad)).toBeUndefined();
  });
});
