import { PlanetaryHourCalculator } from './PlanetaryHourCalculator';
import { ThermodynamicCalculator } from './ThermodynamicCalculator';
import type { ElementalProperties, ZodiacSign, Planet } from '@/types/celestial';

// Define types needed for the Food Alchemy System
export type Element = 'Fire' | 'Water' | 'Air' | 'Earth';

export interface FoodCorrespondence {
    food: string;
    foodGroup: string;
    foodType: string;
    element: Element;
    planet: Planet;
    alchemy: {
        day: number[];
        night: number[];
    };
    energyValues: {
        heat: number;
        entropy: number;
        reactivity: number;
    };
}

export interface SystemState {
    elements: Record<Element, number>;
    metrics: ThermodynamicMetrics;
}

export interface ThermodynamicMetrics {
    heat: number;
    entropy: number;
    reactivity: number;
}

export interface FoodCompatibility {
    score: number;
    recommendations: string[];
    warnings: string[];
    preparationMethods: PreparationMethod[];
}

export interface PreparationMethod {
    name: string;
    element: Element;
    planetaryRuler: Planet;
    energyEffects: {
        heat: number;
        entropy: number;
        reactivity: number;
    };
    timing: {
        optimal: Planet[];
        acceptable: Planet[];
        avoid: Planet[];
    };
}

export class FoodAlchemySystem {
    private readonly thermodynamics: ThermodynamicCalculator;
    private readonly foodDatabase: FoodCorrespondence[];
    private readonly preparationMethods: PreparationMethod[];

    constructor() {
        this.thermodynamics = new ThermodynamicCalculator();
        this.foodDatabase = this.initializeFoodDatabase();
        this.preparationMethods = this.initializePreparationMethods();
    }

    /**
     * Initializes the food correspondence database
     */
    private initializeFoodDatabase(): FoodCorrespondence[] {
        return [
            {
                food: "Garlic",
                foodGroup: "Vegetables",
                foodType: "Root",
                element: "Fire",
                planet: "Mars",
                alchemy: {
                    day: [0.8, 0.4, 0.6],
                    night: [0.6, 0.3, 0.5]
                },
                energyValues: {
                    heat: 0.8,
                    entropy: 0.4,
                    reactivity: 0.6
                }
            },
            {
                food: "Ginger",
                foodGroup: "Roots",
                foodType: "Rhizome",
                element: "Fire",
                planet: "Mars",
                alchemy: {
                    day: [0.7, 0.5, 0.6],
                    night: [0.5, 0.4, 0.5]
                },
                energyValues: {
                    heat: 0.7,
                    entropy: 0.5,
                    reactivity: 0.6
                }
            },
            // Add more foods as needed
        ];
    }

    /**
     * Initializes the preparation methods database
     */
    private initializePreparationMethods(): PreparationMethod[] {
        return [
            {
                name: 'Roasting',
                element: 'Fire',
                planetaryRuler: 'Sun',
                energyEffects: {
                    heat: 0.8,
                    entropy: 0.4,
                    reactivity: 0.6
                },
                timing: {
                    optimal: ['Sun', 'Mars'],
                    acceptable: ['Jupiter'],
                    avoid: ['Moon', 'Saturn']
                }
            },
            {
                name: 'Steaming',
                element: 'Water',
                planetaryRuler: 'Moon',
                energyEffects: {
                    heat: 0.3,
                    entropy: 0.5,
                    reactivity: 0.4
                },
                timing: {
                    optimal: ['Moon', 'Venus'],
                    acceptable: ['Mercury'],
                    avoid: ['Mars', 'Sun']
                }
            },
            // Add more methods as needed
        ];
    }

    /**
     * Calculates food compatibility based on current state
     */
    calculateFoodCompatibility(
        food: FoodCorrespondence,
        state: SystemState,
        time: Date
    ): FoodCompatibility {
        const planetaryCalculator = new PlanetaryHourCalculator();
        const rawPlanetaryHour = planetaryCalculator.calculatePlanetaryHour(time);
        // Convert the planet to the uppercase format used in this module
        const planetaryHour = rawPlanetaryHour.charAt(0).toUpperCase() + rawPlanetaryHour.slice(1) as Planet;
        const isDaytimeNow = planetaryCalculator.isDaytime(time);
        
        // Calculate base compatibility
        const elementalMatch = this.calculateElementalMatch(food, state);
        const planetaryMatch = this.calculatePlanetaryMatch(food, planetaryHour);
        const energeticMatch = this.calculateEnergeticMatch(food, state);
        
        // Apply time modifiers
        const timeModifier = isDaytimeNow ? 1.0 : 0.8; // Example modifier
        
        // Calculate final score (simplified example)
        const compatibilityScore = (
            elementalMatch * 0.4 + 
            planetaryMatch * 0.3 + 
            energeticMatch * 0.3
        ) * timeModifier;
        
        return {
            score: compatibilityScore,
            recommendations: this.generateRecommendations(food, state, time),
            warnings: this.generateWarnings(food, state),
            preparationMethods: this.getPreparationMethods(food, time)
        };
    }

