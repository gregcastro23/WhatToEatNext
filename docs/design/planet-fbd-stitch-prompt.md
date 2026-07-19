# Planetary Free-Body Diagrams — Stitch Design Prompt

Ready-to-paste prompts for **Google Stitch** to design the **Planetary Free-Body Diagram
cards** — a per-planet force-vector card that decomposes everything the alchemical engine
knows about a planet (aspects, sign pull, sect pull, dignity, momentum) into a physics-style
free-body diagram, plus the two page surfaces that host them: the upgraded `/planetary-chart`
(current sky) and the birth-chart page (natal). Built from the engine contract in
`src/calculations/planetaryFBD.ts` — every vector Stitch draws corresponds to a real
engine-native quantity.

**Division of labor:** Stitch owns the *visual design* — card anatomy, vector styling, page
composition. Code-side we already have the full data contract (`buildFreeBodyDiagrams` →
`PlanetFBD[]`), the kinematics model, the dignity table, and the canonical planet colors —
see **Wiring notes** at the end. Do not let Stitch invent data the engine doesn't produce.

**How to use:** Paste the **Global Style Block** first, then paste each **Screen prompt** as
its own generation (Stitch generates one screen per prompt; keep the style block at the top
of each so every screen stays on-brand). Generate **Screen 2 (card anatomy)** first — the
card is the atom; Screens 1 and 3 are compositions of it.

---

## Design decisions locked in

| # | Decision | Choice |
|---|----------|--------|
| Placement | Where the cards live | **Birth-chart page (natal cards)** + an **upgraded `/planetary-chart`** (current sky). The chart wheels stay; cards are added around them |
| Access | Gating | `/planetary-chart` becomes **fully public — the premium gate is removed**. No locked states in the design |
| Data | Freshness | **Server-computed per page load, no polling.** No live-updating chrome, no pulsing "LIVE" dots — a computed-at timestamp is the honesty device |
| Bodies | Card inventory | **The ten modern planets** (Sun→Pluto), one card each. Ascendant participates as an aspect *source* but gets no card |
| Forces | Vectors per card | **Aspect vectors** (majors + minors, magnitude = cosine-bell strength × orb-budget weight maxOrb/8) + **sign/element pull (0.6)** + **sect pull (0.4)** + **dignity boost/drag** + **momentum** |
| Geometry | Vector directions | Aspects point at **true ecliptic bearings** (0° = ahead along the zodiac, CCW); element/sect/dignity/momentum use **fixed compasses**: Fire↑ Air→ Water↓ Earth← and Spirit↑ Essence→ Matter↓ Substance← |
| Kinematics | Applying vs separating | **Applying** = solid filled arrowhead pointing IN at the planet + countdown ("applying · 2.3d to exact"). **Separating** = open outlined arrowhead angled away. Stationary = no arrowhead verdict |
| Magnitudes | Honesty | **Real engine values, normalized per card** (max = 1, visibility floor 0.12). Raw numbers revealed on hover/tap — never printed as fake precision on the resting card |
| Backdrop | Card background | A **zoomed arc segment of the zodiac** centered on the planet's exact degree°minute′, with a fine **arc-minute ruler** (15′ majors, 5′ fine ticks) and the occupied sign's glyph as a watermark |
| Resultant | The headline vector | The **ESMS alchemical tendency** (x = Essence−Substance, y = Spirit−Matter) drawn in the signature gradient, plus elemental push, net harmony, and physics readouts (charge Q, momentum p, speed ω in ′/day, alchemical weight m) |
| Natal degrade | Stored charts | Natal charts carry no daily motions → cards show a **"STATIC CHART · MOTION UNAVAILABLE"** chip, **no applying/separating verdicts, no momentum vector**. Never fake motion |
| Wheel overlays | Birth-chart wheel | The natal/transit wheel gains **aspect chords** (harmony teal / tension ember, width ∝ strength) and **radial element sign-vectors** at each natal planet |
| Interaction | This round | **Hover/tap reveals raw values. No animation** — vectors are static ink; motion is a later round |

