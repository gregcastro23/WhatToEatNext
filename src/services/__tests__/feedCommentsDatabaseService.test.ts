/**
 * feedCommentsDatabaseService — comment reads/writes, moderation (PR 5).
 * Fixture identities are the historical-agent roster (design-spec §4.8):
 * Marie Curie comments on Nikola Tesla's dish.
 */

jest.mock("@/lib/database", () => ({
  executeQuery: jest.fn(),
}));

jest.mock("@/lib/logger", () => ({
  _logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn() },
}));

jest.mock("@/lib/social/identity", () => ({
  resolveDisplayIdentity: jest.fn(),
}));

import { executeQuery } from "@/lib/database";
import { resolveDisplayIdentity } from "@/lib/social/identity";
import { feedCommentsDatabase } from "@/services/feedCommentsDatabaseService";

const CURIE = "11111111-1111-4111-8111-111111111111"; // commenter
const TESLA = "22222222-2222-4222-8222-222222222222"; // event actor / poster
const EVENT = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const COMMENT = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

const mockQuery = executeQuery as jest.Mock;
const mockResolve = resolveDisplayIdentity as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockResolve.mockResolvedValue({
    [CURIE]: { userId: CURIE, name: "Marie Curie", image: null, isAgent: false, dominantElement: "Water" },
    [TESLA]: { userId: TESLA, name: "Nikola Tesla", image: null, isAgent: true, dominantElement: "Air" },
  });
});

describe("listComments", () => {
  it("resolves identity, marks the event actor, and renders oldest→newest", async () => {
    // Rows come back newest-first (created_at DESC); the service reverses them.
    mockQuery.mockResolvedValueOnce({
      rows: [
        { id: "c2", event_id: EVENT, author_id: TESLA, body: "Thank you!", created_at: new Date("2026-07-02T10:00:00Z"), event_actor_id: TESLA },
        { id: "c1", event_id: EVENT, author_id: CURIE, body: "Exquisite", created_at: new Date("2026-07-01T10:00:00Z"), event_actor_id: TESLA },
      ],
    });
    const page = await feedCommentsDatabase.listComments(EVENT, CURIE, { limit: 30 });
    expect(page.comments.map((c) => c.id)).toEqual(["c1", "c2"]); // ascending
    expect(page.comments[0].authorName).toBe("Marie Curie");
    expect(page.comments[0].isEventActor).toBe(false);
    expect(page.comments[1].isEventActor).toBe(true); // Tesla is the poster
    expect(page.nextCursor).toBeNull(); // partial page
  });

  it("filters deleted + hidden + blocked pairs in the SQL and scopes 'own hidden' to the viewer", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });
    await feedCommentsDatabase.listComments(EVENT, CURIE, { limit: 30 });
    const [sql] = mockQuery.mock.calls[0];
    expect(sql).toContain("c.deleted_at IS NULL");
    expect(sql).toContain("NOT c.hidden OR c.author_id = $2::uuid");
    expect(sql).toContain("status = 'blocked'");
  });

  it("emits a keyset cursor on a full page", async () => {
    const rows = Array.from({ length: 2 }, (_, i) => ({
      id: `c${i}`,
      event_id: EVENT,
      author_id: CURIE,
      body: "x",
      created_at: new Date(`2026-07-0${i + 1}T10:00:00Z`),
      event_actor_id: TESLA,
    }));
    mockQuery.mockResolvedValueOnce({ rows });
    const page = await feedCommentsDatabase.listComments(EVENT, CURIE, { limit: 2 });
    expect(page.nextCursor).toEqual(expect.any(String));
  });

  it("fails open to an empty page on read errors", async () => {
    mockQuery.mockRejectedValueOnce(new Error("boom"));
    const page = await feedCommentsDatabase.listComments(EVENT, CURIE, {});
    expect(page).toEqual({ comments: [], nextCursor: null });
  });
});

describe("createComment", () => {
  it("inserts and returns the canonical identity-resolved comment", async () => {
    mockQuery.mockImplementation((sql: string) => {
      if (sql.includes("INSERT INTO feed_comments")) {
        return Promise.resolve({ rows: [{ id: COMMENT, created_at: new Date("2026-07-03T10:00:00Z") }] });
      }
      if (sql.includes("SELECT actor_id FROM feed_events")) {
        return Promise.resolve({ rows: [{ actor_id: TESLA }] });
      }
      return Promise.resolve({ rows: [] });
    });
    const comment = await feedCommentsDatabase.createComment(EVENT, CURIE, "Exquisite work");
    expect(comment).toMatchObject({
      id: COMMENT,
      authorId: CURIE,
      authorName: "Marie Curie",
      body: "Exquisite work",
      isEventActor: false,
    });
  });
});

describe("deleteComment", () => {
  it("soft-deletes for the author (rowCount 1 → true)", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 });
    expect(await feedCommentsDatabase.deleteComment(COMMENT, CURIE, false)).toBe(true);
    const [sql, params] = mockQuery.mock.calls[0];
    expect(sql).toContain("deleted_at = now()");
    expect(sql).toContain("($3 OR author_id = $2::uuid)");
    expect(params).toEqual([COMMENT, CURIE, false]);
  });

  it("returns false when neither author nor admin (rowCount 0)", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });
    expect(await feedCommentsDatabase.deleteComment(COMMENT, CURIE, false)).toBe(false);
  });

  it("admin bypasses the author check ($3 = true)", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 });
    await feedCommentsDatabase.deleteComment(COMMENT, TESLA, true);
    const [, params] = mockQuery.mock.calls[0];
    expect(params[2]).toBe(true);
  });
});

describe("reportComment", () => {
  it("is a quiet no-op on a duplicate report (no recount)", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // ON CONFLICT DO NOTHING
    const result = await feedCommentsDatabase.reportComment(COMMENT, CURIE, "spam", null);
    expect(result).toEqual({ reported: false, hidden: false });
    expect(mockQuery).toHaveBeenCalledTimes(1); // no recount ran
  });

  it("auto-hides once the third distinct report lands", async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: "rep1" }], rowCount: 1 }) // fresh report
      .mockResolvedValueOnce({ rows: [{ hidden: true, flagged_count: 3 }] }); // recount → hidden
    const result = await feedCommentsDatabase.reportComment(COMMENT, TESLA, "harassment", "abusive");
    expect(result).toEqual({ reported: true, hidden: true });
    const [updSql, updParams] = mockQuery.mock.calls[1];
    expect(updSql).toContain("hidden = (sub.n >= $2)");
    expect(updParams).toEqual([COMMENT, 3]);
  });

  it("stays visible below the threshold", async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: "rep1" }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [{ hidden: false, flagged_count: 1 }] });
    const result = await feedCommentsDatabase.reportComment(COMMENT, CURIE, "spam", null);
    expect(result).toEqual({ reported: true, hidden: false });
  });
});
