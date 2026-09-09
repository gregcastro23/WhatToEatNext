/**
 * Route handler tests for POST /api/quests/claim.
 *
 * @file src/app/api/quests/claim/__tests__/route.test.ts
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
    claimQuestReward: jest.fn(),
  },
}));

import { NextRequest } from "next/server";
import { POST } from "../route";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { questService } from "@/services/QuestService";

const mockedGetUserId = jest.mocked(getUserIdFromRequest);
const mockedClaimReward = jest.mocked(questService.claimQuestReward);

const USER_ID = "33333333-3333-3333-3333-333333333333";

function makeClaimRequest(json?: unknown): NextRequest {
  return new NextRequest("http://localhost:3000/api/quests/claim", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: json !== undefined ? JSON.stringify(json) : undefined,
  });
}

beforeEach(() => {
  mockedGetUserId.mockReset();
  mockedClaimReward.mockReset();
});

describe("POST /api/quests/claim", () => {
  it("401s when unauthenticated", async () => {
    mockedGetUserId.mockResolvedValueOnce(null);
    const res = await POST(
      makeClaimRequest({ questSlug: "daily-login" }),
    );
    expect(res.status).toBe(401);
  });

  it("400s on invalid JSON body", async () => {
    mockedGetUserId.mockResolvedValueOnce(USER_ID);
    const res = await POST(
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
    const res = await POST(makeClaimRequest({}));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.message).toContain("questSlug is required");
  });

  it("400s when reward claim fails in service", async () => {
    mockedGetUserId.mockResolvedValueOnce(USER_ID);
    mockedClaimReward.mockResolvedValueOnce({
      success: false,
      message: "Quest not completed",
    });

    const res = await POST(
      makeClaimRequest({ questSlug: "daily-login" }),
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.message).toBe("Quest not completed");
  });

  it("claims reward successfully", async () => {
    mockedGetUserId.mockResolvedValueOnce(USER_ID);
    mockedClaimReward.mockResolvedValueOnce({
      success: true,
      message: "Reward claimed!",
    });

    const res = await POST(
      makeClaimRequest({
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
