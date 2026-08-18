# The Lab — Thermal Solver — Stitch Design Prompt

Ready-to-paste prompts for **Google Stitch** to design the **`/lab` thermal solver**: a
guided, five-step instrument that takes a real ingredient, a shape, a vessel and an
environment, and returns how long it takes to cook, how much water it loses, and — the
headline — **which link in the heat path is actually the bottleneck**.

Built on a physics engine that is already finished and dual-implemented in Rust and
TypeScript under a bit-exact parity contract. Every number Stitch draws corresponds to a
real engine output. See **Wiring notes** at the end for the exact function behind each panel.

**Division of labor:** Stitch owns the *visual design* — step anatomy, the resistance-chain
diagram, result cards, page composition. Code-side we already have the full data contract.
**Do not let Stitch invent data the engine does not produce, and do not let it invent
precision the physics does not have.**

**How to use:** Paste the **Global Style Block** first, then paste each **Screen prompt** as
its own generation, keeping the style block at the top of each. Generate **Screen 3 (the
result board)** first — it is the payload, and Screens 1–2 exist to feed it.

---

## What this tool is, in one paragraph Stitch must understand

Not a recipe app. Not a timer. It is a **bench instrument**: the user describes a physical
arrangement and the tool computes its heat transfer from first principles, showing its work
and refusing to answer where the physics does not hold. The closest visual relatives are an
oscilloscope UI, a spectrometer readout, and an engineering datasheet — not a cooking blog.
The emotional register is **precision and candour**, never enthusiasm.

---

## Design decisions locked in

| # | Decision | Choice |
|---|----------|--------|
| Placement | Where it lives | **Tabs on the existing `/lab` route**, mirroring the `/cooking-methods` Physics / Reactions / Conditions split. Not a new route. The existing astrology panels stay on their own tab |
| Tabs | Inventory | **Solver · Boundaries · Volumetrics · Reference**. Solver is default |
| Procedure | What "guided" means | A **five-step input sequence with a persistent result rail** — not a wizard with a Next button. Every step stays open and editable; the rail recomputes live. Step order: **Ingredient → Geometry & State → Environment → Vessel & Lid → Solve** |
| Recompute | Feel | **Instant, local, deterministic.** No spinners, no "calculating…", no network. The engine runs in under a millisecond |
| Ingredients | Inventory | **A curated canonical set of ~42 ingredients that carry a real USDA proximate composition.** Searchable. Each row shows its FDC id. Ingredients WITHOUT composition are not selectable and are not shown |
| Geometry | Shapes | **Slab, cylinder, sphere** — the three the transient conduction solution covers. Shown as diagrams, not a dropdown of words |
| Vessels | Inventory | **8 vessels** from the registry, each with real internal dimensions, a material, and an optional lid. Lidless vessels must not render a lid control at all |
| Lid | Control | A **seal state**, not a checkbox: `none / cracked / loose / tight`. Only offered when the vessel has a lid |
| Environment | Inputs | Air temperature, relative humidity, air velocity, elevation — **user-adjustable with sea-level ISA defaults**. NOT live weather. A "defaults" chip states they are standard-atmosphere assumptions |
| Alchemy | Coupling | **NONE.** No ESMS, no elements, no planets anywhere on these tabs. This is the one surface in the product that is purely physical, and that separation is the point |
| Precision | How numbers read | **Two significant figures for anything downstream of a convection correlation**, which carries ±20–30% of its own. Times round to the nearest minute. No trailing decimals implying precision that does not exist |
| Units | Display | **Metric primary, imperial secondary in a lighter weight** — °C (°F), g (oz), mm (in) |

### Hard constraints the design MUST respect

These are not stylistic preferences. Each one is an existing engine behaviour that the UI has
to have somewhere to put.

1. **Every value states its basis.** A gram weight is either `USDA measured` (with its FDC id)
   or `water approximation` (with a note saying so). These must look *visibly different* —
   the measured one authoritative, the approximated one visibly provisional. **Absence of
   data must never look like data.** Design a basis chip.

2. **Refusals render a reason, never a number.** The engine throws rather than extrapolating
   in a dozen places: air outside 250–800 K, water above its boiling point, relative humidity
   above 100 °C, boiling past the critical heat flux, a target the medium cannot reach.
   Design an **honest-refusal state**: a short plain sentence saying what was asked and why
   it cannot be answered. It must not look like an error or a failure — it is the tool
   working correctly. Never a 0, never a dash, never "N/A".

3. **Correlations flag their own extrapolation.** Natural convection returns an
   `extrapolated` boolean when the Rayleigh number leaves the published envelope. Design a
   small **"outside fitted range"** marker that can ride on any derived number.

