/**
 * @jest-environment node
 *
 * The Swapping Bridge — waterfall planning, EEI-parity rates, and the ledger
 * contract its execution relies on.
 *
 * Prices are injected; nothing reads the live sky. The oracle module is mocked
 * so this suite exercises the bridge's own arithmetic, not the ephemeris —
 * `priceIndex.test.ts` pins the feed itself, including its parity with the
 * published snapshot.
 *
 * The price fixture is chosen so every expected number is exact by hand:
 *   Spirit 1.00, Essence 1.25, Matter 0.80, Substance 1.60
 * so 1 Essence costs 1.25 Spirit, 1 Matter costs 0.8 Spirit, and so on.
 */

const getLiveOracleQuote = jest.fn();
jest.mock("@/lib/economy/priceIndex", () => ({
  INDEX_ROUND_DIGITS: 4,
  getLiveOracleQuote: (...args: unknown[]) => getLiveOracleQuote(...args),
}));

import {
  SWAP_BASIS,
  SWAP_SPREAD,
  SwapLegFailedError,
  SwapPricingError,
  describeExecution,
  describeRefusal,
  executeSwapPlan,
  getLiveSwapQuote,
  oracleRate,
  planAutoSwap,
  quoteSourceAmount,
  refundBasketAfterSwap,
  swapLegIdempotencyKey,
  type AxisAmounts,
  type LedgerQuery,
  type OraclePrices,
  type SwapPlan,
} from "@/lib/economy/swappingBridge";
import type { TokenType } from "@/types/economy";
import { TOKEN_TYPES } from "@/types/economy";

const PRICES: OraclePrices = {
  Spirit: 1.0,
  Essence: 1.25,
  Matter: 0.8,
  Substance: 1.6,
};

/** The cosmic-recipe base: 2.5 of each axis (migration 90). */
const COSMIC: AxisAmounts = { spirit: 2.5, essence: 2.5, matter: 2.5, substance: 2.5 };

const axes = (
  spirit: number,
  essence: number,
  matter: number,
  substance: number,
): AxisAmounts => ({ spirit, essence, matter, substance });

const AXIS: Record<TokenType, keyof AxisAmounts> = {
  Spirit: "spirit",
  Essence: "essence",
  Matter: "matter",
  Substance: "substance",
};

/** Σ amount × price over a basket, in tokens-at-index-1. */
const valueOf = (basket: AxisAmounts, prices: OraclePrices = PRICES): number =>
  TOKEN_TYPES.reduce((sum, t) => sum + basket[AXIS[t]] * prices[t], 0);

/** The legs as `from→to:fromAmount/toAmount` strings — compact and exact. */
const legShape = (plan: SwapPlan): string[] =>
  plan.legs.map((l) => `${l.fromToken}→${l.toToken}:${l.fromAmount}/${l.toAmount}`);

/** Every axis of `post` can pay `cost`. */
const covers = (post: AxisAmounts, cost: AxisAmounts): boolean =>
  TOKEN_TYPES.every((t) => post[AXIS[t]] >= cost[AXIS[t]] - 1e-9);

describe("planAutoSwap — nothing to do", () => {
  it("returns no legs when every axis already covers its cost", () => {
    const plan = planAutoSwap({ costs: COSMIC, balances: axes(3, 3, 3, 3), prices: PRICES });
    expect(plan.canCover).toBe(true);
    expect(plan.reason).toBeNull();
    expect(plan.legs).toEqual([]);
    expect(plan.deficits).toEqual(axes(0, 0, 0, 0));
    expect(plan.postSwapBalances).toEqual(axes(3, 3, 3, 3));
  });

  it("treats an exactly-funded axis as covered (no zero-amount legs)", () => {
    const plan = planAutoSwap({ costs: COSMIC, balances: COSMIC, prices: PRICES });
    expect(plan.canCover).toBe(true);
    expect(plan.legs).toEqual([]);
  });
});

