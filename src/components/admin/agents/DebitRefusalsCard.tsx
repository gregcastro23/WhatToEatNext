"use client";

/**
 * Sync-Debit 402 Refusal Reasons card for /admin/agents.
 *
 * Reads aggregate hourly counters from GET /api/admin/debit-refusals (migration 107).
 * Surfaces `live: false` and partial recording windows honestly without inventing zeros.
 *
 * @file src/components/admin/agents/DebitRefusalsCard.tsx
 */

import React, { useId, useState } from "react";
import {
  computeCoverageNote,
  DEBIT_REFUSAL_WINDOWS,
  DEBIT_REFUSALS_POLL_MS,
  DEFAULT_DEBIT_REFUSAL_WINDOW,
  describeDebitRefusalReason,
  formatShare,
  formatShortfallValue,
  formatUtcHour,
  refusalCardStatus,
  toHourlyColumns,
  type DebitRefusalWindowHours,
} from "@/components/admin/agents/debitRefusalsView";
import { ColumnChart } from "@/components/admin/live/charts";
import { fmtInt } from "@/components/admin/live/format";
import { Absent, Basis, Panel, Pill } from "@/components/admin/live/primitives";
import { useAdminResource } from "@/components/admin/live/useAdminResource";
import { DebitRefusalResponseSchema, type DebitRefusalReportView } from "@/lib/admin/schemas/debitRefusals";

interface DebitRefusalsCardViewProps {
  data: DebitRefusalReportView | null;
  error: string | null;
  windowHours: DebitRefusalWindowHours;
  onWindowChange: (hours: DebitRefusalWindowHours) => void;
  onRefresh: () => void;
}

