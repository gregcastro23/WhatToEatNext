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
 * This component owns the state and the acts; the pieces it draws live in
 * `TransmutationCircleParts.tsx` and `TransmutationComposer.tsx`. Every read
 * goes through `readJson` + a drift-guarded schema.
 */

import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import { readJson } from "@/lib/api/json";
import { revealPracticeReward } from "@/lib/economy/practiceClient";
import { _logger } from "@/lib/logger";
import {
  TransmutationActionResponseSchema,
  TransmutationCircleResponseSchema,
  type TransmutationCircleView,
} from "@/lib/validation/transmutationResponseSchemas";
import {
  CircleHeader,
  MyOffers,
  NeedsCard,
  OfferList,
  fmt,
  type BoardOffer,
  type Terms,
} from "./TransmutationCircleParts";
import { EMPTY_DRAFT, TransmutationComposer, amountOf, type Draft } from "./TransmutationComposer";

type LoadState = "loading" | "ready" | "signed_out" | "error";
type Flash = { kind: "ok" | "error"; text: string } | null;

const ENDPOINT = "/api/economy/transmute";

function CircleStatus({ state, onRetry }: { state: LoadState; onRetry: () => void }): React.JSX.Element {
  if (state === "loading") {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }
  if (state === "signed_out") {
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
  return (
    <div className="glass-card-premium rounded-3xl p-8 text-center border-white/8">
      <p className="text-white/70 text-sm">The Circle could not be read right now.</p>
      <button onClick={onRetry} className="mt-4 px-4 py-2 rounded-xl border border-white/15 text-white/80 text-xs uppercase tracking-widest">
        Try again
      </button>
    </div>
  );
}

function FlashBanner({ flash }: { flash: Flash }): React.JSX.Element | null {
  if (!flash) return null;
  const tone =
    flash.kind === "ok"
      ? "bg-green-500/10 text-green-300 border border-green-500/20"
      : "bg-red-500/10 text-red-300 border border-red-500/20";
  return <div className={`rounded-2xl p-3 text-xs ${tone}`}>{flash.text}</div>;
}

/** Reverse an offer's terms at their fair value, addressed back to its maker. */
function counterDraft(offer: BoardOffer, prices: TransmutationCircleView["market"]["prices"]): Draft {
  const fairGive = prices ? (offer.giveAmount * prices[offer.giveToken]) / prices[offer.wantToken] : offer.wantAmount;
  return {
    giveToken: offer.wantToken,
    giveAmount: fmt(fairGive),
    wantToken: offer.giveToken,
    wantAmount: fmt(offer.giveAmount),
    message: "",
    replyTo: { offerId: offer.id, makerName: offer.maker.name },
  };
}

function offerBody(draft: Draft): Record<string, unknown> {
  const message = draft.message.trim();
  return {
    action: "offer",
    giveToken: draft.giveToken,
    giveAmount: amountOf(draft.giveAmount),
    wantToken: draft.wantToken,
    wantAmount: amountOf(draft.wantAmount),
    ...(message ? { message } : {}),
    ...(draft.replyTo ? { replyToOfferId: draft.replyTo.offerId } : {}),
    idempotencyKey: crypto.randomUUID(),
  };
}

export function TransmutationCircle(): React.JSX.Element {
  const [circle, setCircle] = useState<TransmutationCircleView | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [busy, setBusy] = useState<string | null>(null);
  const [flash, setFlash] = useState<Flash>(null);

  const load = useCallback(async (): Promise<void> => {
    try {
      const res = await fetch(ENDPOINT, { credentials: "include" });
      if (res.status === 401) return setLoadState("signed_out");
      if (!res.ok) return setLoadState("error");
      setCircle(await readJson(res, { parse: (x) => TransmutationCircleResponseSchema.parse(x) }));
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
        const res = await fetch(ENDPOINT, {
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

  if (loadState !== "ready" || !circle) {
    return (
      <CircleStatus
        state={loadState === "ready" ? "error" : loadState}
        onRetry={(): void => {
          setLoadState("loading");
          load().catch(() => undefined);
        }}
      />
    );
  }

  const fire = (key: string, body: Record<string, unknown>): void => {
    act(key, body).catch(() => undefined);
  };
  const accept = (o: BoardOffer): void => fire(`accept:${o.id}`, { action: "accept", offerId: o.id });
  const counter = (o: BoardOffer): void => {
    setDraft(counterDraft(o, circle.market.prices));
    setFlash(null);
  };
  const suggest = (s: Terms): void =>
    setDraft({ ...EMPTY_DRAFT, giveToken: s.giveToken, giveAmount: fmt(s.giveAmount), wantToken: s.wantToken, wantAmount: fmt(s.wantAmount) });
  const submit = (): void => {
    act("offer", offerBody(draft))
      .then((ok) => {
        if (ok) setDraft(EMPTY_DRAFT);
      })
      .catch(() => undefined);
  };
  const incoming = circle.board.filter((o) => o.directedToYou);
  const open = circle.board.filter((o) => !o.directedToYou);

  return (
    <div className="space-y-6">
      <CircleHeader circle={circle} />
      <FlashBanner flash={flash} />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <section className="min-w-0 lg:col-span-2 space-y-4">
          <NeedsCard needs={circle.needs} suggestion={circle.suggestion} onSuggest={suggest} />
          <TransmutationComposer draft={draft} setDraft={setDraft} prices={circle.market.prices}
            corridorPct={circle.market.corridorPct} live={circle.market.live} busy={busy} onSubmit={submit} />
        </section>
        <section className="min-w-0 lg:col-span-3 space-y-4">
          {incoming.length > 0 && (
            <OfferList title="Made to you" offers={incoming} busy={busy} live={circle.market.live} empty=""
              onAccept={accept} onCounter={counter}
              onDecline={(o): void => fire(`decline:${o.id}`, { action: "decline", offerId: o.id })} />
          )}
          <OfferList title="Open in the Circle" offers={open} busy={busy} live={circle.market.live}
            onAccept={accept} onCounter={counter} onDecline={null}
            empty="No open offers yet — post the first one." />
          <MyOffers offers={circle.mine} busy={busy}
            onCancel={(o): void => fire(`cancel:${o.id}`, { action: "cancel", offerId: o.id })} />
        </section>
      </div>
    </div>
  );
}
