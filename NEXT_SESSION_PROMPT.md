# Next Session: Phase 13 — The `noUncheckedIndexedAccess` Program

> **Status of Phase 12:** Complete. Four commits on `feat/phase-11-as-any-eradication`,
> tree clean, gate exit 0.
> `6bbd157a` assertion-site axis · `0d849e32` duplicate exclusion ·
> `df458a09` 26 redundant assertions deleted · `1d5afd04` fetch mock centralised.
> Baseline: **4,593** assertion sites, **380** gated casts, **3,606** tracked debt,
> **6,317** declined. Gate self-tests **36**.

---

## 0. Repository State — Measured Ground Truth

All values re-verified live at `1d5afd04`, not carried forward from prose.

| Metric / Fact | Current Value | Verification Command | Status |
|---|:---:|---|:---:|
| **Assertion sites (AST)** | `4,593` (103 `as any`, 274 chained, 4,216 single) | `NODE_OPTIONS=--max-old-space-size=8192 bun scripts/checkLintDebt.ts --top-casts` | ✅ Verified |
| — Production / Test split | `3,959` / `634` | same | ✅ Verified |
| — Monitored, not gated | `632` `as const`, `666` non-null `!` | same | ✅ Monitored |
| **Gated Cast Surface** | `380` (106 `as any`, 274 `as unknown as`) | `bun run lint:debt` | ✅ Verified |
| — Production / Test split | `322` / `58` | same | ✅ Verified |
| **Untracked single `as T`** | `2,837` (regex axis — known blind, see §1) | same | ⚠️ Advisory only |
| **Tracked Lint Debt** | `3,606` | `bun run lint:debt` | ✅ Verified |
| **Declined Rules Pool** | `6,317` | `bun run lint:debt` | ✅ Verified |
| **Gate self-test** | `2 suites / 36 tests pass` | `bun run test:gates` | ✅ Verified |
| **Compiler & Lint Errors** | `0 errors` | `bun run typecheck && bun run lint` | ✅ Verified |
| **`noUncheckedIndexedAccess` cost** | `2,336` errors / `433` files | see §2.1 probe | ✅ Verified |
| **Witness golden fixture** | unmodified (100% parity) | `bun scripts/snapshot-witness.ts` | ✅ Verified |
| **Witness sensitivity** | `12/12 load + 3/3 perturbation gates pass` | `bun scripts/checkWitnessSensitivity.ts` | ✅ Verified |
| **Monica Read-Path** | `0` fabricated fallbacks | `bun scripts/checkNoFabricatedMonicaFallback.ts` | ✅ Verified |

---

## 1. Phase 12 Retrospective & Scorecard

### Honest Scorecard vs Stated Goals

| Goal | Stated | Phase 12 Result | Verdict |
|---|---|:---:|:---:|
| 1. Gate self-integrity & CI guarding | already complete | verified; self-tests **19 → 36** | 🟢 Confirmed |
| 2. Add `totalAssertionSites` axis | gate on it | shipped `6bbd157a`; **estimate was wrong, see below** | 🟡 Done, premise corrected |
| 3. Close cast pockets by pattern | retire 30+ | **−26 production** (compiler-proved) + **−19 test** (one helper) | 🟢 Met |
| 4. Prioritise `no-unnecessary-condition` | delete the guards | **recommendation inverted** — see §1.2 | 🔴 Premise refuted |

| Axis | Phase 12 start | End | Δ |
|---|---:|---:|---:|
| Assertion sites | 4,638 | **4,593** | −45 |
| — production | 3,985 | 3,959 | −26 |
| Gated casts | 400 | **380** | −20 |
| — `as unknown as` | 294 | 274 | −20 |
| — `as any` | 106 | **106** | **0 ← miss** |

### 1.1 Four corrections to the Phase 12 handoff's stated premises

1. **True assertion sites were 4,638, not the estimated 2,958.** The formula
   `400 + 2,852 − 294` assumed the regex saw every single `as T` and only
   double-counted chain tails. It did neither. The regex
   `\bas\s+(?!unknown|any)[A-Z]\w*` is **blind to 1,389 real assertions**
   (`as keyof typeof X`, `as { a: b } & C`, `as string[]`, bare `as unknown`)
   and *counts* `import * as React` and `export { default as Foo }`.
   **Never derive this number arithmetically from the regex axes.**
   The one shape regex nails exactly is `as unknown as` (294 = 294) — kept as a
   cross-instrument control test.

