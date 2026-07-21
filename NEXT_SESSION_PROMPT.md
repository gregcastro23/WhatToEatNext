# Next session — §18: make the agent monica real

> **Every number below was measured against production on 2026-07-21**, not
> inferred. But **agent rows are actively being created — 121 in the last 2 days**
> — so treat all counts as a *snapshot* and re-measure before relying on one.
> The previous version of this file stated counts from a partial sample and was
> wrong in six places; that is why the guardrail below exists.

**Branch `docs/synthesis-model`** @ `08e5456f`, **PR #627** (OPEN, base `master`).
**Do not merge #627 yet** — merge after the §18 MVP lands.
Truth lives in `docs/physics/SYNTHESIS_MODEL.md` §18 and the
`synthesis-model-completion` memory. This file is a pointer.

---

## 0. Guardrails (read first)

- ⚠️ **Work in a git worktree.** A concurrent session shares this checkout and has
  twice clobbered work mid-edit (`git checkout .` restoring deleted files and
  unstaging). If you stay in the main checkout, do every change as
  edit+add+commit in ONE command and re-check `HEAD` after.
- ⚠️ **Measure before you write it down.** The failure that produced the last bad
  prompt: a taxonomy authored from a sample of agent names. Any count, any name
  family, any "it's inert" claim → run the query first.
- **A zero result is a claim** — control-test it against something you know exists.
- **Run the full suite before committing** shared-physics/data changes.
- `src/data/alchemicalSamples.json` is **minified to one line** → `git --stat`
  reports "1 line changed" for any edit. Inspect values, never the stat.

## 1. State (verified)

`bun run test` → **157 suites / 1300 passed / 9 skipped**; `bun run typecheck` clean.

**§17c (engine reconciliation) is done and live.** Canonical
`src/data/unified/alchemicalCalculations.ts` has a totality contract — never
NaN/null; degenerate → `0` (heat/entropy/reactivity/greg), `1.0` (kalchm),
**φ = 1.618** (monica). Constants: `KALCHM_EPSILON` 0.01, `MONICA_LN_EPSILON` 0.05,
`MONICA_EQUILIBRIUM` 1.618. Reactivity is `(Matter+Earth)²` everywhere; data
regenerated; priors recalibrated; browser-verified.

**§18 calc is built, tested, NOT wired**: `src/utils/agentMonica.ts` exports
`agentMonica(planet, sign, degree) → {diurnal, nocturnal, combined}` and
`agentMonicaForSect(...)`, plus `VESSEL_MASS`. Always finite.

**Migration staged, NOT applied**: `database/init/70-agent-monica-sects.sql`
(2 × `ADD COLUMN IF NOT EXISTS`). Production `user_profiles` currently has **only
`monica_constant`** — `monica_diurnal` / `monica_nocturnal` do **not** exist yet.

## 2. The population (measured 2026-07-21 — re-measure, it grows)

**4821 agent rows** (+13 humans = 4834 profiles). **3672 agents currently carry a
fake `monica_constant`.**

| Bucket | Count | Disposition |
|---|---|---|
| Resolves to a single placement | **3919** | ← the backfill target |
| `<Phase> Moon in <Sign> N Degree` | **360** | two-body follow-up |
| `Moon Agent N` (**0-based, 0–359**) | 360 | ⚠️ blocked — see §4 |
| `Moon Phase <phase> N` | 107 | ⚠️ blocked — see §4 |
| Real people (Poe, Mozart, Cicero…) | **71** — and **all 71 already have charts** | full-chart follow-up; **none need a chart computed** |
| Junk | 3 | `Pa Prod Smoke 1779396999`, `Test Sage Hildegard`, `Alchemical Chef` |