### Hard constraints the design MUST respect
- **Every vector is an engine quantity.** Aspect strength (cosine-bell 0–1), type weight
  (maxOrb/8 = 0.25–1.0), sign 0.6, sect 0.4, dignity |multiplier−1| (±15%/level, floor
  ×0.5), momentum |speed × alchemical weight|. Stitch must not invent extra forces,
  gauges, or scores.
- **Two compass systems, never conflated.** Fire/Water/Earth/Air (element rose) and
  Spirit/Essence/Matter/Substance (ESMS rose) are different four-part readings. Element
  vectors use element colors; the ESMS resultant uses the signature gradient and ESMS
  glyphs (🜀 🜁 🜃 🜄). Both micro compass roses appear on every card so the axes are
  always legible.
- **Card space is polar, zodiac-anchored:** 0° = the direction of increasing ecliptic
  longitude ("ahead" along the zodiac), increasing counterclockwise. The arc-ruler
  backdrop makes this physical — "ahead" on the ruler IS 0°.
- **Per-card normalization:** the longest vector on a card renders at full length; all
  others scale to it with a 0.12 minimum visible length. Cards are NOT cross-comparable
  by vector length — the physics footer carries the absolute numbers.
- **Honest degradation:** no speeds → no kinematics, no momentum, and the static-chart
  chip. No polling → no live chrome. Missing dignity (score 0 / peregrine) → no dignity
  vector at all, just the "PEREGRINE" chip.
- **No animation this round.** No orbit spins, no pulsing, no particle garnish. Hover
  states are tooltip + highlight only.
- No lorem ipsum — use the real copy strings and real example numbers given in each
  screen prompt.

---

## GLOBAL STYLE BLOCK  *(prepend to every screen prompt)*

```
STYLE: A refined culinary-astrology app's astronomy surface, DARK theme only (never
white/light surfaces). Premium, precise, quietly technical — think a beautifully typeset
observatory notebook, NOT a sci-fi console, NOT a game HUD. Clear hierarchy, generous
spacing, one focal diagram per card.

COLOR PALETTE (dark, use these exact hex):
- Backgrounds (darkest→lightest surfaces): #07060B, #0E0C16, #15121F, #1C1829, #241F33
- Text: #F2EDFF (primary), #B5ADCC (secondary/labels), #6E6884 (muted)
- Primary accent (violet): #B85AF0
- Secondary accent (copper-gold): #DEA54B
- Element accents (element vectors, dots, compass roses): Fire #F87171, Earth #34D399,
  Air #C084FC, Water #60A5FA
- Aspect polarity: harmony teal #2DD4BF (conjunction/trine/sextile), tension ember
  #FB923C (opposition/square), neutral #B5ADCC (minor aspects)
- Signature gradient: 135° copper→violet (#DEA54B → #B85AF0) — reserved for the ESMS
  resultant vector and the page hero glow only.
- Canonical planet colors (approximations of the app's oklch tokens; exact tokens applied
  in build): Sun #DEA54B (copper), Moon #D6CFE8 (pale lavender-silver), Mercury #E3D3A3
  (airy pale gold), Venus #ECA9A0 (warm rose), Mars #E06A50 (ember red), Jupiter #E5B36B
  (amber), Saturn #8E8A9C (lead gray-violet), Uranus #5BC8D9 (electric cyan), Neptune
  #7D8FE0 (deep indigo), Pluto #C06A9E (dark magenta).

SURFACES: Translucent "glass" cards — subtle white 4–8% fill, 1px hairline border, soft
backdrop blur, rounded corners (14–16px). Diagram ink is thin, precise hairlines — an
instrument-drawing feel, never neon glow.

TYPOGRAPHY:
- Headings: an elegant serif (Cormorant Garamond), medium weight, tight letter-spacing.
- Body: a clean humanist sans (Manrope).
- All small labels, numbers, coordinates, readouts: a monospace (JetBrains Mono),
  UPPERCASE, wide letter-spacing (~0.12em), tabular figures. This mono-caps micro-label
  treatment is the brand signature — every degree, orb, and physics number wears it.

ICONOGRAPHY: Planetary glyphs ☉ ☽ ☿ ♀ ♂ ♃ ♄ ♅ ♆ ♇, zodiac glyphs ♈–♓, aspect glyphs
☌ ☍ △ □ ⚹ ⚻ ⚺, the retrograde mark ℞, and the four ESMS alchemical symbols 🜀 (Spirit)
🜁 (Essence) 🜃 (Matter) 🜄 (Substance). Small element dots. Minimal line icons elsewhere.
No occult ornament beyond these glyph sets, no fake telemetry, no crosshair gauges.

MOOD: The sky as a solved diagram — calm, exact, a little reverent. Every line earns
its ink.
```

