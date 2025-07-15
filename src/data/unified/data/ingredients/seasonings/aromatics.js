"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aromatics = void 0;
const elementalUtils_1 = require("../../../utils/elementalUtils");
const elementalUtils_2 = require("../../../utils/elemental/elementalUtils");
const rawAromatics = {
    'onion': {
        name: 'Onion',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
        }),
        astrologicalProfile: {
            rulingPlanets: ['Mars', 'Saturn'],
            favorableZodiac: ['aries', 'capricorn'],
            elementalAffinity: {
                base: 'Fire',
                decanModifiers: {
                    first: {},
                    second: {},
                    third: { element: 'Water', planet: 'Neptune' }
                }
            }
        },
        qualities: ['pungent', 'savory', 'sweet when cooked'],
        origin: ['Global'],
        category: 'aromatic',
        subCategory: 'allium',
        varieties: {},
        culinaryApplications: {
            'base_flavor': {
                name: 'Base Flavor',
                method: 'sauté until translucent',
                timing: '5-7 minutes',
                applications: {
                    'mirepoix': 'with carrots and celery',
                    'sofrito': 'with peppers and tomatoes',
                    'holy_trinity': 'with celery and bell peppers'
                }
            }
        },
        storage: {
            temperature: 'cool, dry place',
            humidity: 'low',
            container: 'ventilated',
            duration: '1-2 months',
            notes: 'Keep away from potatoes'
        }
    },
    'garlic': {
        name: 'Garlic',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
        }),
        astrologicalProfile: {
            rulingPlanets: ['Mars', 'Pluto'],
            favorableZodiac: ['aries', 'scorpio'],
            elementalAffinity: {
                base: 'Fire',
                decanModifiers: {
                    first: {},
                    second: {},
                    third: { element: 'Air', planet: 'Uranus' }
                }
            }
        },
        qualities: ['pungent', 'spicy', 'medicinal'],
        origin: ['Central Asia'],
        category: 'aromatic',
        subCategory: 'allium',
        varieties: {},
        culinaryApplications: {
            'sautéed': {
                name: 'Sautéed',
                method: 'minced and cooked in oil',
                timing: '30-60 seconds until fragrant',
                applications: {
                    'base_flavor': 'start of many dishes',
                    'infused_oils': 'for finishing dishes',
                    'pasta_sauces': 'essential foundation'
                }
            }
        },
        storage: {
            temperature: 'cool, dry place',
            humidity: 'moderate',
            container: 'ventilated',
            duration: '3-6 months',
            notes: 'Do not refrigerate whole heads'
        }
    },
    'ginger': {
        name: 'Ginger',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
        }),
        astrologicalProfile: {
            rulingPlanets: ['Mars', 'Sun'],
            favorableZodiac: ['aries', 'leo'],
            elementalAffinity: {
                base: 'Fire',
                decanModifiers: {
                    first: {},
                    second: {},
                    third: { element: 'Earth', planet: 'Saturn' }
                }
            }
        },
        qualities: ['warming', 'pungent', 'aromatic'],
        origin: ['Southeast Asia'],
        category: 'spice',
        subCategory: 'rhizome',
        varieties: {
            'Young': {
                name: 'Young',
                appearance: 'thin skin, juicy flesh',
                flavor: 'mild, less fibrous',
                uses: 'fresh applications, pickling'
            },
            'Mature': {
                name: 'Mature',
                appearance: 'thick skin, fibrous',
                flavor: 'strong, spicy',
                uses: 'cooking, powdering'
            },
            'Galangal': {
                name: 'Galangal',
                appearance: 'harder, white flesh',
                flavor: 'citrusy, pine-like',
                uses: 'Thai cuisine, spice blends'
            }
        },
        culinaryApplications: {
            'fresh': {
                name: 'Fresh',
                method: 'peeled and grated or minced',
                timing: 'add early for mild flavor, late for punch',
                applications: {
                    'stir_fry': 'aromatic base',
                    'marinades': 'tenderizing properties',
                    'teas': 'medicinal and flavorful'
                }
            }
        },
        storage: {
            temperature: 'room temperature or refrigerated',
            humidity: 'moderate',
            container: 'paper bag or wrapped in paper towel',
            duration: 'fresh: 3 weeks, frozen: 6 months',
            notes: 'Can be frozen whole or grated'
        }
    },
    'lemongrass': {
        name: 'Lemongrass',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
        }),
        astrologicalProfile: {
            rulingPlanets: ['Mercury', 'Venus'],
            favorableZodiac: ['gemini', 'libra'],
            elementalAffinity: {
                base: 'Air'
            }
        },
        qualities: ['citrusy', 'aromatic', 'bright'],
        origin: ['Southeast Asia'],
        category: 'aromatic',
        subCategory: 'herb',
        culinaryApplications: {
            'infusing': {
                name: 'Infusing',
                method: 'bruised and simmered',
                timing: 'add early in cooking',
                applications: {
                    'soups': 'thai tom yum',
                    'curries': 'southeast asian',
                    'teas': 'medicinal brewing'
                }
            },
            'paste': {
                name: 'Paste',
                method: 'finely minced inner core',
                timing: 'typically with other aromatics',
                applications: {
                    'curry_pastes': 'with chilies and galangal',
                    'marinades': 'with lime and garlic',
                    'rubs': 'for grilled proteins'
                }
            }
        },
        storage: {
            temperature: 'refrigerated',
            humidity: 'moderate',
            container: 'wrapped in damp paper towel',
            duration: '2-3 weeks fresh, 6 months frozen',
            notes: 'Can be frozen whole or chopped'
        }
    },
    'shallot': {
        name: 'Shallot',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
        }),
        astrologicalProfile: {
            rulingPlanets: ['Mercury', 'Venus'],
            favorableZodiac: ['virgo', 'taurus'],
            elementalAffinity: {
                base: 'Earth'
            }
        },
        qualities: ['delicate', 'sweet', 'aromatic'],
        origin: ['Southeast Asia'],
        category: 'aromatic',
        subCategory: 'allium',
        culinaryApplications: {
            'diced': {
                name: 'Diced',
                method: 'finely diced',
                timing: 'brief cooking',
                applications: {
                    'vinaigrettes': 'classic french',
                    'pan_sauces': 'for proteins',
                    'garnishes': 'raw or fried'
                }
            }
        },
        storage: {
            temperature: 'cool, dry place',
            humidity: 'low',
            container: 'ventilated',
            duration: '1 month',
            notes: 'Similar to onions'
        }
    },
    'scallion': {
        name: 'Scallion',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
        }),
        astrologicalProfile: {
            rulingPlanets: ['Mercury', 'Moon'],
            favorableZodiac: ['gemini', 'cancer'],
            elementalAffinity: {
                base: 'Air'
            }
        },
        qualities: ['fresh', 'mild', 'grassy'],
        origin: ['Asia'],
        category: 'aromatic',
        subCategory: 'allium',
        culinaryApplications: {
            'cooked': {
                name: 'Cooked',
                method: 'chopped or whole',
                timing: 'brief cooking only',
                applications: {
                    'stir_fry': 'added toward end',
                    'scallion_oil': 'chinese condiment',
                    'pancakes': 'chinese scallion pancakes'
                }
            }
        },
        storage: {
            temperature: 'refrigerated',
            humidity: 'high',
            container: 'wrapped in damp paper towel',
            duration: '1-2 weeks',
            notes: 'Can be regrown in water from roots'
        }
    },
    'saffron': {
        name: 'Saffron',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
        }),
        astrologicalProfile: {
            rulingPlanets: ['Sun', 'Mars'],
            favorableZodiac: ['gemini', 'libra'],
            elementalAffinity: {
                base: 'Fire',
                decanModifiers: {
                    first: {},
                    second: {},
                    third: { element: 'Air', planet: 'Venus' }
                }
            }
        },
        qualities: ['aromatic', 'warm', 'floral'],
        origin: ['Iran'],
        category: 'aromatic',
        subCategory: 'spices',
        culinaryApplications: {
            'infusing': {
                name: 'Infusing',
                method: 'crushed and simmered',
                timing: 'add early in cooking',
                applications: {
                    'curries': 'Indian and Middle Eastern',
                    'rice': 'Persian and Indian',
                    'tea': 'Turkish and Middle Eastern'
                }
            },
            'paste': {
                name: 'Paste',
                method: 'finely ground',
                timing: 'typically with other spices',
                applications: {
                    'curries': 'Indian and Middle Eastern',
                    'rice': 'Persian and Indian',
                    'tea': 'Turkish and Middle Eastern'
                }
            }
        },
        storage: {
            temperature: 'cool, dry place',
            humidity: 'low',
            container: 'Airtight container',
            duration: '2-3 years',
            notes: 'Keep away from light and heat'
        }
    }
};
// Fix the ingredient mappings to ensure they have all required properties
exports.aromatics = (0, elementalUtils_1.fixIngredientMappings)(rawAromatics);
