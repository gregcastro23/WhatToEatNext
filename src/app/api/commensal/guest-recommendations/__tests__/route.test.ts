/**
 * Tests for /api/commensal/guest-recommendations.
 *
 * Covers:
 *   - happy path with multiple guests
 *   - missing timezone (allowed — backend calculates from coords)
 *   - malformed birthData (missing latitude → 400)
 *   - empty guests array (400)
 *   - single-member group (composite math still valid)
 *   - large group (10 guests, payload schema unchanged)
 */

// Mock next/server before any imports.
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({
      status: init?.status ?? 200,
      json: async () => body,
    })),
  },
}));

import { POST } from "../route";
import { calculateNatalChart } from "@/services/natalChartService";
import { calculateCompositeNatalChart } from "@/services/groupNatalChartService";
import { EnhancedRecommendationService } from "@/services/EnhancedRecommendationService";
import { getCuisineRecommendations } from "@/utils/cuisineRecommender";
import { getRecommendedCookingMethods } from "@/utils/recommendation/methodRecommendation";

jest.mock("@/services/natalChartService", () => ({
  calculateNatalChart: jest.fn(),
}));

jest.mock("@/services/groupNatalChartService", () => ({
  calculateCompositeNatalChart: jest.fn(),
}));

jest.mock("@/services/EnhancedRecommendationService", () => ({
  EnhancedRecommendationService: {
    getRecommendationsForComposite: jest.fn(),
  },
}));

jest.mock("@/utils/cuisineRecommender", () => ({
  getCuisineRecommendations: jest.fn(),
}));

jest.mock("@/utils/recommendation/methodRecommendation", () => ({
  getRecommendedCookingMethods: jest.fn(),
}));

function makeRequest(body: unknown): Request {
  return {
    json: async () => body,
  } as unknown as Request;
}

const stubNatalChart = {
  birthData: { dateTime: "2026-01-01T12:00:00Z", latitude: 40, longitude: -74 },
  planets: [],
  ascendant: "aries",
  planetaryPositions: {},
  dominantElement: "Fire",
  dominantModality: "Cardinal",
  elementalBalance: { Fire: 0.4, Water: 0.2, Earth: 0.2, Air: 0.2 },
  alchemicalProperties: { Spirit: 4, Essence: 7, Matter: 6, Substance: 2 },
  calculatedAt: "2026-04-25T00:00:00Z",
};

const stubComposite = {
  groupId: "guest-session",
  memberCount: 0,
  dominantElement: "Fire",
  dominantModality: "Cardinal",
  elementalBalance: { Fire: 0.4, Water: 0.2, Earth: 0.2, Air: 0.2 },
  alchemicalProperties: { Spirit: 4, Essence: 7, Matter: 6, Substance: 2 },
  elementalDistribution: { Fire: 1, Water: 0, Earth: 0, Air: 0 },
  modalityDistribution: { Cardinal: 1, Fixed: 0, Mutable: 0 },
  calculatedAt: "2026-04-25T00:00:00Z",
};

const stubRecipeResult = {
  recommendations: [
    {
      recipe: { id: "r1", name: "Spicy Test Dish", ingredients: [], instructions: [] },
      score: 0.85,
      scoreBreakdown: {
        nutritionalGap: 0.5,
        elementalMatch: 0.7,
        favoriteBoost: 0.5,
        astrologicalAlignment: 0.9,
        diversityBonus: 0.5,
      },
      reason: "aligns with your group's elemental signature",
    },
  ],
  items: [],
  score: 0.85,
  confidence: 0.85,
  context: { userId: "guest-session", datetime: new Date() },
};

