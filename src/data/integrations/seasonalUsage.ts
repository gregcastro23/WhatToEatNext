import { herbs } from '../ingredients/herbs';
import { CuisineType } from '@/types/alchemy';

export const seasonalHerbGuide = {
  spring: {
    fresh: ['chives', 'parsley', 'mint', 'dill'],
    growing: ['basil', 'oregano', 'thyme'],
    cuisines: {
      [CuisineType.MEDITERRANEAN]: {
        combinations: ['mint + parsley', 'dill + garlic'],
        dishes: ['spring lamb', 'fresh salads']
      }
    }
  },
  summer: {
    fresh: ['basil', 'cilantro', 'tarragon'],
    peak: ['oregano', 'thyme', 'sage'],
    cuisines: {
      [CuisineType.ITALIAN]: {
        combinations: ['basil + tomato', 'oregano + garlic'],
        dishes: ['pesto', 'marinara']
      }
    }
  }
  // ... other seasons
};
