/**
 * Route handler tests for /api/quests (GET, POST) and /api/quests/claim (POST).
 *
 * @file src/app/api/quests/__tests__/route.test.ts
 */

jest.mock("@/lib/auth/validateRequest", () => ({
  getUserIdFromRequest: jest.fn(),
}));

jest.mock("@/lib/rateLimit", () => ({
  rateLimit: jest
    .fn()
    .mockResolvedValue({ allowed: true, remaining: 100, resetMs: 60_000 }),
}));

jest.mock("@/services/QuestService", () => ({
  questService: {
    getQuestPanel: jest.fn(),
    reportEvent: jest.fn(),
    claimQuestReward: jest.fn(),
  },
}));

jest.mock("@/services/StreakService", () => ({
  streakService: {
    getStreak: jest.fn(),
  },
}));

import { NextRequest } from "next/server";
import { POST as claimPOST } from "@/app/api/quests/claim/route";
import { POST } from "@/app/api/quests/route";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { questService } from "@/services/QuestService";

const mockedGetUserId = jest.mocked(getUserIdFromRequest);
const mockedReportEvent = jest.mocked(questService.reportEvent);
const mockedClaimReward = jest.mocked(questService.claimQuestReward);

const USER_ID = "33333333-3333-3333-3333-333333333333";

function makeNextRequest(url: string, json?: unknown): NextRequest {
  return new NextRequest(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: json !== undefined ? JSON.stringify(json) : undefined,
  });
}

beforeEach(() => {
  mockedGetUserId.mockReset();
  mockedReportEvent.mockReset();
  mockedClaimReward.mockReset();
});

describe("POST /api/quests", () => {
  it("401s when unauthenticated", async () => {
    mockedGetUserId.mockResolvedValueOnce(null);
    const res = await POST(makeNextRequest("http://localhost:3000/api/quests", { event: "view_chart" }));
    expect(res.status).toBe(401);
  });

  it("400s on invalid JSON body", async () => {
    mockedGetUserId.mockResolvedValueOnce(USER_ID);
    const res = await POST(
      new NextRequest("http://localhost:3000/api/quests", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "not json",
      }),
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.message).toContain("Invalid request body");
  });

  it("400s on missing event", async () => {
    mockedGetUserId.mockResolvedValueOnce(USER_ID);
    const res = await POST(makeNextRequest("http://localhost:3000/api/quests", {}));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.message).toContain("event is required");
  });

  it("reports event successfully", async () => {
    mockedGetUserId.mockResolvedValueOnce(USER_ID);
    mockedReportEvent.mockResolvedValueOnce([]);

    const res = await POST(makeNextRequest("http://localhost:3000/api/quests", { event: "cook_recipe" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(mockedReportEvent).toHaveBeenCalledWith(USER_ID, "cook_recipe");
  });
});

describe("POST /api/quests/claim", () => {
  it("401s when unauthenticated", async () => {
    mockedGetUserId.mockResolvedValueOnce(null);
    const res = await claimPOST(makeNextRequest("http://localhost:3000/api/quests/claim", { questSlug: "daily-login" }));
    expect(res.status).toBe(401);
  });

  it("400s on invalid JSON body", async () => {
    mockedGetUserId.mockResolvedValueOnce(USER_ID);
    const res = await claimPOST(
      new NextRequest("http://localhost:3000/api/quests/claim", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "not json",
      }),
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.message).toContain("Invalid request body");
  });

  it("400s on missing questSlug", async () => {
    mockedGetUserId.mockResolvedValueOnce(USER_ID);
    const res = await claimPOST(makeNextRequest("http://localhost:3000/api/quests/claim", {}));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.message).toContain("questSlug is required");
  });

  it("claims reward successfully", async () => {
    mockedGetUserId.mockResolvedValueOnce(USER_ID);
    mockedClaimReward.mockResolvedValueOnce({
      success: true,
      message: "Reward claimed!",
    });

    const res = await claimPOST(
      makeNextRequest("http://localhost:3000/api/quests/claim", {
        questSlug: "daily-login",
        periodStart: "2026-09-09T00:00:00.000Z",
      }),
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(mockedClaimReward).toHaveBeenCalledWith(
      USER_ID,
      "daily-login",
      "2026-09-09T00:00:00.000Z",
    );
  });
});
