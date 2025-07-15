import type { Recipe } from '@/types/recipe';

// ===== ENTERPRISE RECIPE INTELLIGENCE SYSTEMS =====

/**
 * RECIPE_ANALYSIS_INTELLIGENCE - Advanced recipe analysis and optimization
 */
export const RECIPE_ANALYSIS_INTELLIGENCE = {
    /**
     * Comprehensive Recipe Profile Analysis
     * Advanced recipe analysis with nutritional, elemental, and culinary insights
     */
    analyzeRecipeProfile: (recipe: Recipe, context = 'unknown') => {
        const analysis = {
            timestamp: Date.now(),
            context: context,
            recipeMetrics: {
                ingredientCount: 0,
                complexityScore: 0,
                nutritionalDensity: 0,
                elementalBalance: { Fire: 0, Water: 0, Earth: 0, Air: 0 },
                culinaryProfile: {
                    cookingMethods: [],
                    flavorProfiles: [],
                    cuisineType: 'unknown',
                    difficultyLevel: 'unknown'
                }
            },
            ingredientAnalysis: {},
            nutritionalAnalysis: {},
            elementalAnalysis: {},
            optimizationOpportunities: [],
            recommendations: []
        };

        if (!validateRecipe(recipe)) {
            analysis.recommendations.push('Provide valid recipe object');
            return analysis;
        }

        // Analyze ingredients
        if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
            analysis.recipeMetrics.ingredientCount = recipe.ingredients.length;
            
            for (const ingredient of recipe.ingredients) {
                const ingredientName = typeof ingredient === 'string' ? ingredient : ingredient.name || 'unknown';
                
                analysis.ingredientAnalysis[ingredientName] = {
                    name: ingredientName,
                    type: typeof ingredient,
                    hasNutritionalData: ingredient && typeof ingredient === 'object' && 'nutrition' in ingredient,
                    hasElementalData: ingredient && typeof ingredient === 'object' && 'elementalProperties' in ingredient,
                    complexity: ingredient && typeof ingredient === 'object' ? 'complex' : 'simple'
                };

                // Accumulate elemental properties if available
                if (ingredient && typeof ingredient === 'object' && ingredient.elementalProperties) {
                    for (const element of ['Fire', 'Water', 'Earth', 'Air']) {
                        analysis.recipeMetrics.elementalBalance[element] += 
                            ingredient.elementalProperties[element] || 0;
                    }
                }

                // Track cooking methods
                if (ingredient && typeof ingredient === 'object' && ingredient.cookingMethods) {
                    analysis.recipeMetrics.culinaryProfile.cookingMethods.push(
                        ...ingredient.cookingMethods
                    );
                }

                // Track flavor profiles
                if (ingredient && typeof ingredient === 'object' && ingredient.flavorProfiles) {
                    analysis.recipeMetrics.culinaryProfile.flavorProfiles.push(
                        ...ingredient.flavorProfiles
                    );
                }
            }
        }

        // Calculate complexity score
        analysis.recipeMetrics.complexityScore = 
            analysis.recipeMetrics.ingredientCount * 0.3 + 
            (analysis.recipeMetrics.culinaryProfile.cookingMethods.length * 0.2) +
            (analysis.recipeMetrics.culinaryProfile.flavorProfiles.length * 0.1);

        // Determine difficulty level
        analysis.recipeMetrics.culinaryProfile.difficultyLevel = 
            analysis.recipeMetrics.complexityScore > 2 ? 'advanced' :
            analysis.recipeMetrics.complexityScore > 1 ? 'intermediate' : 'beginner';

        // Analyze nutritional aspects
        if (recipe.nutrition) {
            analysis.nutritionalAnalysis = {
                calories: recipe.nutrition.calories || 0,
                protein: recipe.nutrition.protein || 0,
                carbohydrates: recipe.nutrition.carbohydrates || 0,
                fat: recipe.nutrition.fat || 0,
                fiber: recipe.nutrition.fiber || 0,
                nutritionalDensity: 0
            };

            // Calculate nutritional density
            const totalNutrients = analysis.nutritionalAnalysis.protein + 
                                 analysis.nutritionalAnalysis.carbohydrates + 
                                 analysis.nutritionalAnalysis.fat;
            
            analysis.nutritionalAnalysis.nutritionalDensity = 
                totalNutrients > 0 ? analysis.nutritionalAnalysis.calories / totalNutrients : 0;
        }

        // Analyze elemental balance
        const totalElemental = Object.values(analysis.recipeMetrics.elementalBalance)
            .reduce((sum, val) => sum + val, 0);
        
        if (totalElemental > 0) {
            for (const element of ['Fire', 'Water', 'Earth', 'Air']) {
                analysis.recipeMetrics.elementalBalance[element] = 
                    analysis.recipeMetrics.elementalBalance[element] / totalElemental;
            }
        }

        // Generate optimization opportunities
        if (analysis.recipeMetrics.ingredientCount < 3) {
            analysis.optimizationOpportunities.push('Consider adding more ingredients for complexity');
        }

        if (analysis.recipeMetrics.culinaryProfile.cookingMethods.length < 2) {
            analysis.optimizationOpportunities.push('Consider diversifying cooking methods');
        }

        if (analysis.nutritionalAnalysis && analysis.nutritionalAnalysis.nutritionalDensity < 2) {
            analysis.optimizationOpportunities.push('Consider enhancing nutritional density');
        }

        // Generate recommendations
        if (analysis.recipeMetrics.complexityScore > 3) {
            analysis.recommendations.push('Recipe is complex - consider simplifying for accessibility');
        }

        if (analysis.recipeMetrics.elementalBalance.Fire > 0.4) {
            analysis.recommendations.push('Recipe is Fire-dominant - consider balancing with cooling elements');
        }

        if (analysis.recipeMetrics.elementalBalance.Water > 0.4) {
            analysis.recommendations.push('Recipe is Water-dominant - consider adding warming elements');
        }

        return analysis;
    },

    /**
     * Recipe Compatibility Analysis
     * Analyzes recipe compatibility with dietary preferences and elemental needs
     */
    analyzeRecipeCompatibility: (recipe: Recipe, preferences: any, context = 'unknown') => {
        const analysis = {
            timestamp: Date.now(),
            context: context,
            compatibilityScores: {
                dietary: 0,
                elemental: 0,
                nutritional: 0,
                overall: 0
            },
            dietaryCompliance: {},
            elementalAlignment: {},
            nutritionalMatch: {},
            recommendations: []
        };

        if (!validateRecipe(recipe)) {
            analysis.recommendations.push('Provide valid recipe object');
            return analysis;
        }

        // Analyze dietary compatibility
        if (preferences.dietaryRestrictions) {
            const restrictions = preferences.dietaryRestrictions;
            let dietaryScore = 0;
            let restrictionCount = 0;

            for (const restriction of restrictions) {
                const isCompliant = !recipe.ingredients?.some(ingredient => {
                    const ingredientName = typeof ingredient === 'string' ? ingredient : ingredient.name || '';
                    return ingredientName.toLowerCase().includes(restriction.toLowerCase());
                });

                analysis.dietaryCompliance[restriction] = {
                    restriction: restriction,
                    compliant: isCompliant,
                    score: isCompliant ? 1 : 0
                };

                dietaryScore += isCompliant ? 1 : 0;
                restrictionCount++;
            }

            analysis.compatibilityScores.dietary = restrictionCount > 0 ? dietaryScore / restrictionCount : 1;
        }

        // Analyze elemental alignment
        if (preferences.elementalNeeds && recipe.elementalProperties) {
            let elementalScore = 0;
            let elementCount = 0;

            for (const element of ['Fire', 'Water', 'Earth', 'Air']) {
                const recipeElement = recipe.elementalProperties[element] || 0;
                const preferenceElement = preferences.elementalNeeds[element] || 0;
                
                const alignment = 1 - Math.abs(recipeElement - preferenceElement);
                elementalScore += alignment;
                elementCount++;

                analysis.elementalAlignment[element] = {
                    element: element,
                    recipeValue: recipeElement,
                    preferenceValue: preferenceElement,
                    alignment: alignment,
                    status: alignment > 0.8 ? 'excellent' : alignment > 0.6 ? 'good' : 'needs_improvement'
                };
            }

            analysis.compatibilityScores.elemental = elementCount > 0 ? elementalScore / elementCount : 0;
        }

        // Analyze nutritional match
        if (preferences.nutritionalGoals && recipe.nutrition) {
            let nutritionalScore = 0;
            let goalCount = 0;

            for (const [goal, target] of Object.entries(preferences.nutritionalGoals)) {
                const recipeValue = recipe.nutrition[goal] || 0;
                const match = target > 0 ? Math.min(recipeValue / target, 1) : 1;
                
                nutritionalScore += match;
                goalCount++;

                analysis.nutritionalMatch[goal] = {
                    goal: goal,
                    target: target,
                    actual: recipeValue,
                    match: match,
                    status: match > 0.8 ? 'excellent' : match > 0.6 ? 'good' : 'needs_improvement'
                };
            }

            analysis.compatibilityScores.nutritional = goalCount > 0 ? nutritionalScore / goalCount : 0;
        }

        // Calculate overall compatibility
        const scores = Object.values(analysis.compatibilityScores).filter(score => score > 0);
        analysis.compatibilityScores.overall = scores.length > 0 ? 
            scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;

        // Generate recommendations
        if (analysis.compatibilityScores.overall < 0.6) {
            analysis.recommendations.push('Overall compatibility is low - consider recipe modifications');
        }

        for (const [element, alignment] of Object.entries(analysis.elementalAlignment)) {
            if (alignment.status === 'needs_improvement') {
                analysis.recommendations.push(`Improve ${element} element alignment for better compatibility`);
            }
        }

        return analysis;
    },

    /**
     * Recipe Optimization Intelligence
     * Provides intelligent recommendations for recipe improvement
     */
    optimizeRecipe: (recipe: Recipe, targetProfile: any, context = 'unknown') => {
        const optimization = {
            timestamp: Date.now(),
            context: context,
            currentProfile: {},
            targetProfile: targetProfile,
            optimizationPlan: {
                ingredientAdjustments: [],
                cookingMethodEnhancements: [],
                nutritionalImprovements: [],
                elementalBalancing: []
            },
            expectedOutcomes: {
                complexityChange: 0,
                nutritionalImprovement: 0,
                elementalBalance: 0,
                overallEnhancement: 0
            },
            recommendations: []
        };

        if (!validateRecipe(recipe)) {
            optimization.recommendations.push('Provide valid recipe object');
            return optimization;
        }

        // Analyze current recipe profile
        const currentAnalysis = RECIPE_ANALYSIS_INTELLIGENCE.analyzeRecipeProfile(recipe, context);
        optimization.currentProfile = currentAnalysis.recipeMetrics;

        // Generate ingredient adjustments
        if (targetProfile.ingredientCount && currentAnalysis.recipeMetrics.ingredientCount < targetProfile.ingredientCount) {
            const needed = targetProfile.ingredientCount - currentAnalysis.recipeMetrics.ingredientCount;
            optimization.optimizationPlan.ingredientAdjustments.push({
                type: 'add_ingredients',
                count: needed,
                priority: 'medium',
                description: `Add ${needed} more ingredients to reach target complexity`
            });
        }

        // Generate cooking method enhancements
        if (targetProfile.cookingMethods && currentAnalysis.recipeMetrics.culinaryProfile.cookingMethods.length < targetProfile.cookingMethods) {
            optimization.optimizationPlan.cookingMethodEnhancements.push({
                type: 'diversify_methods',
                current: currentAnalysis.recipeMetrics.culinaryProfile.cookingMethods.length,
                target: targetProfile.cookingMethods,
                priority: 'medium',
                description: 'Diversify cooking methods for enhanced culinary profile'
            });
        }

        // Generate nutritional improvements
        if (targetProfile.nutritionalDensity && currentAnalysis.nutritionalAnalysis.nutritionalDensity < targetProfile.nutritionalDensity) {
            optimization.optimizationPlan.nutritionalImprovements.push({
                type: 'enhance_nutrition',
                current: currentAnalysis.nutritionalAnalysis.nutritionalDensity,
                target: targetProfile.nutritionalDensity,
                priority: 'high',
                description: 'Enhance nutritional density through ingredient selection'
            });
        }

        // Generate elemental balancing
        if (targetProfile.elementalBalance) {
            for (const element of ['Fire', 'Water', 'Earth', 'Air']) {
                const current = currentAnalysis.recipeMetrics.elementalBalance[element];
                const target = targetProfile.elementalBalance[element];
                
                if (Math.abs(current - target) > 0.1) {
                    optimization.optimizationPlan.elementalBalancing.push({
                        element: element,
                        current: current,
                        target: target,
                        adjustment: target - current,
                        priority: 'medium',
                        description: `Adjust ${element} element from ${current.toFixed(2)} to ${target.toFixed(2)}`
                    });
                }
            }
        }

        // Calculate expected outcomes
        optimization.expectedOutcomes.complexityChange = 
            optimization.optimizationPlan.ingredientAdjustments.length > 0 ? 0.2 : 0;
        
        optimization.expectedOutcomes.nutritionalImprovement = 
            optimization.optimizationPlan.nutritionalImprovements.length > 0 ? 0.3 : 0;
        
        optimization.expectedOutcomes.elementalBalance = 
            optimization.optimizationPlan.elementalBalancing.length > 0 ? 0.25 : 0;
        
        optimization.expectedOutcomes.overallEnhancement = 
            (optimization.expectedOutcomes.complexityChange + 
             optimization.expectedOutcomes.nutritionalImprovement + 
             optimization.expectedOutcomes.elementalBalance) / 3;

        // Generate recommendations
        if (optimization.expectedOutcomes.overallEnhancement > 0.2) {
            optimization.recommendations.push('Recipe optimization will provide significant improvements');
        }

        for (const adjustment of optimization.optimizationPlan.ingredientAdjustments) {
            optimization.recommendations.push(adjustment.description);
        }

        return optimization;
    }
};

