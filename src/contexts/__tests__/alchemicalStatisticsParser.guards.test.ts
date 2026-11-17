/**
 * Guards for the statistics wire parser. Every rejection runs on a deep copy of
 * the REAL route body with one value changed, and is paired with a CONTROL: the
 * unmodified body, or a valid replacement, is accepted by the same parser, so a
 * rejection is the parser's doing and not a broken fixture.
 */
import { GET } from "@/app/api/alchm-quantities/statistics/route";
import { readJson } from "@/lib/api/json";
import { getSampleFileMeta } from "@/utils/alchemicalSampleLookup";
import { parseAllPeriodsResponse, type StatisticsPayload } from "../alchemicalStatisticsParser";

const { startMs, endMs, generatedAt, intervalHours, count } = getSampleFileMeta();
const URL_BASE = "http://localhost/api/alchm-quantities/statistics?all=true&ref=";
const REMOVE = Symbol("remove");
const NULL_SLOTS = { day: null, week: null, month: null, quarter: null, year: null, all: null };
const SUMMARY_FIELDS = [
  "count", "mean", "stdDev", "variance", "min", "max", "median", "p10", "p25", "p75", "p90",
  "skewness", "current", "zScore", "percentileRank",
];
const GROUPS: Array<[string, string[]]> = [
  ["esms", ["Spirit", "Essence", "Matter", "Substance"]],
  ["thermo", ["heat", "entropy", "reactivity", "gregsEnergy", "kalchm", "monica"]],
  ["elemental", ["Fire", "Water", "Earth", "Air"]],
];

let realBody: unknown;
let base: StatisticsPayload;

beforeAll(async () => {
  const middle = new Date(Math.floor((startMs + endMs) / 2)).toISOString();
  realBody = JSON.parse(await (await GET(new Request(URL_BASE + encodeURIComponent(middle)))).text());
  base = parseAllPeriodsResponse(realBody);
});

function clone(value: unknown): unknown {
  return JSON.parse(JSON.stringify(value));
}

function reach(root: unknown, path: readonly string[]): unknown {
  let cursor: unknown = root;
  for (const key of path) {
    if (typeof cursor !== "object" || cursor === null) throw new Error(`no ${key} on ${path.join(".")}`);
    cursor = Reflect.get(cursor, key);
  }
  return cursor;
}

/** A deep copy of the real body with the value at `path` replaced (or removed). */
function withValue(path: readonly string[], replacement: unknown, source: unknown = realBody): unknown {
  const body = clone(source);
  const key = path[path.length - 1];
  const parent = reach(body, path.slice(0, -1));
  if (key === undefined || typeof parent !== "object" || parent === null) {
    throw new Error(`bad fixture path ${path.join(".")}`);
  }
  if (replacement === REMOVE) {
    Reflect.deleteProperty(parent, key);
  } else {
    Reflect.set(parent, key, replacement);
  }
  return body;
}

/** Like withValue, but the replacement is raw JSON text, so 1e999 really parses to Infinity. */
function withLiteral(path: readonly string[], literal: string): unknown {
  const text = JSON.stringify(withValue(path, "__LITERAL__")).replace('"__LITERAL__"', literal);
  return JSON.parse(text);
}

const week = (...path: string[]): string[] => ["periods", "week", ...path];

/** The parse succeeds, `week` alone is dropped to null, and its neighbours are untouched. */
function expectWeekDropped(wire: unknown): void {
  const parsed = parseAllPeriodsResponse(wire);
  expect(parsed.periods.week).toBeNull();
  expect(parsed.periods.day).toStrictEqual(base.periods.day);
  expect(parsed.periods.all).toStrictEqual(base.periods.all);
  expect(parsed.issues).toStrictEqual(["periods.week: malformed period dropped"]);
}

