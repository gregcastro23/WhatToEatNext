/**
 * Types for the omnibar search core (docs/plans/omnibar-search-plan.md §4).
 *
 * Catalog *records* are the plain inputs (built from the data modules and the
 * live recipe catalog by ./catalogRecords); *entities* are what search ranks;
 * the omnibar *result* is what the API (Phase 2) will serialize.
 */
import type { Season } from "@/constants/seasons";
import type { PairingLink } from "@/lib/ingredients/pairings";
import type { DietaryVerdict } from "@/utils/ingredientDietaryClassification";
import type { MealIntent } from "./intentLexicon";

export type SearchKind = "ingredient" | "recipe" | "cuisine" | "method" | "sauce";

export interface ElementalVector {
  Fire: number;
  Water: number;
  Earth: number;
  Air: number;
}

/** Vegan and vegetarian verdicts from the canonical classifier. */
export interface DietVerdicts {
  vegan: DietaryVerdict;
  vegetarian: DietaryVerdict;
}

export interface IngredientRecord {
  key: string;
  /** Dossier URL slug (lib/ingredients/ingredientSlug). */
  slug: string;
  name: string;
  /** Keys and names of plural cards merged into this one ("bay leaves"). */
  aliases: readonly string[];
  category: string;
  seasons: readonly Season[];
  qualities: readonly string[];
  rulingPlanets: readonly string[];
  elemental: ElementalVector | null;
  imageUrl: string | null;
  /** The card's pairings, linked to their cards where the name is one. */
  pairings: readonly PairingLink[];
  diet: DietVerdicts;
}

export interface RecipeRecord {
  id: string;
  name: string;
  cuisine: string | null;
  /** Prep plus cook as authored (./authoredFacts); null = not stated. */
  totalMinutes: number | null;
  /** The meal the static catalog files the recipe under. */
  meals: readonly MealIntent[];
  imageUrl: string | null;
  ingredientLines: readonly string[];
}

/** A cuisine, cooking method or sauce: a name, a destination, extra spellings. */
export interface NamedRecord {
  key: string;
  name: string;
  href: string;
  terms: readonly string[];
}

export interface SearchCatalogs {
  ingredients: readonly IngredientRecord[];
  recipes: readonly RecipeRecord[];
  cuisines: readonly NamedRecord[];
  methods: readonly NamedRecord[];
  sauces: readonly NamedRecord[];
}

/**
 * Match strength, lower is better — each tier is one named rule (plan §4.2,
 * refined in Phase 1): 0 exact (name, compact, or stemmed), 1 whole words
 * contained, 2 word-boundary prefix, 3 mid-word contains, 4 edit distance 1,
 * 5 edit distance 2.
 */
export type MatchTier = 0 | 1 | 2 | 3 | 4 | 5;

/** Which string matched: the entity's name, one of its extra terms, or a synonym. */
export type MatchVia = "name" | "term" | "synonym";

export interface SearchEntity {
  kind: SearchKind;
  key: string;
  name: string;
  href: string;
}

export interface SearchHit {
  entity: SearchEntity;
  tier: MatchTier;
  via: MatchVia;
  /** The string that matched: the name, a term ("Béarnaise" for Hollandaise), or a synonym. */
  matched: string;
}

export interface IngredientHero {
  key: string;
  name: string;
  href: string;
  category: string;
  seasons: readonly Season[];
  inSeasonNow: boolean;
  qualities: readonly string[];
  rulingPlanets: readonly string[];
  elemental: ElementalVector | null;
  imageUrl: string | null;
  /** Distinct live recipes that use the ingredient. */
  recipeCount: number;
  pairings: readonly PairingLink[];
}

export interface RecipeRow {
  id: string;
  name: string;
  href: string;
  cuisine: string | null;
  totalMinutes: number | null;
  imageUrl: string | null;
}

/** A recipe that uses the hero ingredient; `alternative` = an "X or Y" line. */
export interface ContainingRecipeRow extends RecipeRow {
  alternative: boolean;
}

export interface Correction {
  from: string;
  to: string;
  basis: "synonym" | "mid-word" | "edit-distance";
}

/**
 * The best hit across every kind. `exact` = tier 0 (name, key, alias or
 * synonym equal to the query), which lets Enter open it directly.
 */
export interface TopHit extends SearchEntity {
  exact: boolean;
}

/**
 * One parsed intent, shown with the results. `applied` = it filtered them;
 * false for a suggestion (a region) or a claim the data can't verify.
 */
export interface IntentChip {
  kind: "diet" | "unverified" | "time" | "meal" | "season" | "planet" | "quality" | "category" | "region";
  label: string;
  basis: string;
  applied: boolean;
}

/** A recipe that uses several of the ingredients a query names (plan §3, multi-ingredient). */
export interface CoverageRow extends RecipeRow {
  uses: number;
  /** Names of the query's ingredients this recipe does not use. */
  missing: readonly string[];
}

export interface Coverage {
  /** The ingredients the query named, in its order. */
  of: readonly SearchEntity[];
  rows: readonly CoverageRow[];
  total: number;
}

export interface OmnibarResult {
  query: string;
  top: TopHit | null;
  corrected: Correction | null;
  hero: IngredientHero | null;
  recipesContaining: readonly ContainingRecipeRow[];
  /** Recipes that use the hero, after any filter; the hero's own count is unfiltered. */
  recipesContainingTotal: number;
  /** Chips for the query's intent; empty for a plain name search. */
  chips: readonly IntentChip[];
  coverage: Coverage | null;
  recipes: readonly RecipeRow[];
  ingredients: readonly SearchEntity[];
  cuisines: readonly SearchEntity[];
  methods: readonly SearchEntity[];
  sauces: readonly SearchEntity[];
  total: Record<SearchKind, number>;
}
