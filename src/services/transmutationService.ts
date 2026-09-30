/**
 * The Transmutation Circle — peer-to-peer ESMS trades between practitioners,
 * human or agent.
 *
 * Swapping (ADR-017) is solitary: you convert coins against the index. Here two
 * practitioners each send the other the coin that one lacks. A maker posts an
 * offer — open to the whole Circle, directed at one practitioner, or as a
 * counter to someone else's offer — and a taker fills it.
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
 * ── Why people trade here rather than swap ──────────────────────────────────
 *
 *  - A generous maker beats the house: offers may sit up to 25% from EEI
 *    parity (transmutationMarket.ts), and the board shows each one's edge.
 *  - The board ranks offers made TO you first, then the ones that give what
 *    you lack for what you have to spare, and suggests a trade toward balance.
 *  - Completing a trade earns both human practitioners the Circle bonus
 *    (`transmutation_shared`, Essence), once per partner per day.
 *  - A directed offer rings the counterparty's bell; a fill rings the maker's;
 *    open offers and completed trades appear on the Live Network Feed.
 *
 * Agents trade freely (they are the Circle's natural market makers) but never
 * earn the bonus, so a population of programs cannot farm it.
 *
 * Side effects run AFTER the fill commits and never undo it: a bell that fails
 * to ring is logged, not a reason to reverse a completed trade.
 *
 * @file src/services/transmutationService.ts
 */

import { randomUUID } from "node:crypto";
import { executeQuery, withTransaction } from "@/lib/database";
import { PRACTICES } from "@/lib/economy/practices";
import type { OracleQuote } from "@/lib/economy/priceIndex";
import { assertUsablePrices, getLiveSwapQuote } from "@/lib/economy/swappingBridge";
import {
  BONUS_MIN_TRADE_VALUE,
  CORRIDOR,
  DEFAULT_OFFER_TTL_HOURS,
  MAX_OFFER_TTL_HOURS,
  MAX_OPEN_OFFERS_PER_MAKER,
  MIN_OFFER_TTL_HOURS,
  assessNeeds,
  assessOffer,
  canCoverGive,
  canFill,
  complementsNeeds,
  normalizeTerms,
  suggestOffer,
  type Holdings,
  type OfferTerms,
} from "@/lib/economy/transmutationMarket";
import { defaultShareIdentity } from "@/lib/feed/identity";
import { _logger } from "@/lib/logger";
import { feedDatabase } from "@/services/feedDatabaseService";
import { notificationDatabase } from "@/services/notificationDatabaseService";
import { practiceRewardService } from "@/services/practiceRewardService";
import { creditTokensSql, debitTokensSql } from "@/services/tokenEconomyQueries";
import { tokenEconomy } from "@/services/TokenEconomyService";
import * as sql from "@/services/transmutationQueries";
import type { TokenBalances, TokenType } from "@/types/economy";
import { TOKEN_TYPES } from "@/types/economy";
import type {
  TransmutationBoardOffer,
  TransmutationCircleSnapshot,
  TransmutationFailure,
  TransmutationFailureReason,
  TransmutationMarketView,
  TransmutationOfferStatus,
  TransmutationOfferView,
  TransmutationOwnOffer,
  TransmutationParty,
  TransmutationTerms,
  TransmutationTrade,
} from "@/types/transmutation";

const BOARD_LIMIT = 50;
const MINE_LIMIT = 30;
const MESSAGE_MAX = 280;
const CONCEALED_NAME = "A fellow alchemist";

// ─── Row reading ──────────────────────────────────────────────────────
//
// Rows arrive as `Record<string, unknown>`; every field is read through a
// guard rather than trusted through a type parameter.

type Row = Record<string, unknown>;

const text = (value: unknown): string => (value == null ? "" : String(value));
const textOrNull = (value: unknown): string | null => (value == null ? null : String(value));

function amountOf(value: unknown): number {
  const n = typeof value === "number" ? value : Number.parseFloat(text(value));
  return Number.isFinite(n) ? n : 0;
}

function isoOf(value: unknown): string | null {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") {
    const ms = Date.parse(value);
    return Number.isFinite(ms) ? new Date(ms).toISOString() : null;
  }
  return null;
}

