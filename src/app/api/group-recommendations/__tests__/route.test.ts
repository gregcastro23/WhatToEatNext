/**
 * Tests for POST /api/group-recommendations — split-brain companion merge.
 *
 * Manual companions live in BOTH user_profiles.group_members JSONB (legacy)
 * and the manual_companion_charts table (modern). The route must merge the
 * two, so a companion saved only via the modern path still resolves.
 */

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({
      status: init?.status ?? 200,
      json: async () => body,
    })),
  },
}));

jest.mock("@/data/cuisines/index", () => ({
  CUISINES: {
    italian: {
      name: "Italian",
      elementalProperties: { Fire: 0.4, Water: 0.2, Earth: 0.2, Air: 0.2 },
    },
    japanese: {
      name: "Japanese",
      elementalProperties: { Fire: 0.1, Water: 0.5, Earth: 0.2, Air: 0.2 },
    },
  },
}));

jest.mock("@/lib/auth/validateRequest", () => ({
  getDatabaseUserFromRequest: jest.fn(),
}));

jest.mock("@/services/subscriptionService", () => ({
  subscriptionService: {
    canUseFeature: jest.fn(() => Promise.resolve({ allowed: true })),
  },
}));

jest.mock("@/services/commensalDatabaseService", () => ({
  commensalDatabase: {
    getManualCompanionsForUser: jest.fn(() => Promise.resolve([])),
    getLinkedCommensalsForUser: jest.fn(() => Promise.resolve([])),
  },
}));

jest.mock("@/lib/logger", () => ({
  _logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

import { getDatabaseUserFromRequest } from "@/lib/auth/validateRequest";
import { commensalDatabase } from "@/services/commensalDatabaseService";
import { POST } from "../route";

const USER_ID = "user-1";

function chart(balance: Record<string, number>) {
  return {
    birthData: { dateTime: "1990-01-01T12:00:00Z", latitude: 40, longitude: -74 },
    elementalBalance: balance,
    alchemicalProperties: { Spirit: 4, Essence: 7, Matter: 6, Substance: 2 },
  };
}

function makeRequest(body: unknown): any {
  return {
    url: "http://localhost/api/group-recommendations",
    method: "POST",
    json: async () => body,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  (getDatabaseUserFromRequest as jest.Mock).mockResolvedValue({
    id: USER_ID,
    profile: {
      name: "Owner",
      natalChart: undefined, // owner has no chart — only companions count
      groupMembers: [
        {
          id: "legacy-1",
          name: "Legacy Friend",
          natalChart: chart({ Fire: 0.4, Water: 0.2, Earth: 0.2, Air: 0.2 }),
        },
      ],
    },
  });
  (commensalDatabase.getManualCompanionsForUser as jest.Mock).mockResolvedValue([
    {
      id: "table-1",
      name: "Table-Only Friend",
      relationship: "friend",
      birthData: { dateTime: "1992-05-05T08:00:00Z", latitude: 41, longitude: -73 },
      natalChart: chart({ Fire: 0.1, Water: 0.6, Earth: 0.2, Air: 0.1 }),
      createdAt: "2026-07-01T00:00:00Z",
    },
  ]);
});

describe("POST /api/group-recommendations", () => {
  it("includes companions from the manual_companion_charts table (not only legacy JSONB)", async () => {
    const res = await POST(
      makeRequest({
        commensalIds: ["legacy-1", "table-1"],
        linkedUserIds: [],
        strategy: "average",
      }),
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    // Both storage locations resolved: legacy JSONB member AND table-only member.
    expect(data.memberCount).toBe(2);
    const memberNames = data.recommendations[0].memberScores.map(
      (m: { memberName: string }) => m.memberName,
    );
    expect(memberNames).toContain("Table-Only Friend");
    expect(memberNames).toContain("Legacy Friend");
    expect(commensalDatabase.getManualCompanionsForUser).toHaveBeenCalledWith(
      USER_ID,
    );
  });

  it("resolves a table-only companion even when legacy groupMembers is empty", async () => {
    (getDatabaseUserFromRequest as jest.Mock).mockResolvedValue({
      id: USER_ID,
      profile: { name: "Owner", natalChart: undefined, groupMembers: [] },
    });

    const res = await POST(
      makeRequest({ commensalIds: ["table-1"], linkedUserIds: [] }),
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.memberCount).toBe(1);
    expect(data.recommendations[0].memberScores[0].memberName).toBe(
      "Table-Only Friend",
    );
  });

  it("still serves legacy members when the table lookup fails", async () => {
    (commensalDatabase.getManualCompanionsForUser as jest.Mock).mockRejectedValue(
      new Error("relation does not exist"),
    );

    const res = await POST(
      makeRequest({ commensalIds: ["legacy-1"], linkedUserIds: [] }),
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.memberCount).toBe(1);
  });
});
