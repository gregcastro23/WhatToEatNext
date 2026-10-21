/**
 * @jest-environment node
 *
 * Tests for FeedDatabaseService ESMS reflection charging:
 * - Debits RECIPE_REFLECTION_COST when agent posts a recipe reflection.
 * - Marks recipeCommentStatus as failed when agent has insufficient funds.
 * - Bypasses charging for human reviews or skipEconomyCharge: true.
 */

const mockExecuteQuery = jest.fn();
jest.mock("@/lib/database/connection", () => ({
  executeQuery: (...args: unknown[]): unknown => mockExecuteQuery(...args),
}));

import { feedDatabase } from "@/services/feedDatabaseService";
import { agentEconomyActionService } from "@/services/agentEconomyActionService";
import { RECIPE_REFLECTION_COST } from "@/types/economy";

describe("FeedDatabaseService — Recipe Reflection Economy Charging", () => {
  const agentActorId = "agent-author-uuid-1";
  const humanActorId = "human-author-uuid-2";

  beforeEach(() => {
    mockExecuteQuery.mockReset();
    agentEconomyActionService.resetInMemory();

    mockExecuteQuery.mockImplementation((sql: string, params: unknown[] = []) => {
      // User lookup
      if (sql.includes("SELECT u.email, u.is_agent")) {
        const id = Array.isArray(params) ? params[0] : "";
        const isAgent = id === agentActorId;
        return Promise.resolve({
          rows: [
            {
              email: isAgent ? "agent@agentic.alchm.kitchen" : "human@alchm.kitchen",
              is_agent: isAgent,
              actor_name: isAgent ? "Agent Chef" : "Human Cook",
              share_identity: true,
            },
          ],
        });
      }
      // Feed event insert
      if (sql.includes("INSERT INTO feed_events")) {
        return Promise.resolve({ rows: [{ id: "feed-event-uuid-1" }] });
      }
      // Recipe reflections insert
      if (sql.includes("INSERT INTO recipe_reflections")) {
        return Promise.resolve({
          rows: [
            {
              id: "reflection-uuid-1",
              recipe_id: "recipe-123",
              author_id: Array.isArray(params) ? params[1] : "",
              publication_id: null,
              feed_event_id: "feed-event-uuid-1",
              delivery_key: null,
              source: "recipe_alteration",
              content_state: "proposed",
              review: "Delicious reflection",
              score: 5,
              is_agent: true,
              instruction_review_required: true,
              provenance: {},
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              deleted_at: null,
              hidden: false,
            },
          ],
        });
      }
      // Legacy interaction mirror
      if (sql.includes("INSERT INTO user_recipe_interactions")) {
        return Promise.resolve({ rows: [] });
      }
      return Promise.resolve({ rows: [] });
    });
  });

  it("debits RECIPE_REFLECTION_COST and marks recipeCommentStatus='saved' when agent has sufficient funds", async () => {
    agentEconomyActionService.seedInMemoryBalance(agentActorId, {
      spirit: 1.0,
      essence: 1.0,
      matter: 1.0,
      substance: 1.0,
    });

    const result = await feedDatabase.publishFeedEvent({
      actorId: agentActorId,
      eventType: "recipe_review",
      metadataPayload: {
        recipeId: "recipe-123",
        recipeName: "Truffle Pasta",
        review: "A wonderful pairing with earthy saffron.",
        source: "recipe_alteration",
      },
    });

    expect(result.success).toBe(true);
    expect(result.feedPublished).toBe(true);
    expect(result.recipeCommentStatus).toBe("saved");
    expect(result.recipeCommentSaved).toBe(true);
    expect(result.economy).toBeDefined();
    if (result.economy) {
      expect(result.economy.charged).toBe(true);
      expect(result.economy.costBasket).toEqual(RECIPE_REFLECTION_COST);
      expect(result.economy.remainingBalances.spirit).toBe(0.9);
    }
  });

  it("reports recipeCommentStatus='failed' and recipeCommentSaved=false when agent has insufficient funds", async () => {
    // 0 balance
    agentEconomyActionService.seedInMemoryBalance(agentActorId, {
      spirit: 0,
      essence: 0,
      matter: 0,
      substance: 0,
    });

    const result = await feedDatabase.publishFeedEvent({
      actorId: agentActorId,
      eventType: "recipe_review",
      metadataPayload: {
        recipeId: "recipe-123",
        recipeName: "Truffle Pasta",
        review: "Attempted review with no balance.",
        source: "recipe_alteration",
      },
    });

    expect(result.success).toBe(true);
    expect(result.feedPublished).toBe(true);
    expect(result.recipeCommentStatus).toBe("failed");
    expect(result.recipeCommentSaved).toBe(false);
  });

  it("does not charge human users when posting recipe reviews", async () => {
    const result = await feedDatabase.publishFeedEvent({
      actorId: humanActorId,
      eventType: "recipe_review",
      metadataPayload: {
        recipeId: "recipe-123",
        recipeName: "Truffle Pasta",
        review: "Cooked this at home, loved it!",
        rating: 5,
        madeIt: true,
      },
    });

    expect(result.success).toBe(true);
    expect(result.feedPublished).toBe(true);
    expect(result.recipeCommentStatus).toBe("saved");
    expect(result.economy).toBeUndefined();
  });

  it("bypasses charging when skipEconomyCharge is true", async () => {
    // 0 balance
    agentEconomyActionService.seedInMemoryBalance(agentActorId, {
      spirit: 0,
      essence: 0,
      matter: 0,
      substance: 0,
    });

    const result = await feedDatabase.publishFeedEvent({
      actorId: agentActorId,
      eventType: "recipe_review",
      metadataPayload: {
        recipeId: "recipe-123",
        recipeName: "Truffle Pasta",
        review: "Seed review.",
        source: "recipe_alteration",
        skipEconomyCharge: true,
      },
    });

    expect(result.success).toBe(true);
    expect(result.feedPublished).toBe(true);
    expect(result.recipeCommentStatus).toBe("saved");
    expect(result.recipeCommentSaved).toBe(true);
  });
});
