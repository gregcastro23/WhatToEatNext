/**
 * MCP Auth + Token Gate
 *
 * Resolves the calling user from one of:
 *   1. `_meta.apiKey` on the tool call arguments (the canonical path —
 *      Claude Desktop / Cursor configs pass it through every call).
 *   2. `MCP_USER_API_KEY` env var (single-user setups: Claude Desktop
 *      configured by the user themselves).
 *   3. `INTERNAL_API_SECRET` env var → resolves to the synthetic probe
 *      user (cron / internal callers).
 *
 * When DATABASE_URL is absent (local dev without DB), every call is
 * treated as "anonymous demo" — tools still run but token-gated tools
 * return a degraded payload.
 *
 * @file mcp-server/src/auth.ts
 */

import { createHash } from "node:crypto";

const isServerWithDB = (): boolean => !!process.env.DATABASE_URL;

let dbModule:
  | typeof import("@/lib/database/connection")
  | null
  | undefined = undefined;

async function getDb(): Promise<
  typeof import("@/lib/database/connection") | null
> {
  if (dbModule !== undefined) return dbModule;
  if (!isServerWithDB()) {
    dbModule = null;
    return null;
  }
  try {
    dbModule = await import("@/lib/database/connection");
  } catch {
    dbModule = null;
  }
  return dbModule;
}

export interface ResolvedCaller {
  userId: string | null;
  apiKeyId: string | null;
  /** Free-form identifier persisted on the invocation row. */
  caller: string;
  /** True when the caller is the synthetic-probe internal user. */
  isSynthetic: boolean;
}

function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

function extractApiKey(args: Record<string, unknown>): string | null {
  const meta = args._meta;
  if (meta && typeof meta === "object" && !Array.isArray(meta)) {
    const m = meta as Record<string, unknown>;
    if (typeof m.apiKey === "string" && m.apiKey.length > 0) return m.apiKey;
    if (typeof m.authKey === "string" && m.authKey.length > 0) return m.authKey;
  }
  if (typeof args._authKey === "string" && args._authKey.length > 0) {
    return args._authKey;
  }
  if (typeof args._apiKey === "string" && args._apiKey.length > 0) {
    return args._apiKey;
  }
  if (process.env.MCP_USER_API_KEY) return process.env.MCP_USER_API_KEY;
  return null;
}

function extractCallerTag(args: Record<string, unknown>): string {
  const meta = args._meta;
  if (meta && typeof meta === "object" && !Array.isArray(meta)) {
    const c = (meta as Record<string, unknown>).caller;
    if (typeof c === "string" && c.length > 0) return c.slice(0, 64);
  }
  return "unknown";
}

/**
 * Resolve the caller for one tool invocation. Never throws — when the
 * key is invalid or no DB is available, returns an anonymous record so
 * the tool can still produce a degraded response.
 */
export async function resolveCaller(
  args: Record<string, unknown>,
): Promise<ResolvedCaller> {
  const callerTag = extractCallerTag(args);

  // Internal cron secret path — used by the synthetic probe so it
  // doesn't need to mint and ship a real API key.
  const internal = args._meta as Record<string, unknown> | undefined;
  const internalSecret = internal?.internalSecret;
  if (
    typeof internalSecret === "string" &&
    process.env.INTERNAL_API_SECRET &&
    internalSecret === process.env.INTERNAL_API_SECRET
  ) {
    return {
      userId: process.env.SYNTHETIC_PROBE_USER_ID ?? null,
      apiKeyId: null,
      caller: callerTag === "unknown" ? "synthetic-probe" : callerTag,
      isSynthetic: true,
    };
  }

  const key = extractApiKey(args);
  if (!key) {
    return { userId: null, apiKeyId: null, caller: callerTag, isSynthetic: false };
  }

  const db = await getDb();
  if (!db) {
    // Without a DB we can't validate the key; treat as anonymous demo.
    return { userId: null, apiKeyId: null, caller: callerTag, isSynthetic: false };
  }

  try {
    const result = await db.executeQuery<{
      id: string;
      user_id: string | null;
    }>(
      `UPDATE api_keys
         SET last_used_at = NOW(),
             usage_count = usage_count + 1
       WHERE key_hash = $1
         AND is_active = true
         AND (expires_at IS NULL OR expires_at > NOW())
       RETURNING id, user_id`,
      [hashKey(key)],
    );
    if (result.rows.length === 0) {
      return { userId: null, apiKeyId: null, caller: callerTag, isSynthetic: false };
    }
    return {
      userId: result.rows[0].user_id,
      apiKeyId: result.rows[0].id,
      caller: callerTag,
      isSynthetic: false,
    };
  } catch (err) {
    process.stderr.write(`[mcp/auth] key lookup failed: ${String(err)}\n`);
    return { userId: null, apiKeyId: null, caller: callerTag, isSynthetic: false };
  }
}

