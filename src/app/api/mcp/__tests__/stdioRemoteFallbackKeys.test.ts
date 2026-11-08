/**
 * @file src/app/api/mcp/__tests__/stdioRemoteFallbackKeys.test.ts
 *
 * What the stdio REST fallback does with an API key: where it sends it, in what
 * form, what it says when it will not, and that it never shows the key or the
 * configured URL. The rules themselves are in keyDestination.test.ts, the rest of
 * the fallback in stdioRemoteFallback.test.ts.
 */

import {
  invokeRemoteStdioFallback,
  tryReadRemoteStdioResource,
  type RemoteFallbackResult,
} from "@/lib/mcp/stdioRemoteFallback";

const KEY = "sk_alchm_live_fallback_destination_test";
const TOOL = "get_user_allowance";
const REST_URL = `https://alchm.kitchen/api/mcp/rest/${TOOL}`;
const withKey = { _meta: { apiKey: KEY } };
const nodeRedirect = (): TypeError =>
  new TypeError("fetch failed", { cause: new Error("unexpected redirect") });

/** Every place a key can come from, as arguments and as environment. */
const CARRIERS: Array<[string, Record<string, unknown>, Record<string, string>]> = [
  ["_meta.apiKey", { _meta: { apiKey: KEY } }, {}],
  ["_meta.authKey", { _meta: { authKey: KEY } }, {}],
  ["_apiKey", { _apiKey: KEY }, {}],
  ["_authKey", { _authKey: KEY }, {}],
  ["MCP_USER_API_KEY", {}, { MCP_USER_API_KEY: KEY }],
  ["ALCHM_MCP_USER_API_KEY", {}, { ALCHM_MCP_USER_API_KEY: KEY }],
];

interface Sent {
  url: string;
  headers: Headers;
  redirect: RequestRedirect | undefined;
  signal: AbortSignal | null | undefined;
}

const answer = (): Promise<Response> =>
  Promise.resolve(
    new Response(JSON.stringify({ authenticated: true }), { status: 200 }),
  );

/** Replaces fetch with one that records what it is given and answers 200. */
function recordFetch(): Sent[] {
  const sent: Sent[] = [];
  global.fetch = jest.fn(
    (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      sent.push({
        url: String(input),
        headers: new Headers(init?.headers),
        redirect: init?.redirect,
        signal: init?.signal,
      });
      return answer();
    },
  );
  return sent;
}

function failWith(failure: unknown): void {
  global.fetch = jest.fn(() => Promise.reject(failure));
}

function call(
  args: Record<string, unknown>,
  remoteBackendUrl: string | undefined,
  signal?: AbortSignal,
): Promise<RemoteFallbackResult> {
  return invokeRemoteStdioFallback(TOOL, args, {
    ...(remoteBackendUrl === undefined ? {} : { remoteBackendUrl }),
    correlationId: "mcp:stdio:t",
    ...(signal ? { signal } : {}),
  });
}

