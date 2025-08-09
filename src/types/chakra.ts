import { TarotSuit } from './alchemy';
import { ZodiacSign, Planet, Element } from './celestial';

// Define chakra positions
export type ChakraPosition =
  | 'root'
  | 'sacral'
  | 'solarPlexus'
  | 'heart'
  | 'throat'
  | 'brow'
  | 'crown'
  | 'thirdEye';

// Define Sanskrit names mapping
export type ChakraSanskritName =
  | 'Muladhara'
  | 'Swadhisthana'
  | 'Manipura'
  | 'Anahata'
  | 'Vishuddha'
  | 'Ajna'
  | 'Sahasrara';

// Define chakra properties
export interface ChakraProperty {
  name: string;
  sanskritName: ChakraSanskritName;
  element: string;
  color: string;
  description: string;
  governs: string[];
  balanceIndicators: string[];
  imbalanceIndicators: string[];
  planet?: Planet;
}

// Define chakra properties by position
export type ChakraProperties = Record<ChakraPosition, ChakraProperty>;

// Define a type for chakra energies (defined as interface below)

// Define chakra mapping for tarot/major arcana
export interface KeyCardChakraMapping {
  cardName: string;
  chakraPosition: ChakraPosition;
  planet?: Planet;
  description: string;
}

// Define alchemical energy states
export type AlchemicalEnergyState = 'Spirit' | 'Substance' | 'Essence' | 'Matter';

// Define chakra-zodiac mappings
export interface ChakraZodiacMapping {
  chakra: ChakraPosition;
  zodiacSigns: string[];
}

// Define food category
export interface ChakraFood {
  name: string;
  chakra: ChakraPosition;
  element?: string;
  benefits: string[];
}

// Define zodiac-chakra mappings
export type ZodiacChakraMappings = Record<string, ChakraPosition[]>;

// Define chakra balancing foods
export type ChakraBalancingFoods = Record<ChakraPosition, string[]>;

