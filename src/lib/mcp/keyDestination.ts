/**
 * @file src/lib/mcp/keyDestination.ts
 *
 * Where the stdio REST fallback (`stdioRemoteFallback.ts`) may send an API key,
 * what a key must look like, how a configured URL may be shown, and what the
 * fallback answers when it will not send a key. The rules are the ones
 * `resolveBridgeConfig` applies in mcp-server/src/remoteBridge.ts.
 */

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

/** What the hosted route's bearer parser accepts; anything else is read there as "no key". */
const KEY_PATTERN = /^[A-Za-z0-9_.~-]+$/;

/** A tool result for a call that was not made, or whose answer was not read. */
export interface Refusal {
  ok: false;
  refused: true;
  payload: Record<string, unknown>;
}

/**
 * Whether `requestUrl`, the URL that will actually be fetched, is somewhere an
 * API key may go: https, or plain http only to this machine; no credentials, no
 * query string and no fragment (a base URL with either would swallow the path
 * that is appended to it). Returns what is wrong, or null. The text never
 * repeats the configured value, which may carry a secret.
 */
export function keyDestinationProblem(requestUrl: string): string | null {
  let url: URL;
  try {
    url = new URL(requestUrl);
  } catch {
    return "ALCHM_MCP_BACKEND_URL is not a URL";
  }
  if (url.username || url.password) {
    return "ALCHM_MCP_BACKEND_URL must not contain credentials; the key travels in the Authorization header";
  }
  if (url.search || url.hash) {
    return "ALCHM_MCP_BACKEND_URL must not contain a query string or a fragment";
  }
  const loopback = url.protocol === "http:" && LOOPBACK_HOSTS.has(url.hostname);
  if (url.protocol !== "https:" && !loopback) {
    return "ALCHM_MCP_BACKEND_URL must be https (http is accepted only for localhost, 127.0.0.1 and [::1]): the API key would travel in clear text";
  }
  return null;
}

/**
 * Why `key` cannot be sent, or null. A character outside the bearer alphabet
 * makes the hosted route read the header as "no key", and a control character
 * or one beyond Latin-1 makes the runtime reject the header and quote the value
 * in its error; redaction of that text stops at the first odd character. So
 * such a key is refused up front, and never echoed.
 */
export function keyShapeProblem(key: string): string | null {
  return KEY_PATTERN.test(key)
    ? null
    : "it has characters an API key cannot have (spaces, quotes, control characters)";
}

function refusal(
  problem: string,
  remediation: string,
  correlationId: string,
): Refusal {
  return {
    ok: false,
    refused: true,
    payload: {
      errorCode: "UNAVAILABLE",
      message: `The API key was not sent: ${problem}.`,
      remediation,
      correlationId,
    },
  };
}

/** The result for a call whose key must not be sent to `requestUrl`, or null when it may. */
export function keyRefusal(
  apiKey: string,
  requestUrl: string,
  correlationId: string,
): Refusal | null {
  const shape = keyShapeProblem(apiKey);
  if (shape) {
    return refusal(
      shape,
      "Copy the API key again from https://alchm.kitchen/profile/api-keys.",
      correlationId,
    );
  }
  const destination = keyDestinationProblem(requestUrl);
  if (!destination) return null;
  return refusal(
    destination,
    "Set ALCHM_MCP_BACKEND_URL to an https URL (http://localhost is also accepted), or leave it unset to use https://alchm.kitchen.",
    correlationId,
  );
}

/**
 * A configured URL as it may be shown: scheme, host and path, without
 * credentials, query string or fragment (a deployment-protection token often
 * rides in the query). Not a URL: a fixed phrase.
 */
export function describeBackend(written: string): string {
  try {
    const url = new URL(written);
    return `${url.protocol}//${url.host}${url.pathname === "/" ? "" : url.pathname}`;
  } catch {
    return "(not a URL)";
  }
}

/** The ways a runtime may quote a URL it was given: as written, and as the URL parser normalises it (not just by adding a slash). */
function quotedForms(written: string): string[] {
  try {
    const normalised = new URL(written).href;
    const bare = (text: string): string => text.replace(/\/$/, "");
    return bare(normalised) === bare(written) ? [written] : [written, normalised];
  } catch {
    return [written];
  }
}

/** `text` with each of `urls`, in either form a runtime may have quoted it, shown the way `describeBackend` shows it. */
export function withoutConfiguredUrls(
  text: string,
  urls: readonly string[],
): string {
  return urls.reduce((shown, written) => {
    if (!written) return shown;
    const safe = describeBackend(written);
    return quotedForms(written).reduce(
      (partial, form) => partial.split(form).join(safe),
      shown,
    );
  }, text);
}

/**
 * Whether a failed fetch was a refused redirect. A request that carries the key
 * is made with `redirect: "error"`; Node reports "fetch failed" with the cause
 * "unexpected redirect", Bun "UnexpectedRedirect fetching ...". The match is on
 * that wording, not on the word "redirect": a host name can contain it.
 */
export function isRedirectRefusal(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const cause = err.cause instanceof Error ? err.cause.message : "";
  return /unexpected\s*redirect/i.test(`${err.message} ${cause}`);
}

/** The result for a call whose request was answered with a redirect. */
export function redirectRefusal(correlationId: string): Refusal {
  return {
    ok: false,
    refused: true,
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
