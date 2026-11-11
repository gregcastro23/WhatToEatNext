"use client";

/**
 * CosmicOperationsPanel — Phase 45 durable cosmic generation operations admin panel.
 *
 * Displays active 90s leases, expired/stranded operations, automated cron run
 * telemetry (`cron:reconcile-cosmic-operations`), and allows operators to
 * trigger a manual or dry-run reconciliation sweep.
 */
import React from "react";
import { z } from "zod";
import { EmptyState } from "@/components/admin/kit/EmptyState";
import { Metric } from "@/components/admin/kit/Metric";
import { fromLiveFlag, type Provenance } from "@/components/admin/kit/provenance";
import { ProvenanceBadge } from "@/components/admin/kit/ProvenanceBadge";
import { useHardenedPolling } from "@/hooks/useHardenedPolling";
import { readJson } from "@/lib/api/json";

const StrandedOperationSchema = z.object({
  operationKey: z.string(),
  userId: z.string(),
  status: z.enum(["claimed", "debited", "generating", "completed", "refund_pending", "refunded", "failed"]),
  requestFingerprint: z.string(),
  recipeId: z.string().nullable(),
  debitTxId: z.string().nullable(),
  refundTxId: z.string().nullable(),
  errorMessage: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  expiresAt: z.string(),
});

type StrandedOperationRow = z.infer<typeof StrandedOperationSchema>;

const AutomatedRunSchema = z.object({
  startedAt: z.string(),
  status: z.enum(["success", "failure", "timeout"]),
  scanned: z.number().int().nonnegative(),
  refundedCount: z.number().int().nonnegative(),
  failedCount: z.number().int().nonnegative(),
  pendingCount: z.number().int().nonnegative(),
});

type AutomatedRunTelemetry = z.infer<typeof AutomatedRunSchema>;

const CosmicOperationsSummarySchema = z.object({
  success: z.literal(true),
  generatedAt: z.string(),
  totals: z.object({
    total: z.number().int().nonnegative(),
    activeLocks: z.number().int().nonnegative(),
    expiredStranded: z.number().int().nonnegative(),
    completed: z.number().int().nonnegative(),
    refunded: z.number().int().nonnegative(),
    failed: z.number().int().nonnegative(),
  }),
  strandedOperations: z.array(StrandedOperationSchema),
  lastAutomatedRun: AutomatedRunSchema.nullable().optional(),
});

type CosmicOperationsSummary = z.infer<typeof CosmicOperationsSummarySchema>;

const ReconcileOutcomeSchema = z.object({
  userId: z.string(),
  operationKey: z.string(),
  previousStatus: z.string(),
  nextStatus: z.enum(["refunded", "failed", "refund_pending"]),
  refunded: z.boolean(),
  refundTxId: z.string().nullable(),
});
const ReconcileResponseSchema = z.object({
  success: z.literal(true),
  dryRun: z.boolean(),
  scanned: z.number().int().nonnegative(),
  outcomes: z.array(ReconcileOutcomeSchema),
});
type ReconcileResponse = z.infer<typeof ReconcileResponseSchema>;

