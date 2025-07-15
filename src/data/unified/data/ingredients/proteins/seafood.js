import { fixIngredientMappings } from "../../../utils/elementalUtils";
import { createElementalProperties } from "../../../utils/elemental/elementalUtils";

const rawSeafood = {
    'atlantic_salmon': {
        name: 'Salmon',
        category: 'protein',
        subCategory: 'seafood',
        elementalProperties: createElementalProperties({
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
        }
    },
    'shrimp': {
        name: 'Shrimp',
        elementalProperties: createElementalProperties({
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
export const seafood = fixIngredientMappings(rawSeafood);

// Create a collection of all seafood for export
export const allSeafood = Object.values(seafood);

export default seafood;
