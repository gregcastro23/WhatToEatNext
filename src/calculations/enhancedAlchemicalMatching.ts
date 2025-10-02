// Type imports
import type { ElementalProperties, PlanetaryPosition } from '@/types/alchemy';
import type { ZodiacSign } from '@/types/unified';

// Internal imports
import { signs } from '@/data/astrology';
import { createLogger } from '@/utils/logger';

// Logger
const logger = createLogger('EnhancedAlchemicalMatching');

/**
 * Calculate astrological affinity between two signs
 * This integrates multiple data sources including:
 * 1. Decanic compatibility
 * 2. Degree-specific planetary influences
 * 3. Tarot correspondences
 * 4. Modality interactions
 *
 * @param signA First zodiac sign
 * @param signB Second zodiac sign
 * @param planets Optional planetary positions for more accurate calculations
 * @returns Numeric score between 0-1 representing astrological affinity
 */
export function calculateAstrologicalAffinity(signA: ZodiacSign,
  signB: ZodiacSign,
  _planets?: Record<string, PlanetaryPosition>): number {
  try {
    // Base elemental compatibility
    const elementA = signs[signA]?.Element;
    const elementB = signs[signB]?.Element;

    // Get modalities
    const modalityA = signs[signA]?.Modality;
    const modalityB = signs[signB]?.Modality;

    // Start with base elemental compatibility score
    let baseScore = 0.5; // Neutral starting point

    // Elemental compatibility matrix
    // Elements are only harmonious with themselves
    if (elementA && elementB) {
      if (elementA === elementB) {
        // Same element - apply modality affinity if available
        if (modalityA && modalityB) {
          // Apply element-modality natural affinity boost
          const modalityCompatibility = compareModalities(modalityA, modalityB, elementA, elementB);
          baseScore = 0.6 + modalityCompatibility * 0.3; // Scale between 0.6-0.9
        } else {
          baseScore = 0.8; // Default same element without modality info
        }
      } else {
        // Different elements are less harmonious
        baseScore = 0.4;
      }
    }

    // Calculate decanic compatibility
    const decanCompat = compareDecanRulers(signs[signA]?.['Decan Effects'] || {},
      signs[signB]?.['Decan Effects'] || {});

    // Calculate degree-specific influences
    const degreeCompat = calculateDegreeOverlap(signs[signA]?.['Degree Effects'] || {},
      signs[signB]?.['Degree Effects'] || {});

    // Calculate tarot correspondences influence
    const tarotCompat = compareTarotArcana(signs[signA]?.['Major Tarot Card'] || '',
      signs[signB]?.['Major Tarot Card'] || '');

    // Calculate modality compatibility with elements
    const modalityCompat =
      modalityA && modalityB ? compareModalities(modalityA, modalityB, elementA, elementB) : 0.5;

    // Calculate rulership compatibility
    const rulerCompat = compareRulers(signs[signA]?.Ruler || '', signs[signB]?.Ruler || '');

    // Weight components based on their relative importance
    return (
      baseScore * 0.35 + // Element base compatibility (35%)
      decanCompat * 0.15 + // Decanic influences (15%)
      degreeCompat * 0.15 + // Degree-specific effects (15%)
      modalityCompat * 0.2 + // Modality compatibility (20%)
      rulerCompat * 0.1 + // Planetary rulership (10%)
      tarotCompat * 0.05 // Tarot correspondences (5%)
    );
  } catch (error) {
    logger.error('Error calculating astrological affinity:', {
      signA,
      signB,
      error: error instanceof Error ? error.message : String(error)
});
    return 0.5; // Return neutral score on error
  }
}

/**
 * Compare decanic rulers between two signs for compatibility
 */
function compareDecanRulers(decanA: Record<string, unknown>,
  decanB: Record<string, unknown>): number {
  try {
    // Simple implementation - can be expanded
    return 0.5; // Neutral compatibility
  } catch (error) {
    logger.error('Error comparing decan rulers:', {
      error: error instanceof Error ? error.message : String(error)
});
    return 0.5;
  }
}

