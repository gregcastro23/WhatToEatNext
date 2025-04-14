/**
 * Cooking methods with their elemental properties and astrological influences
 */
export const cookingMethods = {
  roasting: {
    name: 'Roasting',
    elementalEffect: {
      Fire: 0.8,
      Air: 0.5,
      Earth: 0.3,
      Water: 0.1
    },
    benefits: ['caramelization', 'flavor concentration'],
    astrologicalInfluences: {
      dominantPlanets: ['Sun', 'Mars'],
      lunarPhaseEffect: {
        full_moon: 0.8,
        new_moon: 0.4
      }
    }
  },
  steaming: {
    name: 'Steaming',
    elementalEffect: {
      Water: 0.9,
      Air: 0.4,
      Earth: 0.2,
      Fire: 0.1
    },
    benefits: ['nutrient preservation', 'gentle cooking'],
    astrologicalInfluences: {
      dominantPlanets: ['Moon', 'Neptune'],
      lunarPhaseEffect: {
        waxing_crescent: 0.7,
        full_moon: 0.5
      }
    }
  },
  grilling: {
    name: 'Grilling',
    elementalEffect: {
      Fire: 0.9,
      Air: 0.6,
      Earth: 0.2,
      Water: 0.1
    },
    benefits: ['smoky flavor', 'char development'],
    astrologicalInfluences: {
      dominantPlanets: ['Mars', 'Sun'],
      lunarPhaseEffect: {
        full_moon: 0.7,
        waxing_gibbous: 0.6
      }
    }
  }
};

export default cookingMethods; 