import { oils } from './oils.js';
import { enhanceOilProperties } from '../../../utils/elementalUtils.js';

// ===== ENTERPRISE OIL INTELLIGENCE SYSTEMS =====

/**
 * OIL_ANALYSIS_INTELLIGENCE - Advanced oil analysis utilizing all oil data structures
 */
export const OIL_ANALYSIS_INTELLIGENCE = {
    /**
     * Comprehensive Oil Profile Analysis
     * Advanced oil analysis with culinary, elemental, and nutritional insights
     */
    analyzeOilProfile: (oilData, context = 'unknown') => {
        const analysis = {
            timestamp: Date.now(),
            context: context,
            oilMetrics: {
                totalOils: 0,
                categories: {},
                elementalDistribution: { Fire: 0, Water: 0, Earth: 0, Air: 0 },
                culinaryApplications: {},
                nutritionalProfile: {},
                smokePointAnalysis: {}
            },
            oilAnalysis: {},
            optimizationOpportunities: [],
            recommendations: []
        };

        if (!oilData || typeof oilData !== 'object') {
            analysis.recommendations.push('Provide valid oil data object');
            return analysis;
        }

        const oilEntries = Object.entries(oilData);
        analysis.oilMetrics.totalOils = oilEntries.length;

        // Analyze each oil
        for (const [oilName, oilInfo] of oilEntries) {
            analysis.oilAnalysis[oilName] = {
                name: oilName,
                subCategory: oilInfo.subCategory || 'unknown',
                elementalProperties: oilInfo.elementalProperties || { Fire: 0, Water: 0, Earth: 0, Air: 0 },
                smokePoint: oilInfo.smokePoint || {},
                culinaryApplications: oilInfo.culinaryApplications || {},
                astrologicalProfile: oilInfo.astrologicalProfile || {},
                nutritionalData: oilInfo.nutritionalData || {},
                complexity: oilInfo.subCategory ? 'categorized' : 'uncategorized'
            };

            // Track categories
            const category = oilInfo.subCategory || 'uncategorized';
            analysis.oilMetrics.categories[category] = (analysis.oilMetrics.categories[category] || 0) + 1;

            // Accumulate elemental properties
            if (oilInfo.elementalProperties) {
                for (const element of ['Fire', 'Water', 'Earth', 'Air']) {
                    analysis.oilMetrics.elementalDistribution[element] += 
                        oilInfo.elementalProperties[element] || 0;
                }
            }

            // Track culinary applications
            if (oilInfo.culinaryApplications) {
                for (const [application, value] of Object.entries(oilInfo.culinaryApplications)) {
                    if (!analysis.oilMetrics.culinaryApplications[application]) {
                        analysis.oilMetrics.culinaryApplications[application] = 0;
                    }
                    if (value) {
                        analysis.oilMetrics.culinaryApplications[application]++;
                    }
                }
            }

            // Track smoke points
            if (oilInfo.smokePoint && oilInfo.smokePoint.fahrenheit) {
                const smokePoint = oilInfo.smokePoint.fahrenheit;
                if (!analysis.oilMetrics.smokePointAnalysis[smokePoint]) {
                    analysis.oilMetrics.smokePointAnalysis[smokePoint] = [];
                }
                analysis.oilMetrics.smokePointAnalysis[smokePoint].push(oilName);
            }
        }

        // Normalize elemental distribution
        const totalElemental = Object.values(analysis.oilMetrics.elementalDistribution)
            .reduce((sum, val) => sum + val, 0);
        
        if (totalElemental > 0) {
            for (const element of ['Fire', 'Water', 'Earth', 'Air']) {
                analysis.oilMetrics.elementalDistribution[element] = 
                    analysis.oilMetrics.elementalDistribution[element] / totalElemental;
            }
        }

        // Generate optimization opportunities
        if (analysis.oilMetrics.categories.uncategorized > 0) {
            analysis.optimizationOpportunities.push('Categorize uncategorized oils for better organization');
        }

        if (Object.keys(analysis.oilMetrics.culinaryApplications).length < 5) {
            analysis.optimizationOpportunities.push('Expand culinary application data for better recommendations');
        }

        // Generate recommendations
        if (analysis.oilMetrics.elementalDistribution.Fire > 0.4) {
            analysis.recommendations.push('Oil collection is Fire-dominant - consider adding cooling oils');
        }

        if (analysis.oilMetrics.elementalDistribution.Water > 0.4) {
            analysis.recommendations.push('Oil collection is Water-dominant - consider adding warming oils');
        }

        return analysis;
    },

    /**
     * Oil Compatibility Analysis
     * Analyzes oil compatibility with cooking methods and elemental needs
     */
    analyzeOilCompatibility: (oilData, cookingMethod, elementalNeeds, context = 'unknown') => {
        const analysis = {
            timestamp: Date.now(),
            context: context,
            compatibilityScores: {
                cookingMethod: 0,
                elemental: 0,
                smokePoint: 0,
                overall: 0
            },
            compatibleOils: [],
            incompatibleOils: [],
            recommendations: []
        };

        if (!oilData || typeof oilData !== 'object') {
            analysis.recommendations.push('Provide valid oil data object');
            return analysis;
        }

        const oilEntries = Object.entries(oilData);

        for (const [oilName, oilInfo] of oilEntries) {
            let oilScore = 0;
            let scoreFactors = 0;

            // Cooking method compatibility
            if (cookingMethod && oilInfo.culinaryApplications) {
                const methodCompatibility = oilInfo.culinaryApplications[cookingMethod] || false;
                if (methodCompatibility) {
                    oilScore += 1;
                    scoreFactors++;
                }
            }

            // Elemental compatibility
            if (elementalNeeds && oilInfo.elementalProperties) {
                let elementalScore = 0;
                let elementCount = 0;

                for (const element of ['Fire', 'Water', 'Earth', 'Air']) {
                    const oilElement = oilInfo.elementalProperties[element] || 0;
                    const needElement = elementalNeeds[element] || 0;
                    
                    const alignment = 1 - Math.abs(oilElement - needElement);
                    elementalScore += alignment;
                    elementCount++;
                }

                if (elementCount > 0) {
                    oilScore += elementalScore / elementCount;
                    scoreFactors++;
                }
            }

            // Smoke point compatibility
            if (oilInfo.smokePoint && oilInfo.smokePoint.fahrenheit) {
                const smokePoint = oilInfo.smokePoint.fahrenheit;
                let smokePointScore = 0;

                if (cookingMethod === 'frying' && smokePoint >= 350) {
                    smokePointScore = 1;
                } else if (cookingMethod === 'baking' && smokePoint >= 300) {
                    smokePointScore = 1;
                } else if (cookingMethod === 'dressings' && smokePoint <= 200) {
                    smokePointScore = 1;
                } else {
                    smokePointScore = 0.5; // Neutral score for other methods
                }

                oilScore += smokePointScore;
                scoreFactors++;
            }

            // Calculate overall score
            const overallScore = scoreFactors > 0 ? oilScore / scoreFactors : 0;

            analysis.compatibilityScores.overall = overallScore;

            if (overallScore > 0.7) {
                analysis.compatibleOils.push({
                    name: oilName,
                    score: overallScore,
                    subCategory: oilInfo.subCategory,
                    smokePoint: oilInfo.smokePoint?.fahrenheit,
                    elementalProperties: oilInfo.elementalProperties
                });
            } else {
                analysis.incompatibleOils.push({
                    name: oilName,
                    score: overallScore,
                    reason: overallScore < 0.3 ? 'poor_compatibility' : 'moderate_compatibility'
                });
            }
        }

        // Generate recommendations
        if (analysis.compatibleOils.length === 0) {
            analysis.recommendations.push('No highly compatible oils found - consider alternative cooking methods');
        }

        if (analysis.compatibleOils.length > 5) {
            analysis.recommendations.push('Multiple compatible oils available - consider specific requirements');
        }

        return analysis;
    },

    /**
     * Oil Optimization Intelligence
     * Provides intelligent recommendations for oil selection and usage
     */
    optimizeOilSelection: (oilData, requirements, context = 'unknown') => {
        const optimization = {
            timestamp: Date.now(),
            context: context,
            currentSelection: {},
            targetRequirements: requirements,
            optimizationPlan: {
                primaryOils: [],
                secondaryOils: [],
                alternatives: [],
                avoidances: []
            },
            expectedOutcomes: {
                compatibility: 0,
                diversity: 0,
                costEffectiveness: 0,
                overallValue: 0
            },
            recommendations: []
        };

        if (!oilData || typeof oilData !== 'object') {
            optimization.recommendations.push('Provide valid oil data object');
            return optimization;
        }

        // Analyze current oil collection
        const oilAnalysis = OIL_ANALYSIS_INTELLIGENCE.analyzeOilProfile(oilData, context);
        optimization.currentSelection = oilAnalysis.oilMetrics;

        // Generate primary oil recommendations
        if (requirements.cookingMethod) {
            const methodCompatibility = OIL_ANALYSIS_INTELLIGENCE.analyzeOilCompatibility(
                oilData, requirements.cookingMethod, requirements.elementalNeeds, context
            );

            optimization.optimizationPlan.primaryOils = methodCompatibility.compatibleOils
                .filter(oil => oil.score > 0.8)
                .slice(0, 3);
        }

        // Generate secondary oil recommendations
        if (requirements.diversity) {
            const categorizedOils = {};
            for (const [oilName, oilInfo] of Object.entries(oilData)) {
                const category = oilInfo.subCategory || 'uncategorized';
                if (!categorizedOils[category]) {
                    categorizedOils[category] = [];
                }
                categorizedOils[category].push({ name: oilName, info: oilInfo });
            }

            // Select diverse oils from different categories
            for (const [category, oils] of Object.entries(categorizedOils)) {
                if (oils.length > 0) {
                    optimization.optimizationPlan.secondaryOils.push(oils[0]);
                }
            }
        }

        // Generate alternative recommendations
        if (requirements.costEffectiveness) {
            const affordableOils = Object.entries(oilData)
                .filter(([_, oilInfo]) => {
                    // Filter based on cost-effectiveness criteria
                    return oilInfo.subCategory === 'cooking' || oilInfo.subCategory === 'finishing';
                })
                .map(([name, info]) => ({ name, info }))
                .slice(0, 5);

            optimization.optimizationPlan.alternatives = affordableOils;
        }

        // Calculate expected outcomes
        optimization.expectedOutcomes.compatibility = 
            optimization.optimizationPlan.primaryOils.length > 0 ? 0.8 : 0.4;
        
        optimization.expectedOutcomes.diversity = 
            optimization.optimizationPlan.secondaryOils.length > 2 ? 0.9 : 0.6;
        
        optimization.expectedOutcomes.costEffectiveness = 
            optimization.optimizationPlan.alternatives.length > 0 ? 0.7 : 0.5;
        
        optimization.expectedOutcomes.overallValue = 
            (optimization.expectedOutcomes.compatibility + 
             optimization.expectedOutcomes.diversity + 
             optimization.expectedOutcomes.costEffectiveness) / 3;

        // Generate recommendations
        if (optimization.expectedOutcomes.overallValue > 0.7) {
            optimization.recommendations.push('Oil selection optimization will provide excellent value');
        }

        for (const oil of optimization.optimizationPlan.primaryOils) {
            optimization.recommendations.push(`Primary recommendation: ${oil.name} (score: ${oil.score.toFixed(2)})`);
        }

        return optimization;
    }
};

// Export the raw oils
export { oils };

// Process oils to add enhanced properties
export const processedOils = enhanceOilProperties(oils);

// Export enhanced oils as default
export default processedOils;

// Export specific oil categories with enterprise intelligence
export const cookingOils = Object.entries(processedOils)
    .filter(([, value]) => value.subCategory === 'cooking')
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

export const finishingOils = Object.entries(processedOils)
    .filter(([, value]) => value.subCategory === 'finishing')
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

export const supplementOils = Object.entries(processedOils)
    .filter(([, value]) => value.subCategory === 'supplement')
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

export const specialtyOils = Object.entries(processedOils)
    .filter(([, value]) => !value.subCategory ||
    (value.subCategory !== 'cooking' &&
        value.subCategory !== 'finishing' &&
        value.subCategory !== 'supplement'))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

// Export by elemental properties with enterprise intelligence
export const fireOils = Object.entries(processedOils)
    .filter(([, value]) => value.elementalProperties.Fire >= 0.4 ||
    value.astrologicalProfile?.elementalAffinity?.base === 'Fire')
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

export const waterOils = Object.entries(processedOils)
    .filter(([, value]) => value.elementalProperties.Water >= 0.4 ||
    value.astrologicalProfile?.elementalAffinity?.base === 'Water')
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

