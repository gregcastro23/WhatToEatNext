import type { Element, Planet } from '@/types/celestial';
import { PlanetaryHourCalculator } from './PlanetaryHourCalculator';
import { ThermodynamicCalculator } from './ThermodynamicCalculator';

/**
 * Maps planets to their elemental influences (diurnal and nocturnal elements)
 * and their dignity effects in different signs
 */
const planetaryElements: Record<
  string,
  {
    diurnal: Element,
    nocturnal: Element,
    dignityEffect?: Record<string, number>
  }
> = {
  Sun: {
    diurnal: 'Fire',
    nocturnal: 'Fire',
    dignityEffect: { leo: 1, aries: 2, aquarius: -1, libra: -2 }
  },
  Moon: {
    diurnal: 'Water',
    nocturnal: 'Water',
    dignityEffect: { cancer: 1, taurus: 2, capricorn: -1, scorpio: -2 }
  },
  Mercury: {
    diurnal: 'Air',
    nocturnal: 'Earth',
    dignityEffect: { gemini: 1, virgo: 3, sagittarius: 1, pisces: -3 }
  },
  Venus: {
    diurnal: 'Water',
    nocturnal: 'Earth',
    dignityEffect: { libra: 1, taurus: 1, pisces: 2, aries: -1, scorpio: -1, virgo: -2 }
  },
  Mars: {
    diurnal: 'Fire',
    nocturnal: 'Water',
    dignityEffect: { aries: 1, scorpio: 1, capricorn: 2, taurus: -1, libra: -1, cancer: -2 }
  },
  Jupiter: {
    diurnal: 'Air',
    nocturnal: 'Fire',
    dignityEffect: { pisces: 1, sagittarius: 1, cancer: 2, gemini: -1, virgo: -1, capricorn: -2 }
  },
  Saturn: {
    diurnal: 'Air',
    nocturnal: 'Earth',
    dignityEffect: { aquarius: 1, capricorn: 1, libra: 2, cancer: -1, leo: -1, aries: -2 }
  },
  Uranus: {
    diurnal: 'Water',
    nocturnal: 'Air',
    dignityEffect: { aquarius: 1, scorpio: 2, taurus: -3 }
  },
  Neptune: {
    diurnal: 'Water',
    nocturnal: 'Water',
    dignityEffect: { pisces: 1, cancer: 2, virgo: -1, capricorn: -2 }
  },
  Pluto: {
    diurnal: 'Earth',
    nocturnal: 'Water',
    dignityEffect: { scorpio: 1, leo: 2, taurus: -1, aquarius: -2 }
  }
}

/**
 * Sign information for decan and degree effects
 */
const signInfo: Record<
  string,
  {
    element: Element,
    decanEffects: Record<string, string[]>,
    degreeEffects: Record<string, number[]>
  }
