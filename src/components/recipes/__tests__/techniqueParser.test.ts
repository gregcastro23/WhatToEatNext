/**
 * `parseTechniqueResponse` against the bodies `GET /api/techniques/[name]`
 * really sends (route.ts:102-119, rateLimit.ts:159-175) and against EVERY real
 * `allCookingMethods` entry, serialised the way `NextResponse.json` does.
 *
 * Every rejection has a control: the same body with that one field valid.
 */

import { allCookingMethods } from "@/data/cooking/methods";
import { isJsonRecord } from "@/lib/api/json";
import { parseTechniqueResponse, type TechniqueData } from "../techniqueParser";

/** What `NextResponse.json` does to a value: stringify (drops undefined), parse. */
function wire(value: unknown): unknown {
  return JSON.parse(JSON.stringify(value));
}

function successBody(technique: unknown): unknown {
  return wire({ success: true, technique, canonicalKey: "roasting" });
}

function parseTech(technique: unknown): TechniqueData | undefined {
  return parseTechniqueResponse(successBody(technique)).technique;
}

/** The fields the modal renders, shaped like a registry entry (route.ts:109). */
const RENDERED = {
  name: "roasting",
  description: "Dry-heat cooking in an oven.",
  shortDescription: "Dry heat, deep browning.",
  culinaryArchetype: "The Forger",
  elementalEffect: { Fire: 0.7, Water: 0.1, Earth: 0.4, Air: 0.2 },
  duration: { min: 20, max: 180 },
  suitable_for: ["vegetables", "poultry"],
  benefits: ["Deep browning", "Concentrated flavour"],
  toolsRequired: ["oven", "roasting pan"],
  commonMistakes: ["Crowding the pan"],
  optimalTemperatures: { vegetables: 425, poultry: 375 },
  scientificPrinciples: ["Maillard reaction above 285F"],
  expertTips: ["Rest the meat"],
  doneness_indicators: { chicken: "juices run clear" },
};

/** Registry fields the modal never reads; the parser must ignore them. */
const UNREAD = {
  pairingSuggestions: ["herbs"],
  chemicalChanges: { maillard_reaction: true },
  nutrientRetention: { vitamin_c: 0.6 },
  history: "Ancient.",
  modernVariations: ["Convection roasting"],
  timingConsiderations: { rest: "10 minutes" },
  astrologicalInfluences: { dominantPlanets: ["Mars"], favorableZodiac: ["aries"] },
};

describe("parseTechniqueResponse: body envelope", () => {
  it("throws on a real JSON null body", () => {
    const parsed: unknown = JSON.parse("null");
    expect(() => parseTechniqueResponse(parsed)).toThrow(/not a JSON object/);
  });

  it.each(["[]", '"ok"', "42", "true"])("throws on the non-object body %s", (text) => {
    const parsed: unknown = JSON.parse(text);
    expect(() => parseTechniqueResponse(parsed)).toThrow(/not a JSON object/);
  });

  it("control: an empty JSON object parses (no success flag, no technique)", () => {
    const parsed: unknown = JSON.parse("{}");
    expect(parseTechniqueResponse(parsed)).toEqual({});
  });

  it("parses the producer's success body (route.ts:109-113)", () => {
    const body = wire({ success: true, technique: { ...RENDERED, ...UNREAD }, canonicalKey: "roasting" });
    expect(parseTechniqueResponse(body)).toEqual({
      success: true,
      technique: RENDERED,
      canonicalKey: "roasting",
    });
  });

  it("parses the 404 refusal (route.ts:102-107) and drops the unread query", () => {
    const body = wire({ success: false, error: "Technique not found", query: "zzz" });
    expect(parseTechniqueResponse(body)).toEqual({ success: false, error: "Technique not found" });
  });

  it("parses the 500 refusal (route.ts:115-119)", () => {
    const body = wire({ success: false, error: "Failed to fetch technique" });
    expect(parseTechniqueResponse(body)).toEqual({ success: false, error: "Failed to fetch technique" });
  });

  it("parses the rate limiter's 429, which has no success key (rateLimit.ts:159-164)", () => {
    const body = wire({ error: "rate_limit_exceeded", message: "Too many requests.", retryAfter: 12 });
    const parsed = parseTechniqueResponse(body);
    expect(parsed).toEqual({ error: "rate_limit_exceeded" });
    expect("success" in parsed).toBe(false);
  });

  it.each(['"true"', "1", "null", "{}"])("throws when success is the non-boolean %s", (text) => {
    const success: unknown = JSON.parse(text);
    expect(() => parseTechniqueResponse(wire({ success, error: "x" }))).toThrow(/success flag/);
  });

  it.each([true, false])("control: success %s is kept", (success) => {
    expect(parseTechniqueResponse(wire({ success, technique: { name: "a" } })).success).toBe(success);
  });

  it("does not parse a technique on a refusal", () => {
    const body = wire({ success: false, error: "x", technique: 5 });
    expect(parseTechniqueResponse(body)).toEqual({ success: false, error: "x" });
  });

  it.each(["null", "[]", '"roasting"', "5"])("throws when success is true and technique is %s", (text) => {
    const technique: unknown = JSON.parse(text);
    expect(() => parseTechniqueResponse(successBody(technique))).toThrow(/no technique object/);
  });

  it("throws when success is true and technique is absent; control: an object passes", () => {
    expect(() => parseTechniqueResponse(wire({ success: true }))).toThrow(/no technique object/);
    expect(parseTechniqueResponse(wire({ success: true, technique: {} })).technique).toEqual({});
  });

  it("keeps error and canonicalKey only when strings", () => {
    const bad = parseTechniqueResponse(wire({ success: false, error: 42, canonicalKey: ["a"] }));
    expect(bad).toEqual({ success: false });
    const good = parseTechniqueResponse(wire({ success: false, error: "e", canonicalKey: "k" }));
    expect(good).toEqual({ success: false, error: "e", canonicalKey: "k" });
  });
});

