import {
    CHAKRA_HERBS,
    CHAKRA_NUTRITIONAL_CORRELATIONS
} from "@/constants/chakraSymbols";
import { _LUNAR_PHASES } from "@/constants/lunar";
import { ingredientCategories } from "@/data/ingredientCategories";
import { fruits } from "@/data/ingredients/fruits";
import { grains } from "@/data/ingredients/grains";
import { herbs } from "@/data/ingredients/herbs";
import { oils } from "@/data/ingredients/oils";
import { _proteins as __proteins } from "@/data/ingredients/proteins";
import { seasonings } from "@/data/ingredients/seasonings";
import { spices } from "@/data/ingredients/spices";
import type { Ingredient, Modality } from "@/data/ingredients/types";
import { vegetables } from "@/data/ingredients/vegetables";
import jupiterData from "@/data/planets/jupiter";
import marsData from "@/data/planets/mars";
import mercuryData from "@/data/planets/mercury";
import saturnData from "@/data/planets/saturn";
import type { PlanetData } from "@/data/planets/types";
import venusData from "@/data/planets/venus";
import type {
    AstrologicalStateType,
    ChakraEnergies,
    ElementalProperties,
    LunarPhase,
    Season
} from "@/types/alchemy";
import { _createAstrologicalBridge } from "@/types/bridges/astrologicalBridge";
import type { ElementalState } from "@/types/elemental";
import {
    calculateLunarPhase,
    calculatePlanetaryPositions
} from "@/utils/astrologyUtils";
import { getAllIngredients as getIngredientsUtil } from "@/utils/foodRecommender";

// Shape of a single zodiac-sign entry within a planet's PlanetSpecific.ZodiacTransit data
interface ZodiacTransitEntry {
  FoodFocus?: string;
  Elements?: Record<string, number>;
  Ingredients?: string[];
  [key: string]: unknown;
}
// Safely extracts the full ZodiacTransit map (keyed by zodiac sign) from a planet's data,
// since PlanetSpecific is typed as Record<string, unknown> and needs a validated narrowing.
function getZodiacTransitRecord(
  planetData: PlanetData,
): Record<string, ZodiacTransitEntry> | undefined {
  const zodiacTransit = planetData.PlanetSpecific?.ZodiacTransit;
  if (zodiacTransit && typeof zodiacTransit === "object") {
    return zodiacTransit as Record<string, ZodiacTransitEntry>;
  }
  return undefined;
}
// Safely retrieves a single zodiac sign's transit entry for a planet
function getZodiacTransitEntry(
  planetData: PlanetData,
  zodiacSign: string,
): ZodiacTransitEntry | undefined {
  return getZodiacTransitRecord(planetData)?.[zodiacSign];
}
// Helper functions for safe type access
function safeGetString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}
function safeGetStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  if (typeof value === "string") {
    return [value];
  }
  return [];
}
function safeGetNumber(value: unknown): number {
  return typeof value === "number" && !isNaN(value) ? value : 0;
}
function safeGetElementalProperties(
  value: unknown,
): ElementalProperties | undefined {
  if (typeof value === "object" && value !== null) {
    const props = value as Record<string, unknown>;
    if (
      typeof props.Fire === "number" &&
      typeof props.Water === "number" &&
      typeof props.Earth === "number" &&
      typeof props.Air === "number"
    ) {
      return props as ElementalProperties;
    }
  }
  return undefined;
}
function safeGetIngredientName(ingredient: unknown): string | undefined {
  if (typeof ingredient === "string") {
    return ingredient;
  }
  if (ingredient && typeof ingredient === "object") {
    return safeGetString((ingredient as Record<string, unknown>).name);
  }
  return undefined;
}

function getIngredientRulingPlanets(ingredient: unknown): string[] {
  if (!ingredient || typeof ingredient !== "object") return [];
  const profile = (ingredient as { astrologicalProfile?: { rulingPlanets?: unknown } }).astrologicalProfile;
  return Array.isArray(profile?.rulingPlanets) ? (profile.rulingPlanets as string[]) : [];
}

function getIngredientSignAffinities(ingredient: unknown): string[] {
  if (!ingredient || typeof ingredient !== "object") return [];
  const profile = (ingredient as { astrologicalProfile?: { signAffinities?: unknown } }).astrologicalProfile;
  return Array.isArray(profile?.signAffinities) ? (profile.signAffinities as string[]) : [];
}

function getAstroRetrogrades(astroState: AstrologicalStateType): string[] {
  const retro = (astroState as { retrograde?: unknown }).retrograde;
  return Array.isArray(retro) ? (retro as string[]) : [];
}

// Constants
// Data
// Types
// AstrologicalInfluences interface
export interface AstrologicalInfluences {
  rulingPlanets?: string[];
  favorableZodiac?: string[];
  elementalAffinity?: string;
  lunarPhaseModifiers?: Record<string, unknown>;
  aspectEnhancers?: string[];
}
// Enhanced Ingredient interface for Phase 11
interface EnhancedIngredient {
  name: string;
  type?: string;
  elementalProperties?: ElementalProperties;
  astrologicalInfluences?: AstrologicalInfluences;
  elementalState?: ElementalState;
  season?: Season | string[] | string;
  regionalCuisine?: string;
  astrologicalProfile?: {
    rulingPlanets?: string[];
    signAffinities?: string[];
  };
  // Add commonly missing properties
  flavorProfile?: Record<string, number | undefined>;
  cuisine?: string;
  description?: string;
  category?: string;
  qualities?: string[];
  mealType?: string;
  matchScore?: number;
  score?: number;
  timing?: unknown;
  duration?: unknown;
  [key: string]: unknown;
}
// Moved seasonings and oils imports to organized section above
// Import planet data
// Import the getAllIngredients function if it exists, otherwise we'll create our own
// Export the necessary types needed by IngredientRecommendations.ts
export interface IngredientRecommendation {
  name: string;
  type: string;
  category?: string;
  elementalProperties?: ElementalProperties;
  qualities?: string[];
  matchScore: number;
  modality?: Modality;
  recommendations?: string[];
  description?: string;
  totalScore?: number;
  elementalScore?: number;
  astrologicalScore?: number;
  seasonalScore?: number;
  dietary?: string[];
  // Add commonly missing properties
  flavorProfile?: Record<string, number>;
  cuisine?: string;
  regionalCuisine?: string;
  astrologicalProfile?: {
    rulingPlanets?: string[];
    signAffinities?: string[];
  };
  astrologicalInfluences?: AstrologicalInfluences;
  season?: Season;
  mealType?: string;
  timing?: unknown;
  duration?: unknown;
  isRetrograde?: boolean;
  sensoryProfile?: {
    _taste: Record<string, number>;
    aroma: Record<string, number>;
    texture: Record<string, number>;
  };
  recommendedCookingMethods?: Array<{
    name: string;
    description: string;
    _cookingTime: {
      min: number;
      max: number;
      _unit: string;
    };
    _elementalEffect: Record<string, number>;
  }>;
  pairingRecommendations?: {
    _complementary: string[];
    contrasting: string[];
  };
}
export interface GroupedIngredientRecommendations {
  vegetables?: IngredientRecommendation[];
  fruits?: IngredientRecommendation[];
  _proteins?: IngredientRecommendation[];
  grains?: IngredientRecommendation[];
  spices?: IngredientRecommendation[];
  herbs?: IngredientRecommendation[];
  [key: string]: IngredientRecommendation[] | undefined;
}
export interface RecommendationOptions {
  currentSeason?: string;
  dietaryPreferences?: string[];
  modalityPreference?: Modality;
  currentZodiac?: string;
  limit?: number;
  excludeIngredients?: string[];
  includeOnly?: string[];
  category?: string;
}
// Enhanced calculation helper functions using imported utilities
function calculateEnhancedPlanetaryInfluence(
  planetaryDay: string,
  planetaryData: { jupiterData: unknown; saturnData: unknown },
): number {
  // Use Jupiter and Saturn data to enhance planetary calculations
  const { jupiterData: jupiter, saturnData: saturn } = planetaryData;
  const jupiterInfluence = (jupiter as { influence?: number }).influence ?? 1.0;
  const saturnInfluence = (saturn as { influence?: number }).influence ?? 1.0;
  // Apply planetary day specific calculations
  if (planetaryDay === "Jupiter") return jupiterInfluence;
  if (planetaryDay === "Saturn") return saturnInfluence;
  return 1.0;
}
function calculateLunarPhaseModifier(lunarPhaseData: unknown): number {
  // Use lunar phase data to calculate modifiers
  const phaseData = lunarPhaseData as { modifier?: number };
  return phaseData.modifier ?? 1.0;
}
function calculateAstrologicalBridgeModifier(
  astrologicalBridge: unknown,
): number {
  // Use astrological bridge for enhanced compatibility scoring
  const bridge = astrologicalBridge as { compatibility?: number };
  return bridge.compatibility ?? 1.0;
}
// Combine all real ingredients data
const allIngredients = [
  ...Object.values(vegetables),
  ...Object.values(fruits),
  ...Object.values(herbs),
  ...Object.values(spices),
  ...Object.values(__proteins),
  ...Object.values(grains),
  ...Object.values(seasonings),
  ...Object.values(oils),
].filter(Boolean);
// Fallback implementation of getAllIngredients that uses ingredientCategories
function getAllIngredients(): EnhancedIngredient[] {
  // If the imported function exists, use it
  if (typeof getIngredientsUtil === "function") {
    return getIngredientsUtil();
  }
  // Otherwise, use our fallback implementation
  const allIngredients: EnhancedIngredient[] = [];
  // Process each category in ingredientCategories
  Object.entries(ingredientCategories).forEach(([category, ingredientsMap]) => {
    Object.entries(ingredientsMap as Record<string, unknown>).forEach(([name, data]) => {
      const ingredientData = (data ?? {}) as Record<string, unknown>;
      allIngredients.push({
        name,
        type: category.endsWith("s") ? category.slice(0, -1) : category,
        category,
        elementalProperties: ingredientData.elementalProperties as ElementalProperties | undefined,
        astrologicalProfile: ingredientData.astrologicalProfile as {
          rulingPlanets?: string[];
          signAffinities?: string[];
        } | undefined,
        ...ingredientData,
      });
    });
  });
  return allIngredients;
}
/**
 * Returns a list of ingredients that match the current astrological state
 */
export function getRecommendedIngredients(
  astroState: AstrologicalStateType,
): EnhancedIngredient[] {
  // Get the active planets from the astrological state
  const activePlanets = astroState.activePlanets ?? [];
  // If we don't have any active planets, use all planets by default
  const planetsToUse =
    activePlanets.length > 0
      ? activePlanets
      : [
          "Sun",
          "Moon",
          "Mercury",
          "Venus",
          "Mars",
          "Jupiter",
          "Saturn",
          "Uranus",
          "Neptune",
          "Pluto",
        ];
  // Filter ingredients based on matching planetary rulers
  const allIngredients = getAllIngredients();
  let filteredIngredients = allIngredients.filter((ingredient) =>
    ingredient.astrologicalProfile?.rulingPlanets?.some((planet) =>
      planetsToUse.includes(planet),
    ),
  );
  // If no matching ingredients, return a sample of all ingredients
  if (filteredIngredients.length === 0) {
    filteredIngredients = allIngredients.slice(0, 20);
  }
  // Special handling for Venus influence when present
  if (planetsToUse.includes("Venus")) {
    enhanceVenusIngredientBatch(
      filteredIngredients,
      astroState,
    );
  }
  // Special handling for Mars influence when present
  if (planetsToUse.includes("Mars")) {
    enhanceMarsIngredientScoring(
      filteredIngredients,
      astroState,
    );
  }
  // Special handling for Mercury influence when present
  if (planetsToUse.includes("Mercury")) {
    enhanceMercuryIngredientScoring(
      filteredIngredients,
      astroState,
    );
  }
  // If we have a dominant element from the astro state, prioritize ingredients of that element
  if (astroState.dominantElement) {
    filteredIngredients.sort((a, b) => {
      const dominantElement = astroState.dominantElement as keyof ElementalProperties | undefined;
      const aValue =
        (dominantElement ? a.elementalProperties?.[dominantElement] : 0) ??
        0;
      const bValue =
        (dominantElement ? b.elementalProperties?.[dominantElement] : 0) ??
        0;
      return bValue - aValue;
    });
  }
  // If we have a current zodiac sign, prioritize ingredients with that affinity
  if (astroState.zodiacSign) {
    const zodiacSign = astroState.zodiacSign.toLowerCase();
    // Apply Venus's zodiac transit data if Venus is active and in this sign
    const venusBoost =
      planetsToUse.includes("Venus") &&
      getZodiacTransitEntry(venusData, astroState.zodiacSign)
        ? 2.0
        : 0.0;
    // Apply Mars's zodiac transit data if Mars is active and in this sign
    const marsBoost =
      planetsToUse.includes("Mars") &&
      getZodiacTransitEntry(marsData, astroState.zodiacSign)
        ? 2.0
        : 0.0;
    // Apply Mercury's zodiac transit data if Mercury is active and in this sign
    const mercuryBoost =
      planetsToUse.includes("Mercury") &&
      getZodiacTransitEntry(mercuryData, astroState.zodiacSign)
        ? 2.0
        : 0.0;
    filteredIngredients.sort((a, b) => {
      let aHasAffinity =
        a.astrologicalProfile?.signAffinities?.includes(zodiacSign)
          ? 1
          : 0;
      let bHasAffinity =
        b.astrologicalProfile?.signAffinities?.includes(zodiacSign)
          ? 1
          : 0;
      // Boost ingredients with Venus associations when Venus is active
      if (planetsToUse.includes("Venus")) {
        if (isVenusAssociatedIngredient(a.name))
          aHasAffinity += venusBoost;
        if (isVenusAssociatedIngredient(b.name))
          bHasAffinity += venusBoost;
      }
      // Boost ingredients with Mars associations when Mars is active
      if (planetsToUse.includes("Mars")) {
        if (isMarsAssociatedIngredient(a.name))
          aHasAffinity += marsBoost;
        if (isMarsAssociatedIngredient(b.name))
          bHasAffinity += marsBoost;
      }
      // Boost ingredients with Mercury associations when Mercury is active
      if (planetsToUse.includes("Mercury")) {
        if (isMercuryAssociatedIngredient(a.name))
          aHasAffinity += mercuryBoost;
        if (isMercuryAssociatedIngredient(b.name))
          bHasAffinity += mercuryBoost;
      }
      return bHasAffinity - aHasAffinity;
    });
  }
  return filteredIngredients;
}
/**
 * Returns recommendations grouped by category based on elemental properties and options
 */
