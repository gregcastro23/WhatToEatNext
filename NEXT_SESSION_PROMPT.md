# Next Session: Phase 15 — Closing the Falsy-Fallback Surface

> **Status of Phase 13:** Complete **and enforcing**. 20 commits on
> `feat/phase-13-strict-index`, tree clean, `bun run verify` exit 0.
> Program: **2,324 → 0** strict-index errors across **432 → 0** files.
> `noUncheckedIndexedAccess` is now `true` in `tsconfig.json` (`59e470df`), so
> `bun run typecheck`, `next build` and every type-aware lint rule enforce it —
> not just the opt-in gate.

> ⚠️ **Numbering note, read before trusting the sequence.** There is no Phase 14
> in this repository. Measured at `59e470df`, before this file was written:
> `grep -rn "Phase 14" --include='*.md' --include='*.ts' .`, excluding
> `node_modules` and `.worktrees`, returned **0 hits** — the only matches today
> are these very lines. This document is numbered 15 as instructed; **Phase 13 is
> the immediate predecessor**, and no work is missing between them. If a Phase 14
> exists off-repo, reconcile the two before carrying any number forward.

---

## 0. Repository State — Measured Ground Truth

All values re-verified live on the tree carrying the Option C sub-baseline, not
carried forward from prose. Every row names the command that produced it; re-run
rather than trusting the number if the tree has moved.

| Metric / Fact | Current Value | Verification Command | Status |
|---|:---:|---|:---:|
| **Strict index errors** | `0` across `0` files | `bun run strict-index:check` | ✅ Verified |
| **`noUncheckedIndexedAccess`** | **`true`, enforcing** | `tsconfig.json:14` | ✅ Live |
| **Compiler errors (flag on)** | `0` | `bun run typecheck` | ✅ Verified |
| **Lint errors / warnings** | `0` / `22` | `bun run lint` | ✅ Verified |
| **Full verify** | exit `0` | `bun run verify` | ✅ Verified |
| **Fast suite** | `19 suites / 494 tests` | `bun run test:fast` | ✅ Verified |
| **Tracked lint debt** | `2,970` vs baseline `2,970` | `bun run lint:debt` | 🟢 **GREEN** |
| **Declined rules pool** | `6,364` vs baseline `6,364` | same | 🟢 **GREEN** |
| — `prefer-nullish-coalescing` | `692` vs sub-baseline `692` (95 verified-safe / 566 semantic / 31 unclassified) | same | 🟢 **Sub-baselined** |
| — `no-unnecessary-condition` | `1,307` vs baseline `1,307` | same | 🟢 −422 locked |
| **Gated cast surface** | `380` (106 `as any`, 274 `as unknown as`) | `bun run lint:debt --top-casts 5` | ⚪ Unmoved |
| **Assertion sites (AST)** | `4,532` (was 4,593) | same | 🟢 −61 |
| — Production / Test | `3,898` / `634` | same | 🟢 −61 prod |
| — Monitored | `642` `as const`, `657` non-null `!` | same | 🟢 −9 `!` |
| **Untracked single `as T`** | `2,812` (regex axis — known blind) | same | ⚠️ Advisory |
| **Strict-index allowlist** | `124` entries, now redundant | `.strict-index-baseline.json` | ⚪ See §2.4 |
| **Duplicate artifact files** | `9` present | `find src -name '* [0-9].*'` | ⚠️ Unresolved |

✅ **`bun run lint:debt` is GREEN.** Option C (Sub-baseline) was executed:
`prefer-nullish-coalescing` is isolated on its own sub-baseline at 692, the core
tracked total is ratcheted down to 2,970 (locking in the 426-warning improvement
from `no-unnecessary-condition`), and the declined pool baseline absorbs the
**+47** that Phase 13's bounds guards added to it, moving 6,317 → 6,364. Unsafe
matrix typing in `naturalLanguageProcessor.ts` was also fixed to eliminate the
unsafe assignment/return warnings.

