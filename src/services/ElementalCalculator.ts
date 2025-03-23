import { ElementalProperties, Recipe, Season, TimeOfDay , CombinationResult, Element , Ingredient, ZodiacSign, AstrologicalState } from '@/types/alchemy';
import { validateElementalProperties, normalizeProperties } from '@/utils/elementalUtils';
import { DEFAULT_ELEMENTAL_PROPERTIES } from '@/constants/elementalConstants';

export class ElementalCalculator {
    private static instance: ElementalCalculator;
    private currentBalance: ElementalProperties = DEFAULT_ELEMENTAL_PROPERTIES;
    private initialized: boolean = false;

    private constructor() {}

    static getInstance(): ElementalCalculator {
        if (!ElementalCalculator.instance) {
            ElementalCalculator.instance = new ElementalCalculator();
        }
        return ElementalCalculator.instance;
    }

    static initialize(): void {
        const instance = ElementalCalculator.getInstance();
        instance.currentBalance = { ...DEFAULT_ELEMENTAL_PROPERTIES };
        instance.initialized = true;
    }

    static getCurrentelementalState(): ElementalProperties {
        const instance = ElementalCalculator.getInstance();
        if (!instance.initialized) {
            ElementalCalculator.initialize();
        }
        return instance.currentBalance;
    }

    static calculateMatchScore(recipe: Recipe): number {
        if (!recipe?.elementalProperties || !validateElementalProperties(recipe.elementalProperties)) {
            return 0;
        }

        const currentBalance = ElementalCalculator.getCurrentelementalState();
        
        // Calculate energy metrics using the same formulas as elsewhere
        const heat = calculateHeat(recipe.elementalProperties, {});
        const entropy = calculateEntropy(recipe.elementalProperties, {});
        const reactivity = calculateReactivity(recipe.elementalProperties, {});
        
        // Use the same gregsEnergy calculation as in other components
        const rawGregsEnergy = heat - (entropy * reactivity);
        const scaledGregsEnergy = (rawGregsEnergy + 1) / 2;
        const gregsEnergy = Math.max(0.1, Math.min(1.0, scaledGregsEnergy));
        
        // Use gregsEnergy as the match score, converted to percentage
        return Math.round(gregsEnergy * 100);
    }

    static getSeasonalModifiers(season: Season): ElementalProperties {
        const baseModifiers = { ...DEFAULT_ELEMENTAL_PROPERTIES };
        
        switch (season) {
            case 'Summer':
                baseModifiers.Fire = 0.4;
                baseModifiers.Water = 0.2;
                break;
            case 'Winter':
                baseModifiers.Water = 0.4;
                baseModifiers.Fire = 0.2;
                break;
            // Add other seasons as needed
        }

        return normalizeProperties(baseModifiers);
    }

    calculateelementalState(ingredients: Ingredient[]): ElementalProperties {
        const initialBalance: ElementalProperties = {
            Fire: 0,
            Water: 0,
            Earth: 0,
            Air: 0
        };
        
        if (!ingredients.length) {
            return initialBalance;
        }
        
        // Sum up elemental properties from all ingredients
        const combinedProperties = ingredients.reduce((acc, ingredient) => {
            if (!ingredient.elementalProperties) return acc;
            
            Object.keys(ingredient.elementalProperties).forEach((element) => {
                const elementKey = element as keyof ElementalProperties;
                acc[elementKey] = (acc[elementKey] || 0) + 
                    (ingredient.elementalProperties?.[elementKey] || 0) * (ingredient.amount || 1);
            });
            
            return acc;
        }, initialBalance);
        
        // Normalize values to sum to 1
        const total = Object.values(combinedProperties).reduce((sum, val) => sum + val, 0);
        if (total === 0) return initialBalance;
        
        const normalizedProperties: ElementalProperties = {
            Fire: combinedProperties.Fire / total,
            Water: combinedProperties.Water / total,
            Earth: combinedProperties.Earth / total,
            Air: combinedProperties.Air / total
        };
        
        return normalizedProperties;
    }

    public static calculateSeasonalEffectiveness(recipe: Recipe, season: string): number {
        if (!recipe?.elementalProperties) return 0;
        
        const seasonalModifiers = this.getSeasonalModifiers(season as Season);
        let score = 0;
        
        // Calculate base seasonal alignment
        Object.entries(recipe.elementalProperties).forEach(([element, value]) => {
            const modifier = seasonalModifiers[element as keyof ElementalProperties] || 0;
            score += value * modifier * 100;
        });
        
        // Apply seasonal bonuses/penalties
        if (recipe.season) {
            const seasons = Array.isArray(recipe.season) ? recipe.season : [recipe.season];
            if (seasons.map(s => s.toLowerCase()).includes(season.toLowerCase())) {
                score += 20;
            }
        }
        
        return Math.max(0, Math.min(100, Math.round(score)));
    }

