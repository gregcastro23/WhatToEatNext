function makeRequest(headers: Record<string, string> = {}): Request {
  return new Request("http://localhost/api/test", {
    headers: new Headers(headers),
  });
}

describe("rateLimit", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("allows requests up to the limit and returns 429 metadata after that", async () => {
    const nowSpy = jest.spyOn(Date, "now");
    const { rateLimit } = await import("@/lib/rateLimit");
    const request = makeRequest({
      "x-forwarded-for": "203.0.113.10, 10.0.0.1",
      "x-real-ip": "198.51.100.20",
    });

    nowSpy.mockReturnValue(1_000);
    expect(rateLimit(request, { window: 60_000, max: 2, bucket: "recipes" })).toMatchObject({
      allowed: true,
      remaining: 1,
      resetMs: 60_000,
    });

    nowSpy.mockReturnValue(1_500);
    expect(rateLimit(request, { window: 60_000, max: 2, bucket: "recipes" })).toMatchObject({
      allowed: true,
      remaining: 0,
      resetMs: 60_000,
    });

    nowSpy.mockReturnValue(31_000);
    const blocked = rateLimit(request, { window: 60_000, max: 2, bucket: "recipes" });

    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.resetMs).toBe(30_000);
    expect(blocked.response?.status).toBe(429);
    expect(blocked.response?.headers.get("Retry-After")).toBe("30");
    expect(blocked.response?.headers.get("X-RateLimit-Limit")).toBe("2");
    expect(blocked.response?.headers.get("X-RateLimit-Remaining")).toBe("0");
    expect(blocked.response?.headers.get("X-RateLimit-Reset")).toBe("61");
    await expect(blocked.response?.json()).resolves.toEqual({
      error: "rate_limit_exceeded",
      message: "Too many requests. Please try again shortly.",
      retryAfter: 30,
    });
  });

  it("drops timestamps at the exact sliding-window boundary", async () => {
    const nowSpy = jest.spyOn(Date, "now");
    const { rateLimit } = await import("@/lib/rateLimit");
    const request = makeRequest({ "x-real-ip": "198.51.100.30" });

    nowSpy.mockReturnValue(1_000);
    expect(rateLimit(request, { window: 60_000, max: 1, bucket: "boundary" })).toMatchObject({
      allowed: true,
      remaining: 0,
      resetMs: 60_000,
    });

    nowSpy.mockReturnValue(61_000);
    expect(rateLimit(request, { window: 60_000, max: 1, bucket: "boundary" })).toMatchObject({
      allowed: true,
      remaining: 0,
      resetMs: 60_000,
    });
  });

  it("uses identifier overrides ahead of request headers", async () => {
    const nowSpy = jest.spyOn(Date, "now");
    const { rateLimit } = await import("@/lib/rateLimit");
    const firstRequest = makeRequest({ "x-forwarded-for": "203.0.113.40" });
    const secondRequest = makeRequest({ "x-forwarded-for": "203.0.113.41" });

    nowSpy.mockReturnValue(10_000);
    expect(
      rateLimit(firstRequest, {
        window: 60_000,
        max: 1,
        bucket: "templates",
        identifier: "user-123",
      }),
    ).toMatchObject({
      allowed: true,
      remaining: 0,
      resetMs: 60_000,
    });

    nowSpy.mockReturnValue(10_500);
    const blocked = rateLimit(secondRequest, {
      window: 60_000,
      max: 1,
      bucket: "templates",
      identifier: "user-123",
    });

    expect(blocked.allowed).toBe(false);
    expect(blocked.resetMs).toBe(59_500);
  });

  it("keeps buckets isolated for the same client", async () => {
    const nowSpy = jest.spyOn(Date, "now");
    const { rateLimit } = await import("@/lib/rateLimit");
    const request = makeRequest({ "x-forwarded-for": "203.0.113.50" });

    nowSpy.mockReturnValue(20_000);
    expect(rateLimit(request, { window: 60_000, max: 1, bucket: "route-a" })).toMatchObject({
      allowed: true,
      remaining: 0,
      resetMs: 60_000,
    });

    nowSpy.mockReturnValue(20_500);
    expect(rateLimit(request, { window: 60_000, max: 1, bucket: "route-b" })).toMatchObject({
      allowed: true,
      remaining: 0,
      resetMs: 60_000,
    });

    nowSpy.mockReturnValue(21_000);
    expect(rateLimit(request, { window: 60_000, max: 1, bucket: "route-a" }).allowed).toBe(false);
  });
});
