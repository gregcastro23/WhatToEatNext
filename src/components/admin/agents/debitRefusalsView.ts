/**
 * Pure presentation helpers for the Sync-Debit 402 Refusal Reasons card.
 *
 * @file src/components/admin/agents/debitRefusalsView.ts
 */

import type { Column } from "@/components/admin/live/charts";
import { fmtInt } from "@/components/admin/live/format";
import type { Tone } from "@/components/admin/live/primitives";
import type { DebitRefusalReportView } from "@/lib/admin/schemas/debitRefusals";

const HOUR_MS = 3_600_000;

export const DEBIT_REFUSALS_POLL_MS = 60_000;

export const DEBIT_REFUSAL_WINDOWS = [
  { hours: 24, label: "24h" },
  { hours: 168, label: "7d" },
  { hours: 720, label: "30d" },
] as const;

export type DebitRefusalWindowHours = (typeof DEBIT_REFUSAL_WINDOWS)[number]["hours"];

export const DEFAULT_DEBIT_REFUSAL_WINDOW: DebitRefusalWindowHours = 168;

const REASON_DETAILS: Record<string, { label: string; detail: string }> = {
  insufficient_value: {
    label: "Insufficient value",
    detail: "Basket total EEI value is below requested debit",
  },
  rates_unavailable: {
    label: "Rates unavailable",
    detail: "Auto-swap needed live token rates that were unavailable",
  },
  no_balance: {
    label: "No balance",
    detail: "Payer holds zero balance across all four axes",
  },
  auto_swap_off: {
    label: "Auto-swap off",
    detail: "Short on a requested axis and caller opted out of auto-swap",
  },
  lost_race: {
    label: "Lost race",
    detail: "Concurrent debit took the balance after the initial read",
  },
};

export function describeDebitRefusalReason(reason: string): { label: string; detail: string } {
  return (
    REASON_DETAILS[reason] ?? {
      label: reason,
      detail: "Unclassified refusal reason",
    }
  );
}

export function formatShortfallValue(mean: number | null, known: number): string {
  if (mean === null || known <= 0 || !Number.isFinite(mean)) return "—";
  return `${mean.toFixed(2)} tok`;
}

export function formatShare(part: number, total: number): string {
  if (total <= 0) return "—";
  return `${Math.round((part / total) * 100)}%`;
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export function formatUtcHour(iso: string): string {
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return "—";
  const d = new Date(ms);
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())} ${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())} UTC`;
}

export function formatUtcHourShort(iso: string): string {
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return "—";
  const d = new Date(ms);
  return `${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())} ${pad2(d.getUTCHours())}Z`;
}

export function computeCoverageNote(
  report: Pick<DebitRefusalReportView, "windowHours" | "recordingSince" | "generatedAt">,
): { partialWindow: boolean; label: string } {
  const { windowHours, recordingSince, generatedAt } = report;
  if (recordingSince === null) {
    return {
      partialWindow: true,
      label: "No refusals recorded yet since migration 107; earlier hours are unmeasured, not zero.",
    };
  }
  const sinceMs = Date.parse(recordingSince);
  const genMs = Date.parse(generatedAt);
  if (!Number.isFinite(sinceMs) || !Number.isFinite(genMs)) {
    return {
      partialWindow: true,
      label: `Recording since ${formatUtcHour(recordingSince)}; coverage window unverified.`,
    };
  }
  const windowStartMs = genMs - windowHours * HOUR_MS;
  if (sinceMs > windowStartMs) {
    return {
      partialWindow: true,
      label: `Recording started ${formatUtcHour(recordingSince)} — hours before that are unmeasured, not zero.`,
    };
  }
  return {
    partialWindow: false,
    label: `Full ${windowHours}h window measured (recording since ${formatUtcHour(recordingSince)}).`,
  };
}

export function toHourlyColumns(byHour: DebitRefusalReportView["byHour"]): Column[] {
  return byHour.map(
    (row): Column => ({
      key: row.hour,
      label: formatUtcHourShort(row.hour),
      value: row.refusals,
      detail: `${fmtInt(row.emptyBasket)} empty-basket`,
    }),
  );
}

export function refusalCardStatus(state: {
  data: DebitRefusalReportView | null;
  error: string | null;
}): { tone: Tone; label: string } {
  const { data, error } = state;
  if (error && !data) return { tone: "bad", label: "Unavailable" };
  if (!data) return { tone: "neutral", label: "Loading" };
  if (!data.live) return { tone: "warn", label: "Not live" };
  if (data.total === 0) return { tone: "ok", label: "0 Refused" };
  return { tone: "info", label: "Live · Counting" };
}
