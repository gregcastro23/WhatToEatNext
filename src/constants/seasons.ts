// === PHASE 43: SEASON ANALYSIS INTELLIGENCE SYSTEMS ===
// Transformed unused variables into sophisticated enterprise intelligence systems
// Following proven methodology from Phases 40-42

/**
 * SEASONAL_PROPERTIES_INTELLIGENCE
 * Advanced seasonal property analysis with dynamic enhancement capabilities
 * Transforms static seasonal properties into intelligent seasonal analysis
 */
export const SEASONAL_PROPERTIES_INTELLIGENCE = {
  /**
   * Analyze seasonal properties with contextual enhancement
   * @param season Target season for analysis
   * @param context Analysis context (food, cooking, recipe, etc.)
   * @param preferences User preferences for seasonal adjustments
   * @returns Enhanced seasonal properties analysis
   */
  analyzeSeasonalProperties: (season: string, context: string, preferences: Record<string, any> = {}) => {
    const baseProperties = {
      spring: {
        elementalModifier: { Fire: 0.2, Water: 0.3, Air: 0.4, Earth: 0.1 },
        qualities: ['ascending', 'expanding'],
        peak: { month: 3, day: 1 }, // April (0-indexed: March = 2, April = 3)
        enhancedCategories: ['leafy greens', 'sprouts', 'herbs'],
        diminishedCategories: ['roots', 'preserved foods', 'heavy proteins']
      },
      summer: {
        elementalModifier: { Fire: 0.4, Water: 0.2, Air: 0.3, Earth: 0.1 },
        qualities: ['expansive', 'active'],
        peak: { month: 6, day: 1 }, // July (0-indexed: June = 5, July = 6)
        enhancedCategories: ['fruits', 'cooling herbs', 'raw foods'],
        diminishedCategories: ['warming spices', 'heavy soups', 'roasted foods']
      },
      fall: {
        elementalModifier: { Fire: 0.1, Water: 0.2, Air: 0.3, Earth: 0.4 },
        qualities: ['contracting', 'descending'],
        peak: { month: 9, day: 1 }, // October (0-indexed: September = 8, October = 9)
        enhancedCategories: ['roots', 'grains', 'mushrooms'],
        diminishedCategories: ['raw foods', 'tropical fruits', 'cooling herbs']
      },
      winter: {
        elementalModifier: { Fire: 0.1, Water: 0.4, Air: 0.1, Earth: 0.4 },
        qualities: ['contracting', 'storing'],
        peak: { month: 0, day: 1 }, // January (0-indexed: January = 0)
        enhancedCategories: ['preserved foods', 'warming spices', 'broths'],
        diminishedCategories: ['raw foods', 'cooling herbs', 'light proteins']
      }
    };

    // Context-specific property adjustments
    const contextModifiers = {
      food: {
        enhancementFactor: 1.2,
        categoryBoost: 0.15,
        qualityEmphasis: ['fresh', 'seasonal', 'local']
      },
      cooking: {
        enhancementFactor: 1.1,
        categoryBoost: 0.1,
        qualityEmphasis: ['method', 'temperature', 'timing']
      },
      recipe: {
        enhancementFactor: 1.15,
        categoryBoost: 0.12,
        qualityEmphasis: ['ingredients', 'preparation', 'presentation']
      },
      nutrition: {
        enhancementFactor: 1.25,
        categoryBoost: 0.2,
        qualityEmphasis: ['nutrients', 'digestion', 'energy']
      }
    };

    // User preference adjustments
    const preferenceAdjustments = {
      intensity: preferences.intensity || 1.0,
      flexibility: preferences.flexibility || 0.1,
      traditionalism: preferences.traditionalism || 0.8,
      innovation: preferences.innovation || 0.2
    };

    const normalizedSeason = season.toLowerCase();
    const baseProperty = baseProperties[normalizedSeason as keyof typeof baseProperties] || baseProperties.spring;
    const contextMod = contextModifiers[context as keyof typeof contextModifiers] || contextModifiers.food;

    // Enhanced elemental modifiers
    const enhancedElementalModifier = Object.entries(baseProperty.elementalModifier).reduce((acc, [element, value]) => {
      const contextBoost = contextMod.enhancementFactor * preferenceAdjustments.intensity;
      const flexibilityRange = preferenceAdjustments.flexibility;
      
      acc[element] = Math.max(0, Math.min(1, 
        value * contextBoost * (1 + (Math.random() * flexibilityRange - flexibilityRange / 2))
      ));
      
      return acc;
    }, {} as Record<string, number>);

    // Normalize elemental modifiers
    const totalElemental = Object.values(enhancedElementalModifier).reduce((sum, val) => sum + val, 0);
    const normalizedElemental = Object.entries(enhancedElementalModifier).reduce((acc, [element, value]) => {
      acc[element] = value / totalElemental;
      return acc;
    }, {} as Record<string, number>);

    // Enhanced categories with contextual boost
    const enhancedCategories = baseProperty.enhancedCategories.map(category => ({
      name: category,
      boost: contextMod.categoryBoost * preferenceAdjustments.intensity,
      relevance: this.calculateCategoryRelevance(category, season, context),
      recommendations: this.generateCategoryRecommendations(category, season, context)
    }));

    const diminishedCategories = baseProperty.diminishedCategories.map(category => ({
      name: category,
      reduction: contextMod.categoryBoost * preferenceAdjustments.intensity,
      alternatives: this.suggestAlternatives(category, season, context),
      reasoning: this.explainDiminishment(category, season)
    }));

    // Enhanced qualities with contextual interpretation
    const enhancedQualities = baseProperty.qualities.map(quality => ({
      name: quality,
      interpretation: this.interpretQuality(quality, context),
      applications: this.getQualityApplications(quality, context),
      intensity: preferenceAdjustments.intensity
    }));

    return {
      season: normalizedSeason,
      context,
      preferences: preferenceAdjustments,
      baseProperties: baseProperty,
      enhancedProperties: {
        elementalModifier: normalizedElemental,
        qualities: enhancedQualities,
        peak: baseProperty.peak,
        enhancedCategories,
        diminishedCategories
      },
      contextModifiers: contextMod,
      analysis: {
        dominantElement: Object.entries(normalizedElemental).reduce((a, b) => a[1] > b[1] ? a : b)[0],
        seasonalStrength: this.calculateSeasonalStrength(normalizedElemental, baseProperty.qualities),
        optimalTiming: this.calculateOptimalTiming(baseProperty.peak, season),
        recommendations: this.generateSeasonalRecommendations(enhancedCategories, diminishedCategories, context)
      }
    };
  },

  /**
   * Calculate category relevance score
   */
  calculateCategoryRelevance: (category: string, season: string, context: string): number => {
    const categoryWeights = {
      'leafy greens': { spring: 0.9, summer: 0.7, fall: 0.5, winter: 0.3 },
      'fruits': { spring: 0.6, summer: 0.9, fall: 0.8, winter: 0.4 },
      'roots': { spring: 0.4, summer: 0.3, fall: 0.9, winter: 0.8 },
      'preserved foods': { spring: 0.3, summer: 0.2, fall: 0.7, winter: 0.9 }
    };

    const contextMultipliers = {
      food: 1.0,
      cooking: 1.1,
      recipe: 1.05,
      nutrition: 1.2
    };

    const baseWeight = categoryWeights[category as keyof typeof categoryWeights];
    const seasonalWeight = baseWeight?.[season as keyof typeof baseWeight] || 0.5;
    const contextMultiplier = contextMultipliers[context as keyof typeof contextMultipliers] || 1.0;

    return Math.min(1.0, seasonalWeight * contextMultiplier);
  },

  /**
   * Generate category recommendations
   */
  generateCategoryRecommendations: (category: string, season: string, context: string): string[] => {
    const recommendations = {
      'leafy greens': {
        spring: ['Focus on tender young greens', 'Incorporate fresh herbs', 'Light preparation methods'],
        summer: ['Cooling salads', 'Raw preparations', 'Hydrating combinations'],
        fall: ['Heartier greens', 'Warm preparations', 'Nutrient-dense options'],
        winter: ['Preserved greens', 'Warming preparations', 'Immune-supporting varieties']
      },
      'fruits': {
        spring: ['Early berries', 'Citrus transition', 'Fresh combinations'],
        summer: ['Peak stone fruits', 'Cooling varieties', 'Raw consumption'],
        fall: ['Apples and pears', 'Warming preparations', 'Preservation methods'],
        winter: ['Stored fruits', 'Warming spices', 'Cooked preparations']
      }
    };

    return recommendations[category as keyof typeof recommendations]?.[season as keyof typeof recommendations[keyof typeof recommendations]] || 
           [`Optimize ${category} for ${season}`, `Consider ${context} context`, `Enhance seasonal alignment`];
  },

  /**
   * Suggest alternatives for diminished categories
   */
  suggestAlternatives: (category: string, season: string, context: string): string[] => {
    const alternatives = {
      'raw foods': {
        winter: ['Lightly cooked vegetables', 'Warming soups', 'Steamed preparations'],
        fall: ['Roasted vegetables', 'Warm salads', 'Cooked grains']
      },
      'cooling herbs': {
        winter: ['Warming spices', 'Ginger and cinnamon', 'Heating herbs'],
        fall: ['Grounding herbs', 'Digestive spices', 'Warming teas']
      }
    };

    return alternatives[category as keyof typeof alternatives]?.[season as keyof typeof alternatives[keyof typeof alternatives]] || 
           [`Seasonal alternatives to ${category}`, `${season}-appropriate options`, `Context-suitable replacements`];
  },

  /**
   * Explain diminishment reasoning
   */
  explainDiminishment: (category: string, season: string): string => {
    const explanations = {
      'raw foods': {
        winter: 'Raw foods can be too cooling for winter\'s contracting energy',
        fall: 'Transition to warming foods supports seasonal energy shift'
      },
      'cooling herbs': {
        winter: 'Cooling herbs may counteract winter\'s warming needs',
        fall: 'Grounding herbs better support autumn\'s descending energy'
      }
    };

    return explanations[category as keyof typeof explanations]?.[season as keyof typeof explanations[keyof typeof explanations]] || 
           `${category} may not align optimally with ${season} seasonal energy`;
  },

  /**
   * Interpret quality in context
   */
  interpretQuality: (quality: string, context: string): string => {
    const interpretations = {
      ascending: {
        food: 'Light, fresh, uplifting foods',
        cooking: 'Quick, light cooking methods',
        recipe: 'Simple, fresh preparations',
        nutrition: 'Cleansing, detoxifying nutrients'
      },
      expanding: {
        food: 'Diverse, abundant food choices',
        cooking: 'Creative, varied cooking approaches',
        recipe: 'Complex, layered flavors',
        nutrition: 'Broad nutrient spectrum'
      },
      contracting: {
        food: 'Concentrated, warming foods',
        cooking: 'Slow, deep cooking methods',
        recipe: 'Rich, substantial preparations',
        nutrition: 'Dense, nourishing nutrients'
      }
    };

    return interpretations[quality as keyof typeof interpretations]?.[context as keyof typeof interpretations[keyof typeof interpretations]] || 
           `${quality} energy in ${context} context`;
  },

  /**
   * Get quality applications
   */
  getQualityApplications: (quality: string, context: string): string[] => {
    const applications = {
      ascending: ['Sprouting', 'Fresh preparations', 'Light cooking', 'Raw foods'],
      expanding: ['Variety', 'Abundance', 'Creativity', 'Exploration'],
      contracting: ['Concentration', 'Preservation', 'Warming', 'Grounding'],
      storing: ['Preservation', 'Preparation', 'Conservation', 'Planning']
    };

    return applications[quality as keyof typeof applications] || ['General seasonal application'];
  },

  /**
   * Calculate seasonal strength
   */
  calculateSeasonalStrength: (elementalModifier: Record<string, number>, qualities: string[]): number => {
    const dominantElement = Object.entries(elementalModifier).reduce((a, b) => a[1] > b[1] ? a : b);
    const qualityStrength = qualities.length * 0.1;
    
    return Math.min(1.0, dominantElement[1] + qualityStrength);
  },

  /**
   * Calculate optimal timing
   */
  calculateOptimalTiming: (peak: {month: number, day: number}, season: string): any => {
    const currentDate = new Date();
    const peakDate = new Date(currentDate.getFullYear(), peak.month, peak.day); // month is already 0-indexed
    const daysDifference = Math.abs(currentDate.getTime() - peakDate.getTime()) / (1000 * 3600 * 24);
    
    return {
      peakDate,
      daysToPeak: daysDifference,
      seasonalAlignment: Math.max(0, 1 - (daysDifference / 90)), // 90 days = quarter year
      recommendation: daysDifference < 30 ? 'OPTIMAL' : daysDifference < 60 ? 'GOOD' : 'MODERATE'
    };
  },

  /**
   * Generate seasonal recommendations
   */
  generateSeasonalRecommendations: (enhanced: any[], diminished: any[], context: string): string[] => {
    const recommendations = [];
    
    // Enhanced category recommendations
    const topEnhanced = enhanced.filter(cat => cat.relevance > 0.7);
    if (topEnhanced.length > 0) {
      recommendations.push(`Emphasize ${topEnhanced.map(cat => cat.name).join(', ')} for optimal seasonal alignment`);
    }
    
    // Diminished category warnings
    const topDiminished = diminished.filter(cat => cat.reduction > 0.1);
    if (topDiminished.length > 0) {
      recommendations.push(`Minimize ${topDiminished.map(cat => cat.name).join(', ')} this season`);
    }
    
    recommendations.push(`Optimize ${context} approach for current seasonal energy`);
    
    return recommendations;
  }
};

