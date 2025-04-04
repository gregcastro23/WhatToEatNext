import { ZodiacSign, Planet, Element, TarotSuit, EnergyState, ChakraPosition } from './alchemy';

// Chakra names with positions
export interface Chakra {
  position: ChakraPosition;
  name: string;
  sanskritName: string;
  element: Element;
  primaryEnergyState: EnergyState;
  description: string;
}

// Definition of each chakra
export const CHAKRAS: Record<ChakraPosition, Chakra> = {
  'root': {
    position: 'root',
    name: 'Root Chakra',
    sanskritName: 'Muladhara',
    element: 'Earth',
    primaryEnergyState: 'Matter',
    description: 'Grounding, Security, Survival'
  },
  'sacral': {
    position: 'sacral',
    name: 'Sacral Chakra',
    sanskritName: 'Svadhisthana',
    element: 'Water',
    primaryEnergyState: 'Essence',
    description: 'Creativity, Emotions, Pleasure'
  },
  'solar plexus': {
    position: 'solar plexus',
    name: 'Solar Plexus Chakra',
    sanskritName: 'Manipura',
    element: 'Fire',
    primaryEnergyState: 'Essence',
    description: 'Personal Power, Confidence'
  },
  'heart': {
    position: 'heart',
    name: 'Heart Chakra',
    sanskritName: 'Anahata',
    element: 'Air',
    primaryEnergyState: 'Essence',
    description: 'Love, Compassion, Connection'
  },
  'throat': {
    position: 'throat',
    name: 'Throat Chakra',
    sanskritName: 'Vishuddha',
    element: 'Air',
    primaryEnergyState: 'Substance',
    description: 'Communication, Truth'
  },
  'brow': {
    position: 'brow',
    name: 'Third Eye Chakra',
    sanskritName: 'Ajna',
    element: 'Water',
    primaryEnergyState: 'Spirit',
    description: 'Intuition, Insight'
  },
  'crown': {
    position: 'crown',
    name: 'Crown Chakra',
    sanskritName: 'Sahasrara',
    element: 'Air',
    primaryEnergyState: 'Spirit',
    description: 'Spirituality, Enlightenment'
  }
};

// Major Arcana to Chakra mappings
export interface MajorArcanaChakra {
  cardName: string;
  chakraPosition: ChakraPosition;
  planet?: Planet;
  description: string;
}

export const MAJOR_ARCANA_CHAKRAS: MajorArcanaChakra[] = [
  {
    cardName: 'The Emperor',
    chakraPosition: 'root',
    planet: 'saturn',
    description: 'Represents structure, authority, and stability, which align with the Root Chakra\'s focus on security and foundation.'
  },
  {
    cardName: 'The Empress',
    chakraPosition: 'sacral',
    planet: 'venus',
    description: 'Symbolizes nurturing, creativity, and sensuality, perfectly matching the Sacral Chakra\'s themes.'
  },
  {
    cardName: 'The Tower',
    chakraPosition: 'solar plexus',
    planet: 'mars',
    description: 'The Tower\'s transformative energy and Mars\'s action-oriented nature reflect personal power and breakthroughs.'
  },
  {
    cardName: 'The Chariot',
    chakraPosition: 'solar plexus',
    description: 'Represents willpower, determination, and victory through effort, aligning with the Solar Plexus\'s focus on personal power.'
  },
  {
    cardName: 'The Lovers',
    chakraPosition: 'heart',
    planet: 'venus',
    description: 'Represent relationships and harmony, aligning with the Heart Chakra\'s focus on love and connection.'
  },
  {
    cardName: 'The Star',
    chakraPosition: 'heart',
    planet: 'neptune',
    description: 'Offers hope and healing, connecting to the Heart Chakra\'s themes of compassion and healing.'
  },
  {
    cardName: 'The Magician',
    chakraPosition: 'throat',
    planet: 'mercury',
    description: 'Represents communication, expression, and manifestation, fitting the Throat Chakra\'s focus on voice and truth.'
  },
  {
    cardName: 'The High Priestess',
    chakraPosition: 'brow',
    planet: 'moon',
    description: 'Symbolizes intuition, mystery, and inner wisdom, matching the Third Eye\'s focus on insight.'
  },
  {
    cardName: 'The Hanged Man',
    chakraPosition: 'brow',
    planet: 'neptune',
    description: 'Represents surrender, new perspective, and spiritual insight, aligning with the Third Eye Chakra.'
  },
  {
    cardName: 'The World',
    chakraPosition: 'crown',
    planet: 'saturn',
    description: 'Represents completion, wholeness, and spiritual mastery, aligning with the Crown Chakra\'s connection to higher consciousness.'
  },
  {
    cardName: 'Judgement',
    chakraPosition: 'crown',
    planet: 'pluto',
    description: 'Symbolizes rebirth, spiritual awakening, and transcendence, connecting to the Crown Chakra\'s theme of spiritual enlightenment.'
  }
];

