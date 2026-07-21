> ⚠️ **Written 2026-07-21. Verify every concrete claim against `git log` / `gh pr
> list` before acting** — root `NEXT_SESSION_PROMPT_*.md` files have a track record
> of lagging reality (it's in memory). The authoritative record is
> `docs/physics/SYNTHESIS_MODEL.md` and the `synthesis-model-completion` memory —
> read those first; this file is a pointer, not the source of truth.

# Next session — finish §18 (agent monica) on the reconciled engine

Branch **`docs/synthesis-model`**, PR **#627** (base `master`). All work below is
on that branch; keep committing there. **Do NOT merge #627 yet** (user's call).

## Where things stand (2026-07-21)

The thermodynamic engine reconciliation (**§17c**) is functionally complete — the
live paths now agree:

- Canonical module `src/data/unified/alchemicalCalculations.ts` has a **totality
  contract**: never NaN/null; degenerate → 0 (ratios) / 1.0 (kalchm) / **φ=1.618**
  (monica); two tunable epsilons (`KALCHM_EPSILON`, `MONICA_LN_EPSILON`).
- Reactivity fixed everywhere to `(Matter+Earth)²` (was the divergent `(Σ/M)+Earth²`,
  9.09→2.05): `RealAlchemizeService` (both sites), `gregsEnergy.ts`, `api/alchemize`.
  `RealAlchemizeService` monica now delegates to the canonical `calculateMonica`.
- Data regenerated on the fixed engine: `alchemicalSamples.json` (generator made
  deterministic via `--anchor`), `hsca.ts` (the sixth forked engine eliminated).
  Compat priors recalibrated.
- Dead forked engines deleted (Phase 1). **3 deferred** — see below.
- **§18 calc built**: `src/utils/agentMonica.ts` + 7 parity tests. Pure, tested,
  NOT yet wired.
- Browser-verified `/planetary-chart` + `/api/alchm-quantities`: finite, canonical.

Full suite green: **157 suites / 1300 tests**, typecheck clean.

## THE next task: §18 write-fix + backfill (agent monica)

The DB holds **3672 fake agent monica values** (agent-only, 0 humans affected — see
§14c-ter). Replace them with the real `agentMonica()` calc. All the pieces exist;
this is wiring + a backfill.

1. **Migration is already staged**: `database/init/70-agent-monica-sects.sql` adds
   `monica_diurnal` + `monica_nocturnal` (nullable, idempotent). `monica_constant`
   becomes their average (§18e). Confirm it's applied to prod before backfilling.
2. **One shared write path** from `agentMonica(planet, sign, degree)`
   (`src/utils/agentMonica.ts` — returns `{diurnal, nocturnal, combined}`). Wire it
   into the **three** current fake-monica write sites:
   - `src/app/api/agents/unified/route.ts:173` (longitude-average → real calc)
   - `src/app/(alchm)/philosophers-stone/page.tsx:199` (same fake formula)
   - `src/app/api/economy/sync-debit/route.ts:182` (COALESCE'd upstream value)
   A planetary agent is `"<Planet> <Sign> <Degree>"` — parse planet/sign/degree from
   the name (or the natal chart) and call `agentMonica`.
3. **Backfill** the ~3672 agent rows: read-only pattern is
   `railway run --service Postgres -- node x.mjs` with `DATABASE_PUBLIC_URL`
   (pg, `ssl:{rejectUnauthorized:false}`). Compute per agent from its name/chart,
   write all three columns. **DB writes need the user present.**
4. **`src/lib/agents/persona/__tests__/persona.test.ts:92-93` WILL BREAK** — it
   asserts `monicaConstant` in `[0,10]`; the real thermodynamic monica is ~[-4,4]
   (can be negative). Update it to the new range in the same change.
5. Moon-phase agents (53) get a phase-weighted two-body monica; synthesized/
   historical agents (434) get full-chart monica (§18d). Can be a follow-up.

## Other open items (lower priority)

- **3 deferred dead-exports** (re-verify live/dead at deletion time — the audit is a
  lead, not a warrant): `core-energy-rules.ts` `GregsEnergyCalculator` (file is LIVE
  via galileo-logger `ANumberCalculator` — per-symbol removal), `alchemicalEnergyMapping.ts`
  (re-exported through the `constants` barrel), `UnifiedRecommendationService.ts`
  (imported by a test — delete both).
- **`scripts/generateHistoricalEchoSamples.ts`** has the same `new Date()` churn as
  the samples generator — give it the same `--anchor` treatment.
- **34 `" 2."` duplicate files** (untracked, build-excluded via tsconfig `**/* 2.*`)
  — local cleanup; a background audit was running. Not in git, so harmless.
- Cross-repo FBD items (**Pentacles** port, **PlanetaryAgents** call-graph) live in
  the `planet-fbd-cards` memory, not here.

## Gotchas (learned the hard way this session)

- ⚠️ **A concurrent session shares this workdir** and ran `git checkout .` mid-edit,
  restoring deleted files and unstaging. Do `git rm && git commit` (and risky edits)
  **atomically in one command**; re-check `HEAD` and `git status` after. Consider a
  worktree.
- `alchemicalSamples.json` is **minified (one line)** → `git --stat` shows "1 line"
  for any change. Inspect values, not the stat.
- Run the **full suite before committing** a change to shared physics (a prior
  recalibration broke `physicsModule.test.ts` and the commit went through anyway
  because `bun run test` and `git commit` were separate lines).
- `alchemize`'s ESMS is **sect-dependent** (shifts by season) — fix a date in any
  characterization test.
