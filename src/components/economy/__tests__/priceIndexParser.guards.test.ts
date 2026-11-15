/**
 * @jest-environment node
 *
 * Failure guards for parsePriceIndexResponse, each paired with a CONTROL: the
 * unmodified body is accepted by the same parser, so a rejection is the
 * parser's doing and not a broken fixture. The control is assembled from the
 * REAL oracle and USD rails exactly as route.ts:113-120 does; the main test
 * drives the route itself. Non-finite numbers are built from JSON TEXT,
 * because JSON.stringify(Infinity) is null and would test a different guard.
 */

import { readJson } from "@/lib/api/json";
import { getLivePriceIndexSnapshot } from "@/lib/economy/priceIndex";
import { getUsdRails } from "@/lib/economy/usdRails";
import { parsePriceIndexResponse, type LiveTickerPayload } from "../priceIndexParser";

type Wire = Record<string, unknown>;

const RAW = "__RAW_JSON_NUMBER__";
const SNAPSHOT = getLivePriceIndexSnapshot();
const LIVE_SUPPLY = { live: true, spirit: 1200.5, essence: 800, matter: 42, substance: 7 };
const CONTROL: Wire = {
  success: true,
  live: true,
  generatedAt: "2026-11-14T12:00:00.000Z",
  ...SNAPSHOT,
  railsUsd: getUsdRails(),
  supply: LIVE_SUPPLY,
};
const REQUIRED = [
  "aNumber",
  "multiplier",
  "isDiurnal",
  "sunSign",
  "dominantElement",
  "tokens",
  "compositeIndex",
  "composite24hPct",
  "degraded",
  "basis",
  "railsUsd",
];
const REFUSAL_MESSAGE = "Price oracle unavailable — the position engine failed";
const INVALID = "Invalid price-index response";

/** JSON round trip; a RAW sentinel string becomes the given raw number text. */
function viaJson(value: unknown, rawNumber?: string): unknown {
  const text = JSON.stringify(value);
  return JSON.parse(rawNumber === undefined ? text : text.replace(`"${RAW}"`, rawNumber));
}

function wire(overrides: Wire = {}, rawNumber?: string): unknown {
  return viaJson({ ...CONTROL, ...overrides }, rawNumber);
}

function omit(field: string): unknown {
  return viaJson(Object.fromEntries(Object.entries(CONTROL).filter(([key]) => key !== field)));
}

function payloadOf(value: unknown): LiveTickerPayload {
  const { payload } = parsePriceIndexResponse(value);
  if (payload === null) throw new Error("expected a live payload");
  return payload;
}

function tokensWith(index: number, patch: Wire): Wire[] {
  return SNAPSHOT.tokens.map((row, i) => (i === index ? { ...row, ...patch } : { ...row }));
}

function keptTokens(overrides: Wire, rawNumber?: string): string[] {
  return payloadOf(wire(overrides, rawNumber)).tokens.map((quote) => quote.token);
}

describe("control and shape", () => {
  it("accepts the producer-shaped control and returns only what the ticker reads", () => {
    const payload = payloadOf(wire());
    expect(Object.keys(payload).sort()).toEqual([...REQUIRED, "supply"].sort());
    expect(payload.tokens).toHaveLength(4);
    expect(payload.supply).toEqual(LIVE_SUPPLY);
  });

  it("fixture premise: 1e999 parses to Infinity while JSON.stringify(Infinity) is null", () => {
    expect(viaJson({ a: RAW }, "1e999")).toEqual({ a: Infinity });
    expect(JSON.stringify({ a: Infinity })).toBe('{"a":null}');
  });

  it("rejects JSON null, arrays and scalars (real JSON.parse results)", () => {
    for (const text of ["null", "[]", '"price"', "42", "true"]) {
      const parsed: unknown = JSON.parse(text);
      expect(() => parsePriceIndexResponse(parsed)).toThrow("expected a JSON object");
    }
  });
});