> = {
  aries: {
    element: 'Fire',
    decanEffects: { '1st Decan': ['Mars'], '2nd Decan': ['Sun'], '3rd Decan': ['Venus'] },
    degreeEffects: {
      Mercury: [1521],
      Venus: [714],
      Mars: [2226],
      Jupiter: [16],
      Saturn: [2730]
    }
  },
  taurus: {
    element: 'Earth',
    decanEffects: { '1st Decan': ['Mercury'], '2nd Decan': ['Moon'], '3rd Decan': ['Saturn'] },
    degreeEffects: {
      Mercury: [915],
      Venus: [18],
      Mars: [2730],
      Jupiter: [1622],
      Saturn: [2326]
    }
  },
  gemini: {
    element: 'Air',
    decanEffects: {
      '1st Decan': ['Jupiter'],
      '2nd Decan': ['Mars'],
      '3rd Decan': ['Uranus', 'Sun']
    },
    degreeEffects: {
      Mercury: [17],
      Venus: [1520],
      Mars: [2630],
      Jupiter: [814],
      Saturn: [2225]
    }
  },
  cancer: {
    element: 'Water',
    decanEffects: {
      '1st Decan': ['Venus'],
      '2nd Decan': ['Mercury', 'Pluto'],
      '3rd Decan': ['Neptune', 'Moon']
    },
    degreeEffects: {
      Mercury: [1420],
      Venus: [2127],
      Mars: [16],
      Jupiter: [713],
      Saturn: [2830]
    }
  },
  leo: {
    element: 'Fire',
    decanEffects: { '1st Decan': ['Saturn'], '2nd Decan': ['Jupiter'], '3rd Decan': ['Mars'] },
    degreeEffects: {
      Mercury: [713],
      Venus: [1419],
      Mars: [2630],
      Jupiter: [2025],
      Saturn: [16]
    }
  },
  virgo: {
    element: 'Earth',
    decanEffects: {
      '1st Decan': ['Mars', 'Sun'],
      '2nd Decan': ['Venus'],
      '3rd Decan': ['Mercury']
    },
    degreeEffects: {
      Mercury: [17],
      Venus: [813],
      Mars: [2530],
      Jupiter: [1418],
      Saturn: [1924]
    }
  },
  libra: {
    element: 'Air',
    decanEffects: {
      '1st Decan': ['Moon'],
      '2nd Decan': ['Saturn', 'Uranus'],
      '3rd Decan': ['Jupiter']
    },
    degreeEffects: {
      Mercury: [2024],
      Venus: [711],
      Mars: [],
      Jupiter: [1219],
      Saturn: [16]
    }
  },
  scorpio: {
    element: 'Water',
    decanEffects: {
      '1st Decan': ['Pluto'],
      '2nd Decan': ['Neptune', 'Sun'],
      '3rd Decan': ['Venus']
    },
    degreeEffects: {
      Mercury: [2227],
      Venus: [1521],
      Mars: [16],
      Jupiter: [714],
      Saturn: [2830]
    }
  },
  sagittarius: {
    element: 'Fire',
    decanEffects: { '1st Decan': ['Mercury'], '2nd Decan': ['Moon'], '3rd Decan': ['Saturn'] },
    degreeEffects: {
      Mercury: [1520],
      Venus: [914],
      Mars: [],
      Jupiter: [18],
      Saturn: [2125]
    }
  },
  capricorn: {
    element: 'Earth',
    decanEffects: { '1st Decan': ['Jupiter'], '2nd Decan': [], '3rd Decan': ['Sun'] },
    degreeEffects: {
      Mercury: [712],
      Venus: [16],
      Mars: [],
      Jupiter: [1319],
      Saturn: [2630]
    }
  },
  aquarius: {
    element: 'Air',
    decanEffects: { '1st Decan': ['Uranus'], '2nd Decan': ['Mercury'], '3rd Decan': ['Moon'] },
    degreeEffects: {
      Mercury: [],
      Venus: [1320],
      Mars: [2630],
      Jupiter: [2125],
      Saturn: [16]
    }
  },
  pisces: {
    element: 'Water',
    decanEffects: {
      '1st Decan': ['Saturn', 'Neptune', 'Venus'],
      '2nd Decan': ['Jupiter'],
      '3rd Decan': ['Pisces', 'Mars']
    },
    degreeEffects: {
      Mercury: [1520],
      Venus: [18],
      Mars: [2126],
      Jupiter: [914],
      Saturn: [2730]
    }
  }
}

export interface FoodCorrespondence {
  food: string;
  foodGroup: string;
  foodType: string;
  element: Element;
  planet: Planet;
  alchemy: {
    day: number[];
    night: number[]
  },
  energyValues: {
    heat: number,
    entropy: number,
    reactivity: number
  }
}

export interface SystemState {
  elements: Record<Element, number>,
  metrics: ThermodynamicMetrics;
  planetaryPositions?: Record<string, { sign: string, degree: number }>,
  aspects?: Array<{ type: string, planets: [string, string] }>;
}

export interface ThermodynamicMetrics {
  heat: number;
  entropy: number;
  reactivity: number
}

