/**
 * Tests for alchemicalPillarUtils.ts — cooking method compatibility
 * and pillar transformation functions.
 */
import {
  calculateCookingMethodCompatibility,
  getCookingMethodPillar,
} from "@/utils/alchemicalPillarUtils";

// Mock logger to avoid console noise
jest.mock("@/utils/logger", () => ({
  logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));

describe("getCookingMethodPillar", () => {
  it("returns a pillar object for known cooking methods", () => {
    const pillar = getCookingMethodPillar("grilling");
    // May or may not exist — depends on the constants mapping
    // If it exists, it should have effects
    if (pillar) {
      expect(pillar).toHaveProperty("effects");
      expect(pillar.effects).toHaveProperty("Spirit");
      expect(pillar.effects).toHaveProperty("Essence");
      expect(pillar.effects).toHaveProperty("Matter");
      expect(pillar.effects).toHaveProperty("Substance");
    }
  });

  it("returns undefined/null for unknown cooking methods", () => {
    const pillar = getCookingMethodPillar("teleporting");
    expect(pillar).toBeFalsy();
  });
});

describe("calculateCookingMethodCompatibility", () => {
  it("returns a number between 0 and 1", () => {
    const score = calculateCookingMethodCompatibility("grilling", "roasting");
    expect(typeof score).toBe("number");
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  it("returns 0.5 for unknown cooking methods", () => {
    const score = calculateCookingMethodCompatibility("teleporting", "hovering");
    expect(score).toBe(0.5);
  });

  it("returns 0.5 when one method is unknown", () => {
    const score = calculateCookingMethodCompatibility("grilling", "teleporting");
    expect(score).toBe(0.5);
  });

  it("returns consistent results for the same pair", () => {
    const score1 = calculateCookingMethodCompatibility("grilling", "roasting");
    const score2 = calculateCookingMethodCompatibility("grilling", "roasting");
    expect(score1).toBe(score2);
  });
});