const FIELD_CASES: ReadonlyArray<readonly [string, unknown, unknown]> = [
  ["name", "roasting", 7],
  ["description", "text", { a: 1 }],
  ["shortDescription", "short", ["short"]],
  ["culinaryArchetype", "The Forger", false],
  ["elementalEffect", { Fire: 0.5 }, "fire"],
  ["duration", { min: 1, max: 2 }, { min: "1", max: 2 }],
  ["suitable_for", ["a"], "a"],
  ["benefits", ["a"], { 0: "a" }],
  ["toolsRequired", ["a"], 5],
  ["commonMistakes", ["a"], null],
  ["optimalTemperatures", { oven: 350 }, [350]],
  ["scientificPrinciples", ["a"], "a"],
  ["expertTips", ["a"], true],
  ["doneness_indicators", { chicken: "clear" }, "clear"],
];

describe("parseTechniqueResponse: one mistyped field never rejects the technique", () => {
  it.each(FIELD_CASES)("%s: wrong type dropped, valid control kept", (field, good, bad) => {
    const anchor = field === "name" ? { description: "anchor" } : { name: "anchor" };
    expect(parseTech({ ...anchor, [field]: bad })).toEqual(anchor);
    expect(parseTech({ ...anchor, [field]: good })).toEqual({ ...anchor, [field]: good });
  });

  it("keeps the string elements of a list and drops the rest", () => {
    expect(parseTech({ name: "n", benefits: ["a", 1, null, "b", { x: 1 }] })?.benefits).toEqual(["a", "b"]);
    expect(parseTech({ name: "n", benefits: ["a", "b"] })?.benefits).toEqual(["a", "b"]);
  });

  it("drops a non-empty list with no string elements; keeps an empty one", () => {
    expect(parseTech({ name: "n", expertTips: [1, null] })).toEqual({ name: "n" });
    expect(parseTech({ name: "n", expertTips: [] })).toEqual({ name: "n", expertTips: [] });
  });

  it("keeps the well-typed entries of a map", () => {
    const temps = parseTech({ name: "n", optimalTemperatures: { a: 350, b: "hot", c: null } });
    expect(temps?.optimalTemperatures).toEqual({ a: 350 });
    const doneness = parseTech({ name: "n", doneness_indicators: { a: "clear", b: 3 } });
    expect(doneness?.doneness_indicators).toEqual({ a: "clear" });
  });

  it("drops a non-empty map with no well-typed entries; keeps an empty one", () => {
    expect(parseTech({ name: "n", optimalTemperatures: { a: "hot" } })).toEqual({ name: "n" });
    expect(parseTech({ name: "n", optimalTemperatures: {} })).toEqual({ name: "n", optimalTemperatures: {} });
  });

  it("keeps a __proto__ map key as an own entry", () => {
    const body = JSON.parse('{"success":true,"technique":{"optimalTemperatures":{"__proto__":350}}}');
    const temps = parseTechniqueResponse(body).technique?.optimalTemperatures;
    expect(Object.keys(temps ?? {})).toEqual(["__proto__"]);
  });

  it("keeps only the well-typed elemental values", () => {
    const mixed = { name: "n", elementalEffect: { Fire: 0.5, Water: "wet", Earth: null, Air: 1 } };
    expect(parseTech(mixed)?.elementalEffect).toEqual({ Fire: 0.5, Air: 1 });
    const all = { name: "n", elementalEffect: { Fire: "1", Water: "2" } };
    expect(parseTech(all)).toEqual({ name: "n" });
    expect(parseTech({ name: "n", elementalEffect: {} })?.elementalEffect).toEqual({});
  });

  it("drops a non-finite number (1e999 parses to Infinity); control: finite is kept", () => {
    const body = JSON.parse('{"success":true,"technique":{"name":"n","elementalEffect":{"Fire":1e999},"duration":{"min":1,"max":1e999}}}');
    expect(parseTechniqueResponse(body).technique).toEqual({ name: "n" });
    const control = JSON.parse('{"success":true,"technique":{"name":"n","elementalEffect":{"Fire":1e3},"duration":{"min":1,"max":1e3}}}');
    expect(parseTechniqueResponse(control).technique).toEqual({
      name: "n",
      elementalEffect: { Fire: 1000 },
      duration: { min: 1, max: 1000 },
    });
  });

  it("drops a duration with only one bound; control: both bounds are kept", () => {
    expect(parseTech({ name: "n", duration: { min: 5 } })).toEqual({ name: "n" });
    expect(parseTech({ name: "n", duration: { max: 5 } })).toEqual({ name: "n" });
    expect(parseTech({ name: "n", duration: { min: 5, max: 9 } })?.duration).toEqual({ min: 5, max: 9 });
  });

  it("ignores fields the modal never reads, even when they are garbage", () => {
    const garbage = { chemicalChanges: "x", nutrientRetention: [1], history: 5, pairingSuggestions: {} };
    expect(parseTech({ name: "n", ...garbage })).toEqual({ name: "n" });
    expect(parseTech(garbage)).toEqual({});
  });
});

