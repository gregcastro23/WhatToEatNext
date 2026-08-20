/**
 * @jest-environment node
 *
 * The Google OAuth tile could never observe an OAuth callback.
 *
 * `/api/auth/[...nextauth]` is one route file serving a family of URLs. It
 * recorded every one of them under the Next.js FILESYSTEM identifier
 * `"/api/auth/[...nextauth]"`, while `probeGoogleOAuthDependency` asks
 * `summarizePath("/api/auth/callback/google", ONE_DAY)` and `summarizePath`
 * matches with `path.startsWith(prefix)`. A filesystem identifier cannot
 * satisfy a URL prefix, so `observed` was false at any traffic rate and the
 * tile read `UNKNOWN — "No OAuth callback traffic in 24h"` forever.
 *
 * `[MEASURED 2026-08-19]` production `request_log_entries` held exactly ONE
 * distinct `/api/auth%` path across 30 days — `/api/auth/[...nextauth]`,
 * 42 rows — confirming no writer ever emitted a matchable value.
 *
 * The load-bearing case here is `records the served URL so the probe's prefix
 * matches`: it drives the real wrapper and the real ring, so it fails against
 * the pre-fix wrapper (which had no `deriveRouteName` and recorded the
 * constant) and passes after. A unit test over `deriveAuthRouteName` alone
 * would NOT have caught the defect, because the deriver is new — the bug lived
 * in the wiring.
 *
 * Neither `DATABASE_URL` nor a browser global is set under jest, so the
 * durable mirror and the ring's hydration both no-op and this exercises the
 * real in-memory path with no mocking.
 */
import { NextRequest } from "next/server";
import {
  AUTH_ROUTE_FALLBACK,
  deriveAuthRouteName,
} from "@/lib/observability/authRouteName";
import { summarizePath } from "@/lib/observability/requestLog";
import { withObservability } from "@/lib/observability/withObservability";

const ONE_MIN = 60 * 1000;

/** Drive the real wrapper the way Next.js drives the auth route. */
async function serve(pathname: string): Promise<void> {
  const handler = withObservability(
    {
      routeName: "/api/auth/[...nextauth]",
      deriveRouteName: (req: NextRequest) =>
        deriveAuthRouteName(req.nextUrl?.pathname ?? new URL(req.url).pathname),
    },
    async () => new Response(null, { status: 302 }),
  );
  await handler(new NextRequest(`https://alchm.kitchen${pathname}`));
  // The ring write happens in a fire-and-forget microtask after the response.
  await new Promise((r) => setImmediate(r));
}

describe("auth catch-all route naming", () => {
  it("records the served URL so the probe's prefix matches", async () => {
    await serve("/api/auth/callback/google");

    const health = summarizePath("/api/auth/callback/google", ONE_MIN);

    // THE defect: this was false for every request the route ever served.
    expect(health.observed).toBe(true);
    expect(health.count).toBe(1);
  });

  it("still matches the broader /api/auth prefix probeAuth uses", async () => {
    await serve("/api/auth/csrf");

    // probeAuth's summarizePath("/api/auth", FIVE_MIN) must keep matching the
    // exact same entry set it matched before the rename — only labels changed.
    expect(summarizePath("/api/auth", ONE_MIN).observed).toBe(true);
  });

  it("does not let a signin count as a callback", async () => {
    // The ring is module-global and shared across cases in this file, and
    // these paths are fixed by Auth.js semantics so no per-case prefix is
    // available. Measure the DELTA this request causes instead of an absolute.
    const before = summarizePath("/api/auth/callback/google", ONE_MIN).count;

    await serve("/api/auth/signin/google");

    // Prefix matching is startsWith, so an over-broad derived name would let
    // signin traffic masquerade as a completed OAuth callback.
    const after = summarizePath("/api/auth/callback/google", ONE_MIN).count;
    expect(after - before).toBe(0);
    // Control: the request WAS recorded, under its own name — otherwise this
    // case would pass simply by nothing having been logged at all.
    expect(summarizePath("/api/auth/signin/google", ONE_MIN).count).toBe(1);
  });
});

describe("deriveAuthRouteName", () => {
  it("emits the callback path the OAuth probe asks for", () => {
    expect(deriveAuthRouteName("/api/auth/callback/google")).toBe(
      "/api/auth/callback/google",
    );
  });

  it("keeps every output under the /api/auth prefix", () => {
    const paths = [
      "/api/auth/callback/google",
      "/api/auth/callback/amazon",
      "/api/auth/callback/evil",
      "/api/auth/signin/google",
      "/api/auth/signin",
      "/api/auth/csrf",
      "/api/auth/session",
      "/api/auth/providers",
      "/api/auth/signout",
      "/api/auth/error",
      "/api/auth/.env",
      "/api/auth",
      "/totally/elsewhere",
      "",
    ];
    for (const p of paths) {
      expect(deriveAuthRouteName(p).startsWith("/api/auth")).toBe(true);
    }
  });

  it("collapses unknown providers and junk so the bucket count stays bounded", () => {
    // Two consumers group by exact path then truncate (error groups LIMIT 8,
    // topPaths slice(0,10)); unbounded names would crowd real routes off both.
    expect(deriveAuthRouteName("/api/auth/callback/evil")).toBe(
      "/api/auth/callback/:provider",
    );
    expect(deriveAuthRouteName("/api/auth/.env")).toBe(AUTH_ROUTE_FALLBACK);
    expect(deriveAuthRouteName("/api/auth/callback/google/extra")).toBe(
      AUTH_ROUTE_FALLBACK,
    );
    expect(deriveAuthRouteName("/api/../etc/passwd")).toBe(AUTH_ROUTE_FALLBACK);

    const derived = new Set(
      [
        "callback/google",
        "callback/amazon",
        "callback/x",
        "callback",
        "signin/google",
        "signin/amazon",
        "signin/y",
        "signin",
        "csrf",
        "session",
        "providers",
        "signout",
        "error",
        "verify-request",
        "_log",
        ".env",
        "wp-admin",
      ].map((s) => deriveAuthRouteName(`/api/auth/${s}`)),
    );
    expect(derived.size).toBeLessThanOrEqual(16);
  });
});
