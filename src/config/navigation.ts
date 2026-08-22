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
 * ## The Lab split (Kitchen Lab / Celestial Lab)
 *
 * A single `lab` section used to hold eight routes spanning four unrelated
 * concerns: kitchen thermodynamics (`/lab`), celestial mechanics
 * (`/planetary-chart`, `/current-chart`, `/birth-chart`), the alchm quantity
 * system (`/quantities`) and the token economy (`/vault`). Users could not
 * tell which computational model they were looking at, because the IA itself
 * did not distinguish them.
 *
 * It is now two sections along the axis that actually matters — the SUBJECT
 * being modelled (a pan of food vs the sky) — and every leaf declares which
 * COMPUTATIONAL SYSTEM produces its numbers via `system`. That field is what
 * drives the persistent badges in the lab layouts, so a page can never
 * disagree with the nav about which model it is running.
 *
 * @file src/config/navigation.ts
 */

import type { GlyphName } from "@/components/ui/alchm/Glyph";

export type PrimaryKey =
  | "kitchen"
  | "discover"
  | "plan"
  | "commensal"
  | "kitchenLab"
  | "celestialLab";

/**
 * Which computational model produces the numbers on a route.
 *
 * - `real`  — SI-unit physics. Reproducible against cited literature or an
 *             ephemeris; a physicist would recognise every quantity.
 * - `alchm` — the alchm model (ESMS, kalchm, monica, elemental values).
 *             Internally consistent and load-bearing for the economy, but not
 *             a claim about measurable reality.
 *
 * Deliberately has no "mixed" member. A surface that renders both is a
 * surface to SPLIT, not to label — the whole point of the split is that a
 * reader always knows which system they are reading.
 */
export type ComputationalSystem = "real" | "alchm";

export interface NavRoute {
  label: string;
  path: string;
  glyph: GlyphName;
  hint: string;
  external?: boolean;
  premium?: boolean;
  /** Present on lab leaves; absent on ordinary product routes. */
  system?: ComputationalSystem;
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
  "kitchenLab",
  "celestialLab",
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
      { label: "Tilt Skillet Planner", path: "/cooking-methods/tilt-skillet", glyph: "crosshair", hint: "Large-batch planning · recipe-as-a-circuit" },
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
  // PrimaryKey stays "commensal" (avoids rippling through every consumer); the
  // section is relabeled to Tables (PR 6 §5).
  commensal: {
    label: "Tables",
    path: "/tables",
    glyph: "ring",
    sub: "Break bread — live tables, kindred alchemists",
    routes: [
      { label: "Tables Home", path: "/tables", glyph: "ring", hint: "Your tables · plan, live, memory" },
      { label: "Discover Tables & People", path: "/discover?tab=tables", glyph: "atom", hint: "Nearby tables · kindred alchemists" },
      { label: "Dinner Party", path: "/commensal", glyph: "ring", hint: "Guest harmonization · up to 12" },
      { label: "Live Feed", path: "/feed", glyph: "wave", hint: "What practitioners are cooking now" },
      { label: "Restaurant Creator", path: "/restaurant-creator", glyph: "atom", hint: "Concept menus · ESMS tokens" },
    ],
  },
  kitchenLab: {
    label: "Kitchen Lab",
    path: "/kitchen-lab",
    glyph: "flask",
    sub: "Thermodynamics of a pan of food — measured, then alchemized",
    routes: [
      { label: "Lab Overview", path: "/kitchen-lab", glyph: "flask", hint: "Both models side by side · what each answers" },
      { label: "Real Physics", path: "/kitchen-lab/physics", glyph: "triangle-up-bar", hint: "Heat transfer · latent heat · medium boundaries", system: "real" },
      { label: "Alchm Physics", path: "/kitchen-lab/alchm", glyph: "spiral", hint: "Ingredient ESMS · kalchm · monica", system: "alchm" },
      { label: "Lab Book", path: "/kitchen-lab/lab-book", glyph: "bookmark", hint: "Scan or paste recipes into your cookbook", system: "alchm" },
      { label: "Grimoire", path: "/grimoire", glyph: "mortar", hint: "The practices · today's resonance · your feats", system: "alchm" },
    ],
  },
  celestialLab: {
    label: "Celestial Lab",
    path: "/celestial-lab",
    glyph: "orbital",
    sub: "Mechanics of the sky — ephemeris, then ESMS",
    routes: [
      { label: "Lab Overview", path: "/celestial-lab", glyph: "orbital", hint: "Both models side by side · what each answers" },
      { label: "Celestial Mechanics", path: "/celestial-lab/mechanics", glyph: "ring", hint: "Free-body diagrams of the current sky", system: "real" },
      { label: "Current Transits", path: "/celestial-lab/current-chart", glyph: "wave", hint: "Live sky × your natal", system: "real" },
      { label: "Standing Chart", path: "/celestial-lab/standing-chart", glyph: "diamond", hint: "Your natal · stored encrypted", system: "real" },
      { label: "Alchm Quantities", path: "/celestial-lab/alchm", glyph: "crosshair", hint: "ESMS · Monica constants · P=IV", system: "alchm" },
      { label: "ESMS Vault", path: "/vault", glyph: "diamond", hint: "Token balances · daily Cosmic Yield", system: "alchm" },
    ],
  },
};

