import { culinaryTraditions } from "@/data/cuisines/culinaryTraditions";
import type { ElementalProperties } from "@/types/alchemy";
import { createLogger } from "@/utils/logger";

const _logger = createLogger("cuisineCalculations");

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

interface AstrologicalProfile {
  influences?: string[];
  rulingPlanets?: string[];
}

interface TraditionData {
  description?: string;
  elementalAlignment?: ElementalProperties;
  authenticity?: number;
  regions?: unknown[];
  seasonality?: unknown;
  astrologicalProfile?: AstrologicalProfile;
  regionalCuisines?: Record<string, { astrologicalInfluences?: string[] }>;
  [key: string]: unknown;
}

export function getCuisineRecommendations(): Promise<
  CuisineRecommendation[]
> {
  try {
    // Convert culinary traditions to CuisineRecommendation format
    const recommendations: CuisineRecommendation[] = Object.entries(
      culinaryTraditions,
    ).map(([id, tradition]) => {
      const traditionData = tradition as unknown as TraditionData;

      return {
        id,
        name: id.charAt(0).toUpperCase() + id.slice(1),
        description: traditionData.description ?? "A unique culinary tradition",
        alchemicalProperties: traditionData.elementalAlignment ?? {
          Fire: 0.25,
          Water: 0.25,
          Earth: 0.25,
          Air: 0.25,
        },
        elementalProperties: traditionData.elementalAlignment ?? {
          Fire: 0.25,
          Water: 0.25,
          Earth: 0.25,
          Air: 0.25,
        },
        astrologicalInfluences: deriveAstrologicalInfluences(tradition),
        compatibilityScore: 0.8, // Default compatibility score
        elementalAlignment: traditionData.elementalAlignment ?? {
          Fire: 0.25,
          Water: 0.25,
          Earth: 0.25,
          Air: 0.25,
        },
      };
    });

    return Promise.resolve(recommendations);
  } catch (error) {
    _logger.error("Error getting cuisine recommendations: ", error);
    return Promise.resolve([]);
  }
}

// Helper function to derive meaningful astrological influences from regional cuisines
function deriveAstrologicalInfluences(tradition: unknown): string[] {
  const traditionData = tradition as TraditionData;

  // If the tradition explicitly has astrological influences, use those
  const astroProfile = traditionData.astrologicalProfile;
  if (
    astroProfile?.influences &&
    astroProfile.influences.length > 0 &&
    !astroProfile.influences.includes("Universal")
  ) {
    return astroProfile.influences;
  }

  // Otherwise, use ruling planets from astrologicalProfile if available
  if (astroProfile?.rulingPlanets && astroProfile.rulingPlanets.length > 0) {
    return astroProfile.rulingPlanets;
  }

  // Collect influences from regional cuisines if available
  const influences = new Set<string>();

  const { regionalCuisines } = traditionData;
  if (regionalCuisines && typeof regionalCuisines === "object") {
    Object.values(regionalCuisines).forEach((region) => {
      const regionInfluences = region.astrologicalInfluences;

      if (Array.isArray(regionInfluences)) {
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
