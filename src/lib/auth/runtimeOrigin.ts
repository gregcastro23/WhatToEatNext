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
  if (!shouldUseLocalAuthOrigin(request)) {
    return null;
  }

  const origin = resolveRequestOrigin(request);
  process.env.AUTH_URL = origin;
  process.env.NEXTAUTH_URL = origin;
  process.env.NEXTAUTH_URL_INTERNAL = origin;

  return origin;
}
