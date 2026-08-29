const mockGetReliablePlanetaryPositions = jest.fn();

jest.mock("@/utils/reliableAstronomy", () => ({
  getReliablePlanetaryPositions: (...args: unknown[]) =>
    mockGetReliablePlanetaryPositions(...args),
}));

import { getSteeringFileIntelligence } from "@/utils/steeringFileIntelligence";

describe("SteeringFileIntelligence planetary boundary", () => {
  beforeEach(() => {
    mockGetReliablePlanetaryPositions.mockResolvedValue({
      Sun: { sign: "Aries" },
      Mars: { sign: "leo" },
      Moon: { sign: "pisces" },
      malformed: { sign: 4 },
    });
  });

  it("reads validated zodiac signs without any-based member access", async () => {
    const guidance =
      await getSteeringFileIntelligence().getAstrologicalGuidance();

    expect(guidance.dominantElement).toBe("Fire");
    expect(guidance.elementalBalance).toEqual({
      Fire: 2 / 3,
      Water: 1 / 3,
      Earth: 0,
      Air: 0,
    });
    expect(
      Object.values(guidance.elementalBalance).reduce(
        (total, value) => total + value,
        0,
      ),
    ).toBeCloseTo(1);
  });

  it("rejects non-finite elemental properties", () => {
    expect(
      getSteeringFileIntelligence().validateElementalProperties({
        Fire: Number.NaN,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25,
      }),
    ).toBe(false);
  });
});
