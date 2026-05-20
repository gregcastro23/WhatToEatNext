# Scheduled Jobs (Railway Cron)

This file is the source of truth for periodic jobs that run against the
production Railway Postgres database.

Crons are configured as separate Railway services on the same project, each
pointed at this repository. Railway runs the service on its `Cron Schedule`,
the container exits cleanly, and the next run is scheduled.

## Active jobs

| Job | Script | Schedule (UTC) | Owner |
| --- | --- | --- | --- |
| `device-sessions-cleanup` | `bun scripts/cleanup-device-sessions.ts` | `15 3 * * *` (daily 03:15) | platform |

## `device-sessions-cleanup`

Deletes rows from `device_sessions` that can no longer be revoked through
the UI (their JWT has already expired) and prunes revoked rows after a
short grace period. Background:
[ADR-004](../adr/004-device-sessions.md).

**What it deletes**

- `last_seen_at < NOW() - INTERVAL '30 days'` — the JWT `maxAge` in
  [src/lib/auth/auth.config.ts](../../src/lib/auth/auth.config.ts) is 30
  days, so any row older than that cannot correspond to a usable token.
- `revoked_at IS NOT NULL AND revoked_at < NOW() - INTERVAL '7 days'` —
  keeps recently-revoked rows around long enough for the
  `/profile/security` UI to show a "revoked X minutes ago" badge, then
  prunes.

Both windows are overridable via env vars (`DEVICE_SESSIONS_MAX_AGE_DAYS`,
`DEVICE_SESSIONS_REVOKED_TTL_DAYS`) — keep them in sync with the JWT
`maxAge` if it changes.

**Required env vars**

- `DATABASE_URL` — same Railway Postgres URL the web app uses
  (`postgres.railway.internal:5432/railway`).

**Optional env vars**

- `DEVICE_SESSIONS_MAX_AGE_DAYS` (default `30`) — must match JWT maxAge.
- `DEVICE_SESSIONS_REVOKED_TTL_DAYS` (default `7`).
- `DRY_RUN=1` — log counts without deleting (useful for first deploy).

### Setting it up on Railway

1. In the Railway dashboard, open the `whattoeatnext` project.
2. **New → GitHub Repo** → pick this repo, branch `master`.
3. Name the service `device-sessions-cleanup`.
4. **Settings → Build**
   - Builder: `Nixpacks` (auto-detects Bun via `package.json`'s
     `packageManager` pin).
   - Watch paths: `scripts/cleanup-device-sessions.ts`, `package.json`,
     `bun.lock` — anything else should not redeploy this service.
5. **Settings → Deploy**
   - Start command: `bun run cleanup:device-sessions`
   - Cron Schedule: `15 3 * * *` (daily at 03:15 UTC — off-peak, after
     the daily nat-chart batch).
   - Restart policy: `Never` (cron services should exit cleanly).
   - Replicas: `1`.
6. **Variables**
   - `DATABASE_URL` → reference the same value as the web service:
     `${{Postgres.DATABASE_URL}}`.

Verify with a manual trigger from the dashboard (**Deployments → Run
once**) and check the logs for the `[cleanup-device-sessions] deleted`
line.

### Local dry-run

```bash
DRY_RUN=1 DATABASE_URL='<railway dev DB url>' bun run cleanup:device-sessions
```

The script reports counts of stale and revoked rows it would delete and
exits without writing.

## Adding a new cron

1. Add a script under `scripts/` that connects via `DATABASE_URL`, does
   its work, logs counts, and exits with code 0 on success / non-zero on
   failure. Follow the pattern in
   [scripts/cleanup-device-sessions.ts](../../scripts/cleanup-device-sessions.ts).
2. Add an npm-script alias in `package.json`.
3. Configure a new Railway service following the steps above.
4. Add a row to the **Active jobs** table here.