// Constants for reference
export const CHAKRAS: ChakraProperties = {
  root: {
    name: 'Root Chakra',
    sanskritName: 'Muladhara',
    element: 'Earth',
    color: 'Red',
    description: 'Foundation, stability, security',
    governs: ['Basic survival', 'Stability', 'Groundedness'],
    balanceIndicators: ['Security', 'Stability', 'Groundedness'],
    imbalanceIndicators: ['Fear', 'Anxiety', 'Survival issues'],
    planet: 'Saturn',
  },
  sacral: {
    name: 'Sacral Chakra',
    sanskritName: 'Swadhisthana',
    element: 'Water',
    color: 'Orange',
    description: 'Creativity, emotion, pleasure',
    governs: ['Creativity', 'Sexuality', 'Emotions'],
    balanceIndicators: ['Passion', 'Joy', 'Healthy boundaries'],
    imbalanceIndicators: ['Emotional issues', 'Addiction', 'Detachment'],
    planet: 'Jupiter',
  },
  solarPlexus: {
    name: 'Solar Plexus Chakra',
    sanskritName: 'Manipura',
    element: 'Fire',
    color: 'Yellow',
    description: 'Willpower, confidence, self-esteem',
    governs: ['Personal power', 'Will', 'Assertiveness'],
    balanceIndicators: ['Confidence', 'Motivation', 'Purpose'],
    imbalanceIndicators: ['Control issues', 'Lack of direction', 'Perfectionism'],
    planet: 'Mars',
  },
  heart: {
    name: 'Heart Chakra',
    sanskritName: 'Anahata',
    element: 'Air',
    color: 'Green',
    description: 'Love, compassion, harmony',
    governs: ['Love', 'Compassion', 'Forgiveness'],
    balanceIndicators: ['Empathy', 'Openness', 'Connection'],
    imbalanceIndicators: ['Grief', 'Isolation', 'Resentment'],
    planet: 'Venus',
  },
  throat: {
    name: 'Throat Chakra',
    sanskritName: 'Vishuddha',
    element: 'Air',
    color: 'Blue',
    description: 'Communication, expression, truth',
    governs: ['Communication', 'Self-expression', 'Truth'],
    balanceIndicators: ['Clear communication', 'Authentic expression', 'Active listening'],
    imbalanceIndicators: ['Communication issues', 'Dishonesty', 'Inability to express'],
    planet: 'Mercury',
  },
  brow: {
    name: 'Third Eye Chakra',
    sanskritName: 'Ajna',
    element: 'Light',
    color: 'Indigo',
    description: 'Intuition, insight, vision',
    governs: ['Intuition', 'Imagination', 'Vision'],
    balanceIndicators: ['Clear insight', 'Strong intuition', 'Wisdom'],
    imbalanceIndicators: ['Confusion', 'Poor intuition', 'Lack of focus'],
    planet: 'Moon',
  },
  crown: {
    name: 'Crown Chakra',
    sanskritName: 'Sahasrara',
    element: 'Thought',
    color: 'Violet',
    description: 'Consciousness, spirituality, awareness',
    governs: ['Connection to higher self', 'Spirituality', 'Universal consciousness'],
    balanceIndicators: ['Enlightenment', 'Spiritual connection', 'Inner wisdom'],
    imbalanceIndicators: ['Closed-mindedness', 'Isolation', 'Over-intellectualization'],
    planet: 'Sun',
  },
  thirdEye: {
    name: 'Third Eye Chakra',
    sanskritName: 'Ajna',
    element: 'Light',
    color: 'Indigo',
    description: 'Intuition, insight, vision',
    governs: ['Intuition', 'Imagination', 'Vision'],
    balanceIndicators: ['Clear insight', 'Strong intuition', 'Wisdom'],
    imbalanceIndicators: ['Confusion', 'Poor intuition', 'Lack of focus'],
    planet: 'Moon',
  },
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
    planet: 'Saturn',
    description:
      "Represents structure, authority, and stability, which align with the Root Chakra's focus on security and foundation.",
  },
  {
    cardName: 'The Empress',
    chakraPosition: 'sacral',
    planet: 'Venus',
    description:
      "Symbolizes nurturing, creativity, and sensuality, perfectly matching the Sacral Chakra's themes.",
  },
  {
    cardName: 'The Tower',
    chakraPosition: 'solarPlexus',
    planet: 'Mars',
    description:
      "The Tower's transformative energy and Mars's action-oriented nature reflect personal power and breakthroughs.",
  },
  {
    cardName: 'The Chariot',
    chakraPosition: 'solarPlexus',
    description:
      "Represents willpower, determination, and victory through effort, aligning with the Solar Plexus's focus on personal power.",
  },
  {
    cardName: 'The Lovers',
    chakraPosition: 'heart',
    planet: 'Venus',
    description:
      "Represent relationships and harmony, aligning with the Heart Chakra's focus on love and connection.",
  },
  {
    cardName: 'The Star',
    chakraPosition: 'heart',
    planet: 'Neptune',
    description:
      "Offers hope and healing, connecting to the Heart Chakra's themes of compassion and healing.",
  },
  {
    cardName: 'The Magician',
    chakraPosition: 'throat',
    planet: 'Mercury',
    description:
      "Represents communication, expression, and manifestation, fitting the Throat Chakra's focus on voice and truth.",
  },
  {
    cardName: 'The High Priestess',
    chakraPosition: 'brow',
    planet: 'Moon',
    description:
      "Symbolizes intuition, mystery, and inner wisdom, matching the Third Eye's focus on insight.",
  },
  {
    cardName: 'The Hanged Man',
    chakraPosition: 'brow',
    planet: 'Neptune',
    description:
      'Represents surrender, new perspective, and spiritual insight, aligning with the Third Eye Chakra.',
  },
  {
    cardName: 'The World',
    chakraPosition: 'crown',
    planet: 'Saturn',
    description:
      "Represents completion, wholeness, and spiritual mastery, aligning with the Crown Chakra's connection to higher consciousness.",
  },
  {
    cardName: 'Judgement',
    chakraPosition: 'crown',
    planet: 'Pluto',
    description:
      "Symbolizes rebirth, spiritual awakening, and transcendence, connecting to the Crown Chakra's theme of spiritual enlightenment.",
  },
];

