/**
 * Astrological Test Data Types
 * 
 * Interface definitions for astrological service test data to replace any types
 */

export interface AstrologicalTestData {
  mockPlanetaryPositions?: Record<string, number>;
  testZodiacSign?: string;
  testLunarPhase?: string;
  testElementalInfluence?: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  };
  testDate?: Date;
  mockCoordinates?: {
    latitude: number;
    longitude: number;
  };
  testScenario?: string;
  expectedResults?: Record<string, unknown>;
}