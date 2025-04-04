import React, { useMemo } from 'react';
import { ElementalCalculator } from '@/services/ElementalCalculator';
import type { IngredientCategory } from '@/data/ingredients/types';
import type { ElementalProperties, Recipe } from '@/types/alchemy';
import type { Ingredient } from '@/types/ingredient';
import { VALID_CATEGORIES, DEFAULT_ELEMENTAL_PROPERTIES } from '@/data/ingredients';

interface IngredientRecommendationsProps {
    ingredients: Record<string, Ingredient[]>;
    elementFilter?: Partial<ElementalProperties>;
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
                if (hasElementalProps) {
                    try {
                        // Convert to format expected by calculator 
                        const ingredientWithProps = {
                            elementalProperties: ingredient.elementalProperties,
                            // Add other required properties for calculation
                            name: ingredient.name,
                            id: ingredient.id || ingredient.name
                        };
                        
                        // Use the more appropriate ingredient match calculation
                        score = ElementalCalculator.calculateElementalBalance(
                            ingredientWithProps.elementalProperties
                        ) / 100;
                    } catch (e) {
                        console.warn(`Could not calculate score for ${ingredient.name}`, e);
                    }
                }
                
                // Check element filter if present
                if (elementFilter && ingredient.elementalProperties) {
                    const elementKey = Object.keys(elementFilter)[0] as keyof ElementalProperties;
                    const elementValue = ingredient.elementalProperties[elementKey];
                    if (!elementValue || elementValue <= 0.2) return false;
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
                        {items.map((ingredient, index) => (
                            <div
                                key={`${ingredient.name}-${index}`}
                                className="ingredient-item recommended"
                                data-testid="recommended-ingredient"
                                data-fire-value={ingredient.elementalProperties?.Fire || 0}
                                data-harmony-score={ElementalCalculator.calculateIngredientMatch(ingredient) / 100}
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
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
} 