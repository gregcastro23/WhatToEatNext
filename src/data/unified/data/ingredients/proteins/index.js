import { meats } from './meat.js';
import { seafood } from './seafood.js';
import { poultry } from './poultry.js';
import { eggs } from './eggs.js';
import { legumes } from './legumes.js';
import { dAiry } from './dAiry.js';
import { plantBased } from './plantBased.js';

// Export imported categories
export { meats, seafood, poultry, eggs, legumes, dAiry, plantBased };
// Combine all protein categories
export const proteins = {
    ...seafood,
    ...poultry,
    ...plantBased,
    ...meats,
    ...legumes,
    ...eggs,
    ...dAiry
};
// Implemented helper functions
export const getProteinsBySeasonality = (season) => {
    return Object.entries(proteins)
        .filter(([, value]) => value.season?.includes(season))
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

export const getProteinsBySustainability = (minScore) => {
    return Object.entries(proteins)
        .filter(([, value]) => value.sustainabilityScore >= minScore)
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

export const getProteinsByRegionalCuisine = (region) => {
    return Object.entries(proteins)
        .filter(([, value]) => value.regionalOrigins?.includes(region))
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};
// Helper functions
export const getProteinsByCategory = (category) => {
    return Object.entries(proteins)
        .filter(([, value]) => value.category === category)
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

export const getProteinsByCookingMethod = (method) => {
    return Object.entries(proteins)
        .filter(([, value]) => value.cookingMethods?.includes?.(method))
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

export const getProteinsByNutrition = (minProtein = 0, maxFat) => {
    return Object.entries(proteins)
        .filter(([, value]) => {
        const meetsProtein = value.nutritionalContent.protein >= minProtein;
        const meetsFat = maxFat ? value.nutritionalContent.fat <= maxFat : true;
        return meetsProtein && meetsFat;
    })
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

export const getCompatibleProteins = (proteinName) => {
    const protein = proteins[proteinName];
    if (!protein)
        return [];
    return Object.entries(proteins)
        .filter(([key, value]) => key !== proteinName &&
        value.affinities?.some((affinity) => protein.affinities?.includes(affinity)))
        .map(([key]) => key);
};

export const getProteinSubstitutes = (proteinName) => {
    const protein = proteins[proteinName];
    if (!protein || !protein.qualities)
        return {};
    const substitutes = {};
    Object.entries(proteins)
        .filter(([key]) => key !== proteinName)
        .forEach(([key, value]) => {
        // Calculate similarity score based on cooking methods, nutrition, and texture
        const methodScore = value.culinaryApplications ?
            Object.keys(value.culinaryApplications)
                .filter(method => protein.culinaryApplications &&
                Object.keys(protein.culinaryApplications).includes(method)).length / (Object.keys(protein.culinaryApplications || {}).length || 1) :
            0;
        const nutritionScore = Math.abs((value.nutritionalContent.protein - protein.nutritionalContent.protein) /
            protein.nutritionalContent.protein);
        // Using proper null check instead of non-null assertion
        const proteinQualities = protein.qualities || [];
        const textureScore = value.qualities ?
            value.qualities
                .filter(q => proteinQualities.includes(q))
                .length / (proteinQualities.length || 1) :
            0;
        substitutes[key] = (methodScore + (1 - nutritionScore) + textureScore) / 3;
    });
    return substitutes;
};
// Helper functions for calculateCookingTime
const getBaseTime = (protein, method, weight, thickness) => {
    // Simple stub implementation - in a real app, this would have actual logic
    // based on the protein type, cooking method, weight and thickness
    const baseTimes = {
        grill: 5 * thickness * (weight / 100),
        roast: 10 * thickness * (weight / 100),
        braise: 15 * thickness * (weight / 100),
        fry: 3 * thickness * (weight / 100),
        poach: 8 * thickness * (weight / 100),
        steam: 7 * thickness * (weight / 100),
        raw: 0,
        cure: 720,
        smoke: 240 // 4 hours in minutes
    };
    return baseTimes[method] || 10 * thickness * (weight / 100);
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
    return 1 + (altitude / 1000) * 0.05;
};
const calculateAdjustedTemperature = (protein, method, environmentalFactors) => {
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
    const altitudeAdjustment = environmentalFactors.altitude / 1000 * 5;
    return {
        fahrenheit: temp.fahrenheit + altitudeAdjustment,
        celsius: temp.celsius + (altitudeAdjustment / 1.8)
    };
};
const generateCookingNotes = (protein, method, environmentalFactors) => {
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
export const calculateCookingTime = (proteinName, method, weight, thickness, doneness, environmentalFactors) => {
    const protein = proteins[proteinName];
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

// Validation functions
export const validateProteinCombination = (proteins) => {
    // Implementation for validating if proteins work well together
    return true; // Placeholder
};

export const validateCookingMethod = (proteinName, method, cut) => {
    // Implementation for validating if cooking method is appropriate
    return true; // Placeholder
};

// Helper functions
export const getProteinsBySubCategory = (subCategory) => {
    return Object.entries(proteins)
        .filter(([, value]) => value.subCategory === subCategory)
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

export const getVeganProteins = () => {
    return Object.entries(proteins)
        .filter(([, value]) => value.dietaryInfo?.includes?.('vegan'))
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

// Export default
export default proteins;
