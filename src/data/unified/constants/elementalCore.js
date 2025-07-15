/**
 * Core elemental constants - consolidated from multiple files
 * This file replaces: elementalConstants.ts, elements.ts, and elemental parts of defaults.ts
 */
// ===== CORE ELEMENT DEFINITIONS =====
/**
 * List of all elemental types
 */
export const ELEMENTS = ['Fire', 'Earth', 'Air', 'Water'];
/**
 * Default balanced elemental properties (25% each)
 */
export const DEFAULT_ELEMENTAL_PROPERTIES = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
};
// ===== ELEMENTAL RELATIONSHIPS =====
/**
 * Element affinities based on traditional correspondences
 * Each element reinforces itself most strongly
 */
export const ELEMENT_AFFINITIES = { Fire: ['Fire', 'Air'],
    Water: ['Water', 'Earth'],
    Air: ['Air', 'Fire'],
    Earth: ['Earth', 'Water']
};
/**
 * Element combinations for compatibility calculations
 */
export const ELEMENT_COMBINATIONS = {
    harmonious: [
        ['Fire', 'Fire'],
        ['Water', 'Water'],
        ['Earth', 'Earth'],
        ['Air', 'Air'],
        ['Fire', 'Air'],
        ['Water', 'Earth']
    ],
    complementary: [
        ['Fire', 'Earth'],
        ['Air', 'Water']
    ]
};
// ===== ZODIAC CORRESPONDENCES =====
/**
 * Zodiac sign to element mapping
 */
export const ZODIAC_ELEMENTS = {
    aries: 'Fire',
    leo: 'Fire',
    sagittarius: 'Fire',
    taurus: 'Earth',
    virgo: 'Earth',
    capricorn: 'Earth',
    gemini: 'Air',
    libra: 'Air',
    aquarius: 'Air',
    cancer: 'Water',
    scorpio: 'Water',
    pisces: 'Water'
};
/**
 * Decan rulers for each zodiac sign
 */
export const DECANS = {
    aries: [
        { ruler: 'Mars', element: 'Fire', degree: 0 },
        { ruler: 'Sun', element: 'Fire', degree: 10 },
        { ruler: 'Jupiter', element: 'Fire', degree: 20 }
    ],
    taurus: [
        { ruler: 'Venus', element: 'Earth', degree: 0 },
        { ruler: 'Mercury', element: 'Earth', degree: 10 },
        { ruler: 'Saturn', element: 'Earth', degree: 20 }
    ],
    gemini: [
        { ruler: 'Mercury', element: 'Air', degree: 0 },
        { ruler: 'Venus', element: 'Air', degree: 10 },
        { ruler: 'Uranus', element: 'Air', degree: 20 }
    ],
    cancer: [
        { ruler: 'Moon', element: 'Water', degree: 0 },
        { ruler: 'Pluto', element: 'Water', degree: 10 },
        { ruler: 'Neptune', element: 'Water', degree: 20 }
    ],
    leo: [
        { ruler: 'Sun', element: 'Fire', degree: 0 },
        { ruler: 'Jupiter', element: 'Fire', degree: 10 },
        { ruler: 'Mars', element: 'Fire', degree: 20 }
    ],
    virgo: [
        { ruler: 'Mercury', element: 'Earth', degree: 0 },
        { ruler: 'Saturn', element: 'Earth', degree: 10 },
        { ruler: 'Venus', element: 'Earth', degree: 20 }
    ],
    libra: [
        { ruler: 'Venus', element: 'Air', degree: 0 },
        { ruler: 'Uranus', element: 'Air', degree: 10 },
        { ruler: 'Mercury', element: 'Air', degree: 20 }
    ],
    scorpio: [
        { ruler: 'Pluto', element: 'Water', degree: 0 },
        { ruler: 'Neptune', element: 'Water', degree: 10 },
        { ruler: 'Moon', element: 'Water', degree: 20 }
    ],
    sagittarius: [
        { ruler: 'Jupiter', element: 'Fire', degree: 0 },
        { ruler: 'Mars', element: 'Fire', degree: 10 },
        { ruler: 'Sun', element: 'Fire', degree: 20 }
    ],
    capricorn: [
        { ruler: 'Saturn', element: 'Earth', degree: 0 },
        { ruler: 'Venus', element: 'Earth', degree: 10 },
        { ruler: 'Mercury', element: 'Earth', degree: 20 }
    ],
    aquarius: [
        { ruler: 'Uranus', element: 'Air', degree: 0 },
        { ruler: 'Mercury', element: 'Air', degree: 10 },
        { ruler: 'Venus', element: 'Air', degree: 20 }
    ],
    pisces: [
        { ruler: 'Neptune', element: 'Water', degree: 0 },
        { ruler: 'Moon', element: 'Water', degree: 10 },
        { ruler: 'Pluto', element: 'Water', degree: 20 }
    ]
};
// ===== VALIDATION AND THRESHOLDS =====
/**
 * Validation thresholds for elemental properties
 */
