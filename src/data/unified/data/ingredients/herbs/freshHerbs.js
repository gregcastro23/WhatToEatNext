"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.freshHerbs = void 0;
const elementalUtils_1 = require("../../../utils/elementalUtils");
const elementalUtils_2 = require("../../../utils/elemental/elementalUtils");
const rawFreshHerbs = {
    'basil': {
        name: 'Basil',
        category: 'culinary_herb',
        subCategory: 'fresh_herb',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
        }),
        qualities: ['aromatic', 'sweet', 'peppery', 'fresh', 'vibrant', 'delicate'],
        origin: ['India', 'Southeast Asia', 'Mediterranean'],
        // Nutritional information (standardized)
        nutritionalProfile: {
            serving_size: "2 tablespoons, chopped (5g)",
            calories: 1,
            macros: {
                protein: 0.2,
                carbs: 0.1,
                fat: 0.0,
                fiber: 0.1
            },
            vitamins: {
                K: 0.13,
                A: 0.03,
                C: 0.02,
                folate: 0.01,
                B6: 0.01
            },
            minerals: {
                manganese: 0.03,
                calcium: 0.01,
                iron: 0.01,
                magnesium: 0.01,
                potassium: 0.01
            },
            antioxidants: {
                phenolics: 'high',
                flavonoids: 'high',
                carotenoids: 'moderate'
            },
            source: "USDA FoodData Central"
        },
        // Sensory profile (standardized)
        sensoryProfile: {
            taste: {
                sweet: 0.5,
                salty: 0.0,
                sour: 0.1,
                bitter: 0.2,
                umami: 0.0,
                spicy: 0.2
            },
            aroma: {
                floral: 0.6,
                fruity: 0.3,
                herbal: 0.9,
                spicy: 0.3,
                earthy: 0.1,
                woody: 0.0
            },
            texture: {
                crisp: 0.3,
                tender: 0.8,
                creamy: 0.0,
                chewy: 0.0,
                crunchy: 0.0,
                silky: 0.1
            }
        },
        // Storage information (standardized)
        storage: {
            temperature: "room temperature or refrigerated",
            duration: "4-7 days fresh, 6-12 months dried",
            container: "stem in water like flowers, loosely cover with plastic",
            tips: [
                "Do not refrigerate if possible - causes blackening",
                "Change water daily if storing in water",
                "Wrap in slightly damp paper towel if refrigerating",
                "Freeze whole leaves in olive oil in ice cube trays"
            ]
        },
        // Preparation (standardized)
        preparation: {
            washing: true,
            methods: ["fresh", "torn", "chiffonade", "pureed", "infused", "dried", "frozen"],
            processing: {
                washing: "gentle rinse, pat dry with paper towels",
                drying: "Air-dry or use lowest setting on dehydrator",
                chopping: "tear by hand or cut with sharp knife just before using",
                preserving: "freeze in oil, infuse in vinegar or oil, dry"
            },
            notes: "Turns black when cut with dull knife or exposed to acid for too long; add at end of cooking to preserve flavor"
        },
        // Culinary applications (standardized)
        culinaryApplications: {
            commonUses: ["pesto", "tomato dishes", "salads", "infused oils", "cocktails", "desserts", "sauces"],
            pAiringRecommendations: {
                complementary: ["tomato", "garlic", "olive oil", "pine nuts", "lemon", "mozzarella", "pasta", "eggplant"],
                contrasting: ["strawberry", "peach", "watermelon", "balsamic vinegar", "chocolate"],
                toAvoid: ["strong spices", "prolonged cooking", "bitter greens"]
            },
            seasonalPeak: ["summer"],
            techniques: {
                "pesto": {
                    method: "food processor or mortar and pestle",
                    ingredients: ["olive oil", "pine nuts", "parmesan", "garlic", "salt"],
                    notes: "Use only the leaves, adjust garlic to taste"
                },
                "caprese": {
                    method: "layered or arranged",
                    ingredients: ["tomato", "mozzarella", "olive oil", "balsamic"],
                    notes: "Use whole small leaves, add just before serving"
                }
            }
        },
        // Health benefits (standardized)
        healthBenefits: [
            'Anti-inflammatory properties',
            'Rich in antioxidants',
            'May help lower blood sugar',
            'Supports digestive health',
            'Contains antimicrobial compounds',
            'May help reduce stress',
            'Supports cardiovascular health'
        ],
        // Varieties (standardized)
        varieties: {
            'sweet_basil': {
                name: 'Sweet Basil (Genovese)',
                appearance: 'bright green, rounded leaves',
                aroma: 'sweet, slightly clove-like',
                flavor: 'sweet with slight peppery notes',
                uses: 'Italian cuisine, pesto, tomato dishes',
                oil_content: 0.7 // percentage
            },
            'thai_basil': {
                name: 'Thai Basil',
                appearance: 'narrower leaves, purple stems',
                aroma: 'anise-like, spicy',
                flavor: 'more stable under high heat than sweet basil',
                uses: 'Southeast Asian cuisine, stir-fries, curries',
                oil_content: 0.6
            },
            'holy_basil': {
                name: 'Holy Basil (Tulsi)',
                appearance: 'fuzzy leaves, often purplish',
                aroma: 'spicy, complex',
                flavor: 'peppery, clove-like',
                uses: 'Indian cuisine, medicinal tea, stir-fries',
                oil_content: 0.8
            },
            'lemon_basil': {
                name: 'Lemon Basil',
                appearance: 'light green, narrow leaves',
                aroma: 'strong citrus scent',
                flavor: 'lemony, lighter than sweet basil',
                uses: 'Southeast Asian cuisine, seafood, desserts'
            }
        },
        // Category-specific extension: herbs
        potency: 7,
        aroma: {
            intensity: 8,
            volatility: 9,
            mainCompounds: ["linalool", "eugenol", "citral", "limonene", "methyl chavicol"]
        },
        drying: {
            methods: ["Air-drying", "dehydrator", "microwave", "oven"],
            flavorRetention: 0.4,
            bestPractices: [
                "Harvest before flowering for best flavor",
                "Dry quickly in well-ventilated area",
                "Store in Airtight container away from light"
            ]
        },
        timing: {
            addEarly: false,
            addLate: true,
            notes: "Add in last few minutes of cooking or after removing from heat"
        },
        substitutions: ["oregano", "thyme", "tarragon", "mint"],
        // Herb-specific properties
        essentialOilContent: 0.5,
        aromaticCompounds: [
            {
                name: "Linalool",
                percentage: 40,
                aroma: "floral, fresh",
                properties: ["calming", "anti-inflammatory"]
            },
            {
                name: "Eugenol",
                percentage: 15,
                aroma: "clove-like, spicy",
                properties: ["antiseptic", "analgesic"]
            },
            {
                name: "Estragole (Methyl chavicol)",
                percentage: 30,
                aroma: "anise-like",
                properties: ["stimulant", "digestive aid"]
            }
        ],
        // Herb usage by cuisine type
        culinaryTraditions: {
            "vietnamese": {
                name: 'rau quế',
                usage: ['pho', 'spring rolls', 'bánh mì'],
                preparation: 'fresh, served raw',
                regional_importance: 7
            }
        },
        // Seasonal adjustments for herb growing
        seasonality: {
            planting: "after last frost",
            harvesting: "throughout summer until first frost",
            peak_flavor: "mid-summer",
            growth_conditions: {
                soil: "well-draining, pH 6-7",
                Sun: "full sun",
                Water: "moderate, consistent moisture",
                spacing: "8-12 inches apart"
            }
        },
        // Astrology / (elemental || 1) connections (standardized)
        astrologicalProfile: {
            rulingPlanets: ['Mercury', 'Venus'],
            favorableZodiac: ['gemini', 'libra', 'virgo'],
            elementalAffinity: {
                base: 'Air',
                secondary: 'Fire',
                decanModifiers: {
                    first: {},
                    second: {},
                    third: { element: 'Water', planet: 'Jupiter' }
                }
            },
            lunarPhaseModifiers: {
                newmoon: {
                    elementalBoost: {},
                    preparationTips: ['Harvest in morning', 'Gentle processing']
                },
                fullmoon: {
                    elementalBoost: {},
                    preparationTips: ['Enhanced aroma when harvested', 'Good for infusions']
                }
            },
            aspectEnhancers: ['Mercury trine venus', 'Jupiter in libraLibra']
        }
    },
    // More herbs would be added here...
};
exports.freshHerbs = (0, elementalUtils_1.fixIngredientMappings)(rawFreshHerbs);
exports.default = exports.freshHerbs;
