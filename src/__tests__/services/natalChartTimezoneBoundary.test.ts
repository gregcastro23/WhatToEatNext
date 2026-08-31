/**
 * @jest-environment node
 *
 * The astrologize payload boundary must be timezone-invariant.
 *
 * `/api/astrologize` reconstructs the instant with
 * `Date.UTC(year, month - 1, date, hour, minute)`, so `fetchPlanetaryPositions`
 * has to hand it the UTC components of the birth instant. It used to read them
 * with LOCAL getters, which made the caller's timezone part of the physics:
 * MEASURED 2026-08-03, re-igniting a stored chart (birth 1991-06-23T14:24:00Z)
 * returned the stored Sun bit-exact at 91.63304700590142 under TZ=UTC but
 * 91.47408219086523 under TZ=America/New_York -- 0.159 degrees of drift with no
 * error raised anywhere.
 *
 * ── WHY THIS DOES NOT SET process.env.TZ ────────────────────────────────────
 *
 * The obvious test is "force a non-UTC zone, then check the payload". It does
 * not work, and its first version shipped broken: setting `process.env.TZ` in a
 * test module does not reliably relatch Node's zone, because jest's setup files
 * have already constructed Dates by then. On a developer machine that is
 * invisible -- the ambient zone is non-UTC anyway, so the assertions pass for
 * the wrong reason -- and on a UTC CI runner the local and UTC getters AGREE,
 * so a local-getter regression sails straight through.
 *
 * So the zone is not used as the lever at all. Instead the LOCAL getters are
 * poisoned: any call to `getFullYear`/`getMonth`/`getDate`/`getHours`/
 * `getMinutes` returns a value that cannot occur in a correct payload. A
 * correct implementation never touches them and is unaffected; a regression
 * reads poison and fails. That holds in EVERY timezone, including UTC, which is
 * exactly where the timezone-based version was blind.
 */

import { describe, expect, it, jest, beforeEach, afterAll } from "@jest/globals";
import { installFetchMock } from "@/__tests__/helpers/fetchMock";

const ORIGINAL_FETCH = global.fetch;

/**
 * Sentinel values for the local-time getters — deliberately impossible for the
 * instants under test, so a poisoned read is unmistakable in the diff.
 */
const POISON = {
  getFullYear: 1888,
  getMonth: 10, // would surface as month 11
  getDate: 28,
  getHours: 7,
  getMinutes: 55,
} as const;

/**
 * Run `fn` with the local-time getters poisoned. Scoped as tightly as possible
 * and always restored, since Date.prototype is global and jest itself uses it.
 */
async function withPoisonedLocalGetters<T>(fn: () => Promise<T>): Promise<T> {
  const spies = (Object.keys(POISON) as Array<keyof typeof POISON>).map((name) =>
    jest
      .spyOn(Date.prototype, name as never)
      .mockReturnValue(POISON[name] as never),
  );
  try {
    return await fn();
  } finally {
    for (const s of spies) s.mockRestore();
  }
}

/** A minimal astrologize response — only the fields the service reads. */
function stubResponse() {
  const body = (label: string, deg: number) => ({
    key: label.toLowerCase(),
    label,
    Sign: { key: label.toLowerCase(), zodiac: label, label: "Cancer" },
    ChartPosition: {
      Ecliptic: {
        DecimalDegrees: deg,
        ArcDegrees: { degrees: Math.floor(deg), minutes: 0, seconds: 0 },
      },
    },
    isRetrograde: false,
  });
  return {
    _celestialBodies: {
      all: [],
      sun: body("Sun", 91.5),
      moon: body("Moon", 120.5),
      mercury: body("Mercury", 100.5),
      venus: body("Venus", 110.5),
      mars: body("Mars", 130.5),
      jupiter: body("Jupiter", 140.5),
      saturn: body("Saturn", 150.5),
      uranus: body("Uranus", 160.5),
      neptune: body("Neptune", 170.5),
      pluto: body("Pluto", 180.5),
    },
    ascendant: { sign: "cancer", degree: 5, minute: 0, exactLongitude: 95.0 },
  };
}

