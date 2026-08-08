/**
 * @jest-environment node
 *
 * The check that watches the connection ceiling nobody is watching.
 *
 * Production moved onto PgBouncer, which capped Postgres backends at exactly 20
 * (`default_pool_size`) — so `max_connections = 100`, the number everyone used
 * to watch, is now permanently and misleadingly healthy. The real wall is
 * PgBouncer's `max_client_conn` (120), past which it REFUSES new client
 * connections. The queueing signal that precedes it lives only inside the
 * pooler; `pg_stat_activity` cannot see it at all.
 */

import {
  classifyPoolerSaturation,
  aggregatePools,
  resolveAdminDsn,
  MAXWAIT_INCIDENT_SECONDS,
  type PoolerSaturationSignals,
} from "@/services/poolerSaturationHealth";

const healthy: PoolerSaturationSignals = {
  clientsActive: 2,
  clientsWaiting: 0,
  serversActive: 1,
  maxWaitSeconds: 0,
  maxClientConn: 120,
  poolSize: 20,
  live: true,
};

describe("classifyPoolerSaturation", () => {
  it("reports OK with headroom", () => {
    const r = classifyPoolerSaturation(healthy);
    expect(r.verdict).toBe("OK");
    expect(r.summary).toMatch(/2\/120 clients/);
  });

  it("raises INCIDENT as the client ceiling approaches", () => {
    // Past max_client_conn PgBouncer refuses connections outright — the app
    // sees connection errors, not slow queries, so this must fire BEFORE it.
    const r = classifyPoolerSaturation({ ...healthy, clientsActive: 108 });
    expect(r.verdict).toBe("INCIDENT");
    expect(r.summary).toMatch(/refuses/);
  });

  it("goes DEGRADED while filling up, before the ceiling", () => {
    const r = classifyPoolerSaturation({ ...healthy, clientsActive: 84 });
    expect(r.verdict).toBe("DEGRADED");
    expect(r.clientUtilisation).toBeCloseTo(0.7, 5);
  });

  it("raises INCIDENT when clients starve waiting for a server connection", () => {
    // All 20 servers busy and clients queued for 5s+: throughput has collapsed
    // even though the client count is nowhere near the ceiling.
    const r = classifyPoolerSaturation({
      ...healthy, clientsActive: 20, clientsWaiting: 8,
      serversActive: 20, maxWaitSeconds: MAXWAIT_INCIDENT_SECONDS,
    });
    expect(r.verdict).toBe("INCIDENT");
    expect(r.summary).toMatch(/queued/);
  });

  describe("a momentary queue is not an incident", () => {
    it("stays OK when clients are waiting but nobody has waited yet", () => {
      // cl_waiting flickers above zero under perfectly healthy burst load.
      // Alarming on it alone is how a saturation check becomes noise nobody
      // reads — the same failure the debit-path detector had to design around.
      const r = classifyPoolerSaturation({
        ...healthy, clientsWaiting: 4, serversActive: 20, maxWaitSeconds: 0,
      });
      expect(r.verdict).toBe("OK");
    });

    it("goes DEGRADED once the wait persists a full second", () => {
      const r = classifyPoolerSaturation({
        ...healthy, clientsWaiting: 4, serversActive: 20, maxWaitSeconds: 1,
      });
      expect(r.verdict).toBe("DEGRADED");
    });
  });

  it("reports UNKNOWN rather than green when there is no source", () => {
    const r = classifyPoolerSaturation({ ...healthy, live: false });
    expect(r.verdict).toBe("UNKNOWN");
    expect(r.summary).toMatch(/No source/);
  });

  it("does not divide by zero when max_client_conn is unlimited", () => {
    // PgBouncer reports 0 for "unlimited"; dividing by it would give Infinity
    // and pin the panel to a permanent false INCIDENT.
    const r = classifyPoolerSaturation({ ...healthy, clientsActive: 500, maxClientConn: 0 });
    expect(r.clientUtilisation).toBe(0);
    expect(r.verdict).toBe("OK");
  });
});

describe("aggregatePools", () => {
  // Captured verbatim from the live Railway pooler — including the columns that
  // do NOT exist, which is the point of using a real fixture.
  const LIVE_ROWS = [
    {
      database: "pgbouncer", user: "pgbouncer", cl_active: 1, cl_waiting: 0,
      sv_active: 0, sv_idle: 0, maxwait: 0, maxwait_us: 0, pool_mode: "statement",
    },
    {
      database: "railway", user: "postgres", cl_active: 1, cl_waiting: 0,
      sv_active: 1, sv_idle: 0, sv_used: 3, maxwait: 0, maxwait_us: 0, pool_mode: "session",
    },
  ];

  it("excludes the admin pool so the probe does not count itself", () => {
    // The connection running SHOW POOLS appears in the `pgbouncer` pool. Counting
    // it would mean the check always observes at least one client of its own.
    const agg = aggregatePools(LIVE_ROWS);
    expect(agg.clientsActive).toBe(1); // the railway pool only, not 2
  });

  it("sums across application pools and takes the worst wait", () => {
    const agg = aggregatePools([
      { database: "railway", cl_active: 3, cl_waiting: 1, sv_active: 4, maxwait: 2 },
      { database: "railway", cl_active: 5, cl_waiting: 2, sv_active: 6, maxwait: 9 },
    ]);
    expect(agg.clientsActive).toBe(8);
    expect(agg.clientsWaiting).toBe(3);
    expect(agg.serversActive).toBe(10);
    expect(agg.maxWaitSeconds).toBe(9); // worst, not sum
  });

  it("never reports pool_size from SHOW POOLS, which does not have it", () => {
    // SHOW POOLS carries no pool_size column (that is SHOW DATABASES). Reading
    // it here would silently yield 0 and make the servers-busy denominator a
    // lie. It comes from default_pool_size in SHOW CONFIG instead.
    expect(aggregatePools(LIVE_ROWS)).not.toHaveProperty("poolSize");
  });

  it("survives string-valued counters", () => {
    const agg = aggregatePools([
      { database: "railway", cl_active: "7", cl_waiting: "2", sv_active: "3", maxwait: "4" },
    ]);
    expect(agg.clientsActive).toBe(7);
    expect(agg.maxWaitSeconds).toBe(4);
  });
});

describe("resolveAdminDsn", () => {
  const URL_POOLED = "postgresql://postgres:sec%40ret@pgbouncer.railway.internal:6432/railway?sslmode=disable";

  it("points at the pgbouncer virtual database, not the app database", () => {
    const dsn = resolveAdminDsn(URL_POOLED, "session");
    expect(dsn?.database).toBe("pgbouncer");
    expect(dsn?.host).toBe("pgbouncer.railway.internal");
    expect(dsn?.port).toBe(6432);
  });

  it("honours sslmode=disable — PgBouncer refuses TLS", () => {
    // Forcing TLS here would fail every probe and report a permanent UNKNOWN,
    // which is exactly how the pooler flip failed the first time.
    expect(resolveAdminDsn(URL_POOLED, "session")?.ssl).toBe(false);
  });

  it("decodes percent-escapes in the password", () => {
    expect(resolveAdminDsn(URL_POOLED, "session")?.password).toBe("sec@ret");
  });

  it("returns null in a direct topology — there is no pooler to ask", () => {
    // Otherwise every poll logs a confusing connection error against a database
    // that does not exist.
    expect(resolveAdminDsn(URL_POOLED, "direct")).toBeNull();
  });

  it("returns null rather than throwing on an unparseable URL", () => {
    expect(resolveAdminDsn("not-a-url", "session")).toBeNull();
  });
});
