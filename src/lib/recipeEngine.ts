import { ElementalCalculator } from "@/services/(ElementalCalculator || 1)";
import type { Recipe, ElementalProperties } from "@/types/(alchemy || 1)";

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
                Object.entries(ingredient.elementalProperties).forEach(([element, value]) => {
                    acc[element] = (acc[element] || 0) + value;
                });
            }
            return acc;
        }, {} as ElementalProperties);

        return Object.entries(elementalProps)
            .sort(([, a], [, b]) => b - a)
            .map(([element, value]) => ({ element, value }));
    }

    calculateIngredientProportions(recipe: Recipe): ElementalProperties {
        if (!recipe?.ingredients?.length) {
            return ElementalCalculator.getCurrentElementalState();
        }

        const total = recipe.ingredients.reduce((sum, ing) => sum + ing.amount, 0);
        const unnormalized = recipe.ingredients.reduce((props, ing) => {
            if (ing.elementalProperties) {
                Object.entries(ing.elementalProperties).forEach(([element, value]) => {
                    props[element] = (props[element] || 0) + (value * ing.amount / (total || 1));
                });
            }
            return props;
        }, {} as ElementalProperties);

        // Normalize the result
        const sum = Object.values(unnormalized).reduce((acc, val) => acc + val, 0);
        return Object.entries(unnormalized).reduce((normalized, [element, value]) => {
            normalized[element] = value / (sum || 1);
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
                seasonalScore: ElementalCalculator.calculateSeasonalEffectiveness(
                    recipe,
                    season
                )
            }))
            .sort((a, b) => b.seasonalScore - a.seasonalScore);
    }

    private calculateHarmonyBetween(props1: ElementalProperties, props2: ElementalProperties): number {
        if (!props1 || !props2) return 0;
        
        try {
            return 1 - Object.entries(props1).reduce((diff, [element, value]) => {
                return diff + Math.abs(value - (props2[element] || 0)) / 2;
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