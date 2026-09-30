/**
 * The Swapping Bridge — universal ESMS payments.
 *
 * Every priced action in the economy charges a four-axis basket
 * (Spirit / Essence / Matter / Substance). Before the bridge, a payer who was
 * short on ONE axis was refused outright, however much value they held on the
 * other three. The bridge closes that gap: when a basket cannot be paid as-is,
 * it converts just enough of the payer's surplus coins into the short ones, at
 * live market prices, and the conversion and the payment then commit together.
 *
 * ── Price basis ─────────────────────────────────────────────────────────────
 *
 * Prices come from the Elemental Exchange Index (ADR-011, `priceIndex.ts`):
 * one number per token, the cost multiplier the market as a whole faces. A swap
 * is 1:1 in VALUE with no spread:
 *
 *     units of A per 1 unit of B  =  P_B / P_A
 *
 * The public rate sheet (`swapRates.ts`, GET /api/economy/swap-rates) prices
 * off this exact function and this exact feed, so a quoted rate and the rate a
 * payment is auto-swapped at cannot disagree.
 *
 * ── The waterfall ───────────────────────────────────────────────────────────
 *
 *  1. Per axis: deficit = max(0, cost − balance), surplus = max(0, balance − cost).
 *  2. Order the surplus coins richest-first by VALUE (units × price) — units of
 *     different coins are not commensurable, value is. Ties fall back to units,
 *     then canonical token order, so a plan is a pure function of its inputs.
 *  3. For each deficit coin B, in canonical order, draw from the richest surplus
 *     coin A: the units of A that buy the whole remaining deficit are
 *     `deficit × P_B / P_A`. If A cannot cover it, A is exhausted and the rest
 *     overflows to the next-richest coin.
 *  4. If the surplus value cannot cover the deficit value, the plan is
 *     `canCover: false` and carries no legs — there is no partial swap.
 *
 * ── Exactness ───────────────────────────────────────────────────────────────
 *
 * The ledger is DECIMAL(12,4), and the EEI is published at 4 decimals, so all
 * arithmetic here is exact integer arithmetic (BigInt) in 1e-4 units. Every
 * conversion rounds AGAINST the payer by at most one ledger unit: the units
 * drawn from A round up, the units delivered of B round down. A round trip
 * therefore never gains value, which is what makes a zero-spread market safe.
 *
 * ── Atomicity ───────────────────────────────────────────────────────────────
 *
 * `planAutoSwap` is pure. `executeSwapPlan` writes the legs — each one a
 * `transmutation` debit of A and a `transmutation` credit of B under the
 * caller's transaction group — and MUST run inside the caller's database
 * transaction, together with the payment debit, after the balance row has been
 * locked (`lockBalancesForUpdateSql`). A leg that moves no balance throws, so
 * the transaction rolls back rather than paying from a half-swapped balance.
 *
 * @file src/lib/economy/swappingBridge.ts
 */

import {
  columnFor,
  transmuteSql,
  type AxisAmounts,
} from "@/services/tokenEconomyQueries";
import type { TokenType } from "@/types/economy";
import { TOKEN_TYPES } from "@/types/economy";
import {
  INDEX_ROUND_DIGITS,
  getLiveOracleQuote,
  type OracleQuote,
} from "./priceIndex";

export type { AxisAmounts } from "@/services/tokenEconomyQueries";

/** Ledger precision — `token_transactions.amount` is DECIMAL(12,4). */
export const LEDGER_SCALE = 10_000;

/** Price precision — the EEI is published rounded to INDEX_ROUND_DIGITS. */
const PRICE_SCALE = 10 ** INDEX_ROUND_DIGITS;

/** Value is ledger units × price units; this converts it back to tokens-at-index-1. */
const VALUE_SCALE = LEDGER_SCALE * PRICE_SCALE;

/** Named on every quote and every swap so a reader never has to guess the basis. */
export const SWAP_BASIS = "eei-relative-parity" as const;

/** Internal payments convert at the oracle price with no spread. */
export const SWAP_SPREAD = 0;

/** EEI per token — the one input the bridge prices with. */
export type OraclePrices = Record<TokenType, number>;

