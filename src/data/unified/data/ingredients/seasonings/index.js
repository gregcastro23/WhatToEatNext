"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSeasoningsByElementalBoost = exports.getSeasoningsByLunarPhase = exports.getTraditionalCombinations = exports.getSeasoningsByTiming = exports.getCompatibleSeasonings = exports.getSeasoningsByIntensity = exports.getSeasoningsByCategory = exports.categorizedSalts = exports.aromatics = exports.herbs = exports.peppers = exports.salts = exports.spices = exports.seasonings = void 0;
const spices_1 = require("../spices");
Object.defineProperty(exports, "spices", { enumerable: true, get: function () { return spices_1.spices; } });
const salts_1 = require("./salts");
Object.defineProperty(exports, "salts", { enumerable: true, get: function () { return salts_1.salts; } });
const peppers_1 = require("./peppers");
Object.defineProperty(exports, "peppers", { enumerable: true, get: function () { return peppers_1.peppers; } });
const herbs_1 = require("../herbs");
Object.defineProperty(exports, "herbs", { enumerable: true, get: function () { return herbs_1.herbs; } });
const aromatics_1 = require("./aromatics");
Object.defineProperty(exports, "aromatics", { enumerable: true, get: function () { return aromatics_1.aromatics; } });
// Combine all seasoning categories, but exclude oils and vinegars
exports.seasonings = {
    ...spices_1.spices,
    ...salts_1.salts,
    ...peppers_1.peppers,
    ...herbs_1.herbs,
    ...aromatics_1.aromatics
};
// Update salts category to be 'seasoning' with subCategory 'salt'
const updateSaltCategory = (salts) => {
    return Object.entries(salts)
        .reduce((acc, [key, value]) => {
        acc[key] = {
            ...value,
            category: 'seasoning',
            subCategory: 'salt'
        };
        return acc;
    }, {});
};
// Export updated salts
exports.categorizedSalts = updateSaltCategory(salts_1.salts);
// Helper functions
const getSeasoningsByCategory = (category) => {
    return Object.entries(exports.seasonings)
        .filter(([_, value]) => value.category === category)
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};
exports.getSeasoningsByCategory = getSeasoningsByCategory;
const getSeasoningsByIntensity = (intensity) => {
    return Object.entries(exports.seasonings)
        .filter(([_, value]) => value.qualities?.includes(intensity))
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};
exports.getSeasoningsByIntensity = getSeasoningsByIntensity;
const getCompatibleSeasonings = (seasoningName) => {
    const seasoning = exports.seasonings[seasoningName];
    if (!seasoning)
        return [];
    return Object.entries(exports.seasonings)
        .filter(([key, value]) => key !== seasoningName &&
        value.affinities?.some((affinity) => seasoning.affinities?.includes(affinity)))
        .map(([key, _]) => key);
};
exports.getCompatibleSeasonings = getCompatibleSeasonings;
const getSeasoningsByTiming = (timing) => {
    return Object.entries(exports.seasonings)
        .filter(([_, value]) => value.culinaryApplications &&
        Object.values(value.culinaryApplications).some(app => app.timing === timing))
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};
exports.getSeasoningsByTiming = getSeasoningsByTiming;
const getTraditionalCombinations = (cuisine) => {
    const combinations = {};
    Object.entries(exports.seasonings)
        .forEach(([key, value]) => {
        if (value.traditionalCombinations && value.traditionalCombinations.includes(cuisine)) {
            if (!combinations[key]) {
                combinations[key] = [];
            }
            combinations[key].push(...value.traditionalCombinations);
        }
    });
    return combinations;
};
exports.getTraditionalCombinations = getTraditionalCombinations;
const getSeasoningsByLunarPhase = (phase) => {
    return Object.entries(exports.seasonings)
        .filter(([_, value]) => value.astrologicalProfile?.lunarPhaseModifiers?.[phase])
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};
exports.getSeasoningsByLunarPhase = getSeasoningsByLunarPhase;
const getSeasoningsByElementalBoost = (element) => {
    return Object.entries(exports.seasonings)
        .filter(([_, value]) => value.astrologicalProfile?.lunarPhaseModifiers &&
        Object.values(value.astrologicalProfile.lunarPhaseModifiers)
            .some(modifier => modifier.elementalBoost[element]))
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};
exports.getSeasoningsByElementalBoost = getSeasoningsByElementalBoost;
