# Linting Situation Next Session Prompt

Use this document as the opening prompt/context for the next TypeScript linting cleanup session.

## Current State

The current branch is `feat/restaurant-best-match-explorer`.

Recent cleanup completed:

- Fixed the deployment-blocking Jest issue caused by importing `bun:test` in a Jest test.
- Reduced suppressed ESLint warnings from `125` to `77`.
- Reduced TypeScript ESLint suppressed warnings from `47` to `0`.
- Kept active ESLint warnings at `0`.
- Centralized legacy naming exceptions in `eslint.config.mjs`.
- Removed stale unused compatibility interfaces/type aliases and dead duplicate tarot data.
- Added typed DB row boundaries in several services:
  - `src/services/TokenEconomyService.ts`
  - `src/services/QuestService.ts`
  - `src/services/StreakService.ts`
  - `src/services/authEventsService.ts`
  - `src/services/FoodDiaryService.ts`
  - `src/services/commensalDatabaseService.ts`
  - `src/services/notificationDatabaseService.ts`
  - `src/services/userDatabaseService.ts`
- Replaced several callback `any` usages in:
  - `src/app/api/auth/sessions/route.ts`
  - `src/lib/degree-agent-matcher.ts`
  - `src/lib/mcp/synastryTools.ts`

Verification already passed after this campaign:

```bash
bun run typecheck
bunx eslint --config eslint.config.mjs src --max-warnings=0
bun run test --passWithNoTests
git diff --check
bun run build
```

The production build completes successfully but still emits pre-existing dependency warnings around optional wallet modules from Privy/Reown/x402/viem.

## Current Inventory Commands

Use these to re-check the situation before starting the next pass:

```bash
bun run typecheck
bunx eslint --config eslint.config.mjs src --max-warnings=0
node - <<'NODE'
const { spawnSync } = require('node:child_process');
const result = spawnSync('bunx', ['eslint', '--config', 'eslint.config.mjs', 'src', '--format=json', '--max-warnings=10000'], {
  encoding: 'utf8',
  maxBuffer: 1024 * 1024 * 50,
});
if (result.error) throw result.error;
const rows = result.stdout.trim() ? JSON.parse(result.stdout) : [];
const active = [];
const suppressed = [];
const tsSuppressed = [];
for (const file of rows) {
  for (const message of file.messages || []) if (message.severity === 1) active.push({ filePath: file.filePath, ...message });
  for (const message of file.suppressedMessages || []) {
    const item = { filePath: file.filePath, ...message };
    suppressed.push(item);
    if (String(message.ruleId).startsWith('@typescript-eslint/')) tsSuppressed.push(item);
  }
}
console.log(`active=${active.length}`);
console.log(`suppressed=${suppressed.length}`);
console.log(`typescriptSuppressed=${tsSuppressed.length}`);
NODE
```

To find the next explicit-any hotspots:

```bash
rg "as any|: any|any\\[\\]|<any>" src \
  --glob '!**/*.test.ts' \
  --glob '!**/*.test.tsx' \
  --glob '!**/__tests__/**' -n \
  | cut -d: -f1 \
  | sort \
  | uniq -c \
  | sort -nr \
  | head -20
```

At the time this document was written, that production-code scan found about `2334` explicit-any-like matches. The largest clusters were:

```text
110 src/components/recommendations/EnhancedIngredientRecommender.tsx
 73 src/utils/ingredientRecommender.ts
 60 src/services/UnifiedIngredientService.ts
 59 src/components/cuisines/CurrentMomentCuisineRecommendations.tsx
 55 src/utils/alchemicalPillarUtils.ts
 35 src/data/ingredients/fruits/index.ts
 35 src/utils/cookingMethodRecommender.ts
 33 src/utils/astrologyUtils.ts
 33 src/utils/recommendation/methodRecommendation.ts
 31 src/data/recipes.ts
 30 src/data/cuisineFlavorProfiles.ts
 27 src/services/RecommendationAdapter.ts
 27 src/utils/recipeMatching.ts
 24 src/services/ElementalCalculator.ts
 24 src/utils/foodRecommender.ts
```

## Recommended Next Optimizations

1. Keep `@typescript-eslint/no-explicit-any` disabled globally for now.
   Turning it on globally would be too noisy. Instead, add targeted overrides for cleaned subtrees after each pass.

2. Create shared DB row helper utilities.
   Several services now have local helpers like `toNumber`, `toIsoString`, `readJsonColumn`, and row interfaces. A small shared module could reduce repetition once the pattern settles.

3. Attack one high-value subtree at a time.
   Good candidates:
   - `src/services/UnifiedIngredientService.ts`
   - `src/services/RecommendationAdapter.ts`
   - `src/services/ElementalCalculator.ts`
   - `src/utils/recommendation/*`
   - `src/components/recommendations/EnhancedIngredientRecommender.tsx`

4. Prefer domain types over casts.
   For example, many casts are indexing elemental, nutritional, planetary, recipe, or ingredient objects. Add local `Record<...>` types, type guards, or normalizers instead of widening to `any`.

5. Add lint sub-commands for campaign work.
   Consider package scripts for:
   - lint all with zero warnings
   - lint changed files
   - lint a single subtree with stricter `no-explicit-any`
   - output suppression inventory

6. Continue reducing non-TypeScript suppressions.
   Total suppressions are now `77`. TypeScript suppressions are `0`, so the next suppression cleanup should focus on ordinary ESLint disables and whether they are still necessary.

## Suggested Opening Prompt For The Next Chat

```text
Continue the TypeScript linting improvement campaign in this repo. Start by reading docs/LINTING_SITUATION_NEXT_SESSION.md and checking the current git status. The active lint state should be clean: ESLint active warnings 0, TypeScript ESLint suppressions 0, total suppressions around 77.

Do not turn on no-explicit-any globally. Pick one narrow production-code hotspot from the explicit-any scan, preferably a service or utility with low UI blast radius. Replace casts with local domain types, type guards, or normalizers. Keep edits scoped, preserve behavior, and run:

bun run typecheck
bunx eslint --config eslint.config.mjs src --max-warnings=0
bun run test --passWithNoTests

If the change is broad or touches app routing/build behavior, also run bun run build. Summarize before/after counts and any remaining risk.
```
