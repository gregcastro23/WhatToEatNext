/**
 * POST /api/economy/sync-credit — the ESMS side of Pentacles conversions.
 *
 * The agents app converts a player's pentacles into ESMS on the vessel: it
 * escrows the pentacles in the Pentacles SpacetimeDB module, then credits the
 * ESMS here with `source: "pentacle_conversion"`. That value was not in
 * `TransactionSourceTypeSchema`, so the credit was answered 400 with a message
 * the agents app does not read as definitive, and it kept the pentacles in
 * escrow. Pentacles themselves never reach this ledger (owner ruling
 * 2026-09-29); only the ESMS legs of a conversion do.
 *
 * `pentacle_conversion_refund` returns ESMS that sync-debit took for an
 * ESMS → Pentacles conversion whose pentacles never landed. It may return no
 * more than that debit, axis by axis, or a refund would mint.
 */
import { NextRequest } from "next/server";

const SECRET = "test-sync-secret";

let queryQueue: Array<{ rows: unknown[] }>;
let executed: Array<{ sql: string; params: unknown }>;
let creditCalls: Array<{ userId: string; credits: unknown; source: string; key: unknown }>;

jest.mock("@/lib/database", () => ({
  executeQuery: jest.fn(async (sql: string, params: unknown) => {
    executed.push({ sql, params });
    return queryQueue.shift() ?? { rows: [] };
  }),
}));

jest.mock("@/services/TokenEconomyService", () => ({
  tokenEconomy: {
    creditMultipleTokens: jest.fn(
      async (userId: string, credits: unknown, source: string, opts: { idempotencyKey?: unknown }) => {
        creditCalls.push({ userId, credits, source, key: opts.idempotencyKey });
        return { spirit: 3, essence: 3, matter: 3, substance: 3 };
      },
    ),
    updateDailyClaimTimestamp: jest.fn(async () => undefined),
  },
}));

jest.mock("@/services/feedDatabaseService", () => ({
  feedDatabase: { createEvent: jest.fn(async () => null) },
}));
jest.mock("@/services/notificationDatabaseService", () => ({
  notificationDatabase: { createNotification: jest.fn(async () => null) },
}));

const USER_ID = "33333333-3333-4333-8333-333333333333";
const FOUND_USER = { rows: [{ id: USER_ID }] };
const NO_ROWS = { rows: [] };

function post(body: Record<string, unknown>): NextRequest {
  return new NextRequest("https://alchm.kitchen/api/economy/sync-credit", {
    method: "POST",
    headers: { "X-Sync-Secret": SECRET, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

/** The payload shape `executeConversionQuote` sends: one element, a 4-dp string. */
function conversion(source: string, key: string, amounts: Record<string, string>): Record<string, unknown> {
  return { userEmail: "player@example.com", amounts, source, idempotencyKey: key };
}

let POST: (req: NextRequest) => Promise<Response>;

beforeAll(async () => {
  process.env.ALCHM_KITCHEN_SYNC_SECRET = SECRET;
  ({ POST } = await import("@/app/api/economy/sync-credit/route"));
});

beforeEach(() => {
  queryQueue = [];
  executed = [];
  creditCalls = [];
});

describe("sync-credit accepts a Pentacles → ESMS conversion", () => {
  it("credits the converted ESMS on the quote's element", async () => {
    queryQueue = [FOUND_USER, NO_ROWS];

    const res = await POST(post(conversion("pentacle_conversion", "pentacle_conv:q1", { matter: "1.2345" })));

    expect(res.status).toBe(200);
    expect(creditCalls).toEqual([
      {
        userId: USER_ID,
        credits: [{ tokenType: "Matter", amount: 1.2345 }],
        source: "pentacle_conversion",
        key: "pentacle_conv:q1",
      },
    ]);
  });

  it("answers a retried conversion 409, which the agents app reads as applied", async () => {
    queryQueue = [FOUND_USER, { rows: [{ id: "prior-txn" }] }];

    const res = await POST(post(conversion("pentacle_conversion", "pentacle_conv:q1", { matter: "1.2345" })));

    expect(res.status).toBe(409);
    expect(creditCalls).toEqual([]);
  });
});

describe("sync-credit refunds a failed ESMS → Pentacles conversion only up to its debit", () => {
  const REFUND_KEY = "pentacle_conv_refund:q2";

  it("returns the ESMS the conversion debited", async () => {
    queryQueue = [FOUND_USER, NO_ROWS, { rows: [{ token_type: "Spirit", debited: "2.5000" }] }];

    const res = await POST(post(conversion("pentacle_conversion_refund", REFUND_KEY, { spirit: "2.5000" })));

    expect(res.status).toBe(200);
    expect(creditCalls).toEqual([
      expect.objectContaining({ source: "pentacle_conversion_refund", key: REFUND_KEY }),
    ]);
    // The debit is looked up by the conversion's own key, per axis, for this user.
    const lookup = executed.find((q) => q.sql.includes("debited"));
    expect(lookup?.params).toEqual([
      USER_ID,
      ["Spirit", "Essence", "Matter", "Substance"].map((t) => `pentacle_conv:q2:${t}`),
    ]);
  });

  it("refuses a refund larger than the debit", async () => {
    queryQueue = [FOUND_USER, NO_ROWS, { rows: [{ token_type: "Spirit", debited: "2.5000" }] }];

    const res = await POST(post(conversion("pentacle_conversion_refund", REFUND_KEY, { spirit: "2.5001" })));

    expect(res.status).toBe(422);
    expect(await res.json()).toEqual(expect.objectContaining({ ok: false, reason: "no_matching_debit" }));
    expect(creditCalls).toEqual([]);
  });

  it("refuses a refund on an axis the conversion never debited", async () => {
    queryQueue = [FOUND_USER, NO_ROWS, { rows: [{ token_type: "Spirit", debited: "2.5000" }] }];

    const res = await POST(post(conversion("pentacle_conversion_refund", REFUND_KEY, { essence: "1.0000" })));

    expect(res.status).toBe(422);
    expect(creditCalls).toEqual([]);
  });

  it("refuses a refund with no conversion debit behind it", async () => {
    queryQueue = [FOUND_USER, NO_ROWS, NO_ROWS];

    const res = await POST(post(conversion("pentacle_conversion_refund", REFUND_KEY, { spirit: "2.5000" })));

    expect(res.status).toBe(422);
    expect(creditCalls).toEqual([]);
  });

  it("refuses a refund that is not keyed to a conversion", async () => {
    queryQueue = [FOUND_USER, NO_ROWS];

    const res = await POST(post(conversion("pentacle_conversion_refund", "some-other-key", { spirit: "1" })));

    expect(res.status).toBe(422);
    expect(creditCalls).toEqual([]);
    expect(executed.some((q) => q.sql.includes("debited"))).toBe(false);
  });

  it("refunds a quote once: a replayed refund key is 409 before any lookup", async () => {
    queryQueue = [FOUND_USER, { rows: [{ id: "prior-refund" }] }];

    const res = await POST(post(conversion("pentacle_conversion_refund", REFUND_KEY, { spirit: "2.5000" })));

    expect(res.status).toBe(409);
    expect(creditCalls).toEqual([]);
  });
});
