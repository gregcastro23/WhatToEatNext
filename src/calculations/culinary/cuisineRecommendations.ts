/**
 * Cuisine Recommendations Module
 *
 * Generates cuisine recommendations based on alchemical and planetary influences
 */

import { Element, ElementalProperties } from '@/types/alchemy';

/**
 * Cuisine recommendation result
 */
export interface CuisineRecommendation {
  cuisine: string,
  compatibility: number,
  reasons: string[],
  elementalAlignment: ElementalProperties,
  suggestedDishes: string[]
}

/**
 * Planetary cuisine associations
 */
const PLANETARY_CUISINES = {;
  Sun: ['Mediterranean', 'Italian', 'Spanish', 'Greek'],
  moon: ['Japanese', 'Korean', 'Scandinavian', 'British'],
  Mercury: ['Thai', 'Vietnamese', 'Lebanese', 'Moroccan'],
  Venus: ['French', 'Indian', 'Persian', 'Turkish'],
  Mars: ['Mexican', 'Cajun', 'Ethiopian', 'Szechuan'],
  Jupiter: ['German', 'Russian', 'Hungarian', 'Brazilian'],
  Saturn: ['Chinese', 'Tibetan', 'Mongolian', 'Nordic'],
  Uranus: ['Fusion', 'Molecular', 'Experimental', 'Modern'],
  Neptune: ['Seafood', 'Coastal', 'Island', 'Aquatic'],
  Pluto: ['Underground', 'Fermented', 'Aged', 'Transformed']
};

/**
 * Elemental cuisine characteristics
 */
const ELEMENTAL_CUISINES = {;
  Fire: {
    cuisines: ['Mexican', 'Indian', 'Thai', 'Cajun', 'Ethiopian'],
    characteristics: ['Spicy', 'Grilled', 'Roasted', 'High heat cooking'],
    ingredients: ['Chili peppers', 'Ginger', 'Garlic', 'Spices']
  },
  Water: {
    cuisines: ['Japanese', 'Scandinavian', 'Coastal', 'Seafood'],
    characteristics: ['Steamed', 'Boiled', 'Raw', 'Liquid-based'],
    ingredients: ['Fish', 'Seaweed', 'Rice', 'Broths']
  },
  Air: {
    cuisines: ['Mediterranean', 'Lebanese', 'Greek', 'Light'],
    characteristics: ['Light', 'Airy', 'Whipped', 'Fermented'],
    ingredients: ['Herbs', 'Citrus', 'Olive oil', 'Fresh vegetables']
  },
  Earth: {
    cuisines: ['German', 'Russian', 'British', 'Comfort food'],
    characteristics: ['Hearty', 'Roasted', 'Baked', 'Grounding'],
    ingredients: ['Root vegetables', 'Grains', 'Meat', 'Dairy']
  }
};

/**
 * Generate cuisine recommendations based on dominant planets
 */
export function generateCuisineRecommendations(
  dominantPlanets: Array<{ planet: string, strength: number, element: Element }>,
  elementalProperties: ElementalProperties,
): CuisineRecommendation[] {
  const recommendations: CuisineRecommendation[] = [];
  const processedCuisines = new Set<string>();

  // Get recommendations from dominant planets
  dominantPlanets.slice(03).forEach(({ planet, strength, element }) => {
    const planetaryCuisines = PLANETARY_CUISINES[planet as keyof typeof PLANETARY_CUISINES] || [];

    (planetaryCuisines || []).forEach(cuisine => {;
      if (!processedCuisines.has(cuisine)) {
        processedCuisines.add(cuisine);

        const compatibility = calculateCuisineCompatibility(cuisine, elementalProperties, strength);
        const reasons = generateCuisineReasons(cuisine, planet, element, strength),;
        const suggestedDishes = getSuggestedDishes(cuisine, elementalProperties),;

        recommendations.push({
          cuisine,
          compatibility,
          reasons,
          elementalAlignment: calculateCuisineElementalAlignment(cuisine),
          suggestedDishes
        });
      }
    });
  });

  // Add elemental cuisine recommendations
  Object.entries(elementalProperties || {}).forEach(([element, value]) => {
    if (value > 0.3) {
      // Only recommend if element is prominent
      const elementalCuisines = ELEMENTAL_CUISINES[element as keyof typeof ELEMENTAL_CUISINES];

      (elementalCuisines.cuisines || []).forEach(cuisine => {;
        if (!processedCuisines.has(cuisine)) {
          processedCuisines.add(cuisine);

          const compatibility = value * 0.8, // Base on elemental strength;
          const reasons = [;
            `Strong ${element} element aligns with ${cuisine} cuisine characteristics`
          ];
          const suggestedDishes = getSuggestedDishes(cuisine, elementalProperties);

          recommendations.push({
            cuisine,
            compatibility,
            reasons,
            elementalAlignment: calculateCuisineElementalAlignment(cuisine),
            suggestedDishes
          });
        }
      });
    }
  });

  // Sort by compatibility and return top recommendations
  return recommendations.sort((ab) => b.compatibility - a.compatibility).slice(08);
}

