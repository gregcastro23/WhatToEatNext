# Google Stitch Prompt — "Best Match" Restaurant Finder

> Paste the **PROMPT** block below into Google Stitch (stitch.withgoogle.com).
> It's written as one self-contained brief. If Stitch asks for a style first,
> use the **THEME** section; then send the **SCREEN** section. Generate both the
> **desktop** and **mobile** layouts. Feed the resulting design/code back to me
> and I'll wire it to the live `/api/restaurants` backend.

---

## PROMPT (paste this)

Design a **dark, premium "Best Match" restaurant finder page** for a web app called **Alchm Kitchen** — an astrology-meets-food app. The page replaces the current Restaurants page. Given a **selected cuisine** and the **user's location**, it shows the best nearby restaurants, **ranked and sortable**. Lead with mainstream quality signals (cuisine, rating, distance, price); treat the app's signature "cosmic match" score as a tasteful **secondary accent**, never the headline.

### THEME — "Modern Alchemist" (dark only)
A laboratory-instrument-panel-meets-cosmic-mysticism aesthetic. Obsidian glass surfaces, violet + copper accents, glowing elemental dots, fine engineering grid texture.

- **Surfaces:** page background `#07060B` (near-black void); cards `#0E0C16`; elevated/popovers `#15121F`. Subtle white overlays at 3–6% opacity. Hairline borders `rgba(255,255,255,0.08)` default, `rgba(255,255,255,0.14)` on emphasis.
- **Text:** primary `#F2EDFF`, dimmed `#B5ADCC`, muted/labels `#6E6884`.
- **Accent pair (signature):** violet `#B85AF0` and copper/gold `#DEA54B`. Use a violet→pink→gold gradient `linear-gradient(135deg,#C084FC,#F472B6,#FBBF24)` for the brand wordmark and the hero match ring. Error/closed `#F87171`.
- **Elemental colors** (for the small "dominant element" chip on each card): Fire `#EF7A5A`, Water `#58A6E8`, Earth `#76B266`, Air `#D9CD9F`. Render each as a glowing 8px dot (`box-shadow: 0 0 12px <color>`) next to a tiny ALL-CAPS label.
- **Typography:** Display/serif **Cormorant Garamond** for the page title and restaurant names (elegant, high-contrast). Body **Manrope**. **JetBrains Mono** ALL-CAPS for micro-labels, scores, badges, and sort controls — this mono "instrument" voice is the signature. Numbers tabular.
- **Radius:** inputs/buttons 8–14px, cards 16px, large glass panels 24px, pills/dots fully rounded.
- **Depth:** glassmorphism (`backdrop-filter: blur(22px) saturate(180%)`); ambient off-canvas radial glow blobs (violet top-right, rose bottom-left, `blur(100px)`, ~10% opacity); a faint 64px engineering grid + subtle noise overlay across the page; layered colored shadows (`0 8px 32px rgba(0,0,0,0.4)`, hover lift `0 20px 40px rgba(184,90,240,0.15)`).

### SCREEN — Best Match page

**1. Page header (top)**
- Small ALL-CAPS mono eyebrow: "ALCHM KITCHEN · DISCOVER".
- Large serif title: "Find your **Best Match**" (gradient-accent the words "Best Match").
- One-line subhead in dimmed text: "The best [cuisine] near you, ranked for this moment."
- Right side (desktop): a compact "cosmic context" pill in mono caps showing the live sky, e.g. `LEO ♌ · MARS HOUR ♂ · FIRE DOMINANT` with the dominant-element dot glowing. On mobile this collapses under the subhead.

**2. Control bar (sticky below header, glass panel)**
Arrange as a responsive row that wraps:
- **Cuisine selector:** a horizontal scroll of pill buttons for popular cuisines (Italian, Japanese, Mexican, Thai, Indian, Mediterranean, Chinese, Korean, American, French, Vietnamese, Greek) plus a "＋ Other" pill that reveals a text input. The active cuisine pill is filled with the violet accent; others are outlined glass.
- **Location control:** a button "📍 Use my location" (filled violet→pink gradient) that, once resolved, becomes a chip showing the detected city/neighborhood with a small "change" affordance; beside it an "Or enter a city…" text field with autocomplete suggestions. Show a small mono caption of the active search radius with a slider or stepper (e.g. `WITHIN 2.5 mi`).
- **Sort control:** a segmented group of mono-caps pills — **BEST MATCH · DISTANCE · RATING · PRICE** — with BEST MATCH selected by default (filled). Include an **"OPEN NOW"** toggle chip at the end.

