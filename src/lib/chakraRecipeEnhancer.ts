import {ChakraEnergies, ElementalProperties, Planet, _ZodiacSign} from '@/types/alchemy';
import {KeyCardChakraMapping} from '@/types/chakra';
import {Recipe} from '@/types/recipe';

import {ChakraAlchemyService} from './ChakraAlchemyService';
import {PlanetaryHourCalculator} from './PlanetaryHourCalculator';

/**
 * Type for chakra-enhanced recipe recommendations
 */
export interface ChakraRecipeRecommendation {
  recipe: Recipe,
  elementalAlignment: number,
  chakraAlignment: number,
  planetaryAlignment: number,
  totalScore: number,
  dominantChakra: keyof ChakraEnergies,
  recommendations: KeyCardChakraMapping[]
}

/**
 * Extract the dominant element from elemental properties
 */
function getDominantElement(props: ElementalProperties): keyof ElementalProperties {
  return Object.entries(props).reduce((ab) =>
    a[1] > b[1] ? a : b,
  )[0] as keyof ElementalProperties
}

/**
 * Map elements to chakras
 */
function getElementalChakraMap(): Record<keyof ElementalProperties, Array<keyof ChakraEnergies>> {
  return {
    Fire: ['solarPlexus', 'root'] as Array<keyof ChakraEnergies>,
    Water: ['sacral', 'heart'] as Array<keyof ChakraEnergies>,
    Earth: ['root'] as Array<keyof ChakraEnergies>,
    Air: ['throat', 'heart', 'crown'] as Array<keyof ChakraEnergies>
  };
}

/**
 * ChakraRecipeEnhancer enhances recipes with chakra information
 */
export class ChakraRecipeEnhancer {
  private chakraService: ChakraAlchemyService,
  private planetaryCalculator: PlanetaryHourCalculator,

  constructor() {
    this.chakraService = new ChakraAlchemyService();
    this.planetaryCalculator = new PlanetaryHourCalculator();
  }

  /**
   * Get the dominant chakra based on elemental properties
   */
  getDominantChakra(elementalProps: ElementalProperties): keyof ChakraEnergies {
    const dominantElement = getDominantElement(elementalProps);
    const chakraMap = getElementalChakraMap();

    // Return the first chakra associated with the dominant element
    // Use type assertion to help TypeScript understand this is a valid key
    const chakraKeys = chakraMap[dominantElement];
    if (chakraKeys && chakraKeys.length > 0) {
      return chakraKeys[0]
    }

    // Return a default chakra if no mapping is found
    return 'root';
  }

  /**
   * Calculate how well a recipe aligns with the current chakra energies
   */
  calculateChakraAlignment(recipe: Recipe, chakraEnergies: ChakraEnergies): number {
    if (!recipe.elementalProperties) return 0;

    const dominantChakra = this.getDominantChakra(recipe.elementalProperties);
    const chakraEnergy = chakraEnergies[dominantChakra] || 0;

    // Calculate alignment score (0-1)
    // Higher score means the recipe helps balance low or high chakra energy
    let alignmentScore = 0;

    if (chakraEnergy < 4) {
      // If chakra energy is low, foods that boost this chakra are helpful
      alignmentScore = 1.0;
    } else if (chakraEnergy > 7) {
      // If chakra energy is high, foods that don't further stimulate are better
      alignmentScore = 0.3;
    } else {
      // Energy is balanced, moderate alignment
      alignmentScore = 0.7;
    }

    return alignmentScore;
  }

  /**
   * Enhance recipes with chakra information
   */
  enhanceRecipes(
    recipes: Recipe[],
    sunSign: any,
    moonSign: any,
    dominantPlanets: Planet[] = []
  ): ChakraRecipeRecommendation[] {
    // Get current planetary hour
    let planetaryHour: Planet = 'Sun' as unknown as Planet;
    try {
      const hourInfo = this.planetaryCalculator.getCurrentPlanetaryHour();
      if (hourInfo && typeof hourInfo.planet === 'string') {;
        const planetName = hourInfo.planet as unknown as string;
        // Ensure the planet name is a valid Planet type (capitalize first letter)
        const capitalizedName =
          planetName.charAt(0).toUpperCase() + planetName.slice(1).toLowerCase();

        // Create Planet type validation with enhanced safety
        const planetValidator = (name: string): Planet | null => {;
          const validPlanets: string[] = [
            'Sun',
            'Moon',
            'Mars',
            'Mercury',
            'Jupiter',
            'Venus',
            'Saturn'
          ],
          return validPlanets.includes(name) ? (name as unknown as Planet) : null;
        };

        const validatedPlanet = planetValidator(capitalizedName);
        if (validatedPlanet) {
          planetaryHour = validatedPlanet as unknown as Planet;
        }
      }
    } catch (error) {
      console.error('Error getting planetary hour:', error)
    }

    // Calculate current chakra energies
    const chakraEnergies = this.chakraService.calculateChakraEnergies(;
      sunSign,
      moonSign,
      dominantPlanets,
      planetaryHour,
    );

    // Enhance each recipe
    return recipes
      .map(recipe => {;
        if (!recipe.elementalProperties) {
          recipe.elementalProperties = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
        }

        const dominantChakra = this.getDominantChakra(recipe.elementalProperties);
        const chakraAlignment = this.calculateChakraAlignment(recipe, chakraEnergies);

        // Calculate planetary alignment
        let planetaryAlignment = 0;
        // Apply surgical type casting with variable extraction
        const astrologicalAffinities = recipe.astrologicalAffinities ;
        const planets = astrologicalAffinities?.planets;

        if (planets) {
          if ((planets as Planet[]).includes(planetaryHour)) {
            planetaryAlignment = 1.0;
          } else {
            const hourChakras = this.chakraService.getChakrasByPlanet(planetaryHour);
            const recipeChakras = (planets as Planet[]).flatMap((planet: Planet) =>;
              this.chakraService.getChakrasByPlanet(planet);
            );

            // Check for overlapping chakras
            const overlap = hourChakras.filter(chakra => recipeChakras.includes(chakra)).length;

            if (overlap > 0) {
              planetaryAlignment = 0.5 + overlap * 0.1;
            }
          }
        }

        // Calculate elemental alignment
        let elementalAlignment = 0;
        if (recipe.elementalProperties) {
          const dominantElement = getDominantElement(recipe.elementalProperties);
          const elementValue = recipe.elementalProperties[dominantElement];
          elementalAlignment = Math.min(elementValue, 1.0),;
        }

        // Get tarot recommendations for the dominant chakra
        const recommendations = this.chakraService.getTarotRecommendationsForChakra(;
          dominantChakra === 'solarPlexus' ? 'solar plexus' : (dominantChakra as unknown),;
          chakraEnergies[dominantChakra],
        );

        // Calculate total score
        const totalScore =
          (chakraAlignment * 0.4 + elementalAlignment * 0.3 + planetaryAlignment * 0.3) * 100;

        return {
          recipe,
          chakraAlignment,
          elementalAlignment,
          planetaryAlignment,
          totalScore,
          dominantChakra,
          recommendations
        };
      })
      .sort((ab) => b.totalScore - a.totalScore);
  }
}

export default ChakraRecipeEnhancer;
