/**
 * @file src/lib/mcp/openapiBridge.ts
 *
 * OpenAPI 3.1.0 specification generator and REST tool execution bridge
 * for Custom GPT Actions, Google Vertex AI Extensions, and webhook-based agents.
 */

import {
  MCP_SERVER_VERSION,
  TOOL_COSTS,
  TOOL_DEFINITIONS,
  isToolName,
  type ToolDefinition,
} from "./catalog";
import {
  buildCorsHeaders,
  checkOriginSecurity,
  getTrustedOrigin,
  redactSensitiveString,
} from "./httpSecurity";
import { invokeTool, structuredToolContent } from "./tools";

const MAX_REST_PAYLOAD_BYTES = 256 * 1024;

function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

function totalEsmsForTool(name: ToolDefinition["name"]): number {
  const cost = TOOL_COSTS[name];
  if (!cost) return 0;
  return cost.spirit + cost.essence + cost.matter + cost.substance;
}

function formatCostBadge(totalEsms: number, readOnlyHint: boolean): string {
  if (totalEsms > 0) {
    return `[Cost: ${totalEsms} ESMS — Requires Authorization: Bearer sk_alchm_...]`;
  }
  return readOnlyHint
    ? "[Cost: 0 ESMS — Free Tier, API key optional]"
    : "[Cost: 0 ESMS — Mutating tool, requires Authorization: Bearer sk_alchm_...]";
}

function buildOperationForTool(tool: ToolDefinition): Record<string, unknown> {
  const totalEsms = totalEsmsForTool(tool.name);
  const isReadOnlyFree = tool.annotations.readOnlyHint && totalEsms === 0;
  const costBadge = formatCostBadge(totalEsms, tool.annotations.readOnlyHint);

  return {
    operationId: tool.name,
    summary: tool.title,
    description: `${tool.description} ${costBadge}`,
    "x-esms-cost": totalEsms,
    "x-read-only": tool.annotations.readOnlyHint,
    security: isReadOnlyFree ? [{}, { BearerAuth: [] }] : [{ BearerAuth: [] }],
    requestBody: {
      required: false,
      content: {
        "application/json": {
          schema: tool.inputSchema,
        },
      },
    },
    responses: {
      "200": {
        description: `${tool.title} structured response`,
        content: {
          "application/json": {
            schema: tool.outputSchema,
          },
        },
      },
      "400": { description: "Invalid tool arguments (INVALID_ARGS)" },
      "401": { description: "Missing or invalid Bearer API key (UNAUTHORIZED)" },
      "402": { description: "Insufficient ESMS token balance (QUOTA)" },
      "429": { description: "Rate limit exceeded (RATE_LIMIT)" },
    },
  };
}

export function buildMcpOpenApiSpec(req: Request): Record<string, unknown> {
  const origin = getTrustedOrigin(req);
  const paths: Record<string, unknown> = {};

  for (const tool of TOOL_DEFINITIONS) {
    paths[`/api/mcp/rest/${tool.name}`] = {
      post: buildOperationForTool(tool),
    };
  }

  return {
    openapi: "3.1.0",
    info: {
      title: "Alchm.kitchen Culinary & Planetary Astrology REST Tool Bridge",
      version: MCP_SERVER_VERSION,
      description:
        "OpenAPI 3.1.0 REST bridge exposing the 13 Alchm.kitchen MCP tools for Custom GPT Actions, Google Vertex AI Extensions, Gemini Function Calling, and webhook agents. 8 read-only tools are Free (0 ESMS, no API key required); metered recipe/snapshot tools (what_to_cook_now, generate_cosmic_recipe, create_evidence_snapshot, submit_recipe_reflection) and profile mutations (update_culinary_profile) require Authorization: Bearer sk_alchm_...",
    },
    servers: [
      {
        url: origin,
        description: "Alchm.kitchen Production MCP & REST Gateway",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "sk_alchm_*",
          description:
            "Mint an API key at https://alchm.kitchen/profile/api-keys. Optional on 0-ESMS readOnlyHint: true tools; required on paid or state-mutating tools.",
        },
      },
    },
    paths,
  };
}

