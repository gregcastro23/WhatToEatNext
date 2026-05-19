/**
 * Group Dynamics Tests
 *
 * Covers computeGroupDynamics — the helper that drives PlanetaryKineticsClient
 * and PlanetaryAgentsAdapter group-dining responses.
 */

import { describe, expect, jest, test, beforeEach } from "@jest/globals";

// Mock commensalDatabase before importing the module under test
const mockGetUserElementalProfile = jest.fn();
jest.mock("@/services/commensalDatabaseService", () => ({
  commensalDatabase: {
    getUserElementalProfile: (id: string) => mockGetUserElementalProfile(id),
  },
}));

// Import after mock
import { computeGroupDynamics } from "@/utils/groupDynamics";

describe("computeGroupDynamics", () => {
  beforeEach(() => {
    mockGetUserElementalProfile.mockReset();
  });

  test("returns zeros when no userIds provided", async () => {
    const result = await computeGroupDynamics([]);
    expect(result.profilesFound).toBe(0);
    expect(result.profilesMissing).toBe(0);
    expect(result.harmony).toBe(0);
    expect(result.individualContributions).toEqual({});
  });

  test("reports all-missing when no profiles found", async () => {
    mockGetUserElementalProfile.mockResolvedValue(null);

    const result = await computeGroupDynamics(["u1", "u2", "u3"]);

    expect(result.profilesFound).toBe(0);
    expect(result.profilesMissing).toBe(3);
    expect(result.harmony).toBe(0);
    expect(result.individualContributions.u1).toEqual({
      powerContribution: 0,
      harmonyImpact: 0,
    });
  });

  test("single member yields self-harmony 1.0 and dominant element strength", async () => {
    mockGetUserElementalProfile.mockResolvedValue({
      Fire: 0.7,
      Water: 0.1,
      Earth: 0.1,
      Air: 0.1,
    });

    const result = await computeGroupDynamics(["solo"]);

    expect(result.profilesFound).toBe(1);
    expect(result.harmony).toBe(1.0);
    expect(result.individualContributions.solo.powerContribution).toBeCloseTo(0.7);
    expect(result.individualContributions.solo.harmonyImpact).toBe(1.0);
  });

  test("two harmonious members get high resonance, sustained momentum", async () => {
    mockGetUserElementalProfile.mockImplementation((id) => {
      if (id === "alice") {
        return Promise.resolve({ Fire: 0.3, Water: 0.3, Earth: 0.2, Air: 0.2 });
      }
      return Promise.resolve({ Fire: 0.3, Water: 0.3, Earth: 0.2, Air: 0.2 });
    });

    const result = await computeGroupDynamics(["alice", "bob"]);

    expect(result.profilesFound).toBe(2);
    expect(result.profilesMissing).toBe(0);
    // Identical profiles → resonance near 1
    expect(result.groupResonance).toBeGreaterThan(0.95);
    // Equal Fire/Air vs Water/Earth → sustained
    expect(result.momentumFlow).toBe("sustained");
  });

  test("Fire/Air-dominant group flows 'accelerating'", async () => {
    mockGetUserElementalProfile.mockResolvedValue({
      Fire: 0.4,
      Air: 0.4,
      Water: 0.1,
      Earth: 0.1,
    });

    const result = await computeGroupDynamics(["a", "b"]);
    expect(result.momentumFlow).toBe("accelerating");
  });

  test("Water/Earth-dominant group flows 'decelerating'", async () => {
    mockGetUserElementalProfile.mockResolvedValue({
      Fire: 0.1,
      Air: 0.1,
      Water: 0.4,
      Earth: 0.4,
    });

    const result = await computeGroupDynamics(["a", "b"]);
    expect(result.momentumFlow).toBe("decelerating");
  });

  test("missing profiles get zero contribution alongside present ones", async () => {
    mockGetUserElementalProfile.mockImplementation((id) => {
      if (id === "missing") return Promise.resolve(null);
      return Promise.resolve({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 });
    });

    const result = await computeGroupDynamics(["present", "missing"]);

    expect(result.profilesFound).toBe(1);
    expect(result.profilesMissing).toBe(1);
    expect(result.individualContributions.missing).toEqual({
      powerContribution: 0,
      harmonyImpact: 0,
    });
    expect(result.individualContributions.present.powerContribution).toBeGreaterThan(0);
  });

  test("powerAmplification scales with group size and dominant strength", async () => {
    mockGetUserElementalProfile.mockResolvedValue({
      Fire: 0.6,
      Water: 0.2,
      Earth: 0.1,
      Air: 0.1,
    });

    const small = await computeGroupDynamics(["a", "b"]);
    const big = await computeGroupDynamics(["a", "b", "c", "d", "e"]);

    // Bigger group with same per-user dominant element → higher amplification
    expect(big.powerAmplification).toBeGreaterThan(small.powerAmplification);
    // Both should be > 1 (amplifying)
    expect(small.powerAmplification).toBeGreaterThan(1);
  });
});
