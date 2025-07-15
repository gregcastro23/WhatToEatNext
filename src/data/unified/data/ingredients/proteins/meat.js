import { fixIngredientMappings } from "../../../utils/elementalUtils";
import { createElementalProperties } from "../../../utils/elemental/elementalUtils";
const rawMeats = {
    'beef': {
        name: 'Beef',
        description: 'Red meat from cattle, available in various cuts with different properties.',
        category: 'protein',
        qualities: ['robust', 'rich', 'substantial'],
        sustainabilityScore: 2,
        season: ['all'],
        elementalProperties: { Fire: 0.7, Water: 0.1, Earth: 0.2, Air: 0.0
        },
        astrologicalProfile: {
            rulingPlanets: ['Mars'],
            favorableZodiac: ['taurus'],
            elementalAffinity: {
                base: 'Earth',
                secondary: 'Fire'
            },
            lunarPhaseModifiers: {
                'waning': {
                    elementalBoost: {},
                    preparationTip: 'Braise with bone broth for restoration'
                }
            }
        },
        nutritionalProfile: {
            serving_size: "3 oz",
            calories: 250,
            macros: {
                protein: 26,
                carbs: 0,
                fat: 15,
                fiber: 0
            },
            vitamins: {
                B12: 0.9,
                B6: 0.3,
                niacin: 0.25,
                riboflavin: 0.15
            },
            minerals: {
                iron: 0.15,
                zinc: 0.40,
                phosphorus: 0.20,
                selenium: 0.30
            },
            source: "USDA"
        },
        culinaryApplications: {
            grill: {},
            roast: {},
            braise: {},
            sear: { notes: ['Quick searing seals in juices for medium-rare preparation'] }
        },
        pAirings: ['red_wine', 'mushrooms', 'blue_cheese', 'rosemary', 'horseradish'],
        substitutions: ['bison', 'game_meat', 'plant_based_beef'],
        affinities: ['robust_herbs', 'umami_flavors', 'root_vegetables']
    },
    'beef_ribeye': {
        name: 'Beef Ribeye',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
        }),
        qualities: ['marbled', 'rich', 'tender', 'flavorful', 'juicy'],
        season: ['all'],
        category: 'protein',
        subCategory: 'beef',
        affinities: ['garlic', 'rosemary', 'thyme', 'black pepper', 'sea salt', 'butter', 'shallots'],
        cookingMethods: ['grill', 'pan_sear', 'sous_vide', 'reverse_sear', 'broil'],
        origin: ['Global', 'United States', 'Australia', 'Japan', 'Argentina'],
        astrologicalProfile: {
            rulingPlanets: ['Mars', 'Sun'],
            favorableZodiac: ['aries', 'leo', 'taurus'],
            elementalAffinity: {
                base: 'Fire',
                secondary: 'Earth',
                decanModifiers: {
                    first: {},
                    second: {},
                    third: { element: 'Air', planet: 'Mercury' }
                }
            },
            lunarPhaseModifiers: {
                newmoon: {
                    elementalBoost: {},
                    preparationTips: ['Good for lighter preparations', 'Subtle seasonings']
                },
                fullmoon: {
                    elementalBoost: {},
                    preparationTips: ['Ideal for grilling', 'Bold seasonings enhance flavor']
                }
            },
            aspectEnhancers: ['Mars trine jupiter', 'Sun in leoLeo']
        },
        nutritionalProfile: {
            serving_size: "3 oz",
            calories: 291,
            macros: {
                protein: 24,
                carbs: 0,
                fat: 22,
                fiber: 0
            },
            vitamins: {
                B12: 0.82,
                B6: 0.36,
                niacin: 0.33,
                riboflavin: 0.22
            },
            minerals: {
                zinc: 0.48,
                selenium: 0.43,
                iron: 0.14,
                phosphorus: 0.22,
                potassium: 0.08
            },
            cholesterol: 70,
            saturated_fat: 9,
            source: "USDA"
        },
        healthBenefits: [
            'Muscle growth and repAir (complete protein source)',
            'Energy production (B vitamins and iron)',
            'Immune function (zinc and selenium)',
            'Blood cell formation (vitamin B12 and iron)',
            'Collagen production (promotes connective tissue health)',
            'Hormone production (contains precursors for testosterone)',
            'Brain health (contains creatine and omega fatty acids)'
        ],
        sustainability: {
            rating: 'Variable',
            source: 'Depends on farming practices and sourcing'
        },
        grades: {
            'Prime': {
                name: 'Prime',
                marbling: 'abundant',
                color: 'bright red',
                texture: 'firm, fine-grained',
                uses: 'high-end steakhouse, special occasions'
            },
            'Choice': {
                name: 'Choice',
                marbling: 'moderate to modest',
                color: 'red',
                texture: 'firm',
                uses: 'home cooking, restaurants'
            },
            'Select': {
                name: 'Select',
                marbling: 'slight',
                color: 'red',
                texture: 'lean',
                uses: 'general purpose'
            },
            'Wagyu': {
                name: 'Wagyu',
                marbling: 'exceptional',
                color: 'pink to red',
                texture: 'buttery',
                uses: 'luxury dining, special celebrations'
            }
        },
        aging: {
            'wet': {
                name: 'Wet',
                duration: '14-28 days',
                process: 'vacuum-sealed',
                results: 'tender, mild flavor'
            },
            'dry': {
                name: 'Dry',
                duration: '28-45 days',
                process: 'controlled environment',
                results: 'concentrated flavor, tender',
                notes: 'Develops nutty, umami-rich flavor profile'
            }
        },
        cuts: {
            'bone_in': {
                name: 'Bone In',
                weight: '16-24 oz',
                thickness: '1.5-2 inches',
                cooking: 'slower, more flavor',
                appearance: 'distinctive "eye" with fat cap',
                texture: 'juicy, rich mouthfeel'
            },
            'boneless': {
                name: 'Boneless',
                weight: '12-16 oz',
                thickness: '1.25-1.5 inches',
                cooking: 'faster, even heat',
                appearance: 'compact, uniform shape',
                texture: 'tender, consistent bite'
            },
            'tomahawk': {
                name: 'Tomahawk',
                weight: '32-40 oz',
                thickness: '2-2.5 inches',
                cooking: 'slow, dramatic presentation',
                appearance: 'extended bone resembling handle',
                texture: 'exceptional marbling, robust flavor'
            }
        },
        culinaryApplications: {
            'grill': {
                name: 'Grill',
                method: 'direct high heat',
                temperature: {
                    fahrenheit: 450,
                    celsius: 232
                },
                timing: {
                    'rare': '4-5 minutes per side',
                    'medium_rare': '5-6 minutes per side',
                    'medium': '6-7 minutes per side',
                    'medium_well': '7-8 minutes per side',
                    'well_done': '8-9 minutes per side'
                },
                internalTemp: {
                    'rare': Record<string, unknown>,
                    'medium_rare': Record<string, unknown>,
                    'medium_well': Record<string, unknown>,
                    'well_done': { name: 'Well Done', fahrenheit: 160, celsius: 71 }
                },
                techniques: {
                    'reverse_sear': {
                        name: 'Reverse Sear',
                        method: 'low heat then high heat sear',
                        notes: 'More even cooking'
                    },
                    'direct_sear': {
                        name: 'Direct Sear',
                        method: 'high heat then rest',
                        notes: 'Traditional method'
                    },
                    'two_zone': {
                        name: 'Two Zone',
                        method: 'sear over direct heat, finish over indirect',
                        notes: 'Better control, especially for thicker cuts'
                    }
                },
                resting: {
                    time: '8-10 minutes',
                    method: 'loose foil tent',
                    carryover: '5-10°F rise'
                },
                preparations: {
                    'herb_butter': {
                        name: 'Herb Butter',
                        ingredients: ['butter', 'garlic', 'rosemary', 'thyme'],
                        method: 'melt over finished steak',
                        notes: 'enhances richness'
                    },
                    'salt_crust': {
                        name: 'Salt Crust',
                        method: 'coarse salt applied before cooking',
                        notes: 'creates excellent crust'
                    }
                }
            },
            'pan_sear': {
                name: 'Pan Sear',
                method: 'cast iron or heavy skillet',
                temperature: 'very high heat',
                timing: {
                    'pre_heat': '5-7 minutes',
                    'sear': '4-5 minutes per side',
                    'butter_baste': '2-3 minutes'
                },
                techniques: {
                    'butter_basting': {
                        name: 'Butter Basting',
                        ingredients: ['butter', 'garlic', 'thyme'],
                        method: 'spoon butter over continuously'
                    }
                },
                pans: {
                    'cast_iron': {
                        name: 'Cast Iron',
                        benefits: 'excellent heat retention, superior crust',
                        drawbacks: 'heavy, requires maintenance'
                    },
                    'carbon_steel': {
                        name: 'Carbon Steel',
                        benefits: 'lighter than cast iron, quick heating',
                        drawbacks: 'requires seasoning'
                    },
                    'stainless_steel': {
                        name: 'Stainless Steel',
                        benefits: 'durable, dishwasher safe',
                        drawbacks: 'less effective for crust formation'
                    }
                }
            },
            'sous_vide': {
                name: 'Sous Vide',
                method: 'vacuum sealed, water bath',
                temperature: {
                    'rare': Record<string, unknown>,
                    'medium_rare': { name: 'Medium Rare', fahrenheit: 131, celsius: 55 }
                },
                timing: {
                    'minimum': '1 hour',
                    'maximum': '4 hours',
                    'optimal': '2 hours'
                },
                finishing: {
                    method: 'high heat sear',
                    duration: '45-60 seconds per side',
                    rest: '5 minutes',
                    options: {
                        'cast_iron': 'traditional, reliable',
                        'torch': 'precise, no additional cooking',
                        'broiler': 'even top crust'
                    }
                },
                advantages: [
                    'Perfect edge-to-edge doneness',
                    'Impossible to overcook',
                    'Can be prepared ahead of time',
                    'Consistency across multiple steaks'
                ],
                aromatics: {
                    'fresh': ['rosemary', 'thyme', 'garlic'],
                    'compound_butter': 'add small pat in bag',
                    'avoid': ['powdered spices', 'acidic ingredients']
                }
            },
            'broil': {
                name: 'Broil',
                method: 'overhead direct heat',
                rack_position: 'top rack, 4-6 inches from element',
                temperature: 'high (500-550°F)',
                timing: {
                    'first_side': '4-5 minutes',
                    'second_side': '3-4 minutes',
                    'rest': '5-7 minutes'
                },
                notes: 'Good alternative when grilling isn\'t available'
            }
        },
        seasonalAdjustments: {
            'summer': {
                name: 'Summer',
                methods: ['grill', 'sous_vide'],
                marinadeTime: 'shorter',
                notes: 'Lighter seasonings, fresh herbs',
                pAirings: ['grilled vegetables', 'bright chimichurri', 'herb salads']
            },
            'winter': {
                name: 'Winter',
                methods: ['pan_sear', 'roast'],
                marinadeTime: 'longer',
                notes: 'Heartier seasonings, robust herbs',
                pAirings: ['roasted root vegetables', 'red wine reductions', 'mushrooms']
            }
        },
        storage: {
            fresh: {
                temperature: {},
                duration: '3-5 days',
                method: 'wrapped, bottom shelf',
                notes: 'Keep loosely wrapped to allow Air circulation'
            },
            frozen: {
                temperature: {},
                duration: '6-12 months',
                method: 'vacuum seal or wrap tightly in freezer paper then plastic for best results'
            },
            aging: {
                methods: {
                    'dry_aging': {
                        name: 'Dry Aging',
                        process: 'Controlled temperature and humidity exposure to enhance flavor and tenderness',
                        duration: '14-45 days typically'
                    },
                    'wet_aging': {
                        name: 'Wet Aging',
                        process: 'Aging in vacuum-sealed packaging',
                        duration: '7-28 days typically'
                    }
                }
            }
        },
        safetyThresholds: {
            minimum: {},
            maximum: {},
            dangerZone: {
                min: {},
                max: { fahrenheit: 140, celsius: 60 }
            },
            notes: 'Surface bacteria killed by searing, internal rare temperature is safe for whole cuts'
        },
        pAiringRecommendations: {
            wine: {
                red: ['Cabernet Sauvignon', 'Malbec', 'Syrah'],
                white: ['Full-bodied Chardonnay'],
                notes: 'Tannins complement fat content'
            },
            sides: {
                vegetables: ['asparagus', 'mushrooms', 'potatoes'],
                starches: ['truffle fries', 'mashed potatoes', 'risotto'],
                sauces: ['béarnaise', 'red wine reduction', 'peppercorn']
            },
            complementary: ['blue cheese', 'caramelized onions', 'bone marrow'],
            contrasting: ['arugula salad', 'pickled vegetables', 'acidic salsas'],
            toAvoid: ['delicate fish', 'light pasta dishes', 'overly sweet sauces']
        }
    },
    'pork_belly': {
        name: 'Pork Belly',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
        }),
        qualities: ['rich', 'fatty', 'versatile', 'indulgent', 'flavorful'],
        season: ['all'],
        category: 'protein',
        subCategory: 'pork',
        origin: ['Global', 'China', 'Korea', 'Italy', 'Philippines'],
        affinities: ['star anise', 'soy sauce', 'maple', 'apple', 'ginger', 'fennel'],
        cookingMethods: ['braise', 'roast', 'sous_vide', 'confit', 'smoke', 'grill'],
        astrologicalProfile: {
            rulingPlanets: ['Venus', 'Jupiter'],
            favorableZodiac: ['taurus', 'libra', 'cancer'],
            elementalAffinity: {
                base: 'Water',
                secondary: 'Earth',
                decanModifiers: {
                    first: {},
                    second: {},
                    third: { element: 'Fire', planet: 'Jupiter' }
                }
            },
            lunarPhaseModifiers: {
                newmoon: {
                    elementalBoost: {},
                    preparationTips: ['Good for curing and preservation methods']
                },
                fullmoon: {
                    elementalBoost: {},
                    preparationTips: ['Enhanced flavor from braising and slow cooking']
                }
            },
            aspectEnhancers: ['Venus trine jupiter', 'Moon in cancerCancer']
        },
        nutritionalProfile: {
            serving_size: "3 oz",
            calories: 518,
            macros: {
                protein: 9,
                carbs: 0,
                fat: 53,
                fiber: 0
            },
            vitamins: {
                B1: 0.38,
                B12: 0.18,
                niacin: 0.14
            },
            minerals: {
                selenium: 0.76,
                phosphorus: 0.18,
                zinc: 0.16,
                iron: 0.04,
                potassium: 0.05
            },
            cholesterol: 95,
            saturated_fat: 17,
            source: "USDA FoodData Central"
        },
        healthBenefits: [
            'Protein source for muscle maintenance',
            'Contains monounsaturated fats (similar to olive oil)',
            'Good source of fat-soluble vitamins',
            'High in B vitamins for energy production',
            'Selenium supports immune function and thyroid health',
            'Provides complete protein with all essential amino acids'
        ],
        dietary_considerations: [
            'High in calories and fat - consume in moderation',
            'Contains saturated fat - balance with other foods',
            'Rich in cholesterol - consider in context of overall diet',
            'Excellent energy source for active individuals'
        ],
        sustainability: {
            rating: 'Variable',
            source: 'Depends on farming practices',
            notes: 'Utilizes less desirable cuts, reducing food waste'
        },
        varieties: {
            'Cured': {
                name: 'Cured',
                appearance: 'pink throughout',
                texture: 'firm, dense',
                uses: 'pancetta, bacon',
                notes: 'Extended shelf life, concentrated flavor'
            }
        },
        culinaryApplications: {
            'braise': {
                name: 'Braise',
                method: 'slow, moist heat',
                temperature: {
                    fahrenheit: 300,
                    celsius: 150
                },
                timing: '2-3 hours',
                techniques: {
                    'chinese_style': {
                        name: 'Chinese Style',
                        ingredients: ['soy sauce', 'rock sugar', 'star anise'],
                        method: 'red braising',
                        duration: '2-3 hours',
                        notes: 'Classic technique producing glossy, flavorful result'
                    },
                    'italian_style': {
                        name: 'Italian Style',
                        ingredients: ['wine', 'herbs', 'aromatics'],
                        method: 'wine braising',
                        duration: '3-4 hours',
                        notes: 'Produces tender meat with Mediterranean flavor profile'
                    },
                    'vietnamese_style': {
                        name: 'Vietnamese Style',
                        ingredients: ['coconut water', 'fish sauce', 'caramel'],
                        method: 'caramel braising',
                        duration: '1.5-2 hours',
                        notes: 'Sweet, savory, and deeply umami flavor profile'
                    }
                },
                tips: [
                    'Cut into uniform cubes for even cooking',
                    'Sear before braising for deeper flavor',
                    'Skim fat periodically during cooking',
                    'Cook a day ahead and refrigerate to easily remove excess fat'
                ]
            },
            'roast': {
                name: 'Roast',
                method: 'dry heat, uncovered',
                temperature: {
                    initial: {},
                    cooking: { fahrenheit: 350, celsius: 180 }
                },
                timing: '1.5 hours total',
                techniques: {
                    'crispy_skin': {
                        name: 'Crispy Skin',
                        method: 'score skin, salt rub',
                        timing: 'salt 24h ahead',
                        notes: 'Creates glass-like crackling'
                    },
                    'herb_crust': {
                        name: 'Herb Crust',
                        method: 'herb paste coating',
                        timing: 'apply before cooking',
                        notes: 'Adds aromatic dimension'
                    },
                    'porchetta_style': {
                        name: 'Porchetta Style',
                        method: 'butterfly, season interior, roll and tie',
                        timing: 'season 24h ahead',
                        notes: 'Italian specialty with crisp exterior and succulent interior'
                    }
                },
                tips: [
                    'Pat skin completely dry before cooking',
                    'Use a two-temperature approach for ideal results',
                    'Rest for 15-20 minutes before slicing',
                    'Slice thinly across the grain'
                ]
            },
            'sous_vide': {
                name: 'Sous Vide',
                method: 'vacuum sealed',
                temperature: {
                    'tender': { name: 'Tender', fahrenheit: 170, celsius: 77 }
                },
                timing: {
                    'minimum': '12 hours',
                    'maximum': '36 hours',
                    'optimal': '24 hours'
                },
                finishing: {
                    'crispy_skin': {
                        name: 'Crispy Skin',
                        method: 'high heat roast',
                        temperature: {},
                        timing: '20-30 minutes'
                    },
                    'broil': {
                        name: 'Broil',
                        method: 'high heat from above',
                        timing: '5-10 minutes',
                        notes: 'Watch carefully to prevent burning'
                    },
                    'torch': {
                        name: 'Torch',
                        method: 'direct flame application',
                        timing: '2-3 minutes',
                        notes: 'For precise control over crisping'
                    }
                },
                advantages: [
                    'Complete control over final texture',
                    'Even cooking throughout',
                    'Can infuse flavors during long cooking',
                    'Minimal attention needed during cooking'
                ]
            },
            'smoke': {
                name: 'Smoke',
                method: 'low indirect heat with wood smoke',
                temperature: {},
                timing: '3-5 hours',
                woods: {
                    'apple': 'mild, slightly sweet',
                    'hickory': 'strong, bacon-like',
                    'cherry': 'mild, fruity',
                    'maple': 'mild, sweet'
                },
                preparation: {
                    'dry_brine': {
                        name: 'Dry Brine',
                        method: 'salt rub',
                        duration: '12-24 hours',
                        notes: 'Enhances moisture retention'
                    },
                    'wet_brine': {
                        name: 'Wet Brine',
                        method: 'salt, sugar, aromatics solution',
                        duration: '24-48 hours',
                        notes: 'Adds flavor throughout'
                    },
                    'rub': {
                        name: 'Dry Rub',
                        method: 'spice mixture application',
                        timing: '1-12 hours before cooking',
                        notes: 'Creates flavorful bark'
                    }
                }
            }
        },
        seasonalAdjustments: {
            'summer': {
                name: 'Summer',
                methods: ['grill', 'smoke'],
                marinades: {
                    'citrus_based': {
                        name: 'Citrus Based',
                        ingredients: ['citrus', 'garlic', 'herbs'],
                        duration: '4-6 hours',
                        notes: 'Brightens the rich meat'
                    },
                    'asian_style': {
                        name: 'Asian Style',
                        ingredients: ['soy', 'ginger', 'rice wine'],
                        duration: '6-8 hours',
                        notes: 'Adds complex umami notes'
                    }
                },
                accompaniments: ['fresh slaws', 'pickled vegetables', 'light herbs']
            },
            'winter': {
                name: 'Winter',
                methods: ['braise', 'roast'],
                marinades: {
                    'wine_based': {
                        name: 'Wine Based',
                        ingredients: ['red wine', 'aromatics', 'herbs'],
                        duration: '8-12 hours',
                        notes: 'Adds depth and complexity'
                    },
                    'spice_forward': {
                        name: 'Spice Forward',
                        ingredients: ['five spice', 'garlic', 'soy'],
                        duration: '12-24 hours',
                        notes: 'Warming spice profile'
                    }
                },
                accompaniments: ['root vegetables', 'hearty greens', 'grain dishes']
            }
        },
        storage: {
            fresh: {
                temperature: {},
                duration: '3-4 days',
                method: 'loosely wrapped',
                notes: 'Store in coldest part of refrigerator'
            },
            frozen: {
                temperature: {},
                duration: '4-6 months',
                method: 'vacuum sealed',
                notes: 'Double wrap to prevent freezer burn'
            },
            thawing: {
                preferred: {
                    method: 'refrigerator',
                    time: '24-36 hours',
                    notes: 'Most even thawing, best quality'
                },
                alternate: {
                    method: 'cold water',
                    time: '2-3 hours',
                    notes: 'Change water every 30 minutes',
                    follow_up: 'Pat dry thoroughly before cooking'
                }
            },
            post_cooking: {
                time: 'up to 3 days refrigerated',
                reheating: 'gently to avoid overcooking',
                best_practice: 'slice thinly for sandwiches or salads'
            }
        },
        safetyThresholds: {
            cooking: {},
            rest: '3 minutes minimum',
            notes: 'USDA recommends 145°F with 3-minute rest for all pork'
        },
        pAiringRecommendations: {
            wine: {
                red: ['Riesling', 'Gewürztraminer', 'Pinot Noir'],
                white: ['Off-dry Riesling', 'Chenin Blanc'],
                notes: 'Fruity wines cut through richness'
            },
            beer: {
                styles: ['Belgian Tripel', 'Brown Ale', 'Vienna Lager'],
                notes: 'Malty sweetness complements fatty richness'
            },
            spirits: {
                types: ['Bourbon', 'Aged Rum', 'Calvados'],
                notes: 'Caramel notes enhance flavor profile'
            },
            complementary: ['apple', 'fennel', 'cabbage', 'scallions', 'maple'],
            contrasting: ['pickled vegetables', 'vinegar-based sauces', 'citrus'],
            toAvoid: ['delicate seafood', 'very light dishes']
        },
        regionalPreparations: {
            'chinese': {
                name: 'Chinese',
                'dong_po_rou': {
                    name: 'Dong Po Rou',
                    region: 'Hangzhou',
                    method: 'red-braised, caramelized',
                    notes: 'Classic dish of meltingly tender meat'
                },
                'hong_shao_rou': {
                    name: 'Hong Shao Rou',
                    region: 'Shanghai',
                    method: 'red-braised with aromatics',
                    notes: 'Iconic sweet-savory preparation'
                }
            },
            'filipino': {
                name: 'Filipino',
                'lechon_kawali': {
                    name: 'Lechon Kawali',
                    method: 'boiled then deep-fried',
                    notes: 'Crispy on outside, tender inside'
                },
                'crispy_pata': {
                    name: 'Crispy Pata',
                    method: 'deep-fried after boiling',
                    notes: 'Popular crispy pork dish'
                }
            },
            'korean': {
                name: 'Korean',
                'samgyeopsal': {
                    name: 'Samgyeopsal',
                    method: 'grilled table-side',
                    notes: 'Social dining experience with fresh accompaniments'
                },
                'bossam': {
                    name: 'Bossam',
                    method: 'boiled with aromatics',
                    notes: 'Wrapped in cabbage or lettuce leaves'
                }
            }
        }
    },
    'lamb_rack': {
        name: 'Lamb Rack',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
        }),
        qualities: ['tender', 'rich', 'delicate', 'elegant', 'succulent'],
        season: ['spring', 'winter'],
        category: 'protein',
        subCategory: 'lamb',
        origin: ['New Zealand', 'Australia', 'United States', 'United Kingdom', 'Ireland'],
        affinities: ['rosemary', 'garlic', 'mint', 'olive oil', 'thyme', 'dijon mustard', 'red wine'],
        cookingMethods: ['roast', 'grill', 'herb_crust', 'sous_vide', 'reverse_sear'],
        astrologicalProfile: {
            rulingPlanets: ['Mars', 'Venus'],
            favorableZodiac: ['aries', 'taurus', 'libra'],
            elementalAffinity: {
                base: 'Fire',
                secondary: 'Earth',
                decanModifiers: {
                    first: {},
                    second: {},
                    third: { element: 'Air', planet: 'Mercury' }
                }
            },
            lunarPhaseModifiers: {
                newmoon: {
                    elementalBoost: {},
                    preparationTips: ['Subtle seasoning', 'Delicate cooking methods']
                },
                fullmoon: {
                    elementalBoost: {},
                    preparationTips: ['Robust flavors', 'Expressive cooking methods']
                }
            },
            aspectEnhancers: ['Mars trine venus', 'Moon in ariesAries']
        },
        nutritionalProfile: {
            serving_size: "3 oz",
            calories: 294,
            macros: {
                protein: 25,
                carbs: 0,
                fat: 21,
                fiber: 0
            },
            vitamins: {
                B12: 0.89,
                niacin: 0.28,
                riboflavin: 0.27,
                B6: 0.15
            },
            minerals: {
                zinc: 0.43,
                selenium: 0.36,
                iron: 0.11,
                phosphorus: 0.20,
                potassium: 0.09
            },
            cholesterol: 97,
            omega3: 0.1,
            conjugated_linoleic_acid: 5.6,
            source: "USDA FoodData Central"
        },
        healthBenefits: [
            'Complete protein source (contains all essential amino acids)',
            'Rich in heme iron (highly bioavailable form)',
            'High in vitamin B12 (supports nerve function and red blood cell formation)',
            'Good source of zinc (important for immune function and wound healing)',
            'Contains conjugated linoleic acid (potential anti-inflammatory properties)',
            'Provides selenium (supports thyroid function and acts as antioxidant)',
            'Contains taurine (supports cardiovascular and nervous system health)'
        ],
        dietary_considerations: [
            'Higher in fat compared to other protein sources',
            'Source of high-quality animal protein',
            'Provides fat-soluble vitamins (A, D, E, K)',
            'Consider in context of overall dietary pattern'
        ],
        sustainability: {
            rating: 'Variable',
            source: 'Depends on farming practices and region',
            notes: 'Pasture-raised lamb can contribute to soil health and biodiversity'
        },
        varieties: {
            'Frenched': {
                name: 'Frenched',
                appearance: 'cleaned rib bones',
                presentation: 'elegant',
                uses: 'roasting, grilling',
                weight: '16-24 oz (8 ribs)',
                notes: 'Most common preparation in fine dining'
            },
            'Crown': {
                name: 'Crown',
                appearance: 'formed into circle',
                presentation: 'spectacular',
                uses: 'roasting, special occasions',
                preparation: 'two racks tied together',
                notes: 'Showstopping centerpiece for celebrations'
            },
            'Australian': {
                name: 'Australian',
                appearance: 'slightly smaller',
                flavor: 'mild, clean',
                notes: 'Popular for its consistent quality'
            },
            'New Zealand': {
                name: 'New Zealand',
                appearance: 'compact, well-marbled',
                flavor: 'grassy, distinctive',
                notes: 'Grass-fed, distinctive flavor profile'
            }
        },
        culinaryApplications: {
            'herb_crust': {
                name: 'Herb Crust',
                method: 'coat and roast',
                ingredients: {
                    'classic': ['herbs', 'mustard', 'breadcrumbs'],
                    'mediterranean': ['herbs', 'garlic', 'olive oil'],
                    'middle_eastern': ['za\'atar', 'olive oil', 'garlic']
                },
                temperature: {
                    fahrenheit: 375,
                    celsius: 190
                },
                timing: {
                    'sear': '3-4 minutes',
                    'roast': '18-20 minutes for medium-rare',
                    'rest': '10 minutes'
                },
                techniques: {
                    'mustard_base': {
                        name: 'Mustard Base',
                        method: 'brush with mustard before herbs',
                        notes: 'helps coating adhere',
                        variants: ['dijon', 'whole grain', 'honey mustard']
                    },
                    'herb_paste': {
                        name: 'Herb Paste',
                        method: 'process herbs with oil',
                        notes: 'more intense flavor',
                        variants: ['parsley-dominant', 'rosemary-dominant', 'mint-dominant']
                    },
                    'breadcrumb_crust': {
                        name: 'Breadcrumb Crust',
                        method: 'layer mustard, herbs, then breadcrumbs',
                        notes: 'creates textural contrast',
                        variants: ['panko', 'sourdough', 'herbed']
                    }
                },
                tips: [
                    'Let meat come to room temperature before cooking',
                    'Create a tight, even crust for best results',
                    'Use a meat thermometer for perfect doneness',
                    'Rest meat loosely tented with foil before carving'
                ]
            },
            'reverse_sear': {
                name: 'Reverse Sear',
                method: 'low then high heat',
                temperature: {
                    initial: {},
                    sear: { fahrenheit: 500, celsius: 260 }
                },
                timing: {
                    'low_heat': '30-35 minutes',
                    'rest': '15 minutes',
                    'sear': '1-2 minutes per side'
                },
                internalTemp: {
                    'rare': Record<string, unknown>,
                    'medium_rare': { name: 'Medium Rare', fahrenheit: 130, celsius: 54 }
                },
                benefits: [
                    'More even cooking throughout',
                    'Better control of doneness',
                    'Superior crust development',
                    'Larger window of perfect doneness'
                ]
            },
            'sous_vide': {
                name: 'Sous Vide',
                method: 'vacuum sealed, water bath',
                temperature: {
                    'rare': Record<string, unknown>,
                    'medium_rare': { name: 'Medium Rare', fahrenheit: 131, celsius: 55 }
                },
                timing: {
                    'minimum': '1 hour',
                    'maximum': '4 hours',
                    'optimal': '2 hours'
                },
                finishing: {
                    method: 'high heat sear',
                    options: ['cast iron', 'broiler', 'torch'],
                    duration: '45-60 seconds per side',
                    tips: 'Pat completely dry before searing'
                },
                aromatics: {
                    recommendations: ['rosemary', 'thyme', 'garlic', 'olive oil'],
                    notes: 'Add sparingly to avoid overwhelming the meat'
                }
            },
            'traditional_roast': {
                name: 'Traditional Roast',
                method: 'high heat roasting',
                temperature: {},
                timing: {
                    'overall': '20-25 minutes for medium-rare',
                    'rest': '10-15 minutes'
                },
                preparation: {
                    'seasoning': 'Salt and pepper 1 hour before cooking',
                    'aromatics': 'Garlic and herb brush before cooking',
                    'basting': 'Butter and herbs during last 5 minutes'
                },
                tips: [
                    'Use a roasting rack to elevate meat for even cooking',
                    'Shield exposed bones with foil to prevent burning',
                    'Rest meat upside down to redistribute juices'
                ]
            }
        },
        seasonalAdjustments: {
            'spring': {
                name: 'Spring',
                marinades: {
                    'herb_forward': {
                        name: 'Herb Forward',
                        ingredients: ['fresh herbs', 'garlic', 'lemon'],
                        duration: '4-6 hours',
                        notes: 'Highlights seasonal freshness'
                    }
                },
                accompaniments: ['spring peas', 'young carrots', 'new potatoes', 'mint sauce'],
                presentation: 'Bright, fresh colors and light accompaniments'
            },
            'winter': {
                name: 'Winter',
                marinades: {
                    'robust': {
                        name: 'Robust',
                        ingredients: ['red wine', 'rosemary', 'garlic'],
                        duration: '6-8 hours',
                        notes: 'Adds warming depth'
                    }
                },
                accompaniments: ['root vegetables', 'hearty grains', 'rich reductions', 'braised greens'],
                presentation: 'Rustic, substantial plating with deep colors'
            }
        },
        storage: {
            fresh: {
                temperature: {},
                duration: '3-5 days',
                method: 'loosely wrapped, bottom shelf',
                notes: 'Store away from other foods to prevent cross-contamination'
            },
            frozen: {
                temperature: {},
                duration: 'up to 9 months',
                method: 'vacuum sealed or double-wrapped',
                notes: 'Thaw slowly in refrigerator for best results'
            },
            cooked: {
                temperature: {},
                duration: '3-4 days',
                reheating: 'gently to avoid overcooking',
                notes: 'Best served slightly warm rather than hot when reheated'
            }
        },
        safetyThresholds: {
            minimum: {},
            medium_rare: {},
            medium: {},
            notes: 'Personal preference largely dictates doneness; lamb can be enjoyed rare to medium'
        },
        pAiringRecommendations: {
            wine: {
                red: ['Bordeaux Blend', 'Syrah / (Shiraz || 1)', 'Cabernet Sauvignon', 'Rioja'],
                notes: 'Tannic reds stand up to richness'
            },
            sides: {
                starches: ['potato gratin', 'couscous', 'polenta', 'roasted fingerlings'],
                vegetables: ['roasted root vegetables', 'asparagus', 'spring peas', 'glazed carrots'],
                sauces: ['mint sauce', 'red wine reduction', 'rosemary jus', 'salsa verde']
            },
            complementary: ['mint', 'rosemary', 'thyme', 'black garlic', 'red wine'],
            contrasting: ['mint yogurt', 'citrus zest', 'pomegranate'],
            toAvoid: ['overwhelming spices', 'very acidic sauces']
        },
        regionalPreparations: {
            'british': {
                name: 'British',
                'sunday_roast': {
                    name: 'Sunday Roast',
                    method: 'simply roasted with minimal seasoning',
                    accompaniments: 'mint sauce, roast potatoes, yorkshire pudding',
                    notes: 'Traditional preparation highlighting meat quality'
                }
            }
        }
    },
    'duck_breast': {
        name: 'Duck Breast',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
        }),
        astrologicalProfile: {
            rulingPlanets: ['Venus', 'Moon'],
            favorableZodiac: ['taurus', 'cancer', 'pisces'],
            elementalAffinity: {
                base: 'Water',
                decanModifiers: {
                    first: {},
                    second: {},
                    third: { element: 'Air', planet: 'Mercury' }
                }
            }
        },
        qualities: ['rich', 'tender', 'versatile'],
        season: ['fall', 'winter'],
        category: 'protein',
        subCategory: 'poultry',
        affinities: ['orange', 'cherry', 'star anise', 'thyme'],
        cookingMethods: ['pan_sear', 'sous_vide', 'smoke', 'confit'],
        varieties: {
            'Pekin': {
                name: 'Pekin',
                appearance: 'smaller, tender',
                texture: 'delicate fat layer',
                uses: 'quick cooking, restaurants'
            },
            'Muscovy': {
                name: 'Muscovy',
                appearance: 'larger, leaner',
                texture: 'firm meat, thick fat',
                uses: 'traditional French cuisine'
            }
        },
        culinaryTraditions: {
            'chinese': {
                name: 'pipa duck',
                usage: ['roasted', 'glazed'],
                preparation: 'Air dried, honey glazed',
                pAirings: ['scallions', 'hoisin sauce', 'pancakes'],
                cultural_notes: 'Refined Cantonese preparation'
            }
        },
        preparation: {
            scoring: 'diamond pattern in fat',
            resting: '10-15 minutes after cooking',
            notes: 'Fat must render slowly'
        },
        storage: {
            fresh: {
                temperature: {},
                duration: '2-3 days',
                method: 'wrapped, bottom shelf'
            },
            frozen: {
                temperature: {},
                duration: '4-6 months',
                method: 'vacuum sealed'
            }
        },
        nutritionalProfile: {
            serving_size: "3 oz",
            calories: 250,
            macros: {
                protein: 18.5,
                carbs: 0,
                fat: 19.8,
                fiber: 0
            },
            vitamins: {
                B12: 0.24,
                niacin: 0.38,
                B6: 0.20,
                folate: 0.04
            },
            minerals: {
                selenium: 0.42,
                iron: 0.29,
                phosphorus: 0.21,
                zinc: 0.18,
                potassium: 0.11
            },
            cholesterol: 84,
            saturated_fat: 6.2,
            source: "USDA FoodData Central"
        }
    },
    'veal_osso_buco': {
        name: 'Veal Osso Buco',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
        }),
        qualities: ['tender', 'gelatinous', 'rich'],
        season: ['fall', 'winter'],
        category: 'protein',
        subCategory: 'veal',
        affinities: ['white wine', 'garlic', 'citrus zest', 'tomatoes'],
        cookingMethods: ['braise', 'slow_cook', 'dutch_oven'],
        culinaryTraditions: {},
        preparation: {
            tying: 'secure with kitchen twine',
            browning: 'sear all sides well',
            braising: 'partially submerged',
            notes: 'Keep marrow in bones'
        },
        storage: {
            fresh: {
                temperature: {},
                duration: '2-3 days',
                method: 'wrapped, bottom shelf'
            },
            frozen: {
                temperature: {},
                duration: '4-6 months',
                method: 'vacuum sealed'
            }
        },
        nutritionalProfile: {
            serving_size: "3 oz",
            calories: 175,
            macros: {
                protein: 26.5,
                carbs: 0,
                fat: 7.2,
                fiber: 0
            },
            vitamins: {
                B12: 0.96,
                niacin: 0.31,
                B6: 0.32,
                riboflavin: 0.28
            },
            minerals: {
                zinc: 0.38,
                phosphorus: 0.24,
                iron: 0.16,
                selenium: 0.22,
                potassium: 0.11
            },
            cholesterol: 93,
            saturated_fat: 2.7,
            source: "USDA FoodData Central"
        }
    },
    'venison_loin': {
        name: 'Venison Loin',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
        }),
        qualities: ['lean', 'tender', 'gamey'],
        season: ['fall', 'winter'],
        category: 'protein',
        subCategory: 'game',
        affinities: ['juniper', 'red wine', 'mushrooms', 'blackberries'],
        cookingMethods: ['pan_sear', 'grill', 'sous_vide'],
        varieties: {
            'Farm_Raised': {
                name: 'Farm Raised',
                appearance: 'deep red, consistent',
                texture: 'tender, mild flavor',
                uses: 'versatile cooking methods'
            }
        },
        culinaryTraditions: {
            'german': {
                name: 'hirschrücken',
                usage: ['roasted', 'special occasions'],
                preparation: 'juniper and wine marinade',
                pAirings: ['spätzle', 'red cabbage', 'mushroom sauce'],
                cultural_notes: 'Traditional hunting season dish'
            },
            'scottish': {
                name: 'venison loin',
                usage: ['pan seared', 'roasted'],
                preparation: 'whisky and herb marinade',
                pAirings: ['neeps and tatties', 'berry sauce'],
                cultural_notes: 'Highland specialty'
            }
        },
        preparation: {
            marinating: '4-8 hours recommended',
            resting: '10-15 minutes after cooking',
            notes: 'Cook to medium-rare maximum'
        },
        storage: {
            fresh: {
                temperature: {},
                duration: '2-3 days',
                method: 'wrapped, bottom shelf'
            },
            frozen: {
                temperature: {},
                duration: '6-8 months',
                method: 'vacuum sealed'
            }
        },
        nutritionalProfile: {
            serving_size: "3 oz",
            calories: 134,
            macros: {
                protein: 26.5,
                carbs: 0,
                fat: 2.7,
                fiber: 0
            },
            vitamins: {
                B12: 0.85,
                niacin: 0.43,
                B6: 0.37,
                riboflavin: 0.51
            },
            minerals: {
                iron: 0.34,
                phosphorus: 0.26,
                zinc: 0.23,
                potassium: 0.10,
                selenium: 0.09
            },
            cholesterol: 85,
            saturated_fat: 1.1,
            source: "USDA FoodData Central"
        }
    }
};
// Fix the ingredient mappings to ensure they have all required properties
export const meats = fixIngredientMappings(rawMeats);
export default meats;
