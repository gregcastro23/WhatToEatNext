import { ElementalProperties } from '../types/alchemy';

export const getElementalAlignmentFromTarot = (tarot: {
  majorArcana: string[];
  minorArcana: string[];
}): {
  Fire: number;
  Water: number;
  Earth: number;
  Air: number;
} => {
  const alignment = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
  
  // Major arcana influences
  tarot.majorArcana.forEach(card => {
    const cardElement = TAROT_ELEMENT_ASSOCIATIONS[card]?.element;
    if (cardElement) {
      alignment[cardElement] += 0.5;
    }
  });

  // Minor arcana influences
  tarot.minorArcana.forEach(card => {
    const cardElement = TAROT_ELEMENT_ASSOCIATIONS[card]?.element;
    if (cardElement) {
      alignment[cardElement] += 0.3;
    }
  });

  // Normalize values to 0-1 range
  const maxValue = Math.max(...Object.values(alignment));
  if (maxValue > 0) {
    Object.keys(alignment).forEach(key => {
      alignment[key] = alignment[key] / maxValue;
    });
  }

  return alignment;
};

const TAROT_ELEMENT_ASSOCIATIONS: Record<string, { element: keyof ElementalProperties }> = {
  'the fool': { element: 'Air' },
  'the magician': { element: 'Fire' },
  'the high priestess': { element: 'Water' },
  'the empress': { element: 'Earth' },
  'the emperor': { element: 'Fire' },
  'the hierophant': { element: 'Earth' },
  'the lovers': { element: 'Air' },
  'the chariot': { element: 'Fire' },
  'strength': { element: 'Fire' },
  'the hermit': { element: 'Earth' },
  'wheel of fortune': { element: 'Air' },
  'justice': { element: 'Air' },
  'the hanged man': { element: 'Water' },
  'death': { element: 'Water' },
  'temperance': { element: 'Water' },
  'the devil': { element: 'Earth' },
  'the tower': { element: 'Fire' },
  'the star': { element: 'Air' },
  'the moon': { element: 'Water' },
  'the sun': { element: 'Fire' },
  'judgement': { element: 'Fire' },
  'the world': { element: 'Earth' },
  'cups': { element: 'Water' },
  'wands': { element: 'Fire' },
  'swords': { element: 'Air' },
  'pentacles': { element: 'Earth' }
}; 