    private static getOppositeElement(element: keyof ElementalProperties): keyof ElementalProperties {
        const opposites: Record<keyof ElementalProperties, keyof ElementalProperties> = {
            Fire: 'Water',
            Water: 'Fire',
            Earth: 'Air',
            Air: 'Earth'
        };
        return opposites[element];
    }

    private static getTimeModifiers(time: TimeOfDay): ElementalProperties {
        const timeMap: Record<TimeOfDay, ElementalProperties> = {
            dawn: { Air: 0.05 },
            morning: { Fire: 0.05 },
            noon: { Fire: 0.1 },
            afternoon: { Earth: 0.05 },
            evening: { Water: 0.05 },
            night: { Water: 0.1 }
        };

        return timeMap[time] || {
            Fire: 0.25,
            Water: 0.25,
            Earth: 0.25,
            Air: 0.25
        };
    }

    private static combineModifiers(modifiers: ElementalProperties[]): ElementalProperties {
        const combined: ElementalProperties = {
            Fire: 0,
            Water: 0,
            Earth: 0,
            Air: 0
        };

        modifiers.forEach(modifier => {
            Object.entries(modifier).forEach(([element, value]) => {
                combined[element as keyof ElementalProperties] += value;
            });
        });

        return combined;
    }

    calculateCombination(ingredients: Ingredient[], astroState?: AstrologicalState): CombinationResult {
        const elementalProperties = this.calculateelementalState(ingredients);
        const dominantElement = this.getDominantElement(elementalProperties);
        
        const stability = this.calculateStability(elementalProperties);
        const potency = this.calculatePotency(elementalProperties, astroState);
        
        return {
            resultingProperties: elementalProperties,
            stability,
            potency,
            dominantElement,
            warnings: this.generateWarnings(ingredients, elementalProperties)
        };
    }

    private calculateStability(properties: ElementalProperties): number {
        // Check for balance between opposing elements
        const fireWaterDiff = Math.abs(properties.Fire - properties.Water);
        const earthAirDiff = Math.abs(properties.Earth - properties.Air);
        
        // More balanced = more stable
        const rawStability = 1 - ((fireWaterDiff + earthAirDiff) / 2);
        
        return Math.max(0, Math.min(1, rawStability));
    }

    private calculatePotency(properties: ElementalProperties, astroState?: AstrologicalState): number {
        // Base potency from dominant element strength
        const dominantElement = this.getDominantElement(properties);
        const dominantValue = properties[dominantElement];
        
        // More dominant = more potent
        let potency = dominantValue;
        
        // Astrological boosts if available
        if (astroState) {
            const zodiacElement = this.getZodiacElement(astroState.sunSign);
            if (zodiacElement === dominantElement) {
                potency *= 1.2; // 20% boost for aligned zodiac
            }
        }
        
        return Math.max(0, Math.min(1, potency));
    }

    private getDominantElement(properties: ElementalProperties): Element {
        let dominant: Element = 'Fire';
        let maxValue = properties.Fire;
        
        if (properties.Water > maxValue) {
            dominant = 'Water';
            maxValue = properties.Water;
        }
        
        if (properties.Earth > maxValue) {
            dominant = 'Earth';
            maxValue = properties.Earth;
        }
        
        if (properties.Air > maxValue) {
            dominant = 'Air';
            maxValue = properties.Air;
        }
        
        return dominant;
    }

    private getZodiacElement(sign: ZodiacSign): Element {
        const fireSign = ['aries', 'leo', 'sagittarius'];
        const earthSign = ['taurus', 'virgo', 'capricorn'];
        const airSign = ['gemini', 'libra', 'aquarius'];
        const waterSign = ['cancer', 'scorpio', 'pisces'];
        
        if (fireSign.includes(sign)) return 'Fire';
        if (earthSign.includes(sign)) return 'Earth';
        if (airSign.includes(sign)) return 'Air';
        return 'Water';
    }

    private generateWarnings(ingredients: Ingredient[], properties: ElementalProperties): string[] {
        const warnings: string[] = [];
        
        // Check for extreme imbalances
        if (properties.Fire > 0.7) {
            warnings.push("High Fire energy may cause excessive heat. Consider balancing with Water elements.");
        }
        
        if (properties.Water > 0.7) {
            warnings.push("High Water energy may dampen flavors. Consider balancing with Fire elements.");
        }
        
        // Check for potential conflicting ingredients
        // (This would be more sophisticated in a real implementation)
        
        return warnings;
    }
}

export default ElementalCalculator; 