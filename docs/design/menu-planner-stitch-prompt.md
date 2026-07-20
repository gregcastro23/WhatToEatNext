# Weekly Meal Planner — Stitch Redesign Prompt

Ready-to-paste prompts for **Google Stitch** to generate a modern redesign of the
`/menu-planner` weekly calendar. Built from a 20-question design interview + a full
audit of the current page, data model, and design system.

**How to use:** Paste the **Global Style Block** first, then paste each **Screen prompt**
as its own generation (Stitch generates one screen per prompt; keep the style block at
the top of each so every screen stays on-brand). Generate the **Mobile** screens first
(this is a mobile-first design), then the desktop variants.

---

## Design decisions locked in (the 20 answers)

| # | Decision | Choice |
|---|----------|--------|
| Platform | Form factor | **Mobile-first, responsive** to desktop |
| Goal | Optimize for | **Fast, effortless weekly fill** |
| Theme | Aesthetic | **Clean & modern** (elemental cues as small accents) — rendered in the app's dark theme |
| Density | Main screen | **Balanced** — calendar + one insights rail |
| Layout | Calendar | **7-column grid (desktop) / swipeable day-stack (mobile)** |
| Slots | Meals/day | **3 mains (Breakfast/Lunch/Dinner)** shown; **snack is an optional add** |
| Today | Emphasis | **Prominent "Today" hero card** |
| Nav | Week change | **Prev/next arrows + swipe + "Jump to today"** |
| Balance | Elemental/ESMS | **Compact weekly balance meter in the insights rail** |
| Nutrition | Macros | **Per-day, shown on the cards (data-forward)** |
| AI | Generation | **Secondary / subtle** (fast-fill leans on templates, agent menus, copy-week, quick add) |
| Agent menus | Entry point | **Living updating fixture on the agent's profile; interactive user-week fixture on the user's profile** |
| Add recipe | Interaction | **Tap-to-add everywhere (no drag-and-drop)** |
| Grocery | Shopping | **Prominent "Shop the week" → grocery list → Amazon Fresh cart** |
| Planetary | Astro layer | **Keep the transit ribbon + planetary day rulers visible** |
| Cards | Visual richness | **Data-forward** (macros + estimated cost on each card) |
| Rail | Insights content | **Elemental balance + smart suggestions + budget/cost + variety & missing-meals** |
| Empty state | Fast start | **Guided quick setup, then prefill an editable week** |
| Tracking | "I ate this" | **Lives in a separate tracking view** (not on calendar slots) |
| Deliverable | Scope | **Everything:** main week (mobile + desktop), empty state, add-recipe sheet, shop-the-week, insights, profile week-fixture |

### Hard data-model constraints the design MUST respect
- **7 days, Sunday → Saturday.** The ribbon and columns run Sun…Sat.
- Underlying grid is **7 days × 4 meal types** (breakfast, lunch, dinner, snack). We
  **show 3 mains by default** and expose snack as an "**+ add snack**" affordance — do
  not invent custom meal types.
- Each meal slot holds: one recipe, a **servings** number, an optional single **sauce**,
  and a **lock** toggle (a locked meal survives "regenerate / balance / reshuffle").
- The week is one unit keyed by its Sunday start date; users move week-to-week.

---

## GLOBAL STYLE BLOCK  *(prepend to every screen prompt)*

```
STYLE: Modern, clean, food-first meal-planning app in a refined DARK theme (dark mode
only — never white/light surfaces). Think a premium, decluttered planner (Notion-calm
meets a cooking app) with a subtle cosmic/alchemical signature — NOT a busy dashboard or
sci-fi console. Generous whitespace, clear visual hierarchy, one primary action per area.

COLOR PALETTE (dark, use these exact hex):
- Backgrounds (darkest→lightest surfaces): #07060B, #0E0C16, #15121F, #1C1829, #241F33
- Text: #F2EDFF (primary), #B5ADCC (secondary/labels), #6E6884 (muted)
- Primary accent (violet): #B85AF0
- Secondary accent (copper-gold): #DEA54B
- Error/over-target: #F87171
- Element accents (small dots/bars only): Fire #EF7A5A, Water #58A6E8, Earth #76B266, Air #D9CD9F
- Signature gradient: 135° copper→violet (#DEA54B → #B85AF0), used sparingly on hero/CTA.

SURFACES: Translucent "glass" cards — subtle white 4–8% fill, 1px hairline border, soft
backdrop blur, rounded corners (14–16px). Hero cards get a faint violet glow. Keep it
airy; avoid heavy borders, avoid neon, avoid terminal/monospace-console styling.

TYPOGRAPHY:
- Headings: an elegant serif (Cormorant Garamond), medium weight, tight letter-spacing.
- Body: a clean humanist sans (Manrope).
- Small labels, numbers, metadata, kcal/cost/servings: a monospace (JetBrains Mono),
  UPPERCASE, wide letter-spacing (~0.12em), tabular figures. This mono-caps micro-label
  treatment is the brand signature — use it for all tiny data readouts.

ICONOGRAPHY: Minimal line icons. Preserve two signature astro touches only:
(1) planetary day glyphs ☉ ☽ ♂ ☿ ♃ ♀ ♄, (2) small elemental dots. No heavy occult
ornament, no fake telemetry, no crosshair gauges.

MOOD: calm, confident, effortless. The user should feel a full week can be planned in
under a minute.
```

