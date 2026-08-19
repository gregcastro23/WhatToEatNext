# Next Session: the admin surface, and what "unwired" actually means

> **Re-measured 2026-08-19 at master `fe5a38b5`.** Everything in §1 and §2 was measured
> this session, not recalled. Re-verify only what you are about to act on, and only if the
> tree has moved. **If a number here disagrees with what you measure, trust your
> measurement and correct this file.**
>
> Items are `[MEASURED 08-19]` (checked this session) or `[CARRIED]` (inherited and **not**
> re-checked). Treat `[CARRIED]` as a lead, not a fact.

---

## 0. What shipped

### 0.1 The money section — COMPLETE `[MEASURED 08-19]`

| PR | Merge | What it fixed |
|---|---|---|
| [#786](https://github.com/gregcastro23/WhatToEatNext/pull/786) | merged | `handleMcpTopUpCheckout` discarded the credit's return value and reported `"credited"` unconditionally. Stripe had been paid, the webhook answered 2xx, Stripe never retried, tokens never arrived. Now branches on `CreditResult`. |
| [#787](https://github.com/gregcastro23/WhatToEatNext/pull/787) | `fe5a38b5` | `claimDailyYield` returned `null` for BOTH "already claimed" and "rolled back"; the route rendered a DB fault as the cheerful 409 "return tomorrow" and the agents cron counted it as `alreadyClaimed`. Now a discriminated `DailyYieldClaim`. Also fixed `grant-test-tokens.ts`, whose two counters were **inverted**. |

**The design rule these encode, worth reusing:** the two error directions are not
symmetric. Retrying a credit that already landed is free — the idempotency key makes it a
no-op replay. Answering 2xx on a credit that did *not* land is unrecoverable. So throw
(⇒ retry) unless the failure is *provably* permanent.

Earlier: the eight-PR thermal stack (#778–#785) closed the lab thermal program; #776/#777
fixed the admin grant and adopted 31 untracked premium/Stripe files.

---

## 1. ⚠️ THE ADMIN QUESTION — ANSWERED

> **"The admin overview still seems unwired/incomplete. Did we lose work?"**
>
> ## No work was lost. Not one line. `[MEASURED 08-19]`

### 1.1 Four independent proofs that nothing is missing

1. **Every admin PR is merged into master.** #741, #749, #753, #755, #775, #776 all appear
   in `git log master -- src/app/admin src/components/admin src/app/api/admin`.
2. **No branch carries admin content master lacks.** Swept all 313 local + 130
   remote-tracking refs. The branches that *look* ahead are squash-merged PRs whose commits
   simply are not ancestors; diffing their trees against master shows master **ahead**
   (e.g. `feat/admin-honesty-kit` → master is +154 lines).
   ⚠️ **The first run of this sweep returned a false zero** — see §3.
3. **Nothing is orphaned.** All 12 `_dashboard/*` modules have importers;
   `dashboard/page.tsx → Dashboard → …` is a connected graph. All 10 `*Panel.tsx` fetch a
   real endpoint. 32 admin API routes exist, all auth-gated (probed prod: `401`, not `404`).
4. **Production is current.** Vercel production deployment was 8 minutes old at measurement
   time and carries `fe5a38b5`. This is not a deploy lag.

**The surface is 20,304 lines across 10 tabs.** It is large, merged, deployed, and wired.

### 1.2 The audit already diagnosed this — on 2026-08-17

`docs/admin/AUDIT_2026_08_17.md` opens with the exact finding, reached independently:

> "The admin surface was never *unwired*: ~19,000 lines across nine tabs, and every `fetch`
> resolves to a real, auth-gated route backed by real SQL."

It names three causes of the "lights on but nobody home" feeling: **collection without a
reader**, **liveness flags that cannot be false**, and **structurally empty tabs**.
`docs/admin/UPGRADE_PLAN.md` reduces them to six root causes and states the strategy:

> "**Phase A is the kit. Everything else is a migration onto it.** Doing P0 items one-by-one
> first would mean re-doing them."

### 1.3 ⚠️ So here is the actual answer: Phase A shipped. Phase B never started.

**The kit exists.** `src/components/admin/kit/` — `Metric.tsx`, `ProvenanceBadge.tsx`,
`EmptyState.tsx`, `provenance.ts`, shipped in #775.

**It is imported by exactly ONE of the ten panels** (`SettlementPanel.tsx`) `[MEASURED 08-19]`.

That is the whole discrepancy between "we did a lot of work on the admin environment" and
"it doesn't seem reflected." The foundation landed; the nine panels that would *show* it
were never migrated. The work you remember doing is real and is on master — it is
infrastructure that is not yet visible because nothing was moved onto it.

### 1.4 Why the panels that ARE wired still look empty `[MEASURED 08-19]`

Three measured reasons, none of which is a bug in the panel:

**(a) Six of the dashboard's source tables are empty in production.** Row counts:

| empty (0 rows) | populated |
|---|---|
| `restaurants`, `restaurant_order_intents` | `users` 6,404 · `user_profiles` 6,348 |
| `food_diary_entries`, `user_meal_plans` | `feed_events` 25,512 · `token_transactions` 23,443 |
| `user_calculations`, `cart_handoff_intents` | `system_metrics` 19,321 · `synthetic_probe_results` 45,079 |
| (`manual_companion_charts` has 1 row, from June) | `user_interactions` 8,672 · `token_balances` 3,717 |

Those panels render honest empty states **correctly, and will forever**, until something
writes to those tables. Per `CLAUDE.md` that is required behaviour, not a defect — but
nothing on screen explains *why* it is empty, so it reads as broken.

**(b) API observability covers 6 of 253 routes.** `withObservability` wraps **9** route
files; `request_log_entries` holds 14,227 rows across just **6 distinct paths**, and
**91% of them are one internal endpoint** (`/api/economy/sync-debit`, 12,992). Nothing a
human touches is instrumented — no auth, no onboarding, no feed, no checkout. So
`ApiRouteHealthPanel` is live, correct, and nearly blind.
- ⚠️ Correcting a stale docstring: `withObservability.ts` still calls this an "in-memory
  request log". It is **not** — `requestLog.ts` INSERTs into `request_log_entries` and
  hydrates the ring from Postgres on start. The data survives restarts.

**(c) There have been ZERO human signups since 2026-08-06.** All 753 users created since
then are agents (`is_agent = true`). Agents are script-created and emit no sign-in events,
which is why `auth_events` has only 11 rows in August and the auth panels look dead. **The
auth logging is not broken** — `logAuthEvent` is wired at 10+ call sites in `auth.ts`.
This is a product fact, not an infrastructure fault, and it is arguably the most important
number in this document.

### 1.5 What to actually do — Phase B, in order

1. **Migrate the 9 remaining panels onto the kit.** This is the single change that makes
   the surface look "seamlessly wired", because it gives every panel one vocabulary for
   live / stale / absent. The plan's §1.1 `Provenance` contract is already written and the
   primitives already exist. Effort **L**, highest visible payoff on the board.
2. **Give every empty tab a stated reason.** `EmptyState` already exists; an empty
   Settlements tab should say "no restaurant partners onboarded yet", not render a blank
   table. Effort **M**. This is what converts "broken" into "understood".
3. **Instrument the routes a human actually hits** — `/api/auth/[...nextauth]`,
   `/api/onboarding`, `/api/feed`, `/api/stripe/webhook`. Four small diffs that convert
   permanently-UNKNOWN detectors into real ones. Effort **S**, cheapest item on this list.
4. **Fix the admin layout contrast.** `src/app/admin/layout.tsx` is `bg-gray-100` at four
   sites (L83/94/115, and the real shell at **L142**) while both moderation pages are
   written in dark classes (12–13 dark utilities each) — **1.07:1 against WCAG AA's 4.5:1**.
   `/admin/chat-reports` and `/admin/feed/comment-reports` are *unreadable today*. One
   commit fixes both. Effort **M**. `[MEASURED 08-19]`
5. Only then work the remaining individual findings.

⚠️ **The two audit docs disagree on the count**: `AUDIT_2026_08_17.md` says "121 findings
survived refutation" (47 dishonest · 14 dead · 27 thin · 33 unset); `UPGRADE_PLAN.md` says
"110 verified findings". Reconcile before quoting either. Roughly 11 have been addressed
(#775 kit, #776 grant honesty).

---

## 2. Verified state

### 2.1 Repo / CI `[MEASURED 08-19]`

- `master` = **`fe5a38b5`**. Protected by ruleset **`20950461`**, `enforcement=active`,
  5 required contexts (`Verify`, `Build`, `Test`, `Lint debt`, `rust`).
  - ⚠️ **There is no *classic* branch protection.** `GET /branches/master/protection`
    returns **404**. Read `/repos/:owner/:repo/rulesets` instead.
  - ⚠️ **Still never red-proofed.** A *failing* required check showed `UNSTABLE` while a
    merely *pending* one showed `BLOCKED`. Read the individual check buckets
    (`gh pr checks N`), never `mergeStateStatus` alone.
- **8 open PRs**, all ≥15 days old: #719, #711, #691, #655, #654, #569, #503, #461.
- **313 local branches** vs **130 remote-tracking**. `git fetch --prune` is healthy.
- **71 worktrees.** The reclamation in §4.G is untouched.
- Lint debt: **21906 locally**, baseline 21908.
  - ⚠️ **CORRECTED:** the previous handoff claimed a local run reproduces CI *exactly* at
    untracked-count 0. It does not. With **0 untracked files under `src/`**, local reads
    **21906** and CI read **21905** for the same commit. Not the cache (lint:debt builds its
    own `ESLint` instance, no `--cache`), not the version (both 9.39.4 / node 22.23.1), and
    not `NODE_ENV` (tested `NODE_ENV=test` locally → still 21906). It is macOS vs Linux.
    **Treat local as CI ±1.**

### 2.2 Production health `[MEASURED 08-19]`

- ⚠️ **`cosmic-recipe` is DEGRADING: 76.8% over 7d** (168 runs), down from 89.29% at the
  last measurement. p95 **10,004 ms** against its own 10,000 ms timeout — the probe is
  timing out, not erroring. It drives the live `ai-generation` INCIDENT
  (`OK->INCIDENT` at 08-18T23:01).
- ⚠️ **`cron:prewarm-agent-recipes` is also worsening**: p95 **50,531 ms**, max
  **54,064 ms** — up from 28,313/43,900. It raises no alert because it has **no timeout
  gate**. It is now the slowest thing in the system by 5×.
- **NEW component alerting: `chain-shop`** — `OK->DEGRADED`, *"Shop burn audit hit 40
  error(s)"*, recurring roughly hourly (08-19T01:45, 08-18T22:45). Not in the previous
  handoff. Uninvestigated.
- `database` flapped `OK->DEGRADED->OK` overnight (08-18T23:01 → 08-19T00:01).
- ⚠️ **Slack alerting has still never delivered: 406 of 407** rows carry
  `{"ok": false, "error": "ALERT_SLACK_WEBHOOK_URL not set"}` (1 more suppressed by
  cooldown). Nobody is paged, for anything, ever.
- `restaurants` = **0 rows**. The ESMS settlement handle `CLAUDE.md` marks launch-blocking
  has never been exercised.

### 2.3 Production env `[CARRIED from 08-18]`

124 variables; the name list is a presence oracle. **ABSENT:** `AUTH_REVOCATION_CHECK`,
`ALERT_SLACK_WEBHOOK_URL`, `NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG`,
`STRIPE_RESTAURANT_ORDER_PRICE_ID`, `NEXT_PUBLIC_STRIPE_RESTAURANT_CRYPTO_ENABLED`,
`BASE_RPC_URL`. **SET:** `INTERNAL_API_SECRET`, `UPSTASH_REDIS_REST_URL`,
`STRIPE_SECRET_KEY` (**live**).

---

## 3. Landmines

### 3.1 ⚠️ NEW — two broken witnesses in one investigation `[MEASURED 08-19]`

Both produced confident, wrong answers that a control caught:

- **zsh does not word-split unquoted parameters.** `PATHS="a b c"; git log -- $PATHS`
  passes **one** argument `"a b c"`, matches nothing, and returns **0 for every branch**.
  My first "no admin work is stranded" sweep was this false zero. The control — the same
  loop against a path known to have unmerged work — is what exposed it. In zsh use
  `${=PATHS}`, or write the paths literally.
- **A status vocabulary you did not check.** I computed probe health as
  `status='ok'` and got **0.0% for all 12 probes** — including ones that plainly work. The
  real vocabulary is `success` / `failure` / `timeout`. **A uniform 0/N across
  heterogeneous subjects is almost always your witness, not the world.**

### 3.2 ⚠️ `_logger.warn` emits NOTHING in production

`src/lib/logger.ts` gates `warn`/`info`/`debug` on `NODE_ENV !== "production"`. Only
`_logger.error` is ungated. Paying down `no-console` debt on an alerting path by switching
to `_logger.warn` **silently deletes the alert** in the only environment that matters. With
Slack dead (406/407), stdout is the alerting channel. Pick the level by *where it must be
visible*, and say so in a comment so nobody "fixes" the severity later.

### 3.3 ⚠️ `git reset --hard` has destroyed this file's edits TWICE

The second time the cwd and branch were both correct — location is not the hazard, `--hard`
is. **Before any `--hard`, name the uncommitted change it is meant to discard. If the answer
is "nothing, I just want it clean", delete the line.** Keep a copy outside the repo while
editing this file; that copy is what saved it both times.

### 3.4 Control tests and red-proofs

- **Build a control by restoring the ORIGINAL code, never by hand-editing your new code.**
  Repeated 08-18: disabling a branch by hand left a field `undefined`, which threw into a
  catch-all that returned the *same status the test asserted* — so the red-proof **passed**.
  Disabling a branch is not the same as restoring what preceded it; it often produces a
  third state that coincidentally emits the same symptom.
- Assert on something only the correct path can produce, or restore the original — ideally both.

### 3.5 Carried `[CARRIED]`

- **jest sets `resetModules: true`.** Load the service and the route inside the same
  `await import()` window or a spy will not be seen.
- **eslint ignores test files**; linting one with `--no-ignore` gives a
  `parserOptions.project` parse error for *every* test file in the repo — confirm with a
  control before blaming your file.
- **eslint on `scripts/`** reports a missing `@typescript-eslint` plugin. Pre-existing —
  confirmed against an unmodified script. `lint` only covers `src`.
- **jest `testMatch` sweeps all of `src/__tests__/**`** — a helper there is collected as a
  suite and fails. Helpers go in `src/utils/testing/`.
- **`document.hidden === true` under jsdom** makes every `useHardenedPolling` panel never
  fetch. The hook is correct in a real browser (the early return is paired with a
  `visibilitychange` resume) — this is a test-environment trap only.
- **`timeout` does not exist on this macOS box.** **React 19 removed the global `JSX`
  namespace** — write `React.JSX.Element`.
- **`DATABASE_PUBLIC_URL` in `.env.development.local` is PRODUCTION.** Read-only unless told
  otherwise; `pg` driver, never Prisma. A probe script must live inside the repo to resolve
  `pg`. `STRIPE_SECRET_KEY` is **live** — read-only API calls only.
- **`python str.replace()` no-ops silently.** Use an anchored replace with an `assert` on
  the match count, and check `git diff --stat` after.
- **`git grep -E`** uses POSIX ERE where `\s` matches a literal `s` → false zeros. Use `-P`.
- **71 worktrees hold near-identical copies of every source file.** Always `git grep`, never
  a bare `grep -r`.
- **Empty `"* 2"` directories litter `src/`** (`src/components/admin/kit/__tests__ 2`, etc.)
  — untracked, empty, a file-sync artifact. Harmless but noisy; `find src -name "* 2"`.
- `ElevationProvenance` is a `SpacetimeType` enum mirrored in
  `spacetime-module/src/live_tables.rs`; adding a variant may require `--delete-data`.
- Cargo runs end with several `running 0 tests` doc-test blocks — read **every**
  `test result:` line.
- Don't run `next build` while `next dev` is live.
- **A ULP failure is not automatically libm drift** — compute the amplification first.
  **A perturbation experiment cannot measure error the function adds itself.**
- **`thermo_golden_vectors.json` repeats slab λ₁ values in two sections** — anchor
  replacements on the full row and assert the match count.
- **`cargo fmt` is NOT in CI**, and `rustfmt --edition 2021` silently refuses this crate
  (workspace is edition 2024).

---

## 4. Running order

Ranked by measured harm. **§1.5 is the admin work and is listed first because it is what
was asked for.**

### A. The admin surface (see §1.5 for the full reasoning)

1. **Migrate the 9 remaining panels onto the kit.** Effort **L**. The one change that makes
   the board look wired.
2. **Stated reasons on every empty tab.** Effort **M**.
3. **`withObservability` on the four human-facing routes.** Effort **S** — cheapest
   high-yield item on the board.
4. **Admin layout contrast** — two moderation pages are unreadable today. Effort **M**.

### B. The board is red right now

5. **`cosmic-recipe` at 76.8% and falling**, p95 pinned at its own 10 s timeout. Decide
   whether the budget is wrong or the path is slow; measure where the time goes before
   raising the timeout. Effort **M**.
6. **`cron:prewarm-agent-recipes`, p95 50.5 s, no timeout gate** — cannot alert, and is now
   5× the next slowest probe. Effort **S** to gate, **M** to fix the latency.
7. **`chain-shop` "Shop burn audit hit 40 error(s)"**, hourly, new since the last handoff.
   Uninvestigated. Effort **?** — triage first.

### C. Security — needs the `AUTH_REVOCATION_CHECK` ruling in §5

8. **Three revocation runtime gaps.** #776 made the admin UI honest; it did **not** touch
   enforcement. (a) `sessionRevocation.ts:54-57` **fails open** — any Postgres error
   restores access to every revoked session (repeated at `auth.ts:598-601`). (b) The check
   is **skipped entirely** for a JWT with no `sessionId` (`auth.config.ts:167-168`), and
   both writers that set it are non-blocking — **a sign-in during any DB hiccup mints a
   permanently unrevocable 30-day JWT**. (c) The middleware matcher covers `/dev`,
   `/recipe-generator`, `/restaurant-creator`, `/premium-table` but `isProtected`
   (`auth.config.ts:144-149`) does not — revocation is never checked on the
   token-spending surfaces. **Fix (b) and (a) before turning the gate on.** `[CARRIED]`

### D. Gates that do not gate

9. ⚠️ **The bundle-size budget is structurally inert.** `scripts/check-route-sizes.cjs:3`
   reads **stdin**, but `package.json` wires it as `next build && bun scripts/...` — `&&`
   does not pipe. It prints "✅ All targeted routes passed" and exits **0** on empty input,
   and no workflow references it. ⚠️ Fixing the pipe **immediately turns CI red**: all 5
   budgeted routes are over threshold (`/menu-planner` 781.9 kB vs 400). Re-measure first —
   the numbers predate the thermal stack, and `/(alchm)/lab` gained five tabs and is not
   budgeted at all. `[CARRIED]`
10. **`scripts/checkKitchenSettingsSqlParses.ts` is wired to nothing** — a real PREPARE gate
    against live Postgres, invoked by no script and no workflow. One line + a CI step arms
    it. Effort **S**, high value. `[CARRIED]`
11. **Lint-debt auto-ratchet** — exits 1 on an increase, silent on a decrease; the baseline
    moves by hand. Because master is protected the ratchet must **open a PR**, not push.
    ⚠️ Account for the ±1 platform delta in §2.1. Effort **M**.

### E. Type safety — measure, do not land

12. **`as any` eslint ban** scoped to `constants`/`data`/`calculations`/`services`
    (**229 occurrences / 65 files** `[CARRIED]`). ⚠️ Not a copy-paste of the Math.random
    ratchet: the exempt list needs **65 files, not 14**, and `no-restricted-syntax` is a
    single rule key, so a second block reusing it would **silently disable the Math.random
    ban** on the 4 files carrying both. Design the config collision first.
13. **`executeQuery<T>` typed return** — throwaway worktree, report the fallout count and
    error *shapes*, then **stop and let the user choose**. `[CARRIED]`
14. **Four strict flags**, fallout counts each: `noUncheckedIndexedAccess`,
    `exactOptionalPropertyTypes`, `noImplicitOverride`, `useUnknownInCatchVariables`.
    ⚠️ `noUncheckedIndexedAccess` is **false**, which is why `no-unnecessary-condition`
    fires on correct runtime guards around index access — check whether the type is lying
    before deleting a guard; `.at(0)` is usually the honest fix. `[CARRIED]`

### F. Housekeeping

15. **32 worktrees pin branches already in master** — pure reclamation. `[CARRIED]`
16. **8 stale PRs** — read each diff, check it still applies, deliver land/rebase/close
    **with a reason**. ⚠️ **Merge and close nothing — the user signs off.**
17. **`kitchen_elevation_m` is 0 of 6,348 profiles.** ⚠️ Any reader treating a null
    elevation as sea level fabricates a basis for all of them. `[CARRIED]`
18. **The Stripe webhook answers 400 for every failure, including its own.**
    `src/app/api/stripe/webhook/route.ts` wraps the whole event switch in one `try/catch`
    returning **400** — the same code as a failed signature check. Retries are unaffected
    (Stripe retries on any non-2xx for up to three days, verified against its docs), so this
    is **not** a correctness bug. But a DB outage and a forged signature are
    indistinguishable in the dashboard. Split the `try`: signature stays 400, everything
    downstream becomes 500. ⚠️ Touches every event type in a money-critical route — its own
    PR, its own test. Effort **S**.
19. **`InstacartService.fetchNearbyRetailers` defaults to a hardcoded `"11375"`** — verified
    to have no callers, so wire it correctly *before* it becomes a live bug. `[CARRIED]`
20. **DURATION em-dash chip** — `cooking-methods/[method]/page.tsx:468-476` has a reasonless
    `"—"` on a **dead** branch (`duration` is non-optional; 27/27 registry methods have it).
    Delete the branch or give it a stated reason; needs its own test. `[CARRIED]`
21. **Retire the sphere eigenvalue conditioned budget at its source.** Regroup the residual
    to `S(λ) − Bi·sin λ` with a Taylor series for small λ — algebraically identical, puts
    the family under 1 ULP, lets the per-row budget be deleted. Must land in Rust, the
    TypeScript half, and the fixture together. Effort **M**. `[CARRIED]`

---

## 5. Needs the user (the agent cannot do these)

- **Set `ALERT_SLACK_WEBHOOK_URL`.** 406/407 alerts undelivered, all-time. It is a secret.
  Until this is set, **no alert reaches a human by any channel except email**.
- **Rule on `AUTH_REVOCATION_CHECK`** (blocks §4.C). Confirmed absent in prod. Cost: the
  Redis negative cache is deliberately non-authoritative, so enabling it adds a Postgres
  round-trip to **every protected request on the healthy path** — and it buys less than it
  looks like until gaps (a) and (b) are closed.
- **Decide the remaining env values:** `NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG` (prod currently
  falls back to a hardcoded `cookingwi03f1-20`), `STRIPE_RESTAURANT_ORDER_PRICE_ID`,
  `NEXT_PUBLIC_STRIPE_RESTAURANT_CRYPTO_ENABLED` (needs a **rebuild** — it is
  `NEXT_PUBLIC_`), and a dedicated **`BASE_RPC_URL`** before mainnet.
- **A first restaurant partner** (business + bank details — prohibited for the agent), or
  **`sk_test_*` + a test webhook secret**, which would let the agent run the whole ESMS
  chain end-to-end without touching real money. The test-mode path is the recommended one.
- ⚠️ **Zero human signups since 2026-08-06** (§1.4c). This is a product/growth question, not
  an engineering one, but it is why several admin panels look dead and it deserves a
  decision rather than a bug hunt.
- **Product call on `src/app/api/premium-table/route.ts`**: a recipe with no
  `alchemical_properties` gets a fabricated `{25,25,25,25}` and is then ranked on it; every
  result is labelled `"Harmonizes perfectly"` regardless of score; and
  `allRecipes.slice(0, 100)` truncates before ranking, so "Top 3" is top-3-of-an-arbitrary-100.
- **Commit `NEXT_SESSION_PROMPT.md`.** It has been uncommitted across multiple sessions and
  has been destroyed twice by `git reset --hard`.

---

## 6. Residual — what this does NOT cover

- **The admin UI has still never been seen logged in.** Google-only auth; no screenshot
  exists of #775's or #776's changes. Every claim in §1 rests on git history, the import
  graph, prod SQL, and unauthenticated route probes — **not** on looking at the page. The
  next session should open it if at all possible; one screenshot would confirm or refute
  §1.4 faster than any query.
- **The `/lab` tab has never been opened in a browser** either. The physics is proven
  cross-platform; the rendering is not observed.
- **§2.3 (production env) was not re-measured this session** — carried from 08-18.
- **~110 of 121 admin audit findings** remain, and the two docs disagree on the total (§1.5).
- **The Stitch styling revamp** — brief at `docs/design/admin-stitch-prompt.md`, zero code.
  Stitch's own output was not usable as-is.
- Whether branch protection actually **blocks a red PR** — still unobserved, deliberately.
- **313 local branches vs 130 remote.** Counted, never read. Most are stale; the sweep in
  §1.1 only asked about admin paths.
- **Bundle numbers in §4.D.9** are from a local dev build on a feature branch, gzip-summed.
  Ratios are sound; absolute kB ±10%.
- The three unselected backlog items: **auth SPOF second sign-in path** (all 21 device
  sessions are `provider='google'`), **custody flip**, **operator gas watch**.
- **Any claim in `memory/` older than a few days.** Several were corrected on 08-18/19.