---

## SCREEN 1 — Planetary Ecosystem (/planetary-chart, desktop 1440px)

```
[PREPEND GLOBAL STYLE BLOCK]

SCREEN: "Planetary Ecosystem" — the upgraded /planetary-chart page, desktop 1440px,
fully public (design NO premium locks, NO upgrade prompts). Three stacked zones: sky
telemetry header, the chart wheel, then the ten-card free-body-diagram grid.

PAGE HEADER: serif title "The Sky, Resolved" with a mono-caps subline "CURRENT SKY ·
COMPUTED 19 JUL 2026 · 14:32 UTC" (a computed-at stamp, NOT a live badge — no pulsing
dots anywhere on this page). Below it, the SKY TELEMETRY STRIP: six compact mono-caps
stat tiles in one row — "HEAT 0.42" · "ENTROPY 0.31" · "REACTIVITY 0.27" · "GREGS
ENERGY 1.86" · "KALCHM 3.14" · "MONICA 0.98". Each tile: glass chip, muted mono-caps
label on top, larger tabular number below, a hairline divider between tiles. No gauges,
no sparklines — clean figures.

CHART WHEEL (center, kept): the existing circular planetary chart occupies the middle
zone (~560px), zodiac ring with sign glyphs, ten planet glyphs at their true longitudes,
aspect lines across the wheel colored by polarity (harmony teal #2DD4BF / tension ember
#FB923C, width proportional to strength). Flank it left/right with two quiet glass
panels: left = a mono-caps position table (PLANET · SIGN · DEG°MIN′ · SPEED ′/DAY, ten
rows, ℞ marks on retrogrades); right = an aspect ledger (glyph pair, type, orb, and an
"applying · 2.3d" or "separating · 5.1d" mono verdict per row).

FBD GRID (below the wheel): mono-caps section label "FREE-BODY DIAGRAMS · TEN BODIES ·
FORCES TO SCALE PER CARD". A 2-row × 5-column grid of square-ish FBD cards (~264px),
Sun→Pluto in canonical order, each rendered per the FBD CARD ANATOMY spec (compact
variant: header row, arc-ruler backdrop, vectors, resultant, slim physics footer — the
corner compass roses may shrink to 24px at this size). Each card's planet glyph orb uses
that planet's canonical color so the grid reads as one system: copper Sun, silver Moon,
pale-gold Mercury, rose Venus, ember Mars, amber Jupiter, lead Saturn, cyan Uranus,
indigo Neptune, magenta Pluto.

Show ONE card in its hover state (Mars): a small dark tooltip pinned to one aspect
vector reading "□ SATURN · orb 2°14′ · strength 72% × weight 0.88 · applying · 3.1d to
exact" in mono-caps, and the hovered vector highlighted while siblings dim slightly.

MOBILE NOTES (390px): the telemetry strip becomes a 3×2 grid of stat chips; the wheel
scales to full width; the FBD grid collapses to ONE column (cards full-width, ~340px
tall); the position table and aspect ledger fold into collapsible sections under the
wheel. Same computed-at stamp, same no-live-chrome rule.

Do NOT include: premium locks or upgrade banners, live/pulsing indicators, auto-refresh
chrome, invented metrics beyond the six named, gauges or radial dials in the telemetry
strip.
```

---

## SCREEN 2 — FBD Card Anatomy (one card, full size) — THE ATOM

