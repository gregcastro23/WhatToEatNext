"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.groundNutmeg = exports.groundGinger = exports.groundTurmeric = exports.groundCumin = exports.groundCinnamon = exports.groundSpices = void 0;
const elementalUtils_1 = require("../../../utils/elementalUtils");
const cuisineTypes_1 = require("../../../constants/cuisineTypes");
const elementalUtils_2 = require("../../../utils/elemental/elementalUtils");
const rawGroundSpices = {
    'ground_cinnamon': {
        name: 'Ground Cinnamon',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.5, Water: 0.1, Earth: 0.3, Air: 0.1
        }),
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
            [cuisineTypes_1.CUISINE_TYPES.INDIAN]: {
                name: 'dalchini',
                usage: ['garam masala', 'chai', 'biryanis', 'desserts'],
                preparation: 'ground or whole sticks',
                cultural_notes: 'Essential in both sweet and savory dishes'
            },
            [cuisineTypes_1.CUISINE_TYPES.CHINESE]: {
                name: 'rou gui',
                usage: ['five spice powder', 'braised dishes', 'red cooking', 'desserts'],
                preparation: 'ground or whole sticks',
                cultural_notes: 'Key component in traditional medicine and cuisine'
            },
            [cuisineTypes_1.CUISINE_TYPES.MIDDLE_EASTERN]: {
                name: 'qirfah',
                usage: ['desserts', 'coffee', 'savory stews', 'rice dishes'],
                preparation: 'ground fine',
                cultural_notes: 'Valued for both culinary and medicinal properties'
            },
            [cuisineTypes_1.CUISINE_TYPES.VIETNAMESE]: {
                name: 'quế',
                usage: ['pho', 'marinades', 'desserts'],
                preparation: 'whole sticks or ground',
                cultural_notes: 'Essential in the famous beef noodle soup'
            },
            [cuisineTypes_1.CUISINE_TYPES.GREEK]: {
                name: 'kanella',
                usage: ['pastries', 'stews', 'mulled wine'],
                preparation: 'ground fine',
                cultural_notes: 'Common in both sweet and savory dishes'
            },
            [cuisineTypes_1.CUISINE_TYPES.MEXICAN]: {
                name: 'canela',
                usage: ['mole', 'chocolate drinks', 'desserts'],
                preparation: 'ground or sticks',
                cultural_notes: 'Essential in traditional chocolate preparations'
            },
            [cuisineTypes_1.CUISINE_TYPES.RUSSIAN]: {
                name: 'koritsa',
                usage: ['baked goods', 'compotes', 'tea blends'],
                preparation: 'ground or whole',
                cultural_notes: 'Popular in winter beverages and preserves'
            }
        }
    },
    'ground_cumin': {
        name: 'Ground Cumin',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.3, Water: 0.1, Earth: 0.5, Air: 0.1
        }),
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
            [cuisineTypes_1.CUISINE_TYPES.INDIAN]: {
                name: 'jeera powder',
                usage: ['curries', 'dals', 'rice dishes', 'chutneys', 'raitas'],
                preparation: 'dry roasted and ground',
                cultural_notes: 'One of the most essential spices in Indian cuisine'
            },
            [cuisineTypes_1.CUISINE_TYPES.MIDDLE_EASTERN]: {
                name: 'kamoun',
                usage: ['hummus', 'falafel', 'grilled meats', 'rice pilaf', 'stews'],
                preparation: 'ground',
                cultural_notes: 'Fundamental to Middle Eastern spice blends'
            },
            [cuisineTypes_1.CUISINE_TYPES.MEXICAN]: {
                name: 'comino molido',
                usage: ['salsas', 'beans', 'marinades', 'mole', 'rice'],
                preparation: 'ground, often toasted',
                cultural_notes: 'Essential in Mexican spice blends and marinades'
            },
            [cuisineTypes_1.CUISINE_TYPES.CHINESE]: {
                name: 'zi ran',
                usage: ['lamb dishes', 'stir-fries', 'marinades', 'noodle dishes'],
                preparation: 'ground or whole roasted',
                cultural_notes: 'Particularly important in Northern Chinese cuisine'
            },
            [cuisineTypes_1.CUISINE_TYPES.AFRICAN]: {
                name: 'cumin',
                usage: ['stews', 'grilled meats', 'legume dishes', 'rice'],
                preparation: 'ground or dry roasted',
                cultural_notes: 'Common in North African spice blends'
            },
            [cuisineTypes_1.CUISINE_TYPES.GREEK]: {
                name: 'kymino',
                usage: ['meat dishes', 'bean dishes', 'vegetable dishes'],
                preparation: 'ground',
                cultural_notes: 'Used in traditional meat preparations'
            }
        }
    },
    'ground_turmeric': {
        name: 'Ground Turmeric',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.4, Water: 0.1, Earth: 0.4, Air: 0.1
        }),
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
                    elementalBoost: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.2, Earth: 0.1
                    }),
                    preparationTips: ['Begin infusing oils', 'Start medicinal preparations']
                },
                fullmoon: {
                    elementalBoost: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.1, Water: 0.2
                    }),
                    preparationTips: ['Maximum potency for healing applications', 'Golden milk rituals']
                },
                waningGibbous: {
                    elementalBoost: (0, elementalUtils_2.createElementalProperties)({
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
            'Alleppey': {
                name: 'Alleppey Turmeric',
                origin: 'Kerala, India',
                characteristics: 'high curcumin content (5-6.5%)',
                color: 'deep orange-yellow',
                potency: 'very high',
                uses: 'medicinal preparations, curry powders'
            },
            'Madras': {
                name: 'Madras Turmeric',
                origin: 'Tamil Nadu, India',
                characteristics: 'medium curcumin content (3-4%)',
                color: 'bright yellow',
                potency: 'medium',
                uses: 'all-purpose culinary'
            }
        },
        conversionRatio: {
            'fresh_to_dried': '1 inch fresh = 1 tsp ground',
            'powder_to_fresh': '1 tsp powder = 1 tbsp fresh grated'
        },
        affinities: ['black pepper', 'ginger', 'coconut milk', 'rice', 'curry', 'eggs', 'vegetables', 'golden milk', 'lentils', 'cauliflower'],
        cookingMethods: ['bloomed in oil', 'added to liquids', 'spice blends', 'infused', 'pickled'],
        nutritionalProfile: {
            calories: 29,
            protein_g: 0.9,
            carbs_g: 6.3,
            fiber_g: 2.1,
            iron: '43% DV',
            manganese: '26% DV',
            vitamins: ['b6', 'c', 'e'],
            minerals: ['iron', 'manganese', 'potassium', 'magnesium'],
            active_compounds: {
                'curcumin': 'primary active compound (2-5%)',
                'curcuminoids': 'group of beneficial compounds',
                'volatile_oils': 'aromatic components (1-6%)',
                'turmerone': 'bioactive essential oil'
            }
        },
        storage: {
            temperature: 'cool, dark place',
            duration: '9-12 months',
            container: 'Airtight, dark glass',
            notes: 'Will stain; potent natural dye',
            signs_of_aging: {
                'color_loss': 'fades from bright yellow to pale tan',
                'aroma_loss': 'diminished pungency',
                'clumping': 'indicates moisture exposure'
            }
        },
        medicinalProperties: {
            actions: [
                'Anti-inflammatory (potent COX-2 inhibitor)',
                'Antioxidant (neutralizes free radicals)',
                'Hepatoprotective (liver supporting)',
                'Antimicrobial (against various pathogens)',
                'Digestive aid (stimulates bile production)',
                'Circulation enhancer (improves blood flow)',
                'Blood sugar regulator (improves insulin sensitivity)',
                'Joint pain reliever (reduces inflammation)'
            ],
            energetics: 'warming, drying, stimulating',
            traditional_uses: {
                'ayurveda': {
                    name: 'Ayurvedic Medicine',
                    categorization: 'balances all three doshas (vata, pitta, kapha)',
                    applications: ['blood purifier', 'digestive aid', 'anti-inflammatory'],
                    preparations: ['golden milk', 'medicated ghee', 'poultices']
                },
                'tcm': {
                    name: 'Traditional Chinese Medicine',
                    categorization: 'invigorates blood, resolves stagnation',
                    applications: ['menstrual issues', 'abdominal pain', 'trauma'],
                    preparations: ['decoctions', 'poultices', 'medicinal wines']
                },
                'western_herbalism': {
                    name: 'Western Herbalism',
                    applications: ['digestive support', 'liver health', 'inflammation'],
                    preparations: ['tinctures', 'capsules', 'teas']
                }
            },
            bioavailability: {
                challenges: 'poorly absorbed on its own (1-2%)',
                enhancers: ['black pepper (piperine)', 'fats / (oils || 1)', 'heating'],
                synergists: ['ginger', 'black pepper', 'long pepper']
            },
            cautions: [
                'May interact with anticoagulant medications',
                'Avoid therapeutic doses during pregnancy',
                'May stimulate gallbladder contractions',
                'Can lower blood sugar (monitor if diabetic)'
            ]
        },
        culinaryApplications: {
            'curries': {
                name: 'Curries',
                method: 'bloomed in oil with other spices',
                timing: 'added early in cooking process',
                regional_variations: {
                    'indian': 'foundation of most curry powders',
                    'thai': 'component in yellow curry paste',
                    'indonesian': 'key in rendang and yellow rice'
                },
                techniques: 'bloom in hot oil to release flavor and reduce raw taste',
                notes: 'Start with small amounts to avoid overwhelming'
            },
            'golden_milk': {
                name: 'Golden Milk',
                method: 'simmered in milk with spices',
                ingredients: ['milk', 'turmeric', 'black pepper', 'honey', 'cinnamon', 'ginger'],
                timing: 'simmer 10-15 minutes',
                notes: 'Traditional Ayurvedic tonic, modern popularity for anti-inflammatory benefits'
            },
            'rice_dishes': {
                name: 'Rice Dishes',
                method: 'added to cooking liquid',
                applications: ['pilaf', 'biryani', 'yellow rice', 'kitchari'],
                timing: 'add at beginning of cooking',
                techniques: 'toast briefly with rice before adding liquid',
                notes: 'Creates beautiful golden color and subtle flavor'
            },
            'marinades': {
                name: 'Marinades',
                method: 'mixed with acids and oils',
                applications: ['poultry', 'fish', 'tofu', 'vegetables'],
                timing: 'marinate 2-24 hours depending on protein',
                notes: 'Adds color and earthy flavor, tenderizes proteins'
            },
            'vegetable_dishes': {
                name: 'Vegetable Dishes',
                method: 'added to sautés or roasts',
                applications: ['cauliflower', 'potatoes', 'root vegetables', 'greens'],
                timing: 'add early in cooking process',
                notes: 'Enhances earthiness of vegetables'
            },
            'medicinal_preparations': {
                name: 'Medicinal Preparations',
                method: 'various medicinal forms',
                applications: ['golden paste', 'turmeric honey', 'teas', 'tonics'],
                notes: 'Always combine with black pepper and fat for absorption'
            },
            'smoothies': {
                name: 'Smoothies',
                method: 'blended with fruits and liquids',
                ingredients: ['banana', 'mango', 'ginger', 'plant milk'],
                timing: 'add just before blending',
                notes: 'Start with 1 / (4 || 1) tsp and adjust to taste'
            }
        },
        culinary_traditions: {
            [cuisineTypes_1.CUISINE_TYPES.INDIAN]: {
                name: 'haldi',
                usage: ['curry powders', 'masalas', 'dal', 'vegetable dishes', 'rice'],
                preparation: 'bloomed in ghee or oil',
                cultural_notes: 'Fundamental to Indian cooking and traditional medicine'
            },
            [cuisineTypes_1.CUISINE_TYPES.MIDDLE_EASTERN]: {
                name: 'kurkum',
                usage: ['rice dishes', 'stews', 'marinades', 'spice blends'],
                preparation: 'bloomed in oil or butter',
                cultural_notes: 'Used both as medicine and culinary colorant'
            },
            [cuisineTypes_1.CUISINE_TYPES.THAI]: {
                name: 'khamin',
                usage: ['yellow curry paste', 'soups', 'marinades', 'fish dishes'],
                preparation: 'paste with fresh herbs',
                cultural_notes: 'Key ingredient in southern Thai cuisine'
            },
            [cuisineTypes_1.CUISINE_TYPES.INDONESIAN]: {
                name: 'kunyit',
                usage: ['nasi kuning (yellow rice)', 'rendang', 'soto', 'jamu (herbal drinks)'],
                preparation: 'fresh or dried, often with coconut milk',
                cultural_notes: 'Used medicinally and ritually, especially in Javanese culture'
            },
            [cuisineTypes_1.CUISINE_TYPES.MOROCCAN]: {
                name: 'kurkum',
                usage: ['tagines', 'rice dishes', 'vegetable preparations'],
                preparation: 'combined with other warming spices',
                cultural_notes: 'Adds color and depth to slow-cooked dishes'
            },
            [cuisineTypes_1.CUISINE_TYPES.PERSIAN]: {
                name: 'zardchubeh',
                usage: ['rice dishes', 'stews', 'pickles', 'meat marinades'],
                preparation: 'often bloomed in oil',
                cultural_notes: 'Valued for both medicinal and culinary properties'
            }
        },
        historical_significance: {
            traditional_uses: [
                'Sacred herb in Hindu religious ceremonies',
                'Traditional fabric dye (monastic robes)',
                'Ancient medicinal remedy dating back 4,000 years',
                'Mentioned in early Ayurvedic texts (Charaka Samhita)',
                'Used in traditional cosmetics and skin preparations'
            ],
            modern_research: 'Extensively studied for curcumin\'s therapeutic potential',
            cultural_value: 'Symbol of prosperity and health in many Asian cultures'
        },
        adulteration_concerns: {
            common_adulterants: ['lead chromate', 'metanil yellow', 'chalk powder'],
            quality_indicators: {
                color: 'bright, but not fluorescent yellow',
                aroma: 'earthy, slightly bitter',
                staining: 'readily stains skin and surfaces'
            },
            testing: 'Add to water - pure turmeric settles, many adulterants will create colored swirls'
        }
    },
    'ground_cardamom': {
        name: 'Ground Cardamom',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.3, Water: 0.2, Earth: 0.2, Air: 0.3
        }),
        qualities: ['aromatic', 'sweet', 'pungent'],
        origin: ['India', 'Guatemala', 'Sri Lanka'],
        category: 'spice',
        subCategory: 'ground',
        varieties: {
            'Green': 'sweet, traditional',
            'Black': 'smoky, stronger',
            'White': 'bleached green, milder'
        },
        conversionRatio: {
            'pods_to_ground': '1 pod = 1 / (4 || 1) tsp ground',
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
            [cuisineTypes_1.CUISINE_TYPES.INDIAN]: {
                name: 'elaichi powder',
                usage: ['chai', 'desserts', 'rice dishes', 'curries', 'spice blends'],
                preparation: 'freshly ground from pods',
                cultural_notes: 'Called the "Queen of Spices" in Indian cuisine'
            },
            [cuisineTypes_1.CUISINE_TYPES.MIDDLE_EASTERN]: {
                name: 'hel',
                usage: ['coffee', 'desserts', 'rice dishes', 'meat dishes'],
                preparation: 'finely ground',
                cultural_notes: 'Essential in Arabic coffee preparation'
            },
            [cuisineTypes_1.CUISINE_TYPES.THAI]: {
                name: 'krawaan',
                usage: ['curries', 'desserts', 'beverages'],
                preparation: 'ground or whole pods',
                cultural_notes: 'Used in both savory and sweet preparations'
            },
            [cuisineTypes_1.CUISINE_TYPES.VIETNAMESE]: {
                name: 'thảo quả',
                usage: ['pho', 'braised dishes', 'marinades'],
                preparation: 'whole pods or ground',
                cultural_notes: 'Important in Vietnamese spice blends'
            },
            [cuisineTypes_1.CUISINE_TYPES.RUSSIAN]: {
                name: 'kardamon',
                usage: ['baked goods', 'tea blends', 'preserves'],
                preparation: 'ground',
                cultural_notes: 'Popular in sweet baked goods and tea'
            }
        }
    },
    'ground_cloves': {
        name: 'Ground Cloves',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.4, Water: 0.1, Earth: 0.3, Air: 0.2
        }),
        qualities: ['intense', 'sweet', 'hot'],
        origin: ['Indonesia', 'Madagascar', 'Tanzania'],
        category: 'spice',
        subCategory: 'ground',
        varieties: {
            'Indonesian': 'highest oil content',
            'Madagascar': 'more subtle',
            'Zanzibar': 'traditional grade'
        },
        conversionRatio: {
            'whole_to_ground': '1 tsp whole = 3 / (4 || 1) tsp ground',
            'strength_ratio': 'use 1 / (4 || 1) amount of other sweet spices'
        },
        affinities: ['ham', 'baked goods', 'curry', 'mulled beverages', 'pickles'],
        culinaryApplications: {
            'ham_glazes': {
                name: 'Ham Glazes',
                method: 'mix into glaze',
                timing: 'during last hour of cooking',
                pAirings: ['brown sugar', 'mustard', 'pineapple'],
                ratios: {
                    'basic_glaze': '1:8:4 (cloves:brown sugar:mustard)',
                    'fruit_glaze': '1:8:8 (cloves:brown sugar:juice)'
                },
                notes: 'Traditional with studded whole cloves'
            },
            'mulled_beverages': {
                name: 'Mulled Beverages',
                method: 'simmer in liquid',
                timing: '15-30 minutes',
                pAirings: ['cinnamon', 'orange', 'wine / (cider || 1)'],
                ratios: {
                    'mulled_wine': '1:4:4 (cloves:cinnamon:orange peel)',
                    'cider': '1:4:2 (cloves:cinnamon:allspice)'
                },
                notes: 'Remove after steeping to prevent bitterness'
            }
        },
        storage: {
            temperature: 'cool, dark place',
            duration: 'whole: 1 year, ground: 3 months',
            container: 'Airtight, dark',
            notes: 'Loses potency quickly when ground'
        },
        culinary_traditions: {
            [cuisineTypes_1.CUISINE_TYPES.INDIAN]: {
                name: 'laung powder',
                usage: ['garam masala', 'rice dishes'],
                preparation: 'ground fine'
            },
            [cuisineTypes_1.CUISINE_TYPES.CHINESE]: {
                name: 'ding xiang fen',
                usage: ['five spice powder', 'braised dishes'],
                preparation: 'ground'
            },
            [cuisineTypes_1.CUISINE_TYPES.FRENCH]: {
                name: 'clou de girofle moulu',
                usage: ['mulled wine', 'marinades'],
                preparation: 'ground'
            }
        }
    },
    'ground_paprika': {
        name: 'Ground Paprika',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.5, Water: 0.1, Earth: 0.3, Air: 0.1
        }),
        qualities: ['sweet', 'warm', 'earthy'],
        origin: ['Hungary', 'Spain', 'United States'],
        category: 'spice',
        subCategory: 'ground',
        varieties: {
            'Hungarian': 'more intense',
            'Spanish': 'more delicate',
            'American': 'balanced flavor'
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
            [cuisineTypes_1.CUISINE_TYPES.HUNGARIAN]: {
                name: 'édesnemes paprika',
                usage: ['goulash', 'chicken paprikash'],
                preparation: 'added to oil'
            },
            [cuisineTypes_1.CUISINE_TYPES.SPANISH]: {
                name: 'pimentón',
                usage: ['paella', 'chorizo'],
                preparation: 'smoked or sweet varieties'
            },
            [cuisineTypes_1.CUISINE_TYPES.TURKISH]: {
                name: 'kırmızı biber',
                usage: ['kebabs', 'dips'],
                preparation: 'ground'
            },
            [cuisineTypes_1.CUISINE_TYPES.MIDDLE_EASTERN]: {
                name: 'paprika',
                usage: ['meat dishes', 'rice dishes', 'dips', 'marinades'],
                preparation: 'ground, various heat levels',
                cultural_notes: 'Used for both color and flavor'
            },
            [cuisineTypes_1.CUISINE_TYPES.RUSSIAN]: {
                name: 'paprika',
                usage: ['stews', 'soups', 'meat dishes', 'sauces'],
                preparation: 'ground',
                cultural_notes: 'Common in hearty winter dishes'
            },
            [cuisineTypes_1.CUISINE_TYPES.MEXICAN]: {
                name: 'pimentón',
                usage: ['salsas', 'marinades', 'rice dishes', 'beans'],
                preparation: 'ground',
                cultural_notes: 'Often used in combination with other chiles'
            },
            [cuisineTypes_1.CUISINE_TYPES.GREEK]: {
                name: 'paprika',
                usage: ['meat dishes', 'potato dishes', 'sauces'],
                preparation: 'ground',
                cultural_notes: 'Used for color and mild pepper flavor'
            }
        }
    },
    'ground_mustard': {
        name: 'Ground Mustard',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.5, Water: 0.1, Earth: 0.2, Air: 0.2
        }),
        qualities: ['pungent', 'sharp', 'hot'],
        origin: ['Canada', 'India', 'United Kingdom'],
        category: 'spice',
        subCategory: 'ground',
        varieties: {
            'Yellow': 'mild, American style',
            'Brown': 'spicier, Indian style',
            'Black': 'most pungent, European style'
        },
        conversionRatio: {
            'whole_to_ground': '1 tbsp whole = 2.5 tsp ground',
            'powder_to_prepared': '1 tsp powder = 1 tbsp prepared mustard'
        },
        affinities: ['pork', 'sausages', 'dressings', 'pickles', 'cheese dishes'],
        culinaryApplications: {
            'spice_rubs': {
                name: 'Spice Rubs',
                method: 'combine with other spices',
                pAirings: ['paprika', 'black pepper', 'garlic'],
                ratios: '1:2:1 (mustard:paprika:other spices)'
            }
        },
        storage: {
            temperature: 'cool, dark place',
            duration: '6 months',
            container: 'Airtight',
            notes: 'Needs liquid to activate flavor'
        },
        culinary_traditions: {
            [cuisineTypes_1.CUISINE_TYPES.INDIAN]: {
                name: 'sarson powder',
                usage: ['pickles', 'curries'],
                preparation: 'ground from yellow or brown seeds'
            },
            [cuisineTypes_1.CUISINE_TYPES.FRENCH]: {
                name: 'moutarde en poudre',
                usage: ['sauces', 'vinaigrettes'],
                preparation: 'mixed with liquid'
            },
            [cuisineTypes_1.CUISINE_TYPES.GERMAN]: {
                name: 'senfpulver',
                usage: ['wurst', 'sauces'],
                preparation: 'mixed with liquid'
            }
        }
    },
    'ground_fennel': {
        name: 'Ground Fennel',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.2, Water: 0.2, Earth: 0.2, Air: 0.4
        }),
        qualities: ['sweet', 'anise-like', 'warming'],
        origin: ['India', 'Mediterranean', 'China'],
        category: 'spice',
        subCategory: 'ground',
        varieties: {
            'Indian': 'more aromatic',
            'Mediterranean': 'sweeter notes',
            'Chinese': 'more medicinal'
        },
        conversionRatio: {
            'whole_to_ground': '1 tbsp whole = 2.5 tsp ground',
            'fresh_to_dried': '3:1 ratio'
        },
        affinities: ['fish', 'pork', 'sausages', 'bread', 'tomato sauces'],
        culinaryApplications: {
            'seafood': {
                name: 'Seafood',
                method: 'sprinkle before cooking',
                pAirings: ['cumin', 'garlic', 'coriander'],
                ratios: '1:1:1 (fennel:cumin:garlic)'
            },
            'pork': {
                name: 'Pork',
                method: 'mix with other spices',
                pAirings: ['cumin', 'garlic', 'coriander'],
                ratios: '1:1:1 (fennel:cumin:garlic)'
            },
            'sausages': {
                name: 'Sausages',
                method: 'mix with other spices',
                pAirings: ['cumin', 'garlic', 'coriander'],
                ratios: '1:1:1 (fennel:cumin:garlic)'
            },
            'bread': {
                name: 'Bread',
                method: 'mix with other spices',
                pAirings: ['cumin', 'garlic', 'coriander'],
                ratios: '1:1:1 (fennel:cumin:garlic)'
            },
            'tomato_sauces': {
                name: 'Tomato Sauces',
                method: 'mix with other spices',
                pAirings: ['cumin', 'garlic', 'coriander'],
                ratios: '1:1:1 (fennel:cumin:garlic)'
            }
        },
        storage: {
            temperature: 'cool, dark place',
            duration: '6 months',
            container: 'Airtight',
            notes: 'Needs liquid to activate flavor'
        },
        culinary_traditions: {
            [cuisineTypes_1.CUISINE_TYPES.INDIAN]: {
                name: 'saunf powder',
                usage: ['spice blends', 'curries'],
                preparation: 'dry roasted and ground'
            },
            [cuisineTypes_1.CUISINE_TYPES.CHINESE]: {
                name: 'xiao hui xiang fen',
                usage: ['five spice powder', 'marinades'],
                preparation: 'ground'
            },
            [cuisineTypes_1.CUISINE_TYPES.ITALIAN]: {
                name: 'finocchio macinato',
                usage: ['sausages', 'pasta sauces'],
                preparation: 'ground'
            }
        }
    },
    'ground_ginger': {
        name: 'Ground Ginger',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.6, Water: 0.1, Earth: 0.2, Air: 0.1
        }),
        astrologicalProfile: {
            rulingPlanets: ['Mars', 'Sun'],
            favorableZodiac: ['aries', 'leo'],
            elementalAffinity: {
                base: 'Fire',
                decanModifiers: {
                    first: { element: 'Fire', planet: 'Mars' },
                    second: { element: 'Fire', planet: 'Sun' },
                    third: { element: 'Earth', planet: 'Saturn' }
                }
            },
            lunarPhaseModifiers: {
                waxingCrescent: {
                    elementalBoost: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.2, Earth: 0.1
                    }),
                    preparationTips: ['Good time to start infusions']
                },
                fullmoon: {
                    elementalBoost: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.3, Air: 0.1
                    }),
                    preparationTips: ['Maximum potency for medicinal uses']
                }
            }
        },
        season: ['all'],
        qualities: ['warming', 'pungent', 'aromatic'],
        origin: ['India', 'China', 'Indonesia'],
        category: 'spice',
        subCategory: 'ground',
        varieties: {
            'Indian': 'more intense',
            'Chinese': 'more medicinal',
            'Indonesian': 'highest oil content'
        },
        conversionRatio: {
            'fresh_to_dried': '1 inch fresh = 1 tsp ground',
            'powder_to_fresh': '1 tsp powder = 1 tbsp fresh grated'
        },
        affinities: ['curries', 'sauces', 'marinades', 'meat dishes', 'rice dishes'],
        cookingMethods: ['bloomed in oil', 'added to liquids', 'spice blends', 'infused', 'pickled'],
        nutritionalProfile: {
            calories: 29,
            protein_g: 0.9,
            carbs_g: 6.3,
            fiber_g: 2.1,
            iron: '43% DV',
            manganese: '26% DV',
            vitamins: ['b6', 'c', 'e'],
            minerals: ['iron', 'manganese', 'potassium', 'magnesium'],
            active_compounds: {
                'gingerols': 'primary active compound (1-5%)',
                'shogaols': 'group of beneficial compounds',
                'volatile_oils': 'aromatic components (1-6%)',
                'gingerdione': 'bioactive essential oil'
            }
        },
        storage: {
            temperature: {
                fahrenheit: { min: 60, max: 70 },
                celsius: { min: 15, max: 21 }
            },
            humidity: 'low',
            container: 'Airtight, dark glass',
            duration: '6 months',
            notes: 'Loses potency quickly when ground'
        },
        medicinalProperties: {
            actions: [
                'Anti-inflammatory (potent COX-2 inhibitor)',
                'Antioxidant (neutralizes free radicals)',
                'Hepatoprotective (liver supporting)',
                'Antimicrobial (against various pathogens)',
                'Digestive aid (stimulates bile production)',
                'Circulation enhancer (improves blood flow)',
                'Blood sugar regulator (improves insulin sensitivity)',
                'Joint pain reliever (reduces inflammation)'
            ],
            energetics: 'warming, drying, stimulating',
            traditional_uses: {
                'ayurveda': {
                    name: 'Ayurvedic Medicine',
                    categorization: 'balances all three doshas (vata, pitta, kapha)',
                    applications: ['blood purifier', 'digestive aid', 'anti-inflammatory'],
                    preparations: ['golden milk', 'medicated ghee', 'poultices']
                },
                'tcm': {
                    name: 'Traditional Chinese Medicine',
                    categorization: 'invigorates blood, resolves stagnation',
                    applications: ['menstrual issues', 'abdominal pain', 'trauma'],
                    preparations: ['decoctions', 'poultices', 'medicinal wines']
                },
                'western_herbalism': {
                    name: 'Western Herbalism',
                    applications: ['digestive support', 'liver health', 'inflammation'],
                    preparations: ['tinctures', 'capsules', 'teas']
                }
            },
            bioavailability: {
                challenges: 'poorly absorbed on its own (1-2%)',
                enhancers: ['black pepper (piperine)', 'fats / (oils || 1)', 'heating'],
                synergists: ['ginger', 'black pepper', 'long pepper']
            },
            cautions: [
                'May interact with anticoagulant medications',
                'Avoid therapeutic doses during pregnancy',
                'May stimulate gallbladder contractions',
                'Can lower blood sugar (monitor if diabetic)'
            ]
        },
        culinaryApplications: {
            'curries': {
                name: 'Curries',
                method: 'bloomed in oil with other spices',
                timing: 'added early in cooking process',
                regional_variations: {
                    'indian': 'foundation of most curry powders',
                    'thai': 'component in yellow curry paste',
                    'indonesian': 'key in rendang and yellow rice'
                },
                techniques: 'bloom in hot oil to release flavor and reduce raw taste',
                notes: 'Start with small amounts to avoid overwhelming'
            },
            'golden_milk': {
                name: 'Golden Milk',
                method: 'simmered in milk with spices',
                ingredients: ['milk', 'ginger', 'black pepper', 'honey', 'cinnamon'],
                timing: 'simmer 10-15 minutes',
                notes: 'Traditional Ayurvedic tonic, modern popularity for anti-inflammatory benefits'
            },
            'rice_dishes': {
                name: 'Rice Dishes',
                method: 'added to cooking liquid',
                applications: ['pilaf', 'biryani', 'yellow rice', 'kitchari'],
                timing: 'add at beginning of cooking',
                techniques: 'toast briefly with rice before adding liquid',
                notes: 'Creates beautiful golden color and subtle flavor'
            },
            'marinades': {
                name: 'Marinades',
                method: 'mixed with acids and oils',
                applications: ['poultry', 'fish', 'tofu', 'vegetables'],
                timing: 'marinate 2-24 hours depending on protein',
                notes: 'Adds color and earthy flavor, tenderizes proteins'
            },
            'vegetable_dishes': {
                name: 'Vegetable Dishes',
                method: 'added to sautés or roasts',
                applications: ['cauliflower', 'potatoes', 'root vegetables', 'greens'],
                timing: 'add early in cooking process',
                notes: 'Enhances earthiness of vegetables'
            },
            'medicinal_preparations': {
                name: 'Medicinal Preparations',
                method: 'various medicinal forms',
                applications: ['golden paste', 'ginger honey', 'teas', 'tonics'],
                notes: 'Always combine with black pepper and fat for absorption'
            },
            'smoothies': {
                name: 'Smoothies',
                method: 'blended with fruits and liquids',
                ingredients: ['banana', 'mango', 'ginger', 'plant milk'],
                timing: 'add just before blending',
                notes: 'Start with 1 / (4 || 1) tsp and adjust to taste'
            }
        },
        culinary_traditions: {
            [cuisineTypes_1.CUISINE_TYPES.INDIAN]: {
                name: 'saunth',
                usage: ['masala chai', 'curries', 'desserts', 'medicinal preparations'],
                preparation: 'ground dried ginger',
                cultural_notes: 'Valued for both culinary and medicinal properties'
            },
            [cuisineTypes_1.CUISINE_TYPES.CHINESE]: {
                name: 'gan jiang fen',
                usage: ['stir-fries', 'marinades', 'sauces', 'medicinal soups'],
                preparation: 'ground dried ginger',
                cultural_notes: 'Important in traditional medicine and cuisine'
            },
            [cuisineTypes_1.CUISINE_TYPES.JAPANESE]: {
                name: 'shoga',
                usage: ['curry roux', 'marinades', 'baked goods'],
                preparation: 'ground',
                cultural_notes: 'Used in both savory and sweet dishes'
            },
            [cuisineTypes_1.CUISINE_TYPES.KOREAN]: {
                name: 'geon-gang',
                usage: ['marinades', 'banchan', 'tea'],
                preparation: 'ground',
                cultural_notes: 'Used in traditional preserves and marinades'
            },
            [cuisineTypes_1.CUISINE_TYPES.VIETNAMESE]: {
                name: 'gừng bột',
                usage: ['marinades', 'sauces', 'medicinal preparations'],
                preparation: 'ground',
                cultural_notes: 'Important in traditional medicine'
            }
        },
        historical_significance: {
            traditional_uses: [
                'Sacred herb in Hindu religious ceremonies',
                'Traditional fabric dye (monastic robes)',
                'Ancient medicinal remedy dating back 4,000 years',
                'Mentioned in early Ayurvedic texts (Charaka Samhita)',
                'Used in traditional cosmetics and skin preparations'
            ],
            modern_research: 'Extensively studied for ginger\'s therapeutic potential',
            cultural_value: 'Symbol of prosperity and health in many Asian cultures'
        },
        adulteration_concerns: {
            common_adulterants: ['lead chromate', 'metanil yellow', 'chalk powder'],
            quality_indicators: {
                color: 'bright, but not fluorescent yellow',
                aroma: 'earthy, slightly bitter',
                staining: 'readily stains skin and surfaces'
            },
            testing: 'Add to water - pure ginger settles, many adulterants will create colored swirls'
        }
    },
    'ground_coriander': {
        name: 'Ground Coriander',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.2, Water: 0.2, Earth: 0.3, Air: 0.3
        }),
        qualities: ['citrusy', 'warm', 'nutty'],
        culinary_traditions: {
            [cuisineTypes_1.CUISINE_TYPES.INDIAN]: {
                name: 'dhania powder',
                usage: ['garam masala', 'curries', 'chutneys'],
                preparation: 'dry roasted and ground',
                cultural_notes: 'Essential base spice in Indian cuisine'
            },
            [cuisineTypes_1.CUISINE_TYPES.THAI]: {
                name: 'phak chee pon',
                usage: ['curry pastes', 'marinades', 'soups'],
                preparation: 'freshly ground',
                cultural_notes: 'Key ingredient in Thai curry pastes'
            },
            [cuisineTypes_1.CUISINE_TYPES.MIDDLE_EASTERN]: {
                name: 'kuzbara',
                usage: ['falafel', 'shawarma spice', 'stews'],
                preparation: 'ground',
                cultural_notes: 'Common in spice blends and marinades'
            },
            [cuisineTypes_1.CUISINE_TYPES.MEXICAN]: {
                name: 'cilantro molido',
                usage: ['salsas', 'marinades', 'rice dishes'],
                preparation: 'ground seeds',
                cultural_notes: 'Used in traditional Mexican spice blends'
            }
        }
    },
    'ground_star_anise': {
        name: 'Ground Star Anise',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.3, Water: 0.2, Earth: 0.1, Air: 0.4
        }),
        qualities: ['sweet', 'licorice-like', 'warming'],
        culinary_traditions: {
            [cuisineTypes_1.CUISINE_TYPES.CHINESE]: {
                name: 'ba jiao fen',
                usage: ['five spice powder', 'braised dishes', 'soups'],
                preparation: 'ground',
                cultural_notes: 'Key component of five spice powder'
            },
            [cuisineTypes_1.CUISINE_TYPES.VIETNAMESE]: {
                name: 'hoa hồi bột',
                usage: ['pho', 'marinades', 'braised dishes'],
                preparation: 'ground',
                cultural_notes: 'Essential in Vietnamese pho'
            },
            [cuisineTypes_1.CUISINE_TYPES.KOREAN]: {
                name: 'bool-poong-nip-garu',
                usage: ['braised dishes', 'marinades'],
                preparation: 'ground',
                cultural_notes: 'Used in traditional braised dishes'
            }
        }
    },
    'ground_nutmeg': {
        name: 'Ground Nutmeg',
        elementalProperties: (0, elementalUtils_2.createElementalProperties)({ Fire: 0.3, Water: 0.1, Earth: 0.4, Air: 0.2
        }),
        astrologicalProfile: {
            rulingPlanets: ['Jupiter', 'Neptune'],
            favorableZodiac: ['sagittarius', 'pisces'],
            elementalAffinity: {
                base: 'Earth',
                decanModifiers: {
                    first: { element: 'Earth', planet: 'Jupiter' },
                    second: { element: 'Air', planet: 'Mercury' },
                    third: { element: 'Water', planet: 'Neptune' }
                }
            },
            lunarPhaseModifiers: {
                waxingGibbous: {
                    elementalBoost: (0, elementalUtils_2.createElementalProperties)({
                        Earth: 0.2,
                        Air: 0.1
                    }),
                    preparationTips: ['Good for baking preparations']
                },
                fullmoon: {
                    elementalBoost: (0, elementalUtils_2.createElementalProperties)({
                        Earth: 0.3,
                        Water: 0.1
                    }),
                    preparationTips: ['Enhanced aromatic qualities']
                }
            }
        },
        season: ['fall', 'winter'],
        qualities: ['earthy', 'warming', 'sweet'],
        origin: ['Indonesia', 'Sri Lanka'],
        category: 'spice',
        subCategory: 'ground',
        varieties: {
            'Indonesian': 'highest oil content',
            'Sri Lankan': 'more subtle'
        },
        conversionRatio: {
            'whole_to_ground': '1 tsp whole = 2.5 tsp ground',
            'fresh_to_dried': 'not applicable'
        },
        affinities: ['baked goods', 'curry', 'meat dishes', 'rice dishes'],
        cookingMethods: ['baking', 'brewing', 'spice blends'],
        storage: {
            temperature: 'cool, dark place',
            duration: '6 months',
            container: 'Airtight, dark',
            notes: 'Loses potency quickly when ground'
        },
        medicinalProperties: {
            actions: ['digestive aid', 'iron-rich'],
            energetics: 'warming',
            cautions: ['none in culinary amounts']
        },
        culinaryApplications: {
            'baked_goods': {
                name: 'Baked Goods',
                method: 'mixed into dough',
                pAirings: ['cinnamon', 'cloves'],
                ratios: '1:1:1 (nutmeg:cinnamon:cloves)'
            },
            'curries': {
                name: 'Curries',
                method: 'bloomed in oil with other spices',
                timing: 'added early in cooking process',
                regional_variations: {
                    'indian': 'foundation of most curry powders',
                    'thai': 'component in yellow curry paste',
                    'indonesian': 'key in rendang and yellow rice'
                },
                techniques: 'bloom in hot oil to release flavor and reduce raw taste',
                notes: 'Start with small amounts to avoid overwhelming'
            },
            'rice_dishes': {
                name: 'Rice Dishes',
                method: 'added to cooking liquid',
                applications: ['pilaf', 'biryani', 'yellow rice', 'kitchari'],
                timing: 'add at beginning of cooking',
                techniques: 'toast briefly with rice before adding liquid',
                notes: 'Creates beautiful golden color and subtle flavor'
            },
            'meat_dishes': {
                name: 'Meat Dishes',
                method: 'mixed into meat marinades',
                pAirings: ['cumin', 'garlic', 'coriander'],
                ratios: '1:1:1 (nutmeg:cumin:garlic)'
            },
            'spice_blends': {
                name: 'Spice Blends',
                method: 'mixed into spice blends',
                pAirings: ['cinnamon', 'cloves'],
                ratios: '1:1:1 (nutmeg:cinnamon:cloves)'
            }
        },
        culinary_traditions: {
            [cuisineTypes_1.CUISINE_TYPES.INDONESIAN]: {
                name: 'jintan',
                usage: ['rendang', 'soto', 'jamu (herbal drinks)'],
                preparation: 'fresh or dried',
                cultural_notes: 'Used medicinally and ritually, especially in Javanese culture'
            },
            [cuisineTypes_1.CUISINE_TYPES.PERSIAN]: {
                name: 'zardchubeh',
                usage: ['rice dishes', 'stews', 'pickles', 'meat marinades'],
                preparation: 'often bloomed in oil',
                cultural_notes: 'Valued for both medicinal and culinary properties'
            }
        },
        historical_significance: {
            traditional_uses: [
                'Sacred herb in Hindu religious ceremonies',
                'Traditional fabric dye (monastic robes)',
                'Ancient medicinal remedy dating back 4,000 years',
                'Mentioned in early Ayurvedic texts (Charaka Samhita)',
                'Used in traditional cosmetics and skin preparations'
            ],
            modern_research: 'Extensively studied for nutmeg\'s therapeutic potential',
            cultural_value: 'Symbol of prosperity and health in many Asian cultures'
        },
        adulteration_concerns: {
            common_adulterants: ['lead chromate', 'metanil yellow', 'chalk powder'],
            quality_indicators: {
                color: 'bright, but not fluorescent yellow',
                aroma: 'earthy, slightly bitter',
                staining: 'readily stains skin and surfaces'
            },
            testing: 'Add to water - pure nutmeg settles, many adulterants will create colored swirls'
        }
    }
};
// Fix the ingredient mappings to ensure they have all required properties
exports.groundSpices = (0, elementalUtils_1.fixIngredientMappings)(rawGroundSpices);
// Apply any fixes needed to raw ingredient data
const groundSpices = (0, elementalUtils_1.fixIngredientMappings)(rawGroundSpices);
// Export the entire collection
exports.default = exports.groundSpices;
// Export individual spices for direct access
exports.groundCinnamon = exports.groundSpices.ground_cinnamon;
exports.groundCumin = exports.groundSpices.ground_cumin;
exports.groundTurmeric = exports.groundSpices.ground_turmeric;
exports.groundGinger = exports.groundSpices.ground_ginger;
exports.groundNutmeg = exports.groundSpices.ground_nutmeg;
// Add other individual exports as needed