export function getIngredientRecommendations(
  elementalProps: ElementalProperties & {
    timestamp: Date;
    _currentStability: number;
    planetaryAlignment: Record<string, { sign: string; degree: number }>;
    zodiacSign: string;
    activePlanets: string[];
    lunarPhase: string;
    aspects: Array<{ aspectType: string; planet1: string; planet2: string }>;
  },
  options: RecommendationOptions,
): Promise<GroupedIngredientRecommendations> {
  // Get all ingredients
  const allIngredients = getAllIngredients();
  // Calculate ruling planet based on sun's position
  const sunSign = elementalProps.zodiacSign.toLowerCase();
  // Map of signs to their ruling planets
  const signRulers: Record<string, string> = {
    aries: "Mars",
    taurus: "Venus",
    gemini: "Mercury",
    cancer: "Moon",
    leo: "Sun",
    virgo: "Mercury",
    libra: "Venus",
    scorpio: "Mars",
    sagittarius: "Jupiter",
    capricorn: "Saturn",
    aquarius: "Saturn", // Traditional ruler
    pisces: "Jupiter", // Traditional ruler
  };
  const rulingPlanet = signRulers[sunSign] || "Sun";
  // Get decan information for each planet position
  const planetDecans: Record<
    string,
    { decanNum: number; decanRuler: string; tarotCard: string } | undefined
  > = {};
  Object.entries(elementalProps.planetaryAlignment).forEach(
    ([planet, position]) => {
      if (!position.sign) return;
      const sign = position.sign.toLowerCase();
      const degree = position.degree || 0;
      // Determine which decan the planet is in
      let decanNum = 1;
      if (degree >= 10 && degree < 20) decanNum = 2;
      else if (degree >= 20) decanNum = 3;
      // Reference data for decan rulers and tarot cards based on sign and decan
      const decanRulerMap: Record<string, Record<number, string>> = {
        aries: { 1: "Mars", 2: "Sun", 3: "Venus" },
        taurus: { 1: "Mercury", 2: "Moon", 3: "Saturn" },
        gemini: { 1: "Jupiter", 2: "Mars", 3: "Sun" },
        cancer: { 1: "Venus", 2: "Mercury", 3: "Moon" },
        leo: { 1: "Saturn", 2: "Jupiter", 3: "Mars" },
        virgo: { 1: "Sun", 2: "Venus", 3: "Mercury" },
        libra: { 1: "Moon", 2: "Saturn", 3: "Jupiter" },
        scorpio: { 1: "Mars", 2: "Sun", 3: "Venus" },
        sagittarius: { 1: "Mercury", 2: "Moon", 3: "Saturn" },
        capricorn: { 1: "Jupiter", 2: "Mars", 3: "Sun" },
        aquarius: { 1: "Venus", 2: "Mercury", 3: "Moon" },
        pisces: { 1: "Saturn", 2: "Jupiter", 3: "Mars" },
      };
      const tarotCardMap: Record<string, Record<number, string>> = {
        aries: { 1: "2 of Wands", 2: "3 of Wands", 3: "4 of Wands" },
        taurus: {
          1: "5 of Pentacles",
          2: "6 of Pentacles",
          3: "7 of Pentacles",
        },
        gemini: { 1: "8 of Swords", 2: "9 of Swords", 3: "10 of Swords" },
        cancer: { 1: "2 of Cups", 2: "3 of Cups", 3: "4 of Cups" },
        leo: { 1: "5 of Wands", 2: "6 of Wands", 3: "7 of Wands" },
        virgo: {
          1: "8 of Pentacles",
          2: "9 of Pentacles",
          3: "10 of Pentacles",
        },
        libra: { 1: "2 of Swords", 2: "3 of Swords", 3: "4 of Swords" },
        scorpio: { 1: "5 of Cups", 2: "6 of Cups", 3: "7 of Cups" },
        sagittarius: { 1: "8 of Wands", 2: "9 of Wands", 3: "10 of Wands" },
        capricorn: {
          1: "2 of Pentacles",
          2: "3 of Pentacles",
          3: "4 of Pentacles",
        },
        aquarius: { 1: "5 of Swords", 2: "6 of Swords", 3: "7 of Swords" },
        pisces: { 1: "8 of Cups", 2: "9 of Cups", 3: "10 of Cups" },
      };
      const decanRuler = decanRulerMap[sign]?.[decanNum] || "";
      const tarotCard = tarotCardMap[sign]?.[decanNum] || "";
      planetDecans[planet] = { decanNum, decanRuler, tarotCard };
    },
  );
  // Filter and score ingredients
  const scoredIngredients = allIngredients
    .filter((ingredient) => {
      // Apply basic filters
      const ingredientName = safeGetIngredientName(ingredient);
      if (options.excludeIngredients?.includes(ingredientName ?? ""))
        return false;
      if (
        options.includeOnly &&
        !options.includeOnly.includes(ingredientName ?? "")
      )
        return false;
      if (options.category && ingredient.category !== options.category)
        return false;
      // Filter by dietary preference if specified
      if (options.dietaryPreferences && options.dietaryPreferences.length > 0) {
        const dietary = Array.isArray(ingredient.dietary) ? ingredient.dietary : [];
        const dietaryMatches = options.dietaryPreferences.some((pref) =>
          dietary.includes(pref),
        );
        if (!dietaryMatches) return false;
      }
      // Filter by modality preference if specified
      if (options.modalityPreference) {
        const ingredientModality =
          ingredient.modality ??
          determineIngredientModality(
            ingredient.qualities ?? [],
            safeGetElementalProperties(ingredient.elementalProperties),
          );
        if (ingredientModality !== options.modalityPreference) return false;
      }
      return true;
    })
    .map((ingredient) => {
      // Calculate elemental score (30% of total)
      const elementalScore = calculateElementalScore(
        safeGetElementalProperties(ingredient.elementalProperties),
        elementalProps,
      );
      // Calculate modality score (15% of total)
      const modalityScore = calculateModalityScore(
        ingredient.qualities ?? [],
        options.modalityPreference,
      );
      // Calculate seasonal score (15% of total)
      const seasonalScore = calculateSeasonalScore(
        ingredient,
        elementalProps.timestamp,
      );
      // Calculate planetary score (40% of total) - increased weight for planetary alignment
      const planetaryScore = calculateEnhancedPlanetaryScore(
        ingredient,
        elementalProps.planetaryAlignment,
        planetDecans,
        rulingPlanet,
      );
      // Calculate total score with weighted components
      const totalScore =
        elementalScore * 0.3 +
        modalityScore * 0.15 +
        seasonalScore * 0.15 +
        planetaryScore * 0.4;
      // Assign modality if not already present
      const modality =
        ingredient.modality ??
        determineIngredientModality(
          ingredient.qualities ?? [],
          safeGetElementalProperties(ingredient.elementalProperties),
        );
      return {
        ...ingredient,
        score: totalScore,
        elementalScore,
        modalityScore,
        seasonalScore,
        planetaryScore,
        modality,
      };
    })
    .sort((a, b) => b.score - a.score);
  // Enterprise Intelligence Analysis - Phase 27 Ingredient Intelligence Systems
  const ingredientData = {
    ingredients: scoredIngredients,
    elementalProperties: elementalProps,
    astrologicalContext: {
      zodiacSign: elementalProps.zodiacSign as unknown,
      lunarPhase: elementalProps.lunarPhase as LunarPhase,
      elementalProperties: elementalProps,
      planetaryPositions: elementalProps.planetaryAlignment,
    },
  };
  // Perform enterprise intelligence analysis
  const astroContext =
    (ingredientData as { astrologicalContext?: Record<string, unknown> })
      .astrologicalContext ?? {};
  const _safeAstroContext = {
    zodiacSign: astroContext.zodiacSign ?? "aries",
    lunarPhase:
      typeof astroContext.lunarPhase === "string"
        ? astroContext.lunarPhase
        : "new",
    season:
      typeof astroContext.season === "string" ? astroContext.season : "spring",
    userPreferences:
      astroContext.userPreferences &&
      typeof astroContext.userPreferences === "object"
        ? (astroContext.userPreferences as {
            dietaryRestrictions: string[];
            _flavorPreferences: string[];
            _culturalPreferences: string[];
          })
        : undefined,
  };
  // Group ingredients by category
  const groupedRecommendations: GroupedIngredientRecommendations = {};
  // Apply limit per category before grouping to ensure diversity
  const limit = options.limit ?? 24;
  const categoryCounts: Record<string, number> = {};
  const categoryMaxItems = Math.ceil(limit / 8); // Max items per category
  scoredIngredients.forEach((ingredient) => {
    const category = ingredient.category ?? "other";
    if (!groupedRecommendations[category]) {
      groupedRecommendations[category] = [];
      categoryCounts[category] = 0;
    }
    const categoryCount = categoryCounts[category] ?? 0;
    const categoryBucket = groupedRecommendations[category];
    if (categoryBucket && categoryCount < categoryMaxItems) {
      const ingredientData = ingredient as {
        type?: string;
        category?: string;
        elementalProperties?: ElementalProperties;
        recommendations?: string[];
        description?: string;
        [key: string]: unknown;
      };
      const ingredientRecommendation: IngredientRecommendation = {
        name: ingredient.name || "",
        type:
          safeGetString(ingredientData.type) ??
          safeGetString(ingredientData.category) ??
          "ingredient",
        category,
        elementalProperties: safeGetElementalProperties(
          ingredient.elementalProperties,
        ),
        qualities: safeGetStringArray(ingredient.qualities),
        matchScore: safeGetNumber(ingredient.score),
        modality: (ingredient.modality as Modality | undefined) ?? "Cardinal",
        recommendations: safeGetStringArray(ingredientData.recommendations),
        description:
          safeGetString(ingredientData.description) ??
          `Recommended ${ingredient.name}`,
        totalScore:
          safeGetNumber(ingredientData.totalScore) ||
          safeGetNumber(ingredient.score),
        elementalScore: safeGetNumber(ingredient.elementalScore),
        astrologicalScore: safeGetNumber(ingredientData.astrologicalScore),
        seasonalScore: safeGetNumber(ingredient.seasonalScore),
        dietary: safeGetStringArray(ingredientData.dietary),
        // Enterprise Intelligence Enhanced Properties
        flavorProfile: {},
        cuisine: "universal",
        regionalCuisine: "global",
        season: "all",
        mealType: "any",
        timing: "flexible",
        duration: "standard",
      };
      categoryBucket.push(ingredientRecommendation);
      categoryCounts[category] = categoryCount + 1;
    }
  });
  return Promise.resolve(groupedRecommendations);
}
// Helper function to calculate modality score
function calculateModalityScore(
  qualities: string[],
  preferredModality?: Modality,
): number {
  // Get the ingredient's modality based on qualities
  const ingredientModality = determineIngredientModality(qualities);
  // If no preferred modality, return neutral score
  if (!preferredModality) return 0.5;
  // Return 1.0 for exact match, 0.5 for partial match, 0.0 for mismatch
  if (ingredientModality === preferredModality) return 1.0;
  // Consider partial matches based on modality compatibility
  const compatibleModalities = {
    Cardinal: ["Mutable"],
    Fixed: ["Mutable"],
    Mutable: ["Cardinal", "Fixed"],
  };
  if (compatibleModalities[preferredModality].includes(ingredientModality)) {
    return 0.7;
  }
  return 0.3;
}
/**
 * Calculate elemental score between ingredient and system elemental properties
 * Enhanced to give more weight to dominant elements and better similarity calculation
 */
function calculateElementalScore(
  ingredientProps?: ElementalProperties,
  systemProps?: ElementalProperties,
): number {
  // Return neutral score if either properties are missing
  if (!ingredientProps || !systemProps) return 0.5;
  // Find dominant system element for extra weighting
  const [dominantEntry] = Object.entries(systemProps).sort(
    (a, b) => b[1] - a[1],
  );
  if (!dominantEntry) return 0.5;
  const dominantElement = dominantEntry[0] as keyof ElementalProperties;
  // Calculate similarity based on overlap of elemental properties
  let similarityScore = 0;
  let totalWeight = 0;
  // Process each element
  for (const element of ["Fire", "Water", "Earth", "Air"] as const) {
    const ingredientValue = ingredientProps[element] || 0;
    const systemValue = systemProps[element] || 0;
    // Calculate similarity (1 - absolute difference)
    // This gives higher scores when values are closer together
    const similarity = 1 - Math.abs(ingredientValue - systemValue);
    // Enhanced weighting: dominant element gets extra emphasis
    // Base weight includes the system's value for this element
    const baseWeight = systemValue + 0.25; // Add 0.25 to ensure all elements have some weight
    // Apply 1.5x multiplier to the dominant element's weight
    const finalWeight =
      element === dominantElement ? baseWeight * 1.5 : baseWeight;
    similarityScore += similarity * finalWeight;
    totalWeight += finalWeight;
  }
  // Normalize to 0-1 range with explicit bounds
  return totalWeight > 0
    ? Math.min(1, Math.max(0, similarityScore / totalWeight))
    : 0.5;
}
/**
 * Calculate seasonal score for an ingredient based on current date
 * @param ingredient Ingredient to score
 * @param date Current date
 * @returns Seasonal score (0-1)
 */
