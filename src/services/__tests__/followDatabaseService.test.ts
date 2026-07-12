/**
 * followDatabaseService — the asymmetric follow layer (PR 4).
 *
 * All identities in fixtures are the historical-agent roster
 * (design-spec §4.8): Marie Curie follows Nikola Tesla, never invented names.
 */

jest.mock("@/lib/database", () => ({
  executeQuery: jest.fn(),
}));

jest.mock("@/lib/logger", () => ({
  _logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn() },
}));

import { executeQuery } from "@/lib/database";
import { followDatabase } from "@/services/followDatabaseService";

const CURIE = "11111111-1111-1111-1111-111111111111"; // Marie Curie
const TESLA = "22222222-2222-2222-2222-222222222222"; // Nikola Tesla
const JUNG = "33333333-3333-3333-3333-333333333333"; // Carl Jung

const mockQuery = executeQuery as jest.Mock;

/** Route calls by SQL shape: target lookup → block check → insert. */
function primeFollowPath(opts: {
  targetRows?: Array<{ is_agent: boolean }>;
  blockedRows?: unknown[];
  insertRowCount?: number;
  blockCheckError?: Error;
}) {
  mockQuery.mockImplementation((sql: string) => {
    if (sql.includes("FROM users")) {
      return Promise.resolve({ rows: opts.targetRows ?? [{ is_agent: false }] });
    }
    if (sql.includes("status = 'blocked'")) {
      if (opts.blockCheckError) return Promise.reject(opts.blockCheckError);
      return Promise.resolve({ rows: opts.blockedRows ?? [] });
    }
    if (sql.includes("INSERT INTO follows")) {
      return Promise.resolve({ rows: [], rowCount: opts.insertRowCount ?? 1 });
    }
    return Promise.resolve({ rows: [], rowCount: 0 });
  });
}

describe("followDatabase.follow", () => {
  beforeEach(() => jest.clearAllMocks());

  it("rejects self-follows without touching the database", async () => {
    const result = await followDatabase.follow(CURIE, CURIE);
    expect(result).toEqual({ ok: false, reason: "self" });
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("returns not_found when the target does not exist or is inactive", async () => {
    primeFollowPath({ targetRows: [] });
    const result = await followDatabase.follow(CURIE, TESLA);
    expect(result).toEqual({ ok: false, reason: "not_found" });
  });

  it("refuses blocked pairs in either direction", async () => {
    primeFollowPath({ blockedRows: [{ 1: 1 }] });
    const result = await followDatabase.follow(CURIE, TESLA);
    expect(result).toEqual({ ok: false, reason: "blocked" });
    // The insert must never run for a blocked pair.
    const insertCalls = mockQuery.mock.calls.filter(([sql]) =>
      String(sql).includes("INSERT INTO follows"),
    );
    expect(insertCalls).toHaveLength(0);
  });

  it("FAILS CLOSED when the block check errors — the follow is aborted", async () => {
    primeFollowPath({ blockCheckError: new Error("connection reset") });
    await expect(followDatabase.follow(CURIE, TESLA)).rejects.toThrow("connection reset");
    const insertCalls = mockQuery.mock.calls.filter(([sql]) =>
      String(sql).includes("INSERT INTO follows"),
    );
    expect(insertCalls).toHaveLength(0);
  });

  it("creates the edge: Marie Curie follows Nikola Tesla", async () => {
    primeFollowPath({ insertRowCount: 1 });
    const result = await followDatabase.follow(CURIE, TESLA);
    expect(result).toEqual({ ok: true, created: true, followeeIsAgent: false });
  });

  it("is idempotent — re-following a standing edge reports created: false", async () => {
    primeFollowPath({ insertRowCount: 0 });
    const result = await followDatabase.follow(CURIE, TESLA);
    expect(result).toEqual({ ok: true, created: false, followeeIsAgent: false });
  });

  it("reports agent followees so the route can skip bell + practice", async () => {
    primeFollowPath({ targetRows: [{ is_agent: true }], insertRowCount: 1 });
    const result = await followDatabase.follow(CURIE, TESLA);
    expect(result).toEqual({ ok: true, created: true, followeeIsAgent: true });
  });
});

describe("followDatabase.unfollow", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns true when an edge was removed, false when none existed", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 });
    expect(await followDatabase.unfollow(CURIE, TESLA)).toBe(true);
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });
    expect(await followDatabase.unfollow(CURIE, TESLA)).toBe(false);
  });
});