describe("the stdio REST fallback and the API key", () => {
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

  describe("where it is sent", () => {
    it.each(CARRIERS)(
      "does not send a key given as %s to plain http on another host",
      async (_from, args, env) => {
        Object.assign(process.env, env);
        const sent = recordFetch();
        const res = await call(args, "http://example.com");
        expect(sent).toEqual([]);
        expect(res).toMatchObject({ ok: false, refused: true });
        expect(res.payload).toMatchObject({
          errorCode: "UNAVAILABLE",
          correlationId: "mcp:stdio:t",
        });
        expect(String(res.payload.message)).toContain("The API key was not sent");
        expect(String(res.payload.message)).toContain("must be https");
        expect(typeof res.payload.remediation).toBe("string");
        expect(JSON.stringify(res)).not.toContain(KEY);
        expect(JSON.stringify(res)).not.toContain("example.com");
      },
    );

    it.each(CARRIERS)(
      "sends a key given as %s over https as a bearer token, and refuses a redirect",
      async (_from, args, env) => {
        Object.assign(process.env, env);
        const sent = recordFetch();
        const res = await call(args, "https://alchm.kitchen");
        expect(res.ok).toBe(true);
        expect(sent).toHaveLength(1);
        expect(sent[0]?.headers.get("authorization")).toBe(`Bearer ${KEY}`);
        expect(sent[0]?.redirect).toBe("error");
      },
    );

    it.each(["http://localhost:3000", "http://127.0.0.1:3000/", "http://[::1]:3000"])(
      "sends a key to %s, which is this machine, and refuses a redirect there too",
      async (url) => {
        const sent = recordFetch();
        expect((await call(withKey, url)).ok).toBe(true);
        expect(sent.map((entry) => entry.redirect)).toEqual(["error"]);
        expect(sent[0]?.url).toMatch(/\/api\/mcp\/rest\/get_user_allowance$/);
      },
    );

    it("does not send a key to a URL that carries credentials, and does not show them", async () => {
      const sent = recordFetch();
      const res = await call(withKey, "https://user:hunter2@alchm.kitchen");
      expect(sent).toEqual([]);
      expect(String(res.payload.message)).toContain("credentials");
      expect(JSON.stringify(res)).not.toContain("hunter2");
    });
  });

  describe("what it does with a backend URL", () => {
    it.each([
      ["a query string", "https://alchm.kitchen/base?x-vercel-protection-bypass=QSECRET"],
      ["a fragment", "https://alchm.kitchen/base#QSECRET"],
      // alone, "?" and "#" parse with an empty query and fragment; the path that follows them is what they swallow
      ["an empty query string", "https://alchm.kitchen/base?"],
      ["an empty fragment", "https://alchm.kitchen/base#"],
    ])(
      "does not send a key to a URL with %s, which would swallow the path, and does not show it",
      async (_what, written) => {
        const sent = recordFetch();
        const res = await call(withKey, written);
        expect(sent).toEqual([]);
        expect(String(res.payload.message)).toContain("query string or a fragment");
        expect(JSON.stringify(res)).not.toContain("QSECRET");
      },
    );

    it.each([
      ["spaces around it", "  https://alchm.kitchen  ", REST_URL],
      ["trailing slashes", "https://alchm.kitchen//", REST_URL],
      ["a line break and a tab around it", "\thttp://localhost:3000/\n", "http://localhost:3000/api/mcp/rest/get_user_allowance"],
      ["a path", "https://staging.example.com/base/", "https://staging.example.com/base/api/mcp/rest/get_user_allowance"],
    ])("takes a URL with %s as the address it names", async (_what, written, expected) => {
      const sent = recordFetch();
      expect((await call(withKey, written)).ok).toBe(true);
      expect(sent.map((entry) => entry.url)).toEqual([expected]);
    });

    it.each([undefined, "", "   "])("uses https://alchm.kitchen when the backend URL is %j", async (written) => {
      const sent = recordFetch();
      await call(withKey, written);
      expect(sent.map((entry) => entry.url)).toEqual([REST_URL]);
    });

    it("writes the tool name into the path as one segment", async () => {
      const sent = recordFetch();
      await invokeRemoteStdioFallback("get user/allowance?x=1", withKey, {
        remoteBackendUrl: "https://alchm.kitchen",
        correlationId: "mcp:stdio:t",
      });
      expect(sent.map((entry) => entry.url)).toEqual([
        "https://alchm.kitchen/api/mcp/rest/get%20user%2Fallowance%3Fx%3D1",
      ]);
    });
  });

  describe("the form it is sent in", () => {
    it("prefers a key in _meta, then the legacy arguments, then the environment", async () => {
      const sent = recordFetch();
      process.env.ALCHM_MCP_USER_API_KEY = "K6";
      process.env.MCP_USER_API_KEY = "K5";
      await call({ _meta: { apiKey: "K1", authKey: "K2" }, _apiKey: "K3", _authKey: "K4" }, "https://alchm.kitchen");
      await call({ _meta: { authKey: "K2" }, _apiKey: "K3", _authKey: "K4" }, "https://alchm.kitchen");
      await call({ _apiKey: "K3", _authKey: "K4" }, "https://alchm.kitchen");
      await call({ _authKey: "K4" }, "https://alchm.kitchen");
      await call({}, "https://alchm.kitchen");
      delete process.env.MCP_USER_API_KEY;
      await call({}, "https://alchm.kitchen");
      expect(sent.map((entry) => entry.headers.get("authorization"))).toEqual([
        "Bearer K1", "Bearer K2", "Bearer K3", "Bearer K4", "Bearer K5", "Bearer K6",
      ]);
    });

    it("trims a key, and treats a blank one as none: no Authorization header, redirects as before", async () => {
      const sent = recordFetch();
      await call({ _meta: { apiKey: `  ${KEY}\n` } }, "https://alchm.kitchen");
      await call({ _meta: { apiKey: "   " } }, "http://example.com");
      expect(sent.map((entry) => entry.headers.get("authorization"))).toEqual([`Bearer ${KEY}`, null]);
      expect(sent.map((entry) => entry.redirect)).toEqual(["error", undefined]);
    });

    it.each([
      ["a space", "sk_alchm_live_HEAD sk_alchm_live_TAILSECRET"],
      ["a line break", "sk_alchm_live_HEAD\nsk_alchm_live_TAILSECRET"],
      ["a quote", 'sk_alchm_live_HEAD"TAILSECRET'],
      ["a character beyond Latin-1", "sk_alchm_live_HEAD☃TAILSECRET"],
    ])("does not send a key with %s, and shows no part of it", async (_what, key) => {
      const sent = recordFetch();
      process.env.MCP_USER_API_KEY = key;
      for (const args of [{ _meta: { apiKey: key } }, {}]) {
        const res = await call(args, "https://alchm.kitchen");
        expect(res).toMatchObject({ ok: false, refused: true });
        expect(String(res.payload.message)).toContain("characters an API key cannot have");
        expect(String(res.payload.remediation)).toContain("profile/api-keys");
        expect(JSON.stringify(res)).not.toMatch(/HEAD|TAILSECRET/);
      }
      expect(sent).toEqual([]);
    });
  });
});