describe("planAutoSwap — multi-token deficits", () => {
  it("covers two short axes from the one surplus coin at P_B / P_A", () => {
    // Essence short 2.5, Matter short 1.5; only Spirit has surplus (17.5).
    const plan = planAutoSwap({
      costs: COSMIC,
      balances: axes(20, 0, 1, 2.5),
      prices: PRICES,
    });

    expect(plan.canCover).toBe(true);
    expect(plan.deficits).toEqual(axes(0, 2.5, 1.5, 0));
    expect(plan.surpluses).toEqual(axes(17.5, 0, 0, 0));
    // 2.5 Essence × 1.25/1.00 = 3.125 Spirit; 1.5 Matter × 0.80/1.00 = 1.2 Spirit.
    expect(legShape(plan)).toEqual([
      "Spirit→Essence:3.125/2.5",
      "Spirit→Matter:1.2/1.5",
    ]);
    expect(plan.postSwapBalances).toEqual(axes(15.675, 2.5, 2.5, 2.5));
    expect(covers(plan.postSwapBalances, COSMIC)).toBe(true);
  });

  it("draws every deficit from the richest coin first", () => {
    // Surpluses: Spirit 2 (value 2.0), Substance 3 (value 4.8) → Substance first.
    const plan = planAutoSwap({
      costs: axes(1, 2, 2, 1),
      balances: axes(3, 0, 0, 4),
      prices: PRICES,
    });
    expect(plan.surplusOrder).toEqual(["Substance", "Spirit"]);
    // Essence 2 × 1.25/1.6 = 1.5625 Sub; Matter 2 × 0.8/1.6 = 1.0 Sub (1.5625+1 ≤ 3).
    expect(legShape(plan)).toEqual([
      "Substance→Essence:1.5625/2",
      "Substance→Matter:1/2",
    ]);
    expect(plan.postSwapBalances).toEqual(axes(3, 2, 2, 1.4375));
  });

  it("conserves value exactly when no rounding is involved", () => {
    const balances = axes(20, 0, 1, 2.5);
    const plan = planAutoSwap({ costs: COSMIC, balances, prices: PRICES });
    expect(valueOf(plan.postSwapBalances)).toBeCloseTo(valueOf(balances), 10);
  });
});

describe("planAutoSwap — single-token massive surplus", () => {
  it("funds all three empty axes from one coin and leaves the rest untouched", () => {
    const plan = planAutoSwap({
      costs: COSMIC,
      balances: axes(1000, 0, 0, 0),
      prices: PRICES,
    });
    expect(plan.canCover).toBe(true);
    expect(plan.surplusOrder).toEqual(["Spirit"]);
    // Essence 2.5×1.25 = 3.125, Matter 2.5×0.8 = 2, Substance 2.5×1.6 = 4.
    expect(legShape(plan)).toEqual([
      "Spirit→Essence:3.125/2.5",
      "Spirit→Matter:2/2.5",
      "Spirit→Substance:4/2.5",
    ]);
    // 1000 − 2.5 (its own cost) − 9.125 swapped = 988.375 left after payment.
    expect(plan.postSwapBalances).toEqual(axes(990.875, 2.5, 2.5, 2.5));
    expect(plan.postSwapBalances.spirit - COSMIC.spirit).toBe(988.375);
  });
});

