/**
 * POST/DELETE /api/follows — follow graph writes.
 * Fixture identities are the historical-agent roster (design-spec §4.8):
 * Marie Curie follows Nikola Tesla.
 */

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({
      status: init?.status ?? 200,
      json: async () => body,
      headers: init?.headers ?? {},
    })),
  },
}));

// Force the rate limiter onto its in-memory fallback (no Redis in tests).
jest.mock("@/lib/redis", () => ({
  getRedisClient: () => null,
}));

jest.mock("@/lib/database", () => ({
  executeQuery: jest.fn(),
}));

jest.mock("@/lib/auth/validateRequest", () => ({
  getUserIdFromRequest: jest.fn(),
}));

jest.mock("@/services/followDatabaseService", () => ({
  followDatabase: {
    follow: jest.fn(),
    unfollow: jest.fn(),
    hasExactlyOneFollower: jest.fn(),
  },
}));

jest.mock("@/services/notificationDatabaseService", () => ({
  notificationDatabase: {
    createNotification: jest.fn(),
  },
}));

jest.mock("@/services/practiceRewardService", () => ({
  practiceRewardService: {
    recognize: jest.fn(),
  },
}));

import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { executeQuery } from "@/lib/database";
import { followDatabase } from "@/services/followDatabaseService";
import { notificationDatabase } from "@/services/notificationDatabaseService";
import { practiceRewardService } from "@/services/practiceRewardService";
import { DELETE, POST } from "../route";

const CURIE = "11111111-1111-1111-1111-111111111111"; // Marie Curie (follower)
const TESLA = "22222222-2222-2222-2222-222222222222"; // Nikola Tesla (followee)

let ipCounter = 0;
function makeRequest(body?: unknown, url = "http://localhost/api/follows"): any {
  const addr = `10.9.${Math.floor(++ipCounter / 250)}.${ipCounter % 250}`;
  return {
    url,
    method: "POST",
    nextUrl: { pathname: "/api/follows" },
    json: async () => {
      if (body === undefined) throw new Error("no body");
      return body;
    },
    headers: {
      get: (key: string) => (key.toLowerCase() === "x-forwarded-for" ? addr : null),
    },
  };
}

