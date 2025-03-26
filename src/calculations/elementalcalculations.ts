import { ElementalProperties } from '@/types/recipe';
import { CUISINES } from '@/config/cuisines';

interface ElementalBalance {
    harmony: number;
    regionalAlignment: number;
    seasonalInfluence: number;
    totalScore: number;
}

interface RecommendedCuisine {
    name: string;
    description: string;
    matchScore: number;
    elementalBalance: ElementalProperties;
}

export class ElementalCalculator {
    private static instance: ElementalCalculator;
    
    private cuisineTypes: Record<string, string[]> = {
        'East Asian': ['Japanese', 'Chinese', 'Korean'],
        'Southeast Asian': ['Thai', 'Vietnamese'],
        'South Asian': ['Indian'],
        'Middle Eastern': ['Middle Eastern'],
        'European': ['French', 'Italian', 'Greek', 'Russian'],
        'Latin American': ['Mexican'],
        'African': ['African']
    };

    private constructor() {}

    public static getInstance(): ElementalCalculator {
        if (!ElementalCalculator.instance) {
            ElementalCalculator.instance = new ElementalCalculator();
        }
        return ElementalCalculator.instance;
    }

    private getCuisineType(cuisineName: string): string {
        for (const [type, cuisines] of Object.entries(this.cuisineTypes)) {
            if (cuisines.includes(cuisineName)) {
                return type;
            }
        }
        return 'Other';
    }

    public getRecommendedCuisines(userElements: ElementalProperties): RecommendedCuisine[] {
        const recommendations: RecommendedCuisine[] = [];
        
        // Calculate scores for all cuisines
        const scoredCuisines = Object.entries(CUISINES).map(([key, cuisine]) => ({
            cuisine,
            score: this.calculateElementalBalance(userElements, key).totalScore
        }));

        // Sort by score descending
        const sortedCuisines = scoredCuisines.sort((a, b) => b.score - a.score);

        // Group cuisines by type
        const cuisinesByType: Record<string, RecommendedCuisine[]> = {};

        sortedCuisines.forEach(({ cuisine, score }) => {
            const type = this.getCuisineType(cuisine.name);
            if (!cuisinesByType[type]) {
                cuisinesByType[type] = [];
            }
            cuisinesByType[type].push({
                name: cuisine.name,
                description: cuisine.description,
                matchScore: score,
                elementalBalance: cuisine.elementalBalance
            });
        });

        // Get best match from each type
        Object.values(cuisinesByType).forEach(typeCuisines => {
            if (typeCuisines.length > 0) {
                recommendations.push(typeCuisines[0]);
            }
        });

        return recommendations;
    }

    public calculateElementalBalance(
        recipeElements: ElementalProperties,
        cuisineType: string
    ): ElementalBalance {
        const harmony = this.calculateHarmony(recipeElements);
        const regionalAlignment = this.calculateRegionalAlignment(recipeElements, cuisineType);
        const seasonalInfluence = this.calculateSeasonalInfluence(recipeElements);

        return {
            harmony,
            regionalAlignment,
            seasonalInfluence,
            totalScore: (harmony + regionalAlignment + seasonalInfluence) / 3
        };
    }

    private calculateHarmony(elements: ElementalProperties): number {
        const total = Object.values(elements).reduce((sum, val) => sum + val, 0);
        if (total === 0) return 0;

        const normalized = {
            Fire: elements.Fire / total,
            Water: elements.Water / total,
            Air: elements.Air / total,
            Earth: elements.Earth / total
        };

        return 1 - (
            Math.abs(0.25 - normalized.Fire) +
            Math.abs(0.25 - normalized.Water) +
            Math.abs(0.25 - normalized.Air) +
            Math.abs(0.25 - normalized.Earth)
        );
    }

    private calculateRegionalAlignment(
        recipeElements: ElementalProperties,
        cuisineType: string
    ): number {
        const cuisineData = CUISINES[cuisineType];
        if (!cuisineData) return 1.0;

        const cuisineElements = cuisineData.elementalBalance;
        let alignment = 0;

        for (const element in recipeElements) {
            const key = element as keyof ElementalProperties;
            alignment += Math.min(recipeElements[key], cuisineElements[key]);
        }

        return alignment / 2;
    }

    private calculateSeasonalInfluence(elements: ElementalProperties): number {
        const month = new Date().getMonth();
        const season = this.getCurrentSeason(month);

        const seasonalModifiers: Record<string, ElementalProperties> = {
            spring: { Fire: 0.3, Water: 0.3, Air: 0.3, Earth: 0.1 },
            summer: { Fire: 0.4, Water: 0.2, Air: 0.3, Earth: 0.1 },
            autumn: { Fire: 0.2, Water: 0.2, Air: 0.3, Earth: 0.3 },
            winter: { Fire: 0.1, Water: 0.4, Air: 0.2, Earth: 0.3 }
        };

        const modifier = seasonalModifiers[season];
        let influence = 0;

        for (const element in elements) {
            const key = element as keyof ElementalProperties;
            influence += elements[key] * modifier[key];
        }

        return influence;
    }

    private getCurrentSeason(month: number): string {
        if (month >= 2 && month <= 4) return 'spring';
        if (month >= 5 && month <= 7) return 'summer';
        if (month >= 8 && month <= 10) return 'autumn';
        return 'winter';
    }
}
