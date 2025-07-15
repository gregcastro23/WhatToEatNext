import { fixIngredientMappings } from "../../../utils/elementalUtils.js";
import { createElementalProperties } from "../../../utils/elemental/elementalUtils.js";

// Define the raw oils data with partial IngredientMapping properties
const rawOils = {
    'olive_oil': {
        name: 'Olive Oil',
        category: 'oil',
        subCategory: 'cooking',
        elementalProperties: createElementalProperties({ Fire: 0.3, Water: 0.2, Earth: 0.3, Air: 0.2
        }),
        seasonality: ['spring', 'summer', 'fall', 'winter'],
        smokePoint: {
            celsius: 190,
            fahrenheit: 375
        },
        qualities: ['healthy', 'versatile', 'rich'],
        nutritionalProfile: {
            serving_size: "1 tbsp",
            calories: 119,
            fat_g: 13.5,
            saturated_fat_g: 1.9,
            monounsaturated_fat_g: 9.9,
            polyunsaturated_fat_g: 1.4,
            omega_3_g: 0.1,
            omega_6_g: 1.3,
            omega_9_g: 9.9,
            vitamins: ['e', 'k'],
            antioxidants: ['oleocanthal', 'oleuropein', 'hydroxytyrosol'],
            notes: 'Rich in monounsaturated fats and antioxidants'
        },
        preparation: {
            fresh: {
                duration: '2 years',
                storage: 'cool, dark place',
                tips: ['avoid direct sunlight', 'keep sealed']
            }
        },
        storage: {
            container: 'dark glass bottle',
            duration: '24 months',
            temperature: 'room temperature',
            notes: 'keep away from heat sources'
        },
        astrologicalProfile: {
            rulingPlanets: ['Venus', 'Sun'],
            favorableZodiac: ['taurus', 'leo'],
            elementalAffinity: {
                base: 'Fire',
                decanModifiers: {
                    first: { element: 'Fire', planet: 'Sun' },
                    second: { element: 'Fire', planet: 'Jupiter' },
                    third: { element: 'Air', planet: 'Mercury' }
                }
            },
            lunarPhaseModifiers: {
                firstQuarter: {
                    elementalBoost: createElementalProperties({ Fire: 0.1, Earth: 0.1 }),
                    preparationTips: ['Best for dressings']
                },
                fullmoon: {
                    elementalBoost: createElementalProperties({ Water: 0.2, Air: 0.1 }),
                    preparationTips: ['Ideal for finishing dishes']
                }
            }
        },
        culinaryApplications: {
            raw: {
                notes: ["Finishing oil for salads and cooked dishes"],
                techniques: ["Drizzle just before serving"],
                dishes: ["Bruschetta", "Caprese salad", "Bean soups"]
            },
            lowHeat: {
                notes: ["Gentle sautéing and light cooking"],
                techniques: ["Keep below smoke point for best flavor"],
                dishes: ["Soffritto", "Gentle vegetable sautés"]
            },
            mediumHeat: {
                notes: ["Extra virgin not recommended for high heat"],
                techniques: ["Pure or light olive oil better for medium-high heat"],
                dishes: ["Pan frying", "Some roasted vegetables"]
            },
            infusions: {
                notes: ["Excellent base for herb and flavor infusions"],
                techniques: ["Warm gently with aromatics", "Store infused oils refrigerated"],
                dishes: ["Rosemary oil", "Garlic oil", "Chili oil"]
            }
        }
    },
    'coconut_oil': {
        name: 'Coconut Oil',
        category: 'oil',
        subCategory: 'cooking',
        elementalProperties: createElementalProperties({ Fire: 0.2, Water: 0.4, Earth: 0.3, Air: 0.1
        }),
        seasonality: ['all'],
        smokePoint: {
            celsius: 177,
            fahrenheit: 350
        },
        qualities: ['versatile', 'nourishing', 'antimicrobial', 'stable', 'aromatic', 'purifying'],
        nutritionalProfile: {
            serving_size: "1 tbsp",
            calories: 120,
            fat_g: 14,
            saturated_fat_g: 12,
            monounsaturated_fat_g: 1,
            polyunsaturated_fat_g: 0.5,
            medium_chain_triglycerides_g: 8,
            lauric_acid_g: 6,
            vitamins: ['e', 'k'],
            antioxidants: ['polyphenols', 'tocopherols', 'tocotrienols'],
            notes: 'Contains medium-chain triglycerides (MCTs) which are metabolized differently than other fats, providing a quick source of energy'
        },
        preparation: {
            fresh: {
                duration: '18-24 months',
                storage: 'cool, dark place',
                tips: ['solid below 76°F (24°C), liquid above this temperature', 'no refrigeration necessary']
            }
        },
        storage: {
            container: 'glass jar',
            duration: '2 years',
            temperature: 'room temperature',
            notes: 'Highly resistant to rancidity due to high saturated fat content'
        },
        astrologicalProfile: {
            rulingPlanets: ['Moon', 'Venus'],
            favorableZodiac: ['cancer', 'taurus', 'pisces'],
            elementalAffinity: {
                base: 'Water',
                decanModifiers: {
                    first: {},
                    second: {},
                    third: { element: 'Water', planet: 'Neptune' }
                }
            },
            lunarPhaseModifiers: {
                fullmoon: {
                    elementalBoost: createElementalProperties({}),
                    preparationTips: ['Enhanced purification properties during full moon']
                },
                newmoon: {
                    elementalBoost: createElementalProperties({}),
                    preparationTips: ['Best time for protective and grounding rituals']
                }
            }
        },
        culinaryApplications: {
            baking: {
                notes: ["Adds a subtle coconut flavor to baked goods", "Good solid fat substitute for butter in vegan recipes"],
                techniques: ["Melt before using in recipes", "Substitute 1:1 for butter"],
                dishes: ["Cookies", "Cakes", "Pie crusts", "Vegan desserts"]
            },
            cooking: {
                notes: ["Stable at high heat", "Imparts mild coconut flavor to foods"],
                techniques: ["Sautéing", "Stir-frying", "Deep frying"],
                dishes: ["Curries", "Tropical dishes", "Sautéed vegetables", "Fried foods"]
            },
            raw: {
                notes: ["Solid at room temperature", "Versatile base for raw treats"],
                techniques: ["Blend into smoothies", "Use as base for raw desserts"],
                dishes: ["Smoothies", "Raw energy bars", "Homemade chocolates"]
            }
        },
        healthProperties: {
            benefits: [
                "Contains lauric acid with antimicrobial properties",
                "MCTs may help with weight management and provide quick energy",
                "May improve heart health by increasing HDL cholesterol",
                "Supports skin moisture and barrier function",
                "Nourishes hAir and scalp",
                "May improve oral health through oil pulling",
                "Contains antioxidants that fight free radicals",
                "May help improve brain function in Alzheimer's patients"
            ],
            cautions: [
                "High in calories and saturated fat, consume in moderation",
                "May raise LDL cholesterol in some individuals",
                "Allergic reactions possible in those with tree nut allergies"
            ]
        },
        cosmeticApplications: {
            skin: {
                uses: [
                    "Natural moisturizer for dry skin",
                    "Makeup remover",
                    "Massage oil",
                    "Cuticle softener"
                ],
                properties: ["Moisturizing", "Emollient", "Protective"]
            },
            hAir: {
                uses: [
                    "Pre-wash hAir treatment for damaged hAir",
                    "Leave-in conditioner for ends",
                    "Scalp treatment for dandruff",
                    "Styling product for definition and shine"
                ],
                properties: ["Conditioning", "Strengthening", "Reduces protein loss"]
            },
            dental: {
                uses: [
                    "Oil pulling for oral hygiene",
                    "Natural toothpaste ingredient"
                ],
                properties: ["Antimicrobial", "Reduces plaque", "Freshens breath"]
            }
        },
        magicalProperties: {
            correspondences: ["purification", "protection", "peace", "healing", "love", "Moon magic", "psychic abilities"],
            uses: [
                "Purification rituals and cleansing",
                "Moon rituals especially during full moon",
                "Self-love and beauty spells",
                "Protection work for home and body",
                "Healing ceremonies and massage",
                "Prosperity and abundance workings",
                "Enhancing psychic abilities and dreams"
            ],
            substitutions: ["olive oil", "moonwater"]
        }
    },
    'palm_oil': {
        name: 'Palm Oil',
        category: 'oil',
        subCategory: 'cooking',
        elementalProperties: createElementalProperties({ Fire: 0.3, Water: 0.2, Earth: 0.4, Air: 0.1
        }),
        seasonality: ['all'],
        smokePoint: {
            celsius: 232,
            fahrenheit: 450
        },
        qualities: ['versatile', 'stable', 'semi-solid', 'balanced', 'nourishing'],
        nutritionalProfile: {
            serving_size: "1 tbsp",
            calories: 120,
            fat_g: 14,
            saturated_fat_g: 7,
            monounsaturated_fat_g: 5,
            polyunsaturated_fat_g: 1,
            vitamin_e_mg: 2.1
        },
        culinaryApplications: {
            frying: {
                notes: ["Excellent for deep frying due to high smoke point", "Maintains stability under high heat"],
                techniques: ["Deep frying", "Pan frying"]
            },
            baking: {
                notes: ["Great for creating flaky pastry", "Adds richness to baked goods"],
                techniques: ["Pastry making", "Bread", "Cakes"]
            },
            spreads: {
                notes: ["Used in margarine production", "Natural substitute for hydrogenated oils"],
                techniques: ["Spreadable fats"]
            }
        },
        healthBenefits: {
            heart: "Contains equal amounts of saturated and unsaturated fats with beneficial fatty acid composition at the sn-2 position",
            immunity: "Rich in tocotrienols and carotenoids that have antioxidant properties",
            digestion: "Easily absorbed when used in cooking",
            energy: "Provides sustained energy due to balanced fatty acid profile"
        },
        magicalProperties: {
            correspondences: ["Sun", "Jupiter", "Venus"],
            intentions: ["Abundance", "Protection", "Strength", "Purification", "Healing"],
            deities: ["Solar deities", "Prosperity deities"],
            rituals: ["Prosperity workings", "Money spells", "Protection rituals"]
        },
        astrologicalCorrespondence: {
            planets: ["Sun", "Jupiter"],
            elements: ['Fire', 'Earth'],
            signs: ["leo", "taurus"]
        },
        history: "Native to West Africa but now widely cultivated in Southeast Asia, particularly Malaysia and Indonesia. Has been used for cooking and medicinal purposes for thousands of years.",
        description: "Semi-solid at room temperature, red palm oil has a natural deep orange-red color from carotenoids, while refined palm oil is pale yellow. Contains balanced amounts of saturated and unsaturated fatty acids, with palmitic acid and oleic acid being predominant.",
        cautions: "Sustainable sourcing is important. Look for RSPO-certified (Roundtable on Sustainable Palm Oil) sources to ensure environmental and social responsibility.",
        psychoactiveProperties: null,
        medicalProperties: {
            inflammation: "Tocotrienols have anti-inflammatory properties",
            antioxidant: "Rich in vitamin E and carotenoids that protect cells from oxidative damage",
            heart: "Studies show neutral to beneficial effects on blood lipid profiles when used in balanced diets"
        },
        pharmaceuticalProperties: null,
        substitutes: ["Coconut oil", "Butter", "Vegetable shortening"],
        storage: {
            container: "Airtight container",
            duration: "12 months",
            temperature: "room temperature",
            notes: "Keep away from direct sunlight"
        }
    },
    'sesame_oil': {
        name: 'Sesame Oil',
        category: 'oil',
        subCategory: 'finishing',
        elementalProperties: createElementalProperties({ Fire: 0.3, Water: 0.2, Earth: 0.2, Air: 0.3
        }),
        seasonality: ['fall', 'winter'],
        smokePoint: {
            celsius: 210,
            fahrenheit: 410
        },
        qualities: ['nutty', 'aromatic', 'warming'],
        nutritionalProfile: {
            serving_size: "1 tbsp",
            calories: 120,
            fat_g: 13.6,
            saturated_fat_g: 1.9,
            monounsaturated_fat_g: 5.4,
            polyunsaturated_fat_g: 5.6,
            omega_3_g: 0.4,
            omega_6_g: 5.2,
            omega_9_g: 5.4,
            vitamins: ['e', 'k', 'b6'],
            minerals: ['calcium', 'iron', 'zinc'],
            antioxidants: ['sesamol', 'sesamin', 'sesamolin'],
            notes: 'Distinctive nutty flavor, common in Asian cuisine'
        },
        preparation: {
            fresh: {
                duration: '1 month',
                storage: 'refrigerated after opening',
                tips: ['use sparingly', 'toast for enhanced flavor']
            }
        },
        storage: {
            container: 'dark glass bottle',
            duration: '12 months',
            temperature: 'cool, dark place',
            notes: 'Refrigerate after opening'
        },
        astrologicalProfile: {
            rulingPlanets: ['Mercury', 'Moon'],
            favorableZodiac: ['gemini', 'cancer'],
            elementalAffinity: {
                base: 'Fire',
                decanModifiers: {
                    first: {},
                    second: {},
                    third: { element: 'Air', planet: 'Venus' }
                }
            },
            lunarPhaseModifiers: {
                waxingCrescent: {
                    elementalBoost: createElementalProperties({}),
                    preparationTips: ['Best for stir-frying']
                },
                fullmoon: {
                    elementalBoost: createElementalProperties({}),
                    preparationTips: ['Ideal for finishing dishes']
                }
            }
        },
        culinaryApplications: {
            finishing: {
                notes: ["Add at end of cooking for flavor", "A little goes a long way"],
                techniques: ["Drizzle sparingly", "Add after heat is turned off"],
                dishes: ["Stir-fries", "Noodle dishes", "Asian dumplings"]
            },
            dressings: {
                notes: ["Potent flavor addition to dressings"],
                techniques: ["Combine with rice vinegar for balance", "Mix with milder oils"],
                dishes: ["Asian slaws", "Cold noodle salads", "Sesame dressings"]
            },
            marinades: {
                notes: ["Excellent flavor enhancer for marinades"],
                techniques: ["Combine with soy sauce and aromatics"],
                dishes: ["Korean BBQ", "Asian-style grilled meats", "Vegetable marinades"]
            }
        }
    },
    'avocado_oil': {
        name: 'Avocado Oil',
        category: 'oil',
        subCategory: 'cooking',
        elementalProperties: createElementalProperties({ Fire: 0.2, Water: 0.3, Earth: 0.4, Air: 0.1
        }),
        seasonality: ['spring', 'summer', 'fall', 'winter'],
        smokePoint: {
            celsius: 270,
            fahrenheit: 520
        },
        qualities: ['buttery', 'nutty', 'grassy', 'versatile', 'smooth', 'rich'],
        nutritionalProfile: {
            serving_size: "1 tbsp",
            calories: 124,
            fat_g: 14,
            saturated_fat_g: 1.6,
            monounsaturated_fat_g: 9.9,
            polyunsaturated_fat_g: 1.9,
            omega_3_g: 0.1,
            omega_6_g: 1.8,
            omega_9_g: 9.8,
            vitamins: ['e', 'k', 'd', 'a'],
            minerals: ['potassium', 'magnesium', 'phosphorus'],
            antioxidants: ['lutein', 'zeaxanthin', 'beta-sitosterol', 'carotenoids'],
            notes: 'One of the highest monounsaturated fat content of any oil, with exceptional heat stability'
        },
        preparation: {
            fresh: {
                duration: '12-18 months',
                storage: 'cool, dark place',
                tips: ['store away from heat and light', 'refrigerate after opening for longer shelf life']
            }
        },
        storage: {
            container: 'dark glass bottle',
            duration: '18 months',
            temperature: 'room temperature or refrigerated',
            notes: 'Highly resistant to oxidation compared to other oils'
        },
        astrologicalProfile: {
            rulingPlanets: ['Venus', 'Jupiter', 'Moon'],
            favorableZodiac: ['taurus', 'libra', 'cancer'],
            elementalAffinity: {
                base: 'Earth',
                decanModifiers: {
                    first: { element: 'Earth', planet: 'Venus' },
                    second: { element: 'Water', planet: 'Moon' },
                    third: { element: 'Fire', planet: 'Jupiter' }
                }
            },
            lunarPhaseModifiers: {
                fullmoon: {
                    elementalBoost: createElementalProperties({ Water: 0.2, Earth: 0.1 }),
                    preparationTips: ['Enhanced beauty and prosperity properties during full moon']
                },
                waxingCrescent: {
                    elementalBoost: createElementalProperties({ Earth: 0.2, Water: 0.1 }),
                    preparationTips: ['Best time for healing skin treatments']
                }
            }
        },
        culinaryApplications: {
            raw: {
                notes: ["Rich buttery flavor makes it excellent for finishing dishes", "Use as a healthy alternative to butter"],
                techniques: ["Drizzle over finished dishes", "Use in salad dressings", "Dipping oil for bread"],
                dishes: ["Salads", "Dips", "Avocado mayonnaise", "Cold soups"]
            },
            cooking: {
                notes: ["Very high smoke point makes it ideal for high-heat cooking", "Neutral flavor with mild avocado notes"],
                techniques: ["Deep frying", "Stir-frying", "Sautéing", "Roasting", "Grilling"],
                dishes: ["Stir-fries", "Pan-seared proteins", "Roasted vegetables", "Fried foods"]
            },
            baking: {
                notes: ["Excellent butter substitute in baking", "Adds moisture to baked goods"],
                techniques: ["Substitute 1:1 for butter or other oils in recipes"],
                dishes: ["Cakes", "Brownies", "Muffins", "Quick breads"]
            }
        },
        healthProperties: {
            benefits: [
                "High in heart-healthy monounsaturated fatty acids",
                "Enhances absorption of fat-soluble nutrients",
                "Supports healthy cholesterol levels",
                "Promotes skin health and reduces inflammation",
                "Contains lutein for eye health",
                "Rich in antioxidants that fight free radicals",
                "May help improve insulin sensitivity"
            ],
            cautions: [
                "High in calories like all oils, should be consumed in moderation",
                "May cause allergic reactions in people with latex allergies (cross-reactivity)",
                "Choose cold-pressed, unrefined versions for maximum health benefits"
            ]
        },
        magicalProperties: {
            correspondences: ["beauty", "love", "abundance", "fertility", "healing", "luxury", "protection"],
            uses: [
                "Anointing oil for beauty and self-love rituals",
                "Prosperity work and money-drawing spells",
                "Healing rituals for skin conditions",
                "Fertility magic and conception support",
                "Protective barriers against negative energies",
                "Enhancing Venus-ruled magical workings"
            ],
            substitutions: ["olive oil", "coconut oil"]
        }
    },
    'walnut_oil': {
        name: 'Walnut Oil',
        category: 'oil',
        subCategory: 'finishing',
        elementalProperties: createElementalProperties({ Fire: 0.2, Water: 0.1, Earth: 0.3, Air: 0.4
        }),
        seasonality: ['fall', 'winter'],
        smokePoint: {
            celsius: 160,
            fahrenheit: 320
        },
        qualities: ['rich', 'nutty', 'distinctive'],
        storage: {
            container: 'dark glass bottle',
            duration: '6 months',
            temperature: 'refrigerated',
            notes: 'Goes rancid quickly if not refrigerated'
        },
        culinaryApplications: {
            finishing: {
                notes: ["Best used as finishing oil, not for cooking"],
                techniques: ["Add after cooking is complete"],
                dishes: ["Salads", "Roasted vegetables", "Pastas"]
            }
        },
        healthProperties: {
            benefits: [
                "High in omega-3 fatty acids",
                "Contains antioxidants",
                "May support heart health"
            ]
        }
    }
};

// Fix the ingredient mappings to ensure they have all required properties
const processedOils = fixIngredientMappings(rawOils);

// Export individual oils for direct access
export const oliveOil = processedOils.olive_oil;
export const coconutOil = processedOils.coconut_oil;
export const avocadoOil = processedOils.avocado_oil;
export const sesameOil = processedOils.sesame_oil;
export const palmOil = processedOils.palm_oil;
export const walnutOil = processedOils.walnut_oil;

// Export the full collection
export const allOils = processedOils;

// Default export
export default processedOils;