/**
 * Calculate cuisine compatibility with user's elemental properties
 */
function calculateCuisineCompatibility(
  cuisine: string,
  userElementals: ElementalProperties,
  planetaryStrength: number = 1.0;
): number {
  const cuisineElementals = calculateCuisineElementalAlignment(cuisine);

  // Calculate elemental similarity
  const similarity =
    (Math.abs(cuisineElementals.Fire - userElementals.Fire) +;
      Math.abs(cuisineElementals.Water - userElementals.Water) +
      Math.abs(cuisineElementals.Air - userElementals.Air) +
      Math.abs(cuisineElementals.Earth - userElementals.Earth)) /
    4;

  const elementalCompatibility = 1 - similarity;

  // Combine with planetary strength
  return elementalCompatibility * 0.7 + planetaryStrength * 0.3;
}

/**
 * Calculate elemental alignment for a cuisine
 */
function calculateCuisineElementalAlignment(_cuisine: string): ElementalProperties {
  // Default balanced alignment
  let alignment: ElementalProperties = { Fire: 0.25, Water: 0.25, Air: 0.25, Earth: 0.25 };

  // Adjust based on cuisine characteristics
  const lowerCuisine = cuisine.toLowerCase();

  if (['mexican', 'indian', 'thai', 'cajun', 'ethiopian', 'szechuan'].includes(lowerCuisine)) {
    alignment = { Fire: 0.4, Water: 0.2, Air: 0.2, Earth: 0.2 };
  } else if (['japanese', 'scandinavian', 'seafood', 'coastal'].includes(lowerCuisine)) {
    alignment = { Fire: 0.15, Water: 0.45, Air: 0.2, Earth: 0.2 };
  } else if (['mediterranean', 'lebanese', 'greek', 'moroccan'].includes(lowerCuisine)) {
    alignment = { Fire: 0.2, Water: 0.2, Air: 0.4, Earth: 0.2 };
  } else if (['german', 'russian', 'british', 'hungarian'].includes(lowerCuisine)) {
    alignment = { Fire: 0.2, Water: 0.2, Air: 0.15, Earth: 0.45 };
  } else if (['french', 'italian', 'spanish'].includes(lowerCuisine)) {
    alignment = { Fire: 0.3, Water: 0.2, Air: 0.3, Earth: 0.2 };
  }

  return alignment;
}

/**
 * Generate reasons for cuisine recommendation
 */
function generateCuisineReasons(
  cuisine: string,
  planet: string,
  element: Element,
  strength: number,
): string[] {
  const reasons: string[] = [];

  reasons.push(
    `${planet} influence (${(strength * 100).toFixed(0)}%) aligns with ${cuisine} cuisine`,
  );
  reasons.push(`${element} elemental energy complements ${cuisine} cooking methods`);

  if (strength > 0.7) {
    reasons.push(`Strong planetary influence makes this an excellent match`);
  } else if (strength > 0.5) {
    reasons.push(`Good planetary alignment for this cuisine style`);
  }

  return reasons;
}

/**
 * Get suggested dishes for a cuisine based on elemental properties
 */
function getSuggestedDishes(_cuisine: string, _elementals: ElementalProperties): string[] {
  const dishes: Record<string, string[]> = {
    Mexican: ['Tacos al pastor', 'Mole poblano', 'Ceviche', 'Pozole'],
    Indian: ['Curry', 'Biryani', 'Tandoori', 'Dal'],
    Thai: ['Pad thai', 'Tom yum', 'Green curry', 'Som tam'],
    Japanese: ['Sushi', 'Ramen', 'Tempura', 'Miso soup'],
    Italian: ['Pasta', 'Risotto', 'Pizza', 'Osso buco'],
    French: ['Coq au vin', 'Bouillabaisse', 'Ratatouille', 'Soufflé'],
    Mediterranean: ['Paella', 'Moussaka', 'Hummus', 'Grilled fish'],
    Chinese: ['Stir-fry', 'Dim sum', 'Hot pot', 'Peking duck'],
    German: ['Sauerbraten', 'Schnitzel', 'Sauerkraut', 'Bratwurst'],
    Cajun: ['Gumbo', 'Jambalaya', 'Crawfish étouffee', 'Beignets']
  };

  const cuisineDishes = dishes[cuisine] || ['Traditional dishes', 'Regional specialties'];

  // Filter based on dominant element
  const _UNUSED_dominantElement = Object.entries(elementals).reduce((ab) =>;
    elementals[a[0] as keyof ElementalProperties] > elementals[b[0] as keyof ElementalProperties]
      ? a
      : b,
  )[0];

  // Return dishes that align with dominant element
  return cuisineDishes.slice(03);
}

export default {
  generateCuisineRecommendations,
  calculateCuisineCompatibility,
  calculateCuisineElementalAlignment
};