export interface FoodCompatibility {
  score: number;
  scoreDetails?: {
    elementalMatch?: number
    planetaryDayMatch?: number
    planetaryHourMatch?: number;
    dignityBonus?: number;
    decanBonus?: number;
    aspectBonus?: number
  },
  recommendations: string[],
  warnings: string[],
  preparationMethods: PreparationMethod[]
}

export interface PreparationMethod {
  name: string;
  element: Element;
  planetaryRuler: Planet;
  energyEffects: {
    heat: number;
    entropy: number;
    reactivity: number
  },
  timing: {
    optimal: Planet[],
    acceptable: Planet[],
    avoid: Planet[]
  };
}

export class FoodAlchemySystem {
  private readonly thermodynamics: ThermodynamicCalculator;
  private readonly foodDatabase: FoodCorrespondence[];
  private readonly preparationMethods: PreparationMethod[];

  constructor() {
    this.thermodynamics = new ThermodynamicCalculator();
    this.foodDatabase = this.initializeFoodDatabase();
    this.preparationMethods = this.initializePreparationMethods();
  }

  /**
   * Initializes the food correspondence database
   */
  private initializeFoodDatabase(): FoodCorrespondence[] {
    return [
      {
        food: 'Garlic',
        foodGroup: 'Vegetables',
        foodType: 'Root',
        element: 'Fire',
        planet: 'Mars',
        alchemy: {
          day: [0.8, 0.4, 0.6],
          night: [0.6, 0.3, 0.5]
        },
        energyValues: {
          heat: 0.8,
          entropy: 0.4,
          reactivity: 0.6
        }
      },
      {
        food: 'Ginger',
        foodGroup: 'Roots',
        foodType: 'Rhizome',
        element: 'Fire',
        planet: 'Mars',
        alchemy: {
          day: [0.7, 0.5, 0.6],
          night: [0.5, 0.4, 0.5]
        },
        energyValues: {
          heat: 0.7,
          entropy: 0.5,
          reactivity: 0.6
        }
      }
      // Add more foods as needed
    ];
  }

  /**
   * Initializes the preparation methods database
   */
  private initializePreparationMethods(): PreparationMethod[] {
    return [
      {
        name: 'Roasting',
        element: 'Fire',
        planetaryRuler: 'Sun',
        energyEffects: {
          heat: 0.8,
          entropy: 0.4,
          reactivity: 0.6
        },
        timing: {
          optimal: ['Sun', 'Mars'],
          acceptable: ['Jupiter'],
          avoid: ['Moon', 'Saturn']
        }
      },
      {
        name: 'Steaming',
        element: 'Water',
        planetaryRuler: 'Moon',
        energyEffects: {
          heat: 0.3,
          entropy: 0.5,
          reactivity: 0.4
        },
        timing: {
          optimal: ['Moon', 'Venus'],
          acceptable: ['Mercury'],
          avoid: ['Mars', 'Sun']
        }
      }
      // Add more methods as needed
    ];
  }

