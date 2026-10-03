/**
 * @jest-environment node
 *
 * The Transmutation Circle service — posting, filling, closing, and the board.
 *
 * The database is a small transactional fake that answers the statements the
 * service sends (the real builders, recognized by shape and read by their bound
 * values) and restores its state when a transaction body throws, as ROLLBACK
 * would. Every statement is also PREPAREd against PostgreSQL by
 * scripts/checkTransmutationSqlParses.ts, and the whole flow was exercised
 * end-to-end against PostgreSQL 16 when this suite was written.
 *
 * Prices: Spirit 1.00, Essence 1.25, Matter 0.80, Substance 1.60 — so at parity
 * 4 Spirit (value 4) buys 3.2 Essence (value 4).
 */

const getLiveOracleQuote = jest.fn();
jest.mock("@/lib/economy/priceIndex", () => ({
  INDEX_ROUND_DIGITS: 4,
  getLiveOracleQuote: (...args: unknown[]) => getLiveOracleQuote(...args),
}));

const recognize = jest.fn();
jest.mock("@/services/practiceRewardService", () => ({
  practiceRewardService: { recognize: (...args: unknown[]) => recognize(...args) },
}));

const createNotification = jest.fn();
jest.mock("@/services/notificationDatabaseService", () => ({
  notificationDatabase: { createNotification: (...args: unknown[]) => createNotification(...args) },
}));

const createEvent = jest.fn();
jest.mock("@/services/feedDatabaseService", () => ({
  feedDatabase: { createEvent: (...args: unknown[]) => createEvent(...args) },
}));

type Axis = "spirit" | "essence" | "matter" | "substance";
type Wallet = Record<Axis, number>;
type Token = "Spirit" | "Essence" | "Matter" | "Substance";

interface FakeUser {
  id: string;
  email: string;
  name: string;
  isAgent: boolean;
  share: boolean | null;
}

interface FakeOffer {
  id: string;
  maker_id: string;
  counterparty_id: string | null;
  give_token: Token;
  give_amount: number;
  want_token: Token;
  want_amount: number;
  message: string | null;
  status: "open" | "filled" | "cancelled" | "declined";
  taker_id: string | null;
  fill_transaction_group_id: string | null;
  reply_to_offer_id: string | null;
  idempotency_key: string | null;
  created_at: Date;
  expires_at: Date;
  closed_at: Date | null;
}

interface LedgerRow {
  user: string;
  token: string;
  amount: number;
  group: string;
  source: string;
  sourceId: string;
  key: string | null;
}

interface FakeDb {
  users: Map<string, FakeUser>;
  wallets: Map<string, Wallet>;
  offers: Map<string, FakeOffer>;
  ledger: LedgerRow[];
  blocked: Array<[string, string]>;
  transactions: number;
  rolledBack: number;
  failLeg: number | null;
  seq: number;
}

const db: FakeDb = {
  users: new Map(),
  wallets: new Map(),
  offers: new Map(),
  ledger: [],
  blocked: [],
  transactions: 0,
  rolledBack: 0,
  failLeg: null,
  seq: 0,
};

const AXES: readonly Axis[] = ["spirit", "essence", "matter", "substance"];
const AXIS_OF: Record<Token, Axis> = { Spirit: "spirit", Essence: "essence", Matter: "matter", Substance: "substance" };
const TOKENS: readonly Token[] = ["Spirit", "Essence", "Matter", "Substance"];

function tokenOf(value: unknown): Token {
  const token = TOKENS.find((t) => t === value);
  if (!token) throw new Error(`fake db: not a token ${String(value)}`);
  return token;
}
const str = (v: unknown): string => String(v);
const round4 = (n: number): number => Math.round(n * 10_000) / 10_000;

function offerRow(o: FakeOffer): Record<string, unknown> {
  return {
    ...o,
    give_amount: o.give_amount.toFixed(4),
    want_amount: o.want_amount.toFixed(4),
  };
}

function userRow(u: FakeUser): Record<string, unknown> {
  return { id: u.id, email: u.email, is_agent: u.isAgent, name: u.name, share_identity: u.share };
}

