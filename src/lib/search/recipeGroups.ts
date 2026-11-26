/**
 * A cuisine-section search: the dishes a query finds (by name, then by
 * ingredient), each with every version and the closest dishes elsewhere.
 *
 * Matching is the omnibar's own (./omnibar), so a query means the same thing in
 * the header and here; this only groups its recipe hits into dish families.
 */
import type { CrossCuisineMatch, RecipeGroup, RecipeSearchResponse, RecipeVersion } from "@/lib/validation/recipeSearchSchemas";
import { publicCuisine } from "@/utils/internalCuisineCodes";
import { matchTier } from "./match";
import { searchOmnibar } from "./omnibar";
import { cuisineLabel, displayName, familyName } from "./recipeFamilies";
import { familyIndexOf, type Family, type FamilyIndex } from "./recipeFamilyIndex";
import { similarRecipes } from "./recipeSimilar";
import { recipeHref, type SearchIndex } from "./searchIndex";
import { normalizeText } from "./text";
import type { RecipeVariant } from "./recipeVariants";
import type { OmnibarResult } from "./types";

export const GROUP_LIMIT = 8;
export const CROSS_CUISINE_LIMIT = 4;
/** Recipe hits read from the omnibar before grouping. */
const HIT_LIMIT = 60;
/** A held-back version's name must match this well (whole words or a prefix). */
const VARIANT_TIER = 2;

interface Hit {
  familyKey: string;
  /** The recipe that matched; null when only a held-back version did. */
  id: string | null;
  matchedBy: RecipeGroup["matchedBy"];
  matchNote: string | null;
}

function ingredientNote(missing: readonly string[], uses: number): string {
  const of = uses + missing.length;
  return missing.length === 0 ? `uses all ${of}` : `uses ${uses} of ${of}, missing ${missing.join(", ")}`;
}

type RowHit = Omit<Hit, "familyKey" | "id"> & { id: string };

/** Name matches first, then recipes using several named ingredients, then one. */
function rowHits(result: OmnibarResult): RowHit[] {
  const byName = result.recipes.map((row): RowHit => ({ id: row.id, matchedBy: "name", matchNote: null }));
  const together = (result.coverage?.rows ?? []).map(
    (row): RowHit => ({ id: row.id, matchedBy: "ingredient", matchNote: ingredientNote(row.missing, row.uses) }),
  );
  const heroName = result.hero?.name ?? null;
  const containing = result.recipesContaining.map(
    (row): RowHit => ({ id: row.id, matchedBy: "ingredient", matchNote: heroName === null ? null : `uses ${heroName}` }),
  );
  return [...byName, ...together, ...containing];
}

function variantHits(families: FamilyIndex, query: string): Hit[] {
  const wanted = normalizeText(query);
  return [...families.families.values()].flatMap((family): Hit[] => {
    const found = family.variants.some((variant) => {
      const tier = matchTier(wanted, normalizeText(variant.name));
      return tier !== null && tier <= VARIANT_TIER;
    });
    return found ? [{ familyKey: family.key, id: null, matchedBy: "name", matchNote: null }] : [];
  });
}

/** The first hit of each family, in hit order. */
function onePerFamily(hits: readonly Hit[]): Hit[] {
  const seen = new Map<string, Hit>();
  for (const hit of hits) if (!seen.has(hit.familyKey)) seen.set(hit.familyKey, hit);
  return [...seen.values()];
}

function shownCuisine(cuisine: string | null | undefined): string | null {
  const shown = publicCuisine(cuisine);
  return shown === undefined ? null : cuisineLabel(shown);
}

function pagedVersion(index: SearchIndex, id: string): RecipeVersion[] {
  const record = index.recipes.get(id);
  if (!record) return [];
  const { name, cuisine, totalMinutes } = record;
  return [
    {
      id,
      name: displayName(name),
      href: recipeHref(id),
      cuisine: shownCuisine(cuisine),
      labels: [...familyName(name).labels],
      totalMinutes,
      onFile: null,
    },
  ];
}

