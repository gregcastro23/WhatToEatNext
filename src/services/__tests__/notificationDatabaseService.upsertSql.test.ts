/**
 * @jest-environment node
 *
 * createOrBumpEventNotification DB path — concurrency backstop (PR 5, review §3).
 * Asserts the CTE upsert INSERTs with ON CONFLICT DO UPDATE against the partial
 * unique index (user_id, type, (metadata->>'eventId')) WHERE is_read = false, so
 * a racing double-insert bumps instead of duplicating.
 *
 * Runs in the node environment (window undefined) + DATABASE_URL set so the
 * service takes its DB path rather than the in-memory fallback.
 */

// Set before the service module evaluates so getDbModule()'s isServerWithDB()
// sees it. The service loads @/lib/database via a DYNAMIC import, so the mock
// fn must be a single hoisted reference (a fresh jest.fn() inside the factory
// would differ between the static and dynamic import).
process.env.DATABASE_URL = "postgres://test";

const mockExecuteQuery = jest.fn();

jest.mock("@/lib/logger", () => ({
  _logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn() },
}));
jest.mock("@/lib/database", () => ({ executeQuery: mockExecuteQuery }));

import { notificationDatabase } from "@/services/notificationDatabaseService";

const TESLA = "22222222-2222-4222-8222-222222222222";
const CURIE = "11111111-1111-4111-8111-111111111111";
const EVENT = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

describe("createOrBumpEventNotification (DB path)", () => {
  beforeEach(() => {
    mockExecuteQuery.mockReset();
    mockExecuteQuery.mockResolvedValue({
      rows: [
        {
          id: "notif_x",
          user_id: TESLA,
          type: "comment_received",
          title: "New comment",
          message: "Marie Curie commented on your dish",
          related_user_id: CURIE,
          metadata: { eventId: EVENT, count: 1, lastActorName: "Marie Curie" },
          created_at: new Date(),
          expires_at: null,
          is_read: false,
        },
      ],
    });
  });

  it("issues an ON CONFLICT DO UPDATE upsert keyed on the partial unread-event index", async () => {
    await notificationDatabase.createOrBumpEventNotification({
      recipientId: TESLA,
      actorId: CURIE,
      type: "comment_received",
      eventId: EVENT,
      title: "New comment",
      firstMessage: "Marie Curie commented on your dish",
      bumpTemplate: "__ACTOR__ and __OTHERS__ others commented on your dish",
      lastActorName: "Marie Curie",
    });

    expect(mockExecuteQuery).toHaveBeenCalledTimes(1);
    const [sql] = mockExecuteQuery.mock.calls[0];
    expect(sql).toContain("ON CONFLICT (user_id, type, (metadata->>'eventId')) WHERE is_read = false");
    expect(sql).toContain("DO UPDATE SET");
    // Both the UPDATE-first (bumped) path and the ON-CONFLICT path bump count.
    expect(sql).toContain("'count', COALESCE((notifications.metadata->>'count')::int, 1) + 1");
    expect(sql).toContain("WITH bumped AS");
  });
});
