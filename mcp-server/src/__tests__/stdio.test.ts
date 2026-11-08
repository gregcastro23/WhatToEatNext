/** Real newline-delimited JSON-RPC coverage, independent of live credentials/APIs.
 * MCP_E2E=1 bun test mcp-server/src/__tests__/stdio.test.ts
 * MCP_E2E_ENTRY=mcp-server/dist/index.js repeats against the Node bundle.
 * MCP_E2E_ENTRY=mcp-server/bin/alchm-mcp repeats against the compiled sidecar.
 */
import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { createServer, type Server } from "node:http";
import { resolve } from "node:path";
import { MCP_SERVER_VERSION, TOOL_NAMES } from "../../../src/lib/mcp/catalog";

const ENABLED = process.env.MCP_E2E === "1";
const REPO_ROOT = resolve(__dirname, "../../..");

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function object(value: unknown): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new Error(`Expected an object, received ${JSON.stringify(value)}`);
  }
  return value;
}

class StdioClient {
  proc: ChildProcessWithoutNullStreams;
  invalidLines: string[] = [];
  stderr = "";
  sawStartup = false;
  private buffer = "";
  private pending = new Map<
    number,
    {
      resolve: (msg: Record<string, unknown>) => void;
      reject: (error: Error) => void;
    }
  >();
  private nextId = 1;

  constructor(extraEnv: Record<string, string> = {}) {
    const entry = resolve(
      REPO_ROOT,
      process.env.MCP_E2E_ENTRY ?? "mcp-server/src/index.ts",
    );
    const command = entry.endsWith(".ts")
      ? "bun"
      : entry.endsWith(".js")
        ? "node"
        : entry;
    const args = entry.endsWith(".ts")
      ? ["--no-env-file", "run", entry]
      : entry.endsWith(".js")
        ? [entry]
        : [];
    this.proc = spawn(command, args, {
      stdio: ["pipe", "pipe", "pipe"],
      env: {
        ...process.env,
        // Keep tests isolated from the developer's configured database and keys.
        DATABASE_URL: "",
        MCP_USER_API_KEY: "",
        ALCHM_MCP_USER_API_KEY: "",
        INTERNAL_API_SECRET: "",
        SYNTHETIC_PROBE_USER_ID: "",
        ALCHM_MCP_BACKEND_URL: "http://127.0.0.1:1",
        ...extraEnv,
      },
    });
    this.proc.stdout.setEncoding("utf8");
    this.proc.stdout.on("data", (chunk: string) => {
      this.buffer += chunk;
      let idx: number;
      while ((idx = this.buffer.indexOf("\n")) !== -1) {
        const line = this.buffer.slice(0, idx);
        this.buffer = this.buffer.slice(idx + 1);
        // Blank/log lines violate stdio too: never silently discard them.
        try {
          const msg = object(JSON.parse(line));
          if (msg.jsonrpc !== "2.0")
            throw new Error("Missing JSON-RPC version");
          if (typeof msg.id === "number") {
            const cb = this.pending.get(msg.id);
            if (cb) {
              this.pending.delete(msg.id);
              cb.resolve(msg);
            }
          }
        } catch {
          this.invalidLines.push(line);
          for (const cb of this.pending.values())
            cb.reject(new Error(`Non-protocol stdout: ${line}`));
          this.pending.clear();
        }
      }
    });
    this.proc.stderr.setEncoding("utf8");
    this.proc.stderr.on("data", (chunk: string) => {
      this.stderr += chunk;
      this.sawStartup ||= this.stderr.includes(
        `Alchm.kitchen MCP ${MCP_SERVER_VERSION}`,
      );
      this.stderr = this.stderr.slice(-4000);
      if (process.env.MCP_E2E_DEBUG) process.stderr.write(chunk);
    });
    const rejectPending = (reason: string): void => {
      for (const cb of this.pending.values())
        cb.reject(new Error(`${reason}\n${this.stderr}`));
      this.pending.clear();
    };
    this.proc.on("error", (error) => rejectPending(error.message));
    this.proc.on("exit", (code) =>
      rejectPending(`Server exited with code ${code}`),
    );
  }

