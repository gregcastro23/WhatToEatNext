
import type { NatalChart, Planet } from '@/types/natalChart';
import type { AstrologicalState } from '@/utils/menuPlanner/recommendationBridge';
import type { MonicaOptimizedRecipe } from '@/data/unified/recipeBuilding';

// Simple representation of planetary aspects
type Aspect = 'conjunction' | 'square' | 'trine' | 'opposition' | 'sextile';

/**
 * Calculates the element of a zodiac sign.
 * @param sign - The zodiac sign.
 * @returns The element of the sign (Fire, Earth, Air, Water).
 */
function getElementForSign(sign: string): 'Fire' | 'Earth' | 'Air' | 'Water' {
  const signLower = sign.toLowerCase();
  if (['aries', 'leo', 'sagittarius'].includes(signLower)) return 'Fire';
  if (['taurus', 'virgo', 'capricorn'].includes(signLower)) return 'Earth';
  if (['gemini', 'libra', 'aquarius'].includes(signLower)) return 'Air';
  if (['cancer', 'scorpio', 'pisces'].includes(signLower)) return 'Water';
  // Default fallback
  return 'Fire';
}

/**
 * A simplified function to determine the aspect between two planets based on their signs.
 * This is a major simplification and in a real-world scenario, you'd use precise degrees.
 * @param planet1Sign - The sign of the first planet.
 * @param planet2Sign - The sign of the second planet.
 * @returns The aspect between the two planets.
 */
function getAspect(planet1Sign: string, planet2Sign: string): Aspect | null {
    const signs = ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"];
    const index1 = signs.indexOf(planet1Sign.toLowerCase());
    const index2 = signs.indexOf(planet2Sign.toLowerCase());

    if (index1 === -1 || index2 === -1) return null;

    const diff = Math.abs(index1 - index2) % 12;

    switch (diff) {
        case 0: return 'conjunction';
        case 6: return 'opposition';
        case 3:
        case 9: return 'square';
        case 4:
        case 8: return 'trine';
        case 2:
        case 10: return 'sextile';
        default: return null;
    }
}


/**
 * Calculates a score modifier for a recipe based on astrological transits.
 * @param natalChart - The user's natal chart.
 * @param currentSky - The current astrological state.
 * @param recipe - The recipe to be scored.
 * @returns A score modifier (e.g., 1.0 for no change, > 1.0 for a boost).
 */
export function calculateTransitScoreModifier(
  natalChart: NatalChart,
  currentSky: AstrologicalState,
  recipe: MonicaOptimizedRecipe
): number {
  let modifier = 1.0;

  // 1. Moon Transit: Boost comfort foods if current Moon is in the same element as natal Moon.
  const natalMoon = natalChart.planets.find(p => p.name.toLowerCase() === 'moon');
  
  // We need to find the current Moon's sign from the currentSky object.
  // Let's assume currentSky.activePlanets contains information like "Moon in Gemini"
  const currentMoonInfo = currentSky.activePlanets.find(p => p.toLowerCase().startsWith('moon in '));

  if (natalMoon && currentMoonInfo) {
    const natalMoonElement = getElementForSign(natalMoon.sign);
    const currentMoonSign = currentMoonInfo.split(' in ')[1];
    const currentMoonElement = getElementForSign(currentMoonSign);

    if (natalMoonElement === currentMoonElement) {
      // Check if the recipe is a "comfort food". This is a simplification.
      // We'll use keywords in the description or category.
      if (recipe.description && recipe.description.toLowerCase().includes('comfort') || (recipe.mealType && recipe.mealType.includes('comfort'))) {
        modifier += 0.2; // 20% boost for comfort foods
      }
    }
  }

  // 2. Mars Transit: Boost high-energy/protein foods if current Mars squares natal Mars.
  const natalMars = natalChart.planets.find(p => p.name.toLowerCase() === 'mars');
  const currentMarsInfo = currentSky.activePlanets.find(p => p.toLowerCase().startsWith('mars in '));

  if (natalMars && currentMarsInfo) {
    const natalMarsSign = natalMars.sign;
    const currentMarsSign = currentMarsInfo.split(' in ')[1];
    
    const aspect = getAspect(natalMarsSign, currentMarsSign);

    if (aspect === 'square') {
      // Check for high protein/energy.
      const nutritionalProfile = recipe.nutritionalProfile as any;
      if (nutritionalProfile && nutritionalProfile.protein && nutritionalProfile.protein > 25) { // e.g., > 25g protein
        modifier += 0.15; // 15% boost
      }
      if (recipe.description && (recipe.description.toLowerCase().includes('energy') || recipe.description.toLowerCase().includes('hearty'))) {
        modifier += 0.1;
      }
    }
  }

  return modifier;
}
