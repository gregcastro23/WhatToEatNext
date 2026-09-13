/** @jest-environment node */

import { dailyYieldService } from "@/services/DailyYieldService";
import { DegradedEphemerisError } from "@/lib/economy/discriminant-faucet";

const executeQuery = jest.fn();
const calculateChartBaseline = jest.fn();
const calculatePositionsWithAstronomyEngine = jest.fn();

jest.mock("@/lib/database", () => ({
  executeQuery: (...args: unknown[]) => executeQuery(...args),
}));
jest.mock("@/lib/economy/discriminant-faucet", () => ({
  ...jest.requireActual("@/lib/economy/discriminant-faucet"),
  calculateChartBaseline: (...args: unknown[]) => calculateChartBaseline(...args),
}));
jest.mock("@/utils/serverPlanetaryCalculations", () => ({
  calculatePositionsWithAstronomyEngine: (...args: unknown[]) =>
    calculatePositionsWithAstronomyEngine(...args),
}));

const PLANETS = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];
const SKY = Object.fromEntries(PLANETS.map((planet) => [
  planet, { sign: "Aries", degree: 1, exactLongitude: 1 },
]));
const NATAL = { Sun: { sign: "Aries", exactLongitude: 1 } };
const ALCHEMY = { Spirit: 4, Essence: 3, Matter: 2, Substance: 1 };
const CLAIMED_AT = new Date("2026-09-12T19:42:16.000Z");
const originalDatabaseUrl = process.env.DATABASE_URL;

beforeEach(() => {
  process.env.DATABASE_URL = "postgres://mock/faucet";
  executeQuery.mockReset().mockResolvedValue({ rows: [] });
  calculateChartBaseline.mockReset().mockReturnValue(11);
  calculatePositionsWithAstronomyEngine.mockReset().mockReturnValue({
    positions: SKY, usedFallback: false,
  });
});

afterAll(() => {
  if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL;
  else process.env.DATABASE_URL = originalDatabaseUrl;
});

describe("daily faucet input freshness", () => {
  it("computes the supplied claim instant, never a day-level cache snapshot", async () => {
    executeQuery.mockResolvedValue({ rows: [{ planet_positions: { Sun: "Taurus" } }] });
    await expect(dailyYieldService.getClaimEphemeris(CLAIMED_AT)).resolves.toEqual({ positions: SKY });
    expect(calculatePositionsWithAstronomyEngine).toHaveBeenCalledWith(CLAIMED_AT, { log: false });
    expect(executeQuery).not.toHaveBeenCalled();
  });

  it("rejects a static fallback even when it contains all ten bodies", async () => {
    calculatePositionsWithAstronomyEngine.mockReturnValue({ positions: SKY, usedFallback: true });
    await expect(dailyYieldService.getClaimEphemeris(CLAIMED_AT)).rejects.toThrow(DegradedEphemerisError);
  });

  it("uses changed measured natal alchemy even when planetary geometry is unchanged", async () => {
    const first = await dailyYieldService.getYieldWeights("user", NATAL, ALCHEMY);
    const second = await dailyYieldService.getYieldWeights("user", NATAL, {
      Spirit: 1, Essence: 2, Matter: 3, Substance: 4,
    });
    expect(first).toEqual({ spirit: 0.4, essence: 0.3, matter: 0.2, substance: 0.1 });
    expect(second).toEqual({ spirit: 0.1, essence: 0.2, matter: 0.3, substance: 0.4 });
  });

  it("cannot relabel an old baseline by updating the weight profile hash", async () => {
    let row: Record<string, unknown> = {};
    executeQuery.mockImplementation(async (sql: string, params: unknown[]) => {
      if (sql.startsWith("INSERT INTO user_yield_profiles")) {
        row.natal_chart_hash = params[5];
      } else if (sql.startsWith("UPDATE user_yield_profiles")) {
        // A mock DB cannot execute SQL: pin the crucial assignment separately.
        expect(sql).toContain("baseline_chart_hash = $4");
        row = { ...row, synastry_baseline: params[1], baseline_version: params[2], baseline_chart_hash: params[3] };
      } else if (sql.includes("FROM user_yield_profiles")) {
        return { rows: [row] };
      }
      return { rows: [] };
    });
    await dailyYieldService.getYieldWeights("user", NATAL, ALCHEMY);
    expect(await dailyYieldService.getChartBaseline("user", NATAL, CLAIMED_AT)).toBe(11);

    const changedNatal = { Sun: { sign: "Leo", exactLongitude: 135 } };
    await dailyYieldService.getYieldWeights("user", changedNatal, ALCHEMY);
    calculateChartBaseline.mockReturnValue(22);
    expect(await dailyYieldService.getChartBaseline("user", changedNatal, CLAIMED_AT)).toBe(22);
    // Positive control: an unchanged geometry/year reuses the verified value.
    expect(await dailyYieldService.getChartBaseline("user", changedNatal, CLAIMED_AT)).toBe(22);
    expect(calculateChartBaseline).toHaveBeenCalledTimes(2);
    expect(calculateChartBaseline).toHaveBeenLastCalledWith(changedNatal, 2026);

    calculateChartBaseline.mockReturnValue(33);
    expect(await dailyYieldService.getChartBaseline("user", changedNatal, new Date("2027-01-01Z"))).toBe(33);
    expect(calculateChartBaseline).toHaveBeenLastCalledWith(changedNatal, 2027);
  });
});
