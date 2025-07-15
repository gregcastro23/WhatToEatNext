"use strict";
import { fixIngredientMappings } from '../../../../utils/elementalUtils';
import { createElementalProperties } from '../../../../utils/elemental/elementalUtils';

const rawAmaranth = {
    'amaranth': {
        name: 'Amaranth',
        elementalProperties: createElementalProperties({
            Earth: 0.5,
            Fire: 0.3,
            Water: 0.1,
            Air: 0.1
        }),
        astrologicalProfile: {
            rulingPlanets: ['Mars', 'Venus'],
            favorableZodiac: ['aries', 'taurus'],
            elementalAffinity: {
                base: 'Earth',
                decanModifiers: {
                    first: { element: 'Earth', planet: 'Venus' },
                    second: { element: 'Fire', planet: 'Mars' },
                    third: { element: 'Fire', planet: 'Sun' }
                }
            },
            lunarPhaseModifiers: {
                newmoon: {
                    elementalBoost: createElementalProperties({
                        Earth: 0.2,
                        Fire: 0.1
                    }),
                    preparationTips: ['Begin sprouting process', 'Mindful cooking with minimal seasonings']
                },
                fullmoon: {
                    elementalBoost: createElementalProperties({
                        Earth: 0.1,
                        Fire: 0.2
                    }),
                    preparationTips: ['Perfect for celebratory dishes', 'Enhanced nutrient absorption']
                }
            }
        },
        qualities: ['nutty', 'earthy', 'gelatinous', 'gluten-free', 'protein-rich'],
        category: 'pseudo_grain',
        origin: ['Central America', 'Mexico', 'South America'],
        season: ['all'],
        varieties: {
            'regular': {
                appearance: 'Tiny cream-colored seeds',
                texture: 'Sticky when cooked, gelatinous',
                flavor: 'earthy, nutty, slightly peppery',
                uses: 'Porridges, binding agent in dishes, flour for baking'
            }
        },
        preparation: {
            fresh: {
                duration: '20-25 minutes',
                storage: 'Refrigerate in sealed container for 2-3 days',
                tips: [
                    'Use 1:3 amaranth to liquid ratio',
                    'Simmer until liquid is absorbed',
                    'Consider mixing with other grains as it can be sticky on its own'
                ]
            },
            methods: [
                'boiled', 'simmered', 'popped (dry in pan)', 'ground into flour'
            ]
        },
        storage: {
            container: 'Airtight container',
            duration: 'Up to 6 months (dry), 2-3 days (cooked)',
            temperature: 'Cool, dark place (dry), refrigerated (cooked)',
            notes: 'High oil content makes it spoil faster than other grains'
        },
        pAiringRecommendations: {
            complementary: ['cinnamon', 'honey', 'fruits', 'mild cheeses', 'vegetables'],
            contrasting: ['herbs', 'light citrus'],
            toAvoid: ['strong acidic ingredients that might prevent proper cooking']
        }
    }
};

// Apply any fixes needed to raw ingredient data
const amaranth = fixIngredientMappings(rawAmaranth);

// Export the entire collection
export default amaranth;

// Export individual item for direct access
export const amaranthGrain = amaranth.amaranth;
