"use strict";
import { wholeGrains } from "./wholeGrains";
import { refinedGrains } from "./refinedGrains";
import { pseudoGrains } from "./pseudoGrains";
import { fixIngredientMappings } from "../../../utils/elementalUtils";
import { createElementalProperties } from "../../../utils/elemental/elementalUtils";

// Create a comprehensive collection of all grain types
export const allGrains = fixIngredientMappings({
    ...wholeGrains,
    ...refinedGrains,
    ...pseudoGrains
});

// Fix the raw grains object with proper ingredient mapping structure
const rawGrains = {
    'whole': {
        elementalProperties: createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }),
        name: "Whole Grains",
        category: "grain",
        ...wholeGrains
    },
    'refined': {
        elementalProperties: createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }),
        name: "Refined Grains",
        category: "grain",
        ...refinedGrains
    },
    'pseudo': {
        elementalProperties: createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }),
        name: "Pseudo Grains",
        category: "grain",
        ...pseudoGrains
    }
};

// Apply the fix to ensure all required properties exist
export const grains = fixIngredientMappings(rawGrains);

// Create a list of all grain names for easy reference
export const grainNames = Object.keys(allGrains);

// Keep the preparation methods as a separate object
export const grainPreparationMethods = {
    'basic_cooking': {
        'boiling': {
            method: 'covered pot',
            water_ratio: 'varies by grain',
            tips: [
                'salt Water before adding grain',
                'do not stir frequently',
                'let rest after cooking'
            ]
        },
        'steaming': {
            method: 'steam basket or rice cooker',
            benefits: [
                'retains nutrients',
                'prevents sticking',
                'consistent results'
            ]
        }
    },
    'soaking': {
        'whole_grains': {
            duration: '8-12 hours',
            benefits: [
                'reduces cooking time',
                'improves digestibility',
                'activates nutrients'
            ],
            method: 'room temperature water'
        },
        'quick_method': {
            duration: '1-2 hours',
            benefits: [
                'shorter prep time',
                'some improvement in cooking'
            ],
            method: 'hot Water (not boiling)'
        }
    }
};

export default grains;
