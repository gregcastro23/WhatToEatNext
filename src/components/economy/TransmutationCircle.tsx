"use client";

/**
 * The Transmutation Circle — peer-to-peer ESMS trading (ADR-018).
 *
 * Swapping converts your coins alone, at the index. Here you trade with a
 * fellow practitioner (human or agent): each of you sends the other the coin
 * that one lacks. The view is built to make the next trade easy to see:
 *
 *  - offers MADE TO YOU come first, then the ones that give what you lack for
 *    what you have to spare — each marked with its edge over the house swap;
 *  - your needs, and a one-tap suggested offer toward an even split;
 *  - a live fair-ask hint while you compose, and the ±corridor it must sit in;
 *  - the Circle bonus both humans earn for completing a trade.
 *
 * Every read goes through `readJson` + a drift-guarded schema.
 */

import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { readJson } from "@/lib/api/json";
import { revealPracticeReward } from "@/lib/economy/practiceClient";
import { tokenVisualFor } from "@/lib/economy/tokenVisual";
import { _logger } from "@/lib/logger";
import {
  TransmutationActionResponseSchema,
  TransmutationCircleResponseSchema,
  type TransmutationCircleView,
} from "@/lib/validation/transmutationResponseSchemas";
import { TOKEN_TYPES, type TokenType } from "@/types/economy";

type BoardOffer = TransmutationCircleView["board"][number];
type OwnOffer = TransmutationCircleView["mine"][number];

interface Draft {
  giveToken: TokenType;
  giveAmount: string;
  wantToken: TokenType;
  wantAmount: string;
  message: string;
  /** Set when countering someone's offer. */
  replyTo: { offerId: string; makerName: string } | null;
}

const EMPTY_DRAFT: Draft = {
  giveToken: "Spirit",
  giveAmount: "",
  wantToken: "Essence",
  wantAmount: "",
  message: "",
  replyTo: null,
};

const fmt = (n: number): string => Number(n.toFixed(4)).toString();

function Coin({ token, amount }: { token: TokenType; amount: number }): React.JSX.Element {
  const visual = tokenVisualFor(token);
  return (
    <span className="inline-flex items-center gap-1 font-mono tabular-nums">
      <span style={{ color: visual.color }}>{visual.glyph}</span>
      {fmt(amount)} <span className="text-white/60">{token}</span>
    </span>
  );
}

