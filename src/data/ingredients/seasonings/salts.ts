import type { IngredientMapping } from '@/data/ingredients/types';
import { fixIngredientMappings } from '@/utils/elementalUtils';

const rawSalts = {
  'fleur_de_sel': {
    name: 'Fleur De Sel',
    elementalProperties: { Water: 0.4, Earth: 0.3, Air: 0.2, Fire: 0.1 },
    qualities: ['delicate', 'moist', 'mineral'],
    origin: ['France', 'Portugal'],
    category: 'seasoning',
    subCategory: 'salt',
    varieties: {
      'Guérande': {
    name: 'Guérande',
        appearance: 'grey-white crystals',
        texture: 'moist, delicate flakes',
        minerality: 'high',
        uses: 'premium finishing'
      },
      'Camargue': {
    name: 'Camargue',
        appearance: 'white crystals',
        texture: 'light, crispy',
        minerality: 'medium-high',
        uses: 'delicate finishing'
      },
      'Portuguese': {
    name: 'Portuguese',
        appearance: 'white pyramidal crystals',
        texture: 'crunchy, moist',
        minerality: 'medium',
        uses: 'all-purpose finishing'
      }
    },
    harvesting: {
      method: 'hand-harvested from surface',
      timing: 'summer months only',
      conditions: 'specific wind and weather required',
      traditional_tools: ['wooden rake', 'woven basket']
    },
    culinaryApplications: {
      'finishing': {
    name: 'Finishing',
        method: 'sprinkle by hand',
        timing: 'just before serving',
        applications: {
          'vegetables': 'light sprinkle on raw or cooked',
          'meats': 'just before serving',
          'caramels': 'while still warm',
          'chocolate': 'before setting'
        },
        notes: 'Do not use for cooking - heat destroys texture'
      },
      'garnishing': {
    name: 'Garnishing',
        method: 'pinch and sprinkle',
        applications: {
          'salads': 'final touch',
          'bread': 'just before baking',
          'eggs': 'immediately before eating'
        }
      }
    },
    storage: {
      temperature: 'room temperature',
      humidity: 'low',
      container: 'ceramic or glass',
      notes: 'Keep dry but expects some moisture'
    }
  },

  'maldon_salt': {
    name: 'Maldon Salt',
    elementalProperties: { Earth: 0.4, Water: 0.3, Air: 0.2, Fire: 0.1 },
    qualities: ['crisp', 'clean', 'flaky'],
    origin: ['United Kingdom'],
    category: 'seasoning',
    subCategory: 'salt',
    varieties: {
      
      'Smoked': {
    name: 'Smoked',
        appearance: 'golden-brown flakes',
        texture: 'crunchy with smoke flavor',
        uses: 'meats, hearty dishes'
      }
    },
    culinaryApplications: {
      'finishing': {
    name: 'Finishing',
        method: 'crush between fingers',
        timing: 'just before serving',
        applications: {
          'grilled_meats': 'after resting',
          'roasted_vegetables': 'while hot',
          'baked_goods': 'before baking',
          'chocolate': 'before setting'
        }
      },
      'texture_enhancement': {
    name: 'Texture Enhancement',
        method: 'strategic placement',
        applications: {
          'salads': 'final seasoning',
          'caramels': 'top garnish',
          'bread_crust': 'pre-bake sprinkle'
        }
      }
    },
    storage: {
      temperature: 'room temperature',
      humidity: 'very low',
      container: 'airtight glass or ceramic',
      notes: 'Keep very dry to maintain crunch'
    }
  },

  'sea_salt': {
    name: 'Sea Salt',
    elementalProperties: { Water: 0.6, Earth: 0.2, Air: 0.1, Fire: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Neptune'],
      favorableZodiac: ['cancer', 'pisces'],
      elementalAffinity: {
        base: 'Water',
        decanModifiers: {
          first: { element: 'Water', planet: 'Moon' },
          second: { element: 'Earth', planet: 'Neptune' },
          third: { element: 'Air', planet: 'Mercury' }
        }
      },
      lunarPhaseModifiers: {
        newMoon: {
          elementalBoost: { Water: 0.1, Earth: 0.1 },
          preparationTips: ['Best for brining']
        },
        fullMoon: {
          elementalBoost: { Water: 0.2 },
          preparationTips: ['Ideal for finishing dishes']
        }
      }
    },
    qualities: ['delicate', 'moist', 'mineral'],
    origin: ['Various'],
    category: 'seasoning',
    subCategory: 'salt',
    varieties: {
      
      'Smoked': {
    name: 'Smoked',
        appearance: 'golden-brown flakes',
        texture: 'crunchy with smoke flavor',
        uses: 'meats, hearty dishes'
      }
    },
    culinaryApplications: {
      'finishing': {
    name: 'Finishing',
        method: 'crush between fingers',
        timing: 'just before serving',
        applications: {
          'grilled_meats': 'after resting',
          'roasted_vegetables': 'while hot',
          'baked_goods': 'before baking',
          'chocolate': 'before setting'
        }
      },
      'texture_enhancement': {
    name: 'Texture Enhancement',
        method: 'strategic placement',
        applications: {
          'salads': 'final seasoning',
          'caramels': 'top garnish',
          'bread_crust': 'pre-bake sprinkle'
        }
      }
    },
    storage: {
      temperature: 'room temperature',
      humidity: 'very low',
      container: 'airtight glass or ceramic',
      notes: 'Keep very dry to maintain crunch'
    }
  },

  'himalayan_salt': {
    name: 'Himalayan Salt',
    elementalProperties: { Earth: 0.6, Fire: 0.2, Water: 0.1, Air: 0.1 },
    astrologicalProfile: {
      planetaryRuler: 'Mars',
      zodiacRuler: 'Aries',
      element: 'Earth',
      energyType: 'Grounding',
      lunarPhaseModifiers: {
        'new': {
          elementalBoost: { Earth: 0.1 },
          culinaryTip: 'Use for preserving during new moon for enhanced shelf life'
        },
        'full': {
          elementalBoost: { Water: 0.1 },
          culinaryTip: 'Solutions prepared during full moon enhance mineral absorption'
        }
      }
    },
    qualities: ['mineral-rich', 'grounding', 'purifying', 'alkalizing', 'preservative'],
    category: 'mineral salt',
    origin: ['Khewra Salt Mine', 'Punjab region', 'Pakistan', 'Himalayan foothills'],
    geologicalFormation: {
      age: 'Precambrian era, approximately 500-800 million years old',
      process: 'Ancient sea evaporation followed by tectonic activity and mineral infusion',
      depth: 'Mined from depths of 200-700 meters',
      composition: 'Primarily sodium chloride with trace minerals that create the characteristic pink color'
    },
    mineralContent: {
      primaryMinerals: {
        'sodium_chloride': '97-98%',
        'calcium': '0.16-0.52%',
        'potassium': '0.28-0.50%',
        'magnesium': '0.16-0.36%',
        'iron': '0.004-0.021%'
      },
      traceMinerals: [
        'zinc', 'copper', 'manganese', 'phosphorus', 'iodine', 
        'chromium', 'selenium', 'molybdenum', 'vanadium'
      ],
      totalTraceElements: 'Contains up to 84 different trace minerals'
    },
    varieties: {
      'fine': {
        name: 'Fine Ground',
        characteristics: 'Powdery texture, dissolves quickly',
        culinary_uses: 'Baking, seasoning during cooking, spice blends',
        notes: 'Most versatile for everyday cooking'
      },
      'medium': {
        name: 'Medium Ground',
        characteristics: 'Granular texture with moderate dissolution rate',
        culinary_uses: 'General cooking, table salt, brining',
        notes: 'Good balance between texture and function'
      },
      'coarse': {
        name: 'Coarse Ground',
        characteristics: 'Larger crystals with slow dissolution',
        culinary_uses: 'Salt crusts, rubs, finishing, salt grinders',
        notes: 'Provides textural element and visual appeal'
      },
      'blocks': {
        name: 'Salt Blocks / (Slabs || 1)',
        characteristics: 'Solid pieces used for cooking and serving',
        culinary_uses: 'Cooking surface, cold food presentation, salt plate cooking',
        notes: 'Imparts subtle mineral flavor to foods placed on it'
      },
      'flakes': {
        name: 'Salt Flakes',
        characteristics: 'Thin, delicate crystal structures',
        culinary_uses: 'Finishing salt, garnish, textural element',
        notes: 'Creates burst of flavor and visual appeal'
      }
    },
    colorProfiles: {
      'light_pink': 'Lower iron content, more subtle mineral flavor',
      'medium_pink': 'Standard variety, balanced mineral content',
      'deep_pink': 'Higher iron content, more pronounced mineral notes',
      'white_inclusions': 'Areas with higher sodium chloride concentration'
    },
    culinaryApplications: {
      'seasoning': {
        name: 'Basic Seasoning',
        methods: ['During cooking', 'Table salt', 'Pre-cooking application'],
        notes: 'More complex flavor profile than regular salt'
      },
      'curing': {
        name: 'Curing and Preservation',
        methods: ['Dry curing meats', 'Preserving fish', 'Fermentation processes'],
        traditional_applications: ['Gravlax', 'Charcuterie', 'Preserved lemons'],
        notes: 'Mineral content adds depth to preserved foods'
      },
      
      'finishing': {
        name: 'Finishing Salt',
        methods: ['Sprinkled over completed dishes', 'Visual garnish', 'Textural element'],
        ideal_pairings: ['Caramels', 'Dark chocolate', 'Grilled meats', 'Salads', 'Roasted vegetables'],
        notes: 'Use coarse grind or flakes for maximum visual and textural impact'
      },
      'salt_block_cooking': {
        name: 'Salt Block Cooking',
        methods: [
          'Heating block for cooking proteins directly on surface',
          'Chilling block for serving cold items',
          'Curing foods by contact'
        ],
        temperature_handling: 'Must be heated slowly to prevent cracking',
        maintenance: 'Clean with damp cloth, never use soap, air dry completely',
        notes: 'Imparts subtle mineral salinity and conducts heat effectively'
      },
      'brining': {
        name: 'Brining Solutions',
        methods: ['Wet brines for poultry and pork', 'Vegetable pickling', 'Cheese making'],
        ratio: 'Standard brine: 1 cup salt to 1 gallon water',
        enhancement_ingredients: ['Sugar', 'Herbs', 'Spices', 'Aromatics'],
        notes: 'Creates more complex mineral profile than table salt brines'
      },
      'specialty': {
        name: 'Specialty Applications',
        methods: [
          'Salt-crusted fish or meat',
          'Salt-roasted root vegetables',
          'Infused salt blends',
          'Cocktail rim salt'
        ]
      }
    },
    flavor: {
      'profile': 'Complex mineral with subtle earthy notes',
      'saltiness_level': 'Moderate to high depending on crystal size',
      'aftertatse': 'Lingering mineral complexity',
      'mouthfeel': 'Clean, smooth with varied texture based on grind',
      'comparison_to_regular_salt': 'Less sharp, more rounded flavor profile with mineral complexity'
    },
    nutritionalConsiderations: {
      'mineral_content': 'Higher in trace minerals than refined salt',
      'sodium_content': 'Approximately 98% sodium chloride, similar to table salt',
      'health_claims': {
        'regulated': 'No clinically proven therapeutic differences from regular salt',
        'traditional': [
          'Believed to be more balanced due to mineral content',
          'May contain slightly lower sodium by volume due to larger crystal structure',
          'Some practitioners suggest improved hydration from trace minerals'
        ]
      },
      'dietary_considerations': {
        'sodium_restriction': 'Should still be limited by those on sodium-restricted diets',
        'iodine_content': 'Contains some natural iodine but less than iodized salt',
        'additives': 'Free from anti-caking agents and additives found in table salt'
      }
    },
    traditionalUses: {
      'ayurvedic': {
        'properties': 'Considered warming and grounding',
        'applications': [
          'Digestive aid',
          'Electrolyte balance',
          'Used in "sole" water solutions'
        ]
      },
      'therapeutic': {
        'salt_rooms': 'Used in halotherapy for respiratory conditions',
        'salt_lamps': 'Believed to release negative ions when heated',
        'salt_baths': 'Used for skin conditions and relaxation'
      },
      'cultural': {
        'pakistani': 'Traditional preservative and cooking medium',
        'ritual_significance': 'Used in purification ceremonies',
        'gift_giving': 'Historically given as a valuable trade good'
      }
    },
    sustainability: {
      'mining_practices': {
        'traditional': 'Uses room and pillar mining techniques dating back centuries',
        'modern': 'Combination of hand extraction and mechanical methods',
        'environmental_impact': 'Lower impact than industrial salt production but concerns about over-extraction'
      },
      'alternatives': [
        'Sea salt for lower environmental footprint',
        'Local unrefined salts to reduce transportation emissions'
      ],
      'sourcing_considerations': 'Verify authentic sourcing from Khewra region due to prevalence of counterfeit products'
    },
    pairing: {
      'enhances': [
        'Dark chocolate',
        'Caramel',
        'Grilled meats',
        'Roasted vegetables',
        'Artisanal bread',
        'Fresh fruit (especially watermelon)'
      ],
      'contrasts': [
        'Sweet desserts',
        'Creamy dairy',
        'Bitter greens'
      ],
      'complements': [
        'Black pepper',
        'Lemon',
        'Fresh herbs',
        'Olive oil',
        'Aged cheeses'
      ]
    },
    culinaryTips: [
      'Use larger crystals as finishing salt for textural contrast',
      'Grind just before use for maximum flavor',
      'Heat salt blocks gradually to prevent cracking',
      'Consider the pink color when using in light-colored dishes',
      'Create signature salt blends with herbs and spices',
      'Try as a rimming salt for cocktails with subtle mineral notes'
    ],
    storage: {
      'conditions': 'Store in cool, dry place away from humidity',
      'containers': 'Ceramic, glass, or wooden containers preferred',
      'shelf_life': 'Indefinite when properly stored',
      'signs_of_quality': 'Should remain dry and free-flowing, no clumping',
      'salt_mills': 'Ceramic grinding mechanism recommended to prevent corrosion'
    }
  },

  'kosher_salt': {
    name: 'Kosher Salt',
    elementalProperties: { Earth: 0.6, Water: 0.2, Air: 0.1 , Fire: 0.1},
    qualities: ['clean', 'consistent', 'pure'],
    origin: ['Various'],
    category: 'salt',
    subCategory: 'cooking',
    varieties: {
      'Diamond Crystal': {
    name: 'Diamond Crystal',
        appearance: 'hollow pyramid flakes',
        texture: 'light, crushable',
        dissolution: 'quick',
        uses: 'professional kitchen standard'
      },
      'Morton': {
    name: 'Morton',
        appearance: 'dense flakes',
        texture: 'harder, compact',
        dissolution: 'moderate',
        uses: 'home cooking standard'
      }
    },
    culinaryApplications: {
      'cooking': {
    name: 'Cooking',
        method: 'pinch and sprinkle',
        timing: 'throughout cooking',
        applications: {
          'seasoning': 'meats before cooking',
          'pasta_water': '1 tbsp per quart',
          'baking': 'dough and batters'
        },
        conversion_ratios: {
          'table_salt': '1 tsp table = 1.25 tsp Morton = 2 tsp Diamond',
          'weight_based': '1 gram = 1 gram (any brand)'
        }
      },
      'koshering': {
    name: 'Koshering',
        method: 'coat meat surface',
        timing: '1 hour before cooking',
        process: [
          'apply salt liberally',
          'rest for 1 hour',
          'rinse thoroughly',
          'pat dry'
        ]
      }
    },
    storage: {
      temperature: 'room temperature',
      humidity: 'low',
      container: 'airtight container',
      notes: 'Very stable, no special requirements'
    }
  },

  'table_salt': {
    name: 'Table Salt',
    elementalProperties: { Earth: 0.7, Water: 0.1, Air: 0.1, Fire: 0.1 },
    qualities: ['basic', 'refined', 'uniform'],
    origin: ['Global'],
    category: 'seasoning',
    subCategory: 'salt',
    culinaryApplications: {
      'cooking': {
        name: 'Cooking',
        method: 'pinch and sprinkle',
        timing: 'throughout cooking',
        applications: {
          'seasoning': 'meats before cooking',
          'pasta_water': '1 tbsp per quart',
          'baking': 'dough and batters'
        },
        conversion_ratios: {
          'table_salt': '1 tsp table = 1.25 tsp Morton = 2 tsp Diamond',
          'weight_based': '1 gram = 1 gram (any brand)'
        }
      },
      'koshering': {
        name: 'Koshering',
        method: 'coat meat surface',
        timing: '1 hour before cooking',
        process: [
          'apply salt liberally',
          'rest for 1 hour',
          'rinse thoroughly',
          'pat dry'
        ]
      }
    },
    storage: {
      temperature: 'room temperature',
      humidity: 'low',
      container: 'airtight container',
      notes: 'Very stable, no special requirements'
    }
  }
};

// Fix the ingredient mappings to ensure they have all required properties
// ✅ Pattern MM-1: Type assertion for ZodiacSign[] compatibility
export const salts: Record<string, IngredientMapping> = fixIngredientMappings(rawSalts as Record<string, Partial<IngredientMapping>>);
