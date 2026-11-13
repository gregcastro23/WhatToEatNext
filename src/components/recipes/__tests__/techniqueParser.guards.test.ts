/**
 * Companion to `techniqueParser.test.ts`: pins the "nothing survived" detector
 * for EVERY displayable key and the `undefined`-vs-JSON-`null` semantics of the
 * two `sent` checks (one in `parseElementalEffect`, one in `parseTechnique`).
 *
 * Every rejection is paired with a control: the same body with that one value
 * valid must parse, so a rejection can only come from the parser.
 */

import { parseTechniqueResponse, type TechniqueData } from "../techniqueParser";

/** What `NextResponse.json` does to a value: stringify (drops undefined), parse. */
function wire(value: unknown): unknown {
  return JSON.parse(JSON.stringify(value));
}

function parseTech(technique: unknown): TechniqueData | undefined {
  const body = wire({ success: true, technique, canonicalKey: "roasting" });
  return parseTechniqueResponse(body).technique;
}

/** A technique that sends exactly one key. */
function only(key: string, value: unknown): Record<string, unknown> {
  return { [key]: value };
}

const NO_FIELDS = /no well-typed displayable fields/;

/** [key, a mistyped value, a valid value] for each of the 14 displayable keys. */
type FieldCase = [string, unknown, unknown];

const FIELD_CASES: FieldCase[] = [
  ["name", 5, "roasting"],
  ["description", 5, "Dry-heat cooking in an oven."],
  ["shortDescription", 5, "Dry heat, deep browning."],
  ["culinaryArchetype", 5, "The Forger"],
  ["elementalEffect", 5, { Fire: 0.7, Water: 0.1, Earth: 0.4, Air: 0.2 }],
  ["duration", 5, { min: 20, max: 180 }],
  ["suitable_for", 5, ["vegetables", "poultry"]],
  ["benefits", 5, ["Deep browning"]],
  ["toolsRequired", 5, ["oven", "roasting pan"]],
  ["commonMistakes", 5, ["Crowding the pan"]],
  ["optimalTemperatures", 5, { vegetables: 425, poultry: 375 }],
  ["scientificPrinciples", 5, ["Maillard reaction above 285F"]],
  ["expertTips", 5, ["Rest the meat"]],
  ["doneness_indicators", 5, { chicken: "juices run clear" }],
];

describe("parseTechniqueResponse: a technique whose only key is mistyped", (): void => {
  it.each(FIELD_CASES)(
    "%s: a mistyped lone value throws; the same key valid parses and is kept",
    (key: string, bad: unknown, good: unknown): void => {
      expect(() => parseTech(only(key, bad))).toThrow(NO_FIELDS);
      expect(parseTech(only(key, good))).toEqual(only(key, good));
    },
  );

  it("the table covers every displayable key (all 14 valid values survive together)", (): void => {
    const everything = Object.fromEntries(FIELD_CASES.map(([key, , good]) => [key, good]));
    const parsed = parseTech(everything);
    expect(FIELD_CASES).toHaveLength(14);
    expect(Object.keys(parsed ?? {}).sort()).toEqual(FIELD_CASES.map(([key]) => key).sort());
  });

  it("throws when several keys are sent and every one is mistyped", (): void => {
    const technique = { toolsRequired: "x", commonMistakes: 1, duration: { min: "a" } };
    expect(() => parseTech(technique)).toThrow(NO_FIELDS);
  });

  it("control: one valid field alongside the mistyped ones parses and keeps only that field", (): void => {
    const technique = { toolsRequired: "x", commonMistakes: 1, duration: { min: "a" }, name: "n" };
    expect(parseTech(technique)).toEqual({ name: "n" });
  });
});

describe("parseTechniqueResponse: sent-but-unusable versus not sent", (): void => {
  it("drops an elementalEffect whose only entry is JSON null instead of returning {}", (): void => {
    const parsed = parseTech({ name: "n", elementalEffect: { Fire: null } });
    expect(parsed).toEqual({ name: "n" });
    expect(Object.keys(parsed ?? {})).toEqual(["name"]);
  });

  it("control: a finite Fire entry keeps the elementalEffect", (): void => {
    const parsed = parseTech({ name: "n", elementalEffect: { Fire: 0.5 } });
    expect(parsed).toEqual({ name: "n", elementalEffect: { Fire: 0.5 } });
  });

  it("control: an elementalEffect that sends no element at all is kept as {}", (): void => {
    expect(parseTech({ name: "n", elementalEffect: {} })).toEqual({ name: "n", elementalEffect: {} });
  });

  it("throws when the only key is an elementalEffect whose only entry is JSON null", (): void => {
    expect(() => parseTech({ elementalEffect: { Fire: null } })).toThrow(NO_FIELDS);
    expect(parseTech({ elementalEffect: { Fire: 0.5 } })).toEqual({ elementalEffect: { Fire: 0.5 } });
  });

  it("throws when the only key is JSON null: null counts as sent-but-unusable", (): void => {
    expect(() => parseTech({ description: null })).toThrow(NO_FIELDS);
  });

  it("control: a technique that sends nothing parses to {}", (): void => {
    expect(parseTech({})).toEqual({});
  });

  it("control: the same key with a valid value parses and is kept", (): void => {
    expect(parseTech({ description: "Dry heat." })).toEqual({ description: "Dry heat." });
  });
});
