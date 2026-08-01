# ADR-009: One planetary weight scale — the inertial-mass scale

**Status:** Accepted (ruled 2026-08-01)
**Date:** 2026-08-01
**Supersedes:** the per-scale rulings embedded in `planets.ts`, `planetaryAlchemyMapping.ts`, `natalAlchemy.ts`, and `backend/alchm_kitchen/main.py`

## Context

The repo weights each body's contribution to ESMS and elemental vectors by a
per-planet scalar. There is no single such scalar — there are **five live
implementations across two runtimes**, and they disagree by up to 18× in
*ratio* and invert each other's ranking.

| Scale | Where | Anchors | Pluto | Sun |
|---|---|---|---|---|
| **A — inertial mass** | `src/utils/planetaryAlchemyMapping.ts:298-306`; Python `backend/utils/planetary_alchemy.py:152-161` | one decade **below** Pluto → Sun | 0.1089 | 1.0000 |
| **B — Pluto-anchored mass** | `src/data/planets.ts:35-39` | **at** Pluto → Sun | **0.0000** | 1.0000 |
| **C — orbital period** | `src/data/planets.ts:76-79`; a **duplicate** at `src/services/RealAlchemizeService.ts:47-67`; and an **inline copy in the deployed Python server** at `backend/alchm_kitchen/main.py:491-505,578` | at Ascendant → Pluto | 1.0000 | 0.5131 |
| **D — `NATAL_WEIGHTS` astro blend** | `src/utils/astrology/natalAlchemy.ts:31-42` | unnormalized astro table × 0.6 + Scale B × 0.4 | 0.4800 | 1.3000 |
| **E — Python clone of B** | `backend/utils/planetary_weights.py:59-88` | at Pluto, `round(…, 4)`-quantized | 0.0000 | 1.0000 |

Full per-planet inventory, executed from live source (not transcribed):

