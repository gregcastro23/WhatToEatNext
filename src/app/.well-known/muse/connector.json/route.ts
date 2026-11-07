/**
 * @file src/app/.well-known/muse/connector.json/route.ts
 *
 * Meta Muse Connector specification endpoint.
 * Conforms to platform.muse.ai specification for registering the Alchm.kitchen
 * Model Context Protocol (MCP) Streamable HTTP connector.
 */

import { NextResponse } from "next/server";
import { getTrustedOrigin } from "@/lib/mcp/httpSecurity";

export const dynamic = "force-dynamic";

const MCP_SCOPES = [
  {
    name: "mcp:invoke",
    description: "Execute general MCP tools, prompts, and resources",
  },
  {
    name: "mcp:read",
    description: "Calculate live sky transits and alchemize ingredients",
  },
  {
    name: "mcp:recipes",
    description: "Search cosmic recipes and create evidence snapshots (spends ESMS)",
  },
  {
    name: "mcp:reflections",
    description: "Submit culinary reflections and adaptations",
  },
];

function getConnectorManifest(origin: string): Record<string, unknown> {
  return {
    $schema: "https://platform.muse.ai/schemas/v1/connector.json",
    id: "io.github.gregcastro23.alchm-kitchen",
    name: "Alchm Kitchen",
    displayName: "Alchm.kitchen Culinary & Planetary Astrology",
    description:
      "Empower your Muse agent with live planetary transits, culinary ingredient alchemy (ESMS), cosmic recipe search, and synastry overlays.",
    website: origin,
    privacyPolicyUrl: `${origin}/privacy`,
    termsOfServiceUrl: `${origin}/terms`,
    documentationUrl: `${origin}/docs/mcp`,
    protocol: {
      type: "mcp",
      version: "2026-07-28",
      transport: {
        type: "streamable-http",
        endpoint: `${origin}/api/mcp`,
      },
    },
    authentication:
      process.env.ENABLE_MCP_OAUTH === "true"
        ? {
            type: "oauth2",
            authorizationUrl: `${origin}/profile/api-keys`,
            tokenUrl: `${origin}/api/auth/token`,
            scopes: MCP_SCOPES,
            fallbackApiKeyHeader: "Authorization",
          }
        : {
            type: "api_key",
            header: "Authorization",
            valuePrefix: "Bearer ",
            documentationUrl: `${origin}/profile/api-keys`,
          },
  };
}

export function GET(req: Request): Response {
  const origin = getTrustedOrigin(req);
  return NextResponse.json(getConnectorManifest(origin), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Cache-Control": "public, max-age=3600, must-revalidate",
      "Vary": "Host, Origin, Accept",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
    },
  });
}

export function OPTIONS(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Max-Age": "86400",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
    },
  });
}

