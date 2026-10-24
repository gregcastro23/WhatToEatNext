/**
 * MCP Auth + Token Gate
 *
 * Resolves the calling user from one of:
 *   1. `_meta.apiKey` on the tool call arguments (the canonical path —
 *      Claude Desktop / Cursor configs pass it through every call).
 *   2. `MCP_USER_API_KEY` or `ALCHM_MCP_USER_API_KEY` env var.
 *   3. An explicit `_meta.internalSecret` matching `INTERNAL_API_SECRET`
 *      resolves to the synthetic probe user (cron / internal callers).
 *
 * Without DATABASE_URL, credential-free reads use anonymous demo mode.
 * Explicit credentials cannot be verified and fail closed; writes require
 * an authenticated owner and settled payment.
 *
 * @file mcp-server/src/auth.ts
 */

import { createHash } from "node:crypto";
import { safeEqual } from "@/lib/hooks/secureCompare";
import { TOOL_COSTS, isToolName, type EsmsCost } from "./catalog";
import type { PoolClient } from "pg";

const isServerWithDB = (): boolean => !!process.env.DATABASE_URL;

let dbModule: typeof import("@/lib/database/connection") | null | undefined =
  undefined;

async function getDb(): Promise<
  typeof import("@/lib/database/connection") | null
> {
  if (!isServerWithDB()) return null;
  if (dbModule !== undefined) return dbModule;
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
  /**
   * `api_keys.rate_limit_tier` value for the key that authenticated this
   * call. Null when no key was used (anonymous, synthetic, or DB
   * unavailable). Drives the per-key RPM cap via `rpmForTier()`.
   */
  rateLimitTier: string | null;
  authError?: "INVALID_KEY" | "UNAVAILABLE";
}

