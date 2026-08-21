import React, { useState, useMemo } from "react";
import type { ElementalItem } from "@/calculations/alchemicalTransformation";
import type { ElementalCharacter, AlchemicalProperty } from "@/constants/planetaryElements";
import type { RulingPlanet } from "@/constants/planets";
import { useAlchemical } from "@/contexts/AlchemicalContext/hooks";
import { useAlchemicalData } from "@/contexts/AlchemicalDataContext";
import { cookingMethods } from "@/data/cooking/cookingMethods";
import type { Modality } from "@/data/ingredients/types";
import { useAlchemicalRecommendations } from "@/hooks/useAlchemicalRecommendations";
import type { LunarPhaseWithSpaces, ZodiacSign } from "@/types/alchemy";
import { RecommendationFilters } from "./recommendations/RecommendationFilters";
import { RecommendationSections } from "./recommendations/RecommendationSections";
import { RecommendationStats } from "./recommendations/RecommendationStats";
import {
  filterIngredientsByModality,
  transformCuisineToElemental,
  transformIngredientToElemental,
  transformMethodToElemental,
} from "./recommendations/recommendationTransforms";
import type { AlchemicalRecommendationsProps } from "./recommendations/types";

function resolvePlanetaryPositions(
  planetPositions: Record<RulingPlanet, number> | undefined,
  contextPositions: ReturnType<typeof useAlchemical>["planetaryPositions"],
): Record<RulingPlanet, number> {
  if (planetPositions) return planetPositions;
  const positions: Record<RulingPlanet, number> = {
    Sun: 0, Moon: 0, Mercury: 0, Venus: 0, Mars: 0,
    Jupiter: 0, Saturn: 0, Uranus: 0, Neptune: 0, Pluto: 0,
  };
  Object.entries(contextPositions).forEach(([planet, data]) => {
    if (planet in positions && typeof data === "object" && "degree" in data) {
      const deg = (data as { degree?: unknown }).degree;
      positions[planet as RulingPlanet] = typeof deg === "number" ? deg : 0;
    }
  });
  return positions;
}

function useRecommendationItemArrays(modalityFilter: Modality | "all"): {
  filteredIngredientsArray: ElementalItem[];
  cookingMethodsArray: ElementalItem[];
  cuisinesArray: ElementalItem[];
  dataLoading: boolean;
} {
  const { cuisines, ingredients: allIngredients, loading: dataLoading } = useAlchemicalData();

  const ingredientsArray = useMemo(() => {
    if (!allIngredients) return [];
    return Object.entries(allIngredients).map(([key, ing]) =>
      transformIngredientToElemental(key, ing as Parameters<typeof transformIngredientToElemental>[1]),
    );
  }, [allIngredients]);

  const cookingMethodsArray = useMemo(
    () => Object.entries(cookingMethods).map(([key, method]) => transformMethodToElemental(key, method)),
    [],
  );

  const cuisinesArray = useMemo(() => {
    if (!cuisines) return [];
    return Object.entries(cuisines).map(([key, cuisine]) =>
      transformCuisineToElemental(key, cuisine as Parameters<typeof transformCuisineToElemental>[1]),
    );
  }, [cuisines]);

  const filteredIngredientsArray = useMemo(
    () => filterIngredientsByModality(ingredientsArray, modalityFilter),
    [ingredientsArray, modalityFilter],
  );

  return { filteredIngredientsArray, cookingMethodsArray, cuisinesArray, dataLoading };
}

function useRecommendationFilterControls(): {
  targetElement: ElementalCharacter | undefined;
  targetProperty: AlchemicalProperty | undefined;
  modalityFilter: Modality | "all";
  setTargetElement: React.Dispatch<React.SetStateAction<ElementalCharacter | undefined>>;
  setTargetProperty: React.Dispatch<React.SetStateAction<AlchemicalProperty | undefined>>;
  setModalityFilter: React.Dispatch<React.SetStateAction<Modality | "all">>;
} {
  const [targetElement, setTargetElement] = useState<ElementalCharacter | undefined>(undefined);
  const [targetProperty, setTargetProperty] = useState<AlchemicalProperty | undefined>(undefined);
  const [modalityFilter, setModalityFilter] = useState<Modality | "all">("all");
  return { targetElement, targetProperty, modalityFilter, setTargetElement, setTargetProperty, setModalityFilter };
}

