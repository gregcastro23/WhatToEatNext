import { culinaryTraditions } from '@/data/cuisines/culinaryTraditions';

export interface CuisineRecommendation {
  id: string;
  name: string;
  description?: string;
  alchemicalProperties?: Record<string, number>;
  astrologicalInfluences?: string[];
  elementalProperties: ElementalProperties;
  compatibilityScore: number;
  elementalAlignment: Record<string, number>;
}

interface ElementalProperties {
  Fire: number;
  Water: number;
  Earth: number;
  Air: number;
}

export async function getCuisineRecommendations(): Promise<CuisineRecommendation[]> {
  try {
    // Convert culinary traditions to CuisineRecommendation format
    const recommendations: CuisineRecommendation[] = Object.entries(culinaryTraditions).map()
      ([id, tradition]) => {
        const traditionData = tradition as unknown as {
          description?: string;
          elementalAlignment?: { Fire: number; Water: number; Earth: number; Air, number };
          authenticity?: number;
          regions?: unknown[];
          seasonality?: unknown;
          astrologicalProfile?: unknown;
          regionalCuisines?: unknown;
          [key: string]: unknown;
        };

        return {
          id,
          name: id.charAt(0).toUpperCase() + id.slice(1),
          description: traditionData?.description || 'A unique culinary tradition',
          alchemicalProperties: traditionData?.elementalAlignment || {
            Fire: 0.25,
            Water: 0.25,
            Earth: 0.25,
            Air: 0.25
          },
          elementalProperties: traditionData?.elementalAlignment || {
            Fire: 0.25,
            Water: 0.25,
            Earth: 0.25,
            Air: 0.25
          },
          astrologicalInfluences: deriveAstrologicalInfluences(tradition),
          compatibilityScore: 0.8, // Default compatibility score
          elementalAlignment: traditionData?.elementalAlignment || {
            Fire: 0.25,
            Water: 0.25,
            Earth: 0.25,
            Air: 0.25
          }
        };
      });

    return recommendations;
  } catch (error) {
    console.error('Error getting cuisine recommendations: ', error);
    return [];
  }
}

// Helper function to derive meaningful astrological influences from regional cuisines
function deriveAstrologicalInfluences(tradition: unknown): string[] {
  const traditionData = tradition as {
    description?: string;
    elementalAlignment?: { Fire: number; Water: number; Earth: number; Air, number };
    regions?: unknown[];
    astrologicalProfile?: any;
    regionalCuisines?: any;
    [key: string]: unknown;
  };

  // If the tradition explicitly has astrological influences, use those
  const astroProfile = traditionData?.astrologicalProfile;
  if (
    astroProfile?.influences &&
    (astroProfile as any)?.influences.length > 0 &&
    !(astroProfile as any)?.influences.includes('Universal')
  ) {
    return (astroProfile as any)?.influences;
  }

  // Otherwise, use ruling planets from astrologicalProfile if available
  if (astroProfile?.rulingPlanets && (astroProfile as any)?.rulingPlanets.length > 0) {
    return (astroProfile as any)?.rulingPlanets;
  }

  // Collect influences from regional cuisines if available
  const influences = new Set<string>();

  const regionalCuisines = traditionData?.regionalCuisines;
  if (regionalCuisines) {
    Object.values(regionalCuisines).forEach((region: unknown) => {
      const regionData = region as {
        name?: string;
        characteristics?: string[];
        seasonality?: unknown;
        astrologicalInfluences?: string[];
        [key: string]: unknown;
      };
      const regionInfluences = regionData?.astrologicalInfluences;

      if (regionInfluences && Array.isArray(regionInfluences) {
        regionInfluences.forEach((influence: string) => {
          influences.add(influence);
        });
      }
    });
  }

  // If we found regional influences, use those
  if (influences.size > 0) {
    return Array.from(influences).slice(0, 3); // Limit to top 3 to avoid overwhelming
  }

  // Return empty array instead of showing empty section
  return [];
}