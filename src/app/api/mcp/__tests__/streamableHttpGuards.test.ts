/**
 * @file src/app/api/mcp/__tests__/streamableHttpGuards.test.ts
 *
 * Automated test suite for MCP Streamable HTTP protocol guards (405, 413)
 * and interactive autocompletion (completion/complete).
 */


import { POST, GET, DELETE } from "../route";

describe("MCP Streamable HTTP Gateway - Guards & Autocompletion (/api/mcp)", () => {
  it("returns 405 Method Not Allowed on GET requests in stateless mode", async () => {
    const req = new Request("http://localhost:3000/api/mcp", {
      method: "GET",
      headers: {
        origin: "https://meta.ai",
      },
    });

    const res = await GET(req);
    expect(res.status).toBe(405);
    expect(res.headers.get("allow")).toContain("POST");
    expect(res.headers.get("access-control-allow-origin")).toBe("https://meta.ai");
    const json = await res.json();
    expect(json.error.code).toBe(-32601);
  });

  it("returns 405 Method Not Allowed on DELETE requests in stateless mode", async () => {
    const req = new Request("http://localhost:3000/api/mcp", {
      method: "DELETE",
      headers: {
        origin: "https://meta.ai",
      },
    });

    const res = await DELETE(req);
    expect(res.status).toBe(405);
    expect(res.headers.get("allow")).toContain("POST");
    expect(res.headers.get("access-control-allow-origin")).toBe("https://meta.ai");
    const json = await res.json();
    expect(json.error.code).toBe(-32601);
  });

  it("returns 413 Payload Too Large when request body exceeds 256 KB cap", async () => {
    const oversizedString = "x".repeat(260 * 1024);
    const req = new Request("http://localhost:3000/api/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": String(oversizedString.length),
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 99,
        method: "tools/call",
        params: { data: oversizedString },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(413);
    const json = await res.json();
    expect(json.error.message).toContain("Payload Too Large");
  });

  it("provides interactive autocompletion via completion/complete", async () => {
    const req = new Request("http://localhost:3000/api/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 15,
        method: "completion/complete",
        params: {
          ref: {
            type: "ref/resource",
            uri: "alchm://ingredients/{slug}",
          },
          argument: {
            name: "slug",
            value: "chi",
          },
        },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.result.completion).toBeDefined();
    expect(Array.isArray(json.result.completion.values)).toBe(true);
    expect(json.result.completion.values.length).toBeGreaterThan(0);
    expect(
      json.result.completion.values.some((v: string) => v.includes("chi")),
    ).toBe(true);
  });
});