2. **`no-unnecessary-condition` is tracked, not declined, and is 1,729 not 1,750.**
   That makes it **48% of all tracked debt**, the largest single rule. See §1.2.

3. **The gate was counting Finder/sync duplicates.** 20 `foo 2.ts` files held
   **160 phantom sites**; six spawned mid-session while those very files were
   being edited, making the metric machine-dependent. Fixed in `0d849e32`
   (`isDuplicateArtifactPath`). `Panel2.tsx`, `api/v2/route.ts` and `base64.ts`
   are pinned by test as *not* duplicates.

4. **The `noUncheckedIndexedAccess` probe is 433 files, not 596.** The earlier
   count split error paths on the *first* `(` — but 64 of them live in Next.js
   route groups such as `src/app/(alchm)/`. Split on the **last** paren. Error
   total is 2,336.

### 1.2 Why goal 4 inverted — read this before touching the rule

The handoff said: *"each hit is where code guards against a state types say is
impossible — the prime hiding spot for incorrect casts."* The first half is
right; the conclusion is backwards. **The guards are correct. The types are
optimistic.**

`tsconfig.json` sets `noUncheckedIndexedAccess: false`, so `positions[planet]`,
`longitudes[name]` and `PULSE_STATE_COLOR[pulse.state]` are all typed as
always-present, and every guard against the real runtime `undefined` reads as
"unnecessary". Deleting them injects exactly the failure class this repo has
already been burned by — a `?? 0` that faked 710/710 longitudes.

**Measured, not asserted.** On an 8-file sample, flipping the flag and changing
**no source at all** dropped the rule **98 → 60 hits (−39%)**:
`alchemizer.ts` 13 → 0, `planetaryFBD.ts` 11 → 2. The guards become *necessary*
once the type tells the truth.

Breakdown of the 1,729: 547 always-truthy, 457 unnecessary-optional-chain,
331 always-falsy, 323 `??`-LHS-non-nullish, 55 types-have-no-overlap.
**The 55 no-overlap and 331 always-falsy are the ones most likely to hide
genuine bugs** and are worth reading individually — that is a separate hunt from
the flag program.

### 1.3 Rule 1 compliance — the instrument boundary is clean

Phase 12 obeyed *"never change the scanner and the code in the same commit."*
Both instrument commits (`6bbd157a`, `0d849e32`) landed **before** any code
commit, with the baseline re-recorded between them:

```
4,798 raw walk  →  4,638 after excluding duplicates   [instrument, 0d849e32]
4,638           →  4,593 after code remediation       [code, df458a09 + 1d5afd04]
```

The −45 is apples-to-apples. Unlike Phase 11, **none of it came from moving the
instrument.**

### 1.4 Method note — tsc as an emit-neutral oracle, and its limit

Type assertions are emit-neutral (`x as T` compiles to `x`), so deleting one has
zero runtime risk and the compiler is a sound oracle for *deletability*. Method:
delete all 150 candidates, typecheck, revert every file the compiler rejects.
**57 of 80 failed** — all the `object as { prop?: T }` shape, where the assertion
exists to permit a property read.

⚠️ **But static assignability is not sufficient.** Three files typechecked clean
and still leaked `any` into their callers (`no-unsafe-member-access` +12,
`no-unsafe-assignment` +8, `no-unsafe-call` +1). Root cause: an "any-free" filter
that checked only the top-level type string, not member types — `body:
Record<string, unknown>` destructured to `guests` loses the element type and
cascades 14 unsafe accesses. **`tsc` clean + per-rule lint delta, both, or the
metric moves while safety drops.**

---

## 2. Phase 13 Strategic Mission

Phase 12 made the assertion metric tell the truth. Phase 13 fixes the root cause
the metric exposed: **the type system is lying about index access**, and 1,729
lint hits plus an unknown number of real bugs sit downstream of that one flag.

Approved shape: **allowlist ratchet gate + risk-first first tranche.**

### 2.1 Reproduce the probe

`noUncheckedIndexedAccess` is **program-wide** — TypeScript cannot enable it for
a subset of files, and limiting `include` does not help because the checker
follows the whole import closure. So the gate runs the *full* program and
**filters the output**.

```bash
cat > /tmp/tsconfig.nuia.json <<'EOF'
{
  "extends": "/Users/cookingwithcastro/Desktop/WhatToEatNext-master/tsconfig.json",
  "compilerOptions": { "noUncheckedIndexedAccess": true, "noEmit": true }
}
EOF
npx tsc -p /tmp/tsconfig.nuia.json --pretty false > /tmp/nuia.txt
```

