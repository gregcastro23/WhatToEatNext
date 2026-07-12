/**
 * Tests for PUT /api/user/dining-groups/[groupId] — the EDIT path of the
 * dual-store member validation fix. Groups created by save-group reference
 * manual_companion_charts ids, so PUT must accept ids from BOTH stores
 * (legacy profile JSONB groupMembers + the modern table) or those groups are
 * uneditable.
 */

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({
      status: init?.status ?? 200,
      json: async () => body,
    })),
  },
}));

jest.mock("@/lib/auth/validateRequest", () => ({
  getDatabaseUserFromRequest: jest.fn(),
}));

jest.mock("@/services/userDatabaseService", () => ({
  userDatabase: {
    updateUserProfile: jest.fn(() => Promise.resolve({})),
  },
}));

jest.mock("@/services/commensalDatabaseService", () => ({
  commensalDatabase: {
    getManualCompanionsForUser: jest.fn(() => Promise.resolve([])),
  },
}));

jest.mock("@/lib/logger", () => ({
  _logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

import { getDatabaseUserFromRequest } from "@/lib/auth/validateRequest";
import { commensalDatabase } from "@/services/commensalDatabaseService";
import { userDatabase } from "@/services/userDatabaseService";
import { PUT } from "../route";

const USER_ID = "user-1";
const GROUP_ID = "group-1";

function makeRequest(body: unknown): any {
  return {
    url: `http://localhost/api/user/dining-groups/${GROUP_ID}`,
    method: "PUT",
    json: async () => body,
  };
}

const routeParams = { params: Promise.resolve({ groupId: GROUP_ID }) };

beforeEach(() => {
  jest.clearAllMocks();
  (getDatabaseUserFromRequest as jest.Mock).mockResolvedValue({
    id: USER_ID,
    profile: {
      groupMembers: [{ id: "legacy-1", name: "Legacy Friend" }],
      diningGroups: [
        {
          id: GROUP_ID,
          name: "Feast",
          memberIds: ["legacy-1"],
          createdAt: "2026-07-01T00:00:00Z",
          updatedAt: "2026-07-01T00:00:00Z",
        },
      ],
    },
  });
  (userDatabase.updateUserProfile as jest.Mock).mockResolvedValue({});
});

describe("PUT /api/user/dining-groups/[groupId]", () => {
  it("accepts a memberId that exists ONLY in manual_companion_charts (save-group edit path)", async () => {
    (commensalDatabase.getManualCompanionsForUser as jest.Mock).mockResolvedValue([
      { id: "table-1", name: "Table-Only Friend" },
    ]);

    const res = await PUT(
      makeRequest({ memberIds: ["legacy-1", "table-1"] }),
      routeParams,
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.diningGroup.memberIds).toEqual(["legacy-1", "table-1"]);
    expect(userDatabase.updateUserProfile).toHaveBeenCalledWith(USER_ID, {
      diningGroups: [
        expect.objectContaining({
          id: GROUP_ID,
          memberIds: ["legacy-1", "table-1"],
        }),
      ],
    });
  });

  it("still rejects ids unknown to BOTH stores", async () => {
    (commensalDatabase.getManualCompanionsForUser as jest.Mock).mockResolvedValue([
      { id: "table-1", name: "Table-Only Friend" },
    ]);

    const res = await PUT(makeRequest({ memberIds: ["ghost-9"] }), routeParams);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toMatch(/ghost-9/);
    expect(userDatabase.updateUserProfile).not.toHaveBeenCalled();
  });

  it("renames without touching members (no memberIds in body)", async () => {
    const res = await PUT(makeRequest({ name: "New Name" }), routeParams);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.diningGroup.name).toBe("New Name");
    // No member validation needed — the table lookup is skipped entirely.
    expect(commensalDatabase.getManualCompanionsForUser).not.toHaveBeenCalled();
  });
});