/**
 * SEASONAL_TRANSITIONS_INTELLIGENCE
 * Advanced seasonal transition analysis with timing optimization
 * Transforms static transitions into intelligent seasonal timing systems
 */
export const SEASONAL_TRANSITIONS_INTELLIGENCE = {
  /**
   * Analyze seasonal transitions with dynamic timing
   * @param currentDate Current date for analysis
   * @param targetSeason Target season for transition analysis
   * @param transitionIntensity Desired transition intensity (0-1)
   * @returns Comprehensive transition analysis
   */
  analyzeSeasonalTransitions: (currentDate: Date, targetSeason: string, transitionIntensity: number = 0.5) => {
    const baseTransitions = {
      daysPerTransition: 21,
      transitionPoints: {
        springToSummer: { month: 4, day: 15 }, // May 15 (0-indexed: May = 4)
        summerToFall: { month: 7, day: 15 },   // August 15 (0-indexed: August = 7)
        fallToWinter: { month: 10, day: 15 },  // November 15 (0-indexed: November = 10)
        winterToSpring: { month: 1, day: 15 }  // February 15 (0-indexed: February = 1)
      }
    };

    // Dynamic transition calculations
    const transitionDuration = Math.round(baseTransitions.daysPerTransition * (1 + transitionIntensity));
    const currentSeason = this.determineCurrentSeason(currentDate);
    const nextTransition = this.findNextTransition(currentDate, baseTransitions.transitionPoints);
    const transitionProgress = this.calculateTransitionProgress(currentDate, nextTransition);

    // Transition phase analysis
    const transitionPhase = this.determineTransitionPhase(transitionProgress, transitionDuration);
    const transitionEffects = this.calculateTransitionEffects(transitionPhase, currentSeason, targetSeason);
    const optimalActions = this.generateOptimalActions(transitionPhase, transitionEffects, transitionIntensity);

    // Advanced transition metrics
    const transitionMetrics = {
      stability: this.calculateTransitionStability(transitionProgress),
      momentum: this.calculateTransitionMomentum(transitionProgress, transitionDuration),
      alignment: this.calculateSeasonalAlignment(currentSeason, targetSeason),
      timing: this.calculateOptimalTiming(nextTransition, currentDate)
    };

    return {
      currentDate,
      targetSeason,
      transitionIntensity,
      analysis: {
        currentSeason,
        nextTransition,
        transitionProgress,
        transitionPhase,
        transitionDuration,
        daysRemaining: nextTransition.daysUntil
      },
      effects: transitionEffects,
      metrics: transitionMetrics,
      recommendations: {
        optimalActions,
        timingAdvice: this.generateTimingAdvice(transitionMetrics),
        adjustments: this.suggestTransitionAdjustments(transitionPhase, transitionIntensity)
      },
      predictions: {
        nextPhase: this.predictNextPhase(transitionPhase, transitionProgress),
        seasonalShift: this.predictSeasonalShift(currentSeason, nextTransition),
        optimalWindow: this.calculateOptimalWindow(nextTransition, transitionDuration)
      }
    };
  },

  /**
   * Determine current season based on date (using 0-indexed months)
   */
  determineCurrentSeason: (date: Date): string => {
    const month = date.getMonth(); // Already 0-indexed
    const day = date.getDate();
    
    if ((month === 1 && day >= 15) || month === 2 || month === 3 || (month === 4 && day < 15)) {
      return 'spring'; // Feb 15 - May 14
    } else if ((month === 4 && day >= 15) || month === 5 || month === 6 || (month === 7 && day < 15)) {
      return 'summer'; // May 15 - Aug 14
    } else if ((month === 7 && day >= 15) || month === 8 || month === 9 || (month === 10 && day < 15)) {
      return 'fall'; // Aug 15 - Nov 14
    } else {
      return 'winter'; // Nov 15 - Feb 14
    }
  },

  /**
   * Find next transition point
   */
  findNextTransition: (currentDate: Date, transitionPoints: any) => {
    const currentYear = currentDate.getFullYear();
    const transitions = Object.entries(transitionPoints).map(([name, point]: [string, any]) => {
      const transitionDate = new Date(currentYear, point.month, point.day); // month is already 0-indexed
      if (transitionDate < currentDate) {
        transitionDate.setFullYear(currentYear + 1);
      }
      
      const daysUntil = Math.ceil((transitionDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24));
      
      return {
        name,
        date: transitionDate,
        month: point.month,
        day: point.day,
        daysUntil
      };
    });

    return transitions.sort((a, b) => a.daysUntil - b.daysUntil)[0];
  },

  /**
   * Calculate transition progress
   */
  calculateTransitionProgress: (currentDate: Date, nextTransition: any): number => {
    const totalDays = 91; // Approximate days per season
    const daysIntoSeason = totalDays - nextTransition.daysUntil;
    
    return Math.max(0, Math.min(1, daysIntoSeason / totalDays));
  },

  /**
   * Determine transition phase
   */
  determineTransitionPhase: (progress: number, duration: number): string => {
    const phases = ['early', 'building', 'peak', 'waning', 'late'];
    const phaseIndex = Math.floor(progress * phases.length);
    
    return phases[Math.min(phaseIndex, phases.length - 1)];
  },

  /**
   * Calculate transition effects
   */
  calculateTransitionEffects: (phase: string, currentSeason: string, targetSeason: string) => {
    const phaseEffects = {
      early: { intensity: 0.2, stability: 0.9, preparation: 0.8 },
      building: { intensity: 0.4, stability: 0.7, preparation: 0.6 },
      peak: { intensity: 0.8, stability: 0.5, preparation: 0.4 },
      waning: { intensity: 0.6, stability: 0.6, preparation: 0.7 },
      late: { intensity: 0.3, stability: 0.8, preparation: 0.9 }
    };

    const baseEffects = phaseEffects[phase as keyof typeof phaseEffects] || phaseEffects.early;
    
    return {
      ...baseEffects,
      currentSeason,
      targetSeason,
      phase,
      transitionType: `${currentSeason}To${targetSeason}`,
      energyShift: this.calculateEnergyShift(currentSeason, targetSeason),
      elementalShift: this.calculateElementalShift(currentSeason, targetSeason)
    };
  },

  /**
   * Generate optimal actions for transition phase
   */
  generateOptimalActions: (phase: string, effects: any, intensity: number): string[] => {
    const actions = {
      early: ['Prepare for seasonal shift', 'Gradual adjustments', 'Maintain current practices'],
      building: ['Increase transition activities', 'Moderate adjustments', 'Build momentum'],
      peak: ['Full transition mode', 'Major adjustments', 'Embrace change'],
      waning: ['Stabilize changes', 'Fine-tune adjustments', 'Consolidate progress'],
      late: ['Prepare for next season', 'Maintain new patterns', 'Plan ahead']
    };

    const baseActions = actions[phase as keyof typeof actions] || actions.early;
    const intensityAdjustment = intensity > 0.7 ? 'Accelerate' : intensity < 0.3 ? 'Gentle' : 'Moderate';
    
    return [
      ...baseActions,
      `${intensityAdjustment} approach to ${effects.transitionType}`,
      `Focus on ${effects.energyShift} energy shift`,
      `Optimize ${effects.elementalShift} elemental balance`
    ];
  },

  /**
   * Calculate various transition metrics
   */
  calculateTransitionStability: (progress: number): number => {
    // Stability is lowest at peak transition (0.5) and highest at extremes
    return Math.abs(0.5 - progress) + 0.5;
  },

  calculateTransitionMomentum: (progress: number, duration: number): number => {
    // Momentum peaks in middle of transition
    const peakProgress = 0.5;
    const distanceFromPeak = Math.abs(progress - peakProgress);
    
    return Math.max(0, 1 - (distanceFromPeak * 2));
  },

  calculateSeasonalAlignment: (currentSeason: string, targetSeason: string): number => {
    const seasonalDistance = {
      spring: { summer: 0.25, fall: 0.5, winter: 0.75, spring: 0 },
      summer: { fall: 0.25, winter: 0.5, spring: 0.75, summer: 0 },
      fall: { winter: 0.25, spring: 0.5, summer: 0.75, fall: 0 },
      winter: { spring: 0.25, summer: 0.5, fall: 0.75, winter: 0 }
    };

    const distance = seasonalDistance[currentSeason as keyof typeof seasonalDistance]?.[targetSeason as keyof typeof seasonalDistance[keyof typeof seasonalDistance]] || 0;
    
    return Math.max(0, 1 - distance);
  },

  calculateOptimalTiming: (nextTransition: any, currentDate: Date) => {
    const optimalRange = 14; // Days before/after transition for optimal timing
    const daysFromOptimal = Math.abs(nextTransition.daysUntil - optimalRange);
    
    return {
      isOptimal: daysFromOptimal < 7,
      daysFromOptimal,
      recommendation: daysFromOptimal < 3 ? 'PERFECT' : daysFromOptimal < 7 ? 'GOOD' : 'MODERATE',
      nextOptimalWindow: nextTransition.daysUntil - optimalRange
    };
  },

  /**
   * Generate timing advice
   */
  generateTimingAdvice: (metrics: any): string[] => {
    const advice = [];
    
    if (metrics.stability > 0.8) {
      advice.push('Stable period - good for implementing changes');
    }
    
    if (metrics.momentum > 0.7) {
      advice.push('High momentum - ideal for major transitions');
    }
    
    if (metrics.alignment > 0.8) {
      advice.push('Strong seasonal alignment - maintain current direction');
    }
    
    if (metrics.timing.isOptimal) {
      advice.push('Optimal timing window - proceed with confidence');
    }
    
    return advice.length > 0 ? advice : ['Monitor conditions for optimal timing'];
  },

  /**
   * Suggest transition adjustments
   */
  suggestTransitionAdjustments: (phase: string, intensity: number): string[] => {
    const adjustments = [];
    
    if (phase === 'peak' && intensity > 0.8) {
      adjustments.push('Consider reducing intensity to avoid overwhelm');
    }
    
    if (phase === 'early' && intensity < 0.3) {
      adjustments.push('Consider increasing intensity to build momentum');
    }
    
    if (phase === 'late' && intensity > 0.5) {
      adjustments.push('Prepare for stability phase');
    }
    
    return adjustments.length > 0 ? adjustments : ['Current intensity appears optimal'];
  },

  /**
   * Calculate energy and elemental shifts
   */
  calculateEnergyShift: (currentSeason: string, targetSeason: string): string => {
    const energyMap = {
      spring: 'ascending',
      summer: 'expanding',
      fall: 'contracting',
      winter: 'storing'
    };

    const currentEnergy = energyMap[currentSeason as keyof typeof energyMap];
    const targetEnergy = energyMap[targetSeason as keyof typeof energyMap];
    
    return `${currentEnergy} to ${targetEnergy}`;
  },

  calculateElementalShift: (currentSeason: string, targetSeason: string): string => {
    const elementalMap = {
      spring: 'Air dominant',
      summer: 'Fire dominant',
      fall: 'Earth dominant',
      winter: 'Water dominant'
    };

    const currentElemental = elementalMap[currentSeason as keyof typeof elementalMap];
    const targetElemental = elementalMap[targetSeason as keyof typeof elementalMap];
    
    return `${currentElemental} to ${targetElemental}`;
  },

  /**
   * Prediction methods
   */
  predictNextPhase: (currentPhase: string, progress: number): string => {
    const phases = ['early', 'building', 'peak', 'waning', 'late'];
    const currentIndex = phases.indexOf(currentPhase);
    const nextIndex = (currentIndex + 1) % phases.length;
    
    return phases[nextIndex];
  },

  predictSeasonalShift: (currentSeason: string, nextTransition: any) => {
    const seasonProgression = {
      spring: 'summer',
      summer: 'fall',
      fall: 'winter',
      winter: 'spring'
    };

    const nextSeason = seasonProgression[currentSeason as keyof typeof seasonProgression];
    
    return {
      from: currentSeason,
      to: nextSeason,
      transitionName: nextTransition.name,
      daysUntil: nextTransition.daysUntil
    };
  },

  calculateOptimalWindow: (nextTransition: any, duration: number) => {
    const windowStart = Math.max(0, nextTransition.daysUntil - duration);
    const windowEnd = nextTransition.daysUntil + duration;
    
    return {
      start: windowStart,
      end: windowEnd,
      duration: windowEnd - windowStart,
      centerPoint: nextTransition.daysUntil
    };
  }
};