/** One conversion: `fromAmount` of `fromToken` becomes `toAmount` of `toToken`. */
export interface SwapLeg {
  fromToken: TokenType;
  toToken: TokenType;
  /** Units of `fromToken` debited. Rounded up to the ledger unit. */
  fromAmount: number;
  /** Units of `toToken` credited. Rounded down to the ledger unit. */
  toAmount: number;
  /** Units of `fromToken` per 1 `toToken` at the quoted prices: P_to / P_from. */
  rate: number;
}

export type SwapPlanRefusal = "insufficient_value";

export interface SwapPlan {
  /** True when the legs (possibly none) leave every axis able to pay. */
  canCover: boolean;
  /** Why the plan cannot cover the payment; null when it can. */
  reason: SwapPlanRefusal | null;
  /** Conversions to execute, in order. Empty when nothing is short or when refused. */
  legs: SwapLeg[];
  /** Per-axis shortfall before swapping. */
  deficits: AxisAmounts;
  /** Per-axis excess over the cost before swapping. */
  surpluses: AxisAmounts;
  /** Surplus coins in the order the waterfall draws on them, richest first. */
  surplusOrder: TokenType[];
  /** Balances after the legs and before the payment. Every axis ≥ its cost when canCover. */
  postSwapBalances: AxisAmounts;
  /** Σ deficit × price, in tokens-at-index-1.0. */
  deficitValue: number;
  /** Σ surplus × price, in tokens-at-index-1.0. */
  surplusValue: number;
  /** Value still uncovered when refused; 0 when the plan covers the payment. */
  shortfallValue: number;
  /** The prices the plan was computed at. */
  prices: OraclePrices;
}

/** What a payer is told happened: surfaced verbatim in API responses. */
export interface AutoSwapExecution {
  basis: typeof SWAP_BASIS;
  spread: typeof SWAP_SPREAD;
  legs: SwapLeg[];
  prices: OraclePrices;
  priceBucketStartUtc: string;
  /** Degrade reasons of the price sample, when it was not fully live. */
  degraded: string[] | null;
}

/** Why an auto-swap that was allowed did not fund the payment. */
export type AutoSwapRefusalReason =
  /** Total surplus value cannot cover the total deficit value. */
  | "insufficient_value"
  /** The oracle could not price the coins; the bridge never swaps at a guessed rate. */
  | "rates_unavailable"
  /** The payer has no balance row, so there is nothing to swap. */
  | "no_balance";

export interface AutoSwapRefusal {
  reason: AutoSwapRefusalReason;
  /** Uncovered value in tokens-at-index-1.0; null when no plan was computed. */
  shortfallValue: number | null;
  /** Per-axis shortfall before swapping; null when no plan was computed. */
  deficits: AxisAmounts | null;
}

/** The oracle could not produce a usable price for every coin. */
export class SwapPricingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SwapPricingError";
  }
}

/** A leg moved no balance inside the payment transaction. Throwing rolls it back. */
export class SwapLegFailedError extends Error {
  constructor(
    readonly leg: SwapLeg,
    readonly legIndex: number,
  ) {
    super(
      `swapping-bridge: leg ${legIndex} (${leg.fromAmount} ${leg.fromToken} → ` +
        `${leg.toAmount} ${leg.toToken}) moved no balance; rolling the payment back`,
    );
    this.name = "SwapLegFailedError";
  }
}

// ─── Exact arithmetic ────────────────────────────────────────────────────────

/** A non-negative amount in ledger units. Non-finite and negative read as 0. */
function toLedgerUnits(value: number): bigint {
  if (!Number.isFinite(value) || value <= 0) return 0n;
  return BigInt(Math.round(value * LEDGER_SCALE));
}

function fromLedgerUnits(units: bigint): number {
  return Number(units) / LEDGER_SCALE;
}

function ceilDiv(numerator: bigint, denominator: bigint): bigint {
  return (numerator + denominator - 1n) / denominator;
}

function valueToNumber(value: bigint): number {
  return Number(value) / VALUE_SCALE;
}

