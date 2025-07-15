import { wholeSpices } from './wholespices.js';
import { groundSpices } from './groundspices.js';
import { spiceBlends } from './spiceBlends.js';
import { CUISINE_TYPES } from '../../../constants/cuisineTypes.js';
import { createElementalProperties } from '../../../utils/elemental/elementalUtils.js';

// Normalize elemental properties to sum to 1
const normalizeElementalProperties = (properties) => {
    if (!properties) {
        return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
    }
    const sum = Object.values(properties).reduce((acc, val) => acc + val, 0);
    if (sum === 0) {
        return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
    }
    return Object.entries(properties).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: value / (sum || 1),
    }), {});
};

// Add heat levels based on fire element proportion
export const addHeatLevels = (spices) => {
    return Object.entries(spices).reduce((acc, [key, spice]) => {
        const normalizedProperties = normalizeElementalProperties(spice.elementalProperties);
        // Calculate heat level with more precision, based on fire element with slight randomization
        const baseHeatLevel = Math.round(normalizedProperties.Fire * 10);
        const adjustedHeatLevel = Math.min(10, Math.max(1, baseHeatLevel + (Math.random() < 0.5 ? -1 : 1)));
        // Calculate potency based on dominant element with some variation
        const dominantElement = Object.entries(normalizedProperties).sort(([, a], [, b]) => b - a)[0][0];
        const potencyBase = normalizedProperties[dominantElement] * 8;
        const potency = Math.min(10, Math.max(1, Math.round(potencyBase + Math.random() * 2)));
        return {
            ...acc,
            [key]: {
                ...spice,
                elementalProperties: normalizedProperties,
                heatLevel: adjustedHeatLevel,
                potency: potency,
                intensity: Math.round((adjustedHeatLevel + potency) / 2),
            }
        };
    }, {});
};

// Combine all spice categories with heat levels
export const spices = {
    ...wholeSpices,
    ...groundSpices,
    ...spiceBlends,
    cumin: {
        name: 'cumin',
        elementalProperties: createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }),
        astrologicalProfile: {
            rulingPlanets: ['Mercury', 'Saturn'],
            favorableZodiac: ['virgo', 'capricorn'],
            elementalAffinity: {
                base: 'Earth',
                decanModifiers: {
                    first: {},
                    second: {},
                    third: { element: 'Air', planet: 'Uranus' }
                },
            }
        },
        culinary_traditions: {
            [CUISINE_TYPES.INDIAN]: {
                name: 'jeera',
                usage: ['tadka', 'garam masala', 'curry'],
                preparation: 'whole roasted, ground, or tempered in oil',
                pAirings: ['coriander', 'turmeric', 'cardamom'],
                cultural_notes: 'One of the most important spices in Indian cuisine',
                medicinal_use: 'Aids digestion, used in Ayurveda',
            },
            [CUISINE_TYPES.MIDDLE_EASTERN]: {
                name: 'kamoun',
                usage: ['kushary', 'falafel', 'shawarma'],
                preparation: 'ground, often toasted',
                pAirings: ['chickpeas', 'lamb', 'rice'],
                cultural_notes: 'Essential in many spice blends',
            }
        },
    },
    cinnamon: {
        name: 'Cinnamon',
        elementalProperties: createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }),
        qualities: ['warming', 'sweet', 'aromatic'],
        origin: ['Sri Lanka', 'India', 'Southeast Asia'],
        category: 'spice',
        subcategory: 'warm spice'
    },
    cayenne: {
        elementalProperties: createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }),
        astrologicalProfile: {
            rulingPlanets: ['Mars', 'Pluto'],
            favorableZodiac: ['aries', 'scorpio'],
            elementalAffinity: {
                base: 'Fire',
                decanModifiers: {
                    first: {},
                    second: {},
                    third: { element: 'Air', planet: 'Uranus' }
                },
            },
            lunarPhaseModifiers: {
                newmoon: {
                    elementalBoost: {},
                    preparationTips: ['Use sparingly', 'Good for subtle heat'],
                },
                waxingCrescent: {
                    elementalBoost: {},
                    preparationTips: ['Building heat for marinades'],
                },
                firstQuarter: {
                    elementalBoost: {},
                    preparationTips: ['Ideal for medium-spicy dishes'],
                },
                waxingGibbous: {
                    elementalBoost: {},
                    preparationTips: ['Strong heat for bold dishes'],
                },
                fullmoon: {
                    elementalBoost: {},
                    preparationTips: ['Maximum heat potential', 'Best for spicy feasts'],
                },
                waningGibbous: {
                    elementalBoost: {},
                    preparationTips: ['Good for hearty spicy stews'],
                },
                lastQuarter: {
                    elementalBoost: {},
                    preparationTips: ['Balanced heat for sauces'],
                },
                waningCrescent: {
                    elementalBoost: {},
                    preparationTips: ['Gentle heat for finishing dishes'],
                }
            },
        },
        name: 'cayenne',
        qualities: ['hot', 'pungent', 'bright'],
        category: 'spice',
        heatLevel: 9,
        uses: ['spicy dishes', 'seasoning blends'],
    },
    paprika: {
        elementalProperties: createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }),
        name: 'paprika',
        qualities: ['earthy', 'warm', 'sweet'],
        category: 'spice',
        varieties: {
            sweet: {
                flavor: 'mild, fruity',
                heatLevel: 2,
            },
            smoked: {
                flavor: 'smoky, rich',
                heatLevel: 3,
            },
            hot: {
                flavor: 'spicy, robust',
                heatLevel: 6,
            }
        },
        lunarPhaseModifiers: {
            newmoon: {
                elementalBoost: {},
                preparationTips: ['Good for subtle color and flavor'],
            },
            waxingCrescent: {
                elementalBoost: {},
                preparationTips: ['Building flavor for rubs and marinades'],
            },
            firstQuarter: {
                elementalBoost: {},
                preparationTips: ['Ideal for stews and goulash'],
            },
            fullmoon: {
                elementalBoost: {},
                preparationTips: [
                    'Color and flavor most vibrant',
                    'Best for showcase dishes',
                ],
            },
            waningGibbous: {
                elementalBoost: {},
                preparationTips: ['Good for hearty roasted dishes'],
            },
            waningCrescent: {
                elementalBoost: {},
                preparationTips: ['Gentle color for finishing touches'],
            }
        }
    }
};

