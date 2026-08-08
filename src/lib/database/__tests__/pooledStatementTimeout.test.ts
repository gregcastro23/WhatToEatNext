/**
 * The server-side statement_timeout floor, restored for pooled connections.
 *
 * WHY THIS MATTERS, MEASURED
 * --------------------------
 * With no server floor (production's state until now), a client-side
 * `query_timeout` does NOT stop the backend. Against the live Railway pooler:
 * the client gave up at 2,002ms while the backend ran the full 6s, holding one
 * of the 20 pooled slots for four seconds after the request was abandoned.
 *
 * PgBouncer refuses `statement_timeout` as a startup parameter at login in
 * every pool mode, so the floor is delivered as a plain `SET` after connect —
 * which sticks in session mode. These pin the three things that make it work.
 */

import {
  resolvePooledStatementTimeoutSql,
  resolveClientQueryTimeout,
  CLIENT_TIMEOUT_MARGIN_MS,
} from "@/lib/database/config";

describe("resolvePooledStatementTimeoutSql", () => {
  it("emits the SET in session mode — the only mode where it persists", () => {
    expect(resolvePooledStatementTimeoutSql("session", 5000)).toBe(
      "SET statement_timeout = 5000",
    );
  });

  it("emits nothing in direct mode — the startup packet already carries it", () => {
    // Sending it twice is harmless but misleading; resolveServerStatementCap
    // owns the direct case, and exactly one of the two must fire.
    expect(resolvePooledStatementTimeoutSql("direct", 5000)).toBeNull();
  });

  it("emits nothing in transaction mode — a session SET would not survive", () => {
    // PgBouncer reassigns a server per transaction, so a bare SET is reset
    // before the next statement. Such a deployment needs a connect_query; the
    // role-level backstop on the Postgres side covers it meanwhile.
    expect(resolvePooledStatementTimeoutSql("transaction", 5000)).toBeNull();
  });

  it("emits nothing for an unrecognised pooler mode", () => {
    // Fail safe, matching resolveServerStatementCap: an unknown topology must
    // never produce a statement we cannot reason about.
    expect(resolvePooledStatementTimeoutSql("supavisor", 5000)).toBeNull();
    expect(resolvePooledStatementTimeoutSql("", 5000)).toBeNull();
  });

  describe("the interpolated value can only ever be a positive integer", () => {
    // `SET` takes no bind parameters, so the timeout is interpolated into SQL.
    // These are the guards that keep that safe.
    it.each([
      ["zero", 0],
      ["negative", -1],
      ["NaN", Number.NaN],
      ["Infinity", Number.POSITIVE_INFINITY],
    ])("returns null for %s rather than emitting nonsense", (_label, ms) => {
      expect(resolvePooledStatementTimeoutSql("session", ms as number)).toBeNull();
    });

    it("rounds a fractional value instead of interpolating a decimal", () => {
      expect(resolvePooledStatementTimeoutSql("session", 4999.6)).toBe(
        "SET statement_timeout = 5000",
      );
    });

    it("never interpolates anything but digits", () => {
      const sql = resolvePooledStatementTimeoutSql("session", 5000);
      expect(sql).toMatch(/^SET statement_timeout = \d+$/);
    });
  });
});

describe("resolveClientQueryTimeout", () => {
  it("sits above the server cap so Postgres wins the race", () => {
    // Both timers race and node-postgres starts its own at dispatch while
    // Postgres starts statement_timeout at execution — a measured ~40ms delta.
    // Equal values let the client win, and the caller sees a bare "Query read
    // timeout" instead of SQLSTATE 57014, which is the error that actually
    // says the floor did its job.
    expect(resolveClientQueryTimeout(5000)).toBeGreaterThan(5000);
    expect(resolveClientQueryTimeout(5000)).toBe(5000 + CLIENT_TIMEOUT_MARGIN_MS);
  });

  it("keeps a margin large enough to cover the observed dispatch delta", () => {
    // The measured client/server delta was ~40ms; anything comfortably above
    // that is fine, but a margin at or below it would reintroduce the race.
    expect(CLIENT_TIMEOUT_MARGIN_MS).toBeGreaterThan(100);
  });

  it("still bounds the request — the margin is additive, not unbounded", () => {
    expect(resolveClientQueryTimeout(5000)).toBeLessThan(10_000);
  });
});
