/**
 * @jest-environment node
 *
 * /api/economy/sync-debit × the Swapping Bridge.
 *
 * Agent S2S charges used to 402 the moment ONE axis ran short, however much
 * value the agent held on the other three. The bridge now swaps surplus coins
 * into the short axes at live EEI parity — inside the SAME transaction as the
 * debit, under the SAME transaction group — before it would refuse.
 *
 * The database is a small stateful fake that applies the statements the route
 * sends (read by their bound values) and rolls back when the transaction body
 * throws. The price oracle is mocked; nothing reads the live sky.
 */

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

const USER_ID = "11111111-2222-4333-8444-555555555555";
const SECRET = "test-sync-secret";
const AXES: Axis[] = ["spirit", "essence", "matter", "substance"];
const TOKEN_AXIS: Record<string, Axis> = {
  Spirit: "spirit",
  Essence: "essence",
  Matter: "matter",
  Substance: "substance",
};

const state = {
  balances: { spirit: 0, essence: 0, matter: 0, substance: 0 } as Balances,
  ledger: [] as LedgerRow[],
  /** Statements run on the transaction client, in order (first 40 chars). */
  inTransaction: [] as string[],
  rolledBack: false,
  failTransmute: false,
  failDebitAfterSwap: false,
};

const round4 = (n: number): number => Math.round(n * 10_000) / 10_000;
const asText = (b: Balances) =>
  Object.fromEntries(AXES.map((a) => [a, b[a].toFixed(4)])) as Record<Axis, string>;

function run(sql: string, params: unknown[]): { rows: Array<Record<string, unknown>> } {
  if (/SELECT\s+u\.id/i.test(sql)) return { rows: [{ id: USER_ID, profile_name: "Ada" }] };
  if (/idempotency_key LIKE/i.test(sql)) return { rows: [] };
  if (/INSERT INTO token_balances \(user_id\) VALUES/i.test(sql)) return { rows: [] };
  if (/SELECT spirit::text/i.test(sql)) return { rows: [asText(state.balances)] };
  if (/check_balance AS/.test(sql) && /'transmutation'/.test(sql)) {
    // transmuteSql: user, cost, target, group, fromToken, debitDesc, toToken, creditDesc, idem
    const [, cost, target, group, fromToken, , toToken, , idem] = params as [
      string, number, number, string, string, string, string, string, string | null,
    ];
    if (state.failTransmute) return { rows: [] };
    const from = TOKEN_AXIS[fromToken] as Axis;
    const to = TOKEN_AXIS[toToken] as Axis;
    if (state.balances[from] < cost) return { rows: [] };
    state.balances = {
      ...state.balances,
      [from]: round4(state.balances[from] - cost),
      [to]: round4(state.balances[to] + target),
    };
    state.ledger.push(
      { group, token: fromToken, amount: -cost, source: "transmutation", key: idem && `${idem}:${fromToken}` },
      { group, token: toToken, amount: target, source: "transmutation", key: idem && `${idem}:${toToken}` },
    );
    return { rows: [{ ...state.balances }] };
  }
  if (/SET spirit\s+= spirit\s+- \$2::decimal/.test(sql)) {
    const want = {
      spirit: Number(params[1]),
      essence: Number(params[2]),
      matter: Number(params[3]),
      substance: Number(params[4]),
    };
    if (state.failDebitAfterSwap && state.ledger.length > 0) return { rows: [] };
    if (AXES.some((a) => state.balances[a] < want[a])) return { rows: [] };
    state.balances = Object.fromEntries(
      AXES.map((a) => [a, round4(state.balances[a] - want[a])]),
    ) as Balances;
    return { rows: [asText(state.balances)] };
  }
  if (/INSERT INTO token_transactions/i.test(sql) && /'agents_operation'/.test(sql)) {
    const [group, , token, amount, , , key] = params as [string, string, string, string, string, string, string];
    state.ledger.push({ group, token, amount: -Number(amount), source: "agents_operation", key });
    return { rows: [] };
  }
  return { rows: [] };
}

