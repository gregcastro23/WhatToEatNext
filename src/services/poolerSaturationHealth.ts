/**
 * PgBouncer saturation for the Database flow.
 *
 * WHY THIS EXISTS
 * ---------------
 * The connection ceiling moved when production flipped onto PgBouncer, and
 * nothing watches the new one. Postgres backends are now capped at exactly 20 by
 * `default_pool_size`, comfortably under `max_connections = 100` — so the metric
 * everyone used to watch is permanently, misleadingly healthy. The wall is now
 * PgBouncer's own `max_client_conn` (120): past it, PgBouncer REFUSES new client
 * connections outright, and the app sees connection errors rather than slow
 * queries.
 *
 * WHY IT NEEDS THE ADMIN CONSOLE
 * ------------------------------
 * The load-bearing signal is `cl_waiting` / `maxwait` — clients queued waiting
 * for one of the 20 server connections. That exists only inside PgBouncer.
 * `pg_stat_activity` cannot see it: from Postgres's side a saturated pooler and
 * an idle one look identical, because both show at most 20 backends. Railway's
 * service metrics cannot see it either.
 *
 * So this opens a short-lived connection to the pooler's own `pgbouncer` admin
 * database. When that is not possible — direct topology, no admin rights, pooler
 * unreachable — it reports `live: false` rather than inventing a verdict, per
 * the admin-surface rule that a panel must degrade to an honest "no source".
 */

import pkg from "pg";
import { databaseConfig, resolveSslOption } from "@/lib/database/config";
import { _logger } from "@/lib/logger";

const { Client } = pkg as unknown as { Client: new (config: unknown) => any };

/** OK = headroom · DEGRADED = queueing or filling up · INCIDENT = refusals imminent or clients starving. */
export type PoolerVerdict = "OK" | "DEGRADED" | "INCIDENT" | "UNKNOWN";

export interface PoolerSaturationSignals {
  /** Client connections currently attached to a server connection. */
  clientsActive: number;
  /** Clients queued waiting for a server connection — invisible from Postgres. */
  clientsWaiting: number;
  /** Server connections in use, bounded by default_pool_size. */
  serversActive: number;
  /** Seconds the longest-waiting client has been queued. 0 when nobody waits. */
  maxWaitSeconds: number;
  /** Hard ceiling: past this PgBouncer refuses new client connections. */
  maxClientConn: number;
  /** Server connections available per (database, user) pair. */
  poolSize: number;
  /** False when there is no source — never fabricate a verdict from missing data. */
  live: boolean;
}

export interface PoolerSaturationHealth {
  verdict: PoolerVerdict;
  summary: string;
  /** Clients in use as a fraction of max_client_conn, 0-1. */
  clientUtilisation: number;
}

/**
 * Queueing is normal in a burst; queueing that LASTS is starvation. maxwait is
 * therefore the discriminator rather than cl_waiting, which flickers above zero
 * under perfectly healthy load and would make this alarm cry wolf — the same
 * mistake the debit-path detector had to design around.
 */
export const MAXWAIT_DEGRADED_SECONDS = 1;
export const MAXWAIT_INCIDENT_SECONDS = 5;
export const CLIENT_UTILISATION_DEGRADED = 0.7;
export const CLIENT_UTILISATION_INCIDENT = 0.9;

/** Pure classifier. Free of database imports so it can be tested directly. */
export function classifyPoolerSaturation(
  signals: PoolerSaturationSignals,
): PoolerSaturationHealth {
  const {
    clientsActive, clientsWaiting, serversActive,
    maxWaitSeconds, maxClientConn, poolSize, live,
  } = signals;

  if (!live) {
    return {
      verdict: "UNKNOWN",
      summary: "No source — PgBouncer admin console unreachable",
      clientUtilisation: 0,
    };
  }

  const clients = clientsActive + clientsWaiting;
  // Guard the divisor: a pooler reporting max_client_conn = 0 means unlimited,
  // and dividing by it would produce Infinity and a permanent false INCIDENT.
  const utilisation = maxClientConn > 0 ? clients / maxClientConn : 0;

  if (utilisation >= CLIENT_UTILISATION_INCIDENT) {
    return {
      verdict: "INCIDENT",
      summary:
        `${clients}/${maxClientConn} client connections — PgBouncer refuses ` +
        `new connections at the ceiling`,
      clientUtilisation: utilisation,
    };
  }
  if (maxWaitSeconds >= MAXWAIT_INCIDENT_SECONDS) {
    return {
      verdict: "INCIDENT",
      summary:
        `${clientsWaiting} clients queued, longest waiting ${maxWaitSeconds}s ` +
        `for one of ${poolSize} server connections`,
      clientUtilisation: utilisation,
    };
  }
  if (utilisation >= CLIENT_UTILISATION_DEGRADED) {
    return {
      verdict: "DEGRADED",
      summary: `${clients}/${maxClientConn} client connections — approaching the ceiling`,
      clientUtilisation: utilisation,
    };
  }
  if (clientsWaiting > 0 && maxWaitSeconds >= MAXWAIT_DEGRADED_SECONDS) {
    return {
      verdict: "DEGRADED",
      summary: `${clientsWaiting} clients queued ${maxWaitSeconds}s for a server connection`,
      clientUtilisation: utilisation,
    };
  }

  return {
    verdict: "OK",
    summary: `${clients}/${maxClientConn} clients · ${serversActive}/${poolSize} servers busy`,
    clientUtilisation: utilisation,
  };
}

