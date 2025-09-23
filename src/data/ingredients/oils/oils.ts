import type { IngredientMapping } from '@/data/ingredients/types';
import type { _ } from '@/types/seasons';
import { fixIngredientMappings } from '@/utils/elementalUtils';

// Pattern, AA: Ingredient Interface Restructuring
// Proper type annotation for raw ingredients to ensure IngredientMapping compatibility
const rawOils: Record<string, Partial<IngredientMapping>> = {
  olive_oil: {
    name: 'Olive Oil',
    category: 'oil',
    subCategory: 'cooking',
    elementalProperties: { Fire: 0.3, Earth: 0.3, Air: 0.2, Water: 0.2 },
    seasonality: ['spring', 'summer', 'fall', 'winter'],
    smokePoint: { celsius: 207, fahrenheit: 405 },
    qualities: ['healthy', 'versatile', 'rich'],
    nutritionalProfile: {
      serving_size: '1 tbsp',
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
      notes: 'Rich in monounsaturated fats and antioxidants' },
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
      notes: 'keep away from heat sources' },
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
        notes: ['Finishing oil for salads and cooked dishes'],
        techniques: ['Drizzle just before serving'],
        dishes: ['Bruschetta', 'Caprese salad', 'Bean soups']
      },
      lowHeat: {
        notes: ['Gentle sautéing and light cooking'],
        techniques: ['Keep below smoke point for best flavor'],
        dishes: ['Soffritto', 'Gentle vegetable sautés']
      },
      mediumHeat: {
        notes: ['Extra virgin not recommended for high heat'],
        techniques: ['Pure or light olive oil better for medium-high heat'],
        dishes: ['Pan frying', 'Some roasted vegetables']
      },
      infusions: {
        notes: ['Excellent base for herb and flavor infusions'],
        techniques: ['Warm gently with aromatics', 'Store infused oils refrigerated'],
        dishes: ['Rosemary oil', 'Garlic oil', 'Chili oil']
      }
    }
  },
  coconut_oil: {
    name: 'Coconut Oil',
    category: 'oil',
    subCategory: 'cooking',
    elementalProperties: { Fire: 0.1, Water: 0.5, Earth: 0.3, Air: 0.1 },
    seasonality: ['all'],
    smokePoint: { celsius: 177, fahrenheit: 350 },
    qualities: ['versatile', 'nourishing', 'antimicrobial', 'stable', 'aromatic', 'purifying'],
    nutritionalProfile: {
      serving_size: '1 tbsp',
      calories: 120,
      fat_g: 14,
      saturated_fat_g: 12,
      monounsaturated_fat_g: 1,
      polyunsaturated_fat_g: 0.5,
      medium_chain_triglycerides_g: 8,
      lauric_acid_g: 6,
      vitamins: ['e', 'k'],
      antioxidants: ['polyphenols', 'tocopherols', 'tocotrienols'],
      notes: 'Contains medium-chain triglycerides (MCTs) which are metabolized differently than other fats, providing a quick source of energy' },
        preparation: {
      fresh: {
        duration: '18-24 months',
        storage: 'cool, dark place',
        tips: [
          'solid below 76°F (24°C), liquid above this temperature',
          'no refrigeration necessary'
        ]
      }
    },
    storage: {
      container: 'glass jar',
      duration: '2 years',
      temperature: 'room temperature',
      notes: 'Highly resistant to rancidity due to high saturated fat content' },
        astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['cancer', 'taurus', 'pisces'],
      elementalAffinity: {
        base: 'Water',
        decanModifiers: {
          first: { element: 'Water', planet: 'Moon' },
        second: { element: 'Earth', planet: 'Venus' },
        third: { element: 'Water', planet: 'Neptune' }
        }
      },
      lunarPhaseModifiers: {
        fullMoon: {
          elementalBoost: { Water: 0.2 },
          preparationTips: ['Enhanced purification properties during full moon']
        },
        newMoon: {
          elementalBoost: { Earth: 0.2 },
          preparationTips: ['Best time for protective and grounding rituals']
        }
      }
    },
    culinaryApplications: {
      baking: {
        notes: [
          'Adds a subtle coconut flavor to baked goods',
          'Good solid fat substitute for butter in vegan recipes'
        ],
        techniques: ['Melt before using in recipes', 'Substitute, 1: 1 for butter'],
        dishes: ['Cookies', 'Cakes', 'Pie crusts', 'Vegan desserts']
      },
      cooking: {
        notes: ['Stable at high heat', 'Imparts mild coconut flavor to foods'],
        techniques: ['Sautéing', 'Stir-frying', 'Deep frying'],
        dishes: ['Curries', 'Tropical dishes', 'Sautéed vegetables', 'Fried foods']
      },
      raw: {
        notes: ['Solid at room temperature', 'Versatile base for raw treats'],
        techniques: ['Blend into smoothies', 'Use as base for raw desserts'],
        dishes: ['Smoothies', 'Raw energy bars', 'Homemade chocolates']
      }
    },
    healthProperties: {
      benefits: [
        'Contains lauric acid with antimicrobial properties',
        'MCTs may help with weight management and provide quick energy',
        'May improve heart health by increasing HDL cholesterol',
        'Supports skin moisture and barrier function',
        'Nourishes hair and scalp',
        'May improve oral health through oil pulling',
        'Contains antioxidants that fight free radicals',
        'May help improve brain function in Alzheimer's patients'
      ],
      cautions: [
        'High in calories and saturated fat, consume in moderation',
        'May raise LDL cholesterol in some individuals',
        'Allergic reactions possible in those with tree nut allergies'
      ]
    },
    cosmeticApplications: {
      skin: {
        uses: [
          'Natural moisturizer for dry skin',
          'Makeup remover',
          'Massage oil',
          'Cuticle softener'
        ],
        properties: ['Moisturizing', 'Emollient', 'Protective']
      },
      hair: {
        uses: [
          'Pre-wash hair treatment for damaged hair',
          'Leave-in conditioner for ends',
          'Scalp treatment for dandruff',
          'Styling product for definition and shine'
        ],
        properties: ['Conditioning', 'Strengthening', 'Reduces protein loss']
      },
      dental: {
        uses: ['Oil pulling for oral hygiene', 'Natural toothpaste ingredient'],
        properties: ['Antimicrobial', 'Reduces plaque', 'Freshens breath']
      }
    },
    magicalProperties: {
      correspondences: [
        'purification',
        'protection',
        'peace',
        'healing',
        'love',
        'moon magic',
        'psychic abilities'
      ],
      uses: [
        'Purification rituals and cleansing',
        'Moon rituals especially during full moon',
        'Self-love and beauty spells',
        'Protection work for home and body',
        'Healing ceremonies and massage',
        'Prosperity and abundance workings',
        'Enhancing psychic abilities and dreams'
      ],
      substitutions: ['olive oil', 'moonwater']
    }
  },
  palm_oil: {
    name: 'Palm Oil',
    category: 'oil',
    subCategory: 'cooking',
    elementalProperties: { Fire: 0.2, Water: 0.3, Earth: 0.4, Air: 0.1 },
    seasonality: ['all'],
    smokePoint: { celsius: 235, fahrenheit: 455 },
    qualities: ['versatile', 'stable', 'semi-solid', 'balanced', 'nourishing'],
    nutritionalProfile: {
      serving_size: '1 tbsp',
      calories: 120,
      fat_g: 14,
      saturated_fat_g: 7,
      monounsaturated_fat_g: 5,
      polyunsaturated_fat_g: 1,
      vitamin_e_mg: 2.1,
    },
    culinaryApplications: {
      frying: {
        notes: [
          'Excellent for deep frying due to high smoke point',
          'Maintains stability under high heat'
        ],
        techniques: ['Deep frying', 'Pan frying']
      },
      baking: {
        notes: ['Great for creating flaky pastry', 'Adds richness to baked goods'],
        techniques: ['Pastry making', 'Bread', 'Cakes']
      },
      spreads: {
        notes: ['Used in margarine production', 'Natural substitute for hydrogenated oils'],
        techniques: ['Spreadable fats']
      }
    },
    healthBenefits: {
      heart:
        'Contains equal amounts of saturated and unsaturated fats with beneficial fatty acid composition at the sn-2 position',
      immunity: 'Rich in tocotrienols and carotenoids that have antioxidant properties',
      digestion: 'Easily absorbed when used in cooking',
      energy: 'Provides sustained energy due to balanced fatty acid profile' },
        magicalProperties: {
      correspondence: ['Sun', 'Jupiter', 'Venus'],
      intentions: ['Abundance', 'Protection', 'Strength', 'Purification', 'Healing'],
      deities: ['Solar deities', 'Prosperity deities'],
      rituals: ['Prosperity workings', 'Money spells', 'Protection rituals']
    },
    astrologicalCorrespondence: {
      planets: ['Sun', 'Jupiter'],
      elements: ['Fire', 'Earth'],
      signs: ['Leo', 'Taurus']
    },
    history: 'Native to West Africa but now widely cultivated in Southeast Asia, particularly Malaysia and Indonesia. Has been used for cooking and medicinal purposes for thousands of years.',
    description: 'Semi-solid at room temperature, red palm oil has a natural deep orange-red color from carotenoids, while refined palm oil is pale yellow. Contains balanced amounts of saturated and unsaturated fatty acids, with palmitic acid and oleic acid being predominant.',
    cautions: 'Sustainable sourcing is important. Look for RSPO-certified (Roundtable on Sustainable Palm Oil) sources to ensure environmental and social responsibility.';
    psychoactiveProperties: null,
    medicalProperties: {
      inflammation: 'Tocotrienols have anti-inflammatory properties',
      antioxidant: 'Rich in vitamin E and carotenoids that protect cells from oxidative damage',
      heart: 'Studies show neutral to beneficial effects on blood lipid profiles when used in balanced diets' },
        pharmaceuticalProperties: null,
    substitutes: ['Coconut oil', 'Butter', 'Vegetable shortening']
  },
  sesame_oil: {
    name: 'Sesame Oil',
    category: 'oil',
    subCategory: 'finishing',
    elementalProperties: { Fire: 0.4, Water: 0.2, Earth: 0.2, Air: 0.2 },
    seasonality: ['fall', 'winter'],
    smokePoint: { celsius: 210, fahrenheit: 410 },
    qualities: ['nutty', 'aromatic', 'warming'],
    nutritionalProfile: {
      serving_size: '1 tbsp',
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
      notes: 'Distinctive nutty flavor, common in Asian cuisine' },
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
      notes: 'Refrigerate after opening' },
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
        notes: ['Add at end of cooking for flavor', 'A little goes a long way'],
        techniques: ['Drizzle sparingly', 'Add after heat is turned off'],
        dishes: ['Stir-fries', 'Noodle dishes', 'Asian dumplings']
      },
      dressings: {
        notes: ['Potent flavor addition to dressings'],
        techniques: ['Combine with rice vinegar for balance', 'Mix with milder oils'],
        dishes: ['Asian slaws', 'Cold noodle salads', 'Sesame dressings']
      },
      marinades: {
        notes: ['Excellent flavor enhancer for marinades'],
        techniques: ['Combine with soy sauce and aromatics'],
        dishes: ['Korean BBQ', 'Asian-style grilled meats', 'Vegetable marinades']
      }
    }
  },
  avocado_oil: {
    name: 'Avocado Oil',
    category: 'oil',
    subCategory: 'cooking',
    elementalProperties: { Fire: 0.2, Water: 0.3, Earth: 0.4, Air: 0.1 },
    seasonality: ['spring', 'summer', 'fall', 'winter'],
    smokePoint: { celsius: 270, fahrenheit: 520 },
    qualities: ['buttery', 'nutty', 'grassy', 'versatile', 'smooth', 'rich'],
    nutritionalProfile: {
      serving_size: '1 tbsp',
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
      notes: 'One of the highest monounsaturated fat content of any oil, with exceptional heat stability' },
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
      notes: 'Highly resistant to oxidation compared to other oils' },
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
        fullMoon: {
          elementalBoost: { Earth: 0.2, Water: 0.1 },
          preparationTips: ['Enhanced beauty and prosperity properties during full moon']
        },
        waxingCrescent: {
          elementalBoost: { Water: 0.1, Earth: 0.2 },
          preparationTips: ['Best time for healing skin treatments']
        }
      }
    },
    culinaryApplications: {
      raw: {
        notes: [
          'Rich buttery flavor makes it excellent for finishing dishes',
          'Use as a healthy alternative to butter'
        ],
        techniques: [
          'Drizzle over finished dishes',
          'Use in salad dressings',
          'Dipping oil for bread'
        ],
        dishes: ['Salads', 'Dips', 'Avocado mayonnaise', 'Cold soups']
      },
      cooking: {
        notes: [
          'Very high smoke point makes it ideal for high-heat cooking',
          'Neutral flavor with mild avocado notes'
        ],
        techniques: ['Deep frying', 'Stir-frying', 'Sautéing', 'Roasting', 'Grilling'],
        dishes: ['Stir-fries', 'Pan-seared proteins', 'Roasted vegetables', 'Fried foods']
      },
      baking: {
        notes: ['Excellent butter substitute in baking', 'Adds moisture to baked goods'],
        techniques: ['Substitute, 1: 1 for butter or other oils in recipes'],
        dishes: ['Cakes', 'Brownies', 'Muffins', 'Quick breads']
      }
    },
    healthProperties: {
      benefits: [
        'High in heart-healthy monounsaturated fatty acids',
        'Enhances absorption of fat-soluble nutrients',
        'Supports healthy cholesterol levels',
        'Promotes skin health and reduces inflammation',
        'Contains lutein for eye health',
        'Rich in antioxidants that fight free radicals',
        'May help improve insulin sensitivity'
      ],
      cautions: [
        'High in calories like all oils, should be consumed in moderation',
        'May cause allergic reactions in people with latex allergies (cross-reactivity)',
        'Choose cold-pressed, unrefined versions for maximum health benefits'
      ]
    },
    magicalProperties: {
      correspondences: [
        'beauty',
        'love',
        'abundance',
        'fertility',
        'healing',
        'luxury',
        'protection'
      ],
      uses: [
        'Anointing oil for beauty and self-love rituals',
        'Prosperity work and money-drawing spells',
        'Healing rituals for skin conditions',
        'Fertility magic and conception support',
        'Protective barriers against negative energies',
        'Enhancing Venus-ruled magical workings'
      ],
      substitutions: ['olive oil', 'coconut oil']
    }
  },
  walnut_oil: {
    name: 'Walnut Oil',
    category: 'oil',
    subCategory: 'finishing',
    elementalProperties: { Fire: 0.2, Water: 0.2, Earth: 0.4, Air: 0.2 },
    seasonality: ['fall', 'winter'],
    smokePoint: { celsius: 160, fahrenheit: 320 },
    qualities: ['nutty', 'rich', 'aromatic', 'warming', 'complex'],
    nutritionalProfile: {
      serving_size: '1 tbsp',
      calories: 120,
      fat_g: 13.6,
      saturated_fat_g: 1.2,
      monounsaturated_fat_g: 3.1,
      polyunsaturated_fat_g: 8.7,
      omega_3_g: 1.4,
      omega_6_g: 7.2,
      vitamins: ['e', 'k', 'b1', 'b6'],
      minerals: ['magnesium', 'phosphorus', 'zinc'],
      antioxidants: ['ellagic acid', 'tocopherols', 'melatonin'],
      notes: 'Rich nutty flavor ideal for finishing dishes' },
        preparation: {
      fresh: {
        duration: '2-3 months',
        storage: 'refrigerated',
        tips: ['keep refrigerated', 'use within 3 months of opening']
      }
    },
    storage: {
      container: 'dark glass bottle',
      duration: '6 months',
      temperature: 'refrigerated',
      notes: 'High polyunsaturated fat content makes it prone to rancidity' },
        astrologicalProfile: {
      rulingPlanets: ['Jupiter', 'Mercury'],
      favorableZodiac: ['sagittarius', 'gemini', 'virgo'],
      elementalAffinity: {
        base: 'Earth',
        decanModifiers: {
          first: { element: 'Earth', planet: 'Jupiter' },
        second: { element: 'Air', planet: 'Mercury' },
        third: { element: 'Fire', planet: 'Mars' }
        }
      }
    },
    culinaryApplications: {
      finishing: {
        notes: [
          'Distinctive nutty flavor enhances cooked dishes',
          'Not ideal for high heat cooking'
        ],
        techniques: ['Drizzle over cooked dishes', 'Add at the end of cooking'],
        dishes: ['Roasted vegetables', 'Pasta', 'Grain bowls', 'Soups']
      },
      dressings: {
        notes: ['Makes excellent flavor-forward dressings'],
        techniques: ['Pair with acid like sherry vinegar', 'Combine with complementary nuts'],
        dishes: ['Autumn salads', 'Bitter greens', 'Fruit salads']
      },
      baking: {
        notes: ['Adds rich flavor to baked goods'],
        techniques: ['Use in small quantities for flavor'],
        dishes: ['Walnut cakes', 'Brownies', 'Cookies']
      }
    },
    healthProperties: {
      benefits: [
        'Rich in omega-3 fatty acids that support heart health',
        'Contains antioxidants that may reduce oxidative stress',
        'May support brain health through essential fatty acids',
        'Anti-inflammatory properties from polyphenols'
      ],
      cautions: [
        'Should not be heated to high temperatures',
        'Goes rancid quickly, requiring refrigeration',
        'Allergenic for those with tree nut allergies'
      ]
    }
  },
  almond_oil: {
    name: 'Almond Oil',
    category: 'oil',
    subCategory: 'specialty',
    elementalProperties: { Fire: 0.1, Water: 0.3, Earth: 0.4, Air: 0.2 },
    seasonality: ['spring', 'summer', 'fall', 'winter'],
    smokePoint: { celsius: 216, fahrenheit: 420 },
    qualities: ['subtle', 'delicate', 'sweet', 'mild', 'versatile'],
    nutritionalProfile: {
      serving_size: '1 tbsp',
      calories: 120,
      fat_g: 14,
      saturated_fat_g: 1.1,
      monounsaturated_fat_g: 9.7,
      polyunsaturated_fat_g: 2.3,
      omega_3_g: 0,
      omega_6_g: 2.3,
      vitamins: ['e', 'k'],
      minerals: ['magnesium', 'phosphorus', 'calcium'],
      antioxidants: ['tocopherols', 'phytosterols', 'polyphenols'],
      notes: 'Rich in vitamin E, with subtle sweet almond flavor' },
        preparation: {
      fresh: {
        duration: '12 months',
        storage: 'cool, dark place',
        tips: ['refrigerate after opening for extended shelf life']
      }
    },
    storage: {
      container: 'dark glass bottle',
      duration: '12 months',
      temperature: 'room temperature or refrigerated',
      notes: 'Relatively stable compared to other nut oils' },
        culinaryApplications: {
      baking: {
        notes: ['Enhances almond-flavored baked goods', 'Adds moisture and subtle flavor'],
        techniques: ['Use in small quantities', 'Pairs well with sweet flavors'],
        dishes: ['Almond cakes', 'Muffins', 'Cookies', 'Pastries']
      },
      dressings: {
        notes: ['Mild flavor makes versatile base for dressings'],
        techniques: ['Pairs well with fruit vinegars', 'Combines well with honey'],
        dishes: ['Fruit salads', 'Delicate green salads', 'Vegetable dressings']
      },
      cooking: {
        notes: ['Medium-high smoke point makes it suitable for some cooking'],
        techniques: ['Can be used for gentle sautéing', 'Works for light frying'],
        dishes: ['Sautéed vegetables', 'Poultry dishes', 'Light seafood']
      }
    },
    healthProperties: {
      benefits: [
        'High in vitamin E, supporting skin health',
        'Contains monounsaturated fats that support heart health',
        'May help maintain healthy cholesterol levels',
        'Has mild anti-inflammatory properties'
      ],
      cautions: [
        'Allergenic for those with tree nut allergies',
        'Culinary versions not suitable for skin application'
      ]
    }
  },
  sunflower_oil: {
    name: 'Sunflower Oil',
    category: 'oil',
    subCategory: 'cooking',
    elementalProperties: { Fire: 0.4, Water: 0.1, Earth: 0.2, Air: 0.3 },
    seasonality: ['summer', 'fall'],
    smokePoint: { celsius: 232, fahrenheit: 450 },
    qualities: ['light', 'neutral', 'versatile', 'sunny', 'clear', 'bright'],
    nutritionalProfile: {
      serving_size: '1 tbsp',
      calories: 120,
      fat_g: 13.6,
      saturated_fat_g: 1.4,
      monounsaturated_fat_g: 2.7,
      polyunsaturated_fat_g: 8.9,
      omega_3_g: 0,
      omega_6_g: 8.9,
      vitamins: ['e', 'k'],
      minerals: ['selenium', 'zinc', 'copper'],
      antioxidants: ['tocopherols', 'phenolic acids', 'sesamol'],
      notes: 'High-oleic varieties have more monounsaturated fats and greater stability' },
        preparation: {
      fresh: {
        duration: '12 months',
        storage: 'cool, dark place',
        tips: ['keep away from heat and light to prevent oxidation']
      }
    },
    storage: {
      container: 'dark plastic or glass bottle',
      duration: '12 months',
      temperature: 'room temperature',
      notes: 'High-oleic varieties have longer shelf life' },
        astrologicalProfile: {
      rulingPlanets: ['Sun', 'Jupiter'],
      favorableZodiac: ['leo', 'sagittarius'],
      elementalAffinity: {
        base: 'Fire',
        decanModifiers: {
          first: { element: 'Fire', planet: 'Sun' },
        second: { element: 'Air', planet: 'Jupiter' },
        third: { element: 'Air', planet: 'Mercury' }
        }
      },
      lunarPhaseModifiers: {
        fullMoon: {
          elementalBoost: { Fire: 0.2, Air: 0.1 },
          preparationTips: ['Enhanced energy properties during full moon']
        }
      }
    },
    culinaryApplications: {
      frying: {
        notes: [
          'High smoke point makes it ideal for frying',
          'Neutral flavor won't compete with food'
        ],
        techniques: ['Deep frying', 'Pan frying', 'Sautéing'],
        dishes: ['Fried foods', 'Stir-fries', 'Roasted vegetables']
      },
      baking: {
        notes: ['Light neutral flavor good for baked goods'],
        techniques: ['Direct substitute for vegetable oil in recipes'],
        dishes: ['Cakes', 'Quick breads', 'Muffins']
      },
      dressings: {
        notes: ['Neutral base for dressings and mayonnaise'],
        techniques: ['Emulsifies well', 'Carries other flavors effectively'],
        dishes: ['Mayonnaise', 'Aioli', 'Vinaigrettes']
      }
    },
    healthProperties: {
      benefits: [
        'High vitamin E content supports antioxidant activity',
        'May help maintain heart health when used in place of saturated fats',
        'Contains phytosterols that may help lower cholesterol',
        'High-oleic varieties have a healthier fat profile'
      ],
      cautions: [
        'Regular varieties high in omega-6 which should be balanced with omega-3s',
        'May contain trans fats if partially hydrogenated',
        'Choose organic or cold-pressed versions when possible'
      ]
    },
    magicalProperties: {
      correspondences: ['sun', 'vitality', 'energy', 'protection', 'success', 'clarity'],
      uses: [
        'Solar rituals and sun magic',
        'Energy work and vitality spells',
        'Protection magic for the home',
        'Success and abundance workings',
        'Clarity and truth-seeking rituals'
      ],
      substitutions: ['olive oil', 'corn oil']
    }
  },
  peanut_oil: {
    name: 'Peanut Oil',
    category: 'oil',
    subCategory: 'cooking',
    elementalProperties: { Fire: 0.3, Water: 0.2, Earth: 0.4, Air: 0.1 },
    seasonality: ['spring', 'summer', 'fall', 'winter'],
    smokePoint: { celsius: 232, fahrenheit: 450 },
    qualities: ['nutty', 'earthy', 'robust', 'durable', 'grounding'],
    nutritionalProfile: {
      serving_size: '1 tbsp',
      calories: 119,
      fat_g: 13.5,
      saturated_fat_g: 2.3,
      monounsaturated_fat_g: 6.2,
      polyunsaturated_fat_g: 4.3,
      omega_3_g: 0,
      omega_6_g: 4.3,
      vitamins: ['e', 'k'],
      minerals: ['copper', 'selenium'],
      antioxidants: ['resveratrol', 'phytosterols'],
      notes: 'Popular in Asian cuisine, refined versions have a high smoke point' },
        preparation: {
      fresh: {
        duration: '12 months',
        storage: 'cool, dark place',
        tips: ['store unrefrigerated in dark bottle']
      }
    },
    storage: {
      container: 'dark glass bottle',
      duration: '12 months',
      temperature: 'room temperature',
      notes: 'Relatively stable due to balanced fat composition' },
        astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mars'],
      favorableZodiac: ['capricorn', 'aries', 'scorpio'],
      elementalAffinity: {
        base: 'Earth',
        decanModifiers: {
          first: { element: 'Earth', planet: 'Saturn' },
        second: { element: 'Fire', planet: 'Mars' },
        third: { element: 'Water', planet: 'Pluto' }
        }
      }
    },
    culinaryApplications: {
      deepfrying: {
        notes: [
          'High smoke point ideal for deep frying',
          'Can be reused multiple times',
          'Traditional for Asian cuisine'
        ],
        techniques: ['Temperature control critical for best results', 'Strain after use'],
        dishes: ['Stir-fries', 'Tempura', 'Fried chicken', 'Spring rolls']
      },
      roasting: {
        notes: ['Adds subtle nutty flavor to roasted dishes'],
        techniques: ['Use for high-temperature roasting'],
        dishes: ['Roasted vegetables', 'Meat dishes', 'Potatoes']
      },
      asian: {
        notes: ['Traditional in many Asian cuisines'],
        techniques: ['Great for wok cooking', 'Handles high heat stir-frying'],
        dishes: ['Chinese stir-fries', 'Thai dishes', 'Vietnamese cuisine']
      }
    },
    healthProperties: {
      benefits: [
        'Contains resveratrol, associated with heart health',
        'Rich in vitamin E, supporting antioxidant activity',
        'Good balance of monounsaturated and polyunsaturated fats',
        'Can help maintain healthy cholesterol levels when used in place of saturated fats'
      ],
      cautions: [
        'Highly allergenic for those with peanut allergies',
        'Refined versions may lose some nutritional benefits',
        'Moderation recommended due to omega-6 content'
      ]
    }
  },
  rice_bran_oil: {
    name: 'Rice Bran Oil',
    category: 'oil',
    subCategory: 'cooking',
    elementalProperties: { Fire: 0.2, Water: 0.2, Earth: 0.4, Air: 0.2 },
    seasonality: ['spring', 'summer', 'fall', 'winter'],
    smokePoint: { celsius: 232, fahrenheit: 450 },
    qualities: ['mild', 'versatile', 'stable', 'balanced', 'clean'],
    nutritionalProfile: {
      serving_size: '1 tbsp',
      calories: 120,
      fat_g: 14,
      saturated_fat_g: 2.7,
      monounsaturated_fat_g: 5.3,
      polyunsaturated_fat_g: 4.8,
      omega_3_g: 0.2,
      omega_6_g: 4.6,
      vitamins: ['e', 'k'],
      minerals: ['iron', 'magnesium', 'phosphorus'],
      antioxidants: ['gamma-oryzanol', 'tocotrienols', 'phytosterols', 'tocopherols'],
      notes: 'Contains unique antioxidant gamma-oryzanol not found in other oils' },
        preparation: {
      fresh: {
        duration: '12 months',
        storage: 'cool, dark place',
        tips: ['highly stable, does not require refrigeration']
      }
    },
    storage: {
      container: 'glass or plastic bottle',
      duration: '12-18 months',
      temperature: 'room temperature',
      notes: 'High oxidative stability due to balanced fat composition and antioxidants' },
        astrologicalProfile: {
      rulingPlanets: ['Mercury', 'Moon'],
      favorableZodiac: ['gemini', 'virgo', 'cancer'],
      elementalAffinity: {
        base: 'Earth',
        decanModifiers: {
          first: { element: 'Earth', planet: 'Mercury' },
        second: { element: 'Water', planet: 'Moon' },
        third: { element: 'Air', planet: 'Venus' }
        }
      }
    },
    culinaryApplications: {
      frying: {
        notes: [
          'High smoke point makes it excellent for frying',
          'Neutral flavor won't overpower foods'
        ],
        techniques: ['Deep frying', 'Stir-frying', 'Pan frying'],
        dishes: ['Tempura', 'Stir-fries', 'Fried rice', 'Crispy vegetables']
      },
      sauteing: {
        notes: ['Clean flavor profile enhances rather than masks food flavors'],
        techniques: ['Medium to high heat cooking', 'All-purpose cooking oil'],
        dishes: ['Sautéed vegetables', 'Fried eggs', 'Seared proteins']
      },
      baking: {
        notes: ['Neutral flavor works well in baked goods'],
        techniques: ['Direct substitute for vegetable oil'],
        dishes: ['Cakes', 'Cookies', 'Quick breads', 'Muffins']
      }
    },
    healthProperties: {
      benefits: [
        'Rich in gamma-oryzanol which may help lower cholesterol',
        'Contains antioxidant tocotrienols that support heart health',
        'Balanced fatty acid profile supports overall health',
        'May help reduce inflammation through antioxidant activity',
        'Used in traditional Asian medicine for health maintenance'
      ],
      cautions: [
        'Moderation recommended as with all oils',
        'Check for purity as some commercial varieties may be blended'
      ]
    }
  },
  mustard_oil: {
    name: 'Mustard Oil',
    category: 'oil',
    subCategory: 'cooking',
    elementalProperties: { Fire: 0.5, Water: 0.1, Earth: 0.3, Air: 0.1 },
    seasonality: ['winter', 'spring'],
    smokePoint: { celsius: 254, fahrenheit: 490 },
    qualities: ['pungent', 'strong', 'sharp', 'warming', 'stimulating'],
    nutritionalProfile: {
      serving_size: '1 tbsp',
      calories: 124,
      fat_g: 14,
      saturated_fat_g: 1.6,
      monounsaturated_fat_g: 8.3,
      polyunsaturated_fat_g: 3.5,
      omega_3_g: 0.8,
      omega_6_g: 2.7,
      vitamins: ['e', 'a', 'k'],
      minerals: ['selenium', 'calcium', 'manganese', 'copper', 'zinc'],
      antioxidants: ['tocopherols', 'carotenoids', 'isothiocyanates', 'phenolic compounds'],
      notes: 'Contains erucic acid and allyl isothiocyanate (responsible for pungency)' },
        preparation: {
      fresh: {
        duration: '12 months',
        storage: 'cool, dark place',
        tips: ['for authentic flavor, heat until smoking then cool before use']
      }
    },
    storage: {
      container: 'dark glass bottle',
      duration: '12 months',
      temperature: 'room temperature',
      notes: 'Stable oil with natural antimicrobial properties' },
        astrologicalProfile: {
      rulingPlanets: ['Mars', 'Pluto'],
      favorableZodiac: ['aries', 'scorpio'],
      elementalAffinity: {
        base: 'Fire',
        decanModifiers: {
          first: { element: 'Fire', planet: 'Mars' },
        second: { element: 'Earth', planet: 'Saturn' },
        third: { element: 'Water', planet: 'Pluto' }
        }
      }
    },
    culinaryApplications: {
      indian: {
        notes: ['Traditional in Indian and Bengali cuisine', 'Distinctive pungent flavor'],
        techniques: [
          'Sometimes heated until smoking then cooled before use',
          'Used raw for sharp flavor'
        ],
        dishes: ['Bengali fish curry', 'North Indian pickles', 'Mustard greens']
      },
      pickling: {
        notes: ['Natural antimicrobial properties ideal for preserving'],
        techniques: ['Combined with spices for pickling vegetables'],
        dishes: ['Achaars (Indian pickles)', 'Preserved vegetables', 'Chutney']
      },
      medicinal: {
        notes: ['Used in traditional medicine for warming properties'],
        techniques: ['External application for muscle aches', 'Cooking for digestive health'],
        dishes: ['Warming winter dishes', 'Therapeutic preparations']
      }
    },
    healthProperties: {
      benefits: [
        'Contains alpha-linolenic acid (ALA), an omega-3 fatty acid',
        'Natural antimicrobial and antibacterial properties',
        'Traditionally used to improve circulation and reduce inflammation',
        'May support heart health through balanced fatty acid profile',
        'Contains compounds that may help stimulate digestion'
      ],
      cautions: [
        'Contains erucic acid which is restricted in some countries',
        'Not recommended for infants and young children',
        'Can cause allergic reactions in some individuals',
        'External use may cause skin irritation'
      ]
    }
  },
  macadamia_oil: {
    name: 'Macadamia Oil',
    category: 'oil',
    subCategory: 'finishing',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    seasonality: ['spring', 'summer', 'fall', 'winter'],
    smokePoint: { celsius: 210, fahrenheit: 410 },
    qualities: ['buttery', 'smooth', 'delicate', 'luxurious', 'subtle'],
    nutritionalProfile: {
      serving_size: '1 tbsp',
      calories: 120,
      fat_g: 14,
      saturated_fat_g: 2.2,
      monounsaturated_fat_g: 10.8,
      polyunsaturated_fat_g: 0.4,
      omega_3_g: 0,
      omega_6_g: 0.4,
      omega_7_g: 5.5,
      vitamins: ['e', 'b1'],
      minerals: ['manganese', 'copper', 'magnesium'],
      antioxidants: ['tocopherols', 'squalene', 'phytosterols'],
      notes: 'One of the highest monounsaturated fat contents of any oil, including rare palmitoleic acid (omega-7)' },
        preparation: {
      fresh: {
        duration: '12 months',
        storage: 'cool, dark place',
        tips: ['refrigerate after opening for maximum freshness']
      }
    },
    storage: {
      container: 'dark glass bottle',
      duration: '24 months',
      temperature: 'room temperature',
      notes: 'Highly resistant to oxidation due to very high monounsaturated fat content' },
        astrologicalProfile: {
      rulingPlanets: ['Venus', 'Jupiter'],
      favorableZodiac: ['taurus', 'libra', 'sagittarius'],
      elementalAffinity: {
        base: 'Earth',
        decanModifiers: {
          first: { element: 'Earth', planet: 'Venus' },
        second: { element: 'Air', planet: 'Jupiter' },
        third: { element: 'Water', planet: 'Neptune' }
        }
      }
    },
    culinaryApplications: {
      finishing: {
        notes: [
          'Delicate, buttery flavor perfect for finishing dishes',
          'Adds luxurious mouthfeel'
        ],
        techniques: ['Drizzle over completed dishes', 'Use in small quantities for flavor'],
        dishes: ['Seafood', 'Grilled vegetables', 'Rice dishes', 'Desserts']
      },
      dressings: {
        notes: ['Smooth, buttery base for premium dressings'],
        techniques: ['Emulsifies beautifully', 'Pairs well with fruit vinegars and honey'],
        dishes: ['Fruit salads', 'Delicate green salads', 'Avocado dishes']
      },
      baking: {
        notes: ['Can replace butter in some baking applications'],
        techniques: ['Use in desserts where buttery flavor is desired'],
        dishes: ['Cakes', 'Cookies', 'Pastries']
      }
    },
    healthProperties: {
      benefits: [
        'Extremely high in monounsaturated fats (78%), similar to olive oil',
        'Contains rare omega-7 fatty acids (palmitoleic acid) that may benefit metabolic health',
        'May help reduce oxidative stress through antioxidant content',
        'Supports healthy cholesterol levels',
        'Contains squalene which may benefit skin health'
      ],
      cautions: [
        'Premium price makes it best used as a finishing oil',
        'Allergenic for those with tree nut allergies'
      ]
    }
  }
}

// Fix the ingredient mappings to ensure they have all required properties
export const oils: Record<string, IngredientMapping> = fixIngredientMappings(rawOils)

// For backward compatibility
export const _allOils = oils;

// Export default for convenience
export default oils,
