"use client";

/**
 * CI, ratchet gates, deploy identity, commits, and PRs on /admin/code-health.
 *
 * @file src/app/admin/code-health/_components/CodeHealthActivity.tsx
 */

import React from "react";
import { fmtAgo, fmtDuration, fmtInt, shortSha } from "@/components/admin/live/format";
import { Absent, ExternalLink, Panel, Pill, type Tone } from "@/components/admin/live/primitives";
import type { CodeHealthView } from "@/lib/admin/schemas/codeHealth";

type View = CodeHealthView;

const CONCLUSION_TONE: Record<string, Tone> = { success: "ok", failure: "bad", cancelled: "neutral", skipped: "neutral" };

function conclusionTone(c: string | null): Tone {
  return c === null ? "warn" : (CONCLUSION_TONE[c] ?? "warn");
}

export function CiPanel({ data }: { data: View }): React.JSX.Element {
  const { ci } = data;
  if (ci.state.status !== "live") return <Panel title="CI on master"><Absent>{ci.state.detail}</Absent></Panel>;
  const [latest] = ci.runs;
  return (
    <Panel title="CI on master" subtitle={latest ? `latest: ${latest.title}` : "no runs"} right={latest && <Pill tone={conclusionTone(latest.conclusion)}>{latest.conclusion ?? latest.status ?? "?"}</Pill>}>
      <ul className="space-y-1 text-xs">
        {ci.latestJobs.map((j) => (
          <li key={j.name} className="flex items-center justify-between gap-2">
            <span className="text-gray-800">{j.name}</span>
            <span className="flex items-center gap-2">
              <span className="font-mono text-gray-500">{fmtDuration(j.durationMs)}</span>
              <Pill tone={conclusionTone(j.conclusion)}>{j.conclusion ?? j.status}</Pill>
            </span>
          </li>
        ))}
      </ul>
      <h3 className="mt-4 mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500">Recent runs</h3>
      <ul className="space-y-1 text-xs">
        {ci.runs.slice(0, 10).map((r) => (
          <li key={r.id} className="flex items-center gap-2">
            <Pill tone={conclusionTone(r.conclusion)}>{r.conclusion ?? r.status ?? "?"}</Pill>
            <ExternalLink href={r.url}><span className="font-mono">{shortSha(r.sha)}</span></ExternalLink>
            <span className="min-w-0 flex-1 truncate text-gray-700" title={r.title}>{r.title}</span>
            <span className="shrink-0 text-gray-500">{fmtAgo(r.createdAt)}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function RatchetGates({ data }: { data: View }): React.JSX.Element {
  const { ratchets } = data;
  const rows: Array<[string, string]> = [
    ["Lint debt (tracked)", ratchets.lintDebt?.trackedTotal == null ? "—" : fmtInt(ratchets.lintDebt.trackedTotal)],
    ["Declined-rule pool", ratchets.lintDebt?.declinedPool == null ? "—" : fmtInt(ratchets.lintDebt.declinedPool)],
    ["prefer-nullish (sub-baseline)", ratchets.lintDebt?.preferNullishCoalescing == null ? "—" : fmtInt(ratchets.lintDebt.preferNullishCoalescing)],
    ["Loose optionality", ratchets.lintDebt?.looseOptionality == null ? "—" : fmtInt(ratchets.lintDebt.looseOptionality)],
    ["eslint-disable suppressions", ratchets.lintDebt?.suppressions == null ? "—" : fmtInt(ratchets.lintDebt.suppressions)],
    ["Bare res.json() casts", ratchets.bareJsonCasts ? fmtInt(ratchets.bareJsonCasts.total) : "—"],
    ["scripts/ typecheck errors", ratchets.scriptsTypecheckErrors === null ? "—" : fmtInt(ratchets.scriptsTypecheckErrors)],
    ["Unvalidated route bodies", ratchets.routeValidation ? `${ratchets.routeValidation.unvalidated} / ${ratchets.routeValidation.bodyReadingRoutes}` : "—"],
  ];
  return (
    <Panel title="Ratchet gates" subtitle="ceilings enforced by bun run verify — can only go down">
      <dl className="space-y-1 text-xs">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-2">
            <dt className="text-gray-600">{label}</dt>
            <dd className="font-mono text-gray-900">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-[10px] text-gray-500">{ratchets.basis}</p>
    </Panel>
  );
}

export function ShippingPanel({ data }: { data: View }): React.JSX.Element {
  const { deploy, commits, pulls } = data;
  return (
    <Panel title="Shipping" subtitle={`${data.repo} · what is deployed and what is in flight`}>
      <p className="text-xs text-gray-700">
        Deployed: <span className="font-mono">{shortSha(deploy.sha)}</span> {deploy.message ?? "(deploy identity unavailable — not running on Vercel)"}
        {deploy.env && <span className="ml-1"><Pill tone="info">{deploy.env}</Pill></span>}
      </p>
      <h3 className="mt-4 mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500">Latest on master</h3>
      {commits.state.status !== "live" ? <Absent>{commits.state.detail}</Absent> : (
        <ul className="space-y-1 text-xs">
          {commits.commits.slice(0, 8).map((c) => (
            <li key={c.sha} className="flex gap-2">
              <ExternalLink href={c.url}><span className="font-mono">{shortSha(c.sha)}</span></ExternalLink>
              <span className="min-w-0 flex-1 truncate text-gray-800" title={c.title}>{c.title}</span>
              <span className="shrink-0 text-gray-500">{fmtAgo(c.date)}</span>
            </li>
          ))}
        </ul>
      )}
      <h3 className="mt-4 mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500">Open PRs ({pulls.pulls.length})</h3>
      {pulls.state.status !== "live" ? <Absent>{pulls.state.detail}</Absent> : (
        <ul className="space-y-1 text-xs">
          {pulls.pulls.map((p) => (
            <li key={p.number}><ExternalLink href={p.url}>#{p.number}</ExternalLink> {p.title} <span className="text-gray-500">· {fmtAgo(p.updatedAt)}</span></li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
