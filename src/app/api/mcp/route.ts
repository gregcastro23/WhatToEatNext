/**
 * @file src/app/api/mcp/route.ts
 *
 * Streamable HTTP transport endpoint for Model Context Protocol (MCP) clients.
 * Supports Meta Muse, Muse Code CLI, Cursor, Claude Desktop, and autonomous customer agents.
 *
 * Implements the official 2026-07-28 Streamable HTTP specification:
 * - Single endpoint (POST /api/mcp) accepting JSON-RPC messages.
 * - Stateless execution mode (`sessionIdGenerator: undefined`) for horizontal scalability and serverless safety.
 * - Enforces hard 256 KB request payload cap (413 Payload Too Large).
 * - Full CORS headers with MCP-Protocol-Version and Retry-After exposure.
 * - Stateless 405 Method Not Allowed on GET/DELETE (Allow: POST, OPTIONS).
 * - HTTP Bearer authentication (`Authorization: Bearer <sk_alchm_...>`) mapped to caller verification.
 * - HTTP header bridging for Idempotency-Key, Correlation-ID, and Caller attribution.
 * - Full Triad support: Tools, Prompts, Resources, Resource Templates, and Completions.
 */

import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { resolveCaller, type ResolvedCaller } from "@/lib/mcp/auth";
import { createAlchmMcpServer } from "@/lib/mcp/serverFactory";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_PAYLOAD_BYTES = 256 * 1024; // 256 KB max payload cap

function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

function extractBearer(header: string | null): string | null {
  if (!header) return null;
  const match = header.match(/^Bearer\s+([A-Za-z0-9_.~-]+)$/i);
  return match?.[1]?.trim() ?? null;
}

function addCorsHeaders(res: Response, req: Request): Response {
  const origin = req.headers.get("origin") ?? "*";
  const headers = new Headers(res.headers);
  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Accept, Authorization, Idempotency-Key, X-Idempotency-Key, X-Correlation-ID, X-Request-ID, Mcp-Session-Id, MCP-Protocol-Version, User-Agent",
  );
  headers.set(
    "Access-Control-Expose-Headers",
    "Content-Type, Mcp-Session-Id, X-Correlation-ID, Retry-After",
  );
  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers,
  });
}

function normalizeRequest(req: Request): Request {
  const headers = new Headers(req.headers);
  const accept = headers.get("accept") ?? "";
  if (!accept.includes("application/json") || !accept.includes("text/event-stream")) {
    headers.set("accept", "application/json, text/event-stream");
  }
  return new Request(req.url, {
    method: req.method,
    headers,
    body: null,
  });
}

interface BridgeHeaders {
  bearerToken: string | null;
  idempotencyKey: string | null;
  correlationId: string | null;
  userAgent: string | null;
}

function bridgeRpcHeaders(body: Record<string, unknown> | null, headers: BridgeHeaders): void {
  if (body?.method !== "tools/call" || !isRecord(body.params)) return;
  const { params } = body;
  if (!isRecord(params.arguments)) {
    params.arguments = {};
  }
  const { arguments: args } = params;
  if (!isRecord(args)) return;
  if (!isRecord(args._meta)) {
    args._meta = {};
  }
  const { _meta: meta } = args;
  if (!isRecord(meta)) return;

  if (headers.bearerToken && !meta.apiKey && !meta.authKey) {
    meta.apiKey = headers.bearerToken;
  }
  if (headers.idempotencyKey && !meta.idempotencyKey) {
    meta.idempotencyKey = headers.idempotencyKey;
  }
  if (headers.correlationId && !meta.correlationId) {
    meta.correlationId = headers.correlationId;
  }
  if (headers.userAgent && !meta.caller) {
    meta.caller = headers.userAgent.slice(0, 64);
  }
}

export function OPTIONS(req: Request): Response {
  const origin = req.headers.get("origin") ?? "*";
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Accept, Authorization, Idempotency-Key, X-Idempotency-Key, X-Correlation-ID, X-Request-ID, Mcp-Session-Id, MCP-Protocol-Version, User-Agent",
      "Access-Control-Expose-Headers":
        "Content-Type, Mcp-Session-Id, X-Correlation-ID, Retry-After",
      "Access-Control-Max-Age": "86400",
    },
  });
}