/**
 * Legacy lab paths and where they now live.
 *
 * Exported because three consumers need the SAME mapping and must not drift:
 * the `redirects()` block in next.config.js (server-side 307s), any client
 * component still holding a hardcoded legacy href, and the tests that prove
 * every legacy path still resolves. Keeping it here means a future move edits
 * one table.
 */
export const LEGACY_LAB_REDIRECTS: Readonly<Record<string, string>> = {
  "/lab": "/kitchen-lab",
  "/lab-book": "/kitchen-lab/lab-book",
  "/planetary-chart": "/celestial-lab/mechanics",
  "/current-chart": "/celestial-lab/current-chart",
  "/birth-chart": "/celestial-lab/standing-chart",
  "/quantities": "/celestial-lab/alchm",
};

/**
 * Resolve the active primary key from a Next.js pathname. Lives here
 * because every nav surface needs the same mapping.
 *
 * Legacy lab paths still map to their new section. A 307 fires before most
 * users ever render a header on one, but an in-flight client transition can
 * evaluate this against the OLD path, and highlighting nothing for one frame
 * reads as a broken header.
 */
export function activePrimaryFromPathname(pathname: string | null | undefined): PrimaryKey {
  if (!pathname || pathname === "/") return "kitchen";

  // Kitchen Lab cluster — thermodynamics of food, plus the practice surfaces.
  if (
    pathname.startsWith("/kitchen-lab") ||
    pathname.startsWith("/lab-book") ||
    pathname.startsWith("/grimoire") ||
    // `/lab` must be tested AFTER `/lab-book`; a bare startsWith("/lab")
    // swallows it. Both land in kitchenLab today, so the order is currently
    // unobservable — it stops being unobservable the moment one of them moves.
    pathname.startsWith("/lab")
  ) {
    return "kitchenLab";
  }

  // Celestial Lab cluster — the sky, the alchm quantity system, the vault.
  if (
    pathname.startsWith("/celestial-lab") ||
    pathname.startsWith("/planetary-chart") ||
    pathname.startsWith("/current-chart") ||
    pathname.startsWith("/birth-chart") ||
    pathname.startsWith("/quantities") ||
    pathname.startsWith("/vault") ||
    pathname.startsWith("/alchm")
  ) {
    return "celestialLab";
  }

  // Commensal cluster (relabeled "Tables") — the Table entity + its landing
  // token pages join it (PR 6 §5).
  if (
    pathname.startsWith("/commensal") ||
    pathname.startsWith("/tables") ||
    pathname.startsWith("/t/") ||
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

/**
 * Resolve which computational system a lab pathname is running, or null when
 * the route is not a lab leaf (an overview, or an ordinary product route).
 *
 * Reads NAV_IA rather than re-listing paths, so a badge can never claim a
 * system the nav disagrees with. Longest-match wins, because a nested leaf
 * must beat any shorter ancestor that also declares a system.
 *
 * `ia` exists for tests. With today's NAV_IA no two system-bearing routes
 * overlap — the overviews carry no `system` and are skipped — so the
 * longest-match branch is UNREACHABLE against the real data, and a test
 * written against NAV_IA passes identically if the tie-break is deleted
 * (verified: mutating it to first-match left all assertions green). The
 * parameter lets the test inject an IA where two system-bearing routes really
 * do collide, which is the only way to prove the tie-break does anything.
 */
export function systemFromPathname(
  pathname: string | null | undefined,
  ia: NavIA = NAV_IA,
): ComputationalSystem | null {
  if (!pathname) return null;

  let best: { len: number; system: ComputationalSystem } | null = null;
  for (const key of PRIMARY_KEYS) {
    for (const route of ia[key].routes) {
      if (!route.system) continue;
      if (pathname !== route.path && !pathname.startsWith(`${route.path}/`)) continue;
      if (!best || route.path.length > best.len) {
        best = { len: route.path.length, system: route.system };
      }
    }
  }
  return best?.system ?? null;
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
