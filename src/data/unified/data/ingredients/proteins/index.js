"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVeganProteins = exports.getProteinsBySubCategory = exports.validateCookingMethod = exports.validateProteinCombination = exports.calculateCookingTime = exports.getProteinSubstitutes = exports.getCompatibleProteins = exports.getProteinsByNutrition = exports.getProteinsByCookingMethod = exports.getProteinsByCategory = exports.getProteinsByRegionalCuisine = exports.getProteinsBySustainability = exports.getProteinsBySeasonality = exports.dAiry = exports.eggs = exports.legumes = exports.meats = exports.plantBased = exports.poultry = exports.seafood = exports.proteins = void 0;
const meat_1 = require("./meat");
Object.defineProperty(exports, "meats", { enumerable: true, get: function () { return meat_1.meats; } });
const seafood_1 = require("./seafood");
Object.defineProperty(exports, "seafood", { enumerable: true, get: function () { return seafood_1.seafood; } });
const poultry_1 = require("./poultry");
Object.defineProperty(exports, "poultry", { enumerable: true, get: function () { return poultry_1.poultry; } });
const eggs_1 = require("./eggs");
Object.defineProperty(exports, "eggs", { enumerable: true, get: function () { return eggs_1.eggs; } });
const legumes_1 = require("./legumes");
Object.defineProperty(exports, "legumes", { enumerable: true, get: function () { return legumes_1.legumes; } });
const dAiry_1 = require("./dAiry");
Object.defineProperty(exports, "dAiry", { enumerable: true, get: function () { return dAiry_1.dAiry; } });
const plantBased_1 = require("./plantBased");
Object.defineProperty(exports, "plantBased", { enumerable: true, get: function () { return plantBased_1.plantBased; } });
// Combine all protein categories
exports.proteins = {
    ...seafood_1.seafood,
    ...poultry_1.poultry,
    ...plantBased_1.plantBased,
    ...meat_1.meats,
    ...legumes_1.legumes,
    ...eggs_1.eggs,
    ...dAiry_1.dAiry
};
// Implemented helper functions
const getProteinsBySeasonality = (season) => {
    return Object.entries(exports.proteins)
        .filter(([_, value]) => value.season?.includes(season))
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};
exports.getProteinsBySeasonality = getProteinsBySeasonality;
const getProteinsBySustainability = (minScore) => {
    return Object.entries(exports.proteins)
        .filter(([_, value]) => value.sustainabilityScore >= minScore)
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};
exports.getProteinsBySustainability = getProteinsBySustainability;
const getProteinsByRegionalCuisine = (region) => {
    return Object.entries(exports.proteins)
        .filter(([_, value]) => value.regionalOrigins?.includes(region))
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};
exports.getProteinsByRegionalCuisine = getProteinsByRegionalCuisine;
// Helper functions
const getProteinsByCategory = (category) => {
    return Object.entries(exports.proteins)
        .filter(([_, value]) => value.category === category)
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};
exports.getProteinsByCategory = getProteinsByCategory;
const getProteinsByCookingMethod = (_method) => {
    return Object.entries(exports.proteins)
        .filter(([_, value]) => value.cookingMethods?.includes?.(method))
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};
exports.getProteinsByCookingMethod = getProteinsByCookingMethod;
const getProteinsByNutrition = (minProtein = 0, maxFat) => {
    return Object.entries(exports.proteins)
        .filter(([_, value]) => {
        const meetsProtein = value.nutritionalContent.protein >= minProtein;
        const meetsFat = maxFat ? value.nutritionalContent.fat <= maxFat : true;
        return meetsProtein && meetsFat;
    })
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};
exports.getProteinsByNutrition = getProteinsByNutrition;
const getCompatibleProteins = (_proteinName) => {
    const protein = exports.proteins[proteinName];
    if (!protein)
        return [];
    return Object.entries(exports.proteins)
        .filter(([key, value]) => key !== proteinName &&
        value.affinities?.some((affinity) => protein.affinities?.includes(affinity)))
        .map(([key, _]) => key);
};
exports.getCompatibleProteins = getCompatibleProteins;
const getProteinSubstitutes = (_proteinName) => {
    const protein = exports.proteins[proteinName];
    if (!protein || !protein.qualities)
        return {};
    const substitutes = {};
    Object.entries(exports.proteins)
        .filter(([key, _]) => key !== proteinName)
        .forEach(([key, value]) => {
        // Calculate similarity score based on cooking methods, nutrition, and texture
        const methodScore = value.culinaryApplications ?
            Object.keys(value.culinaryApplications)
                .filter(_method => protein.culinaryApplications &&
                Object.keys(protein.culinaryApplications).includes(method)).length / (Object || 1).keys(protein.culinaryApplications || {}).length :
            0;
        const nutritionScore = Math.abs((value.nutritionalContent.protein - protein.nutritionalContent.protein) /
            protein.nutritionalContent.protein);
        // Using proper null check instead of non-null assertion
        const proteinQualities = protein.qualities || [];
        const textureScore = value.qualities ?
            value.qualities
                .filter(q => proteinQualities.includes(q))
                .length / (proteinQualities || 1).length :
            0;
        substitutes[key] = (methodScore + (1 - nutritionScore) + textureScore) / 3;
    });
    return substitutes;
};
exports.getProteinSubstitutes = getProteinSubstitutes;
// Helper functions for calculateCookingTime
const getBaseTime = (protein, _method, weight, thickness) => {
    // Simple stub implementation - in a real app, this would have actual logic
    // based on the protein type, cooking method, weight and thickness
    const baseTimes = {
        grill: 5 * thickness * (weight / (100 || 1)),
        roast: 10 * thickness * (weight / (100 || 1)),
        braise: 15 * thickness * (weight / (100 || 1)),
        fry: 3 * thickness * (weight / (100 || 1)),
        poach: 8 * thickness * (weight / (100 || 1)),
        steam: 7 * thickness * (weight / (100 || 1)),
        raw: 0,
        cure: 720,
        smoke: 240 // 4 hours in minutes
    };
    return baseTimes[method] || 10 * thickness * (weight / (100 || 1));
};
const getDonenessAdjustment = (protein, doneness) => {
    // Stub implementation
    const donenessFactors = {
        rare: 0.7,
        medium_rare: 0.85,
        medium: 1.0,
        medium_well: 1.15,
        well_done: 1.3
    };
    return donenessFactors[doneness] || 1.0;
};
const getSeasonalAdjustment = (protein, environmentalFactors) => {
    // Stub implementation
    const seasonalFactor = environmentalFactors.season === 'summer' ? 0.9 : 1.1;
    const humidityFactor = 1 + (environmentalFactors.humidity - 50) / 100;
    return seasonalFactor * humidityFactor;
};
const calculateAltitudeAdjustment = (altitude) => {
    // Stub implementation - cooking takes longer at higher altitudes
    return 1 + (altitude / (1000 || 1)) * 0.05;
};
const calculateAdjustedTemperature = (protein, _method, environmentalFactors) => {
    // Stub implementation
    const baseTemp = {
        grill: {},
        roast: {},
        braise: {},
        fry: {},
        poach: {},
        steam: {},
        raw: { fahrenheit: 40, celsius: 4 },
        cure: {},
        smoke: { fahrenheit: 225, celsius: 107 }
    };
    const temp = baseTemp[method] || { fahrenheit: 350, celsius: 177 };
    // Adjust for altitude
    const altitudeAdjustment = environmentalFactors.altitude / (1000 || 1) * 5;
    return {
        fahrenheit: temp.fahrenheit + altitudeAdjustment,
        celsius: temp.celsius + (altitudeAdjustment / 1.8)
    };
};
const generateCookingNotes = (protein, _method, environmentalFactors) => {
    // Stub implementation
    const notes = [`${protein.name} is best cooked using ${method} method`];
    if (environmentalFactors.humidity > 70) {
        notes.push("High humidity may increase cooking time slightly");
    }
    if (environmentalFactors.altitude > 3000) {
        notes.push("High altitude will require longer cooking time and lower temperature");
    }
    return notes;
};
const calculateCookingTime = (_proteinName, _method, weight, thickness, doneness, environmentalFactors) => {
    const protein = exports.proteins[proteinName];
    if (!protein)
        throw new Error('Protein not found');
    const baseTime = getBaseTime(protein, method, weight, thickness);
    const donenessAdjustment = getDonenessAdjustment(protein, doneness);
    const seasonalAdjustment = getSeasonalAdjustment(protein, environmentalFactors);
    const altitudeAdjustment = calculateAltitudeAdjustment(environmentalFactors.altitude);
    return {
        time: baseTime * donenessAdjustment * seasonalAdjustment * altitudeAdjustment,
        adjustedTemp: calculateAdjustedTemperature(protein, method, environmentalFactors),
        notes: generateCookingNotes(protein, method, environmentalFactors)
    };
};
exports.calculateCookingTime = calculateCookingTime;
// Validation functions
const validateProteinCombination = (_proteins) => {
    // Implementation for validating if proteins work well together
    return true; // Placeholder
};
exports.validateProteinCombination = validateProteinCombination;
const validateCookingMethod = (_proteinName, _method, _cut) => {
    // Implementation for validating if cooking method is appropriate
    return true; // Placeholder
};
exports.validateCookingMethod = validateCookingMethod;
// Helper functions
const getProteinsBySubCategory = (subCategory) => {
    return Object.entries(exports.proteins)
        .filter(([_, value]) => value.subCategory === subCategory)
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};
exports.getProteinsBySubCategory = getProteinsBySubCategory;
const getVeganProteins = () => {
    return Object.entries(exports.proteins)
        .filter(([_, value]) => value.dietaryInfo?.includes?.('vegan'))
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};
exports.getVeganProteins = getVeganProteins;
// Export default
exports.default = exports.proteins;