// Minor Arcana suit to Chakra mappings
export interface SuitChakraMapping {
  suit: TarotSuit;
  primaryChakra: ChakraPosition;
  secondaryChakra?: ChakraPosition;
  element: Element;
  energyState: AlchemicalEnergyState;
  description: string;
}

export const SUIT_CHAKRA_MAPPINGS: SuitChakraMapping[] = [
  {
    suit: 'wands',
    primaryChakra: 'solarPlexus',
    secondaryChakra: 'root',
    element: 'Fire',
    energyState: 'Spirit',
    description:
      'Wands are driven by Mars, Jupiter, and the Sun, which emphasize action, confidence, and leadership.',
  },
  {
    suit: 'cups',
    primaryChakra: 'heart',
    secondaryChakra: 'sacral',
    element: 'Water',
    energyState: 'Essence',
    description:
      'Cups, influenced by Moon, Mars, Jupiter, Neptune, and Pluto, deal with emotions, relationships, and intuition.',
  },
  {
    suit: 'swords',
    primaryChakra: 'throat',
    secondaryChakra: 'brow',
    element: 'Air',
    energyState: 'Substance',
    description:
      'Swords, ruled by Mercury, Venus, Saturn, and Uranus, focus on thought, communication, and truth.',
  },
  {
    suit: 'pentacles',
    primaryChakra: 'root',
    secondaryChakra: 'solarPlexus',
    element: 'Earth',
    energyState: 'Matter',
    description:
      'Pentacles, influenced by Saturn, Venus, and Mercury, deal with the material world, practicality, and security.',
  },
];

