import { quinoa } from './quinoa';
import { amaranth } from './amaranth';
import { buckwheat } from './buckwheat';
import { chia } from './chia';
import { flaxseed } from './flaxseed';
import type { IngredientMapping } from '@/types/alchemy';

// Export all pseudo grains as a consolidated object
export const pseudoGrains: Record<string, IngredientMapping> = {
  ...quinoa,
  ...amaranth,
  ...buckwheat,
  ...chia,
  ...flaxseed
};

// Export individual pseudo grains for direct access
export {
  quinoa,
  amaranth,
  buckwheat,
  chia,
  flaxseed
}; 