    /**
     * Calculates the elemental match between a food and the current system state
     */
    private calculateElementalMatch(food: FoodCorrespondence, state: SystemState): number {
        if (!food || !state || !state.elements) {
            return 0.5; // Default neutral value
        }
        
        // Calculate how well the food's element matches with the current elemental state
        // Higher value means better match (balancing or enhancing)
        
        const foodElement = food.element;
        if (!foodElement || !state.elements[foodElement]) {
            return 0.5; // Default if missing data
        }
        
        // Get the current elemental balance
        const { Fire, Water, Air, Earth } = state.elements;
        
        // Calculate the dominant and weakest elements
        const elementValues = [
            { element: 'Fire', value: Fire },
            { element: 'Water', value: Water },
            { element: 'Air', value: Air },
            { element: 'Earth', value: Earth }
        ];
        elementValues.sort((a, b) => b.value - a.value);
        
        const dominantElement = elementValues[0].element;
        const weakestElement = elementValues[3].element;
        
        // Define elemental relationships (balancing elements)
        const balances: Record<Element, Element> = {
            'Fire': 'Water',
            'Water': 'Fire',
            'Air': 'Earth',
            'Earth': 'Air'
        };
        
        // Calculate match score
        let matchScore = 0.5; // Start with neutral
        
        // If the system needs more of this element (it's the weakest), give high score
        if (foodElement === weakestElement) {
            matchScore += 0.3;
        }
        
        // If this element can balance the dominant element
        if (foodElement === balances[dominantElement as Element]) {
            matchScore += 0.2;
        }
        
        // If this element would further imbalance the system (adding to dominant)
        if (foodElement === dominantElement && elementValues[0].value > 0.7) {
            matchScore -= 0.2;
        }
        
        // Normalize score to range 0-1
        return Math.max(0, Math.min(1, matchScore));
    }

    private calculatePlanetaryMatch(food: FoodCorrespondence, planetaryHour: Planet): number {
        if (!food || !planetaryHour) {
            return 0.5; // Default neutral value
        }
        
        // Calculate match between food's planetary ruler and current planetary hour
        
        // Direct match: food's planet matches the current planetary hour
        if (food.planet === planetaryHour) {
            return 0.9; // Strong positive match
        }
        
        // Define planetary relationships (complementary and challenging)
        const complementary: Record<Planet, Planet[]> = {
            'Sun': ['Jupiter', 'Mars'],
            'Moon': ['Venus', 'Neptune'],
            'Mercury': ['Venus', 'Uranus'],
            'Venus': ['Moon', 'Jupiter'],
            'Mars': ['Sun', 'Pluto'],
            'Jupiter': ['Sun', 'Venus'],
            'Saturn': ['Mercury', 'Uranus'],
            'Uranus': ['Mercury', 'Saturn'],
            'Neptune': ['Moon', 'Venus'],
            'Pluto': ['Mars', 'Saturn']
        };
        
        const challenging: Record<Planet, Planet[]> = {
            'Sun': ['Saturn', 'Uranus'],
            'Moon': ['Mars', 'Saturn'],
            'Mercury': ['Jupiter', 'Neptune'],
            'Venus': ['Mars', 'Uranus'],
            'Mars': ['Venus', 'Moon'],
            'Jupiter': ['Mercury', 'Saturn'],
            'Saturn': ['Sun', 'Jupiter'],
            'Uranus': ['Sun', 'Venus'],
            'Neptune': ['Mercury', 'Mars'],
            'Pluto': ['Venus', 'Jupiter']
        };
        
        // Check for complementary relationship
        if (complementary[food.planet]?.includes(planetaryHour)) {
            return 0.75; // Good positive match
        }
        
        // Check for challenging relationship
        if (challenging[food.planet]?.includes(planetaryHour)) {
            return 0.25; // Negative match
        }
        
        // Neutral relationship
        return 0.5;
    }

