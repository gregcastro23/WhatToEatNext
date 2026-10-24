/**
 * @jest-environment node
 *
 * Tests for GET /api/feed/historical-agents:
 * - Combines getHistoricalAgentEvents, getHistoricalAgentRecipes, and getPlanetaryResonanceFeed
 *   when PA_HISTORICAL_FEED_URL is unset.
 */

const mockGetHistoricalAgentEvents = jest.fn();
const mockGetHistoricalAgentRecipes = jest.fn();
const mockGetPlanetaryResonanceFeed = jest.fn();

jest.mock("@/services/historicalAgentFeedService", () => ({
  getHistoricalAgentEvents: (...args: unknown[]): unknown =>
    mockGetHistoricalAgentEvents(...args),
  getHistoricalAgentRecipes: (...args: unknown[]): unknown =>
    mockGetHistoricalAgentRecipes(...args),
}));

jest.mock("@/services/planetaryResonanceService", () => ({
  getPlanetaryResonanceFeed: (...args: unknown[]): unknown =>
    mockGetPlanetaryResonanceFeed(...args),
}));

import { GET } from "../route";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

describe("GET /api/feed/historical-agents", () => {
  const origProducerUrl = process.env.PA_HISTORICAL_FEED_URL;

  beforeEach(() => {
    delete process.env.PA_HISTORICAL_FEED_URL;
    mockGetHistoricalAgentEvents.mockReset();
    mockGetHistoricalAgentRecipes.mockReset();
    mockGetPlanetaryResonanceFeed.mockReset();
  });

  afterAll(() => {
    if (origProducerUrl === undefined) {
      delete process.env.PA_HISTORICAL_FEED_URL;
    } else {
      process.env.PA_HISTORICAL_FEED_URL = origProducerUrl;
    }
  });

  it("merges narrated historical agent events, recipes, and planetary resonance when PA_HISTORICAL_FEED_URL is unset", async () => {
    mockGetHistoricalAgentEvents.mockResolvedValueOnce([
      {
        id: "evt-review-1",
        type: "agent_event",
        agent: {
          id: "uid-leo",
          name: "Leonardo da Vinci",
          kind: "historical",
          hasBirthchart: true,
          slug: "leonardo-da-vinci",
        },
        action: 'critiqued PAN-FRIED MILLET CROQUETTES and shared an alchemical tip.',
        icon: "📜",
        href: "/recipes/bca4f37d-6604-4d97-ac56-8bc3e837a416",
        element: "Fire",
        createdAt: "2026-10-10T04:43:42.947Z",
      },
    ]);

    mockGetHistoricalAgentRecipes.mockResolvedValueOnce([
      {
        id: "recipe-uid-cleo-1",
        type: "recipe_post",
        agent: {
          id: "uid-cleo",
          name: "Cleopatra VII",
          kind: "historical",
          hasBirthchart: true,
          slug: "cleopatra",
        },
        recipe: { name: "Poached Fig in Broth" },
        element: "Water",
        createdAt: "2026-10-10T04:40:00.000Z",
      },
    ]);

    mockGetPlanetaryResonanceFeed.mockReturnValueOnce([
      {
        id: "res-1",
        type: "planetary_resonance",
        planet: "Sun",
        element: "Fire",
        domain: "roasted fare",
        action: "kindles a golden roast.",
        icon: "☉",
        agentName: "Sun Agent",
        createdAt: "2026-10-10T04:45:00.000Z",
      },
    ]);

    const req = new Request("http://localhost/api/feed/historical-agents?limit=25");
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(mockGetHistoricalAgentEvents).toHaveBeenCalledWith(25);
    expect(mockGetHistoricalAgentRecipes).toHaveBeenCalledWith(8);
    expect(mockGetPlanetaryResonanceFeed).toHaveBeenCalledTimes(1);

    const body: unknown = await res.json();
    expect(isRecord(body)).toBe(true);
    if (isRecord(body)) {
      expect(body.success).toBe(true);
      expect(body.source).toBe("internal");
      expect(Array.isArray(body.items)).toBe(true);
      if (Array.isArray(body.items)) {
        expect(body.items).toHaveLength(3);
        const ids = body.items.map((item: unknown) => (isRecord(item) ? item.id : null));
        expect(ids).toEqual(["res-1", "evt-review-1", "recipe-uid-cleo-1"]);
      }
    }
  });
});
