/**
 * Fixtures mirror the rows `src/app/api/alchm-quantities/aspects/route.ts`
 * really builds: `routeRow` repeats the `result.push` block (route.ts:155-191)
 * on top of the REAL `computeOrb` / `computeAspectKinematics`, then the body goes
 * through `JSON.stringify` / `JSON.parse` so it is wire-shaped (a `NaN` becomes
 * `null`, exactly as it would leave the route). Every rejection is paired with
 * a control: the same body with that one field valid must pass, so the
 * rejection can only come from the parser.
 */
import { computeAspectKinematics, computeOrb } from "@/utils/aspectKinematics";
import { parseAspectsResponse } from "../planetaryAspectsParser";

const TIMESTAMP = "2026-11-12T09:30:00.000Z";
const NO_OBJECT = "Aspects response was not a JSON object";
const NO_ARRAY = "Aspects response had no aspects array";
const NO_TIMESTAMP = "Aspects response had no timestamp string";
const NO_MATCH = "No aspect in the response matched the expected shape";

interface RowSpec {
  planet1: string;
  planet2: string;
  type: string;
  aspectAngle: number;
  maxOrb: number;
  influence: string;
  L1: number;
  L2: number;
  m1: number;
  m2: number;
  sign1: string;
  deg1: number;
  sign2: string;
  deg2: number;
}

/** The route's `result.push` block (route.ts:155-191), over the real kinematics. */
function routeRow(s: RowSpec): Record<string, unknown> {
  const currentOrb = computeOrb(s.L1, s.L2, s.aspectAngle);
  const k = computeAspectKinematics(s.L1, s.L2, s.aspectAngle, s.m1, s.m2);
  const strength = Math.max(0, 1 - currentOrb / s.maxOrb);
  return {
    planet1: s.planet1,
    planet2: s.planet2,
    type: s.type,
    aspectAngle: s.aspectAngle,
    orbDegrees: parseFloat(currentOrb.toFixed(3)),
    sign1: s.sign1,
    degree1: Math.floor(s.deg1),
    sign2: s.sign2,
    degree2: Math.floor(s.deg2),
    strength: parseFloat(strength.toFixed(4)),
    applying: k.applying,
    daysToExact: parseFloat(k.daysToExact.toFixed(2)),
    influence: s.influence,
    orbVelocity: parseFloat(k.orbVelocity.toFixed(5)),
    relativeAngularVelocity: parseFloat((s.m1 - s.m2).toFixed(5)),
    state: k.state,
    velocitySource: "ephemeris",
  };
}

const SUN_MERCURY: RowSpec = {
  planet1: "Sun", planet2: "Mercury", type: "conjunction", aspectAngle: 0, maxOrb: 8,
  influence: "harmonious", L1: 100.5, L2: 102.25, m1: 0.9856, m2: 1.2,
  sign1: "cancer", deg1: 10.5, sign2: "cancer", deg2: 12.25,
};
const MOON_SATURN: RowSpec = {
  planet1: "Moon", planet2: "Saturn", type: "trine", aspectAngle: 120, maxOrb: 8,
  influence: "harmonious", L1: 50, L2: 175, m1: 13.2, m2: 0.05,
  sign1: "taurus", deg1: 20, sign2: "virgo", deg2: 25,
};
const JUPITER_SATURN: RowSpec = {
  planet1: "Jupiter", planet2: "Saturn", type: "sextile", aspectAngle: 60, maxOrb: 6,
  influence: "harmonious", L1: 10, L2: 70, m1: 0.1, m2: 0.1,
  sign1: "aries", deg1: 10, sign2: "gemini", deg2: 10,
};

/** Round-trip through JSON so the fixture is what a client would receive. */
function wire(value: unknown): unknown {
  const parsed: unknown = JSON.parse(JSON.stringify(value));
  return parsed;
}

function bodyAt(rows: unknown, timestamp: unknown): Record<string, unknown> {
  return { aspects: rows, timestamp };
}

