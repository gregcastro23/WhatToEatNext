/**
 * @jest-environment node
 *
 * Tests for commensalDatabaseService — the commensal write/read path.
 *
 * Why this exists: the matching engine shipped broken because
 * getUserElementalProfile queried saved_charts columns that do not exist in
 * prod AND kept its fallback inside the same try/catch, so the first throw
 * silenced everything and every user resolved to null. These tests pin the
 * sequential fallback chain (each step isolated) and the reciprocal-request
 * auto-accept + block semantics.
 */

// Stable delegates: jest `resetModules` re-runs mock factories per test, so
// factories forward to these single instances to keep assertions valid.
const mockExecuteQuery = jest.fn();
const mockWithTransaction = jest.fn();
const mockCreateNotification = jest.fn();

jest.mock("@/lib/database", () => ({
  executeQuery: (...args: unknown[]) => mockExecuteQuery(...args),
  withTransaction: (...args: unknown[]) => mockWithTransaction(...args),
}));

jest.mock("@/services/notificationDatabaseService", () => ({
  notificationDatabase: {
    createNotification: (...args: unknown[]) => mockCreateNotification(...args),
  },
}));

jest.mock("@/lib/logger", () => ({
  _logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

// The service only talks to the DB when DATABASE_URL is set server-side.
process.env.DATABASE_URL = "postgres://test:test@localhost:5432/test";

import { commensalDatabase } from "@/services/commensalDatabaseService";

const ME = "11111111-1111-1111-1111-111111111111";
const TARGET = "22222222-2222-2222-2222-222222222222";

const BALANCE = { Fire: 0.4, Water: 0.2, Earth: 0.2, Air: 0.2 };
const OTHER_BALANCE = { Fire: 0.1, Water: 0.6, Earth: 0.2, Air: 0.1 };

/** Let fire-and-forget async chains (notifications) settle. */
const flushAsync = () => new Promise((resolve) => setTimeout(resolve, 20));

const sqlCalls = () => mockExecuteQuery.mock.calls.map(([q]) => String(q));

beforeEach(() => {
  mockExecuteQuery.mockReset();
  mockWithTransaction.mockReset();
  mockCreateNotification.mockReset();
  mockCreateNotification.mockResolvedValue(undefined);
});

describe("getUserElementalProfile — sequential fallback chain", () => {
  it("returns the balance from user_profiles.natal_chart (canonical hit)", async () => {
    mockExecuteQuery.mockImplementation(async (sql: string) => {
      if (sql.includes("FROM user_profiles")) {
        return {
          rows: [{ natal_chart: { elementalBalance: BALANCE }, birth_data: {} }],
          rowCount: 1,
        };
      }
      throw new Error(`unexpected query: ${sql}`);
    });

    const profile = await commensalDatabase.getUserElementalProfile(ME);

    expect(profile).toEqual(BALANCE);
    // Canonical source answered — the JSONB fallback must not be consulted.
    expect(sqlCalls().some((q) => q.includes("FROM users"))).toBe(false);
    // The prod saved_charts table has no natal_chart column — never read here.
    expect(sqlCalls().some((q) => q.includes("saved_charts"))).toBe(false);
  });

  it("falls back to users.profile JSONB when user_profiles has no usable chart", async () => {
    mockExecuteQuery.mockImplementation(async (sql: string) => {
      if (sql.includes("FROM user_profiles")) {
        return { rows: [], rowCount: 0 };
      }
      if (sql.includes("FROM users")) {
        return {
          rows: [{ profile: { natalChart: { elementalBalance: OTHER_BALANCE } } }],
          rowCount: 1,
        };
      }
      throw new Error(`unexpected query: ${sql}`);
    });

    const profile = await commensalDatabase.getUserElementalProfile(ME);

    expect(profile).toEqual(OTHER_BALANCE);
  });

  it("returns null when both sources are empty", async () => {
    mockExecuteQuery.mockResolvedValue({ rows: [], rowCount: 0 });

    const profile = await commensalDatabase.getUserElementalProfile(ME);

    expect(profile).toBeNull();
  });

  it("a THROW in the user_profiles read does NOT prevent the JSONB fallback (regression)", async () => {
    mockExecuteQuery.mockImplementation(async (sql: string) => {
      if (sql.includes("FROM user_profiles")) {
        // Simulates prod schema drift: column/table mismatch throws.
        throw new Error('column "natal_chart" does not exist');
      }
      if (sql.includes("FROM users")) {
        return {
          rows: [{ profile: { natalChart: { elementalBalance: BALANCE } } }],
          rowCount: 1,
        };
      }
      throw new Error(`unexpected query: ${sql}`);
    });

    const profile = await commensalDatabase.getUserElementalProfile(ME);

    expect(profile).toEqual(BALANCE);
  });
});

describe("createCommensalRequest — reciprocal-request handling", () => {
  const commensalshipJoinRow = (status: string) => ({
    id: "c-rev-1",
    requester_id: TARGET,
    addressee_id: ME,
    status,
    created_at: "2026-07-01T00:00:00Z",
    updated_at: "2026-07-01T00:00:00Z",
    requester_name: "Target",
    requester_email: "target@example.com",
    addressee_name: "Me",
    addressee_email: "me@example.com",
  });

  it("auto-accepts an existing PENDING reverse-direction row instead of inserting", async () => {
    const updates: string[] = [];
    mockExecuteQuery.mockImplementation(async (sql: string, params: unknown[]) => {
      if (sql.includes("SELECT id, status, requester_id FROM commensalships")) {
        return {
          rows: [{ id: "c-rev-1", status: "pending", requester_id: TARGET }],
          rowCount: 1,
        };
      }
      if (sql.includes("UPDATE commensalships")) {
        updates.push(String(params[0]));
        return { rows: [], rowCount: 1 };
      }
      if (sql.includes("FROM commensalships c")) {
        return { rows: [commensalshipJoinRow("accepted")], rowCount: 1 };
      }
      if (sql.includes("FROM users")) {
        return { rows: [{ name: "Me" }], rowCount: 1 };
      }
      throw new Error(`unexpected query: ${sql}`);
    });

    // TARGET already requested ME; now ME requests TARGET → mutual interest.
    const result = await commensalDatabase.createCommensalRequest(ME, TARGET);

    expect(result).not.toBeNull();
    expect(result!.status).toBe("accepted");
    expect(result!.id).toBe("c-rev-1");
    // The existing row was accepted — no duplicate reciprocal insert.
    expect(updates).toEqual(["c-rev-1"]);
    expect(sqlCalls().some((q) => q.includes("INSERT INTO commensalships"))).toBe(
      false,
    );

    // The ORIGINAL requester (the target of this call) gets the accepted ping.
    await flushAsync();
    expect(mockCreateNotification).toHaveBeenCalledWith(
      TARGET,
      "commensal_accepted",
      expect.any(String),
      expect.any(String),
      expect.objectContaining({
        relatedUserId: ME,
        metadata: { commensalshipId: "c-rev-1" },
      }),
    );
  });

  it("returns null (no insert, no accept) when the pair is blocked", async () => {
    mockExecuteQuery.mockImplementation(async (sql: string) => {
      if (sql.includes("SELECT id, status, requester_id FROM commensalships")) {
        return {
          rows: [{ id: "c-blk-1", status: "blocked", requester_id: TARGET }],
          rowCount: 1,
        };
      }
      throw new Error(`unexpected query: ${sql}`);
    });

    const result = await commensalDatabase.createCommensalRequest(ME, TARGET);

    expect(result).toBeNull();
    expect(sqlCalls().some((q) => q.includes("INSERT INTO"))).toBe(false);
    expect(sqlCalls().some((q) => q.includes("UPDATE"))).toBe(false);
    await flushAsync();
    expect(mockCreateNotification).not.toHaveBeenCalled();
  });

  it("resolves against the winner on a unique-violation race (23505) instead of erroring", async () => {
    let selectCount = 0;
    mockExecuteQuery.mockImplementation(async (sql: string) => {
      if (sql.includes("SELECT id, status, requester_id FROM commensalships")) {
        selectCount += 1;
        // First look: nothing there. After the racing insert fails: the
        // concurrent reverse row exists and is pending → auto-accept path.
        if (selectCount === 1) return { rows: [], rowCount: 0 };
        return {
          rows: [{ id: "c-rev-1", status: "pending", requester_id: TARGET }],
          rowCount: 1,
        };
      }
      if (sql.includes("INSERT INTO commensalships")) {
        const err = new Error("duplicate key value violates unique constraint") as Error & {
          code?: string;
        };
        err.code = "23505";
        throw err;
      }
      if (sql.includes("UPDATE commensalships")) {
        return { rows: [], rowCount: 1 };
      }
      if (sql.includes("FROM commensalships c")) {
        return { rows: [commensalshipJoinRow("accepted")], rowCount: 1 };
      }
      if (sql.includes("FROM users")) {
        return { rows: [{ name: "Me" }], rowCount: 1 };
      }
      throw new Error(`unexpected query: ${sql}`);
    });

    const result = await commensalDatabase.createCommensalRequest(ME, TARGET);

    expect(result).not.toBeNull();
    expect(result!.status).toBe("accepted");
  });
});

describe("blocked rows stay out of the linked-commensal listing", () => {
  it("getLinkedCommensalsForUser only selects status = 'accepted' rows", async () => {
    mockExecuteQuery.mockResolvedValue({ rows: [], rowCount: 0 });

    await commensalDatabase.getLinkedCommensalsForUser(ME);

    expect(mockExecuteQuery).toHaveBeenCalledTimes(1);
    const sql = String(mockExecuteQuery.mock.calls[0][0]);
    expect(sql).toContain("c.status = 'accepted'");
  });
});
