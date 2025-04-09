import { Cuisine } from '@/components/CuisineRecommender';
import { culinaryTraditions } from '@/data/cuisines/culinaryTraditions';

export interface CuisineRecommendation extends Cuisine {
    compatibilityScore: number;
    elementalAlignment: Record<string, number>;
}

export async function getCuisineRecommendations(): Promise<Cuisine[]> {
    try {
        // Convert culinary traditions to Cuisine format
        const recommendations: Cuisine[] = Object.entries(culinaryTraditions).map(([id, tradition]) => ({
            id,
            name: id.charAt(0).toUpperCase() + id.slice(1),
            description: tradition.description || 'A unique culinary tradition',
            alchemicalProperties: tradition.elementalAlignment || {
                Fire: 0.25,
                Water: 0.25,
                Earth: 0.25,
                Air: 0.25
            },
            elementalProperties: tradition.elementalAlignment || {
                Fire: 0.25,
                Water: 0.25,
                Earth: 0.25,
                Air: 0.25
            },
            astrologicalInfluences: deriveAstrologicalInfluences(tradition)
        }));

        return recommendations;
    } catch (error) {
        console.error('Error getting cuisine recommendations:', error);
        return [];
    }
}

// Helper function to derive meaningful astrological influences from regional cuisines
function deriveAstrologicalInfluences(tradition: any): string[] {
    // If the tradition explicitly has astrological influences, use those
    if (tradition.astrologicalProfile?.influences && 
        tradition.astrologicalProfile.influences.length > 0 && 
        !tradition.astrologicalProfile.influences.includes('Universal')) {
        return tradition.astrologicalProfile.influences;
    }
    
    // Otherwise, use ruling planets from astrologicalProfile if available
    if (tradition.astrologicalProfile?.rulingPlanets && 
        tradition.astrologicalProfile.rulingPlanets.length > 0) {
        return tradition.astrologicalProfile.rulingPlanets;
    }
    
    // Collect influences from regional cuisines if available
    const influences = new Set<string>();
    
    if (tradition.regionalCuisines) {
        Object.values(tradition.regionalCuisines).forEach((region: any) => {
            if (region.astrologicalInfluences) {
                region.astrologicalInfluences.forEach((influence: string) => {
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