export const SUIT_TO_ELEMENT = {
    'Wands': 'Fire',
    'Cups': 'Water',
    'Pentacles': 'Earth',
    'Swords': 'Air'
};

export const SUIT_TO_TOKEN = {
    'Wands': 'Spirit',
    'Cups': 'Essence',
    'Pentacles': 'Matter',
    'Swords': 'Substance'
};

// Export tarot intelligence systems for use in the WhatToEatNext project
// (SUIT_TO_ELEMENT and SUIT_TO_TOKEN are already exported above)

// Alternative export for backward compatibility
export const TAROT_MAPPINGS_SUITE = {
  elements: SUIT_TO_ELEMENT,
  tokens: SUIT_TO_TOKEN
};

// Export for direct usage in tarot calculations
export const TAROT_MAPPING_SYSTEMS = {
  ELEMENTS: SUIT_TO_ELEMENT,
  TOKENS: SUIT_TO_TOKEN
}; 