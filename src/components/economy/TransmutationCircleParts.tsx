"use client";

/**
 * Presentational pieces of the Transmutation Circle view: coins, badges, the
 * header, the needs card, and the offer lists. Stateless — every act is a
 * callback owned by `TransmutationCircle`.
 */

import React from "react";
import { tokenVisualFor } from "@/lib/economy/tokenVisual";
import type { TransmutationCircleView } from "@/lib/validation/transmutationResponseSchemas";
import type { TokenType } from "@/types/economy";

export type BoardOffer = TransmutationCircleView["board"][number];
export type OwnOffer = TransmutationCircleView["mine"][number];
export type Terms = NonNullable<TransmutationCircleView["suggestion"]>;

export const fmt = (n: number): string => Number(n.toFixed(4)).toString();

export function Coin({ token, amount }: { token: TokenType; amount: number }): React.JSX.Element {
  const visual = tokenVisualFor(token);
  return (
    <span className="inline-flex items-center gap-1 font-mono tabular-nums">
      <span style={{ color: visual.color }}>{visual.glyph}</span>
      {fmt(amount)} <span className="text-white/60">{token}</span>
    </span>
  );
}

function edgeTone(edge: number): string {
  if (edge > 0.5) return "text-green-300 border-green-400/30 bg-green-500/10";
  if (edge < -0.5) return "text-amber-300 border-amber-400/30 bg-amber-500/10";
  return "text-white/60 border-white/15 bg-white/5";
}

export function EdgeBadge({ edge }: { edge: number | undefined }): React.JSX.Element | null {
  if (edge === undefined) return null;
  const label = Math.abs(edge) <= 0.5 ? "at the index" : `${edge > 0 ? "+" : ""}${edge.toFixed(1)}% vs swap`;
  return <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono ${edgeTone(edge)}`}>{label}</span>;
}

const coinList = (tokens: TokenType[]): string => tokens.map((t) => `${tokenVisualFor(t).glyph} ${t}`).join(", ");

export function CircleHeader({ circle }: { circle: TransmutationCircleView }): React.JSX.Element {
  return (
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
  );
}

export function NeedsCard({
  needs,
  suggestion,
  onSuggest,
}: {
  needs: TransmutationCircleView["needs"];
  suggestion: Terms | null;
  onSuggest: (terms: Terms) => void;
}): React.JSX.Element | null {
  if (!needs || needs.lacking.length === 0) return null;
  return (
    <div className="glass-card-premium rounded-3xl p-5 border-white/8">
      <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-2">Your balance</h3>
      <p className="text-sm text-white/70">
        You&apos;re short on {coinList(needs.lacking)}
        {needs.surplus.length > 0 && <> and have {coinList(needs.surplus)} to spare</>}.
      </p>
      {suggestion && (
        <button
          onClick={(): void => onSuggest(suggestion)}
          className="mt-3 w-full text-left text-xs px-3 py-2 rounded-xl border border-purple-400/25 bg-purple-500/10 text-purple-100 hover:bg-purple-500/20"
        >
          Suggested: offer <Coin token={suggestion.giveToken} amount={suggestion.giveAmount} /> for{" "}
          <Coin token={suggestion.wantToken} amount={suggestion.wantAmount} />
        </button>
      )}
    </div>
  );
}

const ACT_BUTTON = "px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-widest";

function OfferRow({
  offer,
  busy,
  live,
  onAccept,
  onDecline,
  onCounter,
}: {
  offer: BoardOffer;
  busy: string | null;
  live: boolean;
  onAccept: (offer: BoardOffer) => void;
  onDecline: ((offer: BoardOffer) => void) | null;
  onCounter: (offer: BoardOffer) => void;
}): React.JSX.Element {
  return (
    <li className="rounded-2xl border border-white/8 bg-white/[0.02] p-3">
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
          className={`${ACT_BUTTON} bg-green-600/80 hover:bg-green-500 disabled:bg-white/10 disabled:text-white/40 text-white`}
        >
          {busy === `accept:${offer.id}` ? "Trading…" : "Accept"}
        </button>
        <button onClick={(): void => onCounter(offer)} className={`${ACT_BUTTON} border border-white/15 hover:border-white/30 text-white/80`}>
          Counter
        </button>
        {onDecline && (
          <button
            onClick={(): void => onDecline(offer)}
            disabled={busy !== null}
            className={`${ACT_BUTTON} border border-white/10 text-white/50 hover:text-white/80`}
          >
            Decline
          </button>
        )}
      </div>
    </li>
  );
}

export function OfferList(props: {
  title: string;
  offers: BoardOffer[];
  busy: string | null;
  live: boolean;
  onAccept: (offer: BoardOffer) => void;
  onDecline: ((offer: BoardOffer) => void) | null;
  onCounter: (offer: BoardOffer) => void;
  empty: string;
}): React.JSX.Element {
  return (
    <div className="glass-card-premium rounded-3xl p-5 border-white/8">
      <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-3">{props.title}</h3>
      {props.offers.length === 0 ? (
        <p className="text-sm text-white/40">{props.empty}</p>
      ) : (
        <ul className="space-y-2">
          {props.offers.map((offer) => (
            <OfferRow key={offer.id} offer={offer} busy={props.busy} live={props.live}
              onAccept={props.onAccept} onDecline={props.onDecline} onCounter={props.onCounter} />
          ))}
        </ul>
      )}
    </div>
  );
}

function OwnOfferStatus({
  offer,
  busy,
  onCancel,
}: {
  offer: OwnOffer;
  busy: string | null;
  onCancel: (offer: OwnOffer) => void;
}): React.JSX.Element {
  if (offer.status !== "open") {
    return (
      <span className="text-white/50 uppercase tracking-widest">
        {offer.status}
        {offer.taker ? ` · by ${offer.taker.name}` : ""}
      </span>
    );
  }
  return (
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
  );
}

export function MyOffers({
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
              <OwnOfferStatus offer={offer} busy={busy} onCancel={onCancel} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