function bodyOf(rows: unknown): Record<string, unknown> {
  return bodyAt(rows, TIMESTAMP);
}

function withoutKey(row: Record<string, unknown>, key: string): Record<string, unknown> {
  return Object.fromEntries(Object.entries(row).filter(([k]) => k !== key));
}

const sunMercury = routeRow(SUN_MERCURY);
const moonSaturn = routeRow(MOON_SATURN);
const jupiterSaturn = routeRow(JUPITER_SATURN);

describe("parseAspectsResponse: the producer's real bodies", (): void => {
  it("keeps the success body the route builds, row for row", (): void => {
    const parsed = parseAspectsResponse(wire(bodyOf([sunMercury, moonSaturn, jupiterSaturn])));
    expect(parsed.timestamp).toBe(TIMESTAMP);
    expect(parsed.aspects.map((a) => `${a.planet1}-${a.planet2}-${a.type}`)).toEqual([
      "Sun-Mercury-conjunction",
      "Moon-Saturn-trine",
      "Jupiter-Saturn-sextile",
    ]);
    expect(parsed.aspects[0]).toEqual({
      planet1: "Sun", planet2: "Mercury", type: "conjunction", aspectAngle: 0,
      orbDegrees: 1.75, strength: 0.7813, applying: false, daysToExact: 8.16,
      influence: "harmonious", sign1: "cancer", degree1: 10, sign2: "cancer", degree2: 12,
    });
  });

  it("reads applying from the real kinematics (Moon closing on Saturn, Sun-Mercury parting)", (): void => {
    const parsed = parseAspectsResponse(wire(bodyOf([sunMercury, moonSaturn])));
    expect(parsed.aspects.map((a) => a.applying)).toEqual([false, true]);
  });

  it("accepts a stationary pair, whose daysToExact is the finite 9999 cap", (): void => {
    const parsed = parseAspectsResponse(wire(bodyOf([jupiterSaturn])));
    expect(parsed.aspects[0]).toMatchObject({ daysToExact: 9999, applying: false, strength: 1 });
  });

  it("drops the kinematics fields the host never reads", (): void => {
    const parsed = parseAspectsResponse(wire(bodyOf([sunMercury])));
    const keys = Object.keys(parsed.aspects[0] ?? {});
    for (const unread of ["orbVelocity", "relativeAngularVelocity", "state", "velocitySource"]) {
      expect(keys).not.toContain(unread);
    }
  });

  it("accepts an empty aspects array as a valid empty result", (): void => {
    expect(parseAspectsResponse(wire(bodyOf([])))).toEqual({ aspects: [], timestamp: TIMESTAMP });
  });

  it("throws on the route's 500 refusal body (control: the success body parses)", (): void => {
    const refusal = wire({ error: "Failed to calculate aspects", details: "ephemeris unavailable" });
    expect(() => parseAspectsResponse(refusal)).toThrow(NO_ARRAY);
    expect(parseAspectsResponse(wire(bodyOf([sunMercury]))).aspects).toHaveLength(1);
  });
});