const BAD_FIELDS: Array<[string, string[], unknown]> = [
  ["startMs is null (NaN on the wire)", ["startMs"], null],
  ["endMs is a string", ["endMs"], "1"],
  ["sampleCount is missing", ["sampleCount"], REMOVE],
  ["intervalHours is null", ["intervalHours"], null],
  ["period echoes another key", ["period"], "day"],
  ["period is missing", ["period"], REMOVE],
  ["current is missing", ["current"], REMOVE],
  ["current.ts is null", ["current", "ts"], null],
  ["current.isDiurnal is a number", ["current", "isDiurnal"], 1],
  ["meta is an array", ["meta"], []],
  ["meta.fileGeneratedAt is a number", ["meta", "fileGeneratedAt"], 5],
  ["meta.fileVersion is null", ["meta", "fileVersion"], null],
  ["meta.fileCount is a string", ["meta", "fileCount"], "3"],
  ["aNumber is missing", ["aNumber"], REMOVE],
  ["derived is missing", ["derived"], REMOVE],
  ["derived.aNumber is null", ["derived", "aNumber"], null],
  ["perPlanet is null", ["perPlanet"], null],
  ["spark is missing", ["aNumber", "spark"], REMOVE],
  ["spark is a string", ["aNumber", "spark"], "1,2"],
  ["a spark entry is null", ["aNumber", "spark", "0"], null],
  ["a spark entry is a string", ["aNumber", "spark", "1"], "2"],
  ["hist is missing", ["aNumber", "hist"], REMOVE],
  ["hist is an array", ["aNumber", "hist"], []],
  ["hist.edges is missing", ["aNumber", "hist", "edges"], REMOVE],
  ["hist.centers is a number", ["aNumber", "hist", "centers"], 5],
  ["a hist.counts entry is null", ["aNumber", "hist", "counts", "0"], null],
  ["hist.binWidth is null", ["aNumber", "hist", "binWidth"], null],
  ...SUMMARY_FIELDS.map((f): [string, string[], unknown] => [`aNumber.${f} is null`, ["aNumber", f], null]),
  ...GROUPS.flatMap(([group, keys]) =>
    keys.flatMap((key): Array<[string, string[], unknown]> => [
      [`${group}.${key} is missing`, [group, key], REMOVE],
      [`${group}.${key}.mean is a string`, [group, key, "mean"], "0"],
    ]),
  ),
  ...GROUPS.map(([group]): [string, string[], unknown] => [`${group} is null`, [group], null]),
];

const INFINITE: Array<[string, string[], string]> = [
  ["aNumber.mean = 1e999", ["aNumber", "mean"], "1e999"],
  ["aNumber.min = -1e999", ["aNumber", "min"], "-1e999"],
  ["a spark entry = 1e999", ["aNumber", "spark", "0"], "1e999"],
  ["a histogram edge = 1e999", ["esms", "Spirit", "hist", "edges", "0"], "1e999"],
  ["startMs = 1e999", ["startMs"], "1e999"],
  ["current.ts = 1e999", ["current", "ts"], "1e999"],
  ["meta.fileCount = -1e999", ["meta", "fileCount"], "-1e999"],
];

describe("controls", () => {
  it("accepts the unmodified real body: six periods, three file keys", () => {
    expect(Object.values(base.periods).every((slot) => slot !== null)).toBe(true);
    expect(base.file).toStrictEqual({ generatedAt, intervalHours, count });
    expect(JSON.stringify({ n: Infinity, m: NaN })).toBe('{"n":null,"m":null}');
    expect(reach(withLiteral(week("startMs"), "1e999"), week("startMs"))).toBe(Infinity);
  });

  it("accepts a valid replacement for each kind of field the tables corrupt", () => {
    const edits: Array<[string[], unknown]> = [
      [week("startMs"), 0], [week("aNumber", "mean"), -3.5], [week("current", "isDiurnal"), false],
      [week("meta", "fileGeneratedAt"), ""], [week("aNumber", "spark"), []],
      [week("aNumber", "hist", "binWidth"), 0],
    ];
    for (const [path, value] of edits) {
      const parsed = parseAllPeriodsResponse(withValue(path, value));
      expect(parsed.periods.week).not.toBeNull();
      expect(reach(parsed.periods.week, path.slice(2))).toStrictEqual(value);
    }
  });

  it("ignores keys the producer may add later", () => {
    for (const path of [week("extra"), week("aNumber", "extra"), week("aNumber", "hist", "extra")]) {
      expect(parseAllPeriodsResponse(withValue(path, 1)).periods.week).toStrictEqual(base.periods.week);
    }
  });
});