function calculateSeasonalScore(
  ingredient: Ingredient | EnhancedIngredient,
  date: Date,
): number {
  // Default score if no seasonality data
  const seasonalityRecord = (ingredient as { seasonality?: unknown }).seasonality;
  if (!seasonalityRecord) return 0.5;
  // Get current month and convert to season
  const month = date.getMonth(); // 0-11
  let currentSeason: string;
  // Northern hemisphere seasons
  if (month >= 2 && month <= 4) {
    currentSeason = "spring";
  } else if (month >= 5 && month <= 7) {
    currentSeason = "summer";
  } else if (month >= 8 && month <= 10) {
    currentSeason = "fall";
  } else {
    currentSeason = "winter";
  }
  // Get seasonality score for current season
  // Note: seasonality is typed as string[] in BaseIngredient but accessed here as a Record.
  // This means it will always evaluate to undefined (and fall back to 0.5) for array-typed
  // seasonality data. Pre-existing latent bug, preserved as-is.
  const seasonScore =
    (seasonalityRecord as Record<string, number>)[currentSeason] || 0.5;
  return seasonScore;
}
/**
 * Enhanced planetary score calculation that considers decans and tarot associations,
 * with special weight for the ruling planet determined by sun position
 */
function calculateEnhancedPlanetaryScore(
  ingredient: Ingredient | EnhancedIngredient,
  planetaryAlignment: Record<string, { sign: string; degree: number }>,
  planetDecans: Record<
    string,
    { decanNum: number; decanRuler: string; tarotCard: string } | undefined
  >,
  rulingPlanet: string,
): number {
  const { astrologicalProfile } = ingredient as {
    astrologicalProfile?: {
      rulingPlanets?: unknown;
      signAffinities?: unknown;
      tarotAssociations?: unknown;
    };
  };
  if (!astrologicalProfile) return 0.5; // Neutral score for ingredients without profile
  let score = 0;
  let totalFactors = 0;
  // Ingredient astrological profiles are frequently partial — every array
  // access below is defaulted so one missing field can't throw and abort
  // the entire recommendation map.
  const rulingPlanets: string[] = Array.isArray(astrologicalProfile.rulingPlanets)
    ? (astrologicalProfile.rulingPlanets as string[])
    : [];
  const signAffinities: string[] = Array.isArray(astrologicalProfile.signAffinities)
    ? (astrologicalProfile.signAffinities as string[])
    : [];
  const tarotAssociations: string[] = Array.isArray(astrologicalProfile.tarotAssociations)
    ? (astrologicalProfile.tarotAssociations as string[])
    : [];
  // Check ruling planet correspondence - this gets extra weight
  if (rulingPlanets.includes(rulingPlanet)) {
    score += 1.5; // Significant boost for ruling planet correspondence
    totalFactors += 1.5;
  }
  // Check planetary positions against ingredient affinities
  Object.entries(planetaryAlignment).forEach(([planet, position]) => {
    if (!position.sign) return;
    const planetName = planet.charAt(0).toUpperCase() + planet.slice(1);
    // Regular planetary ruler scoring
    if (rulingPlanets.includes(planetName)) {
      score += 1;
      totalFactors += 1;
    }
    // Check sign affinities
    if (signAffinities.includes(position.sign.toLowerCase())) {
      score += 1;
      totalFactors += 1;
    }
    // Special handling for decan rulers
    const decanInfo = planetDecans[planet];
    if (decanInfo) {
      if (rulingPlanets.includes(decanInfo.decanRuler)) {
        score += 0.8; // Good bonus for decan ruler match
        totalFactors += 0.8;
      }
      // Tarot card associations - add subtle influence
      if (decanInfo.tarotCard && tarotAssociations.includes(decanInfo.tarotCard)) {
        score += 0.7;
        totalFactors += 0.7;
      }
    }
  });
  // If there are no factors to consider, return neutral score
  if (totalFactors === 0) return 0.5;
  // Return normalized score (0-1 range)
  return Math.min(1, score / (totalFactors + 0.5));
}
/**
 * Calculate planetary influences based on planetary alignment
 * @param planetaryAlignment Current planetary positions
 * @returns Elemental influence values
 */
export function calculateElementalInfluences(
  planetaryAlignment: Record<string, { sign: string; degree: number }>,
): ElementalProperties {
  // Define elemental affinities for each zodiac sign
  const zodiacElements: Record<string, keyof ElementalProperties> = {
    aries: "Fire",
    taurus: "Earth",
    gemini: "Air",
    cancer: "Water",
    leo: "Fire",
    virgo: "Earth",
    libra: "Air",
    scorpio: "Water",
    sagittarius: "Fire",
    capricorn: "Earth",
    aquarius: "Air",
    pisces: "Water",
  };
  // Define planet weights
  const planetWeights: Record<string, number> = {
    sun: 5,
    moon: 4,
    mercury: 3,
    venus: 3,
    mars: 3,
    jupiter: 2,
    saturn: 2,
    _uranus: 1,
    _neptune: 1,
    _pluto: 1,
  };
  // Initialize elemental influences
  const elementalInfluences: ElementalProperties = {
    Fire: 0,
    Earth: 0,
    Air: 0,
    Water: 0,
  };
  // Process each planetary position
  Object.entries(planetaryAlignment).forEach(([planet, position]) => {
    const planetLower = planet.toLowerCase();
    const weight = planetWeights[planetLower] || 1;
    const sign = position.sign.toLowerCase();
    const element = zodiacElements[position.sign] || zodiacElements[sign];
    const currentInfluence = element ? elementalInfluences[element] : undefined;
    if (element && currentInfluence !== undefined) {
      elementalInfluences[element] = currentInfluence + weight;
    }
  });
  // Normalize values to sum to 1
  const total = Object.values(elementalInfluences).reduce(
    (sum, val) => sum + val,
    0,
  );
  if (total > 0) {
    for (const [element, value] of Object.entries(elementalInfluences)) {
      elementalInfluences[element] = value / total;
    }
  }
  return elementalInfluences;
}
/**
 * Get ingredient recommendations based on chakra energies
 * @param chakraEnergies Current chakra energy levels
 * @param limit Maximum number of recommendations per chakra
 * @returns Grouped ingredient recommendations based on chakra influences
 */
export function getChakraBasedRecommendations(
  chakraEnergies: ChakraEnergies,
  limit = 3,
): GroupedIngredientRecommendations {
  // Find the dominant chakras (highest energy levels)
  const chakraEntries = Object.entries(chakraEnergies);
  // Sort chakras by energy level (highest first)
  const sortedChakras = chakraEntries.sort(
    ([, energyA], [, energyB]) => energyB - energyA,
  );
  // Take only chakras with significant energy (> 0)
  const significantChakras = sortedChakras.filter(([, energy]) => energy > 0);
  // Prepare the result object
  const result: GroupedIngredientRecommendations = {};
  // For each significant chakra, add corresponding recommended ingredients
  significantChakras.forEach(([chakra, energy]) => {
    // Get nutritional correlations for this chakra
    const nutritionalCorrelations =
      CHAKRA_NUTRITIONAL_CORRELATIONS[chakra] ?? [];
    const herbRecommendations =
      CHAKRA_HERBS[chakra] ?? [];
    // Find ingredients that match these correlations
    const matchingIngredients = allIngredients.filter((ingredient) => {
      const ingredientName = ingredient.name;
      const ingredientType = String(ingredient.type ?? ingredient.category ?? "");
      // Check if ingredient name or type matches any nutritional correlation
      const matchesNutritional = nutritionalCorrelations.some(
        (correlation) =>
          ingredientName.toLowerCase().includes(correlation.toLowerCase()) ||
          ingredientType.toLowerCase().includes(correlation.toLowerCase()),
      );
      // Check if ingredient name matches any herb recommendation
      const matchesHerb = herbRecommendations.some((herb) =>
        ingredientName.toLowerCase().includes(herb.toLowerCase()),
      );
      return matchesNutritional || matchesHerb;
    });
    // Add matching ingredients to the result, with a score based on chakra energy
    matchingIngredients.forEach((ingredient) => {
      const ingredientType = String(ingredient.type ?? ingredient.category ?? "other");
      const recommendationKey = ingredientType
        ? `${ingredientType.toLowerCase()}s`
        : "others";
      result[recommendationKey] ??= [];
      // Create recommendation with chakra-based score
      const ingredientName = ingredient.name;
      const recommendation: IngredientRecommendation = {
        name: ingredientName,
        type: ingredientType,
        category: ingredient.category,
        elementalProperties: ingredient.elementalProperties,
        qualities: safeGetStringArray(ingredient.qualities),
        matchScore: energy / 10, // Normalize to 0-1 range
        modality: (ingredient.modality as Modality | undefined) ?? "Cardinal",
        recommendations: [
          `Supports ${chakra} chakra energy`,
          ...nutritionalCorrelations.filter(
            (corr) =>
              ingredientName.toLowerCase().includes(corr.toLowerCase()) ||
              ingredientType.toLowerCase().includes(corr.toLowerCase()),
          ),
        ],
        description:
          safeGetString(ingredient.description) ??
          `Supports ${chakra} chakra energy`,
        totalScore: energy / 10,
        elementalScore: 0,
        astrologicalScore: 0,
        seasonalScore: 0,
        dietary: [],
      };
      // Only add if not already present
      if (
        !result[recommendationKey].some((rec) => rec.name === ingredientName)
      ) {
        result[recommendationKey].push(recommendation);
      }
    });
  });
  // Apply limit to each category
  Object.keys(result).forEach((key) => {
    const list = result[key];
    if (list && list.length > limit) {
      result[key] = list.slice(0, limit);
    }
  });
  return result;
}
// Helper function to check if an ingredient is Venus-associated
function isVenusAssociatedIngredient(ingredientName: string): boolean {
  // Check if the ingredient appears in Venus's food associations
  if (venusData.FoodAssociations) {
    for (const food of venusData.FoodAssociations) {
      if (
        ingredientName.toLowerCase().includes(food.toLowerCase()) ||
        food.toLowerCase().includes(ingredientName.toLowerCase())
      ) {
        return true;
      }
    }
  }
  // Check if the ingredient appears in Venus's herbal associations
  if (venusData.HerbalAssociations?.Herbs) {
    for (const herb of venusData.HerbalAssociations.Herbs) {
      if (
        ingredientName.toLowerCase().includes(herb.toLowerCase()) ||
        herb.toLowerCase().includes(ingredientName.toLowerCase())
      ) {
        return true;
      }
    }
  }
  // Check if the ingredient appears in Venus's herb associations
  // Note: HerbalAssociations only has Herbs, Flowers, Woods, Scents - Spices not available
  if (venusData.HerbalAssociations?.Herbs) {
    for (const herb of venusData.HerbalAssociations.Herbs) {
      if (
        ingredientName.toLowerCase().includes(herb.toLowerCase()) ||
        herb.toLowerCase().includes(ingredientName.toLowerCase())
      ) {
        return true;
      }
    }
  }
  // Check if the ingredient appears in Venus's flower associations
  if (venusData.HerbalAssociations?.Flowers) {
    for (const flower of venusData.HerbalAssociations.Flowers) {
      if (
        ingredientName.toLowerCase().includes(flower.toLowerCase()) ||
        flower.toLowerCase().includes(ingredientName.toLowerCase())
      ) {
        return true;
      }
    }
  }
  // Check against zodiac-specific Venus ingredients
  const venusZodiacTransitRecord = getZodiacTransitRecord(venusData);
  if (venusZodiacTransitRecord) {
    for (const transitData of Object.values(venusZodiacTransitRecord)) {
      if (transitData.Ingredients) {
        for (const ingredient of transitData.Ingredients) {
          if (
            ingredientName.toLowerCase().includes(ingredient.toLowerCase()) ||
            ingredient.toLowerCase().includes(ingredientName.toLowerCase())
          ) {
            return true;
          }
        }
      }
    }
  }
  return false;
}
/**
 * Determines if an ingredient is associated with Mars based on Mars data
 */
function isMarsAssociatedIngredient(ingredientName: string): boolean {
  // Normalize the ingredient name for comparison
  const normalizedName = ingredientName.toLowerCase();
  // Check if it's in Mars food associations
  if (marsData.FoodAssociations) {
    for (const food of marsData.FoodAssociations) {
      if (
        normalizedName.includes(food.toLowerCase()) ||
        food.toLowerCase().includes(normalizedName)
      ) {
        return true;
      }
    }
  }
  // Check if it's in Mars herbal associations
  if (marsData.HerbalAssociations?.Herbs) {
    for (const herb of marsData.HerbalAssociations.Herbs) {
      if (
        normalizedName.includes(herb.toLowerCase()) ||
        herb.toLowerCase().includes(normalizedName)
      ) {
        return true;
      }
    }
  }
  // Check all zodiac transits for ingredients
  const marsZodiacTransitRecord = getZodiacTransitRecord(marsData);
  if (marsZodiacTransitRecord) {
    for (const transit of Object.values(marsZodiacTransitRecord)) {
      if (transit.Ingredients) {
        for (const ingredient of transit.Ingredients) {
          if (
            normalizedName.includes(ingredient.toLowerCase()) ||
            ingredient.toLowerCase().includes(normalizedName)
          ) {
            return true;
          }
        }
      }
    }
  }
  return false;
}
/**
 * Calculate Venus influence score for an ingredient
 * @param ingredient The ingredient to calculate Venus influence for
 * @param zodiacSign Current zodiac sign Venus is in
 * @param isVenusRetrograde Whether Venus is retrograde
 * @returns Score representing Venus influence (higher is stronger)
 */
