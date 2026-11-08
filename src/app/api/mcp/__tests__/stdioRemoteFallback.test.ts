/**
 * @file src/app/api/mcp/__tests__/stdioRemoteFallback.test.ts
 *
 * Tests for the automatic stdio HTTP fallback proxy when `DATABASE_URL` is absent.
 */

import { keyDestinationProblem } from "@/lib/mcp/keyDestination";
import {
  extractStdioApiKey,
  invokeRemoteStdioFallback,
  shouldProxyStdioToolToRemote,
  tryReadRemoteStdioResource,
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

  it("proxies alchm://account/allowance and alchm://account/culinary-profile when API key is configured", async () => {
    process.env.ALCHM_MCP_USER_API_KEY = "sk_alchm_resource_key";
    global.fetch = jest.fn((input: RequestInfo | URL): Promise<Response> => {
      const url = typeof input === "string" ? input : input.toString();
      if (url.endsWith("/get_user_allowance")) {
        return Promise.resolve(
          new Response(
            JSON.stringify({ authenticated: true, tier: "initiate" }),
            { status: 200 },
          ),
        );
      }
      return Promise.resolve(
        new Response(
          JSON.stringify({
            updated: true,
            profile: { allergens: ["peanuts"], dietaryFrameworks: ["Vegan"] },
          }),
          { status: 200 },
        ),
      );
    });

    const allowanceRes = await tryReadRemoteStdioResource(
      "alchm://account/allowance",
      "https://alchm.kitchen",
    );
    expect(allowanceRes?.contents[0]?.uri).toBe("alchm://account/allowance");
    expect(allowanceRes?.contents[0]?.text).toContain('"initiate"');

    const profileRes = await tryReadRemoteStdioResource(
      "alchm://account/culinary-profile",
      "https://alchm.kitchen",
    );
    expect(profileRes?.contents[0]?.uri).toBe(
      "alchm://account/culinary-profile",
    );
    expect(profileRes?.contents[0]?.text).toContain('"peanuts"');
  });
});

