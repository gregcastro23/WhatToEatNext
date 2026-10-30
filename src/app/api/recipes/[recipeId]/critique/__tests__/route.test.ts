/**
 * Tests for POST /api/recipes/[recipeId]/critique
 *
 * Verifies Phase 45 C1 remediation:
 * 1. Authentication required (401 for unauthenticated callers).
 * 2. Actor rate limiting (429 when rate limit exceeded).
 * 3. Authoritative recipe lookup (404 when recipeId is missing from catalog).
 * 4. Authoritative agent lookup (404 when agentSlug is unknown).
 * 5. Elimination of invented 5-star ratings and made_it/madeIt cooking claims.
 * 6. Explicit live, gateway-degraded, and curated response states.
 * 7. Separation of generation from publication failure (persistence failure returns published: false).
 * 8. Error logging for degraded and fallback runs.
 */

import { NextRequest } from "next/server";

// Mock dependencies before importing route
const mockGetUserIdFromRequest = jest.fn();
jest.mock("@/lib/auth/validateRequest", () => ({
  getUserIdFromRequest: (...args: unknown[]) =>
    mockGetUserIdFromRequest(...args),
}));

const mockRateLimit = jest.fn();
jest.mock("@/lib/rateLimit", () => ({
  rateLimit: (...args: unknown[]) => mockRateLimit(...args),
}));

const mockExecuteQuery = jest.fn();
jest.mock("@/lib/database/connection", () => ({
  executeQuery: (...args: unknown[]) => mockExecuteQuery(...args),
}));

const mockChatWithAgent = jest.fn();
jest.mock("@/lib/agents/planetaryAgentsGateway", () => ({
  planetaryAgentsGateway: {
    chatWithAgent: (...args: unknown[]) => mockChatWithAgent(...args),
  },
}));

const mockCreateEvent = jest.fn();
jest.mock("@/services/feedDatabaseService", () => ({
  feedDatabase: {
    createEvent: (...args: unknown[]) => mockCreateEvent(...args),
  },
}));

const mockLogger = {
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
};
jest.mock("@/lib/logger", () => ({
  _logger: mockLogger,
}));

import { POST } from "../route";

