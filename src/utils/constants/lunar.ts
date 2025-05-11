import @/types  from 'alchemy ';

export const LUNAR_PHASES: { [key: string]: ElementalProperties } = {
  NEW_MOON: {
    Water: 1.0,
    Air: 0.3,
    Earth: 0.5,
    Fire: 0.2
  },
  WAXING_CRESCENT: {
    Water: 0.8,
    Air: 0.5,
    Earth: 0.4,
    Fire: 0.3
  },
  FIRST_QUARTER: {
    Water: 0.6,
    Air: 0.6,
    Earth: 0.4,
    Fire: 0.4
  },
  WAXING_GIBBOUS: {
    Water: 0.4,
    Air: 0.7,
    Earth: 0.3,
    Fire: 0.6
  },
  FULL_MOON: {
    Water: 0.2,
    Air: 0.8,
    Earth: 0.3,
    Fire: 0.7
  },
  WANING_GIBBOUS: {
    Water: 0.4,
    Air: 0.6,
    Earth: 0.4,
    Fire: 0.6
  },
  LAST_QUARTER: {
    Water: 0.6,
    Air: 0.5,
    Earth: 0.5,
    Fire: 0.4
  },
  WANING_CRESCENT: {
    Water: 0.8,
    Air: 0.4,
    Earth: 0.6,
    Fire: 0.2
  }
}; 