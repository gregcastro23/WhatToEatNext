/**
 * Build `public/data/sauce-catalogue.json` from the static per-cuisine modules.
 *
 * Keeps heavy per-cuisine recipe corpora out of client bundles while exposing
 * all 15 traditions, native mother/traditional sauces, regional dialects,
 * pairing maps, and resolved ingredient dossier slugs.
 *
 * @file scripts/lib/buildSauceCatalogue.ts
 */
import { cuisineFlavorProfiles } from "@/data/cuisineFlavorProfiles";
import { CUISINES_METADATA, getCuisineData, PRIMARY_CUISINE_KEYS } from "@/data/cuisines/index";
import { allSauces } from "@/data/sauces";
import { resolveCatalogIngredient } from "@/lib/ingredients/ingredientCatalog";
import type {
  CatalogueCuisineEntry,
  CataloguePairingMap,
  CatalogueRegionalEntry,
  CatalogueSauceEntry,
  SauceCatalogueFile,
  SauceElemental,
} from "@/lib/sauces/catalogueFile";

function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

function readString(obj: Record<string, unknown>, key: string): string | undefined {
  const val = obj[key];
  return typeof val === "string" && val.trim().length > 0 ? val : undefined;
}

function readStringArray(obj: Record<string, unknown>, key: string): string[] | undefined {
  const val = obj[key];
  if (!Array.isArray(val)) return undefined;
  const items = val.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  return items.length > 0 ? items : undefined;
}

function readElemental(raw: unknown): SauceElemental | undefined {
  if (!isRecord(raw)) return undefined;
  const { Fire, Water, Earth, Air } = raw;
  if (
    typeof Fire !== "number" ||
    typeof Water !== "number" ||
    typeof Earth !== "number" ||
    typeof Air !== "number"
  ) {
    return undefined;
  }
  if (!Number.isFinite(Fire) || !Number.isFinite(Water) || !Number.isFinite(Earth) || !Number.isFinite(Air)) {
    return undefined;
  }
  return { Fire, Water, Earth, Air };
}

function normalizeSauceEntry(fallbackKey: string, raw: unknown): CatalogueSauceEntry | null {
  if (!isRecord(raw)) return null;
  const name = readString(raw, "name") ?? fallbackKey;
  const description = readString(raw, "description");
  const base = readString(raw, "base");
  const thickener = readString(raw, "thickener");
  const keyIngredients = readStringArray(raw, "keyIngredients");
  const culinaryUses = readStringArray(raw, "culinaryUses");
  const variants = readStringArray(raw, "variants");
  const derivatives = readStringArray(raw, "derivatives");
  const elementalProperties = readElemental(raw.elementalProperties);
  const astrologicalInfluences = readStringArray(raw, "astrologicalInfluences");
  const seasonality = readString(raw, "seasonality");
  const preparationNotes = readString(raw, "preparationNotes");
  const technicalTips = readString(raw, "technicalTips");
  const difficulty = readString(raw, "difficulty");
  const yieldVal = readString(raw, "yield");
  const storageInstructions = readString(raw, "storageInstructions");

  return {
    name,
    ...(description !== undefined ? { description } : {}),
    ...(base !== undefined ? { base } : {}),
    ...(thickener !== undefined ? { thickener } : {}),
    ...(keyIngredients !== undefined ? { keyIngredients } : {}),
    ...(culinaryUses !== undefined ? { culinaryUses } : {}),
    ...(variants !== undefined ? { variants } : {}),
    ...(derivatives !== undefined ? { derivatives } : {}),
    ...(elementalProperties !== undefined ? { elementalProperties } : {}),
    ...(astrologicalInfluences !== undefined ? { astrologicalInfluences } : {}),
    ...(seasonality !== undefined ? { seasonality } : {}),
    ...(preparationNotes !== undefined ? { preparationNotes } : {}),
    ...(technicalTips !== undefined ? { technicalTips } : {}),
    ...(difficulty !== undefined ? { difficulty } : {}),
    ...(yieldVal !== undefined ? { yield: yieldVal } : {}),
    ...(storageInstructions !== undefined ? { storageInstructions } : {}),
  };
}

function normalizeSauceRecord(rawMap: unknown): Record<string, CatalogueSauceEntry> {
  if (!isRecord(rawMap)) return {};
  const out: Record<string, CatalogueSauceEntry> = {};
  for (const [key, val] of Object.entries(rawMap)) {
    const entry = normalizeSauceEntry(key, val);
    if (entry) out[key] = entry;
  }
  return out;
}

function normalizeStringListRecord(raw: unknown): Record<string, string[]> {
  if (!isRecord(raw)) return {};
  const out: Record<string, string[]> = {};
  for (const [key, val] of Object.entries(raw)) {
    if (!Array.isArray(val)) continue;
    const items = val.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
    if (items.length > 0) out[key] = items;
  }
  return out;
}

