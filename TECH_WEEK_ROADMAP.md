# Alchm.kitchen — Tech-Week Readiness Roadmap

_Last updated: 2026-06-01_

> Supersedes the earlier chat roadmap (which reprinted a live DB password and
> restated unverified audit claims as fact) and corrects the source audit
> `audit-reports/wten-architecture-audit-2026-06-01.md`. **Every item below was
> checked against the codebase** — verification status is marked on each line.
> No secrets appear in this file.

## Legend
- ✅ Done / verified in code
- 🔴 **P0** — do before tech-week (action required)
- 🟡 **P1** — should do
- 🔵 **P2** — optional / cosmetic
- ⚠️ Verify in an external console (Vercel / Railway) — cannot be confirmed from the repo
- ❌ Audit claim that is **false or already resolved** — no action needed

---

## ✅ Done this session (on `master`)
- **Reverted the Neon write-failover** — commit `70409445` reverts `8f1b2047`. It was a split-brain data-corruption hazard, not HA: Neon is the *pre-migration* database, not a synchronized Railway replica, so failing writes over to it forks the dataset. **Do not re-introduce.** Real resilience here is PgBouncer/Railway pooling + `statement_timeout` + fail-fast (ADR-007), already in place.
- **Removed the hardcoded DB password** from `scripts/backfillHscaElementalProperties.ts` and `scripts/backfillRecipeAlchemicalQuantities.ts` — commit `17f04acd`. Both now require `DATABASE_URL` and throw if it is unset.
- **Removed the ingested HSCA raw-source corpus** (`HSCArecipes/`, 512 files + `.venv_hsca`/PDF) — commit `f13f4f98`. Already in the DB read_model + `.vercelignore`'d; recoverable from git history.
- **Shipped the Lab Book** — recipe ingestion: paste text **or** upload a photo → GPT-4o extraction → elemental + ESMS enrichment → saved to the personal cookbook (`user_custom_recipes`), token-gated on Essence. New `/lab-book` page + Lab nav entry, `POST /api/recipes/extract`, `src/lib/recipes/*`. typecheck/lint/build clean; page renders + auth-gated; `OPENAI_API_KEY` present in Vercel prod.
- **ESMS milestone quests for the Lab Book** — `database/init/50-lab-book-quests.sql`: tiered achievements (add 1/5/25/100 recipes → 10/25/75/200 ESMS) + a weekly (3/week → 15 ESMS), via an `ingest_recipe` event reported on each cookbook save. Auto-applies on the next Railway deploy; surfaces in the existing Quests panel.

---

## 🔴 P0 — Critical

