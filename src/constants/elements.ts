import type { Element } from '@/types/alchemy';

// Import the actual elemental data to use in our intelligence systems
import { 
  ELEMENT_COMBINATIONS, 
  ELEMENT_AFFINITIES, 
  ELEMENT_COMPLEMENTS, 
  ELEMENT_COMPATIBILITY,
  ELEMENTAL_THRESHOLDS 
} from '@/utils/constants/elements';

/**
 * 🔬 ELEMENTAL PROPERTY INTELLIGENCE ENGINE
 * Advanced analysis system for elemental properties and characteristics
 */
export const ELEMENTAL_PROPERTY_INTELLIGENCE = {
  /**
   * Analyzes elemental properties and provides comprehensive insights
   */
  analyzeElementalProperties: (analysisData: { 
    elements: Element[]; 
    requirements?: Record<string, unknown>;
    context?: 'cooking' | 'astrology' | 'alchemy' | 'general';
  }) => {
    const { elements, requirements = {}, context = 'general' } = analysisData;
    
    // Element frequency analysis
    const elementFrequency = elements.reduce((acc, element) => {
      acc[element] = (acc[element] || 0) + 1;
      return acc;
    }, {} as Record<Element, number>);
    
    // Dominant element identification
    const dominantElement = Object.entries(elementFrequency)
      .sort(([,a], [,b]) => b - a)[0]?.[0] as Element;
    
    // Elemental balance analysis
    const totalElements = elements.length;
    const elementalBalance = Object.entries(elementFrequency)
      .reduce((acc, [element, count]) => {
        acc[element as Element] = count / totalElements;
        return acc;
      }, {} as Record<Element, number>);
    
    // Context-specific analysis
    const contextAnalysis = {
      cooking: {
        heatLevel: (elementalBalance.Fire || 0) * 100,
        moistureLevel: (elementalBalance.Water || 0) * 100,
        earthyFlavors: (elementalBalance.Earth || 0) * 100,
        lightness: (elementalBalance.Air || 0) * 100,
        recommendation: dominantElement === 'Fire' ? 'grilling' : 
                      dominantElement === 'Water' ? 'steaming' :
                      dominantElement === 'Earth' ? 'roasting' : 'air-frying'
      },
      astrology: {
        energyProfile: dominantElement,
        balanceScore: Math.min(...Object.values(elementalBalance)) / Math.max(...Object.values(elementalBalance)),
        seasonalAlignment: dominantElement === 'Fire' ? 'summer' :
                          dominantElement === 'Water' ? 'winter' :
                          dominantElement === 'Earth' ? 'autumn' : 'spring'
      },
      alchemy: {
        transformationPotential: 1 - (Math.max(...Object.values(elementalBalance)) - 0.25),
        stabilityIndex: Object.values(elementalBalance).reduce((sum, val) => sum + Math.abs(val - 0.25), 0) / 4,
        primaryForce: dominantElement,
        secondaryForces: Object.entries(elementalBalance)
          .filter(([element]) => element !== dominantElement)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 2)
          .map(([element]) => element)
      },
      general: {
        elementalDistribution: elementalBalance,
        dominantElement,
        diversityScore: Object.keys(elementalBalance).length / 4,
        intensityScore: Math.max(...Object.values(elementalBalance))
      }
    };
    
    return {
      elementFrequency,
      dominantElement,
      elementalBalance,
      contextAnalysis: contextAnalysis[context],
      recommendations: {
        balanceImprovement: Object.entries(elementalBalance)
          .filter(([, balance]) => balance < 0.2)
          .map(([element]) => `increase_${element.toLowerCase()}_influence`),
        optimization: `focus_on_${dominantElement.toLowerCase()}_qualities`,
        synergy: ELEMENT_AFFINITIES[dominantElement]
      }
    };
  },

  /**
   * Evaluates elemental compatibility between different sets
   */
  evaluateElementalSynergy: (synergyData: {
    primaryElements: Element[];
    secondaryElements: Element[];
    weights?: Record<Element, number>;
  }) => {
    const { primaryElements, secondaryElements, weights = {} } = synergyData;
    
    // Calculate compatibility scores
    const compatibilityMatrix = primaryElements.map(primaryElement => {
      return secondaryElements.map(secondaryElement => {
        const baseCompatibility = ELEMENT_COMPATIBILITY[primaryElement]?.[secondaryElement] || 0.5;
        const weight = weights[primaryElement] || 1;
        return baseCompatibility * weight;
      });
    });
    
    // Overall synergy score
    const totalCompatibility = compatibilityMatrix.flat().reduce((sum, score) => sum + score, 0);
    const averageCompatibility = totalCompatibility / (primaryElements.length * secondaryElements.length);
    
    // Harmony analysis
    const harmoniousPairs = primaryElements.flatMap(primary => 
      secondaryElements.filter(secondary => 
        ELEMENT_COMBINATIONS.harmonious.some(([e1, e2]) => 
          (e1 === primary && e2 === secondary) || (e1 === secondary && e2 === primary)
        )
      ).map(secondary => [primary, secondary])
    );
    
    const compatiblePairs = primaryElements.flatMap(primary => 
      secondaryElements.filter(secondary => 
        ELEMENT_COMBINATIONS.compatible.some(([e1, e2]) => 
          (e1 === primary && e2 === secondary) || (e1 === secondary && e2 === primary)
        )
      ).map(secondary => [primary, secondary])
    );
    
    return {
      averageCompatibility,
      compatibilityMatrix,
      harmoniousPairs,
      compatiblePairs,
      synergyLevel: averageCompatibility >= 0.8 ? 'excellent' :
                   averageCompatibility >= 0.6 ? 'good' :
                   averageCompatibility >= 0.4 ? 'moderate' : 'challenging',
      recommendations: {
        strengthen: harmoniousPairs.slice(0, 3),
        balance: compatiblePairs.slice(0, 3),
        optimize: averageCompatibility < 0.6 ? 'increase_harmony_elements' : 'maintain_current_balance'
      }
    };
  }
};