function normalizePairingMap(raw: unknown): CataloguePairingMap {
  const rec = isRecord(raw) ? raw : {};
  return {
    forProtein: normalizeStringListRecord(rec.forProtein),
    forVegetable: normalizeStringListRecord(rec.forVegetable),
    forCookingMethod: normalizeStringListRecord(rec.forCookingMethod),
    byAstrological: normalizeStringListRecord(rec.byAstrological),
    byDietary: normalizeStringListRecord(rec.byDietary),
    byRegion: normalizeStringListRecord(rec.byRegion),
  };
}

function toRegionalEntry(key: string, raw: unknown): CatalogueRegionalEntry | null {
  if (!isRecord(raw)) return null;
  const name = readString(raw, "name") ?? key;
  const description = readString(raw, "description");
  const signature = readStringArray(raw, "signature") ?? readStringArray(raw, "signatureDishes");
  const elementalProperties = readElemental(raw.elementalProperties);
  return {
    key,
    name,
    ...(description !== undefined ? { description } : {}),
    ...(signature !== undefined ? { signature } : {}),
    ...(elementalProperties !== undefined ? { elementalProperties } : {}),
  };
}

function normalizeRegions(raw: unknown): CatalogueRegionalEntry[] {
  if (Array.isArray(raw)) {
    return raw
      .map((item, idx) => {
        const key = isRecord(item) ? (readString(item, "name") ?? String(idx)) : String(idx);
        return toRegionalEntry(key, item);
      })
      .filter((entry): entry is CatalogueRegionalEntry => entry !== null);
  }
  if (!isRecord(raw)) return [];
  return Object.entries(raw)
    .map(([key, item]) => toRegionalEntry(key, item))
    .filter((entry): entry is CatalogueRegionalEntry => entry !== null);
}

function collectIngredientNames(
  cuisines: Record<string, CatalogueCuisineEntry>,
): Set<string> {
  const names = new Set<string>();
  const addAll = (list: readonly string[] | undefined): void => {
    if (!list) return;
    for (const item of list) {
      const trimmed = item.trim();
      if (trimmed.length > 0) names.add(trimmed);
    }
  };
  for (const entry of Object.values(cuisines)) {
    for (const s of Object.values(entry.motherSauces)) addAll(s.keyIngredients);
    for (const s of Object.values(entry.traditionalSauces)) addAll(s.keyIngredients);
    const profileKey = Object.keys(cuisineFlavorProfiles).find(
      (k) => k.toLowerCase() === entry.name.toLowerCase(),
    );
    if (profileKey) addAll(cuisineFlavorProfiles[profileKey]?.signatureIngredients);
  }
  for (const s of Object.values(allSauces)) {
    addAll(s.keyIngredients);
  }
  return names;
}

function resolveIngredientSlugs(names: Set<string>): Record<string, string> {
  const pairs: Array<[string, string]> = [];
  for (const name of names) {
    const lower = name.toLowerCase();
    const resolved = resolveCatalogIngredient(name);
    if (resolved) {
      pairs.push([lower, resolved.entry.slug]);
    }
  }
  pairs.sort(([a], [b]) => a.localeCompare(b));
  return Object.fromEntries(pairs);
}

export async function buildSauceCatalogueFile(): Promise<SauceCatalogueFile> {
  const cuisines: Record<string, CatalogueCuisineEntry> = {};
  let sauceCount = 0;

  for (const key of PRIMARY_CUISINE_KEYS) {
    const meta = CUISINES_METADATA[key];
    if (!meta) continue;
    const rawCuisine = await getCuisineData(key);
    if (!rawCuisine) continue;

    const displayKey = meta.name ?? key;
    const motherSauces = normalizeSauceRecord(rawCuisine.motherSauces);
    const traditionalSauces = normalizeSauceRecord(rawCuisine.traditionalSauces);
    sauceCount += Object.keys(motherSauces).length + Object.keys(traditionalSauces).length;

    const elementalProperties =
      readElemental(meta.elementalProperties) ??
      readElemental(rawCuisine.elementalProperties) ?? {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25,
      };

    cuisines[displayKey] = {
      id: rawCuisine.id || key.toLowerCase(),
      name: displayKey,
      description: meta.description ?? rawCuisine.description ?? "",
      elementalProperties,
      motherSauces,
      traditionalSauces,
      sauceRecommender: normalizePairingMap(rawCuisine.sauceRecommender),
      regionalCuisines: normalizeRegions(rawCuisine.regionalCuisines),
      astrologicalInfluences: Array.isArray(rawCuisine.astrologicalInfluences)
        ? rawCuisine.astrologicalInfluences
        : [],
    };
  }

  const ingredientSlugs = resolveIngredientSlugs(collectIngredientNames(cuisines));

  return {
    source: "scripts/generate-sauce-catalogue.ts over public cuisine modules (src/data/cuisines/*)",
    cuisineCount: Object.keys(cuisines).length,
    sauceCount,
    cuisines,
    ingredientSlugs,
  };
}
