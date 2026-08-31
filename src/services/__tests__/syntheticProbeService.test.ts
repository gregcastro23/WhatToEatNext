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
  runAuthSigninProbe,
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
    const fetchSpy = jest.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true, onboardingComplete: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

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
    jest.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: false, message: "rate limited" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const result = await runOnboardingSkipProbe({
      baseUrl: "http://localhost:3000",
      bearerToken: "test-token",
    });

    expect(result.status).toBe("failure");
    expect(result.httpStatus).toBe(200);
    expect(result.errorMessage).toMatch(/rate limited/);
  });

  it("returns failure when the endpoint returns a 5xx", async () => {
    jest.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: false, message: "DB unavailable" }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }),
    );

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
      .spyOn(globalThis, "fetch")
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
    jest.spyOn(globalThis, "fetch").mockRejectedValue(abortError);

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
    jest.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: { recipe: {} } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const result = await runCosmicRecipeProbe({
      baseUrl: "http://localhost:3000",
      bearerToken: "test-token",
    });

    expect(result.status).toBe("success");
    expect(result.httpStatus).toBe(200);
    expect(result.errorMessage).toBeNull();
  });

  it("treats a 402 (daily free-generation quota spent) as success — the endpoint is healthy and token-gating is working", async () => {
    jest.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          success: false,
          message: "You have generated your free recipe for today.",
        }),
        {
          status: 402,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    const result = await runCosmicRecipeProbe({
      baseUrl: "http://localhost:3000",
      bearerToken: "test-token",
    });

    // The whole point of the fix: a 402 must NOT flap AI-generation to INCIDENT.
    expect(result.status).toBe("success");
    expect(result.httpStatus).toBe(402);
  });

  it("still fails on a 5xx (genuine generation breakage)", async () => {
    jest.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: false, message: "backend down" }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const result = await runCosmicRecipeProbe({
      baseUrl: "http://localhost:3000",
      bearerToken: "test-token",
    });

    expect(result.status).toBe("failure");
    expect(result.httpStatus).toBe(502);
    expect(result.errorMessage).toMatch(/502/);
  });

  it("still fails on 200 + success:false (endpoint reachable but generation failed)", async () => {
    jest.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: false, message: "generation failed" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const result = await runCosmicRecipeProbe({
      baseUrl: "http://localhost:3000",
      bearerToken: "test-token",
    });

    expect(result.status).toBe("failure");
    expect(result.httpStatus).toBe(200);
  });
});

describe("runAuthSigninProbe", () => {
  const ORIGINAL_ENV = { ...process.env };

  beforeEach(() => {
    jest.restoreAllMocks();
    // Default: no Google creds in env → the secret-validity check is skipped,
    // so these tests exercise the initiation path in isolation.
    delete process.env.AUTH_GOOGLE_ID;
    delete process.env.AUTH_GOOGLE_SECRET;
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  // Route each fetch by URL so the multi-step flow (csrf → signin → token)
  // can be stubbed independently.
  function mockFlow(opts: { location: string; tokenError?: string }) {
    return jest
      .spyOn(globalThis, "fetch")
      .mockImplementation(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes("/api/auth/csrf")) {
          const headers = new Headers();
          headers.append("set-cookie", "authjs.csrf-token=test-csrf%7Cabc; Path=/; HttpOnly");
          return new Response(JSON.stringify({ csrfToken: "test-csrf" }), {
            status: 200,
            headers,
          });
        }
        if (url.includes("/api/auth/signin/google")) {
          const headers = new Headers();
          headers.set("location", opts.location);
          return new Response(JSON.stringify({}), {
            status: 302,
            headers,
          });
        }
        if (url.includes("oauth2.googleapis.com/token")) {
          return new Response(
            JSON.stringify({ error: opts.tokenError ?? "invalid_grant" }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            },
          );
        }
        throw new Error(`unexpected fetch: ${url}`);
      });
  }

  it("succeeds when sign-in initiation 302s to Google with a client_id", async () => {
    mockFlow({
      location:
        "https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=test.apps.googleusercontent.com&code_challenge=abc",
    });

    const result = await runAuthSigninProbe({ baseUrl: "https://app.test" });

    expect(result.status).toBe("success");
    expect(result.httpStatus).toBe(302);
    expect(result.responsePayload).toMatchObject({ initiationOk: true });
  });

  it("fails when initiation redirects to the auth error page (broken config)", async () => {
    mockFlow({
      location: "https://app.test/auth/error?error=Configuration",
    });

    const result = await runAuthSigninProbe({ baseUrl: "https://app.test" });

    expect(result.status).toBe("failure");
    expect(result.errorMessage).toMatch(/did not redirect to Google/);
  });

  it("fails when Google rejects the client secret (invalid_client → rotated secret)", async () => {
    process.env.AUTH_GOOGLE_ID = "test.apps.googleusercontent.com";
    process.env.AUTH_GOOGLE_SECRET = "stale-secret";
    mockFlow({
      location:
        "https://accounts.google.com/o/oauth2/v2/auth?client_id=test.apps.googleusercontent.com&code_challenge=abc",
      tokenError: "invalid_client",
    });

    const result = await runAuthSigninProbe({ baseUrl: "https://app.test" });

    expect(result.status).toBe("failure");
    expect(result.errorMessage).toMatch(/invalid_client/);
    expect(result.responsePayload).toMatchObject({ secretCheck: "invalid" });
  });

  it("succeeds when the secret check returns invalid_grant (credentials accepted, bogus code)", async () => {
    process.env.AUTH_GOOGLE_ID = "test.apps.googleusercontent.com";
    process.env.AUTH_GOOGLE_SECRET = "good-secret";
    mockFlow({
      location:
        "https://accounts.google.com/o/oauth2/v2/auth?client_id=test.apps.googleusercontent.com&code_challenge=abc",
      tokenError: "invalid_grant",
    });

    const result = await runAuthSigninProbe({ baseUrl: "https://app.test" });

    expect(result.status).toBe("success");
    expect(result.responsePayload).toMatchObject({ secretCheck: "valid" });
  });
});
