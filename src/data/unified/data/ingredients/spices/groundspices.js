import { fixIngredientMappings } from "../../../utils/elementalUtils";
import { CUISINE_TYPES } from "../../../constants/cuisineTypes";
import { createElementalProperties } from "../../../utils/elemental/elementalUtils";

const rawGroundSpices = {
    'ground_cinnamon': {
        name: 'Ground Cinnamon',
        elementalProperties: createElementalProperties({ Fire: 0.5, Water: 0.1, Earth: 0.3, Air: 0.1 }),
        astrologicalProfile: {
            rulingPlanets: ['Sun', 'Jupiter'],
            favorableZodiac: ['leo', 'sagittarius'],
            elementalAffinity: {
                base: 'Fire',
                decanModifiers: {
                    first: { element: 'Fire', planet: 'Sun' },
                    second: { element: 'Fire', planet: 'Jupiter' },
                    third: { element: 'Earth', planet: 'Saturn' }
                }
            }
        },
        qualities: ['warming', 'sweet', 'pungent'],
        origin: ['Sri Lanka', 'Indonesia', 'China'],
        category: 'spice',
        subCategory: 'ground',
        varieties: {
            'Ceylon': 'true cinnamon, more delicate',
            'Cassia': 'stronger, more common',
            'Saigon': 'most intense flavor'
        },
        conversionRatio: {
            'stick_to_ground': '1 stick = 1 / (2 || 1) tsp ground',
            'fresh_to_dried': 'not applicable'
        },
        affinities: ['baked goods', 'coffee', 'curry', 'fruit', 'chocolate'],
        cookingMethods: ['baking', 'brewing', 'spice blends'],
        storage: {
            temperature: 'cool, dark place',
            duration: '6 months',
            container: 'Airtight, dark',
            notes: 'Loses potency quickly when ground'
        },
        medicinalProperties: {
            actions: ['blood sugar regulation', 'anti-inflammatory'],
            energetics: 'warming',
            cautions: ['blood thinning in large amounts']
        },
        culinary_traditions: {
            [CUISINE_TYPES.INDIAN]: {
                name: 'dalchini',
                usage: ['garam masala', 'chai', 'biryanis', 'desserts'],
                preparation: 'ground or whole sticks',
                cultural_notes: 'Essential in both sweet and savory dishes'
            },
            [CUISINE_TYPES.CHINESE]: {
                name: 'rou gui',
                usage: ['five spice powder', 'braised dishes', 'red cooking', 'desserts'],
                preparation: 'ground or whole sticks',
                cultural_notes: 'Key component in traditional medicine and cuisine'
            },
            [CUISINE_TYPES.MIDDLE_EASTERN]: {
                name: 'qirfah',
                usage: ['desserts', 'coffee', 'savory stews', 'rice dishes'],
                preparation: 'ground fine',
                cultural_notes: 'Valued for both culinary and medicinal properties'
            },
            [CUISINE_TYPES.VIETNAMESE]: {
                name: 'quế',
                usage: ['pho', 'marinades', 'desserts'],
                preparation: 'whole sticks or ground',
                cultural_notes: 'Essential in the famous beef noodle soup'
            },
            [CUISINE_TYPES.GREEK]: {
                name: 'kanella',
                usage: ['pastries', 'stews', 'mulled wine'],
                preparation: 'ground fine',
                cultural_notes: 'Common in both sweet and savory dishes'
            },
            [CUISINE_TYPES.MEXICAN]: {
                name: 'canela',
                usage: ['mole', 'chocolate drinks', 'desserts'],
                preparation: 'ground or sticks',
                cultural_notes: 'Essential in traditional chocolate preparations'
            },
            [CUISINE_TYPES.RUSSIAN]: {
                name: 'koritsa',
                usage: ['baked goods', 'compotes', 'tea blends'],
                preparation: 'ground or whole',
                cultural_notes: 'Popular in winter beverages and preserves'
            }
        }
    },
    'ground_cumin': {
        name: 'Ground Cumin',
        elementalProperties: createElementalProperties({ Fire: 0.3, Water: 0.1, Earth: 0.5, Air: 0.1 }),
        qualities: ['earthy', 'warming', 'pungent'],
        origin: ['India', 'Iran', 'Mediterranean'],
        category: 'spice',
        subCategory: 'ground',
        varieties: {
            'Indian': 'more intense',
            'Iranian': 'more delicate',
            'Mediterranean': 'balanced flavor'
        },
        conversionRatio: {
            'whole_to_ground': '1 tbsp whole = 2.5 tsp ground',
            'fresh_to_dried': 'not applicable'
        },
        affinities: ['beans', 'rice', 'meat', 'curry', 'vegetables'],
        cookingMethods: ['bloomed in oil', 'dry roasted', 'spice blends'],
        storage: {
            temperature: 'cool, dark place',
            duration: '4-6 months',
            container: 'Airtight, dark',
            notes: 'Best toasted before grinding'
        },
        medicinalProperties: {
            actions: ['digestive aid', 'iron-rich'],
            energetics: 'warming',
            cautions: ['none in culinary amounts']
        },
        culinary_traditions: {
            [CUISINE_TYPES.INDIAN]: {
                name: 'jeera powder',
                usage: ['curries', 'dals', 'rice dishes', 'chutneys', 'raitas'],
                preparation: 'dry roasted and ground',
                cultural_notes: 'One of the most essential spices in Indian cuisine'
            },
            [CUISINE_TYPES.MIDDLE_EASTERN]: {
                name: 'kamoun',
                usage: ['hummus', 'falafel', 'grilled meats', 'rice pilaf', 'stews'],
                preparation: 'ground',
                cultural_notes: 'Fundamental to Middle Eastern spice blends'
            },
            [CUISINE_TYPES.MEXICAN]: {
                name: 'comino molido',
                usage: ['salsas', 'beans', 'marinades', 'mole', 'rice'],
                preparation: 'ground, often toasted',
                cultural_notes: 'Essential in Mexican spice blends and marinades'
            },
            [CUISINE_TYPES.CHINESE]: {
                name: 'zi ran',
                usage: ['lamb dishes', 'stir-fries', 'marinades', 'noodle dishes'],
                preparation: 'ground or whole roasted',
                cultural_notes: 'Particularly important in Northern Chinese cuisine'
            },
            [CUISINE_TYPES.AFRICAN]: {
                name: 'cumin',
                usage: ['stews', 'grilled meats', 'legume dishes', 'rice'],
                preparation: 'ground or dry roasted',
                cultural_notes: 'Common in North African spice blends'
            },
            [CUISINE_TYPES.GREEK]: {
                name: 'kymino',
                usage: ['meat dishes', 'bean dishes', 'vegetable dishes'],
                preparation: 'ground',
                cultural_notes: 'Used in traditional meat preparations'
            }
        }
    },
    'ground_turmeric': {
        name: 'Ground Turmeric',
        elementalProperties: createElementalProperties({ Fire: 0.4, Water: 0.1, Earth: 0.4, Air: 0.1 }),
        astrologicalProfile: {
            rulingPlanets: ['Sun', 'Mars'],
            favorableZodiac: ['leo', 'aries'],
            elementalAffinity: {
                base: 'Fire',
                decanModifiers: {
                    first: { element: 'Fire', planet: 'Sun' },
                    second: { element: 'Fire', planet: 'Mars' },
                    third: { element: 'Air', planet: 'Mercury' }
                }
            },
            lunarPhaseModifiers: {
                newmoon: {
                    elementalBoost: createElementalProperties({ Fire: 0.2, Earth: 0.1 }),
                    preparationTips: ['Begin infusing oils', 'Start medicinal preparations']
                },
                fullmoon: {
                    elementalBoost: createElementalProperties({ Fire: 0.1, Water: 0.2 }),
                    preparationTips: ['Maximum potency for healing applications', 'Golden milk rituals']
                },
                waningGibbous: {
                    elementalBoost: createElementalProperties({
                        Earth: 0.2,
                        Water: 0.1
                    }),
                    preparationTips: ['Good for preservation methods', 'Pickling and fermenting']
                }
            },
            aspectEnhancers: ['Sun trine mars', 'Jupiter in leoLeo']
        },
        qualities: ['bitter', 'earthy', 'pungent', 'warming', 'vibrant'],
        origin: ['India', 'Southeast Asia', 'Indonesia', 'China'],
        category: 'spice',
        subCategory: 'ground',
        varieties: {
            'Madras': 'intense, deep color',
            'Alleppey': 'high curcumin content',
            'Indonesian': 'milder flavor'
        },
        conversionRatio: {
            'fresh_to_ground': '1 inch fresh = 1 tsp ground',
            'whole_to_ground': '1 tbsp whole = 2 tsp ground'
        },
        affinities: ['rice', 'curry', 'soups', 'vegetables', 'lentils'],
        cookingMethods: ['bloomed in oil', 'spice blends', 'marinades'],
        storage: {
            temperature: 'cool, dark place',
            duration: '6-12 months',
            container: 'Airtight, dark',
            notes: 'Stains easily, store carefully'
        },
        medicinalProperties: {
            actions: ['anti-inflammatory', 'antioxidant', 'digestive aid'],
            energetics: 'warming',
            cautions: ['may interact with blood thinners']
        },
        culinary_traditions: {
            [CUISINE_TYPES.INDIAN]: {
                name: 'haldi',
                usage: ['curries', 'dals', 'rice dishes', 'pickles', 'biryani'],
                preparation: 'bloomed in hot oil',
                cultural_notes: 'Essential for color and flavor in Indian cuisine'
            },
            [CUISINE_TYPES.THAI]: {
                name: 'khamin',
                usage: ['curries', 'soups', 'marinades', 'rice dishes'],
                preparation: 'fresh or ground',
                cultural_notes: 'Used in traditional medicine and cuisine'
            },
            [CUISINE_TYPES.INDONESIAN]: {
                name: 'kunyit',
                usage: ['curries', 'rice dishes', 'soups', 'marinades'],
                preparation: 'fresh or ground',
                cultural_notes: 'Essential in traditional spice pastes'
            },
            [CUISINE_TYPES.MALAYSIAN]: {
                name: 'kunyit',
                usage: ['curries', 'rice dishes', 'soups', 'marinades'],
                preparation: 'fresh or ground',
                cultural_notes: 'Used in traditional spice pastes'
            },
            [CUISINE_TYPES.SRI_LANKAN]: {
                name: 'kaha',
                usage: ['curries', 'rice dishes', 'soups', 'marinades'],
                preparation: 'fresh or ground',
                cultural_notes: 'Essential in traditional spice pastes'
            },
            [CUISINE_TYPES.BANGLADESHI]: {
                name: 'halud',
                usage: ['curries', 'dals', 'rice dishes', 'pickles'],
                preparation: 'fresh or ground',
                cultural_notes: 'Essential for color and flavor'
            },
            [CUISINE_TYPES.PAKISTANI]: {
                name: 'haldi',
                usage: ['curries', 'dals', 'rice dishes', 'pickles'],
                preparation: 'fresh or ground',
                cultural_notes: 'Essential for color and flavor'
            }
        }
    },
    'ground_ginger': {
        name: 'Ground Ginger',
        elementalProperties: createElementalProperties({ Fire: 0.6, Water: 0.1, Earth: 0.2, Air: 0.1 }),
        astrologicalProfile: {
            rulingPlanets: ['Mars', 'Jupiter'],
            favorableZodiac: ['aries', 'sagittarius'],
            elementalAffinity: {
                base: 'Fire',
                decanModifiers: {
                    first: { element: 'Fire', planet: 'Mars' },
                    second: { element: 'Fire', planet: 'Jupiter' },
                    third: { element: 'Earth', planet: 'Saturn' }
                }
            }
        },
        qualities: ['warming', 'pungent', 'aromatic', 'spicy'],
        origin: ['India', 'China', 'Jamaica'],
        category: 'spice',
        subCategory: 'ground',
        varieties: {
            'Indian': 'more intense',
            'Chinese': 'milder',
            'Jamaican': 'fruity notes'
        },
        conversionRatio: {
            'fresh_to_ground': '1 tbsp fresh = 1/4 tsp ground',
            'crystallized_to_ground': '1 tbsp crystallized = 1/2 tsp ground'
        },
        affinities: ['baked goods', 'curry', 'tea', 'soups', 'desserts'],
        cookingMethods: ['baking', 'spice blends', 'beverages'],
        storage: {
            temperature: 'cool, dark place',
            duration: '6-12 months',
            container: 'Airtight, dark',
            notes: 'Loses potency over time'
        },
        medicinalProperties: {
            actions: ['digestive aid', 'anti-nausea', 'warming'],
            energetics: 'warming',
            cautions: ['may interact with blood thinners']
        },
        culinary_traditions: {
            [CUISINE_TYPES.INDIAN]: {
                name: 'sonth',
                usage: ['curries', 'chai', 'desserts', 'pickles'],
                preparation: 'ground',
                cultural_notes: 'Used in traditional medicine and cuisine'
            },
            [CUISINE_TYPES.CHINESE]: {
                name: 'jiang fen',
                usage: ['stir-fries', 'soups', 'marinades', 'desserts'],
                preparation: 'fresh or ground',
                cultural_notes: 'Essential in traditional medicine'
            },
            [CUISINE_TYPES.JAPANESE]: {
                name: 'shoga',
                usage: ['sushi', 'pickles', 'soups', 'desserts'],
                preparation: 'fresh or ground',
                cultural_notes: 'Used in traditional medicine'
            },
            [CUISINE_TYPES.THAI]: {
                name: 'khing',
                usage: ['curries', 'soups', 'marinades', 'desserts'],
                preparation: 'fresh or ground',
                cultural_notes: 'Essential in traditional medicine'
            },
            [CUISINE_TYPES.KOREAN]: {
                name: 'saenggang',
                usage: ['kimchi', 'soups', 'marinades', 'desserts'],
                preparation: 'fresh or ground',
                cultural_notes: 'Used in traditional medicine'
            },
            [CUISINE_TYPES.VIETNAMESE]: {
                name: 'gừng',
                usage: ['soups', 'marinades', 'desserts'],
                preparation: 'fresh or ground',
                cultural_notes: 'Used in traditional medicine'
            },
            [CUISINE_TYPES.INDONESIAN]: {
                name: 'jahe',
                usage: ['curries', 'soups', 'marinades', 'desserts'],
                preparation: 'fresh or ground',
                cultural_notes: 'Essential in traditional medicine'
            },
            [CUISINE_TYPES.MALAYSIAN]: {
                name: 'halia',
                usage: ['curries', 'soups', 'marinades', 'desserts'],
                preparation: 'fresh or ground',
                cultural_notes: 'Essential in traditional medicine'
            },
            [CUISINE_TYPES.SRI_LANKAN]: {
                name: 'inguru',
                usage: ['curries', 'soups', 'marinades', 'desserts'],
                preparation: 'fresh or ground',
                cultural_notes: 'Essential in traditional medicine'
            },
            [CUISINE_TYPES.BANGLADESHI]: {
                name: 'ada',
                usage: ['curries', 'soups', 'marinades', 'desserts'],
                preparation: 'fresh or ground',
                cultural_notes: 'Essential in traditional medicine'
            },
            [CUISINE_TYPES.PAKISTANI]: {
                name: 'adrak',
                usage: ['curries', 'soups', 'marinades', 'desserts'],
                preparation: 'fresh or ground',
                cultural_notes: 'Essential in traditional medicine'
            }
        }
    },
    'ground_nutmeg': {
        name: 'Ground Nutmeg',
        elementalProperties: createElementalProperties({ Fire: 0.4, Water: 0.1, Earth: 0.4, Air: 0.1 }),
        astrologicalProfile: {
            rulingPlanets: ['Jupiter', 'Saturn'],
            favorableZodiac: ['sagittarius', 'capricorn'],
            elementalAffinity: {
                base: 'Earth',
                decanModifiers: {
                    first: { element: 'Fire', planet: 'Jupiter' },
                    second: { element: 'Earth', planet: 'Saturn' },
                    third: { element: 'Air', planet: 'Mercury' }
                }
            }
        },
        qualities: ['warming', 'sweet', 'aromatic', 'nutty'],
        origin: ['Indonesia', 'Grenada', 'India'],
        category: 'spice',
        subCategory: 'ground',
        varieties: {
            'Indonesian': 'most common',
            'Grenadian': 'premium quality',
            'Indian': 'local variety'
        },
        conversionRatio: {
            'whole_to_ground': '1 whole = 2-3 tsp ground',
            'fresh_to_dried': 'not applicable'
        },
        affinities: ['baked goods', 'sauces', 'desserts', 'vegetables', 'meat'],
        cookingMethods: ['baking', 'sauces', 'desserts'],
        storage: {
            temperature: 'cool, dark place',
            duration: '6-12 months',
            container: 'Airtight, dark',
            notes: 'Best ground fresh from whole'
        },
        medicinalProperties: {
            actions: ['digestive aid', 'warming', 'sedative'],
            energetics: 'warming',
            cautions: ['toxic in large amounts']
        },
        culinary_traditions: {
            [CUISINE_TYPES.INDIAN]: {
                name: 'jaiphal',
                usage: ['garam masala', 'desserts', 'curries', 'rice dishes'],
                preparation: 'ground fresh',
                cultural_notes: 'Essential in traditional spice blends'
            },
            [CUISINE_TYPES.INDONESIAN]: {
                name: 'pala',
                usage: ['curries', 'soups', 'desserts', 'rice dishes'],
                preparation: 'ground fresh',
                cultural_notes: 'Essential in traditional spice blends'
            },
            [CUISINE_TYPES.MALAYSIAN]: {
                name: 'buah pala',
                usage: ['curries', 'soups', 'desserts', 'rice dishes'],
                preparation: 'ground fresh',
                cultural_notes: 'Essential in traditional spice blends'
            },
            [CUISINE_TYPES.SRI_LANKAN]: {
                name: 'sadikka',
                usage: ['curries', 'soups', 'desserts', 'rice dishes'],
                preparation: 'ground fresh',
                cultural_notes: 'Essential in traditional spice blends'
            },
            [CUISINE_TYPES.BANGLADESHI]: {
                name: 'jaiphal',
                usage: ['curries', 'soups', 'desserts', 'rice dishes'],
                preparation: 'ground fresh',
                cultural_notes: 'Essential in traditional spice blends'
            },
            [CUISINE_TYPES.PAKISTANI]: {
                name: 'jaiphal',
                usage: ['curries', 'soups', 'desserts', 'rice dishes'],
                preparation: 'ground fresh',
                cultural_notes: 'Essential in traditional spice blends'
            }
        }
    }
};

export const groundSpices = fixIngredientMappings(rawGroundSpices);

export default groundSpices;

export const groundCinnamon = groundSpices.ground_cinnamon;
export const groundCumin = groundSpices.ground_cumin;
export const groundTurmeric = groundSpices.ground_turmeric;
export const groundGinger = groundSpices.ground_ginger;
export const groundNutmeg = groundSpices.ground_nutmeg;