describe("parseTechniqueResponse: a technique where every sent field is mistyped", () => {
  const allBad = { description: 5, benefits: "x", elementalEffect: "y" };

  it("throws instead of reading drift as an empty technique", () => {
    expect(() => parseTech(allBad)).toThrow(/no well-typed displayable fields/);
  });

  it("control: one valid field alongside the same bad ones parses", () => {
    expect(parseTech({ ...allBad, name: "n" })).toEqual({ name: "n" });
  });

  it("control: a technique that sends no displayed field at all is tolerated", () => {
    expect(parseTech({})).toEqual({});
  });
});

const RENDERED_FIELDS: ReadonlyArray<keyof TechniqueData> = [
  "name", "description", "shortDescription", "culinaryArchetype", "elementalEffect",
  "duration", "suitable_for", "benefits", "toolsRequired", "commonMistakes",
  "optimalTemperatures", "scientificPrinciples", "expertTips", "doneness_indicators",
];

describe("parseTechniqueResponse: every real allCookingMethods entry", () => {
  const entries = Object.entries(allCookingMethods);

  it("parses every entry, keeps every field it sends, and returns each value unchanged", () => {
    const present: Record<string, number> = {};
    const kept: Record<string, number> = {};
    for (const [key, entry] of entries) {
      const raw = wire(entry);
      if (!isJsonRecord(raw)) throw new Error(`registry entry ${key} is not an object`);
      const parsed = parseTechniqueResponse(wire({ success: true, technique: entry, canonicalKey: key }));
      expect(parsed.canonicalKey).toBe(key);
      for (const field of RENDERED_FIELDS) {
        const sent = raw[field];
        const got = parsed.technique?.[field];
        if (sent !== undefined) present[field] = (present[field] ?? 0) + 1;
        if (got !== undefined) kept[field] = (kept[field] ?? 0) + 1;
        expect({ key, field, got }).toEqual({ key, field, got: sent });
      }
    }
    expect(kept).toEqual(present);
    // CookingMethodData requires these (cookingMethod.ts:41-54): all must survive.
    expect(entries.length).toBeGreaterThan(0);
    for (const field of ["name", "description", "elementalEffect", "duration", "suitable_for", "benefits"]) {
      expect({ field, count: kept[field] }).toEqual({ field, count: entries.length });
    }
  });

  it("fields the modal never read match the types its old interface declared", () => {
    const isList = (v: unknown): boolean => Array.isArray(v) && v.every((x) => typeof x === "string");
    const isMapOf = (type: string) => (v: unknown): boolean =>
      isJsonRecord(v) && Object.values(v).every((x) => typeof x === type);
    const checks: ReadonlyArray<readonly [string, (v: unknown) => boolean]> = [
      ["pairingSuggestions", isList],
      ["modernVariations", isList],
      ["history", (v) => typeof v === "string"],
      ["chemicalChanges", isMapOf("boolean")],
      ["nutrientRetention", isMapOf("number")],
      ["timingConsiderations", isMapOf("string")],
    ];
    const deviations: Record<string, number> = {};
    for (const [field] of checks) deviations[field] = 0;
    for (const [, entry] of entries) {
      const raw = wire(entry);
      if (!isJsonRecord(raw)) continue;
      for (const [field, ok] of checks) {
        if (raw[field] !== undefined && !ok(raw[field])) deviations[field] = (deviations[field] ?? 0) + 1;
      }
    }
    expect(deviations).toEqual({
      pairingSuggestions: 0,
      modernVariations: 0,
      history: 0,
      chemicalChanges: 0,
      nutrientRetention: 0,
      timingConsiderations: 0,
    });
  });
});
