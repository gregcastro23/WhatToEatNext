/**
 * GET/POST /api/feed/comments — enforcement matrix (PR 5).
 * Fixture identities are the historical-agent roster (design-spec §4.8):
 * Marie Curie comments on Nikola Tesla's dish.
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

jest.mock("@/lib/redis", () => ({ getRedisClient: () => null }));

// Mock the limiter: identifier is the userId (CURIE) here, so the real
// in-memory limiter's burst guard (3/10s) would throttle repeated tests.
jest.mock("@/lib/rateLimit", () => ({
  rateLimit: jest.fn().mockResolvedValue({ allowed: true }),
}));

jest.mock("@/lib/auth/validateRequest", () => ({
  getUserIdFromRequest: jest.fn(),
}));

jest.mock("@/lib/database", () => ({ executeQuery: jest.fn() }));

jest.mock("@/lib/feed/commentEnforcement", () => ({
  sanitizeCommentBody: jest.fn((raw) => (typeof raw === "string" && raw.trim() ? raw.trim() : null)),
  isBlockedBetween: jest.fn(),
}));

jest.mock("@/services/feedCommentsDatabaseService", () => ({
  feedCommentsDatabase: {
    getEventActor: jest.fn(),
    createComment: jest.fn(),
    listComments: jest.fn(),
  },
}));

jest.mock("@/services/practiceRewardService", () => ({
  practiceRewardService: { recognize: jest.fn() },
}));

import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { executeQuery } from "@/lib/database";
import { isBlockedBetween } from "@/lib/feed/commentEnforcement";
import { feedCommentsDatabase } from "@/services/feedCommentsDatabaseService";
import { practiceRewardService } from "@/services/practiceRewardService";
import { POST } from "../route";

const CURIE = "11111111-1111-4111-8111-111111111111"; // commenter
const TESLA = "22222222-2222-4222-8222-222222222222"; // event actor
const EVENT = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

let ipCounter = 0;
function makeRequest(body: unknown): any {
  const addr = `10.5.${Math.floor(++ipCounter / 250)}.${ipCounter % 250}`;
  return {
    url: "http://localhost/api/feed/comments",
    method: "POST",
    nextUrl: { pathname: "/api/feed/comments" },
    json: async () => body,
    headers: { get: (k: string) => (k.toLowerCase() === "x-forwarded-for" ? addr : null) },
  };
}

const canonicalComment = {
  id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
  eventId: EVENT,
  authorId: CURIE,
  authorName: "Marie Curie",
  authorImage: null,
  authorIsAgent: false,
  authorElement: "Water",
  body: "Exquisite",
  createdAt: "2026-07-03T10:00:00Z",
  isEventActor: false,
};

describe("POST /api/feed/comments — enforcement", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getUserIdFromRequest as jest.Mock).mockResolvedValue(CURIE);
    (feedCommentsDatabase.getEventActor as jest.Mock).mockResolvedValue(TESLA);
    (feedCommentsDatabase.createComment as jest.Mock).mockResolvedValue(canonicalComment);
    (isBlockedBetween as jest.Mock).mockResolvedValue(false);
    (practiceRewardService.recognize as jest.Mock).mockResolvedValue({ rewarded: false });
    (executeQuery as jest.Mock).mockResolvedValue({ rows: [{ is_agent: false }] });
  });

  it("401s an anonymous commenter", async () => {
    (getUserIdFromRequest as jest.Mock).mockResolvedValue(null);
    const res = await POST(makeRequest({ eventId: EVENT, body: "hi" }));
    expect(res.status).toBe(401);
  });

  it("404s a missing event", async () => {
    (feedCommentsDatabase.getEventActor as jest.Mock).mockResolvedValue(null);
    const res = await POST(makeRequest({ eventId: EVENT, body: "hi" }));
    expect(res.status).toBe(404);
    expect(feedCommentsDatabase.createComment).not.toHaveBeenCalled();
  });

  it("403s (neutral) when commenter ↔ event actor are blocked either direction", async () => {
    (isBlockedBetween as jest.Mock).mockResolvedValue(true);
    const res = await POST(makeRequest({ eventId: EVENT, body: "hi" }));
    const body = await res.json();
    expect(res.status).toBe(403);
    expect(body.message).toBe("Cannot comment on this post"); // neutral, no who-blocked-whom
    expect(feedCommentsDatabase.createComment).not.toHaveBeenCalled();
  });

  it("400s an empty body", async () => {
    const res = await POST(makeRequest({ eventId: EVENT, body: "   " }));
    expect(res.status).toBe(400);
  });

  it("creates the comment and recognizes BOTH practices anchored to eventId", async () => {
    const res = await POST(makeRequest({ eventId: EVENT, body: "Exquisite" }));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.comment.id).toBe(canonicalComment.id);
    expect(practiceRewardService.recognize).toHaveBeenCalledWith(CURIE, "comment_posted", EVENT);
    expect(practiceRewardService.recognize).toHaveBeenCalledWith(TESLA, "work_discussed", EVENT);
  });

  it("skips work_discussed when the commenter IS the event actor (self)", async () => {
    (getUserIdFromRequest as jest.Mock).mockResolvedValue(TESLA); // Tesla comments on own dish
    await POST(makeRequest({ eventId: EVENT, body: "my own note" }));
    expect(practiceRewardService.recognize).toHaveBeenCalledWith(TESLA, "comment_posted", EVENT);
    expect(practiceRewardService.recognize).not.toHaveBeenCalledWith(TESLA, "work_discussed", EVENT);
  });

  it("skips work_discussed when the event actor is an agent", async () => {
    (executeQuery as jest.Mock).mockResolvedValue({ rows: [{ is_agent: true }] });
    await POST(makeRequest({ eventId: EVENT, body: "great" }));
    expect(practiceRewardService.recognize).toHaveBeenCalledWith(CURIE, "comment_posted", EVENT);
    expect(practiceRewardService.recognize).not.toHaveBeenCalledWith(TESLA, "work_discussed", EVENT);
  });

  it("surfaces the commenter's reward when the practice pays", async () => {
    (practiceRewardService.recognize as jest.Mock).mockImplementation((_u: string, type: string) =>
      type === "comment_posted"
        ? Promise.resolve({ rewarded: true, tokenType: "Spirit", amount: 0.5, hint: "A word left at the table lingers" })
        : Promise.resolve({ rewarded: false }),
    );
    const res = await POST(makeRequest({ eventId: EVENT, body: "Exquisite" }));
    const body = await res.json();
    expect(body.reward).toEqual({ tokenType: "Spirit", amount: 0.5, hint: "A word left at the table lingers" });
  });
});
