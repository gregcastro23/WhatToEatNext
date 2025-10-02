import type { IngredientMapping } from '@/data/ingredients/types';
import { fixIngredientMappings } from '@/utils/elementalUtils';

const rawDairy = {
  greek_yogurt: {
    name: 'Greek Yogurt',
    description: 'Strained yogurt with higher protein content and thick texture.',
    category: 'dairy',
    qualities: ['tangy', 'creamy', 'thick', 'protein-rich', 'versatile'],
    sustainabilityScore: 6,
    season: ['all'],
    regionalOrigins: ['mediterranean', 'middle_east'],
    elementalProperties: {
      Fire: 0.1,
      Water: 0.6,
      Earth: 0.2,
      Air: 0.1
},
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      zodiacInfluence: ['Cancer', 'Taurus'],
      celestialAspects: {
        moonPhase: {
          waxing: 'creamier texture, milder flavor',
          full: 'peak tanginess and thickness',
          waning: 'more digestible, gentler on system',
        }
      }
    },
    lunarPhaseModifiers: {
      'New Moon': {
        elementalBoost: {
          Water: 0.1,
          Earth: 0.1
},
        preparationTips: ['Best for starting new fermentation batches', 'Ideal for milder yogurt']
      },
      'Full Moon': {
        elementalBoost: {
          Water: 0.2
},
        preparationTips: ['Maximum tangy flavor development', 'Best probiotic activity']
      }
    },
    nutritionalProfile: {
      serving_size_oz: 6,
      calories: 100,
      protein_g: 17,
      fat_g: 0.7,
      carbs_g: 6.2,
      vitamins: ['Vitamin B12', 'Riboflavin', 'Vitamin B6'],
      minerals: ['Calcium', 'Phosphorus', 'Zinc', 'Selenium', 'Potassium']
    },
    healthBenefits: {
      'gut health': 'Contains beneficial probiotics that support digestive health',
      'protein source': 'High-quality complete protein for muscle maintenance',
      'bone strength': 'Rich calcium content supports skeletal structure',
      satiety: 'High protein content increases feeling of fullness',
      'blood sugar': 'Lower glycemic impact than regular yogurt',
    },
    varieties: {
      'non-fat': {
        texture: 'Less creamy, slightly more tangy',
        moisture: 'Lower',
        protein: 'Highest',
        uses: 'Weight management, higher protein needs',
        notes: 'Can be slightly grainy in texture'
},
      '2% fat': {
        texture: 'Balanced creaminess and tang',
        moisture: 'Medium',
        protein: 'High',
        uses: 'All-purpose, good balance of flavor and nutrition',
        notes: 'Most versatile variety'
},
      'full-fat': {
        texture: 'Creamiest, smoothest',
        moisture: 'Medium-high',
        protein: 'Moderate',
        uses: 'Rich applications, cooking stability',
        notes: 'Best for cooking as less likely to separate'
},
      strained: {
        texture: 'Extra thick, almost cheese-like',
        moisture: 'Low',
        protein: 'Very high',
        uses: 'Labneh-style spreads, ultra-rich applications',
        notes: 'Can be hung in cheesecloth for even thicker result'
}
    },
    culinaryApplications: {
      raw: {
        notes: ['Base for breakfast bowls', 'Topping for savory dishes'],
        techniques: ['Top with honey and nuts', 'Layer with granola and fruit'],
        dishes: ['Breakfast parfaits', 'Fruit bowls', 'Topped soups']
      },
      mix: {
        notes: ['Base for dips and sauces', 'Used in marinades'],
        techniques: ['Blend with herbs and garlic', 'Whisk until smooth before incorporating'],
        dishes: ['Tzatziki', 'Creamy herb dips', 'Protein smoothies', 'Marinades for chicken']
      },
      bake: {
        notes: ['Adds moisture to baked goods', 'Can replace sour cream or oil'],
        techniques: [
          'Bring to room temperature before baking',
          'Use in place of buttermilk (thicker result)'
        ],
        dishes: ['Muffins', 'Quick breads', 'Pancakes', 'Cakes']
      },
      cook: {
        notes: [
          'Use higher fat content for cooking stability',
          'Add at end of cooking or will separate'
        ],
        techniques: [
          'Temper with hot ingredients to prevent curdling',
          'Stabilize with cornstarch for high heat'
        ],
        dishes: ['Creamy sauces', 'Stroganoff', 'Indian curry finisher']
      }
    },
    preparation: {
      homemade: {
        ingredients: ['Whole milk', 'Live cultures', 'Time'],
        process: 'Heat milk, cool slightly, add culture, incubate, strain through cheesecloth',
        tips: ['Longer straining creates thicker yogurt', 'Save whey for other applications']
      },
      storebought: {
        selection: 'Choose without added thickeners for purest flavor',
        preparation: 'Stir before using if separation has occurred'
}
    },
    storage: {
      container: 'Glass or original container',
      duration: '1-2 weeks refrigerated',
      temperature: {
        fahrenheit: 38,
        celsius: 3.3
},
      notes: 'May continue to increase in tanginess over time'
},
    culturalSignificance: {
      middle_eastern: {
        role: 'Traditional breakfast component and sauce base',
        pairings: 'Olive oilza'atar, honey, nuts',
        dishes: 'Labneh, breakfast spreads',
      },
      'modern health': {
        role: 'Protein-rich alternative to higher-fat dairy',
        adaptations: 'Protein bowls, smoothies, healthier baking',
      }
    },
    affinities: {
      sweet: ['honey', 'maple syrup', 'berries', 'stone fruits', 'granola', 'nuts'],
      savory: ['cucumber', 'mint', 'dill', 'garlic', 'olive oil', 'lemon']
    },
    pairings: ['honey', 'berries', 'nuts', 'cucumber', 'garlic', 'dill', 'mint', 'olive oil'],
    substitutions: ['labneh', 'skyr', 'cottage_cheese', 'thick_coconut_yogurt'],
    idealSeasonings: {
      sweet: ['vanilla', 'cinnamon', 'cardamom', 'honey', 'maple'],
      savory: ['dill', 'mint', 'za'atar', 'sumac', 'black pepper', 'lemon zest']
    }
  },
  cottage_cheese: {
    name: 'Cottage Cheese',
    description: 'Fresh cheese curd product with mild flavor and varying textures.',
    category: 'dairy',
    qualities: ['mild', 'soft', 'fresh', 'protein-rich', 'versatile'],
    sustainabilityScore: 5,
    season: ['all'],
    regionalOrigins: ['europe', 'north_america'],
    elementalProperties: {
      Fire: 0.1,
      Water: 0.5,
      Earth: 0.3,
      Air: 0.1
},
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      zodiacInfluence: ['Taurus', 'Cancer'],
      celestialAspects: {
        moonPhase: {
          waxing: 'enhanced moisture and softness',
          full: 'optimal curd formation and flavor',
          waning: 'drier texture, easier digestion',
        }
      }
    },
    lunarPhaseModifiers: {
      'New Moon': {
        elementalBoost: {
          Water: 0.15,
          Earth: 0.05
},
        preparationTips: ['Best for starting fresh batches', 'More delicate curds form']
      },
      'Full Moon': {
        elementalBoost: {
          Water: 0.1,
          Earth: 0.1
},
        preparationTips: ['Optimal curd formation', 'Best flavor development']
      }
    },
    nutritionalProfile: {
      serving_size_oz: 4,
      calories: 110,
      protein_g: 12,
      fat_g: 5,
      carbs_g: 3,
      vitamins: ['Vitamin B12', 'Riboflavin', 'Vitamin A'],
      minerals: ['Calcium', 'Phosphorus', 'Selenium', 'Sodium']
    },
    healthBenefits: {
      'muscle support': 'Rich source of casein protein for slow-release amino acids',
      'bone health': 'Excellent calcium source for skeletal maintenance',
      satiety: 'High protein and moderate fat content increases fullness',
      metabolism: 'Contains conjugated linoleic acid (CLA) in full-fat versions',
      recovery: 'Popular among athletes for post-workout recovery'
},
    varieties: {
      'small curd': {
        texture: 'Smaller, more uniform pieces',
        moisture: 'Medium',
        protein: 'Standard',
        uses: 'Baking, dips, smoother applications',
        notes: 'More versatile for recipes requiring uniform texture'
},
      'large curd': {
        texture: 'Larger, more defined pieces',
        moisture: 'Medium',
        protein: 'Standard',
        uses: 'Direct eating, where texture is desirable',
        notes: 'Traditional style, more 'rustic' appearance'
      },
      'dry curd': {
        texture: 'Low moisture, distinctly separate curds',
        moisture: 'Low',
        protein: 'High',
        uses: 'Baking, lactose-sensitive diets',
        notes: 'Lowest lactose content, least smooth',
      },
      whipped: {
        texture: 'Smoother, more blended consistency',
        moisture: 'Medium-high',
        protein: 'Standard',
        uses: 'Spreads, dips, smoother applications',
        notes: 'Easier to incorporate into recipes'
}
    },
    culinaryApplications: {
      raw: {
        notes: ['Eaten plain or with fruits', 'Base for protein-rich snacks'],
        techniques: ['Drizzle with honey or fruit', 'Top with cracked black pepper and herbs'],
        dishes: ['Cottage cheese bowls', 'Stuffed avocados', 'Protein snack plates']
      },
      mix: {
        notes: ['Added to salads', 'Used in dips', 'Blended for smoother applications'],
        techniques: [
          'Fold gently to maintain texture',
          'Pulse in food processor for smoother consistency'
        ],
        dishes: ['Vegetable dips', 'Protein-enriched sauces', 'Waldorf salad variation']
      },
      bake: {
        notes: [
          'Filling for crepes',
          'Added to casseroles and lasagna',
          'Moisture-adding ingredient'
        ],
        techniques: ['Drain excess moisture for baking', 'Mix with eggs for structure'],
        dishes: ['Cottage cheese pancakes', 'Cheesecake', 'Lasagna filling', 'Protein bread']
      },
      blend: {
        notes: ['Can be blended smooth for variety of uses', 'Adds creaminess without heavy fat'],
        techniques: [
          'Blend until completely smooth',
          'Mix with other ingredients for desired consistency'
        ],
        dishes: ['Protein smoothies', 'Creamy dressings', 'Healthier 'cream' sauces']
      }
    },
    preparation: {
      homemade: {
        ingredients: ['Whole milk', 'Acid (vinegar or lemon juice)', 'Salt'],
        process: 'Heat milk, add acid, allow curds to form, drain and rinse',
        tips: ['Rinse curds thoroughly to control saltiness', 'Save whey for baking applications']
      },
      storebought: {
        selection: 'Check date codes, avoid excessive liquid',
        preparation: 'Drain excess liquid if desired'
}
    },
    storage: {
      container: 'Original container or airtight glass',
      duration: '5-7 days refrigerated',
      temperature: {
        fahrenheit: 38,
        celsius: 3.3
},
      notes: 'Texture and flavor best when fresh, tends to sour rather than spoil',
    },
    culturalSignificance: {
      european: {
        role: 'Traditional fresh cheese in many cuisines',
        pairings: 'Fresh herbs, black pepper, fruit preserves',
        dishes: 'Blintzes, pierogi filling, breakfast dishes',
      },
      american: {
        role: 'Diet food popularized in mid-20th century',
        pairings: 'Canned fruit, gelatin salads, crackers',
        dishes: '1950s 'diet plates', retro salads'
      },
      'modern health': {
        role: 'Rediscovered as high-protein, whole food',
        adaptations: 'Protein bowls, savory applications, healthy baking ingredient',
      }
    },
    affinities: {
      sweet: ['peaches', 'pineapple', 'berries', 'honey', 'cinnamon', 'nutmeg'],
      savory: ['tomatoes', 'cucumbers', 'bell peppers', 'herbs', 'olive oil', 'black pepper']
    },
    pairings: ['peaches', 'pineapple', 'tomatoes', 'herbs', 'pepper', 'everything bagel seasoning'],
    substitutions: ['ricotta', 'greek_yogurt', 'quark', 'fromage blanc'],
    idealSeasonings: {
      sweet: ['cinnamon', 'vanilla', 'nutmeg', 'maple', 'honey'],
      savory: ['chives', 'black pepper', 'dill', 'garlic powder', 'everything bagel seasoning']
    }
  },
  ricotta: {
    name: 'Ricotta',
    description:
      'Soft, mild Italian whey cheese with small, fluffy curds and versatile applications.',
    category: 'dairy',
    qualities: ['mild', 'creamy', 'sweet', 'delicate', 'versatile'],
    sustainabilityScore: 6,
    season: ['all'],
    regionalOrigins: ['italy', 'mediterranean'],
    elementalProperties: {
      Fire: 0.1,
      Water: 0.5,
      Earth: 0.3,
      Air: 0.1
},
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      zodiacInfluence: ['Cancer', 'Taurus'],
      celestialAspects: {
        moonPhase: {
          waxing: 'increased moisture and softness',
          full: 'optimal texture and sweetness',
          waning: 'slightly drier, more complex flavor',
        }
      }
    },
    lunarPhaseModifiers: {
      'New Moon': {
        elementalBoost: {
          Water: 0.2
},
        preparationTips: ['Best for beginning cheese making', 'Creates most delicate texture']
      },
      'Full Moon': {
        elementalBoost: {
          Water: 0.1,
          Earth: 0.1
},
        preparationTips: ['Best flavor development', 'Optimal milk protein composition']
      }
    },
    nutritionalProfile: {
      serving_size_oz: 4,
      calories: 164,
      protein_g: 11,
      fat_g: 12,
      carbs_g: 4,
      vitamins: ['Vitamin A', 'Vitamin B12', 'Riboflavin'],
      minerals: ['Calcium', 'Phosphorus', 'Selenium', 'Zinc']
    },
    healthBenefits: {
      'protein source': 'Complete protein with all essential amino acids',
      'bone health': 'High calcium content supports skeletal strength',
      digestibility: 'Easier to digest than aged cheeses',
      'muscle recovery': 'Provides branched-chain amino acids',
      satiety: 'Balance of protein and fat increases fullness'
},
    varieties: {
      'whole milk': {
        texture: 'Richest, creamiest',
        moisture: 'High',
        fat: 'High',
        uses: 'Desserts, traditional dishes, eating plain',
        notes: 'Traditional and most flavorful variety'
},
      'part-skim': {
        texture: 'Slightly less creamy, more distinct curds',
        moisture: 'Medium-high',
        fat: 'Medium',
        uses: 'All-purpose, balanced nutrition and flavor',
        notes: 'Most commonly available commercial variety'
},
      'sheep milk': {
        texture: 'Rich, distinctive',
        moisture: 'Medium',
        fat: 'High',
        uses: 'Specialty applications, authentic Italian dishes',
        notes: 'Traditional ricotta type with more complex flavor'
},
      'buffalo milk': {
        texture: 'Very rich, creamy',
        moisture: 'High',
        fat: 'Very high',
        uses: 'Premium applications, special dishes',
        notes: 'Luxury variant, most often in southern Italy',
      }
    },
    culinaryApplications: {
      raw: {
        notes: ['Served with honey or fruit', 'Spread on bread or toast'],
        techniques: ['Drizzle with good olive oil and sea salt', 'Top with fresh herbs and pepper'],
        dishes: ['Crostini', 'Bruschetta', 'Fresh fruit accompaniment']
      },
      mix: {
        notes: ['Mixed into pasta dishes', 'Combined with herbs for fillings'],
        techniques: ['Room temperature incorporation', 'Gently fold to maintain texture'],
        dishes: ['Pasta alla Norma', 'Dips', 'Herb spreads']
      },
      bake: {
        notes: ['Classic ingredient in lasagna', 'Italian desserts', 'Cheesecake'],
        techniques: [
          'Drain excess moisture for some applications',
          'Mix with egg for structure in baking'
        ],
        dishes: ['Lasagna', 'Cannoli filling', 'Cassata', 'Cheesecake']
      },
      stuff: {
        notes: ['Traditional filling for pasta and pastries', 'Holds shape when baked'],
        techniques: ['Mix with eggs for stability', 'Combine with other cheeses for depth'],
        dishes: ['Ravioli', 'Manicotti', 'Stuffed shells', 'Calzone']
      }
    },
    preparation: {
      homemade: {
        ingredients: [
          'Whole milk',
          'Heavy cream (optional)',
          'Acid (vinegar, lemon juiceor buttermilk)'
        ],
        process: 'Heat milk, add acid, let curds form, drain in cheesecloth',
        tips: ['Higher fat content creates creamier cheese', 'Save whey for bread making or soup']
      },
      storebought: {
        selection: 'Choose from refrigerated section, avoid shelf-stable varieties for best flavor',
        preparation: 'Drain excess liquid before using in recipes requiring firmer texture'
}
    },
    storage: {
      container: 'Original container or airtight glass',
      duration: '5-7 days refrigerated',
      temperature: {
        fahrenheit: 38,
        celsius: 3.3
},
      notes: 'Best used fresh, texture deteriorates over time',
    },
    culturalSignificance: {
      sicilian: {
        role: 'Key ingredient in traditional desserts',
        pairings: 'Chocolate, pistachios, candied fruit, cinnamon',
        dishes: 'Cassata, cannoli, Sicilian cheesecake',
      },
      modern: {
        role: 'Versatile low-sodium cheese in contemporary cooking',
        adaptations: 'Protein-rich breakfast component, sandwich spread, dip base',
      }
    },
    affinities: {
      sweet: ['honey', 'figs', 'berries', 'chocolate', 'citrus zest', 'vanilla'],
      savory: ['tomatoes', 'spinach', 'basil', 'garlic', 'olive oil', 'lemon']
    },
    pairings: ['honey', 'olive_oil', 'herbs', 'lemon_zest', 'tomato_sauce', 'spinach', 'pasta'],
    substitutions: ['cottage_cheese', 'cream_cheese', 'mascarpone', 'quark'],
    idealSeasonings: {
      sweet: ['vanilla', 'cinnamon', 'orange zest', 'honey', 'pistachios'],
      savory: ['basil', 'black pepper', 'lemon zest', 'red pepper flakes', 'parsley']
    }
  },
  cream_cheese: {
    name: 'Cream Cheese',
    description: 'Soft, spreadable fresh cheese with mild flavor and smooth texture.',
    category: 'dairy',
    qualities: ['creamy', 'tangy', 'smooth', 'spreadable', 'rich'],
    sustainabilityScore: 4,
    season: ['all'],
    regionalOrigins: ['united_states', 'europe'],
    elementalProperties: {
      Fire: 0.1,
      Water: 0.4,
      Earth: 0.4,
      Air: 0.1
},
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Moon'],
      zodiacInfluence: ['Taurus', 'Cancer', 'Libra'],
      celestialAspects: {
        moonPhase: {
          waxing: 'creamier texture, milder flavor',
          full: 'perfect balance of richness and tang',
          waning: 'more pronounced tanginess'
}
      }
    },
    lunarPhaseModifiers: {
      'New Moon': {
        elementalBoost: {
          Water: 0.1,
          Earth: 0.1
},
        preparationTips: ['Best for starting fresh batches', 'Creates milder flavor profile']
      },
      'Full Moon': {
        elementalBoost: {
          Earth: 0.2
},
        preparationTips: ['Optimal richness and texture', 'Best structure for baking']
      }
    },
    nutritionalProfile: {
      serving_size_oz: 2,
      calories: 200,
      protein_g: 4,
      fat_g: 20,
      carbs_g: 2,
      vitamins: ['Vitamin A', 'Vitamin B12', 'Riboflavin'],
      minerals: ['Calcium', 'Phosphorus', 'Selenium']
    },
    healthBenefits: {
      'energy dense': 'Provides concentrated calories from fat',
      'fat-soluble vitamins': 'Contains vitamins A and D',
      'calcium source': 'Contributes to daily calcium needs',
      satiety: 'High fat content increases feeling of fullness'
},
    varieties: {
      'full-fat': {
        texture: 'Richest, creamiest',
        moisture: 'Medium-high',
        fat: 'High (33%+)',
        uses: 'Cheesecake, frostings, traditional applications',
        notes: 'Best flavor and baking performance'
},
      'reduced-fat': {
        texture: 'Slightly less creamy, softer',
        moisture: 'High',
        fat: 'Medium',
        uses: 'Everyday spreading, lighter applications',
        notes: 'Common supermarket variety'
},
      whipped: {
        texture: 'Lighter, fluffier',
        moisture: 'Medium',
        fat: 'Medium-high',
        uses: 'Spreading, dipping, when lighter texture desired',
        notes: 'Incorporates air, easier to spread cold',
      },
      cultured: {
        texture: 'Traditional, more complex',
        moisture: 'Medium',
        fat: 'High',
        uses: 'Gourmet applications, artisanal preparations',
        notes: 'More traditional method with complex flavor'
}
    },
    culinaryApplications: {
      spread: {
        notes: ['Classic bagel topping', 'Base for sandwiches and wraps'],
        techniques: ['Allow to soften before spreading', 'Layer thinly for best flavor'],
        dishes: ['Bagels and lox', 'Tea sandwiches', 'Canapés']
      },
      mix: {
        notes: ['Base for dips and spreads', 'Mix with herbs or honey for flavored spread'],
        techniques: ['Room temperature for easiest mixing', 'Use paddle attachment not whisk'],
        dishes: ['Veggie dip', 'Herb spread', 'Flavored compound spreads']
      },
      bake: {
        notes: ['Essential for cheesecake', 'Structure-adding ingredient for desserts'],
        techniques: ['Room temperature for baking', 'Beat until smooth but don't overbeat'],
        dishes: ['Cheesecake', 'Danishes', 'Puffs', 'Sweet rolls']
      },
      cook: {
        notes: ['Creates creamy sauces', 'Thickens without flour or cornstarch'],
        techniques: ['Add at end of cooking', 'Low heat to prevent separation'],
        dishes: ['Creamy pasta sauces', 'Mashed potatoes', 'Creamed spinach']
      }
    },
    preparation: {
      homemade: {
        ingredients: ['Whole milk', 'Heavy cream', 'Acid (lemon juice or vinegar)', 'Salt'],
        process: 'Heat dairy, add acid, strain, then blend until smooth',
        tips: [
          'Longer straining creates firmer texture',
          'Adding culture develops more complex flavor'
        ]
      },
      storebought: {
        selection: 'Choose block style for baking, whipped for spreading',
        preparation: 'Bring to room temperature before using in recipes'
}
    },
    storage: {
      container: 'Original foil wrapper or airtight container',
      duration: '2 weeks refrigerated unopened, 1 week once opened',
      temperature: {
        fahrenheit: 38,
        celsius: 3.3
},
      notes: 'Can be frozen for up to 2 months but texture may change'
},
    culturalSignificance: {
      american: {
        role: 'Iconic breakfast spread popularized in New York',
        pairings: 'Bagels, lox, capers, red onion, tomato',
        dishes: 'Cheesecake, cream cheese frosting, dips',
      },
      european: {
        role: 'Traditional fresh cheese in many regional varieties',
        pairings: 'Herbs, fruits, honey, nuts',
        dishes: 'Pastries, tarts, savory spreads',
      },
      modern: {
        role: 'Versatile ingredient in contemporary cooking and baking',
        adaptations: 'Vegan alternatives, flavored varieties, as cooking ingredient',
      }
    },
    affinities: {
      sweet: ['berries', 'honey', 'vanilla', 'chocolate', 'cinnamon', 'caramel'],
      savory: ['chives', 'garlic', 'dill', 'smoked salmon', 'cucumber', 'olive']
    },
    pairings: ['bagel', 'berries', 'honey', 'smoked_salmon', 'herbs', 'cucumber', 'walnuts'],
    substitutions: ['mascarpone', 'ricotta', 'neufchatel', 'quark', 'greek_yogurt'],
    idealSeasonings: {
      sweet: ['vanilla', 'cinnamon', 'orange zest', 'honey', 'maple'],
      savory: ['chives', 'dill', 'garlic powder', 'everything bagel seasoning', 'black pepper']
    }
  },
  milk: {
    name: 'milk',
    elementalProperties: { Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2 },
    qualities: ['calcium-rich', 'creamy', 'versatile'],
    category: 'dairy',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['Cancer', 'Taurus', 'Pisces'],
      seasonalAffinity: ['all']
    }
  },
  buttermilk: {
    name: 'buttermilk',
    elementalProperties: { Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2 },
    qualities: ['calcium-rich', 'creamy', 'versatile'],
    category: 'dairy',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['Cancer', 'Taurus', 'Pisces'],
      seasonalAffinity: ['all']
    }
  },
  butter: {
    name: 'butter',
    elementalProperties: { Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2 },
    qualities: ['calcium-rich', 'creamy', 'versatile'],
    category: 'dairy',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['Cancer', 'Taurus', 'Pisces'],
      seasonalAffinity: ['all']
    }
  },
  goat_cheese: {
    name: 'goat cheese',
    elementalProperties: { Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2 },
    qualities: ['calcium-rich', 'creamy', 'versatile'],
    category: 'dairy',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['Cancer', 'Taurus', 'Pisces'],
      seasonalAffinity: ['all']
    }
  },
  cheddar_cheese: {
    name: 'cheddar cheese',
    elementalProperties: { Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2 },
    qualities: ['calcium-rich', 'creamy', 'versatile'],
    category: 'dairy',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['Cancer', 'Taurus', 'Pisces'],
      seasonalAffinity: ['all']
    }
  },
  blue_cheese: {
    name: 'blue cheese',
    elementalProperties: { Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2 },
    qualities: ['calcium-rich', 'creamy', 'versatile'],
    category: 'dairy',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['Cancer', 'Taurus', 'Pisces'],
      seasonalAffinity: ['all']
    }
  },
  heavy_cream: {
    name: 'heavy cream',
    elementalProperties: { Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2 },
    qualities: ['calcium-rich', 'creamy', 'versatile'],
    category: 'dairy',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['Cancer', 'Taurus', 'Pisces'],
      seasonalAffinity: ['all']
    }
  },
  sour_cream: {
    name: 'sour cream',
    elementalProperties: { Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2 },
    qualities: ['calcium-rich', 'creamy', 'versatile'],
    category: 'dairy',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['Cancer', 'Taurus', 'Pisces'],
      seasonalAffinity: ['all']
    }
  },
  cold_butter: {
    name: 'cold butter',
    elementalProperties: { Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2 },
    qualities: ['calcium-rich', 'creamy', 'versatile'],
    category: 'dairy',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['Cancer', 'Taurus', 'Pisces'],
      seasonalAffinity: ['all']
    }
  },
  parmesan: {
    name: 'parmesan',
    elementalProperties: { Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2 },
    qualities: ['calcium-rich', 'creamy', 'versatile'],
    category: 'dairy',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['Cancer', 'Taurus', 'Pisces'],
      seasonalAffinity: ['all']
    }
  },
  chocolate_ice_cream: {
    name: 'chocolate ice cream',
    elementalProperties: { Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2 },
    qualities: ['calcium-rich', 'creamy', 'versatile'],
    category: 'dairy',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['Cancer', 'Taurus', 'Pisces'],
      seasonalAffinity: ['all']
    }
  },
  evaporated_milk: {
    name: 'evaporated milk',
    elementalProperties: { Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2 },
    qualities: ['calcium-rich', 'creamy', 'versatile'],
    category: 'dairy',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['Cancer', 'Taurus', 'Pisces'],
      seasonalAffinity: ['all']
    }
  },
  butter_croissant: {
    name: 'butter croissant',
    elementalProperties: { Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2 },
    qualities: ['calcium-rich', 'creamy', 'versatile'],
    category: 'dairy',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['Cancer', 'Taurus', 'Pisces'],
      seasonalAffinity: ['all']
    }
  },
  french_butter: {
    name: 'French butter',
    elementalProperties: { Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2 },
    qualities: ['calcium-rich', 'creamy', 'versatile'],
    category: 'dairy',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['Cancer', 'Taurus', 'Pisces'],
      seasonalAffinity: ['all']
    }
  },
  whole_milk: {
    name: 'whole milk',
    elementalProperties: { Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2 },
    qualities: ['calcium-rich', 'creamy', 'versatile'],
    category: 'dairy',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['Cancer', 'Taurus', 'Pisces'],
      seasonalAffinity: ['all']
    }
  },
  unsalted_butter: {
    name: 'unsalted butter',
    elementalProperties: { Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2 },
    qualities: ['calcium-rich', 'creamy', 'versatile'],
    category: 'dairy',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['Cancer', 'Taurus', 'Pisces'],
      seasonalAffinity: ['all']
    }
  },
  clarified_butter: {
    name: 'clarified butter',
    elementalProperties: { Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2 },
    qualities: ['calcium-rich', 'creamy', 'versatile'],
    category: 'dairy',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['Cancer', 'Taurus', 'Pisces'],
      seasonalAffinity: ['all']
    }
  },
  gruy_re_cheese: {
    name: 'Gruyère cheese',
    elementalProperties: { Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2 },
    qualities: ['calcium-rich', 'creamy', 'versatile'],
    category: 'dairy',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['Cancer', 'Taurus', 'Pisces'],
      seasonalAffinity: ['all']
    }
  },
  vanilla_ice_cream: {
    name: 'vanilla ice cream',
    elementalProperties: { Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2 },
    qualities: ['calcium-rich', 'creamy', 'versatile'],
    category: 'dairy',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['Cancer', 'Taurus', 'Pisces'],
      seasonalAffinity: ['all']
    }
  },
  yogurt: {
    name: 'yogurt',
    elementalProperties: { Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2 },
    qualities: ['calcium-rich', 'creamy', 'versatile'],
    category: 'dairy',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['Cancer', 'Taurus', 'Pisces'],
      seasonalAffinity: ['all']
    }
  },
  mozzarella: {
    name: 'mozzarella',
    elementalProperties: { Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2 },
    qualities: ['calcium-rich', 'creamy', 'versatile'],
    category: 'dairy',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['Cancer', 'Taurus', 'Pisces'],
      seasonalAffinity: ['all']
    }
  },
};

// Fix the ingredient mappings to ensure they have all required properties
export const, dairy: Record<string, IngredientMapping> = fixIngredientMappings(rawDairy);
