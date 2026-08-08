/**
 * @jest-environment node
 *
 * sync-debit must leave a DURABLE record that it was called.
 *
 * The liveness check for this endpoint asks "are agents calling while nothing
 * is landing?". The calling half used to be proxied by agent-authored
 * feed_events, because sync-debit requests were persisted nowhere — so the
 * check could not tell "sync-debit is broken" apart from "the producer stopped
 * calling sync-debit but kept posting feed events".
 *
 * Recording STATUS is what makes the outage legible: 1,349 calls/day at 100%
 * HTTP 500 is unmistakable in request_log_entries, and was invisible without
 * it. `/api/admin/observability` could not have shown it either — that ring is
 * in-memory and resets on every Vercel cold start.
 */

const recordRequest = jest.fn();
const executeQuery = jest.fn();

jest.mock("@/lib/observability/requestLog", () => ({
  recordRequest: (...args: unknown[]) => recordRequest(...args),
}));
jest.mock("@/lib/database", () => ({
  executeQuery: (sql: string, params: unknown[] = [], options = {}) =>
    executeQuery(sql, params, options),
  withTransaction: (op: (c: unknown) => Promise<unknown>) =>
    op({ query: (sql: string, params: unknown[]) => executeQuery(sql, params, {}) }),
}));
jest.mock("@/utils/agentMonicaResolver", () => ({ agentMonicaWithMethod: () => null }));
jest.mock("@/utils/fullChartMonica", () => ({
  normaliseNatalPositions: (v: unknown) => (Array.isArray(v) ? v : []),
}));

const USER_ID = "11111111-2222-3333-4444-555555555555";
const SECRET = "test-sync-secret";
let keySeq = 0;

function wireHappyPath() {
  executeQuery.mockImplementation(async (sql: string) => {
    if (/SELECT\s+u\.id/i.test(sql)) return { rows: [{ id: USER_ID, profile_name: "Ada" }] };
    if (/FROM token_transactions WHERE idempotency_key/i.test(sql)) return { rows: [] };
    if (/SELECT spirit::text/i.test(sql)) {
      return { rows: [{ spirit: "100", essence: "100", matter: "100", substance: "100" }] };
    }
    if (/UPDATE token_balances/i.test(sql)) {
      return { rows: [{ spirit: "99", essence: "99", matter: "99", substance: "99" }] };
    }
    return { rows: [] };
  });
}

async function post(headers: Record<string, string> = {}) {
  const { POST } = require("@/app/api/economy/sync-debit/route");
  const req = new Request("https://alchm.kitchen/api/economy/sync-debit", {
    method: "POST",
    headers: { "content-type": "application/json", "X-Sync-Secret": SECRET, ...headers },
    body: JSON.stringify({
      userEmail: "ada@agents.alchm.kitchen",
      amounts: { spirit: 1, essence: 1, matter: 1, substance: 1 },
      idempotencyKey: `instr-${(keySeq += 1)}`,
    }),
  });
  return POST(req as never);
}

describe("sync-debit — durable call instrumentation", () => {
  const original = process.env.ALCHM_KITCHEN_SYNC_SECRET;

  beforeEach(() => {
    process.env.ALCHM_KITCHEN_SYNC_SECRET = SECRET;
    recordRequest.mockReset();
    executeQuery.mockReset();
    jest.resetModules();
  });

  afterAll(() => {
    if (original === undefined) delete process.env.ALCHM_KITCHEN_SYNC_SECRET;
    else process.env.ALCHM_KITCHEN_SYNC_SECRET = original;
  });

  it("records the call under a stable route name", async () => {
    wireHappyPath();
    const res = await post();
    expect(res.status).toBe(200);

    // Recording is fire-and-forget off the hot path; let the microtask run.
    await new Promise((r) => setTimeout(r, 0));

    expect(recordRequest).toHaveBeenCalledWith(
      expect.objectContaining({ path: "/api/economy/sync-debit", method: "POST", status: 200 }),
    );
  });

  it("records the STATUS, so a route that only ever 500s is visible", async () => {
    // The whole point. A path returning 1,349×500 and zero 200s is a dead
    // endpoint, and this table is where that becomes greppable.
    executeQuery.mockImplementation(async () => {
      throw new Error("invalid input syntax for type boolean");
    });
    const res = await post();
    expect(res.status).toBe(500);

    await new Promise((r) => setTimeout(r, 0));

    expect(recordRequest).toHaveBeenCalledWith(
      expect.objectContaining({ path: "/api/economy/sync-debit", status: 500 }),
    );
  });

  it("records rejected calls too — auth failures are traffic", async () => {
    // An authentication regression on the producer side looks like silence in
    // the ledger. It must not also look like silence in the traffic signal.
    wireHappyPath();
    const res = await post({ "X-Sync-Secret": "wrong" });
    expect(res.status).toBeGreaterThanOrEqual(400);

    await new Promise((r) => setTimeout(r, 0));

    expect(recordRequest).toHaveBeenCalledWith(
      expect.objectContaining({ path: "/api/economy/sync-debit" }),
    );
  });

  it("does not attempt user resolution on a machine-to-machine call", async () => {
    // skipUserResolution avoids a database round-trip per call that could only
    // ever return null — there is no session cookie, only X-Sync-Secret.
    wireHappyPath();
    await post();
    await new Promise((r) => setTimeout(r, 0));

    expect(recordRequest).toHaveBeenCalledWith(
      expect.objectContaining({ userId: null }),
    );
  });
});
