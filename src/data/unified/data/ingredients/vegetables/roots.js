import { fixIngredientMappings } from "../../../utils/elementalUtils.js";
import { createElementalProperties } from "../../../utils/elemental/elementalUtils.js";

const rawRootVegetables = {
    'heirloom_carrot': {
        name: 'Heirloom Carrot',
        elementalProperties: createElementalProperties({
            Earth: 0.5,
            Water: 0.2,
            Fire: 0.2,
            Air: 0.1
        }),
        astrologicalProfile: {
            rulingPlanets: ['Venus', 'Saturn'],
            favorableZodiac: ['taurus', 'virgo', 'capricorn'],
            elementalAffinity: {
                base: 'Earth',
                decanModifiers: {
                    first: { element: 'Earth', planet: 'Venus' },
                    second: { element: 'Earth', planet: 'Saturn' },
                    third: { element: 'Air', planet: 'Mercury' }
                }
            },
            lunarPhaseModifiers: {
                fullmoon: {
                    elementalBoost: createElementalProperties({ Earth: 0.3 }),
                    preparationTips: ['Enhanced flavor', 'Best for roasting']
                },
                newmoon: {
                    elementalBoost: createElementalProperties({ Water: 0.2 }),
                    preparationTips: ['Good for preservation', 'Best for juice extraction']
                }
            }
        },
        subCategory: 'root',
        season: ['summer', 'fall'],
        category: 'vegetable',
        cookingMethods: ['roast', 'saute', 'steam', 'raw'],
        qualities: ['grounding', 'nourishing', 'sweet'],
        affinities: ['ginger', 'cumin', 'thyme', 'orange', 'maple'],
        nutritionalProfile: {
            fiber: 'high',
            vitamins: ['a', 'k', 'c'],
            minerals: ['potassium', 'magnesium'],
            calories: 41,
            carbs_g: 9.6,
            fiber_g: 2.8
        },
        preparation: {
            washing: true,
            peeling: 'optional',
            notes: 'Can be used whole for presentation'
        },
        storage: {
            temperature: 'refrigerated',
            duration: '2-3 weeks',
            notes: 'Remove greens before storing'
        }
    },
    'black_radish': {
        name: 'Black Radish',
        elementalProperties: createElementalProperties({
            Earth: 0.4,
            Fire: 0.3,
            Air: 0.2,
            Water: 0.1
        }),
        astrologicalProfile: {
            rulingPlanets: ['Saturn', 'Mars'],
            favorableZodiac: ['scorpio', 'capricorn', 'aquarius'],
            elementalAffinity: {
                base: 'Earth',
                decanModifiers: {
                    first: { element: 'Earth', planet: 'Saturn' },
                    second: { element: 'Fire', planet: 'Mars' },
                    third: { element: 'Air', planet: 'Uranus' }
                }
            },
            lunarPhaseModifiers: {
                waningGibbous: {
                    elementalBoost: createElementalProperties({ Earth: 0.2, Fire: 0.1 }),
                    preparationTips: ['Enhanced pungency', 'Good for pickling']
                },
                lastQuarter: {
                    elementalBoost: createElementalProperties({ Air: 0.2 }),
                    preparationTips: ['Best for cleansing preparations']
                }
            }
        },
        subCategory: 'root',
        season: ['fall', 'winter'],
        category: 'vegetable',
        cookingMethods: ['roast', 'pickle', 'raw'],
        qualities: ['warming', 'pungent', 'cleansing'],
        affinities: ['apple', 'horseradish', 'dill', 'vinegar', 'caraway'],
        nutritionalProfile: {
            fiber: 'high',
            vitamins: ['c', 'b6'],
            minerals: ['potassium', 'phosphorus'],
            calories: 20,
            carbs_g: 4.2,
            fiber_g: 1.6
        },
        preparation: {
            washing: true,
            peeling: 'recommended for older radishes',
            notes: 'Soak in cold water to reduce pungency'
        },
        storage: {
            temperature: 'refrigerated',
            duration: '2-3 weeks',
            notes: 'Store in plastic bag with moisture'
        }
    },
    'carrot': {
        name: 'Carrot',
        elementalProperties: createElementalProperties({
            Earth: 0.4,
            Water: 0.3,
            Fire: 0.2,
            Air: 0.1
        }),
        astrologicalProfile: {
            rulingPlanets: ['Venus', 'Moon'],
            favorableZodiac: ['taurus', 'cancer'],
            elementalAffinity: {
                base: 'Earth',
                decanModifiers: {
                    first: { element: 'Earth', planet: 'Venus' },
                    second: { element: 'Water', planet: 'Moon' },
                    third: { element: 'Air', planet: 'Mercury' }
                }
            },
            lunarPhaseModifiers: {
                newmoon: {
                    elementalBoost: createElementalProperties({ Water: 0.2, Air: 0.1 }),
                    preparationTips: ['Best for juicing']
                },
                fullmoon: {
                    elementalBoost: createElementalProperties({ Earth: 0.2, Fire: 0.1 }),
                    preparationTips: ['Ideal for roasted dishes']
                }
            }
        },
        subCategory: 'root',
        season: ['spring', 'summer', 'fall', 'winter'],
        category: 'vegetable',
        cookingMethods: ['roast', 'boil', 'steam', 'raw', 'juice'],
        qualities: ['grounding', 'sweet', 'nourishing'],
        affinities: ['ginger', 'cumin', 'honey', 'orange', 'parsley'],
        nutritionalProfile: {
            fiber: 'high',
            vitamins: ['a', 'k1', 'c'],
            minerals: ['potassium', 'biotin'],
            calories: 41,
            carbs_g: 9.6,
            fiber_g: 2.8
        },
        preparation: {
            washing: true,
            peeling: 'optional',
            notes: 'Remove greens before storing'
        },
        storage: {
            temperature: 'refrigerated',
            duration: '2-3 weeks',
            notes: 'Store in crisper drawer'
        }
    },
    'ginger': {
        name: 'Ginger',
        elementalProperties: createElementalProperties({ 
            Fire: 0.5, 
            Earth: 0.3, 
            Air: 0.1,
            Water: 0.1
        }),
        astrologicalProfile: {
            rulingPlanets: ['Mars', 'Sun'],
            favorableZodiac: ['aries', 'leo'],
            elementalAffinity: {
                base: 'Fire',
                decanModifiers: {
                    first: { element: 'Fire', planet: 'Mars' },
                    second: { element: 'Fire', planet: 'Sun' },
                    third: { element: 'Earth', planet: 'Venus' }
                }
            },
            lunarPhaseModifiers: {
                firstQuarter: {
                    elementalBoost: createElementalProperties({ Fire: 0.3 }),
                    preparationTips: ['Maximum potency', 'Enhanced medicinal properties']
                },
                fullmoon: {
                    elementalBoost: createElementalProperties({ Fire: 0.2, Earth: 0.1 }),
                    preparationTips: ['Good for flavor extraction', 'Best for infusions']
                }
            }
        },
        subCategory: 'root',
        season: ['fall', 'winter'],
        category: 'vegetable',
        cookingMethods: ['raw', 'juice', 'infuse', 'candy'],
        qualities: ['warming', 'stimulating', 'medicinal'],
        affinities: ['lemon', 'honey', 'turmeric', 'garlic', 'citrus'],
        nutritionalProfile: {
            fiber: 'moderate',
            vitamins: ['b6', 'c'],
            minerals: ['magnesium', 'manganese'],
            calories: 80,
            carbs_g: 17.8,
            fiber_g: 2
        },
        preparation: {
            washing: true,
            peeling: 'optional for young ginger',
            notes: 'Can be used fresh, dried, or powdered'
        },
        storage: {
            temperature: 'refrigerated or frozen',
            duration: '2-3 weeks fresh, 6 months frozen',
            notes: 'Wrap in paper towel in plastic bag'
        }
    },
    'jerusalem_artichoke': {
        name: 'Jerusalem Artichoke',
        elementalProperties: createElementalProperties({
            Earth: 0.4,
            Water: 0.3,
            Air: 0.2,
            Fire: 0.1
        }),
        astrologicalProfile: {
            rulingPlanets: ['Saturn', 'Uranus'],
            favorableZodiac: ['capricorn', 'aquarius'],
            elementalAffinity: {
                base: 'Earth',
                decanModifiers: {
                    first: { element: 'Earth', planet: 'Saturn' },
                    second: { element: 'Air', planet: 'Uranus' },
                    third: { element: 'Water', planet: 'Neptune' }
                }
            },
            lunarPhaseModifiers: {
                waningCrescent: {
                    elementalBoost: createElementalProperties({ Earth: 0.2, Air: 0.1 }),
                    preparationTips: ['Good for fermentation', 'Enhanced digestibility']
                },
                newmoon: {
                    elementalBoost: createElementalProperties({ Water: 0.2 }),
                    preparationTips: ['Best for raw preparations']
                }
            }
        },
        subCategory: 'root',
        season: ['fall', 'winter'],
        category: 'vegetable',
        cookingMethods: ['roast', 'saute', 'raw', 'pickle'],
        qualities: ['grounding', 'prebiotic', 'nutritious'],
        affinities: ['garlic', 'thyme', 'lemon', 'butter', 'sage'],
        nutritionalProfile: {
            fiber: 'high',
            vitamins: ['b1', 'b3'],
            minerals: ['iron', 'potassium'],
            calories: 73,
            carbs_g: 17.4,
            fiber_g: 1.6
        },
        preparation: {
            washing: true,
            peeling: 'optional',
            notes: 'Can cause digestive issues if not cooked properly'
        },
        storage: {
            temperature: 'refrigerated',
            duration: '1-2 weeks',
            notes: 'Store in plastic bag with moisture'
        }
    }
};

// Fix the ingredient mappings to ensure they have all required properties
export const roots = fixIngredientMappings(rawRootVegetables);

// Export individual roots for direct access
export const heirloomCarrot = roots.heirloom_carrot;
export const blackRadish = roots.black_radish;
export const carrot = roots.carrot;
export const ginger = roots.ginger;
export const jerusalemArtichoke = roots.jerusalem_artichoke;

// Export the full collection
export const rootVegetables = roots;

// Default export
export default roots;
