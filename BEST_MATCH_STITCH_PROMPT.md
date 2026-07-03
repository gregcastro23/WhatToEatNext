# Google Stitch Prompt — Alchm Kitchen Landing Page (Complete Layout Edition)

> Paste the **PROMPT** block below into Google Stitch (stitch.withgoogle.com).
> This prompt contains an explicit structural blueprint to ensure Stitch does not truncate or omit the components.

---

## PROMPT (paste this)

Design a **dark, premium landing page** for a web application called **Alchm Kitchen** (alchm.kitchen) — a culinary recommendation engine combining astrology, planetary transits, and elemental alchemy. 

### CRITICAL INSTRUCTION
**DO NOT TRUNCATE, OMIT, OR USE PLACEHOLDERS FOR ANY SECTION.** You must write the full, completed HTML code for the Hero section, the Welcome Promo, and **ALL THREE recommenders**, plus the **slide-out Restaurant Discovery Drawer**. Write all elements, text, Tailwind classes, and styling details in full.

### THEME — "Modern Alchemist" (dark only)
A laboratory-instrument-panel-meets-cosmic-mysticism aesthetic. Obsidian glass surfaces, violet + copper accents, glowing elemental dots, fine engineering grid texture.

- **Surfaces:** page background `#07060B` (near-black void); cards/containers `#0E0C16` (obsidian card); elevated panels/popovers `#15121F` (elevated glass). Subtle white overlays at 3–6% opacity. Hairline borders `rgba(255,255,255,0.08)` default.
- **Text:** primary `#F2EDFF`, dimmed `#B5ADCC`, muted/labels `#6E6884`.
- **Accent pair:** violet `#B85AF0` and copper/gold `#DEA54B`. Use a violet→pink→gold gradient `linear-gradient(135deg,#C084FC,#F472B6,#FBBF24)` for wordmarks and highlight scores.
- **Elemental colors (glowing dots):** Fire `#EF7A5A`, Water `#58A6E8`, Earth `#76B266`, Air `#D9CD9F`. Render as a glowing 8px dot (`box-shadow: 0 0 12px <color>`) next to a tiny label.
- **Typography:** Display/serif **Cormorant Garamond** for titles and names. Body **Manrope**. **JetBrains Mono** for numbers, scores, and mono-caps labels.
- **Depth:** glassmorphism (`backdrop-filter: blur(22px)`); fine 64px grid overlay; colored shadows.

---

### STRUCTURAL BLUEPRINT (Implement this exact HTML tree)

#### 1. Header Navigation (`<nav>`)
- Left: "ALCHM KITCHEN" wordmark (gradient text, Cormorant Garamond).
- Center: Links (Pantry, Recipes, Restaurants, Lab) in JetBrains Mono.
- Right: "Initiate" button (copper outline).

#### 2. Main Container (`<main class="relative z-10 pt-[128px] pb-32 px-8 max-w-7xl mx-auto flex flex-col gap-16">`)
Inside main, you MUST render:

##### A. Hero Section (`<section class="flex flex-col items-center text-center gap-6">`)
- Eyebrow: "YOUR KITCHEN · THE LIVE SKY" (JetBrains Mono).
- Title: "Know what to **eat next**."
- Subhead: "Turn your birth chart, pantry, and the current sky into clear culinary recommendations."
- CTAs: "Build tonight's recipe →" (violet gradient fill) and "Set up my chart" (ghost glass).
- **Benefits Row:** A grid of 3 columns:
  - `01` **Personalized:** "Your natal chart and the live sky."
  - `02` **Practical:** "Recipes, ingredients, and methods."
  - `03` **Pantry-aware:** "Plan around what you already have."

##### B. Welcome Promo & Featured Recipe Block (Split Card)
A grid of 2 columns on desktop (`grid grid-cols-1 lg:grid-cols-5 gap-8 bg-glass-card rounded-3xl p-8`):
- **Left (Span 3): Welcome Promotion**
  - Eyebrow: "NEW MEMBER WELCOME · AVAILABLE NOW"
  - Title: "Start with 60 ESMS tokens"
  - Description: "Claim your free welcome grant of 60 ESMS tokens to power cosmic recipe generation."
  - Grid: 4 token chips (🝧 Spirit, 🝑 Essence, 🝙 Matter, 🝉 Substance) with small counts "+15".