function makePayloadTooLargeResponse(req: Request): Response {
  return addCorsHeaders(
    new Response(
      JSON.stringify({
        jsonrpc: "2.0",
        error: {
          code: -32600,
          message: "Payload Too Large: maximum allowed MCP request body is 256 KB",
        },
        id: null,
      }),
      {
        status: 413,
        headers: { "Content-Type": "application/json" },
      },
    ),
    req,
  );
}

function checkPayloadSize(req: Request, rawText: string): Response | null {
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_PAYLOAD_BYTES) {
    return makePayloadTooLargeResponse(req);
  }
  if (new TextEncoder().encode(rawText).length > MAX_PAYLOAD_BYTES) {
    return makePayloadTooLargeResponse(req);
  }
  return null;
}

function extractRequestHeaders(req: Request): BridgeHeaders {
  return {
    bearerToken: extractBearer(req.headers.get("authorization")),
    idempotencyKey:
      req.headers.get("idempotency-key") ??
      req.headers.get("x-idempotency-key") ??
      null,
    correlationId:
      req.headers.get("x-correlation-id") ??
      req.headers.get("x-request-id") ??
      null,
    userAgent: req.headers.get("user-agent") ?? null,
  };
}

async function executeStatelessRpc(
  req: Request,
  body: Record<string, unknown> | null,
  caller: ResolvedCaller | undefined,
  sessionId: string,
): Promise<Response> {
  const transport = new WebStandardStreamableHTTPServerTransport({
    enableJsonResponse: true,
  });
  const server = createAlchmMcpServer({
    sessionId,
    ...(caller ? { defaultCaller: caller } : {}),
  });
  await server.connect(transport);
  const normalizedReq = normalizeRequest(req);
  const response = await transport.handleRequest(normalizedReq, {
    parsedBody: body,
  });
  return addCorsHeaders(response, req);
}

export async function POST(req: Request): Promise<Response> {
  try {
    const rawText = await req.text();
    const sizeViolation = checkPayloadSize(req, rawText);
    if (sizeViolation) return sizeViolation;

    let body: Record<string, unknown> | null = null;
    try {
      const parsed: unknown = rawText ? JSON.parse(rawText) : null;
      if (isRecord(parsed)) {
        body = parsed;
      }
    } catch {
      body = null;
    }

    const headers = extractRequestHeaders(req);
    let caller: ResolvedCaller | undefined = undefined;
    if (headers.bearerToken) {
      caller = await resolveCaller({}, { bearerToken: headers.bearerToken });
    }

    bridgeRpcHeaders(body, headers);
    return await executeStatelessRpc(req, body, caller, headers.correlationId ?? "http");
  } catch (err) {
    process.stderr.write(`[api/mcp] error handling request: ${String(err)}\n`);
    return addCorsHeaders(
      new Response(
        JSON.stringify({
          jsonrpc: "2.0",
          error: {
            code: -32603,
            message: "Internal server error handling MCP request",
          },
          id: null,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      ),
      req,
    );
  }
}

/**
 * Per the official MCP Streamable HTTP specification:
 * Stateless servers (without sticky sessions or server-initiated SSE streams)
 * return 405 Method Not Allowed on GET and DELETE.
 */
export function GET(req: Request): Response {
  return addCorsHeaders(
    new Response(
      JSON.stringify({
        jsonrpc: "2.0",
        error: {
          code: -32601,
          message:
            "Method Not Allowed: Stateless MCP gateway only supports POST and OPTIONS",
        },
        id: null,
      }),
      {
        status: 405,
        headers: {
          Allow: "POST, OPTIONS",
          "Content-Type": "application/json",
        },
      },
    ),
    req,
  );
}

export function DELETE(req: Request): Response {
  return addCorsHeaders(
    new Response(
      JSON.stringify({
        jsonrpc: "2.0",
        error: {
          code: -32601,
          message:
            "Method Not Allowed: Stateless MCP gateway only supports POST and OPTIONS",
        },
        id: null,
      }),
      {
        status: 405,
        headers: {
          Allow: "POST, OPTIONS",
          "Content-Type": "application/json",
        },
      },
    ),
    req,
  );
}
