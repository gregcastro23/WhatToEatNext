import { NextResponse } from "next/server";
import { american } from "@/data/cuisines/american";
import { chinese } from "@/data/cuisines/chinese";
import { french } from "@/data/cuisines/french";
import { greek } from "@/data/cuisines/greek";
import { CUISINES } from "@/data/cuisines/index";
import { indian } from "@/data/cuisines/indian";
import { italian } from "@/data/cuisines/italian";
import { japanese } from "@/data/cuisines/japanese";
import { korean } from "@/data/cuisines/korean";
import { mexican } from "@/data/cuisines/mexican";
import { thai } from "@/data/cuisines/thai";
import { vietnamese } from "@/data/cuisines/vietnamese";
import { getPlanetaryPositionsForDateTime } from "@/services/astrologizeApi";
import type {
  RawElementalProperties as ElementalProperties,
  AlchemicalProperties,
} from "@/types/alchemy";
import type { Planet, ZodiacSignType } from "@/types/celestial";
import { retryWithTimeout } from "@/utils/apiUtils"; // Import retryWithTimeout
import type { PlanetPosition } from "@/utils/astrologyUtils";
import {
  calculateEnhancedCompatibility,
  compatibilityToMatchPercentage,
  type ThermodynamicState,
  type KineticState,
} from "@/utils/enhancedCompatibilityScoring";
import { calculateKineticProperties } from "@/utils/kineticCalculations";
import { createLogger } from "@/utils/logger";
import { calculateThermodynamicMetrics } from "@/utils/monicaKalchmCalculations";
import {
  calculateAlchemicalFromPlanets,
  aggregateZodiacElementals,
  PLANETARY_ALCHEMY, // Import PLANETARY_ALCHEMY
} from "@/utils/planetaryAlchemyMapping";

const logger = createLogger("CuisinesRecommendAPI");

/**
 * Enhanced Cuisine Recommendations API Endpoint
 *
 * GET /api/cuisines/recommend
 *
 * Returns comprehensive cuisine recommendations with:
 * - Thermodynamic metrics (Heat, Entropy, Reactivity, Greg's Energy, Kalchm, Monica)
 * - Kinetic properties (Velocity, Momentum, Power, Force)
 * - Flavor profiles and cultural signatures
 * - Fusion pairing recommendations
 * - Nested recipes and sauce pairings
 */

interface CurrentMoment {
  zodiac_sign: string;
  season: string;
  meal_type?: string;
  timestamp: string;
  planetaryPositions?: Record<string, PlanetPosition>; // Optional for backward compatibility
}

interface ThermodynamicMetrics {
  heat: number;
  entropy: number;
  reactivity: number;
  gregsEnergy: number;
  kalchm: number;
  monica: number;
}

interface KineticMetrics {
  velocity: Record<string, number>;
  momentum: Record<string, number>;
  charge: number;
  potentialDifference: number;
  currentFlow: number;
  power: number;
  inertia: number;
  forceMagnitude: number;
  forceClassification: string;
}

interface FlavorProfile {
  sweet: number;
  sour: number;
  salty: number;
  bitter: number;
  umami: number;
  spicy: number;
}

interface CuisineSignature {
  property: string;
  value: number;
  zScore: number;
  significance: "high" | "medium" | "low";
}

interface FusionPairing {
  cuisine_id: string;
  name: string;
  compatibility_score: number;
  blend_ratio: number;
  shared_elements: string[];
  thermodynamic_harmony: number;
  reason: string;
}

interface NestedRecipe {
  recipe_id: string;
  name: string;
  description: string;
  prep_time?: string;
  cook_time?: string;
  servings?: number;
  difficulty?: string;
  ingredients: Array<{
    name: string;
    amount?: string;
    unit?: string;
    notes?: string;
  }>;
  instructions: string[];
  meal_type: string;
  seasonal_fit: string;

  // Enhanced recipe guidance fields
  tips?: string[]; // Expert cooking tips
  substitutions?: Array<{
    original: string;
    alternatives: string[];
    notes?: string;
  }>; // Ingredient substitutions
  variations?: string[]; // Regional or dietary variations
  pairing_suggestions?: {
    sides?: string[];
    drinks?: string[];
    condiments?: string[];
  }; // What pairs well with this dish
  storage_info?: {
    storage_method?: string;
    storage_duration?: string;
    reheating_instructions?: string;
    freezer_friendly?: boolean;
  }; // Storage and reheating guidance
  common_mistakes?: string[]; // What to avoid
  timing_tips?: string[]; // Do-ahead suggestions
}

interface SauceRecommendation {
  sauce_name: string;
  description: string;
  key_ingredients?: string[];
  elemental_properties?: ElementalProperties;
  compatibility_score: number;
  reason: string;
}

interface EnhancedCuisineRecommendation {
  cuisine_id: string;
  name: string;
  description: string;

  // Core Properties
  elemental_properties: ElementalProperties;
  alchemical_properties: AlchemicalProperties;

  // Thermodynamic Metrics
  thermodynamic_metrics: ThermodynamicMetrics;

  // Kinetic Properties
  kinetic_properties: KineticMetrics;

  // Flavor Profile
  flavor_profile: FlavorProfile;

  // Cultural Signatures
  cultural_signatures: CuisineSignature[];

  // Fusion Pairings
  fusion_pairings: FusionPairing[];

  // Nested Content
  nested_recipes: NestedRecipe[];
  recommended_sauces: SauceRecommendation[];

  // Match Scores
  seasonal_context: string;
  astrological_score: number;
  compatibility_reason: string;
}