function StrandedOperationsTable({ operations }: { operations: readonly StrandedOperationRow[] }): React.JSX.Element {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-xs text-gray-700">
        <thead>
          <tr className="border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500">
            <th className="py-2 pr-4">Operation Key</th>
            <th className="py-2 pr-4">User ID</th>
            <th className="py-2 pr-4">Status</th>
            <th className="py-2 pr-4">Debit Ledger Group</th>
            <th className="py-2 pr-4">Expired At</th>
            <th className="py-2">Detail</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {operations.map((op) => (
            <tr key={`${op.userId}:${op.operationKey}`}>
              <td className="py-2 pr-4 font-mono font-semibold text-gray-900">{op.operationKey}</td>
              <td className="py-2 pr-4 font-mono text-gray-600">{op.userId.slice(0, 12)}</td>
              <td className="py-2 pr-4">
                <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                  {op.status}
                </span>
              </td>
              <td className="py-2 pr-4 font-mono text-gray-600">{op.debitTxId ? op.debitTxId.slice(0, 12) : "—"}</td>
              <td className="py-2 pr-4 tabular-nums text-gray-500">{new Date(op.expiresAt).toLocaleString()}</td>
              <td className="py-2 text-gray-500">{op.errorMessage ?? "Lease expired (>90s)"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AutomatedRunStrip({ run }: { run: AutomatedRunTelemetry | null | undefined }): React.JSX.Element {
  if (!run) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600">
        Automated cron (<code className="font-mono">35 * * * *</code>): no scheduled run recorded yet.
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700 flex flex-wrap items-center justify-between gap-2">
      <span>
        Latest automated sweep:{" "}
        <span className="font-semibold uppercase">{run.status}</span> at{" "}
        <span className="font-mono">{new Date(run.startedAt).toLocaleString()}</span>
      </span>
      <span className="font-mono text-gray-600">
        scanned={run.scanned} · refunded={run.refundedCount} · failed={run.failedCount} · pending={run.pendingCount}
      </span>
    </div>
  );
}

function CosmicOperationsHeader({
  provenance,
  sweeping,
  onTrigger,
}: {
  provenance: Provenance;
  sweeping: boolean;
  onTrigger: (dryRun: boolean) => void;
}): React.JSX.Element {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-gray-900">Cosmic Generation Operations (Phase 45)</h3>
          <ProvenanceBadge provenance={provenance} />
        </div>
        <p className="text-sm text-gray-600">
          PostgreSQL 90-second lease locks and automatic Spirit/ESMS debit reconciliation via{" "}
          <code className="text-xs font-mono">FOR UPDATE SKIP LOCKED</code>.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={sweeping}
          onClick={() => onTrigger(true)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Dry-Run Preview
        </button>
        <button
          type="button"
          disabled={sweeping}
          onClick={() => onTrigger(false)}
          className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
        >
          {sweeping ? "Reconciling…" : "Reconcile Stranded"}
        </button>
      </div>
    </div>
  );
}

function useCosmicOperationsData(): {
  data: CosmicOperationsSummary | null;
  error: string | null;
  refresh: () => Promise<{ ok: boolean }>;
} {
  const [data, setData] = React.useState<CosmicOperationsSummary | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const poll = React.useCallback(async (): Promise<{ ok: boolean }> => {
    try {
      const res = await fetch("/api/admin/cosmic-operations?limit=15", { cache: "no-store" });
      if (!res.ok) {
        setError(`Failed to load cosmic operations (HTTP ${res.status})`);
        return { ok: false };
      }
      const parsed = await readJson(res, { parse: CosmicOperationsSummarySchema.parse });
      setData(parsed);
      setError(null);
      return { ok: true };
    } catch {
      setError("Failed to read cosmic operation diagnostics");
      return { ok: false };
    }
  }, []);
  useHardenedPolling(poll, { baseIntervalMs: 60_000 });
  return { data, error, refresh: poll };
}

function useReconcileAction(refresh: () => Promise<{ ok: boolean }>): {
  sweeping: boolean;
  sweepNotice: string | null;
  lastSweep: ReconcileResponse | null;
  trigger: (dryRun: boolean) => void;
} {
  const [sweeping, setSweeping] = React.useState(false);
  const [sweepNotice, setSweepNotice] = React.useState<string | null>(null);
  const [lastSweep, setLastSweep] = React.useState<ReconcileResponse | null>(null);

  const runSweep = async (dryRun: boolean): Promise<void> => {
    setSweeping(true);
    setSweepNotice(null);
    try {
      const res = await fetch("/api/admin/cosmic-operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 25, dryRun }),
      });
      if (!res.ok) {
        setSweepNotice(`Reconcile sweep failed (HTTP ${res.status})`);
        return;
      }
      const parsed = await readJson(res, { parse: ReconcileResponseSchema.parse });
      setLastSweep(parsed);
      const refundedCount = parsed.outcomes.filter((o) => o.refunded).length;
      setSweepNotice(parsed.dryRun ? `Dry-run scanned ${parsed.scanned} expired row(s).` : `Reconciled ${parsed.scanned} expired row(s) (${refundedCount} refunded).`);
      await refresh();
    } catch {
      setSweepNotice("Unable to complete cosmic operation reconciliation sweep.");
    } finally {
      setSweeping(false);
    }
  };

  return {
    sweeping,
    sweepNotice,
    lastSweep,
    trigger: (dryRun: boolean): void => {
      runSweep(dryRun).catch(() => undefined);
    },
  };
}

export function CosmicOperationsPanel(): React.JSX.Element {
  const { data, error, refresh } = useCosmicOperationsData();
  const { sweeping, sweepNotice, lastSweep, trigger } = useReconcileAction(refresh);

  if (!data && !error) {
    return <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 text-center"><p className="text-gray-600 text-sm">Loading cosmic generation leases…</p></div>;
  }
  if (error && !data) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h3 className="font-bold text-gray-900 mb-2">Cosmic Generation Operations (Phase 45)</h3>
        <EmptyState kind="cannot-read" title="Cosmic operations unavailable" description={error} />
      </div>
    );
  }
  if (!data) return <div />;
  const provenance = fromLiveFlag(true, { detail: "cosmic_generation_operations (90s lease + ledger debit verification)" });

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 space-y-5">
      <CosmicOperationsHeader provenance={provenance} sweeping={sweeping} onTrigger={trigger} />
      <AutomatedRunStrip run={data.lastAutomatedRun} />
      {sweepNotice && (
        <div role="status" className="rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-xs text-purple-900">
          <span>{sweepNotice}</span>
          {lastSweep && lastSweep.outcomes.length > 0 && <span className="ml-2 font-mono">({lastSweep.outcomes.map((o) => `${o.operationKey}→${o.nextStatus}`).join(", ")})</span>}
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Metric label="Active leases" value={data.totals.activeLocks} provenance={provenance} />
        <Metric label="Expired / stranded" value={data.totals.expiredStranded} provenance={provenance} higherIsBetter={false} />
        <Metric label="Completed" value={data.totals.completed} provenance={provenance} />
        <Metric label="Refunded" value={data.totals.refunded} provenance={provenance} />
      </div>
      {data.strandedOperations.length === 0 ? (
        <EmptyState
          kind={data.totals.total === 0 ? "never-used" : "all-clear"}
          title={data.totals.total === 0 ? "No cosmic generation operations recorded yet" : "No expired or stranded cosmic leases"}
          description="Expired open operations (>90s) will appear here and can be settled with verified ledger refunds."
        />
      ) : (
        <StrandedOperationsTable operations={data.strandedOperations} />
      )}
    </div>
  );
}

export default CosmicOperationsPanel;