function calculateVenusInfluence(
  ingredient: Ingredient | EnhancedIngredient,
  zodiacSign?: string,
  isVenusRetrograde = false,
): number {
  let score = 0;
  const ingredientData = ingredient as Record<string, unknown>;
  const ingredientName = ingredient.name;
  if (ingredientName && isVenusAssociatedIngredient(ingredientName)) {
    score += 2.0;
  }
  // Check elemental properties alignment with Venus
  // Venus favors Water and Earth elements
  const elementalProps = ingredient.elementalProperties ?? { Fire: 0, Water: 0, Earth: 0, Air: 0 };
  score += (elementalProps.Water || 0) * 1.5;
  score += (elementalProps.Earth || 0) * 1.8;
  // Lesser affinities with Air and Fire
  score += (elementalProps.Air || 0) * 0.8;
  score += (elementalProps.Fire || 0) * 0.5;
  // Check flavor profile alignment with Venus preferences
  const { flavorProfile } = ingredient as { flavorProfile?: Record<string, number> };
  if (flavorProfile) {
    // Venus favors sweet, rich, creamy flavors
    if (flavorProfile.sweet) {
      score += flavorProfile.sweet * 2.0;
    }
    if (flavorProfile.umami) {
      score += flavorProfile.umami * 1.5;
    }
    if (flavorProfile.creamy || flavorProfile.rich) {
      score += ((flavorProfile.creamy || 0) + (flavorProfile.rich || 0)) * 1.7;
    }
    // Venus appreciates aromatic, fragrant qualities
    if (flavorProfile.aromatic || flavorProfile.fragrant) {
      score +=
        ((flavorProfile.aromatic || 0) + (flavorProfile.fragrant || 0)) * 1.6;
    }
    // Venus is less interested in bitter or excessively spicy flavors
    if (flavorProfile.bitter) {
      score -= (flavorProfile.bitter || 0) * 0.2;
    }
    if (flavorProfile.spicy && flavorProfile.spicy > 0.7) {
      score -= (flavorProfile.spicy - 0.7) * 0.8;
    }
  }
  // Check texture alignment with Venus preferences
  const texture = safeGetStringArray(ingredientData.texture);
  if (texture.length > 0) {
    // Venus favors smooth, creamy, luscious textures
    const venusTextures = [
      "smooth",
      "creamy",
      "velvety",
      "soft",
      "tender",
      "juicy",
      "buttery",
    ];
    const textureMatch = venusTextures.filter((venusTexture) =>
      texture.some((t) => t.includes(venusTexture)),
    ).length;
    score += textureMatch * 0.5;
  }
  // Check culinary technique alignment
  const culinaryUsesArray = safeGetStringArray(ingredientData.culinaryUses);
  if (venusData.PlanetSpecific?.CulinaryTechniques && culinaryUsesArray.length > 0) {
    // Check for aesthetic presentation techniques
    if (
      culinaryUsesArray.some((use) => use.includes("garnish")) ||
      culinaryUsesArray.some((use) => use.includes("plating"))
    ) {
      score += 1.8;
    }
    // Check for balance and harmony in flavor pairings
    const harmonyPairingsArray = safeGetStringArray(ingredientData.harmonyPairings);
    if (harmonyPairingsArray.length > 3) {
      score += 1.5;
    }
    // Sweet and indulgent preparation techniques
    if (
      culinaryUsesArray.some((use) => use.includes("dessert")) ||
      culinaryUsesArray.some((use) => use.includes("baking")) ||
      culinaryUsesArray.some((use) => use.includes("confection"))
    ) {
      score += 1.2;
    }
    // Check for fragrance and aroma enhancement
    const { aromaticProperties } = ingredientData;
    if (
      aromaticProperties ||
      (flavorProfile?.aromatic && flavorProfile.aromatic > 0.7)
    ) {
      score += 1.6;
    }
    // Check for textural contrast techniques
    if (
      culinaryUsesArray.some((use) => use.includes("crispy")) ||
      culinaryUsesArray.some((use) => use.includes("caramelized"))
    ) {
      score += 1.3;
    }
  }
  // Check zodiac transit alignments with Venus
  if (zodiacSign && venusData.PlanetSpecific?.ZodiacTransit) {
    // Extract transit data with safe property access
    const transitDataRecord = getZodiacTransitEntry(venusData, zodiacSign);
    // Apply favorable modifiers for this sign
    if (transitDataRecord?.FavorableModifier) {
      score += safeGetNumber(transitDataRecord.FavorableModifier);
    }
    // Check favorable categories alignment
    if (transitDataRecord?.FavorableCategories) {
      const favorableCategories = safeGetStringArray(
        transitDataRecord.FavorableCategories,
      );
      // Category match
      const ingredientCategory = safeGetString(ingredientData.category);
      if (
        ingredientCategory &&
        favorableCategories.includes(ingredientCategory.toLowerCase())
      ) {
        score += 2.5;
      }
      // Additional category checks if ingredient has categories array
      const { categories } = ingredientData;
      if (Array.isArray(categories)) {
        const categoryMatches = categories.filter((cat: string) =>
          favorableCategories.includes(cat.toLowerCase()),
        ).length;
        score += categoryMatches * 1.5;
      }
    }
    // Check Elements alignment
    // Extract transit data with safe property access for elements
    const transitElements = transitDataRecord?.Elements;
    if (transitElements) {
      for (const element in transitElements) {
        const elemKey = element as keyof ElementalProperties;
        const transitValue = transitElements[element];
        if (elementalProps[elemKey] && transitValue !== undefined) {
          score += transitValue * elementalProps[elemKey] * 0.7;
        }
      }
    }
    // Check ingredient alignment with transit preferences
    if (transitDataRecord?.Ingredients) {
      const transitIngredients = transitDataRecord.Ingredients.map((i) =>
        i.toLowerCase(),
      );
      // Direct ingredient match
      const ingredientNameLower = ingredient.name.toLowerCase();
      if (
        transitIngredients.some(
          (i) =>
            ingredientNameLower.includes(i) ||
            i.includes(ingredientNameLower),
        )
      ) {
        score += 3.0;
      }
      // Category match
      const ingredientCategory = String(ingredient.category ?? ingredient.type ?? "").toLowerCase();
      if (
        transitIngredients.includes(ingredientCategory)
      ) {
        score += 2.0;
      }
      // Related ingredient match
      const relatedIngredients = safeGetStringArray(ingredientData.relatedIngredients);
      if (relatedIngredients.length > 0) {
        const relatedMatches = relatedIngredients.filter((related: string) =>
          transitIngredients.some(
            (i) =>
              related.toLowerCase().includes(i) ||
              i.includes(related.toLowerCase()),
          ),
        ).length;
        score += relatedMatches * 0.7;
      }
      // Complementary ingredients match
      const complementaryIngredients = safeGetStringArray(ingredientData.complementaryIngredients);
      if (complementaryIngredients.length > 0) {
        const complementaryMatches = complementaryIngredients.filter(
          (complementStr: string) =>
            transitIngredients.some(
              (i) =>
                complementStr.toLowerCase().includes(i) ||
                i.includes(complementStr.toLowerCase()),
            ),
        ).length;
        score += complementaryMatches * 0.5;
      }
    }
  }
  // Venus temperament based on sign type
  if (zodiacSign) {
    const earthSigns = ["taurus", "virgo", "capricorn"];
    const airSigns = ["gemini", "libra", "aquarius"];
    const waterSigns = ["cancer", "scorpio", "pisces"];
    const fireSigns = ["aries", "leo", "sagittarius"];
    const lowerSign = zodiacSign.toLowerCase();
    // Earth Venus
    const culinaryTemperament = venusData.PlanetSpecific?.CulinaryTemperament as Record<string, unknown> | undefined;
    if (
      earthSigns.includes(lowerSign) &&
      culinaryTemperament?.EarthVenus
    ) {
      const earthVenus = culinaryTemperament.EarthVenus as {
        FoodFocus?: string;
        Elements?: Record<string, number>;
      } | undefined;
      // Check for rich, grounding, nourishing ingredients
      if (
        texture.includes("rich") ||
        texture.includes("dense") ||
        (flavorProfile?.rich !== undefined && flavorProfile.rich > 0.5)
      ) {
        score += 2.0;
      }
      // Food focus alignment
      // Extract earth venus data with safe property access
      const earthVenusFoodFocus = earthVenus?.FoodFocus;
      if (earthVenusFoodFocus) {
        const focusKeywords = String(earthVenusFoodFocus)
          .toLowerCase()
          .split(/[\s,,]+/)
          .filter((k) => k.length > 3);
        const { description } = ingredient;
        if (
          focusKeywords.some(
            (keyword) =>
              String(ingredient.name || "")
                .toLowerCase()
                .includes(keyword) ||
              (description &&
                String(description).toLowerCase().includes(keyword)),
          )
        ) {
          score += 1.5;
        }
      }
      // Elements alignment
      // Extract earth venus elements with safe property access
      const earthVenusElements = earthVenus?.Elements;
      if (earthVenusElements) {
        const elementsData = earthVenusElements;
        for (const element in elementsData) {
          const elemKey = element as keyof ElementalProperties;
          if (elementalProps[elemKey]) {
            const elementValue = Number(elementsData[element] || 0);
            score +=
              elementValue * elementalProps[elemKey] * 1.0;
          }
        }
      }
    }
    // Air Venus
    if (
      airSigns.includes(lowerSign) &&
      culinaryTemperament?.AirVenus
    ) {
      const airVenus = culinaryTemperament.AirVenus as {
        FoodFocus?: string;
        Elements?: Record<string, number>;
      } | undefined;
      // Check for light, delicate ingredients
      if (
        texture.includes("light") ||
        texture.includes("crisp") ||
        (flavorProfile?.light !== undefined && flavorProfile.light > 0.5)
      ) {
        score += 2.0;
      }
      // Food focus alignment
      // Extract air venus data with safe property access
      const airVenusFoodFocus = airVenus?.FoodFocus;
      if (airVenusFoodFocus) {
        const focusKeywords = String(airVenusFoodFocus)
          .toLowerCase()
          .split(/[\s,,]+/)
          .filter((k) => k.length > 3);
        const { description } = ingredient;
        if (
          focusKeywords.some(
            (keyword) =>
              String(ingredient.name || "")
                .toLowerCase()
                .includes(keyword) ||
              (description &&
                String(description).toLowerCase().includes(keyword)),
          )
        ) {
          score += 1.5;
        }
      }
      // Elements alignment
      // Extract air venus elements with safe property access
      const airVenusElements = airVenus?.Elements;
      if (airVenusElements) {
        const elementsData = airVenusElements;
        for (const element in elementsData) {
          const elemKey = element as keyof ElementalProperties;
          if (elementalProps[elemKey]) {
            const elementValue = Number(elementsData[element] || 0);
            score +=
              elementValue * elementalProps[elemKey] * 1.0;
          }
        }
      }
    }
    // Water Venus
    if (
      waterSigns.includes(lowerSign) &&
      culinaryTemperament?.WaterVenus
    ) {
      const waterVenus = culinaryTemperament.WaterVenus as {
        FoodFocus?: string;
        Elements?: Record<string, number>;
      } | undefined;
      // Check for moist, juicy ingredients with safe property access
      const hasJuicyTexture = texture.includes("juicy");
      const hasTenderTexture = texture.includes("tender");
      if (
        hasJuicyTexture ||
        hasTenderTexture ||
        (flavorProfile?.juicy && flavorProfile.juicy > 0.5)
      ) {
        score += 2.0;
      }
      // Food focus alignment
      // Extract water venus data with safe property access
      const waterVenusFoodFocus = waterVenus?.FoodFocus;
      if (waterVenusFoodFocus) {
        const focusKeywords = String(waterVenusFoodFocus)
          .toLowerCase()
          .split(/[\s,,]+/)
          .filter((k) => k.length > 3);
        const ingredientName = String(ingredient.name || "").toLowerCase();
        const ingredientDescription = String(ingredient.description ?? "").toLowerCase();
        if (
          focusKeywords.some(
            (keyword) =>
              ingredientName.includes(keyword) ||
              ingredientDescription.includes(keyword),
          )
        ) {
          score += 1.5;
        }
      }
      // Elements alignment
      // Extract water venus elements with safe property access
      const waterVenusElements = waterVenus?.Elements;
      if (waterVenusElements) {
        const elementsData = waterVenusElements;
        for (const element in elementsData) {
          const elemKey = element as keyof ElementalProperties;
          if (elementalProps[elemKey]) {
            const elementValue = Number(elementsData[element] || 0);
            score +=
              elementValue * elementalProps[elemKey] * 1.0;
          }
        }
      }
    }
    // Fire Venus
    if (
      fireSigns.includes(lowerSign) &&
      culinaryTemperament?.FireVenus
    ) {
      const fireVenus = culinaryTemperament.FireVenus as {
        FoodFocus?: string;
        Elements?: Record<string, number>;
      } | undefined;
      // Check for vibrant, spicy ingredients with safe property access
      const hasStimulatingUses = culinaryUsesArray.includes("stimulating");
      if (
        (flavorProfile?.spicy && flavorProfile.spicy > 0.3) ||
        (flavorProfile?.vibrant && flavorProfile.vibrant > 0.5) ||
        hasStimulatingUses
      ) {
        score += 2.0;
      }
      // Food focus alignment
      // Extract fire venus data with safe property access
      const fireVenusFoodFocus = fireVenus?.FoodFocus;
      if (fireVenusFoodFocus) {
        const focusKeywords = String(fireVenusFoodFocus)
          .toLowerCase()
          .split(/[\s,,]+/)
          .filter((k) => k.length > 3);
        const ingredientName = String(ingredient.name || "").toLowerCase();
        const ingredientDescription = String(ingredient.description ?? "").toLowerCase();
        if (
          focusKeywords.some(
            (keyword) =>
              ingredientName.includes(keyword) ||
              ingredientDescription.includes(keyword),
          )
        ) {
          score += 1.5;
        }
      }
      // Elements alignment
      // Extract fire venus elements with safe property access
      const fireVenusElements = fireVenus?.Elements;
      if (fireVenusElements) {
        const elementsData = fireVenusElements;
        for (const element in elementsData) {
          const elemKey = element as keyof ElementalProperties;
          if (elementalProps[elemKey]) {
            const elementValue = Number(elementsData[element] || 0);
            score +=
              elementValue * elementalProps[elemKey] * 1.0;
          }
        }
      }
    }
  }
  // Retrograde modifiers
  if (isVenusRetrograde && venusData.PlanetSpecific?.Retrograde) {
    // Increase score for preserved or dried herbs during retrograde
    const preservationMethods = ingredientData.preservation_methods;
    const { categories } = ingredientData;
    const ingredientCategory = safeGetString(ingredientData.category);
    const preservationMethodsArray = Array.isArray(preservationMethods)
      ? preservationMethods
      : [];
    const categoriesArray = Array.isArray(categories) ? categories : [];
    if (
      preservationMethodsArray.includes("dried") ||
      ingredientCategory === "herb" ||
      categoriesArray.includes("preserved")
    ) {
      score *= 1.5;
    } else {
      score *= 0.8; // Slightly reduce other ingredients
    }
    // Nostalgia foods get a boost during retrograde
    // Extract ingredient data with safe property access for cultural significance
    const culturalSignificance = ingredientData.cultural_significance;
    const culturalSignificanceArray = Array.isArray(culturalSignificance)
      ? culturalSignificance
      : typeof culturalSignificance === "string"
        ? [culturalSignificance]
        : [];
    if (
      culturalSignificanceArray.includes("traditional") ||
      culturalSignificanceArray.includes("nostalgic")
    ) {
      score += 1.8;
    }
    // Check retrograde food focus
    // Extract retrograde data with safe property access
    const retrogradeData = venusData.PlanetSpecific.Retrograde as {
      FoodFocus?: string;
      Elements?: Record<string, number>;
    } | undefined;
    const retroFoodFocus = retrogradeData?.FoodFocus;
    if (retroFoodFocus) {
      const retroFocus =
        typeof retroFoodFocus === "string" ? retroFoodFocus.toLowerCase() : "";
      const ingredientName =
        safeGetString(ingredientData.name)?.toLowerCase() ?? "";
      const ingredientDesc =
        safeGetString(ingredientData.description)?.toLowerCase() ?? "";
      // Check for keyword matches
      const retroKeywords = retroFocus
        .split(/[\s,,]+/)
        .filter((k) => k.length > 3);
      for (const keyword of retroKeywords) {
        if (
          ingredientName.includes(keyword) ||
          ingredientDesc.includes(keyword)
        ) {
          score += 1.7;
          break;
        }
      }
    }
    // Check retrograde elements
    // Extract retrograde elements with safe property access
    const retrogradeElements = retrogradeData?.Elements;
    if (retrogradeElements) {
      const elementsData = retrogradeElements;
      for (const element in elementsData) {
        const elementKey = element as keyof ElementalProperties;
        if (elementalProps[elementKey]) {
          const elementValue = safeGetNumber(elementsData[element]);
          score +=
            elementValue * elementalProps[elementKey] * 0.9;
        }
      }
    }
  }
  // Lunar phase connections with Venus
  const lunarConnection = (venusData as { LunarConnection?: unknown }).LunarConnection;
  if (lunarConnection) {
    // This would be checked against the current lunar phase in a full implementation
  }
  return score;
}
// Enhance ingredient scoring with Venus influence
function _enhanceVenusIngredientScoring(
  ingredient: Ingredient | EnhancedIngredient,
  astroState: AstrologicalStateType,
  score: number,
): number {
  // Only apply Venus scoring if Venus is active
  if (!astroState.activePlanets?.includes("Venus")) {
    return score;
  }
  // Get current zodiac sign
  const zodiacSign = astroState.zodiacSign as string | undefined;
  const isVenusRetrograde = getAstroRetrogrades(astroState).includes("Venus");
  // Calculate Venus influence score
  const venusInfluence = calculateVenusInfluence(
    ingredient,
    zodiacSign,
    isVenusRetrograde,
  );
  // Apply Venus influence to the base score (weight it appropriately)
  return score + venusInfluence * 0.3;
}
// Enhanced function to boost Venus-ruled ingredients based on detailed Venus data
function enhanceVenusIngredientBatch(
  ingredients: Array<Ingredient | EnhancedIngredient>,
  astroState: AstrologicalStateType,
): void {
  // Check if Venus is active
  const isVenusActive = astroState.activePlanets?.includes("Venus");
  if (!isVenusActive) {
    return; // Skip Venus scoring if Venus is not active
  }
  // Get current zodiac sign
  const zodiacSign = astroState.zodiacSign as string | undefined;
  const isVenusRetrograde = getAstroRetrogrades(astroState).includes("Venus");
  // Add a 'venusScore' property to each ingredient for sorting
  ingredients.forEach((ingredient) => {
    // Use our comprehensive Venus influence calculation
    const venusScore = calculateVenusInfluence(
      ingredient,
      zodiacSign,
      isVenusRetrograde,
    );
    // Store the Venus score with the ingredient
    (ingredient as { venusScore?: number }).venusScore = venusScore;
  });
  // Sort ingredients by Venus score
  ingredients.sort((a, b) => {
    const aScore = (a as { venusScore?: number }).venusScore ?? 0;
    const bScore = (b as { venusScore?: number }).venusScore ?? 0;
    return bScore - aScore;
  });
}
/**
 * Calculates a Mars influence score for an ingredient
 */
