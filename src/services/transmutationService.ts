/**
 * The Transmutation Circle — peer-to-peer ESMS trades between practitioners,
 * human or agent (ADR-018).
 *
 * Swapping (ADR-017) is solitary: you convert coins against the index. Here two
 * practitioners each send the other the coin that one lacks. A maker posts an
 * offer — open to the whole Circle, directed at one practitioner, or as a
 * counter to someone else's offer — and a taker fills it in one transaction
 * (`transmutationFill.ts`).
 *
 * Why people trade here rather than swap: a generous maker beats the house
 * (offers may sit up to 25% from parity and the board shows each one's edge);
 * the board ranks offers made to you and offers that give what you lack first
 * (`transmutationCircleView.ts`); both humans earn the Circle bonus; directed
 * offers and fills ring bells; open offers and trades reach the feed. Agents
 * trade freely but never earn the bonus.
 *
 * Module map: rows and people (`transmutationRecords.ts`), views and helpers
 * (`transmutationViews.ts`), SQL (`transmutationQueries.ts`,
 * `transmutationBoardQueries.ts`), pure market rules
 * (`lib/economy/transmutationMarket.ts`).
 *
 * @file src/services/transmutationService.ts
 */

import {
  assessOffer,
  normalizeTerms,
  type OfferMarket,
} from "@/lib/economy/transmutationMarket";
import { tokenEconomy } from "@/services/TokenEconomyService";
import { buildCircleSnapshot } from "@/services/transmutationCircleView";
import { celebrateFill, fillOfferAtomically, tradeOf, type TradeBonus } from "@/services/transmutationFill";
import {
  announceOffer,
  checkPostable,
  offerByKey,
  resolveAddressee,
  type CounterpartyRef,
} from "@/services/transmutationPosting";
import * as sql from "@/services/transmutationQueries";
import {
  isBlockedPair,
  isExpired,
  loadOffer,
  loadParticipant,
  loadParticipantByEmail,
  parseOffer,
  partyOf,
  rowsOf,
  type OfferRecord,
  type Participant,
} from "@/services/transmutationRecords";
import {
  RATES_UNAVAILABLE_MESSAGE,
  clampTtl,
  coins,
  fail,
  liveQuote,
  offerView,
  ownView,
  sanitizeMessage,
} from "@/services/transmutationViews";
import type { TokenBalances } from "@/types/economy";
import type {
  TransmutationCircleSnapshot,
  TransmutationFailure,
  TransmutationFailureReason,
  TransmutationOfferView,
  TransmutationOwnOffer,
  TransmutationTerms,
  TransmutationTrade,
} from "@/types/transmutation";

/** How each refusal reads over HTTP — one table for the human and agent doors. */
export const TRANSMUTATION_FAILURE_STATUS: Record<TransmutationFailureReason, number> = {
  invalid_offer: 400,
  own_offer: 400,
  insufficient_funds: 402,
  counterparty_unavailable: 403,
  counterparty_not_found: 404,
  offer_not_found: 404,
  offer_closed: 409,
  maker_cannot_cover: 409,
  offer_expired: 410,
  off_market: 422,
  too_many_open_offers: 429,
  failed: 500,
  rates_unavailable: 503,
};

export type { CounterpartyRef } from "@/services/transmutationPosting";

/** What a maker may add to an offer's terms. Absent and null both mean "none". */
export interface CreateOfferOptions {
  /** Direct the offer at one practitioner. */
  counterparty: CounterpartyRef | null;
  /** Counter someone's offer: directed at that offer's maker. */
  replyToOfferId: string | null;
  message: string | null;
  ttlHours: number | null;
  /** Client retry key; a replay returns the offer it already created. */
  idempotencyKey: string | null;
}

export type CreateOfferInput = TransmutationTerms & Partial<CreateOfferOptions>;

export type CreateOfferResult =
  | { ok: true; offer: TransmutationOwnOffer; replayed: boolean }
  | TransmutationFailure;

export type AcceptOfferResult =
  | {
      ok: true;
      offer: TransmutationOfferView;
      trade: TransmutationTrade;
      balances: TokenBalances | null;
      /** The taker's Circle bonus, when this trade earned one. */
      bonus: TradeBonus;
    }
  | TransmutationFailure;

export type CloseOfferResult = { ok: true; offer: TransmutationOfferView } | TransmutationFailure;

// ─── Filling, step by step ────────────────────────────────────────────

interface Fillable { ok: true; offer: OfferRecord; market: OfferMarket; maker: Participant; taker: Participant }

/** Everything that can be refused before the transaction opens. */
async function precheckFill(takerId: string, offerId: string): Promise<Fillable | TransmutationFailure> {
  const offer = await loadOffer(offerId);
  // A directed offer is invisible to everyone but its counterparty.
  if (!offer || (offer.counterpartyId !== null && offer.counterpartyId !== takerId)) {
    return fail("offer_not_found", "That offer is not in the Circle.");
  }
  if (offer.makerId === takerId) return fail("own_offer", "You cannot fill your own offer.");
  if (offer.status !== "open") return fail("offer_closed", `This offer was already ${offer.status}.`);
  if (isExpired(offer)) return fail("offer_expired", "This offer has expired.");
  if (await isBlockedPair(offer.makerId, takerId)) {
    return fail("counterparty_unavailable", "You cannot trade with this practitioner.");
  }
  // The corridor again, at TODAY's index: a moved market must not turn an offer into a transfer.
  const quote = liveQuote();
  if (!quote) return fail("rates_unavailable", RATES_UNAVAILABLE_MESSAGE);
  const market = assessOffer(offer, quote.prices);
  if (!market.withinCorridor) {
    return fail("off_market", "The market has moved since this offer was posted; it is no longer within fair terms.");
  }
  const [maker, taker] = await Promise.all([loadParticipant(offer.makerId), loadParticipant(takerId)]);
  if (!maker || !taker) return fail("offer_not_found", "That offer is not in the Circle.");
  return { ok: true, offer, market, maker, taker };
}

