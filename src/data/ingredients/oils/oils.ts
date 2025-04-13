import type { IngredientMapping } from '@/types/alchemy';
import type { Season } from '@/types/seasons';
import { fixIngredientMappings } from '@/utils/elementalUtils';

const rawOils: Record<string, Partial<IngredientMapping>> = {
    'olive_oil': {
        name: 'Olive Oil',
        category: 'oil',
        subCategory: 'cooking',
        elementalProperties: { Fire: 0.3, Earth: 0.3, Air: 0.2, Water: 0.2 },
        seasonality: ['spring', 'summer', 'fall', 'winter'],
        smokePoint: { celsius: 207, fahrenheit: 405 },
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
                    second: { element: 'Earth', planet: 'Venus' },
                    third: { element: 'Air', planet: 'Mercury' }
                }
            },
            lunarPhaseModifiers: {
                firstQuarter: {
                    elementalBoost: { Fire: 0.1, Earth: 0.1 },
                    preparationTips: ['Best for dressings']
                },
                fullMoon: {
                    elementalBoost: { Fire: 0.2 },
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
        elementalProperties: {
            Fire: 0.2,
            Water: 0.3,
            Earth: 0.3,
            Air: 0.2
        },
        seasonality: ['all'],
        smokePoint: {
            celsius: 177,
            fahrenheit: 350
        },
        qualities: ['sweet', 'tropical', 'solid'],
        nutritionalProfile: {
            serving_size: "1 tbsp",
            calories: 121,
            fat_g: 13.5,
            saturated_fat_g: 11.2,
            monounsaturated_fat_g: 0.8,
            polyunsaturated_fat_g: 0.2,
            omega_3_g: 0,
            omega_6_g: 0.2,
            omega_9_g: 0.8,
            vitamins: [],
            notes: 'High in medium-chain triglycerides (MCTs)'
        },
        preparation: {
            fresh: {
                duration: '6 months',
                storage: 'room temperature',
                tips: ['melts at 24°C/76°F', 'good for medium-heat cooking']
            }
        },
        storage: {
            container: 'glass jar',
            duration: '24 months',
            temperature: 'room temperature',
            notes: 'Solidifies below room temperature'
        },
        astrologicalProfile: {
            rulingPlanets: ['Venus', 'Neptune'],
            favorableZodiac: ['pisces', 'taurus'],
            elementalAffinity: {
                base: 'Water',
                decanModifiers: {
                    first: { element: 'Water', planet: 'Venus' },
                    second: { element: 'Water', planet: 'Neptune' },
                    third: { element: 'Earth', planet: 'Moon' }
                }
            }
        },
        culinaryApplications: {
            baking: { 
                notes: ["Solid at room temperature", "Good vegan butter substitute"],
                techniques: ["Measure when solid", "Melt for liquid applications"],
                dishes: ["Vegan pastries", "Tropical cookies", "Dairy-free brownies"]
            },
            mediumHeat: { 
                notes: ["Withstands moderate cooking temperatures"], 
                techniques: ["Use refined for less coconut flavor"],
                dishes: ["Stir-fries", "Curry dishes", "Sautéed vegetables"]
            },
            highHeat: { 
                notes: ["Good for moderate to high heat cooking"], 
                techniques: ["Use refined coconut oil for higher smoke point"],
                dishes: ["Thai curries", "Pan-fried food", "Some baked goods"]
            }
        }
    },
    'sesame_oil': {
        name: 'Sesame Oil',
        category: 'oil',
        subCategory: 'finishing',
        elementalProperties: { Fire: 0.4, Water: 0.2, Earth: 0.2, Air: 0.2 },
        seasonality: ['fall', 'winter'],
        smokePoint: { celsius: 210, fahrenheit: 410 },
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
                    first: { element: 'Fire', planet: 'Mercury' },
                    second: { element: 'Earth', planet: 'Moon' },
                    third: { element: 'Air', planet: 'Venus' }
                }
            },
            lunarPhaseModifiers: {
                waxingCrescent: {
                    elementalBoost: { Fire: 0.1, Air: 0.1 },
                    preparationTips: ['Best for stir-frying']
                },
                fullMoon: {
                    elementalBoost: { Fire: 0.2 },
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
        elementalProperties: { Fire: 0.3, Water: 0.3, Earth: 0.2, Air: 0.2 },
        seasonality: ['spring', 'summer', 'fall', 'winter'],
        smokePoint: { celsius: 271, fahrenheit: 520 },
        qualities: ['buttery', 'neutral', 'high-heat'],
        nutritionalProfile: {
            serving_size: "1 tbsp",
            calories: 124,
            fat_g: 14,
            saturated_fat_g: 1.6,
            monounsaturated_fat_g: 9.9,
            polyunsaturated_fat_g: 1.9,
            omega_3_g: 0.1,
            omega_6_g: 1.8,
            omega_9_g: 9.9,
            vitamins: ['e'],
            antioxidants: ['lutein'],
            notes: 'High smoke point and neutral flavor'
        },
        preparation: {
            fresh: {
                duration: '8-12 months',
                storage: 'cool, dark place',
                tips: ['refrigerate after opening for longer shelf life']
            }
        },
        storage: {
            container: 'dark glass bottle',
            duration: '12 months',
            temperature: 'room temperature',
            notes: 'Extended shelf life when refrigerated'
        },
        astrologicalProfile: {
            rulingPlanets: ['Venus', 'Jupiter'],
            favorableZodiac: ['taurus', 'libra', 'sagittarius'],
            elementalAffinity: {
                base: 'Earth',
                decanModifiers: {
                    first: { element: 'Earth', planet: 'Venus' },
                    second: { element: 'Fire', planet: 'Jupiter' },
                    third: { element: 'Water', planet: 'Mars' }
                }
            }
        },
        culinaryApplications: {
            highHeat: { 
                notes: ["Very high smoke point makes it ideal for high-heat cooking"],
                techniques: ["Use for searing and frying", "Great for grilling prep"],
                dishes: ["Pan-seared steaks", "Roasted vegetables", "Stir-fries"]
            },
            raw: { 
                notes: ["Mild flavor works well in dressings"], 
                techniques: ["Use as olive oil substitute for more neutral flavor"],
                dishes: ["Salad dressings", "Mayonnaise", "Dipping oil"]
            },
            beauty: { 
                notes: ["Used in culinary cosmetics"], 
                techniques: ["Can be applied directly to skin and hair"],
                dishes: ["Homemade face masks", "Hair treatments"]
            }
        }
    },
    'walnut_oil': {
        name: 'Walnut Oil',
        category: 'oil',
        subCategory: 'finishing',
        elementalProperties: { Fire: 0.3, Water: 0.2, Earth: 0.3, Air: 0.2 },
        seasonality: ['fall', 'winter'],
        smokePoint: { celsius: 160, fahrenheit: 320 },
        qualities: ['nutty', 'rich', 'delicate'],
        nutritionalProfile: {
            serving_size: "1 tbsp",
            calories: 120,
            fat_g: 13.6,
            saturated_fat_g: 1.2,
            monounsaturated_fat_g: 3.1,
            polyunsaturated_fat_g: 8.7,
            omega_3_g: 1.4,
            omega_6_g: 7.3,
            omega_9_g: 3.1,
            vitamins: ['e', 'k'],
            notes: 'High in omega-3 fatty acids'
        },
        preparation: {
            fresh: {
                duration: '3-6 months',
                storage: 'refrigerated',
                tips: ['Keep sealed', 'Use quickly once opened']
            }
        },
        storage: {
            container: 'dark glass bottle',
            duration: '6 months',
            temperature: 'refrigerated',
            notes: 'Goes rancid quickly if not refrigerated'
        },
        astrologicalProfile: {
            rulingPlanets: ['Mercury', 'Jupiter'],
            favorableZodiac: ['gemini', 'sagittarius', 'pisces'],
            elementalAffinity: {
                base: 'Earth',
                secondary: 'Air'
            }
        },
        culinaryApplications: {
            finishing: { 
                notes: ["Never heat - use as finishing oil only", "Delicate nutty flavor"],
                techniques: ["Drizzle at the very end of cooking or on finished dishes"],
                dishes: ["Salads with apples or pears", "Roasted vegetables", "Pasta dishes"]
            },
            dressings: { 
                notes: ["Creates rich, flavorful dressings"], 
                techniques: ["Pair with champagne or sherry vinegar", "Whisk with mustard"],
                dishes: ["Bitter green salads", "Endive salads", "French vinaigrettes"]
            },
            baking: { 
                notes: ["Adds nutty flavor to baked goods"], 
                techniques: ["Replace some butter or oil with walnut oil"],
                dishes: ["Walnut bread", "Cookies", "Some cakes"]
            }
        }
    },
    'macadamia_oil': {
        name: 'Macadamia Oil',
        category: 'oil',
        subCategory: 'specialty',
        elementalProperties: { Fire: 0.2, Water: 0.3, Earth: 0.3, Air: 0.2 },
        seasonality: ['spring', 'summer', 'fall', 'winter'],
        smokePoint: { celsius: 210, fahrenheit: 410 },
        qualities: ['buttery', 'mild', 'premium'],
        nutritionalProfile: {
            serving_size: "1 tbsp",
            calories: 120,
            fat_g: 14,
            saturated_fat_g: 2.1,
            monounsaturated_fat_g: 10.9,
            polyunsaturated_fat_g: 0.4
        },
        culinaryApplications: {
            finishing: { 
                notes: ["Delicate flavor works well as a finishing oil"],
                techniques: ["Drizzle over seafood", "Use in light dressings"],
                dishes: ["Grilled fish", "Light salads", "Smoothies"]
            }
        }
    },
    'pumpkin_seed_oil': {
        name: 'Pumpkin Seed Oil',
        category: 'oil',
        subCategory: 'specialty',
        elementalProperties: { Fire: 0.2, Water: 0.2, Earth: 0.5, Air: 0.1 },
        seasonality: ['fall', 'winter'],
        smokePoint: { celsius: 160, fahrenheit: 320 },
        qualities: ['nutty', 'rich', 'dark-green'],
        nutritionalProfile: {
            serving_size: "1 tbsp",
            calories: 120,
            fat_g: 13.5,
            saturated_fat_g: 2.5,
            monounsaturated_fat_g: 4.3,
            polyunsaturated_fat_g: 6.0
        },
        culinaryApplications: {
            finishing: { 
                notes: ["Strong flavor - use sparingly as a finishing oil"],
                techniques: ["Drizzle over soups", "Add to dips"],
                dishes: ["Pumpkin soup", "Austrian salads", "Vanilla ice cream"]
            }
        }
    },
    'walnut_oil': {
        name: 'Walnut Oil',
        category: 'oil',
        subCategory: 'specialty',
        elementalProperties: { Fire: 0.2, Water: 0.2, Earth: 0.4, Air: 0.2 },
        seasonality: ['fall', 'winter'],
        smokePoint: { celsius: 160, fahrenheit: 320 },
        qualities: ['nutty', 'rich', 'aromatic'],
        nutritionalProfile: {
            serving_size: "1 tbsp",
            calories: 120,
            fat_g: 13.6,
            saturated_fat_g: 1.2,
            monounsaturated_fat_g: 3.1,
            polyunsaturated_fat_g: 8.6
        },
        culinaryApplications: {
            dressings: { 
                notes: ["Excellent in salad dressings", "Pairs well with vinegars"],
                techniques: ["Combine with champagne vinegar", "Whisk with mustard"],
                dishes: ["Endive salads", "Roasted beet salad", "Fruit salads"]
            }
        }
    }
};

// Fix the ingredient mappings to ensure they have all required properties
export const oils: Record<string, IngredientMapping> = fixIngredientMappings(rawOils);

// For backward compatibility
export const allOils = oils;

// Export default for convenience
export default oils; 