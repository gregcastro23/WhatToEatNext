/**
 * @jest-environment node
 *
 * Verifies the degraded flag flows through to the /api/alchm-quantities payload:
 * absent when positions are live, present (with reason) when they fall back, and
 * present when the position lookup throws entirely.
 */
import { describe, expect, jest, test, beforeEach } from "@jest/globals";

jest.mock("@/services/HistoricalStatsService", () => ({
  getCachedHistoricalStats: jest.fn().mockResolvedValue(null),
}));

// `mock`-prefixed so jest allows the mock factory to close over it.
const mockWithMeta = jest.fn();
jest.mock("@/utils/serverPlanetaryCalculations", () => {
  const STATIC = {
    Sun: { sign: "sagittarius", degree: 2, minute: 30, exactLongitude: 242.5, isRetrograde: false },
    Moon: { sign: "cancer", degree: 15, minute: 20, exactLongitude: 105.33, isRetrograde: false },
    Mercury: { sign: "sagittarius", degree: 18, minute: 45, exactLongitude: 258.75, isRetrograde: false },
    Venus: { sign: "capricorn", degree: 10, minute: 30, exactLongitude: 280.5, isRetrograde: false },
    Mars: { sign: "leo", degree: 25, minute: 15, exactLongitude: 145.25, isRetrograde: false },
    Jupiter: { sign: "gemini", degree: 16, minute: 40, exactLongitude: 76.67, isRetrograde: false },
    Saturn: { sign: "pisces", degree: 14, minute: 20, exactLongitude: 344.33, isRetrograde: false },
    Uranus: { sign: "taurus", degree: 22, minute: 10, exactLongitude: 52.17, isRetrograde: true },
    Neptune: { sign: "pisces", degree: 27, minute: 45, exactLongitude: 357.75, isRetrograde: false },
    Pluto: { sign: "aquarius", degree: 0, minute: 15, exactLongitude: 300.25, isRetrograde: false },
  };
  return {
    calculatePlanetaryPositionsWithMeta: (...args: unknown[]) => mockWithMeta(...args),
    calculatePlanetaryPositions: jest.fn().mockResolvedValue(STATIC),
    getFallbackPlanetaryPositions: () => STATIC,
  };
});

import { GET } from "@/app/api/alchm-quantities/route";

const POSITIONS = {
  Sun: { sign: "sagittarius", degree: 2, minute: 30, exactLongitude: 242.5, isRetrograde: false },
  Moon: { sign: "cancer", degree: 15, minute: 20, exactLongitude: 105.33, isRetrograde: false },
  Mercury: { sign: "sagittarius", degree: 18, minute: 45, exactLongitude: 258.75, isRetrograde: false },
  Venus: { sign: "capricorn", degree: 10, minute: 30, exactLongitude: 280.5, isRetrograde: false },
  Mars: { sign: "leo", degree: 25, minute: 15, exactLongitude: 145.25, isRetrograde: false },
  Jupiter: { sign: "gemini", degree: 16, minute: 40, exactLongitude: 76.67, isRetrograde: false },
  Saturn: { sign: "pisces", degree: 14, minute: 20, exactLongitude: 344.33, isRetrograde: false },
  Uranus: { sign: "taurus", degree: 22, minute: 10, exactLongitude: 52.17, isRetrograde: true },
  Neptune: { sign: "pisces", degree: 27, minute: 45, exactLongitude: 357.75, isRetrograde: false },
  Pluto: { sign: "aquarius", degree: 0, minute: 15, exactLongitude: 300.25, isRetrograde: false },
};

let counter = 0;
const buildRequest = () =>
  new Request("http://localhost/api/alchm-quantities", {
    headers: { "x-real-ip": `degraded-test-${counter++}` },
  });

describe("/api/alchm-quantities degraded signalling", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Keep cross-backend verification off so the route never reaches the backend.
    delete process.env.CROSS_BACKEND_SYNC_ENABLED;
    delete process.env.CROSS_BACKEND_RECTIFICATION_ENABLED;
  });

  test("omits degraded when positions are live", async () => {
    mockWithMeta.mockResolvedValue({ positions: POSITIONS, degraded: null });

    const res = await GET(buildRequest());
    const body = await res.json();

    expect(body.success).toBe(true);
    expect(body.degraded).toBeUndefined();
  });

  test("surfaces astronomy-engine-fallback when positions degrade", async () => {
    mockWithMeta.mockResolvedValue({
      positions: POSITIONS,
      degraded: { reasons: ["astronomy-engine-fallback"] },
    });

    const res = await GET(buildRequest());
    const body = await res.json();

    expect(body.success).toBe(true);
    expect(body.degraded).toBeDefined();
    expect(body.degraded.reasons).toContain("astronomy-engine-fallback");
  });

  test("falls back to degraded when position lookup throws", async () => {
    mockWithMeta.mockRejectedValue(new Error("astronomy down"));

    const res = await GET(buildRequest());
    const body = await res.json();

    expect(body.success).toBe(true);
    expect(body.degraded?.reasons).toContain("astronomy-engine-fallback");
  });
});