4. **A composition that does not close says so.** Each ingredient's five mass fractions sum
   to ~1.000. Two do not (vanilla extract 0.656 — the missing third is ethanol; black pepper
   0.947). Where the residual is material, the result must carry an **unaccounted-mass**
   warning, because the derived properties are then unusable.

5. **The pinned surface temperature is a lower bound, not a prediction.** It assumes free
   water; real food's crust limits moisture migration and sits above it. Design it as a
   **bound with a stated direction** ("as cold as the surface can be"), not a point value.

6. **Coverage is reported, not hidden.** Only 36 of 1,460 ingredient names have measured
   volume portions (32.4% of corpus mentions). Wherever the tool converts a volume, the
   coverage reality must be visible rather than implied away.

---

## Global Style Block — paste at the top of EVERY screen prompt

> **Brand & system.** Dark, instrument-grade laboratory UI. Near-black ground `#0a0a0c`,
> panel surface `#11131e`, foreground text `#e2e1f1`, hairline rules `#3a494b`, secondary
> outline `#849495`. The single accent is an electric cyan `#00f2ff`, used sparingly — for
> the live/computed value, the active step, and the controlling bottleneck. A warm ember
> `#ff571a` marks heat, loss and refusal states. A green `#00fb86` marks a measured,
> sourced value. Never use accent colour for decoration; in this UI colour means something.
>
> **Type.** A geometric sans for UI and labels; a **monospaced face for every number,
> unit and identifier** — numbers must align in columns and never reflow as they update.
> Labels are small, uppercase, wide-tracked, in the outline grey. Values are large and in
> the foreground colour. Units are always present and always a step smaller and lighter
> than the number they qualify.
>
> **Surface.** Panels are flat with a 1px hairline border, radius 4px — crisp, not soft. No
> drop shadows, no glassmorphism, no gradients except a single subtle one permitted inside
> the resistance-chain diagram. Generous internal padding; dense but never cramped.
> Hairline rules separate rows rather than alternating fills.
>
> **Chrome to avoid.** No emoji. No illustrations of food. No stock photography. No
> "AI sparkle" iconography. No progress bars pretending computation takes time. No
> celebratory states. This tool's personality is a well-made instrument: it is quiet,
> exact, and tells you when it does not know.
>
> **Layout.** Desktop-first, 1440px canvas, but every panel must reflow to a single column
> at 375px. Wide tables and the chain diagram scroll horizontally inside their own
> container — the page body never scrolls sideways.
>
> **Accessibility.** All text meets WCAG AA on the dark ground. Never encode a state in
> colour alone — the controlling bottleneck is also marked with a label and a weight change;
> the basis chips differ in shape as well as hue.

---

## Screen 1 — The Solver: input rail (five steps)

> Design the **input column** of a thermal solver, occupying the left 40% of a two-column
> desktop layout. Five stacked step panels, all simultaneously open and editable, each
> numbered and titled. The currently focused step gets a cyan left edge; the others stay
> quiet. There is no Next button anywhere — this is a control surface, not a wizard.
>
> **Step 1 — Ingredient.** A search field over a curated set of about 42 items. The selected
> ingredient renders as a compact card showing: its name; a horizontal **stacked composition
> bar** of five mass fractions (water / protein / fat / carbohydrate / ash) with the
> percentages beside it in monospace; and a small provenance line reading `USDA FDC #170379 ·
> retrieved 2026-08-17` in the outline grey. Include a variant of this card showing an
> **unaccounted-mass warning** for an ingredient whose fractions sum to 0.656 rather than
> 1.000, with a one-line explanation.
>
> **Step 2 — Geometry & State.** Three selectable shape tiles — **slab, cylinder, sphere** —
> drawn as clean technical line diagrams with the characteristic dimension dimensioned on
> the drawing (half-thickness for the slab, radius for the other two). Below: a size field
> in mm, a mass field in g, and a starting-temperature field in °C. Beside the fields, a
> passive readout showing the derived **surface-area-to-volume ratio**, so the user sees the
> geometry consequence immediately.
>
> **Step 3 — Environment.** A method selector (roasting / boiling / steaming / frying /
> sous vide / braising / grilling), then four numeric fields: air temperature, relative
> humidity, air velocity, elevation. A small chip above them reads `STANDARD ATMOSPHERE ·
> EDITABLE` to make clear these are assumptions, not measurements. Show the derived local
> boiling point updating live beside the elevation field — at 1609 m it reads `94.7 °C`.
>
> **Step 4 — Vessel & Lid.** A row of 8 vessel tiles, each a **top-and-section technical
> silhouette** at true relative proportion, labelled with its name and internal diameter. The
> selected vessel expands to show internal dimensions, material, capacity in litres, and
> thermal mass in J/K. **Lid control appears only for vessels that have one** — a four-state
> segmented control `none / cracked / loose / tight`. Design the panel in both states: one
> vessel with a lid control, one without any lid affordance at all.
>
> **Step 5 — Solve.** Not a button. A summary line restating the whole arrangement as one
> sentence in monospace, plus a `RECOMPUTED 0.4 ms AGO` timestamp in the outline grey.
>
> Also design the **refusal state** for Step 3: the user has entered an air temperature
> outside the property tables' range, and the panel shows a short plain-language sentence
> explaining what was asked and why it cannot be answered, in the ember colour, with the
> offending field marked. No error iconography, no red alert banner — this is the tool being
> honest, and it should feel calm.

