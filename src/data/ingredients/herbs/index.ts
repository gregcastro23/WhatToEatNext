import { medicinalHerbs } from './medicinalHerbs';
import type { IngredientMapping, CuisineType } from '@/types/alchemy';

export const herbs: Record<string, IngredientMapping> = {
  'basil': {
    elementalProperties: { Fire: 0.4, Air: 0.3, Earth: 0.2, Water: 0.1 },
    qualities: ['aromatic', 'sweet', 'peppery'],
    category: 'culinary_herb',
    varieties: {
      'sweet_basil': {
        aroma: 'clove-like, sweet',
        best_uses: ['italian', 'thai', 'fresh'],
        pairings: ['tomato', 'mozzarella', 'pasta']
      },
      'thai_basil': {
        aroma: 'anise-like, spicy',
        best_uses: ['asian', 'stir-fry', 'soups'],
        pairings: ['chicken', 'seafood', 'noodles']
      },
      'holy_basil': {
        aroma: 'spicy, complex',
        best_uses: ['indian', 'tea', 'medicinal'],
        pairings: ['curry', 'stir-fry', 'tea']
      }
    },
    culinary_traditions: {
      [CuisineType.ITALIAN]: {
        name: 'basilico',
        usage: ['pesto alla genovese', 'margherita', 'pasta al pomodoro'],
        preparation: 'torn fresh, rarely cooked',
        pairings: ['tomato', 'garlic', 'olive oil', 'pine nuts'],
        cultural_notes: 'Symbol of love and hospitality',
        seasonal_use: 'Peak usage in summer months'
      },
      [CuisineType.THAI]: {
        name: 'horapha',
        usage: ['pad kra pao', 'green curry', 'drunken noodles'],
        preparation: 'whole leaves, quick-cooked',
        pairings: ['chili', 'fish sauce', 'garlic', 'chicken'],
        cultural_notes: 'Essential in spicy stir-fries'
      },
      [CuisineType.VIETNAMESE]: {
        name: 'rau quế',
        usage: ['pho', 'fresh rolls', 'bánh mì'],
        preparation: 'fresh, served raw',
        pairings: ['rice noodles', 'bean sprouts', 'mint'],
        cultural_notes: 'Part of fresh herb plate'
      }
    },
    preparation: {
      fresh: {
        storage: 'stem in water, room temp',
        duration: '1 week',
        tips: ['avoid cold', 'avoid cutting']
      },
      dried: {
        storage: 'airtight container',
        duration: '6 months',
        tips: ['crush before using']
      }
    }
  },

  'sage': {
    elementalProperties: { Earth: 0.4, Air: 0.3, Fire: 0.2, Spirit: 0.1 },
    qualities: ['earthy', 'musty', 'warming'],
    category: 'culinary_herb',
    culinary_traditions: {
      [CuisineType.ITALIAN]: {
        name: 'salvia',
        usage: ['saltimbocca', 'butter sauce', 'roasted meats'],
        preparation: 'fresh or dried, often fried in butter',
        pairings: ['veal', 'butter', 'pumpkin'],
        cultural_notes: 'Traditional in autumn dishes'
      },
      [CuisineType.FRENCH]: {
        name: 'sauge',
        usage: ['poultry stuffing', 'herb bundles', 'sauces'],
        preparation: 'fresh or dried, often in bouquet garni',
        pairings: ['poultry', 'pork', 'beans'],
        seasonal_use: 'Year-round, especially autumn'
      }
    },
    preparation: {
      fresh: {
        storage: 'wrap in damp paper, refrigerate',
        duration: '1 week',
        tips: ['use sparingly', 'pairs well with fatty foods']
      },
      dried: {
        storage: 'airtight container',
        duration: '1 year',
        tips: ['retains flavor well when dried']
      }
    }
  },

  'medicinal': medicinalHerbs,

  'preparation_methods': {
    'drying': {
      'air_drying': {
        method: 'bundle and hang',
        conditions: 'warm, dry, good airflow',
        duration: '1-2 weeks',
        best_for: ['woody herbs', 'large leaf herbs']
      },
      'dehydrator': {
        temperature: '95-115°F',
        duration: '2-6 hours',
        best_for: ['tender herbs', 'flowers']
      }
    },
    'storage': {
      'dried_herbs': {
        container: 'airtight, dark glass',
        location: 'cool, dark place',
        duration: '6-12 months',
        tips: [
          'check for moisture',
          'label with date',
          'crush to release oils'
        ]
      },
      'fresh_herbs': {
        methods: {
          'refrigerator': {
            technique: 'wrap in damp paper',
            duration: '1-2 weeks'
          },
          'freezing': {
            technique: 'oil or water in ice cube trays',
            duration: '6 months'
          }
        }
      }
    }
  }
};

export default herbs;