export const VALIDATION_THRESHOLDS = {
    MINIMUM_ELEMENT: 0,
    MAXIMUM_ELEMENT: 1,
    BALANCE_PRECISION: 0.01
};
/**
 * Elemental significance thresholds
 */
export const ELEMENTAL_THRESHOLDS = {
    dominant: 0.4,
    significant: 0.25,
    present: 0.1,
    trace: 0.05
};
/**
 * Elemental weights for calculations
 */
export const ELEMENTAL_WEIGHTS = { Fire: 1, Water: 1, Earth: 1, Air: 1
};
// ===== COMPREHENSIVE ELEMENTAL CHARACTERISTICS =====
/**
 * Enhanced elemental characteristics with comprehensive properties
 */
export const ELEMENTAL_CHARACTERISTICS = { Fire: {
        // Basic properties
        qualities: ['hot', 'dry', 'active', 'energetic', 'expansive'],
        season: 'summer',
        direction: 'south',
        energy: 'expansive',
        colors: ['red', 'orange', 'yellow'],
        // Culinary properties
        taste: ['spicy', 'bitter'],
        foods: ['spicy', 'grilled', 'roasted', 'peppers', 'ginger', 'garlic'],
        cookingTechniques: ['grilling', 'roasting', 'broiling', 'frying', 'flambé'],
        flavorProfiles: ['spicy', 'pungent', 'bitter', 'umami', 'smoky'],
        complementaryIngredients: ['chilis', 'garlic', 'onions', 'mustard seeds', 'black pepper'],
        culinaryHerbs: ['cayenne', 'chili', 'mustard', 'cumin', 'peppercorn'],
        cuisine: ['mexican', 'thai', 'cajun', 'szechuan', 'indian'],
        // Temporal associations
        seasonalAssociations: ['summer', 'peak day'],
        timeOfDay: ['noon', 'early afternoon'],
        // Effects and benefits
        keywords: ['energy', 'passion', 'transformation', 'vitality', 'action'],
        healthBenefits: ['metabolism boost', 'circulation improvement', 'immune strengthening'],
        moodEffects: ['energizing', 'stimulating', 'uplifting', 'motivating', 'passionate'],
        effects: ['stimulating', 'energizing', 'warming']
    },
    Water: {
        // Basic properties
        qualities: ['cold', 'wet', 'flowing', 'adaptable', 'receptive'],
        season: 'winter',
        direction: 'north',
        energy: 'contracting',
        colors: ['blue', 'black', 'deep purple'],
        // Culinary properties
        taste: ['salty', 'sweet'],
        foods: ['soups', 'steamed', 'hydrating', 'seafood', 'fruits', 'broths'],
        cookingTechniques: ['poaching', 'steaming', 'simmering', 'blending', 'marinating'],
        flavorProfiles: ['sweet', 'salty', 'subtle', 'soothing', 'mellow'],
        complementaryIngredients: ['berries', 'melon', 'cucumber', 'coconut', 'seaweed'],
        culinaryHerbs: ['lavender', 'chamomile', 'fennel', 'dill', 'cucumber'],
        cuisine: ['japanese', 'cantonese', 'scandinavian', 'oceanic'],
        // Temporal associations
        seasonalAssociations: ['winter', 'night'],
        timeOfDay: ['evening', 'night', 'twilight'],
        // Effects and benefits
        keywords: ['emotional', 'intuitive', 'nurturing', 'healing', 'connecting'],
        healthBenefits: ['hydration', 'emotional balance', 'detoxification', 'cooling'],
        moodEffects: ['calming', 'soothing', 'introspective', 'healing', 'nurturing'],
        effects: ['cooling', 'calming', 'hydrating']
    },
    Earth: {
        // Basic properties
        qualities: ['cold', 'dry', 'stable', 'solid', 'grounding'],
        season: 'autumn',
        direction: 'west',
        energy: 'stabilizing',
        colors: ['brown', 'green', 'gold'],
        // Culinary properties
        taste: ['sweet', 'sour'],
        foods: ['root vegetables', 'grains', 'hearty', 'legumes', 'nuts', 'seeds'],
        cookingTechniques: ['baking', 'slow cooking', 'braising', 'pressure cooking', 'fermenting'],
        flavorProfiles: ['rich', 'dense', 'umami', 'earthy', 'complex'],
        complementaryIngredients: ['mushrooms', 'potatoes', 'lentils', 'brown rice', 'squash'],
        culinaryHerbs: ['thyme', 'rosemary', 'sage', 'bay leaf', 'black truffle'],
        cuisine: ['french', 'german', 'russian', 'mediterranean'],
        // Temporal associations
        seasonalAssociations: ['late summer', 'autumn', 'harvest time'],
        timeOfDay: ['late afternoon', 'early evening'],
        // Effects and benefits
        keywords: ['grounding', 'practical', 'material', 'reliable', 'structured'],
        healthBenefits: ['digestive support', 'nutritional density', 'sustained energy'],
        moodEffects: ['stabilizing', 'grounding', 'comforting', 'satisfying', 'nourishing'],
        effects: ['grounding', 'stabilizing', 'nourishing']
    },
    Air: {
        // Basic properties
        qualities: ['hot', 'wet', 'mobile', 'light', 'communicative'],
        season: 'spring',
        direction: 'east',
        energy: 'moving',
        colors: ['white', 'light blue', 'silver'],
        // Culinary properties
        taste: ['pungent', 'astringent'],
        foods: ['light', 'raw', 'fresh', 'salads', 'sprouts', 'herbs'],
        cookingTechniques: ['quick steaming', 'flash cooking', 'raw preparations', 'infusing', 'whipping'],
        flavorProfiles: ['light', 'aromatic', 'herbaceous', 'bright', 'fresh'],
        complementaryIngredients: ['fresh herbs', 'citrus', 'sprouts', 'greens', 'aromatics'],
        culinaryHerbs: ['mint', 'basil', 'cilantro', 'dill', 'lemongrass'],
        cuisine: ['vietnamese', 'greek', 'levantine', 'persian'],
        // Temporal associations
        seasonalAssociations: ['spring', 'dawn'],
        timeOfDay: ['morning', 'sunrise'],
        // Effects and benefits
        keywords: ['intellectual', 'communication', 'social', 'movement', 'connection'],
        healthBenefits: ['mental clarity', 'respiratory support', 'digestive lightness'],
        moodEffects: ['uplifting', 'clarifying', 'refreshing', 'invigorating', 'inspiring'],
        effects: ['lightening', 'clarifying', 'refreshing']
    }
};
// ===== UTILITY FUNCTIONS =====
/**
 * Get the dominant element from elemental properties
 */