1. **Rotate the Railway Postgres password.** It was committed to `master` (#443, 2026-05-24 — one day *after* the last rotation) and was exposed in chat. Removing it from the working tree does **not** undo the git-history exposure; rotation is the only real fix. _After rotating:_ set the new `DATABASE_URL` in the Vercel dashboard **and** your local `.env*` files (the backfill scripts now require it).

2. ⚠️ **Reconcile `DATABASE_URL` in the Vercel dashboard.** Confirm production points at **Railway**, not a **Neon** host. The audit found a Neon reference in the Vercel-generated `.env.production`; this can only be checked in Vercel → Settings → Environment Variables. (With the failover reverted, a stray Neon URL no longer triggers silent failover — but it would still point the live app at the wrong cluster.)

---

## 🟡 P1 — Deploy & config

3. ✅ **`ALCHM_KITCHEN_SYNC_SECRET` is set in Vercel production** — confirmed 2026-06-01 via `vercel env ls production` (present, `Encrypted`, added ~19d ago; `INTERNAL_API_SECRET` also present). The audit's "historically unset → 401 storms" risk does **not** apply to current prod. The endpoint authorizes via `X-Sync-Secret` (`src/app/api/economy/sync-credit/route.ts:51`).
   - ⚠️ **Value-equality with the PA/FastAPI side was NOT verified here.** Confirming it means comparing the secret's *value* across two systems (the Railway MCP returns raw values, and was not authenticated in-session) — not worth exfiltrating a secret to check. Definitive, safe proof of a match = a real PA→WTEN sync landing a non-`401` at `/api/economy/sync-credit`. Confirm operator-side if a sync ever 401s.

4. ✅ **Version 3.1.0 is already live — no new deploy needed.** Latest `master` commit `17f04acd` (sits on top of the failover revert `70409445`) is deployed to **production, state `READY`** (`dpl_4bo8CcsXYgpGrpzQaR7xmoLMYrSc`, target=production). `curl https://alchm.kitchen/api/health` →
   ```json
   {"status":"healthy","version":"3.1.0","environment":"production","services":{"database":"healthy","cache":"memory"}}
   ```
   The push already auto-deployed (`package.json` 3.1.0 → `next.config.js:122` `APP_VERSION` → `src/app/api/health/route.ts:26`). Forcing another deploy adds nothing.

---

## ❌ Audit "P0s" that are already resolved — **no action**

- **`group_chat_quest` transaction whitelist** — already present in `src/types/economy.ts:50`. (Audit claimed it was missing.)
- **`ALCHM_KITCHEN_SYNC_SECRET` documentation** — already present in **both** `AGENTS.md` and `GEMINI.md`. (Audit claimed it was omitted.)

## ✅ Audit claims that ARE accurate (FYI, no action)

- MCP server is `@alchm/mcp-server` **v1.1.2** (`mcp-server/package.json`).
- `/api/cron/synthetic-mcp` exists in `vercel.json`.
- `sync-credit` authorizes via `X-Sync-Secret`; `agent-recipes` via `Bearer INTERNAL_API_SECRET` (a real header-format mismatch — harmonizing them is a reasonable, non-blocking follow-up).

---

## 🔵 P2 — Optional / cosmetic

- ✅ **Workspace clutter — done (2026-06-01).** Removed **744** redundant untracked Finder-copy files (`* 2.*` / `* 3.*`, incl. 717 under `HSCArecipes/`) + 3 `.eslintcache` dup copies (kept `.eslintcache` + `.eslintcache-fast`). All untracked → **0 tracked files changed, nothing to commit**. A canonical-exists guard preserved 7 legitimately-numbered files (`Brown Basmati Rice Variation 1–5.md`, 2 `Pizza Dough` files) that only *looked* like dupes. The specific root dupes the audit named (`apply_migration_45 2.cjs`, `recipes_database 3.json`, `HSCA_Recipes 3.pdf`) did not exist.
- ℹ️ **Heavy route bundles — no action needed.** `/ingredients` (558→180 kB) and `/profile` (268→215 kB) already split (CLAUDE.md); `/menu-planner` already uses `next/dynamic` (`src/app/menu-planner/page.tsx`). Revisit only if it lags in a demo.
- ℹ️ **Cron orchestration — verified, not changing.** 9 Vercel crons in `vercel.json`; no Railway cron config exists in the repo (any Railway crons are dashboard-defined, not editable from here). Consolidation is a nicety, not tech-week-blocking.
- ⏸️ **Git-history scrub — deferred (do NOT run yet).** Requires the password rotation (P0) FIRST, then explicit go-ahead — it rewrites `master` history and invalidates every clone. Not performed.
- ⏸️ **Stale agent worktrees** — ~37 `.claude/worktrees/*` (one is the live, locked `master` worktree). Not pruning unprompted: `git worktree remove` can destroy uncommitted work on those branches. Offer standing if you want a careful sweep.
- ℹ️ **Lab Book follow-ups (optional)** — scope quests to `source === "scan"` if generator/riff saves shouldn't count toward "add a recipe"; persist the original photo (Vercel Blob vs base64); PDF / multi-page batch import; refactor `scripts/backfillRecipeAlchemicalQuantities.ts` to share `alchemizeExtractedRecipe` so script + feature use one path.

---

## Post-deploy smoke check (≈2 min)

- `curl https://alchm.kitchen/api/health` → `"version":"3.1.0"`, healthy.
- `/admin` → System Status panel shows the **database** flow `OK` (not `DEGRADED`).
- A PA→WTEN sync (or the next real one) lands without a `401` at `/api/economy/sync-credit`.