```
[PREPEND GLOBAL STYLE BLOCK]

SCREEN: One "Planetary Free-Body Diagram" card at full size (~420×520px) on the dark
canvas, plus its hover-tooltip state as an inset. This is the atom of the whole feature —
design it as a precise instrument drawing. Use MARS as the specimen with these exact
real-shaped values.

CARD HEADER ROW: left — the planet glyph ♂ inside a small circular orb tinted Mars ember
#E06A50, then "Mars" in serif 20px. Right — a mono-caps position readout "♑ 18°42′"
(sign glyph + degree°minute′, tabular mono), a small "℞" badge in a hairline pill ONLY
when retrograde (show it OFF for Mars here), and a DIGNITY CHIP: "EXALTED ×1.30" in a
harmony-teal-tinted pill (dignity states: EXALTED DOMICILE / EXALTED / DIGNIFIED /
PEREGRINE / DETRIMENT / FALL / DEBILITATED; boosts tint teal, drags tint ember,
PEREGRINE stays neutral gray with no vector).

BACKDROP — ZOOMED ARC RULER: the card's diagram zone is backed by a gently curved
horizontal band (a zoomed segment of the zodiac arc, curvature subtle, ~8° of arc
implied) centered on the planet's exact position 18°42′. A fine ruler runs along the
band: major ticks every 15′ with tiny mono labels ("18°30′", "18°45′", "19°00′"), fine
ticks every 5′, hairline weight, muted #6E6884. Behind the ruler, the occupied sign's
glyph (♑) as a huge, very-low-opacity watermark. The ruler's "ahead" direction
(increasing longitude) points RIGHT — this anchors the vector space: 0° = right = ahead
along the zodiac, angles increase counterclockwise.

CENTRAL NODE + VECTORS: the planet sits at the card's center as a small filled circle in
its planet color with the ♂ glyph. Force vectors radiate from it as thin precise arrows,
length = normalized magnitude (longest force = full length, everything else to scale,
nothing shorter than 12% so all forces stay visible):
- ASPECT VECTORS point at the TRUE BEARING of the partner body along the ecliptic.
  Color by polarity (harmony teal / tension ember / neutral gray for minors). Label at
  the tip: aspect glyph + partner in mono-caps ("△ VENUS", "□ SATURN", "⚹ MOON").
  APPLYING aspects get a SOLID FILLED arrowhead pointing IN at the planet plus a
  countdown micro-label "applying · 2.3d to exact"; SEPARATING aspects get an OPEN
  OUTLINED arrowhead angled away from the planet with "separating · 5.1d". Draw three
  aspects on this card: △ VENUS (teal, long, applying · 2.3d), □ SATURN (ember, medium,
  separating · 5.1d), ⚹ MOON (teal, short, applying · 0.8d).
- SIGN PULL: one element-colored vector along the sign's element axis — Capricorn →
  Earth, so it points LEFT (Earth ← 180°) in Earth green #34D399, labeled "CAPRICORN →
  EARTH · 0.60".
- SECT PULL: a slightly shorter vector along the sect element axis, labeled "SECT →
  FIRE · 0.40", Fire red #F87171 pointing UP (Fire ↑ 90°).
- DIGNITY: a short boost vector ALONG the sign-element axis (teal-tinted, labeled
  "EXALTED +30%"); if the planet were debilitated it would point AGAINST that axis in
  ember. Peregrine planets get no dignity vector.
- MOMENTUM: a vector at 0° (right, direct motion) labeled "MOMENTUM", muted violet tint;
  retrograde planets flip it to 180° and label it "℞ MOMENTUM".
- ESMS RESULTANT (the headline): one heavier arrow in the 135° copper→violet signature
  gradient, at its ESMS-rose angle, with the dominant ESMS alchemical symbol at its tip
  in a tiny circle (🜀 Spirit / 🜁 Essence / 🜃 Matter / 🜄 Substance — use 🜁 here) and a
  mono-caps label "TENDENCY → ESSENCE".

CORNER MICRO COMPASS ROSES (both always present, ~34px):
- bottom-left: the ELEMENT rose — four tiny spokes labeled with element dots, Fire up /
  Air right / Water down / Earth left, in the four element colors.
- bottom-right: the ESMS rose — four tiny spokes labeled 🜀 up / 🜁 right / 🜃 down /
  🜄 left, rendered in muted copper.

TELEMETRY FOOTER: a slim hairline-topped strip of mono-caps readouts in two rows.
Row 1 — the ESMS quartet: "🜀 0.42 · 🜁 0.88 · 🜃 0.31 · 🜄 0.19". Row 2 — physics:
"Q 0.50 · p 0.38 · ω 31.2′/DAY · m 0.61 · HARMONY +1.4" (charge, momentum, speed in
arc-minutes/day, alchemical weight, net harmony; harmony is signed — tint + teal,
− ember).

HOVER TOOLTIP INSET: the same card with the □ SATURN vector hovered — vector and label
at full opacity, siblings dimmed to ~40%, and a small dark tooltip: "SQUARE · ORB 2°14′
· STRENGTH 72% × WEIGHT 0.88 · SEPARATING · 5.1D SINCE EXACT" plus a second muted line
"ESMS Δ 🜀 −0.04 · 🜃 +0.09". Raw numbers live HERE, not on the resting card.

MOBILE NOTES (390px): the card runs full-width; labels may drop to glyph-only at the
vector tips with the full text moving into the tap-tooltip; both compass roses stay; the
footer wraps to a 2×2 chip grid. Tap = the hover state.

Do NOT include: animation cues, motion blur, orbit rings around the node, radial gauge
chrome, invented forces, glow-heavy neon strokes, or numbers without their engine
sources.
```