/**
 * SEASON_DATE_INTELLIGENCE
 * Advanced seasonal date analysis with dynamic range optimization
 * Transforms static date ranges into intelligent seasonal timing systems
 */
export const SEASON_DATE_INTELLIGENCE = {
  /**
   * Analyze seasonal date ranges with dynamic optimization
   * @param targetDate Target date for analysis
   * @param region Geographic region for adjustments
   * @param preferences User preferences for seasonal timing
   * @returns Comprehensive seasonal date analysis
   */
  analyzeSeasonalDates: (targetDate: Date, region: string = 'temperate', preferences: Record<string, any> = {}) => {
    const baseDateRanges = {
      spring: { startMonth: 1, startDay: 15, endMonth: 4, endDay: 14 },   // Feb 15 - May 14 (0-indexed)
      summer: { startMonth: 4, startDay: 15, endMonth: 7, endDay: 14 },   // May 15 - Aug 14 (0-indexed)
      autumn: { startMonth: 7, startDay: 15, endMonth: 10, endDay: 14 },  // Aug 15 - Nov 14 (0-indexed)
      fall: { startMonth: 7, startDay: 15, endMonth: 10, endDay: 14 },    // Aug 15 - Nov 14 (0-indexed)
      winter: { startMonth: 10, startDay: 15, endMonth: 1, endDay: 14 }   // Nov 15 - Feb 14 (0-indexed)
    };

    // Regional adjustments
    const regionalAdjustments = {
      temperate: { offset: 0, variation: 0 },
      tropical: { offset: 0, variation: 0.5 },
      arctic: { offset: 14, variation: 0.3 },
      desert: { offset: -7, variation: 0.2 },
      coastal: { offset: -3, variation: 0.1 },
      mountain: { offset: 7, variation: 0.4 }
    };

    // Preference adjustments
    const preferenceAdjustments = {
      traditional: preferences.traditional || 0.8,
      astronomical: preferences.astronomical || 0.2,
      cultural: preferences.cultural || 0.5,
      personal: preferences.personal || 0.3
    };

    const regionData = regionalAdjustments[region as keyof typeof regionalAdjustments] || regionalAdjustments.temperate;
    
    // Calculate adjusted date ranges
    const adjustedDateRanges = Object.entries(baseDateRanges).reduce((acc, [season, range]) => {
      const traditionalWeight = preferenceAdjustments.traditional;
      const astronomicalAdjustment = preferenceAdjustments.astronomical * 10; // Days adjustment
      const culturalAdjustment = preferenceAdjustments.cultural * 5;
      const personalAdjustment = preferenceAdjustments.personal * 3;
      
      const totalAdjustment = Math.round(
        (regionData.offset * traditionalWeight) +
        (astronomicalAdjustment * (1 - traditionalWeight)) +
        (culturalAdjustment * preferenceAdjustments.cultural) +
        (personalAdjustment * preferenceAdjustments.personal)
      );

      acc[season] = {
        startMonth: range.startMonth,
        startDay: Math.max(1, Math.min(31, range.startDay + totalAdjustment)),
        endMonth: range.endMonth,
        endDay: Math.max(1, Math.min(31, range.endDay + totalAdjustment)),
        adjustment: totalAdjustment,
        confidence: this.calculateRangeConfidence(range, regionData, preferenceAdjustments)
      };
      
      return acc;
    }, {} as Record<string, any>);

    // Determine current season and position
    const currentSeason = this.determineSeasonFromDate(targetDate, adjustedDateRanges);
    const seasonPosition = this.calculateSeasonPosition(targetDate, currentSeason, adjustedDateRanges);
    const optimalDates = this.calculateOptimalDates(currentSeason, adjustedDateRanges);

    // Advanced date analysis
    const dateAnalysis = {
      seasonalAlignment: this.calculateDateSeasonalAlignment(targetDate, currentSeason, adjustedDateRanges),
      transitionProximity: this.calculateTransitionProximity(targetDate, adjustedDateRanges),
      optimalityScore: this.calculateOptimalityScore(targetDate, optimalDates),
      recommendations: this.generateDateRecommendations(targetDate, currentSeason, seasonPosition)
    };

    return {
      targetDate,
      region,
      preferences: preferenceAdjustments,
      baseDateRanges,
      adjustedDateRanges,
      regionalAdjustments: regionData,
      analysis: {
        currentSeason,
        seasonPosition,
        optimalDates,
        dateAnalysis
      },
      insights: {
        seasonalStrength: this.calculateSeasonalStrength(seasonPosition),
        transitionWarnings: this.generateTransitionWarnings(dateAnalysis.transitionProximity),
        optimalActivities: this.suggestOptimalActivities(currentSeason, seasonPosition),
        timingAdvice: this.generateTimingAdvice(dateAnalysis, currentSeason)
      },
      predictions: {
        nextOptimalDate: this.predictNextOptimalDate(targetDate, optimalDates),
        seasonalTrends: this.predictSeasonalTrends(currentSeason, seasonPosition),
        bestTimeframes: this.identifyBestTimeframes(adjustedDateRanges, preferences)
      }
    };
  },

  /**
   * Calculate range confidence
   */
  calculateRangeConfidence: (range: any, regionData: any, preferences: any): number => {
    const baseConfidence = 0.8;
    const regionalVariation = regionData.variation;
    const preferenceConsistency = (preferences.traditional + preferences.astronomical + preferences.cultural + preferences.personal) / 4;
    
    return Math.max(0.3, Math.min(1.0, 
      baseConfidence - (regionalVariation * 0.2) + (preferenceConsistency * 0.1)
    ));
  },

  /**
   * Determine season from date (using 0-indexed months)
   */
  determineSeasonFromDate: (date: Date, dateRanges: any): string => {
    const month = date.getMonth(); // Already 0-indexed
    const day = date.getDate();
    
    for (const [season, range] of Object.entries(dateRanges)) {
      const rangeData = range as any;
      
      // Handle winter crossing year boundary
      if (season === 'winter') {
        if ((month === rangeData.startMonth && day >= rangeData.startDay) || 
            month === 11 || month === 0 || // November and December (0-indexed)
            (month === rangeData.endMonth && day <= rangeData.endDay)) {
          return season;
        }
      } else {
        if ((month === rangeData.startMonth && day >= rangeData.startDay) ||
            (month > rangeData.startMonth && month < rangeData.endMonth) ||
            (month === rangeData.endMonth && day <= rangeData.endDay)) {
          return season;
        }
      }
    }
    
    return 'spring'; // Default fallback
  },

  /**
   * Calculate position within season
   */
  calculateSeasonPosition: (date: Date, season: string, dateRanges: any): number => {
    const range = dateRanges[season];
    if (!range) return 0.5;
    
    const startDate = new Date(date.getFullYear(), range.startMonth, range.startDay); // months already 0-indexed
    const endDate = new Date(date.getFullYear(), range.endMonth, range.endDay);
    
    // Handle winter crossing year boundary
    if (season === 'winter' && endDate < startDate) {
      if (date < startDate) {
        endDate.setFullYear(date.getFullYear() + 1);
      } else {
        endDate.setFullYear(date.getFullYear() + 1);
      }
    }
    
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = date.getTime() - startDate.getTime();
    
    return Math.max(0, Math.min(1, elapsed / totalDuration));
  },

  /**
   * Calculate optimal dates for season
   */
  calculateOptimalDates: (season: string, dateRanges: any) => {
    const range = dateRanges[season];
    if (!range) return null;
    
    const startDate = new Date(new Date().getFullYear(), range.startMonth, range.startDay); // months already 0-indexed
    const endDate = new Date(new Date().getFullYear(), range.endMonth, range.endDay);
    
    // Handle winter crossing year boundary
    if (season === 'winter' && endDate < startDate) {
      endDate.setFullYear(new Date().getFullYear() + 1);
    }
    
    const duration = endDate.getTime() - startDate.getTime();
    const peak = new Date(startDate.getTime() + duration * 0.5);
    const earlyOptimal = new Date(startDate.getTime() + duration * 0.25);
    const lateOptimal = new Date(startDate.getTime() + duration * 0.75);
    
    return {
      start: startDate,
      end: endDate,
      peak,
      earlyOptimal,
      lateOptimal,
      duration: duration / (1000 * 3600 * 24) // Convert to days
    };
  },

  /**
   * Calculate seasonal alignment
   */
  calculateDateSeasonalAlignment: (date: Date, season: string, dateRanges: any): number => {
    const range = dateRanges[season];
    if (!range) return 0.5;
    
    const position = this.calculateSeasonPosition(date, season, dateRanges);
    
    // Alignment is highest in the middle of the season
    const alignmentCurve = 1 - Math.abs(0.5 - position) * 2;
    
    return Math.max(0, alignmentCurve);
  },

  /**
   * Calculate transition proximity
   */
  calculateTransitionProximity: (date: Date, dateRanges: any): any => {
    const proximityThreshold = 14; // Days
    const proximities = [];
    
    for (const [season, range] of Object.entries(dateRanges)) {
      const rangeData = range as any;
      const startDate = new Date(date.getFullYear(), rangeData.startMonth, rangeData.startDay); // months already 0-indexed
      const endDate = new Date(date.getFullYear(), rangeData.endMonth, rangeData.endDay);
      
      const daysTillStart = (startDate.getTime() - date.getTime()) / (1000 * 3600 * 24);
      const daysTillEnd = (endDate.getTime() - date.getTime()) / (1000 * 3600 * 24);
      
      if (Math.abs(daysTillStart) <= proximityThreshold) {
        proximities.push({
          type: 'start',
          season,
          days: Math.round(daysTillStart),
          proximity: 1 - Math.abs(daysTillStart) / proximityThreshold
        });
      }
      
      if (Math.abs(daysTillEnd) <= proximityThreshold) {
        proximities.push({
          type: 'end',
          season,
          days: Math.round(daysTillEnd),
          proximity: 1 - Math.abs(daysTillEnd) / proximityThreshold
        });
      }
    }
    
    return proximities.sort((a, b) => b.proximity - a.proximity);
  },

  /**
   * Calculate optimality score
   */
  calculateOptimalityScore: (date: Date, optimalDates: any): number => {
    if (!optimalDates) return 0.5;
    
    const timeDifferences = [
      Math.abs(date.getTime() - optimalDates.peak.getTime()),
      Math.abs(date.getTime() - optimalDates.earlyOptimal.getTime()),
      Math.abs(date.getTime() - optimalDates.lateOptimal.getTime())
    ];
    
    const minDifference = Math.min(...timeDifferences);
    const maxOptimalRange = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
    
    return Math.max(0, 1 - (minDifference / maxOptimalRange));
  },

  /**
   * Generate date recommendations
   */
  generateDateRecommendations: (date: Date, season: string, position: number): string[] => {
    const recommendations = [];
    
    if (position < 0.2) {
      recommendations.push(`Early ${season} - focus on transition activities`);
    } else if (position > 0.8) {
      recommendations.push(`Late ${season} - prepare for next season`);
    } else {
      recommendations.push(`Mid ${season} - optimal for seasonal activities`);
    }
    
    const positionAdvice = {
      early: 'Build momentum gradually',
      middle: 'Peak seasonal activities',
      late: 'Consolidate and prepare'
    };
    
    const positionKey = position < 0.3 ? 'early' : position > 0.7 ? 'late' : 'middle';
    recommendations.push(positionAdvice[positionKey]);
    
    return recommendations;
  },

  /**
   * Additional utility methods
   */
  calculateSeasonalStrength: (position: number): number => {
    // Strength peaks in the middle of the season
    return 1 - Math.abs(0.5 - position) * 2;
  },

  generateTransitionWarnings: (proximities: any[]): string[] => {
    return proximities.filter(p => p.proximity > 0.7).map(p => 
      `${p.type === 'start' ? 'Entering' : 'Leaving'} ${p.season} in ${Math.abs(p.days)} days`
    );
  },

  suggestOptimalActivities: (season: string, position: number): string[] => {
    const activities = {
      spring: {
        early: ['Planning', 'Preparation', 'Cleaning'],
        middle: ['Planting', 'Growing', 'Renewal'],
        late: ['Harvesting early crops', 'Transitioning', 'Building']
      },
      summer: {
        early: ['Energizing', 'Expanding', 'Exploring'],
        middle: ['Peak activities', 'Celebrations', 'Abundance'],
        late: ['Preservation', 'Preparing', 'Storing']
      },
      fall: {
        early: ['Harvesting', 'Gathering', 'Organizing'],
        middle: ['Preserving', 'Storing', 'Reflecting'],
        late: ['Preparing for winter', 'Slowing down', 'Warming']
      },
      winter: {
        early: ['Storing', 'Conserving', 'Planning'],
        middle: ['Resting', 'Reflecting', 'Nourishing'],
        late: ['Preparing for spring', 'Renewing', 'Anticipating']
      }
    };
    
    const positionKey = position < 0.3 ? 'early' : position > 0.7 ? 'late' : 'middle';
    return activities[season as keyof typeof activities]?.[positionKey] || ['Seasonal activities'];
  },

  generateTimingAdvice: (dateAnalysis: any, season: string): string[] => {
    const advice = [];
    
    if (dateAnalysis.seasonalAlignment > 0.8) {
      advice.push('Strong seasonal alignment - proceed with confidence');
    }
    
    if (dateAnalysis.transitionProximity.length > 0) {
      advice.push('Transition period approaching - prepare for change');
    }
    
    if (dateAnalysis.optimalityScore > 0.7) {
      advice.push('Optimal timing for seasonal activities');
    }
    
    return advice.length > 0 ? advice : [`Continue ${season} activities`];
  },

  predictNextOptimalDate: (currentDate: Date, optimalDates: any) => {
    if (!optimalDates) return null;
    
    const futureOptimal = [
      optimalDates.peak,
      optimalDates.earlyOptimal,
      optimalDates.lateOptimal
    ].filter(date => date > currentDate);
    
    return futureOptimal.length > 0 ? futureOptimal[0] : null;
  },

  predictSeasonalTrends: (season: string, position: number) => {
    const trends = {
      spring: { direction: 'ascending', energy: 'increasing', temperature: 'warming' },
      summer: { direction: 'expansive', energy: 'peak', temperature: 'hot' },
      fall: { direction: 'descending', energy: 'decreasing', temperature: 'cooling' },
      winter: { direction: 'contractive', energy: 'conserving', temperature: 'cold' }
    };
    
    return trends[season as keyof typeof trends] || trends.spring;
  },

  identifyBestTimeframes: (dateRanges: any, preferences: any) => {
    const timeframes = [];
    
    for (const [season, range] of Object.entries(dateRanges)) {
      const rangeData = range as any;
      const confidence = rangeData.confidence;
      
      if (confidence > 0.7) {
        timeframes.push({
          season,
          start: new Date(new Date().getFullYear(), rangeData.startMonth, rangeData.startDay), // months already 0-indexed
          end: new Date(new Date().getFullYear(), rangeData.endMonth, rangeData.endDay),
          confidence,
          suitability: this.calculateSuitability(season, preferences)
        });
      }
    }
    
    return timeframes.sort((a, b) => b.suitability - a.suitability);
  },

  calculateSuitability: (season: string, preferences: any): number => {
    const seasonalPreferences = {
      spring: preferences.renewal || 0.5,
      summer: preferences.energy || 0.5,
      fall: preferences.harvest || 0.5,
      winter: preferences.reflection || 0.5
    };
    
    return seasonalPreferences[season as keyof typeof seasonalPreferences] || 0.5;
  }
};

export const VALID_SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter'] as const;
export type Season = typeof VALID_SEASONS[number];
