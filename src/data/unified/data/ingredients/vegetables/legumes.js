import { fixIngredientMappings } from "../../../utils/elementalUtils.js";
import { createElementalProperties } from "../../../utils/elemental/elementalUtils.js";

const rawLegumes = {
    'green beans': {
        name: 'Green beans',
        elementalProperties: createElementalProperties({
            Earth: 0.4,
            Air: 0.3,
            Water: 0.2,
            Fire: 0.1
        }),
        astrologicalProfile: {
            rulingPlanets: ['Venus', 'Mercury'],
            favorableZodiac: ['taurus', 'virgo'],
            elementalAffinity: {
                base: 'Earth',
                decanModifiers: {
                    first: { element: 'Earth', planet: 'Venus' },
                    second: { element: 'Earth', planet: 'Mercury' },
                    third: { element: 'Air', planet: 'Saturn' }
                }
            },
            lunarPhaseModifiers: {
                newmoon: {
                    elementalBoost: createElementalProperties({ Air: 0.2, Earth: 0.1 }),
                    preparationTips: ['Quick blanching', 'Fresh preparations']
                },
                fullmoon: {
                    elementalBoost: createElementalProperties({ Water: 0.2, Earth: 0.1 }),
                    preparationTips: ['Slower cooking methods', 'Fermentation']
                }
            }
        },
        qualities: ['nourishing', 'balancing', 'versatile'],
        season: ['summer', 'early fall'],
        category: 'vegetable',
        subCategory: 'legume',
        affinities: ['garlic', 'almonds', 'lemon', 'butter', 'bacon', 'tomatoes', 'mushrooms'],
        cookingMethods: ['steamed', 'sautéed', 'blanched', 'roasted', 'stir-fried', 'braised'],
        nutritionalProfile: {
            fiber: 'high',
            vitamins: ['k', 'c', 'a', 'folate', 'b6'],
            minerals: ['iron', 'calcium', 'potassium', 'manganese'],
            calories: 31,
            protein_g: 1.8,
            fiber_g: 2.7,
            carbs_g: 7,
            antioxidants: ['flavonoids', 'carotenoids']
        },
        preparation: {
            washing: true,
            trimming: 'remove stem ends',
            cutting: 'trim into uniform lengths',
            blanching: '2-3 minutes for bright color and crisp texture',
            notes: 'Can be prepared ahead and refrigerated'
        },
        varieties: {
            'haricot vert': {
                characteristics: 'thin, French-style bean',
                texture: 'tender, delicate',
                cooking: 'quick cooking, less than standard green beans',
                uses: 'elegant dishes, quick sautés'
            },
            'romano': {
                characteristics: 'flat, wide beans',
                texture: 'meaty, substantial',
                cooking: 'longer cooking time than standard varieties',
                uses: 'braising, stews, substantial side dishes'
            },
            'yellow wax': {
                characteristics: 'golden yellow color',
                texture: 'crisp, similar to green beans',
                cooking: 'same methods as green beans',
                uses: 'visual contrast, all standard green bean preparations'
            },
            'purple': {
                characteristics: 'deep purple color that turns green when cooked',
                texture: 'similar to standard green beans',
                cooking: 'best used raw or lightly cooked to preserve color',
                uses: 'raw applications, light steaming, blanching'
            }
        },
        storage: {
            temperature: 'refrigerated',
            duration: '5-7 days',
            humidity: 'high',
            method: 'paper towel in plastic bag',
            notes: 'Do not wash until ready to use'
        }
    },
    'snap peas': {
        name: 'Snap peas',
        elementalProperties: createElementalProperties({
            Water: 0.4,
            Earth: 0.3,
            Air: 0.2,
            Fire: 0.1
        }),
        astrologicalProfile: {
            rulingPlanets: ['Venus', 'Moon'],
            favorableZodiac: ['taurus', 'cancer'],
            elementalAffinity: {
                base: 'Water',
                decanModifiers: {
                    first: { element: 'Water', planet: 'Moon' },
                    second: { element: 'Water', planet: 'Venus' },
                    third: { element: 'Earth', planet: 'Mercury' }
                }
            },
            lunarPhaseModifiers: {
                newmoon: {
                    elementalBoost: createElementalProperties({ Water: 0.2, Air: 0.1 }),
                    preparationTips: ['Fresh eating', 'Light preparations']
                },
                fullmoon: {
                    elementalBoost: createElementalProperties({ Water: 0.3 }),
                    preparationTips: ['Enhanced sweetness', 'Perfect for harvesting']
                }
            }
        },
        qualities: ['sweet', 'refreshing', 'crisp', 'delicate'],
        season: ['spring', 'early summer'],
        category: 'vegetable',
        subCategory: 'legume',
        affinities: ['mint', 'butter', 'sesame', 'ginger', 'garlic', 'lemon'],
        cookingMethods: ['raw', 'steamed', 'stir-fried', 'blanched', 'sautéed'],
        nutritionalProfile: {
            fiber: 'moderate',
            vitamins: ['c', 'k', 'a', 'folate'],
            minerals: ['iron', 'potassium', 'magnesium'],
            calories: 42,
            protein_g: 2.8,
            fiber_g: 2.6,
            carbs_g: 7.5
        },
        preparation: {
            washing: true,
            trimming: 'remove stem end and string if tough',
            notes: 'Best used fresh, can be eaten whole with pod'
        },
        storage: {
            temperature: 'refrigerated',
            duration: '3-5 days',
            humidity: 'high',
            method: 'paper towel in plastic bag',
            notes: 'Consume quickly for best flavor and texture'
        }
    },
    'snow peas': {
        name: 'Snow peas',
        elementalProperties: createElementalProperties({
            Air: 0.4,
            Water: 0.3,
            Earth: 0.2,
            Fire: 0.1
        }),
        astrologicalProfile: {
            rulingPlanets: ['Mercury', 'Moon'],
            favorableZodiac: ['gemini', 'cancer'],
            elementalAffinity: {
                base: 'Air',
                secondary: 'Water',
                decanModifiers: {
                    first: { element: 'Air', planet: 'Mercury' },
                    second: { element: 'Water', planet: 'Moon' },
                    third: { element: 'Earth', planet: 'Venus' }
                }
            },
            lunarPhaseModifiers: {
                newmoon: {
                    elementalBoost: createElementalProperties({ Air: 0.2 }),
                    preparationTips: ['Fresh preparations', 'Quick cooking methods']
                },
                fullmoon: {
                    elementalBoost: createElementalProperties({ Water: 0.2, Air: 0.1 }),
                    preparationTips: ['Enhanced crispness', 'Perfect harvest time']
                }
            }
        },
        qualities: ['light', 'crisp', 'refreshing', 'delicate'],
        season: ['spring', 'early summer'],
        category: 'vegetable',
        subCategory: 'legume',
        affinities: ['ginger', 'sesame', 'soy sauce', 'garlic', 'mint', 'lemon'],
        cookingMethods: ['stir-fried', 'raw', 'blanched', 'steamed', 'sautéed'],
        nutritionalProfile: {
            fiber: 'moderate',
            vitamins: ['c', 'k', 'a', 'folate', 'b1'],
            minerals: ['iron', 'potassium', 'manganese'],
            calories: 42,
            protein_g: 2.8,
            fiber_g: 2.6,
            carbs_g: 7.5
        },
        preparation: {
            washing: true,
            trimming: 'remove stem end and string along the seam',
            notes: 'Best used fresh, can be eaten whole'
        },
        storage: {
            temperature: 'refrigerated',
            duration: '3-5 days',
            humidity: 'high',
            method: 'paper towel in plastic bag',
            notes: 'Consume quickly for best flavor and texture'
        }
    },
    'edamame': {
        name: 'Edamame',
        elementalProperties: createElementalProperties({
            Earth: 0.5,
            Water: 0.3,
            Air: 0.1,
            Fire: 0.1
        }),
        astrologicalProfile: {
            rulingPlanets: ['Venus', 'Saturn'],
            favorableZodiac: ['taurus', 'capricorn'],
            elementalAffinity: {
                base: 'Earth',
                decanModifiers: {
                    first: { element: 'Earth', planet: 'Venus' },
                    second: { element: 'Earth', planet: 'Saturn' },
                    third: { element: 'Water', planet: 'Moon' }
                }
            },
            lunarPhaseModifiers: {
                fullmoon: {
                    elementalBoost: createElementalProperties({ Earth: 0.3, Water: 0.1 }),
                    preparationTips: ['Enhanced protein content', 'Perfect harvest time']
                },
                waxingGibbous: {
                    elementalBoost: createElementalProperties({ Earth: 0.2 }),
                    preparationTips: ['Good for preservation', 'Enhanced sweetness']
                }
            }
        },
        qualities: ['nourishing', 'protein-rich', 'satisfying'],
        season: ['summer', 'early fall'],
        category: 'vegetable',
        subCategory: 'legume',
        affinities: ['sea salt', 'sesame oil', 'garlic', 'ginger', 'soy sauce'],
        cookingMethods: ['steamed', 'boiled', 'blanched'],
        nutritionalProfile: {
            fiber: 'high',
            vitamins: ['k', 'c', 'folate'],
            minerals: ['iron', 'calcium', 'magnesium'],
            calories: 121,
            protein_g: 11.9,
            fiber_g: 5.2,
            carbs_g: 9.9
        },
        preparation: {
            washing: true,
            notes: 'Can be served hot or cold, in pod or shelled'
        },
        storage: {
            temperature: 'refrigerated',
            duration: '3-5 days',
            method: 'plastic bag',
            notes: 'Best consumed fresh'
        }
    },
    'lima beans': {
        name: 'Lima beans',
        elementalProperties: createElementalProperties({
            Earth: 0.6,
            Water: 0.2,
            Air: 0.1,
            Fire: 0.1
        }),
        astrologicalProfile: {
            rulingPlanets: ['Saturn', 'Venus'],
            favorableZodiac: ['capricorn', 'taurus'],
            elementalAffinity: {
                base: 'Earth',
                decanModifiers: {
                    first: { element: 'Earth', planet: 'Saturn' },
                    second: { element: 'Earth', planet: 'Venus' },
                    third: { element: 'Water', planet: 'Moon' }
                }
            },
            lunarPhaseModifiers: {
                waningGibbous: {
                    elementalBoost: createElementalProperties({ Earth: 0.3 }),
                    preparationTips: ['Enhanced protein content', 'Good for preservation']
                },
                lastQuarter: {
                    elementalBoost: createElementalProperties({ Earth: 0.2, Water: 0.1 }),
                    preparationTips: ['Best for slow cooking methods']
                }
            }
        },
        qualities: ['grounding', 'nourishing', 'substantial'],
        season: ['summer', 'fall'],
        category: 'vegetable',
        subCategory: 'legume',
        affinities: ['garlic', 'onion', 'herbs', 'butter', 'cream'],
        cookingMethods: ['boiled', 'braised', 'stewed', 'pureed'],
        nutritionalProfile: {
            fiber: 'high',
            vitamins: ['b1', 'b6', 'folate'],
            minerals: ['iron', 'magnesium', 'potassium'],
            calories: 115,
            protein_g: 7.8,
            fiber_g: 7,
            carbs_g: 20.9
        },
        preparation: {
            washing: true,
            soaking: 'recommended for dried beans',
            notes: 'Can be used fresh or dried'
        },
        storage: {
            temperature: 'refrigerated',
            duration: '3-5 days fresh',
            method: 'plastic bag',
            notes: 'Can be frozen for longer storage'
        }
    }
};

// Fix the ingredient mappings to ensure they have all required properties
export const legumes = fixIngredientMappings(rawLegumes);

// Export individual legumes for direct access
export const greenBeans = legumes['green beans'];
export const snapPeas = legumes['snap peas'];
export const snowPeas = legumes['snow peas'];
export const edamame = legumes.edamame;
export const limaBeans = legumes['lima beans'];

// Default export
export default legumes;
