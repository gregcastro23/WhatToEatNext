/**
 * MCP ESMS settlement
 *
 * Debits a paid tool's catalog price from an authenticated caller through the
 * culinary action service, inside a database transaction, so the four ledger
 * debits and any Swapping Bridge legs commit together or roll back.
 *
 * A caller may supply `_meta.idempotencyKey`. It becomes a ledger key scoped
 * to the paying account and tool; the ledger row's `source_id` records which
 * request paid (`<tool>#<fingerprint of its arguments>`). A retry of the same
 * request replays without debiting for IDEMPOTENCY_REPLAY_HOURS; reusing a key
 * for a different request, or after that window, is refused. Concurrent
 * retries of one key are serialized by an advisory lock.
 *
 * @file src/lib/mcp/billing.ts
 */

import { createHash } from "node:crypto";
import { TOOL_COSTS, isToolName, type EsmsCost } from "./catalog";
import type { ResolvedCaller } from "./auth";
import type { PoolClient } from "pg";

const isServerWithDB = (): boolean => !!process.env.DATABASE_URL;

type DbModule = typeof import("@/lib/database/connection");

let dbModule: DbModule | null | undefined = undefined;

async function getDb(): Promise<DbModule | null> {
  if (!isServerWithDB()) return null;
  if (dbModule !== undefined) return dbModule;
  try {
    dbModule = await import("@/lib/database/connection");
  } catch {
    dbModule = null;
  }
  return dbModule;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

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

export const UNKEYED_PAYMENT: PaymentRequest = {
  idempotencyKey: null,
  fingerprint: "",
};

const LEDGER_AXES = ["Spirit", "Essence", "Matter", "Substance"] as const;

/**
 * How long a settlement can be replayed. Retries happen within minutes; a
 * key reused after this is refused rather than buying fresh results forever.
 */
export const IDEMPOTENCY_REPLAY_HOURS = 24;

/** Transport-only fields: credentials and correlation never change what a call buys. */
const NON_SEMANTIC_ARGUMENTS = new Set(["_meta", "_authKey", "_apiKey"]);

/** JSON with sorted keys; callers pass parsed JSON, which has no bare undefined. */
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
  return JSON.stringify(value);
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
 * wildcards a `LIKE '<key>:%'` ledger probe would otherwise honor.
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

class PaymentRefused extends Error {
  constructor(readonly reason: string) {
    super("MCP payment refused");
  }
}

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
  const prior = await db.executeQuery<{
    source_id: string | null;
    expired: boolean;
  }>(
    `SELECT source_id,
            created_at < now() - make_interval(hours => $2::int) AS expired
       FROM token_transactions
      WHERE idempotency_key = ANY($1::text[])
      LIMIT 1`,
    [LEDGER_AXES.map((axis) => `${ledgerKey}:${axis}`), IDEMPOTENCY_REPLAY_HOURS],
    { client },
  );
  const [row] = prior.rows;
  if (!row) return false;
  if (row.source_id !== sourceId) throw new PaymentRefused("idempotency-conflict");
  if (row.expired) throw new PaymentRefused("idempotency-expired");
  return true;
}

interface Settlement {
  toolName: string;
  caller: ResolvedCaller & { userId: string };
  cost: EsmsCost;
  ledgerKey: string | null;
  /** Keyed rows record which request paid, so a reused key can be told apart. */
  sourceId: string;
}

/** One settlement inside `tx`; true when an earlier call already paid. */
async function settle(
  db: DbModule,
  tx: PoolClient,
  { toolName, caller, cost, ledgerKey, sourceId }: Settlement,
): Promise<boolean> {
  if (ledgerKey && (await priorSettlement(db, tx, ledgerKey, sourceId)))
    return true;
  const { agentEconomyActionService } =
    await import("@/services/agentEconomyActionService");
  const debit = await agentEconomyActionService.debitActionInTx({
    userId: caller.userId,
    costs: cost,
    sourceType:
      toolName === "submit_recipe_reflection" ? "recipe_reflection" : "purchase",
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
  request: PaymentRequest = UNKEYED_PAYMENT,
  client?: PoolClient,
): Promise<DebitOutcome> {
  const cost = isToolName(toolName) ? TOOL_COSTS[toolName] : null;
  if (!cost) return { applied: false, reason: "free-tool", amounts: null };
  if (caller.isSynthetic) {
    return { applied: false, reason: "synthetic-probe-exempt", amounts: null };
  }
  const { userId } = caller;
  if (!userId) {
    return { applied: false, reason: "anonymous-caller", amounts: null };
  }
  const db = await getDb();
  if (!db) {
    return { applied: false, reason: "db-unavailable", amounts: null };
  }
  const ledgerKey = request.idempotencyKey
    ? idempotencyLedgerKey(userId, toolName, request.idempotencyKey)
    : null;
  const settlement: Settlement = {
    toolName,
    caller: { ...caller, userId },
    cost,
    ledgerKey,
    sourceId: ledgerKey ? `${toolName}#${request.fingerprint}` : toolName,
  };
  try {
    const replayed = client
      ? await settle(db, client, settlement)
      : await db.withTransaction((tx) => settle(db, tx, settlement));
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
