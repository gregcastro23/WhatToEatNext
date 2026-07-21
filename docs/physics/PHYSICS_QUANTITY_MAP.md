# Physics-quantity definition map

> Generated 2026-07-20 by a parallel audit over `origin/master`. This is the raw
> evidence behind [SYNTHESIS_MODEL.md](./SYNTHESIS_MODEL.md) §14 — every
> duplicate definition of every core physics quantity, with file:line, the
> literal expression, its callers, and whether it is reachable.
>
> **Read §14 first for the conclusions.** This file is the working reference for
> anyone actually doing the reconciliation: it is what tells you which of the
> nine live dignity multipliers a given module is using.
>
> Two caveats on using it:
>
> - **Line numbers drift.** They were accurate at `origin/master` on 2026-07-20.
>   Grep for the expression, not the line.
> - **"Dead" means no reachable caller at audit time**, established by tracing
>   importers transitively. Confirm before deleting — a module can become live
>   again between the audit and the deletion.

---

# Physics-quantity definition map — WhatToEatNext (branch `docs/synthesis-model`)

All paths absolute-rooted at `/Users/cookingwithcastro/Desktop/WhatToEatNext-master/`.

---

## INERTIA — 9 distinct definitions (+5 copies of the "conceptual" inertia)

| file:line | expression | callers | live/dead |
|---|---|---|---|
| `src/calculations/kinetics.ts:99-103` | `Math.max(1, currentTotals.Matter + currentTotals.Earth + currentTotals.Substance / 2) * modifiers.inertia` | 12 call sites of `calculateKinetics`: `hierarchicalRecipeCalculations.ts:437`, `monicaKalchmCalculations.ts:459,502,534`, `naturalLanguageProcessor.ts:720`, `lunarPhaseUtils.ts:397,443,508`, `kineticCuisineCompatibility.ts:506`, `useChartData.ts:207`, `calculations/index.ts:185,378`, `PlanetaryKineticsClient.ts:112` | **LIVE** |
| `src/calculations/kinetics.ts:286` | `inertia:  1.0 + w * 0.20` (planetary modifier keyed `inertia`) | 1 (`getPlanetaryModifiers`, consumed at :102) | **LIVE** |
| `src/utils/kineticCalculations.ts:134` | `const inertia = Math.max(1, Matter + Earth + Substance / 2);` | 6 call sites of `calculateKineticProperties`: `mealCircuitCalculations.ts:107`, `ingredientRecommendation.ts:1301`, `ingredientRecommendation 2.ts:1306`, `EnhancedIngredientRecommender.tsx:502,507`, `PlanetaryCalculationsDemo.tsx:270` | **LIVE** (Demo + " 2" copies dead) |
| `src/app/api/alchm-quantities/route.ts:188-195` | `Math.max(1, quantities.Matter + quantities.Substance + nowAlch.elementalProperties.Earth * 10)` | public GET route; consumed by `/quantities`, `alchm-kinetics.tsx` | **LIVE** |
| `src/utils/cookingMethodKinetics.ts:455-458` | `Math.max(0.5, 1 + (transformedESMS.Matter + earthEmphasis + transformedESMS.Substance / 2) * 0.1)` | 4: `tiltSkilletCircuit.ts:140`, `methodAlchemicalSnapshot.ts:166`, `EnhancedCookingMethodRecommender.tsx:535` | **LIVE** |
| `src/utils/hierarchicalRecipeCalculations.ts:455` | `const recipeInertia = 1 + (Matter + Substance) * 0.1;` | 1: `calculateRecipeKinetics` ← `hierarchicalRecipeCalculations.ts:367` (reached from `RecipeDataEnricher`, `UnifiedIngredientService`, `cuisineSauceProfiler`) | **LIVE** |
| `src/lib/alchemical-kinetics.ts:459-461` | `const base = Math.max(1, 1 + input.matter + input.earth + input.substance / 2); const adjusted = base * getPlanetaryInertiaModifier(...)` | 1: `alchemical-kinetics-sampler.ts:145` — and the **sampler has zero importers** | **DEAD** |
| `src/lib/celestial-energy-calculator.ts:25-27` | `function computeInertia(_elements: ElementVector): number { return 0 }` (stub) | 1: same file `:413`; module's only importer `degree-agent-matcher.ts` has zero importers | **DEAD** |
| `src/utils/kineticCalculations.ts:55` / `kineticCuisineCompatibility.ts:559` | `inertia: 1` (zero-state) / `totalInertia / count` (mean) | aggregation, not a formula | LIVE (derived) |

**Conceptual inertia** — the reactivity denominator `(Matter + Earth)²`, i.e. "resistance to transformation", appears 5 times with no shared helper:

| file:line | expression | live/dead |
|---|---|---|
| `src/calculations/gregsEnergy.ts:161` | `const reactivityDen = Math.pow(Matter + Earth, 2);` (+ `Math.min(..., 10)` soft cap at :165) | **LIVE** |
| `src/calculations/core/alchemicalEngine.ts:257` | `const reactivityDen = Math.pow(Matter + Earth, 2);` (no cap) | **LIVE** |
| `src/calculations/core/kalchmEngine.ts:139` | `const denominator = Math.pow((Matter \|\| 0) + (Earth \|\| 0), 2);` (returns `0.5` on zero) | **LIVE** |
| `src/utils/monica/calculations.ts:20` | `const reactivityDenom = Math.pow(matter + earth, 2);` (returns `0` on zero) | **LIVE** |
| `src/services/UnifiedScoringService.ts:805-809` | `Math.pow((itemAlch.Matter \|\| 0) + (itemElem.Earth \|\| 0), 2)` inlined | **LIVE** |

---

## FORCE — 9 distinct definitions

| file:line | expression | callers | live/dead |
|---|---|---|---|
| `src/calculations/kinetics.ts:149-150` | `force[element] = ((kineticForce + electromagneticForce) / 2) * modifiers.force;` where `kineticForce = (currentMomentum - previousMomentum)/timeInterval` (`:140-143`) and `electromagneticForce = charge * (potentialDifference + velocity[element] * monica)` (`:145-146`) | 12 (see above) | **LIVE** |
| `src/calculations/kinetics.ts:156` | `forceMagnitude = Math.sqrt(Σ force[el]**2)` | same | **LIVE** |
| `src/calculations/kinetics.ts:288` | `force:    1.0 + w * 0.25` (planetary modifier) | 1 | **LIVE** |
| `src/utils/kineticCalculations.ts:157-162` | `force = { Fire: momentum.Fire / inertia, Water: momentum.Water / inertia, Earth: momentum.Earth / inertia, Air: momentum.Air / inertia }` — **algebraically identical to `velocity`**, since `momentum = inertia * velocity` two lines above | 6 | **LIVE** |
| `src/utils/kineticCalculations.ts:165-170` | `forceMagnitude = Math.sqrt(momentum.Fire**2 + momentum.Water**2 + momentum.Earth**2 + momentum.Air**2)` — norm of **momentum**, not of the `force` vector it returns | 6 | **LIVE** |
| `src/utils/cookingMethodKinetics.ts:476-482` | `kineticForce = profile.forceImpact * emphasis; emForce = charge * (potentialDifference + velocity[element] * monicaValue) * 0.01; force[element] = (kineticForce + emForce) / 2;` | 4 | **LIVE** |
| `src/utils/hierarchicalRecipeCalculations.ts:456` | `const recipeForce = recipePower * recipeInertia;` → per-element at `:489-494` `recipeForce * (Spirit/(S+E+M+Su))` etc.; `forceMagnitude: Math.abs(recipeForce)` `:495` | 1 | **LIVE** |
| `src/app/api/alchm-quantities/route.ts:197` | `const forceMagnitude = round(Math.abs(power) / Math.max(inertia, 1), 6);` | public route | **LIVE** |
| `src/lib/alchemical-kinetics.ts:351,401-411` (`computeForce`) | `const dp = momentumSample.p[el] - previousMomentum.p[el]; const base = safeDivide(dp, dt); rawF[el] = base * getPlanetaryForceModifier(...)` | 1: dead sampler `:156` | **DEAD** |
| `src/utils/ingredientValidation.ts:1170-1187` (`calculateForceMagnitude`) | `opposingForce = Math.sqrt(Fire*Water + Earth*Air) * 2; return opposingForce + maxElement;` | 2 internal (`:1105`, `:1249`); module has **zero importers** | **DEAD** |

---

## MOMENTUM — 7 distinct definitions

| file:line | expression | callers | live/dead |
|---|---|---|---|
| `src/calculations/kinetics.ts:130` | `momentum[element] = inertia * velocity[element];` | 12 | **LIVE** |
| `src/utils/kineticCalculations.ts:137-142` | `{ Fire: inertia * velocity.Fire, … }` | 6 | **LIVE** |
| `src/app/api/alchm-quantities/route.ts:94-105` (`buildMomentum`) | `Spirit: round(quantities.Spirit * velocity.Spirit, 6)` … — **ESMS-keyed, mass = the quantity itself, no inertia** | route | **LIVE** |
| `src/utils/cookingMethodKinetics.ts:466-468` | `momentum[element] = inertia * velocity[element] * profile.momentumRetention;` | 4 | **LIVE** |
| `src/utils/hierarchicalRecipeCalculations.ts:505-510` | `{ Fire: recipeInertia * recipeAcceleration * 0.4, Water: … * 0.3, Earth: … * 0.2, Air: … * 0.1 }` | 1 | **LIVE** |
| `src/calculations/planetaryFBD.ts:751` | `const momentum = speed !== null ? speed * contribution.alchmWeight : null;` (°/day × alchemical weight) | `/planetary-chart`, `/birth-chart`, `PlanetFBDCard.tsx` | **LIVE** |
| `src/lib/alchemical-kinetics.ts:262-267` (`computeElementalMomentum`) | `p = { Fire: current.inertia * current.v.Fire, … }` | dead sampler | **DEAD** |
| `src/lib/celestial-energy-calculator.ts:402-407` | `{ Fire: elements.Fire * 1.2, Water: elements.Water * 0.8, Air: elements.Air * 1.1, Earth: elements.Earth * 0.9 }` | dead chain | **DEAD** |
| `src/lib/kinetics-client.ts:79` | `momentum: includeElemental ? 1 + Math.cos((args.lon * Math.PI) / 180) * 0.2 : 1` (synthetic) | `consciousness-memory.ts` only (mutual-import pair, no external entry) | **DEAD** |
| `src/lib/kinetics-integration.ts:62-66, 88` | `momentum: data.forceMagnitude` — **aliases forceMagnitude to momentum** | zero importers | **DEAD** |

---

## VELOCITY — 8 distinct definitions

| file:line | expression | callers | live/dead |
|---|---|---|---|
| `src/calculations/kinetics.ts:92-95` | `velocity[element] = timeInterval > 0 ? ((currentValue - previousValue) / timeInterval) * modifiers.velocity : 0` | 12 | **LIVE** |
| `src/calculations/kinetics.ts:285` | `velocity: 1.0 + w * 0.15` (modifier) | 1 | **LIVE** |
| `src/utils/kineticCalculations.ts:124-129` | `baseVelocity = (Spirit + Air) / 2;` then `{ Fire: baseVelocity * (Fire + Spirit/2), Water: baseVelocity * (Water + Essence/2), Earth: baseVelocity * (Earth + Matter/2), Air: baseVelocity * (Air + Substance/2) }` — **static, no time derivative** | 6 | **LIVE** |
| `src/app/api/alchm-quantities/route.ts:169` (`buildVelocity`, def at `:95`) | `(now − prev)/deltaHours` per ESMS key | route | **LIVE** |
| `src/utils/cookingMethodKinetics.ts:451` | `velocity[element] = emphasis * profile.velocityFactor * planetaryBoost * velocityMultiplier;` | 4 | **LIVE** |
| `src/utils/hierarchicalRecipeCalculations.ts:499-504` | `{ Fire: recipeAcceleration * 0.4, Water: * 0.3, Earth: * 0.2, Air: * 0.1 }` — velocity derived from **acceleration** | 1 | **LIVE** |
| `src/utils/lunarPhaseUtils.ts:556-566` (`calculatePhaseVelocity`) | `baseVelocity = 0.7 + (velocityBoost \|\| 0) * 0.3` (waxing) / `0.3 − … * 0.2` (waning) / `1.0` full / `0.1` new — `velocityBoost` is documented always-`undefined` | `useTarotAstrologyData`, `restaurantDiscoveryService` | **LIVE** (but boost term always 0) |
| `src/utils/aspectKinematics.ts:84-85` | `orbVelocity = signedNow === 0 ? Math.abs(signedRate) : Math.sign(signedNow) * signedRate` (d\|orb\|/dt, °/day) | `/api/alchm-quantities/aspects`, `planetaryFBD.ts` | **LIVE** — different domain (angular), not ESMS |
| `src/lib/planetary-motion-tracker.ts:197` | `Math.abs(dailyMotion) / profile.averageDailyMotion` (dimensionless relative speed) | in-module | LIVE-ish, separate domain |
| `src/lib/alchemical-kinetics.ts:165-171` | `dv = current.totals[el] − previous.totals[el]; rawV[el] = safeDivide(dv, dt) * getPlanetaryVelocityModifier(...)` | dead sampler | **DEAD** |
| `src/lib/celestial-energy-calculator.ts:400` | `const velocity: ElementVector = { ...elements }` (identity) | dead chain | **DEAD** |
| `src/services/skyConditionsService.ts:481` | `netVelocity = Σ m.velocityImpact` (aspect-modifier sum) | admin dashboard | **LIVE**, separate domain |

---

## POWER — 10 distinct definitions

