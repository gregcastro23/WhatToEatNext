/**
 * Behavioral Snapshot Witness
 *
 * Deterministic, offline regression gate verifying exact value equality and distribution
 * parity across domain engines (server planetary, live ephemeris, ingredient catalog,
 * recommender matrix, recipe synthesis, cuisine integration, and seasonal systems)
 * over fixed astronomical timestamps before and after refactoring.
 *
 * Usage:
 *   bun scripts/snapshot-witness.ts --record   # Record fixtures/snapshot-witness-baseline.json
 *   bun scripts/snapshot-witness.ts            # Compare and assert 100% parity (exits 0 or 1)
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import {
  calculatePositionsWithAstronomyEngine,
  calculateAscendantPosition,
} from "../src/utils/serverPlanetaryCalculations";
import {
  calculateLivePositions,
  getLiveSkySnapshot,
  isDiurnalSect,
} from "../src/utils/liveEphemeris";
import { UnifiedIngredientService } from "../src/services/UnifiedIngredientService";

import {
  calculateFlavorCompatibility,
  calculateCuisineFlavorMatch,
  calculatePlanetaryFlavorMatch,
} from "../src/data/unified/flavorCompatibilityLayer";

// Recommender and pipeline imports for full domain coverage
import {
  getIngredientRecommendations,
  type IngredientRecommendationContext,
} from "../src/utils/recommendation/ingredientRecommendation";
import { getRecommendedIngredients } from "../src/utils/ingredientRecommender";
import { getRecommendedCookingMethods as getRecommendedCookingMethodsAsync } from "../src/utils/cookingMethodRecommender";
import { getRecommendedCookingMethods as getRecommendedCookingMethodsSync } from "../src/utils/recommendation/methodRecommendation";
import {
  unifiedSeasonalSystem,
  getSeasonalScore,
  isInSeason,
} from "../src/data/unified/seasonal";
import { spices } from "../src/data/ingredients/spices";
import { buildRecipe } from "../src/data/unified/recipeBuilding";
import {
  IngredientFilterService,
  INGREDIENT_GROUPS,
} from "../src/services/IngredientFilterService";
import { getCuisineData } from "../src/data/cuisines/index";
import { unifiedCuisineIntegrationSystem } from "../src/data/unified/cuisineIntegrations";
import { CuisineEnhancer } from "../src/data/unified/cuisines";
import { RecommendationAdapter } from "../src/services/RecommendationAdapter";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE_PATH = resolve(__dirname, "fixtures/snapshot-witness-baseline.json");

export async function generateSnapshot() {
  const dates = [
    new Date("2026-03-20T14:46:00Z"), // Vernal Equinox 2026
    new Date("2026-06-21T08:24:00Z"), // Summer Solstice 2026
    new Date("2026-09-22T23:05:00Z"), // Autumnal Equinox 2026
    new Date("2026-12-21T20:50:00Z"), // Winter Solstice 2026
  ];

  // 1. Server Planetary Calculations (Offline astronomy-engine kinematics)
  const serverPlanetary = dates.map((d) => {
    const { positions, usedFallback } = calculatePositionsWithAstronomyEngine(d);
    return {
      usedFallback,
      planets: Object.keys(positions).sort(),
      details: Object.fromEntries(
        Object.entries(positions).map(([name, pos]) => [
          name,
          {
            sign: pos.sign,
            degree: pos.degree,
            minute: pos.minute,
            exactLongitude: Number(pos.exactLongitude.toFixed(6)),
            isRetrograde: pos.isRetrograde,
            longitudeSpeed: Number(pos.longitudeSpeed.toFixed(6)),
          },
        ]),
      ),
    };
  });

  // 2. Ascendant Positions
  const ascendants = dates.map((d) => {
    const pos = calculateAscendantPosition(d, 37.7749, -122.4194);
    return {
      sign: pos.sign,
      degree: pos.degree,
      minute: pos.minute,
      exactLongitude: Number(pos.exactLongitude.toFixed(6)),
    };
  });

  // 3. Live Ephemeris Positions & Sect
  const livePositions = dates.map((d) => {
    const posMap = calculateLivePositions(d);
    return Object.fromEntries(
      Object.entries(posMap).map(([name, pos]) => [
        name,
        {
          sign: pos.sign,
          degree: pos.degree,
          minute: pos.minute,
          exactLongitude: Number(pos.exactLongitude.toFixed(6)),
        },
      ]),
    );
  });

  const skySnapshots = dates.map((d) => {
    const snap = getLiveSkySnapshot(d);
    return {
      isDiurnal: snap.isDiurnal,
      planetCount: snap.planets.length,
      planets: snap.planets.map((p) => ({
        name: p.name,
        sign: p.position.sign,
        signElement: p.signElement,
        sectElement: p.sectElement,
        signQuality: p.signQuality,
        esms: p.esms,
      })),
    };
  });

  const diurnals = dates.map((d) => isDiurnalSect(d, 37.7749, -122.4194));

  // 4. Static Ingredient Catalog Domain Distribution & Rich Sampling
  const ingredientService = UnifiedIngredientService.getInstance();
  const allIngredients = ingredientService.getAllIngredients();
  const categoryCounts: Record<string, number> = {};
  for (const [cat, list] of Object.entries(allIngredients).sort(([a], [b]) => a.localeCompare(b))) {
    categoryCounts[cat] = list.length;
  }

  // Sample 10 canonical ingredients across categories with real varying fields
  const sampleNames = [
    "garlic",
    "ginger",
    "olive oil",
    "tomato",
    "basil",
    "rice",
    "black pepper",
    "salmon",
    "chicken",
    "lemon",
  ];
  const sampleItems = sampleNames.map((name) => {
    const item = ingredientService.getIngredientByName(name);
    return {
      name,
      found: Boolean(item),
      category: item?.category ?? null,
      elementalProperties: item?.elementalProperties ?? null,
      qualities: item?.qualities ?? [],
      tasteProfile: item?.sensoryProfile?.tasteProfile ?? null,
    };
  });

  // 5. Flavor Compatibility & Resonance Engine
  const sampleProfiles = [
    { sweet: 0.8, sour: 0.2, salty: 0.1, bitter: 0.0, umami: 0.3, spicy: 0.0 },
    { sweet: 0.1, sour: 0.1, salty: 0.7, bitter: 0.2, umami: 0.8, spicy: 0.4 },
    { sweet: 0.0, sour: 0.4, salty: 0.2, bitter: 0.5, umami: 0.1, spicy: 0.8 },
  ];

  const flavorCompatibility = {
    pairScores: sampleProfiles.map((p1, idx1) =>
      sampleProfiles.map((p2, idx2) => ({
        pair: `${idx1}-${idx2}`,
        result: calculateFlavorCompatibility(p1, p2),
      })),
    ),
    cuisineMatches: ["Italian", "Mexican", "Japanese", "Indian"].map((cuisine) => ({
      cuisine,
      scores: sampleProfiles.map((p) => calculateCuisineFlavorMatch(p, cuisine)),
    })),
    planetaryMatches: ["Mars", "Venus", "Jupiter", "Saturn"].map((planet) => ({
      planet,
      scores: sampleProfiles.map((p) =>
        calculatePlanetaryFlavorMatch(p, { [planet]: 0.9, Sun: 0.3 }),
      ),
    })),
  };

  // 6. Recommender Matrix & Ingredient Scoring (Exercises ingredientRecommendation.ts & ingredientRecommender.ts)
  const testAstroContext: IngredientRecommendationContext = {
    Fire: 0.35,
    Water: 0.25,
    Earth: 0.20,
    Air: 0.20,
    timestamp: new Date("2026-03-20T14:46:00Z"),
    currentStability: 0.8,
    planetaryAlignment: {
      Sun: { sign: "Aries", degree: 0.5 },
      Moon: { sign: "Cancer", degree: 14.2 },
      Mars: { sign: "Scorpio", degree: 22.1 },
      Venus: { sign: "Taurus", degree: 8.0 },
    },
    currentZodiac: "Aries",
    activePlanets: ["Sun", "Mars", "Venus"],
    lunarPhase: "First Quarter",
    aspects: [
      { aspectType: "trine", planet1: "Sun", planet2: "Mars" },
      { aspectType: "sextile", planet1: "Sun", planet2: "Venus" },
    ],
  };

  const ingredientRecs = await getIngredientRecommendations(testAstroContext, {
    maxResults: 8,
    modalityPreference: "Cardinal",
  });

  const astroStateLegacy = {
    activePlanets: ["Sun", "Mars", "Venus"],
    currentZodiac: "Aries",
    timestamp: new Date("2026-03-20T14:46:00Z"),
  };
  const legacyIngredientRecs = getRecommendedIngredients(astroStateLegacy).slice(0, 8);

  const flatEnhancedRecs = Object.values(ingredientRecs).flat();

  const recommenderIngredients = {
    categoryCount: Object.keys(ingredientRecs).length,
    enhancedCount: flatEnhancedRecs.length,
    enhancedTop: flatEnhancedRecs.slice(0, 5).map((r) => ({
      name: r.name,
      totalScore: Number((r.totalScore ?? r.matchScore ?? 0).toFixed(4)),
      elementalScore: Number((r.elementalScore ?? 0).toFixed(4)),
      flavorScore: Number((r.flavorScore ?? 0).toFixed(4)),
      seasonalScore: Number((r.seasonalScore ?? 0).toFixed(4)),
    })),
    legacyTopNames: legacyIngredientRecs.map((i) => i.name),
  };

  // 7. Cooking Method Recommendation (Exercises cookingMethodRecommender.ts & methodRecommendation.ts)
  const testElements = { Fire: 0.4, Water: 0.2, Earth: 0.3, Air: 0.1 };
  const asyncMethods = await getRecommendedCookingMethodsAsync(
    testElements,
    "Aries",
    ["Sun", "Mars"],
    "spring",
  );
  const syncMethods = getRecommendedCookingMethodsSync(
    testElements,
    "Aries",
    ["Sun", "Mars"],
    "spring",
    "Italian",
  );

  const recommenderCookingMethods = {
    asyncCount: asyncMethods.length,
    asyncTop: asyncMethods.slice(0, 5).map((m) => ({
      name: m.name,
      score: Number(m.score.toFixed(4)),
      heat: m.thermodynamicProperties?.heat ?? null,
    })),
    syncCount: syncMethods.length,
    syncTop: syncMethods.slice(0, 5).map((m) => ({
      name: m.name,
      score: Number(m.score.toFixed(4)),
      heat: m.thermodynamics.heat,
    })),
  };

  // 8. Seasonal Engine (Exercises seasonal.ts)
  const springRecs = unifiedSeasonalSystem.getSeasonalRecommendations("spring");
  const autumnRecs = unifiedSeasonalSystem.getSeasonalRecommendations("autumn");
  const recommenderSeasonal = {
    springOptimalMethods: springRecs.optimalCookingMethods,
    autumnOptimalMethods: autumnRecs.optimalCookingMethods,
    garlicSpringScore: getSeasonalScore("garlic", "spring"),
    tomatoSummerInSeason: isInSeason("tomato", 0.5),
  };

  // 9. Spice Catalog & Mappings (Exercises spices/index.ts)
  const spiceKeys = Object.keys(spices).sort();
  const sampleSpices = ["cumin", "turmeric", "cinnamon", "cardamom", "coriander"].map(
    (name) => {
      const spice = spices[name];
      return {
        name,
        found: Boolean(spice),
        element: spice?.elementalProperties ?? null,
      };
    },
  );
  const spiceRegistry = {
    totalSpices: spiceKeys.length,
    samples: sampleSpices,
  };

  // 10. Recipe Building & Synthesis (Exercises recipeBuilding.ts)
  const builtRecipe = buildRecipe({
    cuisine: "Italian",
    season: "spring",
    targetKalchm: 1.0,
  });
  const recommenderRecipeBuilding = {
    success: builtRecipe.success,
    recipeName: builtRecipe.recipe?.name ?? null,
    ingredientCount: builtRecipe.recipe?.ingredients?.length ?? null,
    monicaOptimizationScore:
      typeof builtRecipe.recipe?.monicaOptimization?.optimizationScore === "number"
        ? Number(builtRecipe.recipe.monicaOptimization.optimizationScore.toFixed(4))
        : null,
    seasonalScore:
      typeof builtRecipe.recipe?.seasonalAdaptation?.seasonalScore === "number"
        ? Number(builtRecipe.recipe.seasonalAdaptation.seasonalScore.toFixed(4))
        : null,
    criteriaMatched: builtRecipe.metrics?.criteriaMatched ?? null,
    kalchmAccuracy:
      typeof builtRecipe.metrics?.kalchmAccuracy === "number"
        ? Number(builtRecipe.metrics.kalchmAccuracy.toFixed(4))
        : null,
  };

  // 11. Ingredient Filtering (Exercises IngredientFilterService.ts)
  const filterService = IngredientFilterService.getInstance();
  const springFiltered = filterService.filterIngredients({
    season: ["spring"],
  });
  const elementalFiltered = filterService.filterIngredients({
    elemental: { Fire: 0.3 },
  });
  const recommenderFiltering = {
    springVegetableCount: springFiltered[INGREDIENT_GROUPS.VEGETABLES]?.length ?? null,
    springHerbCount: springFiltered[INGREDIENT_GROUPS.HERBS]?.length ?? null,
    fireSpiceCount: elementalFiltered[INGREDIENT_GROUPS.SPICES]?.length ?? null,
    fireProteinCount: elementalFiltered[INGREDIENT_GROUPS.PROTEINS]?.length ?? null,
  };

  const italianCuisine = await getCuisineData("Italian");
  const japaneseCuisine = await getCuisineData("Japanese");
  const compatibility = unifiedCuisineIntegrationSystem.calculateCuisineCompatibility(
    "italian",
    "japanese",
  );
  const cuisineKalchm = italianCuisine
    ? CuisineEnhancer.calculateCuisineKalchm(italianCuisine)
    : null;

  const recommenderCuisines = {
    italianFound: Boolean(italianCuisine),
    italianDishCount: {
      breakfast: italianCuisine?.dishes?.breakfast?.all?.length ?? null,
      dinner: italianCuisine?.dishes?.dinner?.all?.length ?? null,
    },
    japaneseFound: Boolean(japaneseCuisine),
    monicaCompatibility: Number((compatibility?.monicaCompatibility ?? 0).toFixed(4)),
    kalchmHarmony: Number((compatibility?.kalchmHarmony ?? 0).toFixed(4)),
    culturalSynergy: Number((compatibility?.culturalSynergy ?? 0).toFixed(4)),
    sharedMethods: compatibility?.sharedCookingMethods ?? [],
    italianKalchmAnalysis: cuisineKalchm
      ? {
          totalKalchm: Number(cuisineKalchm.totalKalchm.toFixed(4)),
          averageRecipeKalchm: Number(cuisineKalchm.averageRecipeKalchm.toFixed(4)),
          recipesAnalyzed: cuisineKalchm.recipesAnalyzed,
        }
      : null,
  };

  // 13. Recommendation Adapter (Exercises RecommendationAdapter.ts)
  const adapterItems = [
    {
      name: "garlic",
      elementalProperties: { Fire: 0.6, Water: 0.1, Earth: 0.2, Air: 0.1 },
    },
    {
      name: "tomato",
      elementalProperties: { Fire: 0.2, Water: 0.6, Earth: 0.1, Air: 0.1 },
    },
  ];
  const adapter = new RecommendationAdapter(adapterItems, [], []);
  const samplePositions = {
    sun: { sign: "aries", degree: 0.5, isRetrograde: false },
    moon: { sign: "cancer", degree: 14.2, isRetrograde: false },
    mercury: { sign: "pisces", degree: 28.1, isRetrograde: false },
    venus: { sign: "taurus", degree: 8.0, isRetrograde: false },
    mars: { sign: "scorpio", degree: 22.1, isRetrograde: false },
    jupiter: { sign: "gemini", degree: 15.3, isRetrograde: false },
    saturn: { sign: "pisces", degree: 12.4, isRetrograde: false },
    uranus: { sign: "taurus", degree: 27.9, isRetrograde: false },
    neptune: { sign: "pisces", degree: 29.5, isRetrograde: false },
    pluto: { sign: "aquarius", degree: 2.1, isRetrograde: false },
  };
  adapter.initialize(
    samplePositions,
    true,
    "aries",
    "Full Moon",
  );
  const transformedSample = adapter.getAllTransformedIngredients().map((item) => ({
    name: item.name,
    spirit: Number((item.alchemicalProperties?.Spirit ?? 0).toFixed(4)),
    essence: Number((item.alchemicalProperties?.Essence ?? 0).toFixed(4)),
    matter: Number((item.alchemicalProperties?.Matter ?? 0).toFixed(4)),
    substance: Number((item.alchemicalProperties?.Substance ?? 0).toFixed(4)),
    heat: Number((item.alchemicalProperties?.heat ?? 0).toFixed(4)),
    gregsEnergy: Number((item.alchemicalProperties?.gregsEnergy ?? 0).toFixed(4)),
  }));
  const recommenderAdapter = {
    dominantProperty: adapter.getDominantAlchemicalProperty(),
    heatIndex: Number(adapter.getHeatIndex()?.toFixed(4) ?? 0),
    entropyIndex: Number(adapter.getEntropyIndex()?.toFixed(4) ?? 0),
    reactivityIndex: Number(adapter.getReactivityIndex()?.toFixed(4) ?? 0),
    gregsEnergyIndex: Number(adapter.getGregsEnergyIndex()?.toFixed(4) ?? 0),
    transformedCount: adapter.getAllTransformedIngredients().length,
    transformedSample,
  };

  return {
    serverPlanetary,
    ascendants,
    livePositions,
    skySnapshots,
    diurnals,
    catalog: {
      categoryCounts,
      totalIngredients: Object.values(categoryCounts).reduce((a, b) => a + b, 0),
      samples: sampleItems,
    },
    flavorCompatibility,
    recommenderIngredients,
    recommenderCookingMethods,
    recommenderSeasonal,
    spiceRegistry,
    recommenderRecipeBuilding,
    recommenderFiltering,
    recommenderCuisines,
    recommenderAdapter,
  };
}

// ---------------------------------------------------------------------------
// CLI Execution & Assertion
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const isRecordMode = args.includes("--record");

const currentSnapshot = await generateSnapshot();
const currentJson = JSON.stringify(currentSnapshot, null, 2);

if (isRecordMode) {
  mkdirSync(dirname(FIXTURE_PATH), { recursive: true });
  writeFileSync(FIXTURE_PATH, currentJson + "\n", "utf8");
  process.stderr.write(`✅ Snapshot baseline recorded to ${FIXTURE_PATH}\n`);
  process.exit(0);
}

if (!existsSync(FIXTURE_PATH)) {
  process.stderr.write(
    `❌ Snapshot baseline fixture not found at ${FIXTURE_PATH}. Run with --record first.\n`,
  );
  process.exit(1);
}

const baselineJson = readFileSync(FIXTURE_PATH, "utf8").trim();

if (currentJson === baselineJson) {
  process.stderr.write("✅ Behavioral snapshot witness: 100% parity with baseline.\n");
  process.exit(0);
} else {
  process.stderr.write("❌ Behavioral snapshot witness mismatch! Domain regressions detected.\n");
  // Simple diff preview
  const baselineObj = JSON.parse(baselineJson);
  for (const key of Object.keys(currentSnapshot) as Array<keyof typeof currentSnapshot>) {
    const curStr = JSON.stringify(currentSnapshot[key]);
    const baseStr = JSON.stringify(baselineObj[key]);
    if (curStr !== baseStr) {
      process.stderr.write(`  Mismatch in section: '${key}'\n`);
    }
  }
  process.exit(1);
}
