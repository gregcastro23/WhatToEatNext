'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.chia = void 0;
const elementalUtils_1 = require('../../../../utils/elementalUtils');
const elementalUtils_2 = require('../../../../utils/elemental/elementalUtils');
const rawChia = {
  chia: {
    name: 'Chia Seeds',
    elementalProperties: (0, elementalUtils_2.createElementalProperties)({
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25,
    }),
    astrologicalProfile: {
      rulingPlanets: ['Neptune', 'Moon'],
      elementalAffinity: {
        base: 'Water',
        secondary: 'Earth',
      },
    },
    qualities: ['gelatinous', 'hydrophilic', 'versatile', 'gluten-free', 'omega-rich'],
    category: 'pseudo_grain',
    origin: ['Central America', 'Mexico', 'Guatemala'],
    varieties: {},
    preparation: {
      fresh: {
        duration: 'No cooking required, soak 10-20 minutes for gel',
        storage: 'Refrigerate prepared chia for 5-7 days',
        tips: [
          'Use 1:6 chia to liquid ratio for gel',
          'Stir after adding to liquid to prevent clumping',
          'Can be used directly in baking without soaking',
        ],
      },
      methods: ['soaked', 'ground', 'raw sprinkled', 'incorporated into batter'],
    },
    storage: {
      container: 'Airtight container',
      duration: 'Up to 2 years (dry), 5-7 days (prepared)',
      temperature: 'Cool, dark place (dry), refrigerated (prepared)',
      notes: 'High oil content, but surprisingly shelf-stable when kept dry',
    },
    pAiringRecommendations: {
      complementary: ['fruits', 'yogurt', 'oats', 'honey', 'cinnamon', 'almond milk', 'coconut'],
      contrasting: ['citrus', 'spices', 'chocolate'],
      toAvoid: ['high-acid marinades that might break down the gel structure'],
    },
  },
};
exports.chia = (0, elementalUtils_1.fixIngredientMappings)(rawChia);
