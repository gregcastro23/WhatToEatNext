"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wholeSpices = void 0;
const elementalUtils_1 = require("../../../utils/elementalUtils");
const elementalUtils_2 = require("../../../utils/elemental/elementalUtils");
const rawWholeSpices = {
    'star_anise': {
        name: 'Star Anise',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
        }),
        qualities: ['sweet', 'licorice-like', 'warming'],
        origin: ['China', 'Vietnam'],
        category: 'spice',
        subCategory: 'whole',
        varieties: {
            'Chinese': 'traditional variety',
            'Japanese': 'more delicate',
            'Vietnamese': 'more robust'
        },
        preparation: {
            toasting: {
                method: 'dry toast until fragrant',
                duration: '2-3 minutes',
                notes: 'Watch carefully to prevent burning'
            },
            grinding: 'grind as needed',
            infusing: {
                method: 'add whole to liquids',
                duration: '10-20 minutes',
                removal: 'required before serving'
            }
        },
        culinaryApplications: {
            'broths': {
                name: 'Broths',
                method: 'add whole to simmering liquid',
                timing: 'early in cooking',
                pAirings: ['cinnamon', 'ginger', 'onions'],
                ratios: '1-2 pods per 2 cups liquid'
            },
            'tea_blends': {
                name: 'Tea Blends',
                method: 'combine with other spices',
                pAirings: ['black tea', 'cinnamon', 'orange'],
                ratios: '1 pod per 2 cups water'
            }
        },
        storage: {
            temperature: 'cool, dark place',
            duration: '2 years',
            container: 'Airtight',
            notes: 'Maintains potency well when whole'
        }
    },
    'cardamom_pods': {
        name: 'Cardamom Pods',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
        }),
        astrologicalProfile: {
            rulingPlanets: ['Mercury', 'Venus'],
            favorableZodiac: ['gemini', 'libra'],
            elementalAffinity: {
                base: 'Air',
                decanModifiers: {
                    first: {},
                    second: {},
                    third: { element: 'Earth', planet: 'Saturn' }
                }
            }
        },
        qualities: ['aromatic', 'complex', 'intense'],
        origin: ['India', 'Guatemala', 'Sri Lanka'],
        category: 'spice',
        subCategory: 'whole',
        varieties: {},
        preparation: {
            toasting: {
                method: 'light dry toast',
                duration: '1-2 minutes',
                notes: 'Just until fragrant'
            },
            grinding: {
                method: 'remove seeds from pods',
                notes: 'Discard pods or use for infusing'
            },
            crushing: {
                method: 'lightly crush to release oils',
                notes: 'For infusing liquids'
            }
        },
        culinaryApplications: {
            'rice_dishes': {
                name: 'Rice Dishes',
                method: 'add whole pods during cooking',
                timing: 'with rice and water',
                pAirings: ['basmati rice', 'saffron', 'cinnamon'],
                ratios: '4-5 pods per cup of rice'
            },
            'curries': {
                name: 'Curries',
                method: 'add whole pods during cooking',
                timing: 'with meat and vegetables',
                pAirings: ['chicken', 'lamb', 'onions'],
                ratios: '2-3 pods per pound of meat'
            },
            'tea_blends': {
                name: 'Tea Blends',
                method: 'combine with other spices',
                pAirings: ['black tea', 'cinnamon', 'orange'],
                ratios: '1 pod per 2 cups water'
            }
        },
        storage: {
            temperature: 'cool, dark place',
            duration: '2 years',
            container: 'Airtight',
            notes: 'Maintains potency well when whole'
        }
    },
    'mustard_seeds': {
        name: 'Mustard Seeds',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
        }),
        qualities: ['pungent', 'hot', 'nutty'],
        origin: ['India', 'Canada', 'Nepal'],
        category: 'spice',
        subCategory: 'whole',
        varieties: {
            'Brown': {
                name: 'Brown',
                appearance: 'smaller, dark brown',
                flavor: 'more pungent',
                uses: 'Indian cuisine, oil blooming'
            }
        },
        culinaryApplications: {
            'tempering': {
                name: 'Tempering',
                method: 'heat oil until seeds pop',
                timing: 'start of cooking',
                pAirings: ['curry leaves', 'cumin seeds', 'asafoetida'],
                ratios: '1 tsp per cup of oil',
                techniques: {
                    'tadka': 'bloom in hot oil and pour over dish',
                    'base': 'start dish with bloomed seeds',
                    'layering': 'add at multiple cooking stages'
                }
            },
            'marinades': {
                name: 'Marinades',
                method: 'crush or grind',
                timing: '4-24 hours before cooking',
                pAirings: ['garlic', 'herbs', 'vinegar'],
                ratios: '1 tbsp per cup of liquid',
                techniques: {
                    'paste': 'grind with liquids',
                    'rustic': 'roughly crush',
                    'infusion': 'heat in oil first'
                }
            },
            'sauces': {
                name: 'Sauces',
                method: 'toast and grind or leave whole',
                pAirings: ['cream', 'wine', 'vinegar'],
                ratios: '1 tsp per cup of liquid',
                techniques: {
                    'cream_sauce': 'infuse in warm cream',
                    'vinaigrette': 'crush and mix',
                    'grainy_mustard': 'soak in vinegar'
                }
            }
        },
        storage: {
            temperature: 'cool, dark place',
            duration: 'whole: 1 year',
            container: 'Airtight',
            notes: 'Seeds can be sprouted if fresh'
        }
    },
    'fennel_seeds': {
        name: 'Fennel Seeds',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
        }),
        qualities: ['sweet', 'anise-like', 'warming'],
        origin: ['India', 'Mediterranean', 'China'],
        category: 'spice',
        subCategory: 'whole',
        varieties: {
            'Indian': {
                name: 'Indian',
                appearance: 'greener, thinner',
                flavor: 'more aromatic',
                uses: 'curries, digestive'
            },
            'Mediterranean': {
                name: 'Mediterranean',
                appearance: 'plumper, pale green',
                flavor: 'sweeter',
                uses: 'sausages, bread'
            }
        },
        culinaryApplications: {
            'bread_baking': {
                name: 'Bread Baking',
                method: 'add whole to dough',
                timing: 'during mixing',
                pAirings: ['rye flour', 'caraway', 'salt'],
                ratios: '1-2 tbsp per loaf',
                techniques: {
                    'topping': 'sprinkle on crust',
                    'incorporated': 'mix into dough',
                    'flavored_oil': 'infuse in oil first'
                }
            },
            'seafood_seasoning': {
                name: 'Seafood Seasoning',
                method: 'crush or leave whole',
                timing: 'before cooking',
                pAirings: ['citrus', 'garlic', 'white wine'],
                ratios: '1 tsp per pound',
                techniques: {
                    'crust': 'grind with salt',
                    'court_bouillon': 'add to poaching liquid',
                    'steam_aromatic': 'add to steaming water'
                }
            },
            'sausage_making': {
                name: 'Sausage Making',
                method: 'lightly crush',
                pAirings: ['black pepper', 'garlic', 'salt'],
                ratios: '1 tbsp per pound',
                techniques: {
                    'italian_style': 'whole seeds',
                    'chinese_style': 'ground with star anise',
                    'merguez': 'combined with cumin'
                }
            }
        }
    },
    'coriander_seeds': {
        name: 'Coriander Seeds',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
        }),
        qualities: ['citrusy', 'nutty', 'floral'],
        origin: ['India', 'Morocco', 'Eastern Europe'],
        category: 'spice',
        subCategory: 'whole',
        varieties: {
            'Indian': {
                name: 'Indian',
                appearance: 'larger, more round',
                flavor: 'more aromatic',
                uses: 'curries, spice blends'
            },
            'Mediterranean': {
                name: 'Mediterranean',
                appearance: 'smaller, more oval',
                flavor: 'more citrusy',
                uses: 'marinades, pickling'
            }
        },
        culinaryApplications: {
            'curry_base': {
                name: 'Curry Base',
                method: 'toast and grind',
                timing: 'beginning of cooking',
                pAirings: ['cumin', 'fennel', 'peppercorns'],
                ratios: '2:1:1 (coriander:cumin:other spices)',
                techniques: {
                    'dry_toasting': 'until fragrant and color changes',
                    'wet_grinding': 'with aromatics for paste',
                    'whole_tempering': 'crack and bloom in oil'
                }
            },
            'pickling_spice': {
                name: 'Pickling Spice',
                method: 'use whole',
                timing: 'add to brine',
                pAirings: ['dill', 'mustard seed', 'bay leaf'],
                ratios: '2 tbsp per quart',
                techniques: {
                    'hot_brine': 'add to heating liquid',
                    'fermentation': 'add at start',
                    'quick_pickle': 'lightly crush first'
                }
            }
        }
    },
    'cumin_seeds': {
        name: 'Cumin Seeds',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
        }),
        astrologicalProfile: {
            rulingPlanets: ['Mercury', 'Saturn'],
            favorableZodiac: ['virgo', 'capricorn'],
            elementalAffinity: {
                base: 'Earth',
                decanModifiers: {
                    first: {},
                    second: {},
                    third: { element: 'Air', planet: 'Uranus' }
                }
            }
        },
        qualities: ['earthy', 'warm', 'pungent'],
        origin: ['India', 'Iran', 'Turkey'],
        category: 'spice',
        subCategory: 'whole',
        varieties: {
            'Indian': {
                name: 'Indian',
                appearance: 'small, dark',
                flavor: 'intense, earthy',
                uses: 'curries, tempering'
            },
            'Iranian': {
                name: 'Iranian',
                appearance: 'longer seeds',
                flavor: 'more delicate',
                uses: 'rice dishes, kebabs'
            }
        },
        culinaryApplications: {
            'tempering': {
                name: 'Tempering',
                method: 'bloom in hot oil',
                timing: 'start of cooking',
                pAirings: ['mustard seeds', 'curry leaves'],
                ratios: '1-2 tsp per dish',
                techniques: {
                    'tadka': 'bloom and pour over',
                    'pilaf_base': 'start rice dishes',
                    'oil_infusion': 'longer steep for oil'
                }
            },
            'meat_rubs': {
                name: 'Meat Rubs',
                method: 'toast and grind',
                timing: 'before cooking',
                pAirings: ['coriander', 'black pepper', 'chili'],
                ratios: '1 tbsp per pound',
                techniques: {
                    'dry_rub': 'grind with other spices',
                    'paste': 'grind with wet ingredients',
                    'marinade_base': 'infuse in oil first'
                }
            }
        }
    },
    'caraway_seeds': {
        name: 'Caraway Seeds',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
        }),
        qualities: ['warming', 'sharp', 'slightly sweet'],
        origin: ['Netherlands', 'Eastern Europe', 'Finland'],
        category: 'spice',
        subCategory: 'whole',
        varieties: {
            'Dutch': {
                name: 'Dutch',
                appearance: 'curved, dark',
                flavor: 'traditional strength',
                uses: 'bread, cheese'
            },
            'Finnish': {
                name: 'Finnish',
                appearance: 'slightly larger',
                flavor: 'more intense',
                uses: 'rye bread, aquavit'
            }
        },
        culinaryApplications: {
            'bread_baking': {
                name: 'Bread Baking',
                method: 'whole seeds in dough',
                timing: 'during mixing',
                pAirings: ['rye flour', 'fennel', 'salt'],
                ratios: '1-2 tbsp per loaf',
                techniques: {
                    'traditional_rye': 'heavy seeding',
                    'light_rye': 'sparse seeding',
                    'crust_topping': 'press into top'
                }
            },
            'sauerkraut': {
                name: 'Sauerkraut',
                method: 'add whole to cabbage',
                timing: 'during fermentation setup',
                pAirings: ['juniper', 'bay leaf', 'black pepper'],
                ratios: '1 tbsp per quart',
                techniques: {
                    'traditional': 'whole seeds throughout',
                    'spice_packet': 'contained in muslin',
                    'layered': 'between cabbage layers'
                }
            }
        }
    }
};
// Fix the ingredient mappings to ensure they have all required properties
exports.wholeSpices = (0, elementalUtils_1.fixIngredientMappings)(rawWholeSpices);
