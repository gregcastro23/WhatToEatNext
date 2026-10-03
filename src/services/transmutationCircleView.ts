/**
 * Transmutation Circle — the snapshot one viewer reads.
 *
 * The board is ranked to make the next trade obvious: offers made TO you,
 * then offers that give what you lack for what you have to spare, then the
 * best edge over the house swap, then the newest.
 *
 * @file src/services/transmutationCircleView.ts
 */

import { PRACTICES } from "@/lib/economy/practices";
import type { OracleQuote } from "@/lib/economy/priceIndex";
import {
  BONUS_MIN_TRADE_VALUE,
  CORRIDOR,
  assessNeeds,
  canFill,
  complementsNeeds,
  suggestOffer,
  type Holdings,
  type Needs,
} from "@/lib/economy/transmutationMarket";
import { tokenEconomy } from "@/services/TokenEconomyService";
import * as board from "@/services/transmutationBoardQueries";
import {
  amountOf,
  holdingsFromBalances,
  isoOf,
  joinedPartyOf,
  parseOffer,
  rowsOf,
  type Row,
} from "@/services/transmutationRecords";
import { liveQuote, offerView } from "@/services/transmutationViews";
import type {
  TransmutationBoardOffer,
  TransmutationCircleSnapshot,
  TransmutationOwnOffer,
} from "@/types/transmutation";

const BOARD_LIMIT = 50;
const MINE_LIMIT = 30;

function toBoardOffer(
  row: Row,
  viewerId: string,
  quote: OracleQuote | null,
  holdings: Holdings | null,
  needs: Needs | null,
): TransmutationBoardOffer {
  const offer = parseOffer(row);
  return {
    ...offerView(offer, quote),
    maker: joinedPartyOf(row, "maker"),
    directedToYou: offer.counterpartyId === viewerId,
    youCanFill: holdings ? canFill(offer, holdings) : false,
    complementsYou: needs ? complementsNeeds(offer, needs) : false,
  };
}

function toOwnOffer(row: Row, quote: OracleQuote | null): TransmutationOwnOffer {
  const offer = parseOffer(row);
  return {
    ...offerView(offer, quote),
    funded: row.funded === true,
    counterparty: offer.counterpartyId ? joinedPartyOf(row, "counterparty") : null,
    taker: offer.takerId ? joinedPartyOf(row, "taker") : null,
  };
}

/** Made to you, then what you need, then the best deal, then the newest. */
function byRelevance(a: TransmutationBoardOffer, b: TransmutationBoardOffer): number {
  return (
    Number(b.directedToYou) - Number(a.directedToYou) ||
    Number(b.complementsYou) - Number(a.complementsYou) ||
    (b.market?.takerEdgePct ?? 0) - (a.market?.takerEdgePct ?? 0) ||
    Date.parse(b.createdAt) - Date.parse(a.createdAt)
  );
}

function marketBlock(quote: OracleQuote | null): TransmutationCircleSnapshot["market"] {
  return {
    live: quote !== null,
    prices: quote ? { ...quote.prices } : null,
    priceBucketStartUtc: quote?.bucketStartUtc ?? null,
    corridorPct: CORRIDOR * 100,
  };
}

/** Everything the Circle view needs for one viewer. */
export async function buildCircleSnapshot(viewerId: string): Promise<TransmutationCircleSnapshot> {
  const quote = liveQuote();
  const [boardRows, mineRows, statsRows, pulseRows, balances] = await Promise.all([
    rowsOf(board.boardSql({ viewerId, limit: BOARD_LIMIT })),
    rowsOf(board.makerOffersSql({ makerId: viewerId, limit: MINE_LIMIT })),
    rowsOf(board.tradeStatsSql(viewerId)),
    rowsOf(board.circleActivitySql()),
    tokenEconomy.getBalancesOrNull(viewerId),
  ]);

  const holdings = balances ? holdingsFromBalances(balances) : null;
  const needs = holdings && quote ? assessNeeds(holdings, quote.prices) : null;
  const [statsRow] = statsRows;
  const [pulseRow] = pulseRows;
  const bonusDef = PRACTICES.transmutation_shared;

  return {
    board: boardRows.map((row) => toBoardOffer(row, viewerId, quote, holdings, needs)).sort(byRelevance),
    mine: mineRows.map((row) => toOwnOffer(row, quote)),
    needs,
    suggestion: holdings && quote ? suggestOffer(holdings, quote.prices) : null,
    stats: {
      trades: amountOf(statsRow?.trades),
      partners: amountOf(statsRow?.partners),
      lastTradeAt: isoOf(statsRow?.last_trade_at),
    },
    pulse: {
      trades24h: amountOf(pulseRow?.trades_24h),
      openOffers: amountOf(pulseRow?.open_offers),
    },
    market: marketBlock(quote),
    bonus: {
      tokenType: bonusDef.tokenType,
      baseAmount: bonusDef.baseAmount,
      minTradeValue: BONUS_MIN_TRADE_VALUE,
      perPartnerPerDay: 1,
    },
  };
}
