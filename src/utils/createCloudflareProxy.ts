/**
 * Factory for creating Cloudflare proxy route handlers
 *
 * Creates lightweight route handlers that proxy requests to Vercel.
 * Used to reduce Cloudflare Worker bundle size.
 */

import { NextResponse } from "next/server";

const VERCEL_API_URL = process.env.VERCEL_API_URL || "https://v0-alchm-kitchen.vercel.app";

interface ProxyOptions {
  /** The API path (e.g., "/api/cuisines/recommend") */
  path: string;
  /** Methods to support (default: ["GET", "POST"]) */
  methods?: Array<"GET" | "POST" | "PUT" | "DELETE" | "PATCH">;
}

async function proxyRequest(
  request: Request,
  path: string,
  method: string
): Promise<Response> {
  const url = new URL(request.url);
  const targetUrl = `${VERCEL_API_URL}${path}${url.search}`;

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Forward authorization if present
    const auth = request.headers.get('Authorization');
    if (auth) headers['Authorization'] = auth;

    // Forward session cookies for NextAuth authentication
    const cookie = request.headers.get('Cookie') || request.headers.get('cookie');
    if (cookie) headers['Cookie'] = cookie;

    // Add internal secret for Vercel API verification
    const internalSecret = process.env.INTERNAL_API_SECRET;
    if (internalSecret) {
      headers['X-Internal-Secret'] = internalSecret;
    }

    // Forward client IP
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) headers['X-Forwarded-For'] = forwardedFor;

    const proxyResponse = await fetch(targetUrl, {
      method,
      headers,
      body: method !== 'GET' && method !== 'HEAD'
        ? await request.text()
        : undefined,
    });

    // Try to parse as JSON, fall back to text
    const contentType = proxyResponse.headers.get('content-type');
    let data;
    if (contentType?.includes('application/json')) {
      data = await proxyResponse.json();
    } else {
      data = await proxyResponse.text();
    }

    return contentType?.includes('application/json')
      ? NextResponse.json(data, {
          status: proxyResponse.status,
          headers: {
            'X-Proxied-From': 'cloudflare-worker',
            'X-Upstream': VERCEL_API_URL,
          },
        })
      : new Response(data, {
          status: proxyResponse.status,
          headers: {
            'Content-Type': contentType || 'text/plain',
            'X-Proxied-From': 'cloudflare-worker',
            'X-Upstream': VERCEL_API_URL,
          },
        });
  } catch (error) {
    console.error(`Proxy error for ${path}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: 'Proxy request failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        path,
        upstream: VERCEL_API_URL,
      },
      { status: 502 }
    );
  }
}

/**
 * Create proxy handlers for a route
 *
 * Usage:
 * ```ts
 * import { createProxyHandlers } from "@/utils/createCloudflareProxy";
 * export const { GET, POST } = createProxyHandlers({ path: "/api/cuisines/recommend" });
 * ```
 */
export function createProxyHandlers(options: ProxyOptions) {
  const { path, methods = ["GET", "POST"] } = options;

  const handlers: Record<string, (request: Request) => Promise<Response>> = {};

  if (methods.includes("GET")) {
    handlers.GET = (request: Request) => proxyRequest(request, path, "GET");
  }
  if (methods.includes("POST")) {
    handlers.POST = (request: Request) => proxyRequest(request, path, "POST");
  }
  if (methods.includes("PUT")) {
    handlers.PUT = (request: Request) => proxyRequest(request, path, "PUT");
  }
  if (methods.includes("DELETE")) {
    handlers.DELETE = (request: Request) => proxyRequest(request, path, "DELETE");
  }
  if (methods.includes("PATCH")) {
    handlers.PATCH = (request: Request) => proxyRequest(request, path, "PATCH");
  }

  return handlers;
}