  async request(
    method: string,
    params?: unknown,
  ): Promise<Record<string, unknown>> {
    const id = this.nextId++;
    return new Promise((resolveResponse, rejectResponse) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        rejectResponse(
          new Error(`MCP request ${method} timed out\n${this.stderr}`),
        );
      }, 15000);
      this.pending.set(id, {
        resolve: (msg) => {
          clearTimeout(timer);
          resolveResponse(msg);
        },
        reject: (error) => {
          clearTimeout(timer);
          rejectResponse(error);
        },
      });
      this.proc.stdin.write(
        JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n",
      );
    });
  }

  notify(method: string): void {
    this.proc.stdin.write(JSON.stringify({ jsonrpc: "2.0", method }) + "\n");
  }

  async call(
    name: string,
    args: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const response = await this.request("tools/call", {
      name,
      arguments: args,
    });
    expect(response.error).toBeUndefined();
    const result = object(response.result);
    const structured = object(result.structuredContent);
    if (!Array.isArray(result.content))
      throw new Error("Missing content array");
    const content = object(result.content[0]);
    expect(content.type).toBe("text");
    if (typeof content.text !== "string")
      throw new Error("Missing text content");
    expect(JSON.parse(content.text)).toEqual(structured);
    return result;
  }

  async close(): Promise<void> {
    if (this.proc.exitCode !== null || this.proc.signalCode !== null) return;
    await new Promise<void>((done) => {
      this.proc.once("exit", () => done());
      this.proc.kill("SIGTERM");
    });
  }
}

const describeIf = ENABLED ? describe : describe.skip;

describeIf("MCP stdio transport", () => {
  let client: StdioClient;

  beforeAll(async () => {
    client = new StdioClient();
    const init = await client.request("initialize", {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "mcp-e2e-test", version: "1.0.0" },
    });
    expect(object(init.result).serverInfo).toMatchObject({
      name: "alchm-mcp-server",
      version: MCP_SERVER_VERSION,
    });
    client.notify("notifications/initialized");
  }, 20000);

  afterAll(async () => {
    await client?.close();
    if (client) expect(client.proc.exitCode).toBe(0);
  });

  it("lists all bounded tools with honest mutation annotations", async () => {
    const response = await client.request("tools/list");
    const listed = object(response.result).tools;
    if (!Array.isArray(listed)) throw new Error("Missing tools");
    expect(listed.map((tool: unknown) => object(tool).name)).toEqual([
      ...TOOL_NAMES,
    ]);
    for (const value of listed) {
      const tool = object(value);
      const schema = object(tool.inputSchema);
      expect(schema.type).toBe("object");
      expect(schema.additionalProperties).toBe(false);
      expect(object(schema.properties)._meta).toBeDefined();
      expect(object(tool.annotations).destructiveHint).toBe(false);
      if (
        [
          "generate_cosmic_recipe",
          "create_evidence_snapshot",
          "submit_recipe_reflection",
        ].includes(String(tool.name))
      ) {
        expect(object(tool.annotations).readOnlyHint).toBe(false);
        expect(object(tool.annotations).idempotentHint).toBe(false);
      }
    }
  });

  it("returns structured and text-compatible curated ingredient output", async () => {
    const result = await client.call("alchemize_ingredients", {
      ingredients: ["tomato", "basil"],
    });
    expect(result.isError).toBeUndefined();
    expect(object(result.structuredContent).ingredientCount).toBe(2);
    expect(typeof object(result.structuredContent).correlationId).toBe(
      "string",
    );
  });

  it("returns a protocol error for an unknown tool name", async () => {
    const response = await client.request("tools/call", {
      name: "not_a_tool",
      arguments: {},
    });
    expect(response.result).toBeUndefined();
    expect(object(response.error).code).toBe(-32602);
  });

  it("rejects out-of-range coordinates before contacting the backend", async () => {
    const result = await client.call("get_live_sky_transits", { latitude: 91 });
    expect(result.isError).toBe(true);
    expect(object(result.structuredContent).errorCode).toBe("INVALID_ARGS");
  });

  it("rejects excessive ingredient work and malformed nested charts", async () => {
    const large = await client.call("alchemize_ingredients", {
      ingredients: Array.from({ length: 101 }, () => "basil"),
    });
    expect(object(large.structuredContent).errorCode).toBe("INVALID_ARGS");
    const malformed = await client.call("compute_synastry_overlay", {
      agentA: { id: "a", natalChart: {} },
      agentB: { id: "b", natalChart: {} },
    });
    expect(object(malformed.structuredContent).errorCode).toBe("INVALID_ARGS");
  });

  it("refuses anonymous reflection publication", async () => {
    const result = await client.call("submit_recipe_reflection", {
      recipeId: "test",
      reflection: "A flavorful test reflection.",
    });
    expect(result.isError).toBe(true);
    expect(object(result.structuredContent).errorCode).toBeDefined();
  });

  it("preserves caller correlation IDs and partial snapshot provenance on errors", async () => {
    const result = await client.call("create_evidence_snapshot", {
      ingredients: ["basil"],
      _meta: { correlationId: "stdio-snapshot-123" },
    });
    expect(result.isError).toBe(true);
    const payload = object(result.structuredContent);
    expect(payload.correlationId).toBe("stdio-snapshot-123");
    const snapshot = object(payload.data);
    expect(snapshot.status).toBe("partial");
    expect(typeof snapshot.snapshotId).toBe("string");
    const components = object(object(snapshot.provenance).components);
    expect(object(components.liveSky).status).toBe("failed");
    expect(object(components.alchemicalScan).status).toBe("success");
  });

  it("exits cleanly when its client closes stdin", async () => {
    const eofClient = new StdioClient();
    try {
      await eofClient.request("initialize", {
        protocolVersion: "2025-06-18",
        capabilities: {},
        clientInfo: { name: "mcp-eof-test", version: "1.0.0" },
      });
      const exited = new Promise<number | null>((done, reject) => {
        const timer = setTimeout(
          () => reject(new Error("Server did not exit after stdin EOF")),
          3000,
        );
        eofClient.proc.once("exit", (code) => {
          clearTimeout(timer);
          done(code);
        });
      });
      eofClient.proc.stdin.end();
      expect(await exited).toBe(0);
      expect(eofClient.invalidLines).toEqual([]);
    } finally {
      await eofClient.close();
    }
  });

  it("keeps all stdout lines valid JSON-RPC during startup and calls", () => {
    expect(client.invalidLines).toEqual([]);
    expect(client.sawStartup).toBe(true);
  });
});