// Minor Arcana suit to Chakra mappings
export interface SuitChakraMapping {
  suit: TarotSuit;
  primaryChakra: ChakraPosition;
  secondaryChakra?: ChakraPosition;
  element: Element;
  energyState: EnergyState;
  description: string;
}

export const SUIT_CHAKRA_MAPPINGS: SuitChakraMapping[] = [
  {
    suit: 'wands',
    primaryChakra: 'solar plexus',
    secondaryChakra: 'root',
    element: 'Fire',
    energyState: 'Spirit',
    description: 'Wands are driven by Mars, Jupiter, and the Sun, which emphasize action, confidence, and leadership.'
  },
  {
    suit: 'cups',
    primaryChakra: 'heart',
    secondaryChakra: 'sacral',
    element: 'Water',
    energyState: 'Essence',
    description: 'Cups, influenced by Moon, Mars, Jupiter, Neptune, and Pluto, deal with emotions, relationships, and intuition.'
  },
  {
    suit: 'swords',
    primaryChakra: 'throat',
    secondaryChakra: 'brow',
    element: 'Air',
    energyState: 'Substance',
    description: 'Swords, ruled by Mercury, Venus, Saturn, and Uranus, focus on thought, communication, and truth.'
  },
  {
    suit: 'pentacles',
    primaryChakra: 'root',
    secondaryChakra: 'solar plexus',
    element: 'Earth',
    energyState: 'Matter',
    description: 'Pentacles, influenced by Saturn, Venus, and Mercury, deal with the material world, practicality, and security.'
  }
];

// Key cards for each suit with their chakra associations
export interface KeyCardChakraMapping {
  cardName: string;
  suit: TarotSuit;
  chakraPosition: ChakraPosition;
  secondaryChakra?: ChakraPosition;
  zodiacAssociation?: ZodiacSign;
  planetaryAssociation?: Planet;
  description: string;
}

