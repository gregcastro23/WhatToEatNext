/**
 * POST /api/track/feedback — contextual micro-feedback tests.
 *
 * @file src/app/api/track/feedback/__tests__/route.test.ts
 */

jest.mock("@/services/admin/trafficAnalyticsService", () => ({
  recordSessionFeedback: jest.fn(),
}));
jest.mock("@/lib/rateLimit", () => ({ rateLimit: jest.fn() }));
jest.mock("@/lib/auth/auth", () => ({ auth: jest.fn() }));
jest.mock("@/lib/database/connection", () => ({ executeQuery: jest.fn() }));

import { NextRequest } from "next/server";
import { POST } from "../route";
import { auth } from "@/lib/auth/auth";
import { rateLimit } from "@/lib/rateLimit";
import { recordSessionFeedback } from "@/services/admin/trafficAnalyticsService";

const mockRecord = jest.mocked(recordSessionFeedback);
const mockRateLimit = jest.mocked(rateLimit);
const mockAuth = jest.mocked(auth);

const CHROME =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

function feedbackReq(body: unknown, headers: Record<string, string> = {}): NextRequest {
  return new NextRequest("https://alchm.kitchen/api/track/feedback", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "user-agent": CHROME,
      "x-forwarded-for": "203.0.113.7",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/track/feedback", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockRateLimit.mockResolvedValue({ allowed: true, remaining: 14, resetMs: 60_000 });
    mockRecord.mockResolvedValue(true);
    mockAuth.mockResolvedValue(null);
  });

  it("validates and records contextual feedback linked to viewId and sessionId", async () => {
    const res = await POST(
      feedbackReq({
        viewId: "view_1234567890",
        sessionId: "sess_1234567890",
        path: "/menu-planner?ref=alex",
        refTag: "Alex-Review",
        rating: 4,
        note: "Swap button felt slow on mobile",
      }),
    );
    expect(res.status).toBe(200);
    expect(mockRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        viewId: "view_1234567890",
        sessionId: "sess_1234567890",
        path: "/menu-planner",
        refTag: "alex-review",
        rating: 4,
        note: "Swap button felt slow on mobile",
      }),
    );
  });

  it("rejects empty notes or cross-site requests", async () => {
    expect((await POST(feedbackReq({ path: "/", note: "x" }))).status).toBe(400);
    expect(
      (await POST(feedbackReq({ path: "/", note: "valid note" }, { "sec-fetch-site": "cross-site" }))).status,
    ).toBe(403);
    expect(mockRecord).not.toHaveBeenCalled();
  });
});
