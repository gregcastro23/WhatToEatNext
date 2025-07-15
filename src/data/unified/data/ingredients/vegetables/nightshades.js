import { fixIngredientMappings } from "../../../utils/elementalUtils.js";
import { createElementalProperties } from "../../../utils/elemental/elementalUtils.js";

const rawNightshades = {
    'tomato': {
        name: 'Tomato',
        elementalProperties: createElementalProperties({
            Water: 0.5,
            Fire: 0.3,
            Earth: 0.1,
            Air: 0.1
        }),
        astrologicalProfile: {
            rulingPlanets: ['Venus', 'Sun'],
            favorableZodiac: ['leo', 'taurus'],
            elementalAffinity: {
                base: 'Water',
                decanModifiers: {
                    first: { element: 'Water', planet: 'Venus' },
                    second: { element: 'Fire', planet: 'Sun' },
                    third: { element: 'Air', planet: 'Mercury' }
                }
            },
            lunarPhaseModifiers: {
                fullmoon: {
                    elementalBoost: createElementalProperties({ Water: 0.3, Fire: 0.1 }),
                    preparationTips: ['Enhanced flavor', 'Perfect for harvesting']
                },
                waxingGibbous: {
                    elementalBoost: createElementalProperties({ Water: 0.2, Earth: 0.1 }),
                    preparationTips: ['Good for preserving', 'Enhanced sweetness']
                }
            }
        },
        qualities: ['cooling', 'moistening', 'nourishing'],
        season: ['summer', 'early fall'],
        category: 'vegetable',
        subCategory: 'nightshade',
        affinities: ['basil', 'garlic', 'olive oil', 'mozzarella', 'balsamic'],
        cookingMethods: ['raw', 'roasted', 'sautéed', 'stewed'],
        nutritionalProfile: {
            fiber: 'moderate',
            vitamins: ['c', 'k', 'potassium'],
            minerals: ['folate', 'lycopene'],
            calories: 22,
            carbs_g: 4.8,
            fiber_g: 1.5
        },
        preparation: {
            washing: true,
            seeding: 'optional',
            peeling: 'optional',
            notes: 'Store at room temperature for better flavor'
        },
        storage: {
            temperature: 'room temperature until ripe',
            duration: '5-7 days',
            notes: 'Never refrigerate unless cut'
        }
    },
    'eggplant': {
        name: 'Eggplant',
        elementalProperties: createElementalProperties({
            Water: 0.4,
            Earth: 0.3,
            Air: 0.2,
            Fire: 0.1
        }),
        astrologicalProfile: {
            rulingPlanets: ['Venus', 'Moon'],
            favorableZodiac: ['cancer', 'taurus'],
            elementalAffinity: {
                base: 'Water',
                decanModifiers: {
                    first: { element: 'Water', planet: 'Moon' },
                    second: { element: 'Water', planet: 'Venus' },
                    third: { element: 'Air', planet: 'Mercury' }
                }
            },
            lunarPhaseModifiers: {
                fullmoon: {
                    elementalBoost: createElementalProperties({ Water: 0.3 }),
                    preparationTips: ['Enhanced flavor absorption', 'Best for cooking']
                },
                waxingGibbous: {
                    elementalBoost: createElementalProperties({ Earth: 0.2, Water: 0.1 }),
                    preparationTips: ['Good time for harvest', 'Enhanced texture when cooked']
                }
            }
        },
        qualities: ['cooling', 'moistening'],
        season: ['summer', 'fall'],
        category: 'vegetable',
        subCategory: 'nightshade',
        affinities: ['garlic', 'basil', 'tomato', 'olive oil', 'miso'],
        cookingMethods: ['grilled', 'roasted', 'fried', 'braised'],
        nutritionalProfile: {
            fiber: 'moderate',
            vitamins: ['b1', 'b6', 'k'],
            minerals: ['manganese', 'copper'],
            calories: 35,
            protein_g: 1,
            fiber_g: 3
        },
        preparation: {
            washing: true,
            salting: 'recommended to remove bitterness',
            cutting: 'uniform slices or cubes',
            notes: 'Salt and drain before cooking'
        },
        storage: {
            temperature: 'cool room temp or refrigerated',
            duration: '5-7 days',
            notes: 'Sensitive to ethylene gas'
        }
    }
};

// Process ingredient mappings to ensure they have all required properties
export const nightshades = fixIngredientMappings(rawNightshades);

// Export individual nightshades for direct access
export const tomato = nightshades.tomato;
export const eggplant = nightshades.eggplant;

// Default export
export default nightshades;
