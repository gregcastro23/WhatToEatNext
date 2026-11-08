/**
 * @file src/lib/mcp/stdioRemoteFallback.ts
 *
 * Automatic HTTP fallback proxy for `@alchm/mcp-server` stdio sessions when
 * `DATABASE_URL` is absent. Seamlessly forwards authenticated / paid tool calls
 * to the remote `alchm.kitchen` REST bridge (`/api/mcp/rest/[tool]`) so local
 * `npx @alchm/mcp-server` users with an `sk_alchm_...` API key can execute
 * metered tools, inspect live ESMS allowances, and persist culinary profiles
 * without needing direct PostgreSQL database credentials on their machine.
 */

import { isToolName } from "./catalog";
import { networkFailureResult } from "./fallbackFailure";
import { keyRefusal } from "./keyDestination";
import { validateToolArguments } from "./validation";

const DEFAULT_BACKEND_URL = "https://alchm.kitchen";

export interface RemoteFallbackOptions {
  remoteBackendUrl?: string;
  correlationId: string;
  signal?: AbortSignal;
}

export interface RemoteFallbackResult {
  ok: boolean;
  /** The call was not made (or its answer not read) because the API key may not go where it was headed; see keyDestination.ts. */
  refused?: boolean;
  payload: Record<string, unknown>;
}

function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

function nonEmptyString(val: unknown): string | null {
  if (typeof val !== "string") return null;
  const trimmed = val.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function extractKeyFromMeta(meta: unknown): string | null {
  if (!isRecord(meta)) return null;
  return nonEmptyString(meta.apiKey) ?? nonEmptyString(meta.authKey);
}

/**
 * Extracts a configured caller API key from tool `_meta`, top-level legacy
 * fields, or the stdio process environment (`MCP_USER_API_KEY` / `ALCHM_MCP_USER_API_KEY`).
 */
export function extractStdioApiKey(
  args: Record<string, unknown>,
): string | null {
  return (
    extractKeyFromMeta(args._meta) ??
    nonEmptyString(args._apiKey) ??
    nonEmptyString(args._authKey) ??
    nonEmptyString(process.env.MCP_USER_API_KEY) ??
    nonEmptyString(process.env.ALCHM_MCP_USER_API_KEY)
  );
}

function hasDatabaseConfigured(): boolean {
  return Boolean(nonEmptyString(process.env.DATABASE_URL));
}

function isRemoteFallbackForced(args: Record<string, unknown>): boolean {
  if (process.env.ALCHM_MCP_REMOTE_FALLBACK === "always") return true;
  if (isRecord(args._meta) && args._meta.remoteFallback === true) return true;
  return false;
}

/**
 * Determines whether a stdio tool invocation should be proxied over HTTP to
 * `${remoteBackendUrl}/api/mcp/rest/${toolName}`.
 *
 * Proxies when:
 * 1. `remoteBackendUrl` is provided and `DATABASE_URL` is absent, AND
 * 2. The arguments pass local schema validation (so invalid args fail fast locally), AND
 * 3. Either the caller supplied an API key (`sk_alchm_...`) or explicitly forced
 *    remote fallback via `ALCHM_MCP_REMOTE_FALLBACK=always` / `_meta.remoteFallback: true`.
 */
export function shouldProxyStdioToolToRemote(
  toolName: string,
  args: Record<string, unknown>,
  remoteBackendUrl?: string,
): boolean {
  if (process.env.ALCHM_MCP_DISABLE_REMOTE_FALLBACK === "1") return false;
  const baseUrl = nonEmptyString(remoteBackendUrl);
  if (!baseUrl || hasDatabaseConfigured()) return false;
  if (!isToolName(toolName)) return false;
  if (validateToolArguments(toolName, args) !== null) return false;
  return (
    extractStdioApiKey(args) !== null || isRemoteFallbackForced(args)
  );
}

function buildRemoteHeaders(
  args: Record<string, unknown>,
  apiKey: string | null,
  correlationId: string,
): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Correlation-ID": correlationId,
  };
  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }
  const meta = isRecord(args._meta) ? args._meta : undefined;
  const idempotencyKey = nonEmptyString(meta?.idempotencyKey);
  if (idempotencyKey) {
    headers["Idempotency-Key"] = idempotencyKey;
  }
  return headers;
}

