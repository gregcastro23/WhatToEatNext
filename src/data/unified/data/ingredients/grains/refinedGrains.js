import { fixIngredientMappings } from '../../../utils/elementalUtils';
import { createElementalProperties } from '../../../utils/elemental/elementalUtils';

const rawRefinedGrains = {
    'white_rice': {
        name: 'White Rice',
        elementalProperties: createElementalProperties({ Fire: 0.1, Water: 0.3, Earth: 0.5, Air: 0.1 }),
        astrologicalProfile: {
            rulingPlanets: ['Moon', 'Venus'],
            favorableZodiac: ['cancer', 'taurus'],
            elementalAffinity: {
                base: 'Earth',
                decanModifiers: {
                    first: { element: 'Earth', planet: 'Venus' },
                    second: { element: 'Water', planet: 'Moon' },
                    third: { element: 'Air', planet: 'Mercury' }
                }
            },
            lunarPhaseModifiers: {
                newmoon: {
                    elementalBoost: createElementalProperties({ Earth: 0.2, Water: 0.1 }),
                    preparationTips: ['Simple preparations', 'Base for other dishes']
                },
                fullmoon: {
                    elementalBoost: createElementalProperties({ Earth: 0.3, Water: 0.2 }),
                    preparationTips: ['Perfect for celebration dishes', 'Enhanced fluffiness']
                }
            }
        },
        qualities: ['mild', 'versatile', 'absorbent', 'light', 'clean'],
        origin: ['Asia', 'Global cultivation'],
        season: ['all'],
        category: 'refined_grain',
        subCategory: 'rice',
        varieties: {
            'short_grain': {
                name: 'Short Grain White Rice',
                characteristics: 'sticky, plump, tender',
                appearance: 'stubby, nearly round grains',
                flavor: 'subtly sweet',
                cooking_ratio: '1:1.25 rice to water',
                cooking_time: '20 minutes',
                best_for: 'sushi, rice pudding, sticky preparations'
            },
            'long_grain': {
                name: 'Long Grain White Rice',
                characteristics: 'fluffy, separate grains, drier texture',
                appearance: 'slender, elongated grains',
                flavor: 'mild, neutral',
                cooking_ratio: '1:1.75 rice to water',
                cooking_time: '18-20 minutes',
                best_for: 'pilafs, fried rice, side dishes'
            },
            'basmati': {
                name: 'White Basmati Rice',
                characteristics: 'aromatic, slender, distinctive fragrance',
                appearance: 'long, slender grains that elongate when cooked',
                flavor: 'floral, nutty aroma',
                cooking_ratio: '1:1.5 rice to water',
                cooking_time: '15-18 minutes',
                best_for: 'Indian dishes, pilaf, biryani'
            },
            'jasmine': {
                name: 'White Jasmine Rice',
                characteristics: 'aromatic, slightly clinging, soft',
                appearance: 'medium to long grain',
                flavor: 'floral aroma, subtle sweetness',
                cooking_ratio: '1:1.5 rice to water',
                cooking_time: '15-18 minutes',
                best_for: 'Southeast Asian cuisine, coconut-based dishes'
            }
        },
        nutritionalProfile: {
            serving_size: "1/2 cup cooked (100g)",
            calories: 130,
            macros: {
                protein: 2.7,
                carbs: 28.2,
                fat: 0.3,
                fiber: 0.4
            },
            vitamins: {
                B1: 0.07,
                B3: 0.16,
                folate: 0.09
            },
            minerals: {
                manganese: 0.35,
                selenium: 0.11,
                phosphorus: 0.07,
                magnesium: 0.03,
                iron: 0.01
            },
            glycemic_index: 73,
            source: "USDA FoodData Central"
        },
        culinaryApplications: {
            'basic_method': {
                name: 'Basic Method',
                steps: [
                    'rinse until water runs clear',
                    'combine with water (variable by type)',
                    'bring to boil',
                    'reduce heat to low simmer',
                    'cover with tight-fitting lid',
                    'cook 15-20 minutes depending on variety',
                    'rest 5-10 minutes off heat',
                    'fluff with fork'
                ],
                tips: [
                    'avoid lifting lid while cooking',
                    'ensure tight-fitting lid',
                    'let rest before fluffing'
                ],
                variations: {
                    'absorption': 'traditional method as described above',
                    'pilaf': 'toast rice in fat before adding liquid',
                    'boiled': 'cook in excess water and drain'
                }
            },
            'fried_rice': {
                name: 'Fried Rice',
                method: 'stir-fry cooked, chilled rice',
                applications: ['leftover rice dishes', 'one-pot meals'],
                timing: 'best with day-old refrigerated rice',
                notes: 'High heat, continuous movement is key'
            }
        },
        storage: {
            temperature: {
                dry: {
                    fahrenheit: { min: 50, max: 70 },
                    celsius: { min: 10, max: 21 }
                },
                cooked: {
                    fahrenheit: { min: 35, max: 40 },
                    celsius: { min: 1, max: 4 }
                }
            },
            humidity: 'low',
            container: 'Airtight container, away from light',
            duration: {
                dry: 'up to 2 years in Airtight container',
                cooked: '4-6 days refrigerated'
            },
            notes: 'Keep dry to prevent pest infestation'
        }
    },
    'white_flour': {
        name: 'White Flour',
        elementalProperties: createElementalProperties({ Fire: 0.1, Water: 0.2, Earth: 0.6, Air: 0.1 }),
        astrologicalProfile: {
            rulingPlanets: ['Saturn', 'Moon'],
            favorableZodiac: ['capricorn', 'cancer'],
            elementalAffinity: {
                base: 'Earth',
                decanModifiers: {
                    first: { element: 'Earth', planet: 'Saturn' },
                    second: { element: 'Earth', planet: 'Venus' },
                    third: { element: 'Water', planet: 'Moon' }
                }
            },
            lunarPhaseModifiers: {
                waxingCrescent: {
                    elementalBoost: createElementalProperties({ Earth: 0.2, Water: 0.1 }),
                    preparationTips: ['Good for starting breads and fermentations']
                },
                fullmoon: {
                    elementalBoost: createElementalProperties({ Earth: 0.3, Air: 0.1 }),
                    preparationTips: ['Maximum rising potential for breads']
                }
            }
        },
        qualities: ['versatile', 'smooth', 'refined', 'binding', 'transformative'],
        origin: ['Global'],
        season: ['all'],
        category: 'refined_grain',
        subCategory: 'flour',
        varieties: {
            'all_purpose': {
                name: 'All-Purpose Flour',
                protein_content: '10-12%',
                characteristics: 'balanced protein content',
                best_for: 'general baking, versatile applications'
            },
            'bread_flour': {
                name: 'Bread Flour',
                protein_content: '12-14%',
                characteristics: 'high gluten development',
                best_for: 'yeast breads, pizza dough, chewy textures'
            },
            'cake_flour': {
                name: 'Cake Flour',
                protein_content: '7-9%',
                characteristics: 'fine texture, low protein',
                best_for: 'tender cakes, delicate pastries'
            },
            'pastry_flour': {
                name: 'Pastry Flour',
                protein_content: '8-10%',
                characteristics: 'medium-low protein',
                best_for: 'flaky pie crusts, biscuits, cookies'
            }
        },
        nutritionalProfile: {
            serving_size: "1/4 cup (30g)",
            calories: 100,
            macros: {
                protein: 3,
                carbs: 21,
                fat: 0.3,
                fiber: 0.8
            },
            vitamins: {
                B1: 0.11,
                B3: 0.15,
                B9: 0.12,
                folate: 0.25
            },
            minerals: {
                iron: 0.18,
                selenium: 0.37,
                phosphorus: 0.03,
                calcium: 0.02
            },
            glycemic_index: 85,
            source: "USDA FoodData Central"
        },
        culinaryApplications: {
            'baking': {
                name: 'Baking',
                methods: ['quick breads', 'yeast breads', 'pastries', 'cakes', 'cookies'],
                properties: {
                    'gluten_formation': 'provides structure',
                    'starch_gelatinization': 'contributes to texture',
                    'moisture_absorption': 'affects consistency'
                },
                techniques: {
                    'sifting': 'aerates and removes lumps',
                    'weighing': 'more accurate than volume measurement',
                    'gentle_mixing': 'prevents tough results in delicate baked goods'
                }
            },
            'thickening': {
                name: 'Thickening',
                methods: ['roux', 'slurry', 'beurre manié'],
                applications: ['sauces', 'gravies', 'soups', 'stews'],
                techniques: {
                    'roux': 'cook with fat before adding liquid',
                    'slurry': 'mix with cold liquid before adding to hot liquid',
                    'tempering': 'gradually introduce hot liquid to prevent lumps'
                }
            },
            'coating': {
                name: 'Coating',
                methods: ['dredging', 'battering'],
                applications: ['fried foods', 'sautéed proteins'],
                techniques: {
                    'seasoned_flour': 'add salt and spices for flavor',
                    'light_coating': 'shake off excess for thin crust',
                    'multiple_dredging': 'creates thicker coating'
                }
            }
        },
        storage: {
            temperature: {
                fahrenheit: { min: 50, max: 70 },
                celsius: { min: 10, max: 21 }
            },
            humidity: 'low',
            container: 'Airtight container, away from light',
            duration: 'up to 1 year at room temperature',
            notes: 'Can be refrigerated or frozen for longer storage'
        }
    },
    'semolina': {
        name: 'Semolina',
        elementalProperties: createElementalProperties({ Fire: 0.2, Water: 0.2, Earth: 0.5, Air: 0.1 }),
        astrologicalProfile: {
            rulingPlanets: ['Mercury', 'Saturn'],
            favorableZodiac: ['virgo', 'capricorn'],
            elementalAffinity: {
                base: 'Earth',
                secondary: 'Air'
            }
        },
        qualities: ['smooth', 'versatile', 'firm', 'golden', 'structured'],
        category: 'refined_grain',
        varieties: {
            'durum': {
                characteristics: 'highest protein content, golden color',
                uses: ['premium pasta', 'bread making'],
                cooking_time: 'varies by application',
                origin: 'Italy'
            }
        },
        preparation: {
            'pasta_making': {
                ratio: '1:1 semolina to water',
                method: 'knead until smooth',
                tips: ['rest dough for at least 30 minutes', 'dust surface with additional semolina']
            },
            'couscous': {
                ratio: '1:1.5 semolina to water',
                method: 'steam in stages',
                tips: ['fluff with fork between steaming', 'adds lightness to finished dish']
            },
            'halva': {
                ratio: '1:2 semolina to syrup',
                method: 'toast in butter before adding sweetened liquid',
                tips: ['stir constantly while cooking', 'add nuts for texture']
            },
            'gnocchi': {
                method: 'mix with potato and minimal liquid',
                tips: ['handle lightly to avoid toughness', 'cook until they float'],
                duration: '1-2 minutes cooking time'
            }
        },
        lunarPhaseModifiers: {
            newmoon: {
                elementalBoost: {},
                preparationTips: ['Good for foundations of dishes', 'Best structure for pasta']
            },
            fullmoon: {
                elementalBoost: {},
                preparationTips: ['Ideal for desserts', 'Enhanced moisture absorption']
            },
            firstQuarter: {
                elementalBoost: {},
                preparationTips: ['Perfect for bread making', 'Creates excellent texture']
            },
            lastQuarter: {
                elementalBoost: {},
                preparationTips: ['Good for couscous', 'Creates light, fluffy texture']
            }
        }
    },
    'pearl_barley': {
        name: 'Pearl Barley',
        elementalProperties: createElementalProperties({ Fire: 0.2, Water: 0.2, Earth: 0.5, Air: 0.1 }),
        astrologicalProfile: {
            rulingPlanets: ['Moon', 'Saturn'],
            favorableZodiac: ['cancer', 'capricorn'],
            elementalAffinity: {
                base: 'Earth',
                decanModifiers: {
                    first: { element: 'Earth', planet: "Saturn" },
                    second: { element: 'Earth', planet: "Mercury" },
                    third: { element: 'Air', planet: 'Mercury' }
                }
            }
        },
        qualities: ['tender', 'mild', 'versatile', 'creamy', 'nutritious'],
        category: 'refined_grain',
        varieties: {
            'quick': {
                characteristics: 'pre-steamed, faster cooking, less texture',
                cooking_ratio: '1:2.5 barley to water',
                cooking_time: '10-15 minutes',
                processing: 'partially pre-cooked'
            }
        },
        preparation: {
            'basic': {
                duration: 'rinse before cooking',
                method: 'simmer until tender',
                tips: ['no soaking required', 'drain excess water'],
                yield: 'triples in volume when cooked'
            },
            'risotto_style': {
                method: 'gradual liquid addition',
                duration: '35-45 minutes',
                notes: 'stir frequently for creamy texture',
                alternative_name: 'orzotto'
            },
            'pilaf': {
                method: 'toast in oil before adding liquid',
                duration: '40-45 minutes total',
                tips: ['adds nutty dimension', 'pAirs well with vegetables']
            }
        },
        lunarPhaseModifiers: {
            newmoon: {
                elementalBoost: {},
                preparationTips: ['Good for foundation of soups', 'Absorbs flavors well']
            },
            fullmoon: {
                elementalBoost: {},
                preparationTips: ['Creates exceptionally creamy texture', 'Best for risotto-style dishes']
            },
            waxingGibbous: {
                elementalBoost: {},
                preparationTips: ['Excellent for hearty stews', 'Develops rich mouthfeel']
            },
            waningCrescent: {
                elementalBoost: {},
                preparationTips: ['Good for salads', 'Enhanced nutty flavor']
            }
        }
    },
    'polished_farro': {
        name: 'Polished Farro',
        elementalProperties: createElementalProperties({ Fire: 0.2, Water: 0.2, Earth: 0.5, Air: 0.1 }),
        astrologicalProfile: {
            rulingPlanets: ['Saturn', 'Mercury'],
            favorableZodiac: ['capricorn', 'virgo'],
            elementalAffinity: {
                base: 'Earth',
                secondary: 'Air'
            }
        },
        qualities: ['refined', 'hearty', 'versatile', 'nutty', 'ancient'],
        category: 'refined_grain',
        varieties: {
            'pearled': {
                characteristics: 'quickest cooking, most refined, least bran',
                cooking_ratio: '1:2.5 farro to water',
                cooking_time: '15-20 minutes',
                origin: 'Italy'
            },
            'semi_pearled': {
                characteristics: 'partially refined, balanced nutrition and cooking time',
                cooking_ratio: '1:2.5 farro to water',
                cooking_time: '20-25 minutes',
                nutrition: 'moderate fiber content'
            }
        },
        preparation: {
            'pilaf': {
                method: 'toast then simmer',
                duration: 'until tender but chewy',
                tips: ['drain excess water', 'fluff when done'],
                seasonings: 'herbs, garlic, olive oil complement well'
            },
            'breakfast': {
                method: 'simmer in milk or water',
                sweeteners: 'honey, maple syrup, fruit',
                tips: 'can be prepared ahead and reheated',
                alternatives: 'can use plant-based milks'
            }
        },
        lunarPhaseModifiers: {
            newmoon: {
                elementalBoost: {},
                preparationTips: ['Good for new beginnings', 'Ideal for lighter preparations']
            },
            fullmoon: {
                elementalBoost: {},
                preparationTips: ['Enhanced nutty flavors', 'Best for showcasing the grain']
            },
            firstQuarter: {
                elementalBoost: {},
                preparationTips: ['Good for hearty dishes', 'Warming properties enhanced']
            },
            waningGibbous: {
                elementalBoost: {},
                preparationTips: ['Excellent for salads', 'Textural qualities highlighted']
            }
        }
    },
    'white_cornmeal': {
        name: 'White Cornmeal',
        elementalProperties: createElementalProperties({ Fire: 0.2, Water: 0.2, Earth: 0.5, Air: 0.1 }),
        astrologicalProfile: {
            rulingPlanets: ['Sun', 'Jupiter'],
            favorableZodiac: ['leo', 'sagittarius'],
            elementalAffinity: {
                base: 'Earth',
                secondary: 'Fire'
            }
        },
        qualities: ['versatile', 'mild', 'smooth', 'sweet', 'adaptable'],
        category: 'refined_grain',
        varieties: {
            'bolted': {
                characteristics: 'some hull and germ removed, moderate refinement',
                uses: ['traditional Southern recipes', 'grits'],
                cooking_time: '15-20 minutes',
                nutritional_notes: 'more nutrients than fine ground'
            }
        },
        preparation: {
            'polenta': {
                ratio: '1:4 cornmeal to water',
                method: 'constant stirring',
                tips: ['whisk to prevent lumps', 'can finish with butter and cheese'],
                variations: 'can be cooled, sliced and grilled'
            },
            'breading': {
                method: 'coat moistened items',
                tips: ['season well', 'creates crispy exterior'],
                cooking: 'fry, bake, or Air-fry',
                applications: 'fish, vegetables, chicken'
            },
            'grits': {
                ratio: '1:4 cornmeal to liquid',
                method: 'slow simmer',
                liquid: 'water, milk, or combination',
                duration: '20-30 minutes',
                serving: 'traditionally with butter, cheese, or savory toppings'
            }
        },
        lunarPhaseModifiers: {
            newmoon: {
                elementalBoost: {},
                preparationTips: ['Good for delicate baking', 'Enhanced sweeter notes']
            },
            fullmoon: {
                elementalBoost: {},
                preparationTips: ['Perfect for crispy applications', 'Browning enhanced']
            },
            waxingCrescent: {
                elementalBoost: {},
                preparationTips: ['Good for creamy preparations', 'Moisture retention improved']
            },
            lastQuarter: {
                elementalBoost: {},
                preparationTips: ['Excellent for breading', 'Creates optimal texture']
            }
        }
    },
    'all_purpose_flour': {
        name: 'All-Purpose Flour',
        elementalProperties: createElementalProperties({ Fire: 0.2, Water: 0.2, Earth: 0.5, Air: 0.1 }),
        astrologicalProfile: {
            rulingPlanets: ['Mercury', 'Venus'],
            favorableZodiac: ['virgo', 'libra'],
            elementalAffinity: {
                base: 'Earth',
                secondary: 'Air'
            }
        },
        qualities: ['versatile', 'balanced', 'neutral', 'adaptable', 'foundational'],
        category: 'refined_grain',
        varieties: {
            'bleached': {
                characteristics: 'white, fine texture, treated with bleaching agents',
                protein_content: '10-12%',
                uses: ['cakes', 'cookies', 'quick breads'],
                shelf_life: '1-2 years'
            },
            'unbleached': {
                characteristics: 'off-white color, aged naturally',
                protein_content: '10-12%',
                uses: ['artisanal breads', 'pastries', 'all-purpose'],
                shelf_life: '8-12 months'
            },
            'enriched': {
                characteristics: 'nutrients added back after processing',
                nutritional_notes: 'contains added iron, B vitamins',
                uses: 'standard for most commercial flour',
                regulation: 'required by law in many countries'
            }
        },
        preparation: {
            'roux': {
                ratio: '1:1 flour to fat',
                method: 'cook while stirring',
                duration: 'varies by desired color',
                uses: 'thickening sauces, gravies, and soups'
            },
            'coating': {
                method: 'dredge moistened items',
                tips: ['season flour well', 'shake off excess'],
                applications: 'meat, fish, vegetables before frying',
                variations: 'can mix with cornstarch for crispier results'
            },
            'slurry': {
                ratio: '1:2 flour to cold water',
                method: 'mix until smooth before adding to hot liquid',
                tips: 'pour slowly while stirring to prevent lumps',
                uses: 'quick thickening at end of cooking'
            }
        },
        lunarPhaseModifiers: {
            newmoon: {
                elementalBoost: {},
                preparationTips: ['Good for starting new baking projects', 'Enhanced rising properties']
            },
            fullmoon: {
                elementalBoost: {},
                preparationTips: ['Peak rising power for bread', 'Best gluten development']
            },
            waxingCrescent: {
                elementalBoost: {},
                preparationTips: ['Good for delicate pastries', 'Creates tender textures']
            },
            waningGibbous: {
                elementalBoost: {},
                preparationTips: ['Excellent for hearty baked goods', 'Enhanced structural properties']
            }
        }
    }
};

// Fix the ingredient mappings to ensure they have all required properties
export const refinedGrains = fixIngredientMappings(rawRefinedGrains);
export default refinedGrains;