describe("planAutoSwap — waterfall overflow", () => {
  it("exhausts the richest coin, then overflows to the next, then the next", () => {
    // Essence short 10 (value 12.5). Surpluses by value: Spirit 6 (6.0),
    // Matter 5 (4.0), Substance 2 (3.2) — total 13.2, so it CAN cover.
    const costs = axes(0, 10, 0, 0);
    const plan = planAutoSwap({ costs, balances: axes(6, 0, 5, 2), prices: PRICES });

    expect(plan.canCover).toBe(true);
    expect(plan.surplusOrder).toEqual(["Spirit", "Matter", "Substance"]);
    expect(legShape(plan)).toEqual([
      // Spirit buys 6 × 1.00/1.25 = 4.8 Essence and is exhausted.
      "Spirit→Essence:6/4.8",
      // Matter buys 5 × 0.80/1.25 = 3.2 Essence and is exhausted.
      "Matter→Essence:5/3.2",
      // Substance covers the last 2.0 for 2 × 1.25/1.60 = 1.5625.
      "Substance→Essence:1.5625/2",
    ]);
    expect(plan.postSwapBalances).toEqual(axes(0, 10, 0, 0.4375));
    expect(covers(plan.postSwapBalances, costs)).toBe(true);
  });

  it("overflows ACROSS deficits: the richest coin drained by one deficit is not reused by the next", () => {
    // Surpluses: Substance 2 (value 3.2) then Spirit 3 (value 3.0).
    const costs = axes(0, 2, 2, 0);
    const plan = planAutoSwap({ costs, balances: axes(3, 0, 0, 2), prices: PRICES });
    expect(plan.surplusOrder).toEqual(["Substance", "Spirit"]);
    expect(legShape(plan)).toEqual([
      // Essence 2 × 1.25/1.60 = 1.5625 Substance, leaving 0.4375.
      "Substance→Essence:1.5625/2",
      // The remaining 0.4375 Substance buys 0.875 Matter and is exhausted…
      "Substance→Matter:0.4375/0.875",
      // …so the last 1.125 Matter overflows to Spirit at 0.80/1.00.
      "Spirit→Matter:0.9/1.125",
    ]);
    expect(plan.postSwapBalances).toEqual(axes(2.1, 2, 2, 0));
    expect(covers(plan.postSwapBalances, costs)).toBe(true);
  });

  it("orders by VALUE, not units: fewer units of a dearer coin can be richer", () => {
    // Matter 10 units × 0.8 = 8.0; Substance 6 units × 1.6 = 9.6.
    const plan = planAutoSwap({
      costs: axes(1, 0, 0, 0),
      balances: axes(0, 0, 10, 6),
      prices: PRICES,
    });
    expect(plan.surplusOrder).toEqual(["Substance", "Matter"]);
    expect(plan.legs[0]?.fromToken).toBe("Substance");
  });

  it("breaks value ties by units, then canonical order — a plan is a pure function", () => {
    const flat: OraclePrices = { Spirit: 1, Essence: 1, Matter: 1, Substance: 1 };
    const plan = planAutoSwap({
      costs: axes(0, 0, 0, 3),
      balances: axes(0, 5, 5, 0),
      prices: flat,
    });
    expect(plan.surplusOrder).toEqual(["Essence", "Matter"]);
    const again = planAutoSwap({
      costs: axes(0, 0, 0, 3),
      balances: axes(0, 5, 5, 0),
      prices: flat,
    });
    expect(again).toEqual(plan);
  });
});

