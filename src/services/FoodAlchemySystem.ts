import { ElementalCharacter } from "../constants/(planetaryElements || 1)";
import { RulingPlanet } from "../constants/(planets || 1)";
import type { ThermodynamicMetrics } from "../calculations/(gregsEnergy || 1)";
import type { BirthChart } from "../types/(astrology || 1)";

/**
 * Maps planets to their elemental influences (diurnal and nocturnal elements)
 * and their dignity effects in different signs
 */
const planetaryElements: Record<
  string,
  {
    diurnal: ElementalCharacter;
    nocturnal: ElementalCharacter;
    dignityEffect?: Record<string, number>;
  }
> = {
  Sun: {
    diurnal: 'Fire',
    nocturnal: 'Fire',
    dignityEffect: { Leo: 1, Aries: 2, Aquarius: -1, Libra: -2 },
  },
  Moon: {
    diurnal: 'Water',
    nocturnal: 'Water',
    dignityEffect: { Cancer: 1, Taurus: 2, Capricorn: -1, Scorpio: -2 },
  },
  Mercury: {
    diurnal: 'Air',
    nocturnal: 'Earth',
    dignityEffect: { Gemini: 1, Virgo: 3, Sagittarius: 1, Pisces: -3 },
  },
  Venus: {
    diurnal: 'Water',
    nocturnal: 'Earth',
    dignityEffect: {
      Libra: 1,
      Taurus: 1,
      Pisces: 2,
      Aries: -1,
      Scorpio: -1,
      Virgo: -2,
    },
  },
  Mars: {
    diurnal: 'Fire',
    nocturnal: 'Water',
    dignityEffect: {
      Aries: 1,
      Scorpio: 1,
      Capricorn: 2,
      Taurus: -1,
      Libra: -1,
      Cancer: -2,
    },
  },
  Jupiter: {
    diurnal: 'Air',
    nocturnal: 'Fire',
    dignityEffect: {
      Pisces: 1,
      Sagittarius: 1,
      Cancer: 2,
      Gemini: -1,
      Virgo: -1,
      Capricorn: -2,
    },
  },
  Saturn: {
    diurnal: 'Air',
    nocturnal: 'Earth',
    dignityEffect: {
      Aquarius: 1,
      Capricorn: 1,
      Libra: 2,
      Cancer: -1,
      Leo: -1,
      Aries: -2,
    },
  },
  Uranus: {
    diurnal: 'Water',
    nocturnal: 'Air',
    dignityEffect: { Aquarius: 1, Scorpio: 2, Taurus: -3 },
  },
  Neptune: {
    diurnal: 'Water',
    nocturnal: 'Water',
    dignityEffect: { Pisces: 1, Cancer: 2, Virgo: -1, Capricorn: -2 },
  },
  Pluto: {
    diurnal: 'Earth',
    nocturnal: 'Water',
    dignityEffect: { Scorpio: 1, Leo: 2, Taurus: -1, Aquarius: -2 },
  },
};

/**
 * Sign information for decan and degree effects
 */
const signInfo: Record<
  string,
  {
    element: ElementalCharacter;
    decanEffects: Record<string, string[]>;
    degreeEffects: Record<string, number[]>;
  }