describe("refusals keep the HTTP-status fallback reachable", () => {
  it("surfaces the 503 body's message, and null when it carried none or a non-string", () => {
    const refusal = { success: false, live: false, message: REFUSAL_MESSAGE };
    expect(parsePriceIndexResponse(viaJson(refusal))).toEqual({
      payload: null,
      message: REFUSAL_MESSAGE,
    });
    expect(parsePriceIndexResponse(viaJson({ success: false, live: false }))).toEqual({
      payload: null,
      message: null,
    });
    for (const message of [5, null, { text: "x" }]) {
      expect(parsePriceIndexResponse(viaJson({ ...refusal, message })).message).toBeNull();
    }
    expect(parsePriceIndexResponse(viaJson({ ...refusal, message: "" })).message).toBe("");
    expect(parsePriceIndexResponse(viaJson({}))).toEqual({ payload: null, message: null });
  });

  it("is live only when success AND live are both exactly true", () => {
    const quiet = { payload: null, message: "why" };
    expect(parsePriceIndexResponse(wire({ live: false, message: "why" }))).toEqual(quiet);
    expect(parsePriceIndexResponse(wire({ success: false, message: "why" }))).toEqual(quiet);
    expect(parsePriceIndexResponse(wire({ success: "true", message: "why" }))).toEqual(quiet);
    expect(parsePriceIndexResponse(wire({ live: "true", message: "why" }))).toEqual(quiet);
    expect(parsePriceIndexResponse(wire()).payload).not.toBeNull();
  });
});

describe("top-level fields the ticker reads", () => {
  const WRONG_TYPED: ReadonlyArray<readonly [string, unknown]> = [
    ["aNumber", "1.5"],
    ["aNumber", null],
    ["multiplier", true],
    ["isDiurnal", "true"],
    ["isDiurnal", 1],
    ["sunSign", 5],
    ["sunSign", null],
    ["dominantElement", null],
    ["dominantElement", {}],
    ["compositeIndex", "1"],
    ["composite24hPct", null],
    ["degraded", "x"],
    ["degraded", [1]],
    ["degraded", {}],
    ["basis", null],
    ["basis", { model: "m" }],
    ["basis", { model: 1, engine: "e" }],
    ["railsUsd", null],
    ["railsUsd", []],
    ["railsUsd", { mintPerTokenUsd: "0.025", redeemPerTokenUsd: null }],
    ["railsUsd", { mintPerTokenUsd: 0.025 }],
    ["tokens", "x"],
    ["tokens", {}],
  ];

  it.each(WRONG_TYPED)("rejects %s = %j", (field, bad) => {
    expect(() => parsePriceIndexResponse(wire({ [field]: bad }))).toThrow(INVALID);
  });

  it.each(REQUIRED)("rejects a body with no %s", (field) => {
    expect(() => parsePriceIndexResponse(omit(field))).toThrow(INVALID);
  });

  it.each(["aNumber", "multiplier", "compositeIndex", "composite24hPct"])(
    "rejects %s = 1e999 and -1e999 built from JSON text",
    (field) => {
      for (const raw of ["1e999", "-1e999"]) {
        expect(() => parsePriceIndexResponse(wire({ [field]: RAW }, raw))).toThrow(
          `${field} must be a finite number`,
        );
      }
    },
  );

  it("rejects a non-finite USD rate built from JSON text", () => {
    const rails = { mintPerTokenUsd: RAW, redeemPerTokenUsd: null };
    expect(() => parsePriceIndexResponse(wire({ railsUsd: rails }, "1e999"))).toThrow(INVALID);
  });

  it("CONTROL: legitimate values the guards must not touch are accepted unchanged", () => {
    expect(payloadOf(wire({ sunSign: "" })).sunSign).toBe("");
    expect(payloadOf(wire({ degraded: null })).degraded).toBeNull();
    expect(payloadOf(wire({ degraded: [] })).degraded).toEqual([]);
    expect(payloadOf(wire({ degraded: ["a", "b"] })).degraded).toEqual(["a", "b"]);
    const rails = { mintPerTokenUsd: null, redeemPerTokenUsd: 0.5, mintSource: "ignored" };
    expect(payloadOf(wire({ railsUsd: rails })).railsUsd).toEqual({
      mintPerTokenUsd: null,
      redeemPerTokenUsd: 0.5,
    });
  });
});

