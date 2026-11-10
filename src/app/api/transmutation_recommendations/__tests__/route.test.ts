/**
 * @jest-environment node
 *
 * /api/transmutation_recommendations names the ruling planet of the hour you are
 * in and of the next two. The only client (CelestialEquilibrium) sends no
 * location, and with none the route used to take the SERVER's weekday and
 * wall-clock hour (`DAY_RULERS[date.getDay()]` walked on by `date.getHours()`),
 * which is not a planetary hour: the planetary day begins at sunrise and an hour
 * is a twelfth of the daylight or of the night.
 *
 * MEASURED 2026-11-10 against the Python reference at the app's default place,
 * over 336 hours (a June and a December week): the old fallback named the right
 * planet on 0 of 336 on a UTC host (what Vercel runs) and on 98 (29%) on a New
 * York or a Tokyo host. With no location the route now asks the calculator for
 * the default place, as every other caller that passes none does.
 *
 * The expected planets were asked of the Python reference `planetary_hour_at`
 * (PR #996 @ 6961ee36) at the default place, Forest Hills (40.7498, -73.7976),
 * and at Tokyo, for the instant and the two hours after it. Every one of the three
 * instants of every case is at least 600 s from an hour boundary, far outside the
 * 152 s by which the calculator's SunCalc sun times and the reference's can move
 * a boundary (planetaryHourGoldenVectors.test.ts; MEASURED over 12,800 moments).
 * None of it is read from the code under test.
 *
 * `now` is the only thing the route reads from the clock; the test fixes it with
 * fake timers that fake `Date` and nothing else, so the request body still parses.
 */
jest.mock("@/lib/rateLimit", () => ({
  rateLimit: async () => ({ allowed: true }),
}));

import { NextRequest } from "next/server";

import { POST } from "../route";

interface Recommendation {
  date: string;
  ruling_planet: string;
}

// Everything but Date stays real, so the request body and the promises behave.
const FAKE_ONLY_DATE = [
  "hrtime",
  "nextTick",
  "performance",
  "queueMicrotask",
  "requestAnimationFrame",
  "cancelAnimationFrame",
  "requestIdleCallback",
  "cancelIdleCallback",
  "setImmediate",
  "clearImmediate",
  "setInterval",
  "clearInterval",
  "setTimeout",
  "clearTimeout",
] as const;

async function recommendationsAt(now: string, body: unknown): Promise<Recommendation[]> {
  jest.useFakeTimers({ now: new Date(now), doNotFake: [...FAKE_ONLY_DATE] });
  try {
    const response = await POST(
      new NextRequest("http://localhost/api/transmutation_recommendations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      }),
    );
    expect(response.status).toBe(200);
    return (await response.json()) as Recommendation[];
  } finally {
    jest.useRealTimers();
  }
}

const QUANTITIES = { alchemicalQuantities: { Spirit: 4, Essence: 3, Matter: 2, Substance: 1 } };

// [local time at Forest Hills, now (UTC), planets of this hour and the next two]
const DEFAULT_PLACE: Array<[string, string, string[]]> = [
  ["Wed 2025-06-18 06:05 (just after sunrise)", "2025-06-18T10:05:00Z", ["Mercury", "Moon", "Saturn"]],
  ["Wed 2025-06-18 09:00", "2025-06-18T13:00:00Z", ["Saturn", "Jupiter", "Mars"]],
  ["Wed 2025-06-18 13:40", "2025-06-18T17:40:00Z", ["Venus", "Mercury", "Moon"]],
  ["Wed 2025-06-18 19:00 (across sunset)", "2025-06-18T23:00:00Z", ["Jupiter", "Mars", "Sun"]],
  ["Tue 2025-12-16 01:45 (before dawn: Monday's day)", "2025-12-16T06:45:00Z", ["Venus", "Mercury", "Moon"]],
  ["Tue 2025-12-16 06:25 (across sunrise)", "2025-12-16T11:25:00Z", ["Jupiter", "Mars", "Sun"]],
  ["Tue 2025-12-16 19:35", "2025-12-17T00:35:00Z", ["Mars", "Sun", "Venus"]],
  ["Tue 2025-12-16 23:20", "2025-12-17T04:20:00Z", ["Mercury", "Moon", "Saturn"]],
];

describe("/api/transmutation_recommendations rules the next three hours by the planetary hour", () => {
  // CONTROL: a table of one planet, or one the old fallback would also fill, proves nothing.
  it("the cases cover many planets, day and night, and a change of planetary day", () => {
    const planets = new Set(DEFAULT_PLACE.flatMap(([, , rulers]) => rulers));
    expect(planets.size).toBeGreaterThanOrEqual(6);
    expect(DEFAULT_PLACE).toHaveLength(8);
  });

  it.each(DEFAULT_PLACE)(
    "with no location, %s names the planets of the default place's hours",
    async (_label, now, rulers) => {
      const got = await recommendationsAt(now, QUANTITIES);
      expect(got.map((r) => r.ruling_planet)).toEqual(rulers);
    },
  );

  it("a location in the body, as `location` or as latitude and longitude, is the place whose hours are named", async () => {
    // Tokyo, Thursday 2025-06-19: 03:05 JST is the last night hour and then the
    // first two of the day that begins at sunrise; 11:10 JST is mid-morning.
    const tokyo = { latitude: 35.6762, longitude: 139.6503 };
    expect(
      (await recommendationsAt("2025-06-18T18:05:00Z", { ...QUANTITIES, location: tokyo })).map(
        (r) => r.ruling_planet,
      ),
    ).toEqual(["Moon", "Saturn", "Jupiter"]);
    expect(
      (await recommendationsAt("2025-06-19T02:10:00Z", { ...QUANTITIES, ...tokyo })).map(
        (r) => r.ruling_planet,
      ),
    ).toEqual(["Moon", "Saturn", "Jupiter"]);
    // The same instant with no location is 22:10 on the Wednesday at the default
    // place, two hours of the day that began Wednesday: a different answer. (The
    // reference puts the first two hours 695 s and 1048 s from a boundary; the
    // third is only 120 s, so it is not asserted.)
    expect(
      (await recommendationsAt("2025-06-19T02:10:00Z", QUANTITIES))
        .slice(0, 2)
        .map((r) => r.ruling_planet),
    ).toEqual(["Mercury", "Moon"]);
  });

  it("names three recommendations, one for each of the next three hours", async () => {
    const got = await recommendationsAt("2025-06-18T13:00:00Z", QUANTITIES);
    expect(got).toHaveLength(3);
    expect(got.every((r) => r.date === "2025-06-18")).toBe(true);
  });
});
