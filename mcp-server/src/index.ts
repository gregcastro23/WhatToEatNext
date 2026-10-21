#!/usr/bin/env node
/** Stdio transport; the shared catalog and invocation layer own tool behavior. */
import { randomUUID } from "node:crypto";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import {
  MCP_SERVER_VERSION,
  TOOL_DEFINITIONS,
  isToolName,
} from "../../src/lib/mcp/catalog.js";

// Application services log during module initialization. Redirect before their
// dynamic import: stdout belongs exclusively to newline-delimited JSON-RPC.
console.log = (...args: unknown[]) => console.error(...args);
console.info = (...args: unknown[]) => console.error(...args);
console.debug = (...args: unknown[]) => console.error(...args);

const PROD_BACKEND_URL = "https://alchm.kitchen";
const DEV_BACKEND_URL = "http://localhost:3000";

/**
 * True when this process is a distributable artifact — the npm `dist/index.js`
 * bundle or the `bun build --compile` binary — rather than a raw
 * `bun run src/index.ts`. The build scripts bake `ALCHM_MCP_BUNDLED=1` via
 * `--define`; the `$bunfs` check is a runtime fallback for a compiled binary
 * built without that flag (Bun executables resolve their entry inside the
 * embedded "$bunfs" virtual filesystem; a from-source run resolves a real path).
 */
function isBundledSidecar(): boolean {
  if (process.env.ALCHM_MCP_BUNDLED === "1") return true;
  const bunMain = (globalThis as { Bun?: { main?: string } }).Bun?.main ?? "";
  return bunMain.includes("/$bunfs/");
}

// Explicit backend env (any of these) wins and is left untouched. Only when
// none is set do we choose a default: prod for bundled artifacts, localhost for
// from-source dev runs.
const hasExplicitBackend = Boolean(
  process.env.ALCHM_MCP_BACKEND_URL?.trim() ||
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  process.env.SITE_URL?.trim() ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
  process.env.VERCEL_URL?.trim(),
);
if (!hasExplicitBackend) {
  process.env.ALCHM_MCP_BACKEND_URL = isBundledSidecar()
    ? PROD_BACKEND_URL
    : DEV_BACKEND_URL;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function structuredObject(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : { data: value };
}

async function main(): Promise<void> {
  // Import only after backend defaults and stdout protection are in place.
  const { invokeTool } = await import("../../src/lib/mcp/tools.js");
  const { drainMcpInvocations } =
    await import("../../src/lib/mcp/invocationLog.js");
  const sessionId = randomUUID();
  const server = new Server(
    { name: "alchm-mcp-server", version: MCP_SERVER_VERSION },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOL_DEFINITIONS,
  }));
  server.setRequestHandler(CallToolRequestSchema, async (request, extra) => {
    const { name, arguments: args } = request.params;
    if (!isToolName(name))
      throw new McpError(ErrorCode.InvalidParams, `Unknown tool: ${name}`);
    const result = await invokeTool(name, args ?? {}, {
      signal: extra.signal,
      correlationId: `stdio:${sessionId}:${extra.requestId}`,
    });
    const payload = result.ok
      ? {
          ...structuredObject(result.data),
          correlationId: result.correlationId,
        }
      : {
          errorCode: result.errorCode ?? "INTERNAL",
          message: result.errorMessage ?? "Tool failed",
          correlationId: result.correlationId,
          ...(result.data !== null ? { data: result.data } : {}),
          ...(typeof result.summary.retryAfterSec === "number"
            ? { retryAfterSec: result.summary.retryAfterSec }
            : {}),
        };
    return {
      ...(result.ok ? {} : { isError: true }),
      structuredContent: payload,
      content: [
        { type: "text" as const, text: JSON.stringify(payload, null, 2) },
      ],
    };
  });

  let shuttingDown = false;
  const shutdown = (): void => {
    if (shuttingDown) return;
    // Set the guard before close(): the SDK synchronously invokes onclose.
    shuttingDown = true;
    void (async () => {
      try {
        await server.close();
      } catch (error) {
        console.error("MCP transport close failed:", error);
      }
      try {
        await drainMcpInvocations(1000);
      } catch (error) {
        console.error("MCP telemetry drain failed:", error);
      }
      process.exit(0);
    })();
  };
  server.onclose = shutdown;
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
  process.stdin.once("end", shutdown);
  process.stdin.once("close", shutdown);
  await server.connect(new StdioServerTransport());
  console.error(
    `Alchm.kitchen MCP ${MCP_SERVER_VERSION}: stdio, ${TOOL_DEFINITIONS.length} tools`,
  );
  console.error(
    `Database: ${process.env.DATABASE_URL ? "configured" : "anonymous demo mode"}; backend: ${process.env.ALCHM_MCP_BACKEND_URL ?? "configured app URL"}`,
  );
}

main().catch((error: unknown) => {
  console.error("MCP server failed:", error);
  process.exitCode = 1;
});