  /**
   * Calculates food compatibility based on current state with enhanced
   * elemental dignity, decan effects, and aspect considerations
   */
  calculateFoodCompatibility(
    food: FoodCorrespondence,
    state: SystemState,
    time: Date
  ): FoodCompatibility {
    const planetaryCalculator = new PlanetaryHourCalculator();
    const rawPlanetaryHour = planetaryCalculator.calculatePlanetaryHour(time);
    const rawPlanetaryDay = planetaryCalculator.calculatePlanetaryHour(time);

    // Convert the planet names to the uppercase format used in this module
    const planetaryHour = (rawPlanetaryHour.charAt(0).toUpperCase() +
      rawPlanetaryHour.slice(1)) as Planet;
    const planetaryDay = (rawPlanetaryDay.charAt(0).toUpperCase() +
      rawPlanetaryDay.slice(1)) as Planet;
    const isDaytimeNow = planetaryCalculator.isDaytime(time);
    // Calculate base elemental compatibility (45% weight)
    const elementalMatch = this.calculateElementalMatch(food, state);

    // Calculate planetary day influence with enhanced dignity effects (35% weight)
    const {
      score: planetaryDayMatch,
      dignityBonus: dayDignityBonus,
      decanBonus: dayDecanBonus
    } = this.calculatePlanetaryDayInfluence(food, planetaryDay, state.planetaryPositions)

    // Calculate planetary hour influence with enhanced dignity and aspect effects (20% weight)
    const {
      score: planetaryHourMatch,
      dignityBonus: hourDignityBonus,
      aspectBonus
    } = this.calculatePlanetaryHourInfluence(food, planetaryHour, isDaytimeNow, state)

    // Apply standardized weighting
    const compatibilityScore = elementalMatch * 0.45 + planetaryDayMatch * 0.35 + planetaryHourMatch * 0.2;

    return {
      score: compatibilityScore,
      scoreDetails: {
        elementalMatch: elementalMatch * 0.45,
        planetaryDayMatch: planetaryDayMatch * 0.35,
        planetaryHourMatch: planetaryHourMatch * 0.2,
        dignityBonus: (dayDignityBonus || 0) + (hourDignityBonus || 0),
        decanBonus: dayDecanBonus,
        aspectBonus
      },
      recommendations: this.generateRecommendations(
        food,
        state,
        time,
        planetaryDay,
        planetaryHour,
        isDaytimeNow
      ),
      warnings: this.generateWarnings(food, state),
      preparationMethods: this.getPreparationMethods(food, time)
    }
  }

  /**
   * Calculates the elemental match between a food and the current system state
   */
  private calculateElementalMatch(food: FoodCorrespondence, state: SystemState): number {
    if (!food || !state || !state.elements) {
      return 0.5; // Default neutral value
    }

    // Calculate how well the food's element matches with the current elemental state
    // Higher value means better match (balancing or enhancing)
    const foodElement = food.element;
    if (!foodElement || !state.elements[foodElement]) {
      return 0.5; // Default if missing data
    }

    // Get the current elemental balance
    const { Fire, Water, Air, Earth } = state.elements;

    // Calculate the dominant and weakest elements
    const elementValues = [
      { element: 'Fire', value: Fire },
      { element: 'Water', value: Water },
      { element: 'Air', value: Air },
      { element: 'Earth', value: Earth }
    ];
    elementValues.sort((a, b) => b.value - a.value);

    const dominantElement = elementValues[0].element;
    const weakestElement = elementValues[3].element;

    // Calculate match score
    let matchScore = 0.5; // Start with neutral

    // If the system needs more of this element (it's the weakest), give high score
    if (foodElement === weakestElement) {
      matchScore = 0.9;
    }
    // If element is not the dominant but has good presence, give good score
    else if (foodElement !== dominantElement && state.elements[foodElement] > 0.3) {
      matchScore = 0.7;
    }
    // If the element is already dominant, give a moderate score
    else if (foodElement === dominantElement) {
      matchScore = 0.6;
    }

    return matchScore;
  }