beforeEach(() => {
  jest.clearAllMocks();
  (calculateNatalChart as jest.Mock).mockResolvedValue(stubNatalChart);
  (calculateCompositeNatalChart as jest.Mock).mockImplementation(
    (members: unknown[]) => ({
      ...stubComposite,
      memberCount: members.length,
    }),
  );
  (
    EnhancedRecommendationService.getRecommendationsForComposite as jest.Mock
  ).mockResolvedValue(stubRecipeResult);
  (getCuisineRecommendations as jest.Mock).mockReturnValue([
    { cuisineId: "italian", cuisineName: "Italian", score: 0.82 },
  ]);
  (getRecommendedCookingMethods as jest.Mock).mockReturnValue([
    {
      name: "grilling",
      score: 0.9,
      description: "",
      reasons: ["Strong elemental alignment"],
      elementalEffect: { Fire: 1, Water: 0, Earth: 0, Air: 0 },
      duration: { min: 10, max: 30 },
      thermodynamics: {},
      variations: [],
    },
    {
      name: "roasting",
      score: 0.78,
      description: "",
      reasons: ["Favorable for fire"],
      elementalEffect: { Fire: 0.7, Water: 0, Earth: 0.3, Air: 0 },
      duration: { min: 30, max: 60 },
      thermodynamics: {},
      variations: [],
    },
  ]);
});

describe("POST /api/commensal/guest-recommendations", () => {
  it("returns composite, recipes, methods, and cuisine recs for a 3-guest group", async () => {
    const guests = [
      makeGuest("Alice"),
      makeGuest("Bob"),
      makeGuest("Carol"),
    ];
    const res = await POST(makeRequest({ guests }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.compositeChart.memberCount).toBe(3);
    expect(Array.isArray(data.recipes)).toBe(true);
    expect(data.recipes[0].recipe.name).toBe("Spicy Test Dish");
    expect(Array.isArray(data.cookingMethods)).toBe(true);
    expect(data.cookingMethods[0]).toEqual(
      expect.objectContaining({ method: "grilling", score: 0.9 }),
    );
    expect(Array.isArray(data.cuisineRecs)).toBe(true);
    expect(calculateNatalChart).toHaveBeenCalledTimes(3);
    expect(getCuisineRecommendations).toHaveBeenCalledWith(
      expect.objectContaining({ Fire: 0.4 }),
    );
  });

  it("accepts birthData without timezone", async () => {
    const guest = {
      name: "Alice",
      birthData: {
        dateTime: "1990-06-15T08:00:00Z",
        latitude: 40.7,
        longitude: -74.0,
        // no timezone field
      },
    };
    const res = await POST(makeRequest({ guests: [guest] }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(calculateNatalChart).toHaveBeenCalledWith(
      expect.objectContaining({ latitude: 40.7, longitude: -74.0 }),
    );
  });

  it("returns 400 when birthData is missing latitude", async () => {
    const guest = {
      name: "Alice",
      birthData: {
        dateTime: "1990-06-15T08:00:00Z",
        longitude: -74.0,
      } as unknown,
    };
    const res = await POST(makeRequest({ guests: [guest] }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toMatch(/birthData/);
    expect(calculateNatalChart).not.toHaveBeenCalled();
  });

  it("returns 400 for an empty guests array", async () => {
    const res = await POST(makeRequest({ guests: [] }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toMatch(/at least one guest/i);
  });

  it("handles a single-guest group", async () => {
    const res = await POST(makeRequest({ guests: [makeGuest("Solo")] }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.compositeChart.memberCount).toBe(1);
    expect(calculateCompositeNatalChart).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ name: "Solo" }),
      ]),
      "guest-session",
    );
  });

  it("scales to a large group (10 guests) without changing payload schema", async () => {
    const guests = Array.from({ length: 10 }, (_, i) => makeGuest(`Guest${i}`));
    const res = await POST(makeRequest({ guests }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.compositeChart.memberCount).toBe(10);
    expect(data.groupMembers).toHaveLength(10);
    // Payload shape: contract preserved.
    expect(data).toEqual(
      expect.objectContaining({
        success: true,
        compositeChart: expect.any(Object),
        cuisineRecs: expect.any(Array),
        cookingMethods: expect.any(Array),
        recipes: expect.any(Array),
        groupMembers: expect.any(Array),
      }),
    );
  });

  it("returns 400 when guests field is missing", async () => {
    const res = await POST(makeRequest({}));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
  });
});

function makeGuest(name: string) {
  return {
    name,
    birthData: {
      dateTime: "1990-01-01T12:00:00Z",
      latitude: 40.7,
      longitude: -74.0,
      timezone: "America/New_York",
    },
  };
}