    private calculateEnergeticMatch(food: FoodCorrespondence, state: SystemState): number {
        if (!food || !state || !food.energyValues || !state.metrics) {
            return 0.5; // Default neutral value
        }
        
        // Calculate match between food's energetic values and current system state
        
        const foodEnergy = food.energyValues;
        const systemEnergy = state.metrics;
        
        // Calculate the energetic balance needed
        // For each metric (heat, entropy, reactivity):
        // - If system value is high (>0.7), we want a lower food value
        // - If system value is low (<0.3), we want a higher food value
        // - If system value is balanced, we want a similar food value
        
        let heatMatch = 0.5;
        let entropyMatch = 0.5;
        let reactivityMatch = 0.5;
        
        // Heat balance
        if (systemEnergy.heat > 0.7 && foodEnergy.heat < 0.3) {
            // System is hot, food is cooling - good match
            heatMatch = 0.8;
        } else if (systemEnergy.heat < 0.3 && foodEnergy.heat > 0.7) {
            // System is cool, food is warming - good match
            heatMatch = 0.8;
        } else if (Math.abs(systemEnergy.heat - foodEnergy.heat) < 0.2) {
            // Food maintains current heat - neutral match
            heatMatch = 0.6;
        } else if ((systemEnergy.heat > 0.7 && foodEnergy.heat > 0.7) || 
                   (systemEnergy.heat < 0.3 && foodEnergy.heat < 0.3)) {
            // Food amplifies imbalance - poor match
            heatMatch = 0.2;
        }
        
        // Entropy balance - similar logic
        if (systemEnergy.entropy > 0.7 && foodEnergy.entropy < 0.3) {
            entropyMatch = 0.8;
        } else if (systemEnergy.entropy < 0.3 && foodEnergy.entropy > 0.7) {
            entropyMatch = 0.8;
        } else if (Math.abs(systemEnergy.entropy - foodEnergy.entropy) < 0.2) {
            entropyMatch = 0.6;
        } else if ((systemEnergy.entropy > 0.7 && foodEnergy.entropy > 0.7) || 
                   (systemEnergy.entropy < 0.3 && foodEnergy.entropy < 0.3)) {
            entropyMatch = 0.2;
        }
        
        // Reactivity balance - similar logic
        if (systemEnergy.reactivity > 0.7 && foodEnergy.reactivity < 0.3) {
            reactivityMatch = 0.8;
        } else if (systemEnergy.reactivity < 0.3 && foodEnergy.reactivity > 0.7) {
            reactivityMatch = 0.8;
        } else if (Math.abs(systemEnergy.reactivity - foodEnergy.reactivity) < 0.2) {
            reactivityMatch = 0.6;
        } else if ((systemEnergy.reactivity > 0.7 && foodEnergy.reactivity > 0.7) || 
                   (systemEnergy.reactivity < 0.3 && foodEnergy.reactivity < 0.3)) {
            reactivityMatch = 0.2;
        }
        
        // Weighted average of all three matches
        return (heatMatch * 0.4 + entropyMatch * 0.3 + reactivityMatch * 0.3);
    }

    private generateRecommendations(food: FoodCorrespondence, state: SystemState, time: Date): string[] {
        if (!food) {
            return [];
        }
        
        const recommendations: string[] = [];
        const hour = time.getHours();
        const isDaytime = hour >= 6 && hour < 18;
        
        // Add food-specific recommendations
        recommendations.push(`${food.food} aligns with ${food.planet}, enhancing its ${food.element} properties.`);
        
        // Add time-based recommendations
        const timeOfDay = isDaytime ? 'daytime' : 'nighttime';
        recommendations.push(`Consuming during ${timeOfDay} enhances its ${isDaytime ? 'active' : 'receptive'} qualities.`);
        
        // Add recommendations based on elemental balance
        const { Fire, Water, Air, Earth } = state.elements;
        
        if (food.element === 'Fire' && Fire < 0.3) {
            recommendations.push(`This food will help increase your Fire element, enhancing motivation and energy.`);
        } else if (food.element === 'Water' && Water < 0.3) {
            recommendations.push(`This food will help increase your Water element, improving emotional balance and intuition.`);
        } else if (food.element === 'Air' && Air < 0.3) {
            recommendations.push(`This food will help increase your Air element, supporting mental clarity and communication.`);
        } else if (food.element === 'Earth' && Earth < 0.3) {
            recommendations.push(`This food will help increase your Earth element, promoting stability and grounding.`);
        }
        
        // Add preparation recommendations
        const preparationMethods = this.getPreparationMethods(food, time);
        if (preparationMethods.length > 0) {
            const methodNames = preparationMethods.map(m => m.name).join(', ');
            recommendations.push(`Best preparation methods: ${methodNames}.`);
        }
        
        return recommendations;
    }