export const getDominantElement = (properties) => {
    return Object.entries(properties)
        .reduce((max, [element, value]) => value > max.value ? { element: element, value } : max, { element: 'Fire', value: 0 }).element;
}
/**
 * Normalize elemental properties to sum to 1
 */
export const normalizeElementalProperties = (properties) => {
    const total = Object.values(properties).reduce((sum, val) => sum + (val || 0), 0);
    if (total === 0) {
        return { ...DEFAULT_ELEMENTAL_PROPERTIES };
    }
    return { Fire: (properties.Fire || 0) / total, Water: (properties.Water || 0) / total, Earth: (properties.Earth || 0) / total, Air: (properties.Air || 0) / total
    };
}
/**
 * Calculate elemental compatibility between two sets of properties
 */
export const calculateElementalCompatibility = (properties1, properties2) => {
    // Each element reinforces itself most strongly
    let compatibility = 0;
    let totalWeight = 0;
    for (const element of ELEMENTS) {
        const value1 = properties1[element] || 0;
        const value2 = properties2[element] || 0;
        // Same element compatibility (highest)
        const sameElementScore = Math.min(value1, value2);
        compatibility += sameElementScore * 0.9;
        totalWeight += sameElementScore;
        // Different element compatibility (good but lower)
        const differentElementScore = Math.abs(value1 - value2);
        compatibility += (1 - differentElementScore) * 0.7;
        totalWeight += 1;
    }
    return totalWeight > 0 ? compatibility / totalWeight : 0.7;
}
/**
 * Validate elemental properties
 */
