# The Unified Alchm Physics Model (v2)

Status: **design settled, unimplemented.** Twenty decisions taken 2026-07-20.
Scope: WhatToEatNext (WTEN), AlchmAgentsETH, Pentacles, and PlanetaryAgents.

This supersedes the per-repo engines. Today all four repos compute ESMS
differently and **disagree axiomatically** — verified from source, not recalled:

| Repo | Current rule |
|---|---|
| WTEN | ESMS from planet identity × sect. `planetaryAlchemyMapping.ts:7`: *"ESMS values CANNOT be derived from elemental properties"* |
| Pentacles | `math.js:78` — `compToEsms = (c) => [c.Fire, c.Water, c.Earth, c.Air]`. ESMS **is** elements, by identity cast |
| AlchmAgentsETH | `astrological-dignities-engine.ts:305` — `spirit * dignity_multiplier * signQuality.fire`. ESMS **times** elemental quality |
| PlanetaryAgents | ≥5 live ESMS/dignity sources; dignity multiplier `(strength+5)/10`, Neutral = **0.5** |

Why this matters more than it looks: the free-body diagram's entire premise is
that the **element compass** and the **ESMS compass** are two independent
readings of one sky. Derive one from the other and the roses collapse — the
resultant vector silently becomes a re-plot of the element vector. The card
still renders. It still looks plausible. It means nothing. That is the same
failure mode as the shipped `Q 0.00` bug, wearing a different hat.

---

## The twenty decisions

### Core derivation

**1. ESMS source = planet identity × sect**, with continuous positional physics
layered on top (not replacing it). The lookup stays authoritative for *which
axes* a planet touches; physics modulates *how much*.

**2. Sect is binary and required everywhere.** No repo may default to day when
it lacks horizon data. Pentacles has **no sect concept at all** (control-checked:
`diurnal|nocturnal` matches only "semidiurnal arc" house math) and must acquire
one — see Open Problems.

**3. The grounding vessel is generalized and positional.** The Ascendant's flat
`{1,1,1,1}` becomes a function of its **degree, decan, and sign**. This is
load-bearing, not decorative: measured on a real ten-planet chart, the vessel
supplies **80% of day-chart Matter and 97% of Substance**. Drop it and a day
chart's Matter/Substance collapse while still looking plausible.

Generalizing it also gives non-natal hosts a legitimate anchor — a player's
deck, an agent's identity — rather than a hole.

**4–6, 9. Weight becomes real gravitation, with two distinct physical roles.**

This is the model's sharpest idea and it maps exactly onto what a free-body
diagram *is*:

| Term | Formula | Role |
|---|---|---|
| **Inertia** | `M / r²` | how hard this planet is to **move** |
| **Pull** | `M / r³` (tidal) | how hard it **acts on others** |

No blend constant, no fitted exponent — each term earns its place by doing a
different job. `r` is the **live geocentric distance**, per moment, so weight
responds to the actual sky (Mars at opposition is ~2.2× closer than at
conjunction — a ~10× swing under an inverse cube).

The tidal choice is not arbitrary: the Moon's tidal effect on Earth is **~2.2×
the Sun's**, which is the real measured ratio. Under plain `M/r²` the Sun would
outweigh the Moon ~179× and the Moon would effectively vanish.

⚠️ Live `r` needs a `distance` field. WTEN's position payload carries one;
Pentacles' Rust store does not.

**7. Dignity keeps two scales, and crossing them is forbidden.** ESMS scale
(±7/±10) and display/food scale (±1/±2) stay separate. Using the food scale on
an ESMS surface was a **real shipped bug**; enforce with a lint rule, not
discipline. PA's `(strength+5)/10` (Neutral = 0.5) **halves every neutral planet
and zeroes a fallen one** — isolate it, never rescale into it.

**8, 15. Granularity is sign + decan.** Pentacles already has `decans.js` and a
`natal_decan` table, so this unifies *toward* its existing strength. Elements
keep WTEN's 60% sign + 40% sect spine, **decan-modulated**.

### Aspects

**10–11. Cosine-bell falloff, and applying state modifies strength.**
`(1+cos(π·orb/maxOrb))/2`, multiplied by an applying bonus. An applying aspect
is building; a separating one is discharging. Strength therefore stops being a
pure function of orb — noted as a deliberate cost, since it makes drift testing
harder.

Both engines' applying/separating detection is **already correct** and uses a
signed model (WTEN's `signedOrb`, Pentacles' `signedDelta`). Do not "simplify"
either into differencing an unsigned orb — that inverts the verdict near exact,
precisely where aspects matter most.

**12. Aspect universe = ten planets + Ascendant.** Nodes, MC and Chiron carry no
ESMS, so an aspect to them is a phantom force. Pentacles must drop Chiron from
aspects (it may keep it for display). This exclusion is why `"North Node"`
leaking past a misspelled filter was a real bug.

**13. Aspect effects split by inverse inertia AND dignity**, as a composite
**self-normalizing** function (shares sum to 1, which is what keeps decision 16
satisfiable).

`F = ma → a = F/m`: the same aspect moves the Moon far more than it moves
Saturn. This replaces an arbitrary 50/50 with the model's own physics — and it
reframes the card honestly, because the resultant becomes an **acceleration**,
not a force.

