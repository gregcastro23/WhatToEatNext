/**
 * @jest-environment node
 *
 * Tests for POST /api/commensal/save-group — transactional write path.
 *
 * The companion inserts and the dining-group profile dual-write all run on
 * ONE transaction client: a failure anywhere (companion insert OR group
 * registration) rolls the whole write back. Uses the REAL
 * commensalDatabaseService against a mocked transaction client so the
 * BEGIN/COMMIT/ROLLBACK semantics are exercised. Also covers the server-side
 * input caps (12 guests, 100-char group name) and the per-user rate limit.
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
      headers: init?.headers ?? {},
    })),
  },
}));

jest.mock("@/lib/database", () => ({
  executeQuery: (...args: unknown[]) => mockExecuteQuery(...args),
  withTransaction: (...args: unknown[]) => (mockWithTransaction as any)(...args),
}));

// Force the rate limiter onto its in-memory fallback (no Redis in tests).
jest.mock("@/lib/redis", () => ({
  getRedisClient: () => null,
}));

jest.mock("@/lib/auth/validateRequest", () => ({
  getDatabaseUserFromRequest: jest.fn(),
}));

jest.mock("@/lib/logger", () => ({
  _logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

// The commensal service only talks to the DB when DATABASE_URL is set.
process.env.DATABASE_URL = "postgres://test:test@localhost:5432/test";

import { getDatabaseUserFromRequest } from "@/lib/auth/validateRequest";
import { POST } from "../route";

// The rate limit is per-user: give each test its own user id so the in-memory
// limiter (which persists across tests in this file) never bleeds between
// unrelated tests.
let userCounter = 0;
function makeUser(id?: string) {
  return {
    id: id ?? `00000000-0000-0000-0000-${String(++userCounter).padStart(12, "0")}`,
    profile: { name: "Host", diningGroups: [], groupMembers: [] },
  };
}

function makeRequest(body: unknown): any {
  return {
    url: "http://localhost/api/commensal/save-group",
    method: "POST",
    json: async () => body,
    headers: { get: () => null },
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

const clientCalls = () => mockClientQuery.mock.calls.map(([sql]) => String(sql));
const companionInsertCalls = () =>
  clientCalls().filter((sql) => sql.includes("INSERT INTO manual_companion_charts"));

beforeEach(() => {
  mockExecuteQuery.mockReset();
  mockClientQuery.mockReset();
  mockWithTransaction.mockClear();
  mockTx.committed = 0;
  mockTx.rolledBack = 0;
  mockClientQuery.mockResolvedValue({ rows: [], rowCount: 1 });
  (getDatabaseUserFromRequest as jest.Mock).mockReset();
  (getDatabaseUserFromRequest as jest.Mock).mockResolvedValue(makeUser());
});

describe("POST /api/commensal/save-group", () => {
  it("rolls back the companion inserts when the dining-group registration fails", async () => {
    // The registration dual-write starts with the users.profile update — fail it.
    mockClientQuery.mockImplementation(async (sql: string) => {
      if (String(sql).includes("UPDATE users")) {
        throw new Error("profile write failed");
      }
      return { rows: [], rowCount: 1 };
    });

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

  it("commits companions + profile dual-write as one unit on the SAME client", async () => {
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

    // The dining-group registration is the profile dual-write, issued on the
    // transaction client (users.profile JSONB + canonical user_profiles):
    expect(clientCalls().some((sql) => sql.includes("UPDATE users"))).toBe(true);
    const upsert = mockClientQuery.mock.calls.find(([sql]) =>
      String(sql).includes("INSERT INTO user_profiles"),
    );
    expect(upsert).toBeDefined();
    // dining_groups param carries the new group with the created member ids.
    const diningGroupsJson = JSON.parse(upsert![1][5]);
    expect(diningGroupsJson).toHaveLength(1);
    expect(diningGroupsJson[0].memberIds).toEqual(data.memberIds);

    // No independently-pooled writes: everything went through the one client.
    expect(mockExecuteQuery).not.toHaveBeenCalled();
  });

  it("rolls back everything when a companion insert itself fails midway", async () => {
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
    expect(clientCalls().some((sql) => sql.includes("UPDATE users"))).toBe(false);
  });

  it("rejects more than 12 guests with a 400", async () => {
    const guests = Array.from({ length: 13 }, (_, i) => guest(`G${i}`));

    const res = await POST(makeRequest({ groupName: "Banquet", guests }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toMatch(/twelve/i);
    expect(mockWithTransaction).not.toHaveBeenCalled();
  });

  it("rejects a groupName longer than 100 characters", async () => {
    const res = await POST(
      makeRequest({ groupName: "x".repeat(101), guests: [guest("Alice")] }),
    );
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toMatch(/100/);
    expect(mockWithTransaction).not.toHaveBeenCalled();
  });

  it("returns 429 once a single user exceeds the per-minute cap", async () => {
    const heavyUser = makeUser("99999999-9999-9999-9999-999999999999");
    (getDatabaseUserFromRequest as jest.Mock).mockResolvedValue(heavyUser);
    const body = { groupName: "Feast", guests: [guest("Alice")] };

    // The per-user cap is 10/min — the first 10 pass.
    for (let i = 0; i < 10; i++) {
      const res = await POST(makeRequest(body));
      expect(res.status).toBe(201);
    }

    const res = await POST(makeRequest(body));
    const data = await res.json();

    expect(res.status).toBe(429);
    expect(data.error).toBe("rate_limit_exceeded");

    // A different user is unaffected — the limit is per-user.
    (getDatabaseUserFromRequest as jest.Mock).mockResolvedValue(makeUser());
    const other = await POST(makeRequest(body));
    expect(other.status).toBe(201);
  });
});
