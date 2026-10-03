/**
 * Transmutation Circle — the fill, and what follows it.
 *
 * ── A fill is one transaction ───────────────────────────────────────────────
 *
 *   lock the offer row            (two takers racing serialize here)
 *   lock BOTH balance rows        (user-id order: fills cannot deadlock)
 *   re-check both sides can pay   (no escrow, so this is where it's decided)
 *   maker −give, taker −want, maker +want, taker +give   (4 `transmutation` rows)
 *   mark the offer filled         (guarded on status = 'open')
 *
 * All four ledger rows share one transaction group and carry the offer id as
 * source_id. Any failure after the first write throws and rolls the whole fill
 * back; a refusal (someone can no longer pay) writes nothing.
 *
 * ── After the commit ────────────────────────────────────────────────────────
 *
 * The Circle bonus, the maker's bell and the feed event run only once the trade
 * has committed, and none of them can undo it.
 *
 * @file src/services/transmutationFill.ts
 */

import { randomUUID } from "node:crypto";
import { executeQuery, withTransaction } from "@/lib/database";
import {
  BONUS_MIN_TRADE_VALUE,
  canCoverGive,
  canFill,
  type Holdings,
  type OfferMarket,
} from "@/lib/economy/transmutationMarket";
import { feedDatabase } from "@/services/feedDatabaseService";
import { notificationDatabase } from "@/services/notificationDatabaseService";
import { practiceRewardService } from "@/services/practiceRewardService";
import { creditTokensSql, debitTokensSql } from "@/services/tokenEconomyQueries";
import * as sql from "@/services/transmutationQueries";
import {
  holdingsOf,
  isExpired,
  isRevealed,
  parseOffer,
  partyOf,
  text,
  type OfferRecord,
  type Participant,
  type StoredStatus,
} from "@/services/transmutationRecords";
import { coins, quietly } from "@/services/transmutationViews";
import type { TransmutationTrade } from "@/types/transmutation";

export type FillOutcome =
  | { kind: "gone" }
  | { kind: "closed"; status: StoredStatus }
  | { kind: "expired" }
  | { kind: "maker_short" }
  | { kind: "taker_short" }
  | { kind: "filled"; offer: OfferRecord; transactionGroupId: string };

interface Built { sql: string; values: unknown[] }

/** The four balance moves of one fill, in the order they are written. */
function fillLegs(offer: OfferRecord, takerId: string, transactionGroupId: string): Built[] {
  const tag = `Transmutation Circle (offer ${offer.id.slice(0, 8)})`;
  const common = { sourceType: "transmutation", sourceId: offer.id, transactionGroupId };
  return [
    debitTokensSql({
      ...common,
      userId: offer.makerId,
      tokenType: offer.giveToken,
      amount: offer.giveAmount,
      description: `${tag}: gave ${coins(offer.giveAmount, offer.giveToken)}`,
    }),
    debitTokensSql({
      ...common,
      userId: takerId,
      tokenType: offer.wantToken,
      amount: offer.wantAmount,
      description: `${tag}: gave ${coins(offer.wantAmount, offer.wantToken)}`,
    }),
    creditTokensSql({
      ...common,
      userId: offer.makerId,
      tokenType: offer.wantToken,
      amount: offer.wantAmount,
      description: `${tag}: received ${coins(offer.wantAmount, offer.wantToken)}`,
      idempotencyKey: `transmute_fill:${offer.id}:maker:${offer.wantToken}`,
    }),
    creditTokensSql({
      ...common,
      userId: takerId,
      tokenType: offer.giveToken,
      amount: offer.giveAmount,
      description: `${tag}: received ${coins(offer.giveAmount, offer.giveToken)}`,
      idempotencyKey: `transmute_fill:${offer.id}:taker:${offer.giveToken}`,
    }),
  ];
}

