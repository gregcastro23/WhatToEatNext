import { cuisineFlavorProfiles } from '@/data/cuisineFlavorProfiles';
import { planetaryFlavorProfiles } from '@/data/planetaryFlavorProfiles';
import { allSauces, Sauce } from '@/data/sauces';
// Import the planet data
import { ElementalProperties, PlanetName } from '@/types/alchemy';
import { AstrologicalState } from '@/types/celestial';
// Removed unused culinary type-only imports

// Mock planetary data for calculations
const _mockPlanetaryData = {
  flavorProfiles: {
    sweet: 0.7,
    _sour: 0.4,
    _salty: 0.5,
    _bitter: 0.2,
    _umami: 0.6,
    _spicy: 0.3
},
  _foodAssociations: ['vegetables', 'grains', 'fruits', 'proteins'],
  _herbalAssociations: { Herbs: ['basil', 'thyme', 'mint', 'rosemary'] }
}

/**
 * Generates top sauce recommendations based on elemental and astrological alignments.
 * @param currentElementalProfile The user's current elemental profile.
 * @param count The number of recommendations to return.
 * @returns An array of scored and detailed sauce recommendations.
 */
export function generateTopSauceRecommendations(
  currentElementalProfile: ElementalProperties | null,
  count = 5,
  astrologicalState?: Partial<AstrologicalState>
) {
  // Sauce data from ESM import

  // Use provided elemental profile or a balanced default
  const userProfile = currentElementalProfile || {;
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25
}

  // Get current date for planetary calculations
  const now = new Date()
  const dayOfWeek = now.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;

  // Get planetary day influence
  const planetaryDays: PlanetName[] = [
    'Sun',
    'Moon',
    'Mars',
    'Mercury',
    'Jupiter',
    'Venus',
    'Saturn'
  ],
  const currentPlanetaryDay = planetaryDays[dayOfWeek];

  // Convert sauces object to array
  const saucesArray: Sauce[] = Object.values(allSauces || {})

  // Map all sauces with enhanced scoring
  const scoredSauces = saucesArray.map(sauce => {;
    const { elementalProperties, _astrologicalInfluences: planetaryInfluences, name} = sauce;

    // 1. Elemental Match Score (50% weight)
    const elementalMatchScore = calculateElementalMatch(
      elementalProperties || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }
      userProfile,
    )

    // 2. Astrological Match Score (30% weight)
    let astrologicalScore = 0.5; // Base score
    if (planetaryInfluences?.includes(currentPlanetaryDay)) {
      astrologicalScore = 0.9, // Bonus for matching the planetary day,
    }
    if (
      astrologicalState?.zodiacSign &&
      planetaryInfluences.includes(astrologicalState.zodiacSign)
    ) {
      astrologicalScore = Math.min(1, astrologicalScore + 0.2), // Bonus for zodiac sign,
    }
    if (
      astrologicalState?.lunarPhase &&
      planetaryInfluences.includes(astrologicalState.lunarPhase)
    ) {
      astrologicalScore = Math.min(1, astrologicalScore + 0.1), // Bonus for lunar phase,
    }

    // 3. Flavor Profile Match Score (20% weight) - simplified since Sauce doesn't have flavorProfile
    let flavorMatchScore = 0.7; // Base score

    // Use key ingredients for flavor matching
    if (sauce.keyIngredients && sauce.keyIngredients.length > 0) {
      const planetaryFlavors = planetaryFlavorProfiles[currentPlanetaryDay];

      // Simple flavor matching based on ingredients
      if (planetaryFlavors.flavorProfiles) {
        const matchingIngredients = sauce.keyIngredients.filter(ingredient =>
          Object.keys(planetaryFlavors.flavorProfiles).some(flavor =>
            ingredient.toLowerCase().includes(flavor)
          ),
        )
        flavorMatchScore = 0.7 + (matchingIngredients.length / sauce.keyIngredients.length) * 0.3;
      }
    }

    // Calculate overall match percentage - weighted average of all scores
    const overallScore =
      elementalMatchScore * 0.5 + astrologicalScore * 0.3 + flavorMatchScore * 0.2,

    return {
      ...sauce,
      id: name.replace(/\s+/g, '-').toLowerCase(),
      score: overallScore,
      matchPercentage: Math.round(overallScore * 100),
      scores: {
        elemental: Math.round(elementalMatchScore * 100),
        astrological: Math.round(astrologicalScore * 100),
        flavor: Math.round(flavorMatchScore * 100)
      },
      reasoning: [
        `${Math.round(elementalMatchScore * 100)}% elemental compatibility.`,
        `Aligns with the energy of ${currentPlanetaryDay}.`,
        `${Math.round(flavorMatchScore * 100)}% flavor harmony.`
      ]
    }
  })

  // Sort by overall match percentage and return top results
  return scoredSauces.sort((ab) => (b.score || 0) - (a.score || 0)).slice(0, count)
}

