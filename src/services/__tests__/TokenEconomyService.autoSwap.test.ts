/**
 * @jest-environment node
 *
 * purchaseShopItem × the Swapping Bridge.
 *
 * The database is a small transactional fake that interprets the statements
 * the service actually sends — the real builders from tokenEconomyQueries.ts,
 * dispatched by shape and read by their bound values — and restores its state
 * when a transaction body throws, as PostgreSQL's ROLLBACK would. That lets
 * these cases assert outcomes (balances, ledger rows, groups) rather than
 * which mocks were called. The SQL itself is proven against a real PostgreSQL
 * by scripts/checkEconomySqlParses.ts and checkEconomyStatementBehaviour.mjs.
 */

process.env.DATABASE_URL = "postgres://fake/fake";

const getLiveOracleQuote = jest.fn();
jest.mock("@/lib/economy/priceIndex", () => ({
  INDEX_ROUND_DIGITS: 4,
  getLiveOracleQuote: (...args: unknown[]) => getLiveOracleQuote(...args),
}));

type Axis = "spirit" | "essence" | "matter" | "substance";
type Balances = Record<Axis, number>;
interface LedgerRow {
  group: string;
  token: string;
  amount: number;
  source: string;
  key: string | null;
}

const USER = "11111111-2222-4333-8444-555555555555";
const ITEM_ID = "99999999-8888-4777-8666-555555555555";
const SLUG = "unlock-cosmic-recipe";

interface FakeDb {
  balances: Map<string, Balances>;
  ledger: LedgerRow[];
  purchases: Array<{ user: string; item: string; group: string }>;
  transactions: number;
  rolledBack: number;
  failTransmute: boolean;
  failPaymentAfterSwap: boolean;
}

const db: FakeDb = {
  balances: new Map<string, Balances>(),
  ledger: [],
  purchases: [],
  transactions: 0,
  rolledBack: 0,
  failTransmute: false,
  failPaymentAfterSwap: false,
};

const round4 = (n: number): number => Math.round(n * 10_000) / 10_000;
const AXES: readonly Axis[] = ["spirit", "essence", "matter", "substance"];
const TOKEN_AXIS: Record<string, Axis> = {
  Spirit: "spirit",
  Essence: "essence",
  Matter: "matter",
  Substance: "substance",
};
/** The balance column a ledger token name moves; throws on anything else. */
function axisOf(token: string): Axis {
  const axis = TOKEN_AXIS[token];
  if (!axis) throw new Error(`fake db: unknown token ${token}`);
  return axis;
}
const keyOf = (value: unknown): string | null => (value == null ? null : String(value));

function insertLedger(row: LedgerRow): void {
  if (row.key && db.ledger.some((r) => r.key === row.key)) {
    throw Object.assign(new Error("duplicate key value"), { code: "23505" });
  }
  db.ledger.push(row);
}

