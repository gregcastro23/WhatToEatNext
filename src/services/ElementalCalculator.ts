import { ElementalProperties, Recipe, Season, TimeOfDay , CombinationResult, Element , Ingredient, ZodiacSign, AstrologicalState, ElementalSummary } from '../types/alchemy';
import { normalizeProperties } from '../utils/elementalUtils';
import { DEFAULT_ELEMENTAL_PROPERTIES } from '../constants/elementalConstants';
import type { PlanetaryAlignment } from '../types/alchemy';
import { createLogger } from '@/utils/logger';

const logger = createLogger('ElementalCalculator');

export class ElementalCalculator {
    private static instance: ElementalCalculator;
    private currentBalance: ElementalProperties = DEFAULT_ELEMENTAL_PROPERTIES;
    private initialized = false;

    private constructor() {
        // Private constructor to enforce singleton pattern
    }

    static getInstance(): ElementalCalculator {
        if (!ElementalCalculator.instance) {
            ElementalCalculator.instance = new ElementalCalculator();
        }
        return ElementalCalculator.instance;
    }

    static initialize(initialState?: ElementalProperties): void {
        const instance = ElementalCalculator.getInstance();
        instance.currentBalance = initialState || { ...DEFAULT_ELEMENTAL_PROPERTIES };
        instance.initialized = true;
        logger.debug('ElementalCalculator initialized with', instance.currentBalance);
    }

    static updateElementalState(newState: ElementalProperties): void {
        const instance = ElementalCalculator.getInstance();
        instance.currentBalance = { ...newState };
        logger.debug('ElementalCalculator state updated', instance.currentBalance);
    }

    static getCurrentElementalState(): ElementalProperties {
        const instance = ElementalCalculator.getInstance();
        if (!instance.initialized) {
            // Only use direct initialization without the dynamic import of useAlchemical
            // which causes "Invalid hook call" errors in tests
            ElementalCalculator.initialize();
            
            // In a browser, the AlchemicalContext provider will call updateElementalState
            // so we don't need to worry about initializing with the correct state here
        }
        return instance.currentBalance;
    }

    static calculateMatchScore(item: Recipe | { elementalProperties: ElementalProperties | undefined }): number {
        if (!item.elementalProperties) {
            return 0;
        }

        const currentBalance = ElementalCalculator.getCurrentElementalState();
        
        // Use the more robust weighted calculation instead of simplified approach
        let matchScore = 0;
        let totalWeight = 0;
        
        Object.entries(currentBalance).forEach(([element, value]) => {
            const elementKey = element as keyof ElementalProperties;
            // Use optional chaining with nullish coalescing to handle undefined values
            const itemValue = (item.elementalProperties && item.elementalProperties[elementKey]) || 0;
            
            // Calculate weighted difference (more important elements get higher weight)
            const weight = value * 2; // Emphasize elements that are strong in current state
            matchScore += (1 - Math.abs(value - itemValue)) * weight;
            totalWeight += weight;
        });
        
        // Normalize to 0-100 range
        return Math.round(totalWeight > 0 ? (matchScore / totalWeight) * 100 : 50);
    }