  /**
   * Calculates the planetary day influence on food with enhanced dignity and decan effects
   * The day's ruling planet contributes BOTH its diurnal and nocturnal elements all day
   */
  private calculatePlanetaryDayInfluence(
    food: FoodCorrespondence,
    planetaryDay: Planet,
    planetaryPositions?: Record<string, { sign: string, degree: number }>
  ): { score: number, dignityBonus?: number, decanBonus?: number } {
    // Get the elements associated with the current planetary day
    const dayElements = planetaryElements[planetaryDay];
    if (!dayElements) return { score: 0.5 }; // Unknown planet

    // For planetary day, BOTH diurnal and nocturnal elements influence all day
    const diurnalElement = dayElements.diurnal;
    const nocturnalElement = dayElements.nocturnal;

    // Calculate match based on food's element compared to planetary elements
    const diurnalMatch = food.element === diurnalElement ? 1.0 : 0.3;
    const nocturnalMatch = food.element === nocturnalElement ? 1.0 : 0.3;

    // Calculate a weighted score - both elements are equally important for planetary day
    let elementalScore = (diurnalMatch + nocturnalMatch) / 2;
    let dignityBonus = 0;
    let decanBonus = 0;

    // Apply dignity effects if we have planet positions
    if (planetaryPositions?.[planetaryDay]) {
      const planetSign = planetaryPositions[planetaryDay].sign;
      const planetDegree = planetaryPositions[planetaryDay].degree;

      // Dignity effect bonus/penalty
      if (dayElements.dignityEffect && dayElements.dignityEffect[planetSign]) {
        dignityBonus = dayElements.dignityEffect[planetSign] * 0.1; // Scale to 0.1-0.3 effect
        elementalScore = Math.min(1.0, Math.max(0.0, elementalScore + dignityBonus));
      }

      // Calculate decan (1-10°: 1st decan11-20°: 2nd decan21-30°: 3rd decan)
      let decan = '1st Decan';
      if (planetDegree > 10 && planetDegree <= 20) decan = '2nd Decan';
      else if (planetDegree > 20) decan = '3rd Decan';

      // Apply decan effects if the planet is in its own decan
      if (
        signInfo[planetSign] &&
        signInfo[planetSign].decanEffects[decan] &&
        signInfo[planetSign].decanEffects[decan].includes(planetaryDay)
      ) {
        decanBonus = 0.15;
        elementalScore = Math.min(1.0, elementalScore + decanBonus);
      }

      // Apply degree effects
      if (
        signInfo[planetSign] &&
        signInfo[planetSign].degreeEffects[planetaryDay] &&
        signInfo[planetSign].degreeEffects[planetaryDay].length === 2
      ) {
        const [minDegree, maxDegree] = signInfo[planetSign].degreeEffects[planetaryDay];
        if (planetDegree >= minDegree && planetDegree <= maxDegree) {
          const degreeBonus = 0.2;
          elementalScore = Math.min(1.0, elementalScore + degreeBonus);
        }
      }
    }

    // If the food's planet is the same as the day's planet, give bonus points
    if (food.planet === planetaryDay) {
      elementalScore = Math.min(1.0, elementalScore + 0.3);
    }

    return { score: elementalScore, dignityBonus, decanBonus };
}

  /**
   * Calculates the planetary hour influence with enhanced dignity and aspect effects
   * The hour's ruling planet contributes its diurnal element during day, nocturnal at night
   */
  private calculatePlanetaryHourInfluence(
    food: FoodCorrespondence,
    planetaryHour: Planet,
    isDaytime: boolean,
    state: SystemState
  ): { score: number, dignityBonus?: number, aspectBonus?: number } {
    // Get the elements associated with the current planetary hour
    const hourElements = planetaryElements[planetaryHour];
    if (!hourElements) return { score: 0.5 }; // Unknown planet

    // For planetary hour, use diurnal element during day, nocturnal at night
    const relevantElement = isDaytime ? hourElements.diurnal : hourElements.nocturnal;

    // Calculate match based on food's element compared to the hour's relevant element
    const elementalMatch = food.element === relevantElement ? 1.0 : 0.3;

    // Calculate score
    let elementalScore = elementalMatch;
    let dignityBonus = 0;
    let aspectBonus = 0;

    // Apply dignity effects if we have planet positions
    if (state.planetaryPositions && state.planetaryPositions[planetaryHour]) {
      const planetSign = state.planetaryPositions[planetaryHour].sign;

      // Dignity effect bonus/penalty
      if (hourElements.dignityEffect && hourElements.dignityEffect[planetSign]) {
        dignityBonus = hourElements.dignityEffect[planetSign] * 0.1; // Scale to 0.1-0.3 effect
        elementalScore = Math.min(1.0, Math.max(0.0, elementalScore + dignityBonus));
      }
    }

    // Apply aspect effects if available
    if (state.aspects && state.aspects.length > 0) {
      // Find aspects involving the planetary hour ruler
      const hourAspects = state.aspects.filter(a => a.planets.includes(planetaryHour));

      for (const aspect of hourAspects) {
        const otherPlanet =
          aspect.planets[0] === planetaryHour ? aspect.planets[1] : aspect.planets[0];
        let aspectModifier = 0;

        // Apply different modifier based on aspect type
        switch (aspect.type) {
          case 'Conjunction':
            // Strong beneficial aspect
            aspectModifier = 0.15;
            break;
          case 'Trine':
            // Beneficial aspect
            aspectModifier = 0.1;
            break;
          case 'Square':
            // Challenging aspect
            aspectModifier = -0.1;
            break;
          case 'Opposition':
            // Strong challenging aspect
            aspectModifier = -0.15;
            break;
          default: aspectModifier = 0;
        }

        // Apply the aspect modifier if the food is ruled by the other planet in the aspect
        if (food.planet === otherPlanet) {
          aspectBonus = (aspectBonus || 0) + aspectModifier;
          elementalScore = Math.min(1.0, Math.max(0.0, elementalScore + aspectModifier));
        }
      }
    }

    // If the food's planet is the same as the hour's planet, give bonus points
    if (food.planet === planetaryHour) {
      elementalScore = Math.min(1.0, elementalScore + 0.3);
    }

    return { score: elementalScore, dignityBonus, aspectBonus };
}

