/**
 * Query + server response → the omnibar's sections (plan §6, Phase 3).
 *
 * Order: local pages first (instant, D6), then the server's results with the
 * top hit's kind leading, then "see all". Merge rule: a page whose label is
 * the query ("pantry") suppresses the server's correction and hero, which
 * would otherwise be a fuzzy food match ("puff pastry").
 */
import { titleCase } from "@/lib/ingredients/dossierView";
import type { OmnibarResponse } from "@/lib/validation/searchSchemas";
import { matchNav, quickActions } from "./navMatches";
import {
  KIND_ICON,
  type LinkRow,
  type OmnibarCorrection,
  type OmnibarRow,
  type OmnibarSection,
  searchHref,
  type RowKind,
  type SearchStatus,
} from "./omnibarTypes";

export type ServerKind = OmnibarResponse["ingredients"][number]["kind"];
type RecipeWire = OmnibarResponse["recipes"][number];

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
}

export interface OmnibarModel {
  sections: OmnibarSection[];
  correction: OmnibarCorrection | null;
  exactNav: LinkRow | null;
}

function link(kind: RowKind, id: string, label: string, hint: string, href: string): LinkRow {
  return { type: "link", id, kind, label, hint, href, icon: KIND_ICON[kind], external: false };
}

function recipeRow(section: string, recipe: RecipeWire, alternative = false): LinkRow {
  const hint = `${(recipe.cuisine ?? "recipe").toUpperCase()}${alternative ? " · AS AN ALTERNATIVE" : ""}`;
  return link("recipe", `${section}:${recipe.id}`, recipe.name, hint, recipe.href);
}

function heroSections(response: OmnibarResponse): OmnibarSection[] {
  const { hero } = response;
  if (!hero) return [];
  const heroRow: OmnibarRow = {
    type: "hero",
    id: `hero:${hero.key}`,
    kind: "ingredient",
    label: titleCase(hero.name),
    hint: hero.category.toUpperCase(),
    href: hero.href,
    hero,
  };
  const containing = response.recipesContaining.slice(0, LIMITS.containing).map((r) => recipeRow("with", r, r.alternative));
  return [
    { id: "hero", title: "INGREDIENT", rows: [heroRow] },
    { id: "with", title: `RECIPES WITH ${hero.name.toUpperCase()} · ${hero.recipeCount}`, rows: containing },
  ];
}

function kindSections(response: OmnibarResponse, kind: ServerKind, withHero: boolean): OmnibarSection[] {
  if (kind === "recipe") {
    const shown = new Set(withHero ? response.recipesContaining.map((r) => r.id) : []);
    const rows = response.recipes.filter((r) => !shown.has(r.id)).slice(0, LIMITS.perKind).map((r) => recipeRow("recipes", r));
    return [{ id: "recipes", title: KIND_TITLE.recipe, rows }];
  }
  const list = { ingredient: response.ingredients, cuisine: response.cuisines, method: response.methods, sauce: response.sauces }[kind];
  const rows = list
    .slice(0, LIMITS.perKind)
    .map((e) => link(kind, `${kind}:${e.key}`, kind === "ingredient" ? titleCase(e.name) : e.name, KIND_HINT[kind], e.href));
  const hero = kind === "ingredient" && withHero ? heroSections(response) : [];
  return [...hero, { id: kind, title: KIND_TITLE[kind], rows }];
}

/** Kinds in display order: the top hit's kind first, then the rest in a fixed order. */
export function orderedKinds(response: OmnibarResponse): readonly ServerKind[] {
  const lead = response.top?.kind;
  return lead ? [lead, ...KIND_ORDER.filter((k) => k !== lead)] : KIND_ORDER;
}

function serverSections(response: OmnibarResponse, suppressHero: boolean): OmnibarSection[] {
  return orderedKinds(response)
    .flatMap((kind) => kindSections(response, kind, !suppressHero))
    .filter((s) => s.rows.length > 0);
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

export function buildOmnibarModel({ query, response, status, recent }: OmnibarModelInput): OmnibarModel {
  const trimmed = query.trim();
  if (!trimmed) return { sections: emptyQuerySections(recent), correction: null, exactNav: null };
  const nav = matchNav(trimmed, LIMITS.pages);
  const pages: OmnibarSection[] = nav.rows.length > 0 ? [{ id: "pages", title: "PAGES", rows: nav.rows }] : [];
  const server = response ? serverSections(response, nav.exact !== null) : [];
  const sections = [...pages, ...server, ...tailSections(trimmed, status, server.length === 0, pages.length === 0)];
  const correction = nav.exact === null && response ? response.corrected : null;
  return { sections, correction, exactNav: nav.exact };
}

export interface EnterTarget {
  href: string;
  /** Footer hint: what ↵ will do. */
  label: string;
}

/**
 * Kinds whose href is the hit's own page. Every sauce links to the shared
 * /sauces page until Phase 4 adds `?focus=`, so Enter on "carbonara" (an
 * exact sauce) would land on a page that has lost the query.
 */
const OWN_PAGE: Record<ServerKind, boolean> = { ingredient: true, recipe: true, cuisine: true, method: true, sauce: false };

/**
 * Smart Enter (owner decision, round 2): an exact page or an exact top hit
 * opens directly; anything else goes to the full results page.
 */
export function smartEnterTarget(query: string, exactNav: LinkRow | null, response: OmnibarResponse | null): EnterTarget {
  if (exactNav) return { href: exactNav.href, label: `OPEN ${exactNav.label.toUpperCase()}` };
  const best = response?.top;
  if (best?.exact && OWN_PAGE[best.kind]) return { href: best.href, label: `OPEN ${titleCase(best.name).toUpperCase()}` };
  return { href: searchHref(query), label: "ALL RESULTS" };
}
