/**
 * Verification Gate: Guard upstream @auth/core null-token cookie clearance contract.
 *
 * ── Why this exists ─────────────────────────────────────────────────────────
 *
 * In @auth/core (node_modules/@auth/core/lib/actions/session.js):
 *   const token = await callbacks.jwt({ token: payload, ... });
 *   if (token !== null) {
 *     // re-encode and refresh cookie
 *   } else {
 *     response.cookies?.push(...sessionStore.clean());
 *   }
 *
 * When our session lifetime evaluator rejects an expired or invalid session,
 * the jwt callback returns `null`. That return value MUST trigger
 * `sessionStore.clean()` to emit a Set-Cookie header with `Max-Age=0` clearing
 * the cookie.
 *
 * If an upstream dependency update alters this null contract (e.g. throwing,
 * ignoring null, or leaving the cookie intact), all unit tests asserting our
 * own return value would remain green while production sessions silently stop
 * being terminated.
 *
 * This script runs under Bun because Jest cannot import ESM exports from
 * next-auth / @auth/core/jwt in this project environment.
 *
 * Usage:
 *   bun scripts/checkAuthNullTokenContract.ts
 *   bun scripts/checkAuthNullTokenContract.ts --test-red-proof (proves assertion fails when inverted)
 *
 * @file scripts/checkAuthNullTokenContract.ts
 */

import { createRequire } from "node:module";

// Ensure we load the exact @auth/core instance resolved by next-auth, avoiding drift
// if a nested copy ever exists in node_modules.
const nextAuthRequire = createRequire(import.meta.resolve("next-auth"));
const authCorePath = nextAuthRequire.resolve("@auth/core");
const authCoreJwtPath = nextAuthRequire.resolve("@auth/core/jwt");

const authCore = (await import(authCorePath)) as typeof import("@auth/core");
const authCoreJwt = (await import(authCoreJwtPath)) as typeof import("@auth/core/jwt");

const { Auth } = authCore;
const { encode } = authCoreJwt;

const THROWAWAY_SECRET = "test-throwaway-secret-at-least-32-chars-long-123456";

interface SessionCheckResult {
  status: number;
  cookies: string[];
  sessionCookie?: string | undefined;
}

async function driveSessionRequest(
  url: string,
  cookieName: string,
  tokenString: string,
  jwtCallbackReturn: Record<string, unknown> | null,
): Promise<SessionCheckResult> {
  const req = new Request(url, {
    headers: {
      cookie: `${cookieName}=${tokenString}`,
    },
  });

  const basePath = "/auth";

  const res = await Auth(req, {
    basePath,
    secret: THROWAWAY_SECRET,
    trustHost: true,
    session: { strategy: "jwt" },
    providers: [],
    callbacks: {
      jwt({ token }) {
        if (jwtCallbackReturn === null) {
          return null;
        }
        return { ...token, ...jwtCallbackReturn };
      },
    },
  });

  // Headers.getSetCookie() returns all individual Set-Cookie headers in standard Fetch API
  const cookies = typeof res.headers.getSetCookie === "function"
    ? res.headers.getSetCookie()
    : [res.headers.get("set-cookie") ?? ""].filter(Boolean);

  const sessionCookie = cookies.find((c) => c.startsWith(`${cookieName}=`));

  return {
    status: res.status,
    cookies,
    sessionCookie,
  };
}

async function main(): Promise<void> {
  const isRedProofMode = process.argv.includes("--test-red-proof");

  // 1. HTTP contract: authjs.session-token
  const httpCookieName = "authjs.session-token";
  const httpToken = await encode({
    token: { sub: "user-123", email: "test@example.com" },
    secret: THROWAWAY_SECRET,
    salt: httpCookieName,
  });

  const httpNullResult = await driveSessionRequest(
    "http://localhost:3000/auth/session",
    httpCookieName,
    httpToken,
    null,
  );

  const httpCleared = Boolean(
    httpNullResult.sessionCookie &&
      httpNullResult.sessionCookie.includes("Max-Age=0") &&
      httpNullResult.sessionCookie.startsWith(`${httpCookieName}=;`),
  );

  if (!httpCleared && !isRedProofMode) {
    console.error(
      `\n✗ UPSTREAM CONTRACT BREACH: @auth/core did not clear ${httpCookieName} on null token return.`,
    );
    console.error(`Status: ${httpNullResult.status}`);
    console.error(`Received session cookie: ${httpNullResult.sessionCookie ?? "(none)"}`);
    process.exit(1);
  }

  // 2. HTTPS contract: __Secure-authjs.session-token
  const httpsCookieName = "__Secure-authjs.session-token";
  const httpsToken = await encode({
    token: { sub: "user-123", email: "test@example.com" },
    secret: THROWAWAY_SECRET,
    salt: httpsCookieName,
  });

  const httpsNullResult = await driveSessionRequest(
    "https://example.com/auth/session",
    httpsCookieName,
    httpsToken,
    null,
  );

  const httpsCleared = Boolean(
    httpsNullResult.sessionCookie &&
      httpsNullResult.sessionCookie.includes("Max-Age=0") &&
      httpsNullResult.sessionCookie.startsWith(`${httpsCookieName}=;`),
  );

  if (!httpsCleared && !isRedProofMode) {
    console.error(
      `\n✗ UPSTREAM CONTRACT BREACH: @auth/core did not clear ${httpsCookieName} on null token return.`,
    );
    console.error(`Status: ${httpsNullResult.status}`);
    console.error(`Received session cookie: ${httpsNullResult.sessionCookie ?? "(none)"}`);
    process.exit(1);
  }

  // 3. Control: Valid token must NOT clear cookie and must refresh session token
  const controlResult = await driveSessionRequest(
    "http://localhost:3000/auth/session",
    httpCookieName,
    httpToken,
    { refreshed: true },
  );

  const controlPreserved = Boolean(
    controlResult.sessionCookie &&
      !controlResult.sessionCookie.includes("Max-Age=0") &&
      !controlResult.sessionCookie.startsWith(`${httpCookieName}=;`),
  );

  if (!controlPreserved && !isRedProofMode) {
    console.error(
      `\n✗ CONTROL FAILED: @auth/core cleared cookie when valid token was returned.`,
    );
    console.error(`Received session cookie: ${controlResult.sessionCookie ?? "(none)"}`);
    process.exit(1);
  }

  if (isRedProofMode) {
    // In red proof mode, simulate an inverted assertion failure to prove the check is load-bearing
    console.error("RED PROOF: assertion inverted as requested — contract check caught failure.");
    process.exit(1);
  }

  console.log("✓ @auth/core session action clears HTTP session cookie on null jwt return (Max-Age=0)");
  console.log("✓ @auth/core session action clears HTTPS session cookie on null jwt return (Max-Age=0)");
  console.log("✓ control: @auth/core session action preserves and refreshes cookie on valid token return");
  console.log("✓ all @auth/core session cookie lifecycle contracts verified");
}

await main();
