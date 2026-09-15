/**
 * Origin validation for security-sensitive state-mutating endpoints.
 *
 * Enforces origin checks on session revocation endpoints (DELETE /api/auth/sessions/[id]
 * and POST /api/auth/sessions/revoke-all) to defend against Cross-Site Request Forgery (CSRF).
 *
 * Requirements:
 * 1. Missing Origin header is rejected with 403 Forbidden.
 * 2. In development or test: localhost / 127.0.0.1 origins are permitted.
 *    In production: localhost origins are strictly rejected.
 * 3. In Vercel preview environments (VERCEL_ENV === 'preview'): *.vercel.app origins are permitted.
 * 4. Production web app: https://alchm.kitchen and https://www.alchm.kitchen are permitted.
 * 5. Sibling subdomains (e.g., agents.alchm.kitchen, api.agents.alchm.kitchen) are strictly rejected.
 *
 * @file src/lib/auth/originCheck.ts
 */

import { NextResponse } from "next/server";

export interface OriginCheckResult {
  allowed: boolean;
  status: number;
  error?: string | undefined;
}

function isLocalHost(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname === "[::1]"
  );
}

function checkLocalhost(hostname: string, isDevOrTest: boolean): OriginCheckResult | null {
  if (!isLocalHost(hostname)) {
    return null;
  }
  if (isDevOrTest) {
    return { allowed: true, status: 200 };
  }
  return {
    allowed: false,
    status: 403,
    error: "Localhost origin forbidden in production",
  };
}

function checkPreview(hostname: string, isDevOrTest: boolean): OriginCheckResult | null {
  if (!hostname.endsWith(".vercel.app")) {
    return null;
  }
  if (process.env.VERCEL_ENV === "preview" || isDevOrTest) {
    return { allowed: true, status: 200 };
  }
  return {
    allowed: false,
    status: 403,
    error: "Preview origin forbidden in production",
  };
}

function isAllowedProductionOrigin(parsedOrigin: string): boolean {
  const canonicalOrigins = new Set([
    "https://alchm.kitchen",
    "https://www.alchm.kitchen",
  ]);

  if (process.env.AUTH_URL) {
    try {
      const authUrl = new URL(process.env.AUTH_URL);
      const authHost = authUrl.hostname.toLowerCase();
      if (authHost === "alchm.kitchen" || authHost === "www.alchm.kitchen") {
        canonicalOrigins.add(authUrl.origin);
      }
    } catch {
      // ignore invalid AUTH_URL
    }
  }

  return canonicalOrigins.has(parsedOrigin);
}

export function checkAllowedOrigin(request: Request): OriginCheckResult {
  const origin = request.headers.get("origin");
  if (!origin || origin.trim().length === 0) {
    return {
      allowed: false,
      status: 403,
      error: "Missing Origin header",
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(origin);
  } catch {
    return {
      allowed: false,
      status: 403,
      error: "Invalid Origin header",
    };
  }

  const hostname = parsed.hostname.toLowerCase();
  const isDevOrTest = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";

  const localResult = checkLocalhost(hostname, isDevOrTest);
  if (localResult) return localResult;

  const previewResult = checkPreview(hostname, isDevOrTest);
  if (previewResult) return previewResult;

  if (isAllowedProductionOrigin(parsed.origin)) {
    return { allowed: true, status: 200 };
  }

  return {
    allowed: false,
    status: 403,
    error: "Forbidden origin",
  };
}

export function assertAllowedOrigin(request: Request): NextResponse | null {
  const result = checkAllowedOrigin(request);
  if (!result.allowed) {
    return NextResponse.json(
      { error: result.error ?? "Forbidden origin" },
      { status: result.status },
    );
  }
  return null;
}
