/**
 * @file src/app/api/mcp/__tests__/streamableHttpExecution.test.ts
 *
 * Automated test suite for MCP Streamable HTTP tool execution, template reading,
 * protocol guards (405, 413), auth remediation, and autocompletion.
 */


import { POST, GET, DELETE } from "../route";

describe("MCP Streamable HTTP Gateway - Execution & Guards (/api/mcp)", () => {
  it("bridges invalid Authorization Bearer key into auth check and fails closed with remediation", async () => {
    const req = new Request("http://localhost:3000/api/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
        Authorization: "Bearer sk_alchm_unminted_fake_key",
        "X-Correlation-ID": "muse-auth-fail-789",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 9,
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
    expect(json.result.isError).toBe(true);
    expect(["UNAUTHORIZED", "UNAVAILABLE"]).toContain(
      json.result.structuredContent.errorCode,
    );
    expect(json.result.structuredContent.correlationId).toBe(
      "muse-auth-fail-789",
    );
    expect(typeof json.result.structuredContent.remediation).toBe("string");
    expect(json.result.structuredContent.remediation.length).toBeGreaterThan(0);
  });

  it("returns error envelope with self-healing remediation on invalid arguments", async () => {
    const req = new Request("http://localhost:3000/api/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 9,
        method: "tools/call",
        params: {
          name: "get_live_sky_transits",
          arguments: {
            latitude: 195, // Invalid: must be <= 90
          },
        },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.result.isError).toBe(true);
    expect(json.result.structuredContent.errorCode).toBe("INVALID_ARGS");
    expect(json.result.structuredContent.remediation).toBeDefined();
    expect(json.result.structuredContent.remediation).toContain("validation");
  });

  it("returns resources/templates/list with RFC 6570 parameter templates", async () => {
    const req = new Request("http://localhost:3000/api/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 10,
        method: "resources/templates/list",
        params: {},
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.result.resourceTemplates).toBeDefined();
    const uris = json.result.resourceTemplates.map((t: { uriTemplate: string }) => t.uriTemplate);
    expect(uris).toContain("alchm://ingredients/{slug}");
    expect(uris).toContain("alchm://recipes/{id}");
    expect(uris).toContain("alchm://techniques/{slug}");
  });

  it("reads parameterized ingredient template alchm://ingredients/chickpeas", async () => {
    const req = new Request("http://localhost:3000/api/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 11,
        method: "resources/read",
        params: {
          uri: "alchm://ingredients/chickpeas",
        },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.result.contents).toBeDefined();
    const data = JSON.parse(json.result.contents[0].text);
    expect(data.name.toLowerCase()).toContain("chickpea");
    expect(data.elementalProperties).toBeDefined();
  });

  it("reads alchm://account/culinary-profile resource", async () => {
    const req = new Request("http://localhost:3000/api/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 12,
        method: "resources/read",
        params: {
          uri: "alchm://account/culinary-profile",
        },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.result.contents).toBeDefined();
    const data = JSON.parse(json.result.contents[0].text);
    expect(Array.isArray(data.allergens)).toBe(true);
    expect(Array.isArray(data.dietaryFrameworks)).toBe(true);
    expect(Array.isArray(data.dislikedIngredients)).toBe(true);
  });

  it("executes substitute_ingredient tool over HTTP", async () => {
    const req = new Request("http://localhost:3000/api/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 13,
        method: "tools/call",
        params: {
          name: "substitute_ingredient",
          arguments: {
            ingredient: "buttermilk",
            dishContext: "pancakes",
            dietaryRestriction: "vegan",
          },
        },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.result.isError).toBeUndefined();
    expect(json.result.structuredContent.originalIngredient).toBe("buttermilk");
    expect(json.result.structuredContent.substitutes.length).toBeGreaterThan(0);
    expect(json.result.structuredContent.substitutes[0].ratio).toBeDefined();
    expect(json.result.structuredContent.substitutes[0].flavorImpact).toBeDefined();
  });

  it("executes what_to_cook_now tool with pantry matching over HTTP", async () => {
    const req = new Request("http://localhost:3000/api/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 14,
        method: "tools/call",
        params: {
          name: "what_to_cook_now",
          arguments: {
            availableIngredients: ["cabbage", "tahini", "chicken"],
            maxActiveMinutes: 60,
            moodOrCraving: "comforting and savory",
          },
        },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.result.isError).toBeUndefined();
    expect(json.result.structuredContent.totalCandidates).toBeGreaterThan(0);
    expect(json.result.structuredContent.recommendations.length).toBeGreaterThan(0);
    const firstRec = json.result.structuredContent.recommendations[0];
    expect(firstRec.resourceUri).toContain("alchm://recipes/");
    expect(firstRec.finishingTouch).toBeDefined();
    expect(Array.isArray(firstRec.sensoryCheckpoints)).toBe(true);
  });

  it("reads parameterized solar return template alchm://solar-return/2000 over HTTP", async () => {
    const req = new Request("http://localhost:3000/api/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 15,
        method: "resources/read",
        params: { uri: "alchm://solar-return/2000" },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.result.contents).toHaveLength(1);
    const parsed = JSON.parse(json.result.contents[0].text);
    expect(parsed.year).toBe(2000);
    expect(parsed.echo.planet).toBe("Sun");
    expect(Array.isArray(parsed.recipes)).toBe(true);
  });
});

