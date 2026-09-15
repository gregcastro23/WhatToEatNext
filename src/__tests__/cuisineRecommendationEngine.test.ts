import {
  generateCuisineRecommendations,
  type UserProfile,
} from "@/utils/cuisine/cuisineRecommendationEngine";
import type { CuisineComputedProperties } from "@/types/hierarchy";

describe("generateCuisineRecommendations characterization", () => {
  const mockUserProfile: UserProfile = {
    elementalPreferences: {
      Fire: 0.8,
      Earth: 0.3,
      Air: 0.4,
      Water: 0.2,
    },
    culturalBackground: {
      preferredCuisines: ["mexican"],
      spiceTolerance: "high",
    },
  };

  const createMockCuisine = (
    overrides?: Partial<CuisineComputedProperties>,
  ): CuisineComputedProperties => ({
    averageElementals: {
      Fire: 0.7,
      Earth: 0.3,
      Air: 0.3,
      Water: 0.2,
    },
    variance: {
      elementals: { Fire: 0.1, Earth: 0.1, Air: 0.1, Water: 0.1 },
      diversityScore: 0.5,
    },
    signatures: [],
    sampleSize: 15,
    computedAt: new Date(),
    version: "1.0",
    ...overrides,
  });

  it("generates ranked recommendations and populates reasoning via helper", () => {
    const availableCuisines = new Map<
      string,
      { name: string; properties: CuisineComputedProperties }
    >([
      [
        "mexican",
        {
          name: "Mexican",
          properties: createMockCuisine({
            averageElementals: { Fire: 0.8, Earth: 0.2, Air: 0.3, Water: 0.2 },
          }),
        },
      ],
      [
        "nordic",
        {
          name: "Nordic",
          properties: createMockCuisine({
            averageElementals: { Fire: 0.1, Earth: 0.4, Air: 0.2, Water: 0.8 },
          }),
        },
      ],
    ]);

    const recs = generateCuisineRecommendations(mockUserProfile, availableCuisines, {
      minCompatibilityThreshold: 0.1,
      includeReasoning: true,
    });

    expect(recs.length).toBeGreaterThan(0);
    const topRec = recs[0];
    expect(topRec.cuisineId).toBe("mexican");
    expect(topRec.compatibilityScore).toBeGreaterThan(0.5);
    expect(Array.isArray(topRec.reasoning)).toBe(true);
    expect(topRec.reasoning.length).toBeGreaterThan(0);
    expect(topRec.scoringFactors.elementalCompatibility).toBeDefined();
    expect(topRec.scoringFactors.culturalAlignment).toBeDefined();
    // alchemicalCompatibility should be absent when not provided
    expect("alchemicalCompatibility" in topRec.scoringFactors).toBe(false);
  });

  it("handles optional alchemical compatibility when preferences are present", () => {
    const profileWithAlchemical: UserProfile = {
      ...mockUserProfile,
      alchemicalPreferences: {
        Spirit: 0.6,
        Essence: 0.5,
        Matter: 0.4,
        Substance: 0.5,
      },
    };

    const availableCuisines = new Map<
      string,
      { name: string; properties: CuisineComputedProperties }
    >([
      [
        "mexican",
        {
          name: "Mexican",
          properties: createMockCuisine({
            averageAlchemical: {
              Spirit: 0.6,
              Essence: 0.5,
              Matter: 0.4,
              Substance: 0.5,
            },
          }),
        },
      ],
    ]);

    const recs = generateCuisineRecommendations(profileWithAlchemical, availableCuisines);
    expect(recs.length).toBe(1);
    expect(recs[0].scoringFactors.alchemicalCompatibility).toBeDefined();
    expect(typeof recs[0].scoringFactors.alchemicalCompatibility).toBe("number");
  });

  it("omits reasoning strings when includeReasoning is false", () => {
    const availableCuisines = new Map<
      string,
      { name: string; properties: CuisineComputedProperties }
    >([
      ["mexican", { name: "Mexican", properties: createMockCuisine() }],
    ]);

    const recs = generateCuisineRecommendations(mockUserProfile, availableCuisines, {
      includeReasoning: false,
    });

    expect(recs[0].reasoning).toEqual([]);
  });
});