/**
 * The pooler's admin DSN: the app's own connection string, pointed at the
 * `pgbouncer` virtual database instead of the application one.
 *
 * Returns null in a direct topology — there is no pooler to ask, and probing
 * would just log a confusing connection error every poll.
 */
export function resolveAdminDsn(
  databaseUrl: string,
  poolerMode: string,
): { host: string; port: number; user: string; password: string; database: string; ssl: false | { rejectUnauthorized: boolean } } | null {
  if (poolerMode === "direct") return null;
  try {
    const url = new URL(databaseUrl);
    return {
      host: url.hostname,
      port: parseInt(url.port, 10) || 6432,
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      // PgBouncer's own admin console lives in a virtual database of this name.
      database: "pgbouncer",
      // Reuse the app's TLS decision: PgBouncer refuses TLS, and the URL says so
      // with ?sslmode=disable. Forcing TLS here would fail every probe.
      ssl: resolveSslOption(url),
    };
  } catch {
    return null;
  }
}

/**
 * Sum the per-pool rows PgBouncer reports, ignoring its own admin pool.
 *
 * Note `pool_size` is deliberately NOT read here: `SHOW POOLS` does not carry
 * it (that column belongs to `SHOW DATABASES`), so reading it would silently
 * yield 0 and make the "servers busy" denominator a lie. It comes from
 * `default_pool_size` in `SHOW CONFIG` instead.
 */
export function aggregatePools(
  rows: Array<Record<string, unknown>>,
): Pick<PoolerSaturationSignals, "clientsActive" | "clientsWaiting" | "serversActive" | "maxWaitSeconds"> {
  const n = (v: unknown) => {
    const parsed = typeof v === "number" ? v : parseInt(String(v ?? 0), 10);
    return Number.isFinite(parsed) ? parsed : 0;
  };
  // The `pgbouncer` pool is the admin console itself — including it would count
  // this very probe as application load.
  const app = rows.filter((r) => String(r.database) !== "pgbouncer");
  return {
    clientsActive: app.reduce((s, r) => s + n(r.cl_active), 0),
    clientsWaiting: app.reduce((s, r) => s + n(r.cl_waiting), 0),
    serversActive: app.reduce((s, r) => s + n(r.sv_active), 0),
    maxWaitSeconds: app.reduce((m, r) => Math.max(m, n(r.maxwait)), 0),
  };
}

const UNAVAILABLE: PoolerSaturationSignals = {
  clientsActive: 0, clientsWaiting: 0, serversActive: 0,
  maxWaitSeconds: 0, maxClientConn: 0, poolSize: 0, live: false,
};

/**
 * Reads SHOW POOLS + SHOW CONFIG from the pooler. Degrades to `live: false`
 * rather than throwing, so the Database flow reports an honest "no source".
 */
export async function fetchPoolerSaturationSignals(): Promise<PoolerSaturationSignals> {
  const dsn = resolveAdminDsn(databaseConfig.databaseUrl, databaseConfig.poolerMode);
  if (!dsn) return UNAVAILABLE;

  // Short fuses on purpose: the admin database has a pool_size of 2, and this
  // is a health probe. It must never become the thing that holds a slot.
  const client = new Client({ ...dsn, connectionTimeoutMillis: 2000, query_timeout: 2000 });
  try {
    await client.connect();
    const pools = await client.query("SHOW POOLS");
    const config = await client.query("SHOW CONFIG");

    const setting = (key: string) =>
      parseInt(
        (config.rows as Array<{ key: string; value: string }>).find((r) => r.key === key)?.value ??
          "0",
        10,
      ) || 0;

    return {
      ...aggregatePools(pools.rows as Array<Record<string, unknown>>),
      maxClientConn: setting("max_client_conn"),
      poolSize: setting("default_pool_size"),
      live: true,
    };
  } catch (err) {
    _logger.warn("[systemStatus] PgBouncer saturation probe failed:", err);
    return UNAVAILABLE;
  } finally {
    await client.end().catch(() => undefined);
  }
}