function WindowControls({
  windowHours,
  onWindowChange,
}: {
  windowHours: DebitRefusalWindowHours;
  onWindowChange: (hours: DebitRefusalWindowHours) => void;
}): React.ReactElement {
  return (
    <div role="group" aria-label="Debit refusal window" className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
      {DEBIT_REFUSAL_WINDOWS.map((opt) => {
        const active = windowHours === opt.hours;
        return (
          <button
            key={opt.hours}
            type="button"
            aria-pressed={active}
            onClick={(): void => onWindowChange(opt.hours)}
            className={`px-2 py-0.5 text-[11px] font-semibold rounded-md transition-colors ${
              active ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function SummaryCell({ label, value, subtext }: { label: string; value: string; subtext: string }): React.ReactElement {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">{label}</p>
      <p className="mt-1 font-mono text-2xl font-bold text-gray-900 tabular-nums">{value}</p>
      <p className="mt-0.5 text-[11px] text-gray-500">{subtext}</p>
    </div>
  );
}

function RefusalSummaryRow({
  data,
  coverage,
}: {
  data: DebitRefusalReportView;
  coverage: { partialWindow: boolean; label: string };
}): React.ReactElement {
  const emptyShareText = data.total > 0 ? `${fmtInt(data.emptyBasket)} (${formatShare(data.emptyBasket, data.total)})` : "0";
  const totalSubtext =
    coverage.partialWindow && data.recordingSince !== null ? `since ${formatUtcHour(data.recordingSince)}` : `window ${data.windowHours}h`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <SummaryCell label="Total 402 refusals" value={fmtInt(data.total)} subtext={totalSubtext} />
      <SummaryCell label="Empty-basket share" value={emptyShareText} subtext="payers holding 0 on all 4 axes" />
      <SummaryCell
        label="Reasons / Active hours"
        value={`${fmtInt(data.byReason.length)} / ${fmtInt(data.byHour.length)}`}
        subtext="distinct reasons · UTC hours with refusals"
      />
    </div>
  );
}

function ReasonRow({ row, total }: { row: DebitRefusalReportView["byReason"][number]; total: number }): React.ReactElement {
  const meta = describeDebitRefusalReason(row.reason);
  const shortfallText = formatShortfallValue(row.meanShortfallValue, row.shortfallKnown);

  return (
    <tr className="hover:bg-gray-50">
      <th scope="row" className="sticky left-0 bg-white py-2.5 pr-3 pl-2 font-medium text-gray-900 align-top">
        <div className="whitespace-nowrap">
          <span>{meta.label}</span>
          <code className="ml-1.5 font-mono text-[10px] text-gray-400">{row.reason}</code>
        </div>
        <p className="text-[11px] font-normal text-gray-500 mt-0.5">{meta.detail}</p>
      </th>
      <td className="py-2.5 px-2 text-right font-mono text-gray-900 tabular-nums whitespace-nowrap">{fmtInt(row.refusals)}</td>
      <td className="py-2.5 px-2 text-right font-mono text-gray-600 tabular-nums whitespace-nowrap">{formatShare(row.refusals, total)}</td>
      <td className="py-2.5 px-2 text-right font-mono text-gray-600 tabular-nums whitespace-nowrap">{fmtInt(row.emptyBasket)}</td>
      <td className="py-2.5 pl-2 pr-2 text-right font-mono text-gray-900 tabular-nums whitespace-nowrap">
        <span>{shortfallText}</span>
        {row.meanShortfallValue !== null && row.shortfallKnown > 0 && (
          <span className="text-[11px] text-gray-400 ml-1">{`(n=${fmtInt(row.shortfallKnown)})`}</span>
        )}
      </td>
    </tr>
  );
}

function RefusalReasonTable({ data }: { data: DebitRefusalReportView }): React.ReactElement {
  const captionId = useId();

  return (
    <div tabIndex={0} role="region" aria-labelledby={captionId} className="overflow-x-auto max-w-full rounded-lg border border-gray-100">
      <table className="min-w-full text-left text-xs divide-y divide-gray-100">
        <caption id={captionId} className="sr-only">
          Sync-debit 402 refusal breakdown by reason
        </caption>
        <thead>
          <tr className="text-gray-400 font-medium bg-gray-50">
            <th scope="col" className="py-2 pr-3 pl-2">Reason</th>
            <th scope="col" className="py-2 px-2 text-right">Refusals</th>
            <th scope="col" className="py-2 px-2 text-right">Share</th>
            <th scope="col" className="py-2 px-2 text-right">Empty basket</th>
            <th scope="col" className="py-2 pl-2 pr-2 text-right">Mean shortfall</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.byReason.map((row) => (
            <ReasonRow key={row.reason} row={row} total={data.total} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RefusalBasisFooter({ coverageLabel }: { coverageLabel: string }): React.ReactElement {
  return (
    <Basis>
      Basis: hourly aggregates in <code className="font-mono text-gray-700">economy_debit_refusals</code> recorded via{" "}
      <code className="font-mono text-gray-700">runAfterResponse</code> on{" "}
      <code className="font-mono text-gray-700">POST /api/economy/sync-debit</code> 402 responses (migration 107). Shortfall value is
      measured in tokens at index 1.0 only when a swap plan ran. Every 402 reflects a two-ledger divergence between ASOL&apos;s pre-check
      ledger and WTEN&apos;s <code className="font-mono text-gray-700">token_balances</code>; these counters record WTEN&apos;s refusal
      cause only. {coverageLabel}
    </Basis>
  );
}

function LiveRefusalBody({ data }: { data: DebitRefusalReportView }): React.ReactElement {
  const coverage = computeCoverageNote(data);

  return (
    <div className="space-y-4">
      {coverage.partialWindow && (
        <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs text-indigo-900">{coverage.label}</div>
      )}
      <RefusalSummaryRow data={data} coverage={coverage} />
      {data.byReason.length > 0 ? <RefusalReasonTable data={data} /> : <Absent>No 402 refusals recorded in this window.</Absent>}
      {data.byHour.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <h3 className="font-semibold text-gray-800">Hourly 402 Refusals (UTC)</h3>
            <span className="text-[11px] text-gray-500">Hours with zero refusals are omitted.</span>
          </div>
          <ColumnChart columns={toHourlyColumns(data.byHour)} format={fmtInt} ariaLabel="Sync-debit 402 refusals by UTC hour" height={110} />
        </div>
      )}
      <RefusalBasisFooter coverageLabel={coverage.label} />
    </div>
  );
}

function DebitRefusalsBody({
  data,
  error,
  onRefresh,
}: {
  data: DebitRefusalReportView | null;
  error: string | null;
  onRefresh: () => void;
}): React.ReactElement {
  if (error && !data) {
    return (
      <Absent>
        <p className="font-semibold text-rose-700">Could not load debit refusal counters</p>
        <p className="mt-1 font-mono text-[11px] text-gray-500">{error}</p>
        <button
          type="button"
          onClick={(): void => onRefresh()}
          className="mt-3 px-3 py-1 text-xs font-semibold rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
        >
          Retry
        </button>
      </Absent>
    );
  }
  if (!data) {
    return (
      <div role="status" className="py-6 text-center text-xs text-gray-500">
        Loading debit refusal counters…
      </div>
    );
  }
  if (!data.live) {
    return (
      <Absent>
        <p className="font-semibold text-amber-800">Telemetry source not live (live: false)</p>
        <p className="mt-1 font-mono text-[11px] text-gray-600">{data.note ?? "economy_debit_refusals could not be read"}</p>
        <p className="mt-1 text-[11px] text-gray-500">No refusal counts are shown because the counter table is unavailable.</p>
      </Absent>
    );
  }
  return <LiveRefusalBody data={data} />;
}

export function DebitRefusalsCardView({
  data,
  error,
  windowHours,
  onWindowChange,
  onRefresh,
}: DebitRefusalsCardViewProps): React.ReactElement {
  const status = refusalCardStatus({ data, error });

  return (
    <Panel
      title="Sync-Debit 402 Refusal Reasons"
      subtitle="Hourly refusal counts by reason from POST /api/economy/sync-debit"
      right={
        <>
          <WindowControls windowHours={windowHours} onWindowChange={onWindowChange} />
          {error && data && (
            <Pill tone="bad" title={error}>
              Last refresh failed
            </Pill>
          )}
          <Pill tone={status.tone}>{status.label}</Pill>
        </>
      }
    >
      <DebitRefusalsBody data={data} error={error} onRefresh={onRefresh} />
    </Panel>
  );
}

export function DebitRefusalsCard(): React.ReactElement {
  const [windowHours, setWindowHours] = useState<DebitRefusalWindowHours>(DEFAULT_DEBIT_REFUSAL_WINDOW);
  const { data, error, refresh } = useAdminResource(
    `/api/admin/debit-refusals?hours=${windowHours}`,
    DebitRefusalResponseSchema,
    DEBIT_REFUSALS_POLL_MS,
  );

  return (
    <DebitRefusalsCardView
      data={data}
      error={error}
      windowHours={windowHours}
      onWindowChange={setWindowHours}
      onRefresh={refresh}
    />
  );
}
