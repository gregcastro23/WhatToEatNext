/**
 * GET /api/users/:userId/followers + /following — public list reads.
 * Fixture identities are the historical-agent roster (design-spec §4.8).
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

jest.mock("@/lib/redis", () => ({
  getRedisClient: () => null,
}));

jest.mock("@/lib/auth/validateRequest", () => ({
  getUserIdFromRequest: jest.fn(() => Promise.resolve(null)),
}));

jest.mock("@/services/followDatabaseService", () => ({
  followDatabase: {
    listFollowers: jest.fn(),
    listFollowing: jest.fn(),
  },
}));

import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { followDatabase } from "@/services/followDatabaseService";
import { GET as GET_FOLLOWERS } from "../route";
import { GET as GET_FOLLOWING } from "../../following/route";

const TESLA = "22222222-2222-2222-2222-222222222222"; // Nikola Tesla (profile owner)
const CURIE = "11111111-1111-1111-1111-111111111111"; // Marie Curie (viewer)

const curieEntry = {
  userId: CURIE,
  name: "Marie Curie",
  avatarUrl: null,
  isAgent: false,
  dominantElement: "Water",
  followedByViewer: false,
};

let ipCounter = 0;
function makeRequest(url: string, ip?: string): any {
  const addr = ip ?? `10.10.${Math.floor(++ipCounter / 250)}.${ipCounter % 250}`;
  return {
    url,
    method: "GET",
    nextUrl: { pathname: new URL(url).pathname },
    headers: {
      get: (key: string) => (key.toLowerCase() === "x-forwarded-for" ? addr : null),
    },
  };
}

const params = (userId: string) => ({ params: Promise.resolve({ userId }) });

describe("GET /api/users/:userId/followers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getUserIdFromRequest as jest.Mock).mockResolvedValue(null);
    (followDatabase.listFollowers as jest.Mock).mockResolvedValue({
      entries: [curieEntry],
      nextCursor: null,
    });
  });

  it("400s on a non-uuid userId", async () => {
    const res = await GET_FOLLOWERS(
      makeRequest("http://localhost/api/users/nikola/followers"),
      params("nikola"),
    );
    expect(res.status).toBe(400);
  });

  it("returns Nikola Tesla's followers to an anonymous viewer", async () => {
    const res = await GET_FOLLOWERS(
      makeRequest(`http://localhost/api/users/${TESLA}/followers`),
      params(TESLA),
    );
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.followers).toEqual([curieEntry]);
    expect(data.nextCursor).toBeNull();
    expect(followDatabase.listFollowers).toHaveBeenCalledWith(TESLA, null, {
      limit: undefined,
      cursor: null,
    });
    // A list entry must never carry an email.
    expect(JSON.stringify(data)).not.toMatch(/@/);
  });

  it("passes the authenticated viewer plus limit/cursor through", async () => {
    (getUserIdFromRequest as jest.Mock).mockResolvedValue(CURIE);
    await GET_FOLLOWERS(
      makeRequest(`http://localhost/api/users/${TESLA}/followers?limit=10&cursor=abc`),
      params(TESLA),
    );
    expect(followDatabase.listFollowers).toHaveBeenCalledWith(TESLA, CURIE, {
      limit: 10,
      cursor: "abc",
    });
  });

  it("rate limits per IP at 60/min", async () => {
    const IP = "203.0.113.42";
    for (let i = 0; i < 60; i++) {
      const res = await GET_FOLLOWERS(
        makeRequest(`http://localhost/api/users/${TESLA}/followers`, IP),
        params(TESLA),
      );
      expect(res.status).toBe(200);
    }
    const res = await GET_FOLLOWERS(
      makeRequest(`http://localhost/api/users/${TESLA}/followers`, IP),
      params(TESLA),
    );
    expect(res.status).toBe(429);
  });
});

describe("GET /api/users/:userId/following", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getUserIdFromRequest as jest.Mock).mockResolvedValue(null);
    (followDatabase.listFollowing as jest.Mock).mockResolvedValue({
      entries: [curieEntry],
      nextCursor: "next-page",
    });
  });

  it("returns who Nikola Tesla follows, with the next cursor", async () => {
    const res = await GET_FOLLOWING(
      makeRequest(`http://localhost/api/users/${TESLA}/following`),
      params(TESLA),
    );
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.following).toEqual([curieEntry]);
    expect(data.nextCursor).toBe("next-page");
  });

  it("500s cleanly when the service read throws", async () => {
    (followDatabase.listFollowing as jest.Mock).mockRejectedValue(new Error("boom"));
    const res = await GET_FOLLOWING(
      makeRequest(`http://localhost/api/users/${TESLA}/following`),
      params(TESLA),
    );
    expect(res.status).toBe(500);
  });
});