⚠️ **Two parsing traps, both hit in Phase 12:**
- tsc emits **multi-line** messages. Count only lines matching
  `\([0-9]+,[0-9]+\): error TS[0-9]+:` — 3,133 raw lines, **2,336 real errors**.
- Paths contain `(` (Next.js route groups). Strip from the **last** paren:
  `sed -E 's/\(([0-9]+),([0-9]+)\): error TS.*$//'`. Splitting on the first one
  gave 417 files instead of 433.

Current cost: **2,336 errors across 433 files** —
946 TS18048 (possibly-undefined), 640 TS2532, 361 TS2322, 279 TS2345,
72 TS2538 (undefined-as-index), 38 other.

Concentration: **60 files carry 50%; 176 carry 80%.**

| domain | errors | files |
|---|---:|---:|
| `src/utils` | 638 | 121 |
| `src/services` | 443 | 64 |
| `src/components` | 368 | 77 |
| `src/lib` | 355 | 53 |
| `src/app` | 298 | 69 |
| `src/data` | 104 | 18 |
| `src/calculations` | 75 | 12 |
| other (`hooks`, `types`, `contexts`, `constants`, `server`, `actions`) | 55 | 19 |

### 2.2 Build the ratchet gate — instrument-only commit, first, alone

1. **`tsconfig.strict-index.json`** — extends `tsconfig.json`, sets
   `noUncheckedIndexedAccess: true`, `noEmit: true`. Main `tsconfig.json` and
   `bun run typecheck` are **not** touched, so nothing breaks today.
2. **`.strict-index-baseline.json`** — `{ total: 2336, files: 433, allowlist: [] }`.
3. **`scripts/checkStrictIndex.ts`** — runs tsc against that config, parses with
   the two rules above, then:
   - **hard gate:** any error in an **allowlisted** file → fail;
   - **ratchet:** `total > baseline.total` → fail;
   - auto-ratchet the baseline down when the total drops, mirroring
     `checkLintDebt.ts`.
4. **Self-tests** in `scripts/lib/__tests__/` — must include a *red* proof that
   the gate fails on an allowlisted regression, and pins for both parser traps
   (a route-group path, a multi-line message).
5. Wire into `bun run verify`.

Files **graduate onto the allowlist** as they reach zero. The allowlist is the
part that cannot regress; the total is the part that must trend down.

### 2.3 Tranche 1 — physics/ESMS core (50 files, 457 errors)

Chosen on **risk, not count.** This is where an undefined index becomes a *wrong
number* instead of a crash — everywhere else it throws or renders nothing.

```
 60  src/lib/alchemical-kinetics.ts          18  src/calculations/alchemicalCalculations.ts
 40  src/lib/wasm/thermoEngine.ts            17  src/data/unified/cuisineIntegrations.ts
 39  src/lib/cooking/boundaryNetwork.ts      14  src/calculations/dignityManifest.ts
 30  src/utils/alchemicalSampleLookup.ts     11  src/calculations/culinary/seasonalAdjustments.ts
 29  src/utils/astrologyUtils.ts             10  src/utils/astrology/validation.ts
 29  src/lib/celestial-energy-calculator.ts   8  src/utils/astrology/transitValidation.ts
 29  src/data/unified/recipeBuilding.ts       8  src/utils/astrology/birthChartSignEstimator.ts
                                              8  src/lib/alchemical-kinetics-sampler.ts
```
…plus 42 files at ≤7 errors each across `src/calculations/**`,
`src/utils/{astrology,elemental}/**`, `src/data/unified/**`.
Full list: rerun §2.1 and filter to
`^src/(calculations|lib/alchemical|lib/wasm|lib/cooking|lib/celestial|data/unified|utils/astrolog|utils/elemental|utils/alchemical)`.

**This tranche is exactly the code the witness gates cover.** Every commit must
hold 100% snapshot parity and 12/12 + 3/3 sensitivity — that is the strongest
correctness signal available anywhere in this repo, and it is free here.

### 2.4 Loose ends carried into Phase 13

