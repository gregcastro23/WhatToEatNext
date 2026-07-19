# The Living Hero — Stitch Design Prompt

Ready-to-paste prompts for **Google Stitch** to design the new consolidated homepage hero:
one top-of-page surface that merges **HomeHero + BirthdayStrip + KitchenDex** into a single
component that teaches the whole site without scrolling. Built from the 2026-07-18 direction
(retire the pokédex framing, keep the interaction quality) plus a full audit of the current
components, copy, and design system.

**Division of labor:** Stitch owns the *visual design* of every screen below. Code-side we
keep the pure-CSS transition architecture, wire the multi-birthday composite palate, and tap
the live endpoints — see **Wiring notes** at the end. Do not let Stitch invent data we can't
serve.

**How to use:** Paste the **Global Style Block** first, then paste each **Screen prompt** as
its own generation (Stitch generates one screen per prompt; keep the style block at the top
of each so every screen stays on-brand). Generate **Screen 1 (mobile)** and **Screen 2
(desktop)** first — they are the layout benchmarks; everything else is a state of them.

---

## Design decisions locked in

| # | Decision | Choice |
|---|----------|--------|
| Concept | Framing | **Product, not game.** The Kitchen Déx / field-guide / specimen costume is retired. No mystery mechanics: every capability visible from the first paint |
| Role | Placement | This IS the hero — **the top component of the homepage**, replacing HomeHero + BirthdayStrip + KitchenDex. The real recommenders remain below; the hero previews and deep-links, never embeds |
| Viewport | The bar | **Whole hero fits one viewport at 1280×800 desktop.** Compact stacked layout at 390px mobile |
| Copy | Product voice | Keep "Know what to eat next." + intro + both CTAs (**Build tonight's recipe →** /recipe-builder, **Set up my chart** /onboarding). The 01/02/03 Personalized·Practical·Pantry-aware trio folds into the preview tiles — no separate row |
| Grid | Site preview | **8 capability tiles**, all legible immediately: Living Sky, Cuisines, Ingredients, Sauces & Methods, Recipe Builder, Lab, Menu Planner, Restaurants. Tap → in-place preview card with "what you can do" + one deep link |
| Stage | Preview interaction | Tapping a tile swaps the grid **in place** for a single wide preview card (the existing stage/flip pattern) — **never a popup or modal** |
| People | Personalization | **"Who's eating tonight?"** — add one or SEVERAL birthdays as chips (optional names), deriving a **composite elemental palate** for the table. Signed-in users: their chart is automatically the first member |
| Quiz | Meal crafting | The four-tap quiz stays, renamed **"Craft tonight's meal"** — de-branded (no №000 / PRESS START / arcade chrome), biased by the composite palate |
| Live data | Honesty | Live micro-teasers ONLY on Living Sky, Cuisines, and Featured-recipe surfaces (cheap public endpoints exist). Every live readout has a designed **static fallback state**. Never label anything "live" that isn't |
| Doctrine | Never | **No timed popups or interruptions. No wallet / token / ESMS-economy copy anywhere.** Account value pitched inline only: guest birthday free → "Full-chart precision →" → sign in to save |
| Theme | Aesthetic | Same dark "Modern Alchemist" theme as the site — glass panels, violet/copper accents, serif display type. Drop the CRT scanlines, hard offset pixel-shadows, and arcade press-physics; keep tactile hover feedback, product-calm |

### Hard constraints the design MUST respect
- **One viewport.** At 1280×800 the entire hero — masthead copy, CTAs, personalization
  strip, 8-tile grid, quiz entry — is visible with zero scrolling. Budget ruthlessly;
  the headline may shrink from the current 76px.
- **8 tiles, fixed inventory, all visible.** No silhouettes, no "???", no counters, no
  locked/undiscovered states, no completion reward.
- **The stage replaces the grid in place** (same footprint). Back-to-grid affordance always
  visible on the stage.
- **Elements ≠ ESMS.** Fire/Water/Earth/Air (from signs) and Spirit/Essence/Matter/Substance
  (from planets) are two different four-part readings and must never be presented as the
  same thing. Tiles and quiz results show the ELEMENTAL bars; only the Living Sky preview
  may show ESMS quantities, labeled as its own reading.
- **Birthday chips give an elemental bias only** — copy may say "tuned to your table," never
  claim full-chart precision for date-only guests. Full precision is the upgrade pitch.
- Element bars always sum to 100 and use the four element accent colors.
- No lorem ipsum — use the real copy strings given in each screen prompt.

---

## GLOBAL STYLE BLOCK  *(prepend to every screen prompt)*

```
STYLE: The homepage hero of a refined culinary-astrology app, DARK theme only (never
white/light surfaces). Premium, calm, product-first — a live "front door" that previews the
whole site, NOT a game, NOT a dashboard, NOT a sci-fi console. Clear hierarchy, generous
but efficient spacing (the whole hero must fit one viewport), one primary action per area.

COLOR PALETTE (dark, use these exact hex):
- Backgrounds (darkest→lightest surfaces): #07060B, #0E0C16, #15121F, #1C1829, #241F33
- Text: #F2EDFF (primary), #B5ADCC (secondary), #6E6884 (muted)
- Primary accent (violet): #B85AF0 — CTAs, focus, personalization
- Secondary accent (copper-gold): #DEA54B — eyebrows/tags, secondary highlights
- Element accents (bars, dots, chips only): Fire #F87171, Earth #34D399, Air #C084FC,
  Water #60A5FA. Quiz/crafting accent: gold #FBBF24 (reserved for the quiz only).
- Signature gradient: 135° copper→violet (#DEA54B → #B85AF0), sparing, hero glow only.

SURFACES: Translucent "glass" cards — white 3–8% fill, 1px hairline border
(rgba(255,255,255,0.14)), soft backdrop blur, 12–16px radius. The hero container itself
gets faint radial violet/copper glows in its corners and a thin decorative orbit ring
motif. Soft ambient shadows only — NO hard offset "pixel" shadows, NO CRT scanlines,
NO retro-arcade chrome.

TYPOGRAPHY:
- Display/headline: elegant serif (Cormorant Garamond), medium weight, tight tracking.
- Body: clean humanist sans (Manrope).
- All small labels, tags, numbers, readouts: monospace (JetBrains Mono), UPPERCASE,
  wide letter-spacing (~0.14em), tabular figures — the mono-caps micro-label brand
  signature.

ICONOGRAPHY: One emoji glyph per capability tile (🪐 🍜 🌿 🔥 🍳 ⚗️ 📅 🧭) in a small
tinted rounded box; zodiac glyphs (♈–♓) as plain text in person chips; small elemental
dots/bars. Minimal line icons elsewhere. No occult ornament, no fake telemetry, no gauges.

MOOD: Confident, warm, a little wondrous — "the sky is cooking with you tonight."
Never gimmicky, never gamified.
```

---

## SCREEN 1 — Mobile hero, guest default (390px)

```
[PREPEND GLOBAL STYLE BLOCK]

SCREEN: Homepage hero, mobile 390px wide, first-time guest (no birthdays saved, signed
out). This is the entire top of the homepage — design it as one continuous component,
compact and stacked. Show the default state.

MASTHEAD (top): mono-caps copper eyebrow "YOUR KITCHEN · THE LIVE SKY". Serif headline
"Know what to eat next." (large but mobile-scaled, ~40px). One-line intro in secondary
text: "Turn your birth chart, pantry, and the current sky into clear culinary
recommendations you can actually cook tonight." Two buttons side by side: primary solid
violet "Build tonight's recipe →", secondary glass "Set up my chart".

WHO'S EATING TONIGHT (personalization strip, directly under the CTAs): a slim glass card
with a violet-tinted ✦ glyph box, headline-weight lead "Who's eating tonight?" and helper
copy "Add a birthday — tonight's readings tune to your table. No account needed; it stays
on this device." A date input + small optional "Name" input + solid violet "Add →" button.
Quiet mono link below: "or sign in to save".

PREVIEW GRID: mono-caps label "THE WHOLE KITCHEN · TAP TO PREVIEW". A 2-column × 4-row
grid of compact glass tiles (~64px tall each), every tile fully visible and labeled — no
mystery states. Each tile: emoji glyph in a small tinted box, name, and a one-line muted
teaser. Use these exact eight:
1. 🪐 Living Sky — "It changes every hour."  (subtle violet tint, tiny "LIVE" mono chip
   with a soft pulsing dot)
2. 🍜 Cuisines — "Tonight has a flavor."  (red tint, mono micro-teaser "TONIGHT: ITALIAN ↑")
3. 🌿 Ingredients — "1,000+ readings, dawn-harvested."  (green tint)
4. 🔥 Sauces & Methods — "Technique is transformation."  (orange tint)
5. 🍳 Recipe Builder — "Dinner, assembled to order."  (amber tint)
6. ⚗️ The Lab — "Paste a recipe, get its signature."  (blue tint)
7. 📅 Menu Planner — "Seven skies, one plan."  (indigo tint)
8. 🧭 Restaurants — "Matches beyond your kitchen."  (cyan tint)

QUIZ BAR (bottom of hero): a full-width gold-tinted glass bar: "Craft tonight's meal —
four taps, one dish." with a gold "Start →" button. Calm, product-styled — no arcade
chrome, no "PRESS START".

Below the quiz bar, hint the top edge of the next page section (a section header "CUISINE
· LIVE RECOMMENDATION") to show the hero ends and the real recommenders begin.

Do NOT include: any "catalogued n/8" counter, silhouetted tiles, "???" labels, specimen/
field-guide language, wallet or token copy, popups or overlays.
```

---

## SCREEN 2 — Desktop hero, table of 3 (1280×800) — THE BENCHMARK

```
[PREPEND GLOBAL STYLE BLOCK]

SCREEN: Homepage hero, desktop 1280×800. HARD CONSTRAINT: the ENTIRE hero fits inside
this one viewport with no scrolling — this screen is the layout benchmark. State: guest
with THREE saved birthdays (a "table of 3").

LAYOUT: one hero container (glass, 20px radius, faint corner glows, thin decorative
orbit-ring motif top-right) organized as a top band + a grid zone.

TOP BAND (two columns):
- LEFT (~55%): mono-caps copper eyebrow "YOUR KITCHEN · THE LIVE SKY"; serif headline
  "Know what to eat next." (~52px — smaller than a classic hero so everything fits);
  one-line intro "Turn your birth chart, pantry, and the current sky into clear culinary
  recommendations you can actually cook tonight."; primary violet button "Build tonight's
  recipe →" + secondary glass button "Set up my chart".
- RIGHT (~45%): the "Who's eating tonight?" card. Header row: mono-caps label "WHO'S
  EATING TONIGHT?" with a quiet "+ Add" chip. Person chips in a row: "♌ Maya", "♓ Sam",
  "♈ You" — each a small glass pill with the zodiac glyph in a violet-tinted box and an
  × remove affordance on hover. Below the chips, the COMPOSITE readout: mono-caps line
  "TABLE OF 3 · FIRE-LEANING" plus a slim horizontal stacked element bar (Fire 50% red,
  Water 30% blue, Earth 10% green, Air 10% purple) with tiny mono percentage labels.
  Under it, one honest helper line: "Readings below tune to this table. It stays on this
  device." and a quiet mono link "Full-chart precision →".

GRID ZONE (fills the remaining height): mono-caps label "THE WHOLE KITCHEN · TAP ANY
TILE TO PREVIEW". A 4-column × 2-row grid of glass tiles (~140px tall). Same eight tiles
and teasers as the mobile screen. Tiles are product-styled: glyph box top-left, name in
15px semibold, teaser in muted 11px, per-tile accent as a subtle border/background tint (NOT
neon). The Living Sky tile additionally shows a live micro-readout: four tiny element
bars + mono chip "LIVE · MARS HOUR ♂". The Cuisines tile shows mono micro-teaser
"TONIGHT: ITALIAN ↑". The Recipe Builder tile shows a small featured-dish thumbnail
labeled "FEATURED · CHORIZO BOLOGNESE". Hover state on one tile (show it on Cuisines):
gentle lift + brighter accent border — soft, no pixel shadows.

Also design a small annotation inset below the main frame: the three live tiles (Living
Sky, Cuisines, Recipe Builder) in their honest STATIC FALLBACK states for when a fetch
fails — Living Sky drops the bars and "LIVE" chip for its plain teaser "It changes every
hour."; Cuisines drops "TONIGHT: ITALIAN ↑" for its plain teaser; Recipe Builder drops
the thumbnail for its plain teaser. No pulsing dots and no "LIVE" labels anywhere in the
fallback variants.

QUIZ BAR (bottom edge of the hero container, full width, slim): gold-tinted glass bar
reading "Craft tonight's meal — four taps, one dish · tuned to your table of 3 ♌♓♈"
with a gold "Start →" button on the right.

Do NOT include: a separate 01/02/03 benefits row (the tiles carry that job), any
scrolling, counters, mystery/undiscovered states, specimen or field-guide wording,
wallet/token copy, modals.
```

---

## SCREEN 3 — Desktop stage: tile preview open (1280×800)

```
[PREPEND GLOBAL STYLE BLOCK]

SCREEN: Same desktop hero as the benchmark screen, but the user has tapped the Cuisines
tile: the 4×2 grid has been REPLACED IN PLACE by one wide preview card (the "stage")
occupying the exact same footprint. The top band (headline, CTAs, Who's-eating card) and
the bottom quiz bar are unchanged and still visible — the hero still fits 1280×800.

STAGE CARD (glass, red-tinted 1px accent border, soft glow): 
- Header row: 🍜 glyph in a red-tinted box, mono-caps kicker "PREVIEW · CUISINES", title
  "Cuisine Matching" in serif 24px, and a "← All previews" ghost button on the right.
- Body (two columns):
  - LEFT: flavor paragraph "Cuisines behave like weather systems — each carries its own
    elemental signature. Sichuan burns Fire-heavy; Japanese runs cool and precise. Match
    a cuisine's signature against tonight's sky and dinner stops being a guess." Below
    it, an example signature block: mono-caps label "SIGNATURE · SICHUAN" with four
    horizontal element bars (Fire 62 / Earth 16 / Water 12 / Air 10) in the element
    colors, mono percentage labels.
  - RIGHT: mono-caps label "WHAT YOU CAN DO" over three short rows, each with a small
    line-icon bullet: "Get tonight's cuisines ranked against the current sky" / "Open any
    cuisine to find nearby restaurants that serve it" / "Browse the full atlas, signature
    by signature". Under the rows, a LIVE teaser chip: "TONIGHT: ITALIAN ↑ · LIVE" with
    a soft pulsing dot.
- Footer row: primary violet button "Browse the cuisine atlas →" and a muted mono note
  "The real recommender runs live further down this page."

Also design the same stage card in its honest FALLBACK state as a small inset variant:
identical layout but the live teaser chip is replaced by static mono text "RANKED
AGAINST TONIGHT'S SKY" with no pulsing dot and no cuisine name (used when the live fetch
fails — the design must not fake liveness).

Do NOT include: modal/popup treatment, dimmed backdrop, specimen/entry-number chrome,
card-flip skeuomorphism visible in the static design (the flip is a code-side transition).
```

---

## SCREEN 4 — Mobile quiz, question state (390px)

```
[PREPEND GLOBAL STYLE BLOCK]

SCREEN: Mobile 390px. The user tapped "Craft tonight's meal": the preview grid area has
been replaced in place by the quiz card (the masthead above is condensed to just the
eyebrow + a compact headline so the quiz gets room; the personalization strip is hidden
during the quiz). Show question 2 of 4.

QUIZ CARD (glass, gold-tinted accent border, calm — no arcade styling):
- Header: mono-caps gold kicker "CRAFT TONIGHT'S MEAL · QUESTION 2 OF 4", four slim
  progress segments (two filled gold), and a quiet "✕ Cancel" ghost button.
- Question in serif 24px: "Pick tonight's heat"
- Four full-width answer buttons stacked, each a glass row with a title + muted subline
  and a small element-colored dot on the right:
  1. "Open flame & char" — "Sear it, blister it"  (Fire dot, red)
  2. "Low & slow" — "Braise, roast, caramelise"  (Earth dot, green)
  3. "Barely any — keep it crisp" — "Raw, chilled, snappy"  (Air dot, purple)
  4. "Steam & simmer" — "Gentle heat, deep broth"  (Water dot, blue)
- Footer: one honest mono-caps micro-label "TUNED TO YOUR TABLE OF 3 · ♌♓♈" (omit
  entirely when no birthdays are saved — never fake it).

Buttons have a gentle pressed/hover state (slight tint fill) — soft product feedback,
no hard-shadow button-press physics.
```

---

## SCREEN 5 — Desktop quiz result card (1280×800)

```
[PREPEND GLOBAL STYLE BLOCK]

SCREEN: Desktop 1280×800. The quiz just finished: the grid zone shows the RESULT card in
place (top band and hero container unchanged, still one viewport). Table of 3 saved.

RESULT CARD (glass, gold accent):
- Kicker row: mono-caps gold "TONIGHT'S CRAFT" + "⟲ Recraft" and "← All previews" ghost
  buttons right-aligned.
- Hero row: large 🍝 emoji in a gold-tinted rounded box, dish name in serif 30px "Chorizo
  bolognese rigatoni", mono-caps chips "ITALIAN · SLOW SAUTÉ".
- Blurb (secondary text): "The house classic — paprika smoke folded into a patient, rich
  ragù."
- READING BLOCK: mono-caps label "YOUR READING — COMFORT · LOW & SLOW · UMAMI · A SLOW
  CRAFT · TABLE OF 3 ♌♓♈" (one chip per quiz answer) over four horizontal element bars
  summing to 100 (Earth 38 / Fire 27 / Water 21 / Air 14) in the element colors with
  mono percentages.
- Honest upgrade line (muted, inline — not a banner): "Tuned to your table's sun signs.
  Want the full picture? Set up your chart → or sign in to save readings."
- Action row: primary violet "See Italian recipes →", secondary glass "Build it my way",
  both left-aligned.
- FOOTPRINT: the card fills the grid zone exactly — same footprint, no growth. Use a
  two-column layout (dish identity + blurb + actions left; reading block + upgrade line
  right) so nothing pushes the quiz bar below 800px.

Do NOT include: confetti/celebration effects, "№000 / FIRST READING" numbering, save-to-
wallet or token language, any popup framing.
```

---

## SCREEN 6 — Desktop hero, signed-in variant (1280×800)

```
[PREPEND GLOBAL STYLE BLOCK]

SCREEN: Same desktop benchmark layout, but the user is SIGNED IN with a completed natal
chart. Still one viewport, still the full hero — signed-in users keep the whole
experience; only the personalization card changes.

DIFFERENCES FROM THE BENCHMARK SCREEN:
- WHO'S EATING TONIGHT card: the first chip is the user's own chart, visually distinct —
  a violet-filled pill "◉ Your chart · ♒" with a tiny mono "FULL CHART" tag. Additional
  guest chips ("♎ Maya") follow in the standard glass style, plus the "+ Add" chip.
  Composite line reads "TABLE OF 2 · AIR-LEANING" (Air 55 / Water 18 / Fire 15 /
  Earth 12) with the stacked element bar. Helper
  line: "Your chart anchors the table. Guests join by birthday." No sign-in link (already
  signed in); keep "Full-chart precision →" only if guest chips are present, pointing at
  per-person setup.
- SECONDARY CTA in the masthead becomes "Open my chart" instead of "Set up my chart".
- QUIZ BAR reads "Craft tonight's meal — four taps, one dish · tuned to your table of 2
  ◉♎".
- Everything else (tiles, teasers, live chips) identical to the benchmark.
```

---

## SCREEN 7 — "Who's eating tonight?" component sheet (states)

```
[PREPEND GLOBAL STYLE BLOCK]

COMPONENT SHEET: the "Who's eating tonight?" personalization card alone, three states
side by side on a dark canvas (desktop card width ~520px). This module lives inside the
hero; design it as a self-contained glass card.

STATE A — EMPTY (no people): ✦ glyph in a violet-tinted box, lead "Who's eating
tonight?", helper "Add a birthday — tonight's readings tune to your table. No account
needed; it stays on this device." Date input (dark field, violet focus ring), small
optional "Name" text input, solid violet "Add →" button. Quiet mono link "or sign in to
save".

STATE B — ADDING A SECOND PERSON: one chip already present ("♌ Maya", glass pill, zodiac
glyph in tinted box, × on hover) + the inline add-row (date + name + "Add →") still open,
plus a mono-caps single-person readout "LEO PALATE · BOLD HEAT, CHAR & SPICE".

STATE C — TABLE OF 3 (settled): chips "♌ Maya" "♓ Sam" "♈ You" + a "+ Add" ghost chip.
Composite readout: mono-caps "TABLE OF 3 · FIRE-LEANING" over one slim stacked bar
(Fire 50 red / Water 30 blue / Earth 10 green / Air 10 purple) with mono percentages.
Helper line "Readings below tune to this table. It stays on this device." + quiet mono
link "Full-chart precision →" + a subtle "Clear table" ghost action.

The stacked composite bar is the signature element of this module — make it beautiful
and legible at 8px height. Do NOT design a modal date-picker takeover; inputs are inline.
```

---

## CONDENSED ONE-SHOT PROMPT  *(for Stitch quick mode)*

```
Design the homepage hero of a refined dark-theme culinary-astrology app (1280×800, the
ENTIRE hero fits one viewport, no scrolling). Dark glass aesthetic: backgrounds #07060B
to #241F33, text #F2EDFF/#B5ADCC/#6E6884, violet accent #B85AF0, copper #DEA54B, serif
headlines (Cormorant Garamond), Manrope body, JetBrains Mono uppercase micro-labels;
element colors Fire #F87171 Earth #34D399 Air #C084FC Water #60A5FA; gold #FBBF24 for
the quiz only. Layout: top band with (left) copper mono eyebrow "YOUR KITCHEN · THE LIVE
SKY", serif headline "Know what to eat next.", one-line intro, violet button "Build
tonight's recipe →" + glass button "Set up my chart"; (right) a "Who's eating tonight?"
card with zodiac person chips (♌ Maya, ♓ Sam, ♈ You), a stacked 4-element composite bar
labeled "TABLE OF 3 · FIRE-LEANING" (Fire 50 / Water 30 / Earth 10 / Air 10), helper "It stays on this device." and link
"Full-chart precision →". Below: a 4×2 grid of glass capability tiles, all visible —
🪐 Living Sky (live element bars + "LIVE · MARS HOUR ♂" chip), 🍜 Cuisines ("TONIGHT:
ITALIAN ↑"), 🌿 Ingredients, 🔥 Sauces & Methods, 🍳 Recipe Builder (featured-dish
thumb), ⚗️ The Lab, 📅 Menu Planner, 🧭 Restaurants — each with an emoji glyph box, name,
one-line teaser, subtle per-tile tint. Bottom: a slim gold bar "Craft tonight's meal —
four taps, one dish · tuned to your table of 3 ♌♓♈" with a gold "Start →". Calm,
premium, product-first — no gamification, no counters, no mystery states, no scanlines,
no hard pixel shadows, no wallet/token copy, no modals.
```

**Retarget trick:** keep the style sentences, swap the layout paragraph for any single
screen above (stage preview, quiz question, result card, component sheet).

---

## After Stitch generates — wiring notes (code side, keep out of prompts)

Implementation anchors so the design lands on the real seams. Full backend map lives in
`NEXT_SESSION_PROMPT_HOME_EXPERIENCE.md` (repo root) — this is the design-relevant subset.

- **Consolidation:** the new component replaces the inline `HomeHero` in
  `src/app/(alchm)/page.tsx` (~:130-176 + its `<style>` block), the `BirthdayStrip` mount
  (~:381), and the `KitchenDex` mount (~:386). One surface; delete the standalone Déx
  section. Signed-in users get the full hero (Screen 6), not the old slim bar.
- **Transitions are pure CSS by mandate.** The grid→stage swap is a conditional render +
  CSS keyframes (the existing KitchenDex stage pattern). No framer-motion, nothing
  rAF-gated — the preview pane never fires rAF and `AnimatePresence mode="wait"`
  deadlocks. Canvas particles may return only as self-nooping garnish, toned way down.
- **Multi-birthday store:** evolve `src/utils/guestPalate.ts` to an array
  `[{ id, name?, birthday }]` under `alchm:guest:table:v1`, migrating the old single
  `alchm:guest:birthday` on first load; keep the `GUEST_PALATE_EVENT` window-event sync.
  Composite = client-side normalized mean of per-person softened one-hot element vectors
  (sun sign → element via `zodiacUtils`). Date-only guests can NEVER use the server
  composite (`calculateCompositeNatalChart` requires full birthData) — that's the
  "Full-chart precision" upgrade pitch, not a fake. Signed-in composite: the chart member
  contributes their real `natalChart.elementalBalance` vector while date-only guests
  contribute softened one-hot sun-sign vectors — that asymmetry is what lets a full chart
  outweigh a single sun sign (and what makes Screen 6's "AIR-LEANING" true).
- **Elements only, never ESMS:** birthday bias stays elemental; the deprecated
  `elementalToAlchemicalApproximation` must not be resurrected. The Living Sky preview may
  show ESMS quantities from `/api/alchm-quantities` as its own labeled reading, but the
  Living Sky TILE's four bars must come from an elemental-balance source — if the endpoint
  exposes only ESMS quantities, do NOT recolor them as elements; keep the planetary-hour
  chip and drop the tile bars instead.
- **Quiz:** `scoreFirstMeal` in `kitchenDexFirstMeal.ts` generalizes from single
  `signElement` (+2) to an elemental vector bias; the no-palate path stays bit-identical.
  Keep/migrate `alchm:kitchendex:firstmeal:v1`; retire `alchm:kitchendex:v1` (discovery
  state — mechanic deleted).
- **Live micro-teasers:** Living Sky ← `GET /api/alchm-quantities` (60s-poll precedent);
  Cuisines ← `GET /api/cuisines/recommend` (public, IP-limited 60/min — fetch ONCE, no
  polling); Featured thumb ← `GET /api/recipes/featured/hero-image`. Every live chip has
  the designed static fallback; degrade honestly on any fetch failure. Restaurants /
  Planner / Lab tiles stay static + deep link (their data needs location/auth).
- **Deep links per tile:** /quantities, /cuisines, /ingredients, /cooking-methods,
  /recipe-builder, /lab, /menu-planner, /restaurants. Quiz result links:
  `/recipes?cuisine={slug}` + /recipe-builder.
- **Verify bar:** typecheck + zero-warning eslint; one-viewport check at 1280×800 and
  390px in the browser preview; add 2–3 birthdays → composite chip updates → quiz footer
  re-tunes.

---

## Generation log

**2026-07-18 — Screen 2 (desktop benchmark) generated. APPROVED as the layout reference.**
Structure, copy, personalization card, quiz bar, and all doctrine constraints landed.
Build-side normalizations (do NOT re-generate for these — we build with our own tokens,
not Stitch's Tailwind config):

- Fonts: Stitch used EB Garamond → build with the site's Cormorant Garamond
  (next/font already loads it).
- Colors: Stitch invented a Material-3-style palette (primary #e6b4ff, tertiary
  #f9bd22) and tailwind 500-shade element bars → build with our exact tokens
  (#B85AF0 / #DEA54B / element 400-shades).
- Gold discipline: Stitch put gold/copper on the Living Sky LIVE chip and the
  Cuisines "TONIGHT: ITALIAN ↑" teaser → retint (gold is quiz-only; Living Sky is
  violet).
- Glyphs: Stitch swapped emoji for Material Symbols icons → keep the emoji set in
  build (no icon-font dependency; treat Stitch's icons as placeholders).
- Mock chrome: Stitch added a fixed top nav with an "Alchm" wordmark → ignore; the
  site header already exists. Build the hero component only.
- Living Sky tile shipped the planetary-hour chip WITHOUT element bars — acceptable
  final form per the ESMS-source caveat above.
- The fallback-states inset was not generated → don't spend a generation; fallback =
  plain-teaser tile variants (chip/thumbnail removed), trivial build-side.
- Featured thumb label missing the "FEATURED ·" prefix → add in build.

A CORRECTIONS block (exact fonts/hexes, emoji glyphs, violet Living Sky, no nav bar)
should be prepended to every subsequent screen generation. Remaining queue: Screen 1
(mobile benchmark) → Screen 3 (stage) → Screens 4–7.

**2026-07-18 — corrections round applied by Stitch; desktop benchmark FINAL.**
Verified in the corrected HTML: Cormorant Garamond, named tokens violet #B85AF0 /
copper #DEA54B / gold #FBBF24 used with correct discipline (violet LIVE chip, copper
eyebrow, gold quiz-only), exact element hexes on the composite bar, emoji glyphs in
tinted boxes on all 8 tiles, "FEATURED · CHORIZO BOLOGNESE", nav removed, one viewport
intact. Residual build-side nits (do NOT re-generate): violet CTA text should be
#110d18 not white; featured thumb placeholder → real /api/recipes/featured/hero-image;
Material Symbols arrows/+/× → plain text glyphs; Cuisines "TONIGHT:" teaser rendered
in copper — acceptable, or neutral muted in build.

**2026-07-18 — Screen 1 (mobile 390px) generated. APPROVED.** Masthead, personalization
empty state (exact helper copy, date+name inputs, "or sign in to save"), compact 64px
tiles with tinted emoji boxes, gold quiz bar correctly WITHOUT the "tuned to your table"
label (no birthdays saved), section hint present. Deviations accepted / build notes:
- Grid is 2-col with Recipe Builder and Restaurants as full-width rows (6 rows, not
  strict 2×4) — accepted; gives the featured tile hierarchy.
- Cuisines tile shows ONLY the live teaser ("TONIGHT: ITALIAN ↑") in place of its
  static teaser on mobile → fallback state = swap back to "Tonight has a flavor.";
  harmonize teaser color with desktop (copper or muted, not red).
- MOCK BUG: the "FEATURED · CHORIZO BOLOGNESE" label uses `hidden xs:block` with no
  `xs` breakpoint defined → never renders. Build: show it (second line) or drop it on
  mobile deliberately.
- Living Sky chip is just "LIVE" (no MARS HOUR) on mobile — accepted for space.
- Add button is icon-only arrow → build uses "Add →" text.
- Mobile page height ~884px (slight scroll) — acceptable; strict one-viewport is the
  desktop bar only.
Remaining queue: Screen 3 (stage) → Screens 4–7.

**2026-07-18 — Screen 3 (Cuisines stage) generated. STAGE CARD APPROVED; FRAME
DISCARDED.** The stage card matches spec (header row, verbatim flavor copy, Sichuan
signature with exact element 400-hexes and percentages, verbatim what-you-can-do
bullets, violet CTA + honest footer note, red accent, non-modal). But the generation
regressed everything around it — build composes the APPROVED BENCHMARK FRAME around
this card and ignores the mock's frame entirely:
- Masthead replaced with INVENTED off-doctrine copy ("Align Your Palate" / "what the
  cosmos demands tonight") and both CTAs dropped → NOT approved; benchmark masthead
  stands.
- Bottom gold quiz bar missing; an unrequested top progress line added → ignore.
- Fonts regressed to EB Garamond → Cormorant Garamond in build.
- Stitch's rationale CLAIMED a static-fallback variant that is absent from the HTML →
  fallback is build-side (chip → static "RANKED AGAINST TONIGHT'S SKY").
- LIVE chip violet vs benchmark copper teaser → harmonize in build.
Remaining queue: Screen 4 (quiz question, mobile) → 5 (result) → 6 (signed-in) → 7
(component sheet).

**2026-07-18 — Screen 4 (mobile quiz question) generated. APPROVED — cleanest pass.**
Condensed masthead kept exact copy (no invented headlines), kicker "CRAFT TONIGHT'S
MEAL · QUESTION 2 OF 4", four progress segments (2 filled), verbatim Q2 answers with
exact element-hex dots + glows, honest "TUNED TO YOUR TABLE OF 3 · ♌♓♈" footer.
Build notes: EB Garamond regression persists (build = Cormorant, standing rule);
Stitch's `.text-copper` class is actually #FBBF24 gold — correct on quiz surfaces but
leaks onto the masthead eyebrow, which must be true copper #DEA54B; an unrequested
cursor-follow gradient script (mousemove restyling) is DISCARDED in build per the
pure-CSS mandate. Remaining queue: 5 (result, desktop) → 6 (signed-in) → 7 (component
sheet).

**2026-07-18 — Screen 5 (desktop quiz result) generated. RESULT CARD APPROVED; FRAME
DISCARDED (same pattern as the stage screen).** Card is on-spec: verbatim kicker +
Recraft/All-previews ghosts, gold-boxed 🍝, exact dish/blurb, full four-chip reading
label, bars exactly Earth 38 / Fire 27 / Water 21 / Air 14 with correct hexes, honest
upgrade line verbatim, correct actions, gold discipline right, two-column footprint.
Frame drift discarded: invented intro + invented CTAs ("Start New Reading"/"View Saved
Charts"), missing eyebrow, missing bottom quiz bar, another unrequested top progress
line, and a DATA ERROR — composite bar rendered 3 elements (60/30/10, Air dropped);
canonical is four segments 50/30/10/10. Card build notes: ITALIAN/SLOW SAUTÉ chips
were element-tinted → neutral mono chips in build (a cuisine is not an element);
gradient CTA → solid violet. Open build decision: quiz-bar state while the result card
is open (suggest bar shows "⟲ Recraft · tonight: Chorizo bolognese"); design not
needed from Stitch.

**Queue consolidation:** Screens 6+7 merge into ONE component-sheet generation (four
states of the "Who's eating tonight?" card: empty / adding / table-of-3 / signed-in
chart-first). Rationale: Screen 6's only novel content is the personalization card —
frameless component sheets are immune to Stitch's frame-drift habit.

**2026-07-18 — Merged Screens 6+7 (component sheet, 4 states) generated. APPROVED.
DESIGN PHASE COMPLETE.** Cleanest output: Cormorant correct, all four states with
exact copy, both composite bars four-segment with exact hexes and canonical
percentages (C: 50/30/10/10; D: 55/18/15/12), chart-first "◉ Your chart · ♒ / FULL
CHART" pill, dashed "+ Add" ghost chip, "Clear table" action. Build notes:
- "MM/DD" TEXT inputs → build keeps native type=date (BirthdayStrip pattern, store
  shape, mobile UX).
- Element-colored person glyphs ACCEPTED as an improvement (sign→element color is
  semantically correct) — but derive the color programmatically: mock colored ♎ Libra
  water-blue; Libra is Air #C084FC.
- State D's hotlinked googleusercontent avatar → DISCARD (external asset, unrequested).
- Gradient Add buttons → solid violet #B85AF0 with #110d18 text; "LEO PALATE" readout
  gold-ish → muted tag idiom.

**FINAL DELIVERABLE SET (all approved):** desktop benchmark (corrected pass) · mobile
hero guest-default · Cuisines stage card (card only) · mobile quiz question · desktop
quiz result card (card only) · who's-eating component sheet (4 states). Approved mock
HTML lives in the Stitch project — export frames to docs/design/mocks/ if an in-repo
pixel reference is wanted. The BUILD composes: benchmark frame + these cards/states,
on the site's existing CSS tokens (Stitch's Tailwind/Material-3 configs are mock-only,
never source), wired per the wiring notes above + the appendix in
NEXT_SESSION_PROMPT_HOME_EXPERIENCE.md. Standing normalizations recap: Cormorant
Garamond; exact token hexes; emoji glyphs not Material icons; #110d18 on violet
buttons; plain-text arrows; no decorative JS; pure-CSS transitions; honest fallbacks
on every live chip.
