/**
 * @file src/app/api/mcp/rest/[tool]/route.ts
 *
 * REST execution endpoint (`POST /api/mcp/rest/[tool]`) backing the OpenAPI 3.1.0
 * bridge (`/api/mcp/openapi.json`). Unwraps MCP tool envelopes into direct REST
 * JSON responses (`200 OK` or `400`/`401`/`402`/`404`/`429` error status codes).
 */

import {
  buildCorsHeaders,
  checkOriginSecurity,
} from "@/lib/mcp/httpSecurity";
import { executeRestToolCall } from "@/lib/mcp/openapiBridge";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(
  req: Request,
  context: { params: Promise<{ tool: string }> },
): Promise<Response> {
  const { tool } = await context.params;
  return executeRestToolCall(tool, req);
}

export function OPTIONS(req: Request): Response {
  const originViolation = checkOriginSecurity(req);
  if (originViolation) return originViolation;

  const headers = buildCorsHeaders(req, "POST, OPTIONS");
  headers.set("Access-Control-Max-Age", "86400");
  return new Response(null, {
    status: 204,
    headers,
  });
}
