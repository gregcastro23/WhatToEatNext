/**
 * @jest-environment node
 *
 * Tests for chatDatabaseService — DM canonicalization, table-conversation
 * seeding on the caller's transaction client, clientKey idempotency,
 * report auto-hide, and the fail-closed block check
 * (docs/plans/pr3-messaging-plan.md commit 1).
 */

const mockExecuteQuery = jest.fn();
const mockClientQuery = jest.fn();
const mockWithTransaction = jest.fn(
  async (operation: (client: { query: typeof mockClientQuery }) => Promise<unknown>) => {
    return operation({ query: mockClientQuery });
  },
);

jest.mock("@/lib/database/connection", () => ({
  executeQuery: (...args: unknown[]) => mockExecuteQuery(...args),
  withTransaction: (...args: unknown[]) => (mockWithTransaction as any)(...args),
}));

jest.mock("@/lib/logger", () => ({
  _logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

import { chatDatabase } from "@/services/chatDatabaseService";

// Real historical-agent identities only in fixtures (design-spec §4.8).
const CURIE = "11111111-1111-1111-1111-111111111111"; // Marie Curie
const TESLA = "22222222-2222-2222-2222-222222222222"; // Nikola Tesla
const JUNG = "33333333-3333-3333-3333-333333333333"; // Carl Jung
const TABLE_ID = "44444444-4444-4444-4444-444444444444";
const CONV_ID = "55555555-5555-5555-5555-555555555555";
const MSG_ID = "66666666-6666-6666-6666-666666666666";

const clientSql = () => mockClientQuery.mock.calls.map(([q]) => String(q));

beforeEach(() => {
  mockExecuteQuery.mockReset();
  mockClientQuery.mockReset();
  mockWithTransaction.mockClear();
});

describe("ensureDmConversation — canonicalized lo<hi pair", () => {
  it("sorts the pair so (B, A) and (A, B) land on the same row", async () => {
    mockClientQuery
      .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // INSERT .. DO NOTHING
      .mockResolvedValueOnce({ rows: [{ id: CONV_ID }], rowCount: 1 }) // SELECT id
      .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // seed members
    mockExecuteQuery.mockResolvedValueOnce({
      rows: [
        {
          id: CONV_ID,
          kind: "dm",
          dm_user_lo: CURIE,
          dm_user_hi: TESLA,
          created_at: "2026-07-11T00:00:00Z",
          updated_at: "2026-07-11T00:00:00Z",
        },
      ],
      rowCount: 1,
    });

    // TESLA > CURIE lexically; pass them reversed.
    const conv = await chatDatabase.ensureDmConversation(TESLA, CURIE);

    expect(conv).not.toBeNull();
    const insertCall = mockClientQuery.mock.calls[0];
    expect(String(insertCall[0])).toContain("INSERT INTO conversations");
    // params: [lo, hi, createdBy]
    expect(insertCall[1][0]).toBe(CURIE);
    expect(insertCall[1][1]).toBe(TESLA);
    expect(insertCall[1][2]).toBe(TESLA); // creator preserved
  });

  it("uses ON CONFLICT on the partial dm-pair index (race-safe upsert)", async () => {
    mockClientQuery
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })
      .mockResolvedValueOnce({ rows: [{ id: CONV_ID }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 });
    mockExecuteQuery.mockResolvedValueOnce({
      rows: [{ id: CONV_ID, kind: "dm", dm_user_lo: CURIE, dm_user_hi: TESLA }],
      rowCount: 1,
    });

    await chatDatabase.ensureDmConversation(CURIE, TESLA);

    expect(clientSql()[0]).toContain("ON CONFLICT (dm_user_lo, dm_user_hi) WHERE kind = 'dm' DO NOTHING");
  });
});

describe("ensureTableConversationOnClient — runs on the CALLER'S client", () => {
  it("creates the conversation with subject_ref = tables.id and seeds joined members, host from tables.host_id", async () => {
    mockClientQuery
      .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // INSERT conversation
      .mockResolvedValueOnce({ rows: [{ id: CONV_ID }], rowCount: 1 }) // SELECT id
      .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // seed members

    const fakeClient = { query: mockClientQuery };
    const id = await chatDatabase.ensureTableConversationOnClient(fakeClient as any, {
      id: TABLE_ID,
      hostId: CURIE,
      title: "Solstice Feast",
    });

    expect(id).toBe(CONV_ID);
    // Never touches the pool: zero executeQuery / withTransaction calls.
    expect(mockExecuteQuery).not.toHaveBeenCalled();
    expect(mockWithTransaction).not.toHaveBeenCalled();

    const [insertSql, insertParams] = mockClientQuery.mock.calls[0];
    expect(String(insertSql)).toContain("VALUES ('table', $1, $2, $3::uuid)");
    expect(insertParams[0]).toBe(TABLE_ID); // subject_ref = Postgres tables.id

    const [seedSql, seedParams] = mockClientQuery.mock.calls[2];
    expect(String(seedSql)).toContain("rsvp_status = 'joined'");
    expect(String(seedSql)).toContain("CASE WHEN tm.user_id = $3::uuid THEN 'host' ELSE 'member' END");
    expect(seedParams[2]).toBe(CURIE); // host = tables.host_id, no first-ensurer
  });
});

describe("ensureTableConversation — standalone healing path", () => {
  it("returns null for a table that has not gone live", async () => {
    mockClientQuery.mockResolvedValueOnce({
      rows: [{ id: TABLE_ID, host_id: CURIE, title: "Feast", status: "planned" }],
      rowCount: 1,
    });

    const conv = await chatDatabase.ensureTableConversation(TABLE_ID);

    expect(conv).toBeNull();
  });

  it("ensures for live AND memory tables (record survives close)", async () => {
    mockClientQuery
      .mockResolvedValueOnce({
        rows: [{ id: TABLE_ID, host_id: CURIE, title: "Feast", status: "memory" }],
        rowCount: 1,
      })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })
      .mockResolvedValueOnce({ rows: [{ id: CONV_ID }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 });
    mockExecuteQuery.mockResolvedValueOnce({
      rows: [{ id: CONV_ID, kind: "table", subject_ref: TABLE_ID }],
      rowCount: 1,
    });

    const conv = await chatDatabase.ensureTableConversation(TABLE_ID);

    expect(conv).not.toBeNull();
    expect(conv!.subjectRef).toBe(TABLE_ID);
  });
});

describe("insertMessage — clientKey idempotency", () => {
  it("inserts and bumps last_message_at in the same transaction", async () => {
    mockClientQuery
      .mockResolvedValueOnce({
        rows: [
          {
            id: MSG_ID,
            conversation_id: CONV_ID,
            sender_id: CURIE,
            body: "Radium risotto is ready",
            attachments: "[]",
            created_at: "2026-07-11T00:00:00Z",
          },
        ],
        rowCount: 1,
      })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // bump

    const result = await chatDatabase.insertMessage({
      conversationId: CONV_ID,
      senderId: CURIE,
      body: "Radium risotto is ready",
      attachments: [],
      clientKey: "ck-1",
    });

    expect(result).not.toBeNull();
    expect(result!.replay).toBe(false);
    expect(result!.message.id).toBe(MSG_ID);
    expect(clientSql()[1]).toContain("SET last_message_at = CURRENT_TIMESTAMP");
    expect(mockWithTransaction).toHaveBeenCalledTimes(1);
  });

  it("a clientKey replay returns the ORIGINAL row and does NOT bump last_message_at", async () => {
    mockClientQuery
      .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // conflict: DO NOTHING
      .mockResolvedValueOnce({
        rows: [
          {
            id: MSG_ID,
            conversation_id: CONV_ID,
            sender_id: CURIE,
            body: "Radium risotto is ready",
            attachments: "[]",
            client_key: "ck-1",
            created_at: "2026-07-11T00:00:00Z",
          },
        ],
        rowCount: 1,
      });

    const result = await chatDatabase.insertMessage({
      conversationId: CONV_ID,
      senderId: CURIE,
      body: "Radium risotto is ready",
      attachments: [],
      clientKey: "ck-1",
    });

    expect(result!.replay).toBe(true);
    expect(result!.message.id).toBe(MSG_ID);
    expect(clientSql().some((q) => q.includes("SET last_message_at"))).toBe(false);
  });

  it("deleted messages map to empty tombstones on read", async () => {
    mockExecuteQuery.mockResolvedValueOnce({
      rows: [
        {
          id: MSG_ID,
          conversation_id: CONV_ID,
          sender_id: TESLA,
          body: "should never surface",
          attachments: '[{"type":"photo","url":"x"}]',
          deleted_at: "2026-07-11T01:00:00Z",
          created_at: "2026-07-11T00:00:00Z",
        },
      ],
      rowCount: 1,
    });

    const messages = await chatDatabase.listMessages(CONV_ID, JUNG);

    expect(messages).toHaveLength(1);
    expect(messages[0].body).toBe("");
    expect(messages[0].attachments).toEqual([]);
    expect(messages[0].deletedAt).not.toBeNull();
  });
});

describe("reportMessage — auto-hide at 3", () => {
  it("increments flagged_count and hides when the threshold lands", async () => {
    mockClientQuery
      .mockResolvedValueOnce({ rows: [{ conversation_id: CONV_ID }], rowCount: 1 }) // FOR UPDATE
      .mockResolvedValueOnce({ rows: [{ id: "r1" }], rowCount: 1 }) // insert report
      .mockResolvedValueOnce({ rows: [{ hidden: true }], rowCount: 1 }); // update message

    const result = await chatDatabase.reportMessage(MSG_ID, JUNG, "harassment");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.alreadyReported).toBe(false);
      expect(result.hidden).toBe(true);
    }
    const updateSql = clientSql()[2];
    expect(updateSql).toContain("flagged_count = flagged_count + 1");
    expect(updateSql).toContain("hidden = hidden OR (flagged_count + 1 >= $2)");
  });

  it("a duplicate report from the same reporter is a no-op (unique per reporter)", async () => {
    mockClientQuery
      .mockResolvedValueOnce({ rows: [{ conversation_id: CONV_ID }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // conflict: DO NOTHING
      .mockResolvedValueOnce({ rows: [{ hidden: false }], rowCount: 1 });

    const result = await chatDatabase.reportMessage(MSG_ID, JUNG, "spam");

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.alreadyReported).toBe(true);
    // flagged_count must NOT have been bumped.
    expect(clientSql().some((q) => q.includes("flagged_count + 1"))).toBe(false);
  });
});

describe("softDeleteMessage — sender/host/admin only", () => {
  it("denies a random member", async () => {
    mockExecuteQuery.mockResolvedValueOnce({
      rows: [{ sender_id: TESLA, deleted_at: null, actor_role: "member" }],
      rowCount: 1,
    });

    const result = await chatDatabase.softDeleteMessage(MSG_ID, JUNG);

    expect(result).toEqual({ ok: false, reason: "forbidden" });
  });

  it("allows the conversation host", async () => {
    mockExecuteQuery
      .mockResolvedValueOnce({
        rows: [{ sender_id: TESLA, deleted_at: null, actor_role: "host" }],
        rowCount: 1,
      })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const result = await chatDatabase.softDeleteMessage(MSG_ID, CURIE);

    expect(result).toEqual({ ok: true });
    const sql = mockExecuteQuery.mock.calls[1][0] as string;
    expect(sql).toContain("SET deleted_at = CURRENT_TIMESTAMP");
  });

  it("allows an admin who is not a member", async () => {
    mockExecuteQuery
      .mockResolvedValueOnce({
        rows: [{ sender_id: TESLA, deleted_at: null, actor_role: null }],
        rowCount: 1,
      })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const result = await chatDatabase.softDeleteMessage(MSG_ID, JUNG, { isAdmin: true });

    expect(result).toEqual({ ok: true });
  });
});

describe("isBlockedBetween — fails CLOSED for chat", () => {
  it("treats a DB error as blocked (safety boundary, unlike table invites)", async () => {
    mockExecuteQuery.mockRejectedValueOnce(new Error("connection reset"));

    await expect(chatDatabase.isBlockedBetween(CURIE, TESLA)).resolves.toBe(true);
  });

  it("returns false when no blocked row exists", async () => {
    mockExecuteQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    await expect(chatDatabase.isBlockedBetween(CURIE, TESLA)).resolves.toBe(false);
  });
});

describe("bindSpacetimeIdentity — telemetry only", () => {
  it("normalizes and upserts a well-formed hex identity", async () => {
    mockExecuteQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 });

    const ok = await chatDatabase.bindSpacetimeIdentity(CURIE, "0xC0FFEE00C0FFEE00");

    expect(ok).toBe(true);
    const [sql, params] = mockExecuteQuery.mock.calls[0];
    expect(String(sql)).toContain("ON CONFLICT (user_id, identity_hex) DO NOTHING");
    expect(params[1]).toBe("0xc0ffee00c0ffee00");
  });

  it("rejects malformed identities without touching the DB", async () => {
    const ok = await chatDatabase.bindSpacetimeIdentity(CURIE, "not-hex!");

    expect(ok).toBe(false);
    expect(mockExecuteQuery).not.toHaveBeenCalled();
  });
});