  /**
   * Generates enhanced recommendations based on planetary influences
   */
  private generateRecommendations(
    food: FoodCorrespondence,
    state: SystemState,
    time: Date,
    planetaryDay: Planet,
    planetaryHour: Planet,
    isDaytime: boolean
  ): string[] {
    const recommendations: string[] = [];

    // Get elements for current planetary influences
    const dayElements = planetaryElements[planetaryDay];
    const hourElements = planetaryElements[planetaryHour];

    if (dayElements && hourElements) {
      // Generate suggestions based on the day's elements
      if (dayElements.diurnal === 'Fire' || dayElements.nocturnal === 'Fire') {
        recommendations.push(
          `${food.food} is best prepared with high-heat cooking methods like grilling or roasting today.`
        );
      } else if (dayElements.diurnal === 'Water' || dayElements.nocturnal === 'Water') {
        recommendations.push(
          `Consider moist cooking methods like steaming or braising for ${food.food} today.`
        );
      } else if (dayElements.diurnal === 'Air' || dayElements.nocturnal === 'Air') {
        recommendations.push(
          `${food.food} performs well with light cooking methods or raw preparations today.`
        );
      } else if (dayElements.diurnal === 'Earth' || dayElements.nocturnal === 'Earth') {
        recommendations.push(
          `Slow, methodical cooking methods like baking are ideal for ${food.food} today.`
        );
      }

      // Add time-specific recommendation based on the hour's element
      const hourElement = isDaytime ? hourElements.diurnal : hourElements.nocturnal;
      if (hourElement === 'Fire') {
        recommendations.push(
          `${food.food} is best utilized in the current ${isDaytime ? 'day' : 'night'} hours with quick, energetic preparation.`
        );
      } else if (hourElement === 'Water') {
        recommendations.push(
          `During these ${isDaytime ? 'day' : 'night'} hours, focus on bringing out ${food.food}'s aromatic qualities.`
        );
      } else if (hourElement === 'Air') {
        recommendations.push(
          `The current ${isDaytime ? 'day' : 'night'} hours favor highlighting ${food.food}'s delicate flavors.`
        );
      } else if (hourElement === 'Earth') {
        recommendations.push(
          `These ${isDaytime ? 'day' : 'night'} hours are perfect for enhancing ${food.food}'s grounding properties.`
        );
      }

      // Add dignified planetary recommendations if applicable
      if (state.planetaryPositions) {
        // Check day planet dignity
        if (
          planetaryElements[planetaryDay].dignityEffect &&
          state.planetaryPositions[planetaryDay]
        ) {
          const daySign = state.planetaryPositions[planetaryDay].sign;
          const dayDignity = planetaryElements[planetaryDay].dignityEffect?.[daySign];

          if (dayDignity && dayDignity > 0 && food.planet === planetaryDay) {
            recommendations.push(
              `${planetaryDay} is ${dayDignity > 1 ? 'exalted' : 'dignified'} in ${daySign}, strengthening ${food.food}'s properties.`
            );
          } else if (dayDignity && dayDignity < 0 && food.planet === planetaryDay) {
            recommendations.push(
              `${planetaryDay} is ${dayDignity < -1 ? 'in fall' : 'in detriment'} in ${daySign}, requiring careful preparation of ${food.food}.`
            );
          }
        }

        // Check hour planet dignity
        if (
          planetaryElements[planetaryHour].dignityEffect &&
          state.planetaryPositions[planetaryHour]
        ) {
          const hourSign = state.planetaryPositions[planetaryHour].sign;
          const hourDignity = planetaryElements[planetaryHour].dignityEffect?.[hourSign];

          if (hourDignity && hourDignity > 0 && food.planet === planetaryHour) {
            recommendations.push(
              `During this hour, ${planetaryHour}'s dignity in ${hourSign} enhances ${food.food}'s flavor profile.`
            );
          }
        }

        // Check decan effects
        if (state.planetaryPositions[planetaryDay]) {
          const planetSign = state.planetaryPositions[planetaryDay].sign;
          const planetDegree = state.planetaryPositions[planetaryDay].degree;

          // Calculate decan
          let decan = '1st Decan';
          if (planetDegree > 10 && planetDegree <= 20) decan = '2nd Decan';
          else if (planetDegree > 20) decan = '3rd Decan';

          // If food's planet rules the decan
          if (signInfo[planetSign].decanEffects[decan].includes(food.planet)) {
            recommendations.push(
              `${food.food} is especially potent as it's ruled by ${food.planet}, which rules the ${decan.toLowerCase()} of ${planetSign}.`
            );
          }
        }
      }

      // Add aspect-based recommendations
      if (state.aspects && state.aspects.length > 0) {
        const relevantAspects = state.aspects.filter(
          aspect => aspect.planets.includes(planetaryDay) || aspect.planets.includes(planetaryHour)
        );

        for (const aspect of relevantAspects) {
          if (aspect.type === 'Conjunction') {
            if (aspect.planets.includes(food.planet)) {
              const otherPlanet = aspect.planets[0] === food.planet ? aspect.planets[1] : aspect.planets[0];
              recommendations.push(
                `The conjunction between ${aspect.planets[0]} and ${aspect.planets[1]} powerfully enhances ${food.food}'s qualities.`
              );
            }
          } else if (aspect.type === 'Trine') {
            if (aspect.planets.includes(food.planet)) {
              recommendations.push(
                `The harmonious trine involving ${food.planet} brings out ${food.food}'s best qualities.`
              );
            }
          }
        }
      }

      // Add planetary affinity recommendations
      if (food.planet === planetaryDay) {
        recommendations.push(
          `Today is especially favorable for ${food.food} as it's ruled by ${planetaryDay}.`
        );
      }

      if (food.planet === planetaryHour) {
        recommendations.push(
          `The current hour enhances ${food.food}'s ${hourElement.toLowerCase()} qualities.`
        );
      }
    }

    return recommendations;
  }