---

## SCREEN 1 — Weekly Planner (MOBILE, primary)

```
[PREPEND GLOBAL STYLE BLOCK]

SCREEN: "Weekly Meal Planner" — mobile (390px wide). This is the primary screen.

TOP APP BAR: Left: screen title "This Week" in serif. Below it, a small mono-caps
date range label "SUN JUL 12 – SAT JUL 18". Right: a compact "⌄ Jump to today" pill and
a settings/kebab icon. A left/right chevron pair for previous/next week; the whole day
area is also horizontally swipeable between weeks.

TRANSIT RIBBON (signature, keep subtle): A slim horizontal strip of 7 small circular
"day medallions" (Sun→Sat), each showing the day's ruling-planet glyph (☉☽♂☿♃♀♄) and a
one-letter day initial. Today's medallion glows copper-gold; the selected day glows
violet. This is a lightweight week-navigator, not a big banner.

TODAY HERO CARD (prominent, pinned near top): A larger glass card with a faint violet
glow for the current day. Header row: planet glyph + "TODAY · SUNDAY" mono-caps + a short
one-line cosmic tip (e.g. "A Sun day — favor warming, celebratory dishes"). Then a compact
"3 of 3 planned" progress read-out. Body: the 3 main meals (Breakfast, Lunch, Dinner) as
data-forward meal cards (see MEAL CARD spec). A subtle "+ add snack" ghost row at the
bottom. Primary action on the card: "Fill this day" (subtle, secondary-styled) and a small
lock icon per meal.

WEEK LIST (below the hero): The rest of the week as a vertical stack of DAY CARDS you
scroll through (day-stack layout on mobile). Each day card: a header with planet glyph +
day name (serif) + short date (mono-caps) + a tiny per-day macro chip "560 KCAL · $6.20".
Under it, the 3 main meal slots. Collapsed days can show just filled/empty meal chips.

MEAL CARD spec (data-forward): a horizontal card = small recipe thumbnail (or an "+ Add"
placeholder if empty) · recipe name (serif, 1 line) · a row of mono-caps data:
"420 KCAL · P32 C40 F14 · $4.10 · x2" (calories, macros, est. cost, servings) · one small
element dot showing the dish's dominant element · a lock icon (outline = unlocked, filled
copper = locked). Tapping an EMPTY slot opens the Add-Recipe sheet (Screen 4). Tapping a
FILLED card opens its detail/quick-actions (swap, servings, lock, remove).

INSIGHTS RAIL (mobile = a collapsible panel or bottom section, not a permanent sidebar):
A single "Week Insights" section with four compact modules, in this order:
1. ELEMENTAL BALANCE — a small horizontal 4-segment meter (Fire/Water/Earth/Air) with a
   plain-language verdict line "Balanced week" or "A little fire-heavy". Signature metric.
2. SMART SUGGESTIONS — 2–3 recipe chips to fill gaps or improve balance ("Add a Water dish").
3. BUDGET — "$41 / $60 this week" with a thin progress bar.
4. VARIETY & GAPS — "2 slots empty · 9 unique ingredients" with a "Fill remaining" button.

BOTTOM: Respect the app's existing global bottom tab bar — leave room for it; do NOT add a
second fixed bottom bar. A single floating "✦ Shop the week" button sits above the tab bar.

STATES: show the filled state (most days planned, 1–2 empty slots visible as dashed "+ Add"
placeholders).
```

---

## SCREEN 2 — Weekly Planner (DESKTOP)