describe("POST /api/recipes/[recipeId]/critique", () => {
  const RECIPE_ID = "11111111-2222-3333-4444-555555555555";
  const AGENT_ID = "99999999-8888-7777-6666-555555555555";

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.INTERNAL_API_SECRET;

    // Default: Authenticated user
    mockGetUserIdFromRequest.mockResolvedValue("user-123");

    // Default: Rate limit allowed
    mockRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 9,
      resetMs: 60000,
    });

    // Default: Recipe found
    mockExecuteQuery.mockImplementation((sql: string, params: unknown[]) => {
      if (sql.includes("FROM recipes")) {
        return Promise.resolve({
          rows: [
            {
              id: RECIPE_ID,
              name: "Roasted Winter Squash Bowl",
              description: "A nourishing botanical preparation.",
              cuisine: "Seasonal",
            },
          ],
        });
      }
      if (sql.includes("FROM users u")) {
        return Promise.resolve({
          rows: [
            {
              id: AGENT_ID,
              email: "leonardo-da-vinci@agentic.alchm.kitchen",
              name: "Leonardo da Vinci",
              dominant_element: "Air",
              bio: "Polymath of Florence",
              dietary_preferences: {
                dietaryPhilosophy: "botanical mathematics",
                culturalCuisine: "Tuscan",
              },
            },
          ],
        });
      }
      return Promise.resolve({ rows: [] });
    });

    // Default: Live gateway success
    mockChatWithAgent.mockResolvedValue({
      status: "live",
      providerAgentId: "leonardo-da-vinci",
      metadata: { aiGenerated: true },
      content:
        "In observing this preparation, observe the mathematical harmony of botanical essences. The roasted squash honors both vital spirit and inventive intellect.",
    });

    // Default: Feed creation succeeds
    mockCreateEvent.mockResolvedValue(true);
  });

  function makeRequest(
    body: Record<string, unknown> = {},
    headers: Record<string, string> = {},
  ): NextRequest {
    return new NextRequest(
      `http://localhost:3000/api/recipes/${RECIPE_ID}/critique`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...headers,
        },
        body: JSON.stringify(body),
      },
    );
  }

  it("1. Rejects unauthenticated callers with 401 Unauthorized", async () => {
    mockGetUserIdFromRequest.mockResolvedValue(null);

    const req = makeRequest({ agentSlug: "leonardo-da-vinci" });
    const res = await POST(req, {
      params: Promise.resolve({ recipeId: RECIPE_ID }),
    });

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.message).toMatch(/authentication/i);
    // Must not execute queries or inference when unauthenticated
    expect(mockExecuteQuery).not.toHaveBeenCalled();
    expect(mockChatWithAgent).not.toHaveBeenCalled();
  });

  it("2. Allows internal service call with valid INTERNAL_API_SECRET bearer token", async () => {
    process.env.INTERNAL_API_SECRET = "super-secret-key-123";
    mockGetUserIdFromRequest.mockResolvedValue(null); // No user session

    const req = makeRequest(
      { agentSlug: "leonardo-da-vinci" },
      { authorization: "Bearer super-secret-key-123" },
    );
    const res = await POST(req, {
      params: Promise.resolve({ recipeId: RECIPE_ID }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it("3. Enforces actor rate limit with 429 and Retry-After header", async () => {
    mockRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetMs: 45000,
    });

    const req = makeRequest({ agentSlug: "leonardo-da-vinci" });
    const res = await POST(req, {
      params: Promise.resolve({ recipeId: RECIPE_ID }),
    });

    expect(res.status).toBe(429);
    expect(res.headers.get("retry-after")).toBe("45");
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.message).toMatch(/rate limit/i);
    expect(mockChatWithAgent).not.toHaveBeenCalled();
  });

  it("4. Rejects unavailable recipe references with 404 before inference or publication", async () => {
    mockExecuteQuery.mockImplementation((sql: string) => {
      if (sql.includes("FROM recipes")) {
        return Promise.resolve({ rows: [] }); // Recipe not found
      }
      return Promise.resolve({ rows: [] });
    });

    const req = makeRequest({ agentSlug: "leonardo-da-vinci" });
    const res = await POST(req, {
      params: Promise.resolve({ recipeId: "missing-recipe-id" }),
    });

    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.message).toMatch(/not found/i);
    // Did NOT run inference or publish
    expect(mockChatWithAgent).not.toHaveBeenCalled();
    expect(mockCreateEvent).not.toHaveBeenCalled();
  });

  it("5. Rejects unavailable agent references with 404", async () => {
    mockExecuteQuery.mockImplementation((sql: string) => {
      if (sql.includes("FROM recipes")) {
        return Promise.resolve({
          rows: [{ id: RECIPE_ID, name: "Roasted Squash", cuisine: "Tuscan" }],
        });
      }
      if (sql.includes("FROM users u")) {
        return Promise.resolve({ rows: [] }); // Agent not found
      }
      return Promise.resolve({ rows: [] });
    });

    const req = makeRequest({ agentSlug: "unknown-agent-slug" });
    const res = await POST(req, {
      params: Promise.resolve({ recipeId: RECIPE_ID }),
    });

    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(mockChatWithAgent).not.toHaveBeenCalled();
    expect(mockCreateEvent).not.toHaveBeenCalled();
  });

  it("6. Eliminates invented 5-star ratings and made_it claims from route & feed event payload", async () => {
    const req = makeRequest({ agentSlug: "leonardo-da-vinci" });
    const res = await POST(req, {
      params: Promise.resolve({ recipeId: RECIPE_ID }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();

    // Route response must not claim a 5-star rating
    expect(data.critique).toBeDefined();
    expect(data.critique.rating).toBeUndefined();
    expect(data.review?.rating).toBeUndefined();

    // Feed event payload must not claim rating: 5 or madeIt: true
    expect(mockCreateEvent).toHaveBeenCalledTimes(1);
    const [, eventType, metadata] = mockCreateEvent.mock.calls[0];
    expect(eventType).toBe("recipe_review");
    expect(metadata.rating).toBeUndefined();
    expect(metadata.madeIt).toBeUndefined();
    expect(metadata.made_it).toBeUndefined();
    expect(metadata.recipeId).toBe(RECIPE_ID);
    expect(metadata.contentState).toBe("live");
  });

  it("7. Classifies and returns live contentState when gateway inference succeeds", async () => {
    const req = makeRequest({ agentSlug: "leonardo-da-vinci" });
    const res = await POST(req, {
      params: Promise.resolve({ recipeId: RECIPE_ID }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.critique.contentState).toBe("live");
    expect(data.critique.published).toBe(true);
    expect(data.critique.tip).toContain("mathematical harmony");
  });

  it("8. Classifies gateway-degraded state and logs error when gateway returns degraded status", async () => {
    mockChatWithAgent.mockResolvedValue({
      status: "degraded",
      content:
        "As Leonardo da Vinci (exalted dignity, 95% potency), I perceive celestial currents aligning with this dish. In this sacred space, let us transmute these culinary vectors.",
    });

    const req = makeRequest({ agentSlug: "leonardo-da-vinci" });
    const res = await POST(req, {
      params: Promise.resolve({ recipeId: RECIPE_ID }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.critique.contentState).toBe("gateway-degraded");
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining("Gateway chat returned degraded state"),
    );
  });

  it("9. Falls back to curated lore state and logs error when gateway chat fails/throws", async () => {
    mockChatWithAgent.mockRejectedValue(
      new Error("FastAPI connection timeout"),
    );

    const req = makeRequest({ agentSlug: "leonardo-da-vinci" });
    const res = await POST(req, {
      params: Promise.resolve({ recipeId: RECIPE_ID }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.critique.contentState).toBe("curated");
    // Leonardo's curated lore
    expect(data.critique.tip).toContain(
      "The body should never be a tomb for other living creatures",
    );
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining("Gateway chat failed"),
      expect.any(Error),
    );
  });

  it("10. Separates generation from publication: returns generated content with published=false if createEvent fails", async () => {
    mockCreateEvent.mockResolvedValue(false); // Persistence returned false

    const req = makeRequest({ agentSlug: "leonardo-da-vinci" });
    const res = await POST(req, {
      params: Promise.resolve({ recipeId: RECIPE_ID }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.critique.tip).toBeTruthy();
    expect(data.critique.published).toBe(false);
    expect(data.critique.persistedAt).toBeUndefined();
    expect(data.review.postedAt).toBeUndefined();
  });

  it("11. Separates generation from publication: returns published=false if createEvent throws", async () => {
    mockCreateEvent.mockRejectedValue(
      new Error("Database connection pool timeout"),
    );

    const req = makeRequest({ agentSlug: "leonardo-da-vinci" });
    const res = await POST(req, {
      params: Promise.resolve({ recipeId: RECIPE_ID }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.critique.tip).toBeTruthy();
    expect(data.critique.published).toBe(false);
    expect(data.critique.persistedAt).toBeUndefined();
    expect(data.review.postedAt).toBeUndefined();
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining("Failed to persist critique"),
      expect.any(Error),
    );
  });

  it("rejects malformed JSON before recipe lookup, inference or publication", async () => {
    const req = new NextRequest(
      `https://example.test/api/recipes/${RECIPE_ID}/critique`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{broken",
      },
    );
    const res = await POST(req, {
      params: Promise.resolve({ recipeId: RECIPE_ID }),
    });
    expect(res.status).toBe(400);
    expect(mockExecuteQuery).not.toHaveBeenCalled();
    expect(mockChatWithAgent).not.toHaveBeenCalled();
    expect(mockCreateEvent).not.toHaveBeenCalled();
  });

  it("uses the catalog recipe and authenticated rate-limit actor instead of body-supplied claims", async () => {
    const req = makeRequest({
      agentSlug: "leonardo-da-vinci",
      recipeName: "Spoofed Dish",
      userId: "spoofed-user",
    });
    const res = await POST(req, {
      params: Promise.resolve({ recipeId: RECIPE_ID }),
    });
    expect(res.status).toBe(200);
    expect(mockRateLimit).toHaveBeenCalledWith(
      req,
      expect.objectContaining({ identifier: "user-123", max: 10 }),
    );
    expect(mockChatWithAgent).toHaveBeenCalledWith(
      expect.objectContaining({
        userMessage: expect.stringContaining("Roasted Winter Squash Bowl"),
      }),
    );
    expect(mockCreateEvent).toHaveBeenCalledWith(
      AGENT_ID,
      "recipe_review",
      expect.objectContaining({
        recipeId: RECIPE_ID,
        recipeName: "Roasted Winter Squash Bowl",
      }),
      false,
      { share: true, explicit: true },
    );
  });
  it.each([false, undefined])("does not label unconfirmed provider inference as live (%s)", async (aiGenerated) => {
    mockChatWithAgent.mockResolvedValue({status: "live", providerAgentId: "leonardo-da-vinci", metadata: {aiGenerated}, content: "A provider fallback reflection long enough to be shown."});
    const response = await POST(makeRequest({agentSlug: "leonardo-da-vinci"}), {params: Promise.resolve({recipeId: RECIPE_ID})});
    expect((await response.json()).critique.contentState).toBe("gateway-degraded");
  });
  it("uses curated lore when the provider did not confirm the requested actor", async () => {
    mockChatWithAgent.mockResolvedValue({status: "live", providerAgentId: "socrates", metadata: {aiGenerated: true}, content: "A response from another agent should not be attributed to Leonardo."});
    const response = await POST(makeRequest({agentSlug: "leonardo-da-vinci"}), {params: Promise.resolve({recipeId: RECIPE_ID})});
    const body = await response.json();
    expect(body.critique.contentState).toBe("curated");
    expect(body.critique.tip).not.toContain("another agent");
  });

});
