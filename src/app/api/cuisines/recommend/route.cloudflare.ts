/**
 * Cloudflare Proxy Route for /api/cuisines/recommend
 *
 * This is a lightweight proxy that forwards requests to the Vercel deployment.
 * Use this file instead of the full route.ts when building for Cloudflare
 * to significantly reduce bundle size.
 *
 * To use: Replace route.ts with this file when building for Cloudflare:
 *   mv src/app/api/cuisines/recommend/route.ts route.full.ts
 *   mv src/app/api/cuisines/recommend/route.cloudflare.ts route.ts
 */

import { NextResponse } from "next/server";

const VERCEL_API_URL = process.env.VERCEL_API_URL || "https://v0-alchm-kitchen.vercel.app";

async function proxyRequest(request: Request, method: string): Promise<Response> {
  const url = new URL(request.url);
  const targetUrl = `${VERCEL_API_URL}/api/cuisines/recommend${url.search}`;

  try {
    const proxyResponse = await fetch(targetUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': request.headers.get('x-forwarded-for') || '',
      },
      body: method !== 'GET' ? await request.text() : undefined,
    });

    const data = await proxyResponse.json();

    return NextResponse.json(data, {
      status: proxyResponse.status,
      headers: {
        'X-Proxied-From': 'cloudflare-worker',
        'X-Upstream': VERCEL_API_URL,
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Proxy request failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        upstream: VERCEL_API_URL,
      },
      { status: 502 }
    );
  }
}

export async function GET(request: Request) {
  return proxyRequest(request, 'GET');
}

export async function POST(request: Request) {
  return proxyRequest(request, 'POST');
}