describe("the stdio REST fallback when a call fails", () => {
  const originalEnv = { ...process.env };
  const originalFetch = global.fetch;

  beforeEach(() => {
    delete process.env.DATABASE_URL;
    delete process.env.MCP_USER_API_KEY;
    delete process.env.ALCHM_MCP_USER_API_KEY;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    global.fetch = originalFetch;
  });

  it.each([
    ["Node's words", nodeRedirect()],
    ["Bun's words", new Error(`UnexpectedRedirect fetching "${REST_URL}"`)],
  ])("explains a refused redirect in %s, as a refusal", async (_what, failure) => {
    failWith(failure);
    const res = await call(withKey, "https://alchm.kitchen");
    expect(res).toMatchObject({ ok: false, refused: true });
    expect(res.payload).toMatchObject({ errorCode: "UNAVAILABLE", correlationId: "mcp:stdio:t" });
    expect(String(res.payload.message)).toContain("never followed");
    expect(String(res.payload.remediation)).toContain("final URL");
  });

  it.each([
    ["an error that says redirect only in a host name", new TypeError("fetch failed", { cause: new Error("getaddrinfo ENOTFOUND redirect.example.com") }), "fetch failed"],
    ["something that is not an Error", "boom", "Network error"],
    ["a connection that was refused", new Error("connect ECONNREFUSED"), "connect ECONNREFUSED"],
  ])("calls %s unreachable, not a redirect, and not a refusal", async (_what, failure, shown) => {
    failWith(failure);
    const res = await call(withKey, "https://alchm.kitchen");
    expect(res).toMatchObject({ ok: false });
    expect(res.refused).toBeFalsy();
    expect(res.payload).toMatchObject({ errorCode: "UNAVAILABLE", correlationId: "mcp:stdio:t" });
    expect(String(res.payload.message)).toContain(`is unreachable and local DATABASE_URL is not configured: ${shown}`);
    expect(String(res.payload.message)).not.toContain("never followed");
    expect(String(res.payload.remediation)).toContain("Check internet connectivity");
  });

  it("does not read the failure of a call without a key as a refused redirect: that call follows redirects", async () => {
    failWith(nodeRedirect());
    const res = await call({}, "https://alchm.kitchen");
    expect(String(res.payload.message)).toContain("is unreachable");
    expect(res.refused).toBeFalsy();
  });

  it("does not show the configured URL, however the runtime quotes it", async () => {
    const written = "https://user:hunter2@staging.example.com/base?token=QSECRET";
    failWith(new Error(`ConnectionRefused fetching "${written}/api/mcp/rest/${TOOL}" (base ${written}). For more information, pass verbose: true`));
    const res = await call({}, written); // no key, so the call is made
    expect(String(res.payload.message)).toBe(
      'Remote MCP gateway (https://staging.example.com/base) is unreachable and local DATABASE_URL is not configured: ConnectionRefused fetching "https://staging.example.com/base" (base https://staging.example.com/base). For more information, pass verbose: true',
    );
    expect(JSON.stringify(res.payload)).not.toMatch(/hunter2|QSECRET/);
  });

  it("reports a call that was cancelled as cancelled, though the error says redirect", async () => {
    const stop = new AbortController();
    stop.abort();
    failWith(nodeRedirect());
    const res = await call(withKey, "https://alchm.kitchen", stop.signal);
    expect(res.payload).toMatchObject({ errorCode: "CANCELLED", correlationId: "mcp:stdio:t" });
    expect(String(res.payload.message)).toContain("cancelled");
    expect(String(res.payload.remediation)).toContain("Retry");
    expect(res.refused).toBeFalsy();
  });

  it("reports an AbortError as cancelled, and hands the caller's signal to fetch", async () => {
    failWith(Object.assign(new Error("The operation was aborted"), { name: "AbortError" }));
    const res = await call(withKey, "https://alchm.kitchen");
    expect(res.payload.errorCode).toBe("CANCELLED");
    const sent = recordFetch();
    const stop = new AbortController();
    await call(withKey, "https://alchm.kitchen", stop.signal);
    expect(sent[0]?.signal).toBe(stop.signal);
  });
});