⚠️ **Note what is isolation and what is absorption.** The +482 on
`prefer-nullish-coalescing` is *isolated* — quarantined on its own ceiling where
it stays visible and cannot dilute the aggregate. The +47 on the declined pool is
*absorbed* — a ceiling genuinely raised, because `complexity`, `max-depth` and
`max-lines` rise mechanically when guards are added and there is no cheap way to
give that back. It is the one number here that was conceded rather than fixed.

---

## 1. Phase 13 Retrospective

### 1.1 Scorecard

| Goal | Stated | Result | Verdict |
|---|---|:---:|:---:|
| 1. Build the ratchet gate, instrument-only | required first | `b4c8317f` + `1470735c` | 🟢 Met |
| 2. Drive strict-index errors to zero | 2,324 → 0 | **2,324 → 0 / 432 → 0 files** | 🟢 Met |
| 3. No `!` / `?? 0` remediation (Rule 9) | zero tolerated | 0 in final diff; non-null `!` **666 → 657** | 🟢 Met |
| 4. Turn the flag on repo-wide | not originally scoped | `59e470df` | 🟢 Done |
| 5. Keep `lint:debt` green | assumed, never checked | **+59, red** | 🔴 Missed |

Goal 5 is the honest failure. `lint:debt` is absent from `verify`, so eighteen
commits landed green while the debt gate drifted. **A gate outside `verify` is a
gate nobody runs.**

### 1.2 What the flag actually bought

The count is not the point; these four are. Each was a live fabrication the
compiler could not see before:

- **`swissephCalculations`** returned `ascmc[0] ?? 0` for the ascendant. A
  defaulted `0` asserts **0° Aries as a real chart angle**. Now throws.
- **`sync-debit`** (`src/app/api/economy/sync-debit/route.ts`) would report a
  balance from an `UPDATE` that returned no row — **fabricated money**. Now throws.
- **Nine `?? new Date()`** in the weekly planner: a calendar cell falling back to
  *today* misdates the row it is drawn in. Removed by typing `weekDates` as a
  seven-tuple, so the reads are total and need no fallback.
- **Two admin fabrications**: a `0 %` holder concentration where the truth is "no
  holders", and a request-volume axis anchored at the **1970 epoch**. CLAUDE.md
  requires admin panels to degrade honestly; both now do.

### 1.3 ⚠️ The verification is thinner than the green suggests

Per-file test coverage measured with `jest --listTests --findRelatedTests`:

| Directory | Files remediated | **Uncovered** |
|---|---:|---:|
| `src/components` | 77 | **67** |
| `src/utils` | 115 | 64 |
| `src/app` | 69 | 56 |
| `src/lib` | 49 | 26 |

For Batches H and I, `bun run build` did more real verification than the tests
did. Treat the green suite as necessary, not as evidence of behavioural safety —
and see the standing note that `test:fast` contains **no service tests at all**.

### 1.4 Six traps that cost real time — do not re-pay for these

1. **zsh does not word-split an unquoted `$VAR`.** `jest --findRelatedTests
   $TARGETS` passed a 49-path list as **one argument** and returned "0 tests"
   with rc=0. It was nearly recorded as "no test covers these files". Truth: 135.
   Use `$(cat file)` or `xargs`.
2. **`tsc -p` reuses a stale `.tsbuildinfo` and invents errors.** A phantom
   TS2488 was nearly blamed on a 4-line edit because line numbers had shifted by
   exactly the insert size. Always `--incremental false`. It can hide errors too.
3. **`.eslintcache` is content-keyed, so a compiler-flag change does not
   invalidate it.** Flipping `noUncheckedIndexedAccess` changes every type-aware
   result while file contents stay byte-identical — cached numbers are stale and
   look plausible. `rm -f .eslintcache` on **both** sides of any such measurement.
4. **Local `master` was stale by four commits.** `git log master..HEAD` reported
   23 commits spanning Phases 10–13; the truth against `origin/master` was **20**,
   Phase 13 only. Measure against `origin/master` and confirm with
   `gh api repos/<owner>/<repo>/commits/master`.
