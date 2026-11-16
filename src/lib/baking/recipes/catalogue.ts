/**
 * The Baking Lab's catalogue of bakeable goods: the curated formulas (the four
 * archetypes and the goods added for categories the site's recipes leave
 * empty) and every served recipe that is a baked good — and the search over
 * them by name, category, cuisine and ingredient.
 *
 * @file src/lib/baking/recipes/catalogue.ts
 */
import { bakingIngredient } from "@/data/baking";
import { CURATED_GOODS } from "@/data/baking/curatedGoods";
import { BAKING_PRESETS } from "@/data/baking/presets";
import { convertRecipe, GOOD_CATEGORY_LABELS } from "./convertRecipe";
import type { BakingPreset } from "../formulaTypes";
import type { ConvertedGood, GoodCategory, RecipeSource } from "./sourceTypes";

export type CatalogueEntry =
  | { kind: "curated"; id: string; name: string; category: GoodCategory; cuisine: null; ingredients: readonly string[]; preset: BakingPreset }
  | { kind: "recipe"; id: string; name: string; category: GoodCategory; cuisine: string; ingredients: readonly string[]; source: RecipeSource; converted: ConvertedGood };

/** The category each curated formula belongs to. */
export const CURATED_CATEGORY: Readonly<Record<string, GoodCategory>> = {
  "sourdough-country-loaf": "bread",
  "brioche-loaf": "enriched-bread",
  "brown-butter-cookie": "cookie",
  "genoise-sponge": "cake",
  "buttermilk-muffin": "muffin",
  "fudgy-brownie": "bar",
  "whole-wheat-cracker": "cracker",
};

/** Every curated formula, archetypes first. */
export const CURATED_PRESETS: readonly BakingPreset[] = [...BAKING_PRESETS, ...CURATED_GOODS];

export function curatedEntries(): CatalogueEntry[] {
  return CURATED_PRESETS.map((preset) => ({
    kind: "curated",
    id: preset.id,
    name: preset.name,
    category: CURATED_CATEGORY[preset.id] ?? "bread",
    cuisine: null,
    ingredients: preset.formula.lines.map((l) => bakingIngredient(l.ingredientId).name),
    preset,
  }));
}

export function recipeEntries(sources: readonly RecipeSource[]): CatalogueEntry[] {
  return sources.map((source) => ({
    kind: "recipe",
    id: source.id,
    name: source.name,
    category: source.category,
    cuisine: source.cuisine,
    ingredients: source.lines.map((l) => l.name),
    source,
    converted: convertRecipe(source),
  }));
}

/** True when the lab can bake the entry: every curated good, and a recipe whose verdict allows it. */
export function isSimulable(entry: CatalogueEntry): boolean {
  return entry.kind === "curated" || entry.converted.report.verdict.simulable;
}

/** The lab inputs for an entry, or null for a refused recipe. */
export function presetOf(entry: CatalogueEntry): BakingPreset | null {
  return entry.kind === "curated" ? entry.preset : entry.converted.preset;
}

export interface CatalogueQuery {
  text: string;
  category: GoodCategory | "all";
  /** Hide recipes the lab refuses. */
  simulableOnly: boolean;
}

function fold(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
}

function haystack(entry: CatalogueEntry): string {
  return fold([entry.name, GOOD_CATEGORY_LABELS[entry.category], entry.category, entry.cuisine ?? "", ...entry.ingredients].join(" | "));
}

/**
 * The entries matching a query: every word of the text must appear in the
 * entry's name, category, cuisine or ingredients. Curated goods sort first,
 * then simulable recipes, then refused ones, each in catalogue order.
 */
export function filterCatalogue(entries: readonly CatalogueEntry[], query: CatalogueQuery): CatalogueEntry[] {
  const words = fold(query.text).split(/\s+/).filter((w) => w.length > 0);
  const rank = (e: CatalogueEntry): number => (e.kind === "curated" ? 0 : isSimulable(e) ? 1 : 2);
  return entries
    .filter((e) => query.category === "all" || e.category === query.category)
    .filter((e) => !query.simulableOnly || isSimulable(e))
    .filter((e) => {
      const hay = haystack(e);
      return words.every((w) => hay.includes(w));
    })
    .map((e, i) => ({ e, i }))
    .sort((a, b) => rank(a.e) - rank(b.e) || a.i - b.i)
    .map(({ e }) => e);
}

/** How many entries each category holds, for the category picker. */
export function categoryCounts(entries: readonly CatalogueEntry[]): Readonly<Record<GoodCategory, number>> {
  const counts: Record<GoodCategory, number> = { bread: 0, "enriched-bread": 0, flatbread: 0, "quick-bread": 0, muffin: 0, "biscuit-scone": 0, cookie: 0, bar: 0, cake: 0, cracker: 0, pastry: 0, "pie-tart": 0 };
  for (const e of entries) counts[e.category] += 1;
  return counts;
}
