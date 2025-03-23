import React, { useMemo } from 'react';
import { ElementalCalculator } from '@/services/ElementalCalculator';
import type { IngredientCategory } from '@/types/ingredients';
import type { ElementalProperties } from '@/types/alchemy';
import { VALID_CATEGORIES } from '@/data/ingredients';

interface IngredientRecommendationsProps {
    ingredients: Record<string, IngredientCategory[]>;
    elementFilter?: Partial<ElementalProperties>;
    harmonyThreshold?: number;
}

export const IngredientRecommendations: React.FC<IngredientRecommendationsProps> = ({
    ingredients,
    elementFilter,
    harmonyThreshold = 0.7
}) => {
    const currentBalance = ElementalCalculator.getCurrentelementalState();

    const filteredIngredients = useMemo(() => {
        return Object.entries(ingredients).reduce((acc, [category, items]) => {
            const filtered = items.filter(ingredient => {
                // Calculate harmony score
                const score = ElementalCalculator.calculateMatchScore(ingredient) / 100;
                
                // Check element filter if present
                if (elementFilter && ingredient.elementalProperties) {
                    const elementValue = ingredient.elementalProperties[elementFilter];
                    if (!elementValue || elementValue <= 0.2) return false;
                }

                // Check harmony threshold
                return score >= harmonyThreshold;
            });

            if (filtered.length > 0) {
                acc[category] = filtered;
            }
            return acc;
        }, {} as Record<string, IngredientCategory[]>);
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
                                data-harmony-score={ElementalCalculator.calculateMatchScore(ingredient) / 100}
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