describe("the stdio REST fallback and the account resources", () => {
  const originalEnv = { ...process.env };
  const originalFetch = global.fetch;
  const allowance = "alchm://account/allowance";

  beforeEach(() => {
    delete process.env.DATABASE_URL;
    delete process.env.MCP_USER_API_KEY;
    process.env.ALCHM_MCP_USER_API_KEY = KEY;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    global.fetch = originalFetch;
  });

  it.each([
    [allowance, "get_user_allowance"],
    ["alchm://account/culinary-profile", "update_culinary_profile"],
  ])("shows the refusal, not anonymous data, when %s is read through a backend the key may not go to", async (uri, tool) => {
    const sent = recordFetch();
    const res = await tryReadRemoteStdioResource(uri, "http://example.com");
    expect(sent).toEqual([]);
    expect(res?.contents).toHaveLength(1);
    expect(res?.contents[0]).toMatchObject({ uri, mimeType: "application/json" });
    const shown: unknown = JSON.parse(res?.contents[0]?.text ?? "null");
    expect(shown).toMatchObject({ errorCode: "UNAVAILABLE", correlationId: `mcp:resource:${tool}` });
    expect(JSON.stringify(shown)).toContain("was not sent");
    expect(JSON.stringify(shown)).not.toContain(KEY);
    expect(JSON.stringify(shown)).not.toContain("example.com");
  });

  it("shows a refused redirect too, but returns null for any other failure", async () => {
    failWith(nodeRedirect());
    const redirected = await tryReadRemoteStdioResource(allowance, "https://alchm.kitchen");
    expect(redirected?.contents[0]?.text).toContain("never followed");
    failWith(new Error("connect ECONNREFUSED"));
    expect(await tryReadRemoteStdioResource(allowance, "https://alchm.kitchen")).toBeNull();
    global.fetch = jest.fn(() =>
      Promise.resolve(new Response(JSON.stringify({ errorCode: "UNAUTHORIZED" }), { status: 401 })),
    );
    expect(await tryReadRemoteStdioResource(allowance, "https://alchm.kitchen")).toBeNull();
  });

  it("reads a resource over https as before", async () => {
    recordFetch();
    const res = await tryReadRemoteStdioResource(allowance, "https://alchm.kitchen");
    expect(JSON.parse(res?.contents[0]?.text ?? "null")).toMatchObject({ authenticated: true });
  });
});
