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
import { readApiKey, runBridgeMain, selectMode } from "./remoteBridge.js";

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

/**
 * A key and no `DATABASE_URL` cannot be verified in-process (the database is the operator's), and an unverifiable key
 * fails every tool. That is the install an external user gets from the README, so those calls are forwarded to the hosted
 * endpoint, which validates the same keys. Operator mode (a database) and anonymous mode (no key) stay in-process.
 */
async function bridge(): Promise<void> {
  process.exitCode = await runBridgeMain(process, `alchm-mcp-bridge/${MCP_SERVER_VERSION}`);
}

async function main(): Promise<void> {
  if (selectMode(process.env) === "bridge") return bridge();
  // Import only after backend defaults and stdout protection are in place.
  const { createAlchmMcpServer } =
    await import("../../src/lib/mcp/serverFactory.js");
  const { drainMcpInvocations } =
    await import("../../src/lib/mcp/invocationLog.js");
  const sessionId = randomUUID();
  const server = createAlchmMcpServer({ sessionId });

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
  if (process.env.DATABASE_URL && readApiKey(process.env)) {
    // Many clients pass on the shell's environment, and DATABASE_URL is a common name: say which mode this is, and how to leave it.
    console.error(
      "An API key and DATABASE_URL are both set, so this process checks keys against that database (operator mode). To use the hosted service instead, unset DATABASE_URL or set it to an empty string in this server's env block.",
    );
  }
}

main().catch((error: unknown) => {
  console.error("MCP server failed:", error);
  process.exitCode = 1;
});
