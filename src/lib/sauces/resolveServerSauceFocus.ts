/**
 * Server-only resolution for `/sauces?focus=<key|id>`.
 *
 * Keeps the heavy `public/data/sauce-catalogue.json` lookup strictly on the
 * server (`page.tsx`) so client bundles stay lean while supporting deep-links
 * by legacy `allSauces` key OR canonical catalogue ID (e.g.
 * `italian:mother:besciamella`, `japanese:mother:dashi`, `global:teriyaki`).
 *
 * @file src/lib/sauces/resolveServerSauceFocus.ts
 */
import { readFileSync } from "fs";
import { join } from "path";
import { allSauces, type Sauce, type SauceNutritionalProfile } from "@/data/sauces";
import {
  makeSauceId,
  parseSauceCatalogueFile,
  type CatalogueSauceEntry,
  type SauceCatalogueFile,
} from "./catalogueFile";
import { foldKey } from "./pairingAliases";
import { resolveSauceFocus } from "./sauceFocus";

export interface ResolvedServerSauceFocus {
  sauce: Sauce;
  cuisine?: string;
}

let cachedCatalogue: SauceCatalogueFile | null | undefined;

function loadServerCatalogue(): SauceCatalogueFile | null {
  if (cachedCatalogue !== undefined) return cachedCatalogue;
  try {
    const filePath = join(process.cwd(), "public", "data", "sauce-catalogue.json");
    const parsed = parseSauceCatalogueFile(JSON.parse(readFileSync(filePath, "utf8")));
    cachedCatalogue = parsed;
    return parsed;
  } catch {
    cachedCatalogue = null;
    return null;
  }
}

function toNutritionProfile(
  raw: CatalogueSauceEntry["nutritionalProfile"],
): SauceNutritionalProfile | undefined {
  if (!raw) return undefined;
  return {
    ...(raw.calories !== undefined ? { calories: raw.calories } : {}),
    ...(raw.protein !== undefined ? { protein: raw.protein } : {}),
    ...(raw.carbs !== undefined ? { carbs: raw.carbs } : {}),
    ...(raw.fat !== undefined ? { fat: raw.fat } : {}),
    ...(raw.fiber !== undefined ? { fiber: raw.fiber } : {}),
    ...(raw.sodium !== undefined ? { sodium: raw.sodium } : {}),
    ...(raw.sugar !== undefined ? { sugar: raw.sugar } : {}),
    ...(raw.servingSize !== undefined ? { servingSize: raw.servingSize } : {}),
  };
}

const OPT_STRING_FIELDS = [
  "preparationNotes", "technicalTips", "storageInstructions",
  "prepTime", "cookTime", "difficulty", "yield",
] as const;

const OPT_ARRAY_FIELDS = ["ingredients", "preparationSteps"] as const;

function applyOptionalStringsAndArrays(target: Sauce, entry: CatalogueSauceEntry, richer?: Sauce): void {
  const variants = entry.variants ?? entry.derivatives ?? richer?.variants;
  if (variants) target.variants = variants;
  for (const field of OPT_STRING_FIELDS) {
    const val = entry[field] ?? richer?.[field];
    if (val !== undefined) target[field] = val;
  }
  for (const field of OPT_ARRAY_FIELDS) {
    const val = entry[field] ?? richer?.[field];
    if (val !== undefined) target[field] = val;
  }
}

function applyOptionalProfiles(target: Sauce, entry: CatalogueSauceEntry, richer?: Sauce): void {
  const alchemical = entry.alchemicalProperties ?? richer?.alchemicalProperties;
  if (alchemical) target.alchemicalProperties = alchemical;
  const thermodynamic = entry.thermodynamicProperties ?? richer?.thermodynamicProperties;
  if (thermodynamic) target.thermodynamicProperties = thermodynamic;
  const nutritionalProfile = toNutritionProfile(entry.nutritionalProfile) ?? richer?.nutritionalProfile;
  if (nutritionalProfile) target.nutritionalProfile = nutritionalProfile;
}

function buildSauceFromCatalogueEntry(
  entry: CatalogueSauceEntry,
  ownerCuisine: string,
  fallbackElemental: Sauce["elementalProperties"],
): Sauce {
  const richer = Object.values(allSauces).find((s) => foldKey(s.name) === foldKey(entry.name));
  const sauce: Sauce = {
    name: entry.name,
    description: entry.description ?? richer?.description ?? "",
    base: entry.base ?? richer?.base ?? "",
    keyIngredients: entry.keyIngredients ?? richer?.keyIngredients ?? [],
    culinaryUses: entry.culinaryUses ?? richer?.culinaryUses ?? [],
    elementalProperties: entry.elementalProperties ?? richer?.elementalProperties ?? fallbackElemental,
    astrologicalInfluences: entry.astrologicalInfluences ?? richer?.astrologicalInfluences ?? [],
    seasonality: entry.seasonality ?? richer?.seasonality ?? "all",
    cuisine: ownerCuisine,
  };
  applyOptionalStringsAndArrays(sauce, entry, richer);
  applyOptionalProfiles(sauce, entry, richer);
  return sauce;
}

export function resolveServerSauceFocus(
  param: string | string[] | undefined,
): ResolvedServerSauceFocus | undefined {
  const raw = Array.isArray(param) ? param[0] : param;
  const trimmed = raw?.trim();
  if (!trimmed) return undefined;

  const legacyKey = resolveSauceFocus(trimmed, Object.keys(allSauces));
  if (legacyKey !== null) {
    const sauce = allSauces[legacyKey];
    if (sauce) {
      return { sauce, ...(sauce.cuisine ? { cuisine: sauce.cuisine } : {}) };
    }
  }

  const wantedId = trimmed.toLowerCase();
  for (const [key, sauce] of Object.entries(allSauces)) {
    if (makeSauceId(["global", key]) === wantedId) {
      return { sauce, ...(sauce.cuisine ? { cuisine: sauce.cuisine } : {}) };
    }
  }

  const catalogue = loadServerCatalogue();
  if (!catalogue) return undefined;

  for (const cuisine of Object.values(catalogue.cuisines)) {
    const buckets: Array<["mother" | "traditional", Record<string, CatalogueSauceEntry>]> = [
      ["mother", cuisine.motherSauces],
      ["traditional", cuisine.traditionalSauces],
    ];
    for (const [origin, map] of buckets) {
      for (const [entryKey, entry] of Object.entries(map)) {
        if (makeSauceId([cuisine.name, origin, entryKey]) === wantedId) {
          return {
            sauce: buildSauceFromCatalogueEntry(entry, cuisine.name, cuisine.elementalProperties),
            cuisine: cuisine.name,
          };
        }
      }
    }
  }

  return undefined;
}