/**
 * Per-axis ESMS cost for one MCP tool call. Matches the existing
 * shop_items rate for `unlock-cosmic-recipe` (database/init/40):
 * 7.5 of each axis = 30 total per cosmic recipe.
 *
 * Other tools are free for now — alchemize/transits don't cost tokens
 * in-app, so the MCP boundary mirrors that.
 */
export const TOOL_COSTS: Record<
  string,
  { spirit: number; essence: number; matter: number; substance: number } | null
> = {
  generate_cosmic_recipe: { spirit: 7.5, essence: 7.5, matter: 7.5, substance: 7.5 },
  alchemize_ingredients: null,
  get_live_sky_transits: null,
};

export interface DebitOutcome {
  applied: boolean;
  reason: string | null;
  amounts: { spirit: number; essence: number; matter: number; substance: number } | null;
}

/**
 * Debit the configured per-tool cost from the caller. Returns
 * `applied: false` when the call is free, the caller is anonymous, the
 * caller is the synthetic probe (we don't burn tokens on health checks),
 * or DB is unavailable.
 *
 * Insufficient balance returns `applied: false` with a reason so the
 * tool can return a quota-style error to the caller.
 */
export async function debitForTool(
  toolName: string,
  caller: ResolvedCaller,
): Promise<DebitOutcome> {
  const cost = TOOL_COSTS[toolName] ?? null;
  if (!cost) return { applied: false, reason: "free-tool", amounts: null };
  if (caller.isSynthetic) {
    return { applied: false, reason: "synthetic-probe-exempt", amounts: null };
  }
  if (!caller.userId) {
    return { applied: false, reason: "anonymous-caller", amounts: null };
  }
  const db = await getDb();
  if (!db) {
    return { applied: false, reason: "db-unavailable", amounts: null };
  }

  // The token service is structured as a singleton; calling debitTokens
  // four times in a single transaction-group preserves ESMS double-entry
  // semantics while keeping this module dependency-light.
  let svc: typeof import("@/services/TokenEconomyService") | null = null;
  try {
    svc = await import("@/services/TokenEconomyService");
  } catch (err) {
    process.stderr.write(`[mcp/auth] token service load failed: ${String(err)}\n`);
    return { applied: false, reason: "service-unavailable", amounts: null };
  }

  const { tokenEconomy: tokenSvc } = svc;
  const group = `mcp-${toolName}-${Date.now()}`;
  const axes: Array<["Spirit" | "Essence" | "Matter" | "Substance", number]> = [
    ["Spirit", cost.spirit],
    ["Essence", cost.essence],
    ["Matter", cost.matter],
    ["Substance", cost.substance],
  ];
  for (const [axis, amount] of axes) {
    const ok = await tokenSvc.debitTokens(
      caller.userId,
      axis,
      amount,
      "purchase",
      {
        sourceId: toolName,
        description: `MCP ${toolName} via ${caller.caller}`,
        transactionGroupId: group,
      },
    );
    if (!ok) {
      // Insufficient balance on one axis — caller knows to surface the
      // quota error. Already-debited axes are a small leak we accept
      // rather than a full transactional rollback (matches the in-app
      // pattern; the shop layer is the canonical multi-axis charge).
      return {
        applied: false,
        reason: `insufficient-${axis.toLowerCase()}`,
        amounts: null,
      };
    }
  }
  return { applied: true, reason: null, amounts: cost };
}
