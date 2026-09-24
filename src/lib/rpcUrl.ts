/**
 * rpcUrl — read an RPC endpoint from the environment, refusing values that
 * are not an http(s) URL.
 *
 * A bare provider key (e.g. an Alchemy `alch_…` key) pasted where the full
 * URL belongs would otherwise reach viem's `http()` transport, which fails
 * every call with "Failed to parse URL from alch_…" — an error that names
 * neither the env var nor the fix. Throwing here names both.
 *
 * @file src/lib/rpcUrl.ts
 */

/** true when `value` is an absolute http(s) URL. */
export function isRpcUrl(value: string | undefined): boolean {
  const v = value?.trim();
  if (!v) return false;
  try {
    const { protocol } = new URL(v);
    return protocol === "https:" || protocol === "http:";
  } catch {
    return false;
  }
}

/**
 * The trimmed value of env var `name`, or undefined when unset (viem then
 * falls back to the chain's public RPC). Throws when set to anything that is
 * not an http(s) URL — the error carries the var name, never its value.
 */
export function readRpcUrl(name: string): string | undefined {
  const v = process.env[name]?.trim();
  if (!v) return undefined;
  if (!isRpcUrl(v)) {
    throw new Error(
      `${name} is not an http(s) URL — set the full RPC endpoint ` +
        `(e.g. https://base-sepolia.g.alchemy.com/v2/<key>), not a bare API key`,
    );
  }
  return v;
}