---

## Screen 2 — The resistance chain (the signature diagram)

> Design the **thermal resistance chain** — the single most important graphic in this
> product. It shows the heat path from the source to the food's core as a horizontal series
> of links, and makes the bottleneck unmistakable.
>
> Five links left to right, each a labelled block: `source → vessel outside`, `through the
> vessel wall`, `vessel inside → medium`, `medium → food surface`, `food surface → core`.
> **The width of each block is proportional to its share of the total resistance** — this is
> the whole idea, so the proportions must be honest and the numbers must be printed on the
> blocks. In the boiling-water case the last block occupies 81.9% of the width and the vessel
> wall is a sliver 0.17% wide that still has to remain visible and labelled.
>
> The **controlling link** — the widest — is marked in cyan with a heavier label and a small
> `CONTROLLING` tag. All other links stay in the neutral surface colour.
>
> Below each link, in monospace: its resistance in K/W in scientific notation, its percentage
> share, and the **temperature drop across it in K**. Above the chain, a temperature axis
> showing the node temperatures stepping down from source to core.
>
> Beside the chain, a compact readout block: **total resistance**, **overall conductance UA
> in W/K**, **heat flow in W**, and the **Biot number** with a plain-language verdict — under
> 0.1 reads `surface-limited`, over 10 reads `interior-limited`.
>
> Design **three variants of this diagram side by side**, because the comparison is the
> product's core insight:
> 1. **Oven, roast on a rack** — only two links (no vessel at all), the air holds 81.5%,
>    Bi 0.23, verdict `surface-limited`.
> 2. **Boiling water, same food** — five links, the food's interior holds 81.9%, Bi 22.7,
>    verdict `interior-limited`.
> 3. **Empty pot on a burner** — three links, no food, the burner-to-pan link holds 97.7%.
>
> The variant with no vessel must show a **two-link chain**, not a five-link chain with three
> empty slots. The absence is real and the diagram must express it.

---

## Screen 3 — The result board (generate this first)

> Design the **right 60% result rail** of the solver: four stacked result cards that
> recompute live as the inputs change. All numbers monospaced, all units explicit, two
> significant figures on anything derived from a correlation.
>
> **Card 1 — Time to core.** The headline. A large temperature-versus-time curve from the
> starting temperature to the target, with the target as a horizontal dashed rule and the
> crossing point called out. The headline figure is the time in minutes. Beneath it, three
> supporting figures: the Biot regime, the medium temperature, and the surface coefficient h
> in W/m²·K — the last carrying a small `±25%` qualifier, because that is the honest accuracy
> of the correlation behind it. Design a second version of this card in its **refusal state**,
> where the medium cannot reach the target temperature at all: the curve is replaced by a
> single sentence explaining that a 60 °C bath cannot bring a core to 75 °C, ever.
>
> **Card 2 — Water loss.** Evaporation over the cook. A figure in grams and a figure in
> watts, side by side — for an open 20 cm pan of boiling water these read `574 g/h` and
> `360 W`. A small horizontal bar splits the total energy into **sensible** and **latent**
> shares, showing the latent term dominating a reduction. When a lid is fitted, the bar gains
> a third **returned as condensate** segment, and the card shows the escape/return split —
> for a tight Dutch oven, 29 kJ escaping against 335 kJ returning. This card must make the
> mechanism of braising legible at a glance.
>
> **Card 3 — Surface state.** The evaporative pin. A vertical thermometer-like scale from the
> ambient temperature up to the local boiling ceiling, with the **pinned surface temperature
> marked as a band with an upward arrow**, not a point — it is a lower bound. A label reads
> `AS COLD AS THE SURFACE CAN BE`. Beside it, the browning verdict: the Maillard threshold at
> ~140 °C drawn on the same scale, so a surface pinned at 55 °C in a 200 °C oven is visibly
> nowhere near it. One line explains why: the surface is still wet.
>
> **Card 4 — Bottleneck.** A compact embed of the resistance chain from Screen 2, plus a
> single plain-language sentence naming what to change. For the interior-limited case it
> reads something like: `the food's own interior holds 82% of the resistance — a hotter
> medium or more stirring will not help; a thinner cut will`.
>
> Design the **whole rail at 375px width** as well, where the four cards stack and the chain
> diagram scrolls horizontally inside its own container.

