import type { ElementalProperties } from '@/types/alchemy';

export const _SEASONAL_PROPERTIES: { [key: string]: ElementalProperties } = {
  SPRING: {
    Air: 0.8,
    Water: 0.6,
    Earth: 0.4,
    Fire: 0.2
  },
  _SUMMER: {
    Fire: 0.8,
    Air: 0.6,
    Earth: 0.4,
    Water: 0.2
  },
  _AUTUMN: {
    Earth: 0.8,
    Air: 0.6,
    Water: 0.4,
    Fire: 0.2
  },
  _WINTER: {
    Water: 0.8,
    Earth: 0.6,
    Fire: 0.4,
    Air: 0.2
  }
},
