# Next Session: Phase 19 — Unsafe Operations (Wave 1, root-cause led)

> **Status of Phase 18:** Complete, verified, committed on `feat/phase-17-cast-decimation-pnc`.
> Three commits: `41893eb8` (Tranches 1–2), `96e07f0d` (Tranche 4), `9947400f` (Tranche 5 ratchet).
>
> | Metric | Before | After | Δ |
> |---|---:|---:|---:|
> | Tracked lint debt | 2,885 | **2,875** | −10 |
> | Cast surface | 279 | **263** | −16 |
> | — `as any` / `as unknown as` | 78 / 201 | **71 / 192** | −7 / −9 |
> | — Production / Test | 241 / 38 | **231 / 32** | −10 / −6 |
> | Assertion sites (AST) | 4,430 | **4,418** | −12 |
> | — Production | 3,809 | **3,799** | −10 |
> | PNC sub-baseline | 398 | **337** | −61 |
> | Declined pool | 6,356 | **6,356** | held |
>
> Gates: `bun run verify` green end-to-end (each commit passed it via the pre-commit hook).
> Full `jest`: **327/328 suites, 3,419 tests passing**.

---

## 0. What Phase 18 added that changes how future tranches should work

### `scripts/checkEmitEquivalence.sh` — the new safety gate

A type assertion **erases at compile time**, so a correct cast removal must emit
byte-identical JavaScript. The script diffs esbuild output against a git ref.

```bash
scripts/checkEmitEquivalence.sh <file> [ref]   # 0 = RUNTIME-NEUTRAL, 1 = BEHAVIOUR-BEARING, 2 = could not compare
```

This closes the hole that once let a cast removal drop **772 of 921 ingredients**
while `tsc` stayed green. It is red-proven in both directions and refuses a
0-byte comparison so it cannot pass vacuously.

⚠️ It **cannot** bless `||`→`??`, added `?.`, new guards, or deleted branches —
those legitimately change emit. For those, type analysis is the proof.

⚠️ **Watch the second-order cost.** Two Phase 18 regressions were caused by
*doc comments explaining a cast* pushing a file over `max-lines` / a function
over `max-lines-per-function`. Both are counted. Keep justification comments tight.

### The two ratchets are in tension — and the naive unsafe-* fix loses

The cast surface counts `as any`, `as unknown as` **and** single `as T`. The naive
unsafe-* fix is `const d = await res.json() as Foo`, which silences the warning and
**adds an assertion site** — trading one ratcheted metric for another. Recon
quantified this per file group; the honest fixes cost zero and several go *negative*.

---

## 1. Phase 19 blueprint — measured, not estimated

Recon over 7 file groups (6 returned; `api-routes` was lost to a session limit):

| Group | sites | emit-neutral | behaviour-bearing |
|---|---:|---:|---:|
| `lib/api/fetchWithAuth.ts` + `lib/agents/fetchAgentProfile.ts` | 16 | 16 | 0 |
| `data/ingredients/seasonings/vinegars.ts` | 13 | 13 | 0 |
| `services/poolerSaturationHealth.ts` + `services/QuestService.ts` | 28 | 16 | 12 |
| `components/recipes/LabBookIngest.tsx` + `hooks/useAstrologize.ts` | 24 | 16 | 8 |
| `lib/recipe-nft/mintClient.ts` + `services/PlanetaryHoursClient.ts` | 25 | 12 | 13 |
| `contexts/menu-planner/useCostEstimation.ts` | 12 | 10 | 2 |
| **Total** | **118** | **83 (70%)** | **35** |

Repo-wide the unsafe-* family is **828 sites across 225 files** — a long tail
(top-30 files hold only 295), so root-cause fixes beat per-site edits.

### Recommended order

1. **`fetchWithAuth` + `fetchAgentProfile` (16/16 emit-neutral).** Do this first —
   it is the pattern-setter, not a two-file cleanup. `res.json()` appears at ~441
   call sites, ~235 of which already spend an `as` on the same line. One shared
   `fetchJson<T>` pays a single assertion inside the helper.
2. **`vinegars.ts` (13/13).** One root: `properties: any` at line 6. Fixing the
   signature (precedent: `proteins/plantBased.ts:5-8`) costs **zero** casts; the
   naive per-site fix costs +9.
   ⚠️ **Blocker that is actually a find:** all 8 entries author
   `category: "vinegars"` but `IngredientCategory` only has singular `"vinegar"`.
   Fix the **type**, not the data — the plural is the live runtime key and ≥7
   consumers filter on it. Same widening unblocks two sibling vinegar files.
