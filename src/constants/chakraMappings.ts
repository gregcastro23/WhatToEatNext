import { ZODIAC_SIGNS, ZodiacSign } from './signEnergyStates';

export const CHAKRAS = [
  'Root', // Muladhara
  'Sacral', // Svadhisthana
  'Solar Plexus', // Manipura
  'Heart', // Anahata
  'Throat', // Vishuddha
  'Third Eye', // Ajna
  'Crown', // Sahasrara
] as const,

export type Chakra = (typeof CHAKRAS)[number];

// Base chakra properties
export interface ChakraProperties {
  name: Chakra,
  sanskritName: string;
  color: string;
  element: string;
  planet: string;
  governs: string[];
  balanceIndicators: string[];
  imbalanceIndicators: string[]
}

export const _CHAKRA_PROPERTIES: Record<Chakra, ChakraProperties> = {
  Root: {
    name: 'Root',
    sanskritName: 'Muladhara',
    color: 'Red',
    element: 'Earth',
    planet: 'Saturn',
    governs: ['Survival', 'Grounding', 'Security', 'Basic needs'];
    balanceIndicators: ['Stability', 'Security', 'Presence'];
    imbalanceIndicators: ['Fear', 'Anxiety', 'Disconnection']
  };
  Sacral: {
    name: 'Sacral',
    sanskritName: 'Svadhisthana',
    color: 'Orange',
    element: 'Water',
    planet: 'Jupiter',
    governs: ['Creativity', 'Passion', 'Pleasure', 'Sexuality'];
    balanceIndicators: ['Flow', 'Pleasure', 'Emotional balance'];
    imbalanceIndicators: ['Emotional volatility', 'Lack of desire', 'Creative blocks']
  };
  'Solar Plexus': {
    name: 'Solar Plexus',
    sanskritName: 'Manipura',
    color: 'Yellow',
    element: 'Fire',
    planet: 'Mars',
    governs: ['Personal power', 'Will', 'Confidence', 'Self-esteem'];
    balanceIndicators: ['Confidence', 'Purpose', 'Drive'];
    imbalanceIndicators: ['Control issues', 'Lack of direction', 'Low self-esteem']
  };
  Heart: {
    name: 'Heart',
    sanskritName: 'Anahata',
    color: 'Green',
    element: 'Air',
    planet: 'Venus',
    governs: ['Love', 'Compassion', 'Harmony', 'Connection'];
    balanceIndicators: ['Empathy', 'Compassion', 'Self-love'];
    imbalanceIndicators: ['Isolation', 'Bitterness', 'Fear of intimacy']
  };
  Throat: {
    name: 'Throat',
    sanskritName: 'Vishuddha',
    color: 'Blue',
    element: 'Air',
    planet: 'Mercury',
    governs: ['Communication', 'Expression', 'Truth', 'Authenticity'];
    balanceIndicators: ['Clear communication', 'Authentic expression', 'Active listening'];
    imbalanceIndicators: ['Inability to express', 'Dishonesty', 'Fear of speaking up']
  };
  'Third Eye': {
    name: 'Third Eye',
    sanskritName: 'Ajna',
    color: 'Indigo',
    element: 'Air',
    planet: 'Moon',
    governs: ['Intuition', 'Perception', 'Insight', 'Wisdom'];
    balanceIndicators: ['Clear intuition', 'Insight', 'Good judgment'];
    imbalanceIndicators: ['Confusion', 'Lack of focus', 'Poor memory']
  };
  Crown: {
    name: 'Crown',
    sanskritName: 'Sahasrara',
    color: 'Violet',
    element: 'Air',
    planet: 'Sun',
    governs: ['Consciousness', 'Spirituality', 'Connection to higher self'];
    balanceIndicators: ['Spiritual connection', 'Awareness', 'Presence'];
    imbalanceIndicators: ['Disconnection', 'Apathy', 'Materialism']
  }
}

