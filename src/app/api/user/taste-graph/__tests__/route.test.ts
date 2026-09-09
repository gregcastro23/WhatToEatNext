/**
 * Route handler tests for /api/user/taste-graph (GET, POST).
 *
 * @file src/app/api/user/taste-graph/__tests__/route.test.ts
 */

jest.mock("@/lib/auth/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/services/userInteractionsService", () => ({
  fetchUserInteractions: jest.fn(),
  computeTasteGraph: jest.fn(),
  recordInteraction: jest.fn(),
}));

import { GET, POST } from "../route";
import { auth } from "@/lib/auth/auth";
import {
  fetchUserInteractions,
  computeTasteGraph,
  recordInteraction,
} from "@/services/userInteractionsService";
import type { TasteGraph } from "@/services/userInteractionsService";

const mockedAuth = jest.mocked(auth);
const mockedFetch = jest.mocked(fetchUserInteractions);
const mockedCompute = jest.mocked(computeTasteGraph);
const mockedRecord = jest.mocked(recordInteraction);

const USER_ID = "99999999-9999-9999-9999-999999999999";

function makeTasteGraph(overrides: Partial<TasteGraph> = {}): TasteGraph {
  return {
    cuisines: [],
    cookingMethods: [],
    favoriteIngredients: [],
    dislikedIngredients: [],
    elementalAffinities: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    planetaryPreferences: [],
    mealTimePatterns: [],
    complexityPreference: "moderate",
    confidence: 0.8,
    totalInteractions: 10,
    ...overrides,
  };
}

function makeRequest(json?: unknown): Request {
  return new Request("http://localhost:3000/api/user/taste-graph", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: json !== undefined ? JSON.stringify(json) : undefined,
  });
}

beforeEach(() => {
  mockedAuth.mockReset();
  mockedFetch.mockReset();
  mockedCompute.mockReset();
  mockedRecord.mockReset();
});

describe("GET /api/user/taste-graph", () => {
  it("401s when unauthenticated", async () => {
    mockedAuth.mockResolvedValueOnce(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns user interactions and taste graph", async () => {
    mockedAuth.mockResolvedValueOnce({ user: { id: USER_ID } });
    mockedFetch.mockResolvedValueOnce([]);
    mockedCompute.mockResolvedValueOnce(makeTasteGraph({ confidence: 0.8 }));

    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.interactions).toEqual([]);
    expect(data.tasteGraph.confidence).toBe(0.8);
  });
});

describe("POST /api/user/taste-graph", () => {
  it("401s when unauthenticated", async () => {
    mockedAuth.mockResolvedValueOnce(null);
    const res = await POST(makeRequest({ type: "recipe_view" }));
    expect(res.status).toBe(401);
  });

  it("400s on invalid JSON body", async () => {
    mockedAuth.mockResolvedValueOnce({ user: { id: USER_ID } });
    const res = await POST(
      new Request("http://localhost:3000/api/user/taste-graph", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "not json",
      }),
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid JSON body");
  });

  it("400s on invalid interaction type", async () => {
    mockedAuth.mockResolvedValueOnce({ user: { id: USER_ID } });
    const res = await POST(makeRequest({ type: "invalid_type" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid interaction type");
  });

  it("records interaction successfully", async () => {
    mockedAuth.mockResolvedValueOnce({ user: { id: USER_ID } });
    mockedRecord.mockResolvedValueOnce("event-1");

    const res = await POST(
      makeRequest({
        type: "recipe_view",
        payload: { cuisine: "Italian" },
        weight: 1.5,
      }),
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(mockedRecord).toHaveBeenCalledWith({
      userId: USER_ID,
      type: "recipe_view",
      payload: { cuisine: "Italian" },
      context: {},
      weight: 1.5,
    });
  });
});
