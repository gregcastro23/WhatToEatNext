"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allSeafood = exports.seafood = void 0;
const elementalUtils_1 = require("../../../utils/elementalUtils");
const elementalUtils_2 = require("../../../utils/elemental/elementalUtils");
const rawSeafood = {
    'atlantic_salmon': {
        name: 'Salmon',
        category: 'protein',
        subCategory: 'seafood',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({
            Water: 0.55,
            Fire: 0.25,
            Earth: 0.15,
            Air: 0.05
        }),
        qualities: ['omega-rich', 'flaky', 'buttery', 'mild', 'versatile', 'nutrient-dense'],
        origin: ['Norway', 'Scotland', 'Chile', 'Canada', 'United States'],
        // Nutritional information (standardized)
        nutritionalProfile: {
            serving_size: "3 oz (85g)",
            calories: 206,
            macros: {
                protein: 22,
                carbs: 0,
                fat: 12,
                fiber: 0
            },
            vitamins: {
                B12: 1.17,
                D: 0.66,
                niacin: 0.50,
                B6: 0.38,
                pantothenic_acid: 0.30,
                thiamine: 0.28
            },
            minerals: {
                selenium: 0.75,
                phosphorus: 0.20,
                potassium: 0.08
            },
            omega3: 1.8,
            source: "USDA FoodData Central"
        },
        // Sensory profile (standardized)
        sensoryProfile: {
            taste: {
                sweet: 0.3,
                salty: 0.2,
                sour: 0.0,
                bitter: 0.0,
                umami: 0.8,
                spicy: 0.0
            },
            aroma: {
                floral: 0.0,
                fruity: 0.0,
                herbal: 0.0,
                spicy: 0.0,
                earthy: 0.3,
                woody: 0.0
            },
            texture: {
                crisp: 0.0,
                tender: 0.7,
                creamy: 0.4,
                chewy: 0.2,
                crunchy: 0.0,
                silky: 0.7
            }
        },
        // Storage information (standardized)
        storage: {
            temperature: {
                fahrenheit: 32,
                celsius: 0
            },
            duration: "1-2 days (fresh), 2-3 months (frozen)",
            container: "Airtight wrapping",
            tips: [
                "Keep in coldest part of refrigerator",
                "Use within 24 hours of purchase for best flavor",
                "Wrap in moisture-proof paper or plastic before freezing"
            ]
        },
        // Preparation (standardized)
        preparation: {
            methods: ["grill", "bake", "pan-sear", "poach", "steam", "smoke", "raw (sushi-grade)"],
            washing: false,
            notes: "Leave skin on during cooking for easier handling and extra nutrients"
        },
        // Health benefits (standardized)
        healthBenefits: [
            'Heart health (reduces blood pressure and inflammation)',
            'Brain function (enhances memory and cognitive performance)',
            'Joint health (reduces stiffness and arthritis symptoms)',
            'Weight management (protein-rich and satiating)',
            'Thyroid health (good source of selenium)',
            'Bone health (contains vitamin D and phosphorus)',
            'Mental well-being (omega-3s may help reduce depression symptoms)'
        ],
        // Culinary applications (standardized)
        culinaryApplications: {
            commonUses: ["entrees", "salads", "sushi", "appetizers", "sandwiches", "breakfast dishes"],
            pAiringRecommendations: {
                complementary: ["lemon", "dill", "capers", "butter", "olive oil", "garlic", "white wine", "fennel"],
                contrasting: ["dijon mustard", "maple syrup", "soy sauce", "ginger", "cucumber"],
                toAvoid: ["strong cheeses", "chocolate", "most red wine", "very spicy peppers"]
            },
            seasonalPeak: ["spring", "summer"],
            techniques: {
                "grill": {
                    method: "direct heat, medium-high",
                    temperature: {
                        fahrenheit: 400,
                        celsius: 204
                    },
                    timing: "4-5 minutes per side",
                    ingredients: ["butter", "garlic", "dill", "lemon zest"],
                    notes: "Cedar plank adds smoky flavor"
                },
                "pan_sear": {
                    method: "high heat, skin-on",
                    timing: "4-5 minutes skin side, 2-3 minutes flesh side",
                    ingredients: ["butter", "thyme", "garlic", "lemon"],
                    notes: "Start with very hot pan, cook skin side first until crispy"
                }
            }
        },
        // Varieties (standardized)
        varieties: {
            'Farm Raised': {
                name: 'Farm Raised',
                appearance: 'light orange-pink',
                texture: 'fatty, soft',
                flavor: 'mild, buttery',
                uses: 'all-purpose'
            }
        },
        // Category-specific extension: proteins
        cuts: {
            'fillet': {
                description: 'boneless side',
                weight: '6-8 oz per serving',
                notes: 'most versatile',
                cookingMethods: ["grill", "bake", "pan-sear", "poach"]
            },
            'steak': {
                description: 'cross-section cut',
                weight: '8-10 oz',
                notes: 'good for grilling',
                cookingMethods: ["grill", "bake"]
            },
            'whole_side': {
                description: 'entire fillet',
                weight: '2-4 lbs',
                notes: 'ideal for large gatherings',
                cookingMethods: ["bake", "smoke", "grill"]
            }
        },
        cookingTips: {
            internalTemperature: {
                medium: {
                    fahrenheit: 125,
                    celsius: 52
                },
                mediumWell: {
                    fahrenheit: 135,
                    celsius: 57
                },
                safe: {
                    fahrenheit: 145,
                    celsius: 63
                }
            },
            restingTime: "3-5 minutes",
            commonMistakes: [
                "Overcooking (becomes dry)",
                "Starting in a cold pan (causes sticking)",
                "Removing skin (provides barrier during cooking)",
                "Cooking straight from refrigerator (uneven cooking)"
            ]
        },
        sustainability: {
            rating: 'Variable',
            considerations: [
                "Farming methods impact environmental footprint",
                "Look for ASC or MSC certification",
                "Closed containment farming reduces environmental impact"
            ],
            alternatives: ["Arctic char", "Rainbow trout", "MSC-certified wild salmon"]
        },
        // Protein-specific properties
        proteinContent: 22,
        fatProfile: {
            saturated: 3,
            monounsaturated: 4,
            polyunsaturated: 5,
            omega3: 1.8,
            omega6: 0.2
        },
        // Cooking details
        cookingMethods: [
            {
                name: "Grill",
                method: "direct heat, medium-high",
                temperature: {
                    fahrenheit: 400,
                    celsius: 204
                },
                timing: "4-5 minutes per side",
                internalTemp: {
                    fahrenheit: 145,
                    celsius: 63
                },
                moistureRetention: 0.7,
                flavorDevelopment: {
                    maillard: 0.8,
                    caramelization: 0.5,
                    smoky: 0.7,
                    notes: "Develops crispy exterior with moist interior"
                }
            },
            {
                name: "Bake",
                method: "dry heat",
                temperature: {
                    fahrenheit: 375,
                    celsius: 190
                },
                timing: "12-15 minutes",
                internalTemp: {
                    fahrenheit: 145,
                    celsius: 63
                },
                moistureRetention: 0.85,
                flavorDevelopment: {
                    maillard: 0.5,
                    caramelization: 0.4,
                    aromatic: 0.7,
                    notes: "Even cooking with good moisture retention"
                }
            },
            {
                name: "Pan-Sear",
                method: "high heat, skin-on",
                temperature: "medium-high",
                timing: {
                    skinSide: "4-5 minutes",
                    fleshSide: "2-3 minutes",
                    resting: "3-4 minutes"
                },
                internalTemp: {
                    fahrenheit: 145,
                    celsius: 63
                },
                moistureRetention: 0.75,
                flavorDevelopment: {
                    maillard: 0.9,
                    caramelization: 0.7,
                    fatty: 0.8,
                    notes: "Creates crispy skin and keeps moisture sealed in"
                }
            }
        ],
        // Astrology / elemental connections (standardized)
        astrologicalProfile: {
            rulingPlanets: ['Moon', 'Neptune'],
            favorableZodiac: ['cancer', 'pisces'],
            elementalAffinity: {
                base: 'Water',
                secondary: 'Air'
            }
        }
    },
    'shrimp_jumbo': {
        name: 'Shrimp Jumbo',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({
            Water: 0.5,
            Air: 0.3,
            Fire: 0.1,
            Earth: 0.1
        }),
        astrologicalProfile: {
            rulingPlanets: ['Moon', 'Neptune'],
            favorableZodiac: ['cancer', 'scorpio', 'pisces'],
            elementalAffinity: {
                base: 'Water',
                decanModifiers: {
                    first: {
                        element: 'Water',
                        planet: 'Moon'
                    },
                    second: {
                        element: 'Water',
                        planet: 'Neptune'
                    },
                    third: { element: 'Air', planet: 'Mercury' }
                }
            },
            lunarPhaseModifiers: {
                waxingCrescent: {
                    elementalBoost: {
                        Water: 0.1,
                        Air: 0.05
                    },
                    preparationTips: ['Best for grilling']
                },
                fullmoon: {
                    elementalBoost: {
                        Water: 0.1,
                        Earth: 0.1
                    },
                    preparationTips: ['Ideal for steaming']
                }
            }
        },
        qualities: ['sweet', 'firm', 'versatile'],
        origin: ['Gulf Coast', 'South Pacific', 'Indian Ocean'],
        category: 'seafood',
        subCategory: 'shellfish',
        varieties: {
            'Tiger': {
                name: 'Tiger',
                appearance: 'grey with black stripes',
                size: '13 / (15 || 1) to U / (10 || 1)',
                flavor: 'robust, briny',
                notes: 'ideal for grilling'
            },
            'Spot Prawns': {
                name: 'Spot Prawns',
                appearance: 'reddish with white spots',
                size: 'U / (10 || 1) to U / (8 || 1)',
                flavor: 'sweet, delicate',
                notes: 'premium Pacific variety'
            }
        },
        culinaryApplications: {
            'grill': {
                name: 'Grill',
                shell_on: {
                    method: 'direct high heat',
                    preparation: 'butterfly, devein',
                    marinade: {
                        'garlic_herb': ['olive oil', 'garlic', 'herbs'],
                        'spicy': ['chili', 'lime', 'cilantro'],
                        'asian': ['soy', 'ginger', 'sesame']
                    },
                    timing: '2-3 minutes per side',
                    indicators: 'pink and opaque'
                },
                peeled: {
                    method: 'skewered, high heat',
                    preparation: 'devein, tail on / (off || 1)',
                    marinade: {
                        'lemon_garlic': ['lemon', 'garlic', 'parsley'],
                        'cajun': ['paprika', 'cayenne', 'herbs'],
                        'teriyaki': ['soy', 'mirin', 'ginger']
                    },
                    timing: '1-2 minutes per side'
                }
            },
            'poach': {
                name: 'Poach',
                court_bouillon: {
                    base: ['Water', 'wine', 'aromatics'],
                    timing: '2-3 minutes total',
                    technique: 'gentle simmer'
                },
                shell_on: {
                    method: 'slow poach',
                    timing: '3-4 minutes',
                    cooling: 'ice bath immediately'
                }
            },
            'stir_fry': {
                name: 'Stir Fry',
                preparation: 'peeled, deveined',
                technique: {
                    'velvet': {
                        name: 'Velvet',
                        marinade: ['egg white', 'cornstarch', 'rice wine'],
                        method: 'oil blanch then stir-fry',
                        timing: 'blanch 30 seconds, fry 1 minute'
                    }
                }
            }
        },
        saucePAirings: {
            'cold': {
                name: 'Cold',
                'cocktail': {
                    name: 'Cocktail',
                    base: 'tomato',
                    ingredients: ['horseradish', 'lemon', 'worcestershire'],
                    service: 'chilled, hanging presentation'
                },
                'remoulade': {
                    name: 'Remoulade',
                    base: 'mayonnaise',
                    ingredients: ['cajun spice', 'pickles', 'capers'],
                    service: 'chilled, side sauce'
                }
            },
            'hot': {
                name: 'Hot',
                'scampi': {
                    name: 'Scampi',
                    base: 'butter-wine',
                    ingredients: ['garlic', 'lemon', 'parsley'],
                    finish: 'mount with butter'
                },
                'curry': {
                    name: 'Curry',
                    base: 'coconut milk',
                    variations: {
                        'thai': ['red curry', 'kaffir lime', 'basil'],
                        'indian': ['garam masala', 'tomato', 'cream']
                    }
                },
                'xo': {
                    name: 'Xo',
                    base: 'dried seafood-chili',
                    preparation: 'sauce made ahead',
                    usage: 'small amount as condiment'
                }
            }
        },
        seasonalAdjustments: {
            'summer': {
                name: 'Summer',
                preparations: ['grilled', 'cold poached'],
                sauces: ['light herb', 'citrus based'],
                accompaniments: ['summer vegetables', 'cold salads']
            },
            'winter': {
                name: 'Winter',
                preparations: ['stir-fried', 'curry'],
                sauces: ['rich coconut', 'spicy tomato'],
                accompaniments: ['hearty grains', 'roasted vegetables']
            }
        },
        safetyThresholds: {
            cooking: {
                temperature: {},
                indicators: ['opaque throughout', 'pink-red color'],
                timing: 'until just cooked through'
            }
        }
    },
    'lobster_maine': {
        name: 'Lobster Maine',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({
            Water: 0.6,
            Earth: 0.2,
            Air: 0.1,
            Fire: 0.1
        }),
        astrologicalProfile: {
            rulingPlanets: ['Moon', 'Neptune'],
            favorableZodiac: ['cancer', 'scorpio', 'pisces'],
            elementalAffinity: {
                base: 'Water',
                decanModifiers: {
                    first: {
                        element: 'Water',
                        planet: 'Moon'
                    },
                    second: {
                        element: 'Water',
                        planet: 'Neptune'
                    },
                    third: { element: 'Air', planet: 'Mercury' }
                }
            },
            lunarPhaseModifiers: {
                newmoon: {
                    elementalBoost: {
                        Water: 0.15,
                        Earth: 0.1
                    },
                    preparationTips: ['Best for curing']
                },
                fullmoon: {
                    elementalBoost: {
                        Water: 0.2,
                        Air: 0.1
                    },
                    preparationTips: ['Ideal for poaching']
                }
            }
        },
        qualities: ['sweet', 'rich', 'luxurious'],
        origin: ['North Atlantic', 'Maine Coast'],
        category: 'protein',
        subCategory: 'shellfish',
        varieties: {
            'Hard Shell': {
                name: 'Hard Shell',
                appearance: 'dark blue-black shell',
                texture: 'firm, dense',
                flavor: 'sweet, briny',
                notes: 'best for boiling'
            },
            'Soft Shell': {
                name: 'Soft Shell',
                appearance: 'softer, lighter shell',
                texture: 'tender, delicate',
                flavor: 'sweet, mild',
                notes: 'ideal for grilling'
            }
        },
        culinaryApplications: {
            'boil': {
                name: 'Boil',
                method: 'live lobster in salted water',
                timing: '8-10 minutes per pound',
                accompaniments: ['melted butter', 'lemon']
            },
            'grill': {
                name: 'Grill',
                method: 'split and grill shell-side down',
                timing: '5-7 minutes',
                seasoning: ['butter', 'garlic', 'parsley']
            }
        }
    },
    'mussels_blue': {
        name: 'Mussels Blue',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({
            Water: 0.65,
            Earth: 0.2,
            Air: 0.1,
            Fire: 0.05
        }),
        astrologicalProfile: {
            rulingPlanets: ['Moon', 'Neptune'],
            favorableZodiac: ['cancer', 'scorpio', 'pisces'],
            elementalAffinity: {
                base: 'Water',
                decanModifiers: {
                    first: {
                        element: 'Water',
                        planet: 'Moon'
                    },
                    second: {
                        element: 'Water',
                        planet: 'Neptune'
                    },
                    third: { element: 'Air', planet: 'Mercury' }
                }
            },
            lunarPhaseModifiers: {
                waxingCrescent: {
                    elementalBoost: {
                        Water: 0.1,
                        Air: 0.05
                    },
                    preparationTips: ['Best for grilling']
                },
                fullmoon: {
                    elementalBoost: {
                        Water: 0.2,
                        Earth: 0.1
                    },
                    preparationTips: ['Ideal for steaming']
                }
            }
        },
        qualities: ['briny', 'sweet', 'tender'],
        origin: ['North Atlantic', 'Mediterranean'],
        category: 'protein',
        subCategory: 'shellfish',
        varieties: {
            'Farm Raised': {
                name: 'Farm Raised',
                appearance: 'cleaner shells',
                texture: 'tender, consistent',
                flavor: 'milder, sweeter',
                notes: 'more consistent size'
            }
        },
        culinaryApplications: {
            'steam': {
                name: 'Steam',
                method: 'steam in white wine broth',
                timing: '5-7 minutes',
                accompaniments: ['garlic', 'shallots', 'parsley']
            },
            'grill': {
                name: 'Grill',
                method: 'grill in shell until open',
                timing: '3-4 minutes',
                seasoning: ['garlic butter', 'lemon zest']
            }
        }
    },
    'oysters_eastern': {
        name: 'Eastern Oysters',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({
            Water: 0.7,
            Earth: 0.2,
            Air: 0.05,
            Fire: 0.05
        }),
        astrologicalProfile: {
            rulingPlanets: ['Moon', 'Neptune'],
            favorableZodiac: ['cancer', 'scorpio', 'pisces'],
            elementalAffinity: {
                base: 'Water',
                decanModifiers: {
                    first: {
                        element: 'Water',
                        planet: 'Moon'
                    },
                    second: {
                        element: 'Water',
                        planet: 'Neptune'
                    },
                    third: { element: 'Water', planet: 'Neptune' }
                }
            },
            lunarPhaseModifiers: {
                waxingCrescent: {
                    elementalBoost: {
                        Water: 0.15,
                        Earth: 0.1
                    },
                    preparationTips: ['Best for raw consumption']
                },
                fullmoon: {
                    elementalBoost: {
                        Water: 0.2,
                        Air: 0.05
                    },
                    preparationTips: ['Ideal for poaching or grilling']
                }
            }
        },
        qualities: ['briny', 'creamy', 'mineral-rich', 'sweet', 'meaty'],
        origin: ['East Coast of North America', 'Chesapeake Bay', 'Gulf of Mexico'],
        nutritionalProfile: {
            serving_size_oz: 3,
            calories: 81,
            protein: 9.45,
            fat: 2.3,
            carbohydrates: 4.95,
            minerals: {
                zinc: '166% DV',
                copper: '176% DV',
                vitamin_b12: '667% DV',
                iron: '28% DV',
                selenium: '140% DV',
                magnesium: '5% DV',
                potassium: '4% DV'
            }
        },
        healthBenefits: [
            'Brain health improvement (high in vitamin B12)',
            'Supports bone health (vitamin D, copper, zinc, manganese)',
            'Immune system support (high in zinc)',
            'Heart health (omega-3 fatty acids)',
            'Low in calories, high in protein'
        ],
        category: 'protein',
        subCategory: 'shellfish',
        varieties: {
            'Blue Point': {
                name: 'Blue Point',
                appearance: 'teardrop shape, deep cup',
                flavor: 'balanced brininess, clean finish',
                texture: 'firm, plump',
                notes: 'classic East Coast oyster from Long Island'
            },
            'Wellfleet': {
                name: 'Wellfleet',
                appearance: 'deep cup, fluted shell',
                flavor: 'sweet, clean finish with briny notes',
                texture: 'firm, juicy',
                notes: 'premium Massachusetts variety'
            },
            'Chesapeake Bay': {
                name: 'Chesapeake Bay',
                appearance: 'oval shape, medium cup',
                flavor: 'mild, slightly sweet with mineral finish',
                texture: 'medium-firm',
                notes: 'traditional classic from the Chesapeake region'
            }
        },
        culinaryApplications: {
            'baked': {
                name: 'Baked',
                method: 'topped and baked in shell',
                timing: '10-12 minutes at 450°F (232°C)',
                preparations: {
                    'Rockefeller': {
                        name: 'Rockefeller',
                        ingredients: ['spinach', 'herbs', 'breadcrumbs', 'Pernod', 'parmesan']
                    },
                    'Casino': {
                        name: 'Casino',
                        ingredients: ['bacon', 'bell pepper', 'breadcrumbs', 'butter', 'lemon juice']
                    }
                }
            },
            'stewed': {
                name: 'Stewed',
                method: 'simmered in liquid',
                timing: '3-5 minutes until edges curl',
                recipes: ['oyster stew', 'gumbo', 'chowder'],
                notes: 'add oysters at the end of cooking to prevent overcooking'
            }
        },
        seasonality: {
            peak: ['September', 'October', 'November', 'December', 'January', 'February', 'March', 'April'],
            notes: 'Traditional "R month" rule (months containing the letter R) indicates when wild oysters are at their best, though farmed oysters are available year-round'
        },
        safetyNotes: {
            handling: 'Keep refrigerated at 32-35°F (0-2°C)',
            consumption: 'Raw consumption carries risk of Vibrio bacteria - immunocompromised individuals should avoid raw oysters',
            storage: 'Live oysters should be consumed within 7 days of harvest',
            quality: 'Discard any oysters with open shells that don\'t close when tapped'
        }
    },
    'halibut_pacific': {
        name: 'Halibut Pacific',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({
            Water: 0.45,
            Air: 0.4,
            Earth: 0.1,
            Fire: 0.05
        }),
        astrologicalProfile: {
            rulingPlanets: ['Moon', 'Neptune'],
            favorableZodiac: ['cancer', 'scorpio', 'pisces'],
            elementalAffinity: {
                base: 'Water',
                decanModifiers: {
                    first: {
                        element: 'Water',
                        planet: 'Moon'
                    },
                    second: {
                        element: 'Air',
                        planet: 'Mercury'
                    },
                    third: { element: 'Air', planet: 'Mercury' }
                }
            },
            lunarPhaseModifiers: {
                newmoon: {
                    elementalBoost: {
                        Water: 0.1,
                        Air: 0.1
                    },
                    preparationTips: ['Best for curing']
                },
                fullmoon: {
                    elementalBoost: {
                        Water: 0.15,
                        Air: 0.1
                    },
                    preparationTips: ['Ideal for poaching']
                }
            }
        },
        qualities: ['lean', 'firm', 'delicate'],
        origin: ['North Pacific', 'Alaska'],
        category: 'seafood',
        subCategory: 'fish',
        varieties: {
            'Farm Raised': {
                name: 'Farm Raised',
                appearance: 'light orange-pink',
                texture: 'fatty, soft',
                flavor: 'mild',
                uses: 'all-purpose'
            }
        },
        cuts: {
            'fillet': {
                name: 'Fillet',
                description: 'boneless side',
                weight: '6-8 oz per serving',
                notes: 'most versatile'
            },
            'steak': {
                name: 'Steak',
                description: 'cross-section cut',
                weight: '8-10 oz',
                notes: 'good for grilling'
            },
            'whole_side': {
                name: 'Whole Side',
                description: 'entire fillet',
                weight: '2-4 lbs',
                notes: 'ideal for large gatherings'
            }
        },
        culinaryApplications: {
            'pan_sear': {
                name: 'Pan Sear',
                method: 'high heat, skin-on',
                temperature: 'medium-high',
                timing: {
                    'skin_side': '4-5 minutes',
                    'flesh_side': '2-3 minutes',
                    'resting': '3-4 minutes'
                },
                techniques: {
                    'crispy_skin': {
                        name: 'Crispy Skin',
                        method: 'pat dry, score skin',
                        notes: 'press down gently when first added'
                    },
                    'basting': {
                        name: 'Basting',
                        method: 'butter baste last minute',
                        aromatics: ['thyme', 'garlic', 'lemon']
                    }
                }
            },
            'roast': {
                name: 'Roast',
                method: 'dry heat',
                temperature: {
                    fahrenheit: 400,
                    celsius: 200
                },
                timing: {
                    'per_inch': '10-12 minutes',
                    'resting': '5 minutes'
                },
                techniques: {
                    'en_papillote': {
                        name: 'En Papillote',
                        method: 'wrapped in parchment',
                        ingredients: ['herbs', 'citrus', 'vegetables'],
                        timing: '12-15 minutes'
                    },
                    'glazed': {
                        name: 'Glazed',
                        method: 'brush with glaze',
                        frequency: 'every 4-5 minutes',
                        types: ['miso', 'honey-soy', 'maple']
                    }
                }
            },
            'sous_vide': {
                name: 'Sous Vide',
                method: 'vacuum sealed',
                temperature: {
                    'rare': {
                        name: 'Rare', fahrenheit: 110, celsius: 43
                    },
                    'medium_rare': {
                        name: 'Medium Rare', fahrenheit: 120, celsius: 49
                    }
                },
                timing: {
                    'minimum': '30 minutes',
                    'maximum': '45 minutes',
                    'optimal': '35 minutes'
                },
                finishing: {
                    method: 'quick sear',
                    duration: '30 seconds per side'
                }
            }
        },
        seasonalAdjustments: {
            'summer': {
                name: 'Summer',
                methods: ['grill', 'raw'],
                preparations: {
                    'crudo': {
                        name: 'Crudo',
                        style: 'thin sliced',
                        accompaniments: ['citrus', 'olive oil', 'sea salt']
                    },
                    'poke': {
                        name: 'Poke',
                        style: 'cubed',
                        marinades: ['soy', 'sesame', 'ginger']
                    }
                }
            },
            'winter': {
                name: 'Winter',
                methods: ['roast', 'poach'],
                preparations: {}
            }
        },
        storage: {
            fresh: {
                temperature: {},
                duration: '1-2 days',
                method: 'on ice, uncovered'
            },
            frozen: {
                temperature: {},
                duration: '3-4 months',
                method: 'vacuum sealed'
            },
            thawing: {
                preferred: {
                    method: 'refrigerator',
                    time: '24 hours'
                },
                alternate: {
                    method: 'cold water',
                    time: '1-2 hours',
                    notes: 'keep sealed, change water every 30 minutes'
                }
            }
        },
        safetyThresholds: {
            raw: {
                requirements: ['sushi-grade', 'previously frozen'],
                freezing: {
                    temperature: {},
                    duration: '7 days'
                }
            },
            cooked: {
                minimum: {},
                resting: '3 minutes'
            }
        }
    },
    'sea_bass_chilean': {
        name: 'Sea Bass Chilean',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({
            Water: 0.5,
            Air: 0.3,
            Earth: 0.15,
            Fire: 0.05
        }),
        astrologicalProfile: {
            rulingPlanets: ['Moon', 'Neptune'],
            favorableZodiac: ['cancer', 'scorpio', 'pisces'],
            elementalAffinity: {
                base: 'Water',
                decanModifiers: {
                    first: {
                        element: 'Water',
                        planet: 'Moon'
                    },
                    second: {
                        element: 'Water',
                        planet: 'Neptune'
                    },
                    third: { element: 'Air', planet: 'Mercury' }
                }
            },
            lunarPhaseModifiers: {
                waxingCrescent: {
                    elementalBoost: {
                        Water: 0.1,
                        Air: 0.1
                    },
                    preparationTips: ['Best for grilling']
                },
                fullmoon: {
                    elementalBoost: {
                        Water: 0.15,
                        Earth: 0.05
                    },
                    preparationTips: ['Ideal for poaching']
                }
            }
        },
        qualities: ['buttery', 'rich', 'moist'],
        origin: ['South Pacific', 'Antarctic waters'],
        category: 'protein',
        subCategory: 'white_fish',
        varieties: {
            'Chilean': {
                name: 'Chilean',
                appearance: 'white with grey-black skin',
                texture: 'large, moist flakes',
                notes: 'premium variety'
            },
            'European': {
                name: 'European',
                appearance: 'silvery with blue-grey back',
                texture: 'firmer, smaller flakes',
                notes: 'different species, similar usage'
            }
        },
        culinaryApplications: {
            'steam': {
                name: 'Steam',
                method: 'gentle steam',
                timing: '8-10 minutes per inch',
                techniques: {
                    'chinese_style': {
                        name: 'Chinese Style',
                        preparation: 'whole fish',
                        aromatics: ['ginger', 'scallion', 'cilantro'],
                        sauce: 'soy-sesame'
                    }
                }
            }
        },
        regionalPreparations: {
            'new_england': {
                name: 'New England',
                'classic_boiled': {
                    name: 'Classic Boiled',
                    service: ['drawn butter', 'lemon'],
                    sides: ['corn', 'potatoes', 'steamers'],
                    presentation: 'newspaper covered table'
                },
                'lobster_roll': {
                    name: 'Lobster Roll',
                    bread: 'split-top bun, grilled',
                    variations: {
                        'maine': {
                            name: 'Maine',
                            dressing: 'light mayo',
                            seasoning: 'celery, herbs',
                            temperature: 'chilled'
                        },
                        'connecticut': {
                            name: 'Connecticut',
                            dressing: 'warm butter',
                            seasoning: 'light herbs',
                            temperature: 'warm'
                        }
                    }
                }
            }
        },
        seasonalAdjustments: {
            'summer': {
                name: 'Summer',
                methods: ['grill', 'raw'],
                preparations: {
                    'crudo': {
                        name: 'Crudo',
                        style: 'thin sliced',
                        accompaniments: ['citrus', 'olive oil', 'sea salt']
                    },
                    'poke': {
                        name: 'Poke',
                        style: 'cubed',
                        marinades: ['soy', 'sesame', 'ginger']
                    }
                }
            },
            'winter': {
                name: 'Winter',
                methods: ['roast', 'braise'],
                preparations: {}
            }
        },
        safetyThresholds: {
            cooking: {
                temperature: {},
                visual: 'opaque, flakes easily'
            }
        }
    },
    'cod_atlantic': {
        name: 'Cod Atlantic',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({
            Water: 0.45,
            Earth: 0.3,
            Air: 0.15,
            Fire: 0.1
        }),
        astrologicalProfile: {
            rulingPlanets: ['Moon', 'Neptune'],
            favorableZodiac: ['cancer', 'scorpio', 'pisces'],
            elementalAffinity: {
                base: 'Water',
                decanModifiers: {
                    first: {
                        element: 'Water',
                        planet: 'Moon'
                    },
                    second: {
                        element: 'Earth',
                        planet: 'Saturn'
                    },
                    third: { element: 'Air', planet: 'Mercury' }
                }
            },
            lunarPhaseModifiers: {
                newmoon: {
                    elementalBoost: {
                        Water: 0.1,
                        Earth: 0.1
                    },
                    preparationTips: ['Best for curing']
                },
                fullmoon: {
                    elementalBoost: {
                        Water: 0.15,
                        Air: 0.05
                    },
                    preparationTips: ['Ideal for poaching']
                }
            }
        },
        qualities: ['mild', 'flaky', 'lean'],
        origin: ['North Atlantic', 'Baltic Sea'],
        category: 'seafood',
        subCategory: 'white_fish',
        varieties: {
            'Atlantic': {
                name: 'Atlantic',
                appearance: 'white to off-white',
                texture: 'large, tender flakes',
                notes: 'traditional cod'
            },
            'Pacific': {
                name: 'Pacific',
                appearance: 'similar to Atlantic',
                texture: 'slightly firmer',
                notes: 'more sustainable option'
            }
        },
        culinaryApplications: {
            'traditional': {
                name: 'Traditional',
                'fish_and_chips': {
                    name: 'Fish And Chips',
                    batter: {
                        base: ['flour', 'beer', 'baking powder'],
                        seasoning: ['salt', 'white pepper'],
                        technique: 'cold batter, hot oil'
                    },
                    frying: {
                        temperature: {},
                        timing: '4-5 minutes total',
                        notes: 'until golden brown'
                    }
                },
                'salt_cod': {
                    name: 'Salt Cod',
                    preparation: {
                        salting: '24-48 hours in salt',
                        soaking: '24-36 hours, change water',
                        ready: 'when properly rehydrated'
                    },
                    applications: {
                        'brandade': {
                            name: 'Brandade',
                            method: 'whipped with potato',
                            ingredients: ['olive oil', 'garlic', 'cream'],
                            service: 'warm with bread'
                        },
                        'bacalao': {
                            name: 'Bacalao',
                            method: 'stewed',
                            ingredients: ['tomatoes', 'peppers', 'olives'],
                            style: 'Spanish or Portuguese'
                        }
                    }
                }
            },
            'modern': {
                name: 'Modern',
                'sous_vide': {
                    name: 'Sous Vide',
                    temperature: {},
                    timing: '25-30 minutes',
                    finish: 'light sear optional'
                },
                'pan_roasted': {
                    name: 'Pan Roasted',
                    method: 'sear then oven',
                    temperature: {},
                    timing: '8-10 minutes total'
                }
            }
        },
        regionalPreparations: {
            'british': {
                name: 'British'
            },
            'portuguese': {
                name: 'Portuguese',
                'bacalhau': {
                    name: 'Bacalhau',
                    variations: {
                        'a_bras': {
                            name: 'A Bras',
                            ingredients: ['potatoes', 'eggs', 'olives'],
                            method: 'scrambled style'
                        },
                        'a_gomes_de_sa': {
                            name: 'A Gomes De Sa',
                            ingredients: ['potatoes', 'onions', 'olives'],
                            method: 'layered casserole'
                        }
                    }
                }
            },
            'scandinavian': {
                name: 'Scandinavian',
                'lutefisk': {
                    name: 'Lutefisk',
                    preparation: 'lye-treated cod',
                    service: 'traditional Christmas',
                    accompaniments: ['butter', 'bacon', 'peas']
                }
            }
        },
        saucePAirings: {
            'classic': {
                name: 'Classic',
                'tartar': {
                    name: 'Tartar',
                    base: 'mayonnaise',
                    ingredients: ['pickles', 'capers', 'herbs'],
                    service: 'cold'
                },
                'parsley': {
                    name: 'Parsley',
                    base: 'butter sauce',
                    herbs: 'fresh parsley',
                    finish: 'lemon juice'
                }
            },
            'modern': {
                name: 'Modern',
                'citrus_butter': {
                    name: 'Citrus Butter',
                    base: 'brown butter',
                    citrus: ['orange', 'lemon'],
                    finish: 'fresh herbs'
                },
                'chorizo_oil': {
                    name: 'Chorizo Oil',
                    base: 'rendered chorizo',
                    aromatics: ['garlic', 'herbs'],
                    application: 'drizzle'
                }
            }
        }
    },
    'sole_dover': {
        name: 'Sole Dover',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({
            Water: 0.5,
            Air: 0.4,
            Earth: 0.05,
            Fire: 0.05
        }),
        astrologicalProfile: {
            rulingPlanets: ['Moon', 'Neptune'],
            favorableZodiac: ['cancer', 'scorpio', 'pisces'],
            elementalAffinity: {
                base: 'Water',
                decanModifiers: {
                    first: {
                        element: 'Water',
                        planet: 'Moon'
                    },
                    second: {
                        element: 'Air',
                        planet: 'Mercury'
                    },
                    third: { element: 'Air', planet: 'Mercury' }
                }
            },
            lunarPhaseModifiers: {
                waxingCrescent: {
                    elementalBoost: {
                        Water: 0.1,
                        Air: 0.15
                    },
                    preparationTips: ['Best for grilling']
                },
                fullmoon: {
                    elementalBoost: {
                        Water: 0.2,
                        Air: 0.1
                    },
                    preparationTips: ['Ideal for poaching']
                }
            }
        },
        qualities: ['delicate', 'tender', 'mild'],
        origin: ['North Atlantic', 'Mediterranean'],
        category: 'seafood',
        subCategory: 'flatfish',
        varieties: {
            'Dover': {
                name: 'Dover',
                appearance: 'light beige to white',
                texture: 'very delicate, thin fillets',
                notes: 'premium variety'
            }
        },
        culinaryApplications: {
            'classic': {
                name: 'Classic',
                'meuniere': {
                    name: 'Meuniere',
                    method: 'dredged and pan-fried',
                    sauce: 'brown butter-lemon-parsley',
                    timing: '2-3 minutes per side'
                },
                'en_papillote': {
                    name: 'En Papillote',
                    method: 'steamed in parchment',
                    ingredients: ['white wine', 'shallots', 'herbs'],
                    timing: '8-10 minutes total'
                }
            },
            'modern': {
                name: 'Modern',
                'rolled': {
                    name: 'Rolled',
                    method: 'stuffed and rolled',
                    fillings: ['seafood mousse', 'herbs', 'vegetables'],
                    sauce: 'light cream or wine based'
                }
            }
        },
        regionalPreparations: {},
        saucePAirings: {
            'classic': {
                name: 'Classic',
                'beurre_blanc': {
                    name: 'Beurre Blanc',
                    base: 'wine reduction',
                    finish: 'cold butter mounting',
                    variations: ['classic', 'herb', 'citrus']
                }
            },
            'contemporary': {
                name: 'Contemporary',
                'citrus_herb': {
                    name: 'Citrus Herb',
                    base: 'light butter sauce',
                    citrus: ['orange', 'lemon'],
                    herbs: ['chervil', 'tarragon']
                }
            }
        },
        seasonalAdjustments: {
            'summer': {
                name: 'Summer',
                preparations: ['poached', 'grilled'],
                sauces: ['light herb', 'citrus'],
                accompaniments: ['fresh peas', 'asparagus']
            },
            'winter': {
                name: 'Winter',
                preparations: ['pan-fried', 'baked'],
                sauces: ['richer cream', 'mushroom'],
                accompaniments: ['winter vegetables', 'potato puree']
            }
        },
        safetyThresholds: {
            cooking: {
                temperature: {},
                visual: 'opaque, flakes easily',
                notes: 'very quick cooking due to thin fillets'
            }
        }
    },
    'flounder_whole': {
        name: 'Flounder Whole',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({
            Water: 0.5,
            Air: 0.35,
            Earth: 0.1,
            Fire: 0.05
        }),
        astrologicalProfile: {
            rulingPlanets: ['Moon', 'Neptune'],
            favorableZodiac: ['cancer', 'scorpio', 'pisces'],
            elementalAffinity: {
                base: 'Water',
                decanModifiers: {
                    first: {
                        element: 'Water',
                        planet: 'Moon'
                    },
                    second: {
                        element: 'Air',
                        planet: 'Mercury'
                    },
                    third: { element: 'Air', planet: 'Mercury' }
                }
            },
            lunarPhaseModifiers: {
                waxingCrescent: {
                    elementalBoost: {
                        Water: 0.1,
                        Air: 0.1
                    },
                    preparationTips: ['Best for grilling']
                },
                fullmoon: {
                    elementalBoost: {
                        Water: 0.15,
                        Air: 0.1
                    },
                    preparationTips: ['Ideal for poaching']
                }
            }
        },
        qualities: ['delicate', 'sweet', 'lean'],
        origin: ['North Atlantic', 'Pacific Coast'],
        category: 'seafood',
        subCategory: 'flatfish',
        varieties: {
            'Summer': {
                name: 'Summer',
                appearance: 'brown top, white bottom',
                season: 'peak in summer',
                notes: 'preferred eating'
            },
            'Winter': {
                name: 'Winter',
                appearance: 'darker coloring',
                season: 'peak in winter',
                notes: 'slightly firmer texture'
            }
        },
        culinaryApplications: {
            'chinese': {
                name: 'Chinese',
                'pan_fried': {
                    name: 'Pan Fried',
                    method: 'light dredge, pan-fried',
                    sauce: 'sweet-sour',
                    garnish: ['scallions', 'cilantro']
                }
            }
        },
        regionalPreparations: {},
        saucePAirings: {},
        seasonalAdjustments: {
            'summer': {
                name: 'Summer',
                preparations: ['steamed', 'grilled'],
                sauces: ['light soy', 'herb'],
                accompaniments: ['summer greens', 'light vegetables']
            },
            'winter': {
                name: 'Winter',
                preparations: ['pan-fried', 'baked'],
                sauces: ['brown butter', 'light cream'],
                accompaniments: ['braised greens', 'root vegetables']
            }
        },
        safetyThresholds: {
            cooking: {
                temperature: {},
                visual: 'opaque, flakes easily',
                notes: 'careful not to overcook'
            }
        }
    },
    'sea_bass_mediterranean': {
        name: 'Sea Bass Mediterranean',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({
            Water: 0.4,
            Air: 0.25,
            Earth: 0.25,
            Fire: 0.1
        }),
        astrologicalProfile: {
            rulingPlanets: ['Moon', 'Neptune'],
            favorableZodiac: ['cancer', 'scorpio', 'pisces'],
            elementalAffinity: {
                base: 'Water',
                decanModifiers: {
                    first: {
                        element: 'Water',
                        planet: 'Moon'
                    },
                    second: {
                        element: 'Earth',
                        planet: 'Saturn'
                    },
                    third: { element: 'Air', planet: 'Mercury' }
                }
            },
            lunarPhaseModifiers: {
                waxingCrescent: {
                    elementalBoost: {
                        Water: 0.1,
                        Earth: 0.1
                    },
                    preparationTips: ['Best for grilling']
                },
                fullmoon: {
                    elementalBoost: {
                        Water: 0.15,
                        Air: 0.05
                    },
                    preparationTips: ['Ideal for poaching']
                }
            }
        },
        qualities: ['delicate', 'mild', 'flaky'],
        origin: ['Mediterranean Sea', 'Atlantic Coast'],
        category: 'seafood',
        subCategory: 'fish',
        varieties: {
            'Farmed': {
                name: 'Farmed',
                appearance: 'lighter coloring',
                texture: 'medium-firm',
                flavor: 'mild',
                uses: 'all-purpose'
            }
        },
        cuts: {
            'whole': {
                name: 'Whole',
                description: 'entire fish, scaled and gutted',
                weight: '2-4 lbs',
                notes: 'ideal for roasting or grilling'
            },
            'fillet': {
                name: 'Fillet',
                description: 'boneless sides',
                weight: '6-8 oz per serving',
                notes: 'versatile cut'
            }
        },
        culinaryApplications: {
            'grilled_whole': {
                name: 'Grilled Whole',
                method: 'stuffed and grilled',
                temperature: 'medium-high',
                timing: {
                    'per_side': '6-8 minutes',
                    'total': '12-15 minutes',
                    'resting': '5 minutes'
                },
                techniques: {
                    'stuffing': {
                        name: 'Stuffing',
                        ingredients: ['herbs', 'citrus', 'garlic'],
                        method: 'stuff cavity lightly'
                    },
                    'scoring': {
                        name: 'Scoring',
                        method: 'diagonal cuts on sides',
                        depth: '1 / (4 || 1) inch',
                        purpose: 'even cooking'
                    }
                }
            },
            'pan_roasted': {
                name: 'Pan Roasted',
                method: 'skin-on fillet',
                temperature: {
                    fahrenheit: 375,
                    celsius: 190
                },
                timing: {
                    'skin_side': '4-5 minutes',
                    'flesh_side': '2-3 minutes',
                    'resting': '3-4 minutes'
                }
            }
        },
        seasonalAdjustments: {
            'summer': {
                name: 'Summer',
                methods: ['grill', 'pan-sear'],
                preparations: {}
            },
            'winter': {
                name: 'Winter',
                methods: ['roast', 'braise'],
                preparations: {}
            }
        },
        storage: {
            fresh: {
                temperature: {},
                duration: '1-2 days',
                method: 'on ice, uncovered'
            },
            frozen: {
                temperature: {},
                duration: '4-6 months',
                method: 'vacuum sealed'
            }
        },
        safetyThresholds: {
            cooked: {
                minimum: {},
                visual: 'opaque, flakes easily',
                resting: '3-5 minutes'
            }
        }
    },
    'octopus_mediterranean': {
        name: 'Octopus Mediterranean',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({
            Water: 0.35,
            Earth: 0.35,
            Fire: 0.2,
            Air: 0.1
        }),
        astrologicalProfile: {
            rulingPlanets: ['Moon', 'Neptune'],
            favorableZodiac: ['cancer', 'scorpio', 'pisces'],
            elementalAffinity: {
                base: 'Water',
                decanModifiers: {
                    first: {
                        element: 'Water',
                        planet: 'Moon'
                    },
                    second: {
                        element: 'Earth',
                        planet: 'Saturn'
                    },
                    third: { element: 'Air', planet: 'Mercury' }
                }
            },
            lunarPhaseModifiers: {
                waxingCrescent: {
                    elementalBoost: {
                        Water: 0.1,
                        Earth: 0.1
                    },
                    preparationTips: ['Best for grilling']
                },
                fullmoon: {
                    elementalBoost: {
                        Water: 0.1,
                        Fire: 0.1
                    },
                    preparationTips: ['Ideal for poaching']
                }
            }
        },
        qualities: ['tender', 'meaty', 'versatile'],
        origin: ['Mediterranean Sea', 'Pacific Ocean'],
        category: 'seafood',
        subCategory: 'cephalopod',
        varieties: {},
        preparation: {
            'tenderizing': {
                name: 'Tenderizing',
                methods: ['massage with salt', 'freeze / (thaw || 1)'],
                timing: '15-20 minutes massage',
                notes: 'breaks down muscle fibers'
            },
            'cleaning': {
                name: 'Cleaning',
                steps: [
                    'remove beak',
                    'clean head cavity',
                    'remove eyes'
                ],
                notes: 'careful with ink sac'
            }
        },
        culinaryApplications: {
            'traditional_braise': {
                name: 'Traditional Braise',
                method: 'slow cook in aromatic liquid',
                temperature: {
                    fahrenheit: 200,
                    celsius: 93
                },
                timing: {
                    'total': '45-60 minutes',
                    'testing': 'pierce with knife for tenderness'
                },
                aromatics: ['wine', 'herbs', 'garlic', 'olive oil']
            }
        },
        regionalPreparations: {
            'greek': {
                name: 'Greek',
                'htapodi_sharas': {
                    name: 'Htapodi Sharas',
                    method: 'grilled with olive oil',
                    service: 'with ladolemono sauce',
                    accompaniments: ['oregano', 'lemon']
                }
            }
        },
        storage: {
            fresh: {
                temperature: {},
                duration: '1-2 days',
                method: 'on ice, wrapped'
            },
            frozen: {
                temperature: {},
                duration: '6-8 months',
                method: 'vacuum sealed'
            }
        }
    },
    'scallops_sea': {
        name: 'Scallops Sea',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({
            Water: 0.6,
            Air: 0.25,
            Fire: 0.1,
            Earth: 0.05
        }),
        astrologicalProfile: {
            rulingPlanets: ['Moon', 'Neptune'],
            favorableZodiac: ['cancer', 'scorpio', 'pisces'],
            elementalAffinity: {
                base: 'Water',
                decanModifiers: {
                    first: {
                        element: 'Water',
                        planet: 'Moon'
                    },
                    second: {
                        element: 'Air',
                        planet: 'Mercury'
                    },
                    third: { element: 'Air', planet: 'Mercury' }
                }
            },
            lunarPhaseModifiers: {
                waxingCrescent: {
                    elementalBoost: {
                        Water: 0.1,
                        Air: 0.1
                    },
                    preparationTips: ['Best for grilling']
                },
                fullmoon: {
                    elementalBoost: {
                        Water: 0.2,
                        Air: 0.05
                    },
                    preparationTips: ['Ideal for steaming']
                }
            }
        },
        qualities: ['delicate', 'sweet', 'lean'],
        origin: ['North Atlantic', 'Pacific Coast'],
        category: 'seafood',
        subCategory: 'shellfish',
        varieties: {
            'Summer': {
                name: 'Summer',
                appearance: 'brown top, white bottom',
                season: 'peak in summer',
                notes: 'preferred eating'
            },
            'Winter': {
                name: 'Winter',
                appearance: 'darker coloring',
                season: 'peak in winter',
                notes: 'slightly firmer texture'
            }
        },
        culinaryApplications: {
            'chinese': {
                name: 'Chinese',
                'pan_fried': {
                    name: 'Pan Fried',
                    method: 'light dredge, pan-fried',
                    sauce: 'sweet-sour',
                    garnish: ['scallions', 'cilantro']
                }
            }
        },
        regionalPreparations: {},
        saucePAirings: {},
        seasonalAdjustments: {
            'summer': {
                name: 'Summer',
                preparations: ['steamed', 'grilled'],
                sauces: ['light soy', 'herb'],
                accompaniments: ['summer greens', 'light vegetables']
            },
            'winter': {
                name: 'Winter',
                preparations: ['pan-fried', 'baked'],
                sauces: ['brown butter', 'light cream'],
                accompaniments: ['braised greens', 'root vegetables']
            }
        },
        safetyThresholds: {
            cooking: {
                temperature: {},
                visual: 'opaque, flakes easily',
                notes: 'careful not to overcook'
            }
        }
    },
    'squid': {
        name: 'Squid',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({
            Water: 0.45,
            Earth: 0.25,
            Air: 0.2,
            Fire: 0.1
        }),
        astrologicalProfile: {
            rulingPlanets: ['Moon', 'Neptune'],
            favorableZodiac: ['cancer', 'scorpio', 'pisces'],
            elementalAffinity: {
                base: 'Water',
                decanModifiers: {
                    first: {
                        element: 'Water',
                        planet: 'Moon'
                    },
                    second: {
                        element: 'Earth',
                        planet: 'Saturn'
                    },
                    third: { element: 'Air', planet: 'Mercury' }
                }
            },
            lunarPhaseModifiers: {
                waxingCrescent: {
                    elementalBoost: {
                        Water: 0.1,
                        Earth: 0.1
                    },
                    preparationTips: ['Best for grilling']
                },
                fullmoon: {
                    elementalBoost: {
                        Water: 0.15,
                        Air: 0.05
                    },
                    preparationTips: ['Ideal for poaching']
                }
            }
        },
        qualities: ['tender', 'meaty', 'versatile'],
        origin: ['Mediterranean Sea', 'Pacific Ocean'],
        category: 'seafood',
        subCategory: 'cephalopod',
        varieties: {},
        preparation: {
            'tenderizing': {
                name: 'Tenderizing',
                methods: ['massage with salt', 'freeze / (thaw || 1)'],
                timing: '15-20 minutes massage',
                notes: 'breaks down muscle fibers'
            },
            'cleaning': {
                name: 'Cleaning',
                steps: [
                    'remove beak',
                    'clean head cavity',
                    'remove eyes'
                ],
                notes: 'careful with ink sac'
            }
        },
        culinaryApplications: {
            'traditional_braise': {
                name: 'Traditional Braise',
                method: 'slow cook in aromatic liquid',
                temperature: {
                    fahrenheit: 200,
                    celsius: 93
                },
                timing: {
                    'total': '45-60 minutes',
                    'testing': 'pierce with knife for tenderness'
                },
                aromatics: ['wine', 'herbs', 'garlic', 'olive oil']
            }
        },
        regionalPreparations: {
            'greek': {
                name: 'Greek',
                'htapodi_sharas': {
                    name: 'Htapodi Sharas',
                    method: 'grilled with olive oil',
                    service: 'with ladolemono sauce',
                    accompaniments: ['oregano', 'lemon']
                }
            }
        },
        storage: {
            fresh: {
                temperature: {},
                duration: '1-2 days',
                method: 'on ice, wrapped'
            },
            frozen: {
                temperature: {},
                duration: '6-8 months',
                method: 'vacuum sealed'
            }
        }
    },
    'shrimp': {
        name: 'Shrimp',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({
            Water: 0.6,
            Earth: 0.2,
            Fire: 0.1,
            Air: 0.1
        }),
        astrologicalProfile: {
            rulingPlanets: ['Moon', 'Neptune'],
            favorableZodiac: ['cancer', 'scorpio', 'pisces'],
            elementalAffinity: {
                base: 'Water',
                decanModifiers: {
                    first: {
                        element: 'Water',
                        planet: 'Moon'
                    },
                    second: {
                        element: 'Water',
                        planet: 'Neptune'
                    },
                    third: {
                        element: 'Air',
                        planet: 'Mercury'
                    }
                }
            },
            lunarPhaseModifiers: {
                waxingCrescent: {
                    elementalBoost: {
                        Water: 0.1,
                        Fire: 0.05
                    },
                    preparationTips: ['Best for grilling']
                },
                fullmoon: {
                    elementalBoost: {
                        Water: 0.2,
                        Earth: 0.1
                    },
                    preparationTips: ['Ideal for steaming']
                }
            }
        },
        qualities: ['sweet', 'firm', 'versatile'],
        origin: ['Gulf Coast', 'South Pacific', 'Indian Ocean'],
        category: 'protein',
        subCategory: 'shellfish',
        varieties: {
            'Tiger': {
                name: 'Tiger',
                appearance: 'grey with black stripes',
                size: '13/15 to U/10',
                flavor: 'robust, briny',
                notes: 'ideal for grilling'
            },
            'Spot Prawns': {
                name: 'Spot Prawns',
                appearance: 'reddish with white spots',
                size: 'U/10 to U/8',
                flavor: 'sweet, delicate',
                notes: 'premium Pacific variety'
            }
        },
        culinaryApplications: {
            'grill': {
                name: 'Grill',
                shell_on: {
                    method: 'direct high heat',
                    preparation: 'butterfly, devein',
                    marinade: {
                        'garlic_herb': ['olive oil', 'garlic', 'herbs'],
                        'spicy': ['chili', 'lime', 'cilantro'],
                        'asian': ['soy', 'ginger', 'sesame']
                    },
                    timing: '2-3 minutes per side',
                    indicators: 'pink and opaque'
                },
                peeled: {
                    method: 'skewered, high heat',
                    preparation: 'devein, tail on/off',
                    marinade: {
                        'lemon_garlic': ['lemon', 'garlic', 'parsley'],
                        'cajun': ['paprika', 'cayenne', 'herbs'],
                        'teriyaki': ['soy', 'mirin', 'ginger']
                    },
                    timing: '1-2 minutes per side'
                }
            },
            'poach': {
                name: 'Poach',
                court_bouillon: {
                    base: ['Water', 'wine', 'aromatics'],
                    timing: '2-3 minutes total',
                    technique: 'gentle simmer'
                },
                shell_on: {
                    method: 'slow poach',
                    timing: '3-4 minutes',
                    cooling: 'ice bath immediately'
                }
            },
            'stir_fry': {
                name: 'Stir Fry',
                preparation: 'peeled, deveined',
                technique: {
                    'velvet': {
                        name: 'Velvet',
                        marinade: ['egg white', 'cornstarch', 'rice wine'],
                        method: 'oil blanch then stir-fry',
                        timing: 'blanch 30 seconds, fry 1 minute'
                    }
                }
            }
        },
        saucePAirings: {
            'cold': {
                name: 'Cold',
                'cocktail': {
                    name: 'Cocktail',
                    base: 'tomato',
                    ingredients: ['horseradish', 'lemon', 'worcestershire'],
                    service: 'chilled, hanging presentation'
                },
                'remoulade': {
                    name: 'Remoulade',
                    base: 'mayonnaise',
                    ingredients: ['cajun spice', 'pickles', 'capers'],
                    service: 'chilled, side sauce'
                }
            },
            'hot': {
                name: 'Hot',
                'scampi': {
                    name: 'Scampi',
                    base: 'butter-wine',
                    ingredients: ['garlic', 'lemon', 'parsley'],
                    finish: 'mount with butter'
                },
                'curry': {
                    name: 'Curry',
                    base: 'coconut milk',
                    variations: {
                        'thai': ['red curry', 'kaffir lime', 'basil'],
                        'indian': ['garam masala', 'tomato', 'cream']
                    }
                },
                'xo': {
                    name: 'Xo',
                    base: 'dried seafood-chili',
                    preparation: 'sauce made ahead',
                    usage: 'small amount as condiment'
                }
            }
        },
        seasonalAdjustments: {
            'summer': {
                name: 'Summer',
                preparations: ['grilled', 'cold poached'],
                sauces: ['light herb', 'citrus'],
                accompaniments: ['summer vegetables', 'cold salads']
            },
            'winter': {
                name: 'Winter',
                preparations: ['stir-fried', 'curry'],
                sauces: ['rich coconut', 'spicy tomato'],
                accompaniments: ['hearty grains', 'roasted vegetables']
            }
        },
        safetyThresholds: {
            cooking: {
                temperature: {
                    fahrenheit: 145,
                    celsius: 63
                },
                indicators: ['opaque throughout', 'pink-red color'],
                timing: 'until just cooked through'
            }
        }
    }
};
// Fix the ingredient mappings to ensure they have all required properties
exports.seafood = (0, elementalUtils_1.fixIngredientMappings)(rawSeafood);
// Create a collection of all seafood for export
exports.allSeafood = Object.values(exports.seafood);
exports.default = exports.seafood;