```
[PREPEND GLOBAL STYLE BLOCK]

SCREEN: "Weekly Meal Planner" — desktop (1440px). Same content as mobile, reflowed into a
two-region layout: a wide 7-column calendar grid on the left (~70%) and a persistent
INSIGHTS RAIL on the right (~30%).

HEADER: serif title "This Week", mono-caps date range, prev/next week chevrons, a
"Jump to today" button, and a subtle secondary "✦ Auto-plan" button (AI is intentionally
low-key). Primary CTA (copper→violet gradient): "Shop the week".

TRANSIT RIBBON: full-width slim strip of 7 planet-glyph day medallions (Sun→Sat) directly
under the header; today = copper glow, selected = violet glow.

CALENDAR GRID: 7 columns (Sun→Sat). Each column = a day. Column header: planet glyph +
day name (serif) + date (mono-caps) + tiny per-day macro chip. TODAY'S COLUMN is visually
elevated (violet-glow border, slightly wider) — this is the "Today hero" in grid form.
Each column body stacks the 3 main meal slots as compact data-forward MEAL CARDS (same spec
as mobile: thumbnail, name, "KCAL · P/C/F · $cost · xservings", element dot, lock icon),
plus a subtle "+ add snack" ghost slot and a "Fill day" affordance on hover. Empty slots
render as dashed "+ Add" placeholders. Tap a slot to add (no drag-and-drop).

INSIGHTS RAIL (right, always visible): stacked cards in this order —
1. ELEMENTAL BALANCE (hero of the rail): a clean 4-bar or small radial Fire/Water/Earth/Air
   meter + verdict line + a "harmony 78%" mono readout. This is the platform's signature.
2. WEEKLY MACROS: total kcal + P/C/F vs goals, a slim compliance ring.
3. SMART SUGGESTIONS: 3 recipe suggestion rows with quick "+ add to <day>".
4. BUDGET: est. weekly cost vs budget, progress bar, per-day mini-breakdown.
5. VARIETY & MISSING MEALS: unique ingredients/cuisines + a list of empty slots with
   one-click "fill".

FOOTER: a slim link row "Templates · Copy last week · Save as template · Tracking".
```

---

## SCREEN 3 — Empty State / Fast Start (guided quick setup)

```
[PREPEND GLOBAL STYLE BLOCK]

SCREEN: "Plan your week" — the empty state for a brand-new/empty week. Mobile-first,
centered, welcoming. Goal: get from zero to a full editable week in under a minute.

HERO: a serif headline "Let's plan your week" + one-line subhead "Answer 3 quick things and
we'll draft a balanced week you can tweak."

A short GUIDED QUICK-SETUP card with 3 compact steps (segmented pickers, not a long form):
1. WHO / SERVINGS — a stepper "Cooking for [2] people".
2. DIET & PREFERENCES — chips: Balanced (default), High-protein, Vegetarian, Vegan,
   Pescatarian, Low-carb + a "cuisines" multiselect row.
3. BUDGET — a slider "$ per week" with a mono-caps value, plus "No budget" toggle.
Primary CTA (gradient): "Draft my week ✦".

Below the setup, three SECONDARY start options as cards (fast-fill, AI kept subtle):
- "Start from a template" (your saved weeks)
- "Adopt an agent's menu" (browse Planetary Agent-authored weeks — small preview cards
  showing the agent avatar, week title, planetary focus, and a "Use this week" button)
- "Copy last week"

Keep it calm and uncluttered; one clear primary path (the guided draft) with the others as
quieter alternatives.
```

---

## SCREEN 4 — Add-Recipe Sheet (tap-to-add)

```
[PREPEND GLOBAL STYLE BLOCK]

COMPONENT: A bottom sheet (mobile) / centered modal (desktop) that opens when the user taps
an empty meal slot. Title mono-caps: "ADD TO · MONDAY · LUNCH".

TOP: a search field "Search recipes…" with a mono-caps placeholder. Below it, quick filter
chips: All · Suggested for balance · Quick (<30 min) · High-protein · Fire/Water/Earth/Air
(as small element dots). A subtle "✦ Suggest for me" pill (AI, secondary).

RESULTS: a scrollable list of data-forward recipe rows — thumbnail · name (serif) ·
mono-caps data "420 KCAL · P32 C40 F14 · $4.10 · 25 MIN" · a small dominant-element dot ·
a right-side "Add" button. A "SUGGESTED FOR THIS SLOT" section at the top shows 2–3 picks
that improve the week's elemental balance or fill a macro gap, each with a tiny reason
tag ("+ adds Water", "+ protein").

FOOTER (when a recipe is chosen): a compact confirm row — servings stepper (default from
setup), an optional "add a sauce" link, and a "Add to Monday · Lunch" primary button.

Keep it fast: one tap to add, sheet dismisses back to the calendar with the slot now filled.
```