// Apply heat levels to all spices
Object.values(spices).forEach((spice) => {
    if (!spice.heatLevel) {
        spice.heatLevel = Math.round((spice.elementalProperties?.Fire || 0.25) * 10);
    }
});

// Export individual spice categories
export { wholeSpices, groundSpices, spiceBlends };

// Utility functions
export const getSpicesBySubCategory = (subCategory) => {
    return Object.entries(spices)
        .filter(([, spice]) => spice.subcategory === subCategory)
        .reduce((acc, [key, spice]) => ({ ...acc, [key]: spice }), {});
};

export const getSpicesByOrigin = (origin) => {
    return Object.entries(spices)
        .filter(([, spice]) => spice.origin?.includes(origin))
        .reduce((acc, [key, spice]) => ({ ...acc, [key]: spice }), {});
};

export const getSpicesByElementalProperty = (element, minStrength = 0.3) => {
    return Object.entries(spices)
        .filter(([, spice]) => (spice.elementalProperties?.[element] || 0) >= minStrength)
        .reduce((acc, [key, spice]) => ({ ...acc, [key]: spice }), {});
};

export const getSpiceBlendComponents = (blendName) => {
    const spice = spices[blendName];
    return spice?.components || [];
};

export const getCompatibleSpices = (spiceName) => {
    const spice = spices[spiceName];
    return Object.entries(spices)
        .filter(([key, otherSpice]) => key !== spiceName && otherSpice.category === spice?.category)
        .reduce((acc, [key, spice]) => ({ ...acc, [key]: spice }), {});
};

export const getSubstitutions = (spiceName) => {
    return Object.entries(spices)
        .filter(([key, spice]) => key !== spiceName && spice.category === spices[spiceName]?.category)
        .reduce((acc, [key, spice]) => ({ ...acc, [key]: spice }), {});
};

export const getSpicesByPreparationMethod = (method) => {
    return Object.entries(spices)
        .filter(([, spice]) => spice.preparation?.includes(method))
        .reduce((acc, [key, spice]) => ({ ...acc, [key]: spice }), {});
};

export const getTraditionalBlends = (region) => {
    return Object.entries(spices)
        .filter(([, spice]) => spice.traditional_use?.includes(region))
        .reduce((acc, [key, spice]) => ({ ...acc, [key]: spice }), {});
};

export const getSpiceConversionRatio = (fromSpice, toSpice) => {
    const source = spices[fromSpice];
    const target = spices[toSpice];
    if (!source || !target) return 1;
    // Calculate conversion ratio based on potency and heat levels
    const sourceIntensity = (source.heatLevel || 5) * (source.potency || 5);
    const targetIntensity = (target.heatLevel || 5) * (target.potency || 5);
    return targetIntensity / sourceIntensity;
};

export default spices;
