/**
 * The economy prices ONE sky (ADR-012).
 *
 * The debit path is remote-first and the remote Swiss-Ephemeris backend returns
 * an `Ascendant` that `alchemize` counts; the oracle's local source does not.
 * Before the `PRICED_BODIES` whitelist that gap was +3.01 A-points — worth
 * ~52% on the charged multiplier once ADR-012 tightened the spread. These are
 * the tests that keep the two paths on the same sky.
 *
 * The backend samples below are REAL captures from
 * `whattoeatnext-production.up.railway.app` (pyswisseph), replayed as fixtures
 * because the jest setup blocks outbound network — which is precisely how the
 * original divergence hid: a live reconciliation run in-suite silently compares
 * the local fallback to itself and always agrees.
 */

import {
  getLivePricingContext,
  isPricedBody,
  PRICED_BODIES,
} from "@/lib/economy/livePricing";
import { computeSkySample } from "@/lib/economy/priceIndex";
import {
  getAccuratePlanetaryPositionsWithMeta,
  type PlanetPositionData,
} from "@/utils/astrology/positions";
import { calculatePlanetaryPositions } from "@/utils/serverPlanetaryCalculations";

// The debit path's position source, stubbed to return what the REMOTE backend
// really returns — the only way to exercise it, since jest blocks the network
// and the real call would silently fall back to the local engine.
jest.mock("@/utils/serverPlanetaryCalculations", () => ({
  calculatePlanetaryPositions: jest.fn(),
  getFallbackPlanetaryPositions: jest.fn(() => ({})),
}));

/**
 * A real backend response for 2026-07-20T12:00Z, trimmed to the fields the
 * pricing adapters read. Captured 2026-08-15; `metadata.source` was
 * `pyswisseph`. Note the shapes the local engine never produces: spaced node
 * names, `MC`, and `Ascendant`.
 */
const BACKEND_SKY: Record<string, PlanetPositionData> = {
  Sun: { sign: "cancer", degree: 27, exactLongitude: 117.80352203811539, isRetrograde: false } as PlanetPositionData,
  Moon: { sign: "libra", degree: 16, exactLongitude: 196.68727355481124, isRetrograde: false } as PlanetPositionData,
  Mercury: { sign: "cancer", degree: 16, exactLongitude: 106.85458103223318, isRetrograde: true } as PlanetPositionData,
  Venus: { sign: "virgo", degree: 11, exactLongitude: 161.8483673405887, isRetrograde: false } as PlanetPositionData,
  Mars: { sign: "gemini", degree: 15, exactLongitude: 75.21957817357044, isRetrograde: false } as PlanetPositionData,
  Jupiter: { sign: "leo", degree: 4, exactLongitude: 124.41631922824003, isRetrograde: false } as PlanetPositionData,
  Saturn: { sign: "aries", degree: 14, exactLongitude: 14.715904638931086, isRetrograde: false } as PlanetPositionData,
  Uranus: { sign: "gemini", degree: 4, exactLongitude: 64.59134200830191, isRetrograde: false } as PlanetPositionData,
  Neptune: { sign: "aries", degree: 4, exactLongitude: 4.37244441511585, isRetrograde: true } as PlanetPositionData,
  Pluto: { sign: "aquarius", degree: 4, exactLongitude: 304.44411499186265, isRetrograde: true } as PlanetPositionData,
  "North Node": { sign: "pisces", degree: 1, exactLongitude: 331.5544840403528, isRetrograde: true } as PlanetPositionData,
  "South Node": { sign: "virgo", degree: 1, exactLongitude: 151.5544840403528, isRetrograde: true } as PlanetPositionData,
  Ascendant: { sign: "virgo", degree: 0, exactLongitude: 150.67086515972855, isRetrograde: false } as PlanetPositionData,
  MC: { sign: "gemini", degree: 4, exactLongitude: 64.68803102916354, isRetrograde: false } as PlanetPositionData,
};

const AT = new Date("2026-07-20T12:00:00.000Z");

describe("PRICED_BODIES — one sky for debits, rewards and quotes", () => {
  it("is exactly the ten ESMS planets", () => {
    expect([...PRICED_BODIES]).toEqual([
      "Sun", "Moon", "Mercury", "Venus", "Mars",
      "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto",
    ]);
  });

  it("rejects every shape the remote backend adds", () => {
    // A whitelist, so both node spellings and the angles are out. The
    // Ascendant is the one that actually moved money.
    for (const extra of ["Ascendant", "MC", "North Node", "South Node", "NorthNode", "SouthNode"]) {
      expect(isPricedBody(extra)).toBe(false);
    }
    for (const body of PRICED_BODIES) expect(isPricedBody(body)).toBe(true);
  });

  it("REGRESSION: the Ascendant no longer reaches the priced sky", () => {
    // Feeding the FULL 14-key backend response must now yield exactly what the
    // ten-planet subset yields. Before the whitelist these differed by ~2.98.
    const tenOnly = Object.fromEntries(
      Object.entries(BACKEND_SKY).filter(([k]) => isPricedBody(k)),
    ) as Record<string, PlanetPositionData>;

    const full = computeSkySample(BACKEND_SKY, AT);
    const trimmed = computeSkySample(tenOnly, AT);

    expect(full.aNumber).toBe(trimmed.aNumber);
    expect(full.multiplier).toBe(trimmed.multiplier);
    expect(full.eei).toEqual(trimmed.eei);
  });

  it("the two ephemerides agree once they price the same bodies", () => {
    // pyswisseph (remote, what debits use) vs astronomy-engine (local, what the
    // oracle quotes) at the same instant. Measured across 49 live samples the
    // residual is ~3e-4 mean; this pins the same order at one instant. If this
    // ever grows, the two paths have genuinely diverged and the constants in
    // ADR-012 need re-deriving against whichever one charges.
    const backendA = computeSkySample(BACKEND_SKY, AT).aNumber;
    const localA = computeSkySample(
      getAccuratePlanetaryPositionsWithMeta(AT).positions,
      AT,
    ).aNumber;
    expect(Math.abs(backendA - localA)).toBeLessThan(0.01);
  });

  it("END-TO-END: the DEBIT path on a real backend sky charges the oracle's number", async () => {
    // livePricing has its own adapter, so the oracle passing is not proof the
    // charging path passes. This drives getLivePricingContext — the function
    // the six debit routes actually call — with the full 14-key remote payload.
    const mocked = calculatePlanetaryPositions as jest.MockedFunction<
      typeof calculatePlanetaryPositions
    >;
    mocked.mockResolvedValue(BACKEND_SKY as never);

    const ctx = await getLivePricingContext(AT);

    // The mock must actually have been consumed, or this test proves nothing.
    expect(mocked).toHaveBeenCalledTimes(1);

    const oracle = computeSkySample(
      Object.fromEntries(
        Object.entries(BACKEND_SKY).filter(([k]) => isPricedBody(k)),
      ) as Record<string, PlanetPositionData>,
      AT,
    );
    // Charge == quote. Pre-whitelist this was ~+3.01 on A and ~+52% on price.
    expect(ctx.aNumber).toBe(oracle.aNumber);
    expect(ctx.multiplier).toBe(oracle.multiplier);
  });
});