/**
 * 🔗 ELEMENTAL COMBINATION INTELLIGENCE ENGINE
 * Advanced harmony analysis and combination optimization system
 */
export const ELEMENTAL_COMBINATION_INTELLIGENCE = {
  /**
   * Analyzes elemental combinations and provides harmony insights
   */
  analyzeCombinations: (combinationData: { 
    pairs: [Element, Element][]; 
    context?: 'recipe' | 'astrology' | 'meditation' | 'general';
    intensity?: number;
  }) => {
    const { pairs, context = 'general', intensity = 1.0 } = combinationData;
    
    // Analyze each pair for harmony
    const pairAnalysis = pairs.map(([element1, element2]) => {
      const isHarmonious = ELEMENT_COMBINATIONS.harmonious.some(([e1, e2]) => 
        (e1 === element1 && e2 === element2) || (e1 === element2 && e2 === element1)
      );
      
      const isCompatible = ELEMENT_COMBINATIONS.compatible.some(([e1, e2]) => 
        (e1 === element1 && e2 === element2) || (e1 === element2 && e2 === element1)
      );
      
      const compatibilityScore = ELEMENT_COMPATIBILITY[element1]?.[element2] || 0.5;
      const adjustedScore = compatibilityScore * intensity;
      
      return {
        pair: [element1, element2] as [Element, Element],
        isHarmonious,
        isCompatible,
        compatibilityScore: adjustedScore,
        relationship: isHarmonious ? 'harmonious' : 
                     isCompatible ? 'compatible' : 'neutral',
        strength: adjustedScore >= 0.8 ? 'strong' :
                 adjustedScore >= 0.6 ? 'moderate' :
                 adjustedScore >= 0.4 ? 'weak' : 'challenging'
      };
    });
    
    // Overall combination analysis
    const totalScore = pairAnalysis.reduce((sum, analysis) => sum + analysis.compatibilityScore, 0);
    const averageScore = totalScore / pairs.length;
    
    const harmoniousCount = pairAnalysis.filter(p => p.isHarmonious).length;
    const compatibleCount = pairAnalysis.filter(p => p.isCompatible).length;
    
    // Context-specific insights
    const contextInsights = {
      recipe: {
        flavorHarmony: averageScore,
        cookingMethods: pairAnalysis.map(p => {
          const [e1, e2] = p.pair;
          if (e1 === 'Fire' || e2 === 'Fire') return 'grilling';
          if (e1 === 'Water' || e2 === 'Water') return 'steaming';
          if (e1 === 'Earth' || e2 === 'Earth') return 'roasting';
          return 'air-frying';
        }),
        tastingNotes: pairAnalysis.map(p => {
          const [e1, e2] = p.pair;
          return `${e1.toLowerCase()}_${e2.toLowerCase()}_fusion`;
        })
      },
      astrology: {
        energyFlow: averageScore,
        planetaryAlignment: pairAnalysis.map(p => p.relationship),
        seasonalHarmonies: pairAnalysis.map(p => {
          const [e1, e2] = p.pair;
          if (e1 === e2) return `${e1.toLowerCase()}_season_peak`;
          return `${e1.toLowerCase()}_${e2.toLowerCase()}_transition`;
        })
      },
      meditation: {
        balanceLevel: averageScore,
        focusAreas: pairAnalysis.filter(p => p.isHarmonious).map(p => p.pair),
        energyWork: pairAnalysis.map(p => `${p.pair[0].toLowerCase()}_${p.pair[1].toLowerCase()}_meditation`)
      },
      general: {
        overallHarmony: averageScore,
        relationshipTypes: pairAnalysis.map(p => p.relationship),
        strengthLevels: pairAnalysis.map(p => p.strength)
      }
    };
    
    return {
      pairAnalysis,
      summary: {
        totalPairs: pairs.length,
        harmoniousCount,
        compatibleCount,
        averageScore,
        overallRating: averageScore >= 0.8 ? 'excellent' :
                      averageScore >= 0.6 ? 'good' :
                      averageScore >= 0.4 ? 'moderate' : 'needs_work'
      },
      contextInsights: contextInsights[context],
      recommendations: {
        strengthen: pairAnalysis.filter(p => p.compatibilityScore < 0.5).map(p => p.pair),
        leverage: pairAnalysis.filter(p => p.isHarmonious).map(p => p.pair),
        optimize: averageScore < 0.6 ? 'focus_on_harmonious_pairs' : 'maintain_current_combinations'
      }
    };
  },

  /**
   * Suggests optimal elemental combinations for specific purposes
   */
  suggestOptimalCombinations: (suggestionData: {
    availableElements: Element[];
    purpose: 'balance' | 'power' | 'harmony' | 'transformation';
    constraints?: Record<string, unknown>;
  }) => {
    const { availableElements, purpose, constraints = {} } = suggestionData;
    
    // Generate all possible pairs
    const allPairs: [Element, Element][] = [];
    for (let i = 0; i < availableElements.length; i++) {
      for (let j = i + 1; j < availableElements.length; j++) {
        allPairs.push([availableElements[i], availableElements[j]]);
      }
    }
    
    // Score pairs based on purpose
    const scoredPairs = allPairs.map(pair => {
      const [e1, e2] = pair;
      const baseScore = ELEMENT_COMPATIBILITY[e1]?.[e2] || 0.5;
      
      let purposeScore = baseScore;
      switch (purpose) {
        case 'balance':
          purposeScore = e1 === e2 ? 0.5 : baseScore; // Prefer different elements
          break;
        case 'power':
          purposeScore = e1 === e2 ? baseScore * 1.5 : baseScore; // Prefer same elements
          break;
        case 'harmony':
          purposeScore = ELEMENT_COMBINATIONS.harmonious.some(([h1, h2]) => 
            (h1 === e1 && h2 === e2) || (h1 === e2 && h2 === e1)
          ) ? baseScore * 1.3 : baseScore;
          break;
        case 'transformation':
          purposeScore = ELEMENT_COMBINATIONS.compatible.some(([c1, c2]) => 
            (c1 === e1 && c2 === e2) || (c1 === e2 && c2 === e1)
          ) ? baseScore * 1.2 : baseScore;
          break;
      }
      
      return {
        pair,
        score: purposeScore,
        rationale: `${purpose}_optimized_combination`
      };
    });
    
    // Sort by score and return top suggestions
    const topSuggestions = scoredPairs
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    
    return {
      purpose,
      availableElements,
      topSuggestions,
      optimalCombination: topSuggestions[0],
      alternativeOptions: topSuggestions.slice(1, 4),
      implementationGuide: {
        primaryFocus: topSuggestions[0]?.pair,
        supportingElements: topSuggestions.slice(1, 3).map(s => s.pair),
        avoidCombinations: scoredPairs.filter(p => p.score < 0.3).map(p => p.pair)
      }
    };
  }
};