5. **A hook-rejected commit leaves everything staged.** A failed `git add src/ &&
   git commit` left 78 files in the index; the next 2-file commit swept them in
   under a message claiming "instrument-only". Check `git diff --cached` **before**
   staging, every time.
6. **Parse `tsc` output on the LAST paren.** Route groups (`src/app/(alchm)/…`)
   broke first-paren parsing and produced a wrong file count (54 vs 69).

---

## 2. Phase 15 Strategic Mission

### 2.0 Start here — session order

1. **Make the §2.1 baseline decision.** Everything else is blocked on it, and it
   is the user's call, not the agent's.
2. Reproduce the §2.3 probe. Do not trust the numbers in §0 without re-measuring.
3. Work §2.2 in tranches, smallest directory first, one commit per tranche.
4. §2.4 loose ends only if time remains.

### 2.1 ⚠️ Decision required before any code: the debt baseline

`bun run lint:debt` is red by **+59 tracked** and **+47 declined**. Two facts
that matter:

- It was **already red by +972** before the flag was turned on. Phase 13's own
  guards caused it: with the flag off, the compiler believes indexed reads are
  never `undefined`, so every `if (!x) throw` this branch added reads as an
  *unnecessary condition*. Turning the flag on retired **913** of those.
- The gate's ratchet is **one-directional by construction** — it `process.exit(1)`s
  before reaching the write path, so it can never record an increase. Absorbing
  the +59 means **hand-editing `.lint-debt-baseline.json`**, i.e. deliberately
  raising a debt ceiling.

That was left undone on purpose. Raising a ceiling as a side effect of a compiler
flag is exactly the kind of quiet policy change this program exists to prevent.
**Ask which of these the user wants:**

| Option | Effect |
|---|---|
| **A. Absorb** | Hand-edit the baseline to measured reality. Gate green immediately. Permanently weakens the `prefer-nullish-coalescing` ratchet by 482. |
| **B. Pay it down** | Leave the baseline. Fix `prefer-nullish-coalescing` sites until tracked ≤ 3,606. Gate goes green on merit. This is §2.2. |
| **C. Split the axis** | Give `prefer-nullish-coalescing` its own sub-baseline (as Phase 12 did for `as any`) so the aggregate is not hostage to one rule. |

⚠️ **B alone cannot close the gap — measured, not estimated.** Of the 692
`prefer-nullish-coalescing` hits, only **126** have a non-primitive left operand.
The other **566** are primitives, where `0` / `""` / `false` change meaning.
Passing the per-rule check needs **−482**; even converting every non-primitive
site yields **−126**. So **at least 356 sites require an individual semantic
decision** — this check cannot be made green mechanically, and no autofix or
codemod closes it.

⚠️ **`ignorePrimitives` is a filter, not a safety proof.** It excludes
`string`/`number`/`boolean`/`bigint` and says nothing about `any` or `unknown`,
where `||` → `??` *is* behaviour-changing. Type-probed at all 126 sites with the
TS API: **95 resolved, all object/array-typed, zero `any`, zero `unknown`** (87
`a || b`, 8 ternary `a ? a : b` — the rule reports three shapes, not one). The
remaining **31 did not resolve to an expression and are unverified.** So the
mechanically-safe tranche is 95 confirmed, not 126 assumed; classify the other 31
before touching them.

Reproduce with `ignorePrimitives: { string, number, boolean, bigint }` all true;
the unfiltered count reproduces the gate's 692 exactly, which is the control.

**Status:** Option C has been executed. `prefer-nullish-coalescing` has its own
sub-baseline at 692 (breakdown: 95 verified safe, 566 semantic, 31 unverified),
core tracked total is ratcheted to 2,970 (preserving the −426 improvement from
`no-unnecessary-condition`), declined rules pool is baseline 6,364, and
`bun run lint:debt` is exit 0.

Also worth fixing regardless: **add `lint:debt` to `bun run verify`.** Its absence
is why this drifted for eighteen commits (§1.1).