- **Delete the 19 duplicate files.** `find src -name '* [0-9].*'`. The scanner is
  already immune, but six spawned mid-session while those very files were being
  edited. ⚠️ **The cause is unconfirmed.** The " 2" suffix is the shape Finder
  copies and iCloud/Dropbox sync conflicts use, but that is a hypothesis, not a
  measurement — nothing was instrumented to catch the writer. Deleting them
  without finding the writer only clears the symptom. Check `fs_usage`/`lsof`
  during an edit, and whether this directory is inside a synced folder, before
  concluding.
- **106 `as any` — untouched in Phase 12.** Now an explicit named target with its
  own sub-baseline, not hidden behind the aggregate. (AST says 103; the regex
  counts 2× `as any[]` plus one inside a template literal.)
- **8 mock casts → `jest.mocked()`.** The remaining
  `as unknown as jest.Mock` / `jest.MockedFunction` sites. `jest.mocked()` ships
  with @types/jest 30 and is used **0 times** in this repo.
- **Optional side hunt:** the 55 `types-have-no-overlap` and 331 `always-falsy`
  hits, read individually. Highest bug-per-hour, independent of the flag program.

### 2.5 ⚠️ Nothing typechecks the test files

`tsconfig.json` excludes `**/*.test.ts(x)`, `**/*.spec.*` and `src/__tests__/**`,
and `isolatedModules: true` puts ts-jest in **transpile-only** mode.
`jest.config.js` also lists `diagnostics.ignoreCodes: [2322, 2339]`, but that is a
red herring — **nothing is reported at all.**

**Measured:** a test file containing `const f = (x: number) => x; f(1, 2, 3)` —
TS2554, wrong arity, *not* in `ignoreCodes` — **runs green.**

Consequences for Phase 13:
- A type error in a test file is invisible in CI. Only runtime failure catches it.
- Assertions in test files are **inert** — erased at runtime, never checked at
  compile time. Removing them is metric movement, not safety.
- Any test refactor must be proved by **running the suite**, never by `typecheck`.
- Editor/tsserver still checks them via an inferred project, so casts there do
  buy editor ergonomics.

⚠️ The first probe of this was self-defeating: the explanatory comment written
above it literally began `// @ts-expect-error`, which **is** the suppression
directive, and silenced the very error being tested for. **Never let a probe's
prose contain a directive token.**

---

## 3. Strict Operating Rules — Phase 13

Rules 1–8 carry forward from Phase 12 unchanged. 9–13 are new, each earned.

1. **Do Not Change the Scanner and the Code in the Same Commit.** Instrument
   changes land alone with the baseline re-recorded before any code work.
2. **`totalAssertionSites` Must Strictly Decrease.** Gated-axis wins that leave
   it flat are relabelling, not remediation. A chain counts as **one** site, so
   `as unknown as T` → `as T` cannot move it.
3. **The Gate's Own Tests Must Be Green** before any baseline ratchet.
4. **Verify with Jest, Never `bun test`.**
5. **Drive Changed-File Tests from `git status`.**
6. **Never Regenerate `scripts/fixtures/snapshot-witness-baseline.json`.** Parity
   breaks are fixed in implementation code.
7. **Production Signatures Are Not a Cast Sink.**
8. **Commit Scoped Changes Atomically.**
9. **Never fix a `noUncheckedIndexedAccess` error with `!` or `?? 0`.** Both
   re-hide the exact state the flag exposed and reintroduce the fabricated-value
   failure class. Use a real guard, an early return, or a typed accessor that
   returns `T | undefined` and forces the caller to decide. **A tranche whose
   diff is mostly `!` has done negative work.**
10. **`tsc` clean is necessary, not sufficient.** Every remediation batch needs
    the per-rule lint delta too — Phase 12 had three files typecheck clean while
    leaking `any` (+21 unsafe-* hits).
11. **Parse tsc output on the LAST paren, and only count real error lines.**
    Route-group paths contain `(`; messages span lines. Both traps produced
    wrong file counts in Phase 12.
12. **Do not use `git stash` in this working directory.** A `stash pop` here
    restored 20 files to *older committed blobs*, producing 26 phantom lint
    errors that were initially misattributed to the current refactor. Park work
    as a patch file (`git diff > work.patch`) instead. Never `git add -A` —
    concurrent sessions share this checkout.
13. **Read exit codes directly, never through a pipe or `echo $?` after one.**
    `cmd | tail -4; echo $?` reports `tail`'s status. Write `echo $? > file` and
    read the file. Quote glob arguments (`--include='*.ts'`) — zsh expands them
    and silently returns zero matches.