const isBlocked = (a: string, b: string): boolean =>
  db.blocked.some(([x, y]) => (x === a && y === b) || (x === b && y === a));

const live = (o: FakeOffer): boolean => o.status === "open" && o.expires_at.getTime() > Date.now();

let legIndex = 0;

function run(sql: string, values: unknown[]): { rows: Array<Record<string, unknown>> } {
  // ── people
  if (/lower\(u\.email\)/.test(sql)) {
    const user = [...db.users.values()].find((u) => u.email === str(values[0]));
    return { rows: user ? [userRow(user)] : [] };
  }
  if (/FROM users u LEFT JOIN user_profiles/.test(sql)) {
    const user = db.users.get(str(values[0]));
    return { rows: user ? [userRow(user)] : [] };
  }
  if (/^\s*SELECT 1 FROM commensalships/.test(sql)) {
    return { rows: isBlocked(str(values[0]), str(values[1])) ? [{ one: 1 }] : [] };
  }
  // ── offers
  if (/INSERT INTO transmutation_offers/.test(sql)) {
    const key = values[8] == null ? null : str(values[8]);
    if (key && [...db.offers.values()].some((o) => o.idempotency_key === key)) return { rows: [] };
    const now = Date.now();
    const offer: FakeOffer = {
      id: `00000000-0000-4000-8000-${String(++db.seq).padStart(12, "0")}`,
      maker_id: str(values[0]),
      counterparty_id: values[1] == null ? null : str(values[1]),
      give_token: tokenOf(values[2]),
      give_amount: Number(values[3]),
      want_token: tokenOf(values[4]),
      want_amount: Number(values[5]),
      message: values[6] == null ? null : str(values[6]),
      status: "open",
      taker_id: null,
      fill_transaction_group_id: null,
      reply_to_offer_id: values[7] == null ? null : str(values[7]),
      idempotency_key: key,
      created_at: new Date(now + db.seq),
      expires_at: new Date(now + Number(values[9]) * 3_600_000),
      closed_at: null,
    };
    db.offers.set(offer.id, offer);
    return { rows: [offerRow(offer)] };
  }
  if (/o\.idempotency_key =/.test(sql)) {
    const offer = [...db.offers.values()].find(
      (o) => o.idempotency_key === str(values[0]) && o.maker_id === str(values[1]),
    );
    return { rows: offer ? [offerRow(offer)] : [] };
  }
  if (/count\(\*\)::int AS n/.test(sql)) {
    const n = [...db.offers.values()].filter((o) => o.maker_id === str(values[0]) && live(o)).length;
    return { rows: [{ n }] };
  }
  if (/FROM transmutation_offers o WHERE o\.id = \$1/.test(sql)) {
    const offer = db.offers.get(str(values[0]));
    return { rows: offer ? [offerRow(offer)] : [] };
  }
  if (/SET status = 'filled'/.test(sql)) {
    const offer = db.offers.get(str(values[0]));
    if (!offer || !live(offer)) return { rows: [] };
    Object.assign(offer, {
      status: "filled",
      taker_id: str(values[1]),
      fill_transaction_group_id: str(values[2]),
      closed_at: new Date(),
    });
    return { rows: [offerRow(offer)] };
  }
  const close = /SET status = '(cancelled|declined)'/.exec(sql);
  if (close) {
    const offer = db.offers.get(str(values[0]));
    const actorColumn = close[1] === "cancelled" ? "maker_id" : "counterparty_id";
    if (!offer || offer.status !== "open" || offer[actorColumn] !== str(values[1])) return { rows: [] };
    Object.assign(offer, { status: close[1], closed_at: new Date() });
    return { rows: [offerRow(offer)] };
  }
  if (/o\.maker_id <> /.test(sql)) {
    // boardSql
    const viewer = str(values[0]);
    const rows = [...db.offers.values()]
      .filter((o) => live(o) && o.maker_id !== viewer)
      .filter((o) => o.counterparty_id === null || o.counterparty_id === viewer)
      .filter((o) => (db.wallets.get(o.maker_id)?.[AXIS_OF[o.give_token]] ?? 0) >= o.give_amount)
      .filter((o) => !isBlocked(viewer, o.maker_id))
      .map((o) => {
        const maker = db.users.get(o.maker_id);
        return {
          ...offerRow(o),
          maker_name: maker?.name ?? null,
          maker_is_agent: maker?.isAgent ?? false,
          maker_share_identity: maker?.share ?? null,
        };
      });
    return { rows };
  }
  if (/AS funded/.test(sql)) {
    const maker = str(values[0]);
    const rows = [...db.offers.values()]
      .filter((o) => o.maker_id === maker)
      .map((o) => {
        const taker = o.taker_id ? db.users.get(o.taker_id) : undefined;
        return {
          ...offerRow(o),
          funded: (db.wallets.get(maker)?.[AXIS_OF[o.give_token]] ?? 0) >= o.give_amount,
          taker_name: taker?.name ?? null,
          taker_is_agent: taker?.isAgent ?? false,
          taker_share_identity: taker?.share ?? null,
          counterparty_name: null,
          counterparty_is_agent: false,
          counterparty_share_identity: null,
        };
      });
    return { rows };
  }
  if (/AS partners/.test(sql)) {
    const user = str(values[0]);
    const filled = [...db.offers.values()].filter(
      (o) => o.status === "filled" && (o.maker_id === user || o.taker_id === user),
    );
    const partners = new Set(filled.map((o) => (o.maker_id === user ? o.taker_id : o.maker_id)));
    return { rows: [{ trades: filled.length, partners: partners.size, last_trade_at: null }] };
  }
  if (/trades_24h/.test(sql)) {
    const all = [...db.offers.values()];
    return {
      rows: [{ trades_24h: all.filter((o) => o.status === "filled").length, open_offers: all.filter(live).length }],
    };
  }
  // ── wallets and ledger
  if (/FROM token_balances\s+WHERE user_id IN/.test(sql)) {
    const rows = [str(values[0]), str(values[1])]
      .sort()
      .flatMap((id) => {
        const w = db.wallets.get(id);
        return w ? [{ user_id: id, ...w }] : [];
      });
    return { rows };
  }
  if (/WITH check_balance AS/.test(sql)) {
    // debitTokensSql: user, tokenType, amount, sourceType, sourceId, group, description
    if (db.failLeg === legIndex++) return { rows: [] };
    const user = str(values[0]);
    const axis = AXIS_OF[tokenOf(values[1])];
    const amount = Number(values[2]);
    const wallet = db.wallets.get(user);
    if (!wallet || wallet[axis] < amount) return { rows: [] };
    wallet[axis] = round4(wallet[axis] - amount);
    db.ledger.push({ user, token: str(values[1]), amount: -amount, group: str(values[5]), source: str(values[3]), sourceId: str(values[4]), key: null });
    return { rows: [{ ...wallet }] };
  }
  if (/WITH inserted AS/.test(sql)) {
    // creditTokensSql: user, tokenType, amount, sourceType, sourceId, description, group, key
    if (db.failLeg === legIndex++) return { rows: [] };
    const user = str(values[0]);
    const key = values[7] == null ? null : str(values[7]);
    if (key && db.ledger.some((r) => r.key === key)) return { rows: [] };
    const axis = AXIS_OF[tokenOf(values[1])];
    const wallet = db.wallets.get(user) ?? { spirit: 0, essence: 0, matter: 0, substance: 0 };
    wallet[axis] = round4(wallet[axis] + Number(values[2]));
    db.wallets.set(user, wallet);
    db.ledger.push({ user, token: str(values[1]), amount: Number(values[2]), group: str(values[6]), source: str(values[3]), sourceId: str(values[4]), key });
    return { rows: [{ ...wallet }] };
  }
  throw new Error(`fake db: unexpected statement ${sql.slice(0, 80)}`);
}

