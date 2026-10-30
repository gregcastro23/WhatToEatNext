/**
 * Tests for GET /api/admin/agents route handler.
 *
 * @file src/app/api/admin/agents/__tests__/route.test.ts
 */

jest.mock("@/lib/auth/validateRequest", () => ({
  validateAdminRequest: jest.fn(),
}));

jest.mock("@/lib/cache/memoryCache", () => ({
  memoize: jest.fn((_key: string, _ttl: number, fn: () => unknown) => fn()),
}));

jest.mock("@/services/admin/adminAgentsService", () => ({
  getAdminAgentsOverview: jest.fn(),
}));

import { NextRequest, NextResponse } from "next/server";
import { GET } from "../route";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import {
  getAdminAgentsOverview,
  type AdminAgentsPayload,
} from "@/services/admin/adminAgentsService";

const mockValidateAdminRequest = jest.mocked(validateAdminRequest);
const mockGetAdminAgentsOverview = jest.mocked(getAdminAgentsOverview);

function makeRequest(url = "http://localhost:3000/api/admin/agents"): NextRequest {
  return new NextRequest(url, { method: "GET" });
}

function makeOverview(): AdminAgentsPayload {
  return {
    generatedAt: "2026-10-03T12:00:00Z",
    live: true,
    roster: {
      totalAgents: 10,
      activeAgents24h: 3,
      live: true,
    },
    connectivity: {
      services: [],
      contractProbe: {
        success: true,
        timestamp: "2026-10-03T12:00:00Z",
        checks: {
          agentRosterAuth: { passed: true, status: 200 },
          syncStatusAuth: { passed: true, status: 200 },
          vesselAuth: { passed: true, status: 200 },
          checkSharedAuth: { passed: true, status: 200 },
          negativeControls: { passed: true, allRejectedWith401: true, statuses: {} },
        },
      },
      inboundDelivery: {
        generatedAt: "2026-10-03T12:00:00Z",
        totalReceived: 0,
        totalProcessed: 0,
        totalInFlight: 0,
        totalLiveInFlight: 0,
        totalStaleLocks: 0,
        totalFailed: 0,
        totalDuplicates: 0,
        overallP95LatencyMs: null,
        sources: [],
        recentEvents: [],
        feedStatus: {
          lastEmit: null,
          signatureMode: "off",
          signatureModeInfo: { mode: "off", raw: "off", valid: true },
          internalSecretConfigured: false,
          syncSecretConfigured: false,
          hookSecretConfigured: false,
        },
      },
    },
    actions: {
      creditPath: {
        verdict: "IDLE",
        summary: "No sync-credit traffic in 7d",
        calls24h: 0,
        credits24h: 0,
        lastCreditAgeMs: null,
        priorCalls7d: 0,
        priorCredits7d: 0,
        live: true,
      },
      debitPath: {
        verdict: "IDLE",
        summary: "No sync-debit traffic in 7d",
        agentTraffic24h: 0,
        debits24h: 0,
        lastDebitAgeMs: null,
        live: true,
      },
      actionMetrics: [],
      cronHeartbeats: [],
      recipePipeline: {
        attempts: 0,
        repairs: 0,
        retries: 0,
        refunds: 0,
        finalFailures: 0,
        live: true,
      },
    },
  };
}

describe("GET /api/admin/agents", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns auth error when caller is not admin", async () => {
    mockValidateAdminRequest.mockResolvedValueOnce({
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    });

    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
    expect(mockGetAdminAgentsOverview).not.toHaveBeenCalled();
  });

  it("returns 200 with success: true and overview payload", async () => {
    mockValidateAdminRequest.mockResolvedValueOnce({
      user: {
        userId: "admin-1",
        email: "admin@alchm.kitchen",
        roles: ["admin"],
      },
    });

    const overview = makeOverview();
    mockGetAdminAgentsOverview.mockResolvedValueOnce(overview);

    const res = await GET(makeRequest());
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.roster.totalAgents).toBe(10);
    expect(json.actions.creditPath.verdict).toBe("IDLE");
  });

  it("returns 500 when overview loading fails", async () => {
    mockValidateAdminRequest.mockResolvedValueOnce({
      user: {
        userId: "admin-1",
        email: "admin@alchm.kitchen",
        roles: ["admin"],
      },
    });

    mockGetAdminAgentsOverview.mockRejectedValueOnce(new Error("Telemetry service failed"));

    const res = await GET(makeRequest());
    expect(res.status).toBe(500);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toBe("Failed to load agents overview");
  });
});
