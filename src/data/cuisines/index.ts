import type { Cuisine } from '@/types/cuisine';
import { japanese } from './japanese';
import { middleEastern } from './middle-eastern';
import thaiCuisine from './thai';
import { korean } from './korean';
import { italian } from './italian';
import { french } from './french';
import { indian } from './indian';
import { mexican } from './mexican';
import { vietnamese } from './vietnamese';
import { chinese } from './chinese';
import { greek } from './greek';
import { russian } from './russian';
import { african } from './african';
import hsca from './hsca';

export const cuisines: Record<string, Cuisine> = {
  Japanese: japanese,
  "Middle-Eastern": middleEastern,
  Thai: thaiCuisine,
  Korean: korean,
  Italian: italian,
  French: french,
  Indian: indian,
  Mexican: mexican,
  Vietnamese: vietnamese,
  Chinese: chinese,
  Greek: greek,
  Russian: russian,
  African: african,
  HSCA: hsca,
} as const;

// Type-safe cuisine names
export type CuisineName = keyof typeof cuisines;

// Export individual cuisines for direct imports
export {
  japanese,
  middleEastern,
  thaiCuisine,
  korean,
  italian,
  french,
  indian,
  mexican,
  vietnamese,
  chinese,
  greek,
  russian,
  african,
  hsca,
};