export const validateElementalProperties = (properties) => {
    const total = Object.values(properties).reduce((sum, val) => sum + val, 0);
    const isValidRange = Object.values(properties).every(val => val >= VALIDATION_THRESHOLDS.MINIMUM_ELEMENT &&
        val <= VALIDATION_THRESHOLDS.MAXIMUM_ELEMENT);
    const isValidSum = Math.abs(total - 1) <= VALIDATION_THRESHOLDS.BALANCE_PRECISION;
    return isValidRange && isValidSum;
}

// ===== ENTERPRISE ELEMENTAL INTELLIGENCE SYSTEMS =====

/**
 * ELEMENTAL_ANALYSIS_INTELLIGENCE - Advanced elemental analysis utilizing all elemental constants
 */
export const ELEMENTAL_ANALYSIS_INTELLIGENCE = {
    /**
     * Comprehensive Elemental Profile Analysis
     * Utilizes ELEMENTAL_CHARACTERISTICS for detailed elemental system analysis
     */
    analyzeElementalProfile: (elementalProperties, context = 'unknown') => {
        const analysis = {
            timestamp: Date.now(),
            context: context,
            elementalStates: {},
            energyDistribution: {},
            seasonalAlignment: {},
            culinaryOptimization: {},
            overallAssessment: {
                totalEnergy: 0,
                averageEnergy: 0,
                balancedElements: 0,
                dominantElement: null,
                seasonalHarmony: 'unknown',
                culinaryBalance: 'unknown'
            },
            recommendations: []
        };

        if (!validateElementalProperties(elementalProperties)) {
            analysis.recommendations.push('Provide valid elemental properties object');
            return analysis;
        }

        let totalEnergy = 0;
        const elementNames = Object.keys(ELEMENTS);
        
        // Analyze each element
        for (const elementName of elementNames) {
            const elementData = ELEMENTAL_CHARACTERISTICS[elementName];
            const energy = elementalProperties[elementName] || 0;
            
            analysis.elementalStates[elementName] = {
                name: elementName,
                qualities: elementData.qualities,
                season: elementData.season,
                direction: elementData.direction,
                energy: elementData.energy,
                colors: elementData.colors,
                energyLevel: energy,
                strength: energy >= 0.4 ? 'dominant' : energy >= 0.25 ? 'significant' : energy >= 0.1 ? 'present' : 'trace',
                status: energy >= 0.3 ? 'active' : energy >= 0.15 ? 'balanced' : 'weak',
                culinaryProfile: {
                    taste: elementData.taste,
                    foods: elementData.foods,
                    cookingTechniques: elementData.cookingTechniques,
                    flavorProfiles: elementData.flavorProfiles,
                    complementaryIngredients: elementData.complementaryIngredients,
                    culinaryHerbs: elementData.culinaryHerbs,
                    cuisine: elementData.cuisine
                },
                temporalProfile: {
                    seasonalAssociations: elementData.seasonalAssociations,
                    timeOfDay: elementData.timeOfDay
                },
                effectsProfile: {
                    keywords: elementData.keywords,
                    healthBenefits: elementData.healthBenefits,
                    moodEffects: elementData.moodEffects,
                    effects: elementData.effects
                },
                needsAttention: energy < 0.15
            };

            // Track energy distribution
            analysis.energyDistribution[elementName] = {
                percentage: 0, // Will be calculated after total is known
                energyState: elementData.energy
            };

            // Accumulate seasonal alignment
            const season = elementData.season;
            if (!analysis.seasonalAlignment[season]) {
                analysis.seasonalAlignment[season] = 0;
            }
            analysis.seasonalAlignment[season] += energy;

            totalEnergy += energy;
            
            // Count balance states
            if (energy >= 0.2 && energy <= 0.4) {
                analysis.overallAssessment.balancedElements++;
            }
        }

        analysis.overallAssessment.totalEnergy = totalEnergy;
        analysis.overallAssessment.averageEnergy = totalEnergy / elementNames.length;

        // Calculate energy distribution percentages
        for (const elementName of elementNames) {
            const energy = elementalProperties[elementName] || 0;
            analysis.energyDistribution[elementName].percentage = 
                totalEnergy > 0 ? ((energy / totalEnergy) * 100).toFixed(1) + '%' : '0%';
        }

        // Determine dominant element
        analysis.overallAssessment.dominantElement = getDominantElement(elementalProperties);

        // Seasonal harmony assessment
        const seasonalValues = Object.values(analysis.seasonalAlignment);
        const maxSeasonal = Math.max(...seasonalValues);
        const minSeasonal = Math.min(...seasonalValues);
        analysis.overallAssessment.seasonalHarmony = 
            (maxSeasonal - minSeasonal) < 0.2 ? 'harmonious' : 
            (maxSeasonal - minSeasonal) < 0.4 ? 'moderate' : 'unbalanced';

        // Culinary balance assessment
        const culinaryElements = ['Fire', 'Water', 'Earth', 'Air'];
        const culinaryBalance = culinaryElements.map(element => elementalProperties[element] || 0);
        const culinaryVariance = Math.max(...culinaryBalance) - Math.min(...culinaryBalance);
        analysis.overallAssessment.culinaryBalance = 
            culinaryVariance < 0.15 ? 'excellent' : 
            culinaryVariance < 0.3 ? 'good' : 
            culinaryVariance < 0.5 ? 'moderate' : 'poor';

        // Generate recommendations
        if (analysis.overallAssessment.seasonalHarmony === 'unbalanced') {
            analysis.recommendations.push('Seasonal elemental balance needs attention - consider seasonal alignment');
        }

        if (analysis.overallAssessment.culinaryBalance === 'poor') {
            analysis.recommendations.push('Culinary elemental balance is poor - focus on complementary elements');
        }

        if (analysis.overallAssessment.balancedElements < 2) {
            analysis.recommendations.push('Most elements are imbalanced - consider elemental harmonization');
        }

        // Element-specific recommendations
        for (const [elementName, elementState] of Object.entries(analysis.elementalStates)) {
            if (elementState.needsAttention) {
                analysis.recommendations.push(`${elementName} element needs strengthening - focus on ${elementState.culinaryProfile.foods.join(', ')}`);
            }
        }

        return analysis;
    },

    /**
     * Zodiac Elemental Correlation Analysis
     * Utilizes ZODIAC_ELEMENTS and DECANS for astrological-elemental insights
     */
    analyzeZodiacElementalCorrelation: (elementalProperties, zodiacSign, context = 'unknown') => {
        const analysis = {
            timestamp: Date.now(),
            context: context,
            zodiacElementalMapping: {},
            decanAnalysis: {},
            astrologicalInsights: {},
            recommendations: []
        };

        if (!validateElementalProperties(elementalProperties)) {
            analysis.recommendations.push('Provide valid elemental properties object');
            return analysis;
        }

        const signElement = ZODIAC_ELEMENTS[zodiacSign];
        if (!signElement) {
            analysis.recommendations.push('Provide valid zodiac sign');
            return analysis;
        }

        // Map zodiac sign to elemental properties
        analysis.zodiacElementalMapping[zodiacSign] = {
            sign: zodiacSign,
            element: signElement,
            elementalStrength: elementalProperties[signElement] || 0,
            alignment: (elementalProperties[signElement] || 0) > 0.3 ? 'strong' : 
                     (elementalProperties[signElement] || 0) > 0.15 ? 'moderate' : 'weak',
            compatibility: calculateElementalCompatibility(
                { [signElement]: 1 },
                elementalProperties
            )
        };

        // Analyze decans for the zodiac sign
        const signDecans = DECANS[zodiacSign];
        if (signDecans) {
            analysis.decanAnalysis[zodiacSign] = {
                decans: signDecans,
                decanElements: signDecans.map(decan => decan.element),
                planetaryRulers: signDecans.map(decan => decan.ruler),
                elementalDistribution: {}
            };

            // Calculate elemental distribution across decans
            for (const decan of signDecans) {
                const element = decan.element;
                analysis.decanAnalysis[zodiacSign].elementalDistribution[element] = 
                    (analysis.decanAnalysis[zodiacSign].elementalDistribution[element] || 0) + 1;
            }
        }

        // Generate astrological insights
        analysis.astrologicalInsights[zodiacSign] = {
            naturalElement: signElement,
            elementalResonance: (elementalProperties[signElement] || 0),
            elementalHarmony: (elementalProperties[signElement] || 0) > 0.25 ? 'harmonious' : 
                            (elementalProperties[signElement] || 0) > 0.1 ? 'moderate' : 'disharmonious',
            recommendedElements: ELEMENT_AFFINITIES[signElement] || [],
            compatibilityScore: analysis.zodiacElementalMapping[zodiacSign].compatibility
        };

        // Generate recommendations based on zodiac-elemental analysis
        if (analysis.zodiacElementalMapping[zodiacSign].alignment === 'weak') {
            analysis.recommendations.push(`Strengthen ${signElement} element for ${zodiacSign} sign harmony`);
        }

        if (analysis.astrologicalInsights[zodiacSign].elementalHarmony === 'disharmonious') {
            analysis.recommendations.push(`Focus on ${signElement} element foods and practices for ${zodiacSign} sign`);
        }

        return analysis;
    },

    /**
     * Elemental Compatibility Intelligence
     * Utilizes ELEMENT_COMBINATIONS and ELEMENT_AFFINITIES for compatibility analysis
     */
    analyzeElementalCompatibility: (properties1, properties2, context = 'unknown') => {
        const analysis = {
            timestamp: Date.now(),
            context: context,
            compatibilityMatrix: {},
            affinityAnalysis: {},
            combinationAnalysis: {},
            overallCompatibility: {
                score: 0,
                level: 'unknown',
                strengths: [],
                weaknesses: [],
                recommendations: []
            }
        };

        if (!validateElementalProperties(properties1) || !validateElementalProperties(properties2)) {
            analysis.recommendations.push('Provide valid elemental properties objects');
            return analysis;
        }

        let totalCompatibility = 0;
        let compatibilityCount = 0;

        // Analyze each element combination
        for (const element of ELEMENTS) {
            const value1 = properties1[element] || 0;
            const value2 = properties2[element] || 0;

            // Same element compatibility (highest)
            const sameElementScore = Math.min(value1, value2) * 0.9;
            
            // Different element compatibility (good but lower)
            const differentElementScore = (1 - Math.abs(value1 - value2)) * 0.7;
            
            const elementCompatibility = sameElementScore + differentElementScore;

            analysis.compatibilityMatrix[element] = {
                element: element,
                value1: value1,
                value2: value2,
                sameElementScore: sameElementScore,
                differentElementScore: differentElementScore,
                totalScore: elementCompatibility,
                compatibility: elementCompatibility > 0.6 ? 'high' : 
                             elementCompatibility > 0.4 ? 'moderate' : 'low'
            };

            totalCompatibility += elementCompatibility;
            compatibilityCount++;
        }

        analysis.overallCompatibility.score = compatibilityCount > 0 ? totalCompatibility / compatibilityCount : 0;
        analysis.overallCompatibility.level = analysis.overallCompatibility.score > 0.7 ? 'excellent' : 
                                           analysis.overallCompatibility.score > 0.5 ? 'good' : 
                                           analysis.overallCompatibility.score > 0.3 ? 'moderate' : 'poor';

        // Analyze harmonious combinations
        for (const combination of ELEMENT_COMBINATIONS.harmonious) {
            const [element1, element2] = combination;
            const value1 = properties1[element1] || 0;
            const value2 = properties2[element2] || 0;
            
            analysis.combinationAnalysis[`${element1}-${element2}`] = {
                type: 'harmonious',
                element1: element1,
                element2: element2,
                value1: value1,
                value2: value2,
                harmonyScore: Math.min(value1, value2) * 0.9
            };
        }

        // Analyze complementary combinations
        for (const combination of ELEMENT_COMBINATIONS.complementary) {
            const [element1, element2] = combination;
            const value1 = properties1[element1] || 0;
            const value2 = properties2[element2] || 0;
            
            analysis.combinationAnalysis[`${element1}-${element2}`] = {
                type: 'complementary',
                element1: element1,
                element2: element2,
                value1: value1,
                value2: value2,
                complementScore: (1 - Math.abs(value1 - value2)) * 0.7
            };
        }

        // Generate recommendations
        if (analysis.overallCompatibility.level === 'poor') {
            analysis.overallCompatibility.recommendations.push('Overall elemental compatibility is poor - consider balancing elements');
        }

        for (const [element, compatibility] of Object.entries(analysis.compatibilityMatrix)) {
            if (compatibility.compatibility === 'low') {
                analysis.overallCompatibility.weaknesses.push(`${element} element compatibility needs improvement`);
            } else if (compatibility.compatibility === 'high') {
                analysis.overallCompatibility.strengths.push(`${element} element compatibility is strong`);
            }
        }

        return analysis;
    }
};

