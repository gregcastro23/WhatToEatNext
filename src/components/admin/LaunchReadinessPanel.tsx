"use client";

/**
 * LaunchReadinessPanel — the config-side "are the moving pieces wired?" board.
 *
 * Reads /api/admin/launch-readiness, which reports presence-only booleans for
 * every env-gated revenue + on-chain subsystem (Stripe, restaurant crypto-food
 * payments, on-chain ESMS, Recipe NFT, Privy, Amazon Fresh, agent network,
 * email) plus the live settlement backlog. No secret value is ever sent.
 *
 *   variant="compact" → single readiness strip for the /admin overview, with a
 *                        settlement-backlog callout that links to the operator
 *                        screen when orders are stuck.
 *   variant="full"    → per-subsystem cards with every individual env check,
 *                        for the Settings readiness board.
 */

import Link from "next/link";
import React from "react";
import { useHardenedPolling } from "@/hooks/useHardenedPolling";

type ReadinessStatus = "READY" | "PARTIAL" | "OFF";

interface ReadinessCheck {
  label: string;
  source: string;
  ok: boolean;
  kind: "flag" | "secret" | "config";
  isPublic: boolean;
}

interface SubsystemReadiness {
  key: string;
  label: string;
  description: string;
  status: ReadinessStatus;
  configured: number;
  total: number;
  checks: ReadinessCheck[];
}

interface Report {
  subsystems: SubsystemReadiness[];
  settlement: { pending: number; live: boolean };
  readyCount: number;
  generatedAt: string;
}

const STATUS_STYLE: Record<ReadinessStatus, { chip: string; dot: string; label: string }> = {
  READY: { chip: "bg-emerald-100 text-emerald-800", dot: "bg-emerald-500", label: "Ready" },
  PARTIAL: { chip: "bg-amber-100 text-amber-800", dot: "bg-amber-500", label: "Partial" },
  OFF: { chip: "bg-gray-200 text-gray-600", dot: "bg-gray-400", label: "Off" },
};

export default function LaunchReadinessPanel({
  variant = "full",
}: {
  variant?: "compact" | "full";
}) {
  const [report, setReport] = React.useState<Report | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const poll = React.useCallback(async (): Promise<{ ok: boolean }> => {
    try {
      const res = await fetch("/api/admin/launch-readiness", { cache: "no-store" });
      if (!res.ok) {
        setError(`HTTP ${res.status}`);
        return { ok: false };
      }
      const json = (await res.json()) as { success: boolean } & Report;
      if (json.success) {
        setReport(json);
        setError(null);
        return { ok: true };
      }
      setError("payload malformed");
      return { ok: false };
    } catch (_err) {
      setError("offline");
      return { ok: false };
    }
  }, []);

  // Config presence only changes on a redeploy; the settlement backlog moves
  // a little faster. A 2-minute cadence covers both.
  useHardenedPolling(poll, { baseIntervalMs: 120_000 });

  if (!report && !error) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2" />
        <p className="text-gray-500 text-xs">Loading launch readiness…</p>
      </div>
    );
  }

  if (error && !report) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-rose-200 p-4">
        <p className="text-rose-700 text-sm">Readiness failed: {error}</p>
        <button
          type="button"
          onClick={() => void poll()}
          className="mt-2 px-3 py-1 bg-rose-600 text-white rounded text-xs hover:bg-rose-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!report) return null;

  const backlog = report.settlement;

  if (variant === "compact") {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-4 sm:px-6 py-3 border-b border-gray-100 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-bold text-gray-800">Launch Readiness</h2>
          <Link
            href="/admin/settings"
            className="text-[11px] font-bold text-purple-600 hover:text-purple-800"
          >
            CONFIG →
          </Link>
        </div>

        {/* Settlement backlog callout — the one signal an operator must not
            miss. Green when clear, loud amber when orders are stuck. */}
        <Link
          href="/admin/settlements"
          className={`flex items-center justify-between px-4 sm:px-6 py-3 border-b transition-colors ${
            backlog.pending > 0
              ? "bg-amber-50 hover:bg-amber-100 border-amber-100"
              : "bg-emerald-50 hover:bg-emerald-100 border-emerald-100"
          }`}
        >
          <span className="text-sm font-semibold text-gray-800">
            💳 Restaurant settlements
          </span>
          <span
            className={`text-xs font-bold ${
              backlog.pending > 0 ? "text-amber-800" : "text-emerald-800"
            }`}
          >
            {!backlog.live
              ? "no source"
              : backlog.pending > 0
                ? `${backlog.pending} pending →`
                : "clear ✓"}
          </span>
        </Link>

        <div className="flex flex-wrap gap-2 p-3 sm:p-4">
          {report.subsystems.map((s) => {
            const style = STATUS_STYLE[s.status];
            return (
              <span
                key={s.key}
                title={`${s.label} · ${s.configured}/${s.total} configured`}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${style.chip}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                {s.label.split(" · ")[0]} {s.configured}/{s.total}
              </span>
            );
          })}
        </div>
      </div>
    );
  }

  // variant === "full"
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Launch Readiness</h2>
            <p className="text-xs text-gray-500">
              Presence-only config for revenue &amp; on-chain subsystems — values
              are never read, only whether each var is set.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
            {report.readyCount}/{report.subsystems.length} ready
          </span>
        </div>

        <Link
          href="/admin/settlements"
          className={`flex items-center justify-between px-6 py-3 border-b transition-colors ${
            backlog.pending > 0
              ? "bg-amber-50 hover:bg-amber-100 border-amber-100"
              : "bg-emerald-50 hover:bg-emerald-100 border-emerald-100"
          }`}
        >
          <span className="text-sm font-semibold text-gray-800">
            💳 Restaurant settlement backlog
          </span>
          <span
            className={`text-xs font-bold ${
              backlog.pending > 0 ? "text-amber-800" : "text-emerald-800"
            }`}
          >
            {!backlog.live
              ? "no source"
              : backlog.pending > 0
                ? `${backlog.pending} orders awaiting resolution →`
                : "clear — no stuck orders ✓"}
          </span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {report.subsystems.map((s) => {
          const style = STATUS_STYLE[s.status];
          return (
            <div
              key={s.key}
              className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden"
            >
              <div className="px-5 py-3 border-b border-gray-100 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-800">{s.label}</h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {s.description}
                  </p>
                </div>
                <span
                  className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${style.chip}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                  {style.label} {s.configured}/{s.total}
                </span>
              </div>
              <ul className="divide-y divide-gray-50">
                {s.checks.map((c) => (
                  <li
                    key={c.source}
                    className="flex items-center justify-between px-5 py-2 text-xs"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span
                        className={
                          c.ok ? "text-emerald-600" : "text-gray-300"
                        }
                      >
                        {c.ok ? "●" : "○"}
                      </span>
                      <span className="text-gray-700">{c.label}</span>
                      {c.isPublic && (
                        <span className="text-[9px] uppercase font-bold text-gray-300">
                          public
                        </span>
                      )}
                    </span>
                    <code className="text-[10px] text-gray-400 font-mono truncate ml-2">
                      {c.source}
                    </code>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
