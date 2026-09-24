/**
 * The searchable index: every entity with its pre-normalized match strings,
 * plus the ingredient → recipe reverse index. Built once per catalog refresh.
 */
import { buildRecipeIngredientIndex, type IngredientKeyResolver, type RecipeUse } from "./recipeIngredientIndex";
import { INGREDIENT_SYNONYMS } from "./synonyms";
import { normalizeText, type NormalizedText } from "./text";
import type {
  IngredientRecord,
  MatchVia,
  NamedRecord,
  RecipeRecord,
  SearchCatalogs,
  SearchEntity,
  SearchKind,
} from "./types";

export interface MatchText {
  text: NormalizedText;
  via: MatchVia;
  /** The original string, for display ("Béarnaise"). */
  label: string;
}

export interface IndexedEntity {
  entity: SearchEntity;
  texts: readonly MatchText[];
}

export interface IndexedSynonym {
  text: NormalizedText;
  canonical: string;
  term: string;
}

export interface SearchIndex {
  entities: readonly IndexedEntity[];
  ingredients: ReadonlyMap<string, IngredientRecord>;
  recipes: ReadonlyMap<string, RecipeRecord>;
  recipeUses: ReadonlyMap<string, readonly RecipeUse[]>;
  synonyms: readonly IndexedSynonym[];
}

export function ingredientHref(name: string): string {
  return `/ingredients/${encodeURIComponent(name)}`;
}

export function recipeHref(id: string): string {
  return `/recipes/${encodeURIComponent(id)}`;
}

function indexed(
  kind: SearchKind,
  record: { key: string; name: string; href: string },
  terms: readonly string[],
): IndexedEntity {
  const name = normalizeText(record.name);
  const extra = terms
    .map((label): MatchText => ({ text: normalizeText(label), via: "term", label }))
    .filter(({ text }) => text.folded !== "" && text.folded !== name.folded);
  return {
    entity: { kind, key: record.key, name: record.name, href: record.href },
    texts: [{ text: name, via: "name", label: record.name }, ...extra],
  };
}

function namedEntities(kind: SearchKind, records: readonly NamedRecord[]): IndexedEntity[] {
  return records.map((record) => indexed(kind, record, record.terms));
}

export function buildSearchIndex(
  catalogs: SearchCatalogs,
  keyOf: IngredientKeyResolver,
): SearchIndex {
  const ingredients = new Map(catalogs.ingredients.map((record) => [record.key, record]));
  const recipes = new Map(catalogs.recipes.map((record) => [record.id, record]));
  const entities: IndexedEntity[] = [
    ...catalogs.ingredients.map((r) =>
      indexed("ingredient", { key: r.key, name: r.name, href: ingredientHref(r.name) }, [r.key.replace(/_/g, " ")]),
    ),
    ...[...recipes.values()].map((r) => indexed("recipe", { key: r.id, name: r.name, href: recipeHref(r.id) }, [])),
    ...namedEntities("cuisine", catalogs.cuisines),
    ...namedEntities("method", catalogs.methods),
    ...namedEntities("sauce", catalogs.sauces),
  ];
  const recipeUses = buildRecipeIngredientIndex([...recipes.values()], keyOf, (key) => ingredients.get(key)?.name ?? key);
  const synonyms = INGREDIENT_SYNONYMS.filter((s) => ingredients.has(s.canonical)).map(
    (s): IndexedSynonym => ({ text: normalizeText(s.term), canonical: s.canonical, term: s.term }),
  );
  return { entities, ingredients, recipes, recipeUses, synonyms };
}