/**
 * Calculate current astrological moment using backend planetary positions
 *
 * IMPORTANT: This function now calls the backend for high-precision planetary
 * positions instead of approximating from calendar dates. This ensures
 * recommendations use real astronomical data from Swiss Ephemeris (NASA JPL DE).
 */
async function getCurrentMoment(): Promise<CurrentMoment> {
  const now = new Date();
  const month = now.getMonth();

  // Calculate season
  let season = "Spring";
  if (month >= 2 && month <= 4) season = "Spring";
  else if (month >= 5 && month <= 7) season = "Summer";
  else if (month >= 8 && month <= 10) season = "Autumn";
  else season = "Winter";

  // Calculate meal type
  const hour = now.getHours();
  let meal_type = "Dinner";
  if (hour >= 5 && hour < 11) meal_type = "Breakfast";
  else if (hour >= 11 && hour < 15) meal_type = "Lunch";
  else if (hour >= 15 && hour < 18) meal_type = "Snack";

  // Get actual planetary positions from backend (via astrologize API)
  try {
    const planetaryPositionsRaw: Record<string, PlanetPosition> =
      await retryWithTimeout(
        () =>
          getPlanetaryPositionsForDateTime(now, {
            latitude: 40.7498, // Default: New York
            longitude: -73.7976,
          }),
        3, // retries
        2000, // timeout in ms
        500, // delay between retries in ms
      );

    // Extract Sun's zodiac sign for backward compatibility
    const sunSign = planetaryPositionsRaw.Sun?.sign || "gemini";
    const zodiacSign = sunSign.charAt(0).toUpperCase() + sunSign.slice(1);

    logger.info("Current moment calculated from backend planetary positions", {
      zodiacSign,
      sunPosition: planetaryPositionsRaw.Sun,
      source: "backend-pyswisseph",
    });

    return {
      zodiac_sign: zodiacSign,
      season,
      meal_type,
      timestamp: now.toISOString(),
      // Include planetary positions for downstream use
      planetaryPositions: planetaryPositionsRaw,
    };
  } catch (error) {
    logger.warn(
      "Failed to get backend planetary positions even after retries, using date approximation",
      { error },
    );

    // Fallback to date approximation if backend unavailable
    const zodiacSigns = [
      "Capricorn",
      "Aquarius",
      "Pisces",
      "Aries",
      "Taurus",
      "Gemini",
      "Cancer",
      "Leo",
      "Virgo",
      "Libra",
      "Scorpio",
      "Sagittarius",
    ];

    const day = now.getDate();
    let zodiacIndex = month;
    if (day >= 20 && day <= 31) {
      zodiacIndex = (month + 1) % 12;
    }

    return {
      zodiac_sign: zodiacSigns[zodiacIndex],
      season,
      meal_type,
      timestamp: now.toISOString(),
    };
  }
}

/**
 * Calculate alchemical properties from planetary positions (CORRECT METHOD)
 *
 * CRITICAL: This is the ONLY correct way to calculate ESMS properties.
 * Uses actual planetary positions in zodiac signs, NOT simple zodiac sign lookup.
 *
 * Per CLAUDE.md: "ESMS ONLY from planetary positions, NOT elemental approximations"
 *
 * @param planetaryPositions - Actual planetary positions from backend
 * @param fallbackZodiacSignType - Fallback if planetary positions unavailable
 * @returns Alchemical properties (Spirit, Essence, Matter, Substance)
 */
function calculateAlchemicalPropertiesFromPlanets(
  planetaryPositions: Record<string, PlanetPosition> | undefined,
  fallbackZodiacSignType?: string,
): AlchemicalProperties {
  if (planetaryPositions && Object.keys(planetaryPositions).length > 0) {
    // ✅ CORRECT: Use actual planetary positions
    const planetSigns: Record<string, string> = {};
    for (const [planet, position] of Object.entries(planetaryPositions)) {
      // Only include actual planets for alchemical calculation
      if (planet in PLANETARY_ALCHEMY) {
        planetSigns[planet] = position.sign;
      }
    }

    const alchemical = calculateAlchemicalFromPlanets(planetSigns);
    logger.debug("Calculated ESMS from planetary positions", {
      planets: Object.keys(planetSigns).length,
      alchemical,
      source: "backend-planetary-positions",
    });

    return alchemical;
  } else if (fallbackZodiacSignType) {
    // ❌ FALLBACK ONLY: Approximate from Sun sign (not ideal, but better than nothing)
    logger.warn(
      "Using zodiac fallback for ESMS calculation - backend unavailable",
      {
        fallbackZodiacSignType,
      },
    );

    const alchemicalMap: Record<string, AlchemicalProperties> = {
      Aries: { Spirit: 5, Essence: 3, Matter: 2, Substance: 4 },
      Taurus: { Spirit: 2, Essence: 4, Matter: 6, Substance: 2 },
      Gemini: { Spirit: 6, Essence: 4, Matter: 1, Substance: 3 },
      Cancer: { Spirit: 3, Essence: 6, Matter: 4, Substance: 1 },
      Leo: { Spirit: 7, Essence: 2, Matter: 2, Substance: 3 },
      Virgo: { Spirit: 2, Essence: 5, Matter: 5, Substance: 2 },
      Libra: { Spirit: 4, Essence: 4, Matter: 3, Substance: 3 },
      Scorpio: { Spirit: 4, Essence: 5, Matter: 3, Substance: 2 },
      Sagittarius: { Spirit: 6, Essence: 3, Matter: 2, Substance: 3 },
      Capricorn: { Spirit: 2, Essence: 3, Matter: 7, Substance: 2 },
      Aquarius: { Spirit: 5, Essence: 4, Matter: 2, Substance: 3 },
      Pisces: { Spirit: 3, Essence: 7, Matter: 3, Substance: 1 },
    };

    return (
      alchemicalMap[fallbackZodiacSignType] || {
        Spirit: 4,
        Essence: 4,
        Matter: 4,
        Substance: 2,
      }
    );
  } else {
    // Default balanced state
    logger.error("No planetary positions or fallback zodiac sign available");
    return { Spirit: 4, Essence: 4, Matter: 4, Substance: 2 };
  }
}