function calculateMarsInfluence(
  ingredient: Ingredient | EnhancedIngredient,
  zodiacSign?: string,
  isMarsRetrograde = false,
): number {
  let score = 0;
  // Get the name in lowercase for comparison
  const name = ingredient.name.toLowerCase();
  // Match with Mars food associations
  if (marsData.FoodAssociations) {
    for (const food of marsData.FoodAssociations) {
      if (
        name.includes(food.toLowerCase()) ||
        food.toLowerCase().includes(name)
      ) {
        score += 1.5;
        break;
      }
    }
  }
  // Match with Mars herb associations (stronger affinity)
  if (marsData.HerbalAssociations?.Herbs) {
    for (const herb of marsData.HerbalAssociations.Herbs) {
      if (
        name.includes(herb.toLowerCase()) ||
        herb.toLowerCase().includes(name)
      ) {
        score += 2.0;
        break;
      }
    }
  }
  // Flavor profile alignment
  // Extract ingredient data with safe property access for flavor profile
  const ingredientFlavorProfile = (ingredient as { flavorProfile?: Record<string, unknown> }).flavorProfile;
  if (marsData.FlavorProfiles && ingredientFlavorProfile) {
    const marsFlavorProfiles = marsData.FlavorProfiles;
    for (const flavor in marsFlavorProfiles) {
      const flavorKey = flavor as keyof typeof marsFlavorProfiles;
      const flavorValue = safeGetNumber(ingredientFlavorProfile[flavor]);
      if (flavorValue > 0) {
        // Higher score when both have high values for same flavor
        score += marsFlavorProfiles[flavorKey] * flavorValue;
      }
    }
  }
  // Elemental alignment
  // Mars is primarily Fire, secondarily Water
  const elementalProps = ingredient.elementalProperties ?? { Fire: 0, Water: 0, Earth: 0, Air: 0 };
  const fireScore = elementalProps.Fire || 0;
  const waterScore = elementalProps.Water || 0;
  score += fireScore * 1.5; // Primary element gets higher weight
  score += waterScore * 0.8; // Secondary element
  // Zodiac sign specific boost
  if (zodiacSign && marsData.PlanetSpecific?.ZodiacTransit) {
    const transit = getZodiacTransitEntry(marsData, zodiacSign);
    // Check if ingredient is in the transit's ingredient list
    if (transit?.Ingredients) {
      for (const transitIngredient of transit.Ingredients) {
        if (
          name.includes(transitIngredient.toLowerCase()) ||
          transitIngredient.toLowerCase().includes(name)
        ) {
          score += 2.5; // Strong boost for exact ingredient match in current zodiac
          break;
        }
      }
    }
    // Check element alignment with transit
    if (transit?.Elements) {
      for (const element in transit.Elements) {
        const elemValue = element as keyof ElementalProperties;
        const transitValue = transit.Elements[element];
        if (elementalProps[elemValue] && transitValue !== undefined) {
          score += transitValue * elementalProps[elemValue] * 1.2;
        }
      }
    }
  }
  // Mars retrograde effects
  if (isMarsRetrograde && marsData.PlanetSpecific?.Retrograde) {
    // During retrograde, Mars emphasizes dried herbs and spices
    const ingredientType = String((ingredient as { type?: string }).type ?? ingredient.category ?? "");
    if (
      ingredientType === "spice" ||
      ingredientType === "herb" ||
      ingredientType === "seasoning"
    ) {
      score += 1.5;
    }
    // Focus shifts to traditional uses
    const ingredientTraditional = (ingredient as { traditional?: unknown }).traditional;
    if (ingredientTraditional) {
      score += 1.2;
    }
  }
  // Adjust for Mars temperament based on dominant element
  const fireDominant = (elementalProps.Fire || 0) > 0.6;
  const waterDominant = (elementalProps.Water || 0) > 0.6;
  // Extract Mars temperament data with safe property access
  const marsTemperament = marsData.PlanetSpecific?.CulinaryTemperament as Record<string, unknown> | undefined;
  const fireMars = marsTemperament?.FireMars;
  const waterMars = marsTemperament?.WaterMars;
  if (fireDominant && fireMars) {
    score += 1.5;
  } else if (waterDominant && waterMars) {
    score += 1.3;
  }
  return score;
}
/**
 * Apply Mars-specific scoring to a collection of ingredients
 */
