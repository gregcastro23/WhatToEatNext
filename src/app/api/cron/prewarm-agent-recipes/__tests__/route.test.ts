/**
 * @jest-environment node
 *
 * GET /api/cron/prewarm-agent-recipes — records an honest heartbeat and hands
 * the service a deadline that leaves room to write it.
 */

jest.mock("@/app/api/cron/_lib/cronAuth", () => ({ isAuthorizedCron: (): boolean => true }));
jest.mock("@/services/agentRecipePrewarm", () => ({ prewarmAgentRecipes: jest.fn() }));
jest.mock("@/services/cronHeartbeatService", () => ({ recordCronRun: jest.fn() }));

import { NextRequest } from "next/server";
import { GET, maxDuration } from "../route";
import { prewarmAgentRecipes } from "@/services/agentRecipePrewarm";
import { recordCronRun } from "@/services/cronHeartbeatService";

const mockPrewarm = jest.mocked(prewarmAgentRecipes);
const mockRecord = jest.mocked(recordCronRun);

function request(): NextRequest {
  return new NextRequest("https://alchm.kitchen/api/cron/prewarm-agent-recipes");
}

beforeEach(() => {
  mockPrewarm.mockReset();
  mockRecord.mockReset();
});

describe("prewarm-agent-recipes cron", () => {
  it("records a run that generated nothing as a failure, with its details", async () => {
    mockPrewarm.mockResolvedValue({ selected: 3, attempted: 2, generated: 0, skippedForBudget: 1 });
    await GET(request());
    expect(mockRecord).toHaveBeenCalledWith(
      "prewarm-agent-recipes",
      expect.objectContaining({
        status: "failure",
        error: "PA generated 0 of 2 attempted",
        details: { selected: 3, attempted: 2, generated: 0, skippedForBudget: 1 },
      }),
    );
  });

  it("records success when at least one recipe landed", async () => {
    mockPrewarm.mockResolvedValue({ selected: 3, attempted: 1, generated: 1, skippedForBudget: 2 });
    await GET(request());
    const [, opts] = mockRecord.mock.calls[0] ?? [];
    expect(opts?.status).toBe("success");
    expect(opts?.error).toBeUndefined();
  });

  it("finishes generating at least 10s before the function limit", async () => {
    mockPrewarm.mockResolvedValue({ selected: 0, attempted: 0, generated: 0, skippedForBudget: 0 });
    const before = Date.now();
    await GET(request());
    const [, deadline] = mockPrewarm.mock.calls[0] ?? [];
    expect(deadline).toBeDefined();
    expect(deadline ?? Infinity).toBeLessThanOrEqual(before + maxDuration * 1000 - 10_000 + 1_000);
    expect(deadline ?? 0).toBeGreaterThan(before + 30_000);
  });

  it("records a failure when the service throws", async () => {
    mockPrewarm.mockRejectedValue(new Error("Query read timeout"));
    const res = await GET(request());
    expect(res.status).toBe(500);
    expect(mockRecord).toHaveBeenCalledWith(
      "prewarm-agent-recipes",
      expect.objectContaining({ status: "failure", error: "Query read timeout" }),
    );
  });
});
