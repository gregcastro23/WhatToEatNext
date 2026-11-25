import type { PlanetaryPosition } from "@/types/celestial";
import { calculateAspects } from "@/utils/astrologyUtils";

export type MinimalPositions = Record<string, { sign: string; degree: number }>;

export class AspectsService {
  static toMinimal(
    positions: Record<string, Partial<PlanetaryPosition> | undefined>,
  ): MinimalPositions {
    return Object.fromEntries(
      Object.entries(positions || {}).map(([k, v]) => [
        k,
        {
          sign: String(v?.sign ?? ""),
          degree: Number(v?.degree ?? 0),
        },
      ]),
    );
  }

  static calculateFromPositions(positions: Record<string, PlanetaryPosition>) {
    const minimal = AspectsService.toMinimal(positions);
    const { aspects, elementalEffects } = calculateAspects(minimal);
    return { aspects, elementalEffects };
  }
}

export const _aspectsService = AspectsService;
