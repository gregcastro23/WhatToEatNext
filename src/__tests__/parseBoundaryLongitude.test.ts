/**
 * The parse boundary must not invent a placement — and here inventing a longitude
 * means inventing a SIGN.
 *
 * `formatRailwayResponse` derives the sign from the longitude
 * (`getSignFromLongitude`), so the old
 * `pd.exactLongitude ?? pd.longitude ?? pd.eclipticLongitude ?? 0` did not merely
 * fabricate an angle: it produced a confident **0° Aries**, indistinguishable
 * downstream from a measured placement. Two defects in one expression —
 *
 *   1. the terminal `?? 0` fabricates;
 *   2. `0` is not nullish, so a zero in the FIRST key stopped the chain and the
 *      other two were never consulted.
 *
 * `[MEASURED 2026-07-27]` against the production backend
 * (`/api/planetary/positions`, 14 bodies): every body carries `exactLongitude`,
 * none carries it as 0, and none carries `longitude` or `eclipticLongitude` at all.
 * The branch is therefore unreachable on the live path — which is why it sat here
 * for so long. These tests exercise it directly instead of waiting for an outage.
 */
import { formatRailwayResponse, getSignFromLongitude } from "@/server/lib/astrology-utils";
import type { PlanetaryRequest } from "@/lib/validation/railway";

const PARAMS = {
  year: 1984, month: 9, date: 17, hour: 12, minute: 0,
  latitude: 49.79, longitude: 8.12, zodiacSystem: "tropical",
} as unknown as PlanetaryRequest;

/** The real backend shape, as measured: exactLongitude only, on every body. */
const MEASURED = {
  sun: { exactLongitude: 174.76408840358263, sign: "virgo", degree: 24.76, minute: 45, isRetrograde: false },
  moon: { exactLongitude: 33.2, sign: "taurus", degree: 3.2, minute: 12, isRetrograde: false },
  mercury: { exactLongitude: 182.5, sign: "libra", degree: 2.5, minute: 30, isRetrograde: false },
  venus: { exactLongitude: 110, sign: "cancer", degree: 20, minute: 0, isRetrograde: false },
  mars: { exactLongitude: 8, sign: "aries", degree: 8, minute: 0, isRetrograde: false },
  jupiter: { exactLongitude: 265, sign: "sagittarius", degree: 25, minute: 0, isRetrograde: false },
  saturn: { exactLongitude: 281, sign: "capricorn", degree: 11, minute: 0, isRetrograde: false },
  uranus: { exactLongitude: 310, sign: "aquarius", degree: 10, minute: 0, isRetrograde: false },
  neptune: { exactLongitude: 340, sign: "pisces", degree: 10, minute: 0, isRetrograde: false },
  pluto: { exactLongitude: 220, sign: "scorpio", degree: 10, minute: 0, isRetrograde: false },
};

const respond = (planetary_positions: Record<string, unknown>) =>
  formatRailwayResponse({ planetary_positions } as never, PARAMS);

const longitudeOf = (res: ReturnType<typeof formatRailwayResponse>, key: string) =>
  (res._celestialBodies as Record<string, { ChartPosition: { Ecliptic: { DecimalDegrees: number } } }>)[key]
    ?.ChartPosition?.Ecliptic?.DecimalDegrees;

const signOf = (res: ReturnType<typeof formatRailwayResponse>, key: string) =>
  (res._celestialBodies as Record<string, { Sign: { key: string } }>)[key]?.Sign?.key;

describe("formatRailwayResponse — the longitude parse boundary", () => {
  it("CONTROL: the measured backend shape round-trips with every body intact", () => {
    const res = respond(MEASURED);

    expect(res._celestialBodies.all).toHaveLength(10);
    expect(longitudeOf(res, "sun")).toBe(174.76408840358263);
    expect(signOf(res, "sun")).toBe("virgo");
    expect(signOf(res, "pluto")).toBe("scorpio");
    // If this control breaks, every assertion below is vacuous.
  });

  it("drops a body with NO longitude rather than placing it at 0° Aries", () => {
    const res = respond({ ...MEASURED, pluto: { sign: "scorpio", isRetrograde: false } });

    expect(signOf(res, "pluto")).toBeUndefined();
    expect(res._celestialBodies.all).toHaveLength(9);
    // The old code produced a Pluto in aries at 0°, which nothing downstream could
    // tell apart from a real placement.
    expect(res._celestialBodies.all.map((b) => b.key)).not.toContain("pluto");
  });

  it("passes OVER a zero first key instead of stopping at it", () => {
    // The chain-stop half of the defect: `0 ?? next` never reaches `next`, because
    // 0 is not nullish. Here the real value is in the second key.
    const res = respond({
      ...MEASURED,
      pluto: { exactLongitude: 0, longitude: 220, sign: "scorpio", isRetrograde: false },
    });

    expect(longitudeOf(res, "pluto")).toBe(220);
    expect(signOf(res, "pluto")).toBe("scorpio");
  });

  it.each([
    ["eclipticLongitude", { eclipticLongitude: 220 }],
    ["longitude", { longitude: 220 }],
  ])("still honours the alternate key %s when it is the only one present", (_label, patch) => {
    const res = respond({ ...MEASURED, pluto: { ...patch, sign: "scorpio", isRetrograde: false } });

    expect(longitudeOf(res, "pluto")).toBe(220);
    expect(signOf(res, "pluto")).toBe("scorpio");
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, null, undefined, "220"])(
    "treats a non-finite or non-numeric longitude (%p) as absent",
    (exactLongitude) => {
      const res = respond({
        ...MEASURED,
        pluto: { exactLongitude, sign: "scorpio", isRetrograde: false },
      });

      // Dropped, not silently 0 — and definitely not NaN°, which getSignFromLongitude
      // would turn into aries as well.
      expect(signOf(res, "pluto")).toBeUndefined();
    },
  );

  it("a body genuinely at 0° Aries is indistinguishable from absence — and is dropped", () => {
    // Stated as a known, accepted cost rather than left implicit: this pipeline
    // cannot tell a true 0.000000° from the placeholder, and the placeholder is the
    // systematic case while a true 0 is measure-zero.
    const res = respond({ ...MEASURED, mars: { exactLongitude: 0, sign: "aries", isRetrograde: false } });

    expect(signOf(res, "mars")).toBeUndefined();
  });

  it("getSignFromLongitude is why 0 is dangerous here", () => {
    // The mechanism, pinned: 0 is not a neutral value at this boundary.
    expect(getSignFromLongitude(0)).toEqual({ sign: "aries", degree: 0 });
    expect(getSignFromLongitude(220).sign).toBe("scorpio");
  });
});
