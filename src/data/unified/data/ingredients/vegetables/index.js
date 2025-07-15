import { leafyGreens } from './leafyGreens.js';
import { roots } from './roots.js';
import { cruciferous } from './cruciferous.js';
import { nightshades } from './nightshades.js';
import { alliums } from './alliums.js';
import { squash } from './squash.js';
import { starchyVegetables } from './starchy.js';
import { legumes } from './legumes.js';

// Export imported categories
export { leafyGreens, roots, cruciferous, nightshades, alliums, squash, starchyVegetables, legumes };
// Combine all vegetable categories
export const vegetables = {
    ...leafyGreens,
    ...roots,
    ...cruciferous,
    ...nightshades,
    ...alliums,
    ...squash,
    ...starchyVegetables,
    ...legumes
};
// Create enhanced vegetables with additional properties
export const enhancedVegetables = vegetables;
// For standardization - both exports refer to the same object
export const standardizedVegetables = vegetables;
// Helper functions
export const getVegetablesBySubCategory = (subCategory) => {
    return Object.entries(vegetables)
        .filter(([, value]) => value.subCategory === subCategory)
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

export const getSeasonalVegetables = (season) => {
    return Object.entries(vegetables)
        .filter(([, value]) => Array.isArray(value.season) && value.season.includes(season))
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

export const getVegetablesByCookingMethod = (method) => {
    return Object.entries(vegetables)
        .filter(([, value]) => Array.isArray(value.cookingMethods) && value.cookingMethods.includes(method))
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

export default vegetables;
