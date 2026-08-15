# Runbook: `daily-digest-cron` (Railway)

The daily auth digest. A Railway cron service that makes exactly one HTTP call:

```
POST https://alchm.kitchen/api/admin/digest?period=daily
Authorization: Bearer $INTERNAL_API_SECRET
```

The Next.js route composes the summary and emails `AUTH_ADMIN_EMAIL`. The cron
container is *only* a caller — it holds no logic worth debugging.

## Incident 2026-08-15: CRASHED, and silently dropping days

**What Railway showed.** The whole deploy log for the crashed run:

```
Starting Container
ERROR: Unable to open log: Permission denied
```

**That second line is not the cause.** The previous day's *successful* run emits
it identically — it is `apk` noise about its own logfile, present on every run.
Do not chase it. There is no traceback because the container is a one-line
shell command and the old flags (`-s`, no `--fail-with-body`) discarded the
response body.

**What actually happened — the request never arrived.** In the 09:00–09:20 UTC
window, Vercel's runtime logs show every other cron hitting the app
(`esms-reconciliation`, the `synthetic-*` family, `environmental-ingest`,
`system-health-snapshot`) and **no `/api/admin/digest` entry at all**. There is
also no runtime-error group for that route. The app never saw the call, so the
failure is inside the cron container, before curl reached the network.

**It was already unreliable.** Railway creates one deployment per run;
deployments exist for Aug 1, 2, 3, 4, 5, 7, 11, 12, 14, 15 — and not for 6, 8,
9, 10, or 13. Five missed days in fifteen, unnoticed, because a cron that never
runs raises nothing.

**And a run hung.** The Aug-14 container was not stopped until
`2026-08-15T09:04:09Z` — it lived ~24h instead of exiting, which is what a
stalled `curl` with no timeout looks like.

### Root cause

The old start command installed its dependency over the network on **every**
execution:

```sh
apk add --no-cache curl >/dev/null && curl -fsS --retry 3 --retry-delay 5 ...
```

An ephemeral container resolving and downloading a package from the Alpine CDN
on each run has a per-run failure probability that is small but not zero — and
`&&` means a failed `apk` skips the request entirely and exits non-zero. That
matches every observed symptom: no HTTP request, no traceback, intermittent
missed days. `>/dev/null` also discarded the one message that would have named
it.

Stated honestly: this is the **leading hypothesis**, not a proven traceback.
The old configuration destroyed the evidence, which is the deeper defect. The
new configuration below preserves it.

## The fix

Bake the dependency into the image and stop hiding failures.

| setting | old | new |
|---|---|---|
| Source image | `alpine:latest` | `curlimages/curl:8.21.0` |
| Start command | `apk add --no-cache curl >/dev/null && curl -fsS …` | see below |

```sh
/bin/sh -c 'exec curl --fail-with-body -sS --retry 3 --retry-delay 5 --connect-timeout 15 --max-time 120 -X POST -H "Authorization: Bearer $INTERNAL_API_SECRET" "https://alchm.kitchen/api/admin/digest?period=daily"'
```

### ⚠️ The shell wrapper is mandatory — do not simplify it away

