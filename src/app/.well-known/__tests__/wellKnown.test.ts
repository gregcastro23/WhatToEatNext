/**
 * @file src/app/.well-known/__tests__/wellKnown.test.ts
 *
 * Unit tests for .well-known discovery routes:
 * 1. GET & OPTIONS /.well-known/oauth-protected-resource (RFC 9728)
 * 2. GET & OPTIONS /.well-known/oauth-authorization-server (RFC 8414)
 * 3. GET & OPTIONS /.well-known/muse/connector.json
 */


import {
  GET as getProtectedResource,
  OPTIONS as optionsProtectedResource,
} from "@/app/.well-known/oauth-protected-resource/route";
import {
  GET as getAuthServer,
  OPTIONS as optionsAuthServer,
} from "@/app/.well-known/oauth-authorization-server/route";
import {
  GET as getMuseConnector,
  OPTIONS as optionsMuseConnector,
} from "@/app/.well-known/muse/connector.json/route";

describe("OAuth Protected Resource Discovery (RFC 9728)", () => {
  const originalEnv = process.env.ENABLE_MCP_OAUTH;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.ENABLE_MCP_OAUTH;
    } else {
      process.env.ENABLE_MCP_OAUTH = originalEnv;
    }
  });

  it("returns 404 when ENABLE_MCP_OAUTH is not true (Phase 1 safety)", async () => {
    delete process.env.ENABLE_MCP_OAUTH;
    const req = new Request("https://alchm.kitchen/.well-known/oauth-protected-resource", {
      method: "GET",
      headers: { host: "alchm.kitchen" },
    });

    const res = await getProtectedResource(req);
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("OAuth discovery disabled");
  });

  it("returns RFC 9728 metadata with CORS and status 200 when ENABLE_MCP_OAUTH=true", async () => {
    process.env.ENABLE_MCP_OAUTH = "true";
    const req = new Request("https://alchm.kitchen/.well-known/oauth-protected-resource", {
      method: "GET",
      headers: { host: "alchm.kitchen" },
    });

    const res = await getProtectedResource(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("access-control-allow-origin")).toBe("*");

    const json = await res.json();
    expect(json.resource).toBe("https://alchm.kitchen/api/mcp");
    expect(Array.isArray(json.authorization_servers)).toBe(true);
    expect(json.authorization_servers).toContain("https://alchm.kitchen");
    expect(Array.isArray(json.scopes_supported)).toBe(true);
    expect(json.scopes_supported).toContain("mcp:invoke");
    expect(json.scopes_supported).toContain("mcp:read");
    expect(json.scopes_supported).toContain("mcp:recipes");
    expect(json.scopes_supported).toContain("mcp:reflections");
    expect(json.bearer_methods_supported).toEqual(["header"]);
    expect(json.resource_documentation).toBe("https://alchm.kitchen/docs/mcp");
  });

  it("handles OPTIONS preflight cleanly with 204", async () => {
    const res = await optionsProtectedResource();
    expect(res.status).toBe(204);
    expect(res.headers.get("access-control-allow-origin")).toBe("*");
    expect(res.headers.get("access-control-allow-methods")).toContain("GET");
  });
});

describe("OAuth Authorization Server Discovery (RFC 8414)", () => {
  const originalEnv = process.env.ENABLE_MCP_OAUTH;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.ENABLE_MCP_OAUTH;
    } else {
      process.env.ENABLE_MCP_OAUTH = originalEnv;
    }
  });

  it("returns 404 when ENABLE_MCP_OAUTH is not true (Phase 1 safety)", async () => {
    delete process.env.ENABLE_MCP_OAUTH;
    const req = new Request("https://alchm.kitchen/.well-known/oauth-authorization-server", {
      method: "GET",
      headers: { host: "alchm.kitchen" },
    });

    const res = await getAuthServer(req);
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("OAuth authorization server disabled");
  });

  it("returns RFC 8414 metadata with CORS and status 200 when ENABLE_MCP_OAUTH=true", async () => {
    process.env.ENABLE_MCP_OAUTH = "true";
    const req = new Request("https://alchm.kitchen/.well-known/oauth-authorization-server", {
      method: "GET",
      headers: { host: "alchm.kitchen" },
    });

    const res = await getAuthServer(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("access-control-allow-origin")).toBe("*");

    const json = await res.json();
    expect(json.issuer).toBe("https://alchm.kitchen");
    expect(json.authorization_endpoint).toBe("https://alchm.kitchen/profile/api-keys");
    expect(json.token_endpoint).toBe("https://alchm.kitchen/api/auth/token");
    expect(json.response_types_supported).toEqual(["code"]);
    expect(json.grant_types_supported).toContain("authorization_code");
    expect(json.code_challenge_methods_supported).toEqual(["S256"]);
  });

  it("handles OPTIONS preflight cleanly with 204", async () => {
    const res = await optionsAuthServer();
    expect(res.status).toBe(204);
    expect(res.headers.get("access-control-allow-origin")).toBe("*");
  });
});

describe("Meta Muse Connector Manifest", () => {
  const originalEnv = process.env.ENABLE_MCP_OAUTH;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.ENABLE_MCP_OAUTH;
    } else {
      process.env.ENABLE_MCP_OAUTH = originalEnv;
    }
  });

  it("returns API key authentication when ENABLE_MCP_OAUTH is not true", async () => {
    delete process.env.ENABLE_MCP_OAUTH;
    const req = new Request("https://alchm.kitchen/.well-known/muse/connector.json", {
      method: "GET",
      headers: { host: "alchm.kitchen" },
    });

    const res = await getMuseConnector(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("access-control-allow-origin")).toBe("*");

    const json = await res.json();
    expect(json.$schema).toBe("https://platform.muse.ai/schemas/v1/connector.json");
    expect(json.id).toBe("io.github.gregcastro23.alchm-kitchen");

    const auth = json.authentication;
    expect(auth.type).toBe("api_key");
    expect(auth.header).toBe("Authorization");
    expect(auth.valuePrefix).toBe("Bearer ");
  });

  it("returns OAuth2 authentication when ENABLE_MCP_OAUTH=true", async () => {
    process.env.ENABLE_MCP_OAUTH = "true";
    const req = new Request("https://alchm.kitchen/.well-known/muse/connector.json", {
      method: "GET",
      headers: { host: "alchm.kitchen" },
    });

    const res = await getMuseConnector(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    const auth = json.authentication;
    expect(auth.type).toBe("oauth2");
    expect(auth.fallbackApiKeyHeader).toBe("Authorization");
  });

  it("handles OPTIONS preflight cleanly with 204", async () => {
    const res = await optionsMuseConnector();
    expect(res.status).toBe(204);
    expect(res.headers.get("access-control-allow-origin")).toBe("*");
  });
});
