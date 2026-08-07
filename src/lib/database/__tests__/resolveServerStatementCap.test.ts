/**
 * Regression test for the PgBouncer startup-parameter gate.
 *
 * node-postgres sends `statement_timeout` in the connection startup packet.
 * PgBouncer refuses any startup parameter missing from
 * `ignore_startup_parameters` — at client login, in EVERY pool mode. The live
 * Railway pooler allows only `extra_float_digits`, so the app's real config was
 * rejected with `unsupported startup parameter: statement_timeout` and
 * connected the moment that key was dropped.
 *
 * The load-bearing case is therefore "session omits the startup param". Under
 * the previous logic (`poolerMode === "transaction" ? {} : {...}`) session
 * returned the timeout and the pool could not connect at all.
 */

import { resolveServerStatementCap } from "@/lib/database/config";

describe("resolveServerStatementCap", () => {
  // The last case mutates DB_POOLER_MODE, and process.env is shared across
  // every file in a jest worker — restore it so nothing downstream inherits it.
  const originalPoolerMode = process.env.DB_POOLER_MODE;

  afterEach(() => {
    if (originalPoolerMode === undefined) delete process.env.DB_POOLER_MODE;
    else process.env.DB_POOLER_MODE = originalPoolerMode;
    jest.resetModules();
  });

  it("omits statement_timeout in session mode (PgBouncer rejects it)", () => {
    expect(resolveServerStatementCap("session", 5000)).toEqual({});
  });

  it("omits statement_timeout in transaction mode", () => {
    expect(resolveServerStatementCap("transaction", 5000)).toEqual({});
  });

  it("sends statement_timeout on a direct connection", () => {
    expect(resolveServerStatementCap("direct", 5000)).toEqual({
      statement_timeout: 5000,
    });
  });

  it("passes the configured timeout through unchanged", () => {
    expect(resolveServerStatementCap("direct", 1234)).toEqual({
      statement_timeout: 1234,
    });
  });

  it("fails safe on an unrecognised pooler mode", () => {
    // Anything not explicitly direct must omit the param — sending it to an
    // unknown topology risks wedging the pool shut on every connection.
    for (const mode of ["", "pgbouncer", "SESSION", "unknown"]) {
      expect(resolveServerStatementCap(mode, 5000)).toEqual({});
    }
  });

  it("defaults to direct, so an unset DB_POOLER_MODE still gets the cap", () => {
    delete process.env.DB_POOLER_MODE;
    jest.resetModules();
    const { databaseConfig, resolveServerStatementCap: fn } = require("@/lib/database/config");
    expect(databaseConfig.poolerMode).toBe("direct");
    expect(fn(databaseConfig.poolerMode, 5000)).toEqual({
      statement_timeout: 5000,
    });
  });
});
