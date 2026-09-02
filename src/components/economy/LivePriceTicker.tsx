"use client";

/**
 * LivePriceTicker — the Elemental Exchange Index on screen (ADR-011 §7).
 *
 * Two variants:
 *   - "ribbon": a marquee strip (homepage, under the hero)
 *   - "cards":  four quote cards with sparklines (the Bazaar)
 *
 * Client discipline, each point answering an audited defect in the sibling
 * prototype:
 *   - ONE module-level store + ONE jittered poll shared by every mounted
 *     instance — two variants on a page can never show different quotes.
 *     Jitter re-rolled every tick (the /feed precedent) so public tabs don't
 *     converge into lockstep against the API.
 *   - AbortController + sequence guard: a superseded response can never
 *     overwrite a newer one.
 *   - Honest states: loading renders a skeleton, failure renders an explicit
 *     OFFLINE panel, a failed refresh over old data renders a STALE chip.
 *     There is no fallback dataset anywhere in this file.
 *   - The marquee's duplicate copy is aria-hidden; the whole strip collapses
 *     to a static scrollable row under prefers-reduced-motion; digits use
 *     tabular-nums.
 *   - On-chain affordances render ONLY from configured rails (Solana SPL
 *     mirror gate); nothing is linked when nothing is deployed.
 */

import Link from "next/link";
import React from "react";
import type {
  PriceIndexApiPayload,
  TokenIndexQuote,
} from "@/lib/economy/priceIndex";
import { TOKEN_VISUALS, tokenVisualFor } from "@/lib/economy/tokenVisual";
import {
  ESMS_SPL_UTILITY,
  esmsSplCluster,
  esmsSplExplorerUrl,
  esmsSplMintAddress,
  esmsSplMirrorEnabled,
} from "@/lib/esms-chain/solanaMirror";

// ─── Shared store: one poll loop for every mounted ticker ─────────────────

type TickerStatus = "loading" | "live" | "stale" | "offline";

interface TickerSnapshot {
  payload: PriceIndexApiPayload | null;
  status: TickerStatus;
  lastUpdatedMs: number | null;
  error: string | null;
}

const INITIAL_SNAPSHOT: TickerSnapshot = {
  payload: null,
  status: "loading",
  lastUpdatedMs: null,
  error: null,
};

const BASE_POLL_MS = 45_000;
const POLL_JITTER_MS = 15_000;
const MAX_POLL_MS = 300_000;

let snapshot: TickerSnapshot = INITIAL_SNAPSHOT;
const listeners = new Set<() => void>();
let timer: number | null = null;
let controller: AbortController | null = null;
let fetchSeq = 0;
let currentIntervalMs = BASE_POLL_MS;

function emit(next: TickerSnapshot): void {
  snapshot = next;
  for (const listener of listeners) listener();
}

function scheduleNext(): void {
  if (listeners.size === 0) return;
  if (timer !== null) window.clearTimeout(timer);
  // Fresh jitter every tick so clients don't re-converge over time.
  const delay = currentIntervalMs + Math.floor(Math.random() * POLL_JITTER_MS);
  timer = window.setTimeout(() => {
    // poll() handles its own errors; .catch keeps that guarantee local if it
    // ever grows a throwing path.
    poll().catch(() => undefined);
  }, delay);
}

async function poll(): Promise<void> {
  if (typeof document !== "undefined" && document.hidden) {
    // Don't burn requests in a hidden tab; visibilitychange resumes us.
    scheduleNext();
    return;
  }
  const seq = ++fetchSeq;
  controller?.abort();
  controller = new AbortController();
  try {
    const res = await fetch("/api/economy/price-index", {
      cache: "no-store",
      signal: controller.signal,
    });
    const json = (await res.json()) as Partial<PriceIndexApiPayload> & {
      message?: string;
    };
    if (seq !== fetchSeq) return; // superseded by a newer request
    if (res.ok && json.success === true && json.live === true) {
      currentIntervalMs = BASE_POLL_MS;
      emit({
        payload: json as PriceIndexApiPayload,
        status: "live",
        lastUpdatedMs: Date.now(),
        error: null,
      });
    } else {
      currentIntervalMs = Math.min(currentIntervalMs * 2, MAX_POLL_MS);
      emit({
        ...snapshot,
        status: snapshot.payload ? "stale" : "offline",
        error: json.message ?? `HTTP ${res.status}`,
      });
    }
  } catch (error) {
    if (seq !== fetchSeq) return;
    if (error instanceof DOMException && error.name === "AbortError") return;
    currentIntervalMs = Math.min(currentIntervalMs * 2, MAX_POLL_MS);
    emit({
      ...snapshot,
      status: snapshot.payload ? "stale" : "offline",
      error: "Network unreachable",
    });
  } finally {
    if (seq === fetchSeq) scheduleNext();
  }
}