function roundTo(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

/**
 * Prices as integer units at the oracle's published precision. Throws on any
 * price that is missing, non-finite, or rounds to zero: dividing by it would
 * mint coins from nothing, and a broken quote must never price a swap.
 */
function toPriceUnits(prices: OraclePrices): Record<TokenType, bigint> {
  const units = {} as Record<TokenType, bigint>;
  for (const token of TOKEN_TYPES) {
    const price = prices[token];
    const scaled =
      typeof price === "number" && Number.isFinite(price)
        ? Math.round(price * PRICE_SCALE)
        : 0;
    if (!(scaled > 0)) {
      throw new SwapPricingError(
        `swapping-bridge: no usable price for ${token} (${String(price)})`,
      );
    }
    units[token] = BigInt(scaled);
  }
  return units;
}

const AXIS_OF = (token: TokenType): keyof AxisAmounts => columnFor(token);

function axisAmounts(
  perToken: Record<TokenType, bigint>,
): AxisAmounts {
  return {
    spirit: fromLedgerUnits(perToken.Spirit),
    essence: fromLedgerUnits(perToken.Essence),
    matter: fromLedgerUnits(perToken.Matter),
    substance: fromLedgerUnits(perToken.Substance),
  };
}

function zeroPerToken(): Record<TokenType, bigint> {
  return { Spirit: 0n, Essence: 0n, Matter: 0n, Substance: 0n };
}

// ─── Rates ───────────────────────────────────────────────────────────────────

/**
 * Units of `fromToken` per 1 `toToken` at these prices: P_to / P_from.
 * The rate the public sheet quotes and the rate every leg is booked at.
 */
export function oracleRate(
  prices: OraclePrices,
  fromToken: TokenType,
  toToken: TokenType,
): number {
  const units = toPriceUnits(prices);
  return Number(units[toToken]) / Number(units[fromToken]);
}

/**
 * Units of `fromToken` a payer spends to receive exactly `targetAmount` of
 * `toToken`, rounded up to the ledger unit — the same conversion a waterfall
 * leg books, so a manual swap and an auto-swap of the same amount cost the same.
 */
export function quoteSourceAmount(
  prices: OraclePrices,
  fromToken: TokenType,
  toToken: TokenType,
  targetAmount: number,
): number {
  const units = toPriceUnits(prices);
  const target = toLedgerUnits(targetAmount);
  if (fromToken === toToken) return fromLedgerUnits(target);
  return fromLedgerUnits(
    ceilDiv(target * units[toToken], units[fromToken]),
  );
}

/**
 * Throws `SwapPricingError` unless every coin has a usable price. Lets a caller
 * refuse BEFORE opening a transaction, rather than discover it mid-payment.
 */
export function assertUsablePrices(prices: OraclePrices): void {
  toPriceUnits(prices);
}

/** The live price feed, read at the current oracle bucket. Throws on engine failure. */
export function getLiveSwapQuote(now: Date = new Date()): OracleQuote {
  return getLiveOracleQuote(now);
}

// ─── Planning ────────────────────────────────────────────────────────────────

/**
 * Plan the conversions that let `balances` pay `costs` at `prices`.
 *
 * Pure: no I/O, no clock. Throws `SwapPricingError` when a price is unusable.
 */
export function planAutoSwap(input: {
  costs: AxisAmounts;
  balances: AxisAmounts;
  prices: OraclePrices;
}): SwapPlan {
  const price = toPriceUnits(input.prices);
  const deficit = zeroPerToken();
  const surplus = zeroPerToken();
  const balance = zeroPerToken();

  for (const token of TOKEN_TYPES) {
    const axis = AXIS_OF(token);
    const cost = toLedgerUnits(input.costs[axis]);
    const held = toLedgerUnits(input.balances[axis]);
    balance[token] = held;
    if (held >= cost) surplus[token] = held - cost;
    else deficit[token] = cost - held;
  }

  const valueOf = (units: bigint, token: TokenType): bigint => units * price[token];
  const sumValue = (perToken: Record<TokenType, bigint>): bigint =>
    TOKEN_TYPES.reduce((sum, token) => sum + valueOf(perToken[token], token), 0n);

  const deficitValue = sumValue(deficit);
  const surplusValue = sumValue(surplus);

  const compare = (a: bigint, b: bigint): number => (a > b ? 1 : a < b ? -1 : 0);
  const surplusOrder = TOKEN_TYPES.filter((token) => surplus[token] > 0n).sort(
    (a, b) =>
      compare(valueOf(surplus[b], b), valueOf(surplus[a], a)) ||
      compare(surplus[b], surplus[a]) ||
      TOKEN_TYPES.indexOf(a) - TOKEN_TYPES.indexOf(b),
  );

  const base = {
    deficits: axisAmounts(deficit),
    surpluses: axisAmounts(surplus),
    surplusOrder,
    deficitValue: valueToNumber(deficitValue),
    surplusValue: valueToNumber(surplusValue),
    prices: { ...input.prices },
  };
  const refuse = (uncovered: bigint): SwapPlan => ({
    ...base,
    canCover: false,
    reason: "insufficient_value",
    legs: [],
    postSwapBalances: axisAmounts(balance),
    shortfallValue: valueToNumber(uncovered),
  });

  if (deficitValue === 0n) {
    return {
      ...base,
      canCover: true,
      reason: null,
      legs: [],
      postSwapBalances: axisAmounts(balance),
      shortfallValue: 0,
    };
  }
  if (surplusValue < deficitValue) return refuse(deficitValue - surplusValue);

  const remaining = { ...surplus };
  const after = { ...balance };
  const legs: SwapLeg[] = [];
  let uncoveredValue = 0n;

  for (const target of TOKEN_TYPES) {
    let need = deficit[target];
    for (const source of surplusOrder) {
      if (need === 0n) break;
      const available = remaining[source];
      if (available === 0n) continue;

      // Units of `source` that buy the WHOLE remaining deficit, rounded up so
      // the payer never gains value on the conversion.
      const wholeCost = ceilDiv(need * price[target], price[source]);
      let spent: bigint;
      let received: bigint;
      if (wholeCost <= available) {
        spent = wholeCost;
        received = need;
      } else {
        // `source` cannot cover it: take what it can buy (rounded down), then
        // charge only what that costs (rounded up, ≤ available), and let the
        // rest overflow to the next-richest coin.
        received = (available * price[source]) / price[target];
        if (received === 0n) continue; // dust: cannot buy one ledger unit
        spent = ceilDiv(received * price[target], price[source]);
      }

      remaining[source] -= spent;
      after[source] -= spent;
      after[target] += received;
      need -= received;
      legs.push({
        fromToken: source,
        toToken: target,
        fromAmount: fromLedgerUnits(spent),
        toAmount: fromLedgerUnits(received),
        rate: roundTo(Number(price[target]) / Number(price[source]), 8),
      });
    }
    uncoveredValue += valueOf(need, target);
  }

  // Aggregate value sufficed but per-leg rounding (at most one ledger unit
  // against the payer per leg) left a sliver uncovered. Refusing is the only
  // honest answer: a partial swap would convert coins and still not pay.
  if (uncoveredValue > 0n) return refuse(uncoveredValue);

  return {
    ...base,
    canCover: true,
    reason: null,
    legs,
    postSwapBalances: axisAmounts(after),
    shortfallValue: 0,
  };
}

// ─── Execution ───────────────────────────────────────────────────────────────

/** Runs one statement on the caller's transaction client. */
export type LedgerQuery = (
  sql: string,
  values: unknown[],
) => Promise<{ rows: Array<Record<string, unknown>> }>;

/**
 * The idempotency key prefix for leg `legIndex` of a payment keyed `paymentKey`.
 *
 * Kept under the payment's own prefix on purpose: the existing
 * `idempotencyProbeSql(paymentKey)` matches `<paymentKey>:%`, so a replayed
 * payment that already swapped is recognised as already applied.
 * `transmuteSql` appends `:<TokenType>` to each half of the leg.
 */
export function swapLegIdempotencyKey(paymentKey: string, legIndex: number): string {
  return `${paymentKey}:swap${legIndex}`;
}

/** `token_transactions.idempotency_key` is VARCHAR(255). */
const IDEMPOTENCY_KEY_MAX = 255;
/** The longest `:<TokenType>` suffix `transmuteSql` appends. */
const LONGEST_TOKEN_SUFFIX = Math.max(...TOKEN_TYPES.map((t) => t.length + 1));

/**
 * The key a leg is written under, or null when it would not fit the column.
 *
 * A caller's payment key is only validated as non-empty, and a leg key is a few
 * characters longer than the payment's own rows. Rather than let a long key
 * fail the whole payment with 22001, that leg is written unkeyed: it commits in
 * the same transaction as the payment rows, whose own keys still reject a
 * replayed payment — and with it, the leg.
 */
function legKey(paymentKey: string | null, legIndex: number): string | null {
  if (!paymentKey) return null;
  const key = swapLegIdempotencyKey(paymentKey, legIndex);
  return key.length + LONGEST_TOKEN_SUFFIX <= IDEMPOTENCY_KEY_MAX ? key : null;
}

/**
 * Write every leg of `plan` as a transmutation under `transactionGroupId`.
 *
 * MUST run inside the transaction that also writes the payment debit, after
 * the balance row was locked and `plan` was computed from the locked row. A leg
 * that moves no balance throws `SwapLegFailedError` so that transaction rolls
 * back; a database error propagates for the same reason.
 *
 * @returns the balance row after the last leg, or null when there were none.
 */
export async function executeSwapPlan(
  query: LedgerQuery,
  args: {
    userId: string;
    plan: SwapPlan;
    transactionGroupId: string;
    /** The payment's idempotency key prefix; null disables per-leg keys. */
    idempotencyKey: string | null;
    /** What the swap paid for, written into the ledger descriptions. */
    purpose: string;
  },
): Promise<Record<string, unknown> | null> {
  if (!args.plan.canCover) {
    throw new Error(
      "swapping-bridge: refusing to execute a plan that cannot cover the payment",
    );
  }

  let lastRow: Record<string, unknown> | null = null;
  for (const [legIndex, leg] of args.plan.legs.entries()) {
    const statement = transmuteSql({
      fromColumn: columnFor(leg.fromToken),
      toColumn: columnFor(leg.toToken),
      userId: args.userId,
      costAmount: leg.fromAmount,
      targetAmount: leg.toAmount,
      transactionGroupId: args.transactionGroupId,
      fromToken: leg.fromToken,
      toToken: leg.toToken,
      debitDescription:
        `Auto-swap ${leg.fromAmount} ${leg.fromToken} → ${leg.toAmount} ${leg.toToken} ` +
        `@ ${leg.rate} (EEI parity) for ${args.purpose}`,
      creditDescription:
        `Auto-swap received ${leg.toAmount} ${leg.toToken} from ${leg.fromToken} ` +
        `for ${args.purpose}`,
      idempotencyKey: legKey(args.idempotencyKey, legIndex),
    });
    const result = await query(statement.sql, statement.values);
    const [row] = result.rows;
    if (!row) throw new SwapLegFailedError(leg, legIndex);
    lastRow = row;
  }
  return lastRow;
}

/** The client-facing record of an executed plan. */
export function describeExecution(
  plan: SwapPlan,
  quote: OracleQuote,
): AutoSwapExecution {
  return {
    basis: SWAP_BASIS,
    spread: SWAP_SPREAD,
    legs: plan.legs.map((leg) => ({ ...leg })),
    prices: { ...quote.prices },
    priceBucketStartUtc: quote.bucketStartUtc,
    degraded: quote.degraded ? [...quote.degraded] : null,
  };
}

/** The client-facing record of a refused plan. */
export function describeRefusal(plan: SwapPlan): AutoSwapRefusal {
  return {
    reason: plan.reason ?? "insufficient_value",
    shortfallValue: plan.shortfallValue,
    deficits: { ...plan.deficits },
  };
}

// ─── Refunds ─────────────────────────────────────────────────────────────────

/**
 * The credit that restores a payer exactly to where they stood before an
 * auto-swapped payment: the payment basket, minus what the swaps delivered,
 * plus what they consumed.
 *
 * Never negative: a leg delivers at most the deficit on its axis, and the
 * deficit is at most the cost on that axis. So the whole reversal is a pure
 * CREDIT — the swaps are undone without debiting anything back, and a refund
 * cannot fail for want of balance.
 */
export function refundBasketAfterSwap(
  costs: AxisAmounts,
  legs: readonly SwapLeg[],
): AxisAmounts {
  const net = zeroPerToken();
  for (const token of TOKEN_TYPES) {
    net[token] = toLedgerUnits(costs[AXIS_OF(token)]);
  }
  for (const leg of legs) {
    net[leg.toToken] -= toLedgerUnits(leg.toAmount);
    net[leg.fromToken] += toLedgerUnits(leg.fromAmount);
  }
  for (const token of TOKEN_TYPES) {
    if (net[token] < 0n) net[token] = 0n;
  }
  return axisAmounts(net);
}
