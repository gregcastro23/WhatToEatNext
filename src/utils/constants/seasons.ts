import type { ElementalProperties } from '@/types/alchemy';

export const SEASONAL_PROPERTIES: { [key: string]: ElementalProperties } = {
  SPRING: {
    air: 0.8,
    water: 0.6,
    earth: 0.4,
    fire: 0.2
  },
  SUMMER: {
    fire: 0.8,
    air: 0.6,
    earth: 0.4,
    water: 0.2
  },
  AUTUMN: {
    earth: 0.8,
    air: 0.6,
    water: 0.4,
    fire: 0.2
  },
  WINTER: {
    water: 0.8,
    earth: 0.6,
    fire: 0.4,
    air: 0.2
  }
}; 