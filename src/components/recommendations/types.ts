import type { ElementalCharacter, AlchemicalProperty } from "@/constants/planetaryElements";
import type { RulingPlanet } from "@/constants/planets";
import type { Modality } from "@/data/ingredients/types";
import type { LunarPhaseWithSpaces, ZodiacSign, PlanetaryAspect } from "@/types/alchemy";

export interface AlchemicalRecommendationsProps {
  planetPositions?: Record<RulingPlanet, number>;
  isDaytime?: boolean;
  currentZodiac?: ZodiacSign | null;
  lunarPhase?: LunarPhaseWithSpaces;
  tarotElementBoosts?: Record<ElementalCharacter, number>;
  tarotPlanetaryBoosts?: Record<string, number>;
  aspects?: PlanetaryAspect[];
}

export interface RecommendationFilterState {
  targetElement: ElementalCharacter | undefined;
  targetProperty: AlchemicalProperty | undefined;
  modalityFilter: Modality | "all";
  setTargetElement: (val: ElementalCharacter | undefined) => void;
  setTargetProperty: (val: AlchemicalProperty | undefined) => void;
  setModalityFilter: (val: Modality | "all") => void;
}
