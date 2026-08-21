import { useMemo } from "react";
import type { useUser } from "@/contexts/UserContext";
import type { useAstrologicalState } from "@/hooks/useAstrologicalState";
import type { DayOfWeek } from "@/types/menuPlanner";
import type {
  AstrologicalState,
  UserPersonalizationContext,
} from "@/utils/menuPlanner/recommendationBridge";
import { getPlanetaryDayCharacteristics } from "@/utils/planetaryDayRecommendations";

export function useAstroAndUserContext(
  astroState: ReturnType<typeof useAstrologicalState>,
  currentUser: ReturnType<typeof useUser>["currentUser"],
): {
  currentDay: DayOfWeek;
  planetaryDayInfo: ReturnType<typeof getPlanetaryDayCharacteristics>;
  isPersonalized: boolean;
  convertedAstroState: AstrologicalState;
  userContext: UserPersonalizationContext | undefined;
} {
  const currentDay = useMemo(() => new Date().getDay() as DayOfWeek, []);
  const planetaryDayInfo = useMemo(() => getPlanetaryDayCharacteristics(currentDay), [currentDay]);
  const isPersonalized = Boolean(currentUser?.natalChart);

  const convertedAstroState: AstrologicalState = useMemo(() => ({
    currentZodiac: String(astroState.currentZodiac ?? "aries"),
    lunarPhase: astroState.lunarPhase,
    activePlanets: astroState.activePlanets,
    domElements: astroState.domElements,
    currentPlanetaryHour: astroState.currentPlanetaryHour ?? undefined,
  }), [astroState]);

  const userContext: UserPersonalizationContext | undefined = useMemo(() => {
    if (!currentUser?.natalChart) return undefined;
    return {
      natalChart: currentUser.natalChart,
      prioritizeHarmony: true,
      stats: currentUser.stats,
    };
  }, [currentUser]);

  return { currentDay, planetaryDayInfo, isPersonalized, convertedAstroState, userContext };
}
