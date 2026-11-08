/**
 * @file src/lib/mcp/keyDestination.ts
 *
 * Where the stdio REST fallback (`stdioRemoteFallback.ts`) may send an API key,
 * and what it answers when it will not. The rule is the one
 * `resolveBridgeConfig` applies in mcp-server/src/remoteBridge.ts.
 */

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

/** A tool result for a call that was not made. */
export interface Refusal {
  ok: false;
  payload: Record<string, unknown>;
}

/**
 * Where an API key may be sent: https, or plain http only to this machine, and
 * no credentials in the URL. Returns what is wrong, or null. The text never
 * repeats the configured value, which may carry a secret.
 */
export function keyDestinationProblem(baseUrl: string): string | null {
  let url: URL;
  try {
    url = new URL(baseUrl);
  } catch {
    return "ALCHM_MCP_BACKEND_URL is not a URL";
  }
  if (url.username || url.password) {
    return "ALCHM_MCP_BACKEND_URL must not contain credentials; the key travels in the Authorization header";
  }
  const loopback =
    url.protocol === "http:" && LOOPBACK_HOSTS.has(url.hostname);
  if (url.protocol !== "https:" && !loopback) {
    return "ALCHM_MCP_BACKEND_URL must be https (http is accepted only for localhost): the API key would travel in clear text";
  }
  return null;
}

/** The result for a call whose key was not sent because of `problem`. */
export function destinationRefusal(
  problem: string,
  correlationId: string,
): Refusal {
  return {
    ok: false,
    payload: {
      errorCode: "UNAVAILABLE",
      message: `The API key was not sent: ${problem}.`,
      remediation:
        "Set ALCHM_MCP_BACKEND_URL to an https URL (http://localhost is also accepted), or leave it unset to use https://alchm.kitchen.",
      correlationId,
    },
  };
}

/**
 * Whether a failed fetch was a refused redirect. A request that carries the key
 * is made with `redirect: "error"`; Node reports "fetch failed" with the cause
 * "unexpected redirect", Bun "UnexpectedRedirect fetching ...".
 */
export function isRedirectRefusal(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const cause = err.cause instanceof Error ? err.cause.message : "";
  return /redirect/i.test(`${err.message} ${cause}`);
}

/** The result for a call whose request was answered with a redirect. */
export function redirectRefusal(correlationId: string): Refusal {
  return {
    ok: false,
    payload: {
      errorCode: "UNAVAILABLE",
      message:
        "Remote MCP gateway answered with a redirect, which is never followed because the API key would go wherever it points.",
      remediation:
        "Set ALCHM_MCP_BACKEND_URL to the final URL (check a trailing slash, http or https, and www).",
      correlationId,
    },
  };
}
