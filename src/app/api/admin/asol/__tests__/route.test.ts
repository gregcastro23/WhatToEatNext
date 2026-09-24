/**
 * Tests for GET /api/admin/asol route handler.
 *
 * @file src/app/api/admin/asol/__tests__/route.test.ts
 */

jest.mock("@/lib/auth/validateRequest", () => ({
  validateAdminRequest: jest.fn(),
}));

jest.mock("@/services/admin/asolHealthService", () => ({
  getAsolHealthOverview: jest.fn(),
}));

import { NextRequest, NextResponse } from "next/server";
import { GET } from "../route";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { getAsolHealthOverview } from "@/services/admin/asolHealthService";
import type { AsolHealthOverview } from "@/services/admin/asolHealthService";

const mockValidateAdminRequest = jest.mocked(validateAdminRequest);
const mockGetAsolHealthOverview = jest.mocked(getAsolHealthOverview);

function makeRequest(): NextRequest {
  return new NextRequest("http://localhost:3000/api/admin/asol", {
    method: "GET",
  });
}

function makeOverview(): AsolHealthOverview {
  return {
    generatedAt: "2026-09-23T12:00:00Z",
    totalReceived: 10,
    totalProcessed: 9,
    totalInFlight: 0,
    totalLiveInFlight: 0,
    totalStaleLocks: 0,
    totalFailed: 1,
    totalDuplicates: 2,
    overallP95LatencyMs: 150,
    sources: [
      {
        source: "asol-sync-event",
        received: 10,
        processed: 9,
        inFlight: 0,
        liveInFlight: 0,
        staleLocks: 0,
        failed: 1,
        duplicates: 2,
        p95LatencyMs: 150,
        signatureBreakdown: {
          valid: 10,
          unsigned: 0,
          failed: 0,
          reasons: {},
        },
      },
    ],
    recentEvents: [],
    feedStatus: {
      lastEmit: null,
      signatureMode: "off",
      signatureModeInfo: {
        mode: "off",
        raw: "",
        valid: true,
      },
      internalSecretConfigured: true,
      syncSecretConfigured: true,
      hookSecretConfigured: false,
    },
  };
}

describe("GET /api/admin/asol", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns auth error if admin validation fails", async () => {
    mockValidateAdminRequest.mockResolvedValueOnce({
      error: NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 },
      ),
    });

    const res = await GET(makeRequest());
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.message).toBe("Admin access required");
  });

  it("returns 200 with telemetry payload for valid admin", async () => {
    mockValidateAdminRequest.mockResolvedValueOnce({
      user: {
        userId: "admin-1",
        email: "admin@alchm.kitchen",
        roles: ["admin"],
      },
    });

    mockGetAsolHealthOverview.mockResolvedValueOnce(makeOverview());

    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.totalReceived).toBe(10);
    expect(data.totalProcessed).toBe(9);
    expect(data.overallP95LatencyMs).toBe(150);
  });

  it("passes status=failed filter to health overview service", async () => {
    mockValidateAdminRequest.mockResolvedValueOnce({
      user: {
        userId: "admin-1",
        email: "admin@alchm.kitchen",
        roles: ["admin"],
      },
    });

    mockGetAsolHealthOverview.mockResolvedValueOnce(makeOverview());

    const req = new NextRequest("http://localhost:3000/api/admin/asol?status=failed", {
      method: "GET",
    });

    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(mockGetAsolHealthOverview).toHaveBeenCalledWith({ status: "failed" });
  });

  it("returns 500 when telemetry service fails", async () => {
    mockValidateAdminRequest.mockResolvedValueOnce({
      user: {
        userId: "admin-1",
        email: "admin@alchm.kitchen",
        roles: ["admin"],
      },
    });

    mockGetAsolHealthOverview.mockRejectedValueOnce(new Error("Database connection lost"));

    const res = await GET(makeRequest());
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe("Failed to load ASOL delivery health");
  });
});
