import { spices } from '../spices/index.js';
import { salts } from './salts.js';
import { peppers } from './peppers.js';
import { herbs } from '../herbs/index.js';
import { aromatics } from './aromatics.js';

export { spices, salts, peppers, herbs, aromatics };
// Combine all seasoning categories, but exclude oils and vinegars
export const seasonings = {
    ...spices,
    ...salts,
    ...peppers,
    ...herbs,
    ...aromatics
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
export const categorizedSalts = updateSaltCategory(salts);
// Helper functions
export const getSeasoningsByCategory = (category) => {
    return Object.entries(seasonings)
        .filter(([, value]) => value.category === category)
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};
export const getSeasoningsByIntensity = (intensity) => {
    return Object.entries(seasonings)
        .filter(([, value]) => value.qualities?.includes(intensity))
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};
export const getCompatibleSeasonings = (seasoningName) => {
    const seasoning = seasonings[seasoningName];
    if (!seasoning)
        return [];
    return Object.entries(seasonings)
        .filter(([key, value]) => key !== seasoningName &&
        value.affinities?.some((affinity) => seasoning.affinities?.includes(affinity)))
        .map(([key]) => key);
};
export const getSeasoningsByTiming = (timing) => {
    return Object.entries(seasonings)
        .filter(([, value]) => value.culinaryApplications &&
        Object.values(value.culinaryApplications).some(app => app.timing === timing))
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};
export const getTraditionalCombinations = (cuisine) => {
    const combinations = {};
    Object.entries(seasonings)
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
export const getSeasoningsByLunarPhase = (phase) => {
    return Object.entries(seasonings)
        .filter(([, value]) => value.astrologicalProfile?.lunarPhaseModifiers?.[phase])
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};
export const getSeasoningsByElementalBoost = (element) => {
    return Object.entries(seasonings)
        .filter(([, value]) => value.astrologicalProfile?.lunarPhaseModifiers &&
        Object.values(value.astrologicalProfile.lunarPhaseModifiers)
            .some(modifier => modifier.elementalBoost[element]))
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};
