"use client";

/**
 * Base (Sepolia) — the ESMS rail that users actually claim to today.
 *
 * @file src/app/admin/chain/_components/BaseSections.tsx
 */

import React from "react";
import { fmtAgo, fmtInt, shortAddress } from "@/components/admin/live/format";
import { Absent, ExternalLink, Panel, Pill, Stat, StatGrid, type Tone } from "@/components/admin/live/primitives";
import type { BaseView } from "@/lib/admin/schemas/chain";

function claimTotal(b: BaseView): string | null {
  const t = b.claims.totals;
  if (!t) return null;
  return fmtInt(t.spirit + t.essence + t.matter + t.substance);
}

function pendingStat(base: BaseView): { value: string | null; sub: string; tone: Tone } {
  if (base.claims.status !== "live") return { value: null, sub: `claims ledger: ${base.claims.status}`, tone: "neutral" };
  const pending = base.claims.byStatus.pending ?? 0;
  const hours = base.claims.oldestPendingHours;
  return {
    value: fmtInt(pending),
    sub: hours === null ? "none stuck" : `oldest ${hours.toFixed(1)}h`,
    tone: pending > 0 ? "warn" : "ok",
  };
}

export function BaseKpis({ base }: { base: BaseView }): React.JSX.Element {
  const live = base.claims.status === "live";
  return (
    <StatGrid>
      <Stat label={base.chain} value={base.reachable ? "reachable" : "down"} sub={base.blockNumber ? `block ${Number(base.blockNumber).toLocaleString("en-US")}` : (base.error ?? "")} tone={base.reachable ? "ok" : "bad"} />
      <Stat label="Claims minted" value={live ? fmtInt(base.claims.byStatus.minted ?? 0) : null} sub={live ? `${fmtInt(base.claims.last30d)} claims in 30d` : `claims ledger: ${base.claims.status}`} />
      <Stat label="Claims pending" {...pendingStat(base)} />
      <Stat label="ESMS moved on-chain" value={claimTotal(base)} sub="sum of all four tokens across minted claims" />
      <Stat label="Recipe NFTs" value={base.recipeMints.status === "live" ? fmtInt(base.recipeMints.byStatus.minted ?? 0) : null} sub={base.recipeNftEnabled ? `minting enabled · ${base.recipeMints.last30d} requests 30d` : "minting disabled"} />
    </StatGrid>
  );
}

export function OperatorWallets({ base }: { base: BaseView }): React.JSX.Element {
  return (
    <Panel title="Operator wallets" subtitle="gas for server-signed mints and burns (addresses derived from the configured keys)">
      <table className="w-full text-xs">
        <thead className="text-[10px] uppercase tracking-wider text-gray-500">
          <tr><th scope="col" className="py-1 text-left">Role</th><th scope="col" className="py-1 text-left">Address</th><th scope="col" className="py-1 text-right">ETH</th><th scope="col" className="py-1 text-right">Status</th></tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {base.wallets.map((w) => (
            <tr key={w.role}>
              <td className="py-1.5 font-semibold text-gray-800">{w.role}</td>
              <td className="py-1.5 font-mono">{w.address ? <ExternalLink href={`${base.explorer}/address/${w.address}`}>{shortAddress(w.address)}</ExternalLink> : "—"}</td>
              <td className="py-1.5 text-right font-mono">{w.eth === null ? "—" : w.eth.toFixed(5)}</td>
              <td className="py-1.5 text-right">
                {!w.configured ? <Pill tone="neutral">not configured</Pill> : <Pill tone={w.low ? "bad" : "ok"}>{w.low ? "refill" : "funded"}</Pill>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-[10px] text-gray-500">
        ESMS contract {base.esmsContract ? <ExternalLink href={`${base.explorer}/address/${base.esmsContract}`}>{shortAddress(base.esmsContract)}</ExternalLink> : "not configured"} · chain id {base.chainId}
      </p>
    </Panel>
  );
}

const CLAIM_TONE: Record<string, Tone> = { minted: "ok", pending: "warn", refunded: "neutral" };

export function RecentClaims({ base }: { base: BaseView }): React.JSX.Element {
  const { claims } = base;
  return (
    <Panel title="Recent on-chain claims" subtitle="esms_onchain_claims, newest first">
      {claims.status !== "live" && <Absent>Claims ledger unavailable ({claims.status}).</Absent>}
      {claims.status === "live" && claims.recent.length === 0 && <p className="text-xs text-gray-500">No claims yet.</p>}
      {claims.recent.length > 0 && (
        <ul className="space-y-1 text-xs">
          {claims.recent.map((c) => (
            <li key={`${c.at}-${c.txHash ?? c.status}`} className="flex items-center justify-between gap-2">
              <span className="text-gray-500">{fmtAgo(c.at)}</span>
              {c.txHash ? <ExternalLink href={`${base.explorer}/tx/${c.txHash}`}><span className="font-mono">{shortAddress(c.txHash)}</span></ExternalLink> : <span className="text-gray-400">no tx</span>}
              <Pill tone={CLAIM_TONE[c.status] ?? "neutral"}>{c.status}</Pill>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
