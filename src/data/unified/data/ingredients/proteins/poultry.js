import { fixIngredientMappings } from "../../../utils/elementalUtils";
import { createElementalProperties } from "../../../utils/elemental/elementalUtils";

const rawPoultry = {
    'chicken': {
        name: 'Chicken',
        elementalProperties: createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }),
        astrologicalProfile: {
            rulingPlanets: ['Mercury'],
            favorableZodiac: ['virgo'],
            elementalAffinity: {
                base: 'Air',
                secondary: 'Water'
            },
            lunarPhaseModifiers: {
                'waxing': {
                    elementalBoost: {},
                    preparationTip: 'Roast with aromatics for increasing vitality'
                }
            }
        },
        qualities: ['adaptable', 'mild', 'versatile', 'light', 'neutral', 'balancing'],
        category: 'poultry',
        origin: ['domesticated worldwide', 'ancestor is the red junglefowl of Southeast Asia'],
        varieties: {
            'broiler': {
                name: 'Broiler / (Fryer || 1)',
                characteristics: 'young and tender, usually 7-10 weeks old, 2-5 pounds',
                best_cooking_methods: ['roasting', 'frying', 'grilling', 'sautéing'],
                notes: 'Most common commercial chicken, versatile for most recipes'
            },
            'roaster': {
                name: 'Roaster',
                characteristics: 'older than broilers, usually 3-5 months old, 5-7 pounds',
                best_cooking_methods: ['roasting', 'rotisserie', 'braising'],
                notes: 'More flavor and fat than broilers, good for whole bird preparations'
            },
            'capon': {
                name: 'Capon',
                characteristics: 'castrated male, tender meat with higher fat content, 7-10 pounds',
                best_cooking_methods: ['roasting', 'poaching'],
                notes: 'Prized for special occasions, very tender and flavorful'
            },
            'stewing_hen': {
                name: 'Stewing Hen',
                characteristics: 'older hen (usually retired egg-layer), tougher meat, more flavor',
                best_cooking_methods: ['slow cooking', 'stewing', 'braising', 'soup making'],
                notes: 'Excellent for stocks, broths, and slow-cooked dishes'
            },
            'cornish_game_hen': {
                name: 'Cornish Game Hen',
                characteristics: 'small young chicken, usually 1-2 pounds',
                best_cooking_methods: ['roasting', 'grilling', 'spatchcocking'],
                notes: 'Perfect for individual servings, elegant presentations'
            },
            'heritage_breeds': {
                name: 'Heritage Breeds',
                characteristics: 'traditional breeds with distinct flavors, slower growing',
                examples: ['Dorking', 'Jersey Giant', 'Plymouth Rock', 'Wyandotte'],
                notes: 'Often pasture-raised with more complex flavor profiles'
            }
        },
        cookingMethods: {
            'roasting': {
                name: 'Roasting',
                best_for: ['whole chicken', 'chicken parts with skin'],
                technique: 'Dry heat cooking in an oven, often at higher temperatures for crispy skin',
                tips: [
                    'Pat skin dry before roasting for crispiness',
                    'Roast at 425°F (220°C) for golden skin',
                    'Let rest 10-15 minutes before carving',
                    'Truss or spatchcock for even cooking'
                ]
            },
            'grilling': {
                name: 'Grilling',
                best_for: ['bone-in pieces', 'boneless thighs', 'butterflied whole chicken'],
                technique: 'Direct cooking over flame or hot coals',
                tips: [
                    'Marinate or brine before grilling for moisture',
                    'Use two-zone fire for indirect cooking of larger pieces',
                    'Finish with sauce or glaze in last few minutes',
                    'Rest before serving to redistribute juices'
                ]
            },
            'poaching': {
                name: 'Poaching',
                best_for: ['chicken breasts', 'whole chicken for shredding'],
                technique: 'Gentle cooking in liquid below simmering point',
                tips: [
                    'Use aromatic liquid (herbs, vegetables, spices)',
                    'Maintain temperature around 170-180°F (77-82°C)',
                    'Remove from liquid and cool in it for moisture retention',
                    'Reserve poaching liquid for soups or sauces'
                ]
            },
            'frying': {
                name: 'Frying',
                best_for: ['pieces with skin and bone', 'boneless pieces with breading'],
                technique: 'Cooking in hot oil, either deep or shallow',
                tips: [
                    'Brine before frying for moisture',
                    'Double-dredge for extra crispy coating',
                    'Maintain oil temperature around 350-375°F (175-190°C)',
                    'Rest on rack after frying to maintain crispness'
                ]
            },
            'stir_frying': {
                name: 'Stir-Frying',
                best_for: ['boneless breast or thigh meat, thinly sliced'],
                technique: 'Quick cooking over high heat with constant movement',
                tips: [
                    'Slice against the grain and uniformly',
                    'Velvet chicken (marinate with cornstarch / (egg || 1) white) for tenderness',
                    'Cook in small batches to avoid steaming',
                    'Have all ingredients prepped before starting'
                ]
            }
        },
        nutritionalProfile: {
            serving_size: "3 oz",
            calories: 165,
            macros: {
                protein: 31,
                carbs: 0,
                fat: 3.6,
                fiber: 0
            },
            vitamins: {
                B6: 0.50,
                B3: 0.64,
                B12: 0.32,
                B5: 0.25
            },
            minerals: {
                selenium: 0.36,
                phosphorus: 0.22,
                zinc: 0.12,
                iron: 0.10
            },
            source: "USDA FoodData Central"
        },
        healthConsiderations: {
            'benefits': [
                'Excellent lean protein source',
                'Lower in saturated fat than many red meats',
                'Good source of B vitamins for energy metabolism',
                'Contains compounds that support heart and brain health'
            ],
            'cautions': [
                'Conventional chickens may contain antibiotic residues',
                'Skin significantly increases fat and calorie content',
                'Industrial chicken may have lower nutrient density than pasture-raised',
                'Risk of foodborne illness if undercooked or improperly handled'
            ]
        },
        seasonality: {
            'availability': 'Year-round',
            'traditional_focus': 'Spring for young chickens, fall for stewing hens'
        },
        culinaryApplications: {
            'soups_stews': {
                name: 'Soups and Stews',
                popular_methods: ['simmering', 'slow cooking', 'pressure cooking'],
                examples: ['chicken noodle soup', 'coq au vin', 'chicken and dumplings', 'chicken curry']
            },
            'roasting': {
                name: 'Roasting Applications',
                popular_methods: ['whole roast', 'spatchcocking', 'beer can chicken'],
                accompaniments: ['root vegetables', 'herbs', 'citrus', 'garlic']
            },
            'shredded': {
                name: 'Shredded Applications',
                popular_uses: ['tacos', 'enchiladas', 'sandwiches', 'salads', 'pot pies'],
                preparation_methods: ['poached', 'pressure cooked', 'roasted then pulled']
            }
        },
        storage: {
            'refrigeration': {
                name: 'Refrigeration',
                duration: {
                    'raw': '1-2 days',
                    'cooked': '3-4 days'
                },
                method: 'Store in coldest part of refrigerator, in original packaging or Airtight container'
            },
            'freezing': {
                name: 'Freezing',
                duration: {
                    'whole': 'up to 12 months',
                    'pieces': 'up to 9 months',
                    'cooked': 'up to 4 months'
                },
                method: 'Wrap tightly in freezer paper, then plastic wrap, or vacuum seal for best results'
            }
        },
        affinities: [
            'herbs', 'citrus', 'garlic', 'onions', 'root vegetables',
            'wine', 'stock', 'butter', 'olive oil', 'spices',
            'grains', 'legumes', 'vegetables', 'fruits'
        ],
        pAirings: ['lemon', 'garlic', 'herbs', 'wine', 'butter', 'olive_oil'],
        substitutions: ['turkey', 'pork', 'fish', 'tofu'],
        idealSeasonings: {
            savory: ['thyme', 'rosemary', 'sage', 'garlic', 'lemon', 'black_pepper'],
            sweet: ['honey', 'maple', 'orange', 'cinnamon']
        }
    },
    'turkey': {
        name: 'Turkey',
        elementalProperties: createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }),
        qualities: ['lean', 'mild', 'versatile', 'traditional'],
        category: 'poultry',
        origin: ['North America', 'domesticated from wild turkey'],
        varieties: {
            'young_tom': {
                name: 'Young Tom',
                characteristics: 'young male, tender meat, 12-16 pounds',
                best_cooking_methods: ['roasting', 'grilling', 'smoking'],
                notes: 'Most common commercial turkey'
            },
            'hen': {
                name: 'Hen',
                characteristics: 'young female, smaller size, 8-12 pounds',
                best_cooking_methods: ['roasting', 'grilling'],
                notes: 'More tender than toms, good for smaller gatherings'
            },
            'heritage': {
                name: 'Heritage',
                characteristics: 'traditional breeds, more flavorful, smaller size',
                examples: ['Bourbon Red', 'Narragansett', 'Standard Bronze'],
                notes: 'Often pasture-raised with more complex flavor'
            }
        },
        cuts: {
            'whole': {
                name: 'Whole',
                characteristics: 'traditional presentation, requires careful cooking',
                cooking_methods: ['roast', 'smoke', 'deep fry'],
                internal_temp: { fahrenheit: 165, celsius: 74 }
            },
            'breast': {
                name: 'Breast',
                characteristics: 'lean, quick-cooking',
                cooking_methods: ['roast', 'grill', 'pan-sear'],
                internal_temp: { fahrenheit: 155, celsius: 68 }
            },
            'thigh': {
                name: 'Thigh',
                characteristics: 'more flavor, higher fat content',
                cooking_methods: ['roast', 'grill', 'braise'],
                internal_temp: { fahrenheit: 165, celsius: 74 }
            },
            'wing': {
                name: 'Wing',
                characteristics: 'high in collagen, good for stock',
                cooking_methods: ['fry', 'grill', 'braise'],
                internal_temp: { fahrenheit: 165, celsius: 74 }
            }
        },
        culinaryApplications: {
            'roasting': {
                name: 'Roasting',
                'traditional': {
                    name: 'Traditional',
                    preparation: {
                        cavity: ['herbs', 'citrus', 'garlic'],
                        skin: ['butter', 'herbs']
                    },
                    cooking: {
                        temperature: {},
                        timing: '15-20 minutes per pound',
                        basting: 'every 30 minutes'
                    }
                }
            },
            'braising': {
                name: 'Braising',
                preparation: {
                    marinade: ['wine', 'herbs', 'aromatics'],
                    searing: 'brown all sides'
                },
                cooking: {
                    liquid: 'wine and stock',
                    temperature: {},
                    timing: '1.5-2 hours'
                }
            }
        },
        regionalPreparations: {
            'west_african': {
                name: 'West African',
                'kedjenou': {
                    name: 'Kedjenou',
                    method: 'slow-cooked with vegetables',
                    spices: ['ginger', 'garlic', 'chili'],
                    service: 'with rice or fufu'
                }
            }
        }
    },
    'pheasant': {
        name: 'Pheasant',
        elementalProperties: createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }),
        qualities: ['gamey', 'lean', 'elegant'],
        origin: ['Europe', 'Asia'],
        category: 'protein',
        subCategory: 'poultry',
        varieties: {
            'ring_necked': {
                name: 'Ring Necked',
                weight: '2.5-3.5 lbs',
                characteristics: 'most common variety',
                best_for: 'traditional preparations'
            }
        },
        cuts: {
            'whole': {
                name: 'Whole',
                characteristics: 'lean, requires careful cooking',
                cooking_methods: ['roast', 'braise', 'sous-vide'],
                internal_temp: { fahrenheit: 165, celsius: 74 }
            },
            'breast': {
                name: 'Breast',
                characteristics: 'lean, quick-cooking',
                cooking_methods: ['pan-sear', 'grill'],
                internal_temp: { fahrenheit: 155, celsius: 68 }
            },
            'leg': {
                name: 'Leg',
                characteristics: 'more flavor, tougher',
                cooking_methods: ['braise', 'confit'],
                internal_temp: { fahrenheit: 165, celsius: 74 }
            }
        },
        culinaryApplications: {
            'roasting': {
                name: 'Roasting',
                'traditional': {
                    name: 'Traditional',
                    preparation: {
                        barding: 'wrap in bacon or pancetta',
                        cavity: ['herbs', 'citrus', 'aromatics'],
                        brining: 'optional, 4-6 hours'
                    },
                    cooking: {
                        temperature: {},
                        timing: '45-60 minutes total',
                        basting: 'frequently to prevent drying'
                    }
                }
            },
            'braising': {
                name: 'Braising',
                preparation: {
                    marinade: ['wine', 'aromatics', 'juniper'],
                    searing: 'brown all sides well'
                },
                cooking: {
                    liquid: 'wine and game stock',
                    temperature: {},
                    timing: '1.5-2 hours'
                }
            }
        },
        regionalPreparations: {
            'british': {
                name: 'British',
                'roasted_pheasant': {
                    name: 'Roasted Pheasant',
                    method: 'traditional roasting',
                    sauce: 'bread sauce',
                    service: 'with game chips and watercress'
                }
            }
        }
    },
    'partridge': {
        name: 'Partridge',
        elementalProperties: createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }),
        qualities: ['delicate', 'gamey', 'small'],
        origin: ['Europe', 'Middle East'],
        category: 'protein',
        subCategory: 'poultry',
        varieties: {
            'grey': {
                name: 'Grey',
                weight: '12-15 oz',
                characteristics: 'traditional game bird',
                best_for: 'roasting, grilling'
            },
            'red_legged': {
                name: 'Red Legged',
                weight: '14-18 oz',
                characteristics: 'milder flavor',
                best_for: 'roasting, braising'
            }
        },
        cuts: {
            'whole': {
                name: 'Whole',
                characteristics: 'small, tender game bird',
                cooking_methods: ['roast', 'grill', 'braise'],
                internal_temp: { fahrenheit: 165, celsius: 74 }
            },
            'breast': {
                name: 'Breast',
                characteristics: 'lean, quick-cooking',
                cooking_methods: ['pan-sear', 'grill'],
                internal_temp: { fahrenheit: 155, celsius: 68 }
            }
        },
        culinaryApplications: {
            'roasting': {
                name: 'Roasting',
                'traditional': {
                    name: 'Traditional',
                    preparation: {
                        barding: 'wrap in vine leaves or bacon',
                        cavity: ['herbs', 'garlic', 'butter'],
                        trussing: 'tie legs together'
                    },
                    cooking: {
                        temperature: {},
                        timing: '25-30 minutes total',
                        resting: '10 minutes covered'
                    }
                }
            },
            'braising': {
                name: 'Braising',
                preparation: {
                    marinade: ['wine', 'herbs', 'shallots'],
                    browning: 'quick sear on all sides'
                },
                cooking: {
                    liquid: 'wine and stock',
                    temperature: {},
                    timing: '45-60 minutes'
                }
            }
        },
        regionalPreparations: {
            'middle_eastern': {
                name: 'Middle Eastern',
                'stuffed_partridge': {
                    name: 'Stuffed Partridge',
                    method: 'stuffed with rice and spices',
                    seasonings: ['allspice', 'cinnamon', 'pine nuts'],
                    service: 'with flatbread and yogurt'
                }
            }
        }
    }
};

// Fix the ingredient mappings to ensure they have all required properties
export const poultry = fixIngredientMappings(rawPoultry);

// Create a collection of all poultry items
export const allPoultry = Object.values(poultry);

export default poultry;
