import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  getCuisineData,
  PRIMARY_CUISINE_KEYS,
} from "../data/cuisines/index.js";
import { loadCuisinePopularityWeights } from "../lib/cuisinePopularity.js";
import type { AlchemicalRecipe } from "../types/alchemicalRecipe.js";
import type { Cuisine, SeasonalDishes } from "../types/cuisine.js";
import type {
  CuisineComputedProperties,
  RecipeComputedProperties,
} from "../types/hierarchy.js";
import {
  computeCuisineProperties,
  computeGlobalAverages,
  identifyCuisineSignatures,
} from "../utils/cuisineAggregations.js";

interface CuisineManifest {
  generatedAt: string;
  totalCuisines: number;
  totalRecipes: number;
  assumptions: {
    multiCuisineRecipesCountedInEachAggregation: boolean;
    uniqueByRecipeNameWithinCuisine: boolean;
    weightingStrategy: "equal";
  };
  globalAverages: ReturnType<typeof computeGlobalAverages>;
  popularity: {
    windowDays: number;
    totalEntries: number;
    /** Number of cuisines with at least one diary entry in the window */
    cuisinesWithSignal: number;
  };
  cuisines: Array<{
    cuisine: string;
    sampleSize: number;
    /** 30-day food_diary entry count for this cuisine (0 when no signal) */
    popularityCount: number;
    /** Max-normalized popularity weight in [0, 1] */
    popularityWeight: number;
    averageElementals: CuisineComputedProperties["averageElementals"];
    averageAlchemical?: CuisineComputedProperties["averageAlchemical"];
    averageThermodynamics?: CuisineComputedProperties["averageThermodynamics"];
    variance: CuisineComputedProperties["variance"];
    signatures: CuisineComputedProperties["signatures"];
    planetaryPatterns?: CuisineComputedProperties["planetaryPatterns"];
  }>;
}

function normalizeCuisineName(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (/middle[\s-]*eastern/i.test(trimmed)) return "Middle Eastern";
  // Treat hyphens as word separators so "Chinese-American" → "Chinese American"
  return trimmed
    .split(/[\s-]+/)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1).toLowerCase())
    .join(" ");
}

interface RecipeCuisineTypesLike {
  classifications?: { cuisineTypes?: unknown };
}

function extractCuisineAliases(recipe: Partial<AlchemicalRecipe>): string[] {
  const aliases = new Set<string>();
  const fromClassifications = recipe.classifications?.cookingMethods || [];
  fromClassifications.forEach(() => {
    // intentionally no-op: cookingMethods are not cuisines
  });

  const fromDetails = recipe.details?.cuisine || "";
  if (fromDetails) {
    fromDetails
      .replace(/\(.+?\)/g, "")
      .split(/[,/&]|\band\b/gi)
      .map((part) => part.trim())
      .filter(Boolean)
      .forEach((name) => aliases.add(normalizeCuisineName(name)));
  }

  const fromCuisineTypes = (recipe as RecipeCuisineTypesLike).classifications
    ?.cuisineTypes;
  if (Array.isArray(fromCuisineTypes)) {
    fromCuisineTypes
      .map((item: unknown) => String(item))
      .forEach((name) => aliases.add(normalizeCuisineName(name)));
  }

  return Array.from(aliases).filter(Boolean);
}

function collectUniqueRecipes(cuisine: Cuisine): AlchemicalRecipe[] {
  // Cuisine files store the bulk of recipes under `all:` (year-round) plus
  // optional season-specific lists. Earlier versions of this script missed
  // `all:` and produced a fraction of the real corpus.
  const seasonKeys = ["all", "spring", "summer", "autumn", "winter"] as const;
  const mealTypes = ["breakfast", "lunch", "dinner", "dessert"] as const;
  const byName = new Map<string, AlchemicalRecipe>();

  mealTypes.forEach((mealType) => {
    const meal: SeasonalDishes = cuisine?.dishes?.[mealType] || {};
    seasonKeys.forEach((season) => {
      const recipes = Array.isArray(meal?.[season])
        ? (meal[season] as AlchemicalRecipe[])
        : [];
      recipes.forEach((recipe: AlchemicalRecipe) => {
        const key = String(recipe?.name || "")
          .trim()
          .toLowerCase();
        if (!key) return;
        if (!byName.has(key)) {
          byName.set(key, recipe);
        }
      });
    });
  });

  return Array.from(byName.values());
}

function toComputedRecipe(recipe: AlchemicalRecipe): {
  id: string;
  _computed: RecipeComputedProperties;
} {
  const planetaryPositionsUsed: Record<string, string> = {};
  recipe.astrologicalAffinities?.planets?.forEach((planet, index) => {
    const sign = recipe.astrologicalAffinities?.signs?.[index];
    if (planet && sign) planetaryPositionsUsed[planet] = sign;
  });

  const elemental = recipe.elementalProperties || {
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25,
  };
  const alchemical = recipe.alchemicalProperties || {
    Spirit: 0,
    Essence: 0,
    Matter: 0,
    Substance: 0,
  };
  const thermodynamics = recipe.thermodynamicProperties || {
    heat: 0,
    entropy: 0,
    reactivity: 0,
    gregsEnergy: 0,
    kalchm: 0,
    monica: 0,
  };

  return {
    id: (recipe.name || "recipe").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    _computed: {
      alchemicalProperties: alchemical,
      elementalProperties: elemental,
      thermodynamicProperties: thermodynamics,
      // Intentionally any: placeholder KineticMetrics for a build-only script.
      // This literal's fields (resistance/current/voltage/impedance/resonance)
      // don't exist on the real KineticMetrics interface, and this value is
      // never serialized into the output manifest (only elementals/alchemical/
      // thermodynamics/signatures are). A type-safe fix would require
      // constructing a full valid KineticMetrics, changing emitted data —
      // out of scope for a types-only pass.
      kineticProperties: {
        power: 0,
        resistance: 0,
        current: 0,
        voltage: 0,
        impedance: 0,
        resonance: 0,
      } as any,
      dominantElement: "Fire",
      dominantAlchemicalProperty: "Spirit",
      computationMetadata: {
        planetaryPositionsUsed,
        cookingMethodsApplied: [],
        computationTimestamp: new Date(),
      },
    },
  };
}

