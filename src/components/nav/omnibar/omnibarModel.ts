/**
 * Query + server response → the omnibar's sections (plan §6, Phases 3–4).
 *
 * Order: local pages first (instant, D6), then the server's results with the
 * top hit's kind leading, then "see all". Merge rule: a page whose label is
 * the query ("pantry") suppresses the server's correction and hero, which
 * would otherwise be a fuzzy food match ("puff pastry").
 */
import { titleCase } from "@/lib/ingredients/dossierView";
import type { OmnibarResponse } from "@/lib/validation/searchSchemas";
import { matchNav, quickActions } from "./navMatches";
import { heroSections, NO_HERO_STATE, type HeroState } from "./omnibarHero";
import { coverageSection, link, recipeRow } from "./omnibarRows";
import { searchHref, type LinkRow, type OmnibarChip, type OmnibarCorrection, type OmnibarSection, type SearchStatus } from "./omnibarTypes";

export type ServerKind = OmnibarResponse["ingredients"][number]["kind"];

/** Dropdown row caps; `/search` lists everything. */
export const LIMITS: Readonly<Record<"pages" | "recent" | "containing" | "perKind", number>> = {
  pages: 4,
  recent: 5,
  containing: 5,
  perKind: 4,
};

const KIND_ORDER: readonly ServerKind[] = ["ingredient", "recipe", "cuisine", "method", "sauce"];
export const KIND_TITLE: Record<ServerKind, string> = {
  ingredient: "INGREDIENTS",
  recipe: "RECIPES",
  cuisine: "CUISINES",
  method: "COOKING METHODS",
  sauce: "SAUCES",
};
export const KIND_HINT: Record<ServerKind, string> = {
  ingredient: "INGREDIENT",
  recipe: "RECIPE",
  cuisine: "CUISINE",
  method: "COOKING METHOD",
  sauce: "SAUCE",
};

export interface OmnibarModelInput {
  query: string;
  response: OmnibarResponse | null;
  status: SearchStatus;
  recent: readonly LinkRow[];
  /** Pantry contents and the open pairings list, for the hero's actions. */
  heroState?: HeroState;
}

export interface OmnibarModel {
  sections: OmnibarSection[];
  correction: OmnibarCorrection | null;
  /** The query's intent, as the server read it; none when a page matched exactly. */
  chips: readonly OmnibarChip[];
  exactNav: LinkRow | null;
}

function kindSections(response: OmnibarResponse, kind: ServerKind, hero: HeroState | null): OmnibarSection[] {
  if (kind === "recipe") {
    const listed = [...(hero ? response.recipesContaining : []), ...(response.coverage?.rows ?? [])];
    const shown = new Set(listed.map((r) => r.id));
    const rows = response.recipes.filter((r) => !shown.has(r.id)).slice(0, LIMITS.perKind).map((r) => recipeRow("recipes", r));
    return [{ id: "recipes", title: KIND_TITLE.recipe, rows }];
  }
  const list = { ingredient: response.ingredients, cuisine: response.cuisines, method: response.methods, sauce: response.sauces }[kind];
  const rows = list
    .slice(0, LIMITS.perKind)
    .map((e) => link(kind, `${kind}:${e.key}`, kind === "ingredient" ? titleCase(e.name) : e.name, KIND_HINT[kind], e.href));
  const heroes = kind === "ingredient" && hero ? heroSections(response, hero, LIMITS.containing) : [];
  return [...heroes, { id: kind, title: KIND_TITLE[kind], rows }];
}

/** Kinds in display order: the top hit's kind first, then the rest in a fixed order. */
export function orderedKinds(response: OmnibarResponse): readonly ServerKind[] {
  const lead = response.top?.kind;
  return lead ? [lead, ...KIND_ORDER.filter((k) => k !== lead)] : KIND_ORDER;
}

/** `hero` null = the merge rule suppressed it. Several named ingredients lead with their recipes together. */
function serverSections(response: OmnibarResponse, hero: HeroState | null): OmnibarSection[] {
  return [...coverageSection(response.coverage, LIMITS.containing), ...orderedKinds(response).flatMap((kind) => kindSections(response, kind, hero))].filter(
    (s) => s.rows.length > 0,
  );
}

/** D5: zero results still offer a next step. */
function noMatchSection(query: string): OmnibarSection {
  return {
    id: "none",
    title: `NO MATCHES FOR “${query.toUpperCase()}”`,
    rows: [
      link("page", "none:generator", "Invent a recipe with the generator", "RECIPE GENERATOR", "/recipe-generator"),
      link("recipe", "none:recipes", "Browse all recipes", "RECIPES", "/recipes"),
      link("ingredient", "none:ingredients", "Browse all ingredients", "INGREDIENTS", "/ingredients"),
    ],
  };
}

function emptyQuerySections(recent: readonly LinkRow[]): OmnibarSection[] {
  const sections: OmnibarSection[] = [];
  if (recent.length > 0) sections.push({ id: "recent", title: "RECENT", rows: recent.slice(0, LIMITS.recent) });
  sections.push({ id: "actions", title: "QUICK ACTIONS", rows: [...quickActions()] });
  return sections;
}

/** "See all", unless the search came back empty: then D5's next steps, or nothing when a page matched. */
function tailSections(query: string, status: SearchStatus, noServer: boolean, noPages: boolean): OmnibarSection[] {
  if (status !== "ready" || !noServer) {
    return [{ id: "all", title: "", rows: [link("search", "all", `See all results for “${query}”`, "SEARCH", searchHref(query))] }];
  }
  return noPages ? [noMatchSection(query)] : [];
}

export function buildOmnibarModel({ query, response, status, recent, heroState = NO_HERO_STATE }: OmnibarModelInput): OmnibarModel {
  const trimmed = query.trim();
  if (!trimmed) return { sections: emptyQuerySections(recent), correction: null, chips: [], exactNav: null };
  const nav = matchNav(trimmed, LIMITS.pages);
  const pages: OmnibarSection[] = nav.rows.length > 0 ? [{ id: "pages", title: "PAGES", rows: nav.rows }] : [];
  const server = response ? serverSections(response, nav.exact === null ? heroState : null) : [];
  const sections = [...pages, ...server, ...tailSections(trimmed, status, server.length === 0, pages.length === 0)];
  const correction = nav.exact === null && response ? response.corrected : null;
  const chips = nav.exact === null && response ? response.chips : [];
  return { sections, correction, chips, exactNav: nav.exact };
}

export interface EnterTarget {
  href: string;
  /** Footer hint: what ↵ will do. */
  label: string;
}

/**
 * Smart Enter (owner decision, round 2): an exact page or an exact top hit
 * opens directly; anything else goes to the full results page. Every kind now
 * has its own page: a sauce opens focused on /sauces (Phase 4).
 */
export function smartEnterTarget(query: string, exactNav: LinkRow | null, response: OmnibarResponse | null): EnterTarget {
  if (exactNav) return { href: exactNav.href, label: `OPEN ${exactNav.label.toUpperCase()}` };
  const best = response?.top;
  if (best?.exact) return { href: best.href, label: `OPEN ${titleCase(best.name).toUpperCase()}` };
  return { href: searchHref(query), label: "ALL RESULTS" };
}
