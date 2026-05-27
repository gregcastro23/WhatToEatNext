/**
 * Tests for the in-process MCP per-key rate limiter (Item 3, Part B).
 * Verifies tier → RPM mapping is honored, that overflow returns
 * `allowed: false`, and that anonymous calls share a bucket.
 */

import {
  checkMcpRateLimit,
  __resetMcpRateLimit,
} from "@/lib/mcp/rateLimit";
import { rpmForTier } from "@/lib/rateLimit";

describe("rpmForTier", () => {
  it("maps tier strings to the documented RPM caps", () => {
    expect(rpmForTier("alchemist")).toBe(300);
    expect(rpmForTier("apprentice")).toBe(60);
    expect(rpmForTier("authenticated")).toBe(60);
    expect(rpmForTier(null)).toBe(60);
    expect(rpmForTier("unknown-tier")).toBe(60);
  });
});

describe("checkMcpRateLimit", () => {
  beforeEach(() => {
    __resetMcpRateLimit();
  });

  it("allows calls under the apprentice cap (60 RPM)", () => {
    for (let i = 0; i < 60; i++) {
      const r = checkMcpRateLimit({
        apiKeyId: "key-1",
        rateLimitTier: "apprentice",
      });
      expect(r.allowed).toBe(true);
    }
  });

  it("rejects the 61st call within a minute for apprentice", () => {
    const now = Date.now();
    for (let i = 0; i < 60; i++) {
      checkMcpRateLimit({
        apiKeyId: "key-2",
        rateLimitTier: "apprentice",
        now: now + i,
      });
    }
    const rejected = checkMcpRateLimit({
      apiKeyId: "key-2",
      rateLimitTier: "apprentice",
      now: now + 100,
    });
    expect(rejected.allowed).toBe(false);
    expect(rejected.limit).toBe(60);
    expect(rejected.resetMs).toBeGreaterThan(0);
  });

  it("allows alchemist callers up to 300 RPM", () => {
    const now = Date.now();
    let allowedCount = 0;
    for (let i = 0; i < 300; i++) {
      const r = checkMcpRateLimit({
        apiKeyId: "key-3",
        rateLimitTier: "alchemist",
        now: now + i,
      });
      if (r.allowed) allowedCount++;
    }
    expect(allowedCount).toBe(300);
    const rejected = checkMcpRateLimit({
      apiKeyId: "key-3",
      rateLimitTier: "alchemist",
      now: now + 500,
    });
    expect(rejected.allowed).toBe(false);
  });

  it("uses a separate bucket per apiKeyId", () => {
    const now = Date.now();
    for (let i = 0; i < 60; i++) {
      checkMcpRateLimit({
        apiKeyId: "key-a",
        rateLimitTier: "apprentice",
        now: now + i,
      });
    }
    // key-a is now full, but key-b should still get its full quota.
    const r = checkMcpRateLimit({
      apiKeyId: "key-b",
      rateLimitTier: "apprentice",
      now: now + 100,
    });
    expect(r.allowed).toBe(true);
  });

  it("anonymous callers (apiKeyId=null) share a single bucket", () => {
    const now = Date.now();
    for (let i = 0; i < 60; i++) {
      checkMcpRateLimit({
        apiKeyId: null,
        rateLimitTier: null,
        now: now + i,
      });
    }
    const rejected = checkMcpRateLimit({
      apiKeyId: null,
      rateLimitTier: null,
      now: now + 100,
    });
    expect(rejected.allowed).toBe(false);
  });

  it("expires window entries after 60s", () => {
    const t0 = 1_000_000_000;
    for (let i = 0; i < 60; i++) {
      checkMcpRateLimit({
        apiKeyId: "key-window",
        rateLimitTier: "apprentice",
        now: t0 + i,
      });
    }
    // Within the window — rejected.
    expect(
      checkMcpRateLimit({
        apiKeyId: "key-window",
        rateLimitTier: "apprentice",
        now: t0 + 30_000,
      }).allowed,
    ).toBe(false);
    // After the window closes — accepted again.
    expect(
      checkMcpRateLimit({
        apiKeyId: "key-window",
        rateLimitTier: "apprentice",
        now: t0 + 61_000,
      }).allowed,
    ).toBe(true);
  });
});
