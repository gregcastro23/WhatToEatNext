/**
 * @file src/lib/mcp/fallbackFailure.ts
 *
 * What the stdio REST fallback (`stdioRemoteFallback.ts`) answers when its
 * request fails: a call that was cancelled, a redirect it refused to follow, or a
 * gateway it could not reach. The text never shows the configured backend URL,
 * which may carry a secret, or an API key.
 */

import { redactSensitiveString } from "./httpSecurity";
import {
  describeBackend,
  isRedirectRefusal,
  redirectRefusal,
  withoutConfiguredUrls,
} from "./keyDestination";

/** The request that failed. */
export interface SentRequest {
  url: string;
  baseUrl: string;
  /** It carried an API key, so it was made with `redirect: "error"`. */
  keyed: boolean;
}

export interface FailureResult {
  ok: false;
  refused?: boolean;
  payload: Record<string, unknown>;
}

export function networkFailureResult(
  err: unknown,
  sent: SentRequest,
  correlationId: string,
  signal?: AbortSignal,
): FailureResult {
  const aborted =
    (signal?.aborted ?? false) ||
    (err instanceof Error && err.name === "AbortError");
  if (!aborted && sent.keyed && isRedirectRefusal(err)) {
    return redirectRefusal(correlationId);
  }
  // A runtime may quote the URL it was given. The URLs go first: redacting keys would rewrite a query string and leave
  // the credentials in front of it.
  const rawMsg =
    err instanceof Error
      ? redactSensitiveString(
          withoutConfiguredUrls(err.message, [sent.url, sent.baseUrl]),
        )
      : "Network error";
  return {
    ok: false,
    payload: {
      errorCode: aborted ? "CANCELLED" : "UNAVAILABLE",
      message: aborted
        ? "Remote MCP fallback request was cancelled."
        : `Remote MCP gateway (${describeBackend(sent.baseUrl)}) is unreachable and local DATABASE_URL is not configured: ${rawMsg}`,
      remediation: aborted
        ? "Retry the tool call when ready."
        : "Check internet connectivity to https://alchm.kitchen, or unset MCP_USER_API_KEY to run free tools in offline anonymous mode.",
      correlationId,
    },
  };
}
