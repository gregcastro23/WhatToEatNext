"use strict";
import { fixIngredientMappings } from "../../../utils/elementalUtils";
import { createElementalProperties } from "../../../utils/elemental/elementalUtils";

const rawSpiceBlends = {
    'garam_masala': {
        name: 'Garam Masala',
        elementalProperties: createElementalProperties({ Fire: 0.5, Water: 0.1, Earth: 0.3, Air: 0.1 }),
        astrologicalProfile: {
            rulingPlanets: ['Mars', 'Jupiter'],
            favorableZodiac: ['aries', 'sagittarius'],
            elementalAffinity: {
                base: 'Fire',
                decanModifiers: {
                    first: { element: 'Fire', planet: 'Mars' },
                    second: { element: 'Fire', planet: 'Jupiter' },
                    third: { element: 'Earth', planet: 'Saturn' }
                }
            },
            lunarPhaseModifiers: {
                waxingCrescent: {
                    elementalBoost: createElementalProperties({ Fire: 0.2, Earth: 0.1 }),
                    preparationTips: ['Begin toasting whole spices']
                },
                fullmoon: {
                    elementalBoost: createElementalProperties({ Fire: 0.3, Air: 0.1 }),
                    preparationTips: ['Ideal for robust, celebratory dishes']
                }
            }
        },
        qualities: ['warming', 'aromatic', 'complex', 'balanced'],
        origin: ['India', 'Pakistan', 'Nepal'],
        season: ['fall', 'winter'],
        category: 'spice',
        subCategory: 'blend',
        composition: {
            'base_spices': [
                'cumin', 'coriander', 'cardamom', 'cinnamon',
                'cloves', 'black pepper', 'nutmeg'
            ],
            'regional_variations': {
                'north_indian': ['cumin', 'coriander', 'cardamom', 'cinnamon', 'cloves', 'black pepper', 'bay leaf'],
                'south_indian': ['coriander', 'cumin', 'cinnamon', 'cardamom', 'dried chilis', 'cloves', 'star anise'],
                'bengali': ['cumin', 'coriander', 'cinnamon', 'cardamom', 'cloves', 'nutmeg', 'mace', 'fennel']
            }
        },
        culinaryApplications: {
            'finishing': {
                name: 'Finishing Spice',
                method: 'add at end of cooking',
                applications: ['curries', 'lentil dishes', 'rice dishes', 'vegetable preparations'],
                timing: 'last 5 minutes or after cooking',
                notes: 'Preserves volatile aromatic compounds'
            },
            'marinating': {
                name: 'Marinating',
                method: 'mix with yogurt or oil',
                applications: ['meats', 'paneer', 'vegetables'],
                timing: '30 minutes to overnight',
                notes: 'Penetrates slowly into foods'
            },
            'dry_roasting': {
                name: 'Dry Roasting',
                method: 'toast in dry pan before using',
                applications: ['revitalizing store-bought blends', 'enhancing flavor'],
                timing: '30-60 seconds until fragrant',
                notes: 'Watch carefully to prevent burning'
            }
        },
        storage: {
            temperature: {
                fahrenheit: { min: 60, max: 70 },
                celsius: { min: 15, max: 21 }
            },
            humidity: 'low',
            container: 'Airtight, dark glass',
            duration: '3-6 months',
            notes: 'Whole spices can be stored longer and ground as needed'
        }
    },
    'ras_el_hanout': {
        name: 'Ras El Hanout',
        elementalProperties: createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }),
        astrologicalProfile: {
            rulingPlanets: ['Venus', 'Mars'],
            favorableZodiac: ['taurus', 'scorpio'],
            elementalAffinity: {
                base: 'Fire',
                decanModifiers: {
                    first: {},
                    second: {},
                    third: { element: 'Air', planet: 'Mercury' }
                }
            }
        },
        qualities: ['warming', 'complex', 'aromatic'],
        origin: ['North Africa'],
        category: 'spice',
        subCategory: 'blend',
        baseIngredients: [
            'cumin',
            'coriander',
            'cinnamon',
            'ginger',
            'black pepper',
            'turmeric',
            'paprika',
            'allspice',
            'rose petals'
        ],
        regionalVariations: {
            'Moroccan': ['saffron', 'rose buds', 'grains of paradise'],
            'Tunisian': ['dried mint', 'dried rose petals'],
            'Algerian': ['cinnamon heavy', 'dried rosebuds']
        },
        affinities: ['lamb', 'chicken', 'couscous', 'vegetables', 'tagines'],
        cookingMethods: ['marinades', 'rubs', 'stews'],
        proportions: {
            'cumin': 2,
            'coriander': 2,
            'cinnamon': 1,
            'ginger': 1,
            'black pepper': 1,
            'turmeric': 1,
            'paprika': 1,
            'allspice': 0.5,
            'rose petals': 0.5
        },
        preparation: {
            toasting: 'light toasting of whole spices',
            grinding: 'grind together just before use',
            storage: 'Airtight container away from light',
            notes: 'Can contain up to 30 ingredients'
        },
        medicinalProperties: {
            actions: ['digestive aid', 'anti-inflammatory'],
            energetics: 'warming',
            tastes: ['complex', 'floral', 'pungent']
        }
    },
    'herbes_de_provence': {
        name: 'Herbes De Provence',
        elementalProperties: createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }),
        qualities: ['aromatic', 'Mediterranean', 'savory'],
        origin: ['Southern France'],
        category: 'spice',
        subCategory: 'blend',
        baseIngredients: [
            'thyme',
            'basil',
            'rosemary',
            'tarragon',
            'savory',
            'marjoram',
            'oregano',
            'lavender'
        ],
        regionalVariations: {
            'Traditional': ['no lavender'],
            'Modern': ['includes lavender'],
            'Commercial': ['may include fennel']
        },
        affinities: ['chicken', 'fish', 'vegetables', 'tomatoes', 'grilled meats'],
        cookingMethods: ['roasting', 'grilling', 'sauce making'],
        proportions: {
            'thyme': 2,
            'basil': 1,
            'rosemary': 1,
            'tarragon': 1,
            'savory': 1,
            'marjoram': 1,
            'oregano': 1,
            'lavender': 0.5
        },
        preparation: {
            mixing: 'individually before grinding',
            grinding: 'just before use',
            storage: 'Airtight, dark container',
            notes: 'Blend can be adjusted for heat preference'
        },
        medicinalProperties: {
            actions: ['digestive aid', 'anti-inflammatory', 'warming'],
            energetics: 'heating',
            tastes: ['pungent', 'sweet', 'bitter']
        }
    },
    'chinese_five_spice': {
        name: 'Chinese Five Spice',
        elementalProperties: createElementalProperties({ Fire: 0.4, Water: 0.1, Earth: 0.3, Air: 0.2 }),
        astrologicalProfile: {
            rulingPlanets: ['Jupiter', 'Mercury'],
            favorableZodiac: ['sagittarius', 'gemini'],
            elementalAffinity: {
                base: 'Fire',
                decanModifiers: {
                    first: { element: 'Fire', planet: 'Jupiter' },
                    second: { element: 'Air', planet: 'Mercury' },
                    third: { element: 'Earth', planet: 'Saturn' }
                }
            }
        },
        qualities: ['warming', 'aromatic', 'complex', 'balanced'],
        origin: ['China'],
        season: ['fall', 'winter'],
        category: 'spice',
        subCategory: 'blend',
        baseIngredients: [
            'star anise',
            'cloves',
            'cinnamon',
            'sichuan pepper',
            'fennel seeds'
        ],
        regionalVariations: {
            'Cantonese': ['star anise heavy'],
            'Sichuan': ['sichuan pepper heavy'],
            'Northern': ['cinnamon heavy']
        },
        affinities: ['pork', 'duck', 'chicken', 'vegetables', 'noodles'],
        cookingMethods: ['braising', 'roasting', 'stir-frying'],
        proportions: {
            'star anise': 2,
            'cloves': 1,
            'cinnamon': 1,
            'sichuan pepper': 1,
            'fennel seeds': 1
        },
        preparation: {
            toasting: 'light toasting of whole spices',
            grinding: 'grind together just before use',
            storage: 'Airtight container away from light',
            notes: 'Can be used whole or ground'
        },
        medicinalProperties: {
            actions: ['digestive aid', 'warming'],
            energetics: 'warming',
            tastes: ['sweet', 'pungent', 'aromatic']
        }
    },
    'zaatar': {
        name: 'Zaatar',
        elementalProperties: createElementalProperties({ Fire: 0.3, Water: 0.1, Earth: 0.4, Air: 0.2 }),
        astrologicalProfile: {
            rulingPlanets: ['Mercury', 'Venus'],
            favorableZodiac: ['gemini', 'taurus'],
            elementalAffinity: {
                base: 'Earth',
                decanModifiers: {
                    first: { element: 'Air', planet: 'Mercury' },
                    second: { element: 'Earth', planet: 'Venus' },
                    third: { element: 'Water', planet: 'Moon' }
                }
            }
        },
        qualities: ['herbaceous', 'nutty', 'earthy', 'aromatic'],
        origin: ['Middle East'],
        season: ['spring', 'summer'],
        category: 'spice',
        subCategory: 'blend',
        baseIngredients: [
            'thyme',
            'oregano',
            'marjoram',
            'sumac',
            'sesame seeds',
            'salt'
        ],
        regionalVariations: {
            'Lebanese': ['thyme heavy'],
            'Syrian': ['oregano heavy'],
            'Palestinian': ['marjoram heavy']
        },
        affinities: ['bread', 'olive oil', 'vegetables', 'meats', 'dips'],
        cookingMethods: ['sprinkling', 'mixing with oil', 'baking'],
        proportions: {
            'thyme': 2,
            'oregano': 1,
            'marjoram': 1,
            'sumac': 1,
            'sesame seeds': 1,
            'salt': 0.5
        },
        preparation: {
            mixing: 'combine herbs and sumac',
            toasting: 'toast sesame seeds separately',
            storage: 'Airtight container',
            notes: 'Can be mixed with olive oil for storage'
        },
        medicinalProperties: {
            actions: ['digestive aid', 'anti-inflammatory'],
            energetics: 'cooling',
            tastes: ['sour', 'herbaceous', 'nutty']
        }
    },
    'dukkah': {
        name: 'Dukkah',
        elementalProperties: createElementalProperties({ Fire: 0.2, Water: 0.1, Earth: 0.5, Air: 0.2 }),
        astrologicalProfile: {
            rulingPlanets: ['Saturn', 'Venus'],
            favorableZodiac: ['capricorn', 'taurus'],
            elementalAffinity: {
                base: 'Earth',
                decanModifiers: {
                    first: { element: 'Earth', planet: 'Saturn' },
                    second: { element: 'Earth', planet: 'Venus' },
                    third: { element: 'Air', planet: 'Mercury' }
                }
            }
        },
        qualities: ['nutty', 'crunchy', 'earthy', 'aromatic'],
        origin: ['Egypt'],
        season: ['all'],
        category: 'spice',
        subCategory: 'blend',
        baseIngredients: [
            'hazelnuts',
            'sesame seeds',
            'coriander seeds',
            'cumin seeds',
            'salt',
            'black pepper'
        ],
        regionalVariations: {
            'Traditional': ['hazelnuts'],
            'Modern': ['pistachios', 'almonds'],
            'Australian': ['macadamia nuts']
        },
        affinities: ['bread', 'olive oil', 'vegetables', 'eggs', 'cheese'],
        cookingMethods: ['sprinkling', 'dipping', 'coating'],
        proportions: {
            'hazelnuts': 3,
            'sesame seeds': 2,
            'coriander seeds': 1,
            'cumin seeds': 1,
            'salt': 0.5,
            'black pepper': 0.5
        },
        preparation: {
            toasting: 'toast nuts and seeds separately',
            grinding: 'coarse grind to maintain texture',
            storage: 'Airtight container',
            notes: 'Keep nuts and seeds separate until serving'
        },
        medicinalProperties: {
            actions: ['nutritive', 'digestive aid'],
            energetics: 'neutral',
            tastes: ['nutty', 'earthy', 'aromatic']
        }
    },
    'baharat': {
        name: 'Baharat',
        elementalProperties: createElementalProperties({ Fire: 0.4, Water: 0.1, Earth: 0.3, Air: 0.2 }),
        astrologicalProfile: {
            rulingPlanets: ['Mars', 'Jupiter'],
            favorableZodiac: ['aries', 'sagittarius'],
            elementalAffinity: {
                base: 'Fire',
                decanModifiers: {
                    first: { element: 'Fire', planet: 'Mars' },
                    second: { element: 'Fire', planet: 'Jupiter' },
                    third: { element: 'Earth', planet: 'Saturn' }
                }
            }
        },
        qualities: ['warming', 'aromatic', 'complex', 'spicy'],
        origin: ['Middle East'],
        season: ['fall', 'winter'],
        category: 'spice',
        subCategory: 'blend',
        baseIngredients: [
            'black pepper',
            'coriander',
            'cinnamon',
            'cloves',
            'cumin',
            'cardamom',
            'nutmeg',
            'paprika'
        ],
        regionalVariations: {
            'Turkish': ['mint heavy'],
            'Lebanese': ['allspice heavy'],
            'Syrian': ['cinnamon heavy']
        },
        affinities: ['lamb', 'chicken', 'rice', 'vegetables', 'soups'],
        cookingMethods: ['marinades', 'rubs', 'stews'],
        proportions: {
            'black pepper': 2,
            'coriander': 2,
            'cinnamon': 1,
            'cloves': 1,
            'cumin': 1,
            'cardamom': 1,
            'nutmeg': 0.5,
            'paprika': 1
        },
        preparation: {
            toasting: 'light toasting of whole spices',
            grinding: 'grind together just before use',
            storage: 'Airtight container away from light',
            notes: 'Can be used whole or ground'
        },
        medicinalProperties: {
            actions: ['digestive aid', 'warming'],
            energetics: 'warming',
            tastes: ['pungent', 'sweet', 'aromatic']
        }
    },
    'berbere': {
        name: 'Berbere',
        elementalProperties: createElementalProperties({ Fire: 0.6, Water: 0.1, Earth: 0.2, Air: 0.1 }),
        astrologicalProfile: {
            rulingPlanets: ['Mars', 'Pluto'],
            favorableZodiac: ['aries', 'scorpio'],
            elementalAffinity: {
                base: 'Fire',
                decanModifiers: {
                    first: { element: 'Fire', planet: 'Mars' },
                    second: { element: 'Water', planet: 'Pluto' },
                    third: { element: 'Earth', planet: 'Saturn' }
                }
            }
        },
        qualities: ['spicy', 'warming', 'complex', 'aromatic'],
        origin: ['Ethiopia'],
        season: ['fall', 'winter'],
        category: 'spice',
        subCategory: 'blend',
        baseIngredients: [
            'chili peppers',
            'paprika',
            'coriander',
            'fenugreek',
            'cardamom',
            'cinnamon',
            'cloves',
            'allspice',
            'ginger',
            'garlic'
        ],
        regionalVariations: {
            'Traditional': ['dried chili peppers'],
            'Modern': ['smoked paprika'],
            'Commercial': ['may include artificial colors']
        },
        affinities: ['lentils', 'chicken', 'beef', 'vegetables', 'stews'],
        cookingMethods: ['stewing', 'braising', 'marinating'],
        proportions: {
            'chili peppers': 3,
            'paprika': 2,
            'coriander': 1,
            'fenugreek': 1,
            'cardamom': 1,
            'cinnamon': 1,
            'cloves': 0.5,
            'allspice': 0.5,
            'ginger': 1,
            'garlic': 1
        },
        preparation: {
            toasting: 'toast spices until fragrant',
            grinding: 'grind to fine powder',
            storage: 'Airtight container away from light',
            notes: 'Can be made fresh or purchased'
        },
        medicinalProperties: {
            actions: ['warming', 'digestive aid'],
            energetics: 'heating',
            tastes: ['pungent', 'hot', 'aromatic']
        }
    },
    'ras_el_hanout_sweet': {
        name: 'Ras El Hanout Sweet',
        elementalProperties: createElementalProperties({ Fire: 0.2, Water: 0.3, Earth: 0.2, Air: 0.3 }),
        astrologicalProfile: {
            rulingPlanets: ['Venus', 'Moon'],
            favorableZodiac: ['taurus', 'cancer'],
            elementalAffinity: {
                base: 'Water',
                decanModifiers: {
                    first: { element: 'Earth', planet: 'Venus' },
                    second: { element: 'Water', planet: 'Moon' },
                    third: { element: 'Air', planet: 'Mercury' }
                }
            }
        },
        qualities: ['sweet', 'aromatic', 'complex', 'warming'],
        origin: ['North Africa'],
        season: ['fall', 'winter'],
        category: 'spice',
        subCategory: 'blend',
        baseIngredients: [
            'cinnamon',
            'cardamom',
            'ginger',
            'nutmeg',
            'allspice',
            'cloves',
            'rose petals',
            'saffron'
        ],
        regionalVariations: {
            'Moroccan': ['saffron heavy'],
            'Tunisian': ['rose petals heavy'],
            'Algerian': ['cinnamon heavy']
        },
        affinities: ['desserts', 'sweet dishes', 'rice', 'poultry'],
        cookingMethods: ['baking', 'sweetening', 'aromatizing'],
        proportions: {
            'cinnamon': 2,
            'cardamom': 1,
            'ginger': 1,
            'nutmeg': 1,
            'allspice': 1,
            'cloves': 0.5,
            'rose petals': 1,
            'saffron': 0.5
        },
        preparation: {
            mixing: 'combine ground spices',
            storage: 'Airtight container away from light',
            notes: 'Can be used in sweet and savory dishes'
        },
        medicinalProperties: {
            actions: ['warming', 'digestive aid'],
            energetics: 'warming',
            tastes: ['sweet', 'aromatic', 'pungent']
        }
    }
};

export const spiceBlends = fixIngredientMappings(rawSpiceBlends);
