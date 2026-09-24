import { isRpcUrl, readRpcUrl } from "@/lib/rpcUrl";

describe("rpcUrl", () => {
  const NAME = "TEST_RPC_URL_FOR_RPCURL_TEST";
  afterEach(() => {
    delete process.env[NAME];
  });

  it("accepts http(s) URLs", () => {
    expect(isRpcUrl("https://base-sepolia.g.alchemy.com/v2/abc")).toBe(true);
    expect(isRpcUrl("http://localhost:8545")).toBe(true);
  });

  it("rejects a bare provider key, other schemes, and empty values", () => {
    // The 2026-09-24 incident: an Alchemy key pasted where the URL belongs.
    expect(isRpcUrl("alch_EXAMPLEkeyNOTreal0000")).toBe(false);
    expect(isRpcUrl("wss://base-sepolia.g.alchemy.com/v2/abc")).toBe(false);
    expect(isRpcUrl("")).toBe(false);
    expect(isRpcUrl(undefined)).toBe(false);
  });

  it("returns undefined when unset so viem uses the chain default", () => {
    expect(readRpcUrl(NAME)).toBeUndefined();
    process.env[NAME] = "   ";
    expect(readRpcUrl(NAME)).toBeUndefined();
  });

  it("returns the trimmed URL when valid", () => {
    process.env[NAME] = " https://rpc.example/v2/k \n";
    expect(readRpcUrl(NAME)).toBe("https://rpc.example/v2/k");
  });

  it("throws naming the var — never echoing the value — for a bare key", () => {
    process.env[NAME] = "alch_secretish";
    expect(() => readRpcUrl(NAME)).toThrow(NAME);
    expect(() => readRpcUrl(NAME)).not.toThrow(/alch_secretish/);
  });
});
