# Alchm.kitchen Design System: Menu Planner Console

This document outlines the visual identity, styling classes, typography tokens, and layout guidelines for the upgraded **Alchm.kitchen Weekly Menu Planner** console.

---

## 1. Visual Aesthetics & Themes

The visual theme shifts away from light/neon SaaS aesthetics into a **dark-premium alchemical command center** motif, matching the site's laboratory branding.

### Theme Palette (Oklch & Hex Reference)
- **Base Background:** `#07060b` / `oklch(0.06 0.01 290)` (near-black violet)
- **Primary Text:** `#f2edff` / `oklch(0.95 0.02 290)` (soft lavender-white)
- **Muted Text:** `#b5adcc` / `oklch(0.75 0.03 290)` (lavender-gray)
- **Muted Border:** `rgba(255, 255, 255, 0.08)` (hairline grid borders)
- **Active Violet Highlight:** `oklch(0.72 0.18 305)` (vibrant amethyst)
- **Gold Accent:** `oklch(0.78 0.14 65)` (warm alchemical sun)

### Astrological Element Accents
- **Fire (Spirit):** `oklch(0.74 0.17 35)` (soft warm red)
- **Water (Essence):** `oklch(0.74 0.13 230)` (oceanic deep blue)
- **Earth (Matter):** `oklch(0.74 0.11 130)` (leaf green)
- **Air (Substance):** `oklch(0.85 0.07 90)` (wind amber)

---

## 2. Reusable Styling Classes (`globals.css`)

Apply these core utility classes directly to style layout components:

- **`.lab`**: Activates the alchemical dark environment (radial purple/gold backdrop glows with overlay grid lines and noise texture).
- **`.alchm-panel`**: Flat backdrop panel with a soft gradient from top to bottom.
- **`.alchm-panel-glow`**: Premium panel card containing a violet outer shadow glow (`glow-purple`) and an inner hairline white border.
- **`.regmarks`**: Superimposes NASA corner ticks over panels using relative positioning.
- **`.alchm-btn`**: Compact action buttons utilizing monospace font, uppercase letters, letter spacing, and a subtle border hover transition.
- **`.alchm-btn-ghost`**: Transparent border-only option for secondary actions.
- **`.alchm-chip` / `.alchm-chip-active`**: Small rounded status pills.
- **`.el-dot`**: Circular elemental representation dots carrying small glows.

---

## 3. Typography Hierarchy

- **Display Headings (`.t-display`)**: Renders in the serif typeface `Cormorant Garamond` (e.g. titles, day names, headers).
- **Body (`.t-body`)**: Renders in `Manrope` for maximum reading legibility.
- **Telemetry / Stats (`.t-mono`)**: Enforces monospace `JetBrains Mono` for all nutritional numbers, element percentages, servings, clock timers, and coordinates.

---

## 4. State Conservation Guidelines

To ensure the new interface is fully functional, all React hooks and handlers must remain intact:

- **Menu State:** Context bindings (`useMenuPlanner()`) tracking planned meals (`currentMenu.meals`).
- **Real-Time Nutrition:** Active calculations (`useNutritionTracking()`) reflecting daily calorie, protein, and fiber targets.
- **Collective Guests:** Participant chart management utilizing endpoints (`GET /api/user/charts`) to merge and align multiple natal charts.
- **Meal Modifications:** Dynamic callbacks (`generateMealsForDay()`, `moveMeal()`, `removeMealFromSlot()`, `toggleSyncWithLunarCycle()`).