const BIG_REPLY = 300_000; // well over one pipe buffer (64 KiB)
const sleep = (ms: number): Promise<void> => new Promise((done) => setTimeout(done, ms));

async function eventually(check: () => boolean, ms = 4000): Promise<void> {
  for (const end = Date.now() + ms; !check(); await sleep(20)) {
    if (Date.now() > end) throw new Error("condition not met in time");
  }
}

/** A stand-in for https://alchm.kitchen/api/mcp on loopback: records what the bridge sends and answers like the hosted route. */
async function startHostedStandIn(): Promise<{ url: string; seen: { auth: string | undefined; body: string; path: string | undefined }[]; close: () => Promise<void> }> {
  const seen: { auth: string | undefined; body: string; path: string | undefined }[] = [];
  const server: Server = createServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => {
      const body = Buffer.concat(chunks).toString("utf8");
      seen.push({ auth: req.headers.authorization, body, path: req.url });
      if (req.url?.startsWith("/api/mcp/rest/")) {
        // the REST route the in-process server's fallback calls (src/app/api/mcp/rest/[tool]/route.ts)
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify({ ok: true, result: { viaRest: req.url } }));
        return;
      }
      if (req.url === "/redirect") {
        res.writeHead(307, { location: "/api/mcp" }).end();
        return;
      }
      const message = object(JSON.parse(body));
      if (typeof message.id !== "number") {
        res.writeHead(202).end();
        return;
      }
      const result =
        message.method === "initialize"
          ? { protocolVersion: "2025-06-18", capabilities: {}, serverInfo: { name: "hosted-stand-in", version: "0.0.0" } }
          : message.method === "big"
            ? { pad: "x".repeat(BIG_REPLY) }
            : { echoedAuthorization: req.headers.authorization ?? null };
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ jsonrpc: "2.0", id: message.id, result }));
    });
  });
  await new Promise<void>((ready) => server.listen(0, "127.0.0.1", ready));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("stand-in has no port");
  return {
    url: `http://127.0.0.1:${address.port}/api/mcp`,
    seen,
    close: () => new Promise<void>((done) => { server.closeAllConnections(); server.close(() => done()); }),
  };
}