function onVisibilityChange(): void {
  if (document.hidden) return;
  const age = snapshot.lastUpdatedMs ? Date.now() - snapshot.lastUpdatedMs : Infinity;
  if (snapshot.status !== "live" || age > BASE_POLL_MS) refreshNow();
}

function start(): void {
  currentIntervalMs = BASE_POLL_MS;
  document.addEventListener("visibilitychange", onVisibilityChange);
  poll().catch(() => undefined);
}

function stop(): void {
  document.removeEventListener("visibilitychange", onVisibilityChange);
  if (timer !== null) window.clearTimeout(timer);
  timer = null;
  controller?.abort();
  controller = null;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1) start();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) stop();
  };
}

function refreshNow(): void {
  if (timer !== null) window.clearTimeout(timer);
  currentIntervalMs = BASE_POLL_MS;
  poll().catch(() => undefined);
}

function useTickerSnapshot(): TickerSnapshot {
  return React.useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => INITIAL_SNAPSHOT,
  );
}

// ─── Formatting ────────────────────────────────────────────────────────────

const fmtIndex = (value: number): string => value.toFixed(4);

function fmtChange(pct: number): { text: string; dir: "up" | "down" | "flat" } {
  if (pct > 0) return { text: `▲ ${pct.toFixed(2)}%`, dir: "up" };
  if (pct < 0) return { text: `▼ ${Math.abs(pct).toFixed(2)}%`, dir: "down" };
  return { text: "· 0.00%", dir: "flat" };
}

const fmtUsd = (value: number): string => `$${value.toFixed(4)}`;

const shortAddress = (addr: string): string =>
  `${addr.slice(0, 4)}…${addr.slice(-4)}`;

// ─── Sparkline ─────────────────────────────────────────────────────────────

