/**
 * @jest-environment node
 *
 * Does the pool actually apply the floor, and does it get there FIRST?
 *
 * resolvePooledStatementTimeoutSql being correct proves nothing on its own —
 * the floor is only real if the pool issues it, and only useful if it reaches
 * Postgres ahead of the consumer's first query. If the SET were awaited (or
 * scheduled on a later tick) the consumer's statement would be queued first and
 * the first query on every new connection would run uncapped — a silent hole
 * that no assertion on the helper could ever catch.
 *
 * These drive the real initializeDatabase() against a fake pg, so the wiring
 * itself is under test rather than a restatement of it.
 */

const mockPools: Array<{
  config: Record<string, unknown>;
  listeners: Record<string, Array<(...args: unknown[]) => void>>;
}> = [];

jest.mock("pg", () => {
  class FakePool {
    config: Record<string, unknown>;
    listeners: Record<string, Array<(...args: unknown[]) => void>> = {};
    constructor(config: Record<string, unknown>) {
      this.config = config;
      mockPools.push(this);
    }
    on(event: string, cb: (...args: unknown[]) => void) {
      (this.listeners[event] ||= []).push(cb);
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

/** A client that records the order in which statements were handed to it. */
function fakeClient() {
  const dispatched: string[] = [];
  return {
    dispatched,
    query: jest.fn((sql: string) => {
      dispatched.push(sql);
      return Promise.resolve({ rows: [] });
    }),
  };
}

/** Build the pool with a given pooler mode and return it plus its connect listener. */
function buildPool(poolerMode: string) {
  jest.resetModules();
  mockPools.length = 0;
  process.env.DB_POOLER_MODE = poolerMode;
  process.env.DATABASE_URL = "postgresql://u:p@pgbouncer.railway.internal:6432/railway?sslmode=disable";
  process.env.DB_STATEMENT_TIMEOUT_MS = "5000";

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { initializeDatabase } = require("@/lib/database/rawPool");
  initializeDatabase();

  const pool = mockPools[0];
  return { pool, onConnect: pool.listeners.connect?.[0] };
}

describe("pooled statement_timeout wiring", () => {
  const saved = {
    mode: process.env.DB_POOLER_MODE,
    url: process.env.DATABASE_URL,
    ms: process.env.DB_STATEMENT_TIMEOUT_MS,
    nodeEnv: process.env.NODE_ENV,
  };

  afterEach(() => {
    for (const [k, v] of Object.entries({
      DB_POOLER_MODE: saved.mode,
      DATABASE_URL: saved.url,
      DB_STATEMENT_TIMEOUT_MS: saved.ms,
      NODE_ENV: saved.nodeEnv,
    })) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
    jest.resetModules();
  });

  it("issues the SET on every new connection when pooled", () => {
    const { onConnect } = buildPool("session");
    const client = fakeClient();

    expect(onConnect).toBeDefined();
    onConnect!(client);

    expect(client.query).toHaveBeenCalledWith("SET statement_timeout = 5000");
  });

  it("issues the SET SYNCHRONOUSLY, before the consumer can queue a query", () => {
    // The load-bearing property. pg-pool emits "connect" before handing the
    // client to the waiter, so dispatching here — without awaiting — puts the
    // SET at the head of the client's FIFO queue. If this ever became async,
    // the first query on each new connection would run with no floor.
    const { onConnect } = buildPool("session");
    const client = fakeClient();

    onConnect!(client);
    // No `await` between the listener returning and the consumer's query:
    // exactly the window pg-pool leaves open.
    void client.query("SELECT 1 FROM users");

    expect(client.dispatched).toEqual([
      "SET statement_timeout = 5000",
      "SELECT 1 FROM users",
    ]);
  });

  it("does not issue the SET in direct mode — the startup packet carries it", () => {
    const { pool, onConnect } = buildPool("direct");
    const client = fakeClient();
    onConnect!(client);

    expect(client.dispatched).toEqual([]);
    // ...and exactly one of the two mechanisms is active.
    expect(pool.config.statement_timeout).toBe(5000);
  });

  it("omits the startup param when pooled, so the pool can connect at all", () => {
    const { pool } = buildPool("session");
    // PgBouncer refuses unknown startup parameters at login; sending this is
    // what made the pooler unreachable before #732.
    expect(pool.config.statement_timeout).toBeUndefined();
  });

  it("sets the client bound above the server cap so 57014 surfaces", () => {
    const { pool } = buildPool("session");
    expect(pool.config.query_timeout).toBeGreaterThan(5000);
  });

  it("survives a failing SET without rejecting the checkout", async () => {
    // A request served without the floor beats a request that fails outright —
    // but it must be logged, not swallowed.
    const { onConnect } = buildPool("session");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { _logger } = require("@/lib/logger");
    const client = {
      query: jest.fn(() => Promise.reject(new Error("connection terminated"))),
    };

    expect(() => onConnect!(client)).not.toThrow();
    await Promise.resolve();
    await Promise.resolve();

    expect(_logger.error).toHaveBeenCalledWith(
      "Failed to apply pooled statement_timeout",
      expect.objectContaining({ error: "connection terminated" }),
    );
  });
});
