"use strict";
import { african } from './african.js';
import { american } from './american.js';
import { chinese } from './chinese.js';
import { french } from './french.js';
import { greek } from './greek.js';
import { indian } from './indian.js';
import { italian } from './italian.js';
import { japanese } from './japanese.js';
import { korean } from './korean.js';
import { mexican } from './mexican.js';
import { middleEastern } from './middle-eastern.js';
import { russian } from './russian.js';
import { thai } from './thai.js';
import { vietnamese } from './vietnamese.js';
// Create a base cuisine structure
const baseCuisine = {
    id: 'base',
    name: '',
    description: '',
    motherSauces: {},
    dishes: {
        breakfast: {
            spring: [],
            summer: [],
            autumn: [],
            winter: []
        },
        lunch: {
            spring: [],
            summer: [],
            autumn: [],
            winter: []
        },
        dinner: {
            spring: [],
            summer: [],
            autumn: [],
            winter: []
        },
        dessert: {
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
        byRegion: {},
        byDietary: {}
    },
    cookingTechniques: [],
    regionalCuisines: {},
    elementalProperties: { Fire: 0, Water: 0.75, Earth: 0.65, Air: 0
    },
    astrologicalInfluences: []
};
// Process the recipes to combine seasonal and "all" categories
const processCuisineRecipes = (cuisine) => {
    if (!cuisine)
        return { ...baseCuisine };
    // Helper to combine "all" recipes with seasonal ones
    const combineRecipes = (mealType) => {
        if (!mealType)
            return { spring: [], summer: [], autumn: [], winter: [] };
        // Extract the "all" recipes that should be added to each season
        // Make sure "all" is an array even if it's not defined
        const allRecipes = Array.isArray(mealType.all) ? mealType.all : [];
        return {
            spring: [...(Array.isArray(mealType.spring) ? mealType.spring  : []), ...allRecipes],
            summer: [...(Array.isArray(mealType.summer) ? mealType.summer  : []), ...allRecipes],
            autumn: [...(Array.isArray(mealType.autumn) ? mealType.autumn  : []), ...allRecipes],
            winter: [...(Array.isArray(mealType.winter) ? mealType.winter  : []), ...allRecipes]
        };
    };
    // Ensure the cuisine has at least a valid ID and name
    const name = cuisine.name || '';
    const id = cuisine.id || 'cuisine-' + name.toLowerCase().replace(/\s+/g, '-');
    return {
        id,
        name,
        description: cuisine.description || '',
        motherSauces: cuisine.motherSauces || {},
        dishes: {
            breakfast: combineRecipes(cuisine.dishes?.breakfast),
            lunch: combineRecipes(cuisine.dishes?.lunch),
            dinner: combineRecipes(cuisine.dishes?.dinner),
            dessert: combineRecipes(cuisine.dishes?.dessert)
        },
        traditionalSauces: cuisine.traditionalSauces || {},
        sauceRecommender: {
            forProtein: cuisine.sauceRecommender?.forProtein || {},
            forVegetable: cuisine.sauceRecommender?.forVegetable || {},
            forCookingMethod: cuisine.sauceRecommender?.forCookingMethod || {},
            byAstrological: cuisine.sauceRecommender?.byAstrological || {},
            byRegion: cuisine.sauceRecommender?.byRegion || {},
            byDietary: cuisine.sauceRecommender?.byDietary || {}
        },
        cookingTechniques: Array.isArray(cuisine.cookingTechniques) ? cuisine.cookingTechniques : [],
        regionalCuisines: cuisine.regionalCuisines || {},
        elementalProperties: cuisine.elementalProperties ||
            cuisine.elementalState || // For backward compatibility
            { ...baseCuisine.elementalProperties },
        regionalVarieties: cuisine.regionalCuisines ? Object.keys(cuisine.regionalCuisines).length : 0,
        astrologicalInfluences: Array.isArray(cuisine.astrologicalInfluences) ? cuisine.astrologicalInfluences : []
    }; // Use type assertion to ensure the return type is Cuisine
};
// Create and export the cuisines map with validated structures
export { african, american, chinese, french, greek, indian, italian, japanese, korean, mexican, middleEastern, russian, thai, vietnamese };
// Element properties for the refined culinary search
export const CUISINES = {
    american: {
        name: 'American',
        elementalProperties: { Fire: 0.3, Water: 0.2, Earth: 0.3, Air: 0.2
        }
    },
    chinese: {
        name: 'Chinese',
        elementalProperties: { Fire: 0.3, Water: 0.3, Earth: 0.3, Air: 0.1
        }
    },
    japanese: {
        name: 'Japanese',
        elementalProperties: { Fire: 0.2, Water: 0.4, Earth: 0.2, Air: 0.2
        }
    },
    indian: {
        name: 'Indian',
        elementalProperties: { Fire: 0.4, Water: 0.2, Earth: 0.2, Air: 0.2
        }
    },
    french: {
        name: 'French',
        elementalProperties: { Fire: 0.2, Water: 0.3, Earth: 0.3, Air: 0.2
        }
    },
    italian: {
        name: 'Italian',
        elementalProperties: { Fire: 0.3, Earth: 0.4,
            Water: 0.2,
            Air: 0.1
        }
    },
    african: {
        name: 'African',
        elementalProperties: { Fire: 0.3, Earth: 0.4,
            Water: 0.2,
            Air: 0.1
        }
    },
    middleEastern: {
        name: 'Middle Eastern',
        elementalProperties: { Fire: 0.3, Earth: 0.3,
            Water: 0.2,
            Air: 0.2
        }
    },
    greek: {
        name: 'Greek',
        elementalProperties: { Fire: 0.2, Earth: 0.3,
            Water: 0.3,
            Air: 0.2
        }
    },
    mexican: {
        name: 'Mexican',
        elementalProperties: { Fire: 0.5, Earth: 0.3,
            Water: 0.1,
            Air: 0.1
        }
    },
    thai: {
        name: 'Thai',
        elementalProperties: { Fire: 0.4, Water: 0.3, Earth: 0.2, Air: 0.1
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
        elementalProperties: { Fire: 0.3, Earth: 0.3,
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
};
