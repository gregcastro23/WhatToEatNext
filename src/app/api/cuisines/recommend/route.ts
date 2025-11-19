import { NextResponse } from "next/server";
import { createLogger } from "@/utils/logger";
import { CUISINES } from "@/data/cuisines/index";
import { italian } from "@/data/cuisines/italian";
import { mexican } from "@/data/cuisines/mexican";
import { american } from "@/data/cuisines/american";
import { french } from "@/data/cuisines/french";
import { chinese } from "@/data/cuisines/chinese";
import { japanese } from "@/data/cuisines/japanese";
import { thai } from "@/data/cuisines/thai";
import { indian } from "@/data/cuisines/indian";
import { korean } from "@/data/cuisines/korean";
import { vietnamese } from "@/data/cuisines/vietnamese";
import { greek } from "@/data/cuisines/greek";
import type { ElementalProperties, AlchemicalProperties } from "@/types/alchemy";
import { calculateThermodynamicMetrics } from "@/utils/monicaKalchmCalculations";
import { calculateKineticProperties } from "@/utils/kineticCalculations";

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
 * Calculate current astrological moment
 */
function getCurrentMoment(): CurrentMoment {
  const now = new Date();
  const month = now.getMonth();

  const zodiacSigns = [
    "Capricorn", "Aquarius", "Pisces", "Aries", "Taurus", "Gemini",
    "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius",
  ];

  const day = now.getDate();
  let zodiacIndex = month;
  if (day >= 20 && day <= 31) {
    zodiacIndex = (month + 1) % 12;
  }

  let season = "Spring";
  if (month >= 2 && month <= 4) season = "Spring";
  else if (month >= 5 && month <= 7) season = "Summer";
  else if (month >= 8 && month <= 10) season = "Autumn";
  else season = "Winter";

  const hour = now.getHours();
  let meal_type = "Dinner";
  if (hour >= 5 && hour < 11) meal_type = "Breakfast";
  else if (hour >= 11 && hour < 15) meal_type = "Lunch";
  else if (hour >= 15 && hour < 18) meal_type = "Snack";

  return {
    zodiac_sign: zodiacSigns[zodiacIndex],
    season,
    meal_type,
    timestamp: now.toISOString(),
  };
}

/**
 * Calculate alchemical properties from planetary positions
 * For now, using a simplified calculation based on zodiac sign
 */
function calculateAlchemicalProperties(zodiacSign: string): AlchemicalProperties {
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

  return alchemicalMap[zodiacSign] || { Spirit: 4, Essence: 4, Matter: 4, Substance: 2 };
}

/**
 * Generate flavor profile for a cuisine
 */
