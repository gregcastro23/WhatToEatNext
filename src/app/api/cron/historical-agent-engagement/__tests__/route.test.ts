/**
 * @jest-environment node
 *
 * GET /api/cron/historical-agent-engagement — enforces cron auth, hands deadline
 * headroom before maxDuration, and records an honest heartbeat.
 */

jest.mock("@/app/api/cron/_lib/cronAuth", () => ({
  isAuthorizedCron: jest.fn(),
}));
jest.mock("@/services/historicalAgentEngagementService", () => ({
  runHistoricalAgentEngagement: jest.fn(),
}));
jest.mock("@/services/cronHeartbeatService", () => ({
  recordCronRun: jest.fn(),
}));

import { NextRequest } from "next/server";
import { isAuthorizedCron } from "@/app/api/cron/_lib/cronAuth";
import { recordCronRun } from "@/services/cronHeartbeatService";
import { runHistoricalAgentEngagement } from "@/services/historicalAgentEngagementService";
import { GET, maxDuration } from "../route";

const mockAuth = jest.mocked(isAuthorizedCron);
const mockEngage = jest.mocked(runHistoricalAgentEngagement);
const mockRecord = jest.mocked(recordCronRun);

function req(): NextRequest {
  return new NextRequest("https://alchm.kitchen/api/cron/historical-agent-engagement");
}

describe("historical-agent-engagement cron", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth.mockReturnValue(true);
  });

  it("rejects unauthorized callers with 401", async () => {
    mockAuth.mockReturnValueOnce(false);
    const res = await GET(req());
    expect(res.status).toBe(401);
    expect(mockEngage).not.toHaveBeenCalled();
  });

  it("runs within maxDuration=60 headroom and records success heartbeat", async () => {
    mockEngage.mockResolvedValueOnce({
      agentsEligible: 72,
      yieldsClaimed: 1,
      recipesReviewed: 3,
      reflectionsSaved: 3,
      feedCommentsPosted: 3,
      feedInsightsPosted: 2,
      errors: 0,
    });

    const before = Date.now();
    const res = await GET(req());
    expect(maxDuration).toBe(60);
    expect(res.status).toBe(200);
    const call = mockEngage.mock.calls[0]?.[0];
    expect(call?.deadlineMs).toBeGreaterThan(before + 30_000);
    expect(call?.deadlineMs).toBeLessThanOrEqual(before + maxDuration * 1000 - 12_000 + 1_000);
    expect(mockRecord).toHaveBeenCalledWith(
      "historical-agent-engagement",
      expect.objectContaining({ status: "success" }),
    );
  });

  it("records a failure heartbeat when eligible agents produce 0 actions", async () => {
    mockEngage.mockResolvedValueOnce({
      agentsEligible: 10,
      yieldsClaimed: 0,
      recipesReviewed: 0,
      reflectionsSaved: 0,
      feedCommentsPosted: 0,
      feedInsightsPosted: 0,
      errors: 3,
    });

    await GET(req());
    expect(mockRecord).toHaveBeenCalledWith(
      "historical-agent-engagement",
      expect.objectContaining({
        status: "failure",
        error: "Historical agent engagement produced 0 feed/recipe actions",
      }),
    );
  });
});
