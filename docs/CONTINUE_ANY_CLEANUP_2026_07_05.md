# Continuation prompt: TypeScript any-cleanup campaign

Paste this to start the next session.

---

Continue the TypeScript explicit-`any` cleanup campaign in the WhatToEatNext repo. **Start by reading `docs/LINTING_SITUATION_NEXT_SESSION.md` in full** — it is the authoritative, continuously-updated log of every file touched, every reviewer finding, and two hard-won process lessons from this session that you must not relearn the expensive way:

1. **Never let parallel agents run destructive git commands** (`git stash`, `git checkout <path>`, `git reset`) against the shared working tree for their own "sanity checks." One agent's `git stash` wipes every sibling agent's concurrent uncommitted edit — this caused a 76%-phantom-diff wave before it was caught and fixed. Only read-only git commands (`git diff`, `git show`, `git status`, `git log`) are safe inside a workflow with concurrent agents.
2. **Never trust an agent's self-report as proof a change landed.** Every implement-stage agent must end with a fresh `git diff` and base its report on that, not memory. Every file must get an independent adversarial review that itself starts with a fresh `git diff`. Then, before you personally trust a workflow's "fixed" list, independently re-check `git status` / re-scan the actual files yourself — this session found reviewer-confirmed PASSes that had already been silently reverted by the time the workflow's final result was returned.
3. **Keep waves small** (~10 files, not 30+). Wall-clock duration is the biggest predictor of disruption risk — a 3-hour wave had a 76% phantom rate; 10-minute waves that followed had 0-14%.
4. **Commit after every wave's full verification gate passes** (typecheck + `eslint --max-warnings=0` + `bun run test` + `git diff --check`, all green) before starting the next wave. Don't let uncommitted campaign work accumulate — this branch had two separate incidents where uncommitted work got swept into a stash by a concurrent process; commits are the only durable checkpoint.

## Current state (as of 2026-07-05)

- Repo-wide explicit-any matches: **2334 → 1302** (44% reduction) across ~60 files this session.
- All of that work is merged into `master` via PR [#582](https://github.com/gregcastro23/WhatToEatNext/pull/582) (merge commit `7eed45a7`). Start fresh from `master`, or continue on a new branch off it — `feat/restaurant-best-match-explorer` has been merged repeatedly (PRs #571, #572, #574, #582) and re-used as a long-lived staging branch for this repo's session-to-session work, so either following that pattern or cutting a fresh branch is fine.
- Re-run the inventory scan before picking targets — the counts below will have drifted:

```bash
rg "as any|: any|any\[\]|<any>" src \
  --glob '!**/*.test.ts' --glob '!**/*.test.tsx' --glob '!**/__tests__/**' -n \
  | cut -d: -f1 | sort | uniq -c | sort -nr | head -20
```

## Immediate next targets

- `src/lib/monitoring/prometheus-metrics.ts` — attempted twice, wiped both times by the git-stash collision bug (now fixed); should be a clean, easy win on retry.
- `src/utils/menuPlanner/nutritionalCalculator.ts` — correctly self-skipped twice (reachable within 2 hops of the live `/menu-planner` page) — worth a properly cautious, individually-reviewed attempt rather than a routine wave item.
- `src/types/alchemy.ts` — **do not put this in a routine wave.** ~279 importers across the entire codebase, the widest fan-out found all session. Needs its own dedicated, heavily-reviewed pass with narrow, one-field-at-a-time changes.

## Confirmed high-risk — do not include in routine "safe file" waves without dedicated care

`src/app/api/**` (all routes), `src/app/**/page.tsx`/`layout.tsx`/`*Client.tsx`, `src/contexts/**`, `src/calculations/**`, `src/server/**`, `src/lib/auth/**`, `src/lib/database/**`, `src/utils/monicaKalchmCalculations.ts`, `src/services/RealAlchemizeService.ts`, `src/services/AlchemicalTransformationService.ts`, `src/services/UnifiedScoringService.ts`/`UnifiedScoringAdapter.ts`, `src/services/AlchemicalRecommendationService.ts`, `src/services/RecipeService.ts`, `src/data/unified/recipeBuilding.ts`, `src/data/unified/flavorProfileMigration.ts`, `src/components/profile/ProfileBlockRegistry.tsx` (+ `AgentProfile.tsx` in the same route dir), `src/utils/menuPlanner/recommendationBridge.ts`, `src/data/ingredients/fruits/index.ts`, `src/data/unified/ingredients.ts`, `src/data/ingredients/spices/index.ts`, `src/services/planetaryScoring.ts`, `src/components/recipe/CosmicRecipeGenerator.tsx`, `src/services/LoggingService.ts` (28 importers — though its remaining `any`s are legitimately documented, not broken), `src/utils/safeAstrology.ts`, `src/utils/calculationCache.ts`, `src/components/RecipeCard.tsx`, `src/services/astrologizeApi.ts`/`AstrologizeApiCache.ts`, `src/lib/enhanced-astronomical-calculator.ts`, `src/hooks/useAstrologicalState.ts`, `src/data/unified/unifiedFlavorEngine.ts`, `src/utils/dynamicImport.ts`, `src/utils/astrologyDataProvider.ts`, `src/services/AlchemicalApiClient.ts`.

Confirmed **dead code** (safe to fix or delete, low urgency either way): `src/components/CuisineRecommender.tsx` (superseded by `DynamicCuisineRecommender.tsx`), `src/utils/naturalLanguageProcessor.ts`, `src/services/UnifiedRecommendationService.ts`, `src/services/astrologyApi.ts`, `src/services/ConfigurationService.ts`, `src/utils/signVectorAdapters.ts`, `src/components/PlanetaryHourCard.tsx` (its `any` casts mask a real underlying API mismatch, not just missing types — a proper fix means fixing that bug too, which is out of scope for a types-only pass).

## Workflow pattern that's working well

Self-gating 3-stage pipeline (investigate → implement → review) via the `Workflow` tool, ~10 files per wave:
- **Investigate**: each file checks its own blast radius first (importers, 2-hop reachability into live routes/pages/core-calc-cluster) and returns `skip: true` with a reason if too risky, instead of a fix plan.
- **Implement**: applies the plan, preserves any latent bugs a cast might be masking (never silently "fix" a bug found mid-refactor — document it and ask, don't just do it), ends with a fresh `git diff` check.
- **Review**: independent agent, starts with its own fresh `git diff`, re-runs eslint/typecheck/grep itself, flags both typing regressions and behavior changes.

After the workflow returns: **you** independently check `git status` + a targeted any-count scan against the "fixed" list before trusting anything, then run the full verification gate, then commit.

Full per-file history, every reviewer finding, and the exact incidents referenced above are in `docs/LINTING_SITUATION_NEXT_SESSION.md`.