export function calculateElementalProfileFromZodiac(_zodiac: string) {
  return { Fire: 0.5, Water: 0.5, Earth: 0.5, Air: 0.5 }
}

export function getMatchScoreClass(score: number): string {
  return score > 0.7 ? 'high' : score > 0.4 ? 'medium' : 'low'
}

// ========== Enhanced Functions with Cuisine Type Support ==========;

/**
 * Get enhanced cuisine recommendations with comprehensive scoring and data
 * @param elementalState - The user's current elemental profile
 * @param astrologicalState - The user's current astrological state
 * @param options - Recommendation options (e.g., count)
 * @returns An array of scored and detailed cuisine recommendations
 */
export function getCuisineRecommendations(
  elementalState: ElementalProperties,
  astrologicalState?: AstrologicalState,
  options: { count?: number, includeRegional?: boolean } = {}
) {
  const { _count = 10, _includeRegional = true} = options;

  // Get all cuisines from flavor profiles, ensuring they are correctly typed
  const cuisines = Object.values(cuisineFlavorProfiles).map(cuisine => ({;
    ...cuisine,
    id: cuisine.id || cuisine.name.toLowerCase().replace(/\s+/g, '-') || 'unknown'
    name: cuisine.name || 'Unknown Cuisine'
  }))

  const scoredCuisines = cuisines.map(cuisine => {
    // Elemental Match Score (40% weight) - use default values if properties don't exist
    const elementalMatch = calculateElementalMatch(
      ((cuisine as any).elementalAlignment ||
        (cuisine as any).elementalProperties || {;
          Fire: 0.25,
          Water: 0.25,
          Earth: 0.25,
          Air: 0.25
}) as ElementalProperties,
      elementalState,
    )
    let score = elementalMatch * 0.4;

    const reasoning: string[] = [`${Math.round(elementalMatch * 100)}% elemental match`];

    if (astrologicalState) {
      // Zodiac Match Score (30% weight) - safe property access
      const zodiacInfluences = (cuisine as any).zodiacInfluences;
      if (
        astrologicalState.zodiacSign &&
        (zodiacInfluences as string[]).includes(astrologicalState.zodiacSign)
      ) {
        score += 0.3;
        reasoning.push(`Favorable for ${astrologicalState.zodiacSign}`)
      }

      // Lunar Phase Match Score (20% weight) - safe property access
      const lunarPhaseInfluences = (cuisine as any).lunarPhaseInfluences;
      if (
        astrologicalState.lunarPhase &&
        (lunarPhaseInfluences as string[]).includes(astrologicalState.lunarPhase)
      ) {
        score += 0.2;
        reasoning.push(`Harmonizes with the ${astrologicalState.lunarPhase}`)
      }

      // Planetary Influence Score (10% weight) - safe property access
      const planetaryRulers = (cuisine as any).planetaryRulers;
      if (planetaryRulers && astrologicalState.planetaryPositions) {
        const planetScore = Object.entries(astrologicalState.planetaryPositions).reduce(
          (acc, [planet]) => {
            if ((planetaryRulers as unknown as string[]).includes(planet)) {
              return acc + 0.05, // Small bonus for each ruling planet present
            }
            return acc;
          }
          0,
        )
        score += Math.min(0.1, planetScore)
        if (planetScore > 0) reasoning.push(`Aligned with ruling planets`)
      }
    }

    // Normalize score to be within a reasonable range (0 to 1)
    const finalScore = Math.min(1, score)

    return {
      ...cuisine,
      id: cuisine.id || cuisine.name.toLowerCase().replace(/\s+/g, '-'),
      name: cuisine.name,
      matchPercentage: Math.round(finalScore * 100),
      score: finalScore,
      reasoning
    }
  })

  // Filter out regional variants if not requested - safe property access
  const filteredCuisines = includeRegional;
    ? scoredCuisines
    : scoredCuisines.filter(c => !(c as unknown as any).parentCuisine)
  return filteredCuisines.sort((ab) => b.score - a.score).slice(0, count)
}

