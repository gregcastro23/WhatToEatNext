/**
 * @file src/app/api/mcp/openapi.json/route.ts
 *
 * Serves the OpenAPI 3.1.0 specification for Alchm.kitchen's 13 MCP tools
 * (`GET /api/mcp/openapi.json`) for Custom GPT Actions, Google Vertex AI
 * Extensions, and OpenAPI-compatible agent runtimes.
 */

import {
  buildCorsHeaders,
  checkOriginSecurity,
} from "@/lib/mcp/httpSecurity";
import { buildMcpOpenApiSpec } from "@/lib/mcp/openapiBridge";

export const dynamic = "force-dynamic";

export function GET(req: Request): Response {
  const originViolation = checkOriginSecurity(req);
  if (originViolation) return originViolation;

  const spec = buildMcpOpenApiSpec(req);
  const headers = buildCorsHeaders(req, "GET, OPTIONS");
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "public, max-age=300");

  return new Response(JSON.stringify(spec, null, 2), {
    status: 200,
    headers,
  });
}

export function OPTIONS(req: Request): Response {
  const originViolation = checkOriginSecurity(req);
  if (originViolation) return originViolation;

  const headers = buildCorsHeaders(req, "GET, OPTIONS");
  headers.set("Access-Control-Max-Age", "86400");
  return new Response(null, {
    status: 204,
    headers,
  });
}