describe("token rows: drop a bad row, throw when none is readable", () => {
  const BAD_PATCHES: ReadonlyArray<Wire> = [
    { token: "Aether" },
    { token: "spirit" },
    { token: 5 },
    { index: "1" },
    { index: null },
    { change24hPct: null },
    { weight: undefined },
    { sparkline: null },
    { sparkline: "x" },
    { sparkline: [1, null] },
  ];
  const OTHERS = ["Essence", "Matter", "Substance"];

  it("CONTROL: all four real rows are kept in producer order", () => {
    expect(keptTokens({})).toEqual(["Spirit", "Essence", "Matter", "Substance"]);
    expect(payloadOf(wire()).tokens).toEqual(viaJson(SNAPSHOT.tokens));
  });

  const BAD_CASES: ReadonlyArray<readonly [string, Wire]> = BAD_PATCHES.map(
    (patch): readonly [string, Wire] => [JSON.stringify(patch), patch],
  );

  it.each(BAD_CASES)(
    "drops the row when %s, keeping the others intact",
    (_label, patch) => {
      expect(keptTokens({ tokens: tokensWith(0, patch) })).toEqual(OTHERS);
    },
  );

  it.each(["index", "change24hPct", "weight"])("drops the row when %s = 1e999 (JSON text)", (field) => {
    expect(keptTokens({ tokens: tokensWith(0, { [field]: RAW }) }, "1e999")).toEqual(OTHERS);
  });

  it("drops the row when a sparkline point is 1e999 (JSON text)", () => {
    const tokens = tokensWith(0, { sparkline: [1, RAW, 3] });
    expect(keptTokens({ tokens }, "1e999")).toEqual(OTHERS);
  });

  it("drops rows that are not objects", () => {
    const tokens = [null, 5, "x", [], ...SNAPSHOT.tokens];
    expect(keptTokens({ tokens })).toEqual(["Spirit", "Essence", "Matter", "Substance"]);
  });

  it("throws when rows arrived and none was readable, but accepts an empty list", () => {
    const allBad = SNAPSHOT.tokens.map((row) => ({ ...row, index: "bad" }));
    expect(() => parsePriceIndexResponse(wire({ tokens: allBad }))).toThrow(
      "no row was a readable quote",
    );
    expect(() => parsePriceIndexResponse(wire({ tokens: [null] }))).toThrow(INVALID);
    expect(payloadOf(wire({ tokens: [] })).tokens).toEqual([]);
  });
});

describe("supply is honestly optional", () => {
  const ABSENT: ReadonlyArray<readonly [string, Wire]> = [
    ["no supply key (payload cached before supply existed)", { supply: undefined }],
    ["supply null", { supply: null }],
    ["supply an array", { supply: [] }],
    ["supply a string", { supply: "live" }],
    ["live as the string true", { supply: { ...LIVE_SUPPLY, live: "true" } }],
    ["live as 1", { supply: { ...LIVE_SUPPLY, live: 1 } }],
    ["live missing", { supply: { spirit: 1, essence: 2, matter: 3, substance: 4 } }],
    ["a live amount missing", { supply: { live: true, spirit: 1, essence: 2, matter: 3 } }],
    ["a live amount a numeric string", { supply: { ...LIVE_SUPPLY, essence: "12" } }],
    ["a live amount null", { supply: { ...LIVE_SUPPLY, matter: null } }],
  ];

  it.each(ABSENT)("drops the block, not the quotes: %s", (_label, overrides) => {
    const payload = payloadOf(wire(overrides));
    expect(payload).not.toHaveProperty("supply");
    expect(payload.tokens).toHaveLength(4);
  });

  it.each(["spirit", "essence", "matter", "substance"])(
    "drops a live block whose %s is 1e999 (JSON text), where it would render as Infinity",
    (coin) => {
      const supply = { ...LIVE_SUPPLY, [coin]: RAW };
      expect(payloadOf(wire({ supply }, "1e999"))).not.toHaveProperty("supply");
    },
  );

  it("CONTROL: a live:false block is reported as such, with or without amounts", () => {
    const zeros = { live: false, spirit: 0, essence: 0, matter: 0, substance: 0 };
    expect(payloadOf(wire({ supply: zeros })).supply).toEqual({ live: false });
    expect(payloadOf(wire({ supply: { live: false } })).supply).toEqual({ live: false });
    expect(payloadOf(wire({ supply: LIVE_SUPPLY })).supply).toEqual(LIVE_SUPPLY);
  });
});

describe("through readJson, the way poll() calls it", () => {
  it("a non-JSON body rejects, which poll()'s catch reports as Network unreachable", async () => {
    const html = new Response("<html>502 Bad Gateway</html>", { status: 502 });
    await expect(readJson(html, parsePriceIndexResponse)).rejects.toThrow();
  });

  it("a body of the text null rejects; the 503 refusal text does not", async () => {
    await expect(readJson(new Response("null"), parsePriceIndexResponse)).rejects.toThrow(
      "expected a JSON object",
    );
    const refusal = JSON.stringify({ success: false, live: false, message: REFUSAL_MESSAGE });
    await expect(
      readJson(new Response(refusal, { status: 503 }), parsePriceIndexResponse),
    ).resolves.toEqual({ payload: null, message: REFUSAL_MESSAGE });
  });
});