function EdgeBadge({ edge }: { edge: number | undefined }): React.JSX.Element | null {
  if (edge === undefined) return null;
  const tone =
    edge > 0.5 ? "text-green-300 border-green-400/30 bg-green-500/10"
      : edge < -0.5 ? "text-amber-300 border-amber-400/30 bg-amber-500/10"
        : "text-white/60 border-white/15 bg-white/5";
  const label = Math.abs(edge) <= 0.5 ? "at the index" : `${edge > 0 ? "+" : ""}${edge.toFixed(1)}% vs swap`;
  return <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono ${tone}`}>{label}</span>;
}

function TokenPicker({
  value,
  exclude,
  onChange,
  label,
}: {
  value: TokenType;
  exclude: TokenType;
  onChange: (t: TokenType) => void;
  label: string;
}): React.JSX.Element {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e): void => {
        const next = TOKEN_TYPES.find((t) => t === e.target.value);
        if (next) onChange(next);
      }}
      className="bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400/40"
    >
      {TOKEN_TYPES.filter((t) => t !== exclude).map((t) => (
        <option key={t} value={t} className="bg-slate-900">
          {tokenVisualFor(t).glyph} {t}
        </option>
      ))}
    </select>
  );
}

export function TransmutationCircle(): React.JSX.Element {
  const [circle, setCircle] = useState<TransmutationCircleView | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "signed_out" | "error">("loading");
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [busy, setBusy] = useState<string | null>(null);
  const [flash, setFlash] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const load = useCallback(async (): Promise<void> => {
    try {
      const res = await fetch("/api/economy/transmute", { credentials: "include" });
      if (res.status === 401) {
        setLoadState("signed_out");
        return;
      }
      if (!res.ok) {
        setLoadState("error");
        return;
      }
      const data = await readJson(res, { parse: (x) => TransmutationCircleResponseSchema.parse(x) });
      setCircle(data);
      setLoadState("ready");
    } catch (error) {
      _logger.warn("[TransmutationCircle] load failed:", error);
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    load().catch(() => undefined);
  }, [load]);

  const act = useCallback(
    async (key: string, body: Record<string, unknown>): Promise<boolean> => {
      setBusy(key);
      setFlash(null);
      try {
        const res = await fetch("/api/economy/transmute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(body),
        });
        const data = await readJson(res, { parse: (x) => TransmutationActionResponseSchema.parse(x) });
        if (!data.success) {
          setFlash({ kind: "error", text: data.message ?? "That didn't go through." });
          return false;
        }
        if (data.bonus) revealPracticeReward(data.bonus);
        setFlash({ kind: "ok", text: data.message ?? "Done." });
        await load();
        return true;
      } catch (error) {
        _logger.warn("[TransmutationCircle] action failed:", error);
        setFlash({ kind: "error", text: "Network error — nothing was exchanged." });
        return false;
      } finally {
        setBusy(null);
      }
    },
    [load],
  );

  // Live fair-ask for the draft, from the same index the server judges by.
  const prices = circle?.market.prices ?? null;
  const corridorPct = circle?.market.corridorPct ?? 25;
  const giveAmount = Number.parseFloat(draft.giveAmount) || 0;
  const wantAmount = Number.parseFloat(draft.wantAmount) || 0;
  const hint = useMemo(() => {
    if (!prices || giveAmount <= 0) return null;
    const giveValue = giveAmount * prices[draft.giveToken];
    const fairAsk = giveValue / prices[draft.wantToken];
    if (wantAmount <= 0) return { fairAsk, edge: null, inCorridor: true };
    const ratio = giveValue / (wantAmount * prices[draft.wantToken]);
    const limit = 1 + corridorPct / 100;
    return { fairAsk, edge: (ratio - 1) * 100, inCorridor: ratio <= limit && ratio >= 1 / limit };
  }, [prices, giveAmount, wantAmount, draft.giveToken, draft.wantToken, corridorPct]);

  const setGive = (giveToken: TokenType): void =>
    setDraft((d) => ({ ...d, giveToken, wantToken: d.wantToken === giveToken ? d.giveToken : d.wantToken }));
  const setWant = (wantToken: TokenType): void =>
    setDraft((d) => ({ ...d, wantToken, giveToken: d.giveToken === wantToken ? d.wantToken : d.giveToken }));

  const counter = (offer: BoardOffer): void => {
    // Reverse the terms at their fair value, addressed back to the maker.
    const fairGive = prices ? (offer.giveAmount * prices[offer.giveToken]) / prices[offer.wantToken] : offer.wantAmount;
    setDraft({
      giveToken: offer.wantToken,
      giveAmount: fmt(fairGive),
      wantToken: offer.giveToken,
      wantAmount: fmt(offer.giveAmount),
      message: "",
      replyTo: { offerId: offer.id, makerName: offer.maker.name },
    });
    setFlash(null);
  };

  const submitOffer = async (): Promise<void> => {
    const ok = await act("offer", {
      action: "offer",
      giveToken: draft.giveToken,
      giveAmount,
      wantToken: draft.wantToken,
      wantAmount,
      ...(draft.message.trim() ? { message: draft.message.trim() } : {}),
      ...(draft.replyTo ? { replyToOfferId: draft.replyTo.offerId } : {}),
      idempotencyKey: crypto.randomUUID(),
    });
    if (ok) setDraft(EMPTY_DRAFT);
  };

  if (loadState === "loading") {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }
  if (loadState === "signed_out") {
    return (
      <div className="glass-card-premium rounded-3xl p-8 text-center border-white/8">
        <h2 className="text-lg font-black text-white">The Transmutation Circle</h2>
        <p className="text-white/60 text-sm mt-2 max-w-md mx-auto">
          Trade coins with fellow practitioners — each of you sends the other the coin they lack,
          and both earn Essence for completing the exchange.
        </p>
        <Link href="/login" className="inline-block mt-6 px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-[0.3em]">
          Sign in to trade
        </Link>
      </div>
    );
  }
  if (loadState === "error" || !circle) {
    return (
      <div className="glass-card-premium rounded-3xl p-8 text-center border-white/8">
        <p className="text-white/70 text-sm">The Circle could not be read right now.</p>
        <button
          onClick={(): void => { setLoadState("loading"); load().catch(() => undefined); }}
          className="mt-4 px-4 py-2 rounded-xl border border-white/15 text-white/80 text-xs uppercase tracking-widest"
        >
          Try again
        </button>
      </div>
    );
  }

  const incoming = circle.board.filter((o) => o.directedToYou);
  const open = circle.board.filter((o) => !o.directedToYou);
  const canPost = giveAmount > 0 && wantAmount > 0 && circle.market.live && (hint?.inCorridor ?? false) && busy === null;

  return (
    <div className="space-y-6">
      {/* ── Header: what this is, and that it is alive ─────────────────── */}
      <section className="glass-card-premium rounded-3xl p-6 border-white/8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-white">⚗️ The Transmutation Circle</h2>
            <p className="text-white/60 text-sm mt-1 max-w-xl">
              Swap alone at the index, or trade here: each practitioner sends the other the coin they lack.
              Completing a trade earns you both <Coin token={circle.bonus.tokenType} amount={circle.bonus.baseAmount} /> —
              once per partner each day.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px] font-mono">
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">
              {circle.pulse.trades24h} trades today
            </span>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">
              {circle.pulse.openOffers} open offers
            </span>
            <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-400/20 text-purple-200">
              you: {circle.stats.trades} trades · {circle.stats.partners} partners
            </span>
          </div>
        </div>
        {!circle.market.live && (
          <p className="mt-3 text-xs text-amber-300/80">
            Live index rates are unavailable, so fair terms can&apos;t be checked — posting and filling are paused.
          </p>
        )}
      </section>

      {flash && (
        <div className={`rounded-2xl p-3 text-xs ${flash.kind === "ok" ? "bg-green-500/10 text-green-300 border border-green-500/20" : "bg-red-500/10 text-red-300 border border-red-500/20"}`}>
          {flash.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── Compose ─────────────────────────────────────────────────── */}
        <section className="min-w-0 lg:col-span-2 space-y-4">
          {circle.needs && circle.needs.lacking.length > 0 && (
            <div className="glass-card-premium rounded-3xl p-5 border-white/8">
              <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-2">Your balance</h3>
              <p className="text-sm text-white/70">
                You&apos;re short on{" "}
                {circle.needs.lacking.map((t) => `${tokenVisualFor(t).glyph} ${t}`).join(", ")}
                {circle.needs.surplus.length > 0 && (
                  <> and have {circle.needs.surplus.map((t) => `${tokenVisualFor(t).glyph} ${t}`).join(", ")} to spare</>
                )}.
              </p>
              {circle.suggestion && (
                <button
                  onClick={(): void => {
                    const s = circle.suggestion;
                    if (!s) return;
                    setDraft({ ...EMPTY_DRAFT, giveToken: s.giveToken, giveAmount: fmt(s.giveAmount), wantToken: s.wantToken, wantAmount: fmt(s.wantAmount) });
                  }}
                  className="mt-3 w-full text-left text-xs px-3 py-2 rounded-xl border border-purple-400/25 bg-purple-500/10 text-purple-100 hover:bg-purple-500/20"
                >
                  Suggested: offer <Coin token={circle.suggestion.giveToken} amount={circle.suggestion.giveAmount} /> for{" "}
                  <Coin token={circle.suggestion.wantToken} amount={circle.suggestion.wantAmount} />
                </button>
              )}
            </div>
          )}

          <div className="glass-card-premium rounded-3xl p-5 border-white/8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">
                {draft.replyTo ? `Counter ${draft.replyTo.makerName}` : "Make an offer"}
              </h3>
              {draft.replyTo && (
                <button onClick={(): void => setDraft(EMPTY_DRAFT)} className="text-[10px] text-white/50 hover:text-white/80 uppercase tracking-widest">
                  clear
                </button>
              )}
            </div>
            <label htmlFor="transmute-give-amount" className="block text-[10px] uppercase tracking-widest text-white/40 font-bold">You give</label>
            <div className="mt-1 flex gap-2">
              <input
                id="transmute-give-amount"
                type="number" min={0} step={0.01} inputMode="decimal" value={draft.giveAmount}
                onChange={(e): void => setDraft((d) => ({ ...d, giveAmount: e.target.value }))}
                className="flex-1 min-w-0 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white font-mono tabular-nums focus:outline-none focus:border-purple-400/40"
              />
              <TokenPicker label="Coin you give" value={draft.giveToken} exclude={draft.wantToken} onChange={setGive} />
            </div>
            <label htmlFor="transmute-want-amount" className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mt-4">You want</label>
            <div className="mt-1 flex gap-2">
              <input
                id="transmute-want-amount"
                type="number" min={0} step={0.01} inputMode="decimal" value={draft.wantAmount}
                onChange={(e): void => setDraft((d) => ({ ...d, wantAmount: e.target.value }))}
                className="flex-1 min-w-0 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white font-mono tabular-nums focus:outline-none focus:border-purple-400/40"
              />
              <TokenPicker label="Coin you want" value={draft.wantToken} exclude={draft.giveToken} onChange={setWant} />
            </div>

            {hint && (
              <div className="mt-3 text-xs space-y-1">
                <p className="text-white/55">
                  Fair ask at the index: <span className="font-mono text-white/80">{fmt(hint.fairAsk)} {draft.wantToken}</span>{" "}
                  <button
                    onClick={(): void => setDraft((d) => ({ ...d, wantAmount: fmt(hint.fairAsk) }))}
                    className="underline decoration-dotted text-purple-300 hover:text-purple-200"
                  >
                    use it
                  </button>
                </p>
                {hint.edge !== null && (
                  <p className={hint.inCorridor ? "text-white/55" : "text-red-300"}>
                    {hint.inCorridor
                      ? hint.edge > 0.5
                        ? `Takers get ${hint.edge.toFixed(1)}% more than a swap — generous offers fill faster.`
                        : hint.edge < -0.5
                          ? `You're asking a ${(-hint.edge).toFixed(1)}% premium over the index.`
                          : "Right at the index."
                      : `Outside the fair corridor (±${corridorPct}% of the index) — adjust the amounts.`}
                  </p>
                )}
              </div>
            )}

            <input
              type="text" maxLength={280} value={draft.message} placeholder="A note to the Circle (optional)"
              aria-label="A note to the Circle"
              onChange={(e): void => setDraft((d) => ({ ...d, message: e.target.value }))}
              className="mt-4 w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400/40"
            />
            <button
              onClick={(): void => { submitOffer().catch(() => undefined); }}
              disabled={!canPost}
              className="mt-4 w-full px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:bg-white/10 disabled:text-white/40 text-white font-black text-xs uppercase tracking-[0.3em]"
            >
              {busy === "offer" ? "Posting…" : draft.replyTo ? "Send counter-offer" : "Post to the Circle"}
            </button>
          </div>
        </section>

        {/* ── The board ───────────────────────────────────────────────── */}
        <section className="min-w-0 lg:col-span-3 space-y-4">
          {incoming.length > 0 && (
            <OfferList title="Made to you" offers={incoming} busy={busy}
              onAccept={(o): void => { act(`accept:${o.id}`, { action: "accept", offerId: o.id }).catch(() => undefined); }}
              onDecline={(o): void => { act(`decline:${o.id}`, { action: "decline", offerId: o.id }).catch(() => undefined); }}
              onCounter={counter} live={circle.market.live} />
          )}
          <OfferList title="Open in the Circle" offers={open} busy={busy}
            onAccept={(o): void => { act(`accept:${o.id}`, { action: "accept", offerId: o.id }).catch(() => undefined); }}
            onCounter={counter} live={circle.market.live}
            empty="No open offers yet — post the first one." />
          <MyOffers offers={circle.mine} busy={busy}
            onCancel={(o): void => { act(`cancel:${o.id}`, { action: "cancel", offerId: o.id }).catch(() => undefined); }} />
        </section>
      </div>
    </div>
  );
}

