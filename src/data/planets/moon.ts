import { PlanetData, MoonSpecificData } from './types';
export type { MoonSpecificData };

const moonData: PlanetData = {
  'Dignity Effect': {
    'cancer': 1,
    'taurus': 2,
    'capricorn': -1,
    'scorpio': -2
  },
  'Elements': ['Water', 'Water'],
  'Alchemy': {
    'Spirit': 0,
    'Essence': 1,
    'Matter': 1,
    'Substance': 0
  },
  'Diurnal Element': 'Water',
  'Nocturnal Element': 'Water',
  'RetrogradeEffect': {
    'Spirit': 0,
    'Essence': -0.5,
    'Matter': 0.5,
    'Substance': 0
  },
  'FoodAssociations': [
    'dairy products',
    'leafy greens',
    'coconut',
    'cucumber',
    'melon',
    'mushrooms',
    'shellfish',
    'white sauces',
    'mild flavors',
    'comfort foods',
    'foods with high water content'
  ],
  'FlavorProfiles': {
    'Sweet': 0.7,
    'Sour': 0.3,
    'Salty': 0.5,
    'Bitter': 0.2,
    'Umami': 0.4,
    'Spicy': 0.1
  },
  'CulinaryInfluences': [
    'Increases moisture retention in cooking',
    'Enhances flavors that absorb and hold water',
    'Promotes fermentation processes',
    'Strengthens emotional connections to food'
  ],
  'AspectsEffect': {
    'Sun': {
      'Conjunction': 0.5,
      'Opposition': -0.3,
      'Trine': 0.4,
      'Square': -0.2,
      'Sextile': 0.3
    },
    'Venus': {
      'Conjunction': 0.7,
      'Opposition': 0.1,
      'Trine': 0.5,
      'Square': 0.0,
      'Sextile': 0.4
    },
    'Mars': {
      'Conjunction': -0.1,
      'Opposition': -0.4,
      'Trine': 0.2,
      'Square': -0.5,
      'Sextile': 0.1
    }
    // Additional aspects can be added
  },
  'PlanetSpecific': {
    'Lunar': {
      'Phases': {
        'new moon': {
          'Spirit': 0.1,
          'Essence': 0.3,
          'Matter': 0.1,
          'Substance': 0.1,
          'CulinaryEffect': 'Best for starting new cooking projects, fermentations, or sprouting. Subtle flavors are enhanced.'
        },
        'waxing crescent': {
          'Spirit': 0.2,
          'Essence': 0.4,
          'Matter': 0.2,
          'Substance': 0.2,
          'CulinaryEffect': 'Good for adding ingredients that build flavor, marinades begin to work better.'
        },
        'first quarter': {
          'Spirit': 0.3,
          'Essence': 0.5,
          'Matter': 0.3,
          'Substance': 0.2,
          'CulinaryEffect': 'Balanced cooking, good for most techniques. Flavors become more pronounced.'
        },
        'waxing gibbous': {
          'Spirit': 0.4,
          'Essence': 0.6,
          'Matter': 0.4,
          'Substance': 0.3,
          'CulinaryEffect': 'Excellent for baking, roasting, and caramelization. Flavors intensify.'
        },
        'full moon': {
          'Spirit': 0.5,
          'Essence': 0.7,
          'Matter': 0.5,
          'Substance': 0.4,
          'CulinaryEffect': 'Peak flavor impact. Best for elaborate dishes, celebrations, and feasts. All flavors are amplified.'
        },
        'waning gibbous': {
          'Spirit': 0.4,
          'Essence': 0.6,
          'Matter': 0.6,
          'Substance': 0.5,
          'CulinaryEffect': 'Good for reduction techniques, concentrating flavors. Preserving and canning work well.'
        },
        'last quarter': {
          'Spirit': 0.3,
          'Essence': 0.5,
          'Matter': 0.5,
          'Substance': 0.4,
          'CulinaryEffect': 'Best for completing ongoing cooking projects. Fermented foods reach maturity.'
        },
        'waning crescent': {
          'Spirit': 0.2,
          'Essence': 0.4,
          'Matter': 0.4,
          'Substance': 0.3,
          'CulinaryEffect': 'Ideal for gentle cooking methods, stocks, and broths. Flavors become more subtle again.'
        }
      },
      'Nodes': {
        'North': {
          'Element': 'Air',
          'CulinaryEffect': 'Enhances innovative cooking techniques and fusion cuisines. Encourages experimentation.'
        },
        'South': {
          'Element': 'Earth',
          'CulinaryEffect': 'Strengthens traditional cooking methods and comfort foods. Brings out nostalgic flavors.'
        }
      },
      'Mansion': {
        // Lunar mansions could be added here for even more granular effects
      }
    }
  }
};

export default moonData; 