jest.mock("@/lib/database", () => ({
  executeQuery: (sql: string, params: unknown[] = [], options: { client?: unknown } = {}) => {
    if (options.client) state.inTransaction.push(sql.trim().slice(0, 40));
    return Promise.resolve(run(sql, params));
  },
  withTransaction: async (op: (client: unknown) => Promise<unknown>) => {
    const saved = { balances: { ...state.balances }, ledger: [...state.ledger] };
    try {
      return await op({ query: (sql: string, params: unknown[]) => Promise.resolve(run(sql, params)) });
    } catch (error) {
      state.rolledBack = true;
      state.balances = saved.balances;
      state.ledger = saved.ledger;
      throw error;
    }
  },
}));
jest.mock("@/utils/agentMonicaResolver", () => ({ agentMonicaWithMethod: () => null }));
jest.mock("@/utils/fullChartMonica", () => ({
  normaliseNatalPositions: (v: unknown) => (Array.isArray(v) ? v : []),
}));

const PRICES = { Spirit: 1.0, Essence: 1.25, Matter: 0.8, Substance: 1.6 };
let keySeq = 0;

async function post(body: Record<string, unknown> = {}): Promise<{ status: number; json: Record<string, any> }> {
  const { POST } = require("@/app/api/economy/sync-debit/route");
  const req = new Request("https://alchm.kitchen/api/economy/sync-debit", {
    method: "POST",
    headers: { "content-type": "application/json", "X-Sync-Secret": SECRET },
    body: JSON.stringify({
      userEmail: "ada@agentic.alchm.kitchen",
      amounts: { spirit: 2.5, essence: 2.5, matter: 2.5, substance: 2.5 },
      idempotencyKey: `op-${(keySeq += 1)}`,
      operationType: "feed_post",
      ...body,
    }),
  });
  const res = (await POST(req as never)) as Response;
  return { status: res.status, json: (await res.json()) as Record<string, any> };
}

