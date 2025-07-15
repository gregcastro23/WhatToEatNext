"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pinkPeppercorn = exports.whitePepper = exports.blackPepper = void 0;
const elementalUtils_1 = require("../../../utils/elementalUtils");
const elementalUtils_2 = require("../../../utils/elemental/elementalUtils");
const rawPeppers = {
    'black_pepper': {
        name: 'Black Pepper',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.6, Water: 0.1, Earth: 0.2, Air: 0.1
        }),
        astrologicalProfile: {
            rulingPlanets: ['Mars', 'Sun'],
            favorableZodiac: ['aries', 'leo'],
            elementalAffinity: {
                base: 'Fire',
                decanModifiers: {
                    first: { element: 'Fire', planet: 'Mars' },
                    second: { element: 'Fire', planet: 'Sun' },
                    third: { element: 'Earth', planet: 'Saturn' }
                }
            },
            lunarPhaseModifiers: {
                waxingCrescent: {
                    elementalBoost: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.2, Earth: 0.1
                    }),
                    preparationTips: ['Best for marinades']
                },
                fullmoon: {
                    elementalBoost: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.3, Air: 0.1
                    }),
                    preparationTips: ['Ideal for robust dishes']
                }
            }
        },
        qualities: ['pungent', 'sharp', 'aromatic'],
        origin: ['India', 'Vietnam', 'Brazil'],
        season: ['all'],
        category: 'pepper',
        subCategory: 'peppercorn',
        varieties: {
            'Tellicherry': {
                name: 'Tellicherry',
                appearance: 'large, dark berries',
                flavor: 'complex, citrusy undertones',
                heat: 'moderate',
                uses: 'premium applications'
            },
            'Malabar': {
                name: 'Malabar',
                appearance: 'medium-sized berries',
                flavor: 'balanced, standard profile',
                heat: 'moderate',
                uses: 'all-purpose'
            },
            'Lampong': {
                name: 'Lampong',
                appearance: 'small berries',
                flavor: 'sharp, intense',
                heat: 'high',
                uses: 'hearty dishes'
            }
        },
        culinaryApplications: {
            'finishing': {
                name: 'Finishing',
                method: 'freshly ground',
                timing: 'just before serving',
                applications: {
                    'proteins': 'after cooking',
                    'pasta': 'finish with pepper and cheese',
                    'vegetables': 'light dusting'
                },
                techniques: {
                    'cracked': {
                        name: 'Cracked',
                        method: 'coarse grind or mortar',
                        applications: 'crusts, rustic dishes'
                    },
                    'fine_ground': {
                        name: 'Fine Ground',
                        method: 'fine pepper mill',
                        applications: 'sauces, delicate dishes'
                    }
                }
            },
            'cooking': {
                name: 'Cooking',
                method: 'add during process',
                timing: {
                    'early': 'for infused flavor',
                    'middle': 'for balanced heat',
                    'end': 'for pronounced aroma'
                },
                pAirings: ['cream', 'lemon', 'tomato', 'beef', 'cheese']
            }
        },
        storage: {
            temperature: {
                fahrenheit: { min: 65, max: 75 },
                celsius: { min: 18, max: 24 }
            },
            humidity: 'low',
            container: 'Airtight, opaque',
            duration: 'whole: 2-3 years, ground: 3-4 months',
            notes: 'Best stored whole and ground as needed'
        }
    },
    'white_pepper': {
        name: 'White Pepper',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.5, Water: 0.1, Earth: 0.3, Air: 0.1
        }),
        astrologicalProfile: {
            rulingPlanets: ['Mercury', 'Mars'],
            favorableZodiac: ['gemini', 'virgo'],
            elementalAffinity: {
                base: 'Fire',
                decanModifiers: {
                    first: { element: 'Fire', planet: 'Mercury' },
                    second: { element: 'Fire', planet: 'Mars' },
                    third: { element: 'Air', planet: 'Mercury' }
                }
            },
            lunarPhaseModifiers: {
                newmoon: {
                    elementalBoost: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.1, Air: 0.2
                    }),
                    preparationTips: ['Best for subtle applications']
                },
                fullmoon: {
                    elementalBoost: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.2, Earth: 0.1
                    }),
                    preparationTips: ['Enhanced pungency']
                }
            }
        },
        qualities: ['earthy', 'musty', 'hot'],
        origin: ['Indonesia', 'Malaysia', 'China'],
        season: ['all'],
        category: 'pepper',
        subCategory: 'peppercorn',
        varieties: {
            'Muntok': {
                name: 'Muntok',
                appearance: 'off-white to beige',
                flavor: 'earthy, complex',
                heat: 'medium-high',
                uses: 'light-colored sauces, Asian cuisine'
            },
            'Sarawak': {
                name: 'Sarawak',
                appearance: 'cream colored',
                flavor: 'delicate, less fermented',
                heat: 'medium',
                uses: 'European cuisine'
            }
        },
        culinaryApplications: {
            'light_colored_dishes': {
                name: 'Light Colored Dishes',
                method: 'fine grind',
                timing: 'during cooking',
                applications: {
                    'cream_sauces': 'when thickening',
                    'mashed_potatoes': 'during mashing',
                    'soups': 'white or clear'
                }
            },
            'asian_cuisine': {
                name: 'Asian Cuisine',
                method: 'ground or whole',
                timing: 'various stages',
                applications: {
                    'hot_pot': 'in broth',
                    'marinades': 'ground in paste',
                    'stir_fry': 'in sauce'
                }
            }
        },
        storage: {
            temperature: {
                fahrenheit: { min: 65, max: 75 },
                celsius: { min: 18, max: 24 }
            },
            humidity: 'low',
            container: 'Airtight, opaque',
            duration: 'whole: 1-2 years, ground: 2-3 months',
            notes: 'More delicate than black pepper'
        }
    },
    'pink_peppercorn': {
        name: 'Pink Peppercorn',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.4, Water: 0.2, Earth: 0.1, Air: 0.3
        }),
        astrologicalProfile: {
            rulingPlanets: ['Venus', 'Mars'],
            favorableZodiac: ['libra', 'taurus'],
            elementalAffinity: {
                base: 'Air',
                decanModifiers: {
                    first: { element: 'Air', planet: 'Venus' },
                    second: { element: 'Fire', planet: 'Mars' },
                    third: { element: 'Water', planet: 'Venus' }
                }
            },
            lunarPhaseModifiers: {
                waxingCrescent: {
                    elementalBoost: (0, elementalUtils_2.createElementalProperties)({
                        Air: 0.2,
                        Water: 0.1
                    }),
                    preparationTips: ['Gentle introduction to dishes']
                },
                fullmoon: {
                    elementalBoost: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.1, Air: 0.2
                    }),
                    preparationTips: ['Enhanced aroma']
                }
            }
        },
        qualities: ['sweet', 'aromatic', 'mild heat'],
        origin: ['Brazil', 'Madagascar', 'Reunion Island'],
        season: ['all'],
        category: 'pepper',
        subCategory: 'false peppercorn',
        botanical: {
            family: 'Anacardiaceae',
            genus: 'Schinus',
            notes: 'Not true pepper, related to cashews'
        },
        culinaryApplications: {
            'visual_accent': {
                name: 'Visual Accent',
                method: 'whole berries',
                applications: {
                    'salads': 'colorful garnish',
                    'cheese_plates': 'decorative and flavorful accent',
                    'desserts': 'with chocolate or fruit'
                }
            },
            'delicate_seasoning': {
                name: 'Delicate Seasoning',
                method: 'lightly crushed',
                applications: {
                    'fish': 'with citrus',
                    'poultry': 'light seasoning',
                    'vinaigrettes': 'subtle heat'
                }
            }
        },
        storage: {
            temperature: {
                fahrenheit: { min: 65, max: 75 },
                celsius: { min: 18, max: 24 }
            },
            humidity: 'low',
            container: 'Airtight, opaque',
            duration: '6-12 months',
            notes: 'More fragile than true peppercorns'
        }
    },
    'szechuan_peppercorn': {
        name: 'Szechuan Peppercorn',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
        }),
        astrologicalProfile: {
            rulingPlanets: ['Mercury', 'Uranus'],
            favorableZodiac: ['gemini', 'aquarius'],
            elementalAffinity: {
                base: 'Fire'
            }
        },
        qualities: ['numbing', 'citrusy', 'aromatic'],
        origin: ['China'],
        category: 'pepper',
        subCategory: 'false peppercorn',
        botanical: {
            family: 'Rutaceae',
            genus: 'Zanthoxylum',
            notes: 'Not related to black pepper'
        },
        culinaryApplications: {
            'mala_flavor': {
                name: 'Mala Flavor',
                method: 'toasted and ground',
                applications: {
                    'stir_fry': 'with chili for numbing-spicy effect',
                    'braises': 'in five-spice blend',
                    'oil_infusion': 'for numbing oil'
                },
                pAirings: ['chili', 'garlic', 'star anise', 'beef', 'tofu']
            }
        },
        storage: {
            temperature: 'room temperature',
            humidity: 'low',
            container: 'Airtight',
            duration: 'whole: 1-2 years, ground: 1 month',
            notes: 'Volatile oils dissipate quickly when ground'
        }
    },
    'long_pepper': {
        name: 'Long Pepper',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
        }),
        astrologicalProfile: {
            rulingPlanets: ['Mars', 'Saturn'],
            favorableZodiac: ['aries', 'capricorn'],
            elementalAffinity: {
                base: 'Fire'
            }
        },
        qualities: ['hot', 'sweet', 'complex'],
        origin: ['India', 'Indonesia'],
        category: 'pepper',
        subCategory: 'true peppercorn',
        botanical: {
            species: 'Piper longum',
            notes: 'Ancient pepper variety'
        },
        culinaryApplications: {
            'spice_blends': {
                name: 'Spice Blends',
                method: 'ground',
                applications: {
                    'curry_powders': 'traditional component',
                    'pickling_spice': 'complex heat',
                    'mulling_spice': 'for warming beverages'
                }
            },
            'medicinal': {
                name: 'Medicinal',
                method: 'infusions and powders',
                applications: {
                    'digestive_aids': 'traditional use',
                    'warming_teas': 'with honey and ginger'
                }
            }
        },
        storage: {
            temperature: 'room temperature',
            humidity: 'low',
            container: 'Airtight',
            duration: 'whole: 2 years, ground: 6 months',
            notes: 'Less common but keeps well'
        }
    }
};
// Apply any fixes needed to raw ingredient data
const peppers = (0, elementalUtils_1.fixIngredientMappings)(rawPeppers);
// Export the entire collection
exports.default = peppers;
// Export individual peppers for direct access
exports.blackPepper = peppers.black_pepper;
exports.whitePepper = peppers.white_pepper;
exports.pinkPeppercorn = peppers.pink_peppercorn;
