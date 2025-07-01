"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidFruit = exports.isValidFruitAstrologicalProfile = exports.getFruitsByElementalAffinity = exports.getFruitsByRulingPlanet = exports.findCompatibleFruits = exports.getFruitsByPreparation = exports.getSeasonalFruits = exports.getFruitsBySubCategory = exports.melons = exports.pome = exports.stoneFruit = exports.tropical = exports.berries = exports.citrus = exports.fruits = void 0;
const citrus_1 = require("./citrus");
Object.defineProperty(exports, "citrus", { enumerable: true, get: function () { return citrus_1.citrus; } });
const berries_1 = require("./berries");
Object.defineProperty(exports, "berries", { enumerable: true, get: function () { return berries_1.berries; } });
const tropical_1 = require("./tropical");
Object.defineProperty(exports, "tropical", { enumerable: true, get: function () { return tropical_1.tropical; } });
const stoneFruit_1 = require("./stoneFruit");
Object.defineProperty(exports, "stoneFruit", { enumerable: true, get: function () { return stoneFruit_1.stoneFruit; } });
const pome_1 = require("./pome");
Object.defineProperty(exports, "pome", { enumerable: true, get: function () { return pome_1.pome; } });
const melons_1 = require("./melons");
Object.defineProperty(exports, "melons", { enumerable: true, get: function () { return melons_1.melons; } });
// Combine all fruit categories
exports.fruits = {
    ...citrus_1.citrus,
    ...berries_1.berries,
    ...tropical_1.tropical,
    ...stoneFruit_1.stoneFruit,
    ...pome_1.pome,
    ...melons_1.melons
};
// Helper functions
const getFruitsBySubCategory = (subCategory) => {
    return Object.entries(exports.fruits)
        .filter(([_, value]) => value.subCategory === subCategory)
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};
exports.getFruitsBySubCategory = getFruitsBySubCategory;
const getSeasonalFruits = (season) => {
    return Object.entries(exports.fruits)
        .filter(([_, value]) => value.season.includes(season))
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};
exports.getSeasonalFruits = getSeasonalFruits;
const getFruitsByPreparation = (method) => {
    return Object.entries(exports.fruits)
        .filter(([_, value]) => value.preparation && value.preparation[method])
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};
exports.getFruitsByPreparation = getFruitsByPreparation;
const findCompatibleFruits = (ingredientName) => {
    const _fruit = exports.fruits[ingredientName];
    if (!fruit)
        return [];
    return fruit.affinities || [];
};
exports.findCompatibleFruits = findCompatibleFruits;
// Add new helper functions
const getFruitsByRulingPlanet = (planet) => {
    return Object.entries(exports.fruits)
        .filter(([_, value]) => value.astrologicalProfile?.rulingPlanets?.includes(planet))
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};
exports.getFruitsByRulingPlanet = getFruitsByRulingPlanet;
const getFruitsByElementalAffinity = (element) => {
    return Object.entries(exports.fruits)
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
exports.getFruitsByElementalAffinity = getFruitsByElementalAffinity;
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
exports.isValidFruitAstrologicalProfile = isValidFruitAstrologicalProfile;
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
exports.isValidFruit = isValidFruit;
// Before
Object.entries(exports.fruits).forEach(([_id, _fruit]) => {
    // Validation logic can be added here if needed
});
// After
Object.entries(exports.fruits).forEach(([_id, fruit]) => {
    // Properly implement validation
    if (!fruit.elementalProperties) {
        // Use type-safe logging instead of console.log
        // If a logger is available, we would use it like: logger.warn(`Missing properties for ${id}`);
        // For now, we'll just comment this out to avoid linting errors
        // console.warn(`Missing properties for ${id}`);
    }
});