describe("planAutoSwap — refusals", () => {
  it("returns canCover: false and NO legs when total surplus value cannot cover the deficit", () => {
    // Essence short 10 (value 12.5); surplus value 6 + 4 + 1.6 = 11.6.
    const plan = planAutoSwap({
      costs: axes(0, 10, 0, 0),
      balances: axes(6, 0, 5, 1),
      prices: PRICES,
    });
    expect(plan.canCover).toBe(false);
    expect(plan.reason).toBe("insufficient_value");
    expect(plan.legs).toEqual([]);
    expect(plan.deficitValue).toBe(12.5);
    expect(plan.surplusValue).toBeCloseTo(11.6, 10);
    expect(plan.shortfallValue).toBeCloseTo(0.9, 10);
    // A refused plan moves nothing, even on paper.
    expect(plan.postSwapBalances).toEqual(axes(6, 0, 5, 1));
  });

  it("refuses a payer with nothing at all", () => {
    const plan = planAutoSwap({ costs: COSMIC, balances: axes(0, 0, 0, 0), prices: PRICES });
    expect(plan.canCover).toBe(false);
    expect(plan.shortfallValue).toBeCloseTo(valueOf(COSMIC), 10);
  });

  it("refuses rather than half-swap when rounding leaves a sliver uncovered", () => {
    // Surplus value (2×0.3 + 1×0.1 = 0.0007 in ledger units × price) EQUALS the
    // deficit value (1 unit of a 0.7 coin), but neither surplus coin can buy a
    // single whole ledger unit of the target. Aggregate value alone would say
    // "covered"; the executable waterfall cannot, so it must refuse.
    const prices: OraclePrices = { Spirit: 0.3, Essence: 0.7, Matter: 0.1, Substance: 1 };
    const plan = planAutoSwap({
      costs: axes(0, 0.0001, 0, 0),
      balances: axes(0.0002, 0, 0.0001, 0),
      prices,
    });
    expect(plan.surplusValue).toBe(plan.deficitValue);
    expect(plan.canCover).toBe(false);
    expect(plan.legs).toEqual([]);
    expect(plan.shortfallValue).toBeGreaterThan(0);
  });

  it("throws SwapPricingError on an unusable price instead of dividing by it", () => {
    for (const bad of [0, -1, Number.NaN, Number.POSITIVE_INFINITY, 0.00001]) {
      expect(() =>
        planAutoSwap({
          costs: COSMIC,
          balances: axes(100, 0, 0, 0),
          prices: { ...PRICES, Essence: bad },
        }),
      ).toThrow(SwapPricingError);
    }
    const missing = { Spirit: 1, Essence: 1, Matter: 1 } as unknown as OraclePrices;
    expect(() =>
      planAutoSwap({ costs: COSMIC, balances: axes(100, 0, 0, 0), prices: missing }),
    ).toThrow(SwapPricingError);
  });
});

describe("relative rates — P_B / P_A, no spread", () => {
  it("prices one B at P_B / P_A units of A, and the reverse at the reciprocal", () => {
    expect(oracleRate(PRICES, "Spirit", "Essence")).toBe(1.25);
    expect(oracleRate(PRICES, "Essence", "Spirit")).toBe(0.8);
    expect(oracleRate(PRICES, "Matter", "Substance")).toBe(2);
    for (const a of TOKEN_TYPES) {
      for (const b of TOKEN_TYPES) {
        expect(oracleRate(PRICES, a, b) * oracleRate(PRICES, b, a)).toBeCloseTo(1, 12);
      }
    }
  });

  it("books every leg at exactly the rate the sheet quotes", () => {
    const plan = planAutoSwap({ costs: COSMIC, balances: axes(1000, 0, 0, 0), prices: PRICES });
    for (const leg of plan.legs) {
      expect(leg.rate).toBe(oracleRate(PRICES, leg.fromToken, leg.toToken));
      expect(leg.fromAmount).toBeCloseTo(leg.toAmount * leg.rate, 10);
    }
  });

  it("is 1:1 in VALUE: a leg delivers what it consumes, before ledger rounding", () => {
    const plan = planAutoSwap({ costs: COSMIC, balances: axes(1000, 0, 0, 0), prices: PRICES });
    for (const leg of plan.legs) {
      expect(leg.fromAmount * PRICES[leg.fromToken]).toBeCloseTo(
        leg.toAmount * PRICES[leg.toToken],
        10,
      );
    }
  });

  it("rounds the payer's side UP to the ledger unit on live-shaped 4dp prices", () => {
    // The [GOLDEN] fixture-sky row from priceIndex.test.ts.
    const live: OraclePrices = {
      Spirit: 1.0149,
      Essence: 1.0483,
      Matter: 1.1302,
      Substance: 1.1401,
    };
    // 1 Essence = 1.0483 / 1.0149 = 1.03290964… Spirit → 1.0330 at 4dp, rounded up.
    expect(quoteSourceAmount(live, "Spirit", "Essence", 1)).toBe(1.033);
    const plan = planAutoSwap({
      costs: axes(0, 1, 0, 0),
      balances: axes(10, 0, 0, 0),
      prices: live,
    });
    expect(legShape(plan)).toEqual(["Spirit→Essence:1.033/1"]);
    // The manual-swap quote and the auto-swap leg agree to the ledger unit.
    expect(plan.legs[0]?.fromAmount).toBe(quoteSourceAmount(live, "Spirit", "Essence", 1));
  });

  it("never lets a round trip gain value (rounding always runs against the payer)", () => {
    const live: OraclePrices = { Spirit: 1.0149, Essence: 1.0483, Matter: 1.1302, Substance: 1.1401 };
    for (const a of TOKEN_TYPES) {
      for (const b of TOKEN_TYPES) {
        if (a === b) continue;
        for (const amount of [0.0001, 0.0007, 0.3333, 1, 2.5, 17.1234]) {
          const spentA = quoteSourceAmount(live, a, b, amount);
          const spentBack = quoteSourceAmount(live, b, a, spentA);
          // Getting `spentA` of A back costs at least the `amount` of B it bought.
          expect(spentBack).toBeGreaterThanOrEqual(amount);
        }
      }
    }
  });

  it("reads prices from the live oracle feed", () => {
    const quote = {
      bucketStartUtc: "2026-09-30T12:00:00.000Z",
      prices: PRICES,
      degraded: null,
    };
    getLiveOracleQuote.mockReturnValueOnce(quote);
    const at = new Date("2026-09-30T12:00:30Z");
    expect(getLiveSwapQuote(at)).toBe(quote);
    expect(getLiveOracleQuote).toHaveBeenCalledWith(at);
  });
});