function generateFlavorProfile(cuisineId: string): FlavorProfile {
  const profiles: Record<string, FlavorProfile> = {
    italian: { sweet: 0.3, sour: 0.3, salty: 0.4, bitter: 0.2, umami: 0.5, spicy: 0.2 },
    mexican: { sweet: 0.2, sour: 0.4, salty: 0.3, bitter: 0.2, umami: 0.4, spicy: 0.8 },
    american: { sweet: 0.5, sour: 0.2, salty: 0.6, bitter: 0.1, umami: 0.5, spicy: 0.3 },
    french: { sweet: 0.4, sour: 0.3, salty: 0.4, bitter: 0.2, umami: 0.6, spicy: 0.2 },
    chinese: { sweet: 0.4, sour: 0.5, salty: 0.5, bitter: 0.2, umami: 0.7, spicy: 0.6 },
    japanese: { sweet: 0.3, sour: 0.2, salty: 0.4, bitter: 0.2, umami: 0.8, spicy: 0.1 },
    thai: { sweet: 0.5, sour: 0.6, salty: 0.4, bitter: 0.3, umami: 0.5, spicy: 0.9 },
    indian: { sweet: 0.3, sour: 0.3, salty: 0.3, bitter: 0.3, umami: 0.4, spicy: 0.9 },
    korean: { sweet: 0.3, sour: 0.4, salty: 0.5, bitter: 0.2, umami: 0.6, spicy: 0.7 },
    vietnamese: { sweet: 0.4, sour: 0.5, salty: 0.4, bitter: 0.2, umami: 0.5, spicy: 0.5 },
    greek: { sweet: 0.2, sour: 0.4, salty: 0.5, bitter: 0.3, umami: 0.4, spicy: 0.2 },
    middleEastern: { sweet: 0.3, sour: 0.3, salty: 0.4, bitter: 0.2, umami: 0.4, spicy: 0.5 },
    african: { sweet: 0.3, sour: 0.3, salty: 0.4, bitter: 0.3, umami: 0.4, spicy: 0.6 },
    russian: { sweet: 0.2, sour: 0.5, salty: 0.5, bitter: 0.2, umami: 0.4, spicy: 0.2 },
  };

  return profiles[cuisineId] || { sweet: 0.3, sour: 0.3, salty: 0.4, bitter: 0.2, umami: 0.5, spicy: 0.3 };
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
  Object.entries(elementalProps).forEach(([element, value]) => {
    if (value > 0.35) {
      signatures.push({
        property: `${element} Element`,
        value,
        zScore: (value - 0.25) / 0.15,
        significance: value > 0.45 ? "high" : "medium",
      });
    }
  });

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
  Object.entries(flavorProfile).forEach(([flavor, value]) => {
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
      logger.debug(`Skipping fusion pairing for ${cuisine?.id || 'unknown'} - missing properties`);
      return;
    }

    // Validate that thermodynamics has monica property
    const currentMonica = typeof currentThermodynamics?.monica === 'number' && !isNaN(currentThermodynamics.monica)
      ? currentThermodynamics.monica
      : 1;
    const cuisineMonica = typeof cuisine.thermodynamics?.monica === 'number' && !isNaN(cuisine.thermodynamics.monica)
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

      const compatibilityScore = elementalSimilarity * 0.6 + thermoHarmony * 0.4;

      if (compatibilityScore > 0.6) {
        const sharedElements = Object.entries(currentElemental)
          .filter(([element, value]) => {
            const otherValue = cuisine.elementalProps?.[element as keyof ElementalProperties];
            return otherValue !== undefined && !isNaN(otherValue) && Math.abs(value - otherValue) < 0.2;
          })
          .map(([element]) => element);

        pairings.push({
          cuisine_id: cuisine.id,
          name: cuisine.name,
          compatibility_score: compatibilityScore,
          blend_ratio: 0.5 + (compatibilityScore - 0.6) * 0.5,
          shared_elements: sharedElements.length > 0 ? sharedElements : ["balanced"],
          thermodynamic_harmony: thermoHarmony,
          reason: sharedElements.length > 0
            ? `Strong ${sharedElements.join(" and ")} alignment with ${(compatibilityScore * 100).toFixed(0)}% compatibility`
            : `${(compatibilityScore * 100).toFixed(0)}% compatibility through balanced properties`,
        });
      }
    } catch (error) {
      logger.error(`Error calculating fusion pairing for ${cuisine.id}:`, error);
    }
  });

  return pairings.sort((a, b) => b.compatibility_score - a.compatibility_score).slice(0, 3);
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

  const season = moment.season.toLowerCase() as "spring" | "summer" | "autumn" | "winter";
  const mealType = moment.meal_type?.toLowerCase() || "dinner";

  let recipes: any[] = [];

  if (cuisineData.dishes && cuisineData.dishes[mealType]) {
    const seasonalRecipes = cuisineData.dishes[mealType][season] || [];
    const allSeasonRecipes = cuisineData.dishes[mealType].all || [];
    recipes = [...allSeasonRecipes, ...seasonalRecipes];
  }

  if (recipes.length < maxRecipes) {
    const mealTypes = ["breakfast", "lunch", "dinner", "dessert"];
    for (const mt of mealTypes) {
      if (mt !== mealType && cuisineData.dishes && cuisineData.dishes[mt]) {
        const additionalRecipes = [
          ...(cuisineData.dishes[mt][season] || []),
          ...(cuisineData.dishes[mt].all || []),
        ];
        recipes = [...recipes, ...additionalRecipes];
        if (recipes.length >= maxRecipes) break;
      }
    }
  }

  return recipes.slice(0, maxRecipes).map((recipe, idx) => ({
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
    seasonal_fit: recipe.season?.includes("all") ? "Available year-round" : `Best in ${season}`,
  }));
}

/**
 * Get sauces from cuisine data
 */
function getSaucesForCuisine(cuisineData: any, cuisineName: string, maxSauces: number = 5): SauceRecommendation[] {
  const sauces: SauceRecommendation[] = [];

  // Return empty array if no cuisine data
  if (!cuisineData || Object.keys(cuisineData).length === 0) {
    return [];
  }

  if (cuisineData.motherSauces) {
    Object.entries(cuisineData.motherSauces).forEach(([name, sauce]: [string, any]) => {
      sauces.push({
        sauce_name: name,
        description: sauce.description || `Classic ${cuisineName} sauce`,
        key_ingredients: sauce.ingredients?.slice(0, 5).map((ing: any) => ing.name) || [],
        elemental_properties: sauce.elementalProperties,
        compatibility_score: 0.85 + Math.random() * 0.15,
        reason: sauce.culturalNotes || `Traditional sauce that enhances ${cuisineName} dishes`,
      });
    });
  }

  if (cuisineData.traditionalSauces) {
    Object.entries(cuisineData.traditionalSauces).forEach(([name, sauce]: [string, any]) => {
      sauces.push({
        sauce_name: name,
        description: sauce.description || `Traditional ${cuisineName} sauce`,
        key_ingredients: sauce.ingredients?.slice(0, 5).map((ing: any) => ing.name) || [],
        elemental_properties: sauce.elementalProperties,
        compatibility_score: 0.80 + Math.random() * 0.20,
        reason: sauce.pairingNotes || `Versatile sauce from ${cuisineName} tradition`,
      });
    });
  }

  return sauces.slice(0, maxSauces);
}

