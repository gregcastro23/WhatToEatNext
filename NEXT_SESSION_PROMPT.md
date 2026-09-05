# Next Session: Phase 24 — Type Safety Cleanliness, Cast Surface Pruning & Unsafe Rules Hardening

> **Status of Phase 23:** Complete, verified, committed on branch `refactor/phase-23-require-await`.
> Commits:
> - `31014233`: `chore(tooling): delete 9 unreferenced build, QA and legacy UI modules`
> - `33e9e138`: `refactor(lint): de-async 27 remaining require-await sites`
> - `14be3468`: `chore(lint): ratchet baseline via --ratchet`
>
> | Metric | Before (P22) | After (P23) | Δ |
> |---|---:|---:|---:|
> | Tracked lint debt | 2,701 | **2,630** | **−71** |
> | — `@typescript-eslint/require-await` | 46 | **0** | **−46** (100% eliminated) |
> | — `@typescript-eslint/no-unsafe-member-access` | 257 | **250** | **−7** |
> | — `@typescript-eslint/no-unnecessary-condition` | 1,276 | **1,271** | **−5** |
> | — `@typescript-eslint/no-unsafe-assignment` | 272 | **267** | **−5** |
> | — `@typescript-eslint/no-unsafe-call` | 26 | **23** | **−3** |
> | — `@typescript-eslint/no-explicit-any` | 205 | **203** | **−2** |
> | — `@typescript-eslint/no-unsafe-argument` | 96 | **95** | **−1** |
> | — `@typescript-eslint/no-unsafe-return` | 54 | **53** | **−1** |
> | — `no-useless-assignment` | 52 | **51** | **−1** |
> | PNC sub-baseline | 294 | **294** | **0** (Defended) |
> | Cast surface | 255 | **252** | **−3** |
> | — `as any` / `as unknown as` | 68 / 187 | **67 / 185** | **−1** / **−2** |
> | — Production / Test | 223 / 32 | **220 / 32** | **−3** / 0 |
> | Assertion sites (AST) | 4,373 | **4,357** | **−16** |
> | — Production / Test | 3,749 / 624 | **3,733 / 624** | **−16** / 0 |
> | — `as any` sites | 66 | **65** | **−1** |
> | Declined pool | 6,302 | **6,236** | **−66** |
>
> Gates: `bun run test:gates` 50/50 · `bun run strict-index:check` 0 errors · `bun run typecheck` 0 errors · `CI=1 bun run test` 331/331 suites passed (3462/3472 tests) · `bun run build` 0 errors.

---

## 0. Lessons & Operational Realities from Phase 23

### `require-await` Reached Zero
- All `@typescript-eslint/require-await` warnings across the repository have been pruned to 0.
- Mechanical throw-partition rules kept promise contracts identical:
  - If the function body can throw before or outside a `try`, wrap in `return Promise.resolve().then(() => { ... })`.
  - If inside `try/catch` and returning a value, `return Promise.resolve(value)`.
  - Pure internal handlers (e.g. `handleStarClick`, `loadIngredients`, `updateMetrics`) are de-async'd directly and their unawaited `void` callers dropped.

### Dead Tooling Deletion Safety
- Deleting 9 unreferenced legacy tooling files dropped 4,460 lines of dead code and eliminated 2 `as unknown as` casts, 16 `require-await` warnings, 25 tracked lint debt instances, and 54 declined warnings with zero disruption to active product paths.

---

## 1. Phase 24 Prioritized Action Plan

### Tranche 1: Unsafe Rules Cluster Hunting (`no-unsafe-*`)
- **Objective:** Focus on `@typescript-eslint/no-unsafe-assignment` (267), `no-unsafe-member-access` (250), `no-unsafe-argument` (95), and `no-unsafe-return` (53).
- **Strategy:**
  - Find top files with high concentration of unsafe member access / assignment.
  - Introduce typed Zod schemas or narrow boundary types at external API/storage ingest points.
  - Avoid wide `any` propagation into domain logic.

### Tranche 2: Remaining Production `as any` Cast Reduction
- **Objective:** 67 `as any` casts remain in production code (`casts.asAny = 67`).
- **Focus:**
  - Locate `as any` assertions in UI components and data adapters.
  - Replace with Discriminated Unions, `unknown` with type guards, or proper TS types.

### Tranche 3: `no-unnecessary-condition` Defending & Pruning
- **Objective:** Address low-hanging `no-unnecessary-condition` (1,271) warnings where TypeScript already knows the type is non-null/non-undefined.
- **Guardrail:** Never introduce loose `||` when tightening conditions — always protect `prefer-nullish-coalescing`.

---

## 2. Verification Protocol

```bash
# 1. Core compiler and safety gates
bun run typecheck && bun run strict-index:check && bun run test:gates

# 2. Economy & token suites (pin all 3 files explicitly; verify suite count equals 3)
bun run jest src/services/__tests__/TokensClient.noFabricatedQuantities.test.ts \
  src/services/__tests__/TokenEconomyService.grantSignupBonus.test.ts \
  src/__tests__/economy/creditMultipleTokensAdapter.test.ts
# Expected: Test Suites: 3 passed, 3 total · Tests: 18 passed

# 3. Full test suite
CI=1 bun run test

# 4. Debt ratchet and bundle verification
bun run lint:debt && bun run build
```

---

## 3. Standing Repo Hygiene Checks

1. **Untracked File Check:**
   - Run `git status --porcelain`. Expected: zero untracked files.
2. **Reappearing Dead Files:**
   - Always verify unreferenced files do not resurrect during branch shifts or git status inspections.
3. **External Manifest Parity:**
   - Run `bun run jest src/lib/esms-chain/__tests__/tokenMetadata.test.ts`. Expected: 21/21 passed.
