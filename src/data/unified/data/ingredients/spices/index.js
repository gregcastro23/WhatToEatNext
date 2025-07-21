"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSpiceConversionRatio = exports.getTraditionalBlends = exports.getSpicesByPreparationMethod = exports.getSubstitutions = exports.getCompatibleSpices = exports.getSpiceBlendComponents = exports.getSpicesByElementalProperty = exports.getSpicesByOrigin = exports.getSpicesBySubCategory = exports.spiceBlends = exports.groundSpices = exports.wholeSpices = exports.spices = exports.addHeatLevels = void 0;
const elementalUtils_1 = require("../../../utils/elemental/elementalUtils");
const cuisineTypes_1 = require("../../../constants/cuisineTypes");
const wholespices_1 = require("./wholespices");
Object.defineProperty(exports, "wholeSpices", { enumerable: true, get: function () { return wholespices_1.wholeSpices; } });
const groundspices_1 = require("./groundspices");
Object.defineProperty(exports, "groundSpices", { enumerable: true, get: function () { return groundspices_1.groundSpices; } });
const spiceBlends_1 = require("./spiceBlends");
Object.defineProperty(exports, "spiceBlends", { enumerable: true, get: function () { return spiceBlends_1.spiceBlends; } });
// Normalize elemental properties to sum to 1
const normalizeElementalProperties = (properties) => {
    if (!properties) {
        return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25,
        };
    }
    const sum = Object.values(properties).reduce((acc, val) => acc + val, 0);
    if (sum === 0) {
        return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25,
        };
    }
    return Object.entries(properties).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: value / (sum || 1),
    }), {});
};
// Add heat levels based on fire element proportion
const addHeatLevels = (spices) => {
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
exports.addHeatLevels = addHeatLevels;
// Combine all spice categories with heat levels
exports.spices = {
    ...wholespices_1.wholeSpices,
    ...groundspices_1.groundSpices,
    ...spiceBlends_1.spiceBlends,
    cumin: {
        name: 'cumin',
        elementalProperties: (0, elementalUtils_1.createElementalProperties)({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
        }),
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
            [cuisineTypes_1.CUISINE_TYPES.INDIAN]: {
                name: 'jeera',
                usage: ['tadka', 'garam masala', 'curry'],
                preparation: 'whole roasted, ground, or tempered in oil',
                pAirings: ['coriander', 'turmeric', 'cardamom'],
                cultural_notes: 'One of the most important spices in Indian cuisine',
                medicinal_use: 'Aids digestion, used in Ayurveda',
            },
            [cuisineTypes_1.CUISINE_TYPES.MIDDLE_EASTERN]: {
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
        elementalProperties: (0, elementalUtils_1.createElementalProperties)({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
        }),
        qualities: ['warming', 'sweet', 'aromatic'],
        origin: ['Sri Lanka', 'India', 'Southeast Asia'],
        category: 'spice',
        subcategory: 'warm spice'
    },
    cayenne: {
        elementalProperties: (0, elementalUtils_1.createElementalProperties)({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
        }),
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
        elementalProperties: (0, elementalUtils_1.createElementalProperties)({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
        }),
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
                preparationTips: ['Best for subtle, earthy applications'],
            }
        },
    },
    turmeric: {
        elementalProperties: (0, elementalUtils_1.createElementalProperties)({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
        }),
        name: 'turmeric',
        qualities: ['earthy', 'bitter', 'warm'],
        category: 'spice',
        potency: 7,
        health_benefits: ['anti-inflammatory', 'antioxidant'],
        pigment_strength: 9,
        staining_risk: 8,
        lunarPhaseModifiers: {
            newmoon: {
                elementalBoost: {},
                preparationTips: [
                    'Good for starting cleansing routines',
                    'Subtle medicinal use',
                ],
            },
            waxingCrescent: {
                elementalBoost: {},
                preparationTips: ['Building healing properties', 'Good for curries'],
            },
            firstQuarter: {
                elementalBoost: {},
                preparationTips: [
                    'Medicinal potency increasing',
                    'Ideal for golden milk',
                ],
            },
            waxingGibbous: {
                elementalBoost: {},
                preparationTips: [
                    'Strong healing properties',
                    'Good for therapeutic dishes',
                ],
            },
            fullmoon: {
                elementalBoost: {},
                preparationTips: [
                    'Maximum medicinal potency',
                    'Best for healing rituals',
                ],
            },
            waningGibbous: {
                elementalBoost: {},
                preparationTips: ['Good for detoxifying recipes'],
            },
            lastQuarter: {
                elementalBoost: {},
                preparationTips: ['Balancing properties for savory dishes'],
            },
            waningCrescent: {
                elementalBoost: {},
                preparationTips: ['Gentle applications', 'Good for subtle coloring'],
            }
        },
    }
};
// Validate spice heat levels
Object.values(exports.spices).forEach((spice) => {
    if (spice.heatLevel > 5 && spice.elementalProperties.Fire < 0.3) {
        // console.error(`fire element too low for heat in ${spice.name}`);
    }
});
// Helper functions
const getSpicesBySubCategory = (subCategory) => {
    return Object.entries(exports.spices)
        .filter(([_, value]) => value.subCategory === subCategory)
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};
exports.getSpicesBySubCategory = getSpicesBySubCategory;
const getSpicesByOrigin = (origin) => {
    return Object.entries(exports.spices)
        .filter(([_, value]) => Array.isArray(value.origin)
        ? value.origin.includes(origin)
        : value.origin === origin)
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};
exports.getSpicesByOrigin = getSpicesByOrigin;
const getSpicesByElementalProperty = (element, minStrength = 0.3) => {
    return Object.entries(exports.spices)
        .filter(([_, value]) => value.elementalProperties[element] >= minStrength)
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};
exports.getSpicesByElementalProperty = getSpicesByElementalProperty;
const getSpiceBlendComponents = (blendName) => {
    const blend = spiceBlends_1.spiceBlends[blendName];
    return blend ? blend.baseIngredients : [];
};
exports.getSpiceBlendComponents = getSpiceBlendComponents;
const getCompatibleSpices = (spiceName) => {
    const spice = exports.spices[spiceName];
    if (!spice)
        return [];
    return Object.entries(exports.spices)
        .filter(([key, value]) => key !== spiceName &&
        value.affinities?.some((affinity) => spice.affinities?.includes(affinity)))
        .map(([key, _]) => key);
};
exports.getCompatibleSpices = getCompatibleSpices;
const getSubstitutions = (spiceName) => {
    const spice = exports.spices[spiceName];
    if (!spice)
        return [];
    return Object.entries(exports.spices)
        .filter(([key, value]) => key !== spiceName &&
        value.qualities?.some((quality) => spice.qualities?.includes(quality)) &&
        value.elementalProperties?.[Object.keys(spice.elementalProperties)[0]] >= 0.3)
        .map(([key, _]) => key);
};
exports.getSubstitutions = getSubstitutions;
const getSpicesByPreparationMethod = (method) => {
    return Object.entries(exports.spices)
        .filter(([_, value]) => value.preparation && Object.keys(value.preparation).includes(method))
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};
exports.getSpicesByPreparationMethod = getSpicesByPreparationMethod;
const getTraditionalBlends = (region) => {
    return Object.entries(spiceBlends_1.spiceBlends)
        .filter(([_, value]) => (Array.isArray(value.origin)
        ? value.origin.includes(region)
        : value.origin === region) || value.regionalVariations?.[region])
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};
exports.getTraditionalBlends = getTraditionalBlends;
const getSpiceConversionRatio = (fromSpice, toSpice) => {
    const source = exports.spices[fromSpice];
    const target = exports.spices[toSpice];
    if (!source ||
        !target ||
        !source.conversionRatio ||
        !target.conversionRatio) {
        return null;
    }
    // Return a default ratio if implementation is missing
    return '1:1';
};
exports.getSpiceConversionRatio = getSpiceConversionRatio;
exports.default = exports.spices;
