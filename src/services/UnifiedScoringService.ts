import { GeographicCoordinates, PlanetaryLocationService } from '../data/planets/locationService';
import { getCurrentAlchemicalState } from './RealAlchemizeService';
import { 
  getEnhancedPlanetaryPositions, 
  getCurrentAlchemicalNumber,
  type EnhancedAstrologizeResponse 
} from './astrologizeApi';
import {
  calculateAlchemicalNumber,
  calculateAlchemicalNumberCompatibility,
  deriveAlchemicalFromElemental,
  type AlchemicalProperties
} from '../data/unified/alchemicalCalculations';
import type { 
  monicaOptimization: number;
  retrogradeEffect: number;
  alchemicalNumberAlignment: number; // A# alignment
}

/**
 * Calculate retrograde effects on the item
 */
export function calculateRetrogradeEffect(
  astroData: AstrologicalData,
  context: ScoringContext
): number {
  // ... existing code ...
  
  return Math.max(-0.2, Math.min(0.2, score)); // Clamp between -0.2 and 0.2
}

/**
 * Calculate A# (Alchemical Number) alignment score
 */
export function calculateAlchemicalNumberAlignment(
  astroData: AstrologicalData,
  context: ScoringContext
): number {
  try {
    // Get current planetary A# from astrologize API
    const currentA = astroData.alchemicalNumber;
    
    // Get item's A#
    const itemAlchemicalProps = deriveAlchemicalFromElemental(context.item.elementalProperties);
    const itemA = calculateAlchemicalNumber(itemAlchemicalProps);
    
    // Calculate compatibility and complexity alignment
    const compatibility = calculateAlchemicalNumberCompatibility(
      itemAlchemicalProps,
      astroData.alchemicalProperties
    );
    
    // Give a bonus if the complexity (A# value) is similar
    const complexityBonus = Math.abs(currentA - itemA) <= 3 ? 0.15 : 0;
    
    return Math.max(0, Math.min(1, compatibility + complexityBonus));
  } catch (error) {
    console.warn("A# alignment calculation failed:", error);
    return 0.5; // Neutral score on failure
  }
}

// ... existing code ...
  private aggregateScore(breakdown: ScoringBreakdown): number {
    // Default weights for each effect
    const weights = {
      base: 1.0,
      transitEffect: 0.8,
      dignityEffect: 0.7,
      tarotEffect: 0.3,
      seasonalEffect: 0.6,
      locationEffect: 0.5,
      lunarPhaseEffect: 0.4,
      aspectEffect: 0.7,
      elementalCompatibility: 0.9,
      thermalDynamicEffect: 0.6,
      kalchmResonance: 0.5,
      monicaOptimization: 0.4,
      alchemicalNumberAlignment: 0.85,  // A# gets high weight - alchemical complexity is crucial
      retrogradeEffect: 0.6
    };
    
    let totalWeightedScore = 0;
// ... existing code ...
  private generateNotes(
    breakdown: ScoringBreakdown,
    astroData: AstrologicalData,
    _context: ScoringContext
  ): string[] {
// ... existing code ...
    if (breakdown.elementalCompatibility > 0.3) {
      notes.push('Excellent elemental compatibility with current state');
    }
    if (breakdown.alchemicalNumberAlignment > 0.8) {
      notes.push('Outstanding A# (alchemical complexity) alignment - perfect match for current energetic state');
    } else if (breakdown.alchemicalNumberAlignment > 0.6) {
      notes.push('Good A# alignment - alchemical complexity matches your current needs');
    } else if (breakdown.alchemicalNumberAlignment < 0.4) {
      notes.push('Lower A# alignment - may not match your current alchemical complexity needs');
    }
    if (breakdown.retrogradeEffect < -0.15) {
      notes.push('Retrograde planets may reduce effectiveness');
    }
// ... existing code ... 