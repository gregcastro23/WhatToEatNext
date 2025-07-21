"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.herbNames = exports.allHerbs = exports.medicinalHerbs = exports.aromaticHerbs = exports.driedHerbs = exports.freshHerbs = exports.herbs = void 0;
const elementalUtils_1 = require("../../../utils/elementalUtils");
const elementalUtils_2 = require("../../../utils/elemental/elementalUtils");
const medicinalHerbs_1 = require("./medicinalHerbs");
Object.defineProperty(exports, "medicinalHerbs", { enumerable: true, get: function () { return medicinalHerbs_1.medicinalHerbs; } });
const freshHerbs_1 = require("./freshHerbs");
Object.defineProperty(exports, "freshHerbs", { enumerable: true, get: function () { return freshHerbs_1.freshHerbs; } });
const driedHerbs_1 = require("./driedHerbs");
Object.defineProperty(exports, "driedHerbs", { enumerable: true, get: function () { return driedHerbs_1.driedHerbs; } });
const aromatic_1 = require("./aromatic");
Object.defineProperty(exports, "aromaticHerbs", { enumerable: true, get: function () { return aromatic_1.aromaticHerbs; } });
// Define cuisine types as string literals
const CUISINE_TYPES = {
    ITALIAN: 'italian',
    THAI: 'thai',
    VIETNAMESE: 'vietnamese',
    FRENCH: 'french',
    CHINESE: 'chinese',
    JAPANESE: 'japanese',
    KOREAN: 'korean',
    INDIAN: 'indian',
    MEXICAN: 'mexican',
    MEDITERRANEAN: 'mediterranean',
    MIDDLE_EASTERN: 'middle_eastern',
    GREEK: 'greek',
    SPANISH: 'spanish',
    MOROCCAN: 'moroccan',
    TURKISH: 'turkish',
    LEBANESE: 'lebanese'
};
// Helper function to generate meaningful herb values
function generateHerbValues(elementalProps) {
    // Normalize elements to ensure they sum to 1
    const totalElements = Object.values(elementalProps).reduce((sum, val) => sum + val, 0);
    const normalized = Object.entries(elementalProps).reduce((acc, [key, val]) => {
        acc[key] = val / (totalElements || 1);
        return acc;
    }, {});
    // Find dominant element
    const dominant = Object.entries(normalized)
        .sort(([, a], [, b]) => b - a)[0][0];
    // Calculate unique values
    const aromaticStrength = Math.round((normalized['Air'] * 6 + normalized['Fire'] * 4) + Math.random() * 2);
    const potency = Math.round((normalized[dominant] * 7) + Math.random() * 3);
    const flavor_complexity = Math.round((Object.keys(normalized).filter(k => normalized[k] > 0.15).length * 2) + Math.random() * 3);
    const preservation_factor = Math.round((normalized['Earth'] * 5 + normalized['Water'] * 3) + Math.random());
    return {
        aromatics: Math.min(10, Math.max(1, aromaticStrength)),
        potency: Math.min(10, Math.max(1, potency)),
        flavor_complexity: Math.min(10, Math.max(1, flavor_complexity)),
        preservation_factor: Math.min(10, Math.max(1, preservation_factor)),
        infusion_speed: Math.min(10, Math.max(1, Math.round(10 - preservation_factor + Math.random() * 2)))
    };
}
// Helper function to standardize ingredient mappings with enhanced values
function createIngredientMapping(id, properties) {
    // Default elemental properties if none provided
    const elementalProps = properties.elementalProperties || {
        Earth: 0.25,
        Water: 0.25,
        Fire: 0.25,
        Air: 0.25
    };
    // Generate meaningful numeric values based on elemental properties
    const herbValues = generateHerbValues(elementalProps);
    return {
        name: id,
        elementalProperties: elementalProps,
        category: properties.category || '',
        ...herbValues,
        ...properties
    };
}
// Combine all herbs into one record
exports.herbs = (0, elementalUtils_1.fixIngredientMappings)({
    ...freshHerbs_1.freshHerbs,
    ...driedHerbs_1.driedHerbs,
    ...aromatic_1.aromaticHerbs,
    ...medicinalHerbs_1.medicinalHerbs,
    // Custom herbs
    'basil': createIngredientMapping('basil', {
        elementalProperties: { Fire: 0.4, Water: 0.2, Air: 0.3, Earth: 0.1 },
        qualities: ['aromatic', 'sweet', 'peppery'],
        category: 'culinary_herb',
        varieties: {
            'sweet_basil': {
                aroma: 'clove-like, sweet',
                best_uses: ['italian', 'thai', 'fresh'],
                aromatic_compounds: ['linalool', 'eugenol'],
                flavor_profile: 'sweet with slight peppery notes',
                oil_content: 0.7 // percentage
            },
            'thai_basil': {
                aroma: 'anise-like, spicy',
                best_uses: ['asian', 'stir-fry', 'soups'],
                aromatic_compounds: ['methyl chavicol', 'eugenol'],
                flavor_profile: 'anise-like with spicy notes',
                oil_content: 0.6
            },
            'holy_basil': {
                aroma: 'spicy, complex',
                best_uses: ['indian', 'tea', 'medicinal'],
                pAirings: ['curry', 'stir-fry', 'tea'],
                aromatic_compounds: ['eugenol', 'caryophyllene'],
                flavor_profile: 'peppery, clove-like',
                oil_content: 0.8
            }
        },
        culinaryTraditions: {
            [CUISINE_TYPES.ITALIAN]: {
                name: 'basilico',
                usage: ['pesto', 'caprese', 'pasta'],
                regional_importance: 9
            },
            [CUISINE_TYPES.THAI]: {
                name: 'horapha',
                usage: ['pad kra pao', 'green curry', 'drunken noodles'],
                preparation: 'whole leaves, quick-cooked',
                pAirings: ['chili', 'fish sauce', 'garlic', 'chicken'],
                cultural_notes: 'Essential in spicy stir-fries',
                regional_importance: 8
            },
            [CUISINE_TYPES.VIETNAMESE]: {
                name: 'rau quế',
                usage: ['pho', 'fresh rolls', 'bánh mì'],
                preparation: 'fresh, served raw',
                pAirings: ['rice noodles', 'bean sprouts', 'mint'],
                cultural_notes: 'Part of fresh herb plate',
                regional_importance: 7
            }
        },
        preparation: {
            fresh: {
                storage: 'stem in Water, room temp',
                duration: '1 week',
                tips: ['avoid cold', 'avoid cutting'],
                quality_retention: 0.8 // 80% of flavor retained
            },
            dried: {
                storage: 'Airtight container',
                duration: '6 months',
                tips: ['crush just before use'],
                flavor_retention: 0.4 // 40% of flavor retained compared to fresh
            }
        }
    }),
    'mint': createIngredientMapping('mint', {
        elementalProperties: { Water: 0.5, Air: 0.3, Earth: 0.1, Fire: 0.1 },
        qualities: ['cooling', 'refreshing', 'aromatic'],
        category: 'culinary_herb',
        varieties: {
            'peppermint': {
                aroma: 'strong, mentholated',
                cooling_factor: 8,
                aromatic_compounds: ['menthol', 'menthone'],
                oil_content: 1.2
            },
            'spearmint': {
                aroma: 'sweet, less intense than peppermint',
                cooling_factor: 6,
                aromatic_compounds: ['carvone', 'limonene'],
                oil_content: 0.7
            }
        }
    }),
    'rosemary': createIngredientMapping('rosemary', {
        elementalProperties: { Fire: 0.3, Earth: 0.4, Air: 0.2, Water: 0.1 },
        qualities: ['piney', 'resinous', 'aromatic'],
        category: 'culinary_herb',
        heat_resistance: 8,
        extraction_efficiency: 6,
        varieties: {
            'upright': {
                oil_content: 1.5,
                growth_habit: 'tall, straight stems'
            },
            'creeping': {
                oil_content: 1.3,
                growth_habit: 'low, spreading'
            }
        }
    }),
    'preparation_methods': createIngredientMapping('preparation_methods', {
        elementalProperties: { Earth: 0.4, Air: 0.3, Fire: 0.2, Water: 0.1 },
        category: 'preparation',
        drying: {
            'Air_drying': {
                method: 'bundle and hang',
                conditions: 'warm, dry, good Airflow',
                duration: '1-2 weeks',
                best_for: ['woody herbs', 'large leaf herbs']
            },
            'dehydrator': {
                temperature: '95-115°F',
                duration: '2-6 hours',
                best_for: ['tender herbs', 'flowers']
            }
        },
        storage: {
            'dried_herbs': {
                container: 'Airtight, dark glass',
                location: 'cool, dark place',
                duration: '6-12 months',
                tips: [
                    'check for moisture',
                    'label with date',
                    'crush to release oils'
                ]
            },
            'fresh_herbs': {
                methods: {
                    'refrigerator': {
                        technique: 'wrap in damp paper',
                        duration: '1-2 weeks'
                    }
                }
            }
        }
    }),
    // Additional specialty herbs
    'curry_leaves': createIngredientMapping('curry_leaves', {
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
        }),
        qualities: ['aromatic', 'citrusy', 'nutty'],
        category: 'culinary_herb',
        sustainabilityScore: 8,
        preparation: {
            fresh: {
                storage: 'wrapped in paper towel, refrigerated',
                duration: '1 week',
                tips: ['freeze for longer storage']
            },
            dried: {
                storage: 'Airtight container',
                duration: '3 months',
                notes: 'loses significant flavor when dried'
            }
        },
        culinaryUses: ['curries', 'dal', 'chutneys', 'rice dishes', 'tempering'],
        flavor: 'Complex citrus and nutty flavor with an intense aroma',
        qualities_detailed: {
            aroma: 'citrusy, slightly bitter',
            intensity: 7,
            complexity: 8,
            texture: { leafy: 0.7, firm: 0.4 }
        },
        regional_importance: {
            'south_indian': 9,
            'sri_lankan': 8
        },
        pAirings: ['mustard seeds', 'coconut', 'lentils', 'asafoetida', 'turmeric']
    }),
    'lemongrass': createIngredientMapping('lemongrass', {
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
        }),
        qualities: ['lemony', 'citral', 'grassy', 'refreshing'],
        category: 'culinary_herb',
        sustainabilityScore: 9,
        preparation: {
            fresh: {
                storage: 'wrapped in damp paper, refrigerated',
                duration: '2 weeks',
                tips: ['use outer stems for tea, inner for cooking']
            },
            dried: {
                storage: 'Airtight container',
                duration: '6 months',
                notes: 'good for teas, less suitable for cooking'
            }
        },
        culinaryUses: ['curries', 'soups', 'marinades', 'teas', 'stir-fries'],
        flavor: 'Bright citrus flavor with grassy undertones',
        regional_importance: {
            'thai': 9,
            'vietnamese': 9,
            'malaysian': 8
        },
        pAirings: ['coconut milk', 'chili', 'lime', 'ginger', 'garlic']
    }),
    'shiso': createIngredientMapping('shiso', {
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
        }),
        qualities: ['minty', 'basil-like', 'anise', 'citrusy'],
        category: 'culinary_herb',
        sustainabilityScore: 8,
        culinaryUses: ['sushi', 'tempura', 'salads', 'wrapping fish', 'noodle dishes'],
        flavor: 'Complex with notes of mint, basil, anise, and citrus',
        regional_importance: {
            'japanese': 9,
            'korean': 8,
            'vietnamese': 7
        },
        pAirings: ['fish', 'rice', 'cucumber', 'ume plum', 'tofu']
    })
});
// Create a comprehensive herb collection that includes all herb variants
exports.allHerbs = (0, elementalUtils_1.fixIngredientMappings)({
    ...freshHerbs_1.freshHerbs,
    ...driedHerbs_1.driedHerbs,
    ...aromatic_1.aromaticHerbs,
    ...medicinalHerbs_1.medicinalHerbs
});
// Export a list of herb names for easy reference
exports.herbNames = Object.keys(exports.allHerbs);
