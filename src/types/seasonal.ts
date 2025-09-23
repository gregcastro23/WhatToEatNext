import { ElementalProperties } from './alchemy';

export type Season = 'spring' | 'summer' | 'fall' | 'winter'
export interface SeasonalPhase {
  _name: Season,
  _start: Date,
  _peak: Date,
  _end: Date,
  _primaryElement: keyof ElementalProperties,
  secondaryElement: keyof ElementalProperties
}