  private generateWarnings(food: FoodCorrespondence, state: SystemState): string[] {
    if (!food || !state) {
      return [];
}

    const warnings: string[] = []

    // Check for elemental imbalances
    const { Fire, Water, Air, Earth } = state.elements;

    if (food.element === 'Fire' && Fire > 0.7) {
      warnings.push(
        `High Fire energy detected. This food may increase irritability or impulsiveness.`
      );
    } else if (food.element === 'Water' && Water > 0.7) {
      warnings.push(
        `High Water energy detected. This food may increase emotional sensitivity or lethargy.`
      );
    } else if (food.element === 'Air' && Air > 0.7) {
      warnings.push(
        `High Air energy detected. This food may increase anxiety or scattered thinking.`
      );
    } else if (food.element === 'Earth' && Earth > 0.7) {
      warnings.push(
        `High Earth energy detected. This food may increase sluggishness or resistance to change.`
      );
    }

    // Check for energetic imbalances
    if (food.energyValues && state.metrics) {
      if (state.metrics.heat > 0.8 && food.energyValues.heat > 0.7) {
        warnings.push(
          `Your system is already running hot. This warming food may intensify this imbalance.`
        );
      }

      if (state.metrics.entropy > 0.8 && food.energyValues.entropy > 0.7) {
        warnings.push(
          `Your system is already highly entropic. This chaotic food may increase disorganization.`
        );
      }

      if (state.metrics.reactivity > 0.8 && food.energyValues.reactivity > 0.7) {
        warnings.push(
          `Your system is already highly reactive. This stimulating food may increase sensitivity.`
        );
      }
    }

    // Check for planetary conditions that might require caution
    if (state.planetaryPositions && state.planetaryPositions[food.planet]) {
      const planetSign = state.planetaryPositions[food.planet].sign;
      const dignityEffect = planetaryElements[food.planet].dignityEffect?.[planetSign];

      if (dignityEffect && dignityEffect < -1) {
        warnings.push(
          `${food.planet} is currently in fall in ${planetSign}, making ${food.food} less effective unless prepared with extra care.`
        );
      }
    }

    return warnings;
  }