| file:line | expression | callers | live/dead |
|---|---|---|---|
| `src/calculations/kinetics.ts:159` | `const power = currentFlow * potentialDifference * (1 + forceMagnitude / 10);` | 12 | **LIVE** |
| `src/utils/kineticCalculations.ts:154` | `const power = currentFlow * potentialDifference;` (no force boost) | 6 | **LIVE** |
| `src/app/api/alchm-quantities/route.ts:187` | `const power = round(currentFlow * potentialDifference, 6);` | route | **LIVE** |
| `src/app/api/alchm-quantities/route.ts:456-458` | `apparentPower = potentialDifference * acCurrent; realPower = apparentPower * powerFactor; reactivePower = apparentPower * Math.sin(phaseAngle);` — AC decomposition, 3 more power quantities | route | **LIVE** |
| `src/utils/cookingMethodKinetics.ts:440` | `const power = currentFlow * potentialDifference * (1 - adjustedResistance);` | 4 | **LIVE** |
| `src/utils/hierarchicalRecipeCalculations.ts:452` | `const recipePower = recipeCurrent * recipePotential;` | 1 | **LIVE** |
| `src/services/UnifiedScoringService.ts:753, 817` | `const userPower = userCurrent * userVoltage;` / `const itemPower = itemCurrent * itemVoltage;` where `current = reactivity` (not `reactivity*charge*0.1`) | `AlchemicalRecommendationService`, `RecipeService`, `UnifiedScoringAdapter` | **LIVE** |
| `src/services/HistoricalStatsService.ts:157-161` | `charge = Matter+Substance; potential = energy/charge; flow = reactivity*charge*0.1; p = flow*potential` — 4th independent replica of the alchm-quantities block | `/api/alchm-quantities`, `/api/recommendations/recipes` | **LIVE** |
| `src/utils/circuitOptimization.ts:206-207` | `const estimatedPower = (alchemicalProps.Spirit + alchemicalProps.Essence) * 10;` — no I, no V | `MenuPlannerProvider`, `weeklyCircuitCalculations`, `intelligentSauceRecommender` | **LIVE** |
| `src/utils/naturalLanguageProcessor.ts:982-1005` | `let power = 50;` then `+= 25` grill/fry, `-= 15` steam/poach, `+= 20` spice — 0–100 scale | module has zero importers | **DEAD** |
| `src/lib/alchemical-kinetics.ts:310-327` (`computePower`) | `basePower = safeDivide(dE, dt); power = basePower * getSolarAmplification(...)` | **zero callers anywhere** (not even the dead sampler) | **DEAD** |
| `src/lib/celestial-energy-calculator.ts:411` | `const power = metrics.Heat + metrics.Entropy + metrics.Reactivity + metrics.Energy` | dead chain | **DEAD** |
| `src/lib/kinetics-client.ts:48-57` (`powerCurve`) | `base = 0.7 + Math.sin(phase) * 0.3 * latFactor; Math.max(0.4, Math.min(1, base))` | dead pair | **DEAD** |
| `src/utils/recipeCircuit.ts:40-47` | `inputPower = power; losses = currentFlow ** 2 * resistance; outputPower = inputPower - losses` (resistance = entropy) | `tiltSkilletCircuit`, `mealCircuitCalculations`, `kineticCuisineCompatibility`, `circuitBasedRecipeRanking` | **LIVE** (derived) |
| `src/utils/dayCircuitCalculations.ts:190` | `const expectedPower = averageCurrent * totalVoltage;` (KVL check against `totalPower` sum) | `MenuPlannerProvider` | **LIVE** |
| `src/utils/tiltSkilletCircuit.ts:194-196` | `totalPower = Σ r.power`; `seriesCurrent = totalPotential / totalResistance` | `/api/generate-tilt-skillet-plan` | **LIVE** |

---

## CHARGE — 6 distinct definitions

| file:line | expression | callers | live/dead |
|---|---|---|---|
| `src/calculations/kinetics.ts:78` | `const charge = currentTotals.Matter + currentTotals.Substance;` | 12 | **LIVE** |
| `src/utils/kineticCalculations.ts:145` | `const charge = Matter + Substance;` | 6 | **LIVE** |
| `src/app/api/alchm-quantities/route.ts:184` | `round(quantities.Matter + quantities.Substance, 6)` | route | **LIVE** |
| `src/utils/cookingMethodKinetics.ts:427` | `Math.max(0.01, transformedESMS.Matter + transformedESMS.Substance)` — **floored at 0.01** | 4 | **LIVE** |
| `src/utils/hierarchicalRecipeCalculations.ts:442` | `const recipeCharge = Matter + Substance;` | 1 | **LIVE** |
| `src/calculations/planetaryFBD.ts:831` | `charge: esms.Matter + esms.Substance` (aspect-inclusive) | 3 | **LIVE** |
| `src/services/UnifiedScoringService.ts:742, 814` | `alch.Matter + alch.Substance` / `(itemAlch.Matter \|\| 0) + (itemAlch.Substance \|\| 0)` | 4 | **LIVE** |
| `src/services/HistoricalStatsService.ts:157` | `alch.esms.Matter + alch.esms.Substance` | 2 | **LIVE** |
| `src/utils/ingredientValidation.ts:1229-1232` | `(elementalProperties.Earth + elementalProperties.Water) / 2` — **elemental, commented "Matter + Substance"** | zero importers | **DEAD** |

---

## POTENTIAL / VOLTAGE — 5 distinct definitions

| file:line | expression | callers | live/dead |
|---|---|---|---|
| `src/calculations/kinetics.ts:117` | `const potentialDifference = charge > 0 ? gregsEnergy / charge : 0;` | 12 | **LIVE** |
| `src/utils/kineticCalculations.ts:148` | `charge > 0 ? gregsEnergy / charge : 0` | 6 | **LIVE** |
| `src/app/api/alchm-quantities/route.ts:185` | `round(charge > 0 ? energy / charge : 0, 6)` | route | **LIVE** |
| `src/utils/hierarchicalRecipeCalculations.ts:445` | `recipeCharge > 0 ? gregsEnergy / recipeCharge : 0` | 1 | **LIVE** |
| `src/services/UnifiedScoringService.ts:745-748, 815` | `userCharge > 0 ? gregsEnergy / userCharge : 0` | 4 | **LIVE** |
| `src/services/HistoricalStatsService.ts:160` | `charge > 0 ? energy / charge : 0` | 2 | **LIVE** |
| `src/utils/cookingMethodKinetics.ts:431` | `profile.voltage * (1 + gregsEnergy * 0.05) * planetaryBoost` — **table-driven, not E/Q**; `voltage` literals at `:38-310` (27 methods) | 4 | **LIVE** |
| `src/utils/ingredientValidation.ts:1233-1236` | `(elementalProperties.Fire + elementalProperties.Air) / 2` | zero importers | **DEAD** |
| `src/utils/dayCircuitCalculations.ts:150` | `totalVoltage = sum(c.potentialDifference)` (series) | `MenuPlannerProvider` | **LIVE** (derived) |

---

## CURRENT — 6 distinct definitions

| file:line | expression | callers | live/dead |
|---|---|---|---|
| `src/calculations/kinetics.ts:121-123` | `chargeVelocity = (charge − previousCharge)/timeInterval; currentFlow = reactivity * chargeVelocity * modifiers.current;` — **true dQ/dt** | 12 | **LIVE** |
| `src/calculations/kinetics.ts:287` | `current:  1.0 + w * 0.15` (modifier) | 1 | **LIVE** |
| `src/utils/kineticCalculations.ts:151` | `const currentFlow = reactivity * charge * 0.1;` — **static charge, not dQ/dt** | 6 | **LIVE** |
| `src/app/api/alchm-quantities/route.ts:186` | `round(reactivity * charge * 0.1, 6)` | route | **LIVE** |
| `src/app/api/alchm-quantities/route.ts:455` | `acCurrent = impedance > 0 ? potentialDifference / impedance : 0` — Ohm's law over |Z| | route | **LIVE** |
| `src/utils/cookingMethodKinetics.ts:435` | `profile.current * thermodynamics.reactivity * planetaryBoost` — table-driven | 4 | **LIVE** |
| `src/utils/hierarchicalRecipeCalculations.ts:449` | `const recipeCurrent = reactivity * (heat / 100);` — **heat, not charge** | 1 | **LIVE** |
| `src/services/UnifiedScoringService.ts:750, 816` | `const userCurrent = reactivity;` / `const itemCurrent = reactivity;` — **bare reactivity** | 4 | **LIVE** |
| `src/services/HistoricalStatsService.ts:161` | `reactivity * charge * 0.1` | 2 | **LIVE** |
| `src/utils/dayCircuitCalculations.ts:146-149` | `averageCurrent = mean(c.currentFlow)` | 1 | **LIVE** (derived) |
| `src/utils/tiltSkilletCircuit.ts:195` | `seriesCurrent = totalResistance > EPS ? totalPotential / totalResistance : 0` | 1 | **LIVE** (derived) |

---

# Plain answers

**Distinct definition counts (LIVE only, excluding pure aggregations):**

| quantity | live distinct defs | dead defs | total |
|---|---|---|---|
| inertia | 6 (+5 copies of the `(M+Earth)²` conceptual form, +1 modifier) | 2 | **9** |
| force | 7 | 2 | **9** |
| momentum | 6 | 4 | **10** |
| velocity | 8 (2 in a different, angular domain) | 3 | **13** |
| power | 10 (incl. 3 AC variants) | 4 | **14** |
| charge | 8 (5 numerically identical) | 1 | **9** |
| potential | 8 (6 numerically identical) | 1 | **9** |
| current | 9 | 0 | **9** |

**Do they agree numerically?**

- **Charge and potential are the only two that mostly agree.** All eight live charge sites reduce to `Matter + Substance` and all six E/Q potential sites reduce to `gregsEnergy / charge` — same input, same number. Two disagree: `cookingMethodKinetics.ts:427` floors charge at 0.01 (differs only when `M+S < 0.01`), and `cookingMethodKinetics.ts:431` replaces V entirely with a per-method lookup table (never agrees).

- **Inertia: no two of the six live definitions agree on any input.** On the same ESMS+elements: `kinetics.ts:99` gives `max(1, M+E+S/2)·(1.0…1.25)`; `kineticCalculations.ts:134` gives `max(1, M+E+S/2)` — these differ by the planetary factor alone (up to +25%). `alchm-quantities:188` gives `max(1, M+S+E·10)` — different term set *and* an Earth weight 10× larger with Substance at full weight instead of half; for typical `M≈1, S≈1, Earth≈0.25` it returns `4.5` where the other two return `2.25`/`~2.5`. `cookingMethodKinetics.ts:455` compresses the same sum by ×0.1 into `[0.5, ~1.5]`. `hierarchicalRecipeCalculations.ts:455` drops Earth entirely. `alchemical-kinetics.ts:459` (dead) adds a spurious extra `+1`. **Ranges do not even overlap**: the recipe/method forms live near 1.0–1.5, the route form near 3–8.

- **Force: the three live per-element definitions are mutually contradictory, and one is degenerate.** `kineticCalculations.ts:157-162` computes `force = momentum / inertia`, which — given `momentum = inertia · velocity` at `:137` — is *exactly `velocity`*. That module therefore returns velocity twice under two names. Separately, its `forceMagnitude` (`:165`) is the norm of **momentum**, not of the `force` field it returns, so `forceMagnitude ≠ |force|` in that module by a factor of `inertia`. `kinetics.ts:149` is a dp/dt+EM average; `hierarchicalRecipeCalculations.ts:456` is `P · m` (power times inertia — this has units of energy·mass, not force, and grows with inertia where every other definition shrinks). `alchm-quantities:197` is `|P| / m`, which is **inversely proportional to inertia** — i.e. it moves in the opposite direction from the recipe definition on the same input. Feeding one ESMS state through `kinetics.ts` and `route.ts` produces force magnitudes differing by orders of magnitude and, under changing inertia, opposite signs of derivative.

- **Current is the widest split.** `kinetics.ts:123` is `reactivity · (dQ/dt) · modifier` (a genuine rate, sign-varying, ≈0 in steady state); `kineticCalculations.ts:151` / `route.ts:186` / `HistoricalStatsService.ts:161` are `reactivity · Q · 0.1` (always positive, proportional to charge, never zero); `UnifiedScoringService.ts:750` is bare `reactivity` (drops charge entirely); `hierarchicalRecipeCalculations.ts:449` is `reactivity · heat/100` (charge replaced by heat). On a steady state where `dQ/dt = 0`, definition 1 returns **0** and definitions 2–4 return a nonzero positive number — these can never be reconciled.

- **Power inherits every upstream disagreement and adds one of its own:** `kinetics.ts:159` multiplies `I·V` by `(1 + forceMagnitude/10)`, `kineticCalculations.ts:154` and `route.ts:187` do not, and `cookingMethodKinetics.ts:440` multiplies by `(1 − adjustedResistance)`. Given identical I and V, `kinetics.ts` returns a strictly larger number than `kineticCalculations.ts` whenever force is nonzero. `circuitOptimization.ts:206` abandons P=IV entirely for `(Spirit+Essence)·10` and is then compared, at `:159-165`, against `dayCircuit.totalPower` which *was* computed via P=IV — that comparison is between two incommensurable scales.

- **Momentum: `alchm-quantities`'s `buildMomentum` is the outlier.** Every other live definition is `inertia × velocity` with a shared scalar inertia; the route uses each ESMS quantity as its own mass (`Spirit · v_Spirit`, …), so it never consults `inertia` at all — the `inertia` it computes at `:188` is used *only* by `forceMagnitude` at `:197`. `planetaryFBD.ts:751` uses a third basis (`°/day × alchmWeight`).

**Dead modules confirmed (verified by importer trace, not assumption):** `src/lib/alchemical-kinetics-sampler.ts` (zero importers) → makes all of `src/lib/alchemical-kinetics.ts`'s compute* functions unreachable; `src/lib/celestial-energy-calculator.ts` (only importer `src/lib/degree-agent-matcher.ts`, itself zero importers); `src/lib/kinetics-client.ts` ↔ `src/lib/agents/consciousness-memory.ts` (mutual import, no external entry); `src/lib/kinetics-integration.ts` (zero importers); `src/utils/ingredientValidation.ts` (zero importers — the one grep hit is a coincidental local variable name in `src/utils/data/processing.ts:256`); `src/utils/naturalLanguageProcessor.ts` (zero importers); `src/components/PlanetaryCalculationsDemo.tsx` and all `* 2.tsx/ts` duplicate files. `computePower` in `src/lib/alchemical-kinetics.ts:310` has **zero callers even within its own dead module**.
I have the full map. Here is the audit.

