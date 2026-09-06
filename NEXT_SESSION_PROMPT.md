# Next Session: Phase 26 — Boundary Validation, and What Phase 25 Proved Is Not Cleanup

> **Status of Phase 25:** Complete and verified on branch
> `refactor/phase-25-test-only-and-unsafe`, branched from
> `refactor/phase-24-dead-modules` — which is **unmerged** (PR #828, open).
> Master is at `5e3ee47d` (#829, the deletion register, merged 2026-09-06).
>
> | Commit | |
> |---|---|
> | `5cbe58d3` | `refactor(unsafe)`: stop `executeQuery` defaulting its row type to `any` |
> | `198634f5` | `refactor(lint)`: route `console.error` through `_logger.error` (261 sites, 176 files) |
> | `8b4b3970` | `refactor(trust-boundaries)`: type request bodies as the wire, not as the handler wants |
> | `3b15a5bf` | `chore(lint)`: ratchet baseline |
>
> | Metric | Before (P24) | After (P25) | Δ |
> |---|---:|---:|---:|
> | **Tracked lint debt** | 1,944 | **1,635** | **−309 (−16%)** |
> | — `no-console` | 362 | **102** | −260 |
> | — `no-unsafe-member-access` | 195 | **174** | −21 |
> | — `no-unsafe-assignment` | 206 | **197** | −9 |
> | — `no-unnecessary-condition` | 904 | **897** | −7 |
> | — `no-unsafe-return` | 23 | **19** | −4 |
> | — `no-unsafe-argument` | 63 | **60** | −3 |
> | — `no-unsafe-call` | 10 | **7** | −3 |
> | — `no-explicit-any` | 146 | **144** | −2 |
> | Unsafe cluster (sum) | 497 | **457** | −40 |
> | Assertion sites (AST) | 3,398 | **3,396** | −2 |
> | Declined pool | 4,911 | **4,910** | −1 |
> | Casts | 169 | **169** | 0 |
>
> Gates: `bun run verify` **exit 0** · typecheck **0 errors** · full jest
> **333/333 suites, 3,497 passed** · `bun run build` exit 0, bundle
> thresholds green · `audit:dead-modules` **UNREACHABLE: 0**.

---

## 0. The finding that matters most

**`no-unnecessary-condition` is not just "not cleanup" — acting on part of it
would have deleted live input validation.**

The handoff asked for the root cause to be re-derived rather than assumed. It
was, and the answer is not the stale `noUncheckedIndexedAccess` story:

`request.json()` is cast straight to the full body type in **63 places across 50
API routes**. The cast asserts exactly what the handler's own guard exists to
establish, so the guard is then reported as provably dead code:

| Route | Guard the rule called unnecessary |
|---|---|
| `api/admin/planetary-sync` | `if (!action \|\| (action !== "sync-all" && action !== "sync-one"))` |
| `api/economy/swap` | `if (!fromToken \|\| !toToken)` |
| `api/economy/sync-credit` | `if (!userEmail \|\| !amounts \|\| !idempotencyKey)` |
| `api/economy/sync-debit` | `if (!userEmail \|\| !amounts \|\| !idempotencyKey)` |

`sync-credit`/`sync-debit` are the PA↔alchm bridge; `swap` moves tokens. Deleting
those four guards leaves **every gate green** — tsc, lint, and all 3,497 tests
pass either way. Nothing in CI would have caught it.

The fix applied is not to touch the guards but to stop the cast lying: body types
are now `Partial<T>` (or `action?: string`), which is what the wire actually
guarantees. The guards earn their narrowing instead of assuming it.

**Residual, stated plainly:** `Partial<T>` models **absence only**. A body sending
a string where a number is expected is still mis-typed. Closing that needs real
validation and is Phase 26's Tranche 1.

---

## 1. Phase 26 Prioritized Plan

### Tranche 1: Zod at the 63 request-body boundaries (measured, ready)
50 API route files, listed by:

```bash
grep -rl "\.json()) as" src/app/api --include='*.ts'
```

This is a **behavioural** change (a malformed body starts returning 400 where it
previously flowed on), so it belongs in its own PR with its own review — that is
why Phase 25 stopped at `Partial<T>`. `src/lib/validation/clientSchemas.ts` is the
established pattern.

### Tranche 2: `res.json()` returns `any` — 89 unsafe sites (measured)
The single largest remaining root cause in the unsafe cluster. Measured
empirically, not estimated: adding

```ts
interface Body { json(): Promise<unknown>; }
```

produces **142 typecheck errors across 57 files**. Each needs a real shape
decision, so it is a tranche, not a sweep. Doing this collapses much of the
remaining 457 unsafe cluster at the root.

### Tranche 3: the rest of `no-unnecessary-condition` (897)
Now the second-biggest tracked rule at 55% of tracked debt. Shape:

| Message | Count | Actionable? |
|---|---:|---|
| Unnecessary optional chain on a non-nullish value | 262 | **Only after Tranches 1–2.** Trustworthy only if the type is honest. |
| Unnecessary conditional, value is always truthy | 232 | Same. |
| `??` LHS not nullish | 218 | Same. |
| Unnecessary conditional, value is always falsy | 131 | Investigate — dead branches. |
| The types have no overlap | 50 | Investigate — likely real defects. |
| Literal comparison always true/false | 11 | Triaged in Phase 25; all benign narrowing, see below. |

**Do Tranches 1–2 first.** Every `?.`/`??` finding is only as trustworthy as the
type it is derived from, and 480 of the 897 are exactly that shape.

### Tranche 4: `exactOptionalPropertyTypes` 674 → down
Untouched. The repurposed strict-flags gate ratchets automatically.

---

## 2. Tranche carried over: the 53 test-only modules

Still 53. **They are ~7 dependency clusters, not 53 independent decisions** — most
are pulled in transitively by a handful of test entry points:

| Cluster | Held alive by | Modules |
|---|---|---:|
| `calculations/index.ts` barrel | `unifiedEngineWitness.test.ts` | ~13 |
| `services/ElementalCalculator` | `src/__tests__/setupTests.ts` (jest bootstrap) | 4 |
| astrology validation | `astrologicalRules.test.ts` | 4 |
| recipe utils | `batchEnrichment` / schema tests | 4 |
| characterisation singletons | `TokensClient.noFabricatedQuantities`, `PlanetaryHoursClient.characterisation`, … | 4 |
| Storybook | `PremiumGlow.stories.tsx` | 2 |
| **test infra — must stay** | 4 admin polling tests | 1 |

Two things to know before touching them:

1. **`src/utils/testing/pollingTestEnv.ts` is a false positive.** It is test-only
   *by design* — it is the polling harness for 4 admin panel tests. It is not a
   deletion candidate and never will be.

2. **⚠️ The biggest cluster's witness cannot fail the way it matters.**
   `unifiedEngineWitness.test.ts` runs `calculateSMES` over 20 golden charts from
   `docs/physics/esms_conformance.json`, but every assertion is
   `Number.isFinite(...)`, `toBeDefined()` or `Array.isArray(...)`. **It would pass
   if the engine returned one identical constant for all 20 charts** — the exact
   failure mode recorded in `feedback_count_distinct_outputs_over_the_corpus`.
   And `calculations/index.ts` is production-unreachable, so the whole
   `UnifiedCalculationEngine` is exercised only by this weak witness.

   Before deciding whether that engine lives or dies, **strengthen the witness to
   count distinct outputs across the 20 charts.** A witness that cannot fail is
   not evidence either way.

The two duplicate-looking `astrologicalRules.test.ts` files are **not**
duplicates: the 390-line one exercises the real validators; the 205-line
`__tests__/` copy is largely tautological (it asserts local literals against
themselves, e.g. `const DEGREES_PER_SIGN = 30; expect(DEGREES_PER_SIGN).toBe(30)`).

---

## 3. Things worth not relearning

- **`no-console` is not mechanical.** `_logger` gates `info`/`warn`/`debug`
  behind `NODE_ENV !== "production"`; only `_logger.error` is ungated. Converting
  a `console.warn` silently deletes that line from production logs. Phase 25
  therefore converted **only** `console.error`. The remaining 102 are 71
  `console.warn`, 8 `console.log`, 3 `console.info`, 1 `console.debug`, the two
  logger implementations, and 7 sites whose shape does not fit
  `_logger.error(message, data?)`.
- **`_logger.error` is binary, `console.error` is variadic.** A regex sweep would
  have silently dropped third arguments. Phase 25 selected sites by AST and left
  4 multi-arg and 3 non-string-first calls alone.
- **`src/middleware.ts` is deliberately excluded** from logger conversion: edge
  runtime, documented as taking no Node-only imports, and it gates every route.
- **`executeQuery<T>` does honour its type parameter.** The older note claiming
  it "declares a type param and DISCARDS it" is wrong for the current code — it
  threads `T` into `pool.query<T>()`. The defect was the `= any` **default**,
  now `Record<string, unknown>`.
- **`grep` here is ugrep** and rejects some ERE alternations with escaped
  parens, returning a **false 0** rather than an error you notice. Unquoted
  `--include=*.ts` also glob-expands under zsh and silently matches nothing.
  Both produced false zeros during Phase 25.
- **`import/order` is not in `AUDITED_RULES`**, so it never reaches tracked debt —
  but a codemod that appends imports will add ~155 warnings. The repo's own
  fixer clears them; `--fix-type layout,suggestion` does **not** (its fixer is
  type `code`).

---

## 4. Latent defects found and left alone (deliberately)

`src/lib/database/client.ts` had three functions whose declared return type did
not match their SQL. All three have **zero callers**, so they are latent, not
live. Phase 25 corrected the *types* to describe reality rather than changing the
SQL, because a behavioural change does not belong in a type-debt commit:

- `getCompatibleIngredients`, `getRecipeIngredients` — declare a nested
  `{ ingredient: Ingredient, ... }` row, but `SELECT i.*` spreads the ingredient
  columns **flat**. Every `.ingredient` read would have been `undefined`.
- `getRecipeContexts` — declares `moon_phases` / `seasons`; the SQL selects
  `recommended_moon_phases` / `recommended_seasons`.

**Open decision:** whether the SQL should be aliased to match the original intent,
or these three should be deleted as dead. They are the only remaining evidence of
what was intended.

---

## 5. Verification Protocol

```bash
bun run verify               # test:gates, strict-index:check, typecheck, lint, lint:debt, test:fast
CI=1 bunx jest               # full suite — 333 suites / 3,497 tests
bun run build
bun run audit:dead-modules   # must stay at UNREACHABLE: 0
```

⚠️ `verify` ends in `test:fast` (19 suites). It is **not** the full suite — run
`CI=1 bunx jest` separately before claiming green.
