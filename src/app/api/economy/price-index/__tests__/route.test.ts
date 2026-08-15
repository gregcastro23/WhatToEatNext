/**
 * GET /api/economy/price-index — envelope honesty.
 *
 * The positions util is the only mocked engine piece (fixture sky in,
 * real alchemize + real EEI math on top). Database and redis are mocked at
 * the module boundary. The three contracts under test:
 *   1. healthy → success:true, live:true, 4 quotes, CDN cache header;
 *   2. supply failure degrades ONLY the supply block (never the oracle);
 *   3. engine failure → 503 live:false with NO token values (the sibling
 *      prototype served fabricated $1.0000 quotes under success:true here).
 */

import type { PlanetPositionData } from "@/utils/astrology/positions";

jest.mock("@/utils/astrology/positions", () => ({
  ...jest.requireActual("@/utils/astrology/positions"),
  getAccuratePlanetaryPositionsWithMeta: jest.fn(),
}));

jest.mock("@/lib/database", () => ({
  executeQuery: jest.fn(),
}));

jest.mock("@/lib/redis", () => ({
  // Pass-through: the route's cache behavior is redis-agnostic by design.
  redisCached: jest.fn(async (_key: string, _ttl: number, loader: () => Promise<unknown>) =>
    loader(),
  ),
}));

import { executeQuery } from "@/lib/database";
import { clearPriceIndexMemo } from "@/lib/economy/priceIndex";
import { getAccuratePlanetaryPositionsWithMeta } from "@/utils/astrology/positions";
import { GET } from "../route";

const mockPositions = getAccuratePlanetaryPositionsWithMeta as jest.Mock;
const mockExecuteQuery = executeQuery as jest.Mock;

const SIGN_INDEX: Record<string, number> = {
  aries: 0, taurus: 1, gemini: 2, cancer: 3, leo: 4, virgo: 5,
  libra: 6, scorpio: 7, sagittarius: 8, capricorn: 9, aquarius: 10, pisces: 11,
};

function planetAt(sign: string, degree: number): PlanetPositionData {
  return {
    sign: sign as PlanetPositionData["sign"],
    degree,
    exactLongitude: SIGN_INDEX[sign] * 30 + degree,
    isRetrograde: false,
  };
}

function fixtureSky(): Record<string, PlanetPositionData> {
  return {
    Sun: planetAt("cancer", 28.2),
    Moon: planetAt("taurus", 12.4),
    Mercury: planetAt("leo", 5.1),
    Venus: planetAt("gemini", 20.7),
    Mars: planetAt("virgo", 3.9),
    Jupiter: planetAt("cancer", 10.3),
    Saturn: planetAt("aries", 2.1),
    Uranus: planetAt("gemini", 1.6),
    Neptune: planetAt("aries", 2.8),
    Pluto: planetAt("aquarius", 3.2),
  };
}

beforeEach(() => {
  clearPriceIndexMemo();
  mockPositions.mockReset();
  mockExecuteQuery.mockReset();
  mockPositions.mockReturnValue({ positions: fixtureSky(), degraded: null });
  mockExecuteQuery.mockResolvedValue({
    rows: [{ spirit: 1200.5, essence: 950.25, matter: 800, substance: 400 }],
  });
});

describe("GET /api/economy/price-index", () => {
  it("serves 4 live quotes with a CDN cache header", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toContain("s-maxage=30");
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.live).toBe(true);
    expect(body.tokens).toHaveLength(4);
    expect(body.tokens.map((t: { token: string }) => t.token)).toEqual([
      "Spirit",
      "Essence",
      "Matter",
      "Substance",
    ]);
    for (const token of body.tokens) {
      expect(token.index).toBeGreaterThan(0);
      expect(token.sparkline).toHaveLength(25);
    }
    expect(body.basis.model).toContain("ADR-011");
    expect(body.supply).toEqual({
      live: true,
      spirit: 1200.5,
      essence: 950.25,
      matter: 800,
      substance: 400,
    });
  });

  it("degrades ONLY the supply block when the database fails", async () => {
    mockExecuteQuery.mockRejectedValue(new Error("connection refused"));
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.live).toBe(true);
    expect(body.tokens).toHaveLength(4);
    expect(body.supply.live).toBe(false);
  });

  it("propagates the positions util's degraded reasons under success:true", async () => {
    mockPositions.mockReturnValue({
      positions: fixtureSky(),
      degraded: { reasons: ["stale-positions"] },
    });
    const res = await GET();
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.degraded).toContain("stale-positions");
  });

  it("returns 503 live:false with NO quotes when the engine fails — never fabricates", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    try {
      mockPositions.mockReturnValue({ positions: {}, degraded: null });
      const res = await GET();
      expect(res.status).toBe(503);
      expect(res.headers.get("Cache-Control")).toBe("no-store");
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.live).toBe(false);
      expect(body.tokens).toBeUndefined();
    } finally {
      consoleError.mockRestore();
    }
  });
});
