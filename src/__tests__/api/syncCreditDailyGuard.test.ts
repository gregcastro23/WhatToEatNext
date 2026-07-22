/**
 * POST /api/economy/sync-credit — the daily-yield guards.
 *
 * These pin the fix for a MEASURED production double-credit (2026-07-19..21,
 * 30 agents/day, ~240 tokens/day of excess). The important property is the one
 * the first test asserts: a duplicate is refused **even though the two
 * idempotency keys differ**, because key-based idempotency structurally cannot
 * catch this class.
 *
 *   in-repo cron   DailyYieldService.ts:330  `daily:agents:<uuid>:<date>`
 *   this endpoint  caller-supplied           `agentic:yield:<email>:<date>`
 *
 * Two different strings for the same economic event. No amount of key-variant
 * probing makes them collide, so the guard checks the invariant directly:
 * daily yield is once-per-user-per-UTC-day by definition.
 */
import { NextRequest } from "next/server";

const SECRET = "test-sync-secret";

/** Rows the mocked `executeQuery` will return, in call order. */
let queryQueue: Array<{ rows: unknown[] }>;
/** Every SQL string the route executed, for asserting what it did NOT do. */
let executedSql: string[];
let creditCalls: Array<{ userId: string; source: string }>;
let claimStamps: Array<{ userId: string; site: string }>;

jest.mock("@/lib/database", () => ({
  executeQuery: jest.fn(async (sql: string) => {
    executedSql.push(sql);
    return queryQueue.shift() ?? { rows: [] };
  }),
}));

jest.mock("@/services/TokenEconomyService", () => ({
  tokenEconomy: {
    creditMultipleTokens: jest.fn(
      async (userId: string, _credits: unknown, source: string) => {
        creditCalls.push({ userId, source });
        return { spirit: 1, essence: 1, matter: 1, substance: 1 };
      },
    ),
    updateDailyClaimTimestamp: jest.fn(async (userId: string, site: string) => {
      claimStamps.push({ userId, site });
    }),
  },
}));

jest.mock("@/services/feedDatabaseService", () => ({
  feedDatabase: { createEvent: jest.fn(async () => null) },
}));
jest.mock("@/services/notificationDatabaseService", () => ({
  notificationDatabase: { createNotification: jest.fn(async () => null) },
}));

const USER_ID = "11111111-1111-4111-8111-111111111111";
const FOUND_USER = { rows: [{ id: USER_ID }] };
const HAS_CHART = { rows: [{ ok: true }] };
const NO_ROWS = { rows: [] };

