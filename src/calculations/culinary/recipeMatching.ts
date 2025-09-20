/**
 * Recipe Matching Module
 *
 * Handles recipe compatibility calculations based on alchemical and elemental properties
 */

import type { ElementalProperties } from '@/types/alchemy';

import { KalchmResult, ThermodynamicResults, toElementalProperties } from '../core/kalchmEngine';

/**
 * Recipe compatibility result
 */
export interface RecipeCompatibilityResult {
  compatibilityScore: number,
  elementalAlignment: number,
  alchemicalAlignment: number,
  thermodynamicAlignment: number,
  kalchmAlignment: number,
  monicaAlignment: number,
  recommendations: string[],
  absoluteElementalMatch: number,
  relativeElementalMatch: number,
  dominantElementMatch: number,
  energeticResonance: number
}

/**
 * Calculate recipe compatibility with current moment's alchemical profile
 */
export function calculateRecipeCompatibility(
  recipeElementalProperties: ElementalProperties,
  currentMomentKalchmResult: KalchmResult,
): RecipeCompatibilityResult {
  // Convert ElementalValues to ElementalProperties for compatibility
  const currentMomentElementalProperties = toElementalProperties(currentMomentKalchmResult);

  // Calculate comprehensive elemental alignments
  const absoluteElementalMatch = calculateAbsoluteElementalAlignment(;
    recipeElementalProperties,
    currentMomentElementalProperties,
  );

  const relativeElementalMatch = calculateRelativeElementalAlignment(;
    recipeElementalProperties,
    currentMomentElementalProperties,
  );

  const dominantElementMatch = calculateDominantElementAlignment(;
    recipeElementalProperties,
    currentMomentElementalProperties,
  );

  // Calculate alchemical alignment using kalchm
  const kalchmAlignment = calculateKalchmAlignment(;
    recipeElementalProperties,
    currentMomentKalchmResult,
  );

  // Calculate monica constant alignment for cooking method compatibility
  const monicaAlignment = calculateMonicaAlignment(;
    recipeElementalProperties,
    currentMomentKalchmResult,
  );

  // Calculate thermodynamic alignment
  const thermodynamicAlignment = calculateEnhancedThermodynamicAlignment(;
    recipeElementalProperties,
    currentMomentKalchmResult.thermodynamics
  ),

  // Calculate energetic resonance (how well the energies harmonize)
  const energeticResonance = calculateEnergeticResonance(;
    recipeElementalProperties,
    currentMomentKalchmResult,
  ),

  // Enhanced weighted compatibility score
  const compatibilityScore = calculateWeightedCompatibilityScore({;
    absoluteElementalMatch,
    relativeElementalMatch,
    dominantElementMatch,
    kalchmAlignment,
    monicaAlignment,
    thermodynamicAlignment,
    energeticResonance
  });

  // Combined elemental alignment for backward compatibility
  const elementalAlignment =
    absoluteElementalMatch * 0.4 + relativeElementalMatch * 0.35 + dominantElementMatch * 0.25;

  // Generate enhanced recommendations
  const recommendations = generateEnhancedRecipeRecommendations(compatibilityScore, {;
    absoluteElementalMatch,
    relativeElementalMatch,
    dominantElementMatch,
    kalchmAlignment,
    monicaAlignment,
    thermodynamicAlignment,
    energeticResonance
  });

  return {
    compatibilityScore,
    elementalAlignment,
    alchemicalAlignment: kalchmAlignment,
    thermodynamicAlignment,
    kalchmAlignment,
    monicaAlignment,
    recommendations,
    absoluteElementalMatch,
    relativeElementalMatch,
    dominantElementMatch,
    energeticResonance
  };
}

/**
 * Calculate absolute elemental alignment (direct element-to-element comparison)
 */