  private getPreparationMethods(food: FoodCorrespondence, time: Date): PreparationMethod[] {
    if (!food || !this.preparationMethods || this.preparationMethods.length === 0) {
      return [];
    }

    // Determine current planetary hour (simplified)
    const hourOfDay = time.getHours() % 12;
    const planetaryHours: Planet[] = [
      'Sun',
      'Venus',
      'Mercury',
      'Moon',
      'Saturn',
      'Jupiter',
      'Mars',
      'Sun',
      'Venus',
      'Mercury',
      'Moon',
      'Saturn'
    ];
    const currentPlanetaryHour = planetaryHours[hourOfDay];

    // Determine if it's daytime or nighttime
    const isDaytime = time.getHours() >= 6 && time.getHours() < 18;

    // Filter methods compatible with the food and current time
    return this.preparationMethods.filter(method =>
      this.isMethodCompatible(method, food, currentPlanetaryHour, isDaytime)
    );
  }

  private isMethodCompatible(
    method: PreparationMethod,
    food: FoodCorrespondence,
    planetaryHour: Planet,
    isDaytimeNow: boolean
  ): boolean {
    if (!method || !food) {
      return false;
}

    // Check elemental compatibility
    // Methods that share or complement the food's element are preferred
    const elementalMatch = method.element === food.element ||
      (food.element === 'Fire' && method.element === 'Air') ||
      (food.element === 'Air' && method.element === 'Fire') ||
      (food.element === 'Water' && method.element === 'Earth') ||
      (food.element === 'Earth' && method.element === 'Water');

    // Check planetary compatibility
    const planetaryMatch = method.timing.optimal.includes(planetaryHour) ||
      (method.timing.acceptable.includes(planetaryHour) &&
        !method.timing.avoid.includes(planetaryHour));

    // Check if method is appropriate for time of day
    // Some methods are better for day (solar) and others for night (lunar)
    const timeAppropriate = (isDaytimeNow && (method.element === 'Fire' || method.element === 'Air')) ||
      (!isDaytimeNow && (method.element === 'Water' || method.element === 'Earth')) ||
      (method.planetaryRuler === 'Sun' && isDaytimeNow) ||
      (method.planetaryRuler === 'Moon' && !isDaytimeNow);

    // Method is compatible if at least two of the three conditions are true;
    const compatibilityFactors = [elementalMatch, planetaryMatch, timeAppropriate];
    const trueFactors = compatibilityFactors.filter(Boolean).length;

    return trueFactors >= 2;
  }

  // Add other methods as needed
}
