# ADR-007: Serverless Database Connection Pooling (PgBouncer Transaction Mode)

**Status**: Accepted
**Date**: 2026-05-28
**Deciders**: Greg Castro

---

## Context

The Next.js app runs on Vercel serverless functions. Each function instance
owns its own `pg` pool (`src/lib/database/config.ts`, `max: 5`). Under cold
starts and cron storms, many instances each tried to open up to 5 connections
directly against Railway Postgres. Postgres ran out of backend connection
slots, so `pool.connect()` blocked — surfacing as multi-minute "queries" on
trivial SELECTs (the SQL never started; the instance was stuck waiting for a
connection).

Mitigations already in place were band-aids over this root cause:

- a per-statement `statement_timeout` (Postgres cancels at 5s, code 57014);
- a client-side `query_timeout` (aborts the client read);
- a throttle on the per-slow-query `system_metrics` write so bursts can't
  self-amplify pool pressure.

A **PgBouncer** service already existed in the Railway project, but it was
configured with `PGBOUNCER_POOL_MODE=session`. Session pooling pins one backend
Postgres connection for a client's entire session — so fronting short-lived
serverless connections with it gives **almost no fan-in benefit**: a serverless
instance still effectively holds a backend connection for its lifetime.

The pooling mode that actually solves serverless connection storms is
**transaction pooling**: many short client connections are multiplexed onto a
small set of server connections, each borrowed only for the duration of a
transaction.

### The statement_timeout / transaction-pooling interaction

`node-postgres` sends `statement_timeout` as a **connection startup
parameter** (`client.js` `getStartupConf`). PgBouncer in transaction mode
**rejects** startup parameters that aren't allow-listed, and even when they are
ignored they have no effect, because server connections are shared across
clients. `query_timeout`, by contrast, is purely client-side — it aborts the
client's read but does **not** cancel the backend query, so it cannot be the
only cap (a runaway query keeps consuming a server connection after the client
gives up).

So under transaction pooling we must deliver the server-side statement cap by a
different route than the startup packet.

## Decision

1. **Front the serverless app with PgBouncer in `transaction` mode**, and point
   the app's `DATABASE_URL` at PgBouncer (not directly at Postgres).
   - Vercel (external): the PgBouncer public TCP proxy.
   - Railway-internal services: `pgbouncer.railway.internal:6432`.

2. **Make the connection layer pooler-aware** via a new `DB_POOLER_MODE`
   env var (`direct` | `session` | `transaction`, default `direct`). The flag
   is read in `src/lib/database/config.ts` and applied in
   `getDatabaseConfig()`/`withTransaction()` in `connection.ts`. With the
   default (`direct`), **behavior is unchanged** — this is a safe no-op until
   the env is flipped.

3. **Deliver the server-side statement cap without the startup param** when
   `DB_POOLER_MODE=transaction`:
   - **Omit** `statement_timeout` from the `pg` config (so PgBouncer won't
     reject the connection).
   - Keep the client-side `query_timeout` as the request-level bound.
   - Inside `withTransaction`, issue `SET LOCAL statement_timeout` — scoped to
     the transaction, safe on shared server connections — so transactional
     writes keep a real server-side cap.
   - For single (non-transactional) `pool.query` calls, the server-side cap
     comes from a **PgBouncer `connect_query`** that runs once per server
     connection: `connect_query = 'SET statement_timeout = 5000'`. Because every
     query through PgBouncer wants the same cap, applying it per server
     connection is correct and consistent.

4. **Keep the per-instance `pg` pool small** (`max: 5`). With transaction
   pooling, per-instance sizing barely matters — PgBouncer's `default_pool_size`
   (currently 20) governs real backend concurrency, and `max_client_conn`
   (currently 120) bounds total client connections.

## Consequences

- Many short serverless connections now fan into ~20 backend Postgres
  connections; cold-start / cron storms no longer exhaust Postgres.
- **Session-level features are unavailable** through the pooler: no
  `SET` that must persist across statements (use `SET LOCAL` in a transaction),
  no session advisory locks, no `LISTEN/NOTIFY`, no server-side prepared
  statements by name. The app uses `pg` parameterized queries (unnamed extended
  protocol), which are transaction-mode safe.
- The server-side statement cap now has three delivery points instead of one
  (PgBouncer `connect_query`, `SET LOCAL` in `withTransaction`, client-side
  `query_timeout`). Documented here so the redundancy is intentional, not
  accidental.
- A future dedicated low-privilege application role (instead of connecting as
  `postgres`) would let us set `statement_timeout` at the role level and drop
  the `connect_query`; deferred (requires a new credential + repoint).

## Rollout / runbook

Order matters — keep a statement cap in force at every step.

1. **Land the code** (this ADR's change). With `DB_POOLER_MODE` unset, nothing
   changes in production yet.
2. **Configure PgBouncer** (Railway → PgBouncer service):
   - `PGBOUNCER_POOL_MODE=transaction`
   - add a `connect_query = 'SET statement_timeout = 5000'`
     (via the image's config/env; if `connect_query` isn't exposed, set
     `ignore_startup_parameters = statement_timeout` so the client param is
     tolerated, and rely on `SET LOCAL` + `query_timeout` until a role-level
     default is added).
   - confirm `default_pool_size` (20) and `max_client_conn` (120) suit expected
     Vercel concurrency; raise `max_client_conn` if instances spike.
3. **Repoint `DATABASE_URL`** at PgBouncer and set `DB_POOLER_MODE=transaction`:
   - Vercel env (Next.js app): PgBouncer **public** proxy host/port.
   - Railway-internal services: `pgbouncer.railway.internal:6432`.
   - Redeploy so the new env takes effect.
4. **Verify**:
   - app boots, `checkDatabaseHealth()` is green;
   - a write path that uses `withTransaction` succeeds (the `SET LOCAL` runs);
   - induce a slow query and confirm it's cancelled around 5s (57014);
   - watch Postgres backend connection count stays near `default_pool_size`,
     not spiking with Vercel instance count.
5. **Rollback**: set `DB_POOLER_MODE=direct` and point `DATABASE_URL` back at
   Postgres directly; redeploy. The code's default path returns automatically.

### Migrations / DDL note

Schema migrations and `CREATE INDEX CONCURRENTLY` must **bypass PgBouncer** and
run **directly against Postgres** (CONCURRENTLY cannot run inside a transaction,
which transaction pooling would impose). Use the Postgres direct connection
(public TCP proxy or `postgres.railway.internal:5432`) for `database/init/*.sql`.
