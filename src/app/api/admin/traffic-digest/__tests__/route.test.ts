/** @jest-environment node */
/**
 * Integration tests for GET /api/admin/traffic-digest + trafficDigestService.
 *
 * @file src/app/api/admin/traffic-digest/__tests__/route.test.ts
 */

import { NextRequest, NextResponse } from "next/server";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { clearAll } from "@/lib/cache/memoryCache";
import { resetTrafficDigestCooldownForTests } from "@/services/admin/trafficDigestService";
import {
  readActivationAndStickiness,
  readFrictionAlerts,
  readInteractionTallies,
  readRouteFlowMatrix,
  readSessionFeedback,
  readTotals,
} from "@/services/admin/trafficReaders";
import { GET } from "../route";

jest.mock("@/lib/auth/validateRequest", () => ({
  validateAdminRequest: jest.fn(),
}));

jest.mock("@/services/admin/trafficReaders", () => ({
  readTotals: jest.fn(),
  readRouteFlowMatrix: jest.fn(),
  readFrictionAlerts: jest.fn(),
  readInteractionTallies: jest.fn(),
  readActivationAndStickiness: jest.fn(),
  readSessionFeedback: jest.fn(),
}));

const mockValidateAdmin = jest.mocked(validateAdminRequest);
const mockReadTotals = jest.mocked(readTotals);
const mockReadRouteFlow = jest.mocked(readRouteFlowMatrix);
const mockReadFrictionAlerts = jest.mocked(readFrictionAlerts);
const mockReadInteractionTallies = jest.mocked(readInteractionTallies);
const mockReadActivation = jest.mocked(readActivationAndStickiness);
const mockReadFeedback = jest.mocked(readSessionFeedback);

function allowAdmin(): void {
  mockValidateAdmin.mockResolvedValueOnce({
    user: {
      userId: "admin-1",
      email: "admin@alchm.kitchen",
      roles: ["admin"],
    },
  });
}

function stubHealthyReaders(): void {
  mockReadTotals
    .mockResolvedValueOnce({
      pageviews: 64,
      visitors: 22,
      sessions: 25,
      signedInUsers: 5,
      bounceRate: 0.2,
      pagesPerSession: 2.56,
    })
    .mockResolvedValueOnce({
      pageviews: 40,
      visitors: 16,
      sessions: 18,
      signedInUsers: 4,
      bounceRate: 0.25,
      pagesPerSession: 2.2,
    });
  mockReadRouteFlow.mockResolvedValueOnce([
    {
      path: "/menu-planner",
      totalViews: 28,
      uniqueSessions: 14,
      entryCount: 10,
      entryRatePct: 0.71,
      exitCount: 4,
      exitRatePct: 0.29,
      singlePageBounceRatePct: 0.2,
      avgDwellMs: 51_000,
      frictionCount: 2,
      topNextPaths: [{ path: "/recipes", count: 6 }],
    },
  ]);
  mockReadFrictionAlerts.mockResolvedValueOnce({
    errorSessions60m: 0,
    errorBurstTriggered: false,
    topErrorTag: null,
    topZeroResultQuery: { slug: "tempeh", sessions: 2 },
    activeReviewers: [],
  });
  mockReadInteractionTallies.mockResolvedValueOnce({
    totalInteractions: 14,
    totalSessionsWithInteractions: 9,
    categories: [{ category: "friction", totalCount: 3, uniqueSessions: 2, sessionReachPct: 0.08 }],
    rows: [
      {
        tag: "friction:rage_click",
        category: "friction",
        tone: "friction",
        totalCount: 3,
        uniqueViews: 2,
        uniqueSessions: 2,
        uniqueVisitors: 2,
        sessionReachPct: 0.08,
        avgDwellMs: 30_000,
        topPath: "/menu-planner",
        lastSeenAt: "2026-11-18T17:00:00.000Z",
      },
    ],
  });
  mockReadActivation.mockResolvedValueOnce({
    totalVisitors: 22,
    newVisitors: 15,
    returningVisitors: 7,
    returningRatePct: 0.32,
    activatedSessions: 12,
    activationRatePct: 0.48,
    avgTimeToFirstActionMs: 12_000,
    frustratedSessions: 2,
    frustrationRatePct: 0.08,
    dauCount: 22,
    wauCount: 60,
    stickinessRatioPct: 0.37,
    variants: [
      {
        variant: "variant:fast_start_cta=control",
        sessions: 24,
        activatedSessions: 6,
        activationRatePct: 0.25,
        frustratedSessions: 1,
        frustrationRatePct: 0.04,
        liftVsControlPct: null,
        confidenceLabel: "Trending",
      },
      {
        variant: "variant:fast_start_cta=instant_plan",
        sessions: 24,
        activatedSessions: 15,
        activationRatePct: 0.625,
        frustratedSessions: 1,
        frustrationRatePct: 0.04,
        liftVsControlPct: 150,
        confidenceLabel: "Statistically Significant (95%+)",
      },
    ],
  });
  mockReadFeedback.mockResolvedValueOnce([
    {
      id: "1",
      at: "2026-11-18T16:30:00.000Z",
      viewId: "v-1",
      sessionId: "s-1",
      visitorHash: "vh-1",
      path: "/menu-planner",
      refTag: null,
      rating: 4,
      note: "Love the planner layout",
      status: "open",
      resolvedAt: null,
    },
    {
      id: "2",
      at: "2026-11-18T15:00:00.000Z",
      viewId: "v-2",
      sessionId: "s-2",
      visitorHash: "vh-2",
      path: "/shop",
      refTag: null,
      rating: 2,
      note: "Already fixed",
      status: "resolved",
      resolvedAt: "2026-11-18T16:00:00.000Z",
    },
  ]);
}

