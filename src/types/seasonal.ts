export type Season = 'spring' | 'summer' | 'fall' | 'winter';

export interface SeasonalPhase {
  name: Season;
  start: Date;
  peak: Date;
  end: Date;
  primaryElement: keyof elementalState;
  secondaryElement: keyof elementalState;
}
