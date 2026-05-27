/**
 * Configuration plumbing tests — verifies the statement_timeout floor
 * (Item 2C) is wired through env → databaseConfig → validator. This is
 * deliberately a config-shape test, not a pg.Pool integration test;
 * exercising the real timeout requires Postgres.
 */

describe("databaseConfig.statementTimeoutMs", () => {
  const originalEnv = process.env.DB_STATEMENT_TIMEOUT_MS;

  afterEach(() => {
    if (originalEnv === undefined) delete process.env.DB_STATEMENT_TIMEOUT_MS;
    else process.env.DB_STATEMENT_TIMEOUT_MS = originalEnv;
    jest.resetModules();
  });

  it("defaults to 5000ms when DB_STATEMENT_TIMEOUT_MS is unset", () => {
    delete process.env.DB_STATEMENT_TIMEOUT_MS;
    jest.resetModules();
    const { databaseConfig } = require("@/lib/database/config");
    expect(databaseConfig.statementTimeoutMs).toBe(5000);
  });

  it("reads DB_STATEMENT_TIMEOUT_MS from the environment", () => {
    process.env.DB_STATEMENT_TIMEOUT_MS = "3500";
    jest.resetModules();
    const { databaseConfig } = require("@/lib/database/config");
    expect(databaseConfig.statementTimeoutMs).toBe(3500);
  });

  it("validateDatabaseConfig rejects values outside [100, 60000]", () => {
    process.env.DB_STATEMENT_TIMEOUT_MS = "50";
    jest.resetModules();
    const { validateDatabaseConfig } = require("@/lib/database/config");
    const result = validateDatabaseConfig();
    expect(result.valid).toBe(false);
    expect(result.errors.join(" ")).toMatch(/DB_STATEMENT_TIMEOUT_MS/);
  });

  it("validateDatabaseConfig accepts a 5000ms default", () => {
    delete process.env.DB_STATEMENT_TIMEOUT_MS;
    jest.resetModules();
    const { validateDatabaseConfig } = require("@/lib/database/config");
    const result = validateDatabaseConfig();
    // Filter to only the statement_timeout error (other fields may fail in a
    // bare test env, but we only care about ours here).
    const ourErrors = result.errors.filter((e: string) =>
      e.includes("DB_STATEMENT_TIMEOUT_MS"),
    );
    expect(ourErrors).toHaveLength(0);
  });
});
