# Thermodynamics alignment — brief for AlchmAgentsETH, round 2

**Authored** 2026-07-26 · **From** WhatToEatNext

> ## ⚠️ Read this line before anything else
>
> **Pinned reference: `f919172fc2bbf660caa07d18002b33bd869997e2`**
> (branch `claude/wten-thermodynamics-completion-852fa3`, PR
> [#651](https://github.com/gregcastro23/WhatToEatNext/pull/651))
>
> Every file path and line number below is relative to **that commit**. A bare
> filesystem path is *not* a reference to a version, and the reader cannot tell
> they got the wrong one.
>
> This is not a hypothetical. Round 1's audit reported our canonical engine as
> "still containing the older epsilon-floor implementation". That was **true of
> the checkout it read** — `~/Desktop/WhatToEatNext-master` sits on a stale
> feature branch, many commits behind — and **false of the project**. Resolve
> this brief with `git show <sha>:<path>`, or fetch and check out the SHA.

---

## 1. Two corrections you earned

Round 1's brief was wrong on both of these. Your audit was right to push back.

**1a. Single-body degeneracy is NOT structural.** The brief said it tests
`esms.Essence === 0`. It does not. Single-body degeneracy uses the **derived
`|ln kalchm|` band**, `MONICA_LN_EPSILON = 0.10939293407637272` — itself the
midpoint of a *measured* bimodal gap whose lower endpoint is now exactly 0. The
`Essence === 0` set sits at `|ln k| ∈ [1.06, 5.55]`, far outside that band. The
structural test belongs to **two-body only**, where it was right 206 of 648 times
(32%) as a threshold and so was replaced by its cause.

**1b. A zeroed axis does NOT imply `kalchm === 1`.** It is neither sufficient nor
necessary. Of 5400 zeroed-axis grid cells, **4980 have `kalchm ≠ 1`**; of 660
degenerate cells, **240 have no zeroed axis**. The only real condition is
`S^S·E^E === M^M·Su^Su`. This claim lived inside a *passing* WTEN test for two
days because no assertion covered it — fixed in WTEN #649.

---

## 2. The finding that likely applies to you

**A second runtime was implementing the formula, and our gate could not see it.**

WTEN's `scripts/checkNoStrayKalchmFormula.ts` is a **TypeScript** AST gate. It
proved "one engine" convincingly and completely — for TypeScript. A Python
FastAPI module at `backend/alchm_kitchen/main.py` had been serving production
traffic the whole time.

If AlchmAgentsETH has **Solidity, Rust, SQL or a notebook** touching these
quantities, the same blind spot applies. Enumerate your runtimes explicitly
rather than assuming the gate's scope equals the project's scope.

### The cross-runtime hazard worth knowing

```python
(-0.5) ** (-0.5)   # Python → (8.659560562354934e-17-1.4142135623730951j)  COMPLEX
```
```js
Math.pow(-0.5, -0.5)   // JS → NaN
```

The runtimes differ in **TYPE**, not merely in value. In our case a complex
denominator made `complex or 1` truthy (so the fallback never fired) and then
`kalchm > 0` raised `TypeError`, surfacing as an HTTP 500. **Do not infer
cross-runtime agreement from a shared formula — test it.**

We now pin both runtimes with shared golden vectors that each suite reads from
one file:

| file | role |
|---|---|
| `backend/tests/kalchm_golden_vectors.json` | the contract — 12 kalchm/monica + 5 thermodynamic vectors |
| `backend/tests/test_kalchm_parity.py` | Python half |
| `src/__tests__/kalchmCrossRuntimeParity.test.ts` | TypeScript half, owns the expected values |

You are welcome to copy that file wholesale; it is deliberately runtime-neutral
JSON. **Generate your expected values from your canonical implementation — do not
transcribe ours.** On our first pass 9 of 12 hand-written monica values were
wrong.

### The most dangerous defect we found, in case you share it

A bare `if ln_k != 0` guard instead of a **band**. It excludes exactly one point
and does nothing about `ln_k` merely *small*:

| kalchm | bare `!= 0` guard | correct (band) |
|---|---|---|
| 1.00002 | **−49999.5** | φ = 1.618 |

That value is **finite and plausible**, so it survives every downstream
`isfinite` / `Number.isFinite` check and lands in the database. A NaN at least
announces itself. **Test the band, never the point.**

### And one to check by inspection

Our Python reactivity read `(reactivity_num / (matter or 1)) + earth ** 2` —
the canonical `num / (Matter + Earth)²` **with the parentheses lost**, so Earth
left the denominator and became an additive term. Measured 16.875 vs 5.320
(**3.17×**). The two forms agree **only when Earth = 0 and Matter = 1**, which is
why nobody noticed. Since `monica = −G/(R·ln K)`, this made monica un-matchable
across runtimes even with an identical kalchm engine.

Worth grepping for in any port of the thermodynamics.

---

## 3. Carried authorisations

**3a. The nullable Monica/Kalchm migration — APPROVED, in a dedicated session.**
`kalchmConstant NOT NULL` and `user_profiles.monicaConstant NOT NULL` currently
make **ABSENT unrepresentable**, which is why registration writes `0.5`. You were
right to revert rather than work around it. A literal substituted for an absent
value invents data; propagate `null` and handle absence at the display layer.

**3b. Remove the two unreachable tier labels — RULED.** Exhaustive enumeration of
all 286 compositions proves the heuristic can only produce `[2.50, 5.21]`, so
"Advanced" and "Master" are unattainable. Delete them rather than widen the range.

---

## 4. Method notes that cost us the most

1. **A zero result is a claim requiring a control test.** Every false all-clear in
   this programme came from a broken search, not clean code: unquoted
   `--include=*.ts` (the shell expands it → zero matches, always); TS generic call
   syntax putting the type argument before the paren so `grep 'fn('` misses the
   declaration; ugrep silently rejecting backreferences. **Prove a search works by
   making it find something you know exists, and say so.**
2. **grep cannot attribute symbols.** `calculateKalchm` is declared in several
   modules and `calculateKAlchm` (capital A) is a further, differently-cased
   family. Use the type checker.
3. **Before deleting anything as dead, try to REFUTE that.** We were instructed to
   delete a file as unreachable; three verifiers with different lenses returned
   REACHABLE 3/3, and an `export *` in a barrel turned out to be publishing that
   file's *worst-in-repo* implementation as the public `calculateKalchm`. Prefer
   delegation — it is reversible and fixes behaviour either way.
4. **A green test does not validate the prose beside it.** If a comment states a
   measurable relationship, assert it.

---

## 5. Round 3

Not scheduled. WTEN's remaining open items (a partial unique index for the
daily-yield guard, a provenance column, chart authoring for 10 cloned rows) are
internal and do not block you.

Full detail: `docs/physics/SYNTHESIS_MODEL.md` §18k (25 rulings), §18q (the
second runtime), §18r (three corrections), §18s (the ephemeris gate) at the
pinned SHA above.