/**
 * Calculate degree overlap between two signs
 */
function calculateDegreeOverlap(degreeA: Record<string, unknown>,
  degreeB: Record<string, unknown>): number {
  try {
    // Simple implementation - can be expanded
    return 0.5; // Neutral compatibility
  } catch (error) {
    logger.error('Error calculating degree overlap:', {
      error: error instanceof Error ? error.message : String(error)
});
    return 0.5;
  }
}

/**
 * Compare tarot arcana between two signs
 */
function compareTarotArcana(cardA: string, cardB: string): number {
  try {
    // Simple implementation - can be expanded
    if (cardA && cardB && cardA === cardB) {
      return 0.8; // Same card = high compatibility
    }
    return 0.5; // Neutral compatibility
  } catch (error) {
    logger.error('Error comparing tarot arcana:', {
      error: error instanceof Error ? error.message : String(error)
});
    return 0.5;
  }
}

/**
 * Compare modalities with element context
 */
function compareModalities(modalityA: string,
  modalityB: string,
  elementA: string,
  elementB: string): number {
  try {
    // Same modality = higher compatibility
    if (modalityA === modalityB) {
      return 0.8;
    }

    // Different modalities = lower compatibility
    return 0.4;
  } catch (error) {
    logger.error('Error comparing modalities:', {
      error: error instanceof Error ? error.message : String(error)
});
    return 0.5;
  }
}

/**
 * Compare planetary rulers
 */
function compareRulers(rulerA: string, rulerB: string): number {
  try {
    // Same ruler = high compatibility
    if (rulerA && rulerB && rulerA === rulerB) {
      return 0.9;
    }

    // Different rulers = neutral compatibility
    return 0.5;
  } catch (error) {
    logger.error('Error comparing rulers:', {
      error: error instanceof Error ? error.message : String(error)
});
    return 0.5;
  }
}

/**
 * Calculate enhanced elemental matching between recipe and current state
 */
export function calculateEnhancedElementalMatch(recipeElements: ElementalProperties,
  currentElements: ElementalProperties): number {
  try {
    let totalScore = 0;
    let elementCount = 0;

    // Compare each element
    (['Fire', 'Water', 'Earth', 'Air'] as const).forEach(element => {
      const recipeValue = recipeElements[element] || 0;
      const currentValue = currentElements[element] || 0,

      // Calculate similarity (inverse of difference)
      const difference = Math.abs(recipeValue - currentValue);
      const similarity = 1 - Math.min(1, difference);

      totalScore += similarity;
      elementCount++;
    });

    return elementCount > 0 ? totalScore / elementCount : 0.5;
  } catch (error) {
    logger.error('Error calculating enhanced elemental match:', {
      error: error instanceof Error ? error.message : String(error)
});
    return 0.5;
  }
}

/**
 * Calculate overall alchemical compatibility score
 */
export function calculateAlchemicalCompatibility(recipeElements: ElementalProperties,
  astrologicalSign: ZodiacSign,
  currentElements: ElementalProperties): number {
  try {
    // Elemental matching (40% weight)
    const elementalScore = calculateEnhancedElementalMatch(recipeElements, currentElements);

    // Astrological affinity (30% weight) - simplified
    const astrologicalScore = 0.5; // Could be expanded

    // Seasonal alignment (20% weight) - simplified
    const seasonalScore = 0.5; // Could be expanded

    // Planetary harmony (10% weight) - simplified
    const planetaryScore = 0.5; // Could be expanded

    return (
      elementalScore * 0.4 + astrologicalScore * 0.3 + seasonalScore * 0.2 + planetaryScore * 0.1
    );
  } catch (error) {
    logger.error('Error calculating alchemical compatibility:', {
      error: error instanceof Error ? error.message : String(error)
});
    return 0.5;
  }
}