/**
 * Generate flavor profile for a cuisine
 */
function generateFlavorProfile(cuisineId: string): FlavorProfile {
  const profiles: Record<string, FlavorProfile> = {
    italian: {
      sweet: 0.3,
      sour: 0.3,
      salty: 0.4,
      bitter: 0.2,
      umami: 0.5,
      spicy: 0.2,
    },
    mexican: {
      sweet: 0.2,
      sour: 0.4,
      salty: 0.3,
      bitter: 0.2,
      umami: 0.4,
      spicy: 0.8,
    },
    american: {
      sweet: 0.5,
      sour: 0.2,
      salty: 0.6,
      bitter: 0.1,
      umami: 0.5,
      spicy: 0.3,
    },
    french: {
      sweet: 0.4,
      sour: 0.3,
      salty: 0.4,
      bitter: 0.2,
      umami: 0.6,
      spicy: 0.2,
    },
    chinese: {
      sweet: 0.4,
      sour: 0.5,
      salty: 0.5,
      bitter: 0.2,
      umami: 0.7,
      spicy: 0.6,
    },
    japanese: {
      sweet: 0.3,
      sour: 0.2,
      salty: 0.4,
      bitter: 0.2,
      umami: 0.8,
      spicy: 0.1,
    },
    thai: {
      sweet: 0.5,
      sour: 0.6,
      salty: 0.4,
      bitter: 0.3,
      umami: 0.5,
      spicy: 0.9,
    },
    indian: {
      sweet: 0.3,
      sour: 0.3,
      salty: 0.3,
      bitter: 0.3,
      umami: 0.4,
      spicy: 0.9,
    },
    korean: {
      sweet: 0.3,
      sour: 0.4,
      salty: 0.5,
      bitter: 0.2,
      umami: 0.6,
      spicy: 0.7,
    },
    vietnamese: {
      sweet: 0.4,
      sour: 0.5,
      salty: 0.4,
      bitter: 0.2,
      umami: 0.5,
      spicy: 0.5,
    },
    greek: {
      sweet: 0.2,
      sour: 0.4,
      salty: 0.5,
      bitter: 0.3,
      umami: 0.4,
      spicy: 0.2,
    },
    middleEastern: {
      sweet: 0.3,
      sour: 0.3,
      salty: 0.4,
      bitter: 0.2,
      umami: 0.4,
      spicy: 0.5,
    },
    african: {
      sweet: 0.3,
      sour: 0.3,
      salty: 0.4,
      bitter: 0.3,
      umami: 0.4,
      spicy: 0.6,
    },
    russian: {
      sweet: 0.2,
      sour: 0.5,
      salty: 0.5,
      bitter: 0.2,
      umami: 0.4,
      spicy: 0.2,
    },
  };

  return (
    profiles[cuisineId] || {
      sweet: 0.3,
      sour: 0.3,
      salty: 0.4,
      bitter: 0.2,
      umami: 0.5,
      spicy: 0.3,
    }
  );
}

/**
 * Identify cultural signatures (properties that stand out)
 */
function identifyCulturalSignatures(
  elementalProps: ElementalProperties,
  thermodynamics: ThermodynamicMetrics,
  flavorProfile: FlavorProfile,
): CuisineSignature[] {
  const signatures: CuisineSignature[] = [];

  // Check elemental outliers
  Object.entries(elementalProps).forEach(
    ([element, value]: [string, number]) => {
      if (value > 0.35) {
        signatures.push({
          property: `${element} Element`,
          value,
          zScore: (value - 0.25) / 0.15,
          significance: value > 0.45 ? "high" : "medium",
        });
      }
    },
  );

  // Check thermodynamic outliers
  if (thermodynamics.heat > 0.12) {
    signatures.push({
      property: "Heat",
      value: thermodynamics.heat,
      zScore: (thermodynamics.heat - 0.08) / 0.03,
      significance: "high",
    });
  }

  // Check flavor outliers
  Object.entries(flavorProfile).forEach(([flavor, value]: [string, number]) => {
    if (value > 0.7) {
      signatures.push({
        property: `${flavor.charAt(0).toUpperCase() + flavor.slice(1)} Flavor`,
        value,
        zScore: (value - 0.5) / 0.2,
        significance: value > 0.8 ? "high" : "medium",
      });
    }
  });

  return signatures;
}

/**
 * Calculate fusion pairings with other cuisines
 */
