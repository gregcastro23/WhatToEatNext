
export const elements = {
    'Fire': {
        heat: 1.0,
        dryness: 0.8,
        transformation: 0.7,
        expansion: 0.6
    },
    'Water': {
        cold: 0.9,
        moisture: 1.0,
        fluidity: 0.8,
        dissolution: 0.7
    },
    'Air': {
        movement: 0.9,
        lightness: 1.0,
        dispersion: 0.8,
        communication: 0.7
    },
    'Earth': {
        stability: 1.0,
        density: 0.9,
        nourishment: 0.8,
        structure: 0.7
    }
};
export const elementalInteractions = {
    'Fire': {
        'Water': 0.7,
        'Earth': 0.7,
        'Air': 0.8,
        'Fire': 1.0 // self - highest compatibility
    },
    'Water': {
        'Fire': 0.7,
        'Earth': 0.8,
        'Air': 0.7,
        'Water': 1.0 // self - highest compatibility
    },
    'Earth': {
        'Fire': 0.7,
        'Water': 0.8,
        'Air': 0.7,
        'Earth': 1.0 // self - highest compatibility
    },
    'Air': {
        'Fire': 0.8,
        'Water': 0.7,
        'Earth': 0.7,
        'Air': 1.0 // self - highest compatibility
    }
};
export const elementalFunctions = {
    /**
     * Calculate the elemental affinity between two sets of properties
     */
    calculateAffinity: (props1, props2) => {
        let affinity = 0;
        let count = 0;
        for (const [element1, value1] of Object.entries(props1)) {
            for (const [element2, value2] of Object.entries(props2)) {
                if (elementalInteractions[element1]?.[element2]) {
                    affinity += value1 * value2 * elementalInteractions[element1][element2];
                    count++;
                }
            }
        }
        return count > 0 ? affinity / count : 0;
    },
    /**
     * Get dominant element from properties
     */
    getDominantElement: (props) => {
        return Object.entries(props).reduce((a, b) => b[1] > a[1] ? b : a)[0];
    },
    /**
     * Check if elements are complementary
     */
    areComplementary: (element1, element2) => {
        return elementalInteractions[element1][element2] > 0.5;
    },
    /**
     * Get element balance score
     */
    getBalanceScore: (props) => {
        const values = Object.values(props);
        const average = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((a, b) => a + Math.pow(b - average, 2), 0) / values.length;
        return 1 - Math.sqrt(variance); // 1 is perfect balance, 0 is complete imbalance
    },
    /**
     * Suggest complementary elements
     */
    suggestComplementaryElements: (props) => {
        const dominant = elementalFunctions.getDominantElement(props);
        return Object.keys(elementalInteractions).filter(element => elementalInteractions[element][dominant] > 0.5 &&
            !(element in props));
    }
};
export const ELEMENT_COMBINATIONS = {
    harmonious: [
        ['Fire', 'Fire'],
        ['Water', 'Water'],
        ['Air', 'Air'],
        ['Earth', 'Earth'],
        ['Fire', 'Air'],
        ['Water', 'Earth']
    ]
};
export const ELEMENT_AFFINITIES = { 
    Fire: ['Fire', 'Air'],
    Water: ['Water', 'Earth'],
    Air: ['Air', 'Fire'],
    Earth: ['Earth', 'Water']
};
const elementalMappings = {
    elements: elements,
    elementalInteractions: elementalInteractions,
    elementalFunctions: elementalFunctions
};
export default elementalMappings;
