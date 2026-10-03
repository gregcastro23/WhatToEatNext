/**
 * The omnibar result for a query with intent (plan §3, Phase 5). The name
 * search runs on the text left after intent words; recipe intents filter
 * recipes, ingredient intents filter cards, and a query that is only intent
 * ("quick vegan", "mercury herbs") lists everything that passes, A→Z.
 *
 * Enter never opens a single result here: `top.exact` is false, so Smart
 * Enter goes to /search, where the chips stay visible.
 */
import { coverageFor } from "./coverage";
import { hasIngredientIntent, hasRecipeIntent, type QueryIntent } from "./intent";
import { ingredientFilter, intentChips, recipeFilter, type Keep } from "./intentFilter";
import { containingRows, correctionFor, DEFAULT_CONTAINING, DEFAULT_PER_KIND, emptyResult, heroFor, recipeRowsOf } from "./omnibarParts";
import { rankEntities } from "./rank";
import { normalizeText } from "./text";
import type { OmnibarOptions } from "./omnibar";
import type { SearchIndex } from "./searchIndex";
import type { Coverage, OmnibarResult, SearchEntity, SearchHit, SearchKind } from "./types";

export interface IntentSearch {
  query: string;
  /** Hits for the whole query, reused when no intent word left it. */
  hits: readonly SearchHit[];
  intent: QueryIntent;
}

interface Lists {
  recipes: SearchEntity[];
  ingredients: SearchEntity[];
  cuisines: SearchEntity[];
  methods: SearchEntity[];
  sauces: SearchEntity[];
}


function unique(entities: readonly SearchEntity[]): SearchEntity[] {
  const byId = new Map<string, SearchEntity>();
  for (const entity of entities) if (!byId.has(`${entity.kind}:${entity.key}`)) byId.set(`${entity.kind}:${entity.key}`, entity);
  return [...byId.values()];
}

/** Everything of a kind the intent keeps, A→Z on the folded name, so quotes and case don't reorder it. */
function allOf(index: SearchIndex, kind: SearchKind, keep: Keep): SearchEntity[] {
  return index.entities
    .filter(({ entity }) => entity.kind === kind && keep(entity.key))
    .map(({ entity, texts }) => ({ entity, folded: texts[0]?.text.folded ?? entity.name }))
    .sort((a, b) => a.folded.localeCompare(b.folded))
    .map(({ entity }) => entity);
}

/**
 * Per kind: names containing the whole query as typed ("Quick Bread" for
 * "quick bread"), unfiltered because they are what was typed; then the text
 * hits that pass the filters, or with no text, everything the intent keeps.
 */
function listsFor(index: SearchIndex, search: IntentSearch, hits: readonly SearchHit[], keep: { recipe: Keep; ingredient: Keep }): Lists {
  const { intent } = search;
  // Only beside search words: a query of intent words alone lists exactly what the filters keep.
  const literal = intent.text === "" ? [] : search.hits.filter((h) => h.tier <= 1);
  const of = (kind: SearchKind): SearchEntity[] => unique([...literal, ...hits].filter((h) => h.entity.kind === kind).map((h) => h.entity));
  const lists: Lists = { recipes: of("recipe"), ingredients: of("ingredient"), cuisines: of("cuisine"), methods: of("method"), sauces: of("sauce") };
  if (intent.text === "" && hasRecipeIntent(intent)) lists.recipes = allOf(index, "recipe", keep.recipe);
  if (intent.text === "" && hasIngredientIntent(intent)) lists.ingredients = allOf(index, "ingredient", keep.ingredient);
  const region = intent.region ? index.entities.find((e) => e.entity.kind === "cuisine" && e.entity.key === intent.region?.cuisine) : undefined;
  if (region) lists.cuisines = unique([region.entity, ...lists.cuisines]);
  return lists;
}

/** The ingredients the query named lead the ingredient list, even when no recipe uses them together. */
function withNamed(lists: Lists, coverage: Coverage | null): Lists {
  return coverage ? { ...lists, ingredients: unique([...coverage.of, ...lists.ingredients]) } : lists;
}

function textHits(index: SearchIndex, search: IntentSearch, keep: { recipe: Keep; ingredient: Keep }): SearchHit[] {
  const text = normalizeText(search.intent.text);
  const hits = text.folded === normalizeText(search.query).folded ? search.hits : text.folded ? rankEntities(index, text) : [];
  return hits.filter(({ entity }) => (entity.kind === "recipe" ? keep.recipe(entity.key) : entity.kind === "ingredient" ? keep.ingredient(entity.key) : true));
}

/** Enter goes to /search for any intent query; the first thing listed stands as the top hit. */
function topOf(hits: readonly SearchHit[], coverage: Coverage | null, lists: Lists): SearchEntity | null {
  const [first] = hits;
  if (first) return first.entity;
  const [covered] = coverage?.rows ?? [];
  if (covered) return { kind: "recipe", key: covered.id, name: covered.name, href: covered.href };
  return lists.recipes[0] ?? lists.ingredients[0] ?? lists.cuisines[0] ?? null;
}

export function searchWithIntent(index: SearchIndex, search: IntentSearch, options: OmnibarOptions): OmnibarResult {
  const { query, intent } = search;
  const perKind = options.perKindLimit ?? DEFAULT_PER_KIND;
  const containingLimit = options.containingLimit ?? DEFAULT_CONTAINING;
  const keep = { recipe: recipeFilter(index, intent), ingredient: ingredientFilter(index, intent) };
  const hits = textHits(index, search, keep);
  const coverage = intent.ingredients.length > 1 ? coverageFor(index, intent.ingredients, keep.recipe, containingLimit) : null;
  const lists = withNamed(listsFor(index, search, hits, keep), coverage);
  const [textTop] = hits;
  const hero = textTop && coverage === null ? heroFor(index, textTop, options.now) : null;
  const containing = hero ? containingRows(index, hero.key, containingLimit, keep.recipe) : { rows: [], total: 0 };
  const top = topOf(hits, coverage, lists);
  if (!top) return { ...emptyResult(query), chips: intentChips(intent, (key) => key) };
  const ingredients = lists.ingredients.filter((e) => e.key !== hero?.key);
  return {
    ...emptyResult(query),
    top: { ...top, exact: false },
    corrected: textTop ? correctionFor(textTop, intent.text) : null,
    hero,
    recipesContaining: containing.rows,
    recipesContainingTotal: containing.total,
    chips: intentChips(intent, (key) => lists.cuisines.find((c) => c.key === key)?.name ?? key),
    coverage,
    recipes: recipeRowsOf(index, lists.recipes.slice(0, perKind)),
    ingredients: ingredients.slice(0, perKind),
    cuisines: lists.cuisines.slice(0, perKind),
    methods: lists.methods.slice(0, perKind),
    sauces: lists.sauces.slice(0, perKind),
    total: { recipe: lists.recipes.length, ingredient: ingredients.length, cuisine: lists.cuisines.length, method: lists.methods.length, sauce: lists.sauces.length },
  };
}