// ─── The service ──────────────────────────────────────────────────────

export const transmutationService = {
  /** Everything the Circle view needs for one viewer. */
  async getCircle(viewerId: string): Promise<TransmutationCircleSnapshot> {
    return buildCircleSnapshot(viewerId);
  },

  /** Post an offer to the Circle, to one practitioner, or as a counter. */
  async createOffer(makerId: string, input: CreateOfferInput): Promise<CreateOfferResult> {
    const normalized = normalizeTerms(input);
    if (!normalized.ok) return fail("invalid_offer", normalized.problem);
    const { terms } = normalized;

    // Keys are namespaced by maker so two makers never collide on the global unique index.
    const idempotencyKey = input.idempotencyKey ? `${makerId}:${input.idempotencyKey}` : null;
    const prior = idempotencyKey ? await offerByKey(makerId, idempotencyKey) : null;
    if (prior) return { ok: true, offer: ownView(prior, liveQuote(), null), replayed: true };

    const addressee = await resolveAddressee(makerId, input);
    if (!addressee.ok) return addressee;
    const postable = await checkPostable(makerId, terms);
    if (!postable.ok) return postable;

    const [inserted] = await rowsOf(
      sql.insertOfferSql({
        makerId,
        counterpartyId: addressee.counterparty?.id ?? null,
        ...terms,
        message: sanitizeMessage(input.message),
        replyToOfferId: addressee.replyToOfferId,
        idempotencyKey,
        ttlHours: clampTtl(input.ttlHours),
      }),
    );
    // No row: lost a race with our own retry, which created it.
    const raced = !inserted && idempotencyKey ? await offerByKey(makerId, idempotencyKey) : null;
    const offer = inserted ? parseOffer(inserted) : raced;
    if (!offer) return fail("failed", "The offer could not be posted. Try again.");

    if (inserted) await announceOffer(offer, addressee.counterparty, postable.market);
    const counterparty = addressee.counterparty ? partyOf(addressee.counterparty) : null;
    return { ok: true, offer: ownView(offer, postable.quote, counterparty), replayed: !inserted };
  },

  /** Fill an offer: both wallets move in one transaction, or neither does. */
  async acceptOffer(takerId: string, offerId: string): Promise<AcceptOfferResult> {
    const fillable = await precheckFill(takerId, offerId);
    if (!fillable.ok) return fillable;

    const outcome = await fillOfferAtomically(offerId, takerId);
    switch (outcome.kind) {
      case "gone":
        return fail("offer_not_found", "That offer is not in the Circle.");
      case "closed":
        return fail("offer_closed", `This offer was already ${outcome.status}.`);
      case "expired":
        return fail("offer_expired", "This offer has expired.");
      case "maker_short":
        return fail("maker_cannot_cover", "The maker can no longer cover this offer. Nothing was exchanged.");
      case "taker_short":
        return fail(
          "insufficient_funds",
          `You need ${coins(fillable.offer.wantAmount, fillable.offer.wantToken)} to fill this offer.`,
        );
      case "filled":
        break;
    }

    const trade = tradeOf(outcome.offer, outcome.transactionGroupId);
    const bonus = await celebrateFill({
      filled: outcome.offer,
      trade,
      market: fillable.market,
      maker: fillable.maker,
      taker: fillable.taker,
    });
    return {
      ok: true,
      offer: offerView(outcome.offer, null),
      trade,
      balances: await tokenEconomy.getBalancesOrNull(takerId),
      bonus,
    };
  },

  /** The maker withdraws their offer. */
  async cancelOffer(makerId: string, offerId: string): Promise<CloseOfferResult> {
    return closeOffer(makerId, offerId, "cancel");
  },

  /** The practitioner an offer was made to turns it down. */
  async declineOffer(userId: string, offerId: string): Promise<CloseOfferResult> {
    return closeOffer(userId, offerId, "decline");
  },

  /** Resolve an agent (or any practitioner) by email — for the S2S door. */
  async findParticipantIdByEmail(email: string): Promise<{ id: string; isAgent: boolean } | null> {
    const found = await loadParticipantByEmail(email);
    return found ? { id: found.id, isAgent: found.isAgent } : null;
  },
};

async function closeOffer(actorId: string, offerId: string, kind: "cancel" | "decline"): Promise<CloseOfferResult> {
  const [closedRow] = await rowsOf(sql.closeOfferSql({ offerId, actorId, kind }));
  if (closedRow) return { ok: true, offer: offerView(parseOffer(closedRow), null) };

  // Nothing changed — explain why without revealing offers that are not the actor's.
  const offer = await loadOffer(offerId);
  const ownsIt = offer && (kind === "cancel" ? offer.makerId === actorId : offer.counterpartyId === actorId);
  if (!offer || !ownsIt) return fail("offer_not_found", "That offer is not yours to close.");
  return fail("offer_closed", `This offer was already ${offer.status}.`);
}
