"use strict";
import { fixIngredientMappings } from '../../../../utils/elementalUtils';
import { createElementalProperties } from '../../../../utils/elemental/elementalUtils';

const rawBuckwheat = {
    'buckwheat': {
        name: 'Buckwheat',
        elementalProperties: createElementalProperties({
            Earth: 0.4,
            Fire: 0.3,
            Air: 0.2,
            Water: 0.1
        }),
        astrologicalProfile: {
            rulingPlanets: ['Saturn', 'Mars'],
            favorableZodiac: ['capricorn', 'aries'],
            elementalAffinity: {
                base: 'Earth',
                decanModifiers: {
                    first: { element: 'Earth', planet: 'Saturn' },
                    second: { element: 'Fire', planet: 'Mars' },
                    third: { element: 'Air', planet: 'Mercury' }
                }
            },
            lunarPhaseModifiers: {
                newmoon: {
                    elementalBoost: createElementalProperties({
                        Earth: 0.2,
                        Fire: 0.1
                    }),
                    preparationTips: ['Good time for sprouting', 'Mindful preparation']
                },
                fullmoon: {
                    elementalBoost: createElementalProperties({
                        Earth: 0.1,
                        Fire: 0.2
                    }),
                    preparationTips: ['Enhanced nutrient absorption', 'Good for hearty dishes']
                }
            }
        },
        qualities: ['earthy', 'robust', 'gluten-free', 'hearty', 'nutty'],
        category: 'pseudo_grain',
        origin: ['Central Asia', 'Eastern Europe', 'Russia'],
        season: ['all'],
        varieties: {
            'groats': {
                appearance: 'Light brown to greenish pyramidal seeds',
                texture: 'Firm, slightly chewy when cooked',
                flavor: 'earthy, nutty flavor',
                uses: 'Kasha, porridge, pilaf, stuffing'
            },
            'flour': {
                appearance: 'Gray-purple fine powder',
                texture: 'Dense in baked goods',
                flavor: 'Distinctive earthy flavor',
                uses: 'Blinis, soba noodles, pancakes, bread'
            }
        },
        preparation: {
            fresh: {
                duration: '15-20 minutes (raw), 10-15 minutes (roasted)',
                storage: 'Refrigerate in sealed container for 2-3 days',
                tips: [
                    'Rinse before cooking',
                    'Toast raw buckwheat for nuttier flavor',
                    'Use 1:2 buckwheat to water ratio'
                ]
            },
            methods: [
                'boiled', 'toasted', 'ground into flour', 'sprouted'
            ]
        },
        storage: {
            container: 'Airtight container',
            duration: 'Up to 2 months (raw), 3-4 months (roasted), 2-3 days (cooked)',
            temperature: 'Cool, dark place (dry), refrigerated (cooked)',
            notes: 'Raw buckwheat has higher oil content and can spoil faster than roasted'
        },
        pAiringRecommendations: {
            complementary: ['mushrooms', 'onions', 'herbs', 'butter', 'eggs', 'cabbage'],
            contrasting: ['light fruits', 'yogurt', 'honey'],
            toAvoid: ['subtle flavors that would be overpowered']
        }
    }
};

// Apply any fixes needed to raw ingredient data
const buckwheat = fixIngredientMappings(rawBuckwheat);

// Export the entire collection
export default buckwheat;

// Export individual item for direct access
export const buckwheatGrain = buckwheat.buckwheat;
