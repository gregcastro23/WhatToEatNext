import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { primaryCuisines } from "../data/cuisines/index.js";
import type { AlchemicalRecipe } from "../types/alchemicalRecipe.js";
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
  cuisines: Array<{
    cuisine: string;
    sampleSize: number;
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
  if (/middle\s*eastern/i.test(trimmed)) return "Middle Eastern";
  return trimmed
    .split(" ")
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1).toLowerCase())
    .join(" ");
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
      .split(/[,/&]|\band\b/gi)
      .map((part) => part.replace(/\(.+?\)/g, "").trim())
      .filter(Boolean)
      .forEach((name) => aliases.add(normalizeCuisineName(name)));
  }

  const fromCuisineTypes = (recipe as any)?.classifications?.cuisineTypes;
  if (Array.isArray(fromCuisineTypes)) {
    fromCuisineTypes
      .map((item: unknown) => String(item))
      .forEach((name) => aliases.add(normalizeCuisineName(name)));
  }

  return Array.from(aliases).filter(Boolean);
}

function collectUniqueRecipes(cuisine: any): AlchemicalRecipe[] {
  const seasons = ["spring", "summer", "autumn", "winter"] as const;
  const mealTypes = ["breakfast", "lunch", "dinner", "dessert"] as const;
  const byName = new Map<string, AlchemicalRecipe>();

  mealTypes.forEach((mealType) => {
    const meal = cuisine?.dishes?.[mealType] || {};
    seasons.forEach((season) => {
      const recipes = Array.isArray(meal?.[season]) ? meal[season] : [];
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

function main() {
  const grouped = new Map<string, AlchemicalRecipe[]>();

  Object.entries(primaryCuisines).forEach(([baseCuisineName, cuisine]) => {
    const recipes = collectUniqueRecipes(cuisine as any);
    recipes.forEach((recipe) => {
      const targets = new Set<string>([
        normalizeCuisineName(baseCuisineName),
        ...extractCuisineAliases(recipe),
      ]);
      targets.forEach((cuisineName) => {
        if (!cuisineName) return;
        if (!grouped.has(cuisineName)) grouped.set(cuisineName, []);
        grouped.get(cuisineName)!.push(recipe);
      });
    });
  });

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

  const cuisines = cuisineComputations
    .map(({ cuisineName, computed }) => ({
      cuisine: cuisineName,
      sampleSize: computed.sampleSize,
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
    }))
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

try {
  main();
} catch (error) {
  console.error("CRITICAL ERROR IN SCRIPT:");
  console.error(error);
  process.exit(1);
}
