"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.spiceBlends = void 0;
const elementalUtils_1 = require("../../../utils/elementalUtils");
const elementalUtils_2 = require("../../../utils/elemental/elementalUtils");
const rawSpiceBlends = {
    'garam_masala': {
        name: 'Garam Masala',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.5, Water: 0.1, Earth: 0.3, Air: 0.1
        }),
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
                    elementalBoost: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.2, Earth: 0.1
                    }),
                    preparationTips: ['Begin toasting whole spices']
                },
                fullmoon: {
                    elementalBoost: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.3, Air: 0.1
                    }),
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
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
        }),
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
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
        }),
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
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.4, Water: 0.1, Earth: 0.3, Air: 0.2
        }),
        astrologicalProfile: {
            rulingPlanets: ['Jupiter', 'Mercury'],
            favorableZodiac: ['sagittarius', 'gemini'],
            elementalAffinity: {
                base: 'Fire',
                decanModifiers: {
                    first: { element: 'Fire', planet: 'Jupiter' },
                    second: { element: 'Air', planet: 'Mercury' },
                    third: { element: 'Earth', planet: 'Venus' }
                }
            },
            lunarPhaseModifiers: {
                waxingGibbous: {
                    elementalBoost: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.2, Air: 0.2
                    }),
                    preparationTips: ['Perfect for marinades']
                },
                fullmoon: {
                    elementalBoost: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.3, Earth: 0.1
                    }),
                    preparationTips: ['Ideal for festive dishes']
                }
            }
        },
        qualities: ['warming', 'complex', 'balanced', 'aromatic'],
        origin: ['China'],
        season: ['all'],
        category: 'spice',
        subCategory: 'blend',
        composition: {
            'traditional': [
                'star anise', 'cloves', 'Chinese cinnamon',
                'Sichuan peppercorns', 'fennel seeds'
            ],
            'regional_variations': {
                'northern': ['star anise', 'cloves', 'cinnamon', 'fennel', 'Sichuan peppercorns'],
                'southern': ['star anise', 'cloves', 'cinnamon', 'fennel', 'white pepper'],
                'taiwanese': ['star anise', 'cloves', 'cinnamon', 'fennel', 'licorice', 'ginger', 'galangal']
            },
            'symbolism': 'represents the five elements in Chinese philosophy'
        },
        culinaryApplications: {
            'marinades': {
                name: 'Marinades',
                method: 'mix with soy sauce, rice wine, and sweetener',
                applications: ['pork', 'duck', 'chicken', 'beef'],
                timing: '30 minutes to overnight',
                notes: 'Classic for red braised dishes'
            },
            'dry_rubs': {
                name: 'Dry Rubs',
                method: 'mix with salt and sugar',
                applications: ['ribs', 'roasted meats', 'poultry'],
                timing: 'apply 1-24 hours before cooking',
                notes: 'Creates a fragrant crust when roasted'
            }
        },
        storage: {
            temperature: {
                fahrenheit: { min: 60, max: 70 },
                celsius: { min: 15, max: 21 }
            },
            humidity: 'low',
            container: 'Airtight, dark',
            duration: '3-6 months',
            notes: 'Star anise and fennel seeds lose potency fastest'
        }
    },
    'za_atar': {
        name: 'Za Atar',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
        }),
        qualities: ['earthy', 'tangy', 'aromatic'],
        origin: ['Levant'],
        category: 'spice',
        subCategory: 'blend',
        baseIngredients: {
            'dried thyme': 2,
            'sesame seeds': 2,
            'sumac': 1,
            'oregano': 1,
            'marjoram': 1,
            'salt': 0.5
        },
        ratios: '2:2:1:1:1:0.5',
        regionalVariations: {
            'Lebanese': {
                name: 'Lebanese',
                'dried thyme': 2,
                'sesame seeds': 2,
                'sumac': 2,
                'oregano': 1,
                'marjoram': 1,
                'salt': 0.5
            },
            'Palestinian': {
                name: 'Palestinian',
                'dried thyme': 2,
                'sesame seeds': 3,
                'sumac': 1,
                'oregano': 1,
                'marjoram': 1,
                'salt': 0.5
            }
        }
    },
    'curry_powder': {
        name: 'Curry Powder',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
        }),
        qualities: ['warming', 'complex', 'pungent'],
        origin: ['British-Indian'],
        category: 'spice',
        subCategory: 'blend',
        baseIngredients: {
            'turmeric': 3,
            'coriander': 2,
            'cumin': 2,
            'ginger': 1,
            'black pepper': 1,
            'cinnamon': 0.5,
            'cardamom': 0.5,
            'cayenne': 0.5,
            'fenugreek': 0.5
        },
        ratios: '3:2:2:1:1:0.5:0.5:0.5:0.5',
        regionalVariations: {
            'Madras': {
                name: 'Madras',
                'turmeric': 3,
                'coriander': 2,
                'cumin': 2,
                'ginger': 1,
                'black pepper': 1,
                'cinnamon': 0.5,
                'cardamom': 0.5,
                'cayenne': 2,
                'fenugreek': 0.5
            }
        }
    },
    'berbere': {
        name: 'Berbere',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
        }),
        qualities: ['hot', 'complex', 'earthy'],
        origin: ['Ethiopia'],
        category: 'spice',
        subCategory: 'blend',
        baseIngredients: {
            'dried chili peppers': 4,
            'garlic': 2,
            'ginger': 2,
            'basil': 1,
            'korarima': 1,
            'white pepper': 1,
            'black pepper': 1,
            'fenugreek': 1,
            'cloves': 0.5,
            'cinnamon': 0.5,
            'nutmeg': 0.5
        },
        ratios: '4:2:2:1:1:1:1:1:0.5:0.5:0.5',
        regionalVariations: {
            'Traditional': {
                name: 'Traditional',
                // includes additional fermentation process
                'rue': 0.5 // additional ingredient
            }
        }
    },
    'dukkah': {
        name: 'Dukkah',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
        }),
        qualities: ['nutty', 'aromatic', 'crunchy'],
        origin: ['Egypt'],
        category: 'spice',
        subCategory: 'blend',
        baseIngredients: {
            'hazelnuts': 3,
            'sesame seeds': 2,
            'coriander': 1,
            'cumin': 1,
            'black pepper': 0.5,
            'salt': 0.5
        },
        ratios: '3:2:1:1:0.5:0.5',
        regionalVariations: {
            'Alexandria': {
                name: 'Alexandria',
                'hazelnuts': 2,
                'pine nuts': 1,
                'sesame seeds': 3,
                'coriander': 1,
                'cumin': 1,
                'black pepper': 0.5,
                'salt': 0.5
            }
        }
    },
    'shichimi_togarashi': {
        name: 'Shichimi Togarashi',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
        }),
        qualities: ['spicy', 'citrusy', 'nutty'],
        origin: ['Japan'],
        category: 'spice',
        subCategory: 'blend',
        baseIngredients: {
            'dried red chili pepper': 3,
            'sansho pepper': 1,
            'orange peel': 1,
            'black sesame': 1,
            'white sesame': 1,
            'hemp seeds': 0.5,
            'nori': 0.5,
            'ginger': 0.5
        },
        ratios: '3:1:1:1:1:0.5:0.5:0.5',
        regionalVariations: {
            'Tokyo': {
                name: 'Tokyo',
                'orange peel': 2 // more citrus
            },
            'Kyoto': {
                name: 'Kyoto',
                'black sesame': 2,
                'white sesame': 2 // more sesame
            }
        }
    },
    'baharat': {
        name: 'Baharat',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
        }),
        qualities: ['warming', 'aromatic', 'complex'],
        origin: ['Middle East'],
        category: 'spice',
        subCategory: 'blend',
        baseIngredients: {
            'black pepper': 2,
            'cumin': 2,
            'coriander': 1,
            'cinnamon': 1,
            'cardamom': 1,
            'paprika': 1,
            'cloves': 0.5,
            'nutmeg': 0.5
        },
        ratios: '2:2:1:1:1:1:0.5:0.5',
        regionalVariations: {
            'Turkish': {
                name: 'Turkish',
                'mint': 0.5 // additional
            },
            'Gulf': {
                name: 'Gulf',
                'lime powder': 1 // additional
            }
        }
    },
    'jerk_seasoning': {
        name: 'Jerk Seasoning',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
        }),
        qualities: ['hot', 'pungent', 'aromatic'],
        origin: ['Jamaica'],
        category: 'spice',
        subCategory: 'blend',
        baseIngredients: {
            'allspice': 3,
            'scotch bonnet': 2,
            'thyme': 2,
            'garlic': 2,
            'ginger': 1,
            'black pepper': 1,
            'brown sugar': 1,
            'cinnamon': 0.5,
            'nutmeg': 0.5
        },
        ratios: '3:2:2:2:1:1:1:0.5:0.5',
        regionalVariations: {
            'Traditional': {
                name: 'Traditional',
                // Wet paste version
                'green onions': 2,
                'soy sauce': 1
            },
            'Western': {
                name: 'Western',
                'scotch bonnet': 1 // reduced heat
            }
        }
    }
};
// Fix the ingredient mappings to ensure they have all required properties
exports.spiceBlends = (0, elementalUtils_1.fixIngredientMappings)(rawSpiceBlends);