jest.mock("@/lib/database", () => ({
  executeQuery: (sql: string, values: unknown[] = []) => Promise.resolve(run(sql, values)),
  withTransaction: async <T>(op: (client: object) => Promise<T>): Promise<T> => {
    db.transactions += 1;
    legIndex = 0;
    const saved = {
      wallets: new Map([...db.wallets].map(([k, w]) => [k, { ...w }])),
      offers: new Map([...db.offers].map(([k, o]) => [k, { ...o }])),
      ledger: [...db.ledger],
    };
    try {
      return await op({});
    } catch (error) {
      db.rolledBack += 1;
      db.wallets = saved.wallets;
      db.offers = saved.offers;
      db.ledger = saved.ledger;
      throw error;
    }
  },
}));

jest.mock("@/services/TokenEconomyService", () => ({
  tokenEconomy: {
    getBalancesOrNull: (id: string) => {
      const w = db.wallets.get(id);
      return Promise.resolve(
        w ? { ...w, lastDailyClaimAt: null, lastDailyClaimAgentsAt: null, updatedAt: "" } : null,
      );
    },
  },
}));

import { transmutationService as circle } from "@/services/transmutationService";

const PRICES = { Spirit: 1, Essence: 1.25, Matter: 0.8, Substance: 1.6 };

