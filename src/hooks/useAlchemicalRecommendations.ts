import { useState, useEffect } from "react";
import { RecommendationAdapter } from "../services/RecommendationAdapter";
import type { ElementalItem } from "../calculations/alchemicalTransformation";
import type {
  ElementalCharacter,
  AlchemicalProperty,
} from "../constants/planetaryElements";
import type { RulingPlanet } from "../constants/planets";
import type { AlchemicalRecommendations } from "../services/AlchemicalTransformationService";
import type {
  AlchemicalItem,
  AlchemicalProperties,
  ElementalProperties,
  LunarPhaseWithSpaces,
  PlanetaryAspect,
  ThermodynamicProperties,
  ZodiacSign,
} from "../types/alchemy";

// Mirrors RecommendationAdapter's internal (unexported) PlanetData interface —
// the exact shape RecommendationAdapter.initialize's first parameter expects.
interface PlanetPositionData {
  sign?: string;
  degree?: number;
  isRetrograde?: boolean;
  exactLongitude?: number;
  speed?: number;
}

export interface UseAlchemicalRecommendationsProps {
  ingredients: ElementalItem[];
  cookingMethods: ElementalItem[];
  cuisines: ElementalItem[];
  planetPositions: Record<RulingPlanet, number>;
  isDaytime: boolean;
  targetElement?: ElementalCharacter;
  targetAlchemicalProperty?: AlchemicalProperty;
  count?: number;
  currentZodiac?: ZodiacSign | null;
  lunarPhase?: LunarPhaseWithSpaces;
  tarotElementBoosts?: Record<ElementalCharacter, number>;
  tarotPlanetaryBoosts?: Record<string, number>;
  aspects?: PlanetaryAspect[];
}

interface AlchemicalRecommendationResults {
  recommendations: AlchemicalRecommendations | null;
  transformedIngredients: AlchemicalItem[];
  transformedMethods: AlchemicalItem[];
  transformedCuisines: AlchemicalItem[];
  loading: boolean;
  error: Error | null;
  energeticProfile?: {
    dominantElement: ElementalCharacter;
    dominantProperty: AlchemicalProperty;
    heat: number;
    entropy: number;
    reactivity: number;
    gregsEnergy: number;
    elementalBalance: {
      Fire: number;
      Water: number;
      Earth: number;
      Air: number;
    };
    alchemicalProperties: {
      Spirit: number;
      Essence: number;
      Matter: number;
      Substance: number;
    };
  };
}

/**
 * Hook to get alchemical recommendations based on planetary positions
 *
 * @returns Recommendations, transformed data, loading state, and any errors
 */
