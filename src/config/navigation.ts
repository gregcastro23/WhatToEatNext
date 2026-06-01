/**
 * Canonical Information Architecture for alchm.kitchen.
 *
 * This module is the single source of truth for every navigation surface
 * (header, mega-menus, footer, command palette, mobile tab bar). When a
 * route moves, only this file changes — every surface re-aligns.
 *
 * Do not import this from server-only modules; the constants are intended
 * for client components.
 *
 * @file src/config/navigation.ts
 */

import type { GlyphName } from "@/components/ui/alchm/Glyph";

export type PrimaryKey =
  | "kitchen"
  | "discover"
  | "plan"
  | "commensal"
  | "lab";

export interface NavRoute {
  label: string;
  path: string;
  glyph: GlyphName;
  hint: string;
  external?: boolean;
  premium?: boolean;
}

export interface NavSection {
  label: string;
  path: string;
  glyph: GlyphName;
  sub: string;
  routes: NavRoute[];
}

export type NavIA = Record<PrimaryKey, NavSection>;

export const PRIMARY_KEYS: readonly PrimaryKey[] = [
  "kitchen",
  "discover",
  "plan",
  "commensal",
  "lab",
] as const;

export const NAV_IA: NavIA = {
  kitchen: {
    label: "Kitchen",
    path: "/",
    glyph: "flask",
    sub: "Tonight's recommendations · your home base",
    routes: [],
  },
  discover: {
    label: "Discover",
    path: "/discover",
    glyph: "atom",
    sub: "Browse the cosmic pantry",
    routes: [
      { label: "Cuisines", path: "/cuisines", glyph: "ring", hint: "184 traditions · ranked by sky" },
      { label: "Ingredients", path: "/ingredients", glyph: "diamond", hint: "2,901 entries · live elemental match" },
      { label: "Cooking Methods", path: "/cooking-methods", glyph: "triangle-up-bar", hint: "Dry · wet · molecular · traditional" },
      { label: "Sauces", path: "/sauces", glyph: "wave", hint: "Mother sauces and lineages" },
      { label: "Recipes", path: "/recipes", glyph: "bookmark", hint: "12,438 · filtered to your hour" },
      { label: "Recipe Builder", path: "/recipe-builder", glyph: "plus", hint: "Compose from raw materials" },
      { label: "Restaurants", path: "/restaurants", glyph: "atom", hint: "Local · ranked by cosmic alignment" },
      { label: "Recipe Generator", path: "/recipe-generator", glyph: "spiral", hint: "AI-generated · carousel · tuned to your hour" },
    ],
  },
  plan: {
    label: "Plan",
    path: "/menu-planner",
    glyph: "diamond",
    sub: "Your kitchen calendar",
    routes: [
      { label: "Menu Planner", path: "/menu-planner", glyph: "diamond", hint: "Week-long menus tuned to transits" },
      { label: "Pantry", path: "/pantry", glyph: "mortar", hint: "What's in stock · expirations" },
      { label: "Food Diary", path: "/food-tracking", glyph: "bookmark", hint: "What you cooked · what tonight aligns to" },
      { label: "Grocery Cart", path: "/grocery-cart", glyph: "plus", hint: "Amazon Fresh · earn Matter tokens" },
      { label: "Cosmic Recipes", path: "/cosmic-recipe", glyph: "spiral", hint: "Generated from your standing chart" },
    ],
  },
  commensal: {
    label: "Commensal",
    path: "/commensal",
    glyph: "ring",
    sub: "Cook for others, in harmony",
    routes: [
      { label: "Dinner Party", path: "/commensal", glyph: "ring", hint: "Guest harmonization · up to 12" },
      { label: "Live Feed", path: "/feed", glyph: "wave", hint: "What practitioners are cooking now" },
      { label: "Restaurant Creator", path: "/restaurant-creator", glyph: "atom", hint: "Concept menus · premium", premium: true },
    ],
  },
  lab: {
    label: "Lab",
    path: "/lab",
    glyph: "orbital",
    sub: "Engine internals · premium",
    routes: [
      { label: "Recommendation Engine", path: "/lab", glyph: "orbital", hint: "Live signal flow · weights · overrides" },
      { label: "Lab Book", path: "/lab-book", glyph: "bookmark", hint: "Scan or paste recipes into your cookbook" },
      { label: "Planetary Chart", path: "/planetary-chart", glyph: "ring", hint: "Current transit · zoomable", premium: true },
      { label: "Current Chart", path: "/current-chart", glyph: "wave", hint: "Live sky × your natal" },
      { label: "Alchm Quantities", path: "/quantities", glyph: "crosshair", hint: "ESMS · Monica constants · P=IV" },
      { label: "Standing Chart", path: "/birth-chart", glyph: "diamond", hint: "Your natal · stored encrypted" },
      { label: "Premium", path: "/premium", glyph: "diamond", hint: "Tier picker · Alchemist subscription" },
    ],
  },
};

