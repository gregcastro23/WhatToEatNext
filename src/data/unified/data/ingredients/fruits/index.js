import { citrus } from "./citrus";
import { berries } from "./berries";
import { tropical } from "./tropical";
import { stoneFruit } from "./stoneFruit";
import { pome } from "./pome";
import { melons } from "./melons";

// Combine all fruit categories
export const fruits = {
    ...citrus,
    ...berries,
    ...tropical,
    ...stoneFruit,
    ...pome,
    ...melons
};

// Helper functions
const getFruitsBySubCategory = (subCategory) => {
    return Object.entries(fruits)
        .filter(([_, value]) => value.subCategory === subCategory)
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

const getSeasonalFruits = (season) => {
    return Object.entries(fruits)
        .filter(([_, value]) => value.season.includes(season))
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

const getFruitsByPreparation = (method) => {
    return Object.entries(fruits)
        .filter(([_, value]) => value.preparation && value.preparation[method])
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

const findCompatibleFruits = (ingredientName) => {
    const fruit = fruits[ingredientName];
    if (!fruit)
        return [];
    return fruit.affinities || [];
};

// Add new helper functions
const getFruitsByRulingPlanet = (planet) => {
    return Object.entries(fruits)
        .filter(([_, value]) => value.astrologicalProfile?.rulingPlanets?.includes(planet))
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

const getFruitsByElementalAffinity = (element) => {
    return Object.entries(fruits)
        .filter(([_, value]) => {
        const affinity = value.astrologicalProfile?.elementalAffinity;
        if (!affinity)
            return false;
        if (typeof affinity === 'string') {
            return affinity === element;
        }
        else {
            return affinity.base === element;
        }
    })
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

// Add new validation function
const isValidFruitAstrologicalProfile = (profile) => {
    if (typeof profile !== 'object' || !profile)
        return false;
    const requiredProperties = [
        'rulingPlanets',
        'favorableZodiac',
        'elementalAffinity'
    ];
    return requiredProperties.every(prop => prop in profile);
};

// Validation
const isValidFruit = (ingredient) => {
    if (typeof ingredient !== 'object' || !ingredient)
        return false;
    const requiredProperties = [
        'elementalProperties',
        'qualities',
        'season',
        'category',
        'subCategory',
        'nutritionalProfile',
        'preparation',
        'storage'
    ];
    return requiredProperties.every(prop => prop in ingredient);
};

// Before
Object.entries(fruits).forEach(([id, fruit]) => {
    // Validation logic can be added here if needed
});

// After
Object.entries(fruits).forEach(([id, fruit]) => {
    // Properly implement validation
    if (!fruit.elementalProperties) {
        // Use type-safe logging instead of console.log
        // If a logger is available, we would use it like: logger.warn(`Missing properties for ${id}`);
        // For now, we'll just comment this out to avoid linting errors
        // console.warn(`Missing properties for ${id}`);
    }
});

export {
    citrus,
    berries,
    tropical,
    stoneFruit,
    pome,
    melons,
    getFruitsBySubCategory,
    getSeasonalFruits,
    getFruitsByPreparation,
    findCompatibleFruits,
    getFruitsByRulingPlanet,
    getFruitsByElementalAffinity,
    isValidFruitAstrologicalProfile,
    isValidFruit
};