const ERROR_CODE_STATUS_MAP: Readonly<Record<string, number>> = {
  INVALID_ARGS: 400,
  UNAUTHORIZED: 401,
  QUOTA: 402,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMIT: 429,
  UPSTREAM: 502,
  CANCELLED: 502,
};

export function mapToolErrorCodeToHttpStatus(errorCode?: string): number {
  if (!errorCode) return 500;
  return ERROR_CODE_STATUS_MAP[errorCode] ?? 500;
}

function extractBearer(header: string | null): string | null {
  if (!header) return null;
  const match = header.match(/^Bearer\s+([A-Za-z0-9_.~-]+)$/i);
  return match?.[1]?.trim() ?? null;
}

function assignIfMissing(
  target: Record<string, unknown>,
  key: string,
  val: string | null,
): void {
  if (val && !target[key]) {
    target[key] = val;
  }
}

function injectRestHeadersIntoArgs(
  rawArgs: Record<string, unknown>,
  req: Request,
): Record<string, unknown> {
  const args: Record<string, unknown> = { ...rawArgs };
  const meta: Record<string, unknown> = isRecord(args._meta)
    ? { ...args._meta }
    : {};

  const bearer = extractBearer(req.headers.get("authorization"));
  if (bearer && !meta.apiKey && !meta.authKey) {
    meta.apiKey = bearer;
  }
  assignIfMissing(
    meta,
    "idempotencyKey",
    req.headers.get("idempotency-key") ?? req.headers.get("x-idempotency-key"),
  );
  assignIfMissing(
    meta,
    "correlationId",
    req.headers.get("x-correlation-id") ?? req.headers.get("x-request-id"),
  );
  const ua = req.headers.get("user-agent");
  assignIfMissing(meta, "caller", ua ? ua.slice(0, 64) : null);

  if (Object.keys(meta).length > 0) {
    args._meta = meta;
  }
  return args;
}

function jsonWithCors(
  req: Request,
  status: number,
  payload: Record<string, unknown>,
): Response {
  const headers = buildCorsHeaders(req);
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store");
  return new Response(JSON.stringify(payload, null, 2), { status, headers });
}

async function parseAndInvokeRestTool(
  toolName: string,
  req: Request,
): Promise<Response> {
  const rawText = await req.text();
  if (new TextEncoder().encode(rawText).length > MAX_REST_PAYLOAD_BYTES) {
    return jsonWithCors(req, 413, {
      errorCode: "PAYLOAD_TOO_LARGE",
      message: "Request body exceeds 256 KB limit.",
      remediation: "Reduce the JSON payload size below 256 KB.",
    });
  }

  const parsed: unknown = rawText.trim() ? JSON.parse(rawText) : {};
  if (!isRecord(parsed)) {
    return jsonWithCors(req, 400, {
      errorCode: "INVALID_ARGS",
      message: "Request body must be a JSON object.",
      remediation: "Send a JSON object matching the tool's inputSchema.",
    });
  }

  const bridgedArgs = injectRestHeadersIntoArgs(parsed, req);
  const result = await invokeTool(toolName, bridgedArgs, {
    signal: req.signal,
  });
  const payload = structuredToolContent(result);
  const status = result.ok
    ? 200
    : mapToolErrorCodeToHttpStatus(result.errorCode);
  return jsonWithCors(req, status, payload);
}

export async function executeRestToolCall(
  toolName: string,
  req: Request,
): Promise<Response> {
  const originViolation = checkOriginSecurity(req);
  if (originViolation) return originViolation;

  if (!isToolName(toolName)) {
    return jsonWithCors(req, 404, {
      errorCode: "NOT_FOUND",
      message: `Unknown tool: ${toolName}`,
      remediation:
        "Fetch GET /api/mcp/openapi.json to inspect valid tool operationIds.",
    });
  }

  try {
    return await parseAndInvokeRestTool(toolName, req);
  } catch (err) {
    const rawMsg =
      err instanceof Error ? err.message : "Malformed JSON request body";
    return jsonWithCors(req, 400, {
      errorCode: "INVALID_ARGS",
      message: redactSensitiveString(rawMsg),
      remediation:
        "Ensure the POST body is valid JSON matching the tool's inputSchema.",
    });
  }
}