### 2.2 The main target — `prefer-nullish-coalescing`, 210 → 692

**These 482 sites are newly *visible*, not newly *created*.** The rule fires on
`a || b` when `a` can be nullish. Before the flag, an indexed read was typed as
never-undefined, so the rule stayed silent. Now the type admits `undefined` and
the rule reports what was always there.

Why this is a defect surface and not lint noise: `||` treats **`0`, `""` and
`false` as absent**. Every one of these sites is a place where a real zero, an
empty string, or a legitimate `false` silently becomes the fallback value. That
is the same failure class the whole flag program was run to expose, and this
repo has been bitten by it repeatedly — a `||` chain once sent a **Date** to a
boolean bind, and `?? 0` once faked 710/710 longitudes.

**`??` is the correct fix in most cases but not all — and this is the whole
difficulty.** Changing `a || b` to `a ?? b` is a **behaviour change** wherever `a`
can legitimately be `0`, `""` or `false`. That is not a mechanical rewrite:

- If falsy-but-valid values *should* fall through → keep `||`, add an eslint-disable
  with a one-line reason naming the falsy value that matters.
- If only absence should fall through → `??`.
- If the fallback itself is fabricated (`?? 0` on a measurement) → **Rule 9
  applies**: guard, early-return, or throw. Do not swap one fabrication for another.

⚠️ **Do not run `eslint --fix` across this rule.** The autofix is behaviour-changing
at every site where a falsy value is meaningful, and it cannot tell the cases
apart. Read each site.

**Start with the 95 type-verified ones.** Filter with `ignorePrimitives` all
true to get the 126 candidates, then confirm each operand's type is an
object/array — `||` → `??` is exactly equivalent there and needs no judgement.
Do not skip the type check: the filter alone would also admit `any`/`unknown`,
where the two operators differ. That is the only tranche that moves
mechanically; the 566 primitives are the actual work, and each one is a question
about whether a real `0`, `""` or `false` should fall through.

### 2.3 Reproduce the probe

```bash
rm -f .eslintcache                       # content-keyed; see §1.4 trap 3
NODE_OPTIONS=--max-old-space-size=8192 bun scripts/checkLintDebt.ts --top-casts 5
```

For the per-rule table the gate does not print (it reports only regressions),
tabulate independently — note the script must live **inside the repo** so ESM can
resolve `eslint`, and delete it afterwards:

```js
import { ESLint } from "eslint";
const eslint = new ESLint({ overrideConfigFile: "eslint.config.audit.mjs" });
const counts = {};
for (const r of await eslint.lintFiles(["src"]))
  for (const m of r.messages) if (m.ruleId) counts[m.ruleId] = (counts[m.ruleId] || 0) + 1;
console.log(JSON.stringify(counts, null, 2));
```

To list the 482 sites themselves, lint with only that rule promoted and read the
file:line list — then **read each site in source**, not in the lint output.

### 2.4 Loose ends carried forward

- **Retire the 124-entry strict-index allowlist.** With `total: 0`, the ratchet
  already fails on *any* new error, so the allowlist's hard-fail adds nothing.
  Harmless, but it is dead weight and misleading to a reader. Instrument-only
  commit (Rule 1).
- **`src/utils/seasonalTransitions.ts` is broken and was deliberately not fixed.**
  Its table is keyed `_Spring` / `_Autumn` while `Season` is
  `"spring" | "summer" | "fall" | "winter"`, so **every lookup misses** and both
  exported functions previously read `.Fire` off `undefined`. The lookups are now
  guarded and the mismatch documented in place. Neither function has a caller.
  Choosing the intended key set is a **semantic** decision — confirm the intent
  before renaming, and check whether the leading underscore means "disabled".
- **106 `as any` — still untouched**, through Phases 12, 13 and this one. The cast
  surface has not moved: `380` total, exactly the Phase 12 figure. (AST says 103;
  the regex counts 2× `as any[]` plus one inside a template literal.)