export const useAlchemicalRecommendations = ({
  ingredients,
  cookingMethods,
  cuisines,
  planetPositions,
  isDaytime,
  targetElement: _targetElement,
  targetAlchemicalProperty: _targetAlchemicalProperty,
  count = 5,
  currentZodiac = null,
  lunarPhase,
  tarotElementBoosts,
  tarotPlanetaryBoosts,
  aspects = [],
}: UseAlchemicalRecommendationsProps): AlchemicalRecommendationResults => {
  const [recommendations, setRecommendations] =
    useState<AlchemicalRecommendations | null>(null);
  const [transformedIngredients, setTransformedIngredients] = useState<
    AlchemicalItem[]
  >([]);
  const [transformedMethods, setTransformedMethods] = useState<
    AlchemicalItem[]
  >([]);
  const [transformedCuisines, setTransformedCuisines] = useState<
    AlchemicalItem[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [energeticProfile, setEnergeticProfile] =
    useState<AlchemicalRecommendationResults["energeticProfile"]>();

  useEffect(() => {
    const fetchRecommendations = (): void => {
      try {
        setLoading(true);

        // Configure an adapter for alchemical transformations
        const adapter = new RecommendationAdapter(
          ingredients,
          cookingMethods,
          cuisines,
        );

        // Initialize with planetary data and context
        // NOTE: planetPositions is declared as Record<RulingPlanet, number> (plain
        // per-planet degrees) but RecommendationAdapter.initialize expects
        // Record<string, PlanetData> (objects with sign/degree/etc). This works at
        // runtime only because RecommendationAdapter's position-conversion loop has a
        // `typeof data === 'number'` fallback that treats a bare number as
        // `{ degree: data }`. Opaque cast preserves that exact runtime path.
        adapter.initialize(
          planetPositions as unknown as Record<string, PlanetPositionData>,
          isDaytime,
          currentZodiac ?? null,
          lunarPhase ?? null,
          tarotElementBoosts,
          tarotPlanetaryBoosts,
          aspects,
        );

        // Get recommendations
        const recs: AlchemicalRecommendations = {
          topIngredients: adapter.getRecommendedIngredients(count).items,
          topMethods: adapter.getRecommendedCookingMethods(count).items,
          topCuisines: adapter.getRecommendedCuisines(count).items,
          dominantElement: adapter.getDominantElement() ?? "Fire",
          dominantAlchemicalProperty:
            (adapter.getDominantAlchemicalProperty() ??
              "Spirit") as AlchemicalProperty,
          heat: adapter.getHeatIndex() ?? 0.5,
          entropy: adapter.getEntropyIndex() ?? 0.5,
          reactivity: adapter.getReactivityIndex() ?? 0.5,
          gregsEnergy: adapter.getGregsEnergyIndex() ?? 0.5,
        };

        // Store the recommendations with unified type conversion for cross-import compatibility
        setRecommendations(recs);

        // Apply deep type conversion to resolve cross-import conflicts
        // NOTE: this helper is currently unused (never invoked below) but is retyped
        // in place rather than removed, to keep this pass types-only.
        const _convertToLocalAlchemicalItem = (
          items: unknown[],
        ): AlchemicalItem[] =>
          items.map((item) => {
            const itemData = item as Record<string, unknown>;
            // Create a new object that fully satisfies the alchemicalTransformation.AlchemicalItem interface
            const convertedItem = {
              ...itemData,
              // Ensure all required AlchemicalItem properties are present
              elementalProperties: (itemData.elementalProperties as ElementalProperties | undefined) ?? {
                Fire: 0.25,
                Water: 0.25,
                Earth: 0.25,
                Air: 0.25,
              },
              alchemicalProperties: (itemData.alchemicalProperties as AlchemicalProperties | undefined) ?? {
                Spirit: 0.25,
                Essence: 0.25,
                Matter: 0.25,
                Substance: 0.25,
              },
              // Add required properties for alchemicalTransformation.AlchemicalItem
              transformedElementalProperties: (itemData
                .transformedElementalProperties as ElementalProperties | undefined) ??
                (itemData.elementalProperties as ElementalProperties | undefined) ?? {
                  Fire: 0.25,
                  Water: 0.25,
                  Earth: 0.25,
                  Air: 0.25,
                },
              heat: (itemData.heat as number | undefined) ?? 0.5,
              entropy: (itemData.entropy as number | undefined) ?? 0.5,
              reactivity: (itemData.reactivity as number | undefined) ?? 0.5,
              gregsEnergy: (itemData.gregsEnergy as number | undefined) ?? (itemData.energy as number | undefined) ?? 0.5,
              kalchm: (itemData.kalchm as number | undefined) ?? 1.0,
              monica: (itemData.monica as number | undefined) ?? 0.5,
              transformations: (itemData.transformations as unknown[] | undefined) ?? [],
              seasonalResonance: (itemData.seasonalResonance as unknown[] | undefined) ?? [],
              thermodynamicProperties: (itemData.thermodynamicProperties as ThermodynamicProperties | undefined) ?? {
                heat: (itemData.heat as number | undefined) ?? 0.5,
                entropy: (itemData.entropy as number | undefined) ?? 0.5,
                reactivity: (itemData.reactivity as number | undefined) ?? 0.5,
                gregsEnergy: (itemData.gregsEnergy as number | undefined) ?? (itemData.energy as number | undefined) ?? 0.5,
              },
            };
            return convertedItem as unknown as AlchemicalItem;
          });

        setTransformedIngredients(
          adapter.getAllTransformedIngredients(),
        );
        setTransformedMethods(
          adapter.getAllTransformedMethods(),
        );
        setTransformedCuisines(
          adapter.getAllTransformedCuisines(),
        );

        // Create an energetic profile for the current recommendations
        const profile = {
          dominantElement: recs.dominantElement,
          dominantProperty: recs.dominantAlchemicalProperty,
          heat: recs.heat,
          entropy: recs.entropy,
          reactivity: recs.reactivity,
          gregsEnergy: recs.gregsEnergy,
          elementalBalance: {
            Fire: 0,
            Water: 0,
            Earth: 0,
            Air: 0,
          },
          alchemicalProperties: {
            Spirit: 0,
            Essence: 0,
            Matter: 0,
            Substance: 0,
          },
        };

        // Calculate average elemental values from top ingredients
        if (recs.topIngredients.length > 0) {
          recs.topIngredients.forEach((item) => {
            profile.elementalBalance.Fire +=
              item.elementalProperties.Fire /
              recs.topIngredients.length;
            profile.elementalBalance.Water +=
              item.elementalProperties.Water /
              recs.topIngredients.length;
            profile.elementalBalance.Earth +=
              item.elementalProperties.Earth /
              recs.topIngredients.length;
            profile.elementalBalance.Air +=
              item.elementalProperties.Air /
              recs.topIngredients.length;

            profile.alchemicalProperties.Spirit +=
              item.alchemicalProperties.Spirit /
              recs.topIngredients.length;
            profile.alchemicalProperties.Essence +=
              item.alchemicalProperties.Essence /
              recs.topIngredients.length;
            profile.alchemicalProperties.Matter +=
              item.alchemicalProperties.Matter /
              recs.topIngredients.length;
            profile.alchemicalProperties.Substance +=
              item.alchemicalProperties.Substance /
              recs.topIngredients.length;
          });
        }

        setEnergeticProfile(profile);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Unknown error occurred"),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [
    ingredients,
    cookingMethods,
    cuisines,
    planetPositions,
    isDaytime,
    currentZodiac,
    lunarPhase,
    tarotElementBoosts,
    tarotPlanetaryBoosts,
    aspects,
    count,
  ]);

  return {
    recommendations,
    transformedIngredients,
    transformedMethods,
    transformedCuisines,
    loading,
    error,
    energeticProfile,
  };
};
