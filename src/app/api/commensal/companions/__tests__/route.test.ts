/**
 * Tests for /api/commensal/companions
 */

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({
      status: init?.status ?? 200,
      json: async () => body,
    })),
  },
}));

jest.mock("@/lib/database", () => ({
  executeQuery: jest.fn(),
}));

jest.mock("@/lib/planetaryAgentsClient", () => ({
  fetchAgentsForDate: jest.fn(),
}));

jest.mock("@/lib/auth/validateRequest", () => ({
  getDatabaseUserFromRequest: jest.fn(() => Promise.resolve(null)),
}));

jest.mock("@/services/commensalDatabaseService", () => ({
  commensalDatabase: {
    getManualCompanionsForUser: jest.fn(() => Promise.resolve([])),
    getLinkedCommensalsForUser: jest.fn(() => Promise.resolve([])),
  },
}));

import { executeQuery } from "@/lib/database";
import { fetchAgentsForDate } from "@/lib/planetaryAgentsClient";
import { getDatabaseUserFromRequest } from "@/lib/auth/validateRequest";
import { commensalDatabase } from "@/services/commensalDatabaseService";
import { GET } from "../route";

function makeRequest(url = "http://localhost/api/commensal/companions"): any {
  return {
    url,
    method: "GET",
  } as unknown as any;
}

const mockLocalAgents = {
  rows: [
    {
      user_id: "agent_monica_id",
      email: "monica@agents.alchm.kitchen",
      profile: {
        birthData: {
          dateTime: "2026-01-01T12:00:00Z",
          latitude: 40,
          longitude: -74,
        },
      },
      name: "Monica Constant",
      bio: "High Alchemist Monica",
      dominant_element: "Fire",
      monica_constant: "1.618033",
      birth_data: null,
      natal_chart: null,
    },
    {
      user_id: "agent_hermes_id",
      email: "hermes@agents.alchm.kitchen",
      profile: {
        birthData: {
          dateTime: "2026-02-02T12:00:00Z",
          latitude: 35,
          longitude: 25,
        },
      },
      name: "Hermes Trismegistus",
      bio: "Thoth scribe and master alchemist",
      dominant_element: "Air",
      monica_constant: null,
      birth_data: null,
      natal_chart: null,
    },
  ],
};

const mockFeedEvents = {
  rows: [
    { actor_id: "agent_monica_id", last_action_at: "2026-06-01T15:00:00Z" },
  ],
};

const mockActivations = [
  {
    agent: {
      id: "monica",
      name: "Monica Constant",
      description: "Active Monica",
    },
    strength: 0.95,
    dignity: "domicile",
    element: "Fire",
    planetaryRuler: "Mars",
  },
];

describe("GET /api/commensal/companions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (executeQuery as jest.Mock).mockImplementation((query: string) => {
      if (query.includes("feed_events")) {
        return Promise.resolve(mockFeedEvents);
      }
      return Promise.resolve(mockLocalAgents);
    });
    (fetchAgentsForDate as jest.Mock).mockResolvedValue(mockActivations);
    (
      commensalDatabase.getManualCompanionsForUser as jest.Mock
    ).mockResolvedValue([]);
    (
      commensalDatabase.getLinkedCommensalsForUser as jest.Mock
    ).mockResolvedValue([]);
  });

  it("successfully returns active agents, historical agents, and the cosmic roster", async () => {
    const res = await GET(makeRequest());
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);

    // Verify Active Agents mapping
    expect(data.activeAgents).toHaveLength(1);
    expect(data.activeAgents[0].name).toBe("Monica Constant");
    expect(data.activeAgents[0].activation.strength).toBe(0.95);
    expect(data.activeAgents[0].activation.dignity).toBe("domicile");

    // Verify Historical Agents mapping
    expect(data.historicalAgents).toHaveLength(1);
    expect(data.historicalAgents[0].name).toBe("Monica Constant");
    expect(data.historicalAgents[0].lastActionAt).toBe("2026-06-01T15:00:00Z");

    // Verify Cosmic Roster sorting & fallback values
    expect(data.cosmicRoster).toHaveLength(2);
    expect(data.cosmicRoster[0].name).toBe("Hermes Trismegistus");
    expect(data.cosmicRoster[1].name).toBe("Monica Constant");
  });

  it("degrades gracefully when Planetary Agents activations API fails", async () => {
    (fetchAgentsForDate as jest.Mock).mockRejectedValue(
      new Error("PA API Timeout"),
    );

    const res = await GET(makeRequest());
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.activeAgents).toHaveLength(0); // active is empty but the endpoint doesn't fail
    expect(data.cosmicRoster).toHaveLength(2); // still loads roster
    expect(data.degraded).toBe(true);
    expect(data.unavailableSources).toContain("planetary-activations");
  });

  it("returns usable empty categories when the database is unavailable", async () => {
    (executeQuery as jest.Mock).mockRejectedValue(
      Object.assign(new Error("connection refused"), { code: "ECONNREFUSED" }),
    );

    const res = await GET(makeRequest());
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.activeAgents).toEqual([]);
    expect(data.historicalAgents).toEqual([]);
    expect(data.cosmicRoster).toEqual([]);
    expect(data.savedCompanions).toEqual([]);
    expect(data.degraded).toBe(true);
    expect(data.unavailableSources).toEqual(
      expect.arrayContaining(["cosmic-roster", "historical-feed"]),
    );
  });

  it("returns savedCompanions when user is authenticated", async () => {
    (getDatabaseUserFromRequest as jest.Mock).mockResolvedValue({
      id: "user-123",
    });

    (
      commensalDatabase.getManualCompanionsForUser as jest.Mock
    ).mockResolvedValue([
      {
        id: "manual-001",
        name: "Saved Friend",
        relationship: "friend",
        birthData: {
          dateTime: "2026-03-03T12:00:00Z",
          latitude: 12,
          longitude: 34,
        },
        natalChart: { dominantElement: "Water" },
      },
    ]);

    const res = await GET(makeRequest());
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.savedCompanions).toHaveLength(1);
    expect(data.savedCompanions[0].name).toBe("Saved Friend");
    expect(data.savedCompanions[0].dominantElement).toBe("Water");
    expect(data.savedCompanions[0].natalChart).toEqual(
      expect.objectContaining({ dominantElement: "Water" }),
    );
  });
});