describe("parseAspectsResponse: the body", (): void => {
  it("rejects a real JSON null body (control: an object body parses)", (): void => {
    const parsed: unknown = JSON.parse("null");
    expect(() => parseAspectsResponse(parsed)).toThrow(NO_OBJECT);
    expect(parseAspectsResponse(wire(bodyOf([sunMercury]))).aspects).toHaveLength(1);
  });

  it.each([
    ["an array", "[]"],
    ["a string", '"aspects"'],
    ["a number", "7"],
    ["a boolean", "true"],
  ])("rejects %s as the body", (_label: string, json: string): void => {
    const parsed: unknown = JSON.parse(json);
    expect(() => parseAspectsResponse(parsed)).toThrow(NO_OBJECT);
  });

  it.each([
    ["missing", undefined],
    ["null", null],
    ["an object", { 0: {} }],
    ["a string", "[]"],
  ])("rejects aspects that is %s (control: an array parses)", (_label: string, bad: unknown): void => {
    expect(() => parseAspectsResponse(wire(bodyOf(bad)))).toThrow(NO_ARRAY);
    expect(parseAspectsResponse(wire(bodyOf([sunMercury]))).aspects).toHaveLength(1);
  });

  it.each([
    ["missing", undefined],
    ["null", null],
    ["a number", 1762939800000],
    ["an object", { iso: TIMESTAMP }],
  ])("rejects a timestamp that is %s (control: a string parses)", (_label: string, bad: unknown): void => {
    expect(() => parseAspectsResponse(wire(bodyAt([sunMercury], bad)))).toThrow(NO_TIMESTAMP);
    expect(parseAspectsResponse(wire(bodyAt([sunMercury], TIMESTAMP))).timestamp).toBe(TIMESTAMP);
  });
});

describe("parseAspectsResponse: the rows", (): void => {
  const READ_FIELDS: ReadonlyArray<readonly [string, unknown]> = [
    ["planet1", 5], ["planet2", null], ["type", ["trine"]], ["aspectAngle", "120"],
    ["orbDegrees", "1.75"], ["orbDegrees", null], ["strength", "0.78"], ["strength", true],
    ["applying", "true"], ["applying", 1], ["daysToExact", "8.16"], ["daysToExact", null],
  ];

  it.each(READ_FIELDS)("drops a row whose %s is %p and keeps its neighbour", (field: string, bad: unknown): void => {
    const broken = { ...sunMercury, [field]: bad };
    const parsed = parseAspectsResponse(wire(bodyOf([broken, moonSaturn])));
    expect(parsed.aspects.map((a) => a.planet1)).toEqual(["Moon"]);
    // control: the same row with that one field valid is kept
    const parsedControl = parseAspectsResponse(wire(bodyOf([sunMercury, moonSaturn])));
    expect(parsedControl.aspects.map((a) => a.planet1)).toEqual(["Sun", "Moon"]);
  });

  it.each(["planet1", "planet2", "type", "aspectAngle", "orbDegrees", "strength", "applying", "daysToExact"])(
    "drops a row that lacks %s (control: the whole row parses)",
    (field: string): void => {
      const parsed = parseAspectsResponse(wire(bodyOf([withoutKey(sunMercury, field), moonSaturn])));
      expect(parsed.aspects.map((a) => a.planet1)).toEqual(["Moon"]);
      expect(parseAspectsResponse(wire(bodyOf([sunMercury, moonSaturn]))).aspects).toHaveLength(2);
    },
  );

  it.each([
    ["null", "null"], ["a string", '"Sun"'], ["a number", "3"], ["an array", "[1,2]"],
  ])("drops a row that is %s and keeps its neighbour", (_label: string, json: string): void => {
    const junk: unknown = JSON.parse(json);
    expect(parseAspectsResponse(wire(bodyOf([junk, moonSaturn]))).aspects).toHaveLength(1);
    expect(parseAspectsResponse(wire(bodyOf([sunMercury, moonSaturn]))).aspects).toHaveLength(2);
  });

  it("throws when rows arrived and none matched (control: one good row survives)", (): void => {
    const allBad = [{ ...sunMercury, orbDegrees: "x" }, { ...moonSaturn, applying: "yes" }];
    expect(() => parseAspectsResponse(wire(bodyOf(allBad)))).toThrow(NO_MATCH);
    expect(parseAspectsResponse(wire(bodyOf([...allBad, jupiterSaturn]))).aspects).toHaveLength(1);
  });

  it("drops a row whose NaN orb crossed the wire as null (the host would crash on it)", (): void => {
    const nanOrb = routeRow({ ...SUN_MERCURY, L1: NaN });
    expect(JSON.stringify(nanOrb)).toContain('"orbDegrees":null');
    expect(() => parseAspectsResponse(wire(bodyOf([nanOrb])))).toThrow(NO_MATCH);
    expect(parseAspectsResponse(wire(bodyOf([nanOrb, moonSaturn]))).aspects).toHaveLength(1);
  });
});

