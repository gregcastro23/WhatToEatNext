/**
 * Tests for runOnboardingSkipProbe — the pure side of the probe (fetch
 * + timeout handling). The DB write side is mocked so the test focuses
 * on the probe's status decision logic.
 */

// Mock executeQuery so recordProbeResult is a no-op in tests.
jest.mock("@/lib/database/connection", () => ({
  executeQuery: jest.fn().mockResolvedValue({ rows: [] }),
}));

import {
  runCosmicRecipeProbe,
  runOnboardingSkipProbe,
} from "@/services/syntheticProbeService";

describe("runOnboardingSkipProbe", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("returns failure with a helpful message when no bearer token is configured", async () => {
    const result = await runOnboardingSkipProbe({
      baseUrl: "http://localhost:3000",
      bearerToken: null,
    });
    expect(result.status).toBe("failure");
    expect(result.errorMessage).toMatch(/SYNTHETIC_PROBE_TOKEN/);
    expect(result.httpStatus).toBeNull();
  });

  it("returns success when /api/onboarding responds 200 + success:true", async () => {
    const fetchSpy = jest.spyOn(globalThis, "fetch" as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, onboardingComplete: true }),
    } as Response);

    const result = await runOnboardingSkipProbe({
      baseUrl: "http://localhost:3000",
      bearerToken: "test-token",
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      "http://localhost:3000/api/onboarding",
      expect.objectContaining({
        method: "PATCH",
        headers: expect.objectContaining({
          Authorization: "Bearer test-token",
        }),
      }),
    );
    expect(result.status).toBe("success");
    expect(result.httpStatus).toBe(200);
    expect(result.errorMessage).toBeNull();
  });

  it("returns failure when the endpoint returns a non-success body", async () => {
    jest.spyOn(globalThis, "fetch" as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: false, message: "rate limited" }),
    } as Response);

    const result = await runOnboardingSkipProbe({
      baseUrl: "http://localhost:3000",
      bearerToken: "test-token",
    });

    expect(result.status).toBe("failure");
    expect(result.httpStatus).toBe(200);
    expect(result.errorMessage).toMatch(/rate limited/);
  });

  it("returns failure when the endpoint returns a 5xx", async () => {
    jest.spyOn(globalThis, "fetch" as any).mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({ success: false, message: "DB unavailable" }),
    } as Response);

    const result = await runOnboardingSkipProbe({
      baseUrl: "http://localhost:3000",
      bearerToken: "test-token",
    });

    expect(result.status).toBe("failure");
    expect(result.httpStatus).toBe(503);
    expect(result.errorMessage).toMatch(/503/);
  });

  it("returns failure with a network error message when fetch rejects", async () => {
    jest
      .spyOn(globalThis, "fetch" as any)
      .mockRejectedValue(new Error("ECONNREFUSED"));

    const result = await runOnboardingSkipProbe({
      baseUrl: "http://localhost:3000",
      bearerToken: "test-token",
    });

    expect(result.status).toBe("failure");
    expect(result.errorMessage).toMatch(/ECONNREFUSED/);
    expect(result.httpStatus).toBeNull();
  });

  it("returns timeout when fetch is aborted", async () => {
    const abortError = new Error("aborted");
    abortError.name = "AbortError";
    jest.spyOn(globalThis, "fetch" as any).mockRejectedValue(abortError);

    const result = await runOnboardingSkipProbe({
      baseUrl: "http://localhost:3000",
      bearerToken: "test-token",
    });

    expect(result.status).toBe("timeout");
    expect(result.errorMessage).toMatch(/timed out/);
  });
});

describe("runCosmicRecipeProbe", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("returns success when generation responds 200 + success:true", async () => {
    jest.spyOn(globalThis, "fetch" as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: { recipe: {} } }),
    } as Response);

    const result = await runCosmicRecipeProbe({
      baseUrl: "http://localhost:3000",
      bearerToken: "test-token",
    });

    expect(result.status).toBe("success");
    expect(result.httpStatus).toBe(200);
    expect(result.errorMessage).toBeNull();
  });

  it("treats a 402 (daily free-generation quota spent) as success — the endpoint is healthy and token-gating is working", async () => {
    jest.spyOn(globalThis, "fetch" as any).mockResolvedValue({
      ok: false,
      status: 402,
      json: async () => ({
        success: false,
        message: "You have generated your free recipe for today.",
      }),
    } as Response);

    const result = await runCosmicRecipeProbe({
      baseUrl: "http://localhost:3000",
      bearerToken: "test-token",
    });

    // The whole point of the fix: a 402 must NOT flap AI-generation to INCIDENT.
    expect(result.status).toBe("success");
    expect(result.httpStatus).toBe(402);
  });

  it("still fails on a 5xx (genuine generation breakage)", async () => {
    jest.spyOn(globalThis, "fetch" as any).mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => ({ success: false, message: "backend down" }),
    } as Response);

    const result = await runCosmicRecipeProbe({
      baseUrl: "http://localhost:3000",
      bearerToken: "test-token",
    });

    expect(result.status).toBe("failure");
    expect(result.httpStatus).toBe(502);
    expect(result.errorMessage).toMatch(/502/);
  });

  it("still fails on 200 + success:false (endpoint reachable but generation failed)", async () => {
    jest.spyOn(globalThis, "fetch" as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: false, message: "generation failed" }),
    } as Response);

    const result = await runCosmicRecipeProbe({
      baseUrl: "http://localhost:3000",
      bearerToken: "test-token",
    });

    expect(result.status).toBe("failure");
    expect(result.httpStatus).toBe(200);
  });
});
