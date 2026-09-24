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

/** The hero's actions (plan §7 Phase 4). */
export type HeroActionKind = "cook" | "pantry" | "pairings";

/**
 * A hero action. `cook` navigates to `href`; `pantry` adds the card to the
 * local pantry, or opens the pantry once it is there; `pairings` shows or
 * hides the card's pairings in place.
 */
export interface ActionRow extends RowBase {
  type: "action";
  action: HeroActionKind;
  icon: GlyphName;
  /** For the hero's own facts: the card the action is about. */
  hero: OmnibarHero;
  /** pantry: already in the pantry. pairings: the list is showing. */
  pressed: boolean;
}

export type OmnibarRow = LinkRow | HeroRow | ActionRow;

export interface OmnibarSection {
  id: string;
  /** Empty for the trailing "see all" row and the action chips. */
  title: string;
  rows: OmnibarRow[];
  /** "chips": one horizontal row (the hero's actions), labelled for screen readers. */
  layout?: "chips";
  label?: string;
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
