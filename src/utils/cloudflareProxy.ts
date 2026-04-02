/**
 * Cloudflare Proxy Utility
 *
 * When VERCEL_API_URL is set, proxies API requests to Vercel
 * instead of processing locally. This reduces Cloudflare Worker bundle size.
 */

const VERCEL_API_URL = process.env.VERCEL_API_URL;

/**
 * Check if we should proxy to Vercel
 */
export function shouldProxy(): boolean {
  return !!VERCEL_API_URL;
}

/**
 * Proxy a request to Vercel
 * Returns null if proxying is disabled, otherwise returns the proxied Response
 */
export async function proxyToVercel(
  request: Request,
  pathname: string
): Promise<Response | null> {
  if (!VERCEL_API_URL) {
    return null;
  }

  const url = new URL(request.url);
  const targetUrl = `${VERCEL_API_URL}${pathname}${url.search}`;

  try {
    const proxyResponse = await fetch(targetUrl, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        // Forward relevant headers
        ...(request.headers.get('Authorization')
          ? { 'Authorization': request.headers.get('Authorization')! }
          : {}),
      },
      body: request.method !== 'GET' && request.method !== 'HEAD'
        ? await request.text()
        : undefined,
    });

    // Return proxied response with CORS headers
    return new Response(proxyResponse.body, {
      status: proxyResponse.status,
      statusText: proxyResponse.statusText,
      headers: {
        'Content-Type': proxyResponse.headers.get('Content-Type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'X-Proxied-From': 'cloudflare',
      },
    });
  } catch (error) {
    console.error(`Proxy error for ${pathname}:`, error);
    return new Response(
      JSON.stringify({ error: 'Proxy request failed', details: String(error) }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
