/**
 * @file src/app/api/mcp/__tests__/keyDestination.test.ts
 *
 * The rules the stdio REST fallback applies before it sends an API key: where it
 * may go, what it must look like, how a configured URL is shown, and which
 * failures are a refused redirect. The calls through the fallback itself are in
 * stdioRemoteFallback.test.ts.
 */

import {
  describeBackend,
  isRedirectRefusal,
  keyDestinationProblem,
  keyRefusal,
  keyShapeProblem,
  redirectRefusal,
  withoutConfiguredUrls,
} from "@/lib/mcp/keyDestination";

const KEY = "sk_alchm_live_Abc-123_xyz.~";
const GOOD_URL = "https://alchm.kitchen/api/mcp/rest/get_user_allowance";

describe("where an API key may be sent", () => {
  it.each([
    "https://alchm.kitchen/api/mcp/rest/get_user_allowance",
    "https://staging.example.com/base/api/mcp/rest/get_user_allowance",
    "https://alchm.kitchen:8443/api/mcp/rest/get_user_allowance",
    "http://localhost:3000/api/mcp/rest/get_user_allowance",
    "http://127.0.0.1:8080/api/mcp/rest/get_user_allowance",
    "http://[::1]:3000/api/mcp/rest/get_user_allowance",
    "HTTP://LOCALHOST:3000/api/mcp/rest/get_user_allowance",
  ])("accepts %s", (url) => {
    expect(keyDestinationProblem(url)).toBeNull();
  });

  it.each([
    ["plain http to a host that is not this machine", "http://alchm.kitchen/x", /must be https/],
    ["a name that only starts like localhost", "http://localhost.evil.example/x", /must be https/],
    ["localhost with a trailing dot", "http://localhost./x", /must be https/],
    ["loopback addresses other than the three named", "http://127.0.0.2:3000/x", /must be https/],
    ["the wildcard address", "http://0.0.0.0:3000/x", /must be https/],
    ["the IPv6 wildcard address", "http://[::]:3000/x", /must be https/],
    ["a scheme that is neither", "ftp://alchm.kitchen/x", /must be https/],
    ["a scheme that is neither, on this machine", "ftp://localhost/x", /must be https/],
    ["a user name and a password", "https://user:hunter2@alchm.kitchen/x", /credentials/],
    ["a password alone", "https://:hunter2@alchm.kitchen/x", /credentials/],
    ["a user name alone", "https://hunter2@alchm.kitchen/x", /credentials/],
    ["a query string", "https://alchm.kitchen/base?token=hunter2", /query string or a fragment/],
    ["a fragment", "https://alchm.kitchen/base#hunter2", /query string or a fragment/],
    ["something that is not a URL", "not a url hunter2", /not a URL/],
  ])("refuses %s, and says why without repeating it", (_what, url, why) => {
    const problem = keyDestinationProblem(url);
    expect(problem).toMatch(why);
    expect(problem).not.toContain("hunter2");
    expect(problem).not.toContain("alchm.kitchen/");
    expect(problem).not.toContain(url);
  });

  it("names the three hosts plain http is accepted for", () => {
    expect(keyDestinationProblem("http://example.com/x")).toContain("localhost, 127.0.0.1 and [::1]");
  });
});

describe("what an API key must look like", () => {
  it.each([KEY, "sk_alchm_live_0123456789", "a", "A-b_c.d~e"])("accepts %s", (key) => {
    expect(keyShapeProblem(key)).toBeNull();
  });

  it.each([
    ["a space", "sk_alchm_live_abc def"],
    ["a line break", "sk_alchm_live_abc\nsk_alchm_live_TAIL"],
    ["a quote", 'sk_alchm_live_abc"def'],
    ["a character outside Latin-1", "sk_alchm_live_abc☃"],
    ["a control character", "sk_alchm_live_abc\u0007def"],
    ["a plus sign", "sk_alchm_live_a+b"],
    ["an equals sign", "sk_alchm_live_a=="],
    ["a slash", "sk_alchm_live_a/b"],
    ["nothing", ""],
  ])("refuses a key with %s, and does not repeat it", (_what, key) => {
    const problem = keyShapeProblem(key);
    expect(problem).toContain("characters an API key cannot have");
    expect(problem).not.toContain("sk_alchm");
  });
});

describe("the result for a key that may not be sent", () => {
  it("is null when the key and the URL are both fine", () => {
    expect(keyRefusal(KEY, GOOD_URL, "mcp:x")).toBeNull();
  });

  it("is a refusal that carries the correlation id, says the key was not sent, and shows the key nowhere", () => {
    const refusal = keyRefusal(KEY, "http://example.com/x", "mcp:stdio:7");
    expect(refusal).toMatchObject({ ok: false, refused: true });
    expect(refusal?.payload).toMatchObject({ errorCode: "UNAVAILABLE", correlationId: "mcp:stdio:7" });
    expect(String(refusal?.payload.message)).toMatch(/^The API key was not sent: .*must be https.*\.$/);
    expect(String(refusal?.payload.remediation)).toContain("ALCHM_MCP_BACKEND_URL");
    expect(JSON.stringify(refusal)).not.toContain(KEY);
    expect(JSON.stringify(refusal)).not.toContain("example.com");
  });

  it("puts the shape of the key first, with its own remediation, and never repeats any part of the key", () => {
    const key = "sk_alchm_live_HEAD\nsk_alchm_live_TAILSECRET";
    const refusal = keyRefusal(key, "http://example.com/x", "mcp:stdio:8");
    expect(String(refusal?.payload.message)).toContain("characters an API key cannot have");
    expect(String(refusal?.payload.remediation)).toContain("https://alchm.kitchen/profile/api-keys");
    expect(JSON.stringify(refusal)).not.toContain("HEAD");
    expect(JSON.stringify(refusal)).not.toContain("TAILSECRET");
  });
});

