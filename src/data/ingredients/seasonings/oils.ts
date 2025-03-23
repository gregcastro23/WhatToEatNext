import type { Ingredient } from '../types';
import type { Season } from '@/data/seasons';

export const oils: Record<string, Ingredient> = {
    'olive_oil': {
        name: 'Olive Oil',
        category: 'oil',
        subCategory: 'cooking',
        elementalProperties: { Fire: 0.3, Earth: 0.3, Air: 0.2, Water: 0.2 },
        seasonality: ['spring', 'summer', 'fall', 'winter'],
        smokePoint: { celsius: 207, fahrenheit: 405 },
        qualities: ['healthy', 'versatile', 'rich'],
        preparation: {
            fresh: {
                duration: '2 years',
                storage: 'cool, dark place',
                tips: ['avoid direct sunlight', 'keep sealed']
            }
        },
        storage: {
            container: 'dark glass bottle',
            duration: '24 months',
            temperature: 'room temperature',
            notes: 'keep away from heat sources'
        },
        astrologicalProfile: {
            rulingPlanets: ['Venus', 'Sun'],
            favorableZodiac: ['Taurus', 'Leo'],
            elementalAffinity: {
                base: 'Fire',
                decanModifiers: {
                    first: { element: 'Fire', planet: 'Sun' },
                    second: { element: 'Earth', planet: 'Venus' },
                    third: { element: 'Air', planet: 'Mercury' }
                }
            },
            lunarPhaseModifiers: {
                firstQuarter: {
                    elementalBoost: { Fire: 0.1, Earth: 0.1 },
                    preparationTips: ['Best for dressings']
                },
                fullMoon: {
                    elementalBoost: { Fire: 0.2 },
                    preparationTips: ['Ideal for finishing dishes']
                }
            }
        }
    },
    'coconut oil': {
        name: 'coconut oil',
        category: 'oil',
        elementalProperties: {
            Fire: 0.2,
            Water: 0.3,
            Earth: 0.3,
            Air: 0.2
        },
        seasonality: ['all'],
        smokePoint: {
            celsius: 177,
            fahrenheit: 350
        },
        qualities: ['sweet', 'tropical', 'solid'],
        preparation: {
            fresh: {
                duration: '6 months',
                storage: 'room temperature',
                tips: ['melts at 24°C/76°F', 'good for medium-heat cooking']
            }
        },
        storage: {
            container: 'glass jar',
            duration: '24 months',
            temperature: 'room temperature',
            notes: 'Solidifies below room temperature'
        }
    },
    'sesame_oil': {
        name: 'Sesame Oil',
        category: 'oil',
        subCategory: 'finishing',
        elementalProperties: { Fire: 0.4, Water: 0.2, Earth: 0.2, Air: 0.2 },
        seasonality: ['fall', 'winter'],
        smokePoint: { celsius: 210, fahrenheit: 410 },
        qualities: ['nutty', 'aromatic', 'warming'],
        preparation: {
            fresh: {
                duration: '1 month',
                storage: 'refrigerated after opening',
                tips: ['use sparingly', 'toast for enhanced flavor']
            }
        },
        storage: {
            container: 'dark glass bottle',
            duration: '12 months',
            temperature: 'cool, dark place',
            notes: 'Refrigerate after opening'
        },
        astrologicalProfile: {
            rulingPlanets: ['Mercury', 'Moon'],
            favorableZodiac: ['Gemini', 'Cancer'],
            elementalAffinity: {
                base: 'Fire',
                decanModifiers: {
                    first: { element: 'Fire', planet: 'Mercury' },
                    second: { element: 'Earth', planet: 'Moon' },
                    third: { element: 'Air', planet: 'Venus' }
                }
            },
            lunarPhaseModifiers: {
                waxingCrescent: {
                    elementalBoost: { Fire: 0.1, Air: 0.1 },
                    preparationTips: ['Best for stir-frying']
                },
                fullMoon: {
                    elementalBoost: { Fire: 0.2 },
                    preparationTips: ['Ideal for finishing dishes']
                }
            }
        }
    },
    'ghee': {
        name: 'Ghee',
        category: 'oil',
        subCategory: 'cooking',
        elementalProperties: { Fire: 0.45, Water: 0.15, Earth: 0.25, Air: 0.15 },
        seasonality: ['spring', 'summer', 'fall', 'winter'],
        smokePoint: { celsius: 250, fahrenheit: 482 },
        qualities: ['rich', 'nutty', 'clarified'],
        preparation: {
            fresh: {
                duration: '3 months',
                storage: 'room temperature',
                tips: ['strain thoroughly', 'heat until golden']
            }
        },
        storage: {
            container: 'glass jar',
            duration: '12 months',
            temperature: 'room temperature',
            notes: 'No refrigeration needed'
        }
    },
    'avocado_oil': {
        name: 'Avocado Oil',
        category: 'oil',
        subCategory: 'cooking',
        elementalProperties: { Fire: 0.3, Water: 0.3, Earth: 0.2, Air: 0.2 },
        seasonality: ['spring', 'summer', 'fall', 'winter'],
        smokePoint: { celsius: 271, fahrenheit: 520 },
        qualities: ['buttery', 'neutral', 'high-heat'],
        preparation: {
            fresh: {
                duration: '6 months',
                storage: 'cool, dark place',
                tips: ['excellent for high-heat cooking', 'good for searing']
            }
        },
        storage: {
            container: 'dark glass bottle',
            duration: '12 months',
            temperature: 'room temperature',
            notes: 'Store away from direct light and heat'
        }
    },
    'peanut oil': {
        name: 'peanut oil',
        category: 'oil',
        elementalProperties: {
            Fire: 0.4,
            Water: 0.2,
            Earth: 0.3,
            Air: 0.1
        },
        seasonality: ['all'],
        smokePoint: {
            celsius: 232,
            fahrenheit: 450
        },
        qualities: ['nutty', 'neutral', 'high-heat'],
        preparation: {
            fresh: {
                duration: '6 months',
                storage: 'cool, dark place',
                tips: ['good for deep frying', 'neutral taste']
            }
        },
        storage: {
            container: 'dark glass bottle',
            duration: '24 months',
            temperature: 'room temperature',
            notes: 'Store away from heat and light'
        }
    },
    'mustard oil': {
        name: 'mustard oil',
        category: 'oil',
        elementalProperties: {
            Fire: 0.5,
            Water: 0.1,
            Earth: 0.2,
            Air: 0.2
        },
        seasonality: ['all'],
        smokePoint: {
            celsius: 254,
            fahrenheit: 490
        },
        qualities: ['pungent', 'spicy', 'strong'],
        preparation: {
            fresh: {
                duration: '3 months',
                storage: 'cool, dark place',
                tips: ['use sparingly', 'traditional in Indian cuisine']
            }
        },
        storage: {
            container: 'dark glass bottle',
            duration: '12 months',
            temperature: 'room temperature',
            notes: 'Keep tightly sealed'
        }
    },
    'walnut oil': {
        name: 'walnut oil',
        category: 'oil',
        elementalProperties: {
            Fire: 0.2,
            Water: 0.2,
            Earth: 0.4,
            Air: 0.2
        },
        seasonality: ['Autumn', 'Winter'],
        smokePoint: {
            celsius: 160,
            fahrenheit: 320
        },
        qualities: ['nutty', 'delicate', 'rich'],
        preparation: {
            fresh: {
                duration: '2 months',
                storage: 'refrigerated',
                tips: ['best unheated', 'use for finishing']
            }
        },
        storage: {
            container: 'dark glass bottle',
            duration: '6-12 months',
            temperature: 'refrigerated',
            notes: 'Goes rancid quickly if not refrigerated'
        }
    },
    'rice bran oil': {
        name: 'rice bran oil',
        category: 'oil',
        elementalProperties: {
            Fire: 0.3,
            Water: 0.2,
            Earth: 0.3,
            Air: 0.2
        },
        seasonality: ['all'],
        smokePoint: {
            celsius: 232,
            fahrenheit: 450
        },
        qualities: ['mild', 'neutral', 'versatile'],
        preparation: {
            fresh: {
                duration: '6 months',
                storage: 'cool, dark place',
                tips: ['good for high-heat cooking', 'neutral flavor']
            }
        },
        storage: {
            container: 'dark glass bottle',
            duration: '24 months',
            temperature: 'room temperature',
            notes: 'Store in a cool, dark place'
        }
    },
    'chili oil': {
        name: 'chili oil',
        category: 'oil',
        elementalProperties: {
            Fire: 0.6,
            Water: 0.1,
            Earth: 0.2,
            Air: 0.1
        },
        seasonality: ['all'],
        smokePoint: {
            celsius: 215,
            fahrenheit: 420
        },
        qualities: ['spicy', 'aromatic', 'intense'],
        preparation: {
            fresh: {
                duration: '1 month',
                storage: 'room temperature',
                tips: ['use sparingly', 'shake before use']
            }
        },
        storage: {
            container: 'glass jar',
            duration: '6 months',
            temperature: 'room temperature',
            notes: 'Keep away from direct sunlight'
        }
    },
    'perilla oil': {
        name: 'perilla oil',
        category: 'oil',
        elementalProperties: {
            Fire: 0.3,
            Water: 0.2,
            Earth: 0.2,
            Air: 0.3
        },
        seasonality: ['all'],
        smokePoint: {
            celsius: 165,
            fahrenheit: 330
        },
        qualities: ['nutty', 'grassy', 'complex'],
        preparation: {
            fresh: {
                duration: '1 month',
                storage: 'refrigerated',
                tips: ['use for finishing', 'common in Korean cuisine']
            }
        },
        storage: {
            container: 'dark glass bottle',
            duration: '6 months',
            temperature: 'refrigerated',
            notes: 'Keep refrigerated to prevent rancidity'
        }
    },
    'camellia oil': {
        name: 'camellia oil',
        category: 'oil',
        elementalProperties: {
            Fire: 0.2,
            Water: 0.3,
            Earth: 0.3,
            Air: 0.2
        },
        seasonality: ['all'],
        smokePoint: {
            celsius: 245,
            fahrenheit: 473
        },
        qualities: ['light', 'clean', 'delicate'],
        preparation: {
            fresh: {
                duration: '3 months',
                storage: 'cool, dark place',
                tips: ['traditional in Japanese cuisine', 'good for light frying']
            }
        },
        storage: {
            container: 'dark glass bottle',
            duration: '12 months',
            temperature: 'room temperature',
            notes: 'Store in a cool, dark place'
        }
    },
    'grapeseed oil': {
        name: 'grapeseed oil',
        category: 'oil',
        elementalProperties: {
            Fire: 0.2,
            Water: 0.3,
            Earth: 0.2,
            Air: 0.3
        },
        seasonality: ['all'],
        smokePoint: {
            celsius: 216,
            fahrenheit: 421
        },
        qualities: ['light', 'clean', 'versatile'],
        preparation: {
            fresh: {
                duration: '3 months',
                storage: 'cool, dark place',
                tips: ['good for vinaigrettes', 'neutral flavor']
            }
        },
        storage: {
            container: 'dark glass bottle',
            duration: '6 months',
            temperature: 'room temperature',
            notes: 'Can go rancid quickly if not stored properly'
        }
    },
    'macadamia oil': {
        name: 'macadamia oil',
        category: 'oil',
        elementalProperties: {
            Fire: 0.2,
            Water: 0.2,
            Earth: 0.4,
            Air: 0.2
        },
        seasonality: ['all'],
        smokePoint: {
            celsius: 210,
            fahrenheit: 410
        },
        qualities: ['buttery', 'rich', 'smooth'],
        preparation: {
            fresh: {
                duration: '4 months',
                storage: 'cool, dark place',
                tips: ['great for salad dressings', 'light sautéing']
            }
        },
        storage: {
            container: 'dark glass bottle',
            duration: '12 months',
            temperature: 'room temperature',
            notes: 'Store in a cool, dark place'
        }
    },
    'palm oil': {
        name: 'palm oil',
        category: 'oil',
        elementalProperties: {
            Fire: 0.4,
            Water: 0.1,
            Earth: 0.4,
            Air: 0.1
        },
        seasonality: ['all'],
        smokePoint: {
            celsius: 235,
            fahrenheit: 455
        },
        qualities: ['rich', 'heavy', 'stable'],
        preparation: {
            fresh: {
                duration: '6 months',
                storage: 'room temperature',
                tips: ['common in African cuisine', 'good for deep frying']
            }
        },
        storage: {
            container: 'opaque container',
            duration: '24 months',
            temperature: 'room temperature',
            notes: 'Solid at room temperature'
        }
    },
    'tea seed oil': {
        name: 'tea seed oil',
        category: 'oil',
        elementalProperties: {
            Fire: 0.3,
            Water: 0.2,
            Earth: 0.2,
            Air: 0.3
        },
        seasonality: ['all'],
        smokePoint: {
            celsius: 252,
            fahrenheit: 485
        },
        qualities: ['light', 'clean', 'subtle'],
        preparation: {
            fresh: {
                duration: '4 months',
                storage: 'cool, dark place',
                tips: ['traditional in Chinese cuisine', 'good for stir-frying']
            }
        },
        storage: {
            container: 'dark glass bottle',
            duration: '18 months',
            temperature: 'room temperature',
            notes: 'Keep away from direct light'
        }
    },
    'shiso oil': {
        name: 'shiso oil',
        category: 'oil',
        elementalProperties: {
            Fire: 0.2,
            Water: 0.2,
            Earth: 0.2,
            Air: 0.4
        },
        seasonality: ['Summer', 'Autumn'],
        smokePoint: {
            celsius: 170,
            fahrenheit: 338
        },
        qualities: ['herbaceous', 'aromatic', 'delicate'],
        preparation: {
            fresh: {
                duration: '1 month',
                storage: 'refrigerated',
                tips: ['use as finishing oil', 'infuse with fresh shiso']
            }
        },
        storage: {
            container: 'dark glass bottle',
            duration: '3 months',
            temperature: 'refrigerated',
            notes: 'Best used fresh, store cold'
        }
    },
    'argan oil': {
        name: 'argan oil',
        category: 'oil',
        elementalProperties: {
            Fire: 0.2,
            Water: 0.2,
            Earth: 0.4,
            Air: 0.2
        },
        seasonality: ['all'],
        smokePoint: {
            celsius: 185,
            fahrenheit: 365
        },
        qualities: ['nutty', 'rich', 'exotic'],
        preparation: {
            fresh: {
                duration: '3 months',
                storage: 'cool, dark place',
                tips: ['traditional in Moroccan cuisine', 'use as finishing oil']
            }
        },
        storage: {
            container: 'dark glass bottle',
            duration: '12 months',
            temperature: 'room temperature',
            notes: 'Keep tightly sealed in dark place'
        }
    },
    'hazelnut oil': {
        name: 'hazelnut oil',
        category: 'oil',
        elementalProperties: {
            Fire: 0.2,
            Water: 0.2,
            Earth: 0.4,
            Air: 0.2
        },
        seasonality: ['Autumn', 'Winter'],
        smokePoint: {
            celsius: 221,
            fahrenheit: 430
        },
        qualities: ['nutty', 'sweet', 'aromatic'],
        preparation: {
            fresh: {
                duration: '2 months',
                storage: 'refrigerated',
                tips: ['best for finishing', 'drizzle on desserts']
            }
        },
        storage: {
            container: 'dark glass bottle',
            duration: '8 months',
            temperature: 'refrigerated',
            notes: 'Keep refrigerated to prevent rancidity'
        }
    },
    'pistachio oil': {
        name: 'pistachio oil',
        category: 'oil',
        elementalProperties: {
            Fire: 0.2,
            Water: 0.2,
            Earth: 0.3,
            Air: 0.3
        },
        seasonality: ['all'],
        smokePoint: {
            celsius: 160,
            fahrenheit: 320
        },
        qualities: ['nutty', 'delicate', 'distinctive'],
        preparation: {
            fresh: {
                duration: '1 month',
                storage: 'refrigerated',
                tips: ['use as finishing oil', 'perfect for desserts']
            }
        },
        storage: {
            container: 'dark glass bottle',
            duration: '6 months',
            temperature: 'refrigerated',
            notes: 'Store in refrigerator after opening'
        }
    },
    'hemp seed oil': {
        name: 'hemp seed oil',
        category: 'oil',
        elementalProperties: {
            Fire: 0.1,
            Water: 0.3,
            Earth: 0.3,
            Air: 0.3
        },
        seasonality: ['all'],
        smokePoint: {
            celsius: 165,
            fahrenheit: 330
        },
        qualities: ['grassy', 'nutty', 'earthy'],
        preparation: {
            fresh: {
                duration: '2 months',
                storage: 'refrigerated',
                tips: ['do not heat', 'use for dressings']
            }
        },
        storage: {
            container: 'dark glass bottle',
            duration: '12 months',
            temperature: 'refrigerated',
            notes: 'Very sensitive to heat and light'
        }
    },
    'black seed oil': {
        name: 'black seed oil',
        category: 'oil',
        elementalProperties: {
            Fire: 0.4,
            Water: 0.2,
            Earth: 0.2,
            Air: 0.2
        },
        seasonality: ['all'],
        smokePoint: {
            celsius: 177,
            fahrenheit: 350
        },
        qualities: ['pungent', 'bitter', 'medicinal'],
        preparation: {
            fresh: {
                duration: '2 months',
                storage: 'cool, dark place',
                tips: ['use sparingly', 'traditional in Middle Eastern cuisine']
            }
        },
        storage: {
            container: 'dark glass bottle',
            duration: '12 months',
            temperature: 'room temperature',
            notes: 'Keep tightly sealed in dark place'
        }
    },
    'almond oil': {
        name: 'almond oil',
        category: 'oil',
        elementalProperties: {
            Fire: 0.2,
            Water: 0.3,
            Earth: 0.3,
            Air: 0.2
        },
        seasonality: ['all'],
        smokePoint: {
            celsius: 216,
            fahrenheit: 420
        },
        qualities: ['sweet', 'delicate', 'nutty'],
        preparation: {
            fresh: {
                duration: '2 months',
                storage: 'refrigerated',
                tips: ['great for baking', 'use in desserts']
            }
        },
        storage: {
            container: 'dark glass bottle',
            duration: '12 months',
            temperature: 'refrigerated',
            notes: 'Keep refrigerated after opening'
        }
    },
    'sunflower oil': {
        name: 'sunflower oil',
        category: 'oil',
        elementalProperties: {
            Fire: 0.3,
            Water: 0.2,
            Earth: 0.2,
            Air: 0.3
        },
        seasonality: ['all'],
        smokePoint: {
            celsius: 232,
            fahrenheit: 450
        },
        qualities: ['light', 'neutral', 'versatile'],
        preparation: {
            fresh: {
                duration: '4 months',
                storage: 'cool, dark place',
                tips: ['good for frying', 'neutral cooking oil']
            }
        },
        storage: {
            container: 'plastic or glass bottle',
            duration: '24 months',
            temperature: 'room temperature',
            notes: 'Store in a cool, dark place'
        }
    },
    'safflower oil': {
        name: 'safflower oil',
        category: 'oil',
        elementalProperties: {
            Fire: 0.3,
            Water: 0.2,
            Earth: 0.2,
            Air: 0.3
        },
        seasonality: ['all'],
        smokePoint: {
            celsius: 266,
            fahrenheit: 510
        },
        qualities: ['neutral', 'light', 'high-heat'],
        preparation: {
            fresh: {
                duration: '3 months',
                storage: 'cool, dark place',
                tips: ['excellent for high-heat cooking', 'good substitute for vegetable oil']
            }
        },
        storage: {
            container: 'dark glass bottle',
            duration: '24 months',
            temperature: 'room temperature',
            notes: 'Store away from direct light'
        }
    },
    'white truffle oil': {
        name: 'white truffle oil',
        category: 'oil',
        elementalProperties: {
            Fire: 0.1,
            Water: 0.2,
            Earth: 0.4,
            Air: 0.3
        },
        seasonality: ['Autumn', 'Winter'],
        smokePoint: {
            celsius: 160,
            fahrenheit: 320
        },
        qualities: ['intense', 'earthy', 'aromatic'],
        preparation: {
            fresh: {
                duration: '1 month',
                storage: 'refrigerated',
                tips: ['use sparingly', 'finishing oil only', 'never heat']
            }
        },
        storage: {
            container: 'dark glass bottle',
            duration: '6 months',
            temperature: 'refrigerated',
            notes: 'Use within 6 months of opening'
        }
    },
    'flaxseed oil': {
        name: 'flaxseed oil',
        category: 'oil',
        elementalProperties: {
            Fire: 0.1,
            Water: 0.3,
            Earth: 0.3,
            Air: 0.3
        },
        seasonality: ['all'],
        smokePoint: {
            celsius: 107,
            fahrenheit: 225
        },
        qualities: ['nutty', 'earthy', 'delicate'],
        preparation: {
            fresh: {
                duration: '1 month',
                storage: 'refrigerated',
                tips: ['never heat', 'use in dressings', 'shake before use']
            }
        },
        storage: {
            container: 'dark glass bottle',
            duration: '4-6 months',
            temperature: 'refrigerated',
            notes: 'Highly perishable, keep refrigerated'
        }
    },
    'red palm oil': {
        name: 'red palm oil',
        category: 'oil',
        elementalProperties: {
            Fire: 0.4,
            Water: 0.1,
            Earth: 0.4,
            Air: 0.1
        },
        seasonality: ['all'],
        smokePoint: {
            celsius: 235,
            fahrenheit: 455
        },
        qualities: ['rich', 'earthy', 'robust'],
        preparation: {
            fresh: {
                duration: '6 months',
                storage: 'room temperature',
                tips: ['traditional in West African cuisine', 'adds color to dishes']
            }
        },
        storage: {
            container: 'opaque container',
            duration: '24 months',
            temperature: 'room temperature',
            notes: 'May solidify at cooler temperatures'
        }
    },
    'roasted pumpkin seed oil': {
        name: 'roasted pumpkin seed oil',
        category: 'oil',
        elementalProperties: {
            Fire: 0.3,
            Water: 0.2,
            Earth: 0.3,
            Air: 0.2
        },
        seasonality: ['Autumn', 'Winter'],
        smokePoint: {
            celsius: 160,
            fahrenheit: 320
        },
        qualities: ['nutty', 'rich', 'dark'],
        preparation: {
            fresh: {
                duration: '2 months',
                storage: 'refrigerated',
                tips: ['use as finishing oil', 'great for salads', 'traditional in Austrian cuisine']
            }
        },
        storage: {
            container: 'dark glass bottle',
            duration: '12 months',
            temperature: 'refrigerated',
            notes: 'Keep refrigerated after opening'
        }
    },
    'mustard seed oil': {
        name: 'mustard seed oil',
        category: 'oil',
        elementalProperties: {
            Fire: 0.5,
            Water: 0.1,
            Earth: 0.2,
            Air: 0.2
        },
        seasonality: ['all'],
        smokePoint: {
            celsius: 254,
            fahrenheit: 490
        },
        qualities: ['pungent', 'sharp', 'intense'],
        preparation: {
            fresh: {
                duration: '3 months',
                storage: 'cool, dark place',
                tips: ['traditional in Bengali cuisine', 'heat before use', 'strong flavor']
            }
        },
        storage: {
            container: 'dark glass bottle',
            duration: '12 months',
            temperature: 'room temperature',
            notes: 'Store in a cool, dark place'
        }
    },
    'babassu oil': {
        name: 'babassu oil',
        category: 'oil',
        elementalProperties: {
            Fire: 0.2,
            Water: 0.3,
            Earth: 0.3,
            Air: 0.2
        },
        seasonality: ['all'],
        smokePoint: {
            celsius: 232,
            fahrenheit: 450
        },
        qualities: ['mild', 'nutty', 'light'],
        preparation: {
            fresh: {
                duration: '6 months',
                storage: 'room temperature',
                tips: ['similar to coconut oil', 'good for frying', 'traditional in Brazilian cuisine']
            }
        },
        storage: {
            container: 'glass jar',
            duration: '24 months',
            temperature: 'room temperature',
            notes: 'Solid at room temperature'
        }
    },
    'apricot kernel oil': {
        name: 'apricot kernel oil',
        category: 'oil',
        elementalProperties: {
            Fire: 0.2,
            Water: 0.3,
            Earth: 0.2,
            Air: 0.3
        },
        seasonality: ['all'],
        smokePoint: {
            celsius: 204,
            fahrenheit: 400
        },
        qualities: ['sweet', 'nutty', 'delicate'],
        preparation: {
            fresh: {
                duration: '3 months',
                storage: 'cool, dark place',
                tips: ['good for skin care', 'use in desserts', 'light cooking']
            }
        },
        storage: {
            container: 'dark glass bottle',
            duration: '12 months',
            temperature: 'room temperature',
            notes: 'Keep away from direct light'
        }
    },
    'grape seed oil': {
        name: 'grape seed oil',
        category: 'oil',
        elementalProperties: {
            Fire: 0.3,
            Water: 0.2,
            Earth: 0.2,
            Air: 0.3
        },
        seasonality: ['all'],
        smokePoint: {
            celsius: 216,
            fahrenheit: 420
        },
        qualities: ['clean', 'light', 'versatile'],
        preparation: {
            fresh: {
                duration: '3 months',
                storage: 'cool, dark place',
                tips: ['good for high-heat cooking', 'neutral flavor', 'excellent for marinades']
            }
        },
        storage: {
            container: 'dark glass bottle',
            duration: '6 months',
            temperature: 'room temperature',
            notes: 'Store in a cool, dark place'
        }
    }
};

// Property verification checklist:
/*
All oils must have:
1. name (string)
2. category ('oil')
3. elementalProperties (sum = 1.0)
   - Fire
   - Water
   - Earth
   - Air
4. seasonality (string[])
5. smokePoint
   - celsius (number)
   - fahrenheit (number)
6. qualities (string[])
7. preparation
   - fresh
     - duration (string)
     - storage (string)
     - tips (string[])
8. storage
   - container (string)
   - duration (string)
   - temperature (string)
   - notes (string)
*/ 