export interface RecommendationEngineResult {
  targetElement: ElementalCharacter | undefined;
  targetProperty: AlchemicalProperty | undefined;
  modalityFilter: Modality | "all";
  setTargetElement: React.Dispatch<React.SetStateAction<ElementalCharacter | undefined>>;
  setTargetProperty: React.Dispatch<React.SetStateAction<AlchemicalProperty | undefined>>;
  setModalityFilter: React.Dispatch<React.SetStateAction<Modality | "all">>;
  resolvedCurrentZodiac: ZodiacSign | null;
  resolvedLunarPhase: LunarPhaseWithSpaces;
  recommendations: ReturnType<typeof useAlchemicalRecommendations>["recommendations"];
  loading: boolean;
  error: Error | null;
  energeticProfile?: ReturnType<typeof useAlchemicalRecommendations>["energeticProfile"];
  dataLoading: boolean;
}

function useRecommendationEngine(props: AlchemicalRecommendationsProps): RecommendationEngineResult {
  const alchemicalContext = useAlchemical();
  const filters = useRecommendationFilterControls();
  const resolvedPositions = useMemo(
    () => resolvePlanetaryPositions(props.planetPositions, alchemicalContext.planetaryPositions),
    [props.planetPositions, alchemicalContext.planetaryPositions],
  );
  const resolvedCurrentZodiac = (props.currentZodiac !== undefined ? props.currentZodiac : alchemicalContext.zodiacSign) as ZodiacSign | null;
  const resolvedLunarPhase = (props.lunarPhase ?? alchemicalContext.lunarPhase) as LunarPhaseWithSpaces;
  const items = useRecommendationItemArrays(filters.modalityFilter);

  const hookResult = useAlchemicalRecommendations({
    ingredients: items.filteredIngredientsArray,
    cookingMethods: items.cookingMethodsArray,
    cuisines: items.cuisinesArray,
    planetPositions: resolvedPositions,
    isDaytime: props.isDaytime ?? alchemicalContext.isDaytime,
    targetElement: filters.targetElement,
    targetAlchemicalProperty: filters.targetProperty,
    count: 5,
    currentZodiac: resolvedCurrentZodiac,
    lunarPhase: resolvedLunarPhase,
    tarotElementBoosts: props.tarotElementBoosts,
    tarotPlanetaryBoosts: props.tarotPlanetaryBoosts,
    aspects: props.aspects ?? [],
  });

  return {
    ...filters,
    resolvedCurrentZodiac,
    resolvedLunarPhase,
    dataLoading: items.dataLoading,
    ...hookResult,
  };
}

const RecommendationStyles: React.FC = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    .alchemical-recommendations { padding: 1rem; max-width: 1200px; margin: 0 auto; }
    .stat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .stat { background-color: #f5f5f5; padding: 1rem; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .label { font-weight: 600; display: block; margin-bottom: 0.5rem; color: #555; }
    .value { font-size: 1.2rem; color: #222; }
    .filter-controls { display: flex; gap: 1rem; margin-bottom: 2rem; }
    .filter-group { display: flex; flex-direction: column; }
    .filter-group select { padding: 0.5rem; border-radius: 4px; border: 1px solid #ccc; min-width: 150px; }
    .recommendation-sections { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 2rem; }
    .recommendation-section { background-color: #fff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); padding: 1.5rem; }
    .recommendation-list { list-style: none; padding: 0; margin: 0; }
    .recommendation-item { border-bottom: 1px solid #eee; padding: 1rem 0; }
    .recommendation-item:last-child { border-bottom: none; }
    .item-details { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 0.5rem; margin-top: 0.5rem; }
    .detail { font-size: 0.9rem; }
    .item-modality { margin-top: 0.5rem; text-align: right; }
    .modality-badge { padding: 0.2rem 0.5rem; border-radius: 4px; background-color: #f0f0f0; color: #555; font-size: 0.8rem; }
  ` }} />
);

export const AlchemicalRecommendationsView: React.FC<AlchemicalRecommendationsProps> = (props) => {
  const {
    targetElement, targetProperty, modalityFilter,
    setTargetElement, setTargetProperty, setModalityFilter,
    resolvedCurrentZodiac, resolvedLunarPhase,
    recommendations, loading, error, energeticProfile, dataLoading,
  } = useRecommendationEngine(props);

  if (loading || dataLoading) return <div>Loading alchemical recommendations...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!recommendations) return <div>No recommendations available.</div>;

  return (
    <div className="alchemical-recommendations">
      <h2>Alchemical Recommendations</h2>
      <RecommendationStats
        recommendations={recommendations}
        currentZodiac={resolvedCurrentZodiac}
        lunarPhase={resolvedLunarPhase}
        energeticProfile={energeticProfile}
      />
      <RecommendationFilters
        targetElement={targetElement}
        targetProperty={targetProperty}
        modalityFilter={modalityFilter}
        onTargetElementChange={setTargetElement}
        onTargetPropertyChange={setTargetProperty}
        onModalityFilterChange={setModalityFilter}
      />
      <RecommendationSections recommendations={recommendations} />
      <RecommendationStyles />
    </div>
  );
};

export default AlchemicalRecommendationsView;
