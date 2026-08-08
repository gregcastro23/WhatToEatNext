/**
 * @jest-environment node
 *
 * Two properties of /api/economy/sync-debit that the twelve-week outage argued for.
 *
 * 1. THE DEBIT AND ITS LEDGER ROWS COMMIT TOGETHER.
 *    Every statement used to autocommit on its own, so a failure between the
 *    balance UPDATE and the token_transactions INSERTs would leave a user
 *    charged with nothing accounting for it — permanent, undetectable drift in
 *    the ledger that exists to reconcile. It stayed clean during the outage
 *    only because the throw landed before the debit, which was luck.
 *
 * 2. PROFILE ENRICHMENT CANNOT BLOCK THE DEBIT.
 *    That is precisely how the outage happened: one bad parameter binding threw
 *    during enrichment, before the debit, and 1,349 calls a day returned 500
 *    with nothing charged for twelve weeks. Enrichment is a nice-to-have;
 *    charging for the operation is the point of the endpoint.
 *
 * These assert the wiring — which statements ran, and on which connection —
 * rather than restating the route's logic.
 */

const executeQuery = jest.fn();
/** Statements issued on the transaction client, in order. */
const inTransaction: string[] = [];
/** Statements issued outside any transaction (straight to the pool). */
const outsideTransaction: string[] = [];
let transactionRejected: Error | null = null;

jest.mock("@/lib/database", () => ({
  executeQuery: (sql: string, params: unknown[] = [], options: { client?: unknown } = {}) => {
    (options.client ? inTransaction : outsideTransaction).push(sql);
    return executeQuery(sql, params, options);
  },
  withTransaction: async (op: (client: unknown) => Promise<unknown>) => {
    // A real withTransaction issues BEGIN/COMMIT and rolls back on throw. What
    // matters here is that the operation receives a client and that a throw
    // propagates instead of leaving partial work committed.
    try {
      return await op({ query: (sql: string, params: unknown[]) => executeQuery(sql, params, {}) });
    } catch (err) {
      transactionRejected = err as Error;
      throw err;
    }
  },
}));
jest.mock("@/utils/agentMonicaResolver", () => ({ agentMonicaWithMethod: () => null }));
jest.mock("@/utils/fullChartMonica", () => ({
  normaliseNatalPositions: (v: unknown) => (Array.isArray(v) ? v : []),
}));

const USER_ID = "11111111-2222-3333-4444-555555555555";
const SECRET = "test-sync-secret";
let keySeq = 0;

/** Default happy-path responses; `overrides` can make one statement throw. */
function wireDatabase(overrides: (sql: string) => unknown | undefined = () => undefined) {
  executeQuery.mockImplementation(async (sql: string) => {
    const override = overrides(sql);
    if (override instanceof Error) throw override;

    if (/SELECT\s+u\.id/i.test(sql)) {
      return { rows: [{ id: USER_ID, profile_name: "Ada Lovelace" }] };
    }
    if (/FROM token_transactions WHERE idempotency_key/i.test(sql)) {
      return { rows: [] }; // not a duplicate
    }
    if (/SELECT spirit::text/i.test(sql)) {
      return { rows: [{ spirit: "100", essence: "100", matter: "100", substance: "100" }] };
    }
    if (/UPDATE token_balances/i.test(sql)) {
      return { rows: [{ spirit: "99", essence: "99", matter: "99", substance: "99" }] };
    }
    return { rows: [] };
  });
}

async function post(body: Record<string, unknown>) {
  const { POST } = require("@/app/api/economy/sync-debit/route");
  const req = new Request("https://alchm.kitchen/api/economy/sync-debit", {
    method: "POST",
    headers: { "content-type": "application/json", "X-Sync-Secret": SECRET },
    body: JSON.stringify({
      userEmail: "ada@agents.alchm.kitchen",
      amounts: { spirit: 1, essence: 1, matter: 1, substance: 1 },
      idempotencyKey: `txn-test-${(keySeq += 1)}`,
      ...body,
    }),
  });
  return POST(req as never);
}

