/**
 * Tests for feedDatabaseService recipe review & reflection mirroring
 *
 * Phase 45 C1: Verifies that feedDatabase.createEvent does NOT invent
 * a 5-star rating or a made_it=true cooking flag when neither was provided
 * by the caller (e.g. for agent culinary critiques).
 */

const mockQuery = jest.fn();
jest.mock("@/lib/database/connection", () => ({
  executeQuery: (...args: unknown[]) => mockQuery(...args),
}));

jest.mock("@/lib/logger", () => ({
  _logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn() },
}));

import { feedDatabase } from "@/services/feedDatabaseService";

describe("feedDatabaseService recipe interaction mirroring", () => {
  const ACTOR_ID = "11111111-1111-1111-1111-111111111111";
  const RECIPE_ID = "22222222-2222-2222-2222-222222222222";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does NOT invent rating=5 or made_it=true when neither is provided in payload", async () => {
    let capturedInteractionParams: unknown[] = [];

    mockQuery.mockImplementation((sql: string, params: unknown[] = []) => {
      if (sql.includes("SELECT u.email")) {
        return Promise.resolve({
          rows: [
            {
              email: "leonardo@agentic.alchm.kitchen",
              is_agent: true,
              actor_name: "Leonardo da Vinci",
              share_identity: true,
            },
          ],
        });
      }
      if (sql.includes("INSERT INTO feed_events")) {
        return Promise.resolve({ rows: [], rowCount: 1 });
      }
      if (sql.includes("INSERT INTO user_recipe_interactions")) {
        capturedInteractionParams = params;
        return Promise.resolve({ rows: [], rowCount: 1 });
      }
      return Promise.resolve({ rows: [] });
    });

    await feedDatabase.createEvent(
      ACTOR_ID,
      "recipe_review",
      {
        recipeId: RECIPE_ID,
        recipeName: "Botanical Tart",
        review: "A balanced mathematical preparation.",
        agentSlug: "leonardo-da-vinci",
        // Notice: NO rating, NO madeIt: true
      },
      true, // skipWebhook
    );

    expect(capturedInteractionParams.length).toBeGreaterThan(0);
    // [actorId, targetRecipeId, madeIt, rating, reviewText]
    expect(capturedInteractionParams[4]).toBe("A balanced mathematical preparation.");
    expect(capturedInteractionParams[3]).toBeNull();
    expect(capturedInteractionParams[2]).toBe(false);
  });

  it("preserves authentic human rating and made_it flag when explicitly provided", async () => {
    let capturedInteractionParams: unknown[] = [];

    mockQuery.mockImplementation((sql: string, params: unknown[] = []) => {
      if (sql.includes("SELECT u.email")) {
        return Promise.resolve({
          rows: [
            {
              email: "human@example.com",
              is_agent: false,
              actor_name: "Human Cook",
              share_identity: true,
            },
          ],
        });
      }
      if (sql.includes("INSERT INTO feed_events")) {
        return Promise.resolve({ rows: [], rowCount: 1 });
      }
      if (sql.includes("INSERT INTO user_recipe_interactions")) {
        capturedInteractionParams = params;
        return Promise.resolve({ rows: [], rowCount: 1 });
      }
      return Promise.resolve({ rows: [] });
    });

    await feedDatabase.createEvent(
      ACTOR_ID,
      "recipe_review",
      {
        recipeId: RECIPE_ID,
        recipeName: "Botanical Tart",
        review: "I made this last night and it was delicious!",
        rating: 4,
        madeIt: true,
      },
      true, // skipWebhook
    );

    expect(capturedInteractionParams.length).toBeGreaterThan(0);
    expect(capturedInteractionParams[4]).toBe("I made this last night and it was delicious!");
    expect(capturedInteractionParams[3]).toBe(4);
    expect(capturedInteractionParams[2]).toBe(true);
  });
});
