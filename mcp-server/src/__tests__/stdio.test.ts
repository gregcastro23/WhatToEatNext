/**
 * MCP stdio integration smoke test.
 *
 * Spawns the actual MCP server via `bun run mcp-server/src/index.ts`,
 * speaks JSON-RPC over stdin/stdout, and asserts the basic handshake +
 * tools/list contract. Only runs when MCP_E2E=1 is set so unit-test
 * cycles stay fast and this test doesn't hard-require Bun on every CI.
 *
 * Run locally with:
 *   MCP_E2E=1 bun test mcp-server/src/__tests__/stdio.test.ts
 *
 * @file mcp-server/src/__tests__/stdio.test.ts
 */

import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { resolve } from "node:path";

const ENABLED = process.env.MCP_E2E === "1";

interface JsonRpc {
  jsonrpc: "2.0";
  id?: number;
  method?: string;
  params?: unknown;
  result?: unknown;
  error?: { code: number; message: string };
}

class StdioClient {
  proc: ChildProcessWithoutNullStreams;
  private buffer = "";
  private pending = new Map<number, (msg: JsonRpc) => void>();
  private nextId = 1;

  constructor(proc: ChildProcessWithoutNullStreams) {
    this.proc = proc;
    proc.stdout.setEncoding("utf8");
    proc.stdout.on("data", (chunk: string) => {
      this.buffer += chunk;
      let idx: number;
      while ((idx = this.buffer.indexOf("\n")) !== -1) {
        const line = this.buffer.slice(0, idx).trim();
        this.buffer = this.buffer.slice(idx + 1);
        if (!line) continue;
        try {
          const msg = JSON.parse(line) as JsonRpc;
          if (typeof msg.id === "number") {
            const cb = this.pending.get(msg.id);
            if (cb) {
              this.pending.delete(msg.id);
              cb(msg);
            }
          }
        } catch {
          // ignore non-JSON log lines from the server
        }
      }
    });
  }

  async request(method: string, params?: unknown): Promise<JsonRpc> {
    const id = this.nextId++;
    return new Promise<JsonRpc>((resolveFn, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`MCP request ${method} timed out`));
      }, 15_000);
      this.pending.set(id, (msg) => {
        clearTimeout(timer);
        resolveFn(msg);
      });
      this.proc.stdin.write(
        JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n",
      );
    });
  }

  close(): void {
    this.proc.kill("SIGTERM");
  }
}

const describeIf = ENABLED ? describe : describe.skip;

describeIf("MCP stdio transport", () => {
  let client: StdioClient;

  beforeAll(async () => {
    const serverPath = resolve(__dirname, "..", "index.ts");
    const proc = spawn("bun", ["run", serverPath], {
      stdio: ["pipe", "pipe", "pipe"],
      // A from-source run defaults the chart/transit backend to localhost:3000,
      // which isn't up in CI — point it at prod so get_live_sky_transits does a
      // real round-trip. An externally-set ALCHM_MCP_BACKEND_URL still wins.
      env: {
        ALCHM_MCP_BACKEND_URL: "https://alchm.kitchen",
        ...process.env,
      },
    });
    // Surface server stderr so failures are debuggable.
    proc.stderr.setEncoding("utf8");
    proc.stderr.on("data", (line) => {
      if (process.env.MCP_E2E_DEBUG) process.stderr.write(`[mcp] ${line}`);
    });
    client = new StdioClient(proc);

    const init = await client.request("initialize", {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "mcp-e2e-test", version: "0.0.0" },
    });
    expect(init.result).toMatchObject({
      serverInfo: { name: "alchm-mcp-server" },
    });
  });

  afterAll(() => {
    client?.close();
  });

  it("lists the five expected tools", async () => {
    const res = await client.request("tools/list");
    const tools = (res.result as { tools: Array<{ name: string }> }).tools;
    const names = tools.map((t) => t.name).sort();
    expect(names).toEqual([
      "alchemize_ingredients",
      "compute_synastry_overlay",
      "generate_cosmic_recipe",
      "get_live_sky_transits",
      "get_transit_natal_overlay",
    ]);
  });

  it("get_live_sky_transits returns a JSON payload with dominantElement", async () => {
    const res = await client.request("tools/call", {
      name: "get_live_sky_transits",
      arguments: { latitude: 40, longitude: -73 },
    });
    expect(res.error).toBeUndefined();
    const content = (res.result as { content: Array<{ type: string; text: string }> })
      .content;
    const payload = JSON.parse(content[0].text) as Record<string, unknown>;
    expect(payload.dominantElement).toBeDefined();
  });
});

if (!ENABLED) {
  // Provide one always-passing test so jest doesn't report "no tests" in
  // the file when the gate is off.
  describe("MCP stdio transport (skipped)", () => {
    it("set MCP_E2E=1 to run the integration suite", () => {
      expect(true).toBe(true);
    });
  });
}
