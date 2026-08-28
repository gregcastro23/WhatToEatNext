/**
 * @jest-environment node
 *
 * validateDatabaseConfig() had no callers, so nothing ever exercised it and two
 * defects sat in it unnoticed:
 *
 *   1. it rejected `postgres://`, a scheme `pg` accepts and that Railway, Neon,
 *      Supabase and Heroku all hand out;
 *   2. a malformed numeric env var resolved to NaN, and every range check is a
 *      comparison against NaN — all of which are `false`. The most broken
 *      configuration was the one it was blindest to.
 *
 * Both matter now that initializeDatabase() throws on the result: (1) would
 * abort the pool on a working connection string, and (2) would let it through.
 *
 * These drive the real initializeDatabase() against a fake pg, so what is under
 * test is the wiring, not a restatement of the validator.
 */

const mockPools: Array<{ config: Record<string, unknown> }> = [];

jest.mock("pg", () => {
  class FakePool {
    config: Record<string, unknown>;
    constructor(config: Record<string, unknown>) {
      this.config = config;
      mockPools.push(this);
    }
    on() {
      return this;
    }
  }
  return {
    __esModule: true,
    default: {
      Pool: FakePool,
      types: {
        setTypeParser: () => undefined,
        builtins: { NUMERIC: 1700, INT8: 20 },
      },
    },
  };
});

jest.mock("@/lib/logger", () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
  _logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
}));

const DB_ENV_KEYS = [
  "DATABASE_URL",
  "DB_POOLER_MODE",
  "DB_MAX_CONNECTIONS",
  "DB_IDLE_TIMEOUT",
  "DB_CONNECTION_TIMEOUT",
  "DB_STATEMENT_TIMEOUT_MS",
  "NODE_ENV",
] as const;

/** A configuration that is valid in every respect, as the baseline to perturb. */
const GOOD_ENV: Record<string, string> = {
  DATABASE_URL: "postgresql://u:p@pgbouncer.railway.internal:6432/railway?sslmode=disable",
  DB_POOLER_MODE: "session",
};

/** Apply `overrides` on top of GOOD_ENV and re-import the config-reading modules. */
function withEnv(overrides: Record<string, string | undefined>) {
  jest.resetModules();
  mockPools.length = 0;
  for (const key of DB_ENV_KEYS) delete process.env[key];
  for (const [k, v] of Object.entries({ ...GOOD_ENV, ...overrides })) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require("@/lib/database/rawPool") as {
    initializeDatabase: () => unknown;
  };
}

describe("validateDatabaseConfig is wired into initializeDatabase", () => {
  const saved: Record<string, string | undefined> = {};

  beforeAll(() => {
    for (const key of DB_ENV_KEYS) saved[key] = process.env[key];
  });

  afterEach(() => {
    for (const key of DB_ENV_KEYS) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
    jest.resetModules();
  });

  it("builds the pool when the configuration is valid", () => {
    const { initializeDatabase } = withEnv({});
    expect(() => initializeDatabase()).not.toThrow();
    expect(mockPools).toHaveLength(1);
  });

  it("refuses to build a pool from an invalid configuration", () => {
    const { initializeDatabase } = withEnv({ DB_POOLER_MODE: "sesion" });
    expect(() => initializeDatabase()).toThrow(/DB_POOLER_MODE/);
    // The load-bearing half: it must throw BEFORE `new Pool()`, or the bad
    // config is already live and the throw is only cosmetic.
    expect(mockPools).toHaveLength(0);
  });

  it("names every offending value in one error, not just the first", () => {
    // Order is the validator's, not the caller's, so assert on membership: a
    // deploy blocked by two bad variables should not need two round trips.
    const { initializeDatabase } = withEnv({
      DB_POOLER_MODE: "nope",
      DB_MAX_CONNECTIONS: "500",
    });
    expect(() => initializeDatabase()).toThrow(/DB_POOLER_MODE/);
    expect(() => initializeDatabase()).toThrow(/DB_MAX_CONNECTIONS/);
  });
});

