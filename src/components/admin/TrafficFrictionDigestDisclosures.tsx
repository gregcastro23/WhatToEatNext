"use client";

/**
 * Collapsible native <details> disclosures for TrafficFrictionDigestPanel.
 * Each <summary> is the first child and contains plain text + counts only.
 *
 * @file src/components/admin/TrafficFrictionDigestDisclosures.tsx
 */

import Link from "next/link";
import React from "react";
import type { TrafficDigestView } from "@/lib/admin/schemas/trafficDigest";

type DigestFacts = TrafficDigestView["facts"];

function formatDwell(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return "0s";
  if (ms < 60_000) return `${Math.round(ms / 1000)}s`;
  const mins = Math.floor(ms / 60_000);
  const secs = Math.round((ms % 60_000) / 1000);
  return `${mins}m ${secs}s`;
}

function formatPct(fraction: number): string {
  return `${Math.round(fraction * 100)}%`;
}

function TopRoutesDisclosure({ routes }: { routes: DigestFacts["topRoutes"] }): React.JSX.Element {
  return (
    <details className="rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs">
      <summary className="cursor-pointer font-semibold text-gray-800 select-none">
        Top Routes ({routes.length})
      </summary>
      <div className="mt-2 space-y-2">
        {routes.length === 0 ? (
          <p className="text-gray-500">No route traffic recorded in window.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-[11px]">
              <caption className="sr-only">Top routes in digest window</caption>
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 uppercase">
                  <th scope="col" className="py-1 pr-2">Route</th>
                  <th scope="col" className="py-1 pr-2">Views</th>
                  <th scope="col" className="py-1 pr-2">Bounce</th>
                  <th scope="col" className="py-1 pr-2">Dwell</th>
                  <th scope="col" className="py-1">Friction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {routes.map((r) => (
                  <tr key={r.path}>
                    <td className="py-1 pr-2 font-mono font-semibold text-gray-900">{r.path}</td>
                    <td className="py-1 pr-2 tabular-nums">{r.views}</td>
                    <td className="py-1 pr-2 tabular-nums">{formatPct(r.bounceRatePct)}</td>
                    <td className="py-1 pr-2 tabular-nums">{formatDwell(r.avgDwellMs)}</td>
                    <td className="py-1 tabular-nums">{r.frictionCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Link href="/admin/traffic" className="inline-block font-mono font-semibold text-indigo-700 hover:underline">
          Explore full route matrix →
        </Link>
      </div>
    </details>
  );
}

function FrictionSignalsDisclosure({ signals }: { signals: DigestFacts["frictionSignals"] }): React.JSX.Element {
  return (
    <details className="rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs">
      <summary className="cursor-pointer font-semibold text-gray-800 select-none">
        Active Rage, Dead-Click &amp; Friction Alerts ({signals.length})
      </summary>
      <div className="mt-2 space-y-2">
        {signals.length === 0 ? (
          <p className="text-gray-500">No active rage, dead-click, or error tags in window.</p>
        ) : (
          <ul className="space-y-1">
            {signals.map((sig) => (
              <li key={sig.tag} className="flex items-center justify-between gap-2">
                <span className="font-mono text-gray-900 truncate">
                  {sig.label} · <code>{sig.topPath}</code>
                </span>
                <span className="font-mono font-bold text-rose-700 shrink-0">
                  {sig.totalCount} ({sig.uniqueSessions}s)
                </span>
              </li>
            ))}
          </ul>
        )}
        <Link href="/admin/traffic?preset=friction" className="inline-block font-mono font-semibold text-indigo-700 hover:underline">
          Inspect frustrated sessions →
        </Link>
      </div>
    </details>
  );
}

function ExperimentLiftDisclosure({ experiment }: { experiment: DigestFacts["experiment"] }): React.JSX.Element {
  const variants = experiment?.variants ?? [];
  return (
    <details className="rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs">
      <summary className="cursor-pointer font-semibold text-gray-800 select-none">
        A/B Variant Lift ({variants.length} arms)
      </summary>
      <div className="mt-2 space-y-2">
        {variants.length === 0 ? (
          <p className="text-gray-500">No fast_start_cta or variant experiment sessions recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-[11px]">
              <caption className="sr-only">A/B experiment cohort performance</caption>
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 uppercase">
                  <th scope="col" className="py-1 pr-2">Variant</th>
                  <th scope="col" className="py-1 pr-2">Sessions</th>
                  <th scope="col" className="py-1 pr-2">Activation</th>
                  <th scope="col" className="py-1 pr-2">Lift</th>
                  <th scope="col" className="py-1">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {variants.map((arm) => (
                  <tr key={arm.variant}>
                    <td className="py-1 pr-2 font-mono font-semibold text-gray-900">{arm.variant}</td>
                    <td className="py-1 pr-2 tabular-nums">{arm.sessions}</td>
                    <td className="py-1 pr-2 tabular-nums">{formatPct(arm.activationRatePct)}</td>
                    <td className="py-1 pr-2 tabular-nums">
                      {arm.liftVsControlPct !== null && arm.liftVsControlPct !== undefined
                        ? `${arm.liftVsControlPct >= 0 ? "+" : ""}${arm.liftVsControlPct}%`
                        : "baseline"}
                    </td>
                    <td className="py-1 text-gray-600">{arm.confidenceLabel ?? "Insufficient Data"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Link href="/admin/traffic" className="inline-block font-mono font-semibold text-indigo-700 hover:underline">
          View stickiness &amp; experiment cohorts →
        </Link>
      </div>
    </details>
  );
}

function OpenFeedbackDisclosure({
  openFeedback,
  openFeedbackCount,
}: {
  openFeedback: DigestFacts["openFeedback"];
  openFeedbackCount: number;
}): React.JSX.Element {
  return (
    <details className="rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs">
      <summary className="cursor-pointer font-semibold text-gray-800 select-none">
        Open User Feedback ({openFeedbackCount})
      </summary>
      <div className="mt-2 space-y-2">
        {openFeedback.length === 0 ? (
          <p className="text-gray-500">No open feedback awaiting triage.</p>
        ) : (
          <ul className="space-y-1.5">
            {openFeedback.map((fb) => (
              <li key={fb.id} className="rounded border border-gray-200 bg-white px-2.5 py-1.5">
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="font-mono font-semibold text-gray-900">{fb.path}</span>
                  <span className="font-mono text-gray-500">
                    {fb.rating !== null ? `${fb.rating}★` : "note"} · {new Date(fb.at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700 mt-0.5">{fb.note}</p>
              </li>
            ))}
          </ul>
        )}
        <Link href="/admin/traffic?preset=feedback" className="inline-block font-mono font-semibold text-indigo-700 hover:underline">
          Triage open feedback →
        </Link>
      </div>
    </details>
  );
}

export function DigestEvidenceDisclosures({
  facts,
}: {
  facts: DigestFacts;
}): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <TopRoutesDisclosure routes={facts.topRoutes} />
      <FrictionSignalsDisclosure signals={facts.frictionSignals} />
      <ExperimentLiftDisclosure experiment={facts.experiment} />
      <OpenFeedbackDisclosure openFeedback={facts.openFeedback} openFeedbackCount={facts.openFeedbackCount} />
    </div>
  );
}