Railway's start command behaves differently by deploy type
([docs](https://docs.railway.com/deployments/start-command)):

- **Railpack** (what this service used to be): the command runs *in a shell*.
  That is the only reason `$INTERNAL_API_SECRET` and `&&` ever worked.
- **Image** (what it becomes once the source image is set): the command
  **overrides the image's `ENTRYPOINT` in exec form**, and *exec form does not
  expand variables*.

So the obvious-looking version:

```sh
curl --fail-with-body -sS -H "Authorization: Bearer $INTERNAL_API_SECRET" ...   # ✗ BROKEN
```

would send the **literal string** `Bearer $INTERNAL_API_SECRET`, and every run
would fail auth. Wrapping in `/bin/sh -c '…'` restores expansion.
`curlimages/curl` is Alpine-based and ships busybox `sh`, so `/bin/sh` exists.

The wrapper also means the image's `ENTRYPOINT ["curl"]` is replaced rather
than prepended — no doubled `curl`.

### Why each flag

- `--fail-with-body` — still exits non-zero on HTTP ≥400 (so Railway marks the
  run failed) but **prints the response body first**. `-f` alone discards it,
  which is why a 4xx/5xx here has never been diagnosable.
- `-sS` — quiet progress meter, but keep error messages.
- `--connect-timeout 15` / `--max-time 120` — bounds the run. This is the direct
  fix for the ~24h hang; the digest does DB rollups plus a send with up to three
  internal retries, so 120s is generous but finite.
- `--retry 3 --retry-delay 5` — unchanged. Retries transient/5xx only; a 4xx
  fails fast, which is correct.

### Also worth setting

- **Restart policy `NEVER`.** For a cron, `ON_FAILURE` can re-run a job that
  legitimately failed. Verify before changing.
- Keep the schedule as-is; nothing here depends on it.

## Applying it

Two halves, in two places:

1. **Start command** — Railway API/MCP (`update_service`, `start_command`), or
   the dashboard.
2. **Source image** — dashboard (Settings → Source). The API surface used here
   exposes no image field, so this half is manual.

Order matters: set the **image first, then the start command**. Between the two
the service is briefly an Image deploy still carrying the Railpack-era shell
command, which would fail — so do not leave it half-applied across a scheduled
run.

## Verifying the next run

1. `environment_status` → service is `SUCCESS`, not `CRASHED`.
2. Deploy logs contain no `apk` line at all (nothing is installed anymore).
3. Vercel runtime logs show `POST /api/admin/digest 200` at the scheduled minute
   — **this is the real check**. Railway reporting success only means curl
   exited 0; the request appearing on the app side is what proves the job ran.
4. The digest email arrives.

If it fails again, the body is now in the deploy logs — read it before
theorising.

## The dead-man's-switch

Five silent misses is the larger cost here: a crash leaves a traceback, a job
that never fires leaves nothing. That is now covered — **without adding a
monitoring vendor**, because the repo already had the machinery and was only
missing the wiring.

What existed: `cronHeartbeatService` records a run per cron
(`recordCronRun`) and `getCronHeartbeats()` grades staleness against each job's
cadence (`ok` / `late` / `failing` / `never`). What was missing was that
**nothing read it except the admin dashboard** — so every cron in the system,
not just this one, was watched only by whoever happened to open a panel.

Three wires close it:

1. **`daily-digest` is in the registry.** The registry is read from
   `vercel.json`; a Railway-scheduled job can never appear there, so
   `EXTERNAL_REGISTRY` is merged in unconditionally.
2. **The digest route beats.** `/api/admin/digest` calls
   `recordCronRun("daily-digest", …)` on every terminal path — success,
   misconfiguration (503), delivery failure (502), and exceptions (500).
   **Only for the internal bearer caller**: an admin running the digest from
   the browser to test must not make a dead scheduler look alive.
3. **Staleness is a dependency in the status payload.**
   `probeScheduledJobsDependency()` maps `late`/`failing` → `DEGRADED`,
   `never` → `UNKNOWN`, and names the offending jobs in the summary. Because it
   sits in `SystemStatusPayload.dependencies`, the hourly
   `/api/cron/system-health-snapshot` diffs it and `dispatchTransitions` pushes
   the change to **Slack** (`ALERT_SLACK_WEBHOOK_URL`) and **email**
   (`AUTH_ADMIN_EMAIL`).

The detector runs hourly on **Vercel**; the job runs on **Railway**. That
independence is what makes it a watchdog rather than another thing that dies
quietly alongside what it watches. `late` triggers at ~2× cadence, so a missed
daily digest surfaces within about a day — Aug 6 would have paged.

Severity is capped at `DEGRADED` on purpose. This feeds the same banner that
reports payments being down; a late cron is real but is not a user-facing
outage, and crying INCIDENT is how alerting gets ignored.

### Blast radius, stated plainly

This arms staleness alerting for **all** registered crons, not just the digest —
the other eight (`system-health-snapshot`, `esms-reconciliation`,
`chain-reconcile`, `environmental-ingest`, `cache-ephemeris`,
`observability-prune`, `agents-daily-yield`, `prewarm-agent-recipes`) now also
page when late. That is the intent, but it is new signal: expect noise from any
job that was already quietly unreliable, and treat the first week's alerts as a
survey rather than a regression.

### What this does NOT cover

If Vercel itself is down, the detector is down too. For that outer ring an
external dead-man's-switch is the right tool — see the PR discussion; it is
deliberately not added here, because a vendor duplicating machinery you already
own is worth less than wiring the machinery you already own.
