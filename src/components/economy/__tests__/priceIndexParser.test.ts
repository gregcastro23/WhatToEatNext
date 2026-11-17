/**
 * @jest-environment node
 *
 * LivePriceTicker's wire parser against the REAL producer: the actual route
 * handler (src/app/api/economy/price-index/route.ts) runs in-process on the
 * actual position oracle. Only the I/O edges are stood in for, and only the way
 * they really behave: @/lib/database (rejects when the DB is down, resolves
 * node-postgres-shaped rows when up) and @/lib/redis (redisCached with Redis
 * unreachable is exactly "run the loader", src/lib/redis.ts:118-128). The oracle
 * has a pass-through wrapper so ONE test can make it throw and reach the route's
 * real 503; every other test runs it unwrapped.
 */

import { GET } from "@/app/api/economy/price-index/route";
import { isJsonRecord, readJson } from "@/lib/api/json";
import { getLivePriceIndexSnapshot } from "@/lib/economy/priceIndex";
import { getUsdRails } from "@/lib/economy/usdRails";
import { parsePriceIndexResponse } from "../priceIndexParser";

const mockExecuteQuery = jest.fn();
jest.mock("@/lib/database", () => ({
  executeQuery: (sql: string, values: unknown[]): unknown => mockExecuteQuery(sql, values),
}));
jest.mock("@/lib/redis", () => ({
  redisCached: (
    _key: string,
    _ttlSeconds: number,
    loader: () => Promise<unknown>,
  ): Promise<unknown> => loader(),
}));
jest.mock("@/lib/economy/priceIndex", () => {
  const actual = jest.requireActual<typeof import("@/lib/economy/priceIndex")>(
    "@/lib/economy/priceIndex",
  );
  return { ...actual, getLivePriceIndexSnapshot: jest.fn(actual.getLivePriceIndexSnapshot) };
});

const SUPPLY_FALLBACK = { live: false, spirit: 0, essence: 0, matter: 0, substance: 0 };
/** node-postgres hands NUMERIC back as strings (route.ts:49-53). */
const PG_ROW = { spirit: "1234.5", essence: "10", matter: "0", substance: "7" };
const REFUSAL_MESSAGE = "Price oracle unavailable — the position engine failed";

function recordOf(value: unknown): Record<string, unknown> {
  if (!isJsonRecord(value)) throw new Error("expected a JSON object body");
  return value;
}

/** What JSON does to a value: -0 becomes 0 and undefined keys vanish. */
function roundTrip(value: unknown): unknown {
  return JSON.parse(JSON.stringify(value));
}

function without(wire: Record<string, unknown>, field: string): Record<string, unknown> {
  return Object.fromEntries(Object.entries(wire).filter(([key]) => key !== field));
}

async function callRoute(): Promise<{ response: Response; wire: Record<string, unknown> }> {
  const response = await GET();
  return { response, wire: recordOf(await response.clone().json()) };
}

/**
 * Every field the ticker reads, recomputed straight from the oracle for the
 * SAME minute bucket the route served. The oracle is deterministic per bucket,
 * so this is race-free where a second "now" call would not be.
 */
function oracleReads(wire: Record<string, unknown>): Record<string, unknown> {
  const { bucketStartUtc } = wire;
  if (typeof bucketStartUtc !== "string") throw new Error("producer body has no bucketStartUtc");
  const snap = getLivePriceIndexSnapshot(new Date(bucketStartUtc));
  const { mintPerTokenUsd, redeemPerTokenUsd } = getUsdRails();
  return recordOf(
    roundTrip({
      aNumber: snap.aNumber,
      multiplier: snap.multiplier,
      isDiurnal: snap.isDiurnal,
      sunSign: snap.sunSign,
      dominantElement: snap.dominantElement,
      tokens: snap.tokens,
      compositeIndex: snap.compositeIndex,
      composite24hPct: snap.composite24hPct,
      degraded: snap.degraded,
      basis: { model: snap.basis.model, engine: snap.basis.engine },
      railsUsd: { mintPerTokenUsd, redeemPerTokenUsd },
    }),
  );
}

beforeEach(() => {
  mockExecuteQuery.mockReset();
});

describe("parsePriceIndexResponse against the real route: success bodies", () => {
  it("DB and Redis down: the real 200 body round-trips and supply degrades to live:false", async () => {
    mockExecuteQuery.mockRejectedValue(new Error("connect ECONNREFUSED 127.0.0.1:5432"));
    const { response, wire } = await callRoute();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toContain("stale-while-revalidate");
    // Not vacuous: the route really did send the zeroed fallback block.
    expect(wire.supply).toEqual(SUPPLY_FALLBACK);

    const parsed = await readJson(response, parsePriceIndexResponse);
    expect(parsed.message).toBeNull();
    expect(parsed.issues).toEqual([]);
    expect(parsed.payload).toEqual({ ...oracleReads(wire), supply: { live: false } });
    expect(parsed.payload?.tokens.map((quote) => quote.token)).toEqual([
      "Spirit",
      "Essence",
      "Matter",
      "Substance",
    ]);
    // Narrowed: nothing the ticker does not read survives the parse.
    expect(parsed.payload).not.toHaveProperty("physics");
    expect(parsed.payload).not.toHaveProperty("generatedAt");
  });

  it("DB up: node-postgres NUMERIC strings arrive as a live supply block of numbers", async () => {
    mockExecuteQuery.mockResolvedValue({ rows: [PG_ROW] });
    const { response, wire } = await callRoute();

    const live = { live: true, spirit: 1234.5, essence: 10, matter: 0, substance: 7 };
    expect(wire.supply).toEqual(live);
    const parsed = await readJson(response, parsePriceIndexResponse);
    expect(parsed.issues).toEqual([]);
    expect(parsed.payload).toEqual({ ...oracleReads(wire), supply: live });
  });

  it("a payload the CDN cached before supply existed: same real body, supply key removed", async () => {
    mockExecuteQuery.mockRejectedValue(new Error("connect ECONNREFUSED 127.0.0.1:5432"));
    const { wire } = await callRoute();
    const older = new Response(JSON.stringify(without(wire, "supply")));

    const parsed = await readJson(older, parsePriceIndexResponse);
    expect(parsed.issues).toEqual([]);
    expect(parsed.payload).toEqual(oracleReads(wire));
    expect(parsed.payload).not.toBeNull();
    expect(parsed.payload).not.toHaveProperty("supply");
  });
});

describe("parsePriceIndexResponse against the real route: refusal", () => {
  it("the engine failing yields the route's real 503, whose message the ticker surfaces", async () => {
    jest.mocked(getLivePriceIndexSnapshot).mockImplementationOnce(() => {
      throw new Error("position engine failed");
    });
    const logged = jest.spyOn(console, "error").mockImplementation(() => undefined);
    try {
      const response = await GET();

      expect(response.status).toBe(503);
      expect(response.ok).toBe(false);
      expect(response.headers.get("Cache-Control")).toBe("no-store");
      const parsed = await readJson(response, parsePriceIndexResponse);
      expect(parsed).toEqual({ payload: null, message: REFUSAL_MESSAGE, issues: [] });
    } finally {
      logged.mockRestore();
    }
  });

  it("control: with the engine healthy again the same route parses live, so the 503 was the engine", async () => {
    mockExecuteQuery.mockRejectedValue(new Error("connect ECONNREFUSED 127.0.0.1:5432"));
    const parsed = await readJson(await GET(), parsePriceIndexResponse);
    expect(parsed.payload).not.toBeNull();
    expect(parsed.message).toBeNull();
  });
});
