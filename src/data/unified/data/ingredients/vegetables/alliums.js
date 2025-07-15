import { fixIngredientMappings } from "../../../utils/elementalUtils.js";
import { createElementalProperties } from "../../../utils/elemental/elementalUtils.js";

const rawAlliums = {
    'garlic': {
        name: 'Garlic',
        elementalProperties: createElementalProperties({ 
            Fire: 0.5, 
            Water: 0.1, 
            Earth: 0.3, 
            Air: 0.1
        }),
        astrologicalProfile: {
            rulingPlanets: ['Mars', 'Pluto'],
            favorableZodiac: ['aries', 'scorpio'],
            elementalAffinity: {
                base: 'Fire',
                decanModifiers: {
                    first: { element: 'Fire', planet: 'Mars' },
                    second: { element: 'Fire', planet: 'Sun' },
                    third: { element: 'Air', planet: 'Mercury' }
                }
            },
            lunarPhaseModifiers: {
                newmoon: {
                    elementalBoost: createElementalProperties({ Fire: 0.2, Earth: 0.1 }),
                    preparationTips: ['Best for medicinal preparations', 'Raw applications enhanced']
                },
                fullmoon: {
                    elementalBoost: createElementalProperties({ Water: 0.2, Air: 0.1 }),
                    preparationTips: ['Roasted garlic develops deeper flavor', 'Fermentation enhanced']
                },
                waxingGibbous: {
                    elementalBoost: createElementalProperties({ Fire: 0.1, Earth: 0.2 }),
                    preparationTips: ['Excellent for infusion into oils', 'Enhanced preservation properties']
                }
            }
        },
        qualities: ['warming', 'pungent', 'drying', 'protective', 'cleansing'],
        season: ['all'],
        category: 'vegetable',
        subCategory: 'allium',
        affinities: ['olive oil', 'herbs', 'ginger', 'chili', 'lemon', 'tomato', 'mushrooms', 'wine'],
        cookingMethods: ['roasted', 'sautéed', 'raw', 'confit', 'fermented', 'smoked', 'pickled'],
        nutritionalProfile: {
            vitamins: ['c', 'b6', 'b1', 'manganese'],
            minerals: ['manganese', 'selenium', 'calcium', 'phosphorus', 'copper'],
            calories: 4,
            protein_g: 0.2,
            carbs_g: 1,
            fiber_g: 0.1,
            medicinalProperties: ['allicin', 'antioxidants', 'organosulfur compounds'],
            immune_support: 'very high',
            heart_health: 'supportive',
            antimicrobial: 'potent'
        },
        preparation: {
            peeling: true,
            crushing: 'releases more compounds',
            resting: '10-15 minutes after cutting for maximum allicin development',
            notes: 'Different cutting methods alter flavor intensity',
            microplaning: 'creates paste-like consistency',
            pressing: 'more gentle than crushing',
            pre_roasting: 'leave head intact, cut top, drizzle with oil'
        },
        varieties: {
            'hardneck': {
                characteristics: 'harder central stem, fewer but larger cloves',
                flavor: 'complex, often spicier, better for raw applications',
                storage: 'shorter shelf life, 3-4 months',
                popular_types: ['Rocambole', 'Purple Stripe', 'Porcelain']
            },
            'softneck': {
                characteristics: 'no rigid center stem, more but smaller cloves',
                flavor: 'milder, better for everyday cooking',
                storage: 'longer shelf life, 6-9 months',
                popular_types: ['Artichoke', 'Silverskin', 'California Early', 'California Late']
            },
            'black': {
                characteristics: 'aged through fermentation, black cloves',
                flavor: 'sweet, umami, balsamic-like with mild garlic flavor',
                origin: 'Asian cuisines, particularly Korean',
                uses: 'specialty applications, high-end cuisine'
            },
            'elephant': {
                characteristics: 'very large cloves, not true garlic (closer to leek)',
                flavor: 'mild, less pungent than regular garlic',
                cooking: 'good for roasting or where mild flavor is wanted',
                notes: 'technically different species (Allium ampeloprasum)'
            }
        },
        culinaryApplications: {
            'roasted': {
                method: 'whole head with top cut off, wrapped in foil with oil',
                temperature: { fahrenheit: 400, celsius: 205 },
                timing: '40-60 minutes until soft and caramelized',
                uses: ['spreads', 'mashed potatoes', 'soups', 'sauces'],
                notes: 'transforms harsh flavor to sweet and nutty'
            },
            'confit': {
                method: 'slow cook peeled cloves in oil at low temperature',
                temperature: { fahrenheit: 225, celsius: 110 },
                timing: '2-3 hours until soft and golden',
                uses: ['oil for cooking', 'spread on bread', 'flavor base'],
                notes: 'both garlic and oil become flavored'
            },
            'fermented': {
                method: 'submerged in brine or honey',
                timing: '2-4 weeks',
                uses: ['heightened probiotic content', 'digestive aid', 'immune support'],
                notes: 'mellows flavor while boosting nutritional properties'
            },
            'black_garlic': {
                method: 'aged in controlled humidity and temperature',
                timing: '3-4 weeks',
                temperature: { fahrenheit: 140, celsius: 60 },
                humidity: '70-80%',
                uses: ['high-end cuisine', 'sauces', 'vinaigrettes'],
                notes: 'transformed through Maillard reaction, not fermentation'
            }
        },
        storage: {
            temperature: 'cool, dry place, 60-65°F (15-18°C)',
            duration: '3-6 months for whole heads',
            humidity: 'moderate to low',
            notes: 'Do not refrigerate whole heads; promotes sprouting',
            conditions_to_avoid: 'moisture, direct sunlight, refrigeration',
            peeled_cloves: 'refrigerate up to 1 week or submerge in oil',
            minced: 'refrigerate up to 1 day or freeze in portions'
        }
    },
    'onion': {
        name: 'Onion',
        elementalProperties: createElementalProperties({ 
            Fire: 0.3, 
            Water: 0.2, 
            Earth: 0.3, 
            Air: 0.2
        }),
        astrologicalProfile: {
            rulingPlanets: ['Mars', 'Moon'],
            favorableZodiac: ['aries', 'cancer', 'scorpio'],
            elementalAffinity: {
                base: 'Fire',
                secondary: 'Water',
                decanModifiers: {
                    first: { element: 'Fire', planet: 'Mars' },
                    second: { element: 'Water', planet: 'Moon' },
                    third: { element: 'Earth', planet: 'Saturn' }
                }
            },
            lunarPhaseModifiers: {
                newmoon: {
                    elementalBoost: createElementalProperties({ Fire: 0.2 }),
                    preparationTips: ['Good for quick pickling', 'Raw preparations enhanced']
                },
                fullmoon: {
                    elementalBoost: createElementalProperties({ Water: 0.2 }),
                    preparationTips: ['Best for caramelizing', 'Sweetness more pronounced']
                },
                waningGibbous: {
                    elementalBoost: createElementalProperties({ Earth: 0.2 }),
                    preparationTips: ['Good for long-cooking methods', 'Enhanced grounding qualities']
                }
            }
        },
        qualities: ['warming', 'stimulating', 'pungent', 'nourishing', 'versatile'],
        season: ['all'],
        category: 'vegetable',
        subCategory: 'allium',
        affinities: ['garlic', 'herbs', 'butter', 'vinegar', 'celery', 'carrots', 'bay leaf', 'wine'],
        cookingMethods: ['sautéed', 'caramelized', 'raw', 'grilled', 'roasted', 'pickled', 'fried'],
        nutritionalProfile: {
            fiber: 'moderate',
            vitamins: ['c', 'b6', 'folate', 'b1'],
            minerals: ['folate', 'potassium', 'manganese', 'copper'],
            calories: 40,
            carbs_g: 9,
            fiber_g: 1.7,
            antioxidants: ['quercetin', 'sulfur compounds', 'anthocyanins'],
            anti_inflammatory: 'moderate',
            blood_sugar_regulation: 'supportive'
        },
        preparation: {
            peeling: true,
            cutting: 'along grain for cooking, against for raw',
            notes: 'Chill before cutting to reduce tears or cut under running water',
            dicing: 'radial cuts first, then cross-cuts for even pieces',
            slicing: 'pole-to-pole for cooking, across equator for rings',
            burn_prevention: 'medium heat, stir frequently, add small amount of liquid if needed'
        },
        varieties: {
            'yellow': {
                characteristics: 'all-purpose, golden skin, white flesh',
                flavor: 'balanced sweetness and pungency',
                best_uses: ['caramelizing', 'all cooking methods'],
                storage: 'longest shelf life of common varieties'
            },
            'sweet': {
                characteristics: 'larger, flatter shape, thinner skin',
                flavor: 'notably sweeter, milder',
                best_uses: ['raw eating', 'grilling', 'roasting'],
                popular_types: ['Vidalia', 'Walla Walla', 'Maui']
            },
            'shallot': {
                characteristics: 'small, elongated, copper skin, purple-tinged flesh',
                flavor: 'delicate, sweet, less pungent than onion',
                best_uses: ['raw applications', 'vinaigrettes', 'fine dining'],
                storage: 'shorter shelf life than storage onions'
            },
            'red': {
                characteristics: 'purple-red skin, white flesh with red rings',
                flavor: 'mild, sweet, good raw',
                best_uses: ['raw eating', 'grilling', 'pickling'],
                storage: 'shorter shelf life than yellow onions'
            },
            'white': {
                characteristics: 'white skin and flesh, often larger',
                flavor: 'sharp, pungent, less sweet',
                best_uses: ['cooking', 'soups', 'stews'],
                storage: 'shorter shelf life than yellow onions'
            }
        },
        culinaryApplications: {
            'caramelized': {
                method: 'slow cook over low heat with fat',
                temperature: { fahrenheit: 300, celsius: 150 },
                timing: '30-45 minutes until golden brown',
                uses: ['soups', 'stews', 'sandwiches', 'pizza'],
                notes: 'sugar content transforms to sweetness'
            },
            'pickled': {
                method: 'submerge in vinegar solution with spices',
                timing: '1-3 days for quick pickle, weeks for fermented',
                uses: ['condiments', 'garnishes', 'sandwiches'],
                notes: 'preserves while adding tangy flavor'
            },
            'grilled': {
                method: 'cut into thick slices, oil, grill until charred',
                temperature: { fahrenheit: 400, celsius: 205 },
                timing: '8-12 minutes, flip once',
                uses: ['burgers', 'sandwiches', 'side dishes'],
                notes: 'charring adds smoky depth'
            }
        },
        storage: {
            temperature: 'cool, dry place, 45-55°F (7-13°C)',
            duration: '1-8 months depending on variety',
            humidity: 'moderate',
            notes: 'Keep away from potatoes; they release moisture',
            conditions_to_avoid: 'moisture, direct sunlight, refrigeration',
            cut_onions: 'refrigerate up to 1 week in sealed container'
        }
    },
    'leek': {
        name: 'Leek',
        elementalProperties: createElementalProperties({
            Water: 0.4,
            Earth: 0.3,
            Air: 0.2,
            Fire: 0.1
        }),
        astrologicalProfile: {
            rulingPlanets: ['Moon', 'Venus'],
            favorableZodiac: ['cancer', 'taurus'],
            elementalAffinity: {
                base: 'Water',
                decanModifiers: {
                    first: { element: 'Water', planet: 'Moon' },
                    second: { element: 'Water', planet: 'Venus' },
                    third: { element: 'Earth', planet: 'Saturn' }
                }
            },
            lunarPhaseModifiers: {
                newmoon: {
                    elementalBoost: createElementalProperties({ Water: 0.2, Air: 0.1 }),
                    preparationTips: ['Best for light preparations', 'Fresh applications']
                },
                fullmoon: {
                    elementalBoost: createElementalProperties({ Water: 0.3, Earth: 0.1 }),
                    preparationTips: ['Enhanced sweetness', 'Perfect for soups and stews']
                },
                waxingGibbous: {
                    elementalBoost: createElementalProperties({ Earth: 0.2, Water: 0.1 }),
                    preparationTips: ['Good for braising', 'Enhanced grounding qualities']
                }
            }
        },
        qualities: ['cooling', 'moistening', 'nourishing', 'gentle'],
        season: ['fall', 'winter', 'spring'],
        category: 'vegetable',
        subCategory: 'allium',
        affinities: ['potato', 'cream', 'butter', 'wine', 'herbs', 'garlic', 'carrot'],
        cookingMethods: ['braised', 'sautéed', 'soups', 'stews', 'gratins'],
        nutritionalProfile: {
            fiber: 'moderate',
            vitamins: ['k', 'a', 'c', 'b6'],
            minerals: ['iron', 'manganese', 'copper'],
            calories: 61,
            carbs_g: 14.2,
            fiber_g: 1.8,
            protein_g: 1.5
        },
        preparation: {
            washing: 'thoroughly between layers',
            trimming: 'remove dark green tops and root end',
            cutting: 'white and light green parts only',
            notes: 'Sand and dirt can hide between layers'
        },
        storage: {
            temperature: 'refrigerated',
            duration: '1-2 weeks',
            method: 'plastic bag with moisture',
            notes: 'Keep upright to prevent wilting'
        }
    },
    'green_onion': {
        name: 'Green Onion',
        elementalProperties: createElementalProperties({
            Air: 0.4,
            Water: 0.3,
            Fire: 0.2,
            Earth: 0.1
        }),
        astrologicalProfile: {
            rulingPlanets: ['Mercury', 'Moon'],
            favorableZodiac: ['gemini', 'cancer'],
            elementalAffinity: {
                base: 'Air',
                decanModifiers: {
                    first: { element: 'Air', planet: 'Mercury' },
                    second: { element: 'Water', planet: 'Moon' },
                    third: { element: 'Fire', planet: 'Mars' }
                }
            },
            lunarPhaseModifiers: {
                newmoon: {
                    elementalBoost: createElementalProperties({ Air: 0.2, Water: 0.1 }),
                    preparationTips: ['Fresh applications', 'Light preparations']
                },
                fullmoon: {
                    elementalBoost: createElementalProperties({ Water: 0.2, Air: 0.1 }),
                    preparationTips: ['Enhanced crispness', 'Perfect for garnishes']
                },
                waxingCrescent: {
                    elementalBoost: createElementalProperties({ Air: 0.2 }),
                    preparationTips: ['Quick cooking methods', 'Fresh eating']
                }
            }
        },
        qualities: ['refreshing', 'light', 'crisp', 'aromatic'],
        season: ['spring', 'summer', 'fall'],
        category: 'vegetable',
        subCategory: 'allium',
        affinities: ['ginger', 'sesame', 'soy sauce', 'citrus', 'herbs'],
        cookingMethods: ['raw', 'garnish', 'stir-fried', 'sautéed'],
        nutritionalProfile: {
            fiber: 'moderate',
            vitamins: ['c', 'k', 'a'],
            minerals: ['calcium', 'iron'],
            calories: 32,
            carbs_g: 7.3,
            fiber_g: 2.6,
            protein_g: 1.8
        },
        preparation: {
            washing: true,
            trimming: 'remove root end and any wilted tops',
            cutting: 'use both white and green parts',
            notes: 'Can be used whole or chopped'
        },
        storage: {
            temperature: 'refrigerated',
            duration: '1 week',
            method: 'upright in glass of water or wrapped in damp paper towel',
            notes: 'Keep roots in water to extend freshness'
        }
    }
};

// Fix the ingredient mappings to ensure they have all required properties
export const alliums = fixIngredientMappings(rawAlliums);

// Export individual alliums for direct access
export const garlic = alliums.garlic;
export const onion = alliums.onion;
export const leek = alliums.leek;
export const greenOnion = alliums.green_onion;

// Default export
export default alliums;
