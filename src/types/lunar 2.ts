import { ElementalProperties, StringIndexed } from './index';

export type LunarPhase = 
  | 'new' 
  | 'waxingCrescent'
  | 'firstQuarter'
  | 'waxingGibbous'
  | 'full'
  | 'waningGibbous'
  | 'lastQuarter'
  | 'waningCrescent';

export interface LunarPhaseModifier {
  elementalBoost: Partial<ElementalProperties> & StringIndexed<number>;
  preparationTips: string[];
  specialProperties?: string[];
  cookingMethods?: string[];
  pairings?: string[];
}

export interface LunarInfluence {
  phase: string;
  strength: number;
  elementalModifiers: Partial<ElementalProperties> & StringIndexed<number>;
  foodAssociations?: string[];
  cookingTechniques?: string[];
}

export type LunarPhaseMap = StringIndexed<LunarPhaseModifier>;