// ─── Execution and ledger atomicity ─────────────────────────────────────────

/**
 * A minimal transactional ledger: enough of PostgreSQL to hold balances and
 * rows, apply the transmute statement the bridge sends (by its bound values),
 * and roll everything back when the transaction body throws — the contract
 * `withTransaction` gives the real callers.
 */
function fakeLedger(start: AxisAmounts) {
  interface Row {
    group: string;
    token: string;
    amount: number;
    source: string;
    key: string | null;
  }
  let balances = { ...start };
  let rows: Row[] = [];
  const statements: Array<{ sql: string; values: unknown[] }> = [];
  let failOnLeg: number | null = null;
  let throwOnLeg: number | null = null;
  let legCount = 0;

  const query: LedgerQuery = (sql, values) => {
    statements.push({ sql, values });
    // transmuteSql binds: user, cost, target, group, fromToken, debitDesc,
    // toToken, creditDesc, idempotencyKey.
    const [, cost, target, group, fromToken, , toToken, , key] = values as [
      string, number, number, string, TokenType, string, TokenType, string, string | null,
    ];
    const index = legCount++;
    if (throwOnLeg === index) return Promise.reject(new Error("connection reset"));
    const from = AXIS[fromToken];
    const to = AXIS[toToken];
    if (failOnLeg === index || balances[from] < cost) return Promise.resolve({ rows: [] });
    balances = { ...balances, [from]: balances[from] - cost, [to]: balances[to] + target };
    rows.push(
      { group, token: fromToken, amount: -cost, source: "transmutation", key: key && `${key}:${fromToken}` },
      { group, token: toToken, amount: target, source: "transmutation", key: key && `${key}:${toToken}` },
    );
    return Promise.resolve({ rows: [{ ...balances }] });
  };

  /** The payment debit: refuses unless every axis covers its share. */
  const pay = (cost: AxisAmounts, group: string) => {
    if (!TOKEN_TYPES.every((t) => balances[AXIS[t]] >= cost[AXIS[t]])) {
      throw new Error("payment refused after swaps");
    }
    for (const t of TOKEN_TYPES) {
      const amount = cost[AXIS[t]];
      if (amount <= 0) continue;
      balances = { ...balances, [AXIS[t]]: balances[AXIS[t]] - amount };
      rows.push({ group, token: t, amount: -amount, source: "premium_purchase", key: null });
    }
  };

  /** BEGIN … COMMIT, or ROLLBACK to the pre-transaction state on throw. */
  const withTransaction = async <T>(body: () => Promise<T>): Promise<T> => {
    const savedBalances = { ...balances };
    const savedRows = [...rows];
    try {
      return await body();
    } catch (error) {
      balances = savedBalances;
      rows = savedRows;
      throw error;
    }
  };

  return {
    query,
    pay,
    withTransaction,
    statements,
    failLeg: (i: number) => (failOnLeg = i),
    throwOnLeg: (i: number) => (throwOnLeg = i),
    get balances() {
      return balances;
    },
    get rows() {
      return rows;
    },
  };
}