describe("GET /api/admin/traffic-digest", () => {
  const originalKey = process.env.OPENAI_API_KEY;

  beforeEach(() => {
    clearAll();
    resetTrafficDigestCooldownForTests();
    jest.resetAllMocks();
    delete process.env.OPENAI_API_KEY;
  });

  afterAll(() => {
    if (originalKey !== undefined) process.env.OPENAI_API_KEY = originalKey;
    else delete process.env.OPENAI_API_KEY;
  });

  it("passes through 403 when caller is not an admin", async () => {
    mockValidateAdmin.mockResolvedValueOnce({
      error: NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 }),
    });
    const res = await GET(new NextRequest("http://localhost:3000/api/admin/traffic-digest"));
    expect(res.status).toBe(403);
  });

  it("returns synthesized digest payload, uses cache, and supports refresh=1 + range=7d", async () => {
    allowAdmin();
    stubHealthyReaders();
    const res1 = await GET(new NextRequest("http://localhost:3000/api/admin/traffic-digest?range=24h"));
    expect(res1.status).toBe(200);
    const body1 = await res1.json();
    expect(body1.success).toBe(true);
    expect(body1.range).toBe("24h");
    expect(body1.live).toBe(true);
    expect(body1.facts.liveSources).toBe(7);
    expect(body1.facts.frictionSummary.rageClicks).toBe(3);
    expect(body1.facts.openFeedbackCount).toBe(1);
    expect(body1.facts.experiment?.leaderVariant).toBe("variant:fast_start_cta=instant_plan");

    // Second request hits 5-minute cache without re-querying readers
    allowAdmin();
    const res2 = await GET(new NextRequest("http://localhost:3000/api/admin/traffic-digest?range=invalid"));
    expect(res2.status).toBe(200);
    expect(mockReadRouteFlow).toHaveBeenCalledTimes(1);

    // Forced refresh invalidates cache and queries again
    allowAdmin();
    stubHealthyReaders();
    const res3 = await GET(new NextRequest("http://localhost:3000/api/admin/traffic-digest?range=24h&refresh=1"));
    expect(res3.status).toBe(200);
    expect(mockReadRouteFlow).toHaveBeenCalledTimes(2);

    // Distinct cache key for 7d
    allowAdmin();
    stubHealthyReaders();
    const res4 = await GET(new NextRequest("http://localhost:3000/api/admin/traffic-digest?range=7d"));
    expect(res4.status).toBe(200);
    const body4 = await res4.json();
    expect(body4.range).toBe("7d");
  });

  it("reports degraded sources honestly when a subset of readers fail", async () => {
    allowAdmin();
    mockReadTotals
      .mockRejectedValueOnce(new Error("totals down"))
      .mockRejectedValueOnce(new Error("previous down"));
    mockReadRouteFlow.mockResolvedValueOnce([]);
    mockReadFrictionAlerts.mockResolvedValueOnce({
      errorSessions60m: 0,
      errorBurstTriggered: false,
      topErrorTag: null,
      topZeroResultQuery: null,
      activeReviewers: [],
    });
    mockReadInteractionTallies.mockResolvedValueOnce({
      totalInteractions: 0,
      totalSessionsWithInteractions: 0,
      categories: [],
      rows: [],
    });
    mockReadActivation.mockRejectedValueOnce(new Error("activation down"));
    mockReadFeedback.mockResolvedValueOnce([]);

    const res = await GET(new NextRequest("http://localhost:3000/api/admin/traffic-digest?range=24h"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.facts.liveSources).toBe(4);
    expect(body.facts.degradedSources).toEqual(["totals", "previous", "activation"]);
    expect(body.facts.activationRatePct).toBeNull();
    expect(body.narrative.severity).toBe("watch");
  });
});