const ADA = "11111111-1111-4111-8111-111111111111";
const BO = "22222222-2222-4222-8222-222222222222";
const CY = "33333333-3333-4333-8333-333333333333";
const AGENT = "44444444-4444-4444-8444-444444444444";

function addUser(id: string, name: string, wallet: Wallet, opts: { isAgent?: boolean; share?: boolean | null } = {}): void {
  db.users.set(id, {
    id,
    email: `${name.toLowerCase()}@${opts.isAgent ? "agentic.alchm.kitchen" : "example.invalid"}`,
    name,
    isAgent: opts.isAgent ?? false,
    share: opts.share ?? null,
  });
  db.wallets.set(id, { ...wallet });
}

const w = (spirit: number, essence: number, matter: number, substance: number): Wallet => ({ spirit, essence, matter, substance });

/** Ada lacks Essence and has Spirit to spare; Bo is the mirror image. */
const FAIR = { giveToken: "Spirit", giveAmount: 4, wantToken: "Essence", wantAmount: 3.2 } as const;

async function post(maker = ADA, extra: Record<string, unknown> = {}) {
  const result = await circle.createOffer(maker, { ...FAIR, ...extra });
  if (!result.ok) throw new Error(`post failed: ${result.reason}`);
  return result.offer;
}

beforeEach(() => {
  db.users = new Map();
  db.wallets = new Map();
  db.offers = new Map();
  db.ledger = [];
  db.blocked = [];
  db.transactions = 0;
  db.rolledBack = 0;
  db.failLeg = null;
  addUser(ADA, "Ada", w(20, 0.5, 5, 5));
  addUser(BO, "Bo", w(1, 20, 5, 5));
  addUser(CY, "Cy", w(10, 10, 10, 10));
  addUser(AGENT, "Mercury", w(50, 50, 50, 50), { isAgent: true });
  getLiveOracleQuote.mockReset();
  getLiveOracleQuote.mockReturnValue({ bucketStartUtc: "2026-09-30T12:00:00.000Z", prices: PRICES, degraded: null });
  recognize.mockReset();
  recognize.mockResolvedValue({ rewarded: true, tokenType: "Essence", amount: 1, hint: "The Circle turns" });
  createNotification.mockReset();
  createNotification.mockResolvedValue(null);
  createEvent.mockReset();
  createEvent.mockResolvedValue(true);
  jest.spyOn(console, "warn").mockImplementation(() => undefined);
  jest.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => jest.restoreAllMocks());

describe("posting an offer", () => {
  it("posts an open offer to the Circle and announces it on the feed", async () => {
    const result = await circle.createOffer(ADA, { ...FAIR, message: "Need Essence for a stew" });
    expect(result).toMatchObject({
      ok: true,
      replayed: false,
      offer: { status: "open", directed: false, funded: true, message: "Need Essence for a stew", market: { takerEdgePct: 0, withinCorridor: true } },
    });
    expect(createEvent).toHaveBeenCalledWith(ADA, "transmutation_offer", expect.objectContaining({ giveToken: "Spirit", wantToken: "Essence" }));
    expect(createNotification).not.toHaveBeenCalled();
  });

  it("refuses terms outside the ±25% corridor, naming the fair ask", async () => {
    const result = await circle.createOffer(ADA, { ...FAIR, wantAmount: 8 });
    expect(result).toMatchObject({ ok: false, reason: "off_market" });
    expect(result.ok ? "" : result.message).toContain("4 Spirit is worth 3.2 Essence");
    expect(db.offers.size).toBe(0);
  });

  it("refuses when the maker cannot cover what they give (no escrow, so no bluffing)", async () => {
    expect(await circle.createOffer(BO, { ...FAIR })).toMatchObject({ ok: false, reason: "insufficient_funds" });
  });

  it("refuses when the index cannot price the sky — fairness is never guessed", async () => {
    getLiveOracleQuote.mockImplementation(() => {
      throw new Error("engine down");
    });
    expect(await circle.createOffer(ADA, { ...FAIR })).toMatchObject({ ok: false, reason: "rates_unavailable" });
  });

  it("caps a maker at 10 live offers", async () => {
    addUser(ADA, "Ada", w(1000, 0, 0, 0));
    for (let i = 0; i < 10; i++) await post(ADA);
    expect(await circle.createOffer(ADA, { ...FAIR })).toMatchObject({ ok: false, reason: "too_many_open_offers" });
  });

  it("rejects a coin for itself and dust that rounds to nothing", async () => {
    expect(await circle.createOffer(ADA, { ...FAIR, wantToken: "Spirit" })).toMatchObject({ reason: "invalid_offer" });
    expect(await circle.createOffer(ADA, { ...FAIR, giveAmount: 0.00001 })).toMatchObject({ reason: "invalid_offer" });
  });

  it("a retried post returns the same offer and rings nothing twice", async () => {
    const first = await circle.createOffer(ADA, { ...FAIR, idempotencyKey: "req-1" });
    const again = await circle.createOffer(ADA, { ...FAIR, idempotencyKey: "req-1" });
    expect(again).toMatchObject({ ok: true, replayed: true });
    expect(first.ok && again.ok && first.offer.id === again.offer.id).toBe(true);
    expect(db.offers.size).toBe(1);
    expect(createEvent).toHaveBeenCalledTimes(1);
    // Another maker's identical client key is a different offer.
    expect(await circle.createOffer(CY, { ...FAIR, idempotencyKey: "req-1" })).toMatchObject({ ok: true, replayed: false });
  });

  describe("directed offers", () => {
    it("rings the counterparty's bell instead of posting to the feed", async () => {
      const result = await circle.createOffer(CY, { ...FAIR, counterparty: { id: BO } });
      expect(result).toMatchObject({ ok: true, offer: { directed: true, counterparty: { name: "Bo" } } });
      expect(createNotification).toHaveBeenCalledWith(
        BO,
        "transmutation_offer",
        "A transmutation offer",
        "Cy offers 4 Spirit for 3.2 Essence",
        expect.objectContaining({ relatedUserId: CY }),
      );
      expect(createEvent).not.toHaveBeenCalled();
    });

    it("names a private maker as a fellow alchemist and does not link them", async () => {
      addUser(CY, "Cy", w(10, 10, 10, 10), { share: false });
      await circle.createOffer(CY, { ...FAIR, counterparty: { id: BO } });
      const [, , , message, opts] = createNotification.mock.calls[0] ?? [];
      expect(message).toBe("A fellow alchemist offers 4 Spirit for 3.2 Essence");
      expect(opts).not.toHaveProperty("relatedUserId");
    });

    it("finds an agent by email and does not ring an agent's bell", async () => {
      const result = await circle.createOffer(CY, { ...FAIR, counterparty: { email: "mercury@agentic.alchm.kitchen" } });
      expect(result).toMatchObject({ ok: true, offer: { counterparty: { name: "Mercury", isAgent: true } } });
      expect(createNotification).not.toHaveBeenCalled();
    });

    it("refuses an unknown counterparty, yourself, and anyone blocked either way", async () => {
      expect(await circle.createOffer(CY, { ...FAIR, counterparty: { id: "99999999-9999-4999-8999-999999999999" } })).toMatchObject({ reason: "counterparty_not_found" });
      expect(await circle.createOffer(CY, { ...FAIR, counterparty: { id: CY } })).toMatchObject({ reason: "invalid_offer" });
      db.blocked.push([BO, CY]);
      expect(await circle.createOffer(CY, { ...FAIR, counterparty: { id: BO } })).toMatchObject({ reason: "counterparty_unavailable" });
    });

    it("a counter-offer is directed at the original maker", async () => {
      const original = await post(ADA);
      const counter = await circle.createOffer(BO, {
        giveToken: "Essence", giveAmount: 3, wantToken: "Spirit", wantAmount: 3.75, replyToOfferId: original.id,
      });
      expect(counter).toMatchObject({ ok: true, offer: { directed: true, replyToOfferId: original.id, counterparty: { name: "Ada" } } });
      expect(createNotification).toHaveBeenCalledWith(ADA, "transmutation_offer", "A counter-offer", expect.any(String), expect.anything());
      // You cannot counter your own offer.
      expect(await circle.createOffer(ADA, { ...FAIR, replyToOfferId: original.id })).toMatchObject({ reason: "invalid_offer" });
    });
  });
});

describe("filling an offer", () => {
  it("moves both wallets in ONE transaction and ONE group — four transmutation rows", async () => {
    const offer = await post(ADA);
    const result = await circle.acceptOffer(BO, offer.id);

    expect(result).toMatchObject({
      ok: true,
      offer: { status: "filled" },
      trade: { gave: { tokenType: "Essence", amount: 3.2 }, received: { tokenType: "Spirit", amount: 4 } },
    });
    expect(db.transactions).toBe(1);
    expect(db.wallets.get(ADA)).toEqual(w(16, 3.7, 5, 5));
    expect(db.wallets.get(BO)).toEqual(w(5, 16.8, 5, 5));
    const group = result.ok ? result.trade.transactionGroupId : "";
    expect(db.ledger.map((r) => `${r.user === ADA ? "Ada" : "Bo"}:${r.token}:${r.amount}`)).toEqual([
      "Ada:Spirit:-4",
      "Bo:Essence:-3.2",
      "Ada:Essence:3.2",
      "Bo:Spirit:4",
    ]);
    expect(db.ledger.every((r) => r.group === group && r.source === "transmutation" && r.sourceId === offer.id)).toBe(true);
    // Supply is conserved on every axis: what leaves one wallet lands in the other.
    for (const token of TOKENS) {
      expect(db.ledger.filter((r) => r.token === token).reduce((s, r) => s + r.amount, 0)).toBeCloseTo(0, 10);
    }
  });

  it("pays both humans the Circle bonus, rings the maker, and posts the trade", async () => {
    const offer = await post(ADA);
    const result = await circle.acceptOffer(BO, offer.id);
    expect(result).toMatchObject({ ok: true, bonus: { tokenType: "Essence", amount: 1 } });
    // Each keyed to the OTHER party: once per partner per day.
    expect(recognize).toHaveBeenCalledWith(BO, "transmutation_shared", ADA);
    expect(recognize).toHaveBeenCalledWith(ADA, "transmutation_shared", BO);
    expect(createNotification).toHaveBeenCalledWith(
      ADA, "transmutation_accepted", "Your offer was filled",
      "Bo traded with you: you gave 4 Spirit and received 3.2 Essence", expect.anything(),
    );
    expect(createEvent).toHaveBeenLastCalledWith(BO, "transmutation_trade", expect.objectContaining({
      gaveToken: "Essence", receivedToken: "Spirit", partnerName: "Ada",
    }));
  });

  it("agents trade but never earn the bonus, and their bell is not rung", async () => {
    const offer = await post(AGENT);
    await circle.acceptOffer(BO, offer.id);
    expect(recognize).toHaveBeenCalledTimes(1);
    expect(recognize).toHaveBeenCalledWith(BO, "transmutation_shared", AGENT);
    expect(createNotification).not.toHaveBeenCalled();

    recognize.mockClear();
    const humanOffer = await post(ADA);
    await circle.acceptOffer(AGENT, humanOffer.id);
    expect(recognize).toHaveBeenCalledTimes(1);
    expect(recognize).toHaveBeenCalledWith(ADA, "transmutation_shared", AGENT);
  });

  it("a dust trade settles but earns no bonus", async () => {
    const offer = await post(ADA, { giveAmount: 0.4, wantAmount: 0.32 });
    expect(await circle.acceptOffer(BO, offer.id)).toMatchObject({ ok: true, bonus: null });
    expect(recognize).not.toHaveBeenCalled();
  });

  it("refuses a taker who cannot pay, and moves nothing", async () => {
    const offer = await post(ADA);
    db.wallets.set(BO, w(1, 3, 5, 5));
    expect(await circle.acceptOffer(BO, offer.id)).toMatchObject({ ok: false, reason: "insufficient_funds" });
    expect(db.ledger).toEqual([]);
    expect(db.offers.get(offer.id)?.status).toBe("open");
  });

  it("refuses when the maker has since spent the coins (no escrow), and moves nothing", async () => {
    const offer = await post(ADA);
    db.wallets.set(ADA, w(1, 0.5, 5, 5));
    expect(await circle.acceptOffer(BO, offer.id)).toMatchObject({ ok: false, reason: "maker_cannot_cover" });
    expect(db.ledger).toEqual([]);
    expect(db.wallets.get(BO)).toEqual(w(1, 20, 5, 5));
  });

  it("a filled offer cannot be filled again", async () => {
    const offer = await post(ADA);
    await circle.acceptOffer(BO, offer.id);
    expect(await circle.acceptOffer(CY, offer.id)).toMatchObject({ ok: false, reason: "offer_closed" });
  });

  it("refuses your own offer, an expired one, and a blocked pair", async () => {
    const offer = await post(ADA);
    expect(await circle.acceptOffer(ADA, offer.id)).toMatchObject({ reason: "own_offer" });
    db.blocked.push([ADA, BO]);
    expect(await circle.acceptOffer(BO, offer.id)).toMatchObject({ reason: "counterparty_unavailable" });
    const stored = db.offers.get(offer.id);
    if (stored) stored.expires_at = new Date(Date.now() - 1000);
    expect(await circle.acceptOffer(CY, offer.id)).toMatchObject({ reason: "offer_expired" });
  });

  it("an offer directed at someone else is invisible: not found, not 'forbidden'", async () => {
    const result = await circle.createOffer(CY, { ...FAIR, counterparty: { id: BO } });
    const id = result.ok ? result.offer.id : "";
    expect(await circle.acceptOffer(ADA, id)).toMatchObject({ reason: "offer_not_found" });
    expect(await circle.acceptOffer(BO, id)).toMatchObject({ ok: true });
  });

  it("re-checks the corridor at fill time: a moved market cannot turn an offer into a transfer", async () => {
    const offer = await post(ADA);
    // Essence halves in price: 3.2 Essence is now worth 2.0 against 4 Spirit.
    getLiveOracleQuote.mockReturnValue({ bucketStartUtc: "x", prices: { ...PRICES, Essence: 0.625 }, degraded: null });
    expect(await circle.acceptOffer(BO, offer.id)).toMatchObject({ ok: false, reason: "off_market" });
    expect(db.ledger).toEqual([]);
  });

  it("a leg that moves nothing mid-fill rolls the WHOLE trade back", async () => {
    const offer = await post(ADA);
    db.failLeg = 2; // the maker's credit, after both debits landed
    await expect(circle.acceptOffer(BO, offer.id)).rejects.toThrow(/rolling back/);
    expect(db.rolledBack).toBe(1);
    expect(db.ledger).toEqual([]);
    expect(db.wallets.get(ADA)).toEqual(w(20, 0.5, 5, 5));
    expect(db.wallets.get(BO)).toEqual(w(1, 20, 5, 5));
    expect(db.offers.get(offer.id)?.status).toBe("open");
    expect(recognize).not.toHaveBeenCalled();
  });
});

describe("closing an offer", () => {
  it("the maker can withdraw it; nobody else can", async () => {
    const offer = await post(ADA);
    expect(await circle.cancelOffer(BO, offer.id)).toMatchObject({ ok: false, reason: "offer_not_found" });
    expect(await circle.cancelOffer(ADA, offer.id)).toMatchObject({ ok: true, offer: { status: "cancelled" } });
    expect(await circle.cancelOffer(ADA, offer.id)).toMatchObject({ ok: false, reason: "offer_closed" });
    expect(await circle.acceptOffer(BO, offer.id)).toMatchObject({ reason: "offer_closed" });
  });

  it("only the counterparty of a directed offer can decline it", async () => {
    const open = await post(ADA);
    expect(await circle.declineOffer(BO, open.id)).toMatchObject({ ok: false, reason: "offer_not_found" });
    const result = await circle.createOffer(CY, { ...FAIR, counterparty: { id: BO } });
    const id = result.ok ? result.offer.id : "";
    expect(await circle.declineOffer(ADA, id)).toMatchObject({ ok: false, reason: "offer_not_found" });
    expect(await circle.declineOffer(BO, id)).toMatchObject({ ok: true, offer: { status: "declined" } });
  });
});

describe("the Circle view", () => {
  it("ranks offers made to you first, then the ones that give what you lack", async () => {
    // Bo lacks Spirit and has Essence to spare.
    const complementary = await post(ADA); // gives Spirit, wants Essence
    const other = await post(CY, { giveToken: "Matter", giveAmount: 5, wantToken: "Substance", wantAmount: 2.5 });
    const directed = await circle.createOffer(AGENT, {
      giveToken: "Substance", giveAmount: 1, wantToken: "Matter", wantAmount: 2, counterparty: { id: BO },
    });
    const view = await circle.getCircle(BO);
    expect(view.board.map((o) => o.id)).toEqual([directed.ok ? directed.offer.id : "", complementary.id, other.id]);
    expect(view.board[0]).toMatchObject({ directedToYou: true, maker: { name: "Mercury", isAgent: true } });
    expect(view.board[1]).toMatchObject({ complementsYou: true, youCanFill: true });
    expect(view.board[2]).toMatchObject({ complementsYou: false, youCanFill: true });
    expect(view.needs).toEqual({ lacking: ["Spirit", "Matter", "Substance"], surplus: ["Essence"] });
    expect(view.suggestion).toMatchObject({ giveToken: "Essence", wantToken: "Spirit" });
    expect(view.market).toMatchObject({ live: true, corridorPct: 25 });
    expect(view.bonus).toEqual({ tokenType: "Essence", baseAmount: 1, minTradeValue: 1, perPartnerPerDay: 1 });
  });

  it("hides offers the maker can no longer cover, but shows the maker their own as unfunded", async () => {
    const offer = await post(ADA);
    db.wallets.set(ADA, w(1, 0.5, 5, 5));
    expect((await circle.getCircle(BO)).board).toEqual([]);
    const own = await circle.getCircle(ADA);
    expect(own.mine).toEqual([expect.objectContaining({ id: offer.id, funded: false, status: "open" })]);
  });

  it("counts trades and distinct partners", async () => {
    await circle.acceptOffer(BO, (await post(ADA)).id);
    await circle.acceptOffer(CY, (await post(ADA)).id);
    const view = await circle.getCircle(ADA);
    expect(view.stats).toMatchObject({ trades: 2, partners: 2 });
    expect(view.mine.map((o) => o.taker?.name).sort()).toEqual(["Bo", "Cy"]);
  });

  it("says the market is not live — and prices nothing — when the index is down", async () => {
    await post(ADA);
    getLiveOracleQuote.mockImplementation(() => {
      throw new Error("engine down");
    });
    const view = await circle.getCircle(BO);
    expect(view.market).toEqual({ live: false, prices: null, priceBucketStartUtc: null, corridorPct: 25 });
    expect(view.board[0]?.market).toBeNull();
    expect(view.needs).toBeNull();
    expect(view.suggestion).toBeNull();
  });
});