const GROUP = "0f0f0f0f-0000-4000-8000-000000000001";

describe("executeSwapPlan — the ledger writes", () => {
  it("writes one transmute statement per leg, in plan order, under ONE group", async () => {
    const start = axes(20, 0, 1, 2.5);
    const plan = planAutoSwap({ costs: COSMIC, balances: start, prices: PRICES });
    const ledger = fakeLedger(start);

    await executeSwapPlan(ledger.query, {
      userId: "user-1",
      plan,
      transactionGroupId: GROUP,
      idempotencyKey: "cosmic_recipe_debit:req-1",
      purpose: "Shop: Cosmic Recipe Generation",
    });

    expect(ledger.statements).toHaveLength(plan.legs.length);
    for (const { sql, values } of ledger.statements) {
      expect(sql).toMatch(/'transmutation'/);
      expect(values[3]).toBe(GROUP);
    }
    // Two rows per leg: the source debit and the target credit.
    expect(ledger.rows.map((r) => `${r.source}:${r.token}:${r.amount}`)).toEqual([
      "transmutation:Spirit:-3.125",
      "transmutation:Essence:2.5",
      "transmutation:Spirit:-1.2",
      "transmutation:Matter:1.5",
    ]);
    expect(new Set(ledger.rows.map((r) => r.group))).toEqual(new Set([GROUP]));
    expect(ledger.balances).toEqual(plan.postSwapBalances);
  });

  it("keys each leg under the payment's own idempotency prefix", async () => {
    const start = axes(20, 0, 1, 2.5);
    const plan = planAutoSwap({ costs: COSMIC, balances: start, prices: PRICES });
    const ledger = fakeLedger(start);
    await executeSwapPlan(ledger.query, {
      userId: "user-1",
      plan,
      transactionGroupId: GROUP,
      idempotencyKey: "pay-key",
      purpose: "test",
    });
    expect(ledger.statements.map((s) => s.values[8])).toEqual([
      swapLegIdempotencyKey("pay-key", 0),
      swapLegIdempotencyKey("pay-key", 1),
    ]);
    expect(swapLegIdempotencyKey("pay-key", 1)).toBe("pay-key:swap1");
    // `idempotencyProbeSql("pay-key")` matches `pay-key:%` — so do these.
    for (const row of ledger.rows) expect(row.key?.startsWith("pay-key:")).toBe(true);
  });

  it("writes unkeyed legs when the payment has no idempotency key", async () => {
    const start = axes(20, 0, 1, 2.5);
    const plan = planAutoSwap({ costs: COSMIC, balances: start, prices: PRICES });
    const ledger = fakeLedger(start);
    await executeSwapPlan(ledger.query, {
      userId: "user-1",
      plan,
      transactionGroupId: GROUP,
      idempotencyKey: null,
      purpose: "test",
    });
    expect(ledger.statements.every((s) => s.values[8] === null)).toBe(true);
  });

  it("writes a leg unkeyed rather than overflow the VARCHAR(255) key column", async () => {
    const start = axes(20, 0, 1, 2.5);
    const plan = planAutoSwap({ costs: COSMIC, balances: start, prices: PRICES });
    const ledger = fakeLedger(start);
    // Fits as `<key>:Substance` (the payment's own rows) but not as `<key>:swap0:Substance`.
    const longKey = "k".repeat(255 - ":Substance".length);
    await executeSwapPlan(ledger.query, {
      userId: "user-1",
      plan,
      transactionGroupId: GROUP,
      idempotencyKey: longKey,
      purpose: "test",
    });
    expect(ledger.statements.map((s) => s.values[8])).toEqual([null, null]);
    // A key with room keeps its per-leg keys.
    const roomy = fakeLedger(start);
    await executeSwapPlan(roomy.query, {
      userId: "user-1",
      plan,
      transactionGroupId: GROUP,
      idempotencyKey: "k".repeat(255 - ":swap0:Substance".length),
      purpose: "test",
    });
    expect(roomy.statements.every((s) => typeof s.values[8] === "string")).toBe(true);
  });

  it("refuses to execute a plan that cannot cover the payment", async () => {
    const plan = planAutoSwap({ costs: COSMIC, balances: axes(0, 0, 0, 0), prices: PRICES });
    const ledger = fakeLedger(axes(0, 0, 0, 0));
    await expect(
      executeSwapPlan(ledger.query, {
        userId: "user-1",
        plan,
        transactionGroupId: GROUP,
        idempotencyKey: null,
        purpose: "test",
      }),
    ).rejects.toThrow(/cannot cover/);
    expect(ledger.statements).toHaveLength(0);
  });
});