# Multiply-defined physics quantities: HEAT, ENTROPY, REACTIVITY, GREGSENERGY, KALCHM, MONICA

Scope note: I counted a **definition** as any site that computes the quantity from more primitive inputs (ESMS/elements/other quantities). I excluded pure pass-throughs (`const heat = thermo.heat`), display fallbacks, and *comparison* functions (`calculateKalchmResonance`, `calculateMonicaAlignment`, `calculateHeatCompatibility` in `src/utils/cuisine/thermodynamicResonance.ts`) — those consume the quantity rather than define it. I flag them at the end because several silently re-derive a value.

---

## HEAT

| file:line | expression | callers | live/dead |
|---|---|---|---|
| `src/utils/monicaKalchmCalculations.ts:48` | `(spirit²+fire²)/(substance+essence+matter+water+air+earth)²`, `denominator>0 ? n/d : 0` | 15 importers (tiltSkilletCircuit, hierarchicalRecipeCalculations, cuisineAggregations, thermodynamicResonance, cuisineSauceProfiler, methodAlchemicalSnapshot, EnhancedIngredientRecommender, CookingMethodPreview, EnhancedCookingMethodRecommender, lib/recipe-nft/fingerprint, menuPlanner/nutritionalCalculator, calculations/core/alchemicalCalculations…) | **LIVE — de-facto hub** |
| `src/calculations/core/kalchmEngine.ts:64` | same numerator/denominator, but `if (denominator === 0) return 0.5` | 7 importers (signVectors, nutritionalCalculator, calculations/index, core/alchemicalCalculations, core/index) | **LIVE** |
| `src/data/unified/alchemicalCalculations.ts:75-80` | `heatNum / Math.max(heatDen, 0.01)` | 11 importers (signVectors, natalAlchemy, nutritional, ingredients, RecommendationAdapter, AlchmKitchen) | **LIVE** |
| `src/services/RealAlchemizeService.ts:437-442` | `heatNum / (heatDen \|\| 1)` | 22 importers — planetary-chart page, `/api/alchm-quantities`, `/api/personalized-recommendations`, `/api/generate-cosmic-recipe`, `lib/economy/livePricing` | **LIVE — canonical prod path** |
| `src/services/RealAlchemizeService.ts:741-743` | byte-identical second copy in the same file (`alchemizeFromTotals`-style path) | same module | **LIVE (intra-file duplicate)** |
| `src/services/ThermodynamicsClient.ts:51-56` | `heatNum / (heatDen \|\| 1)` | only `src/hooks/useThermodynamics.ts`, which has **0 consumers** | **DEAD** |
| `src/services/UnifiedScoringService.ts:546-556` | same, with `\|\| 0` guards on every term | 4 consumers | **LIVE** |
| `src/services/UnifiedScoringService.ts:771-782` | third copy, `itemAlch`/`itemElem` variant | same module | **LIVE (intra-file duplicate)** |
| `src/calculations/gregsEnergy.ts:137-142` | `heatDen > 0 ? heatNum/heatDen : 0` | 9 importers (methodAlchemicalSnapshot, mealCircuitCalculations, CookingMethodPreview, EnhancedCookingMethodRecommender, FoodAlchemySystem, calculations/index) | **LIVE** |
| `src/lib/core-energy-rules.ts:118-135` | `CoreEnergyCalculator.calculateHeat`, `denominator===0 ? 0` | only `galileo-logger.ts` imports the file, and only `ANumberCalculator` from it | **DEAD** |
| `src/utils/monica/calculations.ts:8-10` | `heatDenom === 0 ? 0 : heatNum/heatDenom` | `utils/monica/cache.ts` (15 importers) + `LivePlanetaryTracker` (0 consumers) | **LIVE via cache** |
| `src/services/RecommendationAdapter.ts:661-692` | canonical shape but with `Math.max(denom, 0.1)` and then **clamped** `Math.min(Math.max(heat,0.1),1.0)` | 1 consumer | **LIVE** |
| `src/app/recipes/[recipeId]/RecipeClient.tsx:437-438` | `(spirit*spirit+fire*fire)/(denomHeat*denomHeat)`, `denomHeat = Math.max(0.0001, …)` | in-file `AlchemicalScoreSection` | **LIVE (UI)** |
| `src/utils/recommendation/ingredientRecommendation.ts:1146-1149` | canonical shape on **fabricated ESMS** (`Spirit=(Fire+Air)/2`…), fallback `0.5` | in-file `calculateMonicaOptimization` | **LIVE** |
| `src/utils/recommendation/ingredientRecommendation.ts:1245-1248` | same again, fallback `0.08` | in-file kinetics block | **LIVE** |
| `src/utils/recommendation/ingredientRecommendation 2.ts:1151,1252` | byte-identical to the above two | **zero importers** | **DEAD (orphan duplicate file)** |
| `src/utils/astrologyUtils.ts:2573-2575` | `(Spirit²+Fire²)/Math.max(1, (Essence+Matter+Water+Air)²)` — **denominator omits Substance and Earth**, and ESMS are faked as `Spirit=Fire+Air`, `Essence=Water+Earth` | `transformItemsWithPlanetaryPositions` (re-exported in `utils/index.ts`; the only real call site in `RecommendationAdapter.ts:29` is hard-set to `null`) | **effectively DEAD** |
| `src/utils/astrologyUtils.ts:2649` | `heat = (Fire + Air) * compatibilityScore` | local `calculateThermodynamicProperties`, called at :2345 inside the same dead-ish transform | **effectively DEAD** |
| `src/constants/alchemicalEnergyMapping.ts:278` | `heat = 0.6*Spirit + 0.4*Substance` — **linear, no elements, no denominator** | `ElementalEnergyDisplay.tsx` (0 consumers), `constants/index` barrel | **DEAD** |
| `src/services/AlchemicalService.ts:160` | `heat = (Fire + Air) / 2` | 2 consumers incl. `lib/mcp/tools.ts:181` | **LIVE (MCP tool surface)** |
| `src/services/IngredientService.ts:641` | `heat = (Fire + Air) / 2` | 6 consumers | **LIVE** |
| `src/services/UnifiedRecommendationService.ts:700` | `heat = (Fire + Air) / 2` (self-documented as a NaN-sentinel honest path) | live service | **LIVE** |
| `src/data/unified/recipes.ts:281` | `heat = (Fire*Fire + 0.5) / (Water + Earth + Air + 1)` | `calculateRecipeThermodynamics` @ :492 | **LIVE** |
| `src/constants/alchemicalPillars.ts:352-355` | table literal: `Fire{heat:1.0} Air{0.3} Water{0.1} Earth{0.2}` | `getCookingMethodThermodynamics` | **LIVE** |
| `src/constants/alchemicalPillars.ts:479` | `heat = primary.heat*0.7 + secondary.heat*0.3` | `methodAlchemicalSnapshot.ts:136` | **LIVE** |
| `src/data/cooking/**/*.ts` (51 sites) | hand-authored `thermodynamicProperties: { heat: <literal> }` per cooking method | read by `methodAlchemicalSnapshot.ts:134` **in preference to** the pillar blend | **LIVE** |

## ENTROPY

| file:line | expression | callers | live/dead |
|---|---|---|---|
| `src/utils/monicaKalchmCalculations.ts:62` | `(spirit²+substance²+fire²+air²)/(essence+matter+earth+water)²`, `d>0?n/d:0` | same 15 | **LIVE** |
| `src/calculations/core/kalchmEngine.ts:90` | same; `d===0 → 0.5`; denominator uses `(Earth\|\|0)+(Water\|\|0)` | same 7 | **LIVE** |
| `src/data/unified/alchemicalCalculations.ts:85-90` | `entropyNum / Math.max(entropyDen, 0.01)` | same 11 | **LIVE** |
| `src/services/RealAlchemizeService.ts:444-450` | `entropyNum / (entropyDen \|\| 1)` | canonical prod | **LIVE** |
| `src/services/RealAlchemizeService.ts:744-750` | identical second copy | — | **LIVE (dup)** |
| `src/services/UnifiedScoringService.ts:~558-571` | same with `\|\|0` guards | 4 | **LIVE** |
| `src/services/UnifiedScoringService.ts:784-796` | third copy | — | **LIVE (dup)** |
| `src/services/ThermodynamicsClient.ts:58-64` | `entropyNum / (entropyDen \|\| 1)` | — | **DEAD** |
| `src/calculations/gregsEnergy.ts:145-152` | `entropyDen>0 ? n/d : 0` | 9 | **LIVE** |
| `src/lib/core-energy-rules.ts:140-158` | `d===0 → 0` | — | **DEAD** |
| `src/utils/monica/calculations.ts:13-15` | `entropyDenom===0 ? 0 : n/d` | via cache | **LIVE** |
| `src/services/RecommendationAdapter.ts:670-681` | `Math.max(denom,0.1)`, clamped to `[0.1,1.0]` | 1 | **LIVE** |
| `src/app/recipes/[recipeId]/RecipeClient.tsx:440-441` | `denomEntropy = Math.max(0.0001, …)` | UI | **LIVE** |
| `src/utils/recommendation/ingredientRecommendation.ts:1152-1159` / `:1250-1258` | canonical shape on fabricated ESMS; fallbacks `0.5` / `0.15` | in-file | **LIVE** |
| `src/utils/recommendation/ingredientRecommendation 2.ts:1157,1256` | identical | — | **DEAD** |
| `src/utils/astrologyUtils.ts:2576-2581` | canonical numerator, `Math.max(1, denom²)` floor, fake ESMS | — | **effectively DEAD** |
| `src/utils/astrologyUtils.ts:2650` | `entropy = (Water + Earth) * (1 - compatibilityScore)` | — | **effectively DEAD** |
| `src/constants/alchemicalEnergyMapping.ts:282` | `entropy = 0.6*Substance + 0.4*Essence` — linear | — | **DEAD** |
| `src/services/AlchemicalService.ts:162` | `entropy = (Air + Fire) / 2` | 2 (MCP) | **LIVE** |
| `src/services/IngredientService.ts:643` | `entropy = (Air + Fire) / 2` | 6 | **LIVE** |
| `src/services/UnifiedRecommendationService.ts:701` | `entropy = (Air + Fire) / 2` | live | **LIVE** |
| `src/data/unified/recipes.ts:282` | `entropy = (Fire + Air) / (Water + Earth + 1)` | :492 | **LIVE** |
| `src/constants/alchemicalPillars.ts:352-355` + `:481` | element table + 70/30 blend | live | **LIVE** |
| `src/data/cooking/**` (51) | literals | live | **LIVE** |

Note: `AlchemicalService`/`IngredientService`/`UnifiedRecommendationService` define **heat and entropy as the same expression** — `(Fire+Air)/2` vs `(Air+Fire)/2`. Those two quantities are numerically identical in three live services.

## REACTIVITY

| file:line | expression | callers | live/dead |
|---|---|---|---|
| `src/utils/monicaKalchmCalculations.ts:77` | `(spirit²+substance²+essence²+fire²+air²+water²)/(matter+earth)²`, `d>0?n/d:0` | 15 | **LIVE** |
| `src/calculations/core/kalchmEngine.ts:120` | same; `d===0 → 0.5` | 7 | **LIVE** |
| `src/data/unified/alchemicalCalculations.ts:92-100` | `reactivityNum / Math.max(reactivityDen, 0.01)` | 11 | **LIVE** |
| **`src/services/RealAlchemizeService.ts:459-466`** | **`(reactivityNum / (Matter \|\| 1)) + Math.pow(Earth, 2)`** — "Dignity Table formula (Σ/#Matter)+Earth²"; Earth² added **outside** the fraction, Earth removed from denominator | canonical prod path | **LIVE — this is the Earth² inertia floor** |
| `src/services/RealAlchemizeService.ts:751-758` | identical second copy | — | **LIVE (dup)** |
| `src/services/ThermodynamicsClient.ts:66-74` | same Dignity formula, comment "Sheet formula: (Σ / #Matter) + Earth²" | — | **DEAD** |
| `src/services/UnifiedScoringService.ts:574-582` | `reactivityNum / (reactivityDen \|\| 1)` with `(Matter+Earth)²` — **the canonical form, not the Dignity form** | 4 | **LIVE** |
| `src/services/UnifiedScoringService.ts:798-809` | third copy, canonical form | — | **LIVE (dup)** |
| `src/calculations/gregsEnergy.ts:154-169` | canonical form **soft-capped**: `Math.min(n/d, 10)` | 9 | **LIVE** |
| `src/lib/core-energy-rules.ts:163-186` | canonical, `d===0 → 0` | — | **DEAD** |
| `src/utils/monica/calculations.ts:18-21` | canonical, `d===0 → 0` | via cache | **LIVE** |
| `src/services/RecommendationAdapter.ts:682-692` | `Math.max(Matter+Earth, 0.1)` denominator, clamped `[0.1,1.0]` | 1 | **LIVE** |
| `src/app/recipes/[recipeId]/RecipeClient.tsx:443-444` | `denomReactivity = Math.max(0.0001, matter+earth)` | UI | **LIVE** |
| `src/utils/recommendation/ingredientRecommendation.ts:1162-1170` / `:1261-1269` | canonical on fake ESMS; fallbacks `0.5` / `0.45` | in-file | **LIVE** |
| `src/utils/recommendation/ingredientRecommendation 2.ts:1167,1266` | identical | — | **DEAD** |
| `src/utils/astrologyUtils.ts:2582-2589` | canonical numerator, `Math.max(1, (Matter+Earth)²)` | — | **effectively DEAD** |
| `src/utils/astrologyUtils.ts:2651` | `reactivity = (Fire + Water) * compatibilityScore` | — | **effectively DEAD** |
| `src/constants/alchemicalEnergyMapping.ts:287` | `reactivity = 0.5*Spirit + 0.5*Essence` — linear | — | **DEAD** |
| `src/services/AlchemicalService.ts:164` | `reactivity = Math.abs(Fire - Water) / 2` | 2 (MCP) | **LIVE** |
| `src/services/IngredientService.ts:645` | `reactivity = Math.abs(Fire - Water) / 2` | 6 | **LIVE** |
| `src/services/UnifiedRecommendationService.ts:702` | `reactivity = Math.abs(Fire - Water) / 2` | live | **LIVE** |
| `src/data/unified/recipes.ts:283` | `reactivity = (Fire + Air + Water) / (Earth + 1)` | :492 | **LIVE** |
| `src/constants/alchemicalPillars.ts:352-355` + `:483` | element table + 70/30 blend | live | **LIVE** |
| `src/data/cooking/**` (51) | literals | live | **LIVE** |