> = {
  Aries: {
    element: 'Fire',
    decanEffects: {
      '1st Decan': ['Mars'],
      '2nd Decan': ['Sun'],
      '3rd Decan': ['Venus'],
    },
    degreeEffects: {
      Mercury: [15, 21],
      Venus: [7, 14],
      Mars: [22, 26],
      Jupiter: [1, 6],
      Saturn: [27, 30],
    },
  },
  Taurus: {
    element: 'Earth',
    decanEffects: {
      '1st Decan': ['Mercury'],
      '2nd Decan': ['Moon'],
      '3rd Decan': ['Saturn'],
    },
    degreeEffects: {
      Mercury: [9, 15],
      Venus: [1, 8],
      Mars: [27, 30],
      Jupiter: [16, 22],
      Saturn: [23, 26],
    },
  },
  Gemini: {
    element: 'Air',
    decanEffects: {
      '1st Decan': ['Jupiter'],
      '2nd Decan': ['Mars'],
      '3rd Decan': ['Uranus', 'Sun'],
    },
    degreeEffects: {
      Mercury: [1, 7],
      Venus: [15, 20],
      Mars: [26, 30],
      Jupiter: [8, 14],
      Saturn: [22, 25],
    },
  },
  Cancer: {
    element: 'Water',
    decanEffects: {
      '1st Decan': ['Venus'],
      '2nd Decan': ['Mercury', 'Pluto'],
      '3rd Decan': ['Neptune', 'Moon'],
    },
    degreeEffects: {
      Mercury: [14, 20],
      Venus: [21, 27],
      Mars: [1, 6],
      Jupiter: [7, 13],
      Saturn: [28, 30],
    },
  },
  Leo: {
    element: 'Fire',
    decanEffects: {
      '1st Decan': ['Saturn'],
      '2nd Decan': ['Jupiter'],
      '3rd Decan': ['Mars'],
    },
    degreeEffects: {
      Mercury: [7, 13],
      Venus: [14, 19],
      Mars: [26, 30],
      Jupiter: [20, 25],
      Saturn: [1, 6],
    },
  },
  Virgo: {
    element: 'Earth',
    decanEffects: {
      '1st Decan': ['Mars', 'Sun'],
      '2nd Decan': ['Venus'],
      '3rd Decan': ['Mercury'],
    },
    degreeEffects: {
      Mercury: [1, 7],
      Venus: [8, 13],
      Mars: [25, 30],
      Jupiter: [14, 18],
      Saturn: [19, 24],
    },
  },
  Libra: {
    element: 'Air',
    decanEffects: {
      '1st Decan': ['Moon'],
      '2nd Decan': ['Saturn', 'Uranus'],
      '3rd Decan': ['Jupiter'],
    },
    degreeEffects: {
      Mercury: [20, 24],
      Venus: [7, 11],
      Mars: [],
      Jupiter: [12, 19],
      Saturn: [1, 6],
    },
  },
  Scorpio: {
    element: 'Water',
    decanEffects: {
      '1st Decan': ['Pluto'],
      '2nd Decan': ['Neptune', 'Sun'],
      '3rd Decan': ['Venus'],
    },
    degreeEffects: {
      Mercury: [22, 27],
      Venus: [15, 21],
      Mars: [1, 6],
      Jupiter: [7, 14],
      Saturn: [28, 30],
    },
  },
  Sagittarius: {
    element: 'Fire',
    decanEffects: {
      '1st Decan': ['Mercury'],
      '2nd Decan': ['Moon'],
      '3rd Decan': ['Saturn'],
    },
    degreeEffects: {
      Mercury: [15, 20],
      Venus: [9, 14],
      Mars: [],
      Jupiter: [1, 8],
      Saturn: [21, 25],
    },
  },
  Capricorn: {
    element: 'Earth',
    decanEffects: {
      '1st Decan': ['Jupiter'],
      '2nd Decan': [],
      '3rd Decan': ['Sun'],
    },
    degreeEffects: {
      Mercury: [7, 12],
      Venus: [1, 6],
      Mars: [],
      Jupiter: [13, 19],
      Saturn: [26, 30],
    },
  },
  Aquarius: {
    element: 'Air',
    decanEffects: {
      '1st Decan': ['Uranus'],
      '2nd Decan': ['Mercury'],
      '3rd Decan': ['Moon'],
    },
    degreeEffects: {
      Mercury: [],
      Venus: [13, 20],
      Mars: [26, 30],
      Jupiter: [21, 25],
      Saturn: [1, 6],
    },
  },
  Pisces: {
    element: 'Water',
    decanEffects: {
      '1st Decan': ['Saturn', 'Neptune', 'Venus'],
      '2nd Decan': ['Jupiter'],
      '3rd Decan': ['Pisces', 'Mars'],
    },
    degreeEffects: {
      Mercury: [15, 20],
      Venus: [1, 8],
      Mars: [21, 26],
      Jupiter: [9, 14],
      Saturn: [27, 30],
    },
  },
};