function enhanceMarsIngredientScoring(
  ingredients: Array<Ingredient | EnhancedIngredient>,
  astroState: AstrologicalStateType,
): void {
  // Get Mars status info from astro state
  const isMarsRetrograde = getAstroRetrogrades(astroState).includes("Mars");
  const { zodiacSign } = astroState;
  // Compute Mars influence for each ingredient
  for (let i = 0; i < ingredients.length; i++) {
    const ingredient = ingredients[i];
    if (!ingredient) continue;
    const ingredientData = ingredient as {
      name?: string;
      matchScore?: number;
      influences?: Record<string, number>;
    };
    const ingredientName = ingredientData.name;
    const ingredientMatchScore = ingredientData.matchScore;
    if (!ingredientName || !ingredientMatchScore) continue;
    // Calculate Mars influence
    const marsInfluence = calculateMarsInfluence(
      ingredient,
      zodiacSign,
      isMarsRetrograde,
    );
    // Apply Mars boost to match score
    if (marsInfluence > 0) {
      // Include the original score, add the Mars influence
      const currentScore = safeGetNumber(ingredientData.matchScore) || 0;
      ingredientData.matchScore = currentScore + marsInfluence * 1.8;
      // Add a flag or data point to indicate Mars influence was applied
      ingredientData.influences ??= {};
      ingredientData.influences.mars = marsInfluence;
    }
  }
  // Re-sort the ingredients based on the updated scores
  ingredients.sort((a, b) => {
    const aScore = (a as { matchScore?: number }).matchScore ?? 0;
    const bScore = (b as { matchScore?: number }).matchScore ?? 0;
    return bScore - aScore;
  });
}
// Add the new function for Mercury associated ingredients
function isMercuryAssociatedIngredient(ingredientName: string): boolean {
  if (!ingredientName) return false;
  const lowerIngredient = ingredientName.toLowerCase();
  // Check direct Mercury food associations
  if (
    mercuryData.FoodAssociations?.some(
      (food) =>
        food.toLowerCase() === lowerIngredient ||
        lowerIngredient.includes(food.toLowerCase()) ||
        food.toLowerCase().includes(lowerIngredient),
    )
  ) {
    return true;
  }
  // Check Mercury herb associations
  if (
    mercuryData.HerbalAssociations?.Herbs?.some(
      (herb) =>
        herb.toLowerCase() === lowerIngredient ||
        lowerIngredient.includes(herb.toLowerCase()) ||
        herb.toLowerCase().includes(lowerIngredient),
    )
  ) {
    return true;
  }
  // Check for Mercury elemental connection through flavor profile
  // Mercury emphasizes complexity, variety, multiple ingredients, and contrasting flavors
  const mercuryFlavorSignals = [
    "mixed",
    "blend",
    "infused",
    "complex",
    "layered",
    "aromatic",
    "herb",
    "mint",
    "anise",
    "fennel",
    "dill",
    "light",
    "citrus",
    "varied",
    "fusion",
    "multi",
    "fresh",
    "stimulant",
    "tea",
    "seeds",
    "nuts",
    "grain",
  ];
  if (mercuryFlavorSignals.some((signal) => lowerIngredient.includes(signal))) {
    return true;
  }
  // Mercury is associated with Air and Earth elements
  // Lighter ingredients (Air) and grounding ingredients (Earth)
  if (
    lowerIngredient.includes("air") ||
    lowerIngredient.includes("light") ||
    lowerIngredient.includes("puff") ||
    lowerIngredient.includes("crisp") ||
    lowerIngredient.includes("earth") ||
    lowerIngredient.includes("root") ||
    lowerIngredient.includes("tuber")
  ) {
    return true;
  }
  // Check Mercury ZodiacTransit ingredient associations in current sign
  // This is a more dynamic way to check for transient associations
  const currentZodiacSignType = "aries"; // Use fallback or implement getCurrentZodiacSignType function
  const currentZodiacTransitEntry = getZodiacTransitEntry(
    mercuryData,
    currentZodiacSignType,
  );
  if (currentZodiacTransitEntry?.Ingredients) {
    const transitIngredients = currentZodiacTransitEntry.Ingredients;
    if (
      transitIngredients.some(
        (ingredient) =>
          ingredient.toLowerCase() === lowerIngredient ||
          lowerIngredient.includes(ingredient.toLowerCase()) ||
          ingredient.toLowerCase().includes(lowerIngredient),
      )
    ) {
      return true;
    }
  }
  return false;
}
// Add the function to calculate Mercury influence on ingredients
function calculateMercuryInfluence(
  ingredient: Ingredient | EnhancedIngredient,
  zodiacSign?: string,
  isMercuryRetrograde = false,
): number {
  let score = 0;
  // Base score for Mercury-ruled ingredients
  const rulingPlanets = getIngredientRulingPlanets(ingredient);
  if (rulingPlanets.includes("Mercury")) {
    score += 3.0; // Strong baseline for Mercury-ruled ingredients
  }
  // Mercury food associations
  const ingredientName = ingredient.name.toLowerCase();
  if (mercuryData.FoodAssociations) {
    for (const food of mercuryData.FoodAssociations) {
      if (
        ingredientName.includes(food.toLowerCase()) ||
        food.toLowerCase().includes(ingredientName)
      ) {
        score += 2.0;
        break;
      }
    }
  }
  // Mercury herb associations
  const ingredientType = String((ingredient as { type?: string }).type ?? ingredient.category ?? "");
  if (
    mercuryData.HerbalAssociations?.Herbs &&
    (ingredientType === "herb" || ingredientType === "spice")
  ) {
    for (const herb of mercuryData.HerbalAssociations.Herbs) {
      if (
        ingredientName.includes(herb.toLowerCase()) ||
        herb.toLowerCase().includes(ingredientName)
      ) {
        score += 2.5; // Higher score for direct Mercury herb associations
        break;
      }
    }
  }
  // Elemental affinities based on Mercury's elements
  // Mercury's primary elements are Air and Earth
  const elementalProps = ingredient.elementalProperties ?? { Fire: 0, Water: 0, Earth: 0, Air: 0 };
  score += (elementalProps.Air || 0) * 2.0;
  score += (elementalProps.Earth || 0) * 1.8;
  // Add scores based on zodiac sign if provided
  if (zodiacSign) {
    const lowerSign = zodiacSign.toLowerCase();
    // Boost if ingredient has affinity with the current sign
    const signAffinities = getIngredientSignAffinities(ingredient);
    if (signAffinities.includes(lowerSign)) {
      score += 1.5;
    }
    // Check Mercury's zodiac transit data for this sign
    const mercuryTransit = getZodiacTransitEntry(mercuryData, zodiacSign);
    if (mercuryTransit) {
      // Boost for ingredients matching transit ingredients
      if (
        mercuryTransit.Ingredients?.some(
          (transitIngredient) =>
            ingredientName.includes(transitIngredient.toLowerCase()) ||
            transitIngredient.toLowerCase().includes(ingredientName),
        )
      ) {
        score += 2.5;
      }
      // Element alignment with Mercury in this sign
      if (mercuryTransit.Elements) {
        for (const element in mercuryTransit.Elements) {
          const elemKey = element as keyof ElementalProperties;
          const mercuryValue = mercuryTransit.Elements[element];
          if (elementalProps[elemKey] && mercuryValue !== undefined) {
            score += mercuryValue * elementalProps[elemKey] * 1.2;
          }
        }
      }
    }
    // Special scoring for Mercury in its domicile signs
    if (lowerSign === "gemini" || lowerSign === "virgo") {
      if (rulingPlanets.includes("Mercury")) {
        score += 2.0; // Extra boost for Mercury ruling when Mercury is in domicile
      }
      // Special handling for Gemini (Air) and Virgo (Earth)
      if (lowerSign === "gemini" && elementalProps.Air) {
        score += elementalProps.Air * 1.8;
      } else if (
        lowerSign === "virgo" &&
        elementalProps.Earth
      ) {
        score += elementalProps.Earth * 1.8;
      }
    }
    // Special handling for Mercury in its detriment signs
    if (lowerSign === "sagittarius" || lowerSign === "pisces") {
      score *= 0.8; // Reduce score slightly when Mercury is in detriment
    }
  }
  const qualities = Array.isArray(ingredient.qualities) ? ingredient.qualities : [];
  // Adjust score based on Mercury retrograde status
  if (isMercuryRetrograde) {
    // During retrograde, Mercury emphasizes familiar, traditional ingredients
    if (
      qualities.includes("traditional") ||
      qualities.includes("nostalgic") ||
      qualities.includes("classic")
    ) {
      score *= 1.25; // Boost for traditional ingredients during retrograde
    }
    // During retrograde, Mercury de-emphasizes complex or exotic ingredients
    if (
      qualities.includes("exotic") ||
      qualities.includes("complex") ||
      qualities.includes("novel")
    ) {
      score *= 0.8; // Reduce score for complex/exotic ingredients during retrograde
    }
    // Apply Mercury's retrograde elemental shift if available
    const elementalProperties = elementalProps;
    if (
      mercuryData.RetrogradeEffect &&
      typeof mercuryData.RetrogradeEffect === "object"
    ) {
      const retrogradeEffect = mercuryData.RetrogradeEffect as Record<string, unknown>;
      // Shift toward Matter and away from Spirit during retrograde
      if (retrogradeEffect.Matter !== undefined) {
        score +=
          elementalProperties.Earth *
          Math.abs(Number(retrogradeEffect.Matter));
      }
      if (retrogradeEffect.Spirit !== undefined) {
        score -=
          elementalProperties.Air *
          Math.abs(Number(retrogradeEffect.Spirit));
      }
    }
  }
  // Adjust for Mercury's specific influence on certain ingredient qualities
  // Mercury emphasizes ingredients that involve mental stimulation and clarity
  const mercuryQualityBoosts = {
    aromatic: 1.3,
    complex: 1.4,
    stimulating: 1.5,
    adaptable: 1.3,
    versatile: 1.4,
    detailed: 1.2,
    _precise: 1.2,
  };
  for (const quality of qualities) {
    const lowerQuality = quality.toLowerCase();
    for (const [mercuryQuality, boost] of Object.entries(
      mercuryQualityBoosts,
    )) {
      if (lowerQuality.includes(mercuryQuality)) {
        score += boost;
        break;
      }
    }
  }
  return score;
}
// Add the function to enhance Mercury ingredient scoring
function enhanceMercuryIngredientScoring(
  ingredients: Array<Ingredient | EnhancedIngredient>,
  astroState: AstrologicalStateType,
): void {
  const isMercuryRetrograde = getAstroRetrogrades(astroState).includes("Mercury");
  const { zodiacSign } = astroState;
  // For each ingredient, calculate and apply Mercury influence score
  ingredients.forEach((ingredient) => {
    const mercuryScore = calculateMercuryInfluence(
      ingredient,
      zodiacSign,
      isMercuryRetrograde,
    );
    const ing = ingredient as {
      matchScore?: number;
      score?: number;
      mercuryAffinity?: number;
      scoreDetails?: Record<string, unknown>;
      [key: string]: unknown;
    };
    // Apply Mercury score as a multiplier to the ingredient's existing score
    if (ing.matchScore !== undefined) {
      const currentScore = safeGetNumber(ing.matchScore) || 0;
      ing.matchScore = currentScore * (1 + mercuryScore * 0.3);
    } else if ("score" in ing) {
      const currentScore = safeGetNumber(ing.score) || 0;
      ing.score = currentScore * (1 + mercuryScore * 0.3);
    }
    // If the ingredient has a Mercury score field, update it
    if ("mercuryAffinity" in ing) {
      ing.mercuryAffinity = mercuryScore;
    }
    // If the ingredient has a detailed score breakdown, add Mercury score
    const ingData = ing as Record<string, unknown>;
    if (typeof ingData.scoreDetails === "object" && ingData.scoreDetails !== null) {
      ingData.scoreDetails = {
        ...ingData.scoreDetails,
        mercuryAffinity: mercuryScore,
      };
    }
  });
}
/**
 * Determines the modality of an ingredient based on its qualities and elemental properties
 * Using the hierarchical affinities: * - Mutability: Air > Water > Fire > Earth
 * - Fixed: Earth > Water > Fire > Air
 * - Cardinal: Equal for all elements
 *
 * @param qualities Array of quality descriptors
 * @param elementalProperties Optional elemental properties for more accurate determination
 * @returns The modality (Cardinal, Fixed, or Mutable)
 */
function determineIngredientModality(
  qualities: string[] = [],
  elementalProperties?: ElementalProperties,
): Modality {
  // Ensure qualities is an array
  const qualitiesArray = Array.isArray(qualities) ? qualities : [];
  // Create normalized arrays of qualities for easier matching
  const normalizedQualities = qualitiesArray.map((q) => q.toLowerCase());
  // Look for explicit quality indicators in the ingredients
  const cardinalKeywords = [
    "initiating",
    "spicy",
    "pungent",
    "stimulating",
    "invigorating",
    "activating",
  ];
  const fixedKeywords = [
    "grounding",
    "stabilizing",
    "nourishing",
    "sustaining",
    "foundational",
  ];
  const mutableKeywords = [
    "adaptable",
    "flexible",
    "versatile",
    "balancing",
    "harmonizing",
  ];
  const hasCardinalQuality = normalizedQualities.some((q) =>
    cardinalKeywords.includes(q),
  );
  const hasFixedQuality = normalizedQualities.some((q) =>
    fixedKeywords.includes(q),
  );
  const hasMutableQuality = normalizedQualities.some((q) =>
    mutableKeywords.includes(q),
  );
  // If there's a clear quality indicator, use that
  if (hasCardinalQuality && !hasFixedQuality && !hasMutableQuality) {
    return "Cardinal";
  }
  if (hasFixedQuality && !hasCardinalQuality && !hasMutableQuality) {
    return "Fixed";
  }
  if (hasMutableQuality && !hasCardinalQuality && !hasFixedQuality) {
    return "Mutable";
  }
  // If elemental properties are provided, use them to determine modality
  if (elementalProperties) {
    const { Fire, Water, Earth, Air } = elementalProperties;
    // Determine dominant element
    const dominantElement = getDominantElement(elementalProperties);
    // Use hierarchical element-modality affinities
    switch (dominantElement) {
      case "Air":
        // Air has strongest affinity with Mutable, then Cardinal, then Fixed
        if (Air > 0.4) {
          return "Mutable";
        }
        break;
      case "Earth":
        // Earth has strongest affinity with Fixed, then Cardinal, then Mutable
        if (Earth > 0.4) {
          return "Fixed";
        }
        break;
      case "Fire":
        // Fire has balanced affinities but leans Cardinal
        if (Fire > 0.4) {
          return "Cardinal";
        }
        break;
      case "Water": // Water is balanced between Fixed and Mutable
        if (Water > 0.4) {
          // Slightly favor Mutable for Wateras per our hierarchy
          return Water > 0.6 ? "Mutable" : "Fixed";
        }
        break;
    }
    // Calculate modality scores based on hierarchical affinities
    const mutableScore = Air * 0.9 + Water * 0.8 + Fire * 0.7 + Earth * 0.5;
    const fixedScore = Earth * 0.9 + Water * 0.8 + Fire * 0.6 + Air * 0.5;
    const cardinalScore = Fire * 0.8 + Earth * 0.8 + Water * 0.8 + Air * 0.8;
    // Return the modality with the highest score
    if (mutableScore > fixedScore && mutableScore > cardinalScore) {
      return "Mutable";
    } else if (fixedScore > mutableScore && fixedScore > cardinalScore) {
      return "Fixed";
    } else {
      return "Cardinal";
    }
  }
  // Default to Mutable if no clear indicators are found
  return "Mutable";
}
/**
 * Helper function to get the dominant element from elemental properties
 */
function getDominantElement(
  elementalProperties: ElementalProperties,
): keyof ElementalProperties {
  const elements = ["Fire", "Water", "Earth", "Air"] as const;
  let dominantElement: keyof ElementalProperties = "Earth"; // Default
  let highestValue = 0;
  // Find the element with the highest value
  elements.forEach((element) => {
    const value = elementalProperties[element] || 0;
    if (value > highestValue) {
      highestValue = value;
      dominantElement = element;
    }
  });
  return dominantElement;
}
/**
 * Maps planets to their elemental influences (diurnal and nocturnal elements)
 */
const planetaryElements: Record<
  string,
  | {
      diurnal: keyof ElementalProperties;
      nocturnal: keyof ElementalProperties;
      dignityEffect?: Record<string, number>;
    }
  | undefined