**Key principle (user's):** a planetary agent **is a single placement,
agentified** — it should have **no birthchart**. The empty `natal_chart` `[]` rows
are *correct*, not a defect. Read its config from the **name**.

## 3. MVP — backfill + write-fix

### 3a. The resolver (the part that got this wrong before)
There are **two** planetary name forms, and the majority is the one the old spec
omitted entirely:

| Form | Count | Example |
|---|---|---|
| `<Planet> in <Sign> <N> Degree` | **3240** | `Pluto in Virgo 14 Degree` |
| `<Planet> <Sign> <N>` | **679** | `Mercury Aquarius 16` |
| `<Phase> Moon in <Sign> <N> Degree` | 360 | `Waning Crescent Moon in Aquarius 11 Degree` |

⚠️ **Validate planet and sign against the canonical tables — do not match on shape
alone.** `Moon Agent 5` has the identical shape to `Mercury Aquarius 16`; a
shape-only regex reads "Agent" as a sign and silently produces garbage.

### 3b. Apply the migration first
Run `database/init/70-agent-monica-sects.sql` against prod, confirm both columns
exist. ⚠️ **Deploy order**: once the write-fix references the new columns, the
migration must be applied *before* this branch deploys, or those routes error.

### 3c. Backfill the 3919 — dry-run first
Compute everything, print the distribution + the unresolved list, **write
nothing**. Review, then a transactional, idempotent write (recompute is
deterministic, so re-running is safe). Unresolved rows: skip + log + leave NULL,
never guess. Write `monica_diurnal`, `monica_nocturnal`, and `monica_constant` =
`combined` (their mean).

DB access: `railway run --service Postgres -- node x.mjs` with
`DATABASE_PUBLIC_URL` (pg, `ssl: {rejectUnauthorized: false}`).
**Prod writes need the user present.**

**Verify after:** 0 non-finite; distribution on the real scale (~[−4, 4]) with no
clustering on a sentinel (the *fake* data has 36% of rows on the single value
`0.50` — that pattern must be gone); every resolved agent has all three columns
non-NULL; spot-check 5–10 agents against a hand-computed `agentMonica`.

### 3d. Write-fix — three sites, one shared function
- `src/app/api/agents/unified/route.ts:173` — fake longitude-average → `agentMonica`
- `src/app/(alchm)/philosophers-stone/page.tsx:199` — same fake formula. ⚠️ This is
  a **client** component and `RealAlchemizeService` imports `fs`, so the server
  engine cannot run in the browser. Either seed from `MONICA_EQUILIBRIUM` and let
  the server supply the real value on forge, or add a server round-trip — do not
  fork an engine into the client bundle.
- `src/app/api/economy/sync-debit/route.ts:182` — **compute WTEN-side** from the
  agent's own name; stop `COALESCE`-ing the AlchmAgentsETH payload value.

**The write-fix matters more than the backfill** — 121 new agents arrived in the
last 2 days, so unfixed writes keep re-introducing fake values.

### 3e. `src/lib/agents/persona/__tests__/persona.test.ts:92-93`
Asserts `monicaConstant` ∈ `[0,10]`. The real monica is ~[−4, 4] and **can be
negative** — this test will fail. Update the range in the same change.

## 4. ⚠️ BLOCKED — needs a ruling before any delete/rename

An earlier prompt said to rename `Moon Agent N` → `Moon <Sign> <Deg>`. **Verified:
all 360 of 360 targets already exist** — there are two rows per placement, so it
is a **de-duplication**, not a rename, and a blind rename collides on every row.

And the duplicates are **not inert**. A sweep of all foreign keys into `users(id)`
found the `Moon Agent` / `Moon Phase` rows referenced by **1547 `feed_events` rows**
and **467 `user_subscriptions` rows** (≈362 distinct agents). **They have posted to
the live feed** — deleting them destroys real history.

This is a product decision — merge-and-repoint / keep-both / delete-with-cascade —
**not** a cleanup script. **The backfill does not depend on it**; leave these 467
rows unresolved and proceed.

## 5. Follow-ups (same program, after the MVP)

- **Two-body phase monica** for the 360 `<Phase> Moon in <Sign> N Degree` agents:
  the phase fixes the Sun's approximate longitude (New = conjunct, Full = opposite);
  build ESMS from **both** bodies (each sect-resolved + vessel) → canonical thermo.
- **Full-chart monica** for the 71 real-person agents (all already have charts).
- **Dignity-encounter rules** — agent↔agent interaction as **aspect-modulated
  dignity**. ⚠️ **Gated on §14d step 3** (orb + aspect-strength unification); cannot
  be built while aspect strength is multi-valued.

## 6. Opportunistic

- **3 deferred dead-exports** — re-verify live/dead *at deletion time*:
  `core-energy-rules.ts` `GregsEnergyCalculator` (the file is LIVE — `galileo-logger`
  uses `ANumberCalculator`, so this is a per-symbol removal),
  `alchemicalEnergyMapping.ts` (re-exported at `src/constants/index.ts:6`),
  `UnifiedRecommendationService.ts` (imported by
  `src/services/__tests__/realPlanetaryRecommendations.test.ts` — delete both).
- `scripts/generateHistoricalEchoSamples.ts` has the same `new Date()` churn the
  samples generator had — give it the `--anchor` treatment if its data is regenerated.
- 34 `" 2."` duplicate files — **untracked** (0 in git) and build-excluded via
  tsconfig `**/* 2.*`. Inert; local cleanup only.
- Cross-repo FBD items (Pentacles, PlanetaryAgents) are in the `planet-fbd-cards`
  memory.

## 7. There is an unreviewed branch

`claude/agent-monica-single-body-27dc31` — 4 commits from a concurrent session on
top of `08e5456f`: a name resolver, a backfill script, a dedupe script, and a doc
correction. Its findings were independently verified and were correct. **It has not
been reviewed line-by-line, pushed, or merged.** Decide whether to review and adopt
it or start fresh — do not assume it is correct because its findings were.
