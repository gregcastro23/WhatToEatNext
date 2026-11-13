/** @jest-environment jsdom */

/**
 * Planetary positions in a browser.
 *
 * Two defects in one function, both measured 2026-10-31:
 *  - It sent LOCAL wall-clock fields to /api/astrologize, which reads them as
 *    UTC (Date.UTC in the route). A user in Tokyo at 00:30 local (15:30 UTC)
 *    got the planets for 00:30 UTC, nine hours ahead: about 4.5 degrees of Moon.
 *  - Callers that overlapped on a cold cache each made their own request, to an
 *    endpoint limited to 60 a minute, so every caller had to warm it first.
 * Each test loads a fresh service (jest.config resetModules).
 */
import type { Recipe } from "@/types/recipe";
import type { ScoredPlanetaryPosition } from "../planetaryScoring";
import { installFetchMock } from "../../__tests__/helpers/fetchMock";

const NOW = new Date("2026-10-31T15:30:00Z");

/** A response the way /api/astrologize sends it: the Sun at 200.5 degrees, in Libra. */
function astrologizeBody(): Record<string, unknown> {
  return {
    success: true,
    _celestialBodies: {
      sun: {
        key: "sun",
        Sign: { key: "libra" },
        ChartPosition: { Ecliptic: { DecimalDegrees: 200.5, ArcDegrees: { degrees: 20, minutes: 30, seconds: 0 } } },
        isRetrograde: false,
      },
    },
  };
}

function respondWith(body: unknown, ok = true): jest.Mock {
  return installFetchMock(
    jest.fn().mockResolvedValue({ ok, status: ok ? 200 : 500, json: () => Promise.resolve(body) }),
  );
}

async function freshService() {
  const { PlanetaryScoringService } = await import("../planetaryScoring");
  return PlanetaryScoringService.getInstance();
}

/** Make this process look like Tokyo, nine hours ahead of UTC, to the local-time getters. */
function pretendToBeInTokyo(): void {
  const tokyo = new Date(NOW.getTime() + 9 * 3_600_000);
  jest.spyOn(Date.prototype, "getFullYear").mockReturnValue(tokyo.getUTCFullYear());
  jest.spyOn(Date.prototype, "getMonth").mockReturnValue(tokyo.getUTCMonth());
  jest.spyOn(Date.prototype, "getDate").mockReturnValue(tokyo.getUTCDate());
  jest.spyOn(Date.prototype, "getHours").mockReturnValue(tokyo.getUTCHours());
  jest.spyOn(Date.prototype, "getMinutes").mockReturnValue(tokyo.getUTCMinutes());
}

