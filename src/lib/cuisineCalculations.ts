import { Cuisine } from '@/components/CuisineRecommender';
import { culinaryTraditions } from '@/data/cuisines/culinaryTraditions';

export interface CuisineRecommendation extends Cuisine {
    compatibilityScore: number;
    elementalAlignment: Record<string, number>;
}

export async function getCuisineRecommendations(): Promise<Cuisine[]> {
    try {
        // Convert culinary traditions to Cuisine format
        const recommendations: Cuisine[] = Object.entries(culinaryTraditions).map(([id, tradition]) => {
            const traditionData = tradition as unknown;
            
            return {
                id,
                name: id.charAt(0).toUpperCase() + id.slice(1),
                description: (traditionData as unknown as { description?: string })?.description || 'A unique culinary tradition',
                alchemicalProperties: (traditionData as unknown as { elementalAlignment?: unknown })?.elementalAlignment || {
                    Fire: 0.25,
                    Water: 0.25,
                    Earth: 0.25,
                    Air: 0.25
                },
                elementalProperties: (traditionData as unknown as { elementalAlignment?: unknown })?.elementalAlignment || {
                    Fire: 0.25,
                    Water: 0.25,
                    Earth: 0.25,
                    Air: 0.25
                },
                astrologicalInfluences: deriveAstrologicalInfluences(tradition)
            };
        });

        return recommendations;
    } catch (error) {
        // console.error('Error getting cuisine recommendations:', error);
        return [];
    }
}

// Helper function to derive meaningful astrological influences from regional cuisines
function deriveAstrologicalInfluences(tradition: unknown): string[] {
    const traditionData = tradition as unknown;
    
    // If the tradition explicitly has astrological influences, use those
    const astroProfile = traditionData?.astrologicalProfile;
    if (astroProfile?.influences && 
        astroProfile.influences.length > 0 && 
        !astroProfile.influences.includes('Universal')) {
        return astroProfile.influences;
    }
    
    // Otherwise, use ruling planets from astrologicalProfile if available
    if (astroProfile?.rulingPlanets && 
        astroProfile.rulingPlanets.length > 0) {
        return astroProfile.rulingPlanets;
    }
    
    // Collect influences from regional cuisines if available
    const influences = new Set<string>();
    
    const regionalCuisines = traditionData?.regionalCuisines;
    if (regionalCuisines) {
        Object.values(regionalCuisines).forEach((region: unknown) => {
            const regionData = region as unknown;
            const regionInfluences = regionData?.astrologicalInfluences;
            
            if (regionInfluences && Array.isArray(regionInfluences)) {
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