/** One statement, interpreted by shape. Only what the purchase path sends. */
function run(sql: string, values: unknown[]): { rows: Array<Record<string, unknown>> } {
  if (/FROM shop_items/.test(sql)) {
    return {
      rows: [
        {
          id: ITEM_ID,
          slug: SLUG,
          title: "Cosmic Recipe Generation",
          category: "feature",
          cost_spirit: "2.5",
          cost_essence: "2.5",
          cost_matter: "2.5",
          cost_substance: "2.5",
          is_one_time: false,
          is_active: true,
        },
      ],
    };
  }
  if (/idempotency_key LIKE/.test(sql)) {
    const prefix = String(values[0]).replace(/%$/, "");
    return { rows: db.ledger.some((r) => r.key?.startsWith(prefix)) ? [{ "?column?": 1 }] : [] };
  }
  if (/FOR UPDATE/.test(sql)) {
    const held = db.balances.get(String(values[0]));
    return { rows: held ? [{ ...held }] : [] };
  }
  if (/WITH balance_check AS/.test(sql)) {
    // debitAllTokensSql, purchase intent: user, s, e, m, sub, itemId, desc, idem[, group]
    const user = String(values[0]);
    const itemId = String(values[5]);
    const idem = keyOf(values[7]);
    const group = values[8] == null ? undefined : String(values[8]);
    if (db.failPaymentAfterSwap && group) return { rows: [] };
    const held = db.balances.get(user);
    const want: Balances = {
      spirit: Number(values[1]),
      essence: Number(values[2]),
      matter: Number(values[3]),
      substance: Number(values[4]),
    };
    if (!held || AXES.some((a) => held[a] < want[a])) return { rows: [] };
    const gid = group ?? `gen-${db.ledger.length}`;
    for (const [token, axis] of Object.entries(TOKEN_AXIS)) {
      if (want[axis] <= 0) continue;
      insertLedger({
        group: gid,
        token,
        amount: -want[axis],
        source: "premium_purchase",
        key: idem ? `${idem}:${token}` : null,
      });
    }
    const next = { ...held };
    for (const axis of AXES) next[axis] = round4(held[axis] - want[axis]);
    db.balances.set(user, next);
    db.purchases.push({ user, item: itemId, group: gid });
    return { rows: [{ ...next, txn_group_id: gid, updated_at: new Date() }] };
  }
  if (/check_balance AS/.test(sql) && /'transmutation'/.test(sql)) {
    // transmuteSql: user, cost, target, group, fromToken, debitDesc, toToken, creditDesc, idem
    const user = String(values[0]);
    const cost = Number(values[1]);
    const target = Number(values[2]);
    const group = String(values[3]);
    const fromToken = String(values[4]);
    const toToken = String(values[6]);
    const idem = keyOf(values[8]);
    if (db.failTransmute) return { rows: [] };
    const held = db.balances.get(user);
    const from = axisOf(fromToken);
    const to = axisOf(toToken);
    if (!held || held[from] < cost) return { rows: [] };
    insertLedger({ group, token: fromToken, amount: -cost, source: "transmutation", key: idem ? `${idem}:${fromToken}` : null });
    insertLedger({ group, token: toToken, amount: target, source: "transmutation", key: idem ? `${idem}:${toToken}` : null });
    const next = { ...held, [from]: round4(held[from] - cost), [to]: round4(held[to] + target) };
    db.balances.set(user, next);
    return { rows: [{ ...next }] };
  }
  throw new Error(`fake db: unexpected statement ${sql.slice(0, 60)}`);
}

jest.mock("@/lib/database", () => ({
  executeQuery: (sql: string, values: unknown[] = []) => Promise.resolve(run(sql, values)),
  withTransaction: async <T>(
    op: (client: { query: (sql: string, values: unknown[]) => Promise<unknown> }) => Promise<T>,
  ): Promise<T> => {
    db.transactions += 1;
    const saved = {
      balances: new Map([...db.balances].map(([k, v]) => [k, { ...v }])),
      ledger: [...db.ledger],
      purchases: [...db.purchases],
    };
    try {
      return await op({ query: (sql, values) => Promise.resolve(run(sql, values)) });
    } catch (error) {
      db.rolledBack += 1;
      db.balances = saved.balances;
      db.ledger = saved.ledger;
      db.purchases = saved.purchases;
      throw error;
    }
  },
}));

import { tokenEconomy } from "@/services/TokenEconomyService";

const PRICES = { Spirit: 1.0, Essence: 1.25, Matter: 0.8, Substance: 1.6 };
const COSMIC = { spirit: 2.5, essence: 2.5, matter: 2.5, substance: 2.5 };

function fund(balances: Balances): void {
  db.balances.set(USER, { ...balances });
}

beforeEach(() => {
  db.balances = new Map();
  db.ledger = [];
  db.purchases = [];
  db.transactions = 0;
  db.rolledBack = 0;
  db.failTransmute = false;
  db.failPaymentAfterSwap = false;
  getLiveOracleQuote.mockReset();
  getLiveOracleQuote.mockReturnValue({
    bucketStartUtc: "2026-09-30T12:00:00.000Z",
    prices: PRICES,
    degraded: null,
  });
  jest.spyOn(console, "error").mockImplementation(() => undefined);
  jest.spyOn(console, "warn").mockImplementation(() => undefined);
  jest.spyOn(console, "info").mockImplementation(() => undefined);
  jest.spyOn(console, "log").mockImplementation(() => undefined);
});