describe("sync-debit — Swapping Bridge", () => {
  const original = process.env.ALCHM_KITCHEN_SYNC_SECRET;

  beforeEach(() => {
    process.env.ALCHM_KITCHEN_SYNC_SECRET = SECRET;
    state.balances = { spirit: 0, essence: 0, matter: 0, substance: 0 };
    state.ledger = [];
    state.inTransaction = [];
    state.rolledBack = false;
    state.failTransmute = false;
    state.failDebitAfterSwap = false;
    getLiveOracleQuote.mockReset();
    getLiveOracleQuote.mockReturnValue({
      bucketStartUtc: "2026-09-30T12:00:00.000Z",
      prices: PRICES,
      degraded: null,
    });
    jest.spyOn(console, "error").mockImplementation(() => undefined);
    jest.spyOn(console, "warn").mockImplementation(() => undefined);
    jest.resetModules();
  });

  afterEach(() => jest.restoreAllMocks());

  afterAll(() => {
    if (original === undefined) delete process.env.ALCHM_KITCHEN_SYNC_SECRET;
    else process.env.ALCHM_KITCHEN_SYNC_SECRET = original;
  });

  it("a funded basket is charged as before: no oracle read, no swap", async () => {
    state.balances = { spirit: 10, essence: 10, matter: 10, substance: 10 };
    const { status, json } = await post();
    expect(status).toBe(200);
    expect(json.autoSwap).toBeNull();
    expect(getLiveOracleQuote).not.toHaveBeenCalled();
    expect(state.ledger.every((r) => r.source === "agents_operation")).toBe(true);
  });

  it("a short basket is funded from surplus coins and charged — 200, not 402", async () => {
    state.balances = { spirit: 20, essence: 0, matter: 1, substance: 2.5 };
    const { status, json } = await post({ idempotencyKey: "op-swap-1" });

    expect(status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.autoSwap.legs).toEqual([
      { fromToken: "Spirit", toToken: "Essence", fromAmount: 3.125, toAmount: 2.5, rate: 1.25 },
      { fromToken: "Spirit", toToken: "Matter", fromAmount: 1.2, toAmount: 1.5, rate: 0.8 },
    ]);
    expect(json.autoSwap).toMatchObject({ basis: "eei-relative-parity", spread: 0, prices: PRICES });
    expect(json.balances).toEqual({ spirit: 13.175, essence: 0, matter: 0, substance: 0 });

    // Swap legs and the agents_operation rows share the ONE group returned.
    expect(new Set(state.ledger.map((r) => r.group))).toEqual(new Set([json.transactionGroupId]));
    expect(state.ledger.map((r) => `${r.source}:${r.token}:${r.amount}`)).toEqual([
      "transmutation:Spirit:-3.125",
      "transmutation:Essence:2.5",
      "transmutation:Spirit:-1.2",
      "transmutation:Matter:1.5",
      "agents_operation:Spirit:-2.5",
      "agents_operation:Essence:-2.5",
      "agents_operation:Matter:-2.5",
      "agents_operation:Substance:-2.5",
    ]);
    // …keyed under the producer's idempotency key, so a replay is caught.
    expect(state.ledger.every((r) => r.key?.startsWith("op-swap-1:"))).toBe(true);
  });

  it("runs the lock, the legs and the debit on the SAME transaction client, in that order", async () => {
    state.balances = { spirit: 20, essence: 0, matter: 1, substance: 2.5 };
    await post();
    const lock = state.inTransaction.findIndex((s) => /SELECT spirit::text/.test(s));
    const firstLeg = state.inTransaction.findIndex((s) => /WITH check_balance AS/.test(s));
    const debit = state.inTransaction.findIndex((s) => /^UPDATE token_balances/.test(s));
    expect(lock).toBeGreaterThanOrEqual(0);
    expect(firstLeg).toBeGreaterThan(lock);
    expect(debit).toBeGreaterThan(firstLeg);
  });

  it("still 402s when total value cannot cover the basket — with the bridge's reason", async () => {
    state.balances = { spirit: 3, essence: 0, matter: 0, substance: 0 };
    const { status, json } = await post();
    expect(status).toBe(402);
    expect(json.reason).toBe("insufficient_funds");
    expect(json.autoSwap).toMatchObject({
      reason: "insufficient_value",
      deficits: { spirit: 0, essence: 2.5, matter: 2.5, substance: 2.5 },
    });
    expect(json.autoSwap.shortfallValue).toBeGreaterThan(0);
    expect(state.ledger).toEqual([]);
    expect(state.balances).toEqual({ spirit: 3, essence: 0, matter: 0, substance: 0 });
  });

  it("autoSwap: false keeps the exact-basket contract (402, oracle never read)", async () => {
    state.balances = { spirit: 20, essence: 0, matter: 1, substance: 2.5 };
    const { status, json } = await post({ autoSwap: false });
    expect(status).toBe(402);
    expect(json).not.toHaveProperty("autoSwap");
    expect(getLiveOracleQuote).not.toHaveBeenCalled();
    expect(state.ledger).toEqual([]);
  });

  it("an unpriceable sky 402s as rates_unavailable — never a guessed rate", async () => {
    state.balances = { spirit: 20, essence: 0, matter: 1, substance: 2.5 };
    getLiveOracleQuote.mockImplementation(() => {
      throw new Error("price-index: engine returned unusable ESMS total");
    });
    const { status, json } = await post();
    expect(status).toBe(402);
    expect(json.autoSwap).toEqual({ reason: "rates_unavailable", shortfallValue: null, deficits: null });
    expect(state.ledger).toEqual([]);
  });

  describe("atomicity", () => {
    it("a failed swap leg rolls everything back and answers 500", async () => {
      state.balances = { spirit: 20, essence: 0, matter: 1, substance: 2.5 };
      state.failTransmute = true;
      const { status } = await post();
      expect(status).toBe(500);
      expect(state.rolledBack).toBe(true);
      expect(state.ledger).toEqual([]);
      expect(state.balances).toEqual({ spirit: 20, essence: 0, matter: 1, substance: 2.5 });
    });

    it("a debit refused AFTER swaps throws (500) instead of committing the swaps with a 402", async () => {
      state.balances = { spirit: 20, essence: 0, matter: 1, substance: 2.5 };
      state.failDebitAfterSwap = true;
      const { status, json } = await post();
      expect(status).toBe(500);
      expect(json.reason).toBe("internal_error");
      expect(state.rolledBack).toBe(true);
      // The legs that were written are gone with the transaction.
      expect(state.ledger).toEqual([]);
      expect(state.balances).toEqual({ spirit: 20, essence: 0, matter: 1, substance: 2.5 });
    });
  });
});