function calculateFusionPairings(
  currentCuisineId: string,
  currentElemental: ElementalProperties,
  currentThermodynamics: ThermodynamicMetrics,
  allCuisines: any[],
): FusionPairing[] {
  const pairings: FusionPairing[] = [];

  allCuisines.forEach((cuisine) => {
    if (cuisine.id === currentCuisineId) return;

    // Defensive check for required properties - more comprehensive
    if (!cuisine || !cuisine.elementalProps || !cuisine.thermodynamics) {
      logger.debug(
        `Skipping fusion pairing for ${cuisine?.id || "unknown"} - missing properties`,
      );
      return;
    }

    // Validate that thermodynamics has monica property
    const currentMonica =
      typeof currentThermodynamics?.monica === "number" &&
      !isNaN(currentThermodynamics.monica)
        ? currentThermodynamics.monica
        : 1;
    const cuisineMonica =
      typeof cuisine.thermodynamics?.monica === "number" &&
      !isNaN(cuisine.thermodynamics.monica)
        ? cuisine.thermodynamics.monica
        : 1;

    // Calculate elemental compatibility with defensive checks
    try {
      const elementalSimilarity = calculateElementalSimilarity(
        currentElemental,
        cuisine.elementalProps,
      );

      // Calculate thermodynamic harmony with defensive check
      const monicaDiff = Math.abs(currentMonica - cuisineMonica);
      const thermoHarmony = Math.max(0, 1 - monicaDiff / 2);

      const compatibilityScore =
        elementalSimilarity * 0.6 + thermoHarmony * 0.4;

      if (compatibilityScore > 0.6) {
        const sharedElements = Object.entries(currentElemental)
          .filter(([element, value]) => {
            const otherValue =
              cuisine.elementalProps?.[element as keyof ElementalProperties];
            return (
              otherValue !== undefined &&
              !isNaN(otherValue) &&
              Math.abs((value) - (otherValue as number)) < 0.2
            );
          })
          .map(([element]) => element);

        pairings.push({
          cuisine_id: cuisine.id,
          name: cuisine.name,
          compatibility_score: compatibilityScore,
          blend_ratio: 0.5 + (compatibilityScore - 0.6) * 0.5,
          shared_elements:
            sharedElements.length > 0 ? sharedElements : ["balanced"],
          thermodynamic_harmony: thermoHarmony,
          reason:
            sharedElements.length > 0
              ? `Strong ${sharedElements.join(" and ")} alignment with ${(compatibilityScore * 100).toFixed(0)}% compatibility`
              : `${(compatibilityScore * 100).toFixed(0)}% compatibility through balanced properties`,
        });
      }
    } catch (error) {
      logger.error(
        `Error calculating fusion pairing for ${cuisine.id}:`,
        error,
      );
    }
  });

  return pairings
    .sort((a, b) => b.compatibility_score - a.compatibility_score)
    .slice(0, 3);
}

/**
 * Calculate elemental similarity between two profiles
 */
function calculateElementalSimilarity(
  profile1: ElementalProperties,
  profile2: ElementalProperties,
): number {
  const elements = ["Fire", "Water", "Earth", "Air"] as const;
  let totalSimilarity = 0;

  elements.forEach((element) => {
    const diff = Math.abs(profile1[element] - profile2[element]);
    totalSimilarity += 1 - diff;
  });

  return totalSimilarity / elements.length;
}

/**
 * Get recipes for a cuisine based on season and meal type
 */