function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function extractApiKey(args: Record<string, unknown>): string | null {
  const meta = args._meta;
  if (isRecord(meta)) {
    const m = meta;
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
  if (process.env.ALCHM_MCP_USER_API_KEY)
    return process.env.ALCHM_MCP_USER_API_KEY;
  return null;
}

function extractCallerTag(args: Record<string, unknown>): string {
  const meta = args._meta;
  if (isRecord(meta)) {
    const c = meta.caller;
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
  const internal = isRecord(args._meta) ? args._meta : undefined;
  const internalSecret =
    typeof internal?.internalSecret === "string"
      ? internal.internalSecret
      : undefined;
  if (safeEqual(internalSecret, process.env.INTERNAL_API_SECRET)) {
    return {
      userId: process.env.SYNTHETIC_PROBE_USER_ID ?? null,
      apiKeyId: null,
      caller: callerTag === "unknown" ? "synthetic-probe" : callerTag,
      isSynthetic: true,
      rateLimitTier: null,
    };
  }

  const key = extractApiKey(args);
  if (!key) {
    return {
      userId: null,
      apiKeyId: null,
      caller: callerTag,
      isSynthetic: false,
      rateLimitTier: null,
    };
  }

  const db = await getDb();
  if (!db) {
    // Explicit credentials must never silently downgrade to anonymous access.
    return {
      userId: null,
      apiKeyId: null,
      caller: callerTag,
      isSynthetic: false,
      rateLimitTier: null,
      authError: "UNAVAILABLE",
    };
  }

  try {
    const result = await db.executeQuery<{
      id: string;
      user_id: string | null;
      rate_limit_tier: string | null;
    }>(
      `UPDATE api_keys
         SET last_used_at = NOW(),
             usage_count = usage_count + 1
       WHERE key_hash = $1
         AND is_active = true
         AND (expires_at IS NULL OR expires_at > NOW())
       RETURNING id, user_id, rate_limit_tier`,
      [hashKey(key)],
    );
    const [keyRow] = result.rows;
    if (!keyRow) {
      return {
        userId: null,
        apiKeyId: null,
        caller: callerTag,
        isSynthetic: false,
        rateLimitTier: null,
        authError: "INVALID_KEY",
      };
    }
    return {
      userId: keyRow.user_id,
      apiKeyId: keyRow.id,
      caller: callerTag,
      isSynthetic: false,
      rateLimitTier: keyRow.rate_limit_tier ?? null,
    };
  } catch (err) {
    process.stderr.write(`[mcp/auth] key lookup failed: ${String(err)}\n`);
    return {
      userId: null,
      apiKeyId: null,
      caller: callerTag,
      isSynthetic: false,
      rateLimitTier: null,
      authError: "UNAVAILABLE",
    };
  }
}

/** Per-tool ESMS prices live in the shared catalog alongside each tool's contract. */
export { TOOL_COSTS } from "./catalog";

export interface DebitOutcome {
  /** True once payment for this request is settled, now or by a replayed original. */
  applied: boolean;
  reason: string | null;
  /** Amounts debited by THIS invocation; null when free, exempt or replayed. */
  amounts: EsmsCost | null;
  /** An earlier call with the same idempotency key and arguments already paid. */
  replayed?: boolean;
  /** Scoped ledger key derived from the caller's idempotency key. */
  ledgerKey?: string;
}

/** What makes one paid request distinguishable from another. */
export interface PaymentRequest {
  /** The caller's `_meta.idempotencyKey`; null charges every call. */
  idempotencyKey: string | null;
  /** `requestFingerprint()` of the call's arguments. */
  fingerprint: string;
}

const UNKEYED_REQUEST: PaymentRequest = { idempotencyKey: null, fingerprint: "" };

const LEDGER_AXES = ["Spirit", "Essence", "Matter", "Substance"] as const;

/** Transport-only fields: credentials and correlation never change what a call buys. */
const NON_SEMANTIC_ARGUMENTS = new Set(["_meta", "_authKey", "_apiKey"]);

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item: unknown) => canonicalJson(item ?? null)).join(",")}]`;
  }
  if (isRecord(value)) {
    const entries = Object.entries(value)
      .filter(([, item]) => item !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([key, item]) => `${JSON.stringify(key)}:${canonicalJson(item)}`);
    return `{${entries.join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

/** Order-independent hash of the arguments that determine what a call buys. */
export function requestFingerprint(
  toolName: string,
  args: Record<string, unknown>,
): string {
  const semantic = Object.fromEntries(
    Object.entries(args).filter(([key]) => !NON_SEMANTIC_ARGUMENTS.has(key)),
  );
  return createHash("sha256")
    .update(`${toolName}\n${canonicalJson(semantic)}`)
    .digest("hex")
    .slice(0, 32);
}

/**
 * The ledger key for one caller's idempotency key. Scoped to the paying
 * account and tool, so one caller's key can never replay another's payment,
 * and hashed so the stored key is fixed-length and free of the `%`/`_`
 * wildcards the ledger's `LIKE '<key>:%'` probe would otherwise honor.
 */
export function idempotencyLedgerKey(
  userId: string,
  toolName: string,
  idempotencyKey: string,
): string {
  const digest = createHash("sha256")
    .update(`mcp-idempotency:v1\0${userId}\0${toolName}\0${idempotencyKey}`)
    .digest("hex");
  return `mcp:${digest.slice(0, 48)}`;
}

/** Keyed ledger rows record which request paid, so a reused key can be told apart. */
function ledgerSourceId(toolName: string, request: PaymentRequest): string {
  return request.idempotencyKey ? `${toolName}#${request.fingerprint}` : toolName;
}

class PaymentRefused extends Error {
  constructor(readonly reason: string) {
    super("MCP payment refused");
  }
}

type DbModule = typeof import("@/lib/database/connection");

/**
 * Serialize retries of one key, then decide from the ledger whether this
 * request already paid. Returns true for a replay of the same request.
 */
async function priorSettlement(
  db: DbModule,
  client: PoolClient,
  ledgerKey: string,
  sourceId: string,
): Promise<boolean> {
  // Transaction-scoped, so it is safe behind a transaction-mode pooler; a
  // concurrent retry waits here until the first attempt commits or rolls back.
  await db.executeQuery(
    "SELECT pg_advisory_xact_lock(hashtextextended($1, 0))",
    [ledgerKey],
    { client },
  );
  const prior = await db.executeQuery<{ source_id: string | null }>(
    `SELECT source_id
       FROM token_transactions
      WHERE idempotency_key = ANY($1::text[])
      LIMIT 1`,
    [LEDGER_AXES.map((axis) => `${ledgerKey}:${axis}`)],
    { client },
  );
  const [row] = prior.rows;
  if (!row) return false;
  if (row.source_id !== sourceId) throw new PaymentRefused("idempotency-conflict");
  return true;
}

/**
 * Debit the configured per-tool cost from the caller. Returns
 * `applied: false` when the call is free, the caller is anonymous, the
 * caller is the synthetic probe (we don't burn tokens on health checks),
 * or DB is unavailable.
 *
 * Insufficient balance returns `applied: false` with a reason so the
 * tool can return a quota-style error to the caller.
 *
 * With `client`, settlement joins the caller's transaction so a paid write
 * and its debit commit together; a refusal leaves that transaction for the
 * caller to roll back. Without it, settlement runs in its own transaction.
 */
export async function debitForTool(
  toolName: string,
  caller: ResolvedCaller,
  request: PaymentRequest = UNKEYED_REQUEST,
  client?: PoolClient,
): Promise<DebitOutcome> {
  const cost = isToolName(toolName) ? TOOL_COSTS[toolName] : null;
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

  // Reuse the culinary action service inside an actual transaction: the four
  // ledger debits and any Swapping Bridge legs either commit together or roll back.
  const { agentEconomyActionService } =
    await import("@/services/agentEconomyActionService");
  const { userId } = caller;
  const ledgerKey = request.idempotencyKey
    ? idempotencyLedgerKey(userId, toolName, request.idempotencyKey)
    : null;
  const sourceId = ledgerSourceId(toolName, request);
  const settle = async (tx: PoolClient): Promise<boolean> => {
    if (ledgerKey && (await priorSettlement(db, tx, ledgerKey, sourceId)))
      return true;
    const debit = await agentEconomyActionService.debitActionInTx({
      userId,
      costs: cost,
      sourceType:
        toolName === "submit_recipe_reflection"
          ? "recipe_reflection"
          : "purchase",
      sourceId,
      description: `MCP ${toolName} via ${caller.caller}`,
      ...(ledgerKey ? { idempotencyKey: ledgerKey } : {}),
      autoSwap: true,
      client: tx,
    });
    if (debit.success && debit.receipt.deduplicated === true) return true;
    if (!debit.success || !debit.receipt.charged) {
      // Throw even if the service caught a ledger error so withTransaction
      // cannot commit earlier swap legs or balance updates on a refusal.
      throw new PaymentRefused(
        !debit.success && debit.reason === "insufficient_funds"
          ? "insufficient-funds"
          : "debit-failed",
      );
    }
    return false;
  };
  try {
    const replayed = client
      ? await settle(client)
      : await db.withTransaction(settle);
    return {
      applied: true,
      reason: null,
      amounts: replayed ? null : cost,
      ...(replayed ? { replayed: true } : {}),
      ...(ledgerKey ? { ledgerKey } : {}),
    };
  } catch (error) {
    return {
      applied: false,
      reason: error instanceof PaymentRefused ? error.reason : "debit-failed",
      amounts: null,
    };
  }
}