function tokenOf(value: unknown): TokenType {
  const token = TOKEN_TYPES.find((t) => t === value);
  if (!token) throw new Error(`transmutation: unexpected token ${text(value)}`);
  return token;
}

type StoredStatus = "open" | "filled" | "cancelled" | "declined";
const STORED_STATUSES: readonly StoredStatus[] = ["open", "filled", "cancelled", "declined"];

function storedStatusOf(value: unknown): StoredStatus {
  const status = STORED_STATUSES.find((s) => s === value);
  if (!status) throw new Error(`transmutation: unexpected status ${text(value)}`);
  return status;
}

interface OfferRecord extends OfferTerms {
  id: string;
  makerId: string;
  counterpartyId: string | null;
  message: string | null;
  status: StoredStatus;
  takerId: string | null;
  fillGroupId: string | null;
  replyToOfferId: string | null;
  createdAt: string;
  expiresAt: string;
  closedAt: string | null;
}

function parseOffer(row: Row): OfferRecord {
  return {
    id: text(row.id),
    makerId: text(row.maker_id),
    counterpartyId: textOrNull(row.counterparty_id),
    giveToken: tokenOf(row.give_token),
    giveAmount: amountOf(row.give_amount),
    wantToken: tokenOf(row.want_token),
    wantAmount: amountOf(row.want_amount),
    message: textOrNull(row.message),
    status: storedStatusOf(row.status),
    takerId: textOrNull(row.taker_id),
    fillGroupId: textOrNull(row.fill_transaction_group_id),
    replyToOfferId: textOrNull(row.reply_to_offer_id),
    createdAt: isoOf(row.created_at) ?? new Date(0).toISOString(),
    expiresAt: isoOf(row.expires_at) ?? new Date(0).toISOString(),
    closedAt: isoOf(row.closed_at),
  };
}

function holdingsOf(row: Row): Holdings {
  return {
    spirit: amountOf(row.spirit),
    essence: amountOf(row.essence),
    matter: amountOf(row.matter),
    substance: amountOf(row.substance),
  };
}

function holdingsFromBalances(balances: TokenBalances): Holdings {
  return {
    spirit: balances.spirit,
    essence: balances.essence,
    matter: balances.matter,
    substance: balances.substance,
  };
}

const isExpired = (offer: OfferRecord, now = Date.now()): boolean =>
  offer.status === "open" && Date.parse(offer.expiresAt) <= now;

const effectiveStatus = (offer: OfferRecord): TransmutationOfferStatus =>
  isExpired(offer) ? "expired" : offer.status;

// ─── People ───────────────────────────────────────────────────────────

interface Participant {
  id: string;
  isAgent: boolean;
  name: string | null;
  shareIdentity: boolean | null;
}

function participantOf(row: Row): Participant {
  return {
    id: text(row.id),
    isAgent: row.is_agent === true,
    name: textOrNull(row.name),
    shareIdentity: typeof row.share_identity === "boolean" ? row.share_identity : null,
  };
}

/**
 * How a practitioner is named to others. Agents are public personas; a human
 * is named only when their identity default is shared — the same rule the
 * feed applies — and is otherwise a fellow alchemist.
 */
function partyOf(person: {
  isAgent: boolean;
  name: string | null;
  shareIdentity: boolean | null;
}): TransmutationParty {
  if (person.isAgent) return { name: person.name ?? "An agent", isAgent: true };
  const named = defaultShareIdentity(person.shareIdentity) && person.name;
  return { name: named ? person.name ?? CONCEALED_NAME : CONCEALED_NAME, isAgent: false };
}

const isRevealed = (person: Participant): boolean =>
  person.isAgent || defaultShareIdentity(person.shareIdentity);

async function loadParticipant(userId: string): Promise<Participant | null> {
  const { sql: statement, values } = sql.participantSql(userId);
  const [row] = (await executeQuery(statement, values)).rows;
  return row ? participantOf(row) : null;
}

async function loadParticipantByEmail(email: string): Promise<Participant | null> {
  const { sql: statement, values } = sql.participantByEmailSql(email);
  const [row] = (await executeQuery(statement, values)).rows;
  return row ? participantOf(row) : null;
}

async function isBlockedPair(userA: string, userB: string): Promise<boolean> {
  const { sql: statement, values } = sql.blockedPairSql(userA, userB);
  return (await executeQuery(statement, values)).rows.length > 0;
}