## GREGSENERGY

| file:line | expression | callers | live/dead |
|---|---|---|---|
| `src/utils/monicaKalchmCalculations.ts:94` | `heat - entropy * reactivity` | 15 | **LIVE** |
| `src/calculations/core/kalchmEngine.ts:149` | `heat - entropy * reactivity` | 7 | **LIVE** |
| `src/data/unified/alchemicalCalculations.ts:103` | `heat - entropy * reactivity` | 11 | **LIVE** |
| `src/services/RealAlchemizeService.ts:468` and `:759` | `heat - entropy * reactivity` | prod | **LIVE (2 copies)** |
| `src/services/UnifiedScoringService.ts:585` and `:811` | same | 4 | **LIVE (2 copies)** |
| `src/services/ThermodynamicsClient.ts:76` | same | — | **DEAD** |
| `src/calculations/gregsEnergy.ts:172` | same (but on capped reactivity) | 9 | **LIVE** |
| `src/lib/core-energy-rules.ts:191` (`calculateEnergy`) | same, named `energy` not `gregsEnergy` | — | **DEAD** |
| `src/utils/monica/calculations.ts:24` | same | via cache | **LIVE** |
| `src/utils/recommendation/ingredientRecommendation.ts:1173`, `:1272` | same | in-file | **LIVE** |
| `src/utils/astrologyUtils.ts:2590` | same | — | **eff. DEAD** |
| `src/constants/alchemicalEnergyMapping.ts:291` | same (on the linear heat/entropy/reactivity) | — | **DEAD** |
| `src/services/AlchemicalService.ts:166`, `IngredientService.ts:647`, `UnifiedRecommendationService.ts:703` | same (on `(Fire+Air)/2` inputs) | live | **LIVE** |
| `src/data/unified/recipes.ts:284` | same | :492 | **LIVE** |
| **`src/utils/astrologyUtils.ts:2652`** | **`gregsEnergy = compatibilityScore * (Fire + Water + Earth + Air)`** — not `H − E·R` at all | — | **eff. DEAD** |
| **`src/services/RecommendationAdapter.ts:696-699`** | **`rawGregsEnergy = heat - reactivity*entropy`, then `(raw+1)/2` remapped to `(0,1)` and clamped `[0.1,1.0]`** | 1 | **LIVE** |
| **`src/utils/backendAdapter.ts:146-153`** | **`Math.max(0, Math.min(200, (heat*0.4 + reactivity*0.4 - entropy*0.2) * 100))`** — different sign structure, different weights, 0–200 range | 2 consumers | **LIVE** |

## KALCHM

All share the shape `(S^S · E^E)/(M^M · Sub^Sub)`; they differ **only in the zero-floor and the failure return**, plus two that abandon the formula entirely.

| file:line | expression | callers | live/dead |
|---|---|---|---|
| `src/utils/monicaKalchmCalculations.ts:105` | floor `Math.max(0.01, x)`; `d>0 ? n/d : 1` | 15 | **LIVE** |
| `src/calculations/core/kalchmEngine.ts:160` | floor **`0.1`**; `d===0 → 1.0` | 7 | **LIVE** |
| `src/data/unified/alchemicalCalculations.ts:47` | floor `0.01`; **no divide-by-zero guard** | 11 | **LIVE** |
| `src/data/unified/ingredients.ts:74` | floor **`0.001`**; no guard | in-file :222 | **LIVE** |
| `src/services/RealAlchemizeService.ts:473-480` | floor **`1e-9`**; `Number.isFinite(raw) ? raw : 1` | prod | **LIVE** |
| `src/services/RealAlchemizeService.ts:762-769` | identical copy | — | **LIVE (dup)** |
| `src/calculations/alchemicalCalculations.ts:246` | **no floor**; `if (matter===0 \|\| substance===0) return 0`; catch → `0` | reachable via `calculations/index`, `core/index`, `dynamicImport` barrels; the two live named-import consumers (`signVectors`, `nutritional`) actually resolve to the `data/unified` twin | **LIVE (barrel-only)** |
| `src/utils/monica/calculations.ts:28-30` | **no floor at all**; `kAlchmDenom===0 ? 0 : n/d` | via cache | **LIVE** |
| `src/data/unified/recipeBuilding.ts:190` | no floor; `if (Matter<=0 \|\| Substance<=0) return null` | cuisine path | **LIVE** |
| `src/lib/core-energy-rules.ts:222-247` (`calculateKalchmSafe`) | **`Math.abs()` on all four inputs + sign-correction by parity of negative count** — can return a **negative** kalchm | — | **DEAD** |
| `src/data/unified/flavorProfileMigration.ts:797` | no floor; `if (Matter===0 \|\| Substance===0) return 1.0` | :786 | **LIVE** |
| `src/utils/recommendation/ingredientRecommendation.ts:1085-1126` | floor `0.01`, on **fabricated ESMS**, then squashed: `1/(1+exp(-log(kalchm+1)))`, clamped `[0.1,1]` — returns a 0–1 *score* named kalchm | in-file | **LIVE** |
| `src/utils/recommendation/ingredientRecommendation.ts:1181-1183` | floor `0.01`, raw (unsquashed) | in-file | **LIVE** |
| `src/utils/recommendation/ingredientRecommendation 2.ts:1090,1186` | identical | — | **DEAD** |
| `src/services/UnifiedScoringService.ts:588-594` | **floor is `\|\| 1`, i.e. a zero ESMS becomes 1**, and it is short-circuited by `context.item.kalchmResonance` | 4 | **LIVE** |
| `src/calculations/core/alchemicalEngine.ts:264-266` | no floor, no guard | 7 importers (`useChartData`, `kinetics.ts`, `AlchemicalRecommendationService`, `/api/agent-forge/ignite`, `/api/generate-cosmic-recipe`, `/api/alchm-quantities`) | **LIVE** |
| `src/utils/astrologyUtils.ts:2592-2596` | guarded by all-four-positive, else `1` | — | **eff. DEAD** |
| `src/services/AlchemicalService.ts:172` / `IngredientService.ts:629` | `kalchm: 0` / `ingredient.kalchm \|\| 0` — **sentinel, not a computation** | live | **LIVE (sentinel)** |
| `src/services/UnifiedRecommendationService.ts:709` | `kalchm: NaN` — deliberate honest sentinel | live | **LIVE (sentinel)** |

## MONICA

All share `M = −gregsEnergy / (reactivity · ln K)`; they differ in **what they return when undefined** — and that return value is *observable downstream*.

| file:line | expression / failure return | callers | live/dead |
|---|---|---|---|
| `src/utils/monicaKalchmCalculations.ts:126` | fails → **`1.0`** | 15 | **LIVE** |
| `src/calculations/core/kalchmEngine.ts:185` | fails → **`NaN`** | 7 | **LIVE** |
| `src/data/unified/alchemicalCalculations.ts:112` | fails → **`NaN`** | 11 | **LIVE** |
| `src/calculations/alchemicalCalculations.ts:269` | fails → **`0`**; catch → `0` | barrels | **LIVE** |
| `src/data/unified/ingredients.ts:90` | `lnK = Math.log(Math.max(0.001, kalchm))`; uses `gregsEnergy ?? energy`; fails → **`0`** | :232 | **LIVE** |
| `src/services/RealAlchemizeService.ts:483-495` | fails → **`1.0` + sets `monicaDegenerate` and emits a `degraded` reason** | prod | **LIVE — only site that reports degeneracy** |
| `src/services/RealAlchemizeService.ts:770-781` | identical copy | — | **LIVE (dup)** |
| `src/calculations/core/alchemicalEngine.ts:269-276` | initialised `NaN`; **no `reactivity !== 0` guard** → can yield ±Infinity | 7 | **LIVE** |
| `src/utils/monica/calculations.ts:33-38` | fails → **`0`** | via cache | **LIVE** |
| `src/data/unified/recipes.ts:290-306` | fails → **`null`**; also `isNaN → null` | :494 | **LIVE** |
| `src/lib/core-energy-rules.ts:252-270` | `Math.log(Math.abs(kalchm))`; fails → **`NaN`** | — | **DEAD** |
| `src/services/UnifiedScoringService.ts:596-602` | starts at `context.item.monicaConstant \|\| 1.0`; **no `reactivity !== 0` guard** | 4 | **LIVE** |
| `src/utils/recommendation/ingredientRecommendation.ts:1185-1195` | computes then **squashes**: `1/(1+exp(-monica))`, clamped `[0.1,1]` | in-file | **LIVE** |
| `src/utils/recommendation/ingredientRecommendation.ts:1283-1291` | raw, fails → `1.0` | in-file | **LIVE** |
| `src/utils/recommendation/ingredientRecommendation 2.ts:1134,1190,1288` | identical | — | **DEAD** |
| `src/utils/astrologyUtils.ts:2598-2604` | fails → **`0`** | — | **eff. DEAD** |
| `src/utils/methodAlchemicalSnapshot.ts:160` | `kalchm ? calculateMonicaConstant(gregsEnergy, thermo.reactivity, kalchm) : null` — **mixes a `gregsEnergy.ts` gregsEnergy with a `alchemicalPillars` table reactivity** | 2 consumers | **LIVE — cross-family mix** |
| `src/utils/monicaKalchmCalculations.ts:395` (`calculateMonicaWithBField`) | `baseMonica * pow(monicaField, 0.3) * forceMultiplier` (1.2/0.8 by force class) | exported | **LIVE** |
| `src/utils/monicaKalchmCalculations.ts:418` (`calculateKalchmWithKinetics`) | `baseKalchm * (1 + momentum*0.1) * aspectMultiplier` | exported | **LIVE** |
| **`src/app/(alchm)/philosophers-stone/page.tsx:199`** | **`((sunLongitude + moonLongitude + ascLongitude) / 3 / 360) * 10`** — pure longitude average, no ESMS, no thermodynamics | in-page | **LIVE** |
| **`src/app/api/agents/unified/route.ts:173`** | **same longitude formula**, written into `userProfilePayload` at agent creation | API route | **LIVE — persists to DB** |
| `src/app/admin/_dashboard/sky.tsx:385` | `const monica = 0.847` — hardcoded | admin UI | **LIVE (hardcoded)** |
| `src/data/unified/recipeBuilding.ts:202` (`monicaProxyForCuisine`) | **`(Air + Fire) / (Water + Earth)`** — explicitly a "volatility proxy" named monica | cuisine path | **LIVE** |
| `src/services/AlchemicalService.ts:173` / `IngredientService.ts:630` | `0` / `ingredient.monica \|\| 0` sentinel | live | **LIVE (sentinel)** |
| `src/services/UnifiedRecommendationService.ts:710` | `NaN` sentinel | live | **LIVE (sentinel)** |

---

## Distinct-definition counts and numeric agreement

Counting **distinct numeric behaviours** (byte-identical copies collapsed; sentinels excluded):

| quantity | total definition sites | distinct numeric behaviours | live ones |
|---|---|---|---|
| heat | 27 | **7** | 6 |
| entropy | 25 | **7** | 6 |
| reactivity | 26 | **9** | 8 |
| gregsEnergy | 20 | **4** | 4 |
| kalchm | 20 | **7** | 6 |
| monica | 26 | **8** | 8 |

**They do not agree.** Evaluated on one shared input (S=4, E=4, M=4, Sub=2, Fire=.3, Water=.25, Air=.25, Earth=.2):

**heat** — canonical `0.140536` · linear (`alchemicalEnergyMapping`) `3.2` · `(Fire+Air)/2` (three live services) `0.275` · `data/unified/recipes` `0.347059` · `astrologyUtils` fake-ESMS `9.26148` · `astrologyUtils` compat-scaled `0.44`. Spread of **~66×** between the canonical value and the `astrologyUtils` form, and the linear form is **22× canonical** and unbounded above 1.

**reactivity** — canonical `(M+Ea)²` denominator `2.053005` · **Dignity form `(Σ/M)+Earth²` `9.09375`** · soft-capped `2.053005` (bites only above 10) · linear `4` · `abs(Fire−Water)/2` `0.025` · `recipes.ts` `0.666667`. The canonical form and the Dignity form used by `RealAlchemizeService` differ by **4.4×** *on the same input* — and the gap grows without bound as Earth rises, because Earth moved from the denominator to an additive Earth² term. This is the same Earth² floor already catalogued as inertia definition #1; it is **live on the production path** while `UnifiedScoringService`, `gregsEnergy.ts`, `kalchmEngine`, `monicaKalchmCalculations` and `data/unified` all use the `(Matter+Earth)²` form. Any consumer comparing a `RealAlchemizeService` reactivity against a `monicaKalchmCalculations` reactivity is comparing incommensurable numbers.

**gregsEnergy** — the `H − E·R` sites all agree **given identical inputs** (`-0.4389` here), so gregsEnergy's disagreement is entirely inherited from heat/entropy/reactivity. Two sites break the formula outright: `backendAdapter.ts:146` returns `85.74` on the same inputs (different sign structure, 0–200 range), and `astrologyUtils.ts:2652` computes a plain elemental sum. `RecommendationAdapter.ts:696` also swaps in `heat − reactivity*entropy` (commutative, so equal) but then affinely remaps to `(0,1)` — so its output is not comparable to any other site's.