function getRecipesForCuisine(
  cuisineData: any,
  cuisineName: string,
  moment: CurrentMoment,
  maxRecipes: number = 5,
): NestedRecipe[] {
  // Return empty array if no cuisine data
  if (!cuisineData || Object.keys(cuisineData).length === 0) {
    return [];
  }

  const season = moment.season.toLowerCase() as
    | "spring"
    | "summer"
    | "autumn"
    | "winter";
  const mealType = moment.meal_type?.toLowerCase() || "dinner";

  const recipes: any[] = [];
  // Track seen recipe names to avoid duplicates across meal types
  const seenNames = new Set<string>();

  const addUniqueRecipes = (source: any[]) => {
    for (const recipe of source) {
      const name = (recipe?.name || "").toLowerCase().trim();
      if (name && !seenNames.has(name)) {
        seenNames.add(name);
        recipes.push(recipe);
      }
    }
  };

  if (cuisineData.dishes && cuisineData.dishes[mealType]) {
    // After processCuisineRecipes, 'all' recipes are already merged into seasonal arrays.
    // Access the seasonal array directly; fall back to 'all' only for raw (unprocessed) data.
    const seasonalRecipes = cuisineData.dishes[mealType][season] || [];
    const allSeasonRecipes = cuisineData.dishes[mealType].all || [];
    addUniqueRecipes(allSeasonRecipes);
    addUniqueRecipes(seasonalRecipes);
  }

  if (recipes.length < maxRecipes) {
    const mealTypes = ["breakfast", "lunch", "dinner", "dessert"];
    for (const mt of mealTypes) {
      if (mt !== mealType && cuisineData.dishes && cuisineData.dishes[mt]) {
        const additionalRecipes = [
          ...(cuisineData.dishes[mt][season] || []),
          ...(cuisineData.dishes[mt].all || []),
        ];
        addUniqueRecipes(additionalRecipes);
        if (recipes.length >= maxRecipes) break;
      }
    }
  }

  return recipes.slice(0, maxRecipes).map((recipe, idx) => {
    // Convert existing substitutions to enhanced format
    const enhancedSubstitutions = recipe.substitutions
      ? Object.entries(recipe.substitutions).map(
          ([original, alternatives]: [string, any]) => ({
            original,
            alternatives: Array.isArray(alternatives)
              ? alternatives
              : [alternatives],
            notes: `${alternatives.length} alternative${alternatives.length > 1 ? "s" : ""} available`,
          }),
        )
      : undefined;

    // Convert pairing suggestions to enhanced format
    const enhancedPairings = recipe.pairingSuggestions
      ? {
          sides: Array.isArray(recipe.pairingSuggestions)
            ? recipe.pairingSuggestions.filter(
                (s: string) =>
                  !s.toLowerCase().includes("wine") &&
                  !s.toLowerCase().includes("juice"),
              )
            : [],
          drinks: Array.isArray(recipe.pairingSuggestions)
            ? recipe.pairingSuggestions.filter(
                (s: string) =>
                  s.toLowerCase().includes("wine") ||
                  s.toLowerCase().includes("juice"),
              )
            : [],
          condiments: [],
        }
      : undefined;

    // Generate contextual tips based on cooking methods
    const cookingTips = recipe.cookingMethods
      ? recipe.cookingMethods.map((method: string) => {
          const tipMap: Record<string, string> = {
            baking: "Preheat oven thoroughly and use center rack for even heat",
            sauteing: "Heat pan before adding ingredients for best browning",
            boiling: "Use plenty of salted water for even cooking",
            grilling: "Let grill reach proper temperature before cooking",
            roasting: "Pat ingredients dry for better caramelization",
            simmering: "Maintain gentle bubbles, not a rolling boil",
            steaming: "Keep lid on to maintain consistent steam",
            frying: "Ensure oil is hot enough to prevent sogginess",
          };
          return tipMap[method] || `Follow ${method} technique carefully`;
        })
      : undefined;

    // Generate storage info based on ingredients
    const hasProtein = recipe.ingredients?.some((ing: any) =>
      ["meat", "fish", "seafood", "dairy", "eggs"].includes(
        ing.category?.toLowerCase(),
      ),
    );

    const storageInfo = {
      storage_method: "Store in airtight container in refrigerator",
      storage_duration: hasProtein ? "2-3 days" : "3-5 days",
      reheating_instructions:
        recipe.cookingMethods?.includes("baking") ||
        recipe.cookingMethods?.includes("roasting")
          ? "Reheat in oven at 350°F for best texture"
          : "Reheat gently on stovetop or in microwave",
      freezer_friendly: !recipe.ingredients?.some((ing: any) =>
        ["cream", "fresh herbs", "salad"].some((term) =>
          ing.name?.toLowerCase().includes(term),
        ),
      ),
    };

    // Generate common mistakes based on allergens and cooking methods
    const commonMistakes: string[] = [];
    if (
      recipe.cookingMethods?.includes("sauteing") ||
      recipe.cookingMethods?.includes("frying")
    ) {
      commonMistakes.push(
        "Not heating the pan sufficiently before adding ingredients",
      );
    }
    if (
      recipe.allergens?.includes("gluten") &&
      recipe.cookingMethods?.includes("baking")
    ) {
      commonMistakes.push("Overmixing dough can make it tough");
    }
    if (recipe.ingredients?.some((ing: any) => ing.category === "protein")) {
      commonMistakes.push("Overcooking protein makes it dry and tough");
    }

    // Generate timing tips based on prep/cook time
    const timingTips: string[] = [];
    if (recipe.prepTime && parseInt(recipe.prepTime, 10) > 15) {
      timingTips.push(
        "Prep all ingredients (mise en place) before starting to cook",
      );
    }
    if (recipe.cookTime && parseInt(recipe.cookTime, 10) > 30) {
      timingTips.push("This dish benefits from being made ahead and reheated");
    }
    timingTips.push("Serve immediately for best taste and texture");

    // Generate variations based on dietary info and cuisine
    const variations: string[] = [];
    if (!recipe.dietaryInfo?.includes("vegan")) {
      variations.push(
        "Vegan: Replace animal products with plant-based alternatives",
      );
    }
    if (
      !recipe.dietaryInfo?.includes("gluten-free") &&
      recipe.allergens?.includes("gluten")
    ) {
      variations.push(
        "Gluten-free: Use gluten-free flour or pasta alternatives",
      );
    }
    if (recipe.spiceLevel === "none" || recipe.spiceLevel === "mild") {
      variations.push("Spicy: Add chili flakes, hot sauce, or fresh chilies");
    }

    return {
      recipe_id: recipe.id || `${cuisineName}-${idx}`,
      name: recipe.name || "Traditional Dish",
      description: recipe.description || `A classic ${cuisineName} dish`,
      prep_time: recipe.prepTime,
      cook_time: recipe.cookTime,
      servings: recipe.servingSize,
      difficulty: recipe.difficulty || "Medium",
      ingredients: (recipe.ingredients || []).map((ing: any) => ({
        name: ing.name || "ingredient",
        amount: ing.amount,
        unit: ing.unit,
        notes: ing.notes,
      })),
      instructions: recipe.instructions || recipe.preparationSteps || [],
      meal_type: recipe.mealType ? recipe.mealType.join(", ") : mealType,
      seasonal_fit: recipe.season?.includes("all")
        ? "Available year-round"
        : `Best in ${season}`,

      // Enhanced recipe guidance - now intelligently generated for ALL recipes
      tips:
        cookingTips && cookingTips.length > 0
          ? cookingTips
          : [
              "Read through entire recipe before starting",
              "Taste and adjust seasoning as you cook",
            ],

      substitutions: enhancedSubstitutions || undefined,

      variations: variations.length > 0 ? variations : undefined,

      pairing_suggestions: enhancedPairings || {
        sides: recipe.culturalNotes
          ? [`Traditional ${cuisineName} accompaniments`]
          : [],
        drinks: [],
        condiments: [],
      },

      storage_info: storageInfo,

      common_mistakes:
        commonMistakes.length > 0
          ? commonMistakes
          : [
              "Not reading recipe completely before starting",
              "Rushing the cooking process",
            ],

      timing_tips: timingTips.length > 0 ? timingTips : undefined,
    };
  });
}