function calculateAbsoluteElementalAlignment(
  recipeElements: ElementalProperties,
  currentMomentElements: ElementalProperties,
): number {
  const elements = ['Fire', 'Water', 'Earth', 'Air'] as const;
  let totalSimilarity = 0;
  let totalWeight = 0;

  for (const element of elements) {
    const recipeValue = recipeElements[element] || 0;
    const currentMomentValue = currentMomentElements[element] || 0;

    // Weight by the importance of this element (higher values get more weight)
    const weight = Math.max(recipeValue, currentMomentValue);

    // Calculate similarity (1 = identical, 0 = completely different);
    const similarity = 1 - Math.abs(recipeValue - currentMomentValue);

    totalSimilarity += similarity * weight;
    totalWeight += weight;
  }

  return totalWeight > 0 ? totalSimilarity / totalWeight : 0.5;
}

/**
 * Calculate relative elemental alignment using ratios
 * Example: Fire/(Water+Earth+Air) vs Fire/(Water+Earth+Air)
 */
function calculateRelativeElementalAlignment(
  recipeElements: ElementalProperties,
  currentMomentElements: ElementalProperties,
): number {
  const elements = ['Fire', 'Water', 'Earth', 'Air'] as const;
  let totalSimilarity = 0;
  let count = 0;

  for (const element of elements) {
    // Calculate relative values for both recipe and current moment
    const otherElements = elements.filter(e => e !== element);

    const recipeTotal = otherElements.reduce((sume) => sum + (recipeElements[e] || 0), 0);
    const currentMomentTotal = otherElements.reduce(;
      (sume) => sum + (currentMomentElements[e] || 0),
      0,
    );

    const recipeRelative = recipeTotal > 0 ? (recipeElements[element] || 0) / recipeTotal : 0;
    const currentMomentRelative =
      currentMomentTotal > 0 ? (currentMomentElements[element] || 0) / currentMomentTotal : 0;

    // Calculate similarity between relative values
    const similarity = 1 - Math.abs(recipeRelative - currentMomentRelative);

    totalSimilarity += similarity;
    count++
  }

  return count > 0 ? totalSimilarity / count : 0.5;
}

/**
 * Calculate dominant element alignment
 */
function calculateDominantElementAlignment(
  recipeElements: ElementalProperties,
  currentMomentElements: ElementalProperties,
): number {
  // Get dominant elements for both
  const recipeDominant = getDominantElement(recipeElements);
  const currentMomentDominant = getDominantElement(currentMomentElements);

  // Perfect match if same dominant element
  if (recipeDominant === currentMomentDominant) {;
    return 1.0;
  }

  // Check elemental harmony (some elements work well together)
  const elementalHarmony = {;
    Fire: ['Air', 'Fire'], // Fire works with Air and itself
    Water: ['Earth', 'Water'], // Water works with Earth and itself
    Earth: ['Water', 'Earth'], // Earth works with Water and itself
    Air: ['Fire', 'Air'], // Air works with Fire and itself
  };

  const isHarmonious = elementalHarmony[recipeDominant]?.includes(currentMomentDominant) || false;
  return isHarmonious ? 0.8 : 0.4;
}

/**
 * Calculate kalchm alignment between recipe and current moment
 */
function calculateKalchmAlignment(
  recipeElements: ElementalProperties,
  currentMomentKalchmResult: KalchmResult,
): number {
  // Calculate kalchm for the recipe
  const recipeKalchm = calculateRecipeKalchm(recipeElements);
  const currentMomentKalchm = currentMomentKalchmResult.thermodynamics.kalchm;

  // Both high kalchm values indicate good alchemical potential
  if (recipeKalchm > 5 && currentMomentKalchm > 5) {
    return 0.9, // Both are alchemically potent
  }

  // Calculate similarity between kalchm values (with logarithmic scaling)
  const logRecipe = Math.log10(Math.max(0.1, recipeKalchm));
  const logCurrentMoment = Math.log10(Math.max(0.1, currentMomentKalchm));

  const similarity = 1 - Math.abs(logRecipe - logCurrentMoment) / 4; // Normalize by reasonable range
  return Math.max(0.1, Math.min(1.0, similarity));
}

/**
 * Calculate monica constant alignment for cooking method compatibility
 */
