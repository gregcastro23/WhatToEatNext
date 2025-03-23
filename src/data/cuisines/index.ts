import type { Cuisine } from '@/types/recipe';

// Import all cuisines
import { chinese } from './chinese';
import { french } from './french';
import { greek } from './greek';
import { indian } from './indian';
import { italian } from './italian';
import { japanese } from './japanese';
import { korean } from './korean';
import { mexican } from './mexican';
import { middleEastern } from './middle-eastern';
import { russian } from './russian';
import { thai } from './thai';
import { vietnamese } from './vietnamese';
import { african } from './african';

// Create a base cuisine structure
const baseCuisine: Cuisine = {
    name: '',
    description: '',
    dishes: {
        breakfast: { 
            all: [],
            spring: [],
            summer: [],
            autumn: [],
            winter: []
        },
        lunch: { 
            all: [],
            spring: [],
            summer: [],
            autumn: [],
            winter: []
        },
        dinner: { 
            all: [],
            spring: [],
            summer: [],
            autumn: [],
            winter: []
        },
        dessert: { 
            all: [],
            spring: [],
            summer: [],
            autumn: [],
            winter: []
        }
    },
    traditionalSauces: {},
    sauceRecommender: {
        forProtein: {},
        forVegetable: {},
        forCookingMethod: {},
        byAstrological: {},
        byRegion: {}
    },
    cookingTechniques: [],
    regionalCuisines: {},
    elementalProperties: {
        Fire: 0,
        Water: 0.75,
        Earth: 0.65,
        Air: 0
    }
};

// Ensure each cuisine has the proper structure
const ensureCuisineStructure = (cuisine: Partial<Cuisine>): Cuisine => {
    if (!cuisine) return { ...baseCuisine };
    
    return {
        name: cuisine.name || '',
        description: cuisine.description || '',
        dishes: {
            breakfast: {
                all: cuisine.dishes?.breakfast?.all || [],
                spring: cuisine.dishes?.breakfast?.spring || [],
                summer: cuisine.dishes?.breakfast?.summer || [],
                autumn: cuisine.dishes?.breakfast?.autumn || [],
                winter: cuisine.dishes?.breakfast?.winter || []
            },
            lunch: {
                all: cuisine.dishes?.lunch?.all || [],
                spring: cuisine.dishes?.lunch?.spring || [],
                summer: cuisine.dishes?.lunch?.summer || [],
                autumn: cuisine.dishes?.lunch?.autumn || [],
                winter: cuisine.dishes?.lunch?.winter || []
            },
            dinner: {
                all: cuisine.dishes?.dinner?.all || [],
                spring: cuisine.dishes?.dinner?.spring || [],
                summer: cuisine.dishes?.dinner?.summer || [],
                autumn: cuisine.dishes?.dinner?.autumn || [],
                winter: cuisine.dishes?.dinner?.winter || []
            },
            dessert: {
                all: cuisine.dishes?.dessert?.all || [],
                spring: cuisine.dishes?.dessert?.spring || [],
                summer: cuisine.dishes?.dessert?.summer || [],
                autumn: cuisine.dishes?.dessert?.autumn || [],
                winter: cuisine.dishes?.dessert?.winter || []
            }
        },
        traditionalSauces: cuisine.traditionalSauces || {},
        sauceRecommender: {
            forProtein: cuisine.sauceRecommender?.forProtein || {},
            forVegetable: cuisine.sauceRecommender?.forVegetable || {},
            forCookingMethod: cuisine.sauceRecommender?.forCookingMethod || {},
            byAstrological: cuisine.sauceRecommender?.byAstrological || {},
            byRegion: cuisine.sauceRecommender?.byRegion || {}
        },
        cookingTechniques: cuisine.cookingTechniques || [],
        regionalCuisines: cuisine.regionalCuisines || {},
        elementalProperties: cuisine.elementalProperties || 
                           cuisine.elementalState || // For backward compatibility
                           { ...baseCuisine.elementalProperties }
    };
};

// Create and export the cuisines map with validated structures
export const cuisinesMap = {
    African: ensureCuisineStructure(african),
    Chinese: ensureCuisineStructure(chinese),
    French: ensureCuisineStructure(french),
    Greek: ensureCuisineStructure(greek),
    Indian: ensureCuisineStructure(indian),
    Italian: ensureCuisineStructure(italian),
    Japanese: ensureCuisineStructure(japanese),
    Korean: ensureCuisineStructure(korean),
    Mexican: ensureCuisineStructure(mexican),
    'Middle Eastern': ensureCuisineStructure(middleEastern),
    Russian: ensureCuisineStructure(russian),
    Thai: ensureCuisineStructure(thai),
    Vietnamese: ensureCuisineStructure(vietnamese)
} as const;

export type CuisineName = keyof typeof cuisinesMap;
export default cuisinesMap;

// Element properties for the refined culinary search
export const CUISINES = {
  chinese: {
    name: 'Chinese',
    elementalProperties: {
      Fire: 0.3,
      Water: 0.3,
      Earth: 0.3,
      Air: 0.1
    }
  },
  japanese: {
    name: 'Japanese',
    elementalProperties: {
      Fire: 0.2,
      Water: 0.4,
      Earth: 0.2,
      Air: 0.2
    }
  },
  indian: {
    name: 'Indian',
    elementalProperties: {
      Fire: 0.4,
      Water: 0.2,
      Earth: 0.2,
      Air: 0.2
    }
  },
  french: {
    name: 'French',
    elementalProperties: {
      Fire: 0.2,
      Water: 0.3,
      Earth: 0.3,
      Air: 0.2
    }
  },
  italian: {
    name: 'Italian',
    elementalProperties: {
      Fire: 0.3,
      Earth: 0.4,
      Water: 0.2,
      Air: 0.1
    }
  },
  african: {
    name: 'African',
    elementalProperties: {
      Fire: 0.3,
      Earth: 0.4,
      Water: 0.2,
      Air: 0.1
    }
  },
  middleEastern: {
    name: 'Middle Eastern',
    elementalProperties: {
      Fire: 0.3,
      Earth: 0.3,
      Water: 0.2,
      Air: 0.2
    }
  },
  greek: {
    name: 'Greek',
    elementalProperties: {
      Fire: 0.2,
      Earth: 0.3,
      Water: 0.3,
      Air: 0.2
    }
  },
  mexican: {
    name: 'Mexican',
    elementalProperties: {
      Fire: 0.5,
      Earth: 0.3,
      Water: 0.1,
      Air: 0.1
    }
  },
  thai: {
    name: 'Thai',
    elementalProperties: {
      Fire: 0.4,
      Water: 0.3,
      Earth: 0.2,
      Air: 0.1
    }
  },
  vietnamese: {
    name: 'Vietnamese',
    elementalProperties: {
      Water: 0.4,
      Fire: 0.2,
      Earth: 0.2,
      Air: 0.2
    }
  },
  korean: {
    name: 'Korean',
    elementalProperties: {
      Fire: 0.3,
      Earth: 0.3,
      Water: 0.2,
      Air: 0.2
    }
  },
  russian: {
    name: 'Russian',
    elementalProperties: {
      Earth: 0.5,
      Water: 0.2,
      Fire: 0.2,
      Air: 0.1
    }
  }
} as const;

// Type for cuisine data
export type CuisineData = {
  name: string;
  elementalProperties: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  };
};

// Ensure type safety
export type Cuisines = typeof CUISINES;