---

## SCREEN 5 — Shop the Week (grocery list → Amazon Fresh)

```
[PREPEND GLOBAL STYLE BLOCK]

SCREEN: "Shop the week" — a consolidated grocery list generated from the planned meals,
with an Amazon Fresh handoff. (Do NOT reference Instacart.)

HEADER: serif "Grocery List" + mono-caps subline "FROM 7 DAYS · 18 MEALS" + a total
"EST. $52.40". Primary CTA (gradient): "Send to Amazon Fresh cart".

LIST: items grouped by category sections (Produce, Proteins, Dairy, Grains, Spices,
Condiments, Canned, Frozen, Bakery, Beverages, Other). Each item row: a checkbox, item name,
mono-caps quantity+unit "2 LBS", a small "used in 3 meals" tag, and an "in pantry" toggle
(dims/strikes the row when on). A top toolbar: "Check all", "Hide pantry items",
"Add item".

RIGHT/BELOW: a small summary card — item count, est. total, and a note "Pantry items
excluded from cart". Keep it clean and scannable; category headers in mono-caps.
```

---

## SCREEN 6 — Weekly Insights (expanded)

```
[PREPEND GLOBAL STYLE BLOCK]

SCREEN: "Week Insights" — the full view behind the rail's balance/nutrition/variety modules.

TOP HERO: ELEMENTAL BALANCE — a large but clean visualization of the week's Fire/Water/
Earth/Air distribution (a radial 4-axis meter or 4 elegant bars) with a plain-language
verdict ("Balanced, leaning warm"), a "harmony 78%" mono readout, and a one-line
"this week trends heating →" thermal note. Small element dots as the only ornament.

NUTRITION: weekly totals vs goals for Calories/Protein/Carbs/Fat as macro pills + a
compliance ring (0–100). A short "below target: fiber, iron" list.

VARIETY: unique ingredients, unique recipes, cuisine diversity, and color diversity as
four small 0–100 bars.

BUDGET: est. weekly cost vs budget with a per-day bar chart.

SUGGESTIONS: a list of specific improvements each with a one-tap action
("Swap Tue dinner for a Water dish to balance the week").

Everything in calm glass cards; no console/terminal styling.
```

---

## SCREEN 7 — Profile "Week Fixture" (embeddable) — agent & user variants

```
[PREPEND GLOBAL STYLE BLOCK]

COMPONENT: A compact, embeddable "this week" fixture that lives on an alchm.kitchen PROFILE
page (not the full planner). Two variants, same visual language:

(A) AGENT PROFILE — a living, auto-updating fixture titled "[Agent]'s week" with a small
mono-caps "UPDATED 2H AGO" stamp and a planetary-focus tag. Shows a condensed 7-day row
(Sun→Sat) of small day tiles; each tile shows the planet glyph and up to 3 tiny meal chips
(dominant-element dot + short name). A quiet "Adopt this week" button lets a viewer copy the
agent's menu into their own planner. Read-only, elegant, feed-friendly.

(B) USER PROFILE — the signed-in user's own week as an INTERACTIVE fixture: same condensed
7-day row, but tiles are tappable — tapping a day expands its meals inline, tapping a meal
opens quick actions (swap / lock / remove) or the add sheet for empty slots. A small
"Open planner →" link jumps to the full /menu-planner screen. Include a compact elemental
balance mini-meter and a "12/21 planned" mono progress read-out in the fixture header.

Both variants must be small enough to sit inside a profile page card (max ~2 rows tall on
mobile) and match the surrounding profile styling.
```

---

## CONDENSED ONE-SHOT PROMPT  *(single paragraph, for Stitch quick mode)*

Use this when you want one block instead of the per-screen set (attach the structured
prompt above as extra context for finer detail).