export interface FoodCorrespondence {
  name: string;
  element: ElementalCharacter;
  planetaryRuler: RulingPlanet;
  timeOfDay: 'Day' | 'Night' | 'Both';
  energyValues: ThermodynamicMetrics;
  preparation: string[];
  combinations: string[];
  restrictions: string[];
}

export interface CompatibilityScore {
  compatibility: number;
  recommendations: string[];
  warnings: string[];
  scoreDetails?: {
    elementalMatch?: number;
    planetaryDayMatch?: number;
    planetaryHourMatch?: number;
    affinityBonus?: number;
    dignityBonus?: number;
    decanBonus?: number;
    aspectBonus?: number;
  };
}

export class FoodAlchemySystem {
  private readonly TOKEN_WEIGHTS = {
    Spirit: 1.0,
    Essence: 0.8,
    Matter: 0.6,
    Substance: 0.4,
  };

  private readonly ELEMENT_WEIGHTS = {
    Fire: 1.0,
    Water: 0.9,
    Air: 0.8,
    Earth: 0.7,
  };

  /**
   * Calculates food compatibility based on birth chart and current planetary positions
   * with enhanced dignity, decan, and aspect effects
   *
   * @param food The food to evaluate
   * @param chart The birth chart data
   * @param planetaryDay The current planetary day
   * @param planetaryHour The current planetary hour
   * @param isDaytime Whether it's currently daytime (6am-6pm)
   * @param planetaryPositions Current planetary positions (sign and degree)
   * @param aspects Current planetary aspects
   * @returns Detailed compatibility score with recommendations
   */
  calculateFoodCompatibility(
    food: FoodCorrespondence,
    chart: BirthChart,
    planetaryDay: string,
    planetaryHour: string,
    isDaytime: boolean,
    planetaryPositions?: Record<string, { sign: string; degree: number }>,
    aspects?: Array<{ type: string; planets: [string, string] }>
  ): CompatibilityScore {
    // Calculate elemental match (45% weight)
    let elementalMatch = this.calculateElementalMatch(chart, food);

    // Calculate planetary day influence with enhanced dignity and decan effects (35% weight)
    const {
      score: planetaryDayMatch,
      dignityBonus: dayDignityBonus,
      decanBonus: dayDecanBonus,
    } = this.calculatePlanetaryDayInfluence(
      food,
      planetaryDay,
      planetaryPositions
    );

    // Calculate planetary hour influence with enhanced dignity and aspect effects (20% weight)
    const {
      score: planetaryHourMatch,
      dignityBonus: hourDignityBonus,
      aspectBonus,
    } = this.calculatePlanetaryHourInfluence(
      food,
      planetaryHour,
      isDaytime,
      planetaryPositions,
      aspects
    );

    // Apply standardized weighting
    let compatibility =
      elementalMatch * 0.45 +
      planetaryDayMatch * 0.35 +
      planetaryHourMatch * 0.2;

    // Check for direct planetary affinity for bonus
    let hasPlanetaryAffinity =
      food.planetaryRuler === planetaryDay ||
      food.planetaryRuler === planetaryHour;
    let affinityBonus = hasPlanetaryAffinity ? 0.3 : 0;

    // Add affinity bonus (capped at 1.0)
    compatibility = Math.min(1.0, compatibility + affinityBonus);

    return {
      compatibility,
      recommendations: this.generateRecommendations(
        food,
        chart,
        planetaryDay,
        planetaryHour,
        isDaytime,
        planetaryPositions,
        aspects
      ),
      warnings: this.identifyConflicts(food, chart, planetaryPositions),
      scoreDetails: {
        elementalMatch: elementalMatch * 0.45,
        planetaryDayMatch: planetaryDayMatch * 0.35,
        planetaryHourMatch: planetaryHourMatch * 0.2,
        affinityBonus,
        dignityBonus: (dayDignityBonus || 0) + (hourDignityBonus || 0),
        decanBonus: dayDecanBonus,
        aspectBonus,
      },
    };
  }