    private generateWarnings(food: FoodCorrespondence, state: SystemState): string[] {
        if (!food || !state) {
            return [];
        }
        
        const warnings: string[] = [];
        
        // Check for elemental imbalances
        const { Fire, Water, Air, Earth } = state.elements;
        
        if (food.element === 'Fire' && Fire > 0.7) {
            warnings.push(`High Fire energy detected. This food may increase irritability or impulsiveness.`);
        } else if (food.element === 'Water' && Water > 0.7) {
            warnings.push(`High Water energy detected. This food may increase emotional sensitivity or lethargy.`);
        } else if (food.element === 'Air' && Air > 0.7) {
            warnings.push(`High Air energy detected. This food may increase anxiety or scattered thinking.`);
        } else if (food.element === 'Earth' && Earth > 0.7) {
            warnings.push(`High Earth energy detected. This food may increase sluggishness or resistance to change.`);
        }
        
        // Check for energetic imbalances
        if (food.energyValues && state.metrics) {
            if (state.metrics.heat > 0.8 && food.energyValues.heat > 0.7) {
                warnings.push(`Your system is already running hot. This warming food may intensify this imbalance.`);
            }
            
            if (state.metrics.entropy > 0.8 && food.energyValues.entropy > 0.7) {
                warnings.push(`Your system is already highly entropic. This chaotic food may increase disorganization.`);
            }
            
            if (state.metrics.reactivity > 0.8 && food.energyValues.reactivity > 0.7) {
                warnings.push(`Your system is already highly reactive. This stimulating food may increase sensitivity.`);
            }
        }
        
        return warnings;
    }

    private getPreparationMethods(food: FoodCorrespondence, time: Date): PreparationMethod[] {
        if (!food || !this.preparationMethods || this.preparationMethods.length === 0) {
            return [];
        }
        
        // Determine current planetary hour (simplified)
        const hourOfDay = time.getHours() % 12;
        const planetaryHours: Planet[] = [
            'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 
            'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 
            'Moon', 'Saturn'
        ];
        const currentPlanetaryHour = planetaryHours[hourOfDay];
        
        // Determine if it's daytime or nighttime
        const isDaytime = time.getHours() >= 6 && time.getHours() < 18;
        
        // Filter methods compatible with the food and current time
        return this.preparationMethods.filter(method => 
            this.isMethodCompatible(method, food, currentPlanetaryHour, isDaytime)
        );
    }

    private isMethodCompatible(
        method: PreparationMethod,
        food: FoodCorrespondence,
        planetaryHour: Planet,
        isDaytimeNow: boolean
    ): boolean {
        if (!method || !food) {
            return false;
        }
        
        // Check elemental compatibility
        // Methods that share or complement the food's element are preferred
        const elementalMatch = 
            method.element === food.element || 
            (food.element === 'Fire' && method.element === 'Air') ||
            (food.element === 'Air' && method.element === 'Fire') ||
            (food.element === 'Water' && method.element === 'Earth') ||
            (food.element === 'Earth' && method.element === 'Water');
            
        // Check planetary compatibility
        const planetaryMatch = 
            method.timing.optimal.includes(planetaryHour) ||
            (method.timing.acceptable.includes(planetaryHour) && !method.timing.avoid.includes(planetaryHour));
            
        // Check if method is appropriate for time of day
        // Some methods are better for day (solar) and others for night (lunar)
        const timeAppropriate = 
            (isDaytimeNow && (method.element === 'Fire' || method.element === 'Air')) ||
            (!isDaytimeNow && (method.element === 'Water' || method.element === 'Earth')) ||
            method.planetaryRuler === 'Sun' && isDaytimeNow ||
            method.planetaryRuler === 'Moon' && !isDaytimeNow;
        
        // Method is compatible if at least two of the three conditions are true
        const compatibilityFactors = [elementalMatch, planetaryMatch, timeAppropriate];
        const trueFactors = compatibilityFactors.filter(Boolean).length;
        
        return trueFactors >= 2;
    }

    // Add other methods as needed
} 