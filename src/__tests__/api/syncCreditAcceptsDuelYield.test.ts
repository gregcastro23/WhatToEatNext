/**
 * POST /api/economy/sync-credit — Jing Arena duel credits.
 *
 * The agents app pays each Jing Arena duel round to the player there and
 * forwards the same basket here with `source: "duel_yield"`. That value was not
 * in `TransactionSourceTypeSchema`, so every forward was answered 400, which
 * the agents app only logs. Prod held 0 `duel_yield` rows on 2026-09-28: no
 * duel winnings had ever reached the WTEN vessel.
 *
 * A duel is not a daily yield: several rounds a day are legitimate (the agents
 * app caps them), so the once-per-UTC-day guard must not touch it.
 */
import { NextRequest } from "next/server";

const SECRET = "test-sync-secret";

let queryQueue: Array<{ rows: unknown[] }>;
let executedSql: string[];
let creditCalls: Array<{ userId: string; source: string; key: unknown }>;

jest.mock("@/lib/database", () => ({
  executeQuery: jest.fn(async (sql: string) => {
    executedSql.push(sql);
    return queryQueue.shift() ?? { rows: [] };
  }),
}));

jest.mock("@/services/TokenEconomyService", () => ({
  tokenEconomy: {
    creditMultipleTokens: jest.fn(
      async (userId: string, _credits: unknown, source: string, opts: { idempotencyKey?: unknown }) => {
        creditCalls.push({ userId, source, key: opts.idempotencyKey });
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

const USER_ID = "22222222-2222-4222-8222-222222222222";
const FOUND_USER = { rows: [{ id: USER_ID }] };
const NO_ROWS = { rows: [] };

function post(body: Record<string, unknown>): NextRequest {
  return new NextRequest("https://alchm.kitchen/api/economy/sync-credit", {
    method: "POST",
    headers: { "X-Sync-Secret": SECRET, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function duelBody(key: string): Record<string, unknown> {
  return {
    userEmail: "player@example.com",
    amounts: { spirit: "1", essence: "1", matter: "1", substance: "1" },
    source: "duel_yield",
    idempotencyKey: key,
  };
}

let POST: (req: NextRequest) => Promise<Response>;

beforeAll(async () => {
  process.env.ALCHM_KITCHEN_SYNC_SECRET = SECRET;
  ({ POST } = await import("@/app/api/economy/sync-credit/route"));
});

beforeEach(() => {
  queryQueue = [];
  executedSql = [];
  creditCalls = [];
});

describe("sync-credit accepts Jing Arena duel credits", () => {
  it("credits a duel round under its own source", async () => {
    queryQueue = [FOUND_USER, NO_ROWS];

    const res = await POST(post(duelBody("duel_yield:asol-user-1:1790000000000")));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(expect.objectContaining({ ok: true }));
    expect(creditCalls).toEqual([
      { userId: USER_ID, source: "duel_yield", key: "duel_yield:asol-user-1:1790000000000" },
    ]);
  });

  it("does not day-cap duel rounds the way it caps daily yield", async () => {
    queryQueue = [FOUND_USER, NO_ROWS, FOUND_USER, NO_ROWS];

    const first = await POST(post(duelBody("duel_yield:asol-user-1:1790000000000")));
    const second = await POST(post(duelBody("duel_yield:asol-user-1:1790000060000")));

    expect([first.status, second.status]).toEqual([200, 200]);
    expect(creditCalls).toHaveLength(2);
    // Neither the chart check nor the same-UTC-day probe ran: both belong to
    // daily yield only.
    expect(executedSql.some((s) => s.includes("natal_positions"))).toBe(false);
    expect(executedSql.some((s) => s.includes("source_type = $2"))).toBe(false);
  });

  it("still refuses a replayed duel key", async () => {
    queryQueue = [FOUND_USER, { rows: [{ id: "prior-txn" }] }];

    const res = await POST(post(duelBody("duel_yield:asol-user-1:1790000000000")));

    expect(res.status).toBe(409);
    expect(creditCalls).toEqual([]);
  });

  it("still refuses a source it has not been told about", async () => {
    // The enum stays strict: the agents app's `yield_claim` (a planetary-agent
    // balance transfer whose debit half never reaches WTEN) stays refused by
    // owner ruling 2026-09-29, because the agents-daily-yield cron already
    // pays that baseline and a second claim would double-mint.
    const res = await POST(post({ ...duelBody("k"), source: "yield_claim" }));

    expect(res.status).toBe(400);
    expect(creditCalls).toEqual([]);
  });
});