  private calculateElementalMatch(
    chart: BirthChart,
    food: FoodCorrespondence
  ): number {
    let chartElementStrength = chart.elementalState[food.element] || 0;
    return chartElementStrength * this.ELEMENT_WEIGHTS[food.element];
  }

  /**
   * Calculate the planetary day influence on food with enhanced dignity and decan effects
   * The day's ruling planet contributes BOTH its diurnal and nocturnal elements all day
   *
   * @param food The food to evaluate
   * @param planetaryDay The planetary day
   * @param planetaryPositions Current planetary positions
   * @returns A score object with influence score and bonus details
   */
  private calculatePlanetaryDayInfluence(
    food: FoodCorrespondence,
    planetaryDay: string,
    planetaryPositions?: Record<string, { sign: string; degree: number }>
  ): { score: number; dignityBonus?: number; decanBonus?: number } {
    // Get the elements associated with the current planetary day
    let dayElements = planetaryElements[planetaryDay];
    if (!dayElements) return { score: 0.5 }; // Unknown planet

    // For planetary day, BOTH diurnal and nocturnal elements influence all day
    let diurnalElement = dayElements.diurnal;
    let nocturnalElement = dayElements.nocturnal;

    // Calculate match based on food's element
    let dignityBonus = 0;
    let decanBonus = 0;
    let elementalScore = 0;

    // Calculate match based on food's element compared to planetary elements
    let diurnalMatch = food.element === diurnalElement ? 1.0 : 0.3;
    let nocturnalMatch = food.element === nocturnalElement ? 1.0 : 0.3;

    // Calculate a weighted score - both elements are equally important for planetary day
    elementalScore = (diurnalMatch + nocturnalMatch) / 2;

    // Apply dignity effects if we have planet positions
    if (planetaryPositions && planetaryPositions[planetaryDay]) {
      let planetSign = planetaryPositions[planetaryDay].sign;
      let planetDegree = planetaryPositions[planetaryDay].degree;

      // Dignity effect bonus / (penalty || 1)
      if (dayElements.dignityEffect && dayElements.dignityEffect[planetSign]) {
        dignityBonus = dayElements.dignityEffect[planetSign] * 0.1; // Scale to 0.1-0.3 effect
        elementalScore = Math.min(
          1.0,
          Math.max(0.0, elementalScore + dignityBonus)
        );
      }

      // Calculate decan (1-10°: 1st decan, 11-20°: 2nd decan, 21-30°: 3rd decan)
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
        const [minDegree, maxDegree] =
          signInfo[planetSign].degreeEffects[planetaryDay];
        if (planetDegree >= minDegree && planetDegree <= maxDegree) {
          let degreeBonus = 0.2;
          elementalScore = Math.min(1.0, elementalScore + degreeBonus);
        }
      }
    }

    // If the food has a direct planetary affinity, give bonus points
    if (food.planetaryRuler === planetaryDay) {
      elementalScore = Math.min(1.0, elementalScore + 0.3);
    }