3. **`poolerSaturationHealth.ts` (15 sites).** Deleting one hand-written
   `as unknown as` at line 32 restores the real `@types/pg` types and resolves all
   15, **removing** 3 cast-surface entries and 1 `no-explicit-any`. Highest yield
   in the backlog and it *pays into* both ratchets.
4. **`useCostEstimation.ts` (10 of 12)** — one token on one line.
5. **`LabBookIngest.tsx` (13)** — assert once at the binding and *delete* the two
   existing member-level assertions: net zero assertion sites.

### Two mechanical facts worth keeping

- **Only `unknown` silences `no-unsafe-assignment`.** Verified against the rule
  source: an `any` sender is reported unless the receiver is `unknown`. Annotating
  any other type does not silence it — so "just annotate it" is not a general escape.
- **Annotations must keep `| null`.** `JSON.parse("null")` returns `null`, so a
  non-nullable annotation makes existing `?.` provably unnecessary and buys
  `no-unnecessary-condition` (tracked, 1,287, per-rule gated) while paying off
  unsafe-*. This converts a clean win into a red gate on a different rule.

---

## 2. Live defects found hiding behind casts (not lint debt — real bugs)

1. **`services/PlanetaryHoursClient.ts:102`** —
   `(calculator.getCurrentPlanetaryHour as any)(targetDate)`. The real method takes
   **zero arguments** and returns no `start`/`end`. So `targetDate` is silently
   dropped and `start`/`end` are permanently `undefined`. Behind an env flag that
   makes this the **default path in most deployments**. Needs a characterisation
   test first — the fix is behaviour-bearing by definition.
2. **`hooks/useAstrologize.ts`** — has **zero consumers** (verified: no direct
   reference, `src/hooks/index.ts` uses only named exports, no `export *` reaches
   it). Also broken: it casts to reach `AstrologicalService.requestLocation`, which
   does not exist, so the hook never fetches in its default configuration. Two other
   callers suppress the same error with `@ts-expect-error` / `@ts-nocheck`.
   Deleting it clears 11 sites and ratchets both cast metrics down.
   Typed replacement already exists: `hooks/useUserLocation.ts`.
3. **`services/QuestService.ts:305`** — `period_start` is a `DATE` column and the
   repo overrides only the NUMERIC/INT8 parsers, so node-pg returns a **Date**
   through a field declared `string | null`, JSON-serialised out via `QuestProgress`.
   ⚠️ Do **not** "fix" this with an `as string` — that asserts the bug as true.

---

## 3. PNC: what remains and why

337 sites, re-measured over the **whole** corpus with the TypeScript compiler API
(not sampled) and recorded in the baseline:

- **301 semantic** — `||` and `??` diverge (164 `string`, 111 `number`, 13 `any`,
  2 `unknown`, 2 `false`). Not sweepable.
- **36 safe** — 24 `if (!x) x = …` (want `??=`), 8 ternaries, and 4 held-back
  `a || b || c` chains where `??` needs parentheses.

⚠️ The rule fires on **four shapes with different divergence rules**: truthiness
diverges on any falsy-valid operand; `x !== undefined ? x : b` only if x can be
null; `x !== null ? x : b` only if x can be undefined; the two-sided guard never
diverges. A `||`-only classifier silently drops ~10% into a bucket that looks like
"no result" rather than a gap.

⚠️ The sub-baseline's `verifiedSafe`/`semantic`/`unclassified` fields are
**documentation, not a gate** — `compareSubBaseline` reads only `total`. They had
drifted to describe a retired 692-site population; re-measure them whenever `total` moves.

---

## 4. Repo hygiene issue, unresolved

`src/data/ingredients/fruits/fruits.ts` and `enhancedFruits.ts` were **deleted from
git by PR #819** (`fa29e501`) but keep reappearing on disk as untracked files with
their original May mtime. They are unreferenced, but while present they add **+2
`max-lines`** to the declined pool — on their own enough to turn `lint:debt` red.
`isDuplicateArtifactPath()` does **not** match them (ordinary names).

Moved to the session scratchpad with a provenance README rather than deleted.
They will come back. The writer that resurrects them is still unidentified — see
the standing note about ` 2.ts` duplicates; this is the same writer, different shape.

⚠️ Diagnose by comparing **lint file counts** between snapshots (2032 → 2034), not
by mtime — mtime is preserved and will mislead you into thinking they are old.

---

## 5. Known unrelated failure

`src/lib/esms-chain/__tests__/tokenMetadata.test.ts` fails on a cross-repo manifest
byte-equality check against a sibling ASOL checkout (local manifest carries an
Arweave `image` URL; the sibling has `null`). Not caused by Phase 18 — the same
class as the PA→AAE sign-vector parity: fix one repo and the other goes stale.
