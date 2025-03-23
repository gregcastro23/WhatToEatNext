export const meats: Record<string, IngredientMapping> = {
  'beef': {
    elementalProperties: { Earth: 0.6, Fire: 0.3, Water: 0.1, Air: 0 },
    astrologicalProfile: {
      rulingPlanets: ['Mars', 'Saturn'],
      favorableZodiac: ['Aries', 'Capricorn'],
      elementalAffinity: {
        base: 'Earth',
        decanModifiers: {
          first: { element: 'Earth', planet: 'Mars' },
          second: { element: 'Fire', planet: 'Saturn' },
          third: { element: 'Water', planet: 'Pluto' }
        }
      },
      lunarPhaseModifiers: {
        waxingGibbous: {
          elementalBoost: { Earth: 0.1, Fire: 0.1 },
          preparationTips: ['Best for grilling']
        },
        fullMoon: {
          elementalBoost: { Fire: 0.2 },
          preparationTips: ['Ideal for slow roasting']
        }
      }
    },
    // ... rest of properties ...
  },
  'chicken': {
    elementalProperties: { Earth: 0.4, Water: 0.3, Fire: 0.2, Air: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['Cancer', 'Taurus'],
      elementalAffinity: {
        base: 'Earth',
        decanModifiers: {
          first: { element: 'Earth', planet: 'Moon' },
          second: { element: 'Water', planet: 'Venus' },
          third: { element: 'Air', planet: 'Mercury' }
        }
      },
      lunarPhaseModifiers: {
        firstQuarter: {
          elementalBoost: { Earth: 0.1, Water: 0.1 },
          preparationTips: ['Best for poaching']
        },
        fullMoon: {
          elementalBoost: { Water: 0.2 },
          preparationTips: ['Ideal for braising']
        }
      }
    },
    // ... rest of properties ...
  },
  // ... other meats ...
}; 