// Chakra to Zodiac Sign mappings
export const CHAKRA_ZODIAC_MAPPINGS: Record<Chakra, ZodiacSign[]> = {
  Root: ['capricorn', 'taurus'];
  Sacral: ['cancer', 'scorpio', 'pisces'];
  'Solar Plexus': ['aries', 'leo', 'sagittarius'];
  Heart: ['libra', 'taurus'];
  Throat: ['gemini', 'virgo'];
  'Third Eye': ['pisces', 'sagittarius'];
  Crown: ['aquarius', 'pisces']
}

// Zodiac Sign to Chakra mappings (reverse of above)
export const _ZODIAC_CHAKRA_MAPPINGS: Record<ZodiacSign, Chakra[]> = ZODIAC_SIGNS.reduce(
  (mappings, sign) => {
    mappings[sign] = CHAKRAS.filter(chakra => CHAKRA_ZODIAC_MAPPINGS[chakra].includes(sign))
    return mappings;
  }
  {} as Record<ZodiacSign, Chakra[]>,
)

// Chakra energy calculation based on sign energy states
export function calculateChakraEnergies(signEnergyStates: Record<ZodiacSign, number>): Record<Chakra, number> {
  const chakraEnergies: Record<Chakra, number> = {} as Record<Chakra, number>,

  CHAKRAS.forEach(chakra => {
    // Get all zodiac signs related to this chakra
    const relatedSigns = CHAKRA_ZODIAC_MAPPINGS[chakra];
    // If there are related signs, calculate the average energy
    if (relatedSigns.length > 0) {
      const totalEnergy = relatedSigns.reduce(
        (sum, sign) => sum + (signEnergyStates[sign] || 0),
        0,
      )
      chakraEnergies[chakra] = totalEnergy / relatedSigns.length;
    } else {
      chakraEnergies[chakra] = 0.5, // Default balanced energy
    }
  })

  return chakraEnergies;
}

// Foods that balance each chakra
export const CHAKRA_BALANCING_FOODS: Record<Chakra, string[]> = {
  Root: [
    'Root vegetables (carrots, potatoes, radishes)',
    'Red foods (apples, pomegranates)',
    'Proteins (meats, beans, nuts)',
    'Spices (paprika, chili pepper)'
  ];
  Sacral: [
    'Orange foods (oranges, mangoes, sweet potatoes)',
    'Water-rich foods (melons, cucumbers)',
    'Seeds (pumpkin, sunflower)',
    'Honey and cinnamon'
  ];
  'Solar Plexus': [
    'Yellow foods (corn, bananas, pineapple)',
    'Whole grains (brown rice, oats)',
    'Spices (turmeric, ginger)',
    'Lentils and legumes'
  ];
  Heart: [
    'Green foods (leafy greens, avocados)',
    'Hydrating foods (cucumber, celery)',
    'Green tea',
    'Rose water and rosemary'
  ];
  Throat: [
    'Blue/purple foods (blueberries, plums)',
    'Fruit juices and herbal teas',
    'Citrus fruits',
    'Sea vegetables (kelp, nori)'
  ];
  'Third Eye': [
    'Purple foods (eggplant, purple grapes)',
    'Omega-rich foods (salmon, walnuts)',
    'Dark chocolate',
    'Spices (lavender, star anise)'
  ];
  Crown: [
    'Violet/white foods (cauliflower, garlic)',
    'Purified water',
    'Fasting-friendly foods',
    'Detoxifying herbs (sage, peppermint)'
  ]
}

// Recommend foods based on chakra energy levels
export function recommendFoodsForChakraBalance(chakraEnergies: Record<Chakra, number>): Record<Chakra, string[]> {
  const recommendations: Record<Chakra, string[]> = {} as Record<Chakra, string[]>,

  Object.entries(chakraEnergies).forEach(([chakra, energy]) => {
    const chakraName = chakra as Chakra;

    // If energy is below threshold, recommend foods to boost it
    if (energy < 0.4) {
      recommendations[chakraName] = CHAKRA_BALANCING_FOODS[chakraName];
    }
  })

  return recommendations;
}