describe("followDatabase.purgeFollowsBetween", () => {
  beforeEach(() => jest.clearAllMocks());

  it("deletes edges in BOTH directions for the blocked pair", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 2 });
    const purged = await followDatabase.purgeFollowsBetween(CURIE, TESLA);
    expect(purged).toBe(2);
    const [sql, params] = mockQuery.mock.calls[0];
    expect(sql).toContain("DELETE FROM follows");
    expect(sql).toContain("follower_id = $1::uuid AND followee_id = $2::uuid");
    expect(sql).toContain("follower_id = $2::uuid AND followee_id = $1::uuid");
    expect(params).toEqual([CURIE, TESLA]);
  });
});

describe("followDatabase counts & state", () => {
  beforeEach(() => jest.clearAllMocks());

  it("maps follower/following counts", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ followers: "3", following: "7" }] });
    expect(await followDatabase.getFollowCounts(TESLA)).toEqual({ followers: 3, following: 7 });
  });

  it("maps both directions of viewer↔target state", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ follows: true, followed_by: false }] });
    expect(await followDatabase.getFollowState(CURIE, TESLA)).toEqual({
      follows: true,
      followedBy: false,
    });
  });

  it("detects the first-ever follower row", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ n: "1" }] });
    expect(await followDatabase.hasExactlyOneFollower(TESLA)).toBe(true);
    mockQuery.mockResolvedValueOnce({ rows: [{ n: "4" }] });
    expect(await followDatabase.hasExactlyOneFollower(TESLA)).toBe(false);
  });
});

describe("followDatabase list reads", () => {
  beforeEach(() => jest.clearAllMocks());

  const teslaRow = {
    user_id: TESLA,
    created_at: new Date("2026-07-01T12:00:00Z"),
    name: "Nikola Tesla",
    avatar_url: null,
    is_agent: true,
    dominant_element: "Air",
    followed_by_viewer: true,
  };
  const jungRow = {
    user_id: JUNG,
    created_at: new Date("2026-06-30T12:00:00Z"),
    name: "Carl Jung",
    avatar_url: "https://assets.alchm.kitchen/avatars/jung/abc.jpg",
    is_agent: false,
    dominant_element: "Water",
    followed_by_viewer: false,
  };

  it("maps rows and never exposes an email column", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [teslaRow, jungRow] });
    const page = await followDatabase.listFollowers(CURIE, null, { limit: 30 });
    expect(page.entries).toEqual([
      {
        userId: TESLA,
        name: "Nikola Tesla",
        avatarUrl: null,
        isAgent: true,
        dominantElement: "Air",
        followedByViewer: true,
      },
      {
        userId: JUNG,
        name: "Carl Jung",
        avatarUrl: "https://assets.alchm.kitchen/avatars/jung/abc.jpg",
        isAgent: false,
        dominantElement: "Water",
        followedByViewer: false,
      },
    ]);
    // Partial page → no next cursor.
    expect(page.nextCursor).toBeNull();
    const [sql] = mockQuery.mock.calls[0];
    expect(sql).not.toMatch(/\bemail\b/i);
  });

  it("applies the viewer blocked-pair anti-join and emits a keyset cursor on full pages", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [teslaRow, jungRow] });
    const page = await followDatabase.listFollowers(CURIE, JUNG, { limit: 2 });
    const [sql, params] = mockQuery.mock.calls[0];
    expect(sql).toContain("NOT EXISTS");
    expect(sql).toContain("status = 'blocked'");
    expect(params).toContain(JUNG);
    expect(page.nextCursor).toEqual(expect.any(String));

    // Cursor round-trips into the keyset WHERE clause.
    mockQuery.mockResolvedValueOnce({ rows: [] });
    await followDatabase.listFollowers(CURIE, JUNG, { limit: 2, cursor: page.nextCursor });
    const [sql2, params2] = mockQuery.mock.calls[1];
    expect(sql2).toContain("< ($4::timestamptz, $5::uuid)");
    expect(params2).toContain(JUNG.toString());
    expect(params2[4]).toBe(JUNG); // last row's listed id
  });

  it("caps the limit at 50", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });
    await followDatabase.listFollowing(CURIE, null, { limit: 500 });
    const [, params] = mockQuery.mock.calls[0];
    expect(params[2]).toBe(50);
  });

  it("fails open to an empty page on read errors", async () => {
    mockQuery.mockRejectedValueOnce(new Error("boom"));
    const page = await followDatabase.listFollowers(CURIE, null, {});
    expect(page).toEqual({ entries: [], nextCursor: null });
  });
});
