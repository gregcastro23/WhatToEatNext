import { ElementalCalculator } from '@/services/ElementalCalculator';
import type { Recipe, ElementalProperties } from '@/types/alchemy';

export class RecipeEngine {
    private calculator: ElementalCalculator;

    constructor() {
        this.calculator = ElementalCalculator.getInstance();
    }

    calculateHarmony(recipe: Recipe): number {
        // Validate elemental properties
        if (!recipe.elementalProperties || 
            Object.values(recipe.elementalProperties).some(val => val < 0 || val > 1)) {
            return 0;
        }

        // Normal calculation logic
        const { Fire, Water, Earth, Air } = recipe.elementalProperties;
        const harmony = (Fire + Water + Earth + Air) / 4;
        
        // Ensure harmony is between 0 and 1
        return Math.max(0, Math.min(1, harmony));
    }

    getDominantElements(recipe: Recipe) {
        if (!recipe.ingredients?.length || !recipe.ingredients.some(ing => ing.elementalProperties)) {
            return [];
        }
        
        const elementalProps = recipe.ingredients.reduce((acc, ingredient) => {
            if (ingredient.elementalProperties) {
                Object.entries(ingredient.elementalProperties).forEach(([_element, value]) => {
                    acc[_element] = (acc[_element] || 0) + value;
                });
            }
            return acc;
        }, {} as ElementalProperties);

        return Object.entries(elementalProps)
            .sort(([, a], [, b]) => b - a)
            .map(([_element, value]) => ({ _element, value }));
    }

    calculateIngredientProportions(recipe: Recipe): ElementalProperties {
        if (!recipe?.ingredients?.length) {
            return ElementalCalculator.getCurrentElementalState();
        }

        const total = recipe.ingredients.reduce((sum, ing) => sum + (ing.amount ?? 0), 0);
        const unnormalized = recipe.ingredients.reduce((props, ing) => {
            if (ing.elementalProperties) {
                Object.entries(ing.elementalProperties).forEach(([_element, value]) => {
                    props[_element] = (props[_element] || 0) + (value * (ing.amount ?? 0) / total);
                });
            }
            return props;
        }, {} as ElementalProperties);

        // Normalize the result
        const sum = Object.values(unnormalized).reduce((acc, val) => acc + val, 0);
        return Object.entries(unnormalized).reduce((normalized, [_element, value]) => {
            normalized[_element] = value / sum;
            return normalized;
        }, {} as ElementalProperties);
    }

    findComplementaryRecipes(recipe: Recipe, availableRecipes: Recipe[]) {
        return availableRecipes
            .map(other => ({
                ...other,
                harmonyScore: this.calculateHarmonyBetween(
                    recipe.elementalProperties,
                    other.elementalProperties
                )
            }))
            .sort((a, b) => b.harmonyScore - a.harmonyScore);
    }

    rankBySeasonalEffectiveness(recipes: Recipe[], season: string) {
        return recipes
            .map(recipe => ({
                ...recipe,
                seasonalScore: this.calculateSeasonalEffectivenessScore(recipe, season)
            }))
            .sort((a, b) => b.seasonalScore - a.seasonalScore);
    }

    /**
     * Calculate seasonal effectiveness score for a recipe
     * Fallback implementation since ElementalCalculator.calculateSeasonalEffectiveness doesn't exist
     */
    private calculateSeasonalEffectivenessScore(recipe: Recipe, season: string): number {
        if (!recipe.elementalProperties) return 0.5;

        // Season-element mapping for effectiveness calculation
        const seasonalElements = {
            'spring': { Air: 0.8, Water: 0.6, Fire: 0.4, Earth: 0.3 },
            'summer': { Fire: 0.8, Air: 0.6, Earth: 0.4, Water: 0.3 },
            'autumn': { Earth: 0.8, Water: 0.6, Air: 0.4, Fire: 0.3 },
            'winter': { Water: 0.8, Earth: 0.6, Fire: 0.4, Air: 0.3 }
        };

        const seasonMultipliers = seasonalElements[season.toLowerCase() as keyof typeof seasonalElements] || 
                                seasonalElements['spring'];

        // Calculate weighted score based on recipe's elemental properties and seasonal effectiveness
        let score = 0;
        Object.entries(recipe.elementalProperties).forEach(([_element, value]) => {
            const multiplier = seasonMultipliers[_element as keyof typeof seasonMultipliers] || 0.5;
            score += value * multiplier;
        });

        return Math.max(0, Math.min(1, score));
    }

    private calculateHarmonyBetween(props1: ElementalProperties, props2: ElementalProperties): number {
        if (!props1 || !props2) return 0;
        
        try {
            return 1 - Object.entries(props1).reduce((diff, [_element, value]) => {
                return diff + Math.abs(value - (props2[_element] || 0)) / 2;
            }, 0);
        } catch (error) {
            return 0;
        }
    }

    getRecipesForTarotCard(card: { associatedRecipes?: Recipe[]; element?: string }) {
        const associatedRecipes = card.associatedRecipes || [];
        const elementBasedRecipes = card.element ? this.getRecipesForElement(card.element) : [];
        
        return [...new Set([...associatedRecipes, ...elementBasedRecipes])];
    }

    /**
     * Get recipes associated with an element
     */
    getRecipesForElement(element: string): Recipe[] {
        // This is a simple implementation - in a production app this would filter recipes by element
        return [];
    }
} 