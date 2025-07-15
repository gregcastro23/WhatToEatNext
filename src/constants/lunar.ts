import type { ElementalProperties } from '@/types/elemental';

// Original lunar data for use in intelligence systems
const LUNAR_PHASES_DATA = {
  new: {
    elementalModifier: {
      Fire: 0.1,
      Water: 0.4,
      Air: 0.1,
      Earth: 0.4
    },
    qualities: ['introspective', 'beginning'],
    duration: 1,
    enhancedCategories: ['seeds', 'sprouts', 'root vegetables'],
    cookingMethods: ['simple cooking', 'sprouting', 'fermenting']
  },
  waxingCrescent: {
    elementalModifier: {
      Fire: 0.2,
      Water: 0.3,
      Air: 0.3,
      Earth: 0.2
    },
    qualities: ['building', 'expanding'],
    duration: 6.5,
    enhancedCategories: ['leafy greens', 'fresh herbs', 'young vegetables'],
    cookingMethods: ['light steaming', 'quick cooking', 'infusing']
  },
  firstQuarter: {
    elementalModifier: {
      Fire: 0.3,
      Water: 0.2,
      Air: 0.3,
      Earth: 0.2
    },
    qualities: ['active', 'manifesting'],
    duration: 1,
    enhancedCategories: ['fruits', 'flowers', 'above-ground vegetables'],
    cookingMethods: ['sautéing', 'stir-frying', 'grilling']
  },
  waxingGibbous: {
    elementalModifier: {
      Fire: 0.4,
      Water: 0.1,
      Air: 0.4,
      Earth: 0.1
    },
    qualities: ['building', 'refining'],
    duration: 6.5,
    enhancedCategories: ['grains', 'nuts', 'seeds'],
    cookingMethods: ['slow cooking', 'baking', 'roasting']
  },
  full: {
    elementalModifier: {
      Fire: 0.5,
      Water: 0.1,
      Air: 0.3,
      Earth: 0.1
    },
    qualities: ['culmination', 'fullness'],
    duration: 1,
    enhancedCategories: ['fruits at peak', 'herbs', 'flowers'],
    cookingMethods: ['high heat cooking', 'grilling', 'searing']
  },
  waningGibbous: {
    elementalModifier: {
      Fire: 0.4,
      Water: 0.2,
      Air: 0.2,
      Earth: 0.2
    },
    qualities: ['releasing', 'gratitude'],
    duration: 6.5,
    enhancedCategories: ['preserved foods', 'dried herbs', 'aged ingredients'],
    cookingMethods: ['slow cooking', 'braising', 'preserving']
  },
  lastQuarter: {
    elementalModifier: {
      Fire: 0.2,
      Water: 0.3,
      Air: 0.2,
      Earth: 0.3
    },
    qualities: ['releasing', 'clearing'],
    duration: 1,
    enhancedCategories: ['root vegetables', 'preserved foods', 'cleansing foods'],
    cookingMethods: ['simple cooking', 'steaming', 'cleansing broths']
  },
  waningCrescent: {
    elementalModifier: {
      Fire: 0.1,
      Water: 0.4,
      Air: 0.1,
      Earth: 0.4
    },
    qualities: ['rest', 'reflection'],
    duration: 6.5,
    enhancedCategories: ['cleansing foods', 'simple ingredients', 'broths'],
    cookingMethods: ['simple cooking', 'steaming', 'minimal processing']
  }
};

const LUNAR_CYCLE_DATA = {
  averageDuration: 29.53059, // days
  phases: ['new', 'waxingCrescent', 'firstQuarter', 'waxingGibbous', 
          'full', 'waningGibbous', 'lastQuarter', 'waningCrescent'],
  elementalInfluence: {
    strengthMultiplier: 0.15, // 15% influence on elemental balance
    peakDuration: 3 // days around full/new moon where influence is strongest
  }
};

const LUNAR_DAYS_DATA = {
  total: 30, // Traditional lunar calendar has 30 days
  favorableDays: [3, 5, 8, 11, 13, 16, 18, 21, 23, 24, 26, 29],
  challengingDays: [4, 7, 9, 12, 14, 19, 22, 27],
  neutralDays: [1, 2, 6, 10, 15, 17, 20, 25, 28, 30],
  energyPatterns: {
    growing: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    waning: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]
  }
};

