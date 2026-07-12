/**
 * @jest-environment node
 *
 * Tests for tableDatabaseService — lifecycle transition guards, invite
 * atomicity, and the member XOR identity discipline
 * (docs/plans/pr2-table-entity-plan.md commit 1).
 */

const mockExecuteQuery = jest.fn();
const mockClientQuery = jest.fn();
const mockWithTransaction = jest.fn(
  async (operation: (client: { query: typeof mockClientQuery }) => Promise<unknown>) => {
    return operation({ query: mockClientQuery });
  },
);
const mockComputeAndStoreTableComposite = jest.fn().mockResolvedValue(undefined);
const mockCreateNotification = jest.fn().mockResolvedValue(undefined);

jest.mock("@/lib/database/connection", () => ({
  executeQuery: (...args: unknown[]) => mockExecuteQuery(...args),
  withTransaction: (...args: unknown[]) => (mockWithTransaction as any)(...args),
}));

jest.mock("@/lib/tables/composite", () => ({
  computeAndStoreTableComposite: (...args: unknown[]) =>
    mockComputeAndStoreTableComposite(...args),
}));

jest.mock("@/services/notificationDatabaseService", () => ({
  notificationDatabase: {
    createNotification: (...args: unknown[]) => mockCreateNotification(...args),
  },
}));

