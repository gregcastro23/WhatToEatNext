# Alchm.kitchen — Tech-Week Checklist

_Rev 2 · 2026-06-01 · prod = `master` (Vercel auto-deploy) + Railway Postgres_

**Legend:** `[ ]` todo · `[x]` done · 👤 you (operator-only) · 🤖 Claude (I can do/automate) · ⏱ rough effort

## Status at a glance
- **Prod:** v**3.1.0**, `/api/health` healthy, DB `OK`. Latest `master` deploy `READY`.
- **Shipped this session:** Neon-failover revert · leaked-credential removal · HSCA corpus cleanup · **Lab Book** recipe ingestion · **ESMS milestone quests**.
- **✅ Blockers (P0): ALL CLEAR** — DB password **rotated 2026-06-02** (old creds rejected, prod verified healthy), Vercel `DATABASE_URL` → Railway confirmed, Stripe price/top-ups done.
- **✅ Landed:** [#487](https://github.com/gregcastro23/WhatToEatNext/pull/487) (Lab Book quests) + [#488](https://github.com/gregcastro23/WhatToEatNext/pull/488) (this checklist) merged to `master`. ✅ **Migration 50 applied** on the Railway backend (deploy `88e4002c` / commit `9b5c669b`, 2026-06-01 23:02 UTC — `[migrate] ok 50-lab-book-quests.sql`); quests seeded.

---

## 🔴 P0 — clear before tech-week
- [x] **Rotate the Railway Postgres password.** ✅ **DONE 2026-06-02.** `ALTER USER` on live Postgres, then propagated the new secret to all 7 locations — Postgres `POSTGRES_PASSWORD`; PgBouncer `POSTGRESQL_PASSWORD` + `DATABASE_URL` + `DATABASE_PUBLIC_URL`; WhatToEatNext + device-sessions-cleanup `DATABASE_URL`; Vercel `DATABASE_URL`; local `.env.production.local` — and redeployed each consumer. Verified end-to-end: frontend (`/api/health` db=healthy), backend (`/health` 200), and the PgBouncer path all connect on the new creds; **old password REJECTED**. Notes: the Postgres service itself was *not* redeployed (avoids a DB restart — `ALTER USER` already changed the live password); two inert `_ROT_TEST_*` vars remain on it from a stdin-format test (delete at next Postgres maintenance — deleting triggers a Postgres redeploy).
- [x] **Confirm Vercel `DATABASE_URL` → Railway (not Neon).** ✅ Verified via `vercel env pull`: `DATABASE_PUBLIC_URL` → `tramway.proxy.rlwy.net`, `POSTGRESQL_HOST` → `postgres.railway.internal` — no Neon host present. (`DATABASE_URL` itself is a Vercel *Sensitive* var so it reads back empty, but every DB var is Railway and prod DB is healthy.) ⚠️ Local `.env.production` still holds a **Neon** URL — do NOT sync that file to Vercel.
- [x] **Merged [PR #487](https://github.com/gregcastro23/WhatToEatNext/pull/487)** (quests) → `master`. ✅ **Migration 50 confirmed applied on the Railway backend deploy** (`88e4002c` / `9b5c669b`, 2026-06-01 23:02 UTC) — deploy log shows `[migrate] ok 50-lab-book-quests.sql`. It applies there, *not* in the Vercel build; subsequent `master` pushes (frontend/docs/CI only) correctly SKIPPED the backend redeploy.

## 🟡 P1 — confirm
- [x] **`ALCHM_KITCHEN_SYNC_SECRET` set in Vercel prod** (verified ~19d ago) — PA↔WTEN credit sync auth.
  - [ ] 👤 Confirm it *matches* the PA side (proof = a real PA→WTEN sync returns non-`401`; only act if one `401`s).
- [x] **v3.1.0 live**, DB healthy, latest `master` deployed `READY`.
- [ ] 👤 **Check the OpenAI account has quota** for the demo — Lab Book + cosmic recipe call GPT-4o (`OPENAI_API_KEY` is set in prod ✓; just confirm billing/limits).

## 🎬 Demo-day prep
- [ ] 👤 **Fund the demo account with ESMS, or use a Premium account.** ⏱2 min. **Gotcha:** Lab Book extraction (Essence), cosmic recipe (after the 1 free/day), and refine-oracle (Substance) are **token-gated** → a broke account throws `402` mid-demo. Grant via `/admin` → Grant Tokens.
- [ ] 👤 **Sign the demo device in beforehand** (Google OAuth) + finish onboarding/natal chart (unlocks personalized output).
- [ ] **Demo flow (suggested):** Kitchen (tonight's recs) → Discover (cuisines/ingredients) → **Lab Book** (paste *or* photo a recipe → Save → milestone notice) → **Quests** (claim ESMS) → Cosmic Recipe → Commensal (dinner party).
- [ ] **Avoid on the projector:** admin pages; any action that spends the account's last tokens.

## 🧪 Pre-demo smoke test (~3 min, run ~15 min before)
- [ ] `curl https://alchm.kitchen/api/health` → `"version":"3.1.0"`, `"database":"healthy"`.
- [ ] Signed in → `/lab-book` → paste a short recipe → **Extract** → preview shows ingredients/steps + elemental/ESMS → **Save** → appears in cookbook.
- [ ] `/cosmic-recipe` generates one recipe; `/feed` loads.
- [ ] `/admin` System Status → all flows `OK` (no DEGRADED/INCIDENT).

## 🔁 Rollback & monitoring
- [ ] **Rollback path:** Vercel → Deployments → a previous `READY` prod deploy → **Instant Rollback** (recent rollback targets: `17f04acd`, `70409445`). Reverts code in seconds.
  - ⚠️ **Migrations are forward-only** — a code rollback does **not** undo DB migrations. Recent ones (quest INSERTs, column-default restores) are additive/harmless; a *bad* migration needs a manual DB fix, not a rollback.
- [ ] **Watch during the event:** `/admin` System Status + `/api/health`. Status-transition alerts fire to Slack/email when `ALERT_SLACK_WEBHOOK_URL` / `ADMIN_EMAILS` are set.

---

## 📅 Day-by-day plan

> Assumes a **5-day (Mon–Fri) tech week** + a prep day before and a wrap day after — relabel to real dates. The repeatable **Daily ritual** is defined once; each day lists it plus that day's focus.

### 🔁 Daily ritual
**Morning pre-flight (~15 min before doors):**
- [ ] `curl https://alchm.kitchen/api/health` → `"version":"3.1.0"`, `"database":"healthy"`
- [ ] `/admin` System Status — all flows `OK` (no DEGRADED / INCIDENT)
- [ ] Demo account: signed in + ESMS balance comfortably above demo needs (Lab Book & cosmic recipe are token-gated)
- [ ] One live dry-run of the headline flow (e.g. Lab Book: paste → **Save** → milestone)
- [ ] Skim overnight alerts (Slack/email) + `/admin` error & slow-query rings

**End of day:**
- [ ] Review System Status + error logs for the day; jot anything flaky
- [ ] Triage: hotfix tonight vs park for the post-week list
- [ ] Top up demo-account ESMS if it ran low

### Day −1 · Prep & freeze
- [ ] 🔴 Rotate Railway password → set new `DATABASE_URL` (Vercel + local `.env*`) — also settles the "is it Railway?" check
- [x] Confirm **migration 50** applied → quests show in the Quests panel (Railway deploy `88e4002c` / `9b5c669b`, 2026-06-01 23:02 UTC)
- [ ] Fund the demo account with ESMS (or use Premium); finish onboarding / natal chart
- [ ] Confirm OpenAI quota (GPT-4o powers Lab Book + cosmic recipe)
- [x] 🔴 Confirm the Stripe **premium price object = $5/mo** — ✅ `NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID` = `price_1TBVHB567feWgZJOXV4MGIL7` = live **$5.00/month** recurring ("Alchm.kitchen premium membership"). App's $5 display matches the charge.
- [x] 🔴 3 **MCP top-up** Stripe prices ($5/$20/$50) already existed in **live** Stripe (Starter `price_1Tbj7K…` · Builder `price_1Tbj7L…` · Adept `price_1Tbj7M…`); set `STRIPE_MCP_TOP_UP_{5,20,50}_PRICE_ID` in Vercel + **redeployed prod** (`9uqg066h6` → alchm.kitchen). ⚠️ **Verify live:** signed-in `/account/billing/mcp` → **Top up** → Stripe Checkout opens (not a 503 "not configured" banner). Env vars are Sensitive (write-only), so this signed-in click is the only possible check.
- [x] Merge **PR #490** (premium-journey fixes: $5 display · starter grant → 60 · swap 402) — merged (`38a94421`)
- [ ] Full smoke test (Kitchen recs · Discover · Lab Book · Quests · Cosmic Recipe · Commensal)
- [ ] Record the current-good prod deploy SHA + confirm the Vercel **Instant Rollback** path
- [ ] **Soft-freeze `master`** — docs / hotfixes only from here

### Day 1 · Go-live
- [ ] AM ritual → final go/no-go (prod healthy, account ready)
- [ ] _Suggested focus:_ Onboarding + **Kitchen** (tonight's personalized recommendations) — the core hook
- [ ] EOD ritual

### Day 2
- [ ] AM ritual
- [ ] _Suggested focus:_ **Discover** — cuisines, ingredients, cooking methods (catalog breadth)
- [ ] EOD ritual

### Day 3
- [ ] AM ritual
- [ ] _Suggested focus:_ **Lab Book** — ingest a recipe by text *and* by photo → Save → **ESMS milestone quest** (the new feature)
- [ ] EOD ritual

### Day 4
- [ ] AM ritual
- [ ] _Suggested focus:_ **Cosmic Recipe** generation + **Commensal** dinner-party harmonization (AI + social)
- [ ] EOD ritual

### Day 5 · Wind-down
- [ ] AM ritual
- [ ] _Suggested focus:_ **Lab / Quantities** — the alchemy internals ("how it works") + recap of the week's highlights
- [ ] Capture standout feedback + metrics before close
- [ ] EOD ritual

### Day +1 · Post-week
- [ ] Quick retro: what broke, what to harden
- [ ] Lift the `master` freeze; resume normal dev
- [ ] Clear deferred items: git-history scrub (now safe post-rotation) · `.claude/worktrees/*` sweep · Lab Book follow-ups (scope quests to `source=scan`, persist photos, PDF import)

---

## ✅ Done this session
- [x] Reverted Neon write-failover (`70409445` ← `8f1b2047`) — split-brain hazard; **do not re-introduce**.
- [x] Removed hardcoded DB password from backfill scripts (`17f04acd`).
- [x] Removed ingested HSCA raw corpus `HSCArecipes/` (`f13f4f98`) — in DB read_model + `.vercelignore`'d.
- [x] Shipped **Lab Book** ingestion (text/photo → GPT-4o → alchemize → cookbook), token-gated — on `master`.
- [x] **ESMS milestone quests** (migration 50) — staged in **PR #487** (not yet on `master`).
- [x] Workspace cleanup — 744 redundant untracked dupes + 3 eslint caches removed (0 tracked changes).

## 📌 Backlog (not tech-week-blocking)
- [ ] 🤖 Scope Lab Book quests to `source === "scan"` so generator/riff saves don't count — if desired.
- [ ] Persist ingested photos (Vercel Blob vs base64); PDF / multi-page batch import.
- [ ] Harmonize `agent-recipes` (`Bearer`) vs `sync-credit` (`X-Sync-Secret`) auth header formats.
- [ ] Refactor `scripts/backfillRecipeAlchemicalQuantities.ts` to share `alchemizeExtractedRecipe`.
- [ ] 👤 Git-history scrub of the leaked password — **now unblocked** (password rotated 2026-06-02, so the old creds in `master` history are dead). Lower urgency now, but still worth scrubbing; it rewrites `master` + invalidates clones, so coordinate before running.
- [ ] Sweep ~37 stale `.claude/worktrees/*` (carefully — may hold uncommitted work).

## 📎 Appendix — audit reconciliation (`audit-reports/wten-architecture-audit-2026-06-01.md`)
- **Already resolved (audit was stale):** `group_chat_quest` is in the `TransactionSourceType` whitelist (`src/types/economy.ts`); `ALCHM_KITCHEN_SYNC_SECRET` is documented in `AGENTS.md` + `GEMINI.md`.
- **Accurate (FYI, no action):** MCP server `@alchm/mcp-server` v1.1.2; `/api/cron/synthetic-mcp` exists.
- The earlier chat roadmap that reprinted a live DB password is **superseded by this file**.
