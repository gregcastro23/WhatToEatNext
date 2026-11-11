/**
 * Stale Cosmic Generation Operation Reconciler & Diagnostic Summary.
 *
 * Surfaces and settles stranded rows in `cosmic_generation_operations` whose
 * 90s lease has expired (`expires_at < NOW()`).
 *
 * Settlement never invents an amount: a debited row is refunded only with the
 * exact payment legs recorded under its `debit_tx_id` (= token_transactions
 * transaction_group_id, auto-swap `transmutation` legs excluded). A row whose
 * debit cannot be read is parked as `refund_pending` for manual review.
 */
import { executeQuery } from "@/lib/database";
import {
  CosmicOperationStatusSchema,
  failCosmicGenerationOperation,
  refundSpirit,
  type CosmicGenerationOperationRow,
} from "./cosmicGenerationOperations";

const OPEN_STATUSES = "('claimed', 'debited', 'generating', 'refund_pending')";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface AutomatedReconcileRunTelemetry {
  startedAt: string;
  status: "success" | "failure" | "timeout";
  scanned: number;
  refundedCount: number;
  failedCount: number;
  pendingCount: number;
}

interface SummaryTotalsRow {
  total: number | string | null;
  active_locks: number | string | null;
  expired_stranded: number | string | null;
  completed: number | string | null;
  refunded: number | string | null;
  failed: number | string | null;
  last_run_at?: Date | string | null;
  last_run_status?: string | null;
  last_run_payload?: Record<string, unknown> | null;
}

interface StrandedDbRow {
  operation_key: string;
  user_id: string;
  status: string;
  request_fingerprint: string;
  recipe_id: string | null;
  debit_tx_id: string | null;
  refund_tx_id: string | null;
  error_message: string | null;
  created_at: Date | string;
  updated_at: Date | string;
  expires_at: Date | string;
}

interface ClaimedDbRow {
  user_id: string;
  operation_key: string;
  previous_status: string;
  debit_tx_id: string | null;
  refund_tx_id: string | null;
}

interface DebitLegRow {
  token_type: string;
  amount: number | string;
}

type StrandedOperation = Omit<CosmicGenerationOperationRow, "responsePayload">;

export interface CosmicOperationsDiagnosticSummary {
  success: true;
  generatedAt: string;
  totals: {
    total: number;
    activeLocks: number;
    expiredStranded: number;
    completed: number;
    refunded: number;
    failed: number;
  };
  strandedOperations: StrandedOperation[];
  lastAutomatedRun: AutomatedReconcileRunTelemetry | null;
}

export interface ReconciledOperationOutcome {
  userId: string;
  operationKey: string;
  previousStatus: string;
  nextStatus: "refunded" | "failed" | "refund_pending";
  refunded: boolean;
  refundTxId: string | null;
}

export interface ReconcileCosmicOperationsResult {
  success: true;
  dryRun: boolean;
  scanned: number;
  outcomes: ReconciledOperationOutcome[];
}

let inMemoryLastAutomatedRun: AutomatedReconcileRunTelemetry | null = null;
/** Record latest automated cron run telemetry in memory alongside DB heartbeat. */
export function recordAutomatedCosmicReconcileRun(run: AutomatedReconcileRunTelemetry): void {
  inMemoryLastAutomatedRun = run;
}
function toIso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}
function toCount(value: unknown): number {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}
function clampLimit(limit: number | undefined): number {
  return Math.min(Math.max(1, Math.trunc(limit ?? 25)), 100);
}

function mapLastAutomatedRun(row?: SummaryTotalsRow): AutomatedReconcileRunTelemetry | null {
  if (!row?.last_run_at) return inMemoryLastAutomatedRun;
  const rawStatus = row.last_run_status;
  const status = rawStatus === "failure" || rawStatus === "timeout" ? rawStatus : "success";
  const payload = row.last_run_payload ?? {};
  return {
    startedAt: toIso(row.last_run_at),
    status,
    scanned: toCount(payload.scanned),
    refundedCount: toCount(payload.refundedCount),
    failedCount: toCount(payload.failedCount),
    pendingCount: toCount(payload.pendingCount),
  };
}