/**
 * ⚖️ ELEMENTAL THRESHOLD INTELLIGENCE ENGINE
 * Advanced threshold optimization and performance analysis system
 */
export const ELEMENTAL_THRESHOLD_INTELLIGENCE = {
  /**
   * Evaluates and optimizes elemental thresholds for various applications
   */
  evaluateThresholds: (thresholdData: { 
    values: Record<Element, number>; 
    metrics?: Record<string, number>;
    application?: 'cooking' | 'astrology' | 'alchemy' | 'general';
  }) => {
    const { values, metrics = {}, application = 'general' } = thresholdData;
    
    // Analyze values against current thresholds
    const thresholdAnalysis = Object.entries(values).map(([element, value]) => {
      const elementKey = element as Element;
      const level = value <= ELEMENTAL_THRESHOLDS.LOW ? 'low' :
                   value <= ELEMENTAL_THRESHOLDS.MEDIUM ? 'medium' : 'high';
      
      const efficiency = level === 'high' ? 0.9 :
                        level === 'medium' ? 0.7 : 0.4;
      
      const recommendation = level === 'low' ? 'increase_influence' :
                            level === 'high' ? 'maintain_strength' : 'optimize_balance';
      
      return {
        element: elementKey,
        value,
        level,
        efficiency,
        recommendation,
        thresholdStatus: value >= ELEMENTAL_THRESHOLDS.MEDIUM ? 'above_threshold' : 'below_threshold'
      };
    });
    
    // Calculate overall threshold performance
    const totalEfficiency = thresholdAnalysis.reduce((sum, analysis) => sum + analysis.efficiency, 0);
    const averageEfficiency = totalEfficiency / thresholdAnalysis.length;
    
    const aboveThreshold = thresholdAnalysis.filter(a => a.thresholdStatus === 'above_threshold').length;
    const belowThreshold = thresholdAnalysis.filter(a => a.thresholdStatus === 'below_threshold').length;
    
    // Application-specific optimization
    const applicationOptimization = {
      cooking: {
        flavorIntensity: averageEfficiency,
        cookingTime: averageEfficiency > 0.7 ? 'standard' : 'extended',
        temperatureAdjustment: thresholdAnalysis.find(a => a.element === 'Fire')?.level === 'high' ? 'reduce' : 'increase',
        moistureControl: thresholdAnalysis.find(a => a.element === 'Water')?.level === 'high' ? 'reduce' : 'increase'
      },
      astrology: {
        energyBalance: averageEfficiency,
        planetaryInfluence: thresholdAnalysis.map(a => ({
          element: a.element,
          influence: a.level
        })),
        seasonalAlignment: averageEfficiency > 0.8 ? 'aligned' : 'needs_adjustment'
      },
      alchemy: {
        transformationPotential: averageEfficiency,
        stabilityIndex: 1 - (Math.max(...Object.values(values)) - Math.min(...Object.values(values))),
        catalystRequirements: thresholdAnalysis.filter(a => a.level === 'low').map(a => a.element),
        processingTime: averageEfficiency > 0.7 ? 'standard' : 'extended'
      },
      general: {
        overallPerformance: averageEfficiency,
        balanceScore: aboveThreshold / (aboveThreshold + belowThreshold),
        optimizationPotential: 1 - averageEfficiency
      }
    };
    
    // Adaptive threshold recommendations
    const adaptiveRecommendations = {
      immediateActions: thresholdAnalysis.filter(a => a.level === 'low').map(a => `boost_${a.element.toLowerCase()}`),
      mediumTermGoals: thresholdAnalysis.filter(a => a.level === 'medium').map(a => `optimize_${a.element.toLowerCase()}`),
      longTermStrategy: averageEfficiency < 0.6 ? 'comprehensive_rebalancing' : 'fine_tuning',
      thresholdAdjustments: {
        suggested: Object.entries(values).reduce((acc, [element, value]) => {
          if (value < ELEMENTAL_THRESHOLDS.LOW) {
            acc[element as Element] = ELEMENTAL_THRESHOLDS.LOW * 1.2;
          } else if (value > ELEMENTAL_THRESHOLDS.HIGH) {
            acc[element as Element] = ELEMENTAL_THRESHOLDS.HIGH * 0.9;
          }
          return acc;
        }, {} as Record<Element, number>),
        rationale: 'balanced_optimization'
      }
    };
    
    return {
      thresholdAnalysis,
      performance: {
        averageEfficiency,
        aboveThreshold,
        belowThreshold,
        overallRating: averageEfficiency >= 0.8 ? 'excellent' :
                      averageEfficiency >= 0.6 ? 'good' :
                      averageEfficiency >= 0.4 ? 'moderate' : 'needs_improvement'
      },
      applicationOptimization: applicationOptimization[application],
      adaptiveRecommendations,
      nextSteps: {
        priority: thresholdAnalysis.filter(a => a.level === 'low').map(a => a.element),
        monitoring: thresholdAnalysis.map(a => a.element),
        validation: 'performance_metrics_tracking'
      }
    };
  },

  /**
   * Provides dynamic threshold adjustment recommendations
   */
  optimizeThresholdSettings: (optimizationData: {
    currentThresholds: Record<string, number>;
    performanceHistory: Record<string, number[]>;
    targetPerformance: number;
  }) => {
    const { currentThresholds, performanceHistory, targetPerformance } = optimizationData;
    
    // Analyze performance trends
    const trendAnalysis = Object.entries(performanceHistory).map(([metric, history]) => {
      const trend = history.length > 1 ? 
        (history[history.length - 1] - history[0]) / history.length : 0;
      
      const volatility = history.length > 1 ? 
        Math.sqrt(history.reduce((sum, val) => {
          const mean = history.reduce((s, v) => s + v, 0) / history.length;
          return sum + Math.pow(val - mean, 2);
        }, 0) / history.length) : 0;
      
      const currentPerformance = history[history.length - 1] || 0;
      const performanceGap = targetPerformance - currentPerformance;
      
      return {
        metric,
        trend,
        volatility,
        currentPerformance,
        performanceGap,
        stability: volatility < 0.1 ? 'stable' : volatility < 0.3 ? 'moderate' : 'volatile'
      };
    });
    
    // Generate optimization recommendations
    const optimizationRecommendations = Object.entries(currentThresholds).map(([threshold, value]) => {
      const relatedMetrics = trendAnalysis.filter(t => t.metric.includes(threshold.toLowerCase()));
      const avgPerformanceGap = relatedMetrics.reduce((sum, m) => sum + m.performanceGap, 0) / Math.max(relatedMetrics.length, 1);
      
      const adjustmentDirection = avgPerformanceGap > 0 ? 'increase' : 'decrease';
      const adjustmentMagnitude = Math.abs(avgPerformanceGap) * 0.1; // Conservative adjustment
      
      const newValue = adjustmentDirection === 'increase' ? 
        Math.min(value + adjustmentMagnitude, 1.0) :
        Math.max(value - adjustmentMagnitude, 0.0);
      
      return {
        threshold,
        currentValue: value,
        recommendedValue: newValue,
        adjustmentDirection,
        adjustmentMagnitude,
        confidence: relatedMetrics.length > 0 ? 'high' : 'medium',
        rationale: `${adjustmentDirection}_to_close_performance_gap`
      };
    });
    
    // Implementation strategy
    const implementationStrategy = {
      phase1: optimizationRecommendations.filter(r => r.confidence === 'high'),
      phase2: optimizationRecommendations.filter(r => r.confidence === 'medium'),
      phase3: optimizationRecommendations.filter(r => r.confidence === 'low'),
      validationPeriod: '1_week',
      rollbackPlan: 'revert_to_previous_thresholds',
      successMetrics: ['performance_improvement', 'stability_maintenance', 'target_achievement']
    };
    
    return {
      trendAnalysis,
      optimizationRecommendations,
      implementationStrategy,
      projectedImprovement: optimizationRecommendations.reduce((sum, r) => sum + r.adjustmentMagnitude, 0) / optimizationRecommendations.length,
      riskAssessment: {
        low: optimizationRecommendations.filter(r => r.adjustmentMagnitude < 0.05).length,
        medium: optimizationRecommendations.filter(r => r.adjustmentMagnitude >= 0.05 && r.adjustmentMagnitude < 0.15).length,
        high: optimizationRecommendations.filter(r => r.adjustmentMagnitude >= 0.15).length
      }
    };
  }
};

// Export all intelligence systems for use in the WhatToEatNext project
// (ELEMENTAL_PROPERTY_INTELLIGENCE, ELEMENTAL_COMBINATION_INTELLIGENCE, ELEMENTAL_THRESHOLD_INTELLIGENCE are already exported above)

// Alternative export for backward compatibility
export const ELEMENTAL_INTELLIGENCE_SUITE = {
  property: ELEMENTAL_PROPERTY_INTELLIGENCE,
  combination: ELEMENTAL_COMBINATION_INTELLIGENCE,
  threshold: ELEMENTAL_THRESHOLD_INTELLIGENCE
};

// Export for direct usage
export const ELEMENTAL_SYSTEMS = {
  PROPERTY: ELEMENTAL_PROPERTY_INTELLIGENCE,
  COMBINATION: ELEMENTAL_COMBINATION_INTELLIGENCE,
  THRESHOLD: ELEMENTAL_THRESHOLD_INTELLIGENCE
};
