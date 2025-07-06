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
type ScoringMetrics = {
  monicaOptimization: number;
  retrogradeEffect: number;
  alchemicalNumberAlignment: number; // A# alignment
};

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

// Helper function for aggregating scores
function aggregateScore(breakdown: ScoringBreakdown): number {
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
    let totalWeight = 0;
    
    // Calculate weighted score
    for (const [key, value] of Object.entries(breakdown)) {
      if (key in weights && typeof value === 'number') {
        const weight = weights[key as keyof typeof weights];
        totalWeightedScore += value * weight;
        totalWeight += weight;
      }
    }
    
    return totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
}

// Helper function for generating notes
function generateNotes(
    breakdown: ScoringBreakdown,
    astroData: AstrologicalData,
    _context: ScoringContext
  ): string[] {
    const notes: string[] = [];
    
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
    
    return notes;
  }

// Add React hook for components
import { useEffect, useState } from 'react';

export interface ScoringContext {
  item: {
    elementalProperties: any;
  };
}

export interface ScoringBreakdown {
  base: number;
  transitEffect: number;
  dignityEffect: number;
  tarotEffect: number;
  seasonalEffect: number;
  locationEffect: number;
  lunarPhaseEffect: number;
  aspectEffect: number;
  elementalCompatibility: number;
  thermalDynamicEffect: number;
  kalchmResonance: number;
  monicaOptimization: number;
  alchemicalNumberAlignment: number;
  retrogradeEffect: number;
}

export interface AstrologicalData {
  alchemicalNumber: number;
  alchemicalProperties: AlchemicalProperties;
}

export function useUnifiedScoringService() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateScore = (
    astroData: AstrologicalData,
    context: ScoringContext
  ): { score: number; breakdown: ScoringBreakdown; notes: string[] } => {
    try {
      const breakdown: ScoringBreakdown = {
        base: 0.5,
        transitEffect: 0,
        dignityEffect: 0,
        tarotEffect: 0,
        seasonalEffect: 0,
        locationEffect: 0,
        lunarPhaseEffect: 0,
        aspectEffect: 0,
        elementalCompatibility: 0.5,
        thermalDynamicEffect: 0,
        kalchmResonance: 0,
        monicaOptimization: 0,
        alchemicalNumberAlignment: calculateAlchemicalNumberAlignment(astroData, context),
        retrogradeEffect: calculateRetrogradeEffect(astroData, context)
      };

      const score = aggregateScore(breakdown);
      const notes = generateNotes(breakdown, astroData, context);

      return { score, breakdown, notes };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scoring calculation failed');
      return {
        score: 0.5,
        breakdown: {} as ScoringBreakdown,
        notes: ['Error calculating score']
      };
    }
  };

  return {
    calculateScore,
    loading,
    error
  };
}