/** Fill an offer: both wallets move in one transaction, or neither does. */
export async function fillOfferAtomically(offerId: string, takerId: string): Promise<FillOutcome> {
  return withTransaction(async (client): Promise<FillOutcome> => {
    const run = async (built: Built) => (await executeQuery(built.sql, built.values, { client })).rows;

    const [lockedRow] = await run(sql.lockOfferSql(offerId));
    if (!lockedRow) return { kind: "gone" };
    const locked = parseOffer(lockedRow);
    if (locked.status !== "open") return { kind: "closed", status: locked.status };
    if (isExpired(locked)) return { kind: "expired" };

    const wallets = await run(sql.lockPairBalancesSql(locked.makerId, takerId));
    const walletOf = (userId: string): Holdings | null => {
      const wallet = wallets.find((w) => text(w.user_id) === userId);
      return wallet ? holdingsOf(wallet) : null;
    };
    const makerWallet = walletOf(locked.makerId);
    const takerWallet = walletOf(takerId);
    if (!makerWallet || !canCoverGive(locked, makerWallet)) return { kind: "maker_short" };
    if (!takerWallet || !canFill(locked, takerWallet)) return { kind: "taker_short" };

    const transactionGroupId = randomUUID();
    for (const leg of fillLegs(locked, takerId, transactionGroupId)) {
      const [moved] = await run(leg);
      // Both rows are locked and both sides were checked, so a leg that moves
      // nothing is a bug. Throwing is what undoes the legs already written.
      if (!moved) throw new Error("transmutation: a fill leg moved no balance; rolling back");
    }

    const [filledRow] = await run(sql.fillOfferSql({ offerId, takerId, transactionGroupId }));
    if (!filledRow) throw new Error("transmutation: offer closed mid-fill; rolling back");
    return { kind: "filled", offer: parseOffer(filledRow), transactionGroupId };
  });
}

export function tradeOf(filled: OfferRecord, transactionGroupId: string): TransmutationTrade {
  return {
    gave: { tokenType: filled.wantToken, amount: filled.wantAmount },
    received: { tokenType: filled.giveToken, amount: filled.giveAmount },
    transactionGroupId,
  };
}

export type TradeBonus = { tokenType: string; amount: number; hint: string } | null;

/**
 * After a committed fill: the Circle bonus for each human party (once per
 * partner per day, never for dust, never for agents), the maker's bell, and the
 * trade on the feed. Returns the taker's bonus for their delight toast.
 */
export async function celebrateFill(args: {
  filled: OfferRecord;
  trade: TransmutationTrade;
  market: OfferMarket;
  maker: Participant;
  taker: Participant;
}): Promise<TradeBonus> {
  const { filled, trade, market, maker, taker } = args;
  const earnsBonus = Math.min(market.giveValue, market.wantValue) >= BONUS_MIN_TRADE_VALUE;

  let bonus: TradeBonus = null;
  if (earnsBonus && !taker.isAgent) {
    const result = await practiceRewardService.recognize(taker.id, "transmutation_shared", maker.id);
    if (result.rewarded && result.tokenType && result.amount && result.hint) {
      bonus = { tokenType: result.tokenType, amount: result.amount, hint: result.hint };
    }
  }
  if (earnsBonus && !maker.isAgent) {
    await practiceRewardService.recognize(maker.id, "transmutation_shared", taker.id);
  }

  if (!maker.isAgent) {
    await quietly("fill notification", () =>
      notificationDatabase.createNotification(
        maker.id,
        "transmutation_accepted",
        "Your offer was filled",
        `${partyOf(taker).name} traded with you: you gave ${coins(filled.giveAmount, filled.giveToken)} ` +
          `and received ${coins(filled.wantAmount, filled.wantToken)}`,
        {
          ...(isRevealed(taker) ? { relatedUserId: taker.id } : {}),
          metadata: { offerId: filled.id, transactionGroupId: trade.transactionGroupId },
        },
      ),
    );
  }

  await quietly("trade feed event", () =>
    feedDatabase.createEvent(taker.id, "transmutation_trade", {
      offerId: filled.id,
      gaveToken: trade.gave.tokenType,
      gaveAmount: trade.gave.amount,
      receivedToken: trade.received.tokenType,
      receivedAmount: trade.received.amount,
      partnerName: partyOf(maker).name,
      partnerIsAgent: maker.isAgent,
    }),
  );
  return bonus;
}
