"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.himalayanPinkSalt = exports.seaSalt = exports.salts = void 0;
const elementalUtils_1 = require("../../../utils/elementalUtils");
const elementalUtils_2 = require("../../../utils/elemental/elementalUtils");
const rawSalts = {
    'fleur_de_sel': {
        name: 'Fleur De Sel',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
        }),
        qualities: ['delicate', 'moist', 'mineral'],
        origin: ['France', 'Portugal'],
        category: 'seasoning',
        subCategory: 'salt',
        varieties: {
            'Guérande': {
                name: 'Guérande',
                appearance: 'grey-white crystals',
                texture: 'moist, delicate flakes',
                minerality: 'high',
                uses: 'premium finishing'
            },
            'Camargue': {
                name: 'Camargue',
                appearance: 'white crystals',
                texture: 'light, crispy',
                minerality: 'medium-high',
                uses: 'delicate finishing'
            },
            'Portuguese': {
                name: 'Portuguese',
                appearance: 'white pyramidal crystals',
                texture: 'crunchy, moist',
                minerality: 'medium',
                uses: 'all-purpose finishing'
            }
        },
        harvesting: {
            method: 'hand-harvested from surface',
            timing: 'summer months only',
            conditions: 'specific wind and weather required',
            traditional_tools: ['wooden rake', 'woven basket']
        },
        culinaryApplications: {
            'finishing': {
                name: 'Finishing',
                method: 'sprinkle by hand',
                timing: 'just before serving',
                applications: {
                    'vegetables': 'light sprinkle on raw or cooked',
                    'meats': 'just before serving',
                    'caramels': 'while still warm',
                    'chocolate': 'before setting'
                },
                notes: 'Do not use for cooking - heat destroys texture'
            },
            'garnishing': {
                name: 'Garnishing',
                method: 'pinch and sprinkle',
                applications: {
                    'salads': 'final touch',
                    'bread': 'just before baking',
                    'eggs': 'immediately before eating'
                }
            }
        },
        storage: {
            temperature: 'room temperature',
            humidity: 'low',
            container: 'ceramic or glass',
            notes: 'Keep dry but expects some moisture'
        }
    },
    'maldon_salt': {
        name: 'Maldon Salt',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
        }),
        qualities: ['crisp', 'clean', 'flaky'],
        origin: ['United Kingdom'],
        category: 'seasoning',
        subCategory: 'salt',
        varieties: {
            'Smoked': {
                name: 'Smoked',
                appearance: 'golden-brown flakes',
                texture: 'crunchy with smoke flavor',
                uses: 'meats, hearty dishes'
            }
        },
        culinaryApplications: {
            'finishing': {
                name: 'Finishing',
                method: 'crush between fingers',
                timing: 'just before serving',
                applications: {
                    'grilled_meats': 'after resting',
                    'roasted_vegetables': 'while hot',
                    'baked_goods': 'before baking',
                    'chocolate': 'before setting'
                }
            },
            'texture_enhancement': {
                name: 'Texture Enhancement',
                method: 'strategic placement',
                applications: {
                    'salads': 'final seasoning',
                    'caramels': 'top garnish',
                    'bread_crust': 'pre-bake sprinkle'
                }
            }
        },
        storage: {
            temperature: 'room temperature',
            humidity: 'very low',
            container: 'Airtight glass or ceramic',
            notes: 'Keep very dry to maintain crunch'
        }
    },
    'sea_salt': {
        name: 'Sea Salt',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.1, Water: 0.5, Earth: 0.4, Air: 0.0
        }),
        astrologicalProfile: {
            rulingPlanets: ['Moon', 'Neptune'],
            favorableZodiac: ['cancer', 'pisces'],
            elementalAffinity: {
                base: 'Water',
                decanModifiers: {
                    first: { element: 'Water', planet: 'Moon' },
                    second: { element: 'Water', planet: 'Neptune' },
                    third: { element: 'Earth', planet: 'Saturn' }
                }
            },
            lunarPhaseModifiers: {
                fullmoon: {
                    elementalBoost: (0, elementalUtils_2.createElementalProperties)({
                        Water: 0.3,
                        Earth: 0.1
                    }),
                    preparationTips: ['Excellent for preserving and curing']
                },
                newmoon: {
                    elementalBoost: (0, elementalUtils_2.createElementalProperties)({
                        Water: 0.2,
                        Earth: 0.2
                    }),
                    preparationTips: ['Good for subtle seasoning']
                }
            }
        },
        qualities: ['briny', 'mineral', 'foundational', 'enhancing'],
        origin: ['Oceanic sources worldwide'],
        season: ['all'],
        category: 'seasoning',
        subCategory: 'salt',
        varieties: {
            'fleur_de_sel': {
                name: 'Fleur de Sel',
                appearance: 'delicate, flaky crystals',
                flavor: 'subtle, complex minerality',
                source: 'hand-harvested from surface of salt ponds',
                culinary_uses: 'finishing salt for delicate dishes'
            },
            'flaky_sea_salt': {
                name: 'Flaky Sea Salt',
                appearance: 'pyramid-shaped, crunchy flakes',
                flavor: 'clean, crisp saltiness',
                source: 'evaporated sea water, crushed and sifted',
                culinary_uses: 'finishing salt, textural element'
            },
            'fine_sea_salt': {
                name: 'Fine Sea Salt',
                appearance: 'small, uniform crystals',
                flavor: 'clean, balanced saltiness',
                source: 'evaporated sea water, ground fine',
                culinary_uses: 'all-purpose cooking and baking'
            }
        },
        culinaryApplications: {
            'seasoning': {
                name: 'Direct Seasoning',
                method: 'applied directly to food',
                applications: ['proteins', 'vegetables', 'grains', 'desserts'],
                timing: {
                    'during_cooking': 'for flavor integration',
                    'after_cooking': 'for brightness and texture'
                },
                techniques: {
                    'salting_ahead': 'enhances moisture retention in proteins',
                    'finishing': 'provides texture and visual appeal'
                }
            },
            'preservation': {
                name: 'Preservation',
                method: 'high-concentration application',
                applications: ['curing meats', 'preserving vegetables', 'fermenting'],
                timing: 'days to weeks before consumption',
                notes: 'Draws out moisture, creates environment hostile to harmful bacteria'
            }
        },
        storage: {
            temperature: {
                fahrenheit: { min: 60, max: 75 },
                celsius: { min: 15, max: 24 }
            },
            humidity: 'very low',
            container: 'Airtight, moisture-proof',
            duration: 'indefinite',
            notes: 'May clump in humid conditions, store with rice grains to absorb moisture'
        },
        nutritionalProfile: {
            sodium: 'high',
            minerals: ['sodium', 'magnesium', 'calcium', 'potassium'],
            trace_elements: ['zinc', 'iron', 'manganese'],
            notes: 'Contains naturally occurring minerals absent in refined salt'
        }
    },
    'himalayan_salt': {
        name: 'Himalayan Salt',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
        }),
        astrologicalProfile: {
            planetaryRuler: 'Mars',
            zodiacRuler: 'aries',
            element: 'Earth',
            energyType: 'Grounding',
            lunarPhaseModifiers: {
                'new': {
                    elementalBoost: {},
                    culinaryTip: 'Use for preserving during new Moon for enhanced shelf life'
                },
                'full': {
                    elementalBoost: {},
                    culinaryTip: 'Solutions prepared during full Moon enhance mineral absorption'
                }
            }
        },
        qualities: ['mineral-rich', 'grounding', 'purifying', 'alkalizing', 'preservative'],
        category: 'mineral salt',
        origin: ['Khewra Salt Mine', 'Punjab region', 'Pakistan', 'Himalayan foothills'],
        geologicalFormation: {
            age: 'Precambrian era, approximately 500-800 million years old',
            process: 'Ancient sea evaporation followed by tectonic activity and mineral infusion',
            depth: 'Mined from depths of 200-700 meters',
            composition: 'Primarily sodium chloride with trace minerals that create the characteristic pink color'
        },
        mineralContent: {
            primaryMinerals: {
                'sodium_chloride': '97-98%',
                'calcium': '0.16-0.52%',
                'potassium': '0.28-0.50%',
                'magnesium': '0.16-0.36%',
                'iron': '0.004-0.021%'
            },
            traceMinerals: [
                'zinc', 'copper', 'manganese', 'phosphorus', 'iodine',
                'chromium', 'selenium', 'molybdenum', 'vanadium'
            ],
            totalTraceElements: 'Contains up to 84 different trace minerals'
        },
        varieties: {
            'fine': {
                name: 'Fine Ground',
                characteristics: 'Powdery texture, dissolves quickly',
                culinary_uses: 'Baking, seasoning during cooking, spice blends',
                notes: 'Most versatile for everyday cooking'
            },
            'medium': {
                name: 'Medium Ground',
                characteristics: 'Granular texture with moderate dissolution rate',
                culinary_uses: 'General cooking, table salt, brining',
                notes: 'Good balance between texture and function'
            },
            'coarse': {
                name: 'Coarse Ground',
                characteristics: 'Larger crystals with slow dissolution',
                culinary_uses: 'Salt crusts, rubs, finishing, salt grinders',
                notes: 'Provides textural element and visual appeal'
            },
            'blocks': {
                name: 'Salt Blocks / (Slabs || 1)',
                characteristics: 'Solid pieces used for cooking and serving',
                culinary_uses: 'Cooking surface, cold food presentation, salt plate cooking',
                notes: 'Imparts subtle mineral flavor to foods placed on it'
            },
            'flakes': {
                name: 'Salt Flakes',
                characteristics: 'Thin, delicate crystal structures',
                culinary_uses: 'Finishing salt, garnish, textural element',
                notes: 'Creates burst of flavor and visual appeal'
            }
        },
        colorProfiles: {
            'light_pink': 'Lower iron content, more subtle mineral flavor',
            'medium_pink': 'Standard variety, balanced mineral content',
            'deep_pink': 'Higher iron content, more pronounced mineral notes',
            'white_inclusions': 'Areas with higher sodium chloride concentration'
        },
        culinaryApplications: {
            'seasoning': {
                name: 'Basic Seasoning',
                methods: ['During cooking', 'Table salt', 'Pre-cooking application'],
                notes: 'More complex flavor profile than regular salt'
            },
            'curing': {
                name: 'Curing and Preservation',
                methods: ['Dry curing meats', 'Preserving fish', 'Fermentation processes'],
                traditional_applications: ['Gravlax', 'Charcuterie', 'Preserved lemons'],
                notes: 'Mineral content adds depth to preserved foods'
            },
            'finishing': {
                name: 'Finishing Salt',
                methods: ['Sprinkled over completed dishes', 'Visual garnish', 'Textural element'],
                ideal_pAirings: ['Caramels', 'Dark chocolate', 'Grilled meats', 'Salads', 'Roasted vegetables'],
                notes: 'Use coarse grind or flakes for maximum visual and textural impact'
            },
            'salt_block_cooking': {
                name: 'Salt Block Cooking',
                methods: [
                    'Heating block for cooking proteins directly on surface',
                    'Chilling block for serving cold items',
                    'Curing foods by contact'
                ],
                temperature_handling: 'Must be heated slowly to prevent cracking',
                maintenance: 'Clean with damp cloth, never use soap, Air dry completely',
                notes: 'Imparts subtle mineral salinity and conducts heat effectively'
            },
            'brining': {
                name: 'Brining Solutions',
                methods: ['Wet brines for poultry and pork', 'Vegetable pickling', 'Cheese making'],
                ratio: 'Standard brine: 1 cup salt to 1 gallon water',
                enhancement_ingredients: ['Sugar', 'Herbs', 'Spices', 'Aromatics'],
                notes: 'Creates more complex mineral profile than table salt brines'
            },
            'specialty': {
                name: 'Specialty Applications',
                methods: [
                    'Salt-crusted fish or meat',
                    'Salt-roasted root vegetables',
                    'Infused salt blends',
                    'Cocktail rim salt'
                ]
            }
        },
        flavor: {
            'profile': 'Complex mineral with subtle earthy notes',
            'saltiness_level': 'Moderate to high depending on crystal size',
            'aftertatse': 'Lingering mineral complexity',
            'mouthfeel': 'Clean, smooth with varied texture based on grind',
            'comparison_to_regular_salt': 'Less sharp, more rounded flavor profile with mineral complexity'
        },
        nutritionalConsiderations: {
            'mineral_content': 'Higher in trace minerals than refined salt',
            'sodium_content': 'Approximately 98% sodium chloride, similar to table salt',
            'health_claims': {
                'regulated': 'No clinically proven therapeutic differences from regular salt',
                'traditional': [
                    'Believed to be more balanced due to mineral content',
                    'May contain slightly lower sodium by volume due to larger crystal structure',
                    'Some practitioners suggest improved hydration from trace minerals'
                ]
            },
            'dietary_considerations': {
                'sodium_restriction': 'Should still be limited by those on sodium-restricted diets',
                'iodine_content': 'Contains some natural iodine but less than iodized salt',
                'additives': 'Free from anti-caking agents and additives found in table salt'
            }
        },
        traditionalUses: {
            'ayurvedic': {
                'properties': 'Considered warming and grounding',
                'applications': [
                    'Digestive aid',
                    'Electrolyte balance',
                    'Used in "sole" water solutions'
                ]
            },
            'therapeutic': {
                'salt_rooms': 'Used in halotherapy for respiratory conditions',
                'salt_lamps': 'Believed to release negative ions when heated',
                'salt_baths': 'Used for skin conditions and relaxation'
            },
            'cultural': {
                'pakistani': 'Traditional preservative and cooking medium',
                'ritual_significance': 'Used in purification ceremonies',
                'gift_giving': 'Historically given as a valuable trade good'
            }
        },
        sustainability: {
            'mining_practices': {
                'traditional': 'Uses room and pillar mining techniques dating back centuries',
                'modern': 'Combination of hand extraction and mechanical methods',
                'environmental_impact': 'Lower impact than industrial salt production but concerns about over-extraction'
            },
            'alternatives': [
                'Sea salt for lower environmental footprint',
                'Local unrefined salts to reduce transportation emissions'
            ],
            'sourcing_considerations': 'Verify authentic sourcing from Khewra region due to prevalence of counterfeit products'
        },
        pAiring: {
            'enhances': [
                'Dark chocolate',
                'Caramel',
                'Grilled meats',
                'Roasted vegetables',
                'Artisanal bread',
                'Fresh fruit (especially watermelon)'
            ],
            'contrasts': [
                'Sweet desserts',
                'Creamy dAiry',
                'Bitter greens'
            ],
            'complements': [
                'Black pepper',
                'Lemon',
                'Fresh herbs',
                'Olive oil',
                'Aged cheeses'
            ]
        },
        culinaryTips: [
            'Use larger crystals as finishing salt for textural contrast',
            'Grind just before use for maximum flavor',
            'Heat salt blocks gradually to prevent cracking',
            'Consider the pink color when using in light-colored dishes',
            'Create signature salt blends with herbs and spices',
            'Try as a rimming salt for cocktails with subtle mineral notes'
        ],
        storage: {
            'conditions': 'Store in cool, dry place away from humidity',
            'containers': 'Ceramic, glass, or wooden containers preferred',
            'shelf_life': 'Indefinite when properly stored',
            'signs_of_quality': 'Should remain dry and free-flowing, no clumping',
            'salt_mills': 'Ceramic grinding mechanism recommended to prevent corrosion'
        }
    },
    'kosher_salt': {
        name: 'Kosher Salt',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
        }),
        qualities: ['clean', 'consistent', 'pure'],
        origin: ['Various'],
        category: 'salt',
        subCategory: 'cooking',
        varieties: {
            'Diamond Crystal': {
                name: 'Diamond Crystal',
                appearance: 'hollow pyramid flakes',
                texture: 'light, crushable',
                dissolution: 'quick',
                uses: 'professional kitchen standard'
            },
            'Morton': {
                name: 'Morton',
                appearance: 'dense flakes',
                texture: 'harder, compact',
                dissolution: 'moderate',
                uses: 'home cooking standard'
            }
        },
        culinaryApplications: {
            'cooking': {
                name: 'Cooking',
                method: 'pinch and sprinkle',
                timing: 'throughout cooking',
                applications: {
                    'seasoning': 'meats before cooking',
                    'pasta_water': '1 tbsp per quart',
                    'baking': 'dough and batters'
                },
                conversion_ratios: {
                    'table_salt': '1 tsp table = 1.25 tsp Morton = 2 tsp Diamond',
                    'weight_based': '1 gram = 1 gram (any brand)'
                }
            },
            'koshering': {
                name: 'Koshering',
                method: 'coat meat surface',
                timing: '1 hour before cooking',
                process: [
                    'apply salt liberally',
                    'rest for 1 hour',
                    'rinse thoroughly',
                    'pat dry'
                ]
            }
        },
        storage: {
            temperature: 'room temperature',
            humidity: 'low',
            container: 'Airtight container',
            notes: 'Very stable, no special requirements'
        }
    },
    'table_salt': {
        name: 'Table Salt',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
        }),
        qualities: ['basic', 'refined', 'uniform'],
        origin: ['Global'],
        category: 'seasoning',
        subCategory: 'salt',
        culinaryApplications: {
            'cooking': {
                name: 'Cooking',
                method: 'pinch and sprinkle',
                timing: 'throughout cooking',
                applications: {
                    'seasoning': 'meats before cooking',
                    'pasta_water': '1 tbsp per quart',
                    'baking': 'dough and batters'
                },
                conversion_ratios: {
                    'table_salt': '1 tsp table = 1.25 tsp Morton = 2 tsp Diamond',
                    'weight_based': '1 gram = 1 gram (any brand)'
                }
            },
            'koshering': {
                name: 'Koshering',
                method: 'coat meat surface',
                timing: '1 hour before cooking',
                process: [
                    'apply salt liberally',
                    'rest for 1 hour',
                    'rinse thoroughly',
                    'pat dry'
                ]
            }
        },
        storage: {
            temperature: 'room temperature',
            humidity: 'low',
            container: 'Airtight container',
            notes: 'Very stable, no special requirements'
        }
    },
    'himalayan_pink_salt': {
        name: 'Himalayan Pink Salt',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.2, Water: 0.3, Earth: 0.5, Air: 0.0
        }),
        astrologicalProfile: {
            rulingPlanets: ['Venus', 'Saturn'],
            favorableZodiac: ['taurus', 'capricorn'],
            elementalAffinity: {
                base: 'Earth',
                decanModifiers: {
                    first: { element: 'Earth', planet: 'Saturn' },
                    second: { element: 'Earth', planet: 'Venus' },
                    third: { element: 'Water', planet: 'Moon' }
                }
            },
            lunarPhaseModifiers: {
                fullmoon: {
                    elementalBoost: (0, elementalUtils_2.createElementalProperties)({
                        Earth: 0.3,
                        Water: 0.1
                    }),
                    preparationTips: ['Excellent for salt blocks and grilling']
                },
                waxingGibbous: {
                    elementalBoost: (0, elementalUtils_2.createElementalProperties)({
                        Earth: 0.2,
                        Fire: 0.1
                    }),
                    preparationTips: ['Good for curing and preservation']
                }
            }
        },
        qualities: ['mineral-rich', 'robust', 'ancient', 'grounding'],
        origin: ['Khewra Salt Mine, Pakistan'],
        season: ['all'],
        category: 'seasoning',
        subCategory: 'salt',
        varieties: {
            'fine': {
                name: 'Fine Himalayan Pink Salt',
                appearance: 'fine, uniform pink crystals',
                flavor: 'clean salt taste with mineral undertones',
                culinary_uses: 'all-purpose cooking and baking'
            },
            'coarse': {
                name: 'Coarse Himalayan Pink Salt',
                appearance: 'large, irregular pink crystals',
                flavor: 'robust mineral profile',
                culinary_uses: 'grinding, salt mills, brines'
            },
            'block': {
                name: 'Himalayan Salt Block',
                appearance: 'solid pink salt slab',
                uses: 'cooking surface, serving platter, cold preparation',
                notes: 'imparts subtle saltiness and minerals to food'
            }
        },
        culinaryApplications: {
            'cooking': {
                name: 'Cooking',
                method: 'added during food preparation',
                applications: ['seasoning', 'brining', 'curing'],
                notes: 'Provides balanced saltiness and trace minerals'
            },
            'salt_block_cooking': {
                name: 'Salt Block Cooking',
                method: 'heating salt block for cooking surface',
                applications: ['grilling proteins', 'searing vegetables', 'cooking eggs'],
                techniques: 'gradually heat block to prevent cracking',
                notes: 'Imparts subtle mineral flavor, naturally antimicrobial'
            }
        },
        storage: {
            temperature: {
                fahrenheit: { min: 60, max: 75 },
                celsius: { min: 15, max: 24 }
            },
            humidity: 'very low',
            container: 'Airtight, moisture-proof',
            duration: 'indefinite',
            notes: 'Salt blocks should be thoroughly dried after use'
        },
        nutritionalProfile: {
            sodium: 'high',
            minerals: ['sodium', 'calcium', 'potassium', 'magnesium', 'iron'],
            trace_elements: ['zinc', 'manganese', 'copper'],
            notes: 'Contains up to 84 trace minerals'
        }
    }
};
// Fix the ingredient mappings to ensure they have all required properties
exports.salts = (0, elementalUtils_1.fixIngredientMappings)(rawSalts);
// Export the entire collection
exports.default = exports.salts;
// Export individual salts for direct access
exports.seaSalt = exports.salts.sea_salt;
exports.himalayanPinkSalt = exports.salts.himalayan_pink_salt;