/**
 * ELEMENTAL_OPTIMIZATION_INTELLIGENCE - Advanced elemental optimization utilizing all thresholds and weights
 */
export const ELEMENTAL_OPTIMIZATION_INTELLIGENCE = {
    /**
     * Elemental Balance Optimization
     * Utilizes ELEMENTAL_THRESHOLDS and VALIDATION_THRESHOLDS for optimization
     */
    optimizeElementalBalance: (elementalProperties, targetBalance = 'harmonious', context = 'unknown') => {
        const optimization = {
            timestamp: Date.now(),
            context: context,
            currentState: {},
            targetState: {},
            optimizationPlan: {
                adjustments: {},
                recommendations: [],
                expectedOutcome: 'unknown'
            },
            validation: {
                isValid: false,
                issues: [],
                improvements: []
            }
        };

        if (!validateElementalProperties(elementalProperties)) {
            optimization.validation.issues.push('Invalid elemental properties provided');
            return optimization;
        }

        // Analyze current state
        for (const element of ELEMENTS) {
            const currentValue = elementalProperties[element] || 0;
            
            optimization.currentState[element] = {
                element: element,
                currentValue: currentValue,
                threshold: currentValue >= ELEMENTAL_THRESHOLDS.dominant ? 'dominant' :
                          currentValue >= ELEMENTAL_THRESHOLDS.significant ? 'significant' :
                          currentValue >= ELEMENTAL_THRESHOLDS.present ? 'present' : 'trace',
                weight: ELEMENTAL_WEIGHTS[element],
                needsAdjustment: currentValue < ELEMENTAL_THRESHOLDS.present || currentValue > 0.5
            };
        }

        // Calculate target state based on balance type
        const targetValues = {};
        if (targetBalance === 'harmonious') {
            // Equal distribution
            for (const element of ELEMENTS) {
                targetValues[element] = 0.25;
            }
        } else if (targetBalance === 'dominant') {
            // Strengthen dominant elements
            const dominantElements = Object.entries(elementalProperties)
                .filter(([_, value]) => value >= ELEMENTAL_THRESHOLDS.dominant)
                .map(([element, _]) => element);
            
            for (const element of ELEMENTS) {
                if (dominantElements.includes(element)) {
                    targetValues[element] = 0.4;
                } else {
                    targetValues[element] = 0.2;
                }
            }
        }

        // Calculate adjustments needed
        for (const element of ELEMENTS) {
            const currentValue = elementalProperties[element] || 0;
            const targetValue = targetValues[element] || 0.25;
            const adjustment = targetValue - currentValue;

            optimization.targetState[element] = {
                element: element,
                targetValue: targetValue,
                currentValue: currentValue,
                adjustment: adjustment,
                adjustmentType: adjustment > 0 ? 'increase' : adjustment < 0 ? 'decrease' : 'maintain'
            };

            if (Math.abs(adjustment) > VALIDATION_THRESHOLDS.BALANCE_PRECISION) {
                optimization.optimizationPlan.adjustments[element] = {
                    element: element,
                    adjustment: adjustment,
                    priority: Math.abs(adjustment) > 0.1 ? 'high' : 'medium',
                    method: adjustment > 0 ? 'strengthen' : 'reduce'
                };
            }
        }

        // Generate optimization recommendations
        const highPriorityAdjustments = Object.values(optimization.optimizationPlan.adjustments)
            .filter(adj => adj.priority === 'high');

        if (highPriorityAdjustments.length > 0) {
            optimization.optimizationPlan.recommendations.push('High priority elemental adjustments needed:');
            highPriorityAdjustments.forEach(adj => {
                optimization.optimizationPlan.recommendations.push(
                    `${adj.method} ${adj.element} element by ${Math.abs(adj.adjustment).toFixed(3)}`
                );
            });
        }

        // Validate optimization plan
        const totalAdjustment = Object.values(optimization.optimizationPlan.adjustments)
            .reduce((sum, adj) => sum + Math.abs(adj.adjustment), 0);
        
        optimization.validation.isValid = totalAdjustment <= 0.5; // Reasonable adjustment threshold
        
        if (!optimization.validation.isValid) {
            optimization.validation.issues.push('Optimization adjustments are too large - consider gradual approach');
        }

        optimization.optimizationPlan.expectedOutcome = 
            optimization.validation.isValid ? 'improved_balance' : 'requires_gradual_approach';

        return optimization;
    },

    /**
     * Elemental Threshold Analysis
     * Utilizes ELEMENTAL_THRESHOLDS for comprehensive threshold analysis
     */
    analyzeElementalThresholds: (elementalProperties, context = 'unknown') => {
        const analysis = {
            timestamp: Date.now(),
            context: context,
            thresholdAnalysis: {},
            elementCategories: {
                dominant: [],
                significant: [],
                present: [],
                trace: []
            },
            recommendations: []
        };

        if (!validateElementalProperties(elementalProperties)) {
            analysis.recommendations.push('Provide valid elemental properties object');
            return analysis;
        }

        // Analyze each element against thresholds
        for (const element of ELEMENTS) {
            const value = elementalProperties[element] || 0;
            
            analysis.thresholdAnalysis[element] = {
                element: element,
                value: value,
                category: value >= ELEMENTAL_THRESHOLDS.dominant ? 'dominant' :
                        value >= ELEMENTAL_THRESHOLDS.significant ? 'significant' :
                        value >= ELEMENTAL_THRESHOLDS.present ? 'present' : 'trace',
                distanceFromNext: 0,
                recommendations: []
            };

            // Calculate distance from next threshold
            if (value < ELEMENTAL_THRESHOLDS.present) {
                analysis.thresholdAnalysis[element].distanceFromNext = 
                    ELEMENTAL_THRESHOLDS.present - value;
                analysis.thresholdAnalysis[element].recommendations.push(
                    `Strengthen ${element} element to reach present threshold`
                );
            } else if (value < ELEMENTAL_THRESHOLDS.significant) {
                analysis.thresholdAnalysis[element].distanceFromNext = 
                    ELEMENTAL_THRESHOLDS.significant - value;
                analysis.thresholdAnalysis[element].recommendations.push(
                    `Enhance ${element} element to reach significant threshold`
                );
            } else if (value < ELEMENTAL_THRESHOLDS.dominant) {
                analysis.thresholdAnalysis[element].distanceFromNext = 
                    ELEMENTAL_THRESHOLDS.dominant - value;
                analysis.thresholdAnalysis[element].recommendations.push(
                    `Strengthen ${element} element to reach dominant threshold`
                );
            }

            // Categorize elements
            const category = analysis.thresholdAnalysis[element].category;
            analysis.elementCategories[category].push(element);
        }

        // Generate overall recommendations
        if (analysis.elementCategories.dominant.length === 0) {
            analysis.recommendations.push('No dominant elements detected - consider strengthening primary elements');
        }

        if (analysis.elementCategories.trace.length > 2) {
            analysis.recommendations.push('Multiple elements are at trace levels - focus on elemental balance');
        }

        if (analysis.elementCategories.dominant.length > 1) {
            analysis.recommendations.push('Multiple dominant elements may create imbalance - consider harmonization');
        }

        return analysis;
    }
};
