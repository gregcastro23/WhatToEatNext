/**
 * The recipes of one search index, and the held-back versions, arranged into
 * dish families (./recipeFamilies). Built once per index.
 */
import { normalizeRecipeName } from "@/lib/recipes/recipeIdentity";
import { familyKeys } from "./recipeFamilies";
import type { RecipeVariant } from "./recipeVariants";
import type { SearchIndex } from "./searchIndex";
import type { RecipeRecord } from "./types";

export interface Family {
  key: string;
  /** Recipes with pages. */
  ids: readonly string[];
  /** Held-back versions of a name one of those recipes carries. */
  variants: readonly RecipeVariant[];
}

export interface FamilyIndex {
  families: ReadonlyMap<string, Family>;
  keyOfId: ReadonlyMap<string, string>;
}

const memo = new WeakMap<SearchIndex, { variants: readonly RecipeVariant[]; built: FamilyIndex }>();

function ingredientNames(lines: readonly string[]): string[] {
  return lines.map((line) => line.toLowerCase());
}

/** Whether the live catalog already holds this version (it keeps a few the static one drops). */
export function alreadyListed(variant: RecipeVariant, record: RecipeRecord): boolean {
  if (record.ingredientLines.length !== variant.ingredients.length) return false;
  const live = ingredientNames(record.ingredientLines);
  return ingredientNames(variant.ingredients).every((line) => live.some((other) => other.includes(line) || line.includes(other)));
}

function recordsByName(records: readonly RecipeRecord[]): Map<string, RecipeRecord[]> {
  const byName = new Map<string, RecipeRecord[]>();
  for (const record of records) {
    const name = normalizeRecipeName(record.name);
    byName.set(name, [...(byName.get(name) ?? []), record]);
  }
  return byName;
}

/**
 * Variants whose name a live recipe carries. A variant of a recipe the catalog
 * does not serve (an unpublished one) is left out with it.
 */
function attachable(records: readonly RecipeRecord[], variants: readonly RecipeVariant[]): Array<{ variant: RecipeVariant; twin: string }> {
  const byName = recordsByName(records);
  return variants.flatMap((variant) => {
    const twins = byName.get(normalizeRecipeName(variant.name)) ?? [];
    const [first] = twins;
    if (!first || twins.some((record) => alreadyListed(variant, record))) return [];
    return [{ variant, twin: first.id }];
  });
}

function build(index: SearchIndex, variants: readonly RecipeVariant[]): FamilyIndex {
  const records = [...index.recipes.values()];
  const keys = familyKeys(records.map((record) => record.name));
  const keyOfId = new Map(records.map((record, at) => [record.id, keys[at] ?? record.name]));
  const families = new Map<string, { key: string; ids: string[]; variants: RecipeVariant[] }>();
  for (const record of records) {
    const key = keyOfId.get(record.id) ?? record.name;
    const family = families.get(key) ?? { key, ids: [], variants: [] };
    family.ids.push(record.id);
    families.set(key, family);
  }
  for (const { variant, twin } of attachable(records, variants)) {
    families.get(keyOfId.get(twin) ?? "")?.variants.push(variant);
  }
  return { families, keyOfId };
}

export function familyIndexOf(index: SearchIndex, variants: readonly RecipeVariant[]): FamilyIndex {
  const known = memo.get(index);
  if (known?.variants === variants) return known.built;
  const built = build(index, variants);
  memo.set(index, { variants, built });
  return built;
}
