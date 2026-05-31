/**
 * End-to-end test for the API-key lifecycle:
 *   mint  →  use against the live MCP stdio server  →  revoke  →  re-use blocked
 *
 * Gated behind `MCP_E2E=1` AND a populated `DATABASE_URL` so the unit
 * suite stays Postgres-free. Creates and cleans up its own test user so
 * runs are self-contained and won't pollute the dev DB.
 *
 * Run locally with:
 *   MCP_E2E=1 DATABASE_URL=postgresql://... bun test src/lib/api-keys/__tests__/e2eMintUseRevoke.test.ts
 *
 * Why not Playwright? The mint→revoke contract lives in the JSON API +
 * the stdio MCP transport, not the UI; a browser flow would test the
 * form on top of the same surface this test already exercises. The
 * Playwright-driven UI test is a separate follow-up tracked in the
 * Phase 3 prompt.
 */

import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";

const ENABLED = process.env.MCP_E2E === "1" && !!process.env.DATABASE_URL;

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
      }, 20_000);
      this.pending.set(id, (msg) => {
        clearTimeout(timer);
        resolveFn(msg);
      });
      this.proc.stdin.write(
        `${JSON.stringify({ jsonrpc: "2.0", id, method, params })  }\n`,
      );
    });
  }

  close(): void {
    this.proc.kill("SIGTERM");
  }
}

async function spawnMcpAndInit(): Promise<StdioClient> {
  const serverPath = resolve(
    __dirname,
    "..",
    "..",
    "..",
    "..",
    "mcp-server",
    "src",
    "index.ts",
  );
  const proc = spawn("bun", ["run", serverPath], {
    stdio: ["pipe", "pipe", "pipe"],
    env: { ...process.env },
  });
  proc.stderr.setEncoding("utf8");
  proc.stderr.on("data", (line) => {
    if (process.env.MCP_E2E_DEBUG) process.stderr.write(`[mcp] ${line}`);
  });
  const client = new StdioClient(proc);
  await client.request("initialize", {
    protocolVersion: "2025-06-18",
    capabilities: {},
    clientInfo: { name: "api-key-e2e", version: "0.0.0" },
  });
  return client;
}

const describeIf = ENABLED ? describe : describe.skip;

describeIf("API key lifecycle (mint → use → revoke → use)", () => {
  let testUserId: string;
  let plaintext: string;
  let keyId: string;
  let dbModule: typeof import("@/lib/database") | null = null;
  let queries: typeof import("@/lib/api-keys/queries") | null = null;

  beforeAll(async () => {
    dbModule = await import("@/lib/database");
    queries = await import("@/lib/api-keys/queries");

    // Create a self-contained throwaway user so the test never collides
    // with real data and CASCADEs cleanly via the FK on api_keys.
    testUserId = randomUUID();
    const email = `e2e-api-key-${Date.now()}@e2e.alchm.kitchen`;
    await dbModule.executeQuery(
      `INSERT INTO users (id, email, name, is_agent)
       VALUES ($1, $2, $3, false)`,
      [testUserId, email, "E2E API Key Test"],
    );
  }, 30_000);

  afterAll(async () => {
    if (!dbModule || !testUserId) return;
    // CASCADE removes api_keys + mcp_invocations FKs as configured.
    await dbModule.executeQuery(`DELETE FROM users WHERE id = $1`, [
      testUserId,
    ]);
  }, 30_000);

  it("mints a key and returns plaintext exactly once", async () => {
    const result = await queries!.mintApiKey({
      userId: testUserId,
      name: "e2e-test-key",
    });
    expect(result.plaintext).toMatch(/^sk_alchm_live_[A-Za-z0-9_-]{43}$/);
    expect(result.row.is_active).toBe(true);
    expect(result.row.rate_limit_tier).toMatch(
      /^(apprentice|alchemist|authenticated)$/,
    );
    plaintext = result.plaintext;
    keyId = result.row.id;
  });

  it("the minted key authenticates an MCP tool call (user_id + api_key_id persisted)", async () => {
    const client = await spawnMcpAndInit();
    try {
      const res = await client.request("tools/call", {
        name: "get_live_sky_transits",
        arguments: {
          latitude: 40,
          longitude: -73,
          _meta: { apiKey: plaintext, caller: "api-key-e2e" },
        },
      });
      expect(res.error).toBeUndefined();
    } finally {
      client.close();
    }
    // Let fire-and-forget invocation log settle.
    await new Promise((r) => setTimeout(r, 750));
    const row = await dbModule!.executeQuery<{
      user_id: string | null;
      api_key_id: string | null;
    }>(
      `SELECT user_id, api_key_id
         FROM mcp_invocations
        WHERE api_key_id = $1
        ORDER BY called_at DESC
        LIMIT 1`,
      [keyId],
    );
    expect(row.rows[0]?.user_id).toBe(testUserId);
    expect(row.rows[0]?.api_key_id).toBe(keyId);
  }, 30_000);

  it("revokes the key and a re-use lands as anonymous (no api_key_id)", async () => {
    const revokedId = await queries!.revokeApiKey(testUserId, keyId);
    expect(revokedId).toBe(keyId);

    const client = await spawnMcpAndInit();
    try {
      const res = await client.request("tools/call", {
        name: "get_live_sky_transits",
        arguments: {
          latitude: 40,
          longitude: -73,
          _meta: { apiKey: plaintext, caller: "api-key-e2e-post-revoke" },
        },
      });
      expect(res.error).toBeUndefined();
    } finally {
      client.close();
    }
    await new Promise((r) => setTimeout(r, 750));
    // The free tool still produces a result, but the row should now
    // carry no api_key_id and no user_id — the revoked key failed to
    // authenticate and the caller is treated as anonymous.
    const row = await dbModule!.executeQuery<{
      user_id: string | null;
      api_key_id: string | null;
      caller: string;
    }>(
      `SELECT user_id, api_key_id, caller
         FROM mcp_invocations
        WHERE caller = 'api-key-e2e-post-revoke'
        ORDER BY called_at DESC
        LIMIT 1`,
    );
    expect(row.rows[0]?.api_key_id).toBeNull();
    expect(row.rows[0]?.user_id).toBeNull();
  }, 30_000);

  it("re-revoking the same key is a no-op", async () => {
    const result = await queries!.revokeApiKey(testUserId, keyId);
    expect(result).toBeNull();
  });
});

if (!ENABLED) {
  describe("API key lifecycle (skipped)", () => {
    it("set MCP_E2E=1 and DATABASE_URL to run the lifecycle suite", () => {
      expect(true).toBe(true);
    });
  });
}
