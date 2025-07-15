import { fixIngredientMappings } from '../../../utils/elementalUtils';
import { createElementalProperties } from '../../../utils/elemental/elementalUtils';

const rawCitrus = {
    'lemon': {
        id: 'lemon',
        name: 'Lemon',
        description: 'Bright yellow citrus fruit with sour taste',
        type: 'fruit',
        subtype: 'citrus',
        season: ['winter', 'spring'],
        elementalProperties: createElementalProperties({ Fire: 0.2, Water: 0.6, Earth: 0.1, Air: 0.1
        }),
        taste: {
            sweet: 0.1,
            sour: 0.9,
            salty: 0,
            bitter: 0.2,
            umami: 0
        },
        astrology: {
            zodiac: {
                first: { element: 'Water', planet: 'Moon' },
                second: { element: 'Air', planet: 'Mercury' }
            },
            planets: ['Moon', 'Mercury']
        },
        astrologicalProfile: {
            rulingPlanets: ['Mercury', 'Sun'],
            favorableZodiac: ['gemini', 'virgo', 'leo'],
            elementalAffinity: {
                base: 'Water',
                decanModifiers: {
                    first: { element: 'Water', planet: 'Mercury' },
                    second: { element: 'Fire', planet: 'Sun' },
                    third: { element: 'Air', planet: 'Venus' }
                }
            },
            lunarPhaseModifiers: {
                waxingCrescent: {
                    elementalBoost: createElementalProperties({
                        Water: 0.2,
                        Air: 0.1
                    }),
                    preparationTips: ['Ideal for light infusions']
                },
                fullmoon: {
                    elementalBoost: createElementalProperties({
                        Water: 0.3,
                        Fire: 0.1
                    }),
                    preparationTips: ['Maximum juice extraction']
                }
            }
        },
        qualities: ['sour', 'astringent', 'bright', 'refreshing', 'cleansing'],
        origin: ['Southeast Asia', 'Mediterranean'],
        category: 'fruit',
        subCategory: 'citrus',
        varieties: {
            'eureka': {
                name: 'Eureka',
                appearance: 'bright yellow, textured skin',
                flavor: 'classic tart profile',
                juice_content: 'high',
                availability: 'year-round'
            },
            'lisbon': {
                name: 'Lisbon',
                appearance: 'smoother skin, fewer seeds',
                flavor: 'very acidic, less bitter',
                juice_content: 'very high',
                availability: 'winter through spring'
            },
            'meyer': {
                name: 'Meyer',
                appearance: 'deeper yellow-orange, thin skin',
                flavor: 'sweeter, less acidic, slight orange flavor',
                juice_content: 'moderate to high',
                availability: 'winter through spring'
            }
        },
        culinaryApplications: {
            'juice': {
                name: 'Juice',
                method: 'extract fresh',
                applications: ['dressings', 'marinades', 'beverages', 'desserts'],
                techniques: 'roll before juicing to maximize yield',
                notes: 'Heat increases juice yield but can add bitterness'
            },
            'zest': {
                name: 'Zest',
                method: 'grate or peel outer layer',
                applications: ['desserts', 'marinades', 'cocktails', 'pasta'],
                techniques: 'avoid white pith',
                notes: 'Contains the highest concentration of aromatic oils'
            },
            'preserving': {
                name: 'Preserving',
                method: 'salt, sugar, or fermentation',
                applications: ['preserved lemons', 'marmalade', 'candied peel'],
                techniques: 'traditional salt preservation requires at least 3-4 weeks',
                notes: 'Transforms flavor profile dramatically'
            }
        },
        storage: {
            temperature: {
                room: {
                    fahrenheit: { min: 65, max: 70 },
                    celsius: { min: 18, max: 21 }
                },
                refrigerated: {
                    fahrenheit: { min: 40, max: 45 },
                    celsius: { min: 4, max: 7 }
                }
            },
            duration: {
                room: '1 week',
                refrigerated: '3-4 weeks',
                notes: 'Store away from ethylene-producing fruits'
            }
        }
    },
    'orange': {
        id: 'orange',
        name: 'Orange',
        description: 'Sweet and aromatic citrus fruit',
        type: 'fruit',
        subtype: 'citrus',
        season: ['winter'],
        elementalProperties: createElementalProperties({ Fire: 0.3, Water: 0.4, Earth: 0.1, Air: 0.2
        }),
        taste: {
            sweet: 0.8,
            sour: 0.2,
            salty: 0,
            bitter: 0.1,
            umami: 0
        },
        astrology: {
            zodiac: {
                first: { element: 'Fire', planet: 'Sun' },
                second: { element: 'Water', planet: 'Venus' }
            },
            planets: ['Sun', 'Venus']
        },
        qualities: ['sweet', 'warming', 'nourishing'],
        affinities: ['vanilla', 'cinnamon', 'chocolate', 'cranberry', 'dates'],
        cookingMethods: ['raw', 'juiced', 'zested', 'candied'],
        nutritionalProfile: {
            fiber: 'moderate',
            vitamins: ['c', 'a', 'b1'],
            minerals: ['calcium', 'potassium'],
            calories: 62,
            carbs_g: 15,
            fiber_g: 3.1,
            antioxidants: ['hesperidin', 'beta-cryptoxanthin']
        },
        preparation: {
            washing: true,
            peeling: 'remove white pith',
            sectioning: 'remove membranes if desired',
            notes: 'Supreme for salads'
        },
        storage: {
            temperature: 'cool room temp or refrigerated',
            duration: '2-3 weeks',
            notes: 'Keep away from apples and bananas'
        }
    },
    'lime': {
        id: 'lime',
        name: 'Lime',
        description: 'Green citrus fruit with sour taste',
        type: 'fruit',
        subtype: 'citrus',
        season: ['summer', 'fall'],
        elementalProperties: createElementalProperties({ Fire: 0.2, Water: 0.5, Earth: 0.1, Air: 0.2
        }),
        taste: {
            sweet: 0.1,
            sour: 0.9,
            salty: 0,
            bitter: 0.2,
            umami: 0
        },
        astrology: {
            zodiac: {
                first: { element: 'Water', planet: 'Moon' },
                second: { element: 'Air', planet: 'Venus' }
            },
            planets: ['Mercury', 'Venus']
        },
        qualities: ['sour', 'bitter', 'bright', 'zesty', 'refreshing'],
        origin: ['Southeast Asia', 'Mexico', 'India'],
        category: 'fruit',
        subCategory: 'citrus',
        varieties: {
            'persian': {
                name: 'Persian',
                appearance: 'bright green, smooth skin',
                flavor: 'classic tart lime flavor',
                juice_content: 'high',
                availability: 'year-round'
            },
            'key_lime': {
                name: 'Key Lime',
                appearance: 'smaller, rounder, yellow when ripe',
                flavor: 'more aromatic, slightly sweeter',
                juice_content: 'moderate',
                availability: 'summer through fall'
            },
            'kaffir': {
                name: 'Kaffir Lime',
                appearance: 'bumpy skin, distinct shape',
                flavor: 'very aromatic, less juicy',
                juice_content: 'low',
                availability: 'year-round'
            }
        },
        culinaryApplications: {
            'juice': {
                name: 'Juice',
                method: 'extract fresh',
                applications: ['cocktails', 'marinades', 'dressings', 'beverages'],
                techniques: 'roll before juicing',
                notes: 'Essential for many cocktails'
            },
            'zest': {
                name: 'Zest',
                method: 'grate or peel outer layer',
                applications: ['curries', 'cocktails', 'desserts', 'sauces'],
                techniques: 'avoid white pith',
                notes: 'Kaffir lime leaves are also used'
            },
            'preserving': {
                name: 'Preserving',
                method: 'salt, sugar, or fermentation',
                applications: ['preserved limes', 'marmalade', 'pickles'],
                techniques: 'traditional salt preservation',
                notes: 'Common in Middle Eastern cuisine'
            }
        },
        storage: {
            temperature: {
                room: {
                    fahrenheit: { min: 65, max: 70 },
                    celsius: { min: 18, max: 21 }
                },
                refrigerated: {
                    fahrenheit: { min: 40, max: 45 },
                    celsius: { min: 4, max: 7 }
                }
            },
            duration: {
                room: '1 week',
                refrigerated: '2-3 weeks',
                notes: 'Store away from ethylene-producing fruits'
            }
        }
    },
    'grapefruit': {
        name: 'Grapefruit',
        elementalProperties: createElementalProperties({ Fire: 0.3, Water: 0.4, Earth: 0.1, Air: 0.2
        }),
        qualities: ['bitter-sweet', 'refreshing', 'cleansing'],
        season: ['winter', 'spring'],
        category: 'fruit',
        subCategory: 'citrus',
        affinities: ['honey', 'mint', 'ginger', 'vanilla', 'coconut'],
        cookingMethods: ['raw', 'juiced', 'zested', 'preserved'],
        nutritionalProfile: {
            fiber: 'high',
            vitamins: ['c', 'a', 'b6'],
            minerals: ['potassium', 'calcium'],
            calories: 42,
            carbs_g: 11,
            fiber_g: 1.6,
            antioxidants: ['lycopene', 'beta-carotene']
        },
        preparation: {
            washing: true,
            peeling: 'remove white pith',
            sectioning: 'remove membranes',
            notes: 'Can be bitter, balance with sweetness'
        },
        storage: {
            temperature: 'refrigerated',
            duration: '2-3 weeks',
            notes: 'Store away from other fruits'
        }
    },
    'mandarin': {
        name: 'Mandarin',
        elementalProperties: createElementalProperties({ Fire: 0.3, Water: 0.4, Earth: 0.1, Air: 0.2
        }),
        qualities: ['sweet', 'aromatic', 'juicy'],
        season: ['winter'],
        category: 'fruit',
        subCategory: 'citrus',
        affinities: ['chocolate', 'vanilla', 'caramel', 'nuts', 'spices'],
        cookingMethods: ['raw', 'segments', 'juiced', 'desserts'],
        nutritionalProfile: {
            fiber: 'moderate',
            vitamins: ['c', 'folate', 'b1'],
            minerals: ['potassium', 'calcium'],
            calories: 35,
            carbs_g: 9,
            fiber_g: 1.3,
            antioxidants: ['hesperidin', 'beta-cryptoxanthin']
        },
        preparation: {
            washing: true,
            peeling: 'very easy to peel',
            segmenting: 'naturally separates',
            notes: 'Usually seedless'
        },
        storage: {
            temperature: 'cool room temp or refrigerated',
            duration: '1-2 weeks',
            humidity: 'moderate',
            notes: 'Store in mesh bag for Airflow'
        }
    },
    'yuzu': {
        name: 'Yuzu',
        elementalProperties: createElementalProperties({ Fire: 0.2, Water: 0.5, Earth: 0.1, Air: 0.2
        }),
        qualities: ['aromatic', 'complex', 'refreshing'],
        season: ['winter'],
        category: 'fruit',
        subCategory: 'citrus',
        affinities: ['coconut', 'graham', 'vanilla', 'cream', 'mint'],
        cookingMethods: ['juiced', 'zested', 'baked', 'preserved'],
        nutritionalProfile: {
            fiber: 'low',
            vitamins: ['c', 'a'],
            minerals: ['calcium', 'potassium'],
            calories: 25,
            carbs_g: 8.5,
            fiber_g: 1.3,
            antioxidants: ['flavonoids', 'limonoids']
        },
        preparation: {
            washing: true,
            juicing: 'requires many fruits',
            zesting: 'before juicing',
            notes: 'More aromatic than Persian limes'
        },
        storage: {
            temperature: 'refrigerated',
            duration: '1-2 weeks',
            humidity: 'moderate',
            notes: 'Use quickly once ripe'
        }
    },
    'clementine': {
        name: 'Clementine',
        elementalProperties: createElementalProperties({ Fire: 0.3, Water: 0.4, Earth: 0.1, Air: 0.2
        }),
        qualities: ['sweet', 'delicate', 'refreshing'],
        season: ['winter'],
        category: 'fruit',
        subCategory: 'citrus',
        affinities: ['chocolate', 'vanilla', 'caramel', 'nuts', 'spices'],
        cookingMethods: ['raw', 'segments', 'juiced', 'desserts'],
        nutritionalProfile: {
            fiber: 'moderate',
            vitamins: ['c', 'folate', 'b1'],
            minerals: ['potassium', 'calcium'],
            calories: 35,
            carbs_g: 9,
            fiber_g: 1.3,
            antioxidants: ['hesperidin', 'beta-cryptoxanthin']
        },
        preparation: {
            washing: true,
            peeling: 'very easy to peel',
            segmenting: 'naturally separates',
            notes: 'Usually seedless'
        },
        storage: {
            temperature: 'cool room temp or refrigerated',
            duration: '1-2 weeks',
            humidity: 'moderate',
            notes: 'Store in mesh bag for Airflow'
        },
        astrology: {
            zodiac: {
                first: { element: 'Fire', planet: 'Sun' },
                second: { element: 'Air', planet: 'Mercury' }
            },
            planets: ['Sun', 'Mercury']
        }
    },
    'pomelo': {
        name: 'Pomelo',
        elementalProperties: createElementalProperties({ Fire: 0.2, Water: 0.5, Earth: 0.2, Air: 0.1
        }),
        qualities: ['sweet', 'aromatic', 'juicy'],
        season: ['winter'],
        category: 'fruit',
        subCategory: 'citrus',
        affinities: ['vanilla', 'ginger', 'cinnamon', 'mint', 'coconut'],
        cookingMethods: ['raw', 'juiced', 'preserved', 'candied'],
        nutritionalProfile: {
            fiber: 'moderate',
            vitamins: ['c', 'a', 'b6'],
            minerals: ['potassium', 'calcium'],
            calories: 47,
            carbs_g: 12,
            fiber_g: 2.0,
            antioxidants: ['beta-carotene', 'cryptoxanthin']
        },
        preparation: {
            washing: true,
            peeling: 'easy to peel',
            segmenting: 'naturally separates',
            notes: 'Juicier than regular oranges'
        },
        storage: {
            temperature: 'refrigerated',
            duration: '1-2 weeks',
            humidity: 'moderate',
            notes: 'Best eaten fresh'
        }
    },
    'finger_lime': {
        name: 'Finger Lime',
        elementalProperties: createElementalProperties({ Fire: 0.1, Water: 0.4, Earth: 0.1, Air: 0.4
        }),
        qualities: ['sweet', 'aromatic', 'juicy'],
        season: ['winter'],
        category: 'fruit',
        subCategory: 'citrus',
        affinities: ['vanilla', 'ginger', 'cinnamon', 'mint', 'coconut'],
        cookingMethods: ['raw', 'juiced', 'preserved', 'candied'],
        nutritionalProfile: {
            fiber: 'moderate',
            vitamins: ['c', 'a', 'b6'],
            minerals: ['potassium', 'calcium'],
            calories: 47,
            carbs_g: 12,
            fiber_g: 2.0,
            antioxidants: ['beta-carotene', 'cryptoxanthin']
        },
        preparation: {
            washing: true,
            peeling: 'easy to peel',
            segmenting: 'naturally separates',
            notes: 'Juicier than regular oranges'
        },
        storage: {
            temperature: 'refrigerated',
            duration: '1-2 weeks',
            humidity: 'moderate',
            notes: 'Best eaten fresh'
        }
    },
    'blood_orange': {
        name: 'Blood Orange',
        elementalProperties: createElementalProperties({ Fire: 0.4, Water: 0.3, Earth: 0.1, Air: 0.2
        }),
        qualities: ['sweet', 'aromatic', 'juicy'],
        season: ['winter'],
        category: 'fruit',
        subCategory: 'citrus',
        affinities: ['vanilla', 'ginger', 'cinnamon', 'mint', 'coconut'],
        cookingMethods: ['raw', 'juiced', 'preserved', 'candied'],
        nutritionalProfile: {
            fiber: 'moderate',
            vitamins: ['c', 'a', 'b6'],
            minerals: ['potassium', 'calcium'],
            calories: 47,
            carbs_g: 12,
            fiber_g: 2.0,
            antioxidants: ['beta-carotene', 'cryptoxanthin']
        },
        preparation: {
            washing: true,
            peeling: 'easy to peel',
            segmenting: 'naturally separates',
            notes: 'Juicier than regular oranges'
        },
        storage: {
            temperature: 'refrigerated',
            duration: '1-2 weeks',
            humidity: 'moderate',
            notes: 'Best eaten fresh'
        }
    },
    'tangerine': {
        name: 'Tangerine',
        elementalProperties: createElementalProperties({ Fire: 0.3, Water: 0.4, Earth: 0.1, Air: 0.2
        }),
        qualities: ['sweet', 'aromatic', 'juicy'],
        season: ['winter'],
        category: 'fruit',
        subCategory: 'citrus',
        affinities: ['vanilla', 'ginger', 'cinnamon', 'mint', 'coconut'],
        cookingMethods: ['raw', 'juiced', 'preserved', 'candied'],
        nutritionalProfile: {
            fiber: 'moderate',
            vitamins: ['c', 'a', 'b6'],
            minerals: ['potassium', 'calcium'],
            calories: 47,
            carbs_g: 12,
            fiber_g: 2.0,
            antioxidants: ['beta-carotene', 'cryptoxanthin']
        },
        preparation: {
            washing: true,
            peeling: 'easy to peel',
            segmenting: 'naturally separates',
            notes: 'Juicier than regular oranges'
        },
        storage: {
            temperature: 'refrigerated',
            duration: '1-2 weeks',
            humidity: 'moderate',
            notes: 'Best eaten fresh'
        }
    }
};

// Fix the ingredient mappings to ensure they have all required properties
export const citrus = fixIngredientMappings(rawCitrus);

// Export the entire collection
export default citrus;

// Export individual citrus fruits for direct access
export const lemon = citrus.lemon;
export const lime = citrus.lime;
