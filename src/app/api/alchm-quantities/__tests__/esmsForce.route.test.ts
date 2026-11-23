/**
 * @jest-environment node
 *
 * End-to-end witness for the `esmsForce` coupling in /api/alchm-quantities
 * (residual 1 of the ESMS 2.0 list: the Moon's clamped regime had no test).
 *
 * `geocentricVectors.test.ts` pins the gain function. This file pins that the
 * ROUTE uses it: only one body is given a speed, so every other body's velocity
 * is exactly zero and the response's `esmsForce` must equal `gain * esmsField`
 * for that body, component by component. Nothing here re-implements the route's
 * summation loop, and the expected gains are literals / the measured range table,
 * never the route's own helper.
 *
 * CHARACTERIZATION of the current behaviour, not a ruling: the 0.01 AU^2 floor
 * has no recorded basis (see `ESMS_COUPLING_R2_FLOOR_AU2`).
 */
import { describe, expect, jest, test, beforeEach } from "@jest/globals";
import { z } from "zod";

jest.mock("@/services/HistoricalStatsService", () => ({
  getCachedHistoricalStats: () => Promise.resolve(null),
}));

// `mock`-prefixed so jest allows the factory to close over them; each is read
// lazily inside a wrapper, so the const is initialised by the time it is called.
// Typed, because a bare `jest.fn()` resolves to `never` and rejects any value.
const mockWithMeta = jest.fn<(...args: unknown[]) => Promise<unknown>>();
const mockPrevious = jest.fn<(...args: unknown[]) => Promise<unknown>>();
const mockFallback = jest.fn<() => unknown>();
jest.mock("@/utils/serverPlanetaryCalculations", () => ({
  calculatePlanetaryPositionsWithMeta: (...args: unknown[]) => mockWithMeta(...args),
  calculatePlanetaryPositions: (...args: unknown[]) => mockPrevious(...args),
  getFallbackPlanetaryPositions: () => mockFallback(),
}));

import { GET } from "@/app/api/alchm-quantities/route";
import { PLANET_MEAN_GEOCENTRIC_AU } from "@/utils/planetaryAlchemyMapping";

const Vec = z.object({ x: z.number(), y: z.number(), z: z.number() });
const Field = z.record(z.string(), Vec);
const Body = z.object({
  vectorCircuit: z.object({ esmsField: Field, esmsForce: Field }),
});

/** A full ten-body sky, all stationary: no `longitudeSpeed`, so v = 0 for each. */
const SKY = {
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

/** The route rounds every vector component to 6 digits before responding. */
const ROUND = 5e-7;

let counter = 0;
const buildRequest = () =>
  new Request("http://localhost/api/alchm-quantities", {
    headers: { "x-real-ip": `esms-force-test-${counter++}` },
  });

/** Respond with the stationary sky, except `mover` which gets a real speed. */
async function respondWithOnlyMoving(mover: "Sun" | "Moon", degPerDay: number) {
  // Longitude 0 puts the whole tangential speed on +y, the largest rounded signal.
  const moving = { ...SKY[mover], exactLongitude: 0, longitudeSpeed: degPerDay };
  mockWithMeta.mockResolvedValue({ positions: { ...SKY, [mover]: moving }, degraded: null });
  const { vectorCircuit } = Body.parse(await (await GET(buildRequest())).json());
  return vectorCircuit;
}

/** Every ESMS axis/component: force must be `gain * field` to within rounding. */
function expectForceIsGainTimesField(
  circuit: z.infer<typeof Body>["vectorCircuit"],
  gain: number,
): void {
  const AXES: Array<"x" | "y" | "z"> = ["x", "y", "z"];
  let strongest = 0;
  for (const [key, field] of Object.entries(circuit.esmsField)) {
    const force = circuit.esmsForce[key];
    if (!force) throw new Error(`esmsForce is missing ESMS axis ${key}`);
    for (const axis of AXES) {
      strongest = Math.max(strongest, Math.abs(field[axis]));
      expect(Math.abs(force[axis] - gain * field[axis])).toBeLessThanOrEqual(ROUND * (1 + gain));
    }
  }
  // Not vacuous: the comparison above also holds for an all-zero response.
  expect(strongest).toBeGreaterThan(1e-4);
}

describe("/api/alchm-quantities esmsForce coupling", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // The previous-hour sky and the fallback are the same stationary ten bodies.
    mockPrevious.mockResolvedValue(SKY);
    mockFallback.mockReturnValue(SKY);
    delete process.env.CROSS_BACKEND_SYNC_ENABLED;
    delete process.env.CROSS_BACKEND_RECTIFICATION_ENABLED;
  });

  test("a moving Moon is amplified by the flat, clamped gain of 100", async () => {
    // BASIS: sidereal month 27.321661 d -> deg/day. The Moon's mean range is
    // ~0.00257 AU, far under the 0.1 AU floor, so 1/r^2 (~1.5e5) is clamped.
    const circuit = await respondWithOnlyMoving("Moon", 360 / 27.321661);
    expectForceIsGainTimesField(circuit, 100);
  });

  test("a moving Sun sits in the plain inverse-square regime", async () => {
    // BASIS: tropical year 365.24219 d -> deg/day; gain = 1 / r̄^2 at the measured
    // mean range, which is ~1 AU and so well above the floor.
    const circuit = await respondWithOnlyMoving("Sun", 360 / 365.24219);
    const sunAu = PLANET_MEAN_GEOCENTRIC_AU.Sun;
    if (sunAu === undefined) throw new Error("no mean geocentric range for Sun");
    expectForceIsGainTimesField(circuit, 1 / sunAu ** 2);
  });
});
