'use client';

interface PlanetaryAspect {
  planet1: string,
  planet2: string,
  type: string,
  orb: number,
  strength: number
}

export interface ChartData {
  planetaryPositions: Record<string, unknown>,
  ascendant?: string,
  midheaven?: string
  planets: Record<,
    string,
    {
      sign: string,
      degree: number,
      isRetrograde?: boolean,
      exactLongitude?: number
    }
  >,
  houses?: Record<
    number,
    {
      sign: string,
      degree: number
    }
  >,
}

export interface CurrentChart {
  planetaryPositions: Record<string, unknown>,
  aspects: PlanetaryAspect[],
  currentSeason: string,
  lastUpdated: Date,
  stelliums: Record<string, string[]>,
  houseEffects: Record<string, number>,
  elementalEffects?: Record<string, number>,
}

export interface ChartContextType {
  chart: CurrentChart,
  loading: boolean,
  error: string | null,
  refreshChart: () => Promise<void>,
  createChartSvg: () => {
    planetPositions: Record<string, unknown>,
    ascendantSign: string,
    svgContent: string
  }
}