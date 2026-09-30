/**
 * Transmutation Circle — the shapes the service returns and the routes serve.
 *
 * Swapping converts coins alone, against the index. Transmuting is social: two
 * practitioners each send the other the coin that one lacks. See ADR-018.
 *
 * @file src/types/transmutation.ts
 */

import type { TokenType } from "@/types/economy";

/** `expired` is derived: an `open` row past its `expires_at`. */
export type TransmutationOfferStatus = "open" | "filled" | "cancelled" | "declined" | "expired";

/** How someone is shown. Humans who keep their identity private read as a fellow alchemist. */
export interface TransmutationParty {
  name: string;
  isAgent: boolean;
}

/** An offer's terms priced against the house swap at the live index. */
export interface TransmutationMarketView {
  /** What the maker would ask for at exact EEI parity, in the wanted coin. */
  parityWantAmount: number;
  /** % more value the taker receives than pays; > 0 beats swapping at the house. */
  takerEdgePct: number;
  withinCorridor: boolean;
}

export interface TransmutationOfferView {
  id: string;
  giveToken: TokenType;
  giveAmount: number;
  wantToken: TokenType;
  wantAmount: number;
  message: string | null;
  status: TransmutationOfferStatus;
  /** True when made to one practitioner rather than the whole circle. */
  directed: boolean;
  replyToOfferId: string | null;
  createdAt: string;
  expiresAt: string;
  closedAt: string | null;
  /** Null when the index cannot price the sky right now. */
  market: TransmutationMarketView | null;
}

/** An offer someone else made, as the viewer sees it on the board. */
export interface TransmutationBoardOffer extends TransmutationOfferView {
  maker: TransmutationParty;
  directedToYou: boolean;
  /** The viewer holds enough of the wanted coin to fill it now. */
  youCanFill: boolean;
  /** It gives a coin the viewer lacks for one they have to spare. */
  complementsYou: boolean;
}

/** One of the viewer's own offers. */
export interface TransmutationOwnOffer extends TransmutationOfferView {
  /** An open offer the maker's balance still covers (others can see it). */
  funded: boolean;
  counterparty: TransmutationParty | null;
  taker: TransmutationParty | null;
}

export interface TransmutationTerms {
  giveToken: TokenType;
  giveAmount: number;
  wantToken: TokenType;
  wantAmount: number;
}

/** Everything the Circle view needs, in one read. */
export interface TransmutationCircleSnapshot {
  /**
   * Open offers by others that their makers can still cover (`youCanFill` says
   * whether the viewer can pay). Ones made to the viewer first, then the ones
   * that complement them.
   */
  board: TransmutationBoardOffer[];
  mine: TransmutationOwnOffer[];
  /** Null when balances or prices are unavailable. */
  needs: { lacking: TokenType[]; surplus: TokenType[] } | null;
  /** A one-tap offer at parity toward an even split, or null. */
  suggestion: TransmutationTerms | null;
  stats: { trades: number; partners: number; lastTradeAt: string | null };
  pulse: { trades24h: number; openOffers: number };
  market: {
    live: boolean;
    prices: Record<TokenType, number> | null;
    priceBucketStartUtc: string | null;
    corridorPct: number;
  };
  /** The standing incentive, stated so the UI never has to hard-code it. */
  bonus: { tokenType: TokenType; baseAmount: number; minTradeValue: number; perPartnerPerDay: 1 };
}

export interface TransmutationTrade {
  gave: { tokenType: TokenType; amount: number };
  received: { tokenType: TokenType; amount: number };
  transactionGroupId: string;
}

export type TransmutationFailureReason =
  | "invalid_offer"
  | "off_market"
  | "rates_unavailable"
  | "insufficient_funds"
  | "too_many_open_offers"
  | "counterparty_not_found"
  | "counterparty_unavailable"
  | "offer_not_found"
  | "offer_closed"
  | "offer_expired"
  | "own_offer"
  | "maker_cannot_cover"
  | "failed";

export interface TransmutationFailure {
  ok: false;
  reason: TransmutationFailureReason;
  message: string;
}