describe("the body is not a statistics response", () => {
  it.each(["null", "[]", '"text"', "7", "true"])("rejects the JSON text %s", (text) => {
    expect(() => parseAllPeriodsResponse(JSON.parse(text))).toThrow("expected a JSON object");
  });

  it("rejects a JSON null read through readJson, as the host reads it", async () => {
    await expect(readJson(new Response("null"), parseAllPeriodsResponse)).rejects.toThrow(
      "expected a JSON object",
    );
  });

});

describe("the producer's refusals and a 200 that is not a success", () => {
  it("refuses the REAL 500 body the route builds when it throws (route.ts:101-111)", async () => {
    const request = new Request(URL_BASE);
    Object.defineProperty(request, "url", { value: "not a url" }); // new URL() throws inside the route's try
    const quiet = jest.spyOn(console, "error").mockImplementation(() => undefined);
    const res = await GET(request);
    quiet.mockRestore();
    expect(res.status).toBe(500);
    const refusal: unknown = JSON.parse(await res.text());
    expect(refusal).toMatchObject({ success: false, error: "Failed to compute statistics", details: expect.any(String) });
    expect(() => parseAllPeriodsResponse(refusal)).toThrow("API reported failure");
    expect(() => parseAllPeriodsResponse(withValue(["success"], false))).toThrow("API reported failure");
    expect(parseAllPeriodsResponse(withValue(["success"], true))).toStrictEqual(base);
  });

  it("refuses the REAL rate-limit 429 body, which has no success key", async () => {
    const statuses: number[] = [];
    let refusal: unknown = null;
    for (let i = 0; i < 61; i++) {
      const headers = { "x-forwarded-for": "203.0.113.9" };
      const res = await GET(new Request(URL_BASE + encodeURIComponent(new Date(startMs - 1e8).toISOString()), { headers }));
      statuses.push(res.status);
      if (res.status === 429) refusal = JSON.parse(await res.text());
    }
    expect(statuses.slice(0, 60).every((s) => s === 200)).toBe(true);
    expect(statuses[60]).toBe(429);
    expect(() => parseAllPeriodsResponse(refusal)).toThrow("success is not true");
  });

  it.each<[string, unknown]>([["the string true", "true"], ["1", 1], ["null", null], ["missing", REMOVE]])(
    "refuses success = %s",
    (_label, bad) => {
      expect(() => parseAllPeriodsResponse(withValue(["success"], bad))).toThrow("success is not true");
    },
  );

  it.each<[string, unknown]>([["missing", REMOVE], ["null", null], ["an array", []], ["a string", "x"]])(
    "refuses periods that are %s",
    (_label, bad) => {
      expect(() => parseAllPeriodsResponse(withValue(["periods"], bad))).toThrow("expected a periods record");
    },
  );
});

describe("period slots", () => {
  it("accepts six empty windows: an empty answer, not drift", () => {
    const parsed = parseAllPeriodsResponse(withValue(["periods"], NULL_SLOTS));
    expect(parsed.periods).toStrictEqual(NULL_SLOTS);
    expect(parsed.issues).toStrictEqual([]);
  });

  it("throws when slots arrived and none parsed, even beside legitimate nulls", () => {
    expect(() => parseAllPeriodsResponse(withValue(["periods"], { ...NULL_SLOTS, week: 5 }))).toThrow(
      "none of 1 period entries matched",
    );
    expect(() => parseAllPeriodsResponse(withValue(["periods"], {}))).toThrow("none of 6 period entries matched");
  });

  it.each<[string, unknown]>([
    ["a number", 5], ["a string", "x"], ["an array", []], ["true", true], ["an empty record", {}], ["missing", REMOVE],
  ])("drops a slot that is %s and keeps its neighbours", (_label, bad) => {
    expectWeekDropped(withValue(week(), bad));
  });

  it.each(BAD_FIELDS)("drops the period when %s", (_label, path, bad) => {
    expectWeekDropped(withValue(week(...path), bad));
  });

  it.each(INFINITE)("drops the period when %s", (_label, path, literal) => {
    expectWeekDropped(withLiteral(week(...path), literal));
  });
});

