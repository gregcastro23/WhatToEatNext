"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flaxseed = void 0;
const elementalUtils_1 = require("../../../../utils/elemental/elementalUtils");
const elementalUtils_2 = require("../../../../utils/elementalUtils");
const rawFlaxseed = {
    'flaxseed': {
        name: 'Flaxseed',
        elementalProperties: (0, elementalUtils_1.createElementalProperties)({ Fire: 0.2, Water: 0.2, Earth: 0.5, Air: 0.1
        }),
        astrologicalProfile: {
            rulingPlanets: ['Moon', 'Venus'],
            elementalAffinity: {
                base: 'Water',
                secondary: 'Air'
            }
        },
        qualities: ['gelatinous', 'omega-rich', 'nutty', 'gluten-free', 'binding'],
        category: 'pseudo_grain',
        origin: ['Middle East', 'Mediterranean', 'widely cultivated worldwide'],
        varieties: {
            'golden': {
                appearance: 'Small yellow seeds',
                texture: 'Similar to brown',
                flavor: 'Milder, lighter flavor than brown',
                uses: 'Visually appealing in lighter dishes, often more expensive'
            },
            'meal': {
                appearance: 'Ground powder',
                texture: 'Fine to coarse depending on grind',
                flavor: 'Nutty, can become rancid quickly',
                uses: 'Baking, smoothies, egg substitute'
            }
        },
        preparation: {
            fresh: {
                duration: 'No cooking required, ground for best nutrition',
                storage: 'Refrigerate ground flaxseed for up to 2 weeks',
                tips: [
                    'Grind whole seeds for best nutrition absorption',
                    'Mix with water (1:3 ratio) for egg substitute',
                    'Add to dishes after cooking to preserve nutrients'
                ]
            },
            methods: [
                'ground', 'soaked', 'incorporated into batter', 'sprinkled whole'
            ]
        },
        storage: {
            container: 'Airtight container',
            duration: 'Up to 1 year (whole seeds), 1-2 weeks (ground)',
            temperature: 'Cool, dark place (whole), refrigerated or frozen (ground)',
            notes: 'High oil content means ground flaxseed spoils quickly'
        },
        pAiringRecommendations: {
            complementary: ['oats', 'yogurt', 'smoothies', 'breads', 'muffins', 'granola'],
            contrasting: ['fruits', 'honey', 'maple syrup'],
            toAvoid: ['dishes requiring long cooking that might damage omega oils']
        }
    }
};
exports.flaxseed = (0, elementalUtils_2.fixIngredientMappings)(rawFlaxseed);
