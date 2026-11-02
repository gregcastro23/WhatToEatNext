/**
 * @jest-environment node
 *
 * Planetary positions on a server.
 *
 * getCurrentPlanetaryPositions() fetched the relative URL "/api/astrologize",
 * which has no origin in Node, so on a server it always threw and fell through
 * to the local astronomy-engine, the same engine the route itself falls back
 * to. [MEASURED 2026-10-31] Those positions equal the route's local output to
 * 0.00 arcmin; the fallback was never an estimate. It now goes there directly,
 * skipping a request that could not succeed. Each test loads a fresh service
 * (jest.config resetModules).
 */

const mockEngineCalls = { count: 0 };

jest.mock("@/utils/astrology/positions", () => {
  const actual = jest.requireActual<typeof import("@/utils/astrology/positions")>("@/utils/astrology/positions");
  return {
    ...actual,
    getAccuratePlanetaryPositions: (date: Date) => {
      mockEngineCalls.count += 1;
      return actual.getAccuratePlanetaryPositions(date);
    },
  };
});

const NOW = new Date("2026-10-31T15:30:00Z");

async function freshService() {
  const [{ PlanetaryScoringService }, engine] = await Promise.all([
    import("../planetaryScoring"),
    import("@/utils/astrology/positions"),
  ]);
  return { service: PlanetaryScoringService.getInstance(), engine };
}

let fetchSpy: jest.SpyInstance;

beforeEach(() => {
  mockEngineCalls.count = 0;
  jest.useFakeTimers({ now: NOW });
  fetchSpy = jest.spyOn(globalThis, "fetch").mockRejectedValue(new Error("no network in this test"));
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe("getCurrentPlanetaryPositions on a server", () => {
  it("makes no request: there is nothing to resolve a relative URL against", async () => {
    const { service } = await freshService();
    await service.getCurrentPlanetaryPositions();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns the local engine's positions for the current instant", async () => {
    const { service, engine } = await freshService();
    const positions = await service.getCurrentPlanetaryPositions();
    const expected = engine.getAccuratePlanetaryPositions(NOW);

    expect(positions.length).toBeGreaterThanOrEqual(7);
    for (const position of positions) {
      const truth = expected[position.planet];
      expect(truth).toBeDefined();
      expect(position.sign).toBe(truth?.sign);
      expect(position.exactLongitude).toBeCloseTo(truth?.exactLongitude ?? Number.NaN, 6);
    }
  });

  it("is accurate, not an approximation: the Sun is where the ephemeris puts it", async () => {
    const { service } = await freshService();
    const sun = (await service.getCurrentPlanetaryPositions()).find((p) => p.planet === "Sun");
    // 31 October is at about 7.3 degrees of Scorpio (217.3 degrees of longitude).
    expect(sun?.sign).toBe("scorpio");
    expect(sun?.exactLongitude).toBeGreaterThan(216.5);
    expect(sun?.exactLongitude).toBeLessThan(218.5);
  });

  it("shares one calculation between callers that overlap on a cold cache", async () => {
    const { service } = await freshService();
    mockEngineCalls.count = 0;
    const callers = await Promise.all(Array.from({ length: 50 }, () => service.getCurrentPlanetaryPositions()));
    expect(new Set(callers).size).toBe(1);
    expect(mockEngineCalls.count).toBe(1);
  });

  it("caches for 15 minutes, then looks again", async () => {
    const { service } = await freshService();
    await service.getCurrentPlanetaryPositions();
    jest.setSystemTime(new Date(NOW.getTime() + 14 * 60_000));
    await service.getCurrentPlanetaryPositions();
    expect(mockEngineCalls.count).toBe(1);

    jest.setSystemTime(new Date(NOW.getTime() + 16 * 60_000));
    await service.getCurrentPlanetaryPositions();
    expect(mockEngineCalls.count).toBe(2);
  });
});