- **Right (Span 2): Featured Recipe**
  - Title: "Alchemist's Dragon Noodle" (Cormorant Garamond).
  - Quick stats row: Time `25 min`, Serves `2`, Level `Medium`, Aligns `94/100`.
  - **Elemental Signature Bars:** Fire (60%), Earth (20%), Air (10%), Water (10%) with color-matching glowing progress bars.
  - CTA Button: "Mint Recipe as NFT" (copper border).

##### C. Recommender 1: Cuisine Recommender (Tonight's Cuisines)
- Title: "Tonight's cuisine, tuned to the sky" with subtitle "Live planetary scoring".
- Grid of 6 cuisine cards. **Each cuisine card MUST show**:
  - Rank badge (e.g., `#1`), Score badge (e.g. `95%`), Planet ruler (e.g., `♀ Venus` for Italian).
  - Cuisine title (e.g., Italian, Thai, Japanese, Mexican, Indian, Greek).
  - Short description/reasoning.
  - **Flavor Profile Bars:** Render small horizontal bars for: Spicy, Umami, Salty, Sweet, Sour.
  - Bottom Buttons: Outlined "Cook It" button, and a violet-gradient "Order It" button.
  - **Click Behavior:** Note that clicking the card or "Order It" selects the cuisine (highlighting the card with a thick glowing violet/pink border) and slides open the drawer.

##### D. Recommender 2: Ingredient Recommender (Alchemical Pantry)
- Title: "Ingredients aligned with the live sky"
- Subtitle: "Tap Pantry to track it in your kitchen."
- **Horizontal Scroll Track:** A scrollable row of 6 ingredient cards:
  - Card: Image/icon placeholder, element tag (e.g. `🔥 FIRE`), name (e.g. "Chili Flakes"), match score (`88%`), and a toggle button "＋ Pantry".

##### E. Recommender 3: Preparation Recommender (Celestial Prep)
- Title: "Alchemical Techniques & Sauces"
- Subtitle: "Apply heat and moisture in phase with the transits."
- **Tab Controls:** Row with two buttons: "Sauces" and "Cooking Methods" (active tab styled in violet).
- **Tab Content Container:**
  - If Sauces: Grid of 3 sauce cards (e.g. Salsa Macha, Garlic Aioli, Ponzu) with flavor tags and planetary hours.
  - If Cooking Methods: Grid of 3 method cards (e.g. Sautéing, Grilling, Braising) showing the Monica constant, thermodynamic stats (Heat, Entropy, Reactivity), and kinetics profiles.

#### 3. Restaurant Discovery Drawer ("Order It")
A slide-out container placed at the root level (`<div class="fixed top-0 right-0 h-full w-[450px] bg-glass-overlay z-50 shadow-2xl border-l border-white/10 flex flex-col p-6 transition-transform duration-300">`). *Design it in the open state for display.*
- **Header:** Title "Best Match Mexican Restaurants" with close button `✕` and live sky pill (`LEO ♌ · MARS HOUR ♂`).
- **Control Bar:** Location chip ("📍 Forest Hills, Queens"), radius preset slider, sort segmented control (Best Match / Distance / Rating / Price), and "Open Now" switch.
- **Top Match Hero Card:** A large highlighted card showing "Casa Enrique" (★ 4.7, $$, 0.4 mi), element tag `🔥 FIRE`, custom Mars hour quote, and a large circular gradient match ring showing `92%`.
- **Runners-Up List:** A vertical scrollable container of 3 cards (De Mole, Maya Taqueria, El Paso) with scores, ratings, and CTA buttons (Reserve / Order / Menu).

---

### SAMPLE DATA (use this to populate the mockup)
- **Cuisines:**
  1. Italian (Venus, 95% Match)
  2. Mexican (Mars, 92% Match)
  3. Japanese (Mercury, 88% Match)
  4. Thai (Mars, 85% Match)
  5. Indian (Jupiter, 81% Match)
  6. Greek (Sun, 76% Match)
- **Top Restaurant (Mexican):**
  - Casa Enrique (★ 4.7, $$, 0.4 mi, 92% Match)
- **Runners-up (Mexican):**
  - De Mole (★ 4.5, $$, 0.7 mi, 88% Match, PARTNER)
  - Maya Taqueria (★ 4.4, $, 1.1 mi, 81% Match)
  - El Paso (★ 4.2, $$, 1.6 mi, 76% Match)
