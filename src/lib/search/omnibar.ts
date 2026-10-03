/**
 * Query → omnibar result (plan §4.4): did-you-mean, an ingredient hero card,
 * the recipes that use it, and ranked hits per kind. A query with intent
 * ("vegan pasta", "spinach eggs feta", "mercury herbs") goes through
 * ./omnibarIntent (Phase 5).
 */
import { hasIntent, parseIntent, type QueryIntent } from "./intent";
import { searchWithIntent } from "./omnibarIntent";
import {
  containingRows,
  correctionFor,
  countKinds,
  DEFAULT_CONTAINING,
  DEFAULT_PER_KIND,
  emptyResult,
  entitiesOf,
  heroFor,
  recipeRowsOf,
  seasonOf,
} from "./omnibarParts";
import { rankEntities } from "./rank";
import { normalizeText, type NormalizedText } from "./text";
import type { SearchIndex } from "./searchIndex";
import type { OmnibarResult, SearchHit } from "./types";

export { containingRows, DEFAULT_CONTAINING } from "./omnibarParts";

export interface OmnibarOptions {
  /** Injected so "in season now" is testable. */
  now: Date;
  perKindLimit?: number;
  containingLimit?: number;
}

/**
 * A query is read for intent unless it is exactly a name of any kind
 * ("spring rolls", "eggs"). Names that merely contain the words ("Quick
 * Bread" for "quick bread") are kept by ./omnibarIntent ahead of the filters.
 */
function intentFor(index: SearchIndex, query: NormalizedText, top: SearchHit | undefined, now: Date): QueryIntent | null {
  if (query.tokens.length === 0 || top?.tier === 0) return null;
  const intent = parseIntent(query.tokens, index.exactIngredient, seasonOf(now));
  return hasIntent(intent) ? intent : null;
}

function plainResult(index: SearchIndex, query: string, hits: readonly SearchHit[], options: OmnibarOptions): OmnibarResult {
  const [top] = hits;
  if (!top) return emptyResult(query);
  const perKind = options.perKindLimit ?? DEFAULT_PER_KIND;
  const hero = heroFor(index, top, options.now);
  const containing = hero ? containingRows(index, hero.key, options.containingLimit ?? DEFAULT_CONTAINING) : { rows: [], total: 0 };
  return {
    ...emptyResult(query),
    top: { ...top.entity, exact: top.tier === 0 },
    corrected: correctionFor(top, query),
    hero,
    recipesContaining: containing.rows,
    recipesContainingTotal: containing.total,
    recipes: recipeRowsOf(index, entitiesOf(hits, "recipe", perKind, null)),
    ingredients: entitiesOf(hits, "ingredient", perKind, hero?.key ?? null),
    cuisines: entitiesOf(hits, "cuisine", perKind, null),
    methods: entitiesOf(hits, "method", perKind, null),
    sauces: entitiesOf(hits, "sauce", perKind, null),
    total: countKinds(hits),
  };
}

export function searchOmnibar(index: SearchIndex, rawQuery: string, options: OmnibarOptions): OmnibarResult {
  const query = rawQuery.trim();
  const normalized = normalizeText(query);
  const hits = rankEntities(index, normalized);
  const intent = intentFor(index, normalized, hits[0], options.now);
  return intent ? searchWithIntent(index, { query, hits, intent }, options) : plainResult(index, query, hits, options);
}
