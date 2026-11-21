/**
 * @jest-environment node
 */
/**
 * @file src/app/api/astrologize/__tests__/astrologizeTracking.test.ts
 *
 * Regression: astrologize interaction tracking must resolve the user before the
 * response returns (and only when a session cookie exists), then hand the
 * `user_interactions` INSERT to the `after()` lifecycle.
 */

import { NextRequest } from "next/server";

jest.mock("@/lib/rateLimit", () => ({ rateLimit: jest.fn() }));
jest.mock("@/lib/hooks/runAfterResponse", () => ({ runAfterResponse: jest.fn() }));
jest.mock("@/lib/auth/auth", () => ({ auth: jest.fn() }));
jest.mock("@/services/userInteractionsService", () => ({ recordInteraction: jest.fn() }));

import { hasAuthSessionCookie } from "@/lib/auth/resolveTrackingUserId";
import { runAfterResponse } from "@/lib/hooks/runAfterResponse";
import { rateLimit } from "@/lib/rateLimit";
import { GET, POST } from "../route";

const mockAfter = jest.mocked(runAfterResponse);
const mockRateLimit = jest.mocked(rateLimit);
const URL_GET = "http://localhost:3000/api/astrologize?year=2026&month=7&date=12";

function withCookie(cookie?: string): HeadersInit {
  return cookie ? { cookie } : {};
}

describe("astrologize interaction tracking", () => {
  const originalFetch = global.fetch;
  const originalHono = process.env.HONO_API_URL;

  // The route loads auth/recordInteraction via dynamic import(), which jest resolves to a separate
  // mock instance from a static import, so grab the same instance the route sees.
  let mockAuth: jest.Mock;
  let mockRecord: jest.Mock;

  beforeEach(async () => {
    const authModule = await import("@/lib/auth/auth");
    mockAuth = jest.mocked(authModule.auth);
    const interactions = await import("@/services/userInteractionsService");
    mockRecord = jest.mocked(interactions.recordInteraction);
    // jest.config uses clearMocks + restoreMocks, so re-seed implementations per test.
    mockRateLimit.mockResolvedValue({ allowed: true, remaining: 59 });
    mockRecord.mockResolvedValue(undefined);
    delete process.env.HONO_API_URL;
    global.fetch = jest.fn().mockRejectedValue(new Error("offline"));
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.HONO_API_URL = originalHono;
  });

  it("skips auth() and tracking for anonymous requests", async () => {
    const res = await GET(new NextRequest(URL_GET));
    expect(res.status).toBe(200);
    expect(mockAuth).not.toHaveBeenCalled();
    expect(mockAfter).not.toHaveBeenCalled();
  });

  it("resolves the user pre-response and records the interaction after()", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" }, expires: "2099-01-01" });
    const req = new NextRequest(URL_GET, {
      headers: withCookie("__Secure-authjs.session-token=abc"),
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(mockAuth).toHaveBeenCalledTimes(1);
    expect(mockAfter).toHaveBeenCalledWith("astrologize.trackInteraction", expect.any(Function));
    expect(mockRecord).not.toHaveBeenCalled();

    const [, task] = mockAfter.mock.calls[0] ?? [];
    await task?.();
    expect(mockRecord).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user-1", type: "planetary_query" }),
    );
    // Background work must not re-enter auth() after the response.
    expect(mockAuth).toHaveBeenCalledTimes(1);
  });

  it("does not schedule tracking when the session cookie is stale", async () => {
    mockAuth.mockResolvedValue(null);
    const req = new NextRequest(URL_GET, { headers: withCookie("authjs.session-token=old") });
    await GET(req);
    expect(mockAuth).toHaveBeenCalledTimes(1);
    expect(mockAfter).not.toHaveBeenCalled();
  });

  it("tracks POST calculations for signed-in users", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-2" }, expires: "2099-01-01" });
    const req = new NextRequest("http://localhost:3000/api/astrologize", {
      method: "POST",
      headers: { "content-type": "application/json", cookie: "authjs.session-token.0=a" },
      body: JSON.stringify({ year: 2026, month: 7, date: 12, hour: 12, minute: 0 }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockAfter).toHaveBeenCalledTimes(1);
  });

  it("detects only Auth.js session cookies", () => {
    expect(hasAuthSessionCookie(null)).toBe(false);
    expect(hasAuthSessionCookie("theme=dark; next-auth.session-token=x")).toBe(false);
    expect(hasAuthSessionCookie("theme=dark; authjs.session-token=x")).toBe(true);
    expect(hasAuthSessionCookie("__Secure-authjs.session-token.1=x")).toBe(true);
  });
});
