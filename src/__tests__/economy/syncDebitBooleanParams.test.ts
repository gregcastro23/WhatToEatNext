/**
 * @jest-environment node
 *
 * Regression test for the sync-debit boolean binding.
 *
 * The UPDATE on user_profiles binds three flags to `$n::boolean`:
 *   natal_chart     = CASE WHEN $3::boolean ...
 *   natal_positions = CASE WHEN $5::boolean ...
 *   birth_data      = CASE WHEN $9::boolean ...
 *
 * `$9` was computed as `ap.birthDate || ap.birthTime || ap.birthLocation`,
 * which returns the *operand* rather than a boolean — so Postgres received the
 * birth date itself and rejected it:
 *
 *   invalid input syntax for type boolean: "1756-01-27"   (SQLSTATE 22P02)
 *
 * That threw before the debit executed, so every call carrying birth data
 * returned 500 and no agent operation was ever charged (1,349 calls / 24h,
 * 100% failure; the agents_operation ledger has been empty since 2026-05-15).
 *
 * These assert the TYPE of the bound parameter, not a reimplementation of the
 * predicate — a test that recomputed the expression would pass against the
 * broken code. The route is allowed to fail after the statement we care about;
 * the parameters are captured either way.
 */

const executeQuery = jest.fn();

jest.mock("@/lib/database", () => ({
  executeQuery: (...args: unknown[]) => executeQuery(...args),
}));
jest.mock("@/utils/agentMonicaResolver", () => ({
  agentMonicaWithMethod: () => null,
}));
jest.mock("@/utils/fullChartMonica", () => ({
  normaliseNatalPositions: (v: unknown) => (Array.isArray(v) ? v : []),
}));

const USER_ID = "11111111-2222-3333-4444-555555555555";
const SECRET = "test-sync-secret";

let keySeq = 0;

/** Params bound to the `UPDATE user_profiles SET ...` statement. Throws if absent. */
async function captureProfileUpdate(
  agentProfile: Record<string, unknown>,
): Promise<unknown[]> {
  const calls: Array<{ sql: string; params: unknown[] }> = [];
  executeQuery.mockImplementation(async (sql: string, params: unknown[] = []) => {
    calls.push({ sql, params });
    // Only the identity lookup must succeed for control flow to reach the
    // statement under test. Everything after it may fail harmlessly.
    if (/SELECT\s+u\.id/i.test(sql)) {
      return { rows: [{ id: USER_ID, profile_name: "Ada Lovelace" }] };
    }
    return { rows: [] };
  });

  const { POST } = require("@/app/api/economy/sync-debit/route");
  const req = new Request("https://alchm.kitchen/api/economy/sync-debit", {
    method: "POST",
    headers: { "content-type": "application/json", "X-Sync-Secret": SECRET },
    body: JSON.stringify({
      userEmail: "ada@agents.alchm.kitchen",
      amounts: { spirit: 1, essence: 1, matter: 1, substance: 1 },
      idempotencyKey: `test-key-${(keySeq += 1)}`,
      metadata: { agentProfile },
    }),
  });

  // The route may 500 further down on the deliberately-thin mocks; irrelevant.
  await POST(req as never).catch(() => undefined);

  const hit = calls.find((c) => /UPDATE\s+user_profiles\s+SET/i.test(c.sql));
  if (!hit) throw new Error("UPDATE user_profiles was never executed — control flow did not reach the statement under test");
  return hit.params;
}

describe("sync-debit — boolean parameters for user_profiles", () => {
  const original = process.env.ALCHM_KITCHEN_SYNC_SECRET;

  beforeEach(() => {
    process.env.ALCHM_KITCHEN_SYNC_SECRET = SECRET;
    executeQuery.mockReset();
    jest.resetModules();
  });

  afterAll(() => {
    if (original === undefined) delete process.env.ALCHM_KITCHEN_SYNC_SECRET;
    else process.env.ALCHM_KITCHEN_SYNC_SECRET = original;
  });

  it("binds $9 as a boolean when a birth date is present", async () => {
    const params = await captureProfileUpdate({
      name: "Ada Lovelace",
      birthDate: "1756-01-27",
    });
    // $9 is index 8. Under the bug this was the string "1756-01-27", which
    // Postgres rejects with 22P02.
    expect(typeof params[8]).toBe("boolean");
    expect(params[8]).toBe(true);
  });

  it("binds $9 as a boolean for birthTime or birthLocation alone", async () => {
    for (const ap of [
      { name: "A", birthTime: "14:30" },
      { name: "B", birthLocation: "Brooklyn, NY" },
    ]) {
      const params = await captureProfileUpdate(ap);
      expect(typeof params[8]).toBe("boolean");
      expect(params[8]).toBe(true);
    }
  });

  it("binds $9 as false — not null — when no birth field is present", async () => {
    const params = await captureProfileUpdate({ name: "No Birth Data" });
    expect(params[8]).toBe(false);
  });

  it("binds $3 and $5 as booleans too", async () => {
    const params = await captureProfileUpdate({
      name: "Ada Lovelace",
      birthDate: "1756-01-27",
      natalChart: { sun: "Aquarius" },
      natalPositions: [{ planet: "Sun", sign: "Aquarius" }],
    });
    expect(typeof params[2]).toBe("boolean"); // $3 natal_chart
    expect(typeof params[4]).toBe("boolean"); // $5 natal_positions
    expect(params[2]).toBe(true);
    expect(params[4]).toBe(true);
  });

  it("still passes the birth payload itself through $10 as JSON", async () => {
    const params = await captureProfileUpdate({
      name: "Ada Lovelace",
      birthDate: "1756-01-27",
      birthLocation: "London",
    });
    expect(JSON.parse(params[9] as string)).toEqual({
      date: "1756-01-27",
      time: null,
      location: "London",
    });
  });
});