/**
 * Get zodiac element for compatibility reasons
 */
function getZodiacElement(zodiacSign: string): string {
  const elements: Record<string, string> = {
    Aries: "Fire", Leo: "Fire", Sagittarius: "Fire",
    Taurus: "Earth", Virgo: "Earth", Capricorn: "Earth",
    Gemini: "Air", Libra: "Air", Aquarius: "Air",
    Cancer: "Water", Scorpio: "Water", Pisces: "Water",
  };
  return elements[zodiacSign] || "balanced";
}

/**
 * Generate enhanced cuisine recommendations
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

  // Calculate alchemical properties for current moment
  const currentAlchemical = calculateAlchemicalProperties(moment.zodiac_sign);

  // Process all cuisines with defensive checks
  const processedCuisines = Object.entries(CUISINES).map(([id, cuisineInfo]) => {
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
      if (!thermodynamics || typeof thermodynamics.heat !== 'number') {
        throw new Error('Invalid thermodynamics result');
      }
    } catch (error) {
      logger.error(`Error calculating thermodynamics for ${cuisineInfo.name}:`, error);
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
      if (!kinetics || typeof kinetics.charge !== 'number') {
        throw new Error('Invalid kinetics result');
      }
    } catch (error) {
      logger.error(`Error calculating kinetics for ${cuisineInfo.name}:`, error);
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
  }).filter((c): c is NonNullable<typeof c> => c !== null);

  // Generate recommendations for top cuisines
  const recommendations: EnhancedCuisineRecommendation[] = processedCuisines
    .slice(0, 8)
    .map((cuisine, index) => {
      const cuisineData = cuisineDataMap[cuisine.id] || {};
      const recipes = getRecipesForCuisine(cuisineData, cuisine.name, moment, 5);
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
        processedCuisines,
      );

      // Calculate astrological score based on zodiac element match
      const zodiacElement = getZodiacElement(moment.zodiac_sign);
      const dominantElement = Object.entries(cuisine.elementalProps)
        .sort((a, b) => b[1] - a[1])[0][0];
      const astroScore = dominantElement === zodiacElement ? 0.9 : 0.7 + (0.2 * (index / 8));

      // Ensure alchemical properties are always valid with comprehensive checks
      const validAlchemical: AlchemicalProperties = {
        Spirit: typeof cuisine.alchemical?.Spirit === 'number' && !isNaN(cuisine.alchemical.Spirit)
          ? cuisine.alchemical.Spirit
          : 4,
        Essence: typeof cuisine.alchemical?.Essence === 'number' && !isNaN(cuisine.alchemical.Essence)
          ? cuisine.alchemical.Essence
          : 4,
        Matter: typeof cuisine.alchemical?.Matter === 'number' && !isNaN(cuisine.alchemical.Matter)
          ? cuisine.alchemical.Matter
          : 4,
        Substance: typeof cuisine.alchemical?.Substance === 'number' && !isNaN(cuisine.alchemical.Substance)
          ? cuisine.alchemical.Substance
          : 2,
      };

      // Validate elemental properties
      const validElementalProps: ElementalProperties = {
        Fire: typeof cuisine.elementalProps?.Fire === 'number' && !isNaN(cuisine.elementalProps.Fire)
          ? cuisine.elementalProps.Fire
          : 0.25,
        Water: typeof cuisine.elementalProps?.Water === 'number' && !isNaN(cuisine.elementalProps.Water)
          ? cuisine.elementalProps.Water
          : 0.25,
        Earth: typeof cuisine.elementalProps?.Earth === 'number' && !isNaN(cuisine.elementalProps.Earth)
          ? cuisine.elementalProps.Earth
          : 0.25,
        Air: typeof cuisine.elementalProps?.Air === 'number' && !isNaN(cuisine.elementalProps.Air)
          ? cuisine.elementalProps.Air
          : 0.25,
      };

      return {
        cuisine_id: cuisine.id,
        name: cuisine.name,
        description: cuisineData.description || `Authentic ${cuisine.name} cuisine`,

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
        compatibility_reason: `Aligns with ${moment.zodiac_sign}'s ${zodiacElement} energy and current ${moment.season} season`,
      };
    });

  return recommendations.sort((a, b) => b.astrological_score - a.astrological_score);
}

/**
 * GET /api/cuisines/recommend
 */
export async function GET(request: Request) {
  try {
    logger.info("Enhanced Cuisine recommendations API called");

    const currentMoment = getCurrentMoment();
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

    logger.info(`Returning ${recommendations.length} enhanced cuisine recommendations`);

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
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    logger.info("Enhanced Cuisine recommendations API called with custom parameters", body);

    const currentMoment = getCurrentMoment();
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
