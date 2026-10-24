/** Contract coverage through the official SDK client, independent of live credentials/APIs.
 * The SDK client validates every structuredContent (errors included) against
 * the tool's advertised outputSchema with ajv, as MCP clients do in practice.
 * MCP_E2E=1 bun test mcp-server/src/__tests__/sdkClient.test.ts
 * MCP_E2E_ENTRY=mcp-server/dist/index.js or mcp-server/bin/alchm-mcp repeats it
 * against the Node bundle or the compiled sidecar.
 */
import { resolve } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
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

function serverCommand(): { command: string; args: string[] } {
  const entry = resolve(
    REPO_ROOT,
    process.env.MCP_E2E_ENTRY ?? "mcp-server/src/index.ts",
  );
  if (entry.endsWith(".ts"))
    return { command: "bun", args: ["--no-env-file", "run", entry] };
  if (entry.endsWith(".js")) return { command: "node", args: [entry] };
  return { command: entry, args: [] };
}

function isolatedEnvironment(): Record<string, string> {
  const env: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (typeof value === "string") env[key] = value;
  }
  // Keep tests isolated from the developer's configured database and keys.
  return {
    ...env,
    DATABASE_URL: "",
    MCP_USER_API_KEY: "",
    ALCHM_MCP_USER_API_KEY: "",
    INTERNAL_API_SECRET: "",
    SYNTHETIC_PROBE_USER_ID: "",
    ALCHM_MCP_BACKEND_URL: "http://127.0.0.1:1",
  };
}

const natalChart = {
  planets: {
    Sun: { sign: "leo", degree: 15 },
    Moon: { sign: "aries", degree: 15 },
  },
};

const describeIf = ENABLED ? describe : describe.skip;

describeIf("MCP contract through the SDK client", () => {
  let client: Client;

  beforeAll(async () => {
    client = new Client({ name: "mcp-sdk-contract-test", version: "1.0.0" });
    await client.connect(
      new StdioClientTransport({
        ...serverCommand(),
        env: isolatedEnvironment(),
        stderr: "pipe",
      }),
    );
    expect(client.getServerVersion()).toMatchObject({
      name: "alchm-mcp-server",
      version: MCP_SERVER_VERSION,
    });
  }, 20000);

  afterAll(async () => {
    await client?.close();
  });

  it("advertises a title and an object output schema for every tool", async () => {
    const { tools } = await client.listTools();
    expect(tools.map((tool) => tool.name)).toEqual([...TOOL_NAMES]);
    for (const tool of tools) {
      expect(typeof tool.title).toBe("string");
      expect(tool.outputSchema?.type).toBe("object");
    }
  });

  // Each call below fails inside callTool() if its structuredContent does not
  // conform to the advertised outputSchema.
  const successes: Array<[string, Record<string, unknown>]> = [
    ["alchemize_ingredients", { ingredients: ["tomato", "basil", "nonsense"] }],
    ["generate_cosmic_recipe", { prompt: "soup" }],
    [
      "compute_synastry_overlay",
      {
        agentA: { id: "a", natalChart },
        agentB: { id: "b", natalChart },
        cacheStrategy: "bypass",
      },
    ],
    [
      "compute_triplicate_synastry",
      {
        makerId: "maker",
        takerId: "taker",
        makerNatal: { Sun: { sign: "leo", degree: 15 } },
        takerNatal: { Sun: { sign: "aries", degree: 15 } },
        giveToken: "Spirit",
        giveAmount: 10,
        wantToken: "Essence",
        wantAmount: 10,
        transitTime: "2026-10-18T12:00:00Z",
      },
    ],
  ];

  it.each(successes)(
    "returns schema-conformant structured content from %s",
    async (name, args) => {
      const result = await client.callTool({ name, arguments: args });
      expect(result.isError).toBeFalsy();
      expect(typeof object(result.structuredContent).correlationId).toBe(
        "string",
      );
    },
  );

  it("reports anonymous demo billing on a paid read", async () => {
    const result = await client.callTool({
      name: "generate_cosmic_recipe",
      arguments: { prompt: "soup", _meta: { idempotencyKey: "demo-1" } },
    });
    expect(object(result.structuredContent).billing).toEqual({
      status: "not_charged",
      reason: "anonymous-caller",
      amounts: null,
      idempotencyKey: "demo-1",
    });
  });

  const failures: Array<[string, string, Record<string, unknown>, string]> = [
    [
      "invalid arguments",
      "get_live_sky_transits",
      { latitude: 91 },
      "INVALID_ARGS",
    ],
    [
      "a malformed idempotency key",
      "generate_cosmic_recipe",
      { _meta: { idempotencyKey: "two words" } },
      "INVALID_ARGS",
    ],
    [
      "an unauthenticated reflection",
      "submit_recipe_reflection",
      { recipeId: "r1", reflection: "A bright, balanced broth." },
      "UNAUTHORIZED",
    ],
    [
      "an unreachable chart backend",
      "get_live_sky_transits",
      {},
      "INTERNAL",
    ],
  ];

  it.each(failures)(
    "returns a schema-conformant error envelope for %s",
    async (_label, name, args, errorCode) => {
      const result = await client.callTool({ name, arguments: args });
      expect(result.isError).toBe(true);
      expect(object(result.structuredContent).errorCode).toBe(errorCode);
    },
  );

  it("returns an uncharged partial snapshot as a conformant error", async () => {
    const result = await client.callTool({
      name: "create_evidence_snapshot",
      arguments: { ingredients: ["basil"] },
    });
    expect(result.isError).toBe(true);
    const payload = object(result.structuredContent);
    expect(object(payload.data).status).toBe("partial");
    expect(payload.billing).toMatchObject({
      status: "not_charged",
      reason: "not-delivered",
    });
  });
});

if (!ENABLED) {
  describe("MCP contract through the SDK client (disabled)", () => {
    it("requires MCP_E2E=1", () => {
      expect(ENABLED).toBe(false);
    });
  });
}
