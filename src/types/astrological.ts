export interface PlanetaryPositions {
  // Existing planet fields...

  northNode?: {
    sign: string;
    degree: number;
    exactLongitude?: number;
    isRetrograde: boolean;
  };

  southNode?: {
    sign: string;
    degree: number;
    exactLongitude?: number;
    isRetrograde: boolean;
  };
}