describe("ledger atomicity — a failure anywhere rolls the whole payment back", () => {
  const start = axes(1000, 0, 0, 0);
  const plan = planAutoSwap({ costs: COSMIC, balances: start, prices: PRICES });

  const run = (ledger: ReturnType<typeof fakeLedger>) =>
    ledger.withTransaction(async () => {
      await executeSwapPlan(ledger.query, {
        userId: "user-1",
        plan,
        transactionGroupId: GROUP,
        idempotencyKey: "k",
        purpose: "test",
      });
      ledger.pay(COSMIC, GROUP);
    });

  it("commits swaps AND payment together, all in one group, on success", async () => {
    const ledger = fakeLedger(start);
    await run(ledger);
    expect(ledger.balances).toEqual(axes(988.375, 0, 0, 0));
    expect(ledger.rows).toHaveLength(plan.legs.length * 2 + 4);
    expect(new Set(ledger.rows.map((r) => r.group))).toEqual(new Set([GROUP]));
  });

  it("throws SwapLegFailedError when a leg moves no balance, and stops there", async () => {
    const ledger = fakeLedger(start);
    ledger.failLeg(1);
    const failure = await run(ledger).catch((e: unknown) => e);
    expect(failure).toBeInstanceOf(SwapLegFailedError);
    expect((failure as SwapLegFailedError).legIndex).toBe(1);
    expect((failure as SwapLegFailedError).leg).toEqual(plan.legs[1]);
    // Leg 2 was never attempted after leg 1 failed.
    expect(ledger.statements).toHaveLength(2);
  });

  it("leaves NO trace of the leg that succeeded before the failure (rolled back)", async () => {
    const ledger = fakeLedger(start);
    ledger.failLeg(2);
    await expect(run(ledger)).rejects.toBeInstanceOf(SwapLegFailedError);
    expect(ledger.balances).toEqual(start);
    expect(ledger.rows).toEqual([]);
  });

  it("propagates a database error mid-plan instead of swallowing it", async () => {
    const ledger = fakeLedger(start);
    ledger.throwOnLeg(1);
    await expect(run(ledger)).rejects.toThrow("connection reset");
    expect(ledger.balances).toEqual(start);
    expect(ledger.rows).toEqual([]);
  });

  it("rolls the swaps back when the payment itself is refused after them", async () => {
    const ledger = fakeLedger(start);
    await expect(
      ledger.withTransaction(async () => {
        await executeSwapPlan(ledger.query, {
          userId: "user-1",
          plan,
          transactionGroupId: GROUP,
          idempotencyKey: "k",
          purpose: "test",
        });
        // A basket the swapped balance cannot pay.
        ledger.pay(axes(2.5, 2.5, 2.5, 99), GROUP);
      }),
    ).rejects.toThrow("payment refused after swaps");
    expect(ledger.balances).toEqual(start);
    expect(ledger.rows).toEqual([]);
  });
});

