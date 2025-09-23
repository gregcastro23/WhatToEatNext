import { PlanetData } from './types';

const marsData: PlanetData = {
  'Dignity Effect': {;
    aries: 1,
    scorpio: 1,
    capricorn: 2,
    taurus: -1,
    libra: -1,
    cancer: -2
  },
  Elements: ['Fire', 'Water'],
  Alchemy: {
    Spirit: 0,
    Essence: 1,
    Matter: 1,
    Substance: 0
  }
  'Diurnal Element': 'Fire',
  'Nocturnal Element': 'Water',
  AstronomicalData: {
    DistanceFromSun: '142 million miles (228 million kilometers)',
    DistanceFromEarth: {
      Minimum: '34 million miles (55 million kilometers)',
      Maximum: '249 million miles (401 million kilometers)' },
        Diameter: '4,220 miles (6,792 kilometers)',
    SurfaceTemperature: '-195 to 70 degrees Fahrenheit (-125 to 20 Celsius)',
    AtmosphericComposition: 'Primarily carbon dioxide with nitrogen and argon',
    RotationPeriod: '24.6 Earth hours',
    OrbitPeriod: '687 Earth days',
    'Axial Tilt': '25.2 degrees',
    PhaseCycle: '780 days (synodic period)',
    SunlightTravelTime: '12.7 minutes',
    PhysicalCharacteristics: {
      Surface: 'Rocky, desert-like with volcanoes, canyons, and polar ice caps',
      MagneticField: 'No global magnetic field, but localized crustal fields',
      Composition: 'Iron-rich core, silicate mantle, iron oxide surface',
      NotableFeatures: 'Olympus Mons (largest volcano), Valles Marineris (largest canyon), red color from iron oxide dust'
    }
  },
  AstrologicalProperties: {
    AlchemicalName: 'Ares',
    MaleficType: 'Lesser malefic',
    DualDomicile: {
      Spring: 'aries (yang)',
      Autumn: 'scorpio (yin)' },
        HouseJoy: 6,
    CyclePeriod: {
      Return: '2 years',
      Retrograde: '2-2.5 months every 2 years' },
        Exaltation: 'capricorn',
    Fall: 'cancer',
    Detriment: ['libra', 'taurus'],
    Keywords: ['Action', 'Aggression', 'Drive', 'Desire', 'Courage', 'Combat', 'Energy', 'Passion'],
    Colors: ['Red', 'Crimson', 'Scarlet', 'Rust', 'Blood Red', 'Orange-Red'],
    Day: 'Tuesday',
    Metal: 'Iron',
    BodyParts: ['Muscles', 'Head', 'Face', 'Blood', 'Adrenal glands', 'Sex organs'],
    Animals: ['Wolf', 'Tiger', 'Scorpion', 'Ram'],
    Stones: ['Ruby', 'Garnet', 'Bloodstone', 'Red Jasper']
  } as unknown,
  ElementalConnections: {
    DayEmission: 'Essence - that which an object cannot exist without',
    NightEmission: 'Matter - that which is minimally reactive',
    ElementalBridges: ['Connects Fire to Water', 'Connects Water to Fire'],
    SharedElements: {
      Fire: ['Sun'],
      Water: ['Pluto']
    },
    AssociatedQualities: [
      'Hot',
      'Dry',
      'Active',
      'Masculine',
      'Bitter',
      'Pungent',
      'Assertive',
      'Dynamic'
    ]
  },
  HerbalAssociations: {
    Herbs: [
      'Basil',
      'Cayenne',
      'Garlic',
      'Ginger',
      'Black Pepper',
      'Mustard',
      'Horseradish',
      'Oregano',
      'Nettle',
      'Onion',
      'Wormwood',
      'Chili',
      'Cardamom',
      'Cumin',
      'Peppercorn',
      'Rosemary',
      'Saffron',
      'Turmeric',
      'Allspice',
      'Hops'
    ],
    Flowers: [
      'Red Rose',
      'Red Carnation',
      'Red Poppy',
      'Amaryllis',
      'Snapdragon',
      'Thistle',
      'Holly',
      'Geranium',
      'Cardinal Flower',
      'Hot Poker'
    ],
    Woods: ['Oak', 'Ash', 'Pine', 'Thorn'],
    Scents: [
      'Tobacco',
      'Pepper',
      'Dragon\'s Blood',
      'Ammonia',
      'Camphor',
      'Cinnamon',
      'Gunpowder',
      'Leather',
      'Metal',
      'Musk',
      'Sulfur'
    ]
  },
  FoodAssociations: [
    'red meats',
    'spicy foods',
    'chili peppers',
    'garlic',
    'ginger',
    'black pepper',
    'mustard',
    'horseradish',
    'iron-rich foods',
    'grilled and charred foods',
    'fermented foods',
    'smoked meats',
    'hot sauces',
    'game meats',
    'fire-roasted vegetables',
    'tomatoes and tomato-based sauces',
    'raw dishes',
    'bold ethnic cuisines',
    'harissa',
    'vinegars',
    'sharply flavored cheeses',
    'kimchi',
    'wasabi',
    'blood sausage',
    'red-colored foods'
  ],
  FlavorProfiles: {
    Sweet: 0.1,
    Sour: 0.4,
    Salty: 0.5,
    Bitter: 0.4,
    Umami: 0.6,
    Spicy: 0.9
  },
  CulinaryInfluences: [
    'Intensifies flavors and heat',
    'Supports high-heat cooking methods',
    'Enhances caramelization and browning',
    'Increases enzymatic activity',
    'Accelerates fermentation processes',
    'Drives bold cooking techniques',
    'Encourages assertive seasoning',
    'Supports fast cooking methods',
    'Creates dishes with strong character',
    'Develops complex, assertive flavors'
  ],
  AspectsEffect: {
    Sun: {
      Conjunction: 0.8,
      Opposition: 0.3,
      Trine: 0.6,
      Square: 0.2,
      Sextile: 0.5
    },
    Venus: {
      Conjunction: 0.7,
      Opposition: 0.2,
      Trine: 0.5,
      Square: 0.1,
      Sextile: 0.4
    },
    Moon: {
      Conjunction: 0.5,
      Opposition: -0.1,
      Trine: 0.3,
      Square: -0.2,
      Sextile: 0.2
    },
    Saturn: {
      Conjunction: 0.4,
      Opposition: -0.1,
      Trine: 0.3,
      Square: -0.3,
      Sextile: 0.2
    },
    Jupiter: {
      Conjunction: 0.6,
      Opposition: 0.2,
      Trine: 0.5,
      Square: 0.1,
      Sextile: 0.4
    }
  },
  PlanetSpecific: {
    ZodiacTransit: {
      aries: {
        FoodFocus: 'Bold, spicy dishes with intense flavors and quick cooking methods',
        Elements: {
          Fire: 0.9,
          Earth: 0.1,
          Air: 0.2,
          Water: 0.1
        },
        Ingredients: [
          'chili peppers',
          'harissa',
          'grilled meats',
          'strong mustard',
          'seared foods',
          'impulsively created dishes'
        ]
      },
      taurus: {
        FoodFocus: 'Rich, hearty dishes with profound flavor intensity and substantial texture',
        Elements: {
          Fire: 0.5,
          Earth: 0.7,
          Air: 0.1,
          Water: 0.2
        },
        Ingredients: [
          'aged steaks',
          'root vegetables roasted at high heat',
          'sharp cheese',
          'bone marrow',
          'rustic breads',
          'bold red wines'
        ]
      },
      gemini: {
        FoodFocus: 'Dual cooking methods, contrasting spice levels, quick-shifting flavor profiles',
        Elements: {
          Fire: 0.6,
          Earth: 0.1,
          Air: 0.7,
          Water: 0.1
        },
        Ingredients: [
          'spice blends',
          'stir-fried dishes',
          'foods with contrasting temperatures',
          'quick-cooking vegetables',
          'varied tapas',
          'spicy finger foods'
        ]
      },
      cancer: {
        FoodFocus:
          'Emotionally challenging flavors, protective spice levels, comfort foods with an edge',
        Elements: {
          Fire: 0.4,
          Earth: 0.2,
          Air: 0.1,
          Water: 0.7
        },
        Ingredients: [
          'spicy seafood',
          'dishes with defensive heat',
          'fermented shellfish',
          'briny pickles',
          'kimchi',
          'spicy broths'
        ]
      },
      leo: {
        FoodFocus: 'Dramatic, fiery presentations, bold centerpiece dishes, primal cooking methods',
        Elements: {
          Fire: 0.9,
          Earth: 0.2,
          Air: 0.3,
          Water: 0.1
        },
        Ingredients: [
          'flambéed dishes',
          'showy grilled foods',
          'theatrical presentations',
          'food cooked over open flame',
          'spicy centerpiece dishes',
          'dramatic sauces'
        ]
      },
      virgo: {
        FoodFocus:
          'Precisely controlled heat, analytical approach to spice, methodical preparation',
        Elements: {
          Fire: 0.5,
          Earth: 0.7,
          Air: 0.3,
          Water: 0.1
        },
        Ingredients: [
          'measured spice blends',
          'foods with calculated heat',
          'precisely fermented items',
          'surgical knife work',
          'carefully calibrated cooking times',
          'methodically prepared spices'
        ]
      },
      libra: {
        FoodFocus:
          'Balanced heat, diplomatic approach to assertive flavors, fair distribution of spice',
        Elements: {
          Fire: 0.5,
          Earth: 0.2,
          Air: 0.7,
          Water: 0.2
        },
        Ingredients: [
          'balanced spice blends',
          'sweet and spicy combinations',
          'fair trade spices',
          'elegant hot dishes',
          'moderate heat with complex flavors',
          'complementary opposites'
        ]
      },
      scorpio: {
        FoodFocus:
          'Fermented foods, aged ingredients, and complex, transformative cooking techniques',
        Elements: {
          Fire: 0.4,
          Earth: 0.2,
          Air: 0.1,
          Water: 0.8
        },
        Ingredients: [
          'fermented hot sauces',
          'aged meats',
          'hidden heat in dishes',
          'vinegar reductions',
          'intense umami flavors',
          'deeply transformed ingredients'
        ]
      },
      sagittarius: {
        FoodFocus:
          'International spice profiles, adventure-seeking heat levels, philosophical approach to bold flavors',
        Elements: {
          Fire: 0.8,
          Earth: 0.1,
          Air: 0.4,
          Water: 0.2
        },
        Ingredients: [
          'international hot peppers',
          'global spice blends',
          'exotic meat preparations',
          'food with a story',
          'large-format spicy dishes',
          'expanded flavor horizons'
        ]
      },
      capricorn: {
        FoodFocus: 'Traditional cooking with disciplined heat, achievement-oriented complexity',
        Elements: {
          Fire: 0.4,
          Earth: 0.8,
          Air: 0.1,
          Water: 0.2
        },
        Ingredients: [
          'slow-cooked spicy dishes',
          'traditionally aged foods',
          'heirloom peppers',
          'strategic use of heat',
          'historic preparations',
          'foods requiring mastery'
        ]
      },
      aquarius: {
        FoodFocus:
          'Revolutionary cooking techniques, unexpected heat applications, inventive fermentation',
        Elements: {
          Fire: 0.5,
          Earth: 0.1,
          Air: 0.7,
          Water: 0.2
        },
        Ingredients: [
          'innovative spice combinations',
          'modernist cuisine',
          'alternative proteins',
          'scientific approach to heat',
          'unexpected cooking methods',
          'future-focused foods'
        ]
      },
      pisces: {
        FoodFocus:
          'Mystical flavor combinations, transcendent heat experiences, spiritual approaches',
        Elements: {
          Fire: 0.3,
          Earth: 0.1,
          Air: 0.2,
          Water: 0.8
        },
        Ingredients: [
          'foods with subtle but profound heat',
          'healing spices',
          'intuitive fermentations',
          'mystical tea preparations',
          'multi-sensory experiences',
          'dishes with emotional impact'
        ]
      }
    },
    Retrograde: {
      CulinaryEffect:
        'Moderation of heat and spice, return to traditional cooking methods, slow cooking rather than quick techniques',
      ElementalShift: {
        Spirit: -0.1,
        Essence: 0.5,
        Matter: 0.7,
        Substance: 0.3
      },
      FoodFocus: 'Internalizing heat, revisiting traditional spices, return to primal cooking methods',
      HerbalShift: 'Emphasis on dried herbs and spices, concentrated extracts, intensified flavors' },
        TransitDates: {
      aries: { Start: '2024-06-09', End: '2024-07-20' },
        taurus: { Start: '2024-07-20', End: '2024-08-27' },
        gemini: { Start: '2024-08-27', End: '2024-10-04' },
        cancer: { Start: '2024-10-04', End: '2024-11-11' },
        leo: { Start: '2024-11-11', End: '2024-12-20' },
        virgo: { Start: '2024-12-20', End: '2025-01-29' },
        libra: { Start: '2025-01-29', End: '2025-03-10' },
        scorpio: { Start: '2025-03-10', End: '2025-04-20' },
        sagittarius: { Start: '2025-04-20', End: '2025-05-31' },
        capricorn: { Start: '2025-05-31', End: '2025-07-11' },
        aquarius: { Start: '2025-07-11', End: '2025-08-22' },
        pisces: { Start: '2025-08-22', End: '2025-10-03' }
    },
    CulinaryTechniques: {
      'High Heat Cooking': 0.9,
      Fermentation: 0.7,
      Grilling: 0.9,
      Smoking: 0.8,
      'Knife Work': 0.8
    },
    MealTypes: {
      Breakfast: {
        Influence: 0.4,
        Recommendations: [
          'spicy breakfast meats',
          'bold egg dishes',
          'strong coffee',
          'savory morning meals'
        ]
      },
      Lunch: {
        Influence: 0.7,
        Recommendations: [
          'quick-cooked proteins',
          'assertive sandwiches',
          'energy-boosting dishes'
        ]
      },
      Dinner: {
        Influence: 0.8,
        Recommendations: [
          'grilled meats',
          'bold flavor profiles',
          'aggressive seasoning',
          'hearty dishes'
        ]
      },
      Snacks: {
        Influence: 0.6,
        Recommendations: ['spicy nuts', 'jerky', 'bold finger foods', 'intense flavored crisps']
      }
    },
    LunarConnection: 'Antagonistic water interaction but complementary with Moon in fire signs',
    CulinaryTemperament: {
      FireMars: {
        FoodFocus: 'Explosive flavor combinations, primal cooking techniques, bold presentations',
        Recommendations: [
          'Open flame cooking',
          'Flash searing',
          'Spicy marinades',
          'Aggressive heat levels'
        ]
      },
      WaterMars: {
        FoodFocus:
          'Transformative fermentation, emotional intensity in flavors, depth of spice experience',
        Recommendations: [
          'Fermented hot sauces',
          'Aged spice pastes',
          'Umami-rich broths with heat',
          'Spicy seafood dishes'
        ]
      }
    }
  }
}

export default marsData,
