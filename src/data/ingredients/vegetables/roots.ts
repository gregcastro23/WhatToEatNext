export const rootVegetables: Record<string, IngredientMapping> = {
  'heirloom_carrot': {
    elementalProperties: { Earth: 0.5, Fire: 0.3, Water: 0.1, Air: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Saturn'],
      favorableZodiac: ['taurus', 'virgo', 'capricorn'],
      elementalAffinity: {
        base: 'Earth',
        decanModifiers: {
          first: { element: 'Earth', planet: 'Venus' },
          second: { element: 'Fire', planet: 'Sun' },
          third: { element: 'Air', planet: 'Mercury' }
        }
      }
    },
    // ... rest of properties ...
  },
  'black_radish': {
    elementalProperties: { Earth: 0.6, Fire: 0.25, Air: 0.1, Water: 0.05 },
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mars'],
      favorableZodiac: ['scorpio', 'capricorn', 'aquarius'],
      elementalAffinity: {
        base: 'Earth',
        decanModifiers: {
          first: { element: 'Fire', planet: 'Mars' },
          second: { element: 'Earth', planet: 'Saturn' },
          third: { element: 'Air', planet: 'Uranus' }
        }
      }
    }
  },
  'carrot': {
    elementalProperties: { Earth: 0.5, Fire: 0.3, Water: 0.1, Air: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Moon'],
      favorableZodiac: ['Taurus', 'Cancer'],
      elementalAffinity: {
        base: 'Earth',
        decanModifiers: {
          first: { element: 'Earth', planet: 'Venus' },
          second: { element: 'Water', planet: 'Moon' },
          third: { element: 'Air', planet: 'Mercury' }
        }
      },
      lunarPhaseModifiers: {
        newMoon: {
          elementalBoost: { Earth: 0.1, Water: 0.1 },
          preparationTips: ['Best for juicing']
        },
        fullMoon: {
          elementalBoost: { Water: 0.2 },
          preparationTips: ['Ideal for roasted dishes']
        }
      }
    },
    // ... rest of properties ...
  },
  // ... other root vegetables ...
}; 