describe("sync-debit — transactional integrity", () => {
  const original = process.env.ALCHM_KITCHEN_SYNC_SECRET;

  beforeEach(() => {
    process.env.ALCHM_KITCHEN_SYNC_SECRET = SECRET;
    executeQuery.mockReset();
    inTransaction.length = 0;
    outsideTransaction.length = 0;
    transactionRejected = null;
    jest.resetModules();
  });

  afterAll(() => {
    if (original === undefined) delete process.env.ALCHM_KITCHEN_SYNC_SECRET;
    else process.env.ALCHM_KITCHEN_SYNC_SECRET = original;
  });

  it("runs the debit and its ledger rows on the SAME transaction client", async () => {
    wireDatabase();
    const res = await post({});
    expect(res.status).toBe(200);

    const debit = inTransaction.filter((s) => /UPDATE token_balances/i.test(s));
    const ledger = inTransaction.filter((s) => /INSERT INTO token_transactions/i.test(s));

    // Four token types were debited, so four ledger rows — all inside.
    expect(debit).toHaveLength(1);
    expect(ledger).toHaveLength(4);
    // ...and none of them leaked onto an autocommitting pool connection.
    expect(outsideTransaction.some((s) => /UPDATE token_balances/i.test(s))).toBe(false);
    expect(outsideTransaction.some((s) => /INSERT INTO token_transactions/i.test(s))).toBe(false);
  });

  it("propagates a ledger-write failure so the debit rolls back with it", async () => {
    // The drift scenario: balance reduced, ledger row missing. The write must
    // not be allowed to half-commit.
    wireDatabase((sql) =>
      /INSERT INTO token_transactions/i.test(sql) ? new Error("ledger write failed") : undefined,
    );

    const res = await post({});
    expect(res.status).toBe(500);
    // The transaction saw the error — a real withTransaction issues ROLLBACK here.
    expect(transactionRejected).toBeInstanceOf(Error);
    expect(transactionRejected?.message).toBe("ledger write failed");
  });

  it("keeps provisioning OUTSIDE the transaction so a refused debit does not undo it", async () => {
    // Identity provisioning is idempotent and worth keeping even when the debit
    // is refused; folding it in would let an enrichment failure roll back a
    // completed charge.
    wireDatabase();
    await post({ metadata: { agentProfile: { name: "Ada Lovelace", birthDate: "1756-01-27" } } });

    expect(outsideTransaction.some((s) => /UPDATE user_profiles SET/i.test(s))).toBe(true);
    expect(inTransaction.some((s) => /UPDATE user_profiles SET/i.test(s))).toBe(false);
  });

  describe("profile enrichment cannot block the debit", () => {
    it("still charges when the enrichment UPDATE throws", async () => {
      // This is the outage, reproduced: enrichment fails, and the debit must
      // still happen. Before this guard the route returned 500 and charged
      // nothing — for twelve weeks.
      wireDatabase((sql) =>
        /UPDATE user_profiles SET/i.test(sql)
          ? new Error('invalid input syntax for type boolean: "1756-01-27"')
          : undefined,
      );

      const res = await post({
        metadata: { agentProfile: { name: "Ada Lovelace", birthDate: "1756-01-27" } },
      });

      expect(res.status).toBe(200);
      expect(inTransaction.filter((s) => /INSERT INTO token_transactions/i.test(s))).toHaveLength(4);
    });

    it("logs the enrichment failure rather than swallowing it", async () => {
      // Non-fatal must not mean invisible: a persistent enrichment failure is a
      // real defect, just not one worth losing revenue over.
      const spy = jest.spyOn(console, "error").mockImplementation(() => undefined);
      wireDatabase((sql) =>
        /UPDATE user_profiles SET/i.test(sql) ? new Error("constraint violation") : undefined,
      );

      await post({ metadata: { agentProfile: { name: "Ada Lovelace", birthDate: "1756-01-27" } } });

      expect(spy).toHaveBeenCalledWith(
        expect.stringContaining("PROFILE_ENRICHMENT_FAILED"),
        expect.objectContaining({ userId: USER_ID }),
      );
      spy.mockRestore();
    });
  });
});
