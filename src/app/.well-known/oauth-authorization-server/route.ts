/**
 * @file src/app/.well-known/oauth-authorization-server/route.ts
 *
 * OAuth 2.0 Authorization Server Metadata (RFC 8414) endpoint.
 *
 * Provides metadata for MCP clients and identity providers discovering
 * token and authorization endpoints on alchm.kitchen.
 */

import { NextResponse } from "next/server";
import { getTrustedOrigin } from "@/lib/mcp/httpSecurity";

export const dynamic = "force-dynamic";

function getAuthServerMetadata(origin: string): Record<string, unknown> {
  return {
    issuer: origin,
    authorization_endpoint: `${origin}/profile/api-keys`,
    token_endpoint: `${origin}/api/auth/token`,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    code_challenge_methods_supported: ["S256"],
    token_endpoint_auth_methods_supported: [
      "none",
      "client_secret_post",
      "client_secret_basic",
    ],
    scopes_supported: ["mcp:invoke", "mcp:read", "mcp:recipes", "mcp:reflections"],
    service_documentation: `${origin}/docs/mcp`,
  };
}

export function GET(req: Request): Response {
  // Gate behind ENABLE_MCP_OAUTH until Phase 2 OAuth 2.1 PKCE endpoints are live.
  if (process.env.ENABLE_MCP_OAUTH !== "true") {
    return NextResponse.json(
      {
        error: "OAuth authorization server disabled",
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

  return NextResponse.json(getAuthServerMetadata(origin), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Cache-Control": "public, max-age=3600",
    },
  });
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