**14, 19. Full 45-pair coverage, derived rather than transcribed.** The goal is
every planet pair (not today's privileged four), achieved by an **interaction
rule** computed from the two planets' ESMS signatures + aspect type, with
hand-authored overrides only for archetypally specific pairs (New Moon
depletion, Mars–Venus). ~10 exceptions instead of 540 hand-entered values that
would drift and could not be tested.

### Downstream

**17. Thermodynamics stay** (heat, entropy, reactivity, gregsEnergy, kalchm,
monica) — **but "inertia" must be reconciled.** The word currently means three
different things in one engine:

- `reactivity`'s `Earth²` floor
- kinetics' `1 + Matter + Earth + Substance/2`
- and now gravitational `M/r²`

Three definitions of one word in one system is exactly the confusion that
produced the ESMS/element collapse. Pick one meaning; rename the others.

**18. Kinetics unify into the shared engine** — merging toward the *better*
implementation, not automatically WTEN's. AlchmAgentsETH's `alchemical-kinetics.ts`
already thinks in `ForceVector` terms, which is the FBD's own vocabulary.

**16. The reconciliation invariant is absolutely binding.**

```
Σ parts + residual === total     (all four axes, day AND night)
```

Verified bit-exact (`0.00e+0`) on live positions today. Every new layer must be
expressible as an additive decomposition with an explicit residual. **If a
feature cannot satisfy it, the feature changes — not the invariant.** This is
what makes the model falsifiable rather than merely plausible, and it is the
guard that caught the bug where every card read `Q 0.00`.

**20. The model is versioned, and every stored value carries its version.** Old
values stay readable and comparable; new reads recompute. This makes the cutover
reversible, lets a golden fixture pin each version's behaviour, and — critically
— lets **Pentacles' minted decks stay on v1** while display and physics move to
v2. Deck minting hashes `p.dignity`, so an unversioned cutover would **re-mint
every player's deck**: a gameplay change wearing a UI change's clothes.

### Distribution and drift

- **Packaging: bun.** WTEN and AlchmAgentsETH both run bun, so `bun build` emits
  the package and `bun link` covers local development. Pentacles is a Vite MPA
  with **zero `.ts` under `src/`** outside generated bindings, so it consumes a
  pre-built ESM artifact, not TS source.
- **Drift guard: shared conformance suite + golden fixture.** One fixed chart,
  day and night, snapshotting all ten cards' `esms`, `dignity.multiplier`,
  `physics.alchmWeight` and `resultant.angleDeg`. Cross-repo drift becomes a diff
  instead of a debugging session. The existing suite is runner-agnostic —
  verified zero jest-specific dependencies, so it runs under vitest, bun test or
  plain node.

---

## Open problems — decided in principle, unsolved in practice

These are **not** implementation details. Each needs a real answer before code.

1. **The composite self-normalizing attribution function (13) is unspecified.**
   "Inverse inertia AND dignity, self-normalizing" fixes the inputs and the
   constraint, not the form. Needs a written formula plus a proof it preserves
   the invariant under decision 16.

2. **The pair-interaction rule (19) does not exist.** "Derive from the planets'
   ESMS signatures + aspect type" needs an actual operation — blend? oppose?
   amplify? Without it, "45 pairs, derived" has no derivation.

3. **The positional vessel function (3) is unspecified.** Degree/decan/sign → a
   four-axis contribution. Currently `{1,1,1,1}`; what replaces it, and does it
   still sum to something that keeps day charts from collapsing?

4. **"Inertia" is triple-booked (17)** and must be disambiguated before the
   gravitational term lands, or the third meaning silently merges with the
   other two.

5. **Pentacles cannot supply sect, an Ascendant, or live distance.** Its Rust
   store keeps `arc_minutes: u16` — one arc-minute granularity, while the card's
   ruler runs at 4px/arcmin. Decisions 2, 3 and 6 all assume data it does not
   have. Either its `server/src/chart.rs` grows those fields, or Pentacles
   renders a payload computed elsewhere.

6. **PlanetaryAgents' call graph is untraced.** ≥5 live ESMS/dignity sources;
   nobody has established which feed rendered surfaces. Until that map exists,
   any migration there risks two contradictory ESMS readouts on one page.

7. **Every stored value changes.** Live-distance weighting alone re-scales every
   planet's contribution continuously. Decision 20 (versioning) makes this
   survivable but does not make it free — WTEN natal charts, cached ESMS, and
   Pentacles' minted decks all need a migration story.

---

## Sequencing

1. Close open problems 1–4 (they are pure design; no repo blocks them).
2. Build the shared package with the conformance suite + golden fixture **first**.
   Watch it fail against every current engine — that failure is the honest baseline.
3. Land it in **AlchmAgentsETH**, which already vendors the v1 engine and has the
   drift tripwire wired (`test/alchm-fbd/sharedAncestry.test.ts`).
4. Trace PA's call graph, then migrate PA.
5. Pentacles last, and only after deciding open problem 5.

## Provenance

Every "current state" claim was verified by opening the cited file on
2026-07-20. Claims marked ⚠️ are unverified. Do not transcribe from comments —
WTEN's own sect-element header disagreed with its own code for four planets
until PR #623, and two comments misreported the Moon's weight as 0.17 (it is
0.284; 0.17 is *Mercury's mass* weight, copied between two different scales).
Read the code, run the numbers.
