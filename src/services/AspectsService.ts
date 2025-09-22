import type { PlanetaryPosition } from '@/types/celestial';
import { calculateAspects } from '@/utils/astrologyUtils';

export type MinimalPositions = Record<string, { sign: string, degree: number }>;

export class AspectsService {
  static toMinimal(positions: Record<string, PlanetaryPosition>): MinimalPositions {
    return Object.fromEntries(
      Object.entries(positions || {}).map(([kv]) => [
        k,
        { sign: String((v as any)?.sign || ''), degree: Number((v as any)?.degree || 0) }
      ]),
    ) as MinimalPositions;
  }

  static calculateFromPositions(positions: Record<string, PlanetaryPosition>) {
    const minimal = AspectsService.toMinimal(positions)
    const { _aspects, elementalEffects} = calculateAspects(minimal as any)
    return { aspects, elementalEffects };
  }
}

export const _aspectsService = AspectsService;
