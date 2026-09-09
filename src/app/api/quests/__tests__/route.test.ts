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
import { POST } from "@/app/api/quests/route";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { questService } from "@/services/QuestService";

const mockedGetUserId = jest.mocked(getUserIdFromRequest);
const mockedReportEvent = jest.mocked(questService.reportEvent);

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
