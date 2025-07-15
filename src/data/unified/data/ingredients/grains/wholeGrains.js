"use strict";
import { fixIngredientMappings } from '../../../utils/elementalUtils';
import { createElementalProperties } from '../../../utils/elemental/elementalUtils';

const rawWholeGrains = {
    'brown_rice': {
        name: 'Brown Rice',
        elementalProperties: createElementalProperties({ Fire: 0.1, Water: 0.3, Earth: 0.5, Air: 0.1 }),
        astrologicalProfile: {
            rulingPlanets: ['Moon', 'Venus'],
            favorableZodiac: ['cancer', 'capricorn', 'taurus'],
            elementalAffinity: {
                base: 'Earth',
                secondary: 'Water',
                decanModifiers: {
                    first: { element: 'Earth', planet: 'Venus' },
                    second: { element: 'Water', planet: 'Moon' },
                    third: { element: 'Air', planet: 'Mercury' }
                }
            },
            lunarPhaseModifiers: {
                newmoon: {
                    elementalBoost: createElementalProperties({
                        Earth: 0.2,
                        Water: 0.1
                    }),
                    preparationTips: ['Begin sprouting process', 'Mindful cooking with minimal seasonings']
                },
                fullmoon: {
                    elementalBoost: createElementalProperties({
                        Earth: 0.3,
                        Water: 0.2
                    }),
                    preparationTips: ['Perfect for hearty dishes', 'Enhanced digestibility']
                },
                waxingCrescent: {
                    elementalBoost: createElementalProperties({
                        Water: 0.2,
                        Earth: 0.1
                    }),
                    preparationTips: ['Good for starting fermentations', 'Basic cooking methods']
                },
                firstQuarter: {
                    elementalBoost: createElementalProperties({
                        Earth: 0.2,
                        Fire: 0.1
                    }),
                    preparationTips: ['Balanced seasonings', 'Good for everyday preparations']
                }
            },
            aspectEnhancers: ['Moon trine venus', 'Saturn sextile jupiter']
        },
        qualities: ['nutty', 'chewy', 'wholesome', 'earthy', 'grounding', 'nourishing'],
        origin: ['Asia', 'Global cultivation'],
        season: ['all'],
        category: 'whole_grain',
        subCategory: 'rice',
        nutritionalProfile: {
            serving_size: "1 / (2 || 1) cup cooked",
            calories: 108,
            macros: {
                protein: 2.5,
                carbs: 22.4,
                fat: 0.9,
                fiber: 1.8
            },
            vitamins: {
                B1: 0.11,
                B3: 0.13,
                B6: 0.14,
                E: 0.08,
                folate: 0.04
            },
            minerals: {
                manganese: 0.86,
                magnesium: 0.36,
                phosphorus: 0.33,
                selenium: 0.42,
                zinc: 0.18,
                copper: 0.11,
                iron: 0.10
            },
            glycemic_index: 68,
            source: "USDA FoodData Central"
        },
        healthBenefits: {
            digestiveHealth: {
                benefit: "Digestive Support",
                mechanism: "Fiber content promotes healthy gut bacteria and regular bowel movements",
                evidence: "Studies show whole grains increase beneficial gut microbiota diversity"
            },
            hearthealth: {
                benefit: "Cardiovascular Support",
                mechanism: "Fiber, antioxidants, and minerals help manage cholesterol and blood pressure",
                evidence: "Regular whole grain consumption associated with reduced heart disease risk"
            },
            bloodSugarControl: {
                benefit: "Blood Sugar Regulation",
                mechanism: "Fiber and complex carbohydrates slow glucose absorption",
                evidence: "Lower glycemic impact compared to refined white rice"
            },
            weightManagement: {
                benefit: "Weight Management",
                mechanism: "Higher fiber content increases satiety and reduces overall calorie intake",
                evidence: "Associated with lower BMI in observational studies"
            },
            antioxidantEffects: {
                benefit: "Antioxidant Activity",
                mechanism: "Contains phenolic compounds that combat oxidative stress",
                compounds: ['ferulic acid', 'caffeic acid', 'sinapic acid'],
                notes: "Most concentrated in the bran layer"
            }
        },
        varieties: {
            'short_grain': {
                name: 'Short Grain Brown Rice',
                characteristics: 'sticky, plump, tender',
                appearance: 'stubby, nearly round grains',
                flavor: 'nutty, slightly sweet',
                cooking_ratio: '1:2 rice to water',
                cooking_time: '45-50 minutes',
                best_for: 'sushi, risotto, puddings, sticky preparations'
            },
            'long_grain': {
                name: 'Long Grain Brown Rice',
                characteristics: 'fluffy, separate grains, drier texture',
                appearance: 'slender, elongated grains',
                flavor: 'mild nutty taste',
                cooking_ratio: '1:2.25 rice to water',
                cooking_time: '45-50 minutes',
                best_for: 'pilafs, salads, stuffings, everyday use'
            },
            'basmati': {
                name: 'Brown Basmati Rice',
                characteristics: 'aromatic, slender, distinctive fragrance',
                appearance: 'long, slender grains that elongate when cooked',
                flavor: 'nutty with distinctive aroma',
                cooking_ratio: '1:2 rice to water',
                cooking_time: '40-45 minutes',
                best_for: 'Indian dishes, pilafs, biryanis'
            },
            'jasmine': {
                name: 'Brown Jasmine Rice',
                characteristics: 'aromatic, slightly clinging, soft',
                appearance: 'medium to long grain',
                flavor: 'floral aroma, subtle sweetness',
                cooking_ratio: '1:1.75 rice to water',
                cooking_time: '40-45 minutes',
                best_for: 'Southeast Asian cuisine, coconut-based dishes'
            },
            'himalayan_red': {
                name: 'Himalayan Red Rice',
                characteristics: 'distinctive color, hearty texture',
                appearance: 'russet-colored, medium grain',
                flavor: 'robust, earthy, nutty',
                cooking_ratio: '1:2.5 rice to water',
                cooking_time: '45-50 minutes',
                best_for: 'substantial side dishes, grain bowls, salads'
            }
        },
        affinities: [
            'onions', 'garlic', 'ginger', 'lentils', 'beans',
            'soy sauce', 'miso', 'coconut milk', 'vegetable broth',
            'mushrooms', 'carrots', 'peas', 'leafy greens',
            'nuts', 'seeds', 'herbs', 'curry spices', 'citrus zest'
        ],
        cookingMethods: ['boil', 'steam', 'pilaf', 'risotto', 'pressure cook', 'bake', 'stuff', 'soup', 'porridge', 'sprouted'],
        preparation: {
            'soaking': {
                duration: '8-12 hours',
                benefits: ['reduces cooking time by 10-15 minutes', 'improves digestibility', 'activates enzymes'],
                method: 'room temperature water with optional splash of lemon juice or vinegar',
                notes: 'Discard soaking water and rinse before cooking'
            },
            'rinsing': {
                method: 'rinse in cool water until water runs clear',
                purpose: 'removes dust and excess starch',
                technique: 'swirl in bowl of water or use strainer',
                notes: 'Some prefer to skip for maximum nutrition retention'
            },
            'toasting': {
                method: 'dry toast in pan before cooking',
                benefits: 'enhances nutty flavor',
                timing: '3-5 minutes until fragrant',
                notes: 'Stir constantly to prevent burning'
            }
        },
        culinaryApplications: {
            'basic_method': {
                name: 'Basic Method',
                steps: [
                    'rinse thoroughly',
                    'soak (optional) 30 minutes to overnight',
                    'combine with water (2 parts water to 1 part rice)',
                    'bring to boil',
                    'reduce heat to low simmer',
                    'cover with tight-fitting lid',
                    'cook 45-50 minutes',
                    'let rest 10 minutes before fluffing'
                ],
                tips: ['Don\'t peek during cooking', 'Use heavy-bottomed pot', 'Keep lid on tight']
            },
            'pilaf_method': {
                name: 'Pilaf Method',
                steps: [
                    'sauté aromatics in oil',
                    'add rice and toast briefly',
                    'add liquid and seasonings',
                    'bring to boil, then simmer',
                    'cook covered until done'
                ],
                benefits: 'enhances flavor and texture'
            },
            'pressure_cooking': {
                name: 'Pressure Cooking',
                ratio: '1:1.5 rice to water',
                cooking_time: '15-20 minutes high pressure',
                natural_release: '10 minutes',
                benefits: 'faster cooking, consistent results'
            },
            'steaming': {
                name: 'Steaming',
                method: 'use rice cooker or steamer basket',
                ratio: '1:1.5 rice to water',
                benefits: 'gentle cooking, fluffy texture'
            }
        },
        storage: {
            uncooked: {
                container: 'Airtight container',
                location: 'cool, dark place',
                duration: '6 months to 1 year',
                notes: 'Store in refrigerator for longer shelf life'
            },
            cooked: {
                container: 'Airtight container',
                location: 'refrigerator',
                duration: '3-5 days',
                reheating: 'steam or microwave with splash of water'
            },
            freezing: {
                method: 'portion into freezer bags',
                duration: 'up to 6 months',
                reheating: 'thaw in refrigerator overnight'
            }
        },
        regionalPreparations: {
            'asian': {
                name: 'Asian',
                dishes: ['fried rice', 'sushi', 'congee', 'rice bowls'],
                techniques: 'steaming, stir-frying, slow cooking',
                seasonings: ['soy sauce', 'sesame oil', 'ginger', 'garlic']
            },
            'mediterranean': {
                name: 'Mediterranean',
                dishes: ['pilafs', 'risottos', 'grain salads'],
                techniques: 'sautéing with aromatics, broth cooking',
                seasonings: ['olive oil', 'herbs', 'lemon', 'garlic']
            },
            'latin_american': {
                name: 'Latin American',
                dishes: ['gallo pinto', 'arroz con pollo', 'rice and beans'],
                techniques: 'sautéing with sofrito, cooking with broth',
                seasonings: ['achiote', 'cumin', 'cilantro', 'lime']
            },
            'indian': {
                name: 'Indian',
                dishes: ['biryani', 'pulao', 'khichdi'],
                techniques: 'layering, dum cooking, tempering',
                seasonings: ['ghee', 'spices', 'saffron', 'herbs']
            }
        },
        pAirings: ['lentils', 'beans', 'vegetables', 'herbs', 'spices', 'broths', 'oils'],
        substitutions: ['quinoa', 'farro', 'buckwheat', 'millet'],
        affinities: ['aromatics', 'herbs', 'spices', 'vegetables', 'legumes', 'proteins']
    },
    'quinoa': {
        name: 'Quinoa',
        elementalProperties: createElementalProperties({ Fire: 0.2, Water: 0.2, Earth: 0.4, Air: 0.2 }),
        qualities: ['nutty', 'light', 'versatile', 'complete_protein'],
        category: 'whole_grain',
        culinaryApplications: {
            'basic_cooking': {
                ratio: '1:2 quinoa to water',
                cooking_time: '15-20 minutes',
                method: 'simmer until water absorbed'
            },
            'soaked_method': {
                soaking: '8-12 hours',
                cooking_time: '45-60 minutes',
                benefits: 'improved texture and digestibility'
            }
        },
        preparations: {
            'bread_making': {
                method: 'grind fresh',
                fermentation: 'longer rise time needed',
                notes: 'pAirs well with sourdough'
            },
            'hearty_salads': {
                method: 'cook until chewy',
                additions: ['root vegetables', 'hardy greens', 'vinaigrette'],
                service: 'room temperature'
            }
        },
        nutritionalProfile: {
            protein: 'moderate protein',
            minerals: ['manganese', 'phosphorus', 'magnesium'],
            vitamins: ['b1', 'b3', 'b6'],
            calories_per_100g: 338,
            protein_g: 10.3,
            fiber_g: 15.1
        }
    },
    'kamut': {
        name: 'Kamut',
        elementalProperties: createElementalProperties({ Fire: 0.2, Water: 0.2, Earth: 0.5, Air: 0.1
        }),
        qualities: ['buttery', 'rich', 'chewy'],
        category: 'whole_grain',
        culinaryApplications: {
            'basic_cooking': {
                ratio: '1:3 kamut to water',
                cooking_time: '60-90 minutes',
                method: 'simmer until tender'
            },
            'soaked_method': {
                soaking: '12-24 hours',
                cooking_time: '45-60 minutes',
                benefits: 'improved digestibility'
            }
        },
        preparations: {
            'grain_bowl': {
                method: 'cook until chewy',
                additions: ['roasted vegetables', 'herbs', 'dressing'],
                service: 'warm or room temperature'
            },
            'breakfast_porridge': {
                method: 'cook longer for softer texture',
                additions: ['dried fruit', 'nuts', 'honey'],
                service: 'hot'
            }
        },
        nutritionalProfile: {
            protein: 'high protein content',
            minerals: ['selenium', 'zinc', 'magnesium'],
            vitamins: ['e', 'b-complex'],
            calories_per_100g: 337,
            protein_g: 14.7,
            fiber_g: 11.1
        }
    },
    'spelt_berries': {
        name: 'Spelt Berries',
        elementalProperties: createElementalProperties({ Fire: 0.2, Water: 0.2, Earth: 0.5, Air: 0.1
        }),
        qualities: ['nutty', 'complex', 'hearty'],
        category: 'whole_grain',
        culinaryApplications: {
            'basic_cooking': {
                ratio: '1:3 spelt to water',
                cooking_time: '45-60 minutes',
                method: 'simmer until tender'
            },
            'pressure_cooker': {
                ratio: '1:2.5 spelt to water',
                cooking_time: '25-30 minutes',
                notes: 'natural release recommended'
            }
        },
        preparations: {
            'salads': {
                method: 'cook until al dente',
                additions: ['fresh vegetables', 'vinaigrette', 'herbs'],
                service: 'room temperature'
            },
            'soups': {
                method: 'add to broth',
                cooking_time: '30-40 minutes in soup',
                notes: 'adds hearty texture'
            }
        },
        nutritionalProfile: {
            protein: 'high quality',
            minerals: ['manganese', 'phosphorus', 'iron'],
            vitamins: ['b3', 'b6', 'thiamin'],
            calories_per_100g: 338,
            protein_g: 14.6,
            fiber_g: 10.7
        }
    },
    'einkorn': {
        name: 'Einkorn',
        elementalProperties: createElementalProperties({ Fire: 0.2, Water: 0.2, Earth: 0.5, Air: 0.1
        }),
        qualities: ['nutty', 'ancient', 'nutritious'],
        category: 'whole_grain',
        culinaryApplications: {
            'basic_cooking': {
                ratio: '1:2 einkorn to water',
                cooking_time: '30-35 minutes',
                method: 'simmer gently'
            },
            'risotto_style': {
                method: 'gradual broth addition',
                cooking_time: '25-30 minutes',
                notes: 'stir frequently'
            }
        },
        preparations: {
            'pilaf': {
                method: 'toast then simmer',
                additions: ['mushrooms', 'onions', 'herbs'],
                service: 'hot'
            },
            'breakfast': {
                method: 'cook until creamy',
                additions: ['milk', 'honey', 'fruit'],
                service: 'hot'
            }
        },
        nutritionalProfile: {
            protein: 'high protein',
            minerals: ['zinc', 'iron', 'manganese'],
            vitamins: ['a', 'b-complex'],
            calories_per_100g: 340,
            protein_g: 15.3,
            fiber_g: 8.7
        }
    },
    'rye_berries': {
        name: 'Rye Berries',
        elementalProperties: createElementalProperties({ Fire: 0.2, Water: 0.2, Earth: 0.5, Air: 0.1
        }),
        qualities: ['earthy', 'robust', 'hearty'],
        category: 'whole_grain',
        culinaryApplications: {
            'basic_cooking': {
                ratio: '1:3 rye to water',
                cooking_time: '60-75 minutes',
                method: 'simmer until tender'
            },
            'soaked_method': {
                soaking: '8-12 hours',
                cooking_time: '45-60 minutes',
                benefits: 'improved texture and digestibility'
            }
        },
        preparations: {
            'bread_making': {
                method: 'grind fresh',
                fermentation: 'longer rise time needed',
                notes: 'pAirs well with sourdough'
            },
            'hearty_salads': {
                method: 'cook until chewy',
                additions: ['root vegetables', 'hardy greens', 'vinaigrette'],
                service: 'room temperature'
            }
        },
        nutritionalProfile: {
            protein: 'moderate protein',
            minerals: ['manganese', 'phosphorus', 'magnesium'],
            vitamins: ['b1', 'b3', 'b6'],
            calories_per_100g: 338,
            protein_g: 10.3,
            fiber_g: 15.1
        }
    },
    'wild_rice': {
        name: 'Wild Rice',
        elementalProperties: createElementalProperties({ Fire: 0.2, Water: 0.2, Earth: 0.5, Air: 0.1
        }),
        qualities: ['nutty', 'complex', 'aromatic'],
        category: 'whole_grain',
        culinaryApplications: {
            'basic_cooking': {
                ratio: '1:3 rice to water',
                cooking_time: '45-55 minutes',
                method: 'simmer until grains split'
            },
            'pilaf_method': {
                steps: [
                    'toast in oil',
                    'add aromatics',
                    'simmer in broth',
                    'steam finish'
                ],
                notes: 'enhances nutty flavor'
            }
        },
        preparations: {
            'grain_blends': {
                method: 'mix with other rices',
                ratio: '1:2 wild to other rice',
                notes: 'adds texture and nutrition'
            }
        },
        nutritionalProfile: {
            protein: 'high protein',
            minerals: ['zinc', 'phosphorus', 'potassium'],
            vitamins: ['b6', 'folate', 'niacin'],
            calories_per_100g: 357,
            protein_g: 14.7,
            fiber_g: 6.2
        }
    },
    'triticale': {
        name: 'Triticale',
        elementalProperties: createElementalProperties({ Fire: 0.2, Water: 0.2, Earth: 0.5, Air: 0.1
        }),
        qualities: ['nutty', 'hybrid vigor', 'nutritious'],
        category: 'whole_grain',
        culinaryApplications: {
            'basic_cooking': {
                ratio: '1:3 triticale to water',
                cooking_time: '45-60 minutes',
                method: 'simmer until tender'
            },
            'overnight_method': {
                soaking: '8-12 hours',
                cooking_time: '30-40 minutes',
                benefits: 'quicker cooking, better absorption'
            }
        },
        preparations: {
            'breakfast_cereal': {
                method: 'cook until soft',
                additions: ['dried fruits', 'seeds', 'milk'],
                service: 'hot'
            },
            'grain_salad': {
                method: 'cook until chewy',
                additions: ['roasted vegetables', 'fresh herbs', 'citrus'],
                service: 'room temperature'
            }
        },
        nutritionalProfile: {
            protein: 'high protein',
            minerals: ['manganese', 'iron', 'copper'],
            vitamins: ['b1', 'b2', 'folate'],
            calories_per_100g: 336,
            protein_g: 13.1,
            fiber_g: 9.8
        }
    },
    'oats': {
        elementalProperties: createElementalProperties({ Fire: 0.2, Water: 0.2, Earth: 0.5, Air: 0.1
        }),
        astrologicalProfile: {
            rulingPlanets: ['Moon', 'Venus'],
            favorableZodiac: ['cancer', 'taurus'],
            elementalAffinity: {
                base: 'Earth',
                decanModifiers: {
                    first: { element: 'Earth', planet: "Saturn" },
                    second: { element: 'Earth', planet: "Mercury" },
                    third: { element: 'Air', planet: 'Mercury' }
                }
            },
            lunarPhaseModifiers: {
                waxingCrescent: {
                    elementalBoost: {},
                    preparationTips: ['Best for overnight oats']
                },
                fullmoon: {
                    elementalBoost: {},
                    preparationTips: ['Ideal for creamy porridge']
                }
            }
        },
        qualities: ['nutty', 'chewy', 'wholesome'],
        category: 'whole_grain',
        varieties: {
            'short_grain': {
                characteristics: 'sticky, plump',
                cooking_ratio: '1:2 rice to water',
                cooking_time: '45-50 minutes'
            },
            'long_grain': {
                characteristics: 'fluffy, separate grains',
                cooking_ratio: '1:2.25 rice to water',
                cooking_time: '45-50 minutes'
            }
        },
        preparation: {
            'soaking': {
                duration: '8-12 hours',
                benefits: ['reduces cooking time', 'improves digestibility']
            }
        }
    },
    'barley': {
        name: 'Barley',
        astrologicalProfile: {
            rulingPlanets: ['Venus', 'Moon'],
            favorableZodiac: ['cancer', 'taurus']
        },
        elementalProperties: createElementalProperties({ Fire: 0.2, Water: 0.2, Earth: 0.5, Air: 0.1
        }),
        qualities: ['nutty', 'chewy', 'wholesome'],
        category: 'whole_grain',
        culinaryApplications: {
            'basic_cooking': {
                ratio: '1:3 barley to water',
                cooking_time: '60-75 minutes',
                method: 'simmer until tender'
            },
            'soaked_method': {
                soaking: '8-12 hours',
                cooking_time: '45-60 minutes',
                benefits: 'improved texture and digestibility'
            }
        },
        preparations: {
            'bread_making': {
                method: 'grind fresh',
                fermentation: 'longer rise time needed',
                notes: 'pAirs well with sourdough'
            },
            'hearty_salads': {
                method: 'cook until chewy',
                additions: ['root vegetables', 'hardy greens', 'vinaigrette'],
                service: 'room temperature'
            }
        },
        nutritionalProfile: {
            protein: 'moderate protein',
            minerals: ['manganese', 'phosphorus', 'magnesium'],
            vitamins: ['b1', 'b3', 'b6'],
            calories_per_100g: 338,
            protein_g: 10.3,
            fiber_g: 15.1
        }
    }
};

// Fix the ingredient mappings to ensure they have all required properties
export const wholeGrains = fixIngredientMappings(rawWholeGrains);

// Create a collection of all whole grains
export const allWholeGrains = Object.values(wholeGrains);

export default wholeGrains;
