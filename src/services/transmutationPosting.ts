/**
 * Transmutation Circle — posting an offer, step by step: who it is addressed
 * to, whether it may be posted (fair terms at the live index, a maker who can
 * cover it now, room under the cap), and how it is announced.
 *
 * @file src/services/transmutationPosting.ts
 */

import type { OracleQuote } from "@/lib/economy/priceIndex";
import {
  CORRIDOR,
  MAX_OPEN_OFFERS_PER_MAKER,
  assessOffer,
  canCoverGive,
  type OfferMarket,
  type OfferTerms,
} from "@/lib/economy/transmutationMarket";
import { feedDatabase } from "@/services/feedDatabaseService";
import { notificationDatabase } from "@/services/notificationDatabaseService";
import { tokenEconomy } from "@/services/TokenEconomyService";
import * as sql from "@/services/transmutationQueries";
import {
  CONCEALED_NAME,
  amountOf,
  holdingsFromBalances,
  isBlockedPair,
  isRevealed,
  loadOffer,
  loadParticipant,
  loadParticipantByEmail,
  parseOffer,
  partyOf,
  rowsOf,
  type OfferRecord,
  type Participant,
} from "@/services/transmutationRecords";
import { RATES_UNAVAILABLE_MESSAGE, coins, fail, liveQuote, quietly } from "@/services/transmutationViews";
import type { TransmutationFailure } from "@/types/transmutation";

/** Who a directed offer is for: a practitioner id, or (agents, over S2S) an email. */
export type CounterpartyRef = { id: string } | { email: string };

export interface Addressee { ok: true; counterparty: Participant | null; replyToOfferId: string | null }

/** Who, if anyone, the offer is addressed to — and whether they may receive it. */
export async function resolveAddressee(
  makerId: string,
  input: { counterparty?: CounterpartyRef | null; replyToOfferId?: string | null },
): Promise<Addressee | TransmutationFailure> {
  let counterparty: Participant | null = null;
  let replyToOfferId: string | null = null;
  if (input.replyToOfferId) {
    const replyTo = await loadOffer(input.replyToOfferId);
    // An offer directed at someone else is invisible to this maker: same answer as absent.
    if (!replyTo || (replyTo.counterpartyId !== null && replyTo.counterpartyId !== makerId)) {
      return fail("offer_not_found", "The offer you are countering no longer exists.");
    }
    if (replyTo.makerId === makerId) return fail("invalid_offer", "You cannot counter your own offer.");
    counterparty = await loadParticipant(replyTo.makerId);
    replyToOfferId = replyTo.id;
  } else if (input.counterparty) {
    counterparty =
      "id" in input.counterparty
        ? await loadParticipant(input.counterparty.id)
        : await loadParticipantByEmail(input.counterparty.email);
  }

  const directed = Boolean(input.replyToOfferId ?? input.counterparty);
  if (directed && !counterparty) {
    return fail("counterparty_not_found", "No practitioner by that name is in the Circle.");
  }
  if (counterparty?.id === makerId) return fail("invalid_offer", "You cannot make an offer to yourself.");
  if (counterparty && (await isBlockedPair(makerId, counterparty.id))) {
    return fail("counterparty_unavailable", "You cannot make an offer to this practitioner.");
  }
  return { ok: true, counterparty, replyToOfferId };
}

/** Fair terms at the live index, a maker who can cover it now, and room under the cap. */
export async function checkPostable(
  makerId: string,
  terms: OfferTerms,
): Promise<{ ok: true; quote: OracleQuote; market: OfferMarket } | TransmutationFailure> {
  const quote = liveQuote();
  if (!quote) return fail("rates_unavailable", RATES_UNAVAILABLE_MESSAGE);
  const market = assessOffer(terms, quote.prices);
  if (!market.withinCorridor) {
    return fail(
      "off_market",
      `Offers must stay within ${CORRIDOR * 100}% of the live index. At parity, ` +
        `${coins(terms.giveAmount, terms.giveToken)} is worth ${coins(market.parityWantAmount, terms.wantToken)}.`,
    );
  }
  // No escrow: an offer the maker cannot fund right now would only mislead the Circle.
  const balances = await tokenEconomy.getBalancesOrNull(makerId);
  if (!balances || !canCoverGive(terms, holdingsFromBalances(balances))) {
    return fail("insufficient_funds", `You need ${coins(terms.giveAmount, terms.giveToken)} to make this offer.`);
  }
  const [countRow] = await rowsOf(sql.countLiveOffersByMakerSql(makerId));
  if (amountOf(countRow?.n) >= MAX_OPEN_OFFERS_PER_MAKER) {
    return fail(
      "too_many_open_offers",
      `You already have ${MAX_OPEN_OFFERS_PER_MAKER} open offers. Withdraw one to post another.`,
    );
  }
  return { ok: true, quote, market };
}

/** A directed offer rings its (human) counterparty; an open offer goes on the feed. */
export async function announceOffer(offer: OfferRecord, counterparty: Participant | null, market: OfferMarket): Promise<void> {
  if (!counterparty) {
    await quietly("offer feed event", () =>
      feedDatabase.createEvent(offer.makerId, "transmutation_offer", {
        offerId: offer.id,
        giveToken: offer.giveToken,
        giveAmount: offer.giveAmount,
        wantToken: offer.wantToken,
        wantAmount: offer.wantAmount,
        takerEdgePct: market.takerEdgePct,
      }),
    );
    return;
  }
  if (counterparty.isAgent) return;
  const maker = await loadParticipant(offer.makerId).catch(() => null);
  await quietly("offer notification", () =>
    notificationDatabase.createNotification(
      counterparty.id,
      "transmutation_offer",
      offer.replyToOfferId ? "A counter-offer" : "A transmutation offer",
      `${maker ? partyOf(maker).name : CONCEALED_NAME} offers ` +
        `${coins(offer.giveAmount, offer.giveToken)} for ${coins(offer.wantAmount, offer.wantToken)}`,
      {
        ...(maker && isRevealed(maker) ? { relatedUserId: offer.makerId } : {}),
        metadata: {
          offerId: offer.id,
          giveToken: offer.giveToken,
          giveAmount: offer.giveAmount,
          wantToken: offer.wantToken,
          wantAmount: offer.wantAmount,
        },
      },
    ),
  );
}

export async function offerByKey(makerId: string, key: string): Promise<OfferRecord | null> {
  const [row] = await rowsOf(sql.offerByIdempotencyKeySql(makerId, key));
  return row ? parseOffer(row) : null;
}