export const KEY_CARD_CHAKRA_MAPPINGS: KeyCardChakraMapping[] = [
  // Wands key cards
  {
    cardName: 'Ace of Wands',
    suit: 'wands',
    chakraPosition: 'solar plexus',
    description: 'Initiating action and confidence'
  },
  {
    cardName: '2 of Wands',
    suit: 'wands',
    chakraPosition: 'solar plexus',
    zodiacAssociation: 'aries',
    planetaryAssociation: 'mars',
    description: 'Decisiveness and planning'
  },
  {
    cardName: '3 of Wands',
    suit: 'wands',
    chakraPosition: 'solar plexus',
    zodiacAssociation: 'leo',
    planetaryAssociation: 'sun',
    description: 'Expansion and vision'
  },
  {
    cardName: '7 of Wands',
    suit: 'wands',
    chakraPosition: 'solar plexus',
    zodiacAssociation: 'aries',
    planetaryAssociation: 'mars',
    description: 'Standing your ground'
  },
  {
    cardName: '8 of Wands',
    suit: 'wands',
    chakraPosition: 'solar plexus',
    zodiacAssociation: 'sagittarius',
    planetaryAssociation: 'jupiter',
    description: 'Progress and momentum'
  },
  {
    cardName: '4 of Wands',
    suit: 'wands',
    chakraPosition: 'root',
    zodiacAssociation: 'sagittarius',
    planetaryAssociation: 'jupiter',
    description: 'Stability and celebration'
  },
  
  // Cups key cards
  {
    cardName: 'Ace of Cups',
    suit: 'cups',
    chakraPosition: 'heart',
    description: 'Pure emotion and love'
  },
  {
    cardName: '2 of Cups',
    suit: 'cups',
    chakraPosition: 'heart',
    zodiacAssociation: 'cancer',
    planetaryAssociation: 'moon',
    description: 'Connection and partnership'
  },
  {
    cardName: '3 of Cups',
    suit: 'cups',
    chakraPosition: 'heart',
    zodiacAssociation: 'cancer',
    description: 'Community and joy'
  },
  {
    cardName: '6 of Cups',
    suit: 'cups',
    chakraPosition: 'heart',
    zodiacAssociation: 'scorpio',
    description: 'Nostalgia and emotional bonds'
  },
  {
    cardName: '10 of Cups',
    suit: 'cups',
    chakraPosition: 'heart',
    zodiacAssociation: 'pisces',
    description: 'Family and harmony'
  },
  {
    cardName: '7 of Cups',
    suit: 'cups',
    chakraPosition: 'sacral',
    zodiacAssociation: 'scorpio',
    description: 'Imagination and choices'
  },
  
  // Swords key cards
  {
    cardName: 'Ace of Swords',
    suit: 'swords',
    chakraPosition: 'throat',
    description: 'Mental clarity and truth'
  },
  {
    cardName: '2 of Swords',
    suit: 'swords',
    chakraPosition: 'throat',
    zodiacAssociation: 'libra',
    planetaryAssociation: 'venus',
    description: 'Decision-making and communication'
  },
  {
    cardName: '3 of Swords',
    suit: 'swords',
    chakraPosition: 'throat',
    zodiacAssociation: 'libra',
    description: 'Painful truths'
  },
  {
    cardName: '8 of Swords',
    suit: 'swords',
    chakraPosition: 'throat',
    zodiacAssociation: 'gemini',
    planetaryAssociation: 'mercury',
    description: 'Self-expression and limits'
  },
  {
    cardName: '9 of Swords',
    suit: 'swords',
    chakraPosition: 'brow',
    zodiacAssociation: 'gemini',
    description: 'Anxiety and inner vision'
  },
  {
    cardName: '10 of Swords',
    suit: 'swords',
    chakraPosition: 'crown',
    zodiacAssociation: 'gemini',
    description: 'Endings and higher wisdom'
  },
  
  // Pentacles key cards
  {
    cardName: 'Ace of Pentacles',
    suit: 'pentacles',
    chakraPosition: 'root',
    description: 'New beginnings in the material world'
  },
  {
    cardName: '2 of Pentacles',
    suit: 'pentacles',
    chakraPosition: 'root',
    zodiacAssociation: 'capricorn',
    planetaryAssociation: 'saturn',
    description: 'Balance and stability'
  },
  {
    cardName: '4 of Pentacles',
    suit: 'pentacles',
    chakraPosition: 'root',
    zodiacAssociation: 'capricorn',
    description: 'Security and control'
  },
  {
    cardName: '9 of Pentacles',
    suit: 'pentacles',
    chakraPosition: 'root',
    secondaryChakra: 'solar plexus',
    zodiacAssociation: 'virgo',
    description: 'Self-sufficiency and success'
  },
  {
    cardName: '10 of Pentacles',
    suit: 'pentacles',
    chakraPosition: 'root',
    zodiacAssociation: 'virgo',
    description: 'Legacy and material abundance'
  },
  {
    cardName: '3 of Pentacles',
    suit: 'pentacles',
    chakraPosition: 'solar plexus',
    zodiacAssociation: 'capricorn',
    description: 'Craftsmanship and teamwork'
  }
];

// Summary mapping table for quick reference
export interface ChakraMappingSummary {
  chakra: ChakraPosition;
  majorArcana: string[];
  primarySuit?: TarotSuit;
  secondarySuit?: TarotSuit;
}

export const CHAKRA_MAPPING_SUMMARY: ChakraMappingSummary[] = [
  {
    chakra: 'root',
    majorArcana: ['The Emperor'],
    primarySuit: 'pentacles'
  },
  {
    chakra: 'sacral',
    majorArcana: ['The Empress'],
    secondarySuit: 'cups'
  },
  {
    chakra: 'solar plexus',
    majorArcana: ['The Tower', 'The Chariot'],
    primarySuit: 'wands',
    secondarySuit: 'pentacles'
  },
  {
    chakra: 'heart',
    majorArcana: ['The Lovers', 'The Star'],
    primarySuit: 'cups'
  },
  {
    chakra: 'throat',
    majorArcana: ['The Magician'],
    primarySuit: 'swords'
  },
  {
    chakra: 'brow',
    majorArcana: ['The High Priestess', 'The Hanged Man'],
    secondarySuit: 'swords'
  },
  {
    chakra: 'crown',
    majorArcana: ['The World', 'Judgement'],
    secondarySuit: 'swords'
  }
]; 