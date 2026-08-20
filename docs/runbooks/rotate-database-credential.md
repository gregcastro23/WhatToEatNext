# Runbook — rotating the production Postgres credential

Last executed: **2026-08-08** (successful). This runbook is written from that
run, including the two things that went wrong.

The database is Railway Postgres, fronted by PgBouncer, consumed by Vercel
(the Next.js app), three Railway services, and GitHub Actions. The password is
copied **literally** into most of those places — only Postgres's own
`PGPASSWORD` / `DATABASE_URL` / `DATABASE_PUBLIC_URL` are `${{...}}` references
off `POSTGRES_PASSWORD`. So there is no single place to change.

---

## The one rule that matters

**Capture the current password to a file before you touch anything.**

`ALTER USER` needs the *old* password to authenticate. On 2026-08-08 the new
value was staged into all six Railway variables first — and those variables were
the only readable copy of the old one. The rotation was locked out of itself.

Production never went down (nothing had redeployed, so running containers still
held the old value), and recovery only worked because Vercel happened to store
`POSTGRESQL_PASSWORD` as non-sensitive plaintext. That was luck. `railway ssh`
needs a registered SSH key, and Postgres stores only a non-reversible SCRAM
verifier — there is no other way back.

```bash
railway variables -s Postgres --kv | grep '^POSTGRES_PASSWORD=' | cut -d= -f2- > /tmp/old_pw
chmod 600 /tmp/old_pw
```

Use a **file**, not `CUR="$(...)"` — a shell variable evaporates with the shell,
and this is a multi-step process across several invocations.

Order is always: **capture old → change the role → propagate copies → rebuild.**

---

## 1. Enumerate the surface by value

Never work from a list of services you remember. On 2026-08-08 the guessed list
was wrong twice.

```bash
./scripts/find-secret-copies.sh --file /tmp/old_pw
```

Expected shape of the answer (2026-08-08): **9 Railway variables across 4
services**, plus whatever is local.

| Service | Variables holding the literal password |
|---|---|
| `Postgres` | `POSTGRES_PASSWORD`, `PGPASSWORD`, `DATABASE_URL`, `DATABASE_PUBLIC_URL` |
| `PgBouncer` | `POSTGRESQL_PASSWORD`, `DATABASE_URL`, `DATABASE_PUBLIC_URL` |
| `WhatToEatNext` | `DATABASE_URL` |
| `device-sessions-cleanup` | `DATABASE_URL` |

`device-sessions-cleanup` was on nobody's list. It was found **only** by
scanning every service's variables for the literal value. `daily-digest-cron`
and `Redis` are clean — but that is a measured result, not an assumption.

### Two surfaces the scan cannot see

The script reports these as blind spots rather than implying completeness.
Resolve both by hand.

- **GitHub Actions secrets are write-only.** They cannot be read back, so a
  by-value scan is impossible. This is the surface that was missed on
  2026-08-08: `DATABASE_PUBLIC_URL` still held the old password, CI went red on
  the next push, and the 06:45 and 07:15 scheduled workflows would have failed
  too. Check `gh secret list` by name against what you rotated.
- **Vercel "Sensitive" variables pull as `[SENSITIVE]`.** Since 2026-08-08 the
  password vars are marked Sensitive — better security, but it means a future
  by-value scan is blind to them. Handle Vercel by **name**.

---

## 2. Change the role

Generate a password with no shell-hostile or URL-hostile characters (`@ : / ? #`
break DSN parsing):

```bash
openssl rand -hex 24
```

Authenticate with the **old** credential and change the role:

```sql
ALTER USER postgres WITH PASSWORD '<new>';
```

Verify both directions before going further — new accepted, old rejected:

```
new password → connects
old password → 28P01 invalid_password
```

If the old one still works, the change did not apply. Stop.

---

## 3. Propagate

Stage every copy found in step 1 **without** triggering redeploys, so the
rotation isn't half-applied across a fleet mid-flight:

```bash
railway variable set --stdin --skip-deploys --service <svc>
```

Then Vercel, by name — `DATABASE_URL`, `DATABASE_PUBLIC_URL`,
`POSTGRES_PASSWORD`, `POSTGRESQL_PASSWORD`.

> **Vercel Sensitive vars are one-way.** `DATABASE_URL` was already Sensitive and
> therefore unreadable, so overwriting it destroys a value you cannot restore.
> Reconstruct the DSN from evidence — check which host production's backends
> actually arrive from — before writing.

Then GitHub:

```bash
gh secret set DATABASE_PUBLIC_URL
```

---

## 4. Rebuild — do not use `vercel redeploy`

**Vercel binds environment variables at build time.** `vercel redeploy` reuses
the *existing build's* env snapshot, so it will happily redeploy the old
credential and look successful.

Trigger a **git-based** rebuild instead. A no-op commit is enough:

```bash
git commit --allow-empty -m "chore(deploy): rebuild to pick up the rotated database credential"
git push origin master
```

Then redeploy the Railway services (`railway redeploy -s <svc>`), PgBouncer
last — it is the path everything else depends on.

---

## 5. Verify

```bash
curl -s https://alchm.kitchen/api/health | jq '.services.database'
```

Must read `"healthy"`.

> ⚠️ This step read `jq '.database'` until 2026-08-19. The payload nests it as
> `services.database`, so the expression returned `null` and could never read
> `"healthy"` — a verification gate that structurally could not pass. The same
> line also claimed `/api/health` memoizes; it does not, there is no cache in
> the route. Still confirm with a route that does real database work, because a
> single `SELECT 1` proves connectivity, not that the credential has the grants
> the app needs.

Then re-run the enumeration against the **new** value — it should find the new
password everywhere the old one was:

```bash
./scripts/find-secret-copies.sh --file /tmp/new_pw
```

And confirm CI, which is the step that was missed:

```bash
gh run list --limit 5
```

**A zero-result scan is a claim, not a result.** Before trusting one, plant a
canary and prove the scan can see anything at all:

```bash
printf 'canary %s\n' "$(cat /tmp/new_pw)" > ./.credcanary.tmp
./scripts/find-secret-copies.sh --file /tmp/new_pw   # must report it
rm -f ./.credcanary.tmp
```

A broken scan and a clean one look identical.

---

## Rollback

If health returns anything other than `"database":"healthy"`, reconstruct the
direct (non-pooled) DSN, set it as `DATABASE_URL` on Vercel, and trigger a
git-based rebuild. This bypasses PgBouncer, which is the most likely failure
point — its `auth_file` userlist is static and does not follow an `ALTER USER`
automatically.

---

## Where the credential lives now

`.env` at the repo root holds `DATABASE_PUBLIC_URL`. It is gitignored
(`.gitignore:34` → `.env*`), untracked, and `chmod 600`.

It is deliberately **not** named `DATABASE_URL`: `src/lib/database/config.ts`
reads `process.env.DATABASE_URL`, so that name would silently point `bun run dev`
at production.

It exists so the live credential has a readable copy **outside** the variables a
rotation overwrites — which is exactly what step 0 above needs, and exactly what
was missing on 2026-08-08.