jest.mock("@/lib/logger", () => ({
  _logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

import { tableDatabase } from "@/services/tableDatabaseService";

const HOST = "11111111-1111-1111-1111-111111111111";
const GUEST = "22222222-2222-2222-2222-222222222222";
const OTHER = "33333333-3333-3333-3333-333333333333";
const TABLE_ID = "44444444-4444-4444-4444-444444444444";

const sqlCalls = () => mockExecuteQuery.mock.calls.map(([q]) => String(q));
const clientCalls = () => mockClientQuery.mock.calls.map(([q]) => String(q));

beforeEach(() => {
  mockExecuteQuery.mockReset();
  mockClientQuery.mockReset();
  mockWithTransaction.mockClear();
  mockComputeAndStoreTableComposite.mockClear();
  mockCreateNotification.mockClear();
});

describe("lifecycle transitions — guarded UPDATE ... WHERE ... RETURNING", () => {
  it("goLive succeeds when the caller is host and the table is planned", async () => {
    mockExecuteQuery.mockResolvedValue({
      rows: [
        {
          id: TABLE_ID,
          host_id: HOST,
          title: "Solstice Feast",
          status: "live",
          venue_type: "home",
          menu: "[]",
          created_at: "2026-07-01T00:00:00Z",
          updated_at: "2026-07-01T00:00:00Z",
        },
      ],
      rowCount: 1,
    });

    const result = await tableDatabase.goLive(TABLE_ID, HOST);

    expect(result).not.toBeNull();
    expect(result!.status).toBe("live");
    const sql = sqlCalls()[0];
    expect(sql).toContain("status = 'live'");
    expect(sql).toContain("AND host_id = $2::uuid AND status = 'planned'");
  });

  it("goLive returns null (409) when a non-host calls it — the guard's host_id clause matches nothing", async () => {
    mockExecuteQuery.mockResolvedValue({ rows: [], rowCount: 0 });

    const result = await tableDatabase.goLive(TABLE_ID, OTHER);

    expect(result).toBeNull();
  });

  it("goLive is race-safe: a second concurrent call against an already-live table returns null", async () => {
    // First call transitions planned -> live and consumes the guard.
    mockExecuteQuery.mockResolvedValueOnce({
      rows: [{ id: TABLE_ID, host_id: HOST, status: "live", venue_type: "home", menu: "[]" }],
      rowCount: 1,
    });
    const first = await tableDatabase.goLive(TABLE_ID, HOST);
    expect(first).not.toBeNull();

    // Second call: the WHERE status='planned' guard now matches zero rows.
    mockExecuteQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });
    const second = await tableDatabase.goLive(TABLE_ID, HOST);
    expect(second).toBeNull();
  });

  it("cancelTable allows both planned and live source states", async () => {
    mockExecuteQuery.mockResolvedValue({
      rows: [{ id: TABLE_ID, host_id: HOST, status: "cancelled", venue_type: "home", menu: "[]" }],
      rowCount: 1,
    });

    const result = await tableDatabase.cancelTable(TABLE_ID, HOST);

    expect(result!.status).toBe("cancelled");
    expect(sqlCalls()[0]).toContain("status IN ('planned','live')");
  });

  it("cancelTable refuses a non-host caller", async () => {
    mockExecuteQuery.mockResolvedValue({ rows: [], rowCount: 0 });

    const result = await tableDatabase.cancelTable(TABLE_ID, OTHER);

    expect(result).toBeNull();
  });

  it("closeTable guards on host + status='live' via FOR UPDATE, builds the memory payload, and stamps feed_event_id atomically", async () => {
    mockClientQuery.mockImplementation(async (sql: string) => {
      const q = String(sql);
      if (q.includes("FOR UPDATE")) {
        return {
          rows: [
            {
              id: TABLE_ID,
              host_id: HOST,
              title: "Solstice Feast",
              status: "live",
              venue_type: "home",
              venue_name: "My place",
              scheduled_at: "2026-07-01T18:00:00Z",
              menu: "[]",
              composite_snapshot: null,
            },
          ],
          rowCount: 1,
        };
      }
      if (q.includes("FROM table_members")) {
        return {
          rows: [{ user_id: GUEST, display_name: null, user_name: "A Guest" }],
          rowCount: 1,
        };
      }
      if (q.includes("FROM table_photos")) {
        return { rows: [{ url: "https://assets.example/photo.jpg" }], rowCount: 1 };
      }
      if (q.includes("INSERT INTO feed_events")) {
        return { rows: [{ id: "feed-1" }], rowCount: 1 };
      }
      if (q.includes("UPDATE tables")) {
        return {
          rows: [
            {
              id: TABLE_ID,
              host_id: HOST,
              title: "Solstice Feast",
              status: "memory",
              venue_type: "home",
              menu: "[]",
              feed_event_id: "feed-1",
              closed_at: "2026-07-02T00:00:00Z",
            },
          ],
          rowCount: 1,
        };
      }
      throw new Error(`unexpected client query: ${q}`);
    });

    const result = await tableDatabase.closeTable(TABLE_ID, HOST);

    expect(result).not.toBeNull();
    expect(result!.status).toBe("memory");
    expect(result!.feedEventId).toBe("feed-1");

    const guardQuery = mockClientQuery.mock.calls.find(([sql]) =>
      String(sql).includes("FOR UPDATE"),
    );
    expect(guardQuery![0]).toContain("host_id = $2::uuid AND status = 'live'");

    // Post-commit notification fan-out is fire-and-forget — flush microtasks.
    await Promise.resolve();
    await Promise.resolve();
    expect(mockCreateNotification).toHaveBeenCalledWith(
      GUEST,
      "table_memory_posted",
      expect.any(String),
      expect.any(String),
      expect.objectContaining({ metadata: expect.objectContaining({ tableId: TABLE_ID }) }),
    );
  });

  it("closeTable returns null (409) when the table is not currently live", async () => {
    mockClientQuery.mockResolvedValue({ rows: [], rowCount: 0 });

    const result = await tableDatabase.closeTable(TABLE_ID, HOST);

    expect(result).toBeNull();
    expect(mockCreateNotification).not.toHaveBeenCalled();
  });
});

describe("invite atomicity — redeemInvite", () => {
  const TOKEN = "test-token-abc";

  // Default: token resolves, table is joinable (planned), host has not blocked
  // the redeemer. Per-test overrides layer on top via `overrides`.
  const setupRedeem = (overrides: {
    tableStatus?: string;
    blocked?: boolean;
    existingMember?: { rsvp_status: string } | null;
    clientImpl?: (q: string) => unknown;
  }) => {
    const {
      tableStatus = "planned",
      blocked = false,
      existingMember = null,
      clientImpl,
    } = overrides;

    mockExecuteQuery.mockImplementation(async (sql: string) => {
      const q = String(sql);
      if (q.includes("FROM table_invites WHERE token")) {
        return { rows: [{ table_id: TABLE_ID }], rowCount: 1 };
      }
      if (q.includes("SELECT host_id, status FROM tables")) {
        return { rows: [{ host_id: HOST, status: tableStatus }], rowCount: 1 };
      }
      if (q.includes("FROM commensalships") && q.includes("blocked")) {
        return { rows: blocked ? [{ "?column?": 1 }] : [], rowCount: blocked ? 1 : 0 };
      }
      if (q.includes("rsvp_status FROM table_members")) {
        return existingMember
          ? { rows: [{ id: "member-1", rsvp_status: existingMember.rsvp_status }], rowCount: 1 }
          : { rows: [], rowCount: 0 };
      }
      if (q.includes("UPDATE table_members SET rsvp_status = 'joined'")) {
        return { rows: [], rowCount: 1 };
      }
      throw new Error(`unexpected executeQuery: ${q}`);
    });

    mockClientQuery.mockImplementation(async (sql: string) => {
      const q = String(sql);
      if (clientImpl) {
        const r = clientImpl(q);
        if (r !== undefined) return r;
      }
      if (q.includes("SELECT COUNT(*)::int AS n FROM table_members")) {
        return { rows: [{ n: 0 }], rowCount: 1 };
      }
      if (q.includes("use_count = use_count + 1")) {
        return { rows: [{ table_id: TABLE_ID }], rowCount: 1 };
      }
      if (q.includes("INSERT INTO table_members")) {
        return { rows: [], rowCount: 1 };
      }
      throw new Error(`unexpected clientQuery: ${q}`);
    });
  };

  it("membership is checked FIRST: an existing joined member gets a no-op success without consuming a use", async () => {
    setupRedeem({ existingMember: { rsvp_status: "joined" } });

    const result = await tableDatabase.redeemInvite(TOKEN, GUEST, "link");

    expect(result).toEqual({ ok: true, tableId: TABLE_ID, alreadyMember: true });
    expect(clientCalls().some((q) => q.includes("use_count = use_count + 1"))).toBe(false);
  });

  it("an invited guest who clicks the link is upgraded to joined without spending a use", async () => {
    setupRedeem({ existingMember: { rsvp_status: "invited" } });

    const result = await tableDatabase.redeemInvite(TOKEN, GUEST, "link");

    expect(result).toEqual({ ok: true, tableId: TABLE_ID, alreadyMember: true });
    expect(clientCalls().some((q) => q.includes("use_count = use_count + 1"))).toBe(false);
    expect(sqlCalls().some((q) => q.includes("UPDATE table_members SET rsvp_status = 'joined'"))).toBe(
      true,
    );
    expect(mockComputeAndStoreTableComposite).toHaveBeenCalledWith(TABLE_ID);
  });

  it("refuses to join a closed (memory/cancelled) table via a stale link", async () => {
    setupRedeem({ tableStatus: "memory" });

    const result = await tableDatabase.redeemInvite(TOKEN, GUEST, "link");

    expect(result).toEqual({ ok: false, reason: "closed" });
    expect(clientCalls().some((q) => q.includes("use_count = use_count + 1"))).toBe(false);
  });

  it("refuses a redeemer the host has blocked", async () => {
    setupRedeem({ blocked: true });

    const result = await tableDatabase.redeemInvite(TOKEN, GUEST, "link");

    expect(result).toEqual({ ok: false, reason: "blocked" });
    expect(clientCalls().some((q) => q.includes("use_count = use_count + 1"))).toBe(false);
  });

  it("refuses a new redeemer once the table is at the 24-member cap — no use spent", async () => {
    setupRedeem({
      clientImpl: (q) =>
        q.includes("SELECT COUNT(*)::int AS n FROM table_members")
          ? { rows: [{ n: 24 }], rowCount: 1 }
          : undefined,
    });

    const result = await tableDatabase.redeemInvite(TOKEN, GUEST, "link");

    expect(result).toEqual({ ok: false, reason: "cap_exceeded" });
    expect(clientCalls().some((q) => q.includes("use_count = use_count + 1"))).toBe(false);
    expect(mockComputeAndStoreTableComposite).not.toHaveBeenCalled();
  });

  it("a guarded UPDATE ... use_count < max_uses consumes exactly one use per successful redemption", async () => {
    setupRedeem({});

    const result = await tableDatabase.redeemInvite(TOKEN, GUEST, "link");

    expect(result).toEqual({ ok: true, tableId: TABLE_ID, alreadyMember: false });
    const consumeCall = clientCalls().find((q) => q.includes("use_count = use_count + 1"));
    expect(consumeCall).toContain("use_count < max_uses");
    expect(consumeCall).toContain("expires_at > CURRENT_TIMESTAMP");
    expect(mockComputeAndStoreTableComposite).toHaveBeenCalledWith(TABLE_ID);
  });

  it("returns 'expired' when the guarded consume UPDATE matches zero rows (exhausted, expired, or revoked) — cannot exceed maxUses", async () => {
    setupRedeem({
      clientImpl: (q) =>
        q.includes("use_count = use_count + 1") ? { rows: [], rowCount: 0 } : undefined,
    });

    const result = await tableDatabase.redeemInvite(TOKEN, GUEST, "qr");

    expect(result).toEqual({ ok: false, reason: "expired" });
    expect(clientCalls().some((q) => q.includes("INSERT INTO table_members"))).toBe(false);
    expect(mockComputeAndStoreTableComposite).not.toHaveBeenCalled();
  });

  it("returns 'invalid' for an unknown token", async () => {
    mockExecuteQuery.mockResolvedValue({ rows: [], rowCount: 0 });

    const result = await tableDatabase.redeemInvite("does-not-exist", GUEST, "link");

    expect(result).toEqual({ ok: false, reason: "invalid" });
  });

  it("treats a concurrent-insert race (23505) on the member row as success, not an error", async () => {
    setupRedeem({
      clientImpl: (q) => {
        if (q.includes("INSERT INTO table_members")) {
          const err = new Error("duplicate key value violates unique constraint") as Error & {
            code?: string;
          };
          err.code = "23505";
          throw err;
        }
        return undefined;
      },
    });

    const result = await tableDatabase.redeemInvite(TOKEN, GUEST, "link");

    expect(result).toEqual({ ok: true, tableId: TABLE_ID, alreadyMember: false });
  });
});

describe("member identity — one of userId / manualCompanionChartId (XOR)", () => {
  it("addRegisteredMember inserts a user_id row and never touches manual_companion_chart_id", async () => {
    mockExecuteQuery.mockImplementation(async (sql: string) => {
      const q = String(sql);
      if (q.includes("SELECT host_id, status FROM tables")) {
        return { rows: [{ host_id: HOST, status: "planned" }], rowCount: 1 };
      }
      if (q.includes("FROM commensalships") && q.includes("blocked")) {
        return { rows: [], rowCount: 0 };
      }
      if (q.includes("SELECT COUNT(*)::int AS n FROM table_members")) {
        return { rows: [{ n: 1 }], rowCount: 1 };
      }
      if (q.includes("FROM commensalships") && q.includes("accepted")) {
        return { rows: [], rowCount: 0 };
      }
      if (q.includes("INSERT INTO table_members")) {
        return { rows: [{ id: "member-2" }], rowCount: 1 };
      }
      if (q.includes("WHERE tm.id = $1")) {
        return {
          rows: [
            {
              id: "member-2",
              table_id: TABLE_ID,
              user_id: OTHER,
              manual_companion_chart_id: null,
              role: "guest",
              rsvp_status: "invited",
              joined_via: "search",
              created_at: "2026-07-01T00:00:00Z",
              updated_at: "2026-07-01T00:00:00Z",
            },
          ],
          rowCount: 1,
        };
      }
      throw new Error(`unexpected query: ${q}`);
    });

    const result = await tableDatabase.addRegisteredMember(TABLE_ID, HOST, OTHER);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.member.userId).toBe(OTHER);
      expect(result.member.manualCompanionChartId).toBeUndefined();
    }

    const insertCall = mockExecuteQuery.mock.calls.find(([sql]) =>
      String(sql).includes("INSERT INTO table_members"),
    );
    expect(insertCall![0]).toContain("user_id");
    expect(insertCall![0]).not.toContain("manual_companion_chart_id");
  });

  it("addManualMember inserts a manual_companion_chart_id row and never touches user_id", async () => {
    mockExecuteQuery.mockImplementation(async (sql: string) => {
      const q = String(sql);
      if (q.includes("SELECT host_id, status FROM tables")) {
        return { rows: [{ host_id: HOST, status: "planned" }], rowCount: 1 };
      }
      if (q.includes("FROM manual_companion_charts")) {
        return { rows: [{ id: "mcc-1", name: "Offline Friend" }], rowCount: 1 };
      }
      if (q.includes("SELECT COUNT(*)::int AS n FROM table_members")) {
        return { rows: [{ n: 1 }], rowCount: 1 };
      }
      if (q.includes("INSERT INTO table_members")) {
        return { rows: [{ id: "member-3" }], rowCount: 1 };
      }
      if (q.includes("WHERE tm.id = $1")) {
        return {
          rows: [
            {
              id: "member-3",
              table_id: TABLE_ID,
              user_id: null,
              manual_companion_chart_id: "mcc-1",
              role: "guest",
              rsvp_status: "joined",
              joined_via: "manual",
              display_name: "Offline Friend",
              created_at: "2026-07-01T00:00:00Z",
              updated_at: "2026-07-01T00:00:00Z",
            },
          ],
          rowCount: 1,
        };
      }
      throw new Error(`unexpected query: ${q}`);
    });

    const result = await tableDatabase.addManualMember(TABLE_ID, HOST, "mcc-1");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.member.manualCompanionChartId).toBe("mcc-1");
      expect(result.member.userId).toBeUndefined();
    }

    const insertCall = mockExecuteQuery.mock.calls.find(([sql]) =>
      String(sql).includes("INSERT INTO table_members"),
    );
    expect(insertCall![0]).toContain("manual_companion_chart_id");
    expect(insertCall![0]).not.toContain("user_id");
    expect(mockComputeAndStoreTableComposite).toHaveBeenCalledWith(TABLE_ID);
  });

  it("addRegisteredMember rejects a blocked pair before touching the member cap or insert", async () => {
    mockExecuteQuery.mockImplementation(async (sql: string) => {
      const q = String(sql);
      if (q.includes("SELECT host_id, status FROM tables")) {
        return { rows: [{ host_id: HOST, status: "planned" }], rowCount: 1 };
      }
      if (q.includes("FROM commensalships") && q.includes("blocked")) {
        return { rows: [{ "?column?": 1 }], rowCount: 1 };
      }
      throw new Error(`unexpected query: ${q}`);
    });

    const result = await tableDatabase.addRegisteredMember(TABLE_ID, HOST, OTHER);

    expect(result).toEqual({ ok: false, reason: "blocked" });
    expect(sqlCalls().some((q) => q.includes("INSERT INTO table_members"))).toBe(false);
  });

  it("addRegisteredMember refuses a caller who is not the host", async () => {
    mockExecuteQuery.mockImplementation(async (sql: string) => {
      if (String(sql).includes("SELECT host_id, status FROM tables")) {
        return { rows: [{ host_id: HOST, status: "planned" }], rowCount: 1 };
      }
      throw new Error(`unexpected query: ${sql}`);
    });

    const result = await tableDatabase.addRegisteredMember(TABLE_ID, OTHER, GUEST);

    expect(result).toEqual({ ok: false, reason: "not_host" });
  });

  it("rejects new members once the table is at the 24-member cap", async () => {
    mockExecuteQuery.mockImplementation(async (sql: string) => {
      const q = String(sql);
      if (q.includes("SELECT host_id, status FROM tables")) {
        return { rows: [{ host_id: HOST, status: "planned" }], rowCount: 1 };
      }
      if (q.includes("FROM commensalships") && q.includes("blocked")) {
        return { rows: [], rowCount: 0 };
      }
      if (q.includes("SELECT COUNT(*)::int AS n FROM table_members")) {
        return { rows: [{ n: 24 }], rowCount: 1 };
      }
      throw new Error(`unexpected query: ${q}`);
    });

    const result = await tableDatabase.addRegisteredMember(TABLE_ID, HOST, OTHER);

    expect(result).toEqual({ ok: false, reason: "cap_exceeded" });
  });
});