describe("connection URL scheme", () => {
  const savedUrl = process.env.DATABASE_URL;
  const savedMode = process.env.DB_POOLER_MODE;

  afterEach(() => {
    if (savedUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = savedUrl;
    if (savedMode === undefined) delete process.env.DB_POOLER_MODE;
    else process.env.DB_POOLER_MODE = savedMode;
    jest.resetModules();
  });

  // `postgres://` is the regression that motivated the fix: Railway, Neon,
  // Supabase and Heroku hand out this spelling, and the old check rejected it.
  it.each([
    ["postgresql://u:p@h:5432/d", true],
    ["postgres://u:p@h:5432/d", true],
    ["mysql://u:p@h:3306/d", false],
    ["not a url at all", false],
  ])("accepts %s: %s", (url, shouldBeValid) => {
    const { initializeDatabase } = withEnv({ DATABASE_URL: url });
    if (shouldBeValid) {
      expect(() => initializeDatabase()).not.toThrow();
    } else {
      expect(() => initializeDatabase()).toThrow(/DATABASE_URL/);
    }
  });
});

describe("malformed numeric knobs", () => {
  afterEach(() => {
    for (const key of DB_ENV_KEYS) delete process.env[key];
    jest.resetModules();
  });

  // Each of these used to resolve to NaN (or to a plausible partial parse) and
  // sail through validation into `new Pool()`.
  it.each([
    ["DB_MAX_CONNECTIONS", "abc"],
    ["DB_MAX_CONNECTIONS", "5s"],
    ["DB_MAX_CONNECTIONS", "5.5"],
    ["DB_IDLE_TIMEOUT", "ten thousand"],
    ["DB_CONNECTION_TIMEOUT", "5_000"],
    ["DB_STATEMENT_TIMEOUT_MS", "5s"],
  ])("rejects %s=%s", (key, value) => {
    const { initializeDatabase } = withEnv({ [key]: value });
    expect(() => initializeDatabase()).toThrow(new RegExp(key));
  });

  it("still accepts every knob at its documented default", () => {
    const { initializeDatabase } = withEnv({
      DB_MAX_CONNECTIONS: undefined,
      DB_IDLE_TIMEOUT: undefined,
      DB_CONNECTION_TIMEOUT: undefined,
      DB_STATEMENT_TIMEOUT_MS: undefined,
    });
    expect(() => initializeDatabase()).not.toThrow();
  });

  it("treats an empty string as unset rather than as zero", () => {
    // Vercel and Railway both surface a cleared variable as "", and `Number("")`
    // is 0 — which would fail the range check on a variable nobody had set.
    const { initializeDatabase } = withEnv({ DB_MAX_CONNECTIONS: "" });
    expect(() => initializeDatabase()).not.toThrow();
  });
});

describe("the summary logged before validation", () => {
  afterEach(() => {
    for (const key of DB_ENV_KEYS) delete process.env[key];
    jest.resetModules();
  });

  it("reports the resolved topology and carries no credentials", () => {
    const { initializeDatabase } = withEnv({});
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { _logger } = require("@/lib/logger");
    initializeDatabase();

    const call = (_logger.info as jest.Mock).mock.calls.find(
      ([msg]: [string]) => msg === "Database configuration resolved",
    );
    expect(call).toBeDefined();
    const summary = call[1] as Record<string, unknown>;
    expect(summary.poolerMode).toBe("session");
    expect(summary.hasDatabaseUrl).toBe(true);

    // The URL holds the password, so nothing derived from it may be serialised.
    expect(JSON.stringify(summary)).not.toMatch(/u:p@|railway\.internal|:p\b/);
  });

  it("is emitted even when validation then rejects the config", () => {
    // Otherwise a refused deployment leaves no record of WHAT was refused
    // beyond the exception, and the resolved values stay unobservable.
    const { initializeDatabase } = withEnv({ DB_POOLER_MODE: "sesion" });
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { _logger } = require("@/lib/logger");
    expect(() => initializeDatabase()).toThrow();

    expect(_logger.info).toHaveBeenCalledWith(
      "Database configuration resolved",
      expect.objectContaining({ poolerMode: "sesion" }),
    );
  });
});