function mapStrandedRow(row: StrandedDbRow): StrandedOperation {
  const parsed = CosmicOperationStatusSchema.safeParse(row.status);
  return {
    operationKey: row.operation_key,
    userId: row.user_id,
    status: parsed.success ? parsed.data : "claimed",
    requestFingerprint: row.request_fingerprint,
    recipeId: row.recipe_id,
    debitTxId: row.debit_tx_id,
    refundTxId: row.refund_tx_id,
    errorMessage: row.error_message,
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
    expiresAt: toIso(row.expires_at),
  };
}

const STRANDED_SELECT = `SELECT operation_key, user_id, status, request_fingerprint, recipe_id,
        debit_tx_id, refund_tx_id, error_message, created_at, updated_at, expires_at
   FROM cosmic_generation_operations
  WHERE status IN ${OPEN_STATUSES} AND expires_at < NOW()
  ORDER BY expires_at ASC
  LIMIT $1`;

/** Inspect active and expired open rows in `cosmic_generation_operations`. */
export async function getCosmicOperationsSummary(
  limit?: number,
): Promise<CosmicOperationsDiagnosticSummary> {
  const [totalsRes, strandedRes] = await Promise.all([
    executeQuery<SummaryTotalsRow>(
      `SELECT COUNT(*)::int AS total,
              COUNT(*) FILTER (WHERE status IN ${OPEN_STATUSES} AND expires_at >= NOW())::int AS active_locks,
              COUNT(*) FILTER (WHERE status IN ${OPEN_STATUSES} AND expires_at < NOW())::int AS expired_stranded,
              COUNT(*) FILTER (WHERE status = 'completed')::int AS completed,
              COUNT(*) FILTER (WHERE status = 'refunded')::int AS refunded,
              COUNT(*) FILTER (WHERE status = 'failed')::int AS failed,
              (SELECT started_at FROM synthetic_probe_results WHERE probe_name = 'cron:reconcile-cosmic-operations' ORDER BY started_at DESC LIMIT 1) AS last_run_at,
              (SELECT status FROM synthetic_probe_results WHERE probe_name = 'cron:reconcile-cosmic-operations' ORDER BY started_at DESC LIMIT 1) AS last_run_status,
              (SELECT response_payload FROM synthetic_probe_results WHERE probe_name = 'cron:reconcile-cosmic-operations' ORDER BY started_at DESC LIMIT 1) AS last_run_payload
         FROM cosmic_generation_operations`,
    ),
    executeQuery<StrandedDbRow>(STRANDED_SELECT, [clampLimit(limit)]),
  ]);
  const [row] = totalsRes.rows;
  return {
    success: true,
    generatedAt: new Date().toISOString(),
    totals: {
      total: toCount(row?.total),
      activeLocks: toCount(row?.active_locks),
      expiredStranded: toCount(row?.expired_stranded),
      completed: toCount(row?.completed),
      refunded: toCount(row?.refunded),
      failed: toCount(row?.failed),
    },
    strandedOperations: strandedRes.rows.map(mapStrandedRow),
    lastAutomatedRun: mapLastAutomatedRun(row),
  };
}

/** Atomically move expired open rows out of the lease window before settling. */
async function claimStrandedRows(limit: number): Promise<ClaimedDbRow[]> {
  const result = await executeQuery<ClaimedDbRow>(
    `WITH stranded AS (
       SELECT user_id, operation_key, status AS previous_status
         FROM cosmic_generation_operations
        WHERE status IN ${OPEN_STATUSES} AND expires_at < NOW()
        ORDER BY expires_at ASC
        LIMIT $1
        FOR UPDATE SKIP LOCKED
     )
     UPDATE cosmic_generation_operations c
        SET status = CASE WHEN c.debit_tx_id IS NULL THEN 'failed' ELSE 'refund_pending' END,
            error_message = CASE WHEN c.debit_tx_id IS NULL
              THEN 'Expired lease settled by reconciler; no debit was recorded.'
              ELSE 'Expired lease awaiting refund settlement by reconciler.' END,
            updated_at = NOW()
       FROM stranded s
      WHERE c.user_id = s.user_id AND c.operation_key = s.operation_key
      RETURNING c.user_id, c.operation_key, s.previous_status, c.debit_tx_id, c.refund_tx_id`,
    [limit],
  );
  return result.rows;
}