describe("Where the stdio fallback may send an API key", () => {
  const originalEnv = { ...process.env };
  const originalFetch = global.fetch;
  const KEY = "sk_alchm_live_fallback_destination_test";
  const withKey = { _meta: { apiKey: KEY } };

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

  const answer = (): Promise<Response> =>
    Promise.resolve(
      new Response(JSON.stringify({ authenticated: true }), { status: 200 }),
    );

  it.each([
    "https://alchm.kitchen",
    "https://staging.example.com/base",
    "http://localhost:3000",
    "http://127.0.0.1:8080",
    "http://[::1]:3000",
  ])("accepts %s", (url) => {
    expect(keyDestinationProblem(url)).toBeNull();
  });

  it.each([
    ["http://alchm.kitchen", /must be https/],
    ["http://localhost.evil.example", /must be https/],
    ["ftp://alchm.kitchen", /must be https/],
    ["https://user:hunter2@alchm.kitchen", /credentials/],
    ["not a url", /not a URL/],
  ])("refuses %s, and the reason never repeats it", (url, why) => {
    const problem = keyDestinationProblem(url);
    expect(problem).toMatch(why);
    expect(problem).not.toContain("hunter2");
    expect(problem).not.toContain(url);
  });

  it.each([
    ["a key in _meta", withKey, {}],
    ["a key in the environment", {}, { MCP_USER_API_KEY: KEY }],
  ])("does not send %s to a plain-http host that is not this machine", async (_what, args, env) => {
    Object.assign(process.env, env);
    const fetchMock = jest.fn(answer);
    global.fetch = fetchMock;

    const res = await invokeRemoteStdioFallback("get_user_allowance", args, {
      remoteBackendUrl: "http://example.com",
      correlationId: "mcp:stdio:insecure",
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(res.ok).toBe(false);
    expect(res.payload.errorCode).toBe("UNAVAILABLE");
    expect(String(res.payload.message)).toContain("was not sent");
    expect(String(res.payload.message)).toContain("must be https");
    expect(typeof res.payload.remediation).toBe("string");
    expect(res.payload.correlationId).toBe("mcp:stdio:insecure");
    expect(JSON.stringify(res.payload)).not.toContain(KEY);
    expect(JSON.stringify(res.payload)).not.toContain("example.com");
  });

  it("does not send a key to a URL that carries credentials", async () => {
    const fetchMock = jest.fn(answer);
    global.fetch = fetchMock;
    const res = await invokeRemoteStdioFallback("get_user_allowance", withKey, {
      remoteBackendUrl: "https://user:hunter2@alchm.kitchen",
      correlationId: "mcp:stdio:credentials",
    });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(res.ok).toBe(false);
    expect(JSON.stringify(res.payload)).not.toContain("hunter2");
  });

  it("sends a key over https and over plain http to this machine, and refuses to follow a redirect", async () => {
    const seen: Array<{ url: string; redirect: RequestRedirect | undefined }> =
      [];
    global.fetch = jest.fn(
      (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        seen.push({ url: String(input), redirect: init?.redirect });
        return answer();
      },
    );

    for (const remoteBackendUrl of [
      "https://alchm.kitchen/",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://[::1]:3000",
    ]) {
      const res = await invokeRemoteStdioFallback(
        "get_user_allowance",
        withKey,
        { remoteBackendUrl, correlationId: "mcp:stdio:ok" },
      );
      expect(res.ok).toBe(true);
    }

    expect(seen.map((entry) => entry.url)).toEqual([
      "https://alchm.kitchen/api/mcp/rest/get_user_allowance",
      "http://localhost:3000/api/mcp/rest/get_user_allowance",
      "http://127.0.0.1:3000/api/mcp/rest/get_user_allowance",
      "http://[::1]:3000/api/mcp/rest/get_user_allowance",
    ]);
    expect(seen.map((entry) => entry.redirect)).toEqual([
      "error",
      "error",
      "error",
      "error",
    ]);
  });

  it("leaves a call that carries no key alone: any backend URL, redirects as before", async () => {
    process.env.ALCHM_MCP_REMOTE_FALLBACK = "always";
    let sentRedirect: RequestRedirect | undefined = "manual";
    let sentAuthorization: string | null = "unset";
    global.fetch = jest.fn(
      (_input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        sentRedirect = init?.redirect;
        sentAuthorization = new Headers(init?.headers).get("authorization");
        return answer();
      },
    );

    const res = await invokeRemoteStdioFallback(
      "get_user_allowance",
      {},
      {
        remoteBackendUrl: "http://example.com",
        correlationId: "mcp:stdio:anonymous",
      },
    );

    expect(res.ok).toBe(true);
    expect(sentAuthorization).toBeNull(); // no key, so nothing secret to protect
    expect(sentRedirect).toBeUndefined();
  });

  it.each([
    ["Node's words", new TypeError("fetch failed", { cause: new Error("unexpected redirect") })],
    ["Bun's words", new Error('UnexpectedRedirect fetching "https://alchm.kitchen/api/mcp/rest/get_user_allowance"')],
  ])("explains a refused redirect in %s", async (_what, failure) => {
    global.fetch = jest.fn(() => Promise.reject(failure));
    const res = await invokeRemoteStdioFallback("get_user_allowance", withKey, {
      remoteBackendUrl: "https://alchm.kitchen",
      correlationId: "mcp:stdio:redirect",
    });
    expect(res.ok).toBe(false);
    expect(res.payload.errorCode).toBe("UNAVAILABLE");
    expect(String(res.payload.message)).toContain("never followed");
    expect(String(res.payload.remediation)).toContain("final URL");
  });

  it("does not turn an ordinary failure into the redirect explanation", async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error("connect ECONNREFUSED")));
    const res = await invokeRemoteStdioFallback("get_user_allowance", withKey, {
      remoteBackendUrl: "https://alchm.kitchen",
      correlationId: "mcp:stdio:down",
    });
    expect(String(res.payload.message)).toContain("is unreachable");
    expect(String(res.payload.message)).not.toContain("redirect");
  });

  it("does not read a rejection that is not an Error as a redirect", async () => {
    global.fetch = jest.fn(() => Promise.reject("boom"));
    const res = await invokeRemoteStdioFallback("get_user_allowance", withKey, {
      remoteBackendUrl: "https://alchm.kitchen",
      correlationId: "mcp:stdio:string",
    });
    expect(res.ok).toBe(false);
    expect(String(res.payload.message)).toContain("is unreachable");
  });

  it("reads no account resource through a backend the key may not be sent to", async () => {
    process.env.ALCHM_MCP_USER_API_KEY = KEY;
    const fetchMock = jest.fn(answer);
    global.fetch = fetchMock;
    const res = await tryReadRemoteStdioResource(
      "alchm://account/allowance",
      "http://example.com",
    );
    expect(res).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
