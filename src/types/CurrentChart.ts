import { PlanetaryPosition } from './astrology';

export interface CurrentChart {
  timestamp: number;
  date: string;
  positions: Record<string, PlanetaryPosition>;
  houses: Record<number, string>;
  ascendant?: string;
  moonPhase?: {
    phase: string;
    illumination: number;
  };
  dominantPlanet?: string;
  dominantElement?: string;
  dominantModality?: string;
}