function post(body: Record<string, unknown>) {
  return new NextRequest("https://alchm.kitchen/api/economy/sync-credit", {
    method: "POST",
    headers: { "X-Sync-Secret": SECRET, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

const YIELD_BODY = {
  userEmail: "aristotle@agentic.alchm.kitchen",
  amounts: { spirit: 2, essence: 2, matter: 2, substance: 2 },
  source: "agents_yield",
  idempotencyKey: "agentic:yield:aristotle@agentic.alchm.kitchen:2026-07-21",
};

let POST: (req: NextRequest) => Promise<Response>;

beforeAll(async () => {
  process.env.ALCHM_KITCHEN_SYNC_SECRET = SECRET;
  ({ POST } = await import("@/app/api/economy/sync-credit/route"));
});

beforeEach(() => {
  queryQueue = [];
  executedSql = [];
  creditCalls = [];
  claimStamps = [];
});

describe("sync-credit — semantic daily guard", () => {
  it("refuses a same-day duplicate EVEN WITH a different idempotency key", async () => {
    queryQueue = [
      FOUND_USER, // user lookup
      HAS_CHART, // chart check
      NO_ROWS, // key-based idempotency probe — MISSES, as it must
      { rows: [{ id: "prior-txn" }] }, // same-UTC-day probe — CATCHES
    ];

    const res = await POST(post(YIELD_BODY));
    const json = (await res.json()) as { reason: string };

    expect(res.status).toBe(409);
    expect(json.reason).toBe("already_applied");
    expect(creditCalls).toEqual([]);

    // Non-vacuity: prove the key probe really did run and really did miss, so
    // the 409 came from the day guard and not from the older check.
    expect(executedSql.some((s) => s.includes("idempotency_key = ANY"))).toBe(true);
    expect(
      executedSql.some((s) => s.includes("source_type = $2") && s.includes("::date")),
    ).toBe(true);
  });

  it("credits normally when there is no prior same-day yield", async () => {
    queryQueue = [FOUND_USER, HAS_CHART, NO_ROWS, NO_ROWS];

    const res = await POST(post(YIELD_BODY));

    expect(res.status).toBe(200);
    expect(creditCalls).toEqual([{ userId: USER_ID, source: "agents_yield" }]);
  });

  // Without this the fix is ONE-SIDED: §3b stops this endpoint paying after the
  // cron, but nothing stops the cron paying after this endpoint. Stamping the
  // timestamp makes the cron's own hasClaimedToday() see the external credit.
  it("stamps the claim timestamp the CRON checks, so the guard is bidirectional", async () => {
    queryQueue = [FOUND_USER, HAS_CHART, NO_ROWS, NO_ROWS];

    await POST(post(YIELD_BODY));

    expect(claimStamps).toEqual([{ userId: USER_ID, site: "agents" }]);
  });

  it("does not stamp a claim timestamp for a non-yield source", async () => {
    queryQueue = [FOUND_USER, NO_ROWS];

    await POST(
      post({
        ...YIELD_BODY,
        source: "transit_attunement",
        idempotencyKey: "transit:aristotle:mars:2026-07-21T13",
      }),
    );

    expect(claimStamps).toEqual([]);
  });

  it("does NOT day-cap a non-yield source — Sky Drops fire many times a day", async () => {
    queryQueue = [
      FOUND_USER,
      NO_ROWS, // key probe misses
      // …and NO same-day probe should be issued at all for this source.
    ];

    const res = await POST(
      post({
        ...YIELD_BODY,
        source: "transit_attunement",
        idempotencyKey: "transit:aristotle:mars:2026-07-21T12",
      }),
    );

    expect(res.status).toBe(200);
    expect(creditCalls[0]?.source).toBe("transit_attunement");
    expect(
      executedSql.some((s) => s.includes("source_type = $2") && s.includes("::date")),
    ).toBe(false);
  });

  it("treats an OMITTED source as agents_yield — that is what PA sends", async () => {
    const { source: _drop, ...noSource } = YIELD_BODY;
    queryQueue = [FOUND_USER, HAS_CHART, NO_ROWS, { rows: [{ id: "prior" }] }];

    const res = await POST(post(noSource));

    expect(res.status).toBe(409);
    expect(creditCalls).toEqual([]);
  });
});

describe("sync-credit — daily yield cannot mint the account it pays", () => {
  it("404s an unknown agentic email instead of auto-provisioning it", async () => {
    queryQueue = [NO_ROWS]; // user lookup finds nothing

    const res = await POST(post(YIELD_BODY));
    const json = (await res.json()) as { reason: string };

    expect(res.status).toBe(404);
    expect(json.reason).toBe("user_not_found");
    expect(creditCalls).toEqual([]);
    // The load-bearing assertion: no INSERT was attempted. This is how two
    // 2026-07-19 smoke-test vessels became paid, chart-less users.
    expect(executedSql.some((s) => s.includes("INSERT INTO users"))).toBe(false);
  });

  it("still auto-provisions for a NON-yield source", async () => {
    queryQueue = [NO_ROWS, FOUND_USER, NO_ROWS];

    const res = await POST(
      post({
        ...YIELD_BODY,
        source: "transit_attunement",
        idempotencyKey: "transit:new-agent:venus:2026-07-21T12",
      }),
    );

    expect(res.status).toBe(200);
    expect(executedSql.some((s) => s.includes("INSERT INTO users"))).toBe(true);
  });

  it("422s a chart-less agent — same predicate as the agents-daily-yield cron", async () => {
    queryQueue = [FOUND_USER, { rows: [{ ok: false }] }];

    const res = await POST(post(YIELD_BODY));
    const json = (await res.json()) as { reason: string };

    expect(res.status).toBe(422);
    expect(json.reason).toBe("no_chart");
    expect(creditCalls).toEqual([]);
  });

  it("422s when the profile row is missing entirely, not just chart-less", async () => {
    queryQueue = [FOUND_USER, NO_ROWS];

    const res = await POST(post(YIELD_BODY));

    expect(res.status).toBe(422);
    expect(creditCalls).toEqual([]);
  });
});

describe("sync-credit — the secret still gates everything", () => {
  it("401s without the sync secret, before any query runs", async () => {
    const req = new NextRequest("https://alchm.kitchen/api/economy/sync-credit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(YIELD_BODY),
    });

    const res = await POST(req);

    expect(res.status).toBe(401);
    expect(executedSql).toEqual([]);
  });
});
