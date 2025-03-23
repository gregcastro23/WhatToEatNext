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
            astrologicalInfluences: tradition.astrologicalProfile?.influences || ['Universal']
        }));

        return recommendations;
    } catch (error) {
        console.error('Error getting cuisine recommendations:', error);
        return [];
    }
} 