---

## SCREEN 3 — Natal Cartography (birth-chart page, desktop 1440px)

```
[PREPEND GLOBAL STYLE BLOCK]

SCREEN: "Natal Cartography" — the birth-chart page upgraded with vector overlays on the
wheel and a natal FBD card row, desktop 1440px. State: a signed-in user's stored natal
chart (which carries NO planetary speeds — this screen demonstrates the honest static
degrade).

TOP: keep the page's existing header idiom — serif title "Your Birth Chart" + a
mono-caps subline "NATAL · 14 MAR 1991 · 08:42 · BROOKLYN NY". Beside it, one honest
status chip in a hairline pill: "STATIC CHART · MOTION UNAVAILABLE" (muted gray, no
alarm styling — this is a fact, not an error).

NATAL WHEEL (center, upgraded): the existing natal/transit wheel, now with two new
overlay families —
1. ASPECT CHORDS: straight chords connecting aspecting natal planets across the wheel's
   interior, harmony teal #2DD4BF for conjunction/trine/sextile, tension ember #FB923C
   for opposition/square, neutral #B5ADCC hairlines for minors; chord WIDTH proportional
   to aspect strength (exact aspects visibly heavier). Chords sit under the planet
   glyphs, ~60% opacity so the wheel stays readable.
2. ELEMENT SIGN-VECTORS: at each natal planet, a short RADIAL vector pointing outward
   from the wheel center through the planet, colored by the planet's SIGN element (Fire
   #F87171 / Earth #34D399 / Air #C084FC / Water #60A5FA), length modest and uniform —
   these mark each planet's elemental pull, they do not compete with the chords.
A small legend chip row under the wheel: "— HARMONY · — TENSION · — MINOR · ↑ SIGN
ELEMENT" in mono-caps with the matching stroke samples.

NATAL FBD CARD ROW (below the wheel): mono-caps section label "NATAL FREE-BODY DIAGRAMS
· STATIC CHART". A horizontally scrolling row of the ten FBD cards (compact ~264px
variant from the card-anatomy spec), Sun→Pluto, with the natal degrade applied to EVERY
card: a small "STATIC CHART · MOTION UNAVAILABLE" chip in the header area, NO momentum
vector, NO applying/separating arrowhead verdicts on aspect vectors (aspect arrows keep
their bearing/length/color but end in plain neutral arrowheads, and their micro-labels
read only "orb 3°05′ · strength 64%" — no countdowns), and the footer physics row drops
p and ω, showing "Q 0.50 · m 0.61 · HARMONY +0.9" only. Everything else — sign pull,
sect pull, dignity, ESMS resultant, both compass roses, ESMS quartet — remains, because
none of it needs motion. Show a subtle horizontal-scroll affordance (edge fade + "10
BODIES →" mono hint).

MOBILE NOTES (390px): wheel full-width with the legend row wrapping to two lines; the
card row stays a horizontal swipe rail with snap points, one card ~85% viewport width;
the static-chart status chip moves directly under the page title.

Do NOT include: fake motion on natal cards (no countdowns, no applying/separating
anywhere on this screen), transit-vs-natal confusion (this screen is natal-only ink),
premium locks, animation cues.
```