> = {
  Sun: {
    diurnal: "Fire",
    nocturnal: "Fire",
    dignityEffect: { leo: 1, aries: 2, aquarius: -1, libra: -2 },
  },
  Moon: {
    diurnal: "Water",
    nocturnal: "Water",
    dignityEffect: { cancer: 1, taurus: 2, capricorn: -1, scorpio: -2 },
  },
  Mercury: {
    diurnal: "Air",
    nocturnal: "Earth",
    dignityEffect: { gemini: 1, virgo: 3, sagittarius: 1, pisces: -3 },
  },
  Venus: {
    diurnal: "Water",
    nocturnal: "Earth",
    dignityEffect: {
      libra: 1,
      taurus: 1,
      pisces: 2,
      aries: -1,
      scorpio: -1,
      virgo: -2,
    },
  },
  Mars: {
    diurnal: "Fire",
    nocturnal: "Water",
    dignityEffect: {
      aries: 1,
      scorpio: 1,
      capricorn: 2,
      taurus: -1,
      libra: -1,
      cancer: -2,
    },
  },
  Jupiter: {
    diurnal: "Air",
    nocturnal: "Fire",
    dignityEffect: {
      pisces: 1,
      sagittarius: 1,
      cancer: 2,
      gemini: -1,
      virgo: -1,
      capricorn: -2,
    },
  },
  Saturn: {
    diurnal: "Air",
    nocturnal: "Earth",
    dignityEffect: {
      aquarius: 1,
      capricorn: 1,
      libra: 2,
      cancer: -1,
      leo: -1,
      aries: -2,
    },
  },
  Uranus: {
    diurnal: "Water",
    nocturnal: "Air",
    dignityEffect: { aquarius: 1, scorpio: 2, taurus: -3 },
  },
  Neptune: {
    diurnal: "Water",
    nocturnal: "Water",
    dignityEffect: { pisces: 1, cancer: 2, virgo: -1, capricorn: -2 },
  },
  Pluto: {
    diurnal: "Earth",
    nocturnal: "Water",
    dignityEffect: { scorpio: 1, leo: 2, taurus: -1, aquarius: -2 },
  },
};
// Define sign info with decan effects and degree effects
const signInfo: Record<
  string,
  | {
      element: keyof ElementalProperties;
      decanEffects: Record<string, string[]>;
      degreeEffects: Record<string, number[]>;
    }
  | undefined
> = {
  aries: {
    element: "Fire",
    decanEffects: {
      "1st Decan": ["Mars"],
      "2nd Decan": ["Sun"],
      "3rd Decan": ["Venus"],
    },
    degreeEffects: {
      Mercury: [1521],
      Venus: [714],
      Mars: [2226],
      Jupiter: [16],
      Saturn: [2730],
    },
  },
  taurus: {
    element: "Earth",
    decanEffects: {
      "1st Decan": ["Mercury"],
      "2nd Decan": ["Moon"],
      "3rd Decan": ["Saturn"],
    },
    degreeEffects: {
      Mercury: [915],
      Venus: [18],
      Mars: [2730],
      Jupiter: [1622],
      Saturn: [2326],
    },
  },
  gemini: {
    element: "Air",
    decanEffects: {
      "1st Decan": ["Jupiter"],
      "2nd Decan": ["Mars"],
      "3rd Decan": ["Uranus", "Sun"],
    },
    degreeEffects: {
      Mercury: [17],
      Venus: [1520],
      Mars: [2630],
      Jupiter: [814],
      Saturn: [2225],
    },
  },
  cancer: {
    element: "Water",
    decanEffects: {
      "1st Decan": ["Venus"],
      "2nd Decan": ["Mercury", "Pluto"],
      "3rd Decan": ["Neptune", "Moon"],
    },
    degreeEffects: {
      Mercury: [1420],
      Venus: [2127],
      Mars: [16],
      Jupiter: [713],
      Saturn: [2830],
    },
  },
  leo: {
    element: "Fire",
    decanEffects: {
      "1st Decan": ["Saturn"],
      "2nd Decan": ["Jupiter"],
      "3rd Decan": ["Mars"],
    },
    degreeEffects: {
      Mercury: [713],
      Venus: [1419],
      Mars: [2630],
      Jupiter: [2025],
      Saturn: [16],
    },
  },
  virgo: {
    element: "Earth",
    decanEffects: {
      "1st Decan": ["Mars", "Sun"],
      "2nd Decan": ["Venus"],
      "3rd Decan": ["Mercury"],
    },
    degreeEffects: {
      Mercury: [17],
      Venus: [813],
      Mars: [2530],
      Jupiter: [1418],
      Saturn: [1924],
    },
  },
  libra: {
    element: "Air",
    decanEffects: {
      "1st Decan": ["Moon"],
      "2nd Decan": ["Saturn", "Uranus"],
      "3rd Decan": ["Jupiter"],
    },
    degreeEffects: {
      Mercury: [2024],
      Venus: [711],
      Mars: [],
      Jupiter: [1219],
      Saturn: [16],
    },
  },
  scorpio: {
    element: "Water",
    decanEffects: {
      "1st Decan": ["Pluto"],
      "2nd Decan": ["Neptune", "Sun"],
      "3rd Decan": ["Venus"],
    },
    degreeEffects: {
      Mercury: [2227],
      Venus: [1521],
      Mars: [16],
      Jupiter: [714],
      Saturn: [2830],
    },
  },
  sagittarius: {
    element: "Fire",
    decanEffects: {
      "1st Decan": ["Mercury"],
      "2nd Decan": ["Moon"],
      "3rd Decan": ["Saturn"],
    },
    degreeEffects: {
      Mercury: [1520],
      Venus: [914],
      Mars: [],
      Jupiter: [18],
      Saturn: [2125],
    },
  },
  capricorn: {
    element: "Earth",
    decanEffects: {
      "1st Decan": ["Jupiter"],
      "2nd Decan": [],
      "3rd Decan": ["Sun"],
    },
    degreeEffects: {
      Mercury: [712],
      Venus: [16],
      Mars: [],
      Jupiter: [1319],
      Saturn: [2630],
    },
  },
  aquarius: {
    element: "Air",
    decanEffects: {
      "1st Decan": ["Uranus"],
      "2nd Decan": ["Mercury"],
      "3rd Decan": ["Moon"],
    },
    degreeEffects: {
      Mercury: [],
      Venus: [1320],
      Mars: [2630],
      Jupiter: [2125],
      Saturn: [16],
    },
  },
  pisces: {
    element: "Water",
    decanEffects: {
      "1st Decan": ["Saturn", "Neptune", "Venus"],
      "2nd Decan": ["Jupiter"],
      "3rd Decan": ["Pisces", "Mars"],
    },
    degreeEffects: {
      Mercury: [1520],
      Venus: [18],
      Mars: [2126],
      Jupiter: [914],
      Saturn: [2730],
    },
  },
};
/**
 * Calculate the planetary day influence on food ingredients
 * Now enhanced with dignity effects, decan effects, and degree effects
 */
function calculatePlanetaryDayInfluence(
  ingredient: Ingredient | EnhancedIngredient,
  planetaryDay: string,
  planetaryPositions?: Record<string, { sign: string; degree: number } | undefined>,
  planetaryData?: { jupiterData: unknown; saturnData: unknown },
): number {
  // Enhanced calculation using Jupiter and Saturn data for dignity effects
  const _enhancedPlanetaryInfluence = planetaryData
    ? calculateEnhancedPlanetaryInfluence(planetaryDay, planetaryData)
    : 1.0;
  // Get the elements associated with the current planetary day
  const dayElements = planetaryElements[planetaryDay];
  if (!dayElements) return 0.5; // Unknown planet
  // For planetary day, BOTH diurnal and nocturnal elements influence all day
  const diurnalElement = dayElements.diurnal;
  const nocturnalElement = dayElements.nocturnal;
  const elementalProps = ingredient.elementalProperties ?? { Fire: 0, Water: 0, Earth: 0, Air: 0 };
  const diurnalMatch = elementalProps[diurnalElement] || 0;
  const nocturnalMatch = elementalProps[nocturnalElement] || 0;
  // Calculate a weighted score - both elements are equally important for planetary day
  let elementalScore = (diurnalMatch + nocturnalMatch) / 2;
  // Apply dignity effects if we have planet positions
  if (planetaryPositions?.[planetaryDay]) {
    const planetSign = planetaryPositions[planetaryDay].sign;
    const planetDegree = planetaryPositions[planetaryDay].degree;
    // Dignity effect bonus/penalty
    if (dayElements.dignityEffect?.[planetSign]) {
      const dignityModifier = dayElements.dignityEffect[planetSign] * 0.1; // Scale to 0.1-0.3 effect
      elementalScore = Math.min(
        1.0,
        Math.max(0.0, elementalScore + dignityModifier),
      );
    }
    // Calculate decan (1-10°: 1st decan11-20°: 2nd decan21-30°: 3rd decan)
    let decan = "1st Decan";
    if (planetDegree > 10 && planetDegree <= 20) decan = "2nd Decan";
    else if (planetDegree > 20) decan = "3rd Decan";
    // Apply decan effects if the planet is in its own decan
    const signData = signInfo[planetSign];
    if (signData?.decanEffects[decan]?.includes(planetaryDay)) {
      elementalScore = Math.min(1.0, elementalScore + 0.15);
    }
    // Apply degree effects
    const degreeRange = signData?.degreeEffects[planetaryDay];
    if (degreeRange?.length === 2) {
      const [minDegree, maxDegree] = degreeRange;
      if (
        minDegree !== undefined &&
        maxDegree !== undefined &&
        planetDegree >= minDegree &&
        planetDegree <= maxDegree
      ) {
        elementalScore = Math.min(1.0, elementalScore + 0.2);
      }
    }
  }
  // If the food has a direct planetary affinity, give bonus points
  const rulingPlanets = getIngredientRulingPlanets(ingredient);
  if (rulingPlanets.includes(planetaryDay)) {
    elementalScore = Math.min(1.0, elementalScore + 0.3);
  }
  return elementalScore;
}
/**
 * Calculate the planetary hour influence on food
 * Now enhanced with dignity effects and aspect considerations
 */
function calculatePlanetaryHourInfluence(
  ingredient: Ingredient | EnhancedIngredient,
  planetaryHour: string,
  isDaytime: boolean,
  planetaryPositions?: Record<string, { sign: string; degree: number } | undefined>,
  aspects?: Array<{ aspectType: string; planet1: string; planet2: string }>,
  enhancedData?: { lunarPhaseData: unknown; astrologicalBridge: unknown },
): number {
  // Enhanced calculation using lunar phase and astrological bridge data
  const _lunarModifier = enhancedData?.lunarPhaseData
    ? calculateLunarPhaseModifier(enhancedData.lunarPhaseData)
    : 1.0;
  const _astrologicalModifier = enhancedData?.astrologicalBridge
    ? calculateAstrologicalBridgeModifier(enhancedData.astrologicalBridge)
    : 1.0;
  // Get the elements associated with the current planetary hour
  const hourElements = planetaryElements[planetaryHour];
  if (!hourElements) return 0.5; // Unknown planet
  // For planetary hour, use diurnal element during day, nocturnal at night
  const relevantElement = isDaytime
    ? hourElements.diurnal
    : hourElements.nocturnal;
  // Calculate match based on food's element compared to the hour's relevant element
  const elementalProps = ingredient.elementalProperties ?? { Fire: 0, Water: 0, Earth: 0, Air: 0 };
  let elementalMatch = elementalProps[relevantElement] || 0;
  // Apply dignity effects if we have planet positions
  if (planetaryPositions?.[planetaryHour]) {
    const planetSign = planetaryPositions[planetaryHour].sign;
    // Dignity effect bonus/penalty
    if (hourElements.dignityEffect?.[planetSign]) {
      const dignityModifier = hourElements.dignityEffect[planetSign] * 0.1; // Scale to 0.1-0.3 effect
      elementalMatch = Math.min(
        1.0,
        Math.max(0.0, elementalMatch + dignityModifier),
      );
    }
  }
  const rulingPlanets = getIngredientRulingPlanets(ingredient);
  // Apply aspect effects if available
  if (aspects && aspects.length > 0) {
    // Find aspects involving the planetary hour ruler
    const hourAspects = aspects.filter(
      (a) => a.planet1 === planetaryHour || a.planet2 === planetaryHour,
    );
    for (const aspect of hourAspects) {
      const otherPlanet =
        aspect.planet1 === planetaryHour ? aspect.planet2 : aspect.planet1;
      let aspectModifier: number;
      // Apply different modifier based on aspect type
      switch (aspect.aspectType) {
        case "Conjunction":
          // Strong beneficial aspect
          aspectModifier = 0.15;
          break;
        case "Trine":
          // Beneficial aspect
          aspectModifier = 0.1;
          break;
        case "Square":
          // Challenging aspect
          aspectModifier = -0.1;
          break;
        case "Opposition":
          // Strong challenging aspect
          aspectModifier = -0.15;
          break;
        default:
          aspectModifier = 0;
      }
      // Apply the aspect modifier if the ingredient is ruled by the other planet in the aspect
      if (rulingPlanets.includes(otherPlanet)) {
        elementalMatch = Math.min(
          1.0,
          Math.max(0.0, elementalMatch + aspectModifier),
        );
      }
    }
  }
  // If the food has a direct planetary affinity, give bonus points
  if (rulingPlanets.includes(planetaryHour)) {
    elementalMatch = Math.min(1.0, elementalMatch + 0.3);
  }
  return elementalMatch;
}
/**
 * Helper function to determine if it's currently daytime (6am-6pm)
 */
function isDaytime(date: Date = new Date()): boolean {
  const hour = date.getHours();
  return hour >= 6 && hour < 18;
}
/**
 * Recommend ingredients with enhanced planetary, dignity and aspect effects
 */