**kalchm** — the floor variants (`0.01`, `0.1`, `0.001`, `1e-9`, none) **all return `64` on this input**, because no ESMS value falls below any floor. They diverge only when an ESMS component approaches zero — precisely the degenerate regime. There the failure returns differ irreconcilably: `1`, `1.0`, `0`, `null`, `NaN`, and unguarded division. `core-energy-rules.ts:222` can return a **negative** kalchm via its sign-parity correction, which would make `Math.log(kalchm)` NaN in every monica consumer; it is dead, which is the only reason this has not surfaced. `UnifiedScoringService.ts:588`'s `|| 1` floor is materially different from the others: a genuinely-zero Matter becomes `1^1 = 1` rather than `ε^ε ≈ 1`, and a genuinely-zero Spirit becomes `1^1 = 1` rather than `≈1` — coincidentally close, but arrived at by unrelated logic.

**monica** — given identical `gregsEnergy`, `reactivity`, `kalchm`, all the `−G/(R·lnK)` sites agree. They disagree **only in the degenerate regime**, and that disagreement is the important one: the same undefined state yields `1.0`, `NaN`, `0`, or `null` depending on which module you called, and `1.0` is indistinguishable from a legitimately-computed value of 1.0 at every consumer except `RealAlchemizeService`, which is the sole site that flags it (`monicaDegenerate` → `degraded.reasons`). Two live sites are not this formula at all: the longitude average in `philosophers-stone/page.tsx:199` and `api/agents/unified/route.ts:173` produces values in `[0,10]` from planetary longitudes with no thermodynamic content, and **the API route persists it to the user profile**. `recipeBuilding.ts:202` returns an `(Air+Fire)/(Water+Earth)` ratio under the same name.

Additional structural hazard worth recording now: `src/utils/methodAlchemicalSnapshot.ts:143-161` composes a monica from a `calculations/gregsEnergy.ts` gregsEnergy (capped reactivity internally), a `monicaKalchmCalculations` kalchm, and a **third** reactivity taken from either a hand-authored `src/data/cooking/**` literal or the `alchemicalPillars` 70/30 element blend. Three different families feed one monica.

Also flagged, not counted as definitions: `src/utils/cuisine/thermodynamicResonance.ts:204/253/294/337/389/436` are comparison scores that *look* like definitions by name (`calculateKalchmResonance`, `calculateMonicaAlignment`, `calculateGregsEnergyHarmony`, `calculateHeatCompatibility`, `calculateEntropyMatch`, `calculateReactivityAlignment`); `:487` and `:511` re-derive composite scores from `reactivity`/`kalchm`/`entropy`. `src/services/UnifiedScoringService.ts:635/655` and `src/utils/recommendation/ingredientRecommendation.ts:1085/1129` share function names with those but *do* define values — the name collision across four files is itself a navigation trap.

Confirmed-dead modules (zero reachable callers), which dissolve some apparent conflicts: `src/lib/core-energy-rules.ts` (the `CoreEnergyCalculator`/`AdvancedConstantsCalculator` family — only `ANumberCalculator` is imported from it), `src/services/ThermodynamicsClient.ts` (its sole consumer `hooks/useThermodynamics.ts` has zero consumers), `src/constants/alchemicalEnergyMapping.ts:272` (`ElementalEnergyDisplay.tsx` has zero consumers), the entire `src/utils/recommendation/ingredientRecommendation 2.ts` orphan file, and — pending your judgement — the `astrologyUtils.ts:2559/2644` pair, whose only real call site (`RecommendationAdapter.ts:29`) is hard-assigned `null`.
The map is complete. Findings below.

---

# Multiply-Defined Quantity Audit — planetary weight / mass / dignity / aspect strength / orb

Working dir: `/Users/cookingwithcastro/Desktop/WhatToEatNext-master`, branch `docs/synthesis-model`.

Your instinct was right: the incidental discovery pattern held. Every one of the seven names has more definitions than INERTIA did.

---

## 1. `normalizePlanetWeight` — mass→[0,1] normalization

| file:line | expression | callers | live/dead |
|---|---|---|---|
| `src/data/planets.ts:37` | `(Math.log10(Math.max(relMass, 1e-9)) - _MASS_LOG_MIN) / (_MASS_LOG_MAX - _MASS_LOG_MIN)` where `_MASS_LOG_MIN=log10(0.0022)`, `_MASS_LOG_MAX=log10(333054.2532)` | 6 files: `alchm-quantities/route.ts:389,390`, `kinetics.ts:227,282`, `planetaryScoring.ts:423`, `natalAlchemy.ts:40`, `planetaryAlchemyMapping.ts:377,635,688` | **LIVE** (sole definition) |

**One definition.** This is the only quantity in the audit that is singly-defined.

`PLANET_WEIGHTS` (`src/data/planets.ts:16`) is likewise the sole mass table — real NASA Earth-relative ratios, Sun 333054.2532 → Pluto 0.0022.

---

## 2. `alchmWeight` / `normalizeAlchmWeight` — orbital-period weight

| file:line | expression | callers | live/dead |
|---|---|---|---|
| `src/data/planets.ts:78` | `(Math.log10(Math.max(periodYears,1e-9)) - _PERIOD_LOG_MIN) / (_PERIOD_LOG_MAX - _PERIOD_LOG_MIN)`; MIN=`log10(0.003)`, MAX=`log10(247.94)` | `planetaryAlchemyMapping.ts:538` (1 real caller) | **LIVE** |
| `src/services/RealAlchemizeService.ts:58` | **verbatim duplicate**: `(Math.log10(Math.max(periodYears,1e-9)) - PERIOD_LOG_MIN)/(PERIOD_LOG_MAX - PERIOD_LOG_MIN)`, local `PERIOD_LOG_MIN=log10(0.003)`, `PERIOD_LOG_MAX=log10(247.94)` | `RealAlchemizeService.ts:338`, `:626` (2, file-local) | **LIVE** |

Plus a **duplicated period table**: `PLANET_ALCHM_PERIODS` at `src/data/planets.ts:54` AND a local copy at `src/services/RealAlchemizeService.ts:41` — value-for-value identical (Pluto 247.94 … Ascendant 0.003). `RealAlchemizeService` does **not** import from `@/data/planets`; it re-declares both.

Ascendant special-case, defined twice identically:
- `src/utils/planetaryAlchemyMapping.ts:538` — `planet === "Ascendant" ? 1.0 : normalizeAlchmWeight(period)`
- `src/services/RealAlchemizeService.ts:338` and `:626` — same expression

**Two definitions, numerically identical.** A pure copy-paste fork, currently in agreement — an unpinned drift hazard, not a live numeric conflict.

---

## 3. Per-planet weight tables (the "planetary weight" concept, un-named)

This is where it explodes. Twelve distinct hand-tuned tables, none derived from another.

| file:line | expression (Sun / Moon / Merc / … ) | enclosing fn | callers | live/dead |
|---|---|---|---|---|
| `src/data/planets.ts:16` `PLANET_WEIGHTS` | real masses `Sun 333054.25, Jup 317.82, … Pluto 0.0022` | — | 6 files | **LIVE** |
| `src/data/planets.ts:54` `PLANET_ALCHM_PERIODS` | `Pluto 247.94 … Ascendant 0.003` | — | 2 | **LIVE** |
| `src/services/RealAlchemizeService.ts:41` | local dup of the above | — | 2 (file-local) | **LIVE** |
| `src/utils/astrology/natalAlchemy.ts:19` `PLANETARY_WEIGHTS_ASTRO` | `Sun 1.5, Moon 1.5, Merc/Ven/Mars 1, Jup/Sat 1.2, outers 0.8, Asc 1.5` | — | 1 (`NATAL_WEIGHTS`) | **LIVE** |
| `src/utils/astrology/natalAlchemy.ts:37` `NATAL_WEIGHTS` | `astroWeight * 0.6 + massWeight * 0.4` (composite) | — | `:117` | **LIVE** |
| `src/services/planetaryScoring.ts:644` `PLANET_WEIGHT` | `Sun 1.5, Moon 1.5, Merc–Sat 1, Ura/Nep/Plu 0.5` | `computeSkyElementalBalance` | 1 | **LIVE** |
| `src/constants/signEnergyStates.ts:118` `PLANETARY_ENERGY_MULTIPLIERS` | `Sun 1.2, Moon 1.1, Merc 0.9, Ven 1.0, Mars 1.3, Jup 1.1, Sat 0.8, Ura 0.9, Nep 1.0, Plu 1.2` | `calculateSignEnergyStates` | 1 (`useTarotAstrologyData.ts`) | **LIVE** |
| `src/utils/safeAstrology.ts:449` `planetWeight` | `sun 3, moon 2, _ascendant 2, _mercury 1.5 …, northNode 0.5` | `countElements` | 1 (`:371`) | **LIVE** — note underscore keys never match real planet names, so all but sun/moon/nodes fall to `|| 1` |
| `src/utils/astrologyUtils.ts:2438` `planetWeights` | `Sun 1.0, Moon 0.8, Merc 0.6, Ven 0.7, Mars 0.7, Jup 0.8, Sat 0.6, Ura 0.4, Nep 0.4, Plu 0.3` | `calculateCurrentElementalInfluence` | 1 (`:2314`) | **LIVE** |
| `src/utils/astrologyUtils.ts:2717` `basePlanetStrength` | `Sun 1.0, Moon 0.9, Merc 0.7, Ven 0.8, Mars 0.8, Jup 0.9, Sat 0.6, Ura 0.5, Nep 0.5, Plu 0.4` | `calculatePlanetaryStrength` | 1 (`:2520`) | **LIVE** |
| `src/utils/ingredientRecommender.ts:874` `planetWeights` | `sun 5, moon 4, merc/ven/mars 3, jup/sat 2, _uranus/_neptune/_pluto 1` | `calculateElementalInfluences` | 2 API routes + internal | **LIVE** |
| `src/utils/recommendation/ingredientRecommendation.ts:1430` `weights` | `Sun 0.25, Moon 0.2, Merc/Ven/Mars 0.15, Jup/Sat 0.05` | `getPlanetaryWeight` | `:1414` | **LIVE** |
| `src/services/astrologyApi.ts:384` `planetaryWeights` | `sun 0.25, moon 0.25, merc/ven/mars 0.1, jup/sat 0.07, ura/nep/plu 0.02` | `calculateElementalBalanceFromPositions` | 1 (`:271`) | **LIVE** |
| `src/utils/signVectors.ts:120` `planetWeightMap` | `Sun 1.5, Moon 1.3, _Mercury 1.1 … _Pluto 0.9` | `computePlanetaryWeightForSign` | `:147` only | **DEAD** — `calculateSignVectors`/`getAlchemicalStateWithVectors` have no consumer outside the file (barrel re-export only; file comment at `:274` admits it) |
| `src/hooks/useAstrology.ts:344` `weights` | `sun 3, moon 2, merc/ven/mars/jup/sat 1` | inline | inline | **LIVE** |
| `src/services/PlanetaryAgentsAdapter.ts:231` `planetPowers` | `Sun 1.0, Moon 0.9, Merc 0.7, Ven 0.8, Mars 0.85, Jup 0.95, Sat 0.6` | `calculatePlanetaryPower` | 3 | **LIVE** |
| `src/constants/planets.ts:16` `_PLANETARY_MODIFIERS` | `Mars 0.4, Sun 0.35, Jup 0.3, Ven 0.25, Merc 0.2, Sat 0.15, Ura 0.3, Nep 0.25, Plu 0.2, Moon 0.35` | — | `alchemicalEngine.ts:186,190` (presence check only, value read at `:190` `> 0`) | **LIVE (barely)** |
| `src/lib/core-energy-rules.ts:298` `PLANETARY_MODIFIERS` | **name collision** — per-planet *element/ESMS delta objects*, not scalars | `:412` | **LIVE** |
| `src/utils/astrologyUtils.ts:1712` `PLANETARY_ORBS` | `Sun 1.5, Moon 1.5, Merc 1.0, Ven 1.0, Mars 0.8, Jup 0.6, Sat 0.5, Ura 0.4, Nep 0.3, Plu 0.2` | `_getAspectOrb` | **0** | **DEAD** |
| `src/utils/astrologyUtils.ts:769` `PLANETARY_JOYS` | house numbers, `Sun 9 … Saturn 12` | `:806` | 1 | LIVE (not a weight) |
| `src/data/unified/recipeBuilding.ts:48` `PLANETARY_TIME_FACTORS` | `Sun 0.9 … Saturn 1.3` (cook-time multiplier) | `:2686` | 1 | LIVE (different domain) |
| `src/components/ui/alchm/PlanetaryClock.tsx:34-40` | `Sol 1.0, Mercury 0.4, Venus 0.7, Luna 0.5, Mars 0.6, Jupiter 0.9, Saturn 0.5` | decorative SVG | — | LIVE (cosmetic only) |
| `src/lib/monica/horoscope-generator.ts:37` `ORBITAL_PERIODS` | periods in **days**: `Sun 365.25, Moon 27.32 … Pluto 90560` | `:` local | file-local | **LIVE** — third period table, different unit |

**Distinct definitions: 12 scalar planet-weight tables + 3 period tables + 2 mass tables.** They do **not** agree, not even in rank order. `astrologyApi` says Sun 0.25 = Moon 0.25; `PLANET_WEIGHTS` says Sun is 27,000,000× Moon; `signEnergyStates` says Mars (1.3) outranks Sun (1.2); `_PLANETARY_MODIFIERS` says Mars (0.4) > Sun (0.35) > Moon (0.35) = Jupiter-ish. Every one of these feeds elemental aggregation somewhere.

**The sharpest conflict is inside the same two files.** `normalizePlanetWeight` and `normalizeAlchmWeight` both return a 0–1 "weight" for the same planet, and they are **anti-correlated by construction**:

| planet | `normalizePlanetWeight` | `normalizeAlchmWeight` |
|---|---|---|
| Sun | **1.000** | 0.513 |
| Jupiter | 0.631 | 0.741 |
| Moon | 0.091 | 0.284 |
| Pluto | **0.000** | **1.000** |

`planetaryAlchemyMapping.ts` uses **both**, ~160 lines apart (`:377` mass-weighted ESMS, `:538` period-weighted ESMS), and there is an in-file comment at `:528-529` explicitly flagging that they are different scales. Pluto contributes **zero** through one path and **maximum** through the other.