// ─── Pricing and views ────────────────────────────────────────────────

/** The live index, or null — the Circle never judges fairness at a guessed price. */
function liveQuote(): OracleQuote | null {
  try {
    const quote = getLiveSwapQuote();
    assertUsablePrices(quote.prices);
    return quote;
  } catch (error) {
    _logger.warn("[transmutation] price oracle unavailable:", error);
    return null;
  }
}

function marketView(terms: OfferTerms, quote: OracleQuote | null): TransmutationMarketView | null {
  if (!quote) return null;
  const market = assessOffer(terms, quote.prices);
  return {
    parityWantAmount: market.parityWantAmount,
    takerEdgePct: market.takerEdgePct,
    withinCorridor: market.withinCorridor,
  };
}

function offerView(offer: OfferRecord, quote: OracleQuote | null): TransmutationOfferView {
  return {
    id: offer.id,
    giveToken: offer.giveToken,
    giveAmount: offer.giveAmount,
    wantToken: offer.wantToken,
    wantAmount: offer.wantAmount,
    message: offer.message,
    status: effectiveStatus(offer),
    directed: offer.counterpartyId !== null,
    replyToOfferId: offer.replyToOfferId,
    createdAt: offer.createdAt,
    expiresAt: offer.expiresAt,
    closedAt: offer.closedAt,
    market: offer.status === "open" ? marketView(offer, quote) : null,
  };
}

/** "3 Spirit" — amounts without trailing zeros. */
const coins = (amount: number, token: TokenType): string =>
  `${Number(amount.toFixed(4)).toString()} ${token}`;

const fail = (reason: TransmutationFailureReason, message: string): TransmutationFailure => ({
  ok: false,
  reason,
  message,
});

function sanitizeMessage(raw: string | undefined): string | null {
  if (!raw) return null;
  // Strip control characters (keeping newlines out too — it is a one-liner).
  const cleaned = Array.from(raw)
    .filter((ch) => {
      const code = ch.codePointAt(0) ?? 0;
      return code >= 0x20 && code !== 0x7f;
    })
    .join("")
    .trim()
    .slice(0, MESSAGE_MAX);
  return cleaned.length > 0 ? cleaned : null;
}

function clampTtl(hours: number | undefined): number {
  if (hours === undefined || !Number.isFinite(hours)) return DEFAULT_OFFER_TTL_HOURS;
  return Math.min(MAX_OFFER_TTL_HOURS, Math.max(MIN_OFFER_TTL_HOURS, Math.round(hours)));
}

/** Best-effort side effect: logged, never thrown into a completed trade. */
async function quietly(label: string, effect: () => Promise<unknown>): Promise<void> {
  try {
    await effect();
  } catch (error) {
    _logger.warn(`[transmutation] ${label} failed:`, error);
  }
}

// ─── Inputs and results ───────────────────────────────────────────────

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

export interface CreateOfferInput extends TransmutationTerms {
  /** Direct the offer at one practitioner, by id or (agents, over S2S) email. */
  counterparty?: { id?: string | undefined; email?: string | undefined } | undefined;
  /** Counter someone's offer: directed at that offer's maker. */
  replyToOfferId?: string | undefined;
  message?: string | undefined;
  ttlHours?: number | undefined;
  /** Client retry key; a replay returns the offer it already created. */
  idempotencyKey?: string | undefined;
}

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
      bonus: { tokenType: string; amount: number; hint: string } | null;
    }
  | TransmutationFailure;

export type CloseOfferResult = { ok: true; offer: TransmutationOfferView } | TransmutationFailure;

// ─── The service ──────────────────────────────────────────────────────