---

## CONDENSED ONE-SHOT PROMPT  *(single paragraph, for Stitch quick mode)*

Use this when you want one block instead of the per-screen set (attach the structured
prompt above as extra context for finer detail).

```
Design a "Planetary Free-Body Diagram" card for a refined dark-theme culinary-astrology
app — a physics-style force diagram for one planet, drawn like a precise observatory
instrument, NOT a sci-fi HUD. Palette: backgrounds #07060B→#241F33, text #F2EDFF/#B5ADCC/
#6E6884, violet #B85AF0, copper #DEA54B, element colors Fire #F87171 Earth #34D399 Air
#C084FC Water #60A5FA, harmony teal #2DD4BF, tension ember #FB923C, and a 135°
copper→violet gradient reserved for the resultant vector. Glass card (white 4–8% fill,
1px hairline border, soft blur, 14–16px radius), serif headings (Cormorant Garamond),
Manrope body, and UPPERCASE wide-tracked JetBrains Mono for every number and micro-label.
Card for MARS: header row with the ♂ glyph in an ember-tinted orb, "Mars" in serif, a
mono readout "♑ 18°42′", and a teal dignity chip "EXALTED ×1.30". The diagram zone is
backed by a gently curved zoomed zodiac-arc band centered on 18°42′ with a fine
arc-minute ruler (15′ major ticks with tiny mono labels, 5′ fine ticks) and a huge
low-opacity ♑ watermark; increasing longitude points right. From a central ember planet
node, thin precise force vectors radiate to scale: three aspect vectors at true bearings
— "△ VENUS" (teal, solid filled arrowhead pointing in at the planet, micro-label
"applying · 2.3d to exact"), "□ SATURN" (ember, open outlined arrowhead angled away,
"separating · 5.1d"), "⚹ MOON" (teal, short, applying) — plus an Earth-green sign-pull
vector left labeled "CAPRICORN → EARTH · 0.60", a Fire-red sect vector up "SECT → FIRE ·
0.40", a short teal dignity boost "EXALTED +30%", a muted momentum vector right, and one
heavier copper→violet gradient RESULTANT arrow tipped with the alchemical symbol 🜁 and
labeled "TENDENCY → ESSENCE". Two 34px micro compass roses in the bottom corners:
elements (Fire↑ Air→ Water↓ Earth←) bottom-left in element colors, ESMS (🜀↑ 🜁→ 🜃↓ 🜄←)
bottom-right in muted copper. Slim mono telemetry footer: "🜀 0.42 · 🜁 0.88 · 🜃 0.31 ·
🜄 0.19" over "Q 0.50 · p 0.38 · ω 31.2′/DAY · m 0.61 · HARMONY +1.4". Include a hover
inset: one vector highlighted, siblings dimmed, dark tooltip with the raw numbers
("SQUARE · ORB 2°14′ · STRENGTH 72% × WEIGHT 0.88 · SEPARATING · 5.1D SINCE EXACT").
Static ink only — no animation, no gauges, no neon glow, no invented metrics.
```

**Retarget trick:** keep everything through the typography sentence, then swap the layout
description to aim the one-shot at a page composition instead (the /planetary-chart
telemetry strip + wheel + 2×5 card grid, or the natal wheel with teal/ember aspect chords,
radial sign-vectors, and the static-chart card row).

