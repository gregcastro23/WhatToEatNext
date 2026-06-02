# Alchm.kitchen — Tech-Week Checklist

_Rev 2 · 2026-06-01 · prod = `master` (Vercel auto-deploy) + Railway Postgres_

**Legend:** `[ ]` todo · `[x]` done · 👤 you (operator-only) · 🤖 Claude (I can do/automate) · ⏱ rough effort

## Status at a glance
- **Prod:** v**3.1.0**, `/api/health` healthy, DB `OK`. Latest `master` deploy `READY`.
- **Shipped this session:** Neon-failover revert · leaked-credential removal · HSCA corpus cleanup · **Lab Book** recipe ingestion · **ESMS milestone quests**.
- **⛔ Blockers (P0):** rotate the leaked DB password · confirm Vercel `DATABASE_URL` → Railway.
- **✅ Landed:** [#487](https://github.com/gregcastro23/WhatToEatNext/pull/487) (Lab Book quests) + [#488](https://github.com/gregcastro23/WhatToEatNext/pull/488) (this checklist) merged to `master`. ⚠️ Confirm **migration 50** applied on the Railway backend (quests appear once it has).

---

## 🔴 P0 — clear before tech-week
- [ ] 👤 **Rotate the Railway Postgres password.** ⏱5 min. Leaked to `master` history (#443) + chat — rotation is the only real fix. Then set the new `DATABASE_URL` in **Vercel** *and* local `.env*` (backfill scripts now require it). Triggers a redeploy.
- [ ] 👤 **Confirm Vercel `DATABASE_URL` → Railway (not Neon).** ⏱2 min. Vercel → Settings → Environment Variables; check the host. *(🤖 I can surface just the host via a temp `vercel env pull` — never the password — if you want.)*
- [x] **Merged [PR #487](https://github.com/gregcastro23/WhatToEatNext/pull/487)** (quests) → `master`. ⚠️ **Confirm migration 50 ran on the Railway backend deploy** — it applies there, *not* in the Vercel build, so the quests show in `/admin`/Quests only once that deploy has run.

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
- [ ] Confirm **migration 50** applied → quests show in the Quests panel
- [ ] Fund the demo account with ESMS (or use Premium); finish onboarding / natal chart
- [ ] Confirm OpenAI quota (GPT-4o powers Lab Book + cosmic recipe)
- [ ] 🔴 Confirm the Stripe **premium price object = $5/mo** (the app shows $5 — make Stripe match)
- [ ] 🔴 Create 3 **MCP top-up** Stripe prices ($5/$20/$50) + set `STRIPE_MCP_TOP_UP_{5,20,50}_PRICE_ID` in Vercel → the `/account/billing/mcp` top-up panel works (else users can't self-serve refill ESMS)
- [ ] Merge **PR #490** (premium-journey fixes: $5 display · starter grant → 60 · swap 402)
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
- [ ] 👤 Git-history scrub of the leaked password — **only after rotation** (rewrites `master`, invalidates clones).
- [ ] Sweep ~37 stale `.claude/worktrees/*` (carefully — may hold uncommitted work).

## 📎 Appendix — audit reconciliation (`audit-reports/wten-architecture-audit-2026-06-01.md`)
- **Already resolved (audit was stale):** `group_chat_quest` is in the `TransactionSourceType` whitelist (`src/types/economy.ts`); `ALCHM_KITCHEN_SYNC_SECRET` is documented in `AGENTS.md` + `GEMINI.md`.
- **Accurate (FYI, no action):** MCP server `@alchm/mcp-server` v1.1.2; `/api/cron/synthetic-mcp` exists.
- The earlier chat roadmap that reprinted a live DB password is **superseded by this file**.
