import React, { useMemo } from 'react';
import { ElementalCalculator } from '@/services/ElementalCalculator';
import type { IngredientCategory } from '@/types/ingredients';
import { Ingredient, NutritionalProfile, ElementalProperties } from '@/types/alchemy';
import { VALID_CATEGORIES } from '@/data/ingredients';

interface ExtendedIngredient extends Ingredient {
    nutritionalProfile?: NutritionalProfile;
}

interface IngredientRecommendationsProps {
    ingredients: Record<string, Ingredient[]>;
    elementFilter?: keyof ElementalProperties;
    harmonyThreshold?: number;
}

export const IngredientRecommendations: React.FC<IngredientRecommendationsProps> = ({
    ingredients,
    elementFilter,
    harmonyThreshold = 0.7
}) => {
    const currentBalance = ElementalCalculator.getCurrentElementalState();

    const filteredIngredients = useMemo(() => {
        return Object.entries(ingredients).reduce((acc, [category, items]) => {
            const filtered = items.filter(ingredient => {
                // Use type guard to ensure ingredient has elementalProperties
                const hasElementalProps = !!ingredient.elementalProperties;
                
                // Use a safe calculation that falls back to default harmony
                let score = 0.5; // Default middle score
                
                // Only calculate score if ingredient has proper structure
                if (hasElementalProps && ingredient.elementalProperties) {
                    try {
                        // Calculate the elemental match score
                        score = ElementalCalculator.calculateMatchScore({
                            elementalProperties: ingredient.elementalProperties
                        }) / 100;
                
                        // Check element filter if present
                        if (elementFilter && ingredient.elementalProperties) {
                            const elementValue = ingredient.elementalProperties[elementFilter];
                            if (!elementValue || elementValue <= 0.2) return false;
                        }
                        
                        // Calculate nutritional balance if available
                        if (ingredient.nutritionalProfile) {
                            const nutrition = ingredient.nutritionalProfile;
                            
                            // Calculate protein density (protein per calorie)
                            const proteinDensity = nutrition.calories > 0 ? 
                                (nutrition.macros.protein / nutrition.calories) : 0;
                                
                            // Calculate fiber density (fiber per calorie)
                            const fiberDensity = nutrition.calories > 0 ? 
                                (nutrition.macros.fiber / nutrition.calories) : 0;
                                
                            // Calculate vitamin/mineral richness
                            const vitaminCount = Object.keys(nutrition.vitamins || {}).length;
                            const mineralCount = Object.keys(nutrition.minerals || {}).length;
                            const micronutrientScore = (vitaminCount + mineralCount) / 20; // Normalized to ~0-1 range
                            
                            // Calculate phytonutrient score
                            const phytonutrientScore = Object.keys(nutrition.phytonutrients || {}).length / 10; // Normalized to ~0-1 range
                            
                            // Calculate macronutrient balance based on ratios
                            const totalMacros = nutrition.macros.protein + nutrition.macros.carbs + nutrition.macros.fat;
                            let macroBalanceScore = 0.5;
                            
                            if (totalMacros > 0) {
                                const proteinRatio = nutrition.macros.protein / totalMacros;
                                const carbsRatio = nutrition.macros.carbs / totalMacros;
                                const fatRatio = nutrition.macros.fat / totalMacros;
                                
                                // Define ideal targets for ratios
                                const idealProtein = 0.25; // 25%
                                const idealCarbs = 0.5;    // 50% 
                                const idealFat = 0.25;     // 25%
                                
                                // Calculate deviation from ideal ratios
                                const proteinDeviation = Math.abs(proteinRatio - idealProtein);
                                const carbsDeviation = Math.abs(carbsRatio - idealCarbs);
                                const fatDeviation = Math.abs(fatRatio - idealFat);
                                
                                // Lower deviation = better balance
                                const totalDeviation = proteinDeviation + carbsDeviation + fatDeviation;
                                macroBalanceScore = 1 - Math.min(1, totalDeviation / 2);
                            }
                            
                            // Combine all nutritional factors
                            const nutritionalScore = (
                                proteinDensity * 0.3 + 
                                fiberDensity * 0.2 + 
                                micronutrientScore * 0.2 + 
                                phytonutrientScore * 0.1 + 
                                macroBalanceScore * 0.2
                            );
                            
                            // Normalize to 0-1 range
                            const normalizedNutritionScore = Math.min(1, Math.max(0, nutritionalScore));
                            
                            // Combine elemental and nutritional scores
                            score = (score * 0.7) + (normalizedNutritionScore * 0.3);
                        }
                    } catch (e) {
                        console.warn(`Could not calculate score for ${ingredient.name}`, e);
                    }
                }

                // Check harmony threshold
                return score >= harmonyThreshold;
            });

            if (filtered.length > 0) {
                acc[category] = filtered;
            }
            return acc;
        }, {} as Record<string, Ingredient[]>);
    }, [ingredients, elementFilter, harmonyThreshold]);

    if (Object.keys(ingredients).length === 0) {
        return <div data-testid="empty-ingredients">No ingredients available</div>;
    }

    return (
        <div className="ingredient-recommendations">
            {Object.entries(filteredIngredients).map(([category, items]) => (
                <div key={category} className="category-section">
                    <h3>{category}</h3>
                    <div className="ingredients-grid">
                        {items.map((ingredient, index) => {
                            // Calculate display score
                            const elementalScore = ingredient.elementalProperties ? 
                                ElementalCalculator.calculateMatchScore({
                                    elementalProperties: ingredient.elementalProperties
                                }) / 100 : 0;
                            
                            // Calculate additional nutritional score if available
                            let nutritionalScore = 0;
                            if (ingredient.nutritionalProfile) {
                                const nutrition = ingredient.nutritionalProfile;
                                
                                // Calculate protein density (protein per calorie)
                                const proteinDensity = nutrition.calories > 0 ? 
                                    (nutrition.macros.protein / nutrition.calories) : 0;
                                    
                                // Calculate fiber density (fiber per calorie)
                                const fiberDensity = nutrition.calories > 0 ? 
                                    (nutrition.macros.fiber / nutrition.calories) : 0;
                                    
                                // Calculate vitamin/mineral richness
                                const vitaminCount = Object.keys(nutrition.vitamins || {}).length;
                                const mineralCount = Object.keys(nutrition.minerals || {}).length;
                                const micronutrientScore = (vitaminCount + mineralCount) / 20; // Normalized to ~0-1 range
                                
                                // Calculate phytonutrient score
                                const phytonutrientScore = Object.keys(nutrition.phytonutrients || {}).length / 10; // Normalized to ~0-1 range
                                
                                // Calculate macronutrient balance based on ratios
                                const totalMacros = nutrition.macros.protein + nutrition.macros.carbs + nutrition.macros.fat;
                                let macroBalanceScore = 0.5;
                                
                                if (totalMacros > 0) {
                                    const proteinRatio = nutrition.macros.protein / totalMacros;
                                    const carbsRatio = nutrition.macros.carbs / totalMacros;
                                    const fatRatio = nutrition.macros.fat / totalMacros;
                                    
                                    // Define ideal targets for ratios
                                    const idealProtein = 0.25; // 25%
                                    const idealCarbs = 0.5;    // 50% 
                                    const idealFat = 0.25;     // 25%
                                    
                                    // Calculate deviation from ideal ratios
                                    const proteinDeviation = Math.abs(proteinRatio - idealProtein);
                                    const carbsDeviation = Math.abs(carbsRatio - idealCarbs);
                                    const fatDeviation = Math.abs(fatRatio - idealFat);
                                    
                                    // Lower deviation = better balance
                                    const totalDeviation = proteinDeviation + carbsDeviation + fatDeviation;
                                    macroBalanceScore = 1 - Math.min(1, totalDeviation / 2);
                                }
                                
                                // Combine all nutritional factors
                                nutritionalScore = (
                                    proteinDensity * 0.3 + 
                                    fiberDensity * 0.2 + 
                                    micronutrientScore * 0.2 + 
                                    phytonutrientScore * 0.1 + 
                                    macroBalanceScore * 0.2
                                );
                                
                                // Normalize to 0-1 range
                                nutritionalScore = Math.min(1, Math.max(0, nutritionalScore));
                            }
                            
                            // Combined score for display
                            const displayScore = Math.round((elementalScore * 0.7 + nutritionalScore * 0.3) * 100);
                            
                            return (
                            <div
                                key={`${ingredient.name}-${index}`}
                                className="ingredient-item recommended"
                                data-testid="recommended-ingredient"
                                    data-harmony-score={elementalScore}
                            >
                                <h4>{ingredient.name}</h4>
                                <div className="elemental-properties">
                                    {Object.entries(ingredient.elementalProperties || {}).map(([element, value]) => (
                                        <div 
                                            key={element}
                                            data-testid={`${element.toLowerCase()}-value`}
                                        >
                                            {element}: {(value * 100).toFixed(0)}%
                                        </div>
                                    ))}
                                </div>
                                    <div className="harmony-score">
                                        Match: {displayScore}%
                                    </div>
                            </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}; 