let capturedPayload: Record<string, unknown> | null = null;

beforeEach(() => {
  capturedPayload = null;
  installFetchMock(
    jest.fn(async (_url: unknown, init: unknown) => {
      const body = (init as { body?: string })?.body;
      capturedPayload = body ? JSON.parse(body) : null;
      return {
        ok: true,
        statusText: "OK",
        json: async () => stubResponse(),
      } as unknown as Response;
    }),
  );
});

afterAll(() => {
  global.fetch = ORIGINAL_FETCH;
});

describe("astrologize payload timezone boundary", () => {
  it("poisoning the local getters actually bites, or this suite proves nothing", () => {
    // A guard on the guard. The previous version of this check asserted the
    // runner was in a non-UTC zone; CI is UTC, so it failed there and correctly
    // reported that every other assertion in the file was passing vacuously.
    // This replacement is about the mechanism, not the ambient zone, so it holds
    // identically on a laptop and on a UTC runner.
    const probe = new Date("1991-06-23T14:24:00.000Z");
    expect(probe.getUTCFullYear()).toBe(1991);
    return withPoisonedLocalGetters(async () => {
      expect(probe.getFullYear()).toBe(POISON.getFullYear);
      expect(probe.getHours()).toBe(POISON.getHours);
      // UTC getters must be untouched by the poison, or the tests below would
      // be asserting against a mocked value rather than the real instant.
      expect(probe.getUTCFullYear()).toBe(1991);
      expect(probe.getUTCHours()).toBe(14);
    });
  });

  it("sends the UTC components of the birth instant, not the local ones", async () => {
    const { calculateNatalChart } = await import("@/services/natalChartService");
    await withPoisonedLocalGetters(() =>
      calculateNatalChart({
        dateTime: "1991-06-23T14:24:00.000Z",
        latitude: 40.6526006,
        longitude: -73.9497211,
        timezone: "America/New_York",
      }),
    );

    expect(capturedPayload).toMatchObject({
      year: 1991,
      month: 6,
      date: 23,
      hour: 14,
      minute: 24,
    });
  });

  it("round-trips exactly through the reconstruction the API performs", async () => {
    // getUTC* -> Date.UTC is an identity. Local getters are not, and that
    // asymmetry is the whole defect.
    const { calculateNatalChart } = await import("@/services/natalChartService");
    const instant = "1996-10-21T10:28:00.000Z";
    await withPoisonedLocalGetters(() =>
      calculateNatalChart({
        dateTime: instant,
        latitude: 40.7956894,
        longitude: -73.6989103,
      }),
    );

    const p = capturedPayload as Record<string, number>;
    const reconstructed = new Date(
      Date.UTC(p.year, p.month - 1, p.date, p.hour, p.minute),
    );
    expect(reconstructed.toISOString()).toBe(instant);
  });

  it("keeps an instant near UTC midnight on its own calendar day", async () => {
    // The case a zone shift mangles worst: 23:50 UTC is already the NEXT day
    // anywhere east of the meridian, so a local-getter regression moves `date`
    // rather than merely `hour` — and an hour shift can hide inside a wide orb.
    const { calculateNatalChart } = await import("@/services/natalChartService");
    await withPoisonedLocalGetters(() =>
      calculateNatalChart({
        dateTime: "2001-03-14T23:50:00.000Z",
        latitude: 0,
        longitude: 0,
      }),
    );

    expect(capturedPayload).toMatchObject({
      year: 2001,
      month: 3,
      date: 14,
      hour: 23,
      minute: 50,
    });
  });

  it("refuses an unparseable instant instead of charting the epoch", async () => {
    const { calculateNatalChart } = await import("@/services/natalChartService");
    await expect(
      calculateNatalChart({
        dateTime: "not-a-date",
        latitude: 0,
        longitude: 0,
      }),
    ).rejects.toThrow();
  });
});