describeIf("MCP stdio remote bridge (a key and no DATABASE_URL)", () => {
  const KEY = "sk_alchm_e2e_bridge_key_not_a_credential";

  it("forwards over real stdio and a real HTTP socket, with the key as a bearer token, and exits cleanly on EOF", async () => {
    const hosted = await startHostedStandIn();
    const client = new StdioClient({ MCP_USER_API_KEY: KEY, ALCHM_MCP_REMOTE_URL: hosted.url });
    try {
      const init = await client.request("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "bridge-e2e", version: "1.0.0" } });
      expect(object(init.result).serverInfo).toMatchObject({ name: "hosted-stand-in" });
      client.notify("notifications/initialized");
      const listed = await client.request("tools/list");
      expect(object(listed.result).echoedAuthorization).toBe(`Bearer ${KEY}`);
      await eventually(() => hosted.seen.length === 3); // the notification's POST runs alongside tools/list: it can still be on its way
      expect(hosted.seen.map((entry) => entry.auth)).toEqual([`Bearer ${KEY}`, `Bearer ${KEY}`, `Bearer ${KEY}`]);
      expect(client.stderr).toContain(`remote bridge to ${hosted.url}`);
      expect(client.stderr).not.toContain(KEY);
      expect(client.invalidLines).toEqual([]);
      const exited = new Promise<number | null>((done) => client.proc.once("exit", (code) => done(code)));
      client.proc.stdin.end();
      expect(await exited).toBe(0);
    } finally {
      await client.close();
      await hosted.close();
    }
  }, 30000);

  it("stays in-process when a DATABASE_URL is configured (operator mode): the hosted endpoint is never contacted", async () => {
    const hosted = await startHostedStandIn();
    const client = new StdioClient({ MCP_USER_API_KEY: KEY, DATABASE_URL: "postgresql://nobody:x@127.0.0.1:1/none", ALCHM_MCP_REMOTE_URL: hosted.url });
    try {
      const init = await client.request("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "operator-e2e", version: "1.0.0" } });
      expect(object(init.result).serverInfo).toMatchObject({ name: "alchm-mcp-server", version: MCP_SERVER_VERSION });
      expect(hosted.seen).toEqual([]);
    } finally {
      await client.close();
      await hosted.close();
    }
  }, 30000);

  it("does not follow a redirect with the key attached: the request fails and the target is never contacted", async () => {
    const hosted = await startHostedStandIn();
    const client = new StdioClient({ MCP_USER_API_KEY: KEY, ALCHM_MCP_REMOTE_URL: hosted.url.replace("/api/mcp", "/redirect") });
    try {
      const response = await client.request("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "redirect-e2e", version: "1.0.0" } });
      expect(object(response.error).code).toBe(-32603);
      expect(hosted.seen).toHaveLength(1);
      expect(client.stderr).not.toContain(KEY);
    } finally {
      await client.close();
      await hosted.close();
    }
  }, 30000);

  // A smoke test: under `bun test` the parent drains the child's pipe eagerly, so this cannot show the truncation that
  // `process.exit()` used to cause (Bun cut a reply at 64 KiB). That cause is pinned in remoteBridge.test.ts (runBridgeMain).
  it("writes a reply bigger than a pipe buffer in full when stdin closes right after the request", async () => {
    const hosted = await startHostedStandIn();
    const client = new StdioClient({ MCP_USER_API_KEY: KEY, ALCHM_MCP_REMOTE_URL: hosted.url });
    let stdout = "";
    client.proc.stdout.on("data", (chunk: string) => {
      stdout += chunk;
    });
    const closed = new Promise<number | null>((done) => client.proc.once("close", (code) => done(code)));
    try {
      client.proc.stdin.end(`${JSON.stringify({ jsonrpc: "2.0", id: 1, method: "big" })}\n`);
      expect(await closed).toBe(0);
      expect(object(object(JSON.parse(stdout)).result).pad).toHaveLength(BIG_REPLY);
    } finally {
      await client.close();
      await hosted.close();
    }
  }, 30000);

  it("says on stderr that it is in operator mode, and how to leave it, when a key meets a DATABASE_URL, and not otherwise", async () => {
    const database = "postgresql://nobody:x@127.0.0.1:1/none";
    const withKey = new StdioClient({ MCP_USER_API_KEY: KEY, DATABASE_URL: database });
    const withoutKey = new StdioClient({ DATABASE_URL: database });
    try {
      const hello = { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "mode-e2e", version: "1.0.0" } };
      await withKey.request("initialize", hello);
      await withoutKey.request("initialize", hello);
      await eventually(() => withKey.stderr.includes("operator mode"));
      expect(withKey.stderr).toContain("ALCHM_MCP_MODE=remote");
      expect(withKey.stderr).not.toContain(KEY);
      await eventually(() => withoutKey.stderr.includes("Database: configured"));
      expect(withoutKey.stderr).not.toContain("operator mode");
    } finally {
      await withKey.close();
      await withoutKey.close();
    }
  }, 30000);

  it("uses the hosted service with ALCHM_MCP_MODE=remote even when an unrelated DATABASE_URL is set, and says it ignores it", async () => {
    const hosted = await startHostedStandIn();
    const client = new StdioClient({ MCP_USER_API_KEY: KEY, DATABASE_URL: "postgresql://unrelated:x@127.0.0.1:1/app", ALCHM_MCP_MODE: "remote", ALCHM_MCP_REMOTE_URL: hosted.url });
    try {
      const init = await client.request("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "mode-remote-e2e", version: "1.0.0" } });
      expect(object(init.result).serverInfo).toMatchObject({ name: "hosted-stand-in" });
      expect(hosted.seen.map((entry) => entry.auth)).toEqual([`Bearer ${KEY}`]);
      await eventually(() => client.stderr.includes("DATABASE_URL is not used"));
      expect(client.stderr).not.toContain("unrelated:x");
      expect(client.stderr).not.toContain(KEY);
    } finally {
      await client.close();
      await hosted.close();
    }
  }, 30000);

  it("stays in-process with ALCHM_MCP_MODE=local though a key and no database would otherwise take the bridge: the keyed call goes to the REST fallback, not the bridge", async () => {
    const hosted = await startHostedStandIn();
    const client = new StdioClient({ MCP_USER_API_KEY: KEY, ALCHM_MCP_MODE: "local", ALCHM_MCP_REMOTE_URL: hosted.url, ALCHM_MCP_BACKEND_URL: hosted.url.replace("/api/mcp", "") });
    try {
      const init = await client.request("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "mode-local-e2e", version: "1.0.0" } });
      expect(object(init.result).serverInfo).toMatchObject({ name: "alchm-mcp-server", version: MCP_SERVER_VERSION });
      expect(hosted.seen).toEqual([]); // the bridge would have sent initialize to the hosted endpoint
      const answer = await client.request("tools/call", { name: "get_user_allowance", arguments: {} });
      expect(JSON.stringify(answer.result)).toContain("viaRest");
      expect(hosted.seen.map((entry) => entry.path)).toEqual(["/api/mcp/rest/get_user_allowance"]);
      expect(hosted.seen.map((entry) => entry.auth)).toEqual([`Bearer ${KEY}`]);
      expect(client.stderr).not.toContain("every tool will fail"); // that note was wrong once #993 added the fallback
      expect(client.stderr).not.toContain(KEY);
    } finally {
      await client.close();
      await hosted.close();
    }
  }, 30000);

  it("refuses to start on an ALCHM_MCP_MODE it does not know, without repeating it, and writes nothing to stdout", async () => {
    const pasted = "sk_alchm_pasted_into_the_wrong_variable";
    const client = new StdioClient({ MCP_USER_API_KEY: KEY, ALCHM_MCP_MODE: pasted });
    const code = await new Promise<number | null>((done) => client.proc.once("exit", (exitCode) => done(exitCode)));
    expect(code).toBe(1);
    expect(client.stderr).toContain("ALCHM_MCP_MODE must be remote, local or auto");
    expect(client.stderr).not.toContain(pasted);
    expect(client.stderr).not.toContain(KEY);
    expect(client.invalidLines).toEqual([]);
  }, 30000);

  it("refuses to start on a plain-http remote host, with the reason on stderr and nothing on stdout", async () => {
    const client = new StdioClient({ MCP_USER_API_KEY: KEY, ALCHM_MCP_REMOTE_URL: "http://example.com/api/mcp" });
    const code = await new Promise<number | null>((done) => client.proc.once("exit", (exitCode) => done(exitCode)));
    expect(code).toBe(1);
    expect(client.stderr).toContain("must be https");
    expect(client.stderr).not.toContain(KEY);
    expect(client.invalidLines).toEqual([]);
  }, 30000);
});

if (!ENABLED) {
  describe("MCP stdio transport (disabled)", () => {
    it("requires MCP_E2E=1", () => {
      expect(ENABLED).toBe(false);
    });
  });
}
