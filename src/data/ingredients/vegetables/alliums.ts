import type { IngredientMapping } from '@/data/ingredients/types';
import { fixIngredientMappings } from '@/utils/elementalUtils';

const rawAlliums = {
  garlic: {
    name: 'Garlic',
    elementalProperties: { Fire: 0.6, Air: 0.2, Earth: 0.1, Water: 0.1 }
    astrologicalProfile: {
      rulingPlanets: ['Mars', 'Pluto'],
      favorableZodiac: ['aries', 'scorpio'],
      elementalAffinity: {
        base: 'Fire',
        decanModifiers: {
          first: { element: 'Fire', planet: 'Mars' }
          second: { element: 'Earth', planet: 'Pluto' }
          third: { element: 'Air', planet: 'Mercury' }
        }
        lunarPhaseModifiers: {
          newMoon: {
            elementalBoost: { Fire: 0.1, Earth: 0.05 }
            preparationTips: ['Best for medicinal preparations', 'Raw applications enhanced']
          }
          fullMoon: {
            elementalBoost: { Fire: 0.2 }
            preparationTips: ['Roasted garlic develops deeper flavor', 'Fermentation enhanced']
          }
          waxingGibbous: {
            elementalBoost: { Fire: 0.15, Air: 0.05 }
            preparationTips: [
              'Excellent for infusion into oils',
              'Enhanced preservation properties'
            ]
          }
        }
      }
    }
    qualities: ['warming', 'pungent', 'drying', 'protective', 'cleansing'],
    season: ['all'],
    category: 'vegetable',
    subCategory: 'allium',
    affinities: ['olive oil', 'herbs', 'ginger', 'chili', 'lemon', 'tomato', 'mushrooms', 'wine'],
    cookingMethods: ['roasted', 'sautéed', 'raw', 'confit', 'fermented', 'smoked', 'pickled'],
    nutritionalProfile: {
      vitamins: ['c', 'b6', 'b1', 'manganese'],
      minerals: ['manganese', 'selenium', 'calcium', 'phosphorus', 'copper'],
      calories: 4,
      protein_g: 0.2,
      carbs_g: 1,
      fiber_g: 0.1,
      medicinalProperties: ['allicin', 'antioxidants', 'organosulfur compounds'],
      immune_support: 'very high',
      heart_health: 'supportive',
      antimicrobial: 'potent'
    }
    preparation: {
      peeling: true,
      crushing: 'releases more compounds',
      resting: '10-15 minutes after cutting for maximum allicin development',
      notes: 'Different cutting methods alter flavor intensity',
      microplaning: 'creates paste-like consistency',
      pressing: 'more gentle than crushing',
      pre_roasting: 'leave head intact, cut top, drizzle with oil'
    }
    varieties: {
      hardneck: {
        characteristics: 'harder central stem, fewer but larger cloves',
        flavor: 'complex, often spicier, better for raw applications',
        storage: 'shorter shelf life3-4 months',
        popular_types: ['Rocambole', 'Purple Stripe', 'Porcelain'],
        sensoryProfile: {
          taste: ['Mild', 'Balanced', 'Natural'],
          aroma: ['Fresh', 'Clean', 'Subtle'],
          texture: ['Pleasant', 'Smooth', 'Appealing'],
          notes: 'Characteristic hardneck profile',
          culinaryProfile: {
            flavorProfile: {
              primary: ['balanced'],
              secondary: ['versatile'],
              notes: 'Versatile hardneck for various uses',
              sensoryProfile: {
                taste: ['Mild', 'Balanced', 'Natural'],
                aroma: ['Fresh', 'Clean', 'Subtle'],
                texture: ['Pleasant', 'Smooth', 'Appealing'],
                notes: 'Characteristic flavorProfile profile',
                // Removed excessive sensoryProfile nesting
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
                }
                culinaryProfile: {
                  flavorProfile: {
                    primary: ['balanced'],
                    secondary: ['versatile'],
                    notes: 'Versatile flavorProfile for various uses'
                  }
                  cookingMethods: ['sautéing', 'steaming', 'roasting'],
                  cuisineAffinity: ['Global', 'International'],
                  preparationTips: ['Use as needed', 'Season to taste']
                }
                season: ['year-round']
              }
              culinaryProfile: {
                flavorProfile: {
                  primary: ['balanced'],
                  secondary: ['versatile'],
                  notes: 'Versatile flavorProfile for various uses'
                }
                cookingMethods: ['sautéing', 'steaming', 'roasting'],
                cuisineAffinity: ['Global', 'International'],
                preparationTips: ['Use as needed', 'Season to taste']
              }
              season: ['year-round']
            }
            cookingMethods: ['sautéing', 'steaming', 'roasting'],
            cuisineAffinity: ['Global', 'International'],
            preparationTips: ['Use as needed', 'Season to taste']
          }
          season: ['year-round'],
          preparation: {
            methods: ['standard preparation'],
            timing: 'as needed',
            notes: 'Standard preparation for hardneck'
          }
        }
        culinaryProfile: {
          flavorProfile: {
            primary: ['balanced'],
            secondary: ['versatile'],
            notes: 'Versatile hardneck for various uses'
          }
          cookingMethods: ['sautéing', 'steaming', 'roasting'],
          cuisineAffinity: ['Global', 'International'],
          preparationTips: ['Use as needed', 'Season to taste']
        }
        season: ['year-round']
      }
      softneck: {
        characteristics: 'no rigid center stem, more but smaller cloves',
        flavor: 'milder, better for everyday cooking',
        storage: 'longer shelf life6-9 months',
        popular_types: ['Artichoke', 'Silverskin', 'California Early', 'California Late'],
        // Removed excessive sensoryProfile nesting
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
        }
        culinaryProfile: {
          flavorProfile: {
            primary: ['balanced'],
            secondary: ['versatile'],
            notes: 'Versatile softneck for various uses'
          }
          cookingMethods: ['sautéing', 'steaming', 'roasting'],
          cuisineAffinity: ['Global', 'International'],
          preparationTips: ['Use as needed', 'Season to taste']
        }
        season: ['year-round']
      }
      black: {
        characteristics: 'aged through fermentation, black cloves',
        flavor: 'sweet, umami, balsamic-like with mild garlic flavor',
        origin: 'Asian cuisines, particularly Korean',
        uses: 'specialty applications, high-end cuisine',
        // Removed excessive sensoryProfile nesting
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
        }
        culinaryProfile: {
          flavorProfile: {
            primary: ['balanced'],
            secondary: ['versatile'],
            notes: 'Versatile black for various uses'
          }
          cookingMethods: ['sautéing', 'steaming', 'roasting'],
          cuisineAffinity: ['Global', 'International'],
          preparationTips: ['Use as needed', 'Season to taste']
        }
        season: ['year-round']
      }
      elephant: {
        characteristics: 'very large cloves, not true garlic (closer to leek)',
        flavor: 'mild, less pungent than regular garlic',
        cooking: 'good for roasting or where mild flavor is wanted',
        notes: 'technically different species (Allium ampeloprasum)',
        // Removed excessive sensoryProfile nesting
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
        }
        culinaryProfile: {
          flavorProfile: {
            primary: ['balanced'],
            secondary: ['versatile'],
            notes: 'Versatile elephant for various uses'
          }
          cookingMethods: ['sautéing', 'steaming', 'roasting'],
          cuisineAffinity: ['Global', 'International'],
          preparationTips: ['Use as needed', 'Season to taste']
        }
        season: ['year-round']
      }
    }
    culinaryApplications: {
      roasted: {
        method: 'whole head with top cut off, wrapped in foil with oil',
        temperature: { fahrenheit: 400, celsius: 200 }
        timing: '40-60 minutes until soft and caramelized',
        uses: ['spreads', 'mashed potatoes', 'soups', 'sauces'],
        notes: 'transforms harsh flavor to sweet and nutty',
        // Removed excessive sensoryProfile nesting
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
        }
        culinaryProfile: {
          flavorProfile: {
            primary: ['balanced'],
            secondary: ['versatile'],
            notes: 'Versatile roasted for various uses'
          }
          cookingMethods: ['sautéing', 'steaming', 'roasting'],
          cuisineAffinity: ['Global', 'International'],
          preparationTips: ['Use as needed', 'Season to taste']
        }
        season: ['year-round']
      }
      confit: {
        method: 'slow cook peeled cloves in oil at low temperature',
        temperature: { fahrenheit: 225, celsius: 110 }
        timing: '2-3 hours until soft and golden',
        uses: ['oil for cooking', 'spread on bread', 'flavor base'],
        notes: 'both garlic and oil become flavored',
        // Removed excessive sensoryProfile nesting
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
        }
        culinaryProfile: {
          flavorProfile: {
            primary: ['balanced'],
            secondary: ['versatile'],
            notes: 'Versatile confit for various uses'
          }
          cookingMethods: ['sautéing', 'steaming', 'roasting'],
          cuisineAffinity: ['Global', 'International'],
          preparationTips: ['Use as needed', 'Season to taste']
        }
        season: ['year-round']
      }
      fermented: {
        method: 'submerged in brine or honey',
        timing: '2-4 weeks',
        uses: ['heightened probiotic content', 'digestive aid', 'immune support'],
        notes: 'mellows flavor while boosting nutritional properties',
        // Removed excessive sensoryProfile nesting
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
        }
        culinaryProfile: {
          flavorProfile: {
            primary: ['balanced'],
            secondary: ['versatile'],
            notes: 'Versatile fermented for various uses'
          }
          cookingMethods: ['sautéing', 'steaming', 'roasting'],
          cuisineAffinity: ['Global', 'International'],
          preparationTips: ['Use as needed', 'Season to taste']
        }
        season: ['year-round']
      }
      black_garlic: {
        method: 'aged in controlled humidity and temperature',
        timing: '3-4 weeks',
        temperature: { fahrenheit: 140, celsius: 60 }
        humidity: '70-80%',
        uses: ['high-end cuisine', 'sauces', 'vinaigrettes'],
        notes: 'transformed through Maillard reaction, not fermentation',
        // Removed excessive sensoryProfile nesting
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
        }
        culinaryProfile: {
          flavorProfile: {
            primary: ['balanced'],
            secondary: ['versatile'],
            notes: 'Versatile black garlic for various uses'
          }
          cookingMethods: ['sautéing', 'steaming', 'roasting'],
          cuisineAffinity: ['Global', 'International'],
          preparationTips: ['Use as needed', 'Season to taste']
        }
        season: ['year-round']
      }
    }
    storage: {
      temperature: 'cool, dry place60-65°F (15-18°C)',
      duration: '3-6 months for whole heads',
      humidity: 'moderate to low',
      notes: 'Do not refrigerate whole heads, promotes sprouting',
      conditions_to_avoid: 'moisture, direct sunlight, refrigeration',
      peeled_cloves: 'refrigerate up to 1 week or submerge in oil',
      minced: 'refrigerate up to 1 day or freeze in portions'
    }
  }

  onion: {
    name: 'Onion',
    elementalProperties: { Fire: 0.4, Air: 0.3, Earth: 0.2, Water: 0.1 }
    astrologicalProfile: {
      rulingPlanets: ['Mars', 'Moon'],
      favorableZodiac: ['aries', 'cancer', 'scorpio'],
      elementalAffinity: {
        base: 'Fire',
        secondary: 'Water',
        decanModifiers: {
          first: { element: 'Fire', planet: 'Mars' }
          second: { element: 'Water', planet: 'Moon' }
          third: { element: 'Earth', planet: 'Saturn' }
        }
        lunarPhaseModifiers: {
          newMoon: {
            elementalBoost: { Fire: 0.1, Air: 0.05 }
            preparationTips: ['Good for quick pickling', 'Raw preparations enhanced']
          }
          fullMoon: {
            elementalBoost: { Water: 0.15, Fire: 0.05 }
            preparationTips: ['Best for caramelizing', 'Sweetness more pronounced']
          }
          waningGibbous: {
            elementalBoost: { Earth: 0.1, Water: 0.1 }
            preparationTips: ['Good for long-cooking methods', 'Enhanced grounding qualities']
          }
        }
      }
    }
    qualities: ['warming', 'stimulating', 'pungent', 'nourishing', 'versatile'],
    season: ['all'],
    category: 'vegetable',
    subCategory: 'allium',
    affinities: ['garlic', 'herbs', 'butter', 'vinegar', 'celery', 'carrots', 'bay leaf', 'wine'],
    cookingMethods: ['sautéed', 'caramelized', 'raw', 'grilled', 'roasted', 'pickled', 'fried'],
    nutritionalProfile: {
      fiber: 'moderate',
      vitamins: ['c', 'b6', 'folate', 'b1'],
      minerals: ['folate', 'potassium', 'manganese', 'copper'],
      calories: 40,
      carbs_g: 9,
      fiber_g: 1.7,
      antioxidants: ['quercetin', 'sulfur compounds', 'anthocyanins'],
      anti_inflammatory: 'moderate',
      blood_sugar_regulation: 'supportive'
    }
    preparation: {
      peeling: true,
      cutting: 'along grain for cooking, against for raw',
      notes: 'Chill before cutting to reduce tears or cut under running water',
      dicing: 'radial cuts first, then cross-cuts for even pieces',
      slicing: 'pole-to-pole for cooking, across equator for rings',
      burn_prevention: 'medium heat, stir frequently, add small amount of liquid if needed'
    }
    varieties: {
      yellow: {
        characteristics: 'all-purpose, golden skin, white flesh',
        flavor: 'balanced sweetness and pungency',
        best_uses: ['caramelizing', 'all cooking methods'],
        storage: 'longest shelf life of common varieties'
      }

      sweet: {
        characteristics: 'larger, flatter shape, thinner skin',
        flavor: 'notably sweeter, milder',
        best_uses: ['raw eating', 'grilling', 'roasting'],
        popular_types: ['Vidalia', 'Walla Walla', 'Maui']
      }
      shallot: {
        characteristics: 'small, elongated, copper skin, purple-tinged flesh',
        flavor: 'refined, garlicky notes, complex',
        best_uses: ['fine sauces', 'vinaigrettes', 'garnishes'],
        notes: 'higher sugar content, considered more elegant'
      }
    }
    culinaryApplications: {
      caramelized: {
        method: 'slow cook over low heat with fat until deeply browned',
        timing: '30-45 minutes',
        temperature: 'low to medium-low',
        uses: ['toppings', 'flavor base', 'enriching dishes'],
        notes: 'add pinch of baking soda to speed process',
        key_factors: 'patience, occasional stirring, proper monitoring'
      }
      french_onion_soup: {
        method: 'deeply caramelize, then simmer in broth',
        timing: '1 hour caramelizing, 30 minutes simmering',
        additions: ['beef stock', 'thyme', 'bay', 'wine'],
        finishing: 'toasted bread and melted cheese',
        notes: 'darker caramelization creates richer soup'
      }
      pickled: {
        method: 'quick pickle in vinegar solution',
        varieties: ['red onions for color', 'shallots for delicacy'],
        timing: '30 minutes to 24 hours',
        uses: ['sandwiches', 'salads', 'garnish', 'tacos'],
        flavor_additions: ['peppercorns', 'bay leaf', 'mustard seeds']
      }
      fried: {
        method: 'coat in flour or batter and deep fry',
        temperature: { fahrenheit: 350, celsius: 175 }
        timing: '2-3 minutes until golden',
        preparation: 'separate into rings, soak in buttermilk',
        notes: 'dry thoroughly before frying for crispiness'
      }
    }
    storage: {
      temperature: 'cool, dry place45-55°F (7-13°C)',
      duration: '1-2 months whole1 week cut',
      humidity: 'low to moderate',
      notes: 'Keep away from potatoes, gases accelerate sprouting',
      refrigeration: 'only for cut onions, sealed container',
      frozen: {
        preparation: 'peel, chop, freeze on tray then transfer to container',
        uses: 'only for cooked applications',
        duration: 'up to 8 months'
      }
    }
  }

  leek: {
    name: 'Leek',
    elementalProperties: { Earth: 0.4, Water: 0.3, Air: 0.2, Fire: 0.1 }
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Moon'],
      favorableZodiac: ['capricorn', 'cancer'],
      elementalAffinity: {
        base: 'Earth',
        secondary: 'Water',
        decanModifiers: {
          first: { element: 'Earth', planet: 'Saturn' }
          second: { element: 'Water', planet: 'Moon' }
          third: { element: 'Air', planet: 'Mercury' }
        }
        lunarPhaseModifiers: {
          firstQuarter: {
            elementalBoost: { Earth: 0.1, Water: 0.05 }
            preparationTips: ['Good for soups and stews', 'Balanced flavor development']
          }
          fullMoon: {
            elementalBoost: { Water: 0.15, Earth: 0.05 }
            preparationTips: ['Excellent for braising', 'Enhanced moisture retention']
          }
        }
      }
    }
    qualities: ['warming', 'nourishing', 'grounding', 'gentle', 'supportive'],
    season: ['fall', 'winter', 'early spring'],
    category: 'vegetable',
    subCategory: 'allium',
    affinities: [
      'potato',
      'cream',
      'thyme',
      'butter',
      'parmesan',
      'bacon',
      'mustard',
      'white wine'
    ],
    cookingMethods: ['sautéed', 'braised', 'roasted', 'soup', 'steamed', 'grilled'],
    nutritionalProfile: {
      fiber: 'high',
      vitamins: ['k', 'a', 'c', 'b6', 'folate'],
      minerals: ['manganese', 'iron', 'copper', 'magnesium'],
      calories: 54,
      carbs_g: 12,
      fiber_g: 1.8,
      antioxidants: ['kaempferol', 'polyphenols'],
      heart_health: 'supportive',
      anti_inflammatory: 'moderate'
    }
    preparation: {
      washing: 'thoroughly between layers to remove sand / (grit || 1)',
      trimming: 'remove dark green tops (save for stock) and root end',
      cutting: 'halve lengthwise first, then slice as needed',
      notes: 'Soak in cold water to remove sand, drain thoroughly',
      white_to_green: 'white and light green parts are tender, dark green is tough',
      cleaning_technique: 'fan out layers under running water'
    }
    varieties: {
      common: {
        characteristics: 'long white shaft with fan of green leaves',
        flavor: 'mild onion flavor, subtle sweetness',
        best_uses: ['all-purpose cooking', 'soups', 'braising'],
        notes: 'most widely available variety'
      }
      wild: {
        characteristics: 'thinner, stronger flavor',
        flavor: 'more intense, complex',
        best_uses: ['specialty dishes', 'foraged cuisine'],
        notes: 'seasonal availability'
      }
      baby: {
        characteristics: 'small, tender, harvested young',
        flavor: 'delicate, sweet',
        best_uses: ['whole preparation', 'showcase dishes'],
        notes: 'minimal cleaning needed'
      }
      elephant: {
        characteristics: 'very large, can be up to 6 inches in diameter',
        flavor: 'milder than standard leeks',
        best_uses: ['stuffing', 'roasting whole', 'large presentations'],
        notes: 'requires longer cooking time'
      }
    }
    culinaryApplications: {
      potato_leek_soup: {
        method: 'sauté leeks, add potatoes and broth, simmer until tender',
        timing: '30-40 minutes total',
        variations: ['vichyssoise (chilled)', 'cream-based', 'broth-based'],
        finishing: 'puree smooth or leave chunky',
        notes: 'classic combination highlighting leeks' subtle flavor'
      }
      braised: {
        method: 'brown lightly, add liquid, cover and cook until tender',
        timing: '20-30 minutes',
        liquid: ['chicken stock', 'white wine', 'water'],
        seasonings: ['thyme', 'bay leaf', 'black pepper', 'mustard'],
        notes: 'excellent side dish or bed for protein'
      }
      gratin: {
        method: 'layer blanched leeks with sauce, top with cheese and breadcrumbs',
        timing: '25-30 minutes baking',
        sauce: 'béchamel or cream',
        cheese: ['gruyère', 'parmesan', 'comté'],
        notes: 'elegant side dish showcasing leeks' sweetness'
      }
      grilled: {
        method: 'halve lengthwise, brush with oil, grill until tender',
        timing: '8-10 minutes',
        pre_treatment: 'blanch briefly to ensure even cooking',
        serving: 'drizzle with vinaigrette or herb oil',
        notes: 'showcases natural sweetness with charred complexity'
      }
    }
    storage: {
      temperature: 'refrigerated',
      duration: '1-2 weeks',
      humidity: 'high',
      notes: 'Wrap in damp paper towel or store in perforated plastic bag',
      cleaning: 'do not wash before storage',
      frozen: {
        preparation: 'clean, chop, blanch for 1 minute, shock in ice water',
        duration: 'up to 10 months',
        best_uses: 'cooked dishes only'
      }
    }
  }

  shallot: {
    name: 'Shallot',
    elementalProperties: { Fire: 0.3, Earth: 0.3, Air: 0.3, Water: 0.1 }
    astrologicalProfile: {
      rulingPlanets: ['Mercury', 'Venus'],
      favorableZodiac: ['virgo', 'libra'],
      elementalAffinity: {
        base: 'Air',
        secondary: 'Fire',
        decanModifiers: {
          first: { element: 'Air', planet: 'Mercury' }
          second: { element: 'Fire', planet: 'Mars' }
          third: { element: 'Earth', planet: 'Venus' }
        }
        lunarPhaseModifiers: {
          waxingCrescent: {
            elementalBoost: { Air: 0.1, Fire: 0.05 }
            preparationTips: ['Good for delicate sauces', 'Enhanced aromatic qualities']
          }
          fullMoon: {
            elementalBoost: { Air: 0.15, Earth: 0.05 }
            preparationTips: ['Best for vinaigrettes', 'Maximum flavor expression']
          }
        }
      }
    }
    qualities: ['refined', 'complex', 'elegant', 'balanced', 'aromatic'],
    season: ['all'],
    category: 'vegetable',
    subCategory: 'allium',
    affinities: [
      'vinegar',
      'butter',
      'white wine',
      'tarragon',
      'thyme',
      'mustard',
      'cream',
      'mushrooms'
    ],
    cookingMethods: ['minced raw', 'sautéed', 'fried', 'roasted', 'pickled', 'confit'],
    nutritionalProfile: {
      fiber: 'moderate',
      vitamins: ['a', 'b6', 'c', 'folate'],
      minerals: ['manganese', 'potassium', 'copper', 'iron'],
      calories: 72,
      carbs_g: 16.8,
      fiber_g: 3.2,
      antioxidants: ['flavonoids', 'phenolic compounds'],
      immune_support: 'moderate',
      heart_health: 'supportive'
    }
    preparation: {
      peeling: 'remove papery outer layers',
      cutting: 'halve lengthwise, then slice or mince',
      notes: 'Smaller dice for raw applications',
      special_technique: 'brunoise (fine dice) for classic French cuisine',
      shallot_vs_clove: 'recipes typically call for whole shallots, not individual cloves'
    }
    varieties: {
      gray: {
        characteristics: 'gray outer skin, multiple cloves like garlic',
        flavor: 'stronger, more assertive than French',
        best_uses: ['cooking applications', 'where robust flavor is desired'],
        notes: 'less common in US markets'
      }
      asian: {
        characteristics: 'small, deep red to purple',
        flavor: 'sharper, more pungent',
        best_uses: ['Asian cuisine', 'raw applications', 'quick pickles'],
        notes: 'common in Southeast Asian markets'
      }
      banana: {
        characteristics: 'elongated, larger than other types',
        flavor: 'milder, sweeter',
        best_uses: ['roasting whole', 'when larger pieces are desired'],
        notes: 'good substitution when recipe calls for '1 shallot''
      }
    }
    culinaryApplications: {
      fried: {
        method: 'thinly slice and fry until crisp',
        temperature: { fahrenheit: 325, celsius: 165 }
        timing: '2-3 minutes until golden brown',
        uses: ['garnish for soups', 'salads', 'steaks', 'Asian dishes'],
        notes: 'drain well on paper towels, salt immediately'
      }
      sauce_base: {
        method: 'sauté until softened but not browned',
        timing: '2-3 minutes over medium heat',
        uses: ['beurre blanc', 'red wine reductions', 'cream sauces'],
        notes: 'provides aromatic foundation without dominating'
      }
      roasted: {
        method: 'halve and roast with olive oil',
        temperature: { fahrenheit: 400, celsius: 200 }
        timing: '20-25 minutes until soft and caramelized',
        uses: ['side dish', 'accompaniment to roasted meats'],
        variations: 'can be combined with other root vegetables'
      }
    }
    storage: {
      temperature: 'cool, dry place',
      duration: '1-2 months whole',
      humidity: 'low to moderate',
      notes: 'Once cut, refrigerate in sealed container for up to 1 week',
      refrigeration: 'not recommended for whole shallots',
      frozen: {
        preparation: 'peel, mince, freeze in ice cube trays with oil',
        duration: 'up to 3 months',
        best_uses: 'cooking only, not raw applications'
      }
    }
  }

  spring_onion: {
    name: 'Spring Onion',
    elementalProperties: { Air: 0.4, Water: 0.3, Fire: 0.2, Earth: 0.1 }
    astrologicalProfile: {
      rulingPlanets: ['Mercury', 'Mars'],
      favorableZodiac: ['virgo', 'aries'],
      elementalAffinity: {
        base: 'Air',
        secondary: 'Water',
        decanModifiers: {
          first: { element: 'Air', planet: 'Mercury' }
          second: { element: 'Fire', planet: 'Mars' }
          third: { element: 'Water', planet: 'Moon' }
        }
        lunarPhaseModifiers: {
          newMoon: {
            elementalBoost: { Air: 0.15, Fire: 0.05 }
            preparationTips: ['Best for fresh applications', 'Enhanced crispness']
          }
          waxingCrescent: {
            elementalBoost: { Water: 0.1, Air: 0.1 }
            preparationTips: ['Good for quick cooking', 'Enhanced flavor infusion']
          }
        }
      }
    }
    qualities: ['fresh', 'bright', 'crisp', 'vibrant', 'lively'],
    season: ['spring', 'early summer'],
    category: 'vegetable',
    subCategory: 'allium',
    affinities: ['ginger', 'sesame', 'soy', 'lemon', 'cilantro', 'chili', 'eggs', 'seafood'],
    cookingMethods: ['raw', 'quick sautéed', 'grilled', 'garnish', 'stir-fried', 'pickled'],
    nutritionalProfile: {
      fiber: 'moderate',
      vitamins: ['k', 'c', 'a', 'folate'],
      minerals: ['iron', 'potassium', 'manganese'],
      calories: 32,
      carbs_g: 7.3,
      fiber_g: 2.6,
      antioxidants: ['quercetin', 'flavonoids', 'sulfur compounds'],
      immune_support: 'high',
      blood_health: 'supportive'
    }
    preparation: {
      washing: 'thoroughly to remove grit',
      trimming: 'remove root end and any wilted green tops',
      cutting: 'bias cuts for stir-fry, fine chop for garnish',
      notes: 'Both white and green parts are edible',
      separating: 'white parts cook longer than green parts'
    }
    varieties: {
      green_onion: {
        characteristics: 'thin, straight green stalks with small white bulbs',
        flavor: 'mild, fresh, slightly sweet',
        best_uses: ['garnishes', 'Asian cuisine', 'raw applications'],
        notes: 'most common type in US markets'
      }
      scallion: {
        characteristics: 'very little bulb development',
        flavor: 'milder than green onions',
        best_uses: ['delicate dishes', 'raw garnishes'],
        notes: 'terms often used interchangeably with green onion'
      }
      spring_onion_true: {
        characteristics: 'more developed bulb than scallions',
        flavor: 'stronger than scallions, harvested young',
        best_uses: ['grilling', 'roasting whole', 'featured vegetable'],
        notes: 'true spring onions are immature regular onions'
      }
      red_scallion: {
        characteristics: 'purple-red bases, green tops',
        flavor: 'similar to regular scallions with slight color difference',
        best_uses: ['colorful garnishes', 'Asian cuisine'],
        notes: 'less common but visually distinctive'
      }
    }
    culinaryApplications: {
      garnish: {
        method: 'finely slice or chop',
        cutting_techniques: ['thin bias cuts', 'fine dice', 'chiffonade', 'curled scallions'],
        uses: ['soups', 'stir-fries', 'noodle dishes', 'tacos', 'salads'],
        notes: 'add at last minute to preserve color and texture'
      }
      stir_fry: {
        method: 'separate white and green parts',
        timing: 'whites: 1-2 minutes, greens: 30 seconds at end',
        cutting: 'bias cut 1-2 inch pieces',
        pairs_with: ['ginger', 'garlic', 'soy sauce', 'sesame oil'],
        notes: 'quick cooking preserves color and texture'
      }
      grilled: {
        method: 'brush with oil, grill whole',
        timing: '2-3 minutes, turning once',
        preparation: 'trim roots but keep intact',
        serving: 'drizzle with olive oil, salt, lemon',
        notes: 'classic Spanish preparation (calçots)'
      }
      infused_oil: {
        method: 'steep chopped green parts in warm oil',
        temperature: 'warm, not hot',
        timing: '30 minutes to 1 hour',
        uses: ['drizzling', 'dressings', 'finishing'],
        notes: 'strain and refrigerate, use within 1 week'
      }
    }
    storage: {
      temperature: 'refrigerated',
      duration: '1 week',
      humidity: 'high',
      notes: 'Store upright in jar with 1 inch of water, loosely covered',
      alternative: 'wrap in damp paper towel in perforated plastic bag',
      frozen: {
        preparation: 'chop and freeze in ice cube trays',
        duration: 'up to 3 months',
        best_uses: 'cooked applications only'
      }
      regrowth: 'can be regrown from roots in water or soil'
    }
  }

  chives: {
    name: 'Chives',
    elementalProperties: { Air: 0.5, Fire: 0.2, Water: 0.2, Earth: 0.1 }
    astrologicalProfile: {
      rulingPlanets: ['Mercury', 'Uranus'],
      favorableZodiac: ['gemini', 'aquarius'],
      elementalAffinity: {
        base: 'Air',
        secondary: 'Fire',
        decanModifiers: {
          first: { element: 'Air', planet: 'Mercury' }
          second: { element: 'Fire', planet: 'Mars' }
          third: { element: 'Air', planet: 'Uranus' }
        }
        lunarPhaseModifiers: {
          newMoon: {
            elementalBoost: { Air: 0.2 }
            preparationTips: ['Fresh harvesting enhanced', 'Best for raw uses']
          }
          fullMoon: {
            elementalBoost: { Air: 0.15, Water: 0.05 }
            preparationTips: ['Flavor more pronounced', 'Good for infusions']
          }
        }
      }
    }
    qualities: ['delicate', 'fresh', 'subtle', 'aromatic', 'light'],
    season: ['spring', 'summer', 'fall', 'perennial herb'],
    category: 'herb / (vegetable || 1)',
    subCategory: 'allium',
    affinities: ['eggs', 'dairy', 'potatoes', 'fish', 'soft cheese', 'butter', 'lemon', 'dill'],
    cookingMethods: [
      'raw garnish',
      'snipped',
      'infused',
      'baked',
      'mixed into dough / (batter || 1)'
    ],
    nutritionalProfile: {
      vitamins: ['k', 'c', 'a', 'folate'],
      minerals: ['iron', 'manganese', 'calcium', 'magnesium'],
      calories: 30,
      carbs_g: 4.4,
      fiber_g: 2.5,
      antioxidants: ['allicin', 'flavonoids', 'vitamin K'],
      digestive_aid: 'mild',
      anti_inflammatory: 'moderate'
    }
    preparation: {
      washing: 'gently under cold water',
      drying: 'thoroughly with towels or salad spinner',
      cutting: 'snip with scissors rather than knife',
      notes: 'Cut just before using for best flavor',
      techniques: 'cut crosswise into small pieces, never mince',
      height: 'leave at least 2 inches when harvesting from plant'
    }
    varieties: {
      common: {
        characteristics: 'slender, hollow, tubular leaves',
        flavor: 'mild onion, delicate',
        best_uses: ['garnishes', 'finishing', 'dairy applications'],
        notes: 'most widely available variety'
      }
      garlic_chives: {
        characteristics: 'flat, solid leaves, white star-shaped flowers',
        flavor: 'distinct garlic notes, stronger than common',
        best_uses: ['Asian cuisine', 'stir-fries', 'dumplings'],
        notes: 'also called Chinese chives or kuchai'
      }
      giant_siberian: {
        characteristics: 'larger, more robust leaves',
        flavor: 'stronger than common chives',
        best_uses: ['cooking applications', 'where more flavor is needed'],
        notes: 'better suited to cooking than common chives'
      }
      flowering: {
        characteristics: 'purple pom-pom flowers in summer',
        flavor: 'mild, edible flowers have similar flavor to leaves',
        best_uses: ['edible garnish', 'chive blossom vinegar', 'salads'],
        notes: 'flowers are edible and decorative'
      }
    }
    culinaryApplications: {
      garnish: {
        method: 'snip fresh over finished dishes',
        timing: 'at the very last moment before serving',
        uses: ['soups', 'potatoes', 'eggs', 'seafood', 'canapés'],
        notes: 'heat destroys delicate flavor and bright color'
      }
      compound_butter: {
        method: 'mix finely snipped chives into softened butter',
        ratio: '2-3 tablespoons per stick of butter',
        uses: ['finishing steaks', 'melting over fish', 'bread spread'],
        notes: 'can be formed into logs and frozen for later use'
      }
      infused_cream: {
        method: 'steep chives in warm cream',
        timing: '20-30 minutes',
        uses: ['sauce base', 'scrambled eggs', 'mashed potatoes'],
        notes: 'strain before using or leave small pieces for visual appeal'
      }
      chive_oil: {
        method: 'blanch briefly, blend with oil, strain',
        timing: 'blanch 10 seconds, shock in ice water',
        uses: ['drizzling', 'plating', 'finishing'],
        notes: 'vibrant green color, use within a few days'
      }
    }
    storage: {
      temperature: 'refrigerated',
      duration: '1-2 weeks',
      humidity: 'high',
      methods: {
        jar: 'upright in jar with water, change water every few days',
        wrap: 'wrapped in damp paper towel, then plastic bag',
        herb_keeper: 'specialized container with water reservoir'
      }
      frozen: {
        preparation: 'snip, freeze in ice cube trays with water or oil',
        duration: 'up to 6 months',
        best_uses: 'cooking applications only, flavor diminishes'
      }
      dried: 'not recommended, loses most flavor and texture'
    }
  }

  scallion: {
    name: 'scallion',
    elementalProperties: {
      Fire: 0.35,
      Earth: 0.15,
      Air: 0.3,
      Water: 0.2
    }
    astrologicalProfile: {
      rulingPlanets: ['Mercury', 'Mars'],
      favorableZodiac: ['gemini', 'aries'],
      elementalAffinity: {
        base: 'Air',
        secondary: 'Fire',
        decanModifiers: {
          first: { element: 'Air', planet: 'Mercury' }
          second: { element: 'Fire', planet: 'Mars' }
          third: { element: 'Earth', planet: 'Venus' }
        }
      }
    }
    qualities: ['fresh', 'aromatic', 'versatile', 'bright'],
    origin: ['Asia', 'Global'],
    category: 'vegetable',
    subCategory: 'allium',
    affinities: ['ginger', 'garlic', 'sesame', 'soy', 'citrus', 'herbs'],
    cookingMethods: ['raw', 'sauteed', 'grilled', 'stir-fried'],
    nutritionalProfile: {
      fiber: 'moderate',
      vitamins: ['a', 'c', 'k', 'folate'],
      minerals: ['iron', 'potassium', 'calcium'],
      calories: 32,
      carbs_g: 7,
      fiber_g: 2.6,
      protein_g: 1.8
    }
    preparation: {
      washing: 'thoroughly between layers to remove sand / (grit || 1)',
      trimming: 'remove dark green tops (save for stock) and root end',
      cutting: 'slice thinly on bias or chop',
      whites_greens:
        'separate white / (light || 1) green parts from dark green for different applications',
      special_technique: 'curl by soaking thin slices in ice water'
    }
    culinaryApplications: {
      garnish: {
        method: 'finely slice or chop',
        cutting_techniques: ['thin bias cuts', 'fine dice', 'chiffonade', 'curled scallions'],
        uses: ['soups', 'stir-fries', 'noodle dishes', 'tacos', 'salads'],
        notes: 'add at last minute to preserve color and texture'
      }
      stir_fry: {
        method: 'separate white and green parts',
        timing: 'whites: 1-2 minutes, greens: 30 seconds at end',
        cutting: 'bias cut 1-2 inch pieces',
        pairs_with: ['ginger', 'garlic', 'soy sauce', 'sesame oil'],
        notes: 'quick cooking preserves color and texture'
      }
      grilled: {
        method: 'brush with oil, grill whole',
        timing: '2-3 minutes, turning once',
        preparation: 'trim roots but keep intact',
        serving: 'drizzle with olive oil, salt, lemon',
        notes: 'classic Spanish preparation (calçots)'
      }
      asian_applications: {
        scallion_oil: {
          method: 'steep chopped green parts in warm oil',
          timing: '30-60 minutes',
          uses: ['drizzling', 'dressings', 'finishing'],
          notes: 'strain and refrigerate, use within 1 week'
        }
        scallion_pancakes: {
          method: 'incorporate chopped scallions into dough',
          uses: ['traditional Chinese appetizer'],
          cooking: 'pan-fry until golden and crispy',
          serving: 'with dipping sauce'
        }
      }
    }
    storage: {
      temperature: 'refrigerated',
      duration: '1-2 weeks',
      humidity: 'high',
      method: 'store upright in jar with 1 inch of water, loosely covered',
      alternative: 'wrap in damp paper towel in perforated plastic bag',
      regrowth: 'can be regrown from roots in water or soil'
    }
    regionalUses: {
      'East Asian': ['stir-fries', 'dumplings', 'noodle dishes', 'dipping sauces'],
      Mexican: ['salsas', 'guacamole', 'tacos', 'grilled as side'],
      American: ['loaded potatoes', 'dips', 'garnish']
    }
  }

  special_applications: {
    name: 'Special Applications',
    elementalProperties: { Fire: 0.3, Earth: 0.3, Air: 0.2, Water: 0.2 }
    astrologicalProfile: {
      rulingPlanets: ['Mercury', 'Venus'],
      favorableZodiac: ['gemini', 'libra'],
      elementalAffinity: {
        base: 'Fire',
        secondary: 'Earth'
      }
    }
    qualities: ['versatile', 'traditional', 'regional'],
    season: ['all'],
    category: 'application',
    subCategory: 'special',
    affinities: ['regional cuisines', 'traditional methods'],
    cookingMethods: ['regional-specific'],
    nutritionalProfile: {
      vitamins: ['varies'],
      minerals: ['varies'],
      calories: 0,
      carbs_g: 0,
      fiber_g: 0
    }
    preparation: {
      washing: 'as needed',
      cutting: 'as specified',
      notes: 'Regional preparation methods vary'
    }
    regionalUses: {
      Indian: ['curries', 'side dishes', 'raitas'],
      French: ['soups', 'stews', 'gratins'],
      American: ['loaded potatoes', 'dips', 'garnish']
    }
  }
}

// Fix the ingredient mappings to ensure they have all required properties
// ✅ Pattern MM-1: Type assertion for ZodiacSign[] compatibility
export const _alliums: Record<string, IngredientMapping> = fixIngredientMappings(
  rawAlliums as Record<string, Partial<IngredientMapping>>,
)