export const transmutationService = {
  /** Everything the Circle view needs for one viewer. */
  async getCircle(viewerId: string): Promise<TransmutationCircleSnapshot> {
    const quote = liveQuote();
    const board = sql.boardSql({ viewerId, limit: BOARD_LIMIT });
    const mine = sql.makerOffersSql({ makerId: viewerId, limit: MINE_LIMIT });
    const stats = sql.tradeStatsSql(viewerId);
    const pulse = sql.circleActivitySql();
    const [boardRes, mineRes, statsRes, pulseRes, balances] = await Promise.all([
      executeQuery(board.sql, board.values),
      executeQuery(mine.sql, mine.values),
      executeQuery(stats.sql, stats.values),
      executeQuery(pulse.sql, pulse.values),
      tokenEconomy.getBalancesOrNull(viewerId),
    ]);

    const holdings = balances ? holdingsFromBalances(balances) : null;
    const needs = holdings && quote ? assessNeeds(holdings, quote.prices) : null;

    const boardOffers: TransmutationBoardOffer[] = boardRes.rows.map((row) => {
      const offer = parseOffer(row);
      return {
        ...offerView(offer, quote),
        maker: partyOf({
          isAgent: row.maker_is_agent === true,
          name: textOrNull(row.maker_name),
          shareIdentity: typeof row.maker_share_identity === "boolean" ? row.maker_share_identity : null,
        }),
        directedToYou: offer.counterpartyId === viewerId,
        youCanFill: holdings ? canFill(offer, holdings) : false,
        complementsYou: needs ? complementsNeeds(offer, needs) : false,
      };
    });
    // Made to you, then what you need, then the best deal, then the newest.
    boardOffers.sort(
      (a, b) =>
        Number(b.directedToYou) - Number(a.directedToYou) ||
        Number(b.complementsYou) - Number(a.complementsYou) ||
        (b.market?.takerEdgePct ?? 0) - (a.market?.takerEdgePct ?? 0) ||
        Date.parse(b.createdAt) - Date.parse(a.createdAt),
    );

    const ownOffers: TransmutationOwnOffer[] = mineRes.rows.map((row) => {
      const offer = parseOffer(row);
      return {
        ...offerView(offer, quote),
        funded: row.funded === true,
        counterparty: offer.counterpartyId
          ? partyOf({
              isAgent: row.counterparty_is_agent === true,
              name: textOrNull(row.counterparty_name),
              shareIdentity:
                typeof row.counterparty_share_identity === "boolean" ? row.counterparty_share_identity : null,
            })
          : null,
        taker: offer.takerId
          ? partyOf({
              isAgent: row.taker_is_agent === true,
              name: textOrNull(row.taker_name),
              shareIdentity: typeof row.taker_share_identity === "boolean" ? row.taker_share_identity : null,
            })
          : null,
      };
    });

    const [statsRow] = statsRes.rows;
    const [pulseRow] = pulseRes.rows;
    const bonusDef = PRACTICES.transmutation_shared;

    return {
      board: boardOffers,
      mine: ownOffers,
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
      market: {
        live: quote !== null,
        prices: quote ? { ...quote.prices } : null,
        priceBucketStartUtc: quote?.bucketStartUtc ?? null,
        corridorPct: CORRIDOR * 100,
      },
      bonus: {
        tokenType: bonusDef.tokenType,
        baseAmount: bonusDef.baseAmount,
        minTradeValue: BONUS_MIN_TRADE_VALUE,
        perPartnerPerDay: 1,
      },
    };
  },

  /** Post an offer to the Circle, to one practitioner, or as a counter. */
  async createOffer(makerId: string, input: CreateOfferInput): Promise<CreateOfferResult> {
    const normalized = normalizeTerms(input);
    if (!normalized.ok) return fail("invalid_offer", normalized.problem);
    const { terms } = normalized;

    // A retried post returns the offer it already created. Keys are namespaced
    // by maker so two makers can never collide on the global unique index.
    const idempotencyKey = input.idempotencyKey ? `${makerId}:${input.idempotencyKey}` : null;
    if (idempotencyKey) {
      const prior = sql.offerByIdempotencyKeySql(makerId, idempotencyKey);
      const [existing] = (await executeQuery(prior.sql, prior.values)).rows;
      if (existing) {
        return { ok: true, offer: ownView(parseOffer(existing), liveQuote(), null), replayed: true };
      }
    }

    // Who, if anyone, the offer is addressed to.
    let counterparty: Participant | null = null;
    let replyToOfferId: string | null = null;
    if (input.replyToOfferId) {
      const original = sql.offerByIdSql(input.replyToOfferId);
      const [row] = (await executeQuery(original.sql, original.values)).rows;
      const replyTo = row ? parseOffer(row) : null;
      // An offer directed at someone else is invisible to this maker: same answer as absent.
      if (!replyTo || (replyTo.counterpartyId !== null && replyTo.counterpartyId !== makerId)) {
        return fail("offer_not_found", "The offer you are countering no longer exists.");
      }
      if (replyTo.makerId === makerId) {
        return fail("invalid_offer", "You cannot counter your own offer.");
      }
      counterparty = await loadParticipant(replyTo.makerId);
      replyToOfferId = replyTo.id;
    } else if (input.counterparty?.id) {
      counterparty = await loadParticipant(input.counterparty.id);
    } else if (input.counterparty?.email) {
      counterparty = await loadParticipantByEmail(input.counterparty.email);
    }
    const directed = Boolean(input.replyToOfferId ?? input.counterparty?.id ?? input.counterparty?.email);
    if (directed && !counterparty) {
      return fail("counterparty_not_found", "No practitioner by that name is in the Circle.");
    }
    if (counterparty?.id === makerId) {
      return fail("invalid_offer", "You cannot make an offer to yourself.");
    }
    if (counterparty && (await isBlockedPair(makerId, counterparty.id))) {
      return fail("counterparty_unavailable", "You cannot make an offer to this practitioner.");
    }

    // Fair-value corridor, at the live index.
    const quote = liveQuote();
    if (!quote) {
      return fail(
        "rates_unavailable",
        "Live exchange rates are unavailable, so fair terms cannot be checked right now.",
      );
    }
    const market = assessOffer(terms, quote.prices);
    if (!market.withinCorridor) {
      return fail(
        "off_market",
        `Offers must stay within ${CORRIDOR * 100}% of the live index. At parity, ` +
          `${coins(terms.giveAmount, terms.giveToken)} is worth ${coins(market.parityWantAmount, terms.wantToken)}.`,
      );
    }

    // The maker must be able to cover it now — there is no escrow, so an
    // offer they cannot fund would only mislead the Circle.
    const balances = await tokenEconomy.getBalancesOrNull(makerId);
    if (!balances || !canCoverGive(terms, holdingsFromBalances(balances))) {
      return fail(
        "insufficient_funds",
        `You need ${coins(terms.giveAmount, terms.giveToken)} to make this offer.`,
      );
    }

    const live = sql.countLiveOffersByMakerSql(makerId);
    const [countRow] = (await executeQuery(live.sql, live.values)).rows;
    if (amountOf(countRow?.n) >= MAX_OPEN_OFFERS_PER_MAKER) {
      return fail(
        "too_many_open_offers",
        `You already have ${MAX_OPEN_OFFERS_PER_MAKER} open offers. Withdraw one to post another.`,
      );
    }

    const insert = sql.insertOfferSql({
      makerId,
      counterpartyId: counterparty?.id ?? null,
      giveToken: terms.giveToken,
      giveAmount: terms.giveAmount,
      wantToken: terms.wantToken,
      wantAmount: terms.wantAmount,
      message: sanitizeMessage(input.message),
      replyToOfferId,
      idempotencyKey,
      ttlHours: clampTtl(input.ttlHours),
    });
    let [row] = (await executeQuery(insert.sql, insert.values)).rows;
    let replayed = false;
    if (!row && idempotencyKey) {
      // Lost a race with our own retry: the other request created it.
      const prior = sql.offerByIdempotencyKeySql(makerId, idempotencyKey);
      [row] = (await executeQuery(prior.sql, prior.values)).rows;
      replayed = true;
    }
    if (!row) return fail("failed", "The offer could not be posted. Try again.");
    const offer = parseOffer(row);

    if (!replayed) {
      const maker = await loadParticipant(makerId).catch(() => null);
      if (counterparty) {
        const target = counterparty;
        if (!target.isAgent) {
          await quietly("offer notification", () =>
            notificationDatabase.createNotification(
              target.id,
              "transmutation_offer",
              replyToOfferId ? "A counter-offer" : "A transmutation offer",
              `${maker ? partyOf(maker).name : CONCEALED_NAME} offers ` +
                `${coins(offer.giveAmount, offer.giveToken)} for ${coins(offer.wantAmount, offer.wantToken)}`,
              {
                ...(maker && isRevealed(maker) ? { relatedUserId: makerId } : {}),
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
      } else {
        // An open offer is an invitation to the whole Circle: say so on the feed.
        await quietly("offer feed event", () =>
          feedDatabase.createEvent(makerId, "transmutation_offer", {
            offerId: offer.id,
            giveToken: offer.giveToken,
            giveAmount: offer.giveAmount,
            wantToken: offer.wantToken,
            wantAmount: offer.wantAmount,
            takerEdgePct: market.takerEdgePct,
          }),
        );
      }
    }

    return {
      ok: true,
      offer: ownView(offer, quote, counterparty ? partyOf(counterparty) : null),
      replayed,
    };
  },

  /** Fill an offer: both wallets move in one transaction, or neither does. */
  async acceptOffer(takerId: string, offerId: string): Promise<AcceptOfferResult> {
    const lookup = sql.offerByIdSql(offerId);
    const [row] = (await executeQuery(lookup.sql, lookup.values)).rows;
    const offer = row ? parseOffer(row) : null;
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

    // The corridor again, at TODAY's index: a market that has moved since the
    // offer was posted must not turn it into a transfer.
    const quote = liveQuote();
    if (!quote) {
      return fail(
        "rates_unavailable",
        "Live exchange rates are unavailable, so fair terms cannot be checked right now.",
      );
    }
    const market = assessOffer(offer, quote.prices);
    if (!market.withinCorridor) {
      return fail(
        "off_market",
        "The market has moved since this offer was posted; it is no longer within fair terms.",
      );
    }

    const [maker, taker] = await Promise.all([
      loadParticipant(offer.makerId),
      loadParticipant(takerId),
    ]);
    if (!maker || !taker) return fail("offer_not_found", "That offer is not in the Circle.");

    const outcome = await withTransaction(async (client) => {
      const run = (built: { sql: string; values: unknown[] }) =>
        executeQuery(built.sql, built.values, { client });

      const [lockedRow] = (await run(sql.lockOfferSql(offerId))).rows;
      if (!lockedRow) return { kind: "gone" as const };
      const locked = parseOffer(lockedRow);
      if (locked.status !== "open") return { kind: "closed" as const, status: locked.status };
      if (isExpired(locked)) return { kind: "expired" as const };

      const wallets = (await run(sql.lockPairBalancesSql(locked.makerId, takerId))).rows;
      const walletOf = (userId: string): Holdings | null => {
        const wallet = wallets.find((w) => text(w.user_id) === userId);
        return wallet ? holdingsOf(wallet) : null;
      };
      const makerWallet = walletOf(locked.makerId);
      const takerWallet = walletOf(takerId);
      if (!makerWallet || !canCoverGive(locked, makerWallet)) return { kind: "maker_short" as const };
      if (!takerWallet || !canFill(locked, takerWallet)) return { kind: "taker_short" as const };

      const transactionGroupId = randomUUID();
      const tag = `Transmutation Circle (offer ${locked.id.slice(0, 8)})`;
      const legs = [
        debitTokensSql({
          userId: locked.makerId,
          tokenType: locked.giveToken,
          amount: locked.giveAmount,
          sourceType: "transmutation",
          sourceId: locked.id,
          transactionGroupId,
          description: `${tag}: gave ${coins(locked.giveAmount, locked.giveToken)}`,
        }),
        debitTokensSql({
          userId: takerId,
          tokenType: locked.wantToken,
          amount: locked.wantAmount,
          sourceType: "transmutation",
          sourceId: locked.id,
          transactionGroupId,
          description: `${tag}: gave ${coins(locked.wantAmount, locked.wantToken)}`,
        }),
        creditTokensSql({
          userId: locked.makerId,
          tokenType: locked.wantToken,
          amount: locked.wantAmount,
          sourceType: "transmutation",
          sourceId: locked.id,
          transactionGroupId,
          description: `${tag}: received ${coins(locked.wantAmount, locked.wantToken)}`,
          idempotencyKey: `transmute_fill:${locked.id}:maker:${locked.wantToken}`,
        }),
        creditTokensSql({
          userId: takerId,
          tokenType: locked.giveToken,
          amount: locked.giveAmount,
          sourceType: "transmutation",
          sourceId: locked.id,
          transactionGroupId,
          description: `${tag}: received ${coins(locked.giveAmount, locked.giveToken)}`,
          idempotencyKey: `transmute_fill:${locked.id}:taker:${locked.giveToken}`,
        }),
      ];
      for (const leg of legs) {
        const [moved] = (await run(leg)).rows;
        // Both rows are locked and both sides were checked, so a leg that moves
        // nothing is a bug. Throwing is what undoes the legs already written.
        if (!moved) throw new Error("transmutation: a fill leg moved no balance; rolling back");
      }

      const [filledRow] = (await run(sql.fillOfferSql({ offerId, takerId, transactionGroupId }))).rows;
      if (!filledRow) throw new Error("transmutation: offer closed mid-fill; rolling back");
      return { kind: "filled" as const, offer: parseOffer(filledRow), transactionGroupId };
    });

    switch (outcome.kind) {
      case "gone":
        return fail("offer_not_found", "That offer is not in the Circle.");
      case "closed":
        return fail("offer_closed", `This offer was already ${outcome.status}.`);
      case "expired":
        return fail("offer_expired", "This offer has expired.");
      case "maker_short":
        return fail(
          "maker_cannot_cover",
          "The maker can no longer cover this offer. Nothing was exchanged.",
        );
      case "taker_short":
        return fail(
          "insufficient_funds",
          `You need ${coins(offer.wantAmount, offer.wantToken)} to fill this offer.`,
        );
      case "filled":
        break;
    }

    const filled = outcome.offer;
    const trade: TransmutationTrade = {
      gave: { tokenType: filled.wantToken, amount: filled.wantAmount },
      received: { tokenType: filled.giveToken, amount: filled.giveAmount },
      transactionGroupId: outcome.transactionGroupId,
    };

    // ── After the commit: rewards, bells, the feed. None can undo the trade.
    const earnsBonus = Math.min(market.giveValue, market.wantValue) >= BONUS_MIN_TRADE_VALUE;
    let bonus: { tokenType: string; amount: number; hint: string } | null = null;
    if (earnsBonus && !taker.isAgent) {
      const result = await practiceRewardService.recognize(takerId, "transmutation_shared", maker.id);
      if (result.rewarded && result.tokenType && result.amount && result.hint) {
        bonus = { tokenType: result.tokenType, amount: result.amount, hint: result.hint };
      }
    }
    if (earnsBonus && !maker.isAgent) {
      await practiceRewardService.recognize(maker.id, "transmutation_shared", takerId);
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
            ...(isRevealed(taker) ? { relatedUserId: takerId } : {}),
            metadata: { offerId: filled.id, transactionGroupId: outcome.transactionGroupId },
          },
        ),
      );
    }
    await quietly("trade feed event", () =>
      feedDatabase.createEvent(takerId, "transmutation_trade", {
        offerId: filled.id,
        gaveToken: trade.gave.tokenType,
        gaveAmount: trade.gave.amount,
        receivedToken: trade.received.tokenType,
        receivedAmount: trade.received.amount,
        partnerName: partyOf(maker).name,
        partnerIsAgent: maker.isAgent,
      }),
    );

    return {
      ok: true,
      offer: offerView(filled, quote),
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

function ownView(
  offer: OfferRecord,
  quote: OracleQuote | null,
  counterparty: TransmutationParty | null,
): TransmutationOwnOffer {
  return {
    ...offerView(offer, quote),
    // Only reached right after posting (or replaying) an offer the maker
    // could cover; the Circle read recomputes it live.
    funded: offer.status === "open",
    counterparty,
    taker: null,
  };
}

async function closeOffer(
  actorId: string,
  offerId: string,
  kind: "cancel" | "decline",
): Promise<CloseOfferResult> {
  const close = sql.closeOfferSql({ offerId, actorId, kind });
  const [closedRow] = (await executeQuery(close.sql, close.values)).rows;
  if (closedRow) return { ok: true, offer: offerView(parseOffer(closedRow), null) };

  // Nothing changed — explain why without revealing offers that are not the actor's.
  const lookup = sql.offerByIdSql(offerId);
  const [row] = (await executeQuery(lookup.sql, lookup.values)).rows;
  const offer = row ? parseOffer(row) : null;
  const ownsIt = offer && (kind === "cancel" ? offer.makerId === actorId : offer.counterpartyId === actorId);
  if (!offer || !ownsIt) return fail("offer_not_found", "That offer is not yours to close.");
  return fail("offer_closed", `This offer was already ${offer.status}.`);
}
