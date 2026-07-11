/**
 * @jest-environment node
 *
 * Tests for POST /api/commensal/save-group — transactional write path.
 *
 * The companion inserts and the dining-group registration must commit or roll
 * back as one unit: a failed group registration used to strand orphaned
 * companion rows. Uses the REAL commensalDatabaseService against a mocked
 * transaction client so the BEGIN/COMMIT/ROLLBACK semantics are exercised.
 */

// Stable delegates: jest `resetModules` re-runs mock factories per test, so
// factories forward to these single instances.
const mockExecuteQuery = jest.fn();
const mockClientQuery = jest.fn();
const mockTx = { committed: 0, rolledBack: 0 };
const mockWithTransaction = jest.fn(
  async (operation: (client: { query: typeof mockClientQuery }) => Promise<unknown>) => {
    // Mirrors src/lib/database/connection.ts withTransaction: run the
    // operation on one client; COMMIT on success, ROLLBACK + rethrow on error.
    try {
      const result = await operation({ query: mockClientQuery });
      mockTx.committed += 1;
      return result;
    } catch (error) {
      mockTx.rolledBack += 1;
      throw error;
    }
  },
);

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({
      status: init?.status ?? 200,
      json: async () => body,
    })),
  },
}));

jest.mock("@/lib/database", () => ({
  executeQuery: (...args: unknown[]) => mockExecuteQuery(...args),
  withTransaction: (...args: unknown[]) => (mockWithTransaction as any)(...args),
}));

jest.mock("@/lib/auth/validateRequest", () => ({
  getDatabaseUserFromRequest: jest.fn(),
}));

jest.mock("@/services/userDatabaseService", () => ({
  userDatabase: {
    updateUserProfile: jest.fn(),
  },
}));

jest.mock("@/lib/logger", () => ({
  _logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

// The commensal service only talks to the DB when DATABASE_URL is set.
process.env.DATABASE_URL = "postgres://test:test@localhost:5432/test";

import { getDatabaseUserFromRequest } from "@/lib/auth/validateRequest";
import { userDatabase } from "@/services/userDatabaseService";
import { POST } from "../route";

const USER = { id: "11111111-1111-1111-1111-111111111111", profile: { diningGroups: [] } };

function makeRequest(body: unknown): any {
  return {
    url: "http://localhost/api/commensal/save-group",
    method: "POST",
    json: async () => body,
  };
}

function guest(name: string) {
  return {
    name,
    relationship: "friend",
    birthData: { dateTime: "1990-01-01T12:00:00Z", latitude: 40.7, longitude: -74.0 },
    natalChart: {
      dominantElement: "Fire",
      elementalBalance: { Fire: 0.4, Water: 0.2, Earth: 0.2, Air: 0.2 },
    },
  };
}

const companionInsertCalls = () =>
  mockClientQuery.mock.calls.filter(([sql]) =>
    String(sql).includes("INSERT INTO manual_companion_charts"),
  );

beforeEach(() => {
  mockExecuteQuery.mockReset();
  mockClientQuery.mockReset();
  mockWithTransaction.mockClear();
  mockTx.committed = 0;
  mockTx.rolledBack = 0;
  mockClientQuery.mockResolvedValue({ rows: [], rowCount: 1 });
  (getDatabaseUserFromRequest as jest.Mock).mockReset();
  (getDatabaseUserFromRequest as jest.Mock).mockResolvedValue(USER);
  (userDatabase.updateUserProfile as jest.Mock).mockReset();
});

describe("POST /api/commensal/save-group", () => {
  it("rolls back the companion inserts when the dining-group registration fails", async () => {
    (userDatabase.updateUserProfile as jest.Mock).mockRejectedValue(
      new Error("profile write failed"),
    );

    const res = await POST(
      makeRequest({ groupName: "Feast", guests: [guest("Alice"), guest("Bob")] }),
    );
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.message).toMatch(/Nothing was saved/);

    // Both companions were inserted inside the transaction...
    expect(companionInsertCalls()).toHaveLength(2);
    // ...and the registration failure rolled the whole thing back.
    expect(mockTx.rolledBack).toBe(1);
    expect(mockTx.committed).toBe(0);
  });

  it("commits companions + group as one unit on success", async () => {
    (userDatabase.updateUserProfile as jest.Mock).mockResolvedValue({});

    const res = await POST(
      makeRequest({ groupName: "Feast", guests: [guest("Alice"), guest("Bob")] }),
    );
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.diningGroup.name).toBe("Feast");
    expect(data.diningGroup.memberIds).toHaveLength(2);
    expect(data.memberIds).toEqual(data.diningGroup.memberIds);

    expect(companionInsertCalls()).toHaveLength(2);
    expect(mockTx.committed).toBe(1);
    expect(mockTx.rolledBack).toBe(0);

    // The registered group references exactly the created companion ids.
    const updateArg = (userDatabase.updateUserProfile as jest.Mock).mock
      .calls[0][1];
    expect(updateArg.diningGroups[0].memberIds).toEqual(data.memberIds);
  });

  it("rolls back everything when a companion insert itself fails midway", async () => {
    (userDatabase.updateUserProfile as jest.Mock).mockResolvedValue({});
    mockClientQuery
      .mockResolvedValueOnce({ rows: [], rowCount: 1 })
      .mockRejectedValueOnce(new Error("insert blew up"));

    const res = await POST(
      makeRequest({ groupName: "Feast", guests: [guest("Alice"), guest("Bob")] }),
    );

    expect(res.status).toBe(500);
    expect(mockTx.rolledBack).toBe(1);
    expect(mockTx.committed).toBe(0);
    // Registration never ran — the failure happened before it.
    expect(userDatabase.updateUserProfile).not.toHaveBeenCalled();
  });
});