beforeEach(() => {
  jest.useFakeTimers({ now: NOW });
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe("getCurrentPlanetaryPositions in a browser", () => {
  it("sends the current instant as UTC fields, as the route reads them", async () => {
    pretendToBeInTokyo();
    const spy = respondWith(astrologizeBody());
    // Control, on the kind of Date the service creates: the local getters now
    // disagree with UTC, as they do outside UTC.
    const seenByTheService = new Date();
    expect(seenByTheService.getHours()).toBe(0);
    expect(seenByTheService.getUTCHours()).toBe(15);

    await (await freshService()).getCurrentPlanetaryPositions();

    expect(spy).toHaveBeenCalledTimes(1);
    const [url, init] = spy.mock.calls[0] ?? [];
    expect(url).toBe("/api/astrologize");
    const body: unknown = typeof init === "object" && init !== null && "body" in init ? init.body : undefined;
    expect(typeof body).toBe("string");
    expect(JSON.parse(String(body))).toEqual({ year: 2026, month: 10, date: 31, hour: 15, minute: 30 });
  });

  it("uses the positions the route returns", async () => {
    respondWith(astrologizeBody());
    const sun = (await (await freshService()).getCurrentPlanetaryPositions()).find((p) => p.planet === "Sun");
    expect(sun).toMatchObject({ sign: "libra", exactLongitude: 200.5, degree: 20, minute: 30 });
  });

  it("makes one request for fifty callers that overlap on a cold cache", async () => {
    const spy = respondWith(astrologizeBody());
    const service = await freshService();
    const callers = await Promise.all(Array.from({ length: 50 }, () => service.getCurrentPlanetaryPositions()));
    expect(spy).toHaveBeenCalledTimes(1);
    expect(new Set(callers).size).toBe(1);
  });

  it("falls back to the local engine when the request fails, and does not throw", async () => {
    const spy = installFetchMock(jest.fn().mockRejectedValue(new Error("offline")));
    const positions = await (await freshService()).getCurrentPlanetaryPositions();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(positions.length).toBeGreaterThanOrEqual(7);
    expect(positions.find((p) => p.planet === "Sun")?.sign).toBe("scorpio");
  });

  it("falls back the same way when the route answers with an error", async () => {
    respondWith({ success: false }, false);
    const positions = await (await freshService()).getCurrentPlanetaryPositions();
    expect(positions.find((p) => p.planet === "Sun")?.sign).toBe("scorpio");
  });

  it("caches for 15 minutes, then asks again; a failed lookup does not wedge later ones", async () => {
    const spy = installFetchMock(jest.fn().mockRejectedValueOnce(new Error("offline")));
    const service = await freshService();
    await service.getCurrentPlanetaryPositions();
    jest.setSystemTime(new Date(NOW.getTime() + 14 * 60_000));
    await service.getCurrentPlanetaryPositions();
    expect(spy).toHaveBeenCalledTimes(1);

    spy.mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve(astrologizeBody()) });
    jest.setSystemTime(new Date(NOW.getTime() + 16 * 60_000));
    const later = await service.getCurrentPlanetaryPositions();
    expect(spy).toHaveBeenCalledTimes(2);
    expect(later.find((p) => p.planet === "Sun")?.sign).toBe("libra");
  });
});

function buildSunRuledRecipe(): Recipe {
  return {
    id: "sun-critical-degree-pin",
    name: "Roasted Solar Citrus",
    ingredients: [],
    instructions: ["Roast until golden."],
    elementalProperties: { Fire: 0.7, Water: 0.1, Earth: 0.1, Air: 0.1 },
    planetaryInfluences: { favorable: ["Sun"], unfavorable: [] },
  };
}

async function scoreWithSunPosition(position: ScoredPlanetaryPosition) {
  const service = await freshService();
  jest.spyOn(service, "getCurrentPlanetaryPositions").mockResolvedValue([position]);
  return service.scoreRecipe(buildSunRuledRecipe());
}

describe("scoreRecipe minute fallback (planetaryScoring:286)", () => {
  it("reads pos.minute, falls back to pos.minutes when minute is absent, and defaults to 0", async () => {
    const withMinute = await scoreWithSunPosition({
      planet: "Sun",
      sign: "leo",
      degree: 12,
      minute: 30,
      isRetrograde: false,
    });
    const withMinutesFallback = await scoreWithSunPosition({
      planet: "Sun",
      sign: "leo",
      degree: 12,
      minutes: 30,
      isRetrograde: false,
    });
    const withoutMinutes = await scoreWithSunPosition({
      planet: "Sun",
      sign: "leo",
      degree: 12,
      isRetrograde: false,
    });

    // At 12 deg 30 min (12.5 deg), distance from critical degree 13 is 0.5 < 1 -> +0.1.
    // At 12 deg 0 min (12.0 deg), distance from critical degree 13 is 1.0 (not < 1) -> 0.
    expect(withMinute.components.criticalDegreeBonus).toBe(0.1);
    expect(withMinutesFallback.components.criticalDegreeBonus).toBe(0.1);
    expect(withMinutesFallback.overallScore).toBe(withMinute.overallScore);
    expect(withoutMinutes.components.criticalDegreeBonus).toBe(0);
  });
});
