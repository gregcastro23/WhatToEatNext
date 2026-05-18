# ADR-001: Five-Slot Primary Navigation IA

**Status**: Accepted  
**Date**: 2026-05-09  
**Deciders**: Greg Castro  

---

## Context

The legacy navigation had 9 top-level items (Lab, Recipes, Ingredients, Cuisines, Meal Plan, Menu Planner, Profile, Premium, Admin) spread across two rows on desktop and a cramped mobile sheet. User testing showed confusion about where to find AI features vs. content catalogs.

The 3.0 redesign required a navigation system that:
- Scales to 50+ routes without overwhelming users
- Works on mobile (5-slot tab bar) and desktop (header + mega-menus)
- Can power a command palette (⌘K) without duplicating configuration
- Has a single source of truth for nav state across 6+ surfaces (header, tab bar, footer, palette, breadcrumbs, sitemap)

## Decision

Organize all navigation into **5 primary slots** aligned with user intent:

| Slot | Intent | Key destinations |
|---|---|---|
| **Kitchen** | Cook something now | Home feed, Recipe generator, Cosmic recipe, Recipe builder |
| **Discover** | Explore and browse | Recipes, Ingredients, Cuisines, Cooking methods, Sauces |
| **Plan** | Organize meals | Meal plan, Menu planner, Pantry, Food tracking |
| **Commensal** | Cook for a group | Group recommendations, Restaurant finder, Group save |
| **Lab** | Advanced tools | Alchemical Lab, Planetary chart, Birth chart, Current chart |

Configuration lives in a **single file**: `src/config/navigation.ts`, which exports:
- `NAV_IA` — the full nested structure
- `activePrimaryFromPathname()` — derive active slot from current URL
- `getAllNavRoutes()` — flat list for Command Palette
- `FlatNavEntry` type for palette items

## Consequences

**Positive:**
- One config change propagates to header, tab bar, footer, and ⌘K palette
- Mobile tab bar maps cleanly to 5 slots (no overflow)
- `activePrimaryFromPathname()` drives active state without prop drilling

**Negative:**
- Some routes fit multiple slots (e.g. `/cosmic-recipe` is Kitchen but also Lab). Decision: Kitchen wins when it's a generation feature.
- Admin routes (`/admin/*`) are excluded from NAV_IA and hidden from the command palette for non-admin users.