describe("POST /api/follows", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getUserIdFromRequest as jest.Mock).mockResolvedValue(CURIE);
    (followDatabase.follow as jest.Mock).mockResolvedValue({
      ok: true,
      created: true,
      followeeIsAgent: false,
    });
    (followDatabase.hasExactlyOneFollower as jest.Mock).mockResolvedValue(false);
    (practiceRewardService.recognize as jest.Mock).mockResolvedValue({ rewarded: false });
    // Dedup check: no recent new_follower bell; name lookup: Marie Curie.
    (executeQuery as jest.Mock).mockImplementation((sql: string) => {
      if (sql.includes("FROM notifications")) return Promise.resolve({ rows: [] });
      return Promise.resolve({ rows: [{ name: "Marie Curie" }] });
    });
  });

  it("requires authentication", async () => {
    (getUserIdFromRequest as jest.Mock).mockResolvedValue(null);
    const res = await POST(makeRequest({ targetUserId: TESLA }));
    expect(res.status).toBe(401);
  });

  it("400s on a missing or malformed targetUserId", async () => {
    const res = await POST(makeRequest({ targetUserId: "not-a-uuid" }));
    expect(res.status).toBe(400);
  });

  it("400s on self-follow", async () => {
    (followDatabase.follow as jest.Mock).mockResolvedValue({ ok: false, reason: "self" });
    const res = await POST(makeRequest({ targetUserId: CURIE }));
    expect(res.status).toBe(400);
  });

  it("404s when the target does not exist", async () => {
    (followDatabase.follow as jest.Mock).mockResolvedValue({ ok: false, reason: "not_found" });
    const res = await POST(makeRequest({ targetUserId: TESLA }));
    expect(res.status).toBe(404);
  });

  it("403s with a GENERIC message on blocked pairs (never reveals direction)", async () => {
    (followDatabase.follow as jest.Mock).mockResolvedValue({ ok: false, reason: "blocked" });
    const res = await POST(makeRequest({ targetUserId: TESLA }));
    const data = await res.json();
    expect(res.status).toBe(403);
    expect(data.message).toBe("Cannot follow this user");
  });

  it("500s (fail-closed) when the service throws — e.g. the block check failed", async () => {
    (followDatabase.follow as jest.Mock).mockRejectedValue(new Error("block check down"));
    const res = await POST(makeRequest({ targetUserId: TESLA }));
    expect(res.status).toBe(500);
  });

  it("Marie Curie follows Nikola Tesla: creates edge, recognizes follow_made, sends the bell", async () => {
    (practiceRewardService.recognize as jest.Mock).mockResolvedValue({
      rewarded: true,
      tokenType: "Spirit",
      amount: 0.5,
      hint: "A thread tied between charts",
    });
    const res = await POST(makeRequest({ targetUserId: TESLA }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toMatchObject({ success: true, following: true, created: true });
    expect(data.reward).toEqual({
      tokenType: "Spirit",
      amount: 0.5,
      hint: "A thread tied between charts",
    });
    expect(practiceRewardService.recognize).toHaveBeenCalledWith(CURIE, "follow_made", TESLA);
    expect(notificationDatabase.createNotification).toHaveBeenCalledWith(
      TESLA,
      "new_follower",
      "New Follower",
      "Marie Curie now follows your work",
      { relatedUserId: CURIE, metadata: { followerUserId: CURIE } },
    );
  });

  it("recognizes first_follower_gained for the followee's first-ever follower", async () => {
    (followDatabase.hasExactlyOneFollower as jest.Mock).mockResolvedValue(true);
    await POST(makeRequest({ targetUserId: TESLA }));
    expect(practiceRewardService.recognize).toHaveBeenCalledWith(TESLA, "first_follower_gained");
  });

  it("re-follow of a standing edge is a quiet no-op: no bell, no practice", async () => {
    (followDatabase.follow as jest.Mock).mockResolvedValue({
      ok: true,
      created: false,
      followeeIsAgent: false,
    });
    const res = await POST(makeRequest({ targetUserId: TESLA }));
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.created).toBe(false);
    expect(practiceRewardService.recognize).not.toHaveBeenCalled();
    expect(notificationDatabase.createNotification).not.toHaveBeenCalled();
  });

  it("suppresses the bell when the same pair was notified within 30 days", async () => {
    (executeQuery as jest.Mock).mockImplementation((sql: string) => {
      if (sql.includes("FROM notifications")) return Promise.resolve({ rows: [{ id: "notif_1" }] });
      return Promise.resolve({ rows: [{ name: "Marie Curie" }] });
    });
    const res = await POST(makeRequest({ targetUserId: TESLA }));
    expect(res.status).toBe(200);
    expect(notificationDatabase.createNotification).not.toHaveBeenCalled();
    // The follower's own practice still pays — churn dedup is bell-only.
    expect(practiceRewardService.recognize).toHaveBeenCalledWith(CURIE, "follow_made", TESLA);
  });

  it("agent followees get no bell and no first_follower practice", async () => {
    (followDatabase.follow as jest.Mock).mockResolvedValue({
      ok: true,
      created: true,
      followeeIsAgent: true,
    });
    (followDatabase.hasExactlyOneFollower as jest.Mock).mockResolvedValue(true);
    const res = await POST(makeRequest({ targetUserId: TESLA }));
    expect(res.status).toBe(200);
    expect(notificationDatabase.createNotification).not.toHaveBeenCalled();
    expect(practiceRewardService.recognize).toHaveBeenCalledTimes(1);
    expect(practiceRewardService.recognize).toHaveBeenCalledWith(CURIE, "follow_made", TESLA);
  });
});

describe("DELETE /api/follows", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getUserIdFromRequest as jest.Mock).mockResolvedValue(CURIE);
    (followDatabase.unfollow as jest.Mock).mockResolvedValue(true);
  });

  it("unfollows idempotently — success even when no edge existed", async () => {
    (followDatabase.unfollow as jest.Mock).mockResolvedValue(false);
    const res = await DELETE(makeRequest({ targetUserId: TESLA }));
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data).toEqual({ success: true, following: false });
  });

  it("accepts the target in the query string when there is no body", async () => {
    const res = await DELETE(
      makeRequest(undefined, `http://localhost/api/follows?targetUserId=${TESLA}`),
    );
    expect(res.status).toBe(200);
    expect(followDatabase.unfollow).toHaveBeenCalledWith(CURIE, TESLA);
  });

  it("requires authentication", async () => {
    (getUserIdFromRequest as jest.Mock).mockResolvedValue(null);
    const res = await DELETE(makeRequest({ targetUserId: TESLA }));
    expect(res.status).toBe(401);
  });
});
