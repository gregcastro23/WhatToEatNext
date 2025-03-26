// src/utils/elementalUtils.ts

import type { ElementalBalance } from '@/types/recipe';

export const elementalUtils = {
    validateProperties(properties: Partial<ElementalBalance>): boolean {
        if (!properties) return false;
        
        const elements = ['Fire', 'Water', 'Earth', 'Air'];
        const hasAllElements = elements.every(element => 
            typeof properties[element] === 'number' && 
            !isNaN(properties[element]) && 
            properties[element] >= 0 && 
            properties[element] <= 1
        );
        
        if (!hasAllElements) return false;
        
        const total = Object.values(properties).reduce((sum, val) => sum + val, 0);
        return Math.abs(total - 1) < 0.01; // Allow for small floating point differences
    },

    normalizeProperties(properties: Partial<ElementalBalance>): ElementalBalance {
        const normalized: ElementalBalance = {
            Fire: 0.25,
            Water: 0.25,
            Earth: 0.25,
            Air: 0.25
        };

        if (!properties) return normalized;

        const total = Object.values(properties).reduce((sum, val) => sum + (val || 0), 0);
        if (total === 0) return normalized;

        // Normalize values to sum to 1
        for (const key of Object.keys(normalized)) {
            if (key in properties) {
                normalized[key] = properties[key] / total;
            }
        }

        return normalized;
    },

    getRecipeHarmony(recipe1: ElementalBalance, recipe2: ElementalBalance): number {
        if (!recipe1 || !recipe2) return 0;

        const elements = ['Fire', 'Water', 'Earth', 'Air'] as const;
        let totalDifference = 0;

        for (const element of elements) {
            const value1 = recipe1[element] || 0;
            const value2 = recipe2[element] || 0;
            totalDifference += Math.abs(value1 - value2);
        }

        // Convert total difference to harmony score (0-1)
        const harmony = 1 - (totalDifference / elements.length);
        return Math.max(0, Math.min(1, harmony)); // Clamp between 0 and 1
    },

    DEFAULT_ELEMENTAL_PROPERTIES: {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25
    } as const
};

export default elementalUtils;