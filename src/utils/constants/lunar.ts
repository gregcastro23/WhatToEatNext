import type { ElementalProperties } from '@/types/alchemy';

export const LUNAR_PHASES: { [key: string]: ElementalProperties } = {
  NEW_MOON: {
    water: 1.0,
    air: 0.3,
    earth: 0.5,
    fire: 0.2
  },
  WAXING_CRESCENT: {
    water: 0.8,
    air: 0.5,
    earth: 0.4,
    fire: 0.3
  },
  FIRST_QUARTER: {
    water: 0.6,
    air: 0.6,
    earth: 0.4,
    fire: 0.4
  },
  WAXING_GIBBOUS: {
    water: 0.4,
    air: 0.7,
    earth: 0.3,
    fire: 0.6
  },
  FULL_MOON: {
    water: 0.2,
    air: 0.8,
    earth: 0.3,
    fire: 0.7
  },
  WANING_GIBBOUS: {
    water: 0.4,
    air: 0.6,
    earth: 0.4,
    fire: 0.6
  },
  LAST_QUARTER: {
    water: 0.6,
    air: 0.5,
    earth: 0.5,
    fire: 0.4
  },
  WANING_CRESCENT: {
    water: 0.8,
    air: 0.4,
    earth: 0.6,
    fire: 0.2
  }
}; 