describe("how a configured URL is shown", () => {
  it.each([
    ["https://alchm.kitchen", "https://alchm.kitchen"],
    ["https://alchm.kitchen/", "https://alchm.kitchen"],
    ["https://staging.example.com/base/", "https://staging.example.com/base/"],
    ["http://[::1]:3000", "http://[::1]:3000"],
    ["https://user:hunter2@alchm.kitchen/base?token=abc#frag", "https://alchm.kitchen/base"],
    ["  https://alchm.kitchen  ", "https://alchm.kitchen"],
    ["not a url hunter2", "(not a URL)"],
    ["", "(not a URL)"],
  ])("shows %j as %j", (written, shown) => {
    expect(describeBackend(written)).toBe(shown);
  });

  it("replaces each URL, wherever it occurs in a text and however often, and leaves the rest alone", () => {
    const base = "https://u:hunter2@alchm.kitchen/base";
    const request = `${base}/api/mcp/rest/get_user_allowance`;
    const text = `ConnectionRefused fetching "${request}" (base ${base}), and again ${request}.`;
    expect(withoutConfiguredUrls(text, [request, base])).toBe(
      'ConnectionRefused fetching "https://alchm.kitchen/base/api/mcp/rest/get_user_allowance" (base https://alchm.kitchen/base), and again https://alchm.kitchen/base/api/mcp/rest/get_user_allowance.',
    );
  });

  it("replaces the URL as the parser normalises it too: host in lower case, spaces escaped", () => {
    const written = "HTTPS://User:hunter2@Alchm.Kitchen/Base/x y";
    const quoted = new URL(written).href; // https://User:hunter2@alchm.kitchen/Base/x%20y
    expect(quoted).not.toBe(written);
    const shown = withoutConfiguredUrls(`failed fetching ${quoted}, and ${written}`, [written]);
    expect(shown).toBe("failed fetching https://alchm.kitchen/Base/x%20y, and https://alchm.kitchen/Base/x%20y");
    expect(shown).not.toContain("hunter2");
  });

  it("does not garble the path after a root URL, though the parser adds a slash to it", () => {
    const request = "https://alchm.kitchen/api/mcp/rest/get_user_allowance";
    expect(withoutConfiguredUrls(`fetching ${request}`, [request, "https://alchm.kitchen"])).toBe(`fetching ${request}`);
  });

  it("drops the query string a base URL carries, which swallows the path appended to it", () => {
    const base = "https://alchm.kitchen/base?token=hunter2";
    const request = `${base}/api/mcp/rest/get_user_allowance`;
    const shown = withoutConfiguredUrls(`failed fetching ${request}`, [request, base]);
    expect(shown).toBe("failed fetching https://alchm.kitchen/base");
    expect(shown).not.toContain("hunter2");
  });

  it("changes nothing when a URL does not occur, and skips an empty one", () => {
    expect(withoutConfiguredUrls("connect ECONNREFUSED", ["https://alchm.kitchen/x"])).toBe("connect ECONNREFUSED");
    expect(withoutConfiguredUrls("connect ECONNREFUSED", [""])).toBe("connect ECONNREFUSED");
  });
});

describe("which failures are a refused redirect", () => {
  it.each([
    ["Node's words", new TypeError("fetch failed", { cause: new Error("unexpected redirect") })],
    ["Bun's words", new Error('UnexpectedRedirect fetching "https://alchm.kitchen/api/mcp/rest/x"')],
    ["Bun's words with a space", new Error("Unexpected Redirect")],
    ["the message alone", new Error("unexpected redirect")],
  ])("recognises %s", (_what, failure) => {
    expect(isRedirectRefusal(failure)).toBe(true);
  });

  it.each([
    ["a host name that says redirect", new TypeError("fetch failed", { cause: new Error("getaddrinfo ENOTFOUND redirect.example.com") })],
    ["a message that says redirect", new Error("connect ECONNREFUSED redirect.example.com:443")],
    ["a redirect limit, which only a followed redirect can hit", new TypeError("fetch failed", { cause: new Error("redirect count exceeded") })],
    ["a cause that is not an Error", new TypeError("fetch failed", { cause: "unexpected redirect" })],
    ["a text that is not an Error", "unexpected redirect"],
    ["nothing", undefined],
  ])("does not mistake %s for one", (_what, failure) => {
    expect(isRedirectRefusal(failure)).toBe(false);
  });

  it("answers a refused redirect with a refusal that says the key was not followed anywhere", () => {
    const refusal = redirectRefusal("mcp:stdio:9");
    expect(refusal).toMatchObject({ ok: false, refused: true });
    expect(refusal.payload).toMatchObject({ errorCode: "UNAVAILABLE", correlationId: "mcp:stdio:9" });
    expect(String(refusal.payload.message)).toContain("never followed");
    expect(String(refusal.payload.remediation)).toContain("final URL");
  });
});
