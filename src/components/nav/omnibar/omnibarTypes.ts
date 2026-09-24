/**
 * The omnibar's row model (plan §6, issue #870). Every visible row, whether a
 * page, a recipe or the ingredient hero, is one option in a single listbox,
 * so the keyboard walks one flat list.
 */
import type { GlyphName } from "@/components/ui/alchm/Glyph";
import type { OmnibarResponse } from "@/lib/validation/searchSchemas";

export type OmnibarHero = NonNullable<OmnibarResponse["hero"]>;
export type OmnibarCorrection = NonNullable<OmnibarResponse["corrected"]>;

export type RowKind = "page" | "ingredient" | "recipe" | "cuisine" | "method" | "sauce" | "search";

interface RowBase {
  /** Unique within one render; a React key, not a DOM id. */
  id: string;
  kind: RowKind;
  label: string;
  hint: string;
  href: string;
}

export interface LinkRow extends RowBase {
  type: "link";
  icon: GlyphName;
  external: boolean;
}

export interface HeroRow extends RowBase {
  type: "hero";
  hero: OmnibarHero;
}

export type OmnibarRow = LinkRow | HeroRow;

export interface OmnibarSection {
  id: string;
  /** Empty for the trailing "see all" row. */
  title: string;
  rows: OmnibarRow[];
}

/** idle = no query; loading = the current query's results have not arrived. */
export type SearchStatus = "idle" | "loading" | "ready" | "error";

export const KIND_ICON: Record<RowKind, GlyphName> = {
  page: "arrow",
  ingredient: "diamond",
  recipe: "bookmark",
  cuisine: "ring",
  method: "triangle-up-bar",
  sauce: "wave",
  search: "search",
};

/** DOM id of the option at a flat index; the input's aria-activedescendant. */
export function optionId(listboxId: string, index: number): string {
  return `${listboxId}-opt-${index}`;
}

/** The full results page for a query (noindex; plan §9 round 1). */
export function searchHref(query: string): string {
  return `/search?q=${encodeURIComponent(query.trim())}`;
}
