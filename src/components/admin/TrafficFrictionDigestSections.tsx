"use client";

/**
 * KPI strip and findings/actions lists for TrafficFrictionDigestPanel.
 *
 * @file src/components/admin/TrafficFrictionDigestSections.tsx
 */

import Link from "next/link";
import React from "react";
import type { TrafficDigestView } from "@/lib/admin/schemas/trafficDigest";

type DigestFacts = TrafficDigestView["facts"];
type DigestNarrative = TrafficDigestView["narrative"];
type DigestSeverity = DigestNarrative["severity"];
type DigestFinding = DigestNarrative["topFindings"][number];

function formatPct(fraction: number): string {
  return `${Math.round(fraction * 100)}%`;
}

export const DIGEST_SEVERITY_META: Readonly<
  Record<DigestSeverity, { label: string; badgeClass: string; boxClass: string }>
> = {
  healthy: {
    label: "HEALTHY",
    badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-300",
    boxClass: "border-emerald-200 bg-emerald-50/40",
  },
  watch: {
    label: "WATCH",
    badgeClass: "bg-amber-100 text-amber-900 border-amber-300",
    boxClass: "border-amber-200 bg-amber-50/40",
  },
  action_needed: {
    label: "ACTION NEEDED",
    badgeClass: "bg-rose-100 text-rose-900 border-rose-300",
    boxClass: "border-rose-200 bg-rose-50/50",
  },
};

const FINDING_BADGE: Readonly<Record<DigestFinding["severity"], string>> = {
  critical: "bg-rose-100 text-rose-900 border-rose-300",
  warn: "bg-amber-100 text-amber-900 border-amber-300",
  info: "bg-slate-100 text-slate-700 border-slate-300",
};

const ACTION_BADGE: Readonly<Record<"P0" | "P1" | "P2", string>> = {
  P0: "bg-rose-700 text-white",
  P1: "bg-amber-600 text-white",
  P2: "bg-indigo-600 text-white",
};

function hasSource(facts: DigestFacts, name: string): boolean {
  return facts.liveSources > 0 && !facts.degradedSources.includes(name);
}

function DigestKpiTile({
  label,
  value,
  subtext,
}: {
  label: string;
  value: string;
  subtext: string;
}): React.JSX.Element {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50/70 p-3">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
        {label}
      </div>
      <div className="text-2xl font-bold font-mono text-gray-900 mt-1">{value}</div>
      <div className="text-[11px] text-gray-500 font-mono mt-0.5 truncate" title={subtext}>
        {subtext}
      </div>
    </div>
  );
}

function formatExperimentTile(facts: DigestFacts): { value: string; sub: string } {
  if (!hasSource(facts, "activation")) return { value: "—", sub: "activation offline" };
  const exp = facts.experiment;
  if (exp) {
    const val =
      exp.liftVsControlPct !== null
        ? `${exp.liftVsControlPct >= 0 ? "+" : ""}${exp.liftVsControlPct}% lift`
        : exp.leaderVariant ?? "1 arm";
    return { value: val, sub: `${exp.experimentKey} · ${exp.confidenceLabel ?? "Insufficient Data"}` };
  }
  return facts.activationRatePct !== null
    ? { value: formatPct(facts.activationRatePct), sub: "overall activation (no active variant)" }
    : { value: "—", sub: "activation offline" };
}

export function DigestKpiStrip({ facts }: { facts: DigestFacts }): React.JSX.Element {
  const totalsOk = hasSource(facts, "totals");
  const interactionsOk = hasSource(facts, "interactions");
  const alertsOk = hasSource(facts, "frictionAlerts");
  const feedbackOk = hasSource(facts, "feedback");
  const rageDead = facts.frictionSummary.rageClicks + facts.frictionSummary.deadClicks;
  const pvDelta =
    facts.pageviewsDeltaPct === null
      ? `across ${facts.totals.sessions} session(s)`
      : `${facts.pageviewsDeltaPct >= 0 ? "+" : ""}${facts.pageviewsDeltaPct}% vs prior ${facts.range}`;
  const expTile = formatExperimentTile(facts);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <DigestKpiTile
        label="Human Pageviews"
        value={totalsOk ? facts.totals.pageviews.toLocaleString() : "—"}
        subtext={totalsOk ? pvDelta : "totals offline"}
      />
      <DigestKpiTile
        label="Rage & Dead Clicks"
        value={interactionsOk ? rageDead.toLocaleString() : "—"}
        subtext={
          interactionsOk
            ? `${facts.frictionSummary.rageClicks} rage · ${facts.frictionSummary.deadClicks} dead · ${alertsOk ? facts.frictionSummary.errorSessions60m : "—"} err(60m)`
            : "interactions offline"
        }
      />
      <DigestKpiTile label="fast_start_cta Lift" value={expTile.value} subtext={expTile.sub} />
      <DigestKpiTile
        label="Open Feedback"
        value={feedbackOk ? facts.openFeedbackCount.toLocaleString() : "—"}
        subtext={feedbackOk ? `${facts.openLowRatingCount} rated ≤3★` : "feedback offline"}
      />
    </div>
  );
}

function DigestFindingsList({ findings }: { findings: DigestNarrative["topFindings"] }): React.JSX.Element {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">Key Findings</h3>
      <ul className="space-y-2">
        {findings.map((finding, idx) => (
          <li key={`${finding.category}-${idx}`} className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-xs space-y-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className={`px-1.5 py-0.5 rounded border font-mono text-[10px] font-bold uppercase ${FINDING_BADGE[finding.severity]}`}>
                  {finding.severity}
                </span>
                <span className="font-semibold text-gray-900">{finding.title}</span>
              </div>
              {finding.actionHref && (
                <Link href={finding.actionHref} className="font-mono text-[11px] font-semibold text-indigo-700 hover:underline shrink-0">
                  Inspect →
                </Link>
              )}
            </div>
            <p className="text-gray-600 leading-relaxed">{finding.detail}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DigestActionsList({ actions }: { actions: DigestNarrative["recommendedActions"] }): React.JSX.Element {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">Prioritized Actions</h3>
      <ol className="space-y-2">
        {actions.map((act, idx) => (
          <li key={`${act.priority}-${idx}`} className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-xs space-y-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold ${ACTION_BADGE[act.priority]}`}>
                  {act.priority}
                </span>
                <span className="font-semibold text-gray-900">{act.action}</span>
              </div>
              {act.targetPath && (
                <Link href={act.targetPath} className="font-mono text-[11px] font-semibold text-indigo-700 hover:underline shrink-0">
                  Open →
                </Link>
              )}
            </div>
            <p className="text-gray-600 leading-relaxed">{act.rationale}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function DigestFindingsAndActions({
  narrative,
}: {
  narrative: DigestNarrative;
}): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <DigestFindingsList findings={narrative.topFindings} />
      <DigestActionsList actions={narrative.recommendedActions} />
    </div>
  );
}
