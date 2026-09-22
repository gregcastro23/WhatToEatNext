"use client";

/**
 * Live devnet detail on /admin/chain: headline numbers, mints, AMM pools,
 * and recent program transactions.
 *
 * @file src/app/admin/chain/_components/SolanaSections.tsx
 */

import React from "react";
import { fmtAgo, fmtInt, shortAddress } from "@/components/admin/live/format";
import { Absent, ExternalLink, Panel, Pill, Stat, StatGrid } from "@/components/admin/live/primitives";
import type { SolanaView } from "@/lib/admin/schemas/chain";

type Devnet = SolanaView["devnet"];

function pausedLabel(d: Devnet): string | null {
  if (!d.config) return null;
  if (d.config.pauseClaims && d.config.pauseRedemptions) return "claims + redemptions paused";
  if (d.config.pauseClaims) return "claims paused";
  return d.config.pauseRedemptions ? "redemptions paused" : "open";
}

function rpcSub(d: Devnet): string {
  if (d.slot === null) return d.error ?? "no slot";
  return `slot ${fmtInt(d.slot)}${d.genesisMatch === false ? " · GENESIS MISMATCH" : ""}`;
}

function repoStat(repo: SolanaView["repo"]): { value: string | null; sub: string } {
  if (repo.status !== "live") return { value: null, sub: repo.detail ?? "GitHub not read" };
  return { value: fmtInt(repo.commits7d), sub: `${repo.commits30d} commits in 30d` };
}

export function SolanaKpis({ solana }: { solana: SolanaView }): React.JSX.Element {
  const d = solana.devnet;
  const deployerSol = d.deployer?.sol ?? null;
  const paused = pausedLabel(d);
  return (
    <StatGrid>
      <Stat label="Devnet RPC" value={d.reachable ? "reachable" : "down"} sub={rpcSub(d)} tone={d.reachable && d.genesisMatch !== false ? "ok" : "bad"} />
      <Stat label="Program txs · 7d" value={d.activity ? fmtInt(d.activity.last7d) : null} sub={d.activity ? `${fmtInt(d.activity.last24h)} in 24h · ${d.activity.failedRecent} failed of last 100` : "signatures not read"} />
      <Stat label="Last program tx" value={d.activity ? fmtAgo(d.activity.lastTxAt) : null} sub="any instruction against the program" />
      <Stat label="Program state" value={paused} sub={d.config ? `admin ${shortAddress(d.config.admin)}` : "config not decoded"} tone={paused === "open" ? "ok" : "warn"} />
      <Stat label="Deployer SOL" value={deployerSol === null ? null : deployerSol.toFixed(3)} sub={d.deployer ? shortAddress(d.deployer.address) : "no deployer"} tone={d.deployer?.low ? "bad" : "neutral"} />
      <Stat label="Solana repo · 7d" {...repoStat(solana.repo)} />
    </StatGrid>
  );
}

export function MintsTable({ devnet }: { devnet: Devnet }): React.JSX.Element {
  return (
    <Panel title="ESMS mints (devnet)" subtitle="Token-2022, non-transferable; supply read live">
      {devnet.mints.length === 0 ? (
        <Absent>No mints in the devnet manifest.</Absent>
      ) : (
        <table className="w-full text-xs">
          <thead className="text-[10px] uppercase tracking-wider text-gray-500">
            <tr><th scope="col" className="py-1 text-left">Token</th><th scope="col" className="py-1 text-right">Supply</th><th scope="col" className="py-1 text-right">Holders*</th><th scope="col" className="py-1 text-right">Mint</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {devnet.mints.map((m) => (
              <tr key={m.address}>
                <td className="py-1.5 font-semibold text-gray-800">{m.symbol}</td>
                <td className="py-1.5 text-right font-mono">{m.supply ?? "—"}</td>
                <td className="py-1.5 text-right font-mono">{m.holdersTop20 ?? "—"}</td>
                <td className="py-1.5 text-right font-mono"><ExternalLink href={m.explorerUrl}>{shortAddress(m.address)}</ExternalLink></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p className="mt-2 text-[10px] text-gray-500">*non-empty accounts among the 20 largest (RPC limit)</p>
    </Panel>
  );
}

/** Pool reserves are raw 4-decimal atoms. */
function atoms(raw: string): string {
  const n = Number(raw) / 10_000;
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export function PoolsTable({ devnet }: { devnet: Devnet }): React.JSX.Element {
  return (
    <Panel title="Constellation AMM pools (devnet)" subtitle="ConstellationPool accounts decoded live">
      {devnet.pools.length === 0 ? (
        <Absent>No pools decoded (none in the audit receipt, or the reads failed).</Absent>
      ) : (
        <table className="w-full text-xs">
          <thead className="text-[10px] uppercase tracking-wider text-gray-500">
            <tr><th scope="col" className="py-1 text-left">Pair</th><th scope="col" className="py-1 text-right">Reserve A</th><th scope="col" className="py-1 text-right">Reserve B</th><th scope="col" className="py-1 text-right">Fee</th><th scope="col" className="py-1 text-right">State</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {devnet.pools.map((p) => (
              <tr key={p.pda}>
                <td className="py-1.5"><ExternalLink href={p.explorerUrl}>{p.pair}</ExternalLink></td>
                <td className="py-1.5 text-right font-mono">{atoms(p.reserveA)}</td>
                <td className="py-1.5 text-right font-mono">{atoms(p.reserveB)}</td>
                <td className="py-1.5 text-right font-mono">{p.feeBps} bps</td>
                <td className="py-1.5 text-right">{p.paused ? <Pill tone="warn">paused</Pill> : <Pill tone={p.bootstrapped ? "ok" : "neutral"}>{p.bootstrapped ? "live" : "empty"}</Pill>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Panel>
  );
}

export function ProgramActivity({ devnet }: { devnet: Devnet }): React.JSX.Element {
  const recent = devnet.activity?.recent ?? [];
  return (
    <Panel title="Recent program transactions" subtitle="getSignaturesForAddress on the program id">
      {recent.length === 0 ? (
        <Absent>{devnet.activity ? "No transactions against the program yet." : "Signatures could not be read."}</Absent>
      ) : (
        <ul className="space-y-1 text-xs">
          {recent.map((t) => (
            <li key={t.signature} className="flex items-center justify-between gap-2">
              <ExternalLink href={t.explorerUrl}><span className="font-mono">{shortAddress(t.signature)}</span></ExternalLink>
              <span className="flex items-center gap-2">
                <span className="text-gray-500">{fmtAgo(t.at)}</span>
                <Pill tone={t.ok ? "ok" : "bad"}>{t.ok ? "ok" : "failed"}</Pill>
              </span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
