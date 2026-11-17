/**
 * GET /api/admin/stream — Real-time Server-Sent Events admin stream tests.
 *
 * @file src/app/api/admin/stream/__tests__/route.test.ts
 */

jest.mock("@/lib/auth/validateRequest", () => ({
  validateAdminRequest: jest.fn(),
}));
jest.mock("@/services/admin/overviewPulseService", () => ({
  buildOverviewPulsePayload: jest.fn(),
}));

import { NextRequest, NextResponse } from "next/server";
import { GET, maxDuration } from "../route";
import { ADMIN_STREAM_INTERVAL_MS, OverviewPulseSchema } from "@/lib/admin/schemas/overviewPulse";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { buildOverviewPulsePayload } from "@/services/admin/overviewPulseService";

const mockAuth = jest.mocked(validateAdminRequest);
const mockBuildPulse = jest.mocked(buildOverviewPulsePayload);

describe("GET /api/admin/stream", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("enforces admin auth and propagates validateAdminRequest errors", async () => {
    mockAuth.mockResolvedValueOnce({
      error: NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 }),
    });
    const req = new NextRequest("https://alchm.kitchen/api/admin/stream?once=1");
    const res = await GET(req);
    expect(res.status).toBe(403);
    expect(mockBuildPulse).not.toHaveBeenCalled();
  });

  it("streams text/event-stream pulse frames passing OverviewPulseSchema and closes cleanly on abort", async () => {
    mockAuth.mockResolvedValueOnce({
      user: { userId: "admin-1", email: "admin@alchm.kitchen", roles: ["admin"], scopes: [], iat: 0, exp: 0, iss: "test" },
    });
    mockBuildPulse.mockResolvedValue({
      success: true,
      generatedAt: "2026-11-16T22:00:00.000Z",
      pulse: null,
      liveActivity: {
        generatedAt: "2026-11-16T22:00:00.000Z",
        windowHours: 6,
        events: [],
        countsByCategory: { signup: 0, auth: 0, onboarding: 0, recipe: 0, economy: 0, agent: 0, diary: 0, visit: 0 },
        live: true,
      },
      systemStatus: null,
    });

    const controller = new AbortController();
    const req = new NextRequest("https://alchm.kitchen/api/admin/stream?once=1", { signal: controller.signal });
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/event-stream");
    expect(res.headers.get("cache-control")).toContain("no-cache");

    const text = await res.text();
    expect(maxDuration).toBe(60);
    expect(ADMIN_STREAM_INTERVAL_MS).toBeGreaterThanOrEqual(10_000);
    expect(mockBuildPulse).toHaveBeenCalledWith(1);
    expect(text).toContain("retry: 5000");
    expect(text).toContain("event: pulse");
    const dataLine = text.split("\n").find((l) => l.startsWith("data: "));
    expect(dataLine).toBeTruthy();
    const parsed = OverviewPulseSchema.parse(JSON.parse((dataLine ?? "data: {}").slice(6)));
    expect(parsed.generatedAt).toBe("2026-11-16T22:00:00.000Z");
  });

  it("skips overlapping interval ticks while an earlier pulse build is still in flight", async () => {
    jest.useFakeTimers();
    try {
      mockAuth.mockResolvedValueOnce({
        user: { userId: "admin-1", email: "admin@alchm.kitchen", roles: ["admin"], scopes: [], iat: 0, exp: 0, iss: "test" },
      });

      const emptyActivity = {
        generatedAt: "2026-11-16T22:00:00.000Z",
        windowHours: 6,
        events: [],
        countsByCategory: { signup: 0, auth: 0, onboarding: 0, recipe: 0, economy: 0, agent: 0, diary: 0, visit: 0 },
        live: true,
      };
      let resolveSlow: (() => void) | null = null;
      mockBuildPulse
        .mockResolvedValueOnce({
          success: true,
          generatedAt: "2026-11-16T22:00:00.000Z",
          pulse: null,
          liveActivity: emptyActivity,
          systemStatus: null,
        })
        .mockImplementationOnce(
          () =>
            new Promise((resolve) => {
              resolveSlow = () =>
                resolve({
                  success: true,
                  generatedAt: "2026-11-16T22:00:12.000Z",
                  pulse: null,
                  liveActivity: emptyActivity,
                  systemStatus: null,
                });
            }),
        );

      const controller = new AbortController();
      const req = new NextRequest("https://alchm.kitchen/api/admin/stream", { signal: controller.signal });
      const res = await GET(req);
      const reader = res.body?.getReader();

      // Initial frame emitted on start()
      await reader?.read();
      expect(mockBuildPulse).toHaveBeenCalledTimes(1);

      // First interval tick starts a slow build; second interval tick arrives while
      // it is still pending and must be skipped.
      await jest.advanceTimersByTimeAsync(ADMIN_STREAM_INTERVAL_MS);
      expect(mockBuildPulse).toHaveBeenCalledTimes(2);
      await jest.advanceTimersByTimeAsync(ADMIN_STREAM_INTERVAL_MS);
      expect(mockBuildPulse).toHaveBeenCalledTimes(2);

      resolveSlow?.();
      controller.abort();
      await reader?.cancel();
    } finally {
      jest.useRealTimers();
    }
  });
});
