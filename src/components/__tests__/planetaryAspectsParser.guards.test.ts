/**
 * Companion to `planetaryAspectsParser.test.ts`: pins the finite-number policy
 * and the order in which the body is validated.
 *
 * `JSON.stringify` turns Infinity into `null`, so a genuinely non-finite body is
 * built as JSON TEXT: `JSON.parse('{"x":1e999}')` yields Infinity. Every
 * rejection is paired with a control that goes through the SAME text path with
 * the field's finite value, so a rejection can only come from the parser.
 */
import { computeAspectKinematics, computeOrb } from "@/utils/aspectKinematics";
import { parseAspectsResponse } from "../planetaryAspectsParser";

const TIMESTAMP = "2026-11-12T09:30:00.000Z";
const NO_ARRAY = /no aspects array/;
const NO_TIMESTAMP = /no timestamp string/;
const NO_MATCH = /No aspect in the response matched the expected shape/;
const SENTINEL = "__NON_FINITE__";

interface RowSpec {
  planet1: string;
  planet2: string;
  type: string;
  aspectAngle: number;
  maxOrb: number;
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
    influence: "harmonious",
  };
}

const sunMercury = routeRow({
  planet1: "Sun", planet2: "Mercury", type: "conjunction", aspectAngle: 0, maxOrb: 8,
  L1: 100.5, L2: 102.25, m1: 0.9856, m2: 1.2,
  sign1: "cancer", deg1: 10.5, sign2: "cancer", deg2: 12.25,
});
const moonSaturn = routeRow({
  planet1: "Moon", planet2: "Saturn", type: "trine", aspectAngle: 120, maxOrb: 8,
  L1: 50, L2: 175, m1: 13.2, m2: 0.05,
  sign1: "taurus", deg1: 20, sign2: "virgo", deg2: 25,
});

/**
 * Body JSON text whose row `at` carries `literal` (a JSON number such as
 * `1e999`) in `field`; every other value is the row's own.
 */
function bodyText(
  rows: readonly Record<string, unknown>[],
  field: string,
  at: number,
  literal: string,
): string {
  const marked = rows.map((row, i) => (i === at ? { ...row, [field]: SENTINEL } : row));
  return JSON.stringify({ aspects: marked, timestamp: TIMESTAMP }).replace(`"${SENTINEL}"`, literal);
}

function parseText(text: string): ReturnType<typeof parseAspectsResponse> {
  const body: unknown = JSON.parse(text);
  return parseAspectsResponse(body);
}

function wire(value: unknown): unknown {
  const parsed: unknown = JSON.parse(JSON.stringify(value));
  return parsed;
}

const NUMERIC_FIELDS: string[] = [
  "aspectAngle",
  "orbDegrees",
  "strength",
  "daysToExact",
  "degree1",
  "degree2",
];

describe("parseAspectsResponse: the fixtures are what they claim", (): void => {
  it("JSON text with 1e999 parses to Infinity, while stringify would have sent null", (): void => {
    const fromText: unknown = JSON.parse('{"x":1e999}');
    expect(fromText).toEqual({ x: Infinity });
    expect(JSON.stringify({ x: Infinity })).toBe('{"x":null}');
  });

  it.each(NUMERIC_FIELDS)("%s: the body text carries a literal 1e999 in the first row only", (field: string): void => {
    const text = bodyText([sunMercury, moonSaturn], field, 0, "1e999");
    expect(text.split("1e999")).toHaveLength(2);
    expect(text).toContain(`"${field}":1e999`);
    expect(text).not.toContain(SENTINEL);
  });
});

describe("parseAspectsResponse: a non-finite number drops the row", (): void => {
  it.each(NUMERIC_FIELDS)(
    "%s: 1e999 in the only row throws; the identical row with its finite value is kept",
    (field: string): void => {
      expect(() => parseText(bodyText([sunMercury], field, 0, "1e999"))).toThrow(NO_MATCH);
      const finite = String(sunMercury[field]);
      const kept = parseText(bodyText([sunMercury], field, 0, finite)).aspects;
      expect(kept).toHaveLength(1);
      expect(kept[0]).toMatchObject({ planet1: "Sun", [field]: sunMercury[field] });
    },
  );

  it.each(NUMERIC_FIELDS)(
    "%s: 1e999 in one row drops only that row; the valid sibling is kept",
    (field: string): void => {
      const parsed = parseText(bodyText([sunMercury, moonSaturn], field, 0, "1e999"));
      expect(parsed.aspects.map((a) => a.planet1)).toEqual(["Moon"]);
      const reversed = parseText(bodyText([moonSaturn, sunMercury], field, 1, "1e999"));
      expect(reversed.aspects.map((a) => a.planet1)).toEqual(["Moon"]);
    },
  );

  it("drops a row on negative infinity as well (control: its finite value is kept)", (): void => {
    expect(() => parseText(bodyText([sunMercury], "orbDegrees", 0, "-1e999"))).toThrow(NO_MATCH);
    const finite = String(sunMercury.orbDegrees);
    expect(parseText(bodyText([sunMercury], "orbDegrees", 0, finite)).aspects).toHaveLength(1);
  });

  it("keeps an absent degree1 / degree2 (the host defaults them), unlike a non-finite one", (): void => {
    const dropped = ["degree1", "degree2"];
    const withoutDegrees = Object.fromEntries(Object.entries(sunMercury).filter(([k]) => !dropped.includes(k)));
    expect(Object.keys(withoutDegrees)).toHaveLength(Object.keys(sunMercury).length - 2);
    const parsed = parseAspectsResponse(wire({ aspects: [withoutDegrees], timestamp: TIMESTAMP }));
    expect(parsed.aspects).toHaveLength(1);
    expect(parsed.aspects[0]).not.toHaveProperty("degree1");
    expect(parsed.aspects[0]).not.toHaveProperty("degree2");
  });
});

describe("parseAspectsResponse: the body is validated aspects first, then timestamp", (): void => {
  it("a bad aspects wins over a bad timestamp", (): void => {
    expect(() => parseAspectsResponse(wire({ aspects: "x", timestamp: 5 }))).toThrow(NO_ARRAY);
  });

  it("a valid aspects array lets the bad timestamp surface", (): void => {
    expect(() => parseAspectsResponse(wire({ aspects: [], timestamp: 5 }))).toThrow(NO_TIMESTAMP);
  });

  it("control: a valid aspects array and a string timestamp parse", (): void => {
    const timestamp = "2026-11-12T00:00:00.000Z";
    expect(parseAspectsResponse(wire({ aspects: [], timestamp }))).toEqual({ aspects: [], timestamp });
  });
});
