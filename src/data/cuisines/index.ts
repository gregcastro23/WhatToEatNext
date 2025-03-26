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
        breakfast: { all: [] },
        lunch: { all: [] },
        dinner: { all: [] },
        dessert: { all: [] }
    },
    elementalBalance: {
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
            breakfast: cuisine.dishes?.breakfast || { all: [] },
            lunch: cuisine.dishes?.lunch || { all: [] },
            dinner: cuisine.dishes?.dinner || { all: [] },
            dessert: cuisine.dishes?.dessert || { all: [] }
        },
        elementalBalance: cuisine.elementalBalance || { ...baseCuisine.elementalBalance }
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