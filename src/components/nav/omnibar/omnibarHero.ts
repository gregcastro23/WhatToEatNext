/**
 * The ingredient hero's sections (plan §6, Phase 4): the card; its actions,
 * Cook with this / Add to pantry / Show pairings (owner decision, round 2);
 * its pairings while shown; then the recipes that use it.
 */
import type { GlyphName } from "@/components/ui/alchm/Glyph";
import { titleCase } from "@/lib/ingredients/dossierView";
import { cookHref } from "@/lib/recipe-builder/prefillLink";
import type { OmnibarResponse } from "@/lib/validation/searchSchemas";
import { link, recipeRow } from "./omnibarRows";
import {
  searchHref,
  type ActionRow,
  type HeroActionKind,
  type HeroRow,
  type OmnibarHero,
  type OmnibarSection,
} from "./omnibarTypes";

export interface HeroState {
  /** Lowercased names in the local pantry. */
  pantry: ReadonlySet<string>;
  /** The hero whose pairings are showing, by key. */
  pairingsFor: string | null;
}

export const NO_HERO_STATE: HeroState = { pantry: new Set(), pairingsFor: null };

export function inPantry(hero: OmnibarHero, state: HeroState): boolean {
  return state.pantry.has(hero.name.toLowerCase());
}

interface ActionSpec {
  action: HeroActionKind;
  label: string;
  hint: string;
  href: string;
  icon: GlyphName;
  pressed: boolean;
}

function actionRow(hero: OmnibarHero, spec: ActionSpec): ActionRow {
  return { type: "action", id: `act:${spec.action}:${hero.key}`, kind: "page", hero, ...spec };
}

function heroActions(hero: OmnibarHero, state: HeroState): ActionRow[] {
  const stocked = inPantry(hero, state);
  const open = state.pairingsFor === hero.key;
  const specs: ActionSpec[] = [
    { action: "cook", label: "Cook with this", hint: "RECIPE BUILDER", href: cookHref(hero.name), icon: "flask", pressed: false },
    { action: "pantry", label: stocked ? "In your pantry" : "Add to pantry", hint: "PANTRY", href: "/pantry", icon: "mortar", pressed: stocked },
  ];
  if (hero.pairings.length > 0) {
    const label = open ? "Hide pairings" : `Show pairings · ${hero.pairings.length}`;
    specs.push({ action: "pairings", label, hint: "PAIRINGS", href: `${hero.href}#pairings`, icon: "ring", pressed: open });
  }
  return specs.map((spec) => actionRow(hero, spec));
}

/** A pairing links to its card, or searches for the name when it is no card. */
function pairingSection(hero: OmnibarHero): OmnibarSection {
  const rows = hero.pairings.map(({ name, href }) =>
    href === null
      ? link("search", `pair:${name}`, titleCase(name), "SEARCH", searchHref(name))
      : link("ingredient", `pair:${href}`, titleCase(name), "INGREDIENT", href),
  );
  return { id: "pairings", title: `PAIRS WITH ${hero.name.toUpperCase()}`, rows };
}

export function heroSections(response: OmnibarResponse, state: HeroState, containing: number): OmnibarSection[] {
  const { hero } = response;
  if (!hero) return [];
  const name = titleCase(hero.name);
  const heroRow: HeroRow = { type: "hero", id: `hero:${hero.key}`, kind: "ingredient", label: name, hint: hero.category.toUpperCase(), href: hero.href, hero };
  const withRows = response.recipesContaining.slice(0, containing).map((r) => recipeRow("with", r, r.alternative));
  return [
    { id: "hero", title: "INGREDIENT", rows: [heroRow] },
    { id: "hero-actions", title: "", rows: heroActions(hero, state), layout: "chips", label: `Actions for ${name}` },
    ...(state.pairingsFor === hero.key ? [pairingSection(hero)] : []),
    { id: "with", title: `RECIPES WITH ${hero.name.toUpperCase()} · ${response.recipesContainingTotal ?? hero.recipeCount}`, rows: withRows },
  ];
}
