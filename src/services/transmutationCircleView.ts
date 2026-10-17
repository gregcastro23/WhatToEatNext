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
import { evaluateTriplicateSynastry } from "@/lib/economy/triplicatePricing";
import { tokenEconomy } from "@/services/TokenEconomyService";
import * as board from "@/services/transmutationBoardQueries";
import {
  amountOf,
  holdingsFromBalances,
  isoOf,
  joinedPartyOf,
  text,
  tokenOf,
  parseOffer,
  rowsOf,
  type Row,
} from "@/services/transmutationRecords";
import { liveQuote, offerView } from "@/services/transmutationViews";
import type {
  CircleBoardResonanceWindow,
  TransmutationBoardOffer,
  TransmutationCircleSnapshot,
  TransmutationOwnOffer,
  TriplicateTradeSummary,
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

export function extractAspectDescription(raw: string): string {
  const viaMatch = raw.match(/\bvia\s+(.+)\)\s*$/i);
  if (viaMatch?.[1]) {
    return viaMatch[1].trim();
  }
  return raw.trim() || "Triplicate Synastry Alignment";
}

function buildResonanceWindows(
  boardRows: Array<Record<string, unknown>>,
  viewerId: string,
): CircleBoardResonanceWindow[] {
  const byPartner = new Map<string, CircleBoardResonanceWindow>();

  for (const row of boardRows) {
    if (!row.maker_natal || !row.viewer_natal) continue;
    const makerId = text(row.maker_id);
    if (!makerId || makerId === viewerId) continue;
    const maker = joinedPartyOf(row, "maker");

    const giveToken = tokenOf(row.give_token);
    const wantToken = tokenOf(row.want_token);
    const giveAmount = Number(row.give_amount) || 1;
    const wantAmount = Number(row.want_amount) || 1;

    const evalRes = evaluateTriplicateSynastry({
      makerId,
      takerId: viewerId,
      makerNatal: row.maker_natal,
      takerNatal: row.viewer_natal,
      giveToken,
      giveAmount,
      wantToken,
      wantAmount,
    });

    if (!evalRes.qualifies) continue;

    const bonusPct = Math.round(evalRes.beta * 100);
    const existing = byPartner.get(makerId);
    if (!existing || bonusPct > existing.bonusPct) {
      byPartner.set(makerId, {
        windowKey: evalRes.windowKey,
        makerId,
        takerId: viewerId,
        partnerId: makerId,
        partnerName: maker.name,
        partnerIsAgent: maker.isAgent,
        aspectDescription: evalRes.aspectDescription,
        harmonicAspect: evalRes.aspectDescription,
        transitCatalyst: evalRes.transitCatalyst,
        bonusPct,
        complementaryAxes: {
          give: wantToken,
          want: giveToken,
        },
        expiresAt:
          isoOf(row.expires_at) ??
          new Date(Date.now() + 12 * 3_600_000).toISOString(),
      });
    }
  }

  return [...byPartner.values()].sort((a, b) => b.bonusPct - a.bonusPct);
}

/** Everything the Circle view needs for one viewer. */
export async function buildCircleSnapshot(viewerId: string): Promise<TransmutationCircleSnapshot> {
  const quote = liveQuote();
  const [boardRows, mineRows, statsRows, pulseRows, balances, recentTradeRows] = await Promise.all([
    rowsOf(board.boardSql({ viewerId, limit: BOARD_LIMIT })),
    rowsOf(board.makerOffersSql({ makerId: viewerId, limit: MINE_LIMIT })),
    rowsOf(board.tradeStatsSql(viewerId)),
    rowsOf(board.circleActivitySql()),
    tokenEconomy.getBalancesOrNull(viewerId),
    rowsOf(board.recentTriplicateTradesSql(5)),
  ]);

  const holdings = balances ? holdingsFromBalances(balances) : null;
  const needs = holdings && quote ? assessNeeds(holdings, quote.prices) : null;
  const [statsRow] = statsRows;
  const [pulseRow] = pulseRows;
  const bonusDef = PRACTICES.transmutation_shared;

  const recentTrades: TriplicateTradeSummary[] = recentTradeRows.map((r) => {
    const giveAmount = Number(r.give_amount) || 0;
    const wantAmount = Number(r.want_amount) || 0;
    const rebateAmount = Number(r.maker_rebate_amount) || 0;
    const bonusPct = wantAmount > 0 ? Math.round((rebateAmount / wantAmount) * 100) : 0;

    return {
      id: text(r.id),
      timestamp: isoOf(r.closed_at) ?? new Date().toISOString(),
      makerName: text(r.maker_name) ?? "Alchemist",
      takerName: text(r.taker_name) ?? "Alchemist",
      gaveToken: tokenOf(r.give_token),
      gaveAmount: giveAmount,
      receivedToken: tokenOf(r.want_token),
      receivedAmount: wantAmount,
      resonanceBonusPct: bonusPct,
      aspectDescription: extractAspectDescription(text(r.rebate_description) ?? ""),
    };
  });

  const resonanceWindows = buildResonanceWindows(boardRows, viewerId);

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
    recentTrades,
    resonanceWindows,
    activeResonanceWindows: resonanceWindows,
  };
}
