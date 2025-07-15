"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blackberry = exports.raspberry = exports.strawberry = exports.blueberry = exports.berries = void 0;
const elementalUtils_1 = require("../../../utils/elementalUtils");
const elementalUtils_2 = require("../../../utils/elemental/elementalUtils");
const rawBerries = {
    'blueberry': {
        name: 'Blueberry',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.1, Water: 0.5, Earth: 0.2, Air: 0.2
        }),
        astrologicalProfile: {
            rulingPlanets: ['Moon', 'Venus'],
            favorableZodiac: ['cancer', 'taurus'],
            elementalAffinity: {
                base: 'Water',
                decanModifiers: {
                    first: { element: 'Water', planet: 'Moon' },
                    second: { element: 'Water', planet: 'Venus' },
                    third: { element: 'Air', planet: 'Mercury' }
                }
            },
            lunarPhaseModifiers: {
                firstQuarter: {
                    elementalBoost: (0, elementalUtils_2.createElementalProperties)({
                        Water: 0.2,
                        Air: 0.1
                    }),
                    preparationTips: ['Best for fresh eating']
                },
                fullmoon: {
                    elementalBoost: (0, elementalUtils_2.createElementalProperties)({
                        Water: 0.3,
                        Earth: 0.1
                    }),
                    preparationTips: ['Ideal for moonlit desserts']
                }
            }
        },
        qualities: ['cooling', 'sweet', 'astringent', 'balancing', 'restorative'],
        origin: ['North America', 'Europe', 'Asia'],
        season: ['summer', 'early fall'],
        category: 'fruit',
        subCategory: 'berry',
        affinities: ['lemon', 'vanilla', 'mint', 'peach', 'almond', 'cinnamon', 'maple', 'cream', 'ginger'],
        cookingMethods: ['raw', 'baked', 'cooked', 'frozen', 'dried', 'fermented', 'infused'],
        nutritionalProfile: {
            fiber: 'high',
            vitamins: ['k', 'c', 'b6', 'e'],
            minerals: ['manganese', 'potassium', 'copper', 'iron'],
            calories: 57,
            carbs_g: 14,
            fiber_g: 3.6,
            antioxidants: ['anthocyanins', 'quercetin', 'resveratrol', 'pterostilbene'],
            specific_values: {
                vitamin_c_mg: 14,
                manganese_mg: 0.5,
                vitamin_k_mcg: 28,
                anthocyanins_mg: 163,
                proanthocyanidins_mg: 88
            }
        },
        healthBenefits: [
            'Powerful antioxidant properties',
            'Supports brain health and cognitive function',
            'May improve memory in older adults',
            'Helps reduce inflammation',
            'Supports heart health',
            'May help regulate blood sugar',
            'Supports eye health (prevents macular degeneration)',
            'Promotes urinary tract health'
        ],
        varieties: {
            'Highbush': {
                name: 'Highbush Blueberry',
                scientific: 'Vaccinium corymbosum',
                appearance: 'medium to large berries',
                flavor: 'sweet with balanced acidity',
                common_cultivars: ['Bluecrop', 'Duke', 'Elliott', 'Liberty'],
                notes: 'Most commonly cultivated variety'
            },
            'Lowbush': {
                name: 'Lowbush Blueberry',
                scientific: 'Vaccinium angustifolium',
                appearance: 'small, intensely colored berries',
                flavor: 'intense, complex, wilder taste',
                common_cultivars: ['Wild Maine Blueberries'],
                notes: 'Often sold frozen, higher antioxidant content'
            },
            'Rabbiteye': {
                name: 'Rabbiteye Blueberry',
                scientific: 'Vaccinium virgatum',
                appearance: 'medium berries with noticeable "eye"',
                flavor: 'sweet when fully ripe, tougher skin',
                common_cultivars: ['Brightwell', 'Tifblue', 'Climax'],
                notes: 'Heat tolerant, grown in southern regions'
            },
            'Pink': {
                name: 'Pink Blueberry',
                scientific: 'Vaccinium ashei hybrid',
                appearance: 'pink to light purple berries',
                flavor: 'mild, less acidic than blue varieties',
                common_cultivars: ['Pink Lemonade', 'Pink Champagne'],
                notes: 'Novelty variety, ornamental value'
            }
        },
        preparation: {
            washing: 'just before use',
            sorting: 'remove stems and damaged berries',
            notes: 'Don\'t wash until ready to eat',
            enhancing: 'add a tiny pinch of salt to enhance sweetness'
        },
        culinaryApplications: {
            'preserves': {
                name: 'Preserves',
                method: 'cooked with sugar',
                applications: ['jam', 'compote', 'syrup', 'sauce'],
                techniques: 'mash some berries but leave others whole',
                notes: 'High pectin content helps with setting'
            },
            'frozen_desserts': {
                name: 'Frozen Desserts',
                method: 'blended or mixed',
                applications: ['ice cream', 'sorbet', 'smoothies', 'popsicles'],
                techniques: 'combine with creamier fruits for texture',
                notes: 'Freeze individually first for best results'
            },
            'beverage': {
                name: 'Beverages',
                method: 'juiced, infused, or muddled',
                applications: ['smoothies', 'cocktails', 'infused water', 'kombucha'],
                techniques: 'muddle gently to release juice without bitterness',
                notes: 'Beautiful natural colorant'
            }
        },
        storage: {
            refrigerated: {
                temperature: {},
                duration: '1-2 weeks',
                humidity: 'moderate',
                method: 'store unwashed in breathable container',
                notes: 'Remove moldy berries immediately as they spread'
            },
            frozen: {
                method: 'freeze individually on sheet pan, then transfer to container',
                duration: 'up to 1 year',
                uses: 'baking, smoothies, sauces',
                notes: 'No need to thaw for many applications'
            },
            dried: {
                method: 'dehydrate at 125-135°F until leathery',
                duration: 'up to 1 year in Airtight container',
                uses: 'trail mix, granola, tea infusions',
                notes: 'Retains much of antioxidant content'
            },
            preserved: {
                method: 'jam, jelly, or syrup',
                duration: 'up to 1 year sealed, 3 weeks opened',
                notes: 'Process in water bath for long-term storage'
            }
        },
        seasonality: {
            peak_months: [6, 7, 8],
            early_varieties: 'available late May in southern regions',
            late_varieties: 'available through September in northern regions',
            harvesting: 'fully ripe berries easily detach from stems',
            wild_season: 'shorter and more climate dependent'
        },
        cuisineAffinity: {
            'american': 'classic in pies, muffins, and pancakes',
            'scandinavian': 'pAired with cardamom and other warm spices',
            'british': 'featured in summer puddings and fools',
            'native_american': 'traditional food and medicine',
            'asian_fusion': 'incorporated into modern desserts'
        }
    },
    'strawberry': {
        name: 'Strawberry',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.3, Water: 0.4, Earth: 0.2, Air: 0.1
        }),
        astrologicalProfile: {
            rulingPlanets: ['Venus', 'Mars'],
            favorableZodiac: ['taurus', 'aries'],
            elementalAffinity: {
                base: 'Water',
                decanModifiers: {
                    first: { element: 'Water', planet: 'Venus' },
                    second: { element: 'Fire', planet: 'Mars' },
                    third: { element: 'Earth', planet: 'Saturn' }
                }
            },
            lunarPhaseModifiers: {
                newmoon: {
                    elementalBoost: (0, elementalUtils_2.createElementalProperties)({
                        Earth: 0.2,
                        Water: 0.1
                    }),
                    preparationTips: ['Good for preserving', 'Make jams and jellies']
                },
                fullmoon: {
                    elementalBoost: (0, elementalUtils_2.createElementalProperties)({
                        Water: 0.2,
                        Fire: 0.1
                    }),
                    preparationTips: ['Sweetness enhanced', 'Best eaten fresh']
                },
                firstQuarter: {
                    elementalBoost: (0, elementalUtils_2.createElementalProperties)({
                        Water: 0.1,
                        Air: 0.1
                    }),
                    preparationTips: ['Good for infusions and light desserts']
                },
                waningGibbous: {
                    elementalBoost: (0, elementalUtils_2.createElementalProperties)({
                        Earth: 0.2,
                        Fire: 0.1
                    }),
                    preparationTips: ['Ideal for drying or dehydrating']
                }
            }
        },
        qualities: ['cooling', 'sweet', 'refreshing'],
        season: ['late spring', 'summer'],
        category: 'fruit',
        subCategory: 'berry',
        affinities: ['chocolate', 'cream', 'basil', 'balsamic', 'mint'],
        cookingMethods: ['raw', 'macerated', 'roasted', 'preserved'],
        nutritionalProfile: {
            fiber: 'moderate',
            vitamins: ['c', 'b9', 'k'],
            minerals: ['manganese', 'potassium'],
            calories: 32,
            carbs_g: 7.7,
            fiber_g: 2,
            antioxidants: ['anthocyanins', 'ellagic acid']
        },
        preparation: {
            washing: 'gentle rinse',
            hulling: 'remove green tops',
            cutting: 'optional',
            notes: 'Don\'t soak in water'
        },
        storage: {
            temperature: 'refrigerated',
            duration: '3-5 days',
            humidity: 'moderate',
            notes: 'Don\'t wash until ready to use'
        }
    },
    'raspberry': {
        name: 'Raspberry',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.3, Water: 0.4, Earth: 0.2, Air: 0.1
        }),
        astrologicalProfile: {
            rulingPlanets: ['Venus', 'Mars'],
            favorableZodiac: ['taurus', 'aries'],
            elementalAffinity: {
                base: 'Water',
                decanModifiers: {
                    first: { element: 'Water', planet: 'Venus' },
                    second: { element: 'Fire', planet: 'Mars' },
                    third: { element: 'Earth', planet: 'Venus' }
                }
            },
            lunarPhaseModifiers: {
                waxingCrescent: {
                    elementalBoost: (0, elementalUtils_2.createElementalProperties)({
                        Water: 0.2,
                        Fire: 0.1
                    }),
                    preparationTips: ['Great for light preparations']
                },
                fullmoon: {
                    elementalBoost: (0, elementalUtils_2.createElementalProperties)({
                        Water: 0.3,
                        Fire: 0.2
                    }),
                    preparationTips: ['Maximum flavor intensity']
                }
            }
        },
        qualities: ['sweet-tart', 'aromatic', 'delicate', 'bright', 'complex'],
        origin: ['Europe', 'Northern Asia', 'North America'],
        season: ['summer'],
        category: 'fruit',
        subCategory: 'berry',
        affinities: ['chocolate', 'vanilla', 'lemon', 'almond', 'peach'],
        cookingMethods: ['raw', 'cooked', 'preserved', 'frozen'],
        nutritionalProfile: {
            fiber: 'very high',
            vitamins: ['c', 'k', 'e'],
            minerals: ['manganese', 'magnesium'],
            calories: 52,
            carbs_g: 11.9,
            fiber_g: 6.5,
            antioxidants: ['anthocyanins', 'ellagic acid']
        },
        lunarPhaseModifiers: {
            newmoon: {
                elementalBoost: (0, elementalUtils_2.createElementalProperties)({
                    Earth: 0.1,
                    Water: 0.1
                }),
                preparationTips: ['Good for preserving', 'Start jams and jellies']
            },
            waxingCrescent: {
                elementalBoost: (0, elementalUtils_2.createElementalProperties)({
                    Water: 0.1,
                    Air: 0.1
                }),
                preparationTips: ['Good for light syrups and cordials']
            },
            firstQuarter: {
                elementalBoost: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.1, Water: 0.2
                }),
                preparationTips: ['Perfect for fresh eating and light desserts']
            },
            waxingGibbous: {
                elementalBoost: (0, elementalUtils_2.createElementalProperties)({
                    Water: 0.2,
                    Air: 0.1
                }),
                preparationTips: ['Excellent for sorbets and mousses']
            },
            fullmoon: {
                elementalBoost: (0, elementalUtils_2.createElementalProperties)({
                    Water: 0.3,
                    Fire: 0.1
                }),
                preparationTips: ['Flavor peaks', 'Ideal for special desserts']
            },
            waningGibbous: {
                elementalBoost: (0, elementalUtils_2.createElementalProperties)({
                    Earth: 0.1,
                    Fire: 0.2
                }),
                preparationTips: ['Good for baking and pies']
            },
            lastQuarter: {
                elementalBoost: (0, elementalUtils_2.createElementalProperties)({
                    Earth: 0.2,
                    Water: 0.1
                }),
                preparationTips: ['Ideal for preserving and jamming']
            },
            waningCrescent: {
                elementalBoost: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.1, Earth: 0.1
                }),
                preparationTips: ['Best for compotes and reductions']
            }
        },
        preparation: {
            washing: 'gentle rinse',
            inspection: 'remove any moldy berries',
            notes: 'Extremely delicate - handle minimally'
        },
        storage: {
            temperature: 'refrigerated',
            duration: '2-3 days',
            humidity: 'moderate',
            notes: 'Best used quickly'
        }
    },
    'blackberry': {
        name: 'Blackberry',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.2, Water: 0.5, Earth: 0.2, Air: 0.1
        }),
        astrologicalProfile: {
            rulingPlanets: ['Saturn', 'Pluto'],
            favorableZodiac: ['capricorn', 'scorpio'],
            elementalAffinity: {
                base: 'Water',
                decanModifiers: {
                    first: { element: 'Water', planet: 'Pluto' },
                    second: { element: 'Earth', planet: 'Saturn' },
                    third: { element: 'Water', planet: 'Moon' }
                }
            },
            lunarPhaseModifiers: {
                newmoon: {
                    elementalBoost: (0, elementalUtils_2.createElementalProperties)({
                        Water: 0.2,
                        Earth: 0.1
                    }),
                    preparationTips: ['Good for preserving']
                },
                fullmoon: {
                    elementalBoost: (0, elementalUtils_2.createElementalProperties)({
                        Water: 0.3,
                        Earth: 0.2
                    }),
                    preparationTips: ['Peak ripeness and flavor']
                }
            }
        },
        qualities: ['sweet-tart', 'earthy', 'complex', 'juicy', 'rich'],
        origin: ['Northern Hemisphere', 'Europe', 'North America'],
        season: ['summer', 'early fall'],
        category: 'fruit',
        subCategory: 'berry',
        affinities: ['apple', 'lemon', 'cinnamon', 'thyme', 'cream'],
        cookingMethods: ['raw', 'baked', 'preserved', 'cooked'],
        lunarPhaseModifiers: {
            newmoon: {
                elementalBoost: (0, elementalUtils_2.createElementalProperties)({
                    Earth: 0.2,
                    Water: 0.1
                }),
                preparationTips: ['Good for starting preserves', 'Subtle flavors']
            },
            waxingCrescent: {
                elementalBoost: (0, elementalUtils_2.createElementalProperties)({
                    Water: 0.1,
                    Fire: 0.1
                }),
                preparationTips: ['Building flavor for syrups and cordials']
            },
            firstQuarter: {
                elementalBoost: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.1, Water: 0.2
                }),
                preparationTips: ['Good for pies and cobblers']
            },
            waxingGibbous: {
                elementalBoost: (0, elementalUtils_2.createElementalProperties)({
                    Water: 0.2,
                    Fire: 0.1
                }),
                preparationTips: ['Excellent for jams and jellies']
            },
            fullmoon: {
                elementalBoost: (0, elementalUtils_2.createElementalProperties)({
                    Water: 0.3,
                    Fire: 0.1
                }),
                preparationTips: ['Flavor at peak wildness', 'Best for fresh eating']
            },
            waningGibbous: {
                elementalBoost: (0, elementalUtils_2.createElementalProperties)({
                    Earth: 0.1,
                    Fire: 0.2
                }),
                preparationTips: ['Ideal for rich sauces and reductions']
            },
            lastQuarter: {
                elementalBoost: (0, elementalUtils_2.createElementalProperties)({
                    Earth: 0.2,
                    Water: 0.1
                }),
                preparationTips: ['Good for wines and liqueurs']
            },
            waningCrescent: {
                elementalBoost: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.1, Earth: 0.1
                }),
                preparationTips: ['Best for dried preparations']
            }
        },
        nutritionalProfile: {
            fiber: 'high',
            vitamins: ['c', 'k', 'e'],
            minerals: ['manganese', 'copper'],
            calories: 43,
            carbs_g: 9.6,
            fiber_g: 5.3,
            antioxidants: ['anthocyanins', 'ellagic acid']
        },
        preparation: {
            washing: 'gentle rinse',
            inspection: 'remove any moldy berries',
            notes: 'Handle gently to prevent crushing'
        },
        storage: {
            temperature: 'refrigerated',
            duration: '2-3 days',
            humidity: 'moderate',
            notes: 'Use quickly for best flavor'
        }
    },
    'gooseberry': {
        name: 'Gooseberry',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.1, Water: 0.3, Earth: 0.4, Air: 0.2
        }),
        qualities: ['tart', 'bright', 'complex'],
        season: ['early summer'],
        category: 'fruit',
        subCategory: 'berry',
        affinities: ['elderflower', 'ginger', 'honey', 'mint', 'cream'],
        cookingMethods: ['cooked', 'preserved', 'baked', 'raw'],
        nutritionalProfile: {
            fiber: 'high',
            vitamins: ['c', 'a', 'b5'],
            minerals: ['copper', 'manganese'],
            calories: 44,
            carbs_g: 10,
            fiber_g: 4.3,
            antioxidants: ['flavonoids', 'polyphenols']
        },
        preparation: {
            washing: true,
            trimming: 'remove tops and tails',
            notes: 'Often cooked with sugar to balance tartness'
        },
        storage: {
            temperature: 'refrigerated',
            duration: '1-2 weeks',
            humidity: 'moderate',
            notes: 'Stores well due to firm skin'
        },
        lunarPhaseModifiers: {
            newmoon: {
                elementalBoost: (0, elementalUtils_2.createElementalProperties)({
                    Earth: 0.2,
                    Water: 0.1
                }),
                preparationTips: ['Good for starting preserves']
            },
            fullmoon: {
                elementalBoost: (0, elementalUtils_2.createElementalProperties)({
                    Water: 0.2,
                    Air: 0.1
                }),
                preparationTips: ['Tartness balanced with sweetness', 'Ideal for special desserts']
            },
            waxingCrescent: {
                elementalBoost: (0, elementalUtils_2.createElementalProperties)({
                    Water: 0.1,
                    Fire: 0.1
                }),
                preparationTips: ['Good for compotes and sauces']
            },
            lastQuarter: {
                elementalBoost: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.1, Earth: 0.1
                }),
                preparationTips: ['Best for jams and preserves']
            }
        }
    },
    'currant': {
        name: 'Currant',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.2, Water: 0.3, Earth: 0.3, Air: 0.2
        }),
        qualities: ['tart', 'bright', 'jewel-like'],
        season: ['mid summer'],
        category: 'fruit',
        subCategory: 'berry',
        affinities: ['vanilla', 'almond', 'apple', 'mint', 'cream'],
        cookingMethods: ['preserved', 'cooked', 'raw', 'dried'],
        nutritionalProfile: {
            fiber: 'high',
            vitamins: ['c', 'k', 'b5'],
            minerals: ['manganese', 'potassium'],
            calories: 56,
            carbs_g: 13.8,
            fiber_g: 4.3,
            antioxidants: ['anthocyanins', 'polyphenols']
        },
        preparation: {
            washing: true,
            stripping: 'remove from stems',
            notes: 'Available in red, black, and white varieties'
        },
        storage: {
            temperature: 'refrigerated',
            duration: '3-4 days',
            humidity: 'moderate',
            notes: 'Freeze for longer storage'
        },
        lunarPhaseModifiers: {
            newmoon: {
                elementalBoost: (0, elementalUtils_2.createElementalProperties)({
                    Earth: 0.1,
                    Water: 0.1
                }),
                preparationTips: ['Good for starting jams and jellies']
            },
            fullmoon: {
                elementalBoost: (0, elementalUtils_2.createElementalProperties)({
                    Water: 0.1,
                    Fire: 0.1
                }),
                preparationTips: ['Maximum flavor extraction', 'Best for syrups and cordials']
            },
            waxingGibbous: {
                elementalBoost: (0, elementalUtils_2.createElementalProperties)({
                    Water: 0.2,
                    Fire: 0.1
                }),
                preparationTips: ['Perfect for sauces and glazes']
            },
            waningCrescent: {
                elementalBoost: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.1, Earth: 0.1
                }),
                preparationTips: ['Good for drying or dehydrating']
            }
        }
    },
    'elderberry': {
        name: 'Elderberry',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.2, Water: 0.3, Earth: 0.4, Air: 0.1
        }),
        qualities: ['tart', 'medicinal', 'complex'],
        season: ['late summer', 'early autumn'],
        category: 'fruit',
        subCategory: 'berry',
        affinities: ['apple', 'lemon', 'honey', 'cinnamon', 'ginger'],
        cookingMethods: ['cooked', 'preserved', 'syrup', 'wine'],
        nutritionalProfile: {
            fiber: 'high',
            vitamins: ['c', 'a', 'b6'],
            minerals: ['potassium', 'iron'],
            calories: 73,
            carbs_g: 18.4,
            fiber_g: 7,
            antioxidants: ['anthocyanins', 'quercetin']
        },
        preparation: {
            washing: true,
            stripping: 'remove from stems',
            cooking: 'must be cooked before eating',
            notes: 'Never eat raw - must be properly prepared'
        },
        storage: {
            temperature: 'refrigerated',
            duration: '1-2 days',
            humidity: 'moderate',
            notes: 'Best processed immediately'
        },
        lunarPhaseModifiers: {
            newmoon: {
                elementalBoost: (0, elementalUtils_2.createElementalProperties)({
                    Earth: 0.2,
                    Water: 0.1
                }),
                preparationTips: ['Good for starting medicinal preparations']
            },
            waxingCrescent: {
                elementalBoost: (0, elementalUtils_2.createElementalProperties)({
                    Water: 0.1,
                    Earth: 0.2
                }),
                preparationTips: ['Building medicinal potency']
            },
            firstQuarter: {
                elementalBoost: (0, elementalUtils_2.createElementalProperties)({
                    Water: 0.2,
                    Fire: 0.1
                }),
                preparationTips: ['Good for syrups and cordials']
            },
            fullmoon: {
                elementalBoost: (0, elementalUtils_2.createElementalProperties)({
                    Water: 0.2,
                    Air: 0.2
                }),
                preparationTips: ['Maximum medicinal potency', 'Best for wellness tonics']
            },
            waningGibbous: {
                elementalBoost: (0, elementalUtils_2.createElementalProperties)({
                    Earth: 0.2,
                    Water: 0.1
                }),
                preparationTips: ['Good for jams and preserves']
            },
            lastQuarter: {
                elementalBoost: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.1, Earth: 0.2
                }),
                preparationTips: ['Best for elderberry wine']
            }
        }
    },
    'mulberry': {
        name: 'Mulberry',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.2, Water: 0.3, Earth: 0.3, Air: 0.2
        }),
        qualities: ['sweet-tart', 'earthy', 'delicate'],
        season: ['late spring', 'early summer'],
        category: 'fruit',
        subCategory: 'berry',
        affinities: ['lemon', 'apple', 'vanilla', 'cream', 'mint'],
        cookingMethods: ['raw', 'preserved', 'baked', 'dried'],
        nutritionalProfile: {
            fiber: 'high',
            vitamins: ['c', 'k', 'iron'],
            minerals: ['potassium', 'magnesium'],
            calories: 43,
            carbs_g: 10.9,
            fiber_g: 1.7,
            antioxidants: ['anthocyanins', 'resveratrol']
        },
        preparation: {
            washing: 'gentle rinse',
            sorting: 'remove stems',
            notes: 'Stains easily - handle with care'
        },
        storage: {
            temperature: 'refrigerated',
            duration: '2-3 days',
            humidity: 'moderate',
            notes: 'Very perishable when ripe'
        },
        lunarPhaseModifiers: {
            newmoon: {
                elementalBoost: (0, elementalUtils_2.createElementalProperties)({
                    Earth: 0.2,
                    Water: 0.1
                }),
                preparationTips: ['Good for starting preserves']
            },
            waxingCrescent: {
                elementalBoost: (0, elementalUtils_2.createElementalProperties)({
                    Water: 0.2,
                    Fire: 0.1
                }),
                preparationTips: ['Building flavor for syrups']
            },
            fullmoon: {
                elementalBoost: (0, elementalUtils_2.createElementalProperties)({
                    Water: 0.2,
                    Air: 0.2
                }),
                preparationTips: ['Best for fresh eating', 'Flavor peaks']
            },
            waningGibbous: {
                elementalBoost: (0, elementalUtils_2.createElementalProperties)({
                    Earth: 0.2,
                    Fire: 0.1
                }),
                preparationTips: ['Good for jams and preserves']
            }
        }
    },
    'boysenberry': {
        name: 'Boysenberry',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.3, Water: 0.3, Earth: 0.2, Air: 0.2
        }),
        qualities: ['complex', 'wine-like', 'aromatic'],
        season: ['summer'],
        category: 'fruit',
        subCategory: 'berry',
        affinities: ['lemon', 'vanilla', 'cream', 'cinnamon', 'honey'],
        cookingMethods: ['raw', 'preserved', 'baked', 'frozen'],
        nutritionalProfile: {
            fiber: 'high',
            vitamins: ['c', 'k', 'folate'],
            minerals: ['manganese', 'potassium'],
            calories: 43,
            carbs_g: 9.6,
            fiber_g: 5.3,
            antioxidants: ['anthocyanins', 'ellagic acid']
        },
        preparation: {
            washing: 'gentle rinse',
            inspection: 'remove any moldy berries',
            notes: 'Handle very gently when ripe'
        },
        storage: {
            temperature: 'refrigerated',
            duration: '2-3 days',
            humidity: 'moderate',
            notes: 'Best used immediately when ripe'
        },
        lunarPhaseModifiers: {
            newmoon: {
                elementalBoost: (0, elementalUtils_2.createElementalProperties)({
                    Earth: 0.2,
                    Water: 0.1
                }),
                preparationTips: ['Good for starting preserves']
            },
            firstQuarter: {
                elementalBoost: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.1, Water: 0.2
                }),
                preparationTips: ['Perfect for pies and cobblers']
            },
            fullmoon: {
                elementalBoost: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.2, Water: 0.2
                }),
                preparationTips: ['Wine-like qualities enhanced', 'Best for special desserts']
            },
            waningGibbous: {
                elementalBoost: (0, elementalUtils_2.createElementalProperties)({
                    Earth: 0.2,
                    Water: 0.1
                }),
                preparationTips: ['Ideal for jams and preserves']
            }
        }
    },
    'cloudberry': {
        name: 'Cloudberry',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2
        }),
        qualities: ['tart', 'honey-like', 'exotic'],
        season: ['late summer'],
        category: 'fruit',
        subCategory: 'berry',
        affinities: ['cream', 'honey', 'vanilla', 'apple', 'cardamom'],
        cookingMethods: ['raw', 'preserved', 'jam', 'liqueur'],
        nutritionalProfile: {
            fiber: 'moderate',
            vitamins: ['c', 'e', 'a'],
            minerals: ['potassium', 'magnesium'],
            calories: 51,
            carbs_g: 12.2,
            fiber_g: 3.8,
            antioxidants: ['ellagic acid', 'quercetin']
        },
        preparation: {
            washing: 'gentle rinse',
            handling: 'extremely delicate',
            notes: 'Rare and precious - handle with extra care'
        },
        storage: {
            temperature: 'refrigerated',
            duration: '1-2 days',
            humidity: 'moderate',
            notes: 'Best preserved or used immediately'
        },
        lunarPhaseModifiers: {
            newmoon: {
                elementalBoost: (0, elementalUtils_2.createElementalProperties)({
                    Earth: 0.2,
                    Water: 0.1
                }),
                preparationTips: ['Good for starting preserves']
            },
            firstQuarter: {
                elementalBoost: (0, elementalUtils_2.createElementalProperties)({
                    Water: 0.2,
                    Air: 0.1
                }),
                preparationTips: ['Building flavor for jams']
            },
            fullmoon: {
                elementalBoost: (0, elementalUtils_2.createElementalProperties)({
                    Water: 0.3,
                    Air: 0.2
                }),
                preparationTips: ['Honey-like qualities enhanced', 'Best for rare desserts']
            },
            lastQuarter: {
                elementalBoost: (0, elementalUtils_2.createElementalProperties)({
                    Earth: 0.2,
                    Water: 0.1
                }),
                preparationTips: ['Good for preserves and liqueurs']
            }
        }
    }
};
// Fix the ingredient mappings to ensure they have all required properties
exports.berries = (0, elementalUtils_1.fixIngredientMappings)(rawBerries);
// Export the entire collection
exports.default = exports.berries;
// Export individual berries for direct access
exports.blueberry = exports.berries.blueberry;
exports.strawberry = exports.berries.strawberry;
exports.raspberry = exports.berries.raspberry;
exports.blackberry = exports.berries.blackberry;
// Add other individual exports as needed