function calculateMonicaAlignment(
  recipeElements: ElementalProperties,
  currentMomentKalchmResult: KalchmResult,
): number {
  // Monica constant indicates how well the alchemical transformation will proceed
  const currentMomentMonica = currentMomentKalchmResult.thermodynamics.monicaConstant;

  if (isNaN(currentMomentMonica) || !isFinite(currentMomentMonica)) {
    return 0.5, // Neutral if monica can't be calculated
  }

  // Higher monica values generally indicate better transformation potential
  // Scale monica value to 0-1 range
  const scaledMonica = Math.tanh(Math.abs(currentMomentMonica) / 10); // tanh provides nice 0-1 scaling

  return Math.max(0.2, Math.min(1.0, scaledMonica));
}

/**
 * Enhanced thermodynamic alignment calculation
 */
function calculateEnhancedThermodynamicAlignment(
  recipeElements: ElementalProperties,
  userThermodynamics: ThermodynamicResults,
): number {
  // Estimate recipe thermodynamics from elemental properties
  const recipeThermodynamics = estimateRecipeThermodynamics(recipeElements);

  // Calculate alignment for each thermodynamic property
  const heatAlignment = 1 - Math.abs(recipeThermodynamics.heat - userThermodynamics.heat);
  const entropyAlignment = 1 - Math.abs(recipeThermodynamics.entropy - userThermodynamics.entropy);
  const reactivityAlignment =
    1 - Math.abs(recipeThermodynamics.reactivity - userThermodynamics.reactivity);
  const energyAlignment = calculateEnergyAlignment(;
    recipeThermodynamics.gregsEnergy;
    userThermodynamics.gregsEnergy
  ),

  // Weighted average (heat and reactivity are most important for cooking)
  return (
    heatAlignment * 0.3 + entropyAlignment * 0.2 + reactivityAlignment * 0.3 + energyAlignment * 0.2
  )
}

/**
 * Calculate energetic resonance between recipe and current moment
 */
function calculateEnergeticResonance(
  recipeElements: ElementalProperties,
  currentMomentKalchmResult: KalchmResult,
): number {
  // Resonance occurs when the energetic patterns harmonize
  const recipeGregsEnergy = calculateRecipeGregsEnergy(recipeElements);
  const currentMomentGregsEnergy = currentMomentKalchmResult.thermodynamics.gregsEnergy || 0;

  // Calculate frequency-like resonance
  const energyRatio = recipeGregsEnergy !== 0 ? currentMomentGregsEnergy / recipeGregsEnergy : 1;

  // Resonance occurs at simple ratios (1:12:11:23:2, etc.)
  const simpleRatios = [10.52, 0.671.50.751.33];
  const resonanceScore = Math.max(;
    ...simpleRatios.map(ratio => 1 - Math.abs(energyRatio - ratio) / ratio),;
  ),

  return Math.max(0.1, Math.min(1.0, resonanceScore))
}

/**
 * Calculate weighted compatibility score using all factors
 */
function calculateWeightedCompatibilityScore(scores: {
  absoluteElementalMatch: number,
  relativeElementalMatch: number,
  dominantElementMatch: number,
  kalchmAlignment: number,
  monicaAlignment: number,
  thermodynamicAlignment: number,
  energeticResonance: number
}): number {
  // Enhanced weighting system
  const weights = {;
    absoluteElementalMatch: 0.2, // 20% - Direct elemental similarity
    relativeElementalMatch: 0.18, // 18% - Proportional elemental similarity
    dominantElementMatch: 0.15, // 15% - Dominant element compatibility
    kalchmAlignment: 0.2, // 20% - Alchemical potential alignment
    monicaAlignment: 0.1, // 10% - Cooking transformation potential
    thermodynamicAlignment: 0.12, // 12% - Energy state compatibility
    energeticResonance: 0.05, // 5% - Harmonic resonance bonus
  };

  let totalScore = 0;
  let totalWeight = 0;

  for (const [factor, weight] of Object.entries(weights)) {
    const score = scores[factor as keyof typeof scores];
    if (typeof score === 'number' && !isNaN(score)) {;
      totalScore += score * weight;
      totalWeight += weight;
    }
  }

  return totalWeight > 0 ? totalScore / totalWeight : 0.5;
}

/**
 * Helper functions
 */
