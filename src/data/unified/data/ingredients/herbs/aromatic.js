import { fixIngredientMappings } from "../../../utils/elementalUtils.js";
import { createElementalProperties } from "../../../utils/elemental/elementalUtils.js";

// Define the raw aromatic herbs data with partial IngredientMapping properties
const rawAromaticHerbs = {
    'thyme': {
        name: 'Thyme',
        category: 'culinary_herb',
        subCategory: 'aromatic',
        elementalProperties: createElementalProperties({ Fire: 0.3, Water: 0.2, Earth: 0.3, Air: 0.2
        }),
        qualities: ['aromatic', 'pungent', 'savory'],
        nutritionalProfile: {
            calories: 0,
            protein_g: 0,
            carbs_g: 0,
            fat_g: 0,
            fiber_g: 0,
            vitamins: [],
            minerals: []
        },
        astrologicalProfile: {
            rulingPlanets: ['Mercury', 'Venus'],
            favorableZodiac: ['gemini', 'libra', 'aquarius'],
            elementalAffinity: {
                base: 'Air',
                decanModifiers: {
                    first: { element: 'Air', planet: 'Mercury' },
                    second: { element: 'Air', planet: 'Venus' },
                    third: { element: 'Earth', planet: 'Saturn' }
                }
            }
        },
        lunarPhaseModifiers: {
            newmoon: {
                elementalBoost: createElementalProperties({ Air: 0.2, Earth: 0.1 }),
                preparationTips: ['Best for drying and preserving']
            },
            fullmoon: {
                elementalBoost: createElementalProperties({ Water: 0.2, Air: 0.1 }),
                preparationTips: ['Enhanced aromatic properties', 'Ideal for teas and infusions']
            },
            waxingCrescent: {
                elementalBoost: createElementalProperties({ Fire: 0.1, Air: 0.1 }),
                preparationTips: ['Good for light cooking applications']
            },
            waxingGibbous: {
                elementalBoost: createElementalProperties({ Water: 0.1, Earth: 0.1 }),
                preparationTips: ['Perfect for stocks and broths']
            }
        },
        storage: {
            container: 'Airtight container',
            duration: '6 months',
            temperature: 'cool, dry place',
            notes: 'Dried thyme keeps longer than fresh'
        }
    },
    'rosemary': {
        name: 'Rosemary',
        category: 'culinary_herb',
        subCategory: 'aromatic',
        elementalProperties: createElementalProperties({ Fire: 0.4, Water: 0.1, Earth: 0.3, Air: 0.2
        }),
        qualities: ['aromatic', 'pungent', 'woody', 'warming'],
        nutritionalProfile: {
            calories: 0,
            protein_g: 0,
            carbs_g: 0,
            fat_g: 0,
            fiber_g: 0,
            vitamins: [],
            minerals: []
        },
        astrologicalProfile: {
            rulingPlanets: ['Sun', 'Mars'],
            favorableZodiac: ['leo', 'aries', 'sagittarius'],
            elementalAffinity: {
                base: 'Fire',
                decanModifiers: {
                    first: { element: 'Fire', planet: 'Sun' },
                    second: { element: 'Fire', planet: 'Mars' },
                    third: { element: 'Earth', planet: 'Pluto' }
                }
            }
        },
        lunarPhaseModifiers: {
            newmoon: {
                elementalBoost: createElementalProperties({ Fire: 0.1, Earth: 0.1 }),
                preparationTips: ['Best for subtle infusions', 'Good time for drying']
            },
            waxingCrescent: {
                elementalBoost: createElementalProperties({ Fire: 0.2, Air: 0.1 }),
                preparationTips: ['Good for infused oils']
            },
            firstQuarter: {
                elementalBoost: createElementalProperties({ Fire: 0.3, Earth: 0.1 }),
                preparationTips: ['Ideal for grilling meats']
            },
            waxingGibbous: {
                elementalBoost: createElementalProperties({ Fire: 0.3, Earth: 0.2 }),
                preparationTips: ['Perfect for roasts and hearty dishes']
            },
            fullmoon: {
                elementalBoost: createElementalProperties({ Fire: 0.2, Water: 0.2 }),
                preparationTips: ['Maximum potency', 'Best for medicinal preparations']
            },
            waningGibbous: {
                elementalBoost: createElementalProperties({ Water: 0.2, Earth: 0.2 }),
                preparationTips: ['Excellent for soups and stews']
            },
            lastQuarter: {
                elementalBoost: createElementalProperties({ Water: 0.2, Fire: 0.1 }),
                preparationTips: ['Good for marinades']
            },
            waningCrescent: {
                elementalBoost: createElementalProperties({ Air: 0.2, Water: 0.1 }),
                preparationTips: ['Best for subtle applications']
            }
        },
        storage: {
            container: 'Airtight container',
            duration: '6 months',
            temperature: 'cool, dry place',
            notes: 'Can be frozen for longer storage'
        }
    },
    'basil': {
        name: 'Basil',
        category: 'culinary_herb',
        subCategory: 'aromatic',
        elementalProperties: createElementalProperties({ Fire: 0.2, Water: 0.2, Earth: 0.1, Air: 0.5
        }),
        qualities: ['aromatic', 'sweet', 'fresh', 'peppery'],
        nutritionalProfile: {
            calories: 0,
            protein_g: 0,
            carbs_g: 0,
            fat_g: 0,
            fiber_g: 0,
            vitamins: [],
            minerals: []
        },
        astrologicalProfile: {
            rulingPlanets: ['Mercury', 'Moon'],
            favorableZodiac: ['gemini', 'cancer'],
            elementalAffinity: {
                base: 'Air',
                decanModifiers: {
                    first: { element: 'Air', planet: 'Mercury' },
                    second: { element: 'Water', planet: 'Moon' },
                    third: { element: 'Earth', planet: 'Venus' }
                }
            }
        },
        lunarPhaseModifiers: {
            waxingCrescent: {
                elementalBoost: createElementalProperties({ Air: 0.2, Water: 0.1 }),
                preparationTips: ['Best for fresh pesto']
            },
            fullmoon: {
                elementalBoost: createElementalProperties({ Water: 0.2, Air: 0.2 }),
                preparationTips: ['Ideal for infused oils']
            }
        },
        storage: {
            container: 'wrapped in paper towel in refrigerator',
            duration: '1 week',
            temperature: 'refrigerated',
            notes: 'Can also be frozen in oil or water'
        }
    },
    'lovage': {
        name: 'Lovage',
        category: 'culinary_herb',
        subCategory: 'aromatic',
        elementalProperties: createElementalProperties({ Fire: 0.2, Water: 0.2, Earth: 0.4, Air: 0.2
        }),
        qualities: ['warming', 'aromatic', 'digestive', 'stimulating'],
        astrologicalProfile: {
            rulingPlanets: ['Mercury', 'Jupiter'],
            favorableZodiac: ['gemini', 'virgo', 'sagittarius'],
            elementalAffinity: {
                base: 'Earth',
                decanModifiers: {
                    first: { element: 'Earth', planet: 'Mercury' },
                    second: { element: 'Earth', planet: 'Jupiter' },
                    third: { element: 'Air', planet: 'Saturn' }
                }
            }
        },
        storage: {
            container: 'stem in water, refrigerated',
            duration: '1 week',
            notes: 'Use sparingly due to strong flavor'
        },
        nutritionalProfile: {
            calories: 0,
            protein_g: 0,
            carbs_g: 0,
            fat_g: 0,
            fiber_g: 0,
            vitamins: [],
            minerals: []
        },
        origin: ['Mediterranean', 'Western Asia'],
        season: ['spring', 'summer'],
        affinities: ['potato', 'chicken', 'fish', 'tomato', 'celery'],
        cookingMethods: ['fresh', 'dried', 'infused'],
        sensoryProfile: {
            taste: {},
            aroma: {},
            texture: { leafy: 0.8 }
        },
        culinaryUses: ['soups', 'stews', 'broths', 'pickling', 'salad dressings'],
        flavor: 'Intense celery-like flavor with hints of anise and parsley',
        preparation: {
            fresh: {
                storage: 'stem in water, refrigerated',
                duration: '1 week',
                tips: ['use sparingly due to strong flavor']
            },
            dried: {
                storage: 'Airtight container',
                duration: '6 months',
                tips: ['crush just before use']
            }
        },
        modality: 'Cardinal'
    },
    'lemon verbena': {
        name: 'Lemon Verbena',
        category: 'culinary_herb',
        subCategory: 'aromatic',
        elementalProperties: createElementalProperties({ Fire: 0.1, Water: 0.2, Earth: 0.1, Air: 0.6
        }),
        qualities: ['cooling', 'uplifting', 'refreshing', 'calming'],
        nutritionalProfile: {
            calories: 0,
            protein_g: 0,
            carbs_g: 0,
            fat_g: 0,
            fiber_g: 0,
            vitamins: [],
            minerals: []
        },
        astrologicalProfile: {
            rulingPlanets: ['Mercury', 'Venus'],
            favorableZodiac: ['gemini', 'libra', 'aquarius'],
            elementalAffinity: {
                base: 'Air',
                decanModifiers: {
                    first: { element: 'Air', planet: 'Mercury' },
                    second: { element: 'Air', planet: 'Venus' },
                    third: { element: 'Air', planet: 'Uranus' }
                }
            }
        },
        storage: {
            container: 'wrapped in damp paper towel, refrigerated',
            duration: '5 days',
            notes: 'Bruise leaves to release aroma'
        },
        origin: ['South America'],
        season: ['summer'],
        affinities: ['fish', 'chicken', 'desserts', 'tea', 'fruit'],
        cookingMethods: ['infused', 'dried', 'fresh'],
        sensoryProfile: {
            taste: {},
            aroma: {},
            texture: { leafy: 0.7 }
        },
        culinaryUses: ['herbal teas', 'desserts', 'syrups', 'cocktails', 'marinades'],
        flavor: 'Intense lemon flavor with floral notes, stronger than lemongrass',
        preparation: {
            fresh: {
                storage: 'wrapped in damp paper towel, refrigerated',
                duration: '5 days',
                tips: ['bruise leaves to release aroma']
            },
            dried: {
                storage: 'dark glass container',
                duration: '8 months',
                tips: ['retains aroma well when dried']
            },
            infusions: {
                techniques: ['steep in hot water', 'infuse in cream or sugar']
            }
        },
        modality: 'Mutable'
    },
    'savory': {
        name: 'Savory',
        category: 'culinary_herb',
        subCategory: 'aromatic',
        elementalProperties: createElementalProperties({ Fire: 0.5, Water: 0.1, Earth: 0.3, Air: 0.1
        }),
        qualities: ['warming', 'stimulating', 'digestive', 'astringent'],
        nutritionalProfile: {
            calories: 0,
            protein_g: 0,
            carbs_g: 0,
            fat_g: 0,
            fiber_g: 0,
            vitamins: [],
            minerals: []
        },
        astrologicalProfile: {
            rulingPlanets: ['Mars', 'Saturn'],
            favorableZodiac: ['aries', 'scorpio', 'capricorn'],
            elementalAffinity: {
                base: 'Fire',
                decanModifiers: {
                    first: { element: 'Fire', planet: 'Mars' },
                    second: { element: 'Fire', planet: 'Saturn' },
                    third: { element: 'Water', planet: 'Pluto' }
                }
            }
        },
        storage: {
            container: 'wrapped in paper towel, refrigerated',
            duration: '1 week',
            notes: 'Add at beginning of cooking'
        },
        origin: ['Mediterranean'],
        season: ['summer'],
        affinities: ['beans', 'lentils', 'meat', 'poultry', 'eggs'],
        cookingMethods: ['dried', 'fresh', 'infused'],
        sensoryProfile: {
            taste: {},
            aroma: {},
            texture: { leafy: 0.6 }
        },
        culinaryUses: ['bean dishes', 'meat stews', 'sausages', 'herb blends', 'vinegars'],
        flavor: 'Peppery, thyme-like flavor with hints of oregano and marjoram',
        varieties: {
            'summer_savory': {
                flavor: 'milder, with notes of thyme and mint',
                best_uses: ['fresh applications', 'delicate dishes']
            },
            'winter_savory': {
                flavor: 'stronger, more pungent and earthy',
                best_uses: ['hearty stews', 'long cooking times']
            }
        },
        preparation: {
            fresh: {
                storage: 'wrapped in paper towel, refrigerated',
                duration: '1 week',
                tips: ['add at beginning of cooking']
            },
            dried: {
                storage: 'Airtight container',
                duration: '1 year',
                tips: ['retains flavor well when dried']
            }
        },
        modality: 'Fixed'
    },
    'curry leaf': {
        name: 'Curry Leaf',
        category: 'culinary_herb',
        subCategory: 'aromatic',
        elementalProperties: createElementalProperties({ Fire: 0.4, Water: 0.1, Earth: 0.3, Air: 0.2
        }),
        qualities: ['warming', 'stimulating', 'digestive', 'aromatic'],
        nutritionalProfile: {
            calories: 0,
            protein_g: 0,
            carbs_g: 0,
            fat_g: 0,
            fiber_g: 0,
            vitamins: [],
            minerals: []
        },
        astrologicalProfile: {
            rulingPlanets: ['Mars', 'Jupiter'],
            favorableZodiac: ['aries', 'scorpio', 'sagittarius'],
            elementalAffinity: {
                base: 'Fire',
                decanModifiers: {
                    first: { element: 'Fire', planet: 'Mars' },
                    second: { element: 'Fire', planet: 'Jupiter' },
                    third: { element: 'Water', planet: 'Pluto' }
                }
            }
        },
        storage: {
            container: 'wrapped in paper towel, refrigerated',
            duration: '1-2 weeks',
            notes: 'Can be frozen for longer storage'
        },
        origin: ['India', 'Sri Lanka'],
        season: ['year-round'],
        affinities: ['lentils', 'coconut', 'fish', 'vegetables', 'rice'],
        cookingMethods: ['fried', 'fresh', 'dried'],
        sensoryProfile: {
            taste: {},
            aroma: {},
            texture: { leafy: 0.7, firm: 0.4 }
        },
        culinaryUses: ['dal', 'curries', 'rice dishes', 'chutneys', 'vegetable dishes'],
        flavor: 'Complex citrus and nutty flavor that is the foundation of many Indian dishes',
        preparation: {
            fresh: {
                storage: 'wrapped in paper towel, refrigerated',
                duration: '1-2 weeks',
                tips: ['can be frozen for longer storage']
            },
            cooking: {
                techniques: ['tempered in hot oil', 'fried as first ingredient', 'whole leaves'],
                tips: ['typically left in dish, though not always eaten']
            }
        },
        traditional: {
            'south_indian': {
                dishes: ['tadka dal', 'sambar', 'rasam', 'coconut chutney'],
                techniques: ['tempered in hot ghee or oil']
            }
        },
        modality: 'Cardinal'
    },
    'chervil': {
        name: 'Chervil',
        category: 'culinary_herb',
        subCategory: 'aromatic',
        elementalProperties: createElementalProperties({ Fire: 0.1, Water: 0.3, Earth: 0.2, Air: 0.4
        }),
        qualities: ['cooling', 'delicate', 'digestive', 'balancing'],
        nutritionalProfile: {
            calories: 0,
            protein_g: 0,
            carbs_g: 0,
            fat_g: 0,
            fiber_g: 0,
            vitamins: [],
            minerals: []
        },
        astrologicalProfile: {
            rulingPlanets: ['Mercury', 'Moon'],
            favorableZodiac: ['virgo', 'gemini', 'cancer'],
            elementalAffinity: {
                base: 'Air',
                decanModifiers: {
                    first: { element: 'Air', planet: 'Mercury' },
                    second: { element: 'Water', planet: 'Moon' },
                    third: { element: 'Earth', planet: 'Venus' }
                }
            }
        },
        storage: {
            container: 'stem in water, refrigerated',
            duration: '2-3 days',
            notes: 'Very perishable, add at the end of cooking'
        },
        origin: ['Caucasus', 'Russia'],
        season: ['spring', 'fall'],
        affinities: ['eggs', 'fish', 'chicken', 'potatoes', 'carrots'],
        cookingMethods: ['fresh', 'garnish', 'light cooking'],
        sensoryProfile: {
            taste: {},
            aroma: {},
            texture: { delicate: 0.9, feathery: 0.8 }
        },
        culinaryUses: ['fine sauces', 'egg dishes', 'salads', 'soups', 'fish dishes'],
        flavor: 'Delicate flavor similar to parsley with subtle anise notes',
        preparation: {
            fresh: {
                storage: 'stem in water, refrigerated',
                duration: '2-3 days',
                tips: ['very perishable', 'add at the end of cooking']
            },
            cooking: {
                techniques: ['add last minute', 'quick sauté', 'raw in dressings'],
                tips: ['heat destroys flavor quickly']
            }
        },
        modality: 'Mutable'
    },
    'dill': {
        name: 'Dill',
        category: 'culinary_herb',
        subCategory: 'aromatic',
        elementalProperties: createElementalProperties({
            Air: 0.4,
            Fire: 0.3,
            Earth: 0.2,
            Water: 0.1
        }),
        qualities: ['nourishing', 'cooling', 'aromatic', 'fresh'],
        nutritionalProfile: {
            calories: 0,
            protein_g: 0,
            carbs_g: 0,
            fat_g: 0,
            fiber_g: 0,
            vitamins: [],
            minerals: []
        },
        storage: {
            container: 'wrapped in damp paper towel, refrigerated',
            duration: '1 week',
            notes: 'Can be frozen or dried for longer storage'
        },
        astrologicalProfile: {
            rulingPlanets: ['Mercury', 'Venus'],
            favorableZodiac: ['gemini', 'libra'],
            elementalAffinity: {
                base: 'Air',
                decanModifiers: {}
            }
        }
    },
    'bay_leaf': {
        name: 'Bay Leaf',
        category: 'culinary_herb',
        subCategory: 'aromatic',
        elementalProperties: createElementalProperties({
            Air: 0.4,
            Fire: 0.3,
            Earth: 0.2,
            Water: 0.1
        }),
        qualities: ['nourishing', 'warming', 'aromatic', 'grounding'],
        nutritionalProfile: {
            calories: 0,
            protein_g: 0,
            carbs_g: 0,
            fat_g: 0,
            fiber_g: 0,
            vitamins: [],
            minerals: []
        },
        storage: {
            container: 'Airtight container',
            duration: '1 year',
            notes: 'Dried bay leaves last much longer than fresh'
        },
        astrologicalProfile: {
            rulingPlanets: ['Sun', 'Jupiter'],
            favorableZodiac: ['leo', 'sagittarius'],
            elementalAffinity: {
                base: 'Fire',
                decanModifiers: {}
            }
        }
    },
    'anise': {
        name: 'Anise',
        category: 'culinary_herb',
        subCategory: 'aromatic',
        elementalProperties: createElementalProperties({
            Air: 0.4,
            Fire: 0.3,
            Earth: 0.2,
            Water: 0.1
        }),
        qualities: ['nourishing', 'warming', 'aromatic', 'sweet'],
        nutritionalProfile: {
            calories: 0,
            protein_g: 0,
            carbs_g: 0,
            fat_g: 0,
            fiber_g: 0,
            vitamins: [],
            minerals: []
        },
        storage: {
            container: 'Airtight container',
            duration: '6 months',
            notes: 'Keep away from light and heat'
        },
        astrologicalProfile: {
            rulingPlanets: ['Jupiter', 'Mercury'],
            favorableZodiac: ['sagittarius', 'gemini'],
            elementalAffinity: {
                base: 'Air',
                decanModifiers: {}
            }
        }
    }
};

// Fix the ingredient mappings to ensure they have all required properties
export const aromaticHerbs = fixIngredientMappings(rawAromaticHerbs);

// Export individual aromatic herbs for direct access
export const thyme = aromaticHerbs.thyme;
export const rosemary = aromaticHerbs.rosemary;
export const basil = aromaticHerbs.basil;
export const dill = aromaticHerbs.dill;
export const bayLeaf = aromaticHerbs.bay_leaf;
export const anise = aromaticHerbs.anise;

// Default export
export default aromaticHerbs;
