import type { Ingredient } from './types';
import type { Season } from '@/data/seasons';

export const oils: Record<string, Ingredient> = {
    'olive_oil': {
        name: 'Olive Oil',
        category: 'oil',
        subCategory: 'cooking',
        elementalProperties: { Fire: 0.3, Earth: 0.3, Air: 0.2, Water: 0.2 },
        seasonality: ['spring', 'summer', 'autumn', 'winter'],
        smokePoint: { celsius: 207, fahrenheit: 405 },
        qualities: ['healthy', 'versatile', 'rich'],
        preparation: {
            fresh: {
                duration: 'use within 6 months after opening',
                storage: 'cool, dark place',
                tips: ['avoid heat exposure', 'keep sealed']
            }
        },
        storage: {
            container: 'dark glass bottle',
            duration: '24 months',
            temperature: 'room temperature',
            notes: 'keep away from heat sources'
        },
        lunarPhaseModifiers: {
            newMoon: {
                elementalBoost: { Earth: 0.1, Water: 0.05 },
                preparationTips: ['Good for light sautéing', 'Use in marinades']
            },
            waxingCrescent: {
                elementalBoost: { Fire: 0.05, Earth: 0.05 },
                preparationTips: ['Ideal for herb infusions']
            },
            firstQuarter: {
                elementalBoost: { Fire: 0.1, Air: 0.05 },
                preparationTips: ['Best for medium-heat cooking']
            },
            waxingGibbous: {
                elementalBoost: { Fire: 0.1, Air: 0.1 },
                preparationTips: ['Perfect for sauces and dressings']
            },
            fullMoon: {
                elementalBoost: { Water: 0.15, Air: 0.05 },
                preparationTips: ['Excellent for raw applications', 'Flavor is enhanced']
            },
            waningGibbous: {
                elementalBoost: { Water: 0.1, Earth: 0.05 },
                preparationTips: ['Good for finishing dishes']
            },
            lastQuarter: {
                elementalBoost: { Earth: 0.1, Water: 0.05 },
                preparationTips: ['Use in preservation methods']
            },
            waningCrescent: {
                elementalBoost: { Earth: 0.15 },
                preparationTips: ['Best for gentle cooking methods']
            }
        }
    },
    'coconut_oil': {
        name: 'Coconut Oil',
        category: 'oil',
        subCategory: 'cooking',
        elementalProperties: { Fire: 0.3, Earth: 0.3, Water: 0.2, Air: 0.2 },
        seasonality: ['spring', 'summer', 'autumn', 'winter'],
        smokePoint: { celsius: 177, fahrenheit: 350 },
        qualities: ['stable', 'sweet', 'versatile'],
        preparation: {
            fresh: {
                duration: 'use within 2 years after opening',
                storage: 'room temperature',
                tips: ['melts at 24°C/76°F', 'solidifies when cool']
            }
        },
        storage: {
            container: 'airtight container',
            duration: '24 months',
            temperature: 'room temperature',
            notes: 'solidifies below 24°C/76°F'
        },
        lunarPhaseModifiers: {
            newMoon: {
                elementalBoost: { Earth: 0.1, Water: 0.1 },
                preparationTips: ['Good for gentle sautéing', 'Use in raw treats']
            },
            fullMoon: {
                elementalBoost: { Water: 0.2 },
                preparationTips: ['Excellent for baking', 'Enhanced tropical notes']
            },
            firstQuarter: {
                elementalBoost: { Fire: 0.1, Earth: 0.05 },
                preparationTips: ['Ideal for medium-heat cooking']
            },
            waningGibbous: {
                elementalBoost: { Water: 0.15, Earth: 0.05 },
                preparationTips: ['Good for desserts and smoothies']
            }
        }
    },
    'sesame_oil': {
        name: 'Sesame Oil',
        category: 'oil',
        subCategory: 'finishing',
        elementalProperties: { Fire: 0.4, Earth: 0.3, Air: 0.2, Water: 0.1 },
        seasonality: ['spring', 'summer', 'autumn', 'winter'],
        smokePoint: { celsius: 210, fahrenheit: 410 },
        qualities: ['aromatic', 'nutty', 'strong'],
        preparation: {
            fresh: {
                duration: 'use within 6 months after opening',
                storage: 'refrigerate after opening',
                tips: ['use sparingly', 'add at end of cooking']
            }
        },
        storage: {
            container: 'dark glass bottle',
            duration: '12 months',
            temperature: 'refrigerated after opening',
            notes: 'can become rancid if not stored properly'
        },
        lunarPhaseModifiers: {
            newMoon: {
                elementalBoost: { Earth: 0.05, Fire: 0.1 },
                preparationTips: ['Use sparingly for aromatic base']
            },
            fullMoon: {
                elementalBoost: { Fire: 0.2 },
                preparationTips: ['Flavor is most potent', 'Best as finishing oil']
            },
            waxingGibbous: {
                elementalBoost: { Fire: 0.15, Air: 0.05 },
                preparationTips: ['Excellent for dressings and marinades']
            }
        }
    },
    'ghee': {
        name: 'Ghee',
        category: 'oil',
        subCategory: 'cooking',
        elementalProperties: { Fire: 0.45, Earth: 0.25, Air: 0.15, Water: 0.15 },
        seasonality: ['spring', 'summer', 'autumn', 'winter'],
        smokePoint: { celsius: 250, fahrenheit: 482 },
        qualities: ['rich', 'nutty', 'clarified'],
        preparation: {
            fresh: {
                duration: 'use within 3 months after opening',
                storage: 'room temperature',
                tips: ['keep moisture out', 'use clean utensils']
            }
        },
        storage: {
            container: 'airtight glass jar',
            duration: '12 months',
            temperature: 'room temperature',
            notes: 'does not require refrigeration'
        },
        lunarPhaseModifiers: {
            newMoon: {
                elementalBoost: { Earth: 0.1 },
                preparationTips: ['Good for gentle sautéing']
            },
            fullMoon: {
                elementalBoost: { Fire: 0.2 },
                preparationTips: ['Nutty flavor is enhanced', 'Best for tempering spices']
            },
            waxingGibbous: {
                elementalBoost: { Fire: 0.15, Air: 0.05 },
                preparationTips: ['Excellent for roasting']
            },
            waxingCrescent: {
                elementalBoost: { Fire: 0.1, Earth: 0.05 },
                preparationTips: ['Ideal for baking']
            }
        }
    }
};

export default oils; 