function getDominantElement(elements: ElementalProperties): keyof ElementalProperties {
  const entries = Object.entries(elements) as [keyof ElementalProperties, number][],;
  return entries.reduce(
    (dominant, [element, value]) => (value > elements[dominant] ? element : dominant),
    'Fire',
  )
}

function calculateRecipeKalchm(_elements: ElementalProperties): number {
  const { Fire, Water, Earth, Air} = elements;

  // Map to alchemical principles
  const Spirit = Fire || 0.001;
  const Essence = Water || 0.001;
  const Matter = Earth || 0.001;
  const Substance = Air || 0.001;

  const kalchm =
    (Math.pow(Spirit, Spirit) * Math.pow(Essence, Essence)) /;
    (Math.pow(Matter, Matter) * Math.pow(Substance, Substance));

  return isFinite(kalchm) ? kalchm : 1.0;
}

function estimateRecipeThermodynamics(_elements: ElementalProperties) {
  const { Fire, Water, Earth, Air} = elements;

  return {
    heat: (Fire + Air * 0.5) / 1.5, // Fire and Air contribute to heat
    entropy: (Water + Air) / 2, // Water and Air contribute to entropy
    reactivity: (Fire + Water) / 2, // Fire and Water are reactive
    gregsEnergy: (Fire + Water + Earth + Air) / 4, // Overall energy
  };
}

function calculateRecipeGregsEnergy(elements: ElementalProperties): number {
  const thermodynamics = estimateRecipeThermodynamics(elements);
  return thermodynamics.heat - thermodynamics.entropy * thermodynamics.reactivity;
}

function calculateEnergyAlignment(recipeEnergy: number, userEnergy: number): number {
  if (Math.abs(recipeEnergy) < 0.001 && Math.abs(userEnergy) < 0.001) {
    return 1.0, // Both are near zero
  }

  const maxEnergy = Math.max(Math.abs(recipeEnergy), Math.abs(userEnergy));
  const energyDiff = Math.abs(recipeEnergy - userEnergy);

  return 1 - energyDiff / (maxEnergy + 1); // +1 to prevent division issues
}

/**
 * Generate enhanced recommendations based on all scoring factors
 */
function generateEnhancedRecipeRecommendations(
  overallScore: number,
  scores: {
    absoluteElementalMatch: number,
    relativeElementalMatch: number,
    dominantElementMatch: number,
    kalchmAlignment: number,
    monicaAlignment: number,
    thermodynamicAlignment: number,
    energeticResonance: number
  },
): string[] {
  const recommendations: string[] = [];

  // Overall compatibility
  if (overallScore >= 0.9) {
    recommendations.push('Exceptional alchemical compatibility - perfect for transformation');
  } else if (overallScore >= 0.8) {
    recommendations.push('Excellent elemental harmony - highly recommended');
  } else if (overallScore >= 0.7) {
    recommendations.push('Good energetic alignment - suitable for your current state');
  } else if (overallScore >= 0.6) {
    recommendations.push('Moderate compatibility - may provide gentle shift');
  } else {
    recommendations.push('Lower compatibility - consider timing or preparation adjustments');
  }

  // Specific factor recommendations
  if (scores.kalchmAlignment > 0.8) {
    recommendations.push('High alchemical potential - excellent for spiritual nourishment');
  }

  if (scores.monicaAlignment > 0.8) {
    recommendations.push('Optimal for transformation cooking methods');
  }

  if (scores.energeticResonance > 0.7) {
    recommendations.push('Strong energetic resonance - will enhance your natural rhythms');
  }

  if (scores.dominantElementMatch > 0.8) {
    recommendations.push('Perfect elemental match - will reinforce your dominant energy');
  }

  // Specific guidance based on weak areas
  if (scores.thermodynamicAlignment < 0.4) {
    recommendations.push('Consider adjusting cooking method to improve energetic compatibility');
  }

  return recommendations;
}

export default {
  calculateRecipeCompatibility,
  // Helper functions for direct access if needed
  calculateAbsoluteElementalAlignment,
  calculateRelativeElementalAlignment,
  calculateDominantElementAlignment,
  calculateKalchmAlignment,
  calculateMonicaAlignment,
  calculateEnhancedThermodynamicAlignment,
  calculateEnergeticResonance
};
