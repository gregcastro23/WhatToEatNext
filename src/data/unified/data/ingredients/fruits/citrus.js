"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lime = exports.lemon = exports.citrus = void 0;
const elementalUtils_1 = require("../../../utils/elementalUtils");
const elementalUtils_2 = require("../../../utils/elemental/elementalUtils");
const rawCitrus = {
    'lemon': {
        id: 'lemon',
        name: 'Lemon',
        description: 'Bright yellow citrus fruit with sour taste',
        type: 'fruit',
        subtype: 'citrus',
        season: ['winter', 'spring'],
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.2, Water: 0.6, Earth: 0.1, Air: 0.1
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
                    elementalBoost: (0, elementalUtils_2.createElementalProperties)({
                        Water: 0.2,
                        Air: 0.1
                    }),
                    preparationTips: ['Ideal for light infusions']
                },
                fullmoon: {
                    elementalBoost: (0, elementalUtils_2.createElementalProperties)({
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
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.3, Water: 0.4, Earth: 0.1, Air: 0.2
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
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.2, Water: 0.5, Earth: 0.1, Air: 0.2
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
                name: 'Persian/Tahiti Lime',
                appearance: 'larger, oval, seedless',
                flavor: 'mild, less acidic',
                juice_content: 'high',
                availability: 'year-round'
            },
            'key': {
                name: 'Key/Mexican Lime',
                appearance: 'small, round, seedy',
                flavor: 'intensely aromatic, very acidic',
                juice_content: 'moderate',
                availability: 'summer through fall'
            },
            'kaffir': {
                name: 'Kaffir/Makrut Lime',
                appearance: 'bumpy, knobbly skin',
                flavor: 'intense aromatic oil in leaves and zest',
                juice_content: 'low, rarely used for juice',
                availability: 'limited, prized for leaves'
            }
        },
        culinaryApplications: {
            'juice': {
                name: 'Juice',
                method: 'extract fresh',
                applications: ['cocktails', 'ceviche', 'dressings', 'marinades'],
                techniques: 'microwave briefly for maximum extraction',
                notes: 'More aromatic but less acidic than lemon'
            },
            'zest': {
                name: 'Zest',
                method: 'grate or peel outer layer',
                applications: ['desserts', 'curries', 'marinades'],
                techniques: 'avoid white pith',
                notes: 'Higher oil content than lemon'
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
                room: '5-7 days',
                refrigerated: '2-3 weeks',
                notes: 'More perishable than lemons'
            }
        },
        nutritionalProfile: {
            vitamins: ['C', 'B6', 'folate'],
            minerals: ['potassium', 'calcium', 'magnesium'],
            antioxidants: ['flavonoids', 'limonoids'],
            per_100g: {
                calories: 30,
                vitamin_c_mg: 29,
                carbs_g: 10.5,
                fiber_g: 2.8
            }
        }
    },
    'grapefruit': {
        id: 'grapefruit',
        name: 'Grapefruit',
        description: 'Large citrus fruit with bitter-sweet taste',
        type: 'fruit',
        subtype: 'citrus',
        season: ['winter', 'spring'],
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.2, Water: 0.5, Earth: 0.1, Air: 0.2
        }),
        taste: {
            sweet: 0.2,
            sour: 0.8,
            salty: 0,
            bitter: 0.9,
            umami: 0
        },
        astrology: {
            zodiac: {
                first: { element: 'Water', planet: 'Moon' },
                second: { element: 'Fire', planet: 'Mars' }
            },
            planets: ['Sun', 'Venus']
        },
        qualities: ['bitter-sweet', 'tart', 'refreshing'],
        category: 'fruit',
        subCategory: 'citrus',
        affinities: ['mint', 'honey', 'avocado', 'fennel', 'rosemary'],
        cookingMethods: ['raw', 'juiced', 'broiled', 'preserved'],
        nutritionalProfile: {
            fiber: 'moderate',
            vitamins: ['c', 'a', 'b6'],
            minerals: ['potassium', 'magnesium'],
            calories: 42,
            carbs_g: 11,
            fiber_g: 1.6,
            antioxidants: ['lycopene', 'beta-carotene', 'naringin']
        },
        preparation: {
            washing: true,
            peeling: 'remove pith if eating segments',
            sectioning: 'remove membranes for supreme',
            notes: 'Pink varieties are sweeter than white'
        },
        storage: {
            temperature: 'refrigerated',
            duration: '2-3 weeks',
            humidity: 'moderate',
            notes: 'Check for soft spots regularly'
        }
    },
    'mandarin': {
        name: 'Mandarin',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.3, Water: 0.4, Earth: 0.1, Air: 0.2
        }),
        qualities: ['sweet', 'delicate', 'aromatic'],
        season: ['winter'],
        category: 'fruit',
        subCategory: 'citrus',
        affinities: ['chocolate', 'vanilla', 'ginger', 'cinnamon', 'almond'],
        cookingMethods: ['raw', 'juiced', 'preserved', 'candied'],
        nutritionalProfile: {
            fiber: 'moderate',
            vitamins: ['c', 'a', 'b6'],
            minerals: ['potassium', 'calcium'],
            calories: 47,
            carbs_g: 12,
            fiber_g: 1.8,
            antioxidants: ['beta-cryptoxanthin', 'lutein']
        },
        preparation: {
            washing: true,
            peeling: 'easy to peel by hand',
            segmenting: 'naturally separates',
            notes: 'Remove any seeds before eating'
        },
        storage: {
            temperature: 'cool room temp or refrigerated',
            duration: '1-2 weeks',
            humidity: 'moderate',
            notes: 'Best eaten within a week'
        },
        astrology: {
            zodiac: {
                first: { element: 'Fire', planet: 'Sun' },
                second: { element: 'Air', planet: 'Mercury' }
            },
            planets: ['Sun', 'Mercury']
        }
    },
    'kumquat': {
        name: 'Kumquat',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.3, Water: 0.3, Earth: 0.2, Air: 0.2
        }),
        qualities: ['sweet-tart', 'intense', 'unique'],
        season: ['winter', 'early spring'],
        category: 'fruit',
        subCategory: 'citrus',
        affinities: ['honey', 'ginger', 'star anise', 'cinnamon', 'mint'],
        cookingMethods: ['raw', 'preserved', 'candied', 'marmalade'],
        nutritionalProfile: {
            fiber: 'high',
            vitamins: ['c', 'a', 'e'],
            minerals: ['calcium', 'copper'],
            calories: 71,
            carbs_g: 15.9,
            fiber_g: 6.5,
            antioxidants: ['flavonoids', 'pectin']
        },
        preparation: {
            washing: true,
            eating: 'whole with skin',
            notes: 'Skin is sweet, flesh is tart'
        },
        storage: {
            temperature: 'refrigerated',
            duration: '1-2 weeks',
            humidity: 'high',
            notes: 'Store in sealed container'
        },
        astrology: {
            zodiac: {
                first: { element: 'Fire', planet: 'Sun' },
                second: { element: 'Earth', planet: 'Saturn' }
            },
            planets: ['Sun', 'Saturn']
        }
    },
    'yuzu': {
        name: 'Yuzu',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.2, Water: 0.4, Earth: 0.1, Air: 0.3
        }),
        qualities: ['aromatic', 'complex', 'floral'],
        season: ['winter'],
        category: 'fruit',
        subCategory: 'citrus',
        affinities: ['soy', 'honey', 'chili', 'ginger', 'sesame'],
        cookingMethods: ['zested', 'juiced', 'preserved', 'seasoning'],
        nutritionalProfile: {
            fiber: 'moderate',
            vitamins: ['c', 'a'],
            minerals: ['calcium', 'potassium'],
            calories: 53,
            carbs_g: 13.3,
            fiber_g: 2,
            antioxidants: ['limonoids', 'hesperidin']
        },
        preparation: {
            washing: true,
            zesting: 'highly aromatic',
            juicing: 'use sparingly',
            notes: 'Primarily used for zest and juice'
        },
        storage: {
            temperature: 'refrigerated',
            duration: '1-2 weeks',
            humidity: 'moderate',
            notes: 'Freeze zest for longer storage'
        },
        astrology: {
            zodiac: {
                first: { element: 'Air', planet: 'Mercury' },
                second: { element: 'Water', planet: 'Venus' }
            },
            planets: ['Mercury', 'Venus']
        }
    },
    'bergamot': {
        name: 'Bergamot',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.2, Water: 0.4, Earth: 0.1, Air: 0.3
        }),
        qualities: ['fragrant', 'bitter', 'floral'],
        season: ['winter'],
        category: 'fruit',
        subCategory: 'citrus',
        affinities: ['tea', 'lavender', 'vanilla', 'honey', 'chocolate'],
        cookingMethods: ['zested', 'preserved', 'flavoring', 'marmalade'],
        nutritionalProfile: {
            fiber: 'moderate',
            vitamins: ['c', 'a'],
            minerals: ['potassium', 'calcium'],
            calories: 37,
            carbs_g: 9.3,
            fiber_g: 1.8,
            antioxidants: ['bergapten', 'bergamottin']
        },
        preparation: {
            washing: true,
            zesting: 'prized for aromatic oils',
            notes: 'Primarily used for oil and flavoring'
        },
        storage: {
            temperature: 'refrigerated',
            duration: '1-2 weeks',
            humidity: 'moderate',
            notes: 'Preserve zest in sugar or dry'
        },
        astrology: {
            zodiac: {
                first: { element: 'Air', planet: 'Mercury' },
                second: { element: 'Water', planet: 'Venus' }
            },
            planets: ['Mercury', 'Venus']
        }
    },
    'calamansi': {
        name: 'Calamansi',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.2, Water: 0.5, Earth: 0.1, Air: 0.2
        }),
        qualities: ['sour', 'bright', 'complex'],
        season: ['year-round'],
        category: 'fruit',
        subCategory: 'citrus',
        affinities: ['chili', 'garlic', 'ginger', 'soy sauce', 'coconut'],
        cookingMethods: ['juiced', 'seasoning', 'preserved', 'garnish'],
        nutritionalProfile: {
            fiber: 'low',
            vitamins: ['c', 'a'],
            minerals: ['calcium', 'iron'],
            calories: 21,
            carbs_g: 5.3,
            fiber_g: 0.9,
            antioxidants: ['limonoids', 'flavonoids']
        },
        preparation: {
            washing: true,
            juicing: 'use whole or halved',
            notes: 'Can be used whole in drinks'
        },
        storage: {
            temperature: 'refrigerated',
            duration: '1-2 weeks',
            humidity: 'moderate',
            notes: 'Juice can be frozen in ice cube trays'
        }
    },
    'buddha\'s hand': {
        name: 'S hand',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.1, Water: 0.2, Earth: 0.1, Air: 0.6
        }),
        qualities: ['fragrant', 'sweet', 'exotic'],
        season: ['winter', 'early spring'],
        category: 'fruit',
        subCategory: 'citrus',
        affinities: ['honey', 'vanilla', 'ginger', 'vodka', 'sugar'],
        cookingMethods: ['zested', 'candied', 'infused', 'preserved'],
        nutritionalProfile: {
            fiber: 'moderate',
            vitamins: ['c'],
            minerals: ['potassium'],
            calories: 24,
            carbs_g: 6.1,
            fiber_g: 1.5,
            antioxidants: ['limonene', 'flavonoids']
        },
        preparation: {
            washing: true,
            zesting: 'entire fruit is zestable',
            cutting: 'separate fingers as needed',
            notes: 'No juice or pulp, used for zest'
        },
        storage: {
            temperature: 'refrigerated',
            duration: '2-3 weeks',
            humidity: 'moderate',
            notes: 'Wrap loosely in plastic'
        },
        astrology: {
            zodiac: {
                first: { element: 'Air', planet: 'Mercury' },
                second: { element: 'Air', planet: 'Uranus' }
            },
            planets: ['Mercury', 'Uranus']
        }
    },
    'tangelo': {
        name: 'Tangelo',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
        }),
        qualities: ['sweet-tart', 'juicy', 'vibrant'],
        season: ['winter'],
        category: 'fruit',
        subCategory: 'citrus',
        affinities: ['honey', 'vanilla', 'cinnamon', 'mint', 'ginger'],
        cookingMethods: ['raw', 'juiced', 'segments', 'preserved'],
        nutritionalProfile: {
            fiber: 'moderate',
            vitamins: ['c', 'a', 'folate'],
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
    'key_lime': {
        name: 'Key Lime',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.2, Water: 0.5, Earth: 0.1, Air: 0.2
        }),
        qualities: ['tart', 'aromatic', 'intense'],
        season: ['summer', 'fall'],
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
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.3, Water: 0.4, Earth: 0.1, Air: 0.2
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
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.2, Water: 0.5, Earth: 0.2, Air: 0.1
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
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.1, Water: 0.4, Earth: 0.1, Air: 0.4
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
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.4, Water: 0.3, Earth: 0.1, Air: 0.2
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
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.3, Water: 0.4, Earth: 0.1, Air: 0.2
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
exports.citrus = (0, elementalUtils_1.fixIngredientMappings)(rawCitrus);
// Export the entire collection
exports.default = exports.citrus;
// Export individual citrus fruits for direct access
exports.lemon = exports.citrus.lemon;
exports.lime = exports.citrus.lime;
