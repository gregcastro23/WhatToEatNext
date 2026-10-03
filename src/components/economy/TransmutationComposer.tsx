"use client";

/**
 * The Transmutation Circle's offer form: what you give, what you want, a live
 * fair-ask hint from the same index the server judges by, and the corridor the
 * terms must sit in before the post button enables.
 */

import React, { useMemo } from "react";
import { tokenVisualFor } from "@/lib/economy/tokenVisual";
import { TOKEN_TYPES, type TokenType } from "@/types/economy";
import { fmt } from "./TransmutationCircleParts";

export interface Draft {
  giveToken: TokenType;
  giveAmount: string;
  wantToken: TokenType;
  wantAmount: string;
  message: string;
  /** Set when countering someone's offer. */
  replyTo: { offerId: string; makerName: string } | null;
}

export const EMPTY_DRAFT: Draft = {
  giveToken: "Spirit",
  giveAmount: "",
  wantToken: "Essence",
  wantAmount: "",
  message: "",
  replyTo: null,
};

type Prices = Record<TokenType, number>;

interface FairHint {
  fairAsk: number;
  /** % more the taker receives than a swap would give; null until both amounts are set. */
  edge: number | null;
  inCorridor: boolean;
}

export const amountOf = (raw: string): number => Number.parseFloat(raw) || 0;

/** The same corridor rule the server applies, for the live hint. */
export function fairHint(draft: Draft, prices: Prices | null, corridorPct: number): FairHint | null {
  const give = amountOf(draft.giveAmount);
  if (!prices || give <= 0) return null;
  const giveValue = give * prices[draft.giveToken];
  const fairAsk = giveValue / prices[draft.wantToken];
  const want = amountOf(draft.wantAmount);
  if (want <= 0) return { fairAsk, edge: null, inCorridor: true };
  const ratio = giveValue / (want * prices[draft.wantToken]);
  const limit = 1 + corridorPct / 100;
  return { fairAsk, edge: (ratio - 1) * 100, inCorridor: ratio <= limit && ratio >= 1 / limit };
}

function edgeSentence(hint: FairHint, corridorPct: number): string | null {
  if (hint.edge === null) return null;
  if (!hint.inCorridor) return `Outside the fair corridor (±${corridorPct}% of the index) — adjust the amounts.`;
  if (hint.edge > 0.5) return `Takers get ${hint.edge.toFixed(1)}% more than a swap — generous offers fill faster.`;
  if (hint.edge < -0.5) return `You're asking a ${(-hint.edge).toFixed(1)}% premium over the index.`;
  return "Right at the index.";
}

const FIELD = "bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-400/40";

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
      className={`${FIELD} text-sm`}
    >
      {TOKEN_TYPES.filter((t) => t !== exclude).map((t) => (
        <option key={t} value={t} className="bg-slate-900">
          {tokenVisualFor(t).glyph} {t}
        </option>
      ))}
    </select>
  );
}

function AmountRow({
  id,
  first,
  label,
  amount,
  token,
  exclude,
  onAmount,
  onToken,
}: {
  id: string;
  /** The first row sits flush under the heading. */
  first: boolean;
  label: string;
  amount: string;
  token: TokenType;
  exclude: TokenType;
  onAmount: (value: string) => void;
  onToken: (token: TokenType) => void;
}): React.JSX.Element {
  return (
    <>
      <label htmlFor={id} className={`block text-[10px] uppercase tracking-widest text-white/40 font-bold ${first ? "" : "mt-4"}`}>
        {label}
      </label>
      <div className="mt-1 flex gap-2">
        <input
          id={id}
          type="number" min={0} step={0.01} inputMode="decimal" value={amount}
          onChange={(e): void => onAmount(e.target.value)}
          className={`${FIELD} flex-1 min-w-0 font-mono tabular-nums`}
        />
        <TokenPicker label={`Coin: ${label.toLowerCase()}`} value={token} exclude={exclude} onChange={onToken} />
      </div>
    </>
  );
}

export function TransmutationComposer({
  draft,
  setDraft,
  prices,
  corridorPct,
  live,
  busy,
  onSubmit,
}: {
  draft: Draft;
  setDraft: React.Dispatch<React.SetStateAction<Draft>>;
  prices: Prices | null;
  corridorPct: number;
  live: boolean;
  busy: string | null;
  onSubmit: () => void;
}): React.JSX.Element {
  const hint = useMemo(() => fairHint(draft, prices, corridorPct), [draft, prices, corridorPct]);
  const canPost =
    amountOf(draft.giveAmount) > 0 && amountOf(draft.wantAmount) > 0 && live && (hint?.inCorridor ?? false) && busy === null;
  const sentence = hint ? edgeSentence(hint, corridorPct) : null;
  // Picking the coin already on the other side swaps the two.
  const setGive = (giveToken: TokenType): void =>
    setDraft((d) => ({ ...d, giveToken, wantToken: d.wantToken === giveToken ? d.giveToken : d.wantToken }));
  const setWant = (wantToken: TokenType): void =>
    setDraft((d) => ({ ...d, wantToken, giveToken: d.giveToken === wantToken ? d.wantToken : d.giveToken }));

  return (
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
      <AmountRow id="transmute-give-amount" first label="You give" amount={draft.giveAmount} token={draft.giveToken}
        exclude={draft.wantToken} onAmount={(giveAmount): void => setDraft((d) => ({ ...d, giveAmount }))} onToken={setGive} />
      <AmountRow id="transmute-want-amount" first={false} label="You want" amount={draft.wantAmount} token={draft.wantToken}
        exclude={draft.giveToken} onAmount={(wantAmount): void => setDraft((d) => ({ ...d, wantAmount }))} onToken={setWant} />

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
          {sentence && <p className={hint.inCorridor ? "text-white/55" : "text-red-300"}>{sentence}</p>}
        </div>
      )}

      <input
        type="text" maxLength={280} value={draft.message} placeholder="A note to the Circle (optional)"
        aria-label="A note to the Circle"
        onChange={(e): void => setDraft((d) => ({ ...d, message: e.target.value }))}
        className={`${FIELD} mt-4 w-full text-sm`}
      />
      <button
        onClick={onSubmit}
        disabled={!canPost}
        className="mt-4 w-full px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:bg-white/10 disabled:text-white/40 text-white font-black text-xs uppercase tracking-[0.3em]"
      >
        {busy === "offer" ? "Posting…" : draft.replyTo ? "Send counter-offer" : "Post to the Circle"}
      </button>
    </div>
  );
}