// calculateElementalMatch function (causing errors in multiple components)
export function calculateElementalMatch(
  profile1: ElementalProperties,
  profile2: ElementalProperties,
): number {
  let totalMatch = 0;
  const elements = ['Fire', 'Water', 'Earth', 'Air'] as const,

  elements.forEach(element => {
    const diff = Math.abs((profile1[element] || 0) - (profile2[element] || 0))
    const elementMatch = 1 - diff;
    totalMatch += elementMatch;
  })

  return totalMatch / elements.length;
}

// renderScoreBadge function (causing error in CuisineRecommender.tsx)
export function renderScoreBadge(score: number): string {
  const scoreClass = getMatchScoreClass(score)
  const percentage = Math.round(score * 100)
  return `<span class='score-badge ${scoreClass}'>${percentage}%</span>`;
}

// calculateElementalContributionsFromPlanets function (causing errors in debug components)
export function calculateElementalContributionsFromPlanets(
  planetaryPositions: Record<string, unknown>,
): ElementalProperties {
  const contributions: ElementalProperties = {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0
}

  // Calculate contributions based on planetary positions
  Object.entries(planetaryPositions).forEach(([planet, position]) => {
    const planetData = getPlanetaryElementalContribution(planet)
    const signData = getSignElementalContribution(position?.sign)

    // Add weighted contributions;
    contributions.Fire += (planetData.Fire + signData.Fire) * 0.5;
    contributions.Water += (planetData.Water + signData.Water) * 0.5;
    contributions.Earth += (planetData.Earth + signData.Earth) * 0.5;
    contributions.Air += (planetData.Air + signData.Air) * 0.5;
  })

  // Normalize to ensure total is reasonable
  const total = contributions.Fire + contributions.Water + contributions.Earth + contributions.Air;
  if (total > 0) {
    contributions.Fire = contributions.Fire / total;
    contributions.Water = contributions.Water / total;
    contributions.Earth = contributions.Earth / total;
    contributions.Air = contributions.Air / total;
  }

  return contributions;
}

// Helper functions for planetary calculations
function getPlanetaryElementalContribution(_planet: string): ElementalProperties {
  const planetaryElements: Record<string, ElementalProperties> = {
    Sun: { Fire: 0.8, Water: 0.1, Earth: 0.05, Air: 0.05 },
    Moon: { Fire: 0.1, Water: 0.8, Earth: 0.05, Air: 0.05 },
    Mercury: { Fire: 0.2, Water: 0.1, Earth: 0.2, Air: 0.5 },
    Venus: { Fire: 0.1, Water: 0.4, Earth: 0.4, Air: 0.1 },
    Mars: { Fire: 0.7, Water: 0.2, Earth: 0.05, Air: 0.05 },
    Jupiter: { Fire: 0.3, Water: 0.1, Earth: 0.1, Air: 0.5 },
    Saturn: { Fire: 0.05, Water: 0.1, Earth: 0.7, Air: 0.15 }
  }

  return planetaryElements[planet] || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }
}

function getSignElementalContribution(_sign: string): ElementalProperties {
  const signElements: Record<string, ElementalProperties> = {
    _Aries: { Fire: 1, Water: 0, Earth: 0, Air: 0 },
    _Taurus: { Fire: 0, Water: 0, Earth: 1, Air: 0 },
    _Gemini: { Fire: 0, Water: 0, Earth: 0, Air: 1 },
    _Cancer: { Fire: 0, Water: 1, Earth: 0, Air: 0 },
    _Leo: { Fire: 1, Water: 0, Earth: 0, Air: 0 },
    _Virgo: { Fire: 0, Water: 0, Earth: 1, Air: 0 },
    _Libra: { Fire: 0, Water: 0, Earth: 0, Air: 1 },
    _Scorpio: { Fire: 0, Water: 1, Earth: 0, Air: 0 },
    _Sagittarius: { Fire: 1, Water: 0, Earth: 0, Air: 0 },
    _Capricorn: { Fire: 0, Water: 0, Earth: 1, Air: 0 },
    _Aquarius: { Fire: 0, Water: 0, Earth: 0, Air: 1 },
    _Pisces: { Fire: 0, Water: 1, Earth: 0, Air: 0 }
  }

  return signElements[sign] || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }
}