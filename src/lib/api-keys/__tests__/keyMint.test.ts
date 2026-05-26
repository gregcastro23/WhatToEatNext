/**
 * Tests for the pure key-mint helpers. No DB; just shape, entropy,
 * and hash determinism.
 */
import { generateApiKey, hashApiKey, maskApiKey } from "@/lib/api-keys/keyMint";

describe("generateApiKey", () => {
  it("emits the sk_alchm_live_ prefix", () => {
    const k = generateApiKey();
    expect(k.plaintext.startsWith("sk_alchm_live_")).toBe(true);
  });

  it("emits a base64url payload of 43 chars (32 bytes, no padding)", () => {
    const { plaintext } = generateApiKey();
    const body = plaintext.slice("sk_alchm_live_".length);
    expect(body).toHaveLength(43);
    expect(body).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });

  it("returns a distinct key on every call", () => {
    const a = generateApiKey();
    const b = generateApiKey();
    expect(a.plaintext).not.toBe(b.plaintext);
    expect(a.hash).not.toBe(b.hash);
  });

  it("hash is sha256(plaintext) so lookups re-hashing agree", () => {
    const k = generateApiKey();
    expect(k.hash).toBe(hashApiKey(k.plaintext));
    expect(k.hash).toHaveLength(64);
    expect(k.hash).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("hashApiKey", () => {
  it("is deterministic for a fixed input", () => {
    expect(hashApiKey("sk_alchm_live_abcdef")).toBe(
      hashApiKey("sk_alchm_live_abcdef"),
    );
  });

  it("differs across distinct inputs", () => {
    expect(hashApiKey("sk_alchm_live_a")).not.toBe(
      hashApiKey("sk_alchm_live_b"),
    );
  });
});

describe("maskApiKey", () => {
  it("keeps the prefix and last 4 chars when the key has the expected shape", () => {
    expect(maskApiKey("sk_alchm_live_AAAAaBcD")).toBe("sk_alchm_live_…aBcD");
  });

  it("falls back to a tail-only mask for unknown shapes", () => {
    expect(maskApiKey("legacy-token-XYZW")).toBe("…XYZW");
  });
});
