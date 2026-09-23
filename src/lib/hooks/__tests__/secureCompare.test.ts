/**
 * @jest-environment node
 *
 * Constant-time secret comparison: same answers as `===` on real inputs, and
 * fail closed when no secret is configured.
 */

import { bearerMatches, safeEqual } from "@/lib/hooks/secureCompare";

describe("safeEqual", () => {
  it("matches only the exact secret", () => {
    expect(safeEqual("s3cret-value", "s3cret-value")).toBe(true);
    expect(safeEqual("s3cret-valuf", "s3cret-value")).toBe(false);
    expect(safeEqual("s3cret", "s3cret-value")).toBe(false); // prefix, different length
    expect(safeEqual("s3cret-value-and-more", "s3cret-value")).toBe(false);
  });

  it("fails closed: no configured secret matches nothing, not even an empty header", () => {
    expect(safeEqual("", "")).toBe(false);
    expect(safeEqual("anything", undefined)).toBe(false);
    expect(safeEqual(null, "s3cret")).toBe(false);
    expect(safeEqual(undefined, "s3cret")).toBe(false);
    expect(safeEqual("", "s3cret")).toBe(false);
  });
});

describe("bearerMatches", () => {
  it("requires the Bearer scheme and the exact secret", () => {
    expect(bearerMatches("Bearer abc123", "abc123")).toBe(true);
    expect(bearerMatches("abc123", "abc123")).toBe(false);
    expect(bearerMatches("Bearer abc124", "abc123")).toBe(false);
    expect(bearerMatches("Bearer ", "")).toBe(false);
    expect(bearerMatches(null, "abc123")).toBe(false);
  });
});

describe("the shared-secret and internal routes", () => {
  const SYNC_ROUTES = [
    "src/app/api/economy/sync-credit/route.ts",
    "src/app/api/economy/sync-debit/route.ts",
    "src/app/api/economy/sync-event/route.ts",
    "src/app/api/economy/balance/route.ts",
    "src/app/api/internal/agent-sync/route.ts",
    "src/app/api/internal/agent-recipes/route.ts",
  ];

  it("compare the sync secret in constant time, never with === or !==", async () => {
    const { readFileSync } = await import("node:fs");
    for (const route of SYNC_ROUTES) {
      const src = readFileSync(route, "utf8");
      expect({ route, usesSafeEqual: src.includes("safeEqual(") }).toEqual({ route, usesSafeEqual: true });
      // Any plain comparison against a secret-bearing identifier is a regression.
      expect({ route, plain: /[!=]==\s*(syncSecret|ALCHM_KITCHEN_SYNC_SECRET|`Bearer \$\{INTERNAL_API_SECRET\}`)/.test(src) }).toEqual({
        route,
        plain: false,
      });
    }
  });

  it("compares the feed internal bearer in constant time via bearerMatches", async () => {
    const { readFileSync } = await import("node:fs");
    const src = readFileSync("src/app/api/feed/route.ts", "utf8");
    expect(src.includes("bearerMatches(")).toBe(true);
    expect(/[!=]==\s*(internalSecret|INTERNAL_API_SECRET)/.test(src)).toBe(false);
    expect(src.includes(".length !==")).toBe(false);
  });
});