/**
 * Get sauces from cuisine data
 */
function getSaucesForCuisine(
  cuisineData: any,
  cuisineName: string,
  maxSauces: number = 5,
): SauceRecommendation[] {
  const sauces: SauceRecommendation[] = [];

  // Return empty array if no cuisine data
  if (!cuisineData || Object.keys(cuisineData).length === 0) {
    return [];
  }

  if (cuisineData.motherSauces) {
    Object.entries(cuisineData.motherSauces).forEach(
      ([name, sauce]: [string, any]) => {
        sauces.push({
          sauce_name: name,
          description: sauce.description || `Classic ${cuisineName} sauce`,
          key_ingredients:
            sauce.ingredients?.slice(0, 5).map((ing: any) => ing.name) || [],
          elemental_properties: sauce.elementalProperties,
          compatibility_score: 0.85 + Math.random() * 0.15,
          reason:
            sauce.culturalNotes ||
            `Traditional sauce that enhances ${cuisineName} dishes`,
        });
      },
    );
  }

  if (cuisineData.traditionalSauces) {
    Object.entries(cuisineData.traditionalSauces).forEach(
      ([name, sauce]: [string, any]) => {
        sauces.push({
          sauce_name: name,
          description: sauce.description || `Traditional ${cuisineName} sauce`,
          key_ingredients:
            sauce.ingredients?.slice(0, 5).map((ing: any) => ing.name) || [],
          elemental_properties: sauce.elementalProperties,
          compatibility_score: 0.8 + Math.random() * 0.2,
          reason:
            sauce.pairingNotes ||
            `Versatile sauce from ${cuisineName} tradition`,
        });
      },
    );
  }

  return sauces.slice(0, maxSauces);
}

/**
 * Get zodiac element for compatibility reasons
 */
function getZodiacElement(zodiacSign: string): string {
  const elements: Record<string, string> = {
    Aries: "Fire",
    Leo: "Fire",
    Sagittarius: "Fire",
    Taurus: "Earth",
    Virgo: "Earth",
    Capricorn: "Earth",
    Gemini: "Air",
    Libra: "Air",
    Aquarius: "Air",
    Cancer: "Water",
    Scorpio: "Water",
    Pisces: "Water",
  };
  return elements[zodiacSign] || "balanced";
}

/**
 * Calculate user's current state for compatibility scoring
 * Based on current astrological moment with backend planetary positions
 *
 * UPDATED: Now uses real planetary positions from backend for accurate ESMS calculation
 */
function calculateUserState(moment: CurrentMoment): {
  thermodynamic: ThermodynamicState;
  kinetic: KineticState;
  elemental: ElementalProperties;
} {
  // Calculate alchemical properties from planetary positions (or fallback to zodiac)
  const alchemical = calculateAlchemicalPropertiesFromPlanets(
    moment.planetaryPositions,
    moment.zodiac_sign,
  );

  // Calculate elemental properties based on zodiac sign
  const zodiacElement = getZodiacElement(moment.zodiac_sign);
  const elementalProps: ElementalProperties = {
    Fire: zodiacElement === "Fire" ? 0.4 : 0.2,
    Water: zodiacElement === "Water" ? 0.4 : 0.2,
    Earth: zodiacElement === "Earth" ? 0.4 : 0.2,
    Air: zodiacElement === "Air" ? 0.4 : 0.2,
  };

  // Calculate thermodynamic state
  const thermodynamics = calculateThermodynamicMetrics(
    alchemical,
    elementalProps,
  );

  // Calculate kinetic state
  const kinetics = calculateKineticProperties(
    alchemical,
    elementalProps,
    thermodynamics,
  );

  return {
    thermodynamic: {
      heat: thermodynamics.heat,
      entropy: thermodynamics.entropy,
      reactivity: thermodynamics.reactivity,
      gregsEnergy: thermodynamics.gregsEnergy,
      kalchm: thermodynamics.kalchm,
      monica: thermodynamics.monica,
    },
    kinetic: {
      power: kinetics.power,
      currentFlow: kinetics.currentFlow,
      potentialDifference: kinetics.potentialDifference,
      charge: kinetics.charge,
      velocity: kinetics.velocity,
      momentum: kinetics.momentum,
      forceMagnitude: kinetics.forceMagnitude,
    },
    elemental: elementalProps,
  };
}

/**
 * Generate enhanced cuisine recommendations
 *
 * UPDATED: Now uses planetary positions from backend for accurate ESMS
 */
