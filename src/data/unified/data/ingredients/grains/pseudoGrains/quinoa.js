"use strict";
import { fixIngredientMappings } from '../../../../utils/elementalUtils';
import { createElementalProperties } from '../../../../utils/elemental/elementalUtils';

const rawQuinoa = {
    'quinoa': {
        name: 'Quinoa',
        elementalProperties: createElementalProperties({ Fire: 0.2, Water: 0.2, Earth: 0.4, Air: 0.2
        }),
        astrologicalProfile: {
            rulingPlanets: ['Mercury', 'Saturn'],
            favorableZodiac: ['virgo', 'capricorn'],
            elementalAffinity: {
                base: 'Earth',
                decanModifiers: {
                    first: { element: 'Earth', planet: 'Saturn' },
                    second: { element: 'Air', planet: 'Mercury' },
                    third: { element: 'Water', planet: 'Moon' }
                }
            },
            lunarPhaseModifiers: {
                newmoon: {
                    elementalBoost: createElementalProperties({
                        Earth: 0.2,
                        Air: 0.1
                    }),
                    preparationTips: ['Begin sprouting process', 'Mindful cooking with minimal seasonings']
                },
                fullmoon: {
                    elementalBoost: createElementalProperties({
                        Earth: 0.2,
                        Water: 0.2
                    }),
                    preparationTips: ['Perfect for celebratory dishes', 'Enhanced nutrient absorption']
                }
            }
        },
        qualities: ['earthy', 'nutty', 'balanced', 'versatile', 'complete'],
        origin: ['South America (Andes)', 'Peru', 'Bolivia'],
        season: ['all'],
        category: 'pseudo_grain',
        subCategory: 'seed',
        varieties: {
            'white': {
                name: 'White Quinoa',
                appearance: 'ivory to pale yellow',
                flavor: 'mild, slightly nutty',
                texture: 'fluffy when cooked',
                cooking_time: '15 minutes',
                culinary_uses: 'most versatile, good for all applications'
            },
            'red': {
                name: 'Red Quinoa',
                appearance: 'reddish-brown',
                flavor: 'stronger, earthier than white',
                texture: 'chewier, holds shape better',
                cooking_time: '15-20 minutes',
                culinary_uses: 'salads, dishes where texture is important'
            },
            'black': {
                name: 'Black Quinoa',
                appearance: 'deep black',
                flavor: 'earthy, slightly sweet',
                texture: 'crunchiest variety',
                cooking_time: '15-20 minutes',
                culinary_uses: 'dramatic presentation, hearty dishes'
            },
            'rainbow': {
                name: 'Rainbow/Tri-Color Quinoa',
                appearance: 'mix of white, red, and black',
                flavor: 'complex, varied',
                texture: 'varied textures',
                cooking_time: '15-20 minutes',
                culinary_uses: 'visually appealing dishes, varied texture'
            }
        },
        nutritionalProfile: {
            serving_size: "1/4 cup dry (45g)",
            calories: 170,
            macros: {
                protein: 6,
                carbs: 30,
                fat: 2.5,
                fiber: 3
            },
            vitamins: {
                B1: 0.2,
                B6: 0.2,
                folate: 0.19,
                E: 0.63
            },
            minerals: {
                magnesium: 0.3,
                phosphorus: 0.4,
                iron: 0.15,
                zinc: 0.13,
                manganese: 0.63
            },
            amino_acids: 'complete protein with all essential amino acids',
            glycemic_index: 53,
            notes: 'High in protein, technically a seed not a grain'
        },
        culinaryApplications: {
            'basic_preparation': {
                name: 'Basic Preparation',
                method: 'simmered in liquid',
                ratio: '1 part quinoa to 2 parts liquid',
                steps: [
                    'rinse thoroughly to remove saponins',
                    'combine with water or broth',
                    'bring to boil',
                    'reduce heat and simmer covered',
                    'cook 15 minutes until water is absorbed',
                    'let stand 5 minutes',
                    'fluff with fork'
                ],
                variations: {
                    'pilaf': 'toast in oil before cooking',
                    'flavor_infused': 'cook in broth instead of water',
                    'one_pot': 'add vegetables and protein during cooking'
                }
            },
            'salads': {
                name: 'Salads',
                method: 'cooled after cooking',
                applications: ['grain salads', 'vegetable mixtures', 'cold side dishes'],
                techniques: 'cool completely before mixing with other ingredients',
                notes: 'Absorbs dressings well without becoming soggy'
            },
            'breakfast': {
                name: 'Breakfast',
                method: 'cooked in milk or water',
                applications: ['porridge', 'breakfast bowls', 'morning grain'],
                techniques: 'may require more liquid for softer texture',
                notes: 'Can be prepared ahead and reheated'
            }
        },
        storage: {
            temperature: {
                dry: {
                    fahrenheit: { min: 50, max: 70 },
                    celsius: { min: 10, max: 21 }
                },
                cooked: {
                    fahrenheit: { min: 35, max: 40 },
                    celsius: { min: 1, max: 4 }
                }
            },
            duration: {
                dry: 'up to 1 year in Airtight container',
                cooked: '3-5 days refrigerated',
                frozen: 'up to 8 months'
            },
            notes: 'Store in cool, dry place away from direct light'
        }
    }
};

// Apply any fixes needed to raw ingredient data
const quinoa = fixIngredientMappings(rawQuinoa);

// Export the entire collection
export default quinoa;

// Export individual item for direct access
export const quinoaGrain = quinoa.quinoa;
