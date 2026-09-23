"use client";

/**
 * The top of /admin: one live headline number per source, each linking to
 * its detail page. Reads GET /api/admin/pulse every 30s. A section whose
 * source failed renders an em-dash with the reason, never a zero.
 *
 * @file src/components/admin/PulseStrip.tsx
 */

import React from "react";
import { fmtAgo, fmtDelta, fmtInt, fmtMoneyList, shortSha } from "@/components/admin/live/format";
import { Pill, Stat } from "@/components/admin/live/primitives";
import { useAdminResource } from "@/components/admin/live/useAdminResource";
import { PulseSchema, type PulseView } from "@/lib/admin/schemas/growth";

function TrafficTiles({ t }: { t: PulseView["traffic"] }): React.JSX.Element {
  const live = t?.status === "live";
  const reason = t ? `page_views: ${t.status}` : "traffic read failed";
  return (
    <>
      <Stat href="/admin/traffic" label="On site now" value={live ? fmtInt(t.activeNow) : null} sub={live ? `last visit ${fmtAgo(t.lastVisitAt)}` : reason} tone={live && t.activeNow > 0 ? "ok" : "neutral"} />
      <Stat href="/admin/traffic" label="Page views · 24h" value={live ? fmtInt(t.pageviews24h) : null} sub={live ? `${fmtInt(t.visitors24h)} visitors · ${fmtDelta(t.pageviews24h, t.pageviewsPrev24h) ?? "new"} vs prior 24h` : reason} />
    </>
  );
}

function GrowthTiles({ g }: { g: PulseView["growth"] }): React.JSX.Element {
  return (
    <>
      <Stat href="/admin/growth" label="Humans" value={g ? fmtInt(g.humans) : null} sub={g ? `+${g.signupsToday} today · +${g.signups7d} this week` : "growth read failed"} tone="info" />
      <Stat href="/admin/growth" label="Active humans" value={g ? `${g.dau} / ${g.wau} / ${g.mau}` : null} sub="daily / weekly / monthly" />
    </>
  );
}

function RevenueTiles({ r }: { r: PulseView["revenue"] }): React.JSX.Element {
  const sub = r ? `${r.mode === "test" ? "TEST MODE · " : ""}${r.activeSubscriptions ?? "?"} paying subs` : "Stripe read failed";
  return (
    <>
      <Stat href="/admin/revenue" label="MRR" value={r?.mrr ? fmtMoneyList(r.mrr) : null} sub={sub} tone={r?.mode === "test" ? "warn" : "info"} />
      <Stat href="/admin/revenue" label="Net · 30d" value={r?.net30d ? fmtMoneyList(r.net30d) : null} sub={r?.available ? `available ${fmtMoneyList(r.available)}` : "balance unread"} tone={r?.webhookStatus === "incident" ? "bad" : "neutral"} />
    </>
  );
}

function CodeTiles({ c }: { c: PulseView["code"] }): React.JSX.Element {
  const warnings = c?.eslintWarnings ?? null;
  return (
    <>
      <Stat href="/admin/code-health" label="ESLint warnings" value={warnings === null ? null : fmtInt(warnings)} sub={c?.readingSha ? `tsc ${c.tscErrors ?? "?"} errors · ${shortSha(c.readingSha)}` : "awaiting first CI reading"} tone={warnings === 0 ? "ok" : "neutral"} />
      <Stat href="/admin/code-health" label="Tracked lint debt" value={c?.trackedDebt == null ? null : fmtInt(c.trackedDebt)} sub={c?.ciConclusion ? `master CI: ${c.ciConclusion}` : "CI unread"} tone={c?.ciConclusion === "success" ? "ok" : "warn"} />
    </>
  );
}

function ChainTiles({ s, b }: { s: PulseView["solana"]; b: PulseView["base"] }): React.JSX.Element {
  const solanaSub = s ? `${s.txs7d ?? "?"} program txs 7d · mainnet ${s.mainnetProgramDeployed ? "deployed" : (s.mainnetStatus ?? "not deployed")}` : "Solana read failed";
  return (
    <>
      <Stat href="/admin/chain" label="Solana devnet" value={s ? (s.devnetReachable ? `last tx ${fmtAgo(s.lastTxAt)}` : "RPC down") : null} sub={solanaSub} tone={s?.deployerLow || s?.paused ? "warn" : "info"} />
      <Stat href="/admin/chain" label={b?.chain ?? "Base"} value={b?.minterEth == null ? null : `${b.minterEth.toFixed(4)} ETH`} sub={b ? `minter gas · ${b.claimsPending ?? "?"} claims pending` : "Base read failed"} tone={b?.minterLow ? "bad" : "neutral"} />
    </>
  );
}

function PulseHeader({ data, error }: { data: PulseView | null; error: string | null }): React.JSX.Element {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
      <h2 className="text-lg font-bold text-gray-800">Pulse</h2>
      <div className="flex items-center gap-2 text-[11px] font-mono text-gray-500">
        {data?.deploy.sha && <span title={data.deploy.message ?? ""}>deployed {shortSha(data.deploy.sha)}</span>}
        {data && data.errors.length > 0 && <Pill tone="warn" title={data.errors.join("\n")}>{data.errors.length} source(s) failed</Pill>}
        {error && <Pill tone="bad" title={error}>refresh failed</Pill>}
      </div>
    </div>
  );
}

export default function PulseStrip(): React.JSX.Element {
  const { data, error } = useAdminResource("/api/admin/pulse", PulseSchema, 30_000);
  return (
    <section aria-label="Live pulse">
      <PulseHeader data={data} error={error} />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <TrafficTiles t={data?.traffic ?? null} />
        <GrowthTiles g={data?.growth ?? null} />
        <RevenueTiles r={data?.revenue ?? null} />
        <CodeTiles c={data?.code ?? null} />
        <ChainTiles s={data?.solana ?? null} b={data?.base ?? null} />
      </div>
    </section>
  );
}
