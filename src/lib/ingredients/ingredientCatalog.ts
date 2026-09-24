/**
 * The ingredient catalog the site serves (omnibar plan Phase 2.5a, #870):
 * src/data's `allIngredients` ∪ the unified catalog, one entry per ingredient.
 *
 * Owner ruling 2026-09-23: union, src/data wins field by field. [MEASURED
 * 2026-09-23] The unified catalog adds 86 cards src/data lacks (eggs, black
 * beans, bok choy…). src/data adds 3 the unified set never loaded (aged
 * balsamic, fig and champagne-rose vinegar), and it fixes 7 vinegar names the
 * unified set stores as raw keys ("rice_vinegar"). Where the unified catalog
 * merged a plural card into its singular (bay_leaves → bay_leaf), the union
 * keeps that merge: the plural key and name become aliases of the singular
 * card, so the site has one Bay Leaf, not two. Three cards that are one
 * ingredient under different keys merge the same way (SAME_CARD).
 *
 * The resolver is EXACT: the slug, key, name or alias of one card, compared in
 * slug form. There is no substring fallback; that fallback is what sent
 * "Apple Cider Vinegar" to Apple.
 */
import { allIngredients } from "@/data/ingredients";
import { resolveUnifiedIngredientKey, unifiedIngredients } from "@/data/unified/ingredients";
import type { UnifiedIngredient } from "@/data/unified/unifiedTypes";
import type { Ingredient } from "@/types";
import { ingredientSlug, slugForm } from "./ingredientSlug";

export interface CatalogIngredient {
  key: string;
  slug: string;
  name: string;
  /** src/data's card; its defined fields win. */
  source: Ingredient | null;
  unified: UnifiedIngredient | null;
  /** Keys and names of the cards merged into this one (plurals, SAME_CARD). */
  aliases: readonly string[];
}

export interface IngredientCatalog {
  entries: readonly CatalogIngredient[];
  bySlug: ReadonlyMap<string, CatalogIngredient>;
  /** Slug form of every slug, key, name (both catalogs') and alias → its card. */
  forms: ReadonlyMap<string, CatalogIngredient>;
}

export interface ResolvedIngredient {
  entry: CatalogIngredient;
  /** The param is the canonical slug itself; any other spelling is an alias. */
  isCanonical: boolean;
}

function displayName(key: string, source: Ingredient | null, unified: UnifiedIngredient | null): string {
  return [source?.name, unified?.name].find((name) => name !== undefined && name.length > 0) ?? key;
}

function entryFor(key: string, source: Ingredient | null, unified: UnifiedIngredient | null): CatalogIngredient {
  return { key, slug: ingredientSlug(key), name: displayName(key, source, unified), source, unified, aliases: [] };
}

/**
 * One ingredient under two keys, one key in each catalog (alias → primary).
 * [MEASURED 2026-09-23] Matching names by search form (compact or stemmed)
 * finds exactly these 3 among the 86 unified-only cards. The catalog test
 * recomputes that match, so a new duplicate fails CI.
 */
const SAME_CARD: Readonly<Record<string, string>> = {
  // The allIngredients card is primary (owner ruling: src/data wins).
  soymilk: "soy_milk",
  radish: "radishes",
  // Reversed: allIngredients' mam_ruo_c is a generated recipe-coverage stub
  // whose key lost its "ố" ("mam ruo c"); cookingStaples has the authored card.
  mam_ruo_c: "mam_ruoc",
};

/** The card this key was merged into: a SAME_CARD pair, or a plural the unified catalog folded. */
function mergedInto(key: string): string | null {
  const same = SAME_CARD[key];
  if (same !== undefined) return same;
  const primary = resolveUnifiedIngredientKey(key);
  return primary !== key && primary in unifiedIngredients ? primary : null;
}

function buildEntries(): CatalogIngredient[] {
  const aliases = new Map<string, string[]>();
  const entries: CatalogIngredient[] = [];
  const add = (key: string, source: Ingredient | null, unified: UnifiedIngredient | null): void => {
    const primary = mergedInto(key);
    if (primary === null) {
      entries.push(entryFor(key, source, unified));
    } else {
      aliases.set(primary, [...(aliases.get(primary) ?? []), key, displayName(key, source, unified)]);
    }
  };
  for (const [key, source] of Object.entries(allIngredients)) add(key, source, unifiedIngredients[key] ?? null);
  for (const [key, unified] of Object.entries(unifiedIngredients)) {
    if (!(key in allIngredients)) add(key, null, unified);
  }
  return entries.map((entry) => ({ ...entry, aliases: aliases.get(entry.key) ?? [] }));
}

/**
 * First claim wins: slugs, keys, names, the unified card's own name (older
 * links carry it: "Clarified Butter / Ghee"), then aliases. A test pins zero
 * overlaps.
 */
function buildForms(entries: readonly CatalogIngredient[]): Map<string, CatalogIngredient> {
  const forms = new Map<string, CatalogIngredient>();
  const spellings: ReadonlyArray<(entry: CatalogIngredient) => readonly string[]> = [
    ({ slug }): readonly string[] => [slug],
    ({ key }): readonly string[] => [key],
    ({ name }): readonly string[] => [name],
    ({ unified }): readonly string[] => (unified ? [unified.name] : []),
    ({ aliases: entryAliases }): readonly string[] => entryAliases,
  ];
  for (const spellingsOf of spellings) {
    for (const entry of entries) {
      for (const spelling of spellingsOf(entry)) {
        const form = slugForm(spelling);
        if (form !== "" && !forms.has(form)) forms.set(form, entry);
      }
    }
  }
  return forms;
}

let catalog: IngredientCatalog | null = null;

export function getIngredientCatalog(): IngredientCatalog {
  if (catalog) return catalog;
  const entries = buildEntries();
  catalog = { entries, bySlug: new Map(entries.map((entry) => [entry.slug, entry])), forms: buildForms(entries) };
  return catalog;
}

/** Exact lookup by slug, key, name or alias. Null when no card has that identity. */
export function resolveCatalogIngredient(param: string): ResolvedIngredient | null {
  const entry = getIngredientCatalog().forms.get(slugForm(param));
  return entry ? { entry, isCanonical: param === entry.slug } : null;
}

/** The card as JSON: the unified card overlaid with src/data's defined fields. */
export function catalogRecord(entry: CatalogIngredient): Record<string, unknown> {
  const overlay: Array<[string, unknown]> = Object.entries(entry.source ?? {});
  return {
    ...entry.unified,
    ...Object.fromEntries(overlay.filter(([, value]) => value !== undefined)),
    name: entry.name,
  };
}
