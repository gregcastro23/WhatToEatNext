export type LunarPhase = 
  | 'new' 
  | 'waxingCrescent'
  | 'firstQuarter'
  | 'waxingGibbous'
  | 'full'
  | 'waningGibbous'
  | 'lastQuarter'
  | 'waningCrescent';

export interface LunarInfluence {
  phase: LunarPhase;
  element: keyof ElementalBalance;
  strength: number;
}