/**
 * 🌙 LUNAR PHASE INTELLIGENCE ENGINE
 * Advanced lunar phase analysis and culinary optimization system
 */
export const LUNAR_PHASES = {
  /**
   * Analyzes current lunar phase and provides comprehensive culinary insights
   */
  analyzeLunarPhase: (analysisData: {
    currentPhase: keyof typeof LUNAR_PHASES_DATA;
    date?: Date;
    location?: { lat: number; lng: number };
    culinaryFocus?: 'cooking' | 'ingredients' | 'timing' | 'energy';
  }) => {
    const { currentPhase, date = new Date(), location, culinaryFocus = 'cooking' } = analysisData;
    
    const phaseData = LUNAR_PHASES_DATA[currentPhase];
    if (!phaseData) {
      throw new Error(`Invalid lunar phase: ${currentPhase}`);
    }
    
    // Calculate phase influence intensity
    const phasePosition = LUNAR_CYCLE_DATA.phases.indexOf(currentPhase) / LUNAR_CYCLE_DATA.phases.length;
    const cycleIntensity = Math.sin(phasePosition * Math.PI * 2) * 0.5 + 0.5;
    
    // Elemental influence analysis
    const elementalInfluence = Object.entries(phaseData.elementalModifier).map(([element, modifier]) => ({
      element,
      modifier: modifier * cycleIntensity,
      influence: modifier * cycleIntensity * LUNAR_CYCLE_DATA.elementalInfluence.strengthMultiplier,
      peak: modifier * cycleIntensity > 0.3 ? 'high' : 
            modifier * cycleIntensity > 0.2 ? 'medium' : 'low'
    }));
    
    // Dominant elemental energy
    const dominantElement = elementalInfluence.reduce((prev, current) => 
      prev.influence > current.influence ? prev : current
    );
    
    // Culinary focus-specific analysis
    const focusAnalysis = {
      cooking: {
        recommendedMethods: phaseData.cookingMethods,
        energyType: phaseData.qualities[0],
        heatLevel: dominantElement.element === 'Fire' ? 'high' : 
                   dominantElement.element === 'Water' ? 'gentle' : 'moderate',
        processingStyle: phaseData.qualities.includes('beginning') ? 'simple' :
                        phaseData.qualities.includes('active') ? 'dynamic' :
                        phaseData.qualities.includes('releasing') ? 'transformative' : 'balanced',
        timingAdvice: `optimal_during_${currentPhase.replace(/([A-Z])/g, '_$1').toLowerCase()}`
      },
      ingredients: {
        enhancedCategories: phaseData.enhancedCategories,
        optimalIngredients: phaseData.enhancedCategories.map(category => 
          `${category}_with_${dominantElement.element.toLowerCase()}_qualities`
        ),
        avoidIngredients: elementalInfluence.filter(e => e.influence < 0.1).map(e => 
          `minimize_${e.element.toLowerCase()}_heavy_ingredients`
        ),
        preparationStyle: phaseData.qualities.includes('introspective') ? 'mindful' :
                         phaseData.qualities.includes('active') ? 'energetic' :
                         phaseData.qualities.includes('releasing') ? 'cleansing' : 'balanced'
      },
      timing: {
        optimalCookingTime: phaseData.duration < 2 ? 'short_window' : 'extended_period',
        phaseWindow: `${phaseData.duration}_days`,
        energyAlignment: phaseData.qualities,
        bestHours: dominantElement.element === 'Fire' ? 'midday' :
                  dominantElement.element === 'Water' ? 'evening' :
                  dominantElement.element === 'Air' ? 'morning' : 'afternoon'
      },
      energy: {
        energeticQualities: phaseData.qualities,
        emotionalAlignment: phaseData.qualities[0],
        intentionSetting: phaseData.qualities.includes('beginning') ? 'new_projects' :
                         phaseData.qualities.includes('manifesting') ? 'manifestation' :
                         phaseData.qualities.includes('releasing') ? 'letting_go' : 'balance',
        meditativeApproach: `${currentPhase.toLowerCase()}_meditation`
      }
    };
    
    // Optimization recommendations
    const optimizationRecommendations = {
      immediateActions: [
        `focus_on_${dominantElement.element.toLowerCase()}_cooking`,
        `use_${phaseData.cookingMethods[0].replace(/\s+/g, '_')}`,
        `select_${phaseData.enhancedCategories[0].replace(/\s+/g, '_')}`
      ],
      dailyPractices: [
        `align_cooking_with_${currentPhase.toLowerCase()}_energy`,
        `emphasize_${phaseData.qualities[0]}_approach`,
        `work_with_${dominantElement.element.toLowerCase()}_element`
      ],
      weeklyStrategy: [
        `plan_meals_around_${Math.round(phaseData.duration)}_day_cycle`,
        `batch_prepare_${phaseData.enhancedCategories[0].replace(/\s+/g, '_')}`,
        `practice_${phaseData.cookingMethods[0].replace(/\s+/g, '_')}_techniques`
      ]
    };
    
    return {
      phaseData,
      elementalInfluence,
      dominantElement,
      focusAnalysis: focusAnalysis[culinaryFocus],
      optimizationRecommendations,
      metadata: {
        phase: currentPhase,
        cycleIntensity,
        analysisDate: date,
        location,
        duration: phaseData.duration,
        nextPhase: LUNAR_CYCLE_DATA.phases[
          (LUNAR_CYCLE_DATA.phases.indexOf(currentPhase) + 1) % LUNAR_CYCLE_DATA.phases.length
        ]
      }
    };
  },

  /**
   * Compares multiple lunar phases for optimal timing
   */
  compareLunarPhases: (comparisonData: {
    phases: (keyof typeof LUNAR_PHASES_DATA)[];
    criteria: 'cooking' | 'ingredients' | 'energy' | 'elementalBalance';
    targetElement?: 'Fire' | 'Water' | 'Air' | 'Earth';
  }) => {
    const { phases, criteria, targetElement } = comparisonData;
    
    const phaseComparisons = phases.map(phase => {
      const phaseData = LUNAR_PHASES_DATA[phase];
      const analysis = LUNAR_PHASES.analyzeLunarPhase({ currentPhase: phase, culinaryFocus: criteria });
      
      let score = 0;
      
      switch (criteria) {
        case 'cooking':
          score = phaseData.cookingMethods.length * 0.3 + 
                 phaseData.qualities.filter(q => q.includes('active')).length * 0.7;
          break;
        case 'ingredients':
          score = phaseData.enhancedCategories.length * 0.5 + 
                 phaseData.duration * 0.1;
          break;
        case 'energy':
          score = phaseData.qualities.filter(q => ['active', 'manifesting'].includes(q)).length * 0.8 + 
                 phaseData.duration * 0.2;
          break;
        case 'elementalBalance':
          const elementalBalance = Object.values(phaseData.elementalModifier).reduce((acc, val) => acc + val, 0) / 4;
          score = 1 - Math.abs(elementalBalance - 0.25); // Closer to 0.25 = more balanced
          break;
      }
      
      // Boost score if target element is dominant
      if (targetElement && phaseData.elementalModifier[targetElement] > 0.3) {
        score *= 1.5;
      }
      
      return {
        phase,
        score,
        analysis,
        ranking: 0, // Will be set after sorting
        rationale: `${criteria}_optimized_for_${phase.toLowerCase()}`
      };
    });
    
    // Sort by score and assign rankings
    const rankedPhases = phaseComparisons
      .sort((a, b) => b.score - a.score)
      .map((comparison, index) => ({
        ...comparison,
        ranking: index + 1
      }));
    
    return {
      criteria,
      targetElement,
      rankedPhases,
      optimalPhase: rankedPhases[0],
      alternativePhases: rankedPhases.slice(1, 3),
      insights: {
        bestForCriteria: rankedPhases[0].phase,
        worstForCriteria: rankedPhases[rankedPhases.length - 1].phase,
        averageScore: rankedPhases.reduce((sum, p) => sum + p.score, 0) / rankedPhases.length,
        scoreRange: rankedPhases[0].score - rankedPhases[rankedPhases.length - 1].score
      }
    };
  },

  /**
   * Generates lunar phase-based meal planning recommendations
   */
  generateMealPlanning: (planningData: {
    startDate: Date;
    duration: number; // days
    dietaryPreferences?: string[];
    culinaryGoals?: string[];
  }) => {
    const { startDate, duration, dietaryPreferences = [], culinaryGoals = [] } = planningData;
    
    const mealPlan = [];
    
    for (let day = 0; day < duration; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + day);
      
      // Calculate lunar phase for this day (simplified)
      const dayInCycle = (currentDate.getTime() / (1000 * 60 * 60 * 24)) % LUNAR_CYCLE_DATA.averageDuration;
      const phaseIndex = Math.floor((dayInCycle / LUNAR_CYCLE_DATA.averageDuration) * LUNAR_CYCLE_DATA.phases.length);
      const currentPhase = LUNAR_CYCLE_DATA.phases[phaseIndex] as keyof typeof LUNAR_PHASES_DATA;
      
      const phaseAnalysis = LUNAR_PHASES.analyzeLunarPhase({ 
        currentPhase, 
        date: currentDate, 
        culinaryFocus: 'cooking' 
      });
      
      const dayPlan = {
        date: currentDate,
        phase: currentPhase,
        recommendations: {
          cookingMethods: phaseAnalysis.focusAnalysis.recommendedMethods,
          ingredients: phaseAnalysis.focusAnalysis.enhancedCategories,
          energyType: phaseAnalysis.focusAnalysis.energyType,
          mealTiming: phaseAnalysis.focusAnalysis.timingAdvice
        },
        meals: {
          breakfast: {
            style: phaseAnalysis.dominantElement.element === 'Fire' ? 'energizing' : 'gentle',
            ingredients: phaseAnalysis.focusAnalysis.enhancedCategories[0],
            method: phaseAnalysis.focusAnalysis.recommendedMethods[0]
          },
          lunch: {
            style: 'balanced',
            ingredients: phaseAnalysis.focusAnalysis.enhancedCategories[1] || phaseAnalysis.focusAnalysis.enhancedCategories[0],
            method: phaseAnalysis.focusAnalysis.recommendedMethods[1] || phaseAnalysis.focusAnalysis.recommendedMethods[0]
          },
          dinner: {
            style: phaseAnalysis.dominantElement.element === 'Water' ? 'calming' : 'nourishing',
            ingredients: phaseAnalysis.focusAnalysis.enhancedCategories[2] || phaseAnalysis.focusAnalysis.enhancedCategories[0],
            method: phaseAnalysis.focusAnalysis.recommendedMethods[2] || phaseAnalysis.focusAnalysis.recommendedMethods[0]
          }
        }
      };
      
      mealPlan.push(dayPlan);
    }
    
    return {
      planningPeriod: { startDate, duration },
      mealPlan,
      summary: {
        phaseCoverage: [...new Set(mealPlan.map(day => day.phase))],
        dominantPhases: mealPlan.reduce((acc, day) => {
          acc[day.phase] = (acc[day.phase] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        cookingMethodsUsed: [...new Set(mealPlan.flatMap(day => day.recommendations.cookingMethods))],
        ingredientCategoriesUsed: [...new Set(mealPlan.flatMap(day => day.recommendations.ingredients))]
      },
      optimizationTips: [
        'align_cooking_times_with_lunar_phases',
        'batch_prepare_during_favorable_phases',
        'use_phase_specific_cooking_methods',
        'select_ingredients_based_on_lunar_enhancement'
      ]
    };
  }
};

/**
 * 🌕 LUNAR CYCLE INTELLIGENCE ENGINE
 * Advanced lunar cycle analysis and timing optimization system
 */
export const LUNAR_CYCLE = {
  /**
   * Analyzes complete lunar cycle patterns for optimal timing
   */
  analyzeLunarCycle: (analysisData: {
    startDate: Date;
    cycles?: number;
    focus?: 'culinary' | 'agricultural' | 'energy' | 'planning';
  }) => {
    const { startDate, cycles = 1, focus = 'culinary' } = analysisData;
    
    const cycleAnalysis = [];
    
    for (let cycle = 0; cycle < cycles; cycle++) {
      const cycleStart = new Date(startDate);
      cycleStart.setDate(startDate.getDate() + (cycle * LUNAR_CYCLE_DATA.averageDuration));
      
      const phases = LUNAR_CYCLE_DATA.phases.map((phase, index) => {
        const phaseData = LUNAR_PHASES_DATA[phase as keyof typeof LUNAR_PHASES_DATA];
        const phaseStart = new Date(cycleStart);
        phaseStart.setDate(cycleStart.getDate() + (index * LUNAR_CYCLE_DATA.averageDuration / 8));
        
        return {
          phase,
          startDate: phaseStart,
          duration: phaseData.duration,
          elementalModifier: phaseData.elementalModifier,
          qualities: phaseData.qualities,
          enhancedCategories: phaseData.enhancedCategories,
          cookingMethods: phaseData.cookingMethods,
          optimalFor: focus === 'culinary' ? phaseData.cookingMethods[0] :
                     focus === 'agricultural' ? phaseData.enhancedCategories[0] :
                     focus === 'energy' ? phaseData.qualities[0] :
                     'general_planning'
        };
      });
      
      // Calculate cycle energy patterns
      const cycleEnergy = {
        peakPhases: phases.filter(p => p.qualities.includes('active') || p.qualities.includes('culmination')),
        restPhases: phases.filter(p => p.qualities.includes('introspective') || p.qualities.includes('rest')),
        transformationPhases: phases.filter(p => p.qualities.includes('releasing') || p.qualities.includes('clearing')),
        buildingPhases: phases.filter(p => p.qualities.includes('building') || p.qualities.includes('expanding'))
      };
      
      cycleAnalysis.push({
        cycleNumber: cycle + 1,
        startDate: cycleStart,
        phases,
        cycleEnergy,
        optimalPeriods: {
          cooking: phases.filter(p => p.phase === 'full' || p.phase === 'waxingGibbous'),
          preparation: phases.filter(p => p.phase === 'waxingCrescent' || p.phase === 'firstQuarter'),
          preservation: phases.filter(p => p.phase === 'waningGibbous' || p.phase === 'lastQuarter'),
          cleansing: phases.filter(p => p.phase === 'new' || p.phase === 'waningCrescent')
        }
      });
    }
    
    // Overall cycle insights
    const cycleInsights = {
      totalDuration: cycles * LUNAR_CYCLE_DATA.averageDuration,
      averagePhaseLength: LUNAR_CYCLE_DATA.averageDuration / 8,
      optimalTimingPatterns: {
        highEnergy: cycleAnalysis.flatMap(c => c.cycleEnergy.peakPhases),
        restoration: cycleAnalysis.flatMap(c => c.cycleEnergy.restPhases),
        transformation: cycleAnalysis.flatMap(c => c.cycleEnergy.transformationPhases),
        growth: cycleAnalysis.flatMap(c => c.cycleEnergy.buildingPhases)
      },
      strategicRecommendations: {
        planning: 'align_major_activities_with_cycle_peaks',
        preparation: 'use_waxing_phases_for_new_projects',
        completion: 'utilize_full_moon_for_culmination',
        renewal: 'leverage_new_moon_for_fresh_starts'
      }
    };
    
    return {
      analysisParameters: { startDate, cycles, focus },
      cycleAnalysis,
      cycleInsights,
      nextSteps: {
        immediate: `align_current_activities_with_${focus}_focus`,
        shortTerm: 'implement_phase_specific_practices',
        longTerm: 'develop_sustainable_lunar_rhythm'
      }
    };
  },

  /**
   * Optimizes timing for specific activities based on lunar cycles
   */
  optimizeActivityTiming: (optimizationData: {
    activity: string;
    timeframe: 'week' | 'month' | 'season';
    priority?: 'energy' | 'results' | 'ease' | 'transformation';
    constraints?: string[];
  }) => {
    const { activity, timeframe, priority = 'results', constraints = [] } = optimizationData;
    
    const timeframeDays = {
      week: 7,
      month: 30,
      season: 90
    };
    
    const days = timeframeDays[timeframe];
    const cyclesInTimeframe = days / LUNAR_CYCLE_DATA.averageDuration;
    
    // Generate timing recommendations
    const recommendations = LUNAR_CYCLE_DATA.phases.map(phase => {
      const phaseData = LUNAR_PHASES_DATA[phase as keyof typeof LUNAR_PHASES_DATA];
      
      let suitabilityScore = 0;
      
      // Score based on priority
      switch (priority) {
        case 'energy':
          suitabilityScore = phaseData.qualities.includes('active') ? 0.9 :
                            phaseData.qualities.includes('building') ? 0.7 :
                            phaseData.qualities.includes('culmination') ? 0.8 : 0.4;
          break;
        case 'results':
          suitabilityScore = phaseData.qualities.includes('culmination') ? 0.9 :
                            phaseData.qualities.includes('manifesting') ? 0.8 :
                            phaseData.qualities.includes('active') ? 0.7 : 0.5;
          break;
        case 'ease':
          suitabilityScore = phaseData.qualities.includes('rest') ? 0.9 :
                            phaseData.qualities.includes('introspective') ? 0.8 :
                            phaseData.qualities.includes('releasing') ? 0.7 : 0.5;
          break;
        case 'transformation':
          suitabilityScore = phaseData.qualities.includes('releasing') ? 0.9 :
                            phaseData.qualities.includes('clearing') ? 0.8 :
                            phaseData.qualities.includes('beginning') ? 0.7 : 0.5;
          break;
      }
      
      // Adjust for activity type
      if (activity.includes('cooking')) {
        suitabilityScore *= phaseData.cookingMethods.length * 0.3;
      }
      if (activity.includes('planning')) {
        suitabilityScore *= phaseData.qualities.includes('beginning') ? 1.5 : 1.0;
      }
      
      return {
        phase,
        suitabilityScore,
        rationale: `${priority}_optimized_for_${activity.replace(/\s+/g, '_')}`,
        supportingFactors: phaseData.qualities,
        duration: phaseData.duration,
        frequency: Math.floor(cyclesInTimeframe * (phaseData.duration / LUNAR_CYCLE_DATA.averageDuration))
      };
    });
    
    // Sort by suitability
    const rankedRecommendations = recommendations.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
    
    return {
      activity,
      timeframe,
      priority,
      optimalTiming: rankedRecommendations[0],
      alternativeTiming: rankedRecommendations.slice(1, 3),
      timingStrategy: {
        primary: rankedRecommendations[0].phase,
        secondary: rankedRecommendations[1].phase,
        frequency: `${rankedRecommendations[0].frequency}_times_per_${timeframe}`,
        duration: `${rankedRecommendations[0].duration}_days_per_occurrence`
      },
      implementationPlan: {
        immediate: `schedule_${activity.replace(/\s+/g, '_')}_during_${rankedRecommendations[0].phase}`,
        ongoing: `maintain_${timeframe}ly_rhythm_with_${rankedRecommendations[0].phase}_focus`,
        optimization: `track_results_and_adjust_timing_based_on_outcomes`
      }
    };
  }
};

/**
 * 📅 LUNAR CALENDAR INTELLIGENCE ENGINE
 * Advanced lunar calendar analysis and day-specific optimization system
 */
export const LUNAR_DAYS = {
  /**
   * Analyzes specific lunar days for optimal activity planning
   */
  analyzeLunarDay: (analysisData: {
    day: number;
    month?: number;
    year?: number;
    activity?: string;
    focus?: 'energy' | 'timing' | 'compatibility' | 'planning';
  }) => {
    const { day, month = new Date().getMonth(), year = new Date().getFullYear(), activity = 'general', focus = 'energy' } = analysisData;
    
    if (day < 1 || day > LUNAR_DAYS_DATA.total) {
      throw new Error(`Invalid lunar day: ${day}. Must be between 1 and ${LUNAR_DAYS_DATA.total}`);
    }
    
    // Determine day category
    const dayCategory = LUNAR_DAYS_DATA.favorableDays.includes(day) ? 'favorable' :
                       LUNAR_DAYS_DATA.challengingDays.includes(day) ? 'challenging' : 'neutral';
    
    // Determine energy pattern
    const energyPattern = LUNAR_DAYS_DATA.energyPatterns.growing.includes(day) ? 'growing' : 'waning';
    
    // Calculate day influence
    const dayInfluence = {
      favorability: dayCategory === 'favorable' ? 0.8 : 
                   dayCategory === 'challenging' ? 0.3 : 0.6,
      energyLevel: energyPattern === 'growing' ? 0.7 : 0.4,
      stability: dayCategory === 'neutral' ? 0.9 : 0.6,
      transformationPotential: dayCategory === 'challenging' ? 0.9 : 0.5
    };
    
    // Focus-specific analysis
    const focusAnalysis = {
      energy: {
        energyType: energyPattern,
        intensity: dayInfluence.energyLevel,
        recommendations: energyPattern === 'growing' ? 
          ['initiate_new_projects', 'increase_activity', 'expand_efforts'] :
          ['complete_tasks', 'reflect_review', 'conserve_energy'],
        optimalActivities: energyPattern === 'growing' ? 
          ['cooking_new_recipes', 'learning_techniques', 'creative_projects'] :
          ['preserving_foods', 'organizing_kitchen', 'maintenance_tasks']
      },
      timing: {
        bestFor: dayCategory === 'favorable' ? 'important_activities' :
                dayCategory === 'challenging' ? 'problem_solving' : 'routine_tasks',
        avoidFor: dayCategory === 'challenging' ? 'new_beginnings' : 'none',
        optimalHours: energyPattern === 'growing' ? 'morning_to_afternoon' : 'afternoon_to_evening',
        duration: dayCategory === 'favorable' ? 'extended_sessions' : 'focused_bursts'
      },
      compatibility: {
        withOtherActivities: dayInfluence.favorability,
        groupActivities: dayCategory === 'favorable' ? 'highly_recommended' : 'approach_with_care',
        soloActivities: dayCategory === 'challenging' ? 'preferred' : 'flexible',
        planningActivities: dayCategory === 'neutral' ? 'ideal' : 'secondary'
      },
      planning: {
        strategicValue: dayCategory === 'neutral' ? 'high' : 'medium',
        planningType: energyPattern === 'growing' ? 'expansion_planning' : 'consolidation_planning',
        decisionMaking: dayCategory === 'favorable' ? 'excellent' : 'proceed_with_caution',
        reviewActivities: energyPattern === 'waning' ? 'ideal' : 'secondary'
      }
    };
    
    // Activity-specific recommendations
    const activityRecommendations = {
      cooking: {
        complexity: dayCategory === 'favorable' ? 'try_complex_recipes' : 'keep_it_simple',
        techniques: energyPattern === 'growing' ? 'learn_new_methods' : 'practice_familiar_ones',
        ingredients: dayCategory === 'favorable' ? 'experiment_with_new_ingredients' : 'use_trusted_favorites',
        timing: dayInfluence.energyLevel > 0.6 ? 'cook_during_peak_hours' : 'prepare_in_advance'
      },
      planning: {
        type: energyPattern === 'growing' ? 'expansion_planning' : 'consolidation_planning',
        scope: dayCategory === 'favorable' ? 'long_term_planning' : 'immediate_planning',
        decisions: dayInfluence.favorability > 0.7 ? 'major_decisions' : 'minor_adjustments',
        collaboration: dayCategory === 'challenging' ? 'solo_planning' : 'group_planning'
      },
      general: {
        approach: dayCategory === 'favorable' ? 'ambitious' : 
                 dayCategory === 'challenging' ? 'cautious' : 'balanced',
        intensity: dayInfluence.energyLevel > 0.6 ? 'high' : 'moderate',
        flexibility: dayCategory === 'neutral' ? 'high' : 'low',
        backup_plans: dayCategory === 'challenging' ? 'essential' : 'optional'
      }
    };
    
    return {
      lunarDay: day,
      dayCategory,
      energyPattern,
      dayInfluence,
      focusAnalysis: focusAnalysis[focus],
      activityRecommendations: activityRecommendations[activity === 'general' ? 'general' : 
                                                      activity.includes('cook') ? 'cooking' : 'planning'],
      optimizationTips: [
        `work_with_${energyPattern}_energy`,
        `leverage_${dayCategory}_day_qualities`,
        `align_activities_with_${focus}_focus`,
        `maintain_flexibility_for_${dayCategory}_days`
      ]
    };
  },

  /**
   * Generates lunar calendar-based scheduling recommendations
   */
  generateLunarSchedule: (scheduleData: {
    activities: string[];
    timeframe: 'week' | 'month';
    priorities?: Record<string, 'high' | 'medium' | 'low'>;
    constraints?: string[];
  }) => {
    const { activities, timeframe, priorities = {}, constraints = [] } = scheduleData;
    
    const timeframeDays = timeframe === 'week' ? 7 : 30;
    const schedule = [];
    
    // Generate schedule for each day
    for (let day = 1; day <= timeframeDays; day++) {
      const lunarDay = ((day - 1) % LUNAR_DAYS_DATA.total) + 1;
      const dayAnalysis = LUNAR_DAYS.analyzeLunarDay({ day: lunarDay, focus: 'planning' });
      
      // Score activities for this day
      const dayActivities = activities.map(activity => {
        const priority = priorities[activity] || 'medium';
        const priorityMultiplier = priority === 'high' ? 1.5 : priority === 'medium' ? 1.0 : 0.7;
        
        let activityScore = dayAnalysis.dayInfluence.favorability * priorityMultiplier;
        
        // Adjust score based on activity type
        if (activity.includes('plan')) {
          activityScore *= dayAnalysis.dayCategory === 'neutral' ? 1.3 : 1.0;
        }
        if (activity.includes('cook')) {
          activityScore *= dayAnalysis.energyPattern === 'growing' ? 1.2 : 0.9;
        }
        if (activity.includes('learn')) {
          activityScore *= dayAnalysis.dayCategory === 'favorable' ? 1.4 : 1.0;
        }
        
        return {
          activity,
          score: activityScore,
          suitability: activityScore > 0.8 ? 'excellent' : 
                      activityScore > 0.6 ? 'good' : 
                      activityScore > 0.4 ? 'moderate' : 'challenging'
        };
      });
      
      // Sort activities by score
      const rankedActivities = dayActivities.sort((a, b) => b.score - a.score);
      
      schedule.push({
        day,
        lunarDay,
        dayAnalysis,
        recommendedActivities: rankedActivities.slice(0, 3),
        primaryActivity: rankedActivities[0],
        alternativeActivities: rankedActivities.slice(1, 3),
        cautions: dayAnalysis.dayCategory === 'challenging' ? 
          ['proceed_with_patience', 'have_backup_plans', 'focus_on_problem_solving'] : []
      });
    }
    
    // Summary and insights
    const scheduleInsights = {
      totalDays: timeframeDays,
      favorableDays: schedule.filter(s => s.dayAnalysis.dayCategory === 'favorable').length,
      challengingDays: schedule.filter(s => s.dayAnalysis.dayCategory === 'challenging').length,
      neutralDays: schedule.filter(s => s.dayAnalysis.dayCategory === 'neutral').length,
      growingEnergyDays: schedule.filter(s => s.dayAnalysis.energyPattern === 'growing').length,
      waningEnergyDays: schedule.filter(s => s.dayAnalysis.energyPattern === 'waning').length,
      optimalDays: schedule.filter(s => s.primaryActivity.suitability === 'excellent').length
    };
    
    return {
      timeframe,
      schedule,
      scheduleInsights,
      strategicRecommendations: {
        scheduling: 'prioritize_high_importance_activities_on_favorable_days',
        flexibility: 'maintain_backup_plans_for_challenging_days',
        energy: 'align_energy_intensive_tasks_with_growing_days',
        planning: 'use_neutral_days_for_planning_and_preparation'
      }
    };
  }
};
