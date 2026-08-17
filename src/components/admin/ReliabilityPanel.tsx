"use client";

/**
 * Reliability Panel
 *
 * The "over time" half of the operator view. Every other panel on /admin
 * answers "what is happening right now"; this one answers "is it getting
 * better or worse, and did anyone hear about it".
 *
 * Three sections, each independently live:
 *
 *   1. Health history — hourly overall status for the last 7 days as a
 *      status ribbon, plus week-over-week drift. This is the surface that
 *      makes a multi-day degradation visible without an operator happening
 *      to be watching at the right hour.
 *   2. Probe reliability — per-probe failure *rate* and latency. The system
 *      status tiles show only the newest run, so an intermittent failure
 *      reads as OK whenever the last run passed.
 *   3. Alert delivery — per-channel delivery outcomes. An alert that fired
 *      and reached nobody looks identical to a delivered one everywhere else.
 *
 * Honesty: sections render `live: false` as an explicit "can't measure"
 * state, never as a zero. See CLAUDE.md — admin panels never fabricate.
 */

import React from "react";
import { useHardenedPolling } from "@/hooks/useHardenedPolling";

type FlowStatus = "OK" | "DEGRADED" | "INCIDENT" | "UNKNOWN";

interface HealthHistoryPoint {
  capturedAt: string;
  overall: FlowStatus;
}

interface HealthDrift {
  thisWeekBadRate: number;
  lastWeekBadRate: number;
  delta: number | null;
  thisWeekSamples: number;
  lastWeekSamples: number;
}

interface HealthHistoryData {
  points: HealthHistoryPoint[];
  windowHours: number;
  uptimePct: number | null;
  drift: HealthDrift | null;
  live: boolean;
}

interface ProbeReliabilityRow {
  probeName: string;
  runs: number;
  failures: number;
  failureRate: number;
  p50LatencyMs: number | null;
  p95LatencyMs: number | null;
  maxLatencyMs: number | null;
  lastRunAt: string | null;
  lastStatus: string | null;
  lastError: string | null;
}

interface ProbeReliabilityData {
  probes: ProbeReliabilityRow[];
  windowDays: number;
  totalRuns: number;
  totalFailures: number;
  live: boolean;
}

interface AlertChannelDelivery {
  channel: string;
  attempted: number;
  delivered: number;
  failed: number;
  deliveryRate: number;
  lastError: string | null;
  lastFailureAt: string | null;
}

interface AlertDeliveryData {
  windowDays: number;
  alertsFired: number;
  suppressed: number;
  channels: AlertChannelDelivery[];
  live: boolean;
}

interface ReliabilityPayload {
  generatedAt: string;
  health: HealthHistoryData;
  probes: ProbeReliabilityData;
  alerts: AlertDeliveryData;
}

const STATUS_COLOR: Record<FlowStatus, string> = {
  OK: "bg-emerald-500",
  DEGRADED: "bg-amber-500",
  INCIDENT: "bg-rose-500",
  UNKNOWN: "bg-gray-300",
};

/** Shared "we could not measure this" state — never rendered as a zero. */
function NoSource({ what }: { what: string }): React.JSX.Element {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center">
      <p className="text-sm font-medium text-gray-600">No source</p>
      <p className="mt-1 text-xs text-gray-500">
        {what} could not be read. This is not a zero — the value is unknown.
      </p>
    </div>
  );
}