---

## 4. Dignity multiplier

Nine live definitions on five mutually incompatible scales.

| file:line | expression | callers | live/dead |
|---|---|---|---|
| `src/utils/dignityScales.ts:38` `DIGNITY_ESMS_SCALE` | `Domicile 10, Exaltation 7, Neutral 0, Detriment -7, Fall -10` | `getDignityScore:83` | **LIVE** |
| `src/utils/planetaryAlchemyMapping.ts:542` | `const dignityMultiplier = 1 + dignityScore.esmsScale / 100` → 1.10/1.07/1.0/0.93/0.90 | `:547-550` | **LIVE** (the enhanced-ESMS path, 6 API routes) |
| `src/services/RealAlchemizeService.ts:342` and `:629` | `Math.max(0.5, 1.0 + dignity * 0.15)` where `dignity ∈ {-3…3}` from `getPlanetaryDignity:185` → **0.55 … 1.45** | 2 (file-local) | **LIVE** |
| `src/services/RealAlchemizeService.ts:185` `getPlanetaryDignity` | numeric map `Sun{leo:1,aries:2,aquarius:-1,libra:-2}`, `Mercury{gemini:1,virgo:3,…pisces:-3}`, `Uranus{taurus:-3}` — **±3 scale** | `:341`, `:628` | **LIVE** |
| `src/utils/astrologyUtils.ts:1333-1341` `getPlanetaryDignityInfo` | `Domicile 1.0, Exaltation 2.0, Detriment -1.0, Fall -2.0, Neutral 0` | 11 refs incl. `getDignityScore` | **LIVE** |
| `src/utils/dignityScales.ts:58` `DIGNITY_FOOD_SCALE` | `Domicile 1, Exaltation 2, Neutral 0, Detriment -1, Fall -2` | **only `getDignityScore:84`, whose `.foodScale` field is read by nobody** | **DEAD** (confirms your prior finding) |
| `src/utils/dignityScales.ts:98` `getDignityESMSMultiplier` | `1 + score.esmsScale / 100` | **0** | **DEAD** |
| `src/utils/dignityScales.ts:113` `getDignityForFoodScoring` | returns `{type, strength: foodScale}` | **0** | **DEAD** |
| `src/calculations/core/planetaryInfluences.ts:131` `calculatePlanetaryDignity` | `rulership 1.5, exaltation 1.3, detriment 0.7, fall 0.5, neutral 1.0` | `:196`, `EnhancedTransitAnalysisService.ts:166` | **LIVE** |
| `src/utils/alchemicalCalculations.ts:149-172` | `1.5` domicile / `1.3` exaltation / `1.0` else; then `*= 0.8` if retrograde — **inline sign lists, no table** | `AlchmKitchen.tsx:12` | **LIVE** |
| `src/constants/planetaryFoodAssociations.ts:292` `_getDignityMultiplier` | `Domicile 1.5, Exaltation 1.3, Triplicity 1.2, Term 1.1, Face 1.05, Mooltrikona 1.4, Nakshatra 1.25, Detriment 0.7, Fall 0.5, Neutral 1.0` | **0** | **DEAD** |
| `src/calculations/core/elementalCalculations.ts:81` `calculatePlanetaryDignity` | additive bonus map `Sun{leo:0.5, aries:0.3}` … `Pluto{scorpio:0.5, leo:0.3}` | `:67` | **LIVE** |
| `src/calculations/alchemicalCalculations.ts:108` `calculatePlanetaryDignity` | stub — always `{type:"neutral", value:1.0}` | only `dynamicImport.ts:180` namespace import | **DEAD in practice** |
| `src/utils/elemental/transformations.ts:452` `calculateDignityBonus` | `position < 30 \|\| position > 330 ? 0.2 : 0` — **degree-based, ignores planet entirely** | `:421` | **LIVE** |
| `src/utils/foodRecommender.ts:610-626` | inline sign list → `totalPlanetStrength += isInDignity ? 1.5 : 1.0` | inline | **LIVE** |
| `src/utils/ingredientRecommender.ts:2379-2452` `dignityEffect` | `{leo:1, aries:2, aquarius:-1, libra:-2}` … applied at `:2691` as `dignityEffect[sign] * 0.1` **additively** | `:2690`, `:2779`, `:3123`, `:3156` | **LIVE** |
| `src/lib/astrological-data.ts:113` `getPlanetaryDignity` | returns **strings** `'domicile'/'exaltation'/'detriment'/'fall'/'peregrine'` | `planetary-config-helper.ts`, `unified-agent-factory.ts`, `planetary-agent-activation.ts` | **LIVE** |
| `src/calculations/core/elementalCalculations.ts:81` (dup of row above) | — | — | — |
| `src/utils/dignityScales.ts:77` `getDignityScore` | `{type, esmsScale, foodScale}` | 3 files | **LIVE** |
| `src/components/PlanetaryCalculationsDemo.tsx:162` | local string-returning dignity | in-component | LIVE (display) |
| `src/components/PlanetaryCalculationsDemo 2.tsx:162` | byte-identical dup file | **0 imports** | **DEAD FILE** |

**Distinct definitions: 9 live multiplier formulas, 5 dead.** They **do not agree**. For **Sun in Leo (Domicile)**, evaluated on the same input:

| source | multiplier |
|---|---|
| `planetaryAlchemyMapping.ts:542` | **1.10** |
| `RealAlchemizeService.ts:342` | **1.15** (dignity=1 → 1+0.15) |
| `alchemicalCalculations.ts:161` | **1.50** |
| `planetaryInfluences.ts:152` | **1.50** |
| `foodRecommender.ts:626` | **1.50** |
| `elementalCalculations.ts:84` | **+0.5 additive** |
| `ingredientRecommender.ts:2691` | **+0.1 additive** |
| `transformations.ts:452` | **0 or 0.2, depends on degree not sign** |

And **Mercury in Virgo** diverges further, because `RealAlchemizeService`'s map is the only one on a ±3 scale: it gives `1 + 3*0.15 = 1.45`, while `planetaryAlchemyMapping` classifies Virgo as Mercury's *exaltation* → `1.07`. **A 36% spread on the same planet-sign pair, between the two files that both claim to be the ESMS engine.**

---

## 5. Aspect strength