/**
 * Resolve the active primary key from a Next.js pathname. Lives here
 * because every nav surface needs the same mapping.
 */
export function activePrimaryFromPathname(pathname: string | null | undefined): PrimaryKey {
  if (!pathname || pathname === "/") return "kitchen";

  // Lab cluster
  if (
    pathname.startsWith("/lab") ||
    pathname.startsWith("/planetary-chart") ||
    pathname.startsWith("/birth-chart") ||
    pathname.startsWith("/current-chart") ||
    pathname.startsWith("/quantities") ||
    pathname.startsWith("/premium") ||
    pathname.startsWith("/upgrade") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/alchm")
  ) {
    return "lab";
  }

  // Commensal cluster
  if (
    pathname.startsWith("/commensal") ||
    pathname.startsWith("/feed") ||
    pathname.startsWith("/restaurant-creator")
  ) {
    return "commensal";
  }

  // Plan cluster
  if (
    pathname.startsWith("/menu-planner") ||
    pathname.startsWith("/meal-plan") ||
    pathname.startsWith("/pantry") ||
    pathname.startsWith("/food-tracking") ||
    pathname.startsWith("/grocery-cart") ||
    pathname.startsWith("/cosmic-recipe")
  ) {
    return "plan";
  }

  // Discover cluster
  if (
    pathname.startsWith("/discover") ||
    pathname.startsWith("/cuisines") ||
    pathname.startsWith("/ingredients") ||
    pathname.startsWith("/cooking-methods") ||
    pathname.startsWith("/sauces") ||
    pathname.startsWith("/recipes") ||
    pathname.startsWith("/recipe-generator") ||
    pathname.startsWith("/recipe-builder") ||
    pathname.startsWith("/restaurants")
  ) {
    return "discover";
  }

  return "kitchen";
}

export type FlatNavEntry = NavRoute & {
  /** Stable per-entry id; safe to use as a React key. */
  key: string;
  kind: "section" | "route";
  /** Parent section for child routes. */
  parent?: PrimaryKey;
};

/** Flat catalog of every nav entry for the command palette, with unique keys. */
export function getAllNavRoutes(): FlatNavEntry[] {
  const out: FlatNavEntry[] = [];
  const seen = new Set<string>();

  for (const key of PRIMARY_KEYS) {
    const section = NAV_IA[key];
    const sectionEntry: FlatNavEntry = {
      key: `section:${key}`,
      kind: "section",
      label: section.label,
      path: section.path,
      glyph: section.glyph,
      hint: section.sub,
    };
    out.push(sectionEntry);
    seen.add(`${sectionEntry.kind}:${sectionEntry.path}`);

    for (const route of section.routes) {
      // De-dupe: a child route whose path matches its parent section
      // (e.g. plan.path === plan.routes[0].path === "/menu-planner")
      // would otherwise produce two identical command-palette entries.
      const dedupeKey = `route:${route.path}`;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);
      out.push({
        key: `route:${key}:${route.path}`,
        kind: "route",
        parent: key,
        ...route,
      });
    }
  }
  return out;
}
