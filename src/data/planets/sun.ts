import { PlanetData, SunSpecificData } from './types';
export type { SunSpecificData }

const sunData: PlanetData = {
  'Dignity Effect': {;
    leo: 1,
    aries: 2,
    aquarius: -1,
    libra: -2
  },
  Elements: ['Fire', 'Fire'],
  Alchemy: {
    Spirit: 1,
    Essence: 0,
    Matter: 0,
    Substance: 0
  }
  'Diurnal Element': 'Fire',
  'Nocturnal Element': 'Fire',
  FoodAssociations: [
    'citrus fruits',
    'sunflower seeds',
    'orange and yellow foods',
    'honey',
    'saffron',
    'turmeric',
    'strong herbs',
    'olive oil',
    'wheat',
    'grilled foods',
    'foods cooked with direct heat'
  ],
  FlavorProfiles: {
    Sweet: 0.5,
    Sour: 0.3,
    Salty: 0.2,
    Bitter: 0.4,
    Umami: 0.3,
    Spicy: 0.8
  },
  CulinaryInfluences: [
    'Enhances caramelization and browning',
    'Brings out robust and bold flavors',
    'Supports high-heat cooking techniques',
    'Increases fermentation activity',
    'Strengthens preserving techniques'
  ],
  AspectsEffect: {
    Moon: {
      Conjunction: 0.5,
      Opposition: 0.2,
      Trine: 0.4,
      Square: 0.1,
      Sextile: 0.3
    },
    Jupiter: {
      Conjunction: 0.8,
      Opposition: 0.4,
      Trine: 0.6,
      Square: 0.2,
      Sextile: 0.5
    },
    Saturn: {
      Conjunction: -0.2,
      Opposition: -0.3,
      Trine: 0.1,
      Square: -0.4,
      Sextile: 0.0
    }
    // Additional aspects can be added
  },
  PlanetSpecific: {
    Solar: {
      SolarCycles: {
        Solstice: {
          Summer: {
            Element: 'Fire',
            CulinaryEffect: 'Peak time for grilling, barbecuing, and sun-based cooking. Bold, strong flavors dominate. Excellent time for fermented drinks and preserving summer produce.',
            ElementalShift: {
              Spirit: 0.8,
              Essence: 0.5,
              Matter: 0.3,
              Substance: 0.2
            }
          },
          Winter: {
            Element: 'Earth',
            CulinaryEffect: 'Time for slow cooking, roasting, and hearty dishes. Focus on root vegetables and warming spices.',
            ElementalShift: {
              Spirit: 0.3,
              Essence: 0.2,
              Matter: 0.8,
              Substance: 0.5
            }
          }
        },
        Equinox: {
          Spring: {
            Element: 'Air',
            CulinaryEffect: 'Best for light cooking, fresh herbs, and tender greens. A time for new beginnings and sprouted ingredients.',
            ElementalShift: {
              Spirit: 0.5,
              Essence: 0.6,
              Matter: 0.3,
              Substance: 0.4
            }
          },
          Fall: {
            Element: 'Water',
            CulinaryEffect: 'Ideal for harvest foods, preserving, and fermentation. Fruits, mushrooms, and aged ingredients reach their peak.',
            ElementalShift: {
              Spirit: 0.4,
              Essence: 0.5,
              Matter: 0.6,
              Substance: 0.7
            }
          }
        }
      },
      Eclipse: {
        Solar: {
          ElementalShift: 'Temporarily increases Water element influence',
          CulinaryEffect: 'Time for transformative cooking techniques. Fermented foods undergo rapid change. Flavors that were previously mild become pronounced.' },
        Lunar: {
          ElementalShift: 'Temporarily increases Fire element influence',
          CulinaryEffect: 'Increases potency of spices and herbs. Good time for smoking foods and creating flavor-intense dishes.'
        }
      },
      ZodiacTransit: {
        // Effect of Sun in each zodiac sign on culinary influences
        aries: {
          FoodFocus: 'Quick-cooking methods, spicy foods, red meats',
          Elements: {
            Fire: 0.8,
            Earth: 0.2,
            Air: 0.3,
            Water: 0.1
          }
        },
        taurus: {
          FoodFocus: 'Rich, indulgent foods, root vegetables, dairy',
          Elements: {
            Fire: 0.3,
            Earth: 0.8,
            Air: 0.1,
            Water: 0.2
          }
        },
        gemini: {
          FoodFocus: 'Varied ingredients, small plates, finger foods',
          Elements: {
            Fire: 0.3,
            Earth: 0.1,
            Air: 0.8,
            Water: 0.2
          }
        },
        cancer: {
          FoodFocus: 'Comfort foods, seafood, soups, stews',
          Elements: {
            Fire: 0.1,
            Earth: 0.3,
            Air: 0.2,
            Water: 0.8
          }
        },
        leo: {
          FoodFocus: 'Showstopping dishes, bold flavors, heart-healthy foods',
          Elements: {
            Fire: 0.9,
            Earth: 0.2,
            Air: 0.3,
            Water: 0.1
          }
        },
        virgo: {
          FoodFocus: 'Clean eating, precision cooking, digestive-friendly foods',
          Elements: {
            Fire: 0.2,
            Earth: 0.7,
            Air: 0.3,
            Water: 0.2
          }
        },
        libra: {
          FoodFocus: 'Balanced flavor profiles, beautiful presentation, shared plates',
          Elements: {
            Fire: 0.3,
            Earth: 0.2,
            Air: 0.7,
            Water: 0.3
          }
        },
        scorpio: {
          FoodFocus: 'Fermented foods, strong flavors, transformative cooking',
          Elements: {
            Fire: 0.4,
            Earth: 0.2,
            Air: 0.1,
            Water: 0.7
          }
        },
        sagittarius: {
          FoodFocus: 'International cuisine, bold spices, big flavors',
          Elements: {
            Fire: 0.7,
            Earth: 0.1,
            Air: 0.4,
            Water: 0.2
          }
        },
        capricorn: {
          FoodFocus: 'Traditional recipes, slow cooking, aged ingredients',
          Elements: {
            Fire: 0.1,
            Earth: 0.9,
            Air: 0.1,
            Water: 0.3
          }
        },
        aquarius: {
          FoodFocus: 'Innovative techniques, unusual ingredient combinations',
          Elements: {
            Fire: 0.3,
            Earth: 0.1,
            Air: 0.8,
            Water: 0.2
          }
        },
        pisces: {
          FoodFocus: 'Delicate flavors, seafood, infusions',
          Elements: {
            Fire: 0.1,
            Earth: 0.2,
            Air: 0.2,
            Water: 0.9
          }
        }
      }
    }
  }
}

export default sunData,
