import type { ElementalBalance } from '@/types/recipe';

export class ElementalCalculator {
    static calculateMatchScore(
        recipeProperties?: Record<string, number> | null,
        currentBalance?: Record<string, number | string> | null,
        recipe?: { mealType?: string | string[], season?: string | string[] }
    ): number {
        if (!recipeProperties || !currentBalance) {
            return 0.7;
        }

        try {
            const elements = ['Fire', 'Water', 'Earth', 'Air'];
            let score = 0;
            let totalWeight = 0;

            // Calculate elemental match
            elements.forEach(element => {
                if (typeof recipeProperties[element] === 'number' && 
                    typeof currentBalance[element] === 'number') {
                    const recipeValue = recipeProperties[element] as number;
                    const balanceValue = currentBalance[element] as number;
                    const weight = balanceValue;
                    score += (1 - Math.abs(recipeValue - balanceValue)) * weight;
                    totalWeight += weight;
                }
            });

            // Normalize base score
            let baseScore = totalWeight > 0 ? score / totalWeight : 0.6;
            
            // Apply time of day matching
            const timeOfDay = currentBalance.timeOfDay as string;
            const mealTypes = Array.isArray(recipe?.mealType) ? recipe.mealType : [recipe?.mealType];
            
            // Time of day matching
            let timeMatch = false;
            if (timeOfDay === 'morning' && mealTypes.includes('breakfast')) timeMatch = true;
            if (timeOfDay === 'lunch' && mealTypes.includes('lunch')) timeMatch = true;
            if (timeOfDay === 'afternoon' && (mealTypes.includes('lunch') || mealTypes.includes('snack'))) timeMatch = true;
            if ((timeOfDay === 'evening' || timeOfDay === 'night') && mealTypes.includes('dinner')) timeMatch = true;
            if (mealTypes.includes('all')) timeMatch = true;

            // Significantly boost score for time-appropriate meals
            if (timeMatch) {
                baseScore = baseScore * 1.5;
            } else {
                baseScore = baseScore * 0.5;
            }

            // Season matching
            const currentSeason = currentBalance.season as string;
            const seasons = Array.isArray(recipe?.season) ? recipe.season : [recipe?.season];
            if (seasons.includes('all') || seasons.includes(currentSeason)) {
                baseScore = baseScore * 1.2;
            }

            // Ensure final score is between 0.6 and 1.0
            return Math.min(1, Math.max(0.6, baseScore));

        } catch (error) {
            console.error('Error calculating match score:', error);
            return 0.7;
        }
    }

    static getCurrentElementalBalance(): Record<string, number | string> {
        // Initialize with base values
        const balance: Record<string, number | string> = {
            Fire: 0.25,
            Water: 0.25,
            Earth: 0.25,
            Air: 0.25,
            season: '',
            timeOfDay: ''
        };

        const now = new Date();
        const hour = now.getHours();
        const month = now.getMonth() + 1; // JavaScript months are 0-based

        // More precise time of day determination
        if (hour >= 5 && hour < 11) {
            balance.timeOfDay = 'morning';
            balance.Fire += 0.2;
            balance.Air += 0.2;
            balance.Water -= 0.2;
            balance.Earth -= 0.2;
        } else if (hour >= 11 && hour < 14) {
            balance.timeOfDay = 'lunch';
            balance.Fire += 0.3;
            balance.Air += 0.1;
            balance.Water -= 0.2;
            balance.Earth -= 0.2;
        } else if (hour >= 14 && hour < 17) {
            balance.timeOfDay = 'afternoon';
            balance.Fire += 0.1;
            balance.Air += 0.2;
            balance.Water -= 0.1;
            balance.Earth -= 0.2;
        } else if (hour >= 17 && hour < 22) {
            balance.timeOfDay = 'evening';
            balance.Water += 0.2;
            balance.Earth += 0.2;
            balance.Fire -= 0.2;
            balance.Air -= 0.2;
        } else {
            balance.timeOfDay = 'night';
            balance.Water += 0.3;
            balance.Earth += 0.1;
            balance.Fire -= 0.2;
            balance.Air -= 0.2;
        }

        // More precise seasonal determination
        if (month === 12 || month === 1 || month === 2) {
            balance.season = 'winter';
            balance.Water += 0.2;
            balance.Earth += 0.3;
            balance.Fire -= 0.3;
            balance.Air -= 0.2;
        } else if (month >= 3 && month <= 5) {
            balance.season = 'spring';
            balance.Air += 0.2;
            balance.Water += 0.2;
            balance.Fire -= 0.2;
            balance.Earth -= 0.2;
        } else if (month >= 6 && month <= 8) {
            balance.season = 'summer';
            balance.Fire += 0.3;
            balance.Air += 0.2;
            balance.Water -= 0.3;
            balance.Earth -= 0.2;
        } else {
            balance.season = 'autumn';
            balance.Earth += 0.2;
            balance.Air += 0.2;
            balance.Fire -= 0.2;
            balance.Water -= 0.2;
        }

        // Ensure values stay between 0 and 1
        ['Fire', 'Water', 'Earth', 'Air'].forEach(element => {
            const value = balance[element] as number;
            balance[element] = Math.max(0, Math.min(1, value));
        });

        console.log('Current elemental balance:', {
            time: now.toLocaleTimeString(),
            hour,
            month,
            timeOfDay: balance.timeOfDay,
            season: balance.season,
            elements: {
                Fire: balance.Fire,
                Water: balance.Water,
                Earth: balance.Earth,
                Air: balance.Air
            }
        });

        return balance;
    }
}

export default ElementalCalculator; 