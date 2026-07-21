> ⚠️ **Written 2026-07-21. Verify every concrete claim against `git log` / `gh pr
> list` / the live DB before acting** — root `NEXT_SESSION_PROMPT_*.md` files have a
> track record of lagging reality (it's in memory). The authoritative record is
> `docs/physics/SYNTHESIS_MODEL.md` (§18 especially) and the
> `synthesis-model-completion` memory. Read those first; this is a pointer.

# Next session — §18: make the agent monica real

Branch **`docs/synthesis-model`**, PR **#627** (base `master`). **Do NOT merge
#627 yet** — merge it after the §18 MVP lands (below), as the complete
"engine reconciled + agent monica real" unit.

## FIRST, protect the session

- ⚠️ **A concurrent session shares this workdir** and clobbered work last time
  (`git checkout .` mid-edit, restoring deleted files, unstaging). **Start in a
  git worktree** for `docs/synthesis-model`. If you must stay in the main checkout,
  do every change as edit+add+commit in ONE command and re-check `HEAD` after.
- `alchemicalSamples.json` is **minified (one line)** → `git --stat` shows "1 line"
  for any change; inspect values.
- **Run the full suite before committing** shared-physics/data changes.

## Where §17c/§18 stand (all green: 157 suites / 1300 tests, typecheck clean)

The engine reconciliation (**§17c**) is done and live: canonical
`data/unified/alchemicalCalculations.ts` with a totality contract (never NaN/null;
degenerate → 0 / kalchm 1.0 / **monica φ=1.618**); reactivity fixed to
`(Matter+Earth)²` everywhere incl. `RealAlchemizeService` (both sites, monica now
delegates to canonical); data regenerated (samples, hsca); priors recalibrated;
dead engines deleted. Browser-verified.

**§18 single-body calc is built and tested**: `src/utils/agentMonica.ts` →
`agentMonica(planet, sign, degree)` returns `{diurnal, nocturnal, combined}`, all
finite. NOT yet wired.

## THE MVP (this marks next session a success)

Rename the malformed moon agents → single-body backfill (~3600) → write-fix (3
sites). Two-body phase + encounter rules are same-program **follow-ups**, not the
gate.

**Key principle (user):** a planetary agent IS a single placement, agentified —
**no birthchart** (the 3600 empty `natal_chart` `[]` are CORRECT). Read its config
from the NAME, not a chart.

### 1. Apply the staged migration (start here)
`database/init/70-agent-monica-sects.sql` adds `monica_diurnal` + `monica_nocturnal`
(nullable, idempotent). Run the `ALTER TABLE` against prod, confirm the columns.
`monica_constant` becomes their average (`combined`).

### 2. Rename malformed moon agents → canonical, THEN one backfill
Four moon families today; migrate to **two** canonical forms:
- `Moon <Sign> <Deg>` (bare placement, like `Mercury Aquarius 16`) → single-body.
- `<Phase> Moon in <Sign> <Deg>` (phase agents) → two-body.

Rename these onto the canonical forms (the `N` is the absolute ecliptic degree,
1–360 → `N/30` sign, `N mod 30` degree):
- `Moon Agent N` (360) → `Moon <Sign> <Deg>`
- `Moon Phase <phase> N` (85) → `<Phase> Moon in <Sign> <Deg>`

### 3. Backfill ~3600 planetary agents (dry-run first)
- Parse planet/sign/degree from the name (tolerant regex), call `agentMonica`,
  write all three columns.
- **Dry-run**: compute everything, print the distribution + unparseable list +
  rename list, write NOTHING. Review, then a transactional, idempotent write.
- Unparseable rows: skip + log + leave NULL (don't guess).
- DB access: `railway run --service Postgres -- node x.mjs` with
  `DATABASE_PUBLIC_URL` (pg, `ssl:{rejectUnauthorized:false}`). **Writes need the
  user present.**
- **Verify**: 0 non-finite; sane distribution (~[−4,4], no sentinel clustering);
  every parseable agent has all 3 columns non-NULL; spot-check 5–10 known agents
  vs a hand-computed `agentMonica`. Report before/after.

### 4. Write-fix — all 3 sites, one shared function
- `src/app/api/agents/unified/route.ts:173`, `philosophers-stone/page.tsx:199`
  (both fake longitude-average): call `agentMonica`.
- `src/app/api/economy/sync-debit/route.ts:182`: **compute WTEN-side** from the
  agent's own name/config, don't trust the AlchmAgentsETH payload.

### 5. Update `persona.test.ts:92-93`
It asserts `monicaConstant ∈ [0,10]`; the real monica is ~[−4,4] (can be negative).
Update the range in the same change.

### 6. Junk cleanup
Remove obvious test/non-agent rows — `Alchemical Chef`, `Pa Prod Smoke …`,
`Test …` — reporting the list first.

## Follow-ups (same §18 program, after the MVP)

- **Two-body phase monica** (720 phase moon agents): the phase fixes the Sun's
  approx longitude (New=conjunct, Full=opposite); build ESMS from BOTH bodies
  (each sect-resolved + vessel) → canonical thermo. A real two-body monica.
- **Dignity-encounter rules** (planetary agents interacting): **aspect-modulated
  dignity** — the angular relationship between two agents' degrees scaled by each
  one's dignity. ⚠️ **Gated on §14d step 3** (orb + aspect-strength unification) —
  can't build until aspect strength is single-valued.
- **Synthesized/historical agents** (434 real people — Poe, Mozart, Cicero…): a
  **full-chart** monica (71 have charts; 363 need charts computed first).

## Lower-priority / opportunistic

- **3 deferred dead-exports** (re-verify live/dead at deletion time): `core-energy-
  rules.ts` `GregsEnergyCalculator` (file LIVE via galileo-logger — per-symbol),
  `alchemicalEnergyMapping.ts` (constants-barrel re-export), `UnifiedRecommendation
  Service.ts` (+its test). Fold in when next touching those files.
- **`scripts/generateHistoricalEchoSamples.ts`** has the same `new Date()` churn —
  give it the `--anchor` treatment if/when its data is regenerated.
- **34 `" 2."` duplicate files** — untracked, build-excluded (tsconfig `**/* 2.*`),
  harmless; local cleanup only.
- Cross-repo FBD items (Pentacles, PlanetaryAgents) live in the `planet-fbd-cards`
  memory.
