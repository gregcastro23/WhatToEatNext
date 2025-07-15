// src/data/cuisines.ts
import { CUISINES, cuisinesMap } from './cuisines/index.js';
import { african } from './cuisines/african.js';
import { american } from './cuisines/american.js';
import { chinese } from './cuisines/chinese.js';
import { french } from './cuisines/french.js';
import { greek } from './cuisines/greek.js';
import { indian } from './cuisines/indian.js';
import { italian } from './cuisines/italian.js';
import { japanese } from './cuisines/japanese.js';
import { korean } from './cuisines/korean.js';
import { mexican } from './cuisines/mexican.js';
import { middleEastern } from './cuisines/middle-eastern.js';
import { thai } from './cuisines/thai.js';
import { vietnamese } from './cuisines/vietnamese.js';
import { russian } from './cuisines/russian.js';

export { CUISINES, cuisinesMap };
// Example recipe type for reference
const exampleRecipe = {
    id: "example-recipe-001",
    name: "Example Recipe",
    description: "Template for recipe structure",
    cuisine: "Any",
    ingredients: [
        { name: "ingredient", amount: 100, unit: "g", category: "category", element: "Earth" }
    ],
    cookingMethod: "baking",
    timeToMake: 30,
    numberOfServings: 4,
    nutrition: {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        vitamins: [],
        minerals: []
    },
    season: ["all"],
    mealType: ["any"]
};
// Helper function to adapt ElementalProperties from cuisine.ts to alchemy.ts format
function adaptElementalProperties(props) {
    // If it already has the index signature, return as is
    if (props && typeof props === 'object' && props.hasOwnProperty('Fire')) {
        return props;
    }
    // Convert to the format expected by alchemy.ts
    return { Fire: props?.Fire || 0, Water: props?.Water || 0, Earth: props?.Earth || 0, Air: props?.Air || 0
    };
}
// Helper function to adapt cuisines to the CuisineType format
function adaptCuisine(cuisine) {
    return {
        ...cuisine,
        // Convert elementalProperties if present
        elementalProperties: cuisine.elementalProperties ?
            adaptElementalProperties(cuisine.elementalProperties) : undefined,
        // Convert elementalState if present
        elementalState: cuisine.elementalState ?
            adaptElementalProperties(cuisine.elementalState) : undefined
    };
}
// Combine all cuisines
export const cuisines = {
    american: adaptCuisine(american),
    chinese: adaptCuisine(chinese),
    french: adaptCuisine(french),
    greek: adaptCuisine(greek),
    indian: adaptCuisine(indian),
    italian: adaptCuisine(italian),
    japanese: adaptCuisine(japanese),
    korean: adaptCuisine(korean),
    mexican: adaptCuisine(mexican),
    middleEastern: adaptCuisine(middleEastern),
    thai: adaptCuisine(thai),
    vietnamese: adaptCuisine(vietnamese),
    african: adaptCuisine(african),
    russian: adaptCuisine(russian)
};
// Helper functions for accessing cuisine properties
export const getCuisineByName = (name) => cuisines[name.toLowerCase()];

export const getCuisinesByElement = (element) => Object.values(cuisines).filter(cuisine => (cuisine.elementalState?.[element] ?? 0) >= 0.3 || (cuisine.elementalProperties?.[element] ?? 0) >= 0.3);

export default cuisines;