function onFileVersion(variant: RecipeVariant): RecipeVersion {
  const { name, cuisine, meal, description, totalMinutes, ingredients, steps } = variant;
  return {
    id: null,
    name: displayName(name),
    href: null,
    cuisine: shownCuisine(cuisine),
    labels: [...familyName(name).labels],
    totalMinutes,
    onFile: { meal, description, ingredients: [...ingredients], steps: [...steps] },
  };
}

/** The matched recipe first, then the others by name, then the held-back ones. */
function versionsOf(index: SearchIndex, family: Family, matched: string | null): RecipeVersion[] {
  const paged = family.ids
    .flatMap((id) => pagedVersion(index, id))
    .sort((a, b) => Number(b.id === matched) - Number(a.id === matched) || a.name.localeCompare(b.name));
  return [...paged, ...family.variants.map(onFileVersion)];
}

function crossCuisine(index: SearchIndex, families: FamilyIndex, family: Family): CrossCuisineMatch[] {
  const own = new Set(family.ids.flatMap((id) => publicCuisine(index.recipes.get(id)?.cuisine)?.toLowerCase() ?? []));
  const matches = similarRecipes(index, family.ids, {
    limit: CROSS_CUISINE_LIMIT,
    allow: (id) => {
      const cuisine = publicCuisine(index.recipes.get(id)?.cuisine)?.toLowerCase();
      return cuisine !== undefined && !own.has(cuisine) && families.keyOfId.get(id) !== family.key;
    },
    groupOf: (id) => families.keyOfId.get(id) ?? id,
  });
  return matches.flatMap(({ id, score, shared }) => {
    const record = index.recipes.get(id);
    const cuisine = publicCuisine(record?.cuisine);
    if (!record || cuisine === undefined) return [];
    return [{ id, name: displayName(record.name), href: recipeHref(id), cuisine: cuisineLabel(cuisine), score: Math.round(score * 100) / 100, shared: shared.slice(0, 5) }];
  });
}

/** The shortest version name reads best as the family's title. */
function titleOf(versions: readonly RecipeVersion[], key: string): string {
  const names = versions.map((version) => version.name.replace(/\([^()]*\)/g, "").trim()).filter((name) => name !== "");
  return names.sort((a, b) => a.length - b.length || a.localeCompare(b))[0] ?? key;
}

function groupFor(index: SearchIndex, families: FamilyIndex, hit: Hit): RecipeGroup[] {
  const family = families.families.get(hit.familyKey);
  if (!family) return [];
  const versions = versionsOf(index, family, hit.id);
  if (versions.length === 0) return [];
  return [
    {
      key: family.key,
      title: titleOf(versions, family.key),
      matchedBy: hit.matchedBy,
      matchNote: hit.matchNote,
      versions,
      crossCuisine: crossCuisine(index, families, family),
    },
  ];
}

export interface RecipeGroupOptions {
  now: Date;
  variants: readonly RecipeVariant[];
}

export function searchRecipeGroups(index: SearchIndex, query: string, options: RecipeGroupOptions): RecipeSearchResponse {
  const trimmed = query.trim();
  if (trimmed === "") return { success: true, query: trimmed, groups: [], totalGroups: 0 };
  const families = familyIndexOf(index, options.variants);
  const result = searchOmnibar(index, trimmed, { now: options.now, perKindLimit: HIT_LIMIT, containingLimit: HIT_LIMIT });
  const rows = rowHits(result).map((row): Hit => ({ ...row, familyKey: families.keyOfId.get(row.id) ?? row.id }));
  const named = rows.filter((hit) => hit.matchedBy === "name");
  const others = rows.filter((hit) => hit.matchedBy !== "name");
  const hits = onePerFamily([...named, ...variantHits(families, trimmed), ...others]);
  const groups = hits.slice(0, GROUP_LIMIT).flatMap((hit) => groupFor(index, families, hit));
  return { success: true, query: trimmed, groups, totalGroups: hits.length };
}
