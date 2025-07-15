import { fixIngredientMappings } from "../../../utils/elementalUtils";
import { createElementalProperties } from "../../../utils/elemental/elementalUtils";

// Helper function to standardize ingredient mappings
function createIngredientMapping(id, properties) {
    return {
        name: id,
        elementalProperties: properties.elementalProperties || {
            Earth: 0.25,
            Water: 0.25,
            Fire: 0.25,
            Air: 0.25,
        },
        category: properties.category || '',
        ...properties,
    };
}

const rawPlantBased = {
    tempeh: createIngredientMapping('tempeh', {
        elementalProperties: createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }),
        astrologicalProfile: {
            rulingPlanets: ['Saturn', 'Mars'],
            favorableZodiac: ['capricorn', 'aries'],
            elementalAffinity: {
                base: 'Earth',
                decanModifiers: {
                    first: {},
                    second: {},
                    third: { element: 'Water', planet: 'Pluto' }
                },
            },
            lunarPhaseModifiers: {
                waxingGibbous: {
                    elementalBoost: {},
                    preparationTips: ['Best for grilling'],
                },
                fullmoon: {
                    elementalBoost: {},
                    preparationTips: ['Ideal for frying'],
                }
            },
        },
        qualities: ['fermented', 'nutty', 'firm'],
        origin: ['Indonesia', 'Java'],
        category: 'protein',
        subCategory: 'plant_based',
        nutritionalProfile: {
            serving_size: '3 oz',
            calories: 160,
            macros: {
                protein: 19,
                carbs: 9,
                fat: 11,
                fiber: 6,
            },
            vitamins: {
                B2: 0.18,
                B3: 0.12,
                B6: 0.15,
                folate: 0.14,
            },
            minerals: {
                manganese: 0.65,
                copper: 0.4,
                phosphorus: 0.22,
                magnesium: 0.2,
                iron: 0.12,
            },
            source: 'USDA FoodData Central',
            probiotics: 'Contains beneficial bacteria from fermentation',
        },
        culinaryApplications: {
            'stir-fry': {
                name: 'Stir-fry',
                prepTime: '15 mins',
                cookingTemp: 'medium-high',
            },
            baking: {
                name: 'Baking',
                prepTime: '25 mins',
                cookingTemp: '375°F',
            }
        },
        varieties: {
            Traditional: {
                name: 'Traditional',
                appearance: 'white mycelium, visible soybeans',
                texture: 'firm, dense',
                flavor: 'nutty, mushroom-like',
                notes: 'whole soybean variety',
            },
            Multi_grain: {
                name: 'Multi Grain',
                appearance: 'varied color based on grains',
                texture: 'more varied texture',
                flavor: 'complex grain notes',
                notes: 'mixed with various grains',
            },
            Flax: {
                name: 'Flax',
                appearance: 'darker spots from seeds',
                texture: 'slightly looser bind',
                flavor: 'nutty, omega-rich',
                notes: 'higher in omega-3',
            }
        },
        regionalPreparations: {
            indonesian: {
                name: 'Indonesian',
                traditional: {
                    name: 'Traditional',
                    goreng: {
                        name: 'Goreng',
                        method: 'thin slice and fry',
                        marinade: ['garlic', 'coriander', 'turmeric'],
                        service: 'with sambal and rice',
                    },
                    bacem: {
                        name: 'Bacem',
                        method: 'braised in spiced coconut water',
                        spices: ['galangal', 'tamarind', 'palm sugar'],
                        finish: 'pan-fry until caramelized',
                    }
                },
            },
            modern: {
                name: 'Modern',
                western: {
                    name: 'Western',
                    bacon_style: {
                        name: 'Bacon Style',
                        marinade: ['liquid smoke', 'maple', 'soy'],
                        method: 'thin slice and pan-fry',
                        use: 'breakfast protein, sandwiches',
                    },
                    cutlet: {
                        name: 'Cutlet',
                        preparation: 'steam, marinate, bread',
                        cooking: 'pan-fry or bake',
                        service: 'with gravy or sauce',
                    }
                },
                fusion: {
                    name: 'Fusion',
                    korean_bbq: {
                        name: 'Korean Bbq',
                        marinade: ['gochujang', 'sesame', 'garlic'],
                        method: 'grill or pan-fry',
                        service: 'with lettuce wraps',
                    },
                    mediterranean: {
                        name: 'Mediterranean',
                        marinade: ['olive oil', 'herbs', 'lemon'],
                        method: 'grill or bake',
                        service: 'with tahini sauce',
                    }
                },
            }
        },
        saucePAirings: {
            asian: {
                name: 'Asian',
                peanut: {
                    name: 'Peanut',
                    base: 'ground peanuts',
                    ingredients: ['coconut milk', 'soy', 'lime'],
                    spices: ['ginger', 'garlic', 'chili'],
                },
                sweet_soy: {
                    name: 'Sweet Soy',
                    base: 'kecap manis',
                    aromatics: ['garlic', 'chili'],
                    finish: 'lime juice',
                }
            },
            western: {
                name: 'Western',
                mushroom_gravy: {
                    name: 'Mushroom Gravy',
                    base: 'mushroom stock',
                    thickener: 'roux or cornstarch',
                    finish: 'herbs and wine',
                },
                chimichurri: {
                    name: 'Chimichurri',
                    base: 'olive oil',
                    herbs: ['parsley', 'oregano'],
                    aromatics: ['garlic', 'chili'],
                }
            },
        },
        seasonalAdjustments: {
            summer: {
                name: 'Summer',
                preparations: ['grilled', 'smoked'],
                marinades: ['lighter citrus', 'herb-based'],
                accompaniments: ['fresh slaws', 'grilled vegetables'],
            },
            winter: {
                name: 'Winter',
                preparations: ['braised', 'baked'],
                marinades: ['richer spices', 'warm aromatics'],
                accompaniments: ['root vegetables', 'grains'],
            }
        },
    }),
    fava_protein: createIngredientMapping('fava_protein', {
        elementalProperties: createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }),
        astrologicalProfile: {
            rulingPlanets: ['Moon', 'Venus'],
            favorableZodiac: ['cancer', 'taurus'],
            elementalAffinity: {
                base: 'Earth',
                decanModifiers: {
                    first: {},
                    second: {},
                    third: { element: 'Air', planet: 'Mercury' }
                },
            },
            lunarPhaseModifiers: {
                newmoon: {
                    elementalBoost: {},
                    preparationTips: ['Best for marinating'],
                },
                fullmoon: {
                    elementalBoost: {},
                    preparationTips: ['Ideal for baking'],
                }
            },
        },
        qualities: ['rich', 'creamy', 'versatile'],
        origin: ['Mediterranean', 'Middle East'],
        category: 'protein',
        subCategory: 'plant_based',
        varieties: {
            Whole_Beans: {
                name: 'Whole Beans',
                appearance: 'large, light green',
                texture: 'creamy when cooked',
                applications: {
                    stews: 'traditional dishes',
                    purees: 'dips and spreads',
                    salads: 'when young and tender',
                }
            },
            Split: {
                name: 'Split',
                appearance: 'yellow split beans',
                texture: 'smooth when cooked',
                applications: {
                    soups: 'quick-cooking',
                    dips: 'traditional bessara',
                    patties: 'formed and fried',
                }
            },
        },
        culinaryTraditions: {
            egyptian: {
                name: 'ful medames',
                usage: ['breakfast', 'main dish'],
                preparation: 'slow-cooked with olive oil',
                pAirings: ['cumin', 'lemon', 'parsley'],
                cultural_notes: 'Traditional breakfast dish',
            },
            moroccan: {
                name: 'bessara',
                usage: ['soup', 'dip'],
                preparation: 'pureed with olive oil and spices',
                pAirings: ['olive oil', 'paprika', 'cumin'],
                cultural_notes: 'Popular street food',
            }
        },
        preparation: {
            soaking: '8-12 hours',
            peeling: 'recommended for whole beans',
            cooking: '30-45 minutes',
            notes: 'Remove skins for smoother texture',
        },
        storage: {
            dried: {
                temperature: 'room temperature',
                duration: '1 year',
                method: 'Airtight container',
            },
            cooked: {
                temperature: {},
                duration: '3-4 days',
                method: 'refrigerated in liquid',
            }
        },
    }),
};

// Fix the ingredient mappings to ensure they have all required properties
export const plantBased = fixIngredientMappings(rawPlantBased);

// Add validation for elemental sums
Object.entries(plantBased).forEach(([id, ingredient]) => {
    if (!ingredient.elementalProperties)
        return;
    const sum = Object.values(ingredient.elementalProperties).reduce((a, b) => a + b, 0);
    if (Math.abs(sum - 1) > 0.0001) {
        // console.error(`Elemental sum error in ${ingredient.name || id}: ${sum}`);
        // Optionally auto-normalize the values
        const factor = 1 / (sum || 1);
        Object.entries(ingredient.elementalProperties).forEach(([element, value]) => {
            const elementKey = element;
            ingredient.elementalProperties[elementKey] = value * factor;
        });
    }
});

// Create a collection of all plant-based proteins
export const allPlantBased = Object.values(plantBased);

export default plantBased;
