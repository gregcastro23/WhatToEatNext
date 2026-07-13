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
 *   - per-IP rate limiting (429 past the strict unauthenticated cap)
 */

// Mock next/server before any imports.
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({
      status: init?.status ?? 200,
      json: async () => body,
      headers: init?.headers ?? {},
    })),
  },
}));

// Force the rate limiter onto its in-memory fallback (no Redis in tests).
jest.mock("@/lib/redis", () => ({
  getRedisClient: () => null,
}));

import { EnhancedRecommendationService } from "@/services/EnhancedRecommendationService";
import { calculateCompositeNatalChart } from "@/services/groupNatalChartService";
import { calculateNatalChart } from "@/services/natalChartService";
import { getCuisineRecommendations } from "@/utils/cuisineRecommender";
import { getRecommendedCookingMethods } from "@/utils/recommendation/methodRecommendation";
import { POST } from "../route";

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

// Each request gets a unique client IP by default so the per-IP rate limiter
// (whose in-memory store persists across tests in this file) never bleeds
// between unrelated tests. Pass an explicit `ip` to simulate one client.
let ipCounter = 0;
function makeRequest(body: unknown, ip?: string): Request {
  const addr = ip ?? `10.9.${Math.floor(++ipCounter / 250)}.${ipCounter % 250}`;
  return {
    json: async () => body,
    headers: {
      get: (key: string) =>
        key.toLowerCase() === "x-forwarded-for" ? addr : null,
    },
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
      recipe: {
        id: "r1",
        name: "Spicy Test Dish",
        ingredients: [],
        instructions: [],
      },
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
    const guests = [makeGuest("Alice"), makeGuest("Bob"), makeGuest("Carol")];
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

  it("uses a supplied companion chart in the composite without recalculating it", async () => {
    const savedChart = {
      ...stubNatalChart,
      dominantElement: "Water",
      elementalBalance: { Fire: 0.1, Water: 0.6, Earth: 0.2, Air: 0.1 },
    };
    const guest = {
      ...makeGuest("Saved Friend"),
      id: "manual-001",
      natalChart: savedChart,
    };

    const res = await POST(makeRequest({ guests: [guest] }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(calculateNatalChart).not.toHaveBeenCalled();
    expect(calculateCompositeNatalChart).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          id: "manual-001",
          name: "Saved Friend",
          natalChart: expect.objectContaining({
            dominantElement: "Water",
            elementalBalance: expect.objectContaining({ Water: 0.6 }),
          }),
        }),
      ],
      "guest-session",
    );
  });

  it("recalculates when a supplied chart is incomplete", async () => {
    const guest = {
      ...makeGuest("Legacy Friend"),
      natalChart: { dominantElement: "Earth" },
    };

    const res = await POST(makeRequest({ guests: [guest] }));

    expect(res.status).toBe(200);
    expect(calculateNatalChart).toHaveBeenCalledTimes(1);
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
      expect.arrayContaining([expect.objectContaining({ name: "Solo" })]),
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

  it("returns 429 once a single IP exceeds the per-minute cap", async () => {
    const IP = "203.0.113.7";
    const body = { guests: [makeGuest("Repeat")] };

    // The strict unauthenticated cap is 10/min — the first 10 pass.
    for (let i = 0; i < 10; i++) {
      const res = await POST(makeRequest(body, IP));
      expect(res.status).toBe(200);
    }

    const res = await POST(makeRequest(body, IP));
    const data = await res.json();

    expect(res.status).toBe(429);
    expect(data.error).toBe("rate_limit_exceeded");
    expect(typeof data.retryAfter).toBe("number");

    // Other clients are unaffected — the limit is per-IP.
    const other = await POST(makeRequest(body, "203.0.113.8"));
    expect(other.status).toBe(200);
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