describe("planet rows and file meta", () => {
  it("drops one malformed planet row and keeps the other nine", () => {
    const kept = (payload: StatisticsPayload): string[] => Object.keys(payload.periods.week?.perPlanet ?? {});
    expect(kept(base)).toHaveLength(10);
    const corruptions: Array<[string[], unknown]> = [
      [["esms", "Spirit", "mean"], null], [["elements", "Fire"], REMOVE], [["esms"], 5], [["elements"], null],
    ];
    for (const [inner, bad] of corruptions) {
      const parsed = parseAllPeriodsResponse(withValue(week("perPlanet", "Pluto", ...inner), bad));
      expect(kept(parsed)).toHaveLength(9);
      expect(kept(parsed)).not.toContain("Pluto");
      expect(parsed.issues).toStrictEqual(["periods.week.perPlanet: dropped 1 malformed planet row(s)"]);
    }
    const twoBad = withValue(week("perPlanet", "Mars", "esms"), 5, withValue(week("perPlanet", "Pluto", "esms"), 5));
    expect(parseAllPeriodsResponse(twoBad).issues).toStrictEqual([
      "periods.week.perPlanet: dropped 2 malformed planet row(s)",
    ]);
    expectWeekDropped(withValue(week("startMs"), null, withValue(week("perPlanet", "Pluto", "esms"), 5)));
  });

  it("drops the period when planet rows arrived and none parsed, keeps an empty record", () => {
    expectWeekDropped(withValue(week("perPlanet"), { Sun: 1, Moon: "x" }));
    expect(parseAllPeriodsResponse(withValue(week("perPlanet"), {})).periods.week?.perPlanet).toStrictEqual({});
  });

  it("keeps a __proto__ planet name as data, not as a prototype", () => {
    const poisoned: unknown = JSON.parse(`{"__proto__":${JSON.stringify(reach(realBody, week("perPlanet", "Sun")))}}`);
    const perPlanet = parseAllPeriodsResponse(withValue(week("perPlanet"), poisoned)).periods.week?.perPlanet;
    expect(Object.keys(perPlanet ?? {})).toStrictEqual(["__proto__"]);
    expect(Object.getPrototypeOf(perPlanet)).toBe(Object.prototype);
  });

  it.each<[string, unknown]>([
    ["missing", REMOVE], ["null", null], ["an array", []], ["a string", "x"],
    ["generatedAt a number", { generatedAt: 5, intervalHours: 6, count: 1 }],
    ["intervalHours null", { generatedAt: "t", intervalHours: null, count: 1 }],
    ["count missing", { generatedAt: "t", intervalHours: 6 }],
  ])("sets fileMeta to null, periods untouched, when file is %s", (_label, bad) => {
    const parsed = parseAllPeriodsResponse(withValue(["file"], bad));
    expect(parsed.file).toBeNull();
    expect(parsed.periods).toStrictEqual(base.periods);
    expect(parsed.issues).toStrictEqual(["file: missing or malformed file metadata, set to null"]);
  });

  it("keeps the three declared file keys and treats Infinity as malformed", () => {
    const wide = { generatedAt: "t", intervalHours: 6, count: 1, version: 1, startMs: 0, endMs: 1 };
    expect(parseAllPeriodsResponse(withValue(["file"], wide)).file).toStrictEqual({
      generatedAt: "t", intervalHours: 6, count: 1,
    });
    expect(parseAllPeriodsResponse(withLiteral(["file", "count"], "1e999")).file).toBeNull();
  });
});
