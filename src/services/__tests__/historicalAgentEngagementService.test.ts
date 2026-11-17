/**
 * @jest-environment node
 *
 * Tests for runHistoricalAgentEngagement:
 *   - Enforces historical dietary compliance and computes elemental 3–5 star ratings
 *   - Tops up daily yield when an eligible agent is short of 0.4 ESMS
 *   - Publishes recipe_review (with rating & historical_reflection source), feed comments,
 *     and feed insights while respecting blocklist & duplicate guards
 */

const mockExecuteQuery = jest.fn();
const mockGetAllRecipes = jest.fn();
const mockClaimDailyYield = jest.fn();
const mockPublishFeedEvent = jest.fn();
const mockCreateComment = jest.fn();
const mockIsBlockedBetween = jest.fn();

jest.mock("@/lib/database/connection", () => ({
  executeQuery: (...args: unknown[]): unknown => mockExecuteQuery(...args),
}));
jest.mock("@/services/LocalRecipeService", () => ({
  LocalRecipeService: {
    getAllRecipes: (...args: unknown[]): unknown => mockGetAllRecipes(...args),
  },
}));
jest.mock("@/services/DailyYieldService", () => ({
  dailyYieldService: {
    claimDailyYield: (...args: unknown[]): unknown => mockClaimDailyYield(...args),
  },
}));
jest.mock("@/services/feedDatabaseService", () => ({
  feedDatabase: {
    publishFeedEvent: (...args: unknown[]): unknown => mockPublishFeedEvent(...args),
  },
}));
jest.mock("@/services/feedCommentsDatabaseService", () => ({
  feedCommentsDatabase: {
    createComment: (...args: unknown[]): unknown => mockCreateComment(...args),
  },
}));
jest.mock("@/lib/feed/commentEnforcement", () => ({
  isBlockedBetween: (...args: unknown[]): unknown => mockIsBlockedBetween(...args),
}));
jest.mock("@/lib/logger", () => ({
  _logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

import { runHistoricalAgentEngagement } from "@/services/historicalAgentEngagementService";
import type { Recipe } from "@/types/recipe";

function makeRecipe(id: string, name: string, meat = false): Recipe {
  return {
    id,
    name,
    cuisine: "Renaissance",
    isPublic: true,
    ingredients: meat
      ? [
          { name: "beef chuck", amount: 300, unit: "g" },
          { name: "olive oil", amount: 15, unit: "ml" },
          { name: "sea salt", amount: 5, unit: "g" },
        ]
      : [
          { name: "millet", amount: 200, unit: "g" },
          { name: "olive oil", amount: 15, unit: "ml" },
          { name: "rosemary", amount: 5, unit: "g" },
        ],
    instructions: ["Prepare gently and serve warm."],
    elementalProperties: { Fire: 0.55, Air: 0.2, Earth: 0.15, Water: 0.1 },
  };
}

describe("runHistoricalAgentEngagement", () => {
  const leoId = "11111111-1111-4111-8111-111111111111";
  const cleoId = "22222222-2222-4222-8222-222222222222";
  const postEventId = "33333333-3333-4333-8333-333333333333";

  beforeEach(() => {
    mockExecuteQuery.mockReset();
    mockGetAllRecipes.mockReset();
    mockClaimDailyYield.mockReset();
    mockPublishFeedEvent.mockReset();
    mockCreateComment.mockReset();
    mockIsBlockedBetween.mockReset().mockResolvedValue(false);

    mockGetAllRecipes.mockResolvedValue([
      makeRecipe("rec-meat", "Roasted Beef Stew", true),
      makeRecipe("rec-veg", "Rosemary Millet Cake", false),
    ]);

    mockClaimDailyYield.mockResolvedValue({
      status: "claimed",
      result: { totalTokens: 2.0 },
    });

    mockPublishFeedEvent.mockResolvedValue({
      success: true,
      feedPublished: true,
      recipeCommentSaved: true,
      recipeCommentStatus: "saved",
      legacyInteractionStatus: "no_op",
    });

    mockCreateComment.mockResolvedValue({ id: "comment-1" });

    mockExecuteQuery.mockImplementation(async (sql: string) => {
      if (sql.includes("FROM users u") && sql.includes("natal_positions")) {
        return {
          rows: [
            {
              id: leoId,
              email: "leonardo-da-vinci@agentic.alchm.kitchen",
              name: "Leonardo da Vinci",
              dominant_element: "Fire",
              dietary_preferences: {
                avoidedFoods: ["Meat (noted vegetarian)"],
                culturalCuisine: "Florentine",
                dietaryPhilosophy: "Plant-based geometric harmony.",
                favoriteFoods: ["millet", "rosemary"],
              },
              natal_positions: [{ planet: "Sun", sign: "Taurus", degree: 2 }],
              total_balance: 0.1, // triggers daily yield top-up
              last_reviewed_at: null,
              last_posted_at: null,
            },
            {
              id: cleoId,
              email: "cleopatra@agentic.alchm.kitchen",
              name: "Cleopatra VII",
              dominant_element: "Water",
              dietary_preferences: {
                avoidedFoods: ["Pork"],
                culturalCuisine: "Alexandrian",
              },
              natal_positions: [{ planet: "Sun", sign: "Capricorn", degree: 14 }],
              total_balance: 2.5,
              last_reviewed_at: "2026-10-24T00:00:00Z",
              last_posted_at: "2026-11-17T10:00:00Z",
            },
          ],
        };
      }
      if (sql.includes("FROM recipe_reflections")) {
        return { rows: [] };
      }
      if (sql.includes("FROM feed_events f")) {
        return {
          rows: [
            {
              id: postEventId,
              actor_id: leoId,
              event_type: "made_it",
              metadata_payload: { recipeName: "Rosemary Millet Cake" },
              actor_name: "Leonardo da Vinci",
              actor_is_agent: true,
            },
          ],
        };
      }
      if (sql.includes("FROM feed_comments")) {
        return { rows: [] };
      }
      return { rows: [] };
    });
  });

  it("rates/reviews compliant recipes, comments on feed posts, and publishes insights", async () => {
    const res = await runHistoricalAgentEngagement({
      reviewCount: 1,
      commentCount: 1,
      insightCount: 1,
      now: new Date("2026-11-17T21:20:00.000Z"),
    });

    expect(res).toEqual({
      agentsEligible: 2,
      yieldsClaimed: 1,
      recipesReviewed: 1,
      reflectionsSaved: 1,
      feedCommentsPosted: 1,
      feedInsightsPosted: 1,
      errors: 0,
    });

    // Vegetarian Leonardo must review Rosemary Millet Cake, NOT Roasted Beef Stew
    const reviewCall = mockPublishFeedEvent.mock.calls.find(
      ([arg]: [{ eventType: string }]) => arg.eventType === "recipe_review",
    )?.[0];
    expect(reviewCall).toBeDefined();
    expect(reviewCall.actorId).toBe(leoId);
    expect(reviewCall.metadataPayload.recipeId).toBe("rec-veg");
    expect(reviewCall.metadataPayload.source).toBe("historical_reflection");
    expect(reviewCall.metadataPayload.rating).toBeGreaterThanOrEqual(4);
    expect(reviewCall.metadataPayload.rating).toBeLessThanOrEqual(5);

    // Commenter must not be the post author (leoId) — Cleopatra comments on Leonardo's post
    expect(mockCreateComment).toHaveBeenCalledTimes(1);
    expect(mockCreateComment.mock.calls[0]?.[0]).toBe(postEventId);
    expect(mockCreateComment.mock.calls[0]?.[1]).toBe(cleoId);
    expect(mockCreateComment.mock.calls[0]?.[2]).toContain("Rosemary Millet Cake");

    // Insight published
    const insightCall = mockPublishFeedEvent.mock.calls.find(
      ([arg]: [{ eventType: string }]) => arg.eventType === "insight",
    )?.[0];
    expect(insightCall).toBeDefined();
    expect(insightCall.metadataPayload.insightTitle).toBeTruthy();
  });
});
