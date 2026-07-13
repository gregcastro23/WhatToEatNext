/**
 * Tests for POST /api/user/dining-groups — member validation must accept ids
 * from BOTH companion stores: legacy profile JSONB (groupMembers) and the
 * modern manual_companion_charts table (written by save-group), otherwise
 * groups created via save-group are uneditable.
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
import { POST } from "../route";

const USER_ID = "user-1";

function makeRequest(body: unknown): any {
  return {
    url: "http://localhost/api/user/dining-groups",
    method: "POST",
    json: async () => body,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  (getDatabaseUserFromRequest as jest.Mock).mockResolvedValue({
    id: USER_ID,
    profile: {
      groupMembers: [{ id: "legacy-1", name: "Legacy Friend" }],
      diningGroups: [],
    },
  });
  (userDatabase.updateUserProfile as jest.Mock).mockResolvedValue({});
});

describe("POST /api/user/dining-groups", () => {
  it("accepts a memberId that exists ONLY in manual_companion_charts", async () => {
    (commensalDatabase.getManualCompanionsForUser as jest.Mock).mockResolvedValue([
      { id: "table-1", name: "Table-Only Friend" },
    ]);

    const res = await POST(
      makeRequest({ name: "Dinner Club", memberIds: ["table-1"] }),
    );
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.diningGroup.memberIds).toEqual(["table-1"]);
    expect(userDatabase.updateUserProfile).toHaveBeenCalledWith(USER_ID, {
      diningGroups: [expect.objectContaining({ memberIds: ["table-1"] })],
    });
  });

  it("accepts a mixed group spanning both stores", async () => {
    (commensalDatabase.getManualCompanionsForUser as jest.Mock).mockResolvedValue([
      { id: "table-1", name: "Table-Only Friend" },
    ]);

    const res = await POST(
      makeRequest({ name: "Mixed", memberIds: ["legacy-1", "table-1"] }),
    );

    expect(res.status).toBe(201);
  });

  it("still rejects ids unknown to BOTH stores", async () => {
    (commensalDatabase.getManualCompanionsForUser as jest.Mock).mockResolvedValue([
      { id: "table-1", name: "Table-Only Friend" },
    ]);

    const res = await POST(
      makeRequest({ name: "Bad", memberIds: ["ghost-9"] }),
    );
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toMatch(/ghost-9/);
    expect(userDatabase.updateUserProfile).not.toHaveBeenCalled();
  });
});