---

## After Stitch generates — wiring notes (for the follow-up implementation)

When the Stitch output comes back, we wire it into the codebase against these anchors:

- **Data contract (already written):** `src/calculations/planetaryFBD.ts` —
  `buildFreeBodyDiagrams({ positions, perPlanet })` → `PlanetFBD[]`. Every visual element
  maps 1:1: `vectors[]` (kind aspect/sign/sect/dignity/momentum, `angleDeg` in card space,
  `normalized` display length with the 0.12 floor, `detail` = the tooltip string),
  `resultant` (ESMS angle/magnitude/dominant + `elementalPush` + `netHarmony`), `physics`
  (charge/momentum/speed/arcminutesPerDay/alchmWeight), `dignity`, `kinematicsAvailable`,
  and `normalizationScale` (the raw magnitude that renders at full length). The card is a
  pure renderer of this shape — no design-side math.
- **Card component (new):** `src/components/ui/alchm/PlanetFBDCard.tsx` — SVG mapping from
  card space is `x = cos(θ), y = −sin(θ)`. Applying/separating arrowhead treatment keys off
  `vector.aspect.kinematics.state`; natal cards arrive with `kinematics: null` per aspect
  and `kinematicsAvailable: false` per card → render the STATIC CHART chip and plain
  arrowheads. Tooltip content comes verbatim from `vector.detail` + `aspect.esmsDelta`.
- **Planet colors/glyphs:** `src/components/ui/alchm/planetColors.ts` — `planetColor()` /
  `planetGlyph()` are canonical; the hexes in the style block are mock-only approximations
  of its oklch tokens. Do not add a fourth planet-color convention.
- **ESMS glyphs:** reuse the `ThermoQuartet` convention — 🜀 Spirit, 🜁 Essence, 🜃 Matter,
  🜄 Substance.
- **Current-sky page:** `src/app/(alchm)/planetary-chart/page.tsx` — REMOVE the
  `PremiumGate` wrapper (`advancedPlanetaryCharts`), keep the existing `PlanetaryChart`
  wheel + `useChartData`, add the telemetry strip (HEAT/ENTROPY/REACTIVITY/GREGS ENERGY/
  KALCHM/MONICA from the alchemical result) and the 2×5 FBD grid. Positions from
  `useChartData` carry `longitudeSpeed` → full kinematics. Server-computed per load; the
  existing 60s auto-refresh may stay code-side but the design shows a computed-at stamp,
  never live chrome.
- **Natal wheel overlays:** `src/components/dashboard/NatalTransitChart.tsx` — add the
  aspect-chord layer (polarity color, width ∝ strength, from
  `buildAspectsFromChartPlanets`/`calculateComprehensiveAspects`) and the radial
  sign-element vector layer at each natal planet.
- **Natal page:** `src/app/(alchm)/birth-chart/page.tsx` — mount the horizontal natal FBD
  card row fed by the stored chart (no speeds → honest degrade path). Per-planet ESMS
  contributions come from `alchemizeDetailed().perPlanet` (`FBDPerPlanetContribution` is
  its structural mirror; `planetaryFBD.ts` deliberately never imports the fs-bound
  service — compute server-side and pass the plain object down).
- **Kinematics:** `src/utils/aspectKinematics.ts` — `computeAspectKinematics` is shared
  with `/api/alchm-quantities/aspects`; countdown copy = `applying · {daysToExact}d to
  exact` / `separating · {d}d since exact`; `stationary` (|orb velocity| < 1e-4) gets
  neither arrowhead verdict.
- **Dignity:** `src/calculations/planetaryDignity.ts` — chip label from `dignityLabel`
  (exalted domicile → debilitated), multiplier from `dignityMultiplier` (±15%/level,
  floor ×0.5); score 0 = PEREGRINE chip, no vector.
- **Verify bar:** typecheck + zero-warning eslint; `/planetary-chart` renders logged-out
  (gate gone); natal cards show no countdowns/momentum; hover tooltips show raw engine
  numbers matching `vector.detail`.