    static getSeasonalModifiers(season: Season): ElementalProperties {
        // Start with a balanced base
        const baseModifiers: ElementalProperties = {
            Fire: 0.25,
            Water: 0.25,
            Earth: 0.25,
            Air: 0.25
        };
        
        // Normalize season to lowercase for consistency with type definition
        const seasonLower = season.toLowerCase() as Season;
        
        switch (seasonLower) {
            case 'spring':
                baseModifiers.Air = 0.4;
                baseModifiers.Fire = 0.3;
                baseModifiers.Water = 0.2;
                baseModifiers.Earth = 0.1;
                break;
            case 'summer':
                baseModifiers.Fire = 0.4;
                baseModifiers.Air = 0.3;
                baseModifiers.Earth = 0.2;
                baseModifiers.Water = 0.1;
                break;
            case 'autumn':
            case 'fall':
                baseModifiers.Earth = 0.4;
                baseModifiers.Air = 0.3;
                baseModifiers.Water = 0.2;
                baseModifiers.Fire = 0.1;
                break;
            case 'winter':
                baseModifiers.Water = 0.4;
                baseModifiers.Earth = 0.3;
                baseModifiers.Fire = 0.2;
                baseModifiers.Air = 0.1;
                break;
            case 'all':
                // Balanced for 'all' season
                baseModifiers.Fire = 0.25;
                baseModifiers.Water = 0.25;
                baseModifiers.Earth = 0.25;
                baseModifiers.Air = 0.25;
                break;
            default:
                // Balanced for unknown seasons
                baseModifiers.Fire = 0.25;
                baseModifiers.Water = 0.25;
                baseModifiers.Earth = 0.25;
                baseModifiers.Air = 0.25;
        }

        return baseModifiers;
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

    private static getTimeModifiers(time: TimeOfDay): ElementalProperties {
        const baseProperties = {
            Fire: 0.25, 
            Water: 0.25, 
            Earth: 0.25, 
            Air: 0.25
        };
        
        switch(time) {
            case 'dawn':
                return { ...baseProperties, Air: baseProperties.Air + 0.05 };
            case 'morning':
                return { ...baseProperties, Fire: baseProperties.Fire + 0.05 };
            case 'noon':
                return { ...baseProperties, Fire: baseProperties.Fire + 0.1 };
            case 'afternoon':
                return { ...baseProperties, Earth: baseProperties.Earth + 0.05 };
            case 'evening':
                return { ...baseProperties, Water: baseProperties.Water + 0.05 };
            case 'night':
                return { ...baseProperties, Water: baseProperties.Water + 0.1 };
            default:
                return baseProperties;
        }
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
        
        const potency = this.calculatePotency(elementalProperties, astroState);
        
        // Calculate energy metrics using proper formulas
        // Get elemental values with safety checks
        const fire = Math.max(elementalProperties.Fire, 0.1);
        const water = Math.max(elementalProperties.Water, 0.1);
        const air = Math.max(elementalProperties.Air, 0.1);
        const earth = Math.max(elementalProperties.Earth, 0.1);
        
        // For alchemical principles, use defaults if not available
        const spirit = 0.25;  // Default values since we don't have actual spirit/essence/matter/substance
        const essence = 0.25;
        const matter = 0.25;
        const substance = 0.25;
        
        // Heat formula: (spirit^2 + fire^2) / (substance + essence + matter + water + air + earth)^2
        const denominatorHeat = Math.max(substance + essence + matter + water + air + earth, 0.1);
        const heat = Math.min(Math.max((Math.pow(spirit, 2) + Math.pow(fire, 2)) / Math.pow(denominatorHeat, 2), 0.1), 1.0);
        
        // Entropy formula
        const denominatorEntropy = Math.max(essence + matter + earth + water, 0.1);
        const entropy = Math.min(Math.max((Math.pow(spirit, 2) + Math.pow(substance, 2) + 
                               Math.pow(fire, 2) + Math.pow(air, 2)) / Math.pow(denominatorEntropy, 2), 0.1), 1.0);
        
        // Reactivity formula
        const denominatorReactivity = Math.max(matter + earth, 0.1);
        const reactivity = Math.min(Math.max((Math.pow(spirit, 2) + Math.pow(substance, 2) + Math.pow(essence, 2) + 
                                 Math.pow(fire, 2) + Math.pow(air, 2) + Math.pow(water, 2)) / Math.pow(denominatorReactivity, 2), 0.1), 1.0);
        
        // Calculate energy using heat - (reactivity * entropy)
        const rawEnergy = heat - (reactivity * entropy);
        const energy = Math.min(Math.max((rawEnergy + 1) / 2, 0.1), 1.0); // Convert from range (-1,1) to (0,1)
        
        return {
            resultingProperties: elementalProperties,
            energyState: {
                heat,
                entropy,
                reactivity,
                energy
            },
            potency,
            dominantElement,
            warnings: [],
            alchemicalRecommendations: []
        };
    }

    private calculatePotency(properties: ElementalProperties, astroState?: AstrologicalState): number {
        // Basic potency calculation based on dominant element strength
        const dominantElement = this.getDominantElement(properties);
        const dominantValue = properties[dominantElement];
        
        // Base potency is weighted toward dominant element concentration
        let potency = dominantValue * 0.8;
        
        // Add additional potency based on astrological factors when available
        if (astroState) {
            // Add lunar cycle influence (full moon = highest potency)
            if (astroState.lunarPhase === 'full moon') {
                potency += 0.1;
            }
            
            // Add zodiac sign influence if it matches element
            if (astroState.zodiacSign) {
                const zodiacElement = this.getZodiacElement(astroState.zodiacSign);
                if (zodiacElement === dominantElement) {
                    potency += 0.1;
                }
            }
        }
        
        // Normalize to 0-1 range
        return Math.min(1, potency);
    }

    private getDominantElement(properties: ElementalProperties): Element {
        let highest = -1;
        let dominantElement: Element = 'Fire';
        
        for (const element in properties) {
            if (Object.prototype.hasOwnProperty.call(properties, element)) {
                const value = properties[element as keyof ElementalProperties];
                if (value > highest) {
                    highest = value;
                    dominantElement = element as Element;
                }
            }
        }
        
        return dominantElement;
    }

    private getZodiacElement(sign: ZodiacSign): Element {
        const elementMapping: Record<ZodiacSign, Element> = {
            aries: 'Fire',
            leo: 'Fire',
            sagittarius: 'Fire',
            taurus: 'Earth',
            virgo: 'Earth',
            capricorn: 'Earth',
            gemini: 'Air',
            libra: 'Air',
            aquarius: 'Air',
            cancer: 'Water',
            scorpio: 'Water',
            pisces: 'Water'
        };
        
        return elementMapping[sign];
    }

    /**
     * Calculates the elemental state based on planetary alignment
     * @param planetaryAlignment The current planetary alignment
     * @returns Elemental properties distribution
     */
    calculateElementalState(planetaryAlignment: PlanetaryAlignment): ElementalProperties {
        // Initialize with balanced elements
        const elementalState: ElementalProperties = {
            Fire: 0.25,
            Water: 0.25,
            Earth: 0.25,
            Air: 0.25
        };
        
        // If no valid alignment, return default state
        if (!planetaryAlignment || Object.keys(planetaryAlignment).length === 0) {
            console.warn('No planetary alignment data, using default elemental state');
            return elementalState;
        }
        
        // Map of zodiac signs to their element
        const signElements: Record<string, Element> = {
            aries: 'Fire',
            leo: 'Fire',
            sagittarius: 'Fire',
            taurus: 'Earth',
            virgo: 'Earth',
            capricorn: 'Earth',
            gemini: 'Air',
            libra: 'Air',
            aquarius: 'Air',
            cancer: 'Water',
            scorpio: 'Water',
            pisces: 'Water'
        };
        
        // Planetary weights (influence of each planet)
        const planetaryWeights: Record<string, number> = {
            sun: 3,
            moon: 3,
            mercury: 2,
            venus: 2,
            mars: 2,
            jupiter: 1.5,
            saturn: 1.5,
            uranus: 1,
            neptune: 1,
            pluto: 1
        };
        
        // Count element contributions
        let totalWeight = 0;
        const elementCounts: Record<Element, number> = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
        
        // Process each planet
        Object.entries(planetaryAlignment).forEach(([planet, position]) => {
            // Add type guard to check if position is an object and has a sign property that is a string
            if (position && 
                typeof position === 'object' && 
                'sign' in position && 
                position.sign && 
                typeof position.sign === 'string') {
                
                const sign = position.sign.toLowerCase();
                const element = signElements[sign];
                const weight = planetaryWeights[planet.toLowerCase()] || 1;
                
                if (element) {
                    elementCounts[element] += weight;
                    totalWeight += weight;
                }
            }
        });
        
        // Normalize to percentages
        if (totalWeight > 0) {
            Object.keys(elementCounts).forEach(element => {
                elementalState[element as keyof ElementalProperties] = elementCounts[element as keyof typeof elementCounts] / totalWeight;
            });
        }
        
        return elementalState;
    }

    private static validateElementalProperties(properties: ElementalProperties): boolean {
        if (!properties) return false;
        
        const requiredElements = ['Fire', 'Water', 'Earth', 'Air'];
        const hasAllElements = requiredElements.every(element => 
            typeof properties[element as keyof ElementalProperties] === 'number'
        );
        
        if (!hasAllElements) return false;
        
        const sum = Object.values(properties).reduce((acc, val) => acc + val, 0);
        return Math.abs(sum - 1) < 0.01;
    }

    public static calculateIngredientMatch(ingredient: unknown): number {
        // If the ingredient has elementalProperties, use those
        if (ingredient.elementalProperties) {
            const currentState = this.getCurrentElementalState();
            
            // Calculate similarity between ingredient's elemental properties and current state
            let matchScore = 0;
            let totalWeight = 0;
            
            Object.entries(currentState).forEach(([element, value]) => {
                const elementKey = element as keyof ElementalProperties;
                const ingredientValue = ingredient.elementalProperties[elementKey] || 0;
                
                // Calculate weighted difference (more important elements get higher weight)
                const weight = value * 2; // Emphasize elements that are strong in current state
                matchScore += (1 - Math.abs(value - ingredientValue)) * weight;
                totalWeight += weight;
            });
            
            // Normalize score to 0-100 range
            return totalWeight > 0 ? (matchScore / totalWeight) * 100 : 50;
        }
        
        // Default score if no elemental properties
        return 50;
    }

    public static calculateElementalBalance(elementalProperties: ElementalProperties): number {
        // Use actual current elemental state for comparison
        const currentState = this.getCurrentElementalState();
        
        // Calculate similarity between ingredient and current state
        let totalSimilarity = 0;
        let count = 0;
        
        // Use all four elements for calculation
        ['Fire', 'Water', 'Earth', 'Air'].forEach(element => {
            const elementKey = element as keyof ElementalProperties;
            const currentValue = currentState[elementKey] || 0;
            const ingredientValue = elementalProperties[elementKey] || 0;
            
            // Calculate similarity (1 - difference)
            const similarity = 1 - Math.abs(currentValue - ingredientValue);
            totalSimilarity += similarity;
            count++;
        });
        
        // Return average similarity as percentage
        return count > 0 ? (totalSimilarity / count) * 100 : 50;
    }

    private calculateElementalTotals(properties: ElementalProperties): ElementalSummary {
        return {
            totalFire: properties.Fire,
            totalWater: properties.Water,
            totalEarth: properties.Earth,
            totalAir: properties.Air,
            dominantElement: this.getDominantElement(properties)
        };
    }

    private static getSeasonFromZodiacSign(sign: ZodiacSign): Season {
        // Map zodiac signs to seasons
        const zodiacSeasons: Record<ZodiacSign, Season> = {
            'aries': 'spring',
            'taurus': 'spring',
            'gemini': 'spring',
            'cancer': 'summer',
            'leo': 'summer',
            'virgo': 'summer',
            'libra': 'autumn',
            'scorpio': 'autumn',
            'sagittarius': 'autumn',
            'capricorn': 'winter',
            'aquarius': 'winter',
            'pisces': 'winter'
        };
        
        return zodiacSeasons[sign] || 'all';
    }

    // Method to get seasonal modifiers based on zodiac sign
    public static getZodiacSeasonalModifiers(sign: ZodiacSign): ElementalProperties {
        const season = this.getSeasonFromZodiacSign(sign);
        return this.getSeasonalModifiers(season);
    }

    public static getZodiacElementalInfluence(sign: ZodiacSign): ElementalProperties {
        // Base seasonal influence
        const seasonalModifiers = this.getZodiacSeasonalModifiers(sign);
        
        // Specific zodiac sign adjustments
        const zodiacModifiers: Record<ZodiacSign, Partial<ElementalProperties>> = {
            'aries': { Fire: 0.2 },        // Extra Fire boost for aries
            'taurus': { Earth: 0.2 },      // Extra Earth boost for taurus
            'gemini': { Air: 0.2 },        // Extra Air boost for gemini
            'cancer': { Water: 0.2 },      // Extra Water boost for cancer
            'leo': { Fire: 0.2 },          // Extra Fire boost for leo
            'virgo': { Earth: 0.2 },       // Extra Earth boost for virgo
            'libra': { Air: 0.2 },         // Extra Air boost for Libra
            'scorpio': { Water: 0.2 },     // Extra Water boost for Scorpio
            'sagittarius': { Fire: 0.2 },  // Extra Fire boost for sagittarius
            'capricorn': { Earth: 0.2 },   // Extra Earth boost for capricorn
            'aquarius': { Air: 0.2 },      // Extra Air boost for aquarius
            'pisces': { Water: 0.2 }       // Extra Water boost for pisces
        };
        
        // Apply specific zodiac adjustments
        const specificAdjustments = zodiacModifiers[sign] || {};
        
        // Combine seasonal modifiers with specific zodiac adjustments
        const result = { ...seasonalModifiers };
        Object.entries(specificAdjustments).forEach(([element, value]) => {
            // Use nullish coalescing to ensure value is never undefined
            result[element as keyof ElementalProperties] += (value || 0);
        });
        
        // Normalize to ensure values stay in valid range
        return normalizeProperties(result);
    }

    public static combineElementalProperties(properties: ElementalProperties[]): ElementalProperties {
        const result: ElementalProperties = {
            Fire: 0,
            Water: 0,
            Earth: 0,
            Air: 0
        };
        
        if (properties.length === 0) {
            return {
                Fire: 0.25,
                Water: 0.25,
                Earth: 0.25,
                Air: 0.25
            };
        }
        
        // Sum up all properties
        properties.forEach(prop => {
            Object.entries(prop).forEach(([element, value]) => {
                // Use nullish coalescing to handle undefined values
                const elementKey = element as keyof ElementalProperties;
                result[elementKey] += value || 0;
            });
        });
        
        // Normalize to ensure they sum to 1
        const total = Object.values(result).reduce((sum, val) => sum + val, 0);
        if (total > 0) {
            Object.keys(result).forEach(element => {
                const elementKey = element as keyof ElementalProperties;
                result[elementKey] = result[elementKey] / total;
            });
        } else {
            // Default to equal distribution if total is 0
            Object.keys(result).forEach(element => {
                const elementKey = element as keyof ElementalProperties;
                result[elementKey] = 0.25;
            });
        }
        
        return result;
    }
}

export default ElementalCalculator; 