// Enhanced utility functions with enterprise intelligence
function processRecipes(recipes: Recipe[]): Recipe[] {
    const processedRecipes = [];
    
    for (const recipe of recipes) {
        if (validateRecipe(recipe)) {
            // Apply enterprise intelligence processing
            const analysis = RECIPE_ANALYSIS_INTELLIGENCE.analyzeRecipeProfile(recipe, 'batch_processing');
            
            // Enhance recipe with analysis data
            const enhancedRecipe = {
                ...recipe,
                analysis: analysis,
                processedAt: Date.now()
            };
            
            processedRecipes.push(enhancedRecipe);
        }
    }
    
    return processedRecipes;
}

// Enhanced type guard with enterprise intelligence
function validateRecipe(recipe: Recipe): boolean {
    if (recipe?.ingredients && Array.isArray(recipe.ingredients)) {
        // Enhanced validation with enterprise intelligence
        const validation = {
            hasIngredients: recipe.ingredients.length > 0,
            hasValidStructure: true,
            hasNutritionalData: !!recipe.nutrition,
            hasElementalData: !!recipe.elementalProperties,
            complexityScore: recipe.ingredients.length * 0.3
        };
        
        return validation.hasIngredients && validation.hasValidStructure;
    }
    return false;
}

// Enterprise intelligence match scoring system
const _matchScore = {
    calculateRecipeMatch: (recipe: Recipe, preferences: any): number => {
        if (!validateRecipe(recipe)) return 0;
        
        const compatibility = RECIPE_ANALYSIS_INTELLIGENCE.analyzeRecipeCompatibility(recipe, preferences, 'match_scoring');
        return compatibility.compatibilityScores.overall;
    },
    
    calculateElementalMatch: (recipe: Recipe, elementalNeeds: any): number => {
        if (!recipe.elementalProperties || !elementalNeeds) return 0;
        
        let matchScore = 0;
        let elementCount = 0;
        
        for (const element of ['Fire', 'Water', 'Earth', 'Air']) {
            const recipeElement = recipe.elementalProperties[element] || 0;
            const needElement = elementalNeeds[element] || 0;
            
            matchScore += 1 - Math.abs(recipeElement - needElement);
            elementCount++;
        }
        
        return elementCount > 0 ? matchScore / elementCount : 0;
    },
    
    calculateNutritionalMatch: (recipe: Recipe, nutritionalGoals: any): number => {
        if (!recipe.nutrition || !nutritionalGoals) return 0;
        
        let matchScore = 0;
        let goalCount = 0;
        
        for (const [goal, target] of Object.entries(nutritionalGoals)) {
            const actual = recipe.nutrition[goal] || 0;
            const match = target > 0 ? Math.min(actual / target, 1) : 1;
            
            matchScore += match;
            goalCount++;
        }
        
        return goalCount > 0 ? matchScore / goalCount : 0;
    }
};

export { processRecipes, validateRecipe, RECIPE_ANALYSIS_INTELLIGENCE, _matchScore }; 