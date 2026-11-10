/**
 * Phase 45 Follow-Through — Durable Cosmic Generation Operations.
 *
 * PostgreSQL-backed `(user_id, operation_key)` durability (`cosmic_generation_operations`),
 * 90-second stale-lock recovery threshold, request fingerprint isolation,
 * and automatic token refund reconciliation on generation failure.
 */
import { createHash } from "node:crypto";
import { z } from "zod";
import { executeQuery } from "@/lib/database";
import { _logger } from "@/lib/logger";
import { tokenEconomy } from "@/services/TokenEconomyService";
import type { TokenType } from "@/types/economy";

export const COSMIC_GENERATION_STALE_LOCK_SECONDS = 90;

export const CosmicOperationStatusSchema = z.enum(["claimed", "debited", "generating", "completed", "refund_pending", "refunded", "failed"]);

export type CosmicOperationStatus = z.infer<typeof CosmicOperationStatusSchema>;

export interface CosmicGenerationOperationRow {
  operationKey: string;
  userId: string;
  status: CosmicOperationStatus;
  requestFingerprint: string;
  recipeId: string | null;
  debitTxId: string | null;
  refundTxId: string | null;
  errorMessage: string | null;
  responsePayload: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

export type ClaimOperationResult =
  | { outcome: "claimed"; operation: CosmicGenerationOperationRow; recoveredStaleLock: boolean }
  | { outcome: "replayed"; operation: CosmicGenerationOperationRow }
  | { outcome: "in_progress"; operation: CosmicGenerationOperationRow }
  | { outcome: "fingerprint_mismatch"; operation: CosmicGenerationOperationRow };

interface DbOperationRow {
  operation_key: string;
  user_id: string;
  status: string;
  request_fingerprint: string;
  recipe_id: string | null;
  debit_tx_id: string | null;
  refund_tx_id: string | null;
  error_message: string | null;
  response_payload: unknown;
  created_at: Date | string;
  updated_at: Date | string;
  expires_at: Date | string;
  recovered_stale?: boolean;
}

function toIso(value?: Date | string): string {
  if (!value) return new Date().toISOString();
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function mapDbRow(row: DbOperationRow): CosmicGenerationOperationRow {
  const statusParsed = CosmicOperationStatusSchema.safeParse(row.status);
  const payloadParsed = z.record(z.string(), z.unknown()).safeParse(row.response_payload);
  return {
    operationKey: row.operation_key,
    userId: row.user_id,
    status: statusParsed.success ? statusParsed.data : "claimed",
    requestFingerprint: row.request_fingerprint,
    recipeId: row.recipe_id ?? null,
    debitTxId: row.debit_tx_id ?? null,
    refundTxId: row.refund_tx_id ?? null,
    errorMessage: row.error_message ?? null,
    responsePayload: payloadParsed.success ? payloadParsed.data : null,
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
    expiresAt: toIso(row.expires_at),
  };
}

/** Compute a deterministic SHA-256 fingerprint over normalized generation inputs. */
export function computeCosmicRequestFingerprint(input: {
  prompt?: string;
  diet?: string;
  preferredCuisine?: string;
  ingredientsMain?: readonly string[];
  disallowedIngredients?: readonly string[];
}): string {
  const canonical = {
    prompt: (input.prompt ?? "").trim(),
    diet: (input.diet ?? "omnivore").trim().toLowerCase(),
    preferredCuisine: (input.preferredCuisine ?? "").trim().toLowerCase(),
    ingredientsMain: [...(input.ingredientsMain ?? [])].map((s) => s.trim().toLowerCase()).sort(),
    disallowedIngredients: [...(input.disallowedIngredients ?? [])].map((s) => s.trim().toLowerCase()).sort(),
  };
  return createHash("sha256").update(JSON.stringify(canonical)).digest("hex");
}

async function resolveExistingOperation(
  existing: DbOperationRow,
  requestFingerprint: string,
  leaseSeconds: number,
): Promise<ClaimOperationResult> {
  const mapped = mapDbRow(existing);
  if (mapped.requestFingerprint !== requestFingerprint) {
    return { outcome: "fingerprint_mismatch", operation: mapped };
  }
  if (mapped.status === "completed") {
    return { outcome: "replayed", operation: mapped };
  }
  const isStale = existing.recovered_stale === true || new Date(mapped.expiresAt).getTime() <= Date.now();
  const isTerminalFailure = mapped.status === "refunded" || mapped.status === "failed";
  if (!isStale && !isTerminalFailure) {
    return { outcome: "in_progress", operation: mapped };
  }
  const updatedRes = await executeQuery<DbOperationRow>(
    `UPDATE cosmic_generation_operations
     SET status = 'claimed', error_message = NULL, updated_at = NOW(),
         expires_at = NOW() + ($3::int * INTERVAL '1 second')
     WHERE user_id = $1 AND operation_key = $2
     RETURNING operation_key, user_id, status, request_fingerprint, recipe_id,
               debit_tx_id, refund_tx_id, error_message, response_payload,
               created_at, updated_at, expires_at`,
    [mapped.userId, mapped.operationKey, leaseSeconds],
  );
  const [reclaimed] = updatedRes.rows;
  return {
    outcome: "claimed",
    operation: reclaimed ? mapDbRow(reclaimed) : mapped,
    recoveredStaleLock: isStale,
  };
}

function buildFallbackOperationRow(
  params: { userId: string; operationKey: string; requestFingerprint: string },
  leaseSeconds: number,
): CosmicGenerationOperationRow {
  const nowIso = new Date().toISOString();
  return {
    operationKey: params.operationKey,
    userId: params.userId,
    status: "claimed",
    requestFingerprint: params.requestFingerprint,
    recipeId: null,
    debitTxId: null,
    refundTxId: null,
    errorMessage: null,
    responsePayload: null,
    createdAt: nowIso,
    updatedAt: nowIso,
    expiresAt: new Date(Date.now() + leaseSeconds * 1000).toISOString(),
  };
}

/** Claim `(user_id, operation_key)` durability in PostgreSQL with a 90s stale-lock lease. */
export async function claimCosmicGenerationOperation(params: {
  userId: string;
  operationKey: string;
  requestFingerprint: string;
  staleLockSeconds?: number;
}): Promise<ClaimOperationResult> {
  const leaseSeconds = params.staleLockSeconds ?? COSMIC_GENERATION_STALE_LOCK_SECONDS;
  const existingRes = await executeQuery<DbOperationRow>(
    `SELECT operation_key, user_id, status, request_fingerprint, recipe_id,
            debit_tx_id, refund_tx_id, error_message, response_payload,
            created_at, updated_at, expires_at, (expires_at <= NOW()) AS recovered_stale
     FROM cosmic_generation_operations
     WHERE user_id = $1 AND operation_key = $2
     LIMIT 1`,
    [params.userId, params.operationKey],
  );
  const [existing] = existingRes.rows;
  if (existing && typeof existing.operation_key === "string") {
    return resolveExistingOperation(existing, params.requestFingerprint, leaseSeconds);
  }
  const insertRes = await executeQuery<DbOperationRow>(
    `INSERT INTO cosmic_generation_operations (
       operation_key, user_id, status, request_fingerprint, created_at, updated_at, expires_at
     )
     VALUES ($1, $2, 'claimed', $3, NOW(), NOW(), NOW() + ($4::int * INTERVAL '1 second'))
     ON CONFLICT (user_id, operation_key) DO UPDATE SET
       updated_at = cosmic_generation_operations.updated_at
     RETURNING operation_key, user_id, status, request_fingerprint, recipe_id,
               debit_tx_id, refund_tx_id, error_message, response_payload,
               created_at, updated_at, expires_at`,
    [params.operationKey, params.userId, params.requestFingerprint, leaseSeconds],
  );
  const [inserted] = insertRes.rows;
  const operation =
    inserted && typeof inserted.operation_key === "string"
      ? mapDbRow(inserted)
      : buildFallbackOperationRow(params, leaseSeconds);
  return { outcome: "claimed", operation, recoveredStaleLock: false };
}

/** Record the debit transaction group ID and transition status to `'generating'`. */
export async function recordCosmicOperationDebit(params: {
  userId: string;
  operationKey: string;
  debitTxId: string | null;
}): Promise<void> {
  try {
    await executeQuery(
      `UPDATE cosmic_generation_operations
       SET status = 'generating', debit_tx_id = COALESCE($3, debit_tx_id),
           updated_at = NOW(), expires_at = NOW() + ($4::int * INTERVAL '1 second')
       WHERE user_id = $1 AND operation_key = $2`,
      [params.userId, params.operationKey, params.debitTxId, COSMIC_GENERATION_STALE_LOCK_SECONDS],
    );
  } catch (err) {
    _logger.warn("[cosmic-ops] failed to record debit state:", err);
  }
}

/** Mark a durable cosmic generation operation as `'completed'`. */
export async function completeCosmicGenerationOperation(params: {
  userId: string;
  operationKey: string;
  recipeId: string;
  responsePayload?: Record<string, unknown>;
}): Promise<void> {
  try {
    await executeQuery(
      `UPDATE cosmic_generation_operations
       SET status = 'completed', recipe_id = $3, response_payload = $4::jsonb,
           error_message = NULL, updated_at = NOW()
       WHERE user_id = $1 AND operation_key = $2`,
      [
        params.userId,
        params.operationKey,
        params.recipeId,
        params.responsePayload ? JSON.stringify(params.responsePayload) : null,
      ],
    );
  } catch (err) {
    _logger.warn("[cosmic-ops] failed to mark operation completed:", err);
  }
}

/** Mark a durable cosmic generation operation as `'refunded'` or `'failed'`. */
export async function failCosmicGenerationOperation(params: {
  userId: string;
  operationKey: string;
  refunded: boolean;
  refundTxId: string | null;
  errorMessage: string;
}): Promise<void> {
  const nextStatus: CosmicOperationStatus = params.refunded ? "refunded" : "failed";
  try {
    await executeQuery(
      `UPDATE cosmic_generation_operations
       SET status = $3, refund_tx_id = COALESCE($4, refund_tx_id),
           error_message = $5, updated_at = NOW()
       WHERE user_id = $1 AND operation_key = $2`,
      [params.userId, params.operationKey, nextStatus, params.refundTxId, params.errorMessage.slice(0, 500)],
    );
  } catch (err) {
    _logger.warn("[cosmic-ops] failed to record failure state:", err);
  }
}

/** Refund Spirit (and optional companion ESMS axes) idempotently on generation failure. */
export async function refundSpirit(params: {
  userId: string;
  operationKey: string;
  debitTxId: string;
  amountSpirit: number;
  amountEssence?: number;
  amountMatter?: number;
  amountSubstance?: number;
}): Promise<{ refunded: boolean; refundTxId: string | null }> {
  const refundTxId = `cosmic_recipe_refund:${params.debitTxId}`;
  const rawCredits: Array<{ tokenType: TokenType; amount: number }> = [
    { tokenType: "Spirit", amount: params.amountSpirit },
    { tokenType: "Essence", amount: params.amountEssence ?? 0 },
    { tokenType: "Matter", amount: params.amountMatter ?? 0 },
    { tokenType: "Substance", amount: params.amountSubstance ?? 0 },
  ];
  const credits = rawCredits.filter((c) => c.amount > 0);
  if (credits.length === 0) return { refunded: false, refundTxId: null };
  const outcome = await tokenEconomy.creditMultipleTokensDetailed(
    params.userId,
    credits,
    "cosmic_recipe_refund",
    {
      sourceId: params.debitTxId,
      idempotencyKey: refundTxId,
      description: `Refund - cosmic generation operation ${params.operationKey}`,
    },
  );
  const refunded = outcome.status === "credited" || outcome.status === "replayed";
  return { refunded, refundTxId: refunded ? refundTxId : null };
}
