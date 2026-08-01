/**
 * ADR-009 Phase 1: the yield-weight cache must fail closed on the weight scale.
 *
 * `celestial.getNatalWeights` averages a STORED natal vector against a sky
 * computed live at head (`getCelestialRewardContext` → `rewardFor`). If the
 * stored half was written under a different weight scale, that average
 * mis-prices every reward — silently, with no error and no drift alarm. It
 * cannot verify the chart hash (it has no positions), so it verifies the scale.
 *
 * These tests exercise the REAL query through a mocked `executeQuery`, asserting
 * on the parameters the production code actually sends. A mocked DB cannot
 * typecheck SQL, so the SQL itself is pinned structurally as well.
 */
import { YIELD_WEIGHT_SCALE_VERSION } from "@/services/DailyYieldService";

const executeQuery = jest.fn();
jest.mock("@/lib/database", () => ({
  executeQuery: (...args: unknown[]) => executeQuery(...args),
}));
jest.mock("@/services/RealAlchemizeService", () => ({
  alchemize: () => ({
    esms: { Spirit: 5, Essence: 5, Matter: 5, Substance: 5 },
    metadata: { dominantElement: "Fire" },
  }),
}));
jest.mock("@/utils/serverPlanetaryCalculations", () => ({
  calculatePlanetaryPositions: async () => ({ Sun: { sign: "leo", degree: 1 } }),
  getFallbackPlanetaryPositions: () => ({ Sun: { sign: "leo", degree: 1 } }),
}));

const CURRENT_ROW = {
  spirit_weight: "0.40",
  essence_weight: "0.30",
  matter_weight: "0.20",
  substance_weight: "0.10",
};

describe("yield-weight cache fails closed on the weight scale", () => {
  beforeEach(() => {
    executeQuery.mockReset();
    jest.resetModules();
  });

  it("filters on weight_scale_version, and sends the current version", async () => {
    executeQuery.mockResolvedValue({ rows: [CURRENT_ROW] });
    const { getCelestialRewardContext } = await import("@/lib/economy/celestial");
    await getCelestialRewardContext("user-1", new Date("2026-08-01T12:00:00Z"));

    const call = executeQuery.mock.calls.find((c) =>
      String(c[0]).includes("user_yield_profiles"),
    );
    expect(call).toBeDefined();
    const [sql, params] = call as [string, unknown[]];
    // Structural pin: a mocked DB cannot catch a dropped predicate, so assert it.
    expect(sql).toContain("weight_scale_version = $2");
    expect(params[1]).toBe(YIELD_WEIGHT_SCALE_VERSION);
  });

  it("degrades to an unpersonalized reward when the scale does not match", async () => {
    // Scope, stated so nobody mistakes what this covers: the DB applies the
    // predicate, so this proves the DEGRADATION PATH is safe, not that the
    // predicate exists. Deleting the WHERE clause leaves this test green — the
    // structural pin above is what fails. VERIFIED by removing the filter: this
    // test passed, that one failed.
    executeQuery.mockResolvedValue({ rows: [] });
    const { getCelestialRewardContext } = await import("@/lib/economy/celestial");
    const ctx = await getCelestialRewardContext(
      "user-stale",
      new Date("2026-08-01T12:00:00Z"),
    );

    expect(ctx.personalized).toBe(false);
    // Unpersonalized means every coin gets the same sky-only multiplier —
    // coherent, just not chart-specific. Never a wrong personalized number.
    const rewards = Object.values(ctx.perCoinReward);
    expect(new Set(rewards).size).toBe(1);
    expect(rewards[0]).toBeGreaterThan(0);
  });

  it("POSITIVE CONTROL — a current-scale row DOES personalize", async () => {
    // Without this, the test above would pass even if personalization were
    // broken outright, and 'fails closed' would be indistinguishable from
    // 'never works'.
    executeQuery.mockResolvedValue({ rows: [CURRENT_ROW] });
    const { getCelestialRewardContext } = await import("@/lib/economy/celestial");
    const ctx = await getCelestialRewardContext(
      "user-current",
      new Date("2026-08-01T12:00:00Z"),
    );

    expect(ctx.personalized).toBe(true);
    // The stored vector is deliberately lopsided (0.40/0.30/0.20/0.10), so the
    // per-coin rewards must NOT collapse to a single value.
    expect(new Set(Object.values(ctx.perCoinReward)).size).toBeGreaterThan(1);
  });
});