describe("parseAspectsResponse: placement fields", (): void => {
  const PLACEMENT = ["sign1", "degree1", "sign2", "degree2"];

  it.each(PLACEMENT)("tolerates an absent %s, which the host defaults", (field: string): void => {
    const parsed = parseAspectsResponse(wire(bodyOf([withoutKey(sunMercury, field)])));
    expect(parsed.aspects).toHaveLength(1);
    expect(Object.keys(parsed.aspects[0] ?? {})).not.toContain(field);
  });

  it("keeps a row with no placement at all, and keeps present placement untouched", (): void => {
    const bare = PLACEMENT.reduce(withoutKey, sunMercury);
    const [row] = parseAspectsResponse(wire(bodyOf([bare]))).aspects;
    expect(row).toMatchObject({ planet1: "Sun", planet2: "Mercury" });
    expect(Object.keys(row ?? {})).not.toContain("sign1");
    const [full] = parseAspectsResponse(wire(bodyOf([sunMercury]))).aspects;
    expect(full).toMatchObject({ sign1: "cancer", degree1: 10, sign2: "cancer", degree2: 12 });
  });

  it.each([
    ["sign1", 3], ["sign1", null], ["sign2", false], ["sign2", ["leo"]],
    ["degree1", "10"], ["degree1", null], ["degree2", "12"], ["degree2", {}],
  ])("drops a row whose present %s is %p, rather than defaulting it", (field: string, bad: unknown): void => {
    const parsed = parseAspectsResponse(wire(bodyOf([{ ...sunMercury, [field]: bad }, moonSaturn])));
    expect(parsed.aspects.map((a) => a.planet1)).toEqual(["Moon"]);
    // control: the same field with a valid value keeps the row
    const parsedControl = parseAspectsResponse(wire(bodyOf([sunMercury, moonSaturn])));
    expect(parsedControl.aspects.map((a) => a.planet1)).toEqual(["Sun", "Moon"]);
  });
});

describe("parseAspectsResponse: influence and unread fields", (): void => {
  it.each(["harmonious", "challenging", "neutral"])("keeps influence %s", (influence: string): void => {
    const [row] = parseAspectsResponse(wire(bodyOf([{ ...sunMercury, influence }]))).aspects;
    expect(row?.influence).toBe(influence);
  });

  it.each([["fortunate"], [3], [null], [["harmonious"]]])(
    "keeps the row but not the unknown influence %p, because the host never reads it",
    (bad: unknown): void => {
      const parsed = parseAspectsResponse(wire(bodyOf([{ ...sunMercury, influence: bad }])));
      expect(parsed.aspects).toHaveLength(1);
      expect(Object.keys(parsed.aspects[0] ?? {})).not.toContain("influence");
      // control: a known influence on the same row is kept
      expect(parseAspectsResponse(wire(bodyOf([sunMercury]))).aspects[0]?.influence).toBe("harmonious");
    },
  );

  it("does not reject a row over mistyped kinematics fields it never reads", (): void => {
    const drifted = { ...sunMercury, orbVelocity: "fast", relativeAngularVelocity: null, state: 5, velocitySource: [] };
    expect(parseAspectsResponse(wire(bodyOf([drifted]))).aspects).toHaveLength(1);
  });

  it("does not coerce a numeric string into a number", (): void => {
    const stringly = { ...sunMercury, strength: "0.7813" };
    expect(() => parseAspectsResponse(wire(bodyOf([stringly])))).toThrow(NO_MATCH);
    expect(parseAspectsResponse(wire(bodyOf([{ ...stringly, strength: 0.7813 }]))).aspects).toHaveLength(1);
  });
});
