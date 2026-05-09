/**
 * @jest-environment node
 */
import { describe, expect, jest, test, beforeEach, afterEach } from "@jest/globals";

jest.mock("../src/services/HistoricalStatsService", () => ({
  getCachedHistoricalStats: jest.fn().mockResolvedValue(null),
}));

import { GET } from "../src/app/api/alchm-quantities/route";

const mockFetch = jest.fn();
const originalFetch = global.fetch;
let requestCounter = 0;

const buildRequest = () =>
  new Request("http://localhost/api/alchm-quantities", {
    headers: { "x-real-ip": `test-${requestCounter++}` },
  });

global.fetch = mockFetch as any;

describe("Cross-Backend Alchemical Quantities Verification Tests", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      CROSS_BACKEND_SYNC_ENABLED: "true",
      NEXT_PUBLIC_BACKEND_URL: "https://whattoeatnext-production.up.railway.app",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    mockFetch.mockReset();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  test("should successfully verify local quantities against backend with negligible discrepancy", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        spirit_score: 0.1234,
        essence_score: 0.5678,
        matter_score: 0.9101,
        substance_score: 0.2345,
      }),
    });

    const response = await GET(buildRequest());
    expect(response).toBeDefined();
    
    const body = await response.json();
    if (!body.success) console.error("Error Details:", body.details);
    expect(body.success).toBe(true);
    expect(body.crossVerification).toBeDefined();
    expect(body.crossVerification.success).toBe(true);
    expect(body.crossVerification.status).toMatch(/verified|rectified/);
    expect(body.crossVerification.backendQuantities.Spirit).toBe(0.1234);
    expect(body.crossVerification.backendQuantities.Essence).toBe(0.5678);
  });

  test("should rectify local quantities when backend returns significantly different authoritative values", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        spirit_score: 0.99,
        essence_score: 0.99,
        matter_score: 0.99,
        substance_score: 0.99,
      }),
    });

    const response = await GET(buildRequest());
    const body = await response.json();
    
    expect(body.success).toBe(true);
    expect(body.crossVerification).toBeDefined();
    expect(body.crossVerification.success).toBe(true);
    expect(body.crossVerification.status).toBe("rectified");
    expect(body.crossVerification.localQuantities.Spirit).not.toBe(0.99);
    expect(body.quantities.Spirit).toBe(0.99);
    expect(body.quantities.Essence).toBe(0.99);
    expect(body.quantities.Matter).toBe(0.99);
    expect(body.quantities.Substance).toBe(0.99);
  });

  test("should handle backend HTTP failure and fall back safely to local values", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
    });

    const response = await GET(buildRequest());
    const body = await response.json();
    
    expect(body.success).toBe(true);
    expect(body.crossVerification).toBeDefined();
    expect(body.crossVerification.success).toBe(false);
    expect(body.crossVerification.status).toBe("failed");
    expect(body.crossVerification.error).toContain("HTTP 500");
  });

  test("should handle fetch throw/rejection and fall back safely to local values", async () => {
    mockFetch.mockRejectedValue(new Error("Network timeout"));

    const response = await GET(buildRequest());
    const body = await response.json();
    
    expect(body.success).toBe(true);
    expect(body.crossVerification).toBeDefined();
    expect(body.crossVerification.success).toBe(false);
    expect(body.crossVerification.status).toBe("failed");
    expect(body.crossVerification.error).toBe("Network timeout");
  });
});