| file:line | expression | callers | live/dead |
|---|---|---|---|
| `src/utils/aspectCalculator.ts:186-187` | cosine bell: `orbRatio = orb/adjustedMaxOrb; strength = (1 + Math.cos(Math.PI * orbRatio)) / 2` — with `orbMultiplier = 1.2` for Sun/Moon (dead branch: lowercase compare never matches capitalized keys, per in-file comment `:163-167`) | 5 files: `alchemize/route.ts`, `alchm-quantities/aspects/route.ts`, `planetaryFBD.ts`, `RealAlchemizeService.ts`, self | **LIVE — canonical** |
| `src/app/api/alchm-quantities/aspects/route.ts:158` | `Math.max(0, 1 - currentOrb / maxOrb)` — **linear**, recomputed on top of `calculateComprehensiveAspects` output, discarding the cosine strength it was just handed | route response | **LIVE** |
| `src/app/api/alchm-quantities/route.ts:405-409` | `orbRatio = orb0/maxOrb; degreeOfInfluence = (1+cos(π·orbRatio))/2; strength = degreeOfInfluence * combinedWeight` where `combinedWeight = (normalizePlanetWeight(w1)+normalizePlanetWeight(w2))/2` | route-local | **LIVE** |
| `src/utils/safeAstrology.ts:320` `calculateAspectStrength` | `baseStrength * (1 - orb/maxOrb)`; base `conj 10, opp 10, trine 8, sq 8, sext 6, quinc 4, …`; maxOrb `10/8/6/5` — **returns 0–10, not 0–1** | `safeAstrology.ts:272` | **LIVE** |
| `src/utils/astrology/validation.ts:356` `calculateAspectStrength` | `baseStrength[type] * (1 - orb/maxOrb)` clamped to [0,1]; base `conj 1.0, opp 0.9, trine 0.8, sq 0.8, sext 0.7 …` | `validation.ts:292` | **LIVE** |
| `src/utils/astrologyUtils.ts:1449` | `const strength = 1 - orb / definition.maxOrb`, stored as `strength * Math.abs(multiplier)` (`:1471`) where conj multiplier = 2 → **max 2.0** | `calculateAspects`, 21 refs | **LIVE** |
| `src/calculations/planetaryFBD.ts:620-621` | `baseWeight = (ASPECT_MAX_ORBS[type] ?? 2) / 8; magnitude = aspect.strength * baseWeight` (consumes aspectCalculator's cosine value) | in-file | **LIVE** |
| `src/utils/aspectESMSEffects.ts:427` | `const scaledEffect = aspect.strength ?? 1.0` (pass-through) | `planetaryAlchemyMapping` | **LIVE** |
| `src/utils/recommendation/methodRecommendation.ts:677` | `aspect.strength ?? Math.max(0, 1 - (Math.abs(aspect.orb) / 8))` — **fixed 8° denominator for every aspect type** | `:739` | **LIVE** |
| `src/utils/cookingMethodRecommender.ts:1738,1763` | `const aspectStrength = aspect.orb \|\| 0;` then `strengthMultiplier = Math.max(0.5, 1 - aspectStrength/10)` — **reads `orb` into a variable named `strength`** (bug acknowledged at `:92-95`) | **0** | **DEAD** (file comment confirms) |
| `src/constants/signEnergyStates.ts:132` `ASPECT_STRENGTHS` | type-only, **orb-independent**: `conj 1.2, sext 1.1, sq 0.9, trine 1.1, opp 0.8` | `:178` | **LIVE** |
| `src/utils/signVectors.ts:106-117` `aspectFactor` | multiplicative, orb-independent: `conj ×1.2, trine ×1.1, sext ×1.05, sq ×0.93, opp ×0.9` | `:134` | **DEAD** (module unconsumed) |
| `src/lib/mcp/synastryTools.ts:165` | `exactness = 1 - orb / ASPECT_ORBS[type]` | in-file | **LIVE** |
| `src/lib/degree-agent-matcher.ts:426-438` | tiered: `1.0 - (orb/1)*0.1` / `0.8 - (orb/3)*0.3` / `0.5 - (orb/5)*0.2` | in-file | **LIVE** |
| `src/utils/foodRecommender.ts:1016` | `(aspect.strength \|\| 0.5) * multiplier` | in-file | **LIVE** |

**Distinct definitions: 12 live, 2 dead.** They **do not agree**, and the output ranges are not even commensurable — three different maxima (1.0, 2.0, 10.0).

Evaluated on **one identical input — a Sun–Moon conjunction at 4° orb**:

| source | value |
|---|---|
| `aspectCalculator.ts:187` (cosine, maxOrb 8) | **0.500** |
| `alchm-quantities/aspects/route.ts:158` (linear, maxOrb 8) | **0.500** |
| `astrology/validation.ts:396` | **0.500** |
| `astrologyUtils.ts:1471` | **1.000** |
| `safeAstrology.ts:346` (maxOrb 10) | **6.000** |
| `alchm-quantities/route.ts:409` (moiety orb 13.5, mass-weighted) | **0.436** |
| `signEnergyStates.ts:178` | **1.200** (orb ignored) |
| `methodRecommendation.ts:677` fallback | **0.500** |

The 0.500 agreements at 4° are **coincidental** — cosine and linear cross only at exactly half-orb. At 2° orb the same three give cosine **0.854** vs linear **0.750**; at 6° orb, **0.146** vs **0.250**. The two formulas agree at exactly three points and nowhere else.

---

## 6. Orb weight / max-orb budgets

| file:line | table | callers | live/dead |
|---|---|---|---|
| `src/utils/aspectCalculator.ts:103` | `conj 8, opp 8, trine 8, sq 7, sext 6, quinc 5, semisext 4, sesquiquad 3, semisq 3, quintile 2, biquintile 2, septile 2` | 5 files | **LIVE — canonical** |
| `src/calculations/planetaryFBD.ts:312` `ASPECT_MAX_ORBS` | same values, **but `sesquisquare 3 / semisquare 3` vs aspectCalculator's `_sesquiquadrate 3 / _semisquare 3`** — matches; used as `baseWeight = maxOrb/8` | `:620` | **LIVE** (2nd copy) |
| `src/app/api/alchm-quantities/aspects/route.ts:108` `MAX_ORBS` | `conj 8, opp 8, trine 8, sq 7, sext 6` (majors only) | `:139` | **LIVE** (3rd copy) |
| `src/utils/astrology/validation.ts:325` | `conj 8, opp 8, **trine 7**, sq 7, sext 6, quinc 5, semisext 4, **semisq 4, sesquisq 4, quintile 3, biquintile 3**` | `:340` | **LIVE — trine and all minors differ** |
| `src/utils/astrology/validation.ts:378` | byte-identical re-declaration of `:325` inside `calculateAspectStrength` | `:392` | **LIVE** (self-duplicate, 2 copies in one file) |
| `src/utils/astrologyUtils.ts:1372` | `conj 8, opp 8, trine 8, sq 7, **sext 4**, quinc 3, inconj 3, semisext 3, semisq 2, sesquisq 2, quintile 2, biquintile 2` + `multiplier` field | `:1447` | **LIVE — sextile 4 vs 6** |
| `src/utils/safeAstrology.ts:293` | `conj 10, opp 10, trine 8, sq 8, sext 6, quinc 5, semisext 3, semisq 3, sesquisq 3` | `:306` | **LIVE — conj/opp 10 vs 8** |
| `src/utils/safeAstrology.ts:337` | second, *inconsistent* maxOrb inside `calculateAspectStrength`: `conj/opp 10, trine/sq 8, sext 6, else 5` | `:346` | **LIVE** |
| `src/app/api/alchm-quantities/route.ts:346,363,395` | **moiety-based, not a table**: `PLANET_MOIETIES {Sun 7.5, Moon 6.0, Merc 3.5, Ven 3.5, Mars 4.0, Jup 4.5, Sat 4.5, outers 2.5}` × `ASPECT_SCALES {conj 1.0, opp 1.0, trine 0.9, sq 0.8, sext 0.6}` → `maxOrb = (moiety1+moiety2)*aspectScale` | route-local | **LIVE — structurally different model** |
| `src/lib/mcp/synastryTools.ts:49` `ASPECT_ORBS` | `conj 8, sext 6, sq 8, trine 8, **opp 10**` | `:158,161,165` | **LIVE — square 8 vs 7** |
| `src/config.ts:39` `aspectOrbs` | `conjunction 8, _opposition 8, _trine 6, _square 6, _sextile 4, quincunx 3` — **underscore-prefixed keys**, so only `conjunction`/`quincunx` are addressable | `ConfigurationService.ts:103-111,521` | **LIVE but effectively inert** |
| `src/utils/astrologyUtils.ts:1712` `PLANETARY_ORBS` | per-planet orbs `Sun 1.5 … Pluto 0.2`, `_getAspectOrb = (orb1+orb2)/2` | **0** | **DEAD** |
| `src/lib/degree-agent-matcher.ts:75-77` | `ORB_EXACT 1, ORB_CLOSE 3, ORB_HARMONIC 5` | `:424-438` | **LIVE** |
| `src/components/feed/TransitInviteBanner.tsx:20` | `ORB_DEGREES = 3` (flat) | `:69` | **LIVE** |

**Distinct definitions: 12 live, 1 dead.** They **do not agree.** Conjunction max orb is 8 in five places and 10 in two. Sextile is 6 in five places and 4 in `astrologyUtils`. Trine is 8 in four places and 7 in `validation.ts`. Square is 7 in most, 8 in `synastryTools` and `safeAstrology`. And `alchm-quantities/route.ts` abandons the fixed-table model entirely for a per-pair moiety sum — a Sun–Moon conjunction gets a **13.5°** orb there versus **8°** everywhere else, so it admits aspects no other module considers to exist.

---

## Summary

| quantity | distinct live defs | dead defs | numerically agree? |
|---|---|---|---|
| `normalizePlanetWeight` | **1** | 0 | n/a — single source |
| `normalizeAlchmWeight` / `alchmWeight` | **2** | 0 | **yes** — verbatim fork, agree exactly |
| planetary weight (scalar tables) | **12** (+3 period, +2 mass) | 2 | **no** — disagree in value *and* rank order |
| mass | **1** table, **3** normalizations applied to it | 0 | the two 0–1 weights are **anti-correlated** (Sun 1.0/0.513, Pluto 0.0/1.0) |
| dignity multiplier | **9** | 5 | **no** — Sun-in-Leo spans 1.10 → 1.50 multiplicative, plus 2 additive-scale defs |
| aspect strength | **12** | 2 | **no** — three incompatible output ranges (0–1, 0–2, 0–10); cosine vs linear agree at exactly 3 points |
| orb weight | **12** | 1 | **no** — conj 8 vs 10, sext 4 vs 6, trine 7 vs 8, plus a moiety model |

Three things worth flagging beyond the raw count.

**The two ESMS engines disagree with each other.** `RealAlchemizeService` and `planetaryAlchemyMapping` are both live, both compute per-planet ESMS, and they use *different dignity scales* (±3 → ×0.15 versus ±10 → /100) on top of an *identical* alchmWeight. Same chart, two answers, and Mercury-in-Virgo is the worst case at 1.45 vs 1.07.

**`alchm-quantities/route.ts` is the outlier on nearly every axis.** It has its own inertia, its own force, its own orb model (moieties), and its own aspect strength (cosine × mass weight). It shares almost nothing with the rest of the engine — worth checking whether it was written against a different spec.

**Dead code is doing real work in the confusion.** `DIGNITY_FOOD_SCALE`, `getDignityForFoodScoring`, `getDignityESMSMultiplier`, `_getDignityMultiplier`, `PLANETARY_ORBS`, `cookingMethodRecommender._calculateAspectMethodAffinity`, and the whole `signVectors` module are all unreferenced. `src/utils/recommendation/ingredientRecommendation 2.ts` and `src/components/PlanetaryCalculationsDemo 2.tsx` are unimported duplicate files carrying their own copies. Removing these first would cut the apparent conflict count by roughly a third before any real reconciliation work starts.
# RESOLUTION PLAN

Verified against the working tree on `docs/synthesis-model` before writing. Two corrections to the input maps are folded in below: the first importer sweep I ran returned all-zeros from a failed shell glob (a false "everything is dead" reading), and the corrected sweep confirms every dead-module claim in all three maps **except** that `src/lib/galileo-logger.ts` — the sole importer of `core-energy-rules` — itself has zero importers, so that chain is one level deader than reported.

Ordered by risk-adjusted value: value = ambiguity removed, risk = probability of moving a number a user sees.

| # | Quantity | Definitions | Live? | Recommended canonical | What to do with the others | Blast radius |
|---|---|---|---|---|---|---|
| **1** | **All 19 quantities — dead-module tranche** | ~40 defs across 13 files | **No — 0 reachable callers, verified** | n/a | **DELETE, do not reconcile.** `src/services/ThermodynamicsClient.ts` + `src/hooks/useThermodynamics.ts`; `src/lib/core-energy-rules.ts` (physics half) + `src/lib/galileo-logger.ts`; `src/constants/alchemicalEnergyMapping.ts` + `src/components/ElementalEnergyDisplay.tsx`; `src/lib/alchemical-kinetics-sampler.ts` + `src/lib/alchemical-kinetics.ts`; `src/lib/celestial-energy-calculator.ts` + `src/lib/degree-agent-matcher.ts`; `src/lib/kinetics-integration.ts`; `src/lib/kinetics-client.ts` + `src/lib/agents/consciousness-memory.ts`; `src/utils/ingredientValidation.ts`; `src/utils/naturalLanguageProcessor.ts`; `src/utils/signVectors.ts`; `src/utils/recommendation/ingredientRecommendation 2.ts`; `src/components/PlanetaryCalculationsDemo.tsx` **and** its ` 2.tsx` twin (both have zero importers) | **Zero.** ~12,100 lines. Removes the negative-kalchm hazard, the `heat = 0.6·Spirit+0.4·Substance` linear form (22× canonical), the duplicated `PLANETARY_ORBS`, `computePower` (0 callers even inside its own dead module), and roughly a third of the apparent conflict count |
| **2** | **heat / entropy / reactivity / gregsEnergy / kalchm / monica — intra-file copies** | 2 copies in `RealAlchemizeService.ts` (:437–495 vs :741–781), 2 in `UnifiedScoringService.ts` (:546–602 vs :771–811), 2 orb tables in `astrology/validation.ts` (:325 vs :378), 2 period tables (`data/planets.ts:54` vs `RealAlchemizeService.ts:41`) | Live | The **first** copy in each file | Extract to one file-local helper, call it twice. Byte-identical today | **Zero** if extraction is mechanical. This is the single cheapest live-code win: 12 definition sites collapse to 4 |
| **3** | **planet weight (0–1 normalizations)** | 2: `normalizePlanetWeight` (mass), `normalizeAlchmWeight` (orbital period) | Both live, **both correct** | Neither — they measure different physics | **RENAME, don't merge.** `normalizePlanetWeight` → **`massWeight`**, `normalizeAlchmWeight` → **`periodWeight`**. They are anti-correlated by construction (Sun 1.000/0.513, Pluto 0.000/1.000) and `planetaryAlchemyMapping.ts` calls both 160 lines apart. The current names imply one supersedes the other; the new names make the co-existence legible | **Zero** (rename only). 6 files + 2 call sites. Also de-duplicate `PLANET_ALCHM_PERIODS` — `RealAlchemizeService.ts:41` re-declares it rather than importing `@/data/planets` |
| **4** | **reactivity (the Earth² split)** | 2 live: canonical `(M+Earth)²` denominator (5 sites) vs `(Σ/Matter)+Earth²` in `RealAlchemizeService.ts:459` | Both live | **Neither — they are different quantities.** The in-file comment at :455–458 documents the Earth² term as a deliberate "Grounding Constant" guaranteeing a non-zero floor via the Ascendant's Matter=1 | **RENAME.** `RealAlchemizeService`'s → **`groundedReactivity`**; keep `reactivity` for the `(M+Earth)²` family. Then audit every consumer that compares across the two — `thermodynamicResonance.ts:436` (`calculateReactivityAlignment`) is the one that currently compares incommensurable numbers | **Large but zero-behaviour if renamed.** Merging them would be a 4.4× swing on the sample input, unbounded as Earth rises, on `/planetary-chart`, `/api/alchm-quantities`, `/api/personalized-recommendations`, and `lib/economy/livePricing` — **do not merge** |
| **5** | **monica (the longitude impostor)** | `((sunLon + moonLon + ascLon)/3/360)*10` at `philosophers-stone/page.tsx:199` and `api/agents/unified/route.ts:173` — verified in source, no ESMS input at all | Live; **the API route persists it to `user_profiles`** | Not monica | **RENAME to `chartPhaseIndex`** (range 0–10) and rename the DB column/payload key. Same for `recipeBuilding.ts:202` `monicaProxyForCuisine` → **`volatilityRatio`** (`(Air+Fire)/(Water+Earth)`) | **Medium.** Display-only in the page; the API route writes a persisted field, so a column rename needs a migration + backfill. **No numeric change** — but every existing agent row carries a value that was never a monica constant |
| **6** | **force (in `kineticCalculations.ts`)** | `force[el] = momentum[el]/inertia` at :157 — algebraically **identical to `velocity`** two lines up; `forceMagnitude` at :165 is the norm of *momentum*, not of the returned `force` | Live, 6 call sites | n/a — this is a defect, not a competing definition | Delete the `force` field (callers should read `velocity`); rename `forceMagnitude` → **`momentumMagnitude`**. Separately rename `hierarchicalRecipeCalculations.ts:456` (`P·m`, units of energy·mass, rises with inertia) → **`recipeForceProxy`**, and `alchm-quantities/route.ts:197` (`|P|/m`, falls with inertia) → **`chartForceMagnitude`** | **Medium.** `EnhancedIngredientRecommender`, `mealCircuitCalculations`, `ingredientRecommendation`. Removing the redundant field changes nothing numerically; the renames prevent the two remaining force definitions being read as the same quantity when they move in *opposite* directions on the same input |
| **7** | **inertia** | 6 live, **no two agree on any input**; ranges don't overlap (recipe/method forms ≈1.0–1.5, route form ≈3–8) | Live | `src/calculations/kinetics.ts:99` — most callers (12), and the only one whose planetary modifier is applied consistently | **RENAME the two that measure something else**, reconcile the rest. `alchm-quantities/route.ts:188` uses `M + S + Earth·10` (Earth weighted 10× higher, Substance at full not half) → **`chartInertia`**. `cookingMethodKinetics.ts:455` compresses by ×0.1 into [0.5,1.5] → **`methodInertiaFactor`**. `kineticCalculations.ts:134` is `kinetics.ts:99` minus the planetary modifier — **merge into `kinetics.ts`**, accepting the ≤25% change. `hierarchicalRecipeCalculations.ts:455` drops Earth — bug, add it | **Merging `kineticCalculations` costs up to +25%** on ingredient-recommender ordering. Also collapse the 5 inlined copies of the `(Matter+Earth)²` "conceptual inertia" into one exported helper — that's free |
| **8** | **current** | 5 live, irreconcilable at the limit: `reactivity·(dQ/dt)` (`kinetics.ts:123`) returns **0** in steady state where `reactivity·Q·0.1` (3 sites) returns a nonzero positive | Live | `kinetics.ts:123` is the defensible one — it is the only actual current (charge per time). The others are a charge-proportional *magnitude* | Rename the static form → **`chargeIntensity`** at `kineticCalculations.ts:151`, `alchm-quantities/route.ts:186`, `HistoricalStatsService.ts:161`. `UnifiedScoringService.ts:750` (`current = reactivity`, charge dropped entirely) and `hierarchicalRecipeCalculations.ts:449` (`reactivity·heat/100`) are neither — rename or fix | **Large.** Current feeds every `P=IV` site. Do **not** unify the formulas in one PR; rename first so the divergence is visible, then decide |
| **9** | **power** | 10 live | `kinetics.ts:159` for the kinetics family | `circuitOptimization.ts:206` (`(Spirit+Essence)·10`, no I, no V) is compared at `:159–165` against `dayCircuit.totalPower` computed via `P=IV` — **that comparison is between incommensurable scales and is a live correctness bug.** Fix or delete the comparison; rename the estimator → **`alchemicalPowerProxy`**. Add the `(1+forceMagnitude/10)` factor to `kineticCalculations.ts:154` or document why not | **Medium-high** — `MenuPlannerProvider`, `weeklyCircuitCalculations`, `intelligentSauceRecommender`. The comparison fix is likely to change menu-planner circuit output |
| **10** | **dignity multiplier** | 9 live on 5 incompatible scales; 5 dead | `src/utils/dignityScales.ts` `DIGNITY_ESMS_SCALE` + `planetaryAlchemyMapping.ts:542` (`1 + esmsScale/100`) — most defensible because it is the only one with a named, documented scale and a single table backing it | **DELETE dead:** `DIGNITY_FOOD_SCALE`, `getDignityESMSMultiplier`, `getDignityForFoodScoring`, `_getDignityMultiplier`, `calculations/alchemicalCalculations.ts:108` stub. **Reconcile live:** `RealAlchemizeService.ts:185` uses a private ±3 map (Mercury/Virgo = 3) and `Math.max(0.5, 1+d·0.15)`. It should import `dignityScales`. Rename `transformations.ts:452` (degree-based, ignores the planet) → **`degreeProximityBonus`** — it is not a dignity multiplier at all | **User-visible, and the biggest single divergence in the audit.** The two files that both claim to be the ESMS engine give Mercury-in-Virgo **1.45 vs 1.07** — a 36% spread. Unifying moves every chart-derived ESMS on `/planetary-chart`, `/birth-chart`, the economy pricing path, and every agent's stored chart. Needs a backfill plan |
| **11** | **orb / max-orb** | 12 live tables | `src/utils/aspectCalculator.ts:103` — 5 importers, the widest reach | Import it everywhere. Divergences to resolve: conjunction 8 vs 10 (`safeAstrology`, `synastryTools`), sextile 6 vs 4 (`astrologyUtils:1372`), trine 8 vs 7 (`validation.ts`), square 7 vs 8. `alchm-quantities/route.ts` uses a **per-pair moiety model** (Sun–Moon conjunction gets 13.5° vs 8°) — that is a different aspect model, **rename to `moietyOrb`** rather than merge, and decide deliberately which model ships. Delete `astrologyUtils.ts:1712 PLANETARY_ORBS` (0 callers). Fix `src/config.ts:39` — underscore-prefixed keys make all but `conjunction`/`quincunx` unreachable | **High and user-visible.** The moiety model admits aspects no other module considers to exist. Changing orbs changes which aspects appear on every chart page |
| **12** | **aspect strength** | 12 live across **three incompatible output ranges** (0–1, 0–2, 0–10) | `aspectCalculator.ts:187` cosine bell | The 0.500 agreement between cosine and linear at 4° orb is coincidental — they cross at exactly half-orb and nowhere else (2°: 0.854 vs 0.750; 6°: 0.146 vs 0.250). Worst offender: `alchm-quantities/aspects/route.ts:158` **recomputes a linear strength on top of `calculateComprehensiveAspects` output, discarding the cosine value it was just handed** — delete that recompute, it is pure loss. Normalize `safeAstrology.ts:320` (0–10) and `astrologyUtils.ts:1471` (0–2) to 0–1 or rename to `…Score10`/`…Weighted` | **Medium.** The aspects route fix is a genuine behaviour change (up to ±0.10 on strength) but strictly toward the canonical value |
| **13** | **monica degenerate return** | 8 live formulas agreeing on the happy path, returning `1.0`, `0`, `NaN`, or `null` in the degenerate regime | Live | `RealAlchemizeService.ts:483` — the **only** site that flags degeneracy (`monicaDegenerate` → `degraded.reasons`) instead of silently returning a value | Adopt its pattern everywhere: return a discriminated `{value, degenerate}` rather than a magic number. `1.0` is currently indistinguishable from a legitimately-computed 1.0 at every other consumer. Also add the missing `reactivity !== 0` guard at `alchemicalEngine.ts:269` and `UnifiedScoringService.ts:596` — both can currently yield ±Infinity | **Low frequency, high severity.** Only fires in degenerate charts, but there it silently fabricates plausible values |
| **14** | **heat / entropy in `AlchemicalService`, `IngredientService`, `UnifiedRecommendationService`** | `heat = (Fire+Air)/2`, `entropy = (Air+Fire)/2` — **numerically identical to each other** | Live, incl. the MCP tool surface (`lib/mcp/tools.ts:181`) | Canonical `monicaKalchmCalculations` | These are elemental proxies wearing thermodynamic names, and two of them are the same number. Either wire them to the canonical calculator or **rename to `elementalHeatProxy`/`elementalSpreadProxy`**. `UnifiedRecommendationService`'s `NaN` sentinels are honest and should be kept | **Medium** — 8 consumers plus an external MCP surface. Wiring to canonical changes output substantially (0.275 → 0.141 on the sample) |
| **15** | **kalchm floors** | 7 variants (`0.01`, `0.1`, `0.001`, `1e-9`, none, `\|\| 1`) | Live | `monicaKalchmCalculations.ts:105` (`0.01`) | **Low priority — all floors return the identical value (64) on any input where no ESMS component approaches zero.** They diverge only in the degenerate regime, which item 13 covers. `UnifiedScoringService.ts:588`'s `\|\| 1` is the odd one: a genuinely-zero Matter becomes `1^1 = 1` by unrelated logic that only coincidentally lands near `ε^ε` | **Near-zero on normal inputs.** Deliberately last |

---

## Suggested first PR

**`chore(physics): delete unreachable physics modules and orphan duplicates`**

Delete-only. No live code path is touched, so there is no behavioural risk to reason about — and it removes ~40 of the ~180 catalogued definitions, including three of the most misleading (the negative-returning kalchm, the linear 22×-canonical heat, and the duplicated orb table).

**Delete outright** (importer sweep verified, with a live-module control returning 16 to prove the grep was working):

```
src/services/ThermodynamicsClient.ts            src/hooks/useThermodynamics.ts
src/lib/alchemical-kinetics-sampler.ts          src/lib/alchemical-kinetics.ts
src/lib/celestial-energy-calculator.ts          src/lib/degree-agent-matcher.ts
src/lib/kinetics-client.ts                      src/lib/agents/consciousness-memory.ts
src/lib/kinetics-integration.ts                 src/utils/ingredientValidation.ts
src/utils/naturalLanguageProcessor.ts           src/utils/signVectors.ts
src/components/ElementalEnergyDisplay.tsx       src/constants/alchemicalEnergyMapping.ts
src/components/PlanetaryCalculationsDemo.tsx    src/components/PlanetaryCalculationsDemo 2.tsx
src/utils/recommendation/ingredientRecommendation 2.ts
```

Each pair above is a closed cycle: the second file is the first's only importer and has none of its own. `consciousness-memory` ↔ `kinetics-client` is a mutual-import pair with no external entry point. Both `PlanetaryCalculationsDemo` files are dead, not just the ` 2` copy.

**Edit two barrels** — these are the only compile-affecting changes:
- `src/utils/index.ts:24` — drop `export * from "./signVectors";`
- `src/constants/index.ts:6` — drop `export * from "./alchemicalEnergyMapping";`

**Surgical, not whole-file** — `src/lib/core-energy-rules.ts` (515 lines): delete `CoreEnergyCalculator`, `AdvancedConstantsCalculator`, `calculateKalchmSafe`, `calculateEnergy`, and the local `PLANETARY_MODIFIERS`. Keep `ANumberCalculator`, the one symbol `src/lib/galileo-logger.ts:4` imports. `galileo-logger` itself has zero importers and is a candidate for the same treatment, but it is observability rather than physics — leave the call on it to the user.

**Why this one first.** It is the only tranche where "what to do with the others" needs no judgement: zero callers means DELETE, not reconcile. It also pays a debt already booked — this same pattern (a lookalike definition that turned out to be unreachable) is what dissolved the INERTIA conflict on inspection. Doing it before any reconciliation means the harder decisions in rows 4, 10, and 11 are made against a map roughly a third smaller.

**Verification:** `bun run typecheck` catches every dangling reference from the two barrel edits; `rm .eslintcache` before `bun run lint` or the cache will re-report errors in files that no longer exist.

**Explicit non-goals for PR 1:** no renames, no formula changes, no orb-table unification. In particular, do **not** merge the `RealAlchemizeService` reactivity into the canonical form — the Earth² term is documented in-source at :455–458 as an intentional grounding constant, and merging it is a 4.4× swing on the live economy pricing path.
# Audit — claims that do not survive

## 1. Missed definitions (both maps' searches were name-anchored)

**`/Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/calculations/core/alchemicalEngine.ts:233,242,251,261`** — a complete heat / entropy / reactivity / gregsEnergy family, missed entirely by the thermo map. The map reads *this same file* for KALCHM (`:264`) and MONICA (`:269`) and marks it **LIVE with 7 importers**, so the omission is not a reachability judgment — the search simply didn't find them. They matter: these four are the only definitions in the repo with **no zero-floor and no divide-by-zero guard of any kind** (`heat = heatNum / heatDen`, bare). And `src/calculations/kinetics.ts:12` imports `alchemize` from this module, so the whole kinetic map sits downstream of an unguarded thermo family neither map recorded.

**`/Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/lib/alchemizer.ts:698-703`** — missed by both maps. Notable because its entropy denominator is genuinely novel:

```js
const earthWaterDenominator = matter + earth + water || 1
alchmInfo['Entropy'] = (spirit**2 + substance**2 + fire**2 + air**2) / earthWaterDenominator**2 || 0
```

Every other site uses `essence + matter + earth + water`. This one **drops Essence**. Dead (sole importer is the confirmed-dead `alchemical-kinetics-sampler`), but it is a distinct expression that a name-based search for `entropy` missed because the assignment target is a string key.

**`/Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/lib/ThermodynamicCalculator.ts`** — `calculateHeatValue` / `calculateEntropyValue` / `calculateReactivityValue`, a fourth family, unmapped. Plus a second gregsEnergy at `ThermodynamicsClient.ts:157` where the map lists only `:76`.

**`/Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/hooks/usePlanetaryKinetics.ts:146`** — a `calculateKinetics` call site absent from the kinetic map's enumerated 12.

## 2. Arithmetic that does not reproduce

**thermo, astrologyUtils heat = `9.26148`.** Impossible. The function derives its own ESMS from elements only (`Spirit = Fire + Air`, `Essence = Water + Earth`, …), so the shared ESMS inputs (S=4, E=4, M=4, Sub=2) never enter it. On the map's own elements the real values are **heat 0.2003, entropy 0.4156, reactivity 1.0225, gregsEnergy −0.2247**. The stated **"spread of ~66×"** collapses to **1.4×**, and the "astrologyUtils is the extreme outlier" framing inverts — the actual outlier is `alchemicalEnergyMapping`'s linear `3.2`, which does hold at 22.8× canonical.

**thermo, backendAdapter = `85.74`.** Recomputing with the map's own heat/entropy/reactivity gives **82.097**. 85.74 requires entropy ≈ 0.100, not the 0.2822 the map reports two paragraphs earlier. The conclusion (incommensurable 0–200 scale) survives; the number is wrong.

**kinetic, inertia worked example.** The map quotes `max(1, Matter + Earth + Substance/2)` then says it returns "2.25 / ~2.5" at M≈1, Sub≈1, Earth≈0.25. It returns **1.75**. (Route form 4.5 is correct; cookingMethod 1.175; hierarchical 1.2.)

**weights, `normalizeAlchmWeight(Jupiter) = 0.741`.** `PLANET_ALCHM_PERIODS.Jupiter = 11.86` → **0.7315**. Sun 0.5131, Moon 0.2841, Pluto 1.0 all check out; only Jupiter is off.

## 3. "They disagree" asserted without — or against — the arithmetic

**kinetic: "Inertia: no two of the six live definitions agree on any input."** False, and the same paragraph concedes it. `kinetics.ts:99` and `kineticCalculations.ts:134` are the *identical expression* `max(1, Matter + Earth + Substance/2)`, differing only by `modifiers.inertia = 1.0 + w*0.20` where `w = normalizePlanetWeight(...)`. For Pluto, `w = 0` exactly (it is the log-scale minimum), so the modifier is exactly 1.0 and the two agree exactly. Same expression, two paths.

**kinetic: "Ranges do not even overlap — recipe/method forms near 1.0–1.5, the route form near 3–8."** Not shown, and false. Every form floors at 1 (or 0.5), and `hierarchical = 1 + (M+S)*0.1` is unbounded above. On the thermo map's own shared input (M=4, Sub=2, Earth=0.2): kinetics 5.2, route 8.0, hierarchical 1.6, cookingMethod 1.52. Overlapping.

**weights: the entire Sun–Moon 4°-orb comparison table.** It rests on `aspectCalculator`'s `orbMultiplier = 1.2` branch being dead. It is not dead — the code lowercases *both* names before comparing:

```js
const p1Lower = planet1.toLowerCase();
if (p1Lower === "sun" || p1Lower === "moon" || ...) orbMultiplier = 1.2;
```

The in-file comment claiming "a strict lowercase match here never fires" is stale, and the map repeated it as fact rather than reading the two lines above it. So for Sun–Moon conjunction, `adjustedMaxOrb = 9.6` and canonical strength = **0.6294**, not 0.500. That deletes the reported three-way tie at 0.500 (cosine / route-linear / validation), and the follow-on demonstration — "cosine and linear cross only at exactly half-orb… agree at exactly three points" — does not apply to this pair at all, since the two formulas now use different maxima (9.6 vs 8) and share only the r=0 endpoint. The *conclusion* (they disagree) gets stronger; the *evidence offered* was wrong.

## 4. LIVE resting on a dead caller

**`signVectors` is dead, and thermo uses it as liveness evidence** for `kalchmEngine`, `data/unified/alchemicalCalculations`, and the nutritional path. Its only external reference is the barrel line `src/utils/index.ts:24: export * from "./signVectors"`; none of `calculateSignVectors`, `getAlchemicalStateWithVectors`, `signVectorToESMS`, `blendESMS`, `compareSignVectors` is referenced anywhere outside the file. The weights map independently reaches the same verdict — so the two maps contradict each other, and thermo is the one that's wrong.

**Caller counts inflated with self-declared-dead files.** `naturalLanguageProcessor.ts:720` is counted among the 12 `calculateKinetics` sites while the same map declares that file dead (confirmed: zero importers). `ingredientRecommendation 2.ts:1306` and `PlanetaryCalculationsDemo.tsx:270` are counted among the "6 call sites" of `calculateKineticProperties` while both are separately declared dead — the real live count is 3.

**weights marks `src/lib/core-energy-rules.ts:298 PLANETARY_MODIFIERS` LIVE** on the strength of an in-file caller at `:412`. `galileo-logger.ts` imports only `ANumberCalculator` from that module; nothing else references it. Thermo correctly calls the same module dead. Cross-map contradiction, resolved in thermo's favor.

## Survives, for the record

The Earth² reactivity fork (canonical 2.053 vs Dignity 9.09375, ratio 4.43), kalchm = 64 across all floor variants, the canonical heat/entropy/gregsEnergy triple (0.140536 / 0.282238 / −0.43890), `force = momentum / inertia ≡ velocity` in `kineticCalculations.ts`, `forceMagnitude` being the norm of momentum rather than of the returned force, the byte-identical `RealAlchemizeService` second block, both monica-as-longitude-average sites, the `normalizePlanetWeight` values, and the dignity spread (Sun-in-Leo 1.10 vs 1.15 vs 1.50; Mercury-in-Virgo 1.45 vs 1.07) all check out as reported.
