/**
 * GET /api/admin/overview-pulse — multiplexed overview endpoint tests.
 * Verifies graceful partial degradation when any sub-source times out or fails.
 *
 * @file src/app/api/admin/overview-pulse/__tests__/route.test.ts
 */

jest.mock("@/lib/auth/validateRequest", () => ({
  validateAdminRequest: jest.fn(),
}));
jest.mock("@/lib/cache/memoryCache", () => ({
  memoize: jest.fn((_key: string, _ttl: number, fn: () => Promise<unknown>) => fn()),
}));
jest.mock("@/services/admin/adminPulseService", () => ({
  getAdminPulse: jest.fn(),
}));
jest.mock("@/services/liveActivityService", () => ({
  getLiveActivity: jest.fn(),
}));
jest.mock("@/services/systemStatusService", () => ({
  getSystemStatus: jest.fn(),
}));
jest.mock("@/services/admin/trafficReaders", () => ({
  readFrictionAlerts: jest.fn(),
  readInteractionTallies: jest.fn(),
}));

import { NextRequest } from "next/server";
import { GET } from "../route";
import { OverviewPulseResponseSchema } from "@/lib/admin/schemas/overviewPulse";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { getAdminPulse } from "@/services/admin/adminPulseService";
import { readFrictionAlerts, readInteractionTallies } from "@/services/admin/trafficReaders";
import { getLiveActivity } from "@/services/liveActivityService";
import { getSystemStatus } from "@/services/systemStatusService";

const mockAuth = jest.mocked(validateAdminRequest);
const mockPulse = jest.mocked(getAdminPulse);
const mockActivity = jest.mocked(getLiveActivity);
const mockStatus = jest.mocked(getSystemStatus);
const mockFriction = jest.mocked(readFrictionAlerts);
const mockTallies = jest.mocked(readInteractionTallies);

const req = (): NextRequest => new NextRequest("https://alchm.kitchen/api/admin/overview-pulse");

describe("GET /api/admin/overview-pulse", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth.mockResolvedValue({
      user: {
        userId: "admin-1",
        email: "admin@alchm.kitchen",
        roles: ["admin"],
        scopes: [],
        iat: 0,
        exp: 0,
        iss: "test",
      },
    });
  });

  it("degrades gracefully when a sub-query rejects, returning partial telemetry that passes OverviewPulseResponseSchema", async () => {
    mockPulse.mockRejectedValue(new Error("Stripe timeout"));
    mockActivity.mockResolvedValue({
      generatedAt: "2026-11-16T00:00:00.000Z",
      windowHours: 6,
      events: [],
      countsByCategory: {
        signup: 0,
        auth: 0,
        onboarding: 0,
        recipe: 0,
        economy: 0,
        agent: 0,
        diary: 0,
        visit: 1,
      },
      live: true,
    });
    mockStatus.mockResolvedValue({
      generatedAt: "2026-11-16T00:00:00.000Z",
      overall: "OK",
      flows: [],
      dependencies: [],
    });
    mockFriction.mockResolvedValue({
      errorSessions60m: 3,
      errorBurstTriggered: true,
      topErrorTag: "error:api_500:search",
      topZeroResultQuery: { slug: "yuzu_kosho", sessions: 2 },
      activeReviewers: [
        {
          sessionKey: "sess-1",
          refTag: "alex-feedback",
          path: "/menu-planner",
          lastSeenAt: "2026-11-16T00:00:00.000Z",
          visitorHash: "a4f9c2001122334455667788",
        },
      ],
    });

    mockTallies.mockResolvedValue({
      totalInteractions: 12,
      totalSessionsWithInteractions: 5,
      categories: [{ category: "plan", totalCount: 12, uniqueSessions: 5, sessionReachPct: 0.5 }],
      rows: [
        {
          tag: "plan:fill_week",
          category: "plan",
          tone: "feature",
          totalCount: 12,
          uniqueViews: 7,
          uniqueSessions: 5,
          uniqueVisitors: 4,
          sessionReachPct: 0.5,
          avgDwellMs: 38_000,
          topPath: "/menu-planner",
          lastSeenAt: "2026-11-16T00:00:00.000Z",
        },
      ],
    });

    const res = await GET(req());
    expect(res.status).toBe(200);
    const body: unknown = await res.json();
    const parsed = OverviewPulseResponseSchema.safeParse(body);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.pulse).toBeNull();
      expect(parsed.data.liveActivity?.live).toBe(true);
      expect(parsed.data.systemStatus?.overall).toBe("OK");
      expect(parsed.data.frictionAlerts?.errorBurstTriggered).toBe(true);
      expect(parsed.data.frictionAlerts?.activeReviewers[0]?.refTag).toBe("alex-feedback");
      expect(parsed.data.interactionTallies?.totalInteractions).toBe(12);
      expect(parsed.data.interactionTallies?.rows[0]?.tag).toBe("plan:fill_week");
    }
  });

  it("degrades interactionTallies to null if readInteractionTallies rejects", async () => {
    mockPulse.mockRejectedValue(new Error("Stripe timeout"));
    mockActivity.mockResolvedValue({
      generatedAt: "2026-11-16T00:00:00.000Z",
      windowHours: 6,
      events: [],
      countsByCategory: {
        signup: 0,
        auth: 0,
        onboarding: 0,
        recipe: 0,
        economy: 0,
        agent: 0,
        diary: 0,
        visit: 0,
      },
      live: true,
    });
    mockStatus.mockResolvedValue({
      generatedAt: "2026-11-16T00:00:00.000Z",
      overall: "OK",
      flows: [],
      dependencies: [],
    });
    mockFriction.mockResolvedValue({
      errorSessions60m: 0,
      errorBurstTriggered: false,
      topErrorTag: null,
      topZeroResultQuery: null,
      activeReviewers: [],
    });
    mockTallies.mockRejectedValue(new Error("query timeout"));

    const res = await GET(req());
    expect(res.status).toBe(200);
    const body: unknown = await res.json();
    const parsed = OverviewPulseResponseSchema.safeParse(body);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.interactionTallies).toBeNull();
    }
  });
});
