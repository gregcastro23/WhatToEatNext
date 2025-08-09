import { CUISINE_TYPES } from '@/constants/cuisineTypes';
import type { IngredientMapping } from '@/data/ingredients/types';
import type { ZodiacSign } from '@/types/celestial';
import { fixIngredientMappings } from '@/utils/elementalUtils';

const rawWholeSpices = {
  star_anise: {
    name: 'Star Anise',
    elementalProperties: { Fire: 0.4, Air: 0.2, Water: 0.1, Earth: 0.1 },
    qualities: ['sweet', 'licorice-like', 'warming'],
    origin: ['China', 'Vietnam'],
    category: 'spice',
    subCategory: 'whole',
    varieties: {
      Chinese: 'traditional variety',
      Japanese: 'more delicate',
      Vietnamese: 'more robust',
      sensoryProfile: {
        taste: ['Mild', 'Balanced', 'Natural'],
        aroma: ['Fresh', 'Clean', 'Subtle'],
        texture: ['Pleasant', 'Smooth', 'Appealing'],
        notes: 'Characteristic star anise profile',
        culinaryProfile: {
          flavorProfile: {
            primary: ['balanced'],
            secondary: ['versatile'],
            notes: 'Versatile star anise for various uses',
            sensoryProfile: {
              taste: ['Mild', 'Balanced', 'Natural'],
              aroma: ['Fresh', 'Clean', 'Subtle'],
              texture: ['Pleasant', 'Smooth', 'Appealing'],
              notes: 'Characteristic flavorprofile profile',
              sensoryProfile: {
                taste: ['Mild', 'Balanced', 'Natural'],
                aroma: ['Fresh', 'Clean', 'Subtle'],
                texture: ['Pleasant', 'Smooth', 'Appealing'],
                notes: 'Characteristic flavorprofile profile',
                sensoryProfile: {
                  taste: ['Mild', 'Balanced', 'Natural'],
                  aroma: ['Fresh', 'Clean', 'Subtle'],
                  texture: ['Pleasant', 'Smooth', 'Appealing'],
                  notes: 'Characteristic flavorprofile profile',
                  sensoryProfile: {
                    taste: ['Mild', 'Balanced', 'Natural'],
                    aroma: ['Fresh', 'Clean', 'Subtle'],
                    texture: ['Pleasant', 'Smooth', 'Appealing'],
                    notes: 'Characteristic flavorprofile profile',
                    sensoryProfile: {
                      taste: ['Mild', 'Balanced', 'Natural'],
                      aroma: ['Fresh', 'Clean', 'Subtle'],
                      texture: ['Pleasant', 'Smooth', 'Appealing'],
                      notes: 'Characteristic flavorprofile profile',
                      culinaryProfile: {
                        flavorProfile: {
                          primary: ['balanced'],
                          secondary: ['versatile'],
                          notes: 'Versatile flavorprofile for various uses',
                          culinaryProfile: {
                            flavorProfile: {
                              primary: ['balanced'],
                              secondary: ['versatile'],
                              notes: 'Versatile flavorprofile for various uses',
                              culinaryProfile: {
                                flavorProfile: {
                                  primary: ['balanced'],
                                  secondary: ['versatile'],
                                  notes: 'Versatile flavorprofile for various uses',
                                  culinaryProfile: {
                                    flavorProfile: {
                                      primary: ['balanced'],
                                      secondary: ['versatile'],
                                      notes: 'Versatile flavorprofile for various uses',
                                      culinaryProfile: {
                                        flavorProfile: {
                                          primary: ['balanced'],
                                          secondary: ['versatile'],
                                          notes: 'Versatile flavorprofile for various uses',
                                          culinaryProfile: {
                                            flavorProfile: {
                                              primary: ['balanced'],
                                              secondary: ['versatile'],
                                              notes: 'Versatile flavorprofile for various uses',
                                              culinaryProfile: {
                                                flavorProfile: {
                                                  primary: ['balanced'],
                                                  secondary: ['versatile'],
                                                  notes: 'Versatile flavorprofile for various uses',
                                                  culinaryProfile: {
                                                    flavorProfile: {
                                                      primary: ['balanced'],
                                                      secondary: ['versatile'],
                                                      notes:
                                                        'Versatile flavorprofile for various uses',
                                                      season: ['year-round'],
                                                      preparation: {
                                                        methods: ['standard preparation'],
                                                        timing: 'as needed',
                                                        notes:
                                                          'Standard preparation for flavorprofile',
                                                        season: ['year-round'],
                                                        preparation: {
                                                          methods: ['standard preparation'],
                                                          timing: 'as needed',
                                                          notes:
                                                            'Standard preparation for flavorprofile',
                                                        },
                                                        storage: {
                                                          temperature: 'cool, dry place',
                                                          duration: '6-12 months',
                                                          container: 'airtight container',
                                                          notes: 'Store in optimal conditions',
                                                        },
                                                      },
                                                      storage: {
                                                        temperature: 'cool, dry place',
                                                        duration: '6-12 months',
                                                        container: 'airtight container',
                                                        notes: 'Store in optimal conditions',
                                                      },
                                                    },
                                                    cookingMethods: [
                                                      'sautéing',
                                                      'steaming',
                                                      'roasting',
                                                    ],
                                                    cuisineAffinity: ['Global', 'International'],
                                                    preparationTips: [
                                                      'Use as needed',
                                                      'Season to taste',
                                                    ],
                                                  },
                                                  season: ['year-round'],
                                                  preparation: {
                                                    methods: ['standard preparation'],
                                                    timing: 'as needed',
                                                    notes: 'Standard preparation for flavorprofile',
                                                  },
                                                },
                                                cookingMethods: [
                                                  'sautéing',
                                                  'steaming',
                                                  'roasting',
                                                ],
                                                cuisineAffinity: ['Global', 'International'],
                                                preparationTips: [
                                                  'Use as needed',
                                                  'Season to taste',
                                                ],
                                              },
                                              season: ['year-round'],
                                              preparation: {
                                                methods: ['standard preparation'],
                                                timing: 'as needed',
                                                notes: 'Standard preparation for flavorprofile',
                                              },
                                            },
                                            cookingMethods: ['sautéing', 'steaming', 'roasting'],
                                            cuisineAffinity: ['Global', 'International'],
                                            preparationTips: ['Use as needed', 'Season to taste'],
                                          },
                                          season: ['year-round'],
                                          preparation: {
                                            methods: ['standard preparation'],
                                            timing: 'as needed',
                                            notes: 'Standard preparation for flavorprofile',
                                          },
                                        },
                                        cookingMethods: ['sautéing', 'steaming', 'roasting'],
                                        cuisineAffinity: ['Global', 'International'],
                                        preparationTips: ['Use as needed', 'Season to taste'],
                                      },
                                      season: ['year-round'],
                                      preparation: {
                                        methods: ['standard preparation'],
                                        timing: 'as needed',
                                        notes: 'Standard preparation for flavorprofile',
                                      },
                                    },
                                    cookingMethods: ['sautéing', 'steaming', 'roasting'],
                                    cuisineAffinity: ['Global', 'International'],
                                    preparationTips: ['Use as needed', 'Season to taste'],
                                  },
                                  season: ['year-round'],
                                  preparation: {
                                    methods: ['standard preparation'],
                                    timing: 'as needed',
                                    notes: 'Standard preparation for flavorprofile',
                                  },
                                },
                                cookingMethods: ['sautéing', 'steaming', 'roasting'],
                                cuisineAffinity: ['Global', 'International'],
                                preparationTips: ['Use as needed', 'Season to taste'],
                              },
                              season: ['year-round'],
                              preparation: {
                                methods: ['standard preparation'],
                                timing: 'as needed',
                                notes: 'Standard preparation for flavorprofile',
                              },
                            },
                            cookingMethods: ['sautéing', 'steaming', 'roasting'],
                            cuisineAffinity: ['Global', 'International'],
                            preparationTips: ['Use as needed', 'Season to taste'],
                          },
                          season: ['year-round'],
                          preparation: {
                            methods: ['standard preparation'],
                            timing: 'as needed',
                            notes: 'Standard preparation for flavorprofile',
                          },
                        },
                        cookingMethods: ['sautéing', 'steaming', 'roasting'],
                        cuisineAffinity: ['Global', 'International'],
                        preparationTips: ['Use as needed', 'Season to taste'],
                      },
                      season: ['year-round'],
                      preparation: {
                        methods: ['standard preparation'],
                        timing: 'as needed',
                        notes: 'Standard preparation for flavorprofile',
                      },
                    },
                    culinaryProfile: {
                      flavorProfile: {
                        primary: ['balanced'],
                        secondary: ['versatile'],
                        notes: 'Versatile flavorprofile for various uses',
                      },
                      cookingMethods: ['sautéing', 'steaming', 'roasting'],
                      cuisineAffinity: ['Global', 'International'],
                      preparationTips: ['Use as needed', 'Season to taste'],
                    },
                    season: ['year-round'],
                  },
                  culinaryProfile: {
                    flavorProfile: {
                      primary: ['balanced'],
                      secondary: ['versatile'],
                      notes: 'Versatile flavorprofile for various uses',
                    },
                    cookingMethods: ['sautéing', 'steaming', 'roasting'],
                    cuisineAffinity: ['Global', 'International'],
                    preparationTips: ['Use as needed', 'Season to taste'],
                  },
                  season: ['year-round'],
                },
                culinaryProfile: {
                  flavorProfile: {
                    primary: ['balanced'],
                    secondary: ['versatile'],
                    notes: 'Versatile flavorprofile for various uses',
                  },
                  cookingMethods: ['sautéing', 'steaming', 'roasting'],
                  cuisineAffinity: ['Global', 'International'],
                  preparationTips: ['Use as needed', 'Season to taste'],
                },
                season: ['year-round'],
              },
              culinaryProfile: {
                flavorProfile: {
                  primary: ['balanced'],
                  secondary: ['versatile'],
                  notes: 'Versatile flavorprofile for various uses',
                },
                cookingMethods: ['sautéing', 'steaming', 'roasting'],
                cuisineAffinity: ['Global', 'International'],
                preparationTips: ['Use as needed', 'Season to taste'],
              },
              season: ['year-round'],
            },
            culinaryProfile: {
              flavorProfile: {
                primary: ['balanced'],
                secondary: ['versatile'],
                notes: 'Versatile flavorprofile for various uses',
              },
              cookingMethods: ['sautéing', 'steaming', 'roasting'],
              cuisineAffinity: ['Global', 'International'],
              preparationTips: ['Use as needed', 'Season to taste'],
            },
            season: ['year-round'],
          },
          cookingMethods: ['sautéing', 'steaming', 'roasting'],
          cuisineAffinity: ['Global', 'International'],
          preparationTips: ['Use as needed', 'Season to taste'],
        },
        season: ['year-round'],
        preparation: {
          methods: ['standard preparation'],
          timing: 'as needed',
          notes: 'Standard preparation for star anise',
        },
      },
      culinaryProfile: {
        flavorProfile: {
          primary: ['balanced'],
          secondary: ['versatile'],
          notes: 'Versatile star anise for various uses',
        },
        cookingMethods: ['sautéing', 'steaming', 'roasting'],
        cuisineAffinity: ['Global', 'International'],
        preparationTips: ['Use as needed', 'Season to taste'],
      },
      season: ['year-round'],
    },
    preparation: {
      toasting: {
        method: 'dry toast until fragrant',
        duration: '2-3 minutes',
        notes: 'Watch carefully to prevent burning',
      },
      grinding: 'grind as needed',
      infusing: {
        method: 'add whole to liquids',
        duration: '10-20 minutes',
        removal: 'required before serving',
      },
    },
    culinaryApplications: {
      broths: {
        name: 'Broths',
        method: 'add whole to simmering liquid',
        timing: 'early in cooking',
        pairings: ['cinnamon', 'ginger', 'onions'],
        ratios: '1-2 pods per 2 cups liquid',
        sensoryProfile: {
          taste: ['Mild', 'Balanced', 'Natural'],
          aroma: ['Fresh', 'Clean', 'Subtle'],
          texture: ['Pleasant', 'Smooth', 'Appealing'],
          notes: 'Characteristic broths profile',
          culinaryProfile: {
            flavorProfile: {
              primary: ['balanced'],
              secondary: ['versatile'],
              notes: 'Versatile broths for various uses',
              season: ['year-round'],
              preparation: {
                methods: ['standard preparation'],
                timing: 'as needed',
                notes: 'Standard preparation for broths',
              },
              storage: {
                temperature: 'cool, dry place',
                duration: '6-12 months',
                container: 'airtight container',
                notes: 'Store in optimal conditions',
              },
            },
            cookingMethods: ['sautéing', 'steaming', 'roasting'],
            cuisineAffinity: ['Global', 'International'],
            preparationTips: ['Use as needed', 'Season to taste'],
          },
          season: ['year-round'],
          preparation: {
            methods: ['standard preparation'],
            timing: 'as needed',
            notes: 'Standard preparation for broths',
          },
        },
        culinaryProfile: {
          flavorProfile: {
            primary: ['balanced'],
            secondary: ['versatile'],
            notes: 'Versatile broths for various uses',
          },
          cookingMethods: ['sautéing', 'steaming', 'roasting'],
          cuisineAffinity: ['Global', 'International'],
          preparationTips: ['Use as needed', 'Season to taste'],
        },
        season: ['year-round'],
      },

      tea_blends: {
        name: 'Tea Blends',
        method: 'combine with other spices',
        pairings: ['black tea', 'cinnamon', 'orange'],
        ratios: '1 pod per 2 cups water',
        sensoryProfile: {
          taste: ['Mild', 'Balanced', 'Natural'],
          aroma: ['Fresh', 'Clean', 'Subtle'],
          texture: ['Pleasant', 'Smooth', 'Appealing'],
          notes: 'Characteristic tea blends profile',
          sensoryProfile: {
            taste: ['Mild', 'Balanced', 'Natural'],
            aroma: ['Fresh', 'Clean', 'Subtle'],
            texture: ['Pleasant', 'Smooth', 'Appealing'],
            notes: 'Characteristic tea blends profile',
            culinaryProfile: {
              flavorProfile: {
                primary: ['balanced'],
                secondary: ['versatile'],
                notes: 'Versatile tea blends for various uses',
              },
              cookingMethods: ['sautéing', 'steaming', 'roasting'],
              cuisineAffinity: ['Global', 'International'],
              preparationTips: ['Use as needed', 'Season to taste'],
            },
            season: ['year-round'],
            preparation: {
              methods: ['standard preparation'],
              timing: 'as needed',
              notes: 'Standard preparation for tea blends',
            },
          },
          culinaryProfile: {
            flavorProfile: {
              primary: ['balanced'],
              secondary: ['versatile'],
              notes: 'Versatile tea blends for various uses',
            },
            cookingMethods: ['sautéing', 'steaming', 'roasting'],
            cuisineAffinity: ['Global', 'International'],
            preparationTips: ['Use as needed', 'Season to taste'],
          },
          season: ['year-round'],
        },
        culinaryProfile: {
          flavorProfile: {
            primary: ['balanced'],
            secondary: ['versatile'],
            notes: 'Versatile tea blends for various uses',
          },
          cookingMethods: ['sautéing', 'steaming', 'roasting'],
          cuisineAffinity: ['Global', 'International'],
          preparationTips: ['Use as needed', 'Season to taste'],
        },
        season: ['year-round'],
      },
    },
    storage: {
      temperature: 'cool, dark place',
      duration: '2 years',
      container: 'airtight',
      notes: 'Maintains potency well when whole',
    },
  },

  cardamom_pods: {
    name: 'Cardamom Pods',
    elementalProperties: { Air: 0.4, Fire: 0.3, Earth: 0.2, Water: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Mercury', 'Venus'],
      favorableZodiac: ['gemini', 'libra'],
      elementalAffinity: {
        base: 'Air',
        decanModifiers: {
          first: { element: 'Air', planet: 'Mercury' },
          second: { element: 'Fire', planet: 'Venus' },
          third: { element: 'Earth', planet: 'Saturn' },
        },
      },
    },
    qualities: ['aromatic', 'complex', 'intense'],
    origin: ['India', 'Guatemala', 'Sri Lanka'],
    category: 'spice',
    subCategory: 'whole',
    varieties: {},
    preparation: {
      toasting: {
        method: 'light dry toast',
        duration: '1-2 minutes',
        notes: 'Just until fragrant',
      },
      grinding: {
        method: 'remove seeds from pods',
        notes: 'Discard pods or use for infusing',
      },
      crushing: {
        method: 'lightly crush to release oils',
        notes: 'For infusing liquids',
      },
    },
    culinaryApplications: {
      rice_dishes: {
        name: 'Rice Dishes',
        method: 'add whole pods during cooking',
        timing: 'with rice and water',
        pairings: ['basmati rice', 'saffron', 'cinnamon'],
        ratios: '4-5 pods per cup of rice',
        sensoryProfile: {
          taste: ['Mild', 'Balanced', 'Natural'],
          aroma: ['Fresh', 'Clean', 'Subtle'],
          texture: ['Pleasant', 'Smooth', 'Appealing'],
          notes: 'Characteristic rice dishes profile',
          culinaryProfile: {
            flavorProfile: {
              primary: ['balanced'],
              secondary: ['versatile'],
              notes: 'Versatile rice dishes for various uses',
            },
            cookingMethods: ['sautéing', 'steaming', 'roasting'],
            cuisineAffinity: ['Global', 'International'],
            preparationTips: ['Use as needed', 'Season to taste'],
          },
          season: ['year-round'],
          preparation: {
            methods: ['standard preparation'],
            timing: 'as needed',
            notes: 'Standard preparation for rice dishes',
          },
        },
        culinaryProfile: {
          flavorProfile: {
            primary: ['balanced'],
            secondary: ['versatile'],
            notes: 'Versatile rice dishes for various uses',
          },
          cookingMethods: ['sautéing', 'steaming', 'roasting'],
          cuisineAffinity: ['Global', 'International'],
          preparationTips: ['Use as needed', 'Season to taste'],
        },
        season: ['year-round'],
      },
      curries: {
        name: 'Curries',
        method: 'add whole pods during cooking',
        timing: 'with meat and vegetables',
        pairings: ['chicken', 'lamb', 'onions'],
        ratios: '2-3 pods per pound of meat',
        sensoryProfile: {
          taste: ['Mild', 'Balanced', 'Natural'],
          aroma: ['Fresh', 'Clean', 'Subtle'],
          texture: ['Pleasant', 'Smooth', 'Appealing'],
          notes: 'Characteristic curries profile',
        },
        culinaryProfile: {
          flavorProfile: {
            primary: ['balanced'],
            secondary: ['versatile'],
            notes: 'Versatile curries for various uses',
          },
          cookingMethods: ['sautéing', 'steaming', 'roasting'],
          cuisineAffinity: ['Global', 'International'],
          preparationTips: ['Use as needed', 'Season to taste'],
        },
        season: ['year-round'],
      },
      tea_blends: {
        name: 'Tea Blends',
        method: 'combine with other spices',
        pairings: ['black tea', 'cinnamon', 'orange'],
        ratios: '1 pod per 2 cups water',
      },
    },
    storage: {
      temperature: 'cool, dark place',
      duration: '2 years',
      container: 'airtight',
      notes: 'Maintains potency well when whole',
    },
  },

  mustard_seeds: {
    name: 'Mustard Seeds',
    elementalProperties: { Fire: 0.4, Air: 0.3, Earth: 0.2, Water: 0.1 },
    qualities: ['pungent', 'hot', 'nutty'],
    origin: ['India', 'Canada', 'Nepal'],
    category: 'spice',
    subCategory: 'whole',
    varieties: {
      Brown: {
        name: 'Brown',
        appearance: 'smaller, dark brown',
        flavor: 'more pungent',
        uses: 'Indian cuisine, oil blooming',
        sensoryProfile: {
          taste: ['Mild', 'Balanced', 'Natural'],
          aroma: ['Fresh', 'Clean', 'Subtle'],
          texture: ['Pleasant', 'Smooth', 'Appealing'],
          notes: 'Characteristic mustard seeds profile',
          sensoryProfile: {
            taste: ['Mild', 'Balanced', 'Natural'],
            aroma: ['Fresh', 'Clean', 'Subtle'],
            texture: ['Pleasant', 'Smooth', 'Appealing'],
            notes: 'Characteristic brown profile',
          },
          culinaryProfile: {
            flavorProfile: {
              primary: ['balanced'],
              secondary: ['versatile'],
              notes: 'Versatile brown for various uses',
            },
            cookingMethods: ['sautéing', 'steaming', 'roasting'],
            cuisineAffinity: ['Global', 'International'],
            preparationTips: ['Use as needed', 'Season to taste'],
          },
          season: ['year-round'],
        },
        culinaryProfile: {
          flavorProfile: {
            primary: ['balanced'],
            secondary: ['versatile'],
            notes: 'Versatile mustard seeds for various uses',
          },
          cookingMethods: ['sautéing', 'steaming', 'roasting'],
          cuisineAffinity: ['Global', 'International'],
          preparationTips: ['Use as needed', 'Season to taste'],
        },
        season: ['year-round'],
      },
    },
    culinaryApplications: {
      tempering: {
        name: 'Tempering',
        method: 'heat oil until seeds pop',
        timing: 'start of cooking',
        pairings: ['curry leaves', 'cumin seeds', 'asafoetida'],
        ratios: '1 tsp per cup of oil',
        techniques: {
          tadka: 'bloom in hot oil and pour over dish',
          base: 'start dish with bloomed seeds',
          layering: 'add at multiple cooking stages',
          sensoryProfile: {
            taste: ['Mild', 'Balanced', 'Natural'],
            aroma: ['Fresh', 'Clean', 'Subtle'],
            texture: ['Pleasant', 'Smooth', 'Appealing'],
            notes: 'Characteristic tempering profile',
          },
          culinaryProfile: {
            flavorProfile: {
              primary: ['balanced'],
              secondary: ['versatile'],
              notes: 'Versatile tempering for various uses',
            },
            cookingMethods: ['sautéing', 'steaming', 'roasting'],
            cuisineAffinity: ['Global', 'International'],
            preparationTips: ['Use as needed', 'Season to taste'],
          },
          season: ['year-round'],
        },
      },

      marinades: {
        name: 'Marinades',
        method: 'crush or grind',
        timing: '4-24 hours before cooking',
        pairings: ['garlic', 'herbs', 'vinegar'],
        ratios: '1 tbsp per cup of liquid',
        techniques: {
          paste: 'grind with liquids',
          rustic: 'roughly crush',
          infusion: 'heat in oil first',
        },
      },
      sauces: {
        name: 'Sauces',
        method: 'toast and grind or leave whole',
        pairings: ['cream', 'wine', 'vinegar'],
        ratios: '1 tsp per cup of liquid',
        techniques: {
          cream_sauce: 'infuse in warm cream',
          vinaigrette: 'crush and mix',
          grainy_mustard: 'soak in vinegar',
        },
      },
    },
    storage: {
      temperature: 'cool, dark place',
      duration: 'whole: 1 year',
      container: 'airtight',
      notes: 'Seeds can be sprouted if fresh',
    },
  },

  fennel_seeds: {
    name: 'Fennel Seeds',
    elementalProperties: { Air: 0.4, Fire: 0.3, Earth: 0.2, Water: 0.1 },
    qualities: ['sweet', 'anise-like', 'warming'],
    origin: ['India', 'Mediterranean', 'China'],
    category: 'spice',
    subCategory: 'whole',
    varieties: {
      Indian: {
        name: 'Indian',
        appearance: 'greener, thinner',
        flavor: 'more aromatic',
        uses: 'curries, digestive',
      },
      Mediterranean: {
        name: 'Mediterranean',
        appearance: 'plumper, pale green',
        flavor: 'sweeter',
        uses: 'sausages, bread',
      },
    },
    culinaryApplications: {
      bread_baking: {
        name: 'Bread Baking',
        method: 'add whole to dough',
        timing: 'during mixing',
        pairings: ['rye flour', 'caraway', 'salt'],
        ratios: '1-2 tbsp per loaf',
        techniques: {
          topping: 'sprinkle on crust',
          incorporated: 'mix into dough',
          flavored_oil: 'infuse in oil first',
        },
      },
      seafood_seasoning: {
        name: 'Seafood Seasoning',
        method: 'crush or leave whole',
        timing: 'before cooking',
        pairings: ['citrus', 'garlic', 'white wine'],
        ratios: '1 tsp per pound',
        techniques: {
          crust: 'grind with salt',
          court_bouillon: 'add to poaching liquid',
          steam_aromatic: 'add to steaming water',
        },
      },
      sausage_making: {
        name: 'Sausage Making',
        method: 'lightly crush',
        pairings: ['black pepper', 'garlic', 'salt'],
        ratios: '1 tbsp per pound',
        techniques: {
          italian_style: 'whole seeds',
          chinese_style: 'ground with star anise',
          merguez: 'combined with cumin',
        },
      },
    },
  },

  coriander_seeds: {
    name: 'Coriander Seeds',
    elementalProperties: { Air: 0.4, Earth: 0.3, Fire: 0.2, Water: 0.1 },
    qualities: ['citrusy', 'nutty', 'floral'],
    origin: ['India', 'Morocco', 'Eastern Europe'],
    category: 'spice',
    subCategory: 'whole',
    varieties: {
      Indian: {
        name: 'Indian',
        appearance: 'larger, more round',
        flavor: 'more aromatic',
        uses: 'curries, spice blends',
      },
      Mediterranean: {
        name: 'Mediterranean',
        appearance: 'smaller, more oval',
        flavor: 'more citrusy',
        uses: 'marinades, pickling',
      },
    },
    culinaryApplications: {
      curry_base: {
        name: 'Curry Base',
        method: 'toast and grind',
        timing: 'beginning of cooking',
        pairings: ['cumin', 'fennel', 'peppercorns'],
        ratios: '2:1:1 (coriander:cumin:other spices)',
        techniques: {
          dry_toasting: 'until fragrant and color changes',
          wet_grinding: 'with aromatics for paste',
          whole_tempering: 'crack and bloom in oil',
        },
      },
      pickling_spice: {
        name: 'Pickling Spice',
        method: 'use whole',
        timing: 'add to brine',
        pairings: ['dill', 'mustard seed', 'bay leaf'],
        ratios: '2 tbsp per quart',
        techniques: {
          hot_brine: 'add to heating liquid',
          fermentation: 'add at start',
          quick_pickle: 'lightly crush first',
        },
      },
    },
  },

  cumin_seeds: {
    name: 'Cumin Seeds',
    elementalProperties: { Earth: 0.4, Fire: 0.3, Air: 0.2, Water: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Mercury', 'Saturn'],
      favorableZodiac: ['virgo', 'capricorn'],
      elementalAffinity: {
        base: 'Earth',
        decanModifiers: {
          first: { element: 'Earth', planet: 'Mercury' },
          second: { element: 'Fire', planet: 'Saturn' },
          third: { element: 'Air', planet: 'Uranus' },
        },
      },
    },
    qualities: ['earthy', 'warm', 'pungent'],
    origin: ['India', 'Iran', 'Turkey'],
    category: 'spice',
    subCategory: 'whole',
    varieties: {
      Indian: {
        name: 'Indian',
        appearance: 'small, dark',
        flavor: 'intense, earthy',
        uses: 'curries, tempering',
      },
      Iranian: {
        name: 'Iranian',
        appearance: 'longer seeds',
        flavor: 'more delicate',
        uses: 'rice dishes, kebabs',
      },
    },
    culinaryApplications: {
      tempering: {
        name: 'Tempering',
        method: 'bloom in hot oil',
        timing: 'start of cooking',
        pairings: ['mustard seeds', 'curry leaves'],
        ratios: '1-2 tsp per dish',
        techniques: {
          tadka: 'bloom and pour over',
          pilaf_base: 'start rice dishes',
          oil_infusion: 'longer steep for oil',
        },
      },
      meat_rubs: {
        name: 'Meat Rubs',
        method: 'toast and grind',
        timing: 'before cooking',
        pairings: ['coriander', 'black pepper', 'chili'],
        ratios: '1 tbsp per pound',
        techniques: {
          dry_rub: 'grind with other spices',
          paste: 'grind with wet ingredients',
          marinade_base: 'infuse in oil first',
        },
      },
    },
  },

  caraway_seeds: {
    name: 'Caraway Seeds',
    elementalProperties: { Air: 0.4, Earth: 0.3, Fire: 0.2, Water: 0.1 },
    qualities: ['warming', 'sharp', 'slightly sweet'],
    origin: ['Netherlands', 'Eastern Europe', 'Finland'],
    category: 'spice',
    subCategory: 'whole',
    varieties: {
      Dutch: {
        name: 'Dutch',
        appearance: 'curved, dark',
        flavor: 'traditional strength',
        uses: 'bread, cheese',
      },
      Finnish: {
        name: 'Finnish',
        appearance: 'slightly larger',
        flavor: 'more intense',
        uses: 'rye bread, aquavit',
      },
    },
    culinaryApplications: {
      bread_baking: {
        name: 'Bread Baking',
        method: 'whole seeds in dough',
        timing: 'during mixing',
        pairings: ['rye flour', 'fennel', 'salt'],
        ratios: '1-2 tbsp per loaf',
        techniques: {
          traditional_rye: 'heavy seeding',
          light_rye: 'sparse seeding',
          crust_topping: 'press into top',
        },
      },
      sauerkraut: {
        name: 'Sauerkraut',
        method: 'add whole to cabbage',
        timing: 'during fermentation setup',
        pairings: ['juniper', 'bay leaf', 'black pepper'],
        ratios: '1 tbsp per quart',
        techniques: {
          traditional: 'whole seeds throughout',
          spice_packet: 'contained in muslin',
          layered: 'between cabbage layers',
        },
      },
    },
  },
};

// Fix the ingredient mappings to ensure they have all required properties
// ✅ Pattern MM-1: Type assertion for ZodiacSign[] compatibility
export const wholeSpices: Record<string, IngredientMapping> = fixIngredientMappings(
  rawWholeSpices as Record<string, Partial<IngredientMapping>>,
);
