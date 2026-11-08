/**
 * @file src/app/api/mcp/__tests__/stdioRemoteFallback.test.ts
 *
 * Tests for the automatic stdio HTTP fallback proxy when `DATABASE_URL` is absent.
 */

import {
  extractStdioApiKey,
  invokeRemoteStdioFallback,
  shouldProxyStdioToolToRemote,
} from "@/lib/mcp/stdioRemoteFallback";

describe("Stdio Remote HTTP Fallback (when DATABASE_URL is absent)", () => {
  const originalEnv = { ...process.env };
  const originalFetch = global.fetch;

  beforeEach(() => {
    delete process.env.DATABASE_URL;
    delete process.env.MCP_USER_API_KEY;
    delete process.env.ALCHM_MCP_USER_API_KEY;
    delete process.env.ALCHM_MCP_REMOTE_FALLBACK;
    delete process.env.ALCHM_MCP_DISABLE_REMOTE_FALLBACK;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    global.fetch = originalFetch;
  });

  it("extracts API key from _meta.apiKey or process env", () => {
    expect(extractStdioApiKey({})).toBeNull();
    expect(
      extractStdioApiKey({ _meta: { apiKey: "sk_alchm_meta_123" } }),
    ).toBe("sk_alchm_meta_123");

    process.env.ALCHM_MCP_USER_API_KEY = "sk_alchm_env_456";
    expect(extractStdioApiKey({})).toBe("sk_alchm_env_456");
  });

  it("does not proxy when DATABASE_URL is set or when anonymous without forced fallback", () => {
    expect(
      shouldProxyStdioToolToRemote(
        "alchemize_ingredients",
        { ingredients: ["garlic"] },
        "https://alchm.kitchen",
      ),
    ).toBe(false);

    process.env.DATABASE_URL = "postgres://localhost:5432/wten";
    expect(
      shouldProxyStdioToolToRemote(
        "what_to_cook_now",
        {
          availableIngredients: ["garlic"],
          _meta: { apiKey: "sk_alchm_test" },
        },
        "https://alchm.kitchen",
      ),
    ).toBe(false);
  });

  it("proxies authenticated tool calls when DATABASE_URL is absent and args are valid", () => {
    expect(
      shouldProxyStdioToolToRemote(
        "what_to_cook_now",
        {
          availableIngredients: ["chicken", "lemon"],
          _meta: { apiKey: "sk_alchm_live_key" },
        },
        "https://alchm.kitchen",
      ),
    ).toBe(true);

    // Invalid args fail fast locally before making a network hop
    expect(
      shouldProxyStdioToolToRemote(
        "get_live_sky_transits",
        {
          latitude: 999,
          _meta: { apiKey: "sk_alchm_live_key" },
        },
        "https://alchm.kitchen",
      ),
    ).toBe(false);
  });

  it("forwards Bearer token, Idempotency-Key, and X-Correlation-ID to /api/mcp/rest/[tool]", async () => {
    const fetchMock = jest.fn(
      (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        const url = typeof input === "string" ? input : input.toString();
        expect(url).toBe("https://alchm.kitchen/api/mcp/rest/what_to_cook_now");
        const headers = new Headers(init?.headers);
        expect(headers.get("authorization")).toBe("Bearer sk_alchm_live_789");
        expect(headers.get("idempotency-key")).toBe("idem-xyz-1");
        expect(headers.get("x-correlation-id")).toBe("mcp:stdio:1");
        return Promise.resolve(
          new Response(
            JSON.stringify({
              recommendations: [{ name: "Lemon Herb Chicken" }],
              billing: { status: "charged" },
              correlationId: "mcp:stdio:1",
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          ),
        );
      },
    );
    global.fetch = fetchMock;

    const res = await invokeRemoteStdioFallback(
      "what_to_cook_now",
      {
        availableIngredients: ["chicken", "lemon"],
        _meta: {
          apiKey: "sk_alchm_live_789",
          idempotencyKey: "idem-xyz-1",
        },
      },
      {
        remoteBackendUrl: "https://alchm.kitchen",
        correlationId: "mcp:stdio:1",
      },
    );

    expect(res.ok).toBe(true);
    expect(res.payload.correlationId).toBe("mcp:stdio:1");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("returns self-healing UNAVAILABLE error envelope when remote gateway is unreachable", async () => {
    global.fetch = jest.fn(() =>
      Promise.reject(new Error("connect ECONNREFUSED")),
    );

    const res = await invokeRemoteStdioFallback(
      "get_user_allowance",
      { _meta: { apiKey: "sk_alchm_live_789" } },
      {
        remoteBackendUrl: "https://alchm.kitchen",
        correlationId: "mcp:stdio:err",
      },
    );

    expect(res.ok).toBe(false);
    expect(res.payload.errorCode).toBe("UNAVAILABLE");
    expect(typeof res.payload.remediation).toBe("string");
  });
});
