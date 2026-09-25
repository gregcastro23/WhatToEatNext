/**
 * @jest-environment node
 *
 * Does the pool actually apply the floor, and does it get there FIRST?
 *
 * resolvePooledStatementTimeoutSql being correct proves nothing on its own —
 * the floor is only real if the pool issues it, and only useful if it reaches
 * Postgres ahead of the consumer's first query. It is delivered through
 * pg-pool's awaited `onConnect` option; if pg-pool ignored that key (a typo,
 * or an older pg-pool) the SET would silently never run — a hole no assertion
 * on the helper, or on the config object, could catch.
 *
 * These drive the real initializeDatabase() against a fake pg, so the wiring
 * itself is under test rather than a restatement of it. The "real pg-pool"
 * block then hands the hook it built to the installed pg-pool, so the contract
 * with the library is under test too.
 */

import { EventEmitter } from "events";

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

/** Build the pool with a given pooler mode and return it plus its onConnect hook. */
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
  return {
    pool,
    onConnect: pool.config.onConnect as ((client: unknown) => Promise<void>) | undefined,
  };
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

  it("configures onConnect hook to issue the SET on every new connection when pooled", async () => {
    const { onConnect } = buildPool("session");
    const client = fakeClient();

    expect(onConnect).toBeDefined();
    await onConnect!(client);

    expect(client.query).toHaveBeenCalledWith("SET statement_timeout = 5000");
  });

  it("does not configure onConnect in direct mode — the startup packet carries it", () => {
    const { pool, onConnect } = buildPool("direct");
    expect(onConnect).toBeUndefined();
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

  it("rejects when SET fails so pg-pool can cleanly terminate and purge the bad client", async () => {
    const { onConnect } = buildPool("session");
    const client = {
      query: jest.fn(() => Promise.reject(new Error("connection terminated"))),
    };

    expect(onConnect).toBeDefined();
    await expect(onConnect!(client)).rejects.toThrow("connection terminated");
    // The caller only sees the driver error, so the hook names the cause.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { _logger } = require("@/lib/logger");
    expect(_logger.error).toHaveBeenCalledWith(
      "Failed to apply pooled statement_timeout",
      expect.objectContaining({ error: "connection terminated", statement: "SET statement_timeout = 5000" }),
    );
  });
});

/**
 * A stand-in for pg.Client with just the surface pg-pool touches. Its SET
 * takes a few ms, like a real round trip, so a hook that did not await it
 * would hand the client over while it was still running.
 */
const events: string[] = [];

class FakePgClient extends EventEmitter {
  static failSet = false;
  ended = false;
  release?: () => void;
  connect(cb: (err: Error | null) => void): void {
    setImmediate(() => cb(null));
  }
  query(sql: string): Promise<{ rows: [] }> {
    events.push(`start ${sql}`);
    return new Promise((resolve, reject) =>
      setTimeout(() => {
        if (FakePgClient.failSet) return reject(new Error("SET refused"));
        events.push(`done ${sql}`);
        resolve({ rows: [] });
      }, 10),
    );
  }
  end(cb?: () => void): void {
    this.ended = true;
    events.push("end");
    cb?.();
  }
  ref(): void {}
  unref(): void {}
}

describe("pooled statement_timeout against the real pg-pool", () => {
  type RealPool = {
    connect(): Promise<FakePgClient>;
    end(): Promise<void>;
    totalCount: number;
    on(event: string, cb: (...args: unknown[]) => void): void;
  };
  const RealPool = jest.requireActual("pg-pool") as new (options: Record<string, unknown>) => RealPool;

  function realPoolWithOurHook(): RealPool {
    const onConnect = buildPool("session").onConnect;
    expect(onConnect).toBeDefined();
    const pool = new RealPool({ Client: FakePgClient, max: 1, onConnect });
    pool.on("connect", () => events.push("connect event"));
    return pool;
  }

  const savedEnv = { ...process.env };
  afterEach(() => {
    for (const k of ["DB_POOLER_MODE", "DATABASE_URL", "DB_STATEMENT_TIMEOUT_MS"]) {
      if (savedEnv[k] === undefined) delete process.env[k];
      else process.env[k] = savedEnv[k];
    }
    jest.resetModules();
  });

  beforeEach(() => {
    events.length = 0;
    FakePgClient.failSet = false;
    process.env.DATABASE_URL = "postgresql://u:p@pgbouncer.railway.internal:6432/railway?sslmode=disable";
    process.env.DB_STATEMENT_TIMEOUT_MS = "5000";
  });

  it("finishes the SET before the checkout gets the client", async () => {
    const pool = realPoolWithOurHook();
    const client = await pool.connect();
    events.push("checked out");

    expect(events).toEqual([
      "start SET statement_timeout = 5000",
      "done SET statement_timeout = 5000",
      "connect event",
      "checked out",
    ]);
    client.release?.();
    await pool.end();
  });

  it("drops the client and fails the checkout when the SET fails", async () => {
    FakePgClient.failSet = true;
    const pool = realPoolWithOurHook();

    await expect(pool.connect()).rejects.toThrow("SET refused");
    expect(events).toEqual(["start SET statement_timeout = 5000", "end"]);
    expect(pool.totalCount).toBe(0);
    await pool.end();
  });
});
