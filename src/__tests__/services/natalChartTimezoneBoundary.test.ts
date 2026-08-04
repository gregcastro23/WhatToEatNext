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
 * This file forces a non-UTC zone BEFORE importing the service, so a revert to
 * local getters fails here rather than only on a developer's laptop.
 */

// Must precede any import that captures the zone. Chosen to be on the far side
// of the date line from UTC, so a local-getter regression shifts the DATE and
// not merely the hour -- a same-day hour shift can hide inside a wide orb.
process.env.TZ = "Pacific/Auckland";

import { describe, expect, it, jest, beforeEach, afterAll } from "@jest/globals";

const ORIGINAL_FETCH = global.fetch;

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
  global.fetch = jest.fn(async (_url: unknown, init: unknown) => {
    const body = (init as { body?: string })?.body;
    capturedPayload = body ? JSON.parse(body) : null;
    return {
      ok: true,
      statusText: "OK",
      json: async () => stubResponse(),
    } as unknown as Response;
  }) as unknown as typeof fetch;
});

afterAll(() => {
  global.fetch = ORIGINAL_FETCH;
});

describe("astrologize payload timezone boundary", () => {
  it("runs under a non-UTC zone, or this suite proves nothing", () => {
    // A guard on the guard: if the runner ignores process.env.TZ, every
    // assertion below would pass trivially against a UTC clock.
    expect(new Date("1991-06-23T14:24:00.000Z").getTimezoneOffset()).not.toBe(0);
  });

  it("sends the UTC components of the birth instant, not the local ones", async () => {
    const { calculateNatalChart } = await import("@/services/natalChartService");
    await calculateNatalChart({
      dateTime: "1991-06-23T14:24:00.000Z",
      latitude: 40.6526006,
      longitude: -73.9497211,
      timezone: "America/New_York",
    });

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
    await calculateNatalChart({
      dateTime: instant,
      latitude: 40.7956894,
      longitude: -73.6989103,
    });

    const p = capturedPayload as Record<string, number>;
    const reconstructed = new Date(
      Date.UTC(p.year, p.month - 1, p.date, p.hour, p.minute),
    );
    expect(reconstructed.toISOString()).toBe(instant);
  });

  it("crosses the date line without dragging the calendar day with it", async () => {
    // Auckland is +12/+13. An instant just before UTC midnight reads as the
    // NEXT day locally, so a local-getter regression changes `date` here.
    const { calculateNatalChart } = await import("@/services/natalChartService");
    await calculateNatalChart({
      dateTime: "2001-03-14T23:50:00.000Z",
      latitude: 0,
      longitude: 0,
    });

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
