/**
 * POST /api/track/pageview — what reaches page_views, and what never does.
 *
 * @file src/app/api/track/pageview/__tests__/route.test.ts
 */

jest.mock("@/services/admin/trafficAnalyticsService", () => ({ recordPageView: jest.fn() }));
jest.mock("@/lib/rateLimit", () => ({ rateLimit: jest.fn() }));
jest.mock("@/lib/auth/auth", () => ({ auth: jest.fn() }));
jest.mock("@/lib/database/connection", () => ({ executeQuery: jest.fn() }));

import { NextRequest } from "next/server";
import { POST } from "../route";
import { auth } from "@/lib/auth/auth";
import { executeQuery } from "@/lib/database/connection";
import { rateLimit } from "@/lib/rateLimit";
import { recordPageView } from "@/services/admin/trafficAnalyticsService";

const mockRecord = jest.mocked(recordPageView);
const mockRateLimit = jest.mocked(rateLimit);
const mockAuth = jest.mocked(auth);
const mockQuery = jest.mocked(executeQuery);

const CHROME = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

function beacon(body: unknown, headers: Record<string, string> = {}): NextRequest {
  return new NextRequest("https://alchm.kitchen/api/track/pageview", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "user-agent": CHROME,
      "x-forwarded-for": "203.0.113.7, 10.0.0.1",
      "x-vercel-ip-country": "US",
      "x-vercel-ip-city": "New%20York",
      host: "alchm.kitchen",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  jest.resetAllMocks();
  mockRateLimit.mockResolvedValue({ allowed: true, remaining: 100, resetMs: 60_000 });
  mockRecord.mockResolvedValue(true);
  mockAuth.mockResolvedValue(null);
});

describe("POST /api/track/pageview", () => {
  it("records a visit with the path only, decoded geo, and a hashed visitor", async () => {
    const res = await POST(beacon({ path: "/recipes?email=a@b.com", referrer: "https://www.google.com/", sessionId: "abcdef0123456789" }));
    expect(res.status).toBe(204);
    const row = mockRecord.mock.calls[0]?.[0];
    expect(row).toMatchObject({
      path: "/recipes",
      referrerHost: "google.com",
      country: "US",
      city: "New York",
      deviceType: "desktop",
      browser: "Chrome",
      isBot: false,
      userId: null,
      sessionId: "abcdef0123456789",
    });
    expect(row?.visitorHash).toMatch(/^[0-9a-f]{24}$/);
    expect(JSON.stringify(row)).not.toContain("203.0.113.7");
  });

  it("attributes a signed-in visitor from the server session, never from the body", async () => {
    mockAuth.mockResolvedValue({ user: { email: "Cook@Example.com" } });
    mockQuery.mockResolvedValue({ rows: [{ id: "user-1" }], command: "SELECT", rowCount: 1, oid: 0, fields: [] });
    await POST(beacon({ path: "/", userId: "someone-else" }));
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining("LOWER(email)"), ["cook@example.com"], expect.anything());
    expect(mockRecord.mock.calls[0]?.[0].userId).toBe("user-1");
  });

  it("never records admin pages", async () => {
    const res = await POST(beacon({ path: "/admin/traffic" }));
    expect(res.status).toBe(204);
    expect(mockRecord).not.toHaveBeenCalled();
  });

  it("ignores beacons posted from another site", async () => {
    await POST(beacon({ path: "/" }, { "sec-fetch-site": "cross-site" }));
    expect(mockRecord).not.toHaveBeenCalled();
  });

  it("records bots as bots and never attributes them", async () => {
    mockAuth.mockResolvedValue({ user: { email: "cook@example.com" } });
    await POST(beacon({ path: "/" }, { "user-agent": "Googlebot/2.1 (+http://www.google.com/bot.html)" }));
    expect(mockRecord.mock.calls[0]?.[0]).toMatchObject({ isBot: true, deviceType: "bot", userId: null });
    expect(mockAuth).not.toHaveBeenCalled();
  });

  it("rejects a malformed body and honours the rate limit", async () => {
    expect((await POST(beacon({ nope: true }))).status).toBe(400);
    mockRateLimit.mockResolvedValue({ allowed: false, remaining: 0, resetMs: 60_000 });
    expect((await POST(beacon({ path: "/" }))).status).toBe(429);
    expect(mockRecord).not.toHaveBeenCalled();
  });
});
