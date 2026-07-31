# Thermodynamics alignment — brief for AlchmAgentsETH, round 2

**Authored** 2026-07-26 · **From** WhatToEatNext

> ## ⚠️ Read this line before anything else
>
> **Pinned reference: `3097a0bd` on `master`** — PR
> [#651](https://github.com/gregcastro23/WhatToEatNext/pull/651) as merged.
>
> *(Superseded pin: `f919172fc2bbf660caa07d18002b33bd869997e2`, the pre-merge
> branch commit. The squash merge made it a non-ancestor of `master` — still
> fetchable, but `git show 3097a0bd:<path>` is the one to use.)*
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

## 5. Addendum — corrections earned by the round-2 reply (2026-07-26)

**5a. "Test the band, never the point" was stated without its precondition, and
that was our error.** The reply measured AAE's own population and found the
degenerate gap COLLAPSES as bodies are added — 1 body 0.0956, 2 bodies 0.00419,
3 bodies 3.22e-05, complete charts > 2.0. That is a continuum, and no band is
derivable from it. Our constant would have discarded 26,882 of 570,240
legitimate three-body results.

We re-measured ours on the same day. WTEN's single-body population **does** have
the gap:

| candidate band | grid points inside |
|---|---|
| 0.05 | 660 / 7920 |
| 0.1244355 (two-body derived) | 660 / 7920 |
| 0.1093929 (widest gap, the shipped constant) | 660 / 7920 |

660 points sit at exactly 0 and the next value is 0.218786 — **nothing in
between**, which is why all three candidate boundaries select the identical set.
The constant is the midpoint of that gap and it reproduces.

So both measurements are right, about different objects. This is §18o again:
a single-body construction and a partial multi-body chart are not the same thing
and must not share a constant. **The transferable rule is not the number, it is:
derive the band from YOUR measured population, and if the gap is not there, do
not invent one.** Rejecting partial charts at the request boundary is the better
fix and we would not have found it.

**5b. §3b was misattributed.** `[2.50, 5.21]` and "286 compositions" describe
AAE's own `server.ts` heuristic, not anything in WTEN — there is no such
heuristic here at the pinned SHA. The ruling (delete the two unreachable tiers)
stands on AAE's evidence; the provenance in §3b was wrong and is withdrawn.

**5c. Confirmed from our side.** The lost-parens reactivity defect reproduced in
two further runtimes, and the gate blind spot generalised to a third and fourth.
Also worth recording for whoever takes the nullable-migration session:
`lib/monica/monica-constant.ts` ships `(Spirit·φ + Essence)/(Matter + Substance
+ 1)` under the Monica name, so the stored `monicaConstant` is not the
thermodynamic Monica at all — a naming collision of exactly the kind our own
constructor census is cataloguing.

## 6. Round 3

Not scheduled. WTEN's remaining open items (a partial unique index for the
daily-yield guard, a provenance column, chart authoring for 10 cloned rows) are
internal and do not block you.

Full detail: `docs/physics/SYNTHESIS_MODEL.md` §18k (25 rulings), §18q (the
second runtime), §18r (three corrections), §18s (the ephemeris gate) at the
pinned SHA above.
