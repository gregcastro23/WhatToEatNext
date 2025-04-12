import { ElementalCharacter } from '../constants/planetaryElements';
import { RulingPlanet } from '../constants/planets';
import type { ThermodynamicMetrics } from '../calculations/gregsEnergy';
import type { BirthChart } from '../types/astrology';

export interface FoodCorrespondence {
    name: string;
    element: ElementalCharacter;
    planetaryRuler: RulingPlanet;
    timeOfDay: 'Day' | 'Night' | 'Both';
    energyValues: ThermodynamicMetrics;
    preparation: string[];
    combinations: string[];
    restrictions: string[];
}

export interface CompatibilityScore {
    compatibility: number;
    recommendations: string[];
    warnings: string[];
}

export class FoodAlchemySystem {
    private readonly TOKEN_WEIGHTS = {
        Spirit: 1.0,
        Essence: 0.8,
        Matter: 0.6,
        Substance: 0.4
    };

    private readonly ELEMENT_WEIGHTS = {
        Fire: 1.0,
        Water: 0.9,
        Air: 0.8,
        Earth: 0.7
    };

    calculateFoodCompatibility(
        food: FoodCorrespondence,
        chart: BirthChart,
        planetaryHour: string
    ): CompatibilityScore {
        const elementalMatch = this.calculateElementalMatch(chart, food);
        const planetaryMatch = this.calculatePlanetaryMatch(chart, food);
        const timeMatch = this.calculateTimeOptimization(food, planetaryHour);
        
        return {
            compatibility: (elementalMatch + planetaryMatch + timeMatch) / 3,
            recommendations: this.generateRecommendations(food, chart),
            warnings: this.identifyConflicts(food, chart)
        };
    }

    private calculateElementalMatch(chart: BirthChart, food: FoodCorrespondence): number {
        const chartElementStrength = chart.elementalState[food.element] || 0;
        return chartElementStrength * this.ELEMENT_WEIGHTS[food.element];
    }

    private calculatePlanetaryMatch(chart: BirthChart, food: FoodCorrespondence): number {
        const planetStrength = chart.planetaryPositions[food.planetaryRuler] || 0;
        return planetStrength * this.TOKEN_WEIGHTS.Substance; // Use Substance weight for planetary matches
    }

    private calculateTimeOptimization(food: FoodCorrespondence, planetaryHour: string): number {
        const isDaytime = planetaryHour === 'Sun';
        return food.timeOfDay === 'Both' ? 1 : 
            (food.timeOfDay === 'Day' && isDaytime) || 
            (food.timeOfDay === 'Night' && !isDaytime) ? 1 : 0;
    }

    private generateRecommendations(food: FoodCorrespondence, chart: BirthChart): string[] {
        const recommendations: string[] = [];
        
        // Element-based recommendations
        if (chart.elementalState[food.element] > 0.7) {
            recommendations.push(`Boost ${food.element} elements with complementary ingredients`);
        }
        
        // Planetary-based recommendations
        if (chart.planetaryPositions[food.planetaryRuler] > 0.8) {
            recommendations.push(`Enhance with ${food.planetaryRuler}-aligned preparation methods`);
        }
        
        return recommendations;
    }

    private identifyConflicts(food: FoodCorrespondence, chart: BirthChart): string[] {
        const warnings: string[] = [];
        
        // Instead of looking for conflicts, provide suggestions for balance
        const complementaryElements = this.getComplementaryElements(food.element);
        complementaryElements.forEach(element => {
            if (chart.elementalState[element] < 0.3) {
                warnings.push(`Consider adding ${element} foods to create balance`);
            }
        });
        
        return warnings;
    }

    private getComplementaryElements(element: ElementalCharacter): ElementalCharacter[] {
        // All elements complement each other, but we provide suggestions
        // for creating culinary balance
        const elementComplements: Record<ElementalCharacter, ElementalCharacter[]> = {
            Fire: ['Water', 'Earth'],
            Water: ['Earth', 'Fire'],
            Air: ['Fire', 'Water'],
            Earth: ['Water', 'Air']
        };
        return elementComplements[element];
    }
} 