---

## Screen 4 — Boundaries tab (the reference surface)

> Design the **Boundaries** tab: a reference view for the property data and correlations the
> solver runs on, for a user who wants to check the tool's homework.
>
> A two-column layout. Left: **property tables** for air and saturated water, rendered as
> dense monospaced data tables with a temperature column and the four stored transport
> properties, plus the three derived ones in a visibly lighter weight with a `DERIVED` column
> header treatment. Above each table, its source line — `Incropera & DeWitt, Table A.4` — and
> a **closure figure**: `derived Prandtl reproduces the printed column to 0.067%`. That
> closure is the tool's own transcription check and should read as a quiet badge of honesty,
> not a marketing claim.
>
> Right: a **correlation catalogue**. One row per correlation — Churchill & Chu vertical
> plate, McAdams horizontal plates, Rohsenow nucleate boiling, Zuber critical heat flux,
> Chilton–Colburn evaporation. Each row shows the correlation's name, its published citation,
> its **validity envelope**, and its **stated accuracy**. Rows currently being used by the
> solver's active arrangement are marked in cyan; the rest stay quiet.
>
> Include a **boiling-regime chart**: heat flux against excess temperature on log axes, with
> the nucleate-boiling curve rising as ΔT³ and a hard vertical cutoff at the critical heat
> flux (1.25 MW/m²) beyond which the tool refuses to answer. Annotate the cutoff with a short
> line about why: past burnout the vapour film goes continuous and flux falls, so the curve
> does not continue upward. This chart is where the tool's most interesting refusal becomes
> visible, and it should be the visual centrepiece of the tab.

---

## Wiring notes (for the implementing engineer, not for Stitch)

Every panel above maps to an existing function. Nothing here needs new physics.

| Panel | Engine source |
|---|---|
| Ingredient composition | `NutritionalProfile.composition` (`ProximateComposition`, ~42 ingredients) + `compositionResidual()` for the unaccounted warning |
| Derived properties | `foodProperties()` in `src/lib/cooking/choiOkos.ts` → ρ, cp, k, α + `unaccountedFraction` |
| Shape tiles + S/V | `FoodGeometry`, `surfaceAreaToVolume()`, `characteristicLengthRatio()` in `src/lib/cooking/thermo.ts` |
| Time-to-core curve | `slabCoreTime()` — throws `TargetUnreachable`, which is Card 1's refusal state |
| Local boiling point | `saturationCeilingAtElevation()` — returns a `clamped` flag; surface it |
| Vessel tiles | `VESSELS_DERIVED` in `src/data/cooking/vessels.ts` (8 entries, real dimensions) |
| Lid control | `VesselLid.seal`; hide entirely when `vessel.lid` is undefined |
| Escape / return split | `splitEvaporation()` |
| Resistance chain | `solveBoundaryNetwork()` in `src/lib/cooking/boundaryNetwork.ts` → `links[]`, `share`, `dropK`, `controlling`, `foodBiot`, `nodes[]` |
| h values | `naturalConvectionH()` / `forcedConvectionHFlatPlate()` — carry the `extrapolated` flag through to the UI |
| Water loss | `evaporativeFlux()` + `batchThermalLoad()` in `volumetrics.ts` (`sensibleJ` / `latentJ` / `latentShare`) |
| Surface pin | `evaporativePinnedSurfaceC()` — `celsius` is a LOWER bound; `saturated` means it hit the ceiling |
| Boiling-regime chart | `nucleateBoilingFlux()` + `criticalHeatFluxWm2()`; the refusal above CHF is a thrown `RangeError` |
| Property tables | `AIR_MIN_C` / `AIR_MAX_C` / `WATER_MIN_C` / `WATER_MAX_C` bound the editable ranges |
| Volume → mass | `convertToGramsDetailed()` returns `basis: "usda-measured" | "water-approximation"` — this drives the basis chip |
| Coverage figure | `MEASURED_INGREDIENT_COUNT` (36) |

**Precedent to follow:** `src/__tests__/components/methodPanelPresentationGuards.test.tsx`
already pins the honesty rules for the cooking-methods panels — absence renders a stated
reason and never a number, a missing operand suppresses its delta, no branch leaks a NaN
into panel text. The lab panels get the same treatment, and those tests are the template.

**Theme:** reuse the `--ma-*` tokens from `src/app/cooking-methods/alchemy.css` rather than
introducing a second palette.
