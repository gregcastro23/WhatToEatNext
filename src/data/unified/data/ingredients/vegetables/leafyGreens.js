"use strict";
import { fixIngredientMappings } from "../../../utils/elementalUtils";
import { createElementalProperties } from "../../../utils/elemental/elementalUtils";
// Helper function for generating consistent numeric values
const generateVegetableAttributes = (vegData) => {
    return {
        water_content: vegData.Water,
        fiber_density: vegData.fiber,
        bitterness: vegData.bitterness,
        cooking_time_minutes: vegData.cooking_time,
        volume_reduction: Math.round(vegData.Water * 0.8) / 10,
        seasonal_peak_months: [],
        cell_wall_strength: Math.round((10 - vegData.Water / 10) + (vegData.fiber / 2)),
        nutrient_density: Math.round((vegData.fiber * 0.6) +
            ((100 - vegData.Water) * 0.05) +
            (Math.min(7, vegData.bitterness) * 0.3))
    };
};
const rawLeafyGreens = {
    'kale': {
        name: 'Kale',
        category: 'vegetable',
        subCategory: 'leafy_green',
        elementalProperties: createElementalProperties({
            Earth: 0.4,
            Water: 0.3,
            Air: 0.2,
            Fire: 0.1
        }),
        qualities: ['cleansing', 'strengthening', 'cooling', 'grounding', 'resilient', 'bitter', 'hardy'],
        origin: ['Mediterranean', 'Northern Europe'],
        season: ['fall', 'winter', 'early spring'],
        affinities: ['garlic', 'olive oil', 'lemon', 'pine nuts', 'chili', 'tahini', 'mushrooms', 'apple'],
        cookingMethods: ['raw', 'steamed', 'sautéed', 'baked', 'braised', 'fermented', 'juiced', 'soup'],
        ...generateVegetableAttributes({
            Water: 84,
            fiber: 9,
            bitterness: 7,
            cooking_time: 8
        }),
        seasonal_peak_months: [10, 11, 12, 1, 2],
        nutritionalProfile: {
            serving_size: "1 cup, raw (67g)",
            calories: 33,
            macros: {
                protein: 3,
                carbs: 6.7,
                fat: 0.5,
                fiber: 2.5
            },
            vitamins: {
                A: 0.206,
                C: 0.134,
                K: 0.684,
                B6: 0.14,
                E: 0.10,
                folate: 0.07,
                B2: 0.09
            },
            minerals: {
                calcium: 0.15,
                potassium: 0.08,
                magnesium: 0.09,
                manganese: 0.32,
                copper: 0.11,
                iron: 0.06
            },
            phytonutrients: {
                glucosinolates: 0.85,
                quercetin: 0.52,
                kaempferol: 0.47,
                lutein: 0.40,
                zeaxanthin: 0.38
            },
            source: "USDA FoodData Central"
        },
        sensoryProfile: {
            taste: {
                sweet: 0.1,
                salty: 0.1,
                sour: 0.2,
                bitter: 0.7,
                umami: 0.3,
                spicy: 0.0
            },
            aroma: {
                floral: 0.1,
                fruity: 0.0,
                herbal: 0.4,
                spicy: 0.1,
                earthy: 0.7,
                woody: 0.5
            },
            texture: {
                crisp: 0.7,
                tender: 0.2,
                creamy: 0.0,
                chewy: 0.6,
                crunchy: 0.5,
                silky: 0.0
            }
        },
        storage: {
            temperature: "refrigerated",
            duration: "5-7 days",
            container: "sealed container with paper towel",
            humidity: "high",
            tips: [
                "Do not wash until ready to use",
                "Keep stems in water for longer storage",
                "Freeze blanched kale for up to 8 months"
            ],
            frozen: {
                method: "blanch for 2 minutes, shock in ice water",
                duration: "8-10 months"
            }
        },
        preparation: {
            washing: true,
            methods: ["raw", "steamed", "sautéed", "baked", "blanched", "braised", "fermented", "juiced"],
            processing: {
                stemming: "remove tough stems for raw applications",
                massage: "massage with oil and salt to tenderize for raw use",
                chopping: "chop finely for smoother texture in soups and stews"
            },
            notes: "Becomes sweeter after frost exposure or light cooking"
        },
        culinaryApplications: {
            commonUses: ["salads", "smoothies", "sautés", "soups", "chips", "braises", "stews"],
            pAiringRecommendations: {
                complementary: ["garlic", "olive oil", "lemon", "pine nuts", "chili", "tahini", "apple", "onion"],
                contrasting: ["bacon", "sausage", "sweet potato", "cranberry", "white beans"],
                toAvoid: ["delicate herbs", "subtle fish"]
            },
            seasonalPeak: ["fall", "winter", "early spring"],
            techniques: {
                "salad": {
                    method: "raw, massaged with oil and salt",
                    ingredients: ["lemon juice", "olive oil", "salt", "garlic"],
                    notes: "Massage 2-3 minutes to break down fibers"
                },
                "chips": {
                    method: "baked or dehydrated",
                    temperature: { fahrenheit: 350, celsius: 175 },
                    timing: "10-15 minutes",
                    ingredients: ["olive oil", "salt", "nutritional yeast"],
                    notes: "Space evenly and watch carefully to prevent burning"
                },
                "sauté": {
                    method: "quick cook in hot oil",
                    timing: "5-7 minutes",
                    ingredients: ["garlic", "red pepper flakes", "olive oil"],
                    notes: "Add liquid to help wilt if needed"
                }
            }
        },
        healthBenefits: [
            'Anti-inflammatory properties',
            'Supports cardiovascular health',
            'Rich in cancer-fighting compounds',
            'Promotes eye health (lutein and zeaxanthin)',
            'Supports detoxification pathways',
            'Aids digestive health through fiber content',
            'Contains calcium for bone health',
            'Supports immune function'
        ],
        varieties: {
            'Curly': {
                name: 'Curly Kale',
                appearance: 'ruffled leaves, vibrant green',
                texture: 'sturdy, slightly tough',
                flavor: 'peppery, slightly bitter',
                uses: 'salads, chips, sautés',
                nutritionalDifferences: "Higher in fiber than other varieties"
            },
            'Lacinato': {
                name: 'Lacinato (Dinosaur) Kale',
                appearance: 'long, narrow, bumpy dark leaves',
                texture: 'more tender than curly',
                flavor: 'earthy, slightly sweeter',
                uses: 'raw applications, Italian cuisine',
                nutritionalDifferences: "Higher in antioxidants"
            },
            'Red Russian': {
                name: 'Red Russian Kale',
                appearance: 'flat, toothed edges, purple stems',
                texture: 'tender, delicate',
                flavor: 'mild, slightly sweet',
                uses: 'salads, quick cooking',
                nutritionalDifferences: "Higher in anthocyanins"
            },
            'Redbor': {
                name: 'Redbor Kale',
                appearance: 'deep purple-red, curly',
                texture: 'hearty, crisp',
                flavor: 'earthy, robust',
                uses: 'garnishes, sturdy cooking applications'
            }
        },
        seasonality: ["fall", "winter", "early spring"],
        harvestMaturity: {
            days: "50-65 days from seed",
            size: "8-10 inches tall",
            signs: ["deep color", "firm leaves", "fully developed leaves"]
        },
        cooking: {
            methodsRanked: {
                "sauté": 9,
                "steam": 8,
                "roast": 7,
                "blanch": 8,
                "raw": 6,
                "bake": 7,
                "soup": 9,
                "ferment": 6
            },
            cookingTimesByMethod: {
                "sauté": "5-7 minutes",
                "steam": "5 minutes",
                "roast": "10-15 minutes",
                "blanch": "2-3 minutes",
                "bake": "15-20 minutes"
            },
            doneness: [
                "Leaves become deeper green",
                "Texture softens but maintains some structure",
                "Stems are tender when pierced"
            ]
        },
        astrologicalProfile: {
            rulingPlanets: ['Mercury', 'Saturn'],
            favorableZodiac: ['virgo', 'capricorn'],
            elementalAffinity: {
                base: 'Air',
                secondary: 'Earth',
                decanModifiers: {
                    first: { element: 'Air', planet: 'Mercury' },
                    second: { element: 'Earth', planet: 'Saturn' },
                    third: { element: 'Water', planet: 'Moon' }
                }
            },
            lunarPhaseModifiers: {
                newmoon: {
                    elementalBoost: createElementalProperties({ Air: 0.2, Earth: 0.1 }),
                    preparationTips: ['Light preparations', 'Quick cooking methods']
                },
                fullmoon: {
                    elementalBoost: createElementalProperties({ Water: 0.2, Earth: 0.1 }),
                    preparationTips: ['Enhanced nutritional extraction', 'Good for preservation methods']
                }
            }
        },
        waterContent: 84,
        fiberContent: 9,
        bitternessLevel: 7,
        cookingTimeMinutes: 8,
        volumeReduction: 6.7,
        cellWallStrength: 9,
        nutrientDensity: 8.5,
        processingEffects: {
            cooking: {
                nutrientRetention: 0.7,
                volumeChange: 0.4,
                flavorChange: "reduced bitterness, enhanced sweetness"
            },
            freezing: {
                nutrientRetention: 0.9,
                textureChange: "softens cell structure",
                bestPrepMethod: "blanch before freezing"
            },
            drying: {
                nutrientRetention: 0.8,
                flavorConcentration: 1.8,
                rehydrationMethod: "soak in warm water for 20 minutes"
            }
        }
    },
    'spinach': {
        name: 'Spinach',
        category: 'vegetable',
        subCategory: 'leafy_green',
        elementalProperties: createElementalProperties({
            Water: 0.4,
            Earth: 0.3,
            Air: 0.2,
            Fire: 0.1
        }),
        qualities: ['nourishing', 'cleansing', 'cooling', 'mild', 'versatile', 'tender'],
        season: ['spring', 'fall'],
        cookingMethods: ['raw', 'steamed', 'sautéed', 'blanched', 'creamed', 'soup'],
        storage: {
            temperature: "refrigerated",
            duration: "3-5 days",
            container: "sealed bag with paper towel",
            humidity: "high"
        },
        astrologicalProfile: {
            rulingPlanets: ['Moon', 'Venus'],
            favorableZodiac: ['cancer', 'taurus', 'libra'],
            elementalAffinity: {
                base: 'Water',
                secondary: 'Earth',
                decanModifiers: {
                    first: { element: 'Water', planet: 'Moon' },
                    second: { element: 'Water', planet: 'Neptune' },
                    third: { element: 'Earth', planet: 'Venus' }
                }
            },
            lunarPhaseModifiers: {
                newmoon: {
                    elementalBoost: createElementalProperties({ Water: 0.2 }),
                    preparationTips: ['Best for fresh preparations']
                },
                fullmoon: {
                    elementalBoost: createElementalProperties({ Water: 0.3 }),
                    preparationTips: ['Enhanced nutrient extraction', 'Best for cooking']
                }
            }
        }
    },
    'swiss chard': {
        name: 'Swiss chard',
        elementalProperties: createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
        }),
        astrologicalProfile: {
            rulingPlanets: ['Venus', 'Saturn'],
            favorableZodiac: ['taurus', 'capricorn', 'libra'],
            elementalAffinity: {
                base: 'Water',
                decanModifiers: {
                    first: {},
                    second: {},
                    third: { element: 'Air', planet: 'Jupiter' }
                }
            },
            lunarPhaseModifiers: {
                fullmoon: {
                    elementalBoost: {},
                    preparationTips: ['Braising', 'Slow cooking']
                },
                quartermoon: {
                    elementalBoost: {},
                    preparationTips: ['Sautéing with aromatics', 'Cooking with grains']
                }
            },
            aspectEnhancers: ['Venus trine saturn', 'Jupiter in taurusTaurus']
        },
        qualities: ['cooling', 'cleansing'],
        season: ['summer', 'fall'],
        category: 'vegetable',
        subCategory: 'leafy green',
        affinities: ['garlic', 'beans', 'lemon', 'pine nuts'],
        cookingMethods: ['steamed', 'sautéed', 'braised'],
        ...generateVegetableAttributes({
            Water: 87,
            fiber: 7,
            bitterness: 5,
            cooking_time: 5
        }),
        seasonal_peak_months: [6, 7, 8, 9],
        stalk_to_leaf_ratio: 0.6,
        color_varieties: ['green', 'red', 'yellow', 'rainbow'],
        colorant_strength: 6.2,
        nutritionalProfile: {
            fiber: 'high',
            vitamins: ['k', 'a', 'c'],
            minerals: ['magnesium', 'potassium', 'iron'],
            calories: 19,
            protein_g: 1.8,
            fiber_g: 1.9,
            vitamin_density: 7.9
        },
        preparation: {
            washing: true,
            stemming: 'separate stems from leaves',
            notes: 'Cook stems longer than leaves'
        },
        storage: {
            temperature: 'refrigerated',
            duration: '3-5 days',
            notes: 'Wrap in damp paper towel',
            sensitivity: 7 // 1-10 scale of how quickly it spoils
        }
    }
};
// Process ingredient mappings to ensure they have all required properties
export const leafyGreens = fixIngredientMappings(rawLeafyGreens);
// Export individual leafy greens for direct access
export const kale = leafyGreens.kale;
export const spinach = leafyGreens.spinach;
// Default export
export default leafyGreens;