    return { score: elementalScore, dignityBonus, decanBonus };
  }

  /**
   * Calculate the planetary hour influence on food with enhanced dignity and aspect effects
   * The hour's ruling planet contributes only its diurnal element during day, nocturnal at night
   *
   * @param food The food to evaluate
   * @param planetaryHour The planetary hour
   * @param isDaytime Whether it's currently daytime (6am-6pm)
   * @param planetaryPositions Current planetary positions
   * @param aspects Current planetary aspects
   * @returns A score object with influence score and bonus details
   */
  private calculatePlanetaryHourInfluence(
    food: FoodCorrespondence,
    planetaryHour: string,
    isDaytime: boolean,
    planetaryPositions?: Record<string, { sign: string; degree: number }>,
    aspects?: Array<{ type: string; planets: [string, string] }>
  ): { score: number; dignityBonus?: number; aspectBonus?: number } {
    // Get the elements associated with the current planetary hour
    let hourElements = planetaryElements[planetaryHour];
    if (!hourElements) return { score: 0.5 }; // Unknown planet

    // For planetary hour, use diurnal element during day, nocturnal at night
    let relevantElement = isDaytime
      ? hourElements.diurnal
      : hourElements.nocturnal;

    // Calculate match based on food's element compared to the hour's relevant element
    let elementalMatch = food.element === relevantElement ? 1.0 : 0.3;

    // Calculate score
    let dignityBonus = 0;
    let aspectBonus = 0;
    let elementalScore = elementalMatch;

    // Apply dignity effects if we have planet positions
    if (planetaryPositions && planetaryPositions[planetaryHour]) {
      let planetSign = planetaryPositions[planetaryHour].sign;

      // Dignity effect bonus / (penalty || 1)
      if (
        hourElements.dignityEffect &&
        hourElements.dignityEffect[planetSign]
      ) {
        dignityBonus = hourElements.dignityEffect[planetSign] * 0.1; // Scale to 0.1-0.3 effect
        elementalScore = Math.min(
          1.0,
          Math.max(0.0, elementalScore + dignityBonus)
        );
      }
    }

    // Apply aspect effects if available
    if (aspects && aspects.length > 0) {
      // Find aspects involving the planetary hour ruler
      let hourAspects = aspects.filter((a) =>
        a.planets.includes(planetaryHour)
      );

      for (const aspect of hourAspects) {
        let otherPlanet =
          aspect.planets[0] === planetaryHour
            ? aspect.planets[1]
            : aspect.planets[0];
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
          default:
            aspectModifier = 0;
        }

        // Apply the aspect modifier if the food is ruled by the other planet in the aspect
        if (food.planetaryRuler === otherPlanet) {
          aspectBonus = (aspectBonus || 0) + aspectModifier;
          elementalScore = Math.min(
            1.0,
            Math.max(0.0, elementalScore + aspectModifier)
          );
        }
      }
    }

    // If the food has a direct planetary affinity, give bonus points
    if (food.planetaryRuler === planetaryHour) {
      elementalScore = Math.min(1.0, elementalScore + 0.3);
    }

    return { score: elementalScore, dignityBonus, aspectBonus };
  }

  /**
   * Generate enhanced recommendations based on planetary influences
   * including dignity, decan, and aspect considerations
   */
  private generateRecommendations(
    food: FoodCorrespondence,
    chart: BirthChart,
    planetaryDay: string,
    planetaryHour: string,
    isDaytime: boolean,
    planetaryPositions?: Record<string, { sign: string; degree: number }>,
    aspects?: Array<{ type: string; planets: [string, string] }>
  ): string[] {
    const recommendations: string[] = [];

    // Get elements for current planetary influences
    let dayElements = planetaryElements[planetaryDay];
    let hourElements = planetaryElements[planetaryHour];

    if (dayElements && hourElements) {
      // Generate suggestions based on the day's elements
      if (dayElements.diurnal === 'Fire' || dayElements.nocturnal === 'Fire') {
        recommendations.push(
          `${food.name} is best prepared with high-heat cooking methods like grilling or roasting today.`
        );
      } else if (
        dayElements.diurnal === 'Water' ||
        dayElements.nocturnal === 'Water'
      ) {
        recommendations.push(
          `Consider moist cooking methods like steaming or braising for ${food.name} today.`
        );
      } else if (
        dayElements.diurnal === 'Air' ||
        dayElements.nocturnal === 'Air'
      ) {
        recommendations.push(
          `${food.name} performs well with light cooking methods or raw preparations today.`
        );
      } else if (
        dayElements.diurnal === 'Earth' ||
        dayElements.nocturnal === 'Earth'
      ) {
        recommendations.push(
          `Slow, methodical cooking methods like baking are ideal for ${food.name} today.`
        );
      }

      // Add time-specific recommendation based on the hour's element
      let hourElement = isDaytime
        ? hourElements.diurnal
        : hourElements.nocturnal;
      if (hourElement === 'Fire') {
        recommendations.push(
          `${food.name} is best utilized in the current ${
            isDaytime ? 'day' : 'night'
          } hours with quick, energetic preparation.`
        );
      } else if (hourElement === 'Water') {
        recommendations.push(
          `During these ${
            isDaytime ? 'day' : 'night'
          } hours, focus on bringing out ${food.name}'s aromatic qualities.`
        );
      } else if (hourElement === 'Air') {
        recommendations.push(
          `The current ${
            isDaytime ? 'day' : 'night'
          } hours favor highlighting ${food.name}'s delicate flavors.`
        );
      } else if (hourElement === 'Earth') {
        recommendations.push(
          `These ${
            isDaytime ? 'day' : 'night'
          } hours are perfect for enhancing ${
            food.name
          }'s grounding properties.`
        );
      }

      // Add planetary affinity recommendations
      if (food.planetaryRuler === planetaryDay) {
        recommendations.push(
          `Today is especially favorable for ${food.name} as it's ruled by ${planetaryDay}.`
        );
      }

      if (food.planetaryRuler === planetaryHour) {
        recommendations.push(
          `The current hour enhances ${
            food.name
          }'s ${hourElement.toLowerCase()} qualities.`
        );
      }

      // Add dignity effect recommendations if applicable
      if (planetaryPositions) {
        // Check day planet dignity
        if (
          planetaryElements[planetaryDay]?.dignityEffect &&
          planetaryPositions[planetaryDay]
        ) {
          let daySign = planetaryPositions[planetaryDay].sign;
          let dayDignity =
            planetaryElements[planetaryDay].dignityEffect?.[daySign];

          if (
            dayDignity &&
            dayDignity > 0 &&
            food.planetaryRuler === planetaryDay
          ) {
            recommendations.push(
              `${planetaryDay} is ${
                dayDignity > 1 ? 'exalted' : 'dignified'
              } in ${daySign}, strengthening ${food.name}'s properties.`
            );
          } else if (
            dayDignity &&
            dayDignity < 0 &&
            food.planetaryRuler === planetaryDay
          ) {
            recommendations.push(
              `${planetaryDay} is ${
                dayDignity < -1 ? 'in fall' : 'in detriment'
              } in ${daySign}, requiring careful preparation of ${food.name}.`
            );
          }
        }

        // Check hour planet dignity
        if (
          planetaryElements[planetaryHour]?.dignityEffect &&
          planetaryPositions[planetaryHour]
        ) {
          let hourSign = planetaryPositions[planetaryHour].sign;
          let hourDignity =
            planetaryElements[planetaryHour].dignityEffect?.[hourSign];

          if (
            hourDignity &&
            hourDignity > 0 &&
            food.planetaryRuler === planetaryHour
          ) {
            recommendations.push(
              `During this hour, ${planetaryHour}'s dignity in ${hourSign} enhances ${food.name}'s flavor profile.`
            );
          }
        }

        // Check food's ruling planet dignity
        if (
          planetaryElements[food.planetaryRuler]?.dignityEffect &&
          planetaryPositions[food.planetaryRuler]
        ) {
          let foodPlanetSign = planetaryPositions[food.planetaryRuler].sign;
          let foodPlanetDignity =
            planetaryElements[food.planetaryRuler].dignityEffect?.[
              foodPlanetSign
            ];

          if (foodPlanetDignity && foodPlanetDignity > 1) {
            recommendations.push(
              `${food.name}'s ruler ${food.planetaryRuler} is exalted in ${foodPlanetSign}, making it an excellent choice.`
            );
          } else if (foodPlanetDignity && foodPlanetDignity === 1) {
            recommendations.push(
              `${food.name}'s ruler ${food.planetaryRuler} is in its home sign of ${foodPlanetSign}, enhancing its qualities.`
            );
          }
        }

        // Check decan effects
        if (planetaryPositions[planetaryDay]) {
          let planetSign = planetaryPositions[planetaryDay].sign;
          let planetDegree = planetaryPositions[planetaryDay].degree;

          // Calculate decan
          let decan = '1st Decan';
          if (planetDegree > 10 && planetDegree <= 20) decan = '2nd Decan';
          else if (planetDegree > 20) decan = '3rd Decan';

          // If food's planet rules the decan
          if (
            signInfo[planetSign]?.decanEffects[decan]?.includes(
              food.planetaryRuler
            )
          ) {
            recommendations.push(
              `${food.name} is especially potent today as it's ruled by ${
                food.planetaryRuler
              }, which rules the ${decan.toLowerCase()} of ${planetSign}.`
            );
          }
        }
      }

      // Add aspect-based recommendations
      if (aspects && aspects.length > 0) {
        // Find relevant aspects involving the food's ruling planet
        let foodPlanetAspects = aspects.filter((a) =>
          a.planets.includes(food.planetaryRuler)
        );

        for (const aspect of foodPlanetAspects) {
          let otherPlanet =
            aspect.planets[0] === food.planetaryRuler
              ? aspect.planets[1]
              : aspect.planets[0];

          if (aspect.type === 'Conjunction') {
            recommendations.push(
              `The conjunction between ${food.planetaryRuler} and ${otherPlanet} strongly enhances ${food.name}'s qualities.`
            );
          } else if (aspect.type === 'Trine') {
            recommendations.push(
              `The harmonious trine between ${food.planetaryRuler} and ${otherPlanet} creates a flowing energy for ${food.name}.`
            );
          } else if (
            aspect.type === 'Opposition' &&
            (otherPlanet === planetaryDay || otherPlanet === planetaryHour)
          ) {
            recommendations.push(
              `The opposition between ${food.planetaryRuler} and ${otherPlanet} creates dynamic tension - balance ${food.name} with complementary ingredients.`
            );
          }
        }
      }
    }

    // Element-based recommendations from birth chart
    if (chart.elementalState[food.element] > 0.7) {
      recommendations.push(
        `Boost ${
          food.element
        } elements with complementary ingredients like ${this.getSuggestions(
          food.element
        )}.`
      );
    }

    return recommendations;
  }

  private identifyConflicts(
    food: FoodCorrespondence,
    chart: BirthChart,
    planetaryPositions?: Record<string, { sign: string; degree: number }>
  ): string[] {
    const warnings: string[] = [];

    // Instead of looking for conflicts, provide suggestions for balance
    let complementaryElements = this.getComplementaryElements(food.element);

    // Check for deficiencies in birth chart elements
    for (const element of complementaryElements) {
      if (chart.elementalState[element] < 0.3) {
        warnings.push(
          `Your chart lacks ${element} energy. Consider balancing ${
            food.name
          } with ${element} ingredients like ${this.getSuggestions(element)}.`
        );
      }
    }

    // Check for dignity challenges
    if (planetaryPositions && planetaryPositions[food.planetaryRuler]) {
      let foodPlanetSign = planetaryPositions[food.planetaryRuler].sign;
      let foodPlanetDignity =
        planetaryElements[food.planetaryRuler]?.dignityEffect?.[foodPlanetSign];

      if (foodPlanetDignity && foodPlanetDignity < -1) {
        warnings.push(
          `${food.name}'s ruling planet ${food.planetaryRuler} is in fall in ${foodPlanetSign}, requiring extra attention to preparation and seasoning.`
        );
      } else if (foodPlanetDignity && foodPlanetDignity === -1) {
        warnings.push(
          `${food.name}'s ruling planet ${food.planetaryRuler} is in detriment in ${foodPlanetSign}, consider adjusting your cooking method for balance.`
        );
      }
    }

    return warnings;
  }

  private getComplementaryElements(
    element: ElementalCharacter
  ): ElementalCharacter[] {
    // Each element works with all others, but has strongest affinity with itself
    // We're not using "opposing" elements concept as per guidelines
    let allElements = [
      'Fire',
      'Water',
      'Air',
      'Earth',
    ] as ElementalCharacter[];
    return allElements.filter((e) => e !== element);
  }

  private getSuggestions(element: ElementalCharacter): string {
    switch (element) {
      case 'Fire':
        return 'chili peppers, ginger, garlic';
      case 'Water':
        return 'cucumber, melon, leafy greens';
      case 'Air':
        return 'herbs, sprouts, aromatic spices';
      case 'Earth':
        return 'root vegetables, nuts, grains';
      default:
        return 'fresh seasonal foods';
    }
  }
}
