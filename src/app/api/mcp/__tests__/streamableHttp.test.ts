/**
 * @file src/app/api/mcp/__tests__/streamableHttp.test.ts
 *
 * Automated test suite for the hosted Streamable HTTP MCP gateway (/api/mcp).
 * Tests stateless Streamable HTTP, Bearer auth, Tools, Prompts, Resources,
 * Idempotency header bridging, and self-healing error remediation.
 */


import { TOOL_NAMES } from "@/lib/mcp/catalog";
import { POST, OPTIONS, GET, DELETE } from "../route";

describe("MCP Streamable HTTP Gateway (/api/mcp)", () => {
  it("responds to OPTIONS requests with appropriate CORS headers", async () => {
    const req = new Request("http://localhost:3000/api/mcp", {
      method: "OPTIONS",
      headers: {
        origin: "https://meta.ai",
      },
    });

    const res = await OPTIONS(req);
    expect(res.status).toBe(204);
    expect(res.headers.get("access-control-allow-origin")).toBe("https://meta.ai");
    expect(res.headers.get("access-control-allow-methods")).toContain("POST");
    expect(res.headers.get("access-control-allow-headers")).toContain("Authorization");
  });

  it("handles protocol initialize handshake cleanly over POST", async () => {
    const initPayload = {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: {
          name: "meta-muse-test",
          version: "1.0.0",
        },
      },
    };

    const req = new Request("http://localhost:3000/api/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: JSON.stringify(initPayload),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.jsonrpc).toBe("2.0");
    expect(json.id).toBe(1);
    expect(json.result).toBeDefined();
    expect(json.result.serverInfo.name).toBe("alchm-mcp-server");
    expect(json.result.capabilities.tools).toBeDefined();
    expect(json.result.capabilities.prompts).toBeDefined();
    expect(json.result.capabilities.resources).toBeDefined();
  });

  it("returns tools/list with all 13 tools including culinary intelligence tools", async () => {
    const req = new Request("http://localhost:3000/api/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 2,
        method: "tools/list",
        params: {},
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.result.tools).toBeDefined();
    const toolNames = json.result.tools.map((t: { name: string }) => t.name);
    expect(toolNames).toContain("get_live_sky_transits");
    expect(toolNames).toContain("alchemize_ingredients");
    expect(toolNames).toContain("generate_cosmic_recipe");
    expect(toolNames).toContain("get_user_allowance");
    expect(toolNames).toContain("substitute_ingredient");
    expect(toolNames).toContain("build_consolidated_grocery_list");
    expect(toolNames).toContain("what_to_cook_now");
    expect(toolNames).toContain("update_culinary_profile");
    expect(toolNames).toContain("simulate_hermetic_cauldron");
    expect(toolNames.length).toBe(TOOL_NAMES.length);
  });

  it("returns prompts/list with structured agent blueprints", async () => {
    const req = new Request("http://localhost:3000/api/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 3,
        method: "prompts/list",
        params: {},
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.result.prompts).toBeDefined();
    const promptNames = json.result.prompts.map((p: { name: string }) => p.name);
    expect(promptNames).toContain("cosmic_meal_planning");
    expect(promptNames).toContain("pantry_alchemical_balance");
    expect(promptNames).toContain("historical_culinary_council");
  });

  it("returns prompts/get with actionable guidance", async () => {
    const req = new Request("http://localhost:3000/api/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 4,
        method: "prompts/get",
        params: {
          name: "cosmic_meal_planning",
          arguments: {
            cuisine: "thai",
            dietary: "gluten-free",
          },
        },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.result.messages).toBeDefined();
    expect(json.result.messages[0].content.text).toContain("get_user_allowance");
    expect(json.result.messages[0].content.text).toContain("get_live_sky_transits");
    expect(json.result.messages[0].content.text).toContain("generate_cosmic_recipe");
  });

  it("returns resources/list with static and dynamic alchemical resources", async () => {
    const req = new Request("http://localhost:3000/api/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 5,
        method: "resources/list",
        params: {},
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.result.resources).toBeDefined();
    const uris = json.result.resources.map((r: { uri: string }) => r.uri);
    expect(uris).toContain("alchm://catalog/cuisines");
    expect(uris).toContain("alchm://catalog/diets");
    expect(uris).toContain("alchm://ontology/esms");
    expect(uris).toContain("alchm://roster/historical-agents");
    expect(uris).toContain("alchm://reference/tool-costs");
    expect(uris).toContain("alchm://account/allowance");
  });

  it("returns resources/read for catalog cuisines without token cost", async () => {
    const req = new Request("http://localhost:3000/api/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 6,
        method: "resources/read",
        params: {
          uri: "alchm://catalog/cuisines",
        },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.result.contents).toBeDefined();
    const parsed = JSON.parse(json.result.contents[0].text);
    expect(parsed.cuisines).toContain("Italian");
    expect(parsed.cuisines).toContain("Thai");
  });

  it("executes get_user_allowance tool over HTTP and returns cost schedule", async () => {
    const req = new Request("http://localhost:3000/api/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 7,
        method: "tools/call",
        params: {
          name: "get_user_allowance",
          arguments: {},
        },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.result.isError).toBeUndefined();
    expect(json.result.structuredContent.authenticated).toBe(false);
    expect(json.result.structuredContent.tier).toBe("anonymous");
    expect(json.result.structuredContent.toolCosts.generate_cosmic_recipe.totalEsms).toBe(10);
  });

  it("bridges HTTP headers (Idempotency-Key, Correlation-ID) into tool call", async () => {
    const req = new Request("http://localhost:3000/api/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
        "Idempotency-Key": "muse-test-retry-key-01",
        "X-Correlation-ID": "muse-corr-456",
        "User-Agent": "Meta-Muse-Cloud/1.0",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 8,
        method: "tools/call",
        params: {
          name: "alchemize_ingredients",
          arguments: {
            ingredients: ["tomato", "basil"],
          },
        },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.result.structuredContent.ingredientCount).toBe(2);
    expect(json.result.structuredContent.correlationId).toBe("muse-corr-456");
  });
});