function OfferList({
  title,
  offers,
  busy,
  live,
  onAccept,
  onDecline,
  onCounter,
  empty,
}: {
  title: string;
  offers: BoardOffer[];
  busy: string | null;
  live: boolean;
  onAccept: (offer: BoardOffer) => void;
  onDecline?: (offer: BoardOffer) => void;
  onCounter: (offer: BoardOffer) => void;
  empty?: string;
}): React.JSX.Element {
  return (
    <div className="glass-card-premium rounded-3xl p-5 border-white/8">
      <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-3">{title}</h3>
      {offers.length === 0 ? (
        <p className="text-sm text-white/40">{empty ?? "Nothing here."}</p>
      ) : (
        <ul className="space-y-2">
          {offers.map((offer) => (
            <li key={offer.id} className="rounded-2xl border border-white/8 bg-white/[0.02] p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm text-white/85">
                  <span className="font-semibold">{offer.maker.name}</span>
                  {offer.maker.isAgent && <span className="ml-1 text-[10px] text-white/40">🤖</span>}{" "}
                  <span className="text-white/50">gives</span> <Coin token={offer.giveToken} amount={offer.giveAmount} />{" "}
                  <span className="text-white/50">for</span> <Coin token={offer.wantToken} amount={offer.wantAmount} />
                </div>
                <div className="flex items-center gap-2">
                  {offer.complementsYou && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-sky-400/30 bg-sky-500/10 text-sky-200">what you need</span>
                  )}
                  <EdgeBadge edge={offer.market?.takerEdgePct} />
                </div>
              </div>
              {offer.message && <p className="mt-1 text-xs text-white/50 italic">“{offer.message}”</p>}
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  onClick={(): void => onAccept(offer)}
                  disabled={!offer.youCanFill || !live || busy !== null}
                  title={offer.youCanFill ? undefined : `You need ${fmt(offer.wantAmount)} ${offer.wantToken}`}
                  className="px-3 py-1.5 rounded-xl bg-green-600/80 hover:bg-green-500 disabled:bg-white/10 disabled:text-white/40 text-white text-[11px] font-bold uppercase tracking-widest"
                >
                  {busy === `accept:${offer.id}` ? "Trading…" : "Accept"}
                </button>
                <button
                  onClick={(): void => onCounter(offer)}
                  className="px-3 py-1.5 rounded-xl border border-white/15 hover:border-white/30 text-white/80 text-[11px] font-bold uppercase tracking-widest"
                >
                  Counter
                </button>
                {onDecline && (
                  <button
                    onClick={(): void => onDecline(offer)}
                    disabled={busy !== null}
                    className="px-3 py-1.5 rounded-xl border border-white/10 text-white/50 hover:text-white/80 text-[11px] font-bold uppercase tracking-widest"
                  >
                    Decline
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MyOffers({
  offers,
  busy,
  onCancel,
}: {
  offers: OwnOffer[];
  busy: string | null;
  onCancel: (offer: OwnOffer) => void;
}): React.JSX.Element | null {
  if (offers.length === 0) return null;
  return (
    <div className="glass-card-premium rounded-3xl p-5 border-white/8">
      <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-3">Your offers</h3>
      <ul className="space-y-2">
        {offers.map((offer) => (
          <li key={offer.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/8 bg-white/[0.02] p-3 text-sm">
            <span className="text-white/80">
              <Coin token={offer.giveToken} amount={offer.giveAmount} /> <span className="text-white/40">for</span>{" "}
              <Coin token={offer.wantToken} amount={offer.wantAmount} />
              {offer.counterparty && <span className="text-white/40"> · to {offer.counterparty.name}</span>}
            </span>
            <span className="flex items-center gap-2 text-[11px]">
              {offer.status === "open" ? (
                <>
                  {!offer.funded && <span className="text-amber-300">your balance no longer covers it</span>}
                  <button
                    onClick={(): void => onCancel(offer)}
                    disabled={busy !== null}
                    className="px-3 py-1 rounded-xl border border-white/15 text-white/70 hover:text-white uppercase tracking-widest font-bold"
                  >
                    {busy === `cancel:${offer.id}` ? "…" : "Withdraw"}
                  </button>
                </>
              ) : (
                <span className="text-white/50 uppercase tracking-widest">
                  {offer.status}
                  {offer.taker ? ` · by ${offer.taker.name}` : ""}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