```
Design a modern, clean, mobile-first Weekly Meal Planner screen for a premium cooking app,
in a refined DARK theme only (never white surfaces) — calm and decluttered, like
Notion-meets-a-cooking-app with a subtle cosmic/alchemical signature, NOT a busy dashboard
or sci-fi console. Palette: backgrounds #07060B→#241F33, text #F2EDFF/#B5ADCC/#6E6884,
violet accent #B85AF0, copper-gold #DEA54B, error #F87171, tiny element dots Fire #EF7A5A /
Water #58A6E8 / Earth #76B266 / Air #D9CD9F, and a sparing 135° copper→violet gradient on the
main CTA. Translucent glass cards with 1px hairline borders, soft blur, 14–16px radius; the
hero card gets a faint violet glow. Type: elegant serif headings (Cormorant Garamond), clean
sans body (Manrope), and UPPERCASE wide-tracked monospace (JetBrains Mono) for all small
labels/numbers/kcal/cost — the brand signature. Layout top to bottom: a top bar with serif
title "This Week", a mono-caps date range "SUN JUL 12 – SAT JUL 18", prev/next week chevrons
and a "Jump to today" pill (the week also swipes); a slim signature transit ribbon of 7 small
circular day-medallions Sun→Sat, each with a planetary glyph (☉☽♂☿♃♀♄), today glowing
copper and the selected day glowing violet; a prominent glowing "TODAY · SUNDAY" hero card
with a one-line cosmic tip, a "3 of 3 planned" readout, and its three main meals
(Breakfast/Lunch/Dinner) plus a ghost "+ add snack" row; below it the rest of the week as a
vertical stack of day cards (planet glyph + serif day name + mono-caps date + a tiny
"560 KCAL · $6.20" chip), each holding its three meal slots. Every meal card is data-forward:
a recipe thumbnail (or a dashed "+ Add" placeholder if empty), the recipe name in serif, a
mono-caps data row "420 KCAL · P32 C40 F14 · $4.10 · x2", one dominant-element dot, and a
small lock icon; tapping an empty slot adds a recipe (tap-to-add, no drag-and-drop). Include
one collapsible "Week Insights" section with four compact modules in order: a
Fire/Water/Earth/Air elemental balance meter with a plain verdict ("Balanced week"), 2–3
smart recipe suggestions, a budget bar "$41 / $60", and a variety/gaps line
"2 slots empty · 9 unique ingredients". Leave room for a global bottom tab bar and float a
single "✦ Shop the week" button above it. Keep it airy and effortless. No terminal/console
styling, no gauges, no occult ornament beyond the planet glyphs and element dots.
```

**Retarget trick:** keep everything through the typography sentence, then swap the layout
description to aim the one-shot at another screen (empty state, add-recipe sheet, shop-the-week,
insights, or the profile week-fixture).

---

## After Stitch generates — wiring notes (for the follow-up implementation)

When the Stitch output comes back, we wire it into the codebase against these anchors:

- **Route:** rebuild `src/app/menu-planner/page.tsx` (the `/meal-plan` redirect stays).
- **Core grid:** replace/refactor `src/components/menu-planner/WeeklyCalendar.tsx`
  (`DayColumn`, `MealSlot`, `TodayHeroCard`, `StitchTransitRibbon`).
- **Consolidate toolbars:** collapse `QuickActionsToolbar.tsx` + the second "Tools Bar"
  into one command surface; **re-skin the off-brand light-mode toolbar** (currently
  `bg-white`/gray/blue — the worst clash) to alchm tokens.
- **Insights rail:** wire the balance meter to the real `weeklyCircuitCalculations.ts`
  circuit metrics (harmony/thermal/efficiency) via `CircuitMetricsPanel`, not the
  hardcoded "Cycle Telemetry" placeholders (`☽ 14°`, `natalResonance = 92`, 65%/82%).
- **Per-slot lock:** surface `isLocked` (`setMealPlanSlotLocked`) directly on the grid
  meal card (today it's buried in `FocusedDayView`).
- **Fast-start:** guided setup → prefill via `generateMealsForDay` loop / templates /
  `/api/menu-planner/agent-weekly-menu` (agent menus) / copy-last-week.
- **Shop the week:** `regenerateGroceryList` → `GroceryListModal` → Amazon Fresh cart
  (`src/data/amazon`). **Do not** wire the deprecated Instacart route.
- **Profile fixture:** new embeddable component reading the same `WeeklyMenu`
  (`MenuPlannerProvider`), mounted on agent + user profile pages; agent variant reads the
  agent's persisted menu (GET `/api/menu-planner/agent-weekly-menu`).
- **One denominator:** standardize the "how full is my week" signal (pick 21 mains, or
  28 incl. snack — currently /21, /6, /4 all appear).
- **Persistence unchanged:** primary store = `WeeklyMenu` at `/api/menu-planner/menus`
  (keyed by `weekStartDate`); live overlay = SpacetimeDB `meal_plan_slot`
  (`NEXT_PUBLIC_SPACETIME_LIVE_PLANNER`). Keep 7 days Sun→Sat, 4 meal types (show 3 + snack).
```