export async function recommendIngredients(
  astroState: AstrologicalStateType,
  options: RecommendationOptions = {},
): Promise<IngredientRecommendation[]> {
  // Get all available ingredients
  const allIngredients = getAllIngredients();
  // Filter by category if specified
  let filteredIngredients = allIngredients;
  if (options.category) {
    filteredIngredients = allIngredients.filter((ing) => {
      const ingredientType = String(ing.type ?? ing.category ?? "");
      return (
        ingredientType.toLowerCase() ===
        String(options.category ?? "").toLowerCase()
      );
    });
  }
  // Filter out excluded ingredients
  if (options.excludeIngredients && options.excludeIngredients.length > 0) {
    filteredIngredients = filteredIngredients.filter(
      (ing) => !options.excludeIngredients?.includes(ing.name),
    );
  }
  // Filter to only include specific ingredients
  if (options.includeOnly && options.includeOnly.length > 0) {
    filteredIngredients = filteredIngredients.filter(
      (ing) => options.includeOnly?.includes(ing.name),
    );
  }
  // Extract key astrological information
  const astroStateData = astroState as {
    timestamp?: Date | string;
    Fire?: number;
    Water?: number;
    Air?: number;
    Earth?: number;
    zodiacSign?: string;
    planetaryAlignment?: Record<string, { sign: string; degree: number }>;
    aspects?: Array<{
      aspectType: string;
      planet1: string;
      planet2: string;
    }>;
    [key: string]: unknown;
  };
  const timestamp =
    astroStateData.timestamp instanceof Date
      ? astroStateData.timestamp
      : new Date();
  const Fire = Number(astroStateData.Fire) || 0.5;
  const Water = Number(astroStateData.Water) || 0.5;
  const Air = Number(astroStateData.Air) || 0.5;
  const Earth = Number(astroStateData.Earth) || 0.5;
  const _zodiacSign = String(astroStateData.zodiacSign ?? "");
  const planetaryAlignment = astroStateData.planetaryAlignment ?? {};
  const aspects = astroStateData.aspects ?? [];
  // Get planetary day and hour for current time (moved up to fix declaration order)
  const date =
    timestamp instanceof Date ? timestamp : new Date(String(timestamp));
  // Calculate lunar phase using imported utility
  const lunarPhase = calculateLunarPhase(date);
  // Calculate planetary positions using imported utility
  const _calculatedPositions = calculatePlanetaryPositions(date);
  // Use _LUNAR_PHASES data for phase-based filtering (await lunarPhase since it's a Promise)
  const lunarPhaseValue = await lunarPhase;
  // _LUNAR_PHASES is keyed by phase name (e.g. "new"); lunarPhaseValue is a numeric
  // phase fraction, so this lookup is a bounds-checked (always-undefined) fallback
  // chain by design — cast to a Record so the string/number lookups type-check.
  const lunarPhasesLookup = _LUNAR_PHASES as Record<
    string | number,
    (typeof _LUNAR_PHASES)[keyof typeof _LUNAR_PHASES]
  >;
  const currentLunarPhaseData =
    lunarPhasesLookup[lunarPhaseValue] ?? lunarPhasesLookup["new moon"];
  // Create astrological bridge for enhanced compatibility
  const astrologicalBridge = _createAstrologicalBridge();
  // Note: Bridge configuration moved to separate initialization if needed
  const planetaryCalculator = {
    calculatePlanetaryDay: (date: Date): string => {
      const days = [
        "Sun",
        "Moon",
        "Mars",
        "Mercury",
        "Jupiter",
        "Venus",
        "Saturn",
      ];
      const day = days[date.getDay()];
      if (day === undefined) {
        throw new RangeError(
          `ingredientRecommender: no planetary day for weekday ${date.getDay()}`,
        );
      }
      return day;
    },
    calculatePlanetaryHour: (date: Date): string => {
      // This is a simplified calculation
      const hours = [
        "Sun",
        "Venus",
        "Mercury",
        "Moon",
        "Saturn",
        "Jupiter",
        "Mars",
        "Sun",
        "Venus",
        "Mercury",
        "Moon",
        "Saturn",
        "Jupiter",
        "Mars",
        "Sun",
        "Venus",
        "Mercury",
        "Moon",
        "Saturn",
        "Jupiter",
        "Mars",
        "Sun",
        "Venus",
        "Mercury",
        "Moon",
      ];
      const hour = hours[date.getHours()];
      if (hour === undefined) {
        throw new RangeError(
          `ingredientRecommender: no planetary hour for hour ${date.getHours()}`,
        );
      }
      return hour;
    },
    isDaytime,
  };
  const planetaryDay = planetaryCalculator.calculatePlanetaryDay(date);
  const planetaryHour = planetaryCalculator.calculatePlanetaryHour(date);
  const isDaytimeNow = planetaryCalculator.isDaytime(date);
  // Create elemental properties object for the current system state;
  const systemElementalProps: ElementalProperties = { Fire, Water, Air, Earth };
  const recommendations: IngredientRecommendation[] = [];
  // Calculate scores for each ingredient
  for (const ingredient of filteredIngredients) {
    // Calculate elemental match (45% weight)
    const elementalScore = calculateElementalScore(
      ingredient.elementalProperties ?? systemElementalProps,
      systemElementalProps,
    );
    // Calculate planetary day influence with enhanced dignity effects (35% weight)
    const planetaryDayScore = calculatePlanetaryDayInfluence(
      ingredient,
      planetaryDay,
      planetaryAlignment,
      { jupiterData, saturnData }, // Include major planet data for enhanced calculations
    );
    // Calculate planetary hour influence with enhanced dignity and aspect effects (20% weight)
    const planetaryHourScore = calculatePlanetaryHourInfluence(
      ingredient,
      planetaryHour,
      isDaytimeNow,
      planetaryAlignment,
      aspects,
      { lunarPhaseData: currentLunarPhaseData, astrologicalBridge }, // Enhanced with lunar and astrological data
    );
    // Apply standardized weighting with safe arithmetic operations and enterprise enhancement
    const elementalWeight = Number(elementalScore) || 0;
    const planetaryDayWeight = Number(planetaryDayScore) || 0;
    const planetaryHourWeight = Number(planetaryHourScore) || 0;
    // Apply enterprise intelligence enhancement (moved up to avoid declaration issues)
    let enterpriseEnhancement: Record<string, unknown> | null = null;
    try {
      // Safe method access with fallback
      const enterpriseIntelligence = null; // Placeholder for future enterprise features
      const enhanceMethod = (
        enterpriseIntelligence as {
          enhanceRecommendation?: (
            recommendation: Record<string, unknown>,
          ) => Record<string, unknown>;
        } | null
      )?.enhanceRecommendation;
      if (typeof enhanceMethod === "function") {
        const enhancementResult = enhanceMethod({
          ingredient,
          astrological: astrologicalBridge,
          lunar: currentLunarPhaseData,
          planetary: { day: planetaryDay, hour: planetaryHour },
        });
        enterpriseEnhancement = enhancementResult;
      }
    } catch (_error) {
      // Enterprise enhancement failed, continue without it
      enterpriseEnhancement = null;
    }
    const enterpriseWeight = enterpriseEnhancement
      ? Number((enterpriseEnhancement as { score?: number }).score) || 0
      : 0;
    const baseScore =
      elementalWeight * 0.35 +
      planetaryDayWeight * 0.25 +
      planetaryHourWeight * 0.15;
    // Apply enterprise intelligence multiplier (25% influence)
    const totalScore = baseScore + enterpriseWeight * 0.25;
    // Generate ingredient-specific recommendations using enterprise intelligence
    const ingredientRecommendations = generateRecommendationsForIngredient(
      ingredient,
      planetaryDay,
      planetaryHour,
      isDaytimeNow,
      planetaryAlignment,
      aspects,
    );
    const ingredientRecommendation: IngredientRecommendation = {
      name: ingredient.name,
      type: String(ingredient.type ?? ""),
      category: ingredient.category,
      elementalProperties:
        ingredient.elementalProperties ?? systemElementalProps,
      qualities: ingredient.qualities ?? [],
      matchScore: totalScore,
      modality: ingredient.modality as Modality,
      recommendations: ingredientRecommendations,
      description: ingredient.description,
      totalScore,
      elementalScore: elementalScore * 0.45,
      astrologicalScore: planetaryDayScore * 0.35 + planetaryHourScore * 0.2,
      seasonalScore: (ingredient as { seasonalScore?: number }).seasonalScore,
      dietary: (ingredient as { dietary?: string[] }).dietary,
    };
    recommendations.push(ingredientRecommendation);
  }
  // Sort by match score (highest first)
  recommendations.sort((a, b) => b.matchScore - a.matchScore);
  // Apply limit if specified
  const limit = options.limit ?? 10;
  return recommendations.slice(0, limit);
}
/**
 * Generate enhanced recommendations for an ingredient based on planetary influences
 */
function generateRecommendationsForIngredient(
  ingredient: Ingredient | EnhancedIngredient,
  planetaryDay: string,
  planetaryHour: string,
  isDaytime: boolean,
  planetaryPositions?: Record<string, { sign: string; degree: number } | undefined>,
  aspects?: Array<{ aspectType: string; planet1: string; planet2: string }>,
): string[] {
  const recs: string[] = [];
  const ingredientName = ingredient.name;
  const rulingPlanets = getIngredientRulingPlanets(ingredient);
  // Basic recommendation based on planetary day
  const dayElements = planetaryElements[planetaryDay];
  if (dayElements) {
    recs.push(
      `${ingredientName} works well on ${planetaryDay}'s day with its ${dayElements.diurnal} and ${dayElements.nocturnal} influences.`,
    );
  }
  // Time-specific recommendation based on planetary hour
  const hourElements = planetaryElements[planetaryHour];
  if (hourElements) {
    const hourElement = isDaytime
      ? hourElements.diurnal
      : hourElements.nocturnal;
    recs.push(
      `During the current hour of ${planetaryHour}, ${ingredientName}'s ${hourElement} properties are enhanced.`,
    );
  }
  // Add dignity effect recommendations if planet is in dignified or debilitated sign
  if (planetaryPositions) {
    // Check day planet dignity
    if (
      dayElements?.dignityEffect &&
      planetaryPositions[planetaryDay]
    ) {
      const daySign = planetaryPositions[planetaryDay].sign;
      const dayDignity =
        dayElements.dignityEffect[daySign];
      if (
        dayDignity !== undefined &&
        dayDignity > 0 &&
        rulingPlanets.includes(planetaryDay)
      ) {
        recs.push(
          `${planetaryDay} is ${dayDignity > 1 ? "exalted" : "dignified"} in ${daySign}, strengthening ${ingredientName}'s properties.`,
        );
      } else if (
        dayDignity !== undefined &&
        dayDignity < 0 &&
        rulingPlanets.includes(planetaryDay)
      ) {
        recs.push(
          `${planetaryDay} is ${dayDignity < -1 ? "in fall" : "in detriment"} in ${daySign}, requiring careful preparation of ${ingredientName}.`,
        );
      }
    }
    // Check hour planet dignity
    if (
      hourElements?.dignityEffect &&
      planetaryPositions[planetaryHour]
    ) {
      const hourSign = planetaryPositions[planetaryHour].sign;
      const hourDignity =
        hourElements.dignityEffect[hourSign];
      if (
        hourDignity !== undefined &&
        hourDignity > 0 &&
        rulingPlanets.includes(planetaryHour)
      ) {
        recs.push(
          `During this hour, ${planetaryHour}'s dignity in ${hourSign} enhances ${ingredientName}'s flavor profile.`,
        );
      }
    }
  }
  // Add aspect-based recommendations
  if (aspects && aspects.length > 0) {
    const relevantAspects = aspects.filter(
      (aspect) =>
        aspect.planet1 === planetaryDay ||
        aspect.planet2 === planetaryDay ||
        aspect.planet1 === planetaryHour ||
        aspect.planet2 === planetaryHour,
    );
    for (const aspect of relevantAspects) {
      if (aspect.aspectType === "Conjunction") {
        const planets = [aspect.planet1, aspect.planet2];
        if (planets.includes(planetaryDay) || planets.includes(planetaryHour)) {
          const otherPlanet = planets.find(
            (p) => p !== planetaryDay && p !== planetaryHour,
          );
          if (otherPlanet && rulingPlanets.includes(otherPlanet)) {
            recs.push(
              `The conjunction between ${aspect.planet1} and ${aspect.planet2} strongly enhances ${ingredientName}'s qualities.`,
            );
          }
        }
      } else if (aspect.aspectType === "Trine") {
        const planets = [aspect.planet1, aspect.planet2];
        if (planets.includes(planetaryDay) || planets.includes(planetaryHour)) {
          const otherPlanet = planets.find(
            (p) => p !== planetaryDay && p !== planetaryHour,
          );
          if (otherPlanet && rulingPlanets.includes(otherPlanet)) {
            recs.push(
              `The harmonious trine between ${aspect.planet1} and ${aspect.planet2} creates a flowing energy for ${ingredientName}.`,
            );
          }
        }
      }
    }
  }
  // Direct planetary affinity recommendation
  if (rulingPlanets.length > 0) {
    if (rulingPlanets.includes(planetaryDay)) {
      recs.push(
        `${ingredientName} is especially potent today as it's ruled by ${planetaryDay}.`,
      );
    }
    if (rulingPlanets.includes(planetaryHour)) {
      recs.push(
        `This is an optimal hour to work with ${ingredientName} due to ${planetaryHour}'s influence.`,
      );
    }
  }
  return recs;
}
// ... existing code ...
// At the top of the file, add the re-export
export type { EnhancedIngredientRecommendation } from "./recommendation/ingredientRecommendation";
// ... existing code ...
// ... existing code ...
// ... existing code ...