| body | A inertial | B Pluto-anch | C period | D natal blend |
|---|---|---|---|---|
| Sun | 1.0000 | 1.0000 | 0.5131 | 1.3000 |
| Moon | 0.1904 | 0.0914 | 0.2843 | 0.9366 |
| Mercury | 0.2612 | 0.1709 | 0.3874 | 0.6684 |
| Venus | 0.3887 | 0.3140 | 0.4701 | 0.7256 |
| Mars | 0.2927 | 0.2062 | 0.5688 | 0.6825 |
| Jupiter | 0.6710 | 0.6308 | 0.7315 | 0.9723 |
| Saturn | 0.6139 | 0.5667 | 0.8119 | 0.9467 |
| Uranus | 0.5251 | 0.4670 | 0.9044 | 0.6668 |
| Neptune | 0.5329 | 0.4758 | 0.9639 | 0.6703 |
| **Pluto** | **0.1089** | **0.0000** | **1.0000** | 0.4800 |
| Ascendant | 1.0000 | 0.3249 *(falls through to Earth's mass)* | 0.0000 *(raw)* | 1.1000 |

Sun/Pluto ratio: **9.18 on A, 0.51 on C** — an 18× swing, rank-inverted.

### How we got here

PR #697 moved the Python **library** onto Scale A and deleted the period table
from `backend/utils/planetary_alchemy.py`. It changed three files, all under
`backend/`, and **none of them was the module Railway serves**. The Procfile runs
`uvicorn backend.alchm_kitchen.main:app`, and that module carries its own inline
copy of the exact table #697 deleted.

**This was verified against the deployed SHA `a2425ca6`** (`railway deployment
list --json` → `meta.commitHash`, identical to `origin/master` HEAD, zero drift),
and then **confirmed behaviourally against production**, not merely by reading
code. The live response exposes `alchmWeight` per body; all ten planets match
Scale C to ≤2.4e-4 and none match Scale A:

```bash
curl -s "https://whattoeatnext-production.up.railway.app/api/philosophers-stone/positions?year=2026&month=8&day=1&hour=12" \
  | python3 -c "import sys,json;d=json.load(sys.stdin);print({k:v['alchmWeight'] for k,v in d['perPlanet'].items()})"
```

Production today: **Sun 0.5131, Pluto 1.0000.** Pluto is the heaviest body in
every chart the API serves, and the Sun is half its weight.

The split is by endpoint inside one deployed process:

| endpoint | scale |
|---|---|
| `POST /alchemize`, `GET+POST /api/philosophers-stone/positions` | **C — period** (inline copy) |
| `POST /api/user/onboarding` | **A — inertial** (imports `backend.utils.natal_alchemy`) |

## Decision

**One scale: A, the inertial-mass scale.** All five implementations converge on
`inertialMassWeight` / `get_inertial_mass_weight`.

### 1. Pluto-at-zero is an artifact, not the model — ruled

Scale B anchors its log-normalization minimum *at* Pluto, so Pluto's weight is
identically `0.0`. Under a gravitational-inertia framing (Λ = diag(M̂·(r̄/r)²)) a
body either exerts mass or is not in the system; a body cannot be *in* the chart
and contribute nothing. The zero is the extremum-annihilation failure mode
already documented for the Ascendant on the Python period scale (§18k, PR #683).

Scale A already implements the correct fix and says so at
`planetaryAlchemyMapping.ts:288-291`: its zero is anchored one decade below the
lightest charted body, so *"the scale's zero is a mass no charted body has, so no
member is annihilated."* **Pluto's baseline is therefore 0.1089** — no new
constant is invented; the ruling adopts the anchor that already exists.

**Correction to the framing that prompted this ADR.**
`src/__tests__/physics/esmsConformance.test.ts:107` pins
`normalizePlanetWeight(PLANET_WEIGHTS.Pluto) === 0`, but it did **not** enshrine
the artifact as intended behaviour. It is a deliberate **positive control**, and
its comment at `:104-106` says so:

> `normalizePlanetWeight` anchors AT Pluto, so Pluto is exactly 0 on that scale —
> the same extremum-annihilation that zeroed the Ascendant on the period scale
> (PR #683). POSITIVE CONTROL first: the trap is real.

The same is true of `:168-169`, which pin the Ascendant's 0.3249 fall-through and
assert it is `not` the vessel weight. These tests already document Scale B as
wrong; they are evidence *for* this ADR, not obstacles to it. They therefore need
no "ripping out" — they break only if `normalizePlanetWeight` is **deleted**, not
when callers migrate off it.

**Ruling on their fate:** keep `normalizePlanetWeight` and these controls until
the last caller is migrated, then delete function and controls together in the
final commit. `src/__tests__/data/planets.test.ts:61-62` (`Pluto → 0.0` at 2dp)
goes with them.

⚠️ **Do not "fix" this by re-anchoring Scale A.** The canonical ESMS path and the
thermodynamic-affinity calibration are pinned against Scale A's current anchors;
moving them would silently move both. The migration moves *callers* onto A, it
does not change A.

### 2. The Ascendant is RULED 1.0, everywhere

On Scale A the Ascendant is special-cased to `ASCENDANT_VESSEL_WEIGHT = 1.0`
(`planetaryAlchemyMapping.ts:279`). On Scale B it has no mass entry and falls
through `?? 1.0` to **Earth's** relative mass → 0.3249, an accident of the
fallback rather than a ruling (documented at `:270-273`). On raw Scale C it
normalizes to exactly 0.0 — the vessel is inert. Migration fixes all three at
once: **0.3249 → 1.0, a 3.08× change**, and this is the single largest driver of
output movement (see Consequences).

### 3. `NATAL_WEIGHTS`: normalize the astro term, and take its mass term from A

The blend is declared as "60% astrological tradition + 40% physical mass"
(`natalAlchemy.ts:33`). It is not. `PLANETARY_WEIGHTS_ASTRO` is **unnormalized**
(range 0.8–1.5), so the astro term ranges 0.48–0.90 while the mass term — on
Scale B, capped at 0.40 and *floored at 0* — ranges 0.0000–0.40.

Measured astro share of each body's final weight:

| body | astro term | mass term | astro share |
|---|---|---|---|
| Sun | 0.9000 | 0.4000 | 69.2% |
| Moon | 0.9000 | 0.0366 | **96.1%** |
| Mercury | 0.6000 | 0.0684 | 89.8% |
| Mars | 0.6000 | 0.0825 | 87.9% |
| Jupiter | 0.7200 | 0.2523 | 74.1% |
| **Pluto** | 0.4800 | **0.0000** | **100.0%** |

The declared 60/40 is in practice ~80/20, and for Pluto it is **100/0 — the
"physical mass grounding" contributes literally nothing.**

**Ruling:** normalize the astro table **by its maximum**, and source the mass term
from Scale A:

```ts
const _ASTRO_MAX = Math.max(...Object.values(PLANETARY_WEIGHTS_ASTRO)); // 1.5
astroWeight / _ASTRO_MAX * 0.6 + inertialMassWeight(planet) * 0.4
```

**Divide-by-max, NOT min-max.** Min-max normalization would map the lowest astro
value (0.8: Uranus, Neptune, Pluto) to exactly 0 — reintroducing on the astro
axis the precise annihilation defect this ADR exists to remove. Measured: under
min-max Pluto lands at 0.0436; under divide-by-max it lands at 0.3636.

`NATAL_WEIGHTS` before → after:

| body | before | after | Δ | astro share before → after |
|---|---|---|---|---|
| Sun | 1.3000 | 1.0000 | −0.3000 | 69.2% → 60.0% |
| Moon | 0.9366 | 0.6761 | −0.2604 | 96.1% → 88.7% |
| Mercury | 0.6684 | 0.5045 | −0.1639 | 89.8% → 79.3% |
| Venus | 0.7256 | 0.5555 | −0.1701 | 82.7% → 72.0% |
| Mars | 0.6825 | 0.5171 | −0.1654 | 87.9% → 77.4% |
| Jupiter | 0.9723 | 0.7484 | −0.2239 | 74.1% → 64.1% |
| Saturn | 0.9467 | 0.7256 | −0.2211 | 76.1% → 66.2% |
| Uranus | 0.6668 | 0.5300 | −0.1368 | 72.0% → 60.4% |
| Neptune | 0.6703 | 0.5331 | −0.1372 | 71.6% → 60.0% |
| Pluto | 0.4800 | 0.3636 | −0.1164 | **100.0% → 88.0%** |
| Ascendant | 1.1000 | 1.0000 | −0.1000 | 81.8% → 60.0% |

The astro term is now capped at exactly 0.6 as declared, and every body's mass
term is non-zero.

⚠️ **`0.6` itself remains UNBASED.** It is a bare literal with no derivation, and
normalizing the astro table does not give it one. This ADR makes the blend
*coherent*, not *derived*. Either rule it explicitly with a rationale or replace
`NATAL_WEIGHTS` with pure `inertialMassWeight` — tracked as an open item below.

### 4. Kill the inline period table in the deployed Python server

Delete `PLANET_ALCHM_PERIODS`, `PERIOD_LOG_MIN/MAX` and `normalize_alchm_weight`
from `backend/alchm_kitchen/main.py` (`:491-505`, `:578`) and route `:652` and
`:799` through `backend.utils.planetary_alchemy.get_inertial_mass_weight` — the
import that `/api/user/onboarding` already uses at `:336`.

### 5. Retire Scale C in TypeScript, and its duplicate

`src/services/RealAlchemizeService.ts:47-67` holds a second private copy of the
period table (momentum only; ESMS already moved to the inertial engine per its
own comment at `:286-287`). `src/utils/agentMonicaTwoBody.ts:486` reads the
`planets.ts` copy. Both migrate to Scale A.

Note the fallback hazard on the way out: on the period scale `?? 1.0` means
"unknown body → **Pluto**, the heaviest weight" (`RealAlchemizeService.ts:288`,
`agentMonicaTwoBody.ts:486`), which the code itself flags as fabrication at
`:278-279`. On Scale A the same `?? 1.0` means "unknown → Earth's mass" (0.3984).
Neither is acceptable; the migration should make unknown bodies throw.

⚠️ **RULED: decision 5 ships as its own PR, after 1–4 have landed.** Retiring
Scale C invalidates constants that the B→A move does not touch —
`FALLBACK_METRICS`, the 1821-sample `alchemicalSamples.json` they were measured
over, and the two-body Sacred-7 monica scale (see Consequences). Bundling them
would couple two independent constant-regeneration efforts and make rollback
all-or-nothing across both the economy and the momentum paths. Decisions 1–4
alone leave the system strictly more coherent than today, so they are a valid
stopping point if 5 slips.

## Consequences

### Chart-level output movement (TypeScript)

Measured over 8,000 sampled charts per configuration (deterministic LCG, uniform
independent sign per body), comparing `aggregateEnhancedZodiacElementals` on
Scale B vs Scale A:

| configuration | dominant-element flips | max element delta |
|---|---|---|
| without Ascendant | **7.95%** | 0.0633 |
| **with Ascendant** | **34.36%** | 0.1359 |

The Ascendant's 3.08× correction dominates. On today's real sky (2026-08-01, the
positions the live API returned) the shift is milder and the dominant element
holds: Fire 0.4615 → 0.4279, Earth 0.0315 → 0.0478 (**+52% relative**), Pluto's
share of total weight 0.00% → 2.38%.

> Sampling caveat, stated honestly: uniform independent sign draws are not
> astronomically realistic (Mercury and Venus stay near the Sun; outer planets
> move slowly and cluster across a birth cohort). Treat 7.95% / 34.36% as the
> flip rate over the *space of sign combinations*, an upper bound on the rate
> over real natal charts — not as a user-impact forecast. A cohort-accurate
> figure needs a sweep over real ephemeris dates.

### Production endpoint movement (Python)

Recomputing the **actual live prod response** for 2026-08-01 12:00 with Scale A
weights, holding every other input fixed:

| | now (period) | after (inertial) | change |
|---|---|---|---|
| Spirit | 2.3563 | 2.5148 | **+6.7%** |
| Essence | 4.2849 | 2.8429 | **−33.7%** |
| Matter | 3.1436 | 2.0826 | **−33.8%** |
| Substance | 2.0792 | 1.6148 | **−22.3%** |

Normalized shares move materially — Spirit 0.1986 → 0.2777 (**+0.0791**), Essence
0.3612 → 0.3140. Pluto's share of summed weight falls 10.90% → 1.61%. Downstream
`kalchm` (currently 121.498) and `monica` (0.0431) both move; **their golden
vectors must be regenerated, not hand-edited.**

### Calibrated constants this migration invalidates

**PR #701 — merged 2026-08-01, the same day as this ruling — must be redone.**
Its constants are definitively Scale-B-derived. `thermodynamicAffinity.ts:167-169`
states the basis: *"MEASURED — re-derived by `thermodynamicAffinityCalibration.test.ts`
on every run."* That test's population builder
(`thermodynamicAffinityCalibration.test.ts:114-118`) feeds
`aggregateEnhancedZodiacElementals` — Scale B — into every sky state:

- `THERMO_AFFINITY_SD` (`thermodynamicAffinity.ts:171-173`) is the per-axis SD
  over 1490 pooled rows, **1460 of which (98%) are Scale-B elementals.**
- `THERMO_AFFINITY_D0 = 1.903549175561494` (`:189`) is the median over 21,900
  reachable distances — **every one has a Scale-B moment on one side.**
- Axis-influence pins 32.9 / 62.1 / 5.0 (`calibration.test.ts:287-289`).
- The quantile doc (`:181-184`) and the `0.3094` threshold arithmetic in
  `restaurantScoring.ts:495-496`, which is a **comment** — it will go stale
  silently, with no test to catch it.

Because `RECALIBRATION_PENDING = false` on master and the test re-derives on
every run, these pins **go red immediately** on migration. That is the gate
working, not a regression: the calibration must be re-measured over Scale-A
elementals and the constants regenerated — never hand-edited.

**A moment state is currently mixed-basis inside a single object.** ESMS comes
from `getGravitationalInertia` → `inertialMassWeight` (Scale A,
`planetaryAlchemyMapping.ts:606`) while elementals come from
`normalizePlanetWeight` (Scale B, `:775`). Unifying removes an incoherence that
exists *within* every calibration row today.

**Retiring Scale C has its own landmine field** (these are NOT touched by the
B→A move, but are hit by decision 5):

- `enhancedCompatibilityScoring.ts:116-128` `FALLBACK_METRICS` — measured over
  `src/data/alchemicalSamples.json` (1821 samples), which
  `scripts/generateAlchemicalSamples.ts` generates through `RealAlchemizeService`
  — the **period** scale. **No test re-derives these**, so they drift silently.
- The two-body Sacred-7 monica scale (`agentMonicaTwoBody.ts:120-152`, re-derived
  by `monicaPopulationScaleDerivation.test.ts`) is period-scale-pinned.

**Golden vectors: no regeneration needed.** `docs/physics/esms_conformance.json`
is Scale-A-only and carries no elemental fields; `backend/tests/kalchm_golden_vectors.json`
is pure ESMS→kalchm math with no planetary weights. `alchemicalSamples.json` is
period-scale and is a decision-5 problem, not a B→A one.

**The deployed Python period table has the opposite risk: it is completely
untested.** `backend/tests/test_kalchm_parity.py:21-24` deliberately avoids
importing `backend.alchm_kitchen.main` (it would pull fastapi/sqlalchemy/pyswisseph
and break collection), so **nothing pins `main.py:491`. Nothing will break, and
nothing will tell you it moved.** Its replacement needs a new test, written first.

### Persisted state — the migration's real risk, and it touches money

The current *divergence* does not endanger the token economy: yield and pricing
already run on Scale A. The **migration** does, because weight-derived values are
persisted and then compared against freshly-computed ones.

**`user_yield_profiles` is the critical row.** `DailyYieldService.ts:212-223`
writes `spirit/essence/matter/substance_weight`, and the cache is keyed by
`natal_chart_hash` — which `hashNatalChart` (`:58-59`) computes from **planet→sign
positions only**. A weight-scale change does not move that hash, so
`DailyYieldService.ts:191` returns the stale row **forever**. These weights scale
real token payouts (`:310-313`). This table has the strongest backfill obligation
in the system and **its row count is documented nowhere** in code, docs,
migrations, or scripts — the largest single unknown in this plan. Establish it
before scheduling the migration.

**Two live cross-scale arithmetic sites will silently mis-price during rollout:**

1. `src/lib/economy/celestial.ts:190` averages the **stored** natal weights
   against a **freshly computed** sky:
   `(natal[coin] + sky.transitWeights[coin]) / 2 - BASELINE_WEIGHT`. During
   migration one term is old-scale and the other new-scale, in one mean. There is
   no drift detector on this path; it mis-prices every practice reward and the
   daily budget (`:207`).
2. `DailyYieldService.calculateTransitBonus:241-251` recomputes `natalESMS` fresh
   and differences it against the **cached** `transitESMS` — so within a single
   claim the bonus is new-scale while the base is old-scale.

**The cron schedule actively mixes scales.** `cache-ephemeris` (00:05 UTC) writes
new-scale `transit_esms`; `agents-daily-yield` (00:30 UTC) then combines it with
old-scale cached natal weights. `synthetic-onboarding` runs **every 15 minutes**,
writing fresh-scale charts continuously throughout any rollout.

⚠️ **`monica-backfill.yml` is, by its own header, "the ONLY workflow in the
repository that WRITES to production."** It runs nightly at 06:45 UTC and would
rewrite every classified agent onto the new scale the first night after deploy —
whether or not you were ready. **Disable it before the migration deploys.**

**The drift detector will fire, and its remediation message misdirects.**
`scripts/checkAgentMonicaDrift.ts` compares stored vs recomputed at `TOLERANCE =
1e-5` and classifies any mismatch as a **defect that "cannot happen through
ordinary operation"** (`:368-372`), failing `master` pushes and the 07:15 cron. On
migration **all 469 two-body and 71 full-chart rows drift at once**, and `:434-447`
tells the operator to re-run `backfillMonicaPerConstruction.ts` — which would
"fix" the alarm by rewriting production onto the new scale unreviewed.

**Write-once (needs explicit backfill):** `user_yield_profiles`;
`user_profiles.monica_*` (every writer gated on `monica_method IS NULL` /
`COALESCE`, i.e. first-time classification only); `users.profile` and
`user_profiles.natal_chart` JSONB (written at onboarding/ignite only — the lazy
migration at `user/profile/route.ts:115-117` repairs longitudes, never ESMS);
`alchemical_constitutions`; `manual_companion_charts.natal_chart`; historical
`daily_ephemeris_cache` rows; `transit_history` (append-only by design).

**Self-healing:** `livePricing` (per request, persists nothing);
`tables.composite_snapshot` (but only *after* member charts are backfilled, since
it averages stored rows).

**Affected populations, from code and docs only — no database was queried:**
469 two-body + 71 full-chart monica rows are weight-sensitive; the 4281
single-body rows are **not** (single-body uses a flat `VESSEL_MASS = 4`, no
per-planet weight). ~75 of 5015 `user_profiles` rows carry a real chart. Agents
grow ~50/day.

**Two uncertainties to close before executing:** (1) the `user_yield_profiles`
cardinality; (2) if `HONO_API_URL` is set, `user/profile/route.ts:57-65` proxies
to an out-of-repo gateway — if that gateway stores or returns `stats`, then
`UserContext.stats` flips from self-healing to backfill-required.

## Migration order

Ordering is not cosmetic here — persisted state written under an old scale
becomes incoherent the moment readers move, and a backfill run from a branch
"corrects" production data while production still runs the old writer.

**Step 0 — before any code changes.**
- Establish the `user_yield_profiles` row count. It is the strongest backfill
  obligation and its cardinality is unknown.
- **RULED: disable `monica-backfill.yml`** (nightly 06:45 UTC, by its own header
  the only workflow that writes to production) **before the migration deploys,
  and re-enable it only after the intended backfill has run and been verified
  against the deployed SHA.** Leaving it armed means it rewrites every classified
  agent onto the new scale the first night, unreviewed — and it would do so while
  `checkAgentMonicaDrift` is red for reasons that look unrelated, with that
  script's own remediation text pointing the operator at this very workflow. A
  scale-version guard on the job is the better long-term fix and should follow,
  but it does not protect *this* migration unless it is built first.
- Pause `synthetic-onboarding` (every 15 min) for the rollout window, or accept
  that it writes fresh-scale charts throughout.
- Add a test for `main.py`'s weighting path. It has **none** today, so the Python
  change would otherwise be unverifiable by construction.

**Step 1 — make the cache scale-aware, in three parts. RULED: all three, not
just the first.**

Hash-versioning alone is **insufficient**, and the reason is specific. The two
readers of `user_yield_profiles` do not agree on freshness:

- `DailyYieldService.getYieldWeights` **does** gate on the hash
  (`DailyYieldService.ts:191`) and recomputes + upserts on a mismatch. Versioning
  the hash makes this path self-heal.
- `celestial.ts:getNatalWeights` (`:149-171`) selects the four weight columns
  **`WHERE user_id = $1` with no hash column in the query at all.** It cannot
  observe a version bump. It would keep averaging stale Scale-B weights against a
  fresh new-scale sky for every inactive user, indefinitely.

So:

1. **Add a scale identifier to `hashNatalChart`** (`DailyYieldService.ts:58-59`),
   which today hashes `JSON.stringify(positions)` only. This is the permanent
   guard — it makes *every future* scale change self-invalidating instead of
   silent.
2. **Make `celestial.ts` respect the same gate**, so it fails closed rather than
   serving a row it cannot prove is current. **Verified safe:** `getNatalWeights`
   returning `null` makes `rewardFor` fall back to
   `clamp(sky.skyMultiplier, REWARD_MIN, REWARD_MAX)` (`celestial.ts:190`) — an
   unpersonalized but fully coherent reward. The degraded state is *less
   personalized*, never *wrong*.
3. **Flush the existing rows** so no path can serve a pre-migration weight during
   rollout. Each row rebuilds on that user's next claim.

The combination has no window in which any reader serves a stale weight, which
in-place recomputation cannot promise (it has a half-migrated interval), and
unlike a bare flush it prevents the trap from recurring.

**Step 2 — TypeScript and Python together, per surface**, writers and readers in
the same commit. They share golden vectors; a one-sided deploy breaks
cross-runtime parity by construction.

**Step 3 — re-derive, never transcribe.** Run
`thermodynamicAffinityCalibration.test.ts` to regenerate `THERMO_AFFINITY_SD`,
`THERMO_AFFINITY_D0` and the axis-influence pins from the Scale-A population, and
hand-update the `restaurantScoring.ts:495` threshold comment, which no test
guards.

**Step 4 — quiesce the drift detector deliberately.** `checkAgentMonicaDrift.ts`
will report 540 defects. Expect it, and do **not** follow its remediation text.
Re-enable it only after the backfill, so it regains its meaning as a real gate.

**Step 5 — backfill, then verify against the deployed SHA.** Backfill only after
the new writer is live in production. A backfill run from a branch corrects
production data while production still runs the old writer.

## Open items

- **RULED — the `0.6` in `NATAL_WEIGHTS` stays, and gets a written basis.** It is
  kept as a deliberate **RULED** convention, not promoted to MEASURED: with the
  astro table normalized by max, 0.6 now means what it always claimed to mean —
  astrological convention carries the larger share of a natal interpretive
  weight, physical mass the smaller. That is a product judgement about what a
  natal chart *is*, and it is legitimately ruled rather than measured. Record the
  rationale inline where the constant is defined. Deliberately **not** derived:
  there is no target metric today to fit it against, and inventing one would
  launder a hand value into a false "MEASURED".
- The `0.6/0.4` **sign/sect** split is a different constant that happens to share
  the number (`planetaryAlchemyMapping.ts:776-777`,
  `RealAlchemizeService.ts:291-296`, `main.py:656-657`). Still unbased; not ruled
  here. Do not assume the two 0.6s are related.
- `PLANETARY_WEIGHTS_ASTRO` values are themselves unbased hand numbers. Normalizing
  the table does not fix this — it makes their *scale* coherent, not their
  *values*. Still open.
- Unknown-body fallbacks (`?? 1.0`) silently fabricate a weight in both runtimes.
  Should throw.
- `backend/alchm_kitchen/recipe_generator.py:15-21` carries stale comments
  claiming Neptune ≈ 0.8160 where the code yields 0.4758 (1.7× off). Comment
  drift only, no runtime effect — but fix while nearby.
- **Uncovered behaviour change:** because Pluto's Scale-B weight is exactly 0,
  `count += w` never advances for a Pluto-only positions map, so
  `aggregateEnhancedZodiacElementals` hits its `count === 0` guard
  (`planetaryAlchemyMapping.ts:781-783`) and returns the flat 0.25 vector. Under
  Scale A it returns real Water. **No test exercises this** — add one before
  migrating, so the change is observed rather than discovered.
- **Possible live constraint violation, found while mapping writers (reported as
  a read, not a confirmed failure):** `src/app/api/agents/unified/route.ts:321-343`
  inserts `monica_constant` = a full-chart value together with
  `monica_method = 'full-chart'`, and never sets `monica_full_chart`. That appears
  to violate both `monica_constant_single_body_only` and
  `monica_method_matches_column` from `72-monica-construction-constraints.sql:36-65`.
  Worth a direct check independent of this ADR.
- **CONFIRMED: the calibration population does not match production.**
  `thermodynamicAffinityCalibration.test.ts:70-93` builds a one-hot single-ruler
  cuisine state from `PLANETARY_SECTARIAN_ALCHEMICAL[profile.planetaryRuler]`,
  while production uses the mass-weighted `deriveCuisineAlchemical`
  (`restaurantScoring.ts:197`) that #700 shipped to get cuisine ESMS **off the
  binary lattice**. Verified on `a2425ca6`: the suite passes 17/17 — because it
  re-derives and pins *its own* output, it is self-consistent and green while
  calibrating over a cuisine population production no longer uses. So #701's
  constants need re-deriving for a second, independent reason, and this one is
  live on master **today**, before any scale migration. Tracked as #706 — land
  it **before** this ADR so the migration is measured against a correct cuisine
  population instead of compounding two derivation errors.