function sanitizeForwardedArgs(
  args: Record<string, unknown>,
): Record<string, unknown> {
  const clone: Record<string, unknown> = { ...args };
  if (isRecord(clone._meta)) {
    const metaClone: Record<string, unknown> = { ...clone._meta };
    delete metaClone.remoteFallback;
    clone._meta = metaClone;
  }
  return clone;
}

function normalizeRemotePayload(
  rawText: string,
  ok: boolean,
  status: number,
  correlationId: string,
): Record<string, unknown> {
  const parsed: unknown = rawText.trim() ? JSON.parse(rawText) : {};
  if (isRecord(parsed)) {
    return {
      ...parsed,
      correlationId:
        typeof parsed.correlationId === "string"
          ? parsed.correlationId
          : correlationId,
    };
  }
  return {
    errorCode: ok ? "INTERNAL" : "UPSTREAM",
    message: `Unexpected non-object response from remote MCP gateway (HTTP ${status})`,
    remediation:
      "Verify ALCHM_MCP_BACKEND_URL points to https://alchm.kitchen.",
    correlationId,
  };
}

/**
 * Proxies a validated tool call over HTTP to `${remoteBackendUrl}/api/mcp/rest/${toolName}`.
 */
export async function invokeRemoteStdioFallback(
  toolName: string,
  args: Record<string, unknown>,
  options: RemoteFallbackOptions,
): Promise<RemoteFallbackResult> {
  const baseUrl = (
    nonEmptyString(options.remoteBackendUrl) ?? DEFAULT_BACKEND_URL
  ).replace(/\/+$/, "");
  const url = `${baseUrl}/api/mcp/rest/${encodeURIComponent(toolName)}`;
  const apiKey = extractStdioApiKey(args);
  // The key is not sent anywhere it could be read or redirected, nor in a form the route cannot read.
  const refusal = apiKey ? keyRefusal(apiKey, url, options.correlationId) : null;
  if (refusal) return refusal;
  // A request that carries the key never follows a redirect.
  const redirect: RequestRedirect = "error";
  const body = JSON.stringify(sanitizeForwardedArgs(args));

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: buildRemoteHeaders(args, apiKey, options.correlationId),
      body,
      ...(apiKey ? { redirect } : {}),
      ...(options.signal ? { signal: options.signal } : {}),
    });
    const rawText = await res.text();
    const payload = normalizeRemotePayload(
      rawText,
      res.ok,
      res.status,
      options.correlationId,
    );
    return { ok: res.ok, payload };
  } catch (err) {
    return networkFailureResult(
      err,
      { url, baseUrl, keyed: apiKey !== null },
      options.correlationId,
      options.signal,
    );
  }
}

function resolveResourceToolName(uri: string): string | null {
  if (uri === "alchm://account/allowance" || uri === "mcp://user/allowance") {
    return "get_user_allowance";
  }
  if (
    uri === "alchm://account/culinary-profile" ||
    uri === "mcp://user/culinary-profile"
  ) {
    return "update_culinary_profile";
  }
  return null;
}

export async function tryReadRemoteStdioResource(
  uri: string,
  remoteBackendUrl?: string,
): Promise<{
  contents: Array<{ uri: string; mimeType: string; text: string }>;
} | null> {
  const toolName = resolveResourceToolName(uri);
  if (
    !toolName ||
    !shouldProxyStdioToolToRemote(toolName, {}, remoteBackendUrl)
  ) {
    return null;
  }
  const res = await invokeRemoteStdioFallback(
    toolName,
    {},
    {
      ...(remoteBackendUrl ? { remoteBackendUrl } : {}),
      correlationId: `mcp:resource:${toolName}`,
    },
  );
  // A refusal is shown as the content: read as anonymous data, it would hide why the key was not used.
  if (!res.ok && !res.refused) return null;
  const payload =
    res.ok &&
    toolName === "update_culinary_profile" &&
    isRecord(res.payload.profile)
      ? { authenticated: true, ...res.payload.profile }
      : res.payload;
  return {
    contents: [
      {
        uri,
        mimeType: "application/json",
        text: JSON.stringify(payload, null, 2),
      },
    ],
  };
}
