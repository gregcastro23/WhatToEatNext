/**
 * @jest-environment node
 *
 * The one-unread-row-per-(recipient, conversation) chat dedup upsert
 * (docs/plans/pr3-messaging-plan.md §6): createOrBumpEventNotification inserts
 * the first time and bumps an existing unread row's folded count thereafter;
 * clearChatNotifications marks a conversation's chat rows read.
 */

const mockExecuteQuery = jest.fn();
const mockClientQuery = jest.fn();
const mockWithTransaction = jest.fn(
  async (operation: (client: { query: typeof mockClientQuery }) => Promise<unknown>) =>
    operation({ query: mockClientQuery }),
);

// The service lazy-imports "@/lib/database" (getDbModule) AND
// "@/lib/database/connection" (withTransaction). Mock both.
jest.mock("@/lib/database", () => ({
  executeQuery: (...a: unknown[]) => mockExecuteQuery(...a),
}));
jest.mock("@/lib/database/connection", () => ({
  withTransaction: (...a: unknown[]) => (mockWithTransaction as any)(...a),
}));
jest.mock("@/lib/logger", () => ({
  _logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

const ORIGINAL_DB_URL = process.env.DATABASE_URL;

import { notificationDatabase } from "@/services/notificationDatabaseService";

const CURIE = "11111111-1111-4111-8111-111111111111";
const TESLA = "22222222-2222-4222-8222-222222222222";
const CONV = "55555555-5555-4555-8555-555555555555";

beforeAll(() => {
  process.env.DATABASE_URL = "postgres://test";
});
afterAll(() => {
  process.env.DATABASE_URL = ORIGINAL_DB_URL;
});

beforeEach(() => {
  mockExecuteQuery.mockReset();
  mockClientQuery.mockReset();
  mockWithTransaction.mockClear();
});

describe("createOrBumpEventNotification", () => {
  it("INSERTS a fresh row with unreadCount=1 when none exists", async () => {
    mockClientQuery
      .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // SELECT ... FOR UPDATE → none
      .mockResolvedValueOnce({
        rows: [
          {
            id: "notif_1",
            user_id: CURIE,
            type: "dm_message",
            title: "New message",
            message: "Hi",
            is_read: false,
            metadata: JSON.stringify({ conversationId: CONV, unreadCount: 1 }),
            created_at: "2026-07-11T00:00:00Z",
          },
        ],
        rowCount: 1,
      });

    const result = await notificationDatabase.createOrBumpEventNotification(
      CURIE,
      "dm_message",
      CONV,
      { title: "New message", message: "Hi", relatedUserId: TESLA },
    );

    expect(result).not.toBeNull();
    const insertSql = String(mockClientQuery.mock.calls[1][0]);
    expect(insertSql).toContain("INSERT INTO notifications");
    const insertMeta = JSON.parse(mockClientQuery.mock.calls[1][1][6]);
    expect(insertMeta).toMatchObject({ conversationId: CONV, unreadCount: 1 });
  });

  it("BUMPS the existing unread row's folded count instead of inserting a second", async () => {
    mockClientQuery
      .mockResolvedValueOnce({
        rows: [{ id: "notif_1", metadata: JSON.stringify({ conversationId: CONV, unreadCount: 2 }) }],
        rowCount: 1,
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: "notif_1",
            user_id: CURIE,
            type: "dm_message",
            title: "New message",
            message: "Third",
            is_read: false,
            metadata: JSON.stringify({ conversationId: CONV, unreadCount: 3 }),
            created_at: "2026-07-11T00:03:00Z",
          },
        ],
        rowCount: 1,
      });

    await notificationDatabase.createOrBumpEventNotification(CURIE, "dm_message", CONV, {
      title: "New message",
      message: "Third",
    });

    const updateSql = String(mockClientQuery.mock.calls[1][0]);
    expect(updateSql).toContain("UPDATE notifications");
    const updatedMeta = JSON.parse(mockClientQuery.mock.calls[1][1][2]);
    expect(updatedMeta.unreadCount).toBe(3); // 2 + 1, single row
    // Exactly two client statements: the SELECT and the UPDATE — no INSERT.
    expect(mockClientQuery.mock.calls).toHaveLength(2);
  });
});

describe("clearChatNotifications", () => {
  it("marks the conversation's chat notification rows read", async () => {
    mockExecuteQuery.mockResolvedValueOnce({ rows: [{ id: "notif_1" }], rowCount: 1 });

    const cleared = await notificationDatabase.clearChatNotifications(CURIE, CONV);

    expect(cleared).toBe(1);
    const sql = String(mockExecuteQuery.mock.calls[0][0]);
    expect(sql).toContain("SET is_read = true");
    expect(sql).toContain("type IN ('dm_message','circle_message','table_chat_mention')");
    expect(sql).toContain("metadata->>'conversationId' = $2");
  });
});