/** Read the exact payment debit legs of a group; null when they cannot be proven. */
async function readDebitLegs(
  userId: string,
  debitTxId: string,
): Promise<Record<"Spirit" | "Essence" | "Matter" | "Substance", number> | null> {
  if (!UUID_PATTERN.test(debitTxId) || !UUID_PATTERN.test(userId)) return null;
  const result = await executeQuery<DebitLegRow>(
    `SELECT token_type, (-SUM(amount))::float8 AS amount
       FROM token_transactions
      WHERE transaction_group_id = $1::uuid AND user_id = $2::uuid
        AND amount < 0 AND source_type <> 'transmutation'
      GROUP BY token_type`,
    [debitTxId, userId],
  );
  const legs = { Spirit: 0, Essence: 0, Matter: 0, Substance: 0 };
  for (const row of result.rows) {
    const amount = Number(row.amount);
    if (!Number.isFinite(amount) || amount <= 0) continue;
    if (row.token_type === "Spirit") legs.Spirit = amount;
    else if (row.token_type === "Essence") legs.Essence = amount;
    else if (row.token_type === "Matter") legs.Matter = amount;
    else if (row.token_type === "Substance") legs.Substance = amount;
  }
  return Object.values(legs).some((v) => v > 0) ? legs : null;
}

async function settleClaimedRow(row: ClaimedDbRow): Promise<ReconciledOperationOutcome> {
  const base = { userId: row.user_id, operationKey: row.operation_key, previousStatus: row.previous_status };
  if (!row.debit_tx_id) return { ...base, nextStatus: "failed", refunded: false, refundTxId: null };
  let refundTxId = row.refund_tx_id;
  if (!refundTxId) {
    const legs = await readDebitLegs(row.user_id, row.debit_tx_id);
    if (!legs) return { ...base, nextStatus: "refund_pending", refunded: false, refundTxId: null };
    const outcome = await refundSpirit({
      userId: row.user_id, operationKey: row.operation_key, debitTxId: row.debit_tx_id,
      amountSpirit: legs.Spirit, amountEssence: legs.Essence, amountMatter: legs.Matter, amountSubstance: legs.Substance,
    });
    if (!outcome.refunded) return { ...base, nextStatus: "refund_pending", refunded: false, refundTxId: null };
    ({ refundTxId } = outcome);
  }
  await failCosmicGenerationOperation({
    userId: row.user_id,
    operationKey: row.operation_key,
    refunded: true,
    refundTxId,
    errorMessage: "Expired lease refunded by reconciler (90s lease exceeded).",
  });
  return { ...base, nextStatus: "refunded", refunded: true, refundTxId };
}

/** Sweep and settle expired open rows in `cosmic_generation_operations`. */
export async function reconcileExpiredCosmicOperations(options?: {
  limit?: number;
  dryRun?: boolean;
}): Promise<ReconcileCosmicOperationsResult> {
  const limit = clampLimit(options?.limit);
  if (options?.dryRun === true) {
    const preview = await executeQuery<StrandedDbRow>(STRANDED_SELECT, [limit]);
    return {
      success: true,
      dryRun: true,
      scanned: preview.rows.length,
      outcomes: preview.rows.map((row) => ({
        userId: row.user_id,
        operationKey: row.operation_key,
        previousStatus: row.status,
        nextStatus: row.debit_tx_id ? "refund_pending" : "failed",
        refunded: false,
        refundTxId: row.refund_tx_id,
      })),
    };
  }
  const claimed = await claimStrandedRows(limit);
  const outcomes: ReconciledOperationOutcome[] = [];
  for (const row of claimed) outcomes.push(await settleClaimedRow(row));
  return { success: true, dryRun: false, scanned: claimed.length, outcomes };
}