function Sparkline({ values, color }: { values: number[]; color: string }): React.JSX.Element {
  const gradientId = React.useId();
  const w = 120;
  const h = 34;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - 4 - ((v - min) / span) * (h - 8);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width="100%"
      height={h}
      role="img"
      aria-label={`24 hour trend from ${fmtIndex(values[0] ?? 0)} to ${fmtIndex(values[values.length - 1] ?? 0)}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${h} ${points} ${w},${h}`}
        fill={`url(#${gradientId})`}
        stroke="none"
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

// ─── Shared bits ───────────────────────────────────────────────────────────

function StatusChip({ status }: { status: TickerStatus }): React.JSX.Element {
  const label =
    status === "live"
      ? "LIVE"
      : status === "stale"
        ? "STALE"
        : status === "offline"
          ? "OFFLINE"
          : "SYNCING";
  return (
    <span className={`epx-chip epx-chip-${status}`}>
      <span className="epx-dot" aria-hidden="true" />
      {label}
    </span>
  );
}

function railsLine(payload: PriceIndexApiPayload): string | null {
  const { mintPerTokenUsd, redeemPerTokenUsd } = payload.railsUsd;
  const parts: string[] = [];
  if (mintPerTokenUsd !== null) parts.push(`mint ${fmtUsd(mintPerTokenUsd)}`);
  if (redeemPerTokenUsd !== null)
    parts.push(`redeem ${fmtUsd(redeemPerTokenUsd)} food value`);
  return parts.length > 0 ? parts.join(" · ") : null;
}

// ─── Ribbon ────────────────────────────────────────────────────────────────

function RibbonItems({ payload }: { payload: PriceIndexApiPayload }): React.JSX.Element {
  const rails = railsLine(payload);
  return (
    <>
      <span className="epx-cell epx-lead">
        <span className="epx-title">ELEMENTAL EXCHANGE</span>
        <span className="epx-meta">
          A {payload.aNumber.toFixed(1)} · ×{payload.multiplier.toFixed(4)} ·{" "}
          {payload.isDiurnal ? "diurnal" : "nocturnal"} sky
        </span>
      </span>
      {payload.tokens.map((quote) => {
        const visual = tokenVisualFor(quote.token);
        const change = fmtChange(quote.change24hPct);
        return (
          <span className="epx-cell" key={quote.token}>
            <span className="epx-glyph" style={{ color: visual.color }} aria-hidden="true">
              {visual.glyph}
            </span>
            <span className="epx-sym">{quote.token.toUpperCase()}</span>
            <span className="epx-num">{fmtIndex(quote.index)}</span>
            <span className={`epx-delta epx-${change.dir}`}>{change.text}</span>
          </span>
        );
      })}
      {rails ? <span className="epx-cell epx-rails">{rails}</span> : null}
      <span className="epx-cell epx-meta">
        Season of {payload.sunSign || "—"} · {payload.dominantElement} dominant
      </span>
    </>
  );
}

function Ribbon({ data }: { data: TickerSnapshot }): React.JSX.Element {
  const { payload, status } = data;
  if (!payload) {
    return (
      <div className="epx-bar" role="status">
        <StatusChip status={status} />
        <span className="epx-meta">
          {status === "offline"
            ? "Price oracle offline — no quotes."
            : "Consulting the sky…"}
        </span>
        {status === "offline" ? (
          <button type="button" className="epx-retry" onClick={refreshNow}>
            Retry
          </button>
        ) : null}
      </div>
    );
  }
  return (
    <div className="epx-bar">
      <StatusChip status={status} />
      <div className="epx-marquee">
        <div className="epx-track">
          <div className="epx-run">
            <RibbonItems payload={payload} />
          </div>
          {/* Second copy only completes the scroll illusion. */}
          <div className="epx-run" aria-hidden="true">
            <RibbonItems payload={payload} />
          </div>
        </div>
      </div>
      <Link href="/shop" className="epx-open">
        Bazaar →
      </Link>
    </div>
  );
}

// ─── Cards ─────────────────────────────────────────────────────────────────

function QuoteCard({ quote }: { quote: TokenIndexQuote }): React.JSX.Element {
  const visual = tokenVisualFor(quote.token);
  const change = fmtChange(quote.change24hPct);
  const splEnabled = esmsSplMirrorEnabled();
  const mint = splEnabled ? esmsSplMintAddress(visual.key) : undefined;
  return (
    <article className="epx-card" aria-label={`${quote.token} index quote`}>
      <header className="epx-card-head">
        <span className="epx-glyph epx-glyph-lg" style={{ color: visual.color }} aria-hidden="true">
          {visual.glyph}
        </span>
        <span className="epx-card-name">{quote.token}</span>
        <span className="epx-card-weight" title="Share of the current sky's ESMS output">
          {(quote.weight * 100).toFixed(1)}%
        </span>
      </header>
      <div className="epx-card-quote">
        <span className="epx-num epx-num-lg">{fmtIndex(quote.index)}</span>
        <span className={`epx-delta epx-${change.dir}`}>{change.text}</span>
      </div>
      <Sparkline values={quote.sparkline} color={visual.color} />
      {mint ? (
        <a
          className="epx-mint"
          href={esmsSplExplorerUrl(mint)}
          target="_blank"
          rel="noreferrer"
          title={`${ESMS_SPL_UTILITY.disclosure} Mint: ${mint}`}
        >
          SPL {shortAddress(mint)} ↗
        </a>
      ) : null}
    </article>
  );
}

/**
 * Is the supply block present AND live?
 *
 * `PriceIndexApiPayload` declares `supply` non-optional, so `payload.supply?.live`
 * reads as provably-dead code — but this object came off the wire, where an
 * older or partial response can omit it entirely, and reading `.live` off
 * `undefined` throws in the render path. Validating an `unknown` keeps the
 * check real: unlike an optional-typed local, it cannot be narrowed away by
 * control-flow analysis.
 */
function isSupplyLive(supply: unknown): boolean {
  return (
    typeof supply === "object" &&
    supply !== null &&
    (supply as { live?: unknown }).live === true
  );
}

function Cards({ data }: { data: TickerSnapshot }): React.JSX.Element {
  const { payload, status } = data;
  if (!payload) {
    return (
      <div className="epx-cards-empty" role="status">
        <StatusChip status={status} />
        <p className="epx-meta">
          {status === "offline"
            ? "The price oracle is offline. No quotes are shown while the position engine is unreachable."
            : "Consulting the sky…"}
        </p>
        {status === "offline" ? (
          <button type="button" className="epx-retry" onClick={refreshNow}>
            Retry
          </button>
        ) : null}
      </div>
    );
  }

  const rails = railsLine(payload);
  const splEnabled = esmsSplMirrorEnabled();
  const supplyLive = isSupplyLive(payload.supply);

  return (
    <div>
      <div className="epx-cards-head">
        <StatusChip status={status} />
        <span className="epx-meta">
          Composite {fmtIndex(payload.compositeIndex)}{" "}
          <span className={`epx-delta epx-${fmtChange(payload.composite24hPct).dir}`}>
            {fmtChange(payload.composite24hPct).text}
          </span>{" "}
          · A {payload.aNumber.toFixed(1)} · ×{payload.multiplier.toFixed(4)} ·{" "}
          {payload.isDiurnal ? "diurnal" : "nocturnal"}
        </span>
        {payload.degraded ? (
          <span className="epx-chip epx-chip-stale" title={payload.degraded.join(", ")}>
            DEGRADED
          </span>
        ) : null}
      </div>
      <div className="epx-grid">
        {payload.tokens.map((quote) => (
          <QuoteCard key={quote.token} quote={quote} />
        ))}
      </div>
      <div className="epx-foot">
        {rails ? <span>{rails}</span> : <span>No USD rail configured.</span>}
        {supplyLive ? (
          // "ledger", not "circulating": this is the off-chain balance table.
          // The SPL mirror has its own on-chain supply, which this is NOT —
          // with a Solana chip beside it, an unqualified label would conflate
          // two different quantities (ADR-011 §6).
          <span title="Off-chain ESMS ledger balances — not the SPL mints' on-chain supply">
            ledger supply{" "}
            {TOKEN_VISUALS.map((v) => (
              <span key={v.key} className="epx-supply" style={{ color: v.color }}>
                {v.glyph} {Math.round(payload.supply[v.key]).toLocaleString()}
              </span>
            ))}
          </span>
        ) : null}
        {splEnabled ? (
          <span title={`${ESMS_SPL_UTILITY.disclosure} Supply monitoring is read-only; WTEN holds no Solana signer.`}>
            SPL mirror · {esmsSplCluster()}
          </span>
        ) : null}
        <span className="epx-basis" title={payload.basis.engine}>
          {payload.basis.model}
        </span>
      </div>
    </div>
  );
}

// ─── Public component ──────────────────────────────────────────────────────

export default function LivePriceTicker({
  variant,
}: {
  variant: "ribbon" | "cards";
}): React.JSX.Element {
  const data = useTickerSnapshot();
  return (
    <section
      className={`epx-root epx-${variant}`}
      aria-label="Elemental Exchange Index"
    >
      {variant === "ribbon" ? <Ribbon data={data} /> : <Cards data={data} />}
      <style>{`
        .epx-root { font-family: var(--font-body, inherit); color: var(--fg, #e8e4f2); }
        .epx-num, .epx-delta, .epx-meta, .epx-sym, .epx-supply, .epx-mint {
          font-family: var(--font-mono, ui-monospace, monospace);
          font-variant-numeric: tabular-nums;
        }
        .epx-meta { font-size: 11px; color: var(--fg-mute, #6e6884); }
        .epx-chip {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 10px; letter-spacing: 0.08em;
          padding: 2px 8px; border-radius: 999px;
          border: 1px solid var(--line-hi, rgba(255,255,255,0.14));
          white-space: nowrap;
        }
        .epx-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
        .epx-chip-live { color: #34d399; border-color: rgba(52,211,153,0.4); }
        .epx-chip-stale { color: #fbbf24; border-color: rgba(251,191,36,0.4); }
        .epx-chip-offline { color: #f87171; border-color: rgba(248,113,113,0.4); }
        .epx-chip-loading { color: var(--fg-mute, #6e6884); }
        .epx-retry {
          background: none; border: 1px solid rgba(139,92,246,0.4); color: inherit;
          border-radius: 8px; padding: 3px 10px; font-size: 11px; cursor: pointer;
        }
        .epx-up { color: #34d399; }
        .epx-down { color: #f87171; }
        .epx-flat { color: var(--fg-mute, #6e6884); }

        /* ── ribbon ── */
        .epx-bar {
          display: flex; align-items: center; gap: 12px;
          border: 1px solid rgba(139,92,246,0.15);
          background: rgba(18,16,26,0.45);
          backdrop-filter: blur(16px);
          border-radius: 12px; padding: 8px 12px;
          overflow: hidden;
        }
        .epx-marquee { flex: 1; overflow: hidden; min-width: 0; }
        .epx-track { display: flex; width: max-content; animation: epx-scroll 45s linear infinite; }
        .epx-bar:hover .epx-track, .epx-bar:focus-within .epx-track { animation-play-state: paused; }
        .epx-run { display: flex; align-items: center; }
        .epx-cell { display: inline-flex; align-items: baseline; gap: 6px; padding: 0 18px; white-space: nowrap; font-size: 12px; }
        .epx-lead { flex-direction: column; align-items: flex-start; gap: 0; }
        .epx-title { font-size: 10px; letter-spacing: 0.14em; color: var(--accent-2, #d3a15f); }
        .epx-glyph { font-size: 14px; }
        .epx-glyph-lg { font-size: 20px; }
        .epx-sym { font-size: 10px; letter-spacing: 0.1em; color: var(--fg-dim, #b5adcc); }
        .epx-num { font-size: 13px; }
        .epx-num-lg { font-size: 24px; }
        .epx-delta { font-size: 11px; }
        .epx-rails { color: var(--fg-dim, #b5adcc); }
        .epx-open { font-size: 11px; white-space: nowrap; color: var(--accent, #a78bfa); text-decoration: none; }
        .epx-open:hover { text-decoration: underline; }
        @keyframes epx-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @media (prefers-reduced-motion: reduce) {
          .epx-track { animation: none; width: auto; }
          .epx-marquee { overflow-x: auto; }
          .epx-run[aria-hidden="true"] { display: none; }
        }

        /* ── cards ── */
        .epx-cards-head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 12px; }
        .epx-cards-empty {
          display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
          border: 1px dashed rgba(139,92,246,0.3); border-radius: 12px; padding: 16px;
        }
        .epx-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
        .epx-card {
          border: 1px solid rgba(139,92,246,0.15);
          background: rgba(18,16,26,0.45);
          backdrop-filter: blur(16px);
          border-radius: 14px; padding: 12px 14px;
          display: flex; flex-direction: column; gap: 8px;
        }
        .epx-card-head { display: flex; align-items: center; gap: 8px; }
        .epx-card-name { font-size: 13px; letter-spacing: 0.04em; }
        .epx-card-weight { margin-left: auto; font-size: 11px; color: var(--fg-mute, #6e6884); }
        .epx-card-quote { display: flex; align-items: baseline; gap: 10px; }
        .epx-mint { font-size: 10px; color: var(--fg-dim, #b5adcc); text-decoration: none; }
        .epx-mint:hover { text-decoration: underline; }
        .epx-foot {
          display: flex; flex-wrap: wrap; gap: 8px 18px; align-items: baseline;
          margin-top: 12px; font-size: 11px; color: var(--fg-mute, #6e6884);
          font-family: var(--font-mono, ui-monospace, monospace);
        }
        .epx-supply { margin-left: 8px; }
        .epx-basis { margin-left: auto; opacity: 0.7; }
      `}</style>
    </section>
  );
}
