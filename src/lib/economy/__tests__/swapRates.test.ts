/**
 * @jest-environment node
 *
 * The public swap-rate sheet and the Swapping Bridge must quote ONE price.
 *
 * The sheet used to float a 3:1 ratio off the planetary hour — a rate nothing
 * else in the economy used. It now reads the live EEI feed through the bridge's
 * own `oracleRate`, and these cases pin that: every sheet rate equals the rate
 * a waterfall leg is booked at for the same pair, from the same prices.
 */

const getLiveOracleQuote = jest.fn();
jest.mock("@/lib/economy/priceIndex", () => ({
  INDEX_ROUND_DIGITS: 4,
  ORACLE_BUCKET_MS: 60_000,
  getLiveOracleQuote: (...args: unknown[]) => getLiveOracleQuote(...args),
}));

import { GET } from "@/app/api/economy/swap-rates/route";
import {
  oracleRate,
  planAutoSwap,
  quoteSourceAmount,
  type OraclePrices,
} from "@/lib/economy/swappingBridge";
import {
  SwapRatesUnavailableError,
  findRate,
  getCurrentSwapRates,
  getPlanetaryRulers,
  tryGetCurrentSwapRates,
} from "@/lib/economy/swapRates";
import { TOKEN_TYPES } from "@/types/economy";

/** The [GOLDEN] fixture-sky row from priceIndex.test.ts. */
const PRICES: OraclePrices = {
  Spirit: 1.0149,
  Essence: 1.0483,
  Matter: 1.1302,
  Substance: 1.1401,
};
const BUCKET = "2026-09-30T12:00:00.000Z";
const NOW = new Date("2026-09-30T12:00:42.000Z");

beforeEach(() => {
  getLiveOracleQuote.mockReset();
  getLiveOracleQuote.mockReturnValue({ bucketStartUtc: BUCKET, prices: PRICES, degraded: null });
});

describe("getCurrentSwapRates — priced by the EEI, exactly as the bridge prices", () => {
  it("quotes all 12 ordered pairs at P_to / P_from", () => {
    const sheet = getCurrentSwapRates(NOW);
    expect(sheet.rates).toHaveLength(12);
    for (const r of sheet.rates) {
      expect(r.rate).toBeCloseTo(PRICES[r.toToken] / PRICES[r.fromToken], 8);
      expect(r.rate).toBe(Number(oracleRate(PRICES, r.fromToken, r.toToken).toFixed(8)));
    }
  });

  it("books every auto-swap leg at the rate the sheet quotes for that pair", () => {
    const sheet = getCurrentSwapRates(NOW);
    // One coin rich, three empty: the bridge must swap into all three.
    const plan = planAutoSwap({
      costs: { spirit: 2.5, essence: 2.5, matter: 2.5, substance: 2.5 },
      balances: { spirit: 100, essence: 0, matter: 0, substance: 0 },
      prices: sheet.prices,
    });
    expect(plan.legs).toHaveLength(3);
    for (const leg of plan.legs) {
      expect(leg.rate).toBe(findRate(sheet, leg.fromToken, leg.toToken)?.rate);
      // …and a manual swap of the same amount costs exactly the same.
      expect(leg.fromAmount).toBe(
        quoteSourceAmount(sheet.prices, leg.fromToken, leg.toToken, leg.toAmount),
      );
    }
  });

  it("is 1:1 parity with no spread: A→B × B→A = 1, and the sheet says so", () => {
    const sheet = getCurrentSwapRates(NOW);
    expect(sheet.basis).toBe("eei-relative-parity");
    expect(sheet.spread).toBe(0);
    for (const a of TOKEN_TYPES) {
      for (const b of TOKEN_TYPES) {
        if (a === b) continue;
        const ab = findRate(sheet, a, b)?.rate ?? Number.NaN;
        const ba = findRate(sheet, b, a)?.rate ?? Number.NaN;
        expect(ab * ba).toBeCloseTo(1, 7);
      }
    }
  });

  it("modifier is the rate against 1:1 parity (below 1 = the target is the cheaper coin)", () => {
    const sheet = getCurrentSwapRates(NOW);
    for (const r of sheet.rates) expect(r.modifier).toBe(r.rate);
    // Spirit is the cheapest coin in the fixture, so buying it is favourable.
    expect(findRate(sheet, "Substance", "Spirit")?.modifier).toBeLessThan(1);
    expect(findRate(sheet, "Spirit", "Substance")?.modifier).toBeGreaterThan(1);
  });

  it("publishes the prices and bucket it was computed from, valid to the bucket's end", () => {
    const sheet = getCurrentSwapRates(NOW);
    expect(getLiveOracleQuote).toHaveBeenCalledWith(NOW);
    expect(sheet.prices).toEqual(PRICES);
    expect(sheet.priceBucketStartUtc).toBe(BUCKET);
    expect(sheet.validUntil).toBe("2026-09-30T12:01:00.000Z");
    expect(sheet.generatedAt).toBe(NOW.toISOString());
    expect(sheet.degraded).toBeNull();
  });

  it("still reports the planetary rulers as sky context", () => {
    const sheet = getCurrentSwapRates(NOW);
    const rulers = getPlanetaryRulers();
    expect(sheet.rulingHourPlanet).toBe(rulers.rulingHourPlanet);
    expect(sheet.rulingDayPlanet).toBe(rulers.rulingDayPlanet);
    expect(typeof rulers.rulingHourPlanet).toBe("string");
    expect(rulers.rulingHourPlanet.length).toBeGreaterThan(0);
  });
});

describe("no oracle, no rates — never a fabricated sheet", () => {
  beforeEach(() => {
    getLiveOracleQuote.mockImplementation(() => {
      throw new Error("price-index: engine returned unusable ESMS total");
    });
  });

  it("getCurrentSwapRates throws SwapRatesUnavailableError", () => {
    expect(() => getCurrentSwapRates(NOW)).toThrow(SwapRatesUnavailableError);
  });

  it("tryGetCurrentSwapRates returns null", () => {
    expect(tryGetCurrentSwapRates(NOW)).toBeNull();
  });

  it("GET /api/economy/swap-rates answers 503 live:false with no rates", async () => {
    jest.spyOn(console, "error").mockImplementation(() => undefined);
    const res = await GET();
    expect(res.status).toBe(503);
    const body: unknown = await res.json();
    expect(body).toMatchObject({ success: false, live: false });
    expect(body).not.toHaveProperty("rates");
    expect(body).not.toHaveProperty("prices");
  });
});

describe("GET /api/economy/swap-rates — live", () => {
  it("serves the sheet with its prices so a client can reproduce any rate", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const body: unknown = await res.json();
    expect(body).toMatchObject({
      success: true,
      live: true,
      prices: PRICES,
      rulingHourPlanet: expect.any(String),
      rates: expect.arrayContaining([
        expect.objectContaining({ fromToken: "Spirit", toToken: "Essence" }),
      ]),
    });
    expect(body).toHaveProperty("rates.length", 12);
  });
});