- **8 mock casts → `jest.mocked()`.** Ships with @types/jest 30, used **0 times** here.
- **9 duplicate artifact files** (`find src -name '* [0-9].*'`), down from 19. The
  scanner excludes them. ⚠️ The writer was **never identified** — six appeared
  mid-session in Phase 12 while those files were being edited. Deleting them
  clears the symptom only. Instrument before concluding.

### 2.5 ⚠️ Still true: nothing typechecks the test files

`tsconfig.json` excludes `**/*.test.ts(x)`, `**/*.spec.*` and `src/__tests__/**`,
and `isolatedModules: true` puts ts-jest in transpile-only mode. **Measured:** a
test file containing `const f = (x: number) => x; f(1, 2, 3)` — TS2554, wrong
arity — **runs green**.

This did not change when the flag went on. Consequences: a type error in a test
file is invisible in CI; assertions in test files are inert; any test refactor
must be proved by **running the suite**, never by `typecheck`.

⚠️ The first probe of this was self-defeating: the explanatory comment above it
began `// @ts-expect-error`, which **is** the suppression directive and silenced
the very error being tested for. **Never let a probe's prose contain a directive token.**

---

## 3. Strict Operating Rules — Phase 15

Rules 1–13 carry forward unchanged. 14–17 were earned in Phase 13.

1. **Do Not Change the Scanner and the Code in the Same Commit.** Instrument
   changes land alone with the baseline re-recorded before any code work.
2. **`totalAssertionSites` Must Strictly Decrease.** A chain counts as **one**
   site, so `as unknown as T` → `as T` cannot move it.
3. **The Gate's Own Tests Must Be Green** before any baseline ratchet.
4. **Verify with Jest, Never `bun test`.**
5. **Drive Changed-File Tests from `git status`.**
6. **Never Regenerate `scripts/fixtures/snapshot-witness-baseline.json`.** Parity
   breaks are fixed in implementation code.
7. **Production Signatures Are Not a Cast Sink.**
8. **Commit Scoped Changes Atomically.**
9. **Never fix a `noUncheckedIndexedAccess` error with `!` or `?? 0`.** Use a real
   guard, an early return, or a typed accessor returning `T | undefined`. In
   ESMS/physics code prefer a throw naming the missing body over any substituted
   value. **A tranche whose diff is mostly `!` has done negative work.**
   *Phase 15 corollary:* `a || b` → `a ?? b` is not a Rule 9 escape. If the
   fallback value is itself fabricated, the fix is a guard, not a different operator.
10. **`tsc` clean is necessary, not sufficient.** Check the per-rule lint delta.
    *Earned again in Phase 13:* `tsc --noEmit` returned **0 errors** with the flag
    on, and `bun run lint` then reported **23**. "Proven safe by tsc" is a
    half-measurement.
11. **Parse tsc output on the LAST paren**, and count only real error lines.
12. **Do not use `git stash` in this working directory.** Park work as a patch
    (`git diff > work.patch`). Never `git add -A` — concurrent sessions share
    this checkout.
13. **Read exit codes directly, never through a pipe.** Quote glob arguments
    (`--include='*.ts'`) — zsh expands them and silently returns zero matches.
14. **Delete `.eslintcache` on both sides of any compiler-option measurement.**
    The cache is content-keyed; a tsconfig change alters every type-aware result
    while leaving file contents byte-identical. Cached numbers will be stale and
    entirely plausible.
15. **Measure branch scope against `origin/master`, never local `master`.** Local
    `master` was four commits stale and inflated the scope from 20 to 23 across
    four phases. Confirm with `gh api`, which cannot be fooled by a broken ref.
16. **Before deleting an assertion the compiler calls redundant, probe the
    resulting type.** `no-unnecessary-type-assertion` is trustworthy, but the
    reviewer still must confirm the result is not `any` — `executeQuery<T>`
    defaults its parameter to `any`, so a "redundant" assertion there could have
    been the only thing holding a real type.
17. **Check `git diff --cached` before staging.** A hook-rejected commit leaves
    its files staged, and the next commit will silently absorb them under the
    wrong message.