async function main() {
  const grouped = new Map<string, AlchemicalRecipe[]>();

  // Load full cuisine data (including recipes) via dynamic imports.
  // The synchronous `primaryCuisines` export only carries metadata.
  const loadedCuisines = await Promise.all(
    PRIMARY_CUISINE_KEYS.map(async (key) => ({
      key,
      cuisine: await getCuisineData(key),
    })),
  );

  for (const { key, cuisine } of loadedCuisines) {
    if (!cuisine) continue;
    const recipes = collectUniqueRecipes(cuisine);
    for (const recipe of recipes) {
      const targets = new Set<string>([
        normalizeCuisineName(key),
        ...extractCuisineAliases(recipe),
      ]);
      for (const cuisineName of targets) {
        if (!cuisineName) continue;
        if (!grouped.has(cuisineName)) grouped.set(cuisineName, []);
        grouped.get(cuisineName)!.push(recipe);
      }
    }
  }

  const cuisineComputations = Array.from(grouped.entries()).map(
    ([cuisineName, recipes]) => {
      const unique = Array.from(
        new Map(
          recipes.map((recipe) => [
            String(recipe.name || "").toLowerCase(),
            recipe,
          ]),
        ).values(),
      );
      const computedRecipes = unique.map(toComputedRecipe);
      const computed = computeCuisineProperties(computedRecipes, {
        weightingStrategy: "equal",
        includeVariance: true,
        identifyPlanetaryPatterns: true,
      });
      return { cuisineName, computed };
    },
  );

  const globalAverages = computeGlobalAverages(
    cuisineComputations.map((entry) => entry.computed),
  );

  const popularity = await loadCuisinePopularityWeights(30);
  const lookupPopularity = (name: string) => {
    const direct = popularity.rawCounts.get(name);
    if (direct !== undefined) {
      return {
        count: direct,
        weight: popularity.weights.get(name) ?? 0,
      };
    }
    // Case-insensitive fallback so "italian" matches "Italian"
    for (const [key, count] of popularity.rawCounts) {
      if (key.toLowerCase() === name.toLowerCase()) {
        return { count, weight: popularity.weights.get(key) ?? 0 };
      }
    }
    return { count: 0, weight: 0 };
  };

  const cuisines = cuisineComputations
    .map(({ cuisineName, computed }) => {
      const pop = lookupPopularity(cuisineName);
      return {
        cuisine: cuisineName,
        sampleSize: computed.sampleSize,
        popularityCount: pop.count,
        popularityWeight: pop.weight,
        averageElementals: computed.averageElementals,
        averageAlchemical: computed.averageAlchemical,
        averageThermodynamics: computed.averageThermodynamics,
        variance: computed.variance,
        signatures: identifyCuisineSignatures(
          {
            elementals: computed.averageElementals,
            alchemical: computed.averageAlchemical,
            thermodynamics: computed.averageThermodynamics,
          },
          globalAverages,
        ),
        planetaryPatterns: computed.planetaryPatterns,
      };
    })
    .sort((a, b) => b.sampleSize - a.sampleSize);

  const manifest: CuisineManifest = {
    generatedAt: new Date().toISOString(),
    totalCuisines: cuisines.length,
    totalRecipes: cuisines.reduce((sum, cuisine) => sum + cuisine.sampleSize, 0),
    assumptions: {
      multiCuisineRecipesCountedInEachAggregation: true,
      uniqueByRecipeNameWithinCuisine: true,
      weightingStrategy: "equal",
    },
    globalAverages,
    popularity: {
      windowDays: popularity.windowDays,
      totalEntries: popularity.totalEntries,
      cuisinesWithSignal: popularity.rawCounts.size,
    },
    cuisines,
  };

  const jsonPath = resolve(
    process.cwd(),
    "src/utils/CUISINE_STATISTICS_MANIFEST.json",
  );
  const tsPath = resolve(
    process.cwd(),
    "src/utils/cuisineSignatures.generated.ts",
  );

  writeFileSync(jsonPath, JSON.stringify(manifest, null, 2), "utf-8");

  const tsContent = `// Auto-generated by src/scripts/process-all-cuisines.ts\n` +
    `export const CUISINE_SIGNATURES = ${JSON.stringify(cuisines, null, 2)} as const;\n` +
    `export const CUISINE_GLOBAL_AVERAGES = ${JSON.stringify(globalAverages, null, 2)} as const;\n`;
  writeFileSync(tsPath, tsContent, "utf-8");

  console.log(`Wrote ${jsonPath}`);
  console.log(`Wrote ${tsPath}`);
  console.log(`Cuisines: ${manifest.totalCuisines}`);
  console.log(`Total recipes counted: ${manifest.totalRecipes}`);
}

main().catch((error) => {
  console.error("CRITICAL ERROR IN SCRIPT:");
  console.error(error);
  process.exit(1);
});