afterEach(() => jest.restoreAllMocks());

describe("fast path — a basket the balance can pay is untouched by the bridge", () => {
  it("pays in one statement, opens no transaction, reads no price", async () => {
    fund({ spirit: 10, essence: 10, matter: 10, substance: 10 });
    const result = await tokenEconomy.purchaseShopItem(USER, SLUG);
    expect(result).toMatchObject({ success: true, autoSwap: null });
    expect(db.transactions).toBe(0);
    expect(getLiveOracleQuote).not.toHaveBeenCalled();
    expect(db.balances.get(USER)).toEqual({ spirit: 7.5, essence: 7.5, matter: 7.5, substance: 7.5 });
  });
});

describe("auto-swap — a short basket is funded from surplus coins", () => {
  it("swaps, then pays, in ONE transaction and ONE group", async () => {
    fund({ spirit: 20, essence: 0, matter: 1, substance: 2.5 });
    const result = await tokenEconomy.purchaseShopItem(USER, SLUG, {
      idempotencyKey: "cosmic_recipe_debit:req-1",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(db.transactions).toBe(1);
    expect(db.rolledBack).toBe(0);
    expect(result.autoSwap?.legs).toEqual([
      { fromToken: "Spirit", toToken: "Essence", fromAmount: 3.125, toAmount: 2.5, rate: 1.25 },
      { fromToken: "Spirit", toToken: "Matter", fromAmount: 1.2, toAmount: 1.5, rate: 0.8 },
    ]);
    expect(result.autoSwap).toMatchObject({
      basis: "eei-relative-parity",
      spread: 0,
      prices: PRICES,
      priceBucketStartUtc: "2026-09-30T12:00:00.000Z",
    });
    // 20 − 3.125 − 1.2 − 2.5 = 13.175 Spirit; every other axis paid to zero.
    expect(db.balances.get(USER)).toEqual({ spirit: 13.175, essence: 0, matter: 0, substance: 0 });
    expect(result.balances.spirit).toBe(13.175);

    // Two transmutation legs (debit source + credit target) and the payment,
    // all under the transaction group the caller is handed.
    const group = result.transactionGroupId;
    expect(new Set(db.ledger.map((r) => r.group))).toEqual(new Set([group]));
    expect(db.ledger.map((r) => `${r.source}:${r.token}:${r.amount}`)).toEqual([
      "transmutation:Spirit:-3.125",
      "transmutation:Essence:2.5",
      "transmutation:Spirit:-1.2",
      "transmutation:Matter:1.5",
      "premium_purchase:Spirit:-2.5",
      "premium_purchase:Essence:-2.5",
      "premium_purchase:Matter:-2.5",
      "premium_purchase:Substance:-2.5",
    ]);
    expect(db.purchases).toEqual([{ user: USER, item: ITEM_ID, group }]);
  });

  it("keys every swap row under the purchase's idempotency prefix", async () => {
    fund({ spirit: 20, essence: 0, matter: 1, substance: 2.5 });
    await tokenEconomy.purchaseShopItem(USER, SLUG, { idempotencyKey: "k-1" });
    expect(db.ledger.map((r) => r.key)).toEqual([
      "k-1:swap0:Spirit",
      "k-1:swap0:Essence",
      "k-1:swap1:Spirit",
      "k-1:swap1:Matter",
      "k-1:Spirit",
      "k-1:Essence",
      "k-1:Matter",
      "k-1:Substance",
    ]);
  });

  it("a replay of an auto-swapped purchase is already_applied, not a second swap", async () => {
    fund({ spirit: 20, essence: 0, matter: 1, substance: 2.5 });
    await tokenEconomy.purchaseShopItem(USER, SLUG, { idempotencyKey: "k-2" });
    const after = { ...db.balances.get(USER) };
    const replay = await tokenEconomy.purchaseShopItem(USER, SLUG, { idempotencyKey: "k-2" });
    expect(replay).toEqual({ success: false, reason: "already_applied" });
    expect(db.balances.get(USER)).toEqual(after);
  });

  it("honours override costs (the personalized live basket)", async () => {
    fund({ spirit: 0, essence: 50, matter: 0, substance: 0 });
    const result = await tokenEconomy.purchaseShopItem(USER, SLUG, {
      overrideCosts: { spirit: 1, essence: 1, matter: 1, substance: 1 },
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    // Essence 50 funds 1 Spirit (0.8), 1 Matter (0.64), 1 Substance (1.28).
    expect(result.autoSwap?.legs.map((l) => `${l.toToken}:${l.fromAmount}`)).toEqual([
      "Spirit:0.8",
      "Matter:0.64",
      "Substance:1.28",
    ]);
    expect(db.balances.get(USER)).toEqual({ spirit: 0, essence: 46.28, matter: 0, substance: 0 });
  });
});

describe("refusals — nothing moves", () => {
  it("refuses with the bridge's shortfall when total value cannot cover the basket", async () => {
    fund({ spirit: 3, essence: 0, matter: 0, substance: 0 });
    const result = await tokenEconomy.purchaseShopItem(USER, SLUG);
    expect(result).toMatchObject({
      success: false,
      reason: "insufficient_funds",
      autoSwap: { reason: "insufficient_value", deficits: { spirit: 0, essence: 2.5, matter: 2.5, substance: 2.5 } },
    });
    expect(db.ledger).toEqual([]);
    expect(db.balances.get(USER)).toEqual({ spirit: 3, essence: 0, matter: 0, substance: 0 });
  });

  it("autoSwap: false refuses a short basket without consulting the oracle", async () => {
    fund({ spirit: 20, essence: 0, matter: 1, substance: 2.5 });
    const result = await tokenEconomy.purchaseShopItem(USER, SLUG, { autoSwap: false });
    expect(result).toEqual({ success: false, reason: "insufficient_funds" });
    expect(getLiveOracleQuote).not.toHaveBeenCalled();
    expect(db.transactions).toBe(0);
    expect(db.ledger).toEqual([]);
  });

  it("an unpriceable sky is refused as rates_unavailable — never a guessed rate", async () => {
    fund({ spirit: 20, essence: 0, matter: 1, substance: 2.5 });
    getLiveOracleQuote.mockImplementation(() => {
      throw new Error("price-index: engine returned unusable ESMS total");
    });
    const result = await tokenEconomy.purchaseShopItem(USER, SLUG);
    expect(result).toEqual({
      success: false,
      reason: "insufficient_funds",
      autoSwap: { reason: "rates_unavailable", shortfallValue: null, deficits: null },
    });
    expect(db.transactions).toBe(0);
  });

  it("a user with no balance row is refused as no_balance", async () => {
    const result = await tokenEconomy.purchaseShopItem(USER, SLUG);
    expect(result).toMatchObject({ success: false, reason: "insufficient_funds", autoSwap: { reason: "no_balance" } });
    expect(db.balances.has(USER)).toBe(false);
  });
});

describe("ledger atomicity — the swap and the payment commit together or not at all", () => {
  it("a swap leg that moves nothing rolls the transaction back → purchase_failed", async () => {
    fund({ spirit: 20, essence: 0, matter: 1, substance: 2.5 });
    db.failTransmute = true;
    const result = await tokenEconomy.purchaseShopItem(USER, SLUG);
    expect(result).toEqual({ success: false, reason: "purchase_failed" });
    expect(db.rolledBack).toBe(1);
    expect(db.ledger).toEqual([]);
    expect(db.balances.get(USER)).toEqual({ spirit: 20, essence: 0, matter: 1, substance: 2.5 });
  });

  it("a payment refused AFTER the swaps rolls the swaps back too", async () => {
    fund({ spirit: 20, essence: 0, matter: 1, substance: 2.5 });
    db.failPaymentAfterSwap = true;
    const result = await tokenEconomy.purchaseShopItem(USER, SLUG);
    expect(result).toEqual({ success: false, reason: "purchase_failed" });
    expect(db.rolledBack).toBe(1);
    // The legs were written inside the transaction and are gone with it.
    expect(db.ledger).toEqual([]);
    expect(db.purchases).toEqual([]);
    expect(db.balances.get(USER)).toEqual({ spirit: 20, essence: 0, matter: 1, substance: 2.5 });
  });
});
