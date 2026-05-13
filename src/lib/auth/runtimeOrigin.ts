import type { NextRequest } from "next/server";

type RequestLike = Request | NextRequest;

function getForwardedHost(request: RequestLike): string | null {
  return request.headers.get("x-forwarded-host") ?? request.headers.get("host");
}

function getForwardedProto(request: RequestLike): string | null {
  return request.headers.get("x-forwarded-proto");
}

function isLocalHost(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname === "[::1]"
  );
}

export function resolveRequestOrigin(request: RequestLike): string {
  const requestUrl = new URL(request.url);
  const host = getForwardedHost(request) ?? requestUrl.host;
  const proto = getForwardedProto(request) ?? requestUrl.protocol.replace(":", "");

  return `${proto}://${host}`;
}

export function shouldUseLocalAuthOrigin(request: RequestLike): boolean {
  const host = getForwardedHost(request);
  const hostname = host?.split(":")[0] ?? new URL(request.url).hostname;

  return isLocalHost(hostname);
}

export function applyRequestAuthOrigin(request: RequestLike): string | null {
  const origin = resolveRequestOrigin(request);
  const host = getForwardedHost(request);
  const hostname = host?.split(":")[0] ?? new URL(request.url).hostname;

  // Always apply origin if it's localhost
  const isLocal = isLocalHost(hostname);
  
  // Also apply if we are on a Vercel preview URL or if the current AUTH_URL is missing
  const isVercelPreview = hostname.endsWith(".vercel.app");
  const isMissingSecret = !process.env.AUTH_SECRET;
  
  // DIAGNOSTIC: Log origin resolution
  if (process.env.NODE_ENV !== "production") {
    console.log(`[auth-origin] Host: ${hostname}, Origin: ${origin}, isLocal: ${isLocal}, isPreview: ${isVercelPreview}`);
  }

  if (isLocal || isVercelPreview || isMissingSecret || !process.env.AUTH_URL) {
    process.env.AUTH_URL = origin;
    process.env.NEXTAUTH_URL = origin;
    process.env.NEXTAUTH_URL_INTERNAL = origin;
    return origin;
  }

  // Even in production, if there's a mismatch between AUTH_URL and current host (e.g. www vs non-www),
  // NextAuth v5 might fail. We should consider being more aggressive here,
  // but for now let's just log it if they don't match.
  if (process.env.AUTH_URL && !origin.startsWith(process.env.AUTH_URL)) {
    console.warn(`[auth-origin] Mismatch detected! AUTH_URL=${process.env.AUTH_URL}, Request Origin=${origin}. This may cause 401 errors.`);
    
    // Auto-fix for www vs non-www mismatches in production
    if (hostname.includes("alchm.kitchen")) {
      process.env.AUTH_URL = origin;
      process.env.NEXTAUTH_URL = origin;
      return origin;
    }
  }

  return null;
}