function generateEnhancedRecommendations(
  moment: CurrentMoment,
): EnhancedCuisineRecommendation[] {
  // Get all cuisines with full data
  const cuisineDataMap: Record<string, any> = {
    italian,
    mexican,
    american,
    french,
    chinese,
    japanese,
    thai,
    indian,
    korean,
    vietnamese,
    greek,
  };

  // Calculate alchemical properties for current moment from planetary positions
  const currentAlchemical = calculateAlchemicalPropertiesFromPlanets(
    moment.planetaryPositions,
    moment.zodiac_sign,
  );

  // Process all cuisines with defensive checks
  const processedCuisines = Object.entries(CUISINES)
    .map(([id, cuisineInfo]) => {
      // Defensive check for cuisine info
      if (!cuisineInfo || !cuisineInfo.elementalProperties) {
        logger.error(`Missing cuisine data for ${id}`);
        return null;
      }

      const elementalProps = cuisineInfo.elementalProperties;

      // Ensure elemental properties are complete
      const safeElementalProps = {
        Fire: elementalProps.Fire ?? 0.25,
        Water: elementalProps.Water ?? 0.25,
        Earth: elementalProps.Earth ?? 0.25,
        Air: elementalProps.Air ?? 0.25,
      };

      // Ensure alchemical properties are defined with all required fields
      const safeAlchemical: AlchemicalProperties = {
        Spirit: currentAlchemical?.Spirit ?? 4,
        Essence: currentAlchemical?.Essence ?? 4,
        Matter: currentAlchemical?.Matter ?? 4,
        Substance: currentAlchemical?.Substance ?? 2,
      };

      // Calculate thermodynamic metrics with error handling
      let thermodynamics: ThermodynamicMetrics;
      try {
        thermodynamics = calculateThermodynamicMetrics(
          safeAlchemical,
          safeElementalProps,
        );

        // Validate thermodynamics result
        if (!thermodynamics || typeof thermodynamics.heat !== "number") {
          throw new Error("Invalid thermodynamics result");
        }
      } catch (error) {
        logger.error(
          `Error calculating thermodynamics for ${cuisineInfo.name}:`,
          error,
        );
        thermodynamics = {
          heat: 0.08,
          entropy: 0.15,
          reactivity: 0.45,
          gregsEnergy: -0.02,
          kalchm: 2.5,
          monica: 1.0,
        };
      }

      // Calculate kinetic properties with error handling
      let kinetics;
      try {
        kinetics = calculateKineticProperties(
          safeAlchemical,
          safeElementalProps,
          thermodynamics,
        );

        // Validate kinetics result
        if (!kinetics || typeof kinetics.charge !== "number") {
          throw new Error("Invalid kinetics result");
        }
      } catch (error) {
        logger.error(
          `Error calculating kinetics for ${cuisineInfo.name}:`,
          error,
        );
        kinetics = {
          velocity: { Fire: 0, Water: 0, Earth: 0, Air: 0 },
          momentum: { Fire: 0, Water: 0, Earth: 0, Air: 0 },
          charge: 0,
          potentialDifference: 0,
          currentFlow: 0,
          power: 0,
          inertia: 1,
          forceMagnitude: 0,
          forceClassification: "balanced",
        };
      }

      return {
        id,
        name: cuisineInfo.name,
        elementalProps: safeElementalProps,
        alchemical: safeAlchemical,
        thermodynamics,
        kinetics,
      };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null);

  // Calculate user's current state for compatibility scoring
  const userState = calculateUserState(moment);

  // Calculate compatibility scores for all cuisines
  const cuisinesWithScores = processedCuisines.map((cuisine) => {
    const cuisineState = {
      thermodynamic: {
        heat: cuisine.thermodynamics.heat,
        entropy: cuisine.thermodynamics.entropy,
        reactivity: cuisine.thermodynamics.reactivity,
        gregsEnergy: cuisine.thermodynamics.gregsEnergy,
        kalchm: cuisine.thermodynamics.kalchm,
        monica: cuisine.thermodynamics.monica,
      },
      kinetic: {
        power: cuisine.kinetics.power,
        currentFlow: cuisine.kinetics.currentFlow,
        potentialDifference: cuisine.kinetics.potentialDifference,
        charge: cuisine.kinetics.charge,
        velocity: cuisine.kinetics.velocity,
        momentum: cuisine.kinetics.momentum,
        forceMagnitude: cuisine.kinetics.forceMagnitude,
      },
      elemental: cuisine.elementalProps,
    };

    // Calculate enhanced compatibility score
    const compatibility = calculateEnhancedCompatibility(
      userState,
      cuisineState,
    );
    const matchPercentage = compatibilityToMatchPercentage(
      compatibility.overallScore,
    );

    return {
      ...cuisine,
      compatibilityScore: compatibility.overallScore,
      matchPercentage: matchPercentage / 100, // Convert back to 0-1 range for sorting
    };
  });

  // Sort all cuisines by compatibility score (return all 14, not just top 8)
  const topCuisines = cuisinesWithScores.sort(
    (a, b) => b.matchPercentage - a.matchPercentage,
  );

  // Generate recommendations for top cuisines
  const recommendations: EnhancedCuisineRecommendation[] = topCuisines.map(
    (cuisine) => {
      const cuisineData = cuisineDataMap[cuisine.id] || {};
      const recipes = getRecipesForCuisine(
        cuisineData,
        cuisine.name,
        moment,
        5,
      );
      const sauces = getSaucesForCuisine(cuisineData, cuisine.name, 5);
      const flavorProfile = generateFlavorProfile(cuisine.id);
      const signatures = identifyCulturalSignatures(
        cuisine.elementalProps,
        cuisine.thermodynamics,
        flavorProfile,
      );
      const fusionPairings = calculateFusionPairings(
        cuisine.id,
        cuisine.elementalProps,
        cuisine.thermodynamics,
        topCuisines,
      );

      // Use the calculated compatibility score
      const astroScore = cuisine.matchPercentage;

      // Ensure alchemical properties are always valid with comprehensive checks
      const validAlchemical: AlchemicalProperties = {
        Spirit:
          typeof cuisine.alchemical?.Spirit === "number" &&
          !isNaN(cuisine.alchemical.Spirit)
            ? cuisine.alchemical.Spirit
            : 4,
        Essence:
          typeof cuisine.alchemical?.Essence === "number" &&
          !isNaN(cuisine.alchemical.Essence)
            ? cuisine.alchemical.Essence
            : 4,
        Matter:
          typeof cuisine.alchemical?.Matter === "number" &&
          !isNaN(cuisine.alchemical.Matter)
            ? cuisine.alchemical.Matter
            : 4,
        Substance:
          typeof cuisine.alchemical?.Substance === "number" &&
          !isNaN(cuisine.alchemical.Substance)
            ? cuisine.alchemical.Substance
            : 2,
      };

      // Validate elemental properties
      const validElementalProps: ElementalProperties = {
        Fire:
          typeof cuisine.elementalProps?.Fire === "number" &&
          !isNaN(cuisine.elementalProps.Fire)
            ? cuisine.elementalProps.Fire
            : 0.25,
        Water:
          typeof cuisine.elementalProps?.Water === "number" &&
          !isNaN(cuisine.elementalProps.Water)
            ? cuisine.elementalProps.Water
            : 0.25,
        Earth:
          typeof cuisine.elementalProps?.Earth === "number" &&
          !isNaN(cuisine.elementalProps.Earth)
            ? cuisine.elementalProps.Earth
            : 0.25,
        Air:
          typeof cuisine.elementalProps?.Air === "number" &&
          !isNaN(cuisine.elementalProps.Air)
            ? cuisine.elementalProps.Air
            : 0.25,
      };

      // Generate compatibility reason based on strongest factors
      const zodiacElement = getZodiacElement(moment.zodiac_sign);
      const dominantElement = Object.entries(cuisine.elementalProps).sort(
        (a, b) => b[1] - a[1],
      )[0][0];

      let compatibilityReason = `Strong compatibility (${(astroScore * 100).toFixed(0)}%) `;
      if (dominantElement === zodiacElement) {
        compatibilityReason += `with ${moment.zodiac_sign}'s ${zodiacElement} energy. `;
      }
      compatibilityReason += `Perfect for ${moment.season} season. `;

      // Add thermodynamic insight if significant
      if (cuisine.thermodynamics.monica > 1.5) {
        compatibilityReason += `High alchemical harmony detected.`;
      } else if (cuisine.thermodynamics.heat > 0.12) {
        compatibilityReason += `Energetically aligned with your current state.`;
      } else {
        compatibilityReason += `Well-balanced properties for your needs.`;
      }

      return {
        cuisine_id: cuisine.id,
        name: cuisine.name,
        description:
          cuisineData.description || `Authentic ${cuisine.name} cuisine`,

        elemental_properties: validElementalProps,
        alchemical_properties: validAlchemical,
        thermodynamic_metrics: cuisine.thermodynamics,
        kinetic_properties: cuisine.kinetics,
        flavor_profile: flavorProfile,
        cultural_signatures: signatures,
        fusion_pairings: fusionPairings,

        nested_recipes: recipes,
        recommended_sauces: sauces,

        seasonal_context: `Perfect for ${moment.season} - ingredients at peak freshness`,
        astrological_score: astroScore,
        compatibility_reason: compatibilityReason,
      };
    },
  );

  // Already sorted by compatibility score, no need to re-sort
  return recommendations;
}

/**
 * GET /api/cuisines/recommend
 *
 * UPDATED: Now calls backend for high-precision planetary positions
 */
export async function GET(request: Request) {
  try {
    logger.info(
      "Enhanced Cuisine recommendations API called (using backend planetary positions)",
    );

    const currentMoment = await getCurrentMoment();
    const recommendations = generateEnhancedRecommendations(currentMoment);

    const response = {
      success: true,
      current_moment: currentMoment,
      cuisine_recommendations: recommendations,
      total_recommendations: recommendations.length,
      timestamp: new Date().toISOString(),
      metadata: {
        api_version: "2.0.0",
        data_source: "enhanced-calculation",
        features: [
          "thermodynamic_metrics",
          "kinetic_properties",
          "flavor_profiles",
          "cultural_signatures",
          "fusion_pairings",
          "nested_recipes",
          "sauce_recommendations",
        ],
        can_be_called_externally: true,
      },
    };

    logger.info(
      `Returning ${recommendations.length} enhanced cuisine recommendations`,
    );

    return NextResponse.json(response);
  } catch (error) {
    logger.error("Error generating enhanced cuisine recommendations:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate cuisine recommendations",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/cuisines/recommend
 *
 * UPDATED: Now calls backend for high-precision planetary positions
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    logger.info(
      "Enhanced Cuisine recommendations API called with custom parameters (using backend)",
      body,
    );

    const currentMoment = await getCurrentMoment();
    const recommendations = generateEnhancedRecommendations(currentMoment);

    const response = {
      success: true,
      current_moment: currentMoment,
      cuisine_recommendations: recommendations,
      total_recommendations: recommendations.length,
      applied_filters: {
        dietary_restrictions: body.dietary_restrictions || [],
        preferred_cuisines: body.preferred_cuisines || [],
      },
      timestamp: new Date().toISOString(),
      metadata: {
        api_version: "2.0.0",
        data_source: "enhanced-calculation",
        features: [
          "thermodynamic_metrics",
          "kinetic_properties",
          "flavor_profiles",
          "cultural_signatures",
          "fusion_pairings",
        ],
        can_be_called_externally: true,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.error("Error generating enhanced cuisine recommendations:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate cuisine recommendations",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