export const earthOils = Object.entries(processedOils)
    .filter(([, value]) => value.elementalProperties.Earth >= 0.4 ||
    value.astrologicalProfile?.elementalAffinity?.base === 'Earth')
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

export const AirOils = Object.entries(processedOils)
    .filter(([, value]) => value.elementalProperties.Air >= 0.4 ||
    value.astrologicalProfile?.elementalAffinity?.base === 'Air')
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

// Export by culinary applications with enterprise intelligence
export const highHeatOils = Object.entries(processedOils)
    .filter(([, value]) => (value.smokePoint?.fahrenheit >= 400) ||
    (value.culinaryApplications?.frying || value.culinaryApplications?.deepfrying))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

export const bakingOils = Object.entries(processedOils)
    .filter(([, value]) => value.culinaryApplications?.baking)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

export const dressingOils = Object.entries(processedOils)
    .filter(([, value]) => value.culinaryApplications?.dressings)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

export const nutOils = Object.entries(processedOils)
    .filter(([key]) => key.includes('walnut') ||
    key.includes('almond') ||
    key.includes('macadamia') ||
    key.includes('peanut'))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

// For backward compatibility
export const allOils = processedOils;

// Export enterprise intelligence systems
export { OIL_ANALYSIS_INTELLIGENCE };