function pct(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function ms(value: number | null): string {
  if (value === null) return "—";
  return value >= 1000 ? `${(value / 1000).toFixed(1)}s` : `${value}ms`;
}

// ─── 1 · Health history ribbon ─────────────────────────────────────────

function HealthHistorySection({ health }: { health: HealthHistoryData }): React.JSX.Element {
  if (!health.live) return <NoSource what="System health history" />;

  if (health.points.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No snapshots captured in the last {health.windowHours}h. The
        system-health-snapshot cron writes one row per hour.
      </p>
    );
  }

  // Oldest -> newest so the ribbon reads left-to-right like a timeline.
  const ordered = [...health.points].reverse();
  const { drift } = health;
  const worsening = drift?.delta !== null && (drift?.delta ?? 0) > 0.05;
  const improving = drift?.delta !== null && (drift?.delta ?? 0) < -0.05;

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <span className="text-2xl font-semibold text-gray-900">
            {health.uptimePct === null ? "—" : `${health.uptimePct.toFixed(1)}%`}
          </span>
          <span className="ml-2 text-sm text-gray-500">
            of the last {ordered.length} hourly snapshots were OK
          </span>
        </div>

        {drift?.delta !== null && drift !== null && (
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              worsening
                ? "bg-rose-100 text-rose-700"
                : improving
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-gray-100 text-gray-600"
            }`}
            title={`Unhealthy share: ${pct(drift.thisWeekBadRate)} this week vs ${pct(
              drift.lastWeekBadRate,
            )} the week before (${drift.thisWeekSamples} vs ${drift.lastWeekSamples} samples)`}
          >
            {worsening ? "▲ degrading" : improving ? "▼ improving" : "≈ steady"}{" "}
            {pct(drift.lastWeekBadRate)} → {pct(drift.thisWeekBadRate)} unhealthy
          </span>
        )}
      </div>

      {/* Status ribbon — one cell per hourly snapshot. */}
      <div className="mt-3 flex gap-px overflow-hidden rounded" role="img"
        aria-label={`Hourly system status for the last ${ordered.length} snapshots`}
      >
        {ordered.map((p) => (
          <div
            key={p.capturedAt}
            className={`h-8 flex-1 ${STATUS_COLOR[p.overall]}`}
            title={`${new Date(p.capturedAt).toLocaleString()} — ${p.overall}`}
          />
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-gray-400">
        <span>{new Date(ordered[0].capturedAt).toLocaleString()}</span>
        <span>{new Date(ordered[ordered.length - 1].capturedAt).toLocaleString()}</span>
      </div>
    </div>
  );
}

// ─── 2 · Probe reliability ─────────────────────────────────────────────

function ProbeSection({ probes }: { probes: ProbeReliabilityData }): React.JSX.Element {
  if (!probes.live) return <NoSource what="Synthetic probe results" />;

  if (probes.probes.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No probe runs recorded in the last {probes.windowDays}d.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
            <th className="py-2 pr-3 font-medium">Probe</th>
            <th className="py-2 pr-3 text-right font-medium">Runs</th>
            <th className="py-2 pr-3 text-right font-medium">Fail rate</th>
            <th className="py-2 pr-3 text-right font-medium">p50</th>
            <th className="py-2 pr-3 text-right font-medium">p95</th>
            <th className="py-2 font-medium">Last error</th>
          </tr>
        </thead>
        <tbody>
          {probes.probes.map((p) => {
            const bad = p.failureRate > 0;
            return (
              <tr key={p.probeName} className="border-b border-gray-100 last:border-0">
                <td className="py-2 pr-3 font-mono text-xs text-gray-800">
                  {p.probeName}
                </td>
                <td className="py-2 pr-3 text-right tabular-nums text-gray-600">
                  {p.runs}
                </td>
                <td
                  className={`py-2 pr-3 text-right tabular-nums font-medium ${
                    p.failureRate >= 0.05
                      ? "text-rose-600"
                      : bad
                        ? "text-amber-600"
                        : "text-emerald-600"
                  }`}
                >
                  {pct(p.failureRate)}
                  {bad && (
                    <span className="ml-1 text-xs font-normal text-gray-400">
                      ({p.failures})
                    </span>
                  )}
                </td>
                <td className="py-2 pr-3 text-right tabular-nums text-gray-600">
                  {ms(p.p50LatencyMs)}
                </td>
                <td className="py-2 pr-3 text-right tabular-nums text-gray-600">
                  {ms(p.p95LatencyMs)}
                </td>
                <td className="py-2 max-w-[220px] truncate text-xs text-gray-500"
                  title={p.lastError ?? ""}
                >
                  {p.lastError ?? "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── 3 · Alert delivery ────────────────────────────────────────────────

function AlertDeliverySection({ alerts }: { alerts: AlertDeliveryData }): React.JSX.Element {
  if (!alerts.live) return <NoSource what="Alert delivery records" />;

  if (alerts.alertsFired === 0) {
    return (
      <p className="text-sm text-gray-500">
        No alerts fired in the last {alerts.windowDays}d.
      </p>
    );
  }

  return (
    <div>
      <p className="text-sm text-gray-600">
        <span className="font-semibold text-gray-900">{alerts.alertsFired}</span>{" "}
        alerts fired in {alerts.windowDays}d
        {alerts.suppressed > 0 && ` · ${alerts.suppressed} suppressed`}
      </p>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {alerts.channels.map((c) => {
          const broken = c.deliveryRate === 0 && c.attempted > 0;
          const partial = !broken && c.failed > 0;
          return (
            <div
              key={c.channel}
              className={`rounded-lg border p-3 ${
                broken
                  ? "border-rose-300 bg-rose-50"
                  : partial
                    ? "border-amber-300 bg-amber-50"
                    : "border-emerald-200 bg-emerald-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium capitalize text-gray-800">
                  {c.channel}
                </span>
                <span
                  className={`text-sm font-semibold tabular-nums ${
                    broken
                      ? "text-rose-700"
                      : partial
                        ? "text-amber-700"
                        : "text-emerald-700"
                  }`}
                >
                  {c.delivered}/{c.attempted}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-600">
                {broken
                  ? "Never delivered — every attempt failed"
                  : partial
                    ? `${c.failed} failed`
                    : "All delivered"}
              </p>
              {c.lastError && (
                <p
                  className="mt-1 truncate font-mono text-[11px] text-rose-700"
                  title={c.lastError}
                >
                  {c.lastError}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Panel ─────────────────────────────────────────────────────────────

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <section className="border-t border-gray-100 pt-4 first:border-0 first:pt-0">
      <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      <p className="mb-3 text-xs text-gray-500">{hint}</p>
      {children}
    </section>
  );
}

export default function ReliabilityPanel(): React.JSX.Element {
  const [data, setData] = React.useState<ReliabilityPayload | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  const { refreshNow } = useHardenedPolling(
    React.useCallback(async () => {
      try {
        const res = await fetch("/api/admin/reliability");
        if (!res.ok) {
          setError(`Request failed (${res.status})`);
          return { ok: false };
        }
        const json = (await res.json()) as ReliabilityPayload & {
          success: boolean;
        };
        setData(json);
        setError(null);
        return { ok: true };
      } catch (err) {
        setError(err instanceof Error ? err.message : "Network error");
        return { ok: false };
      } finally {
        setLoading(false);
      }
    }, []),
    { baseIntervalMs: 60_000 },
  );

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Reliability over time</h2>
          <p className="text-xs text-gray-500">
            History, failure rates and alert delivery — the questions a
            point-in-time status view cannot answer.
          </p>
        </div>
        <button
          type="button"
          onClick={refreshNow}
          className="shrink-0 rounded-md border border-gray-300 px-2.5 py-1 text-xs text-gray-600 transition-colors hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      {loading && !data && (
        <p className="text-sm text-gray-500">Loading reliability data…</p>
      )}

      {error && !data && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
          <p className="text-sm font-medium text-rose-800">
            Could not load reliability data
          </p>
          <p className="mt-1 text-xs text-rose-600">{error}</p>
        </div>
      )}

      {data && (
        <div className="space-y-5">
          <Section
            title="System health history"
            hint="Hourly overall status. Each cell is one snapshot; hover for the exact time."
          >
            <HealthHistorySection health={data.health} />
          </Section>

          <Section
            title="Synthetic probe reliability"
            hint="Failure rate across every run in the window — not just the most recent one."
          >
            <ProbeSection probes={data.probes} />
          </Section>

          <Section
            title="Alert delivery"
            hint="Whether alerts that fired actually reached each channel."
          >
            <AlertDeliverySection alerts={data.alerts} />
          </Section>

          <p className="pt-1 text-[11px] text-gray-400">
            Generated {new Date(data.generatedAt).toLocaleString()} · polls every 60s
          </p>
        </div>
      )}
    </div>
  );
}