**3. Hero "Top Match" card (the single best result)**
A large, glowing glass card that stands apart (violet panel-glow ring). Contains:
- A small mono-caps label "YOUR BEST MATCH".
- **Restaurant name** in large serif.
- A row of quality signals: ★ rating + "(1,240 reviews)", price `$$`, distance `0.4 mi`, and the cuisine label.
- A circular **match ring** (gradient stroke) on the right showing a percentage like `92%` with a tiny `✦` and a mono caption "COSMIC MATCH" — this is the *secondary* accent, smaller than the name/quality row.
- The glowing dominant-element chip (e.g. 🔥 FIRE).
- A short italic "why it matches" line (one sentence, e.g. "Fire-leaning Mexican resonates with the Mars hour").
- Optional small "PARTNER" badge (emerald) when the restaurant supports in-app ordering.
- Primary CTA button "Reserve" (or "Order Now" for partners, emerald), plus secondary ghost buttons "Menu", a heart "Save", and a "+" (log to food diary).

**4. Ranked results list (runners-up)**
A vertical list (single column on mobile, comfortable rows on desktop) of restaurant cards, each:
- Left: a compact rank/match indicator — a small gradient badge with the match percentage `+ ✦` when scored, or a neutral provider chip when unscored; beneath it the glowing element dot + element label.
- Middle: restaurant **name** (serif), then a wrap row of quality meta — ★ rating, review count, price, distance, cuisine label.
- A subtle 1–2 line "match reasons" block with a left accent border (italic, dimmed) when a cosmic score exists.
- Right: stacked CTAs — Reserve/Order (primary), Menu, Save (heart), Log (+).
- Partner cards get an emerald left ring + "PARTNER" tag.
- Hover: gentle lift + violet glow.

**5. States** (design each)
- **Needs location:** centered card with a 📍 glyph, copy "Enable location to find [cuisine] near you", and the violet "Use my location" button (plus the "enter a city" alternative).
- **Loading:** 3–5 shimmer skeleton cards matching the row layout.
- **Empty:** centered 🍽️ with "No [cuisine] spots found nearby — try a wider radius or a different cuisine," and a link to the "Cook It" recipe flow.
- **Degraded-scoring notice:** a slim violet info banner above the list, e.g. "✦ Showing nearby results — cosmic scoring limited for this search." (Subtle, dismissible.)
- **Error:** slim rose banner with a retry button.

**6. Footer**
Tiny centered mono-caps: "ALIGNED TO LEO ♌ · MARS HOUR ♂ · FIRE DOMINANT" and a faint "Data source: Google Places · Yelp" attribution line.

### Layout & responsive
- **Desktop (≥1024px):** max-width ~1100px centered; header + sticky control bar; hero card full-width; runners-up as roomy rows. Cosmic context pill visible top-right.
- **Mobile (≤480px):** single column; control bar items stack (cuisine pills scroll horizontally, location stacks, sort pills scroll horizontally); hero card and rows go full-width; CTAs become a horizontal row of icon buttons.
- Generous spacing, calm rhythm, high legibility on the dark surface. Everything feels like a refined instrument panel, not a busy dashboard.

### Tone
Premium, mystical-but-credible, food-forward. The quality signals (name, rating, price, distance) are the loudest; the cosmic "match" is the delightful, well-crafted accent that makes Alchm Kitchen distinct.

---

## SAMPLE DATA (use this to populate the mockup)

Selected cuisine: **Mexican** · Location: **Forest Hills, Queens** · Radius **2.5 mi** · Sort **BEST MATCH** · Open-now ON

**Hero (Top Match):**
- Casa Enrique — ★ 4.7 (1,240) · $$ · 0.4 mi · Mexican · 🔥 FIRE · **92% ✦ COSMIC MATCH** · "Fire-leaning Mexican resonates with the Mars hour" · [Reserve] [Menu] [♡] [+]

**Runners-up:**
1. De Mole — ★ 4.5 (860) · $$ · 0.7 mi · Mexican · 🔥 FIRE · 88% ✦ · PARTNER (emerald) · [Order Now]
2. Maya Taqueria — ★ 4.4 (430) · $ · 1.1 mi · Mexican · 🌿 EARTH · 81% ✦
3. El Paso — ★ 4.2 (2,010) · $$ · 1.6 mi · Mexican · 🔥 FIRE · 76% ✦
4. Habanero Grill — ★ 4.1 (305) · $ · 2.2 mi · Mexican · 💨 AIR · 71% ✦

---

## What to send back to me
- The Stitch **design link/screenshots** for desktop + mobile, and/or the **exported front-end code** (HTML/CSS or React/Tailwind).
- I'll adapt it to the repo's Next.js + Tailwind + "Modern Alchemist" tokens and wire it to the live backend (new scored `/api/restaurants/best-match` route, shared `useUserLocation()` hook, provider-agnostic scorer so Google results actually rank, and the sort/open-now controls).
