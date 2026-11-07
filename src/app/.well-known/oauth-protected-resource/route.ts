/**
 * @file src/app/.well-known/oauth-protected-resource/route.ts
 *
 * OAuth 2.0 Protected Resource Metadata (RFC 9728) endpoint.
 *
 * Discovered by modern MCP clients (including Meta Muse, Cursor, and Claude Desktop)
 * when connecting to the Streamable HTTP gateway at `/api/mcp`.
 */

import { NextResponse } from "next/server";
import { getTrustedOrigin } from "@/lib/mcp/httpSecurity";

export const dynamic = "force-dynamic";

export function GET(req: Request): Response {
  // Gate behind ENABLE_MCP_OAUTH so Phase 1 Bearer clients aren't misdirected
  // into an unimplemented browser OAuth flow.
  if (process.env.ENABLE_MCP_OAUTH !== "true") {
    return NextResponse.json(
      {
        error: "OAuth discovery disabled",
        message:
          "Phase 1 authentication uses static Bearer API keys minted at /profile/api-keys.",
      },
      {
        status: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
        },
      },
    );
  }

  const origin = getTrustedOrigin(req);
  const resource = `${origin}/api/mcp`;

  return NextResponse.json(
    {
      resource,
      authorization_servers: [origin],
      scopes_supported: ["mcp:invoke", "mcp:read", "mcp:recipes", "mcp:reflections"],
      bearer_methods_supported: ["header"],
      resource_documentation: `${origin}/docs/mcp`,
    },
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Cache-Control": "public, max-age=3600",
      },
    },
  );
}

export function OPTIONS(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}