describe("refundBasketAfterSwap — a refund restores the payer exactly", () => {
  it("credits the basket minus what the swaps delivered plus what they consumed", () => {
    const start = axes(20, 0, 1, 2.5);
    const plan = planAutoSwap({ costs: COSMIC, balances: start, prices: PRICES });
    const refund = refundBasketAfterSwap(COSMIC, plan.legs);
    // Spirit 2.5 + 3.125 + 1.2, Essence 2.5 − 2.5, Matter 2.5 − 1.5, Substance 2.5.
    expect(refund).toEqual(axes(6.825, 0, 1, 2.5));

    const afterPayment = axes(
      plan.postSwapBalances.spirit - COSMIC.spirit,
      plan.postSwapBalances.essence - COSMIC.essence,
      plan.postSwapBalances.matter - COSMIC.matter,
      plan.postSwapBalances.substance - COSMIC.substance,
    );
    const restored = axes(
      afterPayment.spirit + refund.spirit,
      afterPayment.essence + refund.essence,
      afterPayment.matter + refund.matter,
      afterPayment.substance + refund.substance,
    );
    for (const t of TOKEN_TYPES) expect(restored[AXIS[t]]).toBeCloseTo(start[AXIS[t]], 10);
  });

  it("is the plain basket when nothing was swapped", () => {
    expect(refundBasketAfterSwap(COSMIC, [])).toEqual(COSMIC);
  });

  it("is never negative on any axis (a pure credit, so it cannot fail for balance)", () => {
    const plan = planAutoSwap({ costs: axes(0, 10, 0, 0), balances: axes(6, 0, 5, 2), prices: PRICES });
    const refund = refundBasketAfterSwap(axes(0, 10, 0, 0), plan.legs);
    for (const t of TOKEN_TYPES) expect(refund[AXIS[t]]).toBeGreaterThanOrEqual(0);
    expect(refund).toEqual(axes(6, 0, 5, 1.5625));
  });
});

describe("client-facing records", () => {
  it("names the basis, the zero spread, the legs, and the price bucket", () => {
    const plan = planAutoSwap({ costs: COSMIC, balances: axes(20, 0, 1, 2.5), prices: PRICES });
    const record = describeExecution(plan, {
      bucketStartUtc: "2026-09-30T12:00:00.000Z",
      prices: PRICES,
      degraded: null,
    });
    expect(record).toEqual({
      basis: SWAP_BASIS,
      spread: SWAP_SPREAD,
      legs: plan.legs,
      prices: PRICES,
      priceBucketStartUtc: "2026-09-30T12:00:00.000Z",
      degraded: null,
    });
    expect(SWAP_SPREAD).toBe(0);
  });

  it("reports a refusal with its shortfall and per-axis deficits", () => {
    const plan = planAutoSwap({ costs: COSMIC, balances: axes(1, 0, 0, 0), prices: PRICES });
    expect(describeRefusal(plan)).toEqual({
      reason: "insufficient_value",
      shortfallValue: plan.shortfallValue,
      deficits: axes(1.5, 2.5, 2.5, 2.5),
    });
  });
});
