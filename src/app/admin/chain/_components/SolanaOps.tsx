"use client";

/**
 * Governance, the agents app's own Solana health, and Solana repo activity.
 *
 * @file src/app/admin/chain/_components/SolanaOps.tsx
 */

import React from "react";
import { fmtAgo, shortAddress, shortSha } from "@/components/admin/live/format";
import { Absent, ExternalLink, Panel, Pill, type Tone } from "@/components/admin/live/primitives";
import type { SolanaView } from "@/lib/admin/schemas/chain";

export function Governance({ devnet }: { devnet: SolanaView["devnet"] }): React.JSX.Element {
  const g = devnet.governance;
  return (
    <Panel title="Governance (Squads)" subtitle="multisig that will hold the upgrade authority">
      {!g ? (
        <Absent>No governance manifest.</Absent>
      ) : (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          <dt className="text-gray-500">Threshold</dt>
          <dd className="font-mono text-gray-900">{g.threshold}-of-{g.members}</dd>
          <dt className="text-gray-500">Multisig account</dt>
          <dd>{g.multisigExists === null ? "not read" : <Pill tone={g.multisigExists ? "ok" : "bad"}>{g.multisigExists ? "exists" : "missing"}</Pill>}</dd>
          <dt className="text-gray-500">Vault balance</dt>
          <dd className="font-mono text-gray-900">{g.vaultSol === null ? "—" : `${g.vaultSol.toFixed(4)} SOL`}</dd>
          <dt className="text-gray-500">Lifecycle drill</dt>
          <dd className="text-gray-900">{g.drillStatus ?? "not run"}</dd>
          <dt className="text-gray-500">Program upgrade authority</dt>
          <dd className="font-mono text-gray-900">{shortAddress(devnet.program?.upgradeAuthority ?? null)}</dd>
        </dl>
      )}
    </Panel>
  );
}

const HEALTH_TONE: Record<SolanaView["asolHealth"]["status"], Tone> = {
  ok: "ok",
  unauthorized: "warn",
  "not-configured": "neutral",
  error: "bad",
};

function healthValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") return JSON.stringify(value).slice(0, 140);
  return String(value);
}

export function AsolHealth({ health }: { health: SolanaView["asolHealth"] }): React.JSX.Element {
  const entries = Object.entries(health.body ?? {});
  return (
    <Panel title="Agents app · Solana workers" subtitle="agents.alchm.kitchen /api/solana/health (sync + bridge queues)" right={<Pill tone={HEALTH_TONE[health.status]}>{health.status}</Pill>}>
      {entries.length === 0 ? (
        <Absent>{health.detail ?? "No response body."}</Absent>
      ) : (
        <dl className="space-y-1 text-xs">
          {entries.map(([k, v]) => (
            <div key={k} className="flex gap-3">
              <dt className="w-40 shrink-0 text-gray-500">{k}</dt>
              <dd className="min-w-0 break-all font-mono text-gray-800">{healthValue(v)}</dd>
            </div>
          ))}
        </dl>
      )}
    </Panel>
  );
}

export function SolanaRepo({ repo }: { repo: SolanaView["repo"] }): React.JSX.Element {
  return (
    <Panel title="alchm-agents-solana · recent work" subtitle="commits on main and open pull requests">
      {repo.status !== "live" ? (
        <Absent>{repo.detail ?? "GitHub could not be read."}</Absent>
      ) : (
        <>
          <ul className="space-y-1 text-xs">
            {repo.commits.map((c) => (
              <li key={c.sha} className="flex gap-2">
                <ExternalLink href={c.url}><span className="font-mono">{shortSha(c.sha)}</span></ExternalLink>
                <span className="min-w-0 flex-1 truncate text-gray-800" title={c.title}>{c.title}</span>
                <span className="shrink-0 text-gray-500">{fmtAgo(c.date)}</span>
              </li>
            ))}
          </ul>
          <h3 className="mt-4 mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500">Open PRs ({repo.openPulls.length})</h3>
          {repo.openPulls.length === 0 ? <p className="text-xs text-gray-500">None open.</p> : (
            <ul className="space-y-1 text-xs">
              {repo.openPulls.map((p) => (
                <li key={p.number}><ExternalLink href={p.url}>#{p.number}</ExternalLink> {p.title} {p.draft && <Pill tone="neutral">draft</Pill>}</li>
              ))}
            </ul>
          )}
        </>
      )}
    </Panel>
  );
}