// Key card to chakra mappings (tarot cards and their planetary/chakra associations)
export const KEY_CARD_CHAKRA_MAPPINGS: KeyCardChakraMapping[] = [
  {
    cardName: 'The Fool',
    chakraPosition: 'crown',
    planet: 'Uranus',
    description:
      "Represents new beginnings, innocence, and spontaneity, connecting to the Crown Chakra's spiritual openness.",
  },
  {
    cardName: 'The Magician',
    chakraPosition: 'throat',
    planet: 'Mercury',
    description:
      'Represents communication, manifestation, and creative expression, aligning with the Throat Chakra.',
  },
  {
    cardName: 'The High Priestess',
    chakraPosition: 'brow',
    planet: 'Moon',
    description:
      "Symbolizes intuition, mystery, and inner wisdom, matching the Third Eye's focus on insight.",
  },
  {
    cardName: 'The Empress',
    chakraPosition: 'sacral',
    planet: 'Venus',
    description:
      "Symbolizes nurturing, creativity, and sensuality, perfectly matching the Sacral Chakra's themes.",
  },
  {
    cardName: 'The Emperor',
    chakraPosition: 'root',
    planet: 'Mars',
    description:
      "Represents structure, authority, and stability, which align with the Root Chakra's focus on security and foundation.",
  },
  {
    cardName: 'The Hierophant',
    chakraPosition: 'throat',
    planet: 'Jupiter',
    description:
      "Represents spiritual wisdom, tradition, and teaching, connecting to the Throat Chakra's expression of truth.",
  },
  {
    cardName: 'The Lovers',
    chakraPosition: 'heart',
    planet: 'Venus',
    description:
      "Represent relationships and harmony, aligning with the Heart Chakra's focus on love and connection.",
  },
  {
    cardName: 'The Chariot',
    chakraPosition: 'solarPlexus',
    planet: 'Moon',
    description:
      "Represents willpower, determination, and victory through effort, aligning with the Solar Plexus's focus on personal power.",
  },
  {
    cardName: 'Strength',
    chakraPosition: 'solarPlexus',
    planet: 'Sun',
    description:
      "Symbolizes courage, inner strength, and mastery of emotions, connecting to the Solar Plexus's themes of personal power.",
  },
  {
    cardName: 'The Hermit',
    chakraPosition: 'brow',
    planet: 'Mercury',
    description:
      "Represents introspection, inner guidance, and solitude, aligning with the Third Eye Chakra's themes of insight and wisdom.",
  },
  {
    cardName: 'Wheel of Fortune',
    chakraPosition: 'crown',
    planet: 'Jupiter',
    description:
      "Symbolizes cycles, destiny, and cosmic order, connecting to the Crown Chakra's universal consciousness.",
  },
  {
    cardName: 'Justice',
    chakraPosition: 'heart',
    planet: 'Saturn',
    description:
      "Represents fairness, truth, and karmic balance, which relate to the Heart Chakra's themes of harmony and balance.",
  },
  {
    cardName: 'The Hanged Man',
    chakraPosition: 'brow',
    planet: 'Neptune',
    description:
      'Represents surrender, new perspective, and spiritual insight, aligning with the Third Eye Chakra.',
  },
  {
    cardName: 'Death',
    chakraPosition: 'root',
    planet: 'Pluto',
    description:
      "Symbolizes transformation, endings, and rebirth, connecting to the Root Chakra's themes of survival and fundamental change.",
  },
  {
    cardName: 'Temperance',
    chakraPosition: 'heart',
    planet: 'Jupiter',
    description:
      "Represents balance, moderation, and harmony, aligning with the Heart Chakra's integrative nature.",
  },
  {
    cardName: 'The Devil',
    chakraPosition: 'root',
    planet: 'Saturn',
    description:
      "Symbolizes materialism, bondage, and shadow aspects, relating to the Root Chakra's concerns with basic instincts and security.",
  },
  {
    cardName: 'The Tower',
    chakraPosition: 'root',
    planet: 'Mars',
    description:
      "Represents sudden upheaval, revelation, and destruction of false structures, connecting to the Root Chakra's foundations.",
  },
  {
    cardName: 'The Star',
    chakraPosition: 'heart',
    planet: 'Venus',
    description:
      "Symbolizes hope, inspiration, and divine connection, aligning with the Heart Chakra's themes of love and healing.",
  },
  {
    cardName: 'The Moon',
    chakraPosition: 'brow',
    planet: 'Moon',
    description:
      "Represents intuition, illusion, and the subconscious mind, connecting to the Third Eye Chakra's psychic perception.",
  },
  {
    cardName: 'The Sun',
    chakraPosition: 'solarPlexus',
    planet: 'Sun',
    description:
      "Symbolizes joy, success, and vitality, aligning with the Solar Plexus Chakra's themes of personal power and confidence.",
  },
  {
    cardName: 'Judgement',
    chakraPosition: 'crown',
    planet: 'Pluto',
    description:
      "Represents rebirth, awakening, and transcendence, connecting to the Crown Chakra's spiritual enlightenment.",
  },
  {
    cardName: 'The World',
    chakraPosition: 'crown',
    planet: 'Saturn',
    description:
      "Symbolizes completion, fulfillment, and integration of all elements, connecting to the Crown Chakra's wholeness.",
  },
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
    primarySuit: 'pentacles',
  },
  {
    chakra: 'sacral',
    majorArcana: ['The Empress'],
    secondarySuit: 'cups',
  },
  {
    chakra: 'solarPlexus',
    majorArcana: ['The Tower', 'The Chariot'],
    primarySuit: 'wands',
    secondarySuit: 'pentacles',
  },
  {
    chakra: 'heart',
    majorArcana: ['The Lovers', 'The Star'],
    primarySuit: 'cups',
  },
  {
    chakra: 'throat',
    majorArcana: ['The Magician'],
    primarySuit: 'swords',
  },
  {
    chakra: 'brow',
    majorArcana: ['The High Priestess', 'The Hanged Man'],
    secondarySuit: 'swords',
  },
  {
    chakra: 'crown',
    majorArcana: ['The World', 'Judgement'],
    secondarySuit: 'swords',
  },
];
export interface ChakraEnergies {
  root: number;
  sacral: number;
  solarPlexus: number;
  heart: number;
  throat: number;
  thirdEye: number;
  crown: number;
  brow: number;
}

// Export alias for compatibility
export type Chakra = ChakraProperty;