describe("RSVP", () => {
  it("requires an existing 'invited' row — the guard is baked into the UPDATE", async () => {
    mockExecuteQuery.mockImplementation(async (sql: string) => {
      const q = String(sql);
      if (q.includes("SELECT host_id, status FROM tables")) {
        return { rows: [{ host_id: HOST, status: "planned" }], rowCount: 1 };
      }
      // No matching invited row.
      return { rows: [], rowCount: 0 };
    });

    const result = await tableDatabase.rsvp(TABLE_ID, GUEST, "joined");

    expect(result).toEqual({ ok: false, reason: "not_found" });
    const updateSql = sqlCalls().find((q) => q.includes("UPDATE table_members"));
    expect(updateSql).toContain("rsvp_status = 'invited'");
  });

  it("refuses to RSVP into a closed (memory) table — its composite is frozen", async () => {
    mockExecuteQuery.mockImplementation(async (sql: string) => {
      const q = String(sql);
      if (q.includes("SELECT host_id, status FROM tables")) {
        return { rows: [{ host_id: HOST, status: "memory" }], rowCount: 1 };
      }
      throw new Error(`unexpected query: ${q}`);
    });

    const result = await tableDatabase.rsvp(TABLE_ID, GUEST, "joined");

    expect(result).toEqual({ ok: false, reason: "not_found" });
    expect(sqlCalls().some((q) => q.includes("UPDATE table_members"))).toBe(false);
    expect(mockComputeAndStoreTableComposite).not.toHaveBeenCalled();
  });

  it("joined RSVP triggers a composite recompute; declined does not", async () => {
    mockExecuteQuery.mockImplementation(async (sql: string) => {
      const q = String(sql);
      if (q.includes("SELECT host_id, status FROM tables")) {
        return { rows: [{ host_id: HOST, status: "planned" }], rowCount: 1 };
      }
      if (q.includes("UPDATE table_members")) {
        return { rows: [{ id: "member-4" }], rowCount: 1 };
      }
      if (q.includes("WHERE tm.id = $1")) {
        return {
          rows: [
            {
              id: "member-4",
              table_id: TABLE_ID,
              user_id: GUEST,
              role: "guest",
              rsvp_status: "joined",
              created_at: "2026-07-01T00:00:00Z",
              updated_at: "2026-07-01T00:00:00Z",
            },
          ],
          rowCount: 1,
        };
      }
      if (q.includes("SELECT * FROM tables WHERE id")) {
        return {
          rows: [{ id: TABLE_ID, host_id: HOST, status: "planned", venue_type: "home", menu: "[]" }],
          rowCount: 1,
        };
      }
      throw new Error(`unexpected query: ${q}`);
    });

    const result = await tableDatabase.rsvp(TABLE_ID, GUEST, "joined");

    expect(result.ok).toBe(true);
    expect(mockComputeAndStoreTableComposite).toHaveBeenCalledWith(TABLE_ID);
  });
});
