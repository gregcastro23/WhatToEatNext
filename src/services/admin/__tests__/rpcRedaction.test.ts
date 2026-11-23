/**
 * RPC provider keys live inside the URL (path, query or userinfo). These tests
 * pin what may be shown: the origin, and error text with every trace of the
 * configured URLs removed. FAKE values only.
 *
 * @file src/services/admin/__tests__/rpcRedaction.test.ts
 */

import { rpcOrigin, redactRpcMessage } from "@/services/admin/rpcRedaction";

const PATH_KEYED = "https://solana-devnet.g.alchemy.com/v2/FAKEKEY123";
const QUERY_KEYED = "https://x.example/?api-key=FAKEKEY123";
const USERINFO_KEYED = "https://FAKEUSER:FAKEPASS99@rpc.example:8899/";
const UNREADABLE = "(unreadable RPC URL)";

describe("rpcOrigin", () => {
  it.each([
    [PATH_KEYED, "https://solana-devnet.g.alchemy.com"],
    [QUERY_KEYED, "https://x.example"],
    [USERINFO_KEYED, "https://rpc.example:8899"],
    ["https://api.devnet.solana.com", "https://api.devnet.solana.com"],
  ])("%s -> origin only", (url, expected) => {
    expect(rpcOrigin(url)).toBe(expected);
  });

  it.each(["", "not a url", "solana-devnet.g.alchemy.com/v2/FAKEKEY123", "data:text/plain,FAKEKEY123"])(
    "a value that is not an http(s) origin (%j) shows a fixed placeholder, never itself",
    (url) => {
      expect(rpcOrigin(url)).toBe(UNREADABLE);
    },
  );
});

describe("redactRpcMessage", () => {
  it("removes the key from fetch's own 'Failed to parse URL' echo of the configured URL", () => {
    const out = redactRpcMessage(`Failed to parse URL from ${PATH_KEYED}`, [PATH_KEYED]);
    expect(out).toBe("Failed to parse URL from https://solana-devnet.g.alchemy.com");
  });

  it("removes a query-string key", () => {
    const out = redactRpcMessage(`request to ${QUERY_KEYED} failed`, [QUERY_KEYED]);
    expect(out).toBe("request to https://x.example failed");
  });

  it("removes userinfo credentials", () => {
    const out = redactRpcMessage(`bad auth FAKEUSER FAKEPASS99 on ${USERINFO_KEYED}`, [USERINFO_KEYED]);
    expect(out).not.toMatch(/FAKEUSER|FAKEPASS99/);
  });

  it("removes a bare key a provider echoes without the URL around it", () => {
    const out = redactRpcMessage("Unauthorized: api key FAKEKEY123 is not allowed", [PATH_KEYED]);
    expect(out).toBe("Unauthorized: api key [redacted] is not allowed");
  });

  it("removes a configured URL that does not parse (nothing else would recognise it)", () => {
    const raw = "solana-devnet.g.alchemy.com/v2/FAKEKEY123";
    const out = redactRpcMessage(`Failed to parse URL from ${raw}`, [raw]);
    expect(out).toBe(`Failed to parse URL from ${UNREADABLE}`);
  });

  it("cuts any OTHER http(s) URL in the message down to its origin", () => {
    const out = redactRpcMessage("redirected to https://other.example/v2/OTHERKEY999?token=OTHERKEY999.", []);
    expect(out).not.toContain("OTHERKEY999");
    expect(out).toContain("https://other.example");
  });

  it("matches the scheme case-insensitively", () => {
    const out = redactRpcMessage("redirected to HTTPS://other.example/v2/OTHERKEY999", []);
    expect(out).not.toContain("OTHERKEY999");
  });

  it("leaves text that carries no URL untouched, so diagnostics stay readable", () => {
    for (const message of ["getSlot: HTTP 429", "getSlot: Node is behind by 42 slots", "fetch failed", ""]) {
      expect(redactRpcMessage(message, [PATH_KEYED, QUERY_KEYED])).toBe(message);
    }
  });

  it("does not treat short path labels as credentials (`v2` must survive in unrelated text)", () => {
    expect(redactRpcMessage("method not found in v2 of the API", [PATH_KEYED])).toBe("method not found in v2 of the API");
  });

  it("ignores an unset (empty) URL instead of splitting the message on '' character by character", () => {
    expect(redactRpcMessage("getSlot: HTTP 429", [""])).toBe("getSlot: HTTP 429");
  });
});
