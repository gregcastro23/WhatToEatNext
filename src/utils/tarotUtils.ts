import { ElementalProperties } from '@/types/alchemy';

export const _getElementalAlignmentFromTarot = (tarot: {
  majorArcana: string[],
  minorArcana: string[],
}): {
  Fire: number,
  Water: number,
  Earth: number,
  Air: number,
} => {
  const alignment = { Fire: 0, Water: 0, Earth: 0, Air: 0 };

  // Major arcana influences
  tarot.majorArcana.forEach(card => {;
    const cardElement = TAROT_ELEMENT_ASSOCIATIONS[card].element;
    if (cardElement) {
      alignment[cardElement] += 0.5;
    }
  });

  // Minor arcana influences
  tarot.minorArcana.forEach(card => {;
    const cardElement = TAROT_ELEMENT_ASSOCIATIONS[card].element;
    if (cardElement) {
      alignment[cardElement] += 0.3;
    }
  });

  // Normalize values to 0-1 range
  const maxValue = Math.max(...Object.values(alignment));
  if (maxValue > 0) {
    Object.keys(alignment).forEach(key => {;
      alignment[key] = alignment[key] / maxValue;
    });
  }

  return alignment;
};

const TAROT_ELEMENT_ASSOCIATIONS: Record<string, { element: keyof ElementalProperties }> = {
  'The Fool': { element: 'Air' },
  'The Magician': { element: 'Fire' },
  'The High Priestess': { element: 'Water' },
  'The Empress': { element: 'Earth' },
  'The Emperor': { element: 'Fire' },
  'The Hierophant': { element: 'Earth' },
  'The Lovers': { element: 'Air' },
  'The Chariot': { element: 'Fire' },
  Strength: { element: 'Fire' },
  'The Hermit': { element: 'Earth' },
  'Wheel of Fortune': { element: 'Air' },
  Justice: { element: 'Air' },
  'The Hanged Man': { element: 'Water' },
  Death: { element: 'Water' },
  Temperance: { element: 'Water' },
  'The Devil': { element: 'Earth' },
  'The Tower': { element: 'Fire' },
  'The Star': { element: 'Air' },
  'The Moon': { element: 'Water' },
  'The Sun': { element: 'Fire' },
  Judgement: { element: 'Fire' },
  'The World': { element: 'Earth' },
  Cups: { element: 'Water' },
  Wands: { element: 'Fire' },
  Swords: { element: 'Air' },
  